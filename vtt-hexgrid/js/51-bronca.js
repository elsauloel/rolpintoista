/* ---------- 😤 Bronca acumulada (2026-10-18, dueño, el Capataz kobold: «algo que se vaya acumulando por cada golpe que reciba… al llegar a
   cierto punto lo libera, y que cada golpe que reciba aparezca un anuncio») ----------
   Un creep con `sc.bronca = {max, radio, dados, cuenta}` suma 1 cada vez que un golpe le saca vida (danioCreep, js/10: lo que esquiva, para o le
   rebota no cuenta). Cada golpe se anuncia en la Crónica y en la Mesa («😤 junta bronca 3/5») y se ve como el estado «Bronca» con sus stacks.
   Al llegar a `max` estalla en ese momento, aunque no sea su turno: la explosión en el mapa (todas las pantallas) y una onda de `radio` alrededor
   suyo (la cascada de un área: su PdG una vez contra la Evasión de cada rival, dodge roll para salir) con el daño de su arma con `dados` dados, y
   Sentado a quien le pega. Después vuelve a 0. Lo hace la pantalla del GM (la que aplica el daño a los creeps). */
const BRONCA_ESTADO = 'Bronca';
function broncaCfg(sc){
  const b = sc && sc.bronca;
  if(!b) return null;
  return {max: Math.max(1, Math.round(num(b.max)) || 5), radio: Math.max(1, Math.round(num(b.radio)) || 2), dados: Math.max(1, Math.round(num(b.dados)) || 3),
    cuenta: Math.max(0, Math.round(num(b.cuenta)) || 0), nombre: String(b.nombre || '¡Se le saltó la térmica!')};
}
// Adentro de la transacción del daño (modificarCreep): suma, pone el estado a la vista y dice si estalla. → null si no tiene bronca o no le dolió.
function broncaSumar(sc, r){
  const b = broncaCfg(sc);
  if(!b || !(num(r && r.recibido) > 0) || !(num(sc.hp) > 0)) return null;
  const cuenta = b.cuenta + 1, estalla = cuenta >= b.max;
  sc.bronca = {...sc.bronca, cuenta: estalla ? 0 : cuenta};
  sc.estados = (sc.estados || []).filter(e => e && e.nombre !== BRONCA_ESTADO);
  if(!estalla) sc.estados.push({id: 'br' + Math.random().toString(36).slice(2, 8), nombre: BRONCA_ESTADO, polaridad: 'otro', activo: true, permanente: true, turnos: 0,
    stacks: cuenta, mods: [], detalle: `Junta bronca: ${cuenta}/${b.max}. Al llegar a ${b.max} estalla: una onda de ${b.radio} casillas alrededor suyo con su arma a ${b.dados} dados, y Sentado.`});
  return {cuenta, max: b.max, estalla};
}
// Después del golpe: el anuncio y, si llegó, la explosión.
function broncaAnunciar(t, b){
  if(!t || !b) return;
  const quien = t.oculto ? 'Alguien' : nombreDe(t);
  if(!b.estalla){
    const txt = `😤 ${quien} junta bronca: ${b.cuenta}/${b.max}${b.cuenta === b.max - 1 ? ' — ¡está por estallar!' : ''}`;
    try{ momentoAbrir({tipo: 'zona-renueva', icono: '😤', titulo: `${quien} junta bronca (${b.cuenta}/${b.max})`, estado: 'listo',
      resultado: b.cuenta === b.max - 1 ? 'Un golpe más y estalla.' : `Cada golpe que le entra suma: al llegar a ${b.max}, estalla.`, datos: {}}); }catch(err){}
    try{ mesaLinea(txt); }catch(err){}
    return;
  }
  broncaEstallar(t).catch(err => { console.error('No se pudo soltar la bronca:', err); toast('La bronca estalló: resolvela a mano (mirá la consola)'); });
}
async function broncaEstallar(t){
  const sc = creepPrivadoDe(t.fichaId);
  const b = broncaCfg(sc);
  if(!sc || !b) return;
  const quien = t.oculto ? 'Alguien' : nombreDe(t);
  // El daño: el de su arma (con su Fuerza y lo que tenga encima), con `dados` dados.
  const base = String(CreepCalculo.danoTxt(sc, CreepCalculo.statValor(sc, 'dmg')) || '').replace(/\s+/g, '');
  const formula = /^\d+d/.test(base) ? base.replace(/^\d+d/, `${b.dados}d`) : `${b.dados}d${num(sc.armaTipo) || 8}`;
  const h = {nombre: b.nombre, duelo: {objetivo: 'onda', radio: b.radio, ondaDodge: true, tira: 'pdg', contra: ['eva'], dano: true, tipoDano: 'fisico',
    danoFormula: formula, efectos: [{nombre: 'Sentado'}]}};
  const hab = CreepAcciones.habEjecucion(sc, h);
  // La explosión, en todas las pantallas (el momento la dispara: js/16) y el anuncio.
  const k0 = hexACubo({col: t.col, fila: t.fila}), celdas = celdasFlor(b.radio).flatMap(d => [cuboACol(k0.q + d.dq, k0.r + d.dr), cuboAFila(k0.q + d.dq, k0.r + d.dr)]);
  const explota = {clave: 'bronca:' + t.fichaId + ':' + Date.now(), celdas};
  try{ await momentoAbrir({tipo: 'estallido', icono: '💥', titulo: `¡A ${quien} SE LE SALTÓ LA TÉRMICA!`, estado: 'listo',
    resultado: `Juntó ${b.max} de bronca y estalla: un garrotazo en onda a todos los rivales a ${b.radio} casillas (${formula} y Sentado; se esquiva con Evasión y dodge roll).`, datos: {explota}}); }catch(err){}
  try{ mesaLinea(`💥 ¡A ${quien} se le saltó la térmica! Estalla la bronca: ${formula} a todos los rivales a ${b.radio} casillas, y Sentado`); }catch(err){}
  if(typeof explosionEmpezar === 'function') explosionEmpezar(explota);
  await new Promise(r => setTimeout(r, typeof EXPLOSION_MS === 'number' ? EXPLOSION_MS : 1500));
  dueloElegirAreaMapa({yo: {ref: sc.id, tipo: 'creep', nombre: nombreDe(t)}, ataque: {tipo: 'habilidad', hab}});
}
