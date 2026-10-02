// js/12-modo-acciones.js — tramo 12 de 12 del script de gm-tools.html (paso 5, nivel A: mismo código, en el mismo orden).
/* ---------- Modo acciones (dentro del mapa) ----------
   El mapa del GM abre gm-tools en un iframe con ?modo=acciones&creep=<id>:
   al cargar los creeps se abre la ventana de Acciones de ese creep; cuando
   se cierran todas las ventanitas se le avisa al mapa para que oculte el
   iframe, y el mapa puede pedir abrir las de otro creep sin recargar. Lo
   que se haga se guarda solo, como siempre. */
const MODO_ACCIONES = document.documentElement.classList.contains('modo-acciones');

function estadosModoAbrir(creepId){
  if(!S.creeps.some(sc => sc.id === creepId)){
    toast('Ese creep ya no está en gm-tools');
    gmAvisarMapa('acciones-cerrada');
    return;
  }
  abrirPresetsEstadoCreep(creepId);
  gmAvisarMapa('acciones-lista');
}

// Lo que el duelo necesita de esta página (comun/duelo.js): si el lado del duelo es uno de estos creeps, y sus tiradas. Los ganchos
// viven en comun/creep-duelo.js (paso 4 etapa 4c, 2026-10-01: los usa también el mapa); acá, cómo se lee, se cambia y se publica
// un creep de GM Tools (en memoria: renderAll lo guarda solo).
const gmDueloUi = {
  creep: ref => S.creeps.find(c => c.id === ref) || null,
  cambiar: (ref, fn) => {
    const sc = S.creeps.find(c => c.id === ref);
    if(!sc) return Promise.resolve(null);
    const x = fn(sc);
    if(x && x.error){ toast(x.error); return Promise.resolve(null); }
    renderAll();
    return Promise.resolve(x);
  },
  publicar: (sc, t) => publicarTiradaCreep(t),
  toast: t => toast(t),
  confirmar: t => confirm(t),
  soy: lado => !!(lado && lado.tipo === 'creep' && gmVivo.activo && S.creeps.some(c => c.id === lado.ref)),
  borrarParry: ref => parryPendienteCreep.delete(ref),
};
window.DUELO_HOOKS = CreepDuelo.hooks(gmDueloUi);

// La ficha del creep (la ventana «Editar creep» de GM Tools, editable) dentro del mapa: el 📜 del token de un creep o la tecla F, solo para el GM.
function accionesModoVer(creepId){
  if(!S.creeps.some(sc => sc.id === creepId)){
    toast('Ese creep ya no está en gm-tools');
    gmAvisarMapa('acciones-cerrada');
    return;
  }
  document.querySelectorAll('.scrim.open').forEach(x => x.classList.remove('open'));
  abrirEditarCreep(creepId);   // la ficha editable del creep (stats, equipo, habilidades en lista con descripción y Ejecutar); F o el 📜 del token la abren en el mapa
  gmAvisarMapa('acciones-lista');
}

function accionesModoAbrir(creepId){
  if(!S.creeps.some(sc => sc.id === creepId)){
    toast('Ese creep ya no está en gm-tools');
    gmAvisarMapa('acciones-cerrada');
    return;
  }
  abrirAccionesCreep(creepId);
  gmAvisarMapa('acciones-lista');
}

