/* =========================================================
   🧚 AFORTUNADO y 🔄 RE-ROLL (Support, 2026-10-12): vos o un aliado a la vista (dentro de tu Rango) repite su última tirada de un duelo y el
   duelo se vuelve a resolver. Sin tirada de por medio (no hay nada que resistir). Una vez por tirada. Una sola pieza con dos configuraciones
   (`REPETIR`):
   - Afortunado (dueño: «el reverso de enyetar, con su propio botón… una hadita»): se queda con la más alta. 5 SP, Flash (10 en turno ajeno).
   - Re-roll (dueño: «la nueva, sea cual sea»): vuelve a tirar y queda la nueva, aunque salga peor. 2 SP, Flash (4 en turno ajeno), + 2 No2.
   En combate, quien la tiene ve su botón fijo (Flotantes.afortunado / reroll); el Ejecutar de su Botonera abre lo mismo (js/11).
   Usa Duelo.enyetarTirada(id, lado, modo) y publicarRepeticion (js/38: los dos juegos de dados ruedan y brilla el que queda).
   ========================================================= */
const REPETIR = {
  suerte: {icono: '🧚', nombre: 'Afortunado', modo: 'mejor', sp: 5, spAjeno: 10, no2: 0, ya: 'afortunada', flot: 'afortunado',
    sub: 'que vos o un aliado repita una tirada y se quede con la mejor', que: 'repite y queda la mejor', pregunta: '¿A qué tirada le das suerte?',
    hizo: (yo, otro) => `${yo} le dio suerte a ${otro}`, aMano: 'que la repita y se quede con la mejor'},
  reroll: {icono: '🔄', nombre: 'Re-roll', modo: 'nueva', sp: 2, spAjeno: 4, no2: 2, ya: 'releida', flot: 'reroll',
    sub: 'que vos o un aliado vuelva a tirar una tirada (queda la nueva)', que: 'vuelve a tirar y queda la nueva, aunque salga peor', pregunta: '¿Qué tirada se vuelve a tirar?',
    hizo: (yo, otro) => `${yo} le hizo volver a tirar a ${otro}`, aMano: 'que la vuelva a tirar y quede la nueva'},
};
const repetirCosto = c => `${c.sp} SP (turno ajeno ${c.spAjeno})${c.no2 ? ` + ${c.no2} No2` : ''}`;
function repetirToken(flag){
  if(modoMapa !== 'combate' || !fbUsuario) return null;
  const ok = t => t && t.tipo === 'pj' && t.fichaId && !String(t.fichaId).includes(SEP_INVOCACION) && puedoMover(t)
    && !!(((fichasPub.get(t.fichaId) || {}).resumen || {})[flag]);
  const sel = seleccion ? tokens.get(seleccion) : null;
  if(ok(sel)) return sel;
  for(const t of tokens.values()) if(ok(t)) return t;
  return null;
}
function renderRepetirBotones(){
  if(typeof Flotantes === 'undefined') return;
  Object.entries(REPETIR).forEach(([flag, c]) => {
    const pon = Flotantes[c.flot];
    if(!pon) return;
    const t = repetirToken(flag);
    if(!t){ pon(null); return; }
    const id = idDeToken(t);
    pon({mostrar: true, sub: `${nombreDe(t)}: ${c.sub}`, alClic: () => abrirRepetir(flag, id)});
  });
}
setInterval(() => { try{ renderRepetirBotones(); }catch(e){} }, 1500);

