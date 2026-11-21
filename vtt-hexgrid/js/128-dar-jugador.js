// js/128-dar-jugador.js — 🎁 El GM le da un ítem, DDE o despojos a un personaje desde el mapa (2026-11-21, dueño: «que el GM pueda darle un ítem
// del catálogo muy fácilmente a un jugador… tanto desde el mapa como desde GM Tools»).
// La puerta: «🎁 Dar un ítem» en el menú «⋯» del token de un personaje (junto a Renovar / Quitar el Pacto), solo para el GM. La ventana, cómo
// viaja y cómo lo recibe el jugador (directo a la mochila + cartel con «Aceptar») es la pieza común comun/dar-jugador.js: la misma de GM Tools.
// Quien recibe lo aplica con lo de siempre (recibidosAplicar, js/11): por eso comun/dar-jugador.js se carga con la página, para todos.
const DAR_PIEZAS = ['../comun/asistente-item.js?v=20261111dur6'];
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
