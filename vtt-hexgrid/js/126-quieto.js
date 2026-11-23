// js/126-quieto.js — 💍 «Quieto»: quién se movió en cada ronda, anotado en la partida; el cartel «🎯 Puntería certera» / «🔮 Foco» cuando el
// bono queda activo y el aviso antes de moverse y perderlo (2026-11-20, dueño; las cuentas: comun/quieto.js).
/* Los anillos de Puntería Certera (`pulso`, PdG) y de Foco Arcano (`foco`, PdG.Esp) dan su bono «si no te moviste ni en esta ronda ni en la
   anterior». Lo que cambió:
   - **Quién se movió, anotado en la partida.** Con orden de turnos, cada movimiento se anota en el documento del orden (`iniciativa.movidos` =
     {tokenId: [rondas]}, js/04 lo lee y lo vuelve a guardar podado al pasar de ronda): lo ven todas las pantallas y no se pierde al recargar.
     Lo escribe la pantalla que mueve al token (`quietoMarcar`). Antes era memoria de una sola pantalla: el jugador se movía en la suya y el GM
     con 🎮 el control (u otra compu) atacaba con el +2. Sin orden de turnos queda como antes (la memoria de esta pantalla, por Mantenimiento).
   - **Recién desde la ronda 2** (con orden de turnos): en la ronda 1 no hay una ronda anterior quieta (P en preguntas-abiertas).
   - **Qué cuenta como moverse** (hasta que el dueño diga otra cosa): lo que el token hace por su cuenta — caminar (también el dodge roll),
     la Carga, el Takle, el Salto, el Dash, el Parpadeo / teletransporte propio, interponerse. NO cuenta que lo muevan: un empujón, un
     arrastre, tropezar en una trampa, el cebo, ni el 🦶 Mover libre (es la salida a mano, «sin reglas»).
   - **El cartel flotante** (el mismo texto que flota del «−2 EVA», js/96, en dorado): cuando el bono pasa a estar activo en combate, sale del
     token «🎯 Puntería certera» (o «🔮 Foco»). Lo ven quien maneja al token y el GM; no se publica: cada pantalla lo deduce de lo anotado.
   - **El aviso antes de moverse** (`quietoAvisoAntes`, desde confirmarRuta, js/08): en combate, con el bono activo, a quien lo va a mover:
     «Tenés Puntería certera activa (+2 a PdG). Si te movés, la perdés.» [Moverme igual] [Cancelar]. Cancelar deja el token donde estaba.
     Vuelve a preguntar mientras el bono siga activo (después de «Moverme igual» ya no lo está). El dodge roll no pregunta (es una defensa).
   - **🎯 Las Apuntadas de las ballestas, con la misma pieza** (P271, 2026-11-23, dueño: «sí, sumale el aviso»): `apuntada` (no se movió en esta
     ronda) y `apuntadaFirme` (ni en esta ni en la anterior) del arma en la mano tienen el mismo cartel («🎯 Apuntada» / «🎯 Apuntada firme») y el
     mismo aviso; con el anillo y una Apuntada a la vez, un solo aviso que nombra a los dos. **Ninguna vale en la ronda 1** (tampoco el anillo).
     La 🔍 de Atacar (`quietoLupaHtml`, desde js/11) y el cuadro del duelo (`quietoNoSumaTxt`, desde js/13) dicen si suma y por qué. */

const quietoLocal = new Map();        // `${id}@${ronda}` → cuándo lo anotó esta pantalla (vale hasta que llega lo guardado, o siempre si no se pudo guardar)
const quietoNoPrimero = new Set();    // `${id}@${ronda}`: al anotarlo ya estaba anotado (deshacer ese movimiento no lo borra)
let quietoSinGuardar = false;         // no se pudo anotar en la partida: vale la memoria de esta pantalla
let quietoCombate = '';               // para vaciar la memoria local cuando cambia el combate (otro mapa, orden vaciado, ronda que vuelve atrás)

