/* 🪝 La animación de Arrastrar (2026-11-04, dueño: «a Arrastrar también sumarle una animación de grappling hook, una cadena con un gancho…»).
   La geometría está en comun/fx-gancho.js; acá se publica y se dibuja.
   Para que la vean TODAS las pantallas viaja como un momento sin tarjeta (js/16, tipo 'gancho-fx', con {de, a, resultado, celdas, semilla}).
   La publica la pantalla que resuelve el enganche (js/78 arrastrarEnganche / arrastrarTraer) cuando ya sabe cómo salió, y espera a que termine
   (`ganchoFxPublicar` devuelve la promesa) antes de seguir con el aviso o el golpe, así el duelo no la tapa.
   El flujo (dueño, 2026-11-04): al elegir el objetivo sale el gancho ('sale': vuela hasta el rival y queda un instante), se abre el duelo, y según
   cómo salió, 'falla' o 'trae' arrancan con el gancho ya junto al rival (`sinLanza`).
   - 'falla': el gancho vuela, pasa de largo y vuelve con la cadena floja.
   - 'suelta': engancha (chispa), la cadena se tensa, tiembla y se suelta.
   - 'trae': engancha, se tensa y el token del rival se DESLIZA por las casillas reales del arrastre (`celdas`): mientras dura, el dibujo del token
     sigue a la animación (`ganchoFxPosToken`, js/05 calcularDisposicion) aunque su casilla nueva ya haya llegado, así no salta; al terminar, la
     cadena se suelta y el gancho vuelve.
   En coordenadas del mapa (respeta zoom y paneo), no toca clics; si uno de los dos no se ve en esta pantalla (oculto, niebla, sigilo), no se dibuja
   (no delata dónde está). Con «reducir movimiento»: más corta y sin temblor. */
const GANCHO_FX = [];   // {de, a, resultado, celdas[{col,fila}], t0, tt, semilla, poco}
const ganchoFxVistos = new Set();
const ganchoPocoMovimiento = () => { try{ return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } };

// → una promesa que se cumple cuando la animación terminó (para que quien la publica espere antes del aviso o el golpe).
async function ganchoFxPublicar(deId, aId, resultado, celdas, sinLanza, dueloId){
  if(typeof FxGancho === 'undefined' || !deId || !aId) return;
  const cel = Array.isArray(celdas) ? celdas.map(c => ({col: Math.round(num(c.col)), fila: Math.round(num(c.fila))})) : [];
  const datos = {de: deId, a: aId, resultado: String(resultado || 'falla'), celdas: cel, semilla: Math.floor(Math.random() * 1e9), ...(sinLanza ? {sinLanza: true} : {}), ...(dueloId ? {duelo: String(dueloId)} : {})};
  const id = typeof momentoAbrir === 'function' ? await momentoAbrir({tipo: 'gancho-fx', icono: '', titulo: '', estado: 'listo', datos}) : null;
  if(!id) ganchoFxEmpezar(datos);
  const tt = FxGancho.tiempos(datos.resultado, Math.max(1, cel.length - 1), ganchoPocoMovimiento(), !!sinLanza);
  await new Promise(r => setTimeout(r, tt.total + 120));
}
// Cuánto tarda en empezar a arrastrar (vuela, engancha y se tensa): js/78 mueve el token recién ahí, así nadie lo ve llegar antes que la cadena.
function ganchoFxAntesDeArrastrar(celdas, sinLanza){
  if(typeof FxGancho === 'undefined') return 0;
  const tt = FxGancho.tiempos('trae', Math.max(1, (celdas || []).length - 1), ganchoPocoMovimiento(), !!sinLanza);
  return tt.lanza + tt.engancha + tt.tensa;
}
// Llega a cada pantalla (js/16). Una sola vez, y solo si es de recién.
function ganchoFxRecibido(id, d){
  if(!d || !d.datos || ganchoFxVistos.has(id)) return;
  ganchoFxVistos.add(id);
  const t = d.creado && d.creado.toMillis ? d.creado.toMillis() : Date.now();
  if(Date.now() - t > 20000) return;
  ganchoFxEmpezar(d.datos);
}
function ganchoFxEmpezar(dt){
  if(typeof FxGancho === 'undefined' || !tokens.get(dt.de) || !tokens.get(dt.a)) return;
  const celdas = Array.isArray(dt.celdas) ? dt.celdas : [], poco = ganchoPocoMovimiento();
  const resultado = dt.resultado === 'trae' && celdas.length < 2 ? 'suelta' : String(dt.resultado || 'falla');
  GANCHO_FX.push({de: dt.de, a: dt.a, resultado, celdas, semilla: num(dt.semilla) || 1, poco, t0: performance.now(),
    tt: FxGancho.tiempos(resultado, Math.max(1, celdas.length - 1), poco, !!dt.sinLanza)});
  // El cuadro del duelo del gancho se aparta mientras dura (si no, la tapa) y vuelve solo (2026-11-04).
  if(dt.duelo && typeof Duelo !== 'undefined' && Duelo.apartar){ try{ Duelo.apartar(dt.duelo, GANCHO_FX[GANCHO_FX.length - 1].tt.total + 400); }catch(e){} }
  pedirDibujo();
}
const ganchoFxVe = t => !!t && (!t.oculto || soyGM) && (typeof tokenVisiblePorNiebla !== 'function' || tokenVisiblePorNiebla(t));
const ganchoCentros = fx => fx.celdas.map(c => hexCentro(c.col, c.fila));

