/* =========================================================
   ↩ DESHACER EL ÚLTIMO DUELO CON ENYETAR (parte B de P363, 2026-11-27; dueño: «te tiene que poder permitir reabrir el último duelo concluido»).
   Quien tiene Enyetar elige una tirada del ÚLTIMO duelo terminado (la lista del 🐈‍⬛ o la fila «⚡ Entre tiradas»): ve un cartel con lo que se va a
   deshacer y lo que no (`Duelo.deshacerPlan`), confirma («Aplicar automático» / «Resolver a mano» si hay algo que no se deshace solo) y el duelo queda
   en pausa con la maldición adentro del mismo cuadro (como la A3). Si la maldición gana, la pantalla del GM (la que aplicó el daño):
     1. devuelve lo que el duelo dejó (modo automático): la vida por diferencia, los estados que puso, los escudos que gastó, la durabilidad, lo que ganó
        o perdió quien pegó (Espinas, Espejo, Drena, Luz sanadora) y, si cayó y volvió, lo que gastó para volver (el Ankh, la Llama, el Pacto, el Anillo);
     2. vuelve el duelo a esa tirada con la yeta (`Duelo.enyetarTirada` con `deshacer`) y se resuelve de nuevo;
     3. tacha la línea vieja del resultado en la Mesa («↩ cambiado por 😈 Enyetar de X»; sin la regla nueva pegada, avisa) y deja la línea «↩ Deshecho…»
        y su tarjeta en la Crónica, con lo que quedó para revisar a mano.
   Para poder devolver los estados, la pantalla del GM anota cómo estaba quien lo recibe antes del primer daño o efecto de cada duelo (`deshacerFoto`,
   en `ataque.previo`; la llaman dueloAplicarDano y dueloAplicarEfecto, js/13). Lo puro está en comun/duelo.js.
   ========================================================= */
const deshacerFotos = new Set();
const limpioJson = x => JSON.parse(JSON.stringify(x === undefined ? null : x));
const ANKH_NOMBRE = 'Ankh de Reencarnación';

// Cómo estaba quien recibe, antes de que el duelo le haga algo. Una vez por duelo (y por cada vez que se deshizo).
async function deshacerFoto(d){
  if(!d || !d.id || !d.defensor || d.defensor.objeto || (d.ataque && d.ataque.previo)) return;
  if(d.hab && (d.hab.efectos || []).some(e => e && /^(enyetar|mal de ojo)$/i.test(String(e.nombre || '').trim()))) return;   // (la maldición misma no se deshace)
  const k = d.id + '#' + Duelo.generacion(d);
  if(deshacerFotos.has(k)) return;
  deshacerFotos.add(k);
  const t = tokens.get(d.defensor.tokenId);
  if(!t || !t.fichaId) return;
  let foto = null;
  try{
    if(t.tipo === 'creep'){
      const sc = creepPrivadoDe(t.fichaId);
      if(sc) foto = {tipo: 'creep', hp: num(sc.hp), estados: sc.estados || []};
    }else if(String(t.fichaId).includes(SEP_INVOCACION)){
      const inv = await invDeToken(t);
      if(inv) foto = {tipo: 'inv', hp: num(inv.hp), estados: inv.estados || []};
    }else{
      await cargarPiezas(BN_PIEZAS);
      const l = await FichaGuardado.cargar(fbDb, fbRutaCampana(`fichas/${t.fichaId}`));
      const S = l && l.S;
      if(S){
        const ankh = (S.cinturon || []).find(i => i && i.nombre === ANKH_NOMBRE);
        foto = {tipo: 'pj', hp: num(S.hp), estados: S.efectos || [], pacto: !!(S.meta && S.meta.pacto), aliento: !!(S.meta && S.meta.ultimoAlientoUsado),
          sp: num(S.spGastado), ankh: ankh ? limpioJson(ankh) : null,
          items: (S.inventario || []).filter(i => i && i.equipado && FichaCalculo.durableItem(i)).map(i => ({id: i.id, dur: FichaCalculo.durActual(i), armRota: num(i.armRota)}))};
      }
    }
  }catch(err){ console.error('Deshacer: no se pudo anotar cómo estaba antes del duelo', err); }
  if(!foto) return;
  foto.cuando = Date.now();
  try{
    const ref = fbDb.collection(fbRutaCampana('duelos')).doc(d.id);
    await fbDb.runTransaction(async tx => {
      const doc = await tx.get(ref);
      if(!doc.exists || (doc.data().ataque && doc.data().ataque.previo)) return;
      tx.update(ref, {'ataque.previo': limpioJson(foto)});
    });
  }catch(err){ console.error('Deshacer: no se pudo guardar cómo estaba antes del duelo', err); }
}

