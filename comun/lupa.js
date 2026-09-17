/* =========================================================
   LUPA 🔍 — "cómo se calcula" de cada botón
   Compartido por la ficha (Botonera) y gm-tools (Acciones del creep).
   Un botón lleva un 🔍 (lupaBotonHtml(clave), con data-lupa="clave");
   tocarlo abre #lupa-pop con el desglose y no dispara el botón.

   Cada herramienta define lupaContenido(clave) → {titulo, html}, que arma
   el desglose con los ladrillos de acá (lupaFila, lupaSeccion, lupaNota,
   lupaSigno, lupaTirada). Usa $, esc, fmt y num de cada herramienta, y
   formulaParaValor/DADOS_REALES de comun/tiradas.js.
   ========================================================= */

const lupaFila = (txt, val, cls = '') => `<div class="lupa-fila ${cls}"><span>${txt}</span><b>${val}</b></div>`;
const lupaNota = txt => `<div class="lupa-nota">${txt}</div>`;
const lupaSeccion = (titulo, html) => `<div class="lupa-sec"><div class="lupa-sec-t">${titulo}</div>${html}</div>`;
const lupaSigno = v => `${v > 0 ? '+' : ''}${fmt(v)}`;

// Cómo se reparte un valor en dados reales.
function lupaTirada(valor){
  const n = Math.round(num(valor));
  const f = formulaParaValor(n);
  if(!f) return lupaSeccion('Tirada', lupaNota(`Con ${fmt(n)} no se puede tirar: hace falta al menos 1.`));
  let nota;
  if(f.combo.length === 1 && f.combo[0] === n && !DADOS_REALES.includes(n)) nota = `Valor chico: se tira un dado de ${fmt(n)} caras.`;
  else if(f.mod) nota = `Impar: se reparte ${fmt(n - 1)} en dados reales y se suma +1.`;
  else nota = `Se reparte ${fmt(n)} en la menor cantidad de dados reales, lo más parejos posible.`;
  return lupaSeccion('Tirada', lupaFila(`${fmt(n)} →`, esc(f.formula)) + lupaNota(nota));
}

function lupaBotonHtml(clave, extraCls = ''){
  return `<span class="bt-lupa ${extraCls}" role="button" tabindex="0" data-lupa="${esc(clave)}" title="Cómo se calcula">🔍</span>`;
}

function cerrarLupa(){
  const p = document.getElementById('lupa-pop');
  if(p) p.remove();
}

function abrirLupa(el){
  const clave = el.dataset.lupa;
  const abierta = document.getElementById('lupa-pop');
  if(abierta && abierta.dataset.clave === clave){ cerrarLupa(); return; }
  cerrarLupa();
  const {titulo, html} = lupaContenido(clave);
  const p = document.createElement('div');
  p.id = 'lupa-pop';
  p.dataset.clave = clave;
  p.innerHTML = `<div class="lupa-titulo">🔍 ${esc(titulo)}</div>${html}`;
  document.body.appendChild(p);
  const r = el.getBoundingClientRect(), m = 8;
  const w = p.offsetWidth, hgt = p.offsetHeight;
  let top = r.bottom + 4;
  if(top + hgt > innerHeight - m) top = Math.max(m, r.top - hgt - 4);
  p.style.top = top + 'px';
  p.style.left = Math.max(m, Math.min(r.right - w, innerWidth - w - m)) + 'px';
}

// El 🔍 va dentro de otro botón: se atiende antes que nada (fase de
// captura) y el clic no llega al botón. Algunos navegadores reportan el
// clic sobre el botón y no sobre el 🔍: se mira también el punto tocado.
document.addEventListener('click', e => {
  const enPunto = e.clientX || e.clientY ? document.elementFromPoint(e.clientX, e.clientY) : null;
  const lupa = e.target.closest('[data-lupa]') || (enPunto && enPunto.closest('[data-lupa]'));
  if(!lupa) return;
  e.preventDefault();
  e.stopPropagation();
  abrirLupa(lupa);
}, true);
document.addEventListener('pointerdown', e => {
  const p = document.getElementById('lupa-pop');
  if(p && !p.contains(e.target) && !e.target.closest('[data-lupa]')) cerrarLupa();
}, true);
document.addEventListener('keydown', e => {
  if(e.key === 'Escape' && document.getElementById('lupa-pop')){ cerrarLupa(); e.stopImmediatePropagation(); e.preventDefault(); }
  else if((e.key === 'Enter' || e.key === ' ') && e.target.closest && e.target.closest('[data-lupa]')){ e.preventDefault(); abrirLupa(e.target.closest('[data-lupa]')); }
}, true);

(() => {
  const s = document.createElement('style');
  s.textContent = `
.bt-lupa{position:absolute;top:2px;right:2px;width:18px;height:18px;display:flex;align-items:center;justify-content:center;
  font-size:10px;line-height:1;border-radius:var(--r);opacity:.55;cursor:help;filter:grayscale(.3)}
.bt-lupa:hover,.bt-lupa:focus-visible{opacity:1;background:rgba(224,164,88,.18);outline:none}
.bt-lupa.mini{position:static;width:auto;height:auto;padding:3px 6px;border:1px solid var(--line-soft);font-size:11px;flex:none}
#lupa-pop{position:fixed;z-index:200;width:340px;max-width:calc(100vw - 16px);max-height:calc(100vh - 16px);overflow-y:auto;
  background:var(--panel);border:1px solid var(--brass);border-radius:var(--r);box-shadow:0 12px 30px rgba(0,0,0,.65);
  padding:10px 12px;font-size:12.5px;color:var(--paper);text-align:left}
#lupa-pop .lupa-titulo{font-family:"Space Grotesk",sans-serif;font-weight:700;color:var(--brass);margin-bottom:6px}
#lupa-pop .lupa-sec{margin-top:8px}
#lupa-pop .lupa-sec-t{font-family:"Space Mono",monospace;font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);
  border-bottom:1px solid var(--line-soft);padding-bottom:2px;margin-bottom:3px}
#lupa-pop .lupa-fila{display:flex;justify-content:space-between;gap:10px;padding:2px 0}
#lupa-pop .lupa-fila b{font-family:"Space Mono",monospace;white-space:nowrap;color:var(--paper)}
#lupa-pop .lupa-total{border-top:1px dashed var(--line);margin-top:3px;padding-top:4px}
#lupa-pop .lupa-total b{color:var(--brass)}
#lupa-pop .lupa-tachado span:first-child,#lupa-pop .lupa-tachado b{opacity:.55;text-decoration:line-through}
#lupa-pop .lupa-falta b{color:var(--danger)}
#lupa-pop .lupa-gris{color:var(--muted)}
#lupa-pop .lupa-sub{padding-left:14px;font-size:11.5px;color:var(--muted)}
#lupa-pop .lupa-sub b{color:var(--muted)}
#lupa-pop .lupa-nota{color:var(--muted);font-size:11.5px;margin-top:3px}
#lupa-pop code{font-family:"Space Mono",monospace;font-size:11px;color:var(--brass)}`;
  document.head.appendChild(s);
})();
