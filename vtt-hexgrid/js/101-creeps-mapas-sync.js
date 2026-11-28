/* 🔗 El token de un creep y el creep de GM Tools, vinculados (2026-11-05, dueño: «puede estar en el mapa el token de un creep, pero en GM Tools ese
   creep estar en Reserva… los tokens y la ficha de los creeps de GM Tools deben estar vinculados. Si se mueve una cosa de una a otra, debe suceder de
   manera pareja. La mayor parte del juego va a suceder a través del mapa»). El mapa donde está el token manda (reglas puras en comun/creeps-mapas.js).
   Solo el GM:
   - `creepMapaRevisar(creepId)`: al aparecer el token de un creep en el mapa que mira el GM (escucharTokens, js/09; también lo que crean 🎭, Ctrl+V,
     los refuerzos…), espera un momento (por si GM Tools lo está mudando) y deja al creep en el mapa de su token (`modificarCreep`: GM Tools abierto se
     entera por la firma). Si tiene tokens en dos mapas, pregunta dónde queda (dueño: «avisar y preguntarle al GM»).
   - `creepTokenSacado(creepId, mapa, nombre)`: lo llama `borrarToken` (js/09) cuando el GM saca del tablero el token de un creep y no le queda otro:
     «Sacaste al <creep> del tablero. ¿Qué hacemos con él?» → Eliminarlo (pide confirmación; se borra como en GM Tools) · Guardarlo en la Reserva ·
     Dejarlo en este mapa, fuera del tablero (textos del dueño, 2026-11-05).
   - `creepsMapasReconciliar()`: una vez al entrar el GM: los creeps cuyo mapa no coincide con el de su token se corrigen, y si alguno tiene tokens en
     dos mapas, la misma pregunta. Un creep sin token (preparado en un mapa) no se toca. */
const CREEP_MAPA_ESPERA_MS = 2500;
const creepMapaTimers = new Map();
const creepPreguntando = new Set();
function creepMapaNombre(id){ return id === CreepsMapas.RESERVA ? '🎒 Reserva' : (typeof nombreMapa === 'function' ? nombreMapa(id) : id); }
const creepNombrePub = id => { const c = creepsPub.get(id); return (c && c.nombre) || 'creep'; };

// «El <creep> aparece en dos mapas…»: un botón por mapa; en los otros se le saca el token.
async function creepPreguntarDosMapas(creepId, mapas){
  if(creepPreguntando.has(creepId)) return;
  creepPreguntando.add(creepId);
  try{
    const n = creepNombrePub(creepId);
    const elegido = await Confirmar.elegir(CreepsMapas.textoDosMapas(n, mapas.map(creepMapaNombre)), {titulo: 'Un creep en dos mapas', icono: '🔗',
      opciones: mapas.map(m => ({valor: m, texto: `🗺 Queda en «${creepMapaNombre(m)}»`, detalle: 'En el otro se saca su token'})), no: 'Después'});
    if(elegido === null || elegido === undefined) return;
    const sacados = await CreepsMapas.quedarEn(creepId, elegido);
    await modificarCreep(creepId, sc => { sc.mapa = elegido; });
    toast(`🔗 El ${n} queda en «${creepMapaNombre(elegido)}»${sacados ? ` (se sacó su token del otro mapa)` : ''}`);
  }catch(err){ console.error('No se pudo dejar al creep en un solo mapa:', err); toast('No se pudo: ' + (err.message || err)); }
  finally{ creepPreguntando.delete(creepId); }
}

function creepMapaRevisar(creepId){
  if(!soyGM || !creepId || typeof CreepsMapas === 'undefined') return;
  clearTimeout(creepMapaTimers.get(creepId));
  creepMapaTimers.set(creepId, setTimeout(async () => {
    creepMapaTimers.delete(creepId);
    const pub = creepsPub.get(creepId);
    if(!pub) return;   // el creep ya no existe (o todavía no llegó)
    try{
      const con = [...new Set((await CreepsMapas.tokensDeCreep(creepId)).map(t => t.mapaId))];
      if(con.length > 1){ creepPreguntarDosMapas(creepId, con); return; }
      const nuevo = CreepsMapas.trasCambioDeToken(String(pub.mapa || ''), con);
      if(nuevo === null) return;
      await modificarCreep(creepId, sc => { sc.mapa = nuevo; });
      toast(`🔗 El ${pub.nombre || 'creep'} pasó a «${creepMapaNombre(nuevo)}» en GM Tools`);
    }catch(err){ console.error('No se pudo seguir el mapa del creep:', err); }
  }, CREEP_MAPA_ESPERA_MS));
}

