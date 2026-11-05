// js/104-hex-info.js — ⬡ Ver qué afecta a una casilla (2026-11-05, dueño, docs/pendientes.md «⬡ Seleccionar un hexágono libre»).
// Gesto: un clic quieto (sin arrastrar) en una casilla SIN token, sin ninguna herramienta prendida y sin estar eligiendo un destino → arriba a la
// derecha, debajo del cartel del nombre, el cartel «⬡ Hexágono libre» con todo lo que la toca: zonas (estado, daño, turnos que quedan), auras de
// estandartes / tótems / aura sanadora (js/73, js/103, js/70), trampas, fuego, hielo y agua (js/50), Sólidos, paredes de colisión, portales, nubes,
// luces, el arma en el piso, el Acelerador… Clic en un elemento: se selecciona como siempre y además sale este cartel. Esc, ✕, un clic afuera o
// seleccionar un token lo cierran. No toca js/06: escucha el lienzo en captura, así el paneo, el ping, mover y las herramientas siguen igual.
// Lo que se ve son las mismas reglas del mapa: `puedeVerElemento` (trampas ajenas, invisibles solo para el GM), la niebla de guerra (una casilla sin
// explorar dice solo «Sin explorar») y los tokens ocultos o tapados por la niebla no dan su aura. Lo puro (los textos) en comun/hex-info.js.

let hexInfoCelda = null;      // {col, fila} de la casilla que muestra el cartel, o null
let hexInfoClic = null;       // el pointerdown que puede terminar en un clic quieto
let hexInfoFirma = '';

function hexInfoGestoLibre(){
  return !herramientaActiva && !elegirDestinoCb && !colocando && !moverLibre && !(typeof creando !== 'undefined' && creando);
}

// La lista de lo que afecta a esa casilla, según quién mira. → {titulo, items}
function hexInfoDatos(celda){
  const k = nbPack(celda.col, celda.fila);
  if(nieblaAplica() && !nieblaVista.has(k) && !nieblaDescubierta.has(k) && !(typeof nieblaEnteros !== 'undefined' && nieblaEnteros.has(k)))
    return HexInfo.armar({sinExplorar: true});
  const items = [];
  const igual = c => c.col === celda.col && c.fila === celda.fila;
  elementos.forEach((el, id) => {
    if(id === ID_BORRADOR || !puedeVerElemento(el) || !celdasDeElemento(el).some(igual)) return;
    let quedan;
    if(el.venceMant !== null && el.venceMant !== undefined && mantenimientoNumero !== null){
      const porTurnos = Math.round(num(el.turnos)) > 0 && colocadorEnOrden(colocadorDe(el));
      quedan = porTurnos ? Math.round(num(el.turnos)) : Math.max(0, el.venceMant - mantenimientoNumero);
    }
    items.push(...HexInfo.describir(el, {quedan, oculto: !!el.invisible || (el.trampa && !el.disparada && soyGM && !el.descubierta)}));
  });
  // Las auras de los tokens que se ven (un estandarte oculto o tapado por la niebla no se delata).
  const seVe = x => !(x.oculto && !soyGM) && !x.bajoTierra && (typeof tokenVisiblePorNiebla !== 'function' || tokenVisiblePorNiebla(x));
  const nombre = x => (vinculo(x) || {}).nombre || x.nombre || '';
  if(typeof estandarteInfo === 'function') tokens.forEach((x, id) => {
    const e = estandarteInfo(x);
    if(!e || !seVe(x) || !estandarteEnPie(id, x) || distanciaHex({col: x.col, fila: x.fila}, celda) > e.radio) return;
    const quien = x.tipo === 'creep' ? 'los creeps' : 'los personajes';
    items.push(e.silencio
      ? {icono: '🤐', titulo: `Aura de ${nombre(x) || 'un tótem de silencio'}`, detalle: `Tótem de silencio: los rivales de ${quien} que estén acá no pueden usar habilidades que cuestan SP.`, clase: 'aura', orden: 6}
      : {icono: '🚩', titulo: `Aura de ${nombre(x) || 'un estandarte'}`, detalle: `Estandarte de guerra: ${quien} que estén acá suman +${e.pdg} a la Probabilidad de Golpe y +${e.dano} al daño.`, clase: 'aura', orden: 6});
  });
  if(typeof auraCuraEnEstados === 'function' && typeof AURA_CURA_RADIO !== 'undefined') tokens.forEach(x => {
    if(x.tipo !== 'creep' || !seVe(x) || distanciaHex({col: x.col, fila: x.fila}, celda) > AURA_CURA_RADIO) return;
    if(!auraCuraEnEstados(typeof estadoDe === 'function' ? estadoDe(x) : null)) return;
    items.push({icono: '✚', titulo: `Aura sanadora de ${nombre(x) || 'un creep'}`, detalle: 'Cura a los creeps aliados que estén acá.', clase: 'aura', orden: 6});
  });
  // La luz de la escena, si hay niebla de guerra y no es la normal.
  if(nieblaActiva && luzEscena !== VISION_RADIO){
    const p = LUZ_PRESETS.find(x => x[0] === luzEscena);
    items.push({icono: luzEscena < VISION_RADIO ? '🌙' : '☀', titulo: `Luz de la escena: ${p ? p[1] : luzEscena}`, detalle: `Se ve a ${luzEscena} casilla${luzEscena === 1 ? '' : 's'}.`, clase: 'luz', orden: 9});
  }
  const recordada = nieblaAplica() && !nieblaVista.has(k);
  return HexInfo.armar({items, recordada});
}

