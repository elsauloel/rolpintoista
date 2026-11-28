// Corre ADENTRO de la página que abre base.js (Firebase con la cuenta GM de pruebas). Ver LEEME.md.
// Sin ids ni emails: la partida y el mapa se buscan por su nombre.
'use strict';
const MG = {
  pid: '',
  async entrar(email, clave){
    fbIniciar();
    await firebase.auth().signInWithEmailAndPassword(email, clave);
    fbUsuario = firebase.auth().currentUser;
    return fbUsuario.uid;
  },
  // La partida (nombre exacto, una sola) y su mapa (nombre exacto, uno solo). Solo partidas de prueba: el nombre tiene que decir «prueba».
  async buscar(partida, mapa){
    const s = await fbDb.collection('campanas').get();
    const l = s.docs.filter(d => (d.data().nombre || '') === partida);
    if(l.length !== 1) throw new Error(`Con el nombre «${partida}» hay ${l.length} partidas: tiene que haber exactamente una`);
    if(!/prueba/i.test(partida)) throw new Error('Esto es solo para partidas de prueba (el nombre tiene que decir «prueba»)');
    MG.pid = l[0].id;
    const m = await fbDb.doc(`campanas/${MG.pid}/miembros/${fbUsuario.uid}`).get();
    if(!m.exists || !m.data().gm) throw new Error('La cuenta no es GM de esa partida');
    const ms = await fbDb.collection(`campanas/${MG.pid}/mapas`).get();
    const lm = ms.docs.filter(d => (d.data().nombre || '') === mapa);
    if(lm.length !== 1) throw new Error(`Con el nombre «${mapa}» hay ${lm.length} mapas: tiene que haber exactamente uno`);
    return {pid: MG.pid, mid: lm[0].id};
  },
  plano(v){
    const T = firebase.firestore;
    if(v === null || v === undefined) return null;
    if(v instanceof T.Timestamp) return {__f: 'fecha', s: v.seconds, n: v.nanoseconds};
    if(Array.isArray(v)) return v.map(MG.plano);
    if(typeof v === 'object'){ const o = {}; Object.keys(v).forEach(k => { o[k] = MG.plano(v[k]); }); return o; }
    return v;
  },
  real(v){
    const T = firebase.firestore;
    if(v === null || typeof v !== 'object') return v;
    if(Array.isArray(v)) return v.map(MG.real);
    if(v.__f === 'fecha') return new T.Timestamp(v.s, v.n);
    if(v.__f === 'ahora') return T.FieldValue.serverTimestamp();
    const o = {}; Object.keys(v).forEach(k => { o[k] = MG.real(v[k]); }); return o;
  },
  ruta(rel){
    if(!MG.pid) throw new Error('Falta buscar la partida');
    if(!rel || rel.includes('..')) throw new Error('Ruta rara: ' + rel);
    return `campanas/${MG.pid}/${rel}`;
  },
  // Lee documentos sueltos: {ruta: datos | null}.
  async docs(rutas){
    const o = {};
    for(const r of rutas){ const d = await fbDb.doc(MG.ruta(r)).get(); o[r] = d.exists ? MG.plano(d.data()) : null; }
    return o;
  },
  // Lee colecciones enteras: {ruta del doc: datos}.
  async colecciones(rutas){
    const o = {};
    for(const r of rutas){ const s = await fbDb.collection(MG.ruta(r)).get(); s.docs.forEach(d => { o[`${r}/${d.id}`] = MG.plano(d.data()); }); }
    return o;
  },
  async consulta(col, campo, valor){
    const s = await fbDb.collection(MG.ruta(col)).where(campo, '==', valor).get();
    const o = {}; s.docs.forEach(d => { o[`${col}/${d.id}`] = MG.plano(d.data()); }); return o;
  },
  // Una escritura: {ruta, datos} (set) | {ruta, borrar: true}. Devuelve '' si salió o el error.
  async escribir(op){
    try{
      const ref = fbDb.doc(MG.ruta(op.ruta));
      if(op.borrar) await ref.delete(); else await ref.set(MG.real(op.datos));
      return '';
    }catch(e){ return String(e && (e.code || e.message) || e).slice(0, 160); }
  },
};
