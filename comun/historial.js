/* =========================================================
   HISTORIAL DE ACCIONES MENORES (solo el GM)
   Un botón "📜 Historial" fijo arriba, al lado del ☰ del sitio, que abre una lista con las cosas chicas que no ameritan
   una línea en la Mesa: quién se bajó o se subió el HP o el SP, qué estado le cayó o se le terminó, y el reporte del
   Mantenimiento de los creeps. Sirve para que el GM chequee cosas sin tener que ir clic por clic en los tokens
   recordando cuánto tenía cada uno (pedido del dueño, 2026-09-24).

   Cómo se arma (campanas/<partida>/historial/<auto>: {uid, jugador, quien, tipo:'vital'|'mant', texto, campo?, delta?, cuando}):
   - Lo escribe SOLO la página del GM, mirando los datos: de cada personaje compara su resumen público (HP, SP, estados, en
     campanas/<partida>/fichas/*) contra lo que vio antes; de los creeps, lo que cada herramienta le pasa con
     historialObservarCreeps(). Así queda registrado venga de donde venga el cambio (la ficha, el globito de vida del mapa,
     el Mantenimiento, un ataque…) y los jugadores no escriben nada. Lo que no sabe es QUIÉN lo hizo.
   - Si el GM tiene varias pestañas abiertas, una sola registra (un "turno" en localStorage, historialEsLider) para no duplicar.
   - Si no hay ninguna página del GM abierta, no se registra nada: no hay servidor. Lo que pasa mientras nadie del GM mira, se pierde.
   - Solo lo lee y lo borra el GM (reglas de Firestore). Se borra solo lo de más de 48 h, como las tiradas de la Mesa.
   - No aparece dentro de los iframes del mapa (Botonera, Acciones, Mantenimiento).
   Se carga después de sesion.js; mesa-historial.js llama a historialAlEntrar() cuando ya se entró a la partida.
   ========================================================= */

const HIST_HORAS = 48;
const HIST_MAX = 250;
const HIST_ID = Math.random().toString(36).slice(2);   // esta pestaña
const histBase = {fichas: new Map(), creeps: new Map()};   // lo último que se vio, para saber qué cambió
let histIniciado = false;
let histCreepsActivo = false;
let histCorte = null;      // cortar la escucha de la lista cuando se cierra el panel

const histNum = v => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
const histFmt = v => (typeof fmt === 'function' ? fmt(histNum(v)) : String(Math.round(histNum(v) * 100) / 100));
const histEsc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
const histSigno = d => (d > 0 ? '+' : '−') + histFmt(Math.abs(d));

// Una sola pestaña registra: la que tiene el "turno" (se renueva cada pocos segundos; si esa pestaña se cierra, otra lo toma).
function historialEsLider(tipo){
  try{
    const clave = `hist-lider-${tipo}-${FB_CAMPANA}`, ahora = Date.now();
    const l = JSON.parse(localStorage.getItem(clave) || 'null');
    if(!l || l.id === HIST_ID || ahora - histNum(l.t) > 7000){
      localStorage.setItem(clave, JSON.stringify({id: HIST_ID, t: ahora}));
      return true;
    }
    return false;
  }catch(e){ return true; }
}

// Escribe una línea. Solo el GM (las reglas también lo exigen). Nunca interrumpe: si falla, solo avisa en la consola.
function historialRegistrar(tipo, quien, texto, campo, delta){
  if(!fbDb || !fbUsuario || !fbMiembro || !fbMiembro.gm || !texto) return;
  const d = {
    uid: fbUsuario.uid, jugador: String(fbMiembro.nombre || '').slice(0, 40),
    quien: String(quien || '').slice(0, 60), tipo: tipo === 'mant' ? 'mant' : 'vital',
    texto: String(texto).slice(0, 500),
    cuando: firebase.firestore.FieldValue.serverTimestamp(),
  };
  if(campo){ d.campo = String(campo).slice(0, 10); d.delta = histNum(delta); }
  fbDb.collection(fbRutaCampana('historial')).add(d)
    .catch(err => console.error('No se pudo escribir en el historial:', err));
}

