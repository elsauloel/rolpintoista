/* ============================================================
   🕸 LO QUE ATRAPA, A LA VISTA (2026-10-23, dueño)
   «Para la red Nerubian, sobre el hexágono la imagen de una tela de araña: que solamente se vean las líneas, que el token se vea a
   través de ella mientras dure el efecto. Y si hay alguna superficie en el suelo afectada por una tela de araña, ese mismo efecto.
   Con una pequeña animación de elasticidad cada tanto.» Y la Red de caza: «una cuadrícula y pequeñas bolitas que simbolizan el peso al
   final de las líneas, con un cierre irregular».
   - Encima del token: el estado que lo tiene atrapado lleva `soltar.visual` (lo público: `atrapa`; Combatiente.atrapaDe).
   - En el piso: una trampa armada de telaraña o de red (por su `trampaEstado` o por su nombre: Combatiente.atrapaDeNombre), encima de su
     ficha redonda, para que se lea qué trampa es.
   - El rebote: cada ~3,6 s el centro baja y vuelve, con un temblor que se apaga; los bordes quedan quietos. Cada uno a su ritmo.
   Solo dibuja: no escribe nada.
   ============================================================ */

function atrapaDeToken(est){
  if(!est || !Array.isArray(est.estados)) return '';
  for(const e of est.estados){ if(e && e.activo !== false){ const v = Combatiente.atrapaDe(e); if(v) return v; } }
  return '';
}
function atrapaDeElemento(el){
  if(!el || !el.trampa || el.disparada) return '';
  try{ const j = el.trampaEstado ? JSON.parse(el.trampaEstado) : null; const v = Combatiente.atrapaDe(j); if(v) return v; }catch(e){}
  return Combatiente.atrapaDeNombre(el.trampaNombre);
}
// Un número al azar pero fijo para cada token / casilla (así la red no cambia de forma en cada cuadro).
const atrapaAzar = (semilla, k) => { const x = Math.sin(semilla * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); };
// El rebote: cuánto baja el centro ahora (una oscilación que se apaga), en unidades de `rad`.
function atrapaRebote(semilla){
  const PERIODO = 3.6, DURA = 1.1;
  const t = (performance.now() / 1000 + semilla * 0.83) % PERIODO;
  return t < DURA ? 0.13 * Math.exp(-4.2 * t) * Math.sin(2 * Math.PI * 2.6 * t) : 0;
}

// Dibuja la telaraña o la red centrada en (x, y). `o.suelo`: más tenue (la del piso).
function dibujarAtrapa(tipo, x, y, rad, z, semilla, o = {}){
  const reb = atrapaRebote(semilla) * rad;
  // Cada punto se corre hacia abajo según lo lejos que esté del borde: el centro se mueve, los bordes no.
  const mover = (px, py) => { const d = Math.hypot(px - x, py - y) / rad; return [px, py + reb * Math.max(0, 1 - d)]; };
  const alfa = o.suelo ? 0.85 : 1;
  ctx.save();
  trazarPuntos(verticesHex(x, y, rad)); ctx.clip();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if(tipo === 'red') redDeSoga(x, y, rad, z, semilla, mover, alfa);
  else telarana(x, y, rad, z, semilla, mover, alfa);
  ctx.restore();
}
// Un trazo con su contorno oscuro debajo, para que se lea sobre cualquier ilustración.
function atrapaTrazo(trazar, claro, oscuro, ancho, z){
  ctx.beginPath(); trazar(); ctx.strokeStyle = oscuro; ctx.lineWidth = ancho * 2.4 / z; ctx.stroke();
  ctx.beginPath(); trazar(); ctx.strokeStyle = claro; ctx.lineWidth = ancho / z; ctx.stroke();
}

