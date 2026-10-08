/* =========================================================
   FICHA-TIENDA — la tienda que publica el GM, vista por un personaje, para cualquier pantalla (2026-10-02, hoja de ruta A5 de
   docs/pendientes.md: el mapa la muestra él mismo, sin abrir la ficha escondida)
   Lo que antes vivía en la ficha (js/01 los grupos de compra, js/07 la fila de un ítem y su precio, js/09 el catálogo, el carrito, la
   compra, vender y reparar), copiado tal cual con el personaje (`S`) y el estado de la tienda en pantalla (`st`) como parámetros.
   st = {tienda (la publicada, desdeDoc; null = el catálogo general), carrito [{catId, cantidad}], venderSel {clave: cantidad},
         verCompleto, filtro (el estado de comun/filtro-catalogo.js: búsqueda, filtros, orden), extraItem(id) (opcional: otro lugar donde buscar un ítem,
         p. ej. el botín)} — nueva() arma uno vacío; la ficha usa uno con getters sobre sus variables de siempre.
   Lo que cambia al personaje avisa con ui = {toast, cambio(partes)}.
   Necesita comun/ficha-calculo.js, ficha-combate.js, ficha-equipo.js, ficha-guardado.js, items-subidos.js (etiqueta de lo subido),
   generador-tiendas.js y filtro-catalogo.js (los filtros).
   ========================================================= */
