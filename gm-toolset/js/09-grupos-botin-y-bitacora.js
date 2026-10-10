// js/09-grupos-botin-y-bitacora.js — tramo 9 de 12 del script de gm-tools.html (paso 5, nivel A: mismo código, en el mismo orden).
/* =========================================================
   Los creeps por mapa (pestañas) y tokens automáticos — comun/creeps-mapas.js
   (2026-10-02, pedido del dueño: "los grupos en realidad son mapas": antes eran grupos con nombre libre, vinculados a mano a un mapa.)
   Cada creep está en UN mapa (`sc.mapa`) o en la Reserva (''); las pestañas son los mapas de la partida, en el orden del panel de
   Mapas del mapa. «🗺 Mover a…» (en la tarjeta y en la ficha completa) lo muda de mapa con su token, como una piedrita. Para repetir
   un creep en otro mapa se lo duplica.
   ========================================================= */
const PESTANA_TODOS = '__todos';
let pestanaMapa = PESTANA_TODOS;   // la pestaña abierta: PESTANA_TODOS, '' (Reserva) o el id de un mapa
try{ const v = localStorage.getItem('gm-pestana-mapa-' + FB_CAMPANA); if(v !== null) pestanaMapa = v; }catch(e){}
const mapasGM = new Map();   // id → {nombre, creadoMs}
let mapasGMListos = false;
const mapasOrdenadosGM = () => CreepsMapas.ordenar(mapasGM);
// El mapa de un creep (si el suyo ya no existe, la Reserva).
function mapaDeCreepGM(sc){ return mapasGMListos ? CreepsMapas.mapaDe(sc, new Set(mapasOrdenadosGM().map(m => m.id))) : (sc.mapa || ''); }
function nombreDeMapaGM(id){ return id === CreepsMapas.RESERVA ? 'Reserva' : ((mapasGM.get(id) || {}).nombre || (id === CreepsMapas.PRINCIPAL ? 'Mapa 1' : 'Mapa')); }
function pasaPestana(sc){
  if(sc._borrador || sc._creando) return false;
  return pestanaMapa === PESTANA_TODOS || mapaDeCreepGM(sc) === pestanaMapa;
}
function mapaParaNuevo(){ return pestanaMapa === PESTANA_TODOS ? CreepsMapas.RESERVA : pestanaMapa; }
function fijarPestanaMapa(id){
  pestanaMapa = id;
  try{ localStorage.setItem('gm-pestana-mapa-' + FB_CAMPANA, id); }catch(e){}
  renderAll();
}
function renderMapasBarra(){
  const caja = $('#mapas-barra');
  if(!caja) return;
  const mapas = mapasOrdenadosGM();
  if(mapasGMListos && pestanaMapa !== PESTANA_TODOS && pestanaMapa !== CreepsMapas.RESERVA && !mapas.some(m => m.id === pestanaMapa)) pestanaMapa = PESTANA_TODOS;   // ese mapa se borró
  const reales = creepsReales();
  const cuenta = id => reales.filter(sc => id === PESTANA_TODOS || mapaDeCreepGM(sc) === id).length;
  const tab = (id, texto, titulo) => `<button type="button" class="btn${pestanaMapa === id ? ' primary' : ''}" data-mapa-tab="${esc(id)}" style="padding:4px 10px;font-size:12.5px"${titulo ? ` title="${esc(titulo)}"` : ''}>${esc(texto)} <span class="hint">${cuenta(id)}</span></button>`;
  const enUnMapa = pestanaMapa !== PESTANA_TODOS && pestanaMapa !== CreepsMapas.RESERVA;
  caja.innerHTML = `<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:0 0 10px">
      ${tab(PESTANA_TODOS, 'Todos')}${mapas.map(m => tab(m.id, '🗺 ' + m.nombre)).join('')}${tab(CreepsMapas.RESERVA, '🎒 Reserva', 'Los creeps que todavía no están en ningún mapa')}
      <button type="button" class="btn ghost" data-mapa-nuevo="1" style="padding:4px 10px;font-size:12.5px" title="Crear un mapa nuevo (un escenario de combate); aparece también en 🗺 Mapas del mapa">＋ Mapa</button>
      ${enUnMapa ? `<span style="margin-left:auto;display:flex;gap:6px;align-items:center">
        <button type="button" class="btn" data-mapa-estimado="1" title="Cuánto oro van a sacar aproximadamente si derrotan a todos los creeps de este mapa: su oro y la venta de lo que sueltan">💰 Botín estimado</button>
        <button type="button" class="btn primary" data-mapa-tokens="1" title="Pone en «${esc(nombreDeMapaGM(pestanaMapa))}» un token oculto por cada creep de este mapa que todavía no tenga, en fila, en el centro de la vista">🎯 Poner sus tokens (${cuenta(pestanaMapa)})</button></span>` : ''}
    </div>${enUnMapa ? estimadoCajaHtml(reales.filter(sc => mapaDeCreepGM(sc) === pestanaMapa)) : ''}`;
}
/* El recuadro «Si derrotan a todos» (2026-10-10, pedido del dueño: «cuando uno tiene abierto un mapa con los creeps cargados, que haya un
   recuadro donde se vea claramente cuánta experiencia va a dar ese combate si vencen a todos, cuánto oro estimado según la calculadora del
   drop y cuánto oro van a tener si venden todo el equipo que van a soltar»). Siempre a la vista debajo de las pestañas; los números son los
   de 💰 Botín estimado (CombateFin.estimar: el oro de cada creep sin el ±20 %, la venta de su equipo y su trofeo a mitad de precio y los
   consumibles al azar como valor esperado), que sigue abriendo el detalle creep por creep. Por jugador: entre las fichas de la partida. */
