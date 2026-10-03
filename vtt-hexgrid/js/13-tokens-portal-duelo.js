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
   La habilidad le avisa al mapa (`portal-habilidad`): se piden DOS clics (dentro del rango de casteo del token, en casillas transitables a pie)
   y se crean dos elementos `portal` que se apuntan entre sí (`portalDestino`), con turnos (se van solos al vencer). Solo los ALIADOS los usan. */
async function portalDeHabilidad(msg){
  const t = [...tokens.values()].find(x => x.fichaId === msg.fichaId);
  if(!t){ toast(`${msg.nombre || 'Invocar portal'}: tu personaje no tiene token en el mapa, no se pueden colocar los portales`); return; }
  const rg = rangoDeToken(t), alcance = rg ? Math.floor(num(rg.casteo)) : 0;
  if(alcance < 1){ toast('Tu rango de casteo es 0: los portales no alcanzan a ningún punto (abrí la ficha una vez para que se publique)'); return; }
  if(!$('#botonera-capa').hidden) escapeABotonera();
  const puntos = [];
  const pedir = () => elegirDestino(h => {
    const yo = {col: t.col, fila: t.fila};
    if(distanciaHex(h, yo) > alcance){ toast(`Ese punto queda a más de ${alcance} casilleros (tu rango de casteo)`); pedir(); return; }
    if(puntos.some(p => p.col === h.col && p.fila === h.fila)){ toast('Elegí otra casilla: los dos portales no pueden estar en el mismo punto'); pedir(); return; }
    puntos.push(h);
    if(puntos.length < 2){ toast('Primer portal marcado: elegí el segundo'); pedir(); return; }
    portalesCrear(puntos, msg.turnos, msg.nombre);
  }, `<b>🌀 ${esc(msg.nombre || 'Invocar portal')}: elegí el portal ${puntos.length + 1} de 2</b> <span>clic en una casilla transitable a pie dentro de tu rango de casteo (${alcance}) · Esc o clic derecho cancelan</span>`);
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
    color: /^#[0-9a-fA-F]{6}$/.test(cfg.color || '') ? cfg.color : (cfg.estado ? '#4C9A2A' : '#D9531E'),
    alfa: Number.isFinite(cfg.alfa) ? cfg.alfa : 40, solido: false, invisible: false,
    imagen: '', imgZoom: 1, imgDX: 0, imgDY: 0, fijado: true,
    turnos: n, venceMant: Math.round(num(mantenimientoNumero)) + n,
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
  try{
    await coleccionElementos().add(datos);
    toast(`🌫 ${cfg.nombre || 'Zona'} colocada: dura ${n} turno${n === 1 ? '' : 's'}`);
    return true;
  }catch(err){
    console.error('No se pudo crear la zona:', err);
    toast(err.code === 'permission-denied' ? 'No se pudo: faltan publicar las reglas nuevas de Firestore (zona)' : 'No se pudo colocar la zona');
    return false;
  }
}
function zonaPersistenteDeHabilidad(msg){
  const radio = Math.max(1, Math.round(num(msg.radio) || 1));
  elegirDestino(h => crearElementoZona(h, {
    radio, turnos: msg.zonaTurnos, nombre: msg.nombre, amiga: msg.zonaAmiga, dano: msg.zonaDano, ignoraDef: msg.zonaIgnoraDef,
    estado: msg.zonaEstado, resistStat: msg.resistStat, resistValor: msg.resistValor, enMantenimiento: true, cadaPaso: false,
    casteadorRef: msg.fichaId, casteadorTipo: msg.casteadorTipo,
    danoDif: msg.zonaDanoDif, danoTipo: msg.zonaDanoTipo, tiraExtra: msg.zonaTiraExtra, nota: msg.zonaNota,
    tiraStat: msg.tiraStat, tiraValor: msg.tiraValor,
  }), `<b>🌫 ${msg.nombre ? esc(msg.nombre) + ': marcá el centro' : 'Elegí el centro de la zona'}</b> <span>clic en el mapa (radio ${radio}) · Esc o clic derecho cancelan</span>`, true);
}
// 🪤 Trampa de una habilidad ✨ automática (2026-09-30, pedido del dueño): quien la usa elige la casilla con un clic (antes quedaba
// sola al lado del token). El anuncio (sin la ubicación) ya lo publicó la ficha; la trampa la ve solo su bando (trampaDeMiBando).
function trampaDeHabilidad(msg){
  elegirDestino(async h => {
    try{
      const r = await TokensAuto.colocarTrampas({fichaId: msg.fichaId, tipoToken: msg.tipoToken || 'pj', trampa: msg.trampa, mapaId: mapaMostrado, celda: {col: h.col, fila: h.fila}});
      toast(r.colocadas ? `🪤 ${msg.nombre}: ${r.colocadas > 1 ? r.colocadas + ' trampas colocadas' : 'trampa colocada'}` : `🪤 ${msg.nombre}: no se pudo colocar`);
    }catch(err){ console.error('No se pudo colocar la trampa:', err); toast('No se pudo colocar la trampa — revisá la consola'); }
  }, `<b>🪤 ${msg.nombre ? esc(msg.nombre) + ': elegí dónde colocar la trampa' : 'Elegí dónde colocar la trampa'}</b> <span>clic en el mapa · Esc o clic derecho cancelan</span>`, true);
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
        estado: r.estado, resistStat: r.resistStat, resistValor: r.resistValor, enMantenimiento: r.enMantenimiento, cadaPaso: r.cadaPaso,
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
   armas de rango = su Rango, hechizos = Rango de casteo. Sin alcance (0) no se resalta nada. */
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
  if(ataque && ataque.hab && (ataque.hab.objetivo === 'area' || ataque.hab.objetivo === 'onda')){ dueloElegirAreaMapa(msg); return; }   // hechizo de área: otro flujo (Paso 4/7)
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
      const cand = todos.filter(t => t.col === h.col && t.fila === h.fila && !propio(t) && (!t.oculto || soyGM));
      if(!cand.length){ toast('Ahí no hay otro token: hacé clic sobre el que querés atacar'); pedir(); return; }
      let t = cand[0];
      if(esValido && !esValido(t)){
        const msg = objetivoTipo === 'aliado' ? `${nombreDe(t)} es un rival, no un aliado. ¿Igual apuntarle con esta habilidad pensada para aliados?` : `${nombreDe(t)} es un aliado, no un rival. ¿Igual atacarlo?`;
        if(!confirm(msg)){ pedir(); return; }
      }
      dueloAvisoObjetivoOcultar();
      try{ t = await dueloVincularSiFalta(t); }catch(err){ console.error('No se pudo vincular el token al creep:', err); }
      const mio = todos.find(propio);
      Duelo.crear({yo, ataque}, {id: t.id, nombre: nombreDe(t), tipo: t.tipo, fichaId: t.fichaId, duenoUid: t.duenoUid}, mio ? mio.id : '')
        .catch(err => { console.error('No se pudo abrir el duelo:', err); toast(err && err.code === 'permission-denied' ? 'No se pudo: faltan publicar las reglas nuevas de Firestore (duelos)' : 'No se pudo abrir el duelo: ' + String((err && err.message) || err).slice(0, 120)); });
    }, `<b>${ataque && ataque.hab ? '✨ ' + esc(ataque.hab.nombre) + ': elegí el objetivo' : '⚔ ' + esc(yo.nombre || 'Atacar') + ': elegí a quién atacás'}</b> <span>clic sobre el token · Esc o clic derecho cancelan${nEnAlcance ? ' · ✨ brillan los que están a tu alcance (' + Math.round(num(ataque.alcance)) + ' casillero' + (Math.round(num(ataque.alcance)) === 1 ? '' : 's') + ')' : ''}</span>`, true, cancelado);
    dueloAvisoObjetivo(yo.nombre, msg.conSuelto, alSuelto, ataque && ataque.hab ? ataque.hab.nombre : '');
  };
  pedir();
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
  coleccionAreas().where('estado', '==', 'en-curso').onSnapshot(snap => {
    areasActivas.clear();
    snap.docs.forEach(doc => areasActivas.set(doc.id, doc.data()));
    pedirDibujo();
    // Autocuración: si a un área en curso le falta el sub-duelo que le toca (recién creada, o
    // esta pestaña del GM no llegó a verlo antes), lo crea acá — cubre el primer objetivo y
    // cualquiera que se haya quedado a mitad de camino (ej. la pestaña del GM se cerró un instante).
    if(soyGM) areasActivas.forEach((a, id) => {
      if(!(a.duelos || [])[num(a.indice)]){ areaCrearSiguienteSubDuelo(id, a); return; }
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
    dueloId = await Duelo.crear({yo: a.casteador, ataque: {tipo: 'habilidad', hab: a.hab, alcance: 0}, grupo: {id: areaId, indice: idx + 1, total: objetivos.length}, pdgCompartido: a.pdgCompartido || null},
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
    const cambios = siguiente >= total ? {estado: 'terminado'} : {indice: siguiente};
    if(!a.pdgCompartido && d.pdg) cambios.pdgCompartido = d.pdg;
    return coleccionAreas().doc(areaId).update(cambios);
  }).catch(err => console.error('No se pudo avanzar la cascada del área:', err));
}

// comun/duelo.js pide (hook chequearDodge, el botón "revisar" de la fase dodge): ¿el defensor SIGUE adentro del área?
function dueloChequearDodge(d){
  if(!d.grupo) return true;
  const a = areasActivas.get(d.grupo.id);
  const t = tokens.get(d.defensor.tokenId);
  if(!a || !t) return true;   // sin datos: por las dudas, efecto completo (más seguro que dejarlo pasar gratis)
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
  let el = document.getElementById('dodge-banner');
  if(!dodgeBanner){ if(el) el.hidden = true; return; }
  if(!el){
    el = document.createElement('div');
    el.id = 'dodge-banner';
    el.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:96;background:var(--bottle,#1f3d2f);color:#EAF3E6;border:2px solid var(--brass,#E0A458);border-radius:var(--r,3px);padding:12px 18px;font-family:"Space Mono",monospace;font-size:13px;box-shadow:0 8px 30px rgba(0,0,0,.6);text-align:center;max-width:92vw;display:flex;gap:12px;align-items:center;flex-wrap:wrap;justify-content:center';
    document.body.appendChild(el);
  }
  el.hidden = false;
  el.innerHTML = `<span>🏃 <b>${esc(dodgeBanner.nombre)}</b> ganó la Evasión: arrastrá el token hasta <b>2 casilleros</b> para intentar salir del área</span><button type="button" class="btn" data-dodge-ver>🔎 Ver el duelo</button><button type="button" class="btn" data-dodge-no-mover>✋ No me quiero mover</button>`;
  el.querySelector('[data-dodge-ver]').onclick = () => Duelo.abrir(dodgeBanner.id);
  el.querySelector('[data-dodge-no-mover]').onclick = () => dodgeDeclinar();
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
    const objetivos = todos
      .filter(t => !t.oculto && !propio(t) && distanciaHex(h, t) <= radio)
      .filter(t => hab.fuegoAmigo || dueloEsRival(yo, t))
      .map(t => t.id);
    if(!objetivos.length){ toast('No hay nadie adentro del área'); return; }
    try{
      await coleccionAreas().add({
        casteador, hab: Duelo.limpiarHab(hab), centro: {col: h.col, fila: h.fila}, radio, objetivos, duelos: [], indice: 0, estado: 'en-curso',
        creadoPor: fbUsuario.uid, creado: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }catch(err){
      console.error('No se pudo lanzar el hechizo de área:', err);
      toast(err && err.code === 'permission-denied' ? 'No se pudo: faltan publicar las reglas nuevas de Firestore (areas)' : 'No se pudo lanzar el hechizo de área: ' + String((err && err.message) || err).slice(0, 120));
    }
  };
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
   Invulnerable). Lo aplica el mapa del GM, como el resto del daño del duelo. */
async function dueloEspinas(d, golpe){
  try{
    if(d.ataque && d.ataque.rango) return null;
    if(!(d.resultado === 'pego' || d.resultado === 'mitad') || !(num(golpe) > 0)) return null;
    const td = tokens.get(d.defensor.tokenId);
    if(!td) return null;
    let tiene = false;
    const conEspinas = l => (l || []).some(e => e && e.activo !== false && (e.espinas || e.nombre === 'Espinas'));
    if(td.tipo === 'creep'){ const sc = creepPrivadoDe(td.fichaId); tiene = !!(sc && conEspinas(sc.estados)); }
    // Una invocación (2026-10-02, paso 4 etapa 4e): sus estados, de la parte `invocaciones` de su dueño.
    else if(String(td.fichaId).includes(SEP_INVOCACION)){ const inv = await invDeToken(td); tiene = !!(inv && conEspinas(inv.estados)); }
    else{ const f = fichasPub.get(td.fichaId); tiene = !!(f && f.resumen && (f.resumen.estados || []).some(e => e && e.nombre === 'Espinas')); }
    if(!tiene) return null;
    const monto = Math.ceil(num(golpe) / 4);
    const ta = tokens.get(d.atacante.tokenId);
    const quien = d.atacante.nombre;
    if(!ta) return {quien, monto, manual: true, motivo: 'el token del atacante ya no está en el mapa'};
    // Directo a la vida (no se resta la Defensa); a una invocación, en la parte `invocaciones` de su dueño (danioInv, 2026-10-02).
    const res = ta.tipo === 'pj' && String(ta.fichaId).includes(SEP_INVOCACION) ? await danioInv(ta, String(monto), true)
      : ta.tipo === 'creep' ? await danioCreep(ta, String(monto), true) : await danioPj(ta, String(monto), true);
    return {quien, monto, recibido: num(res.r.recibido), hpAntes: num(res.previo), hpDespues: num(res.nuevo)};
  }catch(err){
    console.error('No se pudo aplicar las Espinas:', err);
    return {quien: d.atacante.nombre, monto: Math.ceil(num(golpe) / 4), manual: true, motivo: 'falló la escritura'};
  }
}

/* Drena (2026-10-02, Drenar Vida): quien usó la habilidad se cura lo que el objetivo perdió de verdad (`monto`); lo que pasa de su vida
   máxima queda como Excedente de vida, hasta `drenaTope` % del máximo (sumado al que ya tenía). A un personaje, la vida en su parte
   `general` (como dueloCurar) y el Excedente por su cola de estados (comun/recibidos.js); a un creep, todo en sus datos; a una invocación,
   la vida (el excedente, a mano). */
async function dueloDrenar(d, monto){
  const quien = d.atacante.nombre;
  monto = Math.max(0, Math.round(num(monto)));
  if(!monto) return {quien, monto: 0, nota: 'no hizo daño: no drena nada'};
  const ta = tokens.get(d.atacante.tokenId);
  if(!ta) return {quien, monto, manual: true, motivo: 'el token de quien la usó ya no está en el mapa'};
  const pct = Math.max(0, num(d.hab.dano.drenaTope));
  const excedenteDe = estados => { const e = (estados || []).find(x => x && (x.excedenteVida || x.excedente || x.nombre === 'Excedente de vida')); return e ? num(e.escudoMagicoActual ?? e.escudo ?? e.escudoMagico) : 0; };
  try{
    if(ta.tipo === 'creep'){
      const r = await modificarCreep(ta.fichaId, sc => {
        const previo = num(sc.hp), max = num(sc.hpMax) > 0 ? num(sc.hpMax) : previo + monto;
        sc.hp = Math.min(max, previo + monto);
        const sobra = monto - (sc.hp - previo), tope = Math.floor(max * pct / 100), antes = excedenteDe(sc.estados);
        const exc = sobra > 0 && tope > antes ? Math.min(tope, antes + sobra) : 0;
        if(exc) EstadosAplicar.aplicarACreep(sc, {nombre: 'Excedente de vida', escudoMagico: exc});
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
    const exc = sobra > 0 && tope > antes ? Math.min(tope, antes + sobra) : 0;
    if(exc) await EstadosAplicar.encolarPj({fichaId: ta.fichaId, duenoUid: ta.duenoUid, spec: {nombre: 'Excedente de vida', escudoMagico: exc}, origen: `${quien} · ${d.hab.nombre}`});
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
  const crit = critReal || magico;
  const mult = critReal ? d.crit.mult : 1, crudo = Math.max(0, num(dn.crudo)), golpe = crudo * mult;
  const base = {crudo, mult, golpe, ignoraDef: crit, mitad: d.resultado === 'mitad'};
  if(!t) return {...base, manual: true, motivoManual: 'el token ya no está en el mapa'};
  const esInv = t.tipo === 'pj' && String(t.fichaId).includes(SEP_INVOCACION);
  let def = 0, armadmg = 0;
  if(esInv){   // 4e: su Defensa y su Armadura mágica, de sus datos (comun/inv-calculo.js, que se carga si hace falta)
    try{
      await bnCargarPiezas();
      const inv = await invDeToken(t);
      if(!inv) return {...base, manual: true, motivoManual: 'la invocación ya no está'};
      ({def, armadmg} = defensasDeInv(inv));
    }catch(err){ console.error('No se pudieron leer los datos de la invocación:', err); return {...base, manual: true, motivoManual: 'es una invocación (no se pudieron leer sus datos)'}; }
  }
  else if(t.tipo === 'creep'){ const sc = creepPrivadoDe(t.fichaId); def = sc ? creepDefensaMapa(sc) : 0; armadmg = sc ? creepArmadmgMapa(sc) : 0; }
  else{ const f = fichasPub.get(t.fichaId); def = f && f.resumen && f.resumen.def !== undefined ? num(f.resumen.def) : 0; armadmg = f && f.resumen ? num(f.resumen.armadmg || 0) : 0; }
  // Un crítico real ignora la Defensa entera (0); el daño de casteo que la ignora (Paso 1) resta la Armadura mágica (Paso 3) en vez de nada.
  const restaIgnorando = magico ? armadmg : 0;
  let aplicar = golpe, ignoraDef = crit;
  if(base.mitad){ aplicar = Math.ceil(Math.max(0, golpe - def) / 2); ignoraDef = true; }
  // Bloqueo perdido (mitad del daño): el arma o escudo con el que bloqueó pierde 1 punto de durabilidad (solo personajes: los creeps y las invocaciones no llevan).
  let desgaste = '';
  if(base.mitad && t.tipo === 'pj' && d.defensa && d.defensa.itemId){
    try{ await EstadosAplicar.encolarPj({fichaId: t.fichaId, duenoUid: t.duenoUid, spec: {nombre: 'Desgaste', item: d.defensa.itemId}, origen: `${d.atacante.nombre} · Bloqueo perdido`}); desgaste = d.defensa.itemNombre || 'el objeto'; }
    catch(err){ console.error('No se pudo pedir el desgaste del ítem:', err); }
  }
  try{
    const res = esInv ? await danioInv(t, String(aplicar), ignoraDef, restaIgnorando)
      : t.tipo === 'creep' ? await danioCreep(t, String(aplicar), ignoraDef, restaIgnorando) : await danioPj(t, String(aplicar), ignoraDef, restaIgnorando);
    const espinas = res.r.invulnerable ? null : await dueloEspinas(d, golpe);   // el daño inflictido (con el multiplicador del crítico), antes de la Defensa
    const drena = d.hab && d.hab.dano && d.hab.dano.drena ? await dueloDrenar(d, Math.max(0, num(res.previo) - num(res.nuevo))) : null;
    return {...base, desgaste, defensa: crit ? restaIgnorando : def, recibido: num(res.r.recibido), absorbido: num(res.r.absorbido), invulnerable: !!res.r.invulnerable, hpAntes: num(res.previo), hpDespues: num(res.nuevo), ...(espinas ? {espinas} : {}), ...(drena ? {drena} : {})};
  }catch(err){
    console.error('No se pudo aplicar el daño del duelo:', err);
    return {...base, defensa: def, manual: true, golpe: base.mitad ? aplicar : golpe, motivoManual: err && err.message === 'SIN_DEF' ? 'la ficha todavía no publicó su Defensa' : 'falló la escritura'};
  }
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
  // Parry solo con un arma de verdad o un escudo (regla del dueño, 2026-09-30, comun/combatiente.js; la misma que GM Tools).
  const def = defensaCreepMapa(sc), c = Combatiente.costoParry();
  const ops = [{modo: 'evasion', etiqueta: '🏃 Evasión'}];
  if(def) ops.push({modo: 'parry', itemId: '', itemNombre: def.nombre, etiqueta: `${def.nombre === sc.armaNombre ? '🗡' : '🛡'} Parry · ${def.nombre}`, costo: c, motivoNo: num(sc.nitros) < c ? 'no le alcanzan los No2' : ''});
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
    const res = await modificarCreep(t.fichaId, sc => { const previo = num(sc.hp); const tope = num(sc.hpMax) > 0 ? num(sc.hpMax) : previo + n; sc.hp = Math.min(tope, previo + n); return {previo, nuevo: sc.hp}; });
    return {previo: res.previo, nuevo: res.nuevo};
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
    inv.hp = Math.min(tope, previo + n);
    const rs = ficha.data().resumen || {};
    tx.set(parteRef, {json: JSON.stringify(datos), actualizado: ts});
    tx.update(base, {actualizado: ts, 'resumen.invocaciones': (rs.invocaciones || []).map(i => i.id === invId ? {...i, hp: inv.hp} : i)});
    return {previo, nuevo: inv.hp};
  });
}
async function dueloAplicarEfecto(d, ef){
  const spec = Duelo.specDeEfecto(ef);
  if(!spec) return {manual: true, nota: 'a mano'};
  const t = tokens.get(d.defensor.tokenId);
  if(!t) return {manual: true, nota: 'el token ya no está: aplicalo a mano'};
  if(spec.cura){
    try{ const r = await dueloCurar(t, spec.cura); return {nota: `+${spec.cura} HP (${fmt(r.previo)} → ${fmt(r.nuevo)})`}; }
    catch(err){ console.error('No se pudo aplicar la cura del duelo:', err); return {manual: true, nota: 'no se pudo curar solo: aplicalo a mano'}; }
  }
  const veces = spec.nombre === 'Armadura rota' ? Math.max(1, num(spec.stacks) || 1) : 1;
  const unico = spec.nombre === 'Armadura rota' ? {nombre: 'Armadura rota'} : spec;
  if(t.tipo === 'creep'){
    const res = await modificarCreep(t.fichaId, sc => { let r = {ok: false}; for(let i = 0; i < veces; i++) r = EstadosAplicar.aplicarACreep(sc, unico); return r; });
    return res && res.ok ? {nota: EstadosAplicar.texto(unico) + (veces > 1 ? ` ×${veces}` : '')} : {nota: 'no entró: ' + ((res && res.motivo) || 'está protegido')};
  }
  for(let i = 0; i < veces; i++) await EstadosAplicar.encolarPj({fichaId: t.fichaId, duenoUid: t.duenoUid, spec: unico, origen: `${d.atacante.nombre} · ${ef.nombre}`});
  return {nota: 'le llegó a su ficha: ' + EstadosAplicar.texto(unico) + (veces > 1 ? ` ×${veces}` : '')};
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

