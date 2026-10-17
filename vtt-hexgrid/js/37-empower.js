/* =========================================================
   💪 EMPOWER (Support, 2026-10-12, decisiones del dueño)
   «+3 a cualquier tirada propia o de un aliado»: se usa después de ver la tirada, sobre vos o un aliado a la vista (dentro de tu Rango).
   Flash: 2 SP en tu turno, 4 en el ajeno. Sin límite, pero cada Empower más sobre la misma tirada cuesta 1 SP más que el anterior.
   «Cuando un personaje tiene Empower, debe tener un botón, al igual que la moneda o la polilla, brillando para poder utilizarlo en cualquier
   momento del combate» (dueño): el 💪 fijo de arriba (comun/flotantes.js, Flotantes.empower), en modo combate, para el personaje que maneja
   esta pantalla y tiene la habilidad (resumen.empower). El Ejecutar de su Botonera abre lo mismo (js/11).
   Las tiradas: la última de cada lado de un duelo reciente (la misma que la Polilla, Duelo.tiradaSumable: el duelo se vuelve a resolver,
   Duelo.sumarATirada; empatado, pierde quien recibió el Empower) y, fuera de un duelo, la última tirada de la Mesa de cada uno (queda
   anunciada; lo que cambie, a mano). Los Empower previos se cuentan en la tirada del duelo (💪 en su fórmula) o en las líneas de la Mesa.
   ========================================================= */
const EMPOWER_SUMA = 3, EMPOWER_MS = 10 * 60 * 1000;
const EMPOWER_NO_TIRADA = ['recordatorio', 'reporte', 'alerta', 'alerta-roja', 'sigilo-alerta', 'efecto', 'incierta', 'incierta-pj', 'incierta-creep'];
const empowerReciente = ts => !!(ts && ts.toMillis && Date.now() - ts.toMillis() < EMPOWER_MS);

// El personaje con Empower que maneja esta pantalla (el seleccionado si lo es; si no, el primero), solo en combate.
function empowerToken(){
  if(modoMapa !== 'combate' || !fbUsuario) return null;
  const ok = t => t && t.tipo === 'pj' && t.fichaId && !String(t.fichaId).includes(SEP_INVOCACION) && puedoMover(t)
    && !!(((fichasPub.get(t.fichaId) || {}).resumen || {}).empower);
  const sel = seleccion ? tokens.get(seleccion) : null;
  if(ok(sel)) return sel;
  for(const t of tokens.values()) if(ok(t)) return t;
  return null;
}
function renderEmpowerBoton(){
  if(typeof Flotantes === 'undefined' || !Flotantes.empower) return;
  const t = empowerToken();
  if(!t){ Flotantes.empower(null); return; }
  const id = idDeToken(t);
  Flotantes.empower({mostrar: true, sub: `${nombreDe(t)}: +${EMPOWER_SUMA} a una tirada tuya o de un aliado`, alClic: () => abrirEmpower(id)});
}
setInterval(() => { try{ renderEmpowerBoton(); }catch(e){} }, 1500);

async function abrirEmpower(tokenId){
  const yo = tokens.get(tokenId);
  if(!yo) return;
  const nomYo = nombreDe(yo), rng = num((rangoDeToken(yo) || {}).rng);
  const alcanza = t => !!t && (t === yo || (t.tipo === 'pj' && !dueloEsRival(yo, t) && distanciaHex(yo, t) <= rng));
  const opciones = [];
  try{
    const q = await fbDb.collection(fbRutaCampana('duelos')).orderBy('creado', 'desc').limit(10).get();
    q.docs.forEach(doc => {
      const x = doc.data();
      if(!x || x.estado === 'cancelado' || !empowerReciente(x.creado)) return;
      ['atacante', 'defensor'].forEach(lado => {
        const p = x[lado], t = p && tokens.get(p.tokenId);
        if(!alcanza(t)) return;
        const s = Duelo.tiradaSumable(x, lado);
        if(!s) return;
        const otro = x[lado === 'atacante' ? 'defensor' : 'atacante'] || {};
        opciones.push({tipo: 'duelo', id: doc.id, lado, nombre: p.nombre || nombreDe(t), etq: s.etq, total: s.total, previos: s.empowers, contra: otro.nombre || 'el otro'});
      });
    });
  }catch(err){ console.error('Empower: no se pudieron ver los duelos', err); }
  try{
    const q = await fbDb.collection(fbRutaCampana('tiradas')).orderBy('cuando', 'desc').limit(40).get();
    const docs = q.docs.map(x => ({id: x.id, ...x.data()}));
    const nombres = new Set();
    tokens.forEach(t => { if(alcanza(t)) nombres.add(nombreDe(t)); });
    const vistos = new Set();
    docs.forEach(u => {
      if(!u || vistos.has(u.quien) || !nombres.has(u.quien) || EMPOWER_NO_TIRADA.includes(u.desde) || !Array.isArray(u.rolls) || !u.rolls.length || !empowerReciente(u.cuando)) return;
      vistos.add(u.quien);
      if(opciones.some(o => o.tipo === 'duelo' && o.nombre === u.quien)) return;   // su tirada del duelo ya está
      const marca = `«${u.origen || 'su tirada'}» de ${u.quien}`;
      const previos = docs.filter(z => z.desde === 'recordatorio' && String(z.origen || '').startsWith('💪') && String(z.formula || '').includes(marca)).length;
      opciones.push({tipo: 'mesa', nombre: u.quien, etq: u.origen || 'su tirada', marca, total: num(u.total) + EMPOWER_SUMA * previos, previos});
    });
  }catch(err){ console.error('Empower: no se pudo ver la Mesa', err); }
  if(!opciones.length){
    AvisoCombate.mostrar({icono: '💪', titulo: `Empower · ${nomYo}`, texto: `No hay ninguna tirada reciente tuya ni de un aliado a tu alcance (Rango ${fmt(rng)}) para sumarle +${EMPOWER_SUMA}.`});
    return;
  }
  const botones = opciones.slice(0, 8).map(o => ({fila: true, texto: `${o.nombre} · ${o.etq} (${fmt(o.total)})`,
    detalle: `${o.tipo === 'duelo' ? `en el duelo contra ${o.contra}: se vuelve a resolver` : 'en la Mesa, fuera de un duelo (lo que cambie, a mano)'} · ${fmt(2 + o.previos)} SP (turno ajeno ${fmt(4 + o.previos)})${o.previos ? ` · ya lleva ${o.previos} Empower` : ''}`,
    alClic: () => { AvisoCombate.cerrar(); empowerUsar(yo, o); }}));
  botones.push({texto: 'Cancelar', sec: true, alClic: () => AvisoCombate.cerrar()});
  AvisoCombate.mostrar({icono: '💪', titulo: `Empower · ${nomYo}`, botones,
    texto: `¿A qué tirada le sumás +${EMPOWER_SUMA}? Cada Empower más sobre la misma tirada cuesta 1 SP más que el anterior (⚡ Flash: el doble en turno ajeno).`});
}

