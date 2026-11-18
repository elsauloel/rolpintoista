/* js/118-secuencia-area.js — 🌩☄ La Tormenta arcana y el Meteoro, de a uno (2026-11-13, dueño; docs/cola-de-pruebas.md).
   «El usuario la ejecuta, selecciona el área (ya viéndola moverse con el puntero). Después la tirada de ¿cuántos proyectiles? (el d20). Después la
   ronda de "¿esquiva?" sí/no, uno por uno a los afectados: pulso, se despliega el menú; si decide esquivar, se realiza esa acción, se cobran los
   nitros, y ahí se pasa al siguiente. Una vez determinados los objetivos, una secuencia de rayos al azar sobre los tokens, con un contador que va
   sumando de a 1… Ahí se procede a tirar los d4: pulso a un token, "tirá el daño: Nd4", se tira, aplicar el daño, y se pasa al siguiente.» El
   Meteoro, igual pero sin d20 ni lluvia («dejá el dodge roll, y que la secuencia de acciones sea igual»). Orden: el de la iniciativa (desde el que
   tiene el turno). El daño lo tira quien la lanzó y lo aplica el afectado (el GM de respaldo), como en las trampas.

   Lo lleva la pantalla que la lanzó (el jugador, o el GM por un creep; el Meteoro, la del GM): un documento de `areas` con estado `secuencia-mapa`
   (lo ven todos —el círculo violeta, js/05— pero la cascada de js/13 no lo toca) y un duelo del cuadro de siempre por paso (comun/duelo.js:
   `hab.soloTirada` para el d20, `hab.esquiva` para el «¿Esquiva?», un daño sin oposición para cada uno). La lluvia la dibuja cada pantalla desde
   `centro.lluvia` del área ({seq: [tokenId, …]}: el orden en que caen los rayos).

   También acá: la vista previa del área siguiendo al mouse mientras se marca el centro (`areaPrevia`, para todas las habilidades de área). */

const AREA_SECUENCIA = 'secuencia-mapa';
const LLUVIA_PASO_MS = 300, LLUVIA_RAYO_MS = 420;

/* ---------- La vista previa del área (2026-11-13, dueño: «al momento de seleccionar el área, uno debe ya ver la superficie en el mapa moverse con el
   puntero del mouse, antes de hacer el click»). Se llama justo después de `elegirDestino(…)`; se apaga sola al elegir o cancelar. ---------- */
let areaPreviaDatos = null;   // {radio, color, celda}
function areaPrevia(radio, color){
  if(!elegirDestinoCb) return;
  areaPreviaDatos = {radio: Math.max(0, Math.round(num(radio))), color: color || '#9B7BD4', celda: null};
  pedirDibujo();
}
function areaPreviaMover(px, py){
  if(!areaPreviaDatos) return;
  if(!elegirDestinoCb){ areaPreviaDatos = null; pedirDibujo(); return; }
  const m = pantallaAMundo(px, py), h = mundoAHex(m.x, m.y), c = areaPreviaDatos.celda;
  if(c && c.col === h.col && c.fila === h.fila) return;
  areaPreviaDatos.celda = {col: h.col, fila: h.fila};
  pedirDibujo();
}
function areaPreviaDibujar(z){
  const a = areaPreviaDatos;
  if(!a) return;
  if(!elegirDestinoCb){ areaPreviaDatos = null; return; }
  if(a.celda) dibujarAuraHex(a.celda, {radio: a.radio, color: a.color}, z);
}

