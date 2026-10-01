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
     después la tirada de PdG (tiradaAtaque). Un ataque normal cierra el Parry que esperaba su Bloqueo: lo borra cada pantalla. */
  const NOMBRE_ESPECIAL = {oportunidad: 'Ataque de oportunidad', contra: 'Contraataque'};
  // PdG en contraataque (o en oportunidad) que le suma su arma.
  const bonoEspecial = (sc, tipo) => (sc.armaMods || []).filter(m => m.stat === (tipo === 'contra' ? 'pdgcontra' : tipo === 'oportunidad' ? 'pdgopor' : '')).reduce((a, m) => a + num(m.val), 0);
  function pagarAtaque(sc, tipo){
    if(tipo === 'normal'){
      const costo = C().costoAtaque(sc);
      if(costo > num(sc.nitros)) return {error: `${sc.nombre}: no le alcanzan los No2 — este ataque cuesta ${fmt(costo)} y tiene ${fmt(num(sc.nitros))}`};
      const primero = num(sc.ataquesTurno) === 0;
      sc.nitros = num(sc.nitros) - costo;
      sc.ataquesTurno = num(sc.ataquesTurno) + 1;
      return {aviso: `${sc.nombre}: −${fmt(costo)} No2 · ${primero ? 'primer ataque del turno' : `ataque ${fmt(sc.ataquesTurno)} del turno`} · quedan ${fmt(sc.nitros)}`};
    }
    const nombre = NOMBRE_ESPECIAL[tipo] || 'Contraataque', costo = C().costoContraataque(sc);
    if(costo > num(sc.nitros)) return {error: `${sc.nombre}: no le alcanzan los No2 — el ${nombre.toLowerCase()} cuesta ${fmt(costo)} y tiene ${fmt(num(sc.nitros))}`};
    sc.nitros = num(sc.nitros) - costo;
    const bono = bonoEspecial(sc, tipo);
    return {aviso: `${sc.nombre}: ${nombre.toLowerCase()} −${fmt(costo)} No2 (lo de un primer ataque)${bono ? ` · PdG +${fmt(bono)} por ${tipo === 'contra' ? 'contraataque' : 'oportunidad'}` : ''} · quedan ${fmt(sc.nitros)}`};
  }
  function tiradaAtaque(sc, tipo){
    if(tipo === 'normal') return tirada(`${sc.nombre} · PdG`, C().statValor(sc, 'pdg'), sc, 'pdg');
    const nombre = NOMBRE_ESPECIAL[tipo] || 'Contraataque';
    return tirada(`${sc.nombre} · ${nombre} (PdG)`, C().statValor(sc, 'pdg') + bonoEspecial(sc, tipo), sc, 'pdg');
  }

  return {tirada, tiradaStat, esquivar, parry, fuerzaGolpe, bloqueo, dano, levantarse, pagarParry, pagarAtaque, tiradaAtaque, NOMBRE_ESPECIAL};
})();
