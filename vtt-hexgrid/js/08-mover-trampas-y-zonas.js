// js/08-mover-trampas-y-zonas.js — tramo 8 de 14 del script de mapa.html (paso 5, nivel A: mismo código, en el mismo orden): mover gastando No2, deshacer, detección, trampas ocultas, terreno incendiado, motor de zonas.
/* ---------- Mover gastando Nitros ---------- */

// Llama la atención sobre el cartel del movimiento sin confirmar.
function resaltarRutaConfirmar(){
  const caja = $('#ruta-confirmar');
  if(caja.hidden) return;
  caja.classList.remove('atencion');
  void caja.offsetWidth;  // reinicia la animación
  caja.classList.add('atencion');
  $('#ruta-no').focus();
}

function mostrarConfirmacionRuta(){
  const p = rutaPendiente;
  if(!p) return;
  const costo = p.pasos * p.porCasillero;
  const exceso = costo - Math.max(0, p.disponibles);
  // Sin No2 suficientes el movimiento NO se hace (no hay No2 negativos; para moverse igual está 🦶 Mover libre): el cartel lo dice
  // claro en vez de invitar a confirmar (2026-09-24).
  $('#ruta-texto').textContent = exceso > 0
    ? `Mover ${p.pasos} casillero${p.pasos === 1 ? '' : 's'} cuesta ${fmt(costo)} No2 y tenés ${fmt(Math.max(0, p.disponibles))} · ⚠ te faltan ${fmt(exceso)}: no se puede hacer · clic afuera lo cancela (para moverte igual, usá Mover libre 🦶)`
    : `Mover ${p.pasos} casillero${p.pasos === 1 ? '' : 's'} · −${fmt(costo)} No2 (te quedan ${fmt(p.disponibles - costo)})` +
      (p.porCasillero !== 1 ? ` · ${fmt(p.porCasillero)} por casillero` : '') +
      ' · clic afuera para confirmar';
  $('#ruta-confirmar').classList.toggle('excede', exceso > 0);
  $('#ruta-confirmar').hidden = false;
  document.body.classList.add('con-ruta');
}

function cancelarRuta(){
  rutaPendiente = null;
  trampaPendiente = null;
  oportunidadPendiente = null;   // js/17
  $('#ruta-confirmar').hidden = true;
  document.body.classList.remove('con-ruta');
  pedirDibujo();
}

// Descuenta los Nitros en la ficha (parte "general" + resumen), igual que
// cambiarVidaPj con la vida. Puede quedar en negativo (moverse de más se
// permite, avisando). Devuelve los que quedan.
async function gastarNitros(fichaId, costo){
  const base = fbDb.doc(fbRutaCampana(`fichas/${fichaId}`));
  const parteRef = base.collection('partes').doc('general');
  const ts = firebase.firestore.FieldValue.serverTimestamp();
  return fbDb.runTransaction(async tx => {
    const [parte, ficha] = await Promise.all([tx.get(parteRef), tx.get(base)]);
    if(!parte.exists || !ficha.exists) throw new Error('La ficha todavía no se guardó en la mesa');
    const datos = JSON.parse(parte.data().json || '{}');
    const r = ficha.data().resumen || {};
    const actual = datos.nitros === null || datos.nitros === undefined ? num(r.nitros) : num(datos.nitros);
    datos.nitros = actual - costo;
    tx.set(parteRef, {json: JSON.stringify(datos), actualizado: ts});
    tx.update(base, {'resumen.nitros': datos.nitros, actualizado: ts});
    return datos.nitros;
  });
}

// Lo mismo sobre la parte privada del creep (lo hace el GM).
function gastarNitrosCreep(creepId, costo){
  return modificarCreep(creepId, sc => {
    sc.nitros = num(sc.nitros) - costo;
    return sc.nitros;
  });
}

/* ---------- Deshacer (Ctrl+Z), encadenado (2026-09-25, pedido del dueño) ----------
   Se anota cada movimiento (casilleros con No2, mover libre), cada giro del token propio y cada cambio de HP, SP o No2 hecho
   desde el token. Ctrl+Z los va deshaciendo de a uno, del más nuevo al más viejo: un movimiento vuelve a su lugar y orientación
   (devuelve los No2 que costó y vuelve a tapar la niebla que descubrió) y un cambio de HP, SP o No2 vuelve al valor de antes.
   Límite: los últimos DESHACER_MAX pasos de ESTA pantalla, y solo dentro del mismo turno — tras un Mantenimiento se pierde la
   pila (los No2 ya se recargaron y el resto cambió). No se recupera nada que haya hecho otro (un daño de trampa, un estado). */
const DESHACER_MAX = 30;
const deshacerPila = [];

function deshacerRegistrar(e){
  deshacerPila.push({...e, mant: mantenimientoNumero});
  if(deshacerPila.length > DESHACER_MAX) deshacerPila.shift();
}

// Cambio de HP, SP o No2 desde el token: se anota el valor de ANTES para poder volver a él.
function vitalActual(t, clave){
  const d = hudDatos(t);
  const v = clave === 'hp' ? d.hp : clave === 'sp' ? d.sp : d.no2;
  return v === null || v === undefined ? null : num(v);
}
function vitalRegistrar(id, clave, antes){
  if(antes === null || antes === undefined) return;
  deshacerRegistrar({tipo: 'vital', id, clave, antes});
}
async function deshacerVital(u){
  const t = tokens.get(u.id);
  if(!t || !puedoCambiarVida(t)) return;
  const txt = String(u.antes);
  const nombre = u.clave === 'hp' ? 'HP' : u.clave === 'sp' ? 'SP' : 'No2';
  try{
    if(u.clave === 'no2') await cambiarNitros(t, txt);
    else if(t.tipo === 'creep') await cambiarVidaCreep(t.fichaId, txt);
    else await cambiarVidaPj(t, u.clave, txt);
    pedirDibujo();
    toast(`Deshecho: ${nombre} vuelve a ${fmt(u.antes)}`);
  }catch(err){
    console.error('No se pudo deshacer:', err);
    toast(esCuotaAgotada(err) ? CUOTA_AGOTADA_TXT : err.code === 'permission-denied' ? 'No podés deshacer eso' : 'No se pudo deshacer');
  }
}

