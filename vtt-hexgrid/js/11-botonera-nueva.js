// js/11-botonera-nueva.js — tramo 11 de 14 del script de mapa.html (paso 5, nivel A: mismo código, en el mismo orden): Botonera de la ficha dentro del mapa y la Botonera nueva (⚗).
/* ---------- Botonera de la ficha, dentro del mapa ----------
   Carga la ficha en un iframe (?modo=botonera), que muestra solo la
   Botonera. El iframe queda cargado mientras sea el mismo personaje, así
   volver a abrirla es instantáneo. Lo que se haga ahí se guarda en la
   ficha como siempre y se ve en el token. */
// La misma capa sirve para las Acciones de un creep (gm-tools con
// ?modo=acciones, solo GM). herramienta: 'ficha' | 'gm'.
let botonera = {herramienta: '', fichaId: '', lista: false};

// En pantallas anchas la capa tapa solo la mitad izquierda del mapa; en la
// otra mitad se sigue viendo el mapa, centrado en el token de esa ventana.
function botoneraEnMitad(){ return window.innerWidth > 760; }

function ubicarBotoneraCapa(){
  const capa = $('#botonera-capa');
  if(capa.hidden) return;
  if(!botoneraEnMitad() || botonera.completa){ capa.removeAttribute('style'); return; }   // la ventana de la batalla ocupa todo el centro
  const r = $('#lienzo-caja').getBoundingClientRect();
  Object.assign(capa.style, {
    left: r.left + 'px', top: r.top + 'px', right: 'auto', bottom: 'auto',
    width: Math.round(r.width / 2) + 'px', height: r.height + 'px',
  });
}
window.addEventListener('resize', ubicarBotoneraCapa);

function centrarTokenDeBotonera(herramienta, id){
  const es = t => !!(t && t.fichaId && (herramienta === 'gm'
    ? t.tipo === 'creep' && t.fichaId === id
    : t.tipo === 'pj' && t.fichaId.split(SEP_INVOCACION)[0] === id));
  const lista = [...tokens.values()];
  const sel = seleccion ? tokens.get(seleccion) : null;
  const t = es(sel) ? sel : (lista.find(x => es(x) && !x.fichaId.includes(SEP_INVOCACION)) || lista.find(es));
  if(!t) return;
  const c = hexCentro(t.col, t.fila);
  const centroLibre = botoneraEnMitad() ? anchoPx * 0.75 : anchoPx / 2;
  vista.x = centroLibre - c.x * vista.zoom;
  vista.y = altoPx / 2 - c.y * vista.zoom;
  guardarVista(); pedirDibujo();
}

// invId: si viene, abre la Botonera de esa invocación del personaje en vez
// de la propia (mismo iframe: la ficha ya sabe mostrar una u otra).
function abrirBotonera(fichaId, mensaje, invId, sinNueva){
  if(!mensaje && !sinNueva && bnActiva()){ abrirBotoneraNueva(fichaId, invId || ''); return; }   // ⚗ prueba (paso 4, etapa 3b; con invocación, 4e)
  const capa = $('#botonera-capa');
  const marco = $('#botonera-marco');
  const completa = !!(mensaje && (mensaje.tipo === 'abrir-botin' || mensaje.tipo === 'abrir-equipo'));   // la ventana de la batalla y la de Equipo y mochila ocupan todo el centro
  capa.hidden = false;
  botonera.completa = completa;
  ubicarBotoneraCapa();
  if(!completa) centrarTokenDeBotonera('ficha', fichaId);
  if(botonera.herramienta === 'ficha' && botonera.fichaId === fichaId && botonera.lista){
    botonera.invId = invId || '';
    MensajesMapa.alMarco(marco, mensaje || {tipo: 'abrir-botonera', inv: invId || ''});
    enfocarBotonera();
    return;
  }
  $('#botonera-cargando-texto').textContent = 'Abriendo la Botonera…';
  $('#botonera-cargando').hidden = false;
  if(botonera.herramienta === 'ficha' && botonera.fichaId === fichaId && !botonera.lista){   // se está precargando: al estar lista, se abre
    Object.assign(botonera, {invId: invId || '', pendiente: mensaje || {tipo: 'abrir-botonera', inv: invId || ''}, completa});
    return;
  }
  botonera = {herramienta: 'ficha', fichaId, invId: invId || '', lista: false, pendiente: mensaje || null, completa};
  const inv = invId ? `&inv=${encodeURIComponent(invId)}` : '';
  marco.src = sinCache(`../ficha-personaje/ficha.html?partida=${encodeURIComponent(FB_CAMPANA)}&modo=botonera${inv}#${encodeURIComponent(fichaId)}`);
}

// Atajo B: la Botonera del personaje principal de un jugador — el primer
// token de personaje suyo en el mapa que se ve, o, si no tiene ninguno
// puesto, su primera ficha.
function fichaPrincipalId(){
  if(!fbUsuario) return '';
  let fichaId = '';
  for(const t of tokens.values()){
    if(t.tipo === 'pj' && t.duenoUid === fbUsuario.uid && t.fichaId && !t.fichaId.includes(SEP_INVOCACION)){ fichaId = t.fichaId; break; }
  }
  if(!fichaId){
    for(const [id, f] of fichasPub.entries()){ if(f.duenoUid === fbUsuario.uid){ fichaId = id; break; } }
  }
  return fichaId;
}
// ¿Se puede abrir la Botonera (o las Acciones) de este token? Un jugador la de sus personajes e invocaciones; el GM, la de un creep.
function botoneraDeToken(t){
  if(!t || !t.fichaId || !fbUsuario) return null;
  if(t.tipo === 'creep') return soyGM && creepsPub.has(t.fichaId) ? {creep: t.fichaId} : null;
  const v = vinculo(t);
  if(!v || (!controloFicha(t.fichaId) && (soyGM || v.duenoUid !== fbUsuario.uid))) return null;
  const [ficha, inv] = t.fichaId.split(SEP_INVOCACION);
  return {ficha, inv: inv || ''};
}
// Abre la del token seleccionado; devuelve false si no hay nada que abrir.
function abrirBotoneraDeSeleccion(){
  const b = botoneraDeToken(seleccion ? tokens.get(seleccion) : null);
  if(!b) return false;
  if(b.creep) abrirAcciones(b.creep); else abrirBotonera(b.ficha, undefined, b.inv);
  return true;
}
function abrirBotoneraPrincipal(){
  const fichaId = fichaPrincipalId();
  if(!fichaId){ toast('No tenés un personaje con Botonera'); return; }
  abrirBotonera(fichaId);
}

/* ---------- ⚗ Botonera nueva (prueba) — paso 4, etapas 3b–3d (docs/plan-paso4-etapa3.md, 2026-10-01) ----------
   Detrás de un interruptor ("⚗ Botonera nueva", recordado en este navegador; desde el 2026-10-01 lo ve cualquiera, P140: el GM
   la prueba primero en una sesión real y después la prende el jugador que quiera): la Botonera de un personaje la dibuja el
   mapa con las piezas de comun/ — FichaSesion para leerlo y guardarlo, FichaBotonera para dibujarlo —, en un recuadro aislado
   (shadow DOM) con el ficha.css de siempre, así se ve igual. Desde la 3c todos sus botones los hace el mapa (FichaAcciones,
   FichaDuelo, FichaLupa); solo el Editar del Ver le pide el editor a la ficha, que se carga escondida recién ahí (bnAlMarco).
   Las piezas se cargan recién al usarla: con el interruptor apagado no cambia nada. */
const BN_CLAVE = 'botonera-nueva-prueba';
const BN_PIEZAS = ['../comun/ficha-calculo.js?v=20261002i', '../comun/ficha-combate.js?v=20261001a', '../comun/skills-clase.js?v=20261002i', '../comun/ficha-habilidades.js?v=20261001c',
  '../comun/catalogo.js?v=20261002i', '../comun/items-subidos.js?v=20260930a', '../comun/ficha-guardado.js?v=20261002d', '../comun/ficha-sesion.js?v=20261001b', '../comun/ficha-botonera.js?v=20261002i', '../comun/ficha-resumen.js?v=20261001a', '../comun/inv-calculo.js?v=20261002d', '../comun/inv-botonera.js?v=20261001a', '../comun/inv-acciones.js?v=20261001a', '../comun/inv-duelo.js?v=20261001a', '../comun/ficha-acciones.js?v=20261002i', '../comun/inv-habilidades.js?v=20261002g', '../comun/inv-lupa.js?v=20261001a',
  '../comun/confirmar-turno.js?v=20260930b', '../comun/ficha-duelo.js?v=20261001b', '../comun/lupa.js?v=20261001a', '../comun/ficha-lupa.js?v=20261001a'];
const BN_FUENTES = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,900&display=swap';
/* El panel del costado es angosto (2026-10-02, pedido del dueño: "la botonera nueva se ve muy mal… cada bloque debe estar ubicado debajo del
   anterior"): en la ficha las columnas se juntan recién con la PANTALLA angosta (@media), pero en el mapa la pantalla es ancha y el panel
   no. Estas reglas valen solo adentro de los recuadros del mapa (Botonera nueva y Acciones nuevas de los creeps). */
