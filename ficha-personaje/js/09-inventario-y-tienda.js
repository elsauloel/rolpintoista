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
// Equipar / sacar / reemplazar: la regla vive en comun/ficha-equipo.js (la usa también el mapa); acá, lo que se ve.
const equipoUi = {
  toast: t => toast(t),
  avisarSinNitros: (costo, accion, continuar) => avisarSinNitros(costo, accion, continuar),
  modoCombate: () => modoMapaListo && modoMapa === 'combate',
  alPagar: () => renderNitros(),
  slotLleno: it => abrirSlotLleno(it.id),
  cambio: (partes, o) => {
    if(o && o.reemplazo){ $('#scrim-comparar').classList.remove('open'); $('#scrim-slot-lleno').classList.remove('open'); }
    renderInventario();
    if(partes.includes('cinturon')) renderList('cinturon');
    refresh();
  },
};
function conCostoEquipar(veces, infinitivo, pasado, accion){ FichaEquipo.conCosto(S, veces, infinitivo, pasado, accion, equipoUi); }

function abrirSlotLleno(itemId){
  const it = S.inventario.find(x => x.id === itemId);
  const cuerpo = it && FichaEquipo.slotLlenoHtml(S, it);
  if(!cuerpo) return false;
  slotLlenoItemId = itemId;
  $('#slot-lleno-body').innerHTML = cuerpo;
  $('#scrim-slot-lleno').classList.add('open');
  return true;
}

// Saca el equipado y pone el de la mochila. Si el slot igual no alcanza
// (ej. un arma de dos manos con escudo puesto), se deshace y se avisa.
function reemplazarEquipado(equipadoId, nuevoId){ FichaEquipo.reemplazar(S, equipadoId, nuevoId, equipoUi); }
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
  const r = FichaEquipo.compararHtml(S, item, comparandoEquipadoId, {precioHtml: precioTiendaHtml});   // comun/ficha-equipo.js
  if(!r){ $('#scrim-comparar').classList.remove('open'); return; }
  $('#comparar-body').innerHTML = r.html;
}

let carritoCatalogo = [];

// La tienda vive en comun/ficha-tienda.js (hoja de ruta A5, 2026-10-02: el mapa usa lo mismo); acá, la ventana de la ficha. El
// estado de la tienda en pantalla son las variables de siempre (tiendaCargada, carritoCatalogo, venderSel…), que la
// pieza común lee y escribe a través de `tiendaSt`.
const normalizarBusqueda = FichaTienda.normalizarBusqueda;
const TIERS_ORDEN = FichaTienda.TIERS_ORDEN;
const danoDe = item => FichaTienda.danoDe(item);
function conStockYLegacyPrimero(items){ return FichaTienda.conStockYLegacyPrimero(tiendaSt, items); }
// El filtro del catálogo y la tienda (comun/filtro-catalogo.js, 2026-10-08): búsqueda, chips, orden y «Más filtros». Se arma la primera vez.
let catalogoFiltro = null;
function filtroCatalogo(){
  if(!catalogoFiltro && $('#catalogo-filtros')) catalogoFiltro = FiltroCatalogo.crear($('#catalogo-filtros'), {
    base: () => FichaTienda.base(S, tiendaSt), precio: it => FichaTienda.precioDeCompra(tiendaSt, it), libre: it => FichaTienda.libre(S, it),
    calidad: false, clave: 'tienda', alCambiar: () => renderCatalogoModal()});   // los jugadores no ven la calidad (dueño, 2026-10-08)
  return catalogoFiltro;
}
// Rarezas que no se ofrecen en el catálogo general del jugador.
const TIERS_OCULTOS = FichaTienda.TIERS_OCULTOS;
// Botón del ojo en el footer: muestra literalmente todo lo que hay en S.catalogo, de referencia.
let verCatalogoCompleto = false;
function catalogoVisibles(){
  if(!Array.isArray(S.catalogo)) S.catalogo = structuredClone(DEFAULT.catalogo);
  return FichaTienda.visibles(S, tiendaSt);
}

let tiendaCargada = null;
let tiendaEscucha = null;  // listener de la tienda publicada, mientras haya uno
const ARCHIVO_CATALOGO = 'datos/catalogo.json';

function itemCatalogo(id){ return FichaTienda.itemCatalogo(S, tiendaSt, id); }
const tiendaSt = {
  get tienda(){ return tiendaCargada; }, set tienda(v){ tiendaCargada = v; },
  get carrito(){ return carritoCatalogo; }, set carrito(v){ carritoCatalogo = v; },
  get venderSel(){ return venderSel; }, set venderSel(v){ venderSel = v; },
  get verCompleto(){ return verCatalogoCompleto; }, set verCompleto(v){ verCatalogoCompleto = v; },
  get filtro(){ const c = filtroCatalogo(); return c ? c.f : FiltroCatalogo.vacio(); },
  extraItem: id => botinItemPorId(id),   // un ítem del botín (Comparar desde "Botín")
};
// Lo que cambia al personaje en la tienda (comprar, agregar gratis, vender, reparar): se redibuja como siempre.
const tiendaUi = {
  toast: t => toast(t),
  cambio: partes => {
    if(partes.includes('meta')) $('#f-dde').value = fmt(S.meta.dde);
    if(partes.includes('loot')) $('#f-loot-normal').value = S.loot.normal;
    renderInventario();
    if(partes.includes('cinturon')) renderList('cinturon');
    refresh();
  },
};

