// js/83-pacto.js — 😇 el Pacto, arriba del mapa.
/* (dueño, 2026-10-28: «el pacto debe aparecer como un estado activo o botón inactivo, en los botones instantáneos de la parte superior del mapa… podría ser un
   ángel o un halo o algo sagrado»). Para un jugador, el botón 😇 de su personaje principal, siempre a la vista: dorado si el pacto está activo, gris si se
   gastó (lo dice `resumen.pacto` de su ficha). Tocarlo explica qué hace. El pacto se marca en la ficha («😇 Pacto: sí / no»); lo gasta la vida al llegar a 0
   (danioPj, js/10, y FichaAcciones.revisarAnkh). */
function renderPactoBoton(){
  if(typeof Flotantes === 'undefined' || !Flotantes.pacto) return;
  const id = !soyGM && typeof fichaPrincipalId === 'function' ? fichaPrincipalId() : null, f = id && fichasPub.get(id);
  if(!f || !f.resumen){ Flotantes.pacto(null); return; }
  const activo = f.resumen.pacto === true, nombre = f.nombre || (f.resumen && f.resumen.nombre) || 'Tu personaje';
  Flotantes.pacto({mostrar: true, activo, alClic: () => Confirmar.preguntar(activo
    ? `${nombre} tiene un pacto espiritual activo.\n\nSi su vida llega a 0, revive solo con un cuarto de su vida y queda Titilando (invulnerable) hasta el inicio de su próximo turno. Ahí el pacto se gasta.`
    : `El pacto de ${nombre} está gastado.\n\nSe renueva cuando la historia lo dé: alguna entidad espiritual que le brinde otro, por el precio o el intercambio que decida el GM. Se marca en la ficha (😇 Pacto: sí).`,
    {titulo: 'Pacto', icono: '😇', si: 'Entendido', no: 'Cerrar'})});
}
setInterval(() => { try{ renderPactoBoton(); }catch(e){} }, 1500);

/* 😇 Renovar el Pacto desde el mapa (dueño, 2026-11-19: «me gustaría que el jugador también pueda reactivar su pacto desde el mismo botón del mapa»). Lo
   renueva la historia (lo marca el GM), pero las herramientas avisan en vez de prohibir: en el menú del token de un personaje (no una invocación) con el
   Pacto gastado, «😇 Renovar el Pacto» para el GM y para el jugador dueño. Pide confirmar, marca `S.meta.pacto` en su ficha (editarPersonajeMapa, js/11),
   deja la línea en la Mesa (quién lo renovó, Combatiente.pactoRenovadoTxt) y al jugador le llega el Aviso «Una entidad espiritual te brindó un nuevo
   Pacto». Gastarlo sigue automático (danioPj, js/10). */
// ¿Esta pantalla puede tocar el Pacto de ese token? El GM o el jugador dueño, en un personaje (no una invocación). `activo`: el que tiene que tener ahora.
function pactoPuedeCambiar(t, activo){
  if(!t || t.tipo !== 'pj' || !t.fichaId || String(t.fichaId).includes(SEP_INVOCACION)) return false;
  const f = fichasPub.get(t.fichaId);
  if(!f || !f.resumen || (f.resumen.pacto === true) !== activo) return false;
  return !!soyGM || f.duenoUid === fbUsuario.uid;
}
function pactoPuedeRenovar(t){ return pactoPuedeCambiar(t, false); }
function pactoPuedeQuitar(t){ return pactoPuedeCambiar(t, true); }
async function pactoRenovar(t){
  if(!pactoPuedeRenovar(t)) return;
  const f = fichasPub.get(t.fichaId), nombre = nombreDe(t), porGM = !!soyGM && f.duenoUid !== fbUsuario.uid;
  const ok = await Confirmar.preguntar(porGM
    ? `¿Le renovás el Pacto a ${nombre}?\n\nUna entidad espiritual le brinda un nuevo Pacto: si su vida llega a 0, revive solo con un cuarto de su vida y queda Titilando hasta su próximo turno.`
    : `¿Renovás el Pacto de ${nombre}?\n\n${Combatiente.PACTO_A_MANO.replace(' ¿Lo cambiás igual?', '')} Si la historia te lo dio, renovalo.`,
    {titulo: 'Renovar el Pacto', icono: '😇', si: '😇 Renovar el Pacto', no: 'Cancelar'});
  if(!ok) return;
  toast(`😇 Renovando el Pacto de ${nombre}…`);   // (leer y guardar el personaje desde el mapa tarda unos segundos)
  let hubo = null;
  try{ hubo = await editarPersonajeMapa(t.fichaId, S => { S.meta = S.meta || {}; if(S.meta.pacto) return false; S.meta.pacto = true; return true; }); }
  catch(err){ console.error('Renovar el Pacto:', err); }
  if(hubo === false){ toast(`😇 ${nombre} ya tenía el Pacto activo`); return; }
  if(!hubo){ toast(`😇 No se pudo renovar el Pacto de ${nombre}: marcalo en su ficha (😇 Pacto: sí)`); return; }
  const linea = Combatiente.pactoRenovadoTxt(nombre, porGM);
  try{ await mesaLinea(linea, 'recordatorio'); }catch(e){}
  try{ momentoAbrir({tipo: 'pacto', icono: '😇', titulo: linea.replace(/^😇 /, ''), resultado: 'Si su vida llega a 0, revive solo y queda Titilando hasta su próximo turno.', estado: 'listo',
    datos: {...(f.duenoUid ? {paraUid: f.duenoUid} : {}), aviso: true, tituloAviso: 'Un nuevo Pacto', textoAviso: `${Combatiente.PACTO_AVISO} Si tu vida llega a 0, revivís solo y quedás Titilando hasta tu próximo turno.`}}); }catch(e){}
  hudPonerNivel('vital');
}

