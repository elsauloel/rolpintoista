/* 🩸 La animación de la Transfusión sanguínea (2026-11-03, dueño: «un par de segundos de animación, como de un chorro de sangre que va de uno hacia
   el otro. Que haya como gotitas que vayan girando y que el chorro sea un poco irregular, que no sea una línea recta, sino que tenga cierta sensación
   de un líquido flotando en el espacio»). Acá solo la geometría, sin dibujar (se puede probar en comun/pruebas.html); la dibuja el mapa
   (vtt-hexgrid/js/92-transfusion-fx.js) en coordenadas del mapa, así respeta el zoom y el paneo.
   - `curva(a, b, ms, semilla, n)`: n + 1 puntos {x, y, u} de A a B. La base es una curva suave (se arquea un poco hacia un lado, según la semilla) y
     encima una ondulación perpendicular que se va moviendo con el tiempo (dos ondas de distinta frecuencia: no se ve como un seno prolijo); en las
     puntas la ondulación vale 0, así el chorro sale y llega justo a cada token.
   - `ventana(p)`: qué tramo del chorro está en el aire a cada momento (p de 0 a 1): la cabeza sale de A y llega a B en el primer 45 %, y la cola
     sale de A a partir del 35 % y termina de llegar al final. Entre medio, un chorro entero que fluye.
   - `grosor(u, ms, semilla)`: el ancho relativo en cada punto (irregular, cambia con el tiempo).
   - `gotitas(semilla, n)`: los datos fijos de cada gotita (dónde va en el chorro, a qué distancia gira, a qué velocidad, si se desprende). */
(function(raiz){
  const DURACION = 2200;   // ms
  // Un generador chico y repetible (mulberry32): la misma semilla da siempre la misma animación en todas las pantallas.
  function rand(semilla){
    let s = (semilla >>> 0) || 1;
    return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const suave = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
  function curva(a, b, ms, semilla, n){
    n = Math.max(4, Math.round(n || 48));
    const r = rand(semilla), dx = b.x - a.x, dy = b.y - a.y, largo = Math.hypot(dx, dy) || 1;
    const nx = -dy / largo, ny = dx / largo;   // la perpendicular
    const arco = (r() < 0.5 ? -1 : 1) * largo * (0.10 + 0.08 * r());   // se arquea hacia un lado
    const amp1 = Math.min(largo * 0.07, 34) * (0.8 + 0.4 * r()), amp2 = amp1 * 0.45;
    const f1 = 1.6 + r() * 0.9, f2 = 3.4 + r() * 1.6, v1 = 0.0042 + r() * 0.002, v2 = 0.0068 + r() * 0.003, fase1 = r() * 6.283, fase2 = r() * 6.283;
    const t = Math.max(0, ms || 0), pts = [];
    for(let i = 0; i <= n; i++){
      const u = i / n, env = Math.sin(Math.PI * u);
      const onda = amp1 * Math.sin(u * f1 * 6.283 + fase1 - t * v1) + amp2 * Math.sin(u * f2 * 6.283 + fase2 + t * v2);
      const off = arco * env + onda * env;
      pts.push({x: a.x + dx * u + nx * off, y: a.y + dy * u + ny * off, u});
    }
    return pts;
  }
  function ventana(p){
    p = Math.max(0, Math.min(1, p));
    return {cabeza: suave(p / 0.45), cola: suave((p - 0.35) / 0.65)};
  }
  function grosor(u, ms, semilla){
    const r = rand((semilla >>> 0) + 7), f = 9 + r() * 5, v = 0.006 + r() * 0.003;
    return 0.62 + 0.26 * Math.sin(u * f + (ms || 0) * v) + 0.12 * Math.sin(u * f * 2.3 - (ms || 0) * v * 1.7);
  }
  function gotitas(semilla, n){
    const r = rand((semilla >>> 0) + 13), lista = [];
    for(let i = 0; i < (n || 16); i++) lista.push({u: r(), radio: 0.25 + r() * 0.55, vel: (r() < 0.5 ? -1 : 1) * (0.004 + r() * 0.006), fase: r() * 6.283,
      tam: 0.07 + r() * 0.07, suelta: r() < 0.35, deriva: 0.3 + r() * 0.7});
    return lista;
  }
  // Un punto del chorro en la fracción u (interpolado entre los puntos de la curva).
  function puntoEn(pts, u){
    if(!pts.length) return {x: 0, y: 0};
    const f = Math.max(0, Math.min(1, u)) * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(f)), k = f - i;
    return {x: pts[i].x + (pts[i + 1].x - pts[i].x) * k, y: pts[i].y + (pts[i + 1].y - pts[i].y) * k};
  }
  raiz.FxTransfusion = {DURACION, rand, curva, ventana, grosor, gotitas, puntoEn};
})(typeof window !== 'undefined' ? window : globalThis);