const PANEL_CSS = `
.botonera-grid,.botonera-grid-even{grid-template-columns:1fr !important}
.botonera-list-grid{grid-template-columns:1fr !important}
.botonera-list-grid .cat-row.bot-fila{flex-wrap:wrap}
.bot-fila-info{flex:1 1 160px}
.bot-fila-info .cat-nombre{overflow-wrap:normal;word-break:normal}
.botonera-stats-grid{grid-template-columns:repeat(auto-fill,minmax(82px,1fr)) !important}
.botonera-tile{min-width:0}
`;
var bn = null;          // {fichaId, sesion, S, host, raiz} (var: renderModo puede llamar a bnModoCambio durante la carga)
var bnCss = '';
var bnCargando = null;
var bnItemsSubidos = [];
const bnMezclarCatalogo = lista => ItemsSubidos.mezclar(lista, bnItemsSubidos, FichaGuardado.DEFAULT.catalogo);
const bnActiva = () => { try{ return localStorage.getItem(BN_CLAVE) === '1'; }catch(e){ return false; } };
function bnPintarInterruptor(){
  const b = $('#btn-botonera-nueva');
  if(!b) return;
  b.hidden = !fbMiembro;   // cualquiera de la partida (P140)
  b.textContent = `⚗ Botonera nueva: ${bnActiva() ? 'sí' : 'no'}`;
  b.classList.toggle('primary', bnActiva());
}
function bnAlternar(){
  try{ localStorage.setItem(BN_CLAVE, bnActiva() ? '0' : '1'); }catch(e){}
  bnPintarInterruptor();
  if(!bnActiva()) cerrarBotoneraNueva();
  else if(soyGM) acCargarPiezas().catch(err => console.error(err));   // los ganchos del duelo de los creeps (tanda 4)
  toast(bnActiva() ? '⚗ Botonera nueva prendida (solo en este navegador): abrí la Botonera de tu personaje con B o con su token. Si algo no anda, apagala.' : 'Botonera nueva apagada: vuelve la de siempre');
}
// Las piezas de comun/ que el mapa no carga siempre, y el ficha.css (con :root → :host para que valga adentro del recuadro).
// Carga scripts de comun/ en orden, una sola vez cada uno (se reconocen sin el ?v=): la Botonera nueva y las Acciones nuevas
// comparten algunos, y un script con `const` arriba no se puede cargar dos veces.
const piezasCargadas = new Map();
function cargarPiezas(lista){
  return lista.reduce((p, src) => p.then(() => {
    const clave = src.split('?')[0];
    if(!piezasCargadas.has(clave)) piezasCargadas.set(clave, new Promise((ok, mal) => {
      const el = document.createElement('script'); el.src = src; el.onload = ok; el.onerror = () => { piezasCargadas.delete(clave); mal(new Error('No se pudo cargar ' + src)); };
      document.head.appendChild(el);
    }));
    return piezasCargadas.get(clave);
  }), Promise.resolve());
}
function bnCargarPiezas(){
  if(!bnCargando){
    if(!document.querySelector('link[data-bn-fuentes]')){
      const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = BN_FUENTES; l.dataset.bnFuentes = '1'; document.head.appendChild(l);
    }
    bnCargando = cargarPiezas(BN_PIEZAS)
      // Lo que subió el grupo al catálogo (como la ficha): un consumible viejo busca ahí el estado que deja.
      .then(() => ItemsSubidos.cargar().then(l => { bnItemsSubidos = l || []; }))
      .then(() => fetch('../ficha-personaje/ficha.css?v=20260930a').then(r => r.text()))
      .then(css => { bnCss = css.replace(/:root\b/g, ':host'); })
      .catch(err => { bnCargando = null; throw err; });
  }
  return bnCargando;
}
function bnUbicar(){
  if(!bn || bn.host.hidden) return;
  const h = bn.host;
  if(!botoneraEnMitad()){ h.removeAttribute('style'); return; }
  const r = $('#lienzo-caja').getBoundingClientRect();
  Object.assign(h.style, {left: r.left + 'px', top: r.top + 'px', right: 'auto', bottom: 'auto', width: Math.round(r.width / 2) + 'px', height: r.height + 'px'});
}
window.addEventListener('resize', bnUbicar);
function bnColapsados(){ try{ return JSON.parse(localStorage.getItem('ficha-colapsados') || '{}'); }catch(e){ return {}; } }   // el mismo de la ficha
function bnPintarColapsados(){
  const estado = bnColapsados();
  bn.raiz.querySelectorAll('[data-colapsar]').forEach(btn => {
    const cont = btn.closest('.botonera-caja');
    if(cont) cont.classList.toggle('colapsada', !!estado[btn.dataset.colapsar]);
    btn.textContent = estado[btn.dataset.colapsar] ? '🙈' : '👁';
  });
}
function bnDibujar(){
  if(!bn) return;
  const cuerpo = bn.raiz.querySelector('#bn-contenido');
  if(!bn.S){ cuerpo.innerHTML = '<div class="modal catalogo-modal botonera-modal"><div class="body"><div class="hint">Cargando el personaje…</div></div></div>'; return; }
  if(bn.invId){ bnDibujarInv(cuerpo); return; }
  const r = FichaBotonera.html(bn.S, {modoMapa, parryArmaPendiente: bn.parryPendiente || null});
  const scroll = bn.host.scrollTop;
  cuerpo.innerHTML = `<div class="modal catalogo-modal botonera-modal">
    <header>
      <div style="display:flex;align-items:center;gap:10px;min-width:0;flex-wrap:wrap">
        <h3>Botonera <span title="Botonera nueva (prueba): la dibuja el mapa">⚗</span></h3>
        <span class="botonera-badge">${esc(r.nitros)}</span>
        <span class="botonera-badge">${esc(r.sp)}</span>
        <span class="botonera-badge" title="Defensa">${esc(r.def)}</span>
        <span class="hint" style="font-size:11px">${esc((bn.S.meta && bn.S.meta.nombre) || '')}</span>
      </div>
      <div style="display:flex;gap:6px;flex:none"><button class="iconbtn" data-bn-cerrar title="Cerrar (B o Esc)">Cerrar</button></div>
    </header>
    <div class="body" id="botonera-body">${r.html}</div>
  </div>`;
  bnPintarColapsados();
  bn.host.scrollTop = scroll;
}
/* Paso 4, etapa 4e (tanda 2): la Botonera de una invocación del personaje, dibujada con comun/inv-botonera.js (la misma de la
   ficha) a partir de la invocación que trae el personaje (S.invocaciones, al día con FichaSesion). Por ahora cada botón se lo
   pide a la ficha del marco ('botonera-delegar' con `inv`). Una invocación vieja se dibuja sobre una copia migrada (la ficha
   la migra al dibujarla). */
function bnDibujarInv(cuerpo){
  const cruda = (bn.S.invocaciones || []).find(x => x && x.id === bn.invId);
  const marco = adentro => `<div class="modal catalogo-modal botonera-modal" style="max-width:640px">${adentro}</div>`;
  if(!cruda){ cuerpo.innerHTML = marco('<div class="body"><div class="hint">Esa invocación ya no está.</div></div>'); return; }
  const inv = InvCalculo.migrar(structuredClone(cruda));
  const cab = (titulo, badge) => `<header>
      <div style="display:flex;align-items:center;gap:10px;min-width:0;flex-wrap:wrap">
        <h3>${esc(titulo)} <span title="Botonera nueva (prueba): la dibuja el mapa">⚗</span></h3>
        ${badge ? `<span class="botonera-badge">${esc(badge)}</span>` : ''}
        <span class="hint" style="font-size:11px">${esc((bn.S.meta && bn.S.meta.nombre) || '')}</span>
      </div>
      <div style="display:flex;gap:6px;flex:none"><button class="iconbtn" data-bn-cerrar title="Cerrar (B o Esc)">Cerrar</button></div>
    </header>`;
  if(inv.activa === false){ cuerpo.innerHTML = marco(cab(inv.nombre) + `<div class="body"><div class="hint">${esc(inv.nombre)} está dormida — tocá «Invocar» en la ficha para reactivarla.</div></div>`); return; }
  const r = InvBotonera.html(inv, {parryPendiente: !!(bn.invParry && bn.invParry.has(inv.id))});
  const scroll = bn.host.scrollTop;
  cuerpo.innerHTML = marco(cab(r.titulo, r.badge) + `<div class="body" id="botonerainv-body">${r.html}</div>`);
  bn.host.scrollTop = scroll;
}
/* Paso 4, etapa 4e (tanda 3): los botones de la invocación que ya hace el mapa — tiradas de stats, Esquivar, Parry, Bloqueo,
   Daño y Atacar — con comun/inv-acciones.js (el mismo código que la ficha). Como los del personaje, solo si este usuario puede
   guardarlo (bnPuedeGuardar); si no, van a la ficha del marco. Lo que cambia a la invocación (el Parry, el ataque) se guarda en
   la parte `invocaciones` del personaje (bnUi). El Parry que espera su Bloqueo vive acá (bn.invParry). Las tiradas se publican a
   nombre de la invocación y con la ficha de su dueño, como las publica la ficha. */
