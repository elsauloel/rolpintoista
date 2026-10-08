/* =========================================================
   MENSAJES MAPA ↔ HERRAMIENTAS (paso 4, etapa 1, punto 3 de docs/plan-paso4.md, 2026-09-30)
   El mapa (vtt-hexgrid/mapa.html) abre la ficha (?modo=botonera) o GM Tools (?modo=acciones) dentro de un marco y se hablan
   con postMessage. Acá está, en UN solo lugar, la lista de todos los mensajes: quién los manda, quién los recibe y para qué.
   Un mensaje nuevo se agrega a TIPOS (si no, `alMapa`/`alMarco` lo mandan igual pero avisan en la consola, y el mapa también
   avisa si le llega uno que no conoce). Todos viajan como {tipo, ...datos} y solo entre páginas del mismo sitio.
   ========================================================= */
const MensajesMapa = (() => {
  // de/a: 'mapa', 'ficha', 'gm' (GM Tools) o 'marco' (la ficha o GM Tools, cualquiera de las dos).
  const TIPOS = {
    // ---- El mapa le pide algo a la herramienta del marco ----
    'abrir-botonera':   {de: 'mapa', a: 'ficha', que: 'abrir la Botonera (del personaje, o de una invocación con `inv`)'},
    'botonera-delegar': {de: 'mapa', a: 'ficha', que: 'tocar un botón de la Botonera (`datos`: sus data-*): lo pide la Botonera nueva del mapa (paso 4, etapa 3b)'},
    'editar-en-ficha':  {de: 'mapa', a: 'ficha', que: 'abrir el editor de un ítem, habilidad o talento (`key`, `id`): el "Editar" del Ver de la Botonera nueva (paso 4, etapa 3c-6)'},
    'abrir-ficha-mapa': {de: 'mapa', a: 'ficha', que: 'abrir la ficha liviana del personaje (📜 del token propio, tecla F)'},
    'abrir-stats':      {de: 'mapa', a: 'ficha', que: 'abrir los Stats del personaje (📊 de la ficha lite del mapa)'},
    'abrir-equipo':     {de: 'mapa', a: 'ficha', que: 'abrir Equipo y mochila (🛡 del token, 🎒 de la ficha lite)'},
    'abrir-botin':      {de: 'mapa', a: 'ficha', que: 'abrir la ventana de la batalla terminada / despojos'},
    'abrir-reroll':     {de: 'mapa', a: 'ficha', que: 'usar la Moneda Re-Roll (🪙 fijo del mapa)'},
    'abrir-revivir':    {de: 'mapa', a: 'ficha', que: 'revivir al personaje (✚ del filtro de muerte)'},
    'abrir-tienda':     {de: 'mapa', a: 'ficha', que: 'abrir el Vendedor (🏪)'},
    'abrir-acciones':   {de: 'mapa', a: 'gm',    que: 'abrir las Acciones de un creep (`creep`)'},
    'acciones-delegar': {de: 'mapa', a: 'gm',    que: 'tocar un botón de las Acciones de un creep (`creep`, `datos`: sus data-*): lo piden las Acciones nuevas del mapa (paso 4, etapa 4b)'},
    'abrir-ver-creep':  {de: 'mapa', a: 'gm',    que: 'abrir la ventana «Ver» de un creep (📜 del token)'},
    'abrir-estados':    {de: 'mapa', a: 'marco', que: 'abrir los estados alterados (del personaje, o del creep con `creep`)'},
    'editar-estado':    {de: 'mapa', a: 'marco', que: 'editar un estado puntual (`nombre`, y `creep` si es de un creep)'},
    'tecla-escape':     {de: 'mapa', a: 'marco', que: 'cerrar la ventana de más arriba'},
    'tecla-f':          {de: 'mapa', a: 'marco', que: 'cerrar todas las ventanas'},
    // ---- La herramienta del marco le avisa al mapa ----
    'botonera-lista':   {de: 'ficha', a: 'mapa', que: 'la ficha cargó y ya puede recibir pedidos (manda lo pendiente)'},
    'botonera-cerrada': {de: 'marco', a: 'mapa', que: 'no queda ninguna ventana abierta: ocultar el marco'},
    'acciones-lista':   {de: 'gm',    a: 'mapa', que: 'GM Tools cargó y ya puede recibir pedidos'},
    'acciones-cerrada': {de: 'gm',    a: 'mapa', que: 'no queda ninguna ventana abierta: ocultar el marco'},
    'embebido-abierto': {de: 'marco', a: 'mapa', que: 'se abrió una ventana o cartel (comun/embebido.js): mostrar la capa, encima del duelo si hay uno'},
    'embebido-cerrado': {de: 'marco', a: 'mapa', que: 'ya no queda nada abierto (comun/embebido.js): ocultar la capa'},
    'mantenimiento-listo': {de: 'marco', a: 'mapa', que: 'terminó el Mantenimiento en segundo plano'},
    'muerte-estado':    {de: 'ficha', a: 'mapa', que: 'el personaje está inconsciente/muerto (`activo`, `turnos`, `definitivo`): filtro rojo'},
    'zona-habilidad':   {de: 'ficha', a: 'mapa', que: 'dibujar la zona del sistema anterior (`forma`, `radio`)'},
    'portal-habilidad': {de: 'ficha', a: 'mapa', que: 'elegir los dos puntos de un portal (`turnos`)'},
    'blink-habilidad':  {de: 'ficha', a: 'mapa', que: 'el blink: a quién (vos o un aliado que ves) y adónde (`distancia`)'},
    'zona-persistente-habilidad': {de: 'marco', a: 'mapa', que: 'dejar una zona persistente (lo arma Combatiente.zonaDeHab)'},
    'trampa-habilidad': {de: 'marco', a: 'mapa', que: 'elegir la casilla de una trampa (`trampa`, lo arma Combatiente.trampaDeHab)'},
    'invocacion-habilidad': {de: 'marco', a: 'mapa', que: 'elegir dónde aparece una invocación (`ref` = fichaId~invId, nombre, color; FichaAcciones.invocarConHab)'},
    // ---- El duelo (comun/duelo.js) entre el mapa y el marco ----
    'duelo-elegir-objetivo': {de: 'marco', a: 'mapa', que: 'elegir el objetivo de un ataque o habilidad con un clic en el mapa'},
    'duelo-suelto':     {de: 'mapa', a: 'marco', que: '«sin objetivo»: tirar suelto'},
    'duelo-cancelado':  {de: 'mapa', a: 'marco', que: 'se canceló la elección del objetivo'},
    'duelo-opciones':   {de: 'mapa', a: 'marco', que: '¿cómo te podés defender? (lo contesta duelo-opciones-res)'},
    'duelo-opciones-res': {de: 'marco', a: 'mapa', que: 'las opciones de defensa'},
    'duelo-tirar':      {de: 'mapa', a: 'marco', que: 'tirar una tirada del duelo (PdG, defensa, Fuerza, Bloqueo, daño)'},
    'duelo-contra':     {de: 'mapa', a: 'marco', que: 'armar el contraataque tras un Bloqueo'},
    'duelo-flash':      {de: 'mapa', a: 'marco', que: '¿qué ⚡ Flash tenés para esta tirada? (lo contesta duelo-flash-res)'},
    'duelo-flash-res':  {de: 'marco', a: 'mapa', que: 'los Flash disponibles'},
    'duelo-reroll-info': {de: 'mapa', a: 'marco', que: '¿tenés una Moneda Re-Roll? (lo contesta duelo-reroll-info-res)'},
    'duelo-reroll-info-res': {de: 'marco', a: 'mapa', que: 'si hay moneda y dónde'},
    'duelo-reroll':     {de: 'mapa', a: 'marco', que: 'usar la moneda en una tirada del duelo'},
    'duelo-ui-visible': {de: 'marco', a: 'mapa', que: 'un cartel durante una tirada del duelo (respaldo de embebido-abierto)'},
  };
  const conocido = tipo => Object.prototype.hasOwnProperty.call(TIPOS, tipo);
  const avisar = tipo => { if(!conocido(tipo)) console.warn(`Mensaje «${tipo}» sin registrar en comun/mensajes-mapa.js (TIPOS)`); };
  // Desde la herramienta del marco al mapa. Devuelve false si no está dentro del mapa.
  function alMapa(tipo, datos){
    if(window.parent === window) return false;
    avisar(tipo);
    window.parent.postMessage(Object.assign({}, datos || {}, {tipo}), location.origin);
    return true;
  }
  // Desde el mapa a la herramienta del marco (`marco`: el <iframe> o su contentWindow). Acepta un mensaje ya armado.
  function alMarco(marco, tipo, datos){
    const w = marco && (marco.contentWindow || marco);
    if(!w || !w.postMessage) return false;
    const msg = typeof tipo === 'object' && tipo ? tipo : Object.assign({}, datos || {}, {tipo});
    avisar(msg.tipo);
    w.postMessage(msg, location.origin);
    return true;
  }
  return {TIPOS, conocido, alMapa, alMarco};
})();
