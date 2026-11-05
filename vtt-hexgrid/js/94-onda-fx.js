/* 💥 La animación del Shockwave (2026-11-03, dueño: «me gustaría que también tuviera algún tipo de animación acorde», después de la de la
   Transfusión). La geometría está en comun/fx-onda.js; acá se publica y se dibuja, con el mismo camino que la Transfusión (js/92):
   - al lanzar la onda (js/13, dueloElegirAreaMapa) quien la usa publica un momento 'onda' ({de, radio, semilla}): todas las pantallas ven el
     golpe al piso — un anillo que sale hasta pasar las casillas de al lado, el borde de esas casillas que se enciende, polvo y piedritas que
     saltan, y una sacudida corta del mapa (nada con «reducir movimiento»). Queda su tarjeta en la Crónica;
   - cuando cada rival resuelve su resistencia (el GM, js/13 dueloGrupoResuelto) se publica 'onda-golpe' ({a, cayo}), sin tarjeta: sobre el
     que no la resistió, un golpe y estrellitas girando sobre la cabeza un rato; sobre el que la resistió, un destello chico.
   Dibuja en coordenadas del mapa (respeta zoom y paneo), sigue al token si se mueve, no toca clics y no hace nada si no hay ninguna en curso.
   Si el token no se ve en esta pantalla (oculto, niebla, sigilo) no se dibuja.
   Desde el 2026-11-03 (dueño: «aprobada la animación, avanzá con el resto») la usan también el Pisotón, la Nova arcana (violeta, empuja), el
   Sonic Boom (en cono, hacia donde mira), el Remolino / Barrido / Coletazo (un tajo que gira) y el Grito espeluznante (anillos oscuros, miedo):
   `FxOnda.varianteDe` (comun/fx-onda.js) dice cuál; el momento lleva `variante` (y `ang`, el cono). */
const ONDA_FX = [];      // {de, t0, semilla, radio, dur, poco, piedras, v, clave, ang}
const ONDA_GOLPES = [];  // {a, de, t0, cayo, dur, poco, v, clave}
const ondaFxVistos = new Set();
const ondaPocoMovimiento = () => { try{ return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } };
// ¿Esta habilidad lleva la animación? → la clave de su variante, o null.
const ondaFxVariante = hab => (!hab || typeof FxOnda === 'undefined') ? null : FxOnda.varianteDe(hab.nombre, hab.fxOnda);
const ondaFxEs = hab => !!ondaFxVariante(hab);
const ondaFxVe = t => !!t && (!t.oculto || soyGM) && (typeof tokenVisiblePorNiebla !== 'function' || tokenVisiblePorNiebla(t));

