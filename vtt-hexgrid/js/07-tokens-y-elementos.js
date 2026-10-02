// js/07-tokens-y-elementos.js — tramo 7 de 14 del script de mapa.html (paso 5, nivel A: mismo código, en el mismo orden): tokens y elementos en Firestore, formas con turnos, colisión, copiar/pegar, editar un elemento.
/* ---------- Tokens en Firestore ---------- */

function coleccionTokensDe(mapaId){
  return mapaId === MAPA_PRINCIPAL
    ? fbDb.collection(fbRutaCampana('tokens'))
    : fbDb.collection(fbRutaCampana(`mapas/${mapaId}/tokens`));
}
function coleccionTokens(){
  return coleccionTokensDe(mapaMostrado);
}

/* =========================================================
   📋 TABLERO DE COMBATE (2026-09-22)
   Para cualquiera (GM o jugador). Muestra solo lo que tiene token en el mapa
   PUBLICADO (mapaActivo) — sea o no el que se está mirando ahora mismo — y,
   a los jugadores, sin lo oculto ni lo que está en sigilo (el GM ve todo).
   Los datos de cada ficha/creep (HP, estados…) ya están en vivo en
   fichasPub/creepsPub; lo único que hace falta acá es saber quién tiene
   token en ESE mapa, con un listener aparte que sigue a mapaActivo (no a
   mapaMostrado, que puede ser otro mientras el GM arma otro escenario).
   ========================================================= */
let tableroAbierto = false;
let tableroTokensActivo = new Map();   // tokenId -> {tipo, fichaId, oculto} del mapa publicado
let tableroTokensCorte = null;
let tableroTokensDe = null;            // qué mapaId está escuchando ahora mismo

function tableroTokensEscuchar(){
  if(tableroTokensDe === mapaActivo && tableroTokensCorte) return;   // ya es el que corresponde
  if(tableroTokensCorte) tableroTokensCorte();
  tableroTokensActivo = new Map();
  tableroTokensDe = mapaActivo;
  tableroTokensCorte = coleccionTokensDe(mapaActivo).onSnapshot(snap => {
    snap.docChanges().forEach(ch => {
      if(ch.type === 'removed'){ tableroTokensActivo.delete(ch.doc.id); return; }
      const d = ch.doc.data();
      tableroTokensActivo.set(ch.doc.id, {
        tipo: d.tipo === 'creep' ? 'creep' : 'pj',
        fichaId: typeof d.fichaId === 'string' ? d.fichaId : '',
        oculto: d.oculto === true,
      });
    });
    renderTablero();
  }, err => {
    console.error('Error escuchando los tokens del tablero:', err);
    $('#tablero-body').innerHTML = '<div class="tablero-vacio">No se pudo leer el tablero.</div>';
  });
}
function tableroTokensDejarDeEscuchar(){
  if(tableroTokensCorte){ tableroTokensCorte(); tableroTokensCorte = null; }
  tableroTokensActivo = new Map();
  tableroTokensDe = null;
}
// Un token (mínimo: tipo/fichaId) alcanza para reusar enSigilo()/vinculo(), que solo miran eso.
function tableroFichaIds(){
  const set = new Set();
  tableroTokensActivo.forEach(t => {
    if(t.tipo !== 'pj' || !t.fichaId || t.fichaId.includes(SEP_INVOCACION)) return;   // el tablero es de personajes, no de invocaciones
    if(!soyGM && (t.oculto || enSigilo(t))) return;
    set.add(t.fichaId);
  });
  return set;
}
function tableroCreepIds(){
  const set = new Set();
  tableroTokensActivo.forEach(t => {
    if(t.tipo !== 'creep' || !t.fichaId) return;
    if(!soyGM && (t.oculto || enSigilo(t))) return;
    set.add(t.fichaId);
  });
  return set;
}
function tableroCardHtml(nombre, imagen, nivel, r, tipo){
  // De los creeps (resumen público) solo llega el porcentaje de vida: la barra va sin números.
  const conNumeros = r.hpPct === undefined || r.hpPct === null;
  const hp = num(r.hp), hpMax = num(r.hpMax);
  const pct = conNumeros ? (hpMax > 0 ? Math.max(0, Math.min(100, hp / hpMax * 100)) : 0) : Math.max(0, Math.min(100, num(r.hpPct)));
  const caido = conNumeros ? (hp <= 0 || r.muerto) : !!r.muerto;
  const {sp, spMax} = spDeResumen(r);
  const spPct = spMax > 0 ? Math.max(0, Math.min(100, sp / spMax * 100)) : 0;
  const estados = (r.estados || []).filter(e => e && e.nombre);
  return `<div class="tablero-card${caido ? ' caido' : ''}">
    <div class="tablero-card-top">
      ${imagen ? `<img class="tablero-foto" src="${esc(imagen)}" alt="">` : ''}
      <div class="tablero-nombre">${esc(nombre)}${nivel ? ` <span class="tablero-nivel">Lv ${fmt(num(nivel))}</span>` : ''}</div>
    </div>
    <div class="tablero-hp-fila">
      <div class="tablero-hp-barra"><div class="tablero-hp-fill" style="width:${pct}%"></div></div>
      ${conNumeros ? `<span class="tablero-hp-txt">${fmt(Math.max(0, hp))}${hpMax ? `/${fmt(hpMax)}` : ''}</span>` : ''}
    </div>
    ${tipo === 'pj' && spMax > 0 ? `<div class="tablero-hp-fila">
      <div class="tablero-hp-barra"><div class="tablero-hp-fill sp" style="width:${spPct}%"></div></div>
      <span class="tablero-hp-txt">${fmt(sp)}/${fmt(spMax)} SP</span>
    </div>` : ''}
    ${caido ? `<div class="tablero-caido">${tipo === 'pj' ? 'Caído' : 'Derrotado'}</div>` : ''}
    ${estados.length ? `<div class="tablero-estados">${estados.map(e => {
      const det = String(e.detalle || '').trim();
      return `<span class="tablero-estado${det ? ' con-tip' : ''}"><b>${esc(e.nombre)}</b>${e.permanente ? '' : (num(e.turnos) ? ` ${fmt(num(e.turnos))}t` : '')}${det ? `<span class="tablero-estado-tip">${esc(det)}</span>` : ''}</span>`;
    }).join('')}</div>` : ''}
  </div>`;
}
function renderTablero(){
  if(!tableroAbierto) return;
  const idsFichas = tableroFichaIds(), idsCreeps = tableroCreepIds();
  const fichas = [...fichasPub.entries()].filter(([id]) => idsFichas.has(id))
    .map(([id, f]) => ({nombre: f.nombre, imagen: f.miniatura, r: f.resumen || {}}))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  const creeps = [...creepsPub.entries()].filter(([id]) => idsCreeps.has(id))
    .map(([id, c]) => ({nombre: c.nombre, imagen: c.miniatura, r: c.resumen || {}}))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  let html = '';
  if(fichas.length){
    html += `<div class="tablero-grupo">Personajes · ${fmt(fichas.length)}</div>`;
    html += `<div class="tablero-grid">${fichas.map(x => tableroCardHtml(x.nombre, x.imagen, x.r.nivel, x.r, 'pj')).join('')}</div>`;
  }
  if(creeps.length){
    html += `<div class="tablero-grupo">Creeps · ${fmt(creeps.length)}</div>`;
    html += `<div class="tablero-grid">${creeps.map(x => tableroCardHtml(x.nombre, x.imagen, null, x.r, 'creep')).join('')}</div>`;
  }
  $('#tablero-body').innerHTML = html || '<div class="tablero-vacio">Todavía no hay nadie con token en el mapa publicado.</div>';
  const total = fichas.length + creeps.length;
  $('#tablero-sello').textContent = total ? `${fmt(total)} en el tablero` : '';
}
function tableroAbrir(){
  tableroAbierto = true;
  $('#tablero-capa').hidden = false;
  tableroTokensEscuchar();
  renderTablero();
}
function tableroCerrar(){
  tableroAbierto = false;
  $('#tablero-capa').hidden = true;
  tableroTokensDejarDeEscuchar();
}
$('#btn-tablero').onclick = tableroAbrir;
$('#tablero-x').onclick = tableroCerrar;
$('#tablero-capa').addEventListener('pointerdown', e => { if(e.target === $('#tablero-capa')) tableroCerrar(); });
document.addEventListener('keydown', e => { if(e.key === 'Escape' && tableroAbierto) tableroCerrar(); });

