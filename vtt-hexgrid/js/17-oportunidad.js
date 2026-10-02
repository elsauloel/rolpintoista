// js/17-oportunidad.js — el ataque de oportunidad (2026-10-02, pedido del dueño). Solo funciones (las usan js/06, js/08 y js/16).
/* ---------- Ataque de oportunidad ----------
   Cuando un token se aleja (deja de estar al lado) de un rival que PUEDE aprovecharlo —le alcanzan los No2 para un ataque de
   oportunidad con alguna de sus manos: `opor` en el resumen de un creep (sus No2 no son públicos), `nitros ≥ oporCosto` en el de un
   personaje o una invocación; sin el dato, se pregunta igual—, el movimiento se FRENA en el último casillero al lado de ese rival
   (`oportunidadCorte`, desde rutaSoltada) y queda guardado el resto del camino. Es un momento (js/16):
   - quien controla al rival (el GM si es un creep o si tiene 🎮 el control; si no, el jugador dueño) ve al centro «⚔ Fulano se aleja de
     vos. ¿Ataque de oportunidad?» → No: el otro sigue su camino tal como lo había marcado; Sí: si tiene más de un arma con No2
     suficientes, «¿con qué arma?»; y se abre el duelo (tipo 'oportunidad': siempre Tipo ÷ 2, lo paga al tirar su PdG en el duelo);
   - quien se aleja ve al centro «esperando…» (con «Seguir sin esperar», por si nadie contesta); si lo atacan, su camino se descarta: al
     terminar el duelo sigue su turno como quiera;
   - el resto, en la esquina.
   La oportunidad dura lo que dura el contacto cuerpo a cuerpo (regla del dueño, 2026-10-02): una vez ofrecida (pegue, falle, la dejen
   pasar o no alcancen los No2) queda usada MIENTRAS los dos sigan pegados — quien se frenó puede alejarse después sin otro ataque —;
   apenas dejan de estar al lado (se mueva quien se mueva), se renueva: volver a pegarse y alejarse, aunque sea en el mismo turno o en el
   mismo arrastre, es otro ataque de oportunidad. Sin tope: tantos como alcancen los No2. No aplica en modo narrativo, con 🦶 Mover libre,
   a un token oculto ni a uno en sigilo. */
let oportunidadPendiente = null;          // {tokenId, rivalId, resto} frenado acá, a resolver al llegar
const oportunidadUsadas = new Set();      // 'mover|rival': ya se ofreció y siguen pegados (se borra apenas dejan de estar al lado)
let oporEspera = null;                    // pantalla de quien se aleja: {momentoId, tokenId, rivalId, resto, resultado}
let oporDecision = null;                  // pantalla de quien decide: {id, d, armas, paso}

