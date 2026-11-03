/* 💥 La animación del Shockwave (2026-11-03, dueño: «me gustaría que también tuviera algún tipo de animación acorde», después de la de la
   Transfusión). La geometría está en comun/fx-onda.js; acá se publica y se dibuja, con el mismo camino que la Transfusión (js/92):
   - al lanzar la onda (js/13, dueloElegirAreaMapa) quien la usa publica un momento 'onda' ({de, radio, semilla}): todas las pantallas ven el
     golpe al piso — un anillo que sale hasta pasar las casillas de al lado, el borde de esas casillas que se enciende, polvo y piedritas que
     saltan, y una sacudida corta del mapa (nada con «reducir movimiento»). Queda su tarjeta en la Crónica;
   - cuando cada rival resuelve su resistencia (el GM, js/13 dueloGrupoResuelto) se publica 'onda-golpe' ({a, cayo}), sin tarjeta: sobre el
     que no la resistió, un golpe y estrellitas girando sobre la cabeza un rato; sobre el que la resistió, un destello chico.
   Dibuja en coordenadas del mapa (respeta zoom y paneo), sigue al token si se mueve, no toca clics y no hace nada si no hay ninguna en curso.
   Si el token no se ve en esta pantalla (oculto, niebla, sigilo) no se dibuja. Pieza pensada para cualquier «onda alrededor» (Pisotón, Onda de
   choque, Nova arcana); hoy solo la usa el Shockwave (`ondaFxEs`). */
const ONDA_FX = [];      // {de, t0, semilla, radio, dur, poco, piedras}
const ONDA_GOLPES = [];  // {a, t0, cayo, dur, poco}
const ondaFxVistos = new Set();
const ondaPocoMovimiento = () => { try{ return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } };
// ¿Esta habilidad lleva la animación? Por ahora, el Shockwave (o lo que traiga `fxOnda`).
const ondaFxEs = hab => !!hab && (!!hab.fxOnda || /shockwave/i.test(String(hab.nombre || '')));
const ondaFxVe = t => !!t && (!t.oculto || soyGM) && (typeof tokenVisiblePorNiebla !== 'function' || tokenVisiblePorNiebla(t));

