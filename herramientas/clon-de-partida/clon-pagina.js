// Funciones que corren ADENTRO de las dos páginas del clon (lectura y escritura). Ver LEEME.md.
// Nada de esto tiene ids ni emails: las partidas se buscan por su nombre exacto.
'use strict';

// Todas las colecciones de una partida (las de firebase/firestore.rules), con sus subcolecciones.
const CLON_COLECCIONES = {
  miembros: {}, traspaso: {}, bitacora: {entradas: {}}, gmBitacora: {entradas: {}}, historial: {}, historial_jugadores: {}, tiradas: {},
  fichas: {partes: {}}, creeps: {privado: {}, publico: {}}, gm: {}, tienda: {}, ajustes: {}, pausaLog: {}, recompensas: {}, botin: {}, ppt: {},
  mesaComun: {}, paquetes: {}, baul: {}, baulLog: {}, duelos: {}, momentos: {}, areas: {}, estados: {}, combate: {}, tiendas: {},
  mapa: {}, tokens: {}, trazos: {}, pings: {}, elementos: {},
  mapas: {estado: {}, tokens: {}, trazos: {}, pings: {}, elementos: {}},
};

const ClonPagina = {
  async entrar(email, clave){
    fbIniciar();
    await firebase.auth().signInWithEmailAndPassword(email, clave);
    fbUsuario = firebase.auth().currentUser;
    return fbUsuario.uid;
  },

  // La partida con ese nombre exacto. Tiene que haber una sola.
  async partidaPorNombre(nombre){
    const snap = await fbDb.collection('campanas').get();
    const iguales = snap.docs.filter(d => (d.data().nombre || '') === nombre);
    if(iguales.length !== 1) throw new Error(`Con el nombre «${nombre}» hay ${iguales.length} partidas: tiene que haber exactamente una`);
    const d = iguales[0];
    const m = await fbDb.doc(`campanas/${d.id}/miembros/${fbUsuario.uid}`).get();
    return {id: d.id, datos: ClonPagina.plano(d.data()), miembro: m.exists ? ClonPagina.plano(m.data()) : null};
  },

  // Pasa los datos de Firestore a JSON sin perder las fechas.
  plano(v){
    const T = firebase.firestore;
    if(v === null || v === undefined) return v === undefined ? null : v;
    if(v instanceof T.Timestamp) return {__clon: 'fecha', s: v.seconds, n: v.nanoseconds};
    if(v instanceof T.GeoPoint) return {__clon: 'geo', lat: v.latitude, lng: v.longitude};
    if(v instanceof T.DocumentReference) throw new Error('Hay una referencia a otro documento: este script no la sabe copiar');
    if(v instanceof T.Blob || (T.Bytes && v instanceof T.Bytes)) throw new Error('Hay un dato binario: este script no lo sabe copiar');
    if(Array.isArray(v)) return v.map(ClonPagina.plano);
    if(typeof v === 'object'){ const o = {}; Object.keys(v).forEach(k => { o[k] = ClonPagina.plano(v[k]); }); return o; }
    return v;
  },
  // Al revés: de JSON a datos de Firestore. {__clon: 'ahora'} = la hora del servidor (la piden las reglas en varias colecciones).
  real(v){
    const T = firebase.firestore;
    if(v === null || typeof v !== 'object') return v;
    if(Array.isArray(v)) return v.map(ClonPagina.real);
    if(v.__clon === 'fecha') return new T.Timestamp(v.s, v.n);
    if(v.__clon === 'geo') return new T.GeoPoint(v.lat, v.lng);
    if(v.__clon === 'ahora') return T.FieldValue.serverTimestamp();
    const o = {}; Object.keys(v).forEach(k => { o[k] = ClonPagina.real(v[k]); }); return o;
  },

  // Lee una colección entera (con sus subcolecciones) de la partida `id`. Devuelve una lista plana de {ruta, datos}, con la ruta
  // relativa a la partida («fichas/<id>/partes/general»), y la lista de lo que no se pudo leer.
  async leerColeccion(id, nombre, subs, idsExtra){
    const docs = [], fallas = [];
    const bajar = async (rutaRel, sub, extra) => {
      let snap;
      try{ snap = await fbDb.collection(`campanas/${id}/${rutaRel}`).get(); }
      catch(e){ fallas.push({ruta: rutaRel, error: String(e && e.code || e).slice(0, 120)}); return; }
      const ids = new Set(snap.docs.map(d => d.id));
      for(const d of snap.docs) docs.push({ruta: `${rutaRel}/${d.id}`, datos: ClonPagina.plano(d.data())});
      (extra || []).forEach(x => ids.add(x));   // documentos «fantasma»: sin datos propios pero con cosas colgando
      for(const docId of ids) for(const s of Object.keys(sub || {})) await bajar(`${rutaRel}/${docId}/${s}`, sub[s]);
    };
    await bajar(nombre, subs, idsExtra);
    return {docs, fallas};
  },

  // ── Solo en la página de escritura ──
  rutaClon(rutaRel){
    const ruta = `campanas/${Candado.destino}/${rutaRel}`;
    if(!Candado.permitida(ruta)) throw new Error('BLOQUEADO: la ruta no es de la partida clon');
    return ruta;
  },
  // Escribe una tanda de documentos en un solo lote. ops = [{ruta (relativa al clon), datos}] o [{ruta, borrar: true}] o [{ruta, cambiar: {...}}].
  async escribir(ops){
    const lote = fbDb.batch();
    for(const op of ops){
      const ref = fbDb.doc(ClonPagina.rutaClon(op.ruta));
      if(op.borrar) lote.delete(ref);
      else if(op.cambiar) lote.update(ref, ClonPagina.real(op.cambiar));
      else lote.set(ref, ClonPagina.real(op.datos));
    }
    await lote.commit();
  },
};
