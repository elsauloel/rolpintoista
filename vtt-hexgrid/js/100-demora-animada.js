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
let iniUltimo = null, iniAnterior = null;   // la iniciativa del último dibujo y la de antes del último cambio de orden (para mostrar «el antes» en la Demora)
const iniCopia = x => { try{ return structuredClone(x); }catch(e){ try{ return JSON.parse(JSON.stringify(x)); }catch(e2){ return null; } } };
renderIniciativa = function(){
  const caja = $('#iniciativa');
  const clave = JSON.stringify((iniciativa.orden || []).map(o => o.id));
  const cambio = clave !== iniOrdenClave;
  if(demoraEnCurso){   // ⏬ mientras corre la Demora, la lista la maneja ella: solo se anota lo que llega (al terminar se dibuja lo último)
    if(cambio){ if(iniOrdenClave) iniAnterior = iniUltimo; iniOrdenClave = clave; }
    iniUltimo = iniCopia(iniciativa);
    return;
  }
  const tops = new Map();
  if(cambio) iniFilas(caja).forEach(f => { const r = f.getBoundingClientRect(); if(r.height > 0) tops.set(f.dataset.iniFila, r.top); });
  renderIniciativaSinAnim();
  const ahora = iniFilas(caja).map(f => f.dataset.iniFila);
  if(cambio){
    if(iniOrdenClave){ iniIdsAntes = iniIdsAhora.length ? iniIdsAhora : ahora; iniAnterior = iniUltimo; }
    iniOrdenClave = clave;
    if(tops.size) iniDeslizar(caja, f => tops.has(f.dataset.iniFila) ? tops.get(f.dataset.iniFila) : null);
  }
  iniIdsAhora = ahora;
  iniUltimo = iniCopia(iniciativa);
};

/* ⏬ La Demora, paso a paso y sin apuro (2026-11-05, dueño: «hay que hacerla más amigable a la vista… el menú del duelo debe replegarse a su token con
   una animación suave. Se debe llevar la atención al menú de iniciativa, con algún tipo de brillo o pulso, que sobre el menú aparezca la palabra
   "demora"… una animación de click en el menú, recién ahí que se despliegue y vaya la animación de la demora. Y cuando termine todo, el menú del duelo
   debe volver a desplegarse desde el token»; «si hiciera falta, se haga un scroll hasta el final de la lista para garantizarse que se vea»):
     1. el duelo abierto vuela a su token (Duelo.apartar);  2. la lista brilla y arriba aparece «⏬ Demora»;  3. un clic animado en su cabecera;
     4. se despliega mostrando el orden de ANTES y, si el demorado no se ve, la lista baja suave hasta él;  5. los nombres se deslizan al orden nuevo
     (o, si ya era el último, choca con el borde: `choque`) y, si su lugar nuevo quedó abajo, la lista lo sigue;  6. un momento quieta, se vuelve a
     plegar si estaba plegada;  7. el duelo vuelve a nacer desde su token. */