/* ---------- El orden de la iniciativa (desde el que tiene el turno; los que no están en el orden, al final, del más cercano al centro). ---------- */
function secuenciaOrden(ids, centro){
  const orden = (iniciativa && Array.isArray(iniciativa.orden)) ? iniciativa.orden : [], n = orden.length, tu = Math.round(num(iniciativa && iniciativa.turno));
  const pos = id => { const i = orden.findIndex(o => o.id === id); return i < 0 ? 1000 : (i - tu + n) % Math.max(1, n); };
  const dist = id => { const t = tokens.get(id); return t && centro ? distanciaHex(centro, t) : 99; };
  return [...ids].sort((a, b) => pos(a) - pos(b) || dist(a) - dist(b));
}
// ¿Sigue adentro del área? (por donde está ahora el token)
function secuenciaAdentro(a, id){
  const t = tokens.get(id);
  return !!t && !t.bajoTierra && distanciaHex(a.centro, t) <= num(a.radio) && !iniciativaFueraDeJuego(id);
}
// Esperar a que un duelo termine → {res: 'resuelto', d} | {res: 'cancelado'} | {res: 'tiempo'}
function secuenciaEsperar(id, topeMs){
  return new Promise(resolve => {
    let listo = false, quitar = null;
    const fin = v => { if(listo) return; listo = true; try{ quitar && quitar(); }catch(e){} clearTimeout(reloj); resolve(v); };
    const reloj = setTimeout(() => fin({res: 'tiempo'}), topeMs || 15 * 60000);
    quitar = fbDb.collection(fbRutaCampana('duelos')).doc(id).onSnapshot(doc => {
      const d = doc.exists ? doc.data() : null;
      if(!d || d.estado === 'cancelado'){ fin({res: 'cancelado', d}); return; }
      if(d.estado === 'resuelto') fin({res: 'resuelto', d});
    }, () => fin({res: 'tiempo'}));
  });
}
const secuenciaPausa = ms => new Promise(r => setTimeout(r, ms));
/* ⚖ El dodge roll y los No2 (dueño, 2026-11-14: «con 0 No2 o más, el dodge roll se puede hacer —aunque cueste más de lo que tiene y quede en negativo—;
   con los No2 YA en negativo, no hay dodge roll»). Vale para el dodge roll de un área (esta ronda y la fase dodge de las áreas del duelo, js/13); el de
   Tronco de huída y el del arco siguen con su regla. → los No2 (negativos) si ya está en negativo, o null (puede, o no se sabe: un creep en otra pantalla). */
function dodgeNo2Negativos(t){
  const c = t && typeof costoMoverDe === 'function' ? costoMoverDe(t) : null;
  if(!c || c.disponibles === undefined || c.disponibles === null || !Number.isFinite(Number(c.disponibles))) return null;
  return num(c.disponibles) < 0 ? num(c.disponibles) : null;
}
// El aviso, a quien lo maneja y al GM (al centro, con «Entendido»), y la línea en la Mesa.
function dodgeSinNo2Avisar(t, id, nombre, neg, meteoro){
  const quien = nombreDe(t), decide = typeof oporDecide === 'function' ? oporDecide(t) : 'gm';
  const gmUid = (fbPartida && fbPartida.gmUid) || (soyGM ? fbUsuario.uid : '');
  const uids = [...new Set([decide === 'gm' ? gmUid : decide, gmUid].filter(Boolean))];
  const texto = `No puede hacer el dodge roll: sus No2 están en ${fmt(neg)}. ${quien} se queda en el área de ${nombre}.`;
  try{ mesaLinea(`${meteoro ? '☄' : '🌩'} ${texto}`, 'recordatorio'); }catch(e){}
  momentoAbrir({tipo: 'dodge-sin-no2', icono: '⚖', titulo: `${quien} no puede esquivar`, resultado: texto, estado: 'listo',
    datos: {aviso: true, paraUids: uids, boton: 'Entendido', pasos: [{titulo: `${meteoro ? '☄ ¡Cae el meteoro!' : '🌩 ¡Se viene la tormenta!'}`,
      texto: `${quien} no puede hacer el dodge roll: sus No2 están en ${fmt(neg)} (con los No2 en negativo no hay dodge roll). Se queda en el área.`}]}}).catch(() => {});
}
// ¿Ese token está frenado esperando un ataque de oportunidad (o su duelo)? Lo ve cualquier pantalla por los momentos (js/16) y los duelos abiertos.
function secuenciaOporEsperando(id){
  try{
    if(typeof dodgeFrenado !== 'undefined' && dodgeFrenado.has(id)) return true;
    if(typeof oporPorMover !== 'undefined'){ const e = oporPorMover.get(String(id)); if(e === 'esperando' || e === 'si') return true; }   // (js/17)
  }catch(e){}
  return false;
}

/* ---------- La secuencia ----------
   o = {yo (quien la lanza: {ref, tipo, nombre}), casteador ({…, uid, tokenId}), hab (la de la habilidad, con `tormenta` o `meteoro`), centro {col, fila},
   radio, objetivos [tokenId] (los de adentro al lanzarla)} */
