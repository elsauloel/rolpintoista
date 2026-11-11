/* 🕶 Sigilo de un personaje: la tirada la hace su jugador (2026-11-11, dueño, cola de programación 8).
   «Si el escondido es un jugador, el GM va a saber que existe un jugador escondido, pero no dónde está: al GM le debería aparecer un cartel
   de advertencia "<nombre del creep> percibe movimientos cerca, tirá percepción"». Y la tirada de Sigilo la hace el jugador con su botón, a la
   vista solo de él y del GM.
   - Escondido = creep: como siempre (el GM tira a escondidas su Sigilo, js/16 deteccionGMResolver: los jugadores no tienen que enterarse).
   - Escondido = personaje (o invocación de un jugador):
     · si el escondido camina y queda en la zona de alerta de un creep (el aviso de siempre, js/03 sigiloEvaluarRuta), al GM le sale
       «<creep> percibe movimientos cerca — tirá Percepción» (estado 'percepcionGM'): tira la Percepción del creep (no va a la Mesa);
     · si el que camina es el creep con Percepción aumentada (js/16 percepcionResolverBanner), el GM ya tiró la Percepción en su cartel;
     · después, a quien maneja al escondido (su dueño o quien tiene 🎮 el control) le sale «tirá tu Sigilo» (estado 'sigiloJugador'):
       tiene que sacar la Percepción o más (empate: sigue escondido). Si no está conectado (no avisó que lo vio en SIGILO_RESPALDO_MS), el GM
       tira por él. «✋ Resolver a mano» en las dos tiradas. Una transacción toma cada tirada: nunca se tira dos veces.
   - Es privado: el momento lleva `privado` y solo lo ven el GM y quien maneja al escondido (js/16 lo saca de la Crónica de los demás). */
const SIGILO_RESPALDO_MS = 6000;
const sigiloJugCartel = new Map();     // id -> clave del cartel abierto en esta pantalla
const sigiloJugResultados = new Set(); // ids cuyo resultado ya se mostró acá
const sigiloJugRespaldo = new Map();   // id -> timer del respaldo del GM

// ¿El escondido es de un jugador (un personaje o la invocación de un personaje)?
function sigiloEsDeJugador(t){ return !!t && t.tipo === 'pj'; }
// ¿Esta pantalla maneja al escondido?
function sigiloSoyDelOculto(dt){
  const base = String(dt.ocultoFicha || '').split(SEP_INVOCACION)[0];
  return !!base && typeof bnManejo === 'function' && bnManejo(base);
}
// ¿Esta pantalla maneja a quien percibe? (un creep: el GM; un personaje o invocación: su dueño o quien tiene 🎮 el control)
function sigiloSoyDelDetector(dt){
  if(dt.detectorTipo === 'creep') return !!soyGM;
  const base = String(dt.detectorFicha || '').split(SEP_INVOCACION)[0];
  return !!base && typeof bnManejo === 'function' && bnManejo(base);
}
// ¿Esta pantalla puede ver el momento? (privado: el GM, quien maneja al escondido y quien percibe)
function sigiloMomentoVisible(d){
  const dt = (d && d.datos) || {};
  return !dt.privado || soyGM || sigiloSoyDelOculto(dt) || sigiloSoyDelDetector(dt);
}
// Toma un paso con una transacción: de `desde` a `hacia`, una sola pantalla. → true si lo tomó esta.
async function sigiloTomar(id, desde, hacia){
  try{
    const ref = coleccionMomentos().doc(id);
    return await fbDb.runTransaction(async tx => {
      const s = await tx.get(ref);
      if(!s.exists || s.data().estado !== desde) return false;
      tx.update(ref, {estado: hacia, 'datos.tomo': fbUsuario.uid});
      return true;
    });
  }catch(err){ console.error('Sigilo: no se pudo tomar el paso:', err); return false; }
}

/* El escondido caminó y quedó en la zona de alerta de un creep: el pedido al GM (lo llama js/03 sigiloPublicarAvisos). */
/* Una tirada por paso (dueño, 2026-11-11: «si el personaje escondido da varios pasos dentro de una zona de alerta, sigue siendo una tirada por
   paso»): se abre el paso 1; cuando se resuelve y sigue escondido, la pantalla que lo resolvió abre el siguiente (sigiloJugTirarSigilo). Si en un
   paso lo descubren, los pasos que quedan no se tiran. */