const quietoHayOrden = () => (iniciativa.orden || []).length > 0;
const quietoRonda = () => Math.max(1, Math.round(num(iniciativa.ronda)) || 1);
// Lo anotado: lo de la partida más lo que esta pantalla acaba de anotar y todavía no volvió (8 s), o todo lo local si no se puede guardar.
function quietoMovidos(){
  const local = {}, ahora = Date.now();
  quietoLocal.forEach((t, k) => {
    if(!quietoSinGuardar && ahora - t > 8000) return;
    const i = k.lastIndexOf('@'), id = k.slice(0, i), r = Number(k.slice(i + 1));
    (local[id] = local[id] || []).push(r);
  });
  return Quieto.unir(iniciativa.movidos, local);
}
window.mapaQuietoMovidos = quietoMovidos;
// ¿Se movió en esta ronda (atras = 0) o en la anterior (atras = 1)?
function quietoMovio(id, atras){
  if(!id) return false;
  if(!quietoHayOrden()) return atras ? seMovioTurnoAnterior(id) : seMovioEsteTurno(id);
  return Quieto.movio(quietoMovidos(), id, quietoRonda() - (atras ? 1 : 0));
}
// ¿Tiene activo el bono de «no te moviste ni en esta ronda ni en la anterior»?
function quietoActivo(id){
  if(!id) return false;
  if(!quietoHayOrden()) return !seMovioEsteTurno(id) && !seMovioTurnoAnterior(id);
  return Quieto.activo(quietoMovidos(), id, quietoRonda());
}
window.mapaQuietoActivo = quietoActivo;
/* 🎯 Las Apuntadas de las ballestas (2026-11-21, dueño: «arreglalo también»), con lo anotado en la partida como el anillo: lo que se movió (caminar, Salto,
   Carga, Dash, Parpadeo…) cuenta en todas las pantallas; que te muevan (empujón, arrastre, trampa, Mover libre) no. Sin orden de turnos, como antes
   (la memoria de esta pantalla, por Mantenimiento). Apuntada: no se movió en esta ronda. Apuntada firme: ni en esta ni en la anterior (desde la ronda 2). */
function apuntadaActiva(id){   // (desde el 2026-11-23, P271: con orden de turnos, recién desde la ronda 2, como el anillo)
  if(!id) return false;
  if(!quietoHayOrden()) return !seMovioEsteTurno(id);
  return Quieto.apuntada(quietoMovidos(), id, quietoRonda());
}
function apuntadaFirmeActiva(id){
  if(!id) return false;
  if(!quietoHayOrden()) return !seMovioEsteTurno(id) && !seMovioTurnoAnterior(id);
  return Quieto.apuntadaFirme(quietoMovidos(), id, quietoRonda());
}

// Anota (o, con `si === false`, desanota: se deshizo su primer movimiento de la ronda) que el token se movió en esta ronda.
function quietoMarcar(id, si){
  if(!id || !quietoHayOrden()) return;
  const r = quietoRonda(), k = `${id}@${r}`;
  const quitar = si === false;
  if(quitar){
    if(quietoNoPrimero.has(k)) return;
    quietoLocal.delete(k);
  }else{
    if(Quieto.movio(quietoMovidos(), id, r)){ if(!quietoLocal.has(k)) quietoNoPrimero.add(k); return; }
    quietoLocal.set(k, Date.now());
  }
  quietoRevisar();
  if(typeof fbDb === 'undefined' || !fbDb) return;
  const FV = firebase.firestore.FieldValue;
  fbDb.doc(fbRutaCampana(rutaMapaEstado('iniciativa'))).update({['movidos.' + id]: quitar ? FV.arrayRemove(r) : FV.arrayUnion(r)})
    .catch(err => {
      if(!quietoSinGuardar) console.warn('💍 Quieto: no se pudo anotar el movimiento en la partida (queda en esta pantalla).', err && err.code);
      quietoSinGuardar = true;
    });
}
window.mapaQuietoMarcar = quietoMarcar;

/* 🎯 Las Apuntadas del arma en la mano (P271, 2026-11-23): un personaje y una invocación, por lo que publica su resumen (`apuntada`,
   `apuntadaFirme`); un creep, de su arma en la mano (solo el GM, que tiene su parte privada). */
