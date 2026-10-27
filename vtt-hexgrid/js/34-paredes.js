// js/34-paredes.js — paredes de línea fina y el lápiz en rectas (2026-10-10, pedido del dueño). Solo funciones y sus eventos.
/* ---------- 🧱 Paredes de línea fina ----------
   Cualquier dibujo permanente del lápiz (a mano alzada o en rectas) puede llevar `colision: true` (lo pone o lo saca el GM: la casilla
   «🧱 Con colisión» del lápiz, o el botón 🧱 del dibujo seleccionado). Una pared así no ocupa casilleros: corta el paso y la vista
   ENTRE casilleros. Un token no puede pasar de un casillero al de al lado si la línea entre sus centros cruza la pared, y no se ve
   (visión, conos, rango, línea de tiro) lo que queda del otro lado. Sirve para calcar el borde de una habitación del dibujo del fondo;
   con el imán, las rectas caen justo en las esquinas de los hexágonos y la pared queda en el borde entre dos casilleros.
   Lo usan: lineaLibre (js/02, la vista), extenderRuta y el soltar del arrastre (js/06, el movimiento), lineaDeTiro (js/32) y el vuelo
   de una flecha (js/33).
   👁 Pared que deja ver (`veTraves`, 2026-10-27, dueño: «que una pared marque solidez, pero al mismo tiempo deje ver a través de sí»): frena el paso
   como cualquier pared, pero la vista (lineaLibre: visión, conos, rango) la atraviesa. Lo pone el GM desde el ⚙ del dibujo. */
let paredesCache = {firma: '', segs: []};
function paredesFirma(){
  let f = '';
  trazos.forEach((t, id) => { if(t.colision && !t.hex) f += `${id}:${t.origen.x},${t.origen.y},${t.rotacion},${t.puntos.length},${t.cerrada ? 1 : 0},${t.veTraves ? 1 : 0};`; });
  return f;
}
// Los puntos de un trazo en el mundo (deshace su rotación y su origen, como lo dibuja js/05).
function trazoPuntosMundo(t){
  const a = num(t.rotacion) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  return t.puntos.map(p => ({x: t.origen.x + p.x * c - p.y * s, y: t.origen.y + p.x * s + p.y * c}));
}
// Los segmentos de todas las paredes, con su caja (para descartar rápido), recalculados solo si cambia alguna.
function paredesSegs(){
  const f = paredesFirma();
  if(f !== paredesCache.firma){
    const segs = [];
    trazos.forEach(t => {
      if(!t.colision || t.hex) return;
      const p = trazoPuntosMundo(t);
      if(t.cerrada && p.length >= 3) p.push(p[0]);   // ⭕ el tramo que une el final con el principio también es pared
      for(let i = 0; i + 1 < p.length; i++){
        const a = p[i], b = p[i + 1];
        segs.push({ax: a.x, ay: a.y, bx: b.x, by: b.y, x0: Math.min(a.x, b.x), x1: Math.max(a.x, b.x), y0: Math.min(a.y, b.y), y1: Math.max(a.y, b.y), ve: !!t.veTraves});
      }
    });
    paredesCache = {firma: f, segs};
  }
  return paredesCache.segs;
}
const hayParedes = () => paredesSegs().length > 0;
/* ⭕ Figuras cerradas y sólidas (2026-10-14, dueño: «que al finalizar la línea el punto de partida y el de llegada se unan, para definir lo que
   está dentro; lo que está dentro de una figura sólida debe borrar las líneas del hexágono»): un dibujo cerrado (`cerrada`, o uno que termina
   donde empezó) con colisión es sólido por dentro — una casilla cuyo centro cae adentro no se pisa (`elementoSolidoEn`, js/07) y no dibuja la
   grilla (js/05). Su borde sigue siendo una pared. */
