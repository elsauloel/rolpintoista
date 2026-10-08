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
const BN_PIEZAS = ['../comun/tiradas-propias.js?v=20261001a', '../comun/ficha-stats.js?v=20261005ff', '../comun/ficha-equipo.js?v=20261008zs', '../comun/ficha-botin.js?v=20261008zs', '../comun/generador-tiendas.js?v=20261008zt', '../comun/filtro-catalogo.js?v=20261008zu', '../comun/ficha-tienda.js?v=20261008zt', '../comun/ficha-mantenimiento.js?v=20261008y', '../comun/ficha-calculo.js?v=20261007am', '../comun/ficha-combate.js?v=20261005mn', '../comun/skills-clase.js?v=20261008x', '../comun/ficha-habilidades.js?v=20261007ar',
  '../comun/catalogo.js?v=20261008zf', '../comun/items-subidos.js?v=20261007h', '../comun/ficha-guardado.js?v=20261007am', '../comun/ficha-sesion.js?v=20261001b', '../comun/ficha-botonera.js?v=20261008g', '../comun/ficha-resumen.js?v=20261008zk', '../comun/inv-calculo.js?v=20261003fi', '../comun/inv-botonera.js?v=20261007aw', '../comun/inv-acciones.js?v=20261007ar', '../comun/inv-duelo.js?v=20261008z', '../comun/ficha-acciones.js?v=20261008n', '../comun/inv-habilidades.js?v=20261008s', '../comun/inv-lupa.js?v=20261001a',
  '../comun/confirmar-turno.js?v=20261006e', '../comun/ficha-duelo.js?v=20261008zb', '../comun/lupa.js?v=20261008u', '../comun/ficha-lupa.js?v=20261005f6'];
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
/* Desde el 2026-10-02 (decisión del dueño: "vamos a dejar solo la botonera nueva") la Botonera nueva y las Acciones nuevas son las de
   todos: siempre prendidas y sin el interruptor ⚗. Para volver a la de antes (la ficha / GM Tools en el marco), poner BN_SIEMPRE en
   false: vuelve el interruptor y cada navegador elige como antes. */
