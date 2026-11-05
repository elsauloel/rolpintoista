/* 🎺🔄🥁🩸🐈‍⬛ EL ORDEN DE TURNOS, A FAVOR O EN CONTRA (2026-11-05, dueño). Un solo lugar para todo lo que sube o baja a alguien en la iniciativa
   por estas habilidades, pasivas y estados (las reglas puras, en comun/orden-turnos.js):
   - 🎺 Toque de carga (Support): un aliado (o vos) sube 1 lugar. Si ya jugó esta ronda, sube al empezar la próxima.
   - 🔄 Cambio de guardia (Support): dos aliados cualesquiera cambian de lugar desde la próxima ronda.
   - 🥁 Marcar el ritmo (pasiva): al empezar la ronda, UN aliado pegado a vos (el que está más atrás en el orden) sube 1.
   - 🩸 Sed de sangre (pasiva): cuando un rival cae por tu golpe, subís 2 (si ya jugaste, al empezar la próxima ronda).
   - 🐈‍⬛ Mufa (estado del Debuffer, «Echar la mufa»): al empezar la ronda, los rivales de quien la lleva que están pegados a él tiran Res.Mt contra el
     Efecto especial de quien la echó; el que pierde baja 1.
   Reglas: nadie juega dos veces en la misma ronda; subir y bajar se cancelan; como mucho un efecto de orden por personaje y por ronda.
   Todo lo escribe la pantalla del GM (es la que escribe el turno): si lo pide otra pantalla, va como un momento `orden-pedido` (estado
   'esperandoGM') que la pantalla del GM toma (js/16 → ordenPedidoDelGM). Lo que queda para la ronda que viene y la Mufa, en el documento de la
   iniciativa: `ordenPendientes` [{tipo: 'sube', id, n, por} | {tipo: 'cambio', a, b, por}], `ordenUsados` {ronda, ids}, `mufas` {portador: {de, esp, por}}. */

const ordenNombre = id => { const t = tokens.get(id); return !t ? 'alguien' : (!t.oculto && (t.tipo === 'creep' ? creepConocido(t) : !enSigilo(t))) ? nombreDe(t) : 'Alguien'; };
const ordenEstadoActual = () => ({orden: iniciativa.orden.map(o => o.id), turno: iniciativa.libre ? -1 : iniciativa.turno, actuaron: iniciativa.actuaron || []});
const ordenUsadosRonda = () => (iniciativa.ordenUsados && num(iniciativa.ordenUsados.ronda) === num(iniciativa.ronda)) ? (iniciativa.ordenUsados.ids || []) : [];
// El orden con los objetos de siempre ({id, valor, oculto}), a partir de la lista de ids.
const ordenDeIds = (ids, base) => { const m = new Map((base || iniciativa.orden).map(o => [o.id, o])); return ids.map(id => m.get(id)).filter(Boolean); };
const ordenEstados = t => { const v = vinculo(t); return (v && v.resumen && Array.isArray(v.resumen.estados)) ? v.resumen.estados : []; };
const ordenTieneEstado = (t, nombre) => ordenEstados(t).some(e => e && e.activo !== false && String(e.nombre || '').toLowerCase() === nombre.toLowerCase());
const ordenPasiva = (t, campo, statCreep) => {
  if(!t) return 0;
  if(t.tipo === 'creep'){ const sc = typeof creepPrivadoDe === 'function' ? creepPrivadoDe(t.fichaId) : null; return sc ? num(CreepCalculo.modTotal(sc, statCreep)) : 0; }
  if(String(t.fichaId || '').includes(SEP_INVOCACION)) return 0;
  const f = fichasPub.get(t.fichaId); return f && f.resumen ? num(f.resumen[campo]) : 0;
};
const ordenPegados = (t, cond) => [...tokens.entries()].filter(([, x]) => x !== t && distanciaHex(x, t) === 1 && cond(x)).map(([id]) => id);

