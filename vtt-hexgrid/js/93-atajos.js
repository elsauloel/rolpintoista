/* ---------- ⌨ Atajos de teclado de las habilidades y los consumibles (dueño, 2026-11-03) ----------
   En la Botonera de un personaje y en las ⚔ Acciones de un creep, cada habilidad y cada consumible tiene a la izquierda un cuadradito
   (comun/atajos.js): se toca y se aprieta un número (1–9 o 0) para asignárselo; Supr o Backspace lo borra; Esc cancela. Después, con
   ese token seleccionado en el mapa, el número (habilidad) o Shift + el número (consumible) pregunta «¿Ejecutar X?» y, con Sí, toca su
   botón: hace exactamente lo mismo que el «Ejecutar» / «Consumir» / «Usar» de siempre (si la Botonera estaba cerrada, la abre).
   Se guardan en cada personaje (S.meta.atajos, con la ficha) y en cada creep (sc.atajos, con modificarCreep): no son del usuario.
   Las invocaciones todavía no tienen (su Botonera es otra). No funcionan escribiendo en un campo, con un cartel abierto, eligiendo un
   objetivo, ni con un token que no es tuyo (botoneraDeToken). Ctrl / Alt / Cmd + número quedan para el navegador. */
let atajoEsperando = null;   // {tipo, id, quien: 'pj'|'creep', ref, el}: el cuadradito que espera su número

// ¿De qué panel es el cuadradito? (la Botonera del personaje o las Acciones del creep; la de una invocación, no)
function atajoQuienDe(el){
  const root = el && el.getRootNode ? el.getRootNode() : null;
  if(typeof bn !== 'undefined' && bn && root === bn.raiz) return bn.invId ? null : {quien: 'pj', ref: bn.fichaId};
  if(typeof ac !== 'undefined' && ac && root === ac.raiz) return {quien: 'creep', ref: ac.creepId};
  return null;
}
function atajoRedibujar(quien){
  if(quien === 'pj' && typeof bnDibujar === 'function') bnDibujar();
  if(quien === 'creep' && typeof acDibujar === 'function') acDibujar();
}
function atajoCancelar(){
  if(!atajoEsperando) return;
  const q = atajoEsperando.quien;
  atajoEsperando = null;
  atajoRedibujar(q);
}
// Guardar el número (o sacarlo, con n = null).
async function atajoGuardar(a, n){
  atajoEsperando = null;
  if(a.quien === 'pj'){
    if(!bn || bn.fichaId !== a.ref || !bn.S){ toast('No se pudo guardar el atajo: el personaje se cerró'); return; }
    if(!bnPuedeGuardar()){ toast('No podés cambiar los atajos de este personaje'); bnDibujar(); return; }
    const ui = bnUi(FichaGuardado.partes(bn.S));
    bn.S.meta = bn.S.meta || {};
    bn.S.meta.atajos = Atajos.asignar(bn.S.meta.atajos, a.tipo, a.id, n);
    ui.cambio();
  }else{
    await acCambiarCreep(a.ref, sc => { sc.atajos = Atajos.asignar(sc.atajos, a.tipo, a.id, n); });
    if(ac && ac.creepId === a.ref) acDibujar();
  }
  toast(n === null ? '⌨ Atajo borrado' : `⌨ Atajo: ${a.tipo === 'cons' ? 'Shift + ' : ''}${n}`);
}
// Tocar un cuadradito: queda esperando el número. En captura: el botón no llega a los manejadores de la Botonera.
document.addEventListener('click', e => {
  const el = (e.composedPath ? e.composedPath() : []).find(x => x && x.dataset && x.dataset.atajo);
  if(!el) return;
  e.preventDefault();
  e.stopPropagation();
  const q = atajoQuienDe(el);
  if(!q) return;
  if(atajoEsperando && atajoEsperando.el === el){ atajoCancelar(); return; }
  if(atajoEsperando) atajoCancelar();
  if(q.quien === 'pj' && !bnPuedeGuardar()){ toast('No podés cambiar los atajos de este personaje'); return; }
  const v = el.dataset.atajo, i = v.indexOf(':');
  // El panel se redibujó (acá o al cancelar): el cuadradito nuevo es otro elemento; se busca por su data-atajo.
  const raiz = q.quien === 'pj' ? bn.raiz : ac.raiz;
  const vivo = raiz.querySelector(`[data-atajo="${CSS.escape(v)}"]`) || el;
  atajoEsperando = {tipo: v.slice(0, i), id: v.slice(i + 1), ...q, el: vivo};
  vivo.classList.add('esperando');
  vivo.textContent = '…';
  toast('⌨ Apretá un número (1–9, 0) · Supr lo borra · Esc cancela');
}, true);

// Un redibujo del panel (llega un cambio de la ficha o del creep) borra la marca: se la vuelve a poner (lo llaman bnDibujar y acDibujar).
function atajoReponer(){
  const a = atajoEsperando;
  if(!a) return;
  const raiz = a.quien === 'pj' ? (bn && bn.raiz) : (ac && ac.raiz);
  const el = raiz && raiz.querySelector(`[data-atajo="${CSS.escape(a.tipo + ':' + a.id)}"]`);
  if(!el) return;
  a.el = el;
  el.classList.add('esperando');
  el.textContent = '…';
}
// ¿Hay algo abierto que se quede con el teclado? (un cartel del juego, una ventana adentro de la Botonera o las Acciones, elegir un objetivo)
function atajoTecladoOcupado(){
  if(document.querySelector('.cfj-fondo, .scrim.open, .pap-fondo')) return true;
  if(typeof bn !== 'undefined' && bn && !bn.host.hidden && bn.raiz.querySelector('.scrim.open, .pap-fondo')) return true;
  if(typeof ac !== 'undefined' && ac && !ac.host.hidden && ac.raiz.querySelector('.scrim.open, .pap-fondo')) return true;
  if(typeof elegirDestinoCb !== 'undefined' && elegirDestinoCb) return true;
  return false;
}
const atajoEspera = ms => new Promise(r => setTimeout(r, ms));

