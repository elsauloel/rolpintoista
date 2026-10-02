// js/01-base-y-mapas.js — tramo 1 de 14 del script de mapa.html (paso 5, nivel A: mismo código, en el mismo orden): cabecera, Firebase, geometría de hexágonos, estado, lápiz, terreno y formas, varios mapas guardados.
/* =========================================================
   MAPA DE HEXÁGONOS — Paso 2 del sistema nuevo
   Mapa compartido en vivo: tokens en campanas/<campaña>/tokens, que
   cada uno mueve arrastrando (los PJ su dueño, los creeps el GM) y
   todos ven al instante. Al costado, la Mesa de tiradas.
   Ver docs/plan-sistema-nuevo.md y docs/workflow-firebase.md.
   ========================================================= */

const $ = s => document.querySelector(s);
const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
const fmt = n => Number.isInteger(n) ? n : Math.round(n*100)/100;
const esc = s => String(s??'').replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));

let toastT;
function toast(msg){
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(()=>t.classList.remove('show'), 2600);
}

// El sitio publicado (GitHub Pages) cachea cada archivo hasta 10 minutos:
// sin esto, un iframe podía quedar con la ficha o gm-tools de antes de la
// última actualización. Agrega un parámetro que cambia siempre, así el
// navegador pide la versión real en vez de la que tenía guardada — va
// antes del # si la URL trae uno (después del # no viaja al servidor).
function sinCache(url){
  const [base, hash] = url.split('#');
  const sep = base.includes('?') ? '&' : '?';
  return base + sep + '_v=' + Date.now() + (hash !== undefined ? '#' + hash : '');
}


/* ---------- Firebase (mismo bloque fb* que ficha y gm-tools) ---------- */



function estado(texto){ $('#estado').textContent = texto; }
// La cabecera: "Partida · GM · Usuario" o, para un jugador, "Partida · Personaje · Usuario" (comun/barra.js, barraTextoRol). El
// personaje es el principal (fichaPrincipalId: su token en el mapa que se ve o su primera ficha), así que se rearma al llegar
// fichas, tokens o miembros.
function actualizarCabecera(){
  if(typeof fbMiembro === 'undefined' || !fbMiembro || !fbUsuario) return;
  const id = soyGM ? '' : fichaPrincipalId();
  const f = id ? fichasPub.get(id) : null;
  const texto = barraTextoRol(f ? f.nombre : '');
  if(texto && $('#estado').textContent !== texto) estado(texto);
}

/* ---------- Geometría de hexágonos ----------
   Hexágonos "de punta arriba" en filas; las filas impares corridas medio
   hexágono a la derecha. Cada token guarda su casilla como {col, fila}. */

const HEX = 40;                 // radio del hexágono, en unidades del mapa
const SQ3 = Math.sqrt(3);
const ZOOM_MIN = 0.25, ZOOM_MAX = 3;
// Hexágonos "de lado arriba" (un lado horizontal, no una punta): así el
// frente por defecto (mirando abajo, como vienen casi todas las
// ilustraciones de token) queda alineado a un lado del hexágono, no a un
// vértice. Girado 30° contra la grilla vieja de punta arriba.
const ESQUINAS = Array.from({length: 6}, (_, i) => {
  const a = Math.PI / 180 * (60 * i);
  return [HEX * Math.cos(a), HEX * Math.sin(a)];
});

function hexCentro(col, fila){
  return { x: HEX * 1.5 * col, y: HEX * SQ3 * (fila + 0.5 * (col & 1)) };
}

function mundoAHex(x, y){
  const q = (2 / 3 * x) / HEX;
  const r = (SQ3 / 3 * y - x / 3) / HEX;
  const s = -q - r;
  let rq = Math.round(q), rr = Math.round(r);
  const rs = Math.round(s);
  const dq = Math.abs(rq - q), dr = Math.abs(rr - r), ds = Math.abs(rs - s);
  if(dq > dr && dq > ds) rq = -rr - rs;
  else if(dr > ds) rr = -rq - rs;
  return { col: rq, fila: rr + (rq - (rq & 1)) / 2 };
}

