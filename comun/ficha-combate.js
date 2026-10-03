/* =========================================================
   FICHA-COMBATE — el combate de un personaje, fuera de la ficha (paso 5, nivel B, área 2 de docs/plan-paso5.md, 2026-10-01)
   Lo que antes vivía adentro de ficha-personaje (js/02 y js/11): qué tiene en cada mano, con qué puede atacar y parriar,
   el PdG y los stats de cada arma (sin los bonos de la otra), el valor del Bloqueo, el alcance, el daño, lo que cuesta atacar y
   el conteo de ataques del turno. Mismas reglas de siempre, pero reciben la ficha (`S`) en vez de leerla de una variable
   global: las puede usar cualquier pantalla que tenga los datos de un personaje. Lo que muestra cosas (carteles, la Mesa, la
   Botonera) sigue en la ficha. Necesita comun/ficha-calculo.js, comun/combatiente.js y comun/tiradas.js (formulaParaValor).
   ========================================================= */
const FichaCombate = (() => {
  const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
  const fmt = n => Number.isInteger(n) ? n : Math.round(n * 100) / 100;
  const TIPO_SIN_ARMA = 4;   // el Tipo de un ataque sin arma (IT2.tipoSinArma)
  const calc = (S, c) => c || FichaCalculo.calcular(S);

  /* ---------- Qué hay en las manos ---------- */
  const esArma = tipoItem => tipoItem === 'arma_1m' || tipoItem === 'arma_2m';
  const esMano = tipoItem => ['arma_1m', 'arma_2m', 'escudo_1m', 'escudo_2m'].includes(tipoItem);
  // A qué mano va cada arma o escudo equipado (1 o 2): el de dos manos ocupa la 1; si no, la mano preferida de cada uno.
  function asignarManos(S){
    const enManos = (S.inventario || []).filter(i => i.equipado && esMano(i.tipoItem));
    const dosManos = enManos.find(a => a.tipoItem === 'arma_2m' || a.tipoItem === 'escudo_2m');
    const unaMano = enManos.filter(a => a.tipoItem === 'arma_1m' || a.tipoItem === 'escudo_1m');
    const mapa = new Map();
    if(dosManos){
      mapa.set(dosManos.id, 1);
      const otro = unaMano[0];
      if(otro) mapa.set(otro.id, 2);
    }else{
      const pref1 = unaMano.find(a => String(a.manoPreferida) === '1');
      const pref2 = unaMano.find(a => String(a.manoPreferida) === '2' && a !== pref1);
      const resto = unaMano.filter(a => a !== pref1 && a !== pref2);
      const m1 = pref1 || resto.shift() || null;
      const m2 = pref2 || resto.shift() || null;
      if(m1) mapa.set(m1.id, 1);
      if(m2) mapa.set(m2.id, 2);
    }
    return mapa;
  }
  // El daño de un arma ("2d8 + 3"): dados = Peso (+ amplificado), caras = Tipo, fijo = el del arma + el `extra` (Dmg) si no es de rango.
  function armaDanoTxt(i, extra){
    if(!esArma(i.tipoItem)) return '';
    const dados = Math.max(1, num(i.peso) || 1) + Math.max(0, num(i.danoAmplificado));
    const tipo = num(i.tipoDado) || 8;
    const fijo = num(i.danoFijo) + (i.armaDeRango ? 0 : num(extra));
    return `${dados}d${tipo}${fijo ? ` + ${fmt(fijo)}` : ''}`;
  }
  // Con qué puede atacar (armas con daño, no rotas), por mano.
  function armasEquipadasConDano(S){
    const manos = asignarManos(S);
    return (S.inventario || [])
      .filter(i => i.equipado && !FichaCalculo.itemRoto(i) && esMano(i.tipoItem) && armaDanoTxt(i))
      .map(i => ({item: i, mano: manos.get(i.id) || null}))
      .sort((a, b) => (a.mano || 99) - (b.mano || 99));
  }
  // Con qué puede parriar: cualquier arma o escudo equipado (no roto), tenga o no daño.
  function armasYEscudosParaParry(S){
    const manos = asignarManos(S);
    return (S.inventario || [])
      .filter(i => i.equipado && !FichaCalculo.itemRoto(i) && esMano(i.tipoItem))
      .map(i => ({item: i, mano: manos.get(i.id) || null}))
      .sort((a, b) => (a.mano || 99) - (b.mano || 99));
  }

  /* ---------- Los stats de cada arma ---------- */
  const esArmaEnMano = (S, id) => (S.inventario || []).some(i => i.id === id && i.equipado && esMano(i.tipoItem) && esArma(i.tipoItem));
  const esEnMano = (S, id) => (S.inventario || []).some(i => i.id === id && i.equipado && esMano(i.tipoItem));
  // PdG al atacar con un arma: no cuentan los bonos de PdG que vienen de OTRA arma equipada.
  function pdgParaArma(S, arma, c){
    c = calc(S, c);
    const excluidos = (c.mods.pdg || []).filter(m => m.itemId && m.itemId !== (arma && arma.id) && esArmaEnMano(S, m.itemId));
    if(!excluidos.length || Number.isNaN(c.final.pdg)) return {valor: c.final.pdg, excluidos: []};
    return {valor: c.base.pdg + c.modTotal.pdg - excluidos.reduce((a, m) => a + m.val, 0), excluidos};
  }
  // El valor de un stat usando ESA arma: no cuentan los bonos de otra arma; para Parry y Bloqueo, tampoco los de un escudo que
  // no es con el que se para (P129, "cada uno con lo suyo").
  const STATS_DEFENSA_POR_ITEM = ['parry', 'bloqueo'];
  function statParaArma(S, statId, arma, c){
    c = calc(S, c);
    const deOtro = STATS_DEFENSA_POR_ITEM.includes(statId) ? id => esEnMano(S, id) : id => esArmaEnMano(S, id);
    const excluidos = (c.mods[statId] || []).filter(m => m.itemId && m.itemId !== (arma && arma.id) && deOtro(m.itemId));
    if(!excluidos.length || Number.isNaN(c.final[statId])) return c.final[statId];
    return c.base[statId] + c.modTotal[statId] - excluidos.reduce((a, m) => a + m.val, 0);
  }
  // El Bloqueo: tu Bloqueo (de Fuerza, con su equipo) MÁS el peso del arma o escudo; esa suma es el dado.
  const bloqueoValor = (S, arma, c) => statParaArma(S, 'bloqueo', arma, c) + (arma ? num(arma.peso) : 0);
  // Hasta dónde llega: de rango, su Rango (mínimo 1); cuerpo a cuerpo, 1 + lo que el arma sume al Rango.
  function alcanceDeArma(S, arma, c){
    if(arma && arma.armaDeRango){ const v = statParaArma(S, 'rng', arma, c); return Number.isNaN(v) ? 0 : Math.max(1, Math.round(v)); }
    const bono = arma ? (arma.mods || []).filter(m => m.stat === 'rng').reduce((a, m) => a + num(m.val), 0) : 0;
    return 1 + Math.max(0, Math.round(bono));
  }
  // Lo que se muestra en los botones de combate: la fórmula de cada tirada (con las mitades de Pajaritos/Lisiado…).
  function formulasCombate(S, c){
    c = calc(S, c);
    const fPdg = formulaParaValor(c.final.pdg), fEva = formulaParaValor(c.final.eva), fParry = formulaParaValor(c.final.parry), fBloqueo = formulaParaValor(c.final.bloqueo);
    const armas = (S.inventario || []).filter(i => i.equipado && esMano(i.tipoItem) && esArma(i.tipoItem));
    const danio = armas.length === 1 ? armaDanoTxt(armas[0], c.final.dmg) : armas.length > 1 ? 'elegís arma' : 'sin arma equipada';
    const conMit = (f, id) => f ? f.formula + ' ÷2'.repeat(Combatiente.mitadesDeTirada(S.efectos, id)) : '';
    return {pdg: conMit(fPdg, 'pdg'), eva: conMit(fEva, 'eva'), parry: conMit(fParry, 'parry'), bloqueo: fBloqueo ? fBloqueo.formula : '', danio};
  }

  /* ---------- Atacar: cada arma paga su primer ataque del turno (regla del motor común) ---------- */
  const claveAtaque = arma => arma ? arma.id : 'sin-arma';
  const tipoAtaque = arma => arma ? (num(arma.tipoDado) || 8) : TIPO_SIN_ARMA;
  // El daño de un ataque sin arma (provisorio, P150): 1 dado del Tipo sin arma + Dmg. Antes no había, y el duelo quedaba «Tirando…».
  const danoSinArmaTxt = dmg => `1d${TIPO_SIN_ARMA}${num(dmg) ? ` + ${fmt(num(dmg))}` : ''}`;
  const ataquesConArma = (S, arma) => num((S.ataquesArma || {})[claveAtaque(arma)]);
  const costoAtaque = (S, arma) => Combatiente.costoConAhorro(Combatiente.costoAtaque(tipoAtaque(arma), ataquesConArma(S, arma)), arma, ataquesConArma(S, arma));   // − ahorroNitros del arma en el primero
  // Ataque de oportunidad y contraataque: siempre lo de un primer ataque, y no cuentan como ataque del turno (oportunidad: gratis si el arma es oporGratis).
  const costoAtaqueEspecial = (arma, tipo) => Combatiente.costoEspecial(tipoAtaque(arma), arma, tipo);
  // Cuenta un ataque con esa arma (el próximo ya paga el Tipo completo). Devuelve si era el primero con ella.
  function registrarAtaque(S, arma){
    const primero = ataquesConArma(S, arma) === 0;
    S.ataquesTurno = num(S.ataquesTurno) + 1;
    S.ataquesArma = {...(S.ataquesArma || {}), [claveAtaque(arma)]: ataquesConArma(S, arma) + 1};
    return primero;
  }

  return {TIPO_SIN_ARMA, danoSinArmaTxt, esArma, esMano, asignarManos, armaDanoTxt, armasEquipadasConDano, armasYEscudosParaParry,
    esArmaEnMano, esEnMano, pdgParaArma, STATS_DEFENSA_POR_ITEM, statParaArma, bloqueoValor, alcanceDeArma, formulasCombate,
    claveAtaque, tipoAtaque, ataquesConArma, costoAtaque, costoAtaqueEspecial, registrarAtaque};
})();
