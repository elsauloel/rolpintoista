// js/125-resurreccion-fx.js — ✨ Las animaciones de resurrección (dueño, 2026-11-20: «me encantan tus propuestas de animación»).
//
// Cuatro animaciones de ~3 segundos, una por forma de volver, dibujadas en el lienzo (formas, brillos y partículas; sin imágenes):
//   ☥ 'ankh'   — un ankh dorado flota y gira sobre el caído → se raja con un destello y se parte → polvo dorado baja en espiral y entra al token →
//                el token se enciende de dorado y vuelve a su color.
//   🔥 'llama'  — (la Llama de Fénix) el token se consume en una llamarada y queda un montoncito de cenizas → sube un ave de fuego con las alas
//                abiertas, se eleva y se deshace en chispas → las chispas caen y el token reaparece con un borde de brasa que se apaga.
//   💉 'revive' — un frasquito viaja desde quien lo usó hasta el caído (sin nadie: el líquido cae desde arriba) → se rompe y un líquido brillante
//                llena el token de abajo hacia arriba → un corazón late dos veces, «tu-tum», y con el segundo latido queda de pie.
//   😇 'pacto'  — un círculo con símbolos se dibuja en el piso, trazo por trazo → sube una columna de luz oscura (violeta y roja) → el token se
//                levanta y el círculo se quema de afuera hacia adentro, como papel.
//   Cualquier otra vuelta (alguien que estaba caído y aparece con vida sin pasar por una de esas: la vida escrita a mano, la ficha, GM Tools):
//   un resplandor corto (~1 s). Con «reducir movimiento», todas son ese resplandor corto.
//
// CÓMO LLEGA A TODAS LAS PANTALLAS: la pantalla que revive pasa por resurreccionAnunciar (js/123) → resuFxPublicar({a, forma, de}) publica UN
// momento «resu-fx» (sin tarjeta, js/16 → resuFxRecibido) y cada pantalla lo dibuja. Una sola vez por token (otro aviso del mismo token dentro de
// los 6 s se descarta). Lo que esta pantalla no ve (oculto, niebla, sigilo) no se dibuja.
// QUIÉN USÓ EL REVIVE: el que lo usa sobre un personaje no lo revive él (le llega por aviso a la pantalla del caído): antes publica una «pista»
// (momento «resu-pista» {a, de}); cada pantalla la guarda y, cuando llega el «resu-fx» de ese token, el frasquito sale de ahí.
// EL TOKEN MIENTRAS DURA: arranca «apagado» (oscuro y con la ✕, aunque el dato ya diga que vive) y se enciende en el momento que toca
// (resuFxAlfa y resuFxPosToken los usa js/05: el Fénix lo hace desaparecer, el Revive lo hace latir, el Pacto lo levanta).
// LOS CARTELES ESPERAN: el aviso al centro («Volviste…») y la línea de la Mesa salen cuando la animación terminó (resuFxOcupado; js/16 y js/123).
const RESU_FX = [];           // {a, forma, de: {x,y}|null, t0, semilla, corta}
const resuFxVistos = new Set();
const resuFxUltimo = new Map();   // tokenId → hora de la última animación (para no repetirla)
const resuFxPistas = new Map();   // tokenId del caído → {de: tokenId, t}
const RESU_DUR = {ankh: 3000, llama: 3300, revive: 2950, pacto: 2950, corta: 950};
const resuFxPoco = () => { try{ return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } };
const resuFxDur = fx => fx.corta ? RESU_DUR.corta : (RESU_DUR[fx.forma] || RESU_DUR.corta);
const resuFxDurDe = forma => resuFxPoco() ? RESU_DUR.corta : (RESU_DUR[forma] || RESU_DUR.corta);
const resuFxVe = t => !!t && (!t.oculto || soyGM) && (typeof tokenVisiblePorNiebla !== 'function' || tokenVisiblePorNiebla(t));
function resuFxIdDe(t){ if(!t) return ''; for(const [id, x] of tokens.entries()) if(x === t) return id; return ''; }
// ¿Hay una animación de resurrección corriendo (o por arrancar) en esta pantalla? La usan los carteles para esperar.
let resuFxFin = 0;   // cuándo termina la última (con un respiro de un cuarto de segundo)
function resuFxOcupado(){ return performance.now() < resuFxFin; }

// La pantalla que revive. `a`: id del token que vuelve; `forma`; `de`: id del token de quien usó el Revive (opcional). → cuánto dura (ms).
function resuFxPublicar(o){
  o = o || {};
  if(!o.a || !tokens.get(o.a)) return 0;
  const forma = RESU_DUR[o.forma] && o.forma !== 'corta' ? o.forma : 'otra';
  const datos = {a: String(o.a), forma, ...(o.de && o.de !== o.a ? {de: String(o.de)} : {}), semilla: Math.floor(Math.random() * 1e9)};
  resuFxEmpezar(datos);   // acá, ya (las demás pantallas, cuando les llegue; si a esta le vuelve, se descarta por repetida)
  try{ if(typeof momentoAbrir === 'function') momentoAbrir({tipo: 'resu-fx', icono: '', titulo: '', estado: 'listo', datos}).catch(() => {}); }
  catch(err){ console.error('Resurrección: no se pudo publicar la animación', err); }
  return resuFxDurDe(forma);
}
// Quien usa un Revive sobre un personaje (js/22): avisa de quién sale el frasquito.
function resuFxPista(aId, deId){
  if(!aId || !deId || aId === deId) return;
  resuFxPistas.set(String(aId), {de: String(deId), t: Date.now()});
  try{ if(typeof momentoAbrir === 'function') momentoAbrir({tipo: 'resu-pista', icono: '', titulo: '', estado: 'listo', datos: {a: String(aId), de: String(deId)}}).catch(() => {}); }catch(e){}
}
// Llegan a cada pantalla (js/16). Una sola vez, y solo si son de recién.
const resuFxReciente = d => { const t = d.creado && d.creado.toMillis ? d.creado.toMillis() : Date.now(); return Date.now() - t < 20000; };
function resuFxRecibido(id, d){
  if(!d || !d.datos || resuFxVistos.has(id)) return;
  resuFxVistos.add(id);
  if(!resuFxReciente(d)) return;
  if(d.tipo === 'resu-pista'){ if(d.datos.a && d.datos.de) resuFxPistas.set(String(d.datos.a), {de: String(d.datos.de), t: Date.now()}); return; }
  resuFxEmpezar(d.datos);
}
function resuFxEmpezar(dt){
  if(!dt || !dt.a) return;
  const t = tokens.get(dt.a);
  if(!t) return;
  const ahoraR = Date.now();
  if(ahoraR - (resuFxUltimo.get(dt.a) || 0) < 6000) return;   // ya la está viendo (la pantalla que revive y el aviso que le vuelve; dos avisos del mismo)
  resuFxUltimo.set(dt.a, ahoraR);
  let deId = dt.de || '';
  if(!deId && dt.forma === 'revive'){ const p = resuFxPistas.get(dt.a); if(p && ahoraR - p.t < 120000) deId = p.de; }
  resuFxPistas.delete(dt.a);
  const td = deId ? tokens.get(deId) : null;
  const de = td && resuFxVe(td) ? hexCentro(td.col, td.fila) : null;
  const forma = RESU_DUR[dt.forma] && dt.forma !== 'corta' ? dt.forma : 'otra';
  const corta = forma === 'otra' || resuFxPoco();
  const dur = corta ? RESU_DUR.corta : RESU_DUR[forma];
  // Si el cuadro de un duelo está abierto en esta pantalla, se repliega mientras dura y vuelve solo; la animación arranca cuando ya se fue.
  let espera = 0;
  try{ const ab = typeof Duelo !== 'undefined' && Duelo.abiertoId && Duelo.abiertoId(); if(ab && Duelo.apartar && num(Duelo.apartar(ab, 380 + dur + 450)) > 0) espera = 380; }catch(e){}
  for(let i = RESU_FX.length - 1; i >= 0; i--) if(RESU_FX[i].a === dt.a) RESU_FX.splice(i, 1);
  RESU_FX.push({a: dt.a, forma, de, t0: performance.now() + espera, semilla: num(dt.semilla) || 1, corta});
  resuFxFin = Math.max(resuFxFin, performance.now() + espera + dur + 250);
  pedirDibujo();
}

