/* ---------- 🧊 Superficies: hielo y agua (2026-10-17, dueño) ----------
   El hielo en el suelo (el «suelo congelado» de la Varita de la ventisca): una zona cuyo estado (`zonaEstado`, JSON) lleva `superficie: 'hielo'` y
   `tiraPaso: true`. Quien está parado cuando aparece tira (zonaInmediata), y después **cada paso que da sobre el hielo** es una tirada más
   (zonaRevisarEntrada, js/08): Agilidad contra el Ef.Esp de quien la puso; a la primera que falla, queda Sentado. Se ve celeste, con una franja
   más clara que la cruza (como el brillo de la moneda del Re-roll).
   Al irse el hielo queda un **charco de agua** en las mismas casillas (`superficie: 'agua'`, sin estado: el motor de zonas no lo resuelve), con
   forma de charco y no de hexágonos, y queda para siempre (hasta que el GM lo borre o lo seque el fuego). Lo crea el GM, que es quien borra
   las zonas vencidas (js/07).
   **El agua y el rayo** (dueño, 2026-10-17: «que esa probabilidad aumente y que el daño también aumente, todo en un 50 % o el doble»; vale para
   cualquiera —personajes, invocaciones, creeps— salvo que levite o vuele): quien está parado en el agua recibe el daño eléctrico ×1,5 (para
   arriba: `aguaRayo`, en cada lugar donde el mapa aplica daño de rayo) y la Parálisis le entra con el doble de chance (comun/duelo.js,
   `aguaParalisis`). **El fuego lo seca** (dueño): una casilla de agua que queda bajo fuego (terreno incendiado o una zona de fuego) desaparece. */
const AGUA_MULT_RAYO = 1.5;     // P203 (sugerencia, a confirmar): el daño de rayo a quien está en el agua
function superficieSpec(el){
  if(!el || !el.zona || !el.zonaEstado) return null;
  try{ const s = JSON.parse(el.zonaEstado); return s && typeof s === 'object' ? s : null; }catch(err){ return null; }
}
const superficieDe = el => { const s = superficieSpec(el); return s && typeof s.superficie === 'string' ? s.superficie : ''; };
const esHielo = el => superficieDe(el) === 'hielo';
const esAgua = el => superficieDe(el) === 'agua';
// ¿Está parado en el agua? (levitando o volando no: no la toca)
function enAgua(t){
  if(!t || (typeof vuelaToken === 'function' && vuelaToken(t)) || (typeof statPiesDe === 'function' && statPiesDe(t, 'levitar') > 0)) return false;
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
  if(el && el.niebla) return {anima: false, sinBorde: true};   // la niebla de una varita la dibuja dibujarNieblaVarita (js/05), encima de los tokens
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
  if(sup === 'agua'){ aguaDibujar(celdas, z); return {anima: true, sinBorde: true}; }
  // ☁ Las nubes (dueño, 2026-10-17: «para nubes y para niebla, un borde irregular difuminado: verde para nubes tóxicas, o violeta, y gris para
  // neblina»): una zona que es un gas (tóxica, o por su nombre: gas, nube, humo, miasma, pedos, esporas, vapor) se dibuja como una mancha con el
  // borde desparejo y borroso, en vez de hexágonos.
  const nube = nubeColor(el);
  if(nube){ nubeDibujar(celdas, nube, z); return {anima: false, sinBorde: true}; }
  if(esLava(el)){ lavaDibujar(celdas, z); return {anima: true, sinBorde: true, fuego: true}; }   // 🌋 la lava (2026-11-09)
  if(esFuego(el)){ fuegoDibujar(celdas, z); return {anima: true, sinBorde: true, fuego: true}; }
  return null;
}
/* 💧 El charco (2026-11-05, dueño: «el borde del charco parece una nube; tiene que ser una ondulación, como agua»). El contorno de afuera de las
   casillas (los lados que no tocan otra casilla del charco, encadenados en lazos) con cada lado ondulado por una onda que corre despacio y vale
   cero en las esquinas (así los lados empalman); adentro, la misma línea un poco más chica y más tenue, como la onda que viene detrás, y un brillo
   que se mueve. El relleno es uno solo (sin líneas de adentro). */
function aguaContornos(celdas){
  const k = (x, y) => Math.round(x * 4) + ',' + Math.round(y * 4), mitad = new Map(), lados = [];
  // Sin casillas repetidas (2026-11-06, prueba en el mapa: una forma con una casilla dos veces contaba sus lados como «de adentro» y el charco
  // se partía en pedazos).
  const vistas = new Set();
  celdas = celdas.filter(c => { const q = c.col + ',' + c.fila; if(vistas.has(q)) return false; vistas.add(q); return true; });
  celdas.forEach(c => {
    const p = hexCentro(c.col, c.fila);
    for(let i = 0; i < 6; i++){
      const [ax, ay] = ESQUINAS[i], [bx, by] = ESQUINAS[(i + 1) % 6];
      const l = {a: [p.x + ax, p.y + ay], b: [p.x + bx, p.y + by], c: p};
      const km = k((l.a[0] + l.b[0]) / 2, (l.a[1] + l.b[1]) / 2);
      mitad.set(km, (mitad.get(km) || 0) + 1); l.km = km; lados.push(l);
    }
  });
  const afuera = lados.filter(l => mitad.get(l.km) === 1), porInicio = new Map();
  afuera.forEach(l => porInicio.set(k(l.a[0], l.a[1]), l));
  const usados = new Set(), lazos = [];
  for(const l0 of afuera){
    if(usados.has(l0)) continue;
    const lazo = []; let l = l0;
    while(l && !usados.has(l)){ usados.add(l); lazo.push(l); l = porInicio.get(k(l.b[0], l.b[1])); }
    lazos.push(lazo);
  }
  return lazos;
}
// Un lado ondulado: de a hacia b, corrido `adentro` hacia el centro de su casilla, con la onda en fase `fase`.
/* 🌊 La orilla, más libre (2026-11-05, dueño: «esta superficie de agua tiene bordes demasiado regulares… un efecto menos regular, que no se aleje
   demasiado de la forma original, pero más libre, total se suma la línea punteada»): además de la onda que corre, cada esquina de afuera se corre un
   poco al azar (el azar sale de su posición: los dos lados que la comparten la mueven igual, así empalman) y cada lado tiene su propia forma fija, una
   panza que sale o se mete y un desparejo, distintos en cada lado. La línea punteada (bordeHexPunteado) marca las casillas exactas. */
