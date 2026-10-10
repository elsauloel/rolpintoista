/* =========================================================
   FLOTANTES — los botones de recordatorio (2026-10-09, pedido del dueño): la 🦋 Polilla mística, el 💍 anillo de impulso y la 🪙 Moneda
   Re-Roll —en el mapa, arriba, en fila a la izquierda de la barra de los lentes y a su misma altura (2026-10-10, el dueño eligió entre dos
   capturas: «arriba me gustan más»); en la ficha suelta, abajo a la izquierda—. «Cuando tenga una moneda de reroll, quiero que aparezca en el mismo estilo que cuando está la polilla activa, un botón en el
   mismo rincón, con cierto brillo de moneda, como recordatorio de que tenés esa posibilidad.»
   Flotantes.moneda({mostrar, sub, alClic}) dibuja (o saca) el de la moneda; Flotantes.apilar() acomoda los que haya, uno arriba del otro, en ese
   orden (cada pantalla lo llama después de dibujar o sacar uno). Lo usan el mapa (js/02, js/25) y la ficha suelta (js/03).
   ========================================================= */
const Flotantes = (() => {
  const ORDEN = ['polilla-flotante', 'impulso-flotante', 'moneda-flotante'];
  // Dónde van. En el mapa (2026-10-10, dueño: «arriba, al lado de los botones de los lentes, a la misma altura que esa botonera»): en fila,
  // a la izquierda de la barra de arriba (#flotantes-mapa), con la altura de sus botones y en un solo renglón (la línea de ayuda pasa al
  // globo del mouse). Donde no hay esa barra (la ficha suelta): uno arriba del otro, abajo a la izquierda.
  const CSS_ARRIBA = `
.flot-arriba{display:flex!important;align-items:center;gap:6px;padding:0 12px!important;border-radius:10px!important;font-size:13px!important;
  white-space:nowrap;animation:none!important;transform:none!important;bottom:auto!important}
.flot-arriba small{display:none!important}`;
  let observado = null;
  function apilar(){
    const barra = document.getElementById('flotantes-mapa');
    const rb = barra && barra.offsetWidth ? barra.getBoundingClientRect() : null;
    if(rb){
      if(!document.getElementById('flot-arriba-css')){
        const st = document.createElement('style'); st.id = 'flot-arriba-css'; st.textContent = CSS_ARRIBA; document.head.appendChild(st);
      }
      // Si la barra se corre (se abre o se cierra la Mesa, cambia la ventana), se vuelven a acomodar.
      if(observado !== barra && typeof ResizeObserver !== 'undefined'){
        observado = barra;
        const ro = new ResizeObserver(() => apilar());
        ro.observe(barra); if(barra.parentElement) ro.observe(barra.parentElement);
      }
      const ref = document.getElementById('btn-rango'), rr = ref && ref.offsetHeight ? ref.getBoundingClientRect() : null;
      const top = rr ? rr.top : rb.top + 5, alto = rr ? rr.height : 36;
      let x = rb.left - 8;
      [...ORDEN].reverse().forEach(id => {   // la moneda pegada a la barra; a su izquierda el anillo y la Polilla
        const b = document.getElementById(id);
        if(!b) return;
        b.classList.add('flot-arriba');
        const sub = b.querySelector('small');
        if(sub && id !== 'moneda-flotante') b.title = sub.textContent;
        b.style.top = Math.round(top) + 'px'; b.style.height = Math.round(alto) + 'px';
        b.style.right = 'auto'; b.style.left = '0px';
        x -= b.offsetWidth;
        b.style.left = Math.round(x) + 'px';
        x -= 8;
      });
      return;
    }
    let y = 16;
    ORDEN.forEach(id => {
      const b = document.getElementById(id);
      if(!b) return;
      b.classList.remove('flot-arriba');
      b.style.top = 'auto'; b.style.height = '';
      b.style.right = 'auto'; b.style.left = '16px'; b.style.transformOrigin = 'left bottom';
      b.style.bottom = y + 'px';
      y += (b.offsetHeight || 48) + 10;
    });
  }
  if(typeof window !== 'undefined') window.addEventListener('resize', () => apilar());
  const CSS = `
#moneda-flotante{position:fixed;left:16px;bottom:16px;z-index:999997;background:linear-gradient(135deg,#4a3a12,#2e240c);color:#ffe9a8;border:2px solid #e0b84a;
  border-radius:16px;padding:10px 16px;font-size:15px;font-weight:800;cursor:pointer;text-align:left;overflow:hidden;transform-origin:left bottom;
  box-shadow:0 8px 26px rgba(0,0,0,.6),0 0 14px rgba(255,200,80,.45);animation:moneda-latido 2.6s ease-in-out infinite alternate}
#moneda-flotante small{display:block;font-weight:500;font-size:11px;opacity:.9}
#moneda-flotante::after{content:"";position:absolute;top:0;left:-60%;width:40%;height:100%;pointer-events:none;
  background:linear-gradient(100deg,transparent,rgba(255,240,190,.45),transparent);animation:moneda-brillo 3.4s ease-in-out infinite}
#moneda-flotante .moneda-cara{display:inline-block;animation:moneda-gira 3.4s ease-in-out infinite}
@keyframes moneda-latido{0%{transform:scale(1);box-shadow:0 8px 26px rgba(0,0,0,.6),0 0 10px rgba(255,200,80,.35)}100%{transform:scale(1.025);box-shadow:0 8px 26px rgba(0,0,0,.6),0 0 20px rgba(255,210,90,.7)}}
@keyframes moneda-brillo{0%,55%{left:-60%}100%{left:130%}}
@keyframes moneda-gira{0%,70%{transform:rotateY(0)}85%{transform:rotateY(180deg)}100%{transform:rotateY(360deg)}}`;
  function moneda(o){
    let b = document.getElementById('moneda-flotante');
    if(!o || !o.mostrar){ if(b){ b.remove(); apilar(); } return; }
    if(!b){
      if(!document.getElementById('moneda-flotante-css')){
        const s = document.createElement('style');
        s.id = 'moneda-flotante-css';
        s.textContent = CSS;
        document.head.appendChild(s);
      }
      b = document.createElement('button');
      b.type = 'button';
      b.id = 'moneda-flotante';
      b.innerHTML = '<div><span class="moneda-cara">🪙</span> Moneda Re-Roll</div><small id="moneda-flotante-sub"></small>';
      document.body.appendChild(b);
    }
    b.onclick = o.alClic || null;
    b.title = 'Tenés una Moneda Re-Roll: podés volver a hacer cualquiera de tus últimas tiradas (después se tira la moneda: par se conserva, impar se rompe)';
    const sub = document.getElementById('moneda-flotante-sub');
    if(sub) sub.textContent = o.sub || 'Repetí una de tus últimas tiradas';
    apilar();
  }
  return {moneda, apilar};
})();
