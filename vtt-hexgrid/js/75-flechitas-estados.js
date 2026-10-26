// js/75-flechitas-estados.js — ⬆⬇ Flechitas al recibir un buff o un debuff (2026-10-25, dueño: «probar una pequeña animación que cuando se coloca
// un buff, durante un segundo, el token tenga una animación de flechitas verdes que van para arriba; y lo mismo cuando se coloca un debuff»).
// Sale de lo público que ya escucha cada pantalla (`resumen.estados` de fichas, creeps e invocaciones: estadoDe, js/01), así que la ven todos y vale
// para todo lo que pone estados (habilidades, trampas, zonas, a mano) sin tocar cada uno. Cuidados: no anima lo que ya estaba al cargar el mapa (la
// primera vez que se ve un token solo se anota), ni los estados derivados (pasivas, sobrepeso), ni los que no son buff ni debuff; y se dibuja en el
// recorrido de los tokens que se ven (js/05), así que un token oculto o en la niebla no se delata.

const FLECHITAS_MS = 1200;
const flechitasPrevias = new Map();   // id del token → {clave: a qué ficha/creep apunta, nombres: Set de los estados que tenía}
const flechitasActivas = new Map();   // id del token → {buff: inicio, debuff: inicio} (performance.now())

// Una vez por dibujo (js/05, antes de los tokens): los estados nuevos de cada token, vea uno o no el token.
function flechitasRevisar(){
  const ahora = performance.now();
  tokens.forEach((t, id) => {
    const est = estadoDe(t);
    if(!est) return;   // todavía no llegó lo público: no se anota nada
    const clave = (t.tipo || '') + ':' + (t.fichaId || '') + ':' + (t.invId || '');
    const nombres = new Set(), pol = new Map();
    est.estados.forEach(e => {
      if(!e || !e.nombre || e.derivado) return;
      nombres.add(e.nombre);
      pol.set(e.nombre, e.polaridad);
    });
    const previo = flechitasPrevias.get(id);
    flechitasPrevias.set(id, {clave, nombres});
    if(!previo || previo.clave !== clave || est.muerto) return;   // recién aparece o cambió de vínculo: solo se anota
    nombres.forEach(n => {
      if(previo.nombres.has(n)) return;
      const p = pol.get(n);
      if(p !== 'buff' && p !== 'debuff') return;
      const a = flechitasActivas.get(id) || {};
      a[p] = ahora;
      flechitasActivas.set(id, a);
    });
  });
  flechitasPrevias.forEach((_, id) => { if(!tokens.has(id)){ flechitasPrevias.delete(id); flechitasActivas.delete(id); } });
}

// En el recorrido de los tokens que se ven (js/05): las flechitas encima del token. Devuelve true mientras siga animando.
function flechitasDibujar(id, x, y, rad, z){
  const a = flechitasActivas.get(id);
  if(!a) return false;
  const ahora = performance.now();
  let sigue = false;
  [['buff', -1, '#5FDC8C'], ['debuff', 1, '#F0525C']].forEach(([p, dir, color], k) => {
    if(a[p] === undefined) return;
    const f = (ahora - a[p]) / FLECHITAS_MS;
    if(f >= 1){ delete a[p]; return; }
    sigue = true;
    // Tres columnas de flechitas (si llegan las dos cosas juntas, se intercalan), cada una un poco desfasada: entran, recorren el token y se apagan.
    const cols = [-0.48, 0, 0.48].map(c => c + (a.buff !== undefined && a.debuff !== undefined ? (k ? 0.16 : -0.16) : 0));
    const tam = rad * 0.26;
    ctx.save();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    cols.forEach((c, i) => {
      const fi = Math.max(0, Math.min(1, (f - i * 0.12) / 0.76));
      if(fi <= 0 || fi >= 1) return;
      const alfa = Math.sin(fi * Math.PI);
      const cx = x + c * rad, cy = y - dir * rad * (0.75 - 1.5 * fi);   // el buff sube de abajo hacia arriba; el debuff baja
      for(let j = 0; j < 2; j++){   // dos chevrones pegados, como ⏫
        const yy = cy + dir * j * tam * 0.85;
        ctx.beginPath();
        ctx.moveTo(cx - tam, yy - dir * tam * 0.7);
        ctx.lineTo(cx, yy + dir * tam * 0.3);
        ctx.lineTo(cx + tam, yy - dir * tam * 0.7);
        ctx.globalAlpha = alfa * (j ? 0.65 : 1);
        ctx.strokeStyle = 'rgba(10,8,12,.85)'; ctx.lineWidth = Math.max(5 / z, tam * 0.55); ctx.stroke();
        ctx.strokeStyle = color; ctx.lineWidth = Math.max(2.5 / z, tam * 0.3); ctx.stroke();
      }
    });
    ctx.restore();
  });
  if(!sigue) flechitasActivas.delete(id);
  return sigue;
}