// ⏫⏬ Lo que ve la mesa: la Crónica (y el Aviso a quien juega con ese personaje, si baja). La lista de turnos se anima en todas las pantallas (js/100).
function ordenAvisar(c, por, motivo){
  if(typeof momentoAbrir !== 'function') return;
  const sube = c.hasta < c.desde, k = Math.abs(c.hasta - c.desde), lug = `${k} lugar${k === 1 ? '' : 'es'}`, quien = ordenNombre(c.id);
  const txt = `${sube ? 'Sube' : 'Baja'} ${lug}${motivo ? ` (${motivo})` : ''}: ahora está ${c.hasta + 1}.º (estaba ${c.desde + 1}.º).`;
  const t = tokens.get(c.id), creep = t && t.tipo === 'creep';
  const f = t && !creep ? fichasPub.get(String(t.fichaId || '').split(SEP_INVOCACION)[0]) : null;
  const para = !sube && t && !creep ? ((f && f.resumen && f.resumen.control) || t.duenoUid || '') : '';
  momentoAbrir({tipo: 'demora', icono: sube ? '⏫' : '⏬', titulo: `${quien} ${sube ? 'sube' : 'baja'} en el orden de turnos${por ? ` · ${por}` : ''}`, resultado: txt, estado: 'listo',
    datos: {demoraToken: c.id, ...(sube ? {adelantoMovio: true} : {demoraMovio: true}), ...(para ? {paraUid: para, aviso: true, boton: 'Entendido',
      pasos: [{titulo: `⏬ Bajaste en el orden de turnos`, texto: `${por ? por + ': ' : ''}bajás ${lug}; ahora estás ${c.hasta + 1}.º (estabas ${c.desde + 1}.º).`}],
      veredicto: {tono: 'malo', grande: 'Baja en el orden', chico: `${c.hasta + 1}.º en el orden de turnos`}} : {chico: true})}});
}

// ---------- pedir: la pantalla del GM lo hace; otra pantalla se lo pide ----------
async function ordenPedir(op){
  if(soyGM) return ordenEjecutar(op);
  if(typeof momentoAbrir !== 'function') return {manual: true, nota: 'que lo haga el GM a mano'};
  await momentoAbrir({tipo: 'orden-pedido', icono: '🎺', titulo: op.por ? `${op.por}: el orden de turnos` : 'El orden de turnos', estado: 'esperandoGM', datos: {op, chico: true}});
  return {nota: 'lo acomoda la pantalla del GM en el orden de turnos'};
}
const ordenPedidosHechos = new Set();
async function ordenPedidoDelGM(id, d){   // la pantalla del GM (js/16 momentoRecibido)
  if(!soyGM || ordenPedidosHechos.has(id)) return;
  ordenPedidosHechos.add(id);
  const ref = coleccionMomentos().doc(id);
  let tomado = false;
  try{ await fbDb.runTransaction(async tx => { const s = await tx.get(ref); if(!s.exists || s.data().estado !== 'esperandoGM') return; tx.update(ref, {estado: 'pasando'}); tomado = true; }); }
  catch(err){ console.error('No se pudo tomar el pedido del orden de turnos:', err); return; }
  if(!tomado) return;
  let r = null;
  try{ r = await ordenEjecutar((d.datos || {}).op || {}); }catch(err){ console.error('Orden de turnos:', err); }
  momentoActualizar(id, {estado: 'listo', resultado: (r && r.nota) || 'Listo.'});
}
async function ordenEjecutar(op){
  if(!op || !op.tipo) return {manual: true, nota: 'nada que hacer'};
  if(op.tipo === 'sube') return ordenSubir(op.id, op.n || 1, op.por || '', op.motivo || '');
  if(op.tipo === 'cambio') return ordenCambioPendiente(op.a, op.b, op.por || '');
  if(op.tipo === 'mufa') return ordenMufaAnotar(op.portador, op.de, op.esp, op.por || '');
  return {manual: true, nota: 'pedido desconocido'};
}