const DEMORA_T = {atencion: 1500, clic: 1050, desplegar: 450, scroll: 800, mover: 1400, seguir: 700, quieta: 1500, plegar: 500};
let demoraEnCurso = false;
const demoraCola = [];
function demoraCss(){
  if(document.getElementById('demora-css')) return;
  const st = document.createElement('style');
  st.id = 'demora-css';
  st.textContent = '#iniciativa.demora-atencion{opacity:1 !important;animation:demora-brillo 1s ease-in-out infinite}' +
    '@keyframes demora-brillo{0%,100%{box-shadow:0 10px 26px rgba(0,0,0,.55),0 0 0 1px rgba(226,123,114,.5)}50%{box-shadow:0 10px 26px rgba(0,0,0,.55),0 0 0 3px #E27B72,0 0 26px 6px rgba(226,123,114,.55)}}' +
    '.demora-cartel{position:fixed;z-index:70;pointer-events:none;transform:translate(-50%,-6px);opacity:0;transition:opacity .45s ease,transform .45s ease;' +
    'background:rgba(20,16,20,.96);color:#F3C9C4;border:1px solid #E27B72;border-radius:999px;padding:5px 14px;font:700 13px "Space Grotesk",system-ui,sans-serif;' +
    'letter-spacing:.06em;box-shadow:0 6px 18px rgba(0,0,0,.5),0 0 14px rgba(226,123,114,.45);white-space:nowrap}' +
    '.demora-cartel.der{transform:translate(-8px,-50%)}.demora-cartel.izq{transform:translate(calc(-100% + 8px),-50%)}' +
    '.demora-cartel.der.ver{opacity:1;transform:translate(0,-50%)}.demora-cartel.izq.ver{opacity:1;transform:translate(-100%,-50%)}' +
    '.demora-dedo{position:fixed;z-index:71;pointer-events:none;font-size:26px;opacity:0;transition:opacity .3s ease,transform .45s cubic-bezier(.3,.7,.4,1);filter:drop-shadow(0 3px 5px rgba(0,0,0,.6))}' +
    '.demora-onda{position:fixed;z-index:70;pointer-events:none;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;border:2px solid #F3C9C4;animation:demora-onda .7s ease-out forwards}' +
    '@keyframes demora-onda{0%{transform:scale(.4);opacity:1}100%{transform:scale(4);opacity:0}}';
  document.head.appendChild(st);
}
const esperar = ms => new Promise(r => setTimeout(r, ms));
const lentoDemora = () => { try{ return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }catch(e){ return false; } };
// Baja (o sube) la lista de a poco hasta que la fila quede a la vista; → cuánto hay que esperar.
function demoraScrollA(fila, arriba){
  const lista = document.getElementById('iniciativa-lista');
  if(!lista || !fila || lista.scrollHeight <= lista.clientHeight + 2) return 0;
  const rl = lista.getBoundingClientRect(), rf = fila.getBoundingClientRect();
  if(rf.top >= rl.top + 4 && rf.bottom <= rl.bottom - 4) return 0;
  const destino = Math.max(0, Math.min(lista.scrollHeight - lista.clientHeight, lista.scrollTop + (rf.top - rl.top) - lista.clientHeight * (arriba ? 0.25 : 0.6)));
  lista.scrollTo({top: destino, behavior: lentoDemora() ? 'auto' : 'smooth'});
  return DEMORA_T.scroll;
}