async function deshacerUltimoMovimiento(){
  if(!deshacerPila.length){ toast('No hay nada para deshacer'); return; }
  if(rutaPendiente) return;   // hay un movimiento marcado sin confirmar: primero eso
  if(deshacerPila[deshacerPila.length - 1].mant !== mantenimientoNumero){ deshacerPila.length = 0; toast('Ya pasó el turno: no se puede deshacer'); return; }
  const u = deshacerPila.pop();
  if(u.tipo === 'vital'){ await deshacerVital(u); return; }
  const t = tokens.get(u.id);
  if(!t) return;
  try{
    if(u.costo > 0){
      if(u.esCreep) await gastarNitrosCreep(u.fichaId, -u.costo);
      else await gastarNitros(u.fichaId, -u.costo);
    }
    const doc = coleccionTokens().doc(u.id);
    if(u.tipo === 'giro'){
      t.rotacion = u.rotacion;
      await doc.update({rotacion: u.rotacion});
      if(u.gratis) giroLibre.add(u.id);   // el giro gratis de después de moverse vuelve a estar disponible
    }else{
      t.col = u.col; t.fila = u.fila; t.rutaJson = '[]';
      if(u.rotacion !== undefined) t.rotacion = u.rotacion;
      estelas.delete(u.id);
      giroLibre.delete(u.id);
      await doc.update({col: u.col, fila: u.fila, ...(u.rotacion !== undefined ? {rotacion: u.rotacion} : {}), ruta: firebase.firestore.FieldValue.delete()});
    }
    nieblaDeshacer(u.seq0, u.pend0);
    renderPanel();
    pedirDibujo();
    toast(`Deshecho${u.costo > 0 ? ` · +${fmt(u.costo)} No2` : ''}${deshacerPila.length ? ` · quedan ${deshacerPila.length} para deshacer` : ''}`);
  }catch(err){
    console.error('No se pudo deshacer:', err);
    toast(err.code === 'permission-denied' ? 'No podés deshacer eso' : 'No se pudo deshacer');
  }
}

// Vuelve a tapar lo que se descubrió después de seq0 (lo que ese paso destapó):
// lo que todavía estaba por guardarse se descarta y lo ya guardado se saca de
// las celdas descubiertas del mapa.
function nieblaDeshacer(seq0, pend0){
  if(!nieblaActiva) return;
  [...nieblaPendientes].forEach(k => { if(!pend0 || !pend0.has(k)) nieblaPendientes.delete(k); });
  const sacar = new Set();
  nieblaLog.filter(l => l.seq > seq0).forEach(l => l.celdas.forEach(k => sacar.add(k)));
  while(nieblaLog.length && nieblaLog[nieblaLog.length - 1].seq > seq0) nieblaLog.pop();
  nieblaFirma = '';
  if(!sacar.size) return;
  sacar.forEach(k => nieblaDescubierta.delete(k));
  fbDb.doc(fbRutaCampana(rutaMapaEstado('niebla'))).set({descubiertas: firebase.firestore.FieldValue.arrayRemove(...sacar)}, {merge: true})
    .catch(err => console.error('No se pudo volver a tapar la niebla:', err));
}

/* ---------- Detección inmediata al caminar (escenario 2) ----------
   Quien camina (sin estar en sigilo) y en algún casillero de su ruta deja a un rival en sigilo
   dentro de su CONO (detección inmediata, cono azul): el movimiento se corta ahí. Al quedar
   detectado, el que estaba oculto pierde el sigilo solo (lo hace su dueño o el GM, ver
   sigiloRevisar) y su token aparece para todos. No hay tirada: se ve de manera directa. La
   zona de alerta no interrumpe a quien camina. Igual para personajes y creeps. */

/* ---------- Trampas ocultas ----------
   Un elemento con `trampa` es una trampa: solo la ven su dueño y el GM hasta que se dispara.
   La dispara un rival del dueño (los creeps si la puso un jugador; los personajes si la puso el
   GM) que pise cualquiera de sus casillas en la ruta: el movimiento se corta ahí, la trampa
   queda marcada como disparada (visible para todos) y se avisa en rojo en la Mesa. Quien tiene
   la pasiva Percepción aumentada, además, se detiene al quedar justo al lado de una que todavía no ve
   (2026-10-02, P145): «Algo está fuera de lugar… tirá Percepción» — sin decir qué es. Si gana contra la
   dificultad de la trampa (`trampaDetectar`, 8 si no tiene), la descubre y la ve todo su equipo
   (`descubierta`); si pierde, sigue libre: pisarla la detona y pasar por OTRO casillero al lado
   vuelve a pedir la tirada (una vez por casillero). */
let trampaPendiente = null;   // {tokenId, tipo: 'pisa' | 'cerca', id, el, celda, desde (la casilla anterior: hacia dónde caminaba)}
const trampasAvisadas = new Set();   // 'token:trampa:casillero' que ya pidieron la tirada

// Criterio del dueño (2026-09-25): los aliados NUNCA disparan una trampa (solo la activan los rivales de quien la puso). "Fuego amigo"
// es del EFECTO: si es de área y tiene fuego amigo (lo físico y explosivo), alcanza a todos los de adentro, aliados incluidos; si no
// (lo mágico), solo a los rivales (`trampaAfectados`).
function trampaDispara(t, el){
  const dueno = miembros.get(el.duenoUid);
  return dueno && dueno.gm ? t.tipo === 'pj' : t.tipo === 'creep';
}
function tokenPercepcionAumentada(t){
  const v = vinculo(t), r = v && v.resumen;
  return t.tipo === 'pj' && !!(r && r.percepcionAumentada);
}
function vecinosDeCasilla(c){
  const c0 = hexACubo(c);
  return VECINO_LADO.map(([dq, dr]) => ({col: cuboACol(c0.q + dq, c0.r + dr), fila: cuboAFila(c0.q + dq, c0.r + dr)}));
}
function trampasEvaluarRuta(tokId, t, ruta){
  const trampas = [];
  elementos.forEach((el, id) => {
    if(el.trampa && !el.disparada && trampaDispara(t, el)) trampas.push({id, el, set: new Set(celdasDeElemento(el).map(c => nbPack(c.col, c.fila)))});
    // Portal (Invocar portal): lo usan solo los ALIADOS de quien lo invocó (los rivales pasan de largo); no se "dispara", queda hasta que venza.
    else if(el.portal && destinoParsear(el.portalDestino) && !trampaDispara(t, el)) trampas.push({id, el, portal: true, set: new Set(celdasDeElemento(el).map(c => nbPack(c.col, c.fila)))});
  });
  if(!trampas.length) return null;
  const atento = tokenPercepcionAumentada(t);
  for(let i = 1; i < ruta.length; i++){
    const pisa = trampas.find(x => x.set.has(nbPack(ruta[i].col, ruta[i].fila)));
    if(pisa) return {indice: i, tipo: pisa.portal ? 'portal' : 'pisa', id: pisa.id, el: pisa.el};
    if(atento){
      const vec = vecinosDeCasilla(ruta[i]).map(v => nbPack(v.col, v.fila));
      const aca = nbPack(ruta[i].col, ruta[i].fila);
      // Solo las que todavía no ve (ni descubierta por su equipo, ni vista por este navegador), y una vez por casillero.
      const cerca = trampas.find(x => !x.portal && !x.el.descubierta && !trampasVistas.has(x.id) && !trampasAvisadas.has(tokId + ':' + x.id + ':' + aca) && vec.some(k => x.set.has(k)));
      if(cerca) return {indice: i, tipo: 'cerca', id: cerca.id, el: cerca.el};
    }
  }
  return null;
}
/* ---------- Terreno incendiado (2026-09-25, pedido del dueño) ----------
   Una forma con `fuego: true` y `fuegoDano` (valor inicial 5, editable). Hace daño (DIRECTO a la vida: el fuego es daño mágico elemental y no hay
   defensa mágica) (1) cada vez que un token ENTRA en el fuego viniendo de afuera (lo aplica quien mueve el token: su dueño o el GM en los creeps) y
   (2) en cada ⟳ Mantenimiento a todos los que sigan adentro (cada cliente aplica lo suyo: el GM a los creeps, cada jugador a sus personajes).
   Las invocaciones y los personajes sin dueño conectado se avisan en la Mesa para aplicarlo a mano. Con "Turnos que dura" se apaga solo. */
