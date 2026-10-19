/* =========================================================
   FLOTANTES — los botones de recordatorio (2026-10-09, pedido del dueño): la 🦋 Polilla mística, el 💍 anillo de impulso y la 🪙 Moneda
   Re-Roll —en el mapa, arriba, en fila a la izquierda de la barra de los lentes y a su misma altura (2026-10-10, el dueño eligió entre dos
   capturas: «arriba me gustan más»); en la ficha suelta, abajo a la izquierda—. «Cuando tenga una moneda de reroll, quiero que aparezca en el mismo estilo que cuando está la polilla activa, un botón en el
   mismo rincón, con cierto brillo de moneda, como recordatorio de que tenés esa posibilidad.»
   Flotantes.moneda({mostrar, sub, alClic}) dibuja (o saca) el de la moneda; Flotantes.wildcard({mostrar, n, alClic}), la 🃏 carta (2026-10-15); Flotantes.apilar() acomoda los que haya, uno arriba del otro, en ese
   orden (cada pantalla lo llama después de dibujar o sacar uno). Lo usan el mapa (js/02, js/25) y la ficha suelta (js/03).
   ========================================================= */
const Flotantes = (() => {
  const ORDEN = ['reroll-flotante', 'enyetar-flotante', 'empower-flotante', 'polilla-flotante', 'impulso-flotante', 'trebol-flotante', 'curandero-flotante', 'wildcard-flotante', 'moneda-flotante'];
  // Dónde van. En el mapa (2026-10-10, dueño: «arriba, al lado de los botones de los lentes, a la misma altura que esa botonera»): en fila,
  // a la izquierda de la barra de arriba (#flotantes-mapa), con la altura de sus botones y en un solo renglón (la línea de ayuda pasa al
  // globo del mouse). Donde no hay esa barra (la ficha suelta): uno arriba del otro, abajo a la izquierda.
  // 2026-10-10 (dueño): arriba van solo con el ícono, cuadrados como los botones de la barra, con un brillo suave que late; el mouse explica qué es.
  const CSS_ARRIBA = `
.flot-arriba{display:flex!important;align-items:center;justify-content:center;padding:0!important;border-radius:10px!important;font-size:18px!important;
  white-space:nowrap;transform:none!important;bottom:auto!important;z-index:25!important;animation:flot-latido 2.8s ease-in-out infinite alternate!important}   /* arriba de la barra (24), abajo de las ventanas */
.flot-arriba small{display:none!important}
#polilla-flotante.flot-arriba{--flot-glow:rgba(190,130,255,.75)}
#moneda-flotante.flot-arriba, #impulso-flotante.flot-arriba{--flot-glow:rgba(255,205,90,.75)}
#wildcard-flotante.flot-arriba{--flot-glow:rgba(140,150,255,.85);overflow:visible}
#wildcard-flotante.flot-arriba::after{display:none}
/* 🃏 Cuántas hay (dueño, 2026-10-16: «que el botón te muestre cuando tenés más de una»): un circulito con el número abajo a la izquierda. */
.wildcard-n{display:none}
#wildcard-flotante.flot-arriba .wildcard-n{display:flex;position:absolute;left:-7px;bottom:-7px;min-width:18px;height:18px;padding:0 4px;box-sizing:border-box;
  align-items:center;justify-content:center;border-radius:9px;background:#e8ebff;color:#1d2347;border:2px solid #8f9cff;font:800 11px system-ui,sans-serif;
  box-shadow:0 1px 4px rgba(0,0,0,.6);pointer-events:none}
/* La Polilla (2026-10-10, dueño: «buscale un equivalente a la moneda: algo animado sutil, brillo latente, chispas»): aletea cada tanto y unas
   chispitas violetas titilan alrededor. */
#polilla-flotante.flot-arriba{overflow:visible}
#polilla-flotante.flot-arriba .polilla-ala{display:inline-block;animation:polilla-aleteo 3.2s ease-in-out infinite}
#polilla-flotante.flot-arriba::before, #polilla-flotante.flot-arriba::after{content:"";position:absolute;width:4px;height:4px;border-radius:50%;
  background:#e7d2ff;box-shadow:0 0 6px 2px rgba(200,150,255,.9);pointer-events:none;opacity:0}
#polilla-flotante.flot-arriba::before{top:3px;right:4px;animation:polilla-chispa 2.6s ease-in-out infinite}
#polilla-flotante.flot-arriba::after{bottom:4px;left:5px;animation:polilla-chispa 2.6s ease-in-out 1.3s infinite}
@keyframes polilla-aleteo{0%,62%,100%{transform:scaleX(1)}68%{transform:scaleX(.45)}74%{transform:scaleX(1)}80%{transform:scaleX(.55)}86%{transform:scaleX(1)}}
@keyframes polilla-chispa{0%,100%{opacity:0;transform:scale(.4) translateY(0)}35%{opacity:1;transform:scale(1) translateY(-2px)}60%{opacity:0;transform:scale(.6) translateY(-5px)}}
/* 💪 Empower (2026-10-12, dueño: «un brazo haciendo flexiones, con algún brillito distintivo; si el brazo se puede mover como si estuviera
   haciendo fuerza, ideal»): el brazo se tensa y afloja cada tanto, con un brillo rojo anaranjado y dos chispitas. */
#empower-flotante.flot-arriba{--flot-glow:rgba(255,120,60,.8);overflow:visible}
#empower-flotante.flot-arriba::before, #empower-flotante.flot-arriba::after{content:"";position:absolute;width:4px;height:4px;border-radius:50%;
  background:#ffd2a8;box-shadow:0 0 6px 2px rgba(255,140,60,.95);pointer-events:none;opacity:0}
#empower-flotante.flot-arriba::before{top:3px;left:4px;animation:polilla-chispa 2s ease-in-out .3s infinite}
#empower-flotante.flot-arriba::after{bottom:4px;right:4px;animation:polilla-chispa 2s ease-in-out 1.3s infinite}
/* 🧚 Re-roll (2026-10-12, dueño: «un trébol o un hadita» → la hadita; era el botón de Afortunado): flota arriba y abajo y suelta chispitas
   doradas, con brillo verde. */
#reroll-flotante.flot-arriba{--flot-glow:rgba(110,230,140,.85);overflow:visible}
#reroll-flotante.flot-arriba::before, #reroll-flotante.flot-arriba::after{content:"";position:absolute;width:4px;height:4px;border-radius:50%;
  background:#fff3b0;box-shadow:0 0 6px 2px rgba(255,230,120,.95);pointer-events:none;opacity:0}
#reroll-flotante.flot-arriba::before{top:4px;right:5px;animation:polilla-chispa 2.2s ease-in-out .2s infinite}
#reroll-flotante.flot-arriba::after{bottom:5px;left:5px;animation:polilla-chispa 2.2s ease-in-out 1.2s infinite}
.afortunado-hada{display:inline-block;animation:afortunado-flota 2.6s ease-in-out infinite}
@keyframes afortunado-flota{0%,100%{transform:translateY(1px) rotate(-6deg)}50%{transform:translateY(-3px) rotate(6deg);filter:drop-shadow(0 0 5px rgba(140,255,170,.95))}}
/* 🐈‍⬛ Enyetar (2026-10-12): el gato negro se eriza cada tanto, con un brillo violeta oscuro. */
#enyetar-flotante.flot-arriba{--flot-glow:rgba(170,90,255,.8);overflow:visible}
.enyetar-gato{display:inline-block;transform-origin:50% 90%;animation:enyetar-eriza 3s ease-in-out infinite}
@keyframes enyetar-eriza{0%,55%,100%{transform:scale(1) translateY(0);filter:none}62%{transform:scale(1.15,.9) translateY(1px);filter:drop-shadow(0 0 5px rgba(180,100,255,1))}
  70%{transform:scale(.95,1.15) translateY(-2px);filter:drop-shadow(0 0 7px rgba(190,110,255,1))}80%{transform:scale(1) translateY(0);filter:none}}
@keyframes flot-latido{0%{box-shadow:0 2px 8px rgba(0,0,0,.5),0 0 3px var(--flot-glow)}100%{box-shadow:0 2px 8px rgba(0,0,0,.5),0 0 13px var(--flot-glow)}}`;
  // Lo que explica el mouse (dueño: «al hacer hover te explica: tenés una moneda / tenés una polilla activa»).
  const TITULO = {'wildcard-flotante': 'Tenés wildcards', 'reroll-flotante': 'Tenés Re-roll', 'enyetar-flotante': 'Tenés Enyetar', 'empower-flotante': 'Tenés Empower', 'polilla-flotante': 'Tenés una Polilla mística activa', 'moneda-flotante': 'Tenés una Moneda Re-Roll',
    'impulso-flotante': 'Tenés un anillo de impulso activo', 'trebol-flotante': 'Tenés el Anillo del trébol', 'curandero-flotante': 'Tenés el Anillo del curandero'};
  const ACCION = {'wildcard-flotante': 'tocá para repetir una de tus últimas tiradas (se gasta una)', 'reroll-flotante': 'tocá para elegir qué tirada tuya o de un aliado se repite (queda la mejor)', 'enyetar-flotante': 'tocá para elegir a qué tirada de un enemigo le echás la yeta', 'empower-flotante': 'tocá para elegir a qué tirada le sumás +3', 'polilla-flotante': 'tocá para sumarle +2 a tu última tirada', 'moneda-flotante': 'tocá para repetir una de tus últimas tiradas',
    'impulso-flotante': 'tocá para sumarle su bono a tu última tirada', 'trebol-flotante': 'tocá y tu próxima tirada sale como Afortunado (una vez por combate)', 'curandero-flotante': 'tocá para sacarte un estado malo (dos veces por día)'};
  // Deja solo el ícono (el primer «carácter» del texto; la moneda conserva su cara que gira).
  function soloIcono(b){
    const div = b.querySelector('div');
    if(!div || div.dataset.soloIcono) return;
    const cara = div.querySelector('.moneda-cara, .wildcard-carta');   // la moneda y la carta conservan su giro
    const primero = [...String(div.textContent || '').trim()][0] || '•';
    const icono = cara ? cara.outerHTML : b.id === 'polilla-flotante' ? `<span class="polilla-ala">${primero}</span>` : b.id === 'empower-flotante' ? `<span class="empower-brazo">${primero}</span>` : b.id === 'enyetar-flotante' ? `<span class="enyetar-gato">🐈‍⬛</span>` : b.id === 'reroll-flotante' ? `<span class="afortunado-hada">🧚</span>` : primero;   // la mariposa aletea; el brazo hace fuerza
    div.dataset.soloIcono = '1';
    div.innerHTML = icono;
  }
  // Lo que dice el mouse: qué es y qué hace al tocarlo (con el detalle de su línea chica, salvo la moneda y la carta).
  function ponerTitulo(b){
    const id = b.id, sub = b.querySelector('small'), det = sub && id !== 'moneda-flotante' && id !== 'wildcard-flotante' ? String(sub.textContent || '').trim() : '';
    b.title = `${TITULO[id] || ''}. ${det ? det.charAt(0).toUpperCase() + det.slice(1) + ' — ' : ''}${ACCION[id] || ''}.`;
  }
  let observado = null;
  /* ⚔ Durante un duelo (dueño, 2026-10-19: «una columna pegada con todos los triggers posibles que puedan llegar a usarse durante un duelo: la
     polilla, la moneda de reroll, la wildcard, algunos efectos que te puede dar algún equipo»): el cuadro del duelo los tapaba (van arriba, con la
     capa 25, y el duelo usa 99000). Mientras el cuadro está abierto (no minimizado), todos los que haya van en una columna pegada a su costado
     derecho (o al izquierdo, si no entran), por encima del duelo; al cerrarlo o minimizarlo, vuelven a su lugar. Como arriba (dueño, el mismo día):
     solo el emoji, con su animación, y el mouse explica qué es. */
  const CSS_DUELO = `
.flot-duelo.flot-duelo{z-index:99010!important;bottom:auto!important;right:auto!important}   /* doble clase: le gana a .flot-arriba (capa 25) aunque su estilo se cargue después */
#flot-duelo-tit{position:fixed;z-index:99010;font:800 11px system-ui,sans-serif;letter-spacing:.8px;text-transform:uppercase;color:#9fb0d0;pointer-events:none}`;
  function cajaDuelo(){
    if(!document.getElementById('flotantes-mapa')) return null;   // solo en el mapa: en la ficha suelta van abajo a la izquierda, ya por encima del duelo
    const f = document.getElementById('duelo-fondo');
    if(!f || f.classList.contains('min') || getComputedStyle(f).display === 'none') return null;
    const c = f.querySelector('.duelo-caja');
    return c && c.offsetWidth ? c : null;
  }
  function columnaDuelo(caja){
    if(!document.getElementById('flot-duelo-css')){ const st = document.createElement('style'); st.id = 'flot-duelo-css'; st.textContent = CSS_DUELO; document.head.appendChild(st); }
    const lista = ORDEN.map(id => document.getElementById(id)).filter(Boolean);
    let tit = document.getElementById('flot-duelo-tit');
    if(!lista.length){ if(tit) tit.remove(); return; }
    if(!document.getElementById('flot-arriba-css')){ const st = document.createElement('style'); st.id = 'flot-arriba-css'; st.textContent = CSS_ARRIBA; document.head.appendChild(st); }
    const LADO = 40;
    lista.forEach(b => {
      b.classList.add('flot-arriba', 'flot-duelo');   // el mismo aspecto que arriba: cuadrado, solo el emoji, con su animación
      soloIcono(b); ponerTitulo(b);
      b.style.width = LADO + 'px'; b.style.height = LADO + 'px';
    });
    const rc = caja.getBoundingClientRect(), ancho = LADO;
    const derecha = rc.right + 10 + ancho <= window.innerWidth - 6;
    const x = derecha ? rc.right + 10 : Math.max(6, rc.left - 10 - ancho);
    if(!tit){ tit = document.createElement('div'); tit.id = 'flot-duelo-tit'; tit.textContent = 'Podés usar'; document.body.appendChild(tit); }
    tit.style.left = Math.round(x) + 'px'; tit.style.top = Math.round(rc.top + 4) + 'px';
    let y = rc.top + 22;
    lista.forEach(b => { b.style.left = Math.round(x) + 'px'; b.style.top = Math.round(y) + 'px'; y += (b.offsetHeight || 42) + 8; });
  }
  function apilar(){
    const caja = cajaDuelo();
    if(caja){ columnaDuelo(caja); return; }
    const titD = document.getElementById('flot-duelo-tit'); if(titD) titD.remove();
    ORDEN.forEach(id => { const b = document.getElementById(id); if(b) b.classList.remove('flot-duelo'); });
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
        soloIcono(b);
        ponerTitulo(b);   // «Tenés una Polilla mística activa. +2 a tu última tirada: … — tocá para…»
        b.style.top = Math.round(top) + 'px'; b.style.height = Math.round(alto) + 'px'; b.style.width = Math.round(alto) + 'px';
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
      b.style.top = 'auto'; b.style.height = ''; b.style.width = '';
      b.style.right = 'auto'; b.style.left = '16px'; b.style.transformOrigin = 'left bottom';
      b.style.bottom = y + 'px';
      y += (b.offsetHeight || 48) + 10;
    });
  }
  if(typeof window !== 'undefined') window.addEventListener('resize', () => apilar());
  // El cuadro del duelo se abre, se minimiza, se cierra o se redibuja: se vuelven a acomodar (en el próximo cuadro, una vez).
  if(typeof document !== 'undefined' && typeof MutationObserver !== 'undefined'){
    let pend = false, visto = null;
    const pedir = () => { if(pend) return; pend = true; requestAnimationFrame(() => { pend = false; apilar(); }); };
    const mirarFondo = () => {
      const f = document.getElementById('duelo-fondo');
      if(f === visto) return;
      visto = f;
      if(f) new MutationObserver(pedir).observe(f, {attributes: true, attributeFilter: ['class', 'style'], childList: true});
      pedir();
    };
    const arrancar = () => { new MutationObserver(mirarFondo).observe(document.body, {childList: true}); mirarFondo(); };
    if(document.body) arrancar(); else document.addEventListener('DOMContentLoaded', arrancar);
  }
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
@keyframes moneda-gira{0%,70%{transform:rotateY(0)}85%{transform:rotateY(180deg)}100%{transform:rotateY(360deg)}}
/* 🃏 Wildcard (2026-10-15, dueño: «que sea una cartita y que también tenga una animación, que gire como la moneda»): la carta gira sobre su eje
   cada tanto, con brillo azul violeta. */
