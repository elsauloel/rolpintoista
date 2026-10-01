// js/09-inventario-y-tienda.js — tramo 9 de 14 del script de ficha.html (paso 5, nivel A: mismo código, en el mismo orden).
/* ---------- Acciones sin Nitros suficientes ----------
   No hay Nitros negativos: si una acción cuesta más de lo que tenés, se
   frena con un pop-up (Cancelar, o Realizar de cualquier modo — por ejemplo
   para saber la tirada de ataque). Si se hace igual, se gastan los Nitros que
   haya (hasta 0) y queda una línea roja en la Mesa (desde: 'alerta-roja'). */
let sinNitrosPendiente = null;

function avisarSinNitros(costo, accion, continuar){
  sinNitrosPendiente = {continuar, costo, accion};
  $('#sin-nitros-texto').innerHTML = `No podés <b>${esc(accion)}</b>: cuesta <b>${fmt(costo)} No2</b> y tenés <b>${fmt(Math.max(0, num(S.nitros)))}</b>.`;
  $('#scrim-sin-nitros').classList.add('open');
}
// Publica la línea roja y devuelve cuántos Nitros descontar (los que haya, nunca de más).
function gastoNitrosForzado(costo, hizo){ return FichaAcciones.gastoNitrosForzado(S, costo, hizo); }   // comun/ficha-acciones.js
function cerrarSinNitros(){ sinNitrosPendiente = null; $('#scrim-sin-nitros').classList.remove('open'); }
$('#sin-nitros-x').onclick = $('#sin-nitros-cancel').onclick = cerrarSinNitros;
$('#scrim-sin-nitros').addEventListener('mousedown', e => { if(e.target.id === 'scrim-sin-nitros') cerrarSinNitros(); });
$('#sin-nitros-igual').onclick = () => {
  const p = sinNitrosPendiente;
  cerrarSinNitros();
  if(p) p.continuar();
};

/* ---------- Equipar con el slot lleno: Reemplazar o Comparar ----------
   Al tocar Equipar en un ítem de la mochila cuyo slot no tiene lugar, en
   vez de un aviso se abre este menú. Comparar usa la misma ventana que el
   catálogo (abrirComparar). */
let slotLlenoItemId = null;

/* En modo combate, equipar o desequipar un ítem cuesta No2 (IT2.nitrosEquipar) cada vez:
   reemplazar uno por otro son dos. Sin No2 suficientes: el pop-up de siempre (cancelar o
   hacerlo igual, con la línea roja en la Mesa). En narrativo no cuesta nada. `accion` es lo que
   se hace una vez pagado. */
function conCostoEquipar(veces, infinitivo, pasado, accion){
  const costo = (modoMapaListo && modoMapa === 'combate') ? veces * IT2.nitrosEquipar : 0;
  if(!costo){ accion(); return; }
  const pagar = forzar => {
    const gasto = forzar && costo > num(S.nitros) ? gastoNitrosForzado(costo, pasado) : costo;
    S.nitros = num(S.nitros) - gasto;
    renderNitros();
    accion();
    toast(`−${fmt(gasto)} No2 (equipar en combate)`);
  };
  if(costo > num(S.nitros)) avisarSinNitros(costo, infinitivo, () => pagar(true));
  else pagar(false);
}

function abrirSlotLleno(itemId){
  const it = S.inventario.find(x => x.id === itemId);
  const info = it && slotOcupadoInfo(it);
  if(!it || !info || !info.equipados.length) return false;
  slotLlenoItemId = itemId;
  const slotDef = SLOT_DEFS.find(sd => sd.cats.includes(it.tipoItem));
  $('#slot-lleno-body').innerHTML = `
    <div class="hint" style="margin-bottom:10px">${esc(slotDef.label)} no tiene lugar para <b>${esc(it.nombre)}</b>. Ya tenés equipado:</div>
    ${info.equipados.map(e => `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px">
      <b>${esc(e.nombre)}</b>
      <button type="button" class="btn" data-reemplazar="${e.id}:${it.id}">Reemplazar</button>
    </div>`).join('')}
    <button type="button" class="btn" data-slot-comparar="1" style="width:100%;margin-top:8px">Comparar</button>`;
  $('#scrim-slot-lleno').classList.add('open');
  return true;
}

// Saca el equipado y pone el de la mochila. Si el slot igual no alcanza
// (ej. un arma de dos manos con escudo puesto), se deshace y se avisa.
function reemplazarEquipado(equipadoId, nuevoId){
  const nuevo = S.inventario.find(x => x.id === nuevoId);
  const viejo = S.inventario.find(x => x.id === equipadoId);
  if(!nuevo || !viejo) return;
  const slotDef = SLOT_DEFS.find(sd => sd.cats.includes(nuevo.tipoItem));
  // Se prueba si entra ANTES de cobrar nada.
  viejo.equipado = false;
  nuevo.equipado = true;
  const usado = slotDef ? (computeSlots().find(s => s.id === slotDef.id)?.usado || 0) : 0;
  viejo.equipado = true;
  nuevo.equipado = false;
  if(slotDef && usado > slotDef.max){
    toast(`Igual no entra: ${slotDef.label} quedaría en ${fmt(usado)} / ${fmt(slotDef.max)}. Sacá otro ítem del slot primero.`);
    return;
  }
  conCostoEquipar(2, `reemplazar ${viejo.nombre} por ${nuevo.nombre}`, `reemplazó ${viejo.nombre} por ${nuevo.nombre}`, () => {
    viejo.equipado = false;
    nuevo.equipado = true;
    $('#scrim-comparar').classList.remove('open');
    $('#scrim-slot-lleno').classList.remove('open');
    renderInventario();
    refresh();
    toast(`${nuevo.nombre} equipado en lugar de ${viejo.nombre}`);
  });
}
$('#slot-lleno-x').onclick = () => $('#scrim-slot-lleno').classList.remove('open');
$('#scrim-slot-lleno').addEventListener('mousedown', e => { if(e.target.id === 'scrim-slot-lleno') $('#scrim-slot-lleno').classList.remove('open'); });

