/* ---------- 👆 Los estados de un token al pasar el mouse (2026-10-09, pedido del dueño: «un detalle de los estados con hover sobre los tokens») ----------
   Con el mouse quieto un momento sobre un token que se ve (no arrastrando), un cartelito al lado del puntero lista sus estados alterados: el
   nombre en su color (verde beneficio, violeta perjuicio), los turnos que le quedan, el escudo y los stacks, y la descripción corta. Los datos
   son los mismos que ya ve cada uno (el resumen público; el escudo de un creep, solo el GM). Sin estados, no aparece nada (salvo la descripción de un
   token suelto, 2026-11-22).
   🔘 Desde el 2026-11-23 (dueño): cada estado dice solo su efecto en corto y los turnos que quedan (comun/estado-corto.js); el mouse sobre UN iconito
   de alrededor del token muestra solo ese. El detalle (origen, quién lo puso, la cuenta) está en ◎ Estados alterados del anillo (js/10). */
let hoverEstados = {id: null, tok: null, ic: null, timer: 0, x: 0, y: 0};
function hoverEstadosCaja(){
  let c = document.getElementById('hover-estados');
  if(c) return c;
  c = document.createElement('div');
  c.id = 'hover-estados';
  c.hidden = true;
  c.style.cssText = 'position:fixed;z-index:60;max-width:300px;pointer-events:none;background:rgba(20,16,20,.96);color:#EDE6DF;border:1px solid #4A3C43;'
    + 'border-radius:10px;padding:8px 10px;font:12px/1.35 "Space Grotesk",system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.5)';
  document.body.appendChild(c);
  return c;
}
function hoverEstadosOcultar(){
  clearTimeout(hoverEstados.timer);
  hoverEstados.id = null; hoverEstados.tok = null; hoverEstados.ic = null;
  const c = document.getElementById('hover-estados');
  if(c) c.hidden = true;
}
function hoverEstadosHtml(t){
  const est = estadoDe(t);
  const lista = est ? est.estados.filter(e => e && e.nombre) : [];
  // ＋ Token suelto (2026-11-22, dueño: un NPC u objeto con «una imagen, un nombre y una descripción»): la descripción se lee al pasar el mouse.
  const desc = TokensAuto.esSuelto(t) ? String(t.descripcion || '').trim() : '';
  const vidaS = TokensAuto.sueltoVida(t) ? TokensAuto.sueltoRasgos(t, {veVida: soyGM || t.tipo !== 'creep'})[0] : '';   // 📦 con vida: cuánta le queda (2026-11-23)
  const descHtml = (desc ? `<div style="margin-top:4px;white-space:pre-wrap;color:#EDE6DF">${esc(desc.length > 400 ? desc.slice(0, 397) + '…' : desc)}</div>` : '')
    + (vidaS ? `<div style="margin-top:4px;color:#F28B82">${esc(vidaS)}</div>` : '');
  if(!lista.length) return descHtml ? `<div style="font-weight:700;color:#F0D27A">${esc(nombreDe(t))}</div>${descHtml}` : '';
  // 🔘 (2026-11-23, dueño: «los iconos que están visibles alrededor del token, que te den puramente el efecto… si querés ver el detalle de los
  // estados, tenés que ir al botón de estados alterados»): cada renglón, como el globo de su iconito — el nombre (con su número), lo que hace en corto
  // y los turnos que le quedan. El detalle (de dónde viene, quién lo puso, la cuenta del sobrepeso) va en ◎ Estados alterados (js/10).
  const o = estadoCortoOpc(t), veEscudo = soyGM || t.tipo !== 'creep';
  const filas = lista.map(e => estadoCortoFilaHtml(veEscudo ? e : {...e, escudo: undefined, escudoMax: undefined}, o, 5)).join('');
  return `<div style="font-weight:700;color:#F0D27A">${esc(nombreDe(t))}</div>${descHtml}${filas}`;
}
// Las opciones de EstadoCorto para un token: su sobrepeso (del resumen) y cómo nombrar a otro token sin delatar a uno que esta pantalla no ve.
function estadoCortoOpc(t){
  const v = vinculo(t), r = (v && v.resumen) || {};
  // (el id guardado puede ser el del token o el de su ficha / creep) → [id del token, token]
  const tokDe = id => !id ? null : tokens.has(id) ? [id, tokens.get(id)] : ([...tokens.entries()].find(([, x]) => x && x.fichaId === id) || null);
  const vistos = new Set((typeof disposicion !== 'undefined' ? disposicion : []).map(d => d.id));
  return {sobre: num(r.sobre), sobreCuenta: r.sobreCuenta || null,
    nombreDe: id => { const x = tokDe(id); return x ? nombreDe(x[1]) : ''; },
    oculto: id => { if(soyGM) return false; const x = tokDe(id); return !!(x && !vistos.has(x[0])); }};
}
// Un renglón del globo: «Sobrepeso 2» en su color, lo que hace y los turnos que quedan.
function estadoCortoFilaHtml(e, o, arriba){
  const g = e && e.mano ? {titulo: 'Nada en la mano', efecto: 'Pega sin arma (con los puños)', dura: ''} : EstadoCorto.globo(e, o);
  const color = ESTADO_COLOR[e && e.polaridad] || ESTADO_COLOR[''];
  return `<div style="margin-top:${arriba}px"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};margin-right:6px;vertical-align:1px"></span>`
    + `<b>${esc(g.titulo)}</b>${g.dura ? ` <span style="color:#B7A99F">· ${esc(g.dura)}</span>` : ''}`
    + (g.efecto ? `<div style="color:#D9CFC6;font-size:11.5px;margin-left:14px">${esc(g.efecto)}</div>` : '') + '</div>';
}
// 🔘 El globo de UN iconito alrededor del token: solo ese estado (o los que no entraron, si es el «+N»).
function hoverIconoHtml(t, ic){
  const o = estadoCortoOpc(t), veEscudo = soyGM || t.tipo !== 'creep';
  const limpio = e => veEscudo ? e : {...e, escudo: undefined, escudoMax: undefined};
  if(ic.resto) return `<div style="font-weight:700;color:#F0D27A">${ic.resto.length} estados más</div>` + ic.resto.map(e => estadoCortoFilaHtml(limpio(e), o, 4)).join('');
  return estadoCortoFilaHtml(limpio(ic.e), o, 0);
}
function hoverEstadosMostrar(){
  const t = tokens.get(hoverEstados.tok);
  const html = !t ? '' : hoverEstados.ic ? hoverIconoHtml(t, hoverEstados.ic) : hoverEstadosHtml(t);
  const c = hoverEstadosCaja();
  if(!html){ c.hidden = true; return; }
  c.innerHTML = html;
  c.hidden = false;
  // Al lado del puntero, sin salirse de la pantalla.
  const w = c.offsetWidth, h = c.offsetHeight;
  let x = hoverEstados.x + 16, y = hoverEstados.y + 16;
  if(x + w > innerWidth - 8) x = hoverEstados.x - w - 12;
  if(y + h > innerHeight - 8) y = innerHeight - h - 8;
  c.style.left = Math.max(8, x) + 'px';
  c.style.top = Math.max(8, y) + 'px';
}
lienzo.addEventListener('pointermove', e => {
  if(e.buttons){ hoverEstadosOcultar(); return; }   // arrastrando: nada
  const {px, py} = posEvento(e);
  const m = pantallaAMundo(px, py);
  // 🔘 Primero un iconito de estado (2026-11-23): su globo dice solo ese estado; si no, el token entero.
  const ic = typeof iconoEn === 'function' ? iconoEn(m.x, m.y) : null;
  const tok = ic ? ic.id : tokenEn(m.x, m.y);
  const id = ic ? `ic:${ic.id}:${ic.resto ? '+' : (ic.e && ic.e.nombre)}` : tok;
  hoverEstados.x = e.clientX; hoverEstados.y = e.clientY;
  if(id !== hoverEstados.id){
    hoverEstadosOcultar();
    if(!id) return;
    hoverEstados.id = id; hoverEstados.tok = tok; hoverEstados.ic = ic;
    hoverEstados.timer = setTimeout(hoverEstadosMostrar, ic ? 200 : 350);
  }else if(id && !hoverEstadosCaja().hidden) hoverEstadosMostrar();   // sigue al puntero
});
['pointerleave', 'pointerdown', 'wheel'].forEach(ev => lienzo.addEventListener(ev, hoverEstadosOcultar, {passive: true}));