const oporClave = (m, r) => m + '|' + r;
const oporAlLado = (m, r) => { const a = tokens.get(m), b = tokens.get(r); return !!(a && b) && distanciaHex({col: a.col, fila: a.fila}, {col: b.col, fila: b.fila}) === 1; };
const oporUsada = (m, r) => { oporLimpiar(); return oportunidadUsadas.has(oporClave(m, r)); };
const oporMarcar = (m, r) => oportunidadUsadas.add(oporClave(m, r));
// Se olvidan los pares que ya no están pegados (lo llama la llegada de los tokens, js/09: también si se movió el rival).
function oporLimpiar(){
  for(const k of [...oportunidadUsadas]){ const [m, r] = k.split('|'); if(!oporAlLado(m, r)) oportunidadUsadas.delete(k); }
}
const rutaTokenId = t => { for(const [id, x] of tokens) if(x === t) return id; return ''; };   // la clave de un token (no la lleva adentro)
// ¿Le alcanzan los No2? (lo público; sin el dato, sí: mejor preguntar que perderlo)
function oporPuede(r){
  const v = vinculo(r), rs = v && v.resumen;
  if(!rs) return true;
  if(r.tipo === 'creep') return rs.opor !== false;
  if(rs.oporCosto === undefined || rs.nitros === undefined || rs.nitros === null) return true;
  return num(rs.nitros) >= num(rs.oporCosto);
}
// El primer punto del camino en que se aleja de un rival que puede aprovecharlo → {indice (último casillero al lado), rivalId} o null.
function oportunidadCorte(t, id, ruta){
  if(modoMapa !== 'combate') return null;   // en modo narrativo no hay ataques de oportunidad: se mueve sin frenar
  if(!t || t.oculto || enSigilo(t) || !ruta || ruta.length < 2) return null;
  const rivales = new Set(rivalesDe(t));
  const ids = [...tokens.entries()].filter(([, r]) => rivales.has(r) && oporPuede(r)).map(([rid, r]) => ({rid, r, usada: oporUsada(id, rid)}));
  if(!ids.length) return null;
  for(let i = 1; i < ruta.length; i++){
    const antes = ruta[i - 1], despues = ruta[i];
    for(const o of ids){
      const c = {col: o.r.col, fila: o.r.fila};
      if(distanciaHex(antes, c) === 1 && distanciaHex(despues, c) > 1){
        if(!o.usada) return {indice: i - 1, rivalId: o.rid};
        o.usada = false;   // se alejó con la oportunidad ya usada: si se vuelve a pegar, es otra
      }
    }
  }
  return null;
}
// Quién decide por el rival: 'gm' (un creep, o un personaje con 🎮 el control del GM) o el uid del jugador dueño.
function oporDecide(r){
  if(r.tipo === 'creep') return 'gm';
  const f = fichasPub.get(String(r.fichaId || '').split(SEP_INVOCACION)[0]);
  return (f && f.resumen && f.resumen.control) || (f && f.duenoUid) || r.duenoUid || 'gm';
}
// El registro en la Mesa (el dueño quiere que el evento quede en el log, no solo en el momento): la línea roja de siempre al frenarse,
// y una línea con cómo terminó.
async function oporMesa(texto, desde){
  if(!fbDb || !fbUsuario || !fbMiembro) return;
  try{
    await fbDb.collection(fbRutaCampana('tiradas')).add({
      uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: '', origen: '⚔ ' + texto,
      formula: '', rolls: [], mod: 0, total: 0, desde: desde || 'recordatorio',
      cuando: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }catch(err){ console.error('No se pudo anotar el ataque de oportunidad en la Mesa:', err); }
}
const oporSoyDecisor = d => !!(d && d.datos) && (d.datos.decide === 'gm' ? soyGM : d.datos.decide === fbUsuario.uid);

// En la pantalla de quien se aleja, al llegar al casillero donde se frenó.
async function oportunidadResolver(){
  const p = oportunidadPendiente;
  oportunidadPendiente = null;
  if(!p) return;
  const t = tokens.get(p.tokenId), r = tokens.get(p.rivalId);
  if(!t || !r) return;
  oporMarcar(p.tokenId, p.rivalId);
  const decide = oporDecide(r);
  oporEspera = {...p, momentoId: null, resultado: null};
  const e = oporEspera;
  oporMesa(`${nombreDe(t)} se alejó de ${nombreDe(r)}: posible ataque de oportunidad`, 'alerta-roja');
  renderOporEspera();
  e.momentoId = await momentoAbrir({tipo: 'oportunidad', icono: '⚔', titulo: `${nombreDe(t)} se aleja de ${nombreDe(r)}…`, estado: 'esperando', resuelve: decide,
    datos: {centro: true, moverId: p.tokenId, rivalId: p.rivalId, decide}});
  if(!e.momentoId && oporEspera === e){ oporEspera = null; renderOporEspera(); oporContinuar(e); }   // sin reglas publicadas: sigue como antes
}
function renderOporEspera(){
  let el2 = document.getElementById('opor-espera');
  if(!oporEspera){ if(el2) el2.hidden = true; return; }
  if(!el2){ el2 = document.createElement('div'); el2.id = 'opor-espera'; momentoEstiloCentro(el2); document.body.appendChild(el2); }
  el2.hidden = false;
  const r = tokens.get(oporEspera.rivalId);
  const nomR = r ? nombreDe(r) : 'el rival';
  el2.innerHTML = oporEspera.resultado
    ? `<span>⚔ ${esc(oporEspera.resultado)}</span><button type="button" class="btn" id="opor-espera-ok">Entendido</button>`
    : `<span>⚔ Te alejás de <b>${esc(nomR)}</b>: esperando a ver si aprovecha el ataque de oportunidad…</span><button type="button" class="btn" id="opor-espera-seguir" title="Si nadie contesta: seguís tu camino como lo marcaste">Seguir sin esperar</button>`;
  const ok = document.getElementById('opor-espera-ok'); if(ok) ok.onclick = () => { oporEspera = null; renderOporEspera(); };
  const seg = document.getElementById('opor-espera-seguir');
  if(seg) seg.onclick = () => {
    const e = oporEspera; oporEspera = null; renderOporEspera();
    if(e.momentoId) momentoActualizar(e.momentoId, {estado: 'no', resultado: '…nadie contestó: sigue su camino.'});
    const t = tokens.get(e.tokenId), r = tokens.get(e.rivalId);
    oporMesa(`${t ? nombreDe(t) : 'Quien se alejaba'} siguió sin esperar: ${r ? nombreDe(r) : 'el rival'} no contestó a tiempo`);
    oporContinuar(e);
  };
}
// Sigue el camino que había marcado, desde donde se frenó (el resto pasa por las mismas reglas: trampas, percepción, otros rivales).
function oporContinuar(e){
  const t = tokens.get(e.tokenId);
  if(!t || !e.resto || e.resto.length < 2) return;
  const ruta = e.resto.map(c => ({col: c.col, fila: c.fila}));
  const fin = ruta[ruta.length - 1], pc = hexCentro(fin.col, fin.fila);
  rutaSoltada({id: e.tokenId, ruta, movio: true, libre: false, costo: costoMoverDe(t), x: pc.x, y: pc.y}, t);
  pedirDibujo();
}

// Llega o cambia un momento de oportunidad (lo llama momentoRecibido, js/16).
function oporMomento(id, d){
  if(d.tipo !== 'oportunidad') return;
  // Quien decide: la pregunta al centro.
  if(d.estado === 'esperando' && oporSoyDecisor(d) && !(oporDecision && oporDecision.id === id)){ oporDecision = {id, d, paso: 'pregunta', armas: null}; renderOporDecision(); }
  if(d.estado !== 'esperando' && oporDecision && oporDecision.id === id && !oporDecision.cerrar){ oporDecision = null; renderOporDecision(); }   // lo contestó otra pantalla
  // Quien se aleja: la respuesta.
  if(oporEspera && oporEspera.momentoId === id && !oporEspera.resultado){
    if(d.estado === 'no'){ const e = oporEspera; oporEspera = null; renderOporEspera(); oporContinuar(e); toast(`⚔ ${d.resultado && /nadie/.test(d.resultado) ? 'Seguís tu camino' : 'Te dejó pasar: seguís tu camino'}`); }
    else if(d.estado === 'si'){
      const r = tokens.get(oporEspera.rivalId);
      oporEspera.resultado = `${r ? nombreDe(r) : 'El rival'} te ataca de oportunidad: resolvé el duelo y después seguí tu turno como quieras.`;
      renderOporEspera();
    }
  }
}
function renderOporDecision(){
  let el2 = document.getElementById('opor-decision');
  if(!oporDecision){ if(el2) el2.hidden = true; return; }
  if(!el2){ el2 = document.createElement('div'); el2.id = 'opor-decision'; momentoEstiloCentro(el2); el2.style.top = '50%'; el2.style.zIndex = '78'; document.body.appendChild(el2); }
  el2.hidden = false;
  const dt = oporDecision.d.datos || {};
  const m = tokens.get(dt.moverId), r = tokens.get(dt.rivalId);
  const nomM = m ? nombreDe(m) : 'Alguien', nomR = r ? nombreDe(r) : 'tu personaje';
  if(oporDecision.paso === 'arma'){
    el2.innerHTML = `<div style="flex:1 1 100%">⚔ <b>¿Con qué arma ataca ${esc(nomR)}?</b></div>` + oporDecision.armas.map((a, i) =>
      `<button type="button" class="btn" data-opor-arma="${i}">${esc(a.nombre)} — ${esc(a.costo)} No2</button>`).join('') +
      `<button type="button" class="btn" data-opor-no="1">Mejor no</button>`;
  }else{
    el2.innerHTML = `<div style="flex:1 1 100%">⚔ <b>${esc(nomM)}</b> se aleja de <b>${esc(nomR)}</b>. ¿Ataque de oportunidad?</div>
      <button type="button" class="btn primary" data-opor-si="1">Sí, atacar</button><button type="button" class="btn" data-opor-no="1">No, dejarlo pasar</button>`;
  }
  el2.querySelectorAll('[data-opor-no]').forEach(b => b.onclick = () => oporResponder(false));
  el2.querySelectorAll('[data-opor-si]').forEach(b => b.onclick = () => oporResponder(true));
  el2.querySelectorAll('[data-opor-arma]').forEach(b => b.onclick = () => oporAtacar(oporDecision.armas[num(b.dataset.oporArma)]));
}
async function oporResponder(si){
  const od = oporDecision;
  if(!od) return;
  if(!si){
    oporDecision = null; renderOporDecision();
    momentoActualizar(od.id, {estado: 'no', resultado: '…y lo deja pasar.'});
    const dt = od.d.datos || {}, m = tokens.get(dt.moverId), r = tokens.get(dt.rivalId);
    oporMesa(`${r ? nombreDe(r) : 'El rival'} dejó pasar a ${m ? nombreDe(m) : 'quien se alejaba'}: no hubo ataque de oportunidad`);
    return;
  }
  // Con qué puede atacar: las armas (o la mano limpia) a las que les alcanzan los No2.
  const dt = od.d.datos || {}, r = tokens.get(dt.rivalId);
  if(!r){ oporDecision = null; renderOporDecision(); return; }
  let armas = [];
  try{ armas = await oporArmasDe(r); }catch(err){ console.error('No se pudieron leer las armas para el ataque de oportunidad:', err); }
  if(!armas.length){ toast('No le alcanzan los No2 para un ataque de oportunidad con ninguna mano'); return; }
  if(armas.length === 1){ oporAtacar(armas[0]); return; }
  od.armas = armas; od.paso = 'arma';
  renderOporDecision();
}
// [{nombre, costo, yo, ataque}] para el duelo, de quien ataca (creep, personaje o invocación).
async function oporArmasDe(r){
  const nombre = nombreDe(r);
  if(r.tipo === 'creep'){
    const sc = creepPrivadoDe(r.fichaId);
    if(!sc) return [];
    const costo = CreepCalculo.costoContraataque(sc);
    const n = sc.nitros === null || sc.nitros === undefined ? CreepCalculo.nitrosMax(sc) : num(sc.nitros);
    if(n < costo) return [];
    return [{nombre: sc.armaNombre || 'su arma', costo, yo: {ref: r.fichaId, tipo: 'creep', nombre},
      ataque: {tipo: 'oportunidad', armaId: '', armaNombre: sc.armaNombre || '', tipoDado: num(sc.armaTipo) || 8, rango: !!sc.armaDeRango, alcance: CreepCalculo.alcance(sc)}}];
  }
  await bnCargarPiezas();
  const [fichaId, invId] = String(r.fichaId).split(SEP_INVOCACION);
  const c = await FichaGuardado.cargar(fbDb, fbRutaCampana(`fichas/${fichaId}`), {mezclarCatalogo: bnMezclarCatalogo});
  if(!c || !c.S) return [];
  const S = c.S;
  if(invId){
    const inv = (S.invocaciones || []).find(x => x && x.id === invId);
    if(!inv) return [];
    const costo = Combatiente.costoPrimerAtaque(num(inv.armaTipo) || 8);
    if(num(inv.nitros) < costo) return [];
    return [{nombre: inv.armaNombre || 'su arma', costo, yo: {ref: r.fichaId, tipo: 'pj', nombre},
      ataque: {tipo: 'oportunidad', armaId: '', armaNombre: inv.armaNombre || '', tipoDado: num(inv.armaTipo) || 8, rango: !!inv.armaDeRango, alcance: 1}}];
  }
  const disponibles = S.nitros === null || S.nitros === undefined ? num(FichaCalculo.calcular(S).final.nitros) : num(S.nitros);
  const lista = FichaCombate.armasEquipadasConDano(S).map(x => x.item);
  return (lista.length ? lista : [null]).map(arma => ({arma, costo: FichaCombate.costoAtaqueEspecial(arma)}))
    .filter(x => x.costo <= disponibles)
    .map(({arma, costo}) => ({nombre: arma ? arma.nombre : 'sin arma', costo, yo: {ref: fichaId, tipo: 'pj', nombre},
      ataque: {tipo: 'oportunidad', armaId: arma ? arma.id : '', armaNombre: arma ? arma.nombre : '', tipoDado: FichaCombate.tipoAtaque(arma), rango: !!(arma && arma.armaDeRango), alcance: FichaCombate.alcanceDeArma(S, arma)}}));
}
async function oporAtacar(a){
  const od = oporDecision;
  if(!od || !a) return;
  od.cerrar = true;
  oporDecision = null; renderOporDecision();
  const dt = od.d.datos || {}, m = tokens.get(dt.moverId), r = tokens.get(dt.rivalId);
  if(!m){ toast('Quien se alejaba ya no está en el mapa'); return; }
  const conArma = a.nombre && a.nombre !== 'sin arma' && a.nombre !== 'su arma' ? ` con ${a.nombre}` : '';
  await momentoActualizar(od.id, {estado: 'si', resultado: `…y ${r ? nombreDe(r) : 'su rival'} lo ataca de oportunidad${conArma}.`});
  oporMesa(`${r ? nombreDe(r) : 'El rival'} ataca de oportunidad a ${nombreDe(m)}${conArma}`);
  try{
    await Duelo.crear({yo: a.yo, ataque: a.ataque}, {id: dt.moverId, nombre: nombreDe(m), tipo: m.tipo, fichaId: m.fichaId, duenoUid: m.duenoUid}, dt.rivalId);
  }catch(err){
    console.error('No se pudo abrir el duelo de oportunidad:', err);
    toast('No se pudo abrir el duelo: ' + String((err && err.message) || err).slice(0, 120));
  }
}