// Rutas: para medir distancias y trazar líneas se pasa a coordenadas
// "cúbicas" (q, r, s), las mismas que usa mundoAHex.
function hexACubo(c){
  const q = c.col;
  const r = c.fila - (c.col - (c.col & 1)) / 2;
  return {q, r, s: -q - r};
}
// Vecino del lado i (de la esquina i a la i+1): está en la dirección
// 60·i grados, en cubo (dq,dr). Compartido por el aura hexagonal y los
// elementos de terreno/formas.
const VECINO_LADO = [[1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]];
// Rota (dq,dr,ds) 60° (sentido horario en pantalla) "pasos" veces —
// mismo sentido que la rotación de tokens y trazos (0° = abajo).
function rotarCubo(dq, dr, pasos){
  let q = dq, r = dr, s = -dq - dr;
  for(let i = 0; i < ((pasos % 6) + 6) % 6; i++){ const nq = -r, nr = -s; s = -q; q = nq; r = nr; }
  return {dq: q, dr: r};
}
// La inversa de hexACubo: col es literalmente q (así se armó hexACubo), y
// fila hay que reconstruirla con el mismo ajuste de paridad que usa esa
// función, solo que sobre col en vez de sobre r.
function cuboACol(q, r){ return q; }
function cuboAFila(q, r){ return r + (q - (q & 1)) / 2; }
function mismoHex(a, b){ return a.col === b.col && a.fila === b.fila; }
function distanciaHex(a, b){
  const A = hexACubo(a), B = hexACubo(b);
  return (Math.abs(A.q - B.q) + Math.abs(A.r - B.r) + Math.abs(A.s - B.s)) / 2;
}
// Casillas en línea recta desde a (sin incluirla) hasta b, una al lado de la
// otra. Sirve cuando el mouse salta varias casillas de golpe.
function lineaHex(a, b){
  const n = distanciaHex(a, b);
  const A = hexACubo(a), B = hexACubo(b);
  const res = [];
  for(let i = 1; i <= n; i++){
    const t = i / n;
    const q = A.q + (B.q - A.q) * t + 1e-6, r = A.r + (B.r - A.r) * t + 1e-6, s = -q - r;
    let rq = Math.round(q), rr = Math.round(r);
    const rs = Math.round(s);
    const dq = Math.abs(rq - q), dr = Math.abs(rr - r), ds = Math.abs(rs - s);
    if(dq > dr && dq > ds) rq = -rr - rs;
    else if(dr > ds) rr = -rq - rs;
    res.push({col: rq, fila: rr + (rq - (rq & 1)) / 2});
  }
  return res;
}

/* ---------- Estado ---------- */

const lienzo = $('#lienzo');
const ctx = lienzo.getContext('2d');
let dpr = 1, anchoPx = 0, altoPx = 0;
let vista = { x: 0, y: 0, zoom: 1 };   // x,y: dónde cae el origen del mapa en pantalla (px)

const tokens = new Map();     // id -> datos del documento
const visibles = new Map();   // id -> {x, y} posición dibujada (se acerca a la real con animación)
let disposicion = [];         // [{id, x, y, radio}] del último dibujo, en orden de dibujo
const miembros = new Map();   // uid -> {nombre, gm}
let soyGM = false;
let seleccion = null;
let arrastre = null;          // {id, x, y, inicioX, inicioY, movio, ruta, costo, libre}
// Mover libre (🦶): id del token que se lleva a otra casilla sin reglas
// (sin Nitros, sin estela, sin Inmovilizado). El dueño en su PJ, el GM en todos.
let moverLibre = null;
// Arrastre del handle de rotación: {id, radio} (radio del token en pantalla,
// fijo durante el arrastre; el centro sale de #hud, que ya está ahí).
let rotando = null;
// Movimiento soltado que gasta Nitros, esperando Confirmar/Cancelar.
let rutaPendiente = null;     // {id, celdas: [{col, fila}], pasos, porCasillero, disponibles}
// Estelas que se ven unos segundos después de mover (las de todos).
const estelas = new Map();    // tokenId -> {celdas, hasta}
const ESTELA_MS = 4000;
const TRAZO_ZONA_GROSOR = 40;  // un trazo por casilleros con este grosor (tope de las reglas) es una ZONA de habilidad: se dibuja rellena y sin números
const TRAZO_MS = 3000;  // cuánto dura un trazo temporal del lápiz (la estela de los tokens usa ESTELA_MS)
const COSTO_GIRO_NO2 = 0;      // Girar el token NO cuesta No2 (2026-09-24: se sacó la regla de 1 No2 por giro de 60° en combate; dejar en 0 para no cobrar)
const giroLibre = new Set();     // ya sin uso: con giro gratis el "primer giro gratis después de moverse" no tiene sentido (se conserva por el deshacer)
const RUTA_MAX_CELDAS = 100;  // tope que aceptan las reglas (200 números)
// Ping (clic derecho en el mapa, sin herramienta que lo use — libre para
// esto): un anillo que se expande y se apaga solo, para todos.
// campanas/<partida>/pings/{auto} (o mapas/{id}/pings/{auto}):
// {x, y, duenoUid, creado}. Nadie lo borra a mano: se borra sola.
const pings = new Map();      // id -> {x, y, duenoUid, creadoMs}
const PING_MS = 1800;
let cortarPingsListener = null;
let paneo = null;             // {inicioX, inicioY, x, y}
let creando = false;
let mapasMenuAbierto = false;   // GM: menú 🗺 del borde izquierdo (mapas guardados + fondo)
let editandoToken = false;    // panel del token en modo "Editar"
// GM: creep completo (parte privada, que solo lee el GM) de cada creep con
// token en el mapa: vida con números y No2 para cobrar al moverlo.
const creepsPriv = new Map();  // creepId -> {sc (null mientras carga), cortar}

