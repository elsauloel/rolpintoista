/* =========================================================
   ➕ SUMAR A MANO UN TOKEN AL ORDEN DE TURNOS (2026-11-24, dueño, P291: «sí, quiero que lo hagas») y ✕ SACARLO DE LA TABLA (P328).
   En el menú «⋯» del token (js/10), solo el GM y con el orden de turnos armado:
   · «➕ Sumar al orden de turnos» si el token no está. Vale aunque la regla diga que no ocupa lugar (un tótem, un estandarte, un token suelto con «No»):
     se le escribe `iniciativa: true` (OrdenTurnos.campoAlSumar) para que Ordenar, Traer tokens y ▶ Siguiente lo respeten. Pide el número: si tiene
     datos (personaje, invocación o creep), «🎲 Tirar su Iniciativa» (como «🎲 Tirar iniciativa») o «✍ Escribir el número»; sin datos (un token suelto),
     directo el número. Entra en su lugar con OrdenTurnos.entrarConTirada (lo mismo que una invocación: antes del primero que sacó menos; si su lugar ya
     pasó en esta ronda, juega igual al final de esta ronda y desde la próxima en su lugar, P301 b y P328 2). Sin Mareo de invocación (no está entrando sola: la mete el GM). Una línea en la Mesa.
   · Sacar: con la ✕ de su fila en la tabla (P328: el ➖ del token se sacó, «hay muchos botones alrededor del token»): ordenSacarDeTabla, abajo.
   La línea no nombra a quien los jugadores no ven (oculto, en sigilo, un creep que todavía no vieron, su fila escondida): ahí solo el GM ve un aviso.
   ========================================================= */
function ordenManoPuede(t){
  return !!t && soyGM && !pausaSoloMirar() && Array.isArray(iniciativa.orden) && iniciativa.orden.length > 0;
}
function ordenManoEsta(id){ return iniciativa.orden.some(o => o.id === id); }
// ¿Los jugadores lo ven? (mismo criterio que la Demora, js/04)
function ordenManoPublico(id){
  const t = tokens.get(id), o = iniciativa.orden.find(x => x.id === id);
  return !!t && !t.oculto && !(o && o.oculto) && (t.tipo === 'creep' ? creepConocido(t) : !enSigilo(t));
}
// El token (personaje suelto de un jugador o creep) se puede marcar: las reglas dejan al GM escribir `iniciativa` en un creep y en un token sin ficha.
function ordenManoMarcable(t){ return !!t && (t.tipo === 'creep' || !t.fichaId); }
async function ordenManoMarcar(id, valor){
  const t = tokens.get(id);
  if(!ordenManoMarcable(t)) return true;
  try{ await coleccionTokens().doc(id).update({iniciativa: valor}); return true; }
  catch(err){
    console.error('No se pudo marcar el token para el orden de turnos:', err);
    toast(err.code === 'permission-denied' ? 'No se pudo marcar el token: faltan pegar las reglas nuevas de Firestore (token suelto paso a paso)' : 'No se pudo marcar el token');
    return false;
  }
}

// ¿Qué hay para tirar? 'creep' | 'pj' | 'inv' | '' (sin datos: un token suelto, o un creep sin su ficha a mano).
function ordenManoQueTira(t){
  if(!t) return '';
  if(t.tipo === 'creep') return t.fichaId && creepPrivadoDe(t.fichaId) ? 'creep' : '';
  if(!t.fichaId) return '';
  if(t.fichaId.includes(SEP_INVOCACION)) return 'inv';
  const f = fichasPub.get(t.fichaId);
  return f && f.resumen && f.resumen.ini !== undefined ? 'pj' : '';
}
// La tirada de Iniciativa como la de siempre (la Prisa al resultado; un personaje, menos el sobrepeso). → {r, sobre?} o null.
async function ordenManoTirar(t, que){
  const cero = {formula: '0', rolls: [], mod: 0, total: 0};
  if(que === 'inv'){ const r = await invocacionIniciativa(t); return r ? {r} : null; }
  const dato = que === 'creep' ? iniciativaDeCreep(creepPrivadoDe(t.fichaId)) : await iniciativaDePj(t.fichaId);
  if(!dato) return null;
  const fo = formulaParaValor(num(dato.base));
  let r = Combatiente.conIniFijo((fo && tirarDados(fo.formula)) || cero, dato.fijo && dato.fijo.val ? dato.fijo : null);
  const sobre = que === 'pj' ? Math.max(0, num(dato.sobre)) : 0;
  if(sobre) r = Combatiente.conSobrepesoIni(r, sobre);
  return {r, ...(que === 'pj' ? {sobre} : {})};
}

