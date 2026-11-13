/* =========================================================
   💪 EMPOWER (Support; 2026-10-12, rehecho el 2026-10-22, decisiones del dueño)
   «Empower se debe poder elegir antes de una tirada. Se aprieta y la siguiente tirada le suma el valor del empower… es sólo para la siguiente
   tirada después de activarlo» (dueño, 2026-10-22; antes se sumaba a una tirada ya hecha). Se toca 💪, se elige a quién (vos o un aliado a la
   vista, dentro de tu Rango), se paga y esa persona queda con el estado Empower (comun/estados-presets.js, `unaTirada`): +3 a su próxima
   tirada, la que sea, y esa tirada lo gasta (FichaAcciones.tirarValorStat y el daño; las que tira el mapa por el resumen, mesaTrasPublicar acá).
   Flash: 2 SP en tu turno, 4 en el ajeno. Sin límite: otro Empower antes de que tire es un stack más (+6), y cada uno de más cuesta 1 SP más.
   «Cuando un personaje tiene Empower, debe tener un botón… brillando para poder utilizarlo en cualquier momento del combate» (dueño): el 💪 fijo
   de arriba (comun/flotantes.js, Flotantes.empower), en modo combate, para el personaje que maneja esta pantalla y tiene la habilidad
   (resumen.empower). El Ejecutar de su Botonera abre lo mismo (js/11).
   ========================================================= */
const EMPOWER_SUMA = 3;

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
  Flotantes.empower({mostrar: true, sub: `${nombreDe(t)}: +${EMPOWER_SUMA} a la próxima tirada tuya o de un aliado`, alClic: () => abrirEmpower(id)});
}
setInterval(() => { try{ renderEmpowerBoton(); }catch(e){} }, 1500);

// Los Empower que ya esperan en esa persona (los stacks del estado, en su resumen).
function empowerPendientes(t){
  const e = ((((fichasPub.get(t.fichaId) || {}).resumen) || {}).estados || []).find(x => x && x.activo !== false && (x.unaTirada || x.nombre === 'Empower'));
  return e ? Math.max(1, num(e.stacks) || 1) : 0;
}
async function abrirEmpower(tokenId){
  const yo = tokens.get(tokenId);
  if(!yo) return;
  const nomYo = nombreDe(yo), rng = num((rangoDeToken(yo) || {}).rng);
  const alcanza = t => !!t && (t === yo || (t.tipo === 'pj' && t.fichaId && !String(t.fichaId).includes(SEP_INVOCACION) && !dueloEsRival(yo, t)
    && distanciaHex(yo, t) <= rng && !(((fichasPub.get(t.fichaId) || {}).resumen) || {}).muerto));
  const lista = [yo, ...[...tokens.values()].filter(t => t !== yo && alcanza(t)).sort((a, b) => distanciaHex(yo, a) - distanciaHex(yo, b))];
  const botones = lista.slice(0, 8).map(t => {
    const ya = empowerPendientes(t), sumaria = EMPOWER_SUMA * (ya + 1);
    return {fila: true, texto: t === yo ? `${nombreDe(t)} (vos)` : nombreDe(t),
      detalle: `su próxima tirada: +${fmt(sumaria)}${ya ? ` (ya tiene ${ya} Empower esperando)` : ''} · ${fmt(2 + ya)} SP (turno ajeno ${fmt(4 + ya)})`,
      alClic: () => { AvisoCombate.cerrar(); empowerUsar(yo, t, ya); }};
  });
  botones.push({texto: 'Cancelar', sec: true, alClic: () => AvisoCombate.cerrar()});
  AvisoCombate.mostrar({icono: '💪', titulo: `Empower · ${nomYo}`, botones,
    texto: `¿A quién le das Empower? Su próxima tirada, la que sea, suma +${EMPOWER_SUMA}. A vos o a un aliado a tu alcance (Rango ${fmt(rng)}). Otro Empower antes de que tire se suma y cuesta 1 SP más (⚡ Flash: el doble en turno ajeno).`});
}