// La publica quien lanza la onda. Si el momento no se puede publicar, la ve al menos esta pantalla.
async function ondaFxPublicar(deId, radio, titulo){
  if(!deId) return;
  const semilla = Math.floor(Math.random() * 1e9), r = Math.max(1, Math.round(num(radio)) || 1);
  const id = typeof momentoAbrir === 'function'
    ? await momentoAbrir({tipo: 'onda', icono: '💥', titulo: String(titulo || 'Shockwave'), estado: 'listo', datos: {de: deId, radio: r, semilla}})
    : null;
  if(!id) ondaFxEmpezar(deId, r, semilla);
}
// El resultado de cada rival (lo publica el GM al resolverse su sub-duelo): cayó (no lo resistió) o no.
async function ondaFxGolpePublicar(aId, cayo){
  if(!aId) return;
  const id = typeof momentoAbrir === 'function' ? await momentoAbrir({tipo: 'onda-golpe', icono: '', titulo: '', estado: 'listo', datos: {a: aId, cayo: !!cayo}}) : null;
  if(!id) ondaFxGolpe(aId, !!cayo);
}
// Llegan a cada pantalla (js/16, momentoRecibido). Una sola vez por momento, y solo si son de recién.
const ondaFxReciente = d => { const t = d.creado && d.creado.toMillis ? d.creado.toMillis() : Date.now(); return Date.now() - t < 20000; };
function ondaFxRecibido(id, d){
  if(!d || !d.datos || ondaFxVistos.has(id)) return;
  ondaFxVistos.add(id);
  if(!ondaFxReciente(d)) return;
  ondaFxEmpezar(d.datos.de, num(d.datos.radio) || 1, num(d.datos.semilla) || 1);
}
function ondaFxGolpeRecibido(id, d){
  if(!d || !d.datos || ondaFxVistos.has(id)) return;
  ondaFxVistos.add(id);
  if(!ondaFxReciente(d)) return;
  ondaFxGolpe(d.datos.a, !!d.datos.cayo);
}
function ondaFxEmpezar(de, radio, semilla){
  if(typeof FxOnda === 'undefined' || !tokens.get(de)) return;
  const poco = ondaPocoMovimiento();
  ONDA_FX.push({de, radio, semilla, t0: performance.now(), dur: poco ? 900 : FxOnda.DURACION, poco, piedras: FxOnda.piedras(semilla, poco ? 0 : 26)});
  if(!poco && ondaFxVe(tokens.get(de))) ondaSacudir(semilla);
  pedirDibujo();
}
function ondaFxGolpe(a, cayo){
  if(typeof FxOnda === 'undefined' || !tokens.get(a)) return;
  const poco = ondaPocoMovimiento();
  ONDA_GOLPES.push({a, cayo, t0: performance.now(), dur: cayo ? (poco ? 1200 : FxOnda.PAJARITOS_MS) : 700, poco});
  pedirDibujo();
}
// La sacudida: el lienzo se mueve unos píxeles un instante (con CSS: no toca las coordenadas del mapa ni los clics).
function ondaSacudir(semilla){
  const el = document.getElementById('lienzo');
  if(!el || !el.animate) return;
  const cuadros = [];
  for(let ms = 0; ms <= 350; ms += 35){ const s = FxOnda.sacudida(ms, semilla, 5); cuadros.push({transform: `translate(${s.dx.toFixed(1)}px, ${s.dy.toFixed(1)}px)`}); }
  try{ el.animate(cuadros, {duration: 350, easing: 'linear'}); }catch(e){}
}