// — Ayudas —
function resuAzar(s){ let x = (s | 0) || 1; return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return ((x >>> 0) % 10000) / 10000; }; }
const resuCl = u => Math.max(0, Math.min(1, u));
const resuFase = (ms, a, b) => resuCl((ms - a) / (b - a));
const resuSuave = u => u * u * (3 - 2 * u);
const resuSale = u => 1 - Math.pow(1 - u, 3);
// Dónde y de qué tamaño se está dibujando el token.
function resuGeo(id){
  const t = tokens.get(id); if(!t) return null;
  const v = visibles.get(id), d = Array.isArray(disposicion) ? disposicion.find(x => x.id === id) : null;
  if(!d) return null;   // no se dibuja en esta pantalla (oculto, niebla, sigilo)
  const c = v || hexCentro(t.col, t.fila);
  return {x: c.x, y: c.y, rad: d.radio || HEX * 0.68, t};
}
const resuFxDe = id => { for(const fx of RESU_FX) if(fx.a === id) return fx; return null; };
// Cuánto «apagado» (0–1) se ve el token en este momento de la animación.
function resuApagado(fx, ms){
  if(ms < 0) return 1;
  if(fx.corta) return 1 - resuFase(ms, 250, 500);
  if(fx.forma === 'ankh') return 1 - resuFase(ms, 2300, 2520);
  if(fx.forma === 'llama') return 1 - resuFase(ms, 350, 800);
  if(fx.forma === 'revive') return 1 - resuFase(ms, 2380, 2560);
  if(fx.forma === 'pacto') return 1 - resuFase(ms, 1650, 2000);
  return 0;
}
// js/05: la transparencia del token (el Fénix lo consume y lo devuelve).
function resuFxAlfa(id){
  const fx = resuFxDe(id); if(!fx || fx.corta || fx.forma !== 'llama') return 1;
  const ms = performance.now() - fx.t0;
  if(ms < 350) return 1;
  if(ms < 800) return 1 - resuSuave(resuFase(ms, 350, 800));
  if(ms < 2250) return 0;
  return resuSuave(resuFase(ms, 2250, 2650));
}
// js/05 (calcularDisposicion): la escala y el corrimiento del token (el Revive lo hace latir; el Pacto lo levanta).
const resuPulso = (ms, t0, largo) => { const u = (ms - t0) / largo; if(u <= 0 || u >= 1) return 0; return u < 0.28 ? resuSale(u / 0.28) : 1 - resuSuave((u - 0.28) / 0.72); };
const RESU_LATIDO = {uno: 2000, largoUno: 240, dos: 2330, largoDos: 320};
function resuFxPosToken(id){
  const fx = resuFxDe(id); if(!fx || fx.corta) return null;
  const ms = performance.now() - fx.t0;
  if(fx.forma === 'revive'){
    const p = 0.13 * resuPulso(ms, RESU_LATIDO.uno, RESU_LATIDO.largoUno) + 0.22 * resuPulso(ms, RESU_LATIDO.dos, RESU_LATIDO.largoDos);
    return p > 0.001 ? {s: 1 + p, dy: 0} : null;
  }
  if(fx.forma === 'pacto'){
    const k = resuSuave(resuFase(ms, 1500, 1900)) * (1 - resuSuave(resuFase(ms, 2300, 2700)));
    return k > 0.001 ? {s: 1 + 0.07 * k, dy: -HEX * 0.24 * k} : null;
  }
  return null;
}
function resuHex(g, k){ trazarPuntos(verticesHex(g.x, g.y, g.rad * (k || 1))); }
// El token «apagado»: oscuro y con la ✕, como un caído (si el dato todavía dice que está caído, ya lo dibuja js/05).
function resuOscuro(g, k, z){
  if(k <= 0.01) return;
  const est = estadoDe(g.t);
  if(est && est.muerto) return;
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  resuHex(g, 0.97); ctx.fillStyle = `rgba(15,12,14,${(0.62 * k).toFixed(3)})`; ctx.fill();
  ctx.strokeStyle = HP_COLOR; ctx.globalAlpha = k; ctx.lineWidth = Math.max(2 / z, g.rad * 0.14);
  const q = g.rad * 0.45;
  ctx.beginPath(); ctx.moveTo(g.x - q, g.y - q); ctx.lineTo(g.x + q, g.y + q); ctx.moveTo(g.x + q, g.y - q); ctx.lineTo(g.x - q, g.y + q); ctx.stroke();
  ctx.restore();
}
// Un resplandor que llena el token y un anillo que se abre: el «encendido» (color = [r,g,b]).
function resuEncendido(g, u, col, z, fuerza){
  if(u <= 0 || u >= 1) return;
  const a = (u < 0.25 ? u / 0.25 : 1 - (u - 0.25) / 0.75) * (fuerza || 1), c = col.join(',');
  ctx.save();
  resuHex(g); ctx.fillStyle = `rgba(${c},${(0.88 * a).toFixed(3)})`; ctx.fill();   // (pintado encima: que se vea el color, no un blanco)
  ctx.globalCompositeOperation = 'lighter';
  const r = g.rad * (1.1 + 0.9 * a);
  const gr = ctx.createRadialGradient(g.x, g.y, g.rad * 0.2, g.x, g.y, r);
  gr.addColorStop(0, `rgba(255,255,255,${(0.22 * a).toFixed(3)})`); gr.addColorStop(0.5, `rgba(${c},${(0.4 * a).toFixed(3)})`); gr.addColorStop(1, `rgba(${c},0)`);
  ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(g.x, g.y, r, 0, 2 * Math.PI); ctx.fill();
  resuHex(g, 1 + 0.9 * resuSale(u)); ctx.strokeStyle = `rgba(${c},${(0.9 * (1 - u)).toFixed(3)})`; ctx.lineWidth = Math.max(2 / z, g.rad * 0.09 * (1 - u)); ctx.stroke();
  ctx.restore();
}

