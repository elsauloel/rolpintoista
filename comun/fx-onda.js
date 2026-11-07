/* 💥 La onda que sale alrededor de quien golpea el piso (2026-11-03, dueño: el Shockwave «también tendría que tener algún tipo de animación
   acorde», como la de la Transfusión). Acá solo la geometría, sin el mapa (se prueba en comun/pruebas.html); el dibujo y el canal que la hace
   ver en todas las pantallas están en vtt-hexgrid/js/94-onda-fx.js.
   Pieza para cualquier «onda alrededor» (2026-11-03, dueño: «aprobada la animación, avanzá con el resto»): Shockwave, Pisotón, Nova arcana,
   Sonic Boom (en cono), Remolino / Barrido / Coletazo (con giro) y el Grito espeluznante; cada una con su variante (colores y qué pasa). */
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
  /* Las variantes (colores en «r,g,b»; `golpe`: lo que se ve sobre quien no la resistió). Todas comparten el dibujo de js/94. */
  const TIERRA = {fogonazo: '255,236,200', banda: '235,195,145', banda2: '255,225,180', frente: '255,170,70', brillo: '255,245,220',
    casilla: '255,200,120', casillaBorde: '255,210,140', resiste: '170,215,255', piedras: 26, grietas: true, sacudida: 5, golpe: 'pajaritos'};
  const VARIANTES = {
    tierra: TIERRA,                                                                    // 💥 Shockwave
    pisoton: {...TIERRA, piedras: 34, sacudida: 8},                                    // 🦶 Pisotón: más fuerte, también deja Pajaritos
    arcana: {fogonazo: '235,215,255', banda: '140,80,220', banda2: '200,160,255', frente: '170,90,255', brillo: '245,230,255',
      casilla: '180,120,255', casillaBorde: '205,160,255', resiste: '220,200,255', piedras: 0, chispas: 24, grietas: false, sacudida: 0, golpe: 'empuje'},   // ✨ Nova arcana
    viento: {fogonazo: '245,250,255', banda: '205,225,240', banda2: '235,245,255', frente: '190,230,255', brillo: '255,255,255',
      casilla: '210,235,255', casillaBorde: '230,245,255', resiste: '190,230,255', piedras: 20, soloPolvo: true, grietas: false, sacudida: 3, golpe: 'sentado', cono: true},   // 🔊 Sonic Boom
    giro: {fogonazo: '255,245,230', banda: '210,210,225', banda2: '240,240,255', frente: '225,235,255', brillo: '255,255,255',
      casilla: '220,225,245', casillaBorde: '235,240,255', resiste: '190,220,255', piedras: 0, grietas: false, sacudida: 0, golpe: 'corte', giro: true},   // 🌀 Remolino, Barrido
    grito: {fogonazo: '220,190,240', banda: '90,40,110', banda2: '160,90,190', frente: '150,70,180', brillo: '225,190,245',
      casilla: '150,90,180', casillaBorde: '180,120,210', resiste: '200,180,230', piedras: 0, grietas: false, sacudida: 2, golpe: 'miedo', anillos: 3},   // 😱 Grito espeluznante
  };
  const sinTildes = t => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  // La variante de una habilidad por su nombre (o `fxOnda` en la habilidad). null = no lleva la animación.
  function varianteDe(nombre, fx){
    if(fx && VARIANTES[fx]) return fx;
    const n = sinTildes(nombre);
    if(/shockwave/.test(n)) return 'tierra';
    if(/pisoton/.test(n)) return 'pisoton';
    if(/nova arcana/.test(n)) return 'arcana';
    if(/sonic boom/.test(n)) return 'viento';
    if(/remolino|barrido|coletazo/.test(n)) return 'giro';
    if(/grito espeluznante|grito de panico/.test(n)) return 'grito';
    return fx ? 'tierra' : null;
  }
  const variante = clave => VARIANTES[clave] || TIERRA;
  // El ángulo (radianes, del mapa) hacia el centro de un conjunto de puntos {x, y} desde c: hacia dónde sale un cono.
  function anguloHacia(c, puntos){
    if(!puntos || !puntos.length) return Math.PI / 2;
    let x = 0, y = 0; puntos.forEach(p => { x += p.x; y += p.y; });
    return Math.atan2(y / puntos.length - c.y, x / puntos.length - c.x);
  }
  window.FxOnda = {DURACION, PAJARITOS_MS, anillo, piedras, piedraEn, sacudida, estrellas, VARIANTES, varianteDe, variante, anguloHacia};
})();