function bnPublicarInv(inv, t){
  if(!t) return;
  if(t.error){ toast(t.error); return; }
  mesaPublicar(t.origen, {...t.r, quien: inv.nombre, ficha: bn.fichaId});
  window.dispatchEvent(new CustomEvent('tirada-registrada', {detail: {origen: t.origen, r: t.r}}));
}
function bnInvAca(b){
  // Tanda 6: el Ver de una habilidad de la invocación, adentro del recuadro (no cambia nada: lo ve cualquiera que la abra).
  if(b.dataset.verhabinv){
    const [invId, habId] = b.dataset.verhabinv.split(':');
    const cruda = (bn.S.invocaciones || []).find(x => x && x.id === invId), h = cruda && (cruda.habilidades || []).find(x => x && x.id === habId);
    if(!h) return true;
    const v = InvLupa.verHab(InvCalculo.migrar(structuredClone(cruda)), h);
    bn.raiz.querySelector('#bn-verinv-titulo').textContent = v.titulo;
    bn.raiz.querySelector('#bn-verinv-cuerpo').innerHTML = v.html;
    bn.raiz.querySelector('#bn-verinv').classList.add('open');
    return true;
  }
  const d = b.dataset, ref = d.invtirarstat || d.invatacar || d.invdanio || d.ejecutarhabinv || d.danohabinv;
  if(!ref || !bnPuedeGuardar()) return false;
  const inv = (bn.S.invocaciones || []).find(x => x && x.id === ref.split(':')[0]);
  if(!inv){ toast('Esa invocación ya no está'); return true; }
  InvCalculo.migrar(inv);   // como la ficha al dibujarla (una vieja puede no tener todos los campos)
  if(!bn.invParry) bn.invParry = new Set();
  if(d.invtirarstat){
    const ui = bnUi(FichaGuardado.partes(bn.S));
    const p = InvAcciones.tirarStat(inv, d.invtirarstat.split(':')[1], {parryPendiente: bn.invParry.has(inv.id)});
    if(p.error){ toast(p.error); return true; }
    if(p.parry === 'sacar') bn.invParry.delete(inv.id);
    if(p.parry === 'poner') bn.invParry.add(inv.id);
    if(p.cambio) ui.cambio(); else if(p.parry) bnDibujar();
    if(p.aviso) toast(p.aviso);
    bnPublicarInv(inv, p.tirada);
    return true;
  }
  // Tanda 5: las habilidades (Ejecutar / Anunciar y la 🎲 segunda tirada), con comun/inv-habilidades.js.
  if(d.danohabinv || d.ejecutarhabinv){
    const h = (inv.habilidades || []).find(x => x && x.id === (d.danohabinv || d.ejecutarhabinv).split(':')[1]);
    if(!h) return true;
    if(d.danohabinv){ bnPublicarInv(inv, InvHabilidades.tiradaSegunda(inv, h)); return true; }
    const ui = bnInvHabUi();   // antes de cobrar: así guarda solo lo que cambió
    const p = InvHabilidades.ejecutar(inv, h, estadosPresetFicha(), ui.dueloDisponible());
    if(p.modo === 'manual'){ ui.mesaHabilidad(inv, h.nombre, h.detalle || h.efectoDetalle || ''); toast(`${h.nombre || 'Habilidad'} anunciada`); return true; }
    if(p.modo === 'flash'){ InvHabilidades.usarFlashFuera(inv, h, ui); return true; }
    if(p.error){ toast(p.error); return true; }
    InvHabilidades.terminar(inv, h, p, ui);
    return true;
  }
  if(d.invdanio){
    const t = InvAcciones.dano(inv);
    if(!t) return true;
    bnPublicarInv(inv, t);
    // Los efectos al golpear de su arma: recordar y tirar, no aplicar (como la ficha).
    if((inv.armaEfectos || []).length) EfectosGolpe.alPegar({arma: inv.armaNombre || 'el arma', efectos: inv.armaEfectos, publicar: linea => {
      if(!fbDb || !fbUsuario || !fbMiembro) return;
      fbDb.collection(fbRutaCampana('tiradas')).add({
        uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: inv.nombre,
        origen: linea.origen.slice(0, 120), formula: linea.formula.slice(0, 900),
        rolls: linea.rolls.slice(0, 100), mod: 0, total: 0, desde: 'efecto',
        cuando: firebase.firestore.FieldValue.serverTimestamp(),
      }).catch(err => console.error('No se pudieron publicar los efectos en la Mesa:', err));
    }});
    return true;
  }
  bnInvAtacar(inv.id);
  return true;
}
// Lo que el mapa hace después de ejecutar una habilidad de la invocación (comun/inv-habilidades.js): como la ficha, publica a su
// nombre, guarda la parte `invocaciones` y el duelo va a nombre de `fichaId~invId`.
function bnInvHabUi(){
  const u = bnUi(FichaGuardado.partes(bn.S));
  const ui = {
    mesaHabilidad: (inv, nombre, detalle) => {
      if(!fbDb || !fbUsuario || !fbMiembro) return;
      fbDb.collection(fbRutaCampana('tiradas')).add({
        uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: inv.nombre,
        origen: String(nombre || 'Habilidad').slice(0, 80), formula: String(detalle || '').slice(0, 300),
        rolls: [], mod: 0, total: 0, desde: 'habilidad', cuando: firebase.firestore.FieldValue.serverTimestamp(),
      }).catch(err => console.error('No se pudo publicar la habilidad de la invocación en la Mesa:', err));
    },
    mesaConTexto: t => mesaConTexto(t),
    publicar: t => { if(!t) return; if(t.error){ toast(t.error); return; } bnRegistrarInv(t.origen, t.r); },
    toast: t => toast(t),
    cambio: () => u.cambio(),
    cambiar: fn => { const u2 = bnUi(FichaGuardado.partes(bn.S)); if(fn() !== false) u2.cambio(); },
    parry: bn.invParry || (bn.invParry = new Set()),
    dueloDisponible: () => !!(typeof Duelo !== 'undefined' && Duelo.disponible()),
    elegirObjetivo: (inv, cfg) => {
      const reabrir = () => { if(bn){ bn.host.hidden = false; bnUbicar(); bnDibujar(); } };
      bn.host.hidden = true;
      dueloElegirObjetivoMapa({yo: {ref: bn.fichaId + SEP_INVOCACION + inv.id, tipo: 'pj', nombre: inv.nombre}, ataque: cfg.ataque,
        conSuelto: true, alSuelto: () => { reabrir(); cfg.suelto(); }, alCancelar: () => {}});
    },
    // 4f (P134): zona persistente y trampa, directo (como el personaje de la Botonera nueva, bnAlMapa).
    enMapa: () => true,
    ref: inv => bn.fichaId + SEP_INVOCACION + inv.id,
    colocarZona: msg => { bnAlMapa(msg.tipo, msg); return true; },
    colocarTrampa: (inv, h) => FichaAcciones.colocarTrampaDeHab(bn.S, h, {yo: () => ({ref: bn.fichaId + SEP_INVOCACION + inv.id}), enMapa: () => true, valorStat: st => InvCalculo.statValor(inv, st),
      alMapa: (tipo, msg) => bnAlMapa(tipo, msg), mesaHabilidad: (nombre, detalle) => ui.mesaHabilidad(inv, nombre, detalle), toast: t => toast(t)}),
  };
  return ui;
}
// Atacar con la invocación: el objetivo con un clic en el token (dueloElegirObjetivoMapa, a su nombre: `fichaId~invId`) y el
// duelo; "Sin objetivo" (o sin duelo) cobra y tira el PdG acá.
function bnInvAtacar(invId){
  const buscar = () => (bn && bn.S && (bn.S.invocaciones || []).find(x => x && x.id === invId)) || null;
  const hacer = () => {
    const inv = buscar();
    if(!inv) return;
    const ui = bnUi(FichaGuardado.partes(bn.S));
    const p = InvAcciones.pagarAtaque(inv);
    if(p.error){ toast(p.error); return; }
    if(bn.invParry) bn.invParry.delete(inv.id);   // atacar cierra el Parry que esperaba su Bloqueo
    ui.cambio();
    bnPublicarInv(inv, InvAcciones.tiradaAtaque(inv));
    toast(p.aviso);
  };
  const inv = buscar();
  if(!inv) return;
  if(typeof Duelo === 'undefined' || !Duelo.disponible()){ hacer(); return; }
  const reabrir = () => { if(bn){ bn.host.hidden = false; bnUbicar(); bnDibujar(); } };
  bn.host.hidden = true;
  dueloElegirObjetivoMapa({yo: {ref: bn.fichaId + SEP_INVOCACION + inv.id, tipo: 'pj', nombre: inv.nombre}, ataque: InvAcciones.ataqueDuelo(inv),
    conSuelto: true, alSuelto: () => { reabrir(); hacer(); }, alCancelar: () => {}});
}
// Un botón de la Botonera nueva: se lo pide a la ficha escondida en el marco (la carga si hace falta).
function bnDelegar(datos){ bnAlMarco({tipo: 'botonera-delegar', datos, ...(bn.invId ? {inv: bn.invId} : {})}); }
function bnAlMarco(msg){
  const marco = $('#botonera-marco');
  if(botonera.herramienta === 'ficha' && botonera.fichaId === bn.fichaId && !botonera.invId){
    if(botonera.lista) MensajesMapa.alMarco(marco, msg); else botonera.pendiente = msg;
    return;
  }
  botonera = {herramienta: 'ficha', fichaId: bn.fichaId, invId: '', lista: false, pendiente: msg, completa: false, precarga: true};
  marco.src = sinCache(`../ficha-personaje/ficha.html?partida=${encodeURIComponent(FB_CAMPANA)}&modo=botonera&precarga=1#${encodeURIComponent(bn.fichaId)}`);
}
// Etapa 3c: lo que el mapa ya hace él mismo, sin pedírselo a la ficha — las tiradas de stats y la Percepción (las arma
// comun/ficha-botonera.js, la misma cuenta que la ficha). Se publican a nombre del personaje y con su `ficha`, así la Moneda
// Re-Roll y la Polilla las ven (P138). Devuelve true si la hizo.
function bnTirarAca(b){
  const t = b.dataset.tirarstat ? FichaBotonera.tiradaStat(bn.S, b.dataset.tirarstat)
    : b.dataset.botoneraaccion === 'percepcion' ? FichaBotonera.tiradaPercepcion(bn.S) : null;
  if(!t) return false;
  if(t.error){ toast(t.error); return true; }
  mesaPublicar(t.origen, {...t.r, quien: ((bn.S.meta && bn.S.meta.nombre) || '').trim(), ficha: bn.fichaId});
  return true;
}
/* Etapa 3c, paso 2: botones que CAMBIAN al personaje (Sigilo, Levantarse) — los hace el mapa y guarda él (FichaSesion), con el
   mismo código que la ficha (comun/ficha-acciones.js). Solo si este usuario puede guardar ese personaje (su dueño, o el GM con
   🎮 el control); si no, se le siguen pidiendo a la ficha escondida. Se escriben solo las partes que cambió la acción (lo que
   difiera por haberlo armado distinto, no) y el resumen público (comun/ficha-resumen.js), así el token se actualiza. */