// Los nombres de los estados que puso el duelo (y el Titilando, si cayó y volvió).
function deshacerAplicados(x, volvio){ return [...Duelo.estadosDelDuelo(x), ...(volvio ? ['Titilando'] : [])]; }
const deshacerCura = x => ((x.efectos || []).filter(e => e && e.aplicado && !e.sinEfecto).map(e => Duelo.specDeEfecto(e)).filter(s => s && s.cura).reduce((a, s) => a + num(s.cura), 0));

// Lo de quien recibió. → {hecho: [renglones], mano: [renglones]}
async function deshacerDefensor(x){
  const t = tokens.get(x.defensor.tokenId), prev = x.ataque && x.ataque.previo, dn = x.dano;
  const hecho = [], mano = [];
  if(!t || !t.fichaId){ mano.push(`${x.defensor.nombre}: ya no está en el mapa`); return {hecho, mano}; }
  const conVida = !!(dn && dn.hpAntes !== undefined && dn.hpAntes !== null);
  const fin = conVida ? num(Duelo.vidaPerdida(dn) ? dn.hpAntes - Duelo.vidaPerdida(dn) : dn.hpDespues) : 0;
  const cura = deshacerCura(x);
  // La vida, los estados y lo que gastó para volver, sobre un objeto con {hp, max, estados}.
  const arreglar = (q, campoEst) => {
    const antesHp = num(q.hp);
    const volvio = conVida && num(dn.hpAntes) > 0 && fin <= 0 && antesHp > 0;
    if(conVida) q.hp = Duelo.deshacerVida({antes: dn.hpAntes, final: fin, actual: q.hp, max: q.max});
    if(cura > 0) q.hp = Math.max(prev ? num(prev.hp) : 0, num(q.hp) - cura);
    if(num(q.hp) !== antesHp) hecho.push(`la vida de ${x.defensor.nombre}: ${fmt(antesHp)} → ${fmt(num(q.hp))}`);
    if(prev && Array.isArray(prev.estados)){
      const r = Duelo.deshacerEstados(prev.estados, q[campoEst] || [], deshacerAplicados(x, volvio));
      q[campoEst] = r.estados;
      if(r.sacados.length) hecho.push(`se le sacó ${r.sacados.join(', ')}`);
      if(r.vuelven.length) hecho.push(`volvió a como estaba: ${r.vuelven.join(', ')}`);
    }
    return volvio;
  };
  try{
    if(t.tipo === 'creep'){
      await modificarCreep(t.fichaId, sc => { const q = {hp: sc.hp, max: num(sc.hpMax), estados: sc.estados || []}; arreglar(q, 'estados'); sc.hp = q.hp; sc.estados = q.estados; });
      return {hecho, mano};
    }
    const esInv = String(t.fichaId).includes(SEP_INVOCACION);
    const [fichaId, invId] = String(t.fichaId).split(SEP_INVOCACION);
    const ok = await editarPersonajeMapa(fichaId, S => {
      if(esInv){
        const inv = (S.invocaciones || []).find(i => i && i.id === invId);
        if(!inv){ mano.push(`${x.defensor.nombre}: la invocación ya no está`); return false; }
        const q = {hp: inv.hp, max: num(inv.hpMax), estados: inv.estados || []};
        arreglar(q, 'estados'); inv.hp = q.hp; inv.estados = q.estados;
        return true;
      }
      const cf = FichaCalculo.calcular(S), max = Number.isNaN(cf.final.hpmax) ? 0 : num(cf.final.hpmax);
      const q = {hp: S.hp, max, efectos: S.efectos || []};
      const volvio = arreglar(q, 'efectos');
      S.hp = q.hp;
      if(num(S.hp) > 0 && S.muerto && S.muerto.activo) S.muerto = {activo: false, turnos: 5, definitivo: false};   // (sin volverLimpio: los estados ya quedaron como estaban)
      S.efectos = q.efectos;
      if(prev && prev.tipo === 'pj'){
        // ☥ Lo que gastó para volver, o el Anillo que lo sostuvo (P363, dueño: «se le devuelve lo que gastó»).
        if(prev.pacto && !(S.meta && S.meta.pacto)){ S.meta = {...(S.meta || {}), pacto: true}; hecho.push('se le devolvió el Pacto'); }
        if(!prev.aliento && S.meta && S.meta.ultimoAlientoUsado){ S.meta.ultimoAlientoUsado = false; hecho.push('se recargó el Anillo del último aliento'); }
        if(prev.ankh){
          const it = (S.cinturon || []).find(i => i && i.nombre === ANKH_NOMBRE);
          if(it && num(it.unidades) < num(prev.ankh.unidades)){ it.unidades = num(prev.ankh.unidades); hecho.push('se le devolvió el Ankh'); }
          else if(!it){ S.cinturon = [...(S.cinturon || []), structuredClone(prev.ankh)]; hecho.push('se le devolvió el Ankh al cinturón'); }
        }
        if(volvio && num(S.spGastado) < num(prev.sp)) S.spGastado = num(prev.sp);   // (la Llama de Fénix le había llenado el SP)
        (prev.items || []).forEach(p => {
          const it = (S.inventario || []).find(i => i && i.id === p.id);
          if(!it) return;
          let cambio = false;
          if(FichaCalculo.durActual(it) < num(p.dur)){ it.dur = num(p.dur); it.durV = Combatiente.DUR_VERSION; cambio = true; }
          if(num(it.armRota) > num(p.armRota)){ it.armRota = num(p.armRota); cambio = true; }
          if(cambio) hecho.push(`${it.nombre}: vuelve a como estaba (durabilidad ${fmt(num(p.dur))})`);
        });
        Combatiente.vueltaTomar(S);   // (no es una vuelta de la muerte: sin animación ni «volvió»)
      }
      return true;
    }, {exigirGuardado: true});
    if(!ok) mano.push(`no se pudo escribir la ficha de ${x.defensor.nombre}`);
  }catch(err){
    console.error('Deshacer: no se pudo devolver lo de quien recibió', err);
    mano.push(`no se pudo devolver lo de ${x.defensor.nombre} (falló la escritura)`);
  }
  if(!(x.ataque && x.ataque.previo) && Duelo.estadosDelDuelo(x).length) mano.push(`los estados que le puso a ${x.defensor.nombre}: este duelo no anotó cómo estaba antes`);
  return {hecho, mano};
}

