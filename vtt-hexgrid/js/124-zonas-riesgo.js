/* 🕵 Zonas de riesgo (2026-11-20, dueño, jugando de GM con una rata en sigilo: «apretaba Control L para ver las superficies de visión de los
   rivales, pero me mostraba el cono de visión propio de la rata… Cuando uno está en sigilo tiene que haber algún comando… que le permita ver
   exclusivamente los conos de visión de los rivales… cuáles son las zonas de riesgo y cuáles son las zonas liberadas para poder caminar sin
   perder el sigilo»).
   Con un token EN SIGILO que esta pantalla maneja (el jugador, su personaje o su invocación; el GM, un creep, o un personaje del que tiene 🎮 el
   control), el modo pinta SOLO lo que miran sus rivales, y nada más:
   - rojo = el cono de algún rival: si entra, lo descubren en el acto y el movimiento se corta ahí;
   - naranja rayado = la zona de alerta de alguno: cada paso ahí pide una tirada de Percepción (no corta);
   - sin color = libre.
   Es la MISMA cuenta que la detección de verdad (`zonasSigilo`, js/02: la que usan `sigiloRevisar` y `sigiloEvaluarRuta`, js/03), juntada con
   `ZonasRiesgo.unir` (comun/zonas-riesgo.js). Mientras está prendido no se dibujan los 👓 lentes (ni el cono propio del token seleccionado).
   Solo cuentan los rivales que esta pantalla VE (`zonasRiesgoRivales`): un creep oculto, en sigilo o en la niebla no aporta zona (no se delata);
   por eso a un jugador el cartel le aclara «solo de los rivales que ves».
   Se prende y se apaga con el botón que late arriba a la derecha mientras hay alguien en sigilo (`#btn-vision-sigilo`), con Ctrl + L, o con el
   🕵 del anillo del token. Se apaga solo cuando ya no queda nadie en sigilo. No se guarda: al recargar arranca apagado.
   Reemplaza al «👁 Ver campo de visión de los rivales» del 2026-11-09 (js/79), que prendía los lentes con «ver todas»: con el token en sigilo
   seleccionado, los lentes mostraban solo SU cono (lo que vio el dueño). */
