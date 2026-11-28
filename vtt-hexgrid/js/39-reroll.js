/* =========================================================
   🧚 GOLPE DE SUERTE (Support, 2026-10-12, dueño; se llamaba «Re-roll» hasta el 2026-11-27, el id interno sigue siendo `reroll`). Vos o un aliado a la vista (dentro de tu Rango) repite su última tirada de un duelo y se queda con
   la más alta; el duelo se vuelve a resolver. Sin tirada de por medio (no hay nada que resistir). 2 SP, Flash (4 en turno ajeno), sin No2
   (dueño: «le puse dos nitros porque era lento, pero como tiene flash, cuesta cero»).
   Una vez por tirada (la marca 🍀). Era Afortunado, una skill aparte que salió de Enyetar al revés; el dueño la juntó con Re-roll: «que no
   existan las dos porque son muy parecidas… que exista Re-roll y que funcione como Afortunado, con el botón de la hadita, 2 en lugar de 5».
   En combate, quien la tiene ve el botón fijo 🧚 (Flotantes.reroll); el Ejecutar de su Botonera abre lo mismo (js/11).
   Usa Duelo.enyetarTirada(id, lado, 'mejor') y publicarRepeticion (js/38: los dos juegos de dados ruedan y brilla el que queda).
   ========================================================= */
const REROLL = {sp: 2, spAjeno: 4, no2: 0};
const rerollCosto = `${REROLL.sp} SP (turno ajeno ${REROLL.spAjeno})${REROLL.no2 ? ` + ${REROLL.no2} No2` : ''}`;
// ¿Tiene Golpe de suerte? (un personaje que todavía tenga la copia de Afortunado cuenta igual: `suerte`).
function rerollToken(){
  if(modoMapa !== 'combate' || !fbUsuario) return null;
  const ok = t => { const r = t && t.tipo === 'pj' && t.fichaId && !String(t.fichaId).includes(SEP_INVOCACION) && puedoMover(t) && ((fichasPub.get(t.fichaId) || {}).resumen || {}); return !!(r && (r.reroll || r.suerte)); };
  const sel = seleccion ? tokens.get(seleccion) : null;
  if(ok(sel)) return sel;
  for(const t of tokens.values()) if(ok(t)) return t;
  return null;
}
function renderRerollBoton(){
  if(typeof Flotantes === 'undefined' || !Flotantes.reroll) return;
  const t = rerollToken();
  if(!t){ Flotantes.reroll(null); return; }
  const id = idDeToken(t);
  Flotantes.reroll({mostrar: true, sub: `${nombreDe(t)}: que vos o un aliado repita una tirada y se quede con la mejor`, alClic: () => abrirReroll(id)});
}
setInterval(() => { try{ renderRerollBoton(); }catch(e){} }, 1500);

