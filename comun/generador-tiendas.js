/* comun/generador-tiendas.js — GeneradorTiendas: la regla de cómo se arma una tienda (2026-10-06, rework del generador, docs/rework-tiendas.md).
   Funciones puras (sin pantalla ni Firebase): reciben el catálogo y devuelven ids. Las usan el generador de tiendas (generar, «🎲 Otro» y el
   simulador) y las pruebas.

   Dos perillas: el TAMAÑO (cuánto, cuánta variedad, cuánta escasez) y el NIVEL de la zona (qué calidades: Común ↔ niveles 1–2, Buena ↔ 3–4,
   Rara ↔ 5). Cada TIPO de tienda (Herrero, Ramos generales, Bazar arcano) es una RECETA de partes del cuerpo con su peso. Se garantiza una
   VARIEDAD de partes defensivas (al azar cuáles) y, en el Herrero, de familias de armas. Cada lugar tira su calidad con la tabla del nivel y
   tiene un GOLPE DE SUERTE (subir uno o dos escalones, la única vía de Excepcional y Legendario). La ESCASEZ limita, por tamaño, cuántos ítems
   con cada efecto sensible (Iniciativa, Evasión, Sigilo, rebajas de No2…) puede tener una tienda. Lo archivado y lo «solo botín» no sale. */