async function abrirRepetir(flag, tokenId){
  const c = REPETIR[flag], yo = tokens.get(tokenId);
  if(!c || !yo) return;
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
        if(!s || s[c.ya]) return;   // una vez por tirada
        const otro = x[lado === 'atacante' ? 'defensor' : 'atacante'] || {};
        lista.push({id: doc.id, lado, nombre: p.nombre || nombreDe(t), etq: s.etq, total: s.total, contra: otro.nombre || 'el otro'});
      });
    });
  }catch(err){ console.error(`${c.nombre}: no se pudieron ver los duelos`, err); }
  if(!lista.length){
    AvisoCombate.mostrar({icono: c.icono, titulo: `${c.nombre} · ${nomYo}`, texto: `No hay ninguna tirada reciente tuya ni de un aliado a tu alcance (Rango ${fmt(rng)}) en un duelo que todavía se pueda cambiar.`});
    return;
  }
  const botones = lista.slice(0, 8).map(o => ({fila: true, texto: `${o.nombre} · ${o.etq} (${fmt(o.total)})`,
    detalle: `en el duelo contra ${o.contra}: ${c.que}; el duelo se vuelve a resolver · ${repetirCosto(c)}`,
    alClic: () => { AvisoCombate.cerrar(); repetirUsar(flag, yo, o); }}));
  botones.push({texto: 'Cancelar', sec: true, alClic: () => AvisoCombate.cerrar()});
  AvisoCombate.mostrar({icono: c.icono, titulo: `${c.nombre} · ${nomYo}`, botones, texto: c.pregunta});
}
async function repetirUsar(flag, yo, o){
  const c = REPETIR[flag], nomYo = nombreDe(yo);
  const pago = await ConfirmarTurno.flash(c.nombre, {sp: c.sp}, {quien: nomYo, spAjeno: c.spAjeno, ident: {nombre: nomYo, ref: yo.fichaId}});
  if(!pago) return;
  // Los No2 (Re-roll): con Extenuado, más caros; si no alcanzan, se pregunta y se hace igual (gasta los que tenga, con su línea roja).
  let no2 = 0;
  if(c.no2){
    const r0 = (fichasPub.get(yo.fichaId) || {}).resumen || {};
    no2 = c.no2 + num(r0.extenuado);
    if(num(r0.nitros) < no2 && !(await Confirmar.preguntar(`${c.nombre} cuesta ${fmt(no2)} No2 y ${nomYo} tiene ${fmt(Math.max(0, num(r0.nitros)))}. ¿Hacerlo igual?`, {titulo: 'Sin No2', si: 'Hacerlo igual'}))) return;
  }
  let falta = null;
  const ok = await editarPersonajeMapa(yo.fichaId, S => {
    const disp = Math.max(0, FichaBotonera.spMaximo(S, FichaCalculo.calcular(S)) - num(S.spGastado));
    if(disp < pago.sp){ falta = disp; return false; }
    S.spGastado = num(S.spGastado) + pago.sp;
    if(no2){
      S.nitros = num(S.nitros) - (no2 > num(S.nitros) ? FichaAcciones.gastoNitrosForzado(S, no2, `usó ${c.nombre}`) : no2);
      FichaAcciones.tormentaPj(S, no2, `usar ${c.nombre}`);   // ⛈ Atormentado
    }
    return true;
  });
  if(!ok){ toast(falta !== null ? `No te alcanza el SP: ${c.nombre} cuesta ${fmt(pago.sp)} y tenés ${fmt(falta)}` : `No se pudo cobrar ${c.nombre}`); return; }
  const r = await Duelo.enyetarTirada(o.id, o.lado, c.modo);
  let texto;
  if(!r) texto = `La tirada de ${o.nombre} ya no se puede cambiar (el duelo siguió): ✋ ${c.aMano}, a mano.`;
  else{
    await publicarRepeticion(o.nombre, r, c.modo, 'mapa');
    texto = `${c.hizo(nomYo, o.nombre)}: ${c.modo === 'nueva' ? 'vuelve a tirar' : 'repite'} su ${r.etq}, ${fmt(r.antes)} y ${fmt(r.nueva)} → queda ${fmt(r.ahora)}${r.contra !== null ? ` contra ${fmt(r.contra)}` : ''}. El duelo contra ${o.contra} se volvió a resolver.`;
  }
  try{
    await fbDb.collection(fbRutaCampana('tiradas')).add({uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: nomYo,
      origen: `${c.icono} ${nomYo} usó ${c.nombre} (−${fmt(pago.sp)} SP${no2 ? ` · −${fmt(no2)} No2` : ''})`,
      formula: `sobre ${o.nombre}`, rolls: [], mod: 0, total: 0, desde: 'recordatorio', cuando: firebase.firestore.FieldValue.serverTimestamp()});
  }catch(err){ console.error(`${c.nombre}: no se pudo avisar en la Mesa`, err); }
  momentoAbrir({tipo: flag === 'suerte' ? 'afortunado' : 'reroll', icono: c.icono, titulo: `${nomYo} usó ${c.nombre}`, resultado: texto, estado: 'listo',
    datos: {paraUids: [fbUsuario.uid], aviso: true, boton: 'Entendido', pasos: [{titulo: `${c.icono} ${c.nombre}`, texto}]}});
}
// Los nombres de siempre (el Ejecutar de la Botonera, js/11).
const abrirAfortunado = tokenId => abrirRepetir('suerte', tokenId);
const abrirReroll = tokenId => abrirRepetir('reroll', tokenId);
window.abrirAfortunado = abrirAfortunado;
window.abrirReroll = abrirReroll;
