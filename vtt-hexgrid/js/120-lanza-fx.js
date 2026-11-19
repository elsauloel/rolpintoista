// js/120-lanza-fx.js — ✨ La animación de la Lanza arcana (dueño, 2026-11-19: «me gusta así», a la propuesta de Claude).
//
// Dos momentos sin tarjeta, como la onda (js/94):
//   - 'lanza-fx' ({de, desde, celdas, atraviesa, semilla}): lo publica quien la lanza (js/13, dueloElegirAreaMapa) ANTES de crear la cascada de duelos,
//     y la cascada arranca cuando ya se vio. En todas las pantallas: la carga (un brillo violeta que crece en quien la lanza, ~medio segundo), una lanza
//     de luz que recorre la línea hasta el final del alcance dejando una estela que se desvanece, y un estallido de chispas violetas en cada token que
//     atraviesa (sin frenarse).
//   - 'lanza-golpe' ({a}): lo publica el GM (js/13, dueloGrupoResuelto) cuando a uno le pegó (no la esquivó): un destello blanco de ~1 segundo sobre él
//     (queda Deslumbrado). Al que la esquivó no se le publica nada: le pasó de largo. Si el cuadro del duelo está abierto, se aparta mientras dura.
// Dibuja en coordenadas del mapa (respeta zoom y paneo). Lo que esta pantalla no ve (oculto, niebla, sigilo) no se dibuja. «Reducir movimiento»: corta.
const LANZA_FX = [];      // {de, o: {x,y}, fin: {x,y}, golpes: [{x, y, t, id}], t0, semilla, poco}
const LANZA_DESTELLOS = [];   // {a, t0}
const lanzaFxVistos = new Set();
const LANZA_T = {carga: 520, viaje: 620, estela: 520, chispas: 560};
const LANZA_DUR = LANZA_T.carga + LANZA_T.viaje + LANZA_T.estela;   // ~1,7 s (el duelo espera esto + un margen)
const LANZA_DESTELLO_MS = 1050;
const lanzaPoco = () => { try{ return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } };
const lanzaVe = t => !!t && (!t.oculto || soyGM) && (typeof tokenVisiblePorNiebla !== 'function' || tokenVisiblePorNiebla(t));
// ¿Esta habilidad lleva la animación? Hoy, la Lanza arcana (también si se la renombra con un ícono adelante).
const lanzaFxEs = hab => !!hab && hab.objetivo === 'linea' && (hab.fxLanza || /lanza arcana/i.test(String(hab.nombre || '')));