// Lo público de fichas y creeps, para vincularlos a los tokens.
const fichasPub = new Map();  // fichaId -> {nombre, duenoUid, resumen, miniatura}
const creepsPub = new Map();  // creepId -> {nombre, orden, resumen, miniatura}
let fondo = null;             // {dato, x, y, ancho} en unidades del mapa
// El fondo va en dos documentos: mapa/fondo (posición y ancho, cambia al
// acomodarlo) y mapa/fondoImagen (la imagen, pesada, cambia solo al
// cargar otra). Así mover el fondo no hace descargar la imagen a todos.
let fondoPos = null;          // {x, y, ancho, dato?} (dato: fondos de antes de separar)
let fondoImagen = '';
let moverFondo = false;       // GM: arrastrar mueve el fondo en vez de la vista
let arrastreFondo = null;     // {inicioX, inicioY, x, y}
let arrastreTrazo = null;     // {id, dx, dy, inicioX, inicioY, movio}: arrastra un trazo permanente
let rotandoTrazo = null;      // {id, cx, cy} (cx,cy: centro en pantalla, fijo durante el arrastre)
let arrastreElemento = null;  // {id, inicioX, inicioY, movio}: arrastra un elemento de terreno/formas
let rotandoElemento = null;   // {id}
// Los creeps de un mapa (comun/creeps-mapas.js: cada creep está en UN mapa, lo que antes eran los grupos de GM Tools): cuántos tiene y
// el botón para traer sus tokens. En GM Tools cada creep se muda de mapa con «🗺 Mover a…».
function creepsDeMapaHtml(mapaId){
  const n = creepsDelMapa(mapaId).length;
  return `<div class="fila" style="margin-top:4px;gap:6px;align-items:center" title="Los creeps se ubican en un mapa desde GM Tools («🗺 Mover a…»), o vinculando un token a un creep">
      <span class="ayuda" style="margin:0">👹 ${n ? `${n} creep${n === 1 ? '' : 's'}` : 'sin creeps'}</span>
      ${n ? `<button type="button" class="btn" data-mapa-traer="${esc(mapaId)}" style="padding:2px 8px;font-size:11.5px" title="Crea (ocultos) los tokens de los creeps de este mapa que todavía no tienen">👹 Traer sus tokens</button>` : ''}
    </div>`;
}       // GM: panel de mapas guardados abierto

/* ---------- Lápiz (caja de herramientas) ----------
   campanas/<partida>/trazos/{auto} (o mapas/{id}/trazos/{auto}): {puntos:
   [x1,y1,x2,y2,…] ya suavizado y simplificado, origen:{x,y}, rotacion,
   color, grosor, permanente, duenoUid, creado}. Por defecto la línea es
   una estela más: se ve un rato (ESTELA_MS) y se borra sola, para todos.
   "Permanente" la deja como un objeto que se puede mover y rotar (lo
   arrastra y lo gira su dueño o el GM), no se borra sola. */
const trazos = new Map();     // id -> {puntos, origen, rotacion, color, grosor, permanente, duenoUid, creadoMs}
let trazoSeleccionado = null;
let dibujando = null;         // {puntos: [{x,y}]} mientras se arrastra el lápiz
let cortarTrazosListener = null;
let lapizColor = '#E0A458';
let lapizPermanente = false;
let lapizEstilo = 'libre';    // 'libre' (a mano alzada) | 'casillas' (marcador de trayectoria atado a la grilla)
try{ lapizEstilo = localStorage.getItem('lapiz-estilo') === 'casillas' ? 'casillas' : 'libre'; }catch(e){}
try{ lapizColor = localStorage.getItem('lapiz-color') || lapizColor; }catch(e){}
try{ lapizPermanente = localStorage.getItem('lapiz-permanente') === '1'; }catch(e){}

/* ---------- Terreno y Formas (caja de herramientas) ----------
   campanas/<partida>/elementos/{auto} (o mapas/{id}/elementos/{auto}):
   {tipo:'flor'|'linea'|'libre', origen:{col,fila}, celdas:[dq1,dr1,…]
   (offsets en cubo desde origen, sin rotar), rotacion (0/60/…/300),
   color, alfa (0-100), solido, invisible, imagen (textura de fondo,
   opcional — cubre la caja del elemento como "cover"), fijado (pineado:
   ya no se selecciona para mover/rotar, clickear y arrastrar mueve el
   mapa como si fuera terreno), duenoUid, creado}. Atado a la grilla: se
   arrastra casillero por casillero y se rota de a 60°, como un token.
   Lo mueven, rotan, pinean o borran su dueño o el GM; cualquiera lo ve
   (salvo invisible, que solo ve el GM). */