// ————— ☥ ANKH —————
function resuAnkhTrazo(s){   // el ankh, centrado, de alto ~2s (solo los caminos; quien llama pone el estilo y hace stroke)
  ctx.beginPath();
  ctx.ellipse(0, -0.5 * s, 0.3 * s, 0.42 * s, 0, 0, 2 * Math.PI);
  ctx.moveTo(-0.52 * s, 0.04 * s); ctx.lineTo(0.52 * s, 0.04 * s);
  ctx.moveTo(0, -0.08 * s); ctx.lineTo(0, 0.98 * s);
}
function resuAnkhPintar(s, a, z){
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  resuAnkhTrazo(s); ctx.strokeStyle = `rgba(90,55,0,${(0.9 * a).toFixed(3)})`; ctx.lineWidth = s * 0.3; ctx.stroke();
  ctx.shadowColor = `rgba(255,200,60,${a.toFixed(3)})`; ctx.shadowBlur = 22 / z;
  const gr = ctx.createLinearGradient(-s * 0.5, -s, s * 0.5, s);
  gr.addColorStop(0, `rgba(255,244,190,${a.toFixed(3)})`); gr.addColorStop(0.5, `rgba(255,205,70,${a.toFixed(3)})`); gr.addColorStop(1, `rgba(214,140,20,${a.toFixed(3)})`);
  resuAnkhTrazo(s); ctx.strokeStyle = gr; ctx.lineWidth = s * 0.21; ctx.stroke();
  ctx.shadowBlur = 0;
  resuAnkhTrazo(s); ctx.strokeStyle = `rgba(255,255,235,${(0.75 * a).toFixed(3)})`; ctx.lineWidth = s * 0.05; ctx.stroke();
}
function resuDibujarAnkh(fx, g, ms, z){
  const R = g.rad, s = R * 0.92, flota = Math.sin(ms / 260) * R * 0.07;
  const ax = g.x, ay = g.y - R * 2.15 + flota;
  resuOscuro(g, resuApagado(fx, ms), z);
  // Un halo detrás del ankh.
  const aparece = resuFase(ms, 280, 560), entero = ms < 1480;
  if(aparece > 0 && ms < 1800){
    const a = aparece * (1 - resuFase(ms, 1480, 1800));
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const h = ctx.createRadialGradient(ax, ay, 0, ax, ay, s * 1.9);
    h.addColorStop(0, `rgba(255,220,120,${(0.42 * a).toFixed(3)})`); h.addColorStop(1, 'rgba(255,190,60,0)');
    ctx.fillStyle = h; ctx.beginPath(); ctx.arc(ax, ay, s * 1.9, 0, 2 * Math.PI); ctx.fill(); ctx.restore();
  }
  // 1) El ankh flota y gira (dos vueltas, y queda de frente).
  if(aparece > 0 && entero){
    const giro = 4 * Math.PI * resuSuave(resuFase(ms, 420, 1300)), ancho = Math.cos(giro);
    ctx.save(); ctx.translate(ax, ay); ctx.scale(Math.sign(ancho || 1) * Math.max(0.14, Math.abs(ancho)), 1);
    resuAnkhPintar(s * (0.75 + 0.25 * resuSale(aparece)), aparece, z);
    ctx.restore();
    // 2) La rajadura: un zigzag blanco que lo recorre de arriba abajo.
    const raja = resuFase(ms, 1300, 1470);
    if(raja > 0){
      const pts = [[0.02, -0.95], [-0.1, -0.6], [0.08, -0.3], [-0.07, 0.02], [0.09, 0.35], [-0.05, 0.68], [0.03, 1.0]];
      const hasta = raja * (pts.length - 1);
      ctx.save(); ctx.translate(ax, ay); ctx.strokeStyle = 'rgba(255,255,255,.98)'; ctx.shadowColor = 'rgba(255,255,255,.95)'; ctx.shadowBlur = 10 / z;
      ctx.lineWidth = Math.max(1.6 / z, s * 0.06); ctx.lineJoin = 'miter'; ctx.beginPath(); ctx.moveTo(pts[0][0] * s, pts[0][1] * s);
      for(let i = 1; i < pts.length; i++){
        if(i <= hasta) ctx.lineTo(pts[i][0] * s, pts[i][1] * s);
        else{ const f = hasta - (i - 1); if(f > 0) ctx.lineTo((pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f) * s, (pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f) * s); break; }
      }
      ctx.stroke(); ctx.restore();
    }
  }
  // 3) Se parte: el destello y las dos mitades que se abren, caen y se deshacen.
  if(ms >= 1480 && ms < 1900){
    const u = resuFase(ms, 1480, 1900), a = 1 - u;
    [-1, 1].forEach(lado => {
      ctx.save(); ctx.translate(ax + lado * s * 0.55 * resuSale(u), ay + s * 0.5 * u * u); ctx.rotate(lado * 0.6 * u);
      ctx.beginPath(); ctx.rect(lado < 0 ? -s * 1.2 : 0, -s * 1.3, s * 1.2, s * 2.7); ctx.clip();
      resuAnkhPintar(s, a * a, z);
      ctx.restore();
    });
  }
  const dest = resuFase(ms, 1440, 1760);
  if(dest > 0 && dest < 1){
    const a = dest < 0.2 ? dest / 0.2 : 1 - (dest - 0.2) / 0.8, r = s * (1.2 + 1.6 * dest);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const f = ctx.createRadialGradient(ax, ay, 0, ax, ay, r);
    f.addColorStop(0, `rgba(255,255,255,${(0.95 * a).toFixed(3)})`); f.addColorStop(0.4, `rgba(255,225,130,${(0.6 * a).toFixed(3)})`); f.addColorStop(1, 'rgba(255,190,60,0)');
    ctx.fillStyle = f; ctx.beginPath(); ctx.arc(ax, ay, r, 0, 2 * Math.PI); ctx.fill();
    ctx.strokeStyle = `rgba(255,250,220,${(0.85 * a).toFixed(3)})`; ctx.lineWidth = Math.max(1.5 / z, s * 0.05);
    for(let k = 0; k < 8; k++){ const ang = k * Math.PI / 4 + 0.3, L = s * (0.6 + 1.5 * dest); ctx.beginPath(); ctx.moveTo(ax + Math.cos(ang) * s * 0.3, ay + Math.sin(ang) * s * 0.3); ctx.lineTo(ax + Math.cos(ang) * L, ay + Math.sin(ang) * L); ctx.stroke(); }
    ctx.restore();
  }
  // 4) El polvo dorado: baja en espiral y entra al token.
  if(ms >= 1480 && ms < 2700){
    const az = resuAzar(fx.semilla);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    for(let i = 0; i < 54; i++){
      // (dos hebras que bajan girando, una frente a la otra: se lee como una espiral)
      const sale = 1480 + (i / 54) * 430, dura = 760 + az() * 120, th0 = (i % 2) * Math.PI + i * 0.3 + (az() - 0.5) * 0.5, r0 = R * (1.0 + az() * 0.25), y0 = ay + (az() - 0.5) * s * 0.9, vueltas = 1.5, tam = 0.05 + az() * 0.05;
      const u = (ms - sale) / dura;
      if(u <= 0 || u >= 1) continue;
      const pos = v => { const th = th0 + v * vueltas * 2 * Math.PI, r = r0 * (1 - Math.pow(v, 1.6)); return {x: g.x + Math.cos(th) * r, y: y0 + (g.y - y0) * Math.pow(v, 1.15) + Math.sin(th) * r * 0.3}; };
      const p = pos(u), p0 = pos(Math.max(0, u - 0.05)), a = Math.min(1, u / 0.12) * (1 - Math.pow(u, 6));
      ctx.strokeStyle = i % 4 ? `rgba(255,205,85,${(0.9 * a).toFixed(3)})` : `rgba(255,250,225,${a.toFixed(3)})`;
      ctx.lineWidth = Math.max(1.4 / z, R * tam); ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    }
    ctx.restore();
  }
  // 5) El token se enciende de dorado y vuelve a su color.
  resuEncendido(g, resuFase(ms, 2280, 3000), [255, 205, 85], z);
}

