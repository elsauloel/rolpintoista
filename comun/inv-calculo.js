/* =========================================================
   INV-CALCULO — las reglas de una invocación, fuera de la ficha (paso 4, etapa 4e, tanda 1 de docs/plan-paso4-etapa4.md,
   2026-10-01)
   Lo que antes vivía en ficha-personaje/js/04-invocaciones.js (el "motor de stats" de una invocación), copiado tal cual con la
   invocación (`inv`) como parámetro: stats con equipo y estados, Defensa, críticos, No2 máximo, con qué para, Bloqueo, costos de
   atacar y de las habilidades, daño del arma, el HP máximo por Constitución y `migrar` (rellena lo que les falta a las viejas).
   La ficha lo usa con sus nombres de siempre (invStatValor…); el mapa, para la Botonera nueva de una invocación.
   Necesita comun/combatiente.js, ficha-calculo.js (GRUPOS, slotDe), ficha-resumen.js (invFuentesEquipo, invModTotal,
   invNitrosMax) y ficha-botonera.js (modoHab), que se usan recién al llamar.
   ========================================================= */
const InvCalculo = (() => {
  const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
  const fmt = n => Number.isInteger(n) ? n : Math.round(n*100)/100;
  const GRUPOS = FichaCalculo.GRUPOS;
  const slotDe = t => FichaCalculo.slotDe(t);

  const IT2_INV = {
    nitrosHabilidad: 1,             // costo por defecto de una habilidad (el de atacar es Combatiente.costoAtaque)
  };
  const ATTR_IDS_INV = ['con','fue','agl','des','esp'];
  // Stats secundarios de una invocación: los mismos que un PJ (GRUPOS),
  // salvo Hp.Max/No2 (ya se ven en las barras) y Crg.Max/SP/SP Regen (no aplican).
  const INV_STAT_EXCLUIR = ['hpmax','nitros','crgmax','sp','spregen'];
  const INV_DERIVADOS_POR_ATTR = Object.fromEntries(GRUPOS.map(g => [g.id, g.derived.filter(d => !INV_STAT_EXCLUIR.includes(d.id))]));
  const INV_STAT_ATTR = Object.fromEntries(GRUPOS.flatMap(g => g.derived.map(d => [d.id, g.id])));
  // Mismo criterio que STATS_CON_TIRADA en la Botonera de la ficha: los 5
  // atributos base + los secundarios que no tienen ya su propio botón en Combate.
  const INV_STATS_TIRADA_IDS = ['con','fue','agl','des','esp','resmg','rescc','ini','pdgmg','resm'];
  // Stats que puede tirar una habilidad (incluye PdG, Bloqueo y Parry, que
  // en la Botonera ya tienen su propio botón de Combate y por eso no están
  // en INV_STATS_TIRADA_IDS) — mismos que ofrece gm-tools para un creep.
  const INV_STATS_HAB = ['resmg','rescc','bloqueo','eva','ini','pdg','parry','pdgmg','resm'];

  function fuentesEquipo(inv){ return FichaResumen.invFuentesEquipo(inv); }   // comun/ficha-resumen.js
  function modTotal(inv, statId){ return FichaResumen.invModTotal(inv, statId); }
  // Cada fuente (equipo o estado activo) que le suma a un stat, con su valor
  // — para la 🔍 (de dónde sale cada tirada).
  function aportesMod(inv, statId){
    const out = [];
    fuentesEquipo(inv).forEach(it => {
      const v = (it.mods||[]).filter(m => m.stat === statId).reduce((a, m) => a + num(m.val), 0);
      if(v) out.push({nombre: it.nombre || '(sin nombre)', val: v});
    });
    (inv.estados||[]).forEach(es => {
      if(es.activo === false) return;
      const stacks = Math.max(1, num(es.stacks)||1);
      const v = (es.mods||[]).filter(m => m.stat === statId).reduce((a, m) => a + num(m.val) * stacks, 0);
      if(v) out.push({nombre: es.nombre || '(sin nombre)', val: v});
    });
    return out;
  }
  function estadosArmadura(inv){
    const activos = (inv.estados||[]).filter(e => e.activo !== false);
    return {rota: activos.filter(e => e.armaduraRota).reduce((a, e) => a + Math.max(1, num(e.stacks) || 1), 0)};
  }
  function aporteArmadura(inv, statId){
    return (inv.equipo||[]).filter(it => slotDe(it.tipoItem) === 'armadura')
      .reduce((a,it) => a + (statId === 'def' ? num(it.def) : (it.mods||[]).filter(m=>m.stat===statId).reduce((s,m)=>s+num(m.val),0)), 0);
  }
  function defensaEfectiva(inv){
    const {arruinada, rota} = estadosArmadura(inv);
    let v = num(inv.defensa);
    if(arruinada) v -= aporteArmadura(inv, 'def');
    v -= rota;  // Armadura rota: -1 por cada acumulación
    return Math.max(0, v);
  }
  function critEfectivo(inv, i){
    const {arruinada} = estadosArmadura(inv);
    let v = num(inv.crit[i]);
    if(arruinada) v -= aporteArmadura(inv, 'tipo'+(i+1));
    return v;
  }
  function estadoActivo(inv, flag){
    return (inv.estados || []).some(e => e.activo !== false && e[flag]);
  }
  function statValor(inv, statId){
    const attr = INV_STAT_ATTR[statId] || statId;
    let v = num(inv[attr]) + modTotal(inv, attr);
    if(statId !== attr) v += modTotal(inv, statId);
    return v;
  }
  function nitrosMax(inv){ return FichaResumen.invNitrosMax(inv); }
  // Nitros de una habilidad: un número, o "ATAQUE" = lo que le cuesta un
  // ataque con su arma (Tipo ÷ 2 el primero del turno) y cuenta como ese ataque.
  function habAtaque(h){ return String((h && h.nitrosCosto) ?? '').trim().toUpperCase() === 'ATAQUE'; }
  // Parry y Bloqueo de una invocación (2026-09-24), igual que un creep: el Parry cuesta 1 No2 (2026-09-26); el Bloqueo = su Bloqueo + el Peso de su arma.
  function pesoArma(inv){ return Math.max(1, num(inv.armaPeso) || 1); }
  // Con qué para la invocación (Parry y Bloqueo): su arma si no es natural, si no un escudo de su equipo; null = no puede
  // (regla del dueño 2026-09-30, comun/combatiente.js — la misma que personajes y creeps). El Bloqueo suma el peso de eso.
  function defensa(inv){
    if(!inv) return null;
    return Combatiente.armaParaDefensa({arma: inv.armaNombre ? {nombre: inv.armaNombre, peso: pesoArma(inv)} : null, natural: inv.armaNatural === true,
      escudos: (inv.equipo || []).filter(it => slotDe(it.tipoItem) === 'escudo').map(it => ({nombre: it.nombre, peso: num(it.peso)}))});
  }
  function bloqueoValor(inv){ const d = defensa(inv); return statValor(inv, 'bloqueo') + (d ? num(d.peso) : 0); }
  function costoAtaque(inv){ return Combatiente.costoAtaque(num(inv.armaTipo) || 8, inv.ataquesTurno); }   // regla común (comun/combatiente.js)
  function costoNitrosHab(inv, h){ return Combatiente.costoNitrosHab(h, () => costoAtaque(inv), IT2_INV.nitrosHabilidad); }
  function costoHabTxt(inv, h){
    const n = costoNitrosHab(inv, h);
    if(habAtaque(h)) return `${fmt(n)} No2 (como un ataque)`;
    return n ? `${fmt(n)} No2` : 'sin costo';
  }
  // ¿Se puede usar ahora? La regla común (P133): cooldown, No2 y vida (una 📣 manual no cobra nada).
  function bloqueoHab(inv, h){ return Combatiente.bloqueoHab(h, {modo: FichaBotonera.modoHab(h), nitros: inv.nitros, costo: costoNitrosHab(inv, h), hp: inv.hp}); }
  function danoTxt(inv, extra){
    const dados = Math.max(1, num(inv.armaPeso)||1) + Math.max(0, num(inv.armaAmplificado));
    const tipo = num(inv.armaTipo)||8;
    const fijo = num(inv.armaFijo) + (inv.armaDeRango ? 0 : num(extra));
    return `${dados}d${tipo}${fijo?` + ${fmt(fijo)}`:''}`;
  }
  function ataqueTxt(inv){
    return danoTxt(inv, statValor(inv, 'dmg'));
  }
  function modsAfectanHp(mods){
    return (mods || []).some(m => m.stat === 'con' || m.stat === 'hpmax');
  }
  // Recalcula hpMax = con*5 + mods de Hp.Max (con efectivo, equipo y estados
  // incluidos, igual que la ficha y los creeps). Si estaba lleno, sigue
  // lleno con el nuevo máximo; si no, solo se recorta si se pasa.
  function actualizarHpMaxPorCon(inv){
    const conEfectivo = num(inv.con) + modTotal(inv, 'con');
    const nuevoHpMax = Math.max(0, conEfectivo * 5 + modTotal(inv, 'hpmax'));
    const estabaFull = num(inv.hp) >= num(inv.hpMax);
    inv.hpMax = nuevoHpMax;
    inv.hp = estabaFull ? nuevoHpMax : Math.min(num(inv.hp), nuevoHpMax);
  }

  // Rellena campos que invocaciones viejas (guardadas antes de esta
  // actualización) no tienen, para que el resto del código no se tope con
  // undefined. Convierte Acciones/Movimiento (viejo) a No2, igual que ya
  // se hizo en la ficha y en los creeps con la Iteración 2.
  function migrar(inv){
    const crit = Array.isArray(inv.crit) ? inv.crit.map(v=>num(v)) : [];
    while(crit.length < 5) crit.push(0);
    inv.crit = crit.slice(0, 5);
    inv.equipo = Array.isArray(inv.equipo) ? inv.equipo : [];
    inv.estados = Array.isArray(inv.estados) ? inv.estados : [];
    inv.habilidades = Array.isArray(inv.habilidades) ? inv.habilidades : [];
    inv.armaMods = Array.isArray(inv.armaMods) ? inv.armaMods : [];
    inv.armaEfectos = Array.isArray(inv.armaEfectos) ? inv.armaEfectos : [];
    if(inv.armaManos === undefined) inv.armaManos = 'arma_1m';
    if(inv.armaAmplificado === undefined) inv.armaAmplificado = 0;
    if(inv.armaDeRango === undefined) inv.armaDeRango = false;
    if(inv.armaNombre === undefined) inv.armaNombre = '';
    if(inv.armaDetalle === undefined) inv.armaDetalle = '';
    if(inv.defensa === undefined) inv.defensa = 0;
    if(inv.notas === undefined) inv.notas = '';
    if(inv.acc !== undefined || inv.accMax !== undefined){
      delete inv.acc; delete inv.accMax; delete inv.nitros;  // arranca lleno, abajo
    }
    inv.habilidades.forEach(h => {
      if(h.nitrosCosto === undefined) h.nitrosCosto = IT2_INV.nitrosHabilidad;
      if(h.tiradaStat === undefined) h.tiradaStat = '';
      if(h.tiradaExtra === undefined) h.tiradaExtra = '';
      if(h.cdActual === undefined) h.cdActual = 0;
      if(h.efectoNombre === undefined) h.efectoNombre = '';
    });
    if(inv.nitros === undefined || inv.nitros === null) inv.nitros = nitrosMax(inv);
    if(inv.ataquesTurno === undefined) inv.ataquesTurno = 0;
    return inv;
  }

  return {IT2_INV, ATTR_IDS_INV, INV_STAT_EXCLUIR, INV_DERIVADOS_POR_ATTR, INV_STAT_ATTR, INV_STATS_TIRADA_IDS, INV_STATS_HAB,
    fuentesEquipo, modTotal, aportesMod, estadosArmadura, aporteArmadura, defensaEfectiva, critEfectivo, estadoActivo, statValor,
    nitrosMax, habAtaque, pesoArma, defensa, bloqueoValor, costoAtaque, costoNitrosHab, costoHabTxt, bloqueoHab, danoTxt, ataqueTxt,
    modsAfectanHp, actualizarHpMaxPorCon, migrar};
})();
