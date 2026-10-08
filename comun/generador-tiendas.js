/* comun/generador-tiendas.js — GeneradorTiendas: la regla de cómo se arma una tienda (2026-10-06, rework del generador, docs/rework-tiendas.md).
   Funciones puras (sin pantalla ni Firebase): reciben el catálogo y devuelven ids. Las usan el generador de tiendas (generar, «🎲 Otro» y el
   simulador) y las pruebas.

   Dos perillas: el TAMAÑO (cuánto, cuánta variedad, cuánta escasez) y el NIVEL de la zona (qué calidades: Común ↔ niveles 1–2, Buena ↔ 3–4,
   Rara ↔ 5). Una tienda tiene hasta tres SECCIONES (P179, dueño 2026-10-08: «una tienda, tres habitaciones»): ⚒ Herrería, 🧵 Talabartería
   y ✨ Bazar arcano; cada una es una RECETA de partes del cuerpo con su peso, y cada ítem sabe solo a qué sección va (`seccionDe`). Se garantiza una
   VARIEDAD de partes defensivas (al azar cuáles) y, en el Herrero, de familias de armas. Cada lugar tira su calidad con la tabla del nivel y
   tiene un GOLPE DE SUERTE (subir uno o dos escalones, la única vía de Excepcional y Legendario). La ESCASEZ limita, por tamaño, cuántos ítems
   con cada efecto sensible (Iniciativa, Evasión, Sigilo, rebajas de No2…) puede tener una tienda. Lo archivado y lo «solo botín» no sale. */
