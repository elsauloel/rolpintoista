/* ---------- 💚 La curación por pulsos: la zona de curación y el aura sanadora (2026-10-23, dueño; Support, «curar») ----------
   Dueño: la zona «diámetro 5, dura 4 turnos… se tira el dado de 6 por la zona… se active 4 veces; cada vez que se activa, se tira el dado y cura a
   todos los aliados que estén en el área por igual»; el aura «de diámetro 11 alrededor del propio caster… cura durante 4 turnos un dado de 6 por
   turno». Las dos son un PULSO por ronda (cada Mantenimiento nuevo), hasta 4: una sola tirada para todos, a los aliados de quien la creó (él
   incluido), con `dueloCurar` (js/13: no levanta a un caído). Lo hace solo la pantalla de quien la creó (el GM para un creep).
   - La zona: una zona persistente con `zonaEstado` = {cura: '1d6', pulsos: 4} (sin campos ni reglas nuevas). Cada pulso se anota en `zonaResueltos`
     («cura@<Mantenimiento>», un renglón: lo deja cualquiera), así no cura dos veces en la misma ronda. El motor de siempre la saltea (js/08).
   - El aura: el estado «Aura sanadora» (radio AURA_CURA_RADIO) de un creep; los pulsos se anotan en el propio estado (`pulsos`). Mientras dura, el
     token lleva el aura verde dibujada (`t.aura`), y se la saca al terminar. */
const AURA_CURA_NOMBRE = 'Aura sanadora', AURA_CURA_RADIO = 5, AURA_CURA_DADO = '1d6', AURA_CURA_PULSOS = 4, AURA_CURA_COLOR = '#7CD992';
// La curación de una zona (o null).
function zonaCuraDe(el){
  if(!el || !el.zona || !el.zonaEstado) return null;
  let e = null; try{ e = JSON.parse(el.zonaEstado); }catch(err){ return null; }
  return e && /^\d{1,2}d\d{1,3}([+-]\d{1,3})?$/i.test(String(e.cura || '')) ? {cura: String(e.cura), pulsos: Math.max(1, Math.round(num(e.pulsos) || 4))} : null;
}
const curaAliados = (ref, tipo) => [...tokens.entries()].filter(([, t]) => t.fichaId && !t.bajoTierra && !etereoDe(t) && (tipo === 'creep' ? t.tipo === 'creep' : t.tipo === 'pj'));
// Una tirada para todos y la cura a cada aliado de la lista (Mesa y Crónica).
async function curaPulso(titulo, quien, formula, lista, nro, total){
  const r = tirarDados(formula);
  if(!r) return;
  try{ await mesaPublicar(titulo, {...r, quien, desde: soyGM ? 'gm' : undefined}); }catch(err){}
  const curados = [];
  for(const [, t] of lista){
    try{ const res = await dueloCurar(t, r.total); if(res && !res.caido && res.nuevo > res.previo) curados.push(`${t.oculto ? 'alguien' : nombreDe(t)} +${res.nuevo - res.previo}`); }
    catch(err){ console.error('No se pudo curar:', err); }
  }
  const txt = `💚 ${titulo} (${nro}/${total}): ${r.total} de vida${curados.length ? ' → ' + curados.join(', ') : ' (no había aliados heridos adentro)'}`;
  try{ mesaLinea(txt, 'recordatorio'); }catch(err){}
  try{ momentoAbrir({tipo: 'curacion', icono: '💚', titulo: txt, estado: 'listo', datos: {chico: true}}); }catch(err){}
}
// 🟩 La zona: un pulso por Mantenimiento, anotado en zonaResueltos con una transacción (una sola pantalla lo hace).
async function zonaCuraRevisar(elId, el){
  const zc = zonaCuraDe(el), mant = Math.round(num(mantenimientoNumero));
  if(!zc || !fbUsuario || el.duenoUid !== fbUsuario.uid || mantenimientoNumero === null) return;
  const clave = 'cura@' + mant, hechos = (el.zonaResueltos || []).filter(x => String(x).startsWith('cura@'));
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
// 🟢 El aura de un creep (solo el GM): un pulso por Mantenimiento mientras tenga el estado, hasta 4.
async function auraCuraRevisar(tokenId, t){
  if(!soyGM || t.tipo !== 'creep' || mantenimientoNumero === null) return;
  const sc = creepPrivadoDe(t.fichaId);
  const est = sc && (sc.estados || []).find(e => e && e.activo !== false && e.nombre === AURA_CURA_NOMBRE);
  const color = t.aura && t.aura.color;
  if(!est){ if(color === AURA_CURA_COLOR) editarTokenCallado(tokenId, {aura: firebase.firestore.FieldValue.delete()}); return; }
  if(color !== AURA_CURA_COLOR) editarTokenCallado(tokenId, {aura: {radio: AURA_CURA_RADIO, forma: 'hex', color: AURA_CURA_COLOR}});
  const mant = Math.round(num(mantenimientoNumero)), hechos = Array.isArray(est.pulsos) ? est.pulsos : [];
  if(hechos.includes(mant) || hechos.length >= AURA_CURA_PULSOS) return;
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
  await curaPulso(`${AURA_CURA_NOMBRE} de ${sc.nombre || nombreDe(t)}`, sc.nombre || '', AURA_CURA_DADO, lista, nro, AURA_CURA_PULSOS);
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
