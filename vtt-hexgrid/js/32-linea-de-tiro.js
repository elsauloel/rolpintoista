/* =========================================================
   🏹 LÍNEA DE TIRO, DISTANCIA IDEAL Y TIRO ALTO (2026-10-09, dueño; docs/rework-armas-rango.md)
   - Al atacar con un arma de rango, mientras se elige el objetivo, se dibuja una línea recta desde quien dispara hasta la casilla del mouse.
   - La tapan los objetos Sólidos (y la Colisión del mapa) y cualquier token que esté en el medio, aliado o rival (que se vea).
   - Una línea que pasa justo por el borde entre dos casillas se mira dos veces (corrida apenas a cada lado): si de un lado está libre y del
     otro no, el tiro «roza»: lo decide la mesa.
   - Si está tapada o roza, al elegir ese objetivo aparece el aviso y se decide (avisa y deja seguir): con un arco con tiro alto y el objetivo a
     4 o más, se puede tirar por encima de los tokens (no de los Sólidos) con PdG −2.
   - La distancia ideal del arma (Combatiente.franjaIdeal / bonoIdeal): los objetivos adentro brillan distinto y el bono va al duelo (`tiro`).
   ========================================================= */
let tiroPreview = null;   // {desde: {col, fila}, mioId, defId?, ataque}: mientras se elige el objetivo de un disparo
let objetivosIdeal = null;   // Set de tokens en la distancia ideal (brillan en celeste)

// Las casillas de la línea, corrida un poquito para un lado (sgn = 1 o −1). Sin la de partida ni la de llegada.
function tiroCeldas(a, b, sgn){
  const n = distanciaHex(a, b);
  const A = hexACubo(a), B = hexACubo(b);
  const e = 1e-6 * sgn, res = [];
  for(let i = 1; i < n; i++){
    const t = i / n;
    const q = A.q + (B.q - A.q) * t + e, r = A.r + (B.r - A.r) * t + e, s = -q - r;
    let rq = Math.round(q), rr = Math.round(r);
    const rs = Math.round(s);
    const dq = Math.abs(rq - q), dr = Math.abs(rr - r), ds = Math.abs(rs - s);
    if(dq > dr && dq > ds) rq = -rr - rs;
    else if(dr > ds) rr = -rq - rs;
    res.push({col: rq, fila: rr + (rq - (rq & 1)) / 2});
  }
  return res;
}
// ¿Este token se ve desde esta pantalla? (lo que no se ve no tapa: no delata nada)
function tiroTokenVisible(t){
  if(t.oculto && !soyGM) return false;
  if(typeof tapadoPorNiebla === 'function' && tapadoPorNiebla(t)) return false;
  if(typeof ocultoPorSigiloParaMi === 'function' && ocultoPorSigiloParaMi(t)) return false;
  return true;
}
// Lo que tapa una lista de casillas: [{tipo: 'solido' | 'token', nombre, col, fila}].
function tiroTapan(celdas, ignorar){
  const solidos = solidosSet(), out = [];
  celdas.forEach(c => {
    if(solidos.has(nbPack(c.col, c.fila))){ out.push({tipo: 'solido', nombre: 'un obstáculo', col: c.col, fila: c.fila}); return; }
    tokens.forEach((t, id) => {
      if(ignorar.has(id) || t.col !== c.col || t.fila !== c.fila || !tiroTokenVisible(t)) return;
      out.push({tipo: 'token', nombre: nombreDe(t), col: c.col, fila: c.fila});
    });
  });
  return out;
}
// La línea de tiro de `a` a `b` → {estado: 'libre' | 'roza' | 'tapado', tapan: [...], soloTokens, celdas}.
function lineaDeTiro(a, b, ignorar){
  const ign = ignorar || new Set();
  const c1 = tiroCeldas(a, b, 1), c2 = tiroCeldas(a, b, -1);
  const t1 = tiroTapan(c1, ign), t2 = tiroTapan(c2, ign);
  const unidos = [...t1, ...t2].filter((x, i, arr) => arr.findIndex(y => y.col === x.col && y.fila === x.fila && y.nombre === x.nombre) === i);
  const estado = !t1.length && !t2.length ? 'libre' : (!t1.length || !t2.length) ? 'roza' : 'tapado';
  return {estado, tapan: unidos, soloTokens: unidos.every(x => x.tipo === 'token'), celdas: t1.length <= t2.length ? c1 : c2};
}
const tiroTapanTxt = tapan => {
  const n = [...new Set(tapan.map(x => x.nombre))];
  return n.length ? n.slice(0, 4).join(', ') + (n.length > 4 ? '…' : '') : 'algo';
};