function fuegoCeldas(){
  const m = new Map();   // "col,fila" → daño (el mayor si se superponen)
  elementos.forEach(el => {
    if(!el.fuego) return;
    const d = Math.max(1, num(el.fuegoDano) || 5);
    celdasDeElemento(el).forEach(c => { const k = nbPack(c.col, c.fila); if(!m.has(k) || m.get(k) < d) m.set(k, d); });
  });
  return m;
}
async function fuegoAplicarA(t, dano, cuando){
  let hecho = false;
  try{
    if(t.tipo === 'creep' && t.fichaId && soyGM){ await danioCreep(t, String(dano), true); hecho = true; }
    else if(t.tipo === 'pj' && t.fichaId && !String(t.fichaId).includes(SEP_INVOCACION) && puedoMover(t)){ await danioPj(t, String(dano), true); hecho = true; }
  }catch(err){ console.error('No se pudo aplicar el daño de fuego:', err); }
  return hecho;
}
// Al soltar un movimiento: cada casilla del recorrido que es fuego y viene de una que no lo es cuenta como una entrada.
async function fuegoEntrada(id, celdas){
  const t = tokens.get(id);
  if(!t || !celdas || celdas.length < 2) return;
  const fuego = fuegoCeldas();
  if(!fuego.size) return;
  let total = 0, entradas = 0;
  for(let i = 1; i < celdas.length; i++){
    const k = nbPack(celdas[i].col, celdas[i].fila), previa = nbPack(celdas[i - 1].col, celdas[i - 1].fila);
    if(fuego.has(k) && !fuego.has(previa)){ total += fuego.get(k); entradas++; }
  }
  if(!total) return;
  const hecho = await fuegoAplicarA(t, total);
  alertaRojaAnonima(`🔥 Terreno incendiado`, `${t.oculto ? 'Alguien' : nombreDe(t)} entró en el fuego${entradas > 1 ? ` (${entradas} veces)` : ''}: ${total} de daño de fuego (directo a la vida) — ${hecho ? 'aplicado solo' : 'aplicalo a mano'}`);
}
// Al pasar el turno (⟳ Mantenimiento): todo el que siga en el fuego lo recibe de nuevo. Los fuegos que se apagan justo ahora no cuentan.
async function fuegoMantenimiento(numero){
  const fuego = new Map();
  elementos.forEach(el => {
    if(!el.fuego || (el.venceMant !== null && el.venceMant !== undefined && el.venceMant <= numero)) return;
    const d = Math.max(1, num(el.fuegoDano) || 5);
    celdasDeElemento(el).forEach(c => { const k = nbPack(c.col, c.fila); if(!fuego.has(k) || fuego.get(k) < d) fuego.set(k, d); });
  });
  if(!fuego.size) return;
  const propios = [], ajenos = [];
  tokens.forEach(t => {
    const d = fuego.get(nbPack(t.col, t.fila));
    if(!d || !t.fichaId) return;
    const mio = (t.tipo === 'creep' && soyGM) || (t.tipo === 'pj' && !String(t.fichaId).includes(SEP_INVOCACION) && puedoMover(t));
    (mio ? propios : ajenos).push({t, d});
  });
  const hechos = [];
  for(const {t, d} of propios){ if(await fuegoAplicarA(t, d)) hechos.push(`${t.oculto ? 'Alguien' : nombreDe(t)}: ${d}`); }
  if(hechos.length) alertaRojaAnonima('🔥 Terreno incendiado (Mantenimiento)', `${hechos.join(' · ')} de daño de fuego, directo a la vida (aplicado solo)`);
  if(soyGM){   // el GM avisa lo que no se pudo aplicar solo (invocaciones o personajes que no están conectados no se detectan: revisar el mapa)
    const manual = ajenos.filter(({t}) => t.tipo === 'pj' && String(t.fichaId).includes(SEP_INVOCACION));
    if(manual.length) alertaRojaAnonima('🔥 Terreno incendiado (a mano)', `${manual.map(({t, d}) => `${nombreDe(t)}: ${d}`).join(' · ')} de daño de fuego: aplicalo a mano`);
  }
}

/* ---------- Zona con efecto persistente: el motor (2026-09-28, pedido del dueño) ----------
   Generaliza 🔥 Terreno incendiado (que queda tal cual, sin tocar): además de daño puede dejar un estado, con o
   sin resistencia, y la coloca una habilidad (jugador o creep), no solo el GM a mano. Mismo criterio de "mejor
   esfuerzo, cada uno lo suyo" que el fuego: cada pantalla revisa sus propios tokens (el dueño los suyos, el GM
   sus creeps) al entrar y en cada Mantenimiento. Pedido explícito del dueño: "que la automatización no quite el
   momento de esto está pasando" — nunca se resuelve en silencio, siempre aparece #zona-banner con lo que
   corresponde (tirar para resistir, o un simple "Aplicar" si no hay nada que tirar) antes de tocar nada. */
