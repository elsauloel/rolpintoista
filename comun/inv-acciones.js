/* =========================================================
   INV-ACCIONES — los botones de la Botonera de una invocación, fuera de la ficha (paso 4, etapa 4e, tanda 3 de
   docs/plan-paso4-etapa4.md, 2026-10-01)
   Lo que antes hacía ficha-personaje/js/04-invocaciones.js (tirarValorStatInv, invAtacar/invAtacarSuelto, invDanio,
   invTirarStat), copiado tal cual y partido como comun/creep-acciones.js: lo que CAMBIA a la invocación (pagar el Parry o el
   ataque: devuelven {error} o {aviso}) y las TIRADAS (devuelven {origen, r} para publicar, o {error}). Así la ficha lo hace con
   su personaje en memoria y el mapa con el de la Botonera nueva, y cada uno publica y guarda a su manera. El Parry que espera su
   Bloqueo lo lleva cada pantalla.
   Necesita comun/combatiente.js, inv-calculo.js, ficha-calculo.js (STAT_LABEL) y tiradas.js (tirarDados).
   ========================================================= */
const InvAcciones = (() => {
  const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
  const fmt = n => Number.isInteger(n) ? n : Math.round(n*100)/100;
  const I = () => InvCalculo;
  const etq = statId => FichaCalculo.STAT_LABEL[statId] || statId;

  /* ---------- Tiradas ---------- */
  // La misma tirada que el personaje y los creeps (comun/combatiente.js): con Afortunado también tira dos veces (P100).
  function tirada(inv, nombre, valor, statId){
    const r = Combatiente.tirarStat(valor, inv.estados, statId);
    if(!r) return {error: `${nombre}: ${fmt(num(valor))} no se puede tirar con dados reales`};
    return {origen: `${inv.nombre} · ${nombre}`, r};
  }
  // Una tirada de stat de la Botonera (también Esquivar, Parry y Bloqueo). o: {parryPendiente (¿tiene un Parry esperando su
  // Bloqueo?), trasParry (el duelo ya sabe que el Parry se ganó)}. Devuelve {error} o {tirada, parry: 'poner'|'sacar'|'',
  // aviso, cambio (true si le cobró algo)}: el Parry cobra 1 No2 y deja el Bloqueo pendiente; el Bloqueo lo cierra.
  function tirarStat(inv, statId, o){
    o = o || {};
    if((statId === 'parry' || statId === 'bloqueo') && !I().defensa(inv)) return {error: `${inv.nombre}: ${Combatiente.SIN_ARMA_DEFENSA}`};
    let parry = '', aviso = '', cambio = false;
    if(statId === 'bloqueo'){
      if(!o.trasParry && !o.parryPendiente) return {error: `${inv.nombre}: ${Combatiente.BLOQUEO_SOLO_TRAS_PARRY}`};
      parry = 'sacar';
    }
    if(statId === 'parry'){
      const costo = Combatiente.costoParry();   // el Parry siempre cuesta 1 No2
      if(costo > num(inv.nitros)) return {error: `${inv.nombre}: no le alcanzan los No2 — el Parry cuesta ${fmt(costo)} No2 y tiene ${fmt(num(inv.nitros))}`};
      inv.nitros = num(inv.nitros) - costo;
      parry = 'poner';   // si gana el Parry, sigue el Bloqueo
      cambio = true;
      aviso = `${inv.nombre}: Parry −${fmt(costo)} No2 · quedan ${fmt(inv.nitros)}`;
    }
    const valor = statId === 'bloqueo' ? I().bloqueoValor(inv) : I().statValor(inv, statId);
    return {tirada: tirada(inv, etq(statId), valor, statId), parry, aviso, cambio};
  }
  // El daño de su arma; mods: lo que suma un ataque con arreglos (dados y fijo). Los efectos al golpear los publica cada pantalla.
  function dano(inv, mods){
    let formula = I().danoTxt(inv, I().statValor(inv, 'dmg'));
    if(mods){
      if(num(mods.dados) > 0) formula += ` + ${Math.round(num(mods.dados))}d${num(inv.armaTipo) || 8}`;
      if(num(mods.fijo)) formula += ` ${num(mods.fijo) > 0 ? '+' : '-'} ${fmt(Math.abs(num(mods.fijo)))}`;
    }
    const r = tirarDados(formula);
    return r ? {origen: `${inv.nombre} · Daño Arma`, r} : null;
  }

  /* ---------- Atacar ----------
     Con el duelo: el ataque que va al cuadro (ataqueDuelo). Sin duelo (o "Sin objetivo"): cobrar (pagarAtaque: el primero del
     turno Tipo ÷ 2, después el Tipo completo; suma al conteo) y tirar el PdG (tiradaAtaque). Atacar cierra el Parry pendiente:
     lo borra cada pantalla. */
  function ataqueDuelo(inv, tipo){
    return {tipo: tipo === 'oportunidad' || tipo === 'contra' ? tipo : 'normal', armaId: '', armaNombre: inv.armaNombre || '', tipoDado: num(inv.armaTipo) || 8, rango: !!inv.armaDeRango, ...Combatiente.ataqueDeArma(Combatiente.armaDeCombatiente(inv)),
      alcance: inv.armaDeRango ? Math.max(1, Math.round(num(I().statValor(inv, 'rng')))) : 1};
  }
  /* Sin No2 suficientes (2026-10-02, hoja de ruta B-7, igual que los creeps y los personajes: avisar y dejar seguir): faltanNitros, la
     pregunta «¿Atacar igual?», pagar forzando (gasta los que tenga, hasta 0) y la línea roja de la Mesa (alertaSinNitros). */
  /* Ataque de oportunidad y contraataque (2026-10-03, como los creeps — CreepAcciones): cuestan lo de un primer ataque (Tipo ÷ 2), no cuentan
     como ataque del turno y suman el «PdG en oportunidad» / «PdG en contraataque» de su arma. Antes se cobraban y tiraban como uno normal. */
  const NOMBRE_ESPECIAL = {oportunidad: 'Ataque de oportunidad', contra: 'Contraataque'};
  // La regla universal (Combatiente.statAtaqueEspecial): el PdG especial venga de su arma, su equipo o sus estados.
  const bonoEspecial = (inv, tipo) => { const st = Combatiente.statAtaqueEspecial(tipo); return st ? I().modTotal(inv, st) : 0; };
  const especial = tipo => tipo === 'oportunidad' || tipo === 'contra';
  const costoAtaqueDe = (inv, tipo) => especial(tipo) ? Combatiente.costoEspecial(num(inv.armaTipo) || 8, Combatiente.armaDeCombatiente(inv), tipo) : I().costoAtaque(inv);
  const faltanNitros = (inv, tipo) => costoAtaqueDe(inv, tipo) > num(inv.nitros);
  function preguntaSinNitros(inv, tipo){
    return `${inv.nombre} no tiene No2 suficientes: ${especial(tipo) ? 'el ' + NOMBRE_ESPECIAL[tipo].toLowerCase() : 'este ataque'} cuesta ${fmt(costoAtaqueDe(inv, tipo))} y tiene ${fmt(Math.max(0, num(inv.nitros)))}.\n\n¿Atacar igual? Gasta los No2 que tenga y queda anotado en rojo en la Mesa.`;
  }
  function pagarAtaque(inv, forzar, tipo){
    const costo = costoAtaqueDe(inv, tipo), tenia = Math.max(0, num(inv.nitros));
    const forzado = costo > num(inv.nitros) ? {costo, tenia} : null;
    if(forzado && !forzar) return {error: `${inv.nombre}: no le alcanzan los Nitros — ${especial(tipo) ? 'el ' + NOMBRE_ESPECIAL[tipo].toLowerCase() : 'este ataque'} cuesta ${fmt(costo)} y tiene ${fmt(num(inv.nitros))}`};
    if(especial(tipo)){
      inv.nitros = forzado ? 0 : num(inv.nitros) - costo;
      const bono = bonoEspecial(inv, tipo);
      return {forzado, aviso: `${inv.nombre}: ${NOMBRE_ESPECIAL[tipo].toLowerCase()} −${fmt(forzado ? tenia : costo)} No2 ${forzado ? `(costaba ${fmt(costo)})` : '(lo de un primer ataque)'}${bono ? ` · PdG +${fmt(bono)} por ${tipo === 'contra' ? 'contraataque' : 'oportunidad'}` : ''}`};
    }
    const primero = num(inv.ataquesTurno) === 0;
    inv.nitros = forzado ? 0 : num(inv.nitros) - costo;
    inv.ataquesTurno = num(inv.ataquesTurno) + 1;
    return {forzado, aviso: `${inv.nombre}: -${fmt(forzado ? tenia : costo)} No2${forzado ? ` (costaba ${fmt(costo)})` : ''} · ${primero ? 'primer ataque del turno' : 'ataque extra'}`};
  }
  function alertaSinNitros(inv, forzado, tipo){
    if(!forzado || typeof fbDb === 'undefined' || !fbDb || typeof fbUsuario === 'undefined' || !fbUsuario || !fbMiembro) return;
    fbDb.collection(fbRutaCampana('tiradas')).add({
      uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: '',
      origen: `⚠ ${inv.nombre} ${especial(tipo) ? 'hizo un ' + NOMBRE_ESPECIAL[tipo].toLowerCase() : 'atacó'} sin No2 suficientes`, formula: `Costaba ${fmt(forzado.costo)} No2 y tenía ${fmt(forzado.tenia)}`,
      rolls: [], mod: 0, total: 0, desde: 'alerta-roja',
      cuando: firebase.firestore.FieldValue.serverTimestamp(),
    }).catch(err => console.error('No se pudo publicar la alerta de No2:', err));
  }
  const tiradaAtaque = (inv, tipo) => especial(tipo) ? tirada(inv, `${NOMBRE_ESPECIAL[tipo]} (PdG)`, I().statValor(inv, 'pdg') + bonoEspecial(inv, tipo), 'pdg')
    : tirada(inv, 'Atacar (PdG)', I().statValor(inv, 'pdg'), 'pdg');

  // El menú «¿Qué ataque es?» de una invocación (el mismo de personajes y creeps: Combatiente.menuTipoAtaqueHtml).
  const menuTipoAtaque = (inv, attr) => Combatiente.menuTipoAtaqueHtml({nombre: inv.nombre, normal: I().costoAtaque(inv), primero: num(inv.ataquesTurno) === 0,
    especial: costoAtaqueDe(inv, 'contra'), especialOpor: costoAtaqueDe(inv, 'oportunidad'), attr, ref: inv.id});
  /* Levantarse (Sentado) y Soltarse (trampas de Atrapar): 2026-10-03, «las reglas de combate aplican a creeps, personajes e invocaciones
     por igual». Levantarse cuesta lo mismo que a un personaje (FichaCalculo.IT2.nitrosLevantarse). Soltarse: primero la tirada (una sola
     vez), después aplicarla (cobra y, si salió, saca el estado). → {error} / {aviso}; tiradaSoltarse → {s, r, ok, est, origen} o null. */
  function levantarse(inv){
    const est = (inv.estados || []).find(e => e && e.activo !== false && e.sentado);
    if(!est) return null;
    const costo = num(FichaCalculo.IT2.nitrosLevantarse);
    if(num(inv.nitros) < costo) return {error: `${inv.nombre}: no le alcanzan los No2 — levantarse cuesta ${costo}`};
    inv.nitros = num(inv.nitros) - costo;
    inv.estados = inv.estados.filter(e => e !== est);
    return {aviso: `${inv.nombre} se levantó${costo ? ` · −${fmt(costo)} No2` : ''}`};
  }
  function tiradaSoltarse(inv){
    const est = Combatiente.estadoSoltable(inv.estados);
    if(!est) return null;
    const s = Combatiente.soltarNorm(est.soltar);
    const t = Combatiente.tiradaSoltarse(est, I().statValor(inv, s.stat), inv.estados);
    return {...t, est, origen: `${inv.nombre} · Soltarse (${est.nombre}) · ${s.etq} contra ${s.dif}`};
  }
  function aplicarSoltarse(inv, t){
    if(num(inv.nitros) < t.s.no2) return {error: `${inv.nombre}: no le alcanzan los No2 — soltarse cuesta ${t.s.no2}`};
    inv.nitros = num(inv.nitros) - t.s.no2;
    if(t.ok) inv.estados = (inv.estados || []).filter(e => e !== t.est && !(t.est.id && e.id === t.est.id));
    return {aviso: `${inv.nombre} ${t.ok ? 'se soltó' : 'no se soltó'} (${t.r ? t.r.total : '—'} contra ${t.s.dif}) · −${fmt(t.s.no2)} No2`};
  }
  return {levantarse, tiradaSoltarse, aplicarSoltarse, tirada, tirarStat, dano, ataqueDuelo, pagarAtaque, tiradaAtaque, faltanNitros, preguntaSinNitros, alertaSinNitros, bonoEspecial, costoAtaqueDe, menuTipoAtaque};
})();
