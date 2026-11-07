/* 🩸 TRANSFUSIÓN SANGUÍNEA (Debuffer, 2026-10-13, dueño; docs/clases-borrador.md). Después de cobrar (1 SP y 1 No2), se eligen en el mapa quién da
   y quién recibe —dos personajes aliados, quien la usa incluido, dentro de su Rango (si no, avisa y deja seguir)— y cuánto (hasta `max`: el Especial de quien la usa, dueño 2026-10-14): quien
   da queda con al menos 1 de vida y quien recibe no pasa su máximo. La vida no la escribe esta pantalla (un jugador no escribe la ficha de otro):
   va como un aviso «Transfusión» a cada ficha (EstadosAplicar.encolarPj → FichaAcciones.aplicarEstadoRecibido), que lo aplica su dueño (o el mapa
   que lo maneja). Las invocaciones, a mano. */
function transfusionElegir(texto){
  return new Promise(res => elegirDestino(c => res(c), texto, true, () => res(null)));
}
function transfusionToken(c){
  const e = [...tokens.entries()].find(([, t]) => t.col === c.col && t.fila === c.fila && t.tipo === 'pj');
  return e ? {id: e[0], t: e[1]} : null;
}
async function transfusionDeHabilidad(msg){
  const yo = [...tokens.entries()].find(([, t]) => t.fichaId === msg.fichaId && t.tipo === 'pj');
  if(!yo){ toast(`${msg.nombre}: tu token no está en el mapa — pasá la vida a mano`); return; }
  let rango = 0;
  try{ rango = Math.round(num(rangoDeToken(yo[1]).rng)) || 0; }catch(e){}
  const pedir = async paso => {
    const c = await transfusionElegir(`<b>🩸 ${esc(msg.nombre)}: ${paso}</b> <span>clic sobre un personaje aliado (vos también) a ${rango} casilleros o menos · Esc cancela</span>`);
    if(!c) return null;
    const x = transfusionToken(c);
    if(!x){ toast('Ahí no hay un personaje: elegí uno de tu equipo'); return pedir(paso); }
    if(String(x.t.fichaId).includes(SEP_INVOCACION)){ toast(`${nombreDe(x.t)} es una invocación: la Transfusión entre invocaciones va a mano`); return null; }
    if(rango && distanciaHex(yo[1], x.t) > rango) toast(`${nombreDe(x.t)} está fuera de tu Rango (${rango}): va igual, lo decide la mesa`);
    return x;
  };
  const da = await pedir('¿quién da la vida?');
  if(!da){ mesaLinea(`🩸 ${msg.nombre}: se canceló (el costo ya se pagó)`, 'recordatorio'); return; }
  const recibe = await pedir(`¿quién la recibe? (da: ${nombreDe(da.t)})`);
  if(!recibe){ mesaLinea(`🩸 ${msg.nombre}: se canceló (el costo ya se pagó)`, 'recordatorio'); return; }
  if(recibe.id === da.id){ toast('Tienen que ser dos personajes distintos'); mesaLinea(`🩸 ${msg.nombre}: se canceló (era el mismo personaje)`, 'recordatorio'); return; }
  const rd = (fichasPub.get(da.t.fichaId) || {}).resumen || {}, rr = (fichasPub.get(recibe.t.fichaId) || {}).resumen || {};
  const max = Math.min(Math.max(1, num(msg.max) || 20), Math.max(0, num(rd.hp) - 1), Math.max(0, num(rr.hpMax) - num(rr.hp)));
  if(max <= 0){ toast(num(rd.hp) <= 1 ? `${nombreDe(da.t)} no tiene vida para dar` : `${nombreDe(recibe.t)} ya tiene la vida llena`); mesaLinea(`🩸 ${msg.nombre}: no había vida para pasar`, 'recordatorio'); return; }
  const n = await transfusionPedirCantidad(`${msg.nombre}: ¿cuánta vida?`,
    `De ${nombreDe(da.t)} (${fmt(num(rd.hp))} de vida) a ${nombreDe(recibe.t)} (${fmt(num(rr.hp))} de ${fmt(num(rr.hpMax))}).`, max);
  if(n == null){ mesaLinea(`🩸 ${msg.nombre}: se canceló (el costo ya se pagó)`, 'recordatorio'); return; }
  transfusionAplicar(msg, da, recibe, n);
}
/* 🩸 ¿Cuánta vida? (2026-11-03, dueño: «que uno pueda poner el número exacto, de entre 1 y el máximo… uno escribe el valor, no una opción de
   múltiplos de 5»): un campo con el máximo ya escrito; si lo escrito no va (no es un número, menos de 1, más del máximo), avisa y lo vuelve a pedir.
   → el número, o null si se cancela. */