// Lo de quien pegó: las Espinas y el Espejo que le sacaron vida, lo que se curó con Drena o la Luz sanadora.
async function deshacerAtacante(x){
  const r = Duelo.deshacerAtacante(x.dano), hecho = [], mano = [];
  if(!r.delta) return {hecho, mano};
  const t = tokens.get(x.atacante.tokenId), nom = x.atacante.nombre;
  if(!t || !t.fichaId){ mano.push(`la vida de ${nom} (${r.partes.map(p => p.n).join(', ')}): ya no está en el mapa`); return {hecho, mano}; }
  const txt = `la vida de ${nom} (${r.partes.map(p => p.n).join(', ')}): ${r.delta > 0 ? '+' : ''}${fmt(r.delta)}`;
  try{
    if(t.tipo === 'creep'){ await modificarCreep(t.fichaId, sc => { sc.hp = Math.max(0, Math.min(num(sc.hpMax) > 0 ? num(sc.hpMax) : num(sc.hp) + r.delta, num(sc.hp) + r.delta)); }); hecho.push(txt); return {hecho, mano}; }
    const esInv = String(t.fichaId).includes(SEP_INVOCACION), [fichaId, invId] = String(t.fichaId).split(SEP_INVOCACION);
    const ok = await editarPersonajeMapa(fichaId, S => {
      if(esInv){ const inv = (S.invocaciones || []).find(i => i && i.id === invId); if(!inv) return false; inv.hp = Math.max(0, Math.min(num(inv.hpMax) || 9999, num(inv.hp) + r.delta)); return true; }
      const cf = FichaCalculo.calcular(S), max = Number.isNaN(cf.final.hpmax) ? 0 : num(cf.final.hpmax);
      S.hp = Math.max(0, max > 0 ? Math.min(max, num(S.hp) + r.delta) : num(S.hp) + r.delta);
      return true;
    }, {exigirGuardado: true});
    (ok ? hecho : mano).push(ok ? txt : `${txt} (no se pudo escribir)`);
  }catch(err){ console.error('Deshacer: no se pudo devolver lo de quien pegó', err); mano.push(`${txt} (falló la escritura)`); }
  return {hecho, mano};
}

