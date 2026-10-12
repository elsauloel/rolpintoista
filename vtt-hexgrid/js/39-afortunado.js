/* =========================================================
   🧚 AFORTUNADO (Support, 2026-10-12, pedido del dueño: «sumale el skill afortunado, que es el reverso de enyetar, con su propio botón… una hadita»)
   Vos o un aliado a la vista (dentro de tu Rango) repite su última tirada de un duelo y se queda con la más alta; el duelo se vuelve a resolver.
   Sin maldición (no hay nada que resistir). 5 SP, Flash (10 en turno ajeno), sin No2, una vez por tirada — lo mismo que Enyetar, al revés.
   En combate, quien la tiene ve el botón fijo 🧚 (Flotantes.afortunado); el Ejecutar de su Botonera abre lo mismo (js/11).
   Usa Duelo.enyetarTirada(id, lado, 'mejor') y publicarRepeticion (js/38: los dos juegos de dados ruedan y brilla el que queda).
   ========================================================= */
function afortunadoToken(){
  if(modoMapa !== 'combate' || !fbUsuario) return null;
  const ok = t => t && t.tipo === 'pj' && t.fichaId && !String(t.fichaId).includes(SEP_INVOCACION) && puedoMover(t)
    && !!(((fichasPub.get(t.fichaId) || {}).resumen || {}).suerte);
  const sel = seleccion ? tokens.get(seleccion) : null;
  if(ok(sel)) return sel;
  for(const t of tokens.values()) if(ok(t)) return t;
  return null;
}
function renderAfortunadoBoton(){
  if(typeof Flotantes === 'undefined' || !Flotantes.afortunado) return;
  const t = afortunadoToken();
  if(!t){ Flotantes.afortunado(null); return; }
  const id = idDeToken(t);
  Flotantes.afortunado({mostrar: true, sub: `${nombreDe(t)}: que vos o un aliado repita una tirada y se quede con la mejor`, alClic: () => abrirAfortunado(id)});
}
setInterval(() => { try{ renderAfortunadoBoton(); }catch(e){} }, 1500);

async function abrirAfortunado(tokenId){
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
        if(!s || s.afortunada) return;
        const otro = x[lado === 'atacante' ? 'defensor' : 'atacante'] || {};
        lista.push({id: doc.id, lado, nombre: p.nombre || nombreDe(t), etq: s.etq, total: s.total, contra: otro.nombre || 'el otro'});
      });
    });
  }catch(err){ console.error('Afortunado: no se pudieron ver los duelos', err); }
  if(!lista.length){
    AvisoCombate.mostrar({icono: '🧚', titulo: `Afortunado · ${nomYo}`, texto: `No hay ninguna tirada reciente tuya ni de un aliado a tu alcance (Rango ${fmt(rng)}) en un duelo que todavía se pueda cambiar.`});
    return;
  }
  const botones = lista.slice(0, 8).map(o => ({fila: true, texto: `${o.nombre} · ${o.etq} (${fmt(o.total)})`,
    detalle: `en el duelo contra ${o.contra}: repite y queda la mejor; el duelo se vuelve a resolver · 5 SP (turno ajeno 10)`,
    alClic: () => { AvisoCombate.cerrar(); afortunadoUsar(yo, o); }}));
  botones.push({texto: 'Cancelar', sec: true, alClic: () => AvisoCombate.cerrar()});
  AvisoCombate.mostrar({icono: '🧚', titulo: `Afortunado · ${nomYo}`, botones, texto: '¿A qué tirada le das suerte?'});
}
async function afortunadoUsar(yo, o){
  const nomYo = nombreDe(yo);
  const pago = await ConfirmarTurno.flash('Afortunado', {sp: 5}, {quien: nomYo, spAjeno: 10, ident: {nombre: nomYo, ref: yo.fichaId}});
  if(!pago) return;
  let falta = null;
  const ok = await editarPersonajeMapa(yo.fichaId, S => {
    const disp = Math.max(0, FichaBotonera.spMaximo(S, FichaCalculo.calcular(S)) - num(S.spGastado));
    if(disp < pago.sp){ falta = disp; return false; }
    S.spGastado = num(S.spGastado) + pago.sp;
    return true;
  });
  if(!ok){ toast(falta !== null ? `No te alcanza el SP: Afortunado cuesta ${fmt(pago.sp)} y tenés ${fmt(falta)}` : 'No se pudo cobrar el SP de Afortunado'); return; }
  const r = await Duelo.enyetarTirada(o.id, o.lado, 'mejor');
  let texto;
  if(!r) texto = `La tirada de ${o.nombre} ya no se puede cambiar (el duelo siguió): ✋ que la repita y se quede con la mejor, a mano.`;
  else{
    await publicarRepeticion(o.nombre, r, 'mejor', 'mapa');
    texto = `${nomYo} le dio suerte a ${o.nombre}: repite su ${r.etq}, ${fmt(r.antes)} y ${fmt(r.nueva)} → queda ${fmt(r.ahora)}${r.contra !== null ? ` contra ${fmt(r.contra)}` : ''}. El duelo contra ${o.contra} se volvió a resolver.`;
  }
  try{
    await fbDb.collection(fbRutaCampana('tiradas')).add({uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: nomYo, origen: `🧚 ${nomYo} usó Afortunado (−${fmt(pago.sp)} SP)`,
      formula: `sobre ${o.nombre}`, rolls: [], mod: 0, total: 0, desde: 'recordatorio', cuando: firebase.firestore.FieldValue.serverTimestamp()});
  }catch(err){ console.error('Afortunado: no se pudo avisar en la Mesa', err); }
  momentoAbrir({tipo: 'afortunado', icono: '🧚', titulo: `${nomYo} usó Afortunado`, resultado: texto, estado: 'listo',
    datos: {paraUids: [fbUsuario.uid], aviso: true, boton: 'Entendido', pasos: [{titulo: '🧚 Afortunado', texto}]}});
}