// La publica quien lanza la onda. `extra`: {variante, ang} (ang: hacia dónde sale un cono). Si el momento no se puede publicar, la ve al menos esta pantalla.
async function ondaFxPublicar(deId, radio, titulo, extra){
  if(!deId) return;
  const semilla = Math.floor(Math.random() * 1e9), r = Math.max(1, Math.round(num(radio)) || 1);
  const variante = String((extra && extra.variante) || 'tierra'), ang = extra && Number.isFinite(extra.ang) ? Math.round(extra.ang * 1000) / 1000 : null;
  const datos = {de: deId, radio: r, semilla, variante, ...(ang !== null ? {ang} : {})};
  const id = typeof momentoAbrir === 'function'
    ? await momentoAbrir({tipo: 'onda', icono: '💥', titulo: String(titulo || 'Shockwave'), estado: 'listo', datos})
    : null;
  if(!id) ondaFxEmpezar(deId, r, semilla, variante, ang);
}
// El resultado de cada rival (lo publica el GM al resolverse su sub-duelo): cayó (no lo resistió) o no.
async function ondaFxGolpePublicar(aId, cayo, variante, deId){
  if(!aId) return;
  const datos = {a: aId, cayo: !!cayo, variante: String(variante || 'tierra'), ...(deId ? {de: deId} : {})};
  const id = typeof momentoAbrir === 'function' ? await momentoAbrir({tipo: 'onda-golpe', icono: '', titulo: '', estado: 'listo', datos}) : null;
  if(!id) ondaFxGolpe(aId, !!cayo, datos.variante, deId);
}
// Llegan a cada pantalla (js/16, momentoRecibido). Una sola vez por momento, y solo si son de recién.
const ondaFxReciente = d => { const t = d.creado && d.creado.toMillis ? d.creado.toMillis() : Date.now(); return Date.now() - t < 20000; };
function ondaFxRecibido(id, d){
  if(!d || !d.datos || ondaFxVistos.has(id)) return;
  ondaFxVistos.add(id);
  if(!ondaFxReciente(d)) return;
  ondaFxEmpezar(d.datos.de, num(d.datos.radio) || 1, num(d.datos.semilla) || 1, d.datos.variante, Number.isFinite(d.datos.ang) ? d.datos.ang : null);
}
function ondaFxGolpeRecibido(id, d){
  if(!d || !d.datos || ondaFxVistos.has(id)) return;
  ondaFxVistos.add(id);
  if(!ondaFxReciente(d)) return;
  ondaFxGolpe(d.datos.a, !!d.datos.cayo, d.datos.variante, d.datos.de);
}
function ondaFxEmpezar(de, radio, semilla, clave, ang){
  if(typeof FxOnda === 'undefined' || !tokens.get(de)) return;
  const poco = ondaPocoMovimiento(), v = FxOnda.variante(clave);
  const n = poco ? 0 : (v.piedras || v.chispas || 0);
  ONDA_FX.push({de, radio, semilla, t0: performance.now(), dur: poco ? 900 : FxOnda.DURACION, poco, piedras: FxOnda.piedras(semilla, n), v, clave: clave || 'tierra',
    ang: v.cono ? (Number.isFinite(ang) ? ang : Math.PI / 2) : null});
  if(!poco && v.sacudida && ondaFxVe(tokens.get(de))) ondaSacudir(semilla, v.sacudida);
  pedirDibujo();
}
function ondaFxGolpe(a, cayo, clave, de){
  if(typeof FxOnda === 'undefined' || !tokens.get(a)) return;
  const poco = ondaPocoMovimiento(), v = FxOnda.variante(clave);
  const largo = v.golpe === 'pajaritos' ? FxOnda.PAJARITOS_MS : 1100;
  ONDA_GOLPES.push({a, de, cayo, t0: performance.now(), dur: cayo ? (poco ? 1200 : largo) : 700, poco, v, clave: clave || 'tierra'});
  pedirDibujo();
}
// La sacudida: el lienzo se mueve unos píxeles un instante (con CSS: no toca las coordenadas del mapa ni los clics).
function ondaSacudir(semilla, fuerza){
  const el = document.getElementById('lienzo');
  if(!el || !el.animate) return;
  const cuadros = [];
  for(let ms = 0; ms <= 350; ms += 35){ const s = FxOnda.sacudida(ms, semilla, fuerza || 5); cuadros.push({transform: `translate(${s.dx.toFixed(1)}px, ${s.dy.toFixed(1)}px)`}); }
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
    const C = hexCentro(t.col, t.fila);
    if(fx.v.giro) ondaFxDibujarGiro(fx, C, ms, z); else ondaFxDibujarUna(fx, C, ms, z);
  }
  for(let i = ONDA_GOLPES.length - 1; i >= 0; i--){
    const g = ONDA_GOLPES[i], ms = ahora - g.t0;
    if(ms < 0) continue;   // (todavía no empezó)
    if(ms >= g.dur){ ONDA_GOLPES.splice(i, 1); continue; }
    const t = tokens.get(g.a);
    if(!ondaFxVe(t)) continue;
    const de = g.de && tokens.get(g.de);
    ondaFxDibujarGolpe(g, hexCentro(t.col, t.fila), ms, z, de ? hexCentro(de.col, de.fila) : null);
  }
  return ONDA_FX.length > 0 || ONDA_GOLPES.length > 0;
}
// Un hexágono «de lado arriba» (como los del mapa) de radio r alrededor de c.
function ondaHexPath(c, r){
  ctx.beginPath();
  for(let k = 0; k < 6; k++){ const a = k * Math.PI / 3; const x = c.x + r * Math.cos(a), y = c.y + r * Math.sin(a); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.closePath();
}
const ONDA_CONO_ABRE = 0.62;   // medio ancho del abanico del cono (radianes, ~35°)
const rgba = (c, a) => `rgba(${c},${Math.max(0, Math.min(1, a)).toFixed(3)})`;
function ondaFxDibujarUna(fx, C, ms, z){
  const F = FxOnda, v = fx.v, p = Math.min(1, ms / fx.dur), cono = fx.ang !== null && fx.ang !== undefined;
  // Hasta dónde llega: pasa el borde de afuera de las casillas del radio (el cono, sus 4 filas).
  const alcance = cono ? HEX * SQ3 * 4.6 : HEX * (SQ3 * fx.radio + 0.9);
  const R = alcance * F.anillo(p), fade = 1 - Math.pow(p, 1.6);
  const a0 = cono ? fx.ang - ONDA_CONO_ABRE : 0, a1 = cono ? fx.ang + ONDA_CONO_ABRE : 2 * Math.PI;
  ctx.save();
  // El golpe al piso (o el estallido): un fogonazo en el centro, al principio.
  if(ms < 260){
    const k = ms / 260, g = ctx.createRadialGradient(C.x, C.y, 0, C.x, C.y, HEX * 1.1);
    g.addColorStop(0, rgba(v.fogonazo, 0.65 * (1 - k))); g.addColorStop(1, rgba(v.banda, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(C.x, C.y, HEX * 1.1, 0, 2 * Math.PI); ctx.fill();
  }
  if(cono){ ctx.beginPath(); ctx.moveTo(C.x, C.y); ctx.arc(C.x, C.y, alcance * 1.2, a0, a1); ctx.closePath(); ctx.clip(); }
  // Los anillos: uno (o varios, el grito) que salen; detrás, una banda ancha y suave (el polvo o la energía).
  const nAn = v.anillos || 1;
  for(let j = 0; j < nAn; j++){
    const pj = p - j * 0.18;
    if(pj <= 0) continue;
    const Rj = alcance * F.anillo(pj), fj = (1 - Math.pow(Math.min(1, pj), 1.6)) * (j ? 0.75 : 1);
    const banda = ctx.createRadialGradient(C.x, C.y, Math.max(0, Rj - HEX * 1.1), C.x, C.y, Rj + HEX * 0.15);
    banda.addColorStop(0, rgba(v.banda, 0)); banda.addColorStop(0.7, rgba(v.banda, 0.35 * fj)); banda.addColorStop(0.92, rgba(v.banda2, 0.55 * fj)); banda.addColorStop(1, rgba(v.banda2, 0));
    ctx.fillStyle = banda; ctx.beginPath(); ctx.moveTo(C.x, C.y); ctx.arc(C.x, C.y, Rj + HEX * 0.15, a0, a1); ctx.closePath(); ctx.fill();
    // El frente: un arco que brilla (se suma a lo de abajo), más fino a medida que se aleja.
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineWidth = Math.max(2 / z, HEX * 0.22 * (1 - pj * 0.6));
    ctx.strokeStyle = rgba(v.frente, 0.55 * fj); ctx.beginPath(); ctx.arc(C.x, C.y, Rj, a0, a1); ctx.stroke();
    ctx.lineWidth = Math.max(1.5 / z, HEX * 0.08);
    ctx.strokeStyle = rgba(v.brillo, 0.95 * fj); ctx.beginPath(); ctx.arc(C.x, C.y, Rj, a0, a1); ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  }
  // Las casillas de al lado se encienden cuando las cruza el frente (solo la onda de radio 1, alrededor).
  if(!fx.poco && !cono && fx.radio <= 1){
    const ancla = HEX * SQ3, pasa = Math.max(0, Math.min(1, (R - ancla * 0.6) / (ancla * 0.6)));
    if(pasa > 0){
      for(let k = 0; k < 6; k++){
        const a = Math.PI / 6 + k * Math.PI / 3, c = {x: C.x + Math.cos(a) * ancla, y: C.y + Math.sin(a) * ancla};
        ondaHexPath(c, HEX * 0.96); ctx.fillStyle = rgba(v.casilla, 0.12 * pasa * fade); ctx.fill();
        ctx.strokeStyle = rgba(v.casillaBorde, 0.8 * pasa * fade); ctx.lineWidth = 3 / z; ctx.stroke();
      }
    }
  }
  // Las grietas del piso, desde el centro (cortas, se apagan rápido).
  if(!fx.poco && v.grietas && ms < 900){
    const k = ms / 900;
    ctx.strokeStyle = `rgba(70,45,25,${(0.6 * (1 - k)).toFixed(3)})`; ctx.lineWidth = 2 / z;
    fx.piedras.slice(0, 7).forEach(pd => {
      const l = HEX * (0.5 + pd.lejos * 0.5);
      ctx.beginPath(); ctx.moveTo(C.x, C.y);
      ctx.lineTo(C.x + Math.cos(pd.ang + 0.15) * l * 0.5, C.y + Math.sin(pd.ang + 0.15) * l * 0.5);
      ctx.lineTo(C.x + Math.cos(pd.ang) * l, C.y + Math.sin(pd.ang) * l); ctx.stroke();
    });
  }
  // Las piedritas y el polvo que saltan en arco (en el cono, dentro del abanico); o las chispas (la Nova), que vuelan sin caer.
  fx.piedras.forEach(pd => {
    const q = F.piedraEn(pd, p);
    if(q.alfa <= 0) return;
    const ang = cono ? fx.ang + (pd.ang / (2 * Math.PI) - 0.5) * 2 * ONDA_CONO_ABRE : pd.ang;
    const d = alcance * q.d * (cono ? 0.9 : 1);
    if(v.chispas){
      const x = C.x + Math.cos(ang) * d * 1.1, y = C.y + Math.sin(ang) * d * 1.1, r = HEX * (0.05 + pd.tam);
      ctx.globalCompositeOperation = 'lighter';
      ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.fillStyle = rgba(v.brillo, 0.9 * q.alfa); ctx.fill();
      ctx.beginPath(); ctx.arc(x, y, r * 2.4, 0, 2 * Math.PI); ctx.fillStyle = rgba(v.frente, 0.25 * q.alfa); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      return;
    }
    const x = C.x + Math.cos(ang) * d, y = C.y + Math.sin(ang) * d * 0.85 - HEX * q.h * (v.soloPolvo ? 0.3 : 1);
    const r = HEX * pd.tam * (pd.polvo || v.soloPolvo ? 2.2 : 1);
    if(pd.polvo || v.soloPolvo){
      ctx.beginPath(); ctx.arc(x, y, r * (1 + p), 0, 2 * Math.PI); ctx.fillStyle = v.soloPolvo ? rgba(v.banda2, 0.35 * q.alfa) : `rgba(200,170,130,${(0.35 * q.alfa).toFixed(3)})`; ctx.fill();
    } else {
      ctx.save(); ctx.translate(x, y); ctx.rotate(pd.giro * p);
      ctx.fillStyle = `rgba(110,85,60,${q.alfa.toFixed(3)})`; ctx.fillRect(-r, -r * 0.7, r * 2, r * 1.4);
      ctx.fillStyle = `rgba(190,160,120,${(0.7 * q.alfa).toFixed(3)})`; ctx.fillRect(-r, -r * 0.7, r * 2, r * 0.45);
      ctx.restore();
    }
  });
  ctx.restore();
}
// 🌀 El giro (Remolino, Barrido, Coletazo): un tajo brillante que da una vuelta entera alrededor de quien gira, con su estela.
function ondaFxDibujarGiro(fx, C, ms, z){
  const v = fx.v, p = Math.min(1, ms / fx.dur), fade = 1 - Math.pow(p, 2);
  const R = HEX * SQ3 * Math.max(1, fx.radio), giro = -Math.PI / 2 + p * 2 * Math.PI * 1.15;
  ctx.save();
  // La estela: arcos que se van apagando detrás de la hoja.
  ctx.globalCompositeOperation = 'lighter';
  // La estela empieza un poco detrás de la espada (antes, el arco más grueso de adelante se veía como un cuadrado en la punta).
  for(let k = 1; k < 18; k++){
    const a = giro - k * 0.13, al = (1 - k / 18) * fade;
    ctx.lineWidth = Math.max(2 / z, HEX * (0.48 - k * 0.024));
    ctx.strokeStyle = rgba(k < 3 ? v.brillo : v.frente, (k < 3 ? 0.85 : 0.6) * al);
    ctx.beginPath(); ctx.arc(C.x, C.y, R, a - 0.14, a); ctx.stroke();
  }
  // Un brillo suave donde corta la hoja.
  const hx = C.x + Math.cos(giro) * R, hy = C.y + Math.sin(giro) * R, gl = ctx.createRadialGradient(hx, hy, 0, hx, hy, HEX * 0.6);
  gl.addColorStop(0, rgba(v.brillo, 0.55 * fade)); gl.addColorStop(1, rgba(v.frente, 0));
  ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(hx, hy, HEX * 0.6, 0, 2 * Math.PI); ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  // 🗡 La espada que gira (2026-11-05, dueño: «en la punta tiene como una especie de cuadrado… reemplazarlo por una espadita que represente el arma»):
  // la hoja apunta hacia afuera, con la empuñadura del lado de quien gira; una sola para todas las armas.
  ondaFxEspada(C, giro, R, fade, v);
  // El aire que corta: un anillo tenue en todo el borde.
  ctx.lineWidth = Math.max(1 / z, HEX * 0.05);
  ctx.strokeStyle = rgba(v.banda2, 0.3 * fade); ctx.beginPath(); ctx.arc(C.x, C.y, R, 0, 2 * Math.PI); ctx.stroke();
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
}
// 🗡 Una espadita en el ángulo `ang`, con la punta en el radio R + un poco (coordenadas del mapa).
function ondaFxEspada(C, ang, R, alfa, v){
  const L = HEX * 1.4, ux = Math.cos(ang), uy = Math.sin(ang), nx = -uy, ny = ux;
  const P = r => ({x: C.x + ux * r, y: C.y + uy * r});
  const punta = P(R + L * 0.42), base = P(R - L * 0.5), guarda = P(R - L * 0.5), puno = P(R - L * 0.5 - HEX * 0.32), pomo = P(R - L * 0.5 - HEX * 0.4);
  const w = HEX * 0.11;
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alfa));
  ctx.shadowColor = rgba(v.brillo, 0.9); ctx.shadowBlur = HEX * 0.35;
  // La hoja: dos filos que se juntan en la punta, con un canal más claro.
  ctx.beginPath();
  ctx.moveTo(base.x + nx * w, base.y + ny * w);
  ctx.lineTo(P(R + L * 0.22).x + nx * w * 0.85, P(R + L * 0.22).y + ny * w * 0.85);
  ctx.lineTo(punta.x, punta.y);
  ctx.lineTo(P(R + L * 0.22).x - nx * w * 0.85, P(R + L * 0.22).y - ny * w * 0.85);
  ctx.lineTo(base.x - nx * w, base.y - ny * w);
  ctx.closePath();
  ctx.fillStyle = '#e9eef7'; ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = Math.max(0.8, HEX * 0.025); ctx.strokeStyle = 'rgba(40,48,66,.85)'; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(base.x, base.y); ctx.lineTo(P(R + L * 0.3).x, P(R + L * 0.3).y);
  ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = Math.max(0.6, HEX * 0.03); ctx.stroke();
  // La guarda (cruz), el puño y el pomo.
  const gw = HEX * 0.34;
  ctx.beginPath(); ctx.moveTo(guarda.x + nx * gw, guarda.y + ny * gw); ctx.lineTo(guarda.x - nx * gw, guarda.y - ny * gw);
  ctx.lineCap = 'round'; ctx.lineWidth = HEX * 0.1; ctx.strokeStyle = '#3a2a10'; ctx.stroke();
  ctx.lineWidth = HEX * 0.065; ctx.strokeStyle = '#d6aa4a'; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(guarda.x, guarda.y); ctx.lineTo(puno.x, puno.y);
  ctx.lineWidth = HEX * 0.09; ctx.strokeStyle = '#5a3a1e'; ctx.stroke();
  ctx.beginPath(); ctx.arc(pomo.x, pomo.y, HEX * 0.075, 0, 2 * Math.PI); ctx.fillStyle = '#d6aa4a'; ctx.fill();
  ctx.lineWidth = Math.max(0.6, HEX * 0.02); ctx.strokeStyle = '#3a2a10'; ctx.stroke();
  ctx.restore();
}
function ondaFxDibujarGolpe(g, C, ms, z, D){
  const v = g.v;
  ctx.save();
  if(!g.cayo){   // lo resistió (o lo esquivó): un destello chico y nada más
    const k = Math.min(1, ms / g.dur);
    ctx.beginPath(); ctx.arc(C.x, C.y, HEX * (0.55 + 0.35 * k), 0, 2 * Math.PI);
    ctx.strokeStyle = rgba(v.resiste, 0.6 * (1 - k)); ctx.lineWidth = 2.5 / z; ctx.stroke();
    ctx.restore(); return;
  }
  // El golpe: un estallido corto con rayitas hacia afuera, del color de la onda.
  if(ms < 380){
    const k = ms / 380;
    ctx.beginPath(); ctx.arc(C.x, C.y, HEX * (0.5 + 0.6 * k), 0, 2 * Math.PI);
    ctx.strokeStyle = rgba(v.golpe === 'pajaritos' ? '255,220,120' : v.frente, 0.85 * (1 - k)); ctx.lineWidth = 3.5 / z; ctx.stroke();
    if(!g.poco) for(let s = 0; s < 8; s++){
      const a = s * Math.PI / 4 + 0.2, r0 = HEX * (0.55 + 0.4 * k), r1 = r0 + HEX * 0.3 * (1 - k);
      ctx.beginPath(); ctx.moveTo(C.x + Math.cos(a) * r0, C.y + Math.sin(a) * r0); ctx.lineTo(C.x + Math.cos(a) * r1, C.y + Math.sin(a) * r1);
      ctx.strokeStyle = rgba(v.golpe === 'pajaritos' ? '255,240,180' : v.brillo, 1 - k); ctx.lineWidth = 2.5 / z; ctx.stroke();
    }
  }
  const alfa = Math.min(1, ms / 250) * Math.min(1, (g.dur - ms) / 450);
  if(v.golpe === 'pajaritos'){
    // Las estrellitas (Pajaritos) girando sobre la cabeza; aparecen y se apagan suave.
    const cy = C.y - HEX * 1.0, n = g.poco ? 3 : 4;
    FxOnda.estrellas(g.poco ? 0 : ms, n).sort((a, b) => a.frente - b.frente).forEach((e, i) => {
      const x = C.x + e.x * HEX * 1.2, y = cy + e.y * HEX * 1.3, r = HEX * (e.frente ? 0.3 : 0.21);
      ondaEstrella(x, y, r, ms / 300 + i, `rgba(255,${e.frente ? 222 : 190},${e.frente ? 90 : 70},${(alfa * (e.frente ? 1 : 0.7)).toFixed(3)})`);
    });
  } else if(v.golpe === 'empuje'){
    // El empujón: tres flechitas que salen del lado contrario a quien la lanzó.
    const ang = D ? Math.atan2(C.y - D.y, C.x - D.x) : -Math.PI / 2;
    for(let k = 0; k < 3; k++){
      const d = HEX * (0.7 + ((ms / 420 + k / 3) % 1) * 1.1), x = C.x + Math.cos(ang) * d, y = C.y + Math.sin(ang) * d, s = HEX * 0.28;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(ang + 2.5) * s, y + Math.sin(ang + 2.5) * s); ctx.lineTo(x, y); ctx.lineTo(x + Math.cos(ang - 2.5) * s, y + Math.sin(ang - 2.5) * s);
      ctx.strokeStyle = rgba(v.brillo, alfa * (1 - ((ms / 420 + k / 3) % 1))); ctx.lineWidth = 3 / z; ctx.lineCap = 'round'; ctx.stroke();
    }
  } else if(v.golpe === 'sentado'){
    // Pierde el aliento: gotitas verdes (los No2) que caen.
    for(let k = 0; k < 4; k++){
      const q = ((ms / 700) + k / 4) % 1, x = C.x + (k - 1.5) * HEX * 0.32, y = C.y - HEX * 0.6 + q * HEX * 1.3;
      ctx.beginPath(); ctx.arc(x, y, HEX * 0.09, 0, 2 * Math.PI); ctx.fillStyle = `rgba(110,220,130,${(alfa * (1 - q)).toFixed(3)})`; ctx.fill();
    }
  } else if(v.golpe === 'corte'){
    // El tajo que lo cruzó: una línea brillante en diagonal.
    if(ms < 500){
      const k = ms / 500, s = HEX * 0.9;
      ctx.globalCompositeOperation = 'lighter';
      ctx.beginPath(); ctx.moveTo(C.x - s, C.y - s * 0.6); ctx.lineTo(C.x - s + 2 * s * Math.min(1, k * 2), C.y - s * 0.6 + 1.2 * s * Math.min(1, k * 2));
      ctx.strokeStyle = rgba(v.brillo, 1 - k); ctx.lineWidth = HEX * 0.12; ctx.lineCap = 'round'; ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    }
  } else if(v.golpe === 'miedo'){
    // El miedo: la cara de susto que sube y se apaga.
    ctx.globalAlpha = alfa; ctx.font = `${Math.round(HEX * 0.7)}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('😱', C.x, C.y - HEX * (0.9 + 0.4 * (ms / g.dur)));
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}
function ondaEstrella(x, y, r, giro, color){
  ctx.beginPath();
  for(let k = 0; k < 10; k++){ const a = giro + k * Math.PI / 5, rr = k % 2 ? r * 0.45 : r; const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
  ctx.closePath(); ctx.fillStyle = color; ctx.fill();
  ctx.strokeStyle = 'rgba(60,35,0,.7)'; ctx.lineWidth = r * 0.12; ctx.stroke();
}