let comparandoItemId = null;
let comparandoEquipadoId = null;

function abrirComparar(itemId){
  const item = itemCatalogo(itemId);
  const info = item && slotOcupadoInfo(item);
  if(!item || !info || !info.equipados.length) return;
  comparandoItemId = itemId;
  comparandoEquipadoId = info.equipados[0].id;
  renderComparar();
  $('#scrim-comparar').classList.add('open');
}

function renderComparar(){
  const item = itemCatalogo(comparandoItemId);
  if(!item){ $('#scrim-comparar').classList.remove('open'); return; }
  const info = slotOcupadoInfo(item);
  const equipados = info ? info.equipados : [];
  const equipado = equipados.find(e => e.id === comparandoEquipadoId) || equipados[0];
  if(!equipado){ $('#scrim-comparar').classList.remove('open'); return; }

  const statsEq = statsComparablesDe(equipado);
  const statsNuevo = statsComparablesDe(item);
  const claves = [...new Set([...Object.keys(statsEq), ...Object.keys(statsNuevo)])];

  const elegirHtml = equipados.length > 1 ? `<div class="comparar-elegir">
    ${equipados.map(e => `<button type="button" class="${e.id===equipado.id?'activo':''}" data-comparar-elegir="${e.id}">${esc(e.nombre)}</button>`).join('')}
  </div>` : '';

  const pesoEq = num(equipado.peso), pesoNuevo = num(item.peso);
  const pesoCls = pesoNuevo < pesoEq ? 'mejora' : pesoNuevo > pesoEq ? 'empeora' : '';
  const filaPeso = `<tr><td>Peso</td><td>${fmt(pesoEq)}</td><td class="${pesoCls}">${fmt(pesoNuevo)}${pesoNuevo<pesoEq?' ▲':pesoNuevo>pesoEq?' ▼':''}</td></tr>`;

  const filasHtml = filaPeso + claves.map(k => {
    const ve = statsEq[k] || 0, vn = statsNuevo[k] || 0;
    const cls = vn > ve ? 'mejora' : vn < ve ? 'empeora' : '';
    const label = STAT_COMPARABLE_LABEL[k] || STAT_LABEL[k] || k;
    return `<tr><td>${esc(label)}</td><td>${fmt(ve)}</td><td class="${cls}">${fmt(vn)}${vn>ve?' ▲':vn<ve?' ▼':''}</td></tr>`;
  }).join('');

  $('#comparar-body').innerHTML = `
    ${elegirHtml}
    <div class="comparar-cabeceras">
      <div class="comparar-cabecera">
        <div class="cat-nombre">${esc(equipado.nombre)} <span class="hint">(equipado)</span></div>
        <div class="cat-meta">Peso ${fmt(num(equipado.peso))}</div>
      </div>
      <div class="comparar-cabecera">
        <div class="cat-nombre">${esc(item.nombre)}</div>
        <div class="cat-meta">${precioTiendaHtml(item)} · Peso ${fmt(num(item.peso))}</div>
      </div>
    </div>
    <table class="comparar-tabla">
      <thead><tr><th>Stat</th><th>Equipado</th><th>Nuevo</th></tr></thead>
      <tbody>${filasHtml}</tbody>
    </table>
    ${S.inventario.some(x => x.id === item.id && !x.equipado) ? `<button type="button" class="btn primary" data-reemplazar="${equipado.id}:${item.id}" style="width:100%;margin-top:12px">Reemplazar ${esc(equipado.nombre)}</button>` : ''}
  `;
}

let carritoCatalogo = [];

const normalizarBusqueda = s => (s || '').toString().normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim();

// Devuelve los ítems del catálogo que pasan los filtros activos ahora
// mismo (categoría, slot, tier, búsqueda) — la usan tanto el render de
// la grilla como el botón de Ítem aleatorio, para que "aleatorio" sea
// siempre "aleatorio dentro de lo que se está viendo".
// Ordenar por categoría deja los grupos de siempre; cualquier otro
// criterio pasa a lista plana, porque agrupado no se puede ver de un
// vistazo lo más caro o lo más pesado del catálogo.
const TIERS_ORDEN = ['Común', 'Buena Calidad', 'Raro', 'Excepcional', 'Legendario'];

// Daño máximo posible del arma. Lo que no es arma da 0 y queda al final
// del orden por daño (ver ordenarCatalogo).
function danoDe(item){
  if(!ES_ARMA(item.tipoItem)) return 0;
  const dados = Math.max(1, num(item.peso) || 1) + Math.max(0, num(item.danoAmplificado));
  return dados * (num(item.tipoDado) || 8) + num(item.danoFijo);
}