const ZONA_STAT_LABEL = {resmg: 'Res.Esp', dmgesp: 'Ef.Esp', resm: 'Res.Mt', con: 'Constitución', fue: 'Fuerza', agl: 'Agilidad', des: 'Destreza', esp: 'Especial', eva: 'Evasión', pdg: 'PdG', pdgmg: 'PdG.Esp'};
// El stat de un creep para resistir una zona: el mismo cálculo que GM Tools (comun/creep-calculo.js, paso 4 etapa 4a). Antes era
// una cuenta propia que no sumaba lo que sube el atributo (Res.Esp sin los bonos de Constitución, Evasión sin los de Agilidad)
// ni el +1 de Res.Esp de los jefes.
function zonaStatCreep(sc, statId){ return CreepCalculo.statValor(sc, statId); }
function zonaEsMia(t){
  if(t.tipo === 'creep') return soyGM;
  return t.tipo === 'pj' && !!t.fichaId && !String(t.fichaId).includes(SEP_INVOCACION) && puedoMover(t);
}
// ¿t es rival de quien creó la zona? (mismo sentido que dueloEsRival, con el casteador guardado en el propio elemento).
function zonaEsRival(el, t){ return el.zonaCasteadorTipo === 'creep' ? t.tipo === 'pj' : t.tipo === 'creep'; }
function zonaAplicaA(el, t){
  if(!t.fichaId || (t.fichaId === el.zonaCasteadorRef && t.tipo === el.zonaCasteadorTipo)) return false;   // no afecta a quien la creó
  return el.zonaAmiga || zonaEsRival(el, t);
}
// ¿Todavía le falta algo a este par (zona, token)? El daño se vuelve a chequear siempre (como el fuego); el
// estado, solo si ese token no está ya en zonaResueltos (una vez que lo tiene, no se le vuelve a tirar la resistencia).
function zonaLeFalta(el, t){
  if(el.zonaDano || el.zonaDanoDif) return true;
  if(el.zonaEstado && !(el.zonaResueltos || []).includes(zonaIdDe(t))) return true;
  return false;
}
// El id de un token (la clave en `tokens`): los objetos del token no lo llevan adentro (antes se leía t.id, que no existe, y el cartelito
// de las zonas nunca aparecía — encontrado probando Pedos Tóxicos, 2026-10-02).
function zonaIdDe(t){ for(const [id, x] of tokens) if(x === t) return id; return ""; }
let zonaCola = [];      // [{elId, tokenId}] a la espera de mostrarse en esta pantalla
let zonaBanner = null;  // {elId, tokenId, el, t, resultado} el que se está mostrando ahora
function zonaEncolar(el, t){
  if(zonaCola.some(x => x.elId === el.id && x.tokenId === zonaIdDe(t))) return;
  if(zonaBanner && zonaBanner.elId === el.id && zonaBanner.tokenId === zonaIdDe(t)) return;
  zonaCola.push({elId: el.id, tokenId: zonaIdDe(t)});
  zonaMostrarSiguiente();
}
function zonaMostrarSiguiente(){
  if(zonaBanner || !zonaCola.length) return;
  const {elId, tokenId} = zonaCola.shift();
  const el = elementos.get(elId), t = tokens.get(tokenId);
  if(!el || !el.zona || !t || !zonaLeFalta(el, t)){ zonaMostrarSiguiente(); return; }
  zonaBanner = {elId, tokenId, el, t, resultado: null};
  renderZonaBanner();
}
// `desdeMantenimiento`: las zonas con zonaEnMantenimiento === false (las púas: "no mientras estás parado") no se
// chequean acá — solo al caminar (ver zonaRevisarEntrada).
function zonaRevisarToken(t, desdeMantenimiento){
  if(!t || !zonaEsMia(t)) return;
  elementos.forEach(el => {
    if(!el.zona || !zonaAplicaA(el, t) || !zonaLeFalta(el, t)) return;
    if(desdeMantenimiento && el.zonaEnMantenimiento === false) return;
    if(!celdasDeElemento(el).some(c => c.col === t.col && c.fila === t.fila)) return;
    zonaEncolar(el, t);
  });
}
// Al soltar un movimiento: para la mayoría de las zonas alcanza con mirar dónde terminó. Las de zonaCadaPaso
// (púas: se disparan aunque solo se las cruce, sin quedarse) además cuentan cualquier casillero cruzado que sea
// suyo y venga de uno que no lo era — mismo conteo que ya usa 🔥, una sola vez por movimiento (no por casillero).
function zonaRevisarEntrada(id, celdas){
  const t = tokens.get(id);
  if(!t || !zonaEsMia(t)) return;
  if(celdas && celdas.length > 1){
    elementos.forEach(el => {
      if(!el.zona || !el.zonaCadaPaso || !zonaAplicaA(el, t) || !zonaLeFalta(el, t)) return;
      const cs = celdasDeElemento(el);
      const enCelda = c => cs.some(x => x.col === c.col && x.fila === c.fila);
      for(let i = 1; i < celdas.length; i++){
        if(enCelda(celdas[i]) && !enCelda(celdas[i - 1])){ zonaEncolar(el, t); break; }
      }
    });
  }
  zonaRevisarToken(t, false);
}
function zonaRevisarMantenimiento(){ tokens.forEach(t => zonaRevisarToken(t, true)); }
function renderZonaBanner(){
  let el2 = document.getElementById('zona-banner');
  if(!zonaBanner){ if(el2) el2.hidden = true; return; }
  const el = elementos.get(zonaBanner.elId), t = tokens.get(zonaBanner.tokenId);
  if(!el || !el.zona || !t){ zonaBanner = null; zonaMostrarSiguiente(); return; }   // se borró la zona o el token mientras esperaba
  if(!el2){
    el2 = document.createElement('div');
    el2.id = 'zona-banner';
    momentoEstiloCentro(el2);   // al centro: es quien resuelve el momento (P146, js/16)
    document.body.appendChild(el2);
  }
  el2.hidden = false;
  const icono = el.zonaDanoTipo === 'de fuego' || (!el.zonaEstado && !el.zonaDanoTipo) ? '🔥' : '🌫';   // 🔥 solo para el fuego (o una zona vieja de puro daño)
  // Su momento (P146): los demás lo ven en la esquina mientras se resuelve, y el resultado al final.
  if(!zonaBanner.resultado && !zonaBanner.momentoP) zonaBanner.momentoP = momentoAbrir({tipo: 'zona', icono, titulo: `${t.oculto ? 'Alguien' : nombreDe(t)} está en ${el.zonaNombre || 'la zona'}…`, estado: 'tirando', resuelve: fbUsuario.uid, datos: {centro: true}});
  const nombreT = t.oculto ? 'Alguien' : nombreDe(t);
  let cuerpo;
  if(zonaBanner.resultado){
    cuerpo = `<span>${icono} <b>${esc(el.zonaNombre || 'Zona')}</b> · ${esc(nombreT)}: ${esc(zonaBanner.resultado)}</span><button type="button" class="btn" id="zona-banner-ok">Listo</button>`;
  }else if(el.zonaResistStat){
    cuerpo = `<span>${icono} <b>${esc(el.zonaNombre || 'Zona')}</b>: ${esc(nombreT)} entró — tirá ${esc(ZONA_STAT_LABEL[el.zonaResistStat] || el.zonaResistStat)} para resistir</span><button type="button" class="btn" id="zona-banner-ir">🎲 Tirar</button>`;
  }else{
    cuerpo = `<span>${icono} <b>${esc(el.zonaNombre || 'Zona')}</b>: le toca a ${esc(nombreT)}</span><button type="button" class="btn" id="zona-banner-ir">Aplicar</button>`;
  }
  el2.innerHTML = cuerpo;
  const bt = document.getElementById('zona-banner-ir'); if(bt) bt.onclick = zonaResolverBanner;
  const bo = document.getElementById('zona-banner-ok'); if(bo) bo.onclick = () => { zonaBanner = null; zonaMostrarSiguiente(); };
}
async function zonaResolverBanner(){
  if(!zonaBanner) return;
  const {elId, tokenId} = zonaBanner;
  const el = elementos.get(elId), t = tokens.get(tokenId);
  const bt = document.getElementById('zona-banner-ir'); if(bt) bt.disabled = true;
  if(!el || !t){ zonaBanner = null; zonaMostrarSiguiente(); return; }
  let resistio = false, diferencia = null;
  const partes = [];
  const quienTxt = t.oculto ? 'Alguien' : nombreDe(t);
  if(el.zonaResistStat){
    const valor = t.tipo === 'creep' ? (() => { const sc = creepPrivadoDe(t.fichaId); return sc ? zonaStatCreep(sc, el.zonaResistStat) : 0; })()
      : (() => { const f = fichasPub.get(t.fichaId); return f && f.resumen ? num(f.resumen[el.zonaResistStat]) : 0; })();
    // La misma tirada de stat que en la ficha y GM Tools (comun/combatiente.js), con los estados de quien resiste.
    const estadosDe = t.tipo === 'creep' ? ((creepPrivadoDe(t.fichaId) || {}).estados || []) : (((fichasPub.get(t.fichaId) || {}).resumen || {}).estados || []);
    // La tirada de la zona (2026-10-02, P143): si la zona guarda el stat de quien la creó, se tira AHORA (cada exposición, una tirada
    // nueva); si no (zonas viejas, del GM o de trampas), vale el número fijo guardado.
    let contra = num(el.zonaResistValor), contraTxt = String(contra);
    if(el.zonaTiraStat && Number.isFinite(el.zonaTiraValor)){
      const rz = Combatiente.tirarStat(el.zonaTiraValor, [], el.zonaTiraStat);
      if(rz){
        contra = rz.total;
        const etqZ = ZONA_STAT_LABEL[el.zonaTiraStat] || el.zonaTiraStat;
        contraTxt = `${etqZ} ${rz.total}`;
        const ct = [...tokens.values()].find(x => x.fichaId === el.zonaCasteadorRef && x.tipo === el.zonaCasteadorTipo);
        const de = ct && !ct.oculto ? ` (de ${nombreDe(ct)})` : '';
        try{ mesaPublicar(`${el.zonaNombre || 'Zona'}${de} · ${etqZ}`, {formula: rz.formula, rolls: rz.rolls, mod: rz.mod, total: rz.total, quien: `${el.zonaNombre || 'Zona'}${de}`}); }catch(err){}
      }
    }
    const rd = Combatiente.tirarStat(valor, estadosDe, el.zonaResistStat);
    if(rd){
      const total = rd.total;
      resistio = total > contra;   // empate: gana la zona (quien la creó)
      diferencia = Math.max(0, contra - total);
      try{ mesaPublicar(`${quienTxt} · ${ZONA_STAT_LABEL[el.zonaResistStat] || el.zonaResistStat}`, {formula: rd.formula, rolls: rd.rolls, mod: rd.mod, total}); }catch(err){}
      const tuyo = `${ZONA_STAT_LABEL[el.zonaResistStat] || el.zonaResistStat} ${total}`;
      partes.push(resistio ? `resistió (${tuyo} contra ${contraTxt})` : `no resistió (${tuyo} contra ${contraTxt})`);
    }
  }
  // El daño (2026-10-02, regla del dueño): quien resiste no recibe nada — ni el daño ni el estado. Con «la diferencia», el daño es
  // la tirada de quien la creó menos la de quien resiste (en un empate, 0: ni daño ni tirada extra).
  let danoHecho = 0;
  if(!resistio && (el.zonaDano || el.zonaDanoDif)){
    let monto = null;
    if(el.zonaDanoDif) monto = diferencia;
    else{ const r = tirarDados(el.zonaDano); if(r) monto = r.total; }
    const tipoTxt = el.zonaDanoTipo ? ` ${el.zonaDanoTipo}` : '';
    // Una zona de HABILIDAD cuyo daño ignora la Defensa es daño de casteo: le resta la Armadura mágica de quien lo recibe, como en el
    // duelo (dueloAplicarDano). Lo confirmó el dueño para el tóxico (P142, 2026-10-02). Las zonas del GM y de trampas, no.
    const armadmg = !el.zonaIgnoraDef || !el.zonaCasteadorRef ? 0
      : t.tipo === 'creep' ? (() => { const sc = creepPrivadoDe(t.fichaId); return sc ? creepArmadmgMapa(sc) : 0; })()
      : (() => { const f = fichasPub.get(t.fichaId); return f && f.resumen ? num(f.resumen.armadmg || 0) : 0; })();
    if(monto > 0){
      try{
        let res = null;
        if(t.tipo === 'creep') res = await danioCreep(t, String(monto), !!el.zonaIgnoraDef, armadmg);
        else if(puedoMover(t)) res = await danioPj(t, String(monto), !!el.zonaIgnoraDef, armadmg);
        partes.push(`${monto} de daño${tipoTxt}${armadmg > 0 ? ` (− ${armadmg} de Armadura mágica)` : ''}`);
        danoHecho = res && res.r ? num(res.r.recibido) : monto;   // lo que llegó a la vida (escudos y Armadura mágica ya restados)
      }catch(err){ console.error('No se pudo aplicar el daño de la zona:', err); partes.push(`${monto} de daño${tipoTxt} (aplicalo a mano)`); danoHecho = monto; }
    }else if(monto === 0) partes.push('sin daño');
  }
  // Si el daño entró: la tirada extra (ej. 1d20) con el texto de qué significa cada resultado, en la Mesa y en el cartelito. Aplicar lo que
  // salga queda a mano.
  if(danoHecho > 0 && (el.zonaTiraExtra || el.zonaNota)){
    const r = el.zonaTiraExtra ? tirarDados(el.zonaTiraExtra) : null;
    if(r){
      try{ if(el.zonaNota) mesaConTexto(el.zonaNota); mesaPublicar(`${quienTxt} · ${el.zonaNombre || 'Zona'}`, {formula: r.formula || el.zonaTiraExtra, rolls: r.rolls, mod: r.mod, total: r.total}); }catch(err){}
      partes.push(`🎲 ${el.zonaTiraExtra}: ${r.total}${el.zonaNota ? ` — ${el.zonaNota}` : ''}`);
    }else if(el.zonaNota) partes.push(el.zonaNota);
  }
  if(el.zonaEstado && !resistio){
    let spec = null; try{ spec = JSON.parse(el.zonaEstado); }catch(err){}
    if(spec && spec.nombre){
      try{
        if(t.tipo === 'creep'){ await modificarCreep(t.fichaId, sc => EstadosAplicar.aplicarACreep(sc, spec)); }
        else{ await EstadosAplicar.encolarPj({fichaId: t.fichaId, duenoUid: t.duenoUid, spec, origen: el.zonaNombre || 'Zona'}); }
        partes.push(spec.nombre);
      }catch(err){ console.error('No se pudo aplicar el estado de la zona:', err); partes.push(`${spec.nombre} (aplicalo a mano)`); }
    }
  }
  if(el.zonaEstado && !resistio){
    try{ await coleccionElementos().doc(elId).update({zonaResueltos: firebase.firestore.FieldValue.arrayUnion(tokenId)}); }
    catch(err){ console.error('No se pudo anotar zonaResueltos:', err); }
  }
  zonaBanner = {...zonaBanner, el, t, resultado: partes.join(' · ') || 'sin efecto'};
  { const resTxt = zonaBanner.resultado; if(zonaBanner.momentoP) zonaBanner.momentoP.then(mid => momentoActualizar(mid, {estado: 'listo', resultado: resTxt})); }
  renderZonaBanner();
}

