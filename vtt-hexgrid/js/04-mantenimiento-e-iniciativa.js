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
    fuegoMantenimiento(numero);   // terreno incendiado: daño a los que siguen adentro
    trampasDisparadasBarrer();   // las trampas ya detonadas (rojas) desaparecen
    zonaRevisarMantenimiento();   // zonas persistentes: a quien le falte algo, le aparece el cartelito
    // Los creeps (solo el GM): desde el 2026-10-02 (A2b) el pase de turno lo hace el mapa (js/12, mantenimientoCreeps), sin cargar GM
    // Tools en un marco invisible.
    if(soyGM) mantenimientoCreeps(numero);
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
async function publicarPaseDeTurno(turno){
  try{
    await fbDb.collection(fbRutaCampana('tiradas')).add({
      uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: '',
      origen: `Mantenimiento · Turno ${turno}`, formula: '', rolls: [], mod: 0, total: turno,
      desde: 'mantenimiento', cuando: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }catch(err){ console.error('No se pudo anunciar el pase de turno en la Mesa:', err); }
}

/* ---------- Personajes: lista de las fichas de la partida ----------
   Cada una abre en una pestaña nueva (las de otros jugadores, en solo lectura).
   El GM además tiene un ✕ para borrar cualquiera. */
function renderListaPersonajes(){
  const lista = [...fichasPub.entries()].sort((a, b) => a[1].nombre.localeCompare(b[1].nombre, 'es'));
  $('#personajes-lista').innerHTML = lista.length
    ? lista.map(([id, f]) => {
        const dueno = miembros.get(f.duenoUid);
        const mini = f.miniatura ? `<img class="pj-mini" src="${esc(f.miniatura)}" alt="">` : `<span class="pj-mini"></span>`;
        const enlace = `<a href="../ficha-personaje/ficha.html?partida=${encodeURIComponent(FB_CAMPANA)}#${encodeURIComponent(id)}" target="_blank" rel="noopener" title="Abrir la ficha en una pestaña nueva">` +
          `${mini}<span class="pj-nombre">${esc(f.nombre)}</span>${dueno ? `<span class="pj-dueno">${esc(dueno.nombre)}</span>` : ''}</a>`;
        if(!soyGM) return enlace;
        return `<div class="pj-fila">${enlace}<button type="button" class="pj-borrar" data-borrar-personaje="${esc(id)}" data-nombre="${esc(f.nombre)}" title="Borrar a ${esc(f.nombre)} de la partida">✕</button></div>`;
      }).join('')
    : '<div class="desplegable-vacio">Todavía no hay personajes en la partida.</div>';
  $('#personajes-lista').querySelectorAll('[data-borrar-personaje]').forEach(b => {
    b.onclick = () => borrarPersonajeGM(b.dataset.borrarPersonaje, b.dataset.nombre, b);
  });
}

// Mismo criterio que "Borrar personaje" de la ficha (confirmar + escribir el
// nombre), pero acá el GM puede borrar la de cualquier jugador; de paso saca
// los tokens que la usan (el suyo y los de sus invocaciones).
async function borrarPersonajeGM(id, nombre, boton){
  const aviso = `Esto borra a ${nombre} de la partida, para todos, y no se puede deshacer.\n\n` +
                `Si el jugador lo quiere conservar, avisale antes (podés bajar un respaldo con "💾 Respaldo partida" desde gm-tools).\n\n¿Seguís?`;
  if(!confirm(aviso)) return;
  const escrito = prompt(`Para confirmar el borrado, escribí el nombre tal cual: ${nombre}`);
  if(escrito === null) return;
  if(escrito.trim().toLowerCase() !== nombre.trim().toLowerCase()){
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
    renderListaPersonajes();
    renderPanel();
    pedirDibujo();
  }catch(err){
    console.error('No se pudo borrar el personaje:', err);
    toast('No se pudo borrar el personaje — revisá la consola');
    boton.disabled = false;
  }
}

function abrirListaPersonajes(abrir){
  $('#personajes-lista').hidden = !abrir;
  $('#btn-personajes').setAttribute('aria-expanded', abrir ? 'true' : 'false');
  if(abrir) renderListaPersonajes();
}

$('#btn-personajes').onclick = () => abrirListaPersonajes($('#personajes-lista').hidden);
// Se cierra al elegir una ficha, al tocar afuera o con Escape.
$('#personajes-lista').addEventListener('click', e => { if(e.target.closest('a')) abrirListaPersonajes(false); });
document.addEventListener('pointerdown', e => {
  if(!$('#personajes-lista').hidden && !e.target.closest('#personajes-caja')) abrirListaPersonajes(false);
});
document.addEventListener('keydown', e => { if(e.key === 'Escape' && !$('#personajes-lista').hidden) abrirListaPersonajes(false); });

$('#btn-mantenimiento').onclick = async () => {
  if(!soyGM) return;
  const btn = $('#btn-mantenimiento');
  btn.disabled = true;
  try{
    const ref = fbDb.doc(fbRutaCampana('mapa/mantenimiento'));
    // El turno que se anuncia es el de gm-tools (gm/estado) más uno.
    const turno = await fbDb.runTransaction(async tx => {
      const [doc, estado] = await Promise.all([tx.get(ref), tx.get(fbDb.doc(fbRutaCampana('gm/estado')))]);
      const numero = (doc.exists ? Math.round(num(doc.data().numero)) : 0) + 1;
      tx.set(ref, {numero, cuando: firebase.firestore.FieldValue.serverTimestamp()});
      return (estado.exists ? Math.round(num(estado.data().turno)) : 0) + 1;
    });
    publicarPaseDeTurno(turno);
  }catch(err){
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

let iniciativa = {orden: [], turno: 0, ronda: 1};
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
    const antesTurno = iniciativa.turno, antesRonda = iniciativa.ronda;
    iniciativa = {
      orden: (Array.isArray(d.orden) ? d.orden : []).map(o => ({id: String(o.id || ''), valor: num(o.valor), oculto: o.oculto === true})).filter(o => o.id),
      turno: Math.max(0, Math.round(num(d.turno))),
      ronda: Math.max(1, Math.round(num(d.ronda)) || 1),
    };
    const cambioTurno = iniciativa.turno !== antesTurno || iniciativa.ronda !== antesRonda;
    if(cambioTurno) giroLibre.clear();   // avanzó el turno: acción de otro
    renderIniciativa();
    if(iniciativaCargada && cambioTurno && iniciativa.orden.length) anunciarTurnoEnMapa();
    iniciativaCargada = true;
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
    orden: iniciativa.orden.map(o => o.oculto ? {id: o.id, valor: num(o.valor), oculto: true} : {id: o.id, valor: num(o.valor)}),
    turno: iniciativa.turno,
    ronda: iniciativa.ronda,
    ...cambios,
    actualizado: firebase.firestore.FieldValue.serverTimestamp(),
  };
  try{
    await fbDb.doc(fbRutaCampana(rutaMapaEstado('iniciativa'))).set(datos);
    return true;
  }catch(err){
    console.error('No se pudo guardar la iniciativa:', err);
    toast(err.code === 'permission-denied' ? 'No podés cambiar eso del orden de turnos' : 'No se pudo guardar el orden de turnos');
    return false;
  }
}

// De mayor a menor; con el mismo valor queda el orden en que estaban.
function ordenarIniciativa(lista){
  return lista.map((o, i) => ({o, i})).sort((a, b) => (num(b.o.valor) - num(a.o.valor)) || (a.i - b.i)).map(x => x.o);
}

function iniciativaPonerTodos(){
  const previos = new Map(iniciativa.orden.map(o => [o.id, o]));
  const lista = [...tokens.keys()].map(id => ({id, valor: num(previos.get(id) && previos.get(id).valor), oculto: !!(previos.get(id) && previos.get(id).oculto)}));
  guardarIniciativa({orden: ordenarIniciativa(lista).map(o => o.oculto ? {id: o.id, valor: o.valor, oculto: true} : {id: o.id, valor: o.valor}), turno: 0});
}

// Mover a mano una fila del orden de turnos (▲ ▼, solo GM): para cuando algo del juego cambia a alguien de lugar. El turno
// sigue con quien lo tenía (si el que se mueve es el que tiene el turno, el turno se va con él).
function iniciativaMover(id, delta){
  if(!soyGM) return;
  const orden = iniciativa.orden.slice();
  const i = orden.findIndex(o => o.id === id), j = i + delta;
  if(i < 0 || j < 0 || j >= orden.length) return;
  const activo = orden[iniciativa.turno] ? orden[iniciativa.turno].id : null;
  [orden[i], orden[j]] = [orden[j], orden[i]];
  const turno = activo ? Math.max(0, orden.findIndex(o => o.id === activo)) : iniciativa.turno;
  guardarIniciativa({orden, turno});
}

// Suma de los modificadores de un stat de un creep (equipo puesto, arma y estados activos): mismo criterio que gm-tools.
function creepModTotalMapa(sc, statId){ return CreepCalculo.modTotal(sc, statId); }   // comun/creep-calculo.js (paso 4 etapa 4a)
// Iniciativa de un creep: Agilidad + lo que la sube (Agilidad o Iniciativa directa). null si todavía no se leyó el creep.
function creepIniMapa(sc){ return sc ? CreepCalculo.statValor(sc, 'ini') : null; }

// 🎲 Tirar iniciativa (2026-09-24, pedido del dueño): un jugador tira la de sus personajes; el GM, la de todos los creeps de la
// lista. El resultado se carga solo junto al nombre (no agrega ni saca filas: los tokens los trae el GM con "Traer tokens").
// La tirada de un jugador queda en la Mesa; las de los creeps no, para no mostrar a los jugadores creeps que no ven (queda un aviso).
async function iniciativaTirar(){
  if(!fbMiembro) return;
  const enLista = new Set(iniciativa.orden.map(o => o.id));
  const propios = [...tokens.entries()].filter(([id, t]) => enLista.has(id) && (soyGM
    ? t.tipo === 'creep'
    : t.tipo === 'pj' && t.duenoUid === fbUsuario.uid && t.fichaId && !t.fichaId.includes(SEP_INVOCACION)));
  if(!propios.length){
    toast(soyGM ? 'No hay creeps en la lista: tocá "Traer tokens" primero' : 'Tu personaje no está en la lista de turnos: pedile al GM que toque "Traer tokens"');
    return;
  }
  const nuevos = new Map(), sinDato = [];
  for(const [id, t] of propios){
    const base = t.tipo === 'creep' ? creepIniMapa(creepPrivadoDe(t.fichaId)) : (() => { const f = fichasPub.get(t.fichaId); const r = f && f.resumen; return r && r.ini !== undefined ? num(r.ini) : null; })();
    if(base === null){ sinDato.push(nombreDe(t)); continue; }
    const fo = formulaParaValor(base);
    const r = (fo && tirarDados(fo.formula)) || {formula: '0', rolls: [], mod: 0, total: 0};
    nuevos.set(id, r.total);
    if(!soyGM) mesaPublicar(`Iniciativa · ${nombreDe(t)}`, r);
  }
  if(sinDato.length) toast(soyGM ? `Sin datos de: ${sinDato.join(', ')}` : 'Abrí tu ficha una vez para que se publique tu Iniciativa y volvé a tirar');
  if(!nuevos.size) return;
  await guardarIniciativa({orden: iniciativa.orden.map(o => nuevos.has(o.id) ? {...o, valor: nuevos.get(o.id)} : o)});
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
function iniciativaSiguiente(){
  const n = iniciativa.orden.length;
  if(!n) return;
  let i = iniciativa.turno, ronda = iniciativa.ronda;
  for(let paso = 0; paso < n; paso++){
    i++;
    if(i >= n){ i = 0; ronda++; }
    if(!iniciativaFueraDeJuego(iniciativa.orden[i].id)) break;   // salta a los caídos (si caen todos, avanza normal)
  }
  if(ronda !== iniciativa.ronda) guardarIniciativa({turno: i, ronda});
  else guardarIniciativa({turno: i});
}

function renderIniciativa(){
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
    if(t && ocultoPorSigiloParaMi(t)) return false;
    return soyGM || !(o.oculto || (t && t.oculto));   // oculto por el GM en la lista, o token oculto
  });
  if(!visibles.length){
    lista.innerHTML = `<div id="iniciativa-vacio">${soyGM ? 'Sin orden todavía: tocá "Traer tokens" y cargá las tiradas.' : 'El GM todavía no armó el orden.'}</div>`;
  }else{
    lista.innerHTML = visibles.map(({o, i}) => {
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
      return `<div class="ini-fila${i === iniciativa.turno ? ' activo' : ''}${fuera ? ' fuera' : ''}" data-ini-fila="${esc(o.id)}" title="${esc(nombre)}${fuera ? ' — caído/derrotado: fuera del orden de turnos hasta que se recupere' : ''}">
        <span class="ini-ficha" style="border-color:${esc(color)}">${mini ? `<img src="${esc(mini)}" alt="">` : esc(inicial(nombre))}</span>
        <span class="ini-nombre">${fuera ? '💀 ' : ''}${oculto ? '🙈 ' : ''}${t && enSigilo(t) ? '🥷 ' : ''}${esc(nombre)}</span>` +
        (puede
          ? `<input class="ini-valor" type="number" step="1" value="${fmt(num(o.valor))}" data-ini-valor="${esc(o.id)}" title="Iniciativa">`
          : `<span class="ini-valor">${fmt(num(o.valor))}</span>`) +
        (soyGM ? `<button type="button" class="ini-quitar" data-ini-subir="${esc(o.id)}" title="Subir un lugar en el orden"${i === 0 ? ' disabled' : ''}>▲</button><button type="button" class="ini-quitar" data-ini-bajar="${esc(o.id)}" title="Bajar un lugar en el orden"${i === iniciativa.orden.length - 1 ? ' disabled' : ''}>▼</button>` : '') +
        (soyGM ? `<button type="button" class="ini-quitar" data-ini-ocultar="${esc(o.id)}" title="${o.oculto ? 'Mostrarlo a los jugadores en la lista' : 'Ocultarlo a los jugadores en la lista'}">${o.oculto ? '🙈' : '👁'}</button><button type="button" class="ini-quitar" data-ini-quitar="${esc(o.id)}" title="Sacar de la lista">✕</button>` : '') +
      '</div>';
    }).join('');
  }
  $('#iniciativa-pie').innerHTML = soyGM
    ? '<button type="button" class="btn" id="ini-traer" title="Poner en la lista todos los tokens del mapa">Traer tokens</button>' +
      '<button type="button" class="btn" id="ini-tirar" title="Tirar la iniciativa de todos los creeps de la lista y cargarla junto a cada nombre">🎲 Tirar iniciativa</button>' +
      '<button type="button" class="btn" id="ini-ordenar" title="Ordenar de mayor a menor">Ordenar</button>' +
      '<button type="button" class="btn primary" id="ini-siguiente" title="Pasar al siguiente en el orden">▶ Siguiente</button>' +
      '<button type="button" class="btn peligro" id="ini-limpiar" title="Vaciar el orden de turnos">Limpiar</button>'
    : (fbMiembro ? '<button type="button" class="btn primary" id="ini-tirar" title="Tirar la iniciativa de tu personaje y cargarla junto a su nombre">🎲 Tirar iniciativa</button>' : '');
  conectarIniciativa();
  iniciativaEncuadrar();
}

function conectarIniciativa(){
  const caja = $('#iniciativa');
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
  caja.querySelectorAll('[data-ini-quitar]').forEach(b => b.onclick = () => {
    const orden = iniciativa.orden.filter(o => o.id !== b.dataset.iniQuitar);
    guardarIniciativa({orden, turno: Math.min(iniciativa.turno, Math.max(0, orden.length - 1))});
  });
  const traer = $('#ini-traer');
  if(traer) traer.onclick = iniciativaPonerTodos;
  const ordenar = $('#ini-ordenar');
  if(ordenar) ordenar.onclick = () => guardarIniciativa({orden: ordenarIniciativa(iniciativa.orden), turno: 0});
  const siguiente = $('#ini-siguiente');
  if(siguiente) siguiente.onclick = iniciativaSiguiente;
  const limpiar = $('#ini-limpiar');
  if(limpiar) limpiar.onclick = () => { if(confirm('¿Vaciar el orden de turnos?')) guardarIniciativa({orden: [], turno: 0, ronda: 1}); };
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
    if(e.button !== 0 || e.target.closest('input')) return;
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
    if(e.target.closest('input')) return;
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
    escucharModo.listo = true;
    modoMapa = nuevo;
    renderModo();
    renderIniciativa();
    renderPanel();
    pedirDibujo();
  }, err => console.error('Error escuchando el modo del mapa:', err));
}

