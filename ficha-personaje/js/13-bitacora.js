// js/13-bitacora.js — tramo 13 de 14 del script de ficha.html (paso 5, nivel A: mismo código, en el mismo orden).
/* =========================================================
   BITÁCORA DE LA PARTIDA (compartida, Firebase)
   campanas/<partida>/bitacora/<página> = {nombre, creado, creadoUid, creadoPor}
   campanas/<partida>/bitacora/<página>/entradas/<id> =
     {texto, uid, autor, creado, editado?, editadoUid?, editadoPor?}
   Todos los miembros la leen; cualquiera suma páginas y entradas, y
   corrige cualquier entrada (queda quién editó y cuándo). Borrar: la
   entrada su autor o el GM; la página quien la creó o el GM. Cada entrada
   va en el color de su autor, con "(autor · fecha)" al final.
   ========================================================= */

const BITACORA_COLORES = ['#E0A458', '#8EE6A8', '#7FB3F0', '#F08FA8', '#C9A8F5', '#F2D16B', '#6FD6C8', '#F0A36F'];
let bitacoraPaginas = [];        // [{id, nombre, creadoUid}]
let bitacoraActiva = '';
let bitacoraEntradas = [];       // de la página activa
let bitacoraCorteEntradas = null;
let bitacoraEditando = '';       // id de la entrada que se está corrigiendo
let bitacoraConectada = false;

function bitacoraColor(uid){
  let h = 0;
  for(const ch of String(uid || '')) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return BITACORA_COLORES[h % BITACORA_COLORES.length];
}