function renderCabeceraTienda(){
  const badge = $('#tienda-badge');
  const salir = $('#tienda-salir');
  const nuevo = $('#btn-catalogo-nuevo');
  const verCompleto = $('#catalogo-ver-completo');
  if($('#tienda-vender')) $('#tienda-vender').style.display = 'none';
  if($('#tienda-baul')) $('#tienda-baul').style.display = 'none';
  if($('#tienda-reparar')) $('#tienda-reparar').style.display = 'none';
  // El título dice dónde estás (2026-10-08, dueño: «que el título de la tienda se vea más claro»): el nombre de la tienda, o el catálogo.
  if($('#catalogo-titulo')) $('#catalogo-titulo').textContent = tiendaCargada && !verCatalogoCompleto ? `🏪 ${tiendaCargada.nombre || 'Tienda'}` : '📖 Catálogo del fabricante';
  if(tiendaCargada){
    badge.textContent = FichaTienda.badge(tiendaSt);
    if($('#tienda-vender')) $('#tienda-vender').style.display = '';
    if($('#tienda-baul')){ $('#tienda-baul').style.display = ''; Intercambio.pintarBotonBaul($('#tienda-baul')); }   // 📦 el baúl común se abre desde una tienda (P157); en combate, apagado
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

function limpiarFiltrosCatalogo(){ const c = filtroCatalogo(); if(c) c.limpiar(); }

// El vendedor puede tener un descuento o recargo para toda la tienda. Se
// aplica al vuelo sobre el precio de catálogo: nada reescribe S.catalogo,
// así al salir de la tienda los precios vuelven solos a los de siempre.
function precioDeCompra(item){ return FichaTienda.precioDeCompra(tiendaSt, item); }

function salirDeLaTienda(){
  tiendaCargada = null;
  dejarDeEscucharTienda();
  limpiarFiltrosCatalogo();
  renderCatalogoModal();
  toast('Catálogo completo');
}

function tiendaDesdeDoc(snap){ return FichaTienda.desdeDoc(snap); }

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
function ajusteVentaTienda(){ return FichaTienda.ajusteVenta(tiendaSt); }
function precioVentaTienda(base){ return FichaTienda.precioVentaTienda(tiendaSt, base); }
function itemsVendibles(){ return FichaTienda.vendibles(S, tiendaSt); }
function totalVenta(){ return FichaTienda.totalVenta(S, tiendaSt); }
function renderVender(){
  $('#vender-cuerpo').innerHTML = FichaTienda.venderHtml(S, tiendaSt);
  $('#vender-total').innerHTML = `Vas a cobrar: <b>${fmt(totalVenta())} DDE</b>`;
}
function abrirVender(){
  if(!tiendaCargada){ toast('Abrí primero la tienda'); return; }
  venderSel = {};
  renderVender();
  $('#scrim-vender').classList.add('open');
}
function confirmarVender(){
  if(FichaTienda.vender(S, tiendaSt, tiendaUi)){ $('#scrim-vender').classList.remove('open'); $('#catalogo-dde').textContent = fmt(num(S.meta.dde)); }   // los DDE de la tienda, al día
}
/* ---------- Reparación con el herrero (2026-09-26, pedido del dueño) ----------
   Las tiendas que el GM marca como «herrero» tienen el botón 🔧 Reparación. Se repara por punto de durabilidad (por defecto 1 DDE por punto; lo fija la tienda) y cada
   punto reparado también devuelve 1 de Armadura rota de esa pieza. NO se puede reparar durante el combate (cuando el mapa está en modo combate). */
function precioReparacion(){ return FichaTienda.precioReparacion(tiendaSt); }
function itemsAReparar(){ return FichaTienda.aReparar(S); }
const enCombateAhora = () => !!(typeof modoMapaListo !== 'undefined' && modoMapaListo && modoMapa === 'combate');
function renderReparar(){
  const bloqueado = enCombateAhora(), r = FichaTienda.repararHtml(S, tiendaSt, bloqueado);
  $('#reparar-cuerpo').innerHTML = r.html;
  $('#reparar-total').innerHTML = r.total;
  $('#reparar-todo').disabled = bloqueado || !r.totalPts;
}
function repararItems(pares){   // pares: [{it, pts}]
  FichaTienda.reparar(S, tiendaSt, pares, enCombateAhora(), {toast: t => toast(t), cambio: p => { tiendaUi.cambio(p); renderReparar(); }});
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
  FichaTienda.venderCambio(tiendaSt, e.target);
  $('#vender-total').innerHTML = `Vas a cobrar: <b>${fmt(totalVenta())} DDE</b>`;
});

async function abrirVendedor(){
  if(!fbDb || !fbMiembro){ toast('Sin conexión con la partida: no se puede abrir la tienda'); return; }
  const btn = $('#btn-vendedor');
  btn.disabled = true;
  try{
    await FichaTienda.leerStock();   // piezas únicas: lo que queda (2026-10-07)
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
let tiendaStockEscucha = null;
function escucharTienda(){
  if(tiendaEscucha) return;
  // Piezas únicas (2026-10-07): cuando alguien compra, la tienda cambia para todos (lo comprado sale y llega su reposición).
  if(!tiendaStockEscucha) tiendaStockEscucha = FichaTienda.escucharStock(() => {
    if(!tiendaCargada) return;
    FichaTienda.conStock(tiendaCargada);
    carritoCatalogo = carritoCatalogo.filter(e => tiendaCargada.items.includes(e.catId));
    renderCatalogoModal();
  });
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
  if(tiendaStockEscucha){ tiendaStockEscucha(); tiendaStockEscucha = null; }
}

let itemAleatorioActual = null;

// Elige un ítem al azar entre los que pasan los filtros activos en ese
// momento (no de todo el catálogo) — para botín o recompensas rápidas.
function elegirItemAleatorio(){
  if(!Array.isArray(S.catalogo)) S.catalogo = structuredClone(DEFAULT.catalogo);
  itemAleatorioActual = FichaTienda.aleatorio(S, tiendaSt);
  if(!itemAleatorioActual){ toast('No hay ítems que coincidan con los filtros activos'); return; }
  $('#item-aleatorio-body').innerHTML = `<div class="cat-grid">${catalogoRowHtml(itemAleatorioActual)}</div>`;
  $('#scrim-item-aleatorio').classList.add('open');
}

function renderCatalogoModal(){
  if(!Array.isArray(S.catalogo)) S.catalogo = structuredClone(DEFAULT.catalogo);
  const fc = filtroCatalogo();
  if(fc) fc.actualizar();   // lo que hay para filtrar pudo cambiar (otra tienda, 👁 ver todo, el catálogo)
  const html = FichaTienda.catalogoHtml(S, tiendaSt);
  $('#catalogo-body').innerHTML = html;
  renderCabeceraTienda();
  $('#catalogo-dde').textContent = fmt(num(S.meta.dde));
  renderCarritoCatalogo();
}

function renderCarritoCatalogo(){
  const cont = $('#carrito-lista');
  if(!cont) return;
  const c = FichaTienda.carrito(S, tiendaSt);
  cont.innerHTML = c.html;
  $('#carrito-total').textContent = fmt(c.total);
  $('#carrito-comprar').disabled = !carritoCatalogo.length || !c.puede;
  $('#carrito-comprar').title = c.falta > 0 ? `Te faltan ${fmt(c.falta)} DDE` : '';
}

const STACK_MAX = FichaTienda.STACK_MAX;
// Las trampas consumibles (`pilaInfinita`) se apilan sin límite: una sola ranura de la mochila para todas las iguales (pedido del dueño, 2026-09-25).
const stackMaxDe = it => FichaTienda.stackMaxDe(it);

function purgarSiAgotado(key, id){ return FichaAcciones.purgarSiAgotado(S, key, id); }   // comun/ficha-acciones.js

function agregarConsumibleAInventario(itemBase, cantidad){ FichaTienda.agregarConsumible(S, itemBase, cantidad); }
function crearItemsDesdeCatalogo(item, cantidad){ FichaTienda.crearItems(S, item, cantidad); }
const cantidadEnFila = id => { const q = document.querySelector(`[data-catqty="${id}"]`); return Math.max(1, num(q ? q.value : 1)); };
function agregarDesdeCatalogo(id){ FichaTienda.agregarGratis(S, tiendaSt, id, cantidadEnFila(id), tiendaUi); }
function agregarAlCarrito(id){
  FichaTienda.agregarAlCarrito(S, tiendaSt, id, cantidadEnFila(id), tiendaUi);
  renderCarritoCatalogo();
}
function quitarDelCarrito(catId){
  FichaTienda.quitarDelCarrito(tiendaSt, catId);
  renderCarritoCatalogo();
}
async function comprarCarrito(){
  await FichaTienda.comprar(S, tiendaSt, tiendaUi);   // con piezas únicas, espera la transacción del stock
  renderCatalogoModal();
  renderCarritoCatalogo();
  $('#catalogo-dde').textContent = fmt(num(S.meta.dde));
}


