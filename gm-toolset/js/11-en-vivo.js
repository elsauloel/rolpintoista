// js/11-en-vivo.js — tramo 11 de 12 del script de gm-tools.html (paso 5, nivel A: mismo código, en el mismo orden).
/* =========================================================
   MESA — tiradas compartidas en vivo: comun/mesa.js
   Acá solo va lo propio de esta herramienta: MESA_DESDE, mesaQuien()
   (quién tira) y lo que publica cosas que no son tiradas.
   ========================================================= */

const MESA_DESDE = 'gm';

// Al ejecutar una habilidad de un creep, su descripción va a la Mesa aunque
// no tire dados, así los jugadores leen qué hace.
function mesaPublicarHabilidadCreep(sc, h, extra){
  if(!fbDb || !fbUsuario || !fbMiembro) return;
  fbDb.collection(fbRutaCampana('tiradas')).add({
    uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: String((sc && sc.nombre) || '').slice(0, 60),
    origen: String((h && h.nombre) || 'Habilidad').slice(0, 80),
    formula: [habTextoMesa(h), extra || ''].filter(Boolean).join(' ').slice(0, 300),   // sin el aviso ⚙/✋ para el GM; `extra`: los textos «a mano» de la Ejecución
    rolls: [], mod: 0, total: 0, desde: 'habilidad',
    cuando: firebase.firestore.FieldValue.serverTimestamp(),
  }).catch(err => console.error('No se pudo publicar la habilidad en la Mesa:', err));
}

// En gm-tools el origen llega como "<creep> · <qué tiró>": el creep pasa a
// ser quien tira (en color en la Mesa) y comun/mesa.js le saca ese prefijo al origen.
function mesaQuien(origen){
  const sc = S.creeps.find(c => c.nombre && String(origen || '').startsWith(c.nombre + ' · '));
  return sc ? sc.nombre : '';
}


/* =========================================================
   CREEPS EN VIVO (Firebase)
   Los creeps del GM se guardan solos en campanas/<campaña>/creeps/<id>:
   - el documento principal es lo que ven los jugadores: nombre, orden,
     color, resumen (HP, estados), miniatura de la imagen y una firma
     (hash) del contenido para darse cuenta de cambios de otra pestaña;
   - creeps/<id>/privado/ficha {json} es el creep completo (sin imagen)
     y creeps/<id>/privado/imagen {dato} su imagen: eso lo lee solo el GM.
   El contador de turno va en campanas/<campaña>/gm/estado.
   Cada creep se escribe cuando deja de cambiar ~1,2 s (o cada 5 s si no
   para), por el tope diario de escrituras del plan gratis.
   Solo el GM guarda (lo imponen las reglas). Ver docs/workflow-firebase.md.
   ========================================================= */

const GM_GUARDAR_QUIETO_MS = 1200;
const GM_GUARDAR_MAX_MS = 5000;
const GM_LOTE_MAX_BYTES = 8 * 1024 * 1024;  // tope de Firebase por lote: 10 MB
const CREEP_MINIATURA_PX = 96;
const CREEP_TARJETA_PX = 400;   // imagen más grande para la tarjeta 🪪 que ven los jugadores en el mapa (la miniatura de 96 px se veía muy borrosa)

const gmVivo = {
  activo: false,       // entró a la mesa como GM
  listo: false,        // ya se cargaron los creeps de la mesa
  ultimo: {},          // id -> {json, imagen, publico} tal como quedó guardado
  firmas: {},          // id -> firma guardada (para ignorar el eco de lo propio)
  sucios: {},          // id -> {clave, desde, cambio}
  ultimoTurno: null,
  escribiendo: false,
  reintentarDesde: 0,
  cola: Promise.resolve(),
};