$('#modo-switch').onclick = async () => {
  if(!soyGM) return;
  const nuevo = modoMapa === 'combate' ? 'narrativo' : 'combate';
  try{
    await fbDb.doc(fbRutaCampana(rutaMapaEstado('modo'))).set({modo: nuevo, actualizado: firebase.firestore.FieldValue.serverTimestamp()});
  }catch(err){
    console.error('No se pudo cambiar el modo:', err);
    toast('No se pudo cambiar el modo del mapa');
  }
};

// Nitros que cuesta mover este token: los PJ vinculados a su ficha y los
// creeps vinculados (no las invocaciones ni los NPC). null = se mueve sin
// costo, como también una ficha o creep que todavía no tiene No2 (abrila
// una vez, o abrí gm-tools).
/* Terreno lento (2026-10-04, dueño: arena movediza): una trampa ya disparada con `lento: N` adentro del JSON de trampaEstado hace que cada
   paso que SALE de una de sus casillas cueste N No2 (o lo de siempre, si es más: Rengo). → el costo acumulado de cada paso de la ruta. */
function lentoEn(col, fila){
  let n = 0;
  elementos.forEach(el => {
    if(!el.trampa || !el.disparada || !el.trampaEstado) return;
    let e = null; try{ e = JSON.parse(el.trampaEstado); }catch(x){}
    if(!e || !(num(e.lento) > 0)) return;
    if(celdasDeElemento(el).some(c => c.col === col && c.fila === fila)) n = Math.max(n, num(e.lento));
  });
  return n;
}
// `gratis` (2026-10-04, Pasos gratis): los primeros casilleros de la ruta no cuestan (los que le quedan a ese token en este turno).
// `recargo` (2026-10-04, estado Lento): lo que se suma al primer casillero (el primero del turno cuesta el doble).
function costoPasos(ruta, porCasillero, gratis, recargo){
  const acc = [];
  let s = 0;
  for(let i = 1; i < (ruta || []).length; i++){
    if(i > num(gratis)) s += porCasillero > 0 ? Math.max(porCasillero, lentoEn(ruta[i - 1].col, ruta[i - 1].fila)) : 0;
    if(i === 1) s += num(recargo);
    acc.push(s);
  }
  return acc;
}
const costoRuta = (ruta, porCasillero, pasos, gratis, recargo) => { const a = costoPasos((ruta || []).slice(0, pasos + 1), porCasillero, gratis, recargo); return a.length ? a[a.length - 1] : 0; };

