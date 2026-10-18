/* ---------- 🔮 Talismanes en el combate (2026-10-18, dueño; docs/talismanes.md) ----------
   Lo que hacen solos, con el daño y los efectos del duelo (los aplica la pantalla del GM, como todo el daño del duelo, js/13):
   · Espejito de bolsillo (`espejito` = %): a quien te pegó le vuelve ese % (para arriba, mínimo 1) del daño especial que TE ENTRÓ, directo.
   · Relicario de sangre (`relicario` = N): si tu daño especial lo deja en 0, ganás Vida extra N.
   · Cabeza reducida y Muñeco vudú (`alDanoEspecial` = {nombre, turnos}; 2026-10-18, dueño: con el daño especial, no solo la varita): la primera
     vez en cada turno (ronda) que quien la lleva le hace daño especial a alguien, ese estado (`talAlDanoEspecial`).
   · Orbe salvaje (`orbeSalvaje`: true o 'domado'; 2026-10-18, dueño): con cualquier daño especial, 1d6 — con 6, ×2 (el domado ×3); con 1, el
     mismo daño que entró le entra también a quien atacó (`talSalvajeTirar` antes del daño, `talSalvajePropio` después).
   · Orbe del custodio (`orbeCustodio`; 2026-10-18, dueño): cada vez que quien lo lleva gana una tirada de PdG.Esp, Vida extra N a un aliado al
     lado (`talCustodio`, desde el hook `pdgEspGanado` del duelo, en la pantalla de quien tiró; js/26 orbeCustodioMapa).
   · Botella con un diablito (`botella` = N; 2026-10-18, dueño): +N a todo tu daño especial; si en los dados de ese daño sale algún 1, el diablito
     te quema N (directo). El +N lo suma dueloAplicarDano (js/13); el aviso y la quemadura, `talBotella`.
   · Orbe de resguardo (`orbeResguardo`; 2026-10-18, dueño: «al ganar una tirada de probabilidad de golpe especial»): Vida extra N para quien lo
     lleva hasta su próximo turno, una vez por turno (`talResguardo`, el mismo hook).
   Quién lo lleva: un personaje lo publica en su resumen (`espejito`, `relicario`, `orbeCustodio`, `orbeSalvaje`, `alDanoEsp`); un creep, en su
   equipo (CreepCalculo.talisman, solo el GM). */
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
// Lo que lleva quien atacó: el resumen de un personaje o el equipo de un creep (null si no se sabe: una invocación).
function talEquipoDe(t){
  if(!t || !t.fichaId || String(t.fichaId).includes(SEP_INVOCACION)) return null;
  if(t.tipo === 'creep'){ const sc = creepPrivadoDe(t.fichaId); return sc ? {creep: sc} : null; }
  const f = fichasPub.get(t.fichaId);
  return f && f.resumen ? {resumen: f.resumen} : null;
}
// La Cabeza reducida y el Muñeco vudú: el estado que dejan al hacer daño especial, una vez por turno de quien atacó.
async function talAlDanoEspecial(d){
  const ta = tokens.get(d.atacante.tokenId), eq = talEquipoDe(ta);
  if(!eq) return;
  const lista = eq.creep ? Combatiente.talismanesDanoEsp(eq.creep.equipo) : (eq.resumen.alDanoEsp || []);
  for(const x of lista){
    const k = `${x.de}|${d.atacante.tokenId}@${Math.round(num(mantenimientoNumero))}`;
    if(talismanUsados.has(k)) continue;
    talismanUsados.add(k);
    const r = await dueloAplicarEfectoBase(d, {nombre: x.nombre, caras: 1, exitos: 1, spec: {nombre: x.nombre, turnos: x.turnos}});
    try{ mesaLinea(`🔮 ${x.de} de ${d.atacante.nombre}: ${d.defensor.nombre} ${r && r.manual ? `queda ${x.nombre} (a mano)` : `queda ${x.nombre} ${x.turnos} turno${x.turnos === 1 ? '' : 's'}`}${r && r.nota ? ' · ' + r.nota : ''}`, 'recordatorio'); }catch(err){}
  }
}
// El Orbe salvaje: la tirada (antes del daño). → {mult, propio, d, nombre} o null si quien atacó no lo lleva.
async function talSalvajeTirar(d){
  const ta = tokens.get(d.atacante.tokenId), eq = talEquipoDe(ta);
  if(!eq) return null;
  let tipo = null, nombre = '';
  if(eq.creep){ const o = (eq.creep.equipo || []).find(i => i && i.orbeSalvaje === 'domado') || (eq.creep.equipo || []).find(i => i && i.orbeSalvaje); if(o){ tipo = o.orbeSalvaje; nombre = o.nombre; } }
  else if(eq.resumen.orbeSalvaje){ tipo = eq.resumen.orbeSalvaje === 'domado' ? 'domado' : true; nombre = eq.resumen.orbeSalvajeNombre || 'Orbe salvaje'; }
  if(!tipo) return null;
  const dado = 1 + Math.floor(Math.random() * 6), x = Combatiente.orbeSalvaje({orbeSalvaje: tipo}, dado);
  const txt = x.mult > 1 ? `¡el daño especial sale ${x.mult === 3 ? 'triple' : 'doble'}!` : x.propio ? `el mismo daño que le entre a ${d.defensor.nombre} le entra también a ${d.atacante.nombre}` : 'no pasa nada';
  try{ await mesaPublicar(`${d.atacante.nombre} · ${nombre}`, {formula: '1d6', rolls: [dado], mod: 0, total: dado, quien: d.atacante.nombre, ...(ta && ta.tipo === 'creep' ? {desde: 'gm'} : {})}); }catch(err){}
  try{ mesaLinea(`🔮 ${nombre} de ${d.atacante.nombre} (1d6 → ${dado}): ${txt}`, 'recordatorio'); }catch(err){}
  return {mult: x.mult, propio: x.propio, d: dado, nombre};
}
// El Orbe salvaje con 1: lo mismo que le entró al rival, directo a quien atacó.
async function talSalvajePropio(d, entro, sal){
  const ta = tokens.get(d.atacante.tokenId);
  const n = Math.max(0, Math.round(num(entro)));
  if(!ta || !n) return;
  const res = ta.tipo === 'pj' && String(ta.fichaId).includes(SEP_INVOCACION) ? await danioInv(ta, String(n), true)
    : ta.tipo === 'creep' ? await danioCreep(ta, String(n), true) : await danioPj(ta, String(n), true);
  try{ mesaLinea(`🔮 ${sal.nombre}: a ${d.atacante.nombre} también le entran ${fmt(num(res.r.recibido))} de daño`, 'recordatorio'); }catch(err){}
}
// El Orbe del custodio: ganó una tirada de PdG.Esp (en la pantalla de quien tiró).
function talCustodio(d){
  const ta = tokens.get(d.atacante.tokenId), eq = talEquipoDe(ta);
  if(!eq || typeof orbeCustodioMapa !== 'function') return;
  let n = 0, nombre = 'Orbe del custodio';
  if(eq.creep){ const o = (eq.creep.equipo || []).find(i => i && num(i.orbeCustodio) > 0); if(o){ n = num(o.orbeCustodio); nombre = o.nombre; } }
  else n = num(eq.resumen.orbeCustodio);
  if(!(n > 0)) return;
  orbeCustodioMapa({fichaId: ta.fichaId, tipo: ta.tipo === 'creep' ? 'creep' : 'pj', n, orbe: nombre, quien: d.atacante.nombre});
}
// El Orbe de resguardo: ganó una tirada de PdG.Esp → Vida extra N para sí, una vez por turno (por ronda).
async function talResguardo(d){
  const ta = tokens.get(d.atacante.tokenId), eq = talEquipoDe(ta);
  if(!eq) return;
  let n = 0, nombre = 'Orbe de resguardo';
  if(eq.creep){ const o = (eq.creep.equipo || []).filter(i => i && num(i.orbeResguardo) > 0).sort((a, b) => num(b.orbeResguardo) - num(a.orbeResguardo))[0]; if(o){ n = num(o.orbeResguardo); nombre = o.nombre; } }
  else n = num(eq.resumen.orbeResguardo);
  if(!(n > 0)) return;
  const k = `resguardo|${d.atacante.tokenId}@${Math.round(num(mantenimientoNumero))}`;
  if(talismanUsados.has(k)) return;
  talismanUsados.add(k);
  const spec = {nombre: 'Vida extra', turnos: 1, escudoMagico: n};
  try{
    if(ta.tipo === 'creep') await modificarCreep(ta.fichaId, sc => EstadosAplicar.aplicarACreep(sc, spec));
    else await EstadosAplicar.encolarPj({fichaId: ta.fichaId, duenoUid: ta.duenoUid, spec, origen: `${d.atacante.nombre} · ${nombre}`});
    try{ mesaLinea(`🔮 ${nombre}: ${d.atacante.nombre} recibe Vida extra ${n} hasta su próximo turno`, 'recordatorio'); }catch(err){}
  }catch(err){ console.error('El Orbe de resguardo:', err); }
}
// Lo que pasa al ganar una tirada de PdG.Esp (el hook del duelo, en la pantalla de quien tiró).
function talPdgEspGanado(d){
  talCustodio(d);
  talResguardo(d).catch(err => console.error('El Orbe de resguardo:', err));
}
/* La Botella con un diablito: el aviso del +N y, si en los dados del daño especial salió algún 1, la quemadura. La quemadura no se descuenta
   sola (dueño, 2026-10-18: «que aparezca un cartel… el diablillo se te ríe, te hace 2 de daño de fuego y vos ponés aplicar»): un momento
   `diablito` le abre el Anuncio a quien maneja al que lleva la Botella (`diablitoMomento`), con «Aplicar». */