let figurasCache = {firma: null, lista: []};
function figurasSolidas(){
  const f = paredesFirma();
  if(f !== figurasCache.firma){
    const lista = [];
    trazos.forEach(t => {
      if(!t.colision || t.hex || !t.cerrada) return;
      const p = trazoPuntosMundo(t);
      if(p.length < 3) return;
      const xs = p.map(q => q.x), ys = p.map(q => q.y);
      lista.push({p, x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys)});
    });
    figurasCache = {firma: f, lista};
  }
  return figurasCache.lista;
}
// ¿El punto está adentro del polígono? (rayo hacia la derecha)
function puntoEnPoligono(x, y, p){
  let dentro = false;
  for(let i = 0, j = p.length - 1; i < p.length; j = i++){
    const a = p[i], b = p[j];
    if(((a.y > y) !== (b.y > y)) && (x < (b.x - a.x) * (y - a.y) / (b.y - a.y) + a.x)) dentro = !dentro;
  }
  return dentro;
}
function celdaEnFiguraSolida(col, fila){
  const figs = figurasSolidas();
  if(!figs.length) return false;
  const c = hexCentro(col, fila);
  return figs.some(f => c.x >= f.x0 && c.x <= f.x1 && c.y >= f.y0 && c.y <= f.y1 && puntoEnPoligono(c.x, c.y, f.p));
}
// ¿Se cruzan los segmentos AB y CD? (tocarse en un punto también cuenta: una pared que llega justo a la línea la corta)
function segmentosCruzan(ax, ay, bx, by, cx, cy, dx, dy){
  const EPS = 1e-6;
  const o = (px, py, qx, qy, rx, ry) => (qx - px) * (ry - py) - (qy - py) * (rx - px);
  const enCaja = (px, py, qx, qy, rx, ry) => Math.min(px, qx) - EPS <= rx && rx <= Math.max(px, qx) + EPS && Math.min(py, qy) - EPS <= ry && ry <= Math.max(py, qy) + EPS;
  const d1 = o(cx, cy, dx, dy, ax, ay), d2 = o(cx, cy, dx, dy, bx, by), d3 = o(ax, ay, bx, by, cx, cy), d4 = o(ax, ay, bx, by, dx, dy);
  if(((d1 > EPS && d2 < -EPS) || (d1 < -EPS && d2 > EPS)) && ((d3 > EPS && d4 < -EPS) || (d3 < -EPS && d4 > EPS))) return true;
  if(Math.abs(d1) <= EPS && enCaja(cx, cy, dx, dy, ax, ay)) return true;
  if(Math.abs(d2) <= EPS && enCaja(cx, cy, dx, dy, bx, by)) return true;
  if(Math.abs(d3) <= EPS && enCaja(ax, ay, bx, by, cx, cy)) return true;
  if(Math.abs(d4) <= EPS && enCaja(ax, ay, bx, by, dx, dy)) return true;
  return false;
}
// ¿Alguna pared corta el camino entre dos puntos del mundo? `soloVista`: las que dejan ver no cuentan (es una línea de vista).
function paredEntrePuntos(p, q, soloVista){
  const segs = paredesSegs();
  if(!segs.length) return false;
  const x0 = Math.min(p.x, q.x), x1 = Math.max(p.x, q.x), y0 = Math.min(p.y, q.y), y1 = Math.max(p.y, q.y);
  for(const s of segs){
    if(s.x1 < x0 || s.x0 > x1 || s.y1 < y0 || s.y0 > y1) continue;
    if(soloVista && s.ve) continue;   // 👁 una pared que deja ver
    if(segmentosCruzan(p.x, p.y, q.x, q.y, s.ax, s.ay, s.bx, s.by)) return true;
  }
  return false;
}
// ¿Alguna pared corta el paso (o la vista) entre dos casilleros? (de centro a centro). `o.vista`: es una línea de vista (las que dejan ver, no).
function paredCorta(a, b, o){
  if(!a || !b || (a.col === b.col && a.fila === b.fila) || !paredesSegs().length) return false;
  return paredEntrePuntos(hexCentro(a.col, a.fila), hexCentro(b.col, b.fila), !!(o && o.vista));
}
// Las paredes se ven: un borde oscuro debajo del dibujo (lo llama js/05). Sin relleno (`transparente`, 2026-10-14, dueño: «cuando las uso para marcar la
// colisión, rompe la naturalidad del mapa»): no se pinta el color ni el borde grueso; queda una línea oscura finita.
// La línea cortada roja de encima se sacó (dueño, 2026-10-27: «tiene unas rayitas rojas dentro, no son necesarias; con los bordes negros de contraste
// alcanza»): `dibujarParedEncima` queda sin dibujar nada (js/05 la sigue llamando).
function dibujarParedEncima(t, z){}
function dibujarParedDebajo(t, z){
  ctx.save();
  ctx.translate(t.origen.x, t.origen.y);
  ctx.rotate(t.rotacion * Math.PI / 180);
  ctx.beginPath();
  trazarTrazo(ctx, t);
  ctx.strokeStyle = t.transparente ? 'rgba(15,12,14,.55)' : 'rgba(15,12,14,.75)';
  ctx.lineWidth = t.transparente ? 2 / z : (t.grosor + 5) / z;
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // Una irradiación blanca sutil detrás (dueño, 2026-10-20: «para que destaque un poco más» sobre el mapa). shadowBlur va en píxeles de pantalla:
  // se ve igual con cualquier zoom.
  // (dueño, el mismo día: «quedó flojo, subilo un poco»): un trazo blanco translúcido más ancho, con el resplandor, y encima la línea oscura.
  const ancho = ctx.lineWidth, oscuro = ctx.strokeStyle;
  ctx.shadowColor = 'rgba(255,255,255,.95)'; ctx.shadowBlur = 10;
  ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = ancho + 3 / z;
  ctx.stroke();
  ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
  ctx.strokeStyle = oscuro; ctx.lineWidth = ancho;
  ctx.stroke();
  ctx.restore();
}
// Un trazo en rectas va con líneas rectas; uno a mano alzada, suavizado (js/07, trazarSuave).
function trazarTrazo(ctx2, t){
  if(!t.recto) trazarSuave(ctx2, t.puntos);
  else t.puntos.forEach((p, i) => { if(i) ctx2.lineTo(p.x, p.y); else ctx2.moveTo(p.x, p.y); });
  if(t.cerrada && t.puntos.length >= 3) ctx2.closePath();   // ⭕ puntas cerradas
}
// El botón 🧱 del dibujo seleccionado (solo el GM, solo los permanentes a mano alzada o en rectas): del lado opuesto a la manija de rotación.
function trazoParedBotonMundo(t){
  const h = trazoManijaMundo(t);
  return {x: 2 * t.origen.x - h.x, y: 2 * t.origen.y - h.y};
}
const trazoAdmitePared = t => !!(t && soyGM && t.permanente && !t.hex);
function dibujarBotonPared(t, z){
  if(!trazoAdmitePared(t)) return;
  const b = trazoParedBotonMundo(t);
  ctx.beginPath(); ctx.arc(b.x, b.y, 11 / z, 0, 2 * Math.PI);
  ctx.fillStyle = t.colision ? '#D8524B' : 'rgba(40,34,38,.92)'; ctx.fill();
  ctx.strokeStyle = t.colision ? 'rgba(15,12,14,.7)' : 'rgba(216,82,75,.9)'; ctx.lineWidth = 2 / z; ctx.stroke();
  ctx.font = `${12 / z}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('🧱', b.x, b.y + 0.5 / z);
}
/* 📌 Fijar un dibujo (2026-10-14, dueño: «no veo el botón para fijar figuras al mapa, en particular líneas libres que marqué como sólidas»):
   como el pin de Terreno y Formas — fijado no se arrastra ni se rota (se puede seleccionar, para soltarlo o ponerle la pared). Lo puede fijar
   quien puede moverlo; una pared queda fijada sola al ponerla. A 90° de la manija de rotación (la pared va del lado opuesto). */
const trazoAdmitePin = t => !!(t && t.permanente && !t.hex && puedeManipularTrazo(t));
function trazoPinMundo(t){
  const rad = (t.rotacion + 90) * Math.PI / 180, r = HEX * 0.9;
  return {x: t.origen.x - r * Math.sin(rad), y: t.origen.y + r * Math.cos(rad)};
}
function dibujarBotonPinTrazo(t, z){
  if(!trazoAdmitePin(t)) return;
  const b = trazoPinMundo(t);
  ctx.beginPath(); ctx.arc(b.x, b.y, 9 / z, 0, 2 * Math.PI);
  ctx.fillStyle = t.fijado ? '#D8524B' : '#4FA8E0'; ctx.fill();
  ctx.strokeStyle = 'rgba(15,12,14,.6)'; ctx.lineWidth = 2 / z; ctx.stroke();
  ctx.save(); ctx.font = `${11 / z}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff';
  ctx.fillText(t.fijado ? '🔓' : '📌', b.x, b.y + 0.5 / z); ctx.restore();
}
/* ⚙ La configuración de un dibujo (2026-10-14, dueño: «al seleccionar una línea o una forma, una ruedita para cambiarle el color y activar o
   desactivar que se cierren las puntas»): del lado opuesto al 📌 (a 270° de la manija). Abre una ventanita con el color, el relleno (◌ sin
   relleno: casi no se ve, deja ver el mapa), las puntas cerradas (⭕), fijado (📌) y, para el GM, la pared (🧱). Lo puede usar quien puede moverlo. */
