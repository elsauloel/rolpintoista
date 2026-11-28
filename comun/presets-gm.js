/* =========================================================
   PRESETS-GM — los "Mis presets" de estados alterados del GM, guardados en la partida (2026-10-02, hoja de ruta B-7b)
   Antes vivían solo en la memoria de GM Tools (S.estadosPersonalizados): se perdían al recargar y el mapa no los veía (ni el "+ Estado"
   de un creep ni sus editores). Ahora: campanas/<id>/gm/presetsEstados = {json: '[…]', actualizado} — solo el GM (las reglas de gm/*
   ya lo permiten). La forma de cada preset es la de un estado de creep (hpTurno, stacksTurno…), la misma que usaba GM Tools.
   escuchar(cb) → corta la escucha de cb (cb recibe la lista cada vez que cambia, y la actual si ya estaba leída).
   listo() → promesa: la primera lectura. lista() → la última lista leída. guardar(lista) → promesa.
   Necesita sesion.js (fbDb, fbRutaCampana).
   ========================================================= */
const PresetsGM = (() => {
  let ultima = [], escucha = null, oyentes = [], leida = false, avisarLeida = null;
  const primera = new Promise(r => { avisarLeida = r; });
  const ref = () => fbDb.doc(fbRutaCampana('gm/presetsEstados'));
  function arrancar(){
    if(escucha || !fbDb) return;
    escucha = ref().onSnapshot(d => {
      let l = [];
      try{ l = d.exists ? JSON.parse(d.data().json || '[]') : []; }catch(e){ l = []; }
      ultima = Array.isArray(l) ? l : [];
      if(!leida){ leida = true; avisarLeida(); }
      oyentes.forEach(f => f(ultima));
    }, err => { console.error('No se pudieron leer los presets del GM:', err); if(!leida){ leida = true; avisarLeida(); } });
  }
  function escuchar(cb){
    oyentes.push(cb);
    arrancar();
    if(leida) cb(ultima);
    return () => { oyentes = oyentes.filter(f => f !== cb); };
  }
  function listo(){ arrancar(); return primera; }
  function guardar(lista){
    ultima = Array.isArray(lista) ? lista : [];
    return ref().set({json: JSON.stringify(ultima), actualizado: firebase.firestore.FieldValue.serverTimestamp()})
      .catch(err => console.error('No se pudieron guardar los presets del GM:', err));
  }
  return {escuchar, listo, lista: () => ultima, guardar};
})();
