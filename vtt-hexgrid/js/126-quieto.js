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
     Vuelve a preguntar mientras el bono siga activo (después de «Moverme igual» ya no lo está). El dodge roll no pregunta (es una defensa). */

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
function apuntadaActiva(id){
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

// Los bonos de un token: [{stat, icono, nombre, a, val}] (un creep solo lo sabe el GM; una invocación, por lo que publica la ficha).
function quietoBonos(t){
  if(!t || typeof statPiesDe !== 'function') return [];
  return Quieto.bonos({pulso: statPiesDe(t, 'pulso'), foco: statPiesDe(t, 'foco')});
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
    const act = !fuera && quietoActivo(id);
    bonos.forEach((b, i) => {
      const k = `${id}:${b.stat}`, antes = quietoVisto.get(k);
      quietoVisto.set(k, act);
      if(antes === false && act && typeof ganchoEvaEmpezar === 'function')
        ganchoEvaEmpezar({a: id, texto: Quieto.cartel(b), color: 'quieto', dur: 3600, fila: i});
    });
  });
}
setInterval(() => { try{ quietoRevisar(); }catch(err){ console.error('💍 Quieto:', err); } }, 700);

// Antes de mover un token caminando (confirmarRuta, js/08): si tiene el bono activo, en combate, se pregunta. → true = se mueve.
async function quietoAvisoAntes(id, o){
  try{
    if((o && o.dodge) || (typeof enDodge === 'function' && enDodge(id)) || typeof modoMapa === 'undefined' || modoMapa !== 'combate' || !quietoHayOrden()) return true;
    const t = tokens.get(id);
    if(!t || !quietoActivo(id)) return true;
    const bonos = quietoBonos(t);
    if(!bonos.length || typeof AvisoCombate === 'undefined') return true;
    const propio = t.tipo !== 'creep' && !!fbUsuario && t.duenoUid === fbUsuario.uid && !String(t.fichaId || '').includes(SEP_INVOCACION);
    return !!(await AvisoCombate.preguntar(Quieto.aviso(bonos, nombreDe(t), propio),
      {icono: bonos[0].icono, titulo: bonos.map(b => b.nombre).join(' y '), si: 'Moverme igual', no: 'Cancelar'}));
  }catch(err){ console.error('💍 Quieto: el aviso antes de moverse', err); return true; }
}
