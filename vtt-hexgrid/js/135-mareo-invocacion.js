/* ---------- 😵 El Mareo de invocación: pierde solo su primer turno (2026-11-24) ----------
   Dueño: «una invocación o un refuerzo, el turno en que entra, tira su iniciativa automáticamente y se ubica en el orden pertinente de la lista de
   turnos, pero tiene Mareo de invocación…»; y P327: «lo importante es que la primera vez que le toque actuar a una invocación, no puede actuar. Tan
   simple como eso».
   · Quién invocó: una invocación → el token del personaje dueño (el mismo fichaId sin el «~»); un refuerzo → el token del creep que lo llamó.
   · El estado (mareoEstadoNuevo): el preset «Mareo de invocación» con `permanente` (no lo descuenta ningún contador), `hasta` = «que termine su primer
     turno» (OrdenTurnos.MAREO_HASTA: se ve en el globo del iconito y viaja en el resumen público) y `mareoDe` = el token de quien invocó ('' si no está
     en el orden). Mientras lo tenga, si le toca jugar no actúa (stunAntes, js/20: el cartel de siempre, con «Hacerlo igual»); reacciona igual.
   · Se va (lo saca la pantalla del GM, mareoRevisar) con lo que pase primero: al TERMINAR su primer turno (▶ Siguiente, o su turno que pasa sin jugar
     al ⏭ Pasar de ronda o por estar caída) o al EMPEZAR el turno de quien la invocó. Así nunca pierde más de un turno (tampoco si saca más que su
     invocador). Si ella sale del orden (✕, Limpiar), también se va. Con su línea en la tarjeta del turno y en la Mesa. */

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
// El estado nuevo (invocación o refuerzo). `pre` = el preset en la forma de quien lo recibe; `invocadorId` = el token de quien invocó.
function mareoEstadoNuevo(pre, invocadorId){
  return {id: idEstadoNuevo(), activo: true, ...structuredClone(pre), permanente: true, turnos: 0, hasta: OrdenTurnos.mareoHasta(), mareoDe: mareoEnOrden(invocadorId) ? invocadorId : ''};
}
// Lo que dice la Crónica al entrar (invocación o refuerzo).
function mareoLineaEntrada(invocadorId, sinMareo){
  return sinMareo ? 'Sin mareo: actúa en su primer turno.' : '😵 Recién llega: no actúa en su primer turno (reacciona igual).';
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
/* La revisión (solo la pantalla del GM). `o.empieza` = el token al que le empieza el turno; `o.termina` = el token al que se le termina (o se le pasa sin
   jugar); sin nada, solo mira si alguna mareada ya no está en el orden. → los grupos de líneas para la tarjeta del turno (turnoMarcar), uno por token
   que dejó de estar mareado; además, cada línea va a la Mesa. */
async function mareoRevisar(o){
  o = o || {};
  if(!soyGM || typeof OrdenTurnos === 'undefined') return [];
  const grupos = [];
  for(const [id, t] of [...tokens]){
    if(!t || !t.fichaId || mareoSacando.has(id)) continue;
    if(!confusionEstadosDe(t).some(OrdenTurnos.esMareoHasta)) continue;
    const inv = mareoInvocadorDe(t);
    const por = OrdenTurnos.mareoSeVa({yo: id, invocador: inv}, {empieza: o.empieza, termina: o.termina, enOrden: mareoEnOrden});
    if(!por) continue;
    mareoSacando.add(id);
    try{
      if(!(await mareoSacar(t))) continue;
      const tI = inv ? tokens.get(inv) : null, nomI = tI && !ocultoParaMesa(inv) ? nombreDe(tI) : 'quien la invocó';
      const linea = `😵 ${nombreDe(t)} ya no está ${t.tipo === 'creep' ? 'mareado' : 'mareada'}: ${por === 'termino' ? 'terminó su primer turno' : por === 'empieza' ? `empezó el turno de ${nomI}` : 'salió del orden de turnos'}.`;
      if(o.empieza || o.termina) grupos.push(turnoMarcar([linea], id));   // (la tarjeta del turno: dura unos segundos)
      if(!ocultoParaMesa(id)) try{ mesaLinea(linea, 'recordatorio'); }catch(e){}   // y la Mesa, que queda
      else if(!o.empieza && !o.termina) toast(linea);
    }catch(err){ console.error('No se pudo sacar el Mareo de invocación:', err); }
    finally{ setTimeout(() => mareoSacando.delete(id), 4000); }
  }
  return grupos;
}
// Al cambiar el orden de turnos (escucharIniciativa): ¿alguna mareada salió del orden? (un poco después, para no pisarse con ▶ Siguiente).
let mareoRevisarTimer = 0;
function mareoRevisarLuego(){
  if(!soyGM) return;
  clearTimeout(mareoRevisarTimer);
  mareoRevisarTimer = setTimeout(() => { mareoRevisar({}).catch(err => console.error('Mareo de invocación:', err)); }, 2500);
}
