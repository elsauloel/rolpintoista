// js/13-tokens-portal-duelo.js — tramo 13 de 14 del script de mapa.html (paso 5, nivel A: mismo código, en el mismo orden): botón de tokens, portal, zonas de habilidad, duelo, hechizos de área, dodge, muerte.
/* ---------- Tokens: botón del borde izquierdo (🎭) ----------
   Jugador: abre directo la ventana de "Nuevo token". GM: un menú con "Nuevo token", "Traer tokens de jugadores" y "Traer los creeps de
   este mapa" (los que GM Tools tiene en este mapa: comun/creeps-mapas.js). Los tokens salen en fila, en el centro de lo que se ve,
   saltean los que ya están, y los de creeps nacen ocultos (comun/tokens-auto.js). */
// Los creeps (públicos) que están en ese mapa: [[id, creep]].
function creepsDelMapa(mapaId){
  const ids = new Set([...mapasLista.keys(), MAPA_PRINCIPAL]);
  return [...creepsPub.entries()].filter(([, c]) => CreepsMapas.mapaDe(c, ids) === mapaId);
}
async function traerCreepsDelMapa(mapaId){
  mapaId = mapaId || mapaMostrado;
  const lista = creepsDelMapa(mapaId).map(([id, c]) => ({nombre: c.nombre, color: c.color, tipo: 'creep', fichaId: id, oculto: true}));
  if(!lista.length){ toast(`«${nombreMapa(mapaId)}» no tiene creeps: ubicalos desde GM Tools («🗺 Mover a…»)`); return; }
  try{
    const r = await TokensAuto.crear(lista, {mapaId, ...(mapaId === mapaMostrado ? {centro: centroDeLaVista()} : {})});
    toast(r.creados ? `👹 ${r.creados} token(s) de creeps en «${nombreMapa(mapaId)}», ocultos a los jugadores${r.salteados ? ` · ${r.salteados} ya estaban` : ''}` : `Todos los creeps de «${nombreMapa(mapaId)}» ya tienen su token`);
  }catch(err){
    console.error('No se pudieron traer los tokens de creeps:', err);
    toast('No se pudieron crear los tokens' + (err.code === 'permission-denied' ? ' (sin permiso)' : ''));
  }
}
// Un token de un creep apareció en este mapa (creado a mano o vinculado): el creep pasa a este mapa y su token se va de los demás,
// como una piedrita (comun/creeps-mapas.js). Solo el GM.
async function creepLlegoAlMapa(creepId){
  const c = creepsPub.get(creepId);
  if(!soyGM || !c || c.mapa === mapaMostrado) return;
  try{
    await modificarCreep(creepId, sc => { sc.mapa = mapaMostrado; });
    const r = await CreepsMapas.mudarTokens({id: creepId, nombre: c.nombre, color: c.color}, mapaMostrado);
    toast(`🗺 ${c.nombre} pasó a «${nombreMapa(mapaMostrado)}»${r.borrados ? ' (su token se fue del otro mapa)' : ''}`);
  }catch(err){ console.error('No se pudo mudar el creep a este mapa:', err); }
}
async function traerTokensDeJugadores(){
  const fichas = [...fichasPub.entries()].filter(([id]) => !String(id).includes(SEP_INVOCACION));
  if(!fichas.length){ toast('Todavía no hay personajes en la partida'); return; }
  if(!confirm(`Se crean los tokens (visibles) de estos personajes, en fila, en el centro de lo que ves. Los que ya tienen token en este mapa se saltean:\n\n${fichas.map(([, f]) => f.nombre).join(', ')}`)) return;
  try{
    const items = fichas.map(([id, f], i) => ({nombre: f.nombre, color: COLORES[i % COLORES.length], tipo: 'pj', fichaId: id, duenoUid: f.duenoUid, oculto: false}));
    const r = await TokensAuto.crear(items, {mapaId: mapaMostrado, centro: centroDeLaVista()});
    toast(r.creados ? `👥 ${r.creados} token(s) de jugadores creados${r.salteados ? ` · ${r.salteados} ya estaban` : ''}` : 'Todos los personajes ya tienen token en este mapa');
  }catch(err){
    console.error('No se pudieron traer los tokens de jugadores:', err);
    toast('No se pudieron crear los tokens' + (err.code === 'permission-denied' ? ' (sin permiso)' : ''));
  }
}
function renderTokensMenu(){
  const n = creepsDelMapa(mapaMostrado).length;
  $('#tokens-menu').innerHTML =
    `<div class="tm-tit"><span>🎭 Tokens</span></div>` +
    '<button type="button" class="btn primary chico" data-tm="nuevo" style="text-align:left">＋ Token nuevo</button>' +
    '<button type="button" class="btn chico" data-tm="jugadores" style="text-align:left" title="Crea los tokens de los personajes que todavía no tienen token en este mapa">👥 Traer tokens de jugadores</button>' +
    `<button type="button" class="btn chico" data-tm="creeps" style="text-align:left" title="Crea (ocultos) los tokens de los creeps que GM Tools tiene en este mapa; los que ya tienen se saltean"${n ? '' : ' disabled'}>👹 Traer los creeps de este mapa (${n})</button>` +
    (n ? '' : '<div class="hint" style="margin-top:4px">Este mapa no tiene creeps: ubicalos desde GM Tools («🗺 Mover a…»).</div>');
}
function abrirTokensMenu(abrir){
  const menu = $('#tokens-menu');
  menu.hidden = !abrir;
  $('#toolkit-tokens').classList.toggle('activo', abrir);
  if(abrir){ renderTokensMenu(); if(mapasMenuAbierto) abrirMapasMenu(false); }
}
$('#toolkit-tokens').onclick = e => {
  e.stopPropagation();
  if(!soyGM){ $('#btn-nuevo').click(); return; }   // jugador: directo a "Nuevo token"
  abrirTokensMenu($('#tokens-menu').hidden);
};
$('#tokens-menu').addEventListener('click', e => {
  e.stopPropagation();
  const b = e.target.closest('[data-tm]');
  if(!b) return;
  const que = b.dataset.tm;
  if(que === 'nuevo'){ abrirTokensMenu(false); $('#btn-nuevo').click(); }
  else if(que === 'jugadores'){ abrirTokensMenu(false); traerTokensDeJugadores(); }
  else if(que === 'creeps'){ abrirTokensMenu(false); traerCreepsDelMapa(mapaMostrado); }
});
document.addEventListener('mousedown', e => { if(!$('#tokens-menu').hidden && !e.target.closest('#tokens-menu, #toolkit-tokens')) abrirTokensMenu(false); });
document.addEventListener('keydown', e => { if(e.key === 'Escape' && !$('#tokens-menu').hidden) abrirTokensMenu(false); });

function abrirAcciones(creepId, mensaje, sinNueva){
  if(!mensaje && !sinNueva && soyGM && bnActiva()){ abrirAccionesNuevas(creepId); return; }   // ⚗ prueba (paso 4, etapa 4b)
  const capa = $('#botonera-capa');
  const marco = $('#botonera-marco');
  capa.hidden = false;
  botonera.completa = false;
  ubicarBotoneraCapa();
  centrarTokenDeBotonera('gm', creepId);
  // gm-tools ya cargado: solo cambia de creep (instantáneo).
  if(botonera.herramienta === 'gm' && botonera.lista){
    botonera.fichaId = creepId;
    MensajesMapa.alMarco(marco, mensaje || {tipo: 'abrir-acciones', creep: creepId});
    enfocarBotonera();
    return;
  }
  $('#botonera-cargando-texto').textContent = 'Abriendo las Acciones…';
  $('#botonera-cargando').hidden = false;
  if(botonera.herramienta === 'gm' && !botonera.lista && botonera.precarga){   // se está precargando: al estar lista, se abre
    Object.assign(botonera, {fichaId: creepId, pendiente: mensaje || {tipo: 'abrir-acciones', creep: creepId}});
    return;
  }
  botonera = {herramienta: 'gm', fichaId: creepId, lista: false, pendiente: mensaje || null};
  marco.src = sinCache(`../gm-toolset/gm-tools.html?partida=${encodeURIComponent(FB_CAMPANA)}&modo=acciones&creep=${encodeURIComponent(creepId)}${mensaje && mensaje.tipo === 'abrir-ver-creep' ? '&ver=1' : ''}`);
}

// El foco pasa a la ventana del iframe, así sus teclas (Escape) le llegan directo.
function enfocarBotonera(){
  if(document.activeElement && document.activeElement.blur) document.activeElement.blur();
  try{ $('#botonera-marco').contentWindow.focus(); }catch(e){}
}

function escapeABotonera(cerrarTodo){
  if(!botonera.lista){
    $('#botonera-cargando-x').click();
    return;
  }
  MensajesMapa.alMarco($('#botonera-marco'), cerrarTodo ? 'tecla-f' : 'tecla-escape');
}

function cerrarBotonera(){
  $('#botonera-capa').hidden = true;
  $('#botonera-capa').classList.remove('sobre-duelo');
  $('#botonera-cargando').hidden = true;
}

// Una habilidad con zona (Sonic Boom: 'cono') le pide al mapa que la dibuje: el MISMO cono de 16 casillas de la detección del
// sigilo, delante del token, como un trazo por casilleros temporal (lo ven todos y se borra solo a los 3 segundos).
/* ---------- Invocar portal (Mago, 2026-09-25) ----------
   La habilidad le avisa al mapa (`portal-habilidad`): se piden DOS clics (dentro del Rango del token, en casillas transitables a pie)
   y se crean dos elementos `portal` que se apuntan entre sí (`portalDestino`), con turnos (se van solos al vencer). Solo los ALIADOS los usan. */
async function portalDeHabilidad(msg){
  const t = [...tokens.values()].find(x => x.fichaId === msg.fichaId);
  if(!t){ toast(`${msg.nombre || 'Invocar portal'}: tu personaje no tiene token en el mapa, no se pueden colocar los portales`); return; }
  const rg = rangoDeToken(t), alcance = rg ? Math.floor(num(rg.rng)) : 0;   // el Rango (Destreza): ya no hay Rango de casteo (2026-10-07)
  if(alcance < 1){ toast('Tu Rango es 0: los portales no alcanzan a ningún punto (abrí la ficha una vez para que se publique)'); return; }
  if(!$('#botonera-capa').hidden) escapeABotonera();
  const puntos = [];
  const pedir = () => elegirDestino(h => {
    const yo = {col: t.col, fila: t.fila};
    if(distanciaHex(h, yo) > alcance){ toast(`Ese punto queda a más de ${alcance} casilleros (tu Rango)`); pedir(); return; }
    if(puntos.some(p => p.col === h.col && p.fila === h.fila)){ toast('Elegí otra casilla: los dos portales no pueden estar en el mismo punto'); pedir(); return; }
    puntos.push(h);
    if(puntos.length < 2){ toast('Primer portal marcado: elegí el segundo'); pedir(); return; }
    portalesCrear(puntos, msg.turnos, msg.nombre);
  }, `<b>🌀 ${esc(msg.nombre || 'Invocar portal')}: elegí el portal ${puntos.length + 1} de 2</b> <span>clic en una casilla transitable a pie dentro de tu Rango (${alcance}) · Esc o clic derecho cancelan</span>`);
  pedir();
}
async function portalesCrear(puntos, turnos, nombre){
  const n = Math.max(1, Math.round(num(turnos)) || 3), vence = Math.round(num(mantenimientoNumero)) + n;
  try{
    await Promise.all(puntos.map((p, i) => coleccionElementos().add({
      tipo: 'flor', origen: {col: p.col, fila: p.fila}, celdas: [0, 0], rotacion: 0, color: '#9B5FD0', alfa: 45, solido: false, invisible: false,
      imagen: '', imgZoom: 1, imgDX: 0, imgDY: 0, fijado: true, turnos: n, venceMant: vence,
      portal: true, portalDestino: puntos[1 - i].col + ',' + puntos[1 - i].fila,
      duenoUid: fbUsuario.uid, creado: firebase.firestore.FieldValue.serverTimestamp(),
    })));
    toast(`🌀 ${nombre || 'Portales'} listos: duran ${n} turno${n === 1 ? '' : 's'} y solo los usan tus aliados`);
  }catch(err){
    console.error('No se pudieron crear los portales:', err);
    toast(err.code === 'permission-denied' ? 'No se pudo: faltan publicar las reglas nuevas de Firestore' : 'No se pudieron crear los portales');
  }
}
function zonaDeHabilidad(msg){
  if(msg.forma !== 'cono' && msg.forma !== 'flor') return;
  const t = [...tokens.values()].find(x => x.fichaId === msg.fichaId);
  if(!t){ toast(`${msg.nombre || 'La habilidad'}: tu personaje no tiene token en el mapa, no se dibuja la zona`); return; }
  if(msg.forma === 'cono'){
    const cono = zonasSigilo(t).cono;
    if(cono.length) guardarTrazoHex(cono, false, {color: '#6EAAFF', grosor: TRAZO_ZONA_GROSOR});
    return;
  }
  // 'flor': los casilleros alrededor del token hasta `radio` (sin el propio: el que la ejecuta no se afecta), en naranja.
  const R = Math.max(1, Math.min(6, Math.round(Number(msg.radio) || 1)));
  const c0 = hexACubo({col: t.col, fila: t.fila});
  const flor = celdasFlor(R).filter(o => o.dq || o.dr).map(o => ({col: cuboACol(c0.q + o.dq, c0.r + o.dr), fila: cuboAFila(c0.q + o.dq, c0.r + o.dr)}));
  if(flor.length) guardarTrazoHex(flor, false, {color: '#E88C32', grosor: TRAZO_ZONA_GROSOR});
}

/* ---------- Zona persistente de una habilidad (2026-09-28, pedido del dueño: "que la automatización no quite
   el momento") ----------
   A diferencia de zonaDeHabilidad (solo dibuja 3 s) y de un hechizo de área (se resuelve todo de una), esto
   CREA un elemento de Terreno y Formas que queda puesto («zona: true», generaliza 🔥 sin tocarlo — ver
   comun/CLAUDE.md). Se pide el centro con un clic, como un hechizo de área; el resto (quién entra, la
   resistencia, el cartelito) lo maneja el motor de zonas más abajo. */