const GeneradorTiendas = (() => {
  const num = v => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
  const TIERS = ['Común', 'Buena Calidad', 'Raro', 'Excepcional', 'Legendario'];

  // Calidad por nivel de la zona: % de Común, Buena y Rara (dueño, 2026-10-06 ✅).
  const CALIDAD_POR_NIVEL = {1: [85, 15, 0], 2: [65, 33, 2], 3: [40, 55, 5], 4: [25, 60, 15], 5: [15, 45, 40]};
  // Golpe de suerte («toca toca, la suerte es loca», dueño): después de tirar la calidad, subir un escalón o dos. Ignora el techo del tamaño.
  const SUERTE = {uno: 0.04, dos: 0.005};

  /* Tamaños: ítems (sin el stock fijo), variedad de partes defensivas y de familias de armas garantizadas, tope por etiqueta de escasez (0,5 =
     cada etiqueta, 0 o 1 al azar), techo de calidad (índice: 1 = Buena) y escalones de nivel de más (la ciudad y la capital tienen algo mejor). */
  const TAMANOS = {
    ambulante: {label: 'Vendedor ambulante', min: 8, max: 12, variedad: 2, familias: 2, tope: 0.5, techo: 1, nivelExtra: 0},
    pueblito: {label: 'Pueblito', min: 15, max: 20, variedad: 3, familias: 3, tope: 1, techo: 1, nivelExtra: 0},
    aldea: {label: 'Aldea', min: 25, max: 35, variedad: 5, familias: 4, tope: 2, techo: null, nivelExtra: 0},
    ciudad: {label: 'Ciudad', min: 40, max: 60, variedad: 7, familias: 4, tope: 3, techo: null, nivelExtra: 1},
    capital: {label: 'Capital', min: 70, max: 100, variedad: 8, familias: 4, tope: 4, techo: null, nivelExtra: 1},
  };

  // Las partes (en qué parte de la receta cae cada ítem).
  const PARTE_LABEL = {arma: 'Armas', distancia: 'Armas a distancia', especial: 'Varitas y báculos', torso: 'Torso', escudo: 'Escudos', orbe: 'Orbes',
    cabeza: 'Cabeza', manos: 'Manos', piernas: 'Piernas', pies: 'Pies', cinturon: 'Cinturón', mochila: 'Mochila', anillo: 'Anillos',
    trampa: 'Trampas', consumible: 'Consumibles'};
  const DEFENSIVAS = ['torso', 'escudo', 'cabeza', 'manos', 'piernas', 'pies', 'cinturon', 'mochila'];
  function parteDe(it){
    const t = String((it && it.tipoItem) || '');
    if(t === 'consumibles' || (it && it.consumible)) return it.trampaDatos ? 'trampa' : 'consumible';
    if(t.startsWith('armadura')) return 'torso';   // (antes que las armas: «armadura» empieza con «arma»)
    if(t.startsWith('arma')) return it.especial ? 'especial' : it.armaDeRango ? 'distancia' : 'arma';
    if(t.startsWith('escudo')) return it.orbe ? 'orbe' : 'escudo';
    if(t === 'anillos') return 'anillo';
    return ['cabeza', 'manos', 'piernas', 'pies', 'cinturon', 'mochila'].includes(t) ? t : 'otro';
  }
  const mod = (it, st) => (it.mods || []).filter(m => m && m.stat === st).reduce((a, m) => a + num(m.val), 0);
  const algunMod = (it, lista) => lista.some(st => mod(it, st) > 0);
  // Piezas de caster (las que van al Bazar): las que suben lo del Especial y la magia.
  const CASTER = ['sp', 'spregen', 'resmg', 'pdgmg', 'dmgesp', 'rangocasteo', 'armadmg', 'ahorroespsp', 'pagarhp', 'meditar', 'resm'];
  const esDeCaster = it => algunMod(it, CASTER);
  // Cinturones de alquimia (también del Bazar): pociones, pergaminos, boticario, saque rápido.
  const esDeAlquimia = it => algunMod(it, ['ranurapocion', 'ranurapergamino', 'portapergaminos', 'boticario', 'saquerapido']);

  /* Recetas (peso de cada parte, en partes de 100). `filtro`: qué ítems de esa parte acepta este tipo. `minimos`: lugares que siempre van.
     `fijos`: el stock fijo (fuera del total; `desde` = el tamaño mínimo). La clave del Bazar sigue siendo 'alquimista' (tiendas guardadas). */
  const ORDEN_TAMANO = ['ambulante', 'pueblito', 'aldea', 'ciudad', 'capital'];
  const FIJOS = [{id: 'cat-pocion-hp'}, {id: 'cat-pocion-bonos'}, {id: 'cat-revive', desde: 'aldea'}];
  const TIPOS = {
    herrero: {label: 'Herrero', receta: {arma: 30, distancia: 8, torso: 16, escudo: 12, cabeza: 8, manos: 8, piernas: 6, pies: 6, cinturon: 3, mochila: 3},
      familias: true, fijos: []},
    ramos: {label: 'Ramos generales', receta: {arma: 15, distancia: 6, torso: 8, escudo: 5, cabeza: 6, manos: 6, piernas: 6, pies: 6, cinturon: 8, mochila: 8,
      trampa: 10, consumible: 16}, filtro: {consumible: it => !!it.legacy}, fijos: FIJOS},   // los consumibles de siempre
    alquimista: {label: 'Bazar arcano', receta: {consumible: 40, especial: 20, orbe: 8, anillo: 13, torso: 6, cabeza: 5, manos: 4, cinturon: 4},
      filtro: {torso: esDeCaster, cabeza: esDeCaster, manos: esDeCaster, cinturon: esDeAlquimia}, minimos: {especial: 2}, fijos: FIJOS},
  };
  const tipoDe = t => t === 'bazar' ? 'alquimista' : TIPOS[t] ? t : 'ramos';   // 'inicio' (viejo) = Ramos generales

  /* Escasez: las etiquetas de los efectos sensibles (se calculan de los bonos; no hay que cargar nada a mano). */
  const ETIQUETAS = {
    'Res. crítico Tipo 8': it => mod(it, 'tipo3') > 0,
    'Res. crítico Tipo 10 o 12': it => mod(it, 'tipo4') > 0 || mod(it, 'tipo5') > 0,
    'Evasión': it => mod(it, 'eva') > 0,
    'Iniciativa': it => mod(it, 'ini') > 0,
    'Sigilo': it => mod(it, 'sigilo') > 0,
    'Percepción': it => algunMod(it, ['percepcion', 'veoculto']),
    'Rebaja de No2': it => algunMod(it, ['pasosgratis', 'paradafacil', 'saquerapido', 'oporahorro', 'contraahorro', 'ahorroespsp', 'levantarse', 'pasamanos']) || !!it.oporGratis || num(it.ahorroNitros) > 0,
    'Chances': it => algunMod(it, ['retirada', 'reflejos', 'recuperarse', 'inamovible']),
    'Casteo': it => algunMod(it, ['pdgmg', 'dmgesp', 'spregen', 'rangocasteo']),
    'Crítico': it => algunMod(it, ['crit', 'critpot']) || num(it.critD20) > 0,
  };
  const etiquetasDe = it => Object.keys(ETIQUETAS).filter(k => ETIQUETAS[k](it));
  const publicable = it => !!it && !it.archivo && !it.soloBotin && TIERS.includes(it.tier);
  const familiaDe = it => num(it.tipoDado);

  function azarDe(o){ return (o && o.azar) || Math.random; }
  const entero = (R, a, b) => a + Math.floor(R() * (b - a + 1));
  function ponderado(R, pesos){
    const e = Object.entries(pesos).filter(([, p]) => p > 0);
    const tot = e.reduce((a, [, p]) => a + p, 0);
    let r = R() * tot;
    for(const [k, p] of e){ r -= p; if(r <= 0) return k; }
    return e.length ? e[e.length - 1][0] : null;
  }
  // La calidad de un lugar: la tabla del nivel (con el techo del tamaño) y el golpe de suerte. → índice en TIERS.
  function tirarCalidad(R, nivel, tam){
    const base = (CALIDAD_POR_NIVEL[nivel] || CALIDAD_POR_NIVEL[1]).slice();
    if(tam.techo !== null && tam.techo !== undefined) for(let i = tam.techo + 1; i < base.length; i++){ base[tam.techo] += base[i]; base[i] = 0; }
    let i = num(ponderado(R, Object.fromEntries(base.map((p, k) => [k, p]))));
    const s = R();
    if(s < SUERTE.dos) i += 2; else if(s < SUERTE.dos + SUERTE.uno) i += 1;
    return Math.min(TIERS.length - 1, i);
  }
  const nivelEfectivo = (nivel, tam) => Math.max(1, Math.min(5, Math.round(num(nivel) || 1) + num(tam.nivelExtra)));

  // Los candidatos de una parte para este tipo (publicables, con el filtro del tipo; si el filtro deja la parte vacía, sin filtro).
  function candidatosDe(catalogo, tipo, parte){
    const deParte = catalogo.filter(it => publicable(it) && parteDe(it) === parte);
    const f = tipo.filtro && tipo.filtro[parte];
    const filtrados = f ? deParte.filter(f) : deParte;
    return filtrados.length ? filtrados : deParte;
  }
  // Elige un ítem de la parte con la calidad pedida (o la más cercana: a igual distancia, la de abajo), sin repetir y respetando la escasez.
  function elegir(R, candidatos, tierIdx, usados, cabe, familia){
    const libres = candidatos.filter(it => !usados.has(it.id) && cabe(it) && (!familia || familiaDe(it) === familia));
    if(!libres.length) return familia ? elegir(R, candidatos, tierIdx, usados, cabe, 0) : null;
    const orden = TIERS.map((t, j) => ({t, d: Math.abs(j - tierIdx) * 2 + (j > tierIdx ? 1 : 0)})).sort((a, b) => a.d - b.d).map(x => x.t);
    for(const t of orden){
      const c = libres.filter(it => it.tier === t);
      if(c.length) return c[Math.floor(R() * c.length)];
    }
    return null;
  }
  // La escasez de una tienda: cuántos lleva de cada etiqueta y su tope (en el ambulante, 0 o 1 por etiqueta, al azar).
  function escasez(R, tam){
    const conteo = {}, topes = {};
    const tope = k => { if(!(k in topes)) topes[k] = tam.tope === 0.5 ? (R() < 0.5 ? 0 : 1) : tam.tope; return topes[k]; };
    return {
      cabe: it => etiquetasDe(it).every(k => (conteo[k] || 0) < tope(k)),
      sumar: it => etiquetasDe(it).forEach(k => { conteo[k] = (conteo[k] || 0) + 1; }),
      conteo,
    };
  }

  /* generar({tipo, tamano, nivel, catalogo, azar}) → {tipo, tamano, nivel, items: [ids], garantizados: [ids], plan: [{parte, id|null}]}.
     El stock fijo va primero y fuera del total. */
  function generar(o){
    const R = azarDe(o), cat = (o && o.catalogo) || [];
    const tipoK = tipoDe(o.tipo), tipo = TIPOS[tipoK];
    const tamK = TAMANOS[o.tamano] ? o.tamano : 'pueblito', tam = TAMANOS[tamK];
    const nivel = Math.max(1, Math.min(5, Math.round(num(o.nivel) || 1))), nivelEf = nivelEfectivo(nivel, tam);
    const porId = new Map(cat.map(it => [it.id, it]));
    const usados = new Set();
    const garantizados = (tipo.fijos || [])
      .filter(f => !f.desde || ORDEN_TAMANO.indexOf(tamK) >= ORDEN_TAMANO.indexOf(f.desde))
      .map(f => porId.get(f.id)).filter(it => it && !it.archivo);
    garantizados.forEach(it => usados.add(it.id));
    const total = entero(R, tam.min, tam.max);
    // El plan: primero lo garantizado (variedad de partes, familias, mínimos) y después el resto por peso.
    const plan = [];
    const defs = DEFENSIVAS.filter(p => num(tipo.receta[p]) > 0);
    const pesosDef = Object.fromEntries(defs.map(p => [p, tipo.receta[p]]));
    for(let i = 0; i < Math.min(tam.variedad, defs.length); i++){ const p = ponderado(R, pesosDef); plan.push({parte: p}); delete pesosDef[p]; }
    if(tipo.familias){
      const fams = [4, 6, 8, 10];
      for(let i = fams.length - 1; i > 0; i--){ const j = Math.floor(R() * (i + 1)); [fams[i], fams[j]] = [fams[j], fams[i]]; }
      fams.slice(0, tam.familias).forEach(f => plan.push({parte: 'arma', familia: f}));
    }
    Object.entries(tipo.minimos || {}).forEach(([p, n]) => { for(let i = 0; i < n; i++) plan.push({parte: p}); });
    while(plan.length < total) plan.push({parte: ponderado(R, tipo.receta)});
    const esc = escasez(R, tam);
    const cand = {};
    const elegidos = [];
    plan.slice(0, Math.max(total, plan.length)).forEach(lugar => {
      let parte = lugar.parte, item = null;
      for(let intento = 0; intento < 4 && !item; intento++){
        if(intento) parte = ponderado(R, tipo.receta);   // la parte se agotó: otra de la receta
        cand[parte] = cand[parte] || candidatosDe(cat, tipo, parte);
        item = elegir(R, cand[parte], tirarCalidad(R, nivelEf, tam), usados, esc.cabe, intento ? 0 : lugar.familia);
      }
      lugar.id = item ? item.id : null;
      if(!item) return;
      usados.add(item.id); esc.sumar(item); elegidos.push(item);
    });
    return {tipo: tipoK, tamano: tamK, nivel, items: [...garantizados, ...elegidos].map(it => it.id), garantizados: garantizados.map(it => it.id), plan, escasez: esc.conteo};
  }

  /* otro({tienda, id, catalogo, azar}) → el ítem que reemplaza al `id` en la tienda (la misma parte, una calidad nueva con el nivel de la tienda,
     respetando la escasez con el resto), o null. */
  function otro(o){
    const R = azarDe(o), cat = o.catalogo || [], t = o.tienda || {};
    const viejo = cat.find(it => it.id === o.id);
    if(!viejo) return null;
    const tipo = TIPOS[tipoDe(t.categoria || t.tipo)], tam = TAMANOS[t.tamano] || TAMANOS.pueblito;
    const usados = new Set(t.items || []);
    const esc = escasez(R, tam);
    (t.items || []).forEach(id => { const it = cat.find(x => x.id === id); if(it && id !== o.id) esc.sumar(it); });
    const nivelEf = nivelEfectivo(t.nivel || 2, tam);
    const tierIdx = t.tamano === 'personalizada' ? Math.max(0, TIERS.indexOf(viejo.tier)) : tirarCalidad(R, nivelEf, tam);
    return elegir(R, candidatosDe(cat, tipo, parteDe(viejo)), tierIdx, usados, esc.cabe, 0);
  }

  /* simular({tipo, tamano, nivel, catalogo, veces}) → promedios y peores casos de `veces` tiendas: por parte, por calidad, por etiqueta,
     partes defensivas distintas, y en cuántas tiendas aparece cada calidad. */
  function simular(o){
    const veces = Math.max(1, Math.round(num(o.veces) || 200));
    const cat = o.catalogo || [], porId = new Map(cat.map(it => [it.id, it]));
    const acc = {items: [], parte: {}, tier: {}, etiqueta: {}, defDistintas: [], conTier: {}};
    const sumar = (obj, k, v) => { (obj[k] = obj[k] || []).push(v); };
    for(let n = 0; n < veces; n++){
      const r = generar({...o, azar: o.azar});
      const its = r.items.map(id => porId.get(id)).filter(Boolean);
      acc.items.push(its.length);
      const cp = {}, ct = {}, ce = {};
      its.forEach(it => { cp[parteDe(it)] = (cp[parteDe(it)] || 0) + 1; ct[it.tier] = (ct[it.tier] || 0) + 1; etiquetasDe(it).forEach(k => { ce[k] = (ce[k] || 0) + 1; }); });
      Object.keys(PARTE_LABEL).forEach(p => sumar(acc.parte, p, cp[p] || 0));
      TIERS.forEach(t => { sumar(acc.tier, t, ct[t] || 0); acc.conTier[t] = (acc.conTier[t] || 0) + (ct[t] ? 1 : 0); });
      Object.keys(ETIQUETAS).forEach(k => sumar(acc.etiqueta, k, ce[k] || 0));
      acc.defDistintas.push(DEFENSIVAS.filter(p => cp[p]).length);
    }
    const res = a => ({prom: Math.round(a.reduce((x, y) => x + y, 0) / a.length * 10) / 10, min: Math.min(...a), max: Math.max(...a)});
    const map = obj => Object.fromEntries(Object.entries(obj).map(([k, a]) => [k, res(a)]));
    return {veces, items: res(acc.items), parte: map(acc.parte), tier: map(acc.tier), etiqueta: map(acc.etiqueta), defDistintas: res(acc.defDistintas),
      conTier: Object.fromEntries(TIERS.map(t => [t, Math.round(100 * (acc.conTier[t] || 0) / veces)]))};
  }

  return {TIERS, CALIDAD_POR_NIVEL, SUERTE, TAMANOS, TIPOS, PARTE_LABEL, DEFENSIVAS, ETIQUETAS, parteDe, etiquetasDe, esDeCaster, publicable, tipoDe,
    tirarCalidad, nivelEfectivo, generar, otro, simular};
})();