// ————— 🔥 FÉNIX —————
function resuAveTrazo(s, aleteo){   // un ave de frente, con las alas abiertas: cuerpo, cabeza, alas y cola. Camino cerrado por partes.
  ctx.beginPath();
  // la cola: tres plumas largas
  [[-0.42, 1.3], [0, 1.5], [0.42, 1.3]].forEach(([px, py]) => {
    ctx.moveTo(-0.08 * s, 0.3 * s); ctx.quadraticCurveTo((px - 0.16) * s, (py * 0.6) * s, px * s, py * s); ctx.quadraticCurveTo((px + 0.16) * s, (py * 0.6) * s, 0.08 * s, 0.3 * s); ctx.closePath();
  });
  // el cuerpo
  ctx.moveTo(0, -0.5 * s); ctx.bezierCurveTo(0.26 * s, -0.4 * s, 0.24 * s, 0.25 * s, 0, 0.55 * s); ctx.bezierCurveTo(-0.24 * s, 0.25 * s, -0.26 * s, -0.4 * s, 0, -0.5 * s); ctx.closePath();
  // la cabeza, el pico y la cresta
  ctx.moveTo(0.13 * s, -0.62 * s); ctx.arc(0, -0.62 * s, 0.13 * s, 0, 2 * Math.PI); ctx.closePath();
  ctx.moveTo(0.1 * s, -0.68 * s); ctx.lineTo(0.3 * s, -0.6 * s); ctx.lineTo(0.1 * s, -0.55 * s); ctx.closePath();
  ctx.moveTo(-0.06 * s, -0.72 * s); ctx.quadraticCurveTo(-0.2 * s, -0.95 * s, -0.02 * s, -1.02 * s); ctx.quadraticCurveTo(-0.08 * s, -0.86 * s, 0.03 * s, -0.74 * s); ctx.closePath();
  // las alas: el borde de adelante sube y se abre; el de atrás vuelve en plumas
  [-1, 1].forEach(l => {
    ctx.save(); ctx.translate(0.1 * s * l, -0.28 * s); ctx.scale(l, 1); ctx.rotate(aleteo); ctx.scale(s, s);
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(0.45, -0.75, 1.55, -0.72);          // el borde de adelante hasta la punta
    ctx.quadraticCurveTo(1.3, -0.42, 1.22, -0.12);           // pluma 1
    ctx.quadraticCurveTo(1.14, -0.3, 1.0, -0.3); ctx.quadraticCurveTo(0.98, -0.02, 0.9, 0.12);    // pluma 2
    ctx.quadraticCurveTo(0.82, -0.12, 0.7, -0.14); ctx.quadraticCurveTo(0.68, 0.12, 0.58, 0.26);  // pluma 3
    ctx.quadraticCurveTo(0.5, 0.04, 0.38, 0.0); ctx.quadraticCurveTo(0.32, 0.22, 0.14, 0.34);     // pluma 4
    ctx.quadraticCurveTo(0.02, 0.2, 0, 0);
    ctx.closePath();
    ctx.restore();
  });
}
function resuDibujarFenix(fx, g, ms, z){
  const R = g.rad, base = g.y + R * 0.78;
  resuOscuro(g, resuApagado(fx, ms) * resuFxAlfa(fx.a), z);
  // 2) Las cenizas: un montoncito gris con brasitas.
  const cen = resuFase(ms, 700, 950) * (1 - resuFase(ms, 2250, 2600));
  if(cen > 0){
    const az = resuAzar(fx.semilla + 5), cy = g.y + R * 0.42;
    ctx.save(); ctx.globalAlpha = cen;
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(g.x, cy + R * 0.06, R * 0.72, R * 0.16, 0, 0, 2 * Math.PI); ctx.fill();
    [[0, 0, 0.62, 0.46, '#5f5a57'], [-0.3, 0.04, 0.4, 0.3, '#75706c'], [0.32, 0.05, 0.36, 0.26, '#6b6662'], [0.04, -0.1, 0.34, 0.3, '#8a8580']].forEach(([dx, dy, w, h, col]) => {
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(g.x + dx * R, cy + dy * R, w * R, h * R, 0, Math.PI, 2 * Math.PI); ctx.closePath(); ctx.fill();
    });
    for(let i = 0; i < 9; i++){
      const x = g.x + (az() - 0.5) * R * 1.0, y = cy - az() * R * 0.3, tit = 0.5 + 0.5 * Math.sin(ms / (70 + az() * 80) + i);
      ctx.fillStyle = `rgba(255,${130 + Math.round(90 * tit)},40,${(0.35 + 0.65 * tit).toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, Math.max(1.2 / z, R * 0.035), 0, 2 * Math.PI); ctx.fill();
    }
    ctx.restore();
  }
  // 1) La llamarada que lo consume.
  const fu = resuFase(ms, 250, 1050);
  if(fu > 0 && fu < 1){
    const fuerza = Math.pow(Math.sin(Math.PI * fu), 0.6), az = resuAzar(fx.semilla + 11);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const h0 = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, R * 1.6);
    h0.addColorStop(0, `rgba(255,170,50,${(0.55 * fuerza).toFixed(3)})`); h0.addColorStop(1, 'rgba(255,80,0,0)');
    ctx.fillStyle = h0; ctx.beginPath(); ctx.arc(g.x, g.y, R * 1.6, 0, 2 * Math.PI); ctx.fill();
    for(let i = 0; i < 11; i++){
      const bx = g.x + (i / 10 - 0.5) * R * 1.75 + (az() - 0.5) * R * 0.15, w = R * (0.2 + az() * 0.16), f1 = 60 + az() * 70, f2 = az() * 6;
      const centro = 1 - Math.abs(i / 10 - 0.5) * 1.1;
      const h = R * (1.0 + 1.7 * centro) * fuerza * (0.75 + 0.25 * Math.sin(ms / f1 + f2)), mec = Math.sin(ms / (f1 * 1.7) + f2) * R * 0.22;
      const gr = ctx.createLinearGradient(0, base, 0, base - h);
      gr.addColorStop(0, `rgba(255,240,170,${(0.85 * fuerza).toFixed(3)})`); gr.addColorStop(0.35, `rgba(255,170,40,${(0.75 * fuerza).toFixed(3)})`); gr.addColorStop(0.8, `rgba(235,60,15,${(0.5 * fuerza).toFixed(3)})`); gr.addColorStop(1, 'rgba(200,30,0,0)');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(bx - w, base);
      ctx.bezierCurveTo(bx - w * 1.3, base - h * 0.45, bx + mec - w * 0.2, base - h * 0.7, bx + mec, base - h);
      ctx.bezierCurveTo(bx + mec + w * 0.3, base - h * 0.65, bx + w * 1.3, base - h * 0.4, bx + w, base); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  // 3) El ave de fuego: sube desde las cenizas con las alas abiertas, se eleva y se deshace.
  const sube = resuFase(ms, 950, 1850), aAve = resuFase(ms, 950, 1120) * (1 - resuFase(ms, 1720, 2020));
  const s = R * (0.5 + 0.52 * resuSale(sube)), by = g.y + R * 0.1 - R * 2.55 * resuSale(sube);
  if(aAve > 0){
    const aleteo = -0.2 + 0.2 * Math.sin((ms - 950) / 115);
    ctx.save(); ctx.translate(g.x, by);
    ctx.globalCompositeOperation = 'lighter';
    const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 2.1);
    halo.addColorStop(0, `rgba(255,150,40,${(0.5 * aAve).toFixed(3)})`); halo.addColorStop(1, 'rgba(255,60,0,0)');
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(0, 0, s * 2.1, 0, 2 * Math.PI); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowColor = `rgba(255,110,20,${aAve.toFixed(3)})`; ctx.shadowBlur = 26 / z;
    resuAveTrazo(s, aleteo); ctx.fillStyle = `rgba(190,35,8,${aAve.toFixed(3)})`; ctx.fill();
    ctx.shadowBlur = 0;
    const gr = ctx.createRadialGradient(0, -0.1 * s, s * 0.05, 0, -0.1 * s, s * 1.5);
    gr.addColorStop(0, `rgba(255,252,215,${aAve.toFixed(3)})`); gr.addColorStop(0.3, `rgba(255,205,70,${aAve.toFixed(3)})`); gr.addColorStop(0.7, `rgba(255,110,25,${aAve.toFixed(3)})`); gr.addColorStop(1, `rgba(215,40,10,${aAve.toFixed(3)})`);
    ctx.save(); ctx.scale(0.94, 0.94); resuAveTrazo(s, aleteo); ctx.fillStyle = gr; ctx.fill(); ctx.restore();
    ctx.fillStyle = `rgba(60,10,0,${aAve.toFixed(3)})`; ctx.beginPath(); ctx.arc(0.05 * s, -0.64 * s, Math.max(0.8 / z, s * 0.028), 0, 2 * Math.PI); ctx.fill();   // el ojo
    ctx.restore();
    // la estela de fuego que deja al subir
    if(sube < 1){
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const lg = ctx.createLinearGradient(0, by + s, 0, g.y + R * 0.3);
      lg.addColorStop(0, `rgba(255,170,50,${(0.5 * aAve).toFixed(3)})`); lg.addColorStop(1, 'rgba(255,80,0,0)');
      ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(g.x - s * 0.3, by + s); ctx.lineTo(g.x + s * 0.3, by + s); ctx.lineTo(g.x + s * 0.08, g.y + R * 0.3); ctx.lineTo(g.x - s * 0.08, g.y + R * 0.3); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  }
  // 4) Las chispas: salen del ave que se deshace y caen sobre el token.
  if(ms >= 1700 && ms < 2800){
    const az = resuAzar(fx.semilla + 23), byF = g.y + R * 0.1 - R * 2.55, sF = R * 1.02;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    for(let i = 0; i < 60; i++){
      const sale = 1700 + az() * 330, dura = 560 + az() * 320, x0 = g.x + (az() - 0.5) * sF * 3.0, y0 = byF + (az() - 0.5) * sF * 1.5 - Math.abs(x0 - g.x) * 0.25, salto = R * (0.2 + az() * 0.5), xf = g.x + (az() - 0.5) * R * 1.1, yf = g.y + (az() - 0.5) * R * 0.9;
      const u = (ms - sale) / dura;
      if(u <= 0 || u >= 1) continue;
      const pos = v => ({x: x0 + (xf - x0) * resuSuave(v), y: y0 - salto * Math.sin(Math.PI * Math.min(1, v * 2.2)) * (v < 0.45 ? 1 : 0) + (yf - y0) * v * v});
      const p = pos(u), p0 = pos(Math.max(0, u - 0.09)), a = Math.min(1, u / 0.1) * (1 - Math.pow(u, 5));
      ctx.strokeStyle = i % 3 === 0 ? `rgba(255,245,190,${a.toFixed(3)})` : (i % 3 === 1 ? `rgba(255,170,45,${a.toFixed(3)})` : `rgba(255,95,25,${a.toFixed(3)})`);
      ctx.lineWidth = Math.max(1.4 / z, R * (0.045 + 0.04 * (i % 4) / 3)); ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    }
    ctx.restore();
  }
  // 5) El token reaparece con un borde de brasa que se apaga.
  const br = resuFase(ms, 2250, 3300);
  if(br > 0 && br < 1){
    const a = (br < 0.2 ? br / 0.2 : 1 - Math.pow((br - 0.2) / 0.8, 1.6)), tit = 0.8 + 0.2 * Math.sin(ms / 45);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    resuHex(g); ctx.fillStyle = `rgba(255,120,30,${(0.35 * a * (1 - br)).toFixed(3)})`; ctx.fill();
    ctx.shadowColor = `rgba(255,90,10,${a.toFixed(3)})`; ctx.shadowBlur = 20 / z;
    ctx.globalCompositeOperation = 'source-over';
    resuHex(g, 1.03); ctx.strokeStyle = `rgba(${Math.round(255 - 60 * br)},${Math.round(70 + 70 * tit * (1 - br))},15,${Math.min(1, a * 1.25).toFixed(3)})`; ctx.lineWidth = Math.max(2.5 / z, R * 0.17); ctx.stroke();
    ctx.shadowBlur = 0; ctx.globalCompositeOperation = 'lighter';
    resuHex(g, 1.03); ctx.strokeStyle = `rgba(255,200,90,${(0.55 * a * tit * (1 - br)).toFixed(3)})`; ctx.lineWidth = Math.max(1 / z, R * 0.05); ctx.stroke();
    const az = resuAzar(fx.semilla + 41);   // brasitas que suben del borde
    for(let i = 0; i < 12; i++){
      const ang = az() * 2 * Math.PI, v = (br * (1.2 + az()) + az()) % 1;
      const x = g.x + Math.cos(ang) * R * 1.02 + Math.sin(ms / 120 + i) * R * 0.05, y = g.y + Math.sin(ang) * R * 0.95 - v * R * 0.9;
      ctx.fillStyle = `rgba(255,170,60,${(a * (1 - v)).toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, Math.max(1 / z, R * 0.035), 0, 2 * Math.PI); ctx.fill();
    }
    ctx.restore();
  }
}

// ————— 💉 REVIVE —————
function resuCorazon(x, y, s){
  ctx.beginPath(); ctx.moveTo(x, y + s * 0.95);
  ctx.bezierCurveTo(x - s * 1.55, y - s * 0.05, x - s * 0.8, y - s * 1.2, x, y - s * 0.42);
  ctx.bezierCurveTo(x + s * 0.8, y - s * 1.2, x + s * 1.55, y - s * 0.05, x, y + s * 0.95);
  ctx.closePath();
}
function resuFrasco(u, z){   // un frasquito de alto ~2u, centrado: vidrio, líquido rosado que brilla y corcho
  ctx.save(); ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(255,80,130,.9)'; ctx.shadowBlur = 16 / z;
  ctx.beginPath(); ctx.arc(0, 0.32 * u, 0.62 * u, 0, 2 * Math.PI); ctx.fillStyle = 'rgba(235,245,255,.35)'; ctx.fill();
  ctx.shadowBlur = 0;
  ctx.beginPath(); ctx.arc(0, 0.32 * u, 0.62 * u, 0.12 * Math.PI, 0.88 * Math.PI); ctx.closePath(); ctx.fillStyle = 'rgba(255,60,110,.95)'; ctx.fill();   // el líquido
  ctx.beginPath(); ctx.arc(0, 0.32 * u, 0.5 * u, 0.2 * Math.PI, 0.8 * Math.PI); ctx.closePath(); ctx.fillStyle = 'rgba(255,170,195,.9)'; ctx.fill();
  ctx.fillStyle = 'rgba(235,245,255,.4)'; ctx.fillRect(-0.2 * u, -0.72 * u, 0.4 * u, 0.5 * u);                              // el cuello
  ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = Math.max(1.2 / z, u * 0.09);
  ctx.beginPath(); ctx.arc(0, 0.32 * u, 0.62 * u, -0.38 * Math.PI, 1.38 * Math.PI); ctx.lineTo(-0.2 * u, -0.72 * u); ctx.moveTo(0.2 * u, -0.72 * u); ctx.lineTo(0.2 * u, -0.26 * u); ctx.stroke();
  ctx.fillStyle = '#B07A45'; ctx.fillRect(-0.26 * u, -1.0 * u, 0.52 * u, 0.3 * u); ctx.strokeStyle = 'rgba(70,40,15,.9)'; ctx.lineWidth = Math.max(0.8 / z, u * 0.05); ctx.strokeRect(-0.26 * u, -1.0 * u, 0.52 * u, 0.3 * u);   // el corcho
  ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.ellipse(-0.3 * u, 0.14 * u, 0.09 * u, 0.2 * u, 0.5, 0, 2 * Math.PI); ctx.fill();   // el brillo del vidrio
  ctx.restore();
}
function resuDibujarRevive(fx, g, ms, z){
  const R = g.rad, T_ROMPE = 900, L = RESU_LATIDO;
  const p1 = resuPulso(ms, L.uno, L.largoUno), p2 = resuPulso(ms, L.dos, L.largoDos), esc = 1 + 0.13 * p1 + 0.22 * p2;
  const gg = {...g, rad: R * esc};
  resuOscuro(gg, resuApagado(fx, ms), z);
  const choque = {x: g.x, y: g.y - R * 0.55};
  // 1) El frasquito viaja desde quien lo usó (o, sin nadie, el líquido cae desde arriba).
  if(ms >= 220 && ms < T_ROMPE){
    const u = resuFase(ms, 220, T_ROMPE);
    if(fx.de){
      const d = Math.hypot(choque.x - fx.de.x, choque.y - fx.de.y), alto = Math.min(R * 3.2, Math.max(R * 1.3, d * 0.4)), k = resuSuave(u) * 0.35 + u * 0.65;
      const x = fx.de.x + (choque.x - fx.de.x) * k, y = fx.de.y + (choque.y - fx.de.y) * k - alto * Math.sin(Math.PI * k);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';   // la estela
      for(let i = 1; i <= 6; i++){ const kk = Math.max(0, k - i * 0.035), xx = fx.de.x + (choque.x - fx.de.x) * kk, yy = fx.de.y + (choque.y - fx.de.y) * kk - alto * Math.sin(Math.PI * kk);
        ctx.fillStyle = `rgba(255,110,150,${(0.4 * (1 - i / 7)).toFixed(3)})`; ctx.beginPath(); ctx.arc(xx, yy, R * 0.2 * (1 - i / 9), 0, 2 * Math.PI); ctx.fill(); }
      ctx.restore();
      ctx.save(); ctx.translate(x, y); ctx.rotate(k * 4 * Math.PI + 0.3); resuFrasco(R * 0.42, z); ctx.restore();
    }else{
      const az = resuAzar(fx.semilla + 3);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const hasta = g.y - R * 4.2 + (choque.y - (g.y - R * 4.2)) * resuSale(u);
      const lg = ctx.createLinearGradient(0, g.y - R * 4.2, 0, hasta);
      lg.addColorStop(0, 'rgba(255,90,140,0)'); lg.addColorStop(1, 'rgba(255,150,185,.9)');
      ctx.strokeStyle = lg; ctx.lineCap = 'round'; ctx.lineWidth = R * 0.2; ctx.beginPath(); ctx.moveTo(g.x, g.y - R * 4.2); ctx.lineTo(g.x, hasta); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,240,245,.8)'; ctx.lineWidth = R * 0.07; ctx.beginPath(); ctx.moveTo(g.x, hasta - R * 0.9); ctx.lineTo(g.x, hasta); ctx.stroke();
      for(let i = 0; i < 6; i++){ const v = (u * 1.4 + az()) % 1, x = g.x + (az() - 0.5) * R * 0.5, y = g.y - R * 4.2 + (choque.y - (g.y - R * 4.2)) * v;
        ctx.fillStyle = 'rgba(255,170,200,.8)'; ctx.beginPath(); ctx.arc(x, y, R * 0.06, 0, 2 * Math.PI); ctx.fill(); }
      ctx.restore();
    }
  }
  // 2) Se rompe: vidrios y salpicón.
  const rompe = resuFase(ms, T_ROMPE, T_ROMPE + 420);
  if(rompe > 0 && rompe < 1){
    const az = resuAzar(fx.semilla + 7), a = 1 - rompe;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const f = ctx.createRadialGradient(choque.x, choque.y, 0, choque.x, choque.y, R * (0.6 + rompe));
    f.addColorStop(0, `rgba(255,255,255,${(0.8 * a).toFixed(3)})`); f.addColorStop(0.5, `rgba(255,120,160,${(0.45 * a).toFixed(3)})`); f.addColorStop(1, 'rgba(255,60,110,0)');
    ctx.fillStyle = f; ctx.beginPath(); ctx.arc(choque.x, choque.y, R * (0.6 + rompe), 0, 2 * Math.PI); ctx.fill();
    for(let i = 0; i < 16; i++){
      const ang = -Math.PI * (0.05 + 0.9 * az()), vel = R * (0.6 + az() * 1.0), d = vel * resuSale(rompe), x = choque.x + Math.cos(ang) * d, y = choque.y + Math.sin(ang) * d + R * 0.9 * rompe * rompe;
      if(fx.de && i % 2 === 0){   // un vidrio
        ctx.globalCompositeOperation = 'source-over'; ctx.save(); ctx.translate(x, y); ctx.rotate(az() * 6 + rompe * 5); ctx.fillStyle = `rgba(235,248,255,${(0.9 * a).toFixed(3)})`;
        const t = R * (0.07 + az() * 0.07); ctx.beginPath(); ctx.moveTo(-t, t * 0.6); ctx.lineTo(t, t * 0.4); ctx.lineTo(0, -t); ctx.closePath(); ctx.fill(); ctx.restore();
      }else{ az(); az(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,110,155,${a.toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, R * 0.06, 0, 2 * Math.PI); ctx.fill(); }
    }
    ctx.restore();
  }
  // 3) El líquido llena el token de abajo hacia arriba, como un vaso.
  const lleno = resuSuave(resuFase(ms, T_ROMPE + 40, 1880)), aLiq = 1 - resuFase(ms, L.dos + 60, L.dos + 300);
  if(lleno > 0 && aLiq > 0){
    const alto = gg.rad * 0.9, abajo = gg.y + alto, nivel = abajo - lleno * alto * 2.08;
    ctx.save(); resuHex(gg, 0.985); ctx.clip();
    const gr = ctx.createLinearGradient(0, abajo, 0, gg.y - alto);
    gr.addColorStop(0, `rgba(190,15,60,${(0.9 * aLiq).toFixed(3)})`); gr.addColorStop(0.6, `rgba(245,55,105,${(0.86 * aLiq).toFixed(3)})`); gr.addColorStop(1, `rgba(255,135,170,${(0.84 * aLiq).toFixed(3)})`);
    const onda = x => nivel + Math.sin((x - gg.x) / (gg.rad * 0.24) + ms / 110) * gg.rad * 0.05 * (1 - lleno * 0.6) + Math.sin((x - gg.x) / (gg.rad * 0.47) - ms / 170) * gg.rad * 0.035;
    ctx.beginPath(); ctx.moveTo(gg.x - gg.rad * 1.1, abajo + 2);
    for(let i = 0; i <= 22; i++){ const x = gg.x - gg.rad * 1.1 + gg.rad * 2.2 * i / 22; ctx.lineTo(x, onda(x)); }
    ctx.lineTo(gg.x + gg.rad * 1.1, abajo + 2); ctx.closePath(); ctx.fillStyle = gr; ctx.fill();
    ctx.beginPath(); for(let i = 0; i <= 22; i++){ const x = gg.x - gg.rad * 1.1 + gg.rad * 2.2 * i / 22; if(i) ctx.lineTo(x, onda(x)); else ctx.moveTo(x, onda(x)); }
    ctx.strokeStyle = `rgba(255,235,242,${(0.95 * aLiq).toFixed(3)})`; ctx.lineWidth = Math.max(1.5 / z, gg.rad * 0.06); ctx.stroke();
    const az = resuAzar(fx.semilla + 13);   // burbujas
    for(let i = 0; i < 12; i++){
      const x = gg.x + (az() - 0.5) * gg.rad * 1.5, v = (ms / (700 + az() * 600) + az()) % 1, y = abajo - v * (abajo - nivel), r = gg.rad * (0.03 + az() * 0.045);
      if(y < nivel + r) continue;
      ctx.strokeStyle = `rgba(255,225,235,${(0.8 * aLiq).toFixed(3)})`; ctx.lineWidth = Math.max(1 / z, gg.rad * 0.02); ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.stroke();
    }
    ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'lighter';   // el brillo del líquido alrededor
    resuHex(gg, 1.02); ctx.shadowColor = 'rgba(255,70,120,.9)'; ctx.shadowBlur = 18 / z; ctx.strokeStyle = `rgba(255,120,160,${(0.55 * lleno * aLiq).toFixed(3)})`; ctx.lineWidth = Math.max(1.5 / z, gg.rad * 0.06); ctx.stroke();
    ctx.restore();
  }
  // 4) El corazón: aparece cuando el líquido llega arriba y late dos veces, tu-tum. Con el segundo latido, queda de pie.
  const aCor = resuFase(ms, 1780, 1960) * (1 - resuFase(ms, L.dos + 200, L.dos + 560));
  if(aCor > 0){
    const s = R * 0.5 * (1 + 0.3 * p1 + 0.52 * p2) * (0.8 + 0.2 * resuSale(resuFase(ms, 1780, 1960))) * (1 + 0.5 * resuFase(ms, L.dos + 200, L.dos + 560));
    const cy = g.y - s * 0.02;
    ctx.save();
    ctx.shadowColor = `rgba(255,30,70,${aCor.toFixed(3)})`; ctx.shadowBlur = (16 + 26 * (p1 + p2)) / z;
    resuCorazon(g.x, cy, s); ctx.fillStyle = `rgba(120,0,25,${aCor.toFixed(3)})`; ctx.fill();
    ctx.shadowBlur = 0;
    const gr = ctx.createRadialGradient(g.x - s * 0.3, cy - s * 0.4, s * 0.05, g.x, cy, s * 1.3);
    gr.addColorStop(0, `rgba(255,${Math.round(150 + 80 * (p1 + p2))},${Math.round(160 + 70 * (p1 + p2))},${aCor.toFixed(3)})`); gr.addColorStop(0.45, `rgba(240,30,70,${aCor.toFixed(3)})`); gr.addColorStop(1, `rgba(165,0,35,${aCor.toFixed(3)})`);
    resuCorazon(g.x, cy, s * 0.9); ctx.fillStyle = gr; ctx.fill();
    ctx.fillStyle = `rgba(255,255,255,${(0.75 * aCor).toFixed(3)})`; ctx.beginPath(); ctx.ellipse(g.x - s * 0.42, cy - s * 0.42, s * 0.16, s * 0.09, -0.6, 0, 2 * Math.PI); ctx.fill();
    ctx.restore();
  }
  // Con cada latido, una onda que sale del token (la segunda, más grande y más clara).
  [[L.uno, 430, 0.75, 0.75], [L.dos, 620, 1.35, 1]].forEach(([t0, dur, largo, fuerza]) => {
    const u = (ms - t0 - 40) / dur;
    if(u <= 0 || u >= 1) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    resuHex(g, 1.05 + largo * resuSale(u)); ctx.strokeStyle = `rgba(255,${fuerza === 1 ? 170 : 110},${fuerza === 1 ? 190 : 150},${(0.95 * fuerza * (1 - u)).toFixed(3)})`;
    ctx.shadowColor = 'rgba(255,60,110,.9)'; ctx.shadowBlur = 14 / z; ctx.lineWidth = Math.max(2 / z, R * 0.13 * (1 - u) * (0.7 + 0.3 * fuerza)); ctx.stroke();
    ctx.restore();
  });
  if(p2 > 0 || (ms > L.dos && ms < L.dos + 520)){   // el destello del segundo latido: «arranca»
    const u = resuFase(ms, L.dos + 40, L.dos + 520), a = u < 0.2 ? u / 0.2 : 1 - (u - 0.2) / 0.8;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    resuHex(gg); ctx.fillStyle = `rgba(255,215,225,${(0.6 * a).toFixed(3)})`; ctx.fill();
    ctx.restore();
  }
}

// ————— 😇 PACTO —————
// Los símbolos del círculo: trazos chicos (en un cuadrito de −1 a 1), a mano.
const RESU_RUNAS = [
  [[[-0.5, 1], [0, -1], [0.5, 1]], [[-0.3, 0.2], [0.3, 0.2]]],
  [[[0, -1], [0, 1]], [[-0.6, -0.4], [0, -1], [0.6, -0.4]]],
  [[[-0.5, -1], [0.5, -0.2], [-0.5, 0.4], [0.5, 1]]],
  [[[-0.6, -1], [0.6, 1]], [[0.6, -1], [-0.6, 1]], [[-0.6, 0], [0.6, 0]]],
  [[[0, -1], [0, 1]], [[0, -0.2], [0.6, -0.8]], [[0, 0.3], [0.6, -0.3]]],
  [[[-0.5, 1], [-0.5, -1], [0.5, -0.3], [-0.5, 0.2]]],
  [[[-0.6, -0.6], [0, 0.2], [0.6, -0.6]], [[0, 0.2], [0, 1]]],
  [[[0, -1], [0.6, 0], [0, 1], [-0.6, 0], [0, -1]]],
];
function resuTrazoParcial(pts, u){   // dibuja una poligonal hasta la fracción u (0–1) de sus tramos
  if(u <= 0) return;
  const n = pts.length - 1, hasta = u * n;
  ctx.moveTo(pts[0][0], pts[0][1]);
  for(let i = 1; i <= n; i++){
    if(i <= hasta) ctx.lineTo(pts[i][0], pts[i][1]);
    else{ const f = hasta - (i - 1); if(f > 0) ctx.lineTo(pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f); break; }
  }
}
const resuPactoRadio = rad => rad * 2.0;
// El borde por donde se va quemando (irregular, como papel): radio para cada ángulo.
function resuPactoBorde(fx, ms, C){
  const q = Math.pow(resuFase(ms, 1980, 2900), 1.25);
  return ang => C * 1.12 * (1 - q) * (1 + 0.07 * Math.sin(ang * 5 + fx.semilla % 7) + 0.05 * Math.sin(ang * 11 - ms / 140) + 0.03 * Math.sin(ang * 17 + ms / 90));
}
// En el piso, debajo de los tokens: el círculo que se dibuja trazo por trazo (y se quema de afuera hacia adentro).
function resuDibujarPactoPiso(fx, g, ms, z){
  if(ms < 220 || ms >= RESU_DUR.pacto) return;
  const R = g.rad, C = resuPactoRadio(R), quema = ms >= 1980, borde = resuPactoBorde(fx, ms, C);
  const late = 0.82 + 0.18 * Math.sin(ms / 95), cargado = resuFase(ms, 1200, 1500);
  ctx.save(); ctx.translate(g.x, g.y);
  if(quema){   // solo queda lo de adentro del borde que avanza
    ctx.beginPath(); for(let i = 0; i <= 72; i++){ const a = i / 72 * 2 * Math.PI, r = borde(a); if(i) ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); else ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
    ctx.closePath(); ctx.clip();
  }
  // el piso oscurecido adentro del círculo
  const som = resuFase(ms, 300, 1100);
  const sg = ctx.createRadialGradient(0, 0, C * 0.2, 0, 0, C);
  sg.addColorStop(0, `rgba(40,0,45,${(0.5 * som).toFixed(3)})`); sg.addColorStop(0.85, `rgba(25,0,25,${(0.42 * som).toFixed(3)})`); sg.addColorStop(1, 'rgba(20,0,20,0)');
  ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(0, 0, C * 1.02, 0, 2 * Math.PI); ctx.fill();
  const pintar = (trazar, ancho) => {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.shadowColor = `rgba(170,60,255,${(0.9 * late).toFixed(3)})`; ctx.shadowBlur = (10 + 14 * cargado) / z;
    ctx.beginPath(); trazar(); ctx.strokeStyle = `rgba(${Math.round(205 + 50 * cargado)},${Math.round(35 + 60 * cargado)},${Math.round(75 + 60 * cargado)},${late.toFixed(3)})`; ctx.lineWidth = Math.max(1.6 / z, R * ancho); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.beginPath(); trazar(); ctx.strokeStyle = `rgba(255,200,215,${(0.55 * late).toFixed(3)})`; ctx.lineWidth = Math.max(0.7 / z, R * ancho * 0.3); ctx.stroke();
  };
  // el círculo de afuera y el de adentro (uno para cada lado)
  const u1 = resuFase(ms, 250, 640), u2 = resuFase(ms, 430, 800);
  if(u1 > 0) pintar(() => ctx.arc(0, 0, C, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * resuSuave(u1)), 0.1);
  if(u2 > 0) pintar(() => ctx.arc(0, 0, C * 0.74, Math.PI / 2, Math.PI / 2 - 2 * Math.PI * resuSuave(u2), true), 0.075);
  // la estrella de cinco puntas, línea por línea
  const P = k => { const a = -Math.PI / 2 + k * 2 * Math.PI / 5; return [Math.cos(a) * C * 0.74, Math.sin(a) * C * 0.74]; };
  for(let i = 0; i < 5; i++){
    const u = resuFase(ms, 640 + i * 105, 640 + i * 105 + 150);
    if(u > 0) pintar(() => resuTrazoParcial([P(i * 2), P(i * 2 + 2)], u), 0.07);
  }
  // los símbolos entre los dos círculos, de a uno
  const az = resuAzar(fx.semilla + 17);
  for(let i = 0; i < 10; i++){
    const runa = RESU_RUNAS[Math.floor(az() * RESU_RUNAS.length) % RESU_RUNAS.length], u = resuFase(ms, 760 + i * 52, 760 + i * 52 + 170);
    if(u <= 0) continue;
    const a = -Math.PI / 2 + (i + 0.5) * 2 * Math.PI / 10, t = C * 0.095;
    ctx.save(); ctx.translate(Math.cos(a) * C * 0.87, Math.sin(a) * C * 0.87); ctx.rotate(a + Math.PI / 2); ctx.scale(t, t);
    const R0 = R / t;   // (pintar usa R para el ancho: acá la escala cambió)
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); runa.forEach((tr, j) => resuTrazoParcial(tr, resuCl(u * runa.length - j)));
    ctx.shadowColor = `rgba(170,60,255,${(0.9 * late).toFixed(3)})`; ctx.shadowBlur = 8 / z;
    ctx.strokeStyle = `rgba(${Math.round(215 + 40 * cargado)},${Math.round(45 + 70 * cargado)},${Math.round(85 + 60 * cargado)},${late.toFixed(3)})`; ctx.lineWidth = Math.max(1.3 / z / t, R0 * 0.055); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
  // el borde encendido del papel que se quema, y sus brasitas
  if(quema){
    const q = resuFase(ms, 1980, 2900), a = Math.min(1, q / 0.08) * (1 - Math.pow(q, 6));
    ctx.save(); ctx.translate(g.x, g.y); ctx.globalCompositeOperation = 'lighter';
    ctx.beginPath(); for(let i = 0; i <= 72; i++){ const an = i / 72 * 2 * Math.PI, r = borde(an); if(i) ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r); else ctx.moveTo(Math.cos(an) * r, Math.sin(an) * r); }
    ctx.closePath();
    ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = `rgba(35,18,10,${(0.8 * a).toFixed(3)})`; ctx.lineWidth = Math.max(4 / z, R * 0.3); ctx.stroke();   // lo chamuscado
    ctx.globalCompositeOperation = 'lighter';
    ctx.shadowColor = `rgba(255,90,20,${a.toFixed(3)})`; ctx.shadowBlur = 16 / z;
    ctx.strokeStyle = `rgba(255,140,40,${a.toFixed(3)})`; ctx.lineWidth = Math.max(2.5 / z, R * 0.13); ctx.stroke();
    ctx.shadowBlur = 0; ctx.strokeStyle = `rgba(255,240,190,${(0.9 * a).toFixed(3)})`; ctx.lineWidth = Math.max(1 / z, R * 0.04); ctx.stroke();
    const az2 = resuAzar(fx.semilla + 29);
    for(let i = 0; i < 26; i++){
      const an = az2() * 2 * Math.PI, nace = az2() * 0.85, vida = 0.18 + az2() * 0.2, v = (q - nace) / vida;
      if(v <= 0 || v >= 1) continue;
      const r0 = C * 1.12 * (1 - Math.pow(nace, 1.25)), x = Math.cos(an) * r0 + Math.sin(v * 5 + i) * R * 0.08, y = Math.sin(an) * r0 - v * R * 0.9;
      ctx.fillStyle = i % 3 ? `rgba(255,150,50,${(1 - v).toFixed(3)})` : `rgba(120,110,105,${(0.8 * (1 - v)).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(x, y, Math.max(1 / z, R * 0.04 * (1 - v * 0.5)), 0, 2 * Math.PI); ctx.fill();
    }
    ctx.restore();
  }
}
// Encima de los tokens: la columna de luz oscura que sube desde el círculo.
function resuDibujarPacto(fx, g0, ms, z){
  const R = g0.rad, C = resuPactoRadio(R);
  const pos = resuFxPosToken(fx.a), g = g0;   // (g ya viene de la posición dibujada, que incluye el levantarse)
  const base = {x: g.x, y: g.y - (pos ? pos.dy : 0)};   // el centro del círculo no se mueve con el token
  resuOscuro(g, resuApagado(fx, ms), z);
  const crece = resuSale(resuFase(ms, 1250, 1680)), aCol = resuFase(ms, 1250, 1400) * (1 - resuFase(ms, 2050, 2480));
  if(aCol > 0){
    const H = R * 6.2 * crece, W = C * 0.86, arriba = base.y - H, az = resuAzar(fx.semilla + 31);
    const vib = 1 + 0.03 * Math.sin(ms / 40);
    ctx.save();
    // el cuerpo oscuro de la columna
    const cuerpo = ctx.createLinearGradient(0, base.y, 0, arriba);
    cuerpo.addColorStop(0, `rgba(30,0,40,${(0.72 * aCol).toFixed(3)})`); cuerpo.addColorStop(0.6, `rgba(45,0,35,${(0.5 * aCol).toFixed(3)})`); cuerpo.addColorStop(1, 'rgba(40,0,40,0)');
    ctx.fillStyle = cuerpo; ctx.beginPath(); ctx.moveTo(base.x - W * vib, base.y); ctx.lineTo(base.x - W * 0.8 * vib, arriba); ctx.lineTo(base.x + W * 0.8 * vib, arriba); ctx.lineTo(base.x + W * vib, base.y);
    ctx.ellipse(base.x, base.y, W * vib, W * 0.3, 0, 0, Math.PI); ctx.closePath(); ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    // los bordes que brillan: violeta de un lado, rojo del otro, y un velo en el medio
    [[-1, '150,60,255'], [1, '225,35,75']].forEach(([l, col]) => {
      const lg = ctx.createLinearGradient(0, base.y, 0, arriba);
      lg.addColorStop(0, `rgba(${col},${(0.95 * aCol).toFixed(3)})`); lg.addColorStop(0.7, `rgba(${col},${(0.45 * aCol).toFixed(3)})`); lg.addColorStop(1, `rgba(${col},0)`);
      ctx.strokeStyle = lg; ctx.shadowColor = `rgba(${col},.9)`; ctx.shadowBlur = 18 / z; ctx.lineWidth = Math.max(2 / z, R * 0.13);
      ctx.beginPath(); ctx.moveTo(base.x + l * W * vib, base.y); ctx.lineTo(base.x + l * W * 0.8 * vib, arriba); ctx.stroke();
    });
    ctx.shadowBlur = 0;
    for(let k = 0; k < 14; k++){   // el velo de adentro, en franjas que se apagan hacia arriba
      const v0 = k / 14, v1 = (k + 1) / 14, af = aCol * Math.pow(1 - v0, 1.4), y0 = base.y - H * v0, y1 = base.y - H * v1, w0 = W * (1 - 0.2 * v0), w1 = W * (1 - 0.2 * v1);
      const velo = ctx.createLinearGradient(base.x - W, 0, base.x + W, 0);
      velo.addColorStop(0, `rgba(150,60,255,${(0.36 * af).toFixed(3)})`); velo.addColorStop(0.5, `rgba(90,10,90,${(0.1 * af).toFixed(3)})`); velo.addColorStop(1, `rgba(225,35,75,${(0.36 * af).toFixed(3)})`);
      ctx.fillStyle = velo; ctx.beginPath(); ctx.moveTo(base.x - w0, y0 + 0.5); ctx.lineTo(base.x - w1, y1); ctx.lineTo(base.x + w1, y1); ctx.lineTo(base.x + w0, y0 + 0.5); ctx.closePath(); ctx.fill();
    }
    // rayas de luz que suben por adentro
    ctx.lineCap = 'round';
    for(let i = 0; i < 16; i++){
      const x = base.x + (az() - 0.5) * W * 1.7, vel = 380 + az() * 420, v = ((ms - 1250) / vel + az()) % 1, largo = R * (0.5 + az() * 0.9), y = base.y - v * H;
      if(y - largo < arriba) continue;
      ctx.strokeStyle = i % 2 ? `rgba(200,140,255,${(0.75 * aCol * (1 - v)).toFixed(3)})` : `rgba(255,110,140,${(0.75 * aCol * (1 - v)).toFixed(3)})`;
      ctx.lineWidth = Math.max(1.2 / z, R * 0.05); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - largo); ctx.stroke();
    }
    // el anillo de la base, encendido
    ctx.strokeStyle = `rgba(255,170,220,${(0.8 * aCol).toFixed(3)})`; ctx.lineWidth = Math.max(1.5 / z, R * 0.06); ctx.beginPath(); ctx.ellipse(base.x, base.y, W * vib, W * 0.3, 0, 0, 2 * Math.PI); ctx.stroke();
    ctx.restore();
  }
  // el token se enciende al levantarse
  resuEncendido(g, resuFase(ms, 1650, 2350), [170, 70, 235], z, 0.62);
}

// ————— La corta (otra vía de volver, o «reducir movimiento») —————
function resuDibujarCorta(fx, g, ms, z){
  resuOscuro(g, resuApagado(fx, ms), z);
  const col = {ankh: [255, 205, 85], llama: [255, 130, 40], revive: [255, 110, 155], pacto: [190, 80, 255]}[fx.forma] || [255, 240, 200];
  resuEncendido(g, resuFase(ms, 250, RESU_DUR.corta), col, z);
}

// js/05, DEBAJO de los tokens: lo que va en el piso (el círculo del Pacto).
function resuFxDibujarPiso(z){
  if(!RESU_FX.length) return false;
  const ahora = performance.now();
  RESU_FX.forEach(fx => {
    if(fx.corta || fx.forma !== 'pacto') return;
    const g = resuGeo(fx.a); if(!g || !resuFxVe(g.t)) return;
    const pos = resuFxPosToken(fx.a);
    try{ resuDibujarPactoPiso(fx, {...g, y: g.y - (pos ? pos.dy : 0)}, ahora - fx.t0, z); }catch(err){ console.error('Resurrección (piso):', err); }
  });
  return true;
}
// js/05, ENCIMA de los tokens: todo lo demás.
function dibujarEfectosResu(z){
  if(!RESU_FX.length) return false;
  const ahora = performance.now();
  for(let i = RESU_FX.length - 1; i >= 0; i--){
    const fx = RESU_FX[i], ms = ahora - fx.t0;
    if(ms >= resuFxDur(fx)){ RESU_FX.splice(i, 1); continue; }
    const g = resuGeo(fx.a);
    if(!g || !resuFxVe(g.t)) continue;
    ctx.save();
    try{
      if(ms < 0) resuOscuro(g, 1, z);
      else if(fx.corta) resuDibujarCorta(fx, g, ms, z);
      else if(fx.forma === 'ankh') resuDibujarAnkh(fx, g, ms, z);
      else if(fx.forma === 'llama') resuDibujarFenix(fx, g, ms, z);
      else if(fx.forma === 'revive') resuDibujarRevive(fx, g, ms, z);
      else if(fx.forma === 'pacto') resuDibujarPacto(fx, g, ms, z);
    }catch(err){ console.error('Resurrección (animación):', err); }
    ctx.restore();
  }
  return RESU_FX.length > 0;
}

// Los carteles esperan a que termine (js/16, momentoAvisoCentro): un aviso al centro que llega mientras se ve una resurrección (o que la cuenta y
// llegó un instante antes que ella) sale cuando la animación terminó. → true si lo dejó para después.
function resuFxAvisoEspera(id, d, espera){
  const n = num(espera);
  if(n > 40) return false;   // (10 s como mucho)
  const deVolver = !!d && d.tipo === 'buff' && /^(☥|✚|😇|🔥)/.test(String(d.icono || ''));
  if(resuFxOcupado() || (deVolver && n < 2)){ setTimeout(() => momentoAvisoCentro(id, d, n + 1), 250); return true; }
  return false;
}

// Otra vía de volver: alguien que esta pantalla veía caído y ahora vive, sin que haya llegado una animación para él → el resplandor corto.
const resuCaidos = new Map();   // tokenId → true (lo vi caído)
setInterval(() => {
  try{
    if(typeof tokens === 'undefined' || typeof estadoDe !== 'function') return;
    const ahora = Date.now();
    tokens.forEach((t, id) => {
      const est = estadoDe(t);
      if(!est) return;
      if(est.muerto){ resuCaidos.set(id, ahora); return; }
      if(!resuCaidos.has(id)) return;
      const desde = resuCaidos.get(id);
      if(typeof desde === 'number'){ resuCaidos.set(id, {vivo: ahora}); return; }   // recién lo veo vivo: le doy un rato a que llegue su animación
      if(ahora - desde.vivo < 1400) return;
      resuCaidos.delete(id);
      if(ahora - (resuFxUltimo.get(id) || 0) < 9000) return;   // ya tuvo la suya
      if(est.dormida) return;
      resuFxEmpezar({a: id, forma: 'otra', semilla: 1});
    });
    resuCaidos.forEach((v, id) => { if(!tokens.has(id)) resuCaidos.delete(id); });
  }catch(e){}
}, 450);