// Quien la lanza. `celdas`: la línea entera (nbPack), de la más cercana a la más lejana; `atraviesa`: los ids de los tokens que alcanza.
async function lanzaFxPublicar(deId, desde, celdas, atraviesa){
  if(!deId || !desde || !Array.isArray(celdas) || !celdas.length) return;
  const datos = {de: String(deId), desde: {col: Math.round(num(desde.col)), fila: Math.round(num(desde.fila))}, celdas: celdas.slice(0, 40).map(String),
    atraviesa: (atraviesa || []).slice(0, 30).map(String), semilla: Math.floor(Math.random() * 1e9)};
  let id = null;
  try{ id = typeof momentoAbrir === 'function' ? await momentoAbrir({tipo: 'lanza-fx', icono: '', titulo: '', estado: 'listo', datos}) : null; }
  catch(err){ console.error('Lanza arcana: no se pudo publicar la animación', err); }
  if(!id) lanzaFxEmpezar(datos);
}
// El GM, cuando a uno le pegó: el destello.
async function lanzaGolpePublicar(aId){
  if(!aId) return;
  const datos = {a: String(aId)};
  let id = null;
  try{ id = typeof momentoAbrir === 'function' ? await momentoAbrir({tipo: 'lanza-golpe', icono: '', titulo: '', estado: 'listo', datos}) : null; }
  catch(err){ console.error('Lanza arcana: no se pudo publicar el destello', err); }
  if(!id) lanzaGolpeEmpezar(datos);
}
// Llegan a cada pantalla (js/16). Una sola vez, y solo si son de recién.
const lanzaReciente = d => { const t = d.creado && d.creado.toMillis ? d.creado.toMillis() : Date.now(); return Date.now() - t < 20000; };
function lanzaFxRecibido(id, d){
  if(!d || !d.datos || lanzaFxVistos.has(id)) return;
  lanzaFxVistos.add(id);
  if(lanzaReciente(d)) lanzaFxEmpezar(d.datos);
}
function lanzaGolpeRecibido(id, d){
  if(!d || !d.datos || lanzaFxVistos.has(id)) return;
  lanzaFxVistos.add(id);
  if(lanzaReciente(d)) lanzaGolpeEmpezar(d.datos);
}
function lanzaFxEmpezar(dt){
  if(!dt || !dt.desde || !Array.isArray(dt.celdas) || !dt.celdas.length) return;
  const o = hexCentro(dt.desde.col, dt.desde.fila), u = nbUnpack(dt.celdas[dt.celdas.length - 1]);
  const ult = hexCentro(u.col, u.fila), dx = ult.x - o.x, dy = ult.y - o.y, largo = Math.hypot(dx, dy) || 1;
  const fin = {x: ult.x + dx / largo * HEX * 0.55, y: ult.y + dy / largo * HEX * 0.55};   // (un poco más allá del centro de la última casilla)
  const total = Math.hypot(fin.x - o.x, fin.y - o.y) || 1;
  // Cuándo la punta pasa por cada token que atraviesa (su proyección sobre la línea).
  const golpes = (dt.atraviesa || []).map(id => {
    const t = tokens.get(id); if(!t) return null;
    const c = hexCentro(t.col, t.fila), k = Math.max(0, Math.min(1, ((c.x - o.x) * (fin.x - o.x) + (c.y - o.y) * (fin.y - o.y)) / (total * total)));
    return {id, x: c.x, y: c.y, t: LANZA_T.carga + k * LANZA_T.viaje};
  }).filter(Boolean);
  const poco = lanzaPoco();
  LANZA_FX.push({de: dt.de, o, fin, golpes, t0: performance.now(), semilla: num(dt.semilla) || 1, poco});
  pedirDibujo();
}
function lanzaGolpeEmpezar(dt){
  if(!dt || !dt.a || !tokens.get(dt.a)) return;
  // Si el cuadro de un duelo está abierto en esta pantalla, se repliega mientras dura el destello y vuelve solo (Duelo.apartar).
  let espera = 0;
  try{ const ab = typeof Duelo !== 'undefined' && Duelo.abiertoId && Duelo.abiertoId(); if(ab && Duelo.apartar && num(Duelo.apartar(ab, 380 + LANZA_DESTELLO_MS + 400)) > 0) espera = 380; }catch(e){}
  for(let i = LANZA_DESTELLOS.length - 1; i >= 0; i--) if(LANZA_DESTELLOS[i].a === dt.a) LANZA_DESTELLOS.splice(i, 1);
  LANZA_DESTELLOS.push({a: dt.a, t0: performance.now() + espera});
  pedirDibujo();
}
// Un número pseudoazar estable por semilla (las chispas salen igual en todas las pantallas).
function lanzaAzar(s){ let x = (s | 0) || 1; return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return ((x >>> 0) % 10000) / 10000; }; }