const GeneradorTiendas = (() => {
  const num = v => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
  const TIERS = ['Común', 'Buena Calidad', 'Raro', 'Excepcional', 'Legendario'];

  // Calidad por nivel de la zona: % de Común, Buena y Rara (dueño, 2026-10-06 ✅).
  const CALIDAD_POR_NIVEL = {1: [85, 15, 0], 2: [65, 33, 2], 3: [40, 55, 5], 4: [25, 60, 15], 5: [15, 45, 40]};
  // Golpe de suerte («toca toca, la suerte es loca», dueño): después de tirar la calidad, subir un escalón o dos. En cualquier tamaño.
  const SUERTE = {uno: 0.04, dos: 0.005};

  /* Tamaños: ítems (sin el stock fijo), variedad de partes defensivas y de familias de armas garantizadas y tope por etiqueta de escasez (0,5 =
     cada etiqueta, 0 o 1 al azar) y la reserva de reposiciones (cuántas veces repone lo que se compra, 2026-10-07). La calidad NO depende del tamaño, solo del nivel (dueño, 2026-10-07: «variables independientes»: un pueblito
     puede tener cosas buenas, pero pocas). */
  const TAMANOS = {
    ambulante: {label: 'Vendedor ambulante', min: 8, max: 12, variedad: 2, familias: 2, tope: 0.5, reserva: 3},
    pueblito: {label: 'Pueblito', min: 15, max: 20, variedad: 3, familias: 3, tope: 1, reserva: 6},
    aldea: {label: 'Aldea', min: 25, max: 35, variedad: 5, familias: 4, tope: 2, reserva: 10},
    ciudad: {label: 'Ciudad', min: 40, max: 60, variedad: 7, familias: 4, tope: 3, reserva: 16},
    capital: {label: 'Capital', min: 70, max: 100, variedad: 8, familias: 4, tope: 4, reserva: 28},
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
  const CASTER = ['sp', 'spregen', 'resmg', 'pdgmg', 'dmgesp', 'armadmg', 'ahorroespsp', 'pagarhp', 'meditar', 'resm'];
  const esDeCaster = it => algunMod(it, CASTER);
  // Cinturones de alquimia (también del Bazar): pociones, pergaminos, boticario, saque rápido.
  const esDeAlquimia = it => algunMod(it, ['ranurapocion', 'ranurapergamino', 'portapergaminos', 'boticario', 'saquerapido']);

  /* Las secciones (P179, dueño 2026-10-08: «una tienda tres habitaciones: una más de guerra pesada, una más talabartería y otra de bazar
     arcano… para que los personajes que tienen un estilo claro sepan dónde tienen que ir a buscar»). El jugador entra a una sola tienda y ve
     una pestaña por sección. Cada RECETA = peso de cada parte (partes de 100); `familias`: los Tipos de arma garantizados; `minimos`: lugares
     que siempre van. */
  /* Los clásicos (dueño, 2026-10-08: «cualquier tienda debía garantizar ciertos ítems esenciales… algunos son simplemente un clásico de nuestro
     juego, como la moneda y la polilla»): todo lo marcado `legacy` en el catálogo (pociones de HP, SP y Regeneración, Antídoto, Vendas, Cura Plus,
     Revive, Moneda Re-Roll, Polilla mística, Ankh) hasta Raro, en TODA tienda, de cualquier tamaño y con las secciones que sean. Es el stock fijo:
     fuera del total, no se agota (no son piezas únicas) y va en la pestaña del Bazar (son consumibles). Para sumar o sacar un clásico: la marca
     `legacy` del ítem (el editor del catálogo). */
  const clasicos = catalogo => catalogo.filter(it => it && it.legacy && !it.archivo && !it.soloBotin && TIERS.indexOf(it.tier) >= 0 && TIERS.indexOf(it.tier) <= 2);
  const SECCIONES = {
    herreria: {label: 'Herrería', icono: '⚒', detalle: 'guerra pesada: armas de Tipo 6 o más, escudos, armadura rígida, cascos y guanteletes',
      receta: {arma: 40, escudo: 14, torso: 16, cabeza: 12, manos: 10, piernas: 4, pies: 4}, familias: [6, 8, 10]},
    talabarteria: {label: 'Talabartería', icono: '🧵', detalle: 'cuero, madera y cuerda: armas a distancia y livianas (Tipo 4), cuero, botas, cinturones, mochilas y trampas',
      receta: {distancia: 22, arma: 14, torso: 12, cabeza: 6, manos: 6, piernas: 8, pies: 8, cinturon: 8, mochila: 8, trampa: 8}, familias: [4]},
    bazar: {label: 'Bazar arcano', icono: '✨', detalle: 'lo mágico: consumibles, varitas y báculos, orbes, anillos y piezas de caster',
      receta: {consumible: 40, especial: 20, orbe: 8, anillo: 13, torso: 6, cabeza: 5, manos: 4, cinturon: 4}, minimos: {especial: 2}},
  };
  const SECCIONES_ORDEN = ['herreria', 'talabarteria', 'bazar'];
  // Lo que suma Destreza/Agilidad (la Talabartería) y lo que suma Fuerza/Constitución (la Herrería), para las piezas que podrían ir en las dos.
  const DE_DESTREZA = ['eva', 'sigilo', 'percepcion', 'veoculto', 'ini', 'des', 'agl', 'pasosgratis', 'rng', 'pdgdist', 'pdgt4', 'pdgt6', 'retirada', 'reflejos',
    'levitar', 'pasodoble', 'trampaoculta', 'soltarse', 'crit', 'oporahorro', 'saquerapido'];
  const DE_FUERZA = ['def', 'fue', 'con', 'bloqueo', 'parry', 'hp', 'hpmax', 'pdgt8', 'pdgt10', 'inamovible', 'guardian', 'dmg', 'tipo1', 'tipo2', 'tipo3', 'tipo4',
    'tipo5', 'paradafacil', 'escolta', 'embestida', 'critpot', 'contraahorro'];
  const suma = (it, lista) => lista.reduce((a, st) => a + Math.max(0, mod(it, st)), 0);
  /* A qué sección va un ítem (siempre la misma: así la tienda publicada no guarda nada nuevo y lo que se repone cae en la misma pestaña).
     Lo mágico al Bazar; trampas, armas a distancia, mochilas y lo suelto a la Talabartería; las armas, por su Tipo (Tipo 4 livianas → Talabartería;
     6 o más → Herrería, dueño 2026-10-08); los escudos a la Herrería; las armaduras, por lo que más dan (Defensa especial → Bazar, como dijo el
     dueño el 2026-10-07; las que dan las dos defensas por igual → Talabartería, dueño 2026-10-08; el torso rígido a la Herrería y el blando a la
     Talabartería; el resto, Fuerza contra Destreza). */
  const seccionCache = new WeakMap();
  function seccionDe(it){
    if(!it || typeof it !== 'object') return 'talabarteria';
    let r = seccionCache.get(it);
    if(!r){ r = seccionCalc(it); seccionCache.set(it, r); }
    return r;
  }
  function seccionCalc(it){
    const p = parteDe(it);
    if(p === 'especial' || p === 'orbe' || p === 'anillo' || p === 'consumible') return 'bazar';
    if(p === 'trampa' || p === 'distancia' || p === 'mochila' || p === 'otro') return 'talabarteria';
    if(p === 'arma') return num(it.tipoDado) <= 4 ? 'talabarteria' : 'herreria';
    if(p === 'escudo') return 'herreria';
    if(p === 'cinturon') return esDeAlquimia(it) || esDeCaster(it) ? 'bazar' : 'talabarteria';
    const def = mod(it, 'def'), esp = mod(it, 'armadmg');
    if(esp > def || (def <= 0 && esDeCaster(it))) return 'bazar';
    if(def > 0 && esp === def) return 'talabarteria';   // las dos defensas por igual
    if(p === 'torso') return it.tipoItem === 'armadura_rigida' ? 'herreria' : 'talabarteria';
    const fue = suma(it, DE_FUERZA), des = suma(it, DE_DESTREZA);
    return des > fue ? 'talabarteria' : fue > 0 ? 'herreria' : 'talabarteria';
  }
  // Qué secciones abre una tienda: las que eligió el GM (`secciones`), o las de su tipo viejo (Herrero → Herrería, Bazar → Bazar, Ramos → las tres).
  function seccionesDe(o){
    const lista = o && Array.isArray(o.secciones) ? o.secciones.filter(s => SECCIONES[s]) : [];
    if(lista.length) return SECCIONES_ORDEN.filter(s => lista.includes(s));
    const t = String((o && (o.tipo || o.categoria)) || '');
    return t === 'herrero' ? ['herreria'] : t === 'alquimista' || t === 'bazar' ? ['bazar'] : SECCIONES_ORDEN.slice();
  }

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
    'Casteo': it => algunMod(it, ['pdgmg', 'dmgesp', 'spregen']),
    // El Crítico propio de un arma de Tipo 4 no cuenta (dueño, 2026-10-07: es su identidad — el jugador de Destreza con armas de Tipo bajo vive
    // del crítico); el de las armas de otros Tipos y el de todo lo que no es arma, sí.
    'Crítico': it => !esArmaT4(it) && (algunMod(it, ['crit', 'critpot']) || num(it.critD20) > 0),
  };
  function esArmaT4(it){ const p = parteDe(it); return (p === 'arma' || p === 'distancia') && num(it.tipoDado) === 4; }
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
  // La calidad de un lugar: la tabla del nivel y el golpe de suerte. → índice en TIERS.
  function tirarCalidad(R, nivel){
    const base = (CALIDAD_POR_NIVEL[nivel] || CALIDAD_POR_NIVEL[1]).slice();
    let i = num(ponderado(R, Object.fromEntries(base.map((p, k) => [k, p]))));
    const s = R();
    if(s < SUERTE.dos) i += 2; else if(s < SUERTE.dos + SUERTE.uno) i += 1;
    return Math.min(TIERS.length - 1, i);
  }
  const nivelDe = nivel => Math.max(1, Math.min(5, Math.round(num(nivel) || 1)));

  // Los candidatos de una parte en esta sección (publicables y de esa sección).
  // (memo: el mismo catálogo, la misma sección y la misma parte dan la misma lista; se arma una vez por catálogo)
  const candCache = new WeakMap();
  function candidatosDe(catalogo, secK, parte){
    let m = candCache.get(catalogo);
    if(!m){ m = new Map(); candCache.set(catalogo, m); }
    const k = secK + '|' + parte + '|' + catalogo.length;   // (con el largo: si se le suma un ítem, se rearma)
    if(!m.has(k)) m.set(k, catalogo.filter(it => publicable(it) && parteDe(it) === parte && seccionDe(it) === secK));
    return m.get(k);
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

  /* generar({secciones, tamano, nivel, catalogo, azar}) → {secciones, tamano, nivel, items: [ids], garantizados: [ids], plan: [{seccion, parte, id|null}]}.
     (`tipo` viejo también sirve: Herrero, Bazar o Ramos.) El total del tamaño se reparte entre las secciones abiertas; la variedad de partes
     defensivas, también. La escasez es de toda la tienda. El stock fijo va primero y fuera del total. */
  function generar(o){
    const R = azarDe(o), cat = (o && o.catalogo) || [];
    const secs = seccionesDe(o);
    const tamK = TAMANOS[o.tamano] ? o.tamano : 'pueblito', tam = TAMANOS[tamK];
    const nivel = nivelDe(o.nivel);
    const usados = new Set();
    const garantizados = clasicos(cat);   // los clásicos, siempre
    garantizados.forEach(it => usados.add(it.id));
    const total = entero(R, tam.min, tam.max);
    // Partes iguales; lo que sobra, al azar.
    const cuota = secs.map(() => Math.floor(total / secs.length));
    const sobra = total - cuota.reduce((a, b) => a + b, 0);
    for(let i = 0; i < sobra; i++) cuota[Math.floor(R() * secs.length)]++;
    const variedad = Math.max(1, Math.round(tam.variedad / secs.length));
    const esc = escasez(R, tam);
    const plan = [], elegidos = [];
    secs.forEach((k, si) => {
      const sec = SECCIONES[k], receta = sec.receta, planS = [];
      // Primero lo garantizado (variedad de partes, familias, mínimos) y después el resto por peso.
      const defs = DEFENSIVAS.filter(p => num(receta[p]) > 0);
      const pesosDef = Object.fromEntries(defs.map(p => [p, receta[p]]));
      for(let i = 0; i < Math.min(variedad, defs.length); i++){ const p = ponderado(R, pesosDef); planS.push({seccion: k, parte: p}); delete pesosDef[p]; }
      if(sec.familias){
        const fams = sec.familias.slice();
        for(let i = fams.length - 1; i > 0; i--){ const j = Math.floor(R() * (i + 1)); [fams[i], fams[j]] = [fams[j], fams[i]]; }
        fams.slice(0, Math.min(fams.length, tam.familias)).forEach(f => planS.push({seccion: k, parte: 'arma', familia: f}));
      }
      Object.entries(sec.minimos || {}).forEach(([p, n]) => { for(let i = 0; i < n; i++) planS.push({seccion: k, parte: p}); });
      while(planS.length < cuota[si]) planS.push({seccion: k, parte: ponderado(R, receta)});
      planS.forEach(lugar => {
        let parte = lugar.parte, item = null;
        for(let intento = 0; intento < 4 && !item; intento++){
          if(intento) parte = ponderado(R, receta);   // la parte se agotó (o no tiene nada de esta sección): otra de la receta
          item = elegir(R, candidatosDe(cat, k, parte), tirarCalidad(R, nivel), usados, esc.cabe, intento ? 0 : lugar.familia);
        }
        lugar.id = item ? item.id : null;
        plan.push(lugar);
        if(!item) return;
        usados.add(item.id); esc.sumar(item); elegidos.push(item);
      });
    });
    return {secciones: secs, tamano: tamK, nivel, items: [...garantizados, ...elegidos].map(it => it.id), garantizados: garantizados.map(it => it.id), plan, escasez: esc.conteo};
  }

  /* otro({tienda, id, catalogo, azar, reponer}) → el ítem que reemplaza al `id` en la tienda, o null. Sin `reponer` («🎲 Otro» del GM): la misma
     parte, una calidad nueva con el nivel de la tienda. Con `reponer` (alguien lo compró, 2026-10-07, dueño: «un casco por otro, un arma de
     Tipo 6 por otra de Tipo 6»): la misma parte, la misma familia (el Tipo de un arma; blando o rígido en el torso) y la misma calidad. Las dos
     respetan la escasez con el resto de la tienda y no repiten lo que ya está. */
  const familiaRepo = it => parteDe(it) === 'arma' || parteDe(it) === 'distancia' ? 'T' + num(it.tipoDado) : parteDe(it) === 'torso' ? it.tipoItem : '';
  function otro(o){
    const R = azarDe(o), cat = o.catalogo || [], t = o.tienda || {};
    const viejo = o.viejo || cat.find(it => it.id === o.id);
    if(!viejo) return null;
    const tam = TAMANOS[t.tamano] || TAMANOS.pueblito;
    const usados = new Set([...(t.items || []), viejo.id]);
    const esc = escasez(R, tam);
    (t.items || []).forEach(id => { const it = cat.find(x => x.id === id); if(it && id !== viejo.id) esc.sumar(it); });
    let cands = candidatosDe(cat, seccionDe(viejo), parteDe(viejo));   // de la misma sección (la misma pestaña)
    if(o.reponer){
      const fam = familiaRepo(viejo);
      cands = cands.filter(it => it.tier === viejo.tier && familiaRepo(it) === fam);
      return elegir(R, cands, TIERS.indexOf(viejo.tier), usados, esc.cabe, 0);
    }
    const tierIdx = t.tamano === 'personalizada' ? Math.max(0, TIERS.indexOf(viejo.tier)) : tirarCalidad(R, nivelDe(t.nivel || 2));
    return elegir(R, cands, tierIdx, usados, esc.cabe, 0);
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

  // Cuántas veces repone una tienda publicada lo que le compran (una personalizada, como una aldea).
  const reservaDe = tamano => (TAMANOS[tamano] || TAMANOS.aldea).reserva;

  return {reservaDe, clasicos, TIERS, CALIDAD_POR_NIVEL, SUERTE, TAMANOS, SECCIONES, SECCIONES_ORDEN, seccionDe, seccionesDe, PARTE_LABEL, DEFENSIVAS, ETIQUETAS, parteDe, etiquetasDe, esDeCaster, publicable,
    tirarCalidad, nivelDe, generar, otro, simular};
})();
