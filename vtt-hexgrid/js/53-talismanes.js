/* ---------- 🔮 Talismanes en el combate (2026-10-18, dueño; docs/talismanes.md) ----------
   Lo que hacen solos, con el daño y los efectos del duelo (los aplica la pantalla del GM, como todo el daño del duelo, js/13):
   · Espejito de bolsillo (`espejito` = %): a quien te pegó le vuelve ese % (para arriba, mínimo 1) del daño especial que TE ENTRÓ, directo.
   · Relicario de sangre (`relicario` = N): si tu daño especial lo deja en 0, ganás Vida extra N.
   · Cabeza reducida y Muñeco vudú (`alPegarVarita` = {nombre, turnos}): la varita lleva ese efecto (Combatiente.efectosVarita); acá se cuida
     que entre una sola vez por turno de quien la usó (`talismanUnaVez`).
   Quién lo lleva: un personaje lo publica en su resumen (`espejito`, `relicario`); un creep, en su equipo (CreepCalculo.talisman, solo el GM). */
function talismanDe(t, campo){
  if(!t || !t.fichaId) return 0;
  if(t.tipo === 'creep'){ const sc = creepPrivadoDe(t.fichaId); return sc && typeof CreepCalculo !== 'undefined' && CreepCalculo.talisman ? num(CreepCalculo.talisman(sc, campo)) : 0; }
  if(String(t.fichaId).includes(SEP_INVOCACION)) return 0;
  const f = fichasPub.get(t.fichaId);
  return num(f && f.resumen && f.resumen[campo]);
}
// El Espejito: `entro` = el daño especial que le llegó a la vida del defensor.
async function talEspejito(d, entro){
  const td = tokens.get(d.defensor.tokenId), ta = tokens.get(d.atacante.tokenId);
  const pct = talismanDe(td, 'espejito');
  if(!(pct > 0) || !(num(entro) > 0) || !ta) return null;
  const monto = Math.max(1, Math.ceil(num(entro) * pct / 100));
  try{
    const res = ta.tipo === 'pj' && String(ta.fichaId).includes(SEP_INVOCACION) ? await danioInv(ta, String(monto), true)
      : ta.tipo === 'creep' ? await danioCreep(ta, String(monto), true) : await danioPj(ta, String(monto), true);
    const txt = `🪞 El Espejito de ${d.defensor.nombre} le devuelve ${monto} a ${d.atacante.nombre} (el ${pct} % del daño especial que le entró)`;
    try{ mesaLinea(txt, 'recordatorio'); }catch(err){}
    return {monto, recibido: num(res.r.recibido)};
  }catch(err){ console.error('El Espejito:', err); try{ mesaLinea(`🪞 El Espejito de ${d.defensor.nombre}: ${monto} a ${d.atacante.nombre}, a mano`, 'recordatorio'); }catch(e){} return null; }
}
// El Relicario: si el daño especial lo dejó en 0 (estaba de pie), quien atacó gana Vida extra N.
async function talRelicario(d, mato){
  if(!mato) return null;
  const ta = tokens.get(d.atacante.tokenId);
  const n = talismanDe(ta, 'relicario');
  if(!(n > 0) || !ta) return null;
  const spec = {nombre: 'Vida extra', escudoMagico: n};
  try{
    if(ta.tipo === 'creep') await modificarCreep(ta.fichaId, sc => EstadosAplicar.aplicarACreep(sc, spec));
    else await EstadosAplicar.encolarPj({fichaId: ta.fichaId, duenoUid: ta.duenoUid, spec, origen: `${d.atacante.nombre} · Relicario de sangre`});
    try{ mesaLinea(`🩸 El Relicario de ${d.atacante.nombre} late: Vida extra ${n} por matar a ${d.defensor.nombre} con daño especial`, 'recordatorio'); }catch(err){}
    return {n};
  }catch(err){ console.error('El Relicario:', err); return null; }
}
// La Cabeza reducida y el Muñeco vudú: una vez por turno de quien usó la varita (por ronda: el turno de cada uno es uno por ronda).
const talismanUsados = new Set();
function talismanUnaVez(d, ef){
  const m = /^🔮 ([^:]+):/.exec(String((ef && ef.detalle) || ''));
  if(!m) return true;
  const k = `${m[1]}|${d.atacante.tokenId}@${Math.round(num(mantenimientoNumero))}`;
  if(talismanUsados.has(k)) return false;
  talismanUsados.add(k);
  return true;
}