function gmHash(s){
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for(let i = 0; i < s.length; i++){
    const ch = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

function creepFichaJson(sc){
  return JSON.stringify({...sc, imagen: ''});
}

// Lo que ven los jugadores de cada creep (sin habilidades, equipo ni stats).
// De la vida solo se publica el porcentaje: los números quedan para el GM.
function creepPublico(sc, orden){
  const hp = num(sc.hp);
  const hpMax = num(sc.hpMax);
  return {
    nombre: String(sc.nombre || 'Creep').slice(0, 60),
    orden,
    color: String(sc.color || ''),
    mapa: String(sc.mapa || '').slice(0, 80),   // en qué mapa está (comun/creeps-mapas.js): el mapa lo usa para "Traer los creeps de este mapa"
    resumen: {
      hpPct: hpMax > 0 ? Math.round(Math.max(0, Math.min(1, hp / hpMax)) * 100) : 0,
      muerto: hp <= 0,
      opor: CreepCalculo.oportunidadPosible(sc),   // ¿puede aprovechar un ataque de oportunidad? (2026-10-02; sin mostrar sus No2)
      estados: (sc.estados || [])
        .filter(es => es && es.activo !== false && es.nombre)
        .slice(0, 30)
        .map(es => ({
          nombre: String(es.nombre).slice(0, 60),
          turnos: num(es.turnos),
          permanente: !!es.permanente, ...(es.invulnerable ? {invulnerable: true} : {}),
          ...((es.escudoMagicoActual !== undefined || num(es.escudoMagico) > 0) ? {escudo: num(es.escudoMagicoActual ?? es.escudoMagico), ...(es.excedenteVida ? {excedente: true, ...(es.excedenteTope ? {tope: num(es.excedenteTope)} : {})} : {escudoMax: num(es.escudoMagico)})} : {}), ...(es.armaduraRota ? {armaduraRota: true, stacks: Math.max(1, num(es.stacks) || 1)} : {}),
          polaridad: es.polaridad === 'buff' || es.polaridad === 'debuff' ? es.polaridad : '',
          // Para el globito del mapa al pasar el mouse por el estado.
          detalle: String(es.detalle || '').slice(0, 300),
        })),
    },
  };
}

function creepMiniatura(dataUrl, px, calidad){
  return new Promise(res => {
    if(!dataUrl){ res(''); return; }
    const img = new Image();
    img.onload = () => {
      const lado = Math.min(img.naturalWidth, img.naturalHeight);
      if(!lado){ res(''); return; }
      const canvas = document.createElement('canvas');
      const salida = Math.min(px || CREEP_MINIATURA_PX, lado);   // nunca se agranda más que la foto original
      canvas.width = canvas.height = salida;
      canvas.getContext('2d').drawImage(img, (img.naturalWidth - lado) / 2, (img.naturalHeight - lado) / 2, lado, lado, 0, 0, salida, salida);
      try{ res(canvas.toDataURL('image/jpeg', calidad || 0.8)); }catch(e){ res(''); }
    };
    img.onerror = () => res('');
    img.src = dataUrl;
  });
}

function gmEstado(texto, tipo){
  const el = $('#gm-guardado-estado');
  if(!el) return;
  el.textContent = texto;
  el.dataset.estado = tipo || '';
}

function gmEstadoAlDia(){
  const g = gmVivo;
  if(!fbMiembro){ gmEstado('Sin entrar a la mesa: los creeps no se guardan.'); return; }
  if(!g.activo){ gmEstado('Entraste como jugador: solo el GM guarda creeps en la mesa.', 'error'); return; }
  if(!g.listo){ gmEstado('Cargando creeps de la mesa…'); return; }
  if(g.reintentarDesde){ gmEstado('⚠ No se pudieron guardar los creeps — reintentando', 'error'); return; }
  if(g.escribiendo){ gmEstado('Guardando…'); return; }
  if(Object.keys(g.sucios).length){ gmEstado('Cambios sin guardar…'); return; }
  gmEstado(`✓ Creeps guardados en la mesa (${creepsReales().length})`, 'ok');
}

/* ---------- Guardado ---------- */

// Los creeps que ya estaban en la mesa antes de que existiera la imagen de la tarjeta no la tienen: se les arma una vez, en segundo plano,
// desde su imagen original (privada del GM). Solo la pestaña principal del GM, no los iframes del mapa.
async function gmTarjetasFaltantes(docs, creeps){
  const cl = document.documentElement.classList;
  if(cl.contains('modo-mantenimiento') || cl.contains('modo-acciones')) return;
  for(let i = 0; i < docs.length; i++){
    const sc = creeps[i];
    if(!sc || !sc.imagen || docs[i].data().tarjeta) continue;
    try{
      const t = await creepMiniatura(sc.imagen, CREEP_TARJETA_PX, 0.82);
      if(t) await docs[i].ref.set({tarjeta: t}, {merge: true});
    }catch(err){ console.warn('No se pudo armar la imagen de tarjeta de ' + sc.nombre, err); }
  }
}

async function gmGuardarTick(forzar){
  const g = gmVivo;
  if(!g.activo || !g.listo || g.escribiendo) return;
  const ahora = Date.now();
  if(g.reintentarDesde && ahora < g.reintentarDesde && !forzar) return;

  const actuales = new Map();
  creepsReales().forEach((sc, i) => {
    actuales.set(sc.id, {json: creepFichaJson(sc), imagen: sc.imagen || '', publico: JSON.stringify(creepPublico(sc, i)), sc, orden: i});
  });
  const guardar = [];
  actuales.forEach((a, id) => {
    const u = g.ultimo[id];
    if(u && u.json === a.json && u.imagen === a.imagen && u.publico === a.publico){ delete g.sucios[id]; return; }
    const clave = a.json + '|' + a.publico + '|' + a.imagen.length + gmHash(a.imagen);
    const s = g.sucios[id];
    if(!s) g.sucios[id] = {clave, desde: ahora, cambio: ahora};
    else if(s.clave !== clave){ s.clave = clave; s.cambio = ahora; }
    const t = g.sucios[id];
    if(forzar || ahora - t.cambio >= GM_GUARDAR_QUIETO_MS || ahora - t.desde >= GM_GUARDAR_MAX_MS) guardar.push([id, a]);
  });
  const borrar = Object.keys(g.ultimo).filter(id => !actuales.has(id));
  const turnoCambio = num(S.turno) !== g.ultimoTurno;
  if(!guardar.length && !borrar.length && !turnoCambio){ gmEstadoAlDia(); return; }

  g.escribiendo = true;
  gmEstadoAlDia();
  const ts = firebase.firestore.FieldValue.serverTimestamp();
  const col = fbDb.collection(fbRutaCampana('creeps'));
  const batch = fbDb.batch();
  const hechos = [];
  let bytes = 0, ops = 0;
  for(const [id, a] of guardar){
    const u = g.ultimo[id];
    const imagenCambio = !u || u.imagen !== a.imagen;
    const peso = a.json.length + (imagenCambio ? a.imagen.length : 0) + 2000;
    if(hechos.length && (bytes + peso > GM_LOTE_MAX_BYTES || ops + 3 > 450)) break;  // el resto, en la próxima vuelta
    bytes += peso; ops += 3;
    const firma = gmHash(a.json) + '-' + gmHash(a.imagen);
    const doc = {...JSON.parse(a.publico), firma, actualizado: ts};
    if(imagenCambio){ doc.miniatura = await creepMiniatura(a.imagen); doc.tarjeta = await creepMiniatura(a.imagen, CREEP_TARJETA_PX, 0.82); }
    const base = col.doc(id);
    batch.set(base, doc, {mergeFields: Object.keys(doc)});  // reemplaza el resumen entero, conserva la miniatura
    batch.set(base.collection('privado').doc('ficha'), {json: a.json});
    if(imagenCambio) batch.set(base.collection('privado').doc('imagen'), {dato: a.imagen});
    g.firmas[id] = firma;
    hechos.push([id, a]);
  }
  const borrados = borrar.slice(0, Math.max(0, Math.floor((450 - ops) / 3)));
  borrados.forEach(id => {
    const base = col.doc(id);
    batch.delete(base.collection('privado').doc('ficha'));
    batch.delete(base.collection('privado').doc('imagen'));
    batch.delete(base);
  });
  if(turnoCambio) batch.set(fbDb.doc(fbRutaCampana('gm/estado')), {turno: num(S.turno), actualizado: ts});

  try{
    await batch.commit();
    hechos.forEach(([id, a]) => {
      g.ultimo[id] = {json: a.json, imagen: a.imagen, publico: a.publico};
      const s = g.sucios[id];
      if(s && s.clave === a.json + '|' + a.publico + '|' + a.imagen.length + gmHash(a.imagen)) delete g.sucios[id];
    });
    borrados.forEach(id => { delete g.ultimo[id]; delete g.firmas[id]; delete g.sucios[id]; });
    if(turnoCambio) g.ultimoTurno = num(S.turno);
    g.reintentarDesde = 0;
  }catch(err){
    console.error('No se pudieron guardar los creeps en la mesa:', err);
    if(!g.reintentarDesde){
      toast(err.code === 'permission-denied'
        ? 'La mesa no te deja guardar creeps (¿entraste como GM?)'
        : 'No se pudieron guardar los creeps en la mesa — se reintenta solo');
    }
    g.reintentarDesde = Date.now() + 8000;
  }finally{
    g.escribiendo = false;
    gmEstadoAlDia();
  }
}

setInterval(() => gmGuardarTick(false), 1000);

function gmHayPendiente(){
  const g = gmVivo;
  if(!g.activo || !g.listo) return false;
  if(g.escribiendo || num(S.turno) !== g.ultimoTurno) return true;
  const ids = new Set(creepsReales().map(sc => sc.id));
  if(Object.keys(g.ultimo).some(id => !ids.has(id))) return true;
  return creepsReales().some((sc, i) => {
    const u = g.ultimo[sc.id];
    return !u || u.json !== creepFichaJson(sc) || u.imagen !== (sc.imagen || '') || u.publico !== JSON.stringify(creepPublico(sc, i));
  });
}

window.addEventListener('beforeunload', e => {
  if(!gmHayPendiente()) return;
  gmGuardarTick(true);
  e.preventDefault();
  e.returnValue = '';
});

/* ---------- Carga y cambios desde otra pestaña ---------- */

async function gmLeerCreep(doc){
  const base = doc.ref;
  const [ficha, imagen] = await Promise.all([
    base.collection('privado').doc('ficha').get(),
    base.collection('privado').doc('imagen').get(),
  ]);
  let datos = {};
  const json = ficha.exists ? String(ficha.data().json || '') : '';
  try{ datos = json ? JSON.parse(json) : {}; }catch(e){ datos = {}; }
  const sc = Object.assign(creepBaseGuardado(), datos, {id: doc.id});
  sc.imagen = imagen.exists ? String(imagen.data().dato || '') : '';
  if(!ficha.exists){ sc.nombre = doc.data().nombre || sc.nombre; }
  return sc;
}

function gmMarcarGuardado(sc, orden, firma){
  gmVivo.ultimo[sc.id] = {json: creepFichaJson(sc), imagen: sc.imagen || '', publico: JSON.stringify(creepPublico(sc, orden))};
  gmVivo.firmas[sc.id] = firma;
  delete gmVivo.sucios[sc.id];
}

async function gmProcesarSnapshot(snap){
  const g = gmVivo;
  if(!g.listo){
    // En segundo plano (iframe del mapa) no se sube el creep en blanco del arranque.
    if(snap.empty && (document.documentElement.classList.contains("modo-mantenimiento") || document.documentElement.classList.contains("modo-acciones"))) S.creeps = [];
    if(!snap.empty){
      const docs = snap.docs.slice().sort((a, b) => num(a.data().orden) - num(b.data().orden));
      const creeps = await Promise.all(docs.map(gmLeerCreep));
      S.creeps = creeps;
      renderAll();  // normaliza los creeps
      S.creeps.forEach((sc, i) => {
        gmMarcarGuardado(sc, i, docs[i].data().firma || '');
        // Creeps guardados con el formato viejo (vida en números a la vista de
        // todos): se vuelven a publicar solos con solo el porcentaje.
        const r = docs[i].data().resumen;
        if(!r || r.hpPct === undefined || r.hp !== undefined) gmVivo.ultimo[sc.id].publico = '';
      });
      toast(`${creeps.length} creep(s) cargados de la mesa`);
      gmTarjetasFaltantes(docs, creeps);
    }
    // Si la mesa no tenía creeps, se suben los que haya en pantalla.
    try{
      const est = await fbDb.doc(fbRutaCampana('gm/estado')).get();
      if(est.exists && est.data().turno !== undefined){
        S.turno = num(est.data().turno);
        g.ultimoTurno = S.turno;
        renderAll();
      }
    }catch(err){ console.error('No se pudo leer el turno:', err); }
    g.listo = true;
    gmEstadoAlDia();
    if(!MODO_ACCIONES && fbMiembro && fbMiembro.gm) gmMigrarGrupos();   // los grupos viejos pasan a ser mapas (una vez)
    gmMantenimientoRevisar();
    const modoGM = new URLSearchParams(location.search).get('modo');
    if(modoGM === 'finalizar'){ abrirReporteFinalizar(); gmAvisarMapa('acciones-lista'); }
    else if(modoGM === 'botin'){ abrirBotinGM(); gmAvisarMapa('acciones-lista'); }
    else if(MODO_ACCIONES){
      const q = new URLSearchParams(location.search), cid = q.get('creep');
      if(q.get('precarga') === '1') gmAvisarMapa('acciones-lista');   // el mapa la cargó de antemano o para un duelo: no abre nada (paso 4)
      else if(q.get('ver')) accionesModoVer(cid); else accionesModoAbrir(cid);
    }
    // ?editar=<creep>: el mapa abre la ficha completa de ese creep (botón 📜 del token).
    const paraEditar = new URLSearchParams(location.search).get('editar');
    if(!MODO_ACCIONES && paraEditar && S.creeps.some(s => s.id === paraEditar)) abrirEditarCreep(paraEditar);
    return;
  }

  let cambio = false;
  for(const ch of snap.docChanges()){
    if(ch.doc.metadata.hasPendingWrites) continue;
    const id = ch.doc.id;
    if(ch.type === 'removed'){
      if(g.ultimo[id] && S.creeps.some(sc => sc.id === id)){
        S.creeps = S.creeps.filter(sc => sc.id !== id);
        delete g.ultimo[id]; delete g.firmas[id]; delete g.sucios[id];
        cambio = true;
      }
      continue;
    }
    const d = ch.doc.data();
    if(!d.firma || d.firma === g.firmas[id]) continue;
    const sc = await gmLeerCreep(ch.doc);
    const idx = S.creeps.findIndex(x => x.id === id);
    if(idx >= 0) S.creeps[idx] = sc;
    else S.creeps.splice(Math.min(S.creeps.length, Math.max(0, num(d.orden))), 0, sc);
    gmMarcarGuardado(sc, S.creeps.indexOf(sc), d.firma);
    cambio = true;
  }
  if(cambio){
    renderAll();
    toast('Los creeps se actualizaron desde otra pestaña');
    gmEstadoAlDia();
  }
}

function gmEscuchar(){
  fbDb.collection(fbRutaCampana('creeps')).onSnapshot(snap => {
    gmVivo.cola = gmVivo.cola.then(() => gmProcesarSnapshot(snap)).catch(err => {
      console.error('Error aplicando los creeps de la mesa:', err);
      if(!gmVivo.listo) gmEstado('⚠ No se pudieron cargar los creeps — mirá la consola', 'error');
    });
  }, err => {
    console.error('Error escuchando los creeps:', err);
    gmEstado('⚠ No se pudieron leer los creeps. ¿Están publicadas las reglas nuevas?', 'error');
  });
  fbDb.doc(fbRutaCampana('gm/estado')).onSnapshot(doc => {
    if(!gmVivo.listo || doc.metadata.hasPendingWrites || !doc.exists) return;
    const turno = num(doc.data().turno);
    if(turno === gmVivo.ultimoTurno) return;
    gmVivo.ultimoTurno = turno;
    S.turno = turno;
    renderAll();
  }, err => console.error('Error escuchando el turno:', err));
}

// Se llama cuando ya se entró a la mesa.
function gmAlEntrar(){
  if(window.parent === window && typeof Duelo !== 'undefined') Duelo.escuchar();   // aviso «te están atacando» / duelos que ve el GM (en el mapa lo escucha el propio mapa)
  $('#gm-identidad').textContent = '⚔ GM Tools · ' + barraTexto();
  mesaEscuchar();
  mesaHistorialAlEntrar();
  gmVivo.activo = fbMiembro.gm === true;
  gmEstadoAlDia();
  if(gmVivo.activo) cargarCreepsSubidos();   // avisos 🔔 de versión nueva en las tarjetas
  cargarItemsSubidosGM();   // ítems que subió el grupo (catálogo compartido, paso 5)
  // Los "Mis presets" de estados, guardados en la partida (comun/presets-gm.js, B-7b): antes se perdían al recargar.
  if(gmVivo.activo) PresetsGM.escuchar(l => { S.estadosPersonalizados = l; });
  if(gmVivo.activo){ gmEscuchar(); gmMantenimientoEscuchar(); try{ mapasGMEscuchar(); }catch(err){ console.error('No se pudo escuchar la lista de mapas:', err); } combateEscuchar(); gbitEscuchar(); }
}

/* ---------- Mantenimiento del GM ----------
   Mismo mecanismo que la ficha: la señal es campanas/<partida>/mapa/
   mantenimiento.numero (la sube el GM desde el mapa o desde el botón de
   acá) y gm/mantenimiento = {aplicado} guarda hasta qué número se aplicó a
   los creeps, tomado en una transacción para no aplicarlo dos veces. */
const MANTENIMIENTO_MAX_SEGUIDOS = 10;
const MODO_MANTENIMIENTO = document.documentElement.classList.contains('modo-mantenimiento');
let gmMantenimientoSenal = null;
let gmMantenimientoRevisando = false;
let gmMantenimientoOtraVez = false;

function gmMantenimientoEscuchar(){
  fbDb.doc(fbRutaCampana('mapa/mantenimiento')).onSnapshot(doc => {
    gmMantenimientoSenal = doc.exists ? Math.round(num(doc.data().numero)) : 0;
    gmMantenimientoRevisar();
  }, err => console.error('Error escuchando el mantenimiento:', err));
}

async function mantenimientoGlobal(){
  try{
    const ref = fbDb.doc(fbRutaCampana('mapa/mantenimiento'));
    await fbDb.runTransaction(async tx => {
      const doc = await tx.get(ref);
      const numero = (doc.exists ? Math.round(num(doc.data().numero)) : 0) + 1;
      tx.set(ref, {numero, cuando: firebase.firestore.FieldValue.serverTimestamp()});
    });
    // Línea en la Mesa para todos: "Mantenimiento · Turno N".
    const turno = num(S.turno) + 1;
    fbDb.collection(fbRutaCampana('tiradas')).add({
      uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: '',
      origen: `Mantenimiento · Turno ${turno}`, formula: '', rolls: [], mod: 0, total: turno,
      desde: 'mantenimiento', cuando: firebase.firestore.FieldValue.serverTimestamp(),
    }).catch(err => console.error('No se pudo anunciar el pase de turno en la Mesa:', err));
  }catch(err){
    console.error('No se pudo pasar el turno para la mesa:', err);
    toast('No se pudo pasar el turno para la mesa — mirá la consola');
  }
}

function gmAvisarMapa(tipo){ MensajesMapa.alMapa(tipo); }   // la lista de mensajes: comun/mensajes-mapa.js

