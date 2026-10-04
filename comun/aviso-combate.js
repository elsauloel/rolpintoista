/* comun/aviso-combate.js — el pop-up de un efecto de combate, para quien lo recibe (2026-10-03, pedido del dueño: «al triggerearse una trampa
   debe aparecer un pop-up que visualmente haga referencia a los botones y el menú del duelo; todos los pop-ups de anuncio de efectos de combate,
   a quien lo afecta, con la misma estética. Empezar a unificar estéticas y menúes»). Al resto de la mesa se lo cuenta la Crónica (el mapa, js/16).

   Usa los estilos del cuadro del duelo (`Duelo.estilos()`, comun/duelo.js: .duelo-caja, .duelo-cab, .duelo-paso, .duelo-veredicto, .duelo-pie):
   una cabecera con el ícono y el título, una tarjeta por paso (la tirada para evitarla, el daño, el estado…), el cartel grande del resultado y
   «Entendido».
   AvisoCombate.mostrar({icono, titulo, pasos: [{titulo, texto}] | [texto], veredicto: {tono: 'malo' | 'bueno' | 'neutro', grande, chico},
     texto (si no hay pasos), aMano (lo que queda para hacer a mano), boton ('Entendido'), alCerrar}) — uno por vez: el nuevo reemplaza al viejo.
   AvisoCombate.cerrar(). */