function bitacoraFecha(ts){
  if(!ts || !ts.toDate) return '';
  const d = ts.toDate();
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function bitacoraEscuchar(){
  bitacoraConectada = true;
  try{ bitacoraActiva = localStorage.getItem('bitacora-activa-' + FB_CAMPANA) || ''; }catch(e){}
  fbDb.collection(fbRutaCampana('bitacora')).orderBy('creado').onSnapshot(snap => {
    bitacoraPaginas = snap.docs.map(d => ({id: d.id, ...d.data()}));
    if(!bitacoraPaginas.some(p => p.id === bitacoraActiva)) bitacoraElegir(bitacoraPaginas.length ? bitacoraPaginas[0].id : '');
    else if(!bitacoraCorteEntradas) bitacoraElegir(bitacoraActiva);
    else bitacoraRender();
  }, err => {
    console.error('Error escuchando la bitácora:', err);
    $('#bitacora-estado').textContent = 'No se pudo leer la bitácora. ¿Están publicadas las reglas nuevas de Firestore?';
  });
}

function bitacoraElegir(id){
  bitacoraActiva = id;
  bitacoraEditando = '';
  try{ localStorage.setItem('bitacora-activa-' + FB_CAMPANA, id); }catch(e){}
  if(bitacoraCorteEntradas){ bitacoraCorteEntradas(); bitacoraCorteEntradas = null; }
  bitacoraEntradas = [];
  if(id){
    bitacoraCorteEntradas = fbDb.collection(fbRutaCampana(`bitacora/${id}/entradas`)).orderBy('creado')
      .onSnapshot(snap => {
        bitacoraEntradas = snap.docs.map(d => ({id: d.id, ...d.data({serverTimestamps: 'estimate'})}));
        const lista = $('#bitacora-entradas');
        const alFondo = lista.scrollHeight - lista.scrollTop - lista.clientHeight < 30;
        bitacoraRender();
        if(alFondo) lista.scrollTop = lista.scrollHeight;
      }, err => console.error('Error escuchando las entradas de la bitácora:', err));
  }
  bitacoraRender();
}

function bitacoraPuedeBorrar(uidAutor){
  return !!(fbMiembro && (fbMiembro.gm || (fbUsuario && fbUsuario.uid === uidAutor)));
}

function bitacoraRender(){
  const tabs = $('#bitacora-tabs'), lista = $('#bitacora-entradas');
  if(!tabs || !lista) return;
  const conectado = !!(bitacoraConectada && fbDb && fbMiembro);
  $('#btn-bitacora-add').disabled = !conectado;
  $('#bitacora-sumar').disabled = !conectado || !bitacoraActiva;
  $('#bitacora-nueva').disabled = !conectado || !bitacoraActiva;
  if(!conectado){
    tabs.innerHTML = '';
    lista.innerHTML = '<div class="bit-vacia">Sin conexión con la partida: la bitácora compartida no está disponible.</div>';
    return;
  }
  // No redibujar las pestañas mientras alguien les cambia el nombre.
  if(!tabs.contains(document.activeElement)){
    tabs.innerHTML = bitacoraPaginas.map(p => `
      <div class="bit-tab ${p.id === bitacoraActiva ? 'active' : ''}" data-bit-pagina="${esc(p.id)}">
        <input class="bit-tab-name" data-bit-nombre="${esc(p.id)}" value="${esc(p.nombre || 'Página')}" maxlength="40" title="Clic para abrir · editá el nombre y apretá Enter">
        ${bitacoraPuedeBorrar(p.creadoUid) ? `<button class="bit-tab-x" data-bit-borrar-pagina="${esc(p.id)}" title="Borrar página">×</button>` : ''}
      </div>`).join('');
  }
  if(!bitacoraPaginas.length){
    lista.innerHTML = '<div class="bit-vacia">Todavía no hay páginas. Tocá "+ Página" para empezar la bitácora de la partida.</div>';
    return;
  }
  if(!bitacoraEntradas.length){
    lista.innerHTML = '<div class="bit-vacia">Esta página está vacía: sumá lo primero abajo.</div>';
    return;
  }
  // No redibujar mientras alguien corrige una entrada (se perdería lo escrito).
  if(bitacoraEditando && lista.querySelector('textarea[data-bit-edicion]')) return;
  lista.innerHTML = bitacoraEntradas.map(en => {
    const color = bitacoraColor(en.uid);
    const firma = `${esc(en.autor || '?')} · ${bitacoraFecha(en.creado)}` +
      (en.editadoPor ? ` · editado por ${esc(en.editadoPor)} ${bitacoraFecha(en.editado)}` : '');
    if(en.id === bitacoraEditando){
      return `<div class="bit-entrada" style="border-left-color:${color};flex-direction:column">
        <textarea data-bit-edicion="${esc(en.id)}">${esc(en.texto || '')}</textarea>
        <div class="fila" style="margin-top:4px;gap:6px">
          <button type="button" class="mini" data-bit-guardar="${esc(en.id)}">Guardar</button>
          <button type="button" class="mini" data-bit-cancelar="1">Cancelar</button>
        </div>
      </div>`;
    }
    return `<div class="bit-entrada" style="border-left-color:${color}">
      <div class="bit-texto" style="color:${color}">${esc(en.texto || '')} <span class="bit-firma">(${firma})</span></div>
      <div class="bit-botones">
        <button type="button" class="mini" data-bit-editar="${esc(en.id)}" title="Corregir">✎</button>
        ${bitacoraPuedeBorrar(en.uid) ? `<button type="button" class="mini" data-bit-borrar="${esc(en.id)}" title="Borrar">✕</button>` : ''}
      </div>
    </div>`;
  }).join('');
}

async function bitacoraNuevaPagina(){
  if(!fbDb || !fbMiembro) return;
  try{
    const ref = await fbDb.collection(fbRutaCampana('bitacora')).add({
      nombre: `Página ${bitacoraPaginas.length + 1}`,
      creado: firebase.firestore.FieldValue.serverTimestamp(),
      creadoUid: fbUsuario.uid,
      creadoPor: fbMiembro.nombre,
    });
    bitacoraElegir(ref.id);
    setTimeout(() => { const i = document.querySelector(`[data-bit-nombre="${ref.id}"]`); if(i){ i.focus(); i.select(); } }, 300);
  }catch(err){
    console.error('No se pudo crear la página:', err);
    toast(err.code === 'permission-denied' ? 'No se pudo: faltan publicar las reglas nuevas de Firestore' : 'No se pudo crear la página');
  }
}

async function bitacoraSumar(){
  const campo = $('#bitacora-nueva');
  const texto = campo.value.trim();
  if(!texto || !bitacoraActiva || !fbDb || !fbMiembro) return;
  campo.disabled = true;
  try{
    await fbDb.collection(fbRutaCampana(`bitacora/${bitacoraActiva}/entradas`)).add({
      texto: texto.slice(0, 4000),
      uid: fbUsuario.uid,
      autor: fbMiembro.nombre,
      creado: firebase.firestore.FieldValue.serverTimestamp(),
    });
    campo.value = '';
    const lista = $('#bitacora-entradas');
    setTimeout(() => { lista.scrollTop = lista.scrollHeight; }, 50);
  }catch(err){
    console.error('No se pudo sumar a la bitácora:', err);
    toast(err.code === 'permission-denied' ? 'No se pudo: faltan publicar las reglas nuevas de Firestore' : 'No se pudo sumar a la bitácora');
  }finally{
    campo.disabled = false;
    campo.focus();
  }
}

async function bitacoraGuardarEdicion(id){
  const campo = document.querySelector(`textarea[data-bit-edicion="${id}"]`);
  if(!campo) return;
  const texto = campo.value.trim();
  if(!texto){ toast('Si querés sacarla, usá ✕'); return; }
  try{
    await fbDb.doc(fbRutaCampana(`bitacora/${bitacoraActiva}/entradas/${id}`)).update({
      texto: texto.slice(0, 4000),
      editado: firebase.firestore.FieldValue.serverTimestamp(),
      editadoUid: fbUsuario.uid,
      editadoPor: fbMiembro.nombre,
    });
    bitacoraEditando = '';
    bitacoraRender();
  }catch(err){
    console.error('No se pudo corregir la entrada:', err);
    toast('No se pudo guardar la corrección');
  }
}

async function bitacoraBorrarPagina(id){
  const p = bitacoraPaginas.find(x => x.id === id);
  if(!(await Confirmar.preguntar(`¿Borrar la página "${p ? p.nombre : ''}" con todo lo que tiene, para toda la mesa?`, {titulo: 'Borrar', si: 'Borrar', peligro: true}))) return;
  try{
    const entradas = await fbDb.collection(fbRutaCampana(`bitacora/${id}/entradas`)).get();
    const lote = fbDb.batch();
    entradas.docs.forEach(d => lote.delete(d.ref));
    lote.delete(fbDb.doc(fbRutaCampana(`bitacora/${id}`)));
    await lote.commit();
  }catch(err){
    console.error('No se pudo borrar la página:', err);
    toast('No se pudo borrar la página (solo quien la creó o el GM)');
  }
}

$('#btn-bitacora-add').onclick = bitacoraNuevaPagina;
$('#bitacora-sumar').onclick = bitacoraSumar;
$('#bitacora-nueva').addEventListener('keydown', e => {
  if(e.key === 'Enter' && (e.ctrlKey || e.metaKey)){ e.preventDefault(); bitacoraSumar(); }
});
$('#bitacora-tabs').addEventListener('click', e => {
  const borrar = e.target.closest('[data-bit-borrar-pagina]');
  if(borrar){ bitacoraBorrarPagina(borrar.dataset.bitBorrarPagina); return; }
  const tab = e.target.closest('[data-bit-pagina]');
  if(tab && tab.dataset.bitPagina !== bitacoraActiva) bitacoraElegir(tab.dataset.bitPagina);
});
$('#bitacora-tabs').addEventListener('change', e => {
  const input = e.target.closest('[data-bit-nombre]');
  if(!input) return;
  const nombre = input.value.trim().slice(0, 40);
  if(!nombre) return;
  fbDb.doc(fbRutaCampana(`bitacora/${input.dataset.bitNombre}`)).update({nombre})
    .catch(err => { console.error('No se pudo renombrar la página:', err); toast('No se pudo renombrar la página'); });
});
$('#bitacora-tabs').addEventListener('keydown', e => {
  if(e.key === 'Enter' && e.target.matches('[data-bit-nombre]')){ e.preventDefault(); e.target.blur(); }
});
$('#bitacora-entradas').addEventListener('click', async e => {
  const editar = e.target.closest('[data-bit-editar]');
  if(editar){
    bitacoraEditando = editar.dataset.bitEditar;
    bitacoraRender();
    const campo = document.querySelector(`textarea[data-bit-edicion="${bitacoraEditando}"]`);
    if(campo){ campo.focus(); campo.setSelectionRange(campo.value.length, campo.value.length); }
    return;
  }
  const guardar = e.target.closest('[data-bit-guardar]');
  if(guardar){ bitacoraGuardarEdicion(guardar.dataset.bitGuardar); return; }
  if(e.target.closest('[data-bit-cancelar]')){ bitacoraEditando = ''; bitacoraRender(); return; }
  const borrar = e.target.closest('[data-bit-borrar]');
  if(borrar){
    if(!(await Confirmar.preguntar('¿Borrar esta entrada de la bitácora, para toda la mesa?', {titulo: 'Borrar', si: 'Borrar', peligro: true}))) return;
    fbDb.doc(fbRutaCampana(`bitacora/${bitacoraActiva}/entradas/${borrar.dataset.bitBorrar}`)).delete()
      .catch(err => { console.error('No se pudo borrar la entrada:', err); toast('No se pudo borrar (solo su autor o el GM)'); });
  }
});
bitacoraRender();  // estado inicial: sin conexión hasta entrar a la partida

// Se llama cuando ya se entró a la mesa: arranca las tiradas y abre el
// último personaje de esta pestaña (o de este navegador).
async function fbAlEntrar(){
  if(window.parent === window && typeof Duelo !== 'undefined') Duelo.escuchar({aplicarEfecto: dueloAplicarEfectoPropio});   // aviso «te están atacando» (en el mapa lo escucha el propio mapa); aplicarEfecto: solo para lo que sea sobre uno mismo, ver dueloAplicarEfectoPropio
  bitacoraEscuchar();
  fichaIdentidadRender();
  mesaEscuchar();
  mesaHistorialAlEntrar();
  mantenimientoEscuchar();
  modoMapaEscuchar();
  tiendaEstadoEscuchar();
  recompensasEscuchar();
  estadosEscuchar();
  combateEscuchar();
  botinLootEscuchar();
  intercambioIniciar();   // 🤝 ofrecer a otro personaje y 📦 el baúl común (comun/intercambio.js)
  if(typeof PPT !== 'undefined') PPT.iniciar();   // ✊ piedra, papel o tijera (adentro del mapa no: lo muestra el mapa)
  cargarSkillsSubidas().then(() => renderList('habilidades')).catch(() => {});   // avisos de 🔔 versión nueva
  cargarPasivasSubidas();
  cargarItemsSubidos();   // ítems que subió el grupo (catálogo compartido, paso 5)
  let id = location.hash.slice(1);
  if(!id){ try{ id = localStorage.getItem('ficha-actual-' + FB_CAMPANA) || ''; }catch(e){} }
  if(id && await fichaAbrir(id)) return;
  fichaRecordar('');
  fichaEstadoAlDia();
  abrirPersonajes();
}

