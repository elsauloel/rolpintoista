// js/128-dar-jugador.js — 🤝 El GM le da un ítem, DDE o despojos a un personaje desde el mapa (2026-11-21, dueño: «que el GM pueda darle un ítem
// del catálogo muy fácilmente a un jugador… tanto desde el mapa como desde GM Tools»).
// La puerta: «🤝 Dar un ítem» en el menú «⋯» del token de un personaje (junto a Renovar / Quitar el Pacto), solo para el GM. La ventana, cómo
// viaja y cómo lo recibe el jugador (directo a la mochila + cartel con «Aceptar») es la pieza común comun/dar-jugador.js: la misma de GM Tools.
// Quien recibe lo aplica con lo de siempre (recibidosAplicar, js/11): por eso comun/dar-jugador.js se carga con la página, para todos.
const DAR_PIEZAS = ['../comun/asistente-item.js?v=20261122cola49'];
// ¿Va el botón en el menú de ese token? El GM, sobre el token de un personaje (no una invocación).
function darJugadorPuede(t){
  return !!soyGM && !!t && t.tipo === 'pj' && !!t.fichaId && !String(t.fichaId).includes(SEP_INVOCACION) && fichasPub.has(t.fichaId);
}
async function darJugadorAbrir(t){
  if(!darJugadorPuede(t)) return;
  try{
    await bnCargarPiezas();      // el catálogo, lo subido por el grupo, el filtro y las reglas del personaje (los bonos del ítem nuevo)
    await acCargarPiezas();      // el «Ver» de un ítem (comun/creep-lupa.js)
    await cargarPiezas(DAR_PIEZAS);
  }catch(err){ console.error('No se pudo abrir «Dar a un jugador»:', err); toast('No se pudo abrir «Dar a un jugador» — probá de nuevo'); return; }
  hudPonerNivel('vital');
  DarJugador.abrir({
    marcados: [t.fichaId],
    catalogo: () => bnMezclarCatalogo(structuredClone(CATALOGO_BASE)),
    toast: x => toast(x),
  });
}

/* 🤝 Dar, el botón del borde izquierdo (2026-11-22, dueño, opción A: «un solo botón 🤝 Dar… que abre una ventana distinta según quién lo toca»).
   El GM → «Dar a un jugador» (comun/dar-jugador.js), sin nadie marcado. Un jugador → «Pasarle algo a otro personaje» (comun/intercambio.js) desde
   el personaje que maneja (si maneja varios, elige). El GM con 🎮 el control de un personaje → elige: dar como GM o pasar desde la mochila de ese
   personaje (DarJugador.puerta). El 🎁 de al lado sigue siendo solo el del botín. */
async function darDockAbrirGM(){
  try{
    await bnCargarPiezas();
    await acCargarPiezas();
    await cargarPiezas(DAR_PIEZAS);
  }catch(err){ console.error('No se pudo abrir «Dar a un jugador»:', err); toast('No se pudo abrir «Dar a un jugador» — probá de nuevo'); return; }
  hudPonerNivel('vital');
  DarJugador.abrir({marcados: [], catalogo: () => bnMezclarCatalogo(structuredClone(CATALOGO_BASE)), toast: x => toast(x)});
}
// La ventana de pasar algo de la mochila necesita al personaje leído (la sesión de la Botonera nueva, sin mostrarla).
async function darDockAbrirPasar(fichaId){
  try{ await bnCargarPiezas(); }catch(err){ console.error(err); toast('No se pudo abrir «Pasar» — probá de nuevo'); return; }
  if(bn && bn.fichaId !== fichaId && bn.host && !bn.host.hidden) cerrarBotoneraNueva();   // la Botonera abierta de otro personaje: se cierra (una sesión a la vez)
  if(!(bn && bn.fichaId === fichaId && bn.S)) bnAbrirSesion(fichaId);
  if(!(await bnSesionLista(fichaId))){ toast('No se pudo leer a tu personaje — probá de nuevo'); return; }
  Intercambio.abrirDar(fichaId);
}
function darDockPropios(){
  return [...fichasPub.keys()].filter(id => !String(id).includes(SEP_INVOCACION) && bnManejo(id))
    .map(id => ({id, nombre: (fichasPub.get(id) && fichasPub.get(id).nombre) || 'tu personaje'}))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}
$('#toolkit-dar').onclick = () => {
  if(!fbMiembro){ toast('Entrá con tu cuenta para dar o pasar cosas'); return; }
  DarJugador.puerta({gm: !!soyGM, propios: darDockPropios(), abrirGM: darDockAbrirGM, abrirPasar: darDockAbrirPasar, toast: x => toast(x),
    sinNada: 'Todavía no tenés un personaje en esta partida para pasarle algo a un colega'});
};