// ---------- 🎺 subir (Toque de carga, Sed de sangre) ----------
async function ordenSubir(id, n, por, motivo){
  if(!iniciativa.orden.some(o => o.id === id)) return {manual: true, nota: 'no está en el orden de turnos: a mano'};
  const usados = ordenUsadosRonda();
  if(usados.includes(id)) return {nota: `${ordenNombre(id)} ya tuvo su efecto de orden esta ronda: no se mueve`};
  const st = ordenEstadoActual();
  if(OrdenTurnos.yaJugo(st, id) || st.orden.indexOf(id) === st.turno){
    const pend = [...(iniciativa.ordenPendientes || []), {tipo: 'sube', id, n: Math.round(num(n)) || 1, por: String(por || '').slice(0, 40), motivo: String(motivo || '').slice(0, 40)}].slice(-30);
    if(!(await guardarIniciativa({ordenPendientes: pend}))) return {manual: true, nota: 'no se pudo anotar: subilo a mano en la próxima ronda'};
    mesaLinea(`⏫ ${ordenNombre(id)} sube ${n} lugar${n == 1 ? '' : 'es'} al empezar la próxima ronda${por ? ` (${por})` : ''}: ya jugó esta.`, 'recordatorio');
    return {nota: `ya jugó esta ronda: sube ${n} al empezar la próxima`};
  }
  const r = OrdenTurnos.aplicar(st, [{id, delta: Math.round(num(n)) || 1}], usados);
  if(!r.cambios.length) return {nota: (r.saltados[0] && r.saltados[0].motivo) || 'no se mueve'};
  const ok = await guardarIniciativa({orden: ordenSerial(ordenDeIds(r.st.orden)), turno: r.st.turno >= 0 ? r.st.turno : iniciativa.turno, actuaron: r.st.actuaron,
    ordenUsados: {ronda: iniciativa.ronda, ids: r.usados}});
  if(!ok) return {manual: true, nota: 'no se pudo mover en el orden de turnos: a mano'};
  r.cambios.forEach(c => ordenAvisar(c, por, motivo));
  const c = r.cambios[0];
  return {nota: `sube ${Math.abs(c.hasta - c.desde)} en el orden de turnos (${c.desde + 1}.º → ${c.hasta + 1}.º)`};
}

// ---------- 🔄 Cambio de guardia ----------
async function ordenCambioPendiente(a, b, por){
  if(!a || !b || a === b) return {manual: true, nota: 'tienen que ser dos distintos'};
  const pend = [...(iniciativa.ordenPendientes || []), {tipo: 'cambio', a, b, por: String(por || '').slice(0, 40)}].slice(-30);
  if(!(await guardarIniciativa({ordenPendientes: pend}))) return {manual: true, nota: 'no se pudo anotar: cambialos a mano en la próxima ronda'};
  mesaLinea(`🔄 ${por || 'Cambio de guardia'}: ${ordenNombre(a)} y ${ordenNombre(b)} cambian de lugar en el orden de turnos al empezar la próxima ronda.`, 'recordatorio');
  return {nota: 'cambian de lugar al empezar la próxima ronda'};
}
// Lo pide quien usó la habilidad (su ficha → el mapa): se eligen los dos aliados con un clic, como la Transfusión (js/45).
async function cambioGuardiaDeHabilidad(msg){
  const yo = [...tokens.entries()].find(([, t]) => t.fichaId === msg.fichaId && t.tipo === 'pj');
  if(!yo){ toast(`${msg.nombre}: tu token no está en el mapa — cambialos a mano`); return; }
  let rango = 0;
  try{ rango = Math.round(num(rangoDeToken(yo[1]).rng)) || 0; }catch(e){}
  const elegir = texto => new Promise(res => elegirDestino(c => res(c), texto, true, () => res(null)));
  const pedir = async paso => {
    const c = await elegir(`<b>🔄 ${esc(msg.nombre)}: ${paso}</b> <span>clic sobre un aliado (vos también) a ${rango} casilleros o menos · Esc cancela</span>`);
    if(!c) return null;
    const e = [...tokens.entries()].find(([, t]) => t.col === c.col && t.fila === c.fila && t.tipo === 'pj');
    if(!e){ toast('Ahí no hay un aliado: elegí uno de tu equipo'); return pedir(paso); }
    if(!iniciativa.orden.some(o => o.id === e[0])){ toast(`${nombreDe(e[1])} no está en el orden de turnos`); return pedir(paso); }
    if(rango && distanciaHex(yo[1], e[1]) > rango) toast(`${nombreDe(e[1])} está fuera de tu Rango (${rango}): va igual, lo decide la mesa`);
    return e[0];
  };
  const a = await pedir('el primero');
  if(!a){ mesaLinea(`🔄 ${msg.nombre}: se canceló (el costo ya se pagó)`, 'recordatorio'); return; }
  const b = await pedir(`el segundo (cambia de lugar con ${nombreDe(tokens.get(a))})`);
  if(!b || b === a){ if(b === a) toast('Tienen que ser dos distintos'); mesaLinea(`🔄 ${msg.nombre}: se canceló (el costo ya se pagó)`, 'recordatorio'); return; }
  const r = await ordenPedir({tipo: 'cambio', a, b, por: msg.nombre});
  if(r && r.nota) toast(`${msg.nombre}: ${r.nota}`);
}

