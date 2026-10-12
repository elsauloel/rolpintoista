/* =========================================================
   🎯 MARCAR (Shooter, 2026-10-12, decisiones del dueño)
   =========================================================
   Quien usa Marcar tiene el estado «Marcando» (con `marca` = el token marcado); el blanco, «Marcado» con `marcadoPor` = el token de quien
   lo marcó (lo arma js/13, dueloAplicarEfectoBase). Acá:
   - marcaBonos(mio, t, ataque, tiro): al atacar a su marca, +1 PdG, +1 de daño, Crítico frecuente +1 y Crítico potente +1 (solo quien marcó).
     Al atacar a otro (un ataque, o una habilidad contra un rival), la marca se termina: se le saca «Marcando» (lo hace la pantalla de quien ataca).
   - marcaRevisar() (solo el GM, cada 2 s): a un creep marcado cuyo marcador ya no lo tiene como marca (atacó a otro, marcó a otro, se fue
     del mapa) le saca el Marcado.
   ========================================================= */
function marcaDe(tok){
  const v = tok ? vinculo(tok) : null, est = (v && v.resumen && v.resumen.estados) || [];
  return est.find(e => e && e.activo !== false && e.nombre === 'Marcando' && e.marca) || null;
}
function marcaBonos(mio, t, ataque, tiro){
  if(!mio || !t || !ataque) return tiro;
  const m = marcaDe(mio);
  if(!m) return tiro;
  const idMio = mio.id || [...tokens.entries()].find(([, x]) => x === mio)?.[0], idT = t.id || [...tokens.entries()].find(([, x]) => x === t)?.[0];
  if(m.marca === idT){
    if(ataque.hab && !['enemigo', 'area', 'cono', 'linea', 'onda'].includes(ataque.hab.objetivo)) return tiro;   // una cura o un buff no cuenta
    return arcoSumar(tiro, {pdg: 1, fijo: 1, crit: 1, critpot: 1}, `contra su marca`);
  }
  // Atacó a otro: la marca se termina (dueño: «sigue marcado hasta que ataque a un objetivo diferente»).
  const hostil = !ataque.hab || ['enemigo', 'area', 'cono', 'linea', 'onda'].includes(ataque.hab.objetivo);
  if(hostil && idT !== idMio && mio.tipo === 'pj' && mio.fichaId){
    editarPersonajeMapa(mio.fichaId, S => { const antes = S.efectos.length; S.efectos = S.efectos.filter(e => !(e && e.nombre === 'Marcando')); return S.efectos.length !== antes; })
      .then(() => mesaLinea(`🎯 ${nombreDe(mio)} atacó a otro: ${m.marcaNombre || 'su marca'} deja de estar marcado`, 'recordatorio'))
      .catch(err => console.error('No se pudo terminar la marca:', err));
  }
  return tiro;
}
function marcaRevisar(){
  if(!soyGM || typeof creepsPriv === 'undefined') return;
  for(const [creepId, x] of creepsPriv){
    const sc = x && x.sc;
    if(!sc || !Array.isArray(sc.estados)) continue;
    const viejas = sc.estados.filter(e => e && e.nombre === 'Marcado' && e.marcadoPor);
    if(!viejas.length) continue;
    const sigue = e => { const tm = tokens.get(e.marcadoPor), m = marcaDe(tm); return !!(m && m.marca === e.marcadoToken); };
    if(viejas.every(sigue)) continue;
    modificarCreep(creepId, s => { s.estados = (s.estados || []).filter(e => !(e && e.nombre === 'Marcado' && e.marcadoPor && !sigue(e))); return true; })
      .catch(err => console.error('No se pudo sacar la marca vieja:', err));
  }
}
setInterval(marcaRevisar, 2000);