let jugadoresCantGM = null, jugadoresCantPedido = 0;
function pedirJugadoresCant(){
  if(!fbDb || Date.now() - jugadoresCantPedido < 60000) return;
  jugadoresCantPedido = Date.now();
  fbDb.collection(fbRutaCampana('fichas')).get().then(snap => {
    const n = snap.size;
    if(n !== jugadoresCantGM){ jugadoresCantGM = n; renderMapasBarra(); }
  }).catch(err => console.error('No se pudieron contar las fichas:', err));
}
function estimadoCajaHtml(lista){
  if(!lista.length || typeof CombateFin === 'undefined') return '';
  const est = CombateFin.estimar(lista, CATALOGO_EQUIPO);
  if(!est.filas.length) return `<div class="hint" style="margin:-4px 0 10px">💰 Ya se repartió lo de todos los creeps de este mapa.</div>`;
  pedirJugadoresCant();
  const r = n => fmt(Math.round(n)), venta = est.venta + est.drop, n = jugadoresCantGM;
  const dato = (icono, titulo, valor, nota, fuerte) => `<div style="flex:1 1 150px;min-width:140px;padding:8px 12px;border:1px solid var(--line);border-radius:10px;background:${fuerte ? 'rgba(224,184,74,.12)' : 'rgba(255,255,255,.03)'}">
      <div class="hint" style="font-size:11.5px">${icono} ${titulo}</div><div style="font-size:19px;font-weight:800${fuerte ? ';color:#ffd76a' : ''}">${valor}</div>${nota ? `<div class="hint" style="font-size:11.5px">${nota}</div>` : ''}</div>`;
  return `<div id="estimado-caja" style="margin:0 0 12px;padding:10px 12px;border:1px solid var(--line);border-radius:12px;background:rgba(26,20,24,.5)">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><b>🏁 Si derrotan a todos</b> <span class="hint">(${est.filas.length} creep${est.filas.length === 1 ? '' : 's'} de «${esc(nombreDeMapaGM(pestanaMapa))}»)</span>
      <button type="button" class="btn ghost" data-mapa-estimado="1" style="margin-left:auto;padding:3px 10px;font-size:12px" title="El detalle creep por creep: qué suelta cada uno y cuánto vale">Ver detalle</button></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      ${dato('⭐', 'Experiencia', `${r(est.xp)} XP`, n ? `~${r(Math.ceil(est.xp / n))} c/u entre ${n}` : '')}
      ${dato('🪙', 'Oro que sueltan', `~${r(est.oro)}`, '±20 % al tirarlo')}
      ${dato('🧰', 'Si venden todo lo que sueltan', `~${r(venta)}`, `equipo y trofeos ${r(est.venta)}${est.drop ? ` · consumibles al azar ~${r(est.drop)}` : ''}`)}
      ${dato('💰', 'Oro total', `~${r(est.total)} DDE`, n ? `~${r(est.total / n)} c/u entre ${n}` : '', true)}
    </div>
    <div class="hint" style="font-size:11.5px;margin-top:6px">Lo que sueltan se cuenta a lo que paga una tienda (la mitad del precio de compra); si se lo quedan, vale como equipo.</div>
  </div>`;
}
function mapasGMEscuchar(){
  fbDb.collection(fbRutaCampana('mapas')).onSnapshot(snap => {
    mapasGM.clear();
    snap.docs.forEach(d => mapasGM.set(d.id, {nombre: String(d.data().nombre || 'Mapa').slice(0, 40), creadoMs: d.data().creado && d.data().creado.toMillis ? d.data().creado.toMillis() : 0}));
    mapasGMListos = true;
    renderAll();
  }, err => console.error('Error escuchando la lista de mapas:', err));
}
// ¿Crear su token? (2026-10-09, pedido del dueño: «si ya están en un mapa y no está creado el token, al agregarlo que pregunte»). Se llama al
// crear, duplicar o agregar un creep: si quedó en un mapa (no en la Reserva), pregunta y lo pone oculto en ese mapa (TokensAuto.crear se
// saltea los que ya tienen token ahí). Espera un momento para que el creep se dibuje (y se guarde) antes de preguntar.
function ofrecerTokenEnMapa(sc){
  if(!sc || !fbDb || !fbMiembro || !fbMiembro.gm || MODO_ACCIONES) return;
  const mapaId = mapaDeCreepGM(sc);
  if(!mapaId || mapaId === CreepsMapas.RESERVA) return;
  setTimeout(async () => {
    if(!S.creeps.includes(sc) || sc._borrador || sc._creando) return;
    if(!(await Confirmar.preguntar(`¿Querés crear el token de ${nombreLimpioCreep(sc)} en el mapa «${nombreDeMapaGM(mapaId)}»?\n\nQueda oculto a los jugadores hasta que lo muestres.`, {titulo: 'Crear token', icono: '🎯', si: 'Crear token'}))) return;
    try{
      const r = await TokensAuto.crear([{nombre: nombreLimpioCreep(sc), color: sc.color, tipo: 'creep', fichaId: sc.id, oculto: true}], {mapaId});
      toast(r.creados ? `🎯 Token de ${nombreLimpioCreep(sc)} en «${nombreDeMapaGM(mapaId)}», oculto a los jugadores` : `${nombreLimpioCreep(sc)} ya tenía su token en ese mapa`);
    }catch(err){
      console.error('No se pudo crear el token:', err);
      toast('No se pudo crear el token — mirá la consola');
    }
  }, 400);
}
async function crearTokensDelMapa(){
  if(!fbDb || !fbMiembro || !fbMiembro.gm){ toast('Sin conexión con la partida como GM'); return; }
  const mapaId = pestanaMapa, lista = creepsReales().filter(sc => mapaDeCreepGM(sc) === mapaId);
  if(!lista.length){ toast('Ese mapa no tiene creeps'); return; }
  try{
    const r = await TokensAuto.crear(lista.map(sc => ({nombre: nombreLimpioCreep(sc), color: sc.color, tipo: 'creep', fichaId: sc.id, oculto: true})), {mapaId});
    toast(r.creados ? `🎯 ${r.creados} token(s) en «${nombreDeMapaGM(mapaId)}», ocultos a los jugadores${r.salteados ? ` · ${r.salteados} ya estaban` : ''}` : `Todos los creeps de «${nombreDeMapaGM(mapaId)}» ya tienen su token`);
  }catch(err){
    console.error('No se pudieron crear los tokens:', err);
    toast('No se pudieron crear los tokens — mirá la consola');
  }
}
// ＋ Mapa nuevo: el asistente paso a paso común (comun/asistente-mapa.js). `marcado`: el creep que pidió el mapa nuevo («Mover a… ＋ mapa
// nuevo»), que arranca marcado. Devuelve el id del mapa (o null si se canceló); los creeps marcados se mudan acá.
function pedirMapaNuevo(marcado){
  return new Promise(resolver => {
    const creeps = creepsReales().map(sc => ({id: sc.id, nombre: nombreLimpioCreep(sc), donde: nombreDeMapaGM(mapaDeCreepGM(sc))}));
    AsistenteMapa.abrir({nombre: `Mapa ${mapasGM.size + 1}`, creeps, marcados: marcado ? [marcado] : [], alCrear: async r => {
      let id;
      try{ id = await CreepsMapas.crearMapa(r.nombre); }
      catch(err){ console.error('No se pudo crear el mapa:', err); toast('No se pudo crear el mapa'); return false; }
      if(!mapasGM.has(id)) mapasGM.set(id, {nombre: r.nombre, creadoMs: Date.now()});   // hasta que llegue de Firebase
      for(const cid of r.creeps){ const sc = S.creeps.find(s => s.id === cid); if(sc) await moverCreepAMapa(sc, id); }
      resolver(id);
    }, alCancelar: () => resolver(null)});
  });
}
// Mudar un creep a otro mapa (o a la Reserva), con su token: si tenía uno, aparece oculto en el mapa nuevo y se va del viejo.
async function moverCreepAMapa(sc, destino){
  if(mapaDeCreepGM(sc) === destino) return;
  sc.mapa = destino;
  renderAll();
  if(!fbDb || !fbMiembro || !fbMiembro.gm){ toast(`🗺 ${nombreLimpioCreep(sc)} → ${nombreDeMapaGM(destino)}`); return; }
  try{
    const r = await CreepsMapas.mudarTokens({id: sc.id, nombre: nombreLimpioCreep(sc), color: sc.color}, destino);
    toast(`🗺 ${nombreLimpioCreep(sc)} → ${nombreDeMapaGM(destino)}${r.creado ? ' (con su token, oculto)' : r.borrados ? ' (su token salió del mapa)' : ''}`);
  }catch(err){
    console.error('No se pudo mudar el token del creep:', err);
    toast('Se movió de mapa, pero no se pudo mudar su token — movelo a mano en el mapa');
  }
}
document.addEventListener('click', async e => {
  const b = e.target.closest('button');
  if(!b) return;
  if(b.dataset.mapaTab !== undefined){ fijarPestanaMapa(b.dataset.mapaTab); return; }
  if(b.dataset.mapaNuevo){ const id = await pedirMapaNuevo(); if(id) fijarPestanaMapa(id); return; }
  if(b.dataset.mapaTokens){ crearTokensDelMapa(); return; }
  if(b.dataset.mapaEstimado){ abrirBotinEstimado(); return; }
});
// 💰 Botín estimado de la pestaña abierta (2026-10-04): comun/combate-fin.js (estimar), el mismo que muestra el mapa en 🗺 Mapas.
function abrirBotinEstimado(){
  const lista = creepsReales().filter(sc => mapaDeCreepGM(sc) === pestanaMapa);
  $('#veritem-titulo').textContent = `💰 Botín estimado · ${nombreDeMapaGM(pestanaMapa)}`;
  $('#veritem-body').innerHTML = CombateFin.estimadoHtml(CombateFin.estimar(lista, CATALOGO_EQUIPO), nombreDeMapaGM(pestanaMapa));
  $('#veritem-baja').style.display = 'none';
  verItemActual = null;
  $('#scrim-ver-item').classList.add('open');
}
document.addEventListener('change', async e => {
  const t = e.target;
  if(t.dataset.mapaCreep === undefined) return;
  const sc = S.creeps.find(s => s.id === t.dataset.mapaCreep);
  if(!sc) return;
  let destino = t.value;
  if(destino === '__nuevo'){
    await pedirMapaNuevo(sc.id);   // si lo deja marcado, el asistente ya lo muda
    renderAll(); return;
  }
  moverCreepAMapa(sc, destino);
});
// «🗺 Mover a…»: el mapa del creep, para mudarlo. compacto: el de la tarjeta; si no, el de la ficha completa.
function mapaSelectHtml(sc, compacto){
  const actual = mapaDeCreepGM(sc);
  const ops = [...mapasOrdenadosGM(), {id: CreepsMapas.RESERVA, nombre: '🎒 Reserva'}]
    .map(m => `<option value="${esc(m.id)}"${m.id === actual ? ' selected' : ''}>${esc(m.id === CreepsMapas.RESERVA ? m.nombre : '🗺 ' + m.nombre)}</option>`).join('')
    + '<option value="__nuevo">＋ mapa nuevo…</option>';
  return compacto
    ? `<select class="mapa-creep" data-mapa-creep="${sc.id}" title="En qué mapa está: elegí otro para mudarlo (su token se muda con él)">${ops}</select>`
    : `<div class="mini-f" style="margin-bottom:8px"><label>Mapa (elegí otro para mudarlo, con su token)</label><select data-mapa-creep="${sc.id}">${ops}</select></div>`;
}
// Los grupos viejos pasan a ser mapas, una vez (comun/creeps-mapas.js, migrar): al entrar el GM, con los creeps ya leídos.
async function gmMigrarGrupos(){
  let vacios = [];
  try{ vacios = JSON.parse(localStorage.getItem('gm-grupos-extra-' + FB_CAMPANA) || '[]'); }catch(e){}
  try{
    const r = await CreepsMapas.migrar(creepsReales(), {vacios: Array.isArray(vacios) ? vacios : []});
    try{ localStorage.removeItem('gm-grupos-extra-' + FB_CAMPANA); localStorage.removeItem('gm-grupo-activo-' + FB_CAMPANA); }catch(e){}
    renderAll();
    if(r.cambiados || r.creados) toast(`🗺 Los grupos pasaron a ser mapas: ${r.cambiados} creep(s) ubicados${r.creados ? ` · ${r.creados} mapa(s) nuevo(s)` : ''}`);
  }catch(err){ console.error('No se pudieron pasar los grupos a mapas:', err); }
}

