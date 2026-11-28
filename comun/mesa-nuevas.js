/* =========================================================
   MesaNuevas — qué líneas de la Mesa llegaron DESPUÉS de abrir la pantalla (2026-11-26, cola: «a veces cuando aprieto F5 o cargo
   el mapa por primera vez aparece la animación de muchas tiradas de dados, juntas»).
   Lo usa comun/mesa.js para decidir qué se anima en 3D, qué se resalta como «nueva» y qué se avisa (giro libre, el ojo del GM…).
   La causa del problema: el mapa de un jugador dibuja la Mesa vacía hasta que llegan los tokens (vtt-hexgrid/js/29 mesaFiltrar) y,
   al llegar, todas las tiradas que ya estaban parecían nuevas. Por eso «nueva» se decide acá con lo que trae Firebase, ANTES del
   filtro de cada pantalla:
   - Lo que vino en la primera carga (o mientras Firebase solo leía su copia local, `fromCache`) es viejo.
   - Una tirada que entra «por abajo» (se borró una de las 30 y aparece la 31.ª, más vieja) también: tiene que ser más nueva que la
     más vieja de la carga anterior (las propias que todavía no confirmó el servidor siempre cuentan como nuevas).
   - Lo que llegó nuevo pero el filtro escondió un momento (una línea dudosa que se vuelve a mirar a los 3 s) sigue contando como
     nueva un rato (`VIGENCIA_MS`) hasta que se muestra; después, ya no.
   Funciones puras (sin Firebase ni pantalla): `nuevo()`, `pasar(est, docs, desdeCache, ahora)` y `esNueva(est, id, ahora)`;
   `docsDe(snap)` arma la lista `[{id, ms, pendiente}]` desde un snapshot de Firestore y `mostrada(est, id)` la da por vista.
   ========================================================= */
const MesaNuevas = (() => {
  const VIGENCIA_MS = 15000;
  const nuevo = () => ({listo: false, conocidos: new Set(), minMs: null, recientes: new Map()});
  // docs: [{id, ms (hora del servidor, o null), pendiente (escrita acá y todavía sin confirmar)}]. Devuelve el Set de ids nuevos.
  function pasar(est, docs, desdeCache, ahora){
    const nuevas = new Set();
    (docs || []).forEach(x => {
      if(!x || !x.id || est.conocidos.has(x.id)) return;
      est.conocidos.add(x.id);
      if(!est.listo) return;   // la primera carga (o la copia local): viejas
      if(!x.pendiente && est.minMs !== null && Number.isFinite(x.ms) && x.ms < est.minMs) return;   // entró por abajo: vieja
      nuevas.add(x.id);
      est.recientes.set(x.id, ahora);
    });
    const ms = (docs || []).filter(x => x && !x.pendiente && Number.isFinite(x.ms)).map(x => x.ms);
    if(ms.length) est.minMs = Math.min(...ms);
    if(!desdeCache) est.listo = true;
    est.recientes.forEach((t, id) => { if(ahora - t > VIGENCIA_MS) est.recientes.delete(id); });
    return nuevas;
  }
  const esNueva = (est, id, ahora) => { const t = est.recientes.get(id); return t !== undefined && ahora - t <= VIGENCIA_MS; };
  const mostrada = (est, id) => { est.recientes.delete(id); };
  function docsDe(snap){
    return ((snap && snap.docs) || []).map(d => {
      let ms = null;
      try{ const c = d.get ? d.get('cuando') : (d.data() || {}).cuando; ms = c && c.toMillis ? c.toMillis() : null; }catch(e){}
      return {id: d.id, ms, pendiente: !!(d.metadata && d.metadata.hasPendingWrites)};
    });
  }
  return {VIGENCIA_MS, nuevo, pasar, esNueva, mostrada, docsDe};
})();