#wildcard-flotante{position:fixed;left:16px;bottom:16px;z-index:999997;background:linear-gradient(135deg,#232a5a,#121633);color:#e3e7ff;border:2px solid #8f9cff;
  border-radius:16px;padding:10px 16px;font-size:15px;font-weight:800;cursor:pointer;text-align:left;overflow:hidden;transform-origin:left bottom;
  box-shadow:0 8px 26px rgba(0,0,0,.6),0 0 14px rgba(130,140,255,.5);animation:moneda-latido 2.6s ease-in-out infinite alternate}
#wildcard-flotante small{display:block;font-weight:500;font-size:11px;opacity:.9}
#wildcard-flotante::after{content:"";position:absolute;top:0;left:-60%;width:40%;height:100%;pointer-events:none;
  background:linear-gradient(100deg,transparent,rgba(210,215,255,.4),transparent);animation:moneda-brillo 3.8s ease-in-out .6s infinite}
.wildcard-carta{display:inline-block;animation:wildcard-gira 3.8s ease-in-out infinite}
@keyframes wildcard-gira{0%,62%{transform:rotateY(0) rotate(-6deg)}78%{transform:rotateY(180deg) rotate(0)}94%,100%{transform:rotateY(360deg) rotate(-6deg)}}
#empower-flotante{position:fixed;left:16px;bottom:16px;z-index:999997;background:linear-gradient(135deg,#5a2412,#34140a);color:#ffdcc4;border:2px solid #ff8a4a;
  border-radius:16px;padding:10px 16px;font-size:15px;font-weight:800;cursor:pointer;text-align:left;transform-origin:left bottom;
  box-shadow:0 8px 26px rgba(0,0,0,.6),0 0 14px rgba(255,120,60,.5);animation:moneda-latido 2.6s ease-in-out infinite alternate}