// 🕸 Telaraña: hilos que salen del centro y anillos que los cruzan, combados hacia adentro.
function telarana(x, y, rad, z, semilla, mover, alfa){
  const RAYOS = 9, ANILLOS = 5, giro = atrapaAzar(semilla, 1) * Math.PI * 2;
  const ang = [...Array(RAYOS)].map((_, i) => giro + (i + (atrapaAzar(semilla, 10 + i) - 0.5) * 0.35) * Math.PI * 2 / RAYOS);
  const largo = ang.map((_, i) => rad * (1.05 + 0.15 * atrapaAzar(semilla, 30 + i)));
  const punto = (i, r) => mover(x + Math.cos(ang[i]) * r, y + Math.sin(ang[i]) * r);
  const [cx, cy] = mover(x, y);
  const claro = `rgba(238,240,248,${0.85 * alfa})`, oscuro = `rgba(20,18,26,${0.32 * alfa})`;
  atrapaTrazo(() => { ang.forEach((_, i) => { const [px, py] = punto(i, largo[i]); ctx.moveTo(cx, cy); ctx.lineTo(px, py); }); }, claro, oscuro, 1.1, z);
  for(let k = 1; k <= ANILLOS; k++){
    const fr = k / (ANILLOS + 0.6);
    atrapaTrazo(() => {
      for(let i = 0; i < RAYOS; i++){
        const j = (i + 1) % RAYOS, ri = largo[i] * fr * (0.94 + 0.12 * atrapaAzar(semilla, 50 + k * 13 + i)), rj = largo[j] * fr * (0.94 + 0.12 * atrapaAzar(semilla, 50 + k * 13 + j));
        const [ax, ay] = punto(i, ri), [bx, by] = punto(j, rj);
        const medio = ang[i] + (((ang[j] - ang[i]) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) / 2, rm = (ri + rj) / 2 * 0.8;   // la comba hacia el centro
        const [qx, qy] = mover(x + Math.cos(medio) * rm, y + Math.sin(medio) * rm);
        if(i === 0) ctx.moveTo(ax, ay);
        ctx.quadraticCurveTo(qx, qy, bx, by);
      }
    }, claro, oscuro, 0.85, z);
  }
}

// 🪢 Red de soga: una cuadrícula torcida, con el borde desparejo y un pesito al final de cada soga.
function redDeSoga(x, y, rad, z, semilla, mover, alfa){
  // El borde desparejo: 12 puntos alrededor, cada uno a su distancia.
  const N = 12, borde = [...Array(N)].map((_, i) => {
    const a = (i / N) * Math.PI * 2 + (atrapaAzar(semilla, 70 + i) - 0.5) * 0.3, r = rad * (0.72 + 0.22 * atrapaAzar(semilla, 90 + i));
    return [x + Math.cos(a) * r, y + Math.sin(a) * r];
  });
  // Dónde corta una recta (punto p, dirección u) al borde: los dos extremos.
  const extremos = (px, py, ux, uy) => {
    const ts = [];
    for(let i = 0; i < N; i++){
      const [ax, ay] = borde[i], [bx, by] = borde[(i + 1) % N], ex = bx - ax, ey = by - ay, den = ux * ey - uy * ex;
      if(Math.abs(den) < 1e-9) continue;
      const t = ((ax - px) * ey - (ay - py) * ex) / den, s = ((ax - px) * uy - (ay - py) * ux) / den;
      if(s >= 0 && s <= 1) ts.push(t);
    }
    return ts.length >= 2 ? [Math.min(...ts), Math.max(...ts)] : null;
  };
  const giro = (atrapaAzar(semilla, 2) - 0.5) * 0.6 + 0.25, paso = rad * 0.27;
  const sogas = [], pesos = [];
  [giro, giro + Math.PI / 2].forEach(a => {
    const ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux;
    for(let s = -rad; s <= rad; s += paso){
      const px = x + nx * (s + paso * 0.5 * atrapaAzar(semilla, 110 + Math.round(s))), py = y + ny * (s + paso * 0.5 * atrapaAzar(semilla, 110 + Math.round(s)));
      const e = extremos(px, py, ux, uy);
      if(!e || e[1] - e[0] < rad * 0.25) continue;
      const pts = [];
      for(let k = 0; k <= 6; k++){ const t = e[0] + (e[1] - e[0]) * k / 6; pts.push(mover(px + ux * t, py + uy * t)); }
      sogas.push(pts); pesos.push(pts[0], pts[pts.length - 1]);
    }
  });
  const claro = `rgba(206,170,112,${0.92 * alfa})`, oscuro = `rgba(30,20,10,${0.45 * alfa})`;
  atrapaTrazo(() => {   // el cierre: la soga del borde, desparejo
    borde.forEach((p, i) => { const [bx, by] = mover(p[0], p[1]); i ? ctx.lineTo(bx, by) : ctx.moveTo(bx, by); }); ctx.closePath();
  }, claro, oscuro, 1.3, z);
  atrapaTrazo(() => { sogas.forEach(pts => { pts.forEach(([px, py], i) => i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)); }); }, claro, oscuro, 1.05, z);
  // Los pesitos: bolitas de plomo en la punta de cada soga.
  const r0 = Math.max(rad * 0.055, 1.6 / z);
  pesos.forEach(([px, py]) => {
    ctx.beginPath(); ctx.arc(px, py, r0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(70,72,80,${alfa})`; ctx.fill();
    ctx.strokeStyle = `rgba(15,15,20,${0.7 * alfa})`; ctx.lineWidth = 0.8 / z; ctx.stroke();
    ctx.beginPath(); ctx.arc(px - r0 * 0.35, py - r0 * 0.35, r0 * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(210,215,225,${0.75 * alfa})`; ctx.fill();
  });
}

// En el piso: cada casilla de una trampa armada de telaraña o de red. → true si hay que seguir animando.
function atrapaDibujarSuelo(el, celdas, z){
  const tipo = atrapaDeElemento(el);
  if(!tipo) return false;
  celdas.forEach(c => { const p = hexCentro(c.col, c.fila); dibujarAtrapa(tipo, p.x, p.y, HEX * 0.96, z, (c.col * 7 + c.fila * 3) % 13, {suelo: true}); });
  return true;
}
