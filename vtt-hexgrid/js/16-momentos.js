// js/16-momentos.js — los momentos (2026-10-02, P146) y «algo está fuera de lugar» (Percepción aumentada, P145). Va después del arranque:
// solo define funciones y escuchas (la escucha de los momentos arranca sola cuando hay sesión).
/* ---------- Momentos (P146, pedido del dueño: "que tengan su momento", no que pasen silbando bajito por la Mesa) ----------
   Lo que pasa en el mapa —percepción, zonas, trampas que se disparan, sigilo roto— es un documento de `campanas/<id>/momentos`
   ({tipo, icono, titulo, resultado, estado, resuelve, datos}) que ven TODAS las pantallas:
   - quien tiene que resolverlo (tirar algo) lo ve en un cartelito al CENTRO de su pantalla (`momentoEstiloCentro`), con su botón;
   - **el Aviso** (nombre dado por el dueño, 2026-10-02): a quien le pasó algo (`datos.paraUid`; ej. pisó una trampa) se le cuenta en el
     mismo cartelito del centro, con «Entendido» (`momentoAvisoCentro`, `#momento-aviso-centro`). `datos.aviso: true` = le llega aunque lo
     haya publicado su propia pantalla;
   - **la Crónica** (nombre dado por el dueño, 2026-10-02): los demás lo ven en la ESQUINA de arriba a la derecha del mapa
     (`#momentos-feed`), siempre igual —mismo lugar, misma tarjeta: ícono, título y resultado—, sin interrumpir su juego: el título apenas
     empieza y el resultado cuando se resuelve; cada tarjeta se va sola a los ~14 s de su último cambio.
   Todo lo que el resto de la mesa tenga que enterarse en el mapa va por acá (momentoAbrir), no por un cartel propio.
   Se cuenta lo que ya es público (el daño que recibe un creep, no la vida que le queda; el nombre de una trampa descubierta; un oculto sin
   descubrir no se nombra). `datos.centro`: quien lo creó lo sigue en un cartelito del centro (no se le repite en la esquina). */
const MOMENTO_DURA_MS = 14000;
const momentosDesde = Date.now() - 5000;   // los que ya estaban al entrar no se muestran
let momentosEscucha = null;
const momentosFeed = new Map();   // id → {d, hasta, orden}
let momentosOrden = 0;
const coleccionMomentos = () => fbDb.collection(fbRutaCampana('momentos'));