// La línea vieja del resultado: la anotada en el duelo o, si es de antes, la última «⚔ Resumen del duelo · A → B».
async function deshacerTacharMesa(x, motivo){
  const col = fbDb.collection(fbRutaCampana('tiradas'));
  let id = x.ataque && x.ataque.resumenMesa;
  try{
    if(!id){
      const q = await col.orderBy('cuando', 'desc').limit(40).get();
      const o = `⚔ Resumen del duelo · ${x.atacante.nombre} → ${x.defensor.nombre}`;
      const doc = q.docs.find(z => z.data().origen === o && !z.data().deshecha);
      id = doc ? doc.id : '';
    }
    if(!id) return 'sin-linea';
    await col.doc(id).update({deshecha: String(motivo).slice(0, 200)});
    return 'ok';
  }catch(err){
    if(err && err.code === 'permission-denied') return 'sin-regla';
    console.error('Deshacer: no se pudo tachar la línea de la Mesa', err);
    return 'error';
  }
}

/* ↩ Lo que se usó para deshacer (Enyetar C, 2026-11-27, P366 2: «la Moneda / WC Re-roll y el Golpe de suerte también pueden deshacer el último duelo»):
   la maldición de Enyetar (queda la peor), el Golpe de suerte (queda la mejor) o la moneda / la carta (vale la segunda: se vuelve a tirar con el botón). */
const DESHACER_QUE = {enyetar: '😈 Enyetar', reroll: '🧚 Golpe de suerte', moneda: '🪙 Re-roll (WC-Moneda)'};
const deshacerTipo = y => (y && DESHACER_QUE[y.tipo] ? y.tipo : 'enyetar');

/* Lo hace la pantalla del GM (la que aplicó el daño): la maldición ganó (lo llama enyetarAplicar, js/38), o el Golpe de suerte ya se pagó o la moneda ya se
   usó (`deshacerPausa`). Devuelve lo que dejó el duelo y lo vuelve a esa tirada. → lo de `Duelo.enyetarTirada` / `Duelo.reabrirDeshecho`, o null. */
