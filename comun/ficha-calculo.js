/* =========================================================
   FICHA-CALCULO — el cálculo de un personaje, fuera de la ficha (paso 5, nivel B, área 1 de docs/plan-paso5.md, 2026-09-30)
   Lo que antes vivía adentro de ficha-personaje (js/01-modelo-y-reglas.js): la lista de atributos y stats con sus
   etiquetas, las ranuras del equipo, la durabilidad de los ítems, las compras de pasivas, el presupuesto de Job y el CÁLCULO
   de los stats finales (`calcular(S)`, el viejo `compute()`), que ahora recibe la ficha (`S`) en vez de leerla de una
   variable global. Mismo código de siempre (copiado tal cual), así que da exactamente lo mismo; lo puede usar cualquier
   pantalla que tenga los datos de un personaje (la ficha hoy; el mapa cuando dibuje la Botonera, paso 4 etapa 3).
   Necesita comun/combatiente.js (durabilidad y No2 máximo). Ojo: las fórmulas de stats de cada ficha (`S.formulas`) se
   evalúan como código (`evalFormula`), igual que siempre.
   ========================================================= */
const FichaCalculo = (() => {
  const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };

  /* ---------- Atributos y stats ---------- */
  const GRUPOS = [
    {id:'con', label:'Con', full:'Constitución', color:'#C4485A', derived:[
      {id:'resmg', label:'Res.Esp', full:'Resistencia especial'},
      {id:'rescc', label:'Res.CC', full:'Resistencia al crowd control'},
      {id:'hpmax', label:'Hp.Max', full:'Health points máximos'}]},
    {id:'fue', label:'Fue', full:'Fuerza', color:'#D07B3A', derived:[
      {id:'dmg', label:'Dmg', full:'Damage'},
      {id:'bloqueo', label:'Bloqueo', full:'Bloqueo'},
      {id:'crgmax', label:'Crg.Max', full:'Carga máxima'}]},
    {id:'agl', label:'Agi', full:'Agilidad', color:'#8FB84F', derived:[
      {id:'eva', label:'Eva', full:'Evasión'},
      {id:'ini', label:'Iniciativa', full:'Iniciativa'},
      {id:'nitros', label:'No2', full:'Nitros'}]},
    {id:'des', label:'Des', full:'Destreza', color:'#4FA88C', derived:[
      {id:'rng', label:'Rng', full:'Rango'},
      {id:'pdg', label:'PdG', full:'Probabilidad de golpe'},
      {id:'pdgopor', label:'PdG Oport.', full:'PdG en ataque de oportunidad: solo suma cuando hacés un ataque de oportunidad; vale mucho menos que un PdG normal'},
      {id:'pdgcontra', label:'PdG Contra', full:'PdG en contraataque: solo suma cuando contraatacás (tras un Parry); vale mucho menos que un PdG normal'},
      {id:'critpot', label:'Crít.Pot.', full:'Crítico potente (baja los umbrales del d20: doble, triple y cuádruple daño)'},
      {id:'crit', label:'Crít.Frec.', full:'Crítico frecuente (baja el rango del crítico; ver Calculadora de crítico)'},
      {id:'parry', label:'Parry', full:'Parry'},
      {id:'percepcion', label:'Percep.', full:'Percepción'}]},
    {id:'esp', label:'Esp', full:'Especial', color:'#9B7BD4', derived:[
      {id:'pdgmg', label:'PdG.Esp', full:'Probabilidad de golpe especial'},
      {id:'resm', label:'Res.Mt', full:'Resistencia mental'},
      {id:'sp', label:'SP', full:'Special Power'},
      {id:'spregen', label:'SP Regen', full:'Regeneración de SP por turno'},
      {id:'rangocasteo', label:'Rango Cast.', full:'Rango de casteo'}]},
  ];
  const EXTRA = [
    {id:'def', label:'Defensa', full:'Defensa'},
    // Armadura mágica (Paso 3 de las reglas de casteo, docs/reglas-casteo.md):
    // stat general, fijo, que NO sale de ningún atributo (arranca en 0) — solo
    // lo dan ítems Raros o mejores. Protege el daño de casteo que "ignora la
    // Defensa" (Paso 1); no tiene nada que ver con el Escudo especial (HP
    // temporal) ni con la skill del Mago "Armadura arcana".
    {id:'armadmg', label:'Armadura mágica', full:'Armadura mágica: se resta al daño de casteo que ignora la Defensa. No sale de ningún atributo — solo la dan ítems raros o mejores.'},
    // Los ids tipo1..tipo5 quedaron de antes de correr la escala +2 (eran
    // Tipo 2..10): no se renombran para no tocar los mods ya guardados.
    {id:'tipo1', label:'Tipo 4', full:'Resistencia a crítico — armas Tipo 4 (d4)'},
    {id:'tipo2', label:'Tipo 6', full:'Resistencia a crítico — armas Tipo 6 (d6)'},
    {id:'tipo3', label:'Tipo 8', full:'Resistencia a crítico — armas Tipo 8 (d8)'},
    {id:'tipo4', label:'Tipo 10', full:'Resistencia a crítico — armas Tipo 10 (d10)'},
    {id:'tipo5', label:'Tipo 12', full:'Resistencia a crítico — armas Tipo 12 (d12, explosivos/modernas)'},
    {id:'capcinturon', label:'Ranuras cinturón', full:'Ranuras extra para consumibles que da el cinturón equipado'},
    {id:'capmochila', label:'Ranuras mochila', full:'Ranuras extra de la mochila que da la mochila equipada'},
    {id:'luz', label:'Luz portada', full:'Radio de luz que llevás encima (farol, bengala): iluminás y ves ese radio a tu alrededor, sin punto ciego'},
    {id:'veoculto', label:'Ve lo oculto', full:'Radio (dentro de tu campo de visión) en el que ves lo oculto: creeps en sigilo y trampas escondidas'},
    // Radio del campo de visión en hexágonos (base 6, decidido con la niebla de
    // guerra: P47). Se ve en un cuadro junto a Defensa; lo modifican pasivas,
    // ítems y estados. La niebla del mapa todavía no lo lee.
    {id:'vision', label:'Campo de visión', full:'Campo de visión (radio en hexágonos)'},
  ];
  const STAT_LIST = [...GRUPOS.flatMap(g=>g.derived), ...EXTRA];
  const ATTR_LIST = GRUPOS.map(g => ({id:g.id, label:g.label, full:g.full}));
  const MOD_TARGETS = [...ATTR_LIST, ...STAT_LIST];
  const STAT_LABEL = Object.fromEntries(MOD_TARGETS.map(s=>[s.id,s.label]));
  const STAT_FULL = Object.fromEntries(MOD_TARGETS.map(s=>[s.id,s.full]));
  const ES_ATTR = id => ATTR_LIST.some(a => a.id === id);

  /* ---------- Ranuras del equipo ---------- */
  const SLOT_MAP = {
    arma_1m:'mano', arma_2m:'mano',
    escudo_1m:'escudo', escudo_2m:'escudo',
    armadura_blanda:'armadura', armadura_rigida:'armadura',
    cabeza:'cabeza', manos:'manos', piernas:'piernas', pies:'pies',
    cinturon:'cinturon', mochila:'mochila',
  };
  const SLOT_LABEL = {mano:'Mano (una mano)', escudo:'Escudo', armadura:'Armadura', cabeza:'Cabeza', manos:'Manos', piernas:'Piernas', pies:'Pies', cinturon:'Cinturón', mochila:'Mochila', otro:'Otro'};
  function slotDe(tipoItem){ return SLOT_MAP[tipoItem] || 'otro'; }

  /* ---------- Durabilidad (docs/durabilidad.md; cuánta tiene cada ítem: comun/combatiente.js) ---------- */
  const SLOTS_DURABLES = ['mano', 'escudo', 'armadura', 'cabeza', 'manos', 'piernas', 'pies'];
  const SLOTS_ARMADURA = ['armadura', 'cabeza', 'manos', 'piernas', 'pies'];
  const durableItem = i => !!i && !i.consumible && SLOTS_DURABLES.includes(slotDe(i.tipoItem));
  const esArmaduraItem = i => durableItem(i) && SLOTS_ARMADURA.includes(slotDe(i.tipoItem));
  const durMax = i => Combatiente.durMax(i);
  const durActual = i => (i.dur === undefined || i.dur === null) ? durMax(i) : Math.max(0, Math.min(durMax(i), Math.round(num(i.dur))));
  const itemRoto = i => durableItem(i) && durActual(i) <= 0;
  const armRotaDe = i => Math.max(0, Math.min(durMax(i), Math.round(num(i.armRota))));

  /* ---------- Pasivas y Job ---------- */
  // Cuántas veces se compró una pasiva (las que se compran varias veces suman sus bonos).
  const pasivaCompras = x => Math.max(1, Math.floor(num(x && x.compras)) || 1);
  // Presupuesto total de Job: 3 al nivel 1 y 3 más por cada nivel.
  const jobTotal = nivel => 3 + 3 * (Math.max(1, num(nivel) || 1) - 1);

  /* ---------- Cálculo ---------- */
  function modsDe(S){
    const out = {};
    // tipo: de dónde viene (lo muestra la 🔍); itemId: para el PdG propio de cada arma.
    const push = (m, origen, tipo, itemId) => {
      if(!m || !m.stat) return;
      (out[m.stat] = out[m.stat] || []).push({val:num(m.val), origen, tipo, itemId});
    };
    (S.inventario || []).filter(i=>i.equipado).forEach(i => {
      if(itemRoto(i)) return;   // roto: ocupa el lugar pero no da ningún efecto
      (i.mods||[]).forEach(m => push(m, i.nombre, 'equipado', i.id));
      // Armadura rota de la pieza: cada punto baja 1 su Defensa (sin pasar de lo que la pieza da).
      const ar = esArmaduraItem(i) ? armRotaDe(i) : 0;
      if(ar > 0){
        const defPieza = (i.mods || []).filter(m => m.stat === 'def').reduce((a, m) => a + num(m.val), 0);
        const r = Math.min(ar, Math.max(0, defPieza));
        if(r > 0) push({stat: 'def', val: -r}, `${i.nombre} · Armadura rota ×${ar}`, 'equipado', i.id);
      }
    });
    (S.pasivas || []).forEach(p => {
      const compras = pasivaCompras(p);
      (p.mods||[]).forEach(m => push({stat:m.stat, val:num(m.val)*compras}, p.nombre + (compras>1 ? ' ×'+compras : ''), 'pasiva'));
    });
    (S.efectos || []).filter(e=>e.activo !== false).forEach(e => (e.mods||[]).forEach(m => {
      const stacks = Math.max(1, num(e.stacks) || 1);
      push({stat:m.stat, val:num(m.val)*stacks}, e.nombre + (stacks>1 ? ' ×'+stacks : ''), 'estado alterado');
    }));
    return out;
  }

  function evalFormula(expr, ctx){
    try{
      const keys = Object.keys(ctx);
      const fn = new Function(...keys, 'return ('+(expr||'0')+');');
      const v = fn(...keys.map(k=>ctx[k]));
      return Number.isFinite(v) ? v : NaN;
    }catch(e){ return NaN; }
  }

  function calcular(S){
    const mods = modsDe(S);
    const modTotal = {};
    MOD_TARGETS.forEach(s => modTotal[s.id] = (mods[s.id]||[]).reduce((a,b)=>a+b.val,0));

    const attrFinal = {};
    ATTR_LIST.forEach(a => attrFinal[a.id] = num(S.attrs[a.id]) + modTotal[a.id]);

    const ctx = {
      ...attrFinal,
      nivel:num(S.meta.nivel), job:jobTotal(S.meta.nivel),
      sobrecarga:0,
      floor:Math.floor, ceil:Math.ceil, round:Math.round,
      min:Math.min, max:Math.max, abs:Math.abs
    };
    STAT_LIST.forEach(s => ctx[s.id] = 0);

    const pesoEquipado = (S.inventario || []).filter(i=>i.equipado).reduce((a,i)=>a+num(i.peso),0);

    const base = {};
    for(let pass=0; pass<4; pass++){
      ctx.sobrecarga = Math.max(0, pesoEquipado - (ctx.crgmax||0));
      STAT_LIST.forEach(s => {
        const v = evalFormula(S.formulas[s.id], ctx);
        base[s.id] = Number.isNaN(v) ? NaN : v;
        ctx[s.id] = (Number.isNaN(v) ? 0 : v) + modTotal[s.id];
      });
    }

    const final = {};
    STAT_LIST.forEach(s => final[s.id] = Number.isNaN(base[s.id]) ? NaN : base[s.id] + modTotal[s.id]);
    ATTR_LIST.forEach(a => { base[a.id] = num(S.attrs[a.id]); final[a.id] = attrFinal[a.id]; });

    // Efectos activos que fuerzan/alteran un stat más allá de un modificador sumable.
    const efectosActivos = (S.efectos || []).filter(e => e.activo !== false);
    // No2 máximo con Cansado, Hypeado, Exhausto y Stun/forzados (topes): regla común de personajes, invocaciones y creeps.
    final.nitros = Combatiente.nitrosMax(final.nitros, efectosActivos);
    // Pajaritos y Lisiado ya no achican el stat: parten el RESULTADO de la tirada (ver mitadesDeTirada / tirarValorStat).
    // Inmovilizado y Rengo ya no tocan un stat: Movimiento se fundió en
    // Nitros, así que actúan al moverse (ver costoMoverCasillero).
    // Armadura arruinada se sacó (2026-09-21, repaso de debuffs): lo que la aplicaba pasó a sumar stacks de Armadura rota.

    return {base, mods, modTotal, final, pesoEquipado, sobrecarga:ctx.sobrecarga};
  }

  /* ---------- Iteración 2 — Nitros (No2) y SP: los costos (movido tal cual de ficha-personaje/js/01, 2026-10-01) ----------
     Lo marcado PLACEHOLDER está sin confirmar: se ajusta acá y en la pantalla de la ficha aparece con ⚠. */
  const IT2 = {
    // Costos confirmados.
    nitrosMover: 1,               // por casillero
    nitrosConsumirCinturon: 1,
    nitrosConsumirMochila: 2,
    nitrosHabilidad: 1,           // costo por defecto de una habilidad nueva
    nitrosSigilo: 1,              // entrar en sigilo (a revisar, P1)
    nitrosLevantarse: 1,          // pararse estando Sentado (decidido 2026-09-24)
    nitrosEquipar: 1,             // equipar o desequipar un ítem, solo en modo combate del mapa
    // PLACEHOLDER: equipo, estados y catálogo viejos que daban "+N Bonos"
    // pasan a dar "+N × esto" de SP.
    spPorBono: 1,
    // PLACEHOLDER: Tipo con el que se cobra un ataque sin arma equipada.
    tipoSinArma: 4,
    // (El costo de atacar —Tipo ÷ 2 para arriba el primero— pasó al motor común: Combatiente.costoAtaque, comun/combatiente.js.)
    // PLACEHOLDER: Rengo cobra esto por casillero; Inmovilizado no deja moverse.
    nitrosMoverRengo: 2,
    inmovilizadoBloqueaMover: true,
    // PLACEHOLDER: tope de X en costos variables. null = solo frena lo
    // disponible. Si se confirma, poner una función: c => c.final.esp
    limiteXNitros: null,
    limiteXSp: null,
    // PLACEHOLDER: penalidad por peso de más. Hoy no resta nada (antes
    // restaba de Bonos); se puede sumar en la fórmula de SP (clic en el stat → fx), ej. esp*3 - sobrecarga.
    penalidadSobrecargaDefinida: false,
  };

  return {IT2, GRUPOS, EXTRA, STAT_LIST, ATTR_LIST, MOD_TARGETS, STAT_LABEL, STAT_FULL, ES_ATTR,
    SLOT_MAP, slotDe, SLOTS_DURABLES, SLOTS_ARMADURA, durableItem, esArmaduraItem, durMax, durActual, itemRoto, armRotaDe,
    pasivaCompras, jobTotal, modsDe, evalFormula, calcular};
})();
