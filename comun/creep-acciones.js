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
  // Bloqueo firme (escudos de Buena calidad, 2026-10-06): +N contra el primer golpe que recibe en el turno (la marca `_golpe` la pone el daño).
  const bloqueoFirmeCreep = sc => Combatiente.bloqueoFirme(st => C().modTotal(sc, st), num((sc.usosEspecial || {})._golpe));
  function bloqueo(sc, parryPendiente){
    const def = C().defensa(sc);
    if(!def) return {error: `${sc.nombre}: ${Combatiente.SIN_ARMA_DEFENSA}`};
    if(!parryPendiente) return {error: `${sc.nombre}: ${Combatiente.BLOQUEO_SOLO_TRAS_PARRY}`};
    const firme = bloqueoFirmeCreep(sc);
    return tirada(`${sc.nombre} · Bloqueo · ${def.nombre}${firme ? ` (+${fmt(firme)} Bloqueo firme)` : ''}`, C().bloqueoValor(sc) + firme, sc, 'bloqueo');
  }
  // El daño de su arma (los efectos al golpear los publica cada pantalla después, con comun/efectos-golpe.js).
  function dano(sc){
    const r = tirarDados(C().danoTxt(sc, C().statValor(sc, 'dmg')));
    return r ? {origen: `${sc.nombre} · Daño`, r} : null;
  }

  /* ---------- Lo que cambia al creep ---------- */
  // Levantarse (Sentado): cuesta 1 No2 y saca el estado.
  function levantarse(sc){
    const costo = Combatiente.costoLevantarse(st => C().modTotal(sc, st));   // Levantarse rápido (2026-10-06)
    if(num(sc.nitros) < costo) return {error: `${sc.nombre}: no le alcanzan los No2 — levantarse cuesta ${costo}`};
    sc.nitros = num(sc.nitros) - costo;
    sc.estados = (sc.estados || []).filter(e => !(e.activo !== false && e.sentado));
    return {aviso: `${sc.nombre} se levantó${costo ? ` · −${fmt(costo)} No2 · quedan ${fmt(sc.nitros)}` : ' (gratis)'}`};
  }
  // Soltarse (2026-10-03): primero la tirada (afuera de cualquier transacción: se tira una sola vez) y después aplicarla (cobra y, si salió,
  // saca el estado). tiradaSoltarse → {s, r, ok, estId, origen} o null; aplicarSoltarse → {error} o {aviso}.
  function tiradaSoltarse(sc){
    const est = Combatiente.estadoSoltable(sc.estados);
    if(!est) return null;
    const s = Combatiente.soltarNorm(est.soltar);
    const t = Combatiente.tiradaSoltarse(est, C().statValor(sc, s.stat) + Math.max(0, num(C().modTotal(sc, 'soltarse'))), sc.estados);
    return {...t, estId: est.id, origen: `${sc.nombre} · Soltarse (${est.nombre}) · ${s.etq} contra ${s.dif}`};
  }
  function aplicarSoltarse(sc, t){
    if(num(sc.nitros) < t.s.no2) return {error: `${sc.nombre}: no le alcanzan los No2 — soltarse cuesta ${t.s.no2}`};
    sc.nitros = num(sc.nitros) - t.s.no2;
    if(t.ok) sc.estados = (sc.estados || []).filter(e => e.id !== t.estId);
    const hundio = Combatiente.hundirSiFalla((sc.estados || []).find(e => e.id === t.estId), t);
    return {aviso: `${sc.nombre} ${t.ok ? 'se soltó' : 'no se soltó'} (${t.r ? t.r.total : '—'} contra ${t.s.dif}) · −${fmt(t.s.no2)} No2 · quedan ${fmt(sc.nitros)}${hundio ? ` · se hundió más: +${t.s.hunde} turno${t.s.hunde === 1 ? '' : 's'}` : ''}`};
  }
  // Pagar el Parry (siempre 1 No2, solo con un arma de verdad o un escudo). Después: la tirada (parry) y anotar el Parry pendiente.
  function pagarParry(sc){
    if(!C().defensa(sc)) return {error: `${sc.nombre}: ${Combatiente.SIN_ARMA_DEFENSA}`};
    const gratis = Combatiente.parryGratis(st => C().modTotal(sc, st), num((sc.usosEspecial || {})._parry));   // Parada fácil (2026-10-06)
    const costo = gratis ? 0 : C().costoParry(sc);
    sc.usosEspecial = {...(sc.usosEspecial || {}), _parry: 1};   // (se vacía al empezar su turno)
    sc.nitros = num(sc.nitros) - costo;   // sin No2 queda en negativo: se descuenta en su próxima recarga (2026-10-06)
    const deuda = sc.nitros < 0 ? {nombre: sc.nombre, accion: 'Parry', costo, quedan: sc.nitros} : null;
    return {aviso: `${sc.nombre}: Parry ${gratis ? 'gratis (Parada fácil)' : `−${fmt(costo)} No2`} · quedan ${fmt(sc.nitros)} · si lo gana, tirá el Bloqueo`, deuda};
  }

  /* ---------- Atacar (menú de Atacar del creep, 2026-09-26) ----------
     'normal': el primero del turno cuesta Tipo ÷ 2 y los siguientes el Tipo completo, y suma al conteo de ataques;
     'oportunidad' y 'contra' (contraataque): siempre Tipo ÷ 2 y no suman al conteo. Cobrar (pagarAtaque → {error} o {aviso}) y
     después la tirada de PdG (tiradaAtaque). Un ataque normal cierra el Parry que esperaba su Bloqueo: lo borra cada pantalla.
     Sin No2 suficientes (2026-10-02, como con los personajes: avisar y dejar seguir): costoAtaqueDe dice cuánto cuesta; con
     `forzar`, pagarAtaque gasta los que tenga (hasta 0) y devuelve `forzado: {costo, tenia}`, y alertaSinNitros deja la línea roja
     en la Mesa. Cada pantalla pregunta antes («¿Atacar igual?», preguntaSinNitros). */
  const NOMBRE_ESPECIAL = {oportunidad: 'Ataque de oportunidad', contra: 'Contraataque'};
  // PdG en contraataque (o en oportunidad): la regla universal (Combatiente.statAtaqueEspecial), venga de su arma, su equipo o sus estados.
  const bonoEspecial = (sc, tipo) => { const st = Combatiente.statAtaqueEspecial(tipo); return st ? C().modTotal(sc, st) : 0; };
  const costoAtaqueDe = (sc, tipo) => tipo === 'normal' ? C().costoAtaque(sc) : tipo === 'oportunidad' ? C().costoOportunidad(sc) : C().costoContraataque(sc);
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
  const pdgExtraCreep = sc => Combatiente.pdgExtraArma(st => C().modTotal(sc, st), {tipoDado: num(sc.armaTipo), armaDeRango: !!sc.armaDeRango});
  function tiradaAtaque(sc, tipo){
    const extra = pdgExtraCreep(sc);   // guantes: PdG con esa familia de armas o a distancia (2026-10-05)
    if(tipo === 'normal') return tirada(`${sc.nombre} · PdG`, C().statValor(sc, 'pdg') + extra, sc, 'pdg');
    const nombre = NOMBRE_ESPECIAL[tipo] || 'Contraataque';
    return tirada(`${sc.nombre} · ${nombre} (PdG)`, C().statValor(sc, 'pdg') + bonoEspecial(sc, tipo) + extra, sc, 'pdg');
  }

  /* ---------- Habilidades (paso 4c, tanda 5; antes el clic de data-ejecutar en js/06, y js/03, js/04 y js/10) ----------
     Ejecutar se parte en dos: ejecutarHab (lo que CAMBIA al creep: cobrar No2, cooldown y vida, la cura y el estado del sistema
     anterior, y el atajo ✨ «solo sobre sí, sin tiradas») y terminarHab (lo que pasa DESPUÉS: la Mesa, el duelo, la trampa, la
     zona, a quién le pegó, el aviso), que cada pantalla hace a su manera con su `ui`. Las 📣 manuales y los ⚡ Flash no pasan por
     acá (los resuelve cada pantalla antes). */
  const uid = () => Math.random().toString(36).slice(2,9);
  const ATTR_LABELS = {con:'Con', fue:'Fue', agl:'Agi', des:'Des', esp:'Esp'};
  const FLAGS_ESTADO = ['armaduraRota','silencio','confusion','lisiado','paralisis','esEscarcha','mitadPdgEva','inmovilizado','rengo','lento','cansado','exhausto','hypeado','sentado','excedenteVida','invulnerable','inmunidadCC','sangrePura','coagulacionExtrema','afortunado','blindado','espinas','esCC','esVeneno','esSangrado','stun'];
  const habEtq = stat => (C().STAT_LOOKUP[stat] && C().STAT_LOOKUP[stat].label) || ATTR_LABELS[stat] || stat;
  // La Ejecución de un creep: la misma regla que personajes e invocaciones (comun/combatiente.js, habEjecucion). Sin costo variable.
  function habEjecucion(sc, h){
    return Combatiente.habEjecucion(h, h && h.duelo, {stat: s => C().statValor(sc, s), etq: habEtq, armaDano: C().ataqueTxt(sc)});
  }
  // «Ataque con mi arma, con arreglos» de un creep (Golpe brutal, Carga…; P134): el mismo armado que el personaje, con su arma.
  function ataqueDeHab(sc, h){
    const c = h && h.duelo;
    return Combatiente.ataqueConArreglos(h, c, {arma: {...Combatiente.armaDeCombatiente(sc), id: '', nombre: sc.armaNombre || '', rango: !!sc.armaDeRango},
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
    // Con un preset conocido (Invulnerable, Espinas, Vida extra, Sigilo…) el estado lleva todas sus marcas, no solo las categorías.
    const categorias = preset ? {esCC:preset.esCC, esVeneno:preset.esVeneno, esSangrado:preset.esSangrado, esQuemadura:preset.esQuemadura,
      stacksTurno: preset.stacksTurno ?? 0, permanente: !!preset.permanente, escudoMagico: preset.escudoMagico ?? 0, forzarNitros: preset.forzarNitros ?? ''} : {};
    if(preset) FLAGS_ESTADO.forEach(f => { categorias[f] = !!preset[f]; });
    // P137 (2026-10-01): "no vence" lo decide la habilidad si lo marca (como en personajes e invocaciones); si no, el estado.
    const nuevo = {id: uid(), nombre, hpTurno, stacks, turnos, polaridad, detalle, mods, ...categorias, permanente: Combatiente.efectoPermanente(h, preset)};
    if(num(h.efectoEscudo) > 0){   // la habilidad da HP de escudo o de Vida extra (Absorber vida, Coraza de huesos…)
      // P137: la Vida extra nuevo reemplaza al que tenía (antes se sumaba), igual que en personajes e invocaciones.
      nuevo.escudoMagico = num(h.efectoEscudo); nuevo.escudoMagicoActual = num(h.efectoEscudo);
    }
    // Ponerlo: la regla común (comun/combatiente.js, agregarEstado) — inmunidades (con la de jefe), Veneno que se acumula y,
    // si ya tiene uno igual, se renueva (P132).
    const r = Combatiente.agregarEstado(sc.estados, nuevo, sc);
    if(!r.ok) return {estado: null, aviso: `${sc.nombre}: inmune ahora mismo (${r.motivo}) — ${nombre} no hizo efecto`};
    // Lo que se dispara (regeneración, veneno…) pega apenas se lo pone (2026-10-06, P161).
    const dis = Combatiente.dispararAlAplicar(r, sc.estados, {hp: 'hpTurno', resFuego: C().resElemental(sc, 'fuego'), hpActual: sc.hp});
    if(dis.hp) sc.hp = Math.max(0, Math.min(num(sc.hpMax) || Infinity, num(sc.hp) + dis.hp));
    return {estado: r.estado, disparo: dis};
  }
  /* ---------- El cinturón (2026-10-04, dueño: 5 ranuras de consumibles para los creeps también) ----------
     La misma regla que un personaje: 1 ranura = 1 unidad; usar uno cuesta 1 No2 (lo del cinturón: FichaCalculo.IT2); cura, deja su estado
     (efectoDeHab, los mismos campos que una habilidad) y tira lo suyo. Sin No2 pregunta («¿Usarlo igual?») y, forzado, gasta los que tenga. */
  const costoConsumir = () => typeof FichaCalculo !== 'undefined' ? num(FichaCalculo.IT2.nitrosConsumirCinturon) || 1 : 1;
  // Carga `cantidad` unidades (1 si no se dice) de un consumible del catálogo en el cinturón, las que entren. → {error} o {aviso}.
  function alCinturon(sc, item, cantidad){
    if(!item || !item.consumible && item.tipoItem !== 'consumibles') return {error: 'Al cinturón solo van consumibles'};
    const quiere = Math.max(1, Math.round(num(cantidad) || 1)), entran = C().cuantasEntran(sc, item, quiere);
    if(!entran) return {error: `${sc.nombre}: el cinturón está lleno (${C().cinturonUsado(sc)}/${C().capCinturon(sc)})`};
    sc.cinturon = sc.cinturon || [];
    const pila = sc.cinturon.find(x => x.consumible && x.nombre === item.nombre);
    if(pila) pila.unidades = num(pila.unidades) + entran;
    else{
      const c = structuredClone(item);
      delete c.imagen; delete c._bib; delete c.equipado;
      c.id = uid(); c.consumible = true; c.unidades = entran; c.cargaActual = Math.max(1, num(item.cargaMax) || 1);
      sc.cinturon.push(c);
    }
    return {aviso: `${sc.nombre}: ${item.nombre} ×${entran} al cinturón (${C().cinturonUsado(sc)}/${C().capCinturon(sc)})${entran < quiere ? ' · no entraban más' : ''}`};
  }
  function quitarDelCinturon(sc, id){
    const it = (sc.cinturon || []).find(x => x.id === id);
    if(!it) return {error: 'Ese consumible ya no está'};
    sc.cinturon = sc.cinturon.filter(x => x !== it);
    return {aviso: `${sc.nombre}: ${it.nombre} salió del cinturón`};
  }
  // Una trampa consumible: se coloca junto al token del creep (como la de un personaje); si no se puede, no se gasta. → {ok, aviso}.
  async function colocarTrampaDeItem(creepId, it){
    const d = it && it.trampaDatos;
    if(!d || typeof TokensAuto === 'undefined') return {ok: false, aviso: 'Esta trampa se coloca desde el mapa'};
    try{
      const dano = /^\d{1,2}d\d{1,3}([+-]\d{1,3})?$/i.test(String(d.dano || '').trim()) ? String(d.dano).trim() : '';
      const r = await TokensAuto.colocarTrampas({fichaId: creepId, tipoToken: 'creep', trampa: {...d, nombre: String(d.nombre || it.nombre).slice(0, 40), dano, cant: 1}});
      if(r.colocadas) return {ok: true, aviso: `🪤 ${it.nombre} colocada junto al creep: arrastrala a donde la quieras`};
      return {ok: false, aviso: r.motivo === 'sin-token' ? `🪤 ${it.nombre}: el creep no tiene token en el mapa — no se usó` : `🪤 ${it.nombre}: no hay lugar libre al lado del creep — no se usó`};
    }catch(err){ console.error('No se pudo colocar la trampa:', err); return {ok: false, aviso: 'No se pudo colocar la trampa'}; }
  }
  // Los consumibles del catálogo para el desplegable del cinturón: [{id, nombre, tier}], por nombre. `cat`: la lista del catálogo.
  const consumiblesDe = cat => (cat || []).filter(it => it && it.tipoItem === 'consumibles' && !it.trofeo && !it.archivo)
    .map(it => ({id: it.id, nombre: it.nombre, tier: it.tier || ''})).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  function faltanNitrosConsumir(sc){ return num(sc.nitros) < costoConsumir(); }
  // Usar un consumible del cinturón: → {error} | {aviso, tiradas: [{origen, r}], trampa} (trampa: el ítem, para que la pantalla la coloque).
  function consumir(sc, id, presets, forzar){
    const it = (sc.cinturon || []).find(x => x.id === id);
    if(!it || num(it.unidades) <= 0) return {error: 'Ese consumible ya no está'};
    // Saque rápido (2026-10-05): el primero del turno puede no costar (la chance se tira a la vista: va en las tiradas).
    let costo = costoConsumir(), saque = null;
    const pctSaque = Combatiente.chancePct(C().modTotal(sc, 'saquerapido'));
    if(pctSaque > 0 && !sc.saqueUsado){   // sin dado que rueda: se tira callado y se anuncia en texto (dueño, 2026-10-05)
      const d = Combatiente.chanceDado(pctSaque);
      let sale = pctSaque >= 100, txt = '⚡ Saque rápido: no costó No2';
      if(d){ const r = tirarDados('1d' + d.caras); if(r){ sale = r.total >= d.caras - d.exitos + 1; txt = `⚡ Saque rápido (${Combatiente.chanceTexto(pctSaque)}): 1d${d.caras} = ${r.total} → ${sale ? 'salió, no costó No2' : 'no salió'}`; } }
      sc.saqueUsado = true;
      saque = {sale, txt};
      if(sale) costo = 0;
    }
    if(costo > num(sc.nitros) && !forzar) return {error: `${sc.nombre}: no le alcanzan los No2 — usar ${it.nombre} cuesta ${fmt(costo)}`};
    const pagado = Math.min(costo, Math.max(0, num(sc.nitros)));
    sc.nitros = num(sc.nitros) - pagado;
    const cargaMax = Math.max(1, num(it.cargaMax) || 1);
    let carga = num(it.cargaActual ?? cargaMax);
    if(carga <= 0) carga = cargaMax;
    carga -= 1;
    if(carga <= 0){ it.unidades = num(it.unidades) - 1; carga = cargaMax; }
    it.cargaActual = carga;
    if(num(it.unidades) <= 0) sc.cinturon = sc.cinturon.filter(x => x !== it);
    const partes = [];
    if(num(it.curahp)){
      const boticario = num(it.curahp) > 0 ? num(C().modTotal(sc, 'boticario')) : 0;   // Mano de boticario (2026-10-05)
      const tope = num(sc.hpMax) > 0 ? num(sc.hpMax) : Infinity, antes = num(sc.hp);
      sc.hp = Math.max(0, Math.min(tope, antes + num(it.curahp) + boticario));
      partes.push(`${num(it.curahp) >= 0 ? '+' : ''}${fmt(num(it.curahp) + boticario)} HP`);
    }
    const ef = efectoDeHab(sc, it, presets);
    if(ef.estado){ if(C().modsAfectanHp(ef.estado.mods)) C().actualizarHpMaxPorCon(sc); partes.push(`${ef.estado.nombre}${ef.estado.permanente ? '' : ` (${fmt(ef.estado.turnos)} turnos)`}`); }
    if(ef.aviso) partes.push(ef.aviso);
    const tiradas = [];
    const stat = it.tiradaStat;
    const ATRIB = {fue: 'Fuerza', con: 'Constitución', agl: 'Agilidad', des: 'Destreza', esp: 'Especial'};
    if(stat && (C().STAT_LOOKUP[stat] || ATRIB[stat])){ const valor = C().statValor(sc, stat) + num(it.tiradaBono); tiradas.push(tirada(`${sc.nombre} · ${it.nombre} · ${ATRIB[stat] || C().STAT_LOOKUP[stat].label || stat}`, valor, sc, stat)); }
    const formula = String(it.tiradaExtra || '').trim();
    if(formula){ const r = tirarDados(formula); if(r) tiradas.push({origen: `${sc.nombre} · ${it.nombre}`, r}); }
    partes.push(`−${fmt(pagado)} No2${pagado < costo ? ' (no le alcanzaban)' : saque && saque.sale ? ' (Saque rápido)' : ''}`);
    // El anuncio para la Mesa y la Crónica: sin la vida del creep (es privada), con el estado que le dejó y el Saque rápido.
    const publico = [ef.estado ? ef.estado.nombre : '', saque ? saque.txt : ''].filter(Boolean).join(' · ');
    const anuncio = {titulo: `${sc.nombre} usó ${it.nombre}`, resultado: publico, texto: `🧪 ${sc.nombre} usó ${it.nombre}${publico ? ': ' + publico : ''}`, item: it.nombre, saqueSalio: !!(saque && saque.sale)};
    return {aviso: `${sc.nombre} usó ${it.nombre}: ${partes.join(' · ')}`, anuncio, tiradas: tiradas.filter(t => t && !t.error), forzado: pagado < costo ? {costo, tenia: pagado} : null,
      trampa: it.trampaDatos ? structuredClone(it) : null};
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
    const sil = Combatiente.preguntaSilencio(sc.estados, h, sc.nombre);   // Silencio (2026-10-04): avisa y deja seguir
    if(sil && !(typeof confirm === 'function' && confirm(sil))) return {error: `${sc.nombre}: en Silencio, no usó ${h.nombre || 'la habilidad'}`};
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
  /* ---------- ✨ Armas especiales de un creep (2026-10-05: las reglas de combate son las mismas para todos) ----------
     La misma habilidad que arma la ficha con una varita equipada (su Ejecución ✨, su daño + Ef.Esp, su trampa), mandada por el camino de las
     habilidades del creep (ejecutarHab / terminarHab). Los No2 igual que un personaje: 1 el primer uso del turno + 1 por cada uso más. Los creeps no
     tienen SP: el SP de la varita se paga con ESPERA (dueño: «adaptar, medio a ojo, SP en CD»; provisorio hasta pasar los creeps a SP, ver la hoja de
     ruta): ESPERA_POR_SP. Los orbes de la otra mano también valen (resguardo: Vida extra; salvaje: 1d6). */
  const ESPERA_POR_SP = sp => sp <= 0 ? 0 : sp <= 2 ? 1 : 2;   // SP 1–2 → 1 turno de espera; SP 3 o más → 2
  const especialesCreep = sc => (sc.equipo || []).filter(it => it && it.especial);
  function costoEspecialCreep(sc, it){
    const e = (it && it.especial) || {}, usos = num((sc.usosEspecial || {})[it.id]);
    const ahorro = usos ? 0 : Math.max(0, Math.round(num(C().modTotal(sc, 'ahorroespsp'))));   // primer conjuro: el SP de menos baja la espera
    return {no2: Math.max(0, num(e.no2 ?? 1)) + usos * Math.max(0, num(e.sube ?? 1)), espera: ESPERA_POR_SP(Math.max(0, num(e.sp) - ahorro)), usos, enEspera: num((sc.esperaEspecial || {})[it.id])};
  }
  function habDeEspecialCreep(sc, it){
    const e = it.especial || {}, dano = String(e.dano || '').trim();
    const suma = e.sumaEspecial ? Math.floor(num(C().statValor(sc, 'dmgesp')) * (e.sumaEspecial === true ? 1 : num(e.sumaEspecial))) : 0;
    return {id: 'esp:' + it.id, deItem: it.id, nombre: e.nombre || it.nombre, detalle: it.detalle || '', modo: 'auto', duelo: e.duelo ? structuredClone(e.duelo) : null,
      tiradaStat: (e.duelo && e.duelo.tira) || 'pdgmg', tiradaExtra: dano ? dano + (suma > 0 ? '+' + suma : '') : '',
      ...(e.trampaColocar ? {trampaColocar: structuredClone(e.trampaColocar)} : {}), nitrosCosto: costoEspecialCreep(sc, it).no2, cd: 0};
  }
  // Cobra y arma el plan (lo mismo que ejecutarHab, con la espera y los orbes). {error} o el plan, con `hab` (la habilidad de la varita).
  function usarEspecialCreep(sc, itemId, presets){
    const it = especialesCreep(sc).find(x => x.id === itemId);
    if(!it) return {error: `${sc.nombre}: esa arma especial ya no está en su equipo`};
    const c = costoEspecialCreep(sc, it);
    if(c.enEspera > 0) return {error: `${sc.nombre}: ${it.nombre} está en espera ${fmt(c.enEspera)} turno${c.enEspera === 1 ? '' : 's'} (un creep paga el SP con espera)`};
    const h = habDeEspecialCreep(sc, it);
    const p = ejecutarHab(sc, h, presets);
    if(p.error) return p;
    sc.esperaEspecial = {...(sc.esperaEspecial || {}), [it.id]: c.espera};   // en el creep: la varita queda igual (si la saquean, vuelve a costar SP)
    sc.usosEspecial = {...(sc.usosEspecial || {}), [it.id]: c.usos + 1};
    const propio = it.especial.estadoPropio;   // lo que se pone quien la usa (la luz)
    if(propio && propio.nombre) EstadosAplicar.aplicarACreep(sc, structuredClone(propio));
    const avisos = [];
    (sc.equipo || []).filter(o => o && o.orbe).forEach(o => {
      const k = 'orbe:' + o.id;
      if(o.orbeResguardo && !num(sc.usosEspecial[k])){
        sc.usosEspecial[k] = 1;
        const r = EstadosAplicar.aplicarACreep(sc, {nombre: 'Vida extra', turnos: 1, escudoMagico: num(o.orbeResguardo)});
        avisos.push(`${o.nombre}: ${r.ok ? `Vida extra ${fmt(num(o.orbeResguardo))} hasta su próximo turno` : `no entra la Vida extra (${r.motivo || 'bloqueado'})`}`);
      }
      if(o.orbeSalvaje){   // salvaje (Común) o domado (Buena calidad): Combatiente.orbeSalvaje
        const d = 1 + Math.floor(Math.random() * 6), x = Combatiente.orbeSalvaje(o, d);
        if(x.dano) sc.hp = Math.max(0, num(sc.hp) - x.dano);
        if(x.doble) p.doble = true;
        avisos.push(`${o.nombre}: 1d6 → ${d}: ${x.dano ? 'le hace 1 de daño' : x.doble ? (/\d+d\d+/.test(h.tiradaExtra) ? '¡el efecto sale doble! (los dados del daño, ×2)' : '¡el efecto sale doble! ✋ A mano: qué es el doble lo decide la mesa') : 'nada'}`);
      }
      // Orbe del custodio (Buena calidad, 2026-10-06): un aliado al lado recibe Vida extra N (el mapa lo elige; en GM Tools, a mano).
      if(num(o.orbeCustodio) > 0 && !num(sc.usosEspecial[k + ':c'])){
        sc.usosEspecial[k + ':c'] = 1;
        p.custodio = [...(p.custodio || []), {n: num(o.orbeCustodio), orbe: o.nombre}];
        avisos.push(`${o.nombre}: un aliado al lado recibe Vida extra ${fmt(num(o.orbeCustodio))} hasta su próximo turno`);
      }
    });
    p.hab = h; p.avisosOrbe = avisos; p.espera = c.espera;
    // ✋ La parte a mano: el texto y, si hay, su tirada ya hecha (la publica cada pantalla con acPublicar / su Mesa).
    const am = Combatiente.aManoEspecial(it.especial);
    if(am){
      const r = am.tirada && typeof tirarDados === 'function' ? tirarDados(am.tirada) : null;
      p.aMano = {texto: am.texto, tirada: r ? {origen: `${it.nombre} · ${am.etiqueta}`, r} : null};
    }
    return p;
  }
  // La habilidad de la varita para lo que sigue (terminarHab), con el «doble» del orbe salvaje si salió.
  function habEspecialParaTerminar(sc, itemId, doble){
    const it = especialesCreep(sc).find(x => x.id === itemId);
    if(!it) return null;
    const h = habDeEspecialCreep(sc, it);
    if(doble) h.tiradaExtra = String(h.tiradaExtra || '').replace(/(\d+)d(\d+)/g, (m, n, k) => `${2 * num(n)}d${k}`);
    return h;
  }
  // Lo de un creep al empezar su vuelta: ataques, armas especiales y su espera, Saque rápido, cooldowns, lo que se dispara y No2 al máximo.
  function inicioCreep(sc){
    sc.ataquesTurno = 0;
    sc.usosEspecial = {};   // el No2 de las armas especiales vuelve a 1 (y los orbes, a su uso por turno); también la marca del primer golpe
    Object.keys(sc.esperaEspecial || {}).forEach(k => { sc.esperaEspecial[k] = Math.max(0, num(sc.esperaEspecial[k]) - 1); if(!sc.esperaEspecial[k]) delete sc.esperaEspecial[k]; });   // la espera de sus varitas
    sc.saqueUsado = false;   // Saque rápido: vuelve con el turno (2026-10-05)
    let enCooldown = 0;
    (sc.habilidades || []).forEach(h => { if(num(h.cdActual) > 0){ h.cdActual = Math.max(0, num(h.cdActual) - 1); enCooldown++; } });
    const v = Combatiente.vencerAlEmpezar(sc.estados); sc.estados = v.quedan;   // Titilando se va al empezar su turno
    const d = Combatiente.dispararEstados(sc.estados, {hp: 'hpTurno', stacks: 'stacksTurno', resFuego: C().resElemental(sc, 'fuego')});
    const rep = Combatiente.reporteTurno([...v.eventos, ...d.eventos]);
    const dh = Combatiente.curaQueEntra(sc.hp, d.hp);
    if(d.hp && !dh) rep.push('Caído: la cura de este turno no lo levanta');
    if(dh){ const antes = num(sc.hp); sc.hp = Math.max(0, Math.min(num(sc.hpMax), antes + dh)); rep.push(`HP total: ${antes} → ${sc.hp}`); }
    sc.nitros = Combatiente.recargarNo2(C().nitrosMax(sc), sc.nitros);
    return {rep, enCooldown, hpAplicado: d.eventos.filter(ev => ev.tipo === 'hp').length};
  }
  function finCreep(sc){
    const k = Combatiente.contarEstados(sc.estados, {hp: 'hpTurno', stacks: 'stacksTurno'});
    sc.estados = k.quedan;
    if(k.terminados.some(es => C().modsAfectanHp(es.mods))) C().actualizarHpMaxPorCon(sc);
    const rep = Combatiente.reporteTurno(k.eventos);
    const calma = num(C().modTotal(sc, 'calma'));   // Calma (anillo, 2026-10-06): si no atacó en su turno, recupera No2
    if(calma > 0 && !num(sc.ataquesTurno)){ const max = C().nitrosMax(sc), antes = num(sc.nitros); if(antes < max){ sc.nitros = Math.min(max, antes + calma); rep.push(`Calma: no atacó, +${sc.nitros - antes} No2`); } }
    return {rep, vencidos: k.terminados.length};
  }
  // ⟳ Mantenimiento de la ronda (fuera de combate, o si no está en el orden de turnos). Con turno propio reciente no hace nada (lo hace su turno).
  function mantenimiento(sc, numero){   // `numero` = el de ese Mantenimiento (sin él, se aplica siempre, como antes)
    if(numero !== undefined && !Combatiente.estadosEnMantenimiento(sc.finTurnoEn, numero)) return {rep: [], enCooldown: 0, hpAplicado: 0, vencidos: 0, enTurno: true};
    // Lo que se dispara va antes de recargar No2 (un Stun que vence ya no los topea): dispara, cuenta y recién ahí No2.
    const deuda = Math.min(0, num(sc.nitros));
    const a = inicioCreep(sc), b = finCreep(sc);
    sc.nitros = Combatiente.recargarNo2(C().nitrosMax(sc), deuda);
    return {rep: [...a.rep, ...b.rep], enCooldown: a.enCooldown, hpAplicado: a.hpAplicado, vencidos: b.vencidos};
  }
  // El turno propio de un creep en el orden de turnos (2026-10-06, P161). `clave` = «mapa:paso:…»; si ya se aplicó → null. `numero` = el
  // Mantenimiento en curso (para que el ⟳ de la ronda sepa que ya lo atiende su turno).
  function inicioTurno(sc, clave, numero){
    if(sc.inicioTurnoClave === clave) return null;
    sc.inicioTurnoClave = clave; sc.finTurnoEn = num(numero);
    return inicioCreep(sc);
  }
  function finTurno(sc, clave, numero){
    if(sc.finTurnoClave === clave) return null;
    sc.finTurnoClave = clave; sc.finTurnoEn = num(numero);
    return finCreep(sc);
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

  return {bloqueoFirmeCreep, ESPERA_POR_SP, especialesCreep, costoEspecialCreep, habDeEspecialCreep, usarEspecialCreep, habEspecialParaTerminar, mantenimiento, inicioTurno, finTurno, reclamarMantenimiento, alCinturon, quitarDelCinturon, consumir, faltanNitrosConsumir, costoConsumir, colocarTrampaDeItem, consumiblesDe,
    tirada, tiradaStat, esquivar, parry, fuerzaGolpe, bloqueo, dano, levantarse, tiradaSoltarse, aplicarSoltarse, pagarParry, pagarAtaque, tiradaAtaque, NOMBRE_ESPECIAL,
    costoAtaqueDe, faltanNitros, preguntaSinNitros, alertaSinNitros,
    FLAGS_ESTADO, habEtq, habEjecucion, ataqueDeHab, habTira, efectoDeHab, sobreSi, ejecutarHab, terminarHab, tiradaPrimeraHab, tiradaSegundaHab,
    zonaDeHab, cdMod};
})();