// Quiénes sufren el efecto: quien la activó y, si es de área, los de adentro (todos con fuego amigo; si no, solo los que ella considera rivales).
function trampaAfectados(t, el){
  const celdas = new Set(celdasDeElemento(el).map(c => nbPack(c.col, c.fila)));
  const afectados = [t];
  if(celdas.size > 1) tokens.forEach(x => { if(x !== t && celdas.has(nbPack(x.col, x.fila)) && (el.fuegoAmigo || trampaDispara(x, el))) afectados.push(x); });
  return afectados;
}
/* Lo que le hace la trampa a cada afectado, automático donde se puede (2026-10-02, regla del dueño): la salvación (el mapa la tira sola con el
   stat de quien la pisó: `salva` dentro de trampaEstado = {stat, etq, dif, que} — 'todo' la evita entera, 'efecto' evita el estado, 'mitad' la
   mitad del daño),
   el daño (una sola tirada para todos) y el estado (`trampaEstado`). A cada afectado le llega **el Aviso** al centro de su pantalla (a un
   creep, al GM); los demás lo ven en **la Crónica** (la esquina de arriba a la derecha, js/16). Lo que no se pudo aplicar desde esta pantalla
   (el daño de un personaje ajeno) queda dicho «aplicalo a mano». */
function trampaSalvaDe(el){
  let e = null; try{ e = el.trampaEstado ? JSON.parse(el.trampaEstado) : null; }catch(x){}
  const s = e && e.salva;
  return s && s.stat && num(s.dif) >= 1 ? s : null;
}
function trampaValorStat(x, stat){
  if(x.tipo === 'creep'){ const sc = creepPrivadoDe(x.fichaId); return sc ? zonaStatCreep(sc, stat) : 0; }
  const f = fichasPub.get(String(x.fichaId || '').split(SEP_INVOCACION)[0]);
  return f && f.resumen ? num(f.resumen[stat]) : 0;
}
async function trampaAplicarEfectos(t, el){
  const afectados = trampaAfectados(t, el), salva = trampaSalvaDe(el);
  let spec = null; try{ spec = el.trampaEstado ? JSON.parse(el.trampaEstado) : null; }catch(e){}
  if(spec && !spec.nombre) spec = null;
  const tir = trampaDanoValido(el.trampaDano) ? tirarDados(el.trampaDano.trim()) : null;
  const nombreT = el.trampaNombre || 'una trampa';
  const gmUid = ([...miembros.entries()].find(([, m]) => m && m.gm) || [])[0] || '';
  const aMano = (String(el.trampaDetalle || '').match(/[^.]*\(a mano\)\./g) || []).map(x => x.trim()).join(' ');   // lo que el texto dice que va a mano
  const mesa = [];
  for(const x of afectados){
    const quien = x.oculto ? 'Alguien' : nombreDe(x);
    const esInv = String(x.fichaId || '').includes(SEP_INVOCACION);
    const partes = [];
    let evita = '';
    if(salva){
      const estadosDe = x.tipo === 'creep' ? ((creepPrivadoDe(x.fichaId) || {}).estados || []) : (((fichasPub.get(x.fichaId) || {}).resumen || {}).estados || []);
      const rd = Combatiente.tirarStat(trampaValorStat(x, salva.stat), estadosDe, salva.stat);
      if(rd){
        const etq = salva.etq || ZONA_STAT_LABEL[salva.stat] || salva.stat;
        try{ mesaPublicar(`${quien} · ${etq} (${nombreT})`, {formula: rd.formula, rolls: rd.rolls, mod: rd.mod, total: rd.total}); }catch(err){}
        const ok = rd.total >= num(salva.dif);   // llegar a la dificultad alcanza (como detectarla)
        if(ok) evita = salva.que || 'todo';
        partes.push(`${etq} ${rd.total} contra ${salva.dif}: ${!ok ? 'no la evitó' : evita === 'mitad' ? 'la mitad del daño' : evita === 'efecto' && tir ? 'esquivó el efecto' : 'la evitó'}`);
      }
    }
    if(tir && evita !== 'todo'){
      const monto = evita === 'mitad' ? Math.floor(tir.total / 2) : tir.total;
      let hecho = false;
      try{
        if(monto > 0 && x.tipo === 'creep' && x.fichaId && soyGM){ await danioCreep(x, String(monto), !!el.trampaIgnoraDef); hecho = true; }
        // Un personaje o una invocación: su dueño, o el GM (puede escribirle la vida, como en el duelo).
        else if(monto > 0 && x.tipo === 'pj' && x.fichaId && (puedoMover(x) || soyGM)){ await (esInv ? danioInv : danioPj)(x, String(monto), !!el.trampaIgnoraDef); hecho = true; }
      }catch(err){ console.error('No se pudo aplicar el daño de la trampa:', err); }
      partes.push(monto > 0 ? `${monto} de daño${el.trampaIgnoraDef ? ' directo a la vida' : ' (menos su Defensa)'}${hecho ? '' : ' — aplicalo a mano'}` : 'sin daño');
    }
    if(spec && evita !== 'todo' && evita !== 'efecto'){
      let que = ' — aplicalo a mano';
      try{
        if(x.tipo === 'creep' && x.fichaId && soyGM){
          let inmune = '';
          await modificarCreep(x.fichaId, sc => { const r = EstadosAplicar.aplicarACreep(sc, spec); if(!r.ok) inmune = r.motivo || 'inmune'; });
          que = inmune ? ` — no le hace nada (${inmune})` : '';
        }else if(x.tipo === 'pj' && x.fichaId && x.duenoUid){   // al personaje o a su invocación: lo aplica quien lo maneja (comun/recibidos.js)
          await EstadosAplicar.encolarPj({fichaId: x.fichaId, duenoUid: x.duenoUid, spec, origen: nombreT});
          que = '';
        }
      }catch(err){ console.error('No se pudo aplicar el estado de la trampa:', err); }
      partes.push(`${EstadosAplicar.texto(spec)}${que}`);
    }
    const resultado = partes.join(' · ') || 'no le hizo nada';
    mesa.push(`${quien}: ${resultado}`);
    momentoAbrir({tipo: 'trampa', icono: '🪤', titulo: x === t ? `${quien} pisó «${nombreT}»` : `${quien} quedó en el área de «${nombreT}»`,
      resultado: resultado + (aMano ? ` · ✋ ${aMano}` : ''), estado: 'listo',
      datos: {paraUid: x.tipo === 'creep' ? gmUid : (x.duenoUid || ''), aviso: true}});
  }
  if(mesa.length && (tir || spec || salva)) alertaRojaAnonima(`🪤 ${nombreT}${tir ? ` · ${tir.formula} = ${tir.total}` : ''}`, mesa.join(' · '));
}

