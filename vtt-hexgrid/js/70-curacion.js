/* ---------- 💚 La curación por pulsos: la zona de curación y el aura sanadora (2026-10-23, dueño; Support, «curar») ----------
   Dueño: la zona «diámetro 5, dura 4 turnos… se active 4 veces… cura a todos los aliados que estén en el área por igual»; el aura «de diámetro 11
   alrededor del propio caster… durante 4 turnos»; y después: «que sea un número fijo en lugar de un dado, para no tener que tirar dados: que al
   empezar el turno… cure a los que estén ahí un número fijo». Cada una cura 4 PULSOS: al ponerla (o activarla) y al empezar cada turno de quien la
   creó (si no está en el orden de turnos, una vez por ronda). Cada pulso cura lo mismo (fijo, 4) a todos sus aliados de adentro (él incluido), con
   `dueloCurar` (js/13: no levanta a un caído). Lo hace solo la pantalla de quien la creó (el GM para un creep).
   - La zona: una zona persistente con `zonaEstado` = {cura: '4', pulsos: 4} (sin campos ni reglas nuevas; `cura`: un número o una fórmula). Cada
     pulso se anota en `zonaResueltos` («cura@<momento>», un renglón: lo deja cualquiera), así no cura dos veces en el mismo momento. El motor de
     siempre la saltea (js/08).
   - El aura: el estado «Aura sanadora» (radio AURA_CURA_RADIO) de un creep; los pulsos se anotan en el propio estado (`pulsos`). Se ve como una mancha
     verde con chispitas alrededor del token (abajo). */