// Dónde se dibuja el token arrastrado mientras dura la animación (o null: donde está). Lo usa calcularDisposicion (js/05).
function ganchoFxPosToken(id){
  for(const fx of GANCHO_FX){
    if(fx.a !== id || fx.resultado !== 'trae' || fx.celdas.length < 2) continue;
    const f = FxGancho.fase(performance.now() - fx.t0, fx.tt);
    if(f.fase === 'vuelve' || f.fase === 'fin') continue;
    const cs = ganchoCentros(fx);
    return f.fase === 'arrastra' ? FxGancho.recorrido(cs, f.k) : cs[0];
  }
  return null;
}

/* 🫨 «−2 EVA» flotando sobre el arrastrado al llegar (dueño, 2026-11-05: «que aparezca una animación sobre el token, un menos 2 EVA o algo así, para que
   quede claro que fue al final del arrastre»). Momento sin tarjeta 'gancho-eva' ({a, texto}); lo publica la pantalla que pone el Desequilibrado
   (js/78, cuando la cadena ya soltó). Sube un poco y se apaga en ~1,6 s; con «reducir movimiento», queda quieto y se apaga. */
const GANCHO_EVA = [];   // {a, texto, t0, dur, poco}
const ganchoEvaVistos = new Set();
async function ganchoEvaPublicar(aId, texto){
  if(!aId) return;
  const datos = {a: aId, texto: String(texto || '−2 EVA').slice(0, 20)};
  const id = typeof momentoAbrir === 'function' ? await momentoAbrir({tipo: 'gancho-eva', icono: '', titulo: '', estado: 'listo', datos}) : null;
  if(!id) ganchoEvaEmpezar(datos);
}
function ganchoEvaRecibido(id, d){
  if(!d || !d.datos || ganchoEvaVistos.has(id)) return;
  ganchoEvaVistos.add(id);
  const t = d.creado && d.creado.toMillis ? d.creado.toMillis() : Date.now();
  if(Date.now() - t > 20000) return;
  ganchoEvaEmpezar(d.datos);
}
function ganchoEvaEmpezar(dt){
  if(!dt || !tokens.get(dt.a)) return;
  GANCHO_EVA.push({a: dt.a, texto: String(dt.texto || '−2 EVA'), t0: performance.now(), dur: 1600, poco: ganchoPocoMovimiento()});
  pedirDibujo();
}
function ganchoEvaDibujar(z){
  const ahora = performance.now();
  for(let i = GANCHO_EVA.length - 1; i >= 0; i--){
    const fx = GANCHO_EVA[i], k = (ahora - fx.t0) / fx.dur;
    if(k >= 1){ GANCHO_EVA.splice(i, 1); continue; }
    const t = tokens.get(fx.a);
    if(!ganchoFxVe(t)) continue;
    const c = hexCentro(t.col, t.fila);
    // Aparece de golpe (crece un poquito), sube ~0,7 casilla y se apaga en el último tercio.
    const sube = fx.poco ? 0 : HEX * 0.7 * Math.min(1, k * 1.4), alfa = k < 0.65 ? 1 : Math.max(0, 1 - (k - 0.65) / 0.35);
    const esc = fx.poco ? 1 : (k < 0.12 ? 0.6 + (k / 0.12) * 0.5 : k < 0.22 ? 1.1 - ((k - 0.12) / 0.1) * 0.1 : 1);
    const px = Math.max(14 / z, HEX * 0.62) * esc;
    ctx.save();
    ctx.globalAlpha = alfa;
    ctx.font = `900 ${px}px system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const y = c.y - HEX * 1.05 - sube;
    ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(3 / z, px * 0.2); ctx.strokeStyle = 'rgba(20,6,8,.95)';
    ctx.strokeText(fx.texto, c.x, y);
    ctx.shadowColor = 'rgba(255,60,60,.8)'; ctx.shadowBlur = px * 0.5;
    ctx.fillStyle = '#ff4d4d'; ctx.fillText(fx.texto, c.x, y);
    ctx.restore();
  }
  return GANCHO_EVA.length > 0;
}

// El dibujo (js/05, encima de los tokens, con los otros efectos). true mientras quede alguna en curso.
function dibujarEfectosGancho(z){
  const eva = GANCHO_EVA.length ? ganchoEvaDibujar(z) : false;
  if(!GANCHO_FX.length) return eva;
  const ahora = performance.now();
  for(let i = GANCHO_FX.length - 1; i >= 0; i--){
    const fx = GANCHO_FX[i], ms = ahora - fx.t0;
    if(ms >= fx.tt.total + 60){ GANCHO_FX.splice(i, 1); continue; }
    const ta = tokens.get(fx.de), tb = tokens.get(fx.a);
    if(!ganchoFxVe(ta) || !ganchoFxVe(tb)) continue;
    ganchoFxDibujarUna(fx, ms, z, hexCentro(ta.col, ta.fila), tb);
  }
  return GANCHO_FX.length > 0 || GANCHO_EVA.length > 0;
}
function ganchoFxDibujarUna(fx, ms, z, A, tb){
  const F = FxGancho, f = F.fase(ms, fx.tt), r = fx.resultado;
  // Dónde está el rival (al empezar, su casilla de origen si lo van a traer).
  const cs = r === 'trae' && fx.celdas.length >= 2 ? ganchoCentros(fx) : null;
  const B0 = cs ? cs[0] : hexCentro(tb.col, tb.fila);
  const Bfin = cs ? cs[cs.length - 1] : B0;
  const dx = B0.x - A.x, dy = B0.y - A.y, l = Math.hypot(dx, dy) || 1;
  // Sale del borde del token, no del centro.
  const salida = {x: A.x + dx / l * HEX * 0.5, y: A.y + dy / l * HEX * 0.5};
  const borde = (P, Q) => { const ex = Q.x - P.x, ey = Q.y - P.y, el = Math.hypot(ex, ey) || 1; return {x: P.x + ex / el * HEX * 0.45, y: P.y + ey / el * HEX * 0.45}; };
  let gancho, flojo = 0.6, temblor = 0, alfa = 1, chispa = 0, angulo = Math.atan2(dy, dx);
  if(f.fase === 'lanza'){
    const dest = r === 'falla' ? B0 : borde(B0, A);
    gancho = F.volar(salida, dest, f.k); flojo = 0.65 - 0.35 * f.k;
  }else if(f.fase === 'engancha'){
    if(r === 'falla'){   // pasa de largo y se va de costado
      const mas = {x: B0.x + dx / l * HEX * 1.1 - dy / l * HEX * 0.5, y: B0.y + dy / l * HEX * 1.1 + dx / l * HEX * 0.5};
      gancho = F.volar(B0, mas, f.k); flojo = 0.3 + 0.6 * f.k; angulo = Math.atan2(mas.y - B0.y, mas.x - B0.x);
    }else{ gancho = borde(B0, A); flojo = 0.3 * (1 - f.k); chispa = 1 - f.k; }
  }else if(f.fase === 'tensa' && r === 'sale'){   // queda junto al rival, la cadena floja, y se desvanece (sigue el duelo)
    gancho = borde(B0, A); flojo = 0.35; alfa = f.k > 0.6 ? (1 - f.k) / 0.4 : 1;
  }else if(f.fase === 'tensa'){
    gancho = borde(B0, A); flojo = 0; temblor = r === 'suelta' && !fx.poco ? 1 : 0.25;
  }else if(f.fase === 'arrastra'){
    const p = F.recorrido(cs, f.k); gancho = borde(p, A); flojo = 0; temblor = fx.poco ? 0 : 0.35;
    angulo = Math.atan2(p.y - A.y, p.x - A.x);
  }else{   // vuelve: desde donde quedó, con la cadena floja enrollándose
    const desde = r === 'falla' ? {x: B0.x + dx / l * HEX * 1.1 - dy / l * HEX * 0.5, y: B0.y + dy / l * HEX * 1.1 + dx / l * HEX * 0.5}
      : borde(Bfin, A);
    gancho = F.volar(desde, salida, f.k); flojo = 0.9 - 0.6 * f.k; alfa = f.k > 0.85 ? (1 - f.k) / 0.15 : 1;
    angulo = Math.atan2(desde.y - salida.y, desde.x - salida.x);
  }
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alfa));
  // La cadena: eslabones de metal (uno de frente, otro de canto), con panza si está floja.
  const pts = F.cadena(salida, gancho, flojo, ms, temblor, 28);
  const paso = Math.max(HEX * 0.16, 3 / z);
  F.eslabones(pts, paso).forEach(e => {
    ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(e.ang);
    const w = paso * 0.62, h = e.par ? paso * 0.36 : paso * 0.12;
    ctx.beginPath(); ctx.ellipse(0, 0, w, Math.max(h, 0.6 / z), 0, 0, 2 * Math.PI);
    ctx.lineWidth = Math.max(1.4 / z, HEX * 0.045); ctx.strokeStyle = 'rgba(30,30,34,.9)'; ctx.stroke();
    ctx.lineWidth = Math.max(0.8 / z, HEX * 0.025); ctx.strokeStyle = e.par ? 'rgba(200,205,215,.95)' : 'rgba(150,155,165,.95)'; ctx.stroke();
    ctx.restore();
  });
  // El gancho: un garfio de tres puntas, apuntando hacia donde vuela.
  ctx.save(); ctx.translate(gancho.x, gancho.y); ctx.rotate(angulo);
  const s = HEX * 0.42;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const trazo = (ancho, color) => {
    ctx.lineWidth = ancho; ctx.strokeStyle = color;
    ctx.beginPath(); ctx.moveTo(-s * 0.9, 0); ctx.lineTo(s * 0.35, 0); ctx.stroke();   // la caña
    [-1, 1].forEach(lado => { ctx.beginPath(); ctx.moveTo(s * 0.35, 0); ctx.quadraticCurveTo(s * 0.75, lado * s * 0.55, s * 0.2, lado * s * 0.75); ctx.stroke(); });   // las uñas
    ctx.beginPath(); ctx.moveTo(s * 0.35, 0); ctx.lineTo(s * 0.8, 0); ctx.stroke();   // la punta del medio
    ctx.beginPath(); ctx.arc(-s * 0.95, 0, s * 0.14, 0, 2 * Math.PI); ctx.stroke();   // el ojal
  };
  trazo(Math.max(3 / z, HEX * 0.11), 'rgba(25,25,30,.95)');
  trazo(Math.max(1.6 / z, HEX * 0.06), 'rgba(210,215,225,1)');
  ctx.restore();
  // La chispa del enganche.
  if(chispa > 0){
    ctx.save(); ctx.translate(gancho.x, gancho.y);
    ctx.globalAlpha = Math.min(1, chispa) * alfa;
    for(let k = 0; k < 8; k++){
      const ang = k * Math.PI / 4 + fx.semilla % 7, largo = HEX * (0.25 + 0.3 * (1 - chispa));
      ctx.beginPath(); ctx.moveTo(Math.cos(ang) * HEX * 0.08, Math.sin(ang) * HEX * 0.08); ctx.lineTo(Math.cos(ang) * largo, Math.sin(ang) * largo);
      ctx.lineWidth = Math.max(1.5 / z, HEX * 0.04); ctx.strokeStyle = 'rgba(255,220,120,1)'; ctx.stroke();
    }
    ctx.restore();
  }
  ctx.restore();
}