let zonasRiesgoActivas = false;
let zonasRiesgoLeyendaTxt = '';
// ¿Esta pantalla maneja a este token? (sin mirar la pausa: mirar se puede siempre)
function zonasRiesgoManejo(t){
  if(!t || !t.fichaId || !fbUsuario) return false;
  if(t.tipo === 'creep') return !!soyGM;
  if(t.tipo !== 'pj') return false;
  const base = String(t.fichaId).split(SEP_INVOCACION)[0];
  return (!soyGM && t.duenoUid === fbUsuario.uid) || (typeof controloFicha === 'function' && !!controloFicha(base));
}
// Los tokens en sigilo que maneja esta pantalla (ids).
function zonasRiesgoCandidatos(){
  const ids = [];
  tokens.forEach((t, id) => { if(enSigilo(t) && zonasRiesgoManejo(t)) ids.push(id); });
  return ids;
}
const zonasRiesgoPuede = t => !!t && enSigilo(t) && zonasRiesgoManejo(t);
// De quién se muestran las zonas ahora (id) o null.
function zonasRiesgoRef(){ return ZonasRiesgo.referencia(seleccion, zonasRiesgoCandidatos()); }
// Sus rivales (los mismos de la detección: `rivalesDe`) que esta pantalla ve, vivos y despiertos. Los que no se ven no aportan zona.
function zonasRiesgoRivales(ref){
  if(!ref) return [];
  return rivalesDe(ref).filter(r => {
    if(!tokenVisiblePorNiebla(r)) return false;
    const e = estadoDe(r);
    return !(e && (e.muerto || e.dormida));
  });
}
// → {ref, rivales, cono: [{col, fila}], alerta: [{col, fila}], union} de lo que se pinta ahora (null si el modo no tiene de quién).
function zonasRiesgoCalcular(){
  const id = zonasRiesgoRef(), ref = id ? tokens.get(id) : null;
  if(!ref) return null;
  const rivales = zonasRiesgoRivales(ref);
  const celdas = new Map();
  const zonas = rivales.map(r => {
    const z = zonasSigilo(r);
    const claves = lista => lista.map(c => { const k = nbPack(c.col, c.fila); celdas.set(k, c); return k; });
    return {cono: claves(z.cono), alerta: claves(z.alerta)};
  });
  const union = ZonasRiesgo.unir(zonas);
  return {id, ref, rivales, union, cono: [...union.cono].map(k => celdas.get(k)), alerta: [...union.alerta].map(k => celdas.get(k))};
}
// Para las pruebas y para quien quiera preguntar por una casilla: 'riesgo' | 'alerta' | 'libre' | '' (el modo no tiene de quién).
function zonasRiesgoEstadoDe(col, fila){
  const c = zonasRiesgoCalcular();
  return c ? ZonasRiesgo.estado(c.union, nbPack(col, fila)) : '';
}
const zonasRiesgoPrendidas = () => zonasRiesgoActivas && zonasRiesgoCandidatos().length > 0;
// Lo dibuja `dibujar` (js/05), en lugar de los lentes.
function zonasRiesgoDibujar(z){
  if(!zonasRiesgoActivas) return;
  const c = zonasRiesgoCalcular();
  zonasRiesgoLeyenda(c);
  if(!c) return;
  const camino = lista => { ctx.beginPath(); lista.forEach(h => { const p = hexCentro(h.col, h.fila); trazarHex(p.x, p.y); }); };
  if(c.alerta.length){
    camino(c.alerta);
    ctx.fillStyle = 'rgba(245,160,40,.20)'; ctx.fill();
    // El rayado, para que no se confunda con el rojo ni dependa solo del color.
    ctx.save();
    ctx.clip();
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    c.alerta.forEach(h => { const p = hexCentro(h.col, h.fila); x0 = Math.min(x0, p.x - HEX); y0 = Math.min(y0, p.y - HEX); x1 = Math.max(x1, p.x + HEX); y1 = Math.max(y1, p.y + HEX); });
    const paso = HEX * 0.36, alto = y1 - y0;
    ctx.beginPath();
    for(let x = x0 - alto; x < x1; x += paso){ ctx.moveTo(x, y1); ctx.lineTo(x + alto, y0); }
    ctx.strokeStyle = 'rgba(255,175,60,.7)'; ctx.lineWidth = Math.max(1.5 / z, HEX * 0.05); ctx.stroke();
    ctx.restore();
    camino(c.alerta);
    ctx.setLineDash([6 / z, 4 / z]); ctx.strokeStyle = 'rgba(255,180,70,.95)'; ctx.lineWidth = 2 / z; ctx.stroke(); ctx.setLineDash([]);
  }
  if(c.cono.length){
    camino(c.cono);
    ctx.fillStyle = 'rgba(225,35,35,.42)'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,90,80,.98)'; ctx.lineWidth = 2.5 / z; ctx.stroke();
  }
}
function zonasRiesgoLeyenda(c){
  const el = $('#riesgo-aviso');
  if(!el) return;
  const txt = zonasRiesgoActivas && c ? ZonasRiesgo.leyenda(esc(nombreDe(c.ref)), c.rivales.length, soyGM) : '';
  if(txt === zonasRiesgoLeyendaTxt) return;
  zonasRiesgoLeyendaTxt = txt;
  el.hidden = !txt;
  el.innerHTML = txt;
}
/* El botón de arriba (late mientras hay alguien en sigilo) y Ctrl + L (js/06). Los nombres `visionSigiloDisponible`, `renderBotonVisionSigilo` y
   `alternarVisionSigilo` son los que ya llamaban js/03 y js/06. */
function visionSigiloDisponible(){ return zonasRiesgoCandidatos().length > 0; }
function renderBotonVisionSigilo(){
  const b = $('#btn-vision-sigilo');
  if(!b) return;
  const hay = visionSigiloDisponible();
  if(!hay && zonasRiesgoActivas){ zonasRiesgoActivas = false; zonasRiesgoLeyenda(null); pedirDibujo(); }
  b.hidden = !hay;
  b.classList.toggle('activo', hay && zonasRiesgoActivas);
  b.textContent = hay && zonasRiesgoActivas ? '🕵 Ocultar zonas de riesgo (Ctrl + L)' : '🕵 Ver zonas de riesgo (Ctrl + L)';
  if(typeof actualizarAvisoLentes === 'function') actualizarAvisoLentes();
}
function alternarVisionSigilo(prender){
  if(!visionSigiloDisponible()){ toast('🕵 Las zonas de riesgo son para cuando tenés a alguien en sigilo'); return; }
  zonasRiesgoActivas = typeof prender === 'boolean' ? prender : !zonasRiesgoActivas;
  if(!zonasRiesgoActivas) zonasRiesgoLeyenda(null);
  renderBotonVisionSigilo(); if(typeof hudUbicar === 'function') hudUbicar(); pedirDibujo();
  toast(zonasRiesgoActivas ? '🕵 Zonas de riesgo a la vista: rojo = te descubren, naranja = tirada de Percepción, sin color = libre' : '🕵 Zonas de riesgo ocultas');
}
if($('#btn-vision-sigilo')) $('#btn-vision-sigilo').onclick = () => alternarVisionSigilo();
// El 🕵 del anillo del token (js/10): las de ESE token (queda seleccionado, así que es la referencia).
function zonasRiesgoHudIcono(t, icono){
  return zonasRiesgoPuede(t) ? icono('riesgo', '🕵', zonasRiesgoActivas ? 'Ocultar las zonas de riesgo (Ctrl + L)' : 'Zonas de riesgo (Ctrl + L): ver solo lo que miran los rivales — rojo te descubren, naranja piden tirada, sin color libre', zonasRiesgoActivas) : '';
}