// ---------- 🐈‍⬛ la Mufa ----------
async function ordenMufaAnotar(portador, de, esp, por){
  if(!portador) return {manual: true, nota: 'a mano'};
  const mufas = {...(iniciativa.mufas || {})};
  mufas[portador] = {de: String(de || ''), esp: Math.max(0, Math.round(num(esp))), por: String(por || '').slice(0, 40)};
  if(!(await guardarIniciativa({mufas}))) return {manual: true, nota: 'no se pudo anotar la Mufa: al empezar la ronda, a mano'};
  return {nota: 'al empezar cada ronda, los rivales pegados a quien la lleva tiran Res.Mt'};
}
// La llama dueloAplicarEfectoBase (js/13) cuando entra el estado Mufa.
async function ordenMufaPoner(d){
  const de = d.atacante && d.atacante.tokenId, port = d.defensor && d.defensor.tokenId;
  const ta = de ? tokens.get(de) : null;
  const esp = ta ? trampaValorStat(ta, 'dmgesp') : 0;
  return ordenPedir({tipo: 'mufa', portador: port, de, esp, por: (d.atacante && d.atacante.nombre) || ''});
}
// Una tirada de un stat de un token (el valor publicado: la ficha o el creep), como las de las zonas. → {total, formula}
function ordenTirarValor(valor){
  const formula = formulaParaValor(Math.max(0, Math.round(num(valor))));
  const r = tirarDados(formula);
  return {total: r ? num(r.total) : Math.max(0, Math.round(num(valor))), formula};
}

// ---------- 🩸 Sed de sangre (la llama dueloAplicarDano, js/13, cuando el golpe lo deja en 0) ----------
async function ordenSedDeSangre(d){
  const atk = d.atacante && d.atacante.tokenId, def = d.defensor && d.defensor.tokenId;
  const ta = atk ? tokens.get(atk) : null, td = def ? tokens.get(def) : null;
  if(!ta || !td || !dueloEsRival(ta, td)) return;
  const n = ordenPasiva(ta, 'sedSangre', 'sedsangre');
  if(!(n > 0)) return;
  const r = await ordenPedir({tipo: 'sube', id: atk, n, por: 'Sed de sangre', motivo: `voltear a ${ordenNombre(def)}`});
  if(r && r.nota) mesaLinea(`🩸 Sed de sangre: ${ordenNombre(atk)} — ${r.nota}`, 'recordatorio');
}

/* ---------- al empezar la ronda (js/04 iniciativaSiguiente, la pantalla del GM, antes de guardar la ronda nueva) ----------
   `ordenIds` = el orden ya cerrado (con la Demora aplicada). → {ordenIds, lineas, cambios, usados, pendientes: [], mufas} o null si no hay nada. */
