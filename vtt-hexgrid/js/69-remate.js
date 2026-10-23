/* ---------- 🗡 Remate / Ir por el herido (2026-10-23, dueño; choque pesado, «remate», escalonado) ----------
   Un ataque «con tu arma» con `remate` (Combatiente.ataqueConArreglos → `ataque.remate`). Al elegir el objetivo (dueloElegirObjetivoMapa, js/13,
   después de la herida): según la vida que le queda (Combatiente.remateDados), +2 dados del Tipo de su arma con la mitad o menos, +3 con un cuarto
   o menos (Mesa y Crónica). Si está más sano, va como un ataque común. */
// La vida del objetivo, de 0 a 1: un creep (la ficha privada si es el GM; si no, el porcentaje público), una invocación o un personaje (su resumen).
function remateVida(t){
  const frac = (hp, max) => num(max) > 0 ? Math.max(0, num(hp)) / num(max) : null;
  if(t.tipo === 'creep'){
    const sc = creepPrivadoDe(t.fichaId);
    if(sc) return frac(sc.hp, sc.hpMax);
    const p = creepsPub.get(t.fichaId);
    return p && p.resumen && p.resumen.hpPct !== undefined ? num(p.resumen.hpPct) / 100 : null;
  }
  if(String(t.fichaId || '').includes(SEP_INVOCACION)){ const r = typeof resumenDeInv === 'function' ? resumenDeInv(t) : null; return r ? frac(r.hp, r.hpMax) : null; }
  const f = fichasPub.get(t.fichaId), r = f && f.resumen;
  return r ? frac(r.hp, r.hpMax) : null;
}
// 🎯 Al elegir el objetivo, brillan solo los que califican (la mitad de la vida o menos); con uno más sano, avisa y deja seguir.
OBJETIVO_CONDICIONES.push((ataque, t) => {
  if(!ataque || !ataque.remate || !t) return null;
  const vida = remateVida(t);
  if(vida === null) return {ok: true};   // no se sabe: no se le niega el brillo
  return Combatiente.remateDados(vida) > 0 ? {ok: true} : {ok: false, motivo: 'le queda más de la mitad de la vida'};
});
// El ataque con los dados de más según la vida del objetivo; si está más sano (o no se sabe), el mismo.
async function remateBonos(mio, t, ataque, yo){
  if(!ataque || !ataque.remate || !t) return ataque;
  const vida = remateVida(t), dados = Combatiente.remateDados(vida);
  if(!dados) return ataque;
  const nom = (yo && yo.nombre) || (mio ? nombreDe(mio) : 'Alguien'), hab = ataque.habNombre || 'Remate', quien = t.oculto ? 'alguien' : nombreDe(t);
  const a = structuredClone(ataque);
  a.mods = {...(a.mods || {}), dados: Math.max(0, Math.round(num(a.mods && a.mods.dados))) + dados};
  const como = vida <= 0.25 ? 'le queda un cuarto de la vida o menos' : 'le queda la mitad de la vida o menos';
  const txt = `${hab} de ${nom}: a ${quien} ${como} → +${dados} dados de su arma`;
  try{ mesaLinea(`🗡 ${txt}`, 'recordatorio'); }catch(err){}
  try{ momentoAbrir({tipo: 'remate', icono: '🗡', titulo: txt, estado: 'listo', datos: {chico: true}}); }catch(err){}
  return a;
}
