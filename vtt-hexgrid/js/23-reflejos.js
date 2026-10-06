// js/23-reflejos.js — Reflejos de mangosta (2026-10-06, dueño, P164). Va después del arranque: solo define funciones.
/* Al pisar una trampa, quien tiene Reflejos de mangosta (pies) apuesta, ANTES de que se dispare: el Anuncio dice «pisaste una trampa» sin decir
   cuál (ni qué hace ni hasta dónde llega) y que, por los reflejos, tiene una chance de zafar con un dodge roll:
     1 · la chance de Reflejos (si no es «siempre»);
     2 · Evasión contra la dificultad de la trampa (la de detectarla, `trampaDetectar`; 8 si no tiene — dueño: «su dificultad siempre»);
     3 · si llega, el dodge roll: una casilla libre a 1 o 2 (paga el movimiento en No2, como cualquier paso).
   Después se dispara la trampa (js/08, trampaResolver): si al dispararse ya no está dentro de su alcance, zafó; si quedó adentro, le pega igual.
   Si no llega (o no se tira), la trampa se dispara donde está. Lo resuelve la pantalla de quien movió el token (la que lo maneja); la Mesa tiene
   las tiradas y la Crónica lo cuenta (sin nombrar la trampa hasta que se dispara). → {pos} (la casilla adonde se tiró) o null. */
