// js/09-grupos-botin-y-bitacora.js — tramo 9 de 12 del script de gm-tools.html (paso 5, nivel A: mismo código, en el mismo orden).
/* =========================================================
   Grupos de creeps (pestañas por escenario) y tokens automáticos
   Un creep pertenece a UN solo grupo (campo `grupo`); para repetir uno en otro escenario se lo duplica.
   ========================================================= */
let grupoActivo = '';   // '' = todos · '__sin' = sin grupo · si no, el nombre del grupo
// Ojo (2026-09-22, bug real): estas dos claves tienen que ir por partida (FB_CAMPANA), igual que
// gbit-activa-/bitacora-activa- más abajo — sin el sufijo, un grupo vacío creado en una partida
// aparecía como pestaña en cualquier otra partida abierta en el mismo navegador.
try{ grupoActivo = localStorage.getItem('gm-grupo-activo-' + FB_CAMPANA) || ''; }catch(e){}
function gruposExtra(){ try{ const g = JSON.parse(localStorage.getItem('gm-grupos-extra-' + FB_CAMPANA) || '[]'); return Array.isArray(g) ? g : []; }catch(e){ return []; } }
function guardarGruposExtra(l){ try{ localStorage.setItem('gm-grupos-extra-' + FB_CAMPANA, JSON.stringify(l)); }catch(e){} }
function nombresDeGrupos(){
  const set = new Set(gruposExtra());
  S.creeps.forEach(sc => { if(sc.grupo) set.add(sc.grupo); });
  return [...set].sort((a, b) => a.localeCompare(b, 'es'));
}
function pasaGrupo(sc){
  if(sc._borrador) return false;
  if(!grupoActivo) return true;
  if(grupoActivo === '__sin') return !sc.grupo;
  return sc.grupo === grupoActivo;
}
function grupoParaNuevo(){ return grupoActivo && grupoActivo !== '__sin' ? grupoActivo : ''; }
function fijarGrupoActivo(g){
  grupoActivo = g;
  try{ localStorage.setItem('gm-grupo-activo-' + FB_CAMPANA, g); }catch(e){}
  renderAll();
}
function renderGruposBarra(){
  const caja = $('#grupos-barra');
  if(!caja) return;
  const grupos = nombresDeGrupos();
  const cuenta = g => creepsReales().filter(sc => g === '' ? true : g === '__sin' ? !sc.grupo : sc.grupo === g).length;
  const sinGrupo = cuenta('__sin');
  const tab = (id, texto, n) => `<button type="button" class="btn${grupoActivo === id ? ' primary' : ''}" data-grupo-tab="${esc(id)}" style="padding:4px 10px;font-size:12.5px">${esc(texto)} <span class="hint">${n}</span></button>`;
  const real = grupoActivo && grupoActivo !== '__sin' && grupos.includes(grupoActivo);
  caja.innerHTML = `<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:0 0 10px">
      ${tab('', 'Todos', cuenta(''))}${grupos.map(g => tab(g, g, cuenta(g))).join('')}${grupos.length ? tab('__sin', 'Sin grupo', sinGrupo) : ''}
      <button type="button" class="btn ghost" data-grupo-nuevo="1" style="padding:4px 10px;font-size:12.5px" title="Crear un grupo (un escenario de combate)">＋ Grupo</button>
      ${real ? `<span style="margin-left:auto;display:flex;gap:6px;align-items:center">
        <label class="hint" style="display:flex;gap:4px;align-items:center" title="Mapa vinculado a este grupo: Crear tokens y Traer tokens (en el mapa) lo usan">🗺 <select data-grupo-mapa="1" style="padding:3px 6px;font-size:12.5px"><option value="">sin mapa</option>${[...mapasNombres.keys()].map(id => `<option value="${esc(id)}"${TokensAuto.mapaDeGrupo(gruposMapas, grupoActivo) === id ? ' selected' : ''}>${esc(nombreDeMapaGM(id))}</option>`).join('')}</select></label>
        <button type="button" class="btn primary" data-grupo-tokens="1" title="Crea un token por cada creep de este grupo, en fila, en el centro del mapa que estás viendo (ocultos a los jugadores)">🎯 Crear tokens (${cuenta(grupoActivo)})</button>
        <button type="button" class="btn ghost" data-grupo-renombrar="1" title="Renombrar el grupo">✎</button>
        <button type="button" class="btn ghost" data-grupo-borrar="1" title="Quitar el grupo (los creeps quedan sin grupo)">🗑</button></span>` : ''}
    </div>`;
}
/* Grupo ↔ mapa: cada grupo puede tener un mapa vinculado (el mismo dato se edita desde el panel de Mapas del mapa). Si lo tiene,
   "Crear tokens" los pone en ese mapa; si no, en el que el GM está viendo. */