async function empowerUsar(yo, t, previos){
  const nomYo = nombreDe(yo), nomT = nombreDe(t), propio = t.fichaId === yo.fichaId;
  const pago = await ConfirmarTurno.flash('Empower', {sp: 2 + previos}, {quien: nomYo, spAjeno: 4 + previos, ident: {nombre: nomYo, ref: yo.fichaId}});
  if(!pago) return;
  let falta = null;
  const ok = await editarPersonajeMapa(yo.fichaId, async S => {
    const disp = Math.max(0, FichaBotonera.spMaximo(S, FichaCalculo.calcular(S)) - num(S.spGastado));
    if(disp < pago.sp){ falta = disp; return false; }
    if(!(await FichaAcciones.confirmarMaldito(S, pago.sp, {}, 'Empower'))) return false;   // 🩸 Maldito: avisa y deja cancelar
    FichaAcciones.gastarSp(S, pago.sp, {fijarHp: v => mantFijarHp(S, v), toast}, 'Empower');   // 🩸 Maldito
    if(propio){ S.efectos = S.efectos || []; Combatiente.agregarEstado(S.efectos, FichaAcciones.estadoDeSpec({nombre: 'Empower'}, estadosPresetFicha())); }   // a vos: ya, para la tirada que sigue
    return true;
  });
  if(!ok){ toast(falta !== null ? `No te alcanza el SP: Empower cuesta ${fmt(pago.sp)} y tenés ${fmt(falta)}` : 'No se pudo cobrar el SP de Empower'); return; }
  if(!propio){
    try{ await EstadosAplicar.encolarPj({fichaId: t.fichaId, duenoUid: t.duenoUid, spec: {nombre: 'Empower'}, origen: `${nomYo} · Empower`}); }
    catch(err){ console.error('Empower: no se pudo dar el estado', err); toast(`No se pudo darle Empower a ${nomT}: sumale +${EMPOWER_SUMA} a mano a su próxima tirada`); }
  }
  const suma = EMPOWER_SUMA * (previos + 1);
  const texto = `${nomYo} le dio Empower a ${propio ? 'sí mismo' : nomT}: su próxima tirada suma +${fmt(suma)}${previos ? ` (con los ${previos} que ya tenía)` : ''}. Esa tirada lo gasta.`;
  try{ await mesaLinea(`💪 ${texto} (−${fmt(pago.sp)} SP)`, 'recordatorio', nomYo); }catch(err){}
  const uids = [...new Set([fbUsuario.uid, t.duenoUid].filter(Boolean))];
  momentoAbrir({tipo: 'empower', icono: '💪', titulo: `${nomYo} usó Empower`, resultado: texto, estado: 'listo',
    datos: {paraUids: uids, aviso: true, boton: 'Entendido', pasos: [{titulo: '💪 Empower', texto}]}});
}

// Una tirada que tiró el mapa por un personaje (con los números de su resumen: una zona, Percepción, la Iniciativa…) y que sumó su Empower:
// se lo saca de la ficha. Las de la Botonera y el duelo ya lo gastaron al tirar (FichaAcciones.tirarValorStat); acá no encuentran nada.
const empowerGastando = new Set();
window.mesaTrasPublicar = (doc, r) => {
  if(!(doc.estados || []).some(e => e && e.n === 'Empower')) return;
  const ficha = String(doc.ficha || '').split(SEP_INVOCACION)[0];
  const t = [...tokens.values()].find(x => x.tipo === 'pj' && x.fichaId && !String(x.fichaId).includes(SEP_INVOCACION)
    && (ficha ? x.fichaId === ficha : nombreDe(x) === doc.quien));
  if(!t || !(soyGM || puedoMover(t)) || empowerGastando.has(t.fichaId)) return;
  empowerGastando.add(t.fichaId);
  editarPersonajeMapa(t.fichaId, S => Combatiente.gastarUnaTirada(S.efectos))
    .catch(err => console.error('Empower: no se pudo gastar', err)).finally(() => empowerGastando.delete(t.fichaId));
};
