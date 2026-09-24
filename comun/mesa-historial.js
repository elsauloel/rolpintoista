/* =========================================================
   HISTORIAL DE LA MESA
   Compartido por la ficha, gm-tools y el mapa (se carga después de
   sesion.js). Las tiradas solo hacen falta durante la sesión de juego:

   - 🗑 en la cabecera de la Mesa (solo el GM): borra todas las tiradas
     de la partida. A todos se les vacía la Mesa al instante.
   - Borrado automático: cuando el GM entra a cualquiera de las tres
     herramientas, se borran las tiradas de más de MESA_HISTORIAL_HORAS.
     No hay servidor que lo haga solo; sin GM no hay sesión, así que
     alcanza con hacerlo al entrar. Como mucho una vez por hora por
     navegador, para no repetirlo en cada pestaña o iframe.

   Los jugadores no pueden borrar tiradas (lo imponen las reglas).
   Ver docs/workflow-firebase.md.
   ========================================================= */

const MESA_HISTORIAL_HORAS = 48;
const MESA_LIMPIEZA_CADA_MS = 60 * 60 * 1000;

function mesaBorrarHtml(){
  return '<button type="button" class="mesa-borrar" hidden title="Borrar el historial de tiradas para toda la mesa">🗑</button>';
}

// Borra las tiradas de la partida (todas, o las anteriores a `antesDe`)
// de a tandas. Devuelve cuántas borró.
async function mesaBorrarTiradas(antesDe){
  const col = fbDb.collection(fbRutaCampana('tiradas'));
  let total = 0;
  for(;;){
    const consulta = antesDe
      ? col.where('cuando', '<', firebase.firestore.Timestamp.fromDate(antesDe)).limit(400)
      : col.limit(400);
    const snap = await consulta.get();
    if(snap.empty) break;
    const lote = fbDb.batch();
    snap.docs.forEach(d => lote.delete(d.ref));
    await lote.commit();
    total += snap.size;
    if(snap.size < 400) break;
  }
  return total;
}

async function mesaLimpiezaAutomatica(){
  const clave = 'mesa-limpieza-' + FB_CAMPANA;
  let ultima = 0;
  try{ ultima = Number(localStorage.getItem(clave)) || 0; }catch(e){}
  if(Date.now() - ultima < MESA_LIMPIEZA_CADA_MS) return;
  try{ localStorage.setItem(clave, String(Date.now())); }catch(e){}
  try{
    const n = await mesaBorrarTiradas(new Date(Date.now() - MESA_HISTORIAL_HORAS * 3600 * 1000));
    if(n) console.log(`Mesa: ${n} tiradas de más de ${MESA_HISTORIAL_HORAS} h borradas`);
  }catch(err){
    console.error('No se pudo limpiar el historial viejo de la Mesa:', err);
  }
}

// Se llama cuando ya se entró a la partida: muestra 🗑 al GM y limpia lo viejo.
function mesaHistorialAlEntrar(){
  if(typeof historialAlEntrar === 'function') historialAlEntrar();   // 📜 Historial de acciones menores (solo GM, comun/historial.js)
  if(!fbMiembro || !fbMiembro.gm) return;
  document.querySelectorAll('.mesa-borrar').forEach(b => {
    b.hidden = false;
    b.onclick = async e => {
      e.stopPropagation();
      if(!confirm('¿Borrar todo el historial de tiradas de la Mesa?\n\nSe borra para todos y no se puede deshacer. Si querés guardarlo, bajá antes el respaldo 💾.')) return;
      b.disabled = true;
      try{
        const n = await mesaBorrarTiradas(null);
        if(typeof toast === 'function') toast(n ? `Historial borrado (${n} tiradas)` : 'No había tiradas para borrar');
      }catch(err){
        console.error('No se pudo borrar el historial de la Mesa:', err);
        if(typeof toast === 'function') toast('No se pudo borrar el historial — revisá la consola');
      }finally{
        b.disabled = false;
      }
    };
  });
  mesaLimpiezaAutomatica();
}
