// js/14-modo-botonera.js — tramo 14 de 14 del script de ficha.html (paso 5, nivel A: mismo código, en el mismo orden).
/* ---------- Modo botonera (dentro del mapa) ----------
   El mapa abre esta ficha en un iframe con ?modo=botonera: al cargar el
   personaje se abre la Botonera; cuando se cierran todas las ventanitas
   se le avisa al mapa para que oculte el iframe, y el mapa puede pedir
   que se vuelva a abrir sin recargar. */
const MODO_BOTONERA = document.documentElement.classList.contains('modo-botonera');
// ?inv=<id> (o el mensaje 'abrir-botonera' con inv): abre la Botonera de
// esa invocación en vez de la propia — el mapa la pide igual que pide las
// Acciones de un creep, pero acá vive adentro de la ficha de su dueño.
let modoBotoneraInv = new URLSearchParams(location.search).get('inv') || '';

function botoneraAvisarMapa(tipo, extra){ MensajesMapa.alMapa(tipo, extra); }   // la lista de mensajes: comun/mensajes-mapa.js

function botoneraModoAbrir(invId){
  const destino = invId !== undefined ? invId : modoBotoneraInv;
  if(destino){
    if(!S.invocaciones.some(x => x.id === destino)){
      toast('Esa invocación ya no está');
      modoBotoneraInv = '';
      botoneraAvisarMapa('botonera-cerrada');
      return;
    }
    modoBotoneraInv = destino;
    abrirBotoneraInv(destino);
  }else{
    modoBotoneraInv = '';
    renderBotonera();
    $('#scrim-botonera').classList.add('open');
  }
  botoneraAvisarMapa('botonera-lista');
}

