/* =========================================================
   TIRADAS-PROPIAS — "mis últimas tiradas" de un personaje, desde la Mesa (P138, decidido por el dueño 2026-10-01;
   paso 4, etapa 3c de docs/plan-paso4-etapa3.md)
   La Moneda Re-Roll y la Polilla mística trabajan sobre las últimas tiradas del personaje. Antes vivían solo en la memoria de
   la ficha abierta (se perdían al recargar y no veían lo tirado en otra ventana, ni lo que tire el mapa cuando la Botonera
   la dibuje él). Ahora cada tirada de un personaje se publica en la Mesa con su `ficha` (comun/mesa.js) y esta pieza escucha
   las de UN personaje (una consulta por igualdad, sin índices especiales), y las junta con lo tirado en esa misma ventana
   que todavía no llegó o que salió sin `ficha` (si las reglas nuevas todavía no están pegadas), sin repetir.
   Cada entrada: {clave, docId?, rerollId?, origen, formula, rolls, mod, total, estados, t (ms)}. `clave` = el id de la Mesa
   o 'L' + rerollId para lo que solo está en esta ventana.
   ========================================================= */
const TiradasPropias = (() => {
  const MAX = 20;
  const ms = c => c instanceof Date ? c.getTime() : (c && typeof c.toMillis === 'function') ? c.toMillis() : (c && c.seconds) ? c.seconds * 1000 : Date.now();

  // Escucha las tiradas de la Mesa de un personaje; alCambiar(lista) con las últimas primero. Devuelve la función que corta.
  // `nombre`: el del personaje, para rearmar el origen de lo que tiró una de sus invocaciones ("Lobo · PdG").
  function escuchar(db, ruta, fichaId, nombre, alCambiar){
    return db.collection(ruta).where('ficha', '==', fichaId).onSnapshot(snap => {
      const lista = snap.docs.filter(d => !String((d.data() || {}).desde || '').startsWith('incierta')).map(d => {   // (la línea de una trampa no es una tirada)
        const x = d.data() || {};
        const quien = String(x.quien || ''), origen = String(x.origen || '');
        return {clave: d.id, docId: d.id, origen: quien && nombre && quien !== nombre ? `${quien} · ${origen}` : origen,
          formula: x.formula || '', rolls: Array.isArray(x.rolls) ? x.rolls : [], mod: x.mod || 0, total: x.total || 0,
          estados: Array.isArray(x.estados) ? x.estados : [], t: ms(x.cuando)};
      }).sort((a, b) => b.t - a.t).slice(0, MAX);
      alCambiar(lista);
    }, err => console.error('Error escuchando las tiradas del personaje:', err));
  }

  // Lo de la Mesa + lo de esta ventana (entradas de dadosHistorial: {origen, formula, rolls, mod, total, estados, hora, rerollId,
  // docId?}), sin repetir lo que ya llegó a la Mesa. Las de esta ventana son los MISMOS objetos (la Polilla les suma +2 ahí).
  function juntar(locales, mesa, max){
    const deMesa = new Set((mesa || []).map(e => e.docId));
    const propias = (locales || []).filter(e => !(e.docId && deMesa.has(e.docId)));
    propias.forEach(e => { e.clave = e.docId || 'L' + e.rerollId; e.t = ms(e.hora); });
    return [...propias, ...(mesa || [])].sort((a, b) => b.t - a.t).slice(0, max || MAX);
  }
  // ¿Ya usó su moneda? `usadas`: las claves guardadas en la ficha (S.rerollUsados).
  const usada = (e, usadas) => !!(e && (usadas || []).some(k => k === e.clave || (e.docId && k === e.docId) || (e.rerollId && k === 'L' + e.rerollId)));

  return {MAX, escuchar, juntar, usada};
})();