const elementos = new Map();  // id -> {tipo, origen, celdas:[{dq,dr}], rotacion, color, alfa, solido, invisible, imagen, imgZoom, imgDX, imgDY, fijado, duenoUid}
let elementoSeleccionado = null;
let dibujandoElemento = null;  // {tipo, origen:{col,fila}, celdas:Map("dq,dr"->{dq,dr})} mientras se arma
let pintandoColision = null;   // {borrar, celdas:Map("col,fila"->{col,fila}), ultima} mientras el GM pinta o borra casilleros de Colisión
// Lo ya dibujado que espera consolidarse (mismo formato): mientras tanto se
// ajustan color, opacidad, etc. en el panel y se ve en vivo. Se crea de
// verdad con un clic en otro lado del mapa, Enter, "✔ Crear" o al salir de
// la herramienta; Esc, clic derecho o "Descartar" lo tiran.
let borradorElemento = null;
const ID_BORRADOR = '__borrador';
let editandoElemento = null;   // {id, original:{...}} mientras el panel ⚙️ está abierto — ver abrirEditorElemento
let cortarElementosListener = null;
const LINEA_MAX_CELDAS = 100;    // largo máximo de una Línea arrastrada
const TAMANO_ELEMENTO_MAX = 30;  // tope del radio (Flor) o largo (Línea); ver el tope de celdas en las reglas
// Terreno y Formas quedaron unificadas en una sola herramienta (decidido
// 2026-09-19): "Sólido" es un tilde más del mismo panel, no una
// herramienta aparte. "Invisible" es solo del GM y solo tiene sentido
// junto con Sólido: un sólido que solo él ve el contorno, pensado para
// marcar sobre el fondo del mapa qué partes ya dibujadas no se pueden
// pisar, sin que el jugador vea un dibujo de más encima.
let elemTipo = 'flor';      // 'flor' | 'linea' | 'libre'
let elemTamano = 1;         // radio (flor) o largo (línea); libre lo ignora
let elemColor = '#3F6FB0';
let elemAlfa = 45;
let elemSolido = false;
let elemInvisible = false;
let elemTrampaEstado = '', elemTrampaEstadoTurnos = 0;   // estado automático de la trampa (nombre de un preset de EstadosAplicar) y cuántos turnos dura (0 = el del preset)
let elemTrampaTeleport = false, elemTrampaDestino = '';   // trampa de teleport: destino "col,fila" (se elige con un clic en el mapa)
// Trampa persistente (2026-09-28, pedido del dueño): al dispararse, además del efecto de siempre (una vez, a
// quien la pisó), el elemento se convierte en una zona (zona:true, ver comun/CLAUDE.md) con el mismo daño/estado,
// y queda puesta zonaTurnos turnos. La resistencia de la zona es aparte de "se evita" de la trampa (esa sigue
// siendo a mano); acá sí es automática, con una dificultad fija (no hay quien tire, como en el asistente de zonas).
let elemTrampaDejaZona = false, elemTrampaZonaTurnos = 3, elemTrampaZonaEnMant = true, elemTrampaZonaCadaPaso = false;
let elemTrampaZonaResistStat = '', elemTrampaZonaResistValor = 12;
let elemTrampaDetectar = 8;   // dificultad para detectarla con Percepción aumentada (P145; trampa común: 8)
let elemTrampaBibOrigen = null;   // de qué trampa de la biblioteca salió la que se está armando (para ⬆ Subir y el aviso 🔔)
let elegirDestinoCb = null;   // esperando un clic en el mapa para elegir el destino de un teleport
let elemTurnos = 0;   // Turnos que dura la forma que se crea (0 = sin límite). Al pasar el N-ésimo Mantenimiento la borra el GM. No se recuerda entre sesiones a propósito.
let elemTrampa = false, elemTrampaNombre = '', elemTrampaDetalle = '', elemTrampaAmiga = false, elemTrampaDano = '', elemTrampaIgnoraDef = false;   // crear el elemento como trampa oculta (Amiga = fuego amigo)
// Trampas recurrentes: las que el usuario deja guardadas para colocarlas más de una vez (por navegador).
let trampasGuardadas = [];
try{ const g = JSON.parse(localStorage.getItem('mapa-trampas-guardadas') || '[]'); if(Array.isArray(g)) trampasGuardadas = g.filter(x => x && typeof x.nombre === 'string').slice(0, 40); }catch(e){}
function guardarTrampasGuardadas(){ try{ localStorage.setItem('mapa-trampas-guardadas', JSON.stringify(trampasGuardadas)); }catch(e){} }
let elemImagen = '';        // data URL de la textura elegida; no se recuerda entre sesiones
try{ elemTipo = localStorage.getItem('elem-tipo') || elemTipo; }catch(e){}
try{ elemTamano = parseInt(localStorage.getItem('elem-tamano'), 10) || elemTamano; }catch(e){}
try{ elemColor = localStorage.getItem('elem-color') || elemColor; }catch(e){}
try{ const a = parseInt(localStorage.getItem('elem-alfa'), 10); if(Number.isFinite(a)) elemAlfa = Math.max(0, Math.min(100, a)); }catch(e){}
try{ elemSolido = localStorage.getItem('elem-solido') === '1'; }catch(e){}
try{ elemInvisible = localStorage.getItem('elem-invisible') === '1'; }catch(e){}