/* Quién ya se movió en este turno (2026-10-04, los pies): Lento cobra doble el primer casillero del turno y Pasos de baile suma Evasión si ya se
   movió. Como los Pasos gratis, lo anota esta pantalla (y el navegador, por si se recarga). El duelo lo pregunta con window.mapaSeMovio. */
const movidosTurno = new Set();
try{ JSON.parse(localStorage.getItem('movidos-turno') || '[]').forEach(k => movidosTurno.add(k)); }catch(e){}
const seMovioEsteTurno = id => !!id && movidosTurno.has(`${id}@${Math.round(num(mantenimientoNumero))}`);
function marcarMovido(id, si){
  const k = `${id}@${Math.round(num(mantenimientoNumero))}`;
  if(si === false) movidosTurno.delete(k); else movidosTurno.add(k);
  try{ localStorage.setItem('movidos-turno', JSON.stringify([...movidosTurno].filter(x => x.endsWith('@' + Math.round(num(mantenimientoNumero)))))); }catch(e){}
}
window.mapaSeMovio = tokenId => seMovioEsteTurno(tokenId);
// Lento: lo que se suma al primer casillero si todavía no se movió en este turno (0 si no está Lento o si no se puede mover).
function lentoRecargo(t, porCasillero){
  if(!(porCasillero > 0) || seMovioEsteTurno(idDeToken(t))) return 0;
  const lento = (typeof confusionEstadosDe === 'function' ? confusionEstadosDe(t) : []).some(e => e && e.activo !== false && (e.lento || /^lento$/i.test(String(e.nombre || '').trim())));
  return lento ? porCasillero : 0;
}