function apuntadaValores(t){
  if(!t || !t.fichaId) return {apuntada: 0, apuntadaFirme: 0};
  if(t.tipo === 'creep' && typeof creepPrivadoDe === 'function' && typeof Combatiente !== 'undefined'){
    const sc = soyGM ? creepPrivadoDe(t.fichaId) : null;
    return sc ? Quieto.deArmas([Combatiente.armaEnMano(sc)]) : {apuntada: 0, apuntadaFirme: 0};
  }
  return {apuntada: statPiesDe(t, 'apuntada'), apuntadaFirme: statPiesDe(t, 'apuntadaFirme')};
}
// Los bonos de un token: [{stat, icono, nombre, a, val, regla}] — los anillos y las Apuntadas (un creep solo lo sabe el GM; una invocación, por
// lo que publica la ficha).
function quietoBonos(t){
  if(!t || typeof statPiesDe !== 'function') return [];
  return Quieto.bonos({pulso: statPiesDe(t, 'pulso'), foco: statPiesDe(t, 'foco'), ...apuntadaValores(t)});
}
// ¿Está activo ese bono ahora? (el anillo y la firme: ni esta ronda ni la anterior; la Apuntada: esta ronda; todos desde la ronda 2)
function quietoBonoActivo(id, b){
  if(!id || !b) return false;
  if(b.regla === 'apuntada') return apuntadaActiva(id);
  if(b.regla === 'firme') return apuntadaFirmeActiva(id);
  return quietoActivo(id);
}
// Los bonos de un token que están activos ahora (para el aviso antes de moverse).
const quietoBonosActivos = (id, t) => quietoBonos(t).filter(b => quietoBonoActivo(id, b));
window.mapaQuietoBonosActivos = id => quietoBonosActivos(id, tokens.get(id));
/* 🔍 Por qué suma o no cada bono de «no te moviste» de un token (P271): [{b, suma, por}] — para la 🔍 de Atacar y el cuadro del duelo. Sin orden
   de turnos, con lo que recuerda esta pantalla. `filtro(b)`: cuáles cuentan para ese ataque (`quietoFiltroAtaque`). */
// Qué bonos cuentan para un ataque: con arma, Puntería certera y las Apuntadas que tenga ESA arma (de rango); una habilidad que tira PdG.Esp, el Foco.
function quietoFiltroAtaque(ataque, arma){
  const hab = ataque && ataque.hab, tira = hab && hab.tira && (hab.tira.stat || hab.tira);
  const de = arma || ataque || {};
  return b => hab ? (b.stat === 'foco' && tira === 'pdgmg')
    : b.stat === 'pulso' || ((b.stat === 'apuntada' || b.stat === 'apuntadaFirme') && !!(de.armaDeRango || de.rango) && num(de[b.stat]) > 0);
}
function quietoExplicar(id, t, filtro){
  if(!id || !t) return [];
  const hay = quietoHayOrden(), movidos = hay ? quietoMovidos() : null, ronda = quietoRonda();
  return quietoBonos(t).filter(b => typeof filtro !== 'function' || filtro(b)).map(b => ({b,
    ...Quieto.porque(b.regla === 'apuntada' ? 'apuntada' : 'anillo', {hayOrden: hay, movidos, id, ronda,
      movioAhora: !hay && seMovioEsteTurno(id), movioAntes: !hay && seMovioTurnoAnterior(id)})}));
}
// La línea del cuadro del duelo con lo que NO suma y por qué («🎯 Apuntada +2: no suma — es la ronda 1 del combate…»); '' si no hay nada.
function quietoNoSumaTxt(id, t, filtro){
  try{ return quietoExplicar(id, t, filtro).filter(x => !x.suma).map(x => `${x.b.icono} ${x.b.nombre} +${x.b.val}: no suma — ${x.por}`).join(' · ').slice(0, 200); }
  catch(err){ console.error('💍 Quieto: por qué no suma', err); return ''; }
}
// La sección de la 🔍 de Atacar: «En el mapa, ahora» con cada bono, si suma y por qué. '' si el token no tiene ninguno.
function quietoLupaHtml(id, t, filtro){
  if(typeof lupaSeccion !== 'function' || typeof lupaFila !== 'function') return '';
  const l = quietoExplicar(id, t, filtro);
  if(!l.length) return '';
  const filas = l.map(x => lupaFila(`${x.b.icono} ${esc(x.b.nombre)} +${x.b.val} <span class="lupa-gris">— ${x.suma ? 'suma' : 'no suma'}: ${esc(x.por)}</span>`,
    x.suma ? `+${x.b.val}` : 'no suma')).join('');
  return lupaSeccion('En el mapa, ahora', filas + lupaNota(quietoHayOrden() ? 'Se cuenta con el orden de turnos: ninguno vale en la ronda 1 del combate.' : 'Sin orden de turnos: lo que recuerda esta pantalla.'));
}

/* El cartel flotante: cada pantalla mira, de los tokens que maneja (el GM, todos), si el bono pasó de apagado a activo. La primera mirada de
   cada token solo toma nota (al entrar a la página no salta nada). Fuera de combate o sin orden de turnos, no hay cartel. */
