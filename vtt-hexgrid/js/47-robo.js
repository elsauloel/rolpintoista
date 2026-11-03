/* 🫳 Robar (2026-10-14, dueño: «tendríamos que desarrollar el robo, puede ser divertido»). Una habilidad con el efecto «Robo» en su
   Ejecución (dirigida, pegado al objetivo; el Ladrón del monte: Sigilo contra Percepción) le saca al personaje una unidad al azar de su
   cinturón (lo que publica su ficha: `resumen.cinturon`) y se la pasa al cinturón del ladrón: si lo matan, vuelve con el botín; si escapa, se
   la lleva; si es algo que se usa, la puede usar. A la ficha del robado le llega el aviso «Robo» (`EstadosAplicar.encolarPj`, item = el
   nombre) y descuenta esa unidad (`FichaAcciones.aplicarEstadoRecibido`). Después el ladrón se aleja hasta 3 casilleros sin ataque de
   oportunidad (el cartel del dodge roll, `dodgeBanner.robo`). Si viene en sigilo o por la espalda, +2 a su tirada (`roboBono`, js/13).
   **En sigilo es en secreto** (dueño, 2026-10-14: «que el defensor tenga que tirar su percepción, pero que no sepa para qué»): no se abre el
   duelo ni se anuncia en la Mesa (`CreepAcciones.roboEnSigilo`). El GM tira el Sigilo del ladrón sin mostrarlo; a la víctima le aparece
   «¿Sentiste un movimiento raro? Tirá Percepción» (un momento `robo-pedido`, que no va a la Crónica). Si el ladrón gana (o empata): «Mmm…
   puede que estés flasheando», el ítem pasa callado y sigue en sigilo; la víctima se da cuenta al empezar su próximo turno («sentís el
   cinturón más liviano…», `robosSinNotar` → `roboAvisoNotado`). Si pierde: «¡juan pescó a X metiendo mano en su cinturón!» — pierde el
   sigilo y queda Marcado 2 turnos (js/03).
   Desde el 2026-11-03 (dueño): también un personaje le roba a un creep (roboDeCreep: lo aplica el GM; a la ficha le llega «Robo ganado»), y con el
   cinturón vacío se lleva oro, 1d6 × el nivel del ladrón (roboOro: `oroRobado` / `oroPerdido` del creep, que lee el botín). La huida paga el movimiento,
   sin ataque de oportunidad; la de un personaje se le abre en su pantalla (momento `robo-huida`). La habilidad de fábrica: «Bolsillo ajeno». */