/* Trampa de muro (2026-10-03, pedido del dueño: «al triggerearla se levanta una pared impenetrable, para tener que rodear»; delante del que la
   pisó, 4 turnos, familia propia). `muro` va adentro del JSON de trampaEstado ({largo: 3 | 5, turnos}). Se levanta en las casillas de ADELANTE
   de quien la pisó, según hacia dónde caminaba (la casilla anterior de su recorrido): 3 = el frente y las dos diagonales de adelante; 5 = además
   los dos costados. Es una forma Sólida y fijada (no se pasa ni se ve a través), que se va sola con los turnos; una casilla con un token o que ya
   es sólida queda libre. La crea la pantalla de quien movió (como el resto del disparo). */
function trampaMuroDe(el){
  let e = null; try{ e = el.trampaEstado ? JSON.parse(el.trampaEstado) : null; }catch(x){}
  return e && e.muro ? TokensAuto.muroNorm(e.muro) : null;
}
function trampaCeldasMuro(celda, desde, largo){
  const c0 = hexACubo(celda), d0 = desde ? hexACubo(desde) : null;
  let i = d0 ? VECINO_LADO.findIndex(([dq, dr]) => dq === c0.q - d0.q && dr === c0.r - d0.r) : -1;
  if(i < 0) i = 1;   // sin saber de dónde venía: hacia abajo (el frente por defecto)
  const lados = largo >= 5 ? [0, 1, 5, 2, 4] : [0, 1, 5];
  return lados.map(k => { const [dq, dr] = VECINO_LADO[(i + k) % 6]; return {dq, dr}; });
}
async function trampaLevantarMuro(t, celda, desde, muro, nombre){
  const ocupadas = new Set([...tokens.values()].map(x => nbPack(x.col, x.fila)));
  const c0 = hexACubo(celda);
  const celdas = trampaCeldasMuro(celda, desde, muro.largo).filter(({dq, dr}) => {
    const col = cuboACol(c0.q + dq, c0.r + dr), fila = cuboAFila(c0.q + dq, c0.r + dr);
    return !ocupadas.has(nbPack(col, fila)) && !elementoSolidoEn(col, fila);
  });
  if(!celdas.length || !fbUsuario) return;
  try{
    await coleccionElementos().add({
      tipo: 'libre', origen: {col: celda.col, fila: celda.fila}, celdas: celdas.flatMap(c => [c.dq, c.dr]), rotacion: 0,
      color: '#6B5B4B', alfa: 90, solido: true, invisible: false, imagen: '', imgZoom: 1, imgDX: 0, imgDY: 0, fijado: true,
      turnos: muro.turnos, venceMant: Math.round(num(mantenimientoNumero)) + muro.turnos,
      duenoUid: fbUsuario.uid, creado: firebase.firestore.FieldValue.serverTimestamp(),
    });
    const quien = t.oculto ? 'Alguien' : nombreDe(t);
    alertaRojaAnonima(`🧱 ${nombre}`, `Se levantó un muro delante de ${quien}: ${celdas.length} casillas, ${muro.turnos} turnos`);
    momentoAbrir({tipo: 'trampa', icono: '🧱', titulo: `Se levantó un muro delante de ${quien}`, resultado: `«${nombre}»: ${celdas.length} casillas que no se pueden pasar por ${muro.turnos} turnos`, estado: 'listo'});
  }catch(err){ console.error('No se pudo levantar el muro de la trampa:', err); toast('No se pudo levantar el muro'); }
}