async function empowerUsar(yo, o){
  const nomYo = nombreDe(yo);
  const pago = await ConfirmarTurno.flash('Empower', {sp: 2 + o.previos}, {quien: nomYo, spAjeno: 4 + o.previos, ident: {nombre: nomYo, ref: yo.fichaId}});
  if(!pago) return;
  let falta = null;
  const ok = await editarPersonajeMapa(yo.fichaId, async S => {
    const disp = Math.max(0, FichaBotonera.spMaximo(S, FichaCalculo.calcular(S)) - num(S.spGastado));
    if(disp < pago.sp){ falta = disp; return false; }
    if(!(await FichaAcciones.confirmarMaldito(S, pago.sp, {}, 'Empower'))) return false;   // 🩸 Maldito: avisa y deja cancelar
    FichaAcciones.gastarSp(S, pago.sp, {fijarHp: v => mantFijarHp(S, v), toast}, 'Empower');   // 🩸 Maldito
    return true;
  });
  if(!ok){ toast(falta !== null ? `No te alcanza el SP: Empower cuesta ${fmt(pago.sp)} y tenés ${fmt(falta)}` : 'No se pudo cobrar el SP de Empower'); return; }
  let texto, formula;
  if(o.tipo === 'duelo'){
    const r = await Duelo.sumarATirada(o.id, o.lado, EMPOWER_SUMA, '💪', 'Empower');
    texto = !r ? `La tirada de ${o.nombre} ya no se puede cambiar (el duelo siguió): ✋ sumale +${EMPOWER_SUMA} a mano.`
      : `${nomYo} usó Empower sobre ${o.nombre}: su ${r.etq} ${fmt(r.antes)} → ${fmt(r.ahora)}${r.contra !== null ? ` contra ${fmt(r.contra)}` : ''}. ${r.empate
        ? `Quedó empatado: quien recibe Empower pierde los empates, gana ${o.contra}.` : `El duelo contra ${o.contra} se volvió a resolver con el número nuevo.`}`;
    formula = r ? `+${EMPOWER_SUMA} a la ${r.etq} de ${o.nombre} (duelo): ${fmt(r.antes)} → ${fmt(r.ahora)}` : `+${EMPOWER_SUMA} a ${o.nombre} (a mano)`;
  }else{
    texto = `${nomYo} usó Empower sobre ${o.nombre}: «${o.etq}» ${fmt(o.total)} → ${fmt(o.total + EMPOWER_SUMA)}. ✋ Si eso cambia algo, a mano.`;
    formula = `+${EMPOWER_SUMA} a ${o.marca}: ${fmt(o.total)} → ${fmt(o.total + EMPOWER_SUMA)}`;
  }
  try{
    await fbDb.collection(fbRutaCampana('tiradas')).add({uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: nomYo, origen: `💪 ${nomYo} usó Empower (−${fmt(pago.sp)} SP)`,
      formula, rolls: [], mod: 0, total: 0, desde: 'recordatorio', cuando: firebase.firestore.FieldValue.serverTimestamp()});
  }catch(err){ console.error('Empower: no se pudo avisar en la Mesa', err); }
  momentoAbrir({tipo: 'empower', icono: '💪', titulo: `${nomYo} usó Empower`, resultado: texto, estado: 'listo',
    datos: {paraUids: [fbUsuario.uid], aviso: true, boton: 'Entendido', pasos: [{titulo: '💪 Empower', texto}]}});
}