if(MODO_ACCIONES){
  // B (la tecla que abre las Acciones desde el mapa) también las cierra, con el foco adentro de esta ventana: se hace como Escape.
  document.addEventListener('keydown', e => {
    if(e.key !== 'b' && e.key !== 'B' && e.key !== 'f' && e.key !== 'F') return;   // B o F también las cierran
    if(e.ctrlKey || e.altKey || e.metaKey || e.isTrusted === false) return;
    if(e.target && e.target.closest && e.target.closest('input,select,textarea,[contenteditable]')) return;
    e.preventDefault();
    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true}));
  });
  const observador = new MutationObserver(() => {
    if(gmVivo.listo && !document.querySelector('.scrim.open, #ep-fondo, #ae-fondo, #at-fondo, #adh-fondo, .pap-fondo, #duelo-fondo')) gmAvisarMapa('acciones-cerrada');   // #ep-fondo: cartelito de cantidades de un estado
  });
  document.querySelectorAll('.scrim').forEach(el => observador.observe(el, {attributes: true, attributeFilter: ['class']}));
  window.addEventListener('message', e => {
    if(e.origin !== location.origin || !e.data) return;
    if(e.data.tipo === 'abrir-acciones' && gmVivo.listo) accionesModoAbrir(e.data.creep);
    if(e.data.tipo === 'abrir-ver-creep' && gmVivo.listo) accionesModoVer(e.data.creep);   // el 📜 del token de un creep
    // ⚗ Las Acciones nuevas del mapa (paso 4, etapa 4b) las dibuja el mapa; sus botones, por ahora, los hace GM Tools: se dibujan
    // las Acciones de ese creep (aunque no estén abiertas) y se toca el mismo botón, como si se hubiera tocado acá. Lo que cambie
    // se sube enseguida, así el mapa lo muestra sin esperar.
    if(e.data.tipo === 'acciones-delegar' && gmVivo.listo){
      if(S.creeps.some(sc => sc.id === e.data.creep)){
        accionesCreepId = e.data.creep;
        renderAccionesCreep();
        const d = e.data.datos || {};
        const sel = Object.keys(d).map(k => `[data-${k.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}="${CSS.escape(String(d[k]))}"]`).join('');
        const b = sel ? document.querySelector('#acciones-creep-lista ' + sel) : null;
        if(b) b.click(); else toast('No se encontró ese botón en las Acciones de GM Tools');
        // El Ver de una habilidad lo muestra el mapa; Editar, Subir y Reemplazar los hace GM Tools (paso 4c, tanda 6).
        if(b && ['verhab-editar', 'verhab-subir', 'verhab-reemplazar'].includes(e.data.boton)) $('#' + e.data.boton).click();
        setTimeout(() => gmGuardarTick(true), 300);
      }else toast('Ese creep ya no está en gm-tools');
    }
    // Escape apretado en el mapa: se hace como si se apretara acá.
    if(e.data.tipo === 'tecla-f') document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true}));
    if(e.data.tipo === 'tecla-escape') document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true}));
    // El mapa pide agregar un estado a un creep: mismo selector que "+ Estado".
    if(e.data.tipo === 'abrir-estados' && gmVivo.listo) estadosModoAbrir(e.data.creep);
    // El ⚙ de un estado en el mapa: se abre su editor (se busca por nombre).
    if(e.data.tipo === 'editar-estado' && gmVivo.listo){
      const sc = S.creeps.find(x => x.id === e.data.creep);
      const es = sc && (sc.estados || []).find(x => x && x.nombre === e.data.nombre);
      if(!es){ toast('No encontré ese estado en el creep'); gmAvisarMapa('acciones-cerrada'); return; }
      abrirEditorEstadoCreep(sc.id, es.id);
      gmAvisarMapa('acciones-lista');
    }
  });
}

async function gmMantenimientoRevisar(){
  const g = gmVivo;
  if(gmMantenimientoSenal === null || !g.activo || !g.listo) return;
  if(gmMantenimientoRevisando){ gmMantenimientoOtraVez = true; return; }
  gmMantenimientoRevisando = true;
  try{
    const objetivo = gmMantenimientoSenal;
    const veces = await CreepAcciones.reclamarMantenimiento(fbDb, fbDb.doc(fbRutaCampana('gm/mantenimiento')), objetivo,
      () => firebase.firestore.FieldValue.serverTimestamp());   // comun/creep-acciones.js
    for(let i = 0; i < veces; i++) mantenimiento();
    if(MODO_MANTENIMIENTO){
      // En segundo plano (iframe del mapa): avisar cuando los creeps ya se guardaron.
      const inicio = Date.now();
      const revisar = () => {
        if(gmHayPendiente() && Date.now() - inicio < 20000){ gmGuardarTick(true); setTimeout(revisar, 400); return; }
        gmAvisarMapa('mantenimiento-listo');
      };
      setTimeout(revisar, 300);
    }
  }catch(err){
    console.error('No se pudo aplicar el mantenimiento a los creeps:', err);
    if(MODO_MANTENIMIENTO) gmAvisarMapa('mantenimiento-listo');
  }finally{
    gmMantenimientoRevisando = false;
    if(gmMantenimientoOtraVez){ gmMantenimientoOtraVez = false; gmMantenimientoRevisar(); }
  }
}

// 📜 Historial (comun/historial.js): cada segundo se le pasa la lista de creeps para que anote cambios de HP y de estados.
setInterval(() => {
  if(typeof historialObservarCreeps !== 'function' || !gmVivo || !gmVivo.listo || !fbMiembro || !fbMiembro.gm || window.parent !== window) return;
  historialObservarCreeps(creepsReales().map(sc => ({id: sc.id, nombre: sc.nombre, hp: sc.hp, estados: (sc.estados || []).filter(e => e && e.activo !== false).map(e => ({nombre: e.nombre, turnos: num(e.turnos)}))})));
}, 1000);

mesaIniciar(gmAlEntrar);
