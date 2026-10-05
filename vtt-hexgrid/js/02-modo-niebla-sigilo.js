// js/02-modo-niebla-sigilo.js — tramo 2 de 14 del script de mapa.html (paso 5, nivel A: mismo código, en el mismo orden): modo narrativo/combate, niebla, sigilo, rango, polilla, detección, oportunidad, menú de trampas.
/* ---------- Modo del mapa: narrativo / combate ----------
   campanas/<partida>/mapa/modo = {modo}. Lo cambia el GM y lo ven todos.
   Narrativo (verde): la estela se ve pero moverse no gasta No2.
   Combate (rojo): cada casillero gasta No2; solo se pide confirmar si el
   movimiento se pasa de los No2 que quedan. */
let modoMapa = 'narrativo';

function renderModo(){
  bnModoCambio();   // ⚗ Botonera nueva: los Talentos cambian de lugar
  const b = $('#modo-switch');
  const combate = modoMapa === 'combate';
  b.dataset.modo = modoMapa;
  b.setAttribute('aria-checked', combate ? 'true' : 'false');
  $('#modo-texto').textContent = combate ? 'Combate' : 'Narrativo';
  b.disabled = !soyGM;
  b.title = soyGM ? `Pasar a modo ${combate ? 'narrativo' : 'combate'}` : 'Modo del mapa (lo cambia el GM)';
  renderLinkHerramienta();
}

// Acceso directo en otra pestaña: el GM a gm-tools, el jugador a su ficha
// (abre la última que usó en esta partida, o la lista de personajes).
function renderLinkHerramienta(){
  const a = $('#link-herramienta');
  if(!fbMiembro || !FB_CAMPANA){ a.hidden = true; return; }
  const partida = '?partida=' + encodeURIComponent(FB_CAMPANA);
  a.href = soyGM ? '../gm-toolset/gm-tools.html' + partida : '../ficha-personaje/ficha.html' + partida;
  a.textContent = soyGM ? '⚔ GM Tools' : '📜 Mi ficha';
  a.title = soyGM ? 'Abrir GM Tools en una pestaña nueva' : 'Abrir tu ficha en una pestaña nueva';
  a.hidden = false;
}

/* ---------- Niebla de guerra ----------
   Doc `mapa/niebla` (o `mapas/{id}/estado/niebla`): {activa, descubiertas:
   [celdas empaquetadas]}. Doble niebla: NEGRA (nunca vista: no se ve ni el
   mapa ni los tokens) y GRIS semitransparente (ya descubierta, pero fuera del
   campo de visión de ahora: se ve el mapa, no los tokens). Todos los
   personajes jugadores ven lo mismo (la unión de sus campos de visión) y lo
   descubierto es del grupo y queda guardado. El GM lo ve todo, con la opción
   de "Como jugador". Campo de visión por defecto: radio de 6 hexágonos menos
   una cuña ciega de 120° hacia atrás (ver docs/preguntas-abiertas.md, P47). */
const NB_OFF = 100000, NB_K = 200001;
const VISION_RADIO = 6;        // radio de visión normal (luz «Normal» de la escena)
const LUZ_MIN = 1, LUZ_MAX = 20;
let luzEscena = VISION_RADIO;   // radio de visión base de ESTE mapa (lo fija el GM en 👁 → 💡 Luz de la escena): a más luz, más se ve
const LUZ_PRESETS = [[1, "Ceguera casi total"], [2, "Oscuridad"], [3, "Penumbra"], [4, "Noche de luna"], [5, "Anochecer"], [6, "Normal"], [8, "Día claro"], [10, "Pleno día"], [12, "Cielo despejado"]];
const VISION_CUNA_CIEGA = 60;   // grados a cada lado de "atrás" que no se ven (120° en total)
let nieblaActiva = false;
let nieblaDescubierta = new Set();   // claves empaquetadas (col, fila)
let nieblaVista = new Set();         // lo que ven ahora los personajes jugadores
let nieblaFirma = '';                // para recalcular solo cuando algo se movió
let nieblaFantasmas = new Map();     // tokenId -> {col, fila}: última posición vista
let nieblaComoJugador = false;       // solo GM, por navegador
let visionCreepsActiva = false;      // solo GM, por navegador: ver lo que ven los creeps (niebla semitransparente + lo que tapan los sólidos)
let nieblaPendientes = new Set(), nieblaTimer = null;
let nieblaSeq = 0;                    // lotes de celdas que ESTA pantalla descubrió (para Ctrl+Z)
const nieblaLog = [];
let cortarNiebla = null;
try{ nieblaComoJugador = localStorage.getItem('niebla-como-jugador') === '1'; }catch(e){}
try{ visionCreepsActiva = localStorage.getItem('vision-creeps') === '1'; }catch(e){}

const nbPack = (col, fila) => (col + NB_OFF) * NB_K + (fila + NB_OFF);
const nbUnpack = k => ({col: Math.floor(k / NB_K) - NB_OFF, fila: (k % NB_K) - NB_OFF});
// La niebla tapa para los jugadores, y para el GM solo si eligió "Como jugador".
function nieblaAplica(){ return nieblaActiva && (!soyGM || nieblaComoJugador); }
// Sigilo (paso 1, todo visual): un token con el estado alterado "Sigilo"
// se ve semitransparente; un creep en sigilo no lo ven los jugadores. (Más
// adelante: el GM tampoco verá a los personajes en sigilo salvo con su 👁, y
// el cono y la alerta — ver docs/plan-sistema-nuevo.md, "Sigilo".)
function enSigilo(t){
  const e = estadoDe(t);
  if(!e) return false;
  const nom = s => String((s && s.nombre) || '').trim().toLowerCase();
  // Marcado (2026-10-05): no puede estar en sigilo (la marca se lo saca; esto cubre el ratito hasta que se guarda).
  return e.estados.some(s => nom(s) === 'sigilo') && !e.estados.some(s => s && s.activo !== false && (s.marcado || nom(s) === 'marcado'));
}
// Marcado (2026-10-05, Varita del rastreador y de la luz): brilla y se lo ve también a través de la niebla.
function marcado(t){
  const e = estadoDe(t);
  return !!(e && e.estados.some(s => s && s.activo !== false && (s.marcado || String(s.nombre || '').trim().toLowerCase() === 'marcado')));
}
/* 🌫 Niebla de una varita (2026-10-05): las casillas cubiertas (claves nbPack), recalculadas solo si cambian. Un rival adentro no se ve (salvo
   Marcado, o con un token de tu bando a 1 casilla: adentro se ve a 1); no se ve a través (con la niebla de guerra) ni se lo elige como objetivo. */
