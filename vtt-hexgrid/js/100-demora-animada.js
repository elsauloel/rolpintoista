// js/100-demora-animada.js — ⏬ La Demora, a la vista en la lista de turnos (2026-11-04).
//
// Dueño: «cuando sucede una demora, al momento de aplicarse, me gustaría que se desplegara la lista de iniciativa, y se vea una animación de los nombres
// intercambiando posiciones en un desplazamiento. En el caso de que eso sucediera en el medio de un duelo, que el duelo se minimice brevemente, muestre la
// planilla, y al terminar la animación el duelo se vuelve a desplegar».
// 1. Cualquier cambio de orden con la lista a la vista se desliza (los nombres van de su lugar viejo al nuevo, «FLIP») en vez de saltar.
// 2. La Demora (el aviso `demora` con `demoraMovio`, js/13 demoraAviso → js/16): en todas las pantallas, el duelo abierto se aparta (Duelo.apartar: se
//    minimiza hacia su token y vuelve solo), la lista se despliega, los nombres se deslizan del orden de antes al de ahora (el demorado, resaltado) y,
//    al terminar, la lista vuelve a quedar como estaba (plegada o no).

const DEMORA_ANIM_MS = 1100, DEMORA_TOTAL_MS = 3200;
let iniOrdenClave = '', iniIdsAntes = [], iniIdsAhora = [];
const demorasVistas = new Set();
const iniFilas = caja => caja ? [...caja.querySelectorAll('[data-ini-fila]')] : [];

// Desliza cada fila desde `desde(fila)` (su arriba de antes, en px) a donde quedó.
function iniDeslizar(caja, desde, resaltar){
  iniFilas(caja).forEach(f => {
    const antes = desde(f);
    if(antes === null || antes === undefined) return;
    const dy = antes - f.getBoundingClientRect().top;
    if(Math.abs(dy) < 1 && f.dataset.iniFila !== resaltar) return;
    f.style.transition = 'none';
    f.style.transform = `translateY(${dy}px)`;
    if(f.dataset.iniFila === resaltar){ f.style.position = 'relative'; f.style.zIndex = '2'; f.style.boxShadow = '0 0 0 2px #E27B72, 0 0 14px rgba(226,123,114,.7)'; }
    void f.offsetHeight;
    f.style.transition = `transform ${DEMORA_ANIM_MS}ms cubic-bezier(.2,.8,.2,1), box-shadow 600ms`;
    f.style.transform = '';
    if(f.dataset.iniFila === resaltar) setTimeout(() => { f.style.boxShadow = ''; f.style.zIndex = ''; }, DEMORA_ANIM_MS + 900);
  });
}

const renderIniciativaSinAnim = renderIniciativa;
renderIniciativa = function(){
  const caja = $('#iniciativa');
  const clave = JSON.stringify((iniciativa.orden || []).map(o => o.id));
  const cambio = clave !== iniOrdenClave;
  const tops = new Map();
  if(cambio) iniFilas(caja).forEach(f => { const r = f.getBoundingClientRect(); if(r.height > 0) tops.set(f.dataset.iniFila, r.top); });
  renderIniciativaSinAnim();
  const ahora = iniFilas(caja).map(f => f.dataset.iniFila);
  if(cambio){
    if(iniOrdenClave) iniIdsAntes = iniIdsAhora.length ? iniIdsAhora : ahora;
    iniOrdenClave = clave;
    if(tops.size) iniDeslizar(caja, f => tops.has(f.dataset.iniFila) ? tops.get(f.dataset.iniFila) : null);
  }
  iniIdsAhora = ahora;
};

// ⏬ La Demora: apartar el duelo, desplegar la lista y repetir el desplazamiento desde el orden de antes.
function demoraAnimar(tokenId, momentoId){
  if(momentoId){ if(demorasVistas.has(momentoId)) return; demorasVistas.add(momentoId); }
  const caja = $('#iniciativa');
  if(!caja || !iniIdsAntes.length) return;
  const idDuelo = typeof Duelo !== 'undefined' && Duelo.abiertoId ? Duelo.abiertoId() : null;
  if(idDuelo && Duelo.apartar) Duelo.apartar(idDuelo, DEMORA_TOTAL_MS);   // 🎬 se minimiza hacia su token y vuelve solo
  const estabaPlegada = iniciativaPlegada;
  const antes = iniIdsAntes.slice();
  setTimeout(() => {
    iniciativaPlegada = false;
    renderIniciativaSinAnim();
    const filas = iniFilas(caja), topsPorLugar = filas.map(f => f.getBoundingClientRect().top);
    iniDeslizar(caja, f => { const i = antes.indexOf(f.dataset.iniFila); return i >= 0 && i < topsPorLugar.length ? topsPorLugar[i] : null; }, tokenId);
    setTimeout(() => { if(estabaPlegada){ iniciativaPlegada = true; renderIniciativaSinAnim(); } }, DEMORA_TOTAL_MS - 400);
  }, idDuelo ? 450 : 0);
}

