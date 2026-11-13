/* ---------- 👆 Los estados de un token al pasar el mouse (2026-10-09, pedido del dueño: «un detalle de los estados con hover sobre los tokens») ----------
   Con el mouse quieto un momento sobre un token que se ve (no arrastrando), un cartelito al lado del puntero lista sus estados alterados: el
   nombre en su color (verde beneficio, violeta perjuicio), los turnos que le quedan, el escudo y los stacks, y la descripción corta. Los datos
   son los mismos que ya ve cada uno (el resumen público; el escudo de un creep, solo el GM). Sin estados, no aparece nada. */
let hoverEstados = {id: null, timer: 0, x: 0, y: 0};
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
  hoverEstados.id = null;
  const c = document.getElementById('hover-estados');
  if(c) c.hidden = true;
}
function hoverEstadosHtml(t){
  const est = estadoDe(t);
  const lista = est ? est.estados.filter(e => e && e.nombre) : [];
  if(!lista.length) return '';
  const veEscudo = soyGM || t.tipo !== 'creep';
  const filas = lista.map(e => {
    const color = ESTADO_COLOR[e.polaridad] || ESTADO_COLOR[''];
    const dura = e.derivado ? 'siempre' : e.permanente ? 'no vence' : num(e.turnos) > 0 ? `${fmt(num(e.turnos))} turno${num(e.turnos) === 1 ? '' : 's'}` : '';
    const extras = [
      e.stacks > 1 ? `×${fmt(num(e.stacks))}` : '',
      veEscudo && e.escudo !== undefined ? (e.excedente ? `❤+${fmt(num(e.escudo))}` : `🛡${fmt(num(e.escudo))}${e.escudoMax !== undefined ? '/' + fmt(num(e.escudoMax)) : ''}`) : '',
      dura,
    ].filter(Boolean).join(' · ');
    const det = String(e.detalle || '').trim();
    return `<div style="margin-top:5px"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};margin-right:6px;vertical-align:1px"></span>`
      + `<b>${esc(e.nombre)}</b>${extras ? ` <span style="color:#B7A99F">· ${esc(extras)}</span>` : ''}`
      + (det ? `<div style="color:#B7A99F;font-size:11px;margin-left:14px">${esc(det.length > 160 ? det.slice(0, 157) + '…' : det)}</div>` : '') + '</div>';
  }).join('');
  return `<div style="font-weight:700;color:#F0D27A">${esc(nombreDe(t))}</div>${filas}`;
}
function hoverEstadosMostrar(){
  const t = tokens.get(hoverEstados.id);
  const html = t ? hoverEstadosHtml(t) : '';
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
  const id = tokenEn(m.x, m.y);
  hoverEstados.x = e.clientX; hoverEstados.y = e.clientY;
  if(id !== hoverEstados.id){
    hoverEstadosOcultar();
    if(!id) return;
    hoverEstados.id = id;
    hoverEstados.timer = setTimeout(hoverEstadosMostrar, 350);
  }else if(id && !hoverEstadosCaja().hidden) hoverEstadosMostrar();   // sigue al puntero
});
['pointerleave', 'pointerdown', 'wheel'].forEach(ev => lienzo.addEventListener(ev, hoverEstadosOcultar, {passive: true}));
