/* =========================================================
   🗂 REGISTRO DEL COMBATE (2026-11-04, dueño: «al iniciar la última sesión uno de los jugadores estaba convencido de que el punto de
   partida no era como lo habíamos dejado, y no teníamos un historial de movimientos o duelos… mantener un historial sin que se
   acumule al infinito»; «que siempre exista el botón "empezar registro nuevo", pero que además le aparezca un recordatorio al
   empezar un combate»).

   Antes, la Mesa (tiradas y resúmenes de duelos) y el 📜 Historial (vida, SP, estados) se borraban solos a las 48 h. Ahora se
   guardan por COMBATE: `campanas/<id>/ajustes/registro` = {desde, anteriorDesde, gmNombre, actualizado}.
   - «🆕 Empezar registro nuevo» (el GM, en el 📜 Historial; y el recordatorio al pasar el mapa a modo combate): lo de ahora pasa
     a ser «el combate anterior» (se sigue viendo) y se borra lo de ANTES de ese (las tiradas, el historial del GM y el de los
     jugadores). Así siempre quedan dos: este combate y el anterior.
   - Red de seguridad: lo de más de REGISTRO_TOPE_DIAS se borra igual (por si nadie empieza un registro nuevo en mucho tiempo).
   API: Registro.escuchar(cb) · Registro.desde() / anteriorDesde() (Date o null) · Registro.corte() (Date: lo anterior a esto se
   borra) · Registro.nuevo({preguntar}) · Registro.recordar() · Registro.borrarViejo(col) (lo usan mesa-historial.js y historial.js).
   Necesita sesion.js (fbDb, fbRutaCampana, fbMiembro) y Confirmar.
   ========================================================= */
const REGISTRO_TOPE_DIAS = 30;

const Registro = (() => {
  let doc = null, escuchando = false;
  const cbs = [];
  const ref = () => fbDb.doc(fbRutaCampana('ajustes/registro'));
  const aFecha = ts => ts && ts.toDate ? ts.toDate() : null;
  const esGM = () => !!(typeof fbMiembro !== 'undefined' && fbMiembro && fbMiembro.gm);
  const avisar = t => { if(typeof toast === 'function') toast(t); };

  function escuchar(cb){
    if(cb) cbs.push(cb);
    if(escuchando || typeof fbDb === 'undefined' || !fbDb) return;
    escuchando = true;
    ref().onSnapshot(s => { doc = s.exists ? s.data({serverTimestamps: 'estimate'}) : null; cbs.forEach(f => { try{ f(doc); }catch(e){} }); },
      err => console.error('Registro: no se pudo leer', err));
  }
  const desde = () => aFecha(doc && doc.desde);
  const anteriorDesde = () => aFecha(doc && doc.anteriorDesde);
  // Lo anterior a esta fecha se borra: el comienzo del combate anterior, y como mucho REGISTRO_TOPE_DIAS para atrás.
  function corte(){
    const tope = new Date(Date.now() - REGISTRO_TOPE_DIAS * 86400000);
    const a = anteriorDesde();
    return a && a > tope ? a : tope;
  }
  async function leerDoc(){
    try{ const s = await ref().get(); doc = s.exists ? s.data({serverTimestamps: 'estimate'}) : null; }catch(e){}
    return doc;
  }

  // Borra de una colección (tiradas, historial, historial_jugadores) lo anterior a `antesDe`, de a tandas. → cuántos borró.
  async function borrarAntes(col, antesDe){
    const c = fbDb.collection(fbRutaCampana(col));
    let total = 0;
    for(;;){
      const snap = await c.where('cuando', '<', firebase.firestore.Timestamp.fromDate(antesDe)).limit(400).get();
      if(snap.empty) break;
      const lote = fbDb.batch();
      snap.docs.forEach(d => lote.delete(d.ref));
      await lote.commit();
      total += snap.size;
      if(snap.size < 400) break;
    }
    return total;
  }
  async function borrarViejo(col){
    await leerDoc();
    return borrarAntes(col, corte());
  }

  // 🆕 Empezar un registro nuevo (solo el GM). → true si lo hizo.
  async function nuevo(o){
    if(!esGM()) return false;
    if(!(o && o.preguntar === false) && !(await Confirmar.preguntar('Lo que se registró hasta ahora (tiradas, duelos, movimientos, vida y estados) pasa a ser «el combate anterior» y se sigue viendo. Lo de antes de ese se borra para todos.',
      {titulo: '🆕 Empezar registro nuevo', icono: '🗂', si: 'Empezar registro nuevo', no: 'Cancelar'}))) return false;
    await leerDoc();
    const viejoDesde = doc && doc.desde ? doc.desde : null;
    try{
      await ref().set({desde: firebase.firestore.FieldValue.serverTimestamp(), anteriorDesde: viejoDesde,
        gmNombre: String((fbMiembro && fbMiembro.nombre) || 'GM').slice(0, 40), actualizado: firebase.firestore.FieldValue.serverTimestamp()});
    }catch(err){
      console.error('Registro: no se pudo empezar uno nuevo', err);
      avisar(err && err.code === 'permission-denied' ? 'No se pudo: faltan publicar las reglas nuevas de Firestore (el registro del combate)' : 'No se pudo empezar el registro nuevo');
      return false;
    }
    let n = 0;
    const tope = new Date(Date.now() - REGISTRO_TOPE_DIAS * 86400000), antes = aFecha(viejoDesde);
    const hasta = antes && antes > tope ? antes : tope;
    for(const col of ['tiradas', 'historial', 'historial_jugadores']){
      try{ n += await borrarAntes(col, hasta); }catch(err){ console.error('Registro: no se pudo borrar lo viejo de', col, err); }
    }
    avisar(`🗂 Registro nuevo${n ? ` · se borraron ${n} líneas de antes del combate anterior` : ''}`);
    return true;
  }

  // El recordatorio al empezar un combate (el GM pasa el mapa a modo combate).
  async function recordar(){
    if(!esGM()) return false;
    await leerDoc();
    const d = desde();
    const cuando = d ? ` (el actual empezó el ${d.toLocaleDateString('es-AR', {day: '2-digit', month: '2-digit'})} a las ${d.toLocaleTimeString('es-AR', {hour: '2-digit', minute: '2-digit', hour12: false})})` : '';
    const si = await Confirmar.preguntar(`Empieza un combate. ¿Empezás un registro nuevo${cuando}?\n\nEl de ahora pasa a ser «el combate anterior» y se sigue viendo. Si este combate sigue al anterior (por ejemplo, retoman la sesión pasada), seguí con el mismo.`,
      {titulo: '🗂 Registro del combate', icono: '🗂', si: 'Empezar registro nuevo', no: 'Seguir con el mismo'});
    return si ? nuevo({preguntar: false}) : false;
  }

  return {escuchar, desde, anteriorDesde, corte, borrarViejo, nuevo, recordar};
})();