function demoraAnimar(tokenId, momentoId){ demoraEncolar(tokenId, momentoId, false); }
function demoraChoque(tokenId, momentoId){ demoraEncolar(tokenId, momentoId, true); }
function demoraEncolar(tokenId, momentoId, choque){
  if(momentoId){ if(demorasVistas.has(momentoId)) return; demorasVistas.add(momentoId); }
  demoraCola.push({tokenId, choque});
  if(!demoraEnCurso) demoraSiguiente();
}
async function demoraSiguiente(){
  const x = demoraCola.shift();
  if(!x){ demoraEnCurso = false; return; }
  demoraEnCurso = true;
  try{ await demoraSecuencia(x.tokenId, x.choque); }catch(err){ console.error('La animación de la Demora:', err); }
  demoraEnCurso = false;
  renderIniciativa();   // lo último que haya llegado mientras tanto
  if(demoraCola.length) setTimeout(demoraSiguiente, 300);
}
async function demoraSecuencia(tokenId, choque){
  const caja = $('#iniciativa');
  if(!caja) return;
  demoraCss();
  const lento = lentoDemora();
  const T = k => lento ? Math.min(250, DEMORA_T[k]) : DEMORA_T[k];
  // 1. El duelo vuelve a su token.
  const idDuelo = typeof Duelo !== 'undefined' && Duelo.abiertoId ? Duelo.abiertoId() : null;
  let vuelo = 0;
  if(idDuelo && Duelo.apartar) vuelo = Duelo.apartar(idDuelo) || 0;   // (vuelve al final de esta secuencia: Duelo.volverApartado)
  if(vuelo) await esperar(vuelo + 250);
  // 2. La atención en la lista: brillo y el cartel «⏬ Demora».
  const estabaPlegada = iniciativaPlegada;
  caja.classList.add('demora-atencion');
  const r0 = caja.getBoundingClientRect();
  const cartel = document.createElement('div');
  cartel.className = 'demora-cartel';
  cartel.textContent = choque ? '⏬ DEMORA · ya está último' : '⏬ DEMORA';
  // Al costado de la cabecera (a la derecha; si no entra, a la izquierda), así no tapa la lista cuando se despliega.
  const rcab = (document.getElementById('iniciativa-cab') || caja).getBoundingClientRect();
  cartel.style.top = (rcab.top + rcab.height / 2) + 'px';
  if(r0.right + 190 < innerWidth){ cartel.style.left = (r0.right + 12) + 'px'; cartel.classList.add('der'); }
  else { cartel.style.left = (r0.left - 12) + 'px'; cartel.classList.add('izq'); }
  document.body.appendChild(cartel);
  requestAnimationFrame(() => cartel.classList.add('ver'));
  // 3. El clic en la cabecera (solo si está plegada: si ya está abierta, alcanza con el brillo).
  const cab = document.getElementById('iniciativa-cab') || caja;
  if(estabaPlegada && !lento){
    const rc = cab.getBoundingClientRect(), cx = rc.left + Math.min(rc.width * 0.5, 150), cy = rc.top + rc.height / 2;
    const dedo = document.createElement('div');
    dedo.className = 'demora-dedo'; dedo.textContent = '👆';
    dedo.style.left = (cx + 30) + 'px'; dedo.style.top = (cy + 46) + 'px';
    document.body.appendChild(dedo);
    await esperar(T('atencion') - T('clic'));
    requestAnimationFrame(() => { dedo.style.opacity = '1'; dedo.style.transform = 'translate(-30px,-40px)'; });
    await esperar(650);
    dedo.style.transform = 'translate(-30px,-36px) scale(.88)';
    const onda = document.createElement('div'); onda.className = 'demora-onda'; onda.style.left = cx + 'px'; onda.style.top = cy + 'px';
    document.body.appendChild(onda);
    setTimeout(() => onda.remove(), 800);
    await esperar(T('clic') - 650);
    dedo.style.opacity = '0';
    setTimeout(() => dedo.remove(), 400);
  }else await esperar(T('atencion'));
  // 4. Se despliega con el orden de antes y se busca al demorado.
  const antes = choque ? null : iniAnterior, real = iniciativa;
  if(antes && antes.orden && antes.orden.some(o => o.id === tokenId)) iniciativa = antes;
  iniciativaPlegada = false;
  try{ renderIniciativaSinAnim(); }finally{ iniciativa = real; }
  caja.animate && caja.animate([{opacity: .6}, {opacity: 1}], {duration: T('desplegar'), easing: 'ease-out'});
  await esperar(T('desplegar'));
  let fila = iniFilas(caja).find(f => f.dataset.iniFila === tokenId);
  await esperar(demoraScrollA(fila, !choque));
  if(!choque){
    // 5. Los nombres van del orden de antes al de ahora.
    const tops = new Map();
    iniFilas(caja).forEach(f => tops.set(f.dataset.iniFila, f.getBoundingClientRect().top));
    const lista = document.getElementById('iniciativa-lista'), sc = lista ? lista.scrollTop : 0;
    renderIniciativaSinAnim();
    if(lista) lista.scrollTop = sc;
    iniOrdenClave = JSON.stringify((iniciativa.orden || []).map(o => o.id));
    iniIdsAhora = iniFilas(caja).map(f => f.dataset.iniFila);
    iniUltimo = iniCopia(iniciativa);
    iniDeslizarDur(caja, f => tops.has(f.dataset.iniFila) ? tops.get(f.dataset.iniFila) : null, tokenId, T('mover'));
    await esperar(T('mover') + 100);
    fila = iniFilas(caja).find(f => f.dataset.iniFila === tokenId);
    await esperar(demoraScrollA(fila, false) ? T('seguir') : 0);
  }else{
    fila = iniFilas(caja).find(f => f.dataset.iniFila === tokenId);
    if(fila) await demoraChocar(fila, T('mover'));
  }
  // 6. Quieta un momento y, si estaba plegada, se vuelve a plegar.
  cartel.classList.remove('ver');
  await esperar(T('quieta'));
  caja.classList.remove('demora-atencion');
  setTimeout(() => cartel.remove(), 600);
  if(estabaPlegada){ iniciativaPlegada = true; renderIniciativaSinAnim(); }
  await esperar(T('plegar'));
  // 7. El duelo vuelve desde su token.
  if(idDuelo && vuelo && Duelo.volverApartado) Duelo.volverApartado(idDuelo);
}
// Como iniDeslizar, con otra duración (la Demora va más lenta que un cambio cualquiera).
function iniDeslizarDur(caja, desde, resaltar, ms){
  iniFilas(caja).forEach(f => {
    const antes = desde(f);
    if(antes === null || antes === undefined) return;
    const dy = antes - f.getBoundingClientRect().top;
    if(Math.abs(dy) < 1 && f.dataset.iniFila !== resaltar) return;
    f.style.transition = 'none';
    f.style.transform = `translateY(${dy}px)`;
    if(f.dataset.iniFila === resaltar){ f.style.position = 'relative'; f.style.zIndex = '2'; f.style.boxShadow = '0 0 0 2px #E27B72, 0 0 14px rgba(226,123,114,.7)'; }
    void f.offsetHeight;
    f.style.transition = `transform ${ms}ms cubic-bezier(.45,.05,.25,1), box-shadow 600ms`;
    f.style.transform = '';
    if(f.dataset.iniFila === resaltar) setTimeout(() => { f.style.boxShadow = ''; f.style.zIndex = ''; }, ms + 1400);
  });
}
// ⏬ Ya era el último: la fila intenta bajar, choca con el borde de abajo, rebota y tiembla; debajo, «⛔ Ya está último: no puede bajar».
async function demoraChocar(f, ms){
  f.style.position = 'relative'; f.style.zIndex = '2';
  f.style.boxShadow = '0 0 0 2px #E27B72, 0 0 14px rgba(226,123,114,.7)';
  const h = Math.max(10, Math.min(18, f.offsetHeight * 0.45));
  if(f.animate) f.animate([
    {transform: 'translateY(0)', offset: 0},
    {transform: `translateY(${h}px)`, offset: 0.3, easing: 'cubic-bezier(.5,0,1,1)'},
    {transform: `translateY(${h * 0.35}px)`, offset: 0.44},
    {transform: `translateY(${h * 0.7}px)`, offset: 0.54},
    {transform: `translateX(-4px) translateY(${h * 0.5}px)`, offset: 0.62},
    {transform: `translateX(4px) translateY(${h * 0.4}px)`, offset: 0.7},
    {transform: 'translateX(-3px) translateY(2px)', offset: 0.78},
    {transform: 'translateX(2px)', offset: 0.86},
    {transform: 'translateY(0)', offset: 1},
  ], {duration: ms});
  const r = f.getBoundingClientRect();
  const borde = document.createElement('div');
  borde.style.cssText = `position:fixed;left:${r.left}px;width:${r.width}px;top:${r.bottom + 2}px;height:3px;border-radius:2px;background:#E27B72;`
    + 'box-shadow:0 0 10px rgba(226,123,114,.9);opacity:0;pointer-events:none;z-index:70;transition:opacity .2s';
  const cartel = document.createElement('div');
  cartel.textContent = '⛔ Ya está último: no puede bajar';
  cartel.style.cssText = `position:fixed;left:${r.left + r.width / 2}px;top:${r.bottom + 9}px;transform:translateX(-50%) translateY(-4px);white-space:nowrap;`
    + 'background:rgba(20,16,20,.96);color:#F3C9C4;border:1px solid #E27B72;border-radius:8px;padding:4px 10px;font:600 12px "Space Grotesk",system-ui,sans-serif;'
    + 'box-shadow:0 6px 18px rgba(0,0,0,.5);opacity:0;pointer-events:none;z-index:70;transition:opacity .35s, transform .35s';
  document.body.append(borde, cartel);
  setTimeout(() => { borde.style.opacity = '1'; }, ms * 0.28);
  setTimeout(() => { borde.style.opacity = '0'; cartel.style.opacity = '1'; cartel.style.transform = 'translateX(-50%)'; }, ms * 0.5);
  await esperar(ms + 1400);
  cartel.style.opacity = '0'; f.style.boxShadow = ''; f.style.zIndex = '';
  setTimeout(() => { borde.remove(); cartel.remove(); }, 450);
}