/* 😇🚫 en el anillo del token (2026-11-26, dueño: «la paloma quedó para mensajes. Quizás el mismo emoji del pacto, pero con el círculo rojo de
   "prohibido" encima»): el 😇 con un círculo rojo tachado dibujado en SVG encima (.hud-sin-pacto, mapa.css). Donde solo va texto (el cartel de
   confirmar, los avisos, la Crónica), 😇🚫. La 🕊 queda solo para los mensajes secretos (comun/mensajes.js). */
const PACTO_QUITAR_ICONO = '<span class="hud-sin-pacto">😇<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.2"/><line x1="4.2" y1="4.2" x2="15.8" y2="15.8"/></svg></span>';
const PACTO_QUITAR_TXT = '😇🚫';

/* 😇🚫 Quitar el Pacto desde el mapa (dueño, 2026-11-19, P244 ✅: «técnicamente también debería poderse quitar. Desde el mismo lugar no estaría mal»): en
   el mismo menú del token, con el Pacto activo, para los mismos que lo renuevan (el GM y el jugador dueño). Pide confirmar, apaga `S.meta.pacto`, deja la
   línea en la Mesa (Combatiente.pactoQuitadoTxt) y al jugador le llega el Aviso. */
async function pactoQuitar(t){
  if(!pactoPuedeQuitar(t)) return;
  const f = fichasPub.get(t.fichaId), nombre = nombreDe(t), porGM = !!soyGM && f.duenoUid !== fbUsuario.uid;
  const ok = await Confirmar.preguntar(porGM
    ? `¿Le quitás el Pacto a ${nombre}?\n\nSin el Pacto, si su vida llega a 0 no revive solo. Se le puede volver a dar con el 😇 del mismo menú.`
    : `¿Dejás el Pacto de ${nombre}?\n\nSin el Pacto, si tu vida llega a 0 no revivís solo. El Pacto lo da la historia: hablalo con el GM.`,
    {titulo: 'Quitar el Pacto', icono: PACTO_QUITAR_TXT, si: porGM ? `${PACTO_QUITAR_TXT} Quitar el Pacto` : `${PACTO_QUITAR_TXT} Dejar el Pacto`, no: 'Cancelar'});
  if(!ok) return;
  toast(`${PACTO_QUITAR_TXT} Quitando el Pacto de ${nombre}…`);
  let hubo = null;
  try{ hubo = await editarPersonajeMapa(t.fichaId, S => { S.meta = S.meta || {}; if(!S.meta.pacto) return false; S.meta.pacto = false; return true; }); }
  catch(err){ console.error('Quitar el Pacto:', err); }
  if(hubo === false){ toast(`😇 ${nombre} ya no tenía el Pacto`); return; }
  if(!hubo){ toast(`😇 No se pudo quitar el Pacto de ${nombre}: cambialo en su ficha (😇 Pacto: no)`); return; }
  const linea = Combatiente.pactoQuitadoTxt(nombre, porGM);
  try{ await mesaLinea(linea, 'recordatorio'); }catch(e){}
  try{ momentoAbrir({tipo: 'pacto', icono: PACTO_QUITAR_TXT, titulo: linea.replace(/^😇 /, ''), resultado: 'Sin el Pacto: si su vida llega a 0, no revive solo.', estado: 'listo',
    datos: {...(f.duenoUid ? {paraUid: f.duenoUid} : {}), aviso: true, tituloAviso: 'Sin el Pacto', textoAviso: Combatiente.pactoQuitadoAviso(porGM)}}); }catch(e){}
  hudPonerNivel('vital');
}