const AURA_CURA_NOMBRE = 'Aura sanadora', AURA_CURA_RADIO = 5, AURA_CURA = '4', AURA_CURA_PULSOS = 4, AURA_CURA_COLOR = '#7CD992';
// La curación de una zona (o null).
function zonaCuraDe(el){
  if(!el || !el.zona || !el.zonaEstado) return null;
  let e = null; try{ e = JSON.parse(el.zonaEstado); }catch(err){ return null; }
  return e && /^(\d{1,3}|\d{1,2}d\d{1,3}([+-]\d{1,3})?)$/i.test(String(e.cura || '').trim()) ? {cura: String(e.cura).trim(), pulsos: Math.max(1, Math.round(num(e.pulsos) || 4))} : null;
}
const curaAliados = (ref, tipo) => [...tokens.entries()].filter(([, t]) => t.fichaId && !t.bajoTierra && !etereoDe(t) && (tipo === 'creep' ? t.tipo === 'creep' : t.tipo === 'pj'));
// El momento de un pulso: el primero al ponerla; después, el comienzo de cada turno de quien la creó (`turno@paso`), o cada ronda si no está en el
// orden de turnos (`ronda@Mantenimiento`). null = ahora no toca (es el turno de otro).
// (2026-10-23, probado en el mapa: si se activa en su propio turno, ese pulso ES el de este turno — antes contaba «inicio» y enseguida otro.)
function curaMomento(hechos, tokenId){
  const enOrden = tokenId && esSuTurno(tokenId) !== null;
  const ahora = enOrden ? (esSuTurno(tokenId) ? 'turno@' + Math.round(num(iniciativa.paso)) : null)
    : (mantenimientoNumero === null ? null : 'ronda@' + Math.round(num(mantenimientoNumero)));
  return hechos.length ? ahora : (ahora || 'inicio');
}
const tokenDeRef = (ref, tipo) => { for(const [id, t] of tokens) if(t.fichaId === ref && t.tipo === tipo) return id; return null; };
// La cura a cada aliado de la lista: un número fijo (o, si la habilidad trae una fórmula, una tirada para todos). Mesa y Crónica.
async function curaPulso(titulo, quien, formula, lista, nro, total){
  let r;
  if(/^\d+$/.test(formula)) r = {total: parseInt(formula, 10)};
  else{ r = tirarDados(formula); if(!r) return; try{ await mesaPublicar(titulo, {...r, quien, desde: soyGM ? 'gm' : undefined}); }catch(err){} }
  curaBurbujas(lista);   // 🫧 las burbujitas sobre cada uno que cura (abajo)
  const curados = [];
  for(const [, t] of lista){
    try{ const res = await dueloCurar(t, r.total); if(res && !res.caido && res.nuevo > res.previo) curados.push(`${t.oculto ? 'alguien' : nombreDe(t)} +${res.nuevo - res.previo}`); }
    catch(err){ console.error('No se pudo curar:', err); }
  }
  const txt = `💚 ${titulo} (${nro}/${total}): ${r.total} de vida${curados.length ? ' → ' + curados.join(', ') : ' (no había aliados heridos adentro)'}`;
  try{ mesaLinea(txt, 'recordatorio'); }catch(err){}
  try{ momentoAbrir({tipo: 'curacion', icono: '💚', titulo: txt, estado: 'listo', datos: {chico: true}}); }catch(err){}
}
// 🟩 La zona: un pulso por momento, anotado en zonaResueltos con una transacción (una sola pantalla lo hace).
async function zonaCuraRevisar(elId, el){
  const zc = zonaCuraDe(el);
  if(!zc || !fbUsuario || el.duenoUid !== fbUsuario.uid) return;
  const hechos = (el.zonaResueltos || []).filter(x => String(x).startsWith('cura@')), momento = curaMomento(hechos, tokenDeRef(el.zonaCasteadorRef, el.zonaCasteadorTipo));
  if(!momento) return;
  const clave = 'cura@' + momento;
  if(hechos.includes(clave) || hechos.length >= zc.pulsos) return;
  let ok = false;
  try{
    await fbDb.runTransaction(async tx => {
      const ref = coleccionElementos().doc(elId), doc = await tx.get(ref);
      if(!doc.exists) return;
      const res = doc.data().zonaResueltos || [];
      if(res.includes(clave) || res.filter(x => String(x).startsWith('cura@')).length >= zc.pulsos) return;
      tx.update(ref, {zonaResueltos: [...res, clave]});
      ok = true;
    });
  }catch(err){ console.error('Zona de curación:', err); return; }
  if(!ok) return;
  const cs = celdasDeElemento(el), dentro = ([, t]) => cs.some(c => c.col === t.col && c.fila === t.fila);
  const lista = curaAliados(el.zonaCasteadorRef, el.zonaCasteadorTipo).filter(dentro);
  const quien = el.zonaCasteadorTipo === 'creep' ? ((creepsPub.get(el.zonaCasteadorRef) || {}).nombre || '') : ((fichasPub.get(el.zonaCasteadorRef) || {}).nombre || '');
  await curaPulso(el.zonaNombre || 'Zona de curación', quien, zc.cura, lista, hechos.length + 1, zc.pulsos);
}
// 🟢 El aura de un creep (solo el GM): al activarla y al empezar cada turno suyo (o cada ronda), mientras tenga el estado, hasta 4.
async function auraCuraRevisar(tokenId, t){
  if(!soyGM || t.tipo !== 'creep') return;
  const sc = creepPrivadoDe(t.fichaId);
  const est = sc && (sc.estados || []).find(e => e && e.activo !== false && e.nombre === AURA_CURA_NOMBRE);
  const color = t.aura && t.aura.color;
  if(color === AURA_CURA_COLOR) editarTokenCallado(tokenId, {aura: firebase.firestore.FieldValue.delete()});   // (la primera versión la dibujaba con t.aura: se limpia)
  if(!est) return;
  const hechos = Array.isArray(est.pulsos) ? est.pulsos : [], mant = curaMomento(hechos, tokenId);
  if(!mant || hechos.includes(mant) || hechos.length >= AURA_CURA_PULSOS) return;
  let nro = 0;
  try{
    await modificarCreep(t.fichaId, c => {
      const e = (c.estados || []).find(x => x && x.activo !== false && x.nombre === AURA_CURA_NOMBRE);
      if(!e) return;
      e.pulsos = Array.isArray(e.pulsos) ? e.pulsos : [];
      if(e.pulsos.includes(mant) || e.pulsos.length >= AURA_CURA_PULSOS) return;
      e.pulsos.push(mant); nro = e.pulsos.length;
    });
  }catch(err){ console.error('Aura sanadora:', err); return; }
  if(!nro) return;
  const lista = curaAliados(t.fichaId, 'creep').filter(([, x]) => distanciaHex({col: t.col, fila: t.fila}, {col: x.col, fila: x.fila}) <= AURA_CURA_RADIO);
  await curaPulso(`${AURA_CURA_NOMBRE} de ${sc.nombre || nombreDe(t)}`, sc.nombre || '', AURA_CURA, lista, nro, AURA_CURA_PULSOS);
}
// El aura dibujada, sin el cartel de «Token guardado».
function editarTokenCallado(id, cambios){ coleccionTokens().doc(id).update(cambios).catch(err => console.error('No se pudo dibujar el aura:', err)); }
let curacionRevisando = false;
setInterval(async () => {
  if(curacionRevisando || !fbDb || !fbUsuario) return;
  curacionRevisando = true;
  try{
    for(const [id, el] of [...elementos.entries()]) if(zonaCuraDe(el)) await zonaCuraRevisar(id, el);
    for(const [id, t] of [...tokens.entries()]) if(t.tipo === 'creep') await auraCuraRevisar(id, t);
  }catch(err){ console.error('Curación por pulsos:', err); }
  curacionRevisando = false;
}, 1500);

