/* =========================================================
   🧚 RE-ROLL (Support, 2026-10-12, dueño). Vos o un aliado a la vista (dentro de tu Rango) repite su última tirada de un duelo y se queda con
   la más alta; el duelo se vuelve a resolver. Sin tirada de por medio (no hay nada que resistir). 2 SP, Flash (4 en turno ajeno), sin No2
   (dueño: «le puse dos nitros porque era lento, pero como tiene flash, cuesta cero»).
   Una vez por tirada (la marca 🍀). Era Afortunado, una skill aparte que salió de Enyetar al revés; el dueño la juntó con Re-roll: «que no
   existan las dos porque son muy parecidas… que exista Re-roll y que funcione como Afortunado, con el botón de la hadita, 2 en lugar de 5».
   En combate, quien la tiene ve el botón fijo 🧚 (Flotantes.reroll); el Ejecutar de su Botonera abre lo mismo (js/11).
   Usa Duelo.enyetarTirada(id, lado, 'mejor') y publicarRepeticion (js/38: los dos juegos de dados ruedan y brilla el que queda).
   ========================================================= */
const REROLL = {sp: 2, spAjeno: 4, no2: 0};
const rerollCosto = `${REROLL.sp} SP (turno ajeno ${REROLL.spAjeno})${REROLL.no2 ? ` + ${REROLL.no2} No2` : ''}`;
// ¿Tiene Re-roll? (un personaje que todavía tenga la copia de Afortunado cuenta igual: `suerte`).
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
  const nomYo = nombreDe(yo), rng = num((rangoDeToken(yo) || {}).rng), vistos = new Set(), lista = [];
  const alcanza = t => !!t && (t === yo || (t.tipo === 'pj' && !dueloEsRival(yo, t) && distanciaHex(yo, t) <= rng));
  try{
    const q = await fbDb.collection(fbRutaCampana('duelos')).orderBy('creado', 'desc').limit(10).get();
    q.docs.forEach(doc => {
      const x = doc.data();
      if(!x || x.estado === 'cancelado' || x.hab || !enyetarReciente(x.creado)) return;
      ['atacante', 'defensor'].forEach(lado => {
        const p = x[lado], t = p && tokens.get(p.tokenId);
        if(!alcanza(t) || vistos.has(p.tokenId)) return;
        vistos.add(p.tokenId);
        const s = Duelo.tiradaSumable(x, lado);
        if(!s || s.afortunada) return;   // una vez por tirada
        const otro = x[lado === 'atacante' ? 'defensor' : 'atacante'] || {};
        lista.push({id: doc.id, lado, nombre: p.nombre || nombreDe(t), etq: s.etq, total: s.total, contra: otro.nombre || 'el otro'});
      });
    });
  }catch(err){ console.error('Re-roll: no se pudieron ver los duelos', err); }
  if(!lista.length){
    AvisoCombate.mostrar({icono: '🧚', titulo: `Re-roll · ${nomYo}`, texto: `No hay ninguna tirada reciente tuya ni de un aliado a tu alcance (Rango ${fmt(rng)}) en un duelo que todavía se pueda cambiar.`});
    return;
  }
  const botones = lista.slice(0, 8).map(o => ({fila: true, texto: `${o.nombre} · ${o.etq} (${fmt(o.total)})`,
    detalle: `en el duelo contra ${o.contra}: repite y queda la mejor; el duelo se vuelve a resolver · ${rerollCosto}`,
    alClic: () => { AvisoCombate.cerrar(); rerollUsar(yo, o); }}));
  botones.push({texto: 'Cancelar', sec: true, alClic: () => AvisoCombate.cerrar()});
  AvisoCombate.mostrar({icono: '🧚', titulo: `Re-roll · ${nomYo}`, botones, texto: '¿Qué tirada se repite?'});
}
async function rerollUsar(yo, o){
  const nomYo = nombreDe(yo);
  const pago = await ConfirmarTurno.flash('Re-roll', {sp: REROLL.sp}, {quien: nomYo, spAjeno: REROLL.spAjeno, ident: {nombre: nomYo, ref: yo.fichaId}});
  if(!pago) return;
  // Los No2: con Extenuado, más caros; si no alcanzan, se pregunta y se hace igual (gasta los que tenga, con su línea roja).
  const r0 = (fichasPub.get(yo.fichaId) || {}).resumen || {};
  const no2 = REROLL.no2 ? REROLL.no2 + num(r0.extenuado) : 0;
  if(no2 && num(r0.nitros) < no2 && !(await Confirmar.preguntar(`Re-roll cuesta ${fmt(no2)} No2 y ${nomYo} tiene ${fmt(Math.max(0, num(r0.nitros)))}. ¿Hacerlo igual?`, {titulo: 'Sin No2', si: 'Hacerlo igual'}))) return;
  let falta = null;
  const ok = await editarPersonajeMapa(yo.fichaId, S => {
    const disp = Math.max(0, FichaBotonera.spMaximo(S, FichaCalculo.calcular(S)) - num(S.spGastado));
    if(disp < pago.sp){ falta = disp; return false; }
    FichaAcciones.gastarSp(S, pago.sp, {fijarHp: v => mantFijarHp(S, v), toast}, 'Re-roll');   // 🩸 Maldito
    if(no2){
      S.nitros = num(S.nitros) - (no2 > num(S.nitros) ? FichaAcciones.gastoNitrosForzado(S, no2, 'usó Re-roll') : no2);
      FichaAcciones.tormentaPj(S, no2, 'usar Re-roll');   // ⛈ Atormentado
    }
    return true;
  });
  if(!ok){ toast(falta !== null ? `No te alcanza el SP: Re-roll cuesta ${fmt(pago.sp)} y tenés ${fmt(falta)}` : 'No se pudo cobrar el Re-roll'); return; }
  const r = await Duelo.enyetarTirada(o.id, o.lado, 'mejor');
  let texto;
  if(!r) texto = `La tirada de ${o.nombre} ya no se puede cambiar (el duelo siguió): ✋ que la repita y se quede con la mejor, a mano.`;
  else{
    await publicarRepeticion(o.nombre, r, 'mejor', 'mapa');
    texto = `${nomYo} le dio un Re-roll a ${o.nombre}: repite su ${r.etq}, ${fmt(r.antes)} y ${fmt(r.nueva)} → queda ${fmt(r.ahora)}${r.contra !== null ? ` contra ${fmt(r.contra)}` : ''}. El duelo contra ${o.contra} se volvió a resolver.`;
  }
  try{
    await fbDb.collection(fbRutaCampana('tiradas')).add({uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: nomYo, origen: `🧚 ${nomYo} usó Re-roll (−${fmt(pago.sp)} SP${no2 ? ` · −${fmt(no2)} No2` : ''})`,
      formula: `sobre ${o.nombre}`, rolls: [], mod: 0, total: 0, desde: 'recordatorio', cuando: firebase.firestore.FieldValue.serverTimestamp()});
  }catch(err){ console.error('Re-roll: no se pudo avisar en la Mesa', err); }
  momentoAbrir({tipo: 'reroll', icono: '🧚', titulo: `${nomYo} usó Re-roll`, resultado: texto, estado: 'listo',
    datos: {paraUids: [fbUsuario.uid], aviso: true, boton: 'Entendido', pasos: [{titulo: '🧚 Re-roll', texto}]}});
}
window.abrirReroll = abrirReroll;