// Después de que el token llegó a la casilla donde se cortó.
async function trampaResolver(){
  const p = trampaPendiente;
  trampaPendiente = null;
  if(!p) return;
  const t = tokens.get(p.tokenId);
  if(!t) return;
  if(p.tipo === 'portal'){   // pisó un portal aliado: pasa al otro, gratis y sin alertas
    await trampaTeleportar(p.tokenId, t, {trampaDestino: p.el.portalDestino}, false);
    try{ await coleccionElementos().doc(p.id).update({usoEn: Date.now()}); }catch(err){ console.error('No se pudo marcar el uso del portal (sin pulsos para los demás):', err); }
    return;
  }
  if(p.tipo === 'pisa'){
    try{ await coleccionElementos().doc(p.id).update({disparada: true}); }
    catch(err){ console.error('No se pudo marcar la trampa como disparada:', err); }
    const nombre = p.el.trampaNombre ? ': ' + p.el.trampaNombre : '';
    alertaRojaAnonima(`⚠ Trampa de ${nombreMiembro(p.el.duenoUid)}${nombre}`, `${nombreDe(t)} la activó${p.el.trampaDetalle ? ' — ' + p.el.trampaDetalle : ''}`);
    // Activar una trampa rompe el sigilo (2026-09-24, regla dicha por el dueño).
    if(enSigilo(t)) await romperSigilo(p.tokenId, '', `${nombreDe(t)} activó una trampa`);
    await trampaAplicarEfectos(t, p.el);   // la salvación, el daño y el estado de cada uno, con su Aviso y la Crónica
    if(p.el.trampaDestino) await trampaTeleportar(p.tokenId, tokens.get(p.tokenId), p.el);
    const muro = trampaMuroDe(p.el);
    if(muro) await trampaLevantarMuro(t, p.celda || t, p.desde, muro, p.el.trampaNombre || 'Trampa de muro');
    // Trampa persistente (2026-09-28, pedido del dueño): además del golpe de siempre (arriba), se convierte en
    // zona — mismas celdas y el mismo daño/estado, quedando puesta zonaTurnos turnos. Segunda escritura aparte
    // (regla nueva de Firestore: cualquiera puede completarla, ya viene pre-armada por quien puso la trampa).
    if(p.el.trampaDejaZona){
      const n = Math.max(1, Math.round(num(p.el.zonaTurnos)) || 3);
      const dueno = miembros.get(p.el.duenoUid);
      const cambios = {
        zona: true, zonaNombre: p.el.trampaNombre || 'Trampa', zonaCasteadorRef: '', zonaCasteadorTipo: (dueno && dueno.gm) ? 'creep' : 'pj',
        zonaResueltos: [], turnos: n, venceMant: Math.round(num(mantenimientoNumero)) + n,
        zonaEnMantenimiento: p.el.zonaEnMantenimiento !== false, zonaCadaPaso: !!p.el.zonaCadaPaso,
      };
      if(p.el.fuegoAmigo) cambios.zonaAmiga = true;
      if(trampaDanoValido(p.el.trampaDano)){ cambios.zonaDano = p.el.trampaDano; if(p.el.trampaIgnoraDef) cambios.zonaIgnoraDef = true; }
      if(p.el.trampaEstado){ try{ const e = JSON.parse(p.el.trampaEstado); delete e.salva; delete e.muro; if(e.nombre) cambios.zonaEstado = JSON.stringify(e); }catch(err){} }   // sin la salvación (es del disparo)
      if(p.el.zonaResistStat && Number.isFinite(p.el.zonaResistValor)){ cambios.zonaResistStat = p.el.zonaResistStat; cambios.zonaResistValor = p.el.zonaResistValor; }
      try{ await coleccionElementos().doc(p.id).update(cambios); }
      catch(err){ console.error('No se pudo convertir la trampa en zona:', err); }
    }
    return;
  }
  // 'cerca' (Percepción aumentada, P145): no se revela nada todavía — el cartelito pide la tirada sin decir qué es.
  const c = p.celda || {col: t.col, fila: t.fila};
  trampasAvisadas.add(p.tokenId + ':' + p.id + ':' + nbPack(c.col, c.fila));
  percepcionAbrir({tokenId: p.tokenId, trampaId: p.id});   // js/16 (el cartelito y su momento)
}