async function ordenInicioRonda(ordenIds){
  const pend = iniciativa.ordenPendientes || [];
  // Las Mufas que siguen: quien la lleva todavía tiene el estado.
  const mufas = Object.fromEntries(Object.entries(iniciativa.mufas || {}).filter(([id]) => { const t = tokens.get(id); return t && ordenTieneEstado(t, 'Mufa'); }));
  const conRitmo = ordenIds.filter(id => ordenPasiva(tokens.get(id), 'ritmo', 'ritmo') > 0);
  if(!pend.length && !Object.keys(mufas).length && !conRitmo.length && !Object.keys(iniciativa.mufas || {}).length) return null;
  let st = {orden: ordenIds.slice(), turno: -1, actuaron: []}, usados = [];
  const lineas = [], cambios = [];
  // 1) los Cambios de guardia (cada uno cuenta como el efecto de los dos)
  for(const p of pend.filter(x => x.tipo === 'cambio')){
    const r = OrdenTurnos.intercambiar(st, p.a, p.b, usados);
    usados = r.usados;
    if(r.cambio){ st = r.st; lineas.push(`🔄 ${p.por || 'Cambio de guardia'}: ${ordenNombre(p.a)} (${r.cambio.desdeA + 1}.º) y ${ordenNombre(p.b)} (${r.cambio.desdeB + 1}.º) cambian de lugar.`);
      cambios.push({id: p.a, desde: r.cambio.desdeA, hasta: r.cambio.desdeB, por: p.por}, {id: p.b, desde: r.cambio.desdeB, hasta: r.cambio.desdeA, por: p.por}); }
    else lineas.push(`🔄 ${p.por || 'Cambio de guardia'}: ${ordenNombre(p.a)} y ${ordenNombre(p.b)} no cambian (${r.nota}).`);
  }
  // 2) lo que sube o baja: lo que quedó de la ronda pasada, Marcar el ritmo y la Mufa (con su tirada)
  const movs = [], porQue = new Map();
  const anotar = (id, delta, motivo) => { movs.push({id, delta}); porQue.set(id, [...(porQue.get(id) || []), motivo]); };
  pend.filter(x => x.tipo === 'sube').forEach(p => anotar(p.id, Math.round(num(p.n)) || 1, p.por || 'de la ronda pasada'));
  for(const id of conRitmo){
    const t = tokens.get(id), k = ordenPasiva(t, 'ritmo', 'ritmo');
    // UN solo aliado pegado (dueño, 2026-11-05: «no es todos los aliados, sino un aliado adyacente»): el que está más atrás en el orden.
    const pegados = ordenPegados(t, x => !dueloEsRival(t, x) && ordenIds.includes(idDeToken(x)));
    const uno = pegados.sort((a, b) => ordenIds.indexOf(idDeToken(b)) - ordenIds.indexOf(idDeToken(a)))[0];
    if(uno) anotar(uno, k, `Marcar el ritmo de ${ordenNombre(id)}`);
  }
  for(const [port, m] of Object.entries(mufas)){
    const t = tokens.get(port);
    for(const r of ordenPegados(t, x => dueloEsRival(t, x) && ordenIds.includes(idDeToken(x)))){
      const tr = tokens.get(r), res = ordenTirarValor(trampaValorStat(tr, 'resm')), ef = ordenTirarValor(m.esp);
      const pierde = res.total < ef.total;
      mesaLinea(`🐈‍⬛ Mufa de ${ordenNombre(port)}: ${ordenNombre(r)} tira Res.Mt ${res.total} (${res.formula}) contra el Efecto especial ${ef.total} (${ef.formula})${m.por ? ` de ${m.por}` : ''} → ${pierde ? 'pierde: baja 1 lugar' : 'aguanta'}.`, 'recordatorio');
      if(pierde) anotar(r, -1, `la Mufa de ${ordenNombre(port)}`);
    }
  }
  const r = OrdenTurnos.aplicar(st, movs, usados);
  st = r.st; usados = r.usados;
  for(const c of r.cambios){
    const k = Math.abs(c.hasta - c.desde);
    lineas.push(`${c.delta > 0 ? '⏫' : '⏬'} ${ordenNombre(c.id)} ${c.delta > 0 ? 'sube' : 'baja'} ${k} lugar${k === 1 ? '' : 'es'} (${c.desde + 1}.º → ${c.hasta + 1}.º): ${(porQue.get(c.id) || []).join(', ')}.`);
    cambios.push({...c, por: (porQue.get(c.id) || [])[0] || ''});
  }
  for(const s of r.saltados){ if(porQue.has(s.id)) lineas.push(`${ordenNombre(s.id)} no se mueve (${s.motivo}).`); }
  return {ordenIds: st.orden, lineas, cambios, usados, mufas};
}
// (idDeToken: js/04)