async function secuenciaArea(o){
  const {casteador, hab, centro, radio} = o;
  const meteoro = !!hab.meteoro, nombre = String(hab.nombre || (meteoro ? 'Meteoro' : 'Tormenta arcana')).slice(0, 60);
  const yoDuelo = {ref: casteador.ref, tipo: casteador.tipo, nombre: casteador.nombre, uid: casteador.uid};
  let areaId = null;
  const area = {casteador, hab: Duelo.limpiarHab(hab), centro: {col: centro.col, fila: centro.fila, mapa: mapaMostrado}, radio, objetivos: o.objetivos.slice(0, 40), duelos: [], indice: 0};
  try{
    const ref = await coleccionAreas().add({...area, estado: AREA_SECUENCIA, creadoPor: fbUsuario.uid, creado: firebase.firestore.FieldValue.serverTimestamp()});
    areaId = ref.id;
  }catch(err){
    console.error(`${nombre}: no se pudo marcar el área`, err);
    toast(err && err.code === 'permission-denied' ? 'No se pudo: faltan publicar las reglas nuevas de Firestore (areas)' : `${nombre}: no se pudo marcar el área`);
    return;
  }
  const cerrar = () => coleccionAreas().doc(areaId).update({estado: 'terminado'}).catch(err => console.error(`${nombre}: no se pudo cerrar el área`, err));
  try{
    // 1) ¿Cuántos proyectiles? Lo tira quien la lanzó, con su botón (la Tormenta).
    let total = 0;
    if(!meteoro){
      const f = (hab.tormenta && hab.tormenta.proyectiles) || '1d20';
      const habD20 = {nombre: `${nombre} · proyectiles`, objetivo: 'uno mismo', tira: null, contra: [], efectos: [], soloTirada: {etq: 'Proyectiles'},
        dano: {formula: f, tipo: 'arcano', ignoraDef: true}, detalle: `Caen ${f} proyectiles sobre el área: tirá cuántos.`};
      const c = await contiendaDuelo({yo: yoDuelo, deTokenId: casteador.tokenId, aTokenId: casteador.tokenId, hab: habD20, esperar: true, extra: {secundario: true, danoSuelto: true}});
      if(c.falla || c.cancelado || c.tiempo || !c.d){ toast(`${nombre}: no se tiró la cantidad de proyectiles — se cancela`); mesaLinea(`🌩 ${nombre}: se canceló antes de tirar los proyectiles`, 'recordatorio'); return; }
      total = Math.max(0, Math.round(num(c.d.dano && c.d.dano.crudo)));
      mesaLinea(`🌩 ${nombre} de ${casteador.nombre}: caen ${total} proyectiles. Cada uno de los que están adentro puede intentar salir con un dodge roll.`, 'recordatorio');
      if(!total){ toast(`${nombre}: no cayó ningún proyectil`); return; }
    }
    // 2) La ronda de «¿Esquiva?», de a uno, en el orden de la iniciativa.
    const ronda = secuenciaOrden(o.objetivos, centro);
    for(let i = 0; i < ronda.length; i++){
      const id = ronda[i], t = tokens.get(id);
      if(!t || !secuenciaAdentro(area, id)) continue;   // ya salió (lo movieron) o cayó (😵 un caído no recibe la pregunta: secuenciaAdentro lo deja afuera, js/13 dodgeCaido)
      await secuenciaPausa(i ? 900 : 300);
      // ⚖ Con los No2 ya en negativo no hay dodge roll (dueño, 2026-11-14): no se le ofrece «Sí, esquiva»; el aviso, y se queda en el área.
      const neg = dodgeNo2Negativos(t);
      if(neg !== null){ dodgeSinNo2Avisar(t, id, nombre, neg, meteoro); await secuenciaPausa(1500); continue; }
      const habE = {nombre, objetivo: 'area', radio, tira: null, contra: [], efectos: [], dano: null, soloDodge: true, esquiva: true, ...(meteoro ? {meteoro: true} : {tormenta: hab.tormenta || {}})};
      let dId = null;
      try{
        dId = await Duelo.crear({yo: yoDuelo, ataque: {tipo: 'habilidad', hab: habE, habNombre: nombre, alcance: 0, secundario: true}, grupo: {id: areaId, indice: i + 1, total: ronda.length}},
          {id, nombre: nombreDe(t), tipo: t.tipo, fichaId: t.fichaId, duenoUid: t.duenoUid}, casteador.tokenId || '');
      }catch(err){ console.error(`${nombre}: no se pudo abrir el «¿Esquiva?»`, err); }
      if(!dId){ mesaLinea(`🌩 ${nombre}: no se pudo preguntar a ${nombreDe(t)} si esquiva — resolvelo a mano con la mesa`, 'recordatorio'); continue; }
      // Si el token se movió y quedó quieto, se revisa desde acá también (por si la pantalla de quien esquivó no llegó a hacerlo: el movimiento quedó
      // esperando el ataque de oportunidad, recargó la página…).
      if(typeof oporPorMover !== 'undefined') oporPorMover.delete(String(id));   // (lo de un movimiento anterior no cuenta)
      const desde = {col: t.col, fila: t.fila};
      let quieto = null, vigila = true;
      const reloj = setInterval(() => {
        if(!vigila) return;
        const x = tokens.get(id);
        if(!x || (x.col === desde.col && x.fila === desde.fila)){ quieto = null; return; }
        const k = x.col + ',' + x.fila;
        if(!quieto || quieto.k !== k){ quieto = {k, t: Date.now()}; return; }
        if(secuenciaOporEsperando(id)){ vigila = false; return; }   // 🏃 lo frenó un ataque de oportunidad (2026-11-14): el respaldo se apaga; lo revisa la pantalla de quien esquiva al terminar de moverse
        if(Date.now() - quieto.t > 2500){ vigila = false; Duelo.resolverDodge(dId, !iniciativaFueraDeJuego(id) && !secuenciaAdentro(area, id), iniciativaFueraDeJuego(id)).catch(err => console.error(`${nombre}: revisar el dodge roll`, err)); }   // (😵 un caído no «salió»: se queda)
      }, 700);
      await secuenciaEsperar(dId);
      clearInterval(reloj);
    }
    // 3) Quiénes quedaron adentro (por donde están ahora).
    const adentro = secuenciaOrden(o.objetivos.filter(id => secuenciaAdentro(area, id)), centro);
    if(!adentro.length){
      const hayCaidos = o.objetivos.some(id => tokens.get(id) && iniciativaFueraDeJuego(id));   // 😵 un caído no cuenta: el área no lo alcanza
      mesaLinea(`${meteoro ? '☄' : '🌩'} ${nombre}: ${hayCaidos ? 'nadie quedó adentro (salieron, o están caídos y el área no los alcanza)' : 'todos salieron del área'} — no le cae nada a nadie`, 'recordatorio');
      momentoAbrir({tipo: 'tormenta', icono: meteoro ? '☄' : '🌩', titulo: `${nombre}: ${hayCaidos ? 'no le cae a nadie' : 'todos esquivaron'}`, resultado: 'Nadie quedó adentro del área.', estado: 'listo'}).catch(() => {});
      return;
    }
    // 4) La lluvia (la Tormenta): cada proyectil cae al azar sobre uno de los que quedaron adentro; todas las pantallas la ven con el contador.
    const cuenta = {};
    if(!meteoro){
      const seq = [];
      for(let k = 0; k < total; k++){ const id = adentro[Math.floor(Math.random() * adentro.length)]; seq.push(id); cuenta[id] = (cuenta[id] || 0) + 1; }
      try{ await coleccionAreas().doc(areaId).update({centro: {...area.centro, lluvia: {seq}}}); }catch(err){ console.error(`${nombre}: no se pudo mostrar la lluvia`, err); }
      lluviaVista(areaId, seq);   // (esta pantalla, sin esperar a que vuelva de Firebase)
      await secuenciaPausa(lluviaDuracion(seq.length) + 1500);
      mesaLinea(`🌩 ${nombre}: ${adentro.map(id => `${nombreDe(tokens.get(id))} ${cuenta[id] || 0}`).join(' · ')}`, 'recordatorio');
    }
    // 5) El daño, de a uno: lo tira quien la lanzó; lo aplica el afectado (o el GM por él).
    const cada = String((hab.tormenta && hab.tormenta.cada) || '1d4');
    const m = cada.match(/(\d*)d(\d+)(?:\s*\+\s*(\d+))?/i);
    // ☄ El Meteoro tira el daño UNA sola vez para todos (dueño, 2026-11-18: «la tirada de daño debería ser una sola, y después se calcula cuánto daño le
    // pasó a cada afectado de acuerdo a sus resistencias»): quien lo lanzó tira «4d6 físico + 2d6 de fuego» con su botón (un cuadro de una sola tirada,
    // como los proyectiles de la Tormenta) y a cada uno le llega ese mismo resultado, ya tirado, para aplicarlo con su Defensa y su Res. fuego.
    let yaTirado = null;
    const vivos = adentro.filter(id => tokens.get(id) && !iniciativaFueraDeJuego(id));
    if(meteoro && vivos.length){
      const fis = String(hab.meteoroFisico || (hab.dano && hab.dano.formula) || '4d6'), ext = hab.dano && hab.dano.extra && hab.dano.extra.formula ? hab.dano.extra : null;
      const habT = {nombre: `${nombre} · el daño`, objetivo: 'uno mismo', tira: null, contra: [], efectos: [], soloTirada: {etq: 'de daño'}, meteoro: true,
        dano: {formula: ext ? `${fis}+${ext.formula}` : fis, tipo: 'físico', ignoraDef: false},
        detalle: `Una sola tirada para todos: ${fis} físico${ext ? ` + ${ext.formula} de ${ext.tipo}` : ''}. A cada uno le entra con su Defensa${ext ? ` y su resistencia al ${ext.tipo}` : ''}.`};
      const c = await contiendaDuelo({yo: yoDuelo, deTokenId: casteador.tokenId, aTokenId: casteador.tokenId, hab: habT, esperar: true, extra: {secundario: true, danoSuelto: true}});
      if(!c.falla && !c.cancelado && !c.tiempo && c.d && c.d.dano){
        const rolls = (c.d.dano.rolls || []).map(num), pd = typeof parseDados === 'function' ? parseDados(fis) : null;
        const nFis = pd && pd.dados ? pd.dados.reduce((a, x) => a + num(x.n), 0) : rolls.length;
        const rf = rolls.slice(0, nFis), rx = rolls.slice(nFis);
        const tf = rf.reduce((a, v) => a + v, 0) + (pd ? num(pd.mod) : 0), tx = ext ? rx.reduce((a, v) => a + v, 0) : 0;
        yaTirado = {crudo: Math.max(0, tf), formula: `${fis} (una tirada para todos)`, rolls: rf, ...(ext ? {extra: {total: Math.max(0, tx), formula: ext.formula, rolls: rx}} : {})};
        mesaLinea(`☄ ${nombre} de ${casteador.nombre}: ${fis} = ${yaTirado.crudo} físico${ext ? ` + ${ext.formula} = ${tx} de ${ext.tipo}` : ''} — el mismo para todos los que quedaron adentro`, 'recordatorio');
      }else mesaLinea(`☄ ${nombre}: no se tiró el daño — cada uno lo tira aparte`, 'recordatorio');
    }
    let n = 0;
    for(const id of adentro){
      const t = tokens.get(id);
      if(!t || iniciativaFueraDeJuego(id)) continue;
      const k = meteoro ? 1 : (cuenta[id] || 0);
      if(!k) continue;
      await secuenciaPausa(n++ ? 900 : 300);
      // La versión de los creeps (1d4+1): Nd4+1, el +1 una sola vez (dueño, 2026-11-13: «en realidad sería "nd4+1"»).
      const dano = meteoro ? {formula: String(hab.meteoroFisico || (hab.dano && hab.dano.formula) || '4d6'), tipo: 'físico', ignoraDef: false, ...(hab.dano && hab.dano.extra ? {extra: hab.dano.extra} : {}), ...(yaTirado ? {yaTirado} : {})}
        : {formula: m ? `${k * (num(m[1]) || 1)}d${m[2]}${m[3] ? '+' + num(m[3]) : ''}` : `${k}d4`, tipo: 'arcano', ignoraDef: true, directo: true};
      const habD = {nombre: meteoro ? nombre : `${nombre} · ${k} proyectil${k === 1 ? '' : 'es'}`, objetivo: 'enemigo', tira: null, contra: [], efectos: [], dano,
        detalle: meteoro && yaTirado ? `Cae el meteoro: ${yaTirado.crudo} físico (lo frena la Defensa)${yaTirado.extra ? ` y ${yaTirado.extra.total} de ${dano.extra ? dano.extra.tipo : 'fuego'} (directo, menos su resistencia)` : ''} — la tirada de ${casteador.nombre}, la misma para todos.` : meteoro ? `Cae el meteoro: ${dano.formula} físico (lo frena la Defensa)${dano.extra ? ` y ${dano.extra.formula} de ${dano.extra.tipo} (directo, menos su resistencia)` : ''}.` : `Le cayeron ${k} proyectil${k === 1 ? '' : 'es'}: ${dano.formula} de daño arcano, directo a la vida (ni Defensa ni Defensa especial).`};
      const c = await contiendaDuelo({yo: yoDuelo, deTokenId: casteador.tokenId, aTokenId: id, hab: habD, esperar: true, extra: {secundario: true, danoSuelto: true}});
      if(c.falla) mesaLinea(`${meteoro ? '☄' : '🌩'} ${nombre}: a ${nombreDe(t)} le toca ${dano.formula} — aplicalo a mano`, 'recordatorio');
    }
  }catch(err){
    console.error(`${nombre}: la secuencia`, err);
    toast(`${nombre}: algo falló a mitad de camino — seguí a mano con la mesa`);
  }finally{
    setTimeout(cerrar, 1500);
  }
}