async function transfusionPedirCantidad(titulo, texto, max, aviso){
  const txt = await Confirmar.texto(`${aviso ? '⚠ ' + aviso + ' ' : ''}${texto} Escribí cuánta: de 1 a ${fmt(max)}.`,
    {titulo, icono: '🩸', valor: String(max), sugerencias: [...new Set([1, Math.ceil(max / 2), max])].filter(v => v >= 1).map(String), si: 'Pasar la vida', no: 'Cancelar', max: 4});
  if(txt === null) return null;
  const r = FxTransfusion.cantidad(txt, max);
  return r.error ? transfusionPedirCantidad(titulo, texto, max, r.error) : r.n;
}
async function transfusionAplicar(msg, da, recibe, n){
  try{
    await EstadosAplicar.encolarPj({fichaId: da.t.fichaId, duenoUid: da.t.duenoUid, spec: {nombre: 'Transfusión', vida: -n, polaridad: 'debuff', detalle: `Dio ${n} de vida (${msg.nombre}).`}, origen: msg.nombre});
    await EstadosAplicar.encolarPj({fichaId: recibe.t.fichaId, duenoUid: recibe.t.duenoUid, spec: {nombre: 'Transfusión', vida: n, polaridad: 'buff', detalle: `Recibió ${n} de vida (${msg.nombre}).`}, origen: msg.nombre});
    mesaLinea(`🩸 ${msg.nombre}: ${nombreDe(da.t)} le pasa ${n} de vida a ${nombreDe(recibe.t)}`, 'recordatorio');
    if(typeof transfusionFxPublicar === 'function') transfusionFxPublicar(da.id, recibe.id, `${nombreDe(da.t)} le pasa vida a ${nombreDe(recibe.t)}`, `${msg.nombre}: ${n} de vida`);   // 🩸 la animación, en todas las pantallas (js/92)
  }catch(err){
    console.error('No se pudo hacer la Transfusión:', err);
    mesaLinea(`🩸 ${msg.nombre}: no se pudo aplicar — a mano: ${nombreDe(da.t)} −${n} de vida, ${nombreDe(recibe.t)} +${n}`, 'alerta-roja');
  }
}

/* 🩸 La de un creep (Support, 2026-11-03, dueño: «habría que ponérselo también al pool de habilidades de creep»). La pantalla del GM: después de
   cobrar, el GM toca quién da y quién recibe —dos creeps aliados (el que la usa puede ser uno), dentro de su Rango (si no, avisa y deja seguir)— y
   cuánto (hasta su Especial: CreepAcciones.transfusionMax). La vida se escribe en cada creep (acCambiarCreep). Lo que recibe es una cura: con Herida
   sombría no entra y con una Sanguijuela se la lleva quien la lanzó (CreepAcciones.transfusionRecibir). Con un personaje o una invocación, a mano. */