function dibujarEfectosLanza(z){
  if(!LANZA_FX.length && !LANZA_DESTELLOS.length) return false;
  const ahora = performance.now(), R = HEX * 0.68;
  ctx.save();
  for(let i = LANZA_FX.length - 1; i >= 0; i--){
    const fx = LANZA_FX[i], ms = ahora - fx.t0, dur = fx.poco ? 700 : LANZA_DUR + LANZA_T.chispas;
    if(ms >= dur){ LANZA_FX.splice(i, 1); continue; }
    const tc = tokens.get(fx.de), veoA = lanzaVe(tc);
    const pc = tc ? hexCentro(tc.col, tc.fila) : fx.o;   // (sigue al token si se movió)
    ctx.globalCompositeOperation = 'lighter';
    // 1) La carga: un brillo violeta que crece y late en quien la lanza.
    const cargaFin = fx.poco ? 150 : LANZA_T.carga;
    if(veoA && ms < cargaFin + 220){
      const u = Math.min(1, ms / cargaFin), sale = ms > cargaFin ? 1 - (ms - cargaFin) / 220 : 1;
      const r = R * (0.7 + 0.75 * u) * (1 + 0.06 * Math.sin(ms / 38));
      const g = ctx.createRadialGradient(pc.x, pc.y, R * 0.15, pc.x, pc.y, r);
      g.addColorStop(0, `rgba(235,210,255,${(0.55 * u * sale).toFixed(3)})`); g.addColorStop(0.45, `rgba(170,90,255,${(0.45 * u * sale).toFixed(3)})`); g.addColorStop(1, 'rgba(120,40,220,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(pc.x, pc.y, r, 0, 2 * Math.PI); ctx.fill();
      if(!fx.poco){   // motitas que se juntan hacia el centro
        const az = lanzaAzar(fx.semilla);
        for(let k = 0; k < 10; k++){
          const ang = az() * 2 * Math.PI, d0 = R * (1.1 + az() * 0.8), d = d0 * (1 - u * 0.85);
          const x = pc.x + Math.cos(ang) * d, y = pc.y + Math.sin(ang) * d;
          ctx.fillStyle = `rgba(215,170,255,${(0.75 * u * sale).toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, Math.max(1.2 / z, R * 0.05), 0, 2 * Math.PI); ctx.fill();
        }
      }
    }
    // 2) La lanza: la punta recorre la línea; detrás, la estela que se apaga.
    const t1 = ms - cargaFin, viaje = fx.poco ? 220 : LANZA_T.viaje, estela = fx.poco ? 300 : LANZA_T.estela;
    if(t1 > 0 && t1 < viaje + estela){
      const k = Math.min(1, t1 / viaje), kk = 1 - Math.pow(1 - k, 2);   // sale rápido y no frena
      const px = fx.o.x + (fx.fin.x - fx.o.x) * kk, py = fx.o.y + (fx.fin.y - fx.o.y) * kk;
      const apaga = t1 > viaje ? 1 - (t1 - viaje) / estela : 1;
      // La estela: desde quien la lanza (o desde atrás de la punta, cuando se apaga) hasta la punta.
      const cola = t1 > viaje ? Math.min(1, (t1 - viaje) / estela) : 0;
      const sx = fx.o.x + (px - fx.o.x) * cola, sy = fx.o.y + (py - fx.o.y) * cola;
      const lg = ctx.createLinearGradient(sx, sy, px, py);
      lg.addColorStop(0, 'rgba(140,60,255,0)'); lg.addColorStop(0.7, `rgba(170,100,255,${(0.55 * apaga).toFixed(3)})`); lg.addColorStop(1, `rgba(240,225,255,${(0.95 * apaga).toFixed(3)})`);
      ctx.lineCap = 'round';
      ctx.strokeStyle = lg; ctx.lineWidth = Math.max(4 / z, R * 0.46); ctx.shadowColor = 'rgba(170,90,255,.95)'; ctx.shadowBlur = 28 / z;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(px, py); ctx.stroke();
      ctx.strokeStyle = `rgba(255,255,255,${(0.85 * apaga).toFixed(3)})`; ctx.lineWidth = Math.max(2 / z, R * 0.14); ctx.shadowBlur = 8 / z;
      const mx = sx + (px - sx) * 0.35, my = sy + (py - sy) * 0.35;
      ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(px, py); ctx.stroke();
      ctx.shadowBlur = 0;
      if(k < 1){   // la punta: un rombo de luz
        const ang = Math.atan2(fx.fin.y - fx.o.y, fx.fin.x - fx.o.x), L = R * 0.75, A = R * 0.22;
        ctx.save(); ctx.translate(px, py); ctx.rotate(ang);
        const pg = ctx.createRadialGradient(0, 0, 0, 0, 0, L * 1.3);
        pg.addColorStop(0, 'rgba(255,255,255,.95)'); pg.addColorStop(0.4, 'rgba(210,160,255,.7)'); pg.addColorStop(1, 'rgba(140,60,255,0)');
        ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(0, 0, L * 1.3, 0, 2 * Math.PI); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.beginPath(); ctx.moveTo(L, 0); ctx.lineTo(0, A); ctx.lineTo(-L * 0.6, 0); ctx.lineTo(0, -A); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
    }
    // 3) Las chispas violetas en cada token que atraviesa, cuando pasa la punta.
    if(!fx.poco) fx.golpes.forEach((gp, j) => {
      const tg = tokens.get(gp.id);
      if(!lanzaVe(tg)) return;
      const tt = ms - gp.t;
      if(tt < 0 || tt > LANZA_T.chispas) return;
      const u = tt / LANZA_T.chispas, az = lanzaAzar(fx.semilla + 97 * (j + 1));
      const fl = ctx.createRadialGradient(gp.x, gp.y, 0, gp.x, gp.y, R * 1.1);   // el fogonazo
      fl.addColorStop(0, `rgba(230,200,255,${(0.6 * (1 - u)).toFixed(3)})`); fl.addColorStop(1, 'rgba(150,70,255,0)');
      ctx.fillStyle = fl; ctx.beginPath(); ctx.arc(gp.x, gp.y, R * 1.1, 0, 2 * Math.PI); ctx.fill();
      for(let s = 0; s < 16; s++){
        const ang = az() * 2 * Math.PI, vel = R * (0.9 + az() * 1.3), d = vel * (1 - Math.pow(1 - u, 2.2));
        const x = gp.x + Math.cos(ang) * d, y = gp.y + Math.sin(ang) * d + R * 0.35 * u * u;
        const x0 = gp.x + Math.cos(ang) * d * 0.7, y0 = gp.y + Math.sin(ang) * d * 0.7 + R * 0.35 * u * u * 0.7;
        ctx.strokeStyle = s % 3 ? `rgba(190,120,255,${(1 - u).toFixed(3)})` : `rgba(255,240,255,${(1 - u).toFixed(3)})`;
        ctx.lineWidth = Math.max(1.2 / z, R * 0.05); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x, y); ctx.stroke();
      }
    });
  }
  // 4) El destello blanco (Deslumbrado) sobre los que no la esquivaron.
  for(let i = LANZA_DESTELLOS.length - 1; i >= 0; i--){
    const fx = LANZA_DESTELLOS[i], ms = ahora - fx.t0;
    if(ms >= LANZA_DESTELLO_MS){ LANZA_DESTELLOS.splice(i, 1); continue; }
    if(ms < 0) continue;
    const t = tokens.get(fx.a);
    if(!lanzaVe(t)) continue;
    const c = hexCentro(t.col, t.fila);
    const sube = Math.min(1, ms / 90), baja = ms > 260 ? Math.max(0, 1 - (ms - 260) / (LANZA_DESTELLO_MS - 260)) : 1, a = sube * baja;
    const parpadeo = 0.85 + 0.15 * Math.sin(ms / 30);
    ctx.globalCompositeOperation = 'lighter';
    const r = R * (1.15 + 0.5 * (1 - baja));
    const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, r);
    g.addColorStop(0, `rgba(255,255,255,${(0.95 * a * parpadeo).toFixed(3)})`); g.addColorStop(0.55, `rgba(255,255,245,${(0.6 * a).toFixed(3)})`); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, 2 * Math.PI); ctx.fill();
    // unos rayitos en cruz, como un brillo que encandila
    ctx.strokeStyle = `rgba(255,255,255,${(0.8 * a).toFixed(3)})`; ctx.lineWidth = Math.max(1.5 / z, R * 0.06);
    const L = R * (1.2 + 0.4 * sube);
    for(let k = 0; k < 4; k++){ const ang = k * Math.PI / 4 + ms / 900; ctx.beginPath(); ctx.moveTo(c.x - Math.cos(ang) * L, c.y - Math.sin(ang) * L); ctx.lineTo(c.x + Math.cos(ang) * L, c.y + Math.sin(ang) * L); ctx.stroke(); }
  }
  ctx.restore();
  return LANZA_FX.length > 0 || LANZA_DESTELLOS.length > 0;
}