// Crea el elemento de una zona (compartido entre una habilidad y el asistente paso a paso del GM, 2026-09-28).
// cfg: {radio, turnos, nombre, color?, alfa?, amiga, dano, ignoraDef, estado, resistStat, resistValor,
//       enMantenimiento, cadaPaso, casteadorRef, casteadorTipo}
async function crearElementoZona(centro, cfg){
  const radio = Math.max(1, Math.min(6, Math.round(num(cfg.radio)) || 1));
  const n = Math.max(1, Math.round(num(cfg.turnos)) || 3);
  const datos = {
    // Las casillas se guardan planas [dq1, dr1, …], como guardarElemento (con los {dq, dr} sueltos Firestore la rechazaba).
    tipo: 'flor', origen: {col: centro.col, fila: centro.fila}, celdas: celdasFlor(radio).flatMap(c => [c.dq, c.dr]), rotacion: 0,
    color: /^#[0-9a-fA-F]{6}$/.test(cfg.color || '') ? cfg.color : (cfg.estado || /t[oó]xic/i.test(cfg.danoTipo || '') ? '#4C9A2A' : '#D9531E'),   // lo tóxico, verde (no el naranja del fuego)
    alfa: Number.isFinite(cfg.alfa) ? cfg.alfa : 40, solido: false, invisible: false,
    imagen: '', imgZoom: 1, imgDX: 0, imgDY: 0, fijado: true,
    // P172 (dueño, 2026-10-07): con orden de turnos, la zona de alguien dura SUS turnos (zonasDelQueLaTiro, js/07): se va al empezar su N-ésimo
    // turno siguiente. El vencimiento por Mantenimiento queda una ronda más tarde, de respaldo (si quien la tiró ya no juega).
    turnos: n, venceMant: Math.round(num(mantenimientoNumero)) + n + (cfg.casteadorRef && iniciativa.orden.length ? 1 : 0),
    zona: true, zonaNombre: String(cfg.nombre || 'Zona').slice(0, 40),
    zonaCasteadorRef: String(cfg.casteadorRef || '').slice(0, 64), zonaCasteadorTipo: cfg.casteadorTipo === 'creep' ? 'creep' : 'pj',
    zonaResueltos: [], zonaEnMantenimiento: cfg.enMantenimiento !== false, zonaCadaPaso: !!cfg.cadaPaso,
    duenoUid: fbUsuario.uid, creado: firebase.firestore.FieldValue.serverTimestamp(),
  };
  if(cfg.amiga) datos.zonaAmiga = true;
  if(cfg.dano){ datos.zonaDano = String(cfg.dano).slice(0, 12); if(cfg.ignoraDef) datos.zonaIgnoraDef = true; }
  if(cfg.estado && cfg.estado.nombre) datos.zonaEstado = JSON.stringify(cfg.estado).slice(0, 300);
  if(cfg.resistStat && Number.isFinite(cfg.resistValor)){ datos.zonaResistStat = String(cfg.resistStat).slice(0, 12); datos.zonaResistValor = Math.round(num(cfg.resistValor)); }
  // La tirada de la zona (2026-10-02, P143): el stat de quien la creó y su valor al crearla; se tira cada vez que afecta a alguien.
  else if(cfg.resistStat && cfg.tiraStat && Number.isFinite(cfg.tiraValor)){
    datos.zonaResistStat = String(cfg.resistStat).slice(0, 12);
    datos.zonaTiraStat = String(cfg.tiraStat).slice(0, 12);
    datos.zonaTiraValor = Math.round(num(cfg.tiraValor));
  }
  // Daño «la diferencia» y la tirada extra con su texto (2026-10-02): ver zonaResolverBanner.
  if(cfg.danoDif && datos.zonaResistStat){ datos.zonaDanoDif = true; if(cfg.ignoraDef) datos.zonaIgnoraDef = true; }
  if(cfg.danoTipo) datos.zonaDanoTipo = String(cfg.danoTipo).slice(0, 20);
  if(cfg.tiraExtra && (datos.zonaDano || datos.zonaDanoDif)) datos.zonaTiraExtra = String(cfg.tiraExtra).slice(0, 12);
  if(cfg.nota) datos.zonaNota = String(cfg.nota).slice(0, 200);
  if(['piso', 'ambos'].includes(cfg.altura)) datos.zonaAltura = cfg.altura;   // del aire es lo de siempre (2026-10-07)
  if(cfg.directo && (datos.zonaDano || datos.zonaDanoDif)) datos.zonaDirecto = true;   // daño directo: no lo frena la Defensa especial (2026-10-07)
  try{
    try{ await coleccionElementos().add(datos); }
    catch(e){
      if(e.code !== 'permission-denied' || !(datos.zonaAltura || datos.zonaDirecto)) throw e;
      const sinReglas = [datos.zonaAltura ? 'zonaAltura: quedó «del aire»' : '', datos.zonaDirecto ? 'zonaDirecto: la frena la Defensa especial' : ''].filter(Boolean).join(' · ');
      delete datos.zonaAltura; delete datos.zonaDirecto; await coleccionElementos().add(datos);
      toast(`Ojo: faltan publicar las reglas (${sinReglas})`);
    }
    toast(`🌫 ${cfg.nombre || 'Zona'} colocada: dura ${n} turno${n === 1 ? '' : 's'}`);
    return true;
  }catch(err){
    console.error('No se pudo crear la zona:', err);
    toast(err.code === 'permission-denied' ? 'No se pudo: faltan publicar las reglas nuevas de Firestore (zona)' : 'No se pudo colocar la zona');
    return false;
  }
}
// 🌫 La niebla de una varita (2026-10-05): un elemento `niebla` con turnos. Adentro se ve a 1; desde afuera no se ve a través ni adentro
// (salvo a los Marcados, que brillan) — ver tapadoPorNiebla y celdasVisionDe.
async function crearNiebla(centro, radio, msg){
  const n = Math.max(1, Math.round(num(msg.zonaTurnos)) || 3);
  try{
    await coleccionElementos().add({
      tipo: 'flor', origen: {col: centro.col, fila: centro.fila}, celdas: celdasFlor(radio).flatMap(c => [c.dq, c.dr]), rotacion: 0,
      color: '#C9CED8', alfa: 70, solido: false, invisible: false, imagen: '', imgZoom: 1, imgDX: 0, imgDY: 0, fijado: true, niebla: true,
      turnos: n, venceMant: Math.round(num(mantenimientoNumero)) + n,
      duenoUid: fbUsuario.uid, creado: firebase.firestore.FieldValue.serverTimestamp(),
    });
    toast(`🌫 ${msg.nombre || 'Niebla'}: dura ${n} turno${n === 1 ? '' : 's'}`);
  }catch(err){
    console.error('No se pudo poner la niebla:', err);
    toast(err.code === 'permission-denied' ? 'No se pudo: faltan publicar las reglas nuevas de Firestore (niebla)' : 'No se pudo poner la niebla');
  }
}
function zonaPersistenteDeHabilidad(msg){
  const radio = Math.max(1, Math.round(num(msg.radio) || 1));
  if(msg.niebla){
    elegirDestino(h => crearNiebla(h, radio, msg), `<b>🌫 ${msg.nombre ? esc(msg.nombre) + ': ' : ''}marcá el centro de la niebla</b> <span>clic en el mapa (radio ${radio}) · Esc o clic derecho cancelan</span>`, true);
    return;
  }
  elegirDestino(h => crearElementoZona(h, {
    radio, turnos: msg.zonaTurnos, nombre: msg.nombre, amiga: msg.zonaAmiga, dano: msg.zonaDano, ignoraDef: msg.zonaIgnoraDef,
    estado: msg.zonaEstado, resistStat: msg.resistStat, resistValor: msg.resistValor, enMantenimiento: true, cadaPaso: false,
    casteadorRef: msg.fichaId, casteadorTipo: msg.casteadorTipo,
    danoDif: msg.zonaDanoDif, danoTipo: msg.zonaDanoTipo, tiraExtra: msg.zonaTiraExtra, nota: msg.zonaNota,
    tiraStat: msg.tiraStat, tiraValor: msg.tiraValor, altura: msg.zonaAltura, directo: !!msg.zonaDirecto,
  }), `<b>🌫 ${msg.nombre ? esc(msg.nombre) + ': marcá el centro' : 'Elegí el centro de la zona'}</b> <span>clic en el mapa (radio ${radio}) · Esc o clic derecho cancelan</span>`, true);
}
// 🪤 Trampa de una habilidad ✨ automática (2026-09-30, pedido del dueño): quien la usa elige la casilla con un clic (antes quedaba
// sola al lado del token). El anuncio (sin la ubicación) ya lo publicó la ficha; la trampa la ve solo su bando (trampaDeMiBando).
// Las que dejan varias (2026-10-05, Varita de espinas: «3 casillas donde quieras»): un clic por cada una; Esc termina antes. Los pilares
// (Varita de los pilares) no son trampas: cada clic levanta un Sólido de 1 casilla con turnos. El portal con destino fijo (Varita del portal):
// primero la casilla que lo dispara y después adónde lleva. Si la casilla queda fuera del Rango de quien la usa, avisa y deja seguir.
function trampaDeHabilidad(msg){
  const t = msg.trampa || {}, cant = Math.max(1, Math.min(6, Math.round(num(t.cant)) || 1));
  const pilar = !!t.pilar, portal = t.portal && t.portal.fijo ? Math.max(1, Math.round(num(t.portal.rango)) || 4) : 0;
  const nom = msg.nombre ? esc(msg.nombre) + ': ' : '';
  let puestas = 0;
  const fin = () => { if(cant > 1 && puestas) toast(pilar ? `🧱 ${msg.nombre}: ${puestas} pilar${puestas === 1 ? '' : 'es'}` : `🪤 ${msg.nombre}: ${puestas} trampa${puestas === 1 ? '' : 's'} colocada${puestas === 1 ? '' : 's'}`); };
  const otra = i => {
    const cuenta = cant > 1 ? ` (${i + 1} de ${cant})` : '';
    elegirDestino(async h => {
      trampaAvisarAlcance(msg, h);
      try{
        if(pilar){
          if(!(await levantarPilar(h, t))){ otra(i); return; }   // casilla ocupada: la vuelve a pedir
        }else if(portal){ portalElegirDestino(msg, t, h, portal); return; }
        else{
          const r = await TokensAuto.colocarTrampas({fichaId: msg.fichaId, tipoToken: msg.tipoToken || 'pj', trampa: {...t, cant: 1}, mapaId: mapaMostrado, celda: {col: h.col, fila: h.fila}});
          if(!r.colocadas){ toast(`🪤 ${msg.nombre}: no se pudo colocar`); return; }
          if(cant === 1) toast(`🪤 ${msg.nombre}: trampa colocada`);
        }
        puestas++;
      }catch(err){ console.error('No se pudo colocar:', err); toast(pilar ? 'No se pudo levantar el pilar — revisá la consola' : 'No se pudo colocar la trampa — revisá la consola'); return; }
      if(i + 1 < cant) otra(i + 1); else fin();
    }, `<b>${pilar ? '🧱' : portal ? '🌀' : '🪤'} ${nom}${pilar ? 'elegí dónde sale el pilar' : portal ? 'elegí la casilla que dispara el portal' : 'elegí dónde colocar la trampa'}${cuenta}</b> <span>clic en el mapa · Esc o clic derecho ${i ? 'terminan' : 'cancelan'}</span>`, true, i ? fin : null);
  };
  otra(0);
}
// Si la casilla elegida queda fuera del Rango de quien la usa: avisa (la mesa decide), no bloquea.
function trampaAvisarAlcance(msg, h){
  const mio = [...tokens.values()].find(x => x.fichaId === msg.fichaId && x.tipo === (msg.tipoToken || 'pj'));
  const rr = mio && typeof rangoDeToken === 'function' ? rangoDeToken(mio) : null;
  if(rr && rr.rng > 0 && distanciaHex(mio, h) > rr.rng) toast(`⚠ Esa casilla queda a ${distanciaHex(mio, h)}: fuera de tu Rango (${fmt(rr.rng)})`);
}
// Un pilar de piedra (Varita de los pilares): Sólido de 1 casilla, visible para todos, que se va solo a los `turnos` turnos. → false si no hay lugar.
async function levantarPilar(h, t){
  if(elementoSolidoEn(h.col, h.fila) || [...tokens.values()].some(x => x.col === h.col && x.fila === h.fila)){ toast('Esa casilla no está libre (hay un token o un Sólido): elegí otra'); return false; }
  const n = Math.max(1, Math.round(num(t.turnos)) || 3);
  await coleccionElementos().add({
    tipo: 'libre', origen: {col: h.col, fila: h.fila}, celdas: [0, 0], rotacion: 0,
    color: /^#[0-9a-fA-F]{6}$/.test(t.color || '') ? t.color : '#7A6A58', alfa: 90, solido: true, invisible: false, imagen: '', imgZoom: 1, imgDX: 0, imgDY: 0, fijado: true,
    turnos: n, venceMant: Math.round(num(mantenimientoNumero)) + n,
    duenoUid: fbUsuario.uid, creado: firebase.firestore.FieldValue.serverTimestamp(),
  });
  return true;
}
// El destino del portal (Varita del portal): a `rango` casillas o menos de la casilla que lo dispara; la trampa guarda los dos puntos.
function portalElegirDestino(msg, t, h, rango){
  elegirDestino(async d => {
    if(distanciaHex(h, d) > rango || (d.col === h.col && d.fila === h.fila)){ toast(`El destino tiene que estar a ${rango} casillas o menos del portal (y no en el mismo lugar)`); portalElegirDestino(msg, t, h, rango); return; }
    try{
      const r = await TokensAuto.colocarTrampas({fichaId: msg.fichaId, tipoToken: msg.tipoToken || 'pj', trampa: {...t, cant: 1, portal: {rango, destino: d.col + ',' + d.fila}}, mapaId: mapaMostrado, celda: {col: h.col, fila: h.fila}});
      toast(r.colocadas ? `🌀 ${msg.nombre}: portal colocado (lleva ${distanciaHex(h, d)} casillas más allá)` : `🌀 ${msg.nombre}: no se pudo colocar`);
    }catch(err){ console.error('No se pudo colocar el portal:', err); toast('No se pudo colocar el portal — revisá la consola'); }
  }, `<b>🌀 ${msg.nombre ? esc(msg.nombre) + ': ' : ''}elegí adónde lleva el portal</b> <span>clic en una casilla a ${rango} o menos de la trampa · Esc o clic derecho cancelan</span>`, false);
}
// Habilidad que invoca (2026-10-02): la ficha ya despertó (o copió) la invocación (FichaAcciones.invocarConHab); acá se elige la casilla
// donde aparece. Si ya tiene token en este mapa (el de cuando se durmió) se mueve ahí; si no, se crea. La mesa se entera por la Crónica.
function invocacionDeHabilidad(msg){
  const nombre = String(msg.nombre || 'Invocación').slice(0, 40);
  elegirDestino(async h => {
    try{
      let id = null;
      tokens.forEach((t, k) => { if(t.fichaId === msg.ref) id = k; });
      if(id) await coleccionTokens().doc(id).update({col: h.col, fila: h.fila, ruta: firebase.firestore.FieldValue.delete()});
      else await crearToken({nombre, color: /^#[0-9a-fA-F]{6}$/.test(msg.color || '') ? msg.color : '#9B7BD4', tipo: 'pj', fichaId: msg.ref, col: h.col, fila: h.fila});
      momentoAbrir({tipo: 'invocacion', icono: '🔮', titulo: `${msg.quien || 'Alguien'} invocó a ${nombre}`,
        resultado: `con «${msg.habilidad || 'una habilidad'}»${num(msg.turnos) ? ` · dura ${fmt(num(msg.turnos))} turnos` : ''}`, estado: 'listo'});
    }catch(err){ console.error('No se pudo poner la invocación en el mapa:', err); toast('No se pudo poner la invocación en el mapa — ponela a mano'); }
  }, `<b>🔮 ${esc(nombre)}: elegí dónde aparece</b> <span>clic en el mapa · Esc o clic derecho cancelan</span>`, true,
  () => toast(`${nombre} quedó invocada sin lugar: poné su token a mano`));
}
// 🌫 Zonas con efectos persistentes: el asistente paso a paso (comun/asistente-zona.js, 2026-09-28, pedido del
// dueño). Cualquier miembro lo puede usar (mismo criterio que Formas libres y Trampas); el casteador queda como
// "el bando de quien la coloca" (el GM = rival de los PJ; un jugador = rival de los creeps), no un token puntual.
function abrirAsistenteZonaNueva(){
  if(borradorElemento) consolidarBorradorElemento();
  desactivarHerramienta();
  AsistenteZona.abrir({
    colores: COLORES,
    alTerminar: r => {
      const radio = Math.max(1, Math.min(6, Math.round(num(r.radio)) || 1));
      elegirDestino(h => crearElementoZona(h, {
        radio, turnos: r.turnos, nombre: r.nombre, color: r.color, alfa: r.alfa, amiga: r.amiga, dano: r.dano, ignoraDef: r.ignoraDef,
        estado: r.estado, resistStat: r.resistStat, resistValor: r.resistValor, enMantenimiento: r.enMantenimiento, cadaPaso: r.cadaPaso, altura: r.altura,
        casteadorRef: '', casteadorTipo: soyGM ? 'creep' : 'pj',
      }), `<b>🌫 ${esc(r.nombre)}: marcá el centro</b> <span>clic en el mapa (radio ${radio}) · Esc o clic derecho cancelan</span>`, true);
    },
  });
}

window.addEventListener('message', e => {
  if(e.origin !== location.origin || !e.data || e.source !== $('#botonera-marco').contentWindow) return;
  if(!MensajesMapa.conocido(e.data.tipo)) console.warn(`Llegó del marco un mensaje sin registrar: «${e.data.tipo}» (comun/mensajes-mapa.js)`);
  if(e.data.tipo === 'muerte-estado'){   // la ficha (iframe) avisa que su personaje está inconsciente: el filtro rojo cubre todo el mapa
    muerteIframe = e.data.activo ? {activo: true, turnos: e.data.turnos, definitivo: !!e.data.definitivo} : null;
    actualizarMuerteMapa();
    return;
  }
  if(e.data.tipo === 'botonera-lista' || e.data.tipo === 'acciones-lista'){
    botonera.lista = true;
    $('#botonera-cargando').hidden = true;
    if(!$('#botonera-capa').hidden) enfocarBotonera();   // precargada por detrás: no le saca el teclado al mapa
    // Lo que se pidió mientras cargaba (por ejemplo, agregar un estado).
    if(botonera.pendiente){
      MensajesMapa.alMarco($('#botonera-marco'), botonera.pendiente);
      botonera.pendiente = null;
    }
  }
  if(e.data.tipo === 'botonera-cerrada' || e.data.tipo === 'acciones-cerrada') cerrarBotonera();
  if(e.data.tipo === 'zona-habilidad') zonaDeHabilidad(e.data);
  if(e.data.tipo === 'portal-habilidad') portalDeHabilidad(e.data);
  if(e.data.tipo === 'zona-persistente-habilidad') zonaPersistenteDeHabilidad(e.data);
  if(e.data.tipo === 'trampa-habilidad') trampaDeHabilidad(e.data);
  if(e.data.tipo === 'invocacion-habilidad') invocacionDeHabilidad(e.data);
  if(e.data.tipo === 'duelo-elegir-objetivo') dueloElegirObjetivoMapa(e.data);
  if(e.data.tipo === 'duelo-reroll-info-res') Duelo.recibirRerollInfo(e.data.id, e.data.lado, e.data.info);   // ¿tiene una moneda de re-roll quien tira?
  if(e.data.tipo === 'duelo-flash-res') Duelo.recibirFlash(e.data.id, e.data.campo, e.data.opciones);   // los Flash que tiene quien va a tirar
  if(e.data.tipo === 'duelo-opciones-res') Duelo.recibirOpciones(e.data.id, e.data.opciones);   // las opciones de defensa que calculó la ficha del defensor
  // La ficha o GM Tools (en el marco) abrió o cerró algo: comun/embebido.js lo avisa solo (paso 4, 2026-09-30). Abierto: se
  // muestra la capa, encima del duelo; cerrado: se saca, para que el marco transparente no tape el mapa.
  if(e.data.tipo === 'embebido-cerrado'){ cerrarBotonera(); return; }
  if(e.data.tipo === 'duelo-ui-visible' || e.data.tipo === 'embebido-abierto'){   // un cartelito (Nitros, sobrepeso, Flash…) o una ventana
    $('#botonera-capa').hidden = false;
    const duelo = document.getElementById('duelo-fondo');   // encima del cuadro del duelo, solo si hay uno a la vista
    if(e.data.tipo === 'duelo-ui-visible' || (duelo && getComputedStyle(duelo).display !== 'none')) $('#botonera-capa').classList.add('sobre-duelo');
    ubicarBotoneraCapa();
    enfocarBotonera();
  }
});

/* ---------- Duelo paso a paso (comun/duelo.js) ----------
   Atacar desde la Botonera/Acciones le pide al mapa que elija el objetivo con un CLIC sobre el token (reutiliza elegirDestino: se toca la casilla
   del token). El duelo se crea y su cuadro se abre solo para todos. Cada uno tira desde su iframe: el mapa se lo pide sin mostrarlo. */
// Cartel flotante (donde salen los avisos) mientras hay que elegir el objetivo: se ve hasta que se elige, se cancela o se toca «Sin objetivo».
function dueloAvisoObjetivo(nombre, conSuelto, alSuelto, hab){
  let el = $('#duelo-objetivo');
  if(!el){
    el = document.createElement('div');
    el.id = 'duelo-objetivo';
    el.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:96;background:var(--bottle,#1f3d2f);color:#EAF3E6;border:2px solid var(--brass,#E0A458);border-radius:var(--r,3px);padding:12px 18px;font-family:"Space Mono",monospace;font-size:13px;box-shadow:0 8px 30px rgba(0,0,0,.6);text-align:center;max-width:92vw;display:flex;gap:12px;align-items:center;flex-wrap:wrap;justify-content:center';
    document.body.appendChild(el);
  }
  el.hidden = false;
  el.innerHTML = `<span>${hab ? '✨' : '⚔'} <b>${esc(nombre || 'Atacar')}</b>: ${hab ? 'elegí el objetivo de <b>' + esc(hab) + '</b>' : 'elegí a quién atacás'} — <b>clic sobre el token</b> <span style="opacity:.75">(Esc o clic derecho cancelan)</span></span>${conSuelto ? '<button type="button" class="btn" data-duelo-suelto>Sin objetivo · tirada suelta</button>' : ''}`;
  const b = el.querySelector('[data-duelo-suelto]');
  if(b) b.onclick = alSuelto;
}
/* Alcance del ataque o de la habilidad (2026-09-27, pedido del dueño): NO restringe a quién se puede apuntar; mientras se elige el objetivo, los tokens que están a
   tu alcance (casilleros desde tu token) «laten» con un brillo dorado. `ataque.alcance` lo calcula la página de quien actúa: cuerpo a cuerpo = 1 (más el Alcance del arma),
   armas de rango y lo especial = el Rango (Destreza). Sin alcance (0) no se resalta nada. */
let objetivosResaltados = null;
// ¿"t" es rival de quien castea (yo)? Mismo criterio que ya usaban los hechizos de área (dueloElegirAreaMapa,
// 2026-09-27): los personajes atacan creeps y los creeps atacan personajes — no depende de quién mira el mapa.
function dueloEsRival(yo, t){ return yo.tipo === 'creep' ? t.tipo === 'pj' : t.tipo === 'creep'; }
function dueloResaltarObjetivos(propio, alcance, esValido){
  objetivosResaltados = null;
  const n = Math.round(num(alcance));
  if(!(n > 0)){ pedirDibujo(); return 0; }
  const mio = [...tokens.values()].find(propio);
  if(!mio){ pedirDibujo(); return 0; }
  const set = new Set();
  tokens.forEach((t, id) => {
    if(propio(t) || (t.oculto && !soyGM)) return;
    if(esValido && !esValido(t)) return;
    if(distanciaHex({col: mio.col, fila: mio.fila}, {col: t.col, fila: t.fila}) <= n) set.add(id);
  });
  objetivosResaltados = set;
  pedirDibujo();
  return set.size;
}
function dueloAvisoObjetivoOcultar(){ const el = $('#duelo-objetivo'); if(el) el.hidden = true; if(objetivosResaltados){ objetivosResaltados = null; pedirDibujo(); } }

function dueloElegirObjetivoMapa(msg){
  const yo = msg.yo, ataque = msg.ataque;
  if(ataque && ataque.hab && (ataque.hab.objetivo === 'area' || ataque.hab.objetivo === 'onda' || ataque.hab.objetivo === 'cono' || ataque.hab.objetivo === 'linea')){ dueloElegirAreaMapa(msg); return; }   // hechizo de área: otro flujo (Paso 4/7)
  cerrarBotonera();   // esconde la capa (la ficha queda cargada, para tirar después)
  seleccion = null; hudCerrar(); pedirDibujo();   // se guarda el menú de botones que rodea al token propio mientras se elige
  const propio = t => t.fichaId === yo.ref && t.tipo === yo.tipo;
  if(ataque && ataque.hab && ataque.hab.objetivo === 'uno mismo'){   // habilidad sobre uno mismo: no hay nada que elegir
    // 2026-09-29: antes, cualquier error acá (sincrónico, antes de llegar al .catch) quedaba sin ningún aviso —
    // "no pasa nada" para quien lo usa, sin ni un toast. Con el try/catch, si algo sale mal se ve.
    try{
      const mio0 = [...tokens.entries()].map(([id, t]) => ({...t, id})).find(propio);
      if(!mio0){ toast(`${ataque.habNombre || 'Habilidad'}: no encontré tu token en este mapa`); return; }
      Duelo.crear({yo, ataque}, {id: mio0.id, nombre: nombreDe(mio0), tipo: mio0.tipo, fichaId: mio0.fichaId, duenoUid: mio0.duenoUid}, mio0.id)
        .catch(err => { console.error('No se pudo abrir el duelo:', err); toast(err && err.code === 'permission-denied' ? 'No se pudo: faltan publicar las reglas nuevas de Firestore (duelos)' : 'No se pudo abrir el duelo: ' + String((err && err.message) || err)); });
    }catch(err){ console.error('No se pudo abrir el duelo (uno mismo):', err); toast('No se pudo abrir el duelo: ' + String((err && err.message) || err)); }
    return;
  }
  // Objetivo hostil (por defecto, ataques y habilidades sin objetivo explícito) → brillan los rivales; objetivo
  // "aliado" → brillan los del mismo bando (2026-09-27, pedido del dueño). Es solo una ayuda visual: se puede
  // clickear cualquiera igual, pero si no es del bando esperado se pide confirmar antes de abrir el duelo
  // ("avisa y deja seguir", no bloquea — no hay razón mecánica para prohibir un golpe a un aliado a propósito).
  const objetivoTipo = (ataque && ataque.hab && ataque.hab.objetivo) || 'enemigo';
  const esValido = objetivoTipo === 'aliado' ? t => !dueloEsRival(yo, t) : objetivoTipo === 'enemigo' ? t => dueloEsRival(yo, t) : null;
  const nEnAlcance = dueloResaltarObjetivos(propio, ataque && ataque.alcance, esValido);
  // msg.alSuelto / msg.alCancelar: cuando el ataque sale de la Botonera nueva (el mapa mismo, paso 3c-4b) y no del marco.
  const cancelado = () => { dueloAvisoObjetivoOcultar(); if(msg.alCancelar){ msg.alCancelar(); return; } try{ MensajesMapa.alMarco($('#botonera-marco'), 'duelo-cancelado'); }catch(e){} };
  const alSuelto = () => {
    elegirDestinoTerminar(); dueloAvisoObjetivoOcultar();
    if(msg.alSuelto){ msg.alSuelto(); return; }
    $('#botonera-capa').hidden = false; ubicarBotoneraCapa();
    try{ MensajesMapa.alMarco($('#botonera-marco'), 'duelo-suelto'); }catch(e){}
  };
  const pedir = () => {
    elegirDestino(async h => {
      const todos = [...tokens.entries()].map(([id, t]) => ({...t, id}));   // los tokens del mapa no traen su id adentro: es la clave del Map
      const cand = todos.filter(t => t.col === h.col && t.fila === h.fila && !propio(t) && (!t.oculto || soyGM) && !tapadoPorNiebla(t));   // la niebla: no se apunta adentro
      if(!cand.length){ toast('Ahí no hay otro token: hacé clic sobre el que querés atacar'); pedir(); return; }
      let t = cand[0];
      if(esValido && !esValido(t)){
        const msg = objetivoTipo === 'aliado' ? `${nombreDe(t)} es un rival, no un aliado. ¿Igual apuntarle con esta habilidad pensada para aliados?` : `${nombreDe(t)} es un aliado, no un rival. ¿Igual atacarlo?`;
        if(!confirm(msg)){ pedir(); return; }
      }
      dueloAvisoObjetivoOcultar();
      try{ t = await dueloVincularSiFalta(t); }catch(err){ console.error('No se pudo vincular el token al creep:', err); }
      const mio = todos.find(propio);
      let espalda = false, embestida = 0;
      try{ espalda = porLaEspalda(mio, t); }catch(err){ console.error('No se pudo ver si es por la espalda:', err); }   // nunca traba el ataque
      try{ if(!(ataque && ataque.hab)) embestida = embestidaDe(mio, t); }catch(err){ console.error('No se pudo ver la embestida:', err); }
      let quieto = 0, primeraSangre = 0;
      try{ quieto = quietoDe(mio, ataque); primeraSangre = primeraSangreDe(mio, ataque); }catch(err){ console.error('No se pudieron ver los anillos del ataque:', err); }
      if(ataque && ataque.hab && ataque.hab.reparte){ dueloMisiles(yo, ataque, t, mio); return; }   // Varita de misiles: de a uno
      if(embestida) embestidaUsadas.add(`${mio.id}@${Math.round(num(mantenimientoNumero))}`);
      if(primeraSangre) primeraSangreUsadas.add(mio.id);
      Duelo.crear({yo, ataque, espalda, embestida, quieto, primeraSangre}, {id: t.id, nombre: nombreDe(t), tipo: t.tipo, fichaId: t.fichaId, duenoUid: t.duenoUid}, mio ? mio.id : '')
        .catch(err => { console.error('No se pudo abrir el duelo:', err); toast(err && err.code === 'permission-denied' ? 'No se pudo: faltan publicar las reglas nuevas de Firestore (duelos)' : 'No se pudo abrir el duelo: ' + String((err && err.message) || err).slice(0, 120)); });
    }, `<b>${ataque && ataque.hab ? '✨ ' + esc(ataque.hab.nombre) + ': elegí el objetivo' : '⚔ ' + esc(yo.nombre || 'Atacar') + ': elegí a quién atacás'}</b> <span>clic sobre el token · Esc o clic derecho cancelan${nEnAlcance ? ' · ✨ brillan los que están a tu alcance (' + Math.round(num(ataque.alcance)) + ' casillero' + (Math.round(num(ataque.alcance)) === 1 ? '' : 's') + ')' : ''}</span>`, true, cancelado);
    dueloAvisoObjetivo(yo.nombre, msg.conSuelto, alSuelto, ataque && ataque.hab ? ataque.hab.nombre : '');
  };
  pedir();
}
/* Los misiles (2026-10-05, Varita de misiles; dueño: «el segundo objetivo se elige una vez que se recorrió todo el efecto del primero»): van de a uno,
   como una cascada de área que se arma sobre la marcha. El primero es un duelo entero contra el rival elegido; cuando se resuelve, el área queda
   «eligiendo» y a quien los tira se le pide el próximo objetivo (puede ser el mismo), con su propia tirada. Esc: ese misil no sale. */
async function dueloMisiles(yo, ataque, t1, mio){
  const hab = ataque.hab;
  try{
    await coleccionAreas().add({
      casteador: {ref: String(yo.ref || ''), tipo: yo.tipo, nombre: String(yo.nombre || '').slice(0, 40), uid: (mio && mio.duenoUid) || fbUsuario.uid, tokenId: mio ? mio.id : ''},
      hab: Duelo.limpiarHab({...hab, dano: hab.dano ? {...hab.dano, formula: hab.reparte.cada} : hab.dano}),
      centro: {col: mio ? mio.col : t1.col, fila: mio ? mio.fila : t1.fila, linea: [nbPack(t1.col, t1.fila)]}, radio: 0,
      objetivos: [t1.id], duelos: [], indice: 0, estado: 'en-curso', creadoPor: fbUsuario.uid, creado: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }catch(err){ console.error('No se pudieron lanzar los misiles:', err); toast('No se pudieron lanzar los misiles — revisá la consola'); }
}
const misilesEligiendo = new Set();
function misilSiguiente(id, a){
  if(!fbUsuario || !a.casteador || a.casteador.uid !== fbUsuario.uid || misilesEligiendo.has(id)) return;
  misilesEligiendo.add(id);
  const n = (a.objetivos || []).length + 1, total = num(a.hab && a.hab.reparte && a.hab.reparte.total) || 2;
  elegirDestino(async h => {
    const t = [...tokens.entries()].map(([k, x]) => ({...x, id: k})).find(x => x.col === h.col && x.fila === h.fila && x.id !== a.casteador.tokenId && (!x.oculto || soyGM) && !tapadoPorNiebla(x));
    if(!t){ toast('Ahí no hay nadie: hacé clic sobre un rival'); misilesEligiendo.delete(id); misilSiguiente(id, a); return; }
    try{
      await coleccionAreas().doc(id).update({objetivos: [...(a.objetivos || []), t.id], estado: 'en-curso',
        centro: {...a.centro, linea: [...((a.centro && a.centro.linea) || []), nbPack(t.col, t.fila)]}});
    }catch(err){ console.error('No se pudo lanzar el misil:', err); toast('No se pudo lanzar el misil'); }
    misilesEligiendo.delete(id);
  }, `<b>✨ ${esc((a.hab && a.hab.nombre) || 'Misiles')}: misil ${n} de ${total} — ¿a quién?</b> <span>clic sobre un rival (puede ser el mismo) · Esc: ese misil no sale</span>`, true,
  () => { misilesEligiendo.delete(id); coleccionAreas().doc(id).update({estado: 'terminado'}).catch(err => console.error(err)); toast('Ese misil no salió'); });
}
// Un token de creep sin ficha detrás (creado con «Nuevo token» en vez de traerlo de GM Tools) no tiene datos para pelear. Si el GM ataca a uno, se lo vincula solo
// al creep de GM Tools con el mismo nombre (prefiere uno que todavía no tenga token) y se avisa.
async function dueloVincularSiFalta(t){
  if(t.tipo !== 'creep' || t.fichaId || !soyGM) return t;
  const nom = String(t.nombre || '').trim().toLowerCase();
  const usados = new Set([...tokens.values()].filter(x => x.tipo === 'creep' && x.fichaId).map(x => x.fichaId));
  const mismos = [...creepsPub.entries()].filter(([, c]) => String(c.nombre || '').trim().toLowerCase() === nom);
  // Puede haber creeps con el mismo nombre en mapas distintos: se prefiere los de ESTE mapa y los que todavía no tienen token; si sigue habiendo más de uno, no se adivina.
  let cands = mismos.filter(([, c]) => c.mapa === mapaMostrado);
  if(!cands.length) cands = mismos;
  const libres = cands.filter(([cid]) => !usados.has(cid));
  const finales = libres.length ? libres : cands;
  if(!finales.length){ toast(`El token «${t.nombre}» no está vinculado a ningún creep de GM Tools (y no hay uno con ese nombre): el duelo no va a tener sus datos`); return t; }
  if(finales.length > 1){ toast(`Hay ${finales.length} creeps llamados «${t.nombre}» en distintos mapas: vinculá este token a uno desde sus ajustes (⚙) para que el duelo tenga sus datos`); return t; }
  const elegido = finales[0];
  await coleccionTokens().doc(t.id).update({fichaId: elegido[0]});
  toast(`Vinculé el token «${t.nombre}» al creep «${elegido[1].nombre}» de GM Tools`);
  creepLlegoAlMapa(elegido[0]);
  return {...t, fichaId: elegido[0]};
}

/* ---------- Hechizos de área (Paso 4/7 del casteo, 2026-09-27, docs/reglas-casteo.md §1.3) ----------
   Un casteo de área abre, para todos, la MISMA cascada de duelos de habilidad de siempre — un
   sub-duelo por objetivo, uno detrás del otro, con la fase nueva 'dodge' (ver comun/duelo.js) —
   más el círculo compartido en el mapa. Documento propio, campanas/<id>/areas/<id> (no anidado
   por mapa, mismo criterio que `duelos`):
   {casteador:{ref,tipo,nombre,uid,tokenId}, hab, centro:{col,fila}, radio, objetivos:[tokenId,…],
    duelos:[dueloId|null,…] (mismo largo y orden que objetivos), indice (0-based: a quién le toca
    ahora), pdgCompartido:{total,formula,rolls,mod}|undefined (la PdG.Esp/PdG del casteador, tirada
    UNA sola vez en el primer objetivo y reusada contra la Evasión de cada uno de los siguientes —
    dicho por el dueño, 2026-09-27), estado:'en-curso'|'terminado', creadoPor, creado}. */
function coleccionAreas(){ return fbDb.collection(fbRutaCampana('areas')); }
let areasActivas = new Map();   // id → datos, solo las 'en-curso' (dibujar el círculo; el GM además avanza la cascada)

const AREA_ATASCADA_MS = 5 * 60 * 1000;   // si sigue 'en-curso' pasado esto, se cierra sola (ver más abajo)
function escucharAreas(){
  coleccionAreas().where('estado', 'in', ['en-curso', 'eligiendo']).onSnapshot(snap => {
    areasActivas.clear();
    snap.docs.forEach(doc => areasActivas.set(doc.id, doc.data()));
    pedirDibujo();
    areasActivas.forEach((a, id) => { if(a.estado === 'eligiendo') misilSiguiente(id, a); });   // los misiles: el próximo lo elige quien los tira
    // Autocuración: si a un área en curso le falta el sub-duelo que le toca (recién creada, o
    // esta pestaña del GM no llegó a verlo antes), lo crea acá — cubre el primer objetivo y
    // cualquiera que se haya quedado a mitad de camino (ej. la pestaña del GM se cerró un instante).
    if(soyGM) areasActivas.forEach((a, id) => {
      if(a.estado === 'en-curso' && !(a.duelos || [])[num(a.indice)]){ areaCrearSiguienteSubDuelo(id, a); return; }
      // Seguro contra que se quede pegada para siempre (ej. un dodge roll que nadie llegó a resolver, o
      // un permiso que falló en el último paso): pasados AREA_ATASCADA_MS igual 'en-curso', se cierra sola
      // — el pedido del dueño (2026-09-27) es que un área nunca deje una marca permanente en el mapa.
      const creado = a.creado && a.creado.toMillis ? a.creado.toMillis() : 0;
      if(creado && Date.now() - creado > AREA_ATASCADA_MS){
        coleccionAreas().doc(id).update({estado: 'terminado'}).catch(err => console.error('No se pudo cerrar el área atascada:', err));
      }
    });
  }, err => console.error('Error escuchando las áreas:', err));
}

// El GM crea el sub-duelo del objetivo que le toca ahora a esta área (o cierra el grupo si ya no queda ninguno).
async function areaCrearSiguienteSubDuelo(areaId, a){
  const idx = num(a.indice), objetivos = a.objetivos || [];
  if(idx >= objetivos.length){ coleccionAreas().doc(areaId).update({estado: 'terminado'}).catch(err => console.error('No se pudo cerrar el área:', err)); return; }
  if((a.duelos || [])[idx]) return;   // ya se creó (o dos pestañas del GM coinciden: riesgo chico y aceptado)
  const tokenId = objetivos[idx], t = tokens.get(tokenId);
  if(!t){   // el objetivo ya no está en el mapa: se lo saltea
    const siguiente = idx + 1;
    coleccionAreas().doc(areaId).update(siguiente >= objetivos.length ? {estado: 'terminado'} : {indice: siguiente}).catch(err => console.error(err));
    return;
  }
  let dueloId;
  try{
    // El casteador tira su PdG.Esp/PdG UNA SOLA VEZ para toda la cascada (dicho por el dueño, 2026-09-27): del 2do
    // objetivo en adelante, `a.pdgCompartido` (capturado del primero al resolverse, ver dueloGrupoResuelto) llega
    // precargado — este sub-duelo solo le pide la Evasión a ESTE objetivo, contra esa misma tirada.
    dueloId = await Duelo.crear({yo: a.casteador, ataque: {tipo: 'habilidad', hab: a.hab, alcance: 0}, grupo: {id: areaId, indice: idx + 1, total: Math.max(objetivos.length, num(a.hab && a.hab.reparte && a.hab.reparte.total))}, pdgCompartido: a.pdgCompartido || null},
      {id: tokenId, nombre: nombreDe(t), tipo: t.tipo, fichaId: t.fichaId, duenoUid: t.duenoUid}, a.casteador.tokenId, '');
  }catch(err){ console.error('No se pudo crear el sub-duelo del área:', err); return; }
  try{
    const doc = await coleccionAreas().doc(areaId).get();
    if(!doc.exists) return;
    const duelos = (doc.data().duelos || []).slice(); duelos[idx] = dueloId;
    await coleccionAreas().doc(areaId).update({duelos});
  }catch(err){ console.error('No se pudo anotar el sub-duelo en el área:', err); }
}

// comun/duelo.js avisa (hook grupoResuelto, solo al GM) cuando un sub-duelo con `grupo` se resuelve: avanza la cascada.
// De paso, si es el PRIMER objetivo, guarda su PdG.Esp/PdG en el área: es la tirada compartida que van a usar todos
// los objetivos siguientes (dicho por el dueño, 2026-09-27 — el casteador tira una sola vez para toda la cascada).
function dueloGrupoResuelto(d){
  const areaId = d.grupo.id, idx = num(d.grupo.indice) - 1;   // grupo.indice es 1-based
  coleccionAreas().doc(areaId).get().then(doc => {
    if(!doc.exists) return;
    const a = doc.data();
    if(a.estado !== 'en-curso' || num(a.indice) !== idx) return;   // ya avanzó por otra vía
    const siguiente = idx + 1, total = (a.objetivos || []).length;
    const reparte = a.hab && a.hab.reparte, quedan = reparte ? (num(reparte.total) || 2) - total : 0;   // los misiles: ¿queda alguno por tirar?
    const cambios = siguiente >= total ? (quedan > 0 ? {estado: 'eligiendo', indice: siguiente} : {estado: 'terminado'}) : {indice: siguiente};
    if(!a.pdgCompartido && d.pdg && !reparte) cambios.pdgCompartido = d.pdg;   // (cada misil, con su propia tirada)
    return coleccionAreas().doc(areaId).update(cambios);
  }).catch(err => console.error('No se pudo avanzar la cascada del área:', err));
}

// comun/duelo.js pide (hook chequearDodge, el botón "revisar" de la fase dodge): ¿el defensor SIGUE adentro del área?
function dueloChequearDodge(d){
  if(!d.grupo) return true;
  const a = areasActivas.get(d.grupo.id);
  const t = tokens.get(d.defensor.tokenId);
  if(!a || !t) return true;   // sin datos: por las dudas, efecto completo (más seguro que dejarlo pasar gratis)
  if(a.centro && Array.isArray(a.centro.linea)) return a.centro.linea.includes(nbPack(t.col, t.fila));   // la línea (Varita láser)
  return distanciaHex(a.centro, t) <= num(a.radio);
}

/* ---------- Fase 'dodge': minimizar solo, mostrar los No2 y el cartel "no me quiero mover" (pedido del dueño, 2026-09-27) ----------
   Mientras le toca decidir el dodge roll a ESTE cliente (el propio defensor, o el GM), el cuadro grande del duelo
   estorba para poder ver y arrastrar el token: se minimiza solo, se selecciona el token (así se ve su HUD, con el
   circulito de No2) y aparece un cartel abajo con la opción de declinar sin moverse. Al salir de la fase (se
   resolvió, moviéndose o declinando), el cuadro se vuelve a abrir solo — así se ve el veredicto. Para cualquier
   otro cliente (espectadores) estos dos hooks no hacen nada: cada uno mira su propio duelo como siempre. */
let dodgeBanner = null;   // {id, tokenId, nombre, grupoId}
function dueloDodgeEmpieza(d){
  if(!d.defensor || !(soyGM || (fbUsuario && d.defensor.uid === fbUsuario.uid))) return;
  Duelo.abrir(d.id);
  Duelo.minimizar();
  seleccionar(d.defensor.tokenId);
  dodgeBanner = {id: d.id, tokenId: d.defensor.tokenId, nombre: d.defensor.nombre, grupoId: d.grupo && d.grupo.id};
  renderDodgeBanner();
}
function dueloDodgeTermina(d){
  if(dodgeBanner && dodgeBanner.id === d.id){ dodgeBanner = null; renderDodgeBanner(); }
  if(d.defensor && (soyGM || (fbUsuario && d.defensor.uid === fbUsuario.uid))) Duelo.abrir(d.id);
}
function renderDodgeBanner(){
  // Con la estética del cuadro del duelo (2026-10-03, pedido del dueño: unificar los carteles de combate): comun/aviso-combate.js.
  if(!dodgeBanner){ AvisoCombate.cartel('dodge', null); return; }
  AvisoCombate.cartel('dodge', {icono: '🏃', titulo: `${dodgeBanner.nombre} ganó la Evasión`, posicion: 'abajo',
    texto: 'Arrastrá el token hasta 2 casilleros para intentar salir del área.',
    botones: [{texto: '🔎 Ver el duelo', sec: true, alClic: () => Duelo.abrir(dodgeBanner.id)}, {texto: '✋ No me quiero mover', alClic: () => dodgeDeclinar()}]});
}
async function dodgeDeclinar(){
  if(!dodgeBanner) return;
  const {id, tokenId, grupoId} = dodgeBanner;
  const adentro = dueloChequearDodge({grupo: grupoId ? {id: grupoId} : null, defensor: {tokenId}});
  try{ await Duelo.resolverDodge(id, !adentro); }
  catch(err){ console.error('No se pudo resolver el dodge roll:', err); toast('No se pudo resolver el dodge roll'); }
}

// El casteador eligió una habilidad de área (asistente-duelo-hab.js: objetivo 'area' + radio) y le tocó elegir el
// centro: arma la lista de objetivos (adentro del radio, rivales — nunca el propio casteador ni tokens ocultos —
// salvo que la habilidad tenga fuego amigo) y crea el documento del área; el primer sub-duelo lo crea
// escucharAreas() apenas llega el snapshot nuevo (mismo camino que cualquier avance de la cascada).
// Las casillas del cono de un área (`centro` = {col, fila, cono, rot}): el mismo de la detección, desde esa casilla y mirando para ahí.
/* Las 12 direcciones de una línea recta (2026-10-05, dueño, con dibujo): las 6 «de lado» (hacia cada vecino) pegan en todas las casillas hasta
   `largo`; las 6 «diagonales» (entre dos vecinos) solo en las casillas que caen justo sobre la línea, salteadas (con largo 4: a 2 y a 4, como mucho
   2 tokens). Coordenadas axiales (q, r) de hexACubo. → [[{col, fila}…] × 12] (las diagonales que no llegan a ninguna casilla, afuera). */
const LINEA_LADOS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]], LINEA_DIAG = [[2, -1], [1, 1], [-1, 2], [-2, 1], [-1, -1], [1, -2]];
function lineasPosibles(desde, largo){
  const c0 = hexACubo(desde), celda = (dq, dr, k) => ({col: cuboACol(c0.q + k * dq, c0.r + k * dr), fila: cuboAFila(c0.q + k * dq, c0.r + k * dr)});
  const out = LINEA_LADOS.map(([dq, dr]) => Array.from({length: largo}, (_, i) => celda(dq, dr, i + 1)));
  LINEA_DIAG.forEach(([dq, dr]) => { const cel = []; for(let k = 1; 2 * k <= largo; k++) cel.push(celda(dq, dr, k)); if(cel.length) out.push(cel); });
  return out;
}
// Cuál de las líneas apunta hacia `punto` (coordenadas del mundo): la de ángulo más parecido.
function lineaHacia(desde, lineas, punto){
  const o = hexCentro(desde.col, desde.fila), ang = Math.atan2(punto.y - o.y, punto.x - o.x);
  let mejor = 0, md = Infinity;
  lineas.forEach((cel, i) => {
    const f = hexCentro(cel[cel.length - 1].col, cel[cel.length - 1].fila);
    let d = Math.abs(Math.atan2(f.y - o.y, f.x - o.x) - ang);
    if(d > Math.PI) d = 2 * Math.PI - d;
    if(d < md){ md = d; mejor = i; }
  });
  return mejor;
}
// Mientras se elige la dirección: las 12 puntas marcadas, la trayectoria de la que apunta el mouse y, titilando, a quiénes alcanzaría (todos:
// tiene fuego amigo). La dibuja js/05 (dibujarLineaPreview) y la mueve js/06 (lineaPreviewMover).
let lineaPreview = null;   // {desde, lineas, idx, propioId}
function lineaPreviewMover(punto){
  const lp = lineaPreview;
  if(!lp) return;
  const i = lineaHacia(lp.desde, lp.lineas, punto);
  if(i === lp.idx) return;
  lp.idx = i;
  const set = new Set(lp.lineas[i].map(c => nbPack(c.col, c.fila)));
  objetivosResaltados = new Set([...tokens.entries()].filter(([id, t]) => id !== lp.propioId && set.has(nbPack(t.col, t.fila)) && (!t.oculto || soyGM) && !tapadoPorNiebla(t)).map(([id]) => id));
  pedirDibujo();
}
function conoDeArea(c){ return new Set(zonasSigilo({col: c.col, fila: c.fila, rotacion: num(c.rot)}).cono.map(x => nbPack(x.col, x.fila))); }
// «Por la espalda» (2026-10-03): el atacante está en el punto ciego del defensor — la misma cuña ciega de la visión (VISION_CUNA_CIEGA a cada
// lado de atrás; las diagonales de atrás sí se ven): pegado, solo el casillero justo de atrás. Y SOLO si el atacante está en sigilo (dueño,
// 2026-10-03): si el defensor lo puede ver, aunque venga por atrás, se da vuelta para defenderse.
/* Embestida (piernas, 2026-10-06, dueño): el primer ataque del turno suma la Embestida de quien ataca (`embestida`, PdG) si sus últimos 2 pasos
   (o más) fueron en línea recta, en la misma dirección, y el rival está en la casilla siguiente de esa línea (le llegó de frente). Una vez por
   turno. → el PdG extra (0 si no corresponde). */
const embestidaUsadas = new Set();
/* Anillos Comunes (2026-10-06): **Pulso quieto** (PdG) y **Foco** (PdG.Esp, en una habilidad que tira PdG.Esp): si quien ataca no se movió en este
   turno. **Primera sangre**: daño extra en su primer ataque del combate (se gasta al atacar; se libera al volver a narrativo, js/25). */
function quietoDe(atq, ataque){
  if(!atq || !atq.id || seMovioEsteTurno(atq.id)) return 0;
  const hab = ataque && ataque.hab;
  if(!hab) return Math.max(0, Math.round(statPiesDe(atq, 'pulso')));
  const tira = hab.tira && (hab.tira.stat || hab.tira);
  return tira === 'pdgmg' ? Math.max(0, Math.round(statPiesDe(atq, 'foco'))) : 0;
}
const primeraSangreUsadas = new Set();
function primeraSangreDe(atq, ataque){
  if(!atq || !atq.id || (ataque && ataque.hab) || primeraSangreUsadas.has(atq.id) || modoMapa !== 'combate') return 0;
  return Math.max(0, Math.round(statPiesDe(atq, 'primerasangre')));
}
function embestidaDe(atq, def){
  if(!atq || !def || !atq.id) return 0;
  const n = Math.max(0, Math.round(statPiesDe(atq, 'embestida')));
  if(!n) return 0;
  const clave = `${atq.id}@${Math.round(num(mantenimientoNumero))}`;
  const r = embestidaRutas.get(atq.id);
  if(embestidaUsadas.has(clave) || !r || r.clave !== clave || r.celdas.length < 3) return 0;
  const c = r.celdas.slice(-3).map(x => hexACubo(x)), cd = hexACubo(def), ca = hexACubo(atq);
  const fin = r.celdas[r.celdas.length - 1];
  if(fin.col !== atq.col || fin.fila !== atq.fila) return 0;   // se movió después por otro lado
  const paso = (a, b) => ({q: b.q - a.q, r: b.r - a.r});
  const p1 = paso(c[0], c[1]), p2 = paso(c[1], c[2]), p3 = paso(ca, cd);
  const igual = (a, b) => a.q === b.q && a.r === b.r;
  return igual(p1, p2) && igual(p2, p3) && distanciaHex(atq, def) === 1 ? n : 0;
}
function porLaEspalda(atq, def){
  if(!atq || !def || !enSigilo(atq)) return false;
  const k = ((Math.round(num(def.rotacion || 0) / 60) % 6) + 6) % 6;
  const rot = k * 60 * Math.PI / 180, bx = Math.sin(rot), by = -Math.cos(rot);   // "atrás" del defensor (como offsetsVision)
  const a = hexCentro(atq.col, atq.fila), d = hexCentro(def.col, def.fila);
  const vx = a.x - d.x, vy = a.y - d.y, largo = Math.hypot(vx, vy);
  if(!largo) return false;
  const ang = Math.acos(Math.max(-1, Math.min(1, (vx * bx + vy * by) / largo))) * 180 / Math.PI;
  return ang < VISION_CUNA_CIEGA - 1;
}
// Lo que deja en el suelo un área (2026-10-05, armas especiales: el fuego de la bola, el suelo de la ventisca): una zona persistente del motor
// de zonas, en la misma flor, con sus turnos, daño y/o estado (y su resistencia, contra el valor de quien la lanzó).
function dueloZonaQueda(hab, centro, radio, yo){
  const z = hab.zonaQueda;
  crearElementoZona({col: centro.col, fila: centro.fila}, {
    radio, turnos: z.turnos || 1, nombre: `${hab.nombre}${z.nombre ? ': ' + z.nombre : ''}`.slice(0, 40), color: z.color || '', amiga: true,
    dano: z.dano || '', ignoraDef: true, danoTipo: z.tipoDano || '', estado: z.estado || null,
    ...(z.contra ? {resistStat: z.contra, tiraStat: z.tira || 'dmgesp', tiraValor: num(z.tiraValor)} : {}),
    enMantenimiento: true, cadaPaso: false, casteadorRef: String(yo.ref || ''), casteadorTipo: yo.tipo === 'creep' ? 'creep' : 'pj', altura: z.altura,
    directo: !!(hab.dano && (hab.dano.directo || hab.dano.trueDamage)),   // lo que deja una varita de daño directo, también directo (2026-10-07)
  }).catch(err => console.error('No se pudo dejar la zona del área:', err));
}
function dueloElegirAreaMapa(msg){
  const yo = msg.yo, hab = msg.ataque.hab;
  cerrarBotonera();
  seleccion = null; hudCerrar(); pedirDibujo();
  const propio = t => t.fichaId === yo.ref && t.tipo === yo.tipo;
  const radio = Math.max(0, Math.round(num(hab.radio)) || 0);
  const cancelado = () => { try{ MensajesMapa.alMarco($('#botonera-marco'), 'duelo-cancelado'); }catch(e){} };
  const lanzar = async h => {
    const todos = [...tokens.entries()].map(([id, t]) => ({...t, id}));
    const mio = todos.find(propio);
    const casteador = {ref: String(yo.ref || ''), tipo: yo.tipo, nombre: String(yo.nombre || '').slice(0, 40), uid: (mio && mio.duenoUid) || fbUsuario.uid, tokenId: mio ? mio.id : ''};
    const enCono = h.cono ? conoDeArea(h) : h.linea ? new Set(h.linea) : null;   // el cono (Sonic Boom) o la línea (Varita láser): sus casillas
    if(hab.zonaQueda) dueloZonaQueda(hab, h, Math.max(1, radio), yo);   // lo que deja en el suelo (bola de fuego, ventisca)
    const objetivos = todos
      .filter(t => !t.oculto && !propio(t) && (enCono ? enCono.has(nbPack(t.col, t.fila)) : distanciaHex(h, t) <= radio))
      .filter(t => hab.fuegoAmigo || h.linea || dueloEsRival(yo, t))   // (la línea tiene fuego amigo: dueño, 2026-10-05)
      .filter(t => !hab.conVista || lineaLibre(h, t, solidosSet()))   // la luz (Varita de la luz): todos los rivales que alcanza a ver, en sigilo o no (dueño, 2026-10-05)
      .map(t => t.id);
    if(!objetivos.length){ toast(hab.conVista ? `💡 ${hab.nombre || 'La luz'}: no había ningún rival a su alcance` : 'No hay nadie adentro del área'); return; }
    try{
      await coleccionAreas().add({
        casteador, hab: Duelo.limpiarHab(hab), centro: {col: h.col, fila: h.fila, ...(h.cono ? {cono: true, rot: h.rot} : {}), ...(h.linea ? {linea: h.linea} : {})}, radio, objetivos, duelos: [], indice: 0, estado: 'en-curso',
        creadoPor: fbUsuario.uid, creado: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }catch(err){
      console.error('No se pudo lanzar el hechizo de área:', err);
      toast(err && err.code === 'permission-denied' ? 'No se pudo: faltan publicar las reglas nuevas de Firestore (areas)' : 'No se pudo lanzar el hechizo de área: ' + String((err && err.message) || err).slice(0, 120));
    }
  };
  // Cono al frente de quien la usa (Sonic Boom, 2026-10-02): el mismo cono de la detección (zonasSigilo), hacia donde mira su token.
  if(hab.objetivo === 'cono'){
    const mio = [...tokens.values()].find(propio);
    if(!mio){ toast('Tu token no está en el mapa: no se puede lanzar el cono'); cancelado(); return; }
    lanzar({col: mio.col, fila: mio.fila, cono: true, rot: Math.round(num(mio.rotacion || 0))});
    return;
  }
  // Línea recta desde quien la usa (Varita láser, 2026-10-05): se marca hacia dónde y sale del token, de `largo` casillas.
  if(hab.objetivo === 'linea'){
    const mio = [...tokens.values()].find(propio);
    if(!mio){ toast('Tu token no está en el mapa: no se puede lanzar la línea'); cancelado(); return; }
    const largo = Math.max(1, Math.round(num(hab.largo)) || 4);
    const propioId = ([...tokens.entries()].find(([, t]) => propio(t)) || [])[0] || '';
    lineaPreview = {desde: {col: mio.col, fila: mio.fila}, lineas: lineasPosibles(mio, largo), idx: -1, propioId};
    pedirDibujo();
    const fin = () => { lineaPreview = null; objetivosResaltados = null; pedirDibujo(); };
    elegirDestino(c => {
      const lp = lineaPreview;
      fin();
      if(!lp || (c.col === lp.desde.col && c.fila === lp.desde.fila)){ toast('Marcá hacia dónde, no tu propia casilla'); cancelado(); return; }
      const celdas = lp.lineas[lineaHacia(lp.desde, lp.lineas, hexCentro(c.col, c.fila))];
      lanzar({col: mio.col, fila: mio.fila, linea: celdas.map(x => nbPack(x.col, x.fila))});
    }, `<b>⚡ ${hab && hab.nombre ? esc(hab.nombre) + ': ' : ''}elegí la dirección</b> <span>mové el mouse: titilan los que alcanza (también aliados) · clic para tirar · Esc o clic derecho cancelan</span>`, true, () => { fin(); cancelado(); });
    return;
  }
  // Onda alrededor de quien la usa (Shockwave…): el centro es su propio token, no hay que marcar nada.
  if(hab.objetivo === 'onda'){
    const mio = [...tokens.values()].find(propio);
    if(!mio){ toast('Tu token no está en el mapa: no se puede lanzar la onda'); cancelado(); return; }
    lanzar({col: mio.col, fila: mio.fila});
    return;
  }
  elegirDestino(lanzar, `<b>🌀 ${hab && hab.nombre ? esc(hab.nombre) + ': marcá el centro del área' : 'Elegí el centro del área'}</b> <span>clic en el mapa (radio ${radio}) · Esc o clic derecho cancelan</span>`, true, cancelado);
}

/* ---------- Muerte de un jugador en el mapa (2026-09-26, pedido del dueño) ----------
   Cuando el personaje de este jugador queda inconsciente (HP 0), el mapa se tiñe de rojo, PERO con poco color y sin bloquear los clics (para poder seguir mirando y usando el
   entorno), muestra los turnos que le quedan y un botón «Revivir» (abre el diálogo de revivir de la ficha). Lo publica la ficha en su resumen (`muerto`). */
let muerteIframe = null;   // estado de muerte avisado por la ficha del iframe (respaldo del resumen publicado)
function actualizarMuerteMapa(){
  let el = document.getElementById('muerte-mapa');
  const fid = (!soyGM && fbUsuario) ? fichaPrincipalId() : '';
  const f = fid ? fichasPub.get(fid) : null;
  const r = f && f.resumen;
  if(r && num(r.hp) > 0) muerteIframe = null;   // ya está de pie
  const m = (r && r.muerto && r.muerto.activo && num(r.hp) <= 0) ? r.muerto : (!soyGM ? muerteIframe : null);
  const muerto = !!(m && m.activo);
  if(!muerto){ if(el) el.hidden = true; return; }
  if(!el){
    el = document.createElement('div');
    el.id = 'muerte-mapa';
    el.style.cssText = 'position:fixed;inset:0;z-index:60;pointer-events:none;background:radial-gradient(ellipse at center,rgba(150,0,0,.10) 35%,rgba(150,0,0,.34) 100%);box-shadow:inset 0 0 120px rgba(190,0,0,.35)';
    el.innerHTML = '<div id="muerte-mapa-txt" style="position:absolute;top:14px;left:50%;transform:translateX(-50%);text-align:center;color:#FFB4B4;font-family:\'Space Mono\',monospace;text-shadow:0 0 10px #000;background:rgba(40,0,0,.55);padding:8px 16px;border-radius:8px"></div>' +
      '<button type="button" id="muerte-mapa-revivir" class="btn" style="position:absolute;bottom:26px;left:50%;transform:translateX(-50%);pointer-events:auto;padding:10px 22px;font-size:15px;font-weight:700;background:#7A1E1E;border:1px solid #FF7E7E;color:#fff">✚ Revivir</button>';
    document.body.appendChild(el);
    el.querySelector('#muerte-mapa-revivir').onclick = () => abrirRevivirMapa(fichaPrincipalId());   // el mapa (js/11, A6b)
  }
  el.hidden = false;
  $('#muerte-mapa-txt').innerHTML = m.definitivo
    ? '<b>TE HAS MORIDO BIEN MUERTO Y YA NO HAY VUELTA ATRÁS</b>'
    : `<div style="font-size:11px;letter-spacing:.14em">INCONSCIENTE · turnos hasta morir</div><div style="font-size:34px;font-weight:700;line-height:1.1">${fmt(num(m.turnos))}</div>`;
  $('#muerte-mapa-revivir').style.display = m.definitivo ? 'none' : '';
}

// Aplica el daño de un duelo al HP del defensor (solo corre en el mapa del GM, ver comun/duelo.js). Reutiliza «Recibe daño»: Invulnerable y Escudo mágico valen.
// Crítico: todo el daño × el multiplicador, derecho a la vida. Sin crítico: daño − Defensa. «Pasa la mitad»: (daño − Defensa) ÷ 2, redondeado para arriba.
/* Espinas (2026-09-27, regla del dueño): si el defensor tiene el estado Espinas y lo golpean cuerpo a cuerpo, el atacante recibe 1/4 (para arriba) del daño INFLIGIDO
   (el daño del golpe con el multiplicador del crítico, ANTES de restar la Defensa: lo resista o no la armadura), directo a la vida. Solo si el golpe hizo daño (no si el defensor era
   Invulnerable). Lo aplica el mapa del GM, como el resto del daño del duelo. Desde el 2026-10-07 solo el daño físico: el especial lo devuelve el Espejo.
   Espejo (dueño, 2026-10-07): el mismo 1/4 del daño ESPECIAL que recibe (el de una habilidad o arma especial que ignora la Defensa, y el daño elemental
   de un arma), antes de la Defensa especial, a cualquier distancia — también en un área (cada objetivo con Espejo devuelve lo suyo). */
async function dueloTieneEstado(d, flag, nombre){
  const td = tokens.get(d.defensor.tokenId);
  if(!td) return false;
  const con = l => (l || []).some(e => e && e.activo !== false && (e[flag] || e.nombre === nombre));
  if(td.tipo === 'creep'){ const sc = creepPrivadoDe(td.fichaId); return !!(sc && con(sc.estados)); }
  // Una invocación (2026-10-02, paso 4 etapa 4e): sus estados, de la parte `invocaciones` de su dueño.
  if(String(td.fichaId).includes(SEP_INVOCACION)){ const inv = await invDeToken(td); return !!(inv && con(inv.estados)); }
  const f = fichasPub.get(td.fichaId);
  return !!(f && f.resumen && con(f.resumen.estados));
}
async function dueloDevolverDano(d, base, flag, nombre){
  const monto = Math.ceil(num(base) / 4);
  try{
    if(!(await dueloTieneEstado(d, flag, nombre))) return null;
    const ta = tokens.get(d.atacante.tokenId);
    const quien = d.atacante.nombre;
    if(!ta) return {quien, monto, manual: true, motivo: 'el token del atacante ya no está en el mapa'};
    // Directo a la vida (no se resta la Defensa); a una invocación, en la parte `invocaciones` de su dueño (danioInv, 2026-10-02).
    const res = ta.tipo === 'pj' && String(ta.fichaId).includes(SEP_INVOCACION) ? await danioInv(ta, String(monto), true)
      : ta.tipo === 'creep' ? await danioCreep(ta, String(monto), true) : await danioPj(ta, String(monto), true);
    return {quien, monto, recibido: num(res.r.recibido), hpAntes: num(res.previo), hpDespues: num(res.nuevo)};
  }catch(err){
    console.error(`No se pudo aplicar ${nombre === 'Espejo' ? 'el Espejo' : 'las Espinas'}:`, err);
    return {quien: d.atacante.nombre, monto, manual: true, motivo: 'falló la escritura'};
  }
}
async function dueloEspinas(d, golpe, especial){
  if(especial || (d.ataque && d.ataque.rango)) return null;
  if(!(d.resultado === 'pego' || d.resultado === 'mitad') || !(num(golpe) > 0)) return null;
  return dueloDevolverDano(d, golpe, 'espinas', 'Espinas');
}
async function dueloEspejo(d, especial){
  if(!(num(especial) > 0)) return null;
  return dueloDevolverDano(d, especial, 'espejo', 'Espejo');
}

/* Drena (2026-10-02, Drenar Vida): quien usó la habilidad se cura lo que el objetivo perdió de verdad (`monto`); lo que pasa de su vida
   máxima queda como Vida extra, hasta `drenaTope` % del máximo (sumado al que ya tenía). A un personaje, la vida en su parte
   `general` (como dueloCurar) y el Excedente por su cola de estados (comun/recibidos.js); a un creep, todo en sus datos; a una invocación,
   la vida (el excedente, a mano). */
async function dueloDrenar(d, monto){
  const quien = d.atacante.nombre;
  monto = Math.max(0, Math.round(num(monto)));
  if(!monto) return {quien, monto: 0, nota: 'no hizo daño: no drena nada'};
  const ta = tokens.get(d.atacante.tokenId);
  if(!ta) return {quien, monto, manual: true, motivo: 'el token de quien la usó ya no está en el mapa'};
  const pct = Math.max(0, num(d.hab && d.hab.dano ? d.hab.dano.drenaTope : 0));   // la Vida extra: solo las habilidades que lo dicen (un arma, no)
  // Toda la Vida extra que ya tiene (2026-10-07: se suman, cada una aparte); el drenaje le agrega solo lo que falta para el tope.
  const excedenteDe = estados => (estados || []).filter(x => x && x.activo !== false && (x.excedenteVida || x.excedente || x.nombre === 'Excedente de vida' || x.nombre === 'Vida extra'))
    .reduce((a, e) => a + num(e.escudoMagicoActual ?? e.escudo ?? e.escudoMagico), 0);
  try{
    if(ta.tipo === 'creep'){
      const r = await modificarCreep(ta.fichaId, sc => {
        const previo = num(sc.hp), max = num(sc.hpMax) > 0 ? num(sc.hpMax) : previo + monto;
        sc.hp = Math.min(max, previo + monto);
        const sobra = monto - (sc.hp - previo), tope = Math.floor(max * pct / 100), antes = excedenteDe(sc.estados);
        const exc = sobra > 0 && tope > antes ? Math.min(tope, antes + sobra) - antes : 0;
        if(exc) EstadosAplicar.aplicarACreep(sc, {nombre: 'Vida extra', escudoMagico: exc});
        return {previo, nuevo: sc.hp, exc};
      });
      return {quien, monto, hpAntes: r.previo, hpDespues: r.nuevo, ...(r.exc ? {excedente: r.exc} : {})};
    }
    if(String(ta.fichaId).includes(SEP_INVOCACION)){
      const r = await dueloCurarInv(ta, monto);
      const sobra = monto - (num(r.nuevo) - num(r.previo));
      return {quien, monto, hpAntes: num(r.previo), hpDespues: num(r.nuevo), ...(sobra > 0 && pct ? {nota: `lo que pasa del máximo (${sobra}), a mano`} : {})};
    }
    const r = await dueloCurar(ta, monto);
    const sobra = monto - (num(r.nuevo) - num(r.previo));
    const f = fichasPub.get(ta.fichaId), rs = (f && f.resumen) || {};
    const max = num(rs.hpMax) > 0 ? num(rs.hpMax) : num(r.nuevo), tope = Math.floor(max * pct / 100), antes = excedenteDe(rs.estados);
    const exc = sobra > 0 && tope > antes ? Math.min(tope, antes + sobra) - antes : 0;
    if(exc) await EstadosAplicar.encolarPj({fichaId: ta.fichaId, duenoUid: ta.duenoUid, spec: {nombre: 'Vida extra', escudoMagico: exc}, origen: `${quien} · ${d.hab ? d.hab.nombre : (d.ataque.armaNombre || 'su arma')}`});
    return {quien, monto, hpAntes: num(r.previo), hpDespues: num(r.nuevo), ...(exc ? {excedente: exc} : {})};
  }catch(err){
    console.error('No se pudo aplicar el drenaje:', err);
    return {quien, monto, manual: true, motivo: 'falló la escritura'};
  }
}

async function dueloAplicarDano(d){
  const dn = d.dano, t = tokens.get(d.defensor.tokenId);
  const critReal = d.resultado === 'pego' && d.crit && d.crit.critico;   // un crítico siempre ignora la Defensa, aunque el d20 no multiplique (×1)
  const magico = !!(d.hab && d.hab.dano && d.hab.dano.ignoraDef && d.resultado === 'pego');   // el daño mágico de una habilidad ignora la Defensa y no critica
  // Daño directo (proyectiles chicos): ignora también la Defensa especial. True Damage: ignora toda defensa y la Res. elemental (dueño, 2026-10-07).
  const trueDmg = !!(magico && d.hab.dano.trueDamage), directo = !!(magico && d.hab.dano.directo);
  const crit = critReal || magico;
  const habMagica = magico;   // (adentro del try, «magico» es otra cosa: el daño mágico del arma)
  // La pelea cercana (2026-10-05): pierde 1 por cada casillero de distancia después del primero (al lado, entero).
  const ta0 = d.atacante && tokens.get(d.atacante.tokenId);
  const menosDist = d.hab && d.hab.menosDistancia && ta0 && t ? Math.max(0, distanciaHex(ta0, t) - 1) : 0;
  const mult = critReal ? d.crit.mult : 1, crudo = Math.max(0, num(dn.crudo) - menosDist), golpe = crudo * mult;
  const base = {crudo, mult, golpe, ignoraDef: crit, mitad: d.resultado === 'mitad'};
  if(!t) return {...base, manual: true, motivoManual: 'el token ya no está en el mapa'};
  const esInv = t.tipo === 'pj' && String(t.fichaId).includes(SEP_INVOCACION);
  let def = 0, armadmg = 0, invLeida = null;
  if(esInv){   // 4e: su Defensa y su Defensa especial, de sus datos (comun/inv-calculo.js, que se carga si hace falta)
    try{
      await bnCargarPiezas();
      const inv = await invDeToken(t);
      if(!inv) return {...base, manual: true, motivoManual: 'la invocación ya no está'};
      invLeida = inv;
      ({def, armadmg} = defensasDeInv(inv));
    }catch(err){ console.error('No se pudieron leer los datos de la invocación:', err); return {...base, manual: true, motivoManual: 'es una invocación (no se pudieron leer sus datos)'}; }
  }
  else if(t.tipo === 'creep'){ const sc = creepPrivadoDe(t.fichaId); def = sc ? creepDefensaMapa(sc) : 0; armadmg = sc ? creepArmadmgMapa(sc) : 0; }
  else{ const f = fichasPub.get(t.fichaId); def = f && f.resumen && f.resumen.def !== undefined ? num(f.resumen.def) : 0; armadmg = f && f.resumen ? num(f.resumen.armadmg || 0) : 0; }
  // Un crítico real ignora la Defensa entera (0); el daño de casteo que la ignora (Paso 1) resta la Defensa especial (Paso 3) en vez de nada.
  // El elemento del daño de la habilidad (2026-10-04): se resta además la resistencia de quien lo recibe a ese elemento (Res. fuego…).
  const elDano = d.hab && d.hab.dano ? Combatiente.elementoDe(d.hab.dano.tipo) : '';
  const frenaAm = magico && !directo && !trueDmg && Combatiente.frenaArmaduraMagica(elDano);   // la Defensa especial frena todo el daño especial (también el tóxico, 2026-10-07)
  const restaIgnorando = frenaAm ? armadmg : 0;
  const resEl = elDano && !trueDmg ? (await resistenciasDe(t, elDano, invLeida)).res : 0;
  const freno = [...(menosDist ? [`la distancia ${menosDist}`] : []), ...(frenaAm && armadmg ? [`Defensa especial ${armadmg}`] : []), ...(resEl ? [Combatiente.resElementalTxt(elDano, resEl)] : [])].join(' − ');
  let aplicar = golpe, ignoraDef = crit;
  if(base.mitad){ aplicar = Math.ceil(Math.max(0, golpe - def) / 2); ignoraDef = true; }
  // Bloqueo perdido (mitad del daño): el arma o escudo con el que bloqueó pierde 1 punto de durabilidad (solo personajes: los creeps y las invocaciones no llevan).
  let desgaste = '';
  if(base.mitad && t.tipo === 'pj' && d.defensa && d.defensa.itemId){
    try{ await EstadosAplicar.encolarPj({fichaId: t.fichaId, duenoUid: t.duenoUid, spec: {nombre: 'Desgaste', item: d.defensa.itemId}, origen: `${d.atacante.nombre} · Bloqueo perdido`}); desgaste = d.defensa.itemNombre || 'el objeto'; }
    catch(err){ console.error('No se pudo pedir el desgaste del ítem:', err); }
  }
  try{
    const oD = {distancia: !!(d.ataque && d.ataque.rango), magico: !!(habMagica || elDano)};   // magico: el Orbe de absorción (js/26)   // la Defensa extra contra armas a distancia (torso blando, 2026-10-06)
    const res = esInv ? await danioInv(t, String(aplicar), ignoraDef, restaIgnorando, resEl, oD)
      : t.tipo === 'creep' ? await danioCreep(t, String(aplicar), ignoraDef, restaIgnorando, resEl, oD) : await danioPj(t, String(aplicar), ignoraDef, restaIgnorando, resEl, oD);
    const espinas = res.r.invulnerable ? null : await dueloEspinas(d, golpe, habMagica);   // el daño inflictido (con el multiplicador del crítico), antes de la Defensa; solo el físico
    // Daño mágico del arma (rayo / hielo): aparte, después del golpe — ignora la Defensa (resta la Defensa especial) y no se multiplica.
    let magico = null;
    if(dn.magico && num(dn.magico.total) > 0 && !res.r.invulnerable){
      const rm = esInv ? await danioInv(t, String(num(dn.magico.total)), true, armadmg, 0, {magico: true})
        : t.tipo === 'creep' ? await danioCreep(t, String(num(dn.magico.total)), true, armadmg, 0, {magico: true}) : await danioPj(t, String(num(dn.magico.total)), true, armadmg, 0, {magico: true});
      magico = {...dn.magico, recibido: num(rm.r.recibido), hpAntes: num(rm.previo), hpDespues: num(rm.nuevo)};
    }
    // El Espejo: 1/4 de todo el daño especial que le tiraron (el de la habilidad y el elemental del arma), antes de la Defensa especial.
    const espejo = res.r.invulnerable ? null : await dueloEspejo(d, (habMagica ? golpe : 0) + (magico ? num(dn.magico.total) : 0));
    const perdio = Math.max(0, num(res.previo) - num(res.nuevo));
    // Habilidad que drena: todo lo que perdió. Arma que drena (2026-10-03): su % de lo que perdió de verdad (curar redondea para arriba).
    // Una habilidad que drena: lo que perdió, o su % (`drenaPct`, la Sanguijuela: la mitad, para arriba).
    const drena = d.hab && d.hab.dano && d.hab.dano.drena ? await dueloDrenar(d, num(d.hab.dano.drenaPct) > 0 ? Math.ceil(perdio * num(d.hab.dano.drenaPct) / 100) : perdio)
      : !d.hab && num(dn.drenaPct) > 0 ? await dueloDrenar(d, Math.ceil(perdio * num(dn.drenaPct) / 100)) : null;
    // Rayo en cadena (2026-10-05): el golpe de una habilidad o arma especial de rayo salta (la misma regla de ⚡ Rayo en cadena del token).
    if(d.hab && d.hab.cadena && golpe > 0 && !res.r.invulnerable) await dueloCadena(d, golpe).catch(err => console.error('No se pudo hacer saltar el rayo:', err));
    if(d.hab && d.hab.atrae && !res.r.invulnerable) await dueloAtraer(d).catch(err => console.error('No se pudo atraer al objetivo:', err));   // el gancho
    return {...base, desgaste, defensa: crit ? restaIgnorando : def, ...(freno ? {freno} : {}), recibido: num(res.r.recibido), absorbido: num(res.r.absorbido), invulnerable: !!res.r.invulnerable, hpAntes: num(res.previo), hpDespues: num(res.nuevo), ...(espinas ? {espinas} : {}), ...(espejo ? {espejo} : {}), ...(drena ? {drena} : {}), ...(magico ? {magico} : {})};
  }catch(err){
    console.error('No se pudo aplicar el daño del duelo:', err);
    return {...base, defensa: def, manual: true, golpe: base.mitad ? aplicar : golpe, motivoManual: err && err.message === 'SIN_DEF' ? 'la ficha todavía no publicó su Defensa' : 'falló la escritura'};
  }
}

// Los saltos del rayo: al más cercano del mismo bando que el golpeado, la mitad cada salto (rayoCadena, js/10), hasta `saltos` veces; se ve el rayo
// saltando en el mapa (rayoSaltoEfecto, js/19) y se aplica lo que este cliente puede (rayoCadenaAplicar: el GM los creeps; lo demás, en la Mesa).
async function dueloCadena(d, golpe){
  const id = d.defensor && d.defensor.tokenId;
  if(!id || !tokens.get(id)) return;
  const c = d.hab.cadena, cadena = rayoCadena(id, golpe).slice(0, 1 + Math.max(1, num(c.saltos) || 2));
  if(cadena.length < 2) return;
  // El rayo saltando se ve en TODAS las pantallas (2026-10-05, dueño): va en un momento de la Crónica (rayoMomento, js/16), no solo acá.
  const saltos = cadena.slice(1).map((s, i) => ({desde: cadena[i].id, hacia: s.id}));
  // Los efectos del golpe también a cada uno al que salta (`cadena.efectos`, el Relámpago, 2026-10-07): cada uno tira su chance, como en el golpe.
  const extra = [];
  if(c.efectos){
    for(const s of cadena.slice(1)){
      for(const ef of (d.efectos || []).filter(e => e && !e.cura && Duelo.specDeEfecto(e))){
        const caras = Math.max(1, Math.round(num(ef.caras)) || 1), exitos = Math.max(1, Math.round(num(ef.exitos)) || 1);
        if(Math.floor(Math.random() * caras) >= exitos) continue;
        try{ const r = await dueloAplicarEfecto({...d, defensor: {...d.defensor, tokenId: s.id, nombre: nombreDe(s.t)}}, ef); extra.push(`${s.t.oculto ? 'Alguien' : nombreDe(s.t)}: ${ef.nombre}${r && r.manual ? ' (a mano)' : ''}`); }
        catch(err){ console.error('No se pudo aplicar el efecto del salto:', err); extra.push(`${nombreDe(s.t)}: ${ef.nombre} (a mano)`); }
      }
    }
  }
  momentoAbrir({tipo: 'rayo', icono: '⚡', titulo: `${d.hab.nombre}: el rayo salta`, estado: 'listo', datos: {saltos},
    resultado: cadena.slice(1).map(s => `${s.t.oculto ? 'Alguien' : nombreDe(s.t)} (${s.dano})`).join(' → ') + (extra.length ? ` · ${extra.join(' · ')}` : '')});
  await rayoCadenaAplicar(cadena);
}

/* El gancho (2026-10-05, Varita del gancho): si pegó, el objetivo tira su Fuerza contra el Ef.Esp de quien la usó (el valor de cuando la usó); si
   pierde, lo trae hasta `casillas` hacia quien la usó, por casillas libres (Inamovible: su chance de no moverse). Todo a la vista en la Crónica. */
async function dueloAtraer(d){
  const t = tokens.get(d.defensor.tokenId), ta = tokens.get(d.atacante.tokenId), a = d.hab.atrae;
  if(!t || !ta) return;
  const nom = nombreDe(t), titulo = `${d.hab.nombre}: ¿${nom} se resiste?`;
  const fue = trampaValorStat(t, a.contra || 'fue'), fF = formulaParaValor(fue), fE = formulaParaValor(num(a.tiraValor));
  const rF = fF ? tirarDados(fF.formula) : {total: 0}, rE = fE ? tirarDados(fE.formula) : {total: 0};
  const cuenta = `Fuerza ${fF ? fF.formula : '0'} → ${rF.total} contra Ef.Esp ${fE ? fE.formula : '0'} → ${rE.total}`;
  if(rF.total >= rE.total){ momentoAbrir({tipo: 'gancho', icono: '🪝', titulo, resultado: `${cuenta}: se planta y no lo mueve.`, estado: 'listo'}); return; }
  const im = chanceDe(t, 'inamovible');
  if(im && Math.random() * 100 < im){ momentoAbrir({tipo: 'gancho', icono: '🪝', titulo, resultado: `${cuenta}: pierde, pero es Inamovible (${im} %): no se mueve.`, estado: 'listo'}); return; }
  let c = {col: t.col, fila: t.fila}, pasos = 0;
  const ocupada = x => elementoSolidoEn(x.col, x.fila) || [...tokens.values()].some(y => y !== t && y.col === x.col && y.fila === x.fila);
  for(let i = 0; i < a.casillas && distanciaHex(c, ta) > 1; i++){
    const sig = vecinosDeCasilla(c).filter(v => !ocupada(v) && distanciaHex(v, ta) < distanciaHex(c, ta)).sort((p, q) => distanciaHex(p, ta) - distanciaHex(q, ta))[0];
    if(!sig) break;
    c = sig; pasos++;
  }
  if(!pasos){ momentoAbrir({tipo: 'gancho', icono: '🪝', titulo, resultado: `${cuenta}: pierde, pero no hay lugar para traerlo.`, estado: 'listo'}); return; }
  await coleccionTokens().doc(d.defensor.tokenId).update({col: c.col, fila: c.fila, ruta: firebase.firestore.FieldValue.delete()});
  momentoAbrir({tipo: 'gancho', icono: '🪝', titulo, resultado: `${cuenta}: pierde — lo trae ${pasos} casillero${pasos === 1 ? '' : 's'} hacia ${d.atacante.nombre}.`, estado: 'listo'});
}

// Opciones de defensa de un creep, calculadas en el mapa del GM sin cargar las Acciones: Evasión o Parry con su arma (siempre 1 No2). null = no es un creep mío.
function dueloOpcionesLocal(d){
  const ref = d.defensor.ref;
  const motivo = m => { window.DUELO_MOTIVO = `${m} · soy GM: ${soyGM ? 'sí' : 'no'} · tipo: ${d.defensor.tipo} · ref: ${ref || '(vacía: el token no está vinculado a un creep)'} · privado: ${creepsPriv.has(ref) ? (creepsPriv.get(ref).sc ? 'cargado' : 'cargando') : 'no'} · público: ${creepsPub.has(ref) ? 'sí' : 'no'}`; return null; };
  if(d.defensor.tipo !== 'creep') return null;
  if(!soyGM) return motivo('no sos el GM');
  const sc = creepPrivadoDe(ref);
  if(!sc) return motivo('no encuentro los datos de ese creep');
  window.DUELO_MOTIVO = '';
  if(d.hab) return Duelo.opcionesHab(d, {puedeParry: () => !!defensaCreepMapa(sc)});   // habilidad dirigida: lo que puede tirar el creep contra ella
  // Con las Acciones nuevas cargadas, las mismas opciones que GM Tools (comun/creep-duelo.js: con los dados que tiraría y la Evasión contra
  // oportunidad / contraataque, 2026-10-04); si no, la versión corta de abajo.
  const hk = typeof acHooksDuelo === 'function' ? acHooksDuelo(d.defensor) : null;
  if(hk && hk.opcionesDefensa){ const o = hk.opcionesDefensa(d) || []; return d.ataque && d.ataque.sinParry ? o.filter(x => x.modo !== 'parry') : o; }
  // Parry solo con un arma de verdad o un escudo (regla del dueño, 2026-09-30, comun/combatiente.js; la misma que GM Tools).
  const def = defensaCreepMapa(sc), c = Combatiente.costoParry();
  if(Combatiente.stuneado(sc.estados)) return [{modo: 'evasion', etiqueta: '🏃 Evasión · Stun: 1'}];   // Stun (2026-10-06)
  const ops = [{modo: 'evasion', etiqueta: '🏃 Evasión'}];
  if(def) ops.push({modo: 'parry', itemId: '', itemNombre: def.nombre, etiqueta: `${def.nombre === sc.armaNombre ? '🗡' : '🛡'} Parry · ${def.nombre}`, costo: c, motivoNo: ''});   // sin No2: queda en negativo (2026-10-06)
  return d.ataque && d.ataque.sinParry ? ops.filter(o => o.modo !== 'parry') : ops;   // Takle y otros ataques que no se pueden parrear
}
// ⚡ Flash de un creep (P135): si no tiene ninguno que sirva para esta tirada, el mapa contesta solo ([]) y no hace falta
// cargar GM Tools; si tiene, contesta GM Tools (que es quien lo cobra: cooldown). null = que pregunte.
function dueloFlashLocal(d, campo, lado){
  if(!soyGM) return [];
  const sc = creepPrivadoDe(lado.ref);
  if(!sc) return null;
  return (sc.habilidades || []).some(h => Combatiente.flashPara(h.duelo, campo)) ? null : [];
}
function defensaCreepMapa(sc){ return CreepCalculo.defensa(sc); }   // con qué para (comun/creep-calculo.js)

// Pone el estado de un efecto del golpe sobre el defensor (solo corre en el mapa del GM). Creep: se escribe su estado; personaje: le llega a su ficha (mismo
// mecanismo que las trampas y las habilidades de creep); invocación o sin estado automático: a mano.
// Cura de una habilidad sobre el token del objetivo (creep: su HP; personaje: su ficha, como el daño), sin pasar del máximo.
async function dueloCurar(t, n){
  n = Math.max(0, Math.round(num(n)));
  if(t.tipo === 'pj' && String(t.fichaId).includes(SEP_INVOCACION)) return dueloCurarInv(t, n);
  if(t.tipo === 'creep'){
    const res = await modificarCreep(t.fichaId, sc => { const previo = num(sc.hp); const tope = num(sc.hpMax) > 0 ? num(sc.hpMax) : previo + n; sc.hp = Math.min(tope, previo + Combatiente.curaQueEntra(previo, n)); return {previo, nuevo: sc.hp}; });
    return {previo: res.previo, nuevo: res.nuevo, ...(n > 0 && res.previo <= 0 ? {caido: true} : {})};
  }
  const base = fbDb.doc(fbRutaCampana(`fichas/${t.fichaId}`));
  const parteRef = base.collection('partes').doc('general');
  const ts = firebase.firestore.FieldValue.serverTimestamp();
  return fbDb.runTransaction(async tx => {
    const [parte, ficha] = await Promise.all([tx.get(parteRef), tx.get(base)]);
    if(!parte.exists || !ficha.exists) throw new Error('La ficha todavía no se guardó en la mesa');
    const datos = JSON.parse(parte.data().json || '{}');
    const rs = ficha.data().resumen || {};
    const previo = num(datos.hp), tope = num(rs.hpMax) > 0 ? num(rs.hpMax) : previo + n;
    if(n > 0 && previo <= 0) return {previo, nuevo: previo, caido: true};   // una cura no levanta a un caído (Combatiente.curaQueEntra)
    datos.hp = Math.min(tope, previo + n);
    tx.set(parteRef, {json: JSON.stringify(datos), actualizado: ts});
    tx.update(base, {actualizado: ts, 'resumen.hp': datos.hp});
    return {previo, nuevo: datos.hp};
  });
}

// La cura a una invocación (B-8, 2026-10-02): como danioInv, sobre la parte `invocaciones` de su dueño y su resumen.
async function dueloCurarInv(t, n){
  const [fichaId, invId] = String(t.fichaId).split(SEP_INVOCACION);
  const base = fbDb.doc(fbRutaCampana(`fichas/${fichaId}`));
  const parteRef = base.collection('partes').doc('invocaciones');
  const ts = firebase.firestore.FieldValue.serverTimestamp();
  return fbDb.runTransaction(async tx => {
    const [parte, ficha] = await Promise.all([tx.get(parteRef), tx.get(base)]);
    if(!parte.exists || !ficha.exists) throw new Error('La ficha todavía no se guardó en la mesa');
    const datos = JSON.parse(parte.data().json || '{}');
    const inv = (datos.invocaciones || []).find(i => i && i.id === invId);
    if(!inv) throw new Error('La invocación ya no existe');
    const previo = num(inv.hp), tope = num(inv.hpMax) > 0 ? num(inv.hpMax) : previo + n;
    if(n > 0 && previo <= 0) return {previo, nuevo: previo, caido: true};   // una cura no levanta a un caído
    inv.hp = Math.min(tope, previo + n);
    const rs = ficha.data().resumen || {};
    tx.set(parteRef, {json: JSON.stringify(datos), actualizado: ts});
    tx.update(base, {actualizado: ts, 'resumen.invocaciones': (rs.invocaciones || []).map(i => i.id === invId ? {...i, hp: inv.hp} : i)});
    return {previo, nuevo: inv.hp};
  });
}
// Los stacks de veneno de más de quien atacó (Guantes del envenenador): un personaje o una invocación por su resumen; un creep, por su equipo.
function venenistaDe(lado){
  const t = lado && lado.tokenId ? tokens.get(lado.tokenId) : null;
  if(!t) return 0;
  if(t.tipo === 'creep'){ const sc = creepPrivadoDe(t.fichaId); return sc ? Math.max(0, Math.round(num(CreepCalculo.modTotal(sc, 'venenista')))) : 0; }
  const ri = typeof resumenDeInv === 'function' ? resumenDeInv(t) : null;
  if(ri) return Math.max(0, Math.round(num(ri.venenista)));
  return statPjDe(t, 'venenista');
}
/* Una cura que no pasa desapercibida (2026-10-07, dueño: «que tenga su momento: "fulano te curó X", con ACEPTAR; y para el resto, en la
   Crónica»). La cura ya entró; a quien la recibió (el dueño del personaje) le aparece el Aviso al centro, y los demás la ven en la Crónica.
   De un creep no se cuenta la vida que le queda (es del GM). */
function dueloCuraMomento(d, t, n, r){
  const quien = d.atacante && d.atacante.nombre ? d.atacante.nombre : 'Alguien', a = t.oculto ? 'alguien' : nombreDe(t);
  const pj = t.tipo === 'pj', mismo = d.atacante && d.atacante.tokenId === d.defensor.tokenId;
  const titulo = mismo ? `${quien} se curó` : `${quien} curó a ${a}`;
  const resultado = r.caido ? `No lo levanta: ${a} está caído (hace falta revivirlo)` : `+${fmt(n)} de vida${pj ? ` (${fmt(r.previo)} → ${fmt(r.nuevo)})` : ''}`;
  momentoAbrir({tipo: 'cura', icono: '💚', titulo, resultado, estado: 'listo',
    datos: pj && t.duenoUid ? {paraUid: t.duenoUid, aviso: !mismo, boton: '💚 Aceptar',
      veredicto: r.caido ? {tono: 'neutro', grande: 'Caído', chico: 'Una cura no levanta a un caído: hace falta revivirlo'}
        : {tono: 'bueno', grande: `+${fmt(n)}`, chico: mismo ? `te curaste ${fmt(n)} de vida (${fmt(r.previo)} → ${fmt(r.nuevo)})` : `${quien} te curó ${fmt(n)} de vida (${fmt(r.previo)} → ${fmt(r.nuevo)})`}} : {}});
}
async function dueloAplicarEfecto(d, ef){
  const spec = Duelo.specDeEfecto(ef);
  if(!spec) return {manual: true, nota: 'a mano'};
  const t = tokens.get(d.defensor.tokenId);
  if(!t) return {manual: true, nota: 'el token ya no está: aplicalo a mano'};
  if(spec.nombre === 'Demora') return dueloDemora(d.defensor.tokenId);
  // La purga (2026-10-07, Varita de la purga): el estado malo más reciente (el último de la lista; no los que salen solos del equipo o las pasivas).
  if(spec.purga){
    const lista = ((vinculo(t) || {}).resumen || {}).estados || [];
    let idx = -1;
    for(let i = lista.length - 1; i >= 0; i--){ const e = lista[i]; if(e && e.polaridad === 'debuff' && !e.derivado && e.activo !== false){ idx = i; break; } }
    if(idx < 0) return {nota: 'no tenía ningún estado malo'};
    const nom = lista[idx].nombre;
    try{ await hudEstadoCambiar(t, idx, 'quitar'); return {nota: `le sacó ${nom}`}; }
    catch(err){ console.error('No se pudo aplicar la purga:', err); return {manual: true, nota: `sacale ${nom} a mano`}; }
  }
  // La cosecha (2026-10-07, Varita de la cosecha): la marca lleva el nombre de quien la puso («Cosecha de juan»); si muere marcado, ese
  // recupera 2 SP y 2 de vida (js/10 cosechaSiMuere).
  if(spec.nombre === 'Cosecha'){
    spec.nombre = `Cosecha de ${String(d.atacante.nombre || 'alguien').slice(0, 28)}`; spec.polaridad = 'debuff';
    if(!(num(spec.turnos) > 0)) spec.turnos = 3;
    spec.detalle = `Marcado: si muere con esta marca, ${d.atacante.nombre || 'quien lo marcó'} recupera 2 SP y 2 de vida.`;
  }
  // «Pierde No2» (2026-10-02, Sonic Boom): cuántos = el número + la diferencia entre las tiradas; en 0, Sentado si corresponde.
  if(spec.nombre === 'Pierde No2'){
    const n = Math.max(0, Math.round(num(spec.no2))) + (spec.no2Dif ? Math.abs(Math.round(num(d.contacto && d.contacto.dif))) : 0);
    if(t.tipo === 'creep'){
      const r = await modificarCreep(t.fichaId, sc => {
        const antes = num(sc.nitros); sc.nitros = Math.max(0, antes - n);
        const sentado = sc.nitros <= 0 && spec.no2Sentado ? EstadosAplicar.aplicarACreep(sc, {nombre: 'Sentado'}).ok : false;
        return {antes, despues: sc.nitros, sentado};
      });
      return {nota: `−${n} No2 (${fmt(r.antes)} → ${fmt(r.despues)})${r.sentado ? ' · quedó Sentado' : ''}`};
    }
    await EstadosAplicar.encolarPj({fichaId: t.fichaId, duenoUid: t.duenoUid, spec: {nombre: 'Pierde No2', stacks: n, ...(spec.no2Sentado ? {sentadoEnCero: true} : {})}, origen: `${d.atacante.nombre} · ${ef.nombre}`});
    return {nota: `le llegó a su ficha: −${n} No2${spec.no2Sentado ? ' (en 0, Sentado)' : ''}`};
  }
  if(spec.cura){
    try{
      const r = await dueloCurar(t, spec.cura);
      dueloCuraMomento(d, t, spec.cura, r);
      return {nota: r.caido ? Combatiente.CAIDO_TXT : `+${spec.cura} HP (${fmt(r.previo)} → ${fmt(r.nuevo)})`};
    }
    catch(err){ console.error('No se pudo aplicar la cura del duelo:', err); return {manual: true, nota: 'no se pudo curar solo: aplicalo a mano'}; }
  }
  // Guantes del envenenador (2026-10-05): los venenos que pone quien atacó llevan esos stacks de más (un turno más y 1 de daño más por turno).
  const vn = /veneno/i.test(String(spec.nombre || '')) ? venenistaDe(d.atacante) : 0;
  if(vn > 0){
    const base = Math.max(1, num(spec.stacks) || num(((EstadosAplicar.DEBUFFS || []).find(x => x.nombre === spec.nombre) || {}).stacks) || 1);
    spec.stacks = base + vn;
  }
  const veces = spec.nombre === 'Armadura rota' ? Math.max(1, num(spec.stacks) || 1) : 1;
  const unico = spec.nombre === 'Armadura rota' ? {nombre: 'Armadura rota'} : spec;
  if(t.tipo === 'creep'){
    const res = await modificarCreep(t.fichaId, sc => {
      let r = {ok: false};
      for(let i = 0; i < veces; i++) r = EstadosAplicar.aplicarACreep(sc, unico);
      const e = (sc.estados || []).find(x => x && x.nombre === unico.nombre);   // con cuánto quedó (si ya tenía, se acumula: 2026-10-06)
      return {...r, total: e ? Number(e.stacks) || 0 : 0};
    });
    const sumado = EstadosAplicar.texto(unico) + (veces > 1 ? ` ×${veces}` : '');
    const total = res && res.total > Math.max(1, num(unico.stacks) || 1) * veces ? ` → ahora ×${res.total}` : '';
    return res && res.ok ? {nota: sumado + total} : {nota: 'no entró: ' + ((res && res.motivo) || 'está protegido')};
  }
  for(let i = 0; i < veces; i++) await EstadosAplicar.encolarPj({fichaId: t.fichaId, duenoUid: t.duenoUid, spec: unico, origen: `${d.atacante.nombre} · ${ef.nombre}`});
  return {nota: 'le llegó a su ficha: ' + EstadosAplicar.texto(unico) + (veces > 1 ? ` ×${veces}` : '')};
}

// Demora (Tipo 10, dueño 2026-10-03): baja al golpeado 1 lugar en el orden de turnos, definitivo (como el ▼ del GM: el turno sigue con quien
// lo tenía). Dos casos quedan a mano, porque moverlo solo rompería la ronda: si ya actuó y quedaría después de quien tiene el turno (actuaría
// dos veces), o si es su propio turno (el de abajo perdería el suyo).
async function dueloDemora(tokenId){
  const orden = iniciativa.orden.slice();
  const i = orden.findIndex(o => o.id === tokenId);
  if(i < 0) return {manual: true, nota: 'no está en el orden de turnos: a mano'};
  if(i === orden.length - 1) return {nota: 'ya era el último del orden de turnos'};
  if(i === iniciativa.turno) return {manual: true, nota: 'es su turno: bajalo 1 lugar (▼) cuando termine'};
  if(i + 1 === iniciativa.turno) return {manual: true, nota: 'ya actuó esta ronda: bajalo 1 lugar (▼) al empezar la próxima'};
  const activo = orden[iniciativa.turno] ? orden[iniciativa.turno].id : null;
  [orden[i], orden[i + 1]] = [orden[i + 1], orden[i]];
  const turno = activo ? Math.max(0, orden.findIndex(o => o.id === activo)) : iniciativa.turno;
  if(!(await guardarIniciativa({orden, turno}))) return {manual: true, nota: 'no se pudo mover en el orden de turnos: a mano'};
  return {nota: `baja 1 lugar en el orden de turnos (${i + 1}.º → ${i + 2}.º)`};
}

// Le manda un pedido del duelo (opciones de defensa, tirar, contraatacar) al iframe de la ficha o de las Acciones del creep de ese lado, sin mostrarlo.
function dueloRelayMapa(l, msg){
  const creep = l.tipo === 'creep';
  const id = creep ? l.ref : String(l.ref).split(SEP_INVOCACION)[0];
  const marco = $('#botonera-marco');
  // GM Tools tiene todos los creeps: sirve el que esté cargado, sea cual sea el creep.
  if(botonera.herramienta === (creep ? 'gm' : 'ficha') && (creep || botonera.fichaId === id)){
    if(botonera.lista) MensajesMapa.alMarco(marco, msg); else botonera.pendiente = msg;   // cargando: se manda al estar lista
    return;
  }
  // Se carga SIN abrir nada (?precarga=1, paso 4): si no, la Botonera o las Acciones aparecerían encima del duelo.
  botonera = {herramienta: creep ? 'gm' : 'ficha', fichaId: id, invId: '', lista: false, pendiente: msg, completa: false, precarga: true};
  marco.src = sinCache(creep
    ? `../gm-toolset/gm-tools.html?partida=${encodeURIComponent(FB_CAMPANA)}&modo=acciones&precarga=1`
    : `../ficha-personaje/ficha.html?partida=${encodeURIComponent(FB_CAMPANA)}&modo=botonera&precarga=1#${encodeURIComponent(id)}`);
}
// Abrir más rápido (paso 4, etapa 1): un rato después de entrar, el mapa carga de antemano la ficha propia (jugador) o GM
// Tools (GM), sin abrir nada; la primera Botonera o Acciones ya no espera la carga.
function precargarMarco(){
  if(botonera.herramienta || !$('#botonera-capa').hidden) return;   // ya hay algo cargado o abierto
  const marco = $('#botonera-marco');
  if(soyGM){
    botonera = {herramienta: 'gm', fichaId: '', invId: '', lista: false, pendiente: null, completa: false, precarga: true};
    marco.src = sinCache(`../gm-toolset/gm-tools.html?partida=${encodeURIComponent(FB_CAMPANA)}&modo=acciones&precarga=1`);
    return;
  }
  const id = fichaPrincipalId();
  if(!id) return;
  botonera = {herramienta: 'ficha', fichaId: id, invId: '', lista: false, pendiente: null, completa: false, precarga: true};
  marco.src = sinCache(`../ficha-personaje/ficha.html?partida=${encodeURIComponent(FB_CAMPANA)}&modo=botonera&precarga=1#${encodeURIComponent(id)}`);
}

$('#botonera-cargando-x').onclick = () => { cerrarBotonera(); botonera = {herramienta: '', fichaId: '', lista: false}; $('#botonera-marco').src = 'about:blank'; };

