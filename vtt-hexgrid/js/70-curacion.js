/* ---------- 💚 La curación por pulsos: la zona de curación y el aura sanadora (2026-10-23, dueño; Support, «curar») ----------
   Dueño: la zona «diámetro 5, dura 4 turnos… se active 4 veces… cura a todos los aliados que estén en el área por igual»; el aura «de diámetro 11
   alrededor del propio caster… durante 4 turnos»; y después: «que sea un número fijo en lugar de un dado, para no tener que tirar dados: que al
   empezar el turno… cure a los que estén ahí un número fijo». Cada una cura 4 PULSOS: al ponerla (o activarla) y al empezar cada turno de quien la
   creó (si no está en el orden de turnos, una vez por ronda). Cada pulso cura lo mismo (fijo, 4) a todos sus aliados de adentro (él incluido), con
   `dueloCurar` (js/13: no levanta a un caído). Lo hace solo la pantalla de quien la creó (el GM para un creep).
   - La zona: una zona persistente con `zonaEstado` = {cura: '4', pulsos: 4} (sin campos ni reglas nuevas; `cura`: un número o una fórmula). Cada
     pulso se anota en `zonaResueltos` («cura@<momento>», un renglón: lo deja cualquiera), así no cura dos veces en el mismo momento. El motor de
     siempre la saltea (js/08).
   - El aura: el estado «Aura sanadora» (radio AURA_CURA_RADIO) de un creep; los pulsos se anotan en el propio estado (`pulsos`). Mientras dura, el
     token lleva el aura verde dibujada (`t.aura`), y se la saca al terminar. */
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
function curaMomento(hechos, tokenId){
  if(!hechos.length) return 'inicio';
  if(tokenId && esSuTurno(tokenId) !== null) return esSuTurno(tokenId) ? 'turno@' + Math.round(num(iniciativa.paso)) : null;
  return mantenimientoNumero === null ? null : 'ronda@' + Math.round(num(mantenimientoNumero));
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
  if(!est){ if(color === AURA_CURA_COLOR) editarTokenCallado(tokenId, {aura: firebase.firestore.FieldValue.delete()}); return; }
  if(color !== AURA_CURA_COLOR) editarTokenCallado(tokenId, {aura: {radio: AURA_CURA_RADIO, forma: 'hex', color: AURA_CURA_COLOR}});
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

/* 🫧 Las burbujitas verdes (dueño, 2026-10-23: «las curaciones en área por turno pueden tener una animación de algo verde con burbujitas»): la zona
   de curación y el aura sanadora, mientras duran, tienen burbujas que suben en cada casilla (todas las pantallas; desde js/05). Al curar, sobre cada
   uno que se curó suben unas cuantas más, un momento (`curaBurbujas`, en la pantalla que cura). */
const curaRand = (a, b) => { const x = Math.sin(a * 91.7 + b * 37.3) * 43758.5453; return x - Math.floor(x); };
function curaBurbujasEn(x, y, rad, z, semilla, n, fuerza){
  const now = performance.now() / 1000;
  ctx.save();
  for(let i = 0; i < n; i++){
    const vel = 0.35 + 0.35 * curaRand(semilla, i), fase = (now * vel + curaRand(semilla, i + 20)) % 1;
    const bx = x + (curaRand(semilla, i + 40) - 0.5) * rad * 1.4 + Math.sin((now + i) * 2) * rad * 0.05;
    const by = y + rad * 0.6 - fase * rad * 1.3;
    const r = rad * (0.05 + 0.06 * curaRand(semilla, i + 60)) * (0.6 + 0.4 * fase);
    const a = Math.sin(fase * Math.PI) * 0.75 * fuerza;
    ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(140,235,160,${0.25 * a})`; ctx.fill();
    ctx.strokeStyle = `rgba(190,255,200,${a})`; ctx.lineWidth = 1.1 / z; ctx.stroke();
    ctx.beginPath(); ctx.arc(bx - r * 0.35, by - r * 0.35, r * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${0.7 * a})`; ctx.fill();
  }
  ctx.restore();
}
// La zona: un brillo verde que respira y burbujas en cada casilla.
function curaDibujarZona(el, celdas, z){
  const p = 0.5 + 0.5 * Math.sin(performance.now() / 700);
  ctx.save(); trazarCeldas(celdas); ctx.fillStyle = `rgba(110,220,140,${0.10 + 0.08 * p})`; ctx.fill(); ctx.restore();
  celdas.forEach(c => { const q = hexCentro(c.col, c.fila); curaBurbujasEn(q.x, q.y, HEX * 0.9, z, c.col * 13 + c.fila * 7, 3, 1); });
}
// El aura: burbujas en las casillas alrededor del token (hasta AURA_CURA_RADIO).
const curaOffsetsAura = (() => { const out = []; for(let dq = -AURA_CURA_RADIO; dq <= AURA_CURA_RADIO; dq++) for(let dr = -AURA_CURA_RADIO; dr <= AURA_CURA_RADIO; dr++) if(Math.max(Math.abs(dq), Math.abs(dr), Math.abs(dq + dr)) <= AURA_CURA_RADIO) out.push([dq, dr]); return out; })();
function curaDibujarAura(t, z){
  const c0 = hexACubo({col: t.col, fila: t.fila});
  curaOffsetsAura.forEach(([dq, dr]) => { const col = cuboACol(c0.q + dq, c0.r + dr), fila = cuboAFila(c0.q + dq, c0.r + dr), q = hexCentro(col, fila); curaBurbujasEn(q.x, q.y, HEX * 0.9, z, col * 13 + fila * 7, 1, 0.8); });
}
const auraCuraEnEstados = est => !!(est && Array.isArray(est.estados) && est.estados.some(e => e && e.activo !== false && e.nombre === AURA_CURA_NOMBRE));
// Al curar: un ratito de burbujas de más sobre cada uno que se curó (en esta pantalla).
const curaDestellos = new Map();   // tokenId → hasta cuándo
function curaBurbujas(lista){ const hasta = performance.now() + 1800; (lista || []).forEach(([id]) => curaDestellos.set(id, hasta)); try{ pedirDibujo(); }catch(e){} }
function curaDibujarDestello(id, x, y, rad, z){
  const h = curaDestellos.get(id);
  if(!h) return false;
  if(performance.now() > h){ curaDestellos.delete(id); return false; }
  curaBurbujasEn(x, y, rad, z, id.length * 3, 10, 1);
  return true;
}
