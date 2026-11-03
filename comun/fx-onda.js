/* 💥 La onda que sale alrededor de quien golpea el piso (2026-11-03, dueño: el Shockwave «también tendría que tener algún tipo de animación
   acorde», como la de la Transfusión). Acá solo la geometría, sin el mapa (se prueba en comun/pruebas.html); el dibujo y el canal que la hace
   ver en todas las pantallas están en vtt-hexgrid/js/94-onda-fx.js.
   Pieza pensada para cualquier «onda alrededor» (Pisotón, Onda de choque, Nova arcana…); hoy solo la usa el Shockwave. */
(function(){
  const DURACION = 1700;              // ms de la onda (el anillo, el polvo y las piedritas)
  const PAJARITOS_MS = 2600;          // ms de las estrellitas sobre cada uno que no lo resistió
  // Un azar repetible (todas las pantallas ven las mismas piedritas con la misma semilla).
  function azar(semilla){ let s = (Math.floor(semilla) || 1) >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  // El anillo: arranca chico y llega a pasar las casillas de al lado (1 = el borde de afuera de los vecinos), frenando al final.
  function anillo(p){ const q = Math.max(0, Math.min(1, p)); return 0.15 + 0.95 * (1 - Math.pow(1 - q, 3)); }
  // Las piedritas y el polvo que saltan: ángulo, distancia que recorren, altura del salto, tamaño y giro.
  function piedras(semilla, n){
    const r = azar(semilla), out = [];
    for(let i = 0; i < n; i++){
      out.push({ang: (i / n) * 2 * Math.PI + (r() - 0.5) * 0.6, lejos: 0.55 + r() * 0.6, alto: 0.25 + r() * 0.55, tam: 0.035 + r() * 0.05,
        giro: (r() - 0.5) * 12, polvo: r() < 0.45, demora: r() * 0.18});
    }
    return out;
  }
  // La posición de una piedrita en el momento p (0–1): sale del centro, vuela en arco y cae. → {d, h, alfa} (d: distancia en radios de onda; h: altura)
  function piedraEn(pd, p){
    const q = Math.max(0, Math.min(1, (p - pd.demora) / (1 - pd.demora)));
    return {d: pd.lejos * q, h: pd.alto * 4 * q * (1 - q), alfa: q <= 0 ? 0 : 1 - Math.pow(q, 3)};
  }
  // La sacudida del mapa (en px de pantalla): fuerte al principio, se apaga en ~350 ms. Con poco movimiento, nada.
  function sacudida(ms, semilla, fuerza){
    if(ms > 350) return {dx: 0, dy: 0};
    const k = (1 - ms / 350) * (fuerza || 5), f = (Math.floor(semilla) || 1) % 7;
    return {dx: Math.sin(ms / 18 + f) * k, dy: Math.cos(ms / 23 + f * 2) * k * 0.7};
  }
  // Las estrellitas que giran sobre la cabeza del aturdido: n puntos en una elipse que gira. → [{x, y, frente}] (en radios de hex, desde el centro de la elipse)
  function estrellas(ms, n){
    const out = [];
    for(let i = 0; i < n; i++){
      const a = ms / 260 + (i / n) * 2 * Math.PI;
      out.push({x: Math.cos(a) * 0.55, y: Math.sin(a) * 0.18, frente: Math.sin(a) > 0});
    }
    return out;
  }
  window.FxOnda = {DURACION, PAJARITOS_MS, anillo, piedras, piedraEn, sacudida, estrellas};
})();