async function trampaReflejosAntes(tokenId, t, el){
  const quien = t.oculto ? 'Alguien' : nombreDe(t), creep = t.tipo === 'creep';
  const dif = Math.max(1, Math.round(num(el.trampaDetectar)) || 8);
  const pct = chanceDe(t, 'reflejos'), d = Combatiente.chanceDado(pct);
  const titulo = `${quien} pisó una trampa`;
  const momentoId = await momentoAbrir({tipo: 'reflejos', icono: '🐍', titulo, estado: 'paso', datos: {centro: true, lineas: ['Reflejos de mangosta: intenta zafar…']}});
  const lineas = [];
  const cronica = (l, fin) => { lineas.push(l); momentoActualizar(momentoId, {...(fin ? {estado: 'listo', resultado: lineas.join(' · ')} : {}), 'datos.lineas': lineas.slice()}); };
  const pasos = [{titulo: 'Pisaste una trampa', texto: 'No sabés qué hace ni hasta dónde llega. Con Reflejos de mangosta tenés una chance de zafar con un dodge roll: es una apuesta.'}];
  const base = {clave: 'reflejos:' + tokenId, icono: '🐍', titulo};
  // Muestra los pasos y espera un botón → su valor (null si se cierra).
  const preguntar = (extra, botones) => new Promise(res => {
    let listo = false;
    const fin = v => { if(listo) return; listo = true; res(v); };
    AvisoCombate.mostrar({...base, pasos: [...pasos, ...extra], botones: botones.map(b => ({texto: b.texto, sec: b.sec, alClic: () => fin(b.valor)})), alCerrar: () => fin(null)});
  });
  const publicar = async (etq, r) => {
    try{ await mesaPublicar(etq, {formula: r.formula, rolls: r.rolls, mod: r.mod, total: r.total, ...(r.estados ? {estados: r.estados} : {}), ...(r.ventaja ? {ventaja: r.ventaja} : {}), quien, ...(creep ? {desde: 'gm'} : {})}); }catch(err){}
    await trampaEsperarDados();
  };
  const seDispara = async motivo => {
    await preguntar([], [{texto: '▶ Seguir', valor: 1}]);
    cronica(motivo || 'la trampa se dispara', true);
    AvisoCombate.cerrar();
    return null;
  };

  // 1 · La chance de Reflejos.
  if(d){
    const nec = d.caras - d.exitos + 1;
    const v = await preguntar([{titulo: 'Reflejos de mangosta', texto: `${Combatiente.chanceTexto(pct)}: con ${nec} o más en 1d${d.caras}, reaccionás a tiempo.`, espera: true}],
      [{texto: `🎲 Tirar Reflejos (1d${d.caras})`, valor: 'tirar'}]);
    if(v !== 'tirar'){ cronica('no lo intentó: la trampa se dispara', true); AvisoCombate.cerrar(); return null; }
    const r = tirarDados('1d' + d.caras);
    await publicar(`Reflejos de mangosta · ${Combatiente.chanceTexto(pct)}`, r);
    const ok = r.total >= nec;
    pasos.push({titulo: 'Reflejos de mangosta', texto: `1d${d.caras} = ${r.total} (con ${nec} o más) → ${ok ? 'reacciona a tiempo' : 'no reacciona: la trampa se dispara'}`});
    cronica(`Reflejos: ${r.total} en 1d${d.caras} → ${ok ? 'reacciona' : 'no reacciona'}`);
    if(!ok) return seDispara();
  }
  // Sentado o Inmovilizado no se pueden tirar.
  const estados = confusionEstadosDe(t);
  const traba = estados.find(e => e && e.activo !== false && (e.sentado || e.inmovilizado || /^(sentado|inmovilizado)$/i.test(String(e.nombre || '').trim())));
  if(traba){ pasos.push({titulo: 'Para zafar', texto: `Está ${traba.nombre}: no puede tirarse.`}); cronica(`está ${traba.nombre}: no puede tirarse`); return seDispara(); }

  // 2 · Evasión contra la dificultad de la trampa.
  const valor = trampaValorStat(t, 'eva'), f = formulaParaValor(valor);
  const v2 = await preguntar([{titulo: 'Para zafar', texto: `Evasión contra ${dif} (la dificultad de la trampa): con ${dif} o más, podés tirarte.`, espera: true}],
    [{texto: `🎲 Tirar Evasión (${f.formula})`, valor: 'tirar'}, {texto: '✋ No lo intento', sec: true, valor: 'no'}]);
  if(v2 !== 'tirar'){ cronica('no lo intentó: la trampa se dispara', true); AvisoCombate.cerrar(); return null; }
  const rd = Combatiente.tirarStat(valor, estados, 'eva');
  await publicar('Evasión · para zafar de una trampa', rd);
  const ok2 = rd.total >= dif;
  pasos.push({titulo: 'Para zafar', texto: `Evasión ${rd.total} contra ${dif} → ${ok2 ? '¡llega! Puede tirarse' : 'no llega: la trampa se dispara'}`});
  cronica(`Evasión ${rd.total} contra ${dif} → ${ok2 ? 'llega' : 'no llega'}`);
  if(!ok2) return seDispara();

  // 3 · El dodge roll.
  const cm = costoMoverDe(t), por = cm ? num(cm.porCasillero) : 0;
  const v3 = await preguntar([{titulo: 'Dodge roll', texto: `Tirate hasta 2 casilleros hacia donde quieras${por ? ` (${fmt(por)} No2 por casillero)` : ''}. Después se dispara la trampa: si quedás fuera de su alcance, zafaste; si no, te pega igual.`, espera: true}],
    [{texto: '🏃 Elegir adónde tirarte', valor: 'si'}, {texto: '✋ Me quedo', sec: true, valor: 'no'}]);
  if(v3 !== 'si'){ cronica('se queda: la trampa se dispara', true); AvisoCombate.cerrar(); return null; }
  AvisoCombate.cerrar();
  const elegida = await new Promise(res => {
    const pedir = () => elegirDestino(c => {
      const dist = distanciaHex(c, t);
      if(dist < 1 || dist > 2){ toast('El dodge roll es de 1 o 2 casilleros'); pedir(); return; }
      if(elementoSolidoEn(c.col, c.fila) || [...tokens.entries()].some(([id, y]) => id !== tokenId && y.col === c.col && y.fila === c.fila)){ toast('Esa casilla no está libre: elegí otra'); pedir(); return; }
      const costo = por * dist;
      if(cm && costo > num(cm.disponibles)){ toast(`No te alcanzan los No2: tirarte ${dist} casillero${dist === 1 ? '' : 's'} cuesta ${fmt(costo)}`); pedir(); return; }
      elegirDestinoTerminar();
      res({c, dist, costo});
    }, `<b>🏃 Dodge roll</b> <span>clic en una casilla libre a 1 o 2 de ${esc(quien)}${por ? ` (${fmt(por)} No2 por casillero)` : ''} · Esc o clic derecho: te quedás</span>`, false, () => res(null));
    pedir();
  });
  if(!elegida){ cronica('se queda: la trampa se dispara', true); return null; }
  try{
    if(elegida.costo > 0) await (creep ? gastarNitrosCreep(t.fichaId, elegida.costo) : gastarNitros(t.fichaId, elegida.costo));
    await coleccionTokens().doc(tokenId).update({col: elegida.c.col, fila: elegida.c.fila, ruta: firebase.firestore.FieldValue.delete()});
  }catch(err){
    console.error('No se pudo hacer el dodge roll:', err);
    toast('No se pudo mover: la trampa se dispara donde está');
    cronica('no se pudo mover: la trampa se dispara', true);
    return null;
  }
  cronica(`se tira ${elegida.dist} casillero${elegida.dist === 1 ? '' : 's'}${elegida.costo > 0 ? ` (−${fmt(elegida.costo)} No2)` : ''}: ahora se dispara la trampa`, true);
  return {pos: {col: elegida.c.col, fila: elegida.c.fila}};
}
