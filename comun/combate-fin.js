/* =========================================================
   COMBATE-FIN — el fin del combate del GM: el reporte «Batalla terminada» (XP, oro, despojos, quién cobra) y el botín para
   despojar (2026-10-02, hoja de ruta A6a)
   Copiado tal cual de gm-toolset/js/08 (todo el reporte y publicarRecompensas) y js/09 (renderBotinGM, despojarBotin). Lo que
   en GM Tools era una variable suelta (combateRep, xpContarEscapados, botinGM) ahora es un estado que se pasa (`rep`, `st`), así
   lo usan igual GM Tools y el mapa del GM.
   - nuevo() → rep: el estado del reporte. contarEscapados vive adentro (antes xpContarEscapados).
   - generar(rep, creeps, cat) → {filas, xpTotal}; calcularReparto(rep, r); itemsPublicables(rep, r). `creeps` = los creeps de la
     partida (forma de GM Tools), `cat` = el catálogo en la forma del equipo de un creep (itemParaCreep).
   - creepsEnMapa() → Set de los creeps con token en el mapa publicado; jugadores(previos) → los personajes con su estado.
   - vista(rep, creeps, cat) → {html, publicar: 'oculto'|'activo'|'inactivo', faltanJugadores}: el cuerpo de la ventana.
   - cambio(rep, t) / clic(rep, b, raiz, creeps, cat): lo que hacen sus controles (data-rep-*), → true | {ver: ítem} | {toast}.
   - publicar(rep, {creeps, cat, combateActual, confirmar, alEmpezar}) → null (canceló) | {error} | {ok, items, filas}.
   - Botín: nuevoBotin() → st; botinVista(st) → {html, boton}; botinCambio(st, t); botinItem(st, id); jugadoresBotin();
     despojar(st, {combateActual, confirmar, alEmpezar}) → null | {error} | {ok, mensaje}.
   - lineaVerde(origen, formula): la línea verde de la Mesa (desde 'recompensa').
   Las ventanas (dónde se muestran, Ver de un ítem, toasts, marcar los creeps recompensados) las pone cada pantalla.
   Necesita sesion.js (fbDb, fbRutaCampana, fbUsuario, fbMiembro), creep-calculo.js e items-subidos.js (sinAviso).
   ========================================================= */