// Quien camina (sin estar en sigilo) puede entrar en el CONO de un rival en sigilo (detección
// inmediata: corta el movimiento y lo revela, ver más abajo) o en su ZONA DE ALERTA nomás — ahí no
// se corta nada, pero pide una tirada de percepción, igual que cuando es el oculto el que camina
// (escenario 2 de detección, 2026-09-22: antes solo contaba el cono).
// El cono (línea de visión directa) se mira en CADA paso: cruzarlo te delata aunque no te
// quedes ahí. La zona de alerta (P105, 2026-09-22) en cambio **solo cuenta si te quedás parado**:
// pasar de largo por ahí no dispara nada — se mira nomás en la casilla donde termina la ruta,
// orientada hacia el último paso que diste (antes contaba cada paso de más adentro de la zona,
// aunque fuera de paso).
function rotacionDePaso(pa, pb){
  return (((Math.round(Math.atan2(-(pb.x - pa.x), pb.y - pa.y) * 180 / Math.PI / 60) * 60) % 360) + 360) % 360;
}
function percepcionEvaluarRuta(t, id, ruta, ignorar){
  const ocultos = [];
  rivalesDe(t).forEach(r => {
    if(!enSigilo(r)) return;
    let rid = null;
    for(const [k, x] of tokens) if(x === r){ rid = k; break; }
    if(rid && !(ignorar && ignorar.has(rid))) ocultos.push({id: rid, tok: r});
  });
  percepcionAvisosPendientes.delete(id);
  if(!ocultos.length) return null;
  // Percepción aumentada (2026-10-02, P145): la zona de alerta cuenta en CADA paso (sin la pasiva, solo donde termina, P105). Si un oculto
  // queda en ella, se corta ahí con «Algo está fuera de lugar» (js/16): una vez por oculto y por casillero.
  const atento = tokenPercepcionAumentada(t);
  for(let i = 1; i < ruta.length; i++){
    const pa = hexCentro(ruta[i - 1].col, ruta[i - 1].fila), pb = hexCentro(ruta[i].col, ruta[i].fila);
    const z = zonasClaves({col: ruta[i].col, fila: ruta[i].fila, rotacion: rotacionDePaso(pa, pb)});
    const vistos = ocultos.filter(o => z.cono.has(nbPack(o.tok.col, o.tok.fila)));
    if(vistos.length) return {indice: i, ocultos: vistos.map(o => ({id: o.id, nombre: nombreDe(o.tok)}))};
    if(atento){
      const aca = nbPack(ruta[i].col, ruta[i].fila);
      const sospecha = ocultos.find(o => z.alerta.has(nbPack(o.tok.col, o.tok.fila)) && !percepcionChequeados.has(id + ':' + o.id + ':' + aca));
      if(sospecha) return {indice: i, tipo: 'percibe', ocultoId: sospecha.id, ocultos: []};
    }
  }
  const fin = ruta.length - 1;
  const pa = hexCentro(ruta[fin - 1].col, ruta[fin - 1].fila), pb = hexCentro(ruta[fin].col, ruta[fin].fila);
  const zFin = zonasClaves({col: ruta[fin].col, fila: ruta[fin].fila, rotacion: rotacionDePaso(pa, pb)});
  const pasos = new Map();
  ocultos.forEach(o => { if(zFin.alerta.has(nbPack(o.tok.col, o.tok.fila))) pasos.set(o.id, 1); });
  if(pasos.size) percepcionAvisosPendientes.set(id, pasos);
  return null;
}
// Uno por oculto en cuya zona de alerta se caminó (sin decir quién es ninguno de los dos): la
// Mesa solo pide la tirada, igual que sigiloPublicarAvisos del otro escenario.
function percepcionPublicarAvisos(id){
  const pasos = percepcionAvisosPendientes.get(id);
  percepcionAvisosPendientes.delete(id);
  if(!pasos) return;
  pasos.forEach(n => alertaRojaAnonima(n === 1 ? '⚠ Hace falta una tirada de percepción' : `⚠ Hacen falta ${n} tiradas de percepción`));
}

async function confirmarRuta(){
  const p = rutaPendiente;
  if(!p || p.confirmando) return;  // un solo cobro aunque lleguen dos clics
  p.confirmando = true;
  const t = tokens.get(p.id);
  $('#ruta-confirmar').hidden = true;
  document.body.classList.remove('con-ruta');
  if(!t){ cancelarRuta(); return; }
  const costo = p.pasos * p.porCasillero;
  // Sin No2 suficientes no se mueve (no hay No2 negativos): para eso está Mover libre.
  const cm = costoMoverDe(t);
  if(cm && costo > cm.disponibles){
    toast(`No te alcanzan los No2: mover ${p.pasos} casillero${p.pasos === 1 ? '' : 's'} cuesta ${fmt(costo)} y tenés ${fmt(Math.max(0, cm.disponibles))}. Para moverte igual, usá Mover libre (🦶).`);
    cancelarRuta();
    return;
  }
  const origen = p.celdas[0], seq0 = nieblaSeq, pend0 = new Set(nieblaPendientes), rotAntes = num(t.rotacion || 0);
  try{
    const esCreep = t.tipo === 'creep';
    const quedan = esCreep ? await gastarNitrosCreep(t.fichaId, costo) : await gastarNitros(t.fichaId, costo);
    rutaPendiente = null;
    const fin = p.celdas[p.celdas.length - 1];
    await moverToken(p.id, fin.col, fin.fila, p.celdas);
    if(trampaPendiente && trampaPendiente.tokenId === p.id) trampaResolver();
    if(percepcionSigiloPendiente && percepcionSigiloPendiente.tokenId === p.id) percepcionSigiloResolver();   // P145 (js/16)
    if(oportunidadPendiente && oportunidadPendiente.tokenId === p.id) oportunidadResolver();   // ataque de oportunidad (js/17)
    oportunidadPublicarAvisos(t, p.oportunidad);
    if(origen && (origen.col !== fin.col || origen.fila !== fin.fila)) deshacerRegistrar({tipo: 'mover', id: p.id, fichaId: t.fichaId, esCreep, costo, col: origen.col, fila: origen.fila, rotacion: rotAntes, seq0, pend0});
    toast(esCreep
      ? `${nombreDe(t)}: −${fmt(costo)} No2 · le quedan ${fmt(quedan)}${quedan < 0 ? ' ⚠ se pasó de sus No2' : ''}`
      : `−${fmt(costo)} No2 · te quedan ${fmt(quedan)}${quedan < 0 ? ' ⚠ te pasaste de tus No2' : ''}`);
  }catch(err){
    console.error('No se pudo mover gastando Nitros:', err);
    toast(err.code === 'permission-denied' ? 'No podés gastar los Nitros de esa ficha' : 'No se pudo mover — mirá la consola');
    cancelarRuta();
  }
}
$('#ruta-no').onclick = cancelarRuta;
// Con un movimiento marcado, un clic en cualquier otro lado lo confirma.
document.addEventListener('pointerdown', e => {
  if(!rutaPendiente || e.target.closest('#ruta-confirmar')) return;
  confirmarRuta();
}, true);