// Lo que hace una tecla con el token seleccionado: buscar qué tiene asignado, preguntar y tocar su botón.
async function atajoUsar(t){
  const tk = seleccion ? tokens.get(seleccion) : null;
  const b = botoneraDeToken(tk);
  if(!b){ toast(seleccion ? 'Ese token no es tuyo: los atajos son de tus tokens' : 'Seleccioná tu token para usar los atajos'); return; }
  if(b.inv){ toast('Las invocaciones todavía no tienen atajos'); return; }
  let at, existe, nombreDe;
  if(b.creep){
    const sc = creepPrivadoDe(b.creep);
    if(!sc){ toast('Todavía se está cargando el creep'); return; }
    at = sc.atajos;
    existe = (tipo, id) => tipo === 'hab' ? (sc.habilidades || []).some(h => h && h.id === id) : (sc.cinturon || []).some(x => x && x.id === id);
    nombreDe = (tipo, id) => ((tipo === 'hab' ? sc.habilidades : sc.cinturon) || []).find(x => x && x.id === id).nombre || 'eso';
  }else{
    if(!(bn && bn.fichaId === b.ficha && bn.S)){
      abrirBotoneraDeSeleccion();
      for(let i = 0; i < 40 && !(bn && bn.fichaId === b.ficha && bn.S); i++) await atajoEspera(100);
      if(!(bn && bn.fichaId === b.ficha && bn.S)){ toast('No se pudo leer el personaje'); return; }
    }
    const S = bn.S;
    at = S.meta && S.meta.atajos;
    const cons = v => { const i = v.indexOf(':'); return (S[v.slice(0, i)] || []).find(x => x && x.id === v.slice(i + 1) && x.consumible); };
    existe = (tipo, id) => tipo === 'hab' ? (S.habilidades || []).some(h => h && h.id === id) : !!cons(id);
    nombreDe = (tipo, id) => (tipo === 'hab' ? (S.habilidades || []).find(h => h && h.id === id) : cons(id)).nombre || 'eso';
  }
  const acc = Atajos.accion(at, t, existe);
  const tecla = `${t.shift ? 'Shift + ' : ''}${t.n}`;
  if(acc.vacio){ toast(acc.perdido ? `⌨ ${tecla}: lo que tenía asignado ya no está` : `⌨ ${tecla} no tiene nada asignado`); return; }
  const nombre = nombreDe(acc.tipo, acc.id);
  const hab = acc.tipo === 'hab';
  if(!(await Confirmar.preguntar(hab ? `¿Ejecutar ${nombre}?` : `¿Usar ${nombre}?`, {titulo: `Atajo ${tecla}`, icono: '⌨', si: hab ? 'Ejecutar' : 'Usar', no: 'No'}))) return;
  // Abrir el panel si está cerrado, esperar su botón y tocarlo: hace lo mismo que el clic de siempre.
  const panel = () => b.creep ? (ac && ac.creepId === b.creep && !ac.host.hidden ? ac.raiz : null) : (bn && bn.fichaId === b.ficha && !bn.invId && !bn.host.hidden ? bn.raiz : null);
  if(!panel()){ if(b.creep) abrirAcciones(b.creep); else abrirBotonera(b.ficha, undefined, ''); }
  const sel = `[data-atajo="${CSS.escape(acc.tipo + ':' + acc.id)}"]`;
  let boton = null;
  for(let i = 0; i < 40; i++){
    const r = panel(), c = r && r.querySelector(sel), fila = c && c.closest('.bot-fila, .accion-row');
    boton = fila && fila.querySelector('[data-ejecutar], [data-consume], [data-consumirankh], [data-cin-consumir]');
    if(boton) break;
    await atajoEspera(100);
  }
  if(!boton){ toast(`No encontré el botón de ${nombre}`); return; }
  if(boton.disabled){ toast(`${nombre}: ahora no se puede${boton.title ? ' — ' + boton.title : ''}`); return; }
  boton.click();
}

document.addEventListener('keydown', e => {
  // Esperando el número de un cuadradito: el teclado es de él.
  if(atajoEsperando){
    const a = atajoEsperando;
    if(e.key === 'Escape'){ e.preventDefault(); e.stopImmediatePropagation(); atajoCancelar(); return; }
    if(e.key === 'Delete' || e.key === 'Backspace'){ e.preventDefault(); e.stopImmediatePropagation(); atajoGuardar(a, null); return; }
    const t = Atajos.teclaDe(e);
    if(t){ e.preventDefault(); e.stopImmediatePropagation(); atajoGuardar(a, t.n); }
    return;
  }
  const t = Atajos.teclaDe(e);
  if(!t || !fbMiembro || e.repeat) return;
  if(escribiendoEnCampo(e) || atajoTecladoOcupado()) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  atajoUsar(t);
}, true);