const TRAZO_COLORES = ['#E0A458', '#D8524B', '#8EE6A8', '#7FB3F0', '#C9A8F5', '#F2D16B', '#6FD6C8', '#EDE3D2', '#9A867E', '#17121A'];
function trazoGearMundo(t){
  const rad = (t.rotacion + 270) * Math.PI / 180, r = HEX * 0.9;
  return {x: t.origen.x - r * Math.sin(rad), y: t.origen.y + r * Math.cos(rad)};
}
function dibujarBotonTransp(t, z){   // (el ⚙; conserva el nombre que llama js/05)
  if(!trazoAdmitePin(t)) return;
  const b = trazoGearMundo(t);
  ctx.beginPath(); ctx.arc(b.x, b.y, 9 / z, 0, 2 * Math.PI);
  ctx.fillStyle = 'rgba(40,34,38,.92)'; ctx.fill();
  ctx.strokeStyle = 'rgba(237,227,210,.85)'; ctx.lineWidth = 2 / z; ctx.stroke();
  ctx.save(); ctx.font = `${11 / z}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff';
  ctx.fillText('⚙', b.x, b.y + 0.5 / z); ctx.restore();
}
function clicBotonTransp(m){
  const t = trazoSeleccionado ? trazos.get(trazoSeleccionado) : null;
  if(!trazoAdmitePin(t)) return false;
  const b = trazoGearMundo(t);
  if(Math.hypot(m.x - b.x, m.y - b.y) > 11 / vista.zoom) return false;
  trazoCfgAbrir(trazoSeleccionado);
  return true;
}
let trazoCfgId = null;
function trazoCfgCerrar(){ trazoCfgId = null; const el = document.getElementById('trazo-cfg'); if(el) el.hidden = true; }
function trazoCfgAbrir(id){
  const t = trazos.get(id);
  if(!t){ trazoCfgCerrar(); return; }
  trazoCfgId = id;
  let el = document.getElementById('trazo-cfg');
  if(!el){
    el = document.createElement('div');
    el.id = 'trazo-cfg';
    el.style.cssText = 'position:fixed;z-index:70;width:250px;background:#1F1A20;border:1px solid #6B5B4B;border-radius:10px;padding:10px 12px;color:#EDE3D2;font:13px "Space Grotesk",system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.5)';
    document.body.appendChild(el);
    el.addEventListener('click', e => {
      const b = e.target.closest('[data-tc]');
      if(!b || !trazoCfgId || !trazos.has(trazoCfgId)) return;
      const t2 = trazos.get(trazoCfgId), k = b.dataset.tc, cambios = {};
      if(k === 'cerrar'){ trazoCfgCerrar(); return; }
      if(k === 'color') cambios.color = b.dataset.v;
      if(k === 'relleno') cambios.transparente = !t2.transparente;
      if(k === 'puntas') cambios.cerrada = !t2.cerrada;
      if(k === 'fijar') cambios.fijado = !t2.fijado;
      if(k === 'pared' && soyGM) Object.assign(cambios, t2.colision ? {colision: false} : {colision: true, fijado: true});
      if(k === 've' && soyGM) cambios.veTraves = !t2.veTraves;
      Object.assign(t2, cambios); pedirDibujo(); trazoCfgAbrir(trazoCfgId);
      moverTrazo(trazoCfgId, cambios).catch(err => { console.error('No se pudo cambiar el dibujo:', err); toast(err && err.code === 'permission-denied' ? 'No se pudo: faltan pegar las reglas nuevas de Firestore (dibujos)' : 'No se pudo cambiar el dibujo'); });
    });
    el.addEventListener('input', e => {
      if(e.target.dataset.tc !== 'colorlibre' || !trazoCfgId) return;
      const t2 = trazos.get(trazoCfgId); if(!t2) return;
      t2.color = e.target.value; pedirDibujo();
      clearTimeout(trazoCfgAbrir.t); trazoCfgAbrir.t = setTimeout(() => moverTrazo(trazoCfgId, {color: e.target.value}).catch(() => toast('No se pudo cambiar el color')), 400);
    });
  }
  const op = (k, activo, txt) => `<button type="button" data-tc="${k}" style="display:block;width:100%;margin:4px 0 0;padding:6px 8px;text-align:left;border-radius:7px;border:1px solid ${activo ? '#E0A458' : '#4A3E36'};background:${activo ? 'rgba(224,164,88,.18)' : '#2A2328'};color:#EDE3D2;cursor:pointer">${txt}</button>`;
  el.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><b>⚙ Dibujo</b><button type="button" data-tc="cerrar" style="background:none;border:0;color:#EDE3D2;cursor:pointer;font-size:15px">✕</button></div>
    <div style="font-size:11px;letter-spacing:.08em;opacity:.75;margin-bottom:4px">COLOR</div>
    <div style="display:flex;flex-wrap:wrap;gap:5px;align-items:center">${TRAZO_COLORES.map(c => `<button type="button" data-tc="color" data-v="${c}" title="${c}" style="width:20px;height:20px;border-radius:50%;cursor:pointer;background:${c};border:2px solid ${t.color === c ? '#fff' : 'rgba(0,0,0,.4)'}"></button>`).join('')}<input type="color" data-tc="colorlibre" value="${/^#[0-9a-fA-F]{6}$/.test(t.color || '') ? t.color : '#E0A458'}" title="Otro color" style="width:26px;height:22px;padding:0;border:0;background:none;cursor:pointer"></div>
    ${op('relleno', !t.transparente, t.transparente ? '◌ Sin relleno (casi no se ve) · tocá para darle color' : '● Con color · tocá para dejarlo sin relleno')}
    ${op('puntas', !!t.cerrada, t.cerrada ? '⭕ Puntas cerradas (el final se une con el principio)' : '〰 Puntas abiertas · tocá para cerrarlas')}
    ${op('fijar', !!t.fijado, t.fijado ? '📌 Fijado (no se mueve ni se rota)' : '🔓 Suelto · tocá para fijarlo')}
    ${soyGM ? op('pared', !!t.colision, t.colision ? `🧱 Es pared${t.cerrada ? ': lo de adentro es sólido y sin grilla' : ''}` : '🧱 No es pared · tocá para que corte el paso y la vista') : ''}
    ${soyGM && t.colision ? op('ve', !!t.veTraves, t.veTraves ? '👁 Deja ver a través: frena el paso, no la vista' : '🙈 Tapa la vista · tocá para que deje ver a través') : ''}`;
  const r = lienzo.getBoundingClientRect(), g = trazoGearMundo(t);
  const x = r.left + g.x * vista.zoom + vista.x, y = r.top + g.y * vista.zoom + vista.y;
  el.style.left = Math.max(8, Math.min(innerWidth - 262, x + 16)) + 'px';
  el.style.top = Math.max(8, Math.min(innerHeight - el.offsetHeight - 8, y - 20)) + 'px';
  el.hidden = false;
}
document.addEventListener('keydown', e => { if(e.key === 'Escape' && trazoCfgId) trazoCfgCerrar(); });
// Clic en el 📌 → fija o suelta el dibujo. true si el clic era ahí.
function clicBotonPinTrazo(m){
  const t = trazoSeleccionado ? trazos.get(trazoSeleccionado) : null;
  if(!trazoAdmitePin(t)) return false;
  const b = trazoPinMundo(t);
  if(Math.hypot(m.x - b.x, m.y - b.y) > 11 / vista.zoom) return false;
  const nuevo = !t.fijado;
  moverTrazo(trazoSeleccionado, {fijado: nuevo}).then(() => toast(nuevo ? '📌 Dibujo fijado: ya no se mueve ni se rota (🔓 para soltarlo)' : '🔓 Dibujo suelto: se puede mover y rotar'))
    .catch(err => { console.error('No se pudo fijar el dibujo:', err); toast(err && err.code === 'permission-denied' ? 'No se pudo fijar: faltan pegar las reglas nuevas de Firestore (fijado)' : 'No se pudo fijar el dibujo'); });
  return true;
}
// Clic en el botón 🧱 → pone o saca la colisión. true si el clic era ahí.
function clicBotonPared(m){
  const t = trazoSeleccionado ? trazos.get(trazoSeleccionado) : null;
  if(!trazoAdmitePared(t)) return false;
  const b = trazoParedBotonMundo(t);
  if(Math.hypot(m.x - b.x, m.y - b.y) > 12 / vista.zoom) return false;
  const nuevo = !t.colision;
  moverTrazo(trazoSeleccionado, nuevo ? {colision: true, fijado: true} : {colision: false}).then(() => toast(nuevo ? '🧱 Ese dibujo ahora es una pared: corta el paso y la vista' : 'Ese dibujo ya no es una pared'));
  return true;
}