if(MODO_BOTONERA){
  const revisarCerrada = () => {
    // El cartelito de cantidades de un estado (comun/estado-preguntas.js, #ep-fondo) cuenta como ventana abierta: si no, al elegir un preset se cerraba la Botonera.
    if(fichaVivo && fichaVivo.cargada && !document.querySelector('.scrim.open, #ep-fondo, #ae-fondo, #adh-fondo, #duelo-fondo')){
      if(fichaVivo.editaGM) fichaGuardarTick(true);   // el GM editó estados de otro personaje: se sube antes de cerrar
      botoneraAvisarMapa('botonera-cerrada');
    }
  };
  // B (la misma tecla que la abre desde el mapa): cierra la Botonera. Se hace
  // como Escape, que ya cierra todas las ventanitas; no anda mientras se escribe.
  document.addEventListener('keydown', e => {
    if(e.key !== 'b' && e.key !== 'B' && e.key !== 'f' && e.key !== 'F') return;   // B o F (las teclas que abren la Botonera y la ficha) también la cierran
    if(e.ctrlKey || e.altKey || e.metaKey || e.isTrusted === false) return;
    if(e.target && e.target.closest && e.target.closest('input,select,textarea,[contenteditable]')) return;
    e.preventDefault();
    if(e.key === 'f' || e.key === 'F'){   // F abre y cierra la ficha: cierra el menú y cualquier ventana que esté abierta encima, de una
      document.querySelectorAll('.scrim.open').forEach(x => x.classList.remove('open'));
      setTimeout(revisarCerrada, 60);
      return;
    }
    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true}));
  });
  const observador = new MutationObserver(revisarCerrada);
  document.querySelectorAll('.scrim').forEach(el => observador.observe(el, {attributes: true, attributeFilter: ['class']}));
  window.addEventListener('ep-cerrado', () => setTimeout(revisarCerrada, 60));   // se cerró el cartelito de cantidades de un estado
  window.addEventListener('message', e => {
    if(e.origin !== location.origin || !e.data) return;
    if(e.data.tipo === 'abrir-botonera' && fichaVivo && fichaVivo.cargada) botoneraModoAbrir(e.data.inv || '');
    if(e.data.tipo === 'abrir-equipo' && fichaVivo && fichaVivo.cargada) equipoModoAbrir();
    // ⚗ La Botonera nueva del mapa (paso 4, etapa 3b) la dibuja el mapa; sus botones, por ahora, los hace la ficha: se busca el
    // mismo botón en la Botonera de acá (dibujada al día, aunque no esté abierta) y se toca, como si se hubiera tocado acá. Lo
    // que cambie se sube enseguida, así el mapa lo muestra sin esperar.
    if(e.data.tipo === 'botonera-delegar' && fichaVivo && fichaVivo.cargada){
      // Con `inv` (paso 4, etapa 4e, tanda 2): el botón es de la Botonera de esa invocación, que dibuja el mapa.
      const invId = e.data.inv || '';
      if(invId){ botoneraInvId = invId; renderBotoneraInv(); } else renderBotonera();
      const d = e.data.datos || {};
      const sel = Object.keys(d).map(k => `[data-${k.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}="${CSS.escape(String(d[k]))}"]`).join('');
      const b = sel ? document.querySelector((invId ? '#botonerainv-body ' : '#botonera-body ') + sel) : null;
      if(b) b.click(); else toast('No se encontró ese botón en la Botonera de la ficha');
      setTimeout(() => fichaGuardarTick(true), 300);
    }
    // El "Editar" del Ver de la Botonera nueva (paso 4, etapa 3c-6): el Ver lo muestra el mapa, el editor sigue siendo el de la
    // ficha — el mismo botón Editar de su Ver (con "Editar y subir" si es de otro).
    if(e.data.tipo === 'editar-en-ficha' && fichaVivo && fichaVivo.cargada){
      if((S[e.data.key] || []).some(x => x.id === e.data.id)){ viewing = {key: e.data.key, id: e.data.id}; $('#view-edit-btn').click(); }
      else toast('No se encontró eso en la ficha');
    }
    if(e.data.tipo === 'abrir-reroll' && fichaVivo && fichaVivo.cargada) abrirReroll();   // el 🪙 fijo del mapa
    if(e.data.tipo === 'abrir-ficha-mapa' && fichaVivo && fichaVivo.cargada) fichaMapaAbrir();   // el 📜 del token propio (o la tecla F)
    if(e.data.tipo === 'abrir-stats' && fichaVivo && fichaVivo.cargada){   // 📊 de la ficha lite del mapa (2026-10-02)
      document.querySelectorAll('.scrim.open').forEach(x => x.classList.remove('open'));
      modoBotoneraInv = '';
      renderAttrs();
      $('#scrim-stats-mapa').classList.add('open');
      botoneraAvisarMapa('botonera-lista');
    }
    if(e.data.tipo === 'abrir-revivir' && fichaVivo && fichaVivo.cargada){   // el botón ✚ Revivir del mapa
      document.querySelectorAll('.scrim.open').forEach(x => x.classList.remove('open'));
      $('#btn-revivir').click();
      botoneraAvisarMapa('botonera-lista');
    }
    if(e.data.tipo === 'abrir-botin' && fichaVivo && fichaVivo.cargada) botinModoAbrir();
    if(e.data.tipo === 'abrir-tienda' && fichaVivo && fichaVivo.cargada){   // 🏪 del mapa
      document.querySelectorAll('.scrim.open').forEach(s => s.classList.remove('open'));
      abrirVendedor().then(() => botoneraAvisarMapa($('#scrim-catalogo').classList.contains('open') ? 'botonera-lista' : 'botonera-cerrada'));
    }
    // Escape apretado en el mapa: se hace como si se apretara acá.
    if(e.data.tipo === 'tecla-f'){ document.querySelectorAll('.scrim.open').forEach(x => x.classList.remove('open')); setTimeout(revisarCerrada, 60); }   // F desde el mapa: cierra todo
    if(e.data.tipo === 'tecla-escape') document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true}));
    // El mapa pide agregar un estado: se abre el mismo selector que "+ Estado"
    // (el de la invocación que traiga el mensaje, o el propio si no trae ninguna).
    if(e.data.tipo === 'abrir-estados' && fichaVivo && fichaVivo.cargada){
      fichaEditarComoGMSilencioso();   // el GM puede agregar/editar estados de cualquier personaje
      document.querySelectorAll('.scrim.open').forEach(s => s.classList.remove('open'));   // sin la Botonera abierta debajo: al terminar, la ventana se cierra sola
      const inv = e.data.inv || '';
      modoBotoneraInv = inv;
      if(inv) abrirPresetsEfectoInv(inv);
      else abrirPresetsEfecto('directo');
      botoneraAvisarMapa('botonera-lista');
    }
    // El ⚙ de un estado en el mapa: se abre su editor (se busca por nombre).
    // Las invocaciones no tienen editor de estado individual — se maneja
    // desde su propia Botonera (quitarlo con ×), así que solo se reabre.
    if(e.data.tipo === 'editar-estado' && fichaVivo && fichaVivo.cargada){
      fichaEditarComoGMSilencioso();
      document.querySelectorAll('.scrim.open').forEach(s => s.classList.remove('open'));
      const inv = e.data.inv || '';
      modoBotoneraInv = inv;
      if(inv){ abrirBotoneraInv(inv); botoneraAvisarMapa('botonera-lista'); return; }
      const ef = (S.efectos || []).find(x => x && x.activo !== false && x.nombre === e.data.nombre);
      if(!ef){ toast('No encontré ese estado en la ficha'); botoneraAvisarMapa('botonera-cerrada'); return; }
      openEditor('efectos', ef.id);
      botoneraAvisarMapa('botonera-lista');
    }
  });
}