function transfusionDeCreep(sc, h, alTerminar){
  const fin = () => { if(typeof alTerminar === 'function') alTerminar(); };
  const mio = [...tokens.entries()].find(([, x]) => x.tipo === 'creep' && x.fichaId === sc.id);
  if(!mio){ toast(`${h.nombre}: ${sc.nombre} no tiene token en este mapa — pasá la vida a mano`); fin(); return; }
  const yo = {ref: sc.id, tipo: 'creep', nombre: sc.nombre};
  let rango = 0;
  try{ rango = Math.round(num(rangoDeToken(mio[1]).rng)) || 0; }catch(e){}
  const cancelar = motivo => { mesaLinea(`🩸 ${sc.nombre} · ${h.nombre}: ${motivo} (el costo ya se pagó)`, 'recordatorio'); fin(); };
  const pedir = async paso => {
    const c = await transfusionElegir(`<b>🩸 ${esc(h.nombre)} (${esc(sc.nombre)}): ${paso}</b> <span>clic sobre un creep aliado (o el mismo) a ${rango} casilleros o menos · Esc cancela</span>`);
    if(!c) return null;
    const e = [...tokens.entries()].find(([, x]) => x.col === c.col && x.fila === c.fila && !x.bajoTierra);
    if(!e){ toast('Ahí no hay nadie: tocá un creep aliado'); return pedir(paso); }
    if(dueloEsRival(yo, e[1])){ toast('Tiene que ser un aliado'); return pedir(paso); }
    if(e[1].tipo !== 'creep'){ toast(`${nombreDe(e[1])} no es un creep: la Transfusión con un personaje o una invocación va a mano`); return null; }
    if(rango && e[0] !== mio[0] && distanciaHex(mio[1], e[1]) > rango) toast(`${nombreDe(e[1])} está fuera de su Rango (${rango}): va igual, lo decide la mesa`);
    return {id: e[0], t: e[1]};
  };
  (async () => {
    const da = await pedir('¿quién da la vida?');
    if(!da) return cancelar('se canceló');
    const recibe = await pedir(`¿quién la recibe? (da: ${nombreDe(da.t)})`);
    if(!recibe) return cancelar('se canceló');
    if(recibe.id === da.id){ toast('Tienen que ser dos distintos'); return cancelar('era el mismo creep'); }
    const scDa = creepPrivadoDe(da.t.fichaId), scRe = creepPrivadoDe(recibe.t.fichaId);
    if(!scDa || !scRe) return cancelar('no se pudieron leer los creeps — pasala a mano');
    const max = CreepAcciones.transfusionMax(sc, scDa, scRe);
    if(max <= 0){ toast(num(scDa.hp) <= 1 ? `${nombreDe(da.t)} no tiene vida para dar` : `${nombreDe(recibe.t)} ya tiene la vida llena`); return cancelar('no había vida para pasar'); }
    const n = await transfusionPedirCantidad(`${h.nombre}: ¿cuánta vida?`,
      `De ${nombreDe(da.t)} (${fmt(num(scDa.hp))} de vida) a ${nombreDe(recibe.t)} (${fmt(num(scRe.hp))} de ${fmt(num(scRe.hpMax))}). Como mucho su Especial y lo que le falta a quien recibe.`, max);
    if(n == null) return cancelar('se canceló');
    await transfusionCreepAplicar(sc, h, da, recibe, n);
    fin();
  })().catch(err => { console.error('Transfusión de creep:', err); cancelar('no se pudo — pasala a mano'); });
}
async function transfusionCreepAplicar(sc, h, da, recibe, n){
  let dio = 0, r = null;
  await acCambiarCreep(da.t.fichaId, c => { dio = CreepAcciones.transfusionDar(c, n); return {}; });
  if(!(dio > 0)){ mesaLinea(`🩸 ${sc.nombre} · ${h.nombre}: no se pudo sacar la vida de ${nombreDe(da.t)} — a mano`, 'alerta-roja'); return; }
  await acCambiarCreep(recibe.t.fichaId, c => { r = CreepAcciones.transfusionRecibir(c, dio, nombreDe(recibe.t)); return {}; });
  const dest = r && r.robo ? r.txt : r && r.recibio > 0 ? `${nombreDe(recibe.t)} +${fmt(r.recibio)}` : `${nombreDe(recibe.t)}: ${(r && r.txt) || 'no recibió'}`;
  mesaLinea(`🩸 ${sc.nombre} usa ${h.nombre}: ${nombreDe(da.t)} da ${fmt(dio)} de vida → ${dest}`, 'recordatorio');
  if(typeof transfusionFxPublicar === 'function') transfusionFxPublicar(da.id, recibe.id, `${nombreDe(da.t)} le pasa vida a ${nombreDe(recibe.t)}`, `${h.nombre}: ${fmt(dio)} de vida`);   // 🩸 la animación (js/92)
}

