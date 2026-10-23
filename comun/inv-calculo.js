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
  const INV_STAT_EXCLUIR = ['hpmax','nitros','crgmax','sp','spregen', ...Combatiente.SOLO_BONO];   // (los bonos de regla no son stats secundarios, 2026-10-20)
  const INV_DERIVADOS_POR_ATTR = Object.fromEntries(GRUPOS.map(g => [g.id, g.derived.filter(d => !INV_STAT_EXCLUIR.includes(d.id))]));
  const INV_STAT_ATTR = Object.fromEntries(GRUPOS.flatMap(g => g.derived.map(d => [d.id, g.id])));
  // Mismo criterio que STATS_CON_TIRADA en la Botonera de la ficha: los 5
  // atributos base + los secundarios que no tienen ya su propio botón en Combate.
  const INV_STATS_TIRADA_IDS = ['con','fue','agl','des','esp','resmg','rescc','ini','pdgmg','dmgesp','resm'];
  // Stats que puede tirar una habilidad (incluye PdG, Bloqueo y Parry, que
  // en la Botonera ya tienen su propio botón de Combate y por eso no están
  // en INV_STATS_TIRADA_IDS) — mismos que ofrece gm-tools para un creep.
  const INV_STATS_HAB = ['resmg','rescc','bloqueo','eva','ini','pdg','parry','pdgmg','dmgesp','resm'];

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
    (inv.pasivas||[]).forEach(p => {   // (2026-10-16)
      const c = Math.max(1, Math.round(num(p && p.compras)) || 1), v = (p.mods||[]).filter(m => m.stat === statId).reduce((a, m) => a + num(m.val) * c, 0);
      if(v) out.push({nombre: (p.nombre || '(sin nombre)') + (c > 1 ? ' ×' + c : ''), val: v});
    });
    return out;
  }
  // La vida que recuperan sus pasivas por turno (Regeneración…), con sus compras (2026-10-16, como un creep: CreepCalculo.regenPasivas).
  const regenPasivas = inv => (inv.pasivas||[]).reduce((a, p) => a + num(p && p.regenHp) * Math.max(1, Math.round(num(p && p.compras)) || 1), 0);
  function estadosArmadura(inv){
    const activos = (inv.estados||[]).filter(e => e.activo !== false);
    return {rota: activos.filter(e => e.armaduraRota).reduce((a, e) => a + Math.max(1, num(e.stacks) || 1), 0)};
  }
  function aporteArmadura(inv, statId){
    return Combatiente.equipoPuesto(inv).filter(it => slotDe(it.tipoItem) === 'armadura')
      .reduce((a,it) => a + (statId === 'def' ? num(it.def) : (it.mods||[]).filter(m=>m.stat===statId).reduce((s,m)=>s+num(m.val),0)), 0);
  }
  function defensaEfectiva(inv){
    const {arruinada, rota} = estadosArmadura(inv);
    let v = num(inv.defensa) + (num(inv.equipoVivo) >= 1 ? Combatiente.defDeEquipo(inv) : 0);   // 🛡 la base + lo equipado (paso 3)
    if(arruinada) v -= aporteArmadura(inv, 'def');
    // Bonos de Defensa de los estados (ej. «−2 Defensa», Piel de escoria): se suman por stack, igual que en los creeps y los
    // personajes (2026-10-01; antes una invocación los ignoraba). Armadura rota no: su −1 ya se cuenta abajo, por acumulación.
    (inv.estados || []).forEach(es => { if(es.activo === false || es.armaduraRota) return; const st = Math.max(1, num(es.stacks) || 1); (es.mods || []).forEach(m => { if(m.stat === 'def') v += num(m.val) * st; }); });
    v -= rota;  // Armadura rota: -1 por cada acumulación
    return Math.max(0, v);
  }
  function critEfectivo(inv, i){
    const {arruinada} = estadosArmadura(inv);
    let v = num(inv.crit[i]) + (num(inv.equipoVivo) >= 1 ? Combatiente.critDeEquipo(inv, i) : 0);   // 🛡 la base + lo equipado (paso 3; antes el equipo no le sumaba)
    if(arruinada) v -= aporteArmadura(inv, 'tipo'+(i+1));
    // + lo que dan los estados (Endurecido…, 2026-10-12)
    (inv.estados || []).forEach(es => { if(es && es.activo !== false) (es.mods || []).forEach(m => { if(m.stat === 'tipo' + (i + 1)) v += num(m.val) * Math.max(1, num(es.stacks) || 1); }); });
    return v;
  }
  function estadoActivo(inv, flag){
    return (inv.estados || []).some(e => e.activo !== false && e[flag]);
  }
  function statValor(inv, statId){
    if(Combatiente.SOLO_BONO.includes(statId)) return modTotal(inv, statId);   // bonos de regla: no salen de la Destreza (2026-10-20; antes el duelo se la sumaba al crítico)
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
  // 🗡 Su arma: por la puerta única (Combatiente.armaEnMano, docs/plan-inventario-creeps.md), nunca por los campos arma* sueltos.
  const armaDe = inv => Combatiente.armaEnMano(inv);
  function pesoArma(inv){ return armaDe(inv).peso; }
  // Con qué para la invocación (Parry y Bloqueo): su arma si no es natural, si no un escudo de su equipo; null = no puede
  // (regla del dueño 2026-09-30, comun/combatiente.js — la misma que personajes y creeps). El Bloqueo suma el peso de eso.
  // o.soloEscudo: contra un disparo, solo un escudo (2026-10-09). Con un arco no se parrea.
  function defensa(inv, o){
    if(!inv) return null;
    const a = armaDe(inv);
    return Combatiente.armaParaDefensa({arma: a.nombre ? {nombre: a.nombre, peso: a.peso} : null, natural: a.natural,
      arco: a.armaDeRango, soloEscudo: !!(o && o.soloEscudo),
      escudos: Combatiente.piezasParaParry(Combatiente.puestoSinArma(inv), slotDe, it => num(it.peso))});   // un báculo sí, un orbe no (2026-10-17)
  }
  function bloqueoValor(inv){ const d = defensa(inv); return statValor(inv, 'bloqueo') + (d ? num(d.peso) : 0); }
  function costoAtaque(inv){ return Combatiente.conExtenuado(inv.estados, costoAtaque0(inv)); }   // + Extenuado (2026-10-12)
  function costoAtaque0(inv){ const a = armaDe(inv); if(Combatiente.cargadaGratis(a, inv.ataquesTurno, inv.descargada)) return 0; return Math.max(0, Combatiente.costoConAhorro(Combatiente.costoAtaque(a.tipoDado, inv.ataquesTurno, a), a, inv.ataquesTurno) - Combatiente.ahorroArco(a, inv.ataquesTurno, inv.descargada, inv.ultimoPego)); }   // regla común (comun/combatiente.js)   // + Flecha en la cuerda / Encadenar (2026-10-11)
  function costoNitrosHab(inv, h){ const c = Combatiente.costoNitrosHab(h, () => costoAtaque(inv), IT2_INV.nitrosHabilidad); return String((h && h.nitrosCosto) ?? '').trim().toUpperCase() === 'ATAQUE' ? c : Combatiente.conExtenuado(inv.estados, c); }   // + Extenuado
  function costoHabTxt(inv, h){
    const n = costoNitrosHab(inv, h);
    if(habAtaque(h)) return `${fmt(n)} No2 (como un ataque)`;
    return n ? `${fmt(n)} No2` : 'sin costo';
  }
  // ¿Se puede usar ahora? La regla común (P133): cooldown, No2 y vida (una 📣 manual no cobra nada).
  function bloqueoHab(inv, h){ return Combatiente.bloqueoHab(h, {modo: FichaBotonera.modoHab(h), nitros: inv.nitros, costo: costoNitrosHab(inv, h), hp: inv.hp}); }
  function danoTxt(inv, extra){
    const a = armaDe(inv);
    const dados = a.peso + a.danoAmplificado;
    const tipo = a.tipoDado;
    const fijo = a.danoFijo + Combatiente.dmgDelArma(a, num(extra));   // cuerpo a cuerpo el Dmg entero; un arco, la mitad; otra de rango, nada
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
    inv.pasivas = Array.isArray(inv.pasivas) ? inv.pasivas : [];   // (2026-10-16) como las de un creep; la que da un estado lo mantiene puesto
    if(typeof estadosPresetFicha === 'function') Combatiente.sincronizarEstadosDePasivas(inv.estados, inv.pasivas, estadosPresetFicha());
    Combatiente.pasarArmaAItem(inv);   // 🗡 su arma, un ítem de su lista (docs/plan-inventario-creeps.md, paso 2): los campos arma* sueltos se convierten
    if(inv.defensa === undefined) inv.defensa = 0;
    Combatiente.pasarEquipoVivo(inv, {crit: false});   // 🛡 paso 3: la Defensa del equipo en vivo (la Res. a crítico nunca se le había sumado)
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
    modsAfectanHp, actualizarHpMaxPorCon, migrar, regenPasivas};
})();
