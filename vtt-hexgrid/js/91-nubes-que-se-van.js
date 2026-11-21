/* ☁ Nubes que se disipan (2026-11-03, dueño: «todo lo que es nubes y gases, si se puede, que tenga un efecto al desaparecer, que sea gradual: que el
   humo se disipe, que no haga tipo blink out»). Cuando una nube o un gas desaparece del mapa (vence por turnos, lo borra el viento, la Anulación o
   alguien a mano) o el viento le saca casillas, cada pantalla guarda una copia «fantasma» de lo que se fue y la dibuja ~1,8 s: se agranda un poco
   y se desvanece. El fantasma ya no existe para el juego: no se selecciona, no tapa la vista ni la niebla de guerra, no tiene efecto. Solo para lo
   que esta pantalla veía, y solo lo que pasa en vivo (no al cargar el mapa: un «removed» solo llega por un cambio).
   Qué es nube: la niebla de una varita / la Bomba de humo (`niebla: true`) y toda zona que se dibuja como nube (`nubeColor`, js/50: humo, gas,
   veneno, esporas, miasma, talco, niebla/bruma, vapor; nunca fuego). Lo llama js/07 (`escucharElementos`) y lo dibuja js/05. */
const NUBE_FADE_MS = 1800;
const nubesFantasma = [];   // {celdas: [{col, fila}], color, arriba (la niebla, encima de los tokens), t0}
function esNubeEl(el){ return !!(el && (el.niebla || (el.zona && typeof nubeColor === 'function' && nubeColor(el)))); }
function nubeFantasma(el, celdas){
  if(!esNubeEl(el) || !Array.isArray(celdas) || !celdas.length) return;
  try{ if(typeof puedeVerElemento === 'function' && !puedeVerElemento(el)) return; }catch(err){ return; }
  const color = el.niebla ? (typeof NUBE_GRIS !== 'undefined' ? NUBE_GRIS : 'rgba(200,205,216,.62)') : nubeColor(el);
  if(!color) return;
  nubesFantasma.push({celdas: celdas.map(c => ({col: c.col, fila: c.fila})), color, arriba: !!el.niebla, t0: performance.now()});
  if(typeof pedirDibujo === 'function') pedirDibujo();
}
// Lo que se va de un elemento al cambiar: todas sus casillas (si se borró) o las que perdió (el viento recortó media nube).
function nubeSeFue(previo, nuevo){
  if(!previo || !esNubeEl(previo)) return;
  let antes = []; try{ antes = celdasDeElemento(previo); }catch(err){ return; }
  if(!nuevo){ nubeFantasma(previo, antes); return; }
  let ahora = []; try{ ahora = celdasDeElemento(nuevo); }catch(err){ return; }
  if(ahora.length >= antes.length) return;   // se movió o creció: nada se fue (arrastrarla no deja fantasma)
  const quedan = new Set(ahora.map(c => c.col + ',' + c.fila));
  const fueron = antes.filter(c => !quedan.has(c.col + ',' + c.fila));
  if(fueron.length && fueron.length < antes.length) nubeFantasma(previo, fueron);
}
// El dibujo (js/05): `arriba` = las de niebla, encima de los tokens; si no, las zonas, debajo. Devuelve true mientras quede alguno.
function nubesFantasmaDibujar(z, arriba){
  if(!nubesFantasma.length || typeof nubeDibujar !== 'function') return false;
  const ahora = performance.now();
  for(let i = nubesFantasma.length - 1; i >= 0; i--) if(ahora - nubesFantasma[i].t0 >= NUBE_FADE_MS) nubesFantasma.splice(i, 1);
  nubesFantasma.filter(f => !!f.arriba === !!arriba).forEach(f => {
    const p = Math.min(1, (ahora - f.t0) / NUBE_FADE_MS), suave = 1 - Math.pow(1 - p, 2);   // se va rápido al principio y se apaga despacio
    let cx = 0, cy = 0; f.celdas.forEach(c => { const h = hexCentro(c.col, c.fila); cx += h.x; cy += h.y; }); cx /= f.celdas.length; cy /= f.celdas.length;
    const esc = 1 + 0.22 * suave;   // se abre un poco, como humo que se dispersa
    ctx.save();
    ctx.globalAlpha *= Math.max(0, 1 - suave);
    ctx.translate(cx, cy); ctx.scale(esc, esc); ctx.translate(-cx, -cy);
    nubeDibujar(f.celdas, f.color, z * esc);
    ctx.restore();
  });
  return nubesFantasma.length > 0;
}