const AvisoCombate = (() => {
  const TONO = {malo: 'fallo', bueno: 'pego', neutro: 'bloqueado'};   // los colores del veredicto del duelo: rojo, verde, azul
  const e = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  let abierto = null;
  function estilosPropios(){
    if(document.getElementById('aviso-combate-css')) return;
    const s = document.createElement('style');
    s.id = 'aviso-combate-css';
    s.textContent = `.aviso-combate-fondo{position:fixed;inset:0;z-index:98500;background:rgba(6,8,14,.62);display:flex;align-items:center;justify-content:center;padding:12px}
      .aviso-combate-fondo .duelo-caja{width:min(560px,100%)}
      .aviso-combate-fondo .duelo-paso p{margin:0;line-height:1.4}
      .aviso-combate-fondo .duelo-veredicto .grande{font-size:34px}
      .aviso-combate-fondo .duelo-pie{display:flex;justify-content:center}
      .aviso-combate-fondo .aviso-mano{font-size:13px;color:#c7cee2;background:#1a2030;border:1px dashed #39435c;border-radius:10px;padding:8px 12px}`;
    document.head.appendChild(s);
  }
  function cerrar(){
    if(!abierto) return;
    const a = abierto;
    abierto = null;
    a.el.remove();
    if(a.alCerrar) try{ a.alCerrar(); }catch(err){ console.error(err); }
  }
  function mostrar(o){
    o = o || {};
    if(typeof Duelo !== 'undefined' && Duelo.estilos) Duelo.estilos();
    estilosPropios();
    if(abierto){ const a = abierto; abierto = null; a.el.remove(); }
    const pasos = (o.pasos || []).map(p => typeof p === 'string' ? {texto: p} : p).filter(p => p && (p.texto || p.titulo));
    const v = o.veredicto && o.veredicto.grande ? o.veredicto : null;
    const f = document.createElement('div');
    f.className = 'aviso-combate-fondo';
    f.innerHTML = `<div class="duelo-caja" role="dialog" aria-modal="true">
      <div class="duelo-cab"><span>${e(o.icono || '⚔')} ${e(o.titulo || '')}</span><div class="bt"><button type="button" data-aviso-x title="Cerrar">✕</button></div></div>
      <div class="duelo-cuerpo">
        ${pasos.length ? pasos.map((p, i) => `<div class="duelo-paso"><h4><span class="n">${i + 1}</span>${e(p.titulo || 'Qué pasó')}</h4><p>${e(p.texto || '')}</p></div>`).join('')
          : o.texto ? `<div class="duelo-paso"><p>${e(o.texto)}</p></div>` : ''}
        ${v ? `<div class="duelo-veredicto ${TONO[v.tono] || 'bloqueado'}"><div class="grande">${e(v.grande)}</div>${v.chico ? `<div class="chico">${e(v.chico)}</div>` : ''}</div>` : ''}
        ${o.aMano ? `<div class="aviso-mano">✋ ${e(o.aMano)}</div>` : ''}
        <div class="duelo-pie"><button type="button" data-aviso-ok>${e(o.boton || 'Entendido')}</button></div>
      </div>
    </div>`;
    f.addEventListener('click', ev => {
      if(ev.target === f || ev.target.closest('[data-aviso-x],[data-aviso-ok]')) cerrar();
    });
    document.body.appendChild(f);
    abierto = {el: f, alCerrar: o.alCerrar};
    const ok = f.querySelector('[data-aviso-ok]');
    if(ok) ok.focus();
  }
  document.addEventListener('keydown', ev => { if(abierto && ev.key === 'Escape'){ ev.stopImmediatePropagation(); cerrar(); } }, true);

  /* Los carteles que piden algo (tirar, decidir, esperar): el mismo marco, pero SIN oscurecer el mapa (hay que poder mirarlo, y en el dodge
     roll mover el token). cartel(clave, o) dibuja o redibuja el de esa clave; cartel(clave, null) lo saca. Varios a la vez se apilan.
     o: {icono, titulo, pasos, texto, veredicto, aMano, botones: [{texto, alClic, sec, id, titulo, deshabilitado}], posicion: 'centro' | 'abajo'}.
     Lo usan los carteles del mapa: zonas, «Algo está fuera de lugar», la detección del GM, el ataque de oportunidad y el dodge roll. */
  const carteles = new Map();
  function estilosCartel(){
    if(document.getElementById('aviso-cartel-css')) return;
    const s = document.createElement('style');
    s.id = 'aviso-cartel-css';
    s.textContent = `.aviso-combate-cartel{position:fixed;left:50%;top:38%;transform:translate(-50%,-50%);z-index:78;width:min(520px,94vw)}
      .aviso-combate-cartel.abajo{top:auto;bottom:16px;transform:translateX(-50%)}
      .aviso-combate-cartel .duelo-caja{width:100%;max-height:70vh}
      .aviso-combate-cartel .duelo-cuerpo{gap:12px}
      .aviso-combate-cartel .duelo-paso p,.aviso-combate-cartel .aviso-texto{margin:0;line-height:1.45}
      .aviso-combate-cartel .duelo-veredicto .grande{font-size:28px}
      .aviso-combate-cartel .duelo-pie{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
      .aviso-combate-cartel .duelo-pie button:disabled{opacity:.55;cursor:default}`;
    document.head.appendChild(s);
  }
  function acomodarCarteles(){
    let i = 0;
    carteles.forEach(el => { if(!el.classList.contains('abajo')){ el.style.top = `calc(38% + ${i * 28}px)`; el.style.zIndex = String(78 + i); i++; } });
  }
  function cartel(clave, o){
    let el = carteles.get(clave);
    if(!o){ if(el){ el.remove(); carteles.delete(clave); acomodarCarteles(); } return null; }
    if(typeof Duelo !== 'undefined' && Duelo.estilos) Duelo.estilos();
    estilosPropios(); estilosCartel();
    if(!el){ el = document.createElement('div'); el.className = 'aviso-combate-cartel'; document.body.appendChild(el); carteles.set(clave, el); }
    el.classList.toggle('abajo', o.posicion === 'abajo');
    const pasos = (o.pasos || []).map(p => typeof p === 'string' ? {texto: p} : p).filter(p => p && (p.texto || p.titulo));
    const v = o.veredicto && o.veredicto.grande ? o.veredicto : null;
    const botones = o.botones || [];
    el.innerHTML = `<div class="duelo-caja" role="dialog">
      <div class="duelo-cab"><span>${e(o.icono || '⚔')} ${e(o.titulo || '')}</span></div>
      <div class="duelo-cuerpo">
        ${pasos.map((p, i) => `<div class="duelo-paso"><h4><span class="n">${i + 1}</span>${e(p.titulo || 'Qué pasó')}</h4><p>${e(p.texto || '')}</p></div>`).join('')}
        ${o.texto ? `<p class="aviso-texto">${e(o.texto)}</p>` : ''}
        ${v ? `<div class="duelo-veredicto ${TONO[v.tono] || 'bloqueado'}"><div class="grande">${e(v.grande)}</div>${v.chico ? `<div class="chico">${e(v.chico)}</div>` : ''}</div>` : ''}
        ${o.aMano ? `<div class="aviso-mano">✋ ${e(o.aMano)}</div>` : ''}
        ${botones.length ? `<div class="duelo-pie">${botones.map((b, i) => `<button type="button" data-cartel-b="${i}"${b.id ? ` id="${e(b.id)}"` : ''}${b.sec ? ' class="sec"' : ''}${b.titulo ? ` title="${e(b.titulo)}"` : ''}${b.deshabilitado ? ' disabled' : ''}>${e(b.texto)}</button>`).join('')}</div>` : ''}
      </div>
    </div>`;
    el.querySelectorAll('[data-cartel-b]').forEach(b => { const x = botones[Number(b.dataset.cartelB)]; b.onclick = () => { if(x && x.alClic) x.alClic(); }; });
    acomodarCarteles();
    return el;
  }
  return {mostrar, cerrar, abierto: () => !!abierto, cartel};
})();
