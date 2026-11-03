/* 🩸 La animación de la Transfusión sanguínea (2026-11-03, dueño: «un par de segundos de animación, como de un chorro de sangre que va de uno hacia
   el otro… gotitas que vayan girando… que no sea una línea recta, sino… un líquido flotando en el espacio»). La geometría está en
   comun/fx-transfusion.js; acá se publica y se dibuja.
   Para que la vean TODAS las pantallas viaja como un momento (js/16, tipo 'transfusion', con {de, a, semilla}): también queda su tarjeta en la
   Crónica. Cada pantalla la dibuja ~2,2 s en el mapa, en coordenadas del mapa (respeta zoom y paneo), sigue a los tokens si se mueven, no toca
   clics y no hace nada si no hay ninguna en curso. Si uno de los dos tokens no se ve en esta pantalla (oculto, niebla, sigilo), no se dibuja
   (no delata dónde está). Con «reducir movimiento» del sistema: más corta, sin gotitas que giren. */
const TRANSFUSION_FX = [];   // {de, a, t0, semilla, gotas, dur}
const transfusionFxVistos = new Set();
const transfusionPocoMovimiento = () => { try{ return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } };

// La publica quien hace la Transfusión (después de aplicarla). Si el momento no se puede publicar, la ve al menos esta pantalla.
async function transfusionFxPublicar(deId, aId, titulo, resultado){
  if(!deId || !aId || deId === aId) return;
  const semilla = Math.floor(Math.random() * 1e9);
  const id = typeof momentoAbrir === 'function'
    ? await momentoAbrir({tipo: 'transfusion', icono: '🩸', titulo: String(titulo || 'Transfusión sanguínea'), resultado: resultado || '', estado: 'listo', datos: {de: deId, a: aId, semilla}})
    : null;
  if(!id) transfusionFxEmpezar(deId, aId, semilla);
}
// Llega a cada pantalla (js/16, momentoRecibido). Una sola vez por momento.
function transfusionFxRecibido(id, d){
  if(!d || !d.datos || transfusionFxVistos.has(id)) return;
  transfusionFxVistos.add(id);
  transfusionFxEmpezar(d.datos.de, d.datos.a, num(d.datos.semilla) || 1);
}
function transfusionFxEmpezar(de, a, semilla){
  if(typeof FxTransfusion === 'undefined' || !tokens.get(de) || !tokens.get(a)) return;
  const poco = transfusionPocoMovimiento();
  TRANSFUSION_FX.push({de, a, semilla, t0: performance.now(), dur: poco ? 1100 : FxTransfusion.DURACION, poco, gotas: FxTransfusion.gotitas(semilla, poco ? 0 : 18)});
  pedirDibujo();
}
const transfusionFxVe = t => !!t && (!t.oculto || soyGM) && (typeof tokenVisiblePorNiebla !== 'function' || tokenVisiblePorNiebla(t));