const CombateFin = (() => {
  const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
  const fmt = n => Number.isInteger(n) ? n : Math.round(n*100)/100;
  const esc = s => String(s??'').replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
  const K = CreepCalculo;

  // XP base por nivel: 40 × nivel, más un bonus escalonado que crece con
  // el nivel (progresión triangular: 5 × nivel × (nivel-1)). Da 40/90/150
  // para nivel 1/2/3 — coincide con el ejemplo original. Para nivel 4 da
  // 220 en vez de los 200 del ejemplo (que no encajaba con la progresión
  // de los niveles anteriores); queda para ajustar junto con el resto
  // del sistema de recompensas en una próxima iteración.
  function xpBasePorNivel(nivel){
    const n = Math.max(1, num(nivel) || 1);
    return 40 * n + 5 * n * (n - 1);
  }
  // XP que da un creep que escapó, sobre la que daría derrotado.
  const XP_ESCAPO_PCT = 0.2;
  const FACTOR_XP_ESTADO = {'en pie': 1, inconsciente: 0.25, muerto: 0};

  /* ---------- Reporte del combate: XP, oro, ítems y jugadores; se publica a las fichas ----------
     El GM revisa y ajusta (ítems, XP, oro, quién cobra) y publica: cada jugador recibe su XP y su oro solos en la
     ficha (campanas/<id>/recompensas) y los ítems quedan en el botín para tomarlos (campanas/<id>/botin). */
  function nuevo(){ return {oro: {}, drops: {}, extra: {}, xpPorJugador: null, ddePorJugador: null, quitados: new Set(), extras: [], jugadores: null, cargando: false, publicando: false, enMapa: null, contarEscapados: true}; }

  /* Solo cuentan para la recompensa los creeps que tienen un token vinculado en el MAPA PUBLICADO (el que ven los jugadores):
     puede haber muchos creeps armados de antemano que no están en la pelea. Devuelve el Set de sus ids. */
  async function creepsEnMapa(){
    const act = await fbDb.doc(fbRutaCampana('mapa/activo')).get();
    const mapaId = act.exists && act.data().mapaId ? act.data().mapaId : '_principal';
    const ruta = mapaId === '_principal' ? 'tokens' : `mapas/${mapaId}/tokens`;
    const snap = await fbDb.collection(fbRutaCampana(ruta)).get();
    return new Set(snap.docs.map(d => d.data()).filter(t => t.tipo === 'creep' && t.fichaId).map(t => t.fichaId));
  }

  // El oro se tira UNA sola vez por creep (±20% sobre su valor base) y no se recalcula al reabrir el reporte.
  function oroDeCreep(rep, sc){
    if(rep.oro[sc.id] === undefined){
      const base = num(sc.oroBase);
      rep.oro[sc.id] = base > 0 ? Math.max(0, Math.round(base * (1 + (Math.random() * 0.4 - 0.2)))) : 0;
    }
    return rep.oro[sc.id];
  }

  /* --- Ítems que suelta un creep, ya con la forma de un ítem de la ficha --- */
  function medianaPrecio(lista){
    const v = lista.map(i => num(i.precioCompra)).filter(x => x > 0).sort((a, b) => a - b);
    return v.length ? v[Math.floor(v.length / 2)] : 0;
  }
  function tierPorPrecio(p){ return p <= 120 ? 'Común' : p <= 170 ? 'Buena Calidad' : p <= 500 ? 'Raro' : 'Excepcional'; }   // los rangos del catálogo
  function ajustePorEfectos(mods, efectos){
    const suma = (mods || []).filter(m => m.stat !== 'def' && num(m.val) > 0).reduce((a, m) => a + num(m.val), 0);
    return suma * 8 + (efectos || []).length * 40;
  }
  // Precio estimado de un arma que no está en el catálogo: mediana de las de su Tipo y peso, ajustada por bonos y efectos.
  // El pool de comparación es de la rareza que corresponde al nivel del creep (1–2 Común, 3–4 hasta Buena Calidad, 5 todas).
  function poolPorNivel(lista, nivel){
    const n = num(nivel) || 1;
    const ok = lista.filter(i => n <= 2 ? i.tier === 'Común' : n <= 4 ? (i.tier === 'Común' || i.tier === 'Buena Calidad') : true);
    return ok.length ? ok : lista;
  }
  function precioEstimadoArma(cat, d, nivel){
    const armas = poolPorNivel(cat.filter(i => /^arma_/.test(i.tipoItem)), nivel);
    let base = medianaPrecio(armas.filter(i => num(i.tipoDado) === num(d.tipoDado) && num(i.peso) === num(d.peso)));
    if(!base) base = medianaPrecio(armas.filter(i => num(i.tipoDado) === num(d.tipoDado)));
    if(!base) base = 60;
    return Math.max(20, Math.round((base + ajustePorEfectos(d.mods, d.efectosGolpe)) / 5) * 5);
  }
  // Ídem para una pieza de defensa: mediana de las de su categoría y Defensa parecida.
  function precioEstimadoEquipo(cat, d, nivel){
    const piezas = poolPorNivel(cat.filter(i => i.tipoItem === d.tipoItem), nivel);
    let base = medianaPrecio(piezas.filter(i => Math.abs(num(i.def) - num(d.def)) <= 1));
    if(!base) base = Math.max(30, num(d.def) * 25);
    return Math.max(20, Math.round((base + ajustePorEfectos(d.mods, [])) / 5) * 5);
  }
  function plantillaDeCatalogo(c){
    const mods = [...(c.mods || [])];
    if(num(c.def)) mods.unshift({stat: 'def', val: num(c.def)});
    return {nombre: c.nombre, tipoItem: c.tipoItem, tier: c.tier || 'Común', peso: num(c.peso), ranuras: num(c.ranuras) || 0, precioCompra: num(c.precioCompra),
      tipoDado: num(c.tipoDado), danoFijo: num(c.danoFijo), danoAmplificado: num(c.danoAmplificado), armaDeRango: !!c.armaDeRango, mods,
      efectosGolpe: structuredClone(c.efectosGolpe || []), detalle: c.detalle || '', descripcionNarrativa: c.descripcionNarrativa || '', consumible: false};
  }
  function plantillaArmaCreep(cat, sc){
    const c = cat.find(i => i.nombre === sc.armaNombre && /^arma_/.test(i.tipoItem));
    if(c) return {...plantillaDeCatalogo(c), estimado: false};
    const d = {tipoDado: num(sc.armaTipo) || 8, peso: Math.max(1, num(sc.armaPeso) || 1), mods: structuredClone(sc.armaMods || []), efectosGolpe: structuredClone(sc.armaEfectos || [])};
    const precio = precioEstimadoArma(cat, d, sc.nivel);
    return {nombre: sc.armaNombre, tipoItem: sc.armaManos || 'arma_1m', tier: tierPorPrecio(precio), peso: d.peso, ranuras: 0, precioCompra: precio,
      tipoDado: d.tipoDado, danoFijo: num(sc.armaFijo), danoAmplificado: num(sc.armaAmplificado), armaDeRango: !!sc.armaDeRango, mods: d.mods, efectosGolpe: d.efectosGolpe,
      detalle: sc.armaDetalle || '', descripcionNarrativa: `Arma de ${K.nombreLimpio(sc)}.`, consumible: false, estimado: true};
  }
  function plantillaEquipoCreep(cat, it, nivel){
    const c = cat.find(i => sinAviso(i.nombre) === sinAviso(it.nombre) && i.tipoItem === it.tipoItem);
    if(c) return {...plantillaDeCatalogo(c), estimado: false};
    const mods = [...(it.mods || [])];
    if(num(it.def)) mods.unshift({stat: 'def', val: num(it.def)});
    const precio = precioEstimadoEquipo(cat, {tipoItem: it.tipoItem, def: it.def, mods: it.mods}, nivel);
    return {nombre: it.nombre, tipoItem: it.tipoItem, tier: tierPorPrecio(precio), peso: 1, ranuras: 0, precioCompra: precio, tipoDado: 0, danoFijo: 0, danoAmplificado: 0,
      armaDeRango: false, mods, efectosGolpe: [], detalle: it.detalle || '', descripcionNarrativa: '', consumible: false, estimado: true};
  }
  function plantillaTrofeo(tr, sc){
    return {nombre: tr.nombre, tipoItem: 'otros', tier: 'Común', peso: 0, ranuras: 1, precioCompra: tr.precioCompra, tipoDado: 0, danoFijo: 0, danoAmplificado: 0, armaDeRango: false,
      mods: [], efectosGolpe: [], detalle: `Trofeo de ${K.nombreLimpio(sc)}. No se equipa: se vende en una tienda o se convierte en despojos.`,
      descripcionNarrativa: 'Un recuerdo de una pelea que salió bien.', consumible: false, trofeo: true, estimado: false};
  }
  function itemsDeCreep(cat, sc){
    const out = [];
    const nom = K.nombreLimpio(sc);
    if(sc.armaNombre && !sc.armaNatural){ const t = plantillaArmaCreep(cat, sc); out.push({clave: `${sc.id}:arma`, nombre: t.nombre, precioCompra: t.precioCompra, template: t, origen: nom}); }
    (sc.equipo || []).forEach(it => { const t = plantillaEquipoCreep(cat, it, sc.nivel); out.push({clave: `${sc.id}:eq:${it.id}`, nombre: t.nombre, precioCompra: t.precioCompra, template: t, origen: nom}); });
    const tr = K.trofeo(sc);
    if(tr) out.push({clave: `${sc.id}:trofeo`, nombre: tr.nombre, precioCompra: tr.precioCompra, template: plantillaTrofeo(tr, sc), origen: nom, trofeo: true});
    return out;
  }
  /* --- El consumible que suelta un creep (2026-10-03, pedido del dueño) ---
     Solo humanos (30 %) y humanoides (20 %); el resto, nada. Un jefe: el doble de chance (tope 90 %) y la tabla de tiers como si tuviera un
     nivel más. Si suelta, se tira el tier —a más nivel, mejores tiers— y sale un consumible al azar de ese tier (trampas incluidas). Se tira
     UNA sola vez por creep, como el oro (`rep.drops`): reabrir el reporte no lo cambia. Los números, acá abajo, en un solo lugar. */
  const DROP_CHANCE = {humano: 0.30, humanoide: 0.20};
  const DROP_TIERS = ['Común', 'Buena Calidad', 'Raro', 'Excepcional', 'Legendario'];
  const DROP_BASE = [50, 35, 12, 3, 0];           // % en nivel 1
  const DROP_POR_NIVEL = [-6, 2, 2.5, 1, 0.5];    // lo que se mueve por cada nivel de más (Común nunca baja de DROP_COMUN_MIN)
  const DROP_COMUN_MIN = 10;
  function dropChance(sc){
    const p = DROP_CHANCE[K.tipoDe(sc)] || 0;
    return sc.jefe ? Math.min(0.9, p * 2) : p;
  }
  // La tabla de tiers de un nivel: % por tier (suma 100).
  function dropTabla(nivel){
    const n = Math.max(0, Math.round(num(nivel) || 1) - 1);
    const w = DROP_BASE.map((b, i) => Math.max(0, b + DROP_POR_NIVEL[i] * n));
    const comun = Math.max(DROP_COMUN_MIN, w[0]);
    // Los tiers mejores se reparten lo que deja Común (si se pasan, se achican en proporción): Común nunca baja del piso.
    const resto = w.slice(1), tot = resto.reduce((a, x) => a + x, 0), lugar = 100 - comun;
    return [comun, ...resto.map(x => tot ? x * lugar / tot : 0)];
  }
  function dropTier(nivel, azar){
    const t = dropTabla(nivel);
    let r = (azar === undefined ? Math.random() : azar) * 100;
    for(let i = 0; i < t.length; i++){ if(r < t[i]) return DROP_TIERS[i]; r -= t[i]; }
    return DROP_TIERS[0];
  }
  // El consumible de ese tier (si no hay ninguno, el tier más cercano: primero para abajo).
  function dropElegir(cat, tier){
    const cons = cat.filter(i => i.tipoItem === 'consumibles');
    const k = DROP_TIERS.indexOf(tier);
    const orden = [k, ...DROP_TIERS.map((_, i) => i).filter(i => i !== k).sort((a, b) => (Math.abs(a - k) - Math.abs(b - k)) || (a - b))];
    for(const i of orden){ const pool = cons.filter(c => (c.tier || 'Común') === DROP_TIERS[i]); if(pool.length) return pool[Math.floor(Math.random() * pool.length)]; }
    return null;
  }
  // El ítem completo para el botín: el del catálogo de fábrica (con sus efectos y su trampa); si es uno subido por el grupo, lo que llegó.
  function plantillaConsumible(c){
    const full = typeof CATALOGO_BASE !== 'undefined' ? CATALOGO_BASE.find(i => i.nombre === c.nombre && i.tipoItem === 'consumibles') : null;
    const t = structuredClone(full || c);
    delete t.id; delete t.imagen; delete t._bib; delete t.equipado;
    return {...t, tipoItem: 'consumibles', consumible: true, unidades: 1, precioCompra: num(t.precioCompra), estimado: false};
  }
  function dropDeCreep(rep, cat, sc){
    rep.drops = rep.drops || {};
    if(rep.drops[sc.id] === undefined){
      let nombre = '';
      if(Math.random() < dropChance(sc)){
        const c = dropElegir(cat, dropTier(num(sc.nivel) + (sc.jefe ? 1 : 0)));
        if(c) nombre = c.nombre;
      }
      rep.drops[sc.id] = nombre;
    }
    const c = rep.drops[sc.id] ? cat.find(i => i.nombre === rep.drops[sc.id] && i.tipoItem === 'consumibles') : null;
    if(!c) return [];
    const t = plantillaConsumible(c);
    return [{clave: `${sc.id}:drop`, nombre: t.nombre, precioCompra: t.precioCompra, template: t, origen: K.nombreLimpio(sc), drop: true}];
  }
  function itemsExtra(rep){
    return rep.extras.map((e, i) => ({clave: `extra:${i}`, nombre: e.nombre, precioCompra: e.precioCompra, origen: 'Botín extra',
      template: {nombre: e.nombre, tipoItem: 'otros', tier: 'Común', peso: 0, ranuras: 1, precioCompra: e.precioCompra, tipoDado: 0, danoFijo: 0, danoAmplificado: 0, armaDeRango: false,
        mods: [], efectosGolpe: [], detalle: '', descripcionNarrativa: '', consumible: false, estimado: false}}));
  }

  function generar(rep, creeps, cat){
    const filas = creeps.filter(sc => !sc.recompensado && rep.enMapa && rep.enMapa.has(sc.id)).map(sc => {
      const derrotado = num(sc.hp) <= 0;
      const xpBase = xpBasePorNivel(sc.nivel);
      const xp = derrotado ? xpBase : Math.round(xpBase * XP_ESCAPO_PCT);
      const cuenta = derrotado || rep.contarEscapados;
      return {sc, derrotado, xp, cuenta, oro: derrotado ? oroDeCreep(rep, sc) : 0, items: derrotado ? [...itemsDeCreep(cat, sc), ...dropDeCreep(rep, cat, sc)] : []};
    });
    const xpTotal = filas.reduce((a, f) => a + (f.cuenta ? f.xp : 0), 0);
    return {filas, xpTotal};
  }

  /* --- Jugadores: las fichas de la partida, con su estado al terminar el combate --- */
  function estadoDeFicha(f){
    const r = f.resumen || {};
    if(r.hp !== undefined && num(r.hp) <= 0) return r.muertoDef ? 'muerto' : 'inconsciente';
    return 'en pie';
  }
  // Los personajes de la partida (conserva si estaban incluidos, de `previos`).
  async function jugadores(previos){
    const [fichas, miembros] = await Promise.all([fbDb.collection(fbRutaCampana('fichas')).get(), fbDb.collection(fbRutaCampana('miembros')).get()]);
    const nombres = new Map(miembros.docs.map(d => [d.id, String(d.data().nombre || '')]));
    const prev = new Map((previos || []).map(j => [j.id, j]));
    return fichas.docs.map(d => ({id: d.id, nombre: String(d.data().nombre || 'Sin nombre'), duenoUid: d.data().duenoUid, dueno: nombres.get(d.data().duenoUid) || '',
      estado: estadoDeFicha(d.data()), incluido: prev.has(d.id) ? prev.get(d.id).incluido : true}))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  }

  // El reparto de XP y de oro entre los jugadores incluidos.
  function calcularReparto(rep, r){
    const incluidos = (rep.jugadores || []).filter(j => j.incluido);
    const n = incluidos.length;
    const xpTotal = Math.max(0, r.xpTotal);
    const oroTotal = Math.max(0, r.filas.reduce((a, f) => a + (f.derrotado ? f.oro : 0), 0));
    const xpBase = n ? Math.ceil(xpTotal / n) : 0;            // como si todos estuvieran vivos, redondeo hacia arriba
    const ddeCada = n ? Math.ceil(oroTotal / n) : 0;
    // Lo que el GM fija: un valor por jugador que vale para todos (si no toca nada, el calculado) y, aparte, un extra de cada uno
    // por circunstancias particulares. El inconsciente cobra el 25% del valor por jugador (hacia abajo) y el muerto nada; el extra se suma encima.
    const xpValor = rep.xpPorJugador !== null ? rep.xpPorJugador : xpBase;
    const ddeValor = rep.ddePorJugador !== null ? rep.ddePorJugador : ddeCada;
    const porJugador = incluidos.map(j => {
      const ex = rep.extra[j.id] || {};
      const xpParte = Math.floor(xpValor * FACTOR_XP_ESTADO[j.estado]);
      return {j, xpParte, ddeParte: ddeValor, xpExtra: num(ex.xp), ddeExtra: num(ex.dde),
        xp: Math.max(0, xpParte + num(ex.xp)), dde: Math.max(0, Math.round((ddeValor + num(ex.dde)) * 100) / 100)};
    });
    return {n, xpTotal, oroTotal, xpBase, ddeCada, xpValor, ddeValor, porJugador};
  }
  function itemsPublicables(rep, r){
    const todos = [...r.filas.flatMap(f => f.items), ...itemsExtra(rep)];
    return todos.filter(i => !rep.quitados.has(i.clave));
  }

  // El cuerpo de la ventana «Batalla terminada». `publicar`: cómo va el botón 📢 Publicar despojos.
  function vista(rep, creeps, cat){
    if(rep.enMapa === null) return {html: `<div class="hint">Buscando los creeps que están en el mapa publicado…</div>`, publicar: 'oculto', faltanJugadores: false};
    const r = generar(rep, creeps, cat);
    if(!r.filas.length) return {html: `<div class="hint">No hay creeps para repartir. Solo cuentan los creeps con un <b>token vinculado en el mapa publicado</b> que todavía no se repartieron.</div>`, publicar: 'oculto', faltanJugadores: false};
    const {filas} = r;
    const rp = calcularReparto(rep, r);
    const hayEscapados = filas.some(f => !f.derrotado);
    const filasHtml = filas.map(f => `
    <div class="reporte-fila${f.cuenta ? '' : ' no-cuenta'}">
      <span class="reporte-nombre">${esc(f.sc.nombre)}<span class="reporte-nivel">Lv ${fmt(num(f.sc.nivel))}</span></span>
      <span class="reporte-estado ${f.derrotado ? 'derrotado' : 'escapo'}">${f.derrotado ? 'Derrotado' : 'Escapó'}</span>
      <span class="reporte-xp" title="${f.cuenta ? '' : 'No se cuenta en el total'}">+${fmt(f.xp)} XP${f.derrotado && f.oro ? ` · ${fmt(f.oro)} DDE` : ''}</span>
    </div>`).join('');

    const itemHtml = i => `<label class="reporte-loot-item" style="cursor:pointer;display:inline-flex;gap:5px;align-items:center${rep.quitados.has(i.clave) ? ';opacity:.45' : ''}" title="${i.template.estimado ? 'Precio estimado por comparación con el catálogo' : ''}">
      <input type="checkbox" data-rep-item="${esc(i.clave)}"${rep.quitados.has(i.clave) ? '' : ' checked'}>${esc(i.nombre)}${i.trofeo ? ' 🏆' : ''}${i.drop ? ' <span title="Consumible que soltó al azar (humano / humanoide)">🎲</span>' : ''} <span class="reporte-loot-precio">${fmt(i.precioCompra)} DDE${i.template.estimado ? ' (est.)' : ''}</span><button type="button" class="iconbtn" data-rep-ver="${esc(i.clave)}" style="padding:2px 8px;font-size:11px">Ver</button></label>`;
    const conItems = filas.filter(f => f.items.length);
    const extras = itemsExtra(rep);
    const lootHtml = (conItems.length || extras.length)
      ? conItems.map(f => `<div class="reporte-loot-creep"><div class="reporte-loot-nombre">${esc(f.sc.nombre)}</div><div class="reporte-loot-items">${f.items.map(itemHtml).join('')}</div></div>`).join('')
        + (extras.length ? `<div class="reporte-loot-creep"><div class="reporte-loot-nombre">Botín extra</div><div class="reporte-loot-items">${extras.map(itemHtml).join('')}</div></div>` : '')
      : `<div class="hint">Ningún creep derrotado suelta ítems.</div>`;

    const jug = rep.jugadores;
    const jugHtml = jug === null ? '<div class="hint">Cargando personajes…</div>'
      : jug.length ? jug.map(j => {
          const p = rp.porJugador.find(x => x.j === j);
          return `<label class="reporte-fila${j.incluido ? '' : ' no-cuenta'}" style="cursor:pointer;gap:8px;align-items:center">
          <input type="checkbox" data-rep-jug="${esc(j.id)}"${j.incluido ? ' checked' : ''}>
          <span class="reporte-nombre">${esc(j.nombre)}${j.dueno ? `<span class="reporte-nivel">${esc(j.dueno)}</span>` : ''}</span>
          <span class="reporte-estado ${j.estado === 'en pie' ? 'escapo' : 'derrotado'}">${esc(j.estado)}</span>
          ${j.incluido ? `<span class="rep-valor" title="Extra por circunstancias particulares (puede ser negativo)"><span class="hint" style="font-weight:400">extra</span> <input type="number" step="1" class="rep-num${p.xpExtra ? ' editado' : ''}" data-rep-xp="${esc(j.id)}" value="${p.xpExtra}"> XP</span>
            <span class="rep-valor" title="Extra por circunstancias particulares (puede ser negativo)"><input type="number" step="1" class="rep-num${p.ddeExtra ? ' editado' : ''}" data-rep-dde="${esc(j.id)}" value="${p.ddeExtra}"> DDE</span>
            <span class="rep-final" title="Lo que va a recibir">= <b>+${fmt(p.xp)}</b> XP · <b>+${fmt(p.dde)}</b> DDE</span>` : '<span class="reporte-xp">sin recompensas</span>'}</label>`;
        }).join('')
      : '<div class="hint">Todavía no hay personajes en la partida.</div>';

    const html = `
    <div>
      <div class="reporte-seccion-titulo">Lo que recibe cada jugador</div>
      <div class="rep-por-jugador">
        <label>Experiencia por jugador <input type="number" min="0" step="1" class="rep-num rep-num-grande${rep.xpPorJugador !== null ? ' editado' : ''}" data-rep-todos="xp" value="${rp.xpValor}"> XP</label>
        <label>Oro por jugador <input type="number" min="0" step="1" class="rep-num rep-num-grande${rep.ddePorJugador !== null ? ' editado' : ''}" data-rep-todos="dde" value="${rp.ddeValor}"> DDE</label>
        ${(rep.xpPorJugador !== null || rep.ddePorJugador !== null) ? `<button type="button" class="iconbtn" data-rep-reset title="Volver a lo calculado (${fmt(rp.xpBase)} XP · ${fmt(rp.ddeCada)} DDE)">↺ calculado</button>` : `<span class="hint">calculado: se puede cambiar</span>`}
      </div>
      <div class="reporte-lista">${jugHtml}</div>
      <div class="hint" style="margin-top:4px">Destildá a quien no estuvo en el combate. Cambiá el <b>valor por jugador</b> de arriba y se aplica a todos. Si alguien merece más o menos por una circunstancia particular, ponele un <b>extra</b> (también puede ser negativo). En pie cobra el 100% de la XP, inconsciente el 25% (hacia abajo), muerto nada; el oro es parejo.</div>
    </div>
    <div>
      <div class="reporte-seccion-titulo">Cálculo: experiencia y oro de los creeps</div>
      <div class="reporte-lista">${filasHtml}</div>
      ${hayEscapados ? `<label class="reporte-contar-escapados"><input type="checkbox" data-rep-escapados ${rep.contarEscapados ? 'checked' : ''}> Contar la XP de los que escaparon (${fmt(XP_ESCAPO_PCT * 100)}% de lo que darían derrotados)</label>` : ''}
      <div class="reporte-total">Calculado — XP total: <b>${fmt(rp.xpTotal)}</b> · ${rp.n ? `base por jugador (÷${rp.n}, hacia arriba): <b>${fmt(rp.xpBase)}</b>` : 'elegí al menos un jugador'}</div>
      <div class="reporte-total">Calculado — oro total: <b>${fmt(rp.oroTotal)} DDE</b> (ya incluye su variación de ±20%, no se vuelve a tirar) · ${rp.n ? `<b>${fmt(rp.ddeCada)}</b> DDE por jugador (hacia arriba)` : ''}</div>
    </div>
    <div>
      <div class="reporte-seccion-titulo">Despojos: equipos y trofeos que los jugadores van a poder elegir</div>
      <div class="reporte-loot-lista">${lootHtml}</div>
      <div style="display:flex;gap:6px;margin-top:8px"><input type="text" data-rep-extra-nombre placeholder="Ítem extra (nombre)" style="flex:1"><input type="number" min="0" data-rep-extra-precio placeholder="Precio" style="width:90px"><button type="button" class="btn" data-rep-extra-add>+ Sumar</button></div>
    </div>`;
    return {html, publicar: rep.publicando || !rp.n ? 'inactivo' : 'activo', faltanJugadores: rep.jugadores === null && !rep.cargando};
  }
  // Un control de la ventana cambió (evento change): true si hay que redibujar.
  function cambio(rep, t){
    const d = t && t.dataset;
    if(!d) return false;
    if(d.repItem !== undefined){ if(t.checked) rep.quitados.delete(d.repItem); else rep.quitados.add(d.repItem); return true; }
    if(d.repJug !== undefined){ const j = (rep.jugadores || []).find(x => x.id === d.repJug); if(j) j.incluido = t.checked; return true; }
    if(d.repTodos === 'xp'){ rep.xpPorJugador = Math.max(0, Math.round(num(t.value))); return true; }
    if(d.repTodos === 'dde'){ rep.ddePorJugador = Math.max(0, Math.round(num(t.value) * 100) / 100); return true; }
    if(d.repXp !== undefined || d.repDde !== undefined){
      const id = d.repXp || d.repDde, campo = d.repXp ? 'xp' : 'dde';
      (rep.extra[id] = rep.extra[id] || {})[campo] = Math.round(num(t.value) * 100) / 100;
      return true;
    }
    if(d.repEscapados !== undefined){ rep.contarEscapados = t.checked; return true; }
    return false;
  }
  // Un botón de la ventana (evento click): true (redibujar) | {ver: ítem} | {toast} | null (no era de acá). `raiz` = donde están los campos.
  function clic(rep, b, raiz, creeps, cat){
    const d = b && b.dataset;
    if(!d) return null;
    if(d.repVer !== undefined){
      const r = generar(rep, creeps, cat);
      const it = [...r.filas.flatMap(f => f.items), ...itemsExtra(rep)].find(i => i.clave === d.repVer);
      return it ? {ver: it.template} : null;
    }
    if(d.repReset !== undefined){ rep.xpPorJugador = null; rep.ddePorJugador = null; return true; }
    if(d.repExtraAdd !== undefined){
      const nombre = raiz.querySelector('[data-rep-extra-nombre]').value.trim();
      if(!nombre) return {toast: 'Escribí el nombre del ítem extra'};
      rep.extras.push({nombre: nombre.slice(0, 60), precioCompra: Math.max(0, num(raiz.querySelector('[data-rep-extra-precio]').value))});
      return true;
    }
    return null;
  }

  // Línea verde en la Mesa (comun/mesa.js, desde 'recompensa').
  async function lineaVerde(origen, formula){
    if(!fbDb || !fbUsuario || !fbMiembro) return;
    try{
      await fbDb.collection(fbRutaCampana('tiradas')).add({
        uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: '', origen: String(origen).slice(0, 200), formula: String(formula || '').slice(0, 600),
        rolls: [], mod: 0, total: 0, desde: 'recompensa', cuando: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }catch(err){ console.error('No se pudo escribir la línea verde en la Mesa:', err); }
  }

  // 📢 Publicar despojos. `confirmar(texto)` → bool (o promesa); `alEmpezar()` se llama al ponerse a escribir (para redibujar).
  // Con ítems en el botín, la XP y el oro se cargan en las fichas al CERRAR el botín (despojar); sin ítems, ya mismo.
  async function publicar(rep, {creeps, cat, combateActual, confirmar, alEmpezar}){
    if(rep.publicando) return null;
    if(!fbDb || !fbMiembro || !fbMiembro.gm) return {error: 'Solo el GM de la partida puede publicar'};
    const r = generar(rep, creeps, cat);
    const rp = calcularReparto(rep, r);
    if(!rp.n) return {error: 'Elegí al menos un jugador'};
    if(combateActual && combateActual.estado === 'publicado') return {error: 'Hay un botín anterior sin cerrar: cerralo primero con 🎁 Despojos (ahí se pagan su XP y su oro)'};
    const items = itemsPublicables(rep, r);
    if(!(await confirmar(`¿Publicar los despojos?\n\n${rp.porJugador.map(({j, xp, dde}) => `· ${j.nombre}: +${fmt(xp)} XP, +${fmt(dde)} DDE`).join('\n')}\n· ${items.length} ítem(s) en el botín\n\n${items.length ? 'La XP y el oro se cargan en las fichas cuando cierres el botín (último paso, 🎁 Despojos). A los jugadores se les abre la ventana en el mapa para que elijan.' : 'Como no hay ítems, la XP y el oro se cargan solos en las fichas.'}`))) return null;
    rep.publicando = true;
    if(alEmpezar) alEmpezar();
    try{
      const ts = firebase.firestore.FieldValue.serverTimestamp();
      const batch = fbDb.batch();
      if(!items.length) rp.porJugador.forEach(({j, xp, dde}) => {
        batch.set(fbDb.collection(fbRutaCampana('recompensas')).doc(), {fichaId: j.id, duenoUid: j.duenoUid, nombre: j.nombre.slice(0, 60), xp, dde, despojos: 0, estado: j.estado, aplicada: false, creado: ts});
      });
      batch.set(fbDb.doc(fbRutaCampana('combate/actual')), {numero: Date.now(), estado: items.length ? 'publicado' : 'cerrado', titulo: 'Batalla terminada', items: items.length, creado: ts,
        jugadores: rp.porJugador.slice(0, 30).map(({j, xp, dde}) => ({fichaId: j.id, duenoUid: j.duenoUid, nombre: j.nombre.slice(0, 60), estado: j.estado, xp: Math.round(xp), dde: Math.round(dde * 100) / 100}))});
      items.forEach(i => {
        batch.set(fbDb.collection(fbRutaCampana('botin')).doc(), {nombre: String(i.nombre).slice(0, 80), json: JSON.stringify(i.template), origen: String(i.origen).slice(0, 80),
          precioCompra: num(i.precioCompra), despojos: Math.ceil(num(i.precioCompra) / 4), tomadoPor: '', tomadoNombre: '', creado: ts});
      });
      await batch.commit();
      const lineas = rp.porJugador.map(({j, xp, dde}) => `${j.nombre}: +${fmt(xp)} XP${j.estado !== 'en pie' ? ` (${j.estado})` : ''}, +${fmt(dde)} DDE`).join(' · ');
      await lineaVerde('🎁 Recompensas del combate', lineas + (items.length ? ` · ${items.length} ítem(s) en el botín` : ''));
      return {ok: true, items, filas: r.filas};
    }catch(err){
      console.error('No se pudieron publicar las recompensas:', err);
      rep.publicando = false;
      return {error: err.code === 'permission-denied' ? 'Faltan las reglas nuevas de Firebase (recompensas/botín): pegalas en la consola' : 'No se pudo publicar — mirá la consola'};
    }
  }

  /* ---------- Botín pendiente (GM): lo que los jugadores no tomaron → "Despojar" ----------
     campanas/<id>/botin/*: un doc por ítem ({nombre, json, despojos, tomadoPor, tomadoNombre}).
     Despojar suma los despojos de lo que quedó, los reparte entre los jugadores elegidos (hacia arriba) como
     recompensas (la ficha las aplica sola) y borra el botín. */
  function nuevoBotin(){ return {docs: [], jugadores: null, incluidos: new Set(), ocupado: false}; }
  async function jugadoresBotin(){
    const fichas = await fbDb.collection(fbRutaCampana('fichas')).get();
    return fichas.docs.map(d => ({id: d.id, nombre: String(d.data().nombre || 'Sin nombre'), duenoUid: d.data().duenoUid})).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  }
  function botinVista(st){
    const libres = st.docs.filter(d => !d.tomadoPor);
    const tomados = st.docs.filter(d => d.tomadoPor);
    const total = libres.reduce((a, d) => a + num(d.despojos), 0);
    const jug = st.jugadores;
    const n = jug ? jug.filter(j => st.incluidos.has(j.id)).length : 0;
    const cada = n ? Math.ceil(total / n) : 0;
    const html = `
    <div class="reporte-seccion-titulo">Sin tomar (${libres.length})</div>
    <div class="reporte-loot-items">${libres.length ? libres.map(d => `<span class="reporte-loot-item">${esc(d.nombre)} <span class="reporte-loot-precio">${fmt(num(d.despojos))} despojos</span> <button type="button" class="iconbtn" data-botin-ver="${esc(d.id)}" style="padding:2px 8px;font-size:11px">Ver</button></span>`).join('') : '<span class="hint">No queda nada sin tomar.</span>'}</div>
    ${tomados.length ? `<div class="reporte-seccion-titulo" style="margin-top:12px">Ya tomados (${tomados.length})</div>
      <div class="reporte-loot-items">${tomados.map(d => `<span class="reporte-loot-item" style="opacity:.7">${esc(d.nombre)} → ${esc(d.tomadoNombre || '?')} <button type="button" class="iconbtn" data-botin-ver="${esc(d.id)}" style="padding:2px 8px;font-size:11px">Ver</button></span>`).join('')}</div>` : ''}
    <div class="reporte-seccion-titulo" style="margin-top:14px">Despojar: ${fmt(total)} despojos${n ? ` → ${fmt(cada)} c/u (hacia arriba)` : ''}</div>
    ${jug === null ? '<div class="hint">Cargando personajes…</div>' : jug.map(j => `<label class="reporte-fila" style="cursor:pointer;gap:8px;align-items:center"><input type="checkbox" data-botin-jug="${esc(j.id)}"${st.incluidos.has(j.id) ? ' checked' : ''}><span class="reporte-nombre">${esc(j.nombre)}</span></label>`).join('')}
    <div class="hint" style="margin-top:6px">Cerrar esta ventana <b>no despoja</b>: el botín sigue abierto y la volvés a abrir con 🎁 Despojos. Cuando todos hayan elegido, apretá el botón de abajo: lo que nadie tomó se convierte en despojos y se reparte, <b>recién ahí se cargan en las fichas la experiencia y el oro</b> de la batalla, y el botín se cierra del todo.</div>`;
    return {html, boton: libres.length ? '🏁 Despojar lo que nadie tomó y repartir XP y oro' : '🏁 Cerrar botín y repartir XP y oro'};
  }
  function botinCambio(st, t){
    if(!t || !t.dataset || t.dataset.botinJug === undefined) return false;
    if(t.checked) st.incluidos.add(t.dataset.botinJug); else st.incluidos.delete(t.dataset.botinJug);
    return true;
  }
  // El ítem de un doc del botín (para Ver), o null.
  function botinItem(st, id){
    const d = st.docs.find(y => y.id === id);
    let it = null;
    try{ it = JSON.parse((d && d.json) || 'null'); }catch(e){}
    return it ? {...it, nombre: it.nombre || d.nombre} : null;
  }
  async function despojar(st, {combateActual, confirmar, alEmpezar}){
    if(st.ocupado) return null;
    const libres = st.docs.filter(d => !d.tomadoPor);
    const elegidos = (st.jugadores || []).filter(j => st.incluidos.has(j.id));
    const cobran = (combateActual && Array.isArray(combateActual.jugadores)) ? combateActual.jugadores : [];
    const total = libres.reduce((a, d) => a + num(d.despojos), 0);
    const cada = elegidos.length ? Math.ceil(total / elegidos.length) : 0;
    const lineasPago = cobran.map(c => `${c.nombre}: +${fmt(num(c.xp))} XP, +${fmt(num(c.dde))} DDE`).join('\n');
    if(!(await confirmar(`¿Cerrar el botín?\n\n· ${libres.length ? `Lo que nadie tomó (${libres.length} ítem/s) se convierte en ${total} despojos: ${cada} para cada uno de ${elegidos.length} personaje(s).` : 'No queda nada sin tomar.'}\n· Se cargan en las fichas la experiencia y el oro de la batalla:\n${lineasPago || '(nada)'}`))) return null;
    st.ocupado = true;
    if(alEmpezar) alEmpezar();
    try{
      const ts = firebase.firestore.FieldValue.serverTimestamp();
      const batch = fbDb.batch();
      // Un solo pago por personaje: la XP y el DDE de la batalla + su parte de los despojos. La ficha del dueño lo aplica sola.
      const ids = [...new Set([...cobran.map(c => c.fichaId), ...elegidos.map(j => j.id)])];
      ids.forEach(id => {
        const c = cobran.find(x => x.fichaId === id), e = elegidos.find(x => x.id === id), f = (st.jugadores || []).find(x => x.id === id);
        const xp = c ? num(c.xp) : 0, dde = c ? num(c.dde) : 0, desp = e ? cada : 0;
        const duenoUid = (c && c.duenoUid) || (f && f.duenoUid) || '';
        if(!duenoUid || !(xp > 0 || dde > 0 || desp > 0)) return;
        batch.set(fbDb.collection(fbRutaCampana('recompensas')).doc(), {fichaId: id, duenoUid, nombre: String((c && c.nombre) || (f && f.nombre) || '').slice(0, 60), xp, dde, despojos: desp, estado: (c && c.estado) || 'despojos', aplicada: false, creado: ts});
      });
      st.docs.forEach(d => batch.delete(fbDb.collection(fbRutaCampana('botin')).doc(d.id)));
      batch.set(fbDb.doc(fbRutaCampana('combate/actual')), {estado: 'cerrado', cerrado: ts}, {merge: true});   // se inhabilitan los botones 🎁 y se cierra la ventana de los jugadores
      await batch.commit();
      await lineaVerde('🏁 Botín cerrado', `${libres.length ? `${libres.length} ítem(s) sin tomar → ${fmt(total)} despojos: +${fmt(cada)} c/u a ${elegidos.map(j => j.nombre).join(', ')} · ` : ''}XP y oro cargados en las fichas`);
      let desarmadas = 0;
      try{ desarmadas = await TokensAuto.desarmarTrampasConsumibles(); }catch(err){ console.error('No se pudieron desarmar las trampas consumibles:', err); }
      if(desarmadas) await lineaVerde('🪤 Trampas desarmadas', `${desarmadas} trampa${desarmadas === 1 ? '' : 's'} de consumible sin disparar ${desarmadas === 1 ? 'volvió' : 'volvieron'} a la mochila o al cinturón de su dueño`);
      return {ok: true, mensaje: 'Botín cerrado ✓ — XP, oro y despojos cargados en las fichas' + (desarmadas ? ` · ${desarmadas} trampa${desarmadas === 1 ? '' : 's'} desarmada${desarmadas === 1 ? '' : 's'}` : '')};
    }catch(err){
      console.error('No se pudo despojar:', err);
      return {error: err.code === 'permission-denied' ? 'Faltan las reglas nuevas de Firebase' : 'No se pudo despojar — mirá la consola'};
    }finally{
      st.ocupado = false;
    }
  }

  return {xpBasePorNivel, XP_ESCAPO_PCT, FACTOR_XP_ESTADO, nuevo, creepsEnMapa, oroDeCreep, DROP_CHANCE, DROP_TIERS, dropChance, dropTabla, dropTier, dropDeCreep, tierPorPrecio, precioEstimadoArma, precioEstimadoEquipo,
    plantillaArmaCreep, plantillaEquipoCreep, plantillaTrofeo, itemsDeCreep, itemsExtra, generar, estadoDeFicha, jugadores, calcularReparto,
    itemsPublicables, vista, cambio, clic, lineaVerde, publicar, nuevoBotin, jugadoresBotin, botinVista, botinCambio, botinItem, despojar};
})();