function bnPuedeGuardar(){
  const f = bn && bn.sesion;
  return !!(f && f.cargada && fbUsuario && (f.duenoUid === fbUsuario.uid || (f.control && f.control.uid === fbUsuario.uid)));
}
function bnOpcionesGuardado(f){
  // Las miniaturas de las invocaciones las calcula la ficha (tardan): se reusan las que ya están publicadas.
  const miniaturaInv = img => {
    const inv = (bn.S.invocaciones || []).find(i => i.imagen === img);
    const r = inv && (((bn.doc && bn.doc.resumen) || {}).invocaciones || []).find(x => x.id === String(inv.id));
    return (r && r.miniatura) || '';
  };
  return {
    db: fbDb, ruta: fbRutaCampana(`fichas/${f.id}`), marcaDeTiempo: () => firebase.firestore.FieldValue.serverTimestamp(),
    partes: () => FichaGuardado.partes(bn.S),
    resumen: () => FichaResumen.resumen(bn.S, {control: f.control, miniaturaInv}),
    nombre: () => String((bn.S.meta && bn.S.meta.nombre) || '').trim().slice(0, 60) || 'Sin nombre',
    miniatura: async () => (bn.doc && bn.doc.miniatura) || '',
    vigente: () => !!bn && bn.sesion === f,
    alError: (err, primeraVez) => { if(primeraVez) toast('No se pudo guardar el personaje: se reintenta solo'); },
  };
}
// La interfaz que le da el mapa a FichaAcciones. `antes`: las partes antes de la acción, para escribir solo lo que tocó.
function bnUi(antes){
  const f = bn.sesion;
  return {
    presets: estadosPresetFicha(),
    toast: t => toast(t),
    avisarSinNitros: (costo, accion, continuar) => bnSinNitros(costo, accion, continuar),
    cambio: () => {
      bnRevisarVida();
      const despues = FichaGuardado.partes(bn.S);
      Object.keys(despues).forEach(p => { if(despues[p] === antes[p] && despues[p] !== f.ultimo[p]) f.ultimo[p] = despues[p]; });
      f.soloLectura = !bnPuedeGuardar();
      FichaSesion.guardar(f, true, bnOpcionesGuardado(f));
      bnDibujar();
    },
  };
}
// Lo que la ficha revisa cada vez que redibuja la vida (renderVitals): el Ankh del cinturón con HP 0 y el estado de muerte. El
// mapa lo muestra solo, leyendo el resumen (actualizarMuerteMapa).
function bnRevisarVida(){
  const ankh = FichaAcciones.revisarAnkh(bn.S);
  if(ankh) toast(`¡${ankh} se activó solo! Revivís con ${fmt(bn.S.hp)} HP.`);
  FichaAcciones.revisarMuerte(bn.S);
}
// Una tirada del personaje armada acá, a la Mesa a su nombre y con su `ficha` (P138). Como registrarTirada de la ficha, avisa
// 'tirada-registrada': de ahí el duelo (comun/duelo.js) recoge la tirada que le pidió a este personaje (paso 4c).
function bnPublicar(origen, r){
  mesaPublicar(origen, {...r, quien: ((bn.S.meta && bn.S.meta.nombre) || '').trim(), ficha: bn.fichaId});
  window.dispatchEvent(new CustomEvent('tirada-registrada', {detail: {origen, r}}));
}
/* Paso 3c-4c: lo que el duelo le pide al personaje de la Botonera nueva (su PdG, su defensa, su daño, la Fuerza del golpe, el
   Bloqueo, el crítico, el Flash, la Moneda Re-Roll, una habilidad dirigida, con qué arma contraataca) lo contesta el mapa con
   los mismos ganchos de la ficha (comun/ficha-duelo.js), sin pasar por el marco — solo si este usuario puede guardar ese
   personaje. Sus invocaciones, otro personaje, o el GM con el interruptor ⚗ apagado: por el marco, como siempre. */
function bnHooksDuelo(lado){
  if(!bn || !bn.S || !lado || lado.tipo !== 'pj' || lado.ref !== bn.fichaId || typeof FichaDuelo === 'undefined') return null;
  if(!bnActiva() || !bnPuedeGuardar()) return null;
  const ui = {...bnCombateUi(),
    soy: l => !!(l && l.tipo === 'pj' && l.ref === bn.fichaId),
    reabrir: (id, campo) => Duelo.reabrir(id, campo),
    fijarHp: v => { FichaAcciones.fijarHp(bn.S, v); bnRevisarVida(); },
  };
  return FichaDuelo.hooks(() => bn.S, ui);
}
/* Paso 4, etapa 4e (tanda 4): lo que el duelo le pide a una INVOCACIÓN del personaje de la Botonera nueva (lado «fichaId~invId»):
   lo contesta el mapa con comun/inv-duelo.js (los mismos ganchos de la ficha), si puede guardar al personaje y con ⚗ prendido.
   Publica como la ficha (a nombre de la invocación si la tirada empieza con su nombre) y guarda la parte `invocaciones`. */
function bnRegistrarInv(origen, r){
  const inv = (bn.S.invocaciones || []).find(i => i && i.nombre && String(origen || '').startsWith(i.nombre + ' · '));
  mesaPublicar(origen, {...r, quien: inv ? inv.nombre : ((bn.S.meta && bn.S.meta.nombre) || '').trim(), ficha: bn.fichaId});
  window.dispatchEvent(new CustomEvent('tirada-registrada', {detail: {origen, r}}));
}
function bnInvDeLado(lado){
  if(!bn || !bn.S || !lado || lado.tipo !== 'pj') return null;
  const [f, invId] = String(lado.ref || '').split(SEP_INVOCACION);
  if(!invId || f !== bn.fichaId) return null;
  const inv = (bn.S.invocaciones || []).find(x => x && x.id === invId) || null;
  if(inv) InvCalculo.migrar(inv);   // como la ficha (una vieja puede no tener todos los campos)
  return inv;
}
function bnHooksDueloInv(lado){
  if(typeof InvDuelo === 'undefined' || !bnInvDeLado(lado)) return null;
  if(!bnActiva() || !bnPuedeGuardar()) return null;
  if(!bn.invParry) bn.invParry = new Set();
  return InvDuelo.hooks({
    inv: l => bnInvDeLado(l),
    registrar: (origen, r) => bnRegistrarInv(origen, r),
    toast: t => toast(t),
    cambiar: fn => { const u = bnUi(FichaGuardado.partes(bn.S)); if(fn() !== false) u.cambio(); },
    parry: bn.invParry,
    soy: l => !!bnInvDeLado(l),
  });
}
const BN_ACCIONES = {
  sigilo: (S, ui) => FichaAcciones.alternarSigilo(S, false, ui),
  levantarse: (S, ui) => FichaAcciones.levantarse(S, false, ui),
  // Consumir: la vida, el estado que deja, sus tiradas y la trampa consumible los resuelve el mapa con las piezas comunes.
  consumir: (S, ui, id) => FichaAcciones.consumir(S, id, false, {...ui,
    fijarHp: v => FichaAcciones.fijarHp(S, v),
    efecto: it => FichaAcciones.efectoDeConsumo(S, it, ui.presets, t => toast(t)),
    tirarExtra: it => FichaAcciones.tiradasDeItem(S, it).forEach(t => { if(t.error) toast(t.error); else bnPublicar(t.origen, t.r); }),
    colocarTrampa: it => FichaAcciones.colocarTrampaDeItem(bn.fichaId, it, ui),   // la trampa consumible, junto al token
  }),
};
/* Etapa 3c, paso 4a: las tiradas de combate sueltas (Esquivar, Parry, Bloqueo, Fuerza del golpe, Daño) — comun/ficha-acciones.js.
   El Parry que espera su Bloqueo vive acá (bn.parryPendiente), como en la ficha. Atacar sigue en la ficha (paso 4b). */