let gruposMapas = [];
const mapasNombres = new Map();
function nombreDeMapaGM(id){ return mapasNombres.get(id) || (id === '_principal' ? 'Mapa 1' : id); }
function gruposMapasEscuchar(){
  TokensAuto.enlacesEscuchar(l => { gruposMapas = l; renderGruposBarra(); });
  fbDb.collection(fbRutaCampana('mapas')).onSnapshot(snap => {
    mapasNombres.clear();
    snap.docs.forEach(d => mapasNombres.set(d.id, String(d.data().nombre || 'Mapa')));
    if(!mapasNombres.has('_principal')) mapasNombres.set('_principal', 'Mapa 1');
    renderGruposBarra();
  }, err => console.error('Error escuchando la lista de mapas:', err));
}
async function crearTokensDelGrupo(){
  if(!fbDb || !fbMiembro || !fbMiembro.gm){ toast('Sin conexión con la partida como GM'); return; }
  const lista = S.creeps.filter(sc => sc.grupo === grupoActivo);
  if(!lista.length){ toast('Ese grupo no tiene creeps'); return; }
  try{
    const mapaVinculado = TokensAuto.mapaDeGrupo(gruposMapas, grupoActivo);
    const r = await TokensAuto.crear(lista.map(sc => ({nombre: nombreLimpioCreep(sc), color: sc.color, tipo: 'creep', fichaId: sc.id, oculto: true})), mapaVinculado ? {mapaId: mapaVinculado} : undefined);
    toast(r.creados ? `🎯 ${r.creados} token(s) creados en el mapa que estás viendo, ocultos a los jugadores${r.salteados ? ` · ${r.salteados} ya estaban` : ''}` : 'Todos los creeps de ese grupo ya tienen token en ese mapa');
  }catch(err){
    console.error('No se pudieron crear los tokens:', err);
    toast('No se pudieron crear los tokens — mirá la consola');
  }
}
document.addEventListener('click', e => {
  const b = e.target.closest('button');
  if(!b) return;
  if(b.dataset.grupoTab !== undefined){ fijarGrupoActivo(b.dataset.grupoTab); return; }
  if(b.dataset.grupoNuevo){
    const n = (prompt('Nombre del grupo (por ejemplo, el escenario de combate):') || '').trim().slice(0, 40);
    if(!n) return;
    if(!nombresDeGrupos().includes(n)) guardarGruposExtra([...gruposExtra(), n]);
    fijarGrupoActivo(n);
    return;
  }
  if(b.dataset.grupoTokens){ crearTokensDelGrupo(); return; }
  if(b.dataset.grupoRenombrar){
    const n = (prompt('Nuevo nombre del grupo:', grupoActivo) || '').trim().slice(0, 40);
    if(!n || n === grupoActivo) return;
    S.creeps.forEach(sc => { if(sc.grupo === grupoActivo) sc.grupo = n; });
    const mapaDelGrupo = TokensAuto.mapaDeGrupo(gruposMapas, grupoActivo);
    if(mapaDelGrupo) TokensAuto.enlacesGuardar(TokensAuto.vincular(TokensAuto.vincular(gruposMapas, grupoActivo, ''), n, mapaDelGrupo)).catch(err => console.error(err));
    guardarGruposExtra(gruposExtra().filter(x => x !== grupoActivo).concat(n));
    fijarGrupoActivo(n);
    return;
  }
  if(b.dataset.grupoBorrar){
    if(!confirm(`¿Quitar el grupo "${grupoActivo}"? Los creeps no se borran: quedan sin grupo.`)) return;
    S.creeps.forEach(sc => { if(sc.grupo === grupoActivo) sc.grupo = ''; });
    if(TokensAuto.mapaDeGrupo(gruposMapas, grupoActivo)) TokensAuto.enlacesGuardar(TokensAuto.vincular(gruposMapas, grupoActivo, '')).catch(err => console.error(err));
    guardarGruposExtra(gruposExtra().filter(x => x !== grupoActivo));
    fijarGrupoActivo('');
  }
});
document.addEventListener('change', async e => {
  const t = e.target;
  if(t.dataset.grupoMapa !== undefined){
    try{
      await TokensAuto.enlacesGuardar(TokensAuto.vincular(gruposMapas, grupoActivo, t.value));
      toast(t.value ? `🗺 ${grupoActivo} vinculado a ${nombreDeMapaGM(t.value)}` : `🗺 ${grupoActivo} ya no tiene mapa vinculado`);
    }catch(err){ console.error(err); toast('No se pudo vincular el mapa'); }
    return;
  }
  if(t.dataset.grupoCreep === undefined) return;
  const sc = S.creeps.find(s => s.id === t.dataset.grupoCreep);
  if(!sc) return;
  let g = t.value;
  if(g === '__nuevo'){
    g = (prompt('Nombre del grupo nuevo:') || '').trim().slice(0, 40);
    if(!g){ renderAll(); return; }
    if(!nombresDeGrupos().includes(g)) guardarGruposExtra([...gruposExtra(), g]);
  }
  sc.grupo = g;
  renderAll();
});
/* Arrastrar un creep (⠿) a la pestaña de un grupo (o a "Sin grupo") lo mueve. "Todos" no es un contenedor: no recibe. */
let creepArrastrado = '';
function grupoDestinoDeTab(tab){
  if(!tab || tab.dataset.grupoTab === undefined || tab.dataset.grupoTab === '') return null;
  return tab.dataset.grupoTab === '__sin' ? '' : tab.dataset.grupoTab;
}
document.addEventListener('dragstart', e => {
  const grip = e.target.closest && e.target.closest('[data-arrastrar-creep]');
  if(!grip) return;
  creepArrastrado = grip.dataset.arrastrarCreep;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', creepArrastrado);
  const card = grip.closest('.card');
  if(card) e.dataTransfer.setDragImage(card, 20, 20);
  document.body.classList.add('arrastrando-creep');
});
document.addEventListener('dragend', () => {
  creepArrastrado = '';
  document.body.classList.remove('arrastrando-creep');
  document.querySelectorAll('.arrastrando-encima').forEach(x => x.classList.remove('arrastrando-encima'));
});
document.addEventListener('dragover', e => {
  if(!creepArrastrado) return;
  const tab = e.target.closest && e.target.closest('#grupos-barra [data-grupo-tab]');
  if(grupoDestinoDeTab(tab) === null) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  tab.classList.add('arrastrando-encima');
});
document.addEventListener('dragleave', e => {
  const tab = e.target.closest && e.target.closest('#grupos-barra [data-grupo-tab]');
  if(tab && !tab.contains(e.relatedTarget)) tab.classList.remove('arrastrando-encima');
});
document.addEventListener('drop', e => {
  if(!creepArrastrado) return;
  const tab = e.target.closest && e.target.closest('#grupos-barra [data-grupo-tab]');
  const destino = grupoDestinoDeTab(tab);
  if(destino === null) return;
  e.preventDefault();
  const sc = S.creeps.find(s => s.id === creepArrastrado);
  creepArrastrado = '';
  document.body.classList.remove('arrastrando-creep');
  if(!sc || (sc.grupo || '') === destino){ renderAll(); return; }
  sc.grupo = destino;
  renderAll();
  toast(`📦 ${nombreLimpioCreep(sc)} → ${destino || 'Sin grupo'}`);
});
function grupoSelectHtml(sc){
  const gs = nombresDeGrupos();
  return `<div class="mini-f" style="margin-bottom:8px"><label>Grupo (escenario)</label>
    <select data-grupo-creep="${sc.id}"><option value="">(sin grupo)</option>${gs.map(g => `<option value="${esc(g)}"${sc.grupo === g ? ' selected' : ''}>${esc(g)}</option>`).join('')}<option value="__nuevo">＋ nuevo grupo…</option></select></div>`;
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
  const res = await CombateFin.despojar(botinGM, {combateActual, confirmar: texto => confirm(texto), alEmpezar: renderBotinGM});
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
  if(!confirm(`¿Borrar la página "${p ? p.nombre : ''}" con todo lo que tiene?`)) return;
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
$('#gbit-entradas').addEventListener('click', e => {
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
    if(!confirm('¿Borrar esta entrada de la bitácora del GM?')) return;
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