async function ordenSumarAMano(id){
  const t = tokens.get(id);
  if(!ordenManoPuede(t) || ordenManoEsta(id)) return;
  const nombre = nombreDe(t), que = ordenManoQueTira(t);
  let modo = 'mano';
  if(que){
    modo = await Confirmar.elegir(`¿Con qué número de iniciativa entra ${nombre}?`, {titulo: 'Sumar al orden de turnos', icono: '➕', opciones: [
      {texto: '🎲 Tirar su Iniciativa', detalle: 'La tirada de siempre (con la Prisa y el sobrepeso, si tiene). Va a la Mesa.', valor: 'tirar'},
      {texto: '✍ Escribir el número', detalle: 'Un número que decide la mesa.', valor: 'mano'},
    ]});
    if(!modo) return;
  }
  let valor = null, tiro = null;
  if(modo === 'tirar'){
    tiro = await ordenManoTirar(t, que);
    if(!tiro){ toast(`No se pudo tirar la Iniciativa de ${nombre}: escribí el número a mano`); modo = 'mano'; }
    else valor = num(tiro.r.total);
  }
  if(modo === 'mano'){
    const txt = await Confirmar.texto(`¿Con qué número de iniciativa entra ${nombre}? Se ubica antes del primero que tenga menos.`, {titulo: 'Sumar al orden de turnos', icono: '➕', valor: '0', si: 'Sumar', max: 8});
    if(txt === null) return;
    valor = OrdenTurnos.numeroAMano(txt);
    if(valor === null){ toast('Escribí un número (por ejemplo 12)'); return; }
  }
  if(!tokens.has(id) || ordenManoEsta(id)) return;   // (mientras se elegía se fue, o ya entró)
  if(OrdenTurnos.campoAlSumar(t, vinculo(t)) === true && !ordenManoMarcable(t)){ toast(`${nombre} no se puede marcar para el orden de turnos`); return; }
  if(OrdenTurnos.campoAlSumar(t, vinculo(t)) === true && !(await ordenManoMarcar(id, true))) return;
  const e = OrdenTurnos.entrarConTirada(iniciativa, {id, valor}, {enCurso: OrdenTurnos.enCurso(iniciativa, modoMapa)});
  if(!e) return;
  const orden = tiro && tiro.sobre ? e.orden.map(o => o.id === id ? {...o, sobre: tiro.sobre} : o) : e.orden;
  if(!(await guardarIniciativa({orden: ordenSerial(orden), turno: e.turno, actuaron: e.actuaron, finRonda: e.finRonda, reubicar: e.reubicar, sacados: OrdenTurnos.sinSacado(iniciativa, id)}))) return;   // (si lo había sacado con la ✕, ya no)
  const publico = ordenManoPublico(id);
  if(tiro && publico) mesaPublicar(`Iniciativa · ${nombre}`, t.tipo === 'creep' ? {...tiro.r, desde: 'gm'} : {...tiro.r, ficha: String(t.fichaId).split(SEP_INVOCACION)[0]});
  const linea = `➕ ${nombre} entra al orden de turnos (lo sumó el GM) con ${fmt(valor)}: queda ${ordenDondeQueda(e)}.${e.yaPaso ? ' ' + ordenLineaFinRonda() : ''}`;
  if(publico) mesaLinea(linea, 'recordatorio');
  else toast(`${linea} (Los jugadores no lo ven: no va a la Mesa.)`);
}

/* ✕ Sacar de la tabla (2026-11-24, dueño, P328: «para quitar un token de la tabla, lo hace el GM desde la tabla misma»; el ➖ del token se sacó). La ✕
   de cada fila: sale con temporalFueraDelOrden (js/54: si era su turno, termina y empieza el del siguiente, con su «Empieza el turno»; antes la ✕ dejaba
   el turno en el siguiente sin su inicio), queda en `sacados` (Traer tokens no lo vuelve a traer hasta el ➕, Limpiar o el fin del combate) y, si
   tenía la marca `iniciativa: true`, vuelve a quedar afuera. Una línea en la Mesa si los jugadores lo ven. Sin confirmación, como la ✕ de siempre. */
async function ordenSacarDeTabla(id){
  if(!soyGM || !ordenManoEsta(id)) return;
  const t = tokens.get(id), nombre = t ? nombreDe(t) : 'Un token borrado';
  const publico = ordenManoPublico(id);
  iniciativa.sacados = OrdenTurnos.conSacado(iniciativa, id);   // (lo guarda la misma escritura que lo saca: guardarIniciativa conserva `sacados`)
  await temporalFueraDelOrden(id);
  if(t && OrdenTurnos.campoAlSacar(t) === false) await ordenManoMarcar(id, false);
  const linea = `➖ ${nombre} sale del orden de turnos (lo sacó el GM).`;
  if(publico) mesaLinea(linea, 'recordatorio');
  else if(t) toast(`${linea} (Los jugadores no lo ven: no va a la Mesa.)`);
}