async function deshacerYReabrir(id, x, y, hijo){
  const tipo = deshacerTipo(y), QUE = DESHACER_QUE[tipo];
  const modo = (y.deshacer && y.deshacer.modo) === 'mano' ? 'mano' : 'auto';
  const quien = y.porNombre || 'alguien', A = x.atacante.nombre, D = x.defensor.nombre;
  let hecho = [], mano = [...((y.deshacer && y.deshacer.mano) || [])];
  if(modo === 'auto'){
    const a = await deshacerDefensor(x), b = await deshacerAtacante(x);
    hecho = [...a.hecho, ...b.hecho];
    mano = [...new Set([...mano, ...a.mano, ...b.mano])];
  }else mano = [`todo lo que dejó el duelo (se eligió «Resolver a mano»): la vida, los estados y lo demás`, ...mano];
  let r = null;
  try{
    r = tipo === 'moneda' ? await Duelo.reabrirDeshecho(id, y.campo)
      : await Duelo.enyetarTirada(id, y.lado, tipo === 'reroll' ? 'mejor' : 'peor', {campo: y.campo, yeta: true, tipo, hijo, deshacer: true});
  }catch(err){ console.error('Deshacer: no se pudo volver el duelo a esa tirada', err); }
  if(!r){
    try{ await Duelo.yetaSeguir(id, 'no se pudo volver el duelo a esa tirada'); }catch(err){}
    mesaLinea(`↩ ${quien}: no se pudo volver el duelo ${A} → ${D} a esa tirada. ${hecho.length ? 'Ya se había devuelto: ' + hecho.join('; ') + '. ' : ''}✋ Resolvelo a mano.`, 'alerta-roja');
    return null;
  }
  const tacha = await deshacerTacharMesa(x, `↩ cambiado por ${QUE} de ${quien}`);
  const sinRegla = tacha === 'sin-regla';
  const formula = [hecho.length ? `Se devolvió: ${hecho.join('; ')}.` : (modo === 'auto' ? 'No había nada para devolver.' : ''), mano.length ? `✋ Revisá a mano: ${mano.join('; ')}.` : '',
    sinRegla ? '(Falta pegar la regla nueva de Firestore para tachar la línea vieja de la Mesa: avisale al GM.)' : ''].filter(Boolean).join('\n');
  const vuelve = tipo === 'moneda' ? `vuelve a su ${r.etq} (era ${fmt(r.antes)}: se vuelve a tirar y vale la segunda)`
    : `vuelve a su ${r.etq} (${fmt(r.antes)} y ${fmt(r.nueva)} → queda ${fmt(r.ahora)}, ${tipo === 'reroll' ? 'la mejor' : 'la peor'})`;
  try{
    await fbDb.collection(fbRutaCampana('tiradas')).add({uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: '',
      origen: `↩ Deshecho por ${QUE} de ${quien}: el duelo ${A} → ${D} ${vuelve} y se resuelve de nuevo`.slice(0, 200),
      formula: formula.slice(0, 900), rolls: [], mod: 0, total: 0, desde: 'recordatorio', cuando: firebase.firestore.FieldValue.serverTimestamp()});
  }catch(err){ console.error('Deshacer: no se pudo anotar en la Mesa', err); }
  try{ momentoAbrir({tipo: 'deshecho', icono: '↩', titulo: `↩ Deshecho por ${QUE} de ${quien}`, estado: 'listo',
    resultado: `El duelo ${A} → ${D} se vuelve a resolver desde su ${r.etq}.${hecho.length ? ' Se devolvió: ' + hecho.join('; ') + '.' : ''}${mano.length ? ' ✋ A mano: ' + mano.join('; ') + '.' : ''}`, datos: {dueloId: id}}); }catch(err){}
  if(sinRegla) toast('↩ Falta pegar la regla nueva de Firestore (tachar una línea de la Mesa): quedó la línea «↩ Deshecho» sin tachar la vieja');
  return r;
}

/* ↩ El Golpe de suerte (ya pagado) o la moneda (ya usada) sobre el último duelo terminado: lo llama la pantalla del GM desde comun/duelo.js (`yetaRevisarTodos`,
   gancho `deshacerPausa`). Una sola pantalla lo toma (`Duelo.yetaReclamar`). */
async function deshacerPausa(d){
  if(!soyGM || !(await Duelo.yetaReclamar(d.id))) return;
  let x = null;
  try{ const doc = await fbDb.collection(fbRutaCampana('duelos')).doc(d.id).get(); x = doc.exists ? {id: doc.id, ...doc.data()} : null; }
  catch(err){ console.error('Deshacer: no se pudo leer el duelo', err); }
  const y = x && x.ataque && x.ataque.yeta;
  if(!y){ return; }
  const r = await deshacerYReabrir(d.id, x, y, '');
  if(r && deshacerTipo(y) === 'reroll') await publicarRepeticion(y.aNombre || 'su aliado', r, 'mejor', 'mapa');
}

