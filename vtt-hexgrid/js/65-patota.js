/* ---------- 👊 Patotear / 🐺 Jauría (2026-10-21, dueño; choque liviano, «manada») ----------
   Un ataque «con tu arma» con `manada` (Combatiente.ataqueConArreglos → `ataque.manada` = el tope). Al elegir el objetivo (dueloElegirObjetivoMapa,
   js/13, después de la herida): +1 dado del Tipo de su arma por cada aliado suyo pegado al objetivo, hasta +3. Aliado = del mismo bando que quien
   ataca (creep con creep; personaje o invocación con personaje), con ficha, en el mapa, ni caído ni bajo tierra; quien ataca no se cuenta. Sin
   aliados al lado, avisa y deja atacar igual, como un ataque común. */
const PATOTA_TOPE = 3;
// Los aliados de quien ataca pegados al objetivo → [token].
function patotaAliados(mio, t){
  const out = [];
  for(const [id, x] of tokens){
    if(!x || x === mio || x === t || !x.fichaId || x.bajoTierra || x.tipo !== mio.tipo) continue;
    if(distanciaHex({col: x.col, fila: x.fila}, {col: t.col, fila: t.fila}) !== 1) continue;
    if(typeof iniciativaFueraDeJuego === 'function' && iniciativaFueraDeJuego(id)) continue;
    out.push(x);
  }
  return out;
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
  const extra = Math.min(Math.max(1, Math.round(num(ataque.manada)) || PATOTA_TOPE), al.length);
  const a = structuredClone(ataque);
  a.mods = {...(a.mods || {}), dados: Math.max(0, Math.round(num(a.mods && a.mods.dados))) + extra};
  const txt = `${hab} de ${nom}: ${al.length} aliado${al.length === 1 ? '' : 's'} rodea${al.length === 1 ? '' : 'n'} a ${quien} (${al.map(x => x.oculto ? 'alguien' : nombreDe(x)).join(', ')}) → +${extra} dado${extra === 1 ? '' : 's'} de su arma`;
  try{ mesaLinea(`👊 ${txt}`, 'recordatorio'); }catch(err){}
  try{ momentoAbrir({tipo: 'patota', icono: '👊', titulo: txt, estado: 'listo', datos: {chico: true}}); }catch(err){}
  return a;
}