/* ---------- Varios mapas guardados ----------
   campanas/<partida>/mapas/{id} = {nombre, creado}: la lista de mapas que
   el GM tiene armados. El de siempre (antes de esto) sigue viviendo donde
   ya vivía (mapa/fondo, mapa/modo, mapa/iniciativa, tokens/*) bajo el id
   especial MAPA_PRINCIPAL, así no hace falta mover ni un dato para que
   esto funcione. Los mapas nuevos van en mapas/{id}/estado/{doc} y
   mapas/{id}/tokens/{auto}.
   campanas/<partida>/mapa/activo = {mapaId}: cuál ven los jugadores. El
   GM puede estar mirando (y armando) uno distinto — mapaEligiendoGM, por
   navegador — mientras los jugadores siguen viendo el activo. */
const MAPA_PRINCIPAL = '_principal';
let mapaActivo = MAPA_PRINCIPAL;      // el que ven los jugadores
let mapaEligiendoGM = null;           // el que el GM eligió mirar (null: sigue al activo)
let mapaMostrado = MAPA_PRINCIPAL;    // el que está cargado ahora en esta pantalla
let mapaEscuchado = null;             // el que tiene los onSnapshot activos ahora
const mapasLista = new Map();         // id -> {nombre, creadoMs}
try{ mapaEligiendoGM = localStorage.getItem('mapa-viendo') || null; }catch(e){}

function nombreMapa(id){
  const m = mapasLista.get(id);
  if(m) return m.nombre;
  return id === MAPA_PRINCIPAL ? 'Mapa 1' : 'Mapa';
}
// Ruta de un documento del mapa que está mostrado ahora (fondo, fondoImagen,
// modo, iniciativa): en el principal, donde siempre vivieron; en los demás,
// adentro de su propio mapas/{id}/estado/.
function rutaMapaEstado(doc){
  return mapaMostrado === MAPA_PRINCIPAL ? `mapa/${doc}` : `mapas/${mapaMostrado}/estado/${doc}`;
}

// Los onSnapshot del mapa mostrado (fondo, modo, iniciativa, tokens), para
// poder cortarlos al cambiar de mapa y no quedarse escuchando el anterior.
let cortarFondo1 = null, cortarFondo2 = null, cortarModo = null, cortarIniciativa = null, cortarTokensListener = null;
function cortarEscuchasMapa(){
  [cortarFondo1, cortarFondo2, cortarModo, cortarIniciativa, cortarTokensListener, cortarTrazosListener, cortarElementosListener, cortarPingsListener, cortarNiebla].forEach(f => f && f());
  cortarFondo1 = cortarFondo2 = cortarModo = cortarIniciativa = cortarTokensListener = cortarTrazosListener = cortarElementosListener = cortarPingsListener = cortarNiebla = null;
}

// Cambia qué mapa está cargado: corta lo anterior, limpia lo que se venía
// mostrando (para no ver un instante datos del mapa viejo) y arranca de
// nuevo fondo/modo/iniciativa/tokens contra el nuevo.
function cambiarMapaMostrado(nuevoId){
  if(nuevoId === mapaEscuchado) return;
  cortarEscuchasMapa();
  mapaMostrado = nuevoId;
  mapaEscuchado = nuevoId;
  tokens.clear(); visibles.clear(); estelas.clear();
  if(seleccion) seleccionar(null);
  trazos.clear(); trazoSeleccionado = null;
  elementos.clear(); elementoSeleccionado = null;
  pings.clear();
  nieblaActiva = false; nieblaDescubierta = new Set(); nieblaVista = new Set(); nieblaFirma = ''; nieblaFantasmas.clear(); nieblaPendientes.clear();
  giroLibre.clear();
  fondoPos = null; fondoImagen = ''; componerFondo();
  modoMapa = 'narrativo';
  iniciativa = {orden: [], turno: 0, ronda: 1};
  escucharFondo();
  escucharModo();
  escucharIniciativa();
  escucharTokens();
  escucharTrazos();
  escucharElementos();
  escucharPings();
  escucharNiebla();
  actualizarBotonMapas();
  renderNiebla();
  renderModo();
  renderIniciativa();
  renderPanel(true);
  pedirDibujo();
}

// El GM puede estar mirando (y armando) un mapa distinto del que está en
// juego; los jugadores siempre siguen al que está en juego.
function recalcularMapaMostrado(){
  const propio = soyGM && mapaEligiendoGM
    && (mapaEligiendoGM === MAPA_PRINCIPAL || mapasLista.has(mapaEligiendoGM));
  cambiarMapaMostrado(propio ? mapaEligiendoGM : mapaActivo);
}

function escucharMapaActivo(){
  fbDb.doc(fbRutaCampana('mapa/activo')).onSnapshot(doc => {
    mapaActivo = (doc.exists && doc.data().mapaId) || MAPA_PRINCIPAL;
    recalcularMapaMostrado();
    if(tableroAbierto) tableroTokensEscuchar();   // el Tablero sigue al mapa publicado, cambie o no mientras está abierto
  }, err => console.error('Error escuchando el mapa activo:', err));
}

