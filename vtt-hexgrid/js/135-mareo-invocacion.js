/* ---------- 😵 El Mareo de invocación dura hasta el próximo turno de quien la invocó (2026-11-24) ----------
   Dueño: «una invocación o un refuerzo, el turno en que entra, tira su iniciativa automáticamente y se ubica en el orden pertinente de la lista de
   turnos, pero tiene Mareo de invocación hasta el inicio del próximo turno del personaje que los haya invocado».
   · Quién invocó: una invocación → el token del personaje dueño (el mismo fichaId sin el «~»); un refuerzo → el token del creep que lo llamó.
   · El estado (mareoEstadoNuevo): el preset «Mareo de invocación» con `permanente` (no lo descuenta su propio turno ni el ⟳), `hasta` = «que empiece
     el próximo turno de X» (OrdenTurnos.mareoHasta: se ve en el globo del iconito y viaja en el resumen público) y `mareoDe` = el token de quien invocó.
     Mientras lo tenga, si le toca jugar no actúa (stunAntes, js/20: el cartel de siempre, con «Hacerlo igual»); reacciona igual.
   · Se va (lo saca la pantalla del GM, mareoRevisar): al empezar el turno de quien invocó (▶ Siguiente, ▶ Turno normal, Iniciar combate, o cuando su
     turno pasa sin jugar al ⏭ Pasar de ronda), con su línea en la tarjeta de ese turno; o si quien invocó ya no está en el orden (Limpiar, lo sacaron,
     se fue del mapa) o está caído (su turno no llega). Siempre con su línea en la Mesa (salvo que la invocación esté oculta).
   · Si cuando entra quien invocó no está en el orden de turnos (un creep copiado a mano, un orden sin su invocador), el mareo de antes: su primer
     turno propio (`turnos: 1`). */

// El token de quien invocó, para un token que ya tiene el mareo (o '' si no se sabe).
function mareoInvocadorDe(t){
  if(!t || !t.fichaId) return '';
  if(t.tipo === 'creep'){
    const sc = typeof creepPrivadoDe === 'function' ? creepPrivadoDe(t.fichaId) : null;
    const e = ((sc && sc.estados) || []).find(OrdenTurnos.esMareoHasta);
    return e && e.mareoDe && tokens.has(String(e.mareoDe)) ? String(e.mareoDe) : '';
  }
  return mareoDuenoDeInvocacion(t.fichaId);
}
// El token del personaje dueño de una invocación (`fichaId~invId`), o ''.
function mareoDuenoDeInvocacion(fichaId){
  const [base, invId] = String(fichaId || '').split(SEP_INVOCACION);
  if(!invId) return '';
  for(const [id, x] of tokens) if(x && x.tipo === 'pj' && String(x.fichaId) === base) return id;
  return '';
}
const mareoEnOrden = id => !!id && iniciativa.orden.some(o => o.id === id);
// El estado nuevo: con quien invocó en el orden, hasta su próximo turno; si no, el de antes (su primer turno). `pre` = el preset en la forma de quien lo recibe.
function mareoEstadoNuevo(pre, invocadorId){
  const e = {id: idEstadoNuevo(), activo: true, ...structuredClone(pre)};
  if(!mareoEnOrden(invocadorId)) return e;
  const tI = tokens.get(invocadorId);
  return {...e, permanente: true, turnos: 0, hasta: OrdenTurnos.mareoHasta(tI ? nombreDe(tI) : ''), mareoDe: invocadorId};
}
// Lo que dice la Crónica al entrar (invocación o refuerzo).
function mareoLineaEntrada(invocadorId, sinMareo){
  if(sinMareo) return 'Sin mareo: actúa en su primer turno.';
  const tI = mareoEnOrden(invocadorId) ? tokens.get(invocadorId) : null;
  const nom = tI && !ocultoParaMesa(invocadorId) ? nombreDe(tI) : '';
  return tI ? `😵 Con Mareo de invocación hasta que empiece el próximo turno de ${nom || 'quien la invocó'}: si le toca jugar antes, no actúa (reacciona igual).`
    : '😵 Con Mareo de invocación: en su primer turno no actúa (reacciona igual).';
}
// Sacarle el mareo nuevo. → true si lo tenía.
async function mareoSacar(t){
  let hubo = false;
  const filtrar = lista => { const q = (lista || []).filter(e => !OrdenTurnos.esMareoHasta(e)); if(q.length !== (lista || []).length) hubo = true; return q; };
  if(t.tipo === 'creep'){ await modificarCreep(t.fichaId, sc => { sc.estados = filtrar(sc.estados); }); return hubo; }
  const [base, invId] = String(t.fichaId).split(SEP_INVOCACION);
  if(!invId) return false;
  await editarPersonajeMapa(base, S => {
    const inv = (S.invocaciones || []).find(x => x && x.id === invId);
    if(!inv) return false;
    inv.estados = filtrar(inv.estados);
    return hubo;
  });
  return hubo;
}
const mareoSacando = new Set();
/* La revisión (solo la pantalla del GM). `empieza` = el token al que le empieza el turno ('' = solo mirar si quien invocó se fue del orden o cayó).
   → los grupos de líneas para la tarjeta del turno (turnoMarcar), uno por token que dejó de estar mareado; además, cada línea va a la Mesa. */
async function mareoRevisar(empieza){
  if(!soyGM || typeof OrdenTurnos === 'undefined') return [];
  const grupos = [];
  for(const [id, t] of [...tokens]){
    if(!t || !t.fichaId || mareoSacando.has(id)) continue;
    if(!confusionEstadosDe(t).some(OrdenTurnos.esMareoHasta)) continue;
    const inv = mareoInvocadorDe(t);
    const por = OrdenTurnos.mareoSeVa(inv, {empieza, enOrden: mareoEnOrden, fuera: iniciativaFueraDeJuego});
    if(!por) continue;
    mareoSacando.add(id);
    try{
      if(!(await mareoSacar(t))) continue;
      const tI = inv ? tokens.get(inv) : null, nomI = tI && !ocultoParaMesa(inv) ? nombreDe(tI) : 'quien la invocó';
      const linea = `😵 ${nombreDe(t)} ya no está ${t.tipo === 'creep' ? 'mareado' : 'mareada'}: ${por === 'empieza' ? `empezó el turno de ${nomI}` : por === 'caido' ? `${nomI} está caído (su turno no llega)` : 'quien la invocó ya no está en el orden de turnos'}.`;
      if(empieza) grupos.push(turnoMarcar([linea], id));   // (la tarjeta del turno: dura unos segundos)
      if(!ocultoParaMesa(id)) try{ mesaLinea(linea, 'recordatorio'); }catch(e){}   // y la Mesa, que queda
      else if(!empieza) toast(linea);
    }catch(err){ console.error('No se pudo sacar el Mareo de invocación:', err); }
    finally{ setTimeout(() => mareoSacando.delete(id), 4000); }
  }
  return grupos;
}
// Al cambiar el orden de turnos (escucharIniciativa): ¿quien invocó se fue del orden o cayó? (un poco después, para no pisarse con ▶ Siguiente).
let mareoRevisarTimer = 0;
function mareoRevisarLuego(){
  if(!soyGM) return;
  clearTimeout(mareoRevisarTimer);
  mareoRevisarTimer = setTimeout(() => { mareoRevisar('').catch(err => console.error('Mareo de invocación:', err)); }, 2500);
}