// HP/SP: una línea por cada valor que cambió.
function histLineasVital(nombre, campo, antes, despues){
  if(antes === despues) return;
  const d = despues - antes;
  historialRegistrar('vital', nombre, `${campo} ${histFmt(antes)} → ${histFmt(despues)} (${histSigno(d)})${campo === 'HP' && despues <= 0 ? ' · a 0' : ''}`, campo, d);
}
// Estados: los que aparecieron y los que ya no están.
function histLineasEstados(nombre, antes, ahora){
  ahora.forEach(e => { if(!antes.has(e.nombre)) historialRegistrar('vital', nombre, `+ ${e.nombre}${e.turnos ? ` (${histFmt(e.turnos)} turno${e.turnos === 1 ? '' : 's'})` : ''}`, 'estado', 1); });
  const siguen = new Set(ahora.map(e => e.nombre));
  antes.forEach(n => { if(!siguen.has(n)) historialRegistrar('vital', nombre, `− ${n}`, 'estado', -1); });
}

/* ---------- Personajes: se mira el resumen público de cada ficha ---------- */
function histObservarFichas(){
  fbDb.collection(fbRutaCampana('fichas')).onSnapshot(snap => {
    const lider = historialEsLider('pj');
    snap.docChanges().forEach(ch => {
      const id = ch.doc.id;
      if(ch.type === 'removed'){ histBase.fichas.delete(id); return; }
      const x = ch.doc.data(), r = x.resumen || {};
      const nuevo = r.spMax !== undefined
        ? {hp: histNum(r.hp), sp: histNum(r.sp), estados: (Array.isArray(r.estados) ? r.estados : []).filter(e => e && e.nombre)}
        : {hp: histNum(r.hp), sp: histNum(r.bonos), estados: (Array.isArray(r.estados) ? r.estados : []).filter(e => e && e.nombre)};
      const previo = histBase.fichas.get(id);
      histBase.fichas.set(id, {hp: nuevo.hp, sp: nuevo.sp, estados: new Set(nuevo.estados.map(e => e.nombre))});
      if(!previo || !lider) return;   // la primera vez solo se toma nota (línea base)
      const quien = String(x.nombre || 'Personaje');
      histLineasVital(quien, 'HP', previo.hp, nuevo.hp);
      histLineasVital(quien, 'SP', previo.sp, nuevo.sp);
      histLineasEstados(quien, previo.estados, nuevo.estados);
    });
  }, err => console.error('Historial: no se pudieron leer los personajes:', err));
}

/* ---------- Creeps: cada herramienta que los tiene en memoria los pasa acá (una vez por segundo) ----------
   lista = [{id, nombre, hp, estados: [{nombre, turnos}]}]. La primera vez de cada creep solo toma nota. */
function historialObservarCreeps(lista){
  histCreepsActivo = true;
  if(!fbMiembro || !fbMiembro.gm) return;
  const lider = historialEsLider('creeps');
  const vistos = new Set();
  (lista || []).forEach(c => {
    vistos.add(c.id);
    const estados = (c.estados || []).filter(e => e && e.nombre);
    const nuevo = {hp: histNum(c.hp), estados: new Set(estados.map(e => e.nombre))};
    const previo = histBase.creeps.get(c.id);
    histBase.creeps.set(c.id, nuevo);
    if(!previo || !lider) return;
    histLineasVital(c.nombre, 'HP', previo.hp, nuevo.hp);
    histLineasEstados(c.nombre, previo.estados, estados);
  });
  [...histBase.creeps.keys()].forEach(id => { if(!vistos.has(id)) histBase.creeps.delete(id); });
}

// Reporte del Mantenimiento de un creep (lo arma gm-tools).
function historialReporteMantenimiento(quien, lineas){
  if(lineas && lineas.length) historialRegistrar('mant', quien, lineas.join(' · '));
}

/* ---------- Borrado ---------- */
async function histBorrar(antesDe){
  const col = fbDb.collection(fbRutaCampana('historial'));
  let total = 0;
  for(;;){
    const consulta = antesDe
      ? col.where('cuando', '<', firebase.firestore.Timestamp.fromDate(antesDe)).limit(400)
      : col.limit(400);
    const snap = await consulta.get();
    if(snap.empty) break;
    const lote = fbDb.batch();
    snap.docs.forEach(d => lote.delete(d.ref));
    await lote.commit();
    total += snap.size;
    if(snap.size < 400) break;
  }
  return total;
}
async function histLimpiezaAutomatica(){
  const clave = 'hist-limpieza-' + FB_CAMPANA;
  let ultima = 0;
  try{ ultima = Number(localStorage.getItem(clave)) || 0; }catch(e){}
  if(Date.now() - ultima < 60 * 60 * 1000) return;
  try{ localStorage.setItem(clave, String(Date.now())); }catch(e){}
  try{ await histBorrar(new Date(Date.now() - HIST_HORAS * 3600 * 1000)); }
  catch(err){ console.error('No se pudo limpiar el historial viejo:', err); }
}

