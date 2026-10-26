/* ---------- 🐂 Tomar carrera (2026-10-21, dueño, la Cornada de las bestias) ----------
   «Si es cuerpo a cuerpo, tira para atrás uno… Si toma carrera, suma a la probabilidad de golpe, al daño y al desplazamiento hacia atrás»; «1 por cada
   casillero recorrido: al lado +1 y +1, con un casillero en el medio +2 y +2, con dos +3 y +3; la distancia de la embestida también determina cuán
   lejos para atrás lo empuja». Una Ejecución «con tu arma» con `embestida` (→ `ataque.embestidaHab`): al elegir el objetivo, si no está al lado, el
   creep corre en línea recta (`lineaHex`) hasta quedar al lado, pagando lo que cuesta moverse (1 No2 por casillero; Rengo, 2), y el ataque suma +1 PdG,
   +1 al daño y +1 casilla de empuje por cada casillero que corrió. Si no hay línea recta libre (un Sólido, una pared, otro token) o no se puede mover,
   avisa y deja atacar igual sin la carrera. Lo llama `dueloElegirObjetivoMapa` (js/13). → el ataque (con los bonos) o null (elegir otro). */
/* ---------- 🦘 El Salto (2026-10-21, dueño: «se saltea hasta dos casilleros, es decir, que se desplaza tres»; «un salto de 1,5 metros de altura») ----------
   Una Ejecución «con tu arma» con `salto` (→ `ataque.saltoHab` = hasta cuántos casilleros se desplaza): al elegir el objetivo, el creep salta por encima de
   lo que haya hasta una casilla libre pegada al objetivo, a `saltoHab` o menos. Sin No2 y sin ataque de oportunidad. Si el salto pasa por encima de algo
   con colisión (una pared, un Sólido), pregunta si puede saltarlo (lo decide la mesa). Con `aplasta` (Salto aplastante): al caer, los rivales pegados a
   donde cayó tiran Res.CC contra su Fuerza; quien no llega queda Sentado. Si ya está al lado, ataca sin saltar; si no llega o no hay dónde caer, avisa y
   deja atacar igual. → true para seguir, null para elegir otro. */
