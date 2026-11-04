/* 🪝 La animación de Arrastrar (2026-11-04, dueño: «a Arrastrar también sumarle una animación de grappling hook, una cadena con un gancho…»).
   Acá solo la geometría y los tiempos, sin dibujar (se prueba en comun/pruebas.html); la dibuja el mapa (vtt-hexgrid/js/96-gancho-fx.js) en
   coordenadas del mapa.
   - `tiempos(resultado, pasos, poco)`: cuánto dura cada parte según cómo salió: 'falla' (no lo engancha: el gancho pasa de largo y la cadena vuelve
     floja), 'suelta' (lo engancha pero no lo puede traer: la cadena se tensa, tiembla y se suelta) o 'trae' (lo engancha y lo arrastra `pasos`
     casilleros). `poco`: «reducir movimiento» (todo más corto, sin temblor).
   - `fase(ms, tt)`: en qué parte va → {fase: 'lanza'|'engancha'|'tensa'|'arrastra'|'vuelve'|'fin', k (0..1 dentro de esa parte)}.
   - `cadena(a, b, flojo, ms, temblor, n)`: los puntos de la cadena de a hasta b, con una panza de costado que depende de lo floja que esté
     (`flojo` 0 = tensa, 1 = muy floja) y, tensa, un temblor fino si `temblor` > 0. Puntos {x, y, u}.
   - `eslabones(pts, paso)`: dónde va cada eslabón a lo largo de la cadena, separados `paso` → [{x, y, ang, par}] (par: de frente o de canto).
   - `recorrido(celdas, k)`: la posición a lo largo de las casillas del arrastre (centros en px), k de 0 a 1.
   - `volar(a, b, k)`: la posición del gancho volando de a a b (con un arco suave), k de 0 a 1. */
(function(raiz){
  const LANZA = 520, ENGANCHA = 170, TENSA_TRAE = 260, TENSA_SUELTA = 650, POR_PASO = 230, VUELVE = 480, PASA_LARGO = 260;
  function tiempos(resultado, pasos, poco){
    const k = poco ? 0.4 : 1, r = String(resultado || 'falla');
    const t = {resultado: r, lanza: LANZA * k, engancha: 0, tensa: 0, arrastra: 0, vuelve: VUELVE * k};
    if(r === 'falla'){ t.engancha = PASA_LARGO * k; }
    else if(r === 'suelta'){ t.engancha = ENGANCHA * k; t.tensa = (poco ? 200 : TENSA_SUELTA); }
    else { t.engancha = ENGANCHA * k; t.tensa = TENSA_TRAE * k; t.arrastra = POR_PASO * k * Math.max(1, Math.round(Number(pasos) || 1)); }
    t.total = t.lanza + t.engancha + t.tensa + t.arrastra + t.vuelve;
    return t;
  }
  function fase(ms, tt){
    let m = Math.max(0, Number(ms) || 0);
    for(const f of ['lanza', 'engancha', 'tensa', 'arrastra', 'vuelve']){
      const d = tt[f];
      if(!(d > 0)) continue;
      if(m < d) return {fase: f, k: m / d};
      m -= d;
    }
    return {fase: 'fin', k: 1};
  }
  function cadena(a, b, flojo, ms, temblor, n){
    n = Math.max(4, Math.round(n || 24));
    const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
    const panza = Math.max(0, Math.min(1, Number(flojo) || 0)) * Math.min(l * 0.22, 40);
    const t = Math.max(0, ms || 0), tb = Math.max(0, Number(temblor) || 0), pts = [];
    for(let i = 0; i <= n; i++){
      const u = i / n, env = Math.sin(Math.PI * u);
      const off = panza * env * (1 + 0.15 * Math.sin(t * 0.004 + u * 3)) + tb * env * Math.sin(u * 37 + t * 0.09) * 2.2;
      pts.push({x: a.x + dx * u + nx * off, y: a.y + dy * u + ny * off, u});
    }
    return pts;
  }
  function eslabones(pts, paso){
    const out = [];
    if(!pts || pts.length < 2) return out;
    paso = Math.max(1, Number(paso) || 6);
    let resto = 0, par = 0;
    for(let i = 1; i < pts.length; i++){
      const p0 = pts[i - 1], p1 = pts[i], dx = p1.x - p0.x, dy = p1.y - p0.y, l = Math.hypot(dx, dy);
      if(!l) continue;
      const ang = Math.atan2(dy, dx);
      let d = paso - resto;
      while(d <= l){
        out.push({x: p0.x + dx * d / l, y: p0.y + dy * d / l, ang, par: (par++) % 2 === 0});
        d += paso;
      }
      resto = l - (d - paso);
    }
    return out;
  }
  function recorrido(celdas, k){
    if(!Array.isArray(celdas) || !celdas.length) return null;
    if(celdas.length === 1) return {x: celdas[0].x, y: celdas[0].y};
    const q = Math.max(0, Math.min(1, Number(k) || 0)) * (celdas.length - 1), i = Math.min(celdas.length - 2, Math.floor(q)), f = q - i;
    const s = f * f * (3 - 2 * f);   // suave en cada casilla: tirones, como de una cadena
    return {x: celdas[i].x + (celdas[i + 1].x - celdas[i].x) * s, y: celdas[i].y + (celdas[i + 1].y - celdas[i].y) * s};
  }
  function volar(a, b, k){
    const q = Math.max(0, Math.min(1, Number(k) || 0)), e = 1 - Math.pow(1 - q, 2);
    const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1, arco = Math.min(l * 0.12, 18) * Math.sin(Math.PI * e);
    return {x: a.x + dx * e - dy / l * arco, y: a.y + dy * e + dx / l * arco};
  }
  raiz.FxGancho = {LANZA, ENGANCHA, TENSA_TRAE, TENSA_SUELTA, POR_PASO, VUELVE, PASA_LARGO, tiempos, fase, cadena, eslabones, recorrido, volar};
})(typeof window !== 'undefined' ? window : globalThis);
