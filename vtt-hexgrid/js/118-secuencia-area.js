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
      if(!t || !secuenciaAdentro(area, id)) continue;   // ya salió (lo movieron) o cayó
      await secuenciaPausa(i ? 900 : 300);
      const habE = {nombre, objetivo: 'area', radio, tira: null, contra: [], efectos: [], dano: null, soloDodge: true, esquiva: true, ...(meteoro ? {meteoro: true} : {tormenta: hab.tormenta || {}})};
      let dId = null;
      try{
        dId = await Duelo.crear({yo: yoDuelo, ataque: {tipo: 'habilidad', hab: habE, habNombre: nombre, alcance: 0, secundario: true}, grupo: {id: areaId, indice: i + 1, total: ronda.length}},
          {id, nombre: nombreDe(t), tipo: t.tipo, fichaId: t.fichaId, duenoUid: t.duenoUid}, casteador.tokenId || '');
      }catch(err){ console.error(`${nombre}: no se pudo abrir el «¿Esquiva?»`, err); }
      if(!dId){ mesaLinea(`🌩 ${nombre}: no se pudo preguntar a ${nombreDe(t)} si esquiva — resolvelo a mano con la mesa`, 'recordatorio'); continue; }
      // Si el token se movió y quedó quieto, se revisa desde acá también (por si la pantalla de quien esquivó no llegó a hacerlo: el movimiento quedó
      // esperando el ataque de oportunidad, recargó la página…).
      const desde = {col: t.col, fila: t.fila};
      let quieto = null, vigila = true;
      const reloj = setInterval(() => {
        if(!vigila) return;
        const x = tokens.get(id);
        if(!x || (x.col === desde.col && x.fila === desde.fila)){ quieto = null; return; }
        const k = x.col + ',' + x.fila;
        if(!quieto || quieto.k !== k){ quieto = {k, t: Date.now()}; return; }
        if(Date.now() - quieto.t > 2500){ vigila = false; Duelo.resolverDodge(dId, !secuenciaAdentro(area, id)).catch(err => console.error(`${nombre}: revisar el dodge roll`, err)); }
      }, 700);
      await secuenciaEsperar(dId);
      clearInterval(reloj);
    }
    // 3) Quiénes quedaron adentro (por donde están ahora).
    const adentro = secuenciaOrden(o.objetivos.filter(id => secuenciaAdentro(area, id)), centro);
    if(!adentro.length){
      mesaLinea(`${meteoro ? '☄' : '🌩'} ${nombre}: todos salieron del área — no le cae nada a nadie`, 'recordatorio');
      momentoAbrir({tipo: 'tormenta', icono: meteoro ? '☄' : '🌩', titulo: `${nombre}: todos esquivaron`, resultado: 'Nadie quedó adentro del área.', estado: 'listo'}).catch(() => {});
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
    let n = 0;
    for(const id of adentro){
      const t = tokens.get(id);
      if(!t || iniciativaFueraDeJuego(id)) continue;
      const k = meteoro ? 1 : (cuenta[id] || 0);
      if(!k) continue;
      await secuenciaPausa(n++ ? 900 : 300);
      // La versión de los creeps (1d4+1): Nd4+1, el +1 una sola vez (dueño, 2026-11-13: «en realidad sería "nd4+1"»).
      const dano = meteoro ? {formula: String(hab.meteoroFisico || (hab.dano && hab.dano.formula) || '4d6'), tipo: 'físico', ignoraDef: false, ...(hab.dano && hab.dano.extra ? {extra: hab.dano.extra} : {})}
        : {formula: m ? `${k * (num(m[1]) || 1)}d${m[2]}${m[3] ? '+' + num(m[3]) : ''}` : `${k}d4`, tipo: 'arcano', ignoraDef: true, directo: true};
      const habD = {nombre: meteoro ? nombre : `${nombre} · ${k} proyectil${k === 1 ? '' : 'es'}`, objetivo: 'enemigo', tira: null, contra: [], efectos: [], dano,
        detalle: meteoro ? `Cae el meteoro: ${dano.formula} físico (lo frena la Defensa)${dano.extra ? ` y ${dano.extra.formula} de ${dano.extra.tipo} (directo, menos su resistencia)` : ''}.` : `Le cayeron ${k} proyectil${k === 1 ? '' : 'es'}: ${dano.formula} de daño arcano, directo a la vida (ni Defensa ni Defensa especial).`};
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
