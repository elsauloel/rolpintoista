/* 🛡 La animación del Escudo humano (2026-11-03, dueño: «tiene que haber alguna animación para que visualmente se entienda que el daño se está
   distribuyendo entre los dos tokens»; «en el token de la persona que está siendo protegida puede aparecer alguna especie de brillo… como si fuera un
   reflejo metálico de protección»). Acá solo la geometría y los tiempos, sin dibujar (se prueba en comun/pruebas.html); la dibuja el mapa
   (vtt-hexgrid/js/95-escudo-humano-fx.js) en coordenadas del mapa. Vale igual para el Miti-Miti de clase (el mismo reparto).
   - `partir(total)`: el reparto del golpe, igual que el mapa (js/10 mitiMitiPartir): el guardián se lleva la mitad para arriba → {va, queda}.
   - `lazo(a, b, ms, recorte, n)`: los puntos del lazo dorado entre los dos tokens (sin pisar los tokens: arranca y termina a `recorte` de cada
     centro), con una caída suave y una ondulación muy lenta. Puntos {x, y, u}.
   - `puntoEn(pts, u)`: un punto del lazo (u de 0 a 1).
   - `respiro(ms)`: la opacidad del lazo en reposo (respira despacio).
   - `reflejo(ms, desfase)`: el reflejo metálico que barre el token del protegido cada tanto → null (no hay) o 0..1 (cuánto barrió).
   - `fases(ms)`: en qué va un golpe (1,5 s): el impacto, el número entero, el reparto, la esquirla que viaja, el pulso en el guardián. */
(function(raiz){
  const DURACION_GOLPE = 1500;   // ms
  const CORTE = 600;             // ms que tarda en desvanecerse el lazo cuando termina el efecto
  const REFLEJO_CADA = 3200, REFLEJO_DURA = 750;
  function partir(total){
    const t = Math.max(0, Math.round(Number(total) || 0)), va = Math.ceil(t / 2);
    return {va, queda: t - va};
  }
  function lazo(a, b, ms, recorte, n){
    n = Math.max(4, Math.round(n || 24));
    const dx = b.x - a.x, dy = b.y - a.y, largo = Math.hypot(dx, dy) || 1;
    const ux = dx / largo, uy = dy / largo, nx = -uy, ny = ux;
    const r = Math.max(0, Math.min(largo * 0.45, Number(recorte) || 0));
    const A = {x: a.x + ux * r, y: a.y + uy * r}, B = {x: b.x - ux * r, y: b.y - uy * r};
    const ldx = B.x - A.x, ldy = B.y - A.y, l = Math.hypot(ldx, ldy);
    const caida = Math.min(l * 0.10, 22), t = Math.max(0, ms || 0), pts = [];
    for(let i = 0; i <= n; i++){
      const u = i / n, env = Math.sin(Math.PI * u);
      const off = caida * env + Math.min(l * 0.03, 5) * env * Math.sin(u * 6.283 * 1.3 - t * 0.0012);
      pts.push({x: A.x + ldx * u + nx * off, y: A.y + ldy * u + ny * off, u});
    }
    return pts;
  }
  function puntoEn(pts, u){
    if(!pts || !pts.length) return {x: 0, y: 0, u: 0};
    const q = Math.max(0, Math.min(1, u)) * (pts.length - 1), i = Math.floor(q), f = q - i;
    const p0 = pts[i], p1 = pts[Math.min(pts.length - 1, i + 1)];
    return {x: p0.x + (p1.x - p0.x) * f, y: p0.y + (p1.y - p0.y) * f, u};
  }
  const respiro = ms => 0.45 + 0.15 * Math.sin((Math.max(0, ms || 0)) / 900);
  function reflejo(ms, desfase){
    const k = ((Math.max(0, ms || 0) + (Number(desfase) || 0)) % REFLEJO_CADA);
    return k < REFLEJO_DURA ? k / REFLEJO_DURA : null;
  }
  // Un golpe: 0–350 el impacto en el protegido · 0–520 el número entero · 450 se parte · 450–1050 la esquirla viaja por el lazo ·
  // 1050–1500 el pulso dorado en el guardián con su número · el lazo brilla fuerte de 450 a 1300.
  function fases(ms){
    const t = Math.max(0, ms || 0), entre = (a, b) => t < a ? 0 : t > b ? 1 : (t - a) / (b - a);
    return {
      impacto: t <= 350 ? 1 - t / 350 : 0,
      entero: t < 520 ? 1 : 0,
      partido: t >= 450,
      viaje: entre(450, 1050),
      pulso: t >= 1050 ? entre(1050, 1500) : null,
      brilloLazo: t >= 450 && t <= 1300 ? Math.sin(Math.PI * entre(450, 1300)) : 0,
      numeros: t < 1500 ? Math.min(1, (1500 - t) / 300) : 0,   // los números se apagan al final
      fin: t >= DURACION_GOLPE,
    };
  }
  raiz.FxEscudoHumano = {DURACION_GOLPE, CORTE, REFLEJO_CADA, REFLEJO_DURA, partir, lazo, puntoEn, respiro, reflejo, fases};
})(typeof window !== 'undefined' ? window : globalThis);