function bnCombateUi(){
  const base = bnUi(FichaGuardado.partes(bn.S));
  return {...base,
    registrarTirada: (origen, r) => bnPublicar(origen, r),
    preguntarSobrepeso: p => {
      bnSobrepeso = p;
      bn.raiz.querySelector('#bn-sobre-texto').innerHTML = `Tu equipo pesa <b>${fmt(p.sobre)}</b> de más. ¿Pagás <b>1 No2</b> para tirar la evasión sin penalidad, o tirás con <b>−${fmt(p.sobre)}</b>? (tenés ${fmt(Math.max(0, num(bn.S.nitros)))} No2)`;
      bn.raiz.querySelector('[data-bn-sobre="penal"]').textContent = `Tirar con −${fmt(p.sobre)}`;
      bn.raiz.querySelector('[data-bn-sobre="pagar"]').disabled = num(bn.S.nitros) < 1;
      bn.raiz.querySelector('#bn-sobrepeso').classList.add('open');
    },
    getParry: () => bn.parryPendiente || null,
    setParry: id => { bn.parryPendiente = id; },
    elegirArma: (tipo, armas) => {
      const dmg = FichaCalculo.calcular(bn.S).final.dmg;
      bn.raiz.querySelector('#bn-arma-lista').innerHTML = (tipo === 'dano' ? '' : `<div class="hint">${tipo === 'parry' ? 'Parry: siempre cuesta 1 No2, sea cual sea el arma o escudo que elijas.' : tipo === 'fuerza' ? 'Fuerza del golpe: tu Fuerza + el peso del arma que elijas; esa suma es el dado (contra el Bloqueo del defensor).' : 'Bloqueo: tu Bloqueo + el peso del arma o escudo que elijas; esa suma es el dado que tirás. (Después de un Parry se usa el mismo, solo.)'}</div>`) +
        armas.map(a => `<button class="btn" data-bn-arma="${tipo}:${a.item.id}" style="width:100%">${a.mano ? `Mano ${a.mano}: ` : ''}${esc(a.item.nombre)} — ${tipo === 'dano' ? esc(FichaCombate.armaDanoTxt(a.item, dmg)) : tipo === 'parry' ? `${fmt(Combatiente.costoParry())} No2` : `+${fmt(num(a.item.peso))} de peso`}</button>`).join('');
      bn.raiz.querySelector('#bn-elegir-arma').classList.add('open');
    },
    // Los efectos al golpear del arma (comun/efectos-golpe.js): recordar y tirar, no aplicar — igual que la ficha.
    efectosAlPegar: it => EfectosGolpe.alPegar({arma: it.nombre, efectos: it.efectosGolpe, publicar: linea => {
      if(!fbDb || !fbUsuario || !fbMiembro) return;
      fbDb.collection(fbRutaCampana('tiradas')).add({
        uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: ((bn.S.meta && bn.S.meta.nombre) || '').trim(),
        origen: linea.origen.slice(0, 120), formula: linea.formula.slice(0, 900),
        rolls: linea.rolls.slice(0, 100), mod: 0, total: 0, desde: 'efecto',
        cuando: firebase.firestore.FieldValue.serverTimestamp(),
      }).catch(err => console.error('No se pudieron publicar los efectos en la Mesa:', err));
    }}),
  };
}
var bnSobrepeso = null;
/* Paso 3c-4b: Atacar. El cartel "¿Qué ataque es?" (normal / oportunidad / contraataque, con lo que cuesta cada uno, igual que la
   ficha), después el objetivo con un clic en el token (dueloElegirObjetivoMapa, el mismo de siempre) y el duelo; "Sin objetivo"
   hace el ataque suelto acá (FichaAcciones.atacarConArma / ataqueEspecialConArma). Las tiradas que pide el duelo las sigue
   haciendo la ficha escondida (paso 4c). */
function bnPreguntarTipoAtaque(arma){
  const S = bn.S, costoNormal = FichaCombate.costoAtaque(S, arma), primero = FichaCombate.ataquesConArma(S, arma) === 0, especial = FichaCombate.costoAtaqueEspecial(arma);
  const id = arma ? arma.id : '';
  bn.raiz.querySelector('#bn-tipo-lista').innerHTML = `<div class="hint">${arma ? esc(arma.nombre) : 'Sin arma'}</div>
    <button class="btn" data-bn-tipo="normal:${id}" style="width:100%">⚔ Ataque normal — ${fmt(costoNormal)} No2<br><span class="hint">${primero ? 'primer ataque con esta arma (Tipo ÷ 2)' : 'Tipo completo (ya atacaste con esta arma este turno)'}</span></button>
    <button class="btn" data-bn-tipo="oportunidad:${id}" style="width:100%">🏃 Ataque de oportunidad — ${fmt(especial)} No2<br><span class="hint">siempre Tipo ÷ 2; no suma al conteo de ataques</span></button>
    <button class="btn" data-bn-tipo="contra:${id}" style="width:100%">↩ Contraataque — ${fmt(especial)} No2<br><span class="hint">solo tras ganar un Parry y un Bloqueo; siempre Tipo ÷ 2; no suma al conteo de ataques</span></button>`;
  bn.raiz.querySelector('#bn-tipo-ataque').classList.add('open');
}
function bnAtacar(tipo, armaId){
  const S = bn.S, arma = S.inventario.find(x => x.id === armaId) || null;
  const hacer = () => { const ui = bnCombateUi(); if(tipo === 'normal') FichaAcciones.atacarConArma(S, arma, false, ui); else FichaAcciones.ataqueEspecialConArma(S, arma, tipo, false, ui); };
  if(typeof Duelo === 'undefined' || !Duelo.disponible()){ hacer(); return; }
  // Mientras se elige el objetivo la Botonera nueva se esconde (tapa el mapa); "Sin objetivo" la vuelve a mostrar.
  const reabrir = () => { if(bn){ bn.host.hidden = false; bnUbicar(); bnDibujar(); } };
  bn.host.hidden = true;
  dueloElegirObjetivoMapa({yo: {ref: bn.fichaId, tipo: 'pj', nombre: (S.meta && S.meta.nombre) || 'Personaje'},
    ataque: {tipo, armaId: arma ? arma.id : '', armaNombre: arma ? arma.nombre : '', tipoDado: FichaCombate.tipoAtaque(arma), rango: !!(arma && arma.armaDeRango), alcance: FichaCombate.alcanceDeArma(S, arma)},
    conSuelto: true, alSuelto: () => { reabrir(); hacer(); }, alCancelar: () => {}});
}
function bnCombateAca(b){
  const a = b.dataset.botoneraaccion;
  if(!['esquivar', 'parry', 'bloqueo', 'fuerzagolpe', 'danio', 'atacar'].includes(a) || !bnPuedeGuardar()) return false;
  const S = bn.S, ui = bnCombateUi();
  if(a === 'atacar'){
    if(b.dataset.arma === undefined) return false;   // (la Botonera siempre lo trae con su arma; si no, que lo haga la ficha)
    bnPreguntarTipoAtaque(S.inventario.find(x => x.id === b.dataset.arma) || null);
  }
  else if(a === 'esquivar') FichaAcciones.tirarValorStat(S, 'Evasión', FichaCalculo.calcular(S).final.eva, 'eva', undefined, undefined, undefined, ui);
  else if(a === 'danio'){
    if(b.dataset.arma === undefined) FichaAcciones.pedirArmaYTirar(S, ui);
    else { const arma = S.inventario.find(x => x.id === b.dataset.arma); if(arma) FichaAcciones.tirarDanoDeArma(S, arma, ui); }
  }
  else FichaAcciones.elegirArmaDefensa(S, a === 'fuerzagolpe' ? 'fuerza' : a, ui);
  return true;
}
/* Pasos 3c-5a, 5b y 5c: las habilidades. El mapa hace él mismo todas — 📣 manuales (Anunciar), 💰 semiautomáticas, ✨
   automáticas (ataque con arreglos, habilidad dirigida con su duelo, «solo sobre vos»), ⚡ Flash fuera del duelo, costo X, 🎲
   segunda tirada y las que colocan algo en el mapa (trampa, zona persistente, zona de habilidad, portal: bnAlMapa) — con el mismo
   código que la ficha (comun/ficha-acciones.js). */