const ORDENES_CATALOGO = {
  categoria: {label:'Categoría', cmp:(a,b) => TIERS_ORDEN.indexOf(a.tier) - TIERS_ORDEN.indexOf(b.tier)},
  nombre:    {label:'Nombre',    cmp:(a,b) => a.nombre.localeCompare(b.nombre, 'es')},
  precio:    {label:'Precio',    cmp:(a,b) => precioDeCompra(a) - precioDeCompra(b)},
  peso:      {label:'Peso',      cmp:(a,b) => num(a.peso) - num(b.peso)},
  rareza:    {label:'Rareza',    cmp:(a,b) => TIERS_ORDEN.indexOf(a.tier) - TIERS_ORDEN.indexOf(b.tier)},
  dano:      {label:'Daño',     valor: danoDe},
  defensa:   {label:'Defensa',  valor: defValorDe},
};

let catalogoOrden = 'categoria';
let catalogoOrdenDesc = false;

function ordenarCatalogo(items){
  const def = ORDENES_CATALOGO[catalogoOrden] || ORDENES_CATALOGO.categoria;
  const porNombre = (a, b) => a.nombre.localeCompare(b.nombre, 'es');
  // Criterio con valor propio (daño, defensa): lo que no aplica queda al
  // final siempre, no mezclado entre los que sí tienen.
  if(def.valor){
    const con = items.filter(i => def.valor(i) > 0);
    const sin = items.filter(i => def.valor(i) <= 0).sort(porNombre);
    con.sort((a, b) => def.valor(a) - def.valor(b) || porNombre(a, b));
    if(catalogoOrdenDesc) con.reverse();
    return [...con, ...sin];
  }
  const orden = items.slice().sort((a,b) => def.cmp(a,b) || porNombre(a,b));
  return catalogoOrdenDesc ? orden.reverse() : orden;
}

// Dentro de "consumibles": si hay una tienda cargada, primero su stock
// fijo (tiendaCargada.garantizados), después los legacy ("los de
// siempre"), después el resto. Sin tienda cargada no hay stock fijo, así
// que solo se aplica el criterio legacy. No toca el orden de nada que no
// sea consumible: el sort es estable y el comparador da 0 apenas uno de
// los dos no es consumible.
function conStockYLegacyPrimero(items){
  const garantizados = tiendaCargada && Array.isArray(tiendaCargada.garantizados) ? new Set(tiendaCargada.garantizados) : null;
  const rango = it => (garantizados && garantizados.has(it.id)) ? 0 : (it.legacy ? 1 : 2);
  return items.slice().sort((a, b) => {
    if(grupoCompraDe(a.tipoItem) !== 'consumibles' || grupoCompraDe(b.tipoItem) !== 'consumibles') return 0;
    return rango(a) - rango(b);
  });
}

function renderCatalogoOrdenControles(){
  const sel = $('#catalogo-orden');
  if(sel && !sel.dataset.listo){
    sel.innerHTML = Object.entries(ORDENES_CATALOGO).map(([k,v]) => `<option value="${k}">${esc(v.label)}</option>`).join('');
    sel.dataset.listo = '1';
  }
  if(sel) sel.value = catalogoOrden;
  const b = $('#catalogo-orden-dir');
  if(b) b.textContent = catalogoOrdenDesc ? '↓ Mayor a menor' : '↑ Menor a mayor';
}

// Rarezas que no se ofrecen en el catálogo general del jugador.
const TIERS_OCULTOS = ['Excepcional', 'Legendario'];

// Botón del ojo en el footer: ignora tanto el recorte de la tienda cargada
// como el filtro de tier/consumibles del catálogo general — muestra
// literalmente todo lo que hay en S.catalogo, de referencia.
let verCatalogoCompleto = false;

function catalogoVisibles(){
  if(!Array.isArray(S.catalogo)) S.catalogo = structuredClone(DEFAULT.catalogo);
  const filtro = $('#catalogo-filtro') ? $('#catalogo-filtro').value : '';
  const filtroSlot = $('#catalogo-filtro-slot') ? $('#catalogo-filtro-slot').value : '';
  const filtroTier = $('#catalogo-filtro-tier') ? $('#catalogo-filtro-tier').value : '';
  const busqueda = normalizarBusqueda($('#catalogo-buscar') ? $('#catalogo-buscar').value : '');
  // Con una tienda cargada, el catálogo se recorta a lo que ese vendedor
  // ofrece; los filtros, la búsqueda y el carrito siguen funcionando igual.
  let base = S.catalogo;
  if(tiendaCargada && !verCatalogoCompleto){
    base = tiendaCargada.items.map(itemCatalogo).filter(Boolean);
  }
  // En el catálogo abierto solo se llega hasta Raro. Lo Excepcional y lo
  // Legendario existe igual: entra por un vendedor que lo ofrezca o de la
  // mano del máster, no comprándolo de la lista general.
  if(!tiendaCargada && !verCatalogoCompleto){
    base = base.filter(item => !TIERS_OCULTOS.includes(item.tier));
    // De los consumibles, el catálogo abierto solo ofrece los esenciales.
    // El resto existe igual, pero se consigue en un vendedor.
    base = base.filter(item => !item.consumible || item.legacy);
    // El equipo con nombre propio de los creeps (soloBotin) se consigue derrotándolos, no comprándolo de la lista general.
    base = base.filter(item => !item.soloBotin);
  }
  let visibles = filtro ? base.filter(item => grupoCompraDe(item.tipoItem) === filtro) : base;
  if(filtroSlot) visibles = visibles.filter(item => slotDe(item.tipoItem) === filtroSlot);
  if(filtroTier) visibles = visibles.filter(item => item.tier === filtroTier);
  if(busqueda) visibles = visibles.filter(item => textoBusquedaDe(item).includes(busqueda));
  return visibles;
}

