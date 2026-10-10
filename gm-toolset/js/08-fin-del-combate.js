// js/08-fin-del-combate.js — tramo 8 de 12 del script de gm-tools.html (paso 5, nivel A: mismo código, en el mismo orden).
/* =========================================================
   FINALIZAR COMBATE — resumen de XP y loot
   Las reglas y el dibujo del reporte viven en comun/combate-fin.js (2026-10-02, hoja de ruta A6a: el mapa del GM muestra la misma
   ventana). Acá queda la ventana de GM Tools: su estado (combateRep), leer el mapa y los personajes, y qué pasa al publicar.
   ========================================================= */
function xpBasePorNivel(nivel){ return CombateFin.xpBasePorNivel(nivel); }
const XP_ESCAPO_PCT = CombateFin.XP_ESCAPO_PCT;

/* ---------- Reporte del combate: XP, oro, ítems y jugadores; se publica a las fichas ----------
   El GM revisa y ajusta (ítems, XP, oro, quién cobra) y publica: cada jugador recibe su XP y su oro solos en la
   ficha (campanas/<id>/recompensas) y los ítems quedan en el botín para tomarlos (campanas/<id>/botin). */
let combateRep = nuevoCombateRep();
function nuevoCombateRep(){ return CombateFin.nuevo(); }

/* Solo cuentan para la recompensa los creeps que tienen un token vinculado en el MAPA PUBLICADO (el que ven los jugadores):
   en gm-tools puede haber muchos creeps armados de antemano que no están en la pelea. */
async function cargarCreepsEnMapa(){
  if(!fbDb || !fbMiembro){ combateRep.enMapa = new Set(S.creeps.map(s => s.id)); renderReporteCombate(); return; }
  try{
    combateRep.enMapa = await CombateFin.creepsEnMapa();
  }catch(err){
    console.error('No se pudieron leer los tokens del mapa publicado:', err);
    combateRep.enMapa = new Set();
    toast('No se pudo leer el mapa publicado: no hay creeps para repartir');
  }
  renderReporteCombate();
}

/* --- Jugadores: las fichas de la partida, con su estado al terminar el combate --- */
async function cargarJugadoresCombate(){
  if(combateRep.cargando || !fbDb || !fbMiembro) return;
  combateRep.cargando = true;
  try{
    combateRep.jugadores = await CombateFin.jugadores(combateRep.jugadores);
  }catch(err){
    console.error('No se pudieron leer los personajes:', err);
    combateRep.jugadores = combateRep.jugadores || [];
  }finally{
    combateRep.cargando = false;
    renderReporteCombate();
  }
}

function renderReporteCombate(){
  const v = CombateFin.vista(combateRep, S.creeps, CATALOGO_EQUIPO);
  $('#finalizar-combate-body').innerHTML = v.html;
  $('#finalizar-combate-publicar').style.display = v.publicar === 'oculto' ? 'none' : '';
  if(v.publicar !== 'oculto') $('#finalizar-combate-publicar').disabled = v.publicar !== 'activo';
  if(v.faltanJugadores) cargarJugadoresCombate();
}
// Los controles del reporte (data-rep-*, comun/combate-fin.js).
$('#finalizar-combate-body').addEventListener('change', e => { if(CombateFin.cambio(combateRep, e.target)) renderReporteCombate(); });
$('#finalizar-combate-body').addEventListener('click', e => {
  const b = e.target.closest('button');
  const r = b && CombateFin.clic(combateRep, b, $('#finalizar-combate-body'), S.creeps, CATALOGO_EQUIPO);
  if(!r) return;
  e.preventDefault(); e.stopPropagation();   // el Ver de un ítem está adentro de su etiqueta: que no le cambie la casilla
  if(r === true) renderReporteCombate();
  else if(r.ver) verItemDatos(r.ver);
  else if(r.toast) toast(r.toast);
});

// Línea verde en la Mesa (comun/mesa.js, desde 'recompensa').
function mesaLineaVerde(origen, formula){ return CombateFin.lineaVerde(origen, formula); }

function abrirReporteFinalizar(){
  combateRep.enMapa = null;
  renderReporteCombate();
  cargarCreepsEnMapa();
  cargarJugadoresCombate();
  $('#scrim-finalizar-combate').classList.add('open');
}

async function publicarRecompensas(){
  const res = await CombateFin.publicar(combateRep, {creeps: S.creeps, cat: CATALOGO_EQUIPO, combateActual,
    confirmar: texto => Confirmar.preguntar(texto), alEmpezar: renderReporteCombate});
  if(!res) return;
  if(res.error){ toast(res.error); renderReporteCombate(); return; }
  const items = res.items;
  combateActual = {...(combateActual || {}), estado: items.length ? 'publicado' : 'cerrado'};   // sin esperar al snapshot
  actualizarBotonDespojos();
  res.filas.forEach(f => { f.sc.recompensado = true; });   // no se vuelven a contar en el próximo reporte
  combateRep = nuevoCombateRep();
  renderAll();
  $('#scrim-finalizar-combate').classList.remove('open');
  toast(items.length ? 'Publicado ✓ — los jugadores ven la ventana de la batalla en el mapa; cuando hayan elegido, apretás Despojar' : 'Publicado ✓ — la XP y el oro se cargan solos en las fichas');
  if(items.length) abrirBotinGM();   // el GM ve qué toma cada uno; puede cerrar la ventana y volver a abrirla con 🎁 Despojos
}