// El dibujo: la línea de quien dispara al mouse (verde libre, ámbar roza, roja tapada) y las casillas que la tapan.
function dibujarTiroPreview(z){
  const tp = tiroPreview;
  if(!tp || !punteroMundo) return;
  const h = mundoAHex(punteroMundo.x, punteroMundo.y);
  if(h.col === tp.desde.col && h.fila === tp.desde.fila) return;
  const ign = new Set([tp.mioId]);
  tokens.forEach((t, id) => { if(t.col === h.col && t.fila === h.fila) ign.add(id); });   // el objetivo no se tapa a sí mismo
  const lt = lineaDeTiro(tp.desde, h, ign);
  const color = lt.estado === 'libre' ? '110,220,140' : lt.estado === 'roza' ? '255,190,70' : '255,90,90';
  const o = hexCentro(tp.desde.col, tp.desde.fila), f = hexCentro(h.col, h.fila);
  ctx.save();
  lt.tapan.forEach(x => { const p = hexCentro(x.col, x.fila); ctx.beginPath(); trazarHex(p.x, p.y); ctx.fillStyle = `rgba(${color},.28)`; ctx.fill(); ctx.strokeStyle = `rgba(${color},.95)`; ctx.lineWidth = 2.5 / z; ctx.stroke(); });
  ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.lineTo(f.x, f.y);
  ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.lineWidth = 5 / z; ctx.stroke();
  ctx.strokeStyle = `rgba(${color},.95)`; ctx.lineWidth = 2.5 / z; ctx.setLineDash([10 / z, 6 / z]); ctx.stroke(); ctx.setLineDash([]);
  const d = distanciaHex(tp.desde, h);
  ctx.font = `${Math.round(13 / z)}px system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.lineWidth = 3 / z; ctx.strokeStyle = 'rgba(0,0,0,.8)'; ctx.fillStyle = '#fff';
  const txt = `${d}${lt.estado === 'roza' ? ' · roza' : lt.estado === 'tapado' ? ' · tapado' : ''}`;
  ctx.strokeText(txt, f.x, f.y - HEX * 0.95); ctx.fillText(txt, f.x, f.y - HEX * 0.95);
  ctx.restore();
}
lienzo.addEventListener('pointermove', () => { if(tiroPreview) pedirDibujo(); });

// Pregunta con varias salidas (AvisoCombate): resuelve con el valor del botón; cerrar = 'otro'.
function tiroPreguntar(o){
  return new Promise(res => {
    let hecho = false;
    const fin = v => { if(hecho) return; hecho = true; res(v); };
    AvisoCombate.mostrar({icono: '🏹', titulo: o.titulo, texto: o.texto, alCerrar: () => fin('otro'),
      botones: o.opciones.map(op => ({texto: op.texto, detalle: op.detalle || '', sec: !!op.sec, alClic: () => { fin(op.valor); AvisoCombate.cerrar(); }}))});
  });
}

/* Al elegir el objetivo de un disparo: la línea de tiro y la distancia ideal → {seguir: bool, tiro: bono para el duelo | null}.
   `mio`, `t`: tokens con id; `ataque`: el del duelo (rango, arco, ideal, tiroAlto, alcance). */
async function tiroRevisar(mio, t, ataque, yo){
  if(!mio || !ataque || !ataque.rango || ataque.hab) return {seguir: true, tiro: null};
  const d = distanciaHex({col: mio.col, fila: mio.fila}, {col: t.col, fila: t.fila});
  const lt = lineaDeTiro(mio, t, new Set([mio.id, t.id]));
  let alto = false;
  if(lt.estado !== 'libre'){
    const puedeAlto = !!ataque.tiroAlto && lt.soloTokens && d >= Combatiente.TIRO_ALTO_MIN;
    const tapa = tiroTapanTxt(lt.tapan);
    const r = await tiroPreguntar({
      titulo: lt.estado === 'roza' ? 'El tiro roza' : 'La línea de tiro está tapada',
      texto: lt.estado === 'roza'
        ? `La línea hacia ${nombreDe(t)} pasa justo por el borde de ${tapa}. ¿Pasa o no? Lo decide la mesa.`
        : `Entre vos y ${nombreDe(t)} está ${tapa}: los tokens y los obstáculos tapan el disparo.`,
      opciones: [
        ...(puedeAlto ? [{valor: 'alto', texto: `🏹 Tiro alto, por encima (PdG ${Combatiente.TIRO_ALTO_PDG})`, detalle: 'tu arma lo permite: pasa por encima de los tokens'}] : []),
        {valor: 'igual', texto: 'Ignorar obstáculo', detalle: 'lo decide la mesa', sec: puedeAlto},   // (dueño, 2026-10-09: «que diga ignorar obstáculo»)
        {valor: 'otro', texto: 'Elegir otro', sec: true},
      ]});
    if(r === 'otro') return {seguir: false, tiro: null};
    if(r === 'alto') alto = true;
    else mesaLinea(`🏹 ${(yo && yo.nombre) || nombreDe(mio)} disparó a ${nombreDe(t)} con la línea ${lt.estado === 'roza' ? 'rozando' : 'tapada por'} ${tapa} (lo decidió la mesa)`, 'alerta-roja');
  }
  const ideal = Combatiente.bonoIdeal(ataque, d, ataque.alcance);
  if(!ideal && !alto) return {seguir: true, tiro: null};
  const tiro = ideal ? {...ideal} : {motivo: ''};
  if(alto){ tiro.pdg = Math.round(num(tiro.pdg)) + Combatiente.TIRO_ALTO_PDG; tiro.motivo = tiro.motivo ? `${tiro.motivo} y tiro alto` : 'tiro alto'; }
  return {seguir: true, tiro};
}
// Los objetivos en la distancia ideal (para que brillen distinto mientras se apunta).
function tiroResaltarIdeal(mio, ataque, esValido){
  objetivosIdeal = null;
  if(!mio || !ataque || !ataque.ideal || ataque.hab) return 0;
  const set = new Set();
  tokens.forEach((t, id) => {
    if(id === mio.id || !tiroTokenVisible(t) || (esValido && !esValido(t))) return;
    if(Combatiente.bonoIdeal(ataque, distanciaHex({col: mio.col, fila: mio.fila}, {col: t.col, fila: t.fila}), ataque.alcance)) set.add(id);
  });
  objetivosIdeal = set;
  return set.size;
}
function tiroTerminar(){ tiroPreview = null; objetivosIdeal = null; pedirDibujo(); }