// La lista de mapas guardados (metadatos: nombre y fecha). El mapa
// principal también tiene su entrada acá (se crea sola la primera vez que
// hace falta), para poder renombrarlo igual que a los demás.
function escucharMapas(){
  fbDb.collection(fbRutaCampana('mapas')).onSnapshot(snap => {
    snap.docChanges().forEach(ch => {
      if(ch.type === 'removed'){ mapasLista.delete(ch.doc.id); return; }
      const d = ch.doc.data();
      mapasLista.set(ch.doc.id, {
        nombre: String(d.nombre || 'Mapa').slice(0, 40),
        creadoMs: d.creado && d.creado.toMillis ? d.creado.toMillis() : 0,
      });
    });
    if(soyGM && !mapasLista.has(MAPA_PRINCIPAL)){
      fbDb.doc(fbRutaCampana(`mapas/${MAPA_PRINCIPAL}`))
        .set({nombre: 'Mapa 1', creado: firebase.firestore.FieldValue.serverTimestamp()}, {merge: true})
        .catch(err => console.error('No se pudo preparar el mapa principal:', err));
    }
    recalcularMapaMostrado();
    actualizarBotonMapas();
    renderMapasMenu(true);
  }, err => console.error('Error escuchando la lista de mapas:', err));
}

function actualizarBotonMapas(){
  const boton = $('#toolkit-mapas');
  if(!boton) return;
  boton.hidden = !(fbMiembro && soyGM);   // los mapas guardados los maneja solo el GM
  boton.classList.toggle('distinto', soyGM && mapaMostrado !== mapaActivo);
  boton.title = mapaMostrado === mapaActivo
    ? `Mapas: estás en "${nombreMapa(mapaMostrado)}". Ver otro, publicar, crear uno nuevo, y el fondo`
    : `Mapas: estás armando "${nombreMapa(mapaMostrado)}"; los jugadores ven "${nombreMapa(mapaActivo)}"`;
}

// ＋ Mapa nuevo: el asistente paso a paso común (comun/asistente-mapa.js): nombre y qué creeps se mudan a él.
function crearMapa(){
  const ids = new Set([...mapasLista.keys(), MAPA_PRINCIPAL]);
  const creeps = [...creepsPub.entries()].sort((a, b) => num(a[1].orden) - num(b[1].orden)).map(([id, c]) => {
    const m = CreepsMapas.mapaDe(c, ids);
    return {id, nombre: c.nombre || 'Creep', donde: m === CreepsMapas.RESERVA ? 'Reserva' : nombreMapa(m)};
  });
  AsistenteMapa.abrir({nombre: `Mapa ${mapasLista.size + 1}`, creeps, alCrear: async r => {
    try{
      const id = await CreepsMapas.crearMapa(r.nombre);
      for(const cid of r.creeps){
        const c = creepsPub.get(cid);
        await modificarCreep(cid, sc => { sc.mapa = id; });
        await CreepsMapas.mudarTokens({id: cid, nombre: c ? c.nombre : '', color: c ? c.color : ''}, id);
      }
      mapaEligiendoGM = id;
      try{ localStorage.setItem('mapa-viendo', id); }catch(e){}
      recalcularMapaMostrado();
      toast(`🗺 «${r.nombre}» creado${r.creeps.length ? ` con ${r.creeps.length} creep${r.creeps.length === 1 ? '' : 's'}` : ''}: lo ves solo vos hasta que lo publiques`);
    }catch(err){ console.error('No se pudo crear el mapa:', err); toast('No se pudo crear el mapa'); return false; }
  }});
}

async function renombrarMapa(id){
  const actual = nombreMapa(id);
  const nombre = (prompt('Nuevo nombre del mapa:', actual) || '').trim().slice(0, 40);
  if(!nombre || nombre === actual) return;
  try{ await fbDb.doc(fbRutaCampana(`mapas/${id}`)).set({nombre}, {merge: true}); renderPanel(true); }
  catch(err){ console.error('No se pudo renombrar el mapa:', err); toast('No se pudo renombrar el mapa'); }
}

// Ver un mapa (solo en esta pantalla) vs. publicarlo (lo que pasan a ver
// todos los jugadores).
function verMapa(id){
  mapaEligiendoGM = id;
  try{ localStorage.setItem('mapa-viendo', id); }catch(e){}
  recalcularMapaMostrado();
}

async function publicarMapa(id){
  try{
    await fbDb.doc(fbRutaCampana('mapa/activo')).set({mapaId: id, actualizado: firebase.firestore.FieldValue.serverTimestamp()});
    toast(`Los jugadores ahora ven "${nombreMapa(id)}"`);
  }catch(err){ console.error('No se pudo publicar el mapa:', err); toast('No se pudo publicar el mapa'); }
}