// El cartelito de quien resuelve: al centro de la pantalla, sin oscurecer.
function momentoEstiloCentro(el2){
  el2.style.cssText = 'position:fixed;left:50%;top:42%;transform:translate(-50%,-50%);z-index:76;background:#151a26;border:1px solid #c98545;border-radius:12px;padding:16px 20px;display:flex;align-items:center;gap:14px;box-shadow:0 12px 40px rgba(0,0,0,.6);min-width:min(340px,92vw);max-width:min(560px,92vw);flex-wrap:wrap;justify-content:center;color:#e9ecf4;font-size:16px;text-align:center';
}
async function momentoAbrir(m){   // → id del momento (o null si no se pudo: sin reglas publicadas, sin sesión)
  if(!fbDb || !fbUsuario || !fbMiembro) return null;
  try{
    const ref = await coleccionMomentos().add({
      tipo: String(m.tipo || ''), icono: String(m.icono || ''), titulo: String(m.titulo || '').slice(0, 200),
      ...(m.resultado ? {resultado: String(m.resultado).slice(0, 400)} : {}),
      estado: String(m.estado || ''), resuelve: String(m.resuelve || ''), datos: m.datos || {},
      creadoPor: fbUsuario.uid, creado: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return ref.id;
  }catch(err){ console.error('No se pudo publicar el momento (¿faltan publicar las reglas?):', err); return null; }
}
async function momentoActualizar(id, cambios){
  if(!id) return;
  const c = {...cambios};
  if(c.resultado !== undefined) c.resultado = String(c.resultado).slice(0, 400);
  try{ await coleccionMomentos().doc(id).update(c); }catch(err){ console.error('No se pudo actualizar el momento:', err); }
}
function momentosEscuchar(){
  if(momentosEscucha || !fbDb || !fbUsuario || !fbMiembro) return;
  momentosEscucha = coleccionMomentos().orderBy('creado', 'desc').limit(20).onSnapshot(snap => {
    snap.docChanges().forEach(ch => {
      if(ch.type === 'removed') return;
      const d = ch.doc.data();
      const ms = d.creado && d.creado.toMillis ? d.creado.toMillis() : Date.now();
      if(ms < momentosDesde) return;
      momentoRecibido(ch.doc.id, d);
    });
  }, err => console.error('Error escuchando los momentos:', err));
  if(soyGM) momentosBarrerViejos();
}
// El GM borra los de más de 2 horas al entrar (no hace falta guardarlos: la Mesa queda como registro).
async function momentosBarrerViejos(){
  try{
    const viejo = firebase.firestore.Timestamp.fromMillis(Date.now() - 2 * 3600 * 1000);
    const snap = await coleccionMomentos().where('creado', '<', viejo).limit(200).get();
    if(snap.empty) return;
    const lote = fbDb.batch();
    snap.docs.forEach(d => lote.delete(d.ref));
    await lote.commit();
  }catch(err){ console.error('No se pudieron barrer los momentos viejos:', err); }
}
const momentosArranque = setInterval(() => { if(typeof fbMiembro !== 'undefined' && fbMiembro && fbUsuario && fbDb){ clearInterval(momentosArranque); momentosEscuchar(); } }, 1000);

function momentoRecibido(id, d){
  oporMomento(id, d);   // el ataque de oportunidad: la pregunta a quien decide y la respuesta a quien se aleja (js/17)
  // El pedido de detección al GM (P145): la pantalla del GM tira la Destreza del oculto.
  if(d.tipo === 'sigilo-pedido' && d.estado === 'esperandoGM' && soyGM) deteccionGMAbrir(id, d);
  // Quien está esperando la respuesta en su cartelito.
  if(percepcionBanner && percepcionBanner.momentoId === id && d.estado === 'listo' && !percepcionBanner.resultado) percepcionRespuesta(d);
  // Si otra pantalla del GM ya lo resolvió, esta cierra su cartelito.
  if(deteccionBanner && deteccionBanner.id === id && d.estado === 'listo' && deteccionBanner.resultado === null){ deteccionBanner = null; renderDeteccionBanner(); }
  // Lo que me toca a mí (el jugador dueño, cuando el GM toma o devuelve el control de su personaje): al centro, no en la esquina.
  // (datos.aviso: el Aviso de lo que le pasó, ej. una trampa — le llega aunque lo haya publicado su propia pantalla.)
  if(d.datos && d.datos.paraUid && d.datos.paraUid === fbUsuario.uid && (d.creadoPor !== fbUsuario.uid || d.datos.aviso)){ momentoAvisoCentro(id, d); return; }
  // La esquina: todo, salvo lo que esta pantalla ya sigue al centro.
  const mio = d.creadoPor === fbUsuario.uid && d.datos && d.datos.centro;
  if(d.tipo === 'oportunidad' && oporSoyDecisor(d)){ momentosFeed.delete(id); renderMomentosFeed(); return; }   // lo decide esta pantalla, al centro
  const delGM = d.tipo === 'sigilo-pedido' && soyGM && (d.estado === 'esperandoGM' || (deteccionBanner && deteccionBanner.id === id));
  if(delGM) momentosFeed.delete(id);
  if(mio || delGM){ renderMomentosFeed(); return; }
  const ya = momentosFeed.get(id);
  momentosFeed.set(id, {d, hasta: Date.now() + MOMENTO_DURA_MS, orden: ya ? ya.orden : ++momentosOrden});   // el más nuevo, arriba
  renderMomentosFeed();
}
let momentosFeedTimer = null;
function renderMomentosFeed(){
  const caja = $('#lienzo-caja');
  if(!caja) return;
  let feed = document.getElementById('momentos-feed');
  if(!feed){
    feed = document.createElement('div');
    feed.id = 'momentos-feed';
    feed.style.cssText = 'position:absolute;right:12px;top:118px;width:min(300px,60vw);z-index:31;display:flex;flex-direction:column;gap:6px;pointer-events:none';
    caja.appendChild(feed);
  }
  const ahora = Date.now();
  momentosFeed.forEach((v, k) => { if(v.hasta < ahora) momentosFeed.delete(k); });
  const lista = [...momentosFeed.entries()].sort((a, b) => b[1].orden - a[1].orden).slice(0, 4);
  feed.innerHTML = lista.map(([k, v]) => {
    const d = v.d, queda = v.hasta - ahora;
    return `<div style="pointer-events:auto;background:rgba(21,26,38,.94);border:1px solid #39435c;border-left:3px solid #c98545;border-radius:8px;padding:8px 10px;color:#e9ecf4;font-size:13px;line-height:1.35;box-shadow:0 6px 18px rgba(0,0,0,.45);opacity:${queda < 1500 ? Math.max(0.15, queda / 1500) : 1};transition:opacity .4s">
      <div><span style="font-size:15px">${esc(d.icono || '•')}</span> <b>${esc(d.titulo || '')}</b></div>
      ${d.lineas ? d.lineas.map((l, i) => `<div style="margin-top:3px;color:${i === d.lineas.length - 1 ? '#e9ecf4' : '#9aa3b8'}">${esc(l)}</div>`).join('')
        : d.resultado ? `<div style="margin-top:3px;color:#cfd6e6">${esc(d.resultado)}</div>` : (d.estado === 'listo' ? '' : '<div style="margin-top:3px;color:#8d97ad">…</div>')}
    </div>`;
  }).join('');
  clearTimeout(momentosFeedTimer);
  if(momentosFeed.size) momentosFeedTimer = setTimeout(renderMomentosFeed, 500);
}

/* ---------- Un duelo que esta pantalla no tiene abierto (P151, dueño 2026-10-03) ----------
   comun/duelo.js avisa cada paso (contacto, Bloqueo, crítico, daño, efectos, fin) recién cuando los dados quedaron quietos: una tarjeta por
   duelo en la Crónica, con un renglón por paso (el último, resaltado). Es local: cada pantalla la arma con el duelo que ya escucha, sin
   escribir nada. */
function dueloPasoCronica(d, nuevos, todos){
  const id = 'duelo:' + d.id;
  const ya = momentosFeed.get(id);
  momentosFeed.set(id, {d: {icono: d.hab ? '✨' : '⚔', titulo: `${d.atacante.nombre} → ${d.defensor.nombre}${d.hab ? ' · ' + d.hab.nombre : ''}`,
    lineas: todos.map(p => p.txt), estado: 'listo'}, hasta: Date.now() + MOMENTO_DURA_MS, orden: ya ? ya.orden : ++momentosOrden});
  renderMomentosFeed();
}

/* ---------- «Algo está fuera de lugar» (Percepción aumentada, P145) ----------
   El cartelito del centro, en la pantalla de quien camina. Dos casos: una trampa oculta al lado (trampaId) o un rival en sigilo en su zona
   de alerta (ocultoId). Tira Percepción (la de la ficha, con el dado un escalón más alto; sale en la Mesa como una Percepción cualquiera).
   - Trampa: gana si llega a su dificultad (`trampaDetectar`, 8 si no tiene) → `descubierta` (la ve todo el equipo).
   - Sigilo: la Destreza del creep es privada del GM → el momento pasa a «esperandoGM» y la pantalla del GM la tira (deteccionGMAbrir);
     gana el que detecta si su Percepción es MAYOR (empate: el oculto sigue escondido). Si gana, el GM le saca el Sigilo. */
let percepcionBanner = null;            // {tokenId, trampaId?, ocultoId?, momentoP, momentoId, resultado, esperando}
let percepcionSigiloPendiente = null;   // {tokenId, ocultoId, celda} cortado por la zona de alerta, se resuelve al llegar
const percepcionChequeados = new Set(); // 'token:oculto:casillero' que ya pidieron la tirada (sigilo)
function percepcionAbrir(o){
  const t = tokens.get(o.tokenId);
  if(!t) return;
  percepcionBanner = {...o, resultado: null, esperando: false, momentoId: null};
  percepcionBanner.momentoP = momentoAbrir({tipo: o.ocultoId ? 'sigilo-pedido' : 'percepcion', icono: '🔎', titulo: `${nombreDe(t)} siente que algo está fuera de lugar…`,
    estado: 'tirando', resuelve: fbUsuario.uid, datos: {centro: true}});
  const pb = percepcionBanner;
  pb.momentoP.then(id => { pb.momentoId = id; });
  renderPercepcionBanner();
}
function percepcionSigiloResolver(){
  const p = percepcionSigiloPendiente;
  percepcionSigiloPendiente = null;
  if(!p) return;
  const c = p.celda;
  percepcionChequeados.add(p.tokenId + ':' + p.ocultoId + ':' + nbPack(c.col, c.fila));
  percepcionAbrir({tokenId: p.tokenId, ocultoId: p.ocultoId});
}
function renderPercepcionBanner(){
  let el2 = document.getElementById('percepcion-banner');
  if(!percepcionBanner){ if(el2) el2.hidden = true; return; }
  if(!el2){
    el2 = document.createElement('div');
    el2.id = 'percepcion-banner';
    momentoEstiloCentro(el2);
    document.body.appendChild(el2);
  }
  el2.hidden = false;
  const t = tokens.get(percepcionBanner.tokenId);
  const quien = t ? nombreDe(t) : '';
  el2.innerHTML = percepcionBanner.resultado
    ? `<span>🔎 ${esc(quien)}: ${esc(percepcionBanner.resultado)}</span><button type="button" class="btn" id="percepcion-banner-ok">Listo</button>`
    : percepcionBanner.esperando
      ? `<span>🔎 ${esc(quien)} sacó ${esc(percepcionBanner.total)}… <span style="color:#8d97ad">esperando qué pasa</span></span>`
      : `<span>🔎 <b>Algo está fuera de lugar…</b> ${esc(quien)}, tirá Percepción</span><button type="button" class="btn" id="percepcion-banner-ir">🎲 Tirar Percepción</button>`;
  const bt = document.getElementById('percepcion-banner-ir'); if(bt) bt.onclick = percepcionResolverBanner;
  const bo = document.getElementById('percepcion-banner-ok'); if(bo) bo.onclick = () => { percepcionBanner = null; renderPercepcionBanner(); };
}
async function percepcionResolverBanner(){
  const pb = percepcionBanner;
  if(!pb || pb.resultado || pb.esperando) return;
  const bt = document.getElementById('percepcion-banner-ir'); if(bt) bt.disabled = true;
  const t = tokens.get(pb.tokenId);
  if(!t){ percepcionBanner = null; renderPercepcionBanner(); return; }
  try{ await bnCargarPiezas(); }catch(err){ console.error(err); toast('No se pudo tirar Percepción'); if(bt) bt.disabled = false; return; }
  const f = fichasPub.get(String(t.fichaId).split(SEP_INVOCACION)[0]);
  const valor = f && f.resumen ? num(f.resumen.percepcion) : 0;
  const r = FichaBotonera.tiradaPercepcionValor(valor, true);
  if(!r){ toast('Percepción: sin valor para tirar (abrí la ficha una vez para que lo publique)'); percepcionBanner = null; renderPercepcionBanner(); return; }
  const nombre = nombreDe(t);
  try{ mesaPublicar(`${nombre} · Percepción (aumentada)`, {...r, quien: nombre, ficha: String(t.fichaId).split(SEP_INVOCACION)[0]}); }catch(err){}
  const mid = await pb.momentoP;
  if(pb.ocultoId){
    // Sigilo: la resuelve la pantalla del GM (la Destreza del oculto es privada).
    pb.esperando = true; pb.total = r.total; pb.momentoId = mid;
    renderPercepcionBanner();
    if(!mid){ pb.esperando = false; pb.resultado = 'no se pudo avisar al GM (¿faltan publicar las reglas?)'; renderPercepcionBanner(); return; }
    momentoActualizar(mid, {estado: 'esperandoGM', resuelve: 'gm', datos: {centro: true, ocultoId: pb.ocultoId, detectorId: pb.tokenId, detector: nombre, percepcion: r.total}});
    return;
  }
  const el = elementos.get(pb.trampaId);
  const dif = el ? Math.max(1, Math.round(num(el.trampaDetectar)) || 8) : Infinity;
  if(el && !el.disparada && r.total >= dif){
    descubrirTrampa(pb.trampaId);   // ya, en esta pantalla
    try{ await coleccionElementos().doc(pb.trampaId).update({descubierta: true}); }   // y para todo su equipo
    catch(err){ console.error('No se pudo marcar la trampa como descubierta (¿faltan publicar las reglas?):', err); }
    pb.resultado = `encontraste algo: ${el.trampaNombre ? `«${el.trampaNombre}», ` : ''}una trampa (${r.total} contra ${dif}).`;
    momentoActualizar(mid, {estado: 'listo', resultado: `…y encuentra una trampa${el.trampaNombre ? `: «${el.trampaNombre}»` : ''}.`});
  }else{
    pb.resultado = 'Mmm... Puede que estés flasheando.';   // texto del dueño (2026-10-02); la tirada ya está en la Mesa
    momentoActualizar(mid, {estado: 'listo', resultado: 'Mmm... puede que esté flasheando.'});
  }
  renderPercepcionBanner();
}
// La respuesta del GM a un pedido de sigilo, en el cartelito de quien buscaba.
function percepcionRespuesta(d){
  const pb = percepcionBanner;
  pb.esperando = false;
  pb.resultado = d.datos && d.datos.detectado ? `¡Encontraste a alguien! ${d.datos.ocultoNombre ? d.datos.ocultoNombre + ' estaba escondido.' : ''}` : 'Mmm... Puede que estés flasheando.';
  renderPercepcionBanner();
}

/* ---------- El pedido de detección, en la pantalla del GM (P145) ----------
   Al centro, porque el GM es quien resuelve: «Silvia siente que algo está fuera de lugar… <oculto> tira Destreza». Tira la Destreza del
   creep (la misma tirada de stat de siempre, con sus estados), compara con la Percepción que mandó el jugador y, si la Percepción es mayor,
   le saca el Sigilo (romperSigilo, sin repetir el momento). La tirada del oculto no va a la Mesa: lo delataría. */
let deteccionBanner = null;   // {id, d, resultado}
function deteccionGMAbrir(id, d){
  if(deteccionBanner && deteccionBanner.id === id) return;
  deteccionBanner = {id, d, resultado: null};
  renderDeteccionBanner();
}
function renderDeteccionBanner(){
  let el2 = document.getElementById('deteccion-banner');
  if(!deteccionBanner){ if(el2) el2.hidden = true; return; }
  if(!el2){
    el2 = document.createElement('div');
    el2.id = 'deteccion-banner';
    momentoEstiloCentro(el2);
    el2.style.top = '58%';   // por si coincide con el cartelito de una zona
    document.body.appendChild(el2);
  }
  el2.hidden = false;
  const dt = deteccionBanner.d.datos || {};
  const oculto = tokens.get(dt.ocultoId);
  const nomOculto = oculto ? nombreDe(oculto) : 'el oculto';
  el2.innerHTML = deteccionBanner.resultado
    ? `<span>🔎 ${esc(deteccionBanner.resultado)}</span><button type="button" class="btn" id="deteccion-banner-ok">Listo</button>`
    : `<span>🔎 <b>${esc(dt.detector || 'Alguien')}</b> siente que algo está fuera de lugar (Percepción <b>${esc(dt.percepcion)}</b>). <b>${esc(nomOculto)}</b> (en sigilo) tira Destreza para seguir escondido.</span><button type="button" class="btn" id="deteccion-banner-ir">🎲 Tirar Destreza de ${esc(nomOculto)}</button>`;
  const bt = document.getElementById('deteccion-banner-ir'); if(bt) bt.onclick = deteccionGMResolver;
  const bo = document.getElementById('deteccion-banner-ok'); if(bo) bo.onclick = () => { deteccionBanner = null; renderDeteccionBanner(); };
}
async function deteccionGMResolver(){
  const db = deteccionBanner;
  if(!db || db.resultado) return;
  const bt = document.getElementById('deteccion-banner-ir'); if(bt) bt.disabled = true;
  const dt = db.d.datos || {};
  const oculto = tokens.get(dt.ocultoId);
  const nomOculto = oculto ? nombreDe(oculto) : 'el oculto';
  let des = 0, estados = [];
  if(oculto && oculto.tipo === 'creep'){
    const sc = creepPrivadoDe(oculto.fichaId);
    if(sc){ des = CreepCalculo.statValor(sc, 'des'); estados = sc.estados || []; }
  }else if(oculto){
    const f = fichasPub.get(String(oculto.fichaId).split(SEP_INVOCACION)[0]);
    des = f && f.resumen ? num(f.resumen.des) : 0;
  }
  const rd = Combatiente.tirarStat(des, estados, 'des');
  const total = rd ? rd.total : 0;
  const detectado = !!oculto && enSigilo(oculto) && num(dt.percepcion) > total;   // empate: sigue escondido
  if(detectado) await romperSigilo(dt.ocultoId, dt.detector || 'alguien', `Lo descubrió ${dt.detector || 'alguien'} con Percepción aumentada`, true);
  db.resultado = detectado   // antes de avisar: el aviso vuelve enseguida por la escucha y no tiene que cerrar este cartelito
    ? `${dt.detector || 'Alguien'} descubre a ${nomOculto} (Percepción ${dt.percepcion} contra Destreza ${total}).`
    : `${nomOculto} sigue escondido (Percepción ${dt.percepcion} contra Destreza ${total}).`;
  renderDeteccionBanner();
  await momentoActualizar(db.id, {estado: 'listo', resultado: detectado ? `…¡y descubre a ${nomOculto}!` : 'Mmm... puede que esté flasheando.',
    datos: {...dt, detectado, ...(detectado ? {ocultoNombre: nomOculto} : {})}});
}

/* ---------- Un aviso al centro para quien le toca (P146) ----------
   Sin nada que tirar: solo el momento y «Entendido». Lo usa el cambio de control (el GM toma o devuelve el personaje de un jugador). */
let avisoCentro = null;   // {id, d}
function momentoAvisoCentro(id, d){
  avisoCentro = {id, d};
  // Con la estética del cuadro del duelo (2026-10-03, pedido del dueño: unificar los pop-ups de efectos de combate): comun/aviso-combate.js.
  const dt = d.datos || {};
  AvisoCombate.mostrar({icono: d.icono || '•', titulo: d.titulo || '', pasos: Array.isArray(dt.pasos) ? dt.pasos : [],
    texto: Array.isArray(dt.pasos) && dt.pasos.length ? '' : (d.resultado || ''), veredicto: dt.veredicto || null, aMano: dt.aMano || '',
    alCerrar: () => { avisoCentro = null; }});
}