/* ⏬ Demorado, pero ya era el último (2026-11-05, dueño: «que no se saltee sino que muestre una animación donde el nombre intenta bajar, pero se
   choca con el borde, y avise "ya está último, no puede bajar"»): mismo despliegue que la Demora (el duelo se aparta, la lista se abre y vuelve a
   plegarse); la fila del demorado baja un poco, rebota contra el borde de abajo de la lista, tiembla, y debajo aparece el cartelito. */
function demoraChoque(tokenId, momentoId){
  if(momentoId){ if(demorasVistas.has(momentoId)) return; demorasVistas.add(momentoId); }
  const caja = $('#iniciativa');
  if(!caja) return;
  const idDuelo = typeof Duelo !== 'undefined' && Duelo.abiertoId ? Duelo.abiertoId() : null;
  if(idDuelo && Duelo.apartar) Duelo.apartar(idDuelo, DEMORA_TOTAL_MS);
  const estabaPlegada = iniciativaPlegada;
  setTimeout(() => {
    iniciativaPlegada = false;
    renderIniciativaSinAnim();
    const f = iniFilas(caja).find(x => x.dataset.iniFila === tokenId);
    if(!f){ if(estabaPlegada){ iniciativaPlegada = true; renderIniciativaSinAnim(); } return; }
    f.style.position = 'relative'; f.style.zIndex = '2';
    f.style.boxShadow = '0 0 0 2px #E27B72, 0 0 14px rgba(226,123,114,.7)';
    const h = Math.max(10, Math.min(18, f.offsetHeight * 0.45));
    if(f.animate) f.animate([
      {transform: 'translateY(0)', offset: 0},
      {transform: `translateY(${h}px)`, offset: 0.28, easing: 'cubic-bezier(.5,0,1,1)'},   // intenta bajar…
      {transform: `translateY(${h * 0.35}px)`, offset: 0.42},                             // …choca y rebota
      {transform: `translateY(${h * 0.7}px)`, offset: 0.52},
      {transform: `translateX(-4px) translateY(${h * 0.5}px)`, offset: 0.6},               // tiembla
      {transform: `translateX(4px) translateY(${h * 0.4}px)`, offset: 0.68},
      {transform: 'translateX(-3px) translateY(2px)', offset: 0.76},
      {transform: 'translateX(2px)', offset: 0.84},
      {transform: 'translateY(0)', offset: 1},
    ], {duration: 1300});
    // El borde con el que choca: una línea roja que se enciende abajo de la lista.
    const r = f.getBoundingClientRect();
    const borde = document.createElement('div');
    borde.style.cssText = `position:fixed;left:${r.left}px;width:${r.width}px;top:${r.bottom + 2}px;height:3px;border-radius:2px;background:#E27B72;`
      + 'box-shadow:0 0 10px rgba(226,123,114,.9);opacity:0;pointer-events:none;z-index:70;transition:opacity .15s';
    const cartel = document.createElement('div');
    cartel.textContent = '⛔ Ya está último: no puede bajar';
    cartel.style.cssText = `position:fixed;left:${r.left + r.width / 2}px;top:${r.bottom + 9}px;transform:translateX(-50%) translateY(-4px);white-space:nowrap;`
      + 'background:rgba(20,16,20,.96);color:#F3C9C4;border:1px solid #E27B72;border-radius:8px;padding:4px 10px;font:600 12px "Space Grotesk",system-ui,sans-serif;'
      + 'box-shadow:0 6px 18px rgba(0,0,0,.5);opacity:0;pointer-events:none;z-index:70;transition:opacity .25s, transform .25s';
    document.body.append(borde, cartel);
    setTimeout(() => { borde.style.opacity = '1'; }, 330);
    setTimeout(() => { borde.style.opacity = '0'; cartel.style.opacity = '1'; cartel.style.transform = 'translateX(-50%)'; }, 560);
    setTimeout(() => { cartel.style.opacity = '0'; f.style.boxShadow = ''; f.style.zIndex = ''; }, DEMORA_TOTAL_MS - 500);
    setTimeout(() => { borde.remove(); cartel.remove(); if(estabaPlegada){ iniciativaPlegada = true; renderIniciativaSinAnim(); } }, DEMORA_TOTAL_MS - 250);
  }, idDuelo ? 450 : 0);
}