/* 🔎 La Percepción siempre incierta (dueño, 2026-11-11): el pedido nombra solo a quien percibe («Rata siente un movimiento extraño…»,
   Combatiente.percepcionIncierta): ni quién está escondido, ni cuántos, ni qué hace, ni el paso. El detalle (quién y por qué) lo ve solo el GM,
   plegado («ℹ detalle»), para poder dirigir la partida.
   - Percibe un creep y el escondido es un personaje → el GM (estado 'percepcionGM', su cartel acá).
   - Percibe un personaje o invocación (el escondido es un creep o el personaje de otro jugador) → quien lo maneja (estado 'percepcionJug'): el
     cartel de Percepción de siempre (js/16 percepcionAbrir) en su pantalla; si no está conectado, el GM tira por él. */
async function sigiloPedirPercepcion(ocultoId, detectorId, pasos, paso){
  const o = tokens.get(ocultoId), det = tokens.get(detectorId);
  if(!o || !det) return null;
  const total = Math.max(1, num(pasos) || 1), n = Math.min(total, Math.max(1, num(paso) || 1));
  const frase = Combatiente.percepcionIncierta(nombreDe(det), Date.now() + ':' + detectorId);
  const comun = {centro: true, privado: true, ocultoId, ocultoFicha: String(o.fichaId || ''), ocultoNombre: nombreDe(o), detectorId, detector: nombreDe(det),
    detectorTipo: det.tipo, detectorFicha: String(det.fichaId || ''), frase, pasos: total, paso: n};
  if(det.tipo === 'creep' && sigiloEsDeJugador(o))
    return momentoAbrir({tipo: 'sigilo-pedido', icono: '🔎', titulo: frase, estado: 'percepcionGM', resuelve: 'gm', datos: comun});
  if(det.tipo === 'creep') return null;   // un creep no busca a otro creep (no son rivales)
  return momentoAbrir({tipo: 'sigilo-pedido', icono: '🔎', titulo: frase, estado: 'percepcionJug', resuelve: '', datos: {...comun, desde: Date.now()}});
}
// (el nombre de antes: lo llama js/03)
const sigiloPedirPercepcionGM = sigiloPedirPercepcion;
/* 🪤 Poner una trampa es una acción incierta (dueño, 2026-11-11: «quizás el jugador está haciendo una acción incierta, como colocar una trampa:
   tiene que aparecer un cartel notificando que debe tirar Percepción, pero con un mensaje que comunique incertidumbre»). Cada rival con alguna
   casilla de la trampa en su zona de alerta (el cono ya la deja a la vista, js/79) tira Percepción contra la dificultad de la trampa; si llega, la
   descubre (js/16 percepcionResolverBanner, el mismo camino que la Pisada atenta). Nada dice qué es. */
async function trampaPedirPercepcion(mio, trampaId, celdas){
  if(!mio || !trampaId || typeof rivalesDe !== 'function') return;
  const claves = new Set((celdas || []).map(c => nbPack(c.col, c.fila)));
  for(const r of rivalesDe(mio)){
    const z = zonasClaves(r);
    if(![...z.alerta, ...z.cono].some(k => claves.has(k))) continue;
    let rid = null; for(const [k, x] of tokens) if(x === r){ rid = k; break; }
    if(!rid) continue;
    const frase = Combatiente.percepcionIncierta(nombreDe(r), trampaId + ':' + rid);
    await momentoAbrir({tipo: 'sigilo-pedido', icono: '🔎', titulo: frase, estado: 'percepcionJug', resuelve: '',
      datos: {centro: true, privado: true, trampaId, ocultoFicha: String(mio.fichaId || ''), detectorId: rid, detector: nombreDe(r), detectorTipo: r.tipo,
        detectorFicha: String(r.fichaId || ''), frase, pasos: 1, paso: 1, desde: Date.now()}});
  }
}
// El cartel de Percepción que pidió otra pantalla, en la de quien percibe (o en la del GM, por él): a la cola de js/16, de a uno.
const sigiloPercepcionEncolados = new Set();
function sigiloEncolarPercepcion(id, dt, porEl){
  if(sigiloPercepcionEncolados.has(id) || typeof percepcionColaFin === 'undefined') return;
  sigiloPercepcionEncolados.add(id);
  percepcionColaFin.push({tokenId: dt.detectorId, ...(dt.ocultoId ? {ocultoId: dt.ocultoId} : {}), ...(dt.trampaId ? {trampaId: dt.trampaId} : {}),
    momentoId: id, frase: dt.frase || '', paso: dt.paso, pasos: dt.pasos, ...(porEl ? {porEl: true} : {})});
  percepcionSiguienteFin();
}
// El paso siguiente de la misma caminata, o null si ya no hay (pura, para las pruebas).
const sigiloPasoSiguiente = (paso, pasos, detectado) => Combatiente.sigiloPasoSiguiente(paso, pasos, detectado);