function bnHabAca(it){ return !!it; }
// Lo que la ficha le manda al mapa al ejecutar una habilidad, acá se llama directo. Los que piden un clic en el mapa esconden la
// Botonera nueva (como al elegir el objetivo de un ataque).
function bnAlMapa(tipo, msg){
  if(tipo !== 'zona-habilidad' && bn) bn.host.hidden = true;
  if(tipo === 'zona-habilidad') zonaDeHabilidad(msg);
  else if(tipo === 'portal-habilidad') portalDeHabilidad(msg);
  else if(tipo === 'zona-persistente-habilidad') zonaPersistenteDeHabilidad(msg);
  else if(tipo === 'trampa-habilidad') trampaDeHabilidad(msg);
  else console.warn('bnAlMapa: aviso desconocido', tipo);
}
// Líneas de recordatorio en la Mesa a nombre del personaje (como publicarRecordatorios de la ficha): durabilidad, etc.
function bnRecordatorios(avisos){
  if(!fbDb || !fbUsuario || !fbMiembro) return;
  avisos.slice(0, 5).forEach(e => {
    fbDb.collection(fbRutaCampana('tiradas')).add({
      uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: ((bn.S.meta && bn.S.meta.nombre) || '').trim(),
      origen: String(e.nombre || 'Estado').slice(0, 80), formula: String(e.detalle || '').slice(0, 240),
      rolls: [], mod: 0, total: 0, desde: 'recordatorio',
      cuando: firebase.firestore.FieldValue.serverTimestamp(),
    }).catch(err => console.error('No se pudo publicar el recordatorio:', err));
  });
}
// Elegir el objetivo de una habilidad (o de un ataque con arreglos) desde la Botonera nueva: como Atacar (paso 4b), con
// dueloElegirObjetivoMapa; "Sin objetivo" vuelve a mostrar la Botonera y tira suelto acá.
function bnElegirObjetivo(cfg){
  const reabrir = () => { if(bn){ bn.host.hidden = false; bnUbicar(); bnDibujar(); } };
  bn.host.hidden = true;
  dueloElegirObjetivoMapa({yo: cfg.yo, ataque: cfg.ataque, conSuelto: !!cfg.suelto, alSuelto: () => { reabrir(); if(cfg.suelto) cfg.suelto(); }, alCancelar: () => {}});
}
// La línea de una habilidad en la Mesa, a nombre del personaje (como mesaPublicarHabilidad de la ficha).
function bnMesaHabilidad(nombre, detalle){
  if(!fbDb || !fbUsuario || !fbMiembro) return;
  fbDb.collection(fbRutaCampana('tiradas')).add({
    uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: ((bn.S.meta && bn.S.meta.nombre) || '').trim(),
    origen: String(nombre || 'Habilidad').slice(0, 80),
    formula: String(detalle || '').slice(0, 300),
    rolls: [], mod: 0, total: 0, desde: 'habilidad',
    cuando: firebase.firestore.FieldValue.serverTimestamp(),
  }).catch(err => console.error('No se pudo publicar la habilidad en la Mesa:', err));
}
var bnCostoX = null;   // {id, arma} de la habilidad cuyo costo X se está eligiendo
function bnHabUi(){
  const base = bnCombateUi();
  const ui = {...base,
    mesaHabilidad: (nombre, detalle) => bnMesaHabilidad(nombre, detalle),
    fijarHp: v => FichaAcciones.fijarHp(bn.S, v),   // el Ankh y la muerte los revisa ui.cambio (bnRevisarVida)
    efecto: it => FichaAcciones.efectoDeConsumo(bn.S, it, base.presets, t => toast(t)),
    enMapa: () => true,
    alMapa: (tipo, m) => bnAlMapa(tipo, m),
    colocarTrampa: it => FichaAcciones.colocarTrampaDeHab(bn.S, it, ui),
    avisarZona: it => FichaAcciones.avisarZonaAlMapa(bn.S, it, ui),
    colocarZona: (it, xSp, xNitros) => FichaAcciones.colocarZonaDeHab(bn.S, it, xSp, xNitros, ui),
    terminar: (it, arma, xSp, xNitros) => FichaAcciones.terminarEjecucionHab(bn.S, it, arma, xSp, xNitros, ui),
    recordatorios: avisos => bnRecordatorios(avisos),
    yo: () => ({ref: bn.fichaId, tipo: 'pj', nombre: (bn.S.meta && bn.S.meta.nombre) || 'Personaje'}),
    dueloDisponible: () => !!(typeof Duelo !== 'undefined' && Duelo.disponible() && bnPuedeGuardar()),
    puedeEscribir: () => bnPuedeGuardar(),
    elegirObjetivo: cfg => bnElegirObjetivo(cfg),
    flashFuera: it => FichaDuelo.usarFlashFueraDelDuelo(bn.S, it, ui),
    elegirArmaHab: (it, opciones) => {
      bn.raiz.querySelector('#bn-arma-lista').innerHTML = `<div class="hint">${esc(it.nombre)}: cuesta lo mismo que un ataque con el arma que elijas, y cuenta como ese ataque.</div>` +
        opciones.map(o => `<button class="btn" data-bn-habarma="${esc(it.id)}:${esc(o.arma.id)}" style="width:100%">${o.mano ? `Mano ${o.mano}: ` : ''}${esc(o.arma.nombre)} — ${fmt(FichaCombate.costoAtaque(bn.S, o.arma))} No2${FichaCombate.ataquesConArma(bn.S, o.arma) ? '' : ' (primer ataque)'}${FichaCombate.costoAtaque(bn.S, o.arma) > num(bn.S.nitros) ? ' · no te alcanza' : ''}</button>`).join('');
      bn.raiz.querySelector('#bn-elegir-arma').classList.add('open');
    },
    pedirCostoX: (it, armaPend) => {
      const S = bn.S, arma = armaPend === undefined ? null : armaPend, r = bn.raiz;
      bnCostoX = {id: it.id, arma};
      r.querySelector('#bn-cx-nombre').textContent = it.nombre + (FichaHabilidades.nitrosAtaque(it) ? ` · con ${arma ? arma.nombre : 'sin arma'}` : '');
      // Lo que es X se elige; lo fijo se muestra y no se puede cambiar.
      const campoSp = r.querySelector('#bn-cx-sp'), campoNitros = r.querySelector('#bn-cx-nitros');
      campoSp.value = FichaHabilidades.spVariable(it) ? 0 : FichaHabilidades.parseCostoSp(it.costo);
      campoSp.disabled = !FichaHabilidades.spVariable(it);
      campoNitros.value = FichaHabilidades.nitrosVariable(it) ? Math.min(num(S.nitros), 1) : FichaBotonera.costoNitrosHab(S, it, arma);
      campoNitros.disabled = !FichaHabilidades.nitrosVariable(it);
      r.querySelector('#bn-cx-disp').textContent = `${fmt(num(S.nitros))} No2 y ${fmt(FichaBotonera.spMaximo(S) - num(S.spGastado))} SP`;
      const limN = FichaAcciones.limiteCostoX(S, 'nitros'), limS = FichaAcciones.limiteCostoX(S, 'sp');
      r.querySelector('#bn-cx-limite').textContent = (limN === null || limS === null) ? '⚠ Tope de X sin definir: por ahora solo te frena lo que tengas.' : '';
      r.querySelector('#bn-costox').classList.add('open');
      if(FichaHabilidades.nitrosVariable(it) && !FichaHabilidades.spVariable(it)) setTimeout(() => campoNitros.select(), 50);
    },
    cerrarCostoX: () => { bnCostoX = null; bn.raiz.querySelector('#bn-costox').classList.remove('open'); },
  };
  return ui;
}
function bnAccionAca(b){
  if(bnCombateAca(b)) return true;
  if(b.dataset.danohab){ FichaAcciones.tirarSegundaDeHab(bn.S, b.dataset.danohab, bnHabUi()); return true; }
  if(b.dataset.ejecutar){
    const it = (bn.S.habilidades || []).find(h => h.id === b.dataset.ejecutar);
    if(!bnHabAca(it) || !bnPuedeGuardar()) return false;
    FichaAcciones.ejecutarHabilidad(bn.S, it.id, undefined, false, bnHabUi());
    return true;
  }
  // Paso 3c-7: tirar un talento (no cambia al personaje: como las tiradas de stats, a su nombre en la Mesa).
  if(b.dataset.tirarsocial){
    const i = (bn.S.sociales || []).find(x => x.id === b.dataset.tirarsocial);
    if(i) FichaAcciones.tirarSocial(bn.S, i, {toast: t => toast(t), registrarTirada: (origen, r) => bnPublicar(origen, r)});
    return true;
  }
  // Paso 3c-7: el Ankh usado a mano (uno de la mochila): revive con el 25 % del HP máximo.
  if(b.dataset.consumirankh){
    if(!bnPuedeGuardar()) return false;
    const [key, id] = b.dataset.consumirankh.split(':');
    const ui = bnUi(FichaGuardado.partes(bn.S));
    const nombre = FichaAcciones.ankhAMano(bn.S, key, id);
    if(!nombre) return true;
    ui.cambio();
    toast(`${nombre} activado a mano. Revivís con ${fmt(bn.S.hp)} HP.`);
    return true;
  }
  const accion = b.dataset.sigilo ? 'sigilo' : b.dataset.levantarse ? 'levantarse' : b.dataset.consume ? 'consumir' : '';
  if(!accion || !bnPuedeGuardar()) return false;
  BN_ACCIONES[accion](bn.S, bnUi(FichaGuardado.partes(bn.S)), b.dataset.consume);
  return true;
}
/* Paso 3c-6: la 🔍 y el "Ver". La 🔍 la arma comun/ficha-lupa.js (la misma de la ficha) y la abre comun/lupa.js, que pide el
   contenido con lupaContenido (acá, solo para el personaje de la Botonera nueva). El "Ver" se muestra adentro del recuadro;
   Eliminar lo hace el mapa (si puede guardar al personaje) y Editar abre el editor de la ficha escondida ('editar-en-ficha'). */