// Plegado/desplegado (2026-11-05, dueño): sale plegado — solo el título, un contador y ▸ — y se acuerda la elección (localStorage).
let hexInfoAbierto = false;
try { hexInfoAbierto = localStorage.getItem('hex-info-abierto') === '1'; } catch(_){}
const hexInfoVacio = d => d.items.length === 1 && d.items[0].titulo === 'Nada la afecta';
function hexInfoLista(d){
  const fila = x => `<li class="hi-${esc(x.clase || 'otro')}${x.oculto ? ' hi-oculto' : ''}"><span class="hi-ico">${esc(x.icono)}</span>` +
    `<span class="hi-txt"><b>${esc(x.titulo)}</b>${x.oculto ? ' <em>👁 los jugadores no lo ven</em>' : ''}${x.detalle ? `<small>${esc(x.detalle)}</small>` : ''}</span></li>`;
  return `<ul>${d.items.map(fila).join('')}</ul>`;
}
function hexInfoHtml(d, celda){
  const vacio = hexInfoVacio(d), n = d.items.length;
  const extra = vacio ? '<span class="hi-cuenta">Nada la afecta</span>'
    : `<span class="hi-cuenta">${n} cosa${n === 1 ? '' : 's'}</span><button type="button" class="hi-toggle" aria-expanded="${hexInfoAbierto}" ` +
      `title="${hexInfoAbierto ? 'Plegar' : 'Ver la descripción'}" aria-label="${hexInfoAbierto ? 'Plegar' : 'Ver la descripción'}">${hexInfoAbierto ? '▾' : '▸'}</button>`;
  return `<div class="hi-cab"><b>⬡ ${esc(d.titulo)}</b>${extra}<span class="hi-coord">${celda.col} · ${celda.fila}</span>` +
    `<button type="button" class="hi-cerrar" title="Cerrar (Esc)" aria-label="Cerrar">✕</button></div>${!vacio && hexInfoAbierto ? hexInfoLista(d) : ''}`;
}

// El globo: pasando el mouse por la casilla marcada sale la descripción completa al lado del cursor.
let hexInfoGloboFirma = '';
function hexInfoGlobo(){
  let g = $('#hex-info-globo');
  if(!g){ g = document.createElement('div'); g.id = 'hex-info-globo'; g.hidden = true; (lienzo.parentElement || document.body).appendChild(g); }
  return g;
}
function hexInfoGloboOcultar(){ const g = $('#hex-info-globo'); if(g) g.hidden = true; hexInfoGloboFirma = ''; }
lienzo.addEventListener('pointermove', e => {
  if(!hexInfoCelda || e.buttons){ hexInfoGloboOcultar(); return; }
  const {px, py} = posEvento(e), w = pantallaAMundo(px, py), c = mundoAHex(w.x, w.y);
  if(c.col !== hexInfoCelda.col || c.fila !== hexInfoCelda.fila){ hexInfoGloboOcultar(); return; }
  const g = hexInfoGlobo(), d = hexInfoDatos(hexInfoCelda);
  const html = `<b class="hi-gtit">⬡ ${esc(d.titulo)}</b>${hexInfoLista(d)}`;
  if(html !== hexInfoGloboFirma){ g.innerHTML = html; hexInfoGloboFirma = html; }
  g.hidden = false;
  const pr = g.offsetParent ? g.offsetParent.getBoundingClientRect() : {left: 0, top: 0, width: innerWidth, height: innerHeight};
  let x = e.clientX - pr.left + 16, y = e.clientY - pr.top + 16;
  if(x + g.offsetWidth > pr.width - 8) x = Math.max(8, e.clientX - pr.left - g.offsetWidth - 16);
  if(y + g.offsetHeight > pr.height - 8) y = Math.max(8, pr.height - g.offsetHeight - 8);
  g.style.left = x + 'px'; g.style.top = y + 'px';
});
lienzo.addEventListener('pointerleave', hexInfoGloboOcultar);