/* ---------- 📐 Lápiz en rectas ----------
   Como la herramienta de polígonos de Paint: cada clic suma un punto y se dibuja una recta desde el anterior (mientras tanto, una recta de
   prueba sigue al mouse). Se termina con doble clic o Enter; clic sobre el primer punto lo cierra (la figura queda cerrada); Retroceso saca
   el último punto; Esc lo descarta. Con 🧲 Imán (prendido por defecto) cada punto se pega a la esquina de hexágono más cercana, así una
   pared queda justo en el borde entre dos casilleros. Se guarda como un trazo más (`recto: true`, sin suavizar). */
let lapizIman = true;
try{ lapizIman = localStorage.getItem('lapiz-iman') !== '0'; }catch(e){}
// La esquina de hexágono más cercana (las esquinas del casillero donde cae el punto son siempre las más cercanas).
function imanEsquina(m){
  const h = mundoAHex(m.x, m.y), c = hexCentro(h.col, h.fila);
  let mejor = null, d = Infinity;
  ESQUINAS.forEach(([ex, ey]) => { const p = {x: c.x + ex, y: c.y + ey}, dd = Math.hypot(m.x - p.x, m.y - p.y); if(dd < d){ d = dd; mejor = p; } });
  return mejor;
}
const rectaPunto = m => lapizIman ? imanEsquina(m) : {x: m.x, y: m.y};
function rectaClic(m){
  const p = rectaPunto(m);
  if(!dibujando || !dibujando.recto){ dibujando = {recto: true, puntos: [p], cursor: p}; pedirDibujo(); return; }
  const pts = dibujando.puntos, p0 = pts[0], ult = pts[pts.length - 1];
  if(pts.length >= 3 && Math.hypot(p.x - p0.x, p.y - p0.y) <= 10 / vista.zoom){ rectaTerminar(true); return; }   // cerró la figura (se guarda cerrada, sin repetir el punto)
  if(Math.hypot(p.x - ult.x, p.y - ult.y) > 2 / vista.zoom && pts.length < 200) pts.push(p);   // (el segundo clic de un doble clic cae en el mismo lugar)
  pedirDibujo();
}
function rectaTerminar(cerro){
  if(!dibujando || !dibujando.recto) return;
  const pts = dibujando.puntos;
  dibujando = null;
  if(pts.length >= 2) guardarTrazo(pts, lapizPermanente || lapizColisionActiva(), {recto: true, colision: lapizColisionActiva(), cerrada: !!cerro || lapizCerrar});
  pedirDibujo();
}
function rectaCancelar(){ if(dibujando && dibujando.recto){ dibujando = null; pedirDibujo(); } }
function rectaDeshacer(){
  if(!dibujando || !dibujando.recto) return;
  dibujando.puntos.pop();
  if(!dibujando.puntos.length) dibujando = null;
  pedirDibujo();
}
const lapizColisionActiva = () => !!(soyGM && lapizColision);
// Lo que se está dibujando, en vivo: las rectas, la de prueba hasta el mouse y los puntos (el primero, más grande: ahí se cierra).
function dibujarRectaEnCurso(z){
  if(!dibujando || !dibujando.recto) return;
  const pts = dibujando.puntos, cur = dibujando.cursor;
  ctx.save();
  ctx.beginPath();
  pts.forEach((p, i) => { if(i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); });
  ctx.strokeStyle = lapizColor; ctx.lineWidth = 4 / z; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.stroke();
  if(cur){
    const ult = pts[pts.length - 1];
    ctx.beginPath(); ctx.moveTo(ult.x, ult.y); ctx.lineTo(cur.x, cur.y);
    ctx.setLineDash([6 / z, 5 / z]); ctx.strokeStyle = lapizColor; ctx.lineWidth = 2 / z; ctx.stroke(); ctx.setLineDash([]);
  }
  pts.forEach((p, i) => { ctx.beginPath(); ctx.arc(p.x, p.y, (i ? 3 : 6) / z, 0, 2 * Math.PI); ctx.fillStyle = i ? lapizColor : '#EDE3D2'; ctx.fill(); });
  ctx.restore();
}
function rectaMover(m){
  if(!dibujando || !dibujando.recto) return false;
  dibujando.cursor = rectaPunto(m);
  pedirDibujo();
  return true;
}
// El teclado, antes que el resto del mapa (en captura): Enter termina, Esc descarta, Retroceso saca el último punto.
document.addEventListener('keydown', e => {
  if(!dibujando || !dibujando.recto || escribiendoEnCampo(e)) return;
  if(e.key === 'Enter'){ e.preventDefault(); e.stopPropagation(); rectaTerminar(); }
  else if(e.key === 'Escape'){ e.preventDefault(); e.stopPropagation(); rectaCancelar(); }
  else if(e.key === 'Backspace'){ e.preventDefault(); e.stopPropagation(); rectaDeshacer(); }
}, true);
lienzo.addEventListener('dblclick', () => { if(dibujando && dibujando.recto) rectaTerminar(); });