// Tienda publicada por el GM desde el generador de tiendas, en
// campanas/<partida>/tienda/publicada ({json, actualizado}). Trae los ids
// que ofrece y los datos de esos ítems (itemsDatos, sin imagen): si esta
// ficha tiene el ítem en su catálogo se usa el suyo (con imagen), y si no
// (un ítem creado por el GM) el de la tienda.
let tiendaCargada = null;
let tiendaEscucha = null;  // listener de la tienda publicada, mientras haya uno
const ARCHIVO_CATALOGO = 'datos/catalogo.json';

function itemCatalogo(id){
  return S.catalogo.find(x => x.id === id)
    || (tiendaCargada && Array.isArray(tiendaCargada.itemsDatos) ? tiendaCargada.itemsDatos.find(x => x && x.id === id) : null)
    || S.inventario.find(x => x.id === id)  // un ítem de la mochila (Comparar desde "Equipar")
    || botinItemPorId(id)                   // un ítem del botín (Comparar desde "Botín")
    || null;
}

function renderCabeceraTienda(){
  const badge = $('#tienda-badge');
  const salir = $('#tienda-salir');
  const nuevo = $('#btn-catalogo-nuevo');
  const verCompleto = $('#catalogo-ver-completo');
  if($('#tienda-vender')) $('#tienda-vender').style.display = 'none';
  if($('#tienda-reparar')) $('#tienda-reparar').style.display = 'none';
  if(tiendaCargada){
    const pct = Number(tiendaCargada.ajustePrecio) || 0;
    const extra = pct ? ` · ${pct < 0 ? '-' : '+'}${Math.abs(pct)}%` : '';
    const pv = Number(tiendaCargada.ajusteVenta) || 0;
    badge.textContent = `Tienda · ${tiendaCargada.tamanoLabel || 'vendedor'}${extra}${pv ? ` · venta ${pv < 0 ? '-' : '+'}${Math.abs(pv)}%` : ''}`;
    if($('#tienda-vender')) $('#tienda-vender').style.display = '';
    if($('#tienda-reparar')) $('#tienda-reparar').style.display = tiendaCargada.herrero ? '' : 'none';   // solo las tiendas con herrero reparan
    badge.style.display = '';
    salir.style.display = '';
    if(nuevo) nuevo.style.display = 'none';
    // El botón de ver todo sin filtros es para navegar el catálogo del
    // fabricante en general, no para saltarse lo que ofrece un vendedor
    // puntual — a un jugador no le corresponde en esa vista.
    if(verCompleto) verCompleto.style.display = 'none';
  }else{
    badge.style.display = 'none';
    salir.style.display = 'none';
    if(nuevo) nuevo.style.display = '';
    if(verCompleto) verCompleto.style.display = '';
  }
}

function limpiarFiltrosCatalogo(){
  $('#catalogo-filtro').value = '';
  $('#catalogo-filtro-slot').value = '';
  $('#catalogo-filtro-tier').value = '';
  $('#catalogo-buscar').value = '';
}

// El vendedor puede tener un descuento o recargo para toda la tienda. Se
// aplica al vuelo sobre el precio de catálogo: nada reescribe S.catalogo,
// así al salir de la tienda los precios vuelven solos a los de siempre.
function precioDeCompra(item){
  const base = num(item.precioCompra);
  const pct = tiendaCargada ? (Number(tiendaCargada.ajustePrecio) || 0) : 0;
  if(!pct) return base;
  return Math.max(1, Math.round(base * (1 + pct / 100)));
}

function salirDeLaTienda(){
  tiendaCargada = null;
  dejarDeEscucharTienda();
  limpiarFiltrosCatalogo();
  renderCatalogoModal();
  toast('Catálogo completo');
}

function tiendaDesdeDoc(snap){
  if(!snap.exists) return null;
  let t;
  try{ t = JSON.parse(snap.data().json || ''); }catch(e){ return null; }
  // Ítems creados por el GM antes de correr la escala de Tipos (sin marca propia).
  (Array.isArray(t && t.itemsDatos) ? t.itemsDatos : []).forEach(it => {
    if(!it || CATALOGO_IDS.has(it.id) || num(it.escalaTipos) >= ESCALA_TIPOS) return;
    migrarObjTipos(it);
    it.escalaTipos = ESCALA_TIPOS;
  });
  if(!(t && Array.isArray(t.items) && t.items.length)) return null;
  t.abierta = snap.data().abierta === true;   // el GM decide cuándo está accesible
  return t;
}

/* ---------- Tienda abierta o cerrada ----------
   El GM abre y cierra la tienda con un interruptor (vendor-generator). Mientras está cerrada, el botón
   🏪 queda desactivado y dice "Tienda cerrada". Se escucha siempre, no solo dentro de la tienda. */
let tiendaAbiertaAhora = false, tiendaEstadoEscucha = null;
function renderBotonTienda(){
  const btn = $('#btn-vendedor');
  if(!btn) return;
  btn.disabled = !tiendaAbiertaAhora;
  btn.title = tiendaAbiertaAhora ? 'Abrir la tienda que publicó el GM: comprar y vender' : 'Tienda cerrada';
}
function tiendaEstadoEscuchar(){
  if(tiendaEstadoEscucha || !fbDb || !fbMiembro) return;
  tiendaEstadoEscucha = fbDb.doc(fbRutaCampana('tienda/publicada')).onSnapshot(snap => {
    tiendaAbiertaAhora = snap.exists && snap.data().abierta === true;
    renderBotonTienda();
  }, err => console.error('No se pudo escuchar el estado de la tienda:', err));
}