async function borrarMapa(id){
  if(id === MAPA_PRINCIPAL){ toast('El primer mapa no se puede borrar'); return; }
  const nombre = nombreMapa(id);
  if(!confirm(`¿Borrar el mapa "${nombre}" con todo lo que tiene (tokens y dibujos)? No se puede deshacer.`)) return;
  const escrito = prompt(`Para confirmar, escribí el nombre tal cual: ${nombre}`);
  if(escrito === null) return;
  if(escrito.trim().toLowerCase() !== nombre.trim().toLowerCase()){ toast('El nombre no coincide — no se borró nada'); return; }
  try{
    const base = fbDb.doc(fbRutaCampana(`mapas/${id}`));
    const [tokensDocs, estadoDocs, trazosDocs, elementosDocs, pingsDocs] = await Promise.all([
      base.collection('tokens').get(), base.collection('estado').get(), base.collection('trazos').get(), base.collection('elementos').get(), base.collection('pings').get(),
    ]);
    const refs = [...tokensDocs.docs, ...estadoDocs.docs, ...trazosDocs.docs, ...elementosDocs.docs, ...pingsDocs.docs].map(d => d.ref).concat([base]);
    for(let i = 0; i < refs.length; i += 450){
      const lote = fbDb.batch();
      refs.slice(i, i + 450).forEach(r => lote.delete(r));
      await lote.commit();
    }
    if(mapaActivo === id) await publicarMapa(MAPA_PRINCIPAL);
    if(mapaEligiendoGM === id){
      mapaEligiendoGM = null;
      try{ localStorage.removeItem('mapa-viendo'); }catch(e){}
      recalcularMapaMostrado();
    }
    toast(`"${nombre}" borrado`);
  }catch(err){ console.error('No se pudo borrar el mapa:', err); toast('No se pudo borrar el mapa'); }
}

const COLORES = ['#C98545', '#8C2F3E', '#2E6B57', '#3F6FB0', '#7A4FA8', '#A8C256', '#D4574E', '#E0C35A', '#4FA3A0', '#9A867E'];
const HP_COLOR = '#D64545';
// Borde de cada token según de quién es.
const BORDE = {
  propio: '#E0A458',   // dorado: los tuyos
  jugador: '#4CB86A',  // verde: personajes de otros jugadores
  creep: '#D64545',    // rojo: vinculados a un creep de gm-tools
  npc: '#9A958F',      // gris: tokens del GM sin creep vinculado
};
function claseToken(t){
  if(t.tipo === 'creep') return t.fichaId ? 'creep' : 'npc';
  return fbUsuario && t.duenoUid === fbUsuario.uid ? 'propio' : 'jugador';
}
const SP_COLOR = '#3F86E0';
const NO2_COLOR = '#3E9B5B';
const FRENTE_COLOR = '#00D0FF';  // marca el lado que mira el token (rotación): celeste eléctrico, bien saturado (2026-09-24)
const FRENTE_CONTORNO = 'rgba(0,0,0,.92)';   // contorno negro SOLO de esa línea, para que se lea sobre cualquier borde o fondo
// Dibuja la línea del frente de un token de (x1,y1) a (x2,y2): primero una más ancha en negro y encima la de color.
// Alternativa propuesta por el dueño (2026-09-24): un triangulito que flota justo por FUERA de la línea, apuntando hacia
// donde mira, del mismo color saturado y con contorno negro. Se puede prender/apagar (y sacar la línea) con estas dos constantes.
const FRENTE_LINEA = true;
const FRENTE_TRIANGULO = true;
function trazarFrente(x1, y1, x2, y2, rad, z, cx, cy){
  const grosor = Math.max(3.5 / z, rad * 0.19);
  ctx.save();
  ctx.lineCap = 'round';
  if(FRENTE_LINEA){
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
  ctx.strokeStyle = FRENTE_CONTORNO; ctx.lineWidth = grosor + Math.max(2.5 / z, rad * 0.09); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
  ctx.strokeStyle = FRENTE_COLOR; ctx.lineWidth = grosor; ctx.stroke();
  }
  if(FRENTE_TRIANGULO && cx !== undefined){
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    let dx = mx - cx, dy = my - cy;
    const largo = Math.hypot(dx, dy) || 1;
    dx /= largo; dy /= largo;                       // hacia afuera, hacia donde mira
    const px = -dy, py = dx;                        // perpendicular
    const base = Math.max(2.5 / z, rad * 0.09) + grosor / 2 + Math.max(2 / z, rad * 0.06);   // justo por fuera de la línea
    const alto = Math.max(10 / z, rad * 0.38), ancho = Math.max(9 / z, rad * 0.36);
    const bx = mx + dx * base, by = my + dy * base;
    ctx.beginPath();
    ctx.moveTo(bx + px * ancho / 2, by + py * ancho / 2);
    ctx.lineTo(bx - px * ancho / 2, by - py * ancho / 2);
    ctx.lineTo(bx + dx * alto, by + dy * alto);
    ctx.closePath();
    ctx.lineJoin = 'round';
    ctx.fillStyle = FRENTE_COLOR; ctx.fill();
    ctx.strokeStyle = FRENTE_CONTORNO; ctx.lineWidth = Math.max(2 / z, rad * 0.08); ctx.stroke();
  }
  ctx.restore();
}
const ESTADO_COLOR = {buff: '#3E9B5B', debuff: '#8E3FB0', '': '#6F625C'};
const ANCHO_CASILLA = HEX * 1.5;  // ancho de una casilla (hex de lado arriba)