// El dibujo (js/05, encima del piso, con los otros efectos). true mientras quede alguna en curso.
function dibujarEfectosTransfusion(z){
  if(!TRANSFUSION_FX.length) return false;
  const ahora = performance.now();
  for(let i = TRANSFUSION_FX.length - 1; i >= 0; i--){
    const fx = TRANSFUSION_FX[i], ms = ahora - fx.t0;
    if(ms >= fx.dur + 500){ TRANSFUSION_FX.splice(i, 1); continue; }
    const ta = tokens.get(fx.de), tb = tokens.get(fx.a);
    if(!transfusionFxVe(ta) || !transfusionFxVe(tb)) continue;
    const A = hexCentro(ta.col, ta.fila), B = hexCentro(tb.col, tb.fila);
    transfusionFxDibujarUna(fx, A, B, ms, z);
  }
  return TRANSFUSION_FX.length > 0;
}
function transfusionFxDibujarUna(fx, A, B, ms, z){
  const F = FxTransfusion, p = Math.min(1, ms / fx.dur), {cabeza, cola} = F.ventana(p);
  const pts = F.curva(A, B, ms, fx.semilla, 56);
  const apagar = ms > fx.dur ? Math.max(0, 1 - (ms - fx.dur) / 500) : 1;
  const base = HEX * 0.28;   // ancho máximo del chorro, en unidades del mapa
  ctx.save();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // Un pulso oscuro en quien da (al principio): la sangre que sale.
  if(ms < 700){
    const k = ms / 700;
    ctx.beginPath(); ctx.arc(A.x, A.y, HEX * (0.45 + 0.5 * k), 0, 2 * Math.PI);
    ctx.strokeStyle = `rgba(120,0,12,${0.55 * (1 - k)})`; ctx.lineWidth = 5 / z; ctx.stroke();
  }
  // El chorro: tramos cortos con grosor variable (más fino en la punta y en la cola), en tres pasadas: halo, cuerpo y brillo.
  if(cabeza > cola + 0.005){
    const tramo = pts.filter(q => q.u >= cola && q.u <= cabeza);
    const ini = F.puntoEn(pts, cola), fin = F.puntoEn(pts, cabeza);
    const camino = [ini, ...tramo, fin];
    const largoU = Math.max(0.001, cabeza - cola);
    const ancho = (q, j) => {
      const uLocal = (j / Math.max(1, camino.length - 1));
      const punta = Math.min(1, uLocal / 0.18) * Math.min(1, (1 - uLocal) / 0.12 + 0.25);   // se afina en la punta que avanza y en la cola
      return Math.max(0.25, base * F.grosor(cola + uLocal * largoU, ms, fx.semilla) * punta);
    };
    [[2.4, `rgba(110,0,10,${0.22 * apagar})`, 0], [1, `rgba(150,8,22,${0.95 * apagar})`, 0], [0.32, `rgba(255,120,120,${0.55 * apagar})`, -0.35]].forEach(([mult, color, corrimiento]) => {
      for(let j = 1; j < camino.length; j++){
        const q0 = camino[j - 1], q1 = camino[j], w = ancho(q1, j) * mult;
        const dx = q1.x - q0.x, dy = q1.y - q0.y, l = Math.hypot(dx, dy) || 1, ox = -dy / l * w * corrimiento, oy = dx / l * w * corrimiento;
        ctx.beginPath(); ctx.moveTo(q0.x + ox, q0.y + oy); ctx.lineTo(q1.x + ox, q1.y + oy);
        ctx.strokeStyle = color; ctx.lineWidth = w; ctx.stroke();
      }
    });
    // La cabeza: una gota más gorda que tiembla.
    const wob = 1 + 0.15 * Math.sin(ms / 60);
    ctx.beginPath(); ctx.arc(fin.x, fin.y, base * 0.85 * wob, 0, 2 * Math.PI); ctx.fillStyle = `rgba(160,10,25,${apagar})`; ctx.fill();
  }
  // Las gotitas: van con el chorro, giran a su alrededor y algunas se desprenden y se quedan flotando hacia afuera.
  fx.gotas.forEach((g, k) => {
    const uMov = (g.u + ms * 0.00022) % 1;   // avanzan despacio a lo largo del chorro
    const vivo = uMov >= cola - 0.04 && uMov <= cabeza + 0.04;
    if(!vivo && !(g.suelta && p > 0.3)) return;
    const c = F.puntoEn(pts, Math.max(cola, Math.min(cabeza, uMov)));
    const ang = g.fase + ms * g.vel, giro = HEX * 0.32 * g.radio;
    let x = c.x + Math.cos(ang) * giro, y = c.y + Math.sin(ang) * giro * 0.7;
    let alfa = apagar;
    if(g.suelta){   // se desprende: se aleja del chorro y se apaga
      const s = Math.max(0, (p - 0.3) / 0.7);
      x += Math.cos(g.fase) * HEX * 0.9 * s * g.deriva; y += Math.sin(g.fase) * HEX * 0.9 * s * g.deriva;
      alfa *= 1 - s * 0.85;
    }
    const r = HEX * g.tam * (0.85 + 0.15 * Math.sin(ms / 90 + k));
    ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.fillStyle = `rgba(140,6,20,${0.9 * alfa})`; ctx.fill();
    ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.35, r * 0.32, 0, 2 * Math.PI); ctx.fillStyle = `rgba(255,170,170,${0.6 * alfa})`; ctx.fill();
  });
  // Al llegar: un salpicón y un pulso rojo en quien recibe.
  if(cabeza >= 0.999){
    const llegada = fx.dur * 0.45, k = Math.min(1, Math.max(0, (ms - llegada) / 900));
    ctx.beginPath(); ctx.arc(B.x, B.y, HEX * (0.5 + 0.7 * k), 0, 2 * Math.PI);
    ctx.strokeStyle = `rgba(200,20,40,${0.8 * (1 - k) * apagar})`; ctx.lineWidth = 4 / z; ctx.stroke();
    const g = ctx.createRadialGradient(B.x, B.y, 0, B.x, B.y, HEX * 0.8);
    g.addColorStop(0, `rgba(220,30,50,${0.35 * (1 - k * 0.6) * apagar})`); g.addColorStop(1, 'rgba(220,30,50,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(B.x, B.y, HEX * 0.8, 0, 2 * Math.PI); ctx.fill();
    if(!fx.poco) for(let s = 0; s < 8; s++){
      const a = fx.semilla % 6.283 + s * 0.785, d = HEX * (0.35 + 0.55 * k);
      ctx.beginPath(); ctx.arc(B.x + Math.cos(a) * d, B.y + Math.sin(a) * d, HEX * 0.05 * (1 - k), 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(160,10,25,${(1 - k) * apagar})`; ctx.fill();
    }
  }
  ctx.restore();
}
