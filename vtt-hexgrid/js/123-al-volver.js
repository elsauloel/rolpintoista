// js/123-al-volver.js — ☥ Alguien volvió de la muerte: el mapa lo cuenta (2026-11-20).
//
// Dueño: «cuando un personaje muere y resucita, de cualquier forma, ya sea resurrección automática con un Pacto, con un Ankh, con la poción de Fénix, o
// que lo resuciten con un Revive. Al resucitar se le borran todos los estados alterados… Tanto los buenos como los malos».
//
// Los estados los saca UN solo lugar: Combatiente.volverLimpio (comun/combatiente.js), que llaman todas las formas de volver. Lo que se VE en el mapa
// pasa por UN solo lugar también, este:
//
//   ▶ resurreccionAnunciar({t | fichaId, nombre?, forma, sacados})
//       forma: 'llama' (la Llama de Fénix) | 'pacto' | 'ankh' | 'revive' (el ✚ del token, el ✚ de la pantalla roja o el consumible Revive)
//       sacados: [{nombre, polaridad}] — los estados que se le fueron al volver (puede venir vacío)
//
// Llega acá: un personaje, desde editarPersonajeMapa y bnRevisarVida (js/11) por resurreccionRevisarPj (cualquier camino que pase por FichaAcciones) y
// desde danioPj (js/10: el Pacto o la Llama que saltan con el golpe); un creep o una invocación, desde danioCreep (js/10), revivirToken (js/98) y
// revivirElegido (js/22).
// ✨ LAS ANIMACIONES DE RESURRECCIÓN (la tarea que sigue en la cola) SE ENGANCHAN ACÁ: ya llega el token, la forma y es el momento justo en que volvió.
// Hoy solo cuenta los estados que se fueron: un toast en esta pantalla, la línea de la Mesa («☥ X volvió: se le fueron N estados (…)») y el Aviso al
// centro para el jugador dueño. Un creep oculto para los jugadores no deja línea en la Mesa.

function resurreccionTokenDe(fichaId){
  for(const x of tokens.values()) if(x && x.fichaId === fichaId) return x;
  return null;
}
function resurreccionAnunciar(o){
  try{
    o = o || {};
    const t = o.t || (o.fichaId ? resurreccionTokenDe(o.fichaId) : null);
    const fichaId = o.fichaId || (t && t.fichaId) || '';
    const base = String(fichaId).split(SEP_INVOCACION)[0];
    const f = typeof fichasPub !== 'undefined' && base ? fichasPub.get(base) : null;
    const esCreep = !!(t && t.tipo === 'creep');
    const nombre = o.nombre || (t ? nombreDe(t) : '') || (f && (f.nombre || (f.resumen && f.resumen.nombre))) || 'Tu personaje';
    const sacados = Array.isArray(o.sacados) ? o.sacados : [];
    // ✨ (acá va la animación de `o.forma` sobre `t`: Ankh, Fénix, Revive, Pacto)
    if(!sacados.length) return;
    const txt = Combatiente.vueltaTxt(nombre, sacados);
    toast(txt);
    const escondido = esCreep && t && (t.oculto || (typeof enSigilo === 'function' && enSigilo(t)));
    if(!escondido){ try{ mesaLinea(txt, 'recordatorio'); }catch(e){} }
    if(esCreep) return;
    const duenoUid = (f && f.duenoUid) || (t && t.duenoUid) || '';
    try{ momentoAbrir({tipo: 'buff', icono: '☥', titulo: `${nombre} volvió: se le fueron los estados`, resultado: txt, estado: 'listo',
      datos: {...(duenoUid ? {paraUid: duenoUid} : {}), aviso: true, boton: 'Entendido', tituloAviso: 'Volviste: se te fueron los estados', textoAviso: Combatiente.vueltaAviso(sacados)}}); }catch(e){}
  }catch(err){ console.error('Al volver:', err); }
}
// Un personaje que el mapa acaba de cambiar (js/11): si en ese cambio volvió de la muerte, lo cuenta. Una sola vez (vueltaTomar la olvida).
function resurreccionRevisarPj(fichaId, S){
  const v = S ? Combatiente.vueltaTomar(S) : null;
  if(!v) return;
  resurreccionAnunciar({fichaId, nombre: ((S.meta && S.meta.nombre) || '').trim(), forma: v.forma, sacados: v.sacados});
}