const BN_SIEMPRE = true;
const bnActiva = () => { if(BN_SIEMPRE) return true; try{ return localStorage.getItem(BN_CLAVE) === '1'; }catch(e){ return false; } };
function bnPintarInterruptor(){
  const b = $('#btn-botonera-nueva');
  if(!b) return;
  b.hidden = BN_SIEMPRE || !fbMiembro;   // cualquiera de la partida (P140); sin interruptor desde que es la de todos
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
      .then(() => fetch('../ficha-personaje/ficha.css?v=20261008zo').then(r => r.text()))
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
  const r = FichaBotonera.html(bn.S, {modoMapa, parryArmaPendiente: bn.parryPendiente || null, ...(typeof armasOpciones === 'function' ? armasOpciones(tokenDePj(bn.fichaId)) : {})});
  const scroll = bn.host.scrollTop;
  cuerpo.innerHTML = `<div class="modal catalogo-modal botonera-modal">
    <header>
      <div style="display:flex;align-items:center;gap:10px;min-width:0;flex-wrap:wrap">
        <h3>Botonera</h3>
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
        <h3>${esc(titulo)}</h3>
        ${badge ? `<span class="botonera-badge">${esc(badge)}</span>` : ''}
        <span class="hint" style="font-size:11px">${esc((bn.S.meta && bn.S.meta.nombre) || '')}</span>
      </div>
      <div style="display:flex;gap:6px;flex:none"><button class="iconbtn" data-bn-cerrar title="Cerrar (B o Esc)">Cerrar</button></div>
    </header>`;
  if(inv.activa === false){ cuerpo.innerHTML = marco(cab(inv.nombre) + `<div class="body"><div class="hint">${esc(inv.nombre)} está dormida — tocá «Invocar» en la ficha para reactivarla.</div></div>`); return; }
  const r = InvBotonera.html(inv, {parryPendiente: !!(bn.invParry && bn.invParry.has(inv.id)), ...(typeof armasOpciones === 'function' ? armasOpciones(tokenDePj(bn.fichaId + SEP_INVOCACION + inv.id)) : {})});
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
  if(b.dataset.invlevantararma){ const [invId, elId] = b.dataset.invlevantararma.split(':'); bnInvLevantarArma(invId, elId); return true; }   // 🗡 (js/27)
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
  const d = b.dataset, ref = d.invtirarstat || d.invatacar || d.invotroataque || d.invdanio || d.ejecutarhabinv || d.danohabinv || d.invlevantarse || d.invsoltarse;
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
  // Levantarse y Soltarse (2026-10-03, comun/inv-acciones.js): las mismas reglas que el personaje y los creeps.
  if(d.invlevantarse || d.invsoltarse){
    const ui = bnUi(FichaGuardado.partes(bn.S));
    if(d.invlevantarse){
      const x = InvAcciones.levantarse(inv);
      if(!x) return true;
      if(x.error){ toast(x.error); return true; }
      ui.cambio(); toast(x.aviso); return true;
    }
    const t = InvAcciones.tiradaSoltarse(inv);
    if(!t) return true;
    if(num(inv.nitros) < t.s.no2){ toast(`${inv.nombre}: no le alcanzan los No2 — soltarse cuesta ${t.s.no2}`); return true; }
    bnPublicarInv(inv, {origen: t.origen, r: t.r});
    const x = InvAcciones.aplicarSoltarse(inv, t);
    ui.cambio(); toast(x.error || x.aviso);
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
  if(d.invotroataque) bnInvPreguntarTipo(inv.id);   // el menú, a mano
  else bnInvAtacar(inv.id, 'normal');   // Atacar = ataque normal (2026-10-06)
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
// Primero «¿Qué ataque es?» (normal / oportunidad / contraataque, 2026-10-03: igual que personajes y creeps).
function bnInvPreguntarTipo(invId){
  const inv = (bn && bn.S && (bn.S.invocaciones || []).find(x => x && x.id === invId)) || null;
  if(!inv) return;
  bn.raiz.querySelector('#bn-tipo-lista').innerHTML = InvAcciones.menuTipoAtaque(inv, 'data-bn-invtipo');
  bn.raiz.querySelector('#bn-tipo-ataque').classList.add('open');
}
function bnInvAtacar(invId, tipo){
  tipo = tipo || 'normal';
  const buscar = () => (bn && bn.S && (bn.S.invocaciones || []).find(x => x && x.id === invId)) || null;
  const hacer = async () => {
    const inv = buscar();
    if(!inv) return;
    const qs = Combatiente.preguntaSentado(inv.estados, inv.nombre);   // Sentado no puede atacar: avisa y deja seguir
    if(qs && !(await AvisoCombate.preguntar(qs, {icono: '⚔', titulo: 'Atacar igual', si: 'Sí, atacar'}))) return;
    // Sin No2 suficientes: «¿Atacar igual?» (B-7, como los creeps): gasta los que tenga y deja la línea roja.
    const forzar = InvAcciones.faltanNitros(inv, tipo);
    if(forzar && !(await AvisoCombate.preguntar(InvAcciones.preguntaSinNitros(inv, tipo), {icono: '⚠', titulo: 'Sin No2', si: 'Sí, atacar'}))) return;
    const ui = bnUi(FichaGuardado.partes(bn.S));
    const p = InvAcciones.pagarAtaque(inv, forzar, tipo);
    if(p.error){ toast(p.error); return; }
    InvAcciones.alertaSinNitros(inv, p.forzado, tipo);
    if(tipo === 'normal' && bn.invParry) bn.invParry.delete(inv.id);   // atacar cierra el Parry que esperaba su Bloqueo
    ui.cambio();
    bnPublicarInv(inv, InvAcciones.tiradaAtaque(inv, tipo));
    toast(p.aviso);
  };
  const inv = buscar();
  if(!inv) return;
  if(typeof Duelo === 'undefined' || !Duelo.disponible()){ hacer(); return; }
  const reabrir = () => { if(bn){ bn.host.hidden = false; bnUbicar(); bnDibujar(); } };
  bn.host.hidden = true;
  dueloElegirObjetivoMapa({yo: {ref: bn.fichaId + SEP_INVOCACION + inv.id, tipo: 'pj', nombre: inv.nombre}, ataque: InvAcciones.ataqueDuelo(inv, tipo),
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
function bnOpcionesGuardado(f){ return opcionesGuardadoMapa(f, () => bn.S, () => bn.doc, () => !!bn && bn.sesion === f); }
// Cómo guarda el mapa a un personaje (FichaSesion.guardar): la Botonera nueva y el Mantenimiento (A2). getS/getDoc: el personaje armado
// y su documento público; vigente: ¿sigue abierta esa sesión?
function opcionesGuardadoMapa(f, getS, getDoc, vigente){
  // Las miniaturas de las invocaciones las calcula la ficha (tardan): se reusan las que ya están publicadas.
  const miniaturaInv = img => {
    const inv = (getS().invocaciones || []).find(i => i.imagen === img);
    const doc = getDoc();
    const r = inv && (((doc && doc.resumen) || {}).invocaciones || []).find(x => x.id === String(inv.id));
    return (r && r.miniatura) || '';
  };
  return {
    db: fbDb, ruta: fbRutaCampana(`fichas/${f.id}`), marcaDeTiempo: () => firebase.firestore.FieldValue.serverTimestamp(),
    partes: () => FichaGuardado.partes(getS()),
    resumen: () => FichaResumen.resumen(getS(), {control: f.control, miniaturaInv}),
    nombre: () => String((getS().meta && getS().meta.nombre) || '').trim().slice(0, 60) || 'Sin nombre',
    miniatura: async () => (getDoc() && getDoc().miniatura) || '',
    vigente,
    alError: (err, primeraVez) => { if(primeraVez) toast('No se pudo guardar el personaje: se reintenta solo'); },
  };
}
// La interfaz que le da el mapa a FichaAcciones. `antes`: las partes antes de la acción, para escribir solo lo que tocó.
// comoGM (A6b): el GM edita a un personaje sin tener 🎮 el control (como "Editar como GM" de la ficha): se guarda igual.
function bnUi(antes, comoGM){
  const f = bn.sesion;
  return {
    presets: estadosPresetFicha(),
    toast: t => toast(t),
    avisarSinNitros: (costo, accion, continuar) => bnSinNitros(costo, accion, continuar),
    cambio: () => {
      bnRevisarVida();
      const despues = FichaGuardado.partes(bn.S);
      Object.keys(despues).forEach(p => { if(despues[p] === antes[p] && despues[p] !== f.ultimo[p]) f.ultimo[p] = despues[p]; });
      f.soloLectura = !(bnPuedeGuardar() || comoGM);
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
  if(!lado || lado.tipo !== 'pj' || String(lado.ref || '').includes(SEP_INVOCACION)) return null;
  if(!bn || !bn.S || lado.ref !== bn.fichaId || typeof FichaDuelo === 'undefined')   // todavía no está leído: se lee (A1, 2026-10-02)
    return bnManejo(lado.ref) ? bnPrepararParaDuelo(lado.ref, () => bnHooksDueloYa(lado)) : null;
  return bnHooksDueloYa(lado);
}
function bnHooksDueloYa(lado){
  if(!bn || !bn.S || lado.ref !== bn.fichaId || typeof FichaDuelo === 'undefined') return null;
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
  if(!lado || lado.tipo !== 'pj' || !String(lado.ref || '').includes(SEP_INVOCACION)) return null;
  const fichaId = String(lado.ref).split(SEP_INVOCACION)[0];
  if(typeof InvDuelo === 'undefined' || !bn || bn.fichaId !== fichaId || !bn.S)   // todavía no está leído: se lee (A1, 2026-10-02)
    return bnManejo(fichaId) ? bnPrepararParaDuelo(fichaId, () => bnHooksDueloInvYa(lado)) : null;
  return bnHooksDueloInvYa(lado);
}
function bnHooksDueloInvYa(lado){
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
  soltarse: (S, ui) => FichaAcciones.soltarse(S, false, {...ui, registrarTirada: (o, r) => bnPublicar(o, r)}),
  // Consumir: la vida, el estado que deja, sus tiradas y la trampa consumible los resuelve el mapa con las piezas comunes.
  consumir: (S, ui, id) => FichaAcciones.consumir(S, id, false, {...ui,
    anunciar: a => anunciarConsumo(a),   // la Mesa y la Crónica (js/21)
    fijarHp: v => FichaAcciones.fijarHp(S, v),
    efecto: it => FichaAcciones.efectoDeConsumo(S, it, ui.presets, t => toast(t)),
    tirarExtra: it => FichaAcciones.tiradasDeItem(S, it).forEach(t => { if(t.error) toast(t.error); else bnPublicar(t.origen, t.r); }),
    colocarTrampa: it => FichaAcciones.colocarTrampaDeItem(bn.fichaId, it, ui),   // la trampa consumible, junto al token
    // La zona de un consumible (2026-10-08, las bengalas): la misma de una habilidad, a nombre del personaje.
    colocarZona: it => FichaAcciones.colocarZonaDeHab(S, {id: 'zona:' + it.id, nombre: it.nombre, detalle: it.detalle || '', modo: 'auto', duelo: it.zonaUso}, 0, 0,
      {...ui, enMapa: () => true, yo: () => ({ref: bn.fichaId, tipo: 'pj'}), alMapa: (t, m) => bnAlMapa(t, m)}),
    // ✚ Revive (2026-10-06, js/22): elegir al aliado caído antes de gastarlo, y revivirlo.
    elegirCaido: it => elegirCaidoParaRevivir({fichaId: bn.fichaId, bando: 'pj', rango: num(it.revive.rango) || 5, pct: num(it.revive.pct) || 50, item: it.nombre}),
    revivir: (c, pct, it) => revivirElegido(c, pct, `${(S.meta && S.meta.nombre) || 'Un aliado'} (${it.nombre})`),
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
      bnAbrirCartel('bn-sobrepeso');
    },
    getParry: () => bn.parryPendiente || null,
    setParry: id => { bn.parryPendiente = id; },
    elegirArma: (tipo, armas) => {
      const dmg = FichaCalculo.calcular(bn.S).final.dmg;
      bn.raiz.querySelector('#bn-arma-lista').innerHTML = (tipo === 'dano' ? '' : `<div class="hint">${tipo === 'parry' ? 'Parry: siempre cuesta 1 No2, sea cual sea el arma o escudo que elijas.' : tipo === 'fuerza' ? 'Fuerza del golpe: tu Fuerza + el peso del arma que elijas; esa suma es el dado (contra el Bloqueo del defensor).' : 'Bloqueo: tu Bloqueo + el peso del arma o escudo que elijas; esa suma es el dado que tirás. (Después de un Parry se usa el mismo, solo.)'}</div>`) +
        armas.map(a => `<button class="btn" data-bn-arma="${tipo}:${a.item.id}" style="width:100%">${a.mano ? `Mano ${a.mano}: ` : ''}${esc(a.item.nombre)} — ${tipo === 'dano' ? esc(FichaCombate.armaDanoTxt(a.item, dmg)) : tipo === 'parry' ? `${fmt(Combatiente.costoParry())} No2` : `+${fmt(num(a.item.peso))} de peso`}</button>`).join('');
      bnAbrirCartel('bn-elegir-arma');
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
// Atacar es siempre un ataque normal (dueño, 2026-10-06: la oportunidad la ofrece el mapa cuando un rival se aleja, y el contraataque el duelo
// después de ganar el Parry y el Bloqueo); el menú queda para «↪ Oportunidad o contraataque, a mano» (`otro`).
function bnPreguntarTipoAtaque(arma, otro){
  // ✨ Un arma especial tiene su propio recorrido (dueño, 2026-10-05): sin «¿Qué ataque es?» (no tiene oportunidad ni contraataque, P160), directo a sus reglas.
  if(arma && arma.especial){ FichaAcciones.usarArmaEspecial(bn.S, arma.id, false, bnHabUi()); return; }
  if(!otro){ bnAtacar('normal', arma ? arma.id : ''); return; }
  const S = bn.S, costoNormal = FichaCombate.costoAtaque(S, arma), primero = FichaCombate.ataquesConArma(S, arma) === 0, especial = FichaCombate.costoAtaqueEspecial(arma, 'contra', S), especialOpor = FichaCombate.costoAtaqueEspecial(arma, 'oportunidad', S);
  const id = arma ? arma.id : '';
  bn.raiz.querySelector('#bn-tipo-lista').innerHTML = Combatiente.menuTipoAtaqueHtml({nombre: arma ? arma.nombre : 'Sin arma', normal: costoNormal, primero, especial, especialOpor, attr: 'data-bn-tipo', ref: id, primeroTxt: 'primer ataque con esta arma (Tipo ÷ 2)', siguienteTxt: 'Tipo completo (ya atacaste con esta arma este turno)'});   // el menú común
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
    ataque: {tipo, armaId: arma ? arma.id : '', armaNombre: arma ? arma.nombre : '', tipoDado: FichaCombate.tipoAtaque(arma), rango: !!(arma && arma.armaDeRango), alcance: FichaCombate.alcanceDeArma(S, arma),
      ...Combatiente.ataqueDeArma(arma)},   // los rasgos del arma: por la espalda, sin Parry
    conSuelto: true, alSuelto: () => { reabrir(); hacer(); }, alCancelar: () => {}});
}
function bnCombateAca(b){
  const a = b.dataset.botoneraaccion;
  if(!['esquivar', 'parry', 'bloqueo', 'fuerzagolpe', 'danio', 'atacar', 'otroataque'].includes(a) || !bnPuedeGuardar()) return false;
  const S = bn.S, ui = bnCombateUi();
  if(a === 'atacar' || a === 'otroataque'){
    if(b.dataset.arma === undefined) return false;   // (la Botonera siempre lo trae con su arma; si no, que lo haga la ficha)
    bnPreguntarTipoAtaque(S.inventario.find(x => x.id === b.dataset.arma) || FichaAcciones.armasEspeciales(S).find(x => x.id === b.dataset.arma) || null, a === 'otroataque');   // (un modo de una varita: en las armas especiales)
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
  else if(tipo === 'blink-habilidad') blinkDeHabilidad(msg);
  else if(tipo === 'caos-habilidad') caosDeHabilidad(msg);
  else if(tipo === 'zona-persistente-habilidad') zonaPersistenteDeHabilidad(msg);
  else if(tipo === 'trampa-habilidad') trampaDeHabilidad(msg);
  else if(tipo === 'invocacion-habilidad') invocacionDeHabilidad(msg);
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
    custodio: o => orbeCustodioMapa({fichaId: bn.fichaId, tipo: 'pj', n: num(o.orbeCustodio), orbe: o.nombre, quien: (bn.S.meta && bn.S.meta.nombre) || ''}),   // js/26
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
      bnAbrirCartel('bn-elegir-arma');
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
  if(b.dataset.levantararma){ bnLevantarArma(b.dataset.levantararma); return true; }   // 🗡 un arma en el piso (js/27)
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
  const accion = b.dataset.sigilo ? 'sigilo' : b.dataset.levantarse ? 'levantarse' : b.dataset.soltarse ? 'soltarse' : b.dataset.consume ? 'consumir' : '';
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
  editar.style.display = '';
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
  if(accion === 'editar'){ bnEditar(v.key, v.id); return; }   // el editor común (A6b)
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
// Un cartel de la Botonera que pide algo (sin No2, sobrepeso, ¿con qué arma?) se tiene que ver aunque la Botonera esté escondida (2026-10-03:
// el duelo le pide el PdG mientras se eligió el objetivo y el cartel quedaba invisible, esperando).
function bnAbrirCartel(id){
  if(bn.host.hidden){ bn.host.hidden = false; bnUbicar(); }
  bn.raiz.querySelector('#' + id).classList.add('open');
}
function bnSinNitros(costo, accion, continuar){
  bnSinNitrosSeguir = continuar;
  bn.raiz.querySelector('#bn-sn-texto').innerHTML = `No podés <b>${esc(accion)}</b>: cuesta <b>${fmt(costo)} No2</b> y tenés <b>${fmt(Math.max(0, num(bn.S.nitros)))}</b>.`;
  bnAbrirCartel('bn-sin-nitros');
}
function bnCerrarSinNitros(){ bnSinNitrosSeguir = null; if(bn) bn.raiz.querySelector('#bn-sin-nitros').classList.remove('open'); }
// Mientras haya una ventana abierta adentro del recuadro (una .scrim.open), el recuadro va sin desenfoque (mapa.css, .con-ventana): así la
// ventana se ve al frente, con todo el ancho de la pantalla. También para las Acciones de un creep (js/12).
function ventanasAlFrente(host, raiz){
  const mirar = () => host.classList.toggle('con-ventana', !!raiz.querySelector('.scrim.open'));
  new MutationObserver(mirar).observe(raiz, {subtree: true, attributes: true, attributeFilter: ['class']});
}
function bnCrear(){
  const host = document.createElement('div');
  host.id = 'botonera-nueva';
  host.hidden = true;
  document.body.appendChild(host);
  const raiz = host.attachShadow({mode: 'open'});
  ventanasAlFrente(host, raiz);
  raiz.innerHTML = `<style id="bn-css"></style><div id="bn-contenido"></div>
    <div class="scrim" id="bn-equipo"><div class="modal" style="max-width:1400px;width:96vw">
      <header><h3>🛡 Equipo y mochila</h3><button class="iconbtn" data-bn-eq="cerrar">Cerrar</button></header>
      <div class="body" id="bn-equipo-cuerpo"></div>
    </div></div>
    <div class="scrim" id="bn-revivir"><div class="modal" style="max-width:340px">
      <header><h3>¿Con cuánto HP revivir?</h3><button class="iconbtn" data-bn-rv="cerrar">Cerrar</button></header>
      <div class="body" style="display:flex;flex-direction:column;gap:12px">
        <div style="display:flex;gap:8px">
          <button type="button" class="btn" data-bn-rv="pct" style="flex:1">Por %</button>
          <button type="button" class="btn" data-bn-rv="valor" style="flex:1">Valor neto</button>
        </div>
        <div class="f" id="bn-rv-campo-pct"><label>Porcentaje del HP máximo</label><input type="number" id="bn-rv-pct" value="50" min="1" max="100"></div>
        <div class="f" id="bn-rv-campo-valor" style="display:none"><label>HP exacto</label><input type="number" id="bn-rv-valor" value="1" min="1"></div>
        <div class="hint" id="bn-rv-preview" style="font-size:14px;color:var(--paper)"></div>
      </div>
      <footer><button class="btn ghost" data-bn-rv="cerrar">Cancelar</button><button class="btn primary" data-bn-rv="si">Revivir</button></footer>
    </div></div>
    <div class="scrim" id="bn-reroll"><div class="modal" style="max-width:560px">
      <header><h3>🪙 Moneda Re-Roll</h3><button class="iconbtn" data-bn-rr="cerrar">Cerrar</button></header>
      <div class="body"><p class="hint" id="bn-reroll-aviso" style="margin:0 0 10px"></p><div id="bn-reroll-lista"></div></div>
    </div></div>
    <div class="scrim" id="bn-stats"><div class="modal" style="max-width:820px">
      <header><h3>📊 Stats</h3><button class="iconbtn" data-bn-st="cerrar">Cerrar</button></header>
      <div class="body">
        <div class="hint" style="margin:0 0 8px">Tocá el número grande de un atributo para cambiarlo; los stats de abajo se recalculan solos. Tocá un stat para ver de dónde sale.</div>
        <div id="bn-stats-puntos" class="attr-points" style="margin-bottom:10px"></div>
        <div id="bn-stats-attrs"></div>
      </div>
    </div></div>
    <div class="scrim" id="bn-tienda"><div class="modal catalogo-modal botonera-modal">
      <header>
        <h3 id="bn-tienda-titulo">Tienda</h3>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <span class="tienda-badge" id="bn-tienda-badge"></span>
          <button class="btn" data-bn-ti="baul" style="font-size:14px;padding:8px 16px;font-weight:700;letter-spacing:.02em;background:#1F4E79;border:1px solid #6FA8DC;color:#fff" title="El baúl común del grupo: guardar y sacar ítems, oro y despojos (queda anotado quién)">📦 Baúl común</button>
          <button class="btn primary" data-bn-ti="vender" style="font-size:14px;padding:8px 16px;font-weight:700;letter-spacing:.02em" title="Vender ítems de tu mochila y despojos a esta tienda">💰 Vender</button>
          <button class="iconbtn" data-bn-ti="reparar" id="bn-tienda-reparar" title="Reparar tu equipo con el herrero (se paga por punto de durabilidad)">🔧 Reparación</button>
          <span class="catalogo-dde-badge">DDE disponibles: <b id="bn-tienda-dde">0</b></span>
          <button class="iconbtn" data-bn-ti="cerrar">Cerrar</button>
        </div>
      </header>
      <div class="carrito-bar">
        <div id="bn-tienda-secciones"></div>   <!-- las pestañas: Herrería, Talabartería, Bazar arcano (P179) -->
        <div class="catalogo-filtros" id="bn-tienda-filtros"></div>   <!-- comun/filtro-catalogo.js (2026-10-08) -->
        <div class="carrito-lista" id="bn-carrito-lista"></div>
        <div class="carrito-footer">
          <span>Total: <b id="bn-carrito-total">0</b> DDE</span>
          <button type="button" class="btn aleatorio" data-bn-ti="aleatorio" title="Elige un ítem al azar entre los que cumplen los filtros activos">🎲 Ítem aleatorio</button>
          <button class="btn ghost" data-bn-ti="vaciar">Vaciar</button>
          <button class="btn primary" data-bn-ti="comprar" id="bn-carrito-comprar" disabled>Comprar</button>
        </div>
      </div>
      <div class="body" id="bn-tienda-cuerpo"></div>
    </div></div>
    <div class="scrim" id="bn-vender"><div class="modal" style="max-width:640px">
      <header><h3>💰 Vender a la tienda</h3><button class="iconbtn" data-bn-ti="vender-no">Cerrar</button></header>
      <div class="body" id="bn-vender-cuerpo"></div>
      <footer style="justify-content:space-between"><span class="hint" id="bn-vender-total" style="font-size:14px;color:var(--paper)"></span><button class="btn primary" data-bn-ti="vender-si">Vender lo elegido</button></footer>
    </div></div>
    <div class="scrim" id="bn-reparar"><div class="modal" style="max-width:680px">
      <header><h3>🔧 Reparación · herrero</h3><button class="iconbtn" data-bn-ti="reparar-no">Cerrar</button></header>
      <div class="body" id="bn-reparar-cuerpo"></div>
      <footer style="justify-content:space-between"><span class="hint" id="bn-reparar-total" style="font-size:14px;color:var(--paper)"></span><button class="btn primary" data-bn-ti="reparar-todo" id="bn-reparar-todo">Reparar todo</button></footer>
    </div></div>
    <div class="scrim" id="bn-aleatorio"><div class="modal" style="max-width:420px">
      <header><h3>🎲 Ítem aleatorio</h3><button class="iconbtn" data-bn-ti="aleatorio-no">Cerrar</button></header>
      <div class="body" id="bn-aleatorio-cuerpo"></div>
      <footer><button class="btn ghost" data-bn-ti="aleatorio">🎲 Tirar de nuevo</button><button class="btn primary" data-bn-ti="aleatorio-no">Cerrar</button></footer>
    </div></div>
    <div class="scrim" id="bn-botin"><div class="modal" style="max-width:920px;width:94vw">
      <header><h3>⚔ Batalla terminada</h3><button class="iconbtn" data-bn-eq="botin-no">Cerrar</button></header>
      <div class="body" id="bn-botin-cuerpo"></div>
    </div></div>
    <div class="scrim" id="bn-slot-lleno"><div class="modal" style="max-width:460px">
      <header><h3>Slot equipado</h3><button class="iconbtn" data-bn-eq="slot-no">Cerrar</button></header>
      <div class="body" id="bn-slot-lleno-cuerpo"></div>
    </div></div>
    <div class="scrim" id="bn-comparar"><div class="modal" style="max-width:560px">
      <header><h3>Comparar</h3><button class="iconbtn" data-bn-eq="comparar-no">Cerrar</button></header>
      <div class="body" id="bn-comparar-cuerpo"></div>
    </div></div>
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
    </div></div>
    <div class="scrim" id="bn-tipoitem"><div class="modal" style="max-width:620px">
      <header><h3>Categoría del ítem</h3><button class="iconbtn" data-bn-tipoitem="">Cerrar</button></header>
      <div class="body" id="bn-tipoitem-cuerpo"></div>
    </div></div>`;
  // Una ventanita que se abre adentro de la Botonera (costo X, elegir arma, sobrepeso, Ver…) queda a la vista aunque la Botonera esté
  // desplazada hacia abajo (2026-10-02: el cartel del costo X aparecía arriba de todo, fuera de la vista).
  new MutationObserver(ms => ms.forEach(m => {
    const el = m.target;
    if(!el.classList || !el.classList.contains('scrim') || !el.classList.contains('open') || /\bopen\b/.test(m.oldValue || '')) return;
    try{ (el.querySelector('.modal') || el).scrollIntoView({block: 'nearest'}); }catch(err){}
  })).observe(raiz, {subtree: true, attributes: true, attributeFilter: ['class'], attributeOldValue: true});
  raiz.querySelector('#bn-sin-nitros').addEventListener('mousedown', e => { if(e.target.id === 'bn-sin-nitros') bnCerrarSinNitros(); });
  raiz.querySelector('#bn-costox').addEventListener('mousedown', e => { if(e.target.id === 'bn-costox'){ bnCostoX = null; e.target.classList.remove('open'); } });
  ['bn-slot-lleno', 'bn-comparar'].forEach(id => raiz.querySelector('#' + id).addEventListener('mousedown', e => { if(e.target.id === id) e.target.classList.remove('open'); }));
  raiz.querySelector('#bn-equipo').addEventListener('mousedown', e => { if(e.target.id === 'bn-equipo') bnEquipoCerrar(); });
  raiz.querySelector('#bn-botin').addEventListener('mousedown', e => { if(e.target.id === 'bn-botin') bnBotinCerrar(); });
  raiz.querySelector('#bn-tienda').addEventListener('mousedown', e => { if(e.target.id === 'bn-tienda') bnTiendaCerrar(); });
  raiz.querySelector('#bn-stats').addEventListener('mousedown', e => { if(e.target.id === 'bn-stats') bnStatsCerrar(); });
  raiz.querySelector('#bn-reroll').addEventListener('mousedown', e => { if(e.target.id === 'bn-reroll') bnRerollCerrar(); });
  raiz.querySelector('#bn-revivir').addEventListener('mousedown', e => { if(e.target.id === 'bn-revivir') bnRevivirCerrar(); });
  raiz.querySelector('#bn-tipoitem').addEventListener('mousedown', e => { if(e.target.id === 'bn-tipoitem') bnTipoItemCerrar(null); });
  raiz.querySelector('#bn-tipoitem').addEventListener('click', e => {
    e.stopPropagation();
    const b = e.composedPath()[0].closest && e.composedPath()[0].closest('button');
    if(!b) return;
    if(b.dataset.tipoitem) bnTipoItemCerrar(b.dataset.tipoitem);
    else if(b.dataset.bnTipoitem !== undefined) bnTipoItemCerrar(null);
  });
  raiz.querySelector('#bn-revivir').addEventListener('input', () => bnRevivirDibujar());
  raiz.querySelector('#bn-revivir').addEventListener('click', e => {
    e.stopPropagation();   // sus botones son solo de esta ventana
    const b = e.composedPath()[0].closest && e.composedPath()[0].closest('button');
    if(!b || !b.dataset.bnRv) return;
    const a = b.dataset.bnRv;
    if(a === 'cerrar'){ bnRevivirCerrar(); return; }
    if(a === 'pct' || a === 'valor'){ bnRevivirModo = a; bnRevivirDibujar(); return; }
    if(a === 'si' && bn.S){
      if(!bnPuedeGuardar()){ toast('Ese personaje no lo manejás vos'); return; }
      const antes = FichaGuardado.partes(bn.S);
      const {val} = bnRevivirCuenta();
      FichaAcciones.revivir(bn.S, val);
      bnUi(antes).cambio();
      toast(`Revivido con ${fmt(bn.S.hp)} HP`);
      bnRevivirCerrar();
    }
  });
  raiz.querySelector('#bn-reroll').addEventListener('click', e => {
    e.stopPropagation();   // sus botones son solo de esta ventana: que no los atienda también el manejador general del recuadro
    const b = e.composedPath()[0].closest && e.composedPath()[0].closest('button');
    if(!b) return;
    if(b.dataset.bnRr === 'cerrar'){ bnRerollCerrar(); return; }
    if(b.dataset.rerollpick && bn.S){
      if(!bnPuedeGuardar()){ toast('Ese personaje no lo manejás vos'); return; }
      const h = bnRerollLista.find(x => x.clave === b.dataset.rerollpick);
      if(FichaDuelo.usarReroll(bn.S, h, bnCombateUi())) bnRerollDibujar();
    }
  });
  // 📊 Stats (A6a): tocar un stat abre su desglose; el número grande de un atributo y las fórmulas se guardan al confirmar.
  raiz.querySelector('#bn-stats').addEventListener('click', e => {
    e.stopPropagation();   // ídem: si no, el 🎲 tiraba dos veces y tocar un stat se le pedía a la ficha escondida
    const t = e.composedPath()[0];
    const b = t.closest && t.closest('button');
    if(b && b.dataset.tirarstat){ if(bn.S) bnTirarAca(b); return; }
    if(b && b.dataset.bnSt === 'cerrar'){ bnStatsCerrar(); return; }
    const tile = (b && b.dataset.stat) ? b : (!b && t.closest ? t.closest('.d') : null);
    if(tile && tile.dataset.stat){ bnStatsAbierto = bnStatsAbierto === tile.dataset.stat ? null : tile.dataset.stat; bnStatsDibujar(); }
  });
  raiz.querySelector('#bn-stats').addEventListener('change', e => {
    const t = e.composedPath()[0];
    if(!bn.S || !t || !t.dataset || (!t.dataset.attr && !t.dataset.formula)) return;
    if(!bnPuedeGuardar()){ toast('Ese personaje no lo manejás vos: solo se puede mirar'); bnStatsDibujar(); return; }
    const antes = FichaGuardado.partes(bn.S);
    if(t.dataset.attr) FichaStats.cambiarAtributo(bn.S, t.dataset.attr, t.value, t.dataset.mod);
    else FichaStats.cambiarFormula(bn.S, t.dataset.formula, t.value);
    bnUi(antes).cambio();
    bnStatsDibujar();
  });
  ['bn-vender', 'bn-reparar', 'bn-aleatorio'].forEach(id => raiz.querySelector('#' + id).addEventListener('mousedown', e => { if(e.target.id === id) e.target.classList.remove('open'); }));
  // Los filtros de la tienda y las cantidades de vender (A5).
  raiz.addEventListener('change', e => {
    const t = e.composedPath()[0];
    if(!t || !t.dataset) return;
    if(t.dataset.venderChk !== undefined || t.dataset.venderCant !== undefined){
      FichaTienda.venderCambio(bnTiendaSt, t);
      raiz.querySelector('#bn-vender-total').innerHTML = `Vas a cobrar: <b>${fmt(FichaTienda.totalVenta(bn.S, bnTiendaSt))} DDE</b>`;
    }
  });
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
    if(b.dataset.bnInvtipo){
      raiz.querySelector('#bn-tipo-ataque').classList.remove('open');
      const [tipo, invId] = b.dataset.bnInvtipo.split(':');
      bnInvAtacar(invId, tipo);
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
    if(bnEquipoClic(b)) return;   // Equipo y mochila (A4) y el botín (A5)
    if(bnTiendaClic(b)) return;   // la tienda (A5)
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
    // Confusión (2026-10-04, js/20): la primera acción del turno tira antes.
    if(stunEsAccion(b)){ const tid = confusionTokenDe(bn.invId ? bn.fichaId + SEP_INVOCACION + bn.invId : bn.fichaId, 'pj'); if(stunAntes(tid, () => stunReclic(raiz, b, tid))) return; }   // Stun (2026-10-06)
    if(confusionEsAccion(b)){ const tid = confusionTokenDe(bn.invId ? bn.fichaId + SEP_INVOCACION + bn.invId : bn.fichaId, 'pj'); if(confusionAntes(tid, () => confusionReclic(raiz, b, tid))) return; avisarFueraDeTurno(tid, b); }
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
  bnAbrirSesion(fichaId);
  const lupaCss = (document.getElementById('lupa-css') || {}).textContent || '';   // los 🔍 (comun/lupa.js)
  bn.raiz.querySelector('#bn-css').textContent = bnCss + lupaCss + (typeof ItemCorto !== 'undefined' ? ItemCorto.CSS : '') + PANEL_CSS + ' #bn-contenido{font-family:"Space Grotesk",system-ui,sans-serif;font-size:14px;line-height:1.45;color:var(--paper)}';
  bn.invId = invId;   // la Botonera de una de sus invocaciones (4e), o '' para la del personaje
  if(ac && !ac.host.hidden) cerrarAccionesNuevas();
  bn.host.hidden = false;
  bnUbicar();
  centrarTokenDeBotonera('ficha', fichaId);
  bnDibujar();
}
/* La sesión en vivo del personaje (FichaSesion), sin mostrar nada: la abre la Botonera nueva y, desde el 2026-10-02 (hoja de ruta A1),
   también el duelo cuando le pide algo a un personaje de este usuario que todavía no abrió su Botonera en esta pantalla (bnHooksDuelo):
   así lo contesta siempre el mapa, nunca la ficha escondida. Una sola a la vez (la de `bn`); cambiar de personaje corta la anterior. */
function bnAbrirSesion(fichaId){
  if(!bn){ bn = Object.assign({fichaId: '', sesion: null, S: null}, bnCrear()); }
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
}
// Espera a que el personaje esté leído (hasta 15 s). true si quedó listo.
async function bnSesionLista(fichaId){
  for(let i = 0; i < 150; i++){
    if(!bn || bn.fichaId !== fichaId) return false;
    if(bn.S && bn.sesion && bn.sesion.cargada) return true;
    await new Promise(r => setTimeout(r, 100));
  }
  return false;
}
// ¿Este usuario maneja a ese personaje (su dueño sin el GM con el control, o quien tiene 🎮 el control)? Con lo público, antes de leerlo.
function bnManejo(fichaId){
  const f = fichasPub.get(fichaId), yo = fbUsuario && fbUsuario.uid;
  if(!f || !yo) return false;
  const control = f.resumen && f.resumen.control;
  return control ? control === yo : f.duenoUid === yo;
}
/* ---------- El Mantenimiento de los personajes, hecho por el mapa (2026-10-02, hoja de ruta A2) ----------
   Antes, en cada ⟳ Mantenimiento el mapa cargaba en un marco invisible la ficha de cada personaje que maneja este usuario (su dueño,
   o el GM con 🎮 el control) para que corriera su mantenimiento(). Ahora lo hace el mapa con la misma regla (comun/ficha-mantenimiento.js):
   lee al personaje (la sesión de la Botonera nueva si ya está abierta; si no, una sesión de un rato), toma los turnos que le tocan con
   la misma transacción de siempre (si otra pantalla ya los aplicó, no hace nada), los aplica, publica el reporte en la Mesa y guarda. */
let mantPersonajesCola = Promise.resolve();
function mantenimientoPersonajes(numero){
  fichasPub.forEach((f, id) => {
    if(!bnManejo(id)) return;
    mantPersonajesCola = mantPersonajesCola.then(() => mantenimientoPersonaje(id, numero))
      .catch(err => console.error('No se pudo aplicar el Mantenimiento de un personaje:', err));
  });
}
// La vida en el pase de turno, como fijarHp de la ficha: tope, y el Ankh del cinturón y el estado de muerte.
function mantFijarHp(S, v){
  FichaAcciones.fijarHp(S, v);
  const ankh = FichaAcciones.revisarAnkh(S);
  if(ankh) toast(`¡${ankh} se activó solo! ${(S.meta && S.meta.nombre) || 'Tu personaje'} revive con ${fmt(S.hp)} HP.`);
  FichaAcciones.revisarMuerte(S);
}
async function mantenimientoPersonaje(fichaId, numero){
  await editarPersonajeMapa(fichaId, async (S, o) => {
    const veces = await FichaMantenimiento.reclamar(fbDb, fbRutaCampana(`fichas/${fichaId}`), numero, () => firebase.firestore.FieldValue.serverTimestamp());
    if(!veces) return false;
    const nombre = ((S.meta && S.meta.nombre) || '').trim();
    let hubo = false;
    for(let i = 0; i < veces; i++){
      const r = FichaMantenimiento.aplicar(S, {
        fijarHp: v => mantFijarHp(S, v),
        limpiarParry: () => { if(o.enBn){ bn.parryPendiente = null; if(bn.invParry) bn.invParry.clear(); } },
      }, numero);
      if(r.enTurno) continue;   // en combate lo hace su turno propio (P161): no se toca la ficha
      hubo = true;
      FichaMantenimiento.publicarReporte(`Turno ${S.turno}`, r.rep, nombre);
      FichaMantenimiento.publicarRecordatorios(r.avisos, nombre);
    }
    return hubo;
  });
}
/* ---------- Lo que le llega a un personaje desde afuera, aplicado por el mapa (2026-10-02, hoja de ruta B-8) ----------
   Los estados que le dejan una habilidad de creep, una trampa, una zona o la Ejecución ✨ de otro (campanas/<id>/estados, también a sus
   invocaciones) y las recompensas del combate (campanas/<id>/recompensas: XP, DDE, despojos, trampas que vuelven). Antes solo los
   aplicaba la ficha abierta (con el mapa solo, quedaban esperando); ahora también el mapa, para los personajes que maneja este usuario
   (bnManejo: los suyos, o los que el GM controla con 🎮). La transacción de comun/recibidos.js hace que lo aplique una sola pantalla
   aunque la ficha también esté abierta. La subida de nivel la muestra el mapa solo, mirando el resumen (mostrarSubidaNivelMapa). */
const recibidosPend = {estados: [], recompensas: []}, recibidosEnCurso = new Set();
let recibidosCola = Promise.resolve();
function recibidosEscuchar(){
  ['estados', 'recompensas'].forEach(col => Recibidos.escuchar(col, docs => { recibidosPend[col] = docs; recibidosRevisar(); }));
  Intercambio.iniciar(intercambioHostMapa);   // 🤝 lo que le ofrecen a un personaje y lo que él ofreció (comun/intercambio.js)
}
/* 🤝 Pasar cosas entre personajes y 📦 el baúl común (2026-10-05, P157): la regla y las ventanas en comun/intercambio.js; acá, cómo el mapa
   toca a un personaje (editarPersonajeMapa: el de la Botonera nueva o una sesión de un rato). */
const intercambioHostMapa = {
  maneja: id => bnManejo(id),
  leer: id => (bn && bn.fichaId === id && bn.S) ? bn.S : null,
  con: async (id, fn) => {
    const hubo = !!(await editarPersonajeMapa(id, S => fn(S)));
    if(hubo && bn && bn.fichaId === id){ bnTiendaDibujar(); if(bn.raiz.querySelector('#bn-equipo.open')) bnEquipoDibujar(); }   // el DDE de la tienda, la mochila
    return hubo;
  },
  enCombate: () => modoMapa === 'combate',
  tienda: () => (bn && bn.raiz && bn.raiz.querySelector('#bn-tienda').classList.contains('open') && bnTiendaSt.tienda) || null,
  toast: t => toast(t),
  propias: () => [...fichasPub.keys()].filter(id => bnManejo(id)),
  // En combate solo a un aliado al lado: los personajes con token a 1 casillero del suyo (en el mapa que se está mirando).
  adyacentes: id => {
    const pjs = [...tokens.values()].filter(t => t && t.tipo === 'pj' && t.fichaId && !String(t.fichaId).includes(SEP_INVOCACION));
    const mio = pjs.find(t => t.fichaId === id);
    if(!mio) return [];
    return pjs.filter(t => t.fichaId !== id && distanciaHex({col: mio.col, fila: mio.fila}, {col: t.col, fila: t.fila}) <= 1).map(t => t.fichaId);
  },
};
function recibidosRevisar(){
  const ids = new Set([...recibidosPend.estados, ...recibidosPend.recompensas].map(d => String(d.data().fichaId || '').split(SEP_INVOCACION)[0]));
  ids.forEach(id => {
    if(!id || !bnManejo(id) || recibidosEnCurso.has(id)) return;
    recibidosEnCurso.add(id);
    recibidosCola = recibidosCola.then(() => recibidosAplicar(id))
      .catch(err => console.error('No se pudo aplicar lo recibido:', err))
      .then(() => recibidosEnCurso.delete(id));
  });
}
async function recibidosAplicar(fichaId){
  const de = col => Recibidos.deFicha(recibidosPend[col], fichaId);
  if(!de('estados').length && !de('recompensas').length) return;
  await editarPersonajeMapa(fichaId, async S => {
    const nombre = ((S.meta && S.meta.nombre) || '').trim();
    const aviso = t => toast(nombre && !String(t).includes(nombre) ? `${nombre} · ${t}` : t);
    const ui = {presets: estadosPresetFicha(), cambio: () => {}, toast: aviso};
    const borrar = controloFicha(fichaId);   // 🎮 el GM lo borra en vez de marcarlo
    let hubo = false;
    for(const d of de('recompensas')){
      if(!await Recibidos.tomar(d, borrar)) continue;
      const r = Recibidos.recompensa(S, d);
      if(r.partes.length) aviso(`🎁 ${r.partes.join(' · ')}`);
      const vueltas = Recibidos.textoVueltas(r.vueltas);
      if(vueltas) aviso(vueltas);
      hubo = true;
    }
    for(const d of de('estados')){
      if(!await Recibidos.tomar(d, borrar)) continue;
      Recibidos.estado(S, d, ui);
      hubo = true;
    }
    return hubo;
  });
}
/* Cambiar a un personaje desde el mapa y guardarlo (2026-10-02, A2/A3): con la sesión de la Botonera nueva si ya está abierta en ese
   personaje; si no, con una sesión de un rato (mantSesionTemporal) que se cierra al terminar. cambiar(S, {enBn}) puede ser async y
   devuelve true si cambió algo (se guarda) o false (no se toca nada). Se escriben solo las partes que cambió (lo que difiera por
   haberlo armado distinto, no) y el resumen público. → lo que devolvió cambiar, o null si no se pudo leer al personaje. */
async function editarPersonajeMapa(fichaId, cambiar){
  await bnCargarPiezas();
  const enBn = () => !!(bn && bn.fichaId === fichaId && bn.S && bn.sesion && bn.sesion.cargada);
  const tmp = enBn() ? null : await mantSesionTemporal(fichaId);
  if(!enBn() && !tmp) return null;
  try{
    const usarBn = !tmp && enBn();
    const S = usarBn ? bn.S : tmp.S;
    const antes = FichaGuardado.partes(S);
    const hubo = await cambiar(S, {enBn: usarBn});
    if(!hubo) return hubo;
    if(usarBn){ bnUi(antes).cambio(); return hubo; }
    const f = tmp.f;
    const despues = FichaGuardado.partes(S);
    Object.keys(despues).forEach(p => { if(despues[p] === antes[p] && despues[p] !== f.ultimo[p]) f.ultimo[p] = despues[p]; });
    f.soloLectura = false;
    const opts = opcionesGuardadoMapa(f, () => tmp.S, () => tmp.doc, () => tmp.vivo);
    for(let i = 0; i < 6 && FichaSesion.pendiente(f, () => FichaGuardado.partes(tmp.S)); i++){
      await FichaSesion.guardar(f, true, opts);
      if(FichaSesion.pendiente(f, () => FichaGuardado.partes(tmp.S))) await new Promise(r => setTimeout(r, 1500));
    }
    return hubo;
  }finally{
    if(tmp){ tmp.vivo = false; FichaSesion.cortar(tmp.f); }
  }
}
// Lee al personaje en vivo un rato (sin mostrarlo), como la Botonera nueva. → {f, S, doc, vivo} o null si no se pudo leer en 15 s.
async function mantSesionTemporal(fichaId){
  const f = FichaSesion.nueva(fichaId, '', false, true);
  const st = {f, S: null, doc: null, vivo: true};
  FichaSesion.escuchar(f, {
    db: fbDb, ruta: fbRutaCampana(`fichas/${fichaId}`), vigente: () => st.vivo,
    alDoc: doc => { st.doc = doc.exists ? doc.data() : null; if(st.doc) f.duenoUid = st.doc.duenoUid; },
    alCargar: armado => {
      const S = FichaGuardado.normalizar(armado.datos, {mezclarCatalogo: bnMezclarCatalogo}).S;
      FichaGuardado.ponerImagenesInvocaciones(S, armado.imgInvocaciones);
      FichaGuardado.completar(S);
      st.S = S;
      f.cargada = true;
    },
    alControl: c => { f.control = c; },
    aplicarParte: (parte, datos) => FichaGuardado.aplicarParte(st.S, parte, datos, {mezclarCatalogo: bnMezclarCatalogo, imgInvocaciones: f.ultimo.imgInvocaciones || ''}),
    alCambiar: () => FichaGuardado.completar(st.S),
    alErrorPartes: err => console.error('El mapa no pudo leer el personaje', err),
  });
  for(let i = 0; i < 150 && !st.S; i++) await new Promise(r => setTimeout(r, 100));
  if(!st.S){ st.vivo = false; FichaSesion.cortar(f); return null; }
  return st;
}
// Para el duelo: abre la sesión de ese personaje si hace falta y devuelve los ganchos (o null: va por el marco). No cambia de personaje
// si la Botonera nueva está a la vista con otro (no se le cambia lo que está mirando).
async function bnPrepararParaDuelo(fichaId, armar){
  if(!bnActiva() || !bnManejo(fichaId)) return null;
  if(bn && bn.host && !bn.host.hidden && bn.fichaId !== fichaId) return null;
  await bnCargarPiezas();
  bnAbrirSesion(fichaId);
  if(!(await bnSesionLista(fichaId))) return null;
  return armar();
}
/* ---------- 🛡 Equipo y mochila, hecho por el mapa (2026-10-02, hoja de ruta A4) ----------
   El 🛡 del token y el 🎒 de la ficha lite abrían la ventana de la ficha escondida en el marco. Ahora la muestra el mapa, adentro
   del recuadro de la Botonera nueva, con comun/ficha-equipo.js (la misma regla y la misma ventana que la ficha): equipar / sacar
   (en combate cuesta No2), «el slot está lleno: Reemplazar o Comparar», Ver y Editar (Editar va al editor de la ficha, A6). */
async function abrirEquipoMapa(fichaId){
  try{ await bnCargarPiezas(); }catch(err){ console.error(err); toast('No se pudo abrir Equipo y mochila'); return; }
  const yaVisible = bn && bn.host && !bn.host.hidden && bn.fichaId === fichaId && !bn.invId;
  if(!yaVisible) await abrirBotoneraNueva(fichaId, '');
  if(!bn) return;
  bn.soloEquipo = !yaVisible;   // si se abrió para esto, al cerrar el Equipo se cierra todo
  if(!(await bnSesionLista(fichaId))){ toast('No se pudo leer el personaje'); return; }
  bnEquipoDibujar();
  bn.raiz.querySelector('#bn-equipo').classList.add('open');
}
function bnEquipoDibujar(){
  if(!bn || !bn.S) return;
  bn.raiz.querySelector('#bn-equipo-cuerpo').innerHTML = FichaEquipo.html(bn.S, {lupa: true});
  if(bnComparando) bnCompararDibujar();
}
function bnEquipoCerrar(){
  if(!bn) return;
  ['#bn-equipo', '#bn-slot-lleno', '#bn-comparar'].forEach(s => bn.raiz.querySelector(s).classList.remove('open'));
  bnComparando = null;
  if(bn.soloEquipo){ bn.soloEquipo = false; cerrarBotoneraNueva(); }
}
// El ui de comun/ficha-equipo.js: cada acción guarda lo que cambió (bnUi) y redibuja la ventana.
function bnEquipoUi(){
  const antes = FichaGuardado.partes(bn.S), r = bn.raiz;
  return {
    toast: t => toast(t),
    avisarSinNitros: (costo, accion, continuar) => bnSinNitros(costo, accion, continuar),
    modoCombate: () => modoMapa === 'combate',
    slotLleno: it => {
      const cuerpo = FichaEquipo.slotLlenoHtml(bn.S, it);
      if(!cuerpo) return false;
      r.querySelector('#bn-slot-lleno-cuerpo').innerHTML = cuerpo;
      r.querySelector('#bn-slot-lleno').classList.add('open');
      return true;
    },
    cambio: (partes, o) => {
      if(o && o.reemplazo){ r.querySelector('#bn-slot-lleno').classList.remove('open'); r.querySelector('#bn-comparar').classList.remove('open'); bnComparando = null; }
      bnUi(antes).cambio();
      bnEquipoDibujar();
    },
  };
}
let bnComparando = null;   // {item, equipadoId}: un ítem de la mochila o del botín contra uno equipado
function bnCompararDibujar(){
  const c = bnComparando, it = c && ((bn.S.inventario || []).find(x => x.id === c.item.id) || c.item);
  const res = it && FichaEquipo.compararHtml(bn.S, it, c.equipadoId);
  if(!res){ bn.raiz.querySelector('#bn-comparar').classList.remove('open'); bnComparando = null; return; }
  c.equipadoId = res.equipadoId;
  bn.raiz.querySelector('#bn-comparar-cuerpo').innerHTML = res.html;
}
// Los clics de la ventana de Equipo (y de sus carteles). true si era de acá.
function bnEquipoClic(b){
  const r = bn.raiz;
  const enEquipo = !!b.closest('#bn-equipo, #bn-slot-lleno, #bn-comparar, #bn-botin');   // (la tienda: bnTiendaClic)
  if(enEquipo && Intercambio.clic(b, bn.fichaId)) return true;   // 🤝 Dar (comun/intercambio.js)
  if(b.dataset.bnEq){
    if(b.dataset.bnEq === 'cerrar') bnEquipoCerrar();
    else if(b.dataset.bnEq === 'botin-no') bnBotinCerrar();
    else if(b.dataset.bnEq === 'slot-no') r.querySelector('#bn-slot-lleno').classList.remove('open');
    else if(b.dataset.bnEq === 'comparar-no'){ r.querySelector('#bn-comparar').classList.remove('open'); bnComparando = null; }
    return true;
  }
  if(!enEquipo || !bn.S) return false;
  const soloLeer = () => { if(bnPuedeGuardar()) return false; toast('Ese personaje no lo manejás vos: solo se puede mirar'); return true; };
  if(b.dataset.toggle){ if(!soloLeer()) FichaEquipo.equipar(bn.S, b.dataset.toggle, bnEquipoUi()); return true; }
  if(b.dataset.amano){ if(!soloLeer()) FichaEquipo.alternarAMano(bn.S, b.dataset.amano, bnEquipoUi()); return true; }   // vaina o correa (2026-10-05)
  if(b.dataset.reemplazar){ if(!soloLeer()){ const [eqId, nuevoId] = b.dataset.reemplazar.split(':'); FichaEquipo.reemplazar(bn.S, eqId, nuevoId, bnEquipoUi()); } return true; }
  if(b.dataset.slotComparar){
    r.querySelector('#bn-slot-lleno').classList.remove('open');
    const it = (bn.S.inventario || []).find(x => x.id === b.dataset.slotComparar);
    if(!it) return true;
    bnComparando = {item: it, equipadoId: ''};
    bnCompararDibujar();
    if(bnComparando) r.querySelector('#bn-comparar').classList.add('open');
    return true;
  }
  // El botín (A5): sumar a la mochila, comparar, ver, ir a la mochila.
  if(b.dataset.botinTomar){
    const entrada = bnBotinLoot.find(x => x.docId === b.dataset.botinTomar), antes = FichaGuardado.partes(bn.S);
    FichaBotin.tomar(bn.S, entrada, {toast: t => toast(t), puede: () => bnPuedeGuardar(), cambio: () => { bnUi(antes).cambio(); bnBotinDibujar(); }});
    return true;
  }
  if(b.dataset.botinComparar){
    const entrada = bnBotinLoot.find(x => x.item.id === b.dataset.botinComparar);
    if(!entrada) return true;
    bnComparando = {item: entrada.item, equipadoId: ''};
    bnCompararDibujar();
    if(bnComparando) r.querySelector('#bn-comparar').classList.add('open');
    return true;
  }
  if(b.id === 'botin-loot-mochila'){ bnBotinCerrar(true); abrirEquipoMapa(bn.fichaId); return true; }
  if(b.dataset.view && b.closest('#bn-botin')){
    const entrada = bnBotinLoot.find(x => x.item.id === b.dataset.view.split(':')[1]);
    if(entrada) bnVerItemSuelto(entrada.item);
    return true;
  }
  if(b.dataset.compararElegir){ if(bnComparando){ bnComparando.equipadoId = b.dataset.compararElegir; bnCompararDibujar(); } return true; }
  if(b.dataset.edit){
    const [key, id] = b.dataset.edit.split(':');
    bnEditar(key, id);   // el editor común (A6b)
    return true;
  }
  return false;   // data-view (Ver) lo atiende el resto del recuadro
}
/* ---------- ⚔ El botín del combate, hecho por el mapa (2026-10-02, hoja de ruta A5) ----------
   La ventana «Batalla terminada» (lo que recibe cada jugador y los despojos para «Sumar a la mochila») la abría la ficha escondida.
   Ahora la muestra el mapa adentro del recuadro de la Botonera nueva, con comun/ficha-botin.js (lo mismo que la ficha). El combate
   lo escucha js/12 (combateMapa); el botín (`botin`) se escucha desde la primera vez que se abre. */
let bnBotinLoot = [], bnBotinEscucha = null;
function bnBotinEscuchar(){
  if(bnBotinEscucha || !fbDb) return;
  bnBotinEscucha = fbDb.collection(fbRutaCampana('botin')).onSnapshot(snap => { bnBotinLoot = FichaBotin.loot(snap); bnBotinDibujar(); },
    err => console.error('Error escuchando el botín:', err));
}
async function abrirBotinMapa(fichaId){
  if(!combatePublicado() && !(combateMapa && (combateMapa.jugadores || []).length)){ toast('No hay botín publicado'); return; }
  try{ await bnCargarPiezas(); }catch(err){ console.error(err); toast('No se pudo abrir el botín'); return; }
  bnBotinEscuchar();
  const yaVisible = bn && bn.host && !bn.host.hidden && bn.fichaId === fichaId && !bn.invId;
  if(!yaVisible) await abrirBotoneraNueva(fichaId, '');
  if(!bn) return;
  bn.soloBotin = !yaVisible;
  if(!(await bnSesionLista(fichaId))){ toast('No se pudo leer el personaje'); return; }
  bn.raiz.querySelector('#bn-botin').classList.add('open');
  bnBotinDibujar();
}
function bnBotinDibujar(){
  if(!bn || !bn.S || !bn.raiz.querySelector('#bn-botin').classList.contains('open')) return;
  bn.raiz.querySelector('#bn-botin-cuerpo').innerHTML = FichaBotin.html(bn.S, {combate: combateMapa, loot: bnBotinLoot, puede: bnPuedeGuardar(), fichaId: bn.fichaId});
}
// seguir: no cerrar la Botonera aunque se haya abierto para esto (se pasa a otra ventana del recuadro, la mochila).
function bnBotinCerrar(seguir){
  if(!bn) return;
  bn.raiz.querySelector('#bn-botin').classList.remove('open');
  if(bn.soloBotin){ bn.soloBotin = false; if(seguir) bn.host.hidden = true; else cerrarBotoneraNueva(); }
}
// El GM cerró el botín (js/12, escucharBotinParaJugador): la ventana se cierra.
function bnBotinCombateCerrado(){
  if(!bn || !bn.raiz.querySelector('#bn-botin').classList.contains('open')) return false;
  bnBotinCerrar();
  return true;
}
// El «Ver» de un ítem que no es del personaje (uno del botín): la misma tarjeta, sin Editar ni Eliminar.
function bnVerItemSuelto(it){
  const v = FichaLupa.ver(bn.S, 'catalogo', it), r = bn.raiz;
  bnViendo = null;
  r.querySelector('#bn-ver-titulo').textContent = v.titulo;
  r.querySelector('#bn-ver-cuerpo').innerHTML = v.html;
  r.querySelector('[data-bn-ver="editar"]').style.display = 'none';
  r.querySelector('[data-bn-ver="borrar"]').style.display = 'none';
  r.querySelector('#bn-ver').classList.add('open');
}
/* ---------- 🪙 La Moneda Re-Roll, hecha por el mapa (2026-10-02, hoja de ruta A6a) ----------
   El 🪙 fijo del mapa abría la ventana de la ficha escondida. Ahora la muestra el mapa adentro del recuadro de la Botonera nueva, con
   comun/ficha-duelo.js (rerollHtml, usarReroll: lo mismo que la ficha) y "mis últimas tiradas" de la Mesa (comun/tiradas-propias.js,
   escuchadas mientras la ventana está abierta). */
let bnRerollLista = [], bnRerollEscucha = null;
async function abrirRerollMapa(fichaId){
  try{ await bnCargarPiezas(); }catch(err){ console.error(err); toast('No se pudo abrir la Moneda Re-Roll'); return; }
  const yaVisible = bn && bn.host && !bn.host.hidden && bn.fichaId === fichaId && !bn.invId;
  if(!yaVisible) await abrirBotoneraNueva(fichaId, '');
  if(!bn) return;
  bn.soloReroll = !yaVisible;
  if(!(await bnSesionLista(fichaId))){ toast('No se pudo leer el personaje'); return; }
  if(bnRerollEscucha) bnRerollEscucha();
  bnRerollLista = [];
  bnRerollEscucha = TiradasPropias.escuchar(fbDb, fbRutaCampana('tiradas'), fichaId, ((bn.S.meta && bn.S.meta.nombre) || '').trim(), lista => { bnRerollLista = lista; bnRerollDibujar(); });
  bn.raiz.querySelector('#bn-reroll').classList.add('open');
  bnRerollDibujar();
}
function bnRerollDibujar(){
  if(!bn || !bn.S || !bn.raiz.querySelector('#bn-reroll').classList.contains('open')) return;
  const r = FichaDuelo.rerollHtml(bn.S, bnRerollLista);
  bn.raiz.querySelector('#bn-reroll-aviso').innerHTML = r.aviso;
  bn.raiz.querySelector('#bn-reroll-lista').innerHTML = r.filas;
}
/* ---------- ✎ El editor de la ficha, hecho por el mapa (2026-10-02, hoja de ruta A6b, docs/plan-a6b-editor.md) ----------
   El Editar del Ver y del Equipo abrían el editor de la ficha escondida ('editar-en-ficha'). Ahora es el editor común
   (comun/ficha-editor.js: el mismo formulario, el paso a paso de las habilidades, el asistente de ítems, la trampa y la Ejecución ✨),
   adentro del recuadro de la Botonera nueva (#bn-editor). Guardar pasa por bnUi (las partes que cambiaron y el resumen). Los estados de
   la lista (para "estado al usar" y para la Ejecución) se eligen con el selector común (comun/selector-estados.js). */
const ED_PIEZAS = ['../comun/ficha-editor.js?v=20261008zs', '../comun/asistente-item.js?v=20261008q', '../comun/asistente-duelo-hab.js?v=20261008q'];
let bnTipoItemResolver = null;
// op.comoGM: el GM sin el control (el ⚙ de un estado del HUD, como hacía la ficha con "Editar como GM"). → true si se abrió.
async function bnEditar(key, id, op = {}){
  if(!bn || !bn.S) return false;
  const comoGM = !bnPuedeGuardar() && soyGM && !!op.comoGM;
  if(!bnPuedeGuardar() && !comoGM){ toast('Ese personaje no lo manejás vos: solo se puede mirar'); return false; }
  try{ await bnCargarPiezas(); await cargarPiezas(SE_PIEZAS); await cargarPiezas(ED_PIEZAS); }
  catch(err){ console.error(err); toast('No se pudo abrir el editor'); return; }
  if(!bn.editor) bn.editor = bnCrearEditor();
  bn.editorComoGM = comoGM;
  bn.editorAntes = FichaGuardado.partes(bn.S);
  bn.editor.abrir(key, id);
  return true;
}
// El ⚙ de un estado del HUD (A6b-b5): su editor, el común, en el mapa. Si la Botonera nueva no estaba a la vista, se abre solo para esto.
async function abrirEditarEstadoMapa(fichaId, nombre){
  try{ await bnCargarPiezas(); }catch(err){ console.error(err); toast('No se pudo abrir el editor'); return; }
  const yaVisible = bn && bn.host && !bn.host.hidden && bn.fichaId === fichaId && !bn.invId;
  if(!yaVisible) await abrirBotoneraNueva(fichaId, '');
  if(!bn) return;
  bn.soloEditor = !yaVisible;
  const cerrarSiSolo = () => { if(bn.soloEditor){ bn.soloEditor = false; cerrarBotoneraNueva(); } };
  if(!(await bnSesionLista(fichaId))){ toast('No se pudo leer el personaje'); cerrarSiSolo(); return; }
  const ef = (bn.S.efectos || []).find(x => x && x.activo !== false && x.nombre === nombre);
  if(!ef){ toast('No encontré ese estado en la ficha'); cerrarSiSolo(); return; }
  if(!(await bnEditar('efectos', ef.id, {comoGM: true}))) cerrarSiSolo();
}
// Elegir un estado de la lista (el selector común, con los "Mis presets" del personaje). → {preset, guardar} o null.
async function bnElegirEstadoLista(){
  const r = await SelectorEstados.abrir({
    titulo: 'Estado alterado', para: (bn.S.meta && bn.S.meta.nombre) || '',
    presets: estadosPresetFicha(), propios: bn.S.efectosPersonalizados || [],
    cfgPreguntas: {hp: 'hpturno', statLabel: id => FichaCalculo.STAT_LABEL[id] || id},
    stats: seStatsFicha(),
    armarDeAsistente: res => ({nombre: res.nombre, polaridad: res.polaridad, turnos: res.turnos, permanente: res.permanente, stacks: 1, hpturno: res.hp, stacksturno: 0,
      escudoMagico: res.escudo, mods: res.mods, detalle: res.detalle, popup: false, ...res.flags, ...(res.forzarNitros !== undefined ? {forzarNitros: res.forzarNitros} : {})}),
  });
  if(r && r.guardar){
    bn.S.efectosPersonalizados = bn.S.efectosPersonalizados || [];
    const i = bn.S.efectosPersonalizados.findIndex(p => p.nombre === r.preset.nombre);
    if(i >= 0) bn.S.efectosPersonalizados[i] = r.preset; else bn.S.efectosPersonalizados.push(r.preset);
  }
  return r;
}
function bnCrearEditor(){
  // Las ventanas paso a paso del editor se abren adentro del recuadro aislado de la Botonera nueva.
  return FichaEditor.crear(bn.raiz, {
    S: () => bn.S,
    toast: m => toast(m),
    confirmar: t => confirm(t),
    // Se guardó o se borró algo: se guarda (solo lo que cambió) y se redibuja lo que esté abierto.
    alCambiar: () => {
      bnUi(bn.editorAntes || FichaGuardado.partes(bn.S), bn.editorComoGM).cambio();
      bn.editorAntes = FichaGuardado.partes(bn.S);
      if(bn.raiz.querySelector('#bn-equipo').classList.contains('open')) bnEquipoDibujar();
    },
    elegirTipoItem: actual => new Promise(resolve => {
      bnTipoItemResolver = resolve;
      bn.raiz.querySelector('#bn-tipoitem-cuerpo').innerHTML = FichaEditor.tipoItemHtml(actual);
      bn.raiz.querySelector('#bn-tipoitem').classList.add('open');
    }),
    elegirEstadoItem: async () => {
      const r = await bnElegirEstadoLista();
      if(!r) return null;
      return {nombre: r.preset.nombre, armado: r.preset, estandar: estadosPresetFicha().some(p => p.nombre === r.preset.nombre), detalle: r.preset.detalle};
    },
    // Para la Ejecución ✨ (comun/asistente-duelo-hab.js): lo mismo que el elegirEstadoDuelo de la ficha.
    elegirEstadoDuelo: async () => {
      const r = await bnElegirEstadoLista();
      if(!r) return null;
      const p = r.preset;
      return {modo: 'preset', nombre: p.nombre, turnos: p.turnos, permanente: !!p.permanente, hp: num(p.hpturno), mods: p.mods, stacks: p.stacks, escudoMagico: num(p.escudoMagico), polaridad: p.polaridad, detalle: p.detalle};
    },
    alSubirCatalogo: () => ItemsSubidos.cargar().then(l => { bnItemsSubidos = l || []; }),
    // Abierto solo para editar (el ⚙ de un estado): al cerrarse, se cierra también la Botonera (la sesión sigue: lo guardado se sube igual).
    alCerrar: () => { if(bn.soloEditor){ bn.soloEditor = false; setTimeout(() => cerrarBotoneraNueva(), 0); } },
  });
}
function bnTipoItemCerrar(valor){
  if(bn) bn.raiz.querySelector('#bn-tipoitem').classList.remove('open');
  const res = bnTipoItemResolver;
  bnTipoItemResolver = null;
  if(res) res(valor);
}
/* ---------- ✚ Revivir, hecho por el mapa (2026-10-02, hoja de ruta A6b) ----------
   El ✚ Revivir de la pantalla de muerte del mapa abría el diálogo de la ficha escondida ('abrir-revivir'). Ahora lo muestra el mapa adentro
   del recuadro de la Botonera nueva, con la misma cuenta (FichaAcciones.hpRevivir / revivir). */
let bnRevivirModo = 'pct';
async function abrirRevivirMapa(fichaId){
  try{ await bnCargarPiezas(); }catch(err){ console.error(err); toast('No se pudo abrir Revivir'); return; }
  const yaVisible = bn && bn.host && !bn.host.hidden && bn.fichaId === fichaId && !bn.invId;
  if(!yaVisible) await abrirBotoneraNueva(fichaId, '');
  if(!bn) return;
  bn.soloRevivir = !yaVisible;
  if(!(await bnSesionLista(fichaId))){ toast('No se pudo leer el personaje'); return; }
  bnRevivirModo = 'pct';
  bn.raiz.querySelector('#bn-rv-pct').value = 50;
  bn.raiz.querySelector('#bn-revivir').classList.add('open');
  bnRevivirDibujar();
}
function bnRevivirCuenta(){ const r = bn.raiz; return FichaAcciones.hpRevivir(bn.S, bnRevivirModo, r.querySelector('#bn-rv-pct').value, r.querySelector('#bn-rv-valor').value); }
function bnRevivirDibujar(){
  if(!bn || !bn.S || !bn.raiz.querySelector('#bn-revivir').classList.contains('open')) return;
  const r = bn.raiz;
  r.querySelector('[data-bn-rv="pct"]').classList.toggle('primary', bnRevivirModo === 'pct');
  r.querySelector('[data-bn-rv="valor"]').classList.toggle('primary', bnRevivirModo === 'valor');
  r.querySelector('#bn-rv-campo-pct').style.display = bnRevivirModo === 'pct' ? '' : 'none';
  r.querySelector('#bn-rv-campo-valor').style.display = bnRevivirModo === 'valor' ? '' : 'none';
  const {hpmax, val} = bnRevivirCuenta();
  r.querySelector('#bn-rv-preview').textContent = `Revive con ${fmt(val)} / ${fmt(hpmax)} HP`;
}
function bnRevivirCerrar(){
  if(!bn) return;
  bn.raiz.querySelector('#bn-revivir').classList.remove('open');
  if(bn.soloRevivir){ bn.soloRevivir = false; cerrarBotoneraNueva(); }
}
function bnRerollCerrar(){
  if(!bn) return;
  bn.raiz.querySelector('#bn-reroll').classList.remove('open');
  if(bnRerollEscucha){ bnRerollEscucha(); bnRerollEscucha = null; }
  if(bn.soloReroll){ bn.soloReroll = false; cerrarBotoneraNueva(); }
}
/* ---------- 📊 Stats, hecho por el mapa (2026-10-02, hoja de ruta A6a) ----------
   El 📊 de la ficha lite abría la ventana de Stats de la ficha escondida. Ahora la muestra el mapa adentro del recuadro de la Botonera
   nueva, con comun/ficha-stats.js (lo mismo que la ficha): los cinco atributos con sus derivados, el desglose de cada stat, las
   fórmulas, el 🎲 de cada uno y cambiar el valor de un atributo (la vida y los No2 siguen a su máximo). */
let bnStatsAbierto = null;
async function abrirStatsMapa(fichaId){
  try{ await bnCargarPiezas(); }catch(err){ console.error(err); toast('No se pudo abrir Stats'); return; }
  const yaVisible = bn && bn.host && !bn.host.hidden && bn.fichaId === fichaId && !bn.invId;
  if(!yaVisible) await abrirBotoneraNueva(fichaId, '');
  if(!bn) return;
  bn.soloStats = !yaVisible;
  if(!(await bnSesionLista(fichaId))){ toast('No se pudo leer el personaje'); return; }
  bnStatsAbierto = null;
  bn.raiz.querySelector('#bn-stats').classList.add('open');
  bnStatsDibujar();
}
function bnStatsDibujar(){
  if(!bn || !bn.S || !bn.raiz.querySelector('#bn-stats').classList.contains('open')) return;
  bn.raiz.querySelector('#bn-stats-puntos').innerHTML = FichaStats.puntosHtml(bn.S);
  bn.raiz.querySelector('#bn-stats-attrs').innerHTML = FichaStats.atributosHtml(bn.S, bnStatsAbierto);
}
function bnStatsCerrar(){
  if(!bn) return;
  bn.raiz.querySelector('#bn-stats').classList.remove('open');
  if(bn.soloStats){ bn.soloStats = false; cerrarBotoneraNueva(); }
}
/* ---------- 🏪 La tienda, hecha por el mapa (2026-10-02, hoja de ruta A5) ----------
   El 🏪 del borde y la ficha lite abrían la tienda de la ficha escondida en el marco. Ahora la muestra el mapa adentro del recuadro de
   la Botonera nueva, con comun/ficha-tienda.js (la misma regla y la misma ventana que la ficha): el catálogo del vendedor con sus
   filtros y orden, el carrito y Comprar, Vender, Reparación (si es herrero), el ítem al azar, Ver y Comparar. Mientras está abierta,
   los cambios del GM (otra tienda, cerrarla) llegan solos. */
const bnTiendaSt = {tienda: null, carrito: [], venderSel: {}, verCompleto: false, seccion: ''};   // como FichaTienda.nueva()
// El filtro (comun/filtro-catalogo.js, 2026-10-08): búsqueda, chips con cuántos quedan, «🟢 Lugar libre», orden y «Más filtros». Se arma la primera vez.
let bnTiendaFiltro = null, bnTiendaFiltroCont = null;
Object.defineProperty(bnTiendaSt, 'filtro', {get(){ return bnTiendaFiltro ? bnTiendaFiltro.f : FiltroCatalogo.vacio(); }});
function bnFiltroTienda(){
  const cont = bn && bn.raiz.querySelector('#bn-tienda-filtros');
  if(!cont) return null;
  if(!bnTiendaFiltro || bnTiendaFiltroCont !== cont) bnTiendaFiltroCont = cont, bnTiendaFiltro = FiltroCatalogo.crear(cont, {
    base: () => bn && bn.S ? FichaTienda.base(bn.S, bnTiendaSt) : [], precio: it => FichaTienda.precioDeCompra(bnTiendaSt, it),
    libre: it => bn && bn.S ? FichaTienda.libre(bn.S, it) : null, calidad: FichaEquipo.veCalidad(), clave: 'tienda', alCambiar: () => bnTiendaDibujar()});   // los jugadores no ven la calidad; el GM sí
  return bnTiendaFiltro;
}
let bnTiendaEscucha = null;
async function abrirTiendaMapa(fichaId){
  try{ await bnCargarPiezas(); }catch(err){ console.error(err); toast('No se pudo abrir la tienda'); return; }
  let tienda = null;
  try{ await FichaTienda.leerStock(); tienda = FichaTienda.desdeDoc(await fbDb.doc(fbRutaCampana('tienda/publicada')).get()); }   // con lo que queda en stock (2026-10-07)
  catch(err){ console.error('No se pudo mirar la tienda:', err); toast('No se pudo abrir la tienda'); return; }
  if(!tienda || !tienda.abierta){ toast('Tienda cerrada'); return; }
  const yaVisible = bn && bn.host && !bn.host.hidden && bn.fichaId === fichaId && !bn.invId;
  if(!yaVisible) await abrirBotoneraNueva(fichaId, '');
  if(!bn) return;
  bn.soloTienda = !yaVisible;
  if(!(await bnSesionLista(fichaId))){ toast('No se pudo leer el personaje'); return; }
  Object.assign(bnTiendaSt, {tienda, carrito: [], venderSel: {}, verCompleto: false, seccion: ''});
  bn.raiz.querySelector('#bn-tienda').classList.add('open');
  const fc0 = bnFiltroTienda(); if(fc0) fc0.limpiar();
  bnTiendaDibujar();
  toast(`${tienda.nombre || 'Tienda'} · ${fmt(tienda.items.length)} ítems`);
  bnTiendaEscuchar();
}
let bnTiendaStockEscucha = null;
function bnTiendaEscuchar(){
  if(bnTiendaEscucha) return;
  // Piezas únicas (2026-10-07): cuando alguien compra, lo comprado sale y llega su reposición.
  if(!bnTiendaStockEscucha) bnTiendaStockEscucha = FichaTienda.escucharStock(() => {
    if(!bnTiendaSt.tienda) return;
    FichaTienda.conStock(bnTiendaSt.tienda);
    bnTiendaSt.carrito = bnTiendaSt.carrito.filter(e => bnTiendaSt.tienda.items.includes(e.catId));
    bnTiendaDibujar();
  });
  let primera = true;
  bnTiendaEscucha = fbDb.doc(fbRutaCampana('tienda/publicada')).onSnapshot(snap => {
    if(primera){ primera = false; return; }   // es la misma que se acaba de abrir
    if(!bnTiendaSt.tienda){ bnTiendaDejar(); return; }
    const nueva = FichaTienda.desdeDoc(snap);
    if(!nueva || !nueva.abierta){ bnTiendaCerrar(); toast('El GM cerró la tienda'); return; }
    bnTiendaSt.tienda = nueva;
    const antes = bnTiendaSt.carrito.length;
    bnTiendaSt.carrito = bnTiendaSt.carrito.filter(e => nueva.items.includes(e.catId));   // lo que ya no se vende sale del carrito
    bnTiendaDibujar();
    const quitados = antes - bnTiendaSt.carrito.length;
    toast('El GM cambió la tienda' + (quitados ? ` · ${fmt(quitados)} ítem(s) salieron del carrito` : ''));
  }, err => console.error('No se pudo escuchar la tienda:', err));
}
function bnTiendaDejar(){
  if(bnTiendaEscucha){ bnTiendaEscucha(); bnTiendaEscucha = null; }
  if(bnTiendaStockEscucha){ bnTiendaStockEscucha(); bnTiendaStockEscucha = null; }
}
function bnTiendaDibujar(){
  if(!bn || !bn.S || !bn.raiz.querySelector('#bn-tienda').classList.contains('open')) return;
  const r = bn.raiz, st = bnTiendaSt, t = st.tienda;
  r.querySelector('#bn-tienda-titulo').textContent = `🏪 ${(t && t.nombre) || 'Tienda'}`;   // (2026-10-08: el título, más claro)
  r.querySelector('#bn-tienda-badge').textContent = FichaTienda.badge(st);
  r.querySelector('#bn-tienda-reparar').style.display = t && t.herrero ? '' : 'none';   // solo las tiendas con herrero reparan
  r.querySelector('#bn-tienda-secciones').innerHTML = FichaTienda.seccionesHtml(bn.S, st);   // las pestañas (antes que el filtro: deciden qué hay)
  const fc = bnFiltroTienda();
  if(fc) fc.actualizar();   // lo que vende pudo cambiar (el GM cambió la tienda, se compró una pieza única)
  r.querySelector('#bn-tienda-cuerpo').innerHTML = FichaTienda.catalogoHtml(bn.S, st, {gestion: false});
  r.querySelector('#bn-tienda-dde').textContent = fmt(num(bn.S.meta.dde));
  if(typeof Intercambio !== 'undefined') Intercambio.pintarBotonBaul(r.querySelector('[data-bn-ti="baul"]'));   // en combate, apagado y lo dice
  const c = FichaTienda.carrito(bn.S, st);
  r.querySelector('#bn-carrito-lista').innerHTML = c.html;
  r.querySelector('#bn-carrito-total').textContent = fmt(c.total);
  const comprar = r.querySelector('#bn-carrito-comprar');
  comprar.disabled = !st.carrito.length || !c.puede;
  comprar.title = c.falta > 0 ? `Te faltan ${fmt(c.falta)} DDE` : '';
}
function bnTiendaCerrar(){
  if(!bn) return;
  ['#bn-tienda', '#bn-vender', '#bn-reparar', '#bn-aleatorio'].forEach(s => bn.raiz.querySelector(s).classList.remove('open'));
  bnTiendaSt.tienda = null; bnTiendaSt.carrito = []; bnTiendaSt.venderSel = {};
  bnTiendaDejar();
  if(bn.soloTienda){ bn.soloTienda = false; cerrarBotoneraNueva(); }
}
const bnEnCombate = () => modoMapa === 'combate';
function bnRepararDibujar(){
  const r = bn.raiz, res = FichaTienda.repararHtml(bn.S, bnTiendaSt, bnEnCombate());
  r.querySelector('#bn-reparar-cuerpo').innerHTML = res.html;
  r.querySelector('#bn-reparar-total').innerHTML = res.total;
  r.querySelector('#bn-reparar-todo').disabled = bnEnCombate() || !res.totalPts;
}
// Los clics de la tienda (y de sus carteles). true si eran de acá.
function bnTiendaClic(b){
  const r = bn.raiz, st = bnTiendaSt;
  if(!b.closest('#bn-tienda, #bn-vender, #bn-reparar, #bn-aleatorio')) return false;
  if(!bn.S) return true;
  const puede = () => { if(bnPuedeGuardar()) return true; toast('Ese personaje no lo manejás vos: solo se puede mirar'); return false; };
  // El ui de comun/ficha-tienda.js: guarda lo que cambió (bnUi) y redibuja.
  const ui = antes => ({toast: t => toast(t), cambio: () => { bnUi(antes).cambio(); bnTiendaDibujar(); }});
  const qty = id => { const el = r.querySelector(`#bn-tienda [data-catqty="${id}"]`); return Math.max(1, num(el ? el.value : 1)); };
  const a = b.dataset.bnTi;
  if(a === 'cerrar'){ bnTiendaCerrar(); return true; }
  if(a === 'baul'){ Intercambio.abrirBaul(bn.fichaId); return true; }   // 📦 el baúl común (comun/intercambio.js)
  if(b.dataset.tiendaSeccion){ FichaTienda.elegirSeccion(st, b.dataset.tiendaSeccion); bnTiendaDibujar(); return true; }   // una pestaña (P179)
  if(a === 'vaciar'){ st.carrito = []; bnTiendaDibujar(); return true; }
  if(a === 'comprar'){ if(puede()) FichaTienda.comprar(bn.S, st, ui(FichaGuardado.partes(bn.S))).then(() => bnTiendaDibujar()); else bnTiendaDibujar(); return true; }
  if(a === 'aleatorio'){
    const it = FichaTienda.aleatorio(bn.S, st);
    if(!it){ toast('No hay ítems que coincidan con los filtros activos'); return true; }
    r.querySelector('#bn-aleatorio-cuerpo').innerHTML = `<div class="cat-grid">${FichaTienda.rowHtml(bn.S, st, it, {gestion: false})}</div>`;
    r.querySelector('#bn-aleatorio').classList.add('open');
    return true;
  }
  if(a === 'aleatorio-no'){ r.querySelector('#bn-aleatorio').classList.remove('open'); return true; }
  if(a === 'vender'){
    st.venderSel = {};
    r.querySelector('#bn-vender-cuerpo').innerHTML = FichaTienda.venderHtml(bn.S, st);
    r.querySelector('#bn-vender-total').innerHTML = `Vas a cobrar: <b>${fmt(FichaTienda.totalVenta(bn.S, st))} DDE</b>`;
    r.querySelector('#bn-vender').classList.add('open');
    return true;
  }
  if(a === 'vender-no'){ r.querySelector('#bn-vender').classList.remove('open'); return true; }
  if(a === 'vender-si'){ if(puede() && FichaTienda.vender(bn.S, st, ui(FichaGuardado.partes(bn.S)))) r.querySelector('#bn-vender').classList.remove('open'); return true; }
  if(a === 'reparar'){
    if(!st.tienda || !st.tienda.herrero){ toast('Esta tienda no tiene herrero'); return true; }
    bnRepararDibujar();
    r.querySelector('#bn-reparar').classList.add('open');
    return true;
  }
  if(a === 'reparar-no'){ r.querySelector('#bn-reparar').classList.remove('open'); return true; }
  const reparar = pares => { if(!puede()) return; const antes = FichaGuardado.partes(bn.S); FichaTienda.reparar(bn.S, st, pares, bnEnCombate(), {toast: t => toast(t), cambio: () => { bnUi(antes).cambio(); bnTiendaDibujar(); bnRepararDibujar(); }}); };
  if(a === 'reparar-todo'){ reparar(FichaTienda.aReparar(bn.S).map(x => ({it: x.it, pts: x.faltan}))); return true; }
  if(b.dataset.rep){
    const [id, n] = b.dataset.rep.split(':');
    const it = (bn.S.inventario || []).find(x => x.id === id);
    if(it) reparar([{it, pts: Math.max(1, Math.round(num(n)))}]);
    return true;
  }
  if(b.dataset.catalogocarrito){ FichaTienda.agregarAlCarrito(bn.S, st, b.dataset.catalogocarrito, qty(b.dataset.catalogocarrito), {toast: t => toast(t), cambio: () => {}}); bnTiendaDibujar(); return true; }
  if(b.dataset.catalogoadd){ if(puede()) FichaTienda.agregarGratis(bn.S, st, b.dataset.catalogoadd, qty(b.dataset.catalogoadd), ui(FichaGuardado.partes(bn.S))); return true; }
  if(b.dataset.carritorm){ FichaTienda.quitarDelCarrito(st, b.dataset.carritorm); bnTiendaDibujar(); return true; }
  if(b.dataset.comparar){
    const it = FichaTienda.itemCatalogo(bn.S, st, b.dataset.comparar);
    if(!it) return true;
    bnComparando = {item: it, equipadoId: ''};
    bnCompararDibujar();
    if(bnComparando) r.querySelector('#bn-comparar').classList.add('open');
    return true;
  }
  if(b.dataset.view){
    const it = FichaTienda.itemCatalogo(bn.S, st, b.dataset.view.split(':')[1]);
    if(it) bnVerItemSuelto(it);
    return true;
  }
  return true;
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
  const abiertos = [...bn.raiz.querySelectorAll('.scrim.open')], cartel = abiertos[abiertos.length - 1];   // el de más arriba
  if(cartel && cartel.id === 'bn-equipo'){ bnEquipoCerrar(); return; }
  if(cartel && cartel.id === 'bn-botin'){ bnBotinCerrar(); return; }
  if(cartel && cartel.id === 'bn-tienda'){ bnTiendaCerrar(); return; }
  if(cartel && cartel.id === 'bn-stats'){ bnStatsCerrar(); return; }
  if(cartel && cartel.id === 'bn-reroll'){ bnRerollCerrar(); return; }
  if(cartel && cartel.id === 'bn-tipoitem'){ bnTipoItemCerrar(null); return; }
  if(cartel && cartel.id === 'bn-revivir'){ bnRevivirCerrar(); return; }
  if(cartel){ cartel.classList.remove('open'); if(cartel.id === 'bn-comparar') bnComparando = null; bnViendo = null; bnCostoX = null; bnSobrepeso = null; bnSinNitrosSeguir = null; return; }
  cerrarBotoneraNueva();
});

