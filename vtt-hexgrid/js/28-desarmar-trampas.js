// js/28-desarmar-trampas.js — el talento «Desarmar trampas» (dueño, 2026-10-08). Va después del arranque: solo define funciones.
/* Quien tiene el talento Desarmar trampas (en sus Talentos, `S.sociales`; la ficha publica su tirada en `resumen.desarmaTrampas`):
   · Detecta trampas como la Percepción aumentada, pero solo trampas (igual que Pisada atenta, js/08): al pasar al lado de una oculta se corta
     el movimiento, «Algo está fuera de lugar…» y tira Percepción (js/16).
   · Si la encuentra, puede desarmarla: 1 No2 y la tirada del talento contra la dificultad de la trampa (la misma de detectarla: una común, 8).
     Si llega, se la queda como consumible — también las mágicas (dueño: «se puede, es divertido»). Si no, la trampa sigue ahí.
   · Al terminar el combate (cuando se cierra el botín), si quedaron trampas rivales sin disparar: «¿Querés desarmarlas?» — una tirada por
     trampa, sin No2; la que no desarma, se rompe.
   Sacar del mapa una trampa ajena necesita la regla de Firestore (cualquiera de la partida puede borrar una trampa). */
const DESARMAR_TRAMPA_NO2 = 1;
// En combate, fallar (detectarla o desarmarla) es perder la oportunidad con esa trampa (dueño, 2026-10-08: «ya está, perdiste»): 'tokenId:trampaId'.
// No se le vuelve a pedir Percepción por ella ni se le ofrece desarmarla, tampoco al terminar el combate; al terminar el combate se vacía.
const trampaIntentoPerdido = new Set();
const trampaPerdio = (tokenId, trampaId) => { if(modoMapa === 'combate') trampaIntentoPerdido.add(tokenId + ':' + trampaId); };
const desarmarDif = el => Math.max(1, Math.round(num(el && el.trampaDetectar)) || 8);
// La tirada del talento de ese personaje ('' si no lo tiene). Las invocaciones no tienen talentos.
function tokenDesarmaTrampas(t){
  if(!t || t.tipo !== 'pj' || String(t.fichaId || '').includes(SEP_INVOCACION)) return '';
  const v = vinculo(t), r = v && v.resumen;
  return (r && r.desarmaTrampas) || '';
}
// La trampa como consumible para la mochila: la del ítem que la colocó (`trampaItem`) o una armada con lo que tiene el elemento.
function trampaComoItem(el){
  if(el.trampaItem){ try{ const it = JSON.parse(el.trampaItem); if(it && it.nombre) return {...it, unidades: 1}; }catch(e){} }
  let est = {};
  try{ est = JSON.parse(el.trampaEstado || '{}') || {}; }catch(e){}
  const n = (el.celdas || []).length, nombre = String(el.trampaNombre || 'Trampa').slice(0, 40);
  return {nombre, tier: 'Común', imagen: '', tipoItem: 'consumibles', peso: 0, ranuras: 1, precioCompra: 30, unidades: 1, consumible: true, curahp: 0, mods: [],
    detalle: `Trampa desarmada. ${el.trampaDetalle || ''}`.trim(),
    trampaDatos: {nombre, detalle: el.trampaDetalle || '', tipo: 'flor', tamano: n >= 19 ? 2 : n >= 7 ? 1 : 0, color: el.color || '#8A8A8A', alfa: num(el.alfa) || 45,
      dano: el.trampaDano || '', ignoraDef: !!el.trampaIgnoraDef, detectar: desarmarDif(el),
      ...(est.nombre ? {estado: est.nombre} : {}), ...(est.turnos ? {estadoTurnos: est.turnos} : {}), ...(est.stacks ? {estadoStacks: est.stacks} : {}),
      ...(est.salva ? {salvacion: est.salva} : {}), ...(est.elemento ? {elemento: est.elemento} : {})}};
}
// Un intento: la tirada del talento contra la dificultad. o = {conNo2 (en combate: cobra 1 No2), rompe (si falla, se rompe)}. → {ok, texto}.
async function desarmarIntentar(tokenId, trampaId, o){
  o = o || {};
  const t = tokens.get(tokenId), el = elementos.get(trampaId);
  if(!t || !el || !el.trampa || el.disparada) return {ok: false, texto: 'La trampa ya no está.'};
  const formula = tokenDesarmaTrampas(t), nombre = nombreDe(t), nomT = el.trampaNombre ? `«${el.trampaNombre}»` : 'la trampa', dif = desarmarDif(el);
  const r = formula ? tirarDados(formula) : null;
  if(!r) return {ok: false, texto: `${nombre} no tiene con qué tirar Desarmar trampas (abrí su ficha una vez para que lo publique).`};
  try{ await bnCargarPiezas(); }catch(err){ console.error(err); }
  if(o.conNo2){
    const f = fichasPub.get(t.fichaId), quedan = num(f && f.resumen && f.resumen.nitros);
    if(quedan < DESARMAR_TRAMPA_NO2 && !(await AvisoCombate.preguntar(`Desarmar cuesta ${DESARMAR_TRAMPA_NO2} No2 y ${nombre} tiene ${fmt(Math.max(0, quedan))}. ¿Intentarlo igual? Gasta los que tenga.`, {icono: '⚠', titulo: 'Sin No2', si: 'Sí, intentarlo'})))
      return {ok: false, cancelado: true, texto: 'No lo intentó.'};
    try{ await editarPersonajeMapa(t.fichaId, S => { S.nitros = Math.max(0, num(S.nitros) - DESARMAR_TRAMPA_NO2); return true; }); }catch(err){ console.error('No se pudo cobrar el No2 de desarmar:', err); }
  }
  try{ mesaPublicar(`${nombre} · Desarmar trampas (${el.trampaNombre || 'trampa'})`, {...r, quien: nombre, ficha: t.fichaId}); }catch(err){}
  const ok = r.total >= dif;
  if(ok){
    try{ await editarPersonajeMapa(t.fichaId, S => { Recibidos.devolverTrampas(S, [JSON.stringify(trampaComoItem(el))]); return true; }); }
    catch(err){ console.error('No se pudo guardar la trampa desarmada:', err); return {ok: false, texto: 'Se desarmó, pero no se pudo guardar en la mochila: sumala a mano.'}; }
  }
  if(!ok && !o.rompe) trampaPerdio(tokenId, trampaId);
  // Fallar el desarme (dueño, 2026-10-08): 70 % se rompe, 30 % se dispara (sobre quien la desarmaba). Se tira 1d10: 1–7 se rompe, 8–10 se dispara.
  if(!ok && !o.rompe){
    const d = tirarDados('1d10');
    try{ mesaPublicar(`${nombre} · ¿qué pasa con ${el.trampaNombre || 'la trampa'}? (1–7 se rompe, 8–10 se dispara)`, {...d, quien: nombre, ficha: t.fichaId}); }catch(err){}
    if(d && d.total >= 8){
      trampaPendiente = {tokenId, tipo: 'pisa', id: trampaId, el, celda: {col: t.col, fila: t.fila}, desde: null};
      setTimeout(() => { trampaResolver().catch(err => console.error('No se pudo disparar la trampa:', err)); }, 600);
      return {ok: false, texto: `${r.total} contra ${dif}: no pudiste, y ${d.total} en 1d10: ¡${nomT} se dispara!`};
    }
    o = {...o, rompe: true, rompeTxt: `${r.total} contra ${dif}: no pudiste, y ${d ? d.total : '?'} en 1d10: ${nomT} se rompió.`};
  }
  if(ok || o.rompe){
    try{ await coleccionElementos().doc(trampaId).delete(); }
    catch(err){ console.error('No se pudo sacar la trampa del mapa:', err); return {ok, texto: `${r.total} contra ${dif}: ${ok ? `desarmaste ${nomT} (está en tu mochila)` : `${nomT} se rompió`}, pero no se pudo sacar del mapa (¿faltan pegar las reglas?): borrala a mano.`}; }
  }
  if(o.rompeTxt) return {ok, texto: o.rompeTxt};
  return {ok, texto: ok ? `${r.total} contra ${dif}: desarmaste ${nomT} y te la guardaste en la mochila.`
    : o.rompe ? `${r.total} contra ${dif}: ${nomT} se rompió al intentar desarmarla.` : `${r.total} contra ${dif}: no pudiste; ${nomT} sigue armada.`};
}
// Al terminar el combate: la Percepción de quien busca contra la dificultad de esa trampa (la misma tirada de «Algo está fuera de lugar»). → {ok, texto}.
async function desarmarDetectar(tokenId, el){
  const t = tokens.get(tokenId), f = t && fichasPub.get(t.fichaId), nombre = t ? nombreDe(t) : '';
  const r = f && f.resumen ? FichaBotonera.tiradaPercepcionValor(num(f.resumen.percepcion), tokenPercepcionAumentada(t)) : null;
  if(!r) return {ok: false, texto: `${nombre}: sin Percepción para tirar (abrí su ficha una vez para que la publique).`};
  try{ mesaPublicar(`${nombre} · Percepción (busca trampas)`, {...r, quien: nombre, ficha: t.fichaId}); }catch(err){}
  const dif = desarmarDif(el), nomT = el.trampaNombre ? `«${el.trampaNombre}»` : 'una trampa';
  return r.total >= dif ? {ok: true, texto: `Percepción ${r.total} contra ${dif}: encontró ${nomT}.`} : {ok: false, texto: `Percepción ${r.total} contra ${dif}: no encontró nada ahí.`};
}
// Desde el cartel de «Algo está fuera de lugar» (js/16), después de encontrarla: en combate, 1 No2.
async function desarmarDesdeBanner(){
  const pb = percepcionBanner;
  if(!pb || !pb.desarmar) return;
  const trampaId = pb.desarmar;
  pb.desarmar = null;
  pb.resultado = 'Desarmando…';
  renderPercepcionBanner();
  const res = await desarmarIntentar(pb.tokenId, trampaId, {conNo2: modoMapa === 'combate'});
  pb.resultado = res.texto;
  if(percepcionBanner === pb) renderPercepcionBanner();
  if(!res.cancelado){ const t = tokens.get(pb.tokenId); momentoAbrir({tipo: 'desarmar', icono: '🪤', titulo: `${t ? nombreDe(t) : 'Alguien'} intenta desarmar una trampa`, resultado: res.texto, estado: 'listo'}); }
}
// Al terminar el combate: cuando se cierra el botín, a quien maneja un personaje con el talento le pregunta por las trampas rivales que quedaron.
let desarmarFinEnCurso = false;
async function desarmarAlTerminar(){
  if(desarmarFinEnCurso) return;
  desarmarFinEnCurso = true;
  try{
    await new Promise(r => setTimeout(r, 5000));   // el botín se abre solo al terminar: se espera a que se cierre (hasta 20 minutos)
    for(let i = 0; i < 600 && bn && bn.raiz && bn.raiz.querySelector('#bn-botin.open'); i++) await new Promise(r => setTimeout(r, 2000));
    if(modoMapa === 'combate') return;   // empezó otro combate mientras tanto
    for(const [tokenId, t] of tokens){
      if(!tokenDesarmaTrampas(t) || typeof bnManejo !== 'function' || !bnManejo(t.fichaId)) continue;
      const quedan = [...elementos.entries()].filter(([id, el]) => el.trampa && !el.disparada && trampaDispara(t, el) && !trampaIntentoPerdido.has(tokenId + ':' + id)).map(([id]) => id);
      if(!quedan.length) continue;
      const nombre = nombreDe(t);
      // Primero hay que encontrarlas (dueño, 2026-10-08): Percepción contra su dificultad; la que encuentra, intenta desarmarla (la que no desarma, se rompe).
      const si = await AvisoCombate.preguntar(`Puede que hayan quedado trampas sin activarse. ¿${nombre} quiere buscarlas? Tira Percepción por cada una; la que encuentra, intenta desarmarla (si no la desarma, se rompe).`,
        {icono: '🪤', titulo: '¿Querés detectarlas?', si: 'Sí, buscarlas', no: 'Dejarlas'});
      if(!si) continue;
      const lineas = [];
      for(const id of quedan){
        const el = elementos.get(id);
        if(!el) continue;
        const det = await desarmarDetectar(tokenId, el);
        if(!det.ok){ lineas.push(det.texto); continue; }
        const res = await desarmarIntentar(tokenId, id, {rompe: true});
        lineas.push(`${det.texto} ${res.texto}`);
      }
      AvisoCombate.mostrar({icono: '🪤', titulo: `${nombre}: trampas desarmadas`, pasos: lineas.map((l, i) => ({titulo: `Trampa ${i + 1}`, texto: l}))});
      momentoAbrir({tipo: 'desarmar', icono: '🪤', titulo: `${nombre} desarma las trampas que quedaron`, estado: 'listo', datos: {lineas}});
    }
  }catch(err){ console.error('Desarmar trampas al terminar el combate:', err); }
  finally{ desarmarFinEnCurso = false; trampaIntentoPerdido.clear(); }
}