/* Pasos gratis (2026-10-04, dueño): cuántos le quedan a un token en este turno (de Mantenimiento a Mantenimiento). Los usados se anotan en esta
   pantalla (y en el navegador, por si se recarga): los mueve casi siempre la misma persona. */
const pasosGratisUsados = new Map();
const pasosGratisClave = id => `${id}@${Math.round(num(mantenimientoNumero))}`;
try{ const g = JSON.parse(localStorage.getItem('pasos-gratis') || '{}'); Object.entries(g).forEach(([k, v]) => pasosGratisUsados.set(k, num(v))); }catch(e){}
function pasosGratisDe(t){
  if(!t || !t.fichaId) return 0;
  if(t.tipo === 'creep'){ const sc = creepPrivadoDe(t.fichaId); return sc && typeof CreepCalculo !== 'undefined' ? Math.max(0, Math.round(num(CreepCalculo.modTotal(sc, 'pasosgratis')))) : 0; }
  if(String(t.fichaId).includes(SEP_INVOCACION)) return 0;
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

function costoMoverDe(t){
  if(modoMapa !== 'combate') return null;  // en modo narrativo se mueve sin contar No2
  if(t && t.tipo === 'creep') return costoMoverCreep(t);
  if(!t || t.tipo !== 'pj' || !t.fichaId || t.fichaId.includes(SEP_INVOCACION)) return null;
  const f = fichasPub.get(t.fichaId);
  const r = f && f.resumen;
  if(!r || r.costoMover === undefined) return null;
  return {porCasillero: num(r.costoMover), disponibles: num(r.nitros), gratis: pasosGratisRestantes(idDeToken(t)), recargo: lentoRecargo(t, num(r.costoMover))};
}

// Mismas reglas que la ficha publica en resumen.costoMover: 1 por
// casillero, 2 con Rengo, 0 (no se mueve) con Inmovilizado.
function costoMoverCreep(t){
  if(!soyGM || !t.fichaId) return null;
  const sc = creepPrivadoDe(t.fichaId);
  if(!sc || sc.nitros === undefined || sc.nitros === null) return null;
  const activos = (Array.isArray(sc.estados) ? sc.estados : []).filter(e => e && e.activo !== false);
  const porCasillero = activos.some(e => e.inmovilizado) ? 0 : activos.some(e => e.rengo) ? 2 : 1;
  return {porCasillero, disponibles: num(sc.nitros), gratis: pasosGratisRestantes(idDeToken(t)), recargo: lentoRecargo(t, porCasillero)};
}

// 🎮 El GM tomó el control de este personaje (la ficha publica resumen.control = su uid, 2026-09-30): lo usa como si fuera su
// dueño — lo mueve pagando No2, abre su Botonera, le cambia la vida y le pasa el turno.
function controloFicha(fichaId){
  if(!soyGM || !fichaId || !fbUsuario) return false;
  const f = fichasPub.get(String(fichaId).split(SEP_INVOCACION)[0]);
  return !!(f && f.resumen && f.resumen.control === fbUsuario.uid);
}
function puedoMover(t){
  if(!t || !fbUsuario) return false;
  return t.tipo === 'creep' ? soyGM : (t.duenoUid === fbUsuario.uid || controloFicha(t.fichaId));
}
function puedoMoverLibre(t){
  if(!t || !fbUsuario) return false;
  return soyGM || (t.tipo === 'pj' && t.duenoUid === fbUsuario.uid);
}
function activarMoverLibre(id){
  moverLibre = moverLibre === id ? null : id;
  if(moverLibre) sigiloAlertaRoja(tokens.get(id), 'entró en Mover libre', 'Se mueve sin gastar No2 mientras está en sigilo');
  if(moverLibre) toast('Mover libre: arrastrá el token o tocá la casilla de destino (Esc, clic derecho o el mismo botón lo apagan)');
  lienzo.style.cursor = moverLibre ? 'crosshair' : 'default';
  pedirDibujo();
}
function puedoBorrar(t){
  return !!t && !!fbUsuario && (t.duenoUid === fbUsuario.uid || soyGM);
}
function nombreMiembro(uid){
  const m = miembros.get(uid);
  return m ? m.nombre : '(alguien que ya no está)';
}
function inicial(nombre){
  const letra = Array.from(String(nombre || '?').trim())[0] || '?';
  return letra.toUpperCase();
}

