// js/98-vida-en-cero.js — 💔 Un personaje que queda en 0 de vida desde el mapa (2026-11-04).
//
// Dueño: «Bizzante quedó en 0 HP (se puso −N en el recuadro de HP directo, hasta quedar en 0) y no se murió, ni se activó su pacto».
// La revisión de la vida en 0 (la Llama de Fénix, el Pacto, el Ankh del cinturón y, si nada lo salva, inconsciente con 5 turnos para morir:
// FichaAcciones.revisarAnkh + revisarMuerte) la hacía solo la ficha de su dueño cuando ÉL hacía algo; «HP directo» (cambiarVidaPj, js/09)
// escribe la vida tal cual, y un golpe (danioPj, js/10) revisaba el Pacto y la Llama pero no dejaba al personaje inconsciente.
// Ahora, cualquiera sea el camino: si un personaje tiene 0 de vida y su resumen todavía no dice que está caído (`muerto`) ni muerto de
// verdad (`muertoDef`), la pantalla de quien lo maneja (su dueño, o el GM con 🎮 el control: bnManejo) corre esa misma revisión y la guarda.
// Las invocaciones no: su vida en 0 la resuelve su dueño (desaparecen o no, como siempre).

const vidaCeroEnCurso = new Set();
const vidaCeroVisto = new Map();     // fichaId → desde cuándo está en 0 sin marcar (se espera un momento: la ficha abierta puede resolverlo antes)
const vidaCeroIntento = new Map();   // fichaId → cuándo se probó por última vez (no reintentar en 30 s si el resumen no cambió)

async function vidaCeroRevisar(fichaId){
  if(vidaCeroEnCurso.has(fichaId) || Date.now() - (vidaCeroIntento.get(fichaId) || 0) < 30000) return;
  vidaCeroEnCurso.add(fichaId);
  vidaCeroIntento.set(fichaId, Date.now());
  let salvado = '', cayo = false, nombre = '';
  try{
    await editarPersonajeMapa(fichaId, S => {
      nombre = ((S.meta && S.meta.nombre) || '').trim() || 'Tu personaje';
      if(num(S.hp) > 0 || (S.muerto && (S.muerto.activo || S.muerto.definitivo))) return false;   // ya lo resolvió otra pantalla
      salvado = FichaAcciones.revisarAnkh(S) || '';
      const r = FichaAcciones.revisarMuerte(S);
      cayo = !!(r && r.cayo);
      return true;
    });
  }catch(err){ console.error('La vida en 0: no se pudo revisar', err); }
  finally{ vidaCeroEnCurso.delete(fichaId); vidaCeroVisto.delete(fichaId); }
  if(salvado){
    const txt = salvado === 'El Pacto' ? `😇 ${nombre} zafó de morir: lo salvó el pacto (vuelve Titilando)`
      : salvado === 'Llama de Fénix' ? `🔥 ${nombre}: ¡la Llama de Fénix lo levanta con toda la vida, Titilando!`
      : `☥ ${nombre}: ¡${salvado} se activó solo y revive!`;
    toast(txt);
    try{ mesaLinea(txt, 'recordatorio'); }catch(e){}
    try{ momentoAbrir({tipo: 'buff', icono: salvado === 'El Pacto' ? '😇' : salvado === 'Llama de Fénix' ? '🔥' : '☥', titulo: `${nombre} no cae`, resultado: txt, estado: 'listo'}); }catch(e){}
  }else if(cayo){
    try{ mesaLinea(`💔 ${nombre} quedó en 0 de vida: inconsciente (5 turnos para morir)`, 'recordatorio'); }catch(e){}
  }
}

setInterval(() => {
  try{
    if(typeof fichasPub === 'undefined' || typeof bnManejo !== 'function' || typeof editarPersonajeMapa !== 'function' || window.parent !== window) return;
    const ahora = Date.now();
    for(const [fichaId, f] of fichasPub){
      const r = f && f.resumen;
      if(!r || r.hp === undefined || num(r.hp) > 0 || r.muerto === true || r.muertoDef || !bnManejo(fichaId)){ vidaCeroVisto.delete(fichaId); continue; }
      if(!vidaCeroVisto.has(fichaId)){ vidaCeroVisto.set(fichaId, ahora); continue; }
      if(ahora - vidaCeroVisto.get(fichaId) >= 1500) vidaCeroRevisar(fichaId);
    }
  }catch(err){ console.error('La vida en 0', err); }
}, 1000);