function coleccionTrazos(){
  return mapaMostrado === MAPA_PRINCIPAL
    ? fbDb.collection(fbRutaCampana('trazos'))
    : fbDb.collection(fbRutaCampana(`mapas/${mapaMostrado}/trazos`));
}

function puedeManipularTrazo(t){
  return !!(t && fbUsuario && (soyGM || t.duenoUid === fbUsuario.uid));
}

function coleccionPings(){
  return mapaMostrado === MAPA_PRINCIPAL
    ? fbDb.collection(fbRutaCampana('pings'))
    : fbDb.collection(fbRutaCampana(`mapas/${mapaMostrado}/pings`));
}
function escucharPings(){
  cortarPingsListener = coleccionPings().onSnapshot(snap => {
    snap.docChanges().forEach(ch => {
      if(ch.type === 'removed'){ pings.delete(ch.doc.id); return; }
      // Cuando el servidor confirma el ping propio llega un cambio 'modified' con la hora del
      // SERVIDOR: si el reloj de esta compu está atrasado, esa hora queda en el futuro, la animación
      // daba un radio negativo, fallaba el dibujo y el ping aparecía recién con el siguiente. Por eso
      // el ping se anota una sola vez, con la hora de acá, y la edad nunca es negativa.
      if(pings.has(ch.doc.id)) return;
      const d = ch.doc.data({serverTimestamps: 'estimate'});
      const creadoMs = d.creado && d.creado.toMillis ? d.creado.toMillis() : Date.now();
      const edad = Math.max(0, Date.now() - creadoMs);
      if(edad >= PING_MS){ coleccionPings().doc(ch.doc.id).delete().catch(() => {}); return; }
      pings.set(ch.doc.id, {x: num(d.x), y: num(d.y), duenoUid: d.duenoUid, creadoMs: Date.now() - edad});
      setTimeout(() => { coleccionPings().doc(ch.doc.id).delete().catch(() => {}); }, PING_MS - edad);
    });
    pedirDibujo();
  }, err => console.error('Error escuchando los pings del mapa:', err));
}
// Clic derecho en el mapa: un anillo que se expande y se apaga solo, para
// todos — "miren acá". No usa herramienta ni selección, así que anda
// aunque haya otra cosa activa (lápiz, terreno…).
async function guardarPing(x, y){
  if(!fbUsuario) return;
  try{
    await coleccionPings().add({
      x, y, duenoUid: fbUsuario.uid, creado: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }catch(err){
    console.error('No se pudo mandar el ping:', err);
  }
}

function coleccionElementos(){
  return mapaMostrado === MAPA_PRINCIPAL
    ? fbDb.collection(fbRutaCampana('elementos'))
    : fbDb.collection(fbRutaCampana(`mapas/${mapaMostrado}/elementos`));
}
function puedeManipularElemento(el){
  return !!(el && fbUsuario && (soyGM || el.duenoUid === fbUsuario.uid));
}
// Un elemento invisible solo lo ven el GM y su creador (el resto, nada).
// Trampas que ESTE navegador descubrió (por percepción, sin pisarlas): desde ahí las ve aunque no sean suyas (2026-09-24).
const trampasVistas = new Set();
try{ (JSON.parse(localStorage.getItem('trampas-vistas-' + FB_CAMPANA) || '[]')).forEach(id => trampasVistas.add(id)); }catch(e){}
function descubrirTrampa(id){
  if(!id || trampasVistas.has(id)) return;
  trampasVistas.add(id);
  try{ localStorage.setItem('trampas-vistas-' + FB_CAMPANA, JSON.stringify([...trampasVistas].slice(-300))); }catch(e){}
  pedirDibujo();
}
// ¿La trampa es de mi bando? (2026-09-30, regla del dueño: el GM se entera de que un jugador colocó una trampa —por el anuncio
// en la Mesa— pero NO de dónde.) Las del GM son del bando de los creeps; las de cualquier jugador, del bando de los jugadores.
function trampaDeMiBando(el){
  const dueno = miembros.get(el.duenoUid);
  const deGM = !!(dueno && dueno.gm);
  return soyGM ? deGM : !deGM;
}
function puedeVerElemento(el){
  // Una trampa sin disparar solo la ve su bando (los jugadores las de los jugadores; el GM las suyas) y quien la descubrió;
  // disparada, todos. El GM no ve dónde están las de los jugadores (antes sí).
  if(el.trampa && !el.disparada && !trampaDeMiBando(el) && !(el.id && trampasVistas.has(el.id))) return false;
  return !el.invisible || puedeManipularElemento(el);
}
// Las casillas que ocupa de verdad ahora mismo (origen + cada offset, ya
// rotado). {col,fila} absolutos.
function celdasDeElemento(el, sinRotar){
  return el.celdas.map(({dq, dr}) => {
    const rot = rotarCubo(dq, dr, sinRotar ? 0 : el.rotacion / 60);
    const c0 = hexACubo(el.origen);
    const q = c0.q + rot.dq, r = c0.r + rot.dr;
    return {col: cuboACol(q, r), fila: cuboAFila(q, r)};
  });
}
function elementoEn(col, fila){
  const lista = [...elementos.entries()].reverse();
  for(const [id, el] of lista){
    if(!puedeVerElemento(el)) continue;  // no se puede seleccionar lo que no se ve
    if(celdasDeElemento(el).some(c => c.col === col && c.fila === fila)) return id;
  }
  return null;
}
// Handle para rotar (60° por paso), a un costado de la casilla origen.
function elementoManijaMundo(el){
  const c = hexCentro(el.origen.col, el.origen.fila);
  const rad = el.rotacion * Math.PI / 180;
  const r = HEX * 1.6;
  return {x: c.x - r * Math.sin(rad), y: c.y + r * Math.cos(rad)};
}
// Botón de pinear/despinear: siempre del lado opuesto a la manija de
// rotar (mismo radio, 180° más), así nunca se pisan sea cual sea la
// rotación.
function elementoPinMundo(el){
  const c = hexCentro(el.origen.col, el.origen.fila);
  const rad = (el.rotacion + 180) * Math.PI / 180;
  const r = HEX * 1.6;
  return {x: c.x - r * Math.sin(rad), y: c.y + r * Math.cos(rad)};
}
// Botón de editar (⚙️): a 90° de la manija de rotar, así con las tres
// (rotar/pinear/editar) nunca se pisan entre sí sea cual sea la rotación.
function elementoGearMundo(el){
  const c = hexCentro(el.origen.col, el.origen.fila);
  const rad = (el.rotacion + 90) * Math.PI / 180;
  const r = HEX * 1.6;
  return {x: c.x - r * Math.sin(rad), y: c.y + r * Math.cos(rad)};
}
// Caja (en el mundo) que envuelve todas las casillas, para que una
// imagen de fondo la cubra entera ("cover", sin achatarse).
function cajaCeldas(celdas){
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  celdas.forEach(c => {
    const h = hexCentro(c.col, c.fila);
    minX = Math.min(minX, h.x - HEX); maxX = Math.max(maxX, h.x + HEX);
    minY = Math.min(minY, h.y - HEX); maxY = Math.max(maxY, h.y + HEX);
  });
  return {minX, minY, w: maxX - minX, h: maxY - minY};
}

function escucharElementos(){
  cortarElementosListener = coleccionElementos().onSnapshot(snap => {
    snap.docChanges().forEach(ch => {
      if(ch.type === 'removed'){
        elementos.delete(ch.doc.id);
        if(elementoSeleccionado === ch.doc.id) elementoSeleccionado = null;
        if(editandoElemento && editandoElemento.id === ch.doc.id) cerrarEditorElemento(false);
        return;
      }
      const d = ch.doc.data();
      const crudo = Array.isArray(d.celdas) ? d.celdas : [];
      const celdas = [];
      for(let i = 0; i + 1 < crudo.length; i += 2) celdas.push({dq: num(crudo[i]), dr: num(crudo[i + 1])});
      const previoElem = elementos.get(ch.doc.id);
      elementos.set(ch.doc.id, {
        id: ch.doc.id,
        tipo: d.tipo === 'linea' || d.tipo === 'libre' ? d.tipo : 'flor',
        origen: {col: Math.round(num(d.origen && d.origen.col)), fila: Math.round(num(d.origen && d.origen.fila))},
        celdas,
        rotacion: (((Math.round(num(d.rotacion) / 60) * 60) % 360) + 360) % 360,
        color: /^#[0-9a-fA-F]{6}$/.test(d.color || '') ? d.color : '#3F6FB0',
        alfa: Math.max(0, Math.min(100, Number.isFinite(d.alfa) ? d.alfa : 45)),
        solido: d.solido === true,
        invisible: d.invisible === true,
        imagen: typeof d.imagen === 'string' ? d.imagen : '',
        imgZoom: Math.max(1, Math.min(6, num(d.imgZoom) || 1)),
        imgDX: num(d.imgDX) || 0,
        imgDY: num(d.imgDY) || 0,
        fijado: d.fijado === true,
        duenoUid: d.duenoUid,
        trampa: d.trampa === true,
        trampaNombre: typeof d.trampaNombre === 'string' ? d.trampaNombre : '',
        trampaDetalle: typeof d.trampaDetalle === 'string' ? d.trampaDetalle : '',
        disparada: d.disparada === true,
        fuegoAmigo: d.fuegoAmigo === true,
        colision: d.colision === true,
        trampaDano: typeof d.trampaDano === 'string' ? d.trampaDano : '',
        trampaIgnoraDef: d.trampaIgnoraDef === true,
        trampaEstado: typeof d.trampaEstado === 'string' ? d.trampaEstado : '',
        trampaDestino: typeof d.trampaDestino === 'string' ? d.trampaDestino : '',   // trampa de teleport ("col,fila")
        portal: d.portal === true,   // Invocar portal (Mago)
        portalDestino: typeof d.portalDestino === 'string' ? d.portalDestino : '',
        usoEn: Number.isFinite(d.usoEn) ? d.usoEn : 0,   // último uso de un portal (hora local de quien lo usó): dispara los pulsos en todas las pantallas
        fuego: d.fuego === true,   // terreno incendiado
        fuegoDano: Math.max(1, Math.min(999, Math.round(num(d.fuegoDano)) || 5)),
        turnos: Math.round(num(d.turnos)) || 0,
        venceMant: Number.isFinite(d.venceMant) ? Math.round(d.venceMant) : null,
        // Zona con efecto persistente (2026-09-28): generaliza fuego (daño y/o estado, con o sin resistencia; ver comun/CLAUDE.md).
        zona: d.zona === true,
        zonaNombre: typeof d.zonaNombre === 'string' ? d.zonaNombre : '',
        zonaDano: typeof d.zonaDano === 'string' ? d.zonaDano : '',
        zonaIgnoraDef: d.zonaIgnoraDef === true,
        zonaEstado: typeof d.zonaEstado === 'string' ? d.zonaEstado : '',
        zonaAmiga: d.zonaAmiga === true,
        zonaResistStat: typeof d.zonaResistStat === 'string' ? d.zonaResistStat : '',
        zonaResistValor: Number.isFinite(d.zonaResistValor) ? d.zonaResistValor : null,
        zonaCasteadorRef: typeof d.zonaCasteadorRef === 'string' ? d.zonaCasteadorRef : '',
        zonaCasteadorTipo: d.zonaCasteadorTipo === 'creep' ? 'creep' : 'pj',
        zonaResueltos: Array.isArray(d.zonaResueltos) ? d.zonaResueltos.filter(x => typeof x === 'string') : [],
        zonaEnMantenimiento: d.zonaEnMantenimiento !== false,
        zonaCadaPaso: d.zonaCadaPaso === true,
        zonaDanoDif: d.zonaDanoDif === true,   // el daño es la diferencia entre las tiradas (2026-10-02)
        zonaDanoTipo: typeof d.zonaDanoTipo === 'string' ? d.zonaDanoTipo : '',
        zonaTiraExtra: typeof d.zonaTiraExtra === 'string' ? d.zonaTiraExtra : '',
        zonaNota: typeof d.zonaNota === 'string' ? d.zonaNota : '',
        // Trampa persistente (2026-09-28): configuración todavía dormida (antes de dispararse) de la zona que va
        // a dejar al activarse — ver trampaResolver. `zonaTurnos` es la duración de ESA zona, aparte de `turnos`
        // (que mientras la trampa está dormida puede significar otra cosa: cuándo se borra sola si no la pisan).
        trampaDejaZona: d.trampaDejaZona === true,
        zonaTurnos: Math.max(1, Math.round(num(d.zonaTurnos)) || 3),
      });
      // Trampa de teleport que se acaba de disparar: pulsos de luz violeta en el punto donde saltó y azul en el destino (2026-09-25).
      if(ch.type === 'modified' && previoElem && !previoElem.disparada && d.disparada === true && typeof d.trampaDestino === 'string' && destinoParsear(d.trampaDestino)){
        teleportEfecto(elementos.get(ch.doc.id));
      }
      // Portal usado por un aliado: los mismos pulsos (violeta donde entró, azul donde salió) en todas las pantallas.
      if(ch.type === 'modified' && previoElem && d.portal === true && Number.isFinite(d.usoEn) && d.usoEn !== previoElem.usoEn && destinoParsear(d.portalDestino)){
        teleportEfecto(elementos.get(ch.doc.id), d.portalDestino);
      }
    });
    pedirDibujo();
    elementosVencidosBarrer();
  }, err => console.error('Error escuchando los elementos del mapa:', err));
}

/* ---------- Formas con turnos (2026-09-24, pedido del dueño) ----------
   Una forma de Terreno y Formas puede llevar `turnos: N` y `venceMant: (Mantenimiento actual) + N`: para efectos que afectan
   un área durante X turnos. Cada ⟳ Mantenimiento del GM cuenta un turno; cuando el número de Mantenimiento llega a `venceMant`
   la forma se elimina sola. Lo borra SIEMPRE el GM (las reglas dejan borrar a su dueño o al GM, y así no se borra dos veces):
   al llegar el Mantenimiento y al cargar los elementos (por si el GM no estaba conectado). Solo barre el mapa que el GM mira. */
const elementosVencidosBorrando = new Set();
function elementosVencidosBarrer(){
  if(!soyGM || mantenimientoNumero === null) return;
  elementos.forEach((el, id) => {
    if(el.venceMant === null || el.venceMant === undefined || mantenimientoNumero < el.venceMant || elementosVencidosBorrando.has(id)) return;
    elementosVencidosBorrando.add(id);
    borrarElemento(id).finally(() => setTimeout(() => elementosVencidosBorrando.delete(id), 5000));
  });
}

/* ---------- Colisión del mapa (2026-09-24, pedido del dueño) ----------
   Una "forma" del creador de Terreno y Formas (solo GM) que ya viene configurada: forma libre, Sólida (bloquea el paso y la
   vista), visible para todos y atada a la grilla. Se pinta casillero por casillero (arrastrando o con clic de a uno), y los
   casilleros que quedan uno al lado del otro se FUSIONAN solos en una única forma libre (al crear, se juntan con las vecinas
   que ya estaban y se reemplazan por una sola). Shift+arrastrar borra casilleros. Se dibuja UN solo contorno alrededor de todo
   lo que está pegado, y adentro se borra la grilla (para que se vea el dibujo del fondo sin líneas). Vive en la misma
   colección `elementos` con `colision: true`, `solido: true`, `tipo: 'libre'`, `fijado: true`. */
let colisionCache = {firma: '', set: new Set(), celdas: []};
// Todas las casillas de colisión juntas (de todos los elementos con colision), recalculadas solo si algo cambia.
function colisionInfo(){
  let f = '';
  elementos.forEach((el, id) => { if(el.colision) f += `${id}:${el.origen.col},${el.origen.fila},${el.rotacion},${el.celdas.length};`; });
  if(f !== colisionCache.firma){
    const set = new Set(), celdas = [];
    elementos.forEach(el => {
      if(!el.colision) return;
      celdasDeElemento(el).forEach(c => { const k = c.col + ',' + c.fila; if(!set.has(k)){ set.add(k); celdas.push(c); } });
    });
    colisionCache = {firma: f, set, celdas};
  }
  return colisionCache;
}
const colKey = c => c.col + ',' + c.fila;
function vecinosDeCelda(c){
  const q = hexACubo(c);
  return VECINO_LADO.map(([vq, vr]) => ({col: cuboACol(q.q + vq, q.r + vr), fila: cuboAFila(q.q + vq, q.r + vr)}));
}
// Grupos de casillas pegadas entre sí (para no dejar una forma "partida en dos" al borrar del medio).
function componentesConexos(celdas){
  const pendientes = new Map(celdas.map(c => [colKey(c), c]));
  const grupos = [];
  while(pendientes.size){
    const [k0, c0] = pendientes.entries().next().value;
    pendientes.delete(k0);
    const grupo = [c0], cola = [c0];
    while(cola.length){
      const c = cola.pop();
      vecinosDeCelda(c).forEach(v => {
        const k = colKey(v);
        if(pendientes.has(k)){ grupo.push(pendientes.get(k)); cola.push(pendientes.get(k)); pendientes.delete(k); }
      });
    }
    grupos.push(grupo);
  }
  return grupos;
}
async function colisionCrear(celdasAbs){
  if(!celdasAbs.length) return false;
  const origen = celdasAbs.reduce((a, c) => (c.col < a.col || (c.col === a.col && c.fila < a.fila)) ? c : a, celdasAbs[0]);
  const c0 = hexACubo(origen);
  const celdas = [];
  celdasAbs.forEach(c => { const q = hexACubo(c); celdas.push(q.q - c0.q, q.r - c0.r); });
  try{
    await coleccionElementos().add({
      tipo: 'libre', origen: {col: origen.col, fila: origen.fila}, celdas, rotacion: 0,
      color: '#D8524B', alfa: 15, solido: true, invisible: false, imagen: '', imgZoom: 1, imgDX: 0, imgDY: 0, fijado: true,
      colision: true, duenoUid: fbUsuario.uid, creado: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return true;
  }catch(err){
    console.error('No se pudo crear la colisión:', err);
    toast(err.code === 'permission-denied' ? 'No se pudo: faltan publicar las reglas nuevas de Firestore' : 'No se pudo crear la colisión');
    return false;
  }
}
// Suma casilleros de colisión: se juntan con las formas de colisión vecinas en una sola (crea la nueva y borra las viejas).
async function colisionPintar(nuevas){
  if(!soyGM || !fbUsuario) return;
  const S = new Map(nuevas.map(c => [colKey(c), c]));
  const ya = colisionInfo().set;
  [...S.keys()].forEach(k => { if(ya.has(k)) S.delete(k); });   // lo que ya es colisión no se repite
  if(!S.size) return;
  const tocan = [];
  elementos.forEach((el, id) => {
    if(!el.colision) return;
    const cs = celdasDeElemento(el);
    if(cs.some(c => vecinosDeCelda(c).some(v => S.has(colKey(v))))) tocan.push([id, cs]);
  });
  const union = new Map(S);
  tocan.forEach(([, cs]) => cs.forEach(c => union.set(colKey(c), c)));
  if(await colisionCrear([...union.values()])) for(const [id] of tocan) await borrarElemento(id);
}
// Saca casilleros de la colisión: cada forma tocada se reemplaza por las partes que quedan (una por cada grupo pegado).
async function colisionBorrar(quitar){
  if(!soyGM || !fbUsuario) return;
  const Q = new Set(quitar.map(colKey));
  const tocados = [];
  elementos.forEach((el, id) => { if(el.colision && celdasDeElemento(el).some(c => Q.has(colKey(c)))) tocados.push([id, celdasDeElemento(el)]); });
  for(const [id, cs] of tocados){
    const quedan = cs.filter(c => !Q.has(colKey(c)));
    let ok = true;
    for(const grupo of componentesConexos(quedan)) ok = (await colisionCrear(grupo)) && ok;
    if(ok) await borrarElemento(id);
  }
}

/* ---------- Copiar y pegar formas (Ctrl+C / Ctrl+V) ----------
   Copia la forma seleccionada (tal como está: color, tamaño, imagen, sólido, trampa, turnos…) y la pega centrada en la casilla
   donde está el mouse; se puede pegar las veces que se quiera. Las de Colisión no se copian (se pintan). Un rearmado de trampa
   vuelve a quedar sin disparar, y los turnos empiezan a contar de nuevo desde el Mantenimiento actual. */
let portapapelesElemento = null;
let punteroMundo = null;   // último punto del mapa donde estuvo el mouse (para pegar ahí)
lienzo.addEventListener('pointermove', e => { const p = posEvento(e); punteroMundo = pantallaAMundo(p.px, p.py); });
function copiarElementoSeleccionado(){
  const el = elementoSeleccionado ? elementos.get(elementoSeleccionado) : null;
  if(!el){ return; }
  if(el.colision){ toast('La Colisión del mapa no se copia: se pinta con su herramienta'); return; }
  if(el.portal){ toast('Los portales no se copian: se invocan con su habilidad'); return; }
  const celdas = [];
  el.celdas.forEach(c => celdas.push(c.dq, c.dr));
  portapapelesElemento = {...el, celdas};
  toast('Forma copiada: Ctrl+V la pega donde tengas el mouse');
}
async function pegarElemento(){
  const c = portapapelesElemento;
  if(!c || !fbUsuario) return;
  const destino = punteroMundo ? mundoAHex(punteroMundo.x, punteroMundo.y) : c.origen;
  const datos = {
    tipo: c.tipo, origen: {col: destino.col, fila: destino.fila}, celdas: c.celdas, rotacion: c.rotacion,
    color: c.color, alfa: c.alfa, solido: !!c.solido, invisible: !!(soyGM && c.invisible), imagen: c.imagen || '',
    imgZoom: c.imgZoom || 1, imgDX: c.imgDX || 0, imgDY: c.imgDY || 0, fijado: false,
    ...(c.trampa ? {trampa: true, trampaNombre: c.trampaNombre || '', trampaDetalle: c.trampaDetalle || '', disparada: false, fuegoAmigo: !!c.fuegoAmigo,
      trampaDano: c.trampaDano || '', ...(c.trampaIgnoraDef ? {trampaIgnoraDef: true} : {}), ...(c.trampaEstado ? {trampaEstado: c.trampaEstado} : {}), ...(c.trampaDestino ? {trampaDestino: c.trampaDestino} : {}),
      trampaDejaZona: !!c.trampaDejaZona,
      ...(c.trampaDejaZona ? {zonaTurnos: Math.max(1, Math.round(num(c.zonaTurnos)) || 3), zonaEnMantenimiento: c.zonaEnMantenimiento !== false, zonaCadaPaso: !!c.zonaCadaPaso,
        ...(c.zonaResistStat ? {zonaResistStat: String(c.zonaResistStat).slice(0, 12), zonaResistValor: Math.round(num(c.zonaResistValor)) || 1} : {})} : {})} : {}),
    ...(c.fuego ? {fuego: true, fuegoDano: c.fuegoDano || 5} : {}),
    ...(c.turnos > 0 ? {turnos: c.turnos, venceMant: Math.round(num(mantenimientoNumero)) + c.turnos} : {}),
    duenoUid: fbUsuario.uid, creado: firebase.firestore.FieldValue.serverTimestamp(),
  };
  try{
    const ref = await coleccionElementos().add(datos);
    elementoSeleccionar(ref.id);
    toast('Forma pegada');
  }catch(err){
    console.error('No se pudo pegar la forma:', err);
    toast(esCuotaAgotada(err) ? CUOTA_AGOTADA_TXT : err.code === 'permission-denied' ? 'No se pudo: faltan publicar las reglas nuevas de Firestore' : 'No se pudo pegar');
  }
}

async function guardarElemento(tipo, origen, celdasSet){
  if(!fbUsuario) return;
  const celdas = [];
  celdasSet.forEach(({dq, dr}) => celdas.push(dq, dr));
  if(!celdas.length) return;
  const invisible = !!(soyGM && elemInvisible);
  try{
    await coleccionElementos().add({
      tipo, origen, celdas, rotacion: 0,
      color: elemColor, alfa: elemAlfa,
      solido: elemSolido, invisible, imagen: elemImagen || '', imgZoom: 1, imgDX: 0, imgDY: 0, fijado: false,
      ...(elemTurnos > 0 ? {turnos: elemTurnos, venceMant: Math.round(num(mantenimientoNumero)) + elemTurnos} : {}),
      ...(elemTrampa ? {trampa: true, trampaNombre: elemTrampaNombre.trim().slice(0, 40), trampaDetalle: elemTrampaDetalle.trim().slice(0, 200), disparada: false, fuegoAmigo: elemTrampaAmiga, trampaDano: trampaDanoValido(elemTrampaDano) ? elemTrampaDano.trim().slice(0, 12) : '', ...(elemTrampaIgnoraDef ? {trampaIgnoraDef: true} : {}), ...(trampaEstadoSpec() ? {trampaEstado: trampaEstadoSpec()} : {})} : {}),
      ...(elemTrampa && elemTrampaTeleport && destinoParsear(elemTrampaDestino) ? {trampaDestino: elemTrampaDestino} : {}),
      // Trampa persistente (2026-09-28): al dispararse se convierte en zona (ver trampaResolver) — acá solo se
      // guarda su configuración, todavía dormida.
      ...(elemTrampa ? {trampaDejaZona: elemTrampaDejaZona} : {}),
      ...(elemTrampa && elemTrampaDejaZona ? {zonaTurnos: elemTrampaZonaTurnos, zonaEnMantenimiento: elemTrampaZonaEnMant, zonaCadaPaso: elemTrampaZonaCadaPaso,
        ...(elemTrampaZonaResistStat ? {zonaResistStat: elemTrampaZonaResistStat, zonaResistValor: elemTrampaZonaResistValor} : {})} : {}),
      duenoUid: fbUsuario.uid, creado: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }catch(err){
    console.error('No se pudo crear el elemento:', err);
    toast(err.code === 'permission-denied' ? 'No se pudo: faltan publicar las reglas nuevas de Firestore' : 'No se pudo crear');
  }
}
// Si algún elemento sólido (Formas) ocupa esa casilla — cualquiera,
// invisible o no: lo invisible solo cambia quién lo VE, no si bloquea.
function elementoSolidoEn(col, fila){
  for(const el of elementos.values()){
    if(el.solido && celdasDeElemento(el).some(c => c.col === col && c.fila === fila)) return true;
  }
  return false;
}
async function moverElemento(id, cambios){
  try{ await coleccionElementos().doc(id).update(cambios); }
  catch(err){ console.error('No se pudo mover el elemento:', err); toast('No se pudo mover'); }
}
async function borrarElemento(id){
  try{ await coleccionElementos().doc(id).delete(); }
  catch(err){ console.error('No se pudo borrar el elemento:', err); toast('No se pudo borrar'); }
}

/* ---------- Editar un elemento ya creado (⚙️ al seleccionarlo) ----------
   Color, transparencia e imagen (elegirla, moverla/hacerle zoom, o
   quitarla) se aplican en vivo sobre el elemento de verdad (para que se
   vea cómo queda en el mapa antes de decidir) y recién se guardan de
   verdad al tocar Guardar; Cancelar (o la ✕, o Esc) los vuelve a como
   estaban. tipo/celdas/solido no se pueden editar — para eso se borra y
   se crea uno nuevo. */
function cerrarEditorElemento(cancelar){
  if(!editandoElemento) return;
  if(cancelar){
    const el = elementos.get(editandoElemento.id);
    if(el) Object.assign(el, editandoElemento.original);
  }
  editandoElemento = null;
  const caja = $('#elem-edit');
  caja.hidden = true;
  caja.innerHTML = '';
  pedirDibujo();
}

function abrirEditorElemento(id){
  const el = elementos.get(id);
  if(!el || !puedeManipularElemento(el)) return;
  if(editandoElemento) cerrarEditorElemento(true);
  editandoElemento = {
    id,
    original: {turnos: el.turnos, venceMant: el.venceMant, color: el.color, alfa: el.alfa, invisible: el.invisible, imagen: el.imagen, imgZoom: el.imgZoom, imgDX: el.imgDX, imgDY: el.imgDY, trampa: el.trampa, trampaNombre: el.trampaNombre, trampaDetalle: el.trampaDetalle, disparada: el.disparada, fuegoAmigo: el.fuegoAmigo, fuegoDano: el.fuegoDano, trampaDano: el.trampaDano, trampaDestino: el.trampaDestino, trampaIgnoraDef: el.trampaIgnoraDef, trampaEstado: el.trampaEstado, tipo: el.tipo},
  };
  renderEditorElemento();
}

function elegirImagenParaElemento(vivo){
  const entrada = $('#elemento-imagen-archivo');
  entrada.onchange = async ev => {
    const file = ev.target.files[0];
    ev.target.value = '';
    if(!file) return;
    try{
      const dato = await prepararImagenElemento(file);
      vivo({imagen: dato, imgZoom: 1, imgDX: 0, imgDY: 0});
      renderEditorElemento();
    }catch(err){
      console.error('No se pudo preparar la imagen del elemento:', err);
      toast(err.message === 'no-image' ? 'Eso no es una imagen' : 'No se pudo usar esa imagen');
    }
  };
  entrada.click();
}

function renderEditorElemento(){
  if(!editandoElemento) return;
  const id = editandoElemento.id;
  const el = elementos.get(id);
  const caja = $('#elem-edit');
  if(!el){ cerrarEditorElemento(false); return; }
  caja.hidden = false;

  const tieneImagen = !!el.imagen;
  const img = tieneImagen ? imagenLista(el.imagen) : null;
  if(tieneImagen && !img){
    // Todavía no cargó (recién puesta en el mapa): en cuanto cargue, se
    // vuelve a armar el panel para que aparezcan el visor y el zoom.
    const cruda = imagenesCache.get(el.imagen);
    if(cruda) cruda.addEventListener('load', () => {
      if(editandoElemento && editandoElemento.id === id) renderEditorElemento();
    }, {once: true});
  }
  let V = null;
  if(tieneImagen && img){
    const cajaMundo = cajaCeldas(celdasDeElemento(el, true));
    const dispScale = Math.min(230 / cajaMundo.w, 170 / cajaMundo.h);
    V = {w: Math.round(cajaMundo.w * dispScale), h: Math.round(cajaMundo.h * dispScale), dispScale, caja: cajaMundo};
  }

  caja.innerHTML = `
    <div id="elem-edit-cab"><span>⚙️ Editar elemento</span><button type="button" id="elem-edit-x" title="Cerrar sin guardar">✕</button></div>
    <label class="etiqueta" style="margin-top:0">Color</label>
    <div class="tk-lapiz-colores">${COLORES.map(c => `<button type="button" class="tk-color${c === el.color ? ' elegido' : ''}" data-eled-color="${c}" style="background:${c}"></button>`).join('')}</div>
    <label class="etiqueta">Transparencia</label>
    <input type="range" id="elem-edit-alfa" min="0" max="100" step="5" value="${el.alfa}">
    ${el.fuego ? `<label class="etiqueta">🔥 Daño de fuego (al entrar y en cada Mantenimiento)</label>
    <input type="number" id="elem-edit-fuego" min="1" max="999" step="1" value="${el.fuegoDano || 5}">` : ''}
    <label class="etiqueta">Turnos que le quedan (0 = sin límite)</label>
    <input type="number" id="elem-edit-turnos" min="0" max="99" step="1" value="${el.venceMant !== null && el.venceMant !== undefined && mantenimientoNumero !== null ? Math.max(0, el.venceMant - mantenimientoNumero) : ''}" placeholder="sin límite" title="Se elimina sola al terminar el último turno (cada ⟳ Mantenimiento cuenta uno)">
    ${soyGM ? `<label class="tk-lapiz-check"><input type="checkbox" id="elem-edit-invisible"${el.invisible ? ' checked' : ''}> Invisible para jugadores</label>` : ''}
    <label class="tk-lapiz-check"><input type="checkbox" id="elem-edit-trampa"${el.trampa ? ' checked' : ''}> Trampa (oculta a los rivales)</label>
    ${el.trampa ? `<div class="tk-lapiz-ayuda" style="margin-top:6px"><b>${esc(el.trampaNombre || 'Sin nombre')}</b><br>${esc((() => { let es = null; try{ es = el.trampaEstado ? JSON.parse(el.trampaEstado) : null; }catch(e){} return trampaResumenFrase(el.trampaNombre, trampaDanoValido(el.trampaDano) ? String(el.trampaDano).trim() : '', !!el.trampaIgnoraDef, es && es.nombre || '', es ? num(es.turnos) : 0, !!el.fuegoAmigo, el.trampaDestino || ''); })())}</div>
    <button type="button" class="btn primary" id="elem-edit-trampa-asistente" style="margin-top:6px;width:100%">🪄 Editar la trampa paso a paso</button>
    ${el.trampaDestino ? '<button type="button" class="btn" id="elem-edit-trampa-destino" style="margin-top:6px;width:100%">🌀 Cambiar el destino del teleport</button>' : ''}
        ${el.disparada ? '<div class="fila" style="margin-top:6px"><span class="hint">Disparada: la ven todos.</span><button type="button" class="btn" id="elem-edit-rearmar">Rearmar</button></div>' : ''}` : ''}
    ${tieneImagen && V ? `
      <label class="etiqueta">Imagen (arrastrar para mover, rueda del mouse para zoom)</label>
      <div class="elem-edit-visor" id="elem-edit-visor" style="width:${V.w}px;height:${V.h}px"><img id="elem-edit-img" src="${el.imagen}"></div>
      <input type="range" id="elem-edit-zoom" min="100" max="600" step="1" value="${Math.round(el.imgZoom * 100)}">
      <div class="fila" style="margin-top:0">
        <button type="button" class="btn" id="elem-edit-imagen-cambiar">Cambiar imagen</button>
        <button type="button" class="btn peligro" id="elem-edit-imagen-quitar">Quitar imagen</button>
      </div>
    ` : `<div class="fila" style="margin-top:0"><button type="button" class="btn" id="elem-edit-imagen-elegir">Elegir imagen de fondo</button></div>`}
    <div class="fila" style="justify-content:flex-end">
      <button type="button" class="btn" id="elem-edit-cancelar">Cancelar</button>
      <button type="button" class="btn primary" id="elem-edit-guardar">Guardar</button>
    </div>`;

  const vivo = cambios => { Object.assign(el, cambios); pedirDibujo(); };

  caja.querySelector('#elem-edit-x').onclick = () => cerrarEditorElemento(true);
  caja.querySelector('#elem-edit-cancelar').onclick = () => cerrarEditorElemento(true);
  caja.querySelector('#elem-edit-guardar').onclick = () => {
    const conTurnos = el.venceMant !== null && el.venceMant !== undefined;
    const cambios = {turnos: conTurnos ? Math.max(1, el.turnos || 1) : firebase.firestore.FieldValue.delete(), venceMant: conTurnos ? el.venceMant : firebase.firestore.FieldValue.delete(),
      ...(el.fuego ? {fuegoDano: Math.max(1, Math.min(999, Math.round(num(el.fuegoDano)) || 5))} : {}),
      color: el.color, alfa: el.alfa, invisible: !!el.invisible, imagen: el.imagen, imgZoom: el.imgZoom, imgDX: el.imgDX, imgDY: el.imgDY,
      trampa: !!el.trampa, trampaNombre: String(el.trampaNombre || '').slice(0, 40), trampaDetalle: String(el.trampaDetalle || '').slice(0, 200), disparada: !!el.disparada, fuegoAmigo: !!el.fuegoAmigo,
      ...(el.trampa ? {trampaDano: trampaDanoValido(el.trampaDano) ? String(el.trampaDano).trim().slice(0, 12) : '', trampaIgnoraDef: !!el.trampaIgnoraDef, trampaDestino: String(el.trampaDestino || '').slice(0, 16), trampaEstado: String(el.trampaEstado || '').slice(0, 300),
        trampaDejaZona: !!el.trampaDejaZona,
        ...(el.trampaDejaZona ? {zonaTurnos: Math.max(1, Math.round(num(el.zonaTurnos)) || 3), zonaEnMantenimiento: el.zonaEnMantenimiento !== false, zonaCadaPaso: !!el.zonaCadaPaso,
          ...(el.zonaResistStat ? {zonaResistStat: String(el.zonaResistStat).slice(0, 12), zonaResistValor: Math.round(num(el.zonaResistValor)) || 1} : {})} : {})} : {})};
    editandoElemento = null;
    caja.hidden = true; caja.innerHTML = '';
    moverElemento(id, cambios);
  };
  caja.querySelectorAll('[data-eled-color]').forEach(b => b.onclick = () => {
    vivo({color: b.dataset.eledColor});
    caja.querySelectorAll('[data-eled-color]').forEach(x => x.classList.toggle('elegido', x === b));
  });
  caja.querySelector('#elem-edit-alfa').oninput = e => vivo({alfa: num(e.target.value)});
  const inFuego = caja.querySelector('#elem-edit-fuego');
  if(inFuego) inFuego.oninput = () => vivo({fuegoDano: Math.max(1, Math.min(999, Math.round(num(inFuego.value)) || 1))});
  const inTurnos = caja.querySelector('#elem-edit-turnos');
  if(inTurnos) inTurnos.oninput = () => { const n = Math.max(0, Math.min(99, Math.round(num(inTurnos.value)) || 0)); vivo(n > 0 ? {turnos: n, venceMant: Math.round(num(mantenimientoNumero)) + n} : {turnos: 0, venceMant: null}); };
  const chkInvisible = caja.querySelector('#elem-edit-invisible');
  if(chkInvisible) chkInvisible.onchange = () => vivo({invisible: chkInvisible.checked});
  const chkTrampa = caja.querySelector('#elem-edit-trampa');
  if(chkTrampa) chkTrampa.onchange = () => {
    vivo({trampa: chkTrampa.checked, disparada: false});
    renderEditorElemento();
    if(chkTrampa.checked && !String(el.trampaNombre || '').trim()) abrirAsistenteTrampaEditar(id, () => { vivo({trampa: false}); if(editandoElemento && editandoElemento.id === id) renderEditorElemento(); });
  };
  const trAsist = caja.querySelector('#elem-edit-trampa-asistente');
  if(trAsist) trAsist.onclick = () => abrirAsistenteTrampaEditar(id);
  const trDest = caja.querySelector('#elem-edit-trampa-destino');
  if(trDest) trDest.onclick = () => elegirDestino(h => { el.trampaDestino = h.col + ',' + h.fila; pedirDibujo(); if(editandoElemento && editandoElemento.id === id) renderEditorElemento(); toast('Destino marcado: tocá Guardar'); });
  const trRearmar = caja.querySelector('#elem-edit-rearmar');
  if(trRearmar) trRearmar.onclick = () => { vivo({disparada: false}); renderEditorElemento(); };

  if(tieneImagen && V){
    const visor = caja.querySelector('#elem-edit-visor');
    const elImg = caja.querySelector('#elem-edit-img');
    const zoomInput = caja.querySelector('#elem-edit-zoom');
    const aplicarImg = () => {
      const escalaBase = Math.max(V.caja.w / img.naturalWidth, V.caja.h / img.naturalHeight);
      const dispEscala = escalaBase * el.imgZoom * V.dispScale;
      const iw = img.naturalWidth * dispEscala, ih = img.naturalHeight * dispEscala;
      const cx = V.w / 2 + el.imgDX * V.dispScale, cy = V.h / 2 + el.imgDY * V.dispScale;
      elImg.style.width = iw + 'px'; elImg.style.height = ih + 'px';
      elImg.style.transform = `translate(${cx - iw / 2}px, ${cy - ih / 2}px)`;
    };
    const clamp = () => {
      const escalaBase = Math.max(V.caja.w / img.naturalWidth, V.caja.h / img.naturalHeight);
      const escalaMundo = escalaBase * el.imgZoom;
      const iwMundo = img.naturalWidth * escalaMundo, ihMundo = img.naturalHeight * escalaMundo;
      const maxDX = Math.max(0, (iwMundo - V.caja.w) / 2), maxDY = Math.max(0, (ihMundo - V.caja.h) / 2);
      el.imgDX = Math.max(-maxDX, Math.min(maxDX, el.imgDX));
      el.imgDY = Math.max(-maxDY, Math.min(maxDY, el.imgDY));
    };
    aplicarImg();
    let arrastre = null;
    visor.addEventListener('pointerdown', e => {
      visor.setPointerCapture(e.pointerId);
      arrastre = {x: e.clientX, y: e.clientY, dx: el.imgDX, dy: el.imgDY};
    });
    visor.addEventListener('pointermove', e => {
      if(!arrastre) return;
      el.imgDX = arrastre.dx + (e.clientX - arrastre.x) / V.dispScale;
      el.imgDY = arrastre.dy + (e.clientY - arrastre.y) / V.dispScale;
      clamp(); aplicarImg(); pedirDibujo();
    });
    const soltar = () => { arrastre = null; };
    visor.addEventListener('pointerup', soltar);
    visor.addEventListener('pointercancel', soltar);
    const porZoom = nuevoZoom => {
      el.imgZoom = Math.max(1, Math.min(6, nuevoZoom));
      clamp(); aplicarImg(); pedirDibujo();
      zoomInput.value = Math.round(el.imgZoom * 100);
    };
    zoomInput.addEventListener('input', () => porZoom(zoomInput.value / 100));
    visor.addEventListener('wheel', e => {
      e.preventDefault();
      porZoom(el.imgZoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1));
    }, {passive: false});
    caja.querySelector('#elem-edit-imagen-quitar').onclick = () => {
      vivo({imagen: '', imgZoom: 1, imgDX: 0, imgDY: 0});
      renderEditorElemento();
    };
    caja.querySelector('#elem-edit-imagen-cambiar').onclick = () => elegirImagenParaElemento(vivo);
  }else{
    caja.querySelector('#elem-edit-imagen-elegir').onclick = () => elegirImagenParaElemento(vivo);
  }
}

// Simplifica una línea a mano alzada (Douglas-Peucker): sacar puntos que
// no cambian casi nada el dibujo, tanto para que no pese como para limar
// el temblor del pulso. tolerancia en unidades del mapa.
function simplificarTrazo(puntos, tolerancia){
  if(puntos.length <= 2) return puntos;
  const distanciaSegmento = (p, a, b) => {
    const dx = b.x - a.x, dy = b.y - a.y;
    const largo2 = dx * dx + dy * dy;
    if(!largo2) return Math.hypot(p.x - a.x, p.y - a.y);
    let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / largo2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
  };
  const recursivo = (pts) => {
    if(pts.length <= 2) return pts;
    let peorD = 0, peorI = 0;
    for(let i = 1; i < pts.length - 1; i++){
      const d = distanciaSegmento(pts[i], pts[0], pts[pts.length - 1]);
      if(d > peorD){ peorD = d; peorI = i; }
    }
    if(peorD <= tolerancia) return [pts[0], pts[pts.length - 1]];
    const izq = recursivo(pts.slice(0, peorI + 1));
    const der = recursivo(pts.slice(peorI));
    return izq.slice(0, -1).concat(der);
  };
  return recursivo(puntos);
}

// Línea suave entre puntos ya simplificados: una curva cuadrática por los
// puntos medios, para que no se note el trazo "poligonal".
function trazarSuave(ctx2, puntos){
  if(puntos.length < 2){
    if(puntos.length === 1){ ctx2.moveTo(puntos[0].x, puntos[0].y); ctx2.lineTo(puntos[0].x, puntos[0].y); }
    return;
  }
  ctx2.moveTo(puntos[0].x, puntos[0].y);
  if(puntos.length === 2){ ctx2.lineTo(puntos[1].x, puntos[1].y); return; }
  for(let i = 1; i < puntos.length - 1; i++){
    const p = puntos[i], sig = puntos[i + 1];
    const mx = (p.x + sig.x) / 2, my = (p.y + sig.y) / 2;
    ctx2.quadraticCurveTo(p.x, p.y, mx, my);
  }
  ctx2.lineTo(puntos[puntos.length - 1].x, puntos[puntos.length - 1].y);
}

function escucharTrazos(){
  let primeraVez = true;
  cortarTrazosListener = coleccionTrazos().onSnapshot(snap => {
    snap.docChanges().forEach(ch => {
      if(ch.type === 'removed'){ trazos.delete(ch.doc.id); if(trazoSeleccionado === ch.doc.id) trazoSeleccionado = null; return; }
      const d = ch.doc.data({serverTimestamps: 'estimate'});
      const puntosCrudos = Array.isArray(d.puntos) ? d.puntos : [];
      const puntos = [];
      const celdas = [];
      const esHex = d.hex === true;
      for(let i = 0; i + 1 < puntosCrudos.length; i += 2){
        if(esHex) celdas.push({col: Math.round(num(puntosCrudos[i])), fila: Math.round(num(puntosCrudos[i + 1]))});
        else puntos.push({x: num(puntosCrudos[i]), y: num(puntosCrudos[i + 1])});
      }
      trazos.set(ch.doc.id, {
        puntos,
        hex: esHex,
        celdas,
        origen: {x: num(d.origen && d.origen.x), y: num(d.origen && d.origen.y)},
        rotacion: num(d.rotacion),
        color: /^#[0-9a-fA-F]{6}$/.test(d.color || '') ? d.color : '#E0A458',
        grosor: num(d.grosor) || 4,
        permanente: d.permanente === true,
        duenoUid: d.duenoUid,
        creadoMs: d.creado && d.creado.toMillis ? d.creado.toMillis() : Date.now(),
      });
      // Temporal (estela): se borra sola a los pocos segundos, para todos
      // (cualquiera que la vea programa el borrado; si el que la dibujó se
      // fue, no queda huérfana).
      if(d.permanente !== true){
        const restan = TRAZO_MS - (Date.now() - (d.creado && d.creado.toMillis ? d.creado.toMillis() : Date.now()));
        setTimeout(() => { coleccionTrazos().doc(ch.doc.id).delete().catch(() => {}); }, Math.max(0, restan));
      }
    });
    pedirDibujo();
  }, err => console.error('Error escuchando los trazos:', err));
}

// Guarda un trazo nuevo ya simplificado, relativo a su propio centro (para
// poder moverlo/rotarlo entero después si es permanente).
async function guardarTrazo(puntosMundo, permanente){
  if(!fbUsuario || puntosMundo.length < 2) return;
  const tolerancia = 2.5 / vista.zoom;
  const suaves = simplificarTrazo(puntosMundo, tolerancia);
  const xs = suaves.map(p => p.x), ys = suaves.map(p => p.y);
  const origen = {x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2};
  const puntos = [];
  suaves.forEach(p => { puntos.push(p.x - origen.x, p.y - origen.y); });
  try{
    await coleccionTrazos().add({
      puntos, origen, rotacion: 0, color: lapizColor, grosor: 4, permanente: !!permanente,
      duenoUid: fbUsuario.uid, creado: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }catch(err){
    console.error('No se pudo guardar el trazo:', err);
    toast(err.code === 'permission-denied' ? 'No se pudo: faltan publicar las reglas nuevas de Firestore' : 'No se pudo dibujar');
  }
}

// Marcador de trayectoria por casilleros: las casillas van en `puntos`
// como [col,fila,col,fila,…] con `hex: true` (atado a la grilla, sin
// origen ni rotación).
async function guardarTrazoHex(celdas, permanente, opc){
  if(!fbUsuario || !celdas.length) return;
  const puntos = [];
  celdas.slice(0, RUTA_MAX_CELDAS).forEach(c => puntos.push(c.col, c.fila));
  try{
    await coleccionTrazos().add({
      puntos, hex: true, origen: {x: 0, y: 0}, rotacion: 0, color: (opc && opc.color) || lapizColor, grosor: (opc && opc.grosor) || 4, permanente: !!permanente,
      duenoUid: fbUsuario.uid, creado: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }catch(err){
    console.error('No se pudo guardar el marcador:', err);
    toast(err.code === 'permission-denied' ? 'No se pudo: faltan publicar las reglas nuevas de Firestore' : 'No se pudo dibujar');
  }
}

async function moverTrazo(id, cambios){
  try{ await coleccionTrazos().doc(id).update(cambios); }
  catch(err){ console.error('No se pudo mover el trazo:', err); toast('No se pudo mover el dibujo'); }
}

async function borrarTrazo(id){
  try{ await coleccionTrazos().doc(id).delete(); }
  catch(err){ console.error('No se pudo borrar el trazo:', err); toast('No se pudo borrar el dibujo'); }
}

// El trazo más cercano al punto (dentro de un margen), el de más arriba
// primero. Solo entre los permanentes: los temporales no se manipulan.
// Dónde va el handle para rotar el trazo seleccionado: a una distancia
// fija de su centro, en la dirección que ya tiene (0° = abajo, sentido
// horario — mismo criterio que el handle de rotación de los tokens).
function trazoManijaMundo(t){
  const rad = t.rotacion * Math.PI / 180;
  const r = HEX * 0.9;
  return {x: t.origen.x - r * Math.sin(rad), y: t.origen.y + r * Math.cos(rad)};
}

// Casilleros de una "flor": el centro y los que están a R pasos o menos.
function celdasFlor(R){
  const res = [];
  for(let dq = -R; dq <= R; dq++){
    for(let dr = Math.max(-R, -dq - R); dr <= Math.min(R, -dq + R); dr++) res.push({dq, dr});
  }
  return res;
}
// Línea recta de N casilleros (contando el origen) en la dirección más
// cercana a "hacia" (offset cubo aproximado, no hace falta que sea exacto).
function celdasLinea(hacia, N){
  let mejor = 0, mejorD = Infinity;
  VECINO_LADO.forEach(([dq, dr], i) => {
    const d = Math.hypot(hacia.dq - dq, hacia.dr - dr);
    if(d < mejorD){ mejorD = d; mejor = i; }
  });
  const [pq, pr] = VECINO_LADO[mejor];
  const res = [];
  for(let i = 0; i < N; i++) res.push({dq: pq * i, dr: pr * i});
  return res;
}

function trazoEn(x, y){
  const margen = 8 / vista.zoom;
  const distanciaSegmento = (px, py, ax, ay, bx, by) => {
    const dx = bx - ax, dy = by - ay;
    const largo2 = dx * dx + dy * dy;
    if(!largo2) return Math.hypot(px - ax, py - ay);
    let t = ((px - ax) * dx + (py - ay) * dy) / largo2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
  };
  const lista = [...trazos.entries()].filter(([, t]) => t.permanente).reverse();
  for(const [id, t] of lista){
    if(t.hex){
      const casilla = mundoAHex(x, y);
      if(t.celdas.some(c => mismoHex(c, casilla))) return id;
      continue;
    }
    const ang = -t.rotacion * Math.PI / 180;
    const cos = Math.cos(ang), sin = Math.sin(ang);
    // Al punto, en el sistema propio del trazo (deshace traslación + rotación).
    const lx = (x - t.origen.x) * cos - (y - t.origen.y) * sin;
    const ly = (x - t.origen.x) * sin + (y - t.origen.y) * cos;
    for(let i = 0; i + 1 < t.puntos.length; i++){
      if(distanciaSegmento(lx, ly, t.puntos[i].x, t.puntos[i].y, t.puntos[i + 1].x, t.puntos[i + 1].y) <= margen + t.grosor / 2){
        return id;
      }
    }
  }
  return null;
}

// La ruta viaja con el movimiento como [col, fila, col, fila…] para que
// los demás vean la estela unos segundos.
async function moverToken(id, col, fila, celdas){
  const t = tokens.get(id);
  if(!t) return;
  giroLibre.clear();   // moverse es una acción: cierra los giros gratis de antes (el de este se abre al guardar)
  // Se mueve ya en pantalla; si Firebase lo rechaza, vuelve solo a su lugar.
  t.col = col; t.fila = fila;
  const ruta = (celdas || []).slice(-RUTA_MAX_CELDAS).flatMap(c => [c.col, c.fila]);
  if(celdas && celdas.length > 1){
    t.rutaJson = JSON.stringify(ruta);
    estelas.set(id, {celdas: celdas.slice(), hasta: Date.now() + ESTELA_MS});
  }
  // Al caminar, el token queda mirando hacia donde fue (el último paso); girar
  // a otro lado cuesta No2 (ver el handle ↻ del HUD).
  let rot;
  if(celdas && celdas.length > 1){
    const pa = hexCentro(celdas[celdas.length - 2].col, celdas[celdas.length - 2].fila);
    const pb = hexCentro(celdas[celdas.length - 1].col, celdas[celdas.length - 1].fila);
    rot = (((Math.round(Math.atan2(-(pb.x - pa.x), pb.y - pa.y) * 180 / Math.PI / 60) * 60) % 360) + 360) % 360;
    if(rot === num(t.rotacion || 0)) rot = undefined; else t.rotacion = rot;
  }
  const conRot = rot === undefined ? {} : {rotacion: rot};
  renderPanel();
  pedirDibujo();
  const doc = coleccionTokens().doc(id);
  try{
    await doc.update(ruta.length > 2 ? {col, fila, ruta, ...conRot} : {col, fila, ...conRot});
    sigiloPublicarAvisos(id);
    percepcionPublicarAvisos(id);
    abrirGiroLibre(id, celdas);
    fuegoEntrada(id, celdas);
    zonaRevisarEntrada(id, celdas);
  }catch(err){
    // Reglas de Firestore sin publicar todavía (no conocen "ruta"): se mueve
    // igual, solo que los demás no ven la estela.
    if(err.code === 'permission-denied' && ruta.length > 2){
      try{ await doc.update({col, fila, ...conRot}); sigiloPublicarAvisos(id); percepcionPublicarAvisos(id); abrirGiroLibre(id, celdas); fuegoEntrada(id, celdas); zonaRevisarEntrada(id, celdas); return; }catch(e){ err = e; }
    }
    sigiloAvisosPendientes.delete(id);
    percepcionAvisosPendientes.delete(id);
    console.error('No se pudo mover el token:', err);
    toast(err.code === 'permission-denied' ? 'No podés mover ese token' : 'No se pudo mover el token');
  }
}

// En combate, después de moverse el token puede elegir hacia dónde queda
// mirando sin gastar No2 (con el handle ↻ del HUD); ese primer giro es gratis y
// cada giro que siga cuesta. Pasa por token y se acaba con el próximo Mantenimiento.
// Cualquier otra acción (propia o ajena) se toma como que decidió no girar: se cierra.
function cerrarGirosLibres(exceptoId){
  [...giroLibre].forEach(id => { if(id !== exceptoId) giroLibre.delete(id); });
}
// Llega una tirada nueva a la Mesa (comun/mesa.js): un ataque, una habilidad, una tirada
// cualquiera cuenta como acción; los avisos del sistema (sigilo, alerta, turno) no.
function mesaAlAccionNueva(docs){
  if(docs.some(d => !['recordatorio', 'alerta', 'alerta-roja', 'mantenimiento', 'reporte'].includes(d.data().desde))) giroLibre.clear();
}
function abrirGiroLibre(id, celdas){
  // Desde 2026-09-24 girar no cuesta No2 (COSTO_GIRO_NO2 = 0): ya no hace falta abrir un "giro gratis" después de moverse.
  if(COSTO_GIRO_NO2 <= 0) return;
  if(modoMapa !== 'combate' || !celdas || celdas.length < 2) return;
  giroLibre.add(id);
  const t = tokens.get(id);
  if(t && seleccion === id) toast('Elegí hacia dónde mirás con el ↻: el primer giro después de moverte es gratis.');
}

// Mover libre: solo la casilla nueva. Se borra la ruta guardada para que
// nadie vea estela. El modo queda prendido para seguir moviendo sin
// clickear 🦶 de nuevo — lo apaga el mismo botón, Esc o cambiar de
// selección (activarMoverLibre, Escape más abajo, seleccionar()).
async function moverTokenLibre(id, col, fila){
  const t = tokens.get(id);
  if(!t){ moverLibre = null; lienzo.style.cursor = 'default'; return; }
  lienzo.style.cursor = 'crosshair';
  if(t.col === col && t.fila === fila){ pedirDibujo(); return; }
  const antes = {col: t.col, fila: t.fila, rutaJson: t.rutaJson};
  const seq0 = nieblaSeq, pend0 = new Set(nieblaPendientes);
  t.col = col; t.fila = fila; t.rutaJson = '[]';
  estelas.delete(id);
  renderPanel();
  pedirDibujo();
  try{
    await coleccionTokens().doc(id).update({col, fila, ruta: firebase.firestore.FieldValue.delete()});
    deshacerRegistrar({tipo: 'libre', id, fichaId: t.fichaId, esCreep: t.tipo === 'creep', costo: 0, col: antes.col, fila: antes.fila, seq0, pend0});
  }catch(err){
    console.error('No se pudo mover el token:', err);
    Object.assign(t, antes);
    visibles.delete(id);
    pedirDibujo();
    toast(err.code === 'permission-denied'
      ? (soyGM && t.tipo === 'pj' ? 'No se pudo: faltan publicar las reglas nuevas de Firebase' : 'No podés mover ese token')
      : 'No se pudo mover el token');
  }
}