/* ---------- Vender en la tienda ----------
   Solo se vende acá (ya no desde la ventana de cada ítem). Lo equipado no se vende. Cada tienda compra de todo:
   ítems de la mochila y del cinturón, y despojos (1 DDE cada uno). El "ajuste al vender" de la tienda
   sube o baja lo que se cobra, también en los despojos. */
let venderSel = {};   // clave 'inventario:id' | 'cinturon:id' | 'despojos' -> cantidad elegida
function ajusteVentaTienda(){ return tiendaCargada ? (Number(tiendaCargada.ajusteVenta) || 0) : 0; }
function precioVentaTienda(base){ return Math.max(0, Math.round(num(base) * (1 + ajusteVentaTienda() / 100) * 100) / 100); }
function itemsVendibles(){
  const out = [];
  ['inventario', 'cinturon'].forEach(key => (S[key] || []).forEach(it => {
    if(it.equipado) return;
    const base = precioVentaDe(it);
    if(base > 0) out.push({clave: `${key}:${it.id}`, key, it, unidades: num(it.unidades) || 1, unit: precioVentaTienda(base)});
  }));
  return out;
}
function totalVenta(){
  let t = 0;
  itemsVendibles().forEach(v => { t += (venderSel[v.clave] || 0) * v.unit; });
  t += (venderSel.despojos || 0) * precioVentaTienda(1);
  return Math.round(t * 100) / 100;
}
function renderVender(){
  const lista = itemsVendibles();
  const desp = Math.max(0, Math.floor(num(S.loot.normal)));
  const ajuste = ajusteVentaTienda();
  const fila = (clave, nombre, max, unit, extra) => `<div class="vender-fila" style="display:grid;grid-template-columns:24px 1fr auto 74px;gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid var(--line-soft)">
      <input type="checkbox" data-vender-chk="${esc(clave)}"${venderSel[clave] ? ' checked' : ''}>
      <span>${esc(nombre)}${extra || ''}</span>
      <span class="hint">${fmt(unit)} DDE c/u</span>
      ${max > 1 ? `<input type="number" min="1" max="${max}" data-vender-cant="${esc(clave)}" value="${venderSel[clave] || max}" style="width:70px">` : `<span class="hint">×1</span>`}
    </div>`;
  $('#vender-cuerpo').innerHTML = `
    <p class="hint" style="margin:0 0 8px">${ajuste ? `Esta tienda paga con un ajuste de ${ajuste > 0 ? '+' : ''}${ajuste}%. ` : ''}Lo que tenés equipado no se puede vender: sacalo antes.</p>
    ${desp > 0 ? fila('despojos', 'Despojos', desp, precioVentaTienda(1)) : ''}
    ${lista.map(v => fila(v.clave, v.it.nombre || '(sin nombre)', v.unidades, v.unit, v.unidades > 1 ? ` <span class="hint">(tenés ${fmt(v.unidades)})</span>` : '')).join('')}
    ${!lista.length && !desp ? '<div class="hint">No tenés nada para vender.</div>' : ''}`;
  $('#vender-total').innerHTML = `Vas a cobrar: <b>${fmt(totalVenta())} DDE</b>`;
}
function abrirVender(){
  if(!tiendaCargada){ toast('Abrí primero la tienda'); return; }
  venderSel = {};
  renderVender();
  $('#scrim-vender').classList.add('open');
}
function confirmarVender(){
  if(!tiendaCargada){ toast('La tienda está cerrada'); return; }
  const total = totalVenta();
  if(!total){ toast('Elegí qué vender'); return; }
  let nombres = [];
  itemsVendibles().forEach(v => {
    const q = Math.min(venderSel[v.clave] || 0, v.unidades);
    if(!q) return;
    nombres.push(q > 1 ? `${v.it.nombre} ×${q}` : v.it.nombre);
    if(q >= v.unidades) S[v.key] = S[v.key].filter(x => x.id !== v.it.id); else v.it.unidades = v.unidades - q;
  });
  const qd = Math.min(venderSel.despojos || 0, Math.max(0, Math.floor(num(S.loot.normal))));
  if(qd){ S.loot.normal = num(S.loot.normal) - qd; nombres.push(`${qd} despojo${qd === 1 ? '' : 's'}`); $('#f-loot-normal').value = S.loot.normal; }
  S.meta.dde = Math.round((num(S.meta.dde) + total) * 100) / 100;
  $('#f-dde').value = fmt(S.meta.dde);
  renderInventario(); renderList('cinturon'); refresh();
  venderSel = {};
  $('#scrim-vender').classList.remove('open');
  toast(`Vendiste ${nombres.join(', ')} · +${fmt(total)} DDE (tenés ${fmt(num(S.meta.dde))})`);
}
/* ---------- Reparación con el herrero (2026-09-26, pedido del dueño) ----------
   Las tiendas que el GM marca como «herrero» tienen el botón 🔧 Reparación. Se repara por punto de durabilidad (por defecto 1 DDE por punto; lo fija la tienda) y cada
   punto reparado también devuelve 1 de Armadura rota de esa pieza. NO se puede reparar durante el combate (cuando el mapa está en modo combate). */