#empower-flotante small, #enyetar-flotante small, #reroll-flotante small{display:block;font-weight:500;font-size:11px;opacity:.9}
#reroll-flotante{position:fixed;left:16px;bottom:16px;z-index:999997;background:linear-gradient(135deg,#123a22,#0a2214);color:#d8ffe2;border:2px solid #6ee68c;
  border-radius:16px;padding:10px 16px;font-size:15px;font-weight:800;cursor:pointer;text-align:left;transform-origin:left bottom;
  box-shadow:0 8px 26px rgba(0,0,0,.6),0 0 14px rgba(110,230,140,.5);animation:moneda-latido 2.6s ease-in-out infinite alternate}
#enyetar-flotante{position:fixed;left:16px;bottom:16px;z-index:999997;background:linear-gradient(135deg,#2a1640,#150a22);color:#e6d4ff;border:2px solid #a96bff;
  border-radius:16px;padding:10px 16px;font-size:15px;font-weight:800;cursor:pointer;text-align:left;transform-origin:left bottom;
  box-shadow:0 8px 26px rgba(0,0,0,.6),0 0 14px rgba(160,90,255,.5);animation:moneda-latido 2.6s ease-in-out infinite alternate}
.empower-brazo{display:inline-block;transform-origin:30% 85%;animation:empower-fuerza 2.4s ease-in-out infinite}
@keyframes empower-fuerza{0%,40%,100%{transform:rotate(0) scale(1);filter:none}52%{transform:rotate(-16deg) scale(1.18);filter:drop-shadow(0 0 4px rgba(255,140,60,.95))}
  58%{transform:rotate(-12deg) scale(1.14)}64%{transform:rotate(-17deg) scale(1.2);filter:drop-shadow(0 0 6px rgba(255,160,70,1))}76%{transform:rotate(0) scale(1);filter:none}}`;
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
  // 🃏 Wildcard (2026-10-15): Flotantes.wildcard({mostrar, n, alClic}) — la carta que gira, en el mismo rincón que la moneda.
  function wildcard(o){
    if(!o || !o.mostrar){ fijo('wildcard-flotante', '', '', null); return; }
    const n = Math.max(1, Math.round(Number(o.n) || 1));
    fijo('wildcard-flotante', '<span class="wildcard-carta">🃏</span>', n > 1 ? `Wildcards ×${n}` : 'Wildcard', {...o, sub: o.sub || 'Repetí una de tus últimas tiradas'});
    const b = document.getElementById('wildcard-flotante');
    if(b){
      b.title = `Tenés ${n} wildcard${n === 1 ? '' : 's'}: podés volver a hacer cualquiera de tus últimas tiradas (se gasta una)`;
      let badge = b.querySelector('.wildcard-n');
      if(n > 1){ if(!badge){ badge = document.createElement('span'); badge.className = 'wildcard-n'; b.appendChild(badge); } if(badge.textContent !== String(n)) badge.textContent = String(n); }
      else if(badge) badge.remove();
      const cont = b.querySelector('div');
      if(cont && !cont.dataset.soloIcono){ const t = `<span class="wildcard-carta">🃏</span> ${n > 1 ? `Wildcards ×${n}` : 'Wildcard'}`; if(cont.innerHTML !== t) cont.innerHTML = t; }
    }
  }
  // Los botones fijos de una habilidad (2026-10-12): 💪 Empower (js/37) y 🐈‍⬛ Enyetar (js/38) — Flotantes.empower / enyetar({mostrar, sub,
  // alClic}), o (null) para sacarlo.
  function fijo(id, iconoHtml, nombre, o){
    let b = document.getElementById(id);
    if(!o || !o.mostrar){ if(b){ b.remove(); apilar(); } return; }
    if(!b){
      if(!document.getElementById('moneda-flotante-css')){
        const s = document.createElement('style'); s.id = 'moneda-flotante-css'; s.textContent = CSS; document.head.appendChild(s);
      }
      b = document.createElement('button');
      b.type = 'button';
      b.id = id;
      b.innerHTML = `<div>${iconoHtml} ${nombre}</div><small id="${id}-sub"></small>`;
      document.body.appendChild(b);
    }
    b.onclick = o.alClic || null;
    const sub = document.getElementById(id + '-sub');
    if(sub && sub.textContent !== (o.sub || '')) sub.textContent = o.sub || '';
    apilar();
  }
  const empower = o => fijo('empower-flotante', '<span class="empower-brazo">💪</span>', 'Empower', o && {...o, sub: o.sub || '+3 a una tirada tuya o de un aliado'});
  const enyetar = o => fijo('enyetar-flotante', '<span class="enyetar-gato">🐈‍⬛</span>', 'Enyetar', o && {...o, sub: o.sub || 'que un enemigo repita una tirada'});
  const reroll = o => fijo('reroll-flotante', '<span class="afortunado-hada">🧚</span>', 'Re-roll', o && {...o, sub: o.sub || 'que vos o un aliado repita una tirada'});
  return {moneda, wildcard, empower, enyetar, reroll, apilar};
})();