const ROBO_HUIDA = 3;
const esRobo = hab => !!(hab && (hab.efectos || []).some(e => e && /^robo$/i.test(String(e.nombre || (e.spec && e.spec.nombre) || '').trim())));
// ¿Está en el punto ciego del otro? (como porLaEspalda, js/13, pero sin pedir sigilo)
function enPuntoCiego(atq, def){
  if(!atq || !def) return false;
  const k = ((Math.round(num(def.rotacion || 0) / 60) % 6) + 6) % 6;
  const rot = k * 60 * Math.PI / 180, bx = Math.sin(rot), by = -Math.cos(rot);
  const a = hexCentro(atq.col, atq.fila), d = hexCentro(def.col, def.fila);
  const vx = a.x - d.x, vy = a.y - d.y, largo = Math.hypot(vx, vy);
  if(!largo) return false;
  return Math.acos(Math.max(-1, Math.min(1, (vx * bx + vy * by) / largo))) * 180 / Math.PI < VISION_CUNA_CIEGA - 1;
}
// El +2 del ladrón que viene en sigilo o por la espalda: una copia del ataque con la tirada corregida (o el mismo, si no corresponde).
function roboBono(ataque, mio, t){
  if(!ataque || !esRobo(ataque.hab) || !ataque.hab.tira || !ataque.hab.tira.stat || !mio || !t) return ataque;
  const porque = enSigilo(mio) ? 'en sigilo' : enPuntoCiego(mio, t) ? 'por la espalda' : '';
  if(!porque) return ataque;
  const tira = {...ataque.hab.tira, bono: num(ataque.hab.tira.bono) + 2, etq: `${ataque.hab.tira.etq || 'Tirada'} (+2 ${porque})`.slice(0, 30)};
  return {...ataque, hab: {...ataque.hab, tira}};
}
// Qué se lleva: una unidad al azar del cinturón publicado, sin contar lo ya robado que su ficha todavía no descontó. → {nombre} | {nada} | {manual, nota}
async function roboElegir(t){
  // 🫳 A un creep (2026-11-03, dueño: «personajes y creeps, no estaría mal»): una unidad al azar de su cinturón (lo lee el GM, que aplica el efecto).
  if(t.tipo === 'creep'){
    const sc = creepPrivadoDe(t.fichaId);
    if(!sc) return {manual: true, nota: `no se ve el cinturón de ${nombreDe(t)}: el robo, a mano`};
    const bolsa = (Array.isArray(sc.cinturon) ? sc.cinturon : []).flatMap(x => Array(Math.max(0, Math.min(20, Math.round(num(x && x.unidades))))).fill(x)).filter(x => x && x.nombre);
    if(!bolsa.length) return {nada: true};
    const x = bolsa[Math.floor(Math.random() * bolsa.length)];
    return {nombre: String(x.nombre), id: x.id};
  }
  if(t.tipo !== 'pj' || String(t.fichaId || '').includes(SEP_INVOCACION)) return {manual: true, nota: 'robarle a una invocación, por ahora a mano'};
  const f = fichasPub.get(t.fichaId), cin = f && f.resumen && Array.isArray(f.resumen.cinturon) ? f.resumen.cinturon : null;
  if(!cin) return {manual: true, nota: `no se ve el cinturón de ${nombreDe(t)} (que abra su ficha una vez): el robo, a mano`};
  const bolsa = cin.flatMap(x => Array(Math.max(0, Math.min(20, Math.round(num(x && x.u))))).fill(String((x && x.n) || '')).filter(Boolean));
  // Lo ya robado que su ficha todavía no descontó (el aviso sigue pendiente): no se puede robar dos veces la misma unidad.
  try{
    const pend = await fbDb.collection(fbRutaCampana('estados')).where('fichaId', '==', String(t.fichaId)).get();
    pend.docs.forEach(doc => {
      const x = doc.data(); if(x.aplicada) return;
      let sp = {}; try{ sp = JSON.parse(x.spec || '{}'); }catch(e){}
      const i = /^robo$/i.test(String(sp.nombre || '')) ? bolsa.indexOf(String(sp.item || '')) : -1;
      if(i >= 0) bolsa.splice(i, 1);
    });
  }catch(err){ console.error('No se pudieron mirar los robos pendientes:', err); }
  if(!bolsa.length) return {nada: true};
  return {nombre: bolsa[Math.floor(Math.random() * bolsa.length)]};
}
// Lo pasa: al cinturón del ladrón (si es un creep) y el aviso a la ficha del robado. `secreto`: se descuenta callado. → null | {manual, nota}
async function roboPasar(atacante, t, nombre, secreto){
  if(atacante.tipo === 'creep'){
    const cat = typeof CATALOGO_BASE !== 'undefined' ? CATALOGO_BASE.find(i => i.nombre === nombre && i.tipoItem === 'consumibles') : null;
    const base = cat || {nombre, tipoItem: 'consumibles', consumible: true, detalle: `Robado a ${nombreDe(t)}.`};
    try{
      await modificarCreep(atacante.ref, sc => {
        const r = CreepAcciones.alCinturon(sc, base, 1);
        if(r.error){   // con el cinturón lleno, igual se lo lleva (en los bolsillos)
          sc.cinturon = Array.isArray(sc.cinturon) ? sc.cinturon : [];
          sc.cinturon.push({...structuredClone(base), id: 'rb' + Math.random().toString(36).slice(2, 9), consumible: true, unidades: 1});
        }
        return {};
      });
    }catch(err){ console.error('No se pudo pasar lo robado al ladrón:', err); return {manual: true, nota: `no se pudo pasar ${nombre} al ladrón: hacelo a mano`}; }
  }
  try{ await EstadosAplicar.encolarPj({fichaId: t.fichaId, duenoUid: t.duenoUid, spec: {nombre: 'Robo', item: nombre, ...(secreto ? {secreto: true} : {})}, origen: atacante.nombre || 'Un ladrón'}); }
  catch(err){ console.error('No se pudo avisar el robo:', err); return {manual: true, nota: `sacale ${nombre} del cinturón a mano`}; }
  return null;
}
// El robo a la vista: el efecto «Robo» del duelo, aplicado por el GM (dueloAplicarEfecto, js/13).
async function roboAplicar(d, t){
  const e = await roboElegir(t);
  if(e.manual) return e;
  if(e.nada){
    // 💰 Con el cinturón vacío se lleva oro (2026-11-03, dueño: «si el cinturón está vacío, se lleva oro, 1d6 por nivel»).
    const n = roboOroCuanto(d.atacante);
    const mal = await roboOro(d.atacante, t, n, false);
    if(mal) return mal;
    momentoAbrir({tipo: 'robo', icono: '🫳', titulo: `${d.atacante.nombre} le robó a ${nombreDe(t)}`, resultado: `No tenía nada en el cinturón: se llevó oro (hasta ${n} DDE). Si lo atrapan, lo recuperan.`, estado: 'listo'});
    roboHuidaDe(d.atacante, d.id);
    return {nota: `le robó oro (1d6 × nivel: ${n} DDE)`};
  }
  const mal = t.tipo === 'creep' ? await roboDeCreep(d.atacante, t, e) : await roboPasar(d.atacante, t, e.nombre, false);
  if(mal) return mal;
  momentoAbrir({tipo: 'robo', icono: '🫳', titulo: `${d.atacante.nombre} le robó a ${nombreDe(t)}`, resultado: `Se llevó: ${e.nombre}. Si lo atrapan, lo recuperan.`, estado: 'listo'});
  roboHuidaDe(d.atacante, d.id);
  return {nota: `le robó ${e.nombre}`};
}
// 💰 Cuánto oro: 1d6 × el nivel del ladrón (un creep: su nivel; un personaje: el de su ficha).
function roboOroCuanto(atacante){
  let nivel = 1;
  try{
    if(atacante.tipo === 'creep'){ const sc = creepPrivadoDe(atacante.ref); nivel = Math.max(1, Math.round(num(sc && sc.nivel)) || 1); }
    else{ const f = fichasPub.get(atacante.ref); nivel = Math.max(1, Math.round(num(f && f.resumen && f.resumen.nivel)) || 1); }
  }catch(err){}
  return Combatiente.roboOro ? Combatiente.roboOro(nivel) : (1 + Math.floor(Math.random() * 6)) * nivel;
}
// 💰 Pasa el oro: de un personaje (el aviso a su ficha, que descuenta lo que tenga) a un creep (`oroRobado`, vuelve en el botín), o de un creep
// (`oroPerdido`, se le descuenta del botín) a un personaje (el aviso «Robo ganado»). `secreto`: el robado se entera al empezar su turno.
async function roboOro(atacante, t, n, secreto){
  try{
    if(t.tipo === 'creep'){
      await modificarCreep(t.fichaId, sc => { sc.oroPerdido = Math.max(0, num(sc.oroPerdido)) + n; return {}; });
      await EstadosAplicar.encolarPj({fichaId: atacante.ref, duenoUid: atacante.uid || '', spec: {nombre: 'Robo ganado', oro: n}, origen: `le robaste a ${nombreDe(t)}`});
      return null;
    }
    if(atacante.tipo === 'creep') await modificarCreep(atacante.ref, sc => { sc.oroRobado = Math.max(0, num(sc.oroRobado)) + n; return {}; });
    await EstadosAplicar.encolarPj({fichaId: t.fichaId, duenoUid: t.duenoUid, spec: {nombre: 'Robo', oro: n, ...(secreto ? {secreto: true} : {})}, origen: atacante.nombre || 'Un ladrón'});
    return null;
  }catch(err){ console.error('No se pudo pasar el oro robado:', err); return {manual: true, nota: `el oro robado (${n} DDE), a mano`}; }
}
// 🫳 Un personaje le roba a un creep: se le saca la unidad al creep (lo hace el GM) y le llega a la ficha del personaje («Robo ganado»).
async function roboDeCreep(atacante, t, e){
  try{
    await modificarCreep(t.fichaId, sc => {
      const lista = Array.isArray(sc.cinturon) ? sc.cinturon : [];
      const x = lista.find(i => i && (e.id ? i.id === e.id : i.nombre === e.nombre) && num(i.unidades) > 0) || lista.find(i => i && i.nombre === e.nombre && num(i.unidades) > 0);
      if(x){ x.unidades = num(x.unidades) - 1; if(x.unidades <= 0) sc.cinturon = lista.filter(i => i !== x); }
      return {};
    });
  }catch(err){ console.error('No se pudo sacar lo robado al creep:', err); return {manual: true, nota: `sacale ${e.nombre} al creep a mano`}; }
  if(atacante.tipo === 'pj'){
    try{ await EstadosAplicar.encolarPj({fichaId: atacante.ref, duenoUid: atacante.uid || '', spec: {nombre: 'Robo ganado', item: e.nombre}, origen: `le robaste a ${nombreDe(t)}`}); }
    catch(err){ console.error('No se pudo dar lo robado:', err); return {manual: true, nota: `dale ${e.nombre} al ladrón a mano`}; }
  }
  return null;
}
// La huida de quien robó: si es un creep, en esta pantalla (la del GM); si es un personaje, en la de su dueño (un momento que le abre el cartel).
// Paga el movimiento (dueño, 2026-11-03: «la huida no es gratis, pero no tiene ataque de oportunidad»).
function roboHuidaDe(atacante, id){
  if(atacante.tipo === 'creep' || (atacante.uid && fbUsuario && atacante.uid === fbUsuario.uid)){ roboHuida(atacante.tokenId, atacante.nombre, id); return; }
  momentoAbrir({tipo: 'robo-huida', icono: '🫳', titulo: `${atacante.nombre} se escapa con lo robado`, estado: 'listo',
    datos: {paraUid: atacante.uid || '', tokenId: atacante.tokenId, nombre: atacante.nombre || ''}});
}
function roboHuidaMomento(id, d){
  const dt = d.datos || {};
  if(!fbUsuario || dt.paraUid !== fbUsuario.uid || roboHuidasVistas.has(id)) return;
  roboHuidasVistas.add(id);
  const t0 = d.creado && d.creado.toMillis ? d.creado.toMillis() : Date.now();
  if(Date.now() - t0 > 60000) return;
  roboHuida(dt.tokenId, dt.nombre, id);
}
const roboHuidasVistas = new Set();
// La huida: el cartel del dodge roll para el ladrón (en la pantalla que aplica el efecto: la del GM, que maneja al creep).
function roboHuida(tid, nombre, id){
  if(!tid || !tokens.has(tid)) return;
  seleccionar(tid);
  dodgeBanner = {id: id || ('robo' + Date.now()), tokenId: tid, nombre, libre: true, robo: true, motivo: 'la huida del robo'};
  renderDodgeBanner();
}