async function talBotella(d, n, rolls){
  const ta = tokens.get(d.atacante.tokenId);
  if(!ta) return;
  const uno = (rolls || []).some(x => num(x) === 1);
  if(!uno){ try{ mesaLinea(`😈 La Botella de ${d.atacante.nombre}: el diablito suma +${n} al daño especial`, 'recordatorio'); }catch(err){} return; }
  const f = ta.tipo === 'creep' ? null : fichasPub.get(String(ta.fichaId).split(SEP_INVOCACION)[0]);
  const paraUid = ta.tipo === 'creep' ? fbUsuario.uid : (f && f.resumen && f.resumen.control) || (f && f.duenoUid) || ta.duenoUid;
  try{ mesaLinea(`😈 La Botella de ${d.atacante.nombre}: +${n} al daño especial… pero salió un 1 en los dados y el diablito se ríe: ${n} de fuego para ${d.atacante.nombre}`, 'recordatorio'); }catch(err){}
  await momentoAbrir({tipo: 'diablito', icono: '😈', titulo: `El diablito de la Botella se ríe de ${d.atacante.nombre}`, estado: 'esperando',
    resultado: `Salió un 1 en los dados del daño especial: ${n} de fuego para ${d.atacante.nombre}.`, datos: {tokenId: d.atacante.tokenId, n, paraUid, quien: d.atacante.nombre}});
}
const diablitosVistos = new Set();
function diablitoMomento(id, d){
  const dt = d.datos || {};
  if(d.estado !== 'esperando' || !fbUsuario || dt.paraUid !== fbUsuario.uid || diablitosVistos.has(id)) return false;
  diablitosVistos.add(id);
  const base = {clave: 'diablito:' + id, icono: '😈', titulo: 'El diablito se ríe'};
  const paso = {titulo: 'La Botella', texto: `Salió un 1 en los dados de tu daño especial: el diablito se te ríe y te hace ${dt.n} de daño de fuego.`};
  AvisoCombate.mostrar({...base, pasos: [paso], botones: [{texto: `🔥 Aplicar ${dt.n} de fuego`, id: 'diablito-aplicar', alClic: async () => {
    const b = document.getElementById('diablito-aplicar'); if(b){ b.disabled = true; b.textContent = 'Aplicando…'; }
    const t = tokens.get(dt.tokenId);
    let txt = '';
    try{
      if(!t) throw new Error('sin token');
      const res = t.tipo === 'pj' && String(t.fichaId).includes(SEP_INVOCACION) ? await danioInv(t, String(dt.n), true)
        : t.tipo === 'creep' ? await danioCreep(t, String(dt.n), true) : await danioPj(t, String(dt.n), true);
      txt = `${fmt(num(res.r.recibido))} de fuego (${fmt(num(res.previo))} → ${fmt(num(res.nuevo))})`;
      try{ mesaLinea(`😈 El diablito quemó a ${dt.quien}: ${txt}`, 'recordatorio'); }catch(err){}
    }catch(err){ console.error('El diablito:', err); txt = 'no se pudo aplicar solo: a mano'; }
    try{ momentoActualizar(id, {estado: 'listo', resultado: `${dt.quien}: ${txt}.`}); }catch(err){}
    AvisoCombate.mostrar({...base, pasos: [paso], veredicto: {tono: 'malo', grande: '¡TE QUEMÓ!', chico: txt}, botones: [{texto: 'Entendido', alClic: () => AvisoCombate.cerrar()}]});
  }}], alCerrar: () => { diablitosVistos.delete(id); }});   // cerrado sin aplicar: vuelve a aparecer con el próximo cambio del momento
  return true;
}