/* ---------- Botón y panel ---------- */
function histEstilos(){
  if(document.getElementById('historial-css')) return;
  const s = document.createElement('style');
  s.id = 'historial-css';
  s.textContent = `
#historial-boton{position:fixed;top:10px;left:56px;z-index:70;height:38px;padding:0 12px;display:flex;align-items:center;gap:6px;
  background:#1A1418;border:1px solid #3B2E34;border-radius:3px;cursor:pointer;color:#EDE3D2;box-shadow:0 4px 12px rgba(0,0,0,.45);
  font:600 12.5px "Space Grotesk",system-ui,sans-serif;letter-spacing:0;text-transform:none}
#historial-boton:hover{border-color:#C98545}
#historial-boton.abierto{border-color:#E0A458;color:#E0A458}
#historial-panel{position:fixed;top:54px;left:56px;z-index:70;width:430px;max-width:calc(100vw - 66px);max-height:calc(100vh - 66px);
  display:flex;flex-direction:column;background:#1A1418;border:1px solid #3B2E34;border-radius:3px;box-shadow:0 12px 30px rgba(0,0,0,.6);
  font-family:"Space Grotesk",system-ui,sans-serif;font-size:13px;line-height:1.35;color:#EDE3D2;text-align:left}
#historial-panel[hidden]{display:none!important}
#historial-panel .hp-cab{display:flex;align-items:center;gap:8px;padding:8px 10px;border-bottom:1px solid #2A2126}
#historial-panel .hp-cab b{font-size:13px;flex:none}
#historial-panel .hp-cab input{flex:1;min-width:0;background:rgba(0,0,0,.28);border:1px solid #2A2126;border-radius:3px;color:#EDE3D2;padding:5px 8px;font:inherit}
#historial-panel .hp-cab button{background:none;border:1px solid #3B2E34;border-radius:3px;color:#9A867E;cursor:pointer;padding:4px 8px;font:inherit;font-size:12px}
#historial-panel .hp-cab button:hover{color:#E0A458;border-color:#C98545}
#historial-panel .hp-lista{overflow-y:auto;padding:4px 0}
#historial-panel .hp-fila{display:flex;gap:8px;padding:4px 10px;border-bottom:1px solid #221A1E;align-items:baseline}
#historial-panel .hp-hora{flex:none;font:11px "Space Mono",monospace;color:#9A867E;width:46px}
#historial-panel .hp-quien{flex:none;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#E0A458;font-weight:700}
#historial-panel .hp-texto{flex:1;min-width:0;word-break:break-word}
#historial-panel .hp-baja{color:#E27B72}
#historial-panel .hp-sube{color:#8FD19A}
#historial-panel .hp-mant{color:#B9A6E8}
#historial-panel .hp-vacio{padding:18px 12px;color:#9A867E;text-align:center}
/* lugar para el botón en la barra de cada herramienta (además del ☰) */
html.hist-on header{padding-left:172px!important}
html.hist-on .accesos{padding-left:160px}
html.hist-on .hero > div:first-child{padding-left:160px}`;
  document.head.appendChild(s);
}

function histHora(ts){
  const d = ts && ts.toDate ? ts.toDate() : new Date();
  const hoy = new Date().toDateString() === d.toDateString();
  const hm = d.toLocaleTimeString('es-AR', {hour: '2-digit', minute: '2-digit'});
  return hoy ? hm : d.toLocaleDateString('es-AR', {day: '2-digit', month: '2-digit'}) + ' ' + hm;
}