// 💥 `ataque.corre` (2026-10-26, el Takle): no salta, corre — no pasa por encima de paredes ni Sólidos (esas casillas no sirven), y los textos dicen «corre».
async function saltoHab(mio, t, ataque, yo){
  const n = Math.round(num(ataque.saltoHab)), dist = distanciaHex(mio, t), nom = nombreDe(mio), obj = nombreDe(t), corre = !!ataque.corre;
  if(dist <= 1){ if(ataque.saltoAplasta) await saltoAplastar(mio, yo); return true; }
  const ocupada = c => elementoSolidoEn(c.col, c.fila) || [...tokens.entries()].some(([id, x]) => id !== mio.id && x.col === c.col && x.fila === c.fila && !x.bajoTierra);
  const choca = c => lineaHex(mio, c).some((x, i, l) => elementoSolidoEn(x.col, x.fila) || (typeof paredCorta === 'function' && paredCorta(i ? l[i - 1] : mio, x)));
  const cand = vecinosDeCasilla(t).filter(c => !ocupada(c) && distanciaHex(mio, c) <= n && !(corre && choca(c))).sort((a, b) => (choca(a) - choca(b)) || (distanciaHex(mio, a) - distanciaHex(mio, b)));
  let caer = cand[0];
  if(!caer && corre){
    const motivo = dist - 1 > n ? `${obj} está muy lejos para la embestida (corre ${n} casilleros o menos)` : `no hay por dónde llegar al lado de ${obj}`;
    const si = await AvisoCombate.preguntar(`${motivo}. ¿Embestirlo igual sin correr? (lo decide la mesa)`, {icono: '💥', titulo: 'Sin carrera', si: 'Embestir igual', no: 'Elegir otro'});
    if(si) mesaLinea(`💥 ${nom} embiste a ${obj} sin correr (${motivo}; lo decidió la mesa)`, 'alerta-roja');
    return si ? true : null;
  }
  if(!caer){
    const motivo = dist - 1 > n ? `${obj} está muy lejos para el salto (cae a ${n} casilleros o menos)` : `no hay dónde caer al lado de ${obj}`;
    const si = await AvisoCombate.preguntar(`${motivo}. ¿Atacar igual sin saltar? (lo decide la mesa)`, {icono: '🦘', titulo: 'Sin salto', si: 'Atacar igual', no: 'Elegir otro'});
    if(si) mesaLinea(`🦘 ${nom} ataca a ${obj} sin saltar (${motivo}; lo decidió la mesa)`, 'alerta-roja');
    return si ? true : null;
  }
  if(choca(caer)){   // por encima de algo con colisión: lo decide la mesa (dueño, 2026-10-21)
    mesaLinea(`🦘 ${nom} quiere saltar por encima de algo con colisión (el salto es de 1,5 metros de altura): ¿puede? Lo decide la mesa`, 'alerta-roja');
    const si = await AvisoCombate.preguntar(`El salto de ${nom} pasa por encima de algo con colisión (una pared, un Sólido). El salto es de 1,5 metros de altura: ¿puede saltarlo? Lo decide la mesa.`,
      {icono: '🦘', titulo: '¿Puede saltarlo?', si: 'Sí, lo salta', no: 'No puede'});
    if(!si){
      const sinSaltar = await AvisoCombate.preguntar(`No lo salta. ¿Atacar a ${obj} igual sin saltar, o elegir otro objetivo?`, {icono: '🦘', titulo: 'Sin salto', si: 'Atacar igual', no: 'Elegir otro'});
      if(sinSaltar) mesaLinea(`🦘 ${nom} no pudo saltar: ataca a ${obj} sin saltar (lo decidió la mesa)`, 'alerta-roja');
      return sinSaltar ? true : null;
    }
    mesaLinea(`🦘 La mesa decidió que ${nom} sí puede saltarlo`, 'recordatorio');
  }
  const k = distanciaHex(mio, caer);
  await coleccionTokens().doc(mio.id).update({col: caer.col, fila: caer.fila, rotacion: rotacionDePaso(hexCentro(caer.col, caer.fila), hexCentro(t.col, t.fila)), ruta: firebase.firestore.FieldValue.delete()});
  if(typeof marcarMovido === 'function') marcarMovido(mio.id);
  mio.col = caer.col; mio.fila = caer.fila;
  const txt = corre ? `${nom} corre ${k} casillero${k === 1 ? '' : 's'} (gratis, sin ataques de oportunidad) y se le tira encima a ${obj}.` : `${nom} salta ${k} casillero${k === 1 ? '' : 's'} y cae al lado de ${obj}.`;
  mesaLinea(`${corre ? '💥' : '🦘'} ${txt}`, 'recordatorio');
  if(typeof momentoAbrir === 'function') momentoAbrir({tipo: 'salto', icono: corre ? '💥' : '🦘', titulo: `${nom} ${corre ? 'corre' : 'salta'}`, resultado: txt, estado: 'listo', datos: {chico: true}});
  if(ataque.saltoAplasta) await saltoAplastar(mio, yo);
  return true;
}
// 💥 El Salto aplastante: los rivales pegados a donde cayó tiran Res.CC contra su Fuerza (una tirada para todos); quien no llega queda Sentado.
async function saltoAplastar(mio, yo){
  const sc = mio.tipo === 'creep' ? creepPrivadoDe(mio.fichaId) : null;
  const vFue = sc ? CreepCalculo.statValor(sc, 'fue') : trampaValorStat(mio, 'fue');
  const rivales = [...tokens.entries()].map(([id, x]) => ({...x, id})).filter(x => x.id !== mio.id && distanciaHex(x, mio) === 1 && !x.oculto && !x.bajoTierra && !etereoDe(x) && dueloEsRival(yo, x));
  if(!rivales.length) return;
  const nom = nombreDe(mio), rf = Combatiente.tirarStat(vFue, sc ? sc.estados : confusionEstadosDe(mio), 'fue');
  if(!rf) return;
  mesaPublicar(`💥 ${nom} cae aplastando · Fuerza`, {...rf, quien: nom, ...(mio.tipo === 'creep' ? {desde: 'gm'} : {})});
  const lineas = [];
  for(const x of rivales){
    const rr = Combatiente.tirarStat(trampaValorStat(x, 'rescc'), confusionEstadosDe(x), 'rescc');
    const n2 = nombreDe(x);
    if(!rr){ lineas.push(`${n2}: ✋ tirá Res.CC a mano`); continue; }
    mesaPublicar(`${n2} · Res.CC (para no caer)`, {...rr, quien: n2, ...(x.tipo === 'creep' ? {desde: 'gm'} : {ficha: String(x.fichaId).split(SEP_INVOCACION)[0]})});
    const cae = rr.total < rf.total;   // empate: no cae (llega)
    lineas.push(`${n2}: ${rr.total} contra ${rf.total} → ${cae ? 'queda Sentado' : 'se mantiene en pie'}`);
    if(!cae) continue;
    try{
      if(x.tipo === 'creep') await modificarCreep(String(x.fichaId), c => { EstadosAplicar.aplicarACreep(c, {nombre: 'Sentado'}); return {}; });
      else{ const f = fichasPub.get(String(x.fichaId).split(SEP_INVOCACION)[0]); await EstadosAplicar.encolarPj({fichaId: x.fichaId, duenoUid: (f && f.duenoUid) || x.duenoUid, spec: {nombre: 'Sentado'}, origen: `${nom} · Salto aplastante`}); }
    }catch(err){ console.error('Salto aplastante: no se pudo sentar', err); lineas[lineas.length - 1] += ' (✋ ponéselo a mano)'; }
  }
  if(typeof esperarDadosMapa === 'function') await esperarDadosMapa();
  const txt = `${nom} cae aplastando (Fuerza ${rf.total}): ${lineas.join(' · ')}.`;
  mesaLinea(`💥 ${txt}`, 'recordatorio');
  if(typeof momentoAbrir === 'function') momentoAbrir({tipo: 'salto', icono: '💥', titulo: `${nom} cae aplastando`, resultado: txt, estado: 'listo', datos: {chico: true}});
}
async function cargaEmbestida(mio, t, ataque, yo){
  const conBono = n => {
    const a = structuredClone(ataque);
    a.mods = {...(a.mods || {}), pdg: num(a.mods && a.mods.pdg) + n, fijo: num(a.mods && a.mods.fijo) + n};
    a.efectos = (a.efectos || []).map(e => num(e.empuja) > 0 ? {...e, empuja: num(e.empuja) + n, detalle: `Lo empuja ${num(e.empuja) + n} casilla${num(e.empuja) + n === 1 ? '' : 's'}, lejos de quien embiste.`} : e);
    return a;
  };
  const dist = distanciaHex(mio, t);
  if(dist <= 1) return conBono(0);
  const camino = lineaHex(mio, t).slice(0, -1);   // las casillas que corre: termina al lado del objetivo
  const ocupada = c => elementoSolidoEn(c.col, c.fila) || [...tokens.entries()].some(([id, x]) => id !== mio.id && x.col === c.col && x.fila === c.fila && !x.bajoTierra);
  let libre = true, prev = mio;
  for(const c of camino){ if(ocupada(c) || (typeof paredCorta === 'function' && paredCorta(prev, c))){ libre = false; break; } prev = c; }
  const sc = mio.tipo === 'creep' ? creepPrivadoDe(mio.fichaId) : null;
  const cm = sc ? costoMoverCreep(mio) : null, por = cm ? num(cm.porCasillero) : 1;
  const n = camino.length, nom = nombreDe(mio), obj = nombreDe(t);
  if(!libre || !sc || por <= 0){
    const motivo = !sc ? `por ahora la carrera la toman los creeps` : por <= 0 ? `${nom} no se puede mover` : `no hay una línea recta libre hasta ${obj}`;
    const si = await AvisoCombate.preguntar(`${motivo}: no puede tomar carrera. ¿Atacar igual sin la carrera? (está a ${dist} casilleros: lo decide la mesa)`,
      {icono: '🐂', titulo: 'Sin carrera', si: 'Atacar igual', no: 'Elegir otro'});
    if(si) mesaLinea(`🐂 ${nom} ataca a ${obj} sin tomar carrera (${motivo}; lo decidió la mesa)`, 'alerta-roja');
    return si ? conBono(0) : null;
  }
  const costo = n * por, tiene = num(sc.nitros);
  if(tiene < costo && !(await AvisoCombate.preguntar(`Correr ${n} casillero${n === 1 ? '' : 's'} le cuesta ${costo} No2 y tiene ${tiene}. ¿Correr igual? (queda en 0)`,
    {icono: '🐂', titulo: 'Sin No2 para la carrera', si: 'Correr igual', no: 'Elegir otro'}))) return null;
  const fin = camino[camino.length - 1];
  await modificarCreep(String(mio.fichaId), c => { c.nitros = Math.max(0, num(c.nitros) - costo); return {}; });
  await coleccionTokens().doc(mio.id).update({col: fin.col, fila: fin.fila, rotacion: rotacionDePaso(hexCentro(fin.col, fin.fila), hexCentro(t.col, t.fila)), ruta: firebase.firestore.FieldValue.delete()});
  if(typeof marcarMovido === 'function') marcarMovido(mio.id);
  mio.col = fin.col; mio.fila = fin.fila;   // (lo que sigue —la espalda, el miedo— lo mira desde donde quedó)
  const b = n + 1;
  const txt = `${nom} toma carrera: corre ${n} casillero${n === 1 ? '' : 's'} hacia ${obj} (−${costo} No2) → +${b} a la Probabilidad de Golpe, +${b} al daño y, si pega, lo empuja ${b} casilla${b === 1 ? '' : 's'}.`;
  mesaLinea(`🐂 ${txt}`, 'recordatorio');
  if(typeof momentoAbrir === 'function') momentoAbrir({tipo: 'carrera', icono: '🐂', titulo: `${nom} toma carrera`, resultado: txt, estado: 'listo', datos: {chico: true}});
  return conBono(n);
}