// La Percepción de un token (la misma cuenta que js/16 percepcionResolverBanner).
function sigiloValorPercepcion(t){
  const sc = t && t.tipo === 'creep' ? creepPrivadoDe(t.fichaId) : null;
  const ri = t ? resumenDeInv(t) : null;
  const f = t ? fichasPub.get(String(t.fichaId).split(SEP_INVOCACION)[0]) : null;
  return sc ? num(CreepCalculo.statValor(sc, 'percepcion')) : ri ? num(ri.percepcion) : f && f.resumen ? num(f.resumen.percepcion) : 0;
}
// El Sigilo de un personaje escondido (Destreza + bonos; las fichas viejas: Destreza) — lo mismo que js/16 deteccionGMResolver.
function sigiloValorSigilo(t){
  const f = t ? fichasPub.get(String(t.fichaId).split(SEP_INVOCACION)[0]) : null;
  return f && f.resumen ? num(f.resumen.sigilo !== undefined ? f.resumen.sigilo : f.resumen.des) : 0;
}
// Gana el que detecta si su Percepción es MAYOR (empate: sigue escondido). Pura, para las pruebas.
const sigiloDetecta = (percepcion, sigilo) => Combatiente.sigiloDetecta(percepcion, sigilo);

// Lo que pasa en cada pantalla con un momento de sigilo de jugador (lo llama js/16). → true si esta pantalla lo sigue al centro.
function sigiloJugadorMomento(id, d){
  sigiloUltimos.set(id, d);
  const dt = d.datos || {};
  if(d.estado === 'percepcionGM'){
    if(!soyGM) return false;
    sigiloJugCartelPercepcion(id, d);
    return true;
  }
  if(d.estado === 'percepcionJug'){
    if(sigiloSoyDelDetector(dt)){
      if(!dt.visto) momentoActualizarCampo(id, 'datos.visto', fbUsuario.uid);
      sigiloEncolarPercepcion(id, dt, false);
      return true;
    }
    if(soyGM){
      if(!dt.visto && !sigiloJugRespaldo.has(id)){
        sigiloJugRespaldo.set(id, setTimeout(() => {
          const ult = momentosUltimo(id) || d;
          if(ult.estado === 'percepcionJug' && !(ult.datos || {}).visto) sigiloEncolarPercepcion(id, ult.datos || dt, true);
        }, SIGILO_RESPALDO_MS));
      }
      return true;
    }
    return sigiloSoyDelOculto(dt);
  }
  if(d.estado === 'percepcionTirando') return soyGM || sigiloSoyDelDetector(dt) || sigiloSoyDelOculto(dt);
  if(d.estado === 'sigiloJugador' || d.estado === 'sigiloTirando'){
    const mio = sigiloSoyDelOculto(dt);
    if(mio){
      if(!dt.visto) momentoActualizarCampo(id, 'datos.visto', fbUsuario.uid);
      sigiloJugCartelSigilo(id, d, false);
      return true;
    }
    if(soyGM){
      if(d.estado === 'sigiloTirando'){ if(dt.tomo === fbUsuario.uid) sigiloJugCartelSigilo(id, d, true); else sigiloJugEspera(id, d); return true; }
      if(dt.visto){ sigiloJugEspera(id, d); return true; }
      if(!sigiloJugRespaldo.has(id)){
        sigiloJugEspera(id, d);
        sigiloJugRespaldo.set(id, setTimeout(() => {
          const ult = momentosUltimo(id) || d;
          if(ult.estado === 'sigiloJugador' && !(ult.datos || {}).visto) sigiloJugCartelSigilo(id, ult, true);
        }, SIGILO_RESPALDO_MS));
      }
      return true;
    }
    return false;
  }
  if(d.estado === 'listo' && sigiloJugCartel.has(id)){
    const t = sigiloJugRespaldo.get(id); if(t){ clearTimeout(t); sigiloJugRespaldo.delete(id); }
    if(!sigiloJugResultados.has(id)){
      sigiloJugResultados.add(id);
      const clave = sigiloJugCartel.get(id);
      AvisoCombate.cartel(clave, {icono: '🔎', titulo: 'Sigilo', texto: d.resultado || '',
        botones: [{texto: 'Listo', alClic: () => { AvisoCombate.cartel(clave, null); sigiloJugCartel.delete(id); }}]});
    }
    return true;
  }
  return false;
}
async function momentoActualizarCampo(id, campo, valor){
  try{ await coleccionMomentos().doc(id).update({[campo]: valor}); }catch(err){ console.error('Sigilo: no se pudo actualizar el momento:', err); }
}
const sigiloUltimos = new Map();
function momentosUltimo(id){ return sigiloUltimos.get(id) || null; }

