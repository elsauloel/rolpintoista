/* =========================================================
   CREEP-ACCIONES — los botones de las Acciones de un creep, fuera de GM Tools (paso 4, etapa 4c de docs/plan-paso4-etapa4.md,
   2026-10-01)
   Lo que antes hacía gm-toolset/js/06 (los clics de data-tirarstatcreep, -levantarcreep, -esquivarcreep, -parrycreep,
   -bloqueocreep, -fuerzacreep, -daniocreep) y js/01 (tirarValorStat), copiado tal cual y partido en dos: lo que CAMBIA al
   creep (pagar el Parry, levantarse: devuelven {error} o {aviso}) y las TIRADAS (devuelven {origen, r} para publicar, o
   {error}). Así GM Tools lo hace con su creep en memoria y el mapa adentro de una transacción (modificarCreep), y cada uno
   publica a su manera. El Parry que espera su Bloqueo lo lleva cada pantalla.
   Necesita comun/combatiente.js, creep-calculo.js y tiradas.js.
   ========================================================= */
const CreepAcciones = (() => {
  const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
  const fmt = n => Number.isInteger(n) ? n : Math.round(n*100)/100;
  const C = () => CreepCalculo;

  /* ---------- Tiradas ---------- */
  // La tirada de un stat del creep es la misma que la de un personaje o una invocación (comun/combatiente.js): Afortunado
  // (dos veces, queda la mejor), mitades y Evasión mínimo 1.
  function tirada(nombre, valor, sc, statId){
    const r = Combatiente.tirarStat(valor, sc ? sc.estados : [], statId);
    if(!r) return {error: `${nombre}: ${fmt(num(valor))} no se puede tirar con dados reales`};
    return {origen: nombre, r};
  }
  // Una de las Tiradas de stats de las Acciones (null si el stat no existe).
  function tiradaStat(sc, statId){
    const d = C().STAT_LOOKUP[statId];
    if(!sc || !d) return null;
    return tirada(`${sc.nombre} · ${d.label}`, C().statValor(sc, statId), sc, statId);
  }
  const esquivar = sc => tirada(`${sc.nombre} · Esquivar`, C().statValor(sc, 'eva'), sc, 'eva');
  const parry = sc => tirada(`${sc.nombre} · Parry`, C().statValor(sc, 'parry'), sc, 'parry');
  const fuerzaGolpe = sc => tirada(`${sc.nombre} · Fuerza del golpe`, C().fuerzaGolpeValor(sc));
  // El Bloqueo solo después de un Parry (regla del dueño, 2026-09-30), con el arma o el escudo con que para.
  function bloqueo(sc, parryPendiente){
    const def = C().defensa(sc);
    if(!def) return {error: `${sc.nombre}: ${Combatiente.SIN_ARMA_DEFENSA}`};
    if(!parryPendiente) return {error: `${sc.nombre}: ${Combatiente.BLOQUEO_SOLO_TRAS_PARRY}`};
    return tirada(`${sc.nombre} · Bloqueo · ${def.nombre}`, C().bloqueoValor(sc), sc, 'bloqueo');
  }
  // El daño de su arma (los efectos al golpear los publica cada pantalla después, con comun/efectos-golpe.js).
  function dano(sc){
    const r = tirarDados(C().danoTxt(sc, C().statValor(sc, 'dmg')));
    return r ? {origen: `${sc.nombre} · Daño`, r} : null;
  }

  /* ---------- Lo que cambia al creep ---------- */
  // Levantarse (Sentado): cuesta 1 No2 y saca el estado.
  function levantarse(sc){
    if(num(sc.nitros) < 1) return {error: `${sc.nombre}: no le alcanzan los No2 — levantarse cuesta 1`};
    sc.nitros = num(sc.nitros) - 1;
    sc.estados = (sc.estados || []).filter(e => !(e.activo !== false && e.sentado));
    return {aviso: `${sc.nombre} se levantó · −1 No2 · quedan ${fmt(sc.nitros)}`};
  }
  // Pagar el Parry (siempre 1 No2, solo con un arma de verdad o un escudo). Después: la tirada (parry) y anotar el Parry pendiente.
  function pagarParry(sc){
    if(!C().defensa(sc)) return {error: `${sc.nombre}: ${Combatiente.SIN_ARMA_DEFENSA}`};
    const costo = C().costoParry(sc);
    if(costo > num(sc.nitros)) return {error: `${sc.nombre}: no le alcanzan los No2 — el Parry cuesta ${fmt(costo)} No2 y tiene ${fmt(num(sc.nitros))}`};
    sc.nitros = num(sc.nitros) - costo;
    return {aviso: `${sc.nombre}: Parry −${fmt(costo)} No2 · quedan ${fmt(sc.nitros)} · si lo gana, tirá el Bloqueo`};
  }

  /* ---------- Atacar (menú de Atacar del creep, 2026-09-26) ----------
     'normal': el primero del turno cuesta Tipo ÷ 2 y los siguientes el Tipo completo, y suma al conteo de ataques;
     'oportunidad' y 'contra' (contraataque): siempre Tipo ÷ 2 y no suman al conteo. Cobrar (pagarAtaque → {error} o {aviso}) y
     después la tirada de PdG (tiradaAtaque). Un ataque normal cierra el Parry que esperaba su Bloqueo: lo borra cada pantalla.
     Sin No2 suficientes (2026-10-02, como con los personajes: avisar y dejar seguir): costoAtaqueDe dice cuánto cuesta; con
     `forzar`, pagarAtaque gasta los que tenga (hasta 0) y devuelve `forzado: {costo, tenia}`, y alertaSinNitros deja la línea roja
     en la Mesa. Cada pantalla pregunta antes («¿Atacar igual?», preguntaSinNitros). */
  const NOMBRE_ESPECIAL = {oportunidad: 'Ataque de oportunidad', contra: 'Contraataque'};
  // PdG en contraataque (o en oportunidad) que le suma su arma.
  const bonoEspecial = (sc, tipo) => (sc.armaMods || []).filter(m => m.stat === (tipo === 'contra' ? 'pdgcontra' : tipo === 'oportunidad' ? 'pdgopor' : '')).reduce((a, m) => a + num(m.val), 0);
  const costoAtaqueDe = (sc, tipo) => tipo === 'normal' ? C().costoAtaque(sc) : C().costoContraataque(sc);
  const faltanNitros = (sc, tipo) => costoAtaqueDe(sc, tipo) > num(sc.nitros);
  // El texto de «¿Atacar igual?» (cada pantalla lo muestra a su manera).
  function preguntaSinNitros(sc, tipo){
    const nombre = tipo === 'normal' ? 'este ataque' : `el ${(NOMBRE_ESPECIAL[tipo] || 'Contraataque').toLowerCase()}`;
    return `${sc.nombre} no tiene No2 suficientes: ${nombre} cuesta ${fmt(costoAtaqueDe(sc, tipo))} y tiene ${fmt(Math.max(0, num(sc.nitros)))}.\n\n¿Atacar igual? Gasta los No2 que tenga y queda anotado en rojo en la Mesa.`;
  }
  function pagarAtaque(sc, tipo, forzar){
    const costo = costoAtaqueDe(sc, tipo), tenia = Math.max(0, num(sc.nitros));
    const forzado = costo > tenia ? {costo, tenia} : null;
    if(tipo === 'normal'){
      if(forzado && !forzar) return {error: `${sc.nombre}: no le alcanzan los No2 — este ataque cuesta ${fmt(costo)} y tiene ${fmt(num(sc.nitros))}`};
      const primero = num(sc.ataquesTurno) === 0;
      sc.nitros = forzado ? 0 : num(sc.nitros) - costo;
      sc.ataquesTurno = num(sc.ataquesTurno) + 1;
      return {forzado, aviso: `${sc.nombre}: −${fmt(forzado ? tenia : costo)} No2${forzado ? ` (costaba ${fmt(costo)})` : ''} · ${primero ? 'primer ataque del turno' : `ataque ${fmt(sc.ataquesTurno)} del turno`} · quedan ${fmt(sc.nitros)}`};
    }
    const nombre = NOMBRE_ESPECIAL[tipo] || 'Contraataque';
    if(forzado && !forzar) return {error: `${sc.nombre}: no le alcanzan los No2 — el ${nombre.toLowerCase()} cuesta ${fmt(costo)} y tiene ${fmt(num(sc.nitros))}`};
    sc.nitros = forzado ? 0 : num(sc.nitros) - costo;
    const bono = bonoEspecial(sc, tipo);
    return {forzado, aviso: `${sc.nombre}: ${nombre.toLowerCase()} −${fmt(forzado ? tenia : costo)} No2 ${forzado ? `(costaba ${fmt(costo)})` : '(lo de un primer ataque)'}${bono ? ` · PdG +${fmt(bono)} por ${tipo === 'contra' ? 'contraataque' : 'oportunidad'}` : ''} · quedan ${fmt(sc.nitros)}`};
  }
  // La línea roja de la Mesa (la misma que la de un personaje: FichaAcciones.gastoNitrosForzado).
  function alertaSinNitros(sc, tipo, forzado){
    if(!forzado || typeof fbDb === 'undefined' || !fbDb || typeof fbUsuario === 'undefined' || !fbUsuario || !fbMiembro) return;
    const hizo = tipo === 'normal' ? 'atacó' : `hizo un ${(NOMBRE_ESPECIAL[tipo] || 'Contraataque').toLowerCase()}`;
    fbDb.collection(fbRutaCampana('tiradas')).add({
      uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: '',
      origen: `⚠ ${sc.nombre} ${hizo} sin No2 suficientes`, formula: `Costaba ${fmt(forzado.costo)} No2 y tenía ${fmt(forzado.tenia)}`,
      rolls: [], mod: 0, total: 0, desde: 'alerta-roja',
      cuando: firebase.firestore.FieldValue.serverTimestamp(),
    }).catch(err => console.error('No se pudo publicar la alerta de No2:', err));
  }
  function tiradaAtaque(sc, tipo){
    if(tipo === 'normal') return tirada(`${sc.nombre} · PdG`, C().statValor(sc, 'pdg'), sc, 'pdg');
    const nombre = NOMBRE_ESPECIAL[tipo] || 'Contraataque';
    return tirada(`${sc.nombre} · ${nombre} (PdG)`, C().statValor(sc, 'pdg') + bonoEspecial(sc, tipo), sc, 'pdg');
  }

  /* ---------- Habilidades (paso 4c, tanda 5; antes el clic de data-ejecutar en js/06, y js/03, js/04 y js/10) ----------
     Ejecutar se parte en dos: ejecutarHab (lo que CAMBIA al creep: cobrar No2, cooldown y vida, la cura y el estado del sistema
     anterior, y el atajo ✨ «solo sobre sí, sin tiradas») y terminarHab (lo que pasa DESPUÉS: la Mesa, el duelo, la trampa, la
     zona, a quién le pegó, el aviso), que cada pantalla hace a su manera con su `ui`. Las 📣 manuales y los ⚡ Flash no pasan por
     acá (los resuelve cada pantalla antes). */
  const uid = () => Math.random().toString(36).slice(2,9);
  const ATTR_LABELS = {con:'Con', fue:'Fue', agl:'Agi', des:'Des', esp:'Esp'};
  const FLAGS_ESTADO = ['armaduraRota','lisiado','paralisis','esEscarcha','mitadPdgEva','inmovilizado','rengo','cansado','exhausto','hypeado','sentado','excedenteVida','invulnerable','inmunidadCC','sangrePura','coagulacionExtrema','afortunado','blindado','espinas','esCC','esVeneno','esSangrado'];
  const habEtq = stat => (C().STAT_LOOKUP[stat] && C().STAT_LOOKUP[stat].label) || ATTR_LABELS[stat] || stat;
  // La Ejecución de un creep: la misma regla que personajes e invocaciones (comun/combatiente.js, habEjecucion). Sin costo variable.
  function habEjecucion(sc, h){
    return Combatiente.habEjecucion(h, h && h.duelo, {stat: s => C().statValor(sc, s), etq: habEtq, armaDano: C().ataqueTxt(sc)});
  }
  // «Ataque con mi arma, con arreglos» de un creep (Golpe brutal, Carga…; P134): el mismo armado que el personaje, con su arma.
  function ataqueDeHab(sc, h){
    const c = h && h.duelo;
    return Combatiente.ataqueConArreglos(h, c, {arma: {id: '', nombre: sc.armaNombre || '', tipoDado: num(sc.armaTipo) || 8, rango: !!sc.armaDeRango},
      alcance: c && c.alcance !== undefined && c.alcance !== 'auto' ? Combatiente.alcanceHab(c, 'pdg', s => C().statValor(sc, s)) : C().alcance(sc)});
  }
  // ¿Tira algo? El stat vinculado (con su valor del momento) y/o la fórmula.
  function habTira(h){
    return !!(h && (String(h.tiradaExtra || "").trim() || (h.tiradaStat && C().STAT_LOOKUP[h.tiradaStat])));
  }
  // El estado «del sistema anterior» que la habilidad le pone al propio creep (h.efectoNombre…). Devuelve {estado} (null si no
  // tiene) y, si no le hizo efecto, {aviso}.
  function efectoDeHab(sc, h, presets){
    const nombre = (h.efectoNombre || '').trim();
    if(!nombre) return {estado: null};
    // La habilidad no sabe de categorías/inmunidades — se infiere buscando un preset con el mismo nombre, igual que en ficha.html.
    const preset = (presets || []).find(p => p.nombre === nombre || (p.alias || []).includes(nombre));
    const turnos = num(h.efectoTurnos);
    const stacks = Math.max(1, num(h.efectoStacks) || 1);
    const hpTurno = num(h.efectoHpTurno);
    const polaridad = h.efectoPolaridad || (preset ? preset.polaridad : 'otro');
    const detalle = h.efectoDetalle || '';
    const mods = structuredClone(h.efectoMods || []);
    // Con un preset conocido (Invulnerable, Espinas, Escudo especial, Sigilo…) el estado lleva todas sus marcas, no solo las categorías.
    const categorias = preset ? {esCC:preset.esCC, esVeneno:preset.esVeneno, esSangrado:preset.esSangrado,
      stacksTurno: preset.stacksTurno ?? 0, permanente: !!preset.permanente, escudoMagico: preset.escudoMagico ?? 0, forzarNitros: preset.forzarNitros ?? ''} : {};
    if(preset) FLAGS_ESTADO.forEach(f => { categorias[f] = !!preset[f]; });
    // P137 (2026-10-01): "no vence" lo decide la habilidad si lo marca (como en personajes e invocaciones); si no, el estado.
    const nuevo = {id: uid(), nombre, hpTurno, stacks, turnos, polaridad, detalle, mods, ...categorias, permanente: Combatiente.efectoPermanente(h, preset)};
    if(num(h.efectoEscudo) > 0){   // la habilidad da HP de escudo o de Excedente de vida (Absorber vida, Coraza de huesos…)
      // P137: el Excedente de vida nuevo reemplaza al que tenía (antes se sumaba), igual que en personajes e invocaciones.
      nuevo.escudoMagico = num(h.efectoEscudo); nuevo.escudoMagicoActual = num(h.efectoEscudo);
    }
    // Ponerlo: la regla común (comun/combatiente.js, agregarEstado) — inmunidades (con la de jefe), Veneno que se acumula y,
    // si ya tiene uno igual, se renueva (P132).
    const r = Combatiente.agregarEstado(sc.estados, nuevo, sc);
    if(!r.ok) return {estado: null, aviso: `${sc.nombre}: inmune ahora mismo (${r.motivo}) — ${nombre} no hizo efecto`};
    return {estado: r.estado};
  }
  // ✨ Automática, solo sobre el propio creep y sin tiradas: aplica los efectos del cuadro de Ejecución directo. Devuelve null si
  // no es ese caso; si no, {hechos} (para el aviso del GM) y {nota} (los textos «a mano», para la Mesa).
  function sobreSi(sc, h){
    const hab = habEjecucion(sc, h);
    if(!Combatiente.sobreSiSinTiradas(hab)) return null;
    const hechos = hab.efectos.map(ef => {
      if(!ef.spec){ sc.hp = Math.min(num(sc.hpMax) > 0 ? num(sc.hpMax) : Infinity, num(sc.hp) + num(ef.cura)); return `+${fmt(num(ef.cura))} HP`; }
      const r = EstadosAplicar.aplicarACreep(sc, ef.spec);
      if(!r.ok) return `${ef.nombre}: no le hizo efecto (${r.motivo})`;
      if(C().modsAfectanHp(r.estado.mods)) C().actualizarHpMaxPorCon(sc);
      return r.que === 'renovado' ? `${r.estado.nombre} renovado` : EstadosAplicar.texto(ef.spec);
    });
    return {hechos, nota: [hab.efectoLibre || '', hab.efectosNota || ''].filter(Boolean).join(' ')};
  }
  // Lo que cambia al ejecutar una 💰 o ✨ (no manual ni Flash): {error} o el plan para terminarHab.
  function ejecutarHab(sc, h, presets){
    const modo = C().modoHab(h);
    const bloqueo = C().bloqueoHab(sc, h);
    if(bloqueo) return {error: `${sc.nombre}: ${h.nombre || 'Habilidad'} no se puede usar — ${bloqueo}`};
    // Se cobra lo que la habilidad tenga cargado (P133): No2, cooldown y vida; y la cura del sistema anterior, si la trae.
    const costo = C().costoNitrosHab(sc, h), costoHp = num(h.hpCosto);
    sc.nitros = num(sc.nitros) - costo;
    h.cdActual = num(h.cd);
    if(C().habAtaque(h)) sc.ataquesTurno = num(sc.ataquesTurno) + 1;  // cuenta como su ataque
    if(costoHp > 0) sc.hp = num(sc.hp) - costoHp;
    if(num(h.curaHp) > 0) sc.hp = Math.min(num(sc.hpMax) > 0 ? num(sc.hpMax) : Infinity, num(sc.hp) + num(h.curaHp));   // cura sobre sí mismo
    const ef = efectoDeHab(sc, h, presets);
    const efecto = ef.estado;
    if(efecto && C().modsAfectanHp(efecto.mods)) C().actualizarHpMaxPorCon(sc);
    // Lo que todavía no anda para creeps o una ✨ sin la Ejecución armada: avisa y va como 💰.
    const falta = modo === 'auto' && !h.trampaColocar ? Combatiente.ejecucionNoDisponible(h.duelo, 'creep') : '';
    const auto = modo === 'auto' && !falta;
    const esZona = auto && h.duelo && typeof h.duelo === 'object' && h.duelo.objetivo === 'zona';
    // ✨ Solo sobre el creep y sin nada que tirar: se aplica directo, sin abrir el cuadro.
    const directo = auto && !h.trampaColocar ? sobreSi(sc, h) : null;
    return {costo, costoHp, efecto, aviso: ef.aviso || '', falta, auto, esZona, directo, nitros: sc.nitros};
  }
  /* Lo que pasa después de cobrar. ui = {mesaHabilidad(sc, h, extra), mesaConTexto(texto), publicar(sc, t), toast(t),
       habDuelo(sc, h) (la Ejecución para el duelo, o null si no hay duelo), lanzarAtaque(sc, h), lanzarDuelo(sc, h, hab),
       colocarTrampa(sc, h, auto), colocarZona(sc, h) → bool, elegirObjetivo(sc, h) (el estado sobre el objetivo)} */
  function terminarHab(sc, h, p, ui){
    const {costo, costoHp, efecto, falta, auto, esZona, directo} = p;
    if(directo){ ui.mesaHabilidad(sc, h, directo.nota); ui.toast(`${h.nombre || 'Habilidad'} ejecutada sobre ${sc.nombre}${directo.hechos.length ? ' → ' + directo.hechos.join(' · ') : ''}${costoHp > 0 ? ` · −${fmt(costoHp)} HP` : ''}`); return; }
    // Una trampa se coloca en secreto: la habilidad no se anuncia en la Mesa (los jugadores no deben enterarse).
    const hDuelo = (!auto || h.trampaColocar || esZona) ? null : ui.habDuelo(sc, h);   // habilidad dirigida: la contienda va en el cuadro del duelo
    const esArma = auto && !h.trampaColocar && Combatiente.tipoEjecucion(h.duelo) === 'arma';   // ataque con arreglos: al duelo como un ataque
    if(esArma) ui.lanzarAtaque(sc, h);
    else if(h.trampaColocar) ui.colocarTrampa(sc, h, auto);
    else if(esZona){ ui.mesaHabilidad(sc, h); if(!ui.colocarZona(sc, h)) ui.toast(`${h.nombre}: para colocar la zona hace falta ejecutarla desde el mapa (⚔ Acciones)`); }
    // Con tirada, la descripción viaja con ella (una sola línea en la Mesa).
    else if(habTira(h) && !hDuelo) ui.mesaConTexto(C().habTextoMesa(h));
    else ui.mesaHabilidad(sc, h);
    if(esArma){ /* ya fue al duelo */ }
    else if(hDuelo) ui.lanzarDuelo(sc, h, hDuelo);
    else if(habTira(h) && !h.trampaColocar && !esZona) ui.publicar(sc, tiradaPrimeraHab(sc, h));
    if(h.estadoObjetivo) ui.elegirObjetivo(sc, h);   // a quién le pegó: se le aplica el estado solo
    const partes = [`ejecutada`, costo ? `−${fmt(costo)} No2 (quedan ${fmt(p.nitros)})` : 'sin costo de No2'];
    if(costoHp > 0) partes.push(`−${fmt(costoHp)} HP`);
    if(num(h.curaHp) > 0) partes.push(`+${fmt(num(h.curaHp))} HP`);
    if(falta) partes.push(`⚠ ${falta}: se ejecutó como semiautomática`);
    if(h.cd > 0) partes.push(`cooldown ${fmt(num(h.cd))} turno(s)`);
    if(efecto) partes.push(`${efecto.nombre} (${fmt(efecto.turnos)}t)`);
    ui.toast(`${h.nombre||'Habilidad'} ${partes.join(' · ')}`);
  }
  // La primera tirada (Ejecutar): el stat vinculado o, si no tiene, la fórmula. null si no tira nada.
  function tiradaPrimeraHab(sc, h){
    const prefijo = `${sc ? sc.nombre + " · " : ""}${h.nombre || "Habilidad"}`;
    if(sc && h.tiradaStat && C().STAT_LOOKUP[h.tiradaStat]) return tirada(`${prefijo} · ${C().STAT_LOOKUP[h.tiradaStat].label}`, C().statValor(sc, h.tiradaStat), sc, h.tiradaStat);
    if(String(h.tiradaExtra || "").trim()){
      const r = tirarDados(h.tiradaExtra);
      if(r) return {origen: prefijo, r};
    }
    return null;
  }
  // La segunda tirada (🎲 <fórmula>, el daño o el efecto).
  function tiradaSegundaHab(sc, h){
    const r = tirarDados(String(h.tiradaExtra || "").trim());
    return r ? {origen: `${sc ? sc.nombre + " · " : ""}${h.nombre || "Habilidad"} · Efecto`, r} : {error: 'La fórmula de la habilidad no es válida'};
  }
  // Zona persistente: si hay tirada («tira» del ✨), se tira UNA vez (con los stats del creep) y viaja el total. {tirada, zona} o null.
  function zonaDeHab(sc, h){
    const c = h && h.duelo;
    if(!c || typeof c !== 'object' || c.objetivo !== 'zona') return null;
    // La tirada es de la zona, no de la habilidad (2026-10-02, P143): se manda el valor del stat y el mapa lo tira en cada exposición.
    const stat = c.tira || '';
    const v = stat ? CreepDuelo.habStat(sc, stat) : NaN;
    // El mensaje lo arma la regla común (comun/combatiente.js, zonaDeHab), el mismo que manda un personaje.
    return {tirada: null, zona: Combatiente.zonaDeHab(h, c, {fichaId: sc.id, tipo: 'creep', tiraValor: Number.isFinite(v) ? v : undefined})};
  }
  // Cooldown a mano (− / + / ↺).
  function cdMod(sc, habId, accion){
    const h = (sc.habilidades || []).find(x => x.id === habId);
    if(!h) return {error: 'No encontré esa habilidad'};
    h.cdActual = accion === 'reset' ? 0 : Math.max(0, Math.min(99, num(h.cdActual) + num(accion)));
    return {aviso: ''};
  }

  /* ---------- ⟳ Mantenimiento (2026-10-02, hoja de ruta A2b: lo hace también el mapa, sin cargar GM Tools) ----------
     mantenimiento(sc): el pase de turno de UN creep — copia textual de lo que hacía mantenimiento() de GM Tools (js/07) por cada
     creep: ataques del turno a 0, cooldowns −1, los estados (Combatiente.pasarTurnoEstados), la vida con tope, el HP máximo si
     venció algo que lo tocaba, y No2 a full DESPUÉS de los estados (un Stun que venció ya no los topea). → {rep (para el 📜
     Historial del GM; no va a la Mesa: el HP de un creep es secreto), enCooldown, hpAplicado, vencidos}.
     reclamarMantenimiento(db, ref, objetivo, marca): la transacción sobre gm/mantenimiento = {aplicado}: cuántos turnos aplicarles a
     los creeps (0 si ya los aplicó otra pantalla; si nunca se registró, arranca desde el actual), máximo 10. */
  const MANT_MAX_SEGUIDOS = 10;
  function mantenimiento(sc){
    sc.ataquesTurno = 0;
    const rep = [];
    let enCooldown = 0;
    (sc.habilidades || []).forEach(h => {
      if(num(h.cdActual) > 0){
        h.cdActual = Math.max(0, num(h.cdActual) - 1);
        enCooldown++;
      }
    });
    // Lo que hacen los estados en el pase de turno: la regla común de personajes, invocaciones y creeps (comun/combatiente.js).
    const turnoEst = Combatiente.pasarTurnoEstados(sc.estados, {hp: 'hpTurno', stacks: 'stacksTurno'});
    if(turnoEst.hp){ sc.hp = Math.max(0, Math.min(num(sc.hpMax), num(sc.hp) + turnoEst.hp)); }
    const hpAplicado = turnoEst.eventos.filter(ev => ev.tipo === 'hp').length;
    rep.push(...Combatiente.reporteTurno(turnoEst.eventos));
    sc.estados = turnoEst.quedan;
    if(turnoEst.terminados.some(es => C().modsAfectanHp(es.mods))) C().actualizarHpMaxPorCon(sc);
    const vencidos = turnoEst.terminados.length;
    // Se recargan después de los estados: un Stun que venció ya no los topea.
    sc.nitros = C().nitrosMax(sc);
    return {rep, enCooldown, hpAplicado, vencidos};
  }
  async function reclamarMantenimiento(db, ref, objetivo, marca){
    return db.runTransaction(async tx => {
      const doc = await tx.get(ref);
      const hecho = doc.exists ? Math.round(num(doc.data().aplicado)) : null;
      if(hecho !== null && hecho >= objetivo) return 0;
      tx.set(ref, {aplicado: objetivo, actualizado: marca()});
      return hecho === null ? 0 : Math.min(MANT_MAX_SEGUIDOS, objetivo - hecho);
    });
  }

  return {mantenimiento, reclamarMantenimiento,
    tirada, tiradaStat, esquivar, parry, fuerzaGolpe, bloqueo, dano, levantarse, pagarParry, pagarAtaque, tiradaAtaque, NOMBRE_ESPECIAL,
    costoAtaqueDe, faltanNitros, preguntaSinNitros, alertaSinNitros,
    FLAGS_ESTADO, habEtq, habEjecucion, ataqueDeHab, habTira, efectoDeHab, sobreSi, ejecutarHab, terminarHab, tiradaPrimeraHab, tiradaSegundaHab,
    zonaDeHab, cdMod};
})();