/* ---------- La lluvia de rayos con el contador (cada pantalla, desde el área) ---------- */
const lluviasVistas = new Map();   // areaId → {t0, seq}
const lluviaDuracion = n => n * LLUVIA_PASO_MS + LLUVIA_RAYO_MS;
function lluviaVista(areaId, seq){
  if(lluviasVistas.has(areaId) || !Array.isArray(seq)) return;
  lluviasVistas.set(areaId, {t0: performance.now() + 500, seq: seq.slice(0, 60)});
  // Que se vea: el cuadro del duelo que quedó abierto (el último «¿Esquiva?») se aparta hacia su token (comun/duelo.js apartar).
  try{ const id = Duelo.abiertoId && Duelo.abiertoId(); if(id) Duelo.apartar(id); }catch(e){}
  pedirDibujo();
}
// Rayo en zigzag (con su semilla, para que no tiemble distinto en cada cuadro).
function lluviaRayo(x, y, alto, semilla, alfa, z){
  let s = semilla;
  const azar = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const pts = [], tramos = 7;
  for(let i = 0; i <= tramos; i++){ const f = i / tramos; pts.push([x + (i && i < tramos ? (azar() - 0.5) * HEX * 0.7 : 0), y - alto * (1 - f)]); }
  ctx.save();
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  [[10, `rgba(140,110,255,${0.35 * alfa})`], [4.5, `rgba(190,170,255,${0.8 * alfa})`], [1.8, `rgba(255,255,255,${alfa})`]].forEach(([w, c]) => {
    ctx.strokeStyle = c; ctx.lineWidth = w / z;
    ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
  });
  ctx.restore();
}
function lluviaDibujar(z){
  if(typeof areasActivas === 'undefined') return false;
  let anima = false;
  const ahora = performance.now();
  areasActivas.forEach((a, id) => {
    if(a.estado !== AREA_SECUENCIA || !a.centro || !a.centro.lluvia || (typeof areaDeOtroMapa === 'function' && areaDeOtroMapa(a))) return;
    lluviaVista(id, a.centro.lluvia.seq);
    const L = lluviasVistas.get(id);
    if(!L) return;
    const cuenta = {};
    L.seq.forEach((tid, i) => {
      const t = tokens.get(tid);
      if(!t || (t.oculto && !soyGM) || !tokenVisiblePorNiebla(t)) return;
      const ti = L.t0 + i * LLUVIA_PASO_MS;
      if(ahora < ti){ anima = true; return; }
      cuenta[tid] = (cuenta[tid] || 0) + 1;
      const dt = ahora - ti;
      if(dt < LLUVIA_RAYO_MS){
        anima = true;
        const c = hexCentro(t.col, t.fila), alfa = 1 - dt / LLUVIA_RAYO_MS;
        lluviaRayo(c.x, c.y, HEX * 7, 1000 + i * 37, alfa, z);
        ctx.save();
        const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, HEX * 1.1);
        g.addColorStop(0, `rgba(255,255,255,${0.75 * alfa})`); g.addColorStop(0.4, `rgba(170,140,255,${0.5 * alfa})`); g.addColorStop(1, 'rgba(120,90,255,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c.x, c.y, HEX * 1.1, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    });
    // El contador sobre cada token: arriba a la izquierda, crece un poco cuando suma.
    Object.entries(cuenta).forEach(([tid, k]) => {
      const t = tokens.get(tid);
      if(!t) return;
      const c = hexCentro(t.col, t.fila);
      const ult = Math.max(...L.seq.map((x, i) => x === tid ? i : -1));
      const dt = ahora - (L.t0 + ult * LLUVIA_PASO_MS), late = dt < 260 ? 1 + 0.35 * (1 - dt / 260) : 1;
      if(dt < 260) anima = true;
      const r = HEX * 0.42 * late, x = c.x - HEX * 0.72, y = c.y - HEX * 0.78;
      ctx.save();
      ctx.shadowColor = 'rgba(150,120,255,.9)'; ctx.shadowBlur = 10 / z;
      ctx.fillStyle = '#4b2fa8'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#efe8ff'; ctx.lineWidth = 2 / z; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.round(r * 1.25)}px system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(k), x, y + r * 0.05);
      ctx.restore();
    });
  });
  return anima;
}