// 1) El GM: «<creep> percibe movimientos cerca — tirá Percepción».
function sigiloJugCartelPercepcion(id, d){
  sigiloUltimos.set(id, d);
  const dt = d.datos || {}, clave = 'sigilo-jug:' + id;
  sigiloJugCartel.set(id, clave);
  AvisoCombate.cartel(clave, {icono: '🔎', titulo: dt.frase || Combatiente.percepcionIncierta(dt.detector, id),
    pasos: [{titulo: 'Percepción', html: `Tirá la Percepción de ${esc(dt.detector || 'el creep')}.${sigiloDetalleGM(dt)}`}],
    botones: [{texto: `🎲 Tirar Percepción de ${dt.detector || 'el creep'}`, alClic: () => sigiloJugTirarPercepcion(id, d, false)},
      {texto: '✋ Resolver a mano', sec: true, alClic: () => sigiloJugTirarPercepcion(id, d, true)}]});
}
async function sigiloJugTirarPercepcion(id, d, aMano){
  const dt = d.datos || {};
  let total;
  if(aMano){
    const v = await Confirmar.texto(`¿Qué sacó ${dt.detector || 'el creep'} en Percepción? Escribí el total que decidió la mesa.`, {titulo: 'Resolver a mano', icono: '✋', valor: '', si: 'Seguir', max: 4});
    if(v === null || v === undefined || String(v).trim() === '') return;
    total = Math.round(num(v));
  }else{
    const det = tokens.get(dt.detectorId);
    if(!det){ toast('Sigilo: el creep ya no está en el mapa — resolvelo a mano'); return; }
    // (FichaBotonera se carga recién con la Botonera: la pantalla del GM puede no tenerla todavía — prueba en el mapa del 2026-11-11)
    try{ await bnCargarPiezas(); }catch(err){ console.error(err); toast('No se pudo tirar Percepción — resolvelo a mano'); return; }
    const r = FichaBotonera.tiradaPercepcionValor(sigiloValorPercepcion(det), tokenPercepcionAumentada(det));
    if(!r){ toast('Percepción: sin valor para tirar'); return; }
    total = r.total;
  }
  if(!(await sigiloTomar(id, 'percepcionGM', 'percepcionTirada'))) return;   // otra pantalla del GM ya la tiró
  await momentoActualizar(id, {estado: 'sigiloJugador', datos: {...dt, percepcion: total, desde: Date.now()}});
}

// Mientras el jugador tira: el GM ve que espera.
function sigiloJugEspera(id, d){
  sigiloUltimos.set(id, d);
  if(typeof percepcionBanner !== 'undefined' && percepcionBanner && percepcionBanner.momentoId === id) return;   // ya dice «Esperando qué pasa…» (js/16)
  const dt = d.datos || {}, clave = 'sigilo-jug:' + id;
  sigiloJugCartel.set(id, clave);
  AvisoCombate.cartel(clave, {icono: '🔎', titulo: `${dt.detector || 'Alguien'}: Percepción ${dt.percepcion}`, pasos: [{titulo: 'Esperando', html: `Esperando qué pasa…${sigiloDetalleGM(dt)}`}]});
}