async function abrirReroll(tokenId){
  const yo = tokens.get(tokenId);
  if(!yo) return;
  const nomYo = nombreDe(yo), rng = num((rangoDeToken(yo) || {}).rng);
  const alcanza = t => !!t && (t === yo || (t.tipo === 'pj' && !dueloEsRival(yo, t) && distanciaHex(yo, t) <= rng));
  let lista = [];
  try{
    // 🧚 Enyetar C (2026-11-27): cualquier tirada tuya o de un aliado (también el daño y los d20 del crítico) que todavía se pueda cambiar y, del último
    // duelo terminado, todas («↩»: se deshace lo que dejó y se vuelve a resolver; js/138). Lo puro en Duelo.tiradasEnyetables.
    const q = await fbDb.collection(fbRutaCampana('duelos')).orderBy('creado', 'desc').limit(15).get();
    const duelos = q.docs.map(doc => ({id: doc.id, ...doc.data()}));
    lista = Duelo.tiradasEnyetables(duelos, {todas: true, marca: '🍀', reciente: enyetarReciente, incluirCerrados: true,
      esRival: id => alcanza(tokens.get(id)), nombreDe: id => { const t = tokens.get(id); return t ? nombreDe(t) : ''; }});
  }catch(err){ console.error('Golpe de suerte: no se pudieron ver los duelos', err); }
  if(!lista.length){
    AvisoCombate.mostrar({icono: '🧚', titulo: `Golpe de suerte · ${nomYo}`, texto: `No hay ninguna tirada reciente tuya ni de un aliado a tu alcance (Rango ${fmt(rng)}) en un duelo que todavía se pueda cambiar ni en el último duelo que terminó.`});
    return;
  }
  const botones = lista.slice(0, 10).map(o => ({fila: true, texto: `${o.cerrado ? '↩ ' : ''}${o.etq} de ${o.nombre} (${fmt(o.total)})`,
    detalle: o.cerrado ? `🔒 el último duelo que terminó (${o.hab ? `${o.hab}, ` : ''}contra ${o.contra}): se deshace lo que dejó y se vuelve a resolver · antes te muestro qué se deshace · ${rerollCosto}`
      : `${o.hab ? `en ${o.hab}, ` : 'en el duelo '}contra ${o.contra}: repite y queda la mejor; el duelo se vuelve a resolver · ${rerollCosto}`,
    alClic: () => { AvisoCombate.cerrar(); if(o.cerrado) rerollConfirmarDeshacer(tokenId, o); else rerollUsar(yo, {id: o.dueloId, lado: o.lado, campo: o.campo, nombre: o.nombre, etq: o.etq, total: o.total, contra: o.contra}); }}));
  botones.push({texto: 'Cancelar', sec: true, alClic: () => AvisoCombate.cerrar()});
  AvisoCombate.mostrar({icono: '🧚', titulo: `Golpe de suerte · ${nomYo}`, botones, texto: '¿Qué tirada se repite?'});
}
// → true si se usó (la fila del duelo, 2026-11-27 A2: con `o.campo` va EXACTAMENTE a esa tirada y levanta la pausa del duelo en la misma escritura).
async function rerollUsar(yo, o){
  const nomYo = nombreDe(yo);
  await confirmarTurnoListo();
  const pago = await ConfirmarTurno.flash('Golpe de suerte', {sp: REROLL.sp}, {quien: nomYo, spAjeno: REROLL.spAjeno, ident: {nombre: nomYo, ref: yo.fichaId}});
  if(!pago) return false;
  // Los No2: con Extenuado, más caros; si no alcanzan, se pregunta y se hace igual (gasta los que tenga, con su línea roja).
  const r0 = (fichasPub.get(yo.fichaId) || {}).resumen || {};
  const no2 = REROLL.no2 ? REROLL.no2 + num(r0.extenuado) : 0;
  if(no2 && num(r0.nitros) < no2 && !(await Confirmar.preguntar(`Golpe de suerte cuesta ${fmt(no2)} No2 y ${nomYo} tiene ${fmt(Math.max(0, num(r0.nitros)))}. ¿Hacerlo igual?`, {titulo: 'Sin No2', si: 'Hacerlo igual'}))) return false;
  let falta = null;
  const ok = await editarPersonajeMapa(yo.fichaId, async S => {
    const disp = Math.max(0, FichaBotonera.spMaximo(S, FichaCalculo.calcular(S)) - num(S.spGastado));
    if(disp < pago.sp){ falta = disp; return false; }
    if(!(await FichaAcciones.confirmarMaldito(S, pago.sp, {}, 'Golpe de suerte'))) return false;   // 🩸 Maldito: avisa y deja cancelar
    FichaAcciones.gastarSp(S, pago.sp, {fijarHp: v => mantFijarHp(S, v), toast}, 'Golpe de suerte');   // 🩸 Maldito
    if(no2){
      S.nitros = num(S.nitros) - (no2 > num(S.nitros) ? FichaAcciones.gastoNitrosForzado(S, no2, 'usó Golpe de suerte') : no2);
      FichaAcciones.tormentaPj(S, no2, 'usar Golpe de suerte');   // ⛈ Atormentado
    }
    return true;
  });
  if(!ok){ toast(falta !== null ? `No te alcanza el SP: Golpe de suerte cuesta ${fmt(pago.sp)} y tenés ${fmt(falta)}` : 'No se pudo cobrar el Golpe de suerte'); return false; }
  // ↩ Sobre el último duelo terminado (Enyetar C): pagado, queda listo para que la pantalla del GM deshaga lo que dejó el duelo y repita la tirada (js/138).
  if(o.deshacer){
    const listo = await Duelo.yetaMarcar(o.id, {listo: true}).catch(err => { console.error('Golpe de suerte: no se pudo avisar', err); return false; });
    const texto = listo ? `${nomYo} le dio un Golpe de suerte a ${o.nombre} sobre el duelo que ya terminó: se deshace lo que dejó y ${o.nombre} repite su ${o.etq} y se queda con la mejor.`
      : `El duelo ya no esperaba el Golpe de suerte: ✋ que ${o.nombre} repita su ${o.etq} y se quede con la mejor, a mano.`;
    try{
      await fbDb.collection(fbRutaCampana('tiradas')).add({uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: nomYo, origen: `🧚 ${nomYo} usó Golpe de suerte (−${fmt(pago.sp)} SP${no2 ? ` · −${fmt(no2)} No2` : ''})`,
        formula: `sobre ${o.nombre} · ↩ el último duelo`, rolls: [], mod: 0, total: 0, desde: 'recordatorio', cuando: firebase.firestore.FieldValue.serverTimestamp()});
    }catch(err){ console.error('Golpe de suerte: no se pudo avisar en la Mesa', err); }
    if(!listo) toast(texto);
    return true;
  }
  const r = await Duelo.enyetarTirada(o.id, o.lado, 'mejor', o.campo ? {campo: o.campo, yeta: true, tipo: 'reroll'} : undefined);
  let texto;
  if(!r) texto = `La tirada de ${o.nombre} ya no se puede cambiar (el duelo siguió): ✋ que la repita y se quede con la mejor, a mano.`;
  else{
    await publicarRepeticion(o.nombre, r, 'mejor', 'mapa');
    texto = `${nomYo} le dio un Golpe de suerte a ${o.nombre}: repite su ${r.etq}, ${fmt(r.antes)} y ${fmt(r.nueva)} → queda ${fmt(r.ahora)}${r.contra !== null ? ` contra ${fmt(r.contra)}` : ''}. El duelo contra ${o.contra} se volvió a resolver.`;
  }
  try{
    await fbDb.collection(fbRutaCampana('tiradas')).add({uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: nomYo, origen: `🧚 ${nomYo} usó Golpe de suerte (−${fmt(pago.sp)} SP${no2 ? ` · −${fmt(no2)} No2` : ''})`,
      formula: `sobre ${o.nombre}`, rolls: [], mod: 0, total: 0, desde: 'recordatorio', cuando: firebase.firestore.FieldValue.serverTimestamp()});
  }catch(err){ console.error('Golpe de suerte: no se pudo avisar en la Mesa', err); }
  momentoAbrir({tipo: 'reroll', icono: '🧚', titulo: `${nomYo} usó Golpe de suerte`, resultado: texto, estado: 'listo',
    datos: {paraUids: [fbUsuario.uid], aviso: true, boton: 'Entendido', pasos: [{titulo: '🧚 Golpe de suerte', texto}]}});
  return true;
}
window.abrirReroll = abrirReroll;
