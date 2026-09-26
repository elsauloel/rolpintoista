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

  /* ---------- Trampas automáticas ----------
     Una habilidad de creep con trampa (h.trampaColocar) coloca sola el elemento-trampa en el mapa que el GM está mirando,
     en la casilla libre más cercana al frente del token del que la usa (si está ocupada, prueba las demás vecinas).
     Es un elemento de Terreno y Formas con `trampa: true`: lo ven solo su dueño (el GM) y el GM hasta que se dispara, y el
     mapa tira y aplica el daño (`trampaDano`) cuando alguien la pisa. Las reglas de `elementos` ya lo permiten. */
  function rotarCubo(dq, dr, pasos){
    let q = dq, r = dr, s = -dq - dr;
    for(let i = 0; i < ((pasos % 6) + 6) % 6; i++){ const nq = -r, nr = -s; s = -q; q = nq; r = nr; }
    return {dq: q, dr: r};
  }
  const aCubo = c => ({q: c.col, r: c.fila - (c.col - (c.col & 1)) / 2});
  const deCubo = (q, r) => ({col: q, fila: r + (q - (q & 1)) / 2});
  function celdasFlor(R){
    const res = [];
    for(let dq = -R; dq <= R; dq++) for(let dr = Math.max(-R, -dq - R); dr <= Math.min(R, -dq + R); dr++) res.push(dq, dr);
    return res;
  }
  function celdasAbsolutas(e){
    const o = aCubo(e.origen), pasos = Math.round((e.rotacion || 0) / 60), out = [];
    for(let i = 0; i + 1 < (e.celdas || []).length; i += 2){
      const d = rotarCubo(e.celdas[i], e.celdas[i + 1], pasos);
      const c = deCubo(o.q + d.dq, o.r + d.dr);
      out.push(`${c.col},${c.fila}`);
    }
    return out;
  }
  /* o: {fichaId, tipoToken?, nombre, detalle, dano, radio, cant, fuegoAmigo, color, mapaId?, forma?: 'flor'|'linea', largo? (solo la línea)}
     Devuelve {colocadas, mapaId, motivo?} (motivo: 'sin-token' | 'sin-lugar'). */
  async function colocarTrampas(o){
    const mapaId = o.mapaId || await mapaQueMiraElGM();
    const tokens = await fbDb.collection(fbRutaCampana(rutaTokens(mapaId))).get();
    const mio = tokens.docs.find(d => d.data().fichaId === o.fichaId && d.data().tipo === (o.tipoToken || 'creep'));
    if(!mio) return {colocadas: 0, mapaId, motivo: 'sin-token'};
    const elCol = fbDb.collection(fbRutaCampana(mapaId === MAPA_PRINCIPAL_ID ? 'elementos' : `mapas/${mapaId}/elementos`));
    const els = await elCol.get();
    const ocupadas = new Set(tokens.docs.map(d => `${d.data().col},${d.data().fila}`));
    els.docs.forEach(d => { const e = d.data(); if(e.solido) celdasAbsolutas(e).forEach(k => ocupadas.add(k)); });
    const t = mio.data(), base = aCubo({col: t.col, fila: t.fila});
    const frente = ((Math.round((t.rotacion || 0) / 60) % 6) + 6) % 6;   // 0 = mira hacia abajo
    const elegidas = [];
    [0, 1, 5, 2, 4, 3].forEach(k => {
      const d = rotarCubo(0, 1, frente + k);
      const c = deCubo(base.q + d.dq, base.r + d.dr);
      if(elegidas.length < (o.cant || 1) && !ocupadas.has(`${c.col},${c.fila}`)){ c.dir = (frente + k) % 6; elegidas.push(c); }   // dir: hacia dónde apunta (la línea se extiende hacia afuera del token)
    });
    if(!elegidas.length) return {colocadas: 0, mapaId, motivo: 'sin-lugar'};
    const lote = fbDb.batch();
    elegidas.forEach(c => {
      const linea = o.forma === 'linea';
      const celdasLinea = []; for(let i = 0; i < Math.max(1, Math.min(20, o.largo || 3)); i++) celdasLinea.push(0, i);   // recta hacia afuera: (0,0), (0,1), (0,2)…, rotada según hacia dónde mira
      lote.set(elCol.doc(), {
        tipo: linea ? 'linea' : 'flor', origen: {col: c.col, fila: c.fila}, celdas: linea ? celdasLinea : celdasFlor(o.radio || 0), rotacion: linea ? ((c.dir % 6) + 6) % 6 * 60 : 0,
        color: /^#[0-9a-fA-F]{6}$/.test(o.color || '') ? o.color : '#D9A21B', alfa: 45, solido: false, invisible: false,
        imagen: '', imgZoom: 1, imgDX: 0, imgDY: 0, fijado: false,
        trampa: true, trampaNombre: String(o.nombre || 'Trampa').slice(0, 40), trampaDetalle: String(o.detalle || '').slice(0, 200),
        disparada: false, fuegoAmigo: !!o.fuegoAmigo, trampaDano: String(o.dano || '').slice(0, 12),
        ...(o.ignoraDef ? {trampaIgnoraDef: true} : {}),
        ...(o.item ? {trampaItem: String(o.item).slice(0, 4000), trampaFicha: String(o.fichaId || '').slice(0, 80)} : {}),   // trampa que salió de un consumible: al cerrar el botín, si no se disparó, se desarma y vuelve a su dueño
        ...(o.estado && JSON.stringify(o.estado).length <= 300 ? {trampaEstado: JSON.stringify(o.estado)} : {}),
        duenoUid: fbUsuario.uid, creado: firebase.firestore.FieldValue.serverTimestamp(),
      });
    });
    await lote.commit();
    return {colocadas: elegidas.length, mapaId};
  }

  /* ---------- Trampas consumibles sin disparar (2026-09-26, pedido del dueño) ----------
     Al cerrar el botín (el GM reparte XP y despoja lo que nadie tomó), las trampas que un jugador puso desde un consumible y que NO se
     dispararon se desarman solas y vuelven a su dueño: se borra el elemento y se deja un aviso en `recompensas` con el ítem en `devolver`;
     la ficha del dueño lo suma a la mochila (o al cinturón si la mochila no tiene lugar). Devuelve cuántas trampas se desarmaron. */
  async function desarmarTrampasConsumibles(mapaId){
    mapaId = mapaId || await mapaQueMiraElGM();
    const col = fbDb.collection(fbRutaCampana(mapaId === MAPA_PRINCIPAL_ID ? 'elementos' : `mapas/${mapaId}/elementos`));
    const snap = await col.get();
    const lote = fbDb.batch(), porFicha = new Map();
    let n = 0;
    snap.docs.forEach(d => {
      const e = d.data();
      if(!e.trampaItem || e.disparada || !e.duenoUid || !e.trampaFicha) return;
      lote.delete(d.ref);
      n++;
      const g = porFicha.get(e.trampaFicha) || {duenoUid: e.duenoUid, nombre: '', items: []};
      g.items.push(e.trampaItem);
      porFicha.set(e.trampaFicha, g);
    });
    if(!n) return 0;
    porFicha.forEach((g, fichaId) => lote.set(fbDb.collection(fbRutaCampana('recompensas')).doc(), {
      fichaId, duenoUid: g.duenoUid, nombre: g.nombre, xp: 0, dde: 0, despojos: 0, estado: 'trampas', aplicada: false, devolver: g.items,
      creado: firebase.firestore.FieldValue.serverTimestamp(),
    }));
    await lote.commit();
    return n;
  }

  /* ---------- Grupos de creeps ↔ mapas ----------
     Cada grupo de creeps (GM Tools) puede vincularse a un mapa guardado, para "Traer tokens" de un golpe. Un grupo tiene a lo sumo un
     mapa; un mapa puede tener varios grupos. Vive en campanas/<id>/gm/gruposMapas = {enlaces: [{grupo, mapaId}]} (solo el GM). */
  const refEnlaces = () => fbDb.doc(fbRutaCampana('gm/gruposMapas'));
  function enlacesEscuchar(alCambiar){
    return refEnlaces().onSnapshot(snap => {
      const d = snap.exists ? snap.data() : {};
      alCambiar((Array.isArray(d.enlaces) ? d.enlaces : []).filter(e => e && e.grupo && e.mapaId));
    }, err => console.error('Error escuchando los grupos vinculados a mapas:', err));
  }
  async function enlacesGuardar(lista){
    await refEnlaces().set({
      enlaces: lista.slice(0, 200).map(e => ({grupo: String(e.grupo).slice(0, 40), mapaId: String(e.mapaId).slice(0, 80)})),
      actualizado: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }
  // Lista nueva con el grupo vinculado a ese mapa (o sin mapa si mapaId viene vacío).
  const vincular = (lista, grupo, mapaId) => [...lista.filter(e => e.grupo !== grupo), ...(mapaId ? [{grupo, mapaId}] : [])];
  const mapaDeGrupo = (lista, grupo) => { const e = lista.find(x => x.grupo === grupo); return e ? e.mapaId : ''; };
  const gruposDeMapa = (lista, mapaId) => lista.filter(e => e.mapaId === mapaId).map(e => e.grupo);

  return {crear, mapaQueMiraElGM, centroGuardado, rutaTokens, colocarTrampas, desarmarTrampasConsumibles, enlacesEscuchar, enlacesGuardar, vincular, mapaDeGrupo, gruposDeMapa};
})();