const quietoVisto = new Map();   // `${id}:${stat}` → estaba activo
function quietoRevisar(){
  if(typeof tokens === 'undefined' || typeof modoMapa === 'undefined') return;
  const clave = `${typeof mapaMostrado !== 'undefined' ? mapaMostrado : ''}`;
  const hay = quietoHayOrden();
  if(clave !== quietoCombate || !hay){ quietoCombate = clave; if(!hay){ quietoLocal.clear(); quietoNoPrimero.clear(); } quietoVisto.clear(); }
  if(!hay || modoMapa !== 'combate'){ quietoVisto.clear(); return; }
  tokens.forEach((t, id) => {
    if(!(soyGM || (typeof manejoEsteToken === 'function' && manejoEsteToken(t)))) return;
    const bonos = quietoBonos(t);
    if(!bonos.length) return;
    const fuera = typeof iniciativaFueraDeJuego === 'function' && iniciativaFueraDeJuego(id);
    bonos.forEach((b, i) => {
      const act = !fuera && quietoBonoActivo(id, b);   // cada uno con su regla (el anillo y la Apuntada firme: dos rondas; la Apuntada: esta)
      const k = `${id}:${b.stat}`, antes = quietoVisto.get(k);
      quietoVisto.set(k, act);
      if(antes === false && act && typeof ganchoEvaEmpezar === 'function')
        ganchoEvaEmpezar({a: id, texto: Quieto.cartel(b), color: 'quieto', dur: 3600, fila: i});
    });
  });
}
setInterval(() => { try{ quietoRevisar(); }catch(err){ console.error('💍 Quieto:', err); } }, 700);

/* 🏃 Antes de usar una habilidad que mueve (Dash, Salto, Takle, Carga, Parpadeo / Varita del blink; Quieto.habMueve) — 2026-11-21, cola de pruebas:
   apagaban el anillo como caminar, pero sin el aviso. Se pregunta al tocar Ejecutar (o Atacar con la varita), ANTES de cobrar: Cancelar no usa nada.
   Personajes y sus invocaciones (js/11) y creeps (js/12). `id` = el token de quien la usa. → true = sigue. */
async function quietoAvisoHab(id, h, nombre){
  try{
    if(!id || !Quieto.habMueve(h) || typeof modoMapa === 'undefined' || modoMapa !== 'combate' || !quietoHayOrden()) return true;
    const t = tokens.get(id);
    if(!t) return true;
    const bonos = quietoBonosActivos(id, t);   // el anillo y las Apuntadas que están activos ahora (un solo aviso que los nombra a todos)
    if(!bonos.length || typeof AvisoCombate === 'undefined') return true;
    const propio = t.tipo !== 'creep' && !!fbUsuario && t.duenoUid === fbUsuario.uid && !String(t.fichaId || '').includes(SEP_INVOCACION);
    return !!(await AvisoCombate.preguntar(Quieto.aviso(bonos, nombreDe(t), propio, nombre || h.nombre || 'la habilidad'),
      {icono: bonos[0].icono, titulo: bonos.map(b => b.nombre).join(' y '), si: 'Usarla igual', no: 'Cancelar'}));
  }catch(err){ console.error('💍 Quieto: el aviso antes de una habilidad que mueve', err); return true; }
}
// El token de un personaje (o de una invocación, `fichaId~invId`) en el mapa que se está viendo.
function quietoTokenDeFicha(fichaId){ for(const [id, t] of tokens) if(t.tipo !== 'creep' && String(t.fichaId || '') === String(fichaId || '')) return id; return ''; }

// Antes de mover un token caminando (confirmarRuta, js/08): si tiene el bono activo, en combate, se pregunta. → true = se mueve.
async function quietoAvisoAntes(id, o){
  try{
    if((o && o.dodge) || (typeof enDodge === 'function' && enDodge(id)) || typeof modoMapa === 'undefined' || modoMapa !== 'combate' || !quietoHayOrden()) return true;
    const t = tokens.get(id);
    if(!t) return true;
    const bonos = quietoBonosActivos(id, t);
    if(!bonos.length || typeof AvisoCombate === 'undefined') return true;
    const propio = t.tipo !== 'creep' && !!fbUsuario && t.duenoUid === fbUsuario.uid && !String(t.fichaId || '').includes(SEP_INVOCACION);
    return !!(await AvisoCombate.preguntar(Quieto.aviso(bonos, nombreDe(t), propio),
      {icono: bonos[0].icono, titulo: bonos.map(b => b.nombre).join(' y '), si: 'Moverme igual', no: 'Cancelar'}));
  }catch(err){ console.error('💍 Quieto: el aviso antes de moverse', err); return true; }
}