/* ✨ Cómo se ve (dueño, 2026-10-23: primero «algo verde con burbujitas»; después «en vez de burbujas, chispitas, como si fueran desde abajo hacia
   arriba, y que el borde no sea filoso hexagonal, sino un poquito irregular, suave y ondulado»). La zona de curación y el aura sanadora son una mancha
   verde con un contorno de línea ondulada que respira (`curaContorno`; ni nube ni hexágonos) y chispitas que suben y se apagan. La zona
   se dibuja en lugar del relleno de siempre (js/05 la trata como una superficie, sin borde); el aura, debajo de los tokens. Al curar, sobre cada uno que
   se curó suben unas chispitas de más, un momento (`curaBurbujas`, en la pantalla que cura). */
const curaRand = (a, b) => { const x = Math.sin(a * 91.7 + b * 37.3) * 43758.5453; return x - Math.floor(x); };
// Una chispita: una estrellita de cuatro puntas con brillo.
function curaChispa(x, y, r, a, z){
  ctx.beginPath();
  ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.quadraticCurveTo(x, y, x, y + r); ctx.quadraticCurveTo(x, y, x - r, y); ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fillStyle = `rgba(225,255,215,${a})`; ctx.fill();
  ctx.beginPath(); ctx.arc(x, y, r * 0.45, 0, Math.PI * 2); ctx.fillStyle = `rgba(150,240,160,${a * 0.5})`; ctx.fill();
}
// Chispitas que suben desde abajo de la casilla (x, y) hacia arriba, cada una a su ritmo, y se apagan al llegar.
function curaChispasEn(x, y, rad, z, semilla, n, fuerza){
  const now = performance.now() / 1000;
  ctx.save();
  ctx.shadowColor = 'rgba(140,255,160,.9)'; ctx.shadowBlur = 6 / z;
  for(let i = 0; i < n; i++){
    const vel = 0.25 + 0.3 * curaRand(semilla, i), fase = (now * vel + curaRand(semilla, i + 20)) % 1;
    const cx = x + (curaRand(semilla, i + 40) - 0.5) * rad * 1.5 + Math.sin((now + i * 1.7) * 1.6) * rad * 0.06;
    const cy = y + rad * 0.75 - fase * rad * 1.6;
    const r = rad * (0.05 + 0.05 * curaRand(semilla, i + 60)) * (1 - 0.4 * fase);
    const titila = 0.6 + 0.4 * Math.sin(now * 9 + i * 2.3);
    curaChispa(cx, cy, r, Math.sin(fase * Math.PI) * 0.9 * fuerza * titila, z);
  }
  ctx.restore();
}
/* El borde (dueño, 2026-10-23: «no quiero que se parezca a una nube, pero tampoco exactamente hexagonal: un borde lineal, pero irregular, ondulado,
   que puede tener cierto movimiento hacia afuera y hacia adentro; algo que lo distinga de un veneno»). Las dos son una flor alrededor de un centro: un
   contorno de línea clara, con ondas lentas que entran y salen, y un relleno verde liso (sin el desenfoque de las nubes). */
