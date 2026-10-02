/* =========================================================
   ESTADOS-RECIBIDOS — los estados que otros le dejan a un personaje o a su invocación (2026-10-02, hoja de ruta B-8)
   Una habilidad de creep, una trampa, una zona o la Ejecución ✨ de una habilidad de otro dejan un aviso en
   campanas/<id>/estados (`EstadosAplicar.encolarPj`): a un personaje no se le escribe la ficha desde afuera. Acá vive el lado
   que lo recibe, para la ficha y el mapa por igual (antes solo la ficha abierta los aplicaba: con el mapa solo, quedaban
   esperando):
   - `escuchar(cb)`: los avisos pendientes que le tocan a este usuario (el GM, todos: puede tener 🎮 el control de alguno).
     cb(docs). Devuelve la función que corta la escucha.
   - `deFicha(docs, fichaId)`: los de ese personaje y los de sus invocaciones (`fichaId~invId`).
   - `tomar(doc, borrar)`: transacción; true si lo tomó esta pantalla (si otra ya lo aplicó, false). `borrar` = el GM con el
     control (las reglas solo le dejan marcarlo como aplicado al dueño).
   - `aplicar(S, doc, ui)`: lo aplica al personaje (FichaAcciones.aplicarEstadoRecibido) o a su invocación
     (InvHabilidades.ponerEstado). ui = {presets, toast, cambio(lista)} (lo de FichaAcciones). → {inv?} (la invocación que cambió).
   Necesita sesion.js (fbDb, fbRutaCampana, fbUsuario, fbMiembro), ficha-acciones.js y, para invocaciones, inv-habilidades.js.
   ========================================================= */
const EstadosRecibidos = (() => {
  const SEP = '~';
  function escuchar(cb){
    if(typeof fbDb === 'undefined' || !fbDb || !fbUsuario) return () => {};
    const col = fbDb.collection(fbRutaCampana('estados'));
    const q = fbMiembro && fbMiembro.gm ? col.where('aplicada', '==', false) : col.where('duenoUid', '==', fbUsuario.uid).where('aplicada', '==', false);
    return q.onSnapshot(snap => cb(snap.docs), err => console.error('Error escuchando los estados recibidos:', err));
  }
  const fichaDe = d => String((d.data() || {}).fichaId || '');
  function deFicha(docs, fichaId){
    const id = String(fichaId || '');
    return id ? (docs || []).filter(d => { const f = fichaDe(d); return f === id || f.startsWith(id + SEP); }) : [];
  }
  async function tomar(d, borrar){
    return fbDb.runTransaction(async tx => {
      const x = await tx.get(d.ref);
      if(!x.exists || x.data().aplicada) return false;
      if(borrar) tx.delete(d.ref); else tx.update(d.ref, {aplicada: true});
      return true;
    });
  }
  function spec(d){
    try{ return JSON.parse((d.data() || {}).spec || 'null'); }catch(e){ return null; }
  }
  function aplicar(S, d, ui){
    const sp = spec(d), origen = (d.data() || {}).origen || '';
    if(!sp || !sp.nombre) return {};
    const invId = fichaDe(d).split(SEP)[1];
    if(!invId){ FichaAcciones.aplicarEstadoRecibido(S, sp, origen, ui); return {}; }
    const inv = (S.invocaciones || []).find(i => i && i.id === invId);
    if(!inv){ ui.toast(`${origen ? origen + ': ' : ''}${sp.nombre} — la invocación ya no está`); return {}; }
    const txt = InvHabilidades.ponerEstado(inv, FichaAcciones.estadoDeSpec(sp, ui.presets));
    ui.toast(`🎯 ${origen ? origen + ' → ' : ''}${inv.nombre}: ${txt}`);
    return {inv};
  }
  return {escuchar, deFicha, tomar, spec, aplicar};
})();
