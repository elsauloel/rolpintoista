/* ---------- 🗡 La puñalada (2026-10-21, dueño; choque liviano: Puñalada por la espalda, Mordida a traición y Puñalada trapera) ----------
   Un ataque «con tu arma» con `punalada` (Combatiente.ataqueConArreglos → `ataque.punalada`: 'espalda' | 'trapera'). Al elegir el objetivo
   (dueloElegirObjetivoMapa, js/13): si quien ataca está en el punto ciego del objetivo (enCunaCiega, la misma cuña de la visión), +1 dado de su arma y
   Crítico frecuente +1 (el +1 PdG de todo ataque por la espalda lo suma aparte espaldaBono). La trapera, si además viene en sigilo, duplica los dados del
   arma en vez del +1 dado. A la espalda se llega en sigilo, con Paso ligero (la pasiva: no se lo oye y no le da tiempo a darse vuelta, js/49) o con el
   objetivo flanqueado. Si no está en la espalda, avisa y deja atacar igual, sin el bono (lo decide la mesa). */
// Cuántos dados tiene el arma de quien ataca (un creep: su Peso + amplificado, como CreepCalculo.danoTxt; si no se sabe, 1).
function punaladaDadosArma(mio){
  const sc = mio && mio.tipo === 'creep' ? creepPrivadoDe(mio.fichaId) : null;
  return sc ? Math.max(1, num(sc.armaPeso) || 1) + Math.max(0, num(sc.armaAmplificado)) : 1;
}
// El ataque con el bono de la puñalada, el mismo si no corresponde, o null si se eligió otro objetivo.
async function punaladaBonos(mio, t, ataque, yo){
  if(!ataque || !ataque.punalada || !mio || !t) return ataque;
  const nom = (yo && yo.nombre) || nombreDe(mio), hab = ataque.habNombre || 'La puñalada';
  if(!enCunaCiega(mio, t)){
    const si = await AvisoCombate.preguntar(`${nom} no está en la espalda de ${nombreDe(t)}: ${hab} va como un ataque común con su arma, sin el bono. ¿Atacar igual?`,
      {icono: '🗡', titulo: 'No está por la espalda', si: 'Atacar igual', no: 'Elegir otro'});
    return si ? ataque : null;
  }
  const a = structuredClone(ataque), m = {...(a.mods || {})};
  const trapera = ataque.punalada === 'trapera' && enSigilo(mio);
  const extra = trapera ? punaladaDadosArma(mio) + Math.max(0, Math.round(num(m.dados))) : 1;   // el doble de dados: los del arma y los que ya sumaba
  m.dados = Math.max(0, Math.round(num(m.dados))) + extra;
  m.critBono = Math.max(0, Math.round(num(m.critBono))) + 1;
  a.mods = m;
  const txt = trapera ? `viene en sigilo: el doble de dados (+${extra}) y Crítico frecuente +1` : '+1 dado de su arma y Crítico frecuente +1';
  try{ mesaLinea(`🗡 ${hab} de ${nom}: por la espalda de ${t.oculto ? 'alguien' : nombreDe(t)} → ${txt}`, 'recordatorio'); }catch(err){}
  return a;
}