function precioReparacion(){ return tiendaCargada ? Math.max(0, num(tiendaCargada.precioReparacion === undefined ? 1 : tiendaCargada.precioReparacion)) : 1; }
function itemsAReparar(){
  return S.inventario.filter(i => durableItem(i) && (durActual(i) < durMax(i) || armRotaDe(i) > 0))
    .map(i => ({it: i, faltan: Math.max(0, durMax(i) - durActual(i))}));
}
const enCombateAhora = () => !!(typeof modoMapaListo !== 'undefined' && modoMapaListo && modoMapa === 'combate');
function renderReparar(){
  const p = precioReparacion(), lista = itemsAReparar(), dde = num(S.meta.dde);
  const totalPts = lista.reduce((a, x) => a + x.faltan, 0);
  const bloqueado = enCombateAhora();
  $('#reparar-cuerpo').innerHTML = `
    <p class="hint" style="margin:0 0 8px">${p > 0 ? `El herrero cobra <b>${fmt(p)} DDE por punto</b> de durabilidad.` : 'Este herrero repara gratis.'} Cada punto reparado también devuelve 1 de Armadura rota de esa pieza. Tenés <b>${fmt(dde)} DDE</b>.</p>
    ${bloqueado ? '<p class="hint" style="margin:0 0 8px;color:#FF9E7E">⚔ No se puede reparar durante el combate: esperá a que el GM pase el mapa a modo narrativo.</p>' : ''}
    ${lista.length ? lista.map(({it, faltan}) => `<div style="display:grid;grid-template-columns:1fr auto auto;gap:8px;align-items:center;padding:7px 0;border-bottom:1px solid var(--line)">
        <div><b>${esc(it.nombre)}</b> ${it.equipado ? '<span class="tag">equipado</span>' : ''}<div class="hint">🔧 ${fmt(durActual(it))}/${fmt(durMax(it))}${armRotaDe(it) ? ` · Armadura rota ×${fmt(armRotaDe(it))}` : ''}${itemRoto(it) ? ' · <b style="color:#FF7E7E">ROTO</b>' : ''} · faltan ${fmt(faltan)} punto${faltan === 1 ? '' : 's'}</div></div>
        <button class="mini" data-rep="${esc(it.id)}:1"${bloqueado || faltan < 1 ? ' disabled' : ''}>+1 · ${fmt(p)} DDE</button>
        <button class="mini" data-rep="${esc(it.id)}:${faltan}"${bloqueado || faltan < 1 ? ' disabled' : ''}>Todo · ${fmt(Math.round(faltan * p * 100) / 100)} DDE</button>
      </div>`).join('') : '<div class="hint">No tenés nada para reparar: todo tu equipo está entero.</div>'}`;
  $('#reparar-total').innerHTML = `Reparar todo cuesta: <b>${fmt(Math.round(totalPts * p * 100) / 100)} DDE</b> (${fmt(totalPts)} punto${totalPts === 1 ? '' : 's'})`;
  $('#reparar-todo').disabled = bloqueado || !totalPts;
}
function repararItems(pares){   // pares: [{it, pts}]
  if(enCombateAhora()){ toast('No se puede reparar durante el combate'); return; }
  const p = precioReparacion();
  const pts = pares.reduce((a, x) => a + Math.min(x.pts, Math.max(0, durMax(x.it) - durActual(x.it))), 0);
  if(!pts){ toast('No hay nada para reparar'); return; }
  const costo = Math.round(pts * p * 100) / 100;
  if(costo > num(S.meta.dde) + 1e-9){ toast(`No te alcanza: reparar ${fmt(pts)} punto${pts === 1 ? '' : 's'} cuesta ${fmt(costo)} DDE y tenés ${fmt(num(S.meta.dde))}`); return; }
  pares.forEach(({it, pts: n}) => {
    const q = Math.min(n, Math.max(0, durMax(it) - durActual(it)));
    if(q <= 0) return;
    it.dur = durActual(it) + q;
    it.armRota = Math.max(0, armRotaDe(it) - q);
  });
  S.meta.dde = Math.round((num(S.meta.dde) - costo) * 100) / 100;
  $('#f-dde').value = fmt(S.meta.dde);
  renderInventario();
  refresh();
  renderReparar();
  toast(`🔧 Reparaste ${fmt(pts)} punto${pts === 1 ? '' : 's'} por ${fmt(costo)} DDE (te quedan ${fmt(num(S.meta.dde))})`);
}
function abrirReparar(){
  if(!tiendaCargada || !tiendaCargada.herrero){ toast('Esta tienda no tiene herrero'); return; }
  renderReparar();
  $('#scrim-reparar').classList.add('open');
}
$('#tienda-reparar').onclick = abrirReparar;
$('#reparar-x').onclick = () => $('#scrim-reparar').classList.remove('open');
$('#scrim-reparar').addEventListener('mousedown', e => { if(e.target.id === 'scrim-reparar') $('#scrim-reparar').classList.remove('open'); });
$('#reparar-todo').onclick = () => repararItems(itemsAReparar().map(x => ({it: x.it, pts: x.faltan})));
$('#reparar-cuerpo').addEventListener('click', e => {
  const b = e.target.closest('[data-rep]');
  if(!b) return;
  const [id, n] = b.dataset.rep.split(':');
  const it = S.inventario.find(x => x.id === id);
  if(it) repararItems([{it, pts: Math.max(1, Math.round(num(n)))}]);
});

$('#tienda-vender').onclick = abrirVender;
$('#vender-x').onclick = () => $('#scrim-vender').classList.remove('open');
$('#vender-confirmar').onclick = confirmarVender;
$('#vender-cuerpo').addEventListener('change', e => {
  const chk = e.target.dataset.venderChk, cant = e.target.dataset.venderCant;
  if(chk !== undefined){
    const fila = e.target.closest('.vender-fila').querySelector('[data-vender-cant]');
    const max = fila ? num(fila.max) : 1;
    venderSel[chk] = e.target.checked ? (fila ? Math.max(1, Math.min(max, num(fila.value))) : 1) : 0;
  }else if(cant !== undefined){
    const max = num(e.target.max);
    const q = Math.max(1, Math.min(max, Math.round(num(e.target.value)) || 1));
    e.target.value = q;
    if(venderSel[cant]) venderSel[cant] = q;
  }
  $('#vender-total').innerHTML = `Vas a cobrar: <b>${fmt(totalVenta())} DDE</b>`;
});

