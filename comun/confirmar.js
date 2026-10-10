/* =========================================================
   CONFIRMAR — la pregunta de sí o no con el cartel del juego, en vez de la ventanita del navegador («elsauloel.github.io dice…»)
   (2026-10-09, dueño: «pasá todas las confirmaciones de ventana del navegador a un cartel del juego»; un confirm() nativo además congela la
   pestaña cuando la maneja la extensión de Chrome).
   Confirmar.preguntar(texto, {titulo, icono, si, no, peligro}) → Promise<boolean>: true = sí; false = no / ✕ / Esc / clic afuera. Enter = sí.
   Trae su propio estilo (el del cuadro del duelo: oscuro, cabecera, tarjeta y dos botones), así que anda en cualquier página, con o sin el duelo.
   Va arriba de todo (z-index 100020) y no cierra ninguna otra ventana. `peligro: true` pinta el botón de sí en rojo (borrar, retirar…).
   Uso: `if(!(await Confirmar.preguntar('¿Borrar X?', {si: 'Borrar', peligro: true}))) return;` — la función que lo llama tiene que ser async.
   ========================================================= */
const Confirmar = (() => {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const CSS = `
.cfj-fondo{position:fixed;inset:0;z-index:100020;background:rgba(6,8,14,.62);display:flex;align-items:center;justify-content:center;padding:12px;font-family:system-ui,sans-serif}
.cfj-caja{width:min(520px,100%);background:#141a26;color:#e6e9f2;border:1px solid #39435c;border-radius:14px;box-shadow:0 18px 50px rgba(0,0,0,.6);overflow:hidden}
.cfj-cab{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 16px;background:#1b2232;border-bottom:1px solid #2a3348;font-weight:800;font-size:16px}
.cfj-cab button{background:none;border:none;color:#9aa6c4;font-size:18px;cursor:pointer;padding:0 4px}
.cfj-cuerpo{padding:14px 16px 16px}
.cfj-texto{margin:0;padding:12px 14px;background:#1a2030;border:1px solid #2a3348;border-radius:10px;line-height:1.45;font-size:14.5px;white-space:pre-line}
.cfj-pie{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:14px}
.cfj-pie button{border:none;border-radius:10px;padding:9px 18px;font-size:14.5px;font-weight:700;cursor:pointer;background:#2d6cdf;color:#fff}
.cfj-pie button.peligro{background:#c0394f}
.cfj-pie button.sec{background:#2a3348;color:#d6dcea}
.cfj-pie button:focus-visible{outline:2px solid #ffd25a;outline-offset:2px}`;
  function estilos(){
    if(document.getElementById('confirmar-css')) return;
    const s = document.createElement('style');
    s.id = 'confirmar-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }
  function preguntar(texto, o){
    o = o || {};
    estilos();
    return new Promise(ok => {
      const f = document.createElement('div');
      f.className = 'cfj-fondo';
      f.innerHTML = `<div class="cfj-caja" role="dialog" aria-modal="true">
        <div class="cfj-cab"><span>${esc(o.icono || '❓')} ${esc(o.titulo || 'Confirmar')}</span><button type="button" data-cfj="no" title="Cancelar">✕</button></div>
        <div class="cfj-cuerpo"><p class="cfj-texto">${esc(texto)}</p>
          <div class="cfj-pie"><button type="button" data-cfj="si"${o.peligro ? ' class="peligro"' : ''}>${esc(o.si || 'Sí')}</button><button type="button" class="sec" data-cfj="no">${esc(o.no || 'Cancelar')}</button></div></div>
      </div>`;
      const tecla = ev => {
        if(ev.key === 'Escape'){ ev.stopImmediatePropagation(); ev.preventDefault(); fin(false); }
        else if(ev.key === 'Enter'){ ev.stopImmediatePropagation(); ev.preventDefault(); fin(true); }
      };
      const fin = v => { document.removeEventListener('keydown', tecla, true); f.remove(); ok(v); };
      f.onclick = ev => { const b = ev.target.closest('[data-cfj]'); if(b) fin(b.dataset.cfj === 'si'); else if(ev.target === f) fin(false); };
      document.addEventListener('keydown', tecla, true);
      document.body.appendChild(f);
      const b = f.querySelector('[data-cfj="si"]'); if(b) b.focus();
    });
  }
  return {preguntar};
})();