/* =========================================================
   Botín pendiente (GM): lo que los jugadores no tomaron → "Despojar"
   campanas/<id>/botin/*: un doc por ítem ({nombre, json, despojos, tomadoPor, tomadoNombre}).
   Despojar suma los despojos de lo que quedó, los reparte entre los jugadores elegidos (hacia arriba) como
   recompensas (la ficha las aplica sola) y borra el botín.
   ========================================================= */
let botinGM = {...CombateFin.nuevoBotin(), escucha: null};   // las reglas y el dibujo, en comun/combate-fin.js (A6a)
function botinEscuchar(){
  if(botinGM.escucha || !fbDb || !fbMiembro) return;
  botinGM.escucha = fbDb.collection(fbRutaCampana('botin')).onSnapshot(snap => {
    botinGM.docs = snap.docs.map(d => ({id: d.id, ...d.data()}));
    if($('#scrim-botin-gm').classList.contains('open')) renderBotinGM();
  }, err => console.error('No se pudo escuchar el botín:', err));
}
/* Estado del combate (campanas/<id>/combate/actual): el botón 🎁 Despojos solo se habilita con el botín publicado. */
let combateActual;   // undefined = todavía no se leyó; null = no hay combate
function combateEscuchar(){
  fbDb.doc(fbRutaCampana('combate/actual')).onSnapshot(snap => {
    combateActual = snap.exists ? snap.data() : null;
    actualizarBotonDespojos();
    if(!(combateActual && combateActual.estado === 'publicado') && $('#scrim-botin-gm').classList.contains('open') && !botinGM.ocupado) $('#scrim-botin-gm').classList.remove('open');
  }, err => console.error('Error escuchando el estado del combate:', err));
}
function actualizarBotonDespojos(){
  const b = $('#btn-botin');
  if(b) b.disabled = !(combateActual && combateActual.estado === 'publicado');
}
async function abrirBotinGM(){
  if(combateActual === undefined && fbDb){
    try{ const s = await fbDb.doc(fbRutaCampana('combate/actual')).get(); combateActual = s.exists ? s.data() : null; }catch(err){ combateActual = null; }
  }
  if(!(combateActual && combateActual.estado === 'publicado')){ toast('No hay botín publicado: se habilita cuando confirmás el fin de un combate con ítems'); return; }
  botinEscuchar();
  $('#scrim-botin-gm').classList.add('open');
  renderBotinGM();
  if(botinGM.jugadores === null && fbDb && fbMiembro){
    try{
      botinGM.jugadores = await CombateFin.jugadoresBotin();
      botinGM.incluidos = new Set(botinGM.jugadores.map(j => j.id));
    }catch(err){ botinGM.jugadores = []; console.error(err); }
    renderBotinGM();
  }
}
function renderBotinGM(){
  const v = CombateFin.botinVista(botinGM);
  $('#botin-gm-cuerpo').innerHTML = v.html;
  $('#botin-gm-despojar').disabled = botinGM.ocupado;
  $('#botin-gm-despojar').textContent = v.boton;
}
$('#botin-gm-cuerpo').addEventListener('change', e => { if(CombateFin.botinCambio(botinGM, e.target)) renderBotinGM(); });
$('#botin-gm-cuerpo').addEventListener('click', e => {
  const b = e.target.closest('[data-botin-ver]');
  if(b){ const it = CombateFin.botinItem(botinGM, b.dataset.botinVer); if(it) verItemDatos(it); }
});
async function despojarBotin(){
  const res = await CombateFin.despojar(botinGM, {combateActual, confirmar: texto => Confirmar.preguntar(texto), alEmpezar: renderBotinGM});
  if(!res) return;
  if(res.error){ toast(res.error); renderBotinGM(); return; }
  toast(res.mensaje);
  $('#scrim-botin-gm').classList.remove('open');
}
$('#botin-gm-despojar').onclick = despojarBotin;
$('#botin-gm-x').onclick = () => $('#scrim-botin-gm').classList.remove('open');
$('#botin-gm-cerrar').onclick = () => $('#scrim-botin-gm').classList.remove('open');
document.addEventListener('click', e => { if(e.target.closest('#btn-botin')) abrirBotinGM(); });