// El dibujo (js/05, encima del piso, con los otros efectos). true mientras quede alguna en curso.
function dibujarEfectosOnda(z){
  if(!ONDA_FX.length && !ONDA_GOLPES.length) return false;
  const ahora = performance.now();
  for(let i = ONDA_FX.length - 1; i >= 0; i--){
    const fx = ONDA_FX[i], ms = ahora - fx.t0;
    if(ms < 0) continue;
    if(ms >= fx.dur){ ONDA_FX.splice(i, 1); continue; }
    const t = tokens.get(fx.de);
    if(!ondaFxVe(t)) continue;
    ondaFxDibujarUna(fx, hexCentro(t.col, t.fila), ms, z);
  }
  for(let i = ONDA_GOLPES.length - 1; i >= 0; i--){
    const g = ONDA_GOLPES[i], ms = ahora - g.t0;
    if(ms < 0) continue;   // (todavía no empezó)
    if(ms >= g.dur){ ONDA_GOLPES.splice(i, 1); continue; }
    const t = tokens.get(g.a);
    if(!ondaFxVe(t)) continue;
    ondaFxDibujarGolpe(g, hexCentro(t.col, t.fila), ms, z);
  }
  return ONDA_FX.length > 0 || ONDA_GOLPES.length > 0;
}
// Un hexágono «de lado arriba» (como los del mapa) de radio r alrededor de c.
function ondaHexPath(c, r){
  ctx.beginPath();
  for(let k = 0; k < 6; k++){ const a = k * Math.PI / 3; const x = c.x + r * Math.cos(a), y = c.y + r * Math.sin(a); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.closePath();
}
function ondaFxDibujarUna(fx, C, ms, z){
  const F = FxOnda, p = Math.min(1, ms / fx.dur);
  // Hasta dónde llega: pasa el borde de afuera de las casillas de al lado (radio 1) — o las del radio que tenga.
  const alcance = HEX * (SQ3 * fx.radio + 0.9);
  const R = alcance * F.anillo(p), fade = 1 - Math.pow(p, 1.6);
  ctx.save();
  // El golpe al piso: un fogonazo terroso en el centro, al principio.
  if(ms < 260){
    const k = ms / 260, g = ctx.createRadialGradient(C.x, C.y, 0, C.x, C.y, HEX * 1.1);
    g.addColorStop(0, `rgba(255,236,200,${0.65 * (1 - k)})`); g.addColorStop(1, 'rgba(200,150,90,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(C.x, C.y, HEX * 1.1, 0, 2 * Math.PI); ctx.fill();
  }
  // El polvo que levanta el anillo (una banda ancha y suave detrás del frente).
  const banda = ctx.createRadialGradient(C.x, C.y, Math.max(0, R - HEX * 1.1), C.x, C.y, R + HEX * 0.15);
  banda.addColorStop(0, 'rgba(230,190,140,0)'); banda.addColorStop(0.7, `rgba(235,195,145,${0.35 * fade})`); banda.addColorStop(0.92, `rgba(255,225,180,${0.55 * fade})`); banda.addColorStop(1, 'rgba(255,225,180,0)');
  ctx.fillStyle = banda; ctx.beginPath(); ctx.arc(C.x, C.y, R + HEX * 0.15, 0, 2 * Math.PI); ctx.fill();
  // El frente de la onda: un anillo que brilla (se suma a lo de abajo), más fino a medida que se aleja.
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineWidth = Math.max(2 / z, HEX * 0.22 * (1 - p * 0.6));
  ctx.strokeStyle = `rgba(255,170,70,${0.55 * fade})`; ctx.beginPath(); ctx.arc(C.x, C.y, R, 0, 2 * Math.PI); ctx.stroke();
  ctx.lineWidth = Math.max(1.5 / z, HEX * 0.08);
  ctx.strokeStyle = `rgba(255,245,220,${0.95 * fade})`; ctx.beginPath(); ctx.arc(C.x, C.y, R, 0, 2 * Math.PI); ctx.stroke();
  ctx.globalCompositeOperation = 'source-over';
  // Las casillas de al lado se encienden cuando las cruza el frente (el borde de la flor).
  if(!fx.poco){
    const ancla = HEX * SQ3, pasa = Math.max(0, Math.min(1, (R - ancla * 0.6) / (ancla * 0.6)));
    if(pasa > 0){
      for(let k = 0; k < 6; k++){
        const a = Math.PI / 6 + k * Math.PI / 3, c = {x: C.x + Math.cos(a) * ancla, y: C.y + Math.sin(a) * ancla};
        ondaHexPath(c, HEX * 0.96); ctx.fillStyle = `rgba(255,200,120,${0.12 * pasa * fade})`; ctx.fill();
        ctx.strokeStyle = `rgba(255,210,140,${0.8 * pasa * fade})`; ctx.lineWidth = 3 / z; ctx.stroke();
      }
    }
  }
  // Las grietas del piso, desde el centro (cortas, se apagan rápido).
  if(!fx.poco && ms < 900){
    const k = ms / 900;
    ctx.strokeStyle = `rgba(70,45,25,${0.6 * (1 - k)})`; ctx.lineWidth = 2 / z;
    fx.piedras.slice(0, 7).forEach(pd => {
      const l = HEX * (0.5 + pd.lejos * 0.5);
      ctx.beginPath(); ctx.moveTo(C.x, C.y);
      ctx.lineTo(C.x + Math.cos(pd.ang + 0.15) * l * 0.5, C.y + Math.sin(pd.ang + 0.15) * l * 0.5);
      ctx.lineTo(C.x + Math.cos(pd.ang) * l, C.y + Math.sin(pd.ang) * l); ctx.stroke();
    });
  }
  // Las piedritas y el polvo que saltan en arco.
  fx.piedras.forEach(pd => {
    const q = F.piedraEn(pd, p);
    if(q.alfa <= 0) return;
    const d = alcance * q.d, x = C.x + Math.cos(pd.ang) * d, y = C.y + Math.sin(pd.ang) * d * 0.85 - HEX * q.h;
    const r = HEX * pd.tam * (pd.polvo ? 2.2 : 1);
    if(pd.polvo){
      ctx.beginPath(); ctx.arc(x, y, r * (1 + p), 0, 2 * Math.PI); ctx.fillStyle = `rgba(200,170,130,${0.35 * q.alfa})`; ctx.fill();
    } else {
      ctx.save(); ctx.translate(x, y); ctx.rotate(pd.giro * p);
      ctx.fillStyle = `rgba(110,85,60,${q.alfa})`; ctx.fillRect(-r, -r * 0.7, r * 2, r * 1.4);
      ctx.fillStyle = `rgba(190,160,120,${0.7 * q.alfa})`; ctx.fillRect(-r, -r * 0.7, r * 2, r * 0.45);
      ctx.restore();
    }
  });
  ctx.restore();
}
function ondaFxDibujarGolpe(g, C, ms, z){
  const p = ms / g.dur;
  ctx.save();
  if(!g.cayo){   // lo resistió: un destello chico y nada más
    const k = Math.min(1, ms / g.dur);
    ctx.beginPath(); ctx.arc(C.x, C.y, HEX * (0.55 + 0.35 * k), 0, 2 * Math.PI);
    ctx.strokeStyle = `rgba(170,215,255,${0.6 * (1 - k)})`; ctx.lineWidth = 2.5 / z; ctx.stroke();
    ctx.restore(); return;
  }
  // El golpe: un estallido corto con rayitas hacia afuera.
  if(ms < 380){
    const k = ms / 380;
    ctx.beginPath(); ctx.arc(C.x, C.y, HEX * (0.5 + 0.6 * k), 0, 2 * Math.PI);
    ctx.strokeStyle = `rgba(255,220,120,${0.85 * (1 - k)})`; ctx.lineWidth = 3.5 / z; ctx.stroke();
    if(!g.poco) for(let s = 0; s < 8; s++){
      const a = s * Math.PI / 4 + 0.2, r0 = HEX * (0.55 + 0.4 * k), r1 = r0 + HEX * 0.3 * (1 - k);
      ctx.beginPath(); ctx.moveTo(C.x + Math.cos(a) * r0, C.y + Math.sin(a) * r0); ctx.lineTo(C.x + Math.cos(a) * r1, C.y + Math.sin(a) * r1);
      ctx.strokeStyle = `rgba(255,240,180,${1 - k})`; ctx.lineWidth = 2.5 / z; ctx.stroke();
    }
  }
  // Las estrellitas (Pajaritos) girando sobre la cabeza; aparecen y se apagan suave.
  const alfa = Math.min(1, ms / 250) * Math.min(1, (g.dur - ms) / 450);
  const cy = C.y - HEX * 1.0, n = g.poco ? 3 : 4;
  FxOnda.estrellas(g.poco ? 0 : ms, n).sort((a, b) => a.frente - b.frente).forEach((e, i) => {
    const x = C.x + e.x * HEX * 1.2, y = cy + e.y * HEX * 1.3, r = HEX * (e.frente ? 0.3 : 0.21);
    ondaEstrella(x, y, r, ms / 300 + i, `rgba(255,${e.frente ? 222 : 190},${e.frente ? 90 : 70},${alfa * (e.frente ? 1 : 0.7)})`);
  });
  ctx.restore();
}
function ondaEstrella(x, y, r, giro, color){
  ctx.beginPath();
  for(let k = 0; k < 10; k++){ const a = giro + k * Math.PI / 5, rr = k % 2 ? r * 0.45 : r; const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
  ctx.closePath(); ctx.fillStyle = color; ctx.fill();
  ctx.strokeStyle = 'rgba(60,35,0,.7)'; ctx.lineWidth = r * 0.12; ctx.stroke();
}