/* La confirmación (la pantalla de quien lo usa), antes de poner la pausa: qué se deshace y qué no (P363 B, dueño: «un mensaje y una confirmación»).
   tipo: 'enyetar' | 'reroll' | 'moneda'. → {modo, mano} o null (canceló, o no se puede). */
async function deshacerConfirmar(tipo, o){
  let x = null;
  try{ const doc = await fbDb.collection(fbRutaCampana('duelos')).doc(o.dueloId).get(); x = doc.exists ? {id: doc.id, ...doc.data()} : null; }
  catch(err){ console.error('Deshacer: no se pudo leer el duelo', err); }
  const plan = Duelo.deshacerPlan(x, {hayDefensor: !!(x && x.defensor && tokens.get(x.defensor.tokenId))});
  if(!plan.puede){
    AvisoCombate.mostrar({icono: '↩', titulo: 'No se puede deshacer', texto: `Ese duelo no se puede volver atrás: ${plan.motivo}.`});
    return null;
  }
  const lineas = l => l.map(t => `• ${t}`).join('\n');
  const etq = String(o.etq || 'tirada');
  const que = tipo === 'reroll' ? `Se deshace lo que dejó ese duelo y ${o.nombre} repite su ${etq} y se queda con la mejor; después se vuelve a resolver. Cuesta ${rerollCosto}.`
    : tipo === 'moneda' ? `Se deshace lo que dejó ese duelo y volvés a tirar tu ${etq} con la moneda o la carta (vale la segunda tirada); después se vuelve a resolver.`
    : `Primero tirás la maldición (PdG.Esp contra Res.Esp de ${o.nombre}); si gana, se deshace lo que dejó ese duelo y se vuelve a resolver desde su ${etq}, que repite y se queda con la peor. Si pierde, no se toca nada.`;
  const texto = `${x.atacante.nombre} → ${x.defensor.nombre} ya terminó. ${que}\n\n`
    + (plan.auto.length ? `Se devuelve solo:\n${lineas(plan.auto)}\n\n` : '')
    + (plan.mano.length ? `✋ Esto no se deshace solo (queda para revisar a mano):\n${lineas(plan.mano)}` : '');
  const boton = tipo === 'reroll' ? '↩ Deshacer y Golpe de suerte' : tipo === 'moneda' ? '↩ Deshacer y volver a tirar' : '↩ Deshacer y enyetar';
  const opciones = plan.mano.length
    ? [{valor: 'auto', texto: '⚙ Aplicar automático', detalle: 'devuelve lo de arriba y te deja la lista de lo que hay que revisar'},
      {valor: 'mano', texto: '✋ Resolver a mano', detalle: 'no toca la vida ni los estados: el duelo se vuelve a resolver y la mesa corrige lo demás'}]
    : [{valor: 'auto', texto: boton, detalle: tipo === 'enyetar' ? 'si la maldición gana' : 'se deshace al toque'}];
  const titulo = tipo === 'reroll' ? '↩ Golpe de suerte sobre el último duelo' : tipo === 'moneda' ? '↩ Re-roll (WC-Moneda) sobre el último duelo' : '↩ Enyetar el último duelo';
  const modo = await Confirmar.elegir(texto.trim(), {titulo, icono: tipo === 'reroll' ? '🧚' : tipo === 'moneda' ? '🪙' : '😈', no: 'Cancelar', opciones});
  return modo ? {modo, mano: plan.mano} : null;
}
// → lo de enyetarElegir (true / false).
async function enyetarConfirmarDeshacer(tokenId, o){
  const c = await deshacerConfirmar('enyetar', o);
  if(!c) return false;
  return enyetarElegir(tokenId, {...o, deshacer: c});
}
// 🧚 El Golpe de suerte sobre una tirada propia o de un aliado del último duelo terminado: confirma, pone la pausa, cobra; el GM deshace.
async function rerollConfirmarDeshacer(porId, o){
  const yo = tokens.get(porId);
  if(!yo) return false;
  const c = await deshacerConfirmar('reroll', o);
  if(!c) return false;
  const ok = await Duelo.yetaPausar(o.dueloId, {tipo: 'reroll', lado: o.lado, campo: o.campo, por: porId, porNombre: nombreDe(yo), a: o.tokenId, aNombre: o.nombre, deshacer: c})
    .catch(err => { console.error('Golpe de suerte: no se pudo poner en pausa el duelo', err); return false; });
  if(!ok){ toast('🧚 Esa tirada ya no se puede cambiar (el duelo siguió, o ya tiene algo encima)'); return false; }
  try{ if(Duelo.abiertoId() !== o.dueloId) Duelo.abrir(o.dueloId); }catch(err){}
  const usada = await rerollUsar(yo, {id: o.dueloId, lado: o.lado, campo: o.campo, nombre: o.nombre, etq: o.etq, total: o.total, contra: o.contra, deshacer: true});
  if(!usada) await Duelo.yetaSeguir(o.dueloId, 'no se llegó a usar el Golpe de suerte').catch(err => console.error(err));
  return usada;
}
// 🪙 La moneda o la carta sobre una tirada propia del último duelo terminado (la fila del duelo o el botón fijo): confirma y la usa (comun/duelo.js).
async function monedaConfirmarDeshacer(d, o){
  const c = await deshacerConfirmar('moneda', {...o, dueloId: d.id});
  if(!c) return false;
  return Duelo.monedaDeshacer(d, {...o, modo: c.modo, mano: c.mano});
}
/* 🪙 El botón fijo de la moneda (js/02): si el personaje principal estuvo en el último duelo terminado, primero ofrece sus tiradas de ese duelo («↩»), y
   «Otra tirada» abre la lista de siempre (las de la Mesa). → true si mostró la lista. */
