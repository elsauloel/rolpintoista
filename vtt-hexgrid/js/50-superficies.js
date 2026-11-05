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
  if(esFuego(el)){ fuegoDibujar(celdas, z); return {anima: true, sinBorde: true, fuego: true}; }
  return null;
}
/* 💧 El charco (2026-11-05, dueño: «el borde del charco parece una nube; tiene que ser una ondulación, como agua»). El contorno de afuera de las
   casillas (los lados que no tocan otra casilla del charco, encadenados en lazos) con cada lado ondulado por una onda que corre despacio y vale
   cero en las esquinas (así los lados empalman); adentro, la misma línea un poco más chica y más tenue, como la onda que viene detrás, y un brillo
   que se mueve. El relleno es uno solo (sin líneas de adentro). */
function aguaContornos(celdas){
  const k = (x, y) => Math.round(x * 4) + ',' + Math.round(y * 4), mitad = new Map(), lados = [];
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
function aguaLado(l, amp, adentro, fase, primero){
  const dx = l.b[0] - l.a[0], dy = l.b[1] - l.a[1], largo = Math.hypot(dx, dy) || 1;
  const mx = (l.a[0] + l.b[0]) / 2, my = (l.a[1] + l.b[1]) / 2;
  let nx = -dy / largo, ny = dx / largo;   // la normal, hacia afuera de la casilla
  if((mx - l.c.x) * nx + (my - l.c.y) * ny < 0){ nx = -nx; ny = -ny; }
  const pasos = 14;
  for(let s = primero ? 0 : 1; s <= pasos; s++){
    const t = s / pasos, env = Math.sin(Math.PI * t);
    const off = env * (amp * Math.sin(Math.PI * 2 * 1.5 * t - fase) - adentro);
    const x = l.a[0] + dx * t + nx * off, y = l.a[1] + dy * t + ny * off;
    if(primero && !s) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
}
function aguaTrazar(lazos, amp, adentro, fase){
  ctx.beginPath();
  lazos.forEach(lazo => { lazo.forEach((l, i) => aguaLado(l, amp, adentro, fase, i === 0)); ctx.closePath(); });
}
function aguaDibujar(celdas, z){
  const lazos = aguaContornos(celdas), t = performance.now() / 1000, amp = HEX * 0.07;
  aguaTrazar(lazos, amp, 0, t * 1.6);
  ctx.fillStyle = 'rgba(52,118,178,.5)'; ctx.fill();
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
function fuegoDibujar(celdas, z){
  const s = performance.now() / 1000, lista = celdas.slice(0, 120);
  ctx.save();
  ctx.filter = `blur(${Math.max(1, HEX * 0.08 * z * (typeof dpr === 'number' ? dpr : 1)).toFixed(1)}px)`;
  trazarManchon(celdas, {radio: [0.42, 0.22], sale: [-0.04, 0.2]});
  ctx.fillStyle = 'rgba(120,28,8,.55)'; ctx.fill();
  ctx.filter = 'none';
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
