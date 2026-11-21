/* ---------- 🌀 Barrido, Coletazo y Remolino: un ataque por cada rival al lado, uno por uno (dueño, 2026-11-08) ----------
   «El barrido debe aplicar los efectos del arma a cada personaje que golpee. A fines prácticos es como si fueran múltiples ataques continuados
   uno de otro y van a aplicar las mismas reglas de un ataque. Si esquiva, esquiva, si pega, pega… solo que el contexto del ataque, el inicio,
   es el barrido.» «Cuando uno aprieta barrido, lo primero que debe elegir es el primer objetivo del barrido. Y a partir de ahí, se sigue … en
   el mismo sentido de la animación» (el giro dibuja la hoja en el sentido de las agujas del reloj: js/94, ondaFxDibujarGiro). «El objetivo
   brilla con un pulso, desde el token se despliega el menú del duelo… cuando se termina ese duelo, el menú se repliega … y pasa al siguiente.»
   El Remolino del Warrior (dueño, el mismo día: «que sea prácticamente lo mismo visualmente que el barrido») hace lo mismo, con su paso de más:
   antes de pegar elige si se mueve 1 casilla (ondaConGiro, js/43) y alcanza a los que estaban al lado de las dos posiciones.

   Cómo va: el ataque es uno con el arma (`habilidad-arma`, comun/combatiente.js ataqueConArreglos, con `barrido`; `barridoPaso` el del Remolino),
   así que cada golpe es un duelo común: su tirada de PdG, Evasión / Parry / Bloqueo, crítico, los efectos del arma, las Espinas (es un golpe
   cuerpo a cuerpo directo), el Aguante del que lo recibe y los bonos del arma con la que se pega. Lo cobrado por la habilidad va con el primero.
   La pantalla de quien lo hace arma la cascada: elige el primero, se ve el giro (arranca en ese rival), y por cada rival crea su duelo con
   dueloElegirObjetivoMapa (js/13, `barridoObjetivo`: con todos los bonos de un ataque común) y espera a que se resuelva antes del siguiente.
   El cuadro del duelo ya hace lo visual: el pulso en el token y el despliegue al abrirse, y el repliegue hacia su token cuando se abre el
   siguiente (comun/duelo.js animarEntrada / animarSalida). Los dados del Aguante van solo al primer rival (`aguanteDados`, js/56). */
const BARRIDO_PAUSA_MS = 1400;   // entre un duelo resuelto y el siguiente: que se alcance a leer el resultado antes de que se repliegue
const BARRIDO_TOPE_MS = 20 * 60 * 1000;   // si un duelo nunca termina (se cerró la pestaña…), la cascada no queda esperando para siempre