// Borrar al creep como GM Tools: su documento público y sus dos partes privadas (GM Tools abierto lo saca de su lista solo).
async function creepEliminarDelTodo(creepId){
  const base = fbDb.doc(fbRutaCampana(`creeps/${creepId}`));
  const lote = fbDb.batch();
  lote.delete(base.collection('privado').doc('ficha'));
  lote.delete(base.collection('privado').doc('imagen'));
  lote.delete(base);
  await lote.commit();
}
async function creepTokenSacado(creepId, mapa, nombre){
  if(!soyGM || !creepId || typeof CreepsMapas === 'undefined' || creepPreguntando.has(creepId)) return;
  creepPreguntando.add(creepId);
  try{
    const quedan = [...new Set((await CreepsMapas.tokensDeCreep(creepId)).map(t => t.mapaId))];
    if(quedan.length){ creepPreguntando.delete(creepId); creepMapaRevisar(creepId); return; }   // tiene su token en otro mapa: queda allá
    const n = (creepsPub.get(creepId) || {}).nombre || nombre || 'creep';
    const op = await Confirmar.elegir(`Sacaste al ${n} del tablero. ¿Qué hacemos con él?`, {titulo: 'Sacar del tablero', icono: '🔗', no: 'Después', opciones: [
      {valor: 'eliminar', texto: '🗑 Eliminarlo', detalle: 'Se borra del todo, con su vida, su equipo y sus habilidades'},
      {valor: 'reserva', texto: '🎒 Guardarlo en la Reserva', detalle: 'Queda guardado para usarlo en otra escena'},
      {valor: 'dejar', texto: '⏸ Dejarlo en este mapa, fuera del tablero', detalle: 'Sigue siendo parte de esta escena y lo podés volver a poner cuando quieras'},
    ]});
    if(op === 'eliminar'){
      if(!(await Confirmar.preguntar(`¿Eliminar al ${n} del todo? Se borra con su vida, su equipo y sus habilidades, y no se puede deshacer.`, {titulo: 'Eliminar', si: 'Eliminar', peligro: true}))) return;
      await creepEliminarDelTodo(creepId);
      toast(`🗑 Se eliminó al ${n}`);
    }else if(op === 'reserva'){
      await modificarCreep(creepId, sc => { sc.mapa = CreepsMapas.RESERVA; });
      toast(`🎒 El ${n} quedó en la Reserva`);
    }else if(op === 'dejar'){
      if(String((creepsPub.get(creepId) || {}).mapa || '') !== mapa) await modificarCreep(creepId, sc => { sc.mapa = mapa; });
      toast(`⏸ El ${n} sigue en «${creepMapaNombre(mapa)}», fuera del tablero`);
    }
    // «Después» (o la ✕): no se toca nada; el creep sigue donde estaba.
  }catch(err){ console.error('No se pudo resolver qué hacer con el creep:', err); toast('No se pudo: ' + (err.message || err)); }
  finally{ creepPreguntando.delete(creepId); }
}

async function creepsMapasReconciliar(){
  if(!soyGM || typeof CreepsMapas === 'undefined' || creepsMapasReconciliar.hecho) return;
  creepsMapasReconciliar.hecho = true;
  try{
    const {por, ids} = await CreepsMapas.tokensPorCreep();
    const creeps = [...creepsPub.entries()].map(([id, c]) => ({id, mapa: String(c.mapa || '')}));
    const r = CreepsMapas.correcciones(creeps, por, ids);
    let hechos = 0;
    for(const c of r.cambios){
      try{ await modificarCreep(c.id, sc => { sc.mapa = c.a; }); hechos++; }
      catch(err){ console.error('No se pudo corregir el mapa del creep', c, err); }
    }
    if(hechos){
      console.log(`🔗 Creeps puestos en el mapa de su token: ${hechos}`, r.cambios);
      toast(`🔗 ${hechos} creep(s) pasaron, en GM Tools, al mapa donde está su token`);
    }
    for(const d of r.dobles) await creepPreguntarDosMapas(d.id, d.mapas);
  }catch(err){ console.error('No se pudieron revisar los mapas de los creeps:', err); creepsMapasReconciliar.hecho = false; }
}
