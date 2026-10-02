/* =========================================================
   CREEPS-MAPAS — en qué mapa está cada creep (2026-10-02, pedido del dueño: "los grupos en realidad son mapas")
   Antes los creeps se juntaban en "grupos" con nombre libre (sc.grupo) y cada grupo se vinculaba a mano a un mapa
   (gm/gruposMapas): dos cosas para mantener que se desincronizaban. Ahora un creep está en UN mapa (`sc.mapa` = id del mapa, o ''
   = Reserva, todavía en ningún mapa), como una piedrita: las pestañas de GM Tools son los mapas de la partida, y moverlo de una a
   otra es mudarlo de mapa, con su token (si tenía uno, aparece oculto en el mapa nuevo y se va de los demás).
   - `RESERVA` (''), `PRINCIPAL` ('_principal', el primer mapa: sus tokens viven en campanas/<id>/tokens).
   - `ordenar(mapas)`: Map id → {nombre, creadoMs} → [{id, nombre}] en el orden del panel de Mapas (el primero, después por fecha).
   - `mapaDe(sc, ids)`: el mapa del creep si existe todavía (ids: Set de mapas de la partida); si no, Reserva.
   - `tokensDeCreep(creepId)`: sus tokens en todos los mapas → [{ref, mapaId, data}].
   - `mudarTokens({id, nombre, color}, destino, {centro?})`: borra sus tokens de los otros mapas y, si tenía alguno y en el destino no
     hay, crea uno oculto en el destino (en `centro`, o el centro que guardó la vista del mapa). A Reserva: solo los borra.
     → {borrados, creado}.
   - `crearMapa(nombre)` → id.
   - `migrar(creeps, {vacios})`: los grupos viejos → mapas. Un creep que ya tiene token en un mapa se queda en ese mapa; si no, un
     grupo vinculado va a su mapa y uno sin vincular, a un mapa con su nombre (el que ya exista con ese nombre, o uno nuevo y vacío:
     decisión del dueño, 2026-10-02). Pone `sc.mapa`, saca `sc.grupo` y
     borra gm/gruposMapas. `vacios`: los grupos sin creeps que el GM había creado (también pasan a ser mapas). → {cambiados, creados}.
   Necesita sesion.js y tokens-auto.js.
   ========================================================= */