/* =========================================================
   BITÁCORA DEL GM (privada, Firebase)
   campanas/<partida>/gmBitacora/<página> = {nombre, creado, creadoUid, creadoPor}
   campanas/<partida>/gmBitacora/<página>/entradas/<id> =
     {texto, uid, autor, creado, editado?, editadoUid?, editadoPor?}
   Mismo formato que la bitácora de los jugadores (ficha.html), pero solo la
   lee y escribe el GM. Cada entrada va en el color de su autor.
   ========================================================= */
const GBIT_COLORES = ['#E0A458', '#8EE6A8', '#7FB3F0', '#F08FA8', '#C9A8F5', '#F2D16B', '#6FD6C8', '#F0A36F'];
const gbit = {paginas: [], activa: '', entradas: [], corteEntradas: null, editando: '', escuchando: false};

function gbitColor(uid){
  let h = 0;
  for(const ch of String(uid || '')) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return GBIT_COLORES[h % GBIT_COLORES.length];
}
function gbitFecha(ts){
  if(!ts || !ts.toDate) return '';
  const d = ts.toDate();
  return `${d.getDate()}/${d.getMonth() + 1}`;
}
function gbitEscuchar(){
  if(gbit.escuchando) return;
  gbit.escuchando = true;
  try{ gbit.activa = localStorage.getItem('gbit-activa-' + FB_CAMPANA) || ''; }catch(e){}
  fbDb.collection(fbRutaCampana('gmBitacora')).orderBy('creado').onSnapshot(snap => {
    gbit.paginas = snap.docs.map(d => ({id: d.id, ...d.data()}));
    if(!gbit.paginas.some(p => p.id === gbit.activa)) gbitElegir(gbit.paginas.length ? gbit.paginas[0].id : '');
    else if(!gbit.corteEntradas) gbitElegir(gbit.activa);
    else gbitRender();
  }, err => {
    console.error('Error escuchando la bitácora del GM:', err);
    $('#gbit-estado').textContent = 'No se pudo leer la bitácora del GM. ¿Están publicadas las reglas nuevas de Firestore?';
  });
}
function gbitElegir(id){
  gbit.activa = id;
  gbit.editando = '';
  try{ localStorage.setItem('gbit-activa-' + FB_CAMPANA, id); }catch(e){}
  if(gbit.corteEntradas){ gbit.corteEntradas(); gbit.corteEntradas = null; }
  gbit.entradas = [];
  if(id){
    gbit.corteEntradas = fbDb.collection(fbRutaCampana(`gmBitacora/${id}/entradas`)).orderBy('creado')
      .onSnapshot(snap => {
        gbit.entradas = snap.docs.map(d => ({id: d.id, ...d.data({serverTimestamps: 'estimate'})}));
        const lista = $('#gbit-entradas');
        const alFondo = lista.scrollHeight - lista.scrollTop - lista.clientHeight < 30;
        gbitRender();
        if(alFondo) lista.scrollTop = lista.scrollHeight;
      }, err => console.error('Error escuchando las entradas de la bitácora del GM:', err));
  }
  gbitRender();
}
function gbitRender(){
  const tabs = $('#gbit-tabs'), lista = $('#gbit-entradas');
  const conectado = !!(gbit.escuchando && fbDb && fbMiembro && fbMiembro.gm);
  $('#gbit-add').disabled = !conectado;
  $('#gbit-sumar').disabled = !conectado || !gbit.activa;
  $('#gbit-nueva').disabled = !conectado || !gbit.activa;
  if(!conectado){
    tabs.innerHTML = '';
    lista.innerHTML = '<div class="bit-vacia">Sin conexión con la partida como GM: la bitácora del GM no está disponible.</div>';
    return;
  }
  // No redibujar las pestañas mientras se les cambia el nombre.
  if(!tabs.contains(document.activeElement)){
    tabs.innerHTML = gbit.paginas.map(p => `
      <div class="bit-tab ${p.id === gbit.activa ? 'active' : ''}" data-gbit-pagina="${esc(p.id)}">
        <input class="bit-tab-name" data-gbit-nombre="${esc(p.id)}" value="${esc(p.nombre || 'Página')}" maxlength="40" title="Clic para abrir · editá el nombre y apretá Enter">
        <button type="button" class="bit-tab-x" data-gbit-borrar-pagina="${esc(p.id)}" title="Borrar página">×</button>
      </div>`).join('');
  }
  if(!gbit.paginas.length){
    lista.innerHTML = '<div class="bit-vacia">Todavía no hay páginas. Tocá "+ Página" para empezar tu bitácora.</div>';
    return;
  }
  if(!gbit.entradas.length){
    lista.innerHTML = '<div class="bit-vacia">Esta página está vacía: sumá lo primero abajo.</div>';
    return;
  }
  // No redibujar mientras se corrige una entrada (se perdería lo escrito).
  if(gbit.editando && lista.querySelector('textarea[data-gbit-edicion]')) return;
  lista.innerHTML = gbit.entradas.map(en => {
    const color = gbitColor(en.uid);
    const firma = `${esc(en.autor || '?')} · ${gbitFecha(en.creado)}` +
      (en.editadoPor ? ` · editado por ${esc(en.editadoPor)} ${gbitFecha(en.editado)}` : '');
    if(en.id === gbit.editando){
      return `<div class="bit-entrada" style="border-left-color:${color};flex-direction:column">
        <textarea data-gbit-edicion="${esc(en.id)}">${esc(en.texto || '')}</textarea>
        <div style="display:flex;margin-top:4px;gap:6px">
          <button type="button" class="btn ghost" data-gbit-guardar="${esc(en.id)}">Guardar</button>
          <button type="button" class="btn ghost" data-gbit-cancelar="1">Cancelar</button>
        </div>
      </div>`;
    }
    return `<div class="bit-entrada" style="border-left-color:${color}">
      <div class="bit-texto" style="color:${color}">${esc(en.texto || '')} <span class="bit-firma">(${firma})</span></div>
      <div class="bit-botones">
        <button type="button" class="iconbtn" data-gbit-editar="${esc(en.id)}" title="Corregir">✎</button>
        <button type="button" class="iconbtn" data-gbit-borrar="${esc(en.id)}" title="Borrar">✕</button>
      </div>
    </div>`;
  }).join('');
}
async function gbitNuevaPagina(){
  if(!fbDb || !fbMiembro || !fbMiembro.gm) return;
  try{
    const ref = await fbDb.collection(fbRutaCampana('gmBitacora')).add({
      nombre: `Página ${gbit.paginas.length + 1}`,
      creado: firebase.firestore.FieldValue.serverTimestamp(),
      creadoUid: fbUsuario.uid,
      creadoPor: fbMiembro.nombre,
    });
    gbitElegir(ref.id);
    setTimeout(() => { const i = document.querySelector(`[data-gbit-nombre="${ref.id}"]`); if(i){ i.focus(); i.select(); } }, 300);
  }catch(err){
    console.error('No se pudo crear la página del GM:', err);
    toast(err.code === 'permission-denied' ? 'No se pudo: faltan publicar las reglas nuevas de Firestore' : 'No se pudo crear la página');
  }
}
async function gbitSumar(){
  const campo = $('#gbit-nueva');
  const texto = campo.value.trim();
  if(!texto || !gbit.activa || !fbDb || !fbMiembro) return;
  campo.disabled = true;
  try{
    await fbDb.collection(fbRutaCampana(`gmBitacora/${gbit.activa}/entradas`)).add({
      texto: texto.slice(0, 4000),
      uid: fbUsuario.uid,
      autor: fbMiembro.nombre,
      creado: firebase.firestore.FieldValue.serverTimestamp(),
    });
    campo.value = '';
    const lista = $('#gbit-entradas');
    setTimeout(() => { lista.scrollTop = lista.scrollHeight; }, 50);
  }catch(err){
    console.error('No se pudo sumar a la bitácora del GM:', err);
    toast(err.code === 'permission-denied' ? 'No se pudo: faltan publicar las reglas nuevas de Firestore' : 'No se pudo sumar a la bitácora');
  }finally{
    campo.disabled = false;
    campo.focus();
  }
}
async function gbitGuardarEdicion(id){
  const campo = document.querySelector(`textarea[data-gbit-edicion="${id}"]`);
  if(!campo) return;
  const texto = campo.value.trim();
  if(!texto){ toast('Si querés sacarla, usá ✕'); return; }
  try{
    await fbDb.doc(fbRutaCampana(`gmBitacora/${gbit.activa}/entradas/${id}`)).update({
      texto: texto.slice(0, 4000),
      editado: firebase.firestore.FieldValue.serverTimestamp(),
      editadoUid: fbUsuario.uid,
      editadoPor: fbMiembro.nombre,
    });
    gbit.editando = '';
    gbitRender();
  }catch(err){
    console.error('No se pudo corregir la entrada del GM:', err);
    toast('No se pudo guardar la corrección');
  }
}
async function gbitBorrarPagina(id){
  const p = gbit.paginas.find(x => x.id === id);
  if(!(await Confirmar.preguntar(`¿Borrar la página "${p ? p.nombre : ''}" con todo lo que tiene?`, {titulo: 'Borrar', si: 'Borrar', peligro: true}))) return;
  try{
    const entradas = await fbDb.collection(fbRutaCampana(`gmBitacora/${id}/entradas`)).get();
    const lote = fbDb.batch();
    entradas.docs.forEach(d => lote.delete(d.ref));
    lote.delete(fbDb.doc(fbRutaCampana(`gmBitacora/${id}`)));
    await lote.commit();
  }catch(err){
    console.error('No se pudo borrar la página del GM:', err);
    toast('No se pudo borrar la página');
  }
}
function gbitAbrir(){
  $('#scrim-gbit').classList.add('open');
  gbitRender();
}
function gbitCerrar(){ $('#scrim-gbit').classList.remove('open'); }
$('#btn-gbit').onclick = gbitAbrir;
$('#gbit-x').onclick = gbitCerrar;
$('#gbit-cerrar').onclick = gbitCerrar;
$('#gbit-add').onclick = gbitNuevaPagina;
$('#gbit-sumar').onclick = gbitSumar;
$('#gbit-nueva').addEventListener('keydown', e => {
  if(e.key === 'Enter' && (e.ctrlKey || e.metaKey)){ e.preventDefault(); gbitSumar(); }
});
$('#gbit-tabs').addEventListener('click', e => {
  const borrar = e.target.closest('[data-gbit-borrar-pagina]');
  if(borrar){ gbitBorrarPagina(borrar.dataset.gbitBorrarPagina); return; }
  const tab = e.target.closest('[data-gbit-pagina]');
  if(tab && tab.dataset.gbitPagina !== gbit.activa) gbitElegir(tab.dataset.gbitPagina);
});
$('#gbit-tabs').addEventListener('change', e => {
  const input = e.target.closest('[data-gbit-nombre]');
  if(!input) return;
  const nombre = input.value.trim().slice(0, 40);
  if(!nombre) return;
  fbDb.doc(fbRutaCampana(`gmBitacora/${input.dataset.gbitNombre}`)).update({nombre})
    .catch(err => { console.error('No se pudo renombrar la página del GM:', err); toast('No se pudo renombrar la página'); });
});
$('#gbit-tabs').addEventListener('keydown', e => {
  if(e.key === 'Enter' && e.target.matches('[data-gbit-nombre]')){ e.preventDefault(); e.target.blur(); }
});
$('#gbit-entradas').addEventListener('click', async e => {
  const editar = e.target.closest('[data-gbit-editar]');
  if(editar){
    gbit.editando = editar.dataset.gbitEditar;
    gbitRender();
    const campo = document.querySelector(`textarea[data-gbit-edicion="${gbit.editando}"]`);
    if(campo){ campo.focus(); campo.setSelectionRange(campo.value.length, campo.value.length); }
    return;
  }
  const guardar = e.target.closest('[data-gbit-guardar]');
  if(guardar){ gbitGuardarEdicion(guardar.dataset.gbitGuardar); return; }
  if(e.target.closest('[data-gbit-cancelar]')){ gbit.editando = ''; gbitRender(); return; }
  const borrar = e.target.closest('[data-gbit-borrar]');
  if(borrar){
    if(!(await Confirmar.preguntar('¿Borrar esta entrada de la bitácora del GM?', {titulo: 'Borrar', si: 'Borrar', peligro: true}))) return;
    fbDb.doc(fbRutaCampana(`gmBitacora/${gbit.activa}/entradas/${borrar.dataset.gbitBorrar}`)).delete()
      .catch(err => { console.error('No se pudo borrar la entrada del GM:', err); toast('No se pudo borrar'); });
  }
});
gbitRender();  // estado inicial: sin conexión hasta entrar a la partida

let toastT;
function toast(msg){
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(()=>t.classList.remove('show'), 2400);
  registrarEvento(msg);
}

document.addEventListener('change', async e => {
  if(e.target.dataset.imginput === undefined) return;
  const scId = e.target.dataset.imginput;
  const file = e.target.files[0];
  e.target.value = '';
  if(!file) return;
  const sc = S.creeps.find(x=>x.id===scId);
  if(!sc) return;
  try{
    sc.imagen = await fileToDataURL(file, 480, 0.85);
    renderAll();
  }catch(err){
    toast('No se pudo cargar esa imagen');
  }
});

