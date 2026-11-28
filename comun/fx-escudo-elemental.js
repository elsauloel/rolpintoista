/* 🛡 La animación del Escudo elemental (2026-11-06, dueño: «el elemento girando alrededor del objetivo»; para el ácido y el tóxico, «inspirarse en
   la animación de la Transfusión: hay algo muy bien logrado en la sensación de un líquido… un líquido que gira alrededor, un poco más ancho que el
   chorro, irregular, y que salpica hacia afuera»). Acá solo la geometría, sin dibujar (se puede probar en comun/pruebas.html); la dibuja el mapa
   (vtt-hexgrid/js/106-escudo-elemental.js) en coordenadas del mapa. Todo sale de una semilla (la del portador): la misma en todas las pantallas.
   - `chorros(c, R, ms, semilla, o)`: los chorros de líquido que giran alrededor del centro c a un radio R (por defecto 2): cada uno, una lista de
     puntos {x, y, u} a lo largo de un arco que da vueltas, con una ondulación hacia adentro y hacia afuera que se mueve (dos ondas: no se ve prolijo).
   - `grosor(u, ms, semilla)`: el ancho relativo en cada punto (irregular, cambia con el tiempo, se afina en las puntas).
   - `gotas(semilla, n)` y `posGota(g, c, R, ms, poco)`: las gotitas que giran con el líquido; las que salpican se sueltan hacia afuera, se apagan y
     vuelven a salir (cada una con su ritmo). `poco` = «reducir movimiento»: giran más despacio y no salpican.
   - `orbitas(semilla, n)` y `posOrbita(p, c, R, ms, poco)`: partículas que giran (copos, motas, chispas, humo), a distintas distancias. */
(function(raiz){
  function rand(semilla){
    let s = (semilla >>> 0) || 1;
    return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  // Una semilla a partir de un texto (el id del token): la misma en todas las pantallas.
  function semillaDe(txt){ let h = 2166136261; for(const ch of String(txt || '')) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; }
  const TAU = Math.PI * 2;
  const VEL = 0.0011;   // rad/ms: una vuelta cada ~5,7 s
  function chorros(c, R, ms, semilla, o){
    o = o || {};
    const n = Math.max(1, Math.round(o.cuantos || 2)), pts = Math.max(8, Math.round(o.puntos || 40)), largo = o.largo || 0.36, poco = !!o.poco;
    const r = rand(semilla), base = r() * TAU, t = Math.max(0, ms || 0), vel = VEL * (poco ? 0.3 : 1);
    const lista = [];
    for(let i = 0; i < n; i++){
      const f1 = 2.2 + r() * 1.4, f2 = 4.5 + r() * 2, v1 = 0.0035 + r() * 0.002, v2 = 0.006 + r() * 0.003, fase1 = r() * TAU, fase2 = r() * TAU;
      const largoI = largo * (0.85 + 0.3 * r()), a0 = base + i * TAU / n + t * vel;
      const arco = [];
      for(let k = 0; k <= pts; k++){
        const u = k / pts, ang = a0 + u * largoI * TAU;
        const rr = R * (1 + 0.075 * Math.sin(u * f1 * TAU + fase1 - t * v1) + 0.04 * Math.sin(u * f2 * TAU + fase2 + t * v2));
        arco.push({x: c.x + Math.cos(ang) * rr, y: c.y + Math.sin(ang) * rr, u});
      }
      lista.push(arco);
    }
    return lista;
  }
  function grosor(u, ms, semilla){
    const r = rand((semilla >>> 0) + 7), f = 9 + r() * 5, v = 0.006 + r() * 0.003;
    const punta = Math.pow(Math.max(0, Math.sin(Math.PI * u)), 0.55);   // se afina en las puntas
    return Math.max(0.15, (0.62 + 0.26 * Math.sin(u * f + (ms || 0) * v) + 0.12 * Math.sin(u * f * 2.3 - (ms || 0) * v * 1.7)) * punta);
  }
  function gotas(semilla, n){
    const r = rand((semilla >>> 0) + 13), lista = [];
    for(let i = 0; i < (n || 18); i++) lista.push({ang: r() * TAU, vel: VEL * (0.8 + r() * 0.5), radio: 0.82 + r() * 0.36, tam: 0.06 + r() * 0.07,
      salpica: r() < 0.45, periodo: 1300 + r() * 1700, fase: r() * 3000, deriva: 0.35 + r() * 0.5, lado: r() < 0.5 ? -1 : 1});
    return lista;
  }
  // → {x, y, r (relativo a R), alfa}
  function posGota(g, c, R, ms, poco){
    const t = Math.max(0, ms || 0), ang = g.ang + t * g.vel * (poco ? 0.3 : 1);
    let rr = R * g.radio, alfa = 1, tam = g.tam;
    if(g.salpica && !poco){
      const s = ((t + g.fase) % g.periodo) / g.periodo;   // 0 → 1: sale del líquido, vuela hacia afuera y se apaga
      rr += R * g.deriva * s;
      alfa = s < 0.15 ? s / 0.15 : 1 - (s - 0.15) / 0.85;
      tam *= 1 - 0.5 * s;
      const desvio = g.lado * 0.35 * s;   // se va un poco de costado (lo arrastra el giro)
      return {x: c.x + Math.cos(ang + desvio) * rr, y: c.y + Math.sin(ang + desvio) * rr, r: tam, alfa: Math.max(0, alfa)};
    }
    return {x: c.x + Math.cos(ang) * rr, y: c.y + Math.sin(ang) * rr, r: tam, alfa};
  }
  function orbitas(semilla, n){
    const r = rand((semilla >>> 0) + 29), lista = [];
    for(let i = 0; i < (n || 20); i++) lista.push({ang: r() * TAU, vel: VEL * (0.6 + r() * 0.9) * (r() < 0.85 ? 1 : 1.6), radio: 0.7 + r() * 0.55, tam: 0.04 + r() * 0.07,
      osc: 0.04 + r() * 0.08, fOsc: 0.002 + r() * 0.003, fase: r() * TAU, brillo: r()});
    return lista;
  }
  function posOrbita(p, c, R, ms, poco){
    const t = Math.max(0, ms || 0), ang = p.ang + t * p.vel * (poco ? 0.3 : 1);
    const rr = R * (p.radio + p.osc * Math.sin(t * p.fOsc + p.fase));
    return {x: c.x + Math.cos(ang) * rr, y: c.y + Math.sin(ang) * rr, ang, r: p.tam, titila: 0.5 + 0.5 * Math.sin(t * 0.008 + p.fase * 3)};
  }
  raiz.FxEscudoElemental = {rand, semillaDe, chorros, grosor, gotas, posGota, orbitas, posOrbita};
})(typeof window !== 'undefined' ? window : globalThis);