/* ---------- 🫳 El robo en sigilo, en secreto ---------- */
const roboSecretos = new Map();   // momentoId → {ladron: {ref, tipo, nombre, tokenId}, victimaId, victima, sigilo, bono, resuelto, resultado}
// ¿Va por el camino secreto? Un creep en sigilo que le roba a un personaje (no a una invocación).
function roboSecretoSi(ataque, mio, t){
  return !!(ataque && ataque.hab && esRobo(ataque.hab) && mio && mio.tipo === 'creep' && enSigilo(mio) && t && t.tipo === 'pj' && !String(t.fichaId || '').includes(SEP_INVOCACION));
}
async function roboSecretoIniciar(yo, ataque, mio, t){
  const sc = creepPrivadoDe(mio.fichaId);
  const tira = ataque.hab.tira || {};
  const stat = tira.stat || 'sigilo', bono = num(tira.bono);
  const valor = (sc ? num(CreepCalculo.statValor(sc, stat)) : 0) + bono;
  const r = Combatiente.tirarStat(valor, (sc && sc.estados) || [], stat);   // no va a la Mesa: lo delataría
  const ladron = {ref: mio.fichaId, tipo: 'creep', nombre: (sc && sc.nombre) || yo.nombre || nombreDe(mio), tokenId: mio.id};
  const id = await momentoAbrir({tipo: 'robo-pedido', icono: '🤨', titulo: '¿Sentiste un movimiento raro?', estado: 'tirando', resuelve: t.duenoUid || '',
    datos: {paraUid: t.duenoUid || '', victimaId: t.id}});
  if(!id){ toast('No se pudo pedir la Percepción (¿faltan publicar las reglas?): el robo, a mano'); return; }
  roboSecretos.set(id, {ladron, victimaId: t.id, victima: nombreDe(t), sigilo: r ? r.total : 0, bono, resuelto: false, resultado: ''});
  roboGMDibujar(id);
}
// El cartel del GM: el Sigilo del ladrón y la espera de la Percepción (con «Tirar por …» si el jugador no está).
function roboGMDibujar(id){
  const s = roboSecretos.get(id);
  if(!s){ AvisoCombate.cartel('robo-gm', null); return; }
  const cerrar = () => { roboSecretos.delete(id); AvisoCombate.cartel('robo-gm', null); };
  if(s.resuelto){
    AvisoCombate.cartel('robo-gm', {icono: '🫳', titulo: `Robo en secreto · ${s.ladron.nombre} → ${s.victima}`, texto: s.resultado, botones: [{texto: 'Listo', alClic: cerrar}]});
    return;
  }
  AvisoCombate.cartel('robo-gm', {icono: '🫳', titulo: `Robo en secreto · ${s.ladron.nombre} → ${s.victima}`,
    pasos: [{titulo: 'Sigilo del ladrón (solo lo ves vos)', texto: `${s.ladron.nombre} sacó ${s.sigilo}${s.bono ? ` (con +${s.bono} por venir en sigilo)` : ''}.`},
      {titulo: `Percepción de ${s.victima}`, texto: `Esperando que tire (no sabe para qué: le aparece «¿Sentiste un movimiento raro?»). Para pillarlo tiene que sacar más de ${s.sigilo}.`, espera: true}],
    botones: [{texto: `🎲 Tirar por ${s.victima}`, sec: true, alClic: () => roboTirarPercepcion(id, s.victimaId, true)}, {texto: 'Cancelar el robo', sec: true, alClic: () => { momentoActualizar(id, {estado: 'listo', resultado: 'cancelado'}); cerrar(); }}]});
}
// La Percepción de la víctima (la tira su jugador o, si no está, el GM por él): la normal, y sale en la Mesa como una Percepción cualquiera.
async function roboTirarPercepcion(id, victimaId, porGM){
  const t = tokens.get(victimaId);
  if(!t) return;
  try{ await bnCargarPiezas(); }catch(err){ console.error(err); toast('No se pudo tirar Percepción'); return; }
  const f = fichasPub.get(t.fichaId);
  const valor = f && f.resumen ? num(f.resumen.percepcion) : 0;
  const r = FichaBotonera.tiradaPercepcionValor(valor, false);
  if(!r){ toast('Percepción: sin valor para tirar (abrí la ficha una vez para que lo publique)'); return; }
  const nombre = nombreDe(t);
  try{ mesaPublicar(`${nombre} · Percepción`, {...r, quien: nombre, ficha: t.fichaId}); }catch(err){}
  if(roboVictima && roboVictima.id === id){ roboVictima.total = r.total; roboVictimaDibujar(); }
  if(porGM && roboSecretos.has(id)){ await roboResolver(id, r.total); return; }
  await momentoActualizar(id, {estado: 'esperandoGM', datos: {paraUid: t.duenoUid || '', victimaId, percepcion: r.total}});
}
// En la pantalla del GM que lo empezó: compara y hace lo que corresponde. Empate: gana el ladrón (como la detección del sigilo).
async function roboResolver(id, percepcion){
  const s = roboSecretos.get(id);
  if(!s || s.resuelto) return;
  s.resuelto = true;
  const t = tokens.get(s.victimaId);
  if(num(percepcion) > s.sigilo){
    // Lo pescan (dueño: «pescó es una forma muy nuestra de decir que alguien fue descubierto»): pierde el sigilo (y queda Marcado 2 turnos,
    // js/03) y se cuenta para todos.
    await romperSigilo(s.ladron.tokenId, s.victima, `¡${s.victima} pescó a ${s.ladron.nombre} metiendo mano en su cinturón!`);
    s.resultado = `${s.victima} lo pescó (Percepción ${percepcion} contra Sigilo ${s.sigilo}): ${s.ladron.nombre} perdió el sigilo y queda Marcado.`;
    await momentoActualizar(id, {estado: 'listo', resultado: 'pillado', datos: {paraUid: (t && t.duenoUid) || '', victimaId: s.victimaId, pillado: true, ladron: s.ladron.nombre}});
  }else{
    const e = t ? await roboElegir(t) : {manual: true, nota: 'la víctima ya no está en el mapa'};
    let nota = '';
    if(e.manual) nota = `✋ ${e.nota}.`;
    else if(e.nada){
      const n = roboOroCuanto(s.ladron), mal = await roboOro(s.ladron, t, n, true);
      nota = mal ? `✋ ${mal.nota}.` : `No tenía nada en el cinturón: se llevó oro (hasta ${n} DDE). Sigue en sigilo; ${s.victima} se da cuenta al empezar su próximo turno.`;
      if(!mal) e.oro = n;
    }
    else{ const mal = await roboPasar(s.ladron, t, e.nombre, true); nota = mal ? `✋ ${mal.nota}.` : `Se llevó: ${e.nombre}. Sigue en sigilo; ${s.victima} se da cuenta al empezar su próximo turno.`; }
    s.resultado = `No lo vio (Percepción ${percepcion} contra Sigilo ${s.sigilo}). ${nota}`;
    await momentoActualizar(id, {estado: 'listo', resultado: 'flasheando', datos: {paraUid: (t && t.duenoUid) || '', victimaId: s.victimaId, pillado: false}});
    if(e.nombre || e.oro) roboHuida(s.ladron.tokenId, s.ladron.nombre, id);
  }
  roboGMDibujar(id);
}
// El cartel de la víctima: «¿Sentiste un movimiento raro?» → su Percepción → la respuesta, sin decir para qué era.
let roboVictima = null;   // {id, victimaId, total, resultado}
function roboMomento(id, d){
  const dt = d.datos || {};
  if(d.estado === 'esperandoGM' && roboSecretos.has(id)){ roboResolver(id, dt.percepcion); return; }
  if(dt.paraUid !== fbUsuario.uid) return;
  if(d.estado === 'tirando' && (!roboVictima || roboVictima.id !== id) && !(roboSecretos.has(id) && soyGM && !tokenEsMioRobo(dt.victimaId))){
    roboVictima = {id, victimaId: dt.victimaId, total: null, resultado: ''};
    roboVictimaDibujar();
  }
  if(d.estado === 'listo' && roboVictima && roboVictima.id === id && !roboVictima.resultado){
    roboVictima.resultado = d.resultado === 'cancelado' ? 'Nada. Debe haber sido el viento.'
      : dt.pillado ? `¡Lo pescaste! ${dt.ladron || 'Alguien'} te estaba metiendo mano en el cinturón.` : 'Mmm… Puede que estés flasheando.';
    roboVictimaDibujar();
  }
}
const tokenEsMioRobo = id => { const t = tokens.get(id); return !!(t && t.duenoUid === fbUsuario.uid); };
function roboVictimaDibujar(){
  const v = roboVictima;
  if(!v){ AvisoCombate.cartel('robo-victima', null); return; }
  const t = tokens.get(v.victimaId), quien = t ? nombreDe(t) : '';
  if(v.resultado){
    AvisoCombate.cartel('robo-victima', {icono: '🤨', titulo: `${quien}: Percepción ${v.total !== null ? v.total : ''}`.trim(), texto: v.resultado,
      botones: [{texto: 'Listo', alClic: () => { roboVictima = null; roboVictimaDibujar(); }}]});
  }else if(v.total !== null){
    AvisoCombate.cartel('robo-victima', {icono: '🤨', titulo: `${quien}: Percepción ${v.total}`, texto: 'A ver…'});
  }else{
    AvisoCombate.cartel('robo-victima', {icono: '🤨', titulo: '¿Sentiste un movimiento raro?', texto: `${quien}, tirá Percepción.`,
      botones: [{texto: '🎲 Tirar Percepción', alClic: () => roboTirarPercepcion(v.id, v.victimaId, false)}]});
  }
}
// Al empezar su próximo turno (o en el ⟳), el robado se da cuenta: el Aviso al centro para quien lo maneja y la Crónica para el resto.
function roboAvisoNotado(fichaId, robos){
  const t = [...tokens.values()].find(x => x && x.tipo === 'pj' && x.fichaId === fichaId);
  const f = fichasPub.get(fichaId);
  const nombre = t ? nombreDe(t) : ((f && f.nombre) || 'Alguien');
  const texto = FichaMantenimiento.robosTexto(robos);
  momentoAbrir({tipo: 'robo-notado', icono: '🫳', titulo: `${nombre} siente el cinturón más liviano`, resultado: `…le falta: ${robos.join(', ')}.`, estado: 'listo',
    datos: {paraUid: (t && t.duenoUid) || (f && f.duenoUid) || '', aviso: true, boton: 'Entendido', pasos: [{titulo: 'Te robaron', texto}]}});
}
