// js/04-mantenimiento-e-iniciativa.js — tramo 4 de 14 del script de mapa.html (paso 5, nivel A: mismo código, en el mismo orden): Mantenimiento del GM, lista de personajes, tablero de iniciativa.
/* ---------- Mantenimiento del GM ----------
   El GM toca "⟳ Mantenimiento": sube campanas/<partida>/mapa/mantenimiento.
   numero. Cada ficha y gm-tools aplican su propio mantenimiento (con la
   lógica de siempre) una sola vez por número, aunque estén cerradas: se
   ponen al día al abrirse. Además, para que se note enseguida, cada mapa
   corre en segundo plano (iframe oculto, uno por vez) las fichas de su
   dueño y, en el del GM, gm-tools. Si alguna ya lo aplicó, no pasa nada. */
let mantenimientoNumero = null;
const mantenimientoCola = [];
let mantenimientoMarco = null;

function escucharMantenimiento(){
  fbDb.doc(fbRutaCampana('mapa/mantenimiento')).onSnapshot(doc => {
    const numero = doc.exists ? Math.round(num(doc.data().numero)) : 0;
    const antes = mantenimientoNumero;
    mantenimientoNumero = numero;
    elementosVencidosBarrer();   // pasó el turno: las formas con turnos que se acabaron se eliminan
    giroLibre.clear();   // pasó el turno: se acaba el giro gratis
    pedirDibujo();   // las marcas del sigilo duran por turnos
    if(antes === null || numero <= antes || doc.metadata.hasPendingWrites) return;
    toast(`⟳ Mantenimiento: pasó el turno`);
    // (🔥 el terreno incendiado va por las zonas desde el 2026-11-25, P295: zonaRevisarMantenimiento, js/08)
    trampasDisparadasBarrer();   // las trampas ya detonadas (rojas) desaparecen
    zonaRevisarMantenimiento();   // zonas persistentes: a quien le falte algo, le aparece el cartelito
    // Los creeps (solo el GM): desde el 2026-10-02 (A2b) el pase de turno lo hace el mapa (js/12, mantenimientoCreeps), sin cargar GM
    // Tools en un marco invisible.
    if(soyGM) mantenimientoCreeps(numero);
    if(soyGM && typeof tunelMantenimiento === 'function') tunelMantenimiento();   // 🕳 sin orden de turnos, la estela del túnel se va con la ronda (js/46)
    // Los personajes que maneja este usuario (los suyos, o los que el GM controla con 🎮): desde el 2026-10-02 (hoja de ruta A2) el
    // pase de turno lo hace el mapa él mismo (js/11, mantenimientoPersonajes), sin cargar la ficha en un marco invisible.
    mantenimientoPersonajes(numero);
  }, err => console.error('Error escuchando el mantenimiento:', err));
}

function mantenimientoEncolar(url){
  if(!mantenimientoCola.includes(url)) mantenimientoCola.push(url);
  mantenimientoSiguiente();
}

function mantenimientoSiguiente(){
  if(mantenimientoMarco || !mantenimientoCola.length) return;
  const marco = document.createElement('iframe');
  marco.title = 'Mantenimiento en segundo plano';
  marco.style.cssText = 'position:absolute;width:1px;height:1px;border:0;left:-9999px;top:0;visibility:hidden';
  marco.src = sinCache(mantenimientoCola.shift());
  mantenimientoMarco = marco;
  // Por si la herramienta nunca avisa (sin conexión, etc.), se cierra sola.
  marco.cierre = setTimeout(mantenimientoCerrarMarco, 45000);
  document.body.appendChild(marco);
}

function mantenimientoCerrarMarco(){
  if(!mantenimientoMarco) return;
  clearTimeout(mantenimientoMarco.cierre);
  mantenimientoMarco.remove();
  mantenimientoMarco = null;
  mantenimientoSiguiente();
}

window.addEventListener('message', e => {
  if(e.origin !== location.origin || !e.data || !mantenimientoMarco || e.source !== mantenimientoMarco.contentWindow) return;
  if(e.data.tipo === 'mantenimiento-listo') mantenimientoCerrarMarco();
});