async function monedaUltimoAbrir(fichaId){
  if(modoMapa !== 'combate') return false;
  const id = Duelo.ultimoTerminadoAhora();
  if(!id) return false;
  let d = null;
  try{ const doc = await fbDb.collection(fbRutaCampana('duelos')).doc(id).get(); d = doc.exists ? {id: doc.id, ...doc.data()} : null; }catch(err){ return false; }
  if(!d || d.estado !== 'resuelto' || !enyetarReciente(d.creado)) return false;   // (solo uno reciente: si no, la lista de siempre)
  const lado = ['atacante', 'defensor'].find(l => d[l] && String(d[l].ref || '') === String(fichaId));
  if(!lado) return false;
  const r = (fichasPub.get(fichaId) || {}).resumen || {};
  const w = Math.max(0, Math.round(num(r.wildcards))), con = [...(w ? ['wildcard'] : []), ...(r.moneda === true ? ['moneda'] : [])];
  if(!con.length) return false;
  const campos = Duelo.tiradasDeLado(d, lado).filter(c => !(d.rerollUsado && d.rerollUsado[c]));
  if(!campos.length) return false;
  const otro = d[lado === 'atacante' ? 'defensor' : 'atacante'] || {}, yo = d[lado];
  const botones = campos.map(c => { const t = Duelo.tiroDe(d, c), etq = Duelo.etqCampo(d, c);
    return {fila: true, texto: `↩ Tu ${etq} (${fmt(num(t.total))})`, detalle: `🔒 el último duelo que terminó (contra ${otro.nombre || 'el otro'}): se deshace lo que dejó y la volvés a tirar (vale la segunda) · antes te muestro qué se deshace`,
      alClic: () => { AvisoCombate.cerrar(); monedaConfirmarDeshacer(d, {lado, campo: c, etq, total: num(t.total), con, w, donde: '', tokenId: yo.tokenId, nombre: yo.nombre}); }}; });
  botones.push({fila: true, texto: '🪙 Otra tirada', detalle: 'la lista de siempre: tus últimas tiradas de la Mesa', alClic: () => { AvisoCombate.cerrar(); abrirRerollMapa(fichaId); }});
  botones.push({texto: 'Cancelar', sec: true, alClic: () => AvisoCombate.cerrar()});
  AvisoCombate.mostrar({icono: '🪙', titulo: 'Re-roll (WC-Moneda)', botones, texto: '¿Qué tirada volvés a tirar?'});
  return true;
}