// 2) Quien maneja al escondido (o el GM, por él): «tirá tu Sigilo».
function sigiloJugCartelSigilo(id, d, porEl){
  sigiloUltimos.set(id, d);
  const dt = d.datos || {}, clave = 'sigilo-jug:' + id;
  sigiloJugCartel.set(id, clave);
  const quien = dt.ocultoNombre || 'tu personaje';
  const tirando = d.estado === 'sigiloTirando';
  AvisoCombate.cartel(clave, {icono: '🕶', titulo: `Alguien podría haber${porEl ? ` notado a ${quien} · tirá por él` : 'te notado'}`,
    pasos: [{titulo: 'Para seguir escondido', ...(porEl
      ? {html: `${esc(quien)} (en sigilo) tira Sigilo (Destreza + bonos): tiene que sacar ${esc(dt.percepcion)} o más.${sigiloDetalleGM(dt)}`}
      : {texto: `Tirá tu Sigilo (Destreza + bonos): tenés que sacar ${dt.percepcion} o más.`})}],
    botones: [{texto: `🎲 Tirar Sigilo de ${quien}`, deshabilitado: tirando, alClic: () => sigiloJugTirarSigilo(id, d, false)},
      {texto: '✋ Resolver a mano', sec: true, deshabilitado: tirando, alClic: () => sigiloJugTirarSigilo(id, d, true)}]});
}
async function sigiloJugTirarSigilo(id, d, aMano){
  const dt = d.datos || {}, quien = dt.ocultoNombre || 'el escondido';
  let total;
  if(aMano){
    const v = await Confirmar.texto(`¿Qué sacó ${quien} en Sigilo? Escribí el total que decidió la mesa.`, {titulo: 'Resolver a mano', icono: '✋', valor: '', si: 'Seguir', max: 4});
    if(v === null || v === undefined || String(v).trim() === '') return;
    total = Math.round(num(v));
  }else{
    const o = tokens.get(dt.ocultoId);
    const rd = Combatiente.tirarStat(sigiloValorSigilo(o), [], 'des');
    total = rd ? rd.total : 0;
  }
  if(!(await sigiloTomar(id, 'sigiloJugador', 'sigiloTirando'))) return;   // ya la tiró otra pantalla
  const o = tokens.get(dt.ocultoId);
  const detectado = !!o && enSigilo(o) && sigiloDetecta(dt.percepcion, total);
  if(detectado) await romperSigilo(dt.ocultoId, dt.detector || 'alguien', `Lo descubrió ${dt.detector || 'alguien'}`, true);
  // (Lo que se sabe después de tirar: si lo descubre, a quién; si no, nada — los números quedan en los datos, para el «ℹ detalle» del GM.)
  const resultado = detectado ? `${dt.detector || 'Alguien'} descubre a ${quien}.` : `${dt.detector || 'Alguien'} no nota nada raro.`;
  await momentoActualizar(id, {estado: 'listo', resultado, datos: {...dt, sigilo: total, detectado, ...(aMano ? {aMano: true} : {})}});
  // Una tirada por paso: si sigue escondido y quedan pasos en la zona, el siguiente (lo abre esta pantalla, la que tomó la tirada).
  const sig = sigiloPasoSiguiente(dt.paso, dt.pasos, detectado);
  if(sig && o && enSigilo(o)) await sigiloPedirPercepcion(dt.ocultoId, dt.detectorId, dt.pasos, sig);
}

// ℹ El detalle para el GM (quién está escondido y por qué se tira), plegado: no lo dice el cartel, pero el GM lo puede abrir para dirigir.
function sigiloDetalleGM(dt){
  if(!soyGM || !dt) return '';
  const pasos = num(dt.pasos) > 1 ? ` · paso ${num(dt.paso) || 1} de ${dt.pasos}` : '';
  const que = dt.trampaId ? `una trampa recién puesta en su zona de alerta` : `${dt.ocultoNombre || 'alguien'} (en sigilo) en su zona de alerta${pasos}`;
  const nums = dt.percepcion !== undefined ? ` · Percepción ${esc(dt.percepcion)}${dt.sigilo !== undefined ? ` contra Sigilo ${esc(dt.sigilo)}` : ''}` : '';
  return `<details style="margin-top:6px;font-size:12px;opacity:.85"><summary style="cursor:pointer">ℹ detalle (solo el GM)</summary>${esc(dt.detector || 'Alguien')}: ${esc(que)}${nums}.</details>`;
}
