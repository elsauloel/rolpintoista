/* =========================================================
   TOKENS AUTOMÁTICOS
   Crea de una vez los tokens de un grupo de creeps o de los personajes de los jugadores, en el mapa que el GM
   está mirando. Lo usan GM Tools ("🎯 Crear tokens") y el mapa ("📥 Importar tokens", "👥 Tokens de jugadores").

   - Los tokens salen en UNA FILA ORDENADA en el centro de lo que el GM está viendo (el mapa guarda ese centro en
     localStorage 'mapa-centro' cada vez que mueve la vista), mirando hacia abajo. Van en columnas de a dos para que
     la fila quede recta.
   - Si un creep o personaje ya tiene token en ese mapa, se saltea.
   - Los tokens de creeps nacen OCULTOS a los jugadores; los de personajes, visibles.
   Usa las globales de sesion.js (fbDb, fbUsuario, fbRutaCampana). Las reglas de tokens ya dejan al GM crearlos.
   ========================================================= */
const TokensAuto = (() => {
  const MAPA_PRINCIPAL_ID = '_principal';

  function rutaTokens(mapaId){ return mapaId === MAPA_PRINCIPAL_ID ? 'tokens' : `mapas/${mapaId}/tokens`; }

  // El mapa que el GM está mirando en este navegador (si eligió uno que ya no existe, el publicado).
  async function mapaQueMiraElGM(){
    let elegido = null;
    try{ elegido = localStorage.getItem('mapa-viendo') || null; }catch(e){}
    if(elegido && elegido !== MAPA_PRINCIPAL_ID){
      try{ const d = await fbDb.doc(fbRutaCampana(`mapas/${elegido}`)).get(); if(!d.exists) elegido = null; }catch(e){ elegido = null; }
    }
    if(elegido) return elegido;
    const act = await fbDb.doc(fbRutaCampana('mapa/activo')).get();
    return act.exists && act.data().mapaId ? act.data().mapaId : MAPA_PRINCIPAL_ID;
  }
  function centroGuardado(){
    try{
      const c = JSON.parse(localStorage.getItem('mapa-centro') || 'null');
      if(c && Number.isInteger(c.col) && Number.isInteger(c.fila)) return c;
    }catch(e){}
    return {col: 0, fila: 0};
  }

  /* items: [{nombre, color, tipo: 'creep'|'pj', fichaId, duenoUid?, oculto?}]
     opts: {mapaId?, centro?}. Devuelve {creados, salteados, mapaId}. */
  async function crear(items, opts){
    opts = opts || {};
    const mapaId = opts.mapaId || await mapaQueMiraElGM();
    const centro = opts.centro || centroGuardado();
    const coleccion = fbDb.collection(fbRutaCampana(rutaTokens(mapaId)));
    const existentes = await coleccion.get();
    const yaEstan = new Set(existentes.docs.map(d => `${d.data().tipo}:${d.data().fichaId || ''}`));
    const nuevos = items.filter(i => i.fichaId && !yaEstan.has(`${i.tipo}:${i.fichaId}`));
    if(!nuevos.length) return {creados: 0, salteados: items.length, mapaId};
    const n = nuevos.length;
    const batch = fbDb.batch();
    nuevos.forEach((it, i) => {
      const doc = {
        nombre: String(it.nombre || '?').slice(0, 40),
        color: /^#[0-9a-fA-F]{6}$/.test(it.color || '') ? it.color : '#B87333',
        tipo: it.tipo,
        duenoUid: it.duenoUid || fbUsuario.uid,
        col: centro.col + 2 * i - (n - 1),   // fila recta: columnas de la misma paridad
        fila: centro.fila,
        fichaId: it.fichaId,
        creado: firebase.firestore.FieldValue.serverTimestamp(),
      };
      if(it.oculto) doc.oculto = true;
      batch.set(coleccion.doc(), doc);
    });
    await batch.commit();
    return {creados: n, salteados: items.length - n, mapaId};
  }

  return {crear, mapaQueMiraElGM, centroGuardado, rutaTokens};
})();