function histDibujar(docs, filtro){
  const cont = document.getElementById('hp-lista');
  if(!cont) return;
  const f = String(filtro || '').trim().toLowerCase();
  const filas = docs.map(d => d.data({serverTimestamps: 'estimate'}))
    .filter(x => !f || (x.quien + ' ' + x.texto).toLowerCase().includes(f));
  if(!filas.length){
    cont.innerHTML = `<div class="hp-vacio">${docs.length ? 'Nada coincide con lo que escribiste.' : 'Todavía no se registró nada. Se anota mientras tenés abierta alguna herramienta del GM.'}</div>`;
    return;
  }
  cont.innerHTML = filas.map(x => {
    const clase = x.tipo === 'mant' ? 'hp-mant' : x.campo === 'estado' ? '' : histNum(x.delta) < 0 ? 'hp-baja' : histNum(x.delta) > 0 ? 'hp-sube' : '';
    return `<div class="hp-fila"><span class="hp-hora">${histEsc(histHora(x.cuando))}</span><span class="hp-quien" title="${histEsc(x.quien)}">${histEsc(x.quien)}</span><span class="hp-texto ${clase}">${histEsc(x.texto)}</span></div>`;
  }).join('');
}

function histAbrir(panel, boton){
  panel.hidden = false;
  boton.classList.add('abierto');
  const cont = document.getElementById('hp-lista');
  cont.innerHTML = '<div class="hp-vacio">Cargando…</div>';
  let docs = [];
  const filtro = document.getElementById('hp-filtro');
  filtro.oninput = () => histDibujar(docs, filtro.value);
  histCorte = fbDb.collection(fbRutaCampana('historial')).orderBy('cuando', 'desc').limit(HIST_MAX).onSnapshot(snap => {
    docs = snap.docs;
    histDibujar(docs, filtro.value);
  }, err => {
    console.error('Historial: no se pudo leer:', err);
    cont.innerHTML = '<div class="hp-vacio">No se pudo leer el historial (¿están publicadas las reglas nuevas de Firestore?).</div>';
  });
}
function histCerrar(panel, boton){
  panel.hidden = true;
  boton.classList.remove('abierto');
  if(histCorte){ histCorte(); histCorte = null; }
}

function histArmarBoton(){
  if(document.getElementById('historial-boton')) return;
  histEstilos();
  const boton = document.createElement('button');
  boton.id = 'historial-boton';
  boton.type = 'button';
  boton.title = 'Historial de acciones menores: cambios de HP y SP, estados y el reporte del Mantenimiento (solo el GM)';
  boton.innerHTML = '📜 Historial';
  const panel = document.createElement('div');
  panel.id = 'historial-panel';
  panel.hidden = true;
  panel.innerHTML =
    '<div class="hp-cab"><b>📜 Historial</b><input id="hp-filtro" placeholder="Filtrar por nombre o texto…" autocomplete="off">' +
    '<button type="button" id="hp-borrar" title="Borrar todo el historial">🗑</button><button type="button" id="hp-cerrar" title="Cerrar">✕</button></div>' +
    '<div class="hp-lista" id="hp-lista"></div>';
  document.body.appendChild(boton);
  document.body.appendChild(panel);
  document.documentElement.classList.add('hist-on');
  boton.onclick = () => panel.hidden ? histAbrir(panel, boton) : histCerrar(panel, boton);
  panel.querySelector('#hp-cerrar').onclick = () => histCerrar(panel, boton);
  panel.querySelector('#hp-borrar').onclick = async e => {
    if(!confirm('¿Borrar todo el historial?\n\nSe borra para siempre.')) return;
    e.target.disabled = true;
    try{ await histBorrar(null); }
    catch(err){ console.error('No se pudo borrar el historial:', err); if(typeof toast === 'function') toast('No se pudo borrar el historial'); }
    finally{ e.target.disabled = false; }
  };
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && !panel.hidden && !e.defaultPrevented) histCerrar(panel, boton); });
}

// Se llama (desde mesa-historial.js) cuando ya se entró a la partida. Solo el GM, y no dentro de los iframes del mapa.
function historialAlEntrar(){
  if(histIniciado || !fbMiembro || !fbMiembro.gm || !fbDb) return;
  if(window.parent !== window) return;
  histIniciado = true;
  histArmarBoton();
  histLimpiezaAutomatica();
  histObservarFichas();
  setInterval(() => { historialEsLider('pj'); if(histCreepsActivo) historialEsLider('creeps'); }, 3000);   // renueva el "turno"
}