function hexInfoMostrar(celda){
  hexInfoCelda = celda;
  hexInfoFirma = '';
  hexInfoRefrescar();
  dibujar();
}
function hexInfoCerrar(){
  if(!hexInfoCelda) return;
  hexInfoCelda = null;
  hexInfoFirma = '';
  const caja = $('#hex-info');
  if(caja) caja.hidden = true;
  hexInfoGloboOcultar();
  dibujar();
}
// Lo vuelve a armar (cada medio segundo mientras está abierto: una zona que aparece o se va, un estandarte que llega) y lo ubica debajo de los
// carteles de nombre que estén a la vista.
function hexInfoRefrescar(){
  const caja = $('#hex-info');
  if(!caja || !hexInfoCelda) return;
  if(seleccion){ hexInfoCerrar(); return; }
  const html = hexInfoHtml(hexInfoDatos(hexInfoCelda), hexInfoCelda);
  if(html !== hexInfoFirma){ caja.innerHTML = html; hexInfoFirma = html; }
  let top = 64;
  ['#token-etiqueta', '#elemento-etiqueta'].forEach(s => { const e = $(s); if(e && !e.hidden && e.offsetHeight) top = Math.max(top, e.offsetTop + e.offsetHeight + 8); });
  caja.style.top = top + 'px';
  caja.hidden = false;
}
setInterval(() => { if(hexInfoCelda) hexInfoRefrescar(); }, 500);

// El borde de la casilla elegida, en el lienzo (lo llama js/05).
function hexInfoDibujar(z){
  if(!hexInfoCelda) return;
  const c = hexCentro(hexInfoCelda.col, hexInfoCelda.fila);
  ctx.save();
  ctx.beginPath(); trazarHex(c.x, c.y);
  ctx.fillStyle = 'rgba(227,176,75,.12)'; ctx.fill();
  ctx.setLineDash([6 / z, 4 / z]); ctx.lineWidth = 2.5 / z; ctx.strokeStyle = 'rgba(227,176,75,.95)'; ctx.stroke();
  ctx.restore();
}

lienzo.addEventListener('pointerdown', e => {
  hexInfoClic = null;
  if(e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || !hexInfoGestoLibre()) { if(e.button === 0) hexInfoCerrar(); return; }
  const {px, py} = posEvento(e), w = pantallaAMundo(px, py);
  if(tokenEn(w.x, w.y)){ hexInfoCerrar(); return; }
  hexInfoClic = {px, py, w};
}, true);
lienzo.addEventListener('pointerup', e => {
  const c = hexInfoClic;
  hexInfoClic = null;
  if(!c || e.button !== 0 || !hexInfoGestoLibre()) return;
  const {px, py} = posEvento(e);
  if(Math.hypot(px - c.px, py - c.py) > 5){ return; }   // fue un arrastre (paneo, mover una forma): no
  if(seleccion) return;
  hexInfoMostrar(mundoAHex(c.w.x, c.w.y));
}, true);
// Afuera del lienzo y del cartel: se cierra. El ✕ también.
document.addEventListener('pointerdown', e => {
  if(!hexInfoCelda) return;
  const caja = $('#hex-info');
  if(caja && caja.contains(e.target)){
    if(e.target.closest('.hi-cerrar')) hexInfoCerrar();
    else if(e.target.closest('.hi-toggle')){
      hexInfoAbierto = !hexInfoAbierto;
      try { localStorage.setItem('hex-info-abierto', hexInfoAbierto ? '1' : '0'); } catch(_){}
      hexInfoFirma = ''; hexInfoRefrescar();
    }
    return;
  }
  if(e.target !== lienzo) hexInfoCerrar();
}, true);
document.addEventListener('keydown', e => { if(e.key === 'Escape' && hexInfoCelda) hexInfoCerrar(); });