/* ---------- Mantenimiento del GM ----------
   El GM toca Mantenimiento en el mapa: sube campanas/<partida>/mapa/
   mantenimiento.numero. Cada ficha (la del dueño, abierta o corriendo en
   segundo plano desde el mapa) aplica su mantenimiento() una vez por cada
   número que le falte. fichas/<id>/partes/mantenimiento guarda el último
   número aplicado y se toma en una transacción: si hay varias pestañas,
   solo una lo aplica. Una ficha que nunca registró número arranca desde el
   actual (no se le aplican los mantenimientos de antes). */
const MODO_MANTENIMIENTO = document.documentElement.classList.contains('modo-mantenimiento');
const MANTENIMIENTO_MAX_SEGUIDOS = 10;
let mantenimientoSenal = null;     // número actual del GM (null = todavía no se sabe)
let mantenimientoRevisando = false;
let mantenimientoOtraVez = false;

function mantenimientoEscuchar(){
  fbDb.doc(fbRutaCampana('mapa/mantenimiento')).onSnapshot(doc => {
    mantenimientoSenal = doc.exists ? Math.round(num(doc.data().numero)) : 0;
    mantenimientoRevisar();
  }, err => console.error('Error escuchando el mantenimiento del GM:', err));
}

// Modo del mapa (narrativo/combate, lo cambia el GM): la Botonera reordena
// las habilidades sociales según esto — arriba de todo en narrativo, al
// final (con el resto de las habilidades) en combate. 'combate' por
// defecto hasta que se sepa el modo real (ver vtt-hexgrid/CLAUDE.md).
let modoMapa = 'combate';
let modoMapaListo = false;   // ya se leyó el modo real (para cobrar No2 solo con el modo confirmado)
function modoMapaEscuchar(){
  fbDb.doc(fbRutaCampana('mapa/modo')).onSnapshot(doc => {
    modoMapaListo = true;
    modoMapa = (doc.exists && doc.data().modo === 'narrativo') ? 'narrativo' : 'combate';
    renderBotoneraSiAbierta();
  }, err => console.error('Error escuchando el modo del mapa:', err));
}

async function mantenimientoRevisar(){
  const f = fichaVivo;
  if(mantenimientoSenal === null || !f || !f.cargada || f.soloLectura || f.editaGM) return;   // el GM editando no aplica el mantenimiento del personaje: lo hace su dueño
  if(mantenimientoRevisando){ mantenimientoOtraVez = true; return; }
  mantenimientoRevisando = true;
  try{
    const objetivo = mantenimientoSenal;
    const ref = fbDb.doc(fbRutaCampana(`fichas/${f.id}/partes/mantenimiento`));
    const veces = await fbDb.runTransaction(async tx => {
      const doc = await tx.get(ref);
      let hecho = null;
      if(doc.exists){ try{ hecho = Math.round(num(JSON.parse(doc.data().json))); }catch(e){} }
      if(hecho !== null && hecho >= objetivo) return 0;
      tx.set(ref, {json: JSON.stringify(objetivo), actualizado: firebase.firestore.FieldValue.serverTimestamp()});
      return hecho === null ? 0 : Math.min(MANTENIMIENTO_MAX_SEGUIDOS, objetivo - hecho);
    });
    if(fichaVivo !== f) return;
    for(let i = 0; i < veces; i++) mantenimiento();
    if(veces) toast(veces > 1 ? `Mantenimiento del GM: pasaron ${veces} turnos` : 'Mantenimiento del GM: pasó el turno');
    if(MODO_MANTENIMIENTO) mantenimientoAvisarMapaCuandoGuarde();
  }catch(err){
    console.error('No se pudo aplicar el mantenimiento del GM:', err);
    if(MODO_MANTENIMIENTO) botoneraAvisarMapa('mantenimiento-listo');
  }finally{
    mantenimientoRevisando = false;
    if(mantenimientoOtraVez){ mantenimientoOtraVez = false; mantenimientoRevisar(); }
  }
}

// En segundo plano (iframe del mapa): avisa cuando ya guardó todo, así el
// mapa cierra el iframe.
function mantenimientoAvisarMapaCuandoGuarde(){
  const inicio = Date.now();
  const revisar = () => {
    const f = fichaVivo;
    const pendiente = f && (f.escribiendo || Object.keys(f.sucias).length);
    if(pendiente && Date.now() - inicio < 20000){
      fichaGuardarTick(true);
      setTimeout(revisar, 400);
      return;
    }
    botoneraAvisarMapa('mantenimiento-listo');
  };
  setTimeout(revisar, 300);
}

// Arranque de la pantalla (paso 5): antes estaba al final del tramo de combate (js/11), pero renderAll() usa funciones de los
// archivos siguientes; acá ya está todo cargado. Va antes de entrar a la partida, como antes.
renderAll();
aplicarColapsados();
mesaIniciar(fbAlEntrar);