/* El cartelito que sigue al puntero (2026-10-12, pedido del dueño: «mientras esté activa, al lado del puntero, un cartelito que diga doble clic
   para terminar»): con el lápiz en rectas activo y el mouse sobre el mapa. Antes del primer clic, cómo empezar; después, cómo terminar. */
const rectaCartel = (() => {
  const d = document.createElement('div');
  d.id = 'recta-cartel';
  d.style.cssText = 'position:fixed;z-index:99990;pointer-events:none;display:none;background:rgba(20,15,18,.92);color:#EDE3D2;border:1px solid #E0A458;'
    + 'border-radius:8px;padding:4px 9px;font:600 12px "Space Grotesk",system-ui,sans-serif;white-space:nowrap;box-shadow:0 4px 14px rgba(0,0,0,.5)';
  document.body.appendChild(d);
  return d;
})();
function rectaCartelMostrar(e){
  const activa = herramientaActiva === 'lapiz' && lapizEstilo === 'recta';
  if(!activa || !e){ rectaCartel.style.display = 'none'; return; }
  const empezado = !!(dibujando && dibujando.recto);
  rectaCartel.innerHTML = empezado ? '🖱 Doble clic para terminar <span style="opacity:.7;font-weight:400">· Esc descarta</span>' : '📐 Clic para empezar · doble clic para terminar';
  rectaCartel.style.left = (e.clientX + 16) + 'px';
  rectaCartel.style.top = (e.clientY + 18) + 'px';
  rectaCartel.style.display = 'block';
}
lienzo.addEventListener('pointermove', e => rectaCartelMostrar(e));
lienzo.addEventListener('pointerleave', () => rectaCartelMostrar(null));
lienzo.addEventListener('pointerdown', e => setTimeout(() => rectaCartelMostrar(e), 0));
lienzo.addEventListener('dblclick', e => setTimeout(() => rectaCartelMostrar(e), 0));
document.addEventListener('keydown', () => setTimeout(() => { if(rectaCartel.style.display === 'block' && !(herramientaActiva === 'lapiz' && lapizEstilo === 'recta')) rectaCartel.style.display = 'none'; }, 0));
