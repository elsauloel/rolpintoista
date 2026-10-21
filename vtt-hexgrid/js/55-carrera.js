/* ---------- 🐂 Tomar carrera (2026-10-21, dueño, la Cornada de las bestias) ----------
   «Si es cuerpo a cuerpo, tira para atrás uno… Si toma carrera, suma a la probabilidad de golpe, al daño y al desplazamiento hacia atrás»; «1 por cada
   casillero recorrido: al lado +1 y +1, con un casillero en el medio +2 y +2, con dos +3 y +3; la distancia de la embestida también determina cuán
   lejos para atrás lo empuja». Una Ejecución «con tu arma» con `embestida` (→ `ataque.embestidaHab`): al elegir el objetivo, si no está al lado, el
   creep corre en línea recta (`lineaHex`) hasta quedar al lado, pagando lo que cuesta moverse (1 No2 por casillero; Rengo, 2), y el ataque suma +1 PdG,
   +1 al daño y +1 casilla de empuje por cada casillero que corrió. Si no hay línea recta libre (un Sólido, una pared, otro token) o no se puede mover,
   avisa y deja atacar igual sin la carrera. Lo llama `dueloElegirObjetivoMapa` (js/13). → el ataque (con los bonos) o null (elegir otro). */
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