async function abrirVendedor(){
  if(!fbDb || !fbMiembro){ toast('Sin conexión con la partida: no se puede abrir la tienda'); return; }
  const btn = $('#btn-vendedor');
  btn.disabled = true;
  try{
    const tienda = tiendaDesdeDoc(await fbDb.doc(fbRutaCampana('tienda/publicada')).get());
    if(!tienda || !tienda.abierta){ toast('Tienda cerrada'); return; }

    tiendaCargada = tienda;
    verCatalogoCompleto = false;
    if($('#catalogo-ver-completo')) $('#catalogo-ver-completo').classList.remove('activo');
    limpiarFiltrosCatalogo();
    renderCatalogoModal();
    $('#scrim-catalogo').classList.add('open');
    toast(`${tienda.nombre || 'Tienda'} · ${fmt(catalogoVisibles().length)} ítems`);
    escucharTienda();
  }catch(err){
    console.error('Error trayendo la tienda:', err);
    toast('No se pudo abrir la tienda — revisá la consola');
  }finally{
    renderBotonTienda();
  }
}

// Mientras el jugador está en la tienda, los cambios del GM (publicar otra
// o cerrarla) le llegan solos. Se deja de escuchar al salir de la tienda.
function escucharTienda(){
  if(tiendaEscucha) return;
  let primera = true;
  tiendaEscucha = fbDb.doc(fbRutaCampana('tienda/publicada')).onSnapshot(snap => {
    if(primera){ primera = false; return; }  // es la misma que se acaba de abrir
    if(!tiendaCargada){ dejarDeEscucharTienda(); return; }
    let nueva = tiendaDesdeDoc(snap);
    if(nueva && !nueva.abierta){   // el GM la cerró: se sale de la tienda
      tiendaCargada = null; carritoCatalogo = []; dejarDeEscucharTienda();
      $('#scrim-catalogo').classList.remove('open'); $('#scrim-vender').classList.remove('open'); $('#scrim-reparar').classList.remove('open');
      toast('El GM cerró la tienda');
      return;
    }
    tiendaCargada = nueva;
    // Lo que ya no se vende sale del carrito.
    const antes = carritoCatalogo.length;
    carritoCatalogo = nueva ? carritoCatalogo.filter(e => nueva.items.includes(e.catId)) : [];
    if(!nueva) dejarDeEscucharTienda();
    renderCatalogoModal();
    const quitados = antes - carritoCatalogo.length;
    toast((nueva ? 'El GM cambió la tienda' : 'El GM cerró la tienda')
      + (quitados ? ` · ${fmt(quitados)} ítem(s) salieron del carrito` : ''));
  }, err => console.error('No se pudo escuchar la tienda:', err));
}

function dejarDeEscucharTienda(){
  if(tiendaEscucha){ tiendaEscucha(); tiendaEscucha = null; }
}

let itemAleatorioActual = null;

// Elige un ítem al azar entre los que pasan los filtros activos en ese
// momento (no de todo el catálogo) — para botín o recompensas rápidas.
function elegirItemAleatorio(){
  const visibles = catalogoVisibles();
  if(!visibles.length){ toast('No hay ítems que coincidan con los filtros activos'); return; }
  itemAleatorioActual = visibles[Math.floor(Math.random() * visibles.length)];
  $('#item-aleatorio-body').innerHTML = `<div class="cat-grid">${catalogoRowHtml(itemAleatorioActual)}</div>`;
  $('#scrim-item-aleatorio').classList.add('open');
}

function ajustarFiltroTier(){
  const sel = $('#catalogo-filtro-tier');
  if(!sel) return;
  [...sel.options].forEach(o => {
    if(!TIERS_OCULTOS.includes(o.value)) return;
    o.hidden = !tiendaCargada;
    if(o.hidden && sel.value === o.value) sel.value = '';
  });
}

function renderCatalogoModal(){
  ajustarFiltroTier();
  const visibles = catalogoVisibles();
  const grupos = {};
  visibles.forEach(item => {
    const g = grupoCompraDe(item.tipoItem);
    (grupos[g] = grupos[g] || []).push(item);
  });
  let html;
  if(catalogoOrden === 'categoria'){
    const claves = GRUPO_COMPRA_ORDEN.filter(g => grupos[g] && grupos[g].length);
    html = claves.map(g => `
      <div class="cat-grouphead">${esc(GRUPO_COMPRA_LABEL[g])}</div>
      <div class="cat-grid">${conStockYLegacyPrimero(ordenarCatalogo(grupos[g])).map(catalogoRowHtml).join('')}</div>
    `).join('');
  }else{
    const orden = conStockYLegacyPrimero(ordenarCatalogo(visibles));
    html = orden.length
      ? `<div class="cat-grouphead">${esc(ORDENES_CATALOGO[catalogoOrden].label)} · ${fmt(orden.length)}</div>
         <div class="cat-grid">${orden.map(catalogoRowHtml).join('')}</div>`
      : '';
  }
  renderCatalogoOrdenControles();
  const textoBusqueda = $('#catalogo-buscar') ? $('#catalogo-buscar').value.trim() : '';
  let vacioMsg = 'El catálogo está vacío. Tocá "+ Ítem al catálogo" para cargar el primero.';
  if(tiendaCargada) vacioMsg = textoBusqueda ? `El vendedor no tiene nada que coincida con "${esc(textoBusqueda)}".` : 'El vendedor no tiene nada en esta categoría.';
  else if(S.catalogo.length) vacioMsg = textoBusqueda ? `No hay ítems que coincidan con "${esc(textoBusqueda)}".` : 'No hay ítems en esta categoría.';
  $('#catalogo-body').innerHTML = html || `<div class="hint">${vacioMsg}</div>`;
  renderCabeceraTienda();
  $('#catalogo-dde').textContent = fmt(num(S.meta.dde));
  renderCarritoCatalogo();
}