// Línea en la Mesa para todos cuando alguien cambia a mano un valor del
// orden de turnos (el GM en cualquiera, cada jugador en el propio): algo
// se lo cambió a mitad de combate y conviene que quede anotado.
async function publicarCambioIniciativa(id, antes, ahora){
  const t = tokens.get(id);
  const nombre = t ? nombreDe(t) : '(token borrado)';
  try{
    await fbDb.collection(fbRutaCampana('tiradas')).add({
      uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: '',
      origen: `Orden de turnos · ${nombre}: ${fmt(antes)} → ${fmt(ahora)}`,
      formula: '', rolls: [], mod: 0, total: ahora,
      // 'recordatorio': la misma línea con 🔔 que ya usan otros avisos del
      // sistema, para no mostrar una fórmula/tirada vacía.
      desde: 'recordatorio', cuando: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }catch(err){ console.error('No se pudo anunciar el cambio de iniciativa en la Mesa:', err); }
}

// Línea en la Mesa para todos: "Mantenimiento · Turno N".
async function publicarPaseDeTurno(turno, titulo){
  try{
    await fbDb.collection(fbRutaCampana('tiradas')).add({
      uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: '',
      origen: titulo ? `${titulo} · Mantenimiento de la ronda` : `Mantenimiento · Turno ${turno}`, formula: '', rolls: [], mod: 0, total: turno,
      desde: 'mantenimiento', cuando: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }catch(err){ console.error('No se pudo anunciar el pase de turno en la Mesa:', err); }
}

/* ---------- Personajes de la partida: quién está inactivo y borrar uno (el GM) ----------
   La lista vive en el panel «👥 Personajes y tokens» del borde izquierdo (js/13, renderTokensMenu; 2026-11-22: antes era el 👥 de la cabecera). */
let personajesInactivos = new Set();   // 💤 (CombateFin.fuera, gm/personajes: solo el GM)
async function personajesInactivosLeer(){
  if(!soyGM) return;
  try{ await cargarPiezas(VG_PIEZAS); personajesInactivos = new Set(await CombateFin.fuera()); }catch(err){ console.error('No se pudo leer quién está inactivo:', err); }
  renderTokensMenu(true);
}

// Mismo criterio que "Borrar personaje" de la ficha (confirmar + escribir el
// nombre), pero acá el GM puede borrar la de cualquier jugador; de paso saca
// los tokens que la usan (el suyo y los de sus invocaciones).
async function borrarPersonajeGM(id, nombre, boton){
  const aviso = `Esto borra a ${nombre} de la partida, para todos, y no se puede deshacer.\n\n` +
                `Si el jugador lo quiere conservar, avisale antes (podés bajar un respaldo con "💾 Respaldo partida" desde gm-tools).\n\n¿Seguís?`;
  if(!(await Confirmar.preguntar(aviso, {titulo: 'Borrar', si: 'Borrar', peligro: true}))) return;
  const escrito = await Confirmar.texto(`Para confirmar el borrado, escribí el nombre tal cual: ${nombre}`, {titulo: 'Borrar', icono: '🗑', si: 'Borrar', max: 80});
  if(escrito === null) return;
  if(escrito.replace(/\s+/g, ' ').trim().toLowerCase() !== nombre.replace(/\s+/g, ' ').trim().toLowerCase()){   // (2026-11-18: un nombre con dos espacios seguidos no se podía escribir igual: la pantalla los muestra como uno)
    toast('El nombre no coincide — no se borró nada');
    return;
  }
  boton.disabled = true;
  try{
    const base = fbDb.doc(fbRutaCampana(`fichas/${id}`));
    const [partes, tokensSnap] = await Promise.all([
      base.collection('partes').get(),
      fbDb.collection(fbRutaCampana('tokens')).where('tipo', '==', 'pj').get(),
    ]);
    const lote = fbDb.batch();
    partes.docs.forEach(d => lote.delete(d.ref));
    tokensSnap.docs
      .filter(t => { const v = t.data().fichaId || ''; return v === id || v.startsWith(id + '~'); })
      .forEach(t => lote.delete(t.ref));
    lote.delete(base);
    await lote.commit();
    fichasPub.delete(id);
    toast(`${nombre} borrado de la partida`);
    renderTokensMenu();
    renderPanel();
    pedirDibujo();
  }catch(err){
    console.error('No se pudo borrar el personaje:', err);
    toast('No se pudo borrar el personaje — revisá la consola');
    boton.disabled = false;
  }
}

// ⟳ Mantenimiento (el GM): fuera de combate lo pasa a mano; con orden de turnos lo pasa solo el cambio de ronda (P161). `titulo`: lo que se
// anuncia en la Mesa (sin él, «Mantenimiento · Turno N»).
async function pasarMantenimiento(titulo){
  const ref = fbDb.doc(fbRutaCampana('mapa/mantenimiento'));
  // El turno que se anuncia es el de gm-tools (gm/estado) más uno.
  const res = await fbDb.runTransaction(async tx => {
    const [doc, estado] = await Promise.all([tx.get(ref), tx.get(fbDb.doc(fbRutaCampana('gm/estado')))]);
    const numero = (doc.exists ? Math.round(num(doc.data().numero)) : 0) + 1;
    tx.set(ref, {numero, cuando: firebase.firestore.FieldValue.serverTimestamp()});
    return {turno: (estado.exists ? Math.round(num(estado.data().turno)) : 0) + 1, numero};
  });
  publicarPaseDeTurno(res.turno, titulo);
  return res.numero;   // el número del Mantenimiento nuevo (lo usa zonasDelQueLaTiro, js/07)
}
// «⟳ Pasar de ronda» (2026-10-12, dueño; antes «⟳ Mantenimiento»): en combate con la lista de turnos armada no aparece (la ronda la pasa sola
// ▶ Siguiente al dar la vuelta, y apretarlo además le contaba un turno de más a los que no están en la lista). Afuera, es como corre el tiempo.
function mantBotonActualizar(){
  const b = $('#btn-mantenimiento');
  if(!b) return;
  const conOrden = modoMapa === 'combate' && iniciativa && Array.isArray(iniciativa.orden) && iniciativa.orden.length > 0;
  b.hidden = conOrden;
}
$('#btn-mantenimiento').onclick = async () => {
  if(!soyGM) return;
  const btn = $('#btn-mantenimiento');
  btn.disabled = true;
  try{ await pasarMantenimiento(); }
  catch(err){
    console.error('No se pudo pasar el turno:', err);
    toast(err.code === 'permission-denied' ? 'Solo el GM puede pasar el turno' : 'No se pudo pasar el turno — mirá la consola');
  }finally{
    btn.disabled = false;
  }
};

/* ---------- Tablero de iniciativa (orden de turnos) ----------
   campanas/<partida>/mapa/iniciativa = {orden: [{id, valor, oculto?}], turno, ronda}.
   Lo arma y lo cambia el GM (las reglas solo lo dejan escribir a él); todos
   lo ven. Se muestra solo en modo combate, flotante sobre el mapa y
   plegable, como el "Turn Order" de Roll20. */

let iniciativa = {orden: [], turno: 0, ronda: 1, paso: 0, termino: null, actuaron: [], libre: null, empezados: [], demoras: {}, repite: null, ordenPendientes: [], ordenUsados: null, mufas: {}, movidos: {}};
/* Turno libre (`libre: {id, vuelve}`, dueño 2026-10-15): el GM le dio el turno a alguien «de manera libre, sin contabilizar el paso del turno»
   (clic derecho en su nombre → Turno libre). Mientras dura, el turno es suyo (esSuTurno), pero no recargó ni bajó nada; con ▶ Siguiente el
   turno vuelve a `vuelve` (quien lo tenía), también sin recargar ni bajar nada. Ver iniciativaDarTurno. */
/* Quién ya jugó en esta ronda (`actuaron`, 2026-10-10, regla del dueño con Degollar): un token al que algo lo mueve más abajo en el orden
   después de haber jugado (Degollar lo manda al final, o el GM lo baja con ▼) no vuelve a jugar en la misma ronda: ▶ Siguiente lo saltea.
   Se vacía al empezar una ronda nueva. */
/* Demorar el turno (2026-10-29, dueño: «si toco la flechita para abajo, el que está abajo y el que toqué intercambian posiciones»; «un cambio de
   posición tiene que mantener a los personajes dentro de la misma ronda, nunca pasar de ronda»). `empezados` = los que bajaron con ▼ en su propio
   turno: su turno ya había empezado (recarga, cooldowns), así que cuando les vuelve a tocar en la ronda no se les aplica de nuevo el inicio (se
   vacía al empezar una ronda nueva). `demoras` = {tokenId: lugares}: la Demora que le llegó a alguien en su propio turno; baja esos lugares
   cuando termina el turno (iniciativaSiguiente). */
// ⚖ `sobre` (2026-11-23, P312): el sobrepeso que ya tiene restado esa fila (valor = tirada − sobre); el GM lo ajusta si cambia en combate (js/132).
const ordenSerial = lista => lista.map(o => ({id: o.id, valor: num(o.valor), ...(o.oculto ? {oculto: true} : {}), ...(typeof o.sobre === 'number' && o.sobre > 0 ? {sobre: o.sobre} : typeof o.sobre === 'number' ? {sobre: 0} : {})}));
// Turno propio (2026-10-06): cada ▶ Siguiente sube `paso` y deja en `termino` de quién fue el turno que terminó; los estados nuevos llevan la
// marca «mapa:paso» del turno en curso (Combatiente.agregarEstado), así uno que te ponen en tu propio turno no se descuenta al terminarlo.
Combatiente.fijarMarcaTurno(() => iniciativa.orden.length ? `${mapaMostrado}:${iniciativa.paso}` : null);
let iniciativaPlegada = false;
try{ iniciativaPlegada = localStorage.getItem('mapa-iniciativa-plegada') === '1'; }catch(e){}

// Aviso de quién actúa (2026-09-25, pedido del dueño): cuando el GM aprieta ▶ Siguiente (o cambia el turno), el token al que le toca
// se rodea unos segundos de un anillo que pulsa y de ondas que se expanden, en la pantalla de TODOS. Respeta lo que cada uno puede
// ver: si ese token está oculto, en sigilo para vos o fuera de tu visión, no se marca (no delata nada).
let iniciativaCargada = false;   // el primer snapshot no anuncia nada (solo es "lo que ya había")
function anunciarTurnoEnMapa(){
  const o = iniciativa.orden[iniciativa.turno];
  if(!o) return;
  const t = tokens.get(o.id);
  if(!t) return;
  if(!soyGM && (t.oculto || o.oculto)) return;
  if(ocultoPorSigiloParaMi(t) || !tokenVisiblePorNiebla(t)) return;
  iniResaltado = {id: o.id, hasta: Date.now() + 5000, turno: true};
  pedirDibujo();
}
function escucharIniciativa(){
  cortarIniciativa = fbDb.doc(fbRutaCampana(rutaMapaEstado('iniciativa'))).onSnapshot(doc => {
    const d = doc.exists ? doc.data() : {};
    const antesTurno = iniciativa.turno, antesRonda = iniciativa.ronda, antesIniciado = iniciativa.iniciado === true;
    iniciativa = {
      orden: (Array.isArray(d.orden) ? d.orden : []).map(o => ({id: String(o.id || ''), valor: num(o.valor), oculto: o.oculto === true, ...(o.sobre !== undefined ? {sobre: Math.max(0, num(o.sobre))} : {})})).filter(o => o.id),
      reubicar: Array.isArray(d.reubicar) ? d.reubicar.map(String) : [],   // ⚖ los que se acomodan al empezar la ronda (js/132, P312)
      finRonda: Array.isArray(d.finRonda) ? d.finRonda.map(String) : [],   // 🐝 los que entraron con su lugar ya pasado: juegan al final de esta ronda (P301 b)
      turno: Math.max(0, Math.round(num(d.turno))),
      ronda: Math.max(1, Math.round(num(d.ronda)) || 1),
      paso: Math.max(0, Math.round(num(d.paso))),
      termino: d.termino && d.termino.id ? {id: String(d.termino.id), paso: Math.round(num(d.termino.paso))} : null,
      actuaron: Array.isArray(d.actuaron) ? d.actuaron.map(String) : [],
      libre: d.libre && d.libre.id ? {id: String(d.libre.id), vuelve: String(d.libre.vuelve || '')} : null,
      empezados: Array.isArray(d.empezados) ? d.empezados.map(String) : [],
      repite: d.repite ? String(d.repite) : null,
      demoras: d.demoras && typeof d.demoras === 'object' ? Object.fromEntries(Object.entries(d.demoras).map(([k, v]) => [k, Math.max(0, Math.round(num(v)))]).filter(([, v]) => v > 0)) : {},
      // 🎺🔄🐈‍⬛ El orden de turnos a favor o en contra (2026-11-05, js/102): lo que queda para la próxima ronda, quién ya tuvo su efecto en esta y las Mufas.
      ordenPendientes: Array.isArray(d.ordenPendientes) ? d.ordenPendientes.filter(x => x && typeof x === 'object').slice(0, 30) : [],
      ordenUsados: d.ordenUsados && typeof d.ordenUsados === 'object' ? {ronda: Math.round(num(d.ordenUsados.ronda)), ids: Array.isArray(d.ordenUsados.ids) ? d.ordenUsados.ids.map(String) : []} : null,
      mufas: d.mufas && typeof d.mufas === 'object' ? d.mufas : {},
      // 💍 Quién se movió en cada ronda (2026-11-20, comun/quieto.js + js/126): {tokenId: [rondas]}. Lo anota la pantalla que mueve al token.
      movidos: d.movidos && typeof d.movidos === 'object' ? d.movidos : {},
      // ▶ Iniciar combate (2026-11-20, comun/orden-turnos.js): se ordenó y falta empezar / ya empezó.
      sacados: Array.isArray(d.sacados) ? d.sacados.map(String).slice(-200) : [],   // ✕ lo que el GM sacó de la tabla: Traer tokens no lo trae (js/136, P328)
      porIniciar: d.porIniciar === true, iniciado: d.iniciado === true ? true : d.iniciado === false ? false : null,   // (null: un orden de antes de este botón)
    };
    const cambioTurno = iniciativa.turno !== antesTurno || iniciativa.ronda !== antesRonda || (iniciativa.iniciado === true && !antesIniciado);   // (iniciar el combate también anuncia de quién es el turno)
    if(cambioTurno) giroLibre.clear();   // avanzó el turno: acción de otro
    renderIniciativa();
    if(iniciativaCargada && cambioTurno && iniciativa.orden.length){ anunciarTurnoEnMapa(); if(typeof soltarAlEmpezarRevisar === 'function') soltarAlEmpezarRevisar(); if(typeof zonasAlEmpezarTurno === 'function') zonasAlEmpezarTurno(); }   // 🔓 js/54 · 🔥 el Muro de fuego (js/08)
    iniciativaCargada = true;
    if(typeof sobrepesoIniRevisar === 'function') sobrepesoIniRevisar();   // ⚖ js/132: ¿alguien cambió de sobrepeso? (el GM acomoda su número)
    if(typeof mareoRevisarLuego === 'function') mareoRevisarLuego();   // 😵 js/135: ¿una mareada salió del orden? (el mareo se va)
  }, err => console.error('Error escuchando la iniciativa:', err));
}

// Además del GM (cualquier fila), cada jugador puede tocar el valor de la
// fila de su propio personaje (algo lo cambió a mitad de combate): las
// reglas dejan escribir mapa/iniciativa a cualquier miembro siempre que
// no toque turno/ronda ni agregue o saque filas — eso sigue siendo del GM.
function puedeEditarIniciativa(t){
  return soyGM || !!(t && t.tipo === 'pj' && fbUsuario && t.duenoUid === fbUsuario.uid);
}

async function guardarIniciativa(cambios){
  const datos = {
    orden: ordenSerial(iniciativa.orden),
    turno: iniciativa.turno,
    actuaron: iniciativa.actuaron || [],
    empezados: iniciativa.empezados || [],
    demoras: iniciativa.demoras || {},
    ronda: iniciativa.ronda,
    paso: iniciativa.paso,
    ...(iniciativa.termino ? {termino: iniciativa.termino} : {}),
    ...(iniciativa.libre ? {libre: iniciativa.libre} : {}),
    ...(iniciativa.repite ? {repite: iniciativa.repite} : {}),
    ordenPendientes: iniciativa.ordenPendientes || [], mufas: iniciativa.mufas || {}, ...(iniciativa.ordenUsados ? {ordenUsados: iniciativa.ordenUsados} : {}),   // (js/102)
    ...(iniciativa.porIniciar ? {porIniciar: true} : {}), ...(typeof iniciativa.iniciado === 'boolean' ? {iniciado: iniciativa.iniciado} : {}),   // ▶ Iniciar combate
    ...((iniciativa.reubicar || []).length ? {reubicar: iniciativa.reubicar} : {}),   // ⚖ js/132
    ...((iniciativa.finRonda || []).length ? {finRonda: iniciativa.finRonda} : {}),   // 🐝 P301 b
    ...((iniciativa.sacados || []).length ? {sacados: iniciativa.sacados} : {}),   // ✕ js/136 (P328)
    ...cambios,
    actualizado: firebase.firestore.FieldValue.serverTimestamp(),
  };
  // 💍 Quién se movió (js/126): se conserva lo de esta ronda y la anterior (con lo que esta pantalla anotó recién); sin orden de turnos, nada.
  if(typeof Quieto !== 'undefined') datos.movidos = Quieto.podar(cambios && cambios.movidos ? cambios.movidos : (typeof quietoMovidos === 'function' ? quietoMovidos() : iniciativa.movidos), datos.ronda, (datos.orden || []).length > 0);
  if(!datos.libre) delete datos.libre;
  if(!datos.repite) delete datos.repite;
  if(!datos.porIniciar) delete datos.porIniciar;
  if(typeof datos.iniciado !== 'boolean') delete datos.iniciado;
  if(!datos.termino) delete datos.termino;
  if(!datos.ordenUsados) delete datos.ordenUsados;
  if(!(Array.isArray(datos.reubicar) && datos.reubicar.length)) delete datos.reubicar;
  if(!(Array.isArray(datos.finRonda) && datos.finRonda.length)) delete datos.finRonda;
  if(!(Array.isArray(datos.sacados) && datos.sacados.length)) delete datos.sacados;
  if(Array.isArray(datos.orden)) datos.orden = ordenSerial(datos.orden);   // (las filas en memoria traen `oculto: false`; ⚖ conserva `sobre`)   // `repite: null` = terminó el turno de más   // `libre: null` en los cambios = se terminó el turno libre
  try{
    await fbDb.doc(fbRutaCampana(rutaMapaEstado('iniciativa'))).set(datos);
    return true;
  }catch(err){
    console.error('No se pudo guardar la iniciativa:', err);
    toast(err.code === 'permission-denied' ? 'No podés cambiar eso del orden de turnos' : 'No se pudo guardar el orden de turnos');
    return false;
  }
}

// De mayor a menor; con el mismo valor queda el orden en que estaban. (💨 Hasta el 2026-11-20 los que tenían Prisa iban primero; desde ese día
// —dueño: «en lugar de que te mande siempre primero a la lista de iniciativas, te dé +5 a la tirada de iniciativa»— la Prisa suma 5 a la tirada y el
// orden lo decide solo el resultado.)
function ordenarIniciativa(lista){
  return lista.map((o, i) => ({o, i})).sort((a, b) => (num(b.o.valor) - num(a.o.valor)) || (a.i - b.i)).map(x => x.o);
}

// 🎲 ¿Ese token ocupa lugar en el orden de turnos? (2026-11-23: la regla es una sola, OrdenTurnos.ocupaLugar — el tótem y el estandarte no). Un
// id que ya no tiene token, sí (se ve «(token borrado)», como siempre).
function iniciativaOcupaLugar(id){ const t = tokens.get(id); return !t || OrdenTurnos.ocupaLugar(t, vinculo(t)); }
// Traer tokens: todos los del mapa que ocupan lugar (los que no, como el tótem o el estandarte, se quedan afuera y, si estaban, salen). Lo que el GM
// sacó con la ✕ tampoco (P328: queda afuera hasta que lo sume con ➕ o se vacíe el orden).
function iniciativaPonerTodos(){
  const previos = new Map(iniciativa.orden.map(o => [o.id, o]));
  const lista = [...tokens.keys()].filter(id => iniciativaOcupaLugar(id) && !OrdenTurnos.sacado(iniciativa, id)).map(id => ({...(previos.get(id) || {}), id, valor: num(previos.get(id) && previos.get(id).valor), oculto: !!(previos.get(id) && previos.get(id).oculto)}));
  guardarIniciativa({orden: ordenSerial(ordenarIniciativa(lista)), turno: 0, actuaron: [], empezados: [], demoras: {}, repite: null, ordenPendientes: [], ordenUsados: null, mufas: {}});   // (`iniciado` se conserva: sumar un token a mitad de combate no vuelve a ofrecer «Iniciar combate»)
}

// Mover a mano una fila del orden de turnos (▲ ▼, solo GM): los dos cambian de lugar y nadie gana ni pierde su turno de la ronda (dueño,
// 2026-10-29). El turno sigue con quien lo tenía, salvo que el que juega baje por debajo de uno que todavía no jugó: ahí se demora (le toca al
// que subió y él juega justo después, iniciativaDemorarTurno). Antes el turno se iba con el que bajaba y el de abajo quedaba como si ya
// hubiera jugado (perdía su turno: «se iba al final de la lista, como si se pasara de ronda»).
// El vecino es el que se VE arriba o abajo en la lista (`iniDisplay`, la lista gira con el turno y los que ya jugaron van abajo de la línea), no el
// del orden guardado: antes ▼ en uno de abajo de la línea lo cambiaba con alguien de otra parte de la lista. No se cruza la línea de la ronda.
let iniDisplay = {ids: [], corte: 0};   // lo arma renderIniciativa: los ids en el orden en que se ven y cuántos van arriba de la línea
async function iniciativaMover(id, delta){
  if(!soyGM) return;
  const vis = iniDisplay.ids, p = vis.indexOf(id), q = p + delta;
  if(p < 0 || q < 0 || q >= vis.length || (p < iniDisplay.corte) !== (q < iniDisplay.corte)) return;
  const orden = iniciativa.orden.slice();
  const i = orden.findIndex(o => o.id === id), j = orden.findIndex(o => o.id === vis[q]);
  if(i < 0 || j < 0) return;
  const turno = iniciativa.turno, activo = orden[turno] ? orden[turno].id : null;
  const ya = new Set(iniciativa.actuaron || []);
  [orden[i], orden[j]] = [orden[j], orden[i]];
  const arriba = Math.min(i, j), sube = orden[arriba];
  if(!iniciativa.libre && activo && arriba === turno && sube.id !== activo && !ya.has(sube.id) && !iniciativaFueraDeJuego(sube.id))
    return iniciativaDemorarTurno(orden, activo, sube.id);
  const nuevo = activo ? Math.max(0, orden.findIndex(o => o.id === activo)) : turno;
  // El que ya jugó (estaba antes del turno) y queda después del que juega sigue contando como que jugó: no le vuelve a tocar.
  iniciativa.orden.forEach((o, k) => { if(k < turno && orden.findIndex(x => x.id === o.id) > nuevo) ya.add(o.id); });
  await guardarIniciativa({orden: ordenSerial(orden), turno: nuevo, actuaron: [...ya]});
}
// 🔁 Le vuelve a tocar a uno que ya jugó esta ronda (lo bajaron después de jugar): ¿vuelve a actuar? Solo el GM (es quien pasa el turno).
async function iniciativaPreguntarRepite(id){
  const t = tokens.get(id), nombre = t ? nombreDe(t) : 'Ese token';
  return Confirmar.preguntar(`${nombre} ya tuvo su turno en esta ronda. ¿Vuelve a actuar?

Si vuelve a actuar, no se le vuelve a contar lo de empezar y terminar el turno (la regeneración, los turnos de los estados, los cooldowns): eso pasa una sola vez por ronda.`,
    {titulo: 'Le vuelve a tocar', icono: '🔁', si: 'Sí, vuelve a actuar', no: 'No, se saltea'});
}
// ⏬ El que tiene el turno baja con ▼: le toca al que subió (empieza su turno) y el demorado juega justo después, sin volver a recargar ni a
// bajar cooldowns (su turno ya había empezado: `empezados`). No termina su turno: lo que pasa al terminar, lo cobra cuando termine de verdad.
async function iniciativaDemorarTurno(orden, demoradoId, sigId){
  const pasoFin = iniciativa.paso, mapaFin = mapaMostrado;
  await inicioTurnoForzar(demoradoId, `${mapaFin}:${pasoFin}`);   // si no había tocado «Aplicar» al empezar, se aplica ahora (su turno ya empezó)
  const empezados = [...new Set([...(iniciativa.empezados || []), demoradoId])];
  if(!await guardarIniciativa({orden: ordenSerial(orden), turno: iniciativa.turno, paso: pasoFin + 1, empezados})) return;
  const publico = id => { const t = tokens.get(id), o = orden.find(x => x.id === id); return !!t && !t.oculto && !(o && o.oculto) && (t.tipo === 'creep' ? creepConocido(t) : !enSigilo(t)); };
  const nomDem = publico(demoradoId) ? nombreDe(tokens.get(demoradoId)) : '', nomSig = publico(sigId) ? nombreDe(tokens.get(sigId)) : '';
  mesaLinea(`⏬ ${nomDem || 'Alguien'} demora su turno: ${nomSig ? `le toca a ${nomSig}` : 'le toca al siguiente'} y ${nomDem ? nomDem + ' juega' : 'juega'} justo después`, 'recordatorio');
  // 🙈 (2026-11-23) Si al que le toca está escondido: su tarjeta, con su nombre, solo para los que lo ven (js/29); a los demás, la de siempre sin él.
  const escSig = escondidoDe(sigId), nomSigV = escSig ? nombreDe(tokens.get(sigId)) : nomSig;
  const linDem = n => `${nomDem || 'Alguien'} demora su turno: juega justo después${n ? ` de ${n}` : ''}.`;
  const tarjeta = momentoAbrir({tipo: 'turno', icono: '⏬', titulo: nomSigV ? `Empieza el turno de ${nomSigV}` : 'Pasa el turno', estado: 'listo',
    datos: {lineas: [linDem(nomSigV)], ...(escSig ? {escondido: escSig} : {})}});
  const lineasZonas = turnoMarcar(await zonasDelQueLaTiro(sigId, null), sigId, escSig);   // P172: sus zonas, un turno menos (js/07)
  const pendiente = await inicioTurnoPendiente(sigId, `${mapaFin}:${pasoFin + 1}`);
  const lineasInicio = !pendiente ? await inicioDeTurno(sigId, `${mapaFin}:${pasoFin + 1}`) : turnoMarcar([], sigId, escSig);
  await turnoTarjetasAbrir(tarjeta, {tokenId: sigId, escondido: escSig}, [lineasZonas, turnoMarcar(lineasInicio, sigId, escSig)],
    {icono: '⏬', titRivales: escSig ? 'Pasa el turno' : '', preRivales: [linDem('')]});
}

// Suma de los modificadores de un stat de un creep (equipo puesto, arma y estados activos): mismo criterio que gm-tools.
function creepModTotalMapa(sc, statId){ return CreepCalculo.modTotal(sc, statId); }   // comun/creep-calculo.js (paso 4 etapa 4a)
// Iniciativa de un creep: Agilidad + lo que la sube (Agilidad o Iniciativa directa). null si todavía no se leyó el creep.
function creepIniMapa(sc){ return sc ? CreepCalculo.statValor(sc, 'ini') : null; }

// 💨 Lo que hace falta para tirar la Iniciativa (2026-11-22): {base (el número que da el dado, sin la Prisa), fijo ({val, de}: lo que se suma al
// resultado)} o null. Creep: tal como está guardado (CreepCalculo ya lee la Prisa vieja como fija). Personaje: lo publicado en su resumen; un resumen
// del 2026-11-20 al 2026-11-22 no dice si su Iniciativa trae el +5 adentro, así que ahí se lee la ficha (FichaGuardado.cargar la pone al día).
function iniciativaDeCreep(sc){ return sc ? {base: CreepCalculo.statValor(sc, 'ini'), fijo: CreepCalculo.iniFijo(sc)} : null; }
// ⚖ `sobre` (2026-11-23, P312): el sobrepeso, que se resta al resultado (del resumen; uno viejo sin `sobre` se lee de la ficha).
async function iniciativaDePj(fichaId){
  const f = fichasPub.get(fichaId), r = f && f.resumen;
  if(!r || r.ini === undefined) return null;
  const fijo = Combatiente.iniFijoDeResumen(r);
  if(fijo && r.sobre !== undefined) return {base: num(r.ini), fijo, sobre: Math.max(0, num(r.sobre))};
  try{
    await cargarPiezas(BN_PIEZAS);   // (FichaGuardado y FichaCalculo no se cargan de entrada: js/11)
    const l = await FichaGuardado.cargar(fbDb, fbRutaCampana(`fichas/${fichaId}`), {mezclarCatalogo: typeof bnMezclarCatalogo === 'function' ? bnMezclarCatalogo : undefined});
    if(l && l.S){ const c = FichaCalculo.calcular(l.S); return {base: num(c.final.ini), fijo: FichaCalculo.iniFijo(l.S, c), sobre: Math.max(0, num(c.sobrecarga))}; }
  }catch(err){ console.error('No se pudo leer la ficha para la Iniciativa:', err); }
  return {base: num(r.ini), fijo: fijo || null, sobre: 0};
}
// 🎲 Tirar iniciativa (2026-09-24, pedido del dueño): un jugador tira la de sus personajes; el GM, la de todos los creeps de la
// lista. El resultado se carga solo junto al nombre (no agrega ni saca filas: los tokens los trae el GM con "Traer tokens").
// La tirada de un jugador queda en la Mesa; las de los creeps no, para no mostrar a los jugadores creeps que no ven (queda un aviso).
async function iniciativaTirar(){
  if(!fbMiembro) return;
  const enLista = new Set(iniciativa.orden.map(o => o.id));
  const propios = [...tokens.entries()].filter(([id, t]) => enLista.has(id) && OrdenTurnos.ocupaLugar(t, vinculo(t)) && (soyGM
    ? t.tipo === 'creep'
    : t.tipo === 'pj' && t.duenoUid === fbUsuario.uid && t.fichaId && !t.fichaId.includes(SEP_INVOCACION)));
  if(!propios.length){
    toast(soyGM ? 'No hay creeps en la lista: tocá "Traer tokens" primero' : 'Tu personaje no está en la lista de turnos: pedile al GM que toque "Traer tokens"');
    return;
  }
  const nuevos = new Map(), sinDato = [];
  for(const [id, t] of propios){
    // 💨 La Prisa (2026-11-22, dueño: «+5 al resultado de la tirada. Fijo»): el dado sale de la Iniciativa SIN la Prisa y el +5 se suma al resultado.
    const dato = t.tipo === 'creep' ? iniciativaDeCreep(creepPrivadoDe(t.fichaId)) : await iniciativaDePj(t.fichaId);
    if(!dato){ sinDato.push(nombreDe(t)); continue; }
    const fo = formulaParaValor(dato.base);
    let r = Combatiente.conIniFijo((fo && tirarDados(fo.formula)) || {formula: '0', rolls: [], mod: 0, total: 0}, dato.fijo);
    // ⚖ El sobrepeso resta a la Iniciativa (2026-11-23, P312): el número de la tabla es la tirada − el sobrepeso, y la fila recuerda cuánto se restó.
    const sobre = t.tipo === 'pj' ? Math.max(0, num(dato.sobre)) : 0;
    if(sobre) r = Combatiente.conSobrepesoIni(r, sobre);
    nuevos.set(id, {valor: r.total, ...(t.tipo === 'pj' ? {sobre} : {})});
    if(!soyGM) mesaPublicar(`Iniciativa · ${nombreDe(t)}`, r);
  }
  if(sinDato.length) toast(soyGM ? `Sin datos de: ${sinDato.join(', ')}` : 'Abrí tu ficha una vez para que se publique tu Iniciativa y volvé a tirar');
  if(!nuevos.size) return;
  await guardarIniciativa({orden: iniciativa.orden.map(o => nuevos.has(o.id) ? {...o, ...nuevos.get(o.id)} : o)});
  if(soyGM){
    try{
      await fbDb.collection(fbRutaCampana('tiradas')).add({
        uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: '', origen: 'Orden de turnos · el GM tiró la iniciativa de los creeps',
        formula: '', rolls: [], mod: 0, total: 0, desde: 'recordatorio', cuando: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }catch(err){ console.error('No se pudo avisar la iniciativa de los creeps en la Mesa:', err); }
  }
}
let iniResaltado = null;   // {id, hasta}: el token al que se llegó desde la lista de turnos

// 🔔 Pulso de duelo en curso (2026-09-27, pedido del dueño): mientras un duelo quede minimizado o
// de fondo para esta pantalla, los dos tokens involucrados laten despacio en el mapa, para
// entender entre quiénes hay acción sin tener que reabrir el cuadro grande. comun/duelo.js llama
// a esta función (hook opcional, `typeof === 'function'`) cada vez que cambia qué duelos están
// minimizados/de fondo — nunca mientras el cuadro grande de ESE duelo está abierto acá mismo.
let duelosPulsoPares = [];   // [{id, atacanteTokenId, defensorTokenId}]
function dueloParesActivos(pares){
  duelosPulsoPares = Array.isArray(pares) ? pares : [];
  pedirDibujo();
}

// Un personaje caído o un creep derrotado (HP en 0) queda FUERA del orden de turnos mientras lo esté (2026-09-25, pedido del dueño): ▶ Siguiente lo
// saltea y la lista lo muestra apagado con 💀. Si lo curan (HP > 0) vuelve solo a jugar.
function iniciativaFueraDeJuego(id){
  const t = tokens.get(id);
  if(!t) return false;
  const v = vinculo(t), r = v && v.resumen;
  if(t.tipo === 'creep'){   // creep derrotado: el resumen público trae `muerto`; el GM además ve su HP exacto
    const sc = soyGM ? creepPrivadoDe(t.fichaId) : null;
    return !!(r && r.muerto) || !!(sc && num(sc.hp) <= 0 && num(sc.hpMax) > 0);
  }
  if(t.tipo !== 'pj') return false;
  return !!r && (!!r.muerto || (r.hp !== undefined && num(r.hpMax) > 0 && num(r.hp) <= 0));
}
/* ▶ Siguiente (el GM): el TURNO PROPIO (2026-10-06, P161 — turno completo). Termina el turno del que jugaba (baja el contador de sus
   estados), empieza el del siguiente (recarga No2 y SP, bajan sus cooldowns y se dispara lo que se dispara) y, si se dio la vuelta, pasa el
   ⟳ Mantenimiento de la ronda solo (lo que es de la ronda: formas que vencen, zonas, fuego, trampas; a los que tienen turno propio no les
   toca nada). Los caídos que se saltean igual pasan su turno (su cuenta de muerte y su sangrado siguen). Lo aplica la pantalla que tocó
   ▶ Siguiente, para que no dependa de que el jugador esté conectado. Todo se cuenta en la Crónica y en la Mesa. */
// `o` (Degollar, 2026-10-10): {orden (el orden nuevo, con quien termina ya al final), termina (su id), desde (el lugar donde estaba: sigue el que
// quedó ahí)}. `o.a` (dueño, 2026-10-15): el GM le da un turno normal a ese (clic derecho en su nombre): termina el turno del que jugaba y
// empieza el suyo, como con ▶ Siguiente, pero salta directo a él (sin cambiar de ronda); el orden sigue desde ahí. Sin `o`, el ▶ Siguiente de siempre.
// `o.pasarRonda` (⏭ Pasar de ronda, dueño, 2026-11-21): termina el turno en curso, los que faltaban en la ronda pasan su turno sin jugar (como un caído
// que se saltea: su inicio y su fin, sus zonas un turno menos), se pasa el Mantenimiento de la ronda y empieza el primero del orden.
async function iniciativaSiguiente(o){
  o = o && (o.orden || o.a || o.pasarRonda) ? o : {};
  if(!o.a && !o.orden && !o.pasarRonda && iniciativa.libre) return iniciativaVolverDeLibre();   // terminó el turno libre: vuelve a quien lo tenía
  const orden = o.orden || iniciativa.orden, n = orden.length;
  if(!n) return;
  // En un turno libre, el turno «de verdad» es el de quien lo tenía antes: ese es el que termina.
  const real = iniciativa.libre ? orden.find(x => x.id === iniciativa.libre.vuelve) : null;
  const termina = o.termina ? orden.find(x => x.id === o.termina) : real || iniciativa.orden[iniciativa.turno], pasoFin = iniciativa.paso, mapaFin = mapaMostrado;
  let i = o.orden ? num(o.desde) - 1 : iniciativa.turno, ronda = iniciativa.ronda;
  if(o.pasarRonda && real) i = Math.max(0, orden.indexOf(real));   // en un turno libre, la ronda sigue desde quien lo tenía
  const salteados = [], saltaRonda = [];
  const ya = new Set(iniciativa.actuaron || []);   // los que ya jugaron esta ronda
  // 🔁 Un turno de más (`repite`): el que termina ya había jugado esta ronda, así que su fin de turno ya se contó (dueño, 2026-10-29: «la
  // regeneración, el contador de turnos, etc. pasa solamente una vez por ronda»).
  const terminaRepetido = !!termina && iniciativa.repite === termina.id;
  if(termina) ya.add(termina.id);
  let repite = false;
  if(o.a){
    i = orden.findIndex(x => x.id === o.a);
    if(i < 0) return;
    repite = ya.has(o.a) && o.a !== (termina && termina.id);   // el GM le da el turno a uno que ya jugó: juega, sin volver a contar nada
  }else{
   // ⏭ Pasar de ronda: los que todavía no jugaron esta ronda (después del que juega) pasan su turno sin jugar; la vuelta empieza en el primero.
   if(o.pasarRonda){ for(let j = i + 1; j < n; j++) if(!ya.has(orden[j].id) && iniciativaOcupaLugar(orden[j].id)) saltaRonda.push(orden[j].id); i = n - 1; }
   for(let paso = 0; paso < 2 * n; paso++){
    i++;
    if(i >= n){ i = 0; ronda++; ya.clear(); }
    if(!iniciativaOcupaLugar(orden[i].id)) continue;   // 🎲 un tótem o un estandarte que quedó en un orden viejo: ni juega ni pasa su turno (2026-11-23)
    if(ya.has(orden[i].id)){
      // Ya jugó esta ronda y lo movieron más abajo (dueño, 2026-10-29): el GM decide si vuelve a actuar. Sí: juega sin volver a recargar ni
      // contar turnos; no: se saltea.
      if(orden[i].id === (termina && termina.id) || iniciativaFueraDeJuego(orden[i].id) || !(await iniciativaPreguntarRepite(orden[i].id))) continue;
      repite = true;
      break;
    }
    if(!iniciativaFueraDeJuego(orden[i].id)) break;   // salta a los caídos (si caen todos, avanza normal)
    if(!saltaRonda.includes(orden[i].id)) salteados.push(orden[i].id);   // (un caído que ya pasó su turno al pasar de ronda no lo pasa dos veces)
   }
  }
  // ▶ Si el que terminaba nunca tocó «Aplicar» al empezar su turno, se aplica ahora, antes de terminarlo (no se pierde; js abajo).
  if(termina && !terminaRepetido) await inicioTurnoForzar(termina.id, `${mapaFin}:${pasoFin}`);
  const fin = termina ? {termino: {id: termina.id, paso: pasoFin}} : {};
  const nuevaRonda = ronda !== iniciativa.ronda;
  // ⏬ La Demora que le llegó en su propio turno (dueloDemora): baja esos lugares ahora que terminó. Ya jugó: no le vuelve a tocar en la ronda.
  const demoras = {...(iniciativa.demoras || {})};
  let ordenFin = orden, turnoFin = i, notaDemora = '', avisoDemora = null;
  const nDem = termina ? Math.round(num(demoras[termina.id])) : 0;
  if(nDem > 0){
    delete demoras[termina.id];
    const k = orden.findIndex(x => x.id === termina.id), sigId = (orden[i] || {}).id;
    const j = Math.min(k + nDem, orden.length - 1);
    if(k >= 0 && j > k){
      ordenFin = orden.slice(); const [x] = ordenFin.splice(k, 1); ordenFin.splice(j, 0, x);
      turnoFin = Math.max(0, ordenFin.findIndex(y => y.id === sigId));
      const tT = tokens.get(termina.id);
      notaDemora = `⏬ Demora: ${tT && !tT.oculto && !enSigilo(tT) ? nombreDe(tT) : 'alguien'} baja ${j - k} lugar${j - k === 1 ? '' : 'es'} en el orden de turnos (${k + 1}.º → ${j + 1}.º)`;
      avisoDemora = {id: termina.id, lugares: j - k, desde: k + 1, hasta: j + 1};
    }
  }
  // ⚖ Al empezar la ronda (2026-11-23, P312 y P313): los que cambiaron de número por el sobrepeso en medio de la ronda (el orden no se tocó en el
  // momento) van al lugar que les toca por su número (js/132). Nadie jugó todavía: el primero que puede jugar es el que empieza.
  // 🐝 También los que entraron con su lugar ya pasado y jugaron al final de la ronda (P301 b: OrdenTurnos.entrarConTirada los suma a `reubicar`).
  const reubicarIds = nuevaRonda ? (iniciativa.reubicar || []).filter(id => ordenFin.some(x => x.id === id)) : [];
  if(reubicarIds.length){
    ordenFin = OrdenTurnos.reubicarAlEmpezar(ordenFin, reubicarIds);
    let k = 0;
    while(k < ordenFin.length - 1 && (iniciativaFueraDeJuego(ordenFin[k].id) || !iniciativaOcupaLugar(ordenFin[k].id))) k++;
    turnoFin = k;
  }
  // 🎺🔄🥁🐈‍⬛ Al empezar la ronda (2026-11-05, js/102): los Cambios de guardia, lo que quedó de la ronda pasada, Marcar el ritmo y la Mufa. Se
  // acomoda antes de darle el turno al primero (nadie jugó todavía: el que quede arriba de los que pueden jugar es el que empieza).
  let ordenRonda = null;
  if(nuevaRonda && typeof ordenInicioRonda === 'function'){
    try{ ordenRonda = await ordenInicioRonda(ordenFin.map(x => x.id)); }catch(err){ console.error('El orden al empezar la ronda:', err); }
    if(ordenRonda){
      ordenFin = ordenDeIds(ordenRonda.ordenIds, ordenFin);
      let k = 0;
      while(k < ordenFin.length - 1 && (iniciativaFueraDeJuego(ordenFin[k].id) || !iniciativaOcupaLugar(ordenFin[k].id))) k++;
      turnoFin = k;
    }
  }
  // Los que demoraron su turno con ▼ ya lo habían empezado: al volverles a tocar no se repite el inicio. Ronda nueva: se vacía.
  const empezados = nuevaRonda ? [] : (iniciativa.empezados || []);
  const sigEmpezado = !nuevaRonda && !!orden[i] && empezados.includes(orden[i].id);
  const sinInicio = sigEmpezado || repite;   // su turno ya había empezado (o ya lo jugó): no se vuelve a contar el inicio
  const ok = await guardarIniciativa({...(o.orden || ordenFin !== orden ? {orden: ordenSerial(ordenFin)} : {}), turno: turnoFin, paso: pasoFin + 1, actuaron: [...ya], ...fin, ...(nuevaRonda ? {ronda} : {}), libre: null,
    demoras, empezados: sigEmpezado ? empezados.filter(x => x !== orden[i].id) : empezados, repite: repite ? orden[i].id : null, ...(nuevaRonda ? {reubicar: [], finRonda: []} : {}),
    ...(ordenRonda ? {ordenPendientes: [], ordenUsados: {ronda, ids: ordenRonda.usados}, mufas: ordenRonda.mufas} : nuevaRonda ? {ordenPendientes: [], ordenUsados: null} : {})});
  if(!ok) return;
  if(notaDemora) mesaLinea(notaDemora, 'recordatorio');
  if(avisoDemora && typeof demoraAviso === 'function') demoraAviso(avisoDemora.id, 'aplicada', avisoDemora);   // ⏬ el Aviso (js/13)
  // La Crónica, para todos (dueño, 2026-10-06): «Empieza el turno de Fulano» sale enseguida (antes esperaba a que se procesara todo, ~5 s) y
  // después se le suman lo que pasó al terminar el anterior y al empezar el suyo.
  const sig = (ordenRonda || reubicarIds.length ? ordenFin[turnoFin] : orden[i]) || {id: ''};   // (la ronda nueva pudo reacomodar el orden: js/102, ⚖ js/132)
  const tSig = tokens.get(sig.id);
  // A quién se nombra (2026-10-09): un creep, si los jugadores ya lo conocen (js/29); un personaje, si no está en sigilo.
  const publico = (o, t) => !!t && !t.oculto && !(o && o.oculto) && (t.tipo === 'creep' ? creepConocido(t) : !enSigilo(t));
  // 🙈 (2026-11-23) Si al que le toca está escondido, su tarjeta lo nombra igual y va marcada: la ven solo los que lo ven (su bando, el GM con 👁).
  const escSig = sig.id ? escondidoDe(sig.id, sig) : null;
  const nomSig = tSig && (escSig || publico(sig, tSig)) ? nombreDe(tSig) : '';
  const tituloRonda = nuevaRonda ? `Ronda ${ronda} · ` : '';
  const tarjeta = momentoAbrir({tipo: 'turno', icono: '▶', titulo: `${tituloRonda}${nomSig ? `Empieza el turno de ${nomSig}` : 'Pasa el turno'}`,
    estado: 'listo', datos: {lineas: [nomSig ? `Le toca a ${nomSig}${o.a ? ' (se lo dio el GM)' : ''}.` : 'Sigue el orden de turnos.'], ...(sig.id ? {tokenId: sig.id} : {}), ...(escSig ? {escondido: escSig} : {})}});
  const grupos = [];   // cada uno, las líneas de un token (turnoMarcar) o sueltas (de todos)
  const suelta = l => turnoMarcar(l, '', null);
  if(termina && !terminaRepetido) grupos.push(await finDeTurno(termina.id, `${mapaFin}:${pasoFin}`));
  // 😵 Terminó su primer turno: se le va el Mareo de invocación (P327, js/135).
  if(termina && typeof mareoRevisar === 'function') try{ grupos.push(...(await mareoRevisar({termina: termina.id}))); }catch(err){ console.error('Mareo de invocación:', err); }
  // 🫨 Al terminar el turno de quien arrastró, los que arrastró recuperan el equilibrio (js/78; dueño, 2026-11-05).
  if(termina && typeof desequilibradosFinTurno === 'function') try{ grupos.push(suelta(await desequilibradosFinTurno(termina.id))); }catch(err){ console.error('Desequilibrado:', err); }
  // Los caídos que se saltean: su turno pasa igual, sin jugar.
  for(const id of salteados.filter(x => x !== (orden[i] || {}).id)){
    grupos.push(await inicioDeTurno(id, `${mapaFin}:${pasoFin}:${id}`), await finDeTurno(id, `${mapaFin}:${pasoFin}:${id}`));
    if(typeof mareoRevisar === 'function') try{ grupos.push(...(await mareoRevisar({termina: id}))); }catch(err){ console.error('Mareo de invocación:', err); }   // 😵 su primer turno pasó
  }
  // ⏭ Los que se saltearon al pasar de ronda: su turno pasa igual, sin jugar (lo más parecido a apretar ▶ Siguiente con cada uno: P269). Quien demoró
  // su turno con ▼ ya lo había empezado (no se repite el inicio).
  for(const id of saltaRonda){
    const k = `${mapaFin}:${pasoFin}:ronda:${id}`;
    if(!(iniciativa.empezados || []).includes(id)) grupos.push(await inicioDeTurno(id, k));
    grupos.push(await finDeTurno(id, k));
    if(!iniciativaFueraDeJuego(id)) grupos.push(turnoMarcar(await zonasDelQueLaTiro(id, null), id));
    if(typeof mareoRevisar === 'function') try{ grupos.push(...(await mareoRevisar({termina: id})), ...(iniciativaFueraDeJuego(id) ? [] : await mareoRevisar({empieza: id}))); }catch(err){ console.error('Mareo de invocación:', err); }   // 😵 su turno pasó: el suyo y el de los que invocó se van
  }
  if(o.pasarRonda){
    const nomP = id => { const tk = tokens.get(id), fila = orden.find(x => x.id === id); return tk && publico(fila, tk) ? nombreDe(tk) : ''; };
    // 🙈 (2026-11-24) Solo los que se ven: «alguien más» le contaba a los rivales que había un escondido en el orden.
    const vivos = saltaRonda.filter(id => !iniciativaFueraDeJuego(id)), nombres = vivos.map(nomP).filter(Boolean);
    const quien = nombres.join(', ');
    const txt = `⏭ El GM pasó de ronda${quien ? `: se saltearon los turnos de ${quien}` : ''}`;
    grupos.unshift(suelta([txt + '.']));
    try{ mesaLinea(txt, 'recordatorio'); }catch(e){}
  }
  const mantNuevo = nuevaRonda ? await pasarMantenimiento(`Ronda ${ronda}`) : null;   // lo que es de la ronda (P161)
  const deSig = l => turnoMarcar(l, sig.id, escSig);
  const lineasZonas = sig.id && !sinInicio ? await zonasDelQueLaTiro(sig.id, mantNuevo) : [];   // P172: sus zonas, un turno menos (js/07)
  // ▶ Un personaje o una invocación (2026-10-17, dueño): lo de empezar su turno espera su «✔ Aplicar» (inicioTurnoPendiente); un creep, como siempre.
  const pendiente = sig.id && !sinInicio ? await inicioTurnoPendiente(sig.id, `${mapaFin}:${pasoFin + 1}`) : false;
  const lineasInicio = sig.id && !pendiente && !sinInicio ? await inicioDeTurno(sig.id, `${mapaFin}:${pasoFin + 1}`) : [];
  if(sigEmpezado) grupos.push(deSig([`${nomSig || 'Sigue'}: retoma el turno que había demorado (no vuelve a recargar).`]));
  else if(repite) grupos.push(deSig([`${nomSig || 'Alguien'} vuelve a actuar: ya había jugado esta ronda, así que no recarga ni cuenta turnos.`]));
  grupos.push(deSig(lineasZonas), deSig(lineasInicio));
  // 😵 Empieza el turno de quien invocó: a sus invocaciones y refuerzos se les va el Mareo de invocación si todavía lo tenían (2026-11-24, js/135).
  if(sig.id && !sinInicio && typeof mareoRevisar === 'function') try{ grupos.push(...(await mareoRevisar({empieza: sig.id}))); }catch(err){ console.error('Mareo de invocación:', err); }
  if(ordenRonda && ordenRonda.lineas.length){
    ordenRonda.lineas.forEach(l => mesaLinea(l, 'recordatorio'));
    (ordenRonda.cambios || []).filter(c => c.desde !== c.hasta).forEach(c => { if(typeof ordenAvisar === 'function') ordenAvisar(c, c.por || '', ''); });
    grupos.unshift(suelta([...ordenRonda.lineas]));
  }
  await turnoTarjetasAbrir(tarjeta, escSig ? {tokenId: sig.id, escondido: escSig} : {tokenId: sig.id}, grupos,
    {titRivales: escSig && nuevaRonda ? `Ronda ${ronda} · Pasa el turno` : ''});
}
/* ▶ INICIAR COMBATE (dueño, 2026-11-20: «al empezar un combate todos empiezan con los nitros llenos y el primero en la lista de iniciativa es como si
   fuera su turno… se tira iniciativa y al apretar Ordenar al GM le aparezca un botón ahí en el menú de iniciativa que diga Iniciar combate, y ahí se
   inicia con el primer turno del primero de la lista con sus regeneraciones pertinentes, recarga de nitros, etc.»; «al apretarlo le tiene que aparecer
   el cartelito clásico de "empieza tu turno": se regenera tal cosa, pasa tal cosa, aceptar»).
   El botón aparece al apretar Ordenar (`porIniciar`, comun/orden-turnos.js) y pulsa hasta que se aprieta. Al apretarlo:
   1) si el mapa está en narrativo, ofrece pasarlo a Combate (lo mismo que el switch: modoPasarA);
   2) TODOS los del orden (personajes, invocaciones, creeps) quedan con los No2 llenos (la cuenta de ataques ya la pone en cero el paso a Combate);
   3) al PRIMERO que puede jugar le empieza el turno por el mismo camino que ▶ Siguiente: «▶ Empieza tu turno → Aplicar» en la pantalla de su jugador
      (inicioTurnoPendiente) o, si es un creep, su inicio de turno directo (inicioDeTurno), con sus zonas (zonasDelQueLaTiro). Sin lógica nueva: sus
      estados con turnos descuentan como en cualquier inicio de turno;
   4) la ronda vuelve a 1, nadie «ya jugó», y queda `iniciado` (no se vuelve a ofrecer: no se pueden recargar los No2 a mitad de combate por accidente);
   5) Crónica y Mesa: «▶ Empieza el combate: turno de X». */
let iniciandoCombate = false;
/* ⏳ «Iniciando combate…» (dueño, 2026-11-21: «poné un cartel de iniciando durante esos segundos que tarda»). Entre el clic y que el combate figure
   iniciado pasan 7 a 10 s (se llenan los No2 de todos, uno por uno): en ese rato el botón queda apagado y dice qué está haciendo, los otros botones
   del orden de turnos quedan apagados (▶ Siguiente avisaba «el combate todavía no se inició» y parecía que no había andado) y no se puede apretar dos
   veces. Si falla, el botón vuelve a quedar apretable, con un aviso. Solo lo ve el GM (los jugadores no tienen el botón). */
let iniciandoTxt = '';
function iniciandoPaso(txt){
  iniciandoTxt = txt || '';
  const b = document.getElementById('ini-iniciar');
  if(b && iniciandoCombate) b.textContent = `⏳ Iniciando combate…${iniciandoTxt ? ' ' + iniciandoTxt : ''}`;
}
async function combateNo2Llenos(alPaso){
  const porFicha = new Map();   // fichaId → {pj: bool, invs: Set}
  const fallas = [];
  let hechos = 0; const total = iniciativa.orden.length;
  for(const o of iniciativa.orden){
    if(alPaso) alPaso(++hechos, total);
    const t = tokens.get(o.id);
    if(!t || !t.fichaId) continue;
    if(!iniciativaOcupaLugar(o.id)) continue;   // 🎲 un tótem o un estandarte no juega: sus No2 no se tocan
    if(iniciativaFueraDeJuego(o.id)) continue;   // 💀 un caído queda como cayó: sin No2 llenos (P257, dueño, 2026-11-21)
    if(t.tipo === 'creep'){
      try{
        const sc = creepPrivadoDe(t.fichaId);
        if(sc && num(sc.nitros) === num(CreepCalculo.nitrosMax(CreepCalculo.normalizar(structuredClone(sc))))) continue;   // ya los tiene llenos: no se escribe
        await modificarCreep(t.fichaId, crudo => { const sc2 = CreepCalculo.normalizar(crudo); sc2.nitros = CreepCalculo.nitrosMax(sc2); return {}; });
      }catch(err){ console.error('Iniciar combate: los No2 de', nombreDe(t), err); fallas.push(nombreDe(t)); }
      continue;
    }
    if(t.tipo !== 'pj') continue;
    const [fichaId, invId] = String(t.fichaId).split(SEP_INVOCACION);
    if(!fichasPub.has(fichaId)) continue;
    const x = porFicha.get(fichaId) || {pj: false, invs: new Set(), nombre: nombreDe(t)};
    if(invId) x.invs.add(invId); else x.pj = true;
    porFicha.set(fichaId, x);
  }
  for(const [fichaId, x] of porFicha){
    try{
      await editarPersonajeMapa(fichaId, S => {
        let hubo = false;
        if(x.pj){ const max = num(FichaBotonera.nitrosMaximo(S)); if(num(S.nitros) !== max){ S.nitros = max; hubo = true; } }
        (S.invocaciones || []).forEach(inv => { if(inv && x.invs.has(String(inv.id))){ const max = num(InvCalculo.nitrosMax(inv)); if(num(inv.nitros) !== max){ inv.nitros = max; hubo = true; } } });
        return hubo;
      });
    }catch(err){ console.error('Iniciar combate: los No2 de', x.nombre, err); fallas.push(x.nombre); }
  }
  return fallas;
}
async function iniciativaIniciarCombate(){
  if(!soyGM || iniciandoCombate) return;
  if(!iniciativa.orden.length){ toast('Primero armá el orden de turnos (Traer tokens, tirar y Ordenar)'); return; }
  if(OrdenTurnos.enCurso(iniciativa, modoMapa)){ toast('El combate ya está en curso'); return; }
  let pasarACombate = false;
  if(modoMapa !== 'combate'){
    const r = await Confirmar.elegir('El mapa está en modo narrativo: moverse no gasta No2. ¿Lo pasás a Combate para empezar?', {titulo: 'Iniciar combate', icono: '▶', no: 'Cancelar', opciones: [
      {valor: 'combate', texto: '⚔ Pasar a Combate e iniciar', detalle: 'Lo mismo que el interruptor de arriba, y después empieza el combate.'},
      {valor: 'igual', texto: '▶ Iniciar sin cambiar el modo', detalle: 'El mapa sigue en narrativo; el orden de turnos arranca igual.'}]});
    if(!r) return;
    pasarACombate = r === 'combate';
  }
  if(iniciandoCombate) return;   // (dos clics seguidos mientras se elegía)
  iniciandoCombate = true; iniciandoTxt = pasarACombate ? 'pasando el mapa a Combate' : ''; renderIniciativa();
  let listo = false;
  try{
    if(pasarACombate && !(await modoPasarA('combate'))) return;   // (si falla, modoPasarA ya avisa; el botón vuelve a quedar apretable)
    iniciandoPaso('preparando');
    await bnCargarPiezas(); await acCargarPiezas();
    const fallas = await combateNo2Llenos((k, n) => iniciandoPaso(`llenando los No2 (${k} de ${n})`));
    iniciandoPaso('empezando el turno del primero');
    if(fallas.length) toast(`No se pudieron llenar los No2 de: ${fallas.join(', ')} — hacelo a mano`);
    const orden = iniciativa.orden, k = OrdenTurnos.primero(orden, id => iniciativaFueraDeJuego(id) || !iniciativaOcupaLugar(id)), sig = orden[k];
    const paso = Math.round(num(iniciativa.paso)) + 1, mapa = mapaMostrado;
    if(!(await guardarIniciativa({turno: k, ronda: 1, paso, actuaron: [], empezados: [], demoras: {}, repite: null, libre: null, termino: null, iniciado: true, porIniciar: false, movidos: {}}))){ toast('No se pudo iniciar el combate (no se guardó el orden de turnos) — probá de nuevo'); return; }
    listo = true;
    const tSig = tokens.get(sig.id);
    const publico = !!tSig && !tSig.oculto && !sig.oculto && (tSig.tipo === 'creep' ? creepConocido(tSig) : !enSigilo(tSig));
    const nomSig = publico ? nombreDe(tSig) : '';
    const titulo = `▶ Empieza el combate${nomSig ? `: turno de ${nomSig}` : ''}`;
    try{ mesaLinea(`${titulo} · todos arrancan con los No2 llenos`, 'recordatorio'); }catch(e){}
    // 🙈 (2026-11-23) El primero escondido: su tarjeta, con su nombre, solo para los que lo ven (js/29); a los demás, «Empieza el combate» sin él.
    const escSig = escondidoDe(sig.id, sig), nomSigV = escSig ? nombreDe(tSig) : nomSig, LLENOS = 'Todos los del orden de turnos arrancan con los No2 llenos.';
    const tarjeta = momentoAbrir({tipo: 'turno', icono: '▶', titulo: `Ronda 1 · Empieza el combate${nomSigV ? `: turno de ${nomSigV}` : ''}`, estado: 'listo',
      datos: {lineas: [LLENOS, nomSigV ? `Le toca a ${nomSigV}.` : 'Sigue el orden de turnos.'], ...(sig.id ? {tokenId: sig.id} : {}), ...(escSig ? {escondido: escSig} : {})}});
    // El turno del primero, como con ▶ Siguiente (sin lógica nueva).
    const clave = `${mapa}:${paso}`;
    const lineasZonas = turnoMarcar(await zonasDelQueLaTiro(sig.id, null), sig.id, escSig);
    const pendiente = await inicioTurnoPendiente(sig.id, clave);
    const lineasInicio = turnoMarcar(pendiente ? [] : await inicioDeTurno(sig.id, clave), sig.id, escSig);
    const mareos = typeof mareoRevisar === 'function' ? await mareoRevisar({empieza: sig.id}).catch(err => { console.error('Mareo de invocación:', err); return []; }) : [];   // 😵 js/135
    await turnoTarjetasAbrir(tarjeta, {tokenId: sig.id, escondido: escSig}, [lineasZonas, lineasInicio, ...mareos],
      {pre: [LLENOS], titRivales: escSig ? 'Ronda 1 · Empieza el combate' : '', preRivales: [LLENOS, 'Sigue el orden de turnos.']});
  }catch(err){ console.error('Iniciar combate:', err); toast(listo ? 'El combate se inició, pero falló el inicio del turno del primero — mirá la consola' : 'No se pudo iniciar el combate — probá de nuevo (el botón sigue ahí)'); }
  finally{ iniciandoCombate = false; iniciandoTxt = ''; renderIniciativa(); }
}
// ▶ Siguiente, el botón: si se ordenó y el combate todavía no se inició, avisa y ofrece iniciarlo (o seguir sin iniciar: no vuelve a preguntar).
async function iniciativaSiguienteBoton(){
  if(iniciandoCombate){ toast('⏳ El combate se está iniciando: esperá unos segundos'); return; }
  if(soyGM && OrdenTurnos.porIniciar(iniciativa) && !iniciativa.libre){
    const r = await Confirmar.elegir('El combate todavía no se inició: nadie tiene los No2 recargados y al primero de la lista no le empezó el turno.', {titulo: '▶ Siguiente', icono: '▶', no: 'Cancelar', opciones: [
      {valor: 'iniciar', texto: '▶ Iniciar combate', detalle: 'Todos con los No2 llenos y empieza el turno del primero de la lista.'},
      {valor: 'seguir', texto: '⏭ Pasar el turno sin iniciar', detalle: 'Como antes de este botón: termina el turno del primero y le toca al siguiente. No se vuelve a ofrecer «Iniciar combate» en este combate.'}]});
    if(r === 'iniciar') return iniciativaIniciarCombate();
    if(r !== 'seguir') return;
    if(!(await guardarIniciativa({iniciado: true, porIniciar: false}))) return;
  }
  return iniciativaSiguiente();
}
/* ⏭ PASAR DE RONDA (dueño, 2026-11-21: «en el menú de iniciativa y orden, agregar un botón para el GM que diga PASAR DE RONDA, que se saltee todos los
   turnos pendientes de la ronda y vuelva al primero. Sobre todo me sirve para cuando estoy haciendo pruebas, pero podría llegar a suceder que lo
   necesite durante un juego»). Solo el GM, en el pie del orden de turnos. Si quedan turnos sin jugar, pide una confirmación corta; después hace lo
   mismo que pasar todos esos turnos con ▶ Siguiente (iniciativaSiguiente con `pasarRonda`): termina el turno en curso, los que faltaban pasan su
   turno sin jugar, el Mantenimiento de la ronda y el turno queda en el primero del orden. En un turno libre, lo termina y sigue igual. */
let pasandoRonda = false;
const iniciativaPendientesRonda = () => OrdenTurnos.pendientesRonda(iniciativa, id => iniciativaFueraDeJuego(id) || !iniciativaOcupaLugar(id));
async function iniciativaPasarRonda(){
  if(!soyGM || pasandoRonda || !iniciativa.orden.length) return;
  if(iniciandoCombate){ toast('⏳ El combate se está iniciando: esperá unos segundos'); return; }
  // 🙈 (2026-11-24) El GM no se entera de un escondido (sin 👁): no se lo nombra ni se lo cuenta (igual pasa su turno sin jugar).
  const pend = iniciativaPendientesRonda().filter(x => { const e = escondidoDe(x.id, x); return !e || escondidoLoVeo(e.tipo, tokens.get(x.id)); });
  if(pend.length){
    const nombres = pend.map(x => { const t = tokens.get(x.id); return t ? nombreDe(t) : '?'; });
    const ok = await Confirmar.preguntar(`${pend.length === 1 ? 'Queda 1 turno' : `Quedan ${pend.length} turnos`} sin jugar en la ronda ${fmt(iniciativa.ronda)} (${nombres.join(', ')}). Pasan su turno sin jugar, se pasa el Mantenimiento de la ronda y empieza el primero del orden.`,
      {titulo: 'Pasar de ronda', icono: '⏭', si: 'Pasar de ronda', no: 'Cancelar'});
    if(!ok) return;
  }
  pasandoRonda = true; renderIniciativa();
  try{ await iniciativaSiguiente({pasarRonda: true}); }
  catch(err){ console.error('Pasar de ronda:', err); toast('No se pudo pasar de ronda — mirá la consola'); }
  finally{ pasandoRonda = false; renderIniciativa(); }
}
/* ▶ Es su turno (dueño, 2026-10-15: «poder desde el máster cambiar el turno de a quién le toca… botón derecho sobre el nombre en la tabla de
   iniciativa… que te pregunte si se descuentan los cooldowns, si es como un turno normal de la ronda o es su turno de manera libre sin
   contabilizar el paso del turno»). Clic derecho en una fila (solo el GM):
   - Turno normal: como ▶ Siguiente, pero directo a ese (termina el turno del que jugaba, empieza el suyo: recarga, bajan sus cooldowns…).
   - Turno libre: le toca ahora sin recargar ni bajar nada; con ▶ Siguiente vuelve el turno a quien lo tenía, también sin tocar nada. */
async function iniciativaDarTurno(id){
  if(!soyGM) return;
  const j = iniciativa.orden.findIndex(o => o.id === id);
  if(j < 0) return;
  const t = tokens.get(id), nombre = t ? nombreDe(t) : 'ese token';
  if(j === iniciativa.turno && !iniciativa.libre){ toast(`Ya es el turno de ${nombre}`); return; }
  // 🙈 (2026-11-24) Al que juega (o al que vuelve) se lo nombra solo si esta pantalla lo ve: el GM sin 👁 no se entera de un escondido.
  const loVeo = id => { const e = escondidoDe(id); return !e || escondidoLoVeo(e.tipo, tokens.get(id)); };
  const actual = iniciativa.orden[iniciativa.turno], tAct0 = actual && tokens.get(actual.id), tAct = tAct0 && loVeo(actual.id) ? tAct0 : null;
  const vuelve = iniciativa.libre ? iniciativa.libre.vuelve : actual && actual.id;
  const tVuelve = tokens.get(vuelve), nomVuelve = tVuelve && loVeo(vuelve) ? nombreDe(tVuelve) : 'quien lo tenía';
  const modo = await Confirmar.elegir(`¿Cómo le das el turno a ${nombre}?`, {titulo: `Es el turno de ${nombre}`, icono: '▶', no: 'Cancelar', opciones: [
    {valor: 'normal', texto: '▶ Turno normal', detalle: `Cuenta como su turno de la ronda: ${tAct ? `termina el de ${nombreDe(tAct)}` : 'termina el turno en curso'}, ${nombre} recarga y bajan sus cooldowns y estados. El orden sigue desde ${nombre}.`},
    {valor: 'libre', texto: '⚡ Turno libre', detalle: `Juega ahora sin que pase el turno: no recarga ni baja cooldowns ni estados. Con ▶ Siguiente, el turno vuelve a ${nomVuelve}.`},
  ]});
  if(modo === 'normal') return iniciativaSiguiente({a: id});
  if(modo !== 'libre') return;
  if(!await guardarIniciativa({turno: j, libre: {id, vuelve: vuelve || ''}})) return;
  const publico = tk => !!tk && !tk.oculto && (tk.tipo === 'creep' ? creepConocido(tk) : !enSigilo(tk));
  const o = iniciativa.orden[j];
  momentoAbrir({tipo: 'turno', icono: '⚡', titulo: publico(t) && !(o && o.oculto) ? `Turno libre de ${nombre}` : 'Turno libre', estado: 'listo',
    datos: {lineas: [`El GM le da un turno libre${publico(t) ? ` a ${nombre}` : ''}: no pasa el turno (no recarga ni baja nada).${publico(tVuelve) ? ` Después vuelve el turno de ${nomVuelve}.` : ''}`]}});
}
// ▶ Siguiente durante un turno libre: el turno vuelve a quien lo tenía, sin recargar ni bajar nada (el suyo sigue en curso).
async function iniciativaVolverDeLibre(){
  const k = iniciativa.orden.findIndex(o => o.id === iniciativa.libre.vuelve);
  if(k < 0){ await guardarIniciativa({libre: null}); return iniciativaSiguiente(); }   // ya no está en el orden: sigue el orden normal
  if(!await guardarIniciativa({turno: k, libre: null})) return;
  const t = tokens.get(iniciativa.orden[k].id);
  const publico = !!t && !t.oculto && !iniciativa.orden[k].oculto && (t.tipo === 'creep' ? creepConocido(t) : !enSigilo(t));
  // 🙈 (2026-11-23) Escondido: a los que lo ven, con su nombre; a los demás, sin él (js/29).
  const esc = escondidoDe(iniciativa.orden[k].id, iniciativa.orden[k]);
  const libreTarjeta = (nombre, marca) => momentoAbrir({tipo: 'turno', icono: '↩', titulo: nombre ? `Vuelve el turno de ${nombre}` : 'Termina el turno libre', estado: 'listo',
    datos: {lineas: [nombre ? `Terminó el turno libre: sigue el turno de ${nombre}.` : 'Terminó el turno libre: sigue el orden de turnos.'], ...(marca || {})}});
  if(esc){ libreTarjeta(nombreDe(t), {escondido: esc}); libreTarjeta('', {sinEscondido: esc}); }
  else libreTarjeta(publico ? nombreDe(t) : '');
}
/* Termina el turno y pasa al final del orden (Degollar, dueño 2026-10-10): lo llama el duelo en el mapa del GM cuando se resuelve un ataque
   con `terminaTurno`. Si era su turno, el turno pasa al que quedó en su lugar y él ya cuenta como que jugó la ronda (no le vuelve a tocar al
   final); si no era su turno (lo usó fuera de turno), solo pasa al final del orden. Sin orden de turnos, no hace nada. */
async function dueloTerminaTurno(d){
  const id = d && d.atacante && d.atacante.tokenId;
  if(!soyGM || !id || !iniciativa.orden.length) return;
  const i = iniciativa.orden.findIndex(o => o.id === id);
  if(i < 0) return;
  const orden = iniciativa.orden.slice(), [fila] = orden.splice(i, 1);
  orden.push(fila);
  const t = tokens.get(id), nombre = t && !t.oculto && !enSigilo(t) ? nombreDe(t) : (d.atacante.nombre || 'Alguien');
  const hab = (d.ataque && (d.ataque.habNombre || d.ataque.armaNombre)) || 'su ataque';
  if(i === iniciativa.turno){
    mesaLinea(`⏭ ${nombre} usó ${hab}: termina su turno y pasa al final del orden (en esta ronda no le vuelve a tocar)`, 'recordatorio');
    await iniciativaSiguiente({orden, termina: id, desde: i});
    return;
  }
  const activo = iniciativa.orden[iniciativa.turno] ? iniciativa.orden[iniciativa.turno].id : null;
  const turno = activo ? Math.max(0, orden.findIndex(o => o.id === activo)) : iniciativa.turno;
  if(await guardarIniciativa({orden: ordenSerial(orden), turno})) mesaLinea(`⏭ ${nombre} usó ${hab}: pasa al final del orden de turnos`, 'recordatorio');
}

/* 💥 Takle (2026-10-26, el del Tanque para creeps): al que pierde la embestida se le corta el turno y pasa al final del orden; si ya era el último,
   pierde el turno (el de esta ronda, si todavía no jugó; si ya jugó, el próximo queda a mano). Lo aplica el mapa del GM (el efecto «Al final del
   orden», js/13). Devuelve {nota, manual?} para el cuadro del duelo. */
async function alFinalDelOrden(tokenId, nombre, hab){
  if(!iniciativa.orden.length) return {manual: true, nota: 'no hay orden de turnos: a mano'};
  const i = iniciativa.orden.findIndex(o => o.id === tokenId);
  if(i < 0) return {manual: true, nota: 'no está en el orden de turnos: a mano'};
  const t = tokens.get(tokenId), quien = t && !t.oculto && !enSigilo(t) ? nombreDe(t) : (nombre || 'Alguien'), por = hab || 'una embestida';
  const ya = new Set(iniciativa.actuaron || []);
  if(i === iniciativa.turno){   // era su turno: se le corta
    const orden = iniciativa.orden.slice(), [fila] = orden.splice(i, 1);
    orden.push(fila);
    mesaLinea(`⏭ ${quien} (${por}): se le corta el turno y pasa al final del orden (en esta ronda no le vuelve a tocar)`, 'recordatorio');
    await iniciativaSiguiente({orden, termina: tokenId, desde: i});
    return {nota: 'se le cortó el turno: pasa al final del orden'};
  }
  if(i === iniciativa.orden.length - 1){
    if(i > iniciativa.turno && !ya.has(tokenId)){
      ya.add(tokenId);
      if(!(await guardarIniciativa({actuaron: [...ya]}))) return {manual: true, nota: 'ya era el último: que pierda su turno (a mano)'};
      mesaLinea(`⏭ ${quien} (${por}): ya era el último del orden, pierde su turno de esta ronda`, 'recordatorio');
      return {nota: 'ya era el último: pierde su turno de esta ronda'};
    }
    return {manual: true, nota: 'ya era el último y ya jugó esta ronda: que pierda su próximo turno (a mano)'};
  }
  const orden = iniciativa.orden.slice(), [fila] = orden.splice(i, 1);
  orden.push(fila);
  const activo = iniciativa.orden[iniciativa.turno] ? iniciativa.orden[iniciativa.turno].id : null;
  const turno = activo ? Math.max(0, orden.findIndex(o => o.id === activo)) : iniciativa.turno;
  if(!(await guardarIniciativa({orden: ordenSerial(orden), turno}))) return {manual: true, nota: 'no se pudo mover en el orden de turnos: a mano'};
  mesaLinea(`⏭ ${quien} (${por}): pasa al final del orden de turnos`, 'recordatorio');
  return {nota: 'pasa al final del orden de turnos'};
}

// Las invocaciones de un personaje que tienen turno propio (su token está en el orden): las demás van con el personaje.
function invConTurno(fichaId){
  return iniciativa.orden.map(o => tokens.get(o.id)).filter(t => t && String(t.fichaId || '').startsWith(fichaId + SEP_INVOCACION))
    .map(t => String(t.fichaId).split(SEP_INVOCACION)[1]);
}
// El inicio o el fin del turno de un token → las líneas públicas para la Crónica (sin la vida de los creeps, sin nombrar ocultos ni en sigilo).
async function turnoDeToken(tokenId, clave, inicio){
  const t = tokens.get(tokenId);
  if(!t || !t.fichaId) return [];
  if(!inicio) try{ await levitarAterrizar(tokenId); }catch(err){ console.error('No se pudo resolver la trampa al aterrizar:', err); }
  if(inicio && soyGM && typeof tunelBorrar === 'function') tunelBorrar(tokenId);   // 🕳 la estela del túnel dura hasta que empieza su próximo turno (js/46)
  if(inicio && soyGM && typeof ceboInicioTurno === 'function') ceboInicioTurno(tokenId).catch(err => console.error('El cebo:', err));   // 💎 el brillo vuelve a tentar (js/80)   // Levitar: al terminar el turno toca el piso
  const o = iniciativa.orden.find(x => x.id === tokenId);
  // 🙈 (2026-11-23) Si está escondido, sus líneas vuelven igual, marcadas (`.escondido`): la Crónica las muestra solo a quienes lo ven (js/29).
  const esc = typeof escondidoDe === 'function' ? escondidoDe(tokenId, o) : null;
  const titulo = inicio ? `Empieza el turno de ${nombreDe(t)}:` : `Terminó el turno de ${nombreDe(t)}:`;
  const publicas = rep => {
    const l = rep.filter(x => !/^No2 recargados/.test(x) && (t.tipo !== 'creep' || !/^HP total/.test(x)));
    return turnoMarcar(!l.length ? [] : [titulo, ...l], tokenId, esc);
  };
  const mesaOculta = esc && esc.tipo === 'pj' ? {desde: 'oculta-pj', ficha: String(t.fichaId).slice(0, 80)} : null;   // 🙈 su reporte en la Mesa: solo los que lo ven
  const numero = Math.round(num(mantenimientoNumero));
  try{
    if(t.tipo === 'creep'){
      if(!soyGM) return [];
      await acCargarPiezas();
      let r = null, nombre = '';
      let expl = [];
      await modificarCreep(t.fichaId, crudo => {
        const sc = CreepCalculo.normalizar(crudo); nombre = sc.nombre;
        const ant = Combatiente.explosivos(sc.estados);
        r = inicio ? CreepAcciones.inicioTurno(sc, clave, numero) : CreepAcciones.finTurno(sc, clave, numero);
        expl = Combatiente.vencidosExplosivos(ant, sc.estados);
        if(inicio && r) provocadoAvisar(t, sc.estados);
        return r;
      });
      if(r && r.rep.length && typeof historialReporteMantenimiento === 'function') historialReporteMantenimiento(`${nombre} · ${inicio ? 'empieza' : 'termina'} su turno`, r.rep);
      expl.forEach(ex => explotarAlTerminar(t, ex));   // 💥 un estado que explota al terminar (Armadura arcana)
      if(typeof ac !== 'undefined' && ac && !ac.host.hidden) acDibujar();
      return r ? publicas(r.rep) : [];
    }
    const [fichaId, invId] = String(t.fichaId).split(SEP_INVOCACION);
    const conTurno = invConTurno(fichaId);
    let r = null, expl = [];
    await editarPersonajeMapa(fichaId, S => {
      const ui = {fijarHp: v => mantFijarHp(S, v)};
      const estadosDe = () => invId ? ((S.invocaciones || []).find(x => x && x.id === invId) || {}).estados : S.efectos;
      const ant = Combatiente.explosivos(estadosDe());
      r = inicio ? FichaMantenimiento.inicioTurno(S, ui, clave, invId || '', conTurno, numero) : FichaMantenimiento.finTurno(S, ui, clave, invId || '', conTurno, numero);
      if(inicio && r) provocadoAvisar(t, invId ? ((S.invocaciones || []).find(x => x && x.id === invId) || {}).estados : S.efectos);
      expl = Combatiente.vencidosExplosivos(ant, estadosDe());
      return !!r;
    });
    expl.forEach(ex => explotarAlTerminar(t, ex));   // 💥 un estado que explota al terminar (Armadura arcana)
    if(r && r.rep.length) FichaMantenimiento.publicarReporte(inicio ? 'Empieza su turno' : 'Termina su turno', r.rep, r.nombre, mesaOculta);
    if(r && r.avisos && r.avisos.length) FichaMantenimiento.publicarRecordatorios(r.avisos, r.nombre, mesaOculta);
    if(r && r.robos && typeof roboAvisoNotado === 'function') roboAvisoNotado(fichaId, r.robos);   // 🫳 lo que le robaron en sigilo (js/47)
    return r ? publicas(r.rep) : [];
  }catch(err){
    console.error(`No se pudo aplicar el ${inicio ? 'inicio' : 'fin'} del turno:`, err);
    toast(`No se pudo ${inicio ? 'empezar' : 'terminar'} el turno de ${nombreDe(t)} — mirá la consola`);
    return [];
  }
}
/* Provocado (dueño, 2026-10-08): el efecto es a mano, pero al empezar el turno de alguien provocado, a quien lo maneja le aparece el anuncio
   «Estás Provocado» con qué significa y «Aceptar»; al resto, en la Crónica. Una vez por turno (el aviso se arma al empezar). */
const provocadoAvisados = new Set();
const provocadoTexto = quien => `Ira dirigida contra ${quien}. Este turno tenés que ir contra ese objetivo: atacarlo o usarle una habilidad hostil (si no llegás, acercate). No podés curarte, protegerte ni hacer otra cosa en lugar de eso.`;
// 😤 Un personaje o una invocación (2026-10-26, dueño: «el "estás provocado" y el "empieza tu turno" podrían unificarse en el mismo reporte»): el
// aviso va como primer paso de «▶ Empieza tu turno» (inicioTurnoPendiente) y, al aplicarlo, brilla quien provoca (inicioTurnoAplicar). Este Anuncio
// aparte queda para los creeps (el GM) y para cuando el inicio se aplicó sin ese reporte.
function provocadoAvisar(t, estados){
  const e = (estados || []).find(x => x && x.activo !== false && /^Provocado/i.test(String(x.nombre || '')));
  if(!e) return;
  const clave = `${t.fichaId}:${Math.round(num(iniciativa.paso))}`;
  if(provocadoAvisados.has(clave)) return;
  provocadoAvisados.add(clave);
  // Ira dirigida (dueño, 2026-10-08): el turno es para ir contra quien lo provocó — atacarlo o una habilidad hostil —, no para curarse u otra cosa.
  // 😤 Con `provocaDeNombre` (Tirar la bronca, el Taunt del duelo; 2026-10-26) se nombra a quien provoca y, al aceptar, brilla (js/77).
  const contra = String(e.detalle || '').match(/(?:ira dirigida contra|tiene que atacar a) ([^(.:]+)/);
  const quien = e.provocaDeNombre ? String(e.provocaDeNombre) : contra ? contra[1].trim() : 'quien te provocó';
  const texto = provocadoTexto(quien);
  const escP = typeof escondidoDe === 'function' ? escondidoDe(idDeToken(t)) : null;   // 🙈 escondido: solo los que lo ven (js/29)
  setTimeout(() => momentoAbrir({tipo: 'provocado', icono: '😤', titulo: `${nombreDe(t)} está Provocado${e.provocaDeNombre ? ` por ${quien}` : ''}`, estado: 'listo',
    resultado: `${texto}${e.turnos ? ` Le queda${num(e.turnos) === 1 ? '' : 'n'} ${fmt(num(e.turnos))} turno${num(e.turnos) === 1 ? '' : 's'}.` : ''}`,
    datos: {paraUid: t.tipo === 'creep' ? fbUsuario.uid : (t.duenoUid || ''), aviso: true, boton: 'Aceptar', ...(escP ? {escondido: escP} : {}),
      ...(e.provocaDe ? {provocaDe: String(e.provocaDe), provocaDeNombre: quien, provocadoNombre: nombreDe(t)} : {}),
      pasos: [{titulo: e.provocaDeNombre ? `Estás provocado por ${quien}` : 'Estás Provocado', texto: `${texto} ✋ Lo respeta quien juega (no lo frena el mapa).`}]}}), 600);
}
const inicioDeTurno = (tokenId, clave) => turnoDeToken(tokenId, clave, true);
/* 🙈 Las líneas del cambio de turno, según quién ve a quién (2026-11-23, dueño: «a los rivales no les debería salir nada, a sus aliados sí»).
   `turnoMarcar(lineas, tokenId, esc)` deja dicho de quién son (y si está escondido); `turnoTarjetasAbrir(tarjeta, sigId, lineas)` reparte: la tarjeta de
   siempre lleva lo de los que se ven (y lo de sig, si sig es el escondido: va marcada `datos.escondido`, la ven solo los que lo ven); a los que no ven a
   sig les llega aparte lo de los demás (`sinEscondido`); otro escondido (el que terminó) tiene su propia tarjeta marcada. Las cuentas: NoVisto.tarjetasTurno. */
function turnoMarcar(lineas, tokenId, esc){
  const l = Array.isArray(lineas) ? lineas : [];
  l.tokenId = tokenId;
  l.escondido = esc === undefined ? (typeof escondidoDe === 'function' ? escondidoDe(tokenId) : null) : esc;
  return l;
}
async function turnoTarjetasAbrir(tarjeta, sig, grupos, o){
  o = o || {};
  const t = NoVisto.tarjetasTurno(sig, grupos.map(g => ({tokenId: g.tokenId, escondido: !!g.escondido, lineas: [...g]})));
  const pre = o.pre || [];
  const sigL = [...pre, ...t.sig];
  if(sigL.length > pre.length) momentoActualizar(await tarjeta, {'datos.lineas': sigL.slice(0, 14)});
  if(t.rivales && (t.rivales.length || o.titRivales)){
    momentoAbrir({tipo: 'turno', icono: o.icono || '▶', titulo: o.titRivales || 'Pasa el turno', estado: 'listo',
      datos: {lineas: [...(o.preRivales || []), ...t.rivales].slice(0, 14), sinEscondido: sig.escondido}});
  }
  t.otras.forEach(x => {
    const g = grupos.find(y => y.tokenId === x.tokenId);
    momentoAbrir({tipo: 'turno', icono: '▶', titulo: `Turno de ${nombreDe(tokens.get(x.tokenId) || {}) || 'alguien'}`, estado: 'listo',
      datos: {lineas: x.lineas.slice(0, 14), escondido: g && g.escondido}});
  });
}

/* ▶ Empieza tu turno (2026-10-17, dueño: «un pequeño anuncio al principio del turno… los estados bajaron de X a X turnos, la regeneración de SP
   fue tal, la de HP fue tal, que la persona ponga aplicar»; los jugadores preguntaban si la regeneración se había aplicado). Para un personaje o
   una invocación: se calcula sobre una copia de la ficha (sin guardar nada) y se abre el momento `inicio-turno` (esperando) para su dueño —o
   quien tiene 🎮 su control—, con lo que va a pasar y «✔ Aplicar» (js/16 inicioTurnoMomento). Al tocarlo se aplica de verdad (turnoDeToken: la
   misma clave, así nunca se aplica dos veces). Si nadie lo toca, el GM tiene «▶ Aplicar por él» en la Crónica, y al pasar el turno se aplica solo
   antes de terminarlo (inicioTurnoForzar). → true si quedó esperando. */
async function inicioTurnoPendiente(tokenId, clave){
  const t = tokens.get(tokenId);
  if(!t || !t.fichaId || t.tipo === 'creep') return false;
  const [fichaId, invId] = String(t.fichaId).split(SEP_INVOCACION);
  const conTurno = invConTurno(fichaId), numero = Math.round(num(mantenimientoNumero));
  let prev = null;
  try{
    await editarPersonajeMapa(fichaId, S => {
      const C = structuredClone(S);
      const est = () => (invId ? (((C.invocaciones || []).find(x => x && x.id === invId) || {}).estados) : C.efectos) || [];
      const antes = est().filter(e => e && e.activo !== false && !e.permanente && num(e.turnos) > 0).map(e => ({id: e.id, nombre: e.nombre, turnos: num(e.turnos)}));
      const antesMalviaje = typeof esMalviaje === 'function' ? (est().find(esMalviaje) || null) : null;
      const r = FichaMantenimiento.inicioTurno(C, {fijarHp: v => FichaAcciones.fijarHp(C, v), simular: true}, clave, invId || '', conTurno, numero);   // (simular: la vista previa no manda la cura robada)
      if(!r) return false;
      const despues = new Map(est().map(e => [e.id, e]));
      const pv = est().find(e => e && e.activo !== false && /^Provocado/i.test(String(e.nombre || '')));   // 😤 sigue provocado este turno
      const mvE = typeof esMalviaje === 'function' ? (est().find(esMalviaje) || antesMalviaje) : null;   // 🌺 malviajando (aunque se termine este turno)
      const tt = n => `${fmt(n)} turno${n === 1 ? '' : 's'}`;
      const humo = n => r.rep.some(l => /^Sahumerio/.test(l) && l.endsWith(`se llevó ${n}`));   // 🔮 lo sacó el Sahumerio, no se terminó
      prev = {malviaje: mvE ? {nombre: mvE.nombre, floripondio: true, ...(malviajeDifDe(mvE) ? {efEsp: malviajeDifDe(mvE)} : {})} : null, prov: pv ? {de: String(pv.provocaDe || ''), quien: String(pv.provocaDeNombre || '') || ((String(pv.detalle || '').match(/(?:ira dirigida contra|tiene que atacar a) ([^(.:]+)/) || [])[1] || '').trim()} : null, rep: r.rep, turnos: antes.map(a => { const e = despues.get(a.id); return e ? (num(e.turnos) === a.turnos ? '' : `${a.nombre}: ${tt(a.turnos)} → ${tt(num(e.turnos))}`) : humo(a.nombre) ? `${a.nombre}: se lo llevó el humo` : `${a.nombre}: se termina`; }).filter(Boolean)};   // (2026-11-14, dueño: los estados que no cambian no se muestran)
      return false;   // solo mirar: no se guarda nada
    });
  }catch(err){ console.error('No se pudo calcular el inicio del turno:', err); return false; }
  if(!prev) return false;   // ya estaba aplicado (o no se pudo leer la ficha): sigue como siempre
  const f = fichasPub.get(fichaId);
  const paraUid = (f && f.resumen && f.resumen.control) || t.duenoUid || (f && f.duenoUid) || '';
  // Ordenado para leerlo de un vistazo: los estados (cuántos turnos les quedan), la vida y el SP, los No2 y lo demás (invocaciones, avisos).
  const esEstado = l => /turno|se termin|vence|venci/i.test(l) && !/^No2/.test(l);
  const esVida = l => /HP|vida|SP|Regeneraci|Veneno|Sangrado|Quemadura|Meditar|Ca[ií]d/i.test(l) && !esEstado(l);
  const est = prev.rep.filter(esEstado), vida = prev.rep.filter(esVida), no2 = prev.rep.filter(l => /^No2/.test(l)), otros = prev.rep.filter(l => !esEstado(l) && !esVida(l) && !/^No2/.test(l));
  // 🔮 Lo que se llevó el humo del Sahumerio: bajó un turno y después se fue (el orden de inicioTurno); se dice solo lo segundo.
  const humo = new Set(prev.rep.map(l => (/^Sahumerio.*se llevó (.+)$/.exec(l) || [])[1]).filter(Boolean));
  const estados = (est.length ? est : prev.turnos).map(l => { const n = [...humo].find(x => l.startsWith(`${x}:`)); return n ? `${n}: se lo llevó el humo` : l; });
  const pasos = [
    ...(estados.length ? [{titulo: invId ? 'Sus estados' : 'Tus estados', texto: estados.join(' · ')}] : []),   // 🐝 (P299) la de una invocación habla de ella
    ...(vida.length ? [{titulo: 'Vida y SP', texto: vida.join(' · ')}] : []),
    ...(no2.length ? [{titulo: 'No2', texto: no2.join(' · ')}] : []),
    ...(otros.length ? [{titulo: 'Además', texto: otros.join(' · ')}] : []),
  ];
  if(!pasos.length) pasos.push({titulo: 'Lo que pasa al empezar', texto: 'Nada que cambie.'});
  try{ const mv = prev.malviaje && typeof malviajePasoPrevio === 'function' ? malviajePasoPrevio(t, prev.malviaje) : null; if(mv) pasos.unshift(mv); }catch(err){ console.error('El Malviaje:', err); }   // 🌺 (js/52)
  if(prev.prov){ const q = prev.prov.quien || 'quien te provocó'; pasos.unshift({titulo: `😤 Estás provocado por ${q}`, texto: `${provocadoTexto(q)} ✋ Lo respeta quien juega (no lo frena el mapa).`}); }
  // 🔮 La Bola de cristal (2026-10-18): si hay algo oculto en su campo de visión, se anuncia acá (js/53).
  try{ if(!invId && typeof bolaCristalAviso === 'function'){ const b = bolaCristalAviso(t); if(b) pasos.push(b); } }catch(err){ console.error('La Bola de cristal:', err); }
  const escI = escondidoDe(tokenId);   // 🙈 (2026-11-23) escondido: su dueño lo ve siempre; los demás, solo si lo ven (el GM sin 👁, no: js/29)
  await momentoAbrir({tipo: 'inicio-turno', icono: '▶', titulo: `Empieza el turno de ${nombreDe(t)}`, estado: 'esperando',
    resultado: 'Esperando que aplique el inicio de su turno…', datos: {tokenId, clave, paraUid, pasos, ...(escI ? {escondido: escI} : {}), ...(prev.malviaje ? {malviaje: prev.malviaje} : {}),
      ...(prev.prov ? {provocado: true, ...(prev.prov.de ? {provocaDe: prev.prov.de, provocaDeNombre: prev.prov.quien} : {})} : {})}});
  return true;
}
// «✔ Aplicar» (su dueño) o «▶ Aplicar por él» (el GM): lo aplica de verdad y deja el momento con lo que pasó.
const inicioAplicando = new Set();
async function inicioTurnoAplicar(id, d, porGM){
  const dt = (d && d.datos) || {};
  if(inicioAplicando.has(id) || !dt.tokenId || !dt.clave) return;
  inicioAplicando.add(id);
  try{
    // ⏱ Solo mientras siga siendo su turno (2026-11-03: con el orden cambiado —Ordenar, ▲▼, Limpiar— el cartel viejo quedaba con su «✔ Aplicar» y le
    // aplicaba a Rockardo el inicio de un turno que ya no era el suyo). Si ya no lo es, se cierra sin tocar nada.
    if(!inicioTurnoVigente(dt.tokenId, dt.clave)){
      await momentoActualizar(id, {estado: 'listo', resultado: '⏱ Ya no es su turno: el inicio no se aplicó (cambió el orden de turnos)', 'datos.noAplicado': true});
      if(!porGM) toast('Ya no es tu turno: el inicio no se aplicó');
      return;
    }
    const tp = tokens.get(dt.tokenId);
    if(dt.provocado && tp) provocadoAvisados.add(`${tp.fichaId}:${Math.round(num(iniciativa.paso))}`);   // 😤 ya estaba en este reporte
    await turnoDeToken(dt.tokenId, dt.clave, true);
    let mv = null;   // 🌺 malviajando (js/52, 2026-11-03): la tirada se presenta en su propio cartel, a él y a los demás (con el estado de antes de aplicar)
    try{ mv = tp && dt.malviaje && typeof malviajeAbrir === 'function' ? await malviajeAbrir(tp, porGM, dt.malviaje, dt.tokenId) : null; }catch(err){ console.error('El Malviaje:', err); }
    if(dt.provocaDe && tp && typeof provocadoBrilloPedir === 'function') provocadoBrilloPedir(dt.provocaDe, dt.provocaDeNombre, nombreDe(tp));
    const pasos = [...(dt.pasos || []).filter(x => !/^🌺 Estás malviajando/.test(x.titulo || '')), ...(mv ? [{titulo: mv.titulo, texto: mv.texto}] : []),
      {titulo: '✔ Aplicado', texto: `Ya se aplicó${porGM ? ' (lo aplicó el GM)' : ''}: los estados, la regeneración, la vida y los No2 quedaron como dice arriba.`}];
    await momentoActualizar(id, {estado: 'listo', resultado: `✔ Se aplicó el inicio de su turno${porGM ? ' (lo aplicó el GM)' : ''}${mv ? ' · ' + mv.resumen : ''}`, 'datos.pasos': pasos});
  }catch(err){ console.error('No se pudo aplicar el inicio del turno:', err); toast('No se pudo aplicar el inicio del turno — mirá la consola'); }
  finally{ inicioAplicando.delete(id); }
}
/* ¿Sigue vigente el inicio de turno de este token con esta clave («mapa:paso»)? Sí, si el paso del orden es el mismo y el turno es suyo (o es de un
   turno libre que después vuelve a él). Sin orden de turnos o sin él en el orden, sí (no hay con qué comparar). */
function inicioTurnoVigente(tokenId, clave){
  if(!iniciativa.orden.length || !iniciativa.orden.some(o => o.id === tokenId)) return true;
  const c = String(clave || ''), paso = Number(c.slice(c.lastIndexOf(':') + 1));
  if(Number.isFinite(paso) && paso !== Math.round(num(iniciativa.paso))) return false;
  return esSuTurno(tokenId) !== false || !!(iniciativa.libre && iniciativa.libre.vuelve === tokenId);
}
// Al pasar el turno: si quedó sin aplicar, se aplica ahora (turnoDeToken no aplica dos veces la misma clave) y se cierra su momento.
async function inicioTurnoForzar(tokenId, clave){
  const t = tokens.get(tokenId);
  if(!t || t.tipo === 'creep') return;
  try{
    const snap = await fbDb.collection(fbRutaCampana('momentos')).where('tipo', '==', 'inicio-turno').where('datos.clave', '==', clave).get();
    const pend = snap.docs.find(x => x.data().estado === 'esperando' && (x.data().datos || {}).tokenId === tokenId);   // el suyo (2026-11-03: antes, cualquiera con esa clave)
    if(!pend) return;
    await turnoDeToken(tokenId, clave, true);
    await momentoActualizar(pend.id, {estado: 'listo', resultado: '✔ Se aplicó solo al pasar el turno (nadie lo había aplicado)'});
  }catch(err){ console.error('No se pudo cerrar el inicio de turno pendiente:', err); }
}
const finDeTurno = (tokenId, clave) => turnoDeToken(tokenId, clave, false);

/* ¿Es el turno de este token? true / false; null si no hay orden de turnos o no está en él (2026-10-06, P161). */
function esSuTurno(tokenId){
  if(!tokenId || !iniciativa.orden.length || !iniciativa.orden.some(o => o.id === tokenId)) return null;
  return (iniciativa.orden[iniciativa.turno] || {}).id === tokenId;
}
// Para ConfirmarTurno (comun/confirmar-turno.js): el Flash y el costo de turno ajeno ya no preguntan «¿es tu turno?» si el mapa lo sabe.
window.confirmarTurnoSaber = o => {
  if(modoMapa !== 'combate' || !iniciativa.orden.length) return null;
  const id = (o && o.ident) || {}, nombre = id.nombre || (o && o.quien) || '';
  const tok = iniciativa.orden.map(x => x.id).find(tid => { const t = tokens.get(tid); return t && ((id.ref && t.fichaId === id.ref) || (nombre && nombreDe(t) === nombre)); });
  return tok ? esSuTurno(tok) : null;
};
/* Una acción fuera de turno (dueño, 2026-10-06: «no se restringen, pero se comunican»): un toast a quien la hace y una línea en la Mesa para
   todos. No avisan las defensas (no pasan por acá), la oportunidad y el contraataque (son de turno ajeno) ni el ⚡ Flash (avisa ConfirmarTurno). */
// Un botón (no moverse) queda PENDIENTE hasta que la acción de verdad ocurre (2026-10-24, dueño: cancelar el cartel del Muro de fuego dejaba
// «actúa fuera de su turno» en la Mesa sin que hubiera pasado nada): se publica justo antes de lo primero que esta pantalla escriba en la
// Mesa nombrando a ese token (comun/mesa.js: window.mesaAntesDePublicar, o window.mesaLlegaronMias para lo que se escribe directo).
// Si se cancela antes, no sale nada; otro botón lo reemplaza; vence a los 3 minutos.
let fueraDeTurnoPendiente = null;
function fueraDeTurnoPublicar(p){
  if(typeof mesaLinea === 'function') mesaLinea(`⏱ ${p.nombre} actúa fuera de su turno: ${p.accion}`);
  // y en la Crónica, para todos (dueño, 2026-10-06); quien la hizo ya lo vio en el aviso
  momentoAbrir({tipo: 'fuera-de-turno', icono: '⏱', titulo: `${p.nombre} actúa fuera de su turno`, resultado: p.accion, estado: 'listo', datos: {centro: true}});
}
function fueraDeTurnoSoltar(texto){
  const p = fueraDeTurnoPendiente;
  if(!p) return;
  if(Date.now() - p.hora > 3 * 60e3){ fueraDeTurnoPendiente = null; return; }
  if(!String(texto || '').includes(p.nombre) || /actúa fuera de su turno/.test(texto)) return;
  fueraDeTurnoPendiente = null;
  fueraDeTurnoPublicar(p);
}
window.mesaAntesDePublicar = texto => fueraDeTurnoSoltar(texto);
window.mesaLlegaronMias = docs => docs.forEach(t => fueraDeTurnoSoltar(`${t.quien || ''} ${t.origen || ''} ${t.formula || ''}`));
// 🙈 ¿Los demás no lo ven? (oculto, en sigilo o con su fila del orden escondida)
function ocultoParaMesa(tokenId){
  const t = tokens.get(tokenId);
  if(!t) return false;
  const fila0 = iniciativa.orden.find(o => o.id === tokenId);
  return !!(t.oculto || (fila0 && fila0.oculto) || (typeof enSigilo === 'function' && enSigilo(t)));
}
// 🙈 (2026-11-05, dueño: «al GM se le tiene que notificar si un jugador mueve un token oculto fuera de su turno, inclusive con movimiento libre»):
// solo al GM — un toast en su pantalla y la Crónica de él; los jugadores no lo ven (datos.soloGM, js/16).
function avisarGMOcultoFueraDeTurno(t, accion){
  if(soyGM || typeof momentoAbrir !== 'function') return;
  // (2026-11-05, dueño: «tiene que ser con una notificación, no puede quedar en la Mesa porque se traspapela»): el Aviso al centro, con «Entendido».
  momentoAbrir({tipo: 'fuera-de-turno', icono: '🙈', titulo: `${nombreDe(t)} (oculto) actúa fuera de su turno`, resultado: accion, estado: 'listo',
    datos: {soloGM: true, aviso: true, boton: 'Entendido', veredicto: {tono: 'neutro', grande: 'Oculto, fuera de su turno', chico: `${nombreDe(t)}: ${accion}`}}});
}
function avisarFueraDeTurno(tokenId, b, libre){
  if(modoMapa !== 'combate' || esSuTurno(tokenId) !== false) return;
  if(b && (b.dataset.botoneraaccion === 'otroataque' || b.classList.contains('bt-flash'))) return;
  const t = tokens.get(tokenId);
  if(!t) return;
  const fila = b && b.closest('.bot-fila, .accion-row, .cat-row');
  const accion = !b ? (libre ? 'se mueve (con 🦶 Mover libre)' : 'se mueve') : ((fila && fila.querySelector('.cat-nombre, .accion-nombre')) || b.querySelector('.bt-label') || b).textContent.trim().replace(/\s+/g, ' ').slice(0, 60);
  // 🙈 Un token oculto (o en sigilo, o con su fila del orden escondida) no se anuncia en la Mesa ni en la Crónica: los demás no lo ven
  // (2026-11-05, prueba en el mapa: mover un creep oculto avisaba «X actúa fuera de su turno: se mueve» a los jugadores). Pero el GM sí se entera.
  if(ocultoParaMesa(tokenId)){
    toast(`⏱ No es el turno de ${nombreDe(t)}: se puede igual${soyGM ? '' : '; como está oculto, solo le llega el aviso al GM'}`);
    avisarGMOcultoFueraDeTurno(t, accion);
    return;
  }
  if(libre) return;   // 🦶 el Mover libre de un token a la vista no se anuncia (como siempre)
  toast(`⏱ No es el turno de ${nombreDe(t)}: se puede igual y, si lo hace, queda en la Mesa`);
  const p = {nombre: nombreDe(t), accion, hora: Date.now()};
  if(!b) fueraDeTurnoPublicar(p);   // moverse: ya se movió
  else fueraDeTurnoPendiente = p;
}
/* Una defensa sin No2 (2026-10-06, dueño, a probar: Combatiente.avisarDeudaNo2): a quien la hace, un cartel como el Aviso; a los demás, la
   Crónica. La deuda se descuenta en su próxima recarga. */
window.avisoDeudaNo2 = o => {
  const quien = o.nombre || 'Sin nombre';
  // (2026-11-03, probado en el mapa) El contraataque y el ataque de oportunidad no son una defensa: se hacen igual porque son una reacción
  // fuera de turno y arrancó en 0 No2 o más (la regla del 2026-11-01).
  const reaccion = /contraataque|oportunidad/i.test(String(o.accion || ''));
  const conMesa = num(o.quedan) + num(o.costo) < 0;   // ⚖ ya estaba en negativo: se hizo igual, con la mesa (2026-11-03)
  AvisoCombate.mostrar({icono: '⚠', titulo: `${quien}: no tenés Nitros`, pasos: [{titulo: o.accion, texto: conMesa ? `Cuesta ${fmt(num(o.costo))} No2 y ya estabas en negativo: la regla dice que no, pero se hizo igual (lo decidió la mesa).` : `Cuesta ${fmt(num(o.costo))} No2 y no te alcanzaban: igual se hace, porque ${reaccion ? 'es una reacción fuera de tu turno y no estabas en negativo' : 'es una defensa'}.`}],
    veredicto: {tono: 'malo', grande: `${fmt(num(o.quedan))} No2`, chico: 'esa deuda se descuenta en tu próxima recarga'}});
  momentoAbrir({tipo: 'deuda', icono: '⚠', titulo: conMesa ? `${quien} se saltó la regla de los No2 negativos (con la mesa)` : `${quien} ${reaccion ? 'reaccionó' : 'se defendió'} sin Nitros`, resultado: `${o.accion}: quedó en ${fmt(num(o.quedan))} No2 (se descuenta en su próxima recarga).`,
    estado: 'listo', datos: {centro: true}});
};
// ¿Ese token está haciendo el dodge roll? (puede quedar en No2 negativos al moverse)
const enDodge = id => typeof dodgeBanner !== 'undefined' && !!dodgeBanner && dodgeBanner.tokenId === id;
// ⚖ El sobrepeso de un personaje (2026-11-11, dueño): lo que se pasa de su Carga máxima, del estado derivado «Sobrepeso» de su resumen público
// (comun/ficha-resumen.js). El dodge roll le cuesta +1 No2 (Combatiente.recargoSobrepeso). Invocaciones y creeps no tienen sobrepeso.
const sobrepesoDeToken = t => {
  if(!t || t.tipo !== 'pj' || String(t.fichaId || '').includes(SEP_INVOCACION) || typeof fichasPub === 'undefined') return 0;
  // (el resumen público no guarda el id ni el monto: alcanza con saber que lo tiene — el recargo es fijo)
  const f = fichasPub.get(String(t.fichaId)), e = f && f.resumen && (f.resumen.estados || []).find(x => x && x.nombre === 'Sobrepeso' && x.derivado);
  return e ? 1 : 0;
};
// ⚖ Cuánto sobrepeso tiene (2026-11-23, P312: resta a la Iniciativa; lo publica el resumen como `sobre`). null = un resumen viejo, que no lo dice.
const sobrepesoValorDeToken = t => {
  if(!t || t.tipo !== 'pj' || !t.fichaId || String(t.fichaId).includes(SEP_INVOCACION) || typeof fichasPub === 'undefined') return null;
  const f = fichasPub.get(String(t.fichaId)), r = f && f.resumen;
  return r && r.sobre !== undefined ? Math.max(0, num(r.sobre)) : null;
};

/* Una invocación nueva (dueño, 2026-10-06): si hay orden de turnos, entra con «Mareo de invocación»: no actúa en su primer turno (desde el 2026-11-24,
   P327: se va al terminar ese turno o al empezar el de quien la invocó, lo que pase primero; js/135).
   Lo hace la pantalla del GM al ver aparecer el token.
   🐝 Con su tirada de iniciativa (2026-11-23, dueño, P275: «al realizar una invocación, esta venga acompañada de una tirada de iniciativa y que
   automáticamente al invocarse se ubique en el orden de turnos de acuerdo a su tirada»): antes entraba al final con 0. Ahora tira la Iniciativa
   de la invocación (la de sus datos, `InvCalculo.statValor(inv, 'ini')`, con lo fijo como la Prisa sumado al resultado), la tirada va a la Mesa
   como cualquier tirada de iniciativa («Iniciativa · <invocación>») y entra en su lugar (`OrdenTurnos.entrarConTirada`): antes del primero que
   sacó menos; si su lugar ya pasó en esta ronda, juega igual al final de esta ronda y desde la próxima en su lugar (P301 b). Si no se pueden leer sus datos, entra al final con 0, como
   antes, y se avisa al GM para que escriba el número a mano. La tira la pantalla del GM (P302). */
async function invocacionIniciativa(t){
  try{
    if(typeof bnCargarPiezas === 'function') await bnCargarPiezas();   // (InvCalculo no se carga de entrada: js/11)
    const inv = await invDeToken(t);
    if(!inv || typeof InvCalculo === 'undefined') return null;
    const x = InvCalculo.migrar(structuredClone(inv));
    const base = num(InvCalculo.statValor(x, 'ini')), fijo = InvCalculo.iniFijo(x);
    const fo = formulaParaValor(base);
    return Combatiente.conIniFijo((fo && tirarDados(fo.formula)) || {formula: '0', rolls: [], mod: 0, total: 0}, fijo && fijo.val ? fijo : null);
  }catch(err){ console.error('No se pudo tirar la iniciativa de la invocación:', err); return null; }
}
async function invocacionAlOrden(tokenId){
  const t = tokens.get(tokenId);
  if(!soyGM || !t || !iniciativa.orden.length || iniciativa.orden.some(o => o.id === tokenId)) return;
  if(!String(t.fichaId || '').includes(SEP_INVOCACION) || !iniciativaOcupaLugar(tokenId)) return;
  const r = await invocacionIniciativa(t);
  if(!tokens.has(tokenId) || iniciativa.orden.some(o => o.id === tokenId)) return;   // (mientras se tiraba se fue, o ya entró)
  const [fichaId, invId] = String(t.fichaId).split(SEP_INVOCACION);
  const nombre = nombreDe(t);
  const e = OrdenTurnos.entrarConTirada(iniciativa, {id: tokenId, valor: r ? num(r.total) : 0}, {enCurso: OrdenTurnos.enCurso(iniciativa, modoMapa), alFinal: !r});
  if(!e) return;
  const ok = await guardarIniciativa({orden: ordenSerial(e.orden), turno: e.turno, actuaron: e.actuaron, finRonda: e.finRonda, reubicar: e.reubicar});
  if(!ok) return;
  if(r && !ocultoParaMesa(tokenId)) mesaPublicar(`Iniciativa · ${nombre}`, {...r, ficha: fichaId});
  if(!r) toast(`🐝 ${nombre} entró al final del orden con 0: no se pudo leer su Iniciativa. Escribí el número a mano.`);
  const sinMareo = !!((vinculo(t) || {}).resumen || {}).sinMareo;   // 👁 el Ojo de Kicillof entra sin mareo (2026-10-20)
  // 😵 (2026-11-24, dueño, P327) pierde solo su primer turno; quien la invocó es el personaje dueño (js/135).
  const invocador = typeof mareoDuenoDeInvocacion === 'function' ? mareoDuenoDeInvocacion(t.fichaId) : '';
  try{
    if(!sinMareo) await editarPersonajeMapa(fichaId, S => {
      const inv = (S.invocaciones || []).find(x => x && x.id === invId);
      if(!inv) return false;
      const pre = estadosPresetFicha().find(p => p.nombre === 'Mareo de invocación');
      if(!pre) return false;
      inv.estados = inv.estados || [];
      Combatiente.agregarEstado(inv.estados, typeof mareoEstadoNuevo === 'function' ? mareoEstadoNuevo(pre, invocador) : {id: idEstadoNuevo(), activo: true, ...structuredClone(pre)});   // (el selector de estados se carga recién al usarlo)
      return true;
    });
  }catch(err){ console.error('No se pudo marear a la invocación nueva:', err); }
  momentoAbrir({tipo: 'turno', icono: '✨', titulo: `${nombre} entra al orden de turnos`, estado: 'listo',
    datos: {lineas: invocacionAlOrdenLineas(e, r, sinMareo, invocador)}});
}
// Lo que cuenta la Crónica al entrar (la usan las pruebas y los refuerzos, js/31): dónde quedó, con qué sacó, si juega en esta ronda y el mareo.
// `invocador` (2026-11-24): el token de quien la invocó (js/135).
// Dónde quedó quien entró (`e` = lo que devolvió OrdenTurnos.entrarConTirada): «después de X», «antes de Y», «en el primer lugar» o «en el N.º lugar»
// (sin nombrar a los que los demás no ven). También lo usa el ➕ Sumar al orden de turnos (js/136).
function ordenDondeQueda(e){
  const antes = e.orden[e.lugar - 1], despues = e.orden[e.lugar + 1];
  const nom = f => { const tt = f && tokens.get(f.id); return tt && !ocultoParaMesa(f.id) ? nombreDe(tt) : ''; };
  return e.lugar === 0 ? 'en el primer lugar' : nom(antes) ? `después de ${nom(antes)}` : nom(despues) ? `antes de ${nom(despues)}` : `en el ${e.lugar + 1}.º lugar`;
}
// 🐝 Su lugar ya pasó (P301 b): lo que dice la Crónica y la Mesa (la invocación, el refuerzo y el ➕ a mano, js/136).
function ordenLineaFinRonda(){ return 'Su lugar ya pasó en esta ronda: juega igual al final de esta ronda, y desde la próxima en su lugar.'; }
function invocacionAlOrdenLineas(e, r, sinMareo, invocador){
  const donde = ordenDondeQueda(e);
  return [
    r ? `🎲 Sacó ${fmt(num(r.total))} de iniciativa: queda ${donde}.` : 'Sin su Iniciativa a mano: entra al final del orden (el GM escribe el número).',
    ...(e.yaPaso ? [ordenLineaFinRonda()] : []),
    typeof mareoLineaEntrada === 'function' ? mareoLineaEntrada(invocador, sinMareo) : sinMareo ? 'Sin mareo: actúa en su primer turno.' : 'Con Mareo de invocación: en su primer turno no actúa (reacciona igual).',
  ];
}

function renderIniciativa(){
  mantBotonActualizar();   // ⟳ Pasar de ronda: solo sin lista de turnos en combate
  const caja = $('#iniciativa');
  if(!caja) return;
  // Herramienta flotante de siempre (decidido 2026-09-22: antes solo se
  // veía en modo combate y quedaba escondida sin avisar — ahora aparece
  // sola al entrar al mapa, en narrativo también; si no hay orden
  // cargado todavía, muestra el aviso de "Sin orden todavía").
  if(!fbMiembro){ caja.hidden = true; return; }
  caja.hidden = false;
  caja.classList.toggle('plegado', iniciativaPlegada);
  $('#iniciativa-plegar').textContent = iniciativaPlegada ? '+' : '—';
  $('#iniciativa-ronda').textContent = iniciativa.orden.length ? `Ronda ${fmt(iniciativa.ronda)}` : '';
  const lista = $('#iniciativa-lista');
  // Un token oculto ni siquiera aparece en la lista para los jugadores (el
  // turno pasa igual cuando le toca, pero no se nota que estuvo ahí).
  const visibles = iniciativa.orden.map((o, i) => ({o, i})).filter(({o}) => {
    const t = tokens.get(o.id);
    // Quien está en sigilo tampoco aparece para el bando rival (jugadores: los creeps; GM: los
    // personajes, salvo con su 👁): desaparece solo mientras dure el sigilo.
    // 🎭 (2026-10-09, js/29) Para los jugadores, un creep que todavía no vieron no existe; el que ya vieron no desaparece aunque se esconda.
    if(t && !soyGM && t.tipo === 'creep') return !(o.oculto || t.oculto) && creepConocido(t);
    if(t && ocultoPorSigiloParaMi(t)) return false;
    return soyGM || !(o.oculto || (t && t.oculto));   // oculto por el GM en la lista, o token oculto
  });
  // Minimizada, la cabecera dice de quién es el turno (dueño, 2026-10-11), si quien mira lo puede ver (si no, el título de siempre).
  const actual = visibles.find(x => x.i === iniciativa.turno), tActual = actual && tokens.get(actual.o.id);
  const titulo = $('#iniciativa-titulo');
  if(titulo){ titulo.textContent = iniciativaPlegada && tActual ? `⚔ Turno: ${nombreDe(tActual)}` : '⚔ Orden de turnos'; titulo.title = titulo.textContent; }
  // ✅ Terminar mi turno (dueño, 2026-10-22): en la cabecera, así se ve también con la lista achicada. Solo cuando le toca a un token mío.
  const finBtn = $('#ini-fin-turno');
  if(finBtn){
    if(finTurnoPedido && finTurnoPedido.paso !== iniciativa.paso) finTurnoPedido = null;   // el turno ya pasó
    const mio = finTurnoMio();
    finBtn.hidden = !mio;
    const esperando = !!(mio && finTurnoPedido && finTurnoPedido.tokenId === mio.id && Date.now() - finTurnoPedido.t < 20000);
    finBtn.disabled = esperando;
    finBtn.textContent = esperando ? '⏳ Terminando…' : '✅ Terminar turno';
  }
  if(!visibles.length){
    lista.innerHTML = `<div id="iniciativa-vacio">${soyGM ? 'Sin orden todavía: tocá "Traer tokens" y cargá las tiradas.' : 'El GM todavía no armó el orden.'}</div>`;
  }else{
    // En un turno libre (`libre`), la fila de quien lo juega va arriba de todo, aparte (`libreArriba`), y la lista gira desde quien tenía el turno.
    const lib = iniciativa.libre, kLib = lib ? iniciativa.orden.findIndex(o => o.id === lib.vuelve) : -1;
    const base = lib && kLib >= 0 ? kLib : iniciativa.turno;
    const filaIni = ({o, i}, ya, libreArriba) => {
      const t = tokens.get(o.id);
      const nombre = t ? nombreDe(t) : '(token borrado)';
      const v = t ? vinculo(t) : null;
      const mini = (v && v.miniatura) || (t && t.imagen) || '';
      const color = (t && t.color) || '#9A867E';
      // Al GM se le marca con 🙈 para acordarse de que ese no lo ven los
      // jugadores, aunque él sí lo vea en su propia lista.
      const oculto = !!(t && t.oculto) || !!o.oculto;
      // El valor lo edita el GM (cualquier fila) o el dueño (la propia): algo
      // pudo habérselo cambiado a mitad de combate. Sacar de la lista sigue
      // siendo solo del GM.
      const puede = puedeEditarIniciativa(t);
      const fuera = iniciativaFueraDeJuego(o.id);
      const libre = !!libreArriba;
      return `<div class="ini-fila${(lib ? libre : i === iniciativa.turno) ? ' activo' : ''}${fuera ? ' fuera' : ''}${ya ? ' ya' : ''}" data-ini-fila="${esc(o.id)}" title="${esc(nombre)}${libre ? ' — turno libre (no pasa el turno)' : ''}${fuera ? ' — caído/derrotado: fuera del orden de turnos hasta que se recupere' : ''}${ya && i > base ? ' — ya jugó esta ronda: si le vuelve a tocar, el GM decide si actúa de nuevo' : ''}${soyGM ? ' · clic derecho: es su turno' : ''}">
        <span class="ini-ficha" style="border-color:${esc(color)}">${mini ? `<img src="${esc(mini)}" alt="">` : esc(inicial(nombre))}</span>
        <span class="ini-nombre">${libre ? '⚡ ' : ''}${fuera ? '💀 ' : ''}${oculto ? '🙈 ' : ''}${(iniciativa.finRonda || []).includes(o.id) ? '<span title="Entró con su lugar ya pasado: en esta ronda juega al final; desde la próxima, en su lugar">⤵ </span>' : ''}${t && typeof reveladoPorOjo === 'function' && reveladoPorOjo(t) ? '<span title="Lo ves porque estás revelando lo oculto">👁</span> ' : ''}${t && enSigilo(t) && (soyGM || t.tipo !== 'creep') ? '🥷 ' : ''}${esc(nombre)}</span>` +   // 🏃 (2026-11-05, dueño: que se vea por qué quedó arriba)
        // ⚖ El sobrepeso restado (2026-11-23, P312): «⚖−3» al lado del número, con la cuenta (tirada − sobrepeso) al pasar el mouse.
        (num(o.sobre) > 0 ? `<span class="ini-sobre" title="Tiró ${fmt(num(o.valor) + num(o.sobre))} − ${fmt(num(o.sobre))} de sobrepeso = ${fmt(num(o.valor))}${(iniciativa.reubicar || []).includes(o.id) ? ' · su lugar se reacomoda al pasar de ronda' : ''}" style="font-size:11px;color:#e0a040;white-space:nowrap;margin-right:2px">⚖−${fmt(num(o.sobre))}</span>` : '') +
        (puede
          ? `<input class="ini-valor" type="number" step="1" value="${fmt(num(o.valor))}" data-ini-valor="${esc(o.id)}" title="Iniciativa${num(o.sobre) > 0 ? ` (ya tiene restado ${fmt(num(o.sobre))} de sobrepeso)` : ''}">`
          : `<span class="ini-valor">${fmt(num(o.valor))}</span>`) +
        (soyGM ? (() => { const p = iniDisplay.ids.indexOf(o.id), c = iniDisplay.corte, n = iniDisplay.ids.length;   // ▲ ▼ con el vecino que se ve, sin cruzar la línea
          return `<button type="button" class="ini-quitar" data-ini-subir="${esc(o.id)}" title="Cambiar de lugar con el de arriba"${p <= 0 || p === c ? ' disabled' : ''}>▲</button><button type="button" class="ini-quitar" data-ini-bajar="${esc(o.id)}" title="Cambiar de lugar con el de abajo"${p < 0 || p === n - 1 || p === c - 1 ? ' disabled' : ''}>▼</button>`; })() : '') +
        (soyGM ? `<button type="button" class="ini-quitar" data-ini-ocultar="${esc(o.id)}" title="${o.oculto ? 'Mostrarlo a los jugadores en la lista' : 'Ocultarlo a los jugadores en la lista'}">${o.oculto ? '🙈' : '👁'}</button><button type="button" class="ini-quitar" data-ini-quitar="${esc(o.id)}" title="Sacar de la lista">✕</button>` : '') +
      '</div>';
    };
    // La lista gira con el turno (dueño, 2026-10-06: «una línea para saber cuándo se da la vuelta completa»): arriba el que actúa, después los
    // que faltan en esta ronda, la línea «↻ Ronda N+1» y abajo, apagados, los que ya jugaron (vuelven a jugar en la ronda siguiente).
    // Los que ya jugaron esta ronda y quedaron más abajo (Degollar, una Demora, una flechita) se ven en su lugar de verdad, apagados (dueño,
    // 2026-10-29: «lo visual va a ser lo que regule los órdenes de las rondas»): si les vuelve a tocar, el GM decide si actúan de nuevo.
    const yaJugo = x => x.i > base && (iniciativa.actuaron || []).includes(x.o.id);
    const faltan = visibles.filter(x => x.i >= base), jugaron = visibles.filter(x => x.i < base);
    const arriba = lib ? visibles.find(x => x.o.id === lib.id) : null;
    iniDisplay = {ids: [...faltan, ...jugaron].map(x => x.o.id), corte: faltan.length};
    lista.innerHTML = (arriba ? filaIni(arriba, false, true) : '') + faltan.map(x => filaIni(x, yaJugo(x))).join('') +
      `<div class="ini-ronda" title="Acá termina la ronda: los de abajo ya jugaron y vuelven a jugar en la ronda siguiente">↻ Ronda ${fmt(iniciativa.ronda + 1)}</div>` +
      jugaron.map(x => filaIni(x, true)).join('');
  }
  $('#iniciativa-pie').innerHTML = soyGM
    ? '<button type="button" class="btn" id="ini-traer" title="Poner en la lista todos los tokens del mapa">Traer tokens</button>' +
      '<button type="button" class="btn" id="ini-tirar" title="Con un solo botón tirás la iniciativa de TODOS los creeps de la lista y se carga junto a cada nombre (los jugadores tiran la de sus personajes con su propio botón)">🎲 Tirar iniciativa de los creeps</button>' +
      '<button type="button" class="btn" id="ini-ordenar" title="Ordenar de mayor a menor">Ordenar</button>' +
      (iniciativa.libre ? `<button type="button" class="btn primary" id="ini-siguiente" title="Termina el turno libre: el turno vuelve a quien lo tenía, sin recargar ni bajar nada">↩ Volver${tokens.get(iniciativa.libre.vuelve) && visibles.some(x => x.o.id === iniciativa.libre.vuelve) ? ` a ${esc(nombreDe(tokens.get(iniciativa.libre.vuelve)))}` : ''}</button>`   /* 🙈 (2026-11-24) a quien no ve al que vuelve (un escondido), sin su nombre */
        : '<button type="button" class="btn primary" id="ini-siguiente" title="Pasar al siguiente en el orden">▶ Siguiente</button>') +
      (iniciativa.orden.length && !OrdenTurnos.porIniciar(iniciativa) ? `<button type="button" class="btn" id="ini-pasar-ronda"${pasandoRonda ? ' disabled aria-busy="true"' : ''} title="Saltea los turnos que faltan en esta ronda (pasan sin jugar), pasa el Mantenimiento de la ronda y vuelve al primero del orden">${pasandoRonda ? '⏳ Pasando de ronda…' : '⏭ Pasar de ronda'}</button>` : '') +
      '<button type="button" class="btn peligro" id="ini-limpiar" title="Vaciar el orden de turnos">Limpiar</button>' +
      // ▶ Iniciar combate (dueño, 2026-11-20): aparece al apretar Ordenar y pulsa hasta que se aprieta; con el combate en curso no se ofrece.
      (OrdenTurnos.porIniciar(iniciativa) ? `<button type="button" class="btn ini-iniciar" id="ini-iniciar"${iniciandoCombate ? ' disabled aria-busy="true"' : ''} title="Empieza el combate: todos los del orden con los No2 llenos y arranca el turno del primero de la lista (su inicio de turno de siempre)">${iniciandoCombate ? `⏳ Iniciando combate…${iniciandoTxt ? ' ' + esc(iniciandoTxt) : ''}` : '▶ Iniciar combate'}</button>` : '')
    : (fbMiembro ? '<button type="button" class="btn primary" id="ini-tirar" title="Tirar la iniciativa de tu personaje y cargarla junto a su nombre">🎲 Tirar iniciativa</button>' : '');
  $('#iniciativa-pie').classList.toggle('iniciando', !!iniciandoCombate);   // ⏳ los demás botones, apagados mientras inicia
  conectarIniciativa();
  iniciativaEncuadrar();
}

/* ✅ Terminar mi turno (dueño, 2026-10-22: «que los jugadores puedan terminar su turno… un botón en el menú de iniciativa, visible aun si la
   tabla está minimizada»). Las reglas de Firestore no dejan que un jugador cambie `turno` (iniciativaPropia): el jugador publica un momento
   `turno-fin` {tokenId, paso} y la pantalla del GM, al recibirlo, lo toma (una transacción: una sola pantalla del GM) y, si sigue siendo el
   turno de ese token, hace ▶ Siguiente por él (iniciativaSiguiente: lo mismo que el botón del GM). La Crónica lo cuenta a todos:
   «Fulano terminó su turno» → «El GM pasó el turno». Si no hay ninguna pantalla del GM abierta, a los 20 s el botón se vuelve a habilitar. */
let finTurnoPedido = null;   // {tokenId, paso, t}
function finTurnoMio(){
  if(soyGM || !fbMiembro || !iniciativa.orden.length) return null;
  const id = iniciativa.libre ? iniciativa.libre.id : (iniciativa.orden[iniciativa.turno] || {}).id;
  const t = id && tokens.get(id);
  return t && t.tipo !== 'creep' && puedoMover(t) ? {id, t} : null;
}
async function finTurnoPedir(){
  const m = finTurnoMio();
  if(!m || typeof momentoAbrir !== 'function') return;
  finTurnoPedido = {tokenId: m.id, paso: iniciativa.paso, t: Date.now()};
  renderIniciativa();
  setTimeout(renderIniciativa, 20500);
  const id = await momentoAbrir({tipo: 'turno-fin', icono: '⏭', titulo: `${nombreDe(m.t)} terminó su turno`, estado: 'esperandoGM',
    datos: {tokenId: m.id, paso: Math.max(0, Math.round(num(iniciativa.paso))), nombre: nombreDe(m.t), centro: true}});
  if(!id){ finTurnoPedido = null; renderIniciativa(); toast('No se pudo avisar al GM'); return; }
  toast('Terminaste tu turno: la pantalla del GM pasa al siguiente');
}
const finTurnoHechos = new Set();
async function finTurnoDelJugador(id, d){   // la pantalla del GM (js/16 momentoRecibido)
  if(!soyGM || finTurnoHechos.has(id)) return;
  finTurnoHechos.add(id);
  const dt = d.datos || {}, ref = coleccionMomentos().doc(id);
  let tomado = false;
  try{ await fbDb.runTransaction(async tx => { const s = await tx.get(ref); if(!s.exists || s.data().estado !== 'esperandoGM') return; tx.update(ref, {estado: 'pasando'}); tomado = true; }); }
  catch(err){ console.error('No se pudo tomar el fin de turno:', err); return; }
  if(!tomado) return;   // otra pantalla del GM ya lo pasó
  const esperado = iniciativa.libre ? iniciativa.libre.id : (iniciativa.orden[iniciativa.turno] || {}).id;
  if(esperado !== dt.tokenId || num(dt.paso) !== num(iniciativa.paso)){ momentoActualizar(id, {estado: 'listo', resultado: 'Su turno ya había pasado.'}); return; }
  try{ await iniciativaSiguiente(); momentoActualizar(id, {estado: 'listo', resultado: 'El GM pasó el turno.'}); }
  catch(err){ console.error(err); momentoActualizar(id, {estado: 'listo', resultado: 'No se pudo pasar el turno: el GM lo pasa a mano.'}); }
}
function conectarIniciativa(){
  const caja = $('#iniciativa');
  const fin = $('#ini-fin-turno');
  if(fin) fin.onclick = e => { e.stopPropagation(); finTurnoPedir(); };
  caja.querySelectorAll('[data-ini-fila]').forEach(f => f.onclick = e => {
    if(e.target.closest('input,button')) return;
    // Se selecciona el token igual que si se hubiera hecho clic sobre él (se despliega su menú alrededor), se centra la vista y
    // un anillo pulsante lo marca unos segundos, para que quede clarísimo cuál es el token de ese nombre (2026-09-24).
    const id = f.dataset.iniFila;
    seleccionar(id);
    hudCerrar();
    const t = tokens.get(id);
    if(t) centrarEn(hexCentro(t.col, t.fila).x, hexCentro(t.col, t.fila).y);
    iniResaltado = {id, hasta: Date.now() + 3000};
    pedirDibujo();
  });
  if(soyGM) caja.querySelectorAll('[data-ini-fila]').forEach(f => f.oncontextmenu = e => {
    if(e.target.closest('input')) return;
    e.preventDefault();
    iniciativaDarTurno(f.dataset.iniFila);
  });
  caja.querySelectorAll('[data-ini-subir]').forEach(b => b.onclick = () => iniciativaMover(b.dataset.iniSubir, -1));
  caja.querySelectorAll('[data-ini-bajar]').forEach(b => b.onclick = () => iniciativaMover(b.dataset.iniBajar, 1));
  const tirar = $('#ini-tirar');
  if(tirar) tirar.onclick = iniciativaTirar;
  caja.querySelectorAll('[data-ini-valor]').forEach(inp => {
    inp.onchange = () => {
      const id = inp.dataset.iniValor;
      const anterior = iniciativa.orden.find(o => o.id === id);
      const nuevo = num(inp.value);
      if(!anterior || anterior.valor === nuevo) return;
      const orden = iniciativa.orden.map(o => o.id === id ? {...o, valor: nuevo} : o);
      guardarIniciativa({orden});
      publicarCambioIniciativa(id, anterior.valor, nuevo);
    };
    inp.onkeydown = e => { if(e.key === 'Enter'){ e.preventDefault(); inp.blur(); } };
  });
  caja.querySelectorAll('[data-ini-ocultar]').forEach(b => b.onclick = () => {
    // Oculta (o muestra) esa fila a los jugadores; el turno pasa igual cuando le toca.
    const orden = iniciativa.orden.map(o => o.id === b.dataset.iniOcultar ? {...o, oculto: !o.oculto} : o);
    guardarIniciativa({orden});
  });
  // ✕ (2026-11-24, P328): si era su turno, termina y empieza el del siguiente; queda afuera para Traer tokens; línea en la Mesa (js/136).
  caja.querySelectorAll('[data-ini-quitar]').forEach(b => b.onclick = () => ordenSacarDeTabla(b.dataset.iniQuitar));
  const traer = $('#ini-traer');
  if(traer) traer.onclick = iniciativaPonerTodos;
  const ordenar = $('#ini-ordenar');
  if(ordenar) ordenar.onclick = () => iniciativaOrdenar();   // (js/86; hasta el 2026-11-20 acá salía el cartel de la Prisa)
  const siguiente = $('#ini-siguiente');
  if(siguiente) siguiente.onclick = () => iniciativaSiguienteBoton();
  const pasarRonda = $('#ini-pasar-ronda');
  if(pasarRonda) pasarRonda.onclick = () => iniciativaPasarRonda();
  const iniciar = $('#ini-iniciar');
  if(iniciar) iniciar.onclick = () => iniciativaIniciarCombate();
  const limpiar = $('#ini-limpiar');
  if(limpiar) limpiar.onclick = async () => { if(await Confirmar.preguntar('¿Vaciar el orden de turnos?', {titulo: 'Vaciar turnos', si: 'Vaciar', peligro: true})) guardarIniciativa({orden: [], turno: 0, ronda: 1, actuaron: [], empezados: [], demoras: {}, repite: null, libre: null, ordenPendientes: [], ordenUsados: null, mufas: {}, reubicar: [], finRonda: [], sacados: [], ...OrdenTurnos.SIN_INICIAR}); };
}

/* El orden de turnos flota sobre el mapa y se arrastra desde la cabecera (mismo
   patrón que la Bitácora y la Mesa): así no queda tapado por los botones del
   dock de la izquierda. La posición (relativa al mapa) se guarda por navegador. */
var iniciativaPos = null;   // (var: renderIniciativa puede correr antes de esta línea)
try{ iniciativaPos = JSON.parse(localStorage.getItem('mapa-iniciativa-posicion') || 'null'); }catch(e){}
function iniciativaEncuadrar(){
  const caja = $('#iniciativa'), marco = $('#lienzo-caja');
  if(!iniciativaPos){ caja.classList.remove('movida'); caja.style.left = caja.style.top = ''; return; }
  if(caja.hidden || !caja.offsetWidth) return;
  caja.classList.add('movida');
  const x = Math.max(0, Math.min(iniciativaPos.x, marco.clientWidth - caja.offsetWidth));
  const y = Math.max(0, Math.min(iniciativaPos.y, marco.clientHeight - caja.offsetHeight));
  caja.style.left = x + 'px'; caja.style.top = y + 'px';
}
window.addEventListener('resize', iniciativaEncuadrar);
{
  const caja = $('#iniciativa'), cab = $('#iniciativa-cab'), marco = $('#lienzo-caja');
  let arrastre = null, recienMovida = false;
  cab.addEventListener('pointerdown', e => {
    if(e.button !== 0 || e.target.closest('input, #ini-fin-turno')) return;
    const r = caja.getBoundingClientRect(), m = marco.getBoundingClientRect();
    arrastre = {px: e.clientX, py: e.clientY, x: r.left - m.left, y: r.top - m.top, movio: false};
    cab.setPointerCapture(e.pointerId);
  });
  cab.addEventListener('pointermove', e => {
    if(!arrastre) return;
    const dx = e.clientX - arrastre.px, dy = e.clientY - arrastre.py;
    if(!arrastre.movio && Math.abs(dx) + Math.abs(dy) < 5) return;
    arrastre.movio = true;
    caja.classList.add('arrastrando');
    iniciativaPos = {x: arrastre.x + dx, y: arrastre.y + dy};
    iniciativaEncuadrar();
  });
  const soltar = () => {
    if(!arrastre) return;
    recienMovida = arrastre.movio;
    arrastre = null;
    caja.classList.remove('arrastrando');
    if(recienMovida){
      iniciativaPos = {x: parseFloat(caja.style.left), y: parseFloat(caja.style.top)};
      try{ localStorage.setItem('mapa-iniciativa-posicion', JSON.stringify(iniciativaPos)); }catch(e){}
    }
  };
  cab.addEventListener('pointerup', soltar);
  cab.addEventListener('pointercancel', soltar);
  // Clic (sin arrastrar): achica o agranda.
  cab.onclick = e => {
    if(recienMovida){ recienMovida = false; return; }
    if(e.target.closest('input, #ini-fin-turno')) return;
    iniciativaPlegada = !iniciativaPlegada;
    try{ localStorage.setItem('mapa-iniciativa-plegada', iniciativaPlegada ? '1' : ''); }catch(e2){}
    renderIniciativa();
  };
}

function escucharModo(){
  escucharModo.listo = false;
  cortarModo = fbDb.doc(fbRutaCampana(rutaMapaEstado('modo'))).onSnapshot(doc => {
    const nuevo = doc.exists && doc.data().modo === 'combate' ? 'combate' : 'narrativo';
    if(nuevo !== modoMapa && escucharModo.listo) toast(nuevo === 'combate' ? '⚔ Modo combate: moverse gasta No2' : '🌿 Modo narrativo: moverse no gasta No2');
    // ▶ El mapa volvió a narrativo: el combate terminó. El próximo se vuelve a iniciar con su botón (después de Ordenar).
    if(soyGM && escucharModo.listo && modoMapa === 'combate' && nuevo === 'narrativo' && (iniciativa.iniciado === true || iniciativa.porIniciar)) guardarIniciativa({...OrdenTurnos.SIN_INICIAR});
    escucharModo.listo = true;
    modoMapa = nuevo;
    renderModo();
    renderIniciativa();
    renderPanel();
    pedirDibujo();
  }, err => console.error('Error escuchando el modo del mapa:', err));
}

$('#modo-switch').onclick = () => { if(soyGM) modoPasarA(modoMapa === 'combate' ? 'narrativo' : 'combate'); };
// Pasar el mapa a Combate o a narrativo (el switch de arriba, y «▶ Iniciar combate» si el mapa estaba en narrativo). → true si se pudo.
async function modoPasarA(nuevo){
  if(!soyGM) return false;
  try{
    await TokensAuto.ponerModo(mapaMostrado, nuevo);   // la misma escritura que usa el fin del combate para volver a narrativo (comun/tokens-auto.js)
    if(nuevo === 'combate' && typeof Registro !== 'undefined') await Registro.recordar().catch(err => console.error('Registro: el recordatorio', err));   // 🗂 ¿registro nuevo? (2026-11-04)
    if(nuevo === 'combate') ataquesACeroAlEmpezar().catch(err => console.error('Las cuentas de ataques al empezar el combate:', err));   // ⚔ (abajo)
    if(nuevo === 'combate') abrirEstadoDelGrupo('combate');   // 🩺 los turnos de los estados que traen, para ajustarlos (js/81)
    return true;
  }catch(err){
    console.error('No se pudo cambiar el modo:', err);
    toast('No se pudo cambiar el modo del mapa');
    return false;
  }
}

/* ⚔ Empieza un combate: la cuenta de ataques «de este turno» arranca en cero para todos (dueño, 2026-11-20, jugando: «Rocardo empezó su turno, el primer
   turno del combate… cuando quiso atacar le aparecía como que ya había atacado una vez, que le costaba 10 nitros. Pero él no había atacado»). Esa cuenta
   la vacía el inicio del turno de cada uno, y al primero del orden de un combate nuevo nadie le empieza el turno: le quedaba la del combate anterior
   (comprobado con clics: atacar, pasar a narrativo, volver a combate → el primer ataque costaba como el segundo). La pantalla del GM, al pasar el mapa a
   Combate, se la vacía a los personajes (con sus invocaciones) y a los creeps con token en este mapa — Combatiente.ataquesACeroPj / ataquesACeroCreep:
   solo las cuentas por turno; No2, vida, SP, estados y cooldowns quedan como estaban. Solo escribe a quien tenía algo anotado. */
async function ataquesACeroAlEmpezar(){
  if(!soyGM) return;
  const hechos = new Set();
  for(const t of [...tokens.values()]){
    if(!t || !t.fichaId) continue;
    const esCreep = t.tipo === 'creep', fichaId = esCreep ? t.fichaId : String(t.fichaId).split(SEP_INVOCACION)[0];
    if(hechos.has(fichaId)) continue;
    hechos.add(fichaId);
    try{
      if(esCreep){
        const sc = creepPrivadoDe(fichaId);
        if(sc && !Combatiente.ataquesACeroCreep(structuredClone(sc))) continue;   // no tenía nada anotado: no se escribe
        await modificarCreep(fichaId, c => Combatiente.ataquesACeroCreep(c));
      }else if(t.tipo === 'pj' && fichasPub.has(fichaId)) await editarPersonajeMapa(fichaId, S => Combatiente.ataquesACeroPj(S));
    }catch(err){ console.error('No se pudo poner en cero la cuenta de ataques de', nombreDe(t), err); }
  }
}

// Nitros que cuesta mover este token: los PJ vinculados a su ficha y los
// creeps vinculados (no las invocaciones ni los NPC). null = se mueve sin
// costo, como también una ficha o creep que todavía no tiene No2 (abrila
// una vez, o abrí gm-tools).
/* Terreno lento (2026-10-04, dueño: arena movediza): una trampa ya disparada con `lento: N` adentro del JSON de trampaEstado hace que cada
   paso que SALE de una de sus casillas cueste N No2 (o lo de siempre, si es más: Rengo). → el costo acumulado de cada paso de la ruta. */
// También una zona con `lento` en su zonaEstado (2026-10-07, Varita de arena movediza).
function lentoEn(col, fila){
  let n = 0;
  elementos.forEach(el => {
    const json = el.trampa && el.disparada && el.trampaEstado ? el.trampaEstado : el.zona && el.zonaEstado ? el.zonaEstado : '';
    if(!json) return;
    let e = null; try{ e = JSON.parse(json); }catch(x){}
    if(!e || !(num(e.lento) > 0)) return;
    if(celdasDeElemento(el).some(c => c.col === col && c.fila === fila)) n = Math.max(n, num(e.lento));
  });
  return n;
}
// `gratis` (2026-10-04, Pasos gratis): los primeros casilleros de la ruta no cuestan (los que le quedan a ese token en este turno).
// `recargo` (2026-10-04, estado Lento): lo que se suma al primer casillero (el primero del turno cuesta el doble).
// `levita` (Levitar, 2026-10-06): los primeros casilleros de la ruta (los que le quedan levitando en este turno) no tocan el piso: el terreno
// lento no los frena.
// `ext` (Extenuado, Maldición extenuante, 2026-10-12): además, 1 No2 más por stack cada 2 casillas que se pagan (la 2.ª, la 4.ª…).
// `sprint` (Sprint, 2026-10-13): los primeros casilleros pagados (después de los gratis) ya están pagos: cuestan solo el recargo (Rengo, terreno lento).
// `miedo` (😱 Miedo y 😱 Pánico, 2026-11-01, dueño: «acercarse a 3 casilleros o menos cuesta doble nitro cada movimiento»): las casillas de quienes
// lo asustaron (con Pánico, las de todos sus rivales a la vista). Un paso que termina a MIEDO_RADIO (3) o menos de uno de ellos y no se aleja de él
// (queda a la misma distancia o más cerca) cuesta el doble de lo normal; uno de los pasos gratis cuesta lo que costaría pagado (el doble de 0 sería 0).
// Alejarse no cuesta extra. (Antes, 2026-10-18: cada paso hacia él, 2 No2.)
function costoPasos(ruta, porCasillero, gratis, recargo, levita, ext, sprint, miedo){
  const acc = [];
  let s = 0, pagados = 0, sp = Math.max(0, num(sprint));
  for(let i = 1; i < (ruta || []).length; i++){
    const asusta = porCasillero > 0 && miedoPasoAsusta(ruta[i - 1], ruta[i], miedo);
    if(i <= num(gratis) && asusta) s += porCasillero;
    if(i > num(gratis)){
      const lento = porCasillero > 0 && i > num(levita) ? lentoEn(ruta[i - 1].col, ruta[i - 1].fila) : 0;
      const paso = porCasillero > 0 ? Math.max(porCasillero, lento) * (asusta ? 2 : 1) : 0;
      s += sp > 0 && porCasillero > 0 ? (sp--, Math.max(0, paso - 1)) : paso;
      if(porCasillero > 0 && ++pagados % 2 === 0) s += Math.max(0, num(ext));
    }
    if(i === 1) s += num(recargo);
    acc.push(s);
  }
  return acc;
}
const costoRuta = (ruta, porCasillero, pasos, gratis, recargo, levita, ext, sprint, miedo) => { const a = costoPasos((ruta || []).slice(0, pasos + 1), porCasillero, gratis, recargo, levita, ext, sprint, miedo); return a.length ? a[a.length - 1] : 0; };

/* Quién ya se movió en este turno (2026-10-04, los pies): Lento cobra doble el primer casillero del turno y Pasos de baile suma Evasión si ya se
   movió. Como los Pasos gratis, lo anota esta pantalla (y el navegador, por si se recarga). El duelo lo pregunta con window.mapaSeMovio. */
const movidosTurno = new Set();
try{ JSON.parse(localStorage.getItem('movidos-turno') || '[]').forEach(k => movidosTurno.add(k)); }catch(e){}
const seMovioEsteTurno = id => !!id && movidosTurno.has(`${id}@${Math.round(num(mantenimientoNumero))}`);
const seMovioTurnoAnterior = id => !!id && movidosTurno.has(`${id}@${Math.round(num(mantenimientoNumero)) - 1}`);   // Apuntada firme (js/35, 2026-10-11)
function marcarMovido(id, si){
  const k = `${id}@${Math.round(num(mantenimientoNumero))}`;
  if(si === false) movidosTurno.delete(k); else movidosTurno.add(k);
  const ahora = Math.round(num(mantenimientoNumero));   // se guardan este turno y el anterior (la Apuntada firme mira los dos)
  try{ localStorage.setItem('movidos-turno', JSON.stringify([...movidosTurno].filter(x => x.endsWith('@' + ahora) || x.endsWith('@' + (ahora - 1))))); }catch(e){}
  if(typeof quietoMarcar === 'function') quietoMarcar(id, si);   // 💍 y en la partida, para los anillos de «no te moviste» (js/126, 2026-11-20)
}
window.mapaSeMovio = tokenId => seMovioEsteTurno(tokenId);
// 🔮 La ronda de combate (2026-10-18, la Estatuilla del Gauchito Gil: una vez por ronda): el número de Mantenimiento de esta partida, que sube al
// pasar de ronda (a mano o con ▶ Siguiente al dar la vuelta). FichaAcciones.tirarValorStat lo pregunta.
window.rondaDeCombate = () => `${FB_CAMPANA || ''}:${Math.round(num(mantenimientoNumero))}`;
// Lento: lo que se suma al primer casillero si todavía no se movió en este turno (0 si no está Lento o si no se puede mover).
// El «primer paso doble» de unas piernas pesadas (2026-10-06, dueño: «Movimiento −1» traducido) hace lo mismo; no se suman entre sí.
function lentoRecargo(t, porCasillero){
  if(!(porCasillero > 0) || seMovioEsteTurno(idDeToken(t))) return 0;
  const lento = (typeof confusionEstadosDe === 'function' ? confusionEstadosDe(t) : []).some(e => e && e.activo !== false && (e.lento || /^lento$/i.test(String(e.nombre || '').trim())));
  return lento || statPiesDe(t, 'pasodoble') > 0 ? porCasillero : 0;
}

/* Pasos gratis (2026-10-04, dueño): cuántos le quedan a un token en este turno (de Mantenimiento a Mantenimiento). Los usados se anotan en esta
   pantalla (y en el navegador, por si se recarga): los mueve casi siempre la misma persona. */
const pasosGratisUsados = new Map();
const pasosGratisClave = id => `${id}@${Math.round(num(mantenimientoNumero))}`;
try{ const g = JSON.parse(localStorage.getItem('pasos-gratis') || '{}'); Object.entries(g).forEach(([k, v]) => pasosGratisUsados.set(k, num(v))); }catch(e){}
// Lo público de una invocación (lo publica la ficha de su dueño en resumen.invocaciones), o null.
function resumenDeInv(t){
  if(!t || !t.fichaId || !String(t.fichaId).includes(SEP_INVOCACION)) return null;
  const [base, invId] = String(t.fichaId).split(SEP_INVOCACION);
  const r = (fichasPub.get(base) || {}).resumen || {};
  return (r.invocaciones || []).find(i => i && i.id === invId) || null;
}
function pasosGratisDe(t){
  if(!t || !t.fichaId) return 0;
  if(t.tipo === 'creep'){ const sc = creepPrivadoDe(t.fichaId); return sc && typeof CreepCalculo !== 'undefined' ? Math.max(0, Math.round(num(CreepCalculo.modTotal(sc, 'pasosgratis')))) : 0; }
  if(String(t.fichaId).includes(SEP_INVOCACION)){ const ri = resumenDeInv(t); return Math.max(0, Math.round(num(ri && ri.pasosGratis))); }
  const f = fichasPub.get(t.fichaId);
  return Math.max(0, Math.round(num(f && f.resumen && f.resumen.pasosGratis)));
}
function pasosGratisRestantes(id){
  const t = tokens.get(id);
  return Math.max(0, pasosGratisDe(t) - num(pasosGratisUsados.get(pasosGratisClave(id))));
}
function pasosGratisUsar(id, n){
  if(!n) return;   // negativo: los devuelve (Ctrl+Z)
  const k = pasosGratisClave(id);
  pasosGratisUsados.set(k, Math.max(0, num(pasosGratisUsados.get(k)) + n));
  try{ const g = {}; pasosGratisUsados.forEach((v, kk) => { if(kk.endsWith('@' + Math.round(num(mantenimientoNumero)))) g[kk] = v; }); localStorage.setItem('pasos-gratis', JSON.stringify(g)); }catch(e){}
}
const idDeToken = t => { for(const [id, x] of tokens) if(x === t) return id; return ''; };
// Sprint (2026-10-13): los casilleros pagos que se usaron se descuentan del estado del personaje (y el estado se va al llegar a 0).
async function sprintUsar(t, n){
  if(!(n > 0) || !t || t.tipo !== 'pj' || String(t.fichaId).includes(SEP_INVOCACION) || typeof editarPersonajeMapa !== 'function') return;
  try{
    await editarPersonajeMapa(t.fichaId, S => {
      const e = (S.efectos || []).find(x => x && x.activo !== false && num(x.sprint) > 0);
      if(!e) return false;
      e.sprint = Math.max(0, num(e.sprint) - n);
      if(e.sprint <= 0) S.efectos = S.efectos.filter(x => x !== e);
      return ['efectos'];
    });
  }catch(err){ console.error('No se pudo descontar el Sprint:', err); }
}

function costoMoverDe(t){
  if(modoMapa !== 'combate') return null;  // en modo narrativo se mueve sin contar No2
  if(t && t.tipo === 'creep') return costoMoverCreep(t);
  if(t && t.fichaId && String(t.fichaId).includes(SEP_INVOCACION)) return costoMoverInv(t);
  if(!t || t.tipo !== 'pj' || !t.fichaId) return null;
  const f = fichasPub.get(t.fichaId);
  const r = f && f.resumen;
  if(!r || r.costoMover === undefined) return null;
  const sprint = (r.estados || []).reduce((m, e) => Math.max(m, num(e && e.sprint)), 0);   // Sprint (2026-10-13): los casilleros pagos que le quedan
  return {porCasillero: num(r.costoMover), disponibles: num(r.nitros), gratis: pasosGratisRestantes(idDeToken(t)), recargo: lentoRecargo(t, num(r.costoMover)), levita: levitarRestante(t), ext: num(r.extenuado), tormenta: num(r.tormenta), sprint, miedo: miedoFuentes(t)};
}
/* Stats de los pies (2026-10-06) de cualquier token: un personaje o una invocación, de lo que publica la ficha de su dueño; un creep, de sus datos. */
function statPiesDe(t, st){
  if(!t || !t.fichaId) return 0;
  if(t.tipo === 'creep'){ const sc = soyGM ? creepPrivadoDe(t.fichaId) : null; return sc ? num(CreepCalculo.modTotal(sc, st)) : 0; }
  const ri = resumenDeInv(t);
  if(ri) return num(ri[st]);
  const f = fichasPub.get(t.fichaId);
  return num(f && f.resumen && f.resumen[st]);
}
/* Levitar (pies, 2026-10-06, dueño: «no tocás el suelo»): los primeros N casilleros que se mueve en cada turno no tocan el piso — el terreno
   lento no lo frena y no pisa ni detecta trampas (el terreno incendiado, desde el 2026-11-25 de piso y aire, y las zonas del aire sí lo alcanzan) —; al terminar su turno toca el piso (si quedó parado sobre una
   trampa, se dispara: `levitarAterrizar`, desde el fin del turno). Los usados se anotan en esta pantalla, como los Pasos gratis. */
const levitarUsados = new Map();
const levitarRestante = t => Math.max(0, Math.round(statPiesDe(t, 'levitar')) - num(levitarUsados.get(pasosGratisClave(idDeToken(t)))));
// 🕊 Vuela (2026-10-16): el estado pone Levitar en VUELA_LEVITAR — nunca toca el piso (no aterriza), pasa por encima de los tokens (js/06
// celdasQueTapan) y, si cruza a un rival, antes le da su ataque de oportunidad (js/17 oportunidadCorte).
const VUELA_LEVITAR = 100;
const vuelaToken = t => statPiesDe(t, 'levitar') >= VUELA_LEVITAR;
const levitarUsar = (id, n) => { if(n > 0){ const k = pasosGratisClave(id); levitarUsados.set(k, num(levitarUsados.get(k)) + n); } };
async function levitarAterrizar(tokenId){
  const t = tokens.get(tokenId);
  if(!t || !(statPiesDe(t, 'levitar') > 0) || vuelaToken(t) || typeof trampaResolver !== 'function') return;   // 🕊 el que vuela no aterriza
  if(typeof zonaRevisarToken === 'function') zonaRevisarToken(t, false, false, true);   // las zonas del piso donde quedó parado (2026-10-07)
  let pisada = null;
  elementos.forEach((el, id) => { if(!pisada && el.trampa && !el.disparada && trampaDispara(t, el) && (typeof trampaCeldasDisparo === 'function' ? trampaCeldasDisparo(el) : celdasDeElemento(el)).some(c => c.col === t.col && c.fila === t.fila)) pisada = {id, el}; });
  if(!pisada) return;
  trampaPendiente = {tokenId, tipo: 'pisa', id: pisada.id, el: pisada.el, celda: {col: t.col, fila: t.fila}, desde: {col: t.col, fila: t.fila}};
  await trampaResolver();
}

// Una invocación paga moverse como cualquiera (dueño, 2026-10-04: las reglas de combate, iguales para todos): lo que publica la ficha de su dueño
// (FichaResumen.invCostoMover). Sin ese dato (una ficha que todavía no se volvió a guardar), se mueve sin contar, como antes.
function costoMoverInv(t){
  const ri = resumenDeInv(t);
  if(!ri || ri.costoMover === undefined) return null;
  const por = num(ri.costoMover);
  return {porCasillero: por, disponibles: num(ri.nitros), gratis: pasosGratisRestantes(idDeToken(t)), recargo: lentoRecargo(t, por), levita: levitarRestante(t), ext: num(ri.extenuado), tormenta: num(ri.tormenta), miedo: miedoFuentes(t)};
}

// Mismas reglas que la ficha publica en resumen.costoMover: 1 por
// casillero, 2 con Rengo, 0 (no se mueve) con Inmovilizado.
function costoMoverCreep(t){
  if(!soyGM || !t.fichaId) return null;
  const sc = creepPrivadoDe(t.fichaId);
  if(!sc || sc.nitros === undefined || sc.nitros === null) return null;
  const activos = (Array.isArray(sc.estados) ? sc.estados : []).filter(e => e && e.activo !== false);
  const porCasillero = activos.some(e => e.inmovilizado) ? 0 : activos.some(e => e.rengo) ? 2 : 1;
  return {porCasillero, disponibles: num(sc.nitros), gratis: pasosGratisRestantes(idDeToken(t)), recargo: lentoRecargo(t, porCasillero), levita: levitarRestante(t), ext: Combatiente.extenuado(sc.estados), tormenta: Combatiente.tormenta(sc.estados), miedo: miedoFuentes(t)};
}

// 🎮 El GM tomó el control de este personaje (la ficha publica resumen.control = su uid, 2026-09-30): lo usa como si fuera su
// dueño — lo mueve pagando No2, abre su Botonera, le cambia la vida y le pasa el turno.
function controloFicha(fichaId){
  if(!soyGM || !fichaId || !fbUsuario) return false;
  const f = fichasPub.get(String(fichaId).split(SEP_INVOCACION)[0]);
  return !!(f && f.resumen && f.resumen.control === fbUsuario.uid);
}
/* 🎮 (dueño, 2026-11-11: «un jugador no debería poder usar su propio token mientras lo controla el GM… sólo observar»): ¿el GM tiene el control
   de este personaje (o de una invocación suya) y yo soy su dueño? Mientras tanto el dueño solo mira: no lo mueve, no abre su Botonera, no le
   cambia la vida ni los estados; ve el aviso fijo de abajo (avisoControlPintar). La regla pura: Combatiente.controlAjeno. */
function controlAjeno(fichaId){
  if(!fichaId || !fbUsuario) return false;
  const f = fichasPub.get(String(fichaId).split(SEP_INVOCACION)[0]);
  return Combatiente.controlAjeno(f && f.resumen, fbUsuario.uid, soyGM);
}
/* ⏸ Partida en pausa (dueño, 2026-10-16): un jugador mira el mapa como siempre —arrastrarlo, zoom, tocar cualquier token y ver lo mismo que
   en una sesión (su menú, sus estados, la tarjeta de un creep)— pero desde el mapa no cambia nada: ni mover ni girar, ni vida, No2 o estados,
   ni los ajustes del token. Su ficha sí la puede tocar (lo que cambie le queda anotado al GM, comun/pausa.js). Lo usan los permisos de abajo. */
const pausaSoloMirar = () => typeof Pausa !== 'undefined' && Pausa.activa() && !soyGM;
function puedoMover(t){
  if(!t || !fbUsuario || pausaSoloMirar()) return false;
  return t.tipo === 'creep' ? soyGM : ((t.duenoUid === fbUsuario.uid && !controlAjeno(t.fichaId)) || controloFicha(t.fichaId));
}
function puedoMoverLibre(t){
  if(!t || !fbUsuario || pausaSoloMirar()) return false;
  return soyGM || (t.tipo === 'pj' && t.duenoUid === fbUsuario.uid && !controlAjeno(t.fichaId));
}
function activarMoverLibre(id){
  moverLibre = moverLibre === id ? null : id;
  // 🙈 (2026-11-05, prueba en el mapa) Antes iba a la Mesa, a la vista de todos, y delataba al que está en sigilo: ahora le llega solo al GM.
  if(moverLibre && !soyGM){
    const t = tokens.get(id);
    if(t && typeof enSigilo === 'function' && enSigilo(t) && typeof momentoAbrir === 'function'){
      momentoAbrir({tipo: 'fuera-de-turno', icono: '🙈', titulo: `${nombreDe(t)} (en sigilo) entró en 🦶 Mover libre`, resultado: 'Se mueve sin gastar No2 mientras está en sigilo.', estado: 'listo',
        datos: {soloGM: true, aviso: true, boton: 'Entendido', veredicto: {tono: 'neutro', grande: 'Mover libre en sigilo', chico: nombreDe(t)}}});
    }
  }
  if(moverLibre) toast('Mover libre: arrastrá el token o tocá la casilla de destino (Esc, clic derecho o el mismo botón lo apagan)');
  lienzo.style.cursor = moverLibre ? 'crosshair' : 'default';
  pedirDibujo();
}
function puedoBorrar(t){
  return !!t && !!fbUsuario && !pausaSoloMirar() && (t.duenoUid === fbUsuario.uid || soyGM);
}
function nombreMiembro(uid){
  const m = miembros.get(uid);
  return m ? m.nombre : '(alguien que ya no está)';
}
function inicial(nombre){
  const letra = Array.from(String(nombre || '?').trim())[0] || '?';
  return letra.toUpperCase();
}

