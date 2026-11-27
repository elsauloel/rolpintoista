/* =========================================================
   TIP-EJECUTAR — el detalle de una habilidad al pasar el mouse por su botón «Ejecutar» (2026-11-09, dueño: «en las botoneras tanto de
   personajes, como creeps e invocaciones, el botón "ejecutar" de las skills te debe mostrar con hover el texto del detalle descriptivo de la
   misma»). Las botoneras (comun/ficha-botonera.js, comun/inv-botonera.js, comun/creep-botonera.js) le ponen al botón `TipEjecutar.attrs(nombre,
   detalle)`: guarda el texto en `data-tip-hab`. Este archivo arma el globo en cualquier pantalla (también adentro de los recuadros aislados
   del mapa: mira `composedPath`), con los términos del glosario (Glosario.marcar) y el estilo del recuadro «Detalle» de «Ver».
   El texto es el descriptivo: sin las notas ⚙ Automatizado / ✋ A mano. El `title` del botón (Flash, lo que falta) pasa abajo, en chico.
   El globo va al costado del botón (izquierda o derecha, donde entre), sin taparlo; se puede entrar con el mouse para leer el glosario.
   ========================================================= */
const TipEjecutar = (() => {
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  const sinNotas = t => String(t || '').split(/\s*[⚙✋]/)[0].trim();
  // 📋 `reglas` (2026-11-27): el detalle de reglas de la habilidad, aparte de la descripción (ItemCorto.reglasLista); va en el globo debajo.
  function attrs(nombre, detalle, reglas){
    const t = sinNotas(detalle);
    const l = typeof ItemCorto !== 'undefined' && ItemCorto.reglasLista ? ItemCorto.reglasLista({reglas}) : [];
    return t || l.length ? `data-tip-hab="${esc(t)}" data-tip-nombre="${esc(nombre || '')}"${l.length ? ` data-tip-reglas="${esc(l.join('\n'))}"` : ''}` : '';
  }
  const CSS = `#tip-ejecutar{position:fixed;z-index:100000;max-width:380px;background:#1c1714;border:1px solid #4a3a30;border-radius:8px;
    box-shadow:0 8px 24px rgba(0,0,0,.55);padding:11px 14px 12px;font-size:13px;line-height:1.55;color:#DCCFC5;pointer-events:auto}
    #tip-ejecutar .te-nom{font-weight:700;color:#f3e6da;margin-bottom:6px;font-size:13.5px}
    #tip-ejecutar .te-lbl{display:block;color:#d08a4f;font-family:"Space Mono",monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;
      margin-bottom:5px;padding-top:6px;border-top:1px dashed #4a3a30}
    #tip-ejecutar .te-txt{white-space:pre-wrap}
    #tip-ejecutar .te-reglas{margin-top:8px;border:1px solid #3d5a6e;border-left:3px solid #6fa8cf;border-radius:6px;padding:5px 9px 6px;
      background:rgba(80,130,170,.12);font-size:12px;line-height:1.45}
    #tip-ejecutar .te-reglas .te-lbl{color:#8fc0e0;border-top:0;padding-top:0;margin-bottom:3px}
    #tip-ejecutar .te-reglas ul{margin:0;padding-left:16px}
    #tip-ejecutar .te-pie{margin-top:8px;font-size:11.5px;color:#b9a99b}`;
  let tip = null, boton = null, cerrarT = null, posBoton = null;
  function cssUnaVez(){
    if(document.getElementById('tip-ejecutar-css')) return;
    const st = document.createElement('style');
    st.id = 'tip-ejecutar-css';
    st.textContent = CSS + (typeof Glosario !== 'undefined' && Glosario.CSS ? Glosario.CSS : '');
    document.head.appendChild(st);
  }
  function cerrar(){ clearTimeout(cerrarT); cerrarT = null; if(tip) tip.remove(); tip = null; if(boton && boton.dataset.tipTitle !== undefined){ boton.title = boton.dataset.tipTitle; delete boton.dataset.tipTitle; } boton = null; }
  function abrir(b){
    if(tip && boton && (b === boton || claveDe(b) === claveDe(boton))){ boton = b; return; }   // el mismo (o redibujado igual): no parpadea
    cerrar();
    cssUnaVez();
    boton = b;
    const pie = b.getAttribute('title') || '';
    if(pie){ b.dataset.tipTitle = pie; b.removeAttribute('title'); }   // sin el globo nativo encima del nuestro
    const txt = b.dataset.tipHab || '';
    const marcado = typeof Glosario !== 'undefined' && Glosario.marcar ? Glosario.marcar(txt) : esc(txt);
    tip = document.createElement('div');
    tip.id = 'tip-ejecutar';
    const mk = t => typeof Glosario !== 'undefined' && Glosario.marcar ? Glosario.marcar(t) : esc(t);
    const reglas = String(b.dataset.tipReglas || '').split('\n').filter(Boolean);
    tip.innerHTML = (b.dataset.tipNombre ? `<div class="te-nom">${esc(b.dataset.tipNombre)}</div>` : '')
      + (txt ? `<span class="te-lbl">${reglas.length ? 'Qué hace' : 'Detalle'}</span><div class="te-txt">${marcado}</div>` : '')
      + (reglas.length ? `<div class="te-reglas"><span class="te-lbl">📋 Detalle</span><ul>${reglas.map(r => `<li>${mk(r)}</li>`).join('')}</ul></div>` : '')
      + (pie ? `<div class="te-pie">${esc(pie)}</div>` : '');
    document.body.appendChild(tip);
    tip.addEventListener('mouseenter', () => { clearTimeout(cerrarT); cerrarT = null; });
    tip.addEventListener('mouseleave', () => { clearTimeout(cerrarT); cerrarT = setTimeout(() => { cerrarT = null; cerrar(); }, 180); });
    // Al costado del botón, a la altura del botón.
    const r = b.getBoundingClientRect(), m = 8, w = tip.offsetWidth, h = tip.offsetHeight;
    posBoton = {top: r.top};
    // Del lado donde hay más lugar (la Botonera del mapa está a la izquierda: el globo va sobre el mapa y no tapa la lista).
    let left = (innerWidth - r.right) >= r.left ? r.right + 10 : r.left - w - 10;
    if(left < m) left = r.right + 10;
    if(left + w > innerWidth - m){   // ni a un lado ni al otro: arriba o abajo del botón
      left = Math.max(m, Math.min(r.left, innerWidth - w - m));
      const arriba = r.top - h - 8;
      tip.style.top = (arriba >= m ? arriba : Math.min(innerHeight - h - m, r.bottom + 8)) + 'px';
    } else tip.style.top = Math.max(m, Math.min(r.top - 10, innerHeight - h - m)) + 'px';
    tip.style.left = left + 'px';
  }
  const claveDe = b => (b.dataset.tipNombre || '') + '|' + (b.dataset.tipHab || '') + '|' + (b.dataset.tipReglas || '');
  const botonDe = e => (e.composedPath ? e.composedPath() : [e.target]).find(n => n && n.dataset && n.dataset.tipHab !== undefined) || null;
  function iniciar(){
    // Con mousemove (no mouseover): las Acciones y la Botonera del mapa se redibujan solas y, adentro de su recuadro aislado, el navegador no
    // siempre manda el mouseover al pasar al botón; el movimiento sí llega siempre. Solo mira el camino del evento: es barato.
    const mirar = e => {
      const b = botonDe(e);
      if(b){ clearTimeout(cerrarT); cerrarT = null; abrir(b); return; }
      if(tip && (e.composedPath ? e.composedPath() : []).includes(tip)) return;
      if(tip && !cerrarT){ cerrarT = setTimeout(() => { cerrarT = null; cerrar(); }, 180); }
    };
    document.addEventListener('mousemove', mirar, true);
    document.addEventListener('mouseover', mirar, true);
    document.addEventListener('pointerdown', e => { if(tip && !(e.composedPath ? e.composedPath() : []).includes(tip)) cerrar(); }, true);
    // Al desplazar la lista se cierra, solo si el botón se movió de verdad (las Acciones se redibujan solas y reponen el scroll: eso no lo cierra).
    document.addEventListener('scroll', e => {
      if(!tip || (e.composedPath ? e.composedPath() : []).includes(tip)) return;
      if(!boton || !boton.isConnected){ return; }
      const r = boton.getBoundingClientRect();
      if(Math.abs(r.top - (posBoton || r).top) > 4) cerrar();
    }, true);
  }
  if(typeof document !== 'undefined') iniciar();
  return {attrs, cerrar, CSS};
})();