let nieblaVaritaCache = {firma: '', set: new Set()};
function nieblaSet(){
  let f = '';
  elementos.forEach((el, id) => { if(el.niebla) f += `${id}:${el.origen.col},${el.origen.fila},${el.celdas.length};`; });
  if(f !== nieblaVaritaCache.firma){
    const s = new Set();
    elementos.forEach(el => { if(el.niebla) celdasDeElemento(el).forEach(c => s.add(nbPack(c.col, c.fila))); });
    nieblaVaritaCache = {firma: f, set: s};
  }
  return nieblaVaritaCache.set;
}
function tapadoPorNiebla(t){
  if(!t || !nieblaSet().has(nbPack(t.col, t.fila)) || marcado(t)) return false;
  if(soyGM ? (t.tipo !== 'pj' || ojoRevelando) : t.tipo !== 'creep') return false;   // solo tapa a los rivales (el GM, como con el sigilo: con el 👁 ve)
  const mio = soyGM ? 'creep' : 'pj';
  for(const x of tokens.values()) if(x !== t && x.tipo === mio && !x.oculto && distanciaHex(x, t) <= 1) return false;
  return true;
}
/* ---------- Sigilo: cono de detección y zona de alerta ----------
   Cono (16 hexágonos azules): un rombo de 4 × 4 que arranca en el hexágono
   de justo delante del token. Alerta (naranja y rojo): el anillo alrededor del
   cono más los vecinos del token, salvo el de atrás. Los elementos Sólidos
   tapan la vista: lo que queda detrás de uno no cuenta. Los tienen los
   personajes, los creeps y las invocaciones por igual. */
const CONO_LADO = 4;
let solidosCache = {firma: '', set: new Set()};
function solidosFirma(){
  let f = '';
  elementos.forEach((el, id) => { if(el.solido) f += `${id}:${el.origen.col},${el.origen.fila},${el.rotacion},${el.celdas.length};`; });
  return f;
}
// Casillas ocupadas por elementos Sólidos (claves nbPack), recalculadas solo si cambian.
function solidosSet(){
  const f = solidosFirma();
  if(f !== solidosCache.firma){
    const s = new Set();
    elementos.forEach(el => { if(el.solido) celdasDeElemento(el).forEach(c => s.add(nbPack(c.col, c.fila))); });
    solidosCache = {firma: f, set: s};
  }
  return solidosCache.set;
}
// ¿Se ve `hasta` desde `desde`? No si hay un sólido en el medio (el propio
// sólido de destino sí: se ve la pared, no lo que hay detrás).
function lineaLibre(desde, hasta, solidos){
  if(!solidos.size) return true;
  const l = lineaHex(desde, hasta);
  for(let i = 0; i < l.length - 1; i++) if(solidos.has(nbPack(l[i].col, l[i].fila))) return false;
  return true;
}
// {cono:[{col,fila}], alerta:[{col,fila}]} de un token, según hacia dónde mira.
function zonasSigilo(t){
  const k = ((Math.round(num(t.rotacion || 0) / 60) % 6) + 6) % 6;
  const fi = (k + 1) % 6;   // lado del frente (0° = abajo = lado 1)
  const F = VECINO_LADO[fi], A = VECINO_LADO[(fi + 1) % 6], B = VECINO_LADO[(fi + 5) % 6], atras = VECINO_LADO[(fi + 3) % 6];
  const c0 = hexACubo({col: t.col, fila: t.fila});
  const solidos = solidosSet();
  const origen = {col: t.col, fila: t.fila};
  const pos = (q, r) => ({col: cuboACol(q, r), fila: cuboAFila(q, r)});
  const cono = new Map();
  for(let a = 0; a < CONO_LADO; a++){
    for(let b = 0; b < CONO_LADO; b++){
      const c = pos(c0.q + F[0] + a * A[0] + b * B[0], c0.r + F[1] + a * A[1] + b * B[1]);
      cono.set(nbPack(c.col, c.fila), c);
    }
  }
  const propia = nbPack(t.col, t.fila);
  const alerta = new Map();
  const sumarVecinos = (q, r, sinAtras) => {
    VECINO_LADO.forEach(([dq, dr]) => {
      if(sinAtras && dq === atras[0] && dr === atras[1]) return;
      const c = pos(q + dq, r + dr), key = nbPack(c.col, c.fila);
      if(key !== propia && !cono.has(key)) alerta.set(key, c);
    });
  };
  cono.forEach(c => { const cu = hexACubo(c); sumarVecinos(cu.q, cu.r, false); });
  sumarVecinos(c0.q, c0.r, true);
  const libre = c => !solidos.has(nbPack(c.col, c.fila)) && lineaLibre(origen, c, solidos);
  return {cono: [...cono.values()].filter(libre), alerta: [...alerta.values()].filter(libre)};
}
// Quien está en sigilo ve las zonas de los rivales que ve: un jugador, las de los
// creeps; el GM con un creep en sigilo, las de los personajes.
// 👓 Lentes (grupo flotante del mapa): un menú que prende el modo lentes y deja elegir qué conos y
// zonas se ven — todos, solo aliados, rivales o NPC, o solo los de los tokens que se marquen.
// Apagado, el mapa funciona exactamente igual que siempre.
/* ---------- 📏🔮 Visualizador de rango ----------
   Muestra, alrededor de tu propio token, el área de tu Rango (Destreza) o tu Rango de casteo (Especial) — los mismos
   números que publica la ficha en resumen.rng/resumen.rangocasteo (comun de ambos: solo tu personaje, no invocaciones
   ni creeps). Modo local, no se sincroniza con nadie más; se apaga tocando el botón de vuelta, con Esc o cambiando
   de token seleccionado. */
let rangoActivo = false, rangoMagicoActivo = false;
function miTokenPrincipal(){
  if(!fbUsuario) return null;
  for(const t of tokens.values()){
    if(t.tipo === 'pj' && t.duenoUid === fbUsuario.uid && t.fichaId && !t.fichaId.includes(SEP_INVOCACION)) return t;
  }
  return null;
}

/* ---------- 🦋 Polilla mística (2026-09-27) ----------
   Mismo botón flotante que ya existe en ficha-personaje/ficha.html, portado acá para que
   también se pueda usar sin tener que abrir la Botonera: mientras el estado «Polilla
   revoloteando» esté activo en TU personaje, un botón fijo abajo a la izquierda (mismo lugar y
   estilo que en la ficha) deja sumarle +2 a tu última tirada de la Mesa — mesaMiUltima, la sigue
   comun/mesa.js — y se anuncia; el estado se saca con hudEstadoCambiar, la misma transacción que
   usa el HUD para sacarle cualquier estado a tu propia ficha. */