const CreepsMapas = (() => {
  const RESERVA = '', PRINCIPAL = '_principal';
  const rutaTokens = id => id === PRINCIPAL ? 'tokens' : `mapas/${id}/tokens`;

  function ordenar(mapas){
    const ids = [...mapas.keys()].filter(id => id !== PRINCIPAL).sort((a, b) => (mapas.get(a).creadoMs || 0) - (mapas.get(b).creadoMs || 0));
    return [PRINCIPAL, ...ids].map(id => ({id, nombre: (mapas.get(id) && mapas.get(id).nombre) || (id === PRINCIPAL ? 'Mapa 1' : 'Mapa')}));
  }
  const mapaDe = (sc, ids) => sc && sc.mapa && (!ids || ids.has(sc.mapa)) ? sc.mapa : RESERVA;

  async function idsDeMapas(){
    const s = await fbDb.collection(fbRutaCampana('mapas')).get();
    return [PRINCIPAL, ...s.docs.map(d => d.id).filter(id => id !== PRINCIPAL)];
  }
  async function tokensDeCreep(creepId){
    const ids = await idsDeMapas();
    const snaps = await Promise.all(ids.map(id => fbDb.collection(fbRutaCampana(rutaTokens(id))).where('fichaId', '==', creepId).get()));
    return snaps.flatMap((sn, i) => sn.docs.filter(d => d.data().tipo === 'creep').map(d => ({ref: d.ref, mapaId: ids[i], data: d.data()})));
  }
  async function mudarTokens(c, destino, o){
    const tokens = await tokensDeCreep(c.id);
    const fuera = tokens.filter(t => t.mapaId !== destino);
    const yaEsta = tokens.some(t => t.mapaId === destino);
    if(fuera.length){
      const lote = fbDb.batch();
      fuera.forEach(t => lote.delete(t.ref));
      await lote.commit();
    }
    let creado = false;
    if(destino !== RESERVA && fuera.length && !yaEsta){
      const r = await TokensAuto.crear([{nombre: c.nombre, color: c.color, tipo: 'creep', fichaId: c.id, oculto: true}],
        {mapaId: destino, ...(o && o.centro ? {centro: o.centro} : {})});
      creado = r.creados > 0;
    }
    return {borrados: fuera.length, creado};
  }
  async function crearMapa(nombre){
    const ref = await fbDb.collection(fbRutaCampana('mapas')).add({nombre: String(nombre || 'Mapa').slice(0, 40), creado: firebase.firestore.FieldValue.serverTimestamp()});
    return ref.id;
  }

  async function migrar(creeps, o){
    const vacios = (o && o.vacios) || [];
    const conGrupo = creeps.filter(sc => sc && sc.grupo && !sc.mapa);
    const refEnlaces = fbDb.doc(fbRutaCampana('gm/gruposMapas'));
    const enl = await refEnlaces.get();
    if(!conGrupo.length && !vacios.length){
      if(enl.exists) await refEnlaces.delete();
      creeps.forEach(sc => { if(sc && 'grupo' in sc) delete sc.grupo; });
      return {cambiados: 0, creados: 0};
    }
    const enlaces = enl.exists && Array.isArray(enl.data().enlaces) ? enl.data().enlaces : [];
    const mapasSnap = await fbDb.collection(fbRutaCampana('mapas')).get();
    const existentes = new Set([PRINCIPAL, ...mapasSnap.docs.map(d => d.id)]);
    const porNombre = new Map();
    mapasSnap.docs.forEach(d => { const n = String(d.data().nombre || '').trim().toLowerCase(); if(n && !porNombre.has(n)) porNombre.set(n, d.id); });
    if(!porNombre.has('mapa 1')) porNombre.set('mapa 1', PRINCIPAL);
    // Un creep que ya tiene su token puesto se queda en ese mapa (lo que está en el tablero manda: no se lo saca de una partida en curso).
    const tokenEn = new Map();   // creepId → mapa donde tiene token
    const ids = [PRINCIPAL, ...mapasSnap.docs.map(d => d.id).filter(id => id !== PRINCIPAL)];
    const snaps = await Promise.all(ids.map(id => fbDb.collection(fbRutaCampana(rutaTokens(id))).get()));
    snaps.forEach((sn, i) => sn.docs.forEach(d => { const t = d.data(); if(t.tipo === 'creep' && t.fichaId && !tokenEn.has(t.fichaId)) tokenEn.set(t.fichaId, ids[i]); }));
    const destino = new Map();   // grupo → id del mapa
    let creados = 0;
    const grupos = [...new Set([...conGrupo.filter(sc => !tokenEn.has(sc.id)).map(sc => sc.grupo), ...vacios])];
    for(const g of grupos){
      const vinculado = (enlaces.find(e => e && e.grupo === g) || {}).mapaId;
      if(vinculado && existentes.has(vinculado)){ destino.set(g, vinculado); continue; }
      const mismo = porNombre.get(String(g).trim().toLowerCase());
      if(mismo){ destino.set(g, mismo); continue; }
      const id = await crearMapa(g);
      porNombre.set(String(g).trim().toLowerCase(), id);
      destino.set(g, id);
      creados++;
    }
    conGrupo.forEach(sc => { sc.mapa = tokenEn.get(sc.id) || destino.get(sc.grupo) || RESERVA; });
    creeps.forEach(sc => { if(sc && 'grupo' in sc) delete sc.grupo; });
    if(enl.exists) await refEnlaces.delete();
    return {cambiados: conGrupo.length, creados};
  }

  return {RESERVA, PRINCIPAL, ordenar, mapaDe, idsDeMapas, tokensDeCreep, mudarTokens, crearMapa, migrar};
})();