function aguaEsquina(x, y){
  const kx = Math.round(x * 2), ky = Math.round(y * 2);
  const a = superficieAzar(kx, ky, 50) * Math.PI * 2, d = HEX * 0.17 * superficieAzar(kx, ky, 51);
  return [x + Math.cos(a) * d, y + Math.sin(a) * d];
}
/* 🌊 La mancha redondeada (2026-11-05, dueño: «sigue manteniendo muchísimo la línea hexagonal… que los bordes generales de la mancha sean más
   redondeados; no importa si se salen un poco, la superficie de efecto se marca con las líneas punteadas»). En vez de ondular cada lado del hexágono,
   el contorno de afuera (con sus esquinas corridas al azar y una panza en cada lado) se vuelve a muestrear cada ~⅓ de casilla y se suaviza muchas
   veces (promedia cada punto con sus vecinos) y se devuelve un poco hacia afuera, así desaparecen los dientes del hexágono y queda una mancha de orilla
   redonda. Esa forma es fija (se guarda por charco); lo que corre es la onda, a lo largo de la orilla, con un número entero de ondas por vuelta. */
const aguaFormas = new Map();
function aguaForma(celdas){
  const clave = celdas.map(c => c.col + ',' + c.fila).sort().join(';');
  const ya = aguaFormas.get(clave);
  if(ya) return ya;
  const lazos = aguaContornos(celdas).map(lazo => {
    const crudo = [];
    lazo.forEach(l => {
      const A = aguaEsquina(l.a[0], l.a[1]), mx = (l.a[0] + l.b[0]) / 2, my = (l.a[1] + l.b[1]) / 2;
      let nx = -(l.b[1] - l.a[1]), ny = l.b[0] - l.a[0]; const n = Math.hypot(nx, ny) || 1; nx /= n; ny /= n;
      if((mx - l.c.x) * nx + (my - l.c.y) * ny < 0){ nx = -nx; ny = -ny; }
      const kx = Math.round(mx * 2), ky = Math.round(my * 2), panza = HEX * (0.05 + 0.3 * superficieAzar(kx, ky, 60));
      crudo.push(A, [mx + nx * panza, my + ny * panza]);
    });
    // Remuestreo parejo (cada ~⅓ de casilla).
    const paso = HEX * 0.33, pts = [];
    for(let k = 0; k < crudo.length; k++){
      const a = crudo[k], b = crudo[(k + 1) % crudo.length], d = Math.hypot(b[0] - a[0], b[1] - a[1]), m = Math.max(1, Math.round(d / paso));
      for(let q = 0; q < m; q++) pts.push([a[0] + (b[0] - a[0]) * q / m, a[1] + (b[1] - a[1]) * q / m]);
    }
    // Suavizado: cada punto, hacia el promedio de sus vecinos, muchas veces.
    const N = pts.length;
    const area = q => q.reduce((a, p, k) => { const b = q[(k + 1) % q.length]; return a + p[0] * b[1] - b[0] * p[1]; }, 0) / 2;
    const area0 = area(pts);
    if(N >= 6) for(let it = 0; it < 36; it++) [0.5].forEach(f => {
      const ant = pts.map(p => p.slice());
      for(let k = 0; k < N; k++){
        const a = ant[(k - 1 + N) % N], b = ant[(k + 1) % N], p = ant[k];
        pts[k] = [p[0] + f * ((a[0] + b[0]) / 2 - p[0]), p[1] + f * ((a[1] + b[1]) / 2 - p[1])];
      }
    });
    // Que no se achique: se agranda (desde su centro) hasta tener la misma superficie que antes de suavizar (un charco de una casilla, si no, quedaba chiquito).
    const area1 = area(pts);
    if(N >= 6 && area1 && area0 / area1 > 0){
      const f = Math.sqrt(area0 / area1), cx = pts.reduce((a, p) => a + p[0], 0) / N, cy = pts.reduce((a, p) => a + p[1], 0) / N;
      pts.forEach(p => { p[0] = cx + (p[0] - cx) * f; p[1] = cy + (p[1] - cy) * f; });
    }
    // La normal hacia afuera del agua: los lados de afuera se recorren siempre con el agua del mismo lado (aguaContornos), así que basta mirar uno.
    const l0 = lazo[0], tx = l0.b[0] - l0.a[0], ty = l0.b[1] - l0.a[1], m0x = (l0.a[0] + l0.b[0]) / 2 - l0.c.x, m0y = (l0.a[1] + l0.b[1]) / 2 - l0.c.y;
    const signo = (-ty * m0x + tx * m0y) >= 0 ? 1 : -1;
    const nor = pts.map((p, k) => {
      const a = pts[(k - 1 + N) % N], b = pts[(k + 1) % N]; let x = -(b[1] - a[1]) * signo, y = (b[0] - a[0]) * signo; const n = Math.hypot(x, y) || 1;
      return [x / n, y / n];
    });
    // El suavizado achica un poco las puntas: se devuelve hacia afuera (que se salga un poco no importa: lo exacto es la línea punteada).
    pts.forEach((p, k) => { p[0] += nor[k][0] * HEX * 0.1; p[1] += nor[k][1] * HEX * 0.1; });
    let largo = 0; const s = pts.map((p, k) => { const v = largo; const b = pts[(k + 1) % N]; largo += Math.hypot(b[0] - p[0], b[1] - p[1]); return v; });
    // 🌊 Ondulación amplia (2026-11-06, dueño: «de lejos se ve muy redondo… una ondulación más amplia para que no se vea tan redondo»): unos pocos
    // lóbulos grandes y fijos a lo largo de la orilla (entrantes y salientes de casi media casilla), distintos en cada charco (salen de su posición).
    const c0 = celdas[0] || {col: 0, fila: 0}, az = q => superficieAzar(c0.col, c0.fila, 70 + q);
    const k1 = Math.max(2, Math.round(largo / (HEX * 3.2))), k2 = k1 + 2 + Math.floor(az(1) * 3), f1 = az(2) * 6.28, f2 = az(3) * 6.28;
    const amp1 = Math.min(HEX * 0.3, largo * 0.025), amp2 = amp1 * 0.5;   // un charco chico ondula menos (si no, quedaba con puntas)
    pts.forEach((p, k) => {
      const u = s[k] / largo, o = amp1 * Math.sin(Math.PI * 2 * k1 * u + f1) + amp2 * Math.sin(Math.PI * 2 * k2 * u + f2);
      p[0] += nor[k][0] * o; p[1] += nor[k][1] * o;
    });
    // (las normales, de nuevo, sobre la orilla ondulada)
    pts.forEach((p, k) => {
      const a = pts[(k - 1 + N) % N], b = pts[(k + 1) % N]; let x = -(b[1] - a[1]) * signo, y = (b[0] - a[0]) * signo; const n = Math.hypot(x, y) || 1;
      nor[k] = [x / n, y / n];
    });
    return {pts, nor, s, largo, ondas: Math.max(3, Math.round(largo / (HEX * 1.3)))};
  });
  if(aguaFormas.size > 60) aguaFormas.clear();
  const forma = {lazos};
  aguaFormas.set(clave, forma);
  return forma;
}
// La orilla (o una onda de adentro, corrida `adentro` hacia el agua), con la onda que corre en fase `fase`.
function aguaTrazar(forma, amp, adentro, fase){
  ctx.beginPath();
  forma.lazos.forEach(L => {
    const N = L.pts.length;
    for(let k = 0; k <= N; k++){
      const i = k % N, p = L.pts[i], n = L.nor[i], u = L.s[i] / L.largo;
      const off = amp * Math.sin(Math.PI * 2 * L.ondas * u - fase) + amp * 0.45 * Math.sin(Math.PI * 2 * (L.ondas + 2) * u + fase * 0.7) - adentro;
      const x = p[0] + n[0] * off, y = p[1] + n[1] * off;
      if(!k) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
  });
}
function aguaDibujar(celdas, z){
  const lazos = aguaForma(celdas), t = performance.now() / 1000, amp = HEX * 0.06;
  aguaTrazar(lazos, amp, 0, t * 1.6);
  ctx.fillStyle = 'rgba(52,118,178,.58)'; ctx.fill();
  ctx.save();
  ctx.clip();
  // Brillos sueltos que se mecen.
  celdas.forEach(c => {
    if(superficieAzar(c.col, c.fila, 40) < 0.45) return;
    const p = hexCentro(c.col, c.fila), dx = (superficieAzar(c.col, c.fila, 41) - 0.5) * HEX * 0.8, dy = (superficieAzar(c.col, c.fila, 42) - 0.5) * HEX * 0.8;
    const a = 0.08 + 0.08 * Math.sin(t * 1.3 + superficieAzar(c.col, c.fila, 43) * 6.28);
    ctx.fillStyle = `rgba(200,232,252,${a.toFixed(3)})`;
    ctx.beginPath(); ctx.ellipse(p.x + dx + Math.sin(t * 0.7 + dy) * HEX * 0.05, p.y + dy, HEX * 0.32, HEX * 0.09, -0.35, 0, Math.PI * 2); ctx.fill();
  });
  // Las ondas de adentro, más tenues, con otra fase.
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  aguaTrazar(lazos, amp * 0.8, HEX * 0.16, t * 1.6 + 1.9);
  ctx.lineWidth = 1.4 / z; ctx.strokeStyle = 'rgba(190,228,252,.32)'; ctx.stroke();
  aguaTrazar(lazos, amp * 0.6, HEX * 0.3, t * 1.6 + 3.8);
  ctx.lineWidth = 1.1 / z; ctx.strokeStyle = 'rgba(190,228,252,.16)'; ctx.stroke();
  ctx.restore();
  // La orilla: una línea clara que brilla de a ratos.
  aguaTrazar(lazos, amp, 0, t * 1.6);
  ctx.lineJoin = 'round'; ctx.lineWidth = 2 / z;
  ctx.strokeStyle = `rgba(175,220,250,${(0.5 + 0.18 * Math.sin(t * 2.1)).toFixed(3)})`; ctx.stroke();
  bordeHexPunteado(celdas, z, 'rgba(190,228,255,.5)');   // qué casillas están mojadas, exactas (2026-11-05)
}
/* 💧 Pasos en el agua (2026-11-05, dueño: «al caminar por un charco, cada paso deja ondas que se abren y se apagan detrás del token»). Solo dibujo, en
   cada pantalla: el listener de los tokens (js/09) avisa cuando otro token cambia de casilla (con su ruta, o de la casilla de antes a la nueva) y
   moverToken/moverTokenLibre (js/07) cuando se mueve el propio. Por cada casilla del camino que es agua (y si el token la toca: levitando o volando
   no), unos anillos que se abren desde el centro, uno detrás del otro al ritmo del paso. No se guarda nada en Firebase. */
const aguaOndas = [];          // {id, x, y, t0}
const aguaOndasVistas = new Map();   // id → 'ruta' recién dibujada (la propia vuelve del listener: no repetirla)
const AGUA_ONDA_MS = 1700, AGUA_PASO_MS = 170;
function aguaPasos(id, celdas){
  const t = tokens.get(id);
  if(!t || !celdas || !celdas.length || t.bajoTierra) return;
  const clave = celdas.map(c => c.col + ',' + c.fila).join(';'), ya = aguaOndasVistas.get(id);
  if(ya && ya.clave === clave && Date.now() - ya.ms < 4000) return;
  aguaOndasVistas.set(id, {clave, ms: Date.now()});
  const ahora = performance.now();
  celdas.forEach((c, i) => {
    if(!enAgua({...t, col: c.col, fila: c.fila})) return;
    const p = hexCentro(c.col, c.fila);
    aguaOndas.push({id, x: p.x, y: p.y, t0: ahora + i * AGUA_PASO_MS});
  });
  if(aguaOndas.length > 80) aguaOndas.splice(0, aguaOndas.length - 80);
  pedirDibujo();
}
// → true mientras quede alguna onda por dibujar (js/05, debajo de los tokens).
function aguaOndasDibujar(z){
  if(!aguaOndas.length) return false;
  const ahora = performance.now();
  for(let i = aguaOndas.length - 1; i >= 0; i--) if(ahora - aguaOndas[i].t0 > AGUA_ONDA_MS + 600) aguaOndas.splice(i, 1);
  ctx.save();
  for(const o of aguaOndas){
    const t = tokens.get(o.id);
    if(t && ((t.oculto && !soyGM) || (typeof tokenVisiblePorNiebla === 'function' && !tokenVisiblePorNiebla(t)))) continue;
    for(let k = 0; k < 3; k++){
      const p = (ahora - o.t0 - k * 260) / AGUA_ONDA_MS;
      if(p < 0 || p > 1) continue;
      const r = HEX * (0.18 + 0.8 * p), a = (1 - p) * (0.75 - k * 0.18);
      ctx.beginPath(); ctx.ellipse(o.x, o.y, r, r * 0.82, 0, 0, Math.PI * 2);
      ctx.lineWidth = (2.2 - k * 0.5) * (1 - p * 0.5) / z; ctx.strokeStyle = `rgba(205,236,255,${a.toFixed(3)})`; ctx.stroke();
    }
  }
  ctx.restore();
  return true;
}
/* 🔥 Lo que arde (dueño, 2026-10-17: «para superficies incendiadas, buscate algún tipo de textura»): el terreno incendiado y las zonas de fuego.
   Una mancha de brasas (rojo oscuro, borde desparejo y un poco borroso), encima un resplandor naranja-amarillo por casilla que titila, y
   chispas que suben y se apagan. Todo dibujado (sin imágenes). */
/* La línea punteada sobre el borde EXACTO de las casillas del efecto (2026-10-24, dueño: «la línea punteada me gusta, pero que delimite claramente los
   hexágonos donde el efecto sucede; me gusta que las rayitas se desplacen; está bueno el efecto orgánico por fuera de la grilla, pero que esté la línea de
   puntos que aclare cualquier ambigüedad»): cada lado de una casilla que no toca otra del grupo, con las rayitas corriendo; debajo, una sombra para que se
   lea sobre cualquier fondo. La usan el fuego (abajo) y las zonas y auras de curación (js/70). */
function bordeHexPunteado(celdas, z, color){
  if(!celdas || !celdas.length) return;
  const set = new Set(celdas.map(c => c.col + ',' + c.fila)), t = performance.now() / 1000;
  ctx.save();
  ctx.beginPath();
  celdas.forEach(c => {
    const cubo = hexACubo(c), h = hexCentro(c.col, c.fila);
    VECINO_LADO.forEach(([vq, vr], i) => {
      const nq = cubo.q + vq, nr = cubo.r + vr;
      if(set.has(cuboACol(nq, nr) + ',' + cuboAFila(nq, nr))) return;
      const a = ESQUINAS[i], b = ESQUINAS[(i + 1) % 6];
      ctx.moveTo(h.x + a[0], h.y + a[1]);
      ctx.lineTo(h.x + b[0], h.y + b[1]);
    });
  });
  ctx.lineCap = 'round';
  ctx.setLineDash([7 / z, 6 / z]); ctx.lineDashOffset = -t * 14 / z;
  ctx.strokeStyle = 'rgba(0,0,0,.22)'; ctx.lineWidth = 3 / z; ctx.stroke();
  ctx.strokeStyle = color; ctx.lineWidth = 1.4 / z; ctx.stroke();
  ctx.restore();
}
// ⚡ El manchón borroso del fuego (2026-11-06, rendimiento): el desenfoque se hace UNA vez por forma y zoom, en un lienzo aparte, y después se pega
// en cada cuadro (antes se desenfocaba en cada cuadro). Hasta 40 formas guardadas.
const fuegoManchones = new Map();
function fuegoManchon(celdas, z){
  const esc = z * (typeof dpr === 'number' ? dpr : 1), zq = Math.round(esc * 8) / 8;
  const clave = celdas.map(c => c.col + ',' + c.fila).join(';') + '|' + zq;
  let m = fuegoManchones.get(clave);
  if(m) return m;
  const cs = celdas.map(c => hexCentro(c.col, c.fila)), mx = HEX * 1.6;
  const x0 = Math.min(...cs.map(p => p.x)) - mx, y0 = Math.min(...cs.map(p => p.y)) - mx, x1 = Math.max(...cs.map(p => p.x)) + mx, y1 = Math.max(...cs.map(p => p.y)) + mx;
  const w = Math.max(1, Math.ceil((x1 - x0) * zq)), h = Math.max(1, Math.ceil((y1 - y0) * zq));
  if(w * h > 4e6) return null;   // (una forma enorme: se dibuja como antes)
  const lz = document.createElement('canvas'); lz.width = w; lz.height = h;
  const g = lz.getContext('2d');
  g.setTransform(zq, 0, 0, zq, -x0 * zq, -y0 * zq);
  g.filter = `blur(${Math.max(1, HEX * 0.08 * zq).toFixed(1)}px)`;
  const set = new Set(celdas.map(c => c.col + ',' + c.fila)), o = {radio: [0.42, 0.22], sale: [-0.04, 0.2]};
  g.beginPath();
  celdas.forEach(c => { const p = hexCentro(c.col, c.fila); g.moveTo(p.x + ESQUINAS[0][0], p.y + ESQUINAS[0][1]); for(let i = 1; i < 6; i++) g.lineTo(p.x + ESQUINAS[i][0], p.y + ESQUINAS[i][1]); g.closePath(); });
  celdas.forEach(c => {   // (las mismas panzas que trazarManchon)
    const p = hexCentro(c.col, c.fila);
    for(let i = 0; i < 6; i++){
      const [ax, ay] = ESQUINAS[i], [bx, by] = ESQUINAS[(i + 1) % 6], mx2 = (ax + bx) / 2, my2 = (ay + by) / 2;
      const v = mundoAHex(p.x + mx2 * 2, p.y + my2 * 2);
      if(v && set.has(v.col + ',' + v.fila)) continue;
      const u = superficieAzar(c.col, c.fila, 20 + i), ww = superficieAzar(c.col, c.fila, 30 + i);
      const sale = HEX * (o.sale[0] + o.sale[1] * ww), r = HEX * (o.radio[0] + o.radio[1] * u), d = Math.hypot(mx2, my2);
      const cx = p.x + mx2 + mx2 / d * sale, cy = p.y + my2 + my2 / d * sale;
      g.moveTo(cx + r, cy); g.arc(cx, cy, r, 0, Math.PI * 2);
    }
  });
  g.fillStyle = 'rgba(120,28,8,.55)'; g.fill();
  m = {lz, x0, y0, w: (x1 - x0), h: (y1 - y0)};
  if(fuegoManchones.size > 40) fuegoManchones.clear();
  fuegoManchones.set(clave, m);
  return m;
}
function fuegoDibujar(celdas, z){
  const s = performance.now() / 1000, lista = celdas.slice(0, 120);
  ctx.save();
  const man = celdas.length <= 400 ? fuegoManchon(celdas, z) : null;
  if(man) ctx.drawImage(man.lz, man.x0, man.y0, man.w, man.h);
  else{
    ctx.filter = `blur(${Math.max(1, HEX * 0.08 * z * (typeof dpr === 'number' ? dpr : 1)).toFixed(1)}px)`;
    trazarManchon(celdas, {radio: [0.42, 0.22], sale: [-0.04, 0.2]});
    ctx.fillStyle = 'rgba(120,28,8,.55)'; ctx.fill();
    ctx.filter = 'none';
  }
  ctx.globalCompositeOperation = 'lighter';
  lista.forEach(c => {
    const p = hexCentro(c.col, c.fila);
    for(let k = 0; k < 2; k++){   // dos focos por casilla, corridos y cada uno con su ritmo
      const a = superficieAzar(c.col, c.fila, 50 + k), b = superficieAzar(c.col, c.fila, 60 + k);
      const f = (Math.sin(s * (3 + 2 * a) + b * 6.28) + Math.sin(s * (5.3 + a) + a * 9)) / 4 + 0.5;   // 0–1, desparejo
      const x = p.x + (a - 0.5) * HEX * 0.7, y = p.y + (b - 0.5) * HEX * 0.6, r = HEX * (0.42 + 0.18 * f);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(255,220,110,${(0.32 + 0.25 * f).toFixed(2)})`);
      g.addColorStop(0.45, `rgba(255,120,30,${(0.22 + 0.15 * f).toFixed(2)})`);
      g.addColorStop(1, 'rgba(200,40,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    // Chispas: suben, se corren un poco y se apagan.
    for(let k = 0; k < 3; k++){
      const a = superficieAzar(c.col, c.fila, 70 + k), b = superficieAzar(c.col, c.fila, 80 + k);
      const v = ((s * (0.35 + 0.3 * a)) + b) % 1;
      const x = p.x + (a - 0.5) * HEX * 0.9 + Math.sin(s * 2 + a * 10) * HEX * 0.08, y = p.y + HEX * 0.35 - v * HEX * 1.1;
      ctx.fillStyle = `rgba(255,${Math.round(170 + 60 * (1 - v))},80,${(0.85 * (1 - v)).toFixed(2)})`;
      ctx.beginPath(); ctx.arc(x, y, Math.max(1.2 / z, HEX * 0.045 * (1 - v * 0.5)), 0, Math.PI * 2); ctx.fill();
    }
  });
  ctx.restore();
  bordeHexPunteado(celdas, z, 'rgba(255,200,120,.42)');   // dónde quema exactamente (2026-10-24)
}
/* 🌋 La lava (2026-11-09, dueño: «con bordes no difuminados, sino como si fuera una mancha de lava con detalles de fuego, pero que los bordes sean
   como si fuera un líquido aplastado, espeso»). Las zonas de fuego que se llaman «lava» (la Varita del chorro de lava) ya no son el manchón borroso
   del fuego: son una mancha espesa con la misma forma de lóbulos redondos del charco (aguaForma), borde NÍTIDO. Por capas: una costra oscura afuera,
   la lava derretida adentro (naranja, con centros amarillos), placas que se enfrían (más oscuras, con grietas que brillan) y un brillo de borde.
   Desde el 2026-11-09 (segunda vuelta del dueño): costra casi negra en toda la mancha, el rojo solo lejos de los bordes (la forma desenfocada como
   máscara) y grietas finas que se ramifican con el rojo de atrás; las grietas van en su propia capa y laten en cada cuadro.
   Esa parte es fija: se pinta UNA vez por forma y zoom en un lienzo aparte (como el manchón del fuego). En cada cuadro solo se suma lo que se
   mueve: un pulso lento del brillo, burbujas que se inflan y revientan, llamitas que titilan y chispas que suben. */
function esLava(el){ return !!(el && el.zona && /lava/i.test(String(el.zonaNombre || '')) && esFuego(el)); }
// La orilla de la forma (o una línea corrida `adentro` hacia la lava), en el contexto `g`, sin onda (la lava es espesa: no ondula).
function lavaTrazar(g, forma, adentro){
  g.beginPath();
  forma.lazos.forEach(L => {
    const N = L.pts.length;
    for(let k = 0; k <= N; k++){
      const i = k % N, p = L.pts[i], n = L.nor[i], x = p[0] - n[0] * adentro, y = p[1] - n[1] * adentro;
      if(!k) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.closePath();
  });
}
const lavaCapas = new Map();
function lavaCapa(celdas, forma, z){
  const esc = z * (typeof dpr === 'number' ? dpr : 1), zq = Math.round(esc * 8) / 8;
  const clave = celdas.map(c => c.col + ',' + c.fila).sort().join(';') + '|' + zq;
  let m = lavaCapas.get(clave);
  if(m) return m;
  const todos = forma.lazos.flatMap(L => L.pts), mx = HEX * 0.3;
  const x0 = Math.min(...todos.map(p => p[0])) - mx, y0 = Math.min(...todos.map(p => p[1])) - mx;
  const x1 = Math.max(...todos.map(p => p[0])) + mx, y1 = Math.max(...todos.map(p => p[1])) + mx;
  const w = Math.max(1, Math.ceil((x1 - x0) * zq)), h = Math.max(1, Math.ceil((y1 - y0) * zq));
  if(w * h > 6e6) return null;
  const lz = document.createElement('canvas'); lz.width = w; lz.height = h;
  const g = lz.getContext('2d');
  g.setTransform(zq, 0, 0, zq, -x0 * zq, -y0 * zq);
  g.lineJoin = 'round'; g.lineCap = 'round';
  // (2026-11-09, dueño: «más sobre los bordes, un tono más oscuro, como más bien negro, y hacia el centro, lejos de los bordes, se va poniendo
  // rojo, y las partes negras que tengan líneas como de grietas, donde se ve detrás el brillo rojo»)
  // 1. Toda la mancha, costra casi negra, con un filo negro nítido.
  lavaTrazar(g, forma, 0);
  g.fillStyle = '#140705'; g.fill();
  g.lineWidth = HEX * 0.035; g.strokeStyle = '#050101'; g.stroke();
  // 2. Las grietas: líneas finas que se ramifican por toda la mancha, con el rojo que se ve detrás (un halo y un hilo).
  //    Van en una capa aparte (`gr`), que además se vuelve a pintar latiendo en cada cuadro.
  const gc = document.createElement('canvas'); gc.width = w; gc.height = h;
  const gg = gc.getContext('2d');
  gg.setTransform(zq, 0, 0, zq, -x0 * zq, -y0 * zq);
  gg.lineJoin = 'round'; gg.lineCap = 'round';
  gg.save(); lavaTrazar(gg, forma, HEX * 0.04); gg.clip();
  const rama = (x, y, ang, largo, prof, sem) => {
    const tramos = 3 + Math.floor(superficieAzar(sem, prof, 1) * 3), pasoL = largo / tramos;
    gg.moveTo(x, y);
    for(let t = 0; t < tramos; t++){
      ang += (superficieAzar(sem, t, 2 + prof) - 0.5) * 1.1;
      x += Math.cos(ang) * pasoL; y += Math.sin(ang) * pasoL;
      gg.lineTo(x, y);
      if(prof < 2 && superficieAzar(sem, t, 7 + prof) < 0.45){
        const sub = (superficieAzar(sem, t, 9 + prof) < 0.5 ? -1 : 1) * (0.6 + 0.6 * superficieAzar(sem, t, 11));
        rama(x, y, ang + sub, largo * 0.55, prof + 1, sem * 7 + t + 3);
        gg.moveTo(x, y);
      }
    }
  };
  gg.beginPath();
  celdas.forEach(c => {
    const p = hexCentro(c.col, c.fila);
    for(let k = 0; k < 3; k++){
      const a = superficieAzar(c.col, c.fila, 300 + k), b = superficieAzar(c.col, c.fila, 310 + k);
      rama(p.x + (a - 0.5) * HEX * 1.2, p.y + (b - 0.5) * HEX * 1.1, a * Math.PI * 2, HEX * (0.55 + 0.35 * b), 0, c.col * 31 + c.fila * 17 + k);
    }
  });
  // y más grietas en la costra negra, cerca del borde, corriendo más o menos a lo largo de la orilla
  forma.lazos.forEach((L, li) => {
    const N = L.pts.length, cada = Math.max(4, Math.round(N / Math.max(6, celdas.length * 4)));
    for(let i = 0; i < N; i += cada){
      const pt = L.pts[i], n = L.nor[i], az = superficieAzar(li, i, 400), hacia = az < 0.5 ? 1 : -1;
      const x = pt[0] - n[0] * HEX * (0.1 + 0.12 * az), y = pt[1] - n[1] * HEX * (0.1 + 0.12 * az);
      const ang = Math.atan2(n[0], -n[1]) * hacia + (superficieAzar(li, i, 401) - 0.5) * 0.9;
      rama(x, y, ang, HEX * (0.3 + 0.25 * superficieAzar(li, i, 402)), 1, li * 97 + i);
    }
  });
  gg.lineWidth = HEX * 0.06; gg.strokeStyle = 'rgba(190,28,8,.35)'; gg.stroke();
  gg.lineWidth = HEX * 0.022; gg.strokeStyle = 'rgba(255,70,24,.95)'; gg.stroke();
  gg.lineWidth = HEX * 0.008; gg.strokeStyle = 'rgba(255,170,90,.8)'; gg.stroke();
  gg.restore();
  g.drawImage(gc, 0, 0, w, h, x0, y0, w / zq, h / zq);
  // 3. El rojo derretido: lejos de los bordes. Una capa roja con su forma, recortada con la misma forma desenfocada dos veces
  //    (así queda casi nada pegado al borde y lleno en el medio); el borde de la mancha sigue nítido porque va adentro de ella.
  const rc = document.createElement('canvas'); rc.width = w; rc.height = h;
  const rg = rc.getContext('2d');
  rg.setTransform(zq, 0, 0, zq, -x0 * zq, -y0 * zq);
  lavaTrazar(rg, forma, 0);
  rg.fillStyle = '#8e1408'; rg.fill();
  celdas.forEach(c => {   // un poco más vivo y algún punto caliente chico, por casilla
    const p = hexCentro(c.col, c.fila), a = superficieAzar(c.col, c.fila, 91), b = superficieAzar(c.col, c.fila, 92);
    const x = p.x + (a - 0.5) * HEX * 0.4, y = p.y + (b - 0.5) * HEX * 0.4, r = HEX * (0.55 + 0.25 * a);
    const gr = rg.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, 'rgba(240,60,18,.9)'); gr.addColorStop(1, 'rgba(200,30,10,0)');
    rg.fillStyle = gr; rg.beginPath(); rg.arc(x, y, r, 0, Math.PI * 2); rg.fill();
    if(a > 0.45){
      const rr = HEX * (0.07 + 0.06 * b), hx = x + (b - 0.5) * HEX * 0.3, hy = y + (a - 0.5) * HEX * 0.3;
      const gh = rg.createRadialGradient(hx, hy, 0, hx, hy, rr);
      gh.addColorStop(0, 'rgba(255,190,80,.95)'); gh.addColorStop(1, 'rgba(255,90,20,0)');
      rg.fillStyle = gh; rg.beginPath(); rg.arc(hx, hy, rr, 0, Math.PI * 2); rg.fill();
    }
  });
  const mc = document.createElement('canvas'); mc.width = w; mc.height = h;
  const mg = mc.getContext('2d');
  mg.filter = `blur(${Math.max(2, HEX * 0.28 * zq).toFixed(1)}px)`;
  const sc = document.createElement('canvas'); sc.width = w; sc.height = h;
  const sg = sc.getContext('2d'); sg.setTransform(zq, 0, 0, zq, -x0 * zq, -y0 * zq);
  lavaTrazar(sg, forma, HEX * 0.3); sg.fillStyle = '#fff'; sg.fill();
  mg.drawImage(sc, 0, 0);
  rg.setTransform(1, 0, 0, 1, 0, 0);
  rg.globalCompositeOperation = 'destination-in'; rg.drawImage(mc, 0, 0); rg.drawImage(mc, 0, 0); rg.drawImage(mc, 0, 0);
  g.drawImage(rc, 0, 0, w, h, x0, y0, w / zq, h / zq);
  // las grietas también se ven sobre el rojo, más suaves
  g.save(); g.globalAlpha = 0.3; g.drawImage(gc, 0, 0, w, h, x0, y0, w / zq, h / zq); g.restore();
  // 4. Un filo rojo oscuro, finito, apenas adentro del borde negro.
  lavaTrazar(g, forma, HEX * 0.05);
  g.lineWidth = HEX * 0.012; g.strokeStyle = 'rgba(120,20,8,.55)'; g.stroke();
  m = {lz, grietas: gc, x0, y0, w: x1 - x0, h: y1 - y0};
  if(lavaCapas.size > 40) lavaCapas.clear();
  lavaCapas.set(clave, m);
  return m;
}
function lavaDibujar(celdas, z){
  const forma = aguaForma(celdas), s = performance.now() / 1000, lista = celdas.slice(0, 120);
  const capa = celdas.length <= 400 ? lavaCapa(celdas, forma, z) : null;
  ctx.save();
  if(capa){
    ctx.drawImage(capa.lz, capa.x0, capa.y0, capa.w, capa.h);
    // las grietas laten: el rojo de atrás sube y baja despacio
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.18 + 0.16 * (0.5 + 0.5 * Math.sin(s * 1.1));
    ctx.drawImage(capa.grietas, capa.x0, capa.y0, capa.w, capa.h); ctx.restore();
  }
  else{ lavaTrazar(ctx, forma, 0); ctx.fillStyle = '#5a0e06'; ctx.fill(); }
  // Lo que se mueve, adentro de la lava.
  ctx.save();
  lavaTrazar(ctx, forma, HEX * 0.09); ctx.clip();
  ctx.globalCompositeOperation = 'lighter';
  const pulso = 0.04 + 0.035 * Math.sin(s * 1.4);   // el brillo que late, lento (rojo)
  ctx.fillStyle = `rgba(220,40,12,${pulso.toFixed(3)})`; ctx.fill();
  lista.forEach(c => {
    const p = hexCentro(c.col, c.fila);
    // Una burbuja por casilla: se infla y revienta, cada una a su ritmo.
    const a = superficieAzar(c.col, c.fila, 130), b = superficieAzar(c.col, c.fila, 131), per = 2.2 + 1.6 * a;
    const v = ((s + b * per) % per) / per;
    if(v < 0.75){
      const x = p.x + (a - 0.5) * HEX * 0.8, y = p.y + (b - 0.5) * HEX * 0.7, r = HEX * 0.11 * (v / 0.75);
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(230,60,20,.32)'; ctx.fill();
      ctx.lineWidth = Math.max(1 / z, HEX * 0.012); ctx.strokeStyle = 'rgba(255,140,70,.5)'; ctx.stroke();
    }
  });
  ctx.restore();
  // Llamitas que titilan y chispas que suben (por encima del borde, sin desenfoque).
  ctx.globalCompositeOperation = 'lighter';
  lista.forEach(c => {
    const p = hexCentro(c.col, c.fila);
    for(let k = 0; k < 2; k++){
      const a = superficieAzar(c.col, c.fila, 140 + k), b = superficieAzar(c.col, c.fila, 150 + k);
      const f = 0.55 + 0.45 * Math.sin(s * (6 + 3 * a) + b * 9) * Math.sin(s * (3.7 + a) + a * 5);
      const x = p.x + (a - 0.5) * HEX * 0.9, y = p.y + (b - 0.5) * HEX * 0.7, alto = HEX * (0.22 + 0.16 * f), ancho = HEX * 0.07;
      ctx.beginPath();
      ctx.moveTo(x - ancho, y);
      ctx.quadraticCurveTo(x - ancho * 0.9, y - alto * 0.55, x + Math.sin(s * 5 + a * 7) * ancho * 0.6, y - alto);
      ctx.quadraticCurveTo(x + ancho * 0.9, y - alto * 0.55, x + ancho, y);
      ctx.closePath();
      ctx.fillStyle = `rgba(255,${Math.round(80 + 70 * f)},30,${(0.35 + 0.3 * f).toFixed(2)})`; ctx.fill();
    }
    for(let k = 0; k < 2; k++){
      const a = superficieAzar(c.col, c.fila, 160 + k), b = superficieAzar(c.col, c.fila, 170 + k), v = ((s * (0.3 + 0.25 * a)) + b) % 1;
      const x = p.x + (a - 0.5) * HEX * 0.9 + Math.sin(s * 2 + a * 10) * HEX * 0.08, y = p.y + HEX * 0.2 - v * HEX * 1.1;
      ctx.fillStyle = `rgba(255,${Math.round(110 + 70 * (1 - v))},50,${(0.85 * (1 - v)).toFixed(2)})`;
      ctx.beginPath(); ctx.arc(x, y, Math.max(1.2 / z, HEX * 0.035 * (1 - v * 0.5)), 0, Math.PI * 2); ctx.fill();
    }
  });
  ctx.restore();
  bordeHexPunteado(celdas, z, 'rgba(255,200,120,.42)');   // dónde quema exactamente
}
// La mancha: las casillas enteras más una «panza» redonda en cada lado de afuera (tamaño y salida al azar, fijos por casilla).
function trazarManchon(celdas, o){
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
      const sale = HEX * (o.sale[0] + o.sale[1] * w), r = HEX * (o.radio[0] + o.radio[1] * u), d = Math.hypot(mx, my);
      const cx = p.x + mx + mx / d * sale, cy = p.y + my + my / d * sale;
      ctx.moveTo(cx + r, cy); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    }
  });
}
const NUBE_TOXICA = 'rgba(92,170,60,.42)', NUBE_VIOLETA = 'rgba(150,95,200,.4)', NUBE_GRIS = 'rgba(200,205,216,.62)', NUBE_HUMO = 'rgba(58,58,64,.62)', NUBE_TALCO = 'rgba(248,246,240,.6)';
// Los colores (dueño, 2026-10-19): verde lo que es VENENO (deja Veneno, o se llama así: esporas, ponzoña); violeta lo tóxico en general (el daño
// tóxico, miasma, pedos) y los demás gases; gris oscuro el HUMO; gris claro la niebla.
function nubeColor(el){
  if(!el || !el.zona || superficieDe(el)) return '';
  const nombre = String(el.zonaNombre || ''), tipo = String(el.zonaDanoTipo || '');
  let est = ''; try{ est = (JSON.parse(el.zonaEstado || '{}') || {}).nombre || ''; }catch(err){}
  if(/veneno/i.test(est) || /veneno|espora|ponzo/i.test(nombre)) return NUBE_TOXICA;
  if(/humo/i.test(nombre)) return NUBE_HUMO;
  if(/talco|harina/i.test(nombre)) return NUBE_TALCO;   // (2026-10-19) la Bombucha de talco: una nube blanca
  if(/t[oó]xic/i.test(tipo) || /miasma|pedo|t[oó]xic/i.test(nombre)) return NUBE_VIOLETA;
  if(/fuego/i.test(tipo)) return '';
  if(/niebla|neblina|bruma/i.test(nombre)) return NUBE_GRIS;
  return /gas|nube|vapor/i.test(nombre) ? NUBE_VIOLETA : '';
}
// El dibujo de una nube: la mancha más grande y desordenada que el charco, con el borde borroso.
function nubeDibujar(celdas, color, z){
  ctx.save();
  ctx.filter = `blur(${Math.max(1.5, HEX * 0.16 * z * (typeof dpr === 'number' ? dpr : 1)).toFixed(1)}px)`;
  trazarManchon(celdas, {radio: [0.5, 0.35], sale: [0, 0.35]});
  ctx.fillStyle = color; ctx.fill();
  ctx.restore();
  // Una línea punteada tenue con el borde exacto de las casillas (dueño, 2026-10-26): la mancha se puede salir un poco sin que quede en duda
  // qué casillas toca.
  ctx.save();
  ctx.beginPath();
  const set = new Set(celdas.map(c => c.col + ',' + c.fila));
  celdas.forEach(c => {
    const k = hexACubo(c), h = hexCentro(c.col, c.fila);
    VECINO_LADO.forEach(([vq, vr], i) => {
      if(set.has(cuboACol(k.q + vq, k.r + vr) + ',' + cuboAFila(k.q + vq, k.r + vr))) return;
      const a = ESQUINAS[i], b = ESQUINAS[(i + 1) % 6];
      ctx.moveTo(h.x + a[0], h.y + a[1]); ctx.lineTo(h.x + b[0], h.y + b[1]);
    });
  });
  ctx.setLineDash([6 / z, 5 / z]);
  ctx.strokeStyle = String(color).replace(/[\d.]+\)\s*$/, '.5)'); ctx.lineWidth = 1.5 / z; ctx.stroke();
  ctx.restore();
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
// El daño de rayo a quien está en el agua: ×1,5, para arriba. → {monto, txt}
function aguaRayo(t, elemento, monto){
  const m = Math.max(0, Math.round(num(monto)));
  if(elemento !== 'rayo' || !m || !enAgua(t)) return {monto: m, txt: ''};
  const x = Math.ceil(m * AGUA_MULT_RAYO);
  return {monto: x, txt: `💧 en el agua: ${m} × 1,5 = ${x}`};
}
/* 🔥 El fuego seca el charco (dueño, 2026-10-17). Lo revisa el GM: las casillas de agua que quedan bajo un terreno incendiado o una zona de fuego
   se van (el charco se rehace con las que quedan; si no queda ninguna, se borra). */
const aguaSecando = new Set();
function esFuego(el){
  if(!el) return false;
  if(el.fuego || (el.zona && /fuego/i.test(String(el.zonaDanoTipo || '')))) return true;
  if(el.zona && el.trampa){ try{ return (JSON.parse(el.trampaEstado || '{}') || {}).elemento === 'fuego'; }catch(err){} }   // la zona que deja una trampa de fuego (la Mina napalm)
  return false;
}
async function aguaRevisarFuego(){
  if(!soyGM || !elementos || !elementos.size) return;
  const fuego = new Set();
  elementos.forEach(el => { if(esFuego(el)) celdasDeElemento(el).forEach(c => fuego.add(c.col + ',' + c.fila)); });
  if(!fuego.size) return;
  for(const [id, el] of [...elementos.entries()]){
    if(!esAgua(el) || aguaSecando.has(id)) continue;
    const cs = celdasDeElemento(el), quedan = cs.filter(c => !fuego.has(c.col + ',' + c.fila));
    if(quedan.length === cs.length) continue;
    aguaSecando.add(id);
    try{
      if(quedan.length){
        const c0 = quedan[0], k0 = hexACubo(c0);
        await coleccionElementos().add({...elementoComoDatos(el), origen: {col: c0.col, fila: c0.fila}, rotacion: 0,
          celdas: quedan.flatMap(c => { const k = hexACubo(c); return [k.q - k0.q, k.r - k0.r]; }), creado: firebase.firestore.FieldValue.serverTimestamp()});
      }
      await borrarElemento(id);
      momentoAbrir({tipo: 'zona-renueva', icono: '🔥', titulo: 'El fuego seca el agua', estado: 'listo',
        resultado: quedan.length ? 'Se evaporó la parte del charco que quedó bajo el fuego.' : 'Se evaporó el charco.', datos: {}});
    }catch(err){ console.error('No se pudo secar el charco:', err); }
    finally{ setTimeout(() => aguaSecando.delete(id), 4000); }
  }
}
// Los campos de un charco para rehacerlo (los mismos que pone superficieAlIrse).
function elementoComoDatos(el){
  return {tipo: 'libre', color: el.color || '#3476B2', alfa: Number.isFinite(el.alfa) ? el.alfa : 48, solido: false, invisible: false, imagen: '',
    imgZoom: 1, imgDX: 0, imgDY: 0, fijado: true, zona: true, zonaNombre: el.zonaNombre || 'Charco de agua',
    zonaCasteadorRef: String(el.zonaCasteadorRef || '').slice(0, 64), zonaCasteadorTipo: el.zonaCasteadorTipo === 'creep' ? 'creep' : 'pj',
    zonaResueltos: [], zonaEnMantenimiento: false, zonaCadaPaso: false, zonaAltura: 'piso', zonaEstado: el.zonaEstado, duenoUid: fbUsuario.uid};
}
setInterval(() => { aguaRevisarFuego().catch(err => console.error(err)); }, 1500);
/* ⚡💧 El rayo corre por el agua (dueño, 2026-10-17: «si hay dos personajes parados en el mismo charco y a uno le pega un efecto eléctrico, el
   mismo golpe se transmite por el agua al otro personaje, independientemente de si salta o no el Relámpago»). Lo llama el duelo (js/13) en la
   pantalla que aplica el daño (el GM): a cada uno de los otros que están en ese charco (sin levitar ni volar) le llega el mismo golpe —×1,5
   por estar en el agua, menos su Res. eléctrica— y, si el golpe trae Parálisis, la tira con el doble de chance. A la Crónica y a la Mesa. */
// Las casillas del charco (o charcos) donde está parado `t`: "col,fila". Lo usa el salto del rayo (js/10, rayoCadena).
function charcoCeldas(t){
  const out = new Set();
  if(!t) return out;
  for(const el of elementos.values()){
    if(!esAgua(el)) continue;
    const cs = celdasDeElemento(el);
    if(cs.some(c => c.col === t.col && c.fila === t.fila)) cs.forEach(c => out.add(c.col + ',' + c.fila));
  }
  return out;
}
/* ⚡💧 El rayo corre por el agua (dueño, 2026-10-17; regla nueva 2026-10-20, P214): un golpe eléctrico que no salta, contra alguien parado en un
   charco, igual salta por los del charco: cada uno, la mitad de lo que le entró al anterior × 1,5 (decrece), sin repetir. Un golpe que ya salta
   (Relámpago, varita de chispa, flecha de tormenta) no pasa por acá: su cadena ya recorre el charco. `entro`: lo que le entró al golpeado.
   La Parálisis del golpe, a cada mojado con el doble de chance. */
async function aguaConduceRayo(d, t, entro){
  const tid = d && d.defensor ? d.defensor.tokenId : '';
  if(!t || !tid || !enAgua(t) || num(entro) <= 1) return [];
  const cadena = rayoCadena(tid, num(entro), 0, {soloAgua: true});
  if(cadena.length < 2) return [];
  const hubo = await rayoCadenaAplicar(cadena, {callado: true});
  if(!hubo.length) return [];
  const lineas = [];
  for(const s of hubo){
    const nombre = s.t.oculto ? 'Alguien' : nombreDe(s.t);
    let txt = `${nombre}: ${s.dano}${s.entro !== s.dano ? ` → ${s.entro}` : ''}`;
    for(const ef of (d.efectos || []).filter(e => e && e.nombre === 'Parálisis' && !e.cura)){
      const caras = Math.max(1, Math.round(num(ef.caras)) || 1), ex0 = Math.max(1, Math.round(num(ef.exitos)) || 1);
      const exitos = /💧/.test(String(ef.detalle || '')) ? ex0 : Math.min(caras, ex0 * 2);
      if(Math.floor(Math.random() * caras) >= exitos) continue;
      try{ const rr = await dueloAplicarEfecto({...d, defensor: {...d.defensor, tokenId: s.id, nombre}}, ef); txt += ` · Parálisis${rr && rr.manual ? ' (a mano)' : ''}`; }
      catch(err){ txt += ' · Parálisis (a mano)'; }
    }
    lineas.push(txt);
  }
  const resumen = `El golpe eléctrico corre por el agua del charco (cada uno, la mitad del anterior × 1,5): ${lineas.join(' → ')}`;
  try{ momentoAbrir({tipo: 'rayo', icono: '⚡', titulo: 'El rayo corre por el agua', estado: 'listo', resultado: resumen, datos: {saltos: [tid, ...hubo.map(h => h.id)].slice(0, -1).map((de, i) => ({desde: de, hacia: hubo[i].id}))}}); }catch(err){}
  try{ alertaRojaAnonima('⚡💧 El rayo corre por el agua', resumen); }catch(err){}
  return lineas;
}
