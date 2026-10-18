/* ---------- 🧊 Superficies: hielo y agua (2026-10-17, dueño) ----------
   El hielo en el suelo (el «suelo congelado» de la Varita de la ventisca): una zona cuyo estado (`zonaEstado`, JSON) lleva `superficie: 'hielo'` y
   `tiraPaso: true`. Quien está parado cuando aparece tira (zonaInmediata), y después **cada paso que da sobre el hielo** es una tirada más
   (zonaRevisarEntrada, js/08): Agilidad contra el Ef.Esp de quien la puso; a la primera que falla, queda Sentado. Se ve celeste, con una franja
   más clara que la cruza (como el brillo de la moneda del Re-roll).
   Al irse el hielo queda un **charco de agua** en las mismas casillas (`superficie: 'agua'`, sin estado: el motor de zonas no lo resuelve), con
   forma de charco y no de hexágonos, y queda para siempre (hasta que el GM lo borre). Quien está parado en el agua es vulnerable al rayo
   (resistenciasDe, js/10). Lo crea el GM, que es quien borra las zonas vencidas (js/07). */
const AGUA_VULN_RAYO = 2;       // PLACEHOLDER (P203): cuánto baja la Res. eléctrica de quien está en el agua (negativa = vulnerable: suma daño)
function superficieSpec(el){
  if(!el || !el.zona || !el.zonaEstado) return null;
  try{ const s = JSON.parse(el.zonaEstado); return s && typeof s === 'object' ? s : null; }catch(err){ return null; }
}
const superficieDe = el => { const s = superficieSpec(el); return s && typeof s.superficie === 'string' ? s.superficie : ''; };
const esHielo = el => superficieDe(el) === 'hielo';
const esAgua = el => superficieDe(el) === 'agua';
// ¿Está parado en el agua? (levitando o volando no: no la toca)
function enAgua(t){
  if(!t || (typeof vuelaToken === 'function' && vuelaToken(t))) return false;
  for(const el of elementos.values()) if(esAgua(el) && celdasDeElemento(el).some(c => c.col === t.col && c.fila === t.fila)) return true;
  return false;
}
// Un número fijo por casilla (la forma del charco no cambia entre dibujos).
function superficieAzar(col, fila, k){
  let h = (col * 73856093) ^ (fila * 19349663) ^ (k * 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
/* La forma del hielo (2026-10-17, dueño: «un terreno congelado puede tener bordes geométricos pero irregulares»): cada casilla es un polígono
   de 12 puntas (las esquinas y el medio de cada lado) corridas un poco al azar. El azar sale de la posición del punto, así dos casillas vecinas
   comparten exactamente los mismos puntos: por dentro no se nota, y el borde de afuera queda quebrado, como de cristal. */
function hieloPunto(x, y){
  const kx = Math.round(x * 2), ky = Math.round(y * 2);
  const a = superficieAzar(kx, ky, 11) * Math.PI * 2, r = HEX * (0.06 + 0.2 * superficieAzar(kx, ky, 12));
  return [x + Math.cos(a) * r, y + Math.sin(a) * r];
}
function trazarHielo(celdas){
  ctx.beginPath();
  celdas.forEach(c => {
    const p = hexCentro(c.col, c.fila);
    for(let i = 0; i < 6; i++){
      const [ax, ay] = ESQUINAS[i], [bx, by] = ESQUINAS[(i + 1) % 6];
      const v = hieloPunto(p.x + ax, p.y + ay), m = hieloPunto(p.x + (ax + bx) / 2, p.y + (ay + by) / 2);
      if(i) ctx.lineTo(v[0], v[1]); else ctx.moveTo(v[0], v[1]);
      ctx.lineTo(m[0], m[1]);
    }
    ctx.closePath();
  });
}
/* El dibujo (lo llama js/05 por cada elemento): → null si no es una superficie (se dibuja como siempre), o {anima, sinBorde}. */
function superficieDibujar(el, celdas, z){
  const sup = superficieDe(el);
  if(sup === 'hielo'){
    trazarHielo(celdas);
    ctx.fillStyle = 'rgba(150,215,240,.45)'; ctx.fill();
    // La franja de brillo que la cruza en diagonal, cada 2,4 s.
    const ps = celdas.map(c => hexCentro(c.col, c.fila));
    const x0 = Math.min(...ps.map(p => p.x)) - HEX, x1 = Math.max(...ps.map(p => p.x)) + HEX;
    const y0 = Math.min(...ps.map(p => p.y)) - HEX, y1 = Math.max(...ps.map(p => p.y)) + HEX;
    const f = (performance.now() % 2400) / 2400, ancho = 0.16;
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    const a = Math.max(0, f - ancho), m = Math.min(1, Math.max(0, f)), b = Math.min(1, f + ancho);
    g.addColorStop(0, 'rgba(225,248,255,0)');
    if(a > 0) g.addColorStop(a, 'rgba(225,248,255,0)');
    g.addColorStop(m, 'rgba(235,252,255,.62)');
    if(b < 1) g.addColorStop(b, 'rgba(225,248,255,0)');
    g.addColorStop(1, 'rgba(225,248,255,0)');
    ctx.save(); trazarHielo(celdas); ctx.clip();
    ctx.fillStyle = g; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    ctx.restore();
    return {anima: true, sinBorde: true};
  }
  if(sup === 'agua'){
    // Un charco: las casillas enteras (una sola mancha, sin las líneas de adentro) y, en cada lado de afuera, una panza redonda de tamaño
    // al azar: el borde queda ondulado en vez de hexagonal.
    const set = new Set(celdas.map(c => c.col + ',' + c.fila));
    ctx.beginPath(); celdas.forEach(c => { const h = hexCentro(c.col, c.fila); trazarHex(h.x, h.y); });
    celdas.forEach(c => {
      const p = hexCentro(c.col, c.fila);
      for(let i = 0; i < 6; i++){
        const [ax, ay] = ESQUINAS[i], [bx, by] = ESQUINAS[(i + 1) % 6];
        const mx = (ax + bx) / 2, my = (ay + by) / 2;
        const v = mundoAHex(p.x + mx * 2, p.y + my * 2);   // la vecina de ese lado
        if(v && set.has(v.col + ',' + v.fila)) continue;
        const u = superficieAzar(c.col, c.fila, 20 + i), w = superficieAzar(c.col, c.fila, 30 + i);
        const sale = HEX * (-0.05 + 0.18 * w), r = HEX * (0.42 + 0.2 * u), d = Math.hypot(mx, my);
        const cx = p.x + mx + mx / d * sale, cy = p.y + my + my / d * sale;
        ctx.moveTo(cx + r, cy); ctx.arc(cx, cy, r, 0, Math.PI * 2);
      }
    });
    ctx.fillStyle = 'rgba(52,118,178,.5)'; ctx.fill();
    // Algún brillo suelto sobre el agua.
    ctx.fillStyle = 'rgba(190,225,250,.13)';
    celdas.forEach(c => {
      if(superficieAzar(c.col, c.fila, 40) < 0.45) return;
      const p = hexCentro(c.col, c.fila), dx = (superficieAzar(c.col, c.fila, 41) - 0.5) * HEX * 0.8, dy = (superficieAzar(c.col, c.fila, 42) - 0.5) * HEX * 0.8;
      ctx.beginPath(); ctx.ellipse(p.x + dx, p.y + dy, HEX * 0.32, HEX * 0.1, -0.35, 0, Math.PI * 2); ctx.fill();
    });
    return {anima: false, sinBorde: true};
  }
  return null;
}
/* Al irse el hielo (lo borra el GM: js/07), queda el charco en las mismas casillas. **No vence** (dueño, 2026-10-17): queda hasta que el GM lo
   borre. */
async function superficieAlIrse(el){
  if(!soyGM || !esHielo(el)) return;
  const celdas = celdasDeElemento(el);
  if(!celdas.length) return;
  const c0 = celdas[0], k0 = hexACubo(c0);
  const ref = String(el.zonaCasteadorRef || ''), tipo = el.zonaCasteadorTipo === 'creep' ? 'creep' : 'pj';
  try{
    await coleccionElementos().add({
      tipo: 'libre', origen: {col: c0.col, fila: c0.fila}, rotacion: 0,
      celdas: celdas.flatMap(c => { const k = hexACubo(c); return [k.q - k0.q, k.r - k0.r]; }),
      color: '#3476B2', alfa: 48, solido: false, invisible: false, imagen: '', imgZoom: 1, imgDX: 0, imgDY: 0, fijado: true,
      zona: true, zonaNombre: 'Charco de agua', zonaCasteadorRef: ref.slice(0, 64), zonaCasteadorTipo: tipo,
      zonaResueltos: [], zonaEnMantenimiento: false, zonaCadaPaso: false, zonaAltura: 'piso',
      zonaEstado: JSON.stringify({superficie: 'agua'}),
      duenoUid: fbUsuario.uid, creado: firebase.firestore.FieldValue.serverTimestamp(),
    });
    momentoAbrir({tipo: 'zona-renueva', icono: '💧', titulo: 'El hielo se derrite', estado: 'listo',
      resultado: `Queda un charco de agua: quien esté parado en el agua es vulnerable al rayo (Res. eléctrica −${AGUA_VULN_RAYO}).`, datos: {}});
  }catch(err){ console.error('No se pudo dejar el charco de agua:', err); }
}
