// js/111-parpadeo-tv.js — 📺 El Parpadeo como un televisor viejo (dueño, 2026-11-09: «una vez que el usuario elige la posición de destino, quiero un
// efecto de "turn off tv", y el opuesto para el punto donde aparece»).
//
// Lo usa todo lo que salta por blinkDeHabilidad (js/13): la Varita del blink, el Parpadeo de los creeps (Mago de escarcha, Piromante…), el blink de
// una habilidad de personaje o de invocación (mensaje 'blink-habilidad') y ¡Al frente! del Support. Quien salta publica UN momento «blink-tv»
// (js/16 → blinkTvRecibido) ANTES de mover el token, así todas las pantallas lo ven a la vez:
//   - en la casilla de salida, el token se apaga como un televisor de tubo: se aplasta hasta una raya blanca, la raya se achica a un punto y el punto se
//     apaga;
//   - en la de llegada, al revés: aparece un punto, se estira en una raya y la raya se abre hasta el token.
// Mientras dura, calcularDisposicion (js/05) dibuja el token en la casilla que toca (`blinkTvPosToken`, con su escala), aunque su casilla nueva ya haya
// llegado: nunca se lo ve deslizarse de una a otra. Solo lo ve quien ve al token (el que está oculto, en la niebla o en sigilo para mí, no se dibuja).
const BLINK_TV = [];   // {id, de: {x,y}, a: {x,y}, t0}
const blinkTvVistos = new Set();
// Los tiempos (ms): apagar (aplastar → raya → punto que se apaga) y encender (punto → raya → abrir). Total ~0,9 s.
const BLINK_TV_T = {aplasta: 170, achica: 170, punto: 130, pausa: 60, aparece: 90, estira: 150, abre: 170};
const BLINK_TV_DUR = Object.values(BLINK_TV_T).reduce((a, b) => a + b, 0);
const blinkTvPoco = () => { try{ return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } };

// Quien salta: publica el momento (o, si no se puede, lo arranca solo acá). `de` y `a` son casillas {col, fila}.
async function blinkTvPublicar(id, de, a){
  if(!id || !de || !a) return;
  const datos = {id: String(id), de: {col: Math.round(num(de.col)), fila: Math.round(num(de.fila))}, a: {col: Math.round(num(a.col)), fila: Math.round(num(a.fila))}};
  let mid = null;
  try{ mid = typeof momentoAbrir === 'function' ? await momentoAbrir({tipo: 'blink-tv', icono: '', titulo: '', estado: 'listo', datos}) : null; }
  catch(err){ console.error('Parpadeo: no se pudo publicar la animación', err); }
  if(!mid) blinkTvEmpezar(datos);
}
// Llega a cada pantalla (js/16). Una sola vez, y solo si es de recién.
function blinkTvRecibido(id, d){
  if(!d || !d.datos || blinkTvVistos.has(id)) return;
  blinkTvVistos.add(id);
  const t = d.creado && d.creado.toMillis ? d.creado.toMillis() : Date.now();
  if(Date.now() - t > 15000) return;
  blinkTvEmpezar(d.datos);
}
function blinkTvEmpezar(dt){
  if(!dt || !dt.id || !tokens.get(dt.id) || blinkTvPoco()) return;
  for(let i = BLINK_TV.length - 1; i >= 0; i--) if(BLINK_TV[i].id === dt.id) BLINK_TV.splice(i, 1);
  BLINK_TV.push({id: dt.id, de: hexCentro(dt.de.col, dt.de.fila), a: hexCentro(dt.a.col, dt.a.fila), t0: performance.now()});
  pedirDibujo();
}
// En qué parte de la animación va: {fase: 'sale'|'llega', x, y, sx, sy, linea (0–1: cuánto brilla la raya), punto (0–1), escaneo (0–1)}.
function blinkTvEstado(fx, ms){
  const T = BLINK_TV_T, suave = u => u * u * (3 - 2 * u), cl = u => Math.max(0, Math.min(1, u));
  const RAYA = 0.045;   // lo alto de la raya, relativo al token
  let t = ms;
  // — Apagar, en la casilla de salida —
  if(t < T.aplasta){ const u = suave(cl(t / T.aplasta)); return {fase: 'sale', x: fx.de.x, y: fx.de.y, sx: 1 + 0.18 * u, sy: 1 - (1 - RAYA) * u, linea: u, punto: 0, escaneo: 1 - u}; }
  t -= T.aplasta;
  if(t < T.achica){ const u = suave(cl(t / T.achica)); return {fase: 'sale', x: fx.de.x, y: fx.de.y, sx: (1.18) * (1 - u) + 0.02 * u, sy: RAYA, linea: 1, punto: u, escaneo: 0}; }
  t -= T.achica;
  if(t < T.punto){ const u = cl(t / T.punto); return {fase: 'sale', x: fx.de.x, y: fx.de.y, sx: 0.0001, sy: 0.0001, linea: 0, punto: 1 - u, escaneo: 0}; }
  t -= T.punto;
  if(t < T.pausa) return {fase: 'llega', x: fx.a.x, y: fx.a.y, sx: 0.0001, sy: 0.0001, linea: 0, punto: 0, escaneo: 0};
  t -= T.pausa;
  // — Encender, en la de llegada —
  if(t < T.aparece){ const u = cl(t / T.aparece); return {fase: 'llega', x: fx.a.x, y: fx.a.y, sx: 0.0001, sy: 0.0001, linea: 0, punto: u, escaneo: 0}; }
  t -= T.aparece;
  if(t < T.estira){ const u = suave(cl(t / T.estira)); return {fase: 'llega', x: fx.a.x, y: fx.a.y, sx: 0.02 * (1 - u) + 1.18 * u, sy: RAYA, linea: 1, punto: 1 - u, escaneo: 0}; }
  t -= T.estira;
  const u = suave(cl(t / T.abre));
  return {fase: 'llega', x: fx.a.x, y: fx.a.y, sx: 1.18 - 0.18 * u, sy: RAYA + (1 - RAYA) * u, linea: 1 - u, punto: 0, escaneo: 1 - u};
}
// Para calcularDisposicion (js/05): dónde y con qué escala se dibuja el token mientras dura (o null: como siempre).
function blinkTvPosToken(id){
  if(!BLINK_TV.length) return null;
  const fx = BLINK_TV.find(f => f.id === id);
  if(!fx) return null;
  const ms = performance.now() - fx.t0;
  if(ms >= BLINK_TV_DUR) return null;
  const e = blinkTvEstado(fx, ms);
  return {x: e.x, y: e.y, sx: e.sx, sy: e.sy};
}
// Encima de los tokens: la raya que brilla, el punto blanco y unas líneas de barrido que titilan.
function dibujarEfectosBlinkTv(z){
  if(!BLINK_TV.length) return false;
  const ahora = performance.now();
  for(let i = BLINK_TV.length - 1; i >= 0; i--){
    const fx = BLINK_TV[i], ms = ahora - fx.t0;
    if(ms >= BLINK_TV_DUR + 40){ BLINK_TV.splice(i, 1); continue; }
    if(typeof disposicion !== 'undefined' && Array.isArray(disposicion) && !disposicion.some(d => d.id === fx.id)) continue;   // no lo veo: nada
    const e = blinkTvEstado(fx, ms), R = HEX * 0.68;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    if(e.linea > 0.01){   // la raya: blanca en el centro, celeste alrededor
      const w = R * 2 * Math.max(0.02, e.sx), h = Math.max(2.5 / z, R * 2 * e.sy * 0.9);
      ctx.shadowColor = 'rgba(150,220,255,.95)'; ctx.shadowBlur = 18 / z;
      ctx.fillStyle = `rgba(190,235,255,${0.75 * e.linea})`;
      ctx.fillRect(e.x - w / 2, e.y - h / 2, w, h);
      ctx.fillStyle = `rgba(255,255,255,${0.95 * e.linea})`;
      ctx.fillRect(e.x - w / 2, e.y - h / 4, w, h / 2);
    }
    if(e.punto > 0.01){   // el punto blanco con su halo
      const r = R * 0.22;
      const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, r * 2.2);
      g.addColorStop(0, `rgba(255,255,255,${e.punto})`); g.addColorStop(0.35, `rgba(200,240,255,${0.7 * e.punto})`); g.addColorStop(1, 'rgba(120,200,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(e.x, e.y, r * 2.2, 0, 2 * Math.PI); ctx.fill();
    }
    if(e.escaneo > 0.05){   // líneas de barrido que titilan sobre el token mientras se aplasta o se abre
      const alto = R * 2 * e.sy, ancho = R * 2 * e.sx, paso = Math.max(3 / z, alto / 9), fase = (ms / 40) % 2 < 1 ? 0 : paso / 2;
      ctx.fillStyle = `rgba(170,230,255,${0.22 * e.escaneo})`;
      for(let y = e.y - alto / 2 + fase; y < e.y + alto / 2; y += paso) ctx.fillRect(e.x - ancho / 2, y, ancho, Math.max(1 / z, paso * 0.35));
    }
    ctx.restore();
  }
  return BLINK_TV.length > 0;
}