function renderCarritoCatalogo(){
  const cont = $('#carrito-lista');
  if(!cont) return;
  if(!carritoCatalogo.length){
    cont.innerHTML = `<div class="carrito-vacio">Carrito vacío — usá "+ Carrito" en los ítems que quieras comprar.</div>`;
    $('#carrito-total').textContent = '0';
    $('#carrito-comprar').disabled = true;
    return;
  }
  let total = 0;
  cont.innerHTML = carritoCatalogo.map(ent => {
    const item = itemCatalogo(ent.catId);
    if(!item) return '';
    const subtotal = precioDeCompra(item) * ent.cantidad;
    total += subtotal;
    return `<div class="carrito-item">
      <span class="carrito-nombre">${esc(item.nombre)} ×${fmt(ent.cantidad)}</span>
      <span class="carrito-subtotal">${fmt(subtotal)} DDE</span>
      <button class="carrito-rm" data-carritorm="${ent.catId}">×</button>
    </div>`;
  }).join('');
  $('#carrito-total').textContent = fmt(total);
  $('#carrito-comprar').disabled = total > num(S.meta.dde);
  $('#carrito-comprar').title = total > num(S.meta.dde) ? `Te faltan ${fmt(total - num(S.meta.dde))} DDE` : '';
}

const STACK_MAX = 5;
// Las trampas consumibles (`pilaInfinita`) se apilan sin límite: una sola ranura de la mochila para todas las iguales (pedido del dueño, 2026-09-25).
const stackMaxDe = it => (it && it.pilaInfinita) ? Infinity : STACK_MAX;

function purgarSiAgotado(key, id){ return FichaAcciones.purgarSiAgotado(S, key, id); }   // comun/ficha-acciones.js

function agregarConsumibleAInventario(itemBase, cantidad){
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

function crearItemsDesdeCatalogo(item, cantidad){
  if(item.consumible){
    agregarConsumibleAInventario(item, cantidad);
  }else{
    for(let i=0; i<cantidad; i++){
      const nuevo = structuredClone(item);
      nuevo.id = uid();
      nuevo.equipado = false;
      nuevo.unidades = 1;
      nuevo.ranuras = item.ranuras ?? 1;
      S.inventario.push(nuevo);
    }
  }
}

function agregarDesdeCatalogo(id){
  // Agregar gratis solo si el GM lo permitió en la tienda abierta (por defecto se compra con el carrito).
  if(!(tiendaCargada && tiendaCargada.agregarGratis)){ toast('Esta tienda no permite agregar ítems gratis: usá el carrito'); return; }
  const item = itemCatalogo(id);
  if(!item) return;
  const qtyInput = document.querySelector(`[data-catqty="${id}"]`);
  const cantidad = Math.max(1, num(qtyInput ? qtyInput.value : 1));
  crearItemsDesdeCatalogo(item, cantidad);
  renderInventario();
  refresh();
  toast(`${item.nombre} ×${cantidad} agregado a la mochila (gratis)`);
}

function agregarAlCarrito(id){
  const item = itemCatalogo(id);
  if(!item) return;
  const qtyInput = document.querySelector(`[data-catqty="${id}"]`);
  const cantidad = Math.max(1, num(qtyInput ? qtyInput.value : 1));
  const existente = carritoCatalogo.find(e=>e.catId===id);
  if(existente) existente.cantidad += cantidad;
  else carritoCatalogo.push({catId:id, cantidad});
  renderCarritoCatalogo();
  toast(`${item.nombre} ×${cantidad} agregado al carrito`);
}

function quitarDelCarrito(catId){
  carritoCatalogo = carritoCatalogo.filter(e=>e.catId!==catId);
  renderCarritoCatalogo();
}

function comprarCarrito(){
  if(!carritoCatalogo.length) return;
  let total = 0;
  carritoCatalogo.forEach(ent => {
    const item = itemCatalogo(ent.catId);
    if(item) total += precioDeCompra(item) * ent.cantidad;
  });
  if(total > num(S.meta.dde)){
    toast(`No te alcanzan los DDE — necesitás ${fmt(total)} y tenés ${fmt(num(S.meta.dde))}`);
    return;
  }
  S.meta.dde = num(S.meta.dde) - total;
  $('#f-dde').value = fmt(S.meta.dde);
  carritoCatalogo.forEach(ent => {
    const item = itemCatalogo(ent.catId);
    if(item) crearItemsDesdeCatalogo(item, ent.cantidad);
  });
  const cantidadItems = carritoCatalogo.length;
  carritoCatalogo = [];
  renderInventario();
  refresh();
  renderCarritoCatalogo();
  $('#catalogo-dde').textContent = fmt(num(S.meta.dde));
  toast(`Compra realizada · ${cantidadItems} tipo(s) de ítem · -${fmt(total)} DDE`);
}