const FichaTienda = (() => {
  const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
  const fmt = n => Number.isInteger(n) ? n : Math.round(n*100)/100;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const uid = () => Math.random().toString(36).slice(2, 9);
  const E = () => FichaEquipo, C = () => FichaCalculo;

  /* ---------- Grupos de compra (js/01) ---------- */
  const GRUPO_COMPRA_MAP = {
    arma_1m:'armas', arma_2m:'armas',
    escudo_1m:'escudos', escudo_2m:'escudos',
    armadura_blanda:'defensa', armadura_rigida:'defensa',
    manos:'defensa', piernas:'defensa', cabeza:'defensa', pies:'defensa',
    cinturon:'defensa', mochila:'defensa',
    consumibles:'consumibles',
    anillos:'accesorios',
    otros:'otros', '':'otros'
  };
  const GRUPO_COMPRA_LABEL = {armas:'Armas', escudos:'Escudos', defensa:'Defensa', accesorios:'Accesorios', consumibles:'Consumibles', otros:'Otros'};
  const GRUPO_COMPRA_ORDEN = ['consumibles','armas','defensa','escudos','accesorios','otros'];
  const grupoCompraDe = tipoItem => GRUPO_COMPRA_MAP[tipoItem] || 'otros';
  const TIERS_ORDEN = ['Común', 'Buena Calidad', 'Raro', 'Excepcional', 'Legendario'];
  const TIERS_OCULTOS = ['Excepcional', 'Legendario'];   // no se ofrecen en el catálogo general del jugador
  const STACK_MAX = 5;
  // Las trampas consumibles (`pilaInfinita`) se apilan sin límite.
  const stackMaxDe = it => (it && it.pilaInfinita) ? Infinity : STACK_MAX;

  function nueva(){
    return {tienda: null, carrito: [], venderSel: {}, verCompleto: false, filtro: FiltroCatalogo.vacio(), seccion: ''};
  }

  /* ---------- Precios y búsqueda ---------- */
  // El vendedor puede tener un descuento o recargo para toda la tienda: se aplica al vuelo sobre el precio de catálogo.
  function precioDeCompra(st, item){
    const base = num(item.precioCompra);
    const pct = st.tienda ? (Number(st.tienda.ajustePrecio) || 0) : 0;
    if(!pct) return base;
    return Math.max(1, Math.round(base * (1 + pct / 100)));
  }
  const precioVenta = i => Math.round((num(i.precioCompra) / 2) * 100) / 100;
  function precioHtml(st, item){
    const base = num(item.precioCompra);
    const final = precioDeCompra(st, item);
    if(final === base) return `<b>${fmt(base)} DDE</b>`;
    return `<span class="precio-lista">${fmt(base)}</span><b>${fmt(final)} DDE</b>`;
  }
  const normalizarBusqueda = s => (s || '').toString().normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim();
  // Texto completo del ítem para la búsqueda: nombre, detalle, tier, categoría/slot y todos los mods en su forma legible.
  function textoBusqueda(item){
    const partes = [item.nombre, item.detalle, E().CATEGORIA_LABEL[item.tipoItem], C().SLOT_LABEL[C().slotDe(item.tipoItem)]];
    (item.mods || []).forEach(m => { partes.push(C().STAT_LABEL[m.stat] || m.stat, C().STAT_FULL[m.stat]); });
    return normalizarBusqueda(partes.filter(Boolean).join(' '));
  }
  function itemCatalogo(S, st, id){
    return (S.catalogo || []).find(x => x.id === id)
      || (st.tienda && Array.isArray(st.tienda.itemsDatos) ? st.tienda.itemsDatos.find(x => x && x.id === id) : null)
      || (S.inventario || []).find(x => x.id === id)   // un ítem de la mochila (Comparar desde "Equipar")
      || (st.extraItem ? st.extraItem(id) : null)     // un ítem del botín (Comparar desde "Botín")
      || null;
  }

  /* ---------- Lo que se ve del catálogo ----------
     Los filtros y el orden son los de comun/filtro-catalogo.js (2026-10-08: una sola pieza para todos lados). `st.filtro` es su estado
     ({buscar, parte, manos, tier, libre, …, orden, desc}); cada pantalla dibuja el filtro con FiltroCatalogo.crear sobre ese mismo objeto. */
  const danoDe = item => FiltroCatalogo.danoDe(item);
  // ¿Tiene libre el lugar del cuerpo donde va? (null: no va en el cuerpo — consumibles, otros). El chip «🟢 Lugar libre».
  function libre(S, item){ const r = E().slotOcupado(S, item); return r ? !r.ocupado : null; }
  const ctxFiltro = (S, st) => ({precio: it => precioDeCompra(st, it), libre: it => libre(S, it), sinCalidad: !E().veCalidad()});
  // Lo que se puede llegar a ver, antes de los filtros: lo de la tienda, o el catálogo (sin lo que el jugador no compra suelto).
  /* ---------- Las secciones de la tienda (P179, dueño 2026-10-08: «una tienda, tres habitaciones») ----------
     ⚒ Herrería, 🧵 Talabartería y ✨ Bazar arcano: una pestaña por cada una que tenga algo (cada ítem sabe a cuál va,
     GeneradorTiendas.seccionDe). `st.seccion` = la pestaña abierta; el carrito es uno solo para las tres. Sin tienda (el catálogo), no hay. */
  const G = () => (typeof GeneradorTiendas !== 'undefined' && GeneradorTiendas.seccionDe ? GeneradorTiendas : null);
  const todoTienda = (S, st) => st.tienda.items.map(id => itemCatalogo(S, st, id)).filter(Boolean);
  function secciones(S, st){
    if(!st.tienda || st.verCompleto || !G()) return [];
    const n = {};
    todoTienda(S, st).forEach(it => { const k = G().seccionDe(it); n[k] = (n[k] || 0) + 1; });
    return G().SECCIONES_ORDEN.filter(k => n[k]).map(k => ({k, n: n[k], ...G().SECCIONES[k]}));
  }
  // La pestaña abierta (si no hay o ya no tiene nada, la primera que tenga).
  function seccionActual(S, st){
    const secs = secciones(S, st);
    if(!secs.length) return '';
    if(!secs.some(x => x.k === st.seccion)) st.seccion = secs[0].k;
    return st.seccion;
  }
  const SECCIONES_CSS = `<style>
    .tienda-secs{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 9px}
    .tienda-sec{display:flex;align-items:center;gap:7px;padding:8px 16px;border:1px solid var(--line,#3B2E34);border-radius:8px 8px 0 0;border-bottom-width:3px;
      background:rgba(255,255,255,.03);color:inherit;font:inherit;font-size:14px;font-weight:600;cursor:pointer}
    .tienda-sec:hover{background:rgba(255,255,255,.07)}
    .tienda-sec.on{background:rgba(201,133,69,.22);border-color:var(--copper,#C98545);color:#fff}
    .tienda-sec b{font-family:"Space Mono",monospace;font-size:11px;font-weight:400;opacity:.75}
    .tienda-sec-otra{margin:8px 0;padding:8px 12px;border:1px dashed var(--line,#3B2E34);border-radius:8px;font-size:13px}
    .tienda-sec-otra button{margin-left:6px;background:none;border:1px solid var(--copper,#C98545);border-radius:999px;color:inherit;padding:2px 10px;cursor:pointer;font:inherit;font-size:12px}
  </style>`;
  // Las pestañas (o '' si no hay tienda, o si tiene una sola sección).
  function seccionesHtml(S, st){
    const secs = secciones(S, st), act = seccionActual(S, st);
    if(secs.length < 2 && !(secs.length === 1 && st.tienda && st.tienda.secciones)) return '';
    return SECCIONES_CSS + `<div class="tienda-secs">${secs.map(x => `<button type="button" class="tienda-sec${x.k === act ? ' on' : ''}" data-tienda-seccion="${x.k}"
      title="${esc(x.detalle || '')}">${x.icono} ${esc(x.label)} <b>${fmt(x.n)}</b></button>`).join('')}</div>`;
  }
  // Cambiar de pestaña: el filtro de «qué es» de una no sirve en la otra, se saca (la búsqueda y lo demás quedan).
  function elegirSeccion(st, k){ st.seccion = k; if(st.filtro) st.filtro.parte = ''; }
  function base(S, st){
    if(st.tienda && !st.verCompleto){
      const todo = todoTienda(S, st), act = seccionActual(S, st);
      return act ? todo.filter(it => G().seccionDe(it) === act) : todo;
    }
    let b = S.catalogo || [];
    // En el catálogo abierto solo se llega hasta Raro; de los consumibles, solo los esenciales; nada de lo que sale solo de botín.
    if(!st.tienda && !st.verCompleto) b = b.filter(item => !TIERS_OCULTOS.includes(item.tier) && (!item.consumible || item.legacy) && !item.soloBotin);
    return b;
  }
  // Dentro de "consumibles": primero el stock fijo de la tienda, después los legacy, después el resto.
  function conStockYLegacyPrimero(st, items){
    const garantizados = st.tienda && Array.isArray(st.tienda.garantizados) ? new Set(st.tienda.garantizados) : null;
    const rango = it => (garantizados && garantizados.has(it.id)) ? 0 : (it.legacy ? 1 : 2);
    return items.slice().sort((a, b) => {
      if(grupoCompraDe(a.tipoItem) !== 'consumibles' || grupoCompraDe(b.tipoItem) !== 'consumibles') return 0;
      return rango(a) - rango(b);
    });
  }
  // Los ítems que pasan los filtros activos, ya ordenados.
  function visibles(S, st){
    const f = st.filtro || FiltroCatalogo.vacio(), ctx = ctxFiltro(S, st);
    return FiltroCatalogo.ordenar(base(S, st).filter(item => FiltroCatalogo.pasa(item, f, ctx)), f, ctx);
  }
  // La fila de un ítem. gestion: los botones de Editar/Eliminar del catálogo propio de la ficha.
  function rowHtml(S, st, item, o){
    o = o || {};
    const dano = FichaCombate.armaDanoTxt(item);
    const defVal = E().defValor(item);
    const statTxt = dano ? `Daño ${dano}` : (defVal ? `Defensa ${defVal>0?'+':''}${fmt(defVal)}` : '');
    const tierColor = E().TIER_COLOR[item.tier] || E().TIER_COLOR['Común'];
    const catLabel = E().CATEGORIA_LABEL[item.tipoItem];
    const slotInfo = E().slotOcupado(S, item);
    const quedan = unidadesGondola(st, item.id);   // la góndola: cuántos quedan (null = sin límite)
    return `<div class="cat-row cat-card" data-catid="${item.id}">
    ${E().thumb(item)}
    <div class="cat-info">
      <div class="cat-card-titulo">
        <div class="cat-nombre">${esc(item.nombre)}${item._bib && typeof ItemsSubidos !== 'undefined' ? ` <span class="hint" style="font-weight:600;${item._bib.auditado ? '' : 'color:#e0a040'}" title="Lo subió alguien del grupo${item._bib.auditado ? '' : ' y todavía no lo revisó el dueño (se puede usar igual)'}">${esc(ItemsSubidos.etiqueta(item))}</span>` : ''}</div>
        ${item.tier && E().veCalidad() ? `<div class="cat-tier-badge" style="color:${tierColor};border-color:${tierColor};background:${tierColor}22">${esc(item.tier)}</div>` : ''}
      </div>
      <div class="cat-meta">${precioHtml(st, item)} · Peso ${fmt(num(item.peso))}${statTxt ? ` · ${esc(statTxt)}` : ''}${item.consumible?` · consumible${item.curahp?` (${num(item.curahp)>0?'+':''}${fmt(num(item.curahp))} HP)`:''}`:''}</div>
      ${catLabel ? `<div class="cat-tipo">${esc(catLabel)}</div>` : ''}
      ${slotInfo && (slotInfo.ocupado || slotInfo.equipados.length) ? `<div class="cat-slot-fila">
        ${slotInfo.ocupado ? `<span class="cat-slot-badge">Slot ocupado</span>` : ''}
        ${slotInfo.equipados.length ? `<button type="button" class="cat-btn-comparar" data-comparar="${item.id}">Comparar</button>` : ''}
      </div>` : ''}
      ${ItemCorto.grillaHtml(item)}
    </div>
    <div class="cat-actions">
      ${quedan !== null ? `<span class="hint" title="Gastable de la góndola: se repone cuando el GM vuelve a publicar la tienda">🧺 ${quedan ? `quedan ${fmt(quedan)}` : 'agotado'}</span>` : ''}
      <input type="number" class="cat-qty" data-catqty="${item.id}" value="1" min="1"${quedan !== null ? ` max="${Math.max(1, quedan)}"` : ''}${quedan === 0 ? ' disabled' : ''}>
      ${st.tienda && st.tienda.agregarGratis ? `<button class="cat-btn add" data-catalogoadd="${item.id}" title="El GM permitió agregar ítems gratis en esta tienda">Agregar a mochila (gratis)</button>` : ''}
      <button class="cat-btn buy" data-catalogocarrito="${item.id}"${quedan === 0 ? ' disabled' : ''}>+ Carrito</button>
    </div>
    <div class="cat-manage">
      <button data-view="catalogo:${item.id}">Ver</button>
      ${o.gestion !== false ? `<button data-catalogoedit="${item.id}">Editar</button>
      <button data-catalogodel="${item.id}">Eliminar</button>` : ''}
    </div>
  </div>`;
  }
  function catalogoHtml(S, st, o){
    const f = st.filtro || FiltroCatalogo.vacio();
    const vis = visibles(S, st);
    const fila = item => rowHtml(S, st, item, o);
    // Agrupado por qué es (con el orden «Por tipo»); con otro orden, una sola lista.
    const html = FiltroCatalogo.agrupar(vis, f).map(g => `
      <div class="cat-grouphead">${esc(g.label)} · ${fmt(g.items.length)}</div>
      <div class="cat-grid">${conStockYLegacyPrimero(st, g.items).map(fila).join('')}</div>`).join('');
    // Lo que busca está en otra pestaña: avisarlo (dueño, 2026-10-08: sin pestaña «Todo», pero que no se pierda nada).
    let otras = '';
    if(st.tienda && !st.verCompleto && String(f.buscar || '').trim()){
      const act = seccionActual(S, st), ctx = ctxFiltro(S, st), n = {};
      todoTienda(S, st).forEach(it => { const k = G() ? G().seccionDe(it) : ''; if(k && k !== act && FiltroCatalogo.pasa(it, {...f, parte: ''}, ctx)) n[k] = (n[k] || 0) + 1; });
      const ks = Object.keys(n);
      if(ks.length) otras = SECCIONES_CSS + `<div class="tienda-sec-otra">🔎 También hay en ${ks.map(k => `<button type="button" data-tienda-seccion="${k}">${G().SECCIONES[k].icono} ${esc(G().SECCIONES[k].label)} · ${fmt(n[k])}</button>`).join(' ')}</div>`;
    }
    if(vis.length) return otras + html;
    if(otras) return otras;
    let vacioMsg = 'El catálogo está vacío. Tocá "+ Ítem al catálogo" para cargar el primero.';
    if(FiltroCatalogo.cuantos(f)) vacioMsg = `${st.tienda ? 'El vendedor no tiene nada' : 'No hay ítems'} con esos filtros. Probá sacar alguno (✕ Limpiar todo).`;
    else if(st.tienda) vacioMsg = 'El vendedor no tiene nada para vender.';
    return `<div class="hint">${vacioMsg}</div>`;
  }
  // El cartelito de la tienda (tamaño, ajuste de precio y de venta), o '' sin tienda.
  function badge(st){
    const t = st.tienda;
    if(!t) return '';
    const pct = Number(t.ajustePrecio) || 0;
    const extra = pct ? ` · ${pct < 0 ? '-' : '+'}${Math.abs(pct)}%` : '';
    const pv = Number(t.ajusteVenta) || 0;
    const sk = conStockActivo(st) && t.stock ? ` · piezas únicas: lo que se compra se repone (quedan ${Math.max(0, t.stock.reserva - t.stock.reposiciones)} reposiciones)` : '';
    return `Tienda · ${t.tamanoLabel || 'vendedor'}${extra}${pv ? ` · venta ${pv < 0 ? '-' : '+'}${Math.abs(pv)}%` : ''}${sk}`;
  }

  /* ---------- Carrito y compra ---------- */
  function carrito(S, st){
    if(!st.carrito.length) return {html: `<div class="carrito-vacio">Carrito vacío — usá "+ Carrito" en los ítems que quieras comprar.</div>`, total: 0, puede: false, falta: 0};
    let total = 0;
    const html = st.carrito.map(ent => {
      const item = itemCatalogo(S, st, ent.catId);
      if(!item) return '';
      const subtotal = precioDeCompra(st, item) * ent.cantidad;
      total += subtotal;
      return `<div class="carrito-item">
      <span class="carrito-nombre">${esc(item.nombre)} ×${fmt(ent.cantidad)}</span>
      <span class="carrito-subtotal">${fmt(subtotal)} DDE</span>
      <button class="carrito-rm" data-carritorm="${ent.catId}">×</button>
    </div>`;
    }).join('');
    const dde = num(S.meta.dde);
    return {html, total, puede: total <= dde, falta: Math.max(0, total - dde)};
  }
  function agregarAlCarrito(S, st, id, cantidad, ui){
    const item = itemCatalogo(S, st, id);
    if(!item) return;
    cantidad = Math.max(1, num(cantidad) || 1);
    const existente = st.carrito.find(e=>e.catId===id);
    if(limitado(st, id)){   // pieza única (2026-10-07): una sola por tienda
      if(existente){ ui.toast(`De ${item.nombre} hay uno solo: ya está en tu carrito`); return; }
      cantidad = 1;
    }
    const quedan = unidadesGondola(st, id);   // la góndola: no más de lo que queda
    if(quedan !== null){
      const yaLleva = existente ? existente.cantidad : 0;
      if(yaLleva >= quedan){ ui.toast(quedan ? `De ${item.nombre} quedan ${fmt(quedan)}: ya los tenés en el carrito` : `${item.nombre}: agotado`); return; }
      cantidad = Math.min(cantidad, quedan - yaLleva);
    }
    if(existente) existente.cantidad += cantidad;
    else st.carrito.push({catId:id, cantidad});
    ui.toast(`${item.nombre} ×${cantidad} agregado al carrito`);
  }
  function quitarDelCarrito(st, catId){ st.carrito = st.carrito.filter(e=>e.catId!==catId); }
  function agregarConsumible(S, itemBase, cantidad){
    let restante = num(cantidad);
    const existentes = S.inventario.filter(i => !i.equipado && i.consumible && i.nombre === itemBase.nombre);
    for(const stack of existentes){
      if(restante <= 0) break;
      const espacio = stackMaxDe(itemBase) - num(stack.unidades);
      if(espacio <= 0) continue;
      const mover = Math.min(espacio, restante);
      stack.unidades = num(stack.unidades) + mover;
      restante -= mover;
    }
    while(restante > 0){
      const nuevo = structuredClone(itemBase);
      nuevo.id = uid();
      nuevo.equipado = false;
      nuevo.ranuras = itemBase.ranuras ?? 1;
      const enEsteStack = Math.min(stackMaxDe(itemBase), restante);
      nuevo.unidades = enEsteStack;
      nuevo.cargaActual = Math.max(1, num(itemBase.cargaMax) || 1);
      S.inventario.push(nuevo);
      restante -= enEsteStack;
    }
  }
  function crearItems(S, item, cantidad){
    if(item.consumible){ agregarConsumible(S, item, cantidad); return; }
    for(let i=0; i<cantidad; i++){
      const nuevo = structuredClone(item);
      nuevo.catId = item.id;   // de qué ítem del catálogo salió (↻ Actualizar desde el catálogo, 2026-10-07)
      nuevo.id = uid();
      nuevo.equipado = false;
      nuevo.unidades = 1;
      nuevo.ranuras = item.ranuras ?? 1;
      S.inventario.push(nuevo);
    }
  }
  // Agregar gratis solo si el GM lo permitió en la tienda abierta (por defecto se compra con el carrito).
  function agregarGratis(S, st, id, cantidad, ui){
    if(!(st.tienda && st.tienda.agregarGratis)){ ui.toast('Esta tienda no permite agregar ítems gratis: usá el carrito'); return; }
    const item = itemCatalogo(S, st, id);
    if(!item) return;
    cantidad = Math.max(1, num(cantidad) || 1);
    crearItems(S, item, cantidad);
    ui.cambio(['inventario']);
    ui.toast(`${item.nombre} ×${cantidad} agregado a la mochila (gratis)`);
  }
  async function comprar(S, st, ui){
    if(!st.carrito.length) return;
    let total = 0;
    st.carrito.forEach(ent => { const item = itemCatalogo(S, st, ent.catId); if(item) total += precioDeCompra(st, item) * ent.cantidad; });
    if(total > num(S.meta.dde)){ ui.toast(`No te alcanzan los DDE — necesitás ${fmt(total)} y tenés ${fmt(num(S.meta.dde))}`); return; }
    // Piezas únicas: antes de cobrar, se sacan del stock (y se reponen) con una transacción; si alguien se las llevó, no se compra nada.
    const res = await reservarStock(S, st);
    if(res.faltan && res.faltan.length){
      st.carrito = st.carrito.filter(e => !res.faltan.includes(e.catId));
      ui.toast(`Se te adelantaron: ${res.faltan.map(id => (itemCatalogo(S, st, id) || {}).nombre || id).join(', ')} ya no está. Salió de tu carrito; revisá y volvé a comprar.`);
      ui.cambio([]);
      return;
    }
    if(res.error) ui.toast(res.error);
    S.meta.dde = num(S.meta.dde) - total;
    st.carrito.forEach(ent => { const item = itemCatalogo(S, st, ent.catId); if(item) crearItems(S, item, ent.cantidad); });
    const cantidadItems = st.carrito.length;
    st.carrito = [];
    ui.cambio(['inventario', 'meta']);
    ui.toast(`Compra realizada · ${cantidadItems} tipo(s) de ítem · -${fmt(total)} DDE` + (res.repuestos && res.repuestos.length ? ` · en su lugar llegó: ${res.repuestos.map(r => r[1]).join(', ')}` : ''));
    if(res.vendidos && res.vendidos.length && typeof mesaLinea === 'function'){
      const quien = ((S.meta && S.meta.nombre) || 'Alguien').trim();
      mesaLinea(`🏪 ${quien} compró ${res.vendidos.join(', ')}` + (res.repuestos.length ? ` · llegó a la tienda: ${res.repuestos.map(r => r[1]).join(', ')}` : '') + (res.agotados.length ? ` · ya no hay reposición: ${res.agotados.join(', ')} no vuelve` : ''), 'recordatorio');
    }
  }

  /* ---------- Piezas únicas y reposición (2026-10-07, dueño: «comprar un ítem y que automáticamente se reemplace por otro del mismo tipo y
     calidad, para todo el catálogo y todas las tiendas»; docs/rework-tiendas.md) ----------
     Cada pieza de una tienda publicada es única, salvo el stock fijo (las pociones de siempre). Lo que hay ahora vive en `tienda/stock`
     ({version, items, reposiciones, reserva, vendidos}), que el GM escribe al publicar (`version` = `stockVersion` de la tienda). Al comprar,
     una transacción saca la pieza y pone otra de la misma parte, familia y calidad (`GeneradorTiendas.otro` con `reponer`), mientras quede
     reserva; sin reserva, la pieza no vuelve. Sin el documento (o sin las reglas publicadas), la tienda funciona como antes: sin límite. */
  let stockCache = null;
  const conStockActivo = st => !!(st.tienda && st.tienda.stockVersion && stockCache && stockCache.version === st.tienda.stockVersion);
  const limitado = (st, id) => conStockActivo(st) && !(st.tienda.garantizados || []).includes(id) && !enGondola(st, id);
  /* La góndola (P181, dueño 2026-10-08): los gastables no son piezas únicas; vienen de a 3 (`stock.gondola = {id: unidades}`) y se reponen al
     volver a publicar. Sin el stock (o sin las reglas), sin límite. */
  const enGondola = (st, id) => !!(st.tienda && (st.tienda.gondola || []).includes(id));
  function unidadesGondola(st, id){
    if(!enGondola(st, id) || !conStockActivo(st) || !stockCache.gondola || stockCache.gondola[id] === undefined) return null;
    return Math.max(0, num(stockCache.gondola[id]));
  }
  // La tienda con lo que queda en stock (si el stock es de esta publicación).
  function conStock(t){
    if(t && t.stockVersion && stockCache && stockCache.version === t.stockVersion && Array.isArray(stockCache.items)){
      t.items = stockCache.items.slice();
      t.stock = {reposiciones: num(stockCache.reposiciones), reserva: num(stockCache.reserva), vendidos: num(stockCache.vendidos)};
    }
    return t;
  }
  const refStock = () => fbDb.doc(fbRutaCampana('tienda/stock'));
  async function leerStock(){
    try{ const s = await refStock().get(); stockCache = s.exists ? s.data() : null; }catch(e){ stockCache = null; }
    return stockCache;
  }
  // Escucha el stock: cada vez que alguien compra, alCambiar() (la pantalla aplica conStock y redibuja). Devuelve cómo dejar de escuchar.
  function escucharStock(alCambiar){
    try{ return refStock().onSnapshot(s => { stockCache = s.exists ? s.data() : null; alCambiar(stockCache); }, err => console.error('No se pudo escuchar el stock de la tienda:', err)); }
    catch(e){ return () => {}; }
  }
  async function reservarStock(S, st){
    const ids = st.carrito.map(e => e.catId).filter(id => limitado(st, id));
    const deGondola = st.carrito.filter(e => unidadesGondola(st, e.catId) !== null);
    if((!ids.length && !deGondola.length) || typeof fbDb === 'undefined') return {vendidos: [], repuestos: [], agotados: []};
    try{
      return await fbDb.runTransaction(async tx => {
        const d = await tx.get(refStock());
        if(!d.exists || d.data().version !== st.tienda.stockVersion) return {vendidos: [], repuestos: [], agotados: []};
        const x = d.data(), items = (x.items || []).slice();
        const faltan = ids.filter(id => !items.includes(id));
        const gond = {...(x.gondola || {})};
        deGondola.forEach(e => { if(num(gond[e.catId]) < e.cantidad) faltan.push(e.catId); });
        if(faltan.length) return {faltan};
        deGondola.forEach(e => { gond[e.catId] = num(gond[e.catId]) - e.cantidad; });
        let rep = num(x.reposiciones);
        const vendidos = [], repuestos = [], agotados = [];
        ids.forEach(id => {
          const viejo = itemCatalogo(S, st, id), i = items.indexOf(id);
          vendidos.push(viejo ? viejo.nombre : id);
          const nuevo = rep < num(x.reserva) && typeof GeneradorTiendas !== 'undefined'
            ? GeneradorTiendas.otro({tienda: {...st.tienda, items}, viejo, catalogo: S.catalogo || [], reponer: true}) : null;
          if(nuevo){ items[i] = nuevo.id; rep++; repuestos.push([viejo ? viejo.nombre : id, nuevo.nombre]); }
          else{ items.splice(i, 1); agotados.push(viejo ? viejo.nombre : id); }
        });
        tx.update(refStock(), {items, reposiciones: rep, vendidos: num(x.vendidos) + ids.length, ...(deGondola.length ? {gondola: gond} : {}), actualizado: firebase.firestore.FieldValue.serverTimestamp()});
        stockCache = {...x, items, reposiciones: rep, vendidos: num(x.vendidos) + ids.length, gondola: gond};
        if(st.tienda) conStock(st.tienda);
        return {vendidos, repuestos, agotados};
      });
    }catch(err){
      console.error('No se pudo descontar el stock de la tienda:', err);
      return {vendidos: [], repuestos: [], agotados: [], error: 'No se pudo descontar el stock (¿faltan publicar las reglas de la tienda?): la compra sale igual, sin reposición.'};
    }
  }
  // Un ítem al azar entre los que pasan los filtros activos.
  function aleatorio(S, st){
    const vis = visibles(S, st);
    return vis.length ? vis[Math.floor(Math.random() * vis.length)] : null;
  }

  /* ---------- Vender (solo en una tienda) ----------
     Lo equipado no se vende. Cada tienda compra de todo: ítems de la mochila y del cinturón, y despojos (1 DDE cada uno). El "ajuste al
     vender" de la tienda sube o baja lo que se cobra, también en los despojos. */
  const ajusteVenta = st => st.tienda ? (Number(st.tienda.ajusteVenta) || 0) : 0;
  const precioVentaTienda = (st, base) => Math.max(0, Math.round(num(base) * (1 + ajusteVenta(st) / 100) * 100) / 100);
  function vendibles(S, st){
    const out = [];
    ['inventario', 'cinturon'].forEach(key => (S[key] || []).forEach(it => {
      if(it.equipado || it.reservado || it.enMesa) return;   // lo ofrecido a otro (🤝) no se vende
      const base = precioVenta(it);
      if(base > 0) out.push({clave: `${key}:${it.id}`, key, it, unidades: num(it.unidades) || 1, unit: precioVentaTienda(st, base)});
    }));
    return out;
  }
  function totalVenta(S, st){
    let t = 0;
    vendibles(S, st).forEach(v => { t += (st.venderSel[v.clave] || 0) * v.unit; });
    t += (st.venderSel.despojos || 0) * precioVentaTienda(st, 1);
    return Math.round(t * 100) / 100;
  }
  function venderHtml(S, st){
    const lista = vendibles(S, st);
    const desp = Math.max(0, Math.floor(num(S.loot && S.loot.normal)));
    const ajuste = ajusteVenta(st);
    const fila = (clave, nombre, max, unit, extra) => `<div class="vender-fila" style="display:grid;grid-template-columns:24px 1fr auto 74px;gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid var(--line-soft)">
      <input type="checkbox" data-vender-chk="${esc(clave)}"${st.venderSel[clave] ? ' checked' : ''}>
      <span>${esc(nombre)}${extra || ''}</span>
      <span class="hint">${fmt(unit)} DDE c/u</span>
      ${max > 1 ? `<input type="number" min="1" max="${max}" data-vender-cant="${esc(clave)}" value="${st.venderSel[clave] || max}" style="width:70px">` : `<span class="hint">×1</span>`}
    </div>`;
    return `
    <p class="hint" style="margin:0 0 8px">${ajuste ? `Esta tienda paga con un ajuste de ${ajuste > 0 ? '+' : ''}${ajuste}%. ` : ''}Lo que tenés equipado no se puede vender: sacalo antes.</p>
    ${desp > 0 ? fila('despojos', 'Despojos', desp, precioVentaTienda(st, 1)) : ''}
    ${lista.map(v => fila(v.clave, v.it.nombre || '(sin nombre)', v.unidades, v.unit, v.unidades > 1 ? ` <span class="hint">(tenés ${fmt(v.unidades)})</span>` : '')).join('')}
    ${!lista.length && !desp ? '<div class="hint">No tenés nada para vender.</div>' : ''}`;
  }
  // Un cambio en la ventana de vender (tildar o la cantidad). el: el input que cambió.
  function venderCambio(st, el){
    const chk = el.dataset.venderChk, cant = el.dataset.venderCant;
    if(chk !== undefined){
      const fila = el.closest('.vender-fila').querySelector('[data-vender-cant]');
      const max = fila ? num(fila.max) : 1;
      st.venderSel[chk] = el.checked ? (fila ? Math.max(1, Math.min(max, num(fila.value))) : 1) : 0;
    }else if(cant !== undefined){
      const max = num(el.max);
      const q = Math.max(1, Math.min(max, Math.round(num(el.value)) || 1));
      el.value = q;
      if(st.venderSel[cant]) st.venderSel[cant] = q;
    }
  }
  function vender(S, st, ui){
    if(!st.tienda){ ui.toast('La tienda está cerrada'); return false; }
    const total = totalVenta(S, st);
    if(!total){ ui.toast('Elegí qué vender'); return false; }
    const nombres = [];
    vendibles(S, st).forEach(v => {
      const q = Math.min(st.venderSel[v.clave] || 0, v.unidades);
      if(!q) return;
      nombres.push(q > 1 ? `${v.it.nombre} ×${q}` : v.it.nombre);
      if(q >= v.unidades) S[v.key] = S[v.key].filter(x => x.id !== v.it.id); else v.it.unidades = v.unidades - q;
    });
    const qd = Math.min(st.venderSel.despojos || 0, Math.max(0, Math.floor(num(S.loot.normal))));
    if(qd){ S.loot.normal = num(S.loot.normal) - qd; nombres.push(`${qd} despojo${qd === 1 ? '' : 's'}`); }
    S.meta.dde = Math.round((num(S.meta.dde) + total) * 100) / 100;
    st.venderSel = {};
    ui.cambio(['inventario', 'cinturon', 'meta', 'loot']);
    ui.toast(`Vendiste ${nombres.join(', ')} · +${fmt(total)} DDE (tenés ${fmt(num(S.meta.dde))})`);
    return true;
  }

  /* ---------- Reparación con el herrero ----------
     Las tiendas que el GM marca como «herrero» reparan por punto de durabilidad (por defecto 1 DDE por punto) y cada punto reparado
     también devuelve 1 de Armadura rota de esa pieza. NO se puede reparar durante el combate. */
  const precioReparacion = st => st.tienda ? Math.max(0, num(st.tienda.precioReparacion === undefined ? 1 : st.tienda.precioReparacion)) : 1;
  // Una pieza rota (durabilidad 0) cuesta el doble de reparar (dueño, 2026-10-04: cuidar el equipo antes de que se rompa del todo).
  const RECARGO_ROTO = 2;
  // `reparoRoto`: se rompió y todavía no se terminó de reparar (así no se puede reparar 1 punto al doble y el resto a precio normal).
  const factorRoto = it => C().itemRoto(it) || it.reparoRoto ? RECARGO_ROTO : 1;
  const costoDe = (it, pts, p) => Math.round(pts * p * factorRoto(it) * 100) / 100;
  function aReparar(S){
    return (S.inventario || []).filter(i => C().durableItem(i) && (C().durActual(i) < C().durMax(i) || C().armRotaDe(i) > 0))
      .map(i => ({it: i, faltan: Math.max(0, C().durMax(i) - C().durActual(i))}));
  }
  function repararHtml(S, st, bloqueado){
    const p = precioReparacion(st), lista = aReparar(S), dde = num(S.meta.dde);
    const totalPts = lista.reduce((a, x) => a + x.faltan, 0), totalCosto = Math.round(lista.reduce((a, x) => a + costoDe(x.it, x.faltan, p), 0) * 100) / 100;
    const html = `
    <p class="hint" style="margin:0 0 8px">${p > 0 ? `El herrero cobra <b>${fmt(p)} DDE por punto</b> de durabilidad; una pieza <b>rota</b> (durabilidad 0) cuesta el doble.` : 'Este herrero repara gratis.'} Cada punto reparado también devuelve 1 de Armadura rota de esa pieza. Tenés <b>${fmt(dde)} DDE</b>.</p>
    ${bloqueado ? '<p class="hint" style="margin:0 0 8px;color:#FF9E7E">⚔ No se puede reparar durante el combate: esperá a que el GM pase el mapa a modo narrativo.</p>' : ''}
    ${lista.length ? lista.map(({it, faltan}) => `<div style="display:grid;grid-template-columns:1fr auto auto;gap:8px;align-items:center;padding:7px 0;border-bottom:1px solid var(--line)">
        <div><b>${esc(it.nombre)}</b> ${it.equipado ? '<span class="tag">equipado</span>' : ''}<div class="hint">🔧 ${fmt(C().durActual(it))}/${fmt(C().durMax(it))}${C().armRotaDe(it) ? ` · Armadura rota ×${fmt(C().armRotaDe(it))}` : ''}${C().itemRoto(it) ? ' · <b style="color:#FF7E7E">ROTO: reparar cuesta el doble</b>' : it.reparoRoto ? ' · <b style="color:#FF9E7E">se rompió: hasta dejarla entera, cuesta el doble</b>' : ''} · faltan ${fmt(faltan)} punto${faltan === 1 ? '' : 's'}</div></div>
        <button class="mini" data-rep="${esc(it.id)}:1"${bloqueado || faltan < 1 ? ' disabled' : ''}>+1 · ${fmt(costoDe(it, 1, p))} DDE</button>
        <button class="mini" data-rep="${esc(it.id)}:${faltan}"${bloqueado || faltan < 1 ? ' disabled' : ''}>Todo · ${fmt(costoDe(it, faltan, p))} DDE</button>
      </div>`).join('') : '<div class="hint">No tenés nada para reparar: todo tu equipo está entero.</div>'}`;
    return {html, totalPts, total: `Reparar todo cuesta: <b>${fmt(totalCosto)} DDE</b> (${fmt(totalPts)} punto${totalPts === 1 ? '' : 's'})`};
  }
  function reparar(S, st, pares, bloqueado, ui){   // pares: [{it, pts}]
    if(bloqueado){ ui.toast('No se puede reparar durante el combate'); return; }
    const p = precioReparacion(st);
    const cuantos = x => Math.min(x.pts, Math.max(0, C().durMax(x.it) - C().durActual(x.it)));
    const pts = pares.reduce((a, x) => a + cuantos(x), 0);
    if(!pts){ ui.toast('No hay nada para reparar'); return; }
    const costo = Math.round(pares.reduce((a, x) => a + costoDe(x.it, cuantos(x), p), 0) * 100) / 100;   // las rotas, el doble
    if(costo > num(S.meta.dde) + 1e-9){ ui.toast(`No te alcanza: reparar ${fmt(pts)} punto${pts === 1 ? '' : 's'} cuesta ${fmt(costo)} DDE y tenés ${fmt(num(S.meta.dde))}`); return; }
    pares.forEach(({it, pts: n}) => {
      const q = Math.min(n, Math.max(0, C().durMax(it) - C().durActual(it)));
      if(q <= 0) return;
      if(C().itemRoto(it)) it.reparoRoto = true;
      it.dur = C().durActual(it) + q;
      if(it.dur >= C().durMax(it)) delete it.reparoRoto;
      it.armRota = Math.max(0, C().armRotaDe(it) - q);
    });
    S.meta.dde = Math.round((num(S.meta.dde) - costo) * 100) / 100;
    ui.cambio(['inventario', 'meta']);
    ui.toast(`🔧 Reparaste ${fmt(pts)} punto${pts === 1 ? '' : 's'} por ${fmt(costo)} DDE (te quedan ${fmt(num(S.meta.dde))})`);
  }

  /* ---------- La tienda publicada ---------- */
  // campanas/<partida>/tienda/publicada ({json, abierta}): los ids que ofrece y los datos de esos ítems (itemsDatos).
  function desdeDoc(snap){
    if(!snap.exists) return null;
    let t;
    try{ t = JSON.parse(snap.data().json || ''); }catch(e){ return null; }
    // Ítems creados por el GM antes de correr la escala de Tipos (sin marca propia).
    (Array.isArray(t && t.itemsDatos) ? t.itemsDatos : []).forEach(it => {
      if(!it || FichaGuardado.CATALOGO_IDS.has(it.id) || num(it.escalaTipos) >= FichaGuardado.ESCALA_TIPOS) return;
      FichaGuardado.migrarObjTipos(it);
      it.escalaTipos = FichaGuardado.ESCALA_TIPOS;
    });
    if(!(t && Array.isArray(t.items) && t.items.length)) return null;
    t.abierta = snap.data().abierta === true;   // el GM decide cuándo está accesible
    return conStock(t);   // lo que queda en stock (piezas únicas, 2026-10-07)
  }

  return {GRUPO_COMPRA_MAP, GRUPO_COMPRA_LABEL, GRUPO_COMPRA_ORDEN, grupoCompraDe, TIERS_ORDEN, TIERS_OCULTOS, STACK_MAX, stackMaxDe, nueva,
    precioDeCompra, precioVenta, precioHtml, normalizarBusqueda, textoBusqueda, itemCatalogo, danoDe, libre, ctxFiltro, base, conStockYLegacyPrimero,
    visibles, rowHtml, catalogoHtml, badge, carrito, secciones, seccionActual, seccionesHtml, elegirSeccion, agregarAlCarrito, quitarDelCarrito, agregarConsumible,
    crearItems, agregarGratis, comprar, aleatorio, ajusteVenta, precioVentaTienda, vendibles, totalVenta, venderHtml, venderCambio, vender,
    precioReparacion, costoReparar: costoDe, RECARGO_ROTO, aReparar, repararHtml, reparar, desdeDoc, conStock, leerStock, escucharStock, limitado};
})();