function curaContorno(celdas, z, semilla){
  if(!celdas.length) return;
  const pts = celdas.map(c => hexCentro(c.col, c.fila));
  const cx = pts.reduce((a, q) => a + q.x, 0) / pts.length, cy = pts.reduce((a, q) => a + q.y, 0) / pts.length;
  const R0 = Math.max(...pts.map(q => Math.hypot(q.x - cx, q.y - cy))) + HEX * 0.85;
  const t = performance.now() / 1000, N = 72;
  const radio = th => R0 * (1 + 0.045 * Math.sin(5 * th + t * 0.9 + semilla) + 0.03 * Math.sin(9 * th - t * 1.4 + semilla * 2) + 0.02 * Math.sin(2 * th + t * 0.5));
  const trazar = escala => {
    ctx.beginPath();
    for(let i = 0; i <= N; i++){
      const th = (i / N) * Math.PI * 2, r = radio(th) * escala;
      const x = cx + Math.cos(th) * r, y = cy + Math.sin(th) * r;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath();
  };
  const p = 0.5 + 0.5 * Math.sin(t * 1.2);
  ctx.save();
  trazar(1); ctx.fillStyle = `rgba(110,225,140,${0.12 + 0.05 * p})`; ctx.fill();
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(140,255,160,.9)'; ctx.shadowBlur = 8 / z;
  ctx.strokeStyle = `rgba(170,255,185,${0.75 + 0.2 * p})`; ctx.lineWidth = 2.4 / z; ctx.stroke();
  ctx.shadowBlur = 0;
  trazar(0.94); ctx.strokeStyle = `rgba(170,255,185,${0.25 + 0.15 * p})`; ctx.lineWidth = 1.2 / z; ctx.setLineDash([6 / z, 7 / z]); ctx.lineDashOffset = -t * 12 / z; ctx.stroke();
  ctx.restore();
}
// La zona (desde js/05, como una superficie: sin el relleno ni el borde de siempre). → {anima, sinBorde}
function curaDibujarZona(el, celdas, z){
  try{
    curaContorno(celdas, z, (el.origen ? el.origen.col * 3 + el.origen.fila : 0) % 7);
    celdas.forEach(c => { const q = hexCentro(c.col, c.fila); curaChispasEn(q.x, q.y, HEX * 0.9, z, c.col * 13 + c.fila * 7, 2, 1); });
  }catch(err){ try{ ctx.restore(); }catch(e){} console.error('Las chispas de la zona:', err); }
  return {anima: true, sinBorde: true};
}
// El aura: la misma mancha en las casillas alrededor del token (hasta AURA_CURA_RADIO), debajo de los tokens.
const curaOffsetsAura = (() => { const out = []; for(let dq = -AURA_CURA_RADIO; dq <= AURA_CURA_RADIO; dq++) for(let dr = -AURA_CURA_RADIO; dr <= AURA_CURA_RADIO; dr++) if(Math.max(Math.abs(dq), Math.abs(dr), Math.abs(dq + dr)) <= AURA_CURA_RADIO) out.push([dq, dr]); return out; })();
function curaDibujarAura(t, z){
  try{
    const c0 = hexACubo({col: t.col, fila: t.fila});
    const celdas = curaOffsetsAura.map(([dq, dr]) => ({col: cuboACol(c0.q + dq, c0.r + dr), fila: cuboAFila(c0.q + dq, c0.r + dr)}));
    curaContorno(celdas, z, (t.col * 3 + t.fila) % 7);
    celdas.forEach(c => { const q = hexCentro(c.col, c.fila); curaChispasEn(q.x, q.y, HEX * 0.9, z, c.col * 13 + c.fila * 7, 1, 0.8); });
  }catch(err){ try{ ctx.restore(); }catch(e){} console.error('Las chispas del aura:', err); }
}
const auraCuraEnEstados = est => !!(est && Array.isArray(est.estados) && est.estados.some(e => e && e.activo !== false && e.nombre === AURA_CURA_NOMBRE));
// Las auras sanadoras que se ven, debajo de los tokens (desde js/05). → true si hay que seguir animando.
function curaDibujarAuras(z){
  let hay = false;
  tokens.forEach(t => { if((t.oculto && !soyGM) || !auraCuraEnEstados(estadoDe(t))) return; curaDibujarAura(t, z); hay = true; });
  return hay;
}
// Al curar: un ratito de chispitas de más sobre cada uno que se curó (en esta pantalla).
const curaDestellos = new Map();   // tokenId → hasta cuándo
function curaBurbujas(lista){ const hasta = performance.now() + 1800; (lista || []).forEach(([id]) => curaDestellos.set(id, hasta)); try{ pedirDibujo(); }catch(e){} }
function curaDibujarDestello(id, x, y, rad, z){
  const h = curaDestellos.get(id);
  if(!h) return false;
  if(performance.now() > h){ curaDestellos.delete(id); return false; }
  curaChispasEn(x, y, rad, z, id.length * 3, 8, 1);
  return true;
}