function lupaContenido(clave){
  // La de una invocación de la Botonera nueva ("inv:invId:tipo:ref"): comun/inv-lupa.js, sobre una copia migrada (4e, tanda 6).
  if(String(clave).startsWith('inv:')){
    const cruda = bn && bn.S ? (bn.S.invocaciones || []).find(x => x && x.id === String(clave).split(':')[1]) : null;
    return InvLupa.contenido(cruda ? InvCalculo.migrar(structuredClone(cruda)) : null, clave);
  }
  // La de un creep (Acciones nuevas, "creepId|tipo|ref"): comun/creep-lupa.js, con su parte privada (paso 4c, tanda 6).
  if(String(clave).includes('|') && typeof CreepLupa !== 'undefined'){
    const id = String(clave).split('|')[0], crudo = creepPrivadoDe(id);
    if(!crudo) return {titulo: '', html: ''};
    return CreepLupa.contenido(Object.assign(CreepCalculo.normalizar(structuredClone(crudo)), {id}), clave);
  }
  return bn && bn.S ? FichaLupa.contenido(bn.S, clave) : {titulo: '', html: ''};
}
var bnViendo = null;   // {key, id} de lo que muestra el Ver
function bnVer(key, id){
  const it = ((bn.S && bn.S[key]) || []).find(x => x.id === id);
  if(!it) return;
  bnViendo = {key, id};
  const v = FichaLupa.ver(bn.S, key, it), r = bn.raiz, puede = bnPuedeGuardar();
  r.querySelector('#bn-ver-titulo').textContent = v.titulo;
  r.querySelector('#bn-ver-cuerpo').innerHTML = v.html;
  // Como la ficha: un ítem de un personaje que no podés guardar se edita como copia para subir ("Editar y subir"), sin Eliminar.
  const ajeno = !puede && (key === 'inventario' || key === 'cinturon');
  const editar = r.querySelector('[data-bn-ver="editar"]');
  editar.textContent = ajeno ? '✎ Editar y subir' : 'Editar';
  editar.title = ajeno ? 'Editá una copia y subila al catálogo compartido (no cambia este ítem)' : '';
  r.querySelector('[data-bn-ver="borrar"]').style.display = puede ? '' : 'none';
  r.querySelector('#bn-ver').classList.add('open');
}
function bnVerAccion(accion){
  const r = bn.raiz, v = bnViendo;
  r.querySelector('#bn-ver').classList.remove('open');
  bnViendo = null;
  if(!v || accion === 'no') return;
  if(accion === 'editar'){
    if(!(botonera.herramienta === 'ficha' && botonera.fichaId === bn.fichaId && !botonera.invId && botonera.lista)) toast('Abriendo el editor de la ficha…');
    bnAlMarco({tipo: 'editar-en-ficha', key: v.key, id: v.id});
    return;
  }
  if(accion === 'borrar' && bnPuedeGuardar()){
    const it = (bn.S[v.key] || []).find(x => x.id === v.id);
    if(!it || !confirm(`¿Borrar "${it.nombre || 'esto'}"?`)) return;
    const ui = bnUi(FichaGuardado.partes(bn.S));
    bn.S[v.key] = bn.S[v.key].filter(x => x.id !== v.id);
    ui.cambio();
    toast(`${it.nombre || 'Ítem'} eliminado`);
  }
}
// El cartel de "No te alcanzan los Nitros" (el mismo de la ficha), adentro del recuadro.
let bnSinNitrosSeguir = null;
function bnSinNitros(costo, accion, continuar){
  bnSinNitrosSeguir = continuar;
  bn.raiz.querySelector('#bn-sn-texto').innerHTML = `No podés <b>${esc(accion)}</b>: cuesta <b>${fmt(costo)} No2</b> y tenés <b>${fmt(Math.max(0, num(bn.S.nitros)))}</b>.`;
  bn.raiz.querySelector('#bn-sin-nitros').classList.add('open');
}
function bnCerrarSinNitros(){ bnSinNitrosSeguir = null; if(bn) bn.raiz.querySelector('#bn-sin-nitros').classList.remove('open'); }
function bnCrear(){
  const host = document.createElement('div');
  host.id = 'botonera-nueva';
  host.hidden = true;
  document.body.appendChild(host);
  const raiz = host.attachShadow({mode: 'open'});
  raiz.innerHTML = `<style id="bn-css"></style><div id="bn-contenido"></div>
    <div class="scrim" id="bn-sin-nitros"><div class="modal" style="max-width:440px">
      <header><h3>No te alcanzan los Nitros</h3><button class="iconbtn" data-bn-sn="no">Cancelar</button></header>
      <div class="body"><p id="bn-sn-texto" style="margin:0 0 8px"></p>
        <p class="hint" style="margin:0">Si la hacés igual, se anota en rojo en la Mesa que se realizó sin Nitros suficientes, y los Nitros que tengas se gastan hasta llegar a 0.</p></div>
      <footer><button class="btn" data-bn-sn="no">Cancelar</button><button class="btn primary" data-bn-sn="si">Realizar de cualquier modo</button></footer>
    </div></div>
    <div class="scrim" id="bn-sobrepeso"><div class="modal" style="max-width:440px">
      <header><h3>Tenés sobrepeso</h3><button class="iconbtn" data-bn-sobre="no">Cancelar</button></header>
      <div class="body"><p id="bn-sobre-texto" style="margin:0 0 8px"></p>
        <p class="hint" style="margin:0">Regla en prueba: por cada punto de sobrepeso restás 1 a la Evasión, salvo que pagues 1 No2 para evitar la penalidad en esta tirada.</p></div>
      <footer style="flex-wrap:wrap;gap:8px"><button class="btn" data-bn-sobre="penal"></button><button class="btn primary" data-bn-sobre="pagar">Pagar 1 No2 y tirar sin penalidad</button></footer>
    </div></div>
    <div class="scrim" id="bn-tipo-ataque"><div class="modal" style="max-width:360px">
      <header><h3>¿Qué ataque es?</h3><button class="iconbtn" data-bn-tipo="no">Cerrar</button></header>
      <div class="body" id="bn-tipo-lista" style="display:flex;flex-direction:column;gap:9px"></div>
    </div></div>
    <div class="scrim" id="bn-costox"><div class="modal" style="max-width:380px">
      <header><h3>Costo variable</h3><button class="iconbtn" data-bn-cx="no">Cerrar</button></header>
      <div class="body" style="display:flex;flex-direction:column;gap:12px">
        <div class="hint" id="bn-cx-nombre" style="font-size:14px;color:var(--paper);font-family:'Fraunces',serif;font-weight:700"></div>
        <div class="f2">
          <div class="f"><label>SP a gastar</label><input type="number" id="bn-cx-sp" value="0" min="0"></div>
          <div class="f"><label>Nitros a gastar</label><input type="number" id="bn-cx-nitros" value="1" min="0"></div>
        </div>
        <div class="hint">Tenés <span id="bn-cx-disp"></span> disponibles ahora mismo.</div>
        <div class="hint" id="bn-cx-limite"></div>
      </div>
      <footer><button class="btn ghost" data-bn-cx="no">Cancelar</button><button class="btn primary" data-bn-cx="si">Ejecutar</button></footer>
    </div></div>
    <div class="scrim" id="bn-elegir-arma"><div class="modal" style="max-width:320px">
      <header><h3>¿Con qué arma?</h3><button class="iconbtn" data-bn-arma="no">Cerrar</button></header>
      <div class="body" id="bn-arma-lista" style="display:flex;flex-direction:column;gap:9px"></div>
    </div></div>
    <div class="scrim" id="bn-verinv"><div class="modal" style="max-width:420px">
      <header><h3 id="bn-verinv-titulo">Habilidad</h3><button class="iconbtn" data-bn-verinv="no">Cerrar</button></header>
      <div class="body" id="bn-verinv-cuerpo"></div>
    </div></div>
    <div class="scrim" id="bn-ver"><div class="modal view-modal">
      <header><h3 id="bn-ver-titulo">Ítem</h3><button class="iconbtn" data-bn-ver="no">Cerrar</button></header>
      <div class="body" id="bn-ver-cuerpo"></div>
      <footer style="justify-content:flex-end;gap:8px">
        <button class="btn del" data-bn-ver="borrar">Eliminar</button>
        <button class="btn primary" data-bn-ver="editar">Editar</button>
      </footer>
    </div></div>`;
  raiz.querySelector('#bn-sin-nitros').addEventListener('mousedown', e => { if(e.target.id === 'bn-sin-nitros') bnCerrarSinNitros(); });
  raiz.querySelector('#bn-costox').addEventListener('mousedown', e => { if(e.target.id === 'bn-costox'){ bnCostoX = null; e.target.classList.remove('open'); } });
  ['bn-sobrepeso', 'bn-elegir-arma', 'bn-tipo-ataque', 'bn-ver', 'bn-verinv'].forEach(id => raiz.querySelector('#' + id).addEventListener('mousedown', e => { if(e.target.id === id){ e.target.classList.remove('open'); if(id === 'bn-sobrepeso') bnSobrepeso = null; } }));
  raiz.addEventListener('click', e => {
    const b = e.target.closest('button');
    if(!b || !bn) return;
    if(b.dataset.bnSn){ const seguir = bnSinNitrosSeguir; bnCerrarSinNitros(); if(b.dataset.bnSn === 'si' && seguir) seguir(); return; }
    if(b.dataset.bnSobre){
      const p = bnSobrepeso, pagar = b.dataset.bnSobre === 'pagar';
      if(b.dataset.bnSobre === 'no' || !p){ bnSobrepeso = null; raiz.querySelector('#bn-sobrepeso').classList.remove('open'); return; }
      const ui = bnCombateUi();
      if(pagar && !FichaAcciones.sobrepesoPagar(bn.S, ui)) return;
      bnSobrepeso = null; raiz.querySelector('#bn-sobrepeso').classList.remove('open');
      FichaAcciones.tirarValorStat(bn.S, p.nombre, p.valor, 'eva', p.extra, pagar ? 'pagado' : 'penal', p.sobre, ui);
      return;
    }
    if(b.dataset.bnTipo){
      raiz.querySelector('#bn-tipo-ataque').classList.remove('open');
      if(b.dataset.bnTipo === 'no') return;
      const [tipo, armaId] = b.dataset.bnTipo.split(':');
      bnAtacar(tipo, armaId);
      return;
    }
    if(b.dataset.bnCx){
      const c = bnCostoX;
      if(b.dataset.bnCx === 'no' || !c){ bnCostoX = null; raiz.querySelector('#bn-costox').classList.remove('open'); return; }
      const it = (bn.S.habilidades || []).find(h => h.id === c.id);
      if(!it){ bnCostoX = null; raiz.querySelector('#bn-costox').classList.remove('open'); return; }
      FichaAcciones.confirmarCostoVariable(bn.S, it, num(raiz.querySelector('#bn-cx-sp').value), num(raiz.querySelector('#bn-cx-nitros').value), c.arma, bnHabUi());
      return;
    }
    if(b.dataset.bnHabarma){
      raiz.querySelector('#bn-elegir-arma').classList.remove('open');
      const [habId, armaId] = b.dataset.bnHabarma.split(':');
      FichaAcciones.ejecutarHabilidad(bn.S, habId, armaId, false, bnHabUi());
      return;
    }
    if(b.dataset.bnArma){
      raiz.querySelector('#bn-elegir-arma').classList.remove('open');
      if(b.dataset.bnArma === 'no') return;
      const [tipo, id] = b.dataset.bnArma.split(':');
      FichaAcciones.armaElegida(bn.S, tipo, bn.S.inventario.find(x => x.id === id) || null, bnCombateUi());
      return;
    }
    if(b.dataset.bnVer){ bnVerAccion(b.dataset.bnVer); return; }
    if(b.dataset.bnVerinv){ raiz.querySelector('#bn-verinv').classList.remove('open'); return; }
    if(b.dataset.view){ const [key, id] = b.dataset.view.split(':'); bnVer(key, id); return; }
    if(b.dataset.bnCerrar !== undefined){ cerrarBotoneraNueva(); return; }
    if(b.dataset.colapsar){
      const estado = bnColapsados();
      estado[b.dataset.colapsar] = !estado[b.dataset.colapsar];
      try{ localStorage.setItem('ficha-colapsados', JSON.stringify(estado)); }catch(err){}
      bnPintarColapsados();
      return;
    }
    if(!bn.S) return;
    if(bn.invId ? bnInvAca(b) : (bnTirarAca(b) || bnAccionAca(b))) return;
    const datos = {...b.dataset};
    if(!Object.keys(datos).length) return;
    bnDelegar(datos);
  });
  // Clic en el fondo: se cierra. Ojo: para un clic adentro del recuadro, e.target acá es SIEMPRE el recuadro (el navegador lo
  // "retarguetea"): se mira el primer elemento real del recorrido (antes, cualquier clic con el mouse la cerraba).
  host.addEventListener('mousedown', e => { const t = e.composedPath()[0]; if(t === host || (t && t.id === 'bn-contenido')) cerrarBotoneraNueva(); });
  return {host, raiz};
}
async function abrirBotoneraNueva(fichaId, invId){
  invId = invId || '';
  if(bn && bn.fichaId === fichaId && (bn.invId || '') === invId && !bn.host.hidden){ cerrarBotoneraNueva(); return; }   // B (o el token) otra vez: se cierra
  try{ await bnCargarPiezas(); }catch(err){ console.error(err); toast('No se pudo cargar la Botonera nueva — se abre la de siempre'); abrirBotonera(fichaId, null, invId, true); return; }
  if(!bn){ bn = Object.assign({fichaId: '', sesion: null, S: null}, bnCrear()); }
  const lupaCss = (document.getElementById('lupa-css') || {}).textContent || '';   // los 🔍 (comun/lupa.js)
  bn.raiz.querySelector('#bn-css').textContent = bnCss + lupaCss + PANEL_CSS + ' #bn-contenido{font-family:"Space Grotesk",system-ui,sans-serif;font-size:14px;line-height:1.45;color:var(--paper)}';
  if(bn.fichaId !== fichaId || !bn.sesion){
    if(bn.sesion) FichaSesion.cortar(bn.sesion);
    bn.fichaId = fichaId; bn.S = null; bn.parryPendiente = null;
    const f = FichaSesion.nueva(fichaId, '', false, true);   // guarda solo después de un botón que lo cambia (bnUi), si puede
    bn.sesion = f; bn.doc = null;
    FichaSesion.escuchar(f, {
      db: fbDb, ruta: fbRutaCampana(`fichas/${fichaId}`), vigente: () => !!bn && bn.sesion === f,
      alDoc: doc => {
        if(!doc.exists){ toast('Ese personaje ya no está en la mesa'); cerrarBotoneraNueva(); return; }
        bn.doc = doc.data();
        f.duenoUid = bn.doc.duenoUid;
      },
      alCargar: armado => {
        const S = FichaGuardado.normalizar(armado.datos, {mezclarCatalogo: bnMezclarCatalogo}).S;
        FichaGuardado.ponerImagenesInvocaciones(S, armado.imgInvocaciones);
        FichaGuardado.completar(S);
        bn.S = S;
        f.cargada = true;
        bnDibujar();
      },
      alControl: c => { f.control = c; },
      aplicarParte: (parte, datos) => FichaGuardado.aplicarParte(bn.S, parte, datos, {mezclarCatalogo: bnMezclarCatalogo, imgInvocaciones: f.ultimo.imgInvocaciones || ''}),
      alCambiar: () => { FichaGuardado.completar(bn.S); bnDibujar(); },
      alErrorPartes: () => toast('No se pudo leer el personaje para la Botonera nueva'),
    });
    // La ficha escondida ya no se carga para la Botonera nueva (P140, 2026-10-01): se carga sola recién si se toca Editar en un
    // Ver (bnAlMarco). La que precarga el mapa al entrar (precargarMarco) sigue, para lo demás que usa el marco.
  }
  bn.invId = invId;   // la Botonera de una de sus invocaciones (4e), o '' para la del personaje
  if(ac && !ac.host.hidden) cerrarAccionesNuevas();
  bn.host.hidden = false;
  bnUbicar();
  centrarTokenDeBotonera('ficha', fichaId);
  bnDibujar();
}
function cerrarBotoneraNueva(){
  if(!bn) return;
  bn.host.hidden = true;
}
// El modo del mapa (narrativo/combate) cambia el orden de los Talentos: se redibuja.
function bnModoCambio(){ if(bn && !bn.host.hidden) bnDibujar(); }
document.addEventListener('keydown', e => {
  if(!bn || bn.host.hidden || !$('#botonera-capa').hidden || elegirDestinoCb) return;
  if(e.key !== 'Escape') return;
  e.preventDefault();
  const cartel = bn.raiz.querySelector('.scrim.open');
  if(cartel){ cartel.classList.remove('open'); bnViendo = null; bnCostoX = null; bnSobrepeso = null; bnSinNitrosSeguir = null; return; }
  cerrarBotoneraNueva();
});

