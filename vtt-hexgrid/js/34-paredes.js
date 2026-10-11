// js/34-paredes.js — paredes de línea fina y el lápiz en rectas (2026-10-10, pedido del dueño). Solo funciones y sus eventos.
/* ---------- 🧱 Paredes de línea fina ----------
   Cualquier dibujo permanente del lápiz (a mano alzada o en rectas) puede llevar `colision: true` (lo pone o lo saca el GM: la casilla
   «🧱 Con colisión» del lápiz, o el botón 🧱 del dibujo seleccionado). Una pared así no ocupa casilleros: corta el paso y la vista
   ENTRE casilleros. Un token no puede pasar de un casillero al de al lado si la línea entre sus centros cruza la pared, y no se ve
   (visión, conos, rango, línea de tiro) lo que queda del otro lado. Sirve para calcar el borde de una habitación del dibujo del fondo;
   con el imán, las rectas caen justo en las esquinas de los hexágonos y la pared queda en el borde entre dos casilleros.
   Lo usan: lineaLibre (js/02, la vista), extenderRuta y el soltar del arrastre (js/06, el movimiento), lineaDeTiro (js/32) y el vuelo
   de una flecha (js/33). */
let paredesCache = {firma: '', segs: []};
function paredesFirma(){
  let f = '';
  trazos.forEach((t, id) => { if(t.colision && !t.hex) f += `${id}:${t.origen.x},${t.origen.y},${t.rotacion},${t.puntos.length};`; });
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
      for(let i = 0; i + 1 < p.length; i++){
        const a = p[i], b = p[i + 1];
        segs.push({ax: a.x, ay: a.y, bx: b.x, by: b.y, x0: Math.min(a.x, b.x), x1: Math.max(a.x, b.x), y0: Math.min(a.y, b.y), y1: Math.max(a.y, b.y)});
      }
    });
    paredesCache = {firma: f, segs};
  }
  return paredesCache.segs;
}
const hayParedes = () => paredesSegs().length > 0;
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
// ¿Alguna pared corta el camino entre dos puntos del mundo?
function paredEntrePuntos(p, q){
  const segs = paredesSegs();
  if(!segs.length) return false;
  const x0 = Math.min(p.x, q.x), x1 = Math.max(p.x, q.x), y0 = Math.min(p.y, q.y), y1 = Math.max(p.y, q.y);
  for(const s of segs){
    if(s.x1 < x0 || s.x0 > x1 || s.y1 < y0 || s.y0 > y1) continue;
    if(segmentosCruzan(p.x, p.y, q.x, q.y, s.ax, s.ay, s.bx, s.by)) return true;
  }
  return false;
}
// ¿Alguna pared corta el paso (o la vista) entre dos casilleros? (de centro a centro)
function paredCorta(a, b){
  if(!a || !b || (a.col === b.col && a.fila === b.fila) || !paredesSegs().length) return false;
  return paredEntrePuntos(hexCentro(a.col, a.fila), hexCentro(b.col, b.fila));
}
// Las paredes se ven: un borde oscuro debajo del dibujo y, encima, una línea cortada del color de la Colisión (lo llama js/05).
function dibujarParedEncima(t, z){
  ctx.save();
  ctx.translate(t.origen.x, t.origen.y);
  ctx.rotate(t.rotacion * Math.PI / 180);
  ctx.beginPath();
  trazarTrazo(ctx, t);
  ctx.setLineDash([7 / z, 5 / z]);
  ctx.strokeStyle = 'rgba(216,82,75,.95)';
  ctx.lineWidth = 2 / z;
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}
function dibujarParedDebajo(t, z){
  ctx.save();
  ctx.translate(t.origen.x, t.origen.y);
  ctx.rotate(t.rotacion * Math.PI / 180);
  ctx.beginPath();
  trazarTrazo(ctx, t);
  ctx.strokeStyle = 'rgba(15,12,14,.75)';
  ctx.lineWidth = (t.grosor + 5) / z;
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();
}
// Un trazo en rectas va con líneas rectas; uno a mano alzada, suavizado (js/07, trazarSuave).
function trazarTrazo(ctx2, t){
  if(!t.recto) return trazarSuave(ctx2, t.puntos);
  t.puntos.forEach((p, i) => { if(i) ctx2.lineTo(p.x, p.y); else ctx2.moveTo(p.x, p.y); });
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
// Clic en el botón 🧱 → pone o saca la colisión. true si el clic era ahí.
function clicBotonPared(m){
  const t = trazoSeleccionado ? trazos.get(trazoSeleccionado) : null;
  if(!trazoAdmitePared(t)) return false;
  const b = trazoParedBotonMundo(t);
  if(Math.hypot(m.x - b.x, m.y - b.y) > 12 / vista.zoom) return false;
  const nuevo = !t.colision;
  moverTrazo(trazoSeleccionado, {colision: nuevo}).then(() => toast(nuevo ? '🧱 Ese dibujo ahora es una pared: corta el paso y la vista' : 'Ese dibujo ya no es una pared'));
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
  if(pts.length >= 3 && Math.hypot(p.x - p0.x, p.y - p0.y) <= 10 / vista.zoom){ pts.push({x: p0.x, y: p0.y}); rectaTerminar(); return; }   // cerró la figura
  if(Math.hypot(p.x - ult.x, p.y - ult.y) > 2 / vista.zoom && pts.length < 200) pts.push(p);   // (el segundo clic de un doble clic cae en el mismo lugar)
  pedirDibujo();
}
function rectaTerminar(){
  if(!dibujando || !dibujando.recto) return;
  const pts = dibujando.puntos;
  dibujando = null;
  if(pts.length >= 2) guardarTrazo(pts, lapizPermanente || lapizColisionActiva(), {recto: true, colision: lapizColisionActiva()});
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