function polillaIndice(){
  const t = miTokenPrincipal();
  if(!t) return -1;
  const f = fichasPub.get(t.fichaId);
  const estados = (f && f.resumen && f.resumen.estados) || [];
  return estados.findIndex(e => e && e.activo !== false && /^Polilla revoloteando/i.test(String(e.nombre || '')));
}
function renderPolillaBoton(){
  const idx = polillaIndice();
  let b = document.getElementById('polilla-flotante');
  if(idx < 0){ if(b) b.remove(); return; }
  if(!b){
    b = document.createElement('button');
    b.type = 'button';
    b.id = 'polilla-flotante';
    b.style.cssText = 'position:fixed;left:16px;bottom:16px;z-index:999999;background:#3a1f4a;color:#e9d6ff;border:2px solid #b98cff;border-radius:16px;padding:10px 16px;font-size:15px;font-weight:800;cursor:pointer;box-shadow:0 8px 26px rgba(0,0,0,.6),0 0 14px rgba(180,120,255,.5);animation:polilla-latido 2.6s ease-in-out infinite alternate;text-align:left;transform-origin:left bottom';
    b.innerHTML = '<div>🦋 Polilla mística</div><small style="display:block;font-weight:500;font-size:11px;opacity:.9" id="polilla-flotante-sub"></small>';
    b.onclick = usarPolillaMapa;
    document.body.appendChild(b);
    if(!document.getElementById('polilla-css')){
      const s = document.createElement('style');
      s.id = 'polilla-css';
      s.textContent = '@keyframes polilla-latido{0%{transform:scale(1);box-shadow:0 8px 26px rgba(0,0,0,.6),0 0 10px rgba(180,120,255,.4)}100%{transform:scale(1.025);box-shadow:0 8px 26px rgba(0,0,0,.6),0 0 18px rgba(190,130,255,.65)}}';
      document.head.appendChild(s);
    }
  }
  $('#polilla-flotante-sub').textContent = mesaMiUltima ? `+2 a tu última tirada: ${mesaMiUltima.origen} (${fmt(num(mesaMiUltima.total))})` : 'todavía no hiciste ninguna tirada';
}
async function usarPolillaMapa(){
  const idx = polillaIndice();
  const t = miTokenPrincipal();
  if(idx < 0 || !t) return;
  if(!mesaMiUltima){ toast('Todavía no hiciste ninguna tirada para sumarle el +2'); return; }
  const origen = mesaMiUltima.origen, nuevoTotal = num(mesaMiUltima.total) + 2;
  try{ await hudEstadoCambiar(t, idx, 'quitar'); }   // la polilla se gasta
  catch(err){ console.error('No se pudo sacar el estado de la Polilla mística:', err); return; }
  try{
    await fbDb.collection(fbRutaCampana('tiradas')).add({
      uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: nombreDe(t),
      origen: `🦋 ${nombreDe(t)} usó la Polilla mística`, formula: `+2 a su última tirada — ${origen}: ahora ${fmt(nuevoTotal)}`,
      rolls: [], mod: 0, total: 0, desde: 'recordatorio',
      cuando: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }catch(err){ console.error('No se pudo avisar el uso de la Polilla mística:', err); }
  toast(`🦋 Polilla mística: +2 a "${origen}" (ahora ${fmt(nuevoTotal)})`);
  mesaMiUltima = null;   // hace falta una tirada nueva para la próxima
  renderPolillaBoton();
}
function renderBotonesRango(){
  const b1 = $('#btn-rango'), b2 = $('#btn-rango-magico');
  if(b1) b1.classList.toggle('activo', rangoActivo);
  if(b2) b2.classList.toggle('activo', rangoMagicoActivo);
}
// Rango (Destreza) y Rango de casteo (Especial) de un token: los de un personaje salen de su ficha (resumen.rng/rangocasteo);
// los de un creep, solo para el GM, de su Destreza y Especial más lo que los sube. null = no se sabe (invocación, todavía sin leer…).
// Calculadora de crítico (comun/critico.js): los tokens con sus datos de crítico, para elegir quién ataca y quién defiende y que se complete solo.
// Personajes: lo que publica su ficha (resumen.crit, critpot, armaTipo, rescrit, def); creeps (solo el GM): su parte privada.
function criticoFuentes(){
  const lista = [];
  tokens.forEach((t, id) => {
    if(!t.fichaId || String(t.fichaId).includes(SEP_INVOCACION)) return;
    if(t.oculto && !soyGM) return;
    if(t.tipo === 'creep'){
      if(!soyGM) return;
      const sc = creepPrivadoDe(t.fichaId);
      if(!sc) return;
      lista.push({id, nombre: nombreDe(t) + ' (creep)', tipo: num(sc.armaTipo) || 0, frecuente: creepModTotalMapa(sc, 'crit'), potente: creepModTotalMapa(sc, 'critpot'),
        resistencias: [0, 1, 2, 3, 4].map(i => num((sc.crit || [])[i])), defensa: creepDefensaMapa(sc)});
      return;
    }
    const f = fichasPub.get(t.fichaId), r = f && f.resumen;
    if(!r) return;
    lista.push({id, nombre: nombreDe(t), tipo: num(r.armaTipo) || 0, frecuente: r.crit === undefined ? undefined : num(r.crit), potente: r.critpot === undefined ? undefined : num(r.critpot),
      resistencias: Array.isArray(r.rescrit) ? r.rescrit.map(num) : undefined, defensa: r.def === undefined ? undefined : num(r.def)});
  });
  return lista;
}
function rangoDeToken(t){
  if(!t || !t.fichaId) return null;
  if(t.tipo === 'creep'){
    const sc = creepPrivadoDe(t.fichaId);
    if(!sc) return null;
    return {rng: num(sc.des) + creepModTotalMapa(sc, 'des') + creepModTotalMapa(sc, 'rng'), casteo: num(sc.esp) + creepModTotalMapa(sc, 'esp') + creepModTotalMapa(sc, 'rangocasteo')};
  }
  if(t.fichaId.includes(SEP_INVOCACION)) return null;
  const f = fichasPub.get(t.fichaId);
  return f && f.resumen ? {rng: num(f.resumen.rng), casteo: num(f.resumen.rangocasteo)} : null;
}
// R / Shift+R (o los botones 📏 🔮): muestran el rango del TOKEN SELECCIONADO (2026-09-24, cambio pedido por el dueño: antes
// buscaba "tu" personaje y al GM no le mostraba nada). Sin token seleccionado avisa "Seleccioná un token". Prendido, sigue a
// la selección: si elegís otro token, muestra el de ese.
function alternarRango(magico){
  const activo = magico ? rangoMagicoActivo : rangoActivo;
  if(!activo){
    const t = seleccion ? tokens.get(seleccion) : null;
    if(!t){ toast('Seleccioná un token para ver su rango'); return; }
    const r = rangoDeToken(t);
    if(!r || !((magico ? r.casteo : r.rng) > 0)){ toast(`${nombreDe(t)} no tiene ${magico ? 'rango de casteo' : 'rango'} para mostrar`); return; }
  }
  if(magico) rangoMagicoActivo = !rangoMagicoActivo; else rangoActivo = !rangoActivo;
  renderBotonesRango();
  pedirDibujo();
}
$('#btn-rango').onclick = () => alternarRango(false);
$('#btn-rango-magico').onclick = () => alternarRango(true);
$('#btn-reroll').onclick = () => {
  const fid = fichaPrincipalId();
  if(!fid){ toast('Necesitás un personaje para usar la Moneda Re-Roll'); return; }
  abrirRerollMapa(fid);   // el mapa (js/11, A6a)
};

let verZonas = false;          // modo lentes prendido
let lentesTodos = false;       // 👁 Ver todas las zonas (si no, hace falta seleccionar un token)
// El modo lentes arranca apagado al cargar (2026-10-02, pedido del dueño: con F5 aparecía prendido); se sigue recordando "Ver todas".
try{ lentesTodos = localStorage.getItem('mapa-lentes-todos') === '1'; }catch(e){}
// Con un token seleccionado se ven solo sus zonas (cualquiera, para poder revisar la de un
// aliado o un NPC si hace falta). Sin selección, nada, salvo que se pida expresamente "Ver
// todas las zonas" (2026-09-22) — y ahí sí, solo las de riesgo, nunca las de tus propios
// aliados: para un jugador, los rivales son los creeps; para el GM (mirando el riesgo de un
// creep suyo en sigilo), los rivales son los personajes de los jugadores.
function lentesMuestra(id, t){
  if(seleccion) return id === seleccion;
  if(!lentesTodos) return false;
  return soyGM ? t.tipo === 'pj' : claseToken(t) === 'creep';
}
function renderBotonZonas(){
  const b = $('#btn-zonas');
  if(!b) return;
  b.classList.toggle('activo', verZonas);
  $('#lentes-activar').textContent = verZonas ? '👓 Modo lentes: sí' : '👓 Modo lentes: no';
  $('#lentes-activar').classList.toggle('primary', verZonas);
  $('#lentes-opciones').classList.toggle('apagado', !verZonas);
  $('#lentes-todos').textContent = lentesTodos ? '👁 Ver todas las zonas de riesgo: sí' : '👁 Ver todas las zonas de riesgo';
  $('#lentes-todos').classList.toggle('primary', lentesTodos);
  // Acceso directo flotante (2026-09-22): con el modo prendido y el menú cerrado, no hace
  // falta abrirlo para tocar "Ver todas" — el botón 👁 queda flotando debajo del 👓.
  const bt = $('#btn-zonas-todas');
  bt.hidden = !(verZonas && $('#lentes-menu').hidden);
  bt.classList.toggle('activo', lentesTodos);
  renderLentesControl();
}
// 🎮 Tomar / devolver el control desde el mapa (2026-10-02, pedido del dueño; antes solo desde la ficha): en el menú de los lentes, para
// el GM con el token de un personaje seleccionado. Hace lo mismo que la ficha (fichaTomarControl / fichaDevolverControl): la parte
// `control` de la ficha y `resumen.control`, y el aviso en la Mesa. La ficha de ese personaje (y su dueño) se entera sola.
function renderLentesControl(){
  const caja = $('#lentes-control');
  if(!caja) return;
  const t = seleccion ? tokens.get(seleccion) : null;
  const fichaId = t && t.tipo === 'pj' && t.fichaId ? String(t.fichaId).split(SEP_INVOCACION)[0] : '';
  const f = fichaId ? fichasPub.get(fichaId) : null;
  if(!soyGM || !f){ caja.hidden = true; caja.innerHTML = ''; return; }
  const nombre = f.nombre || (f.resumen && f.resumen.nombre) || 'el personaje';
  const lo = controloFicha(fichaId);
  caja.hidden = false;
  caja.innerHTML = lo
    ? `<button type="button" class="btn chico" id="lentes-control-btn" style="width:100%">↩ Devolver el control de ${esc(nombre)}</button>`
    : `<button type="button" class="btn chico" id="lentes-control-btn" style="width:100%" title="Lo usás como si fueras su jugador (Botonera, duelos, habilidades, token, Mantenimiento). Su jugador queda en solo lectura hasta que se lo devuelvas.">🎮 Tomar el control de ${esc(nombre)}</button>`;
  $('#lentes-control-btn').onclick = () => mapaCambiarControl(fichaId, nombre, !lo);
}
async function mapaCambiarControl(fichaId, nombre, tomar){
  if(!soyGM || !fbDb) return;
  if(tomar && !confirm(`¿Tomar el control de ${nombre}?

Lo vas a usar como si fueras su jugador (Botonera, duelos, habilidades, token, Mantenimiento). Su jugador queda en solo lectura hasta que se lo devuelvas, y la Mesa avisa.`)) return;
  const base = fbDb.doc(fbRutaCampana(`fichas/${fichaId}`));
  const control = {uid: fbUsuario.uid, nombre: fbMiembro.nombre || 'GM', desde: Date.now()};
  try{
    await base.collection('partes').doc('control').set({json: tomar ? JSON.stringify(control) : 'null', actualizado: firebase.firestore.FieldValue.serverTimestamp()});
    await base.update({'resumen.control': tomar ? fbUsuario.uid : firebase.firestore.FieldValue.delete()});
  }catch(err){ console.error('No se pudo cambiar el control:', err); toast('No se pudo cambiar el control — revisá la consola'); return; }
  try{
    await fbDb.collection(fbRutaCampana('tiradas')).add({uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: nombre,
      origen: (tomar ? `🎮 El GM (${control.nombre}) tomó el control de ${nombre}` : `↩ El GM devolvió el control de ${nombre} a su jugador`).slice(0, 80),
      formula: '', rolls: [], mod: 0, total: 0, desde: 'recordatorio', cuando: firebase.firestore.FieldValue.serverTimestamp()});
  }catch(err){ console.error('No se pudo avisar en la Mesa:', err); }
  // Su momento (P146): el jugador dueño lo ve al centro; el resto, en la esquina (js/16).
  const f = fichasPub.get(fichaId);
  momentoAbrir({tipo: 'control', icono: tomar ? '🎮' : '↩', titulo: tomar ? `El GM tomó el control de ${nombre}` : `El GM devolvió el control de ${nombre}`,
    resultado: tomar ? 'Su jugador queda en solo lectura hasta que se lo devuelva.' : 'Lo vuelve a manejar su jugador.', estado: 'listo',
    datos: {centro: true, paraUid: (f && f.duenoUid) || ''}});
  toast(tomar ? `🎮 Tenés el control de ${nombre}: lo usás como si fueras su jugador` : `↩ Le devolviste el control de ${nombre} a su jugador`);
  setTimeout(renderLentesControl, 800);   // cuando llega el resumen nuevo
}
// Cartel fijo: con el modo prendido, nada seleccionado y "Ver todas" apagado, recuerda cómo ver algo.
function actualizarAvisoLentes(){
  const el = $('#lentes-aviso');
  el.hidden = !(verZonas && !seleccion && !lentesTodos);
}

/* ---------- Sigilo, paso 4: detección automática y avisos ----------
   Un token en sigilo que pisa el CONO de un rival (creep si es personaje,
   personaje si es creep) pierde el sigilo solo — y al soltarlo, la ruta se
   corta en esa casilla: aparece donde lo detectaron. Cada paso dentro de la
   ZONA DE ALERTA de un rival pide una tirada de detección, que es manual: el
   mapa solo cuenta y avisa en la Mesa. Solo cuenta lo efectivo (lo que se
   suelta), no lo que se arrastra para evaluar rutas. */
const sigiloAvisosPendientes = new Map();   // tokenId -> [{rival, pasos}] a publicar cuando el movimiento se guarda
const percepcionAvisosPendientes = new Map();   // tokenId (quien camina) -> Map(ocultoId -> pasos en su zona de alerta)
const sigiloRompiendo = new Set();
let sigiloFirmaRev = '';

/* ---------- Ataque de oportunidad: el rival no tiene No2 (2026-10-02, pedido del dueño) ----------
   Cuando un token se aleja de un rival que PUEDE aprovecharlo, el movimiento se frena y se le pregunta (js/17). Si el rival NO tiene
   No2 suficientes (`oporPuede`), no se frena, pero queda dicho: una línea en la Mesa y un momento en la esquina (js/16), «no hay ataque
   de oportunidad: Fulano no tiene No2 suficientes». Solo en modo combate, no con un token oculto o en sigilo. Cuenta como oportunidad
   usada (no se avisa de nuevo mientras sigan pegados); cada vez que se pega y se aleja, otra (js/17). Se cuenta sobre el camino que de
   verdad se hizo (después de los cortes). */
function oportunidadEvaluarRuta(t, ruta){
  if(modoMapa !== 'combate') return [];
  if(!ruta || ruta.length < 2) return [];
  if(t.oculto || enSigilo(t)) return [];  // un token oculto no delata su movimiento
  const id = rutaTokenId(t);
  const rivales = new Set(rivalesDe(t));
  const ids = [...tokens.entries()].filter(([, r]) => rivales.has(r) && !oporPuede(r)).map(([rid, r]) => ({rid, r, usada: oporUsada(id, rid)}));
  const salidos = [];
  for(let i = 1; i < ruta.length; i++){
    const antes = ruta[i - 1], despues = ruta[i];
    ids.forEach(o => {
      const c = {col: o.r.col, fila: o.r.fila};
      if(distanciaHex(antes, c) === 1 && distanciaHex(despues, c) > 1){
        if(!o.usada) salidos.push({rid: o.rid, r: o.r});
        o.usada = false;   // se alejó: si se vuelve a pegar y a alejar en el mismo camino, es otra
      }
    });
  }
  return salidos;
}
async function oportunidadPublicarAvisos(t, salidos){
  if(!salidos || !salidos.length || !fbDb || !fbUsuario || !fbMiembro) return;
  for(const {r} of salidos){
    const texto = `${nombreDe(t)} se alejó de ${nombreDe(r)}: no hay ataque de oportunidad (${nombreDe(r)} no tiene No2 suficientes)`;
    try{
      await fbDb.collection(fbRutaCampana('tiradas')).add({
        uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: '',
        origen: '⚔ ' + texto,
        formula: '', rolls: [], mod: 0, total: 0, desde: 'alerta-roja',
        cuando: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }catch(err){ console.error('No se pudo avisar el ataque de oportunidad:', err); }
    momentoAbrir({tipo: 'oportunidad-sin', icono: '⚔', titulo: `${nombreDe(t)} se aleja de ${nombreDe(r)}`,
      resultado: `No hay ataque de oportunidad: ${nombreDe(r)} no tiene No2 suficientes.`, estado: 'listo'});
  }
}

function rivalesDe(t){
  const lista = [];
  tokens.forEach(r => {
    if(r === t || r.oculto) return;
    if(t.tipo === 'pj' ? r.tipo !== 'creep' : r.tipo !== 'pj') return;
    const e = estadoDe(r);
    if(e && e.muerto) return;
    lista.push(r);
  });
  return lista;
}
function zonasClaves(r){
  const z = zonasSigilo(r);
  return {nombre: nombreDe(r), cono: new Set(z.cono.map(c => nbPack(c.col, c.fila))), alerta: new Set(z.alerta.map(c => nbPack(c.col, c.fila)))};
}
async function sigiloAviso(origen, formula){
  try{
    await fbDb.collection(fbRutaCampana('tiradas')).add({
      uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: '',
      origen, formula: formula || '', rolls: [], mod: 0, total: 0,
      desde: 'recordatorio', cuando: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }catch(err){ console.error('No se pudo avisar del sigilo en la Mesa:', err); }
}
// Lista de trampas guardadas en el panel de creación: tocar el nombre la carga, ✕ la borra.
function trampasGuardadasHtml(){
  if(!trampasGuardadas.length) return `<label class="etiqueta">Trampas</label><button type="button" class="btn chico" id="trampas-catalogo" title="Elegir una trampa del catálogo">📚 Catálogo de trampas</button>`;
  return `<label class="etiqueta">Trampas guardadas</label><button type="button" class="btn chico" id="trampas-catalogo" style="margin-bottom:4px" title="Elegir una trampa del catálogo">📚 Catálogo de trampas</button><div class="trampas-guardadas">${trampasGuardadas.map((g, i) => `<div class="tg-fila"><button type="button" class="btn chico tg-usar" data-tg-usar="${i}" title="${esc(g.detalle || '')}">${esc(g.nombre)}${g.amiga ? ' · 🔥' : ''}</button>${versionNuevaDeTrampa(g) ? `<button type="button" class="btn chico" data-tg-version="${i}" title="Alguien corrigió la trampa del catálogo de la que salió esta: ver y decidir si actualizarla">🔔</button>` : ''}<button type="button" class="btn chico" data-tg-proponer="${i}" title="Subirla al catálogo compartido de trampas: queda disponible para todos al instante">⬆</button><button type="button" class="btn chico peligro" data-tg-borrar="${i}" title="Borrar de las guardadas">✕</button></div>`).join('')}</div>`;
}
// Estado automático de una trampa (2026-09-24): los debuffs de EstadosAplicar con duración (Escarcha, Pajaritos, Rengo, Stun…).
// Al pisarla se aplica solo a quien la activa (y a los de adentro si es de área), con los turnos que se elijan al colocarla.
function trampaEstadoPresets(){
  return (typeof EstadosAplicar !== 'undefined' ? EstadosAplicar.DEBUFFS : []).filter(p => !p.permanente && num(p.turnos) > 0 && !p.esVeneno);
}
function trampaEstadoTurnosPreset(nombre){
  const p = trampaEstadoPresets().find(x => x.nombre === nombre);
  return p ? num(p.turnos) : 0;
}
function trampaEstadoOpcionesHtml(elegido){
  return `<option value="">Ninguno</option>` + trampaEstadoPresets().map(p => `<option value="${esc(p.nombre)}"${p.nombre === elegido ? ' selected' : ''}>${esc(p.nombre)}</option>`).join('');
}
// El JSON que se guarda en la trampa (trampaEstado): {nombre?, turnos?, stacks?, hp?, salva?}. '' si no deja ningún estado ni se puede evitar.
// Cualquier estado de la lista (también los que no vencen solos, como Sentado, o el Veneno con sus stacks) o uno propio con daño por turno
// (Quemadura); `salva`: la tirada para evitarla, que el mapa tira sola (TokensAuto.estadoJson).
function trampaEstadoSpec(){
  let estado = null;
  if(elemTrampaEstado){
    const p = (typeof EstadosAplicar !== 'undefined' ? EstadosAplicar.DEBUFFS : []).find(x => x.nombre === elemTrampaEstado);
    if(p || elemTrampaEstadoHp){
      estado = {nombre: elemTrampaEstado};
      const t = elemTrampaEstadoTurnos > 0 ? elemTrampaEstadoTurnos : (p && !p.permanente && !p.esVeneno ? num(p.turnos) : 0);
      if(t) estado.turnos = t;
      if(elemTrampaEstadoStacks > 0) estado.stacks = elemTrampaEstadoStacks;
      if(elemTrampaEstadoHp) estado.hp = elemTrampaEstadoHp;
    }
  }
  return TokensAuto.estadoJson(estado, elemTrampaSalva);
}
/* ---------- Menú paso a paso de trampas (comun/asistente-trampa.js, 2026-09-25) ----------
   Se abre al tildar "Trampa" en Terreno y Formas, desde el botón "Armar paso a paso" del panel, desde el catálogo ("crear custom") y
   desde el ⚙ de una trampa ya colocada (modo edición: la forma no cambia). Devuelve un resultado neutro que acá se convierte en campos. */
// Pulsos de la trampa de teleport: unos segundos, en los dos puntos, con un hilo entre ellos (violeta donde se activó, azul donde llegó).
const efectosTeleport = [];
const TELEPORT_FX_MS = 4200;
function teleportEfecto(el, destinoTxt){
  const celdas = celdasDeElemento(el), d = destinoParsear(destinoTxt || el.trampaDestino);
  if(!celdas.length || !d) return;
  const c = celdas[Math.floor(celdas.length / 2)];
  efectosTeleport.push({a: hexCentro(c.col, c.fila), b: hexCentro(d.col, d.fila), desde: Date.now()});
  pedirDibujo();
}
function dibujarEfectosTeleport(){
  const ahora = Date.now();
  let activo = false;
  for(let i = efectosTeleport.length - 1; i >= 0; i--){
    const fx = efectosTeleport[i], edad = ahora - fx.desde;
    if(edad > TELEPORT_FX_MS){ efectosTeleport.splice(i, 1); continue; }
    const apagar = Math.min(1, (TELEPORT_FX_MS - edad) / 900);
    ctx.save();
    // hilo punteado entre los dos puntos
    ctx.setLineDash([10 / vista.zoom, 8 / vista.zoom]);
    ctx.strokeStyle = `rgba(160,140,255,${0.55 * apagar})`; ctx.lineWidth = 3 / vista.zoom;
    ctx.beginPath(); ctx.moveTo(fx.a.x, fx.a.y); ctx.lineTo(fx.b.x, fx.b.y); ctx.stroke();
    ctx.setLineDash([]);
    [[fx.a, '150,110,255'], [fx.b, '90,170,255']].forEach(([p, rgb]) => {
      // brillo central + tres ondas que se expanden y se desvanecen
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, HEX * 0.9);
      g.addColorStop(0, `rgba(${rgb},${0.55 * apagar})`); g.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, HEX * 0.9, 0, 2 * Math.PI); ctx.fill();
      [0, 1 / 3, 2 / 3].forEach(desfase => {
        const fase = ((edad / 1100) + desfase) % 1;
        ctx.beginPath(); ctx.arc(p.x, p.y, HEX * (0.35 + 2.1 * fase), 0, 2 * Math.PI);
        ctx.strokeStyle = `rgba(${rgb},${(1 - fase) * 0.95 * apagar})`; ctx.lineWidth = 4 / vista.zoom; ctx.stroke();
      });
    });
    ctx.restore();
    activo = true;
  }
  return activo;   // true mientras haya pulsos: el dibujo tiene que seguir animándose
}
// Trampa de TELEPORT (2026-09-25): al saltar, mueve a quien la pisó a la casilla libre más cercana al destino (`trampaDestino`: "col,fila").
function destinoParsear(txt){
  const m = /^(-?\d+),(-?\d+)$/.exec(String(txt || ''));
  return m ? {col: parseInt(m[1], 10), fila: parseInt(m[2], 10)} : null;
}
// El destino fijo de una trampa de portal (2026-10-05, Varita del portal): va adentro de su trampaEstado ({portal: {rango, destino}}).
function portalFijoDe(el){
  if(!el || !el.trampaEstado || el.trampaEstado.indexOf('destino') < 0) return null;
  try{ const p = JSON.parse(el.trampaEstado).portal; return p ? destinoParsear(p.destino) : null; }catch(e){ return null; }
}
let elegirDestinoLibre = false;   // true: vale cualquier casilla (elegir un token, no un destino a pie)
let elegirDestinoCancel = null;   // qué hacer si se cancela con Esc o clic derecho
function elegirDestino(cb, texto, libre, alCancelar){
  elegirDestinoCb = cb;
  elegirDestinoLibre = !!libre;
  elegirDestinoCancel = alCancelar || null;
  lienzo.style.cursor = 'crosshair';
  const av = $('#colocando-aviso');
  if(av){ av.hidden = false; av.innerHTML = texto || '<b>🌀 Elegí el destino del teleport</b> <span>clic en una casilla transitable a pie (sin Sólido ni pared) adonde va a parar quien la pise · Esc o clic derecho cancelan</span>'; }
  pedirDibujo();
}
function elegirDestinoCancelar(){
  const cb = elegirDestinoCancel;
  elegirDestinoTerminar();
  toast('Cancelado');
  if(cb) cb();
}
function elegirDestinoTerminar(){
  elegirDestinoCb = null;
  elegirDestinoLibre = false;
  elegirDestinoCancel = null;
  lienzo.style.cursor = 'default';
  const av = $('#colocando-aviso'); if(av && !colocando){ av.hidden = true; av.innerHTML = ''; }
  pedirDibujo();
}
function casillaLibreCerca(d){
  const ocupada = c => elementoSolidoEn(c.col, c.fila) || [...tokens.values()].some(x => x.col === c.col && x.fila === c.fila);
  if(!ocupada(d)) return d;
  const vistos = new Set([d.col + ',' + d.fila]);
  let borde = [d];
  for(let r = 0; r < 4; r++){
    const sig = [];
    for(const c of borde) for(const v of vecinosDeCasilla(c)){
      const k = v.col + ',' + v.fila;
      if(vistos.has(k)) continue;
      vistos.add(k); sig.push(v);
      if(!ocupada(v)) return v;
    }
    borde = sig;
  }
  return d;   // sin lugar cerca: lo deja en el destino
}
async function trampaTeleportar(id, t, el, avisar){
  const d = destinoParsear(el.trampaDestino);
  if(!d || !t) return;
  const c = casillaLibreCerca(d);
  if(elementoSolidoEn(d.col, d.fila)) toast('El destino del teleport ya no es transitable a pie: se usó la casilla libre más cercana');
  const antes = {col: t.col, fila: t.fila, rutaJson: t.rutaJson};
  t.col = c.col; t.fila = c.fila; t.rutaJson = '[]';
  estelas.delete(id);
  renderPanel(); pedirDibujo();
  try{
    await coleccionTokens().doc(id).update({col: c.col, fila: c.fila, ruta: firebase.firestore.FieldValue.delete()});
    if(avisar !== false) alertaRojaAnonima(`🌀 ${el.trampaNombre || 'Trampa de teleport'}`, `${t.oculto ? 'Alguien' : nombreDe(t)} fue teletransportado a otro punto del mapa`);
  }catch(err){
    console.error('No se pudo teletransportar el token:', err);
    Object.assign(t, antes); visibles.delete(id); pedirDibujo();
    toast('No se pudo teletransportar el token (¿faltan publicar las reglas?)');
  }
}
function trampaEstadosParaAsistente(){
  return trampaEstadoPresets().map(p => ({nombre: p.nombre, detalle: p.detalle || '', turnos: num(p.turnos), permanente: !!p.permanente}));
}
function trampaResumenFrase(nombre, dano, ignoraDef, estado, estadoTurnos, amiga, destino){
  const p = [];
  if(destino) p.push('🌀 teletransporta a ' + destino);
  if(dano) p.push(`${dano} de daño ${ignoraDef ? '(directo a la vida)' : '(contempla la armadura)'}`);
  if(estado) p.push(`deja ${estado}${estadoTurnos ? ' ' + estadoTurnos + ' turnos' : ''}`);
  if(!p.length) p.push('solo avisa cuando se activa');
  p.push(amiga ? 'daña también a aliados en el área' : 'el efecto solo alcanza a rivales');
  return p.join(' · ');
}
function abrirAsistenteTrampaPanel(){
  AsistenteTrampa.abrir({
    contexto: 'mapa', editando: false, colores: COLORES, estados: trampaEstadosParaAsistente(),
    inicial: {nombre: elemTrampaNombre, descripcion: elemTrampaDetalle, forma: elemTipo, color: elemColor, alfa: elemAlfa, amiga: elemTrampaAmiga,
      dano: trampaDanoValido(elemTrampaDano) ? elemTrampaDano.trim() : '', contemplaArmadura: !elemTrampaIgnoraDef, estado: elemTrampaEstado, estadoTurnos: elemTrampaEstadoTurnos, turnos: elemTurnos, teleport: elemTrampaTeleport,
      dejaZona: elemTrampaDejaZona, zonaTurnos: elemTrampaZonaTurnos, zonaEnMant: elemTrampaZonaEnMant, zonaCadaPaso: elemTrampaZonaCadaPaso, zonaResistStat: elemTrampaZonaResistStat, zonaResistValor: elemTrampaZonaResistValor, detectar: elemTrampaDetectar},
    alTerminar: res => {
      elemTrampa = true; elemTrampaNombre = res.nombre.trim().slice(0, 40); elemTrampaDetalle = AsistenteTrampa.detalleFinal(res); elemTrampaAmiga = !!res.amiga;
      elemTrampaDano = res.dano || ''; elemTrampaIgnoraDef = !res.contemplaArmadura; elemTrampaEstado = res.estado || ''; elemTrampaEstadoTurnos = num(res.estadoTurnos);
      elemTrampaEstadoStacks = num(res.estadoStacks) || 0; elemTrampaEstadoHp = 0; elemTrampaSalva = res.salvacion || null;
      if(['flor', 'linea', 'libre'].includes(res.forma)) elemTipo = res.forma;
      if(/^#[0-9a-fA-F]{6}$/.test(res.color || '')) elemColor = res.color;
      if(Number.isFinite(res.alfa)) elemAlfa = Math.max(0, Math.min(100, res.alfa));
      elemTurnos = Math.max(0, Math.min(99, num(res.turnos)));
      elemTrampaTeleport = !!res.teleport;
      if(!elemTrampaTeleport) elemTrampaDestino = '';
      elemTrampaDejaZona = !!res.dejaZona; elemTrampaZonaTurnos = Math.max(1, Math.round(num(res.zonaTurnos)) || 3);
      elemTrampaZonaEnMant = res.zonaEnMant !== false; elemTrampaZonaCadaPaso = !!res.zonaCadaPaso;
      elemTrampaZonaResistStat = res.zonaResistStat || ''; elemTrampaZonaResistValor = Math.round(num(res.zonaResistValor)) || 12;
      elemTrampaDetectar = Math.max(1, Math.round(num(res.detectar)) || 8);
      if(res.guardar) guardarTrampaRecurrente({nombre: elemTrampaNombre, detalle: elemTrampaDetalle, amiga: elemTrampaAmiga, tipo: elemTipo, tamano: elemTamano, color: elemColor, alfa: elemAlfa,
        dano: elemTrampaDano, ignoraDef: elemTrampaIgnoraDef, estado: elemTrampaEstado, estadoTurnos: elemTrampaEstadoTurnos, detectar: elemTrampaDetectar,
        ...(elemTrampaEstadoStacks ? {estadoStacks: elemTrampaEstadoStacks} : {}), ...(elemTrampaSalva ? {salvacion: elemTrampaSalva} : {})});
      renderHerramientaFlotante(); pedirDibujo();
      if(elemTrampaTeleport && !elemTrampaDestino) elegirDestino(h => { elemTrampaDestino = h.col + ',' + h.fila; renderHerramientaFlotante(); toast(`Destino marcado: ahora elegí dónde poner la trampa`); });
      else toast(`Trampa "${elemTrampaNombre}" lista: elegí dónde ponerla`);
    },
    alCancelar: () => { if(!elemTrampaNombre.trim()){ elemTrampa = false; renderHerramientaFlotante(); pedirDibujo(); } },   // si nunca se armó, se destilda
  });
}
// ⚙ de una trampa ya colocada: mismo menú, en modo edición. Los cambios se aplican en vivo al elemento y se guardan con "Guardar".
function abrirAsistenteTrampaEditar(id, alCancelar){
  const el = elementos.get(id);
  if(!el) return;
  let est = null;
  try{ est = el.trampaEstado ? JSON.parse(el.trampaEstado) : null; }catch(e){}
  const restan = el.venceMant !== null && el.venceMant !== undefined && mantenimientoNumero !== null ? Math.max(1, el.venceMant - mantenimientoNumero) : 0;
  AsistenteTrampa.abrir({
    contexto: 'mapa', editando: true, colores: COLORES, estados: trampaEstadosParaAsistente(),
    inicial: {nombre: el.trampaNombre || '', descripcion: el.trampaDetalle || '', forma: el.tipo, color: el.color, alfa: el.alfa, amiga: !!el.fuegoAmigo,
      dano: trampaDanoValido(el.trampaDano) ? String(el.trampaDano).trim() : '', contemplaArmadura: !el.trampaIgnoraDef,
      estado: est && est.nombre || '', estadoTurnos: est ? num(est.turnos) : 0, turnos: restan, teleport: !!el.trampaDestino,
      dejaZona: !!el.trampaDejaZona, zonaTurnos: el.zonaTurnos, zonaEnMant: el.zonaEnMantenimiento, zonaCadaPaso: el.zonaCadaPaso, zonaResistStat: el.zonaResistStat, zonaResistValor: el.zonaResistValor, detectar: el.trampaDetectar || 8,
      estadoStacks: est ? num(est.stacks) : 0, salvacion: est && est.salva ? est.salva : null},
    alTerminar: res => {
      const cambios = {trampa: true, trampaNombre: res.nombre.trim().slice(0, 40), trampaDetalle: AsistenteTrampa.detalleFinal(res), fuegoAmigo: !!res.amiga,
        trampaDano: res.dano || '', trampaIgnoraDef: !res.contemplaArmadura,
        trampaEstado: TokensAuto.estadoJson(res.estado ? {nombre: res.estado, turnos: res.estadoTurnos > 0 ? res.estadoTurnos : trampaEstadoTurnosPreset(res.estado), ...(num(res.estadoStacks) > 0 ? {stacks: num(res.estadoStacks)} : {}),
          ...(est && est.nombre === res.estado && est.hp ? {hp: est.hp} : {})} : null, res.salvacion),
        trampaDestino: res.teleport ? String(el.trampaDestino || '') : '', color: res.color, alfa: res.alfa,
        trampaDejaZona: !!res.dejaZona, zonaTurnos: Math.max(1, num(res.zonaTurnos) || 3), zonaEnMantenimiento: res.zonaEnMant !== false, zonaCadaPaso: !!res.zonaCadaPaso,
        zonaResistStat: res.zonaResistStat || '', zonaResistValor: num(res.zonaResistValor) || 12, trampaDetectar: Math.max(1, Math.round(num(res.detectar)) || 8)};
      const n = Math.max(0, Math.min(99, num(res.turnos)));
      Object.assign(cambios, n > 0 ? {turnos: n, venceMant: Math.round(num(mantenimientoNumero)) + n} : {turnos: 0, venceMant: null});
      Object.assign(el, cambios);
      pedirDibujo();
      if(editandoElemento && editandoElemento.id === id) renderEditorElemento();
      if(res.teleport && !el.trampaDestino) elegirDestino(h => { el.trampaDestino = h.col + ',' + h.fila; pedirDibujo(); if(editandoElemento && editandoElemento.id === id) renderEditorElemento(); toast('Destino marcado: tocá Guardar para dejarla así'); });
      else toast('Trampa actualizada: tocá Guardar para dejarla así');
    },
    alCancelar: alCancelar || (() => {}),
  });
}
// Carga una trampa (guardada o del catálogo) en el panel para colocarla.
function cargarTrampaEnPanel(g, meta){
  if(!g) return;
  elemTrampaBibOrigen = g.bibOrigen || (meta && meta.id ? {tipo: 'trampas', id: meta.id, version: meta.version || 1} : null);
  // "Deja una zona al dispararse" (trampas persistentes): antes no se guardaba en las recurrentes.
  elemTrampaDejaZona = !!g.dejaZona;
  if(g.dejaZona){
    elemTrampaZonaTurnos = Math.max(1, Math.round(num(g.zonaTurnos)) || 3); elemTrampaZonaEnMant = g.zonaEnMantenimiento !== false;
    elemTrampaZonaCadaPaso = !!g.zonaCadaPaso; elemTrampaZonaResistStat = g.zonaResistStat || ''; elemTrampaZonaResistValor = Math.round(num(g.zonaResistValor)) || 12;
  }
  elemTrampaTeleport = !!g.teleport; if(!g.teleport) elemTrampaDestino = '';
  elemTrampaDetectar = Math.max(1, Math.round(num(g.detectar)) || 8);
  elemTrampa = true; elemTrampaNombre = g.nombre || ''; elemTrampaDetalle = g.detalle || ''; elemTrampaAmiga = !!g.amiga; elemTrampaDano = g.dano || ''; elemTrampaIgnoraDef = !!g.ignoraDef; elemTrampaEstado = g.estado || ''; elemTrampaEstadoTurnos = Math.max(0, Math.round(num(g.estadoTurnos)) || 0);
  elemTrampaEstadoStacks = Math.max(0, Math.round(num(g.estadoStacks)) || 0); elemTrampaEstadoHp = Math.round(num(g.estadoHp)) || 0; elemTrampaSalva = g.salvacion || null;
  if(['flor', 'linea', 'libre'].includes(g.tipo)) elemTipo = g.tipo;
  elemTamano = Math.max(1, Math.min(TAMANO_ELEMENTO_MAX, Math.round(num(g.tamano)) || 1));
  if(/^#[0-9a-fA-F]{6}$/.test(g.color || '')) elemColor = g.color;
  if(Number.isFinite(g.alfa)) elemAlfa = Math.max(0, Math.min(100, g.alfa));
  renderHerramientaFlotante();
  pedirDibujo();
  if(elemTrampaTeleport) elegirDestino(h => { elemTrampaDestino = h.col + ',' + h.fila; renderHerramientaFlotante(); toast('Destino marcado: ahora elegí dónde poner la trampa'); });
  else toast(`Trampa "${g.nombre}" cargada: elegí dónde ponerla`);
}
// Catálogo de trampas (comun/biblioteca.js, tipo 'trampas'): las oficiales que aprobó el dueño del proyecto.
function abrirCatalogoTrampas(){
  Biblioteca.abrir({
    tipo: 'trampas', titulo: 'Catálogo de trampas',
    base: typeof TRAMPAS_BASE !== 'undefined' ? TRAMPAS_BASE : [],
    textoCrearDeCero: '+ Crear una trampa custom (paso a paso)',
    alCrearDeCero: () => { elemTrampa = true; elemTrampaBibOrigen = null; abrirAsistenteTrampaPanel(); },
    alElegir: cargarTrampaEnPanel,
    subtitulo: e => (e.nivel ? ` · nivel ${e.nivel}` : '') + (e.datos && e.datos.amiga ? ' · 🔥 daña a aliados en el área' : '') + (e.datos && e.datos.dano ? ` · 💥 ${e.datos.dano}` : ''),
    grupos: [
      {nombre: 'Efecto', tags: ['daño', 'veneno', 'explosiva', 'fuego', 'inmoviliza', 'debuff', 'control', 'alarma']},
      {nombre: 'Origen', tags: ['mecánica', 'mágica', 'natural']},
      {nombre: 'Nivel', tags: ['nivel 1', 'nivel 2', 'nivel 3', 'nivel 4', 'nivel 5']},
      {nombre: 'Alcance', tags: ['área']},
    ],
  });
}
// Lo subido al catálogo de trampas, para el aviso 🔔 de las trampas guardadas (se lee al abrir el panel de trampas).
let trampasSubidas = null;
function cargarTrampasSubidas(){
  if(typeof Biblioteca === 'undefined' || !Biblioteca.lista) return;
  trampasSubidas = trampasSubidas || [];
  Biblioteca.lista('trampas').then(l => { trampasSubidas = l; renderHerramientaFlotante(); }).catch(() => {});
}
function versionNuevaDeTrampa(g){
  if(trampasSubidas === null) cargarTrampasSubidas();
  return typeof Biblioteca !== 'undefined' && Biblioteca.versionNueva ? Biblioteca.versionNueva(trampasSubidas || [], g.bibOrigen, g.bibIgnorada) : null;
}
function guardarTrampaRecurrente(g){
  const i = trampasGuardadas.findIndex(x => x.nombre === g.nombre);
  if(i >= 0) trampasGuardadas[i] = g; else trampasGuardadas.push(g);
  guardarTrampasGuardadas();
  renderHerramientaFlotante();
}
function trampaDanoValido(t){ return /^\d{1,2}d\d{1,3}([+-]\d{1,3})?$/i.test(String(t || '').trim()); }

