/* ---------- 👊 Patotear / 🐺 Jauría (2026-10-21, dueño; choque liviano, «manada») ----------
   Un ataque «con tu arma» con `manada` (Combatiente.ataqueConArreglos → `ataque.manada` = el tope). Al elegir el objetivo (dueloElegirObjetivoMapa,
   js/13, después de la herida): +1 dado del Tipo de su arma por cada aliado suyo pegado al objetivo, sin tope, y +1 PdG si hay al menos uno (dueño,
   2026-11-05: «+1 a la probabilidad de golpe fijo si hay al menos un aliado pegado, y +1 al daño, pero sin tope»; antes, hasta +3 dados y sin PdG). Aliado = del mismo bando que quien
   ataca (creep con creep; personaje o invocación con personaje), con ficha, en el mapa, ni caído ni bajo tierra; quien ataca no se cuenta. Sin
   aliados al lado, avisa y deja atacar igual, como un ataque común. */
// Los aliados de quien ataca pegados al objetivo → [token].
function patotaAliados(mio, t){
  return aliadosAlLado(mio, t, [t]);
}
// Los aliados de `mio` pegados a `centro` (el criterio de siempre, la cuenta en Combatiente.aliadosPegados): del mismo bando, con ficha, en el
// mapa, ni caídos ni bajo tierra; `mio` y los de `sin` no se cuentan (llegan como copias con su `id`: se comparan por id, o por casilla).
function aliadosAlLado(mio, centro, sin){
  return Combatiente.aliadosPegados(mio, centro, [...tokens.entries()].filter(([, x]) => x).map(([id, x]) => ({...x, id})), distanciaHex,
    id => typeof iniciativaFueraDeJuego === 'function' && iniciativaFueraDeJuego(id), sin || []);
}
/* ---------- 🐝 Táctica de enjambre (2026-11-20, dueño: «tenés +1 a la pdg por cada aliado adyacente. cuesta 2 puntos de job») ----------
   Pasiva (comun/pasivas.js, stat `enjambre`): +1 PdG por cada aliado pegado a QUIEN ATACA, sin tope, contado al crear el duelo. Lo llama
   Duelo.crear (comun/duelo.js) con el token de quien ataca en todo ataque con arma (el normal, el de una habilidad «con tu arma», el contraataque
   y el de oportunidad) → {pdg, n} o null. La pasiva: un personaje y una invocación la publican en su resumen; la de un creep la ve la pantalla
   del GM en su ficha privada (que es la que arma sus ataques). */
function enjambreValor(t){
  if(!t || !t.fichaId) return 0;
  if(t.tipo === 'creep'){ const sc = typeof creepPrivadoDe === 'function' ? creepPrivadoDe(t.fichaId) : null; return sc ? num(CreepCalculo.modTotal(sc, 'enjambre')) : 0; }
  const [fichaId, invId] = String(t.fichaId).split(SEP_INVOCACION);
  const f = fichasPub.get(fichaId), r = f && f.resumen;
  if(!r) return 0;
  if(!invId) return num(r.enjambre);
  const inv = (r.invocaciones || []).find(i => i && i.id === invId);
  return inv ? num(inv.enjambre) : 0;
}
function enjambreDeToken(tokenId){
  const t = tokens.get(tokenId);
  if(!t) return null;
  const val = enjambreValor(t);
  if(!(val > 0)) return null;
  const mio = {...t, id: tokenId};
  return Combatiente.enjambreBono(val, aliadosAlLado(mio, mio).length);
}
// El ataque con los dados de más, el mismo si no corresponde, o null si se eligió otro objetivo.
async function patotaBonos(mio, t, ataque, yo){
  if(!ataque || !ataque.manada || !mio || !t) return ataque;
  const al = patotaAliados(mio, t), nom = (yo && yo.nombre) || nombreDe(mio), hab = ataque.habNombre || 'Patotear', quien = t.oculto ? 'alguien' : nombreDe(t);
  if(!al.length){
    const si = await AvisoCombate.preguntar(`Ningún aliado de ${nom} está pegado a ${nombreDe(t)}: ${hab} va como un ataque común con su arma, sin los dados de más. ¿Atacar igual?`,
      {icono: '👊', titulo: 'Solo, sin la patota', si: 'Atacar igual', no: 'Elegir otro'});
    return si ? ataque : null;
  }
  const extra = al.length;   // sin tope (2026-11-05)
  const a = structuredClone(ataque);
  a.mods = {...(a.mods || {}), dados: Math.max(0, Math.round(num(a.mods && a.mods.dados))) + extra, pdg: num(a.mods && a.mods.pdg) + 1};
  const txt = `${hab} de ${nom}: ${al.length} aliado${al.length === 1 ? '' : 's'} rodea${al.length === 1 ? '' : 'n'} a ${quien} (${al.map(x => x.oculto ? 'alguien' : nombreDe(x)).join(', ')}) → +1 PdG y +${extra} dado${extra === 1 ? '' : 's'} de su arma`;
  try{ mesaLinea(`👊 ${txt}`, 'recordatorio'); }catch(err){}
  try{ momentoAbrir({tipo: 'patota', icono: '👊', titulo: txt, estado: 'listo', datos: {chico: true}}); }catch(err){}
  return a;
}