// Ficha, invocación o creep al que está vinculado el token (si sigue
// existiendo). Las invocaciones van como "<fichaId>~<idInvocación>" y
// salen del resumen de la ficha de su personaje.
const SEP_INVOCACION = '~';
function vinculo(t){
  if(!t || !t.fichaId) return null;
  if(t.tipo === 'creep') return creepsPub.get(t.fichaId) || null;
  const [fichaId, invId] = t.fichaId.split(SEP_INVOCACION);
  const ficha = fichasPub.get(fichaId);
  if(!ficha) return null;
  if(!invId) return ficha;
  const inv = ((ficha.resumen && ficha.resumen.invocaciones) || []).find(i => i.id === invId);
  if(!inv) return null;
  return {
    nombre: String(inv.nombre || 'Invocación'),
    duenoUid: ficha.duenoUid,
    miniatura: inv.miniatura || '',
    deQuien: ficha.nombre,
    invocacion: true,
    resumen: {
      hp: inv.hp, hpMax: inv.hpMax, muerto: num(inv.hp) <= 0, dormida: inv.activa === false,
      nitros: inv.nitros, nitrosMax: inv.nitrosMax, oporCosto: inv.oporCosto,
      estados: Array.isArray(inv.estados) ? inv.estados : [],
    },
  };
}
function nombreDe(t){
  const v = vinculo(t);
  return v && v.nombre ? v.nombre : t.nombre;
}
// Barras (0 a 1) y estados del token vinculado. De los creeps solo se
// publica el porcentaje de vida, sin números; los PJ tienen además SP.
function estadoDe(t){
  const v = vinculo(t);
  if(!v || !v.resumen) return null;
  const r = v.resumen;
  const entre01 = x => Math.max(0, Math.min(1, x));
  const hp = r.hpPct !== undefined
    ? entre01(num(r.hpPct) / 100)
    : (num(r.hpMax) > 0 ? entre01(num(r.hp) / num(r.hpMax)) : 0);
  const {sp: spActual, spMax} = spDeResumen(r);
  const sp = t.tipo === 'pj' && spMax > 0 ? entre01(spActual / spMax) : null;
  // No2: de los PJ sale del resumen; de los creeps, de su parte privada (GM).
  const n = valoresNo2(t);
  const no2 = n && n.max > 0 ? entre01(n.valor / n.max) : null;
  return {hp, sp, no2, muerto: !!r.muerto, dormida: !!r.dormida, estados: Array.isArray(r.estados) ? r.estados : []};
}
// SP de una ficha. Las fichas guardadas antes de la Iteración 2 publican
// bonos/bonosMax en vez de sp/spMax (hasta que su dueño las vuelva a abrir).
function spDeResumen(r){
  const nuevo = r.spMax !== undefined;
  return {
    sp: num(nuevo ? r.sp : r.bonos),
    spMax: num(nuevo ? r.spMax : r.bonosMax),
    campoGastado: nuevo ? 'spGastado' : 'bonosGastados',
    campoResumen: nuevo ? 'resumen.sp' : 'resumen.bonos',
  };
}

// Aura y barras que guarda cada token (las elige su dueño en el engranaje).
function auraDe(t){
  const a = t && t.aura;
  // Radio en casilleros enteros; forma 'hex' (sigue la grilla) o 'circulo'.
  const radio = a ? Math.min(30, Math.round(num(a.radio))) : 0;
  if(!(radio > 0)) return null;
  return {
    radio,
    forma: a.forma === 'circulo' ? 'circulo' : 'hex',
    color: /^#[0-9a-fA-F]{6}$/.test(a.color || '') ? a.color : '#E0A458',
  };
}
function barrasDe(t){
  const b = (t && t.barras) || {};
  return {hp: b.hp !== false, sp: b.sp !== false, no2: b.no2 === true};
}
function colorConAlfa(hex, alfa){
  const n = parseInt(String(hex).slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alfa})`;
}

// No2 del token: {valor, max} o null si no se conocen.
function valoresNo2(t){
  if(!t) return null;
  if(t.tipo === 'creep'){
    const sc = creepPrivadoDe(t.fichaId);
    if(!sc || sc.nitros === undefined || sc.nitros === null) return null;
    return {valor: num(sc.nitros), max: Math.max(num(sc.nitros), num(sc.nitrosMax) || num(sc.agl) || 0)};
  }
  if(t.fichaId && t.fichaId.includes(SEP_INVOCACION)){
    // Invocación: sale del resumen de la ficha de su dueño, junto con el resto.
    const v = vinculo(t);
    const r = v && v.resumen;
    if(!r || r.nitros === undefined) return null;
    return {valor: num(r.nitros), max: num(r.nitrosMax) || num(r.nitros)};
  }
  const f = fichasPub.get(t.fichaId);
  const r = f && f.resumen;
  if(!r || r.nitros === undefined) return null;
  return {valor: num(r.nitros), max: num(r.nitrosMax) || num(r.nitros)};
}

const imagenesCache = new Map();  // data URL -> Image
function imagenLista(url){
  if(!url) return null;
  let img = imagenesCache.get(url);
  if(!img){
    img = new Image();
    img.onload = () => pedirDibujo();
    img.src = url;
    imagenesCache.set(url, img);
  }
  return img.complete && img.naturalWidth ? img : null;
}