function barridoNombre(ataque){ return String((ataque && ataque.habNombre) || 'Barrido'); }
// Los rivales que puede alcanzar: pegados a `centros` (la casilla donde está y, en el Remolino que se movió, también la de salida).
function barridoRivales(yo, centros){
  const propio = t => t.fichaId === yo.ref && t.tipo === yo.tipo;
  return [...tokens.entries()].map(([id, t]) => ({...t, id}))
    .filter(t => !propio(t) && (!t.oculto || soyGM) && !t.bajoTierra && !etereoDe(t) && !(typeof tapadoPorNiebla === 'function' && tapadoPorNiebla(t)))
    .filter(t => !(typeof iniciativaFueraDeJuego === 'function' && iniciativaFueraDeJuego(t.id)))   // 💀 un caído no recibe el giro
    .filter(t => dueloEsRival(yo, t))
    .filter(t => centros.some(c => distanciaHex(c, t) === 1));
}
// El ángulo en pantalla (y hacia abajo): crece en el sentido de las agujas del reloj, como la hoja del giro.
function barridoAngulo(centro, t){
  const a = hexCentro(centro.col, centro.fila), b = hexCentro(t.col, t.fila);
  return Math.atan2(b.y - a.y, b.x - a.x);
}
// El orden: desde el primero, en el sentido de las agujas del reloj alrededor de donde gira.
function barridoOrden(centro, primero, rivales){
  const dos = 2 * Math.PI, a0 = barridoAngulo(centro, primero);
  return rivales.map(t => ({t, d: t.id === primero.id ? -1 : (((barridoAngulo(centro, t) - a0) % dos) + dos) % dos}))
    .sort((x, y) => x.d - y.d).map(x => x.t);
}
function barridoCancelado(msg){
  dueloAvisoObjetivoOcultar();
  if(msg.alCancelar){ msg.alCancelar(); return; }
  try{ MensajesMapa.alMarco($('#botonera-marco'), 'duelo-cancelado'); }catch(e){}
}
function barridoIniciar(msg){
  const yo = msg.yo, ataque = msg.ataque, nombre = barridoNombre(ataque);
  cerrarBotonera();
  seleccion = null; hudCerrar(); pedirDibujo();
  const mio = [...tokens.entries()].map(([id, t]) => ({...t, id})).find(t => t.fichaId === yo.ref && t.tipo === yo.tipo);
  if(!mio){ toast(`${nombre}: no encontré tu token en este mapa`); barridoCancelado(msg); return; }
  // 🌀 El Remolino: primero el paso (o girar sin moverse); después, igual que el Barrido.
  if(ataque.barridoPaso && typeof ondaConGiro === 'function'){
    const salida = {col: mio.col, fila: mio.fila};
    ondaConGiro(tokens.get(mio.id) || mio, {nombre}, h => barridoElegirPrimero(msg, {...mio, col: h.col, fila: h.fila}, h.otro ? [h, h.otro] : [h], salida));
    return;
  }
  barridoElegirPrimero(msg, mio, [{col: mio.col, fila: mio.fila}]);
}
function barridoElegirPrimero(msg, mio, centros){
  const yo = msg.yo, nombre = barridoNombre(msg.ataque);
  const rivales = barridoRivales(yo, centros);
  if(!rivales.length){ toast(`🌀 ${nombre}: no hay ningún rival al lado`); barridoCancelado(msg); return; }
  const ids = new Set(rivales.map(t => t.id));
  const pedir = () => {
    objetivosResaltados = new Set(ids); pedirDibujo();
    elegirDestino(h => {
      const t = rivales.find(x => x.col === h.col && x.fila === h.fila);
      if(!t){ toast(`🌀 ${nombre}: elegí a uno de los rivales que tenés al lado (brillan)`); pedir(); return; }
      objetivosResaltados = null; pedirDibujo();
      const centro = {col: mio.col, fila: mio.fila};
      barridoCorrer(msg, mio, barridoOrden(centro, t, rivales)).catch(err => console.error(`${nombre}: la cascada`, err));
    }, `<b>🌀 ${esc(nombre)}: elegí el primer rival</b> <span>brillan los que tenés al lado (${rivales.length}) · el giro sigue en el sentido de las agujas del reloj · Esc o clic derecho cancelan</span>`,
    true, () => { objetivosResaltados = null; pedirDibujo(); barridoCancelado(msg); });
  };
  pedir();
}
// Los rivales que siguen al primero: sin los dados del Aguante (van solo al primero, dueño, 2026-11-08) ni lo cobrado por la habilidad.
function barridoSinAguante(ataque){
  const n = Math.round(num(ataque.aguanteDados));
  if(!(n > 0)) return ataque;
  const mods = {...(ataque.mods || {}), dados: Math.max(0, num(ataque.mods && ataque.mods.dados) - n)};
  return {...ataque, mods, aguanteDados: 0, ...(ataque.habDetalle ? {habDetalle: String(ataque.habDetalle).replace(/ 🛡 Modo aguante: [^.]*\./, '')} : {})};
}
async function barridoCorrer(msg, mio, orden){
  const yo = msg.yo, ataque = msg.ataque, nombre = barridoNombre(ataque), quien = yo.nombre || nombreDe(mio);
  mesaLinea(`🌀 ${quien}: ${nombre} — ${orden.map(t => nombreDe(t)).join(' → ')}`, 'recordatorio');
  // El giro, para todas las pantallas, arrancando en el primer rival (js/94); los duelos, cuando se terminó de ver.
  try{
    if(typeof ondaFxPublicar === 'function' && typeof ondaFxVariante === 'function' && ondaFxVariante({nombre})){
      await ondaFxPublicar(mio.id, 1, `${quien}: ${nombre}`, {variante: ondaFxVariante({nombre}), ang: barridoAngulo(mio, orden[0])});
      await new Promise(r => setTimeout(r, ((window.FxOnda && FxOnda.DURACION) || 1700) + 300));
    }
  }catch(err){ console.error('No se pudo mostrar el giro:', err); }
  for(let i = 0; i < orden.length; i++){
    const id = orden[i].id;
    if(!tokens.get(id) || (typeof iniciativaFueraDeJuego === 'function' && iniciativaFueraDeJuego(id))){
      mesaLinea(`🌀 ${nombre}: ${nombreDe(orden[i])} ya no está para recibir el golpe — sigue con el próximo`, 'recordatorio');
      continue;
    }
    const r = await barridoUnGolpe(msg, i === 0 ? ataque : barridoSinAguante(ataque), id);
    if(r === 'cancelado'){
      const quedan = orden.length - i - 1;
      mesaLinea(`✖ Se canceló ${nombre}${quedan ? ` (no alcanza a ${quedan === 1 ? 'el rival que faltaba' : `los ${quedan} rivales que faltaban`})` : ''}`, 'recordatorio');
      return;
    }
    if(i < orden.length - 1) await new Promise(res => setTimeout(res, BARRIDO_PAUSA_MS));
  }
}
// Un golpe del giro: el duelo de un ataque común contra ese rival; termina cuando el duelo se resuelve o se cancela ('resuelto' / 'cancelado' /
// 'salteado': no se llegó a abrir).
function barridoUnGolpe(msg, ataque, tokenId){
  return new Promise(resolve => {
    let listo = false, baja = null;
    const fin = r => { if(listo) return; listo = true; try{ if(baja) baja(); }catch(e){} resolve(r); };
    const alDuelo = id => {
      if(!id){ fin('salteado'); return; }
      baja = fbDb.collection(fbRutaCampana('duelos')).doc(id).onSnapshot(doc => {
        if(!doc.exists){ fin('cancelado'); return; }
        const x = doc.data(), e = x.estado;
        if(e === 'resuelto') fin('resuelto');
        else if(e === 'cancelado') fin(x.resultado === 'a-mano' ? 'resuelto' : 'cancelado');   // ✋ «Terminar a mano»: ese golpe lo resuelve la mesa y el giro sigue
      }, err => { console.error('Barrido: no se pudo seguir el duelo', err); fin('salteado'); });
    };
    dueloElegirObjetivoMapa({...msg, ataque, barridoObjetivo: tokenId, aguanteHecho: true, alDuelo, alSaltear: () => fin('salteado'), alCancelar: () => fin('salteado')});
    setTimeout(() => fin('salteado'), BARRIDO_TOPE_MS);
  });
}
