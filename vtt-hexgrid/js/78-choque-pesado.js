/* ---------- ⚔🛡 La tanda del Choque pesado (2026-10-27, dueño; docs/diseno-roles-creep.md, «Tanda Choque pesado 10 · 10 · 10») ----------
   Lo que estas habilidades de creep hacen en el mapa (lo demás —la Ejecución, los estados, el cobro— va por el camino de siempre):
   · 🛡 Interponerse (Flash, botón ✨): cuando atacan a un aliado a 2 casillas o menos y el aliado todavía no eligió cómo defenderse, salta a su lado (gratis,
     sin oportunidad), el golpe va contra él (el duelo cambia de defensor) y queda Interpuesto (+2 a la Defensa contra ese golpe).
   · ⚔ Dos al hilo (`ataque.sigue`): si el golpe pega, ataca enseguida a otro rival pegado, pagando lo de un primer ataque (el segundo no sigue; 2026-10-30, antes pedía dejarlo en 0).
   · ⚖ Arrastrar (`ataque.arrastra`): antes del golpe, Destreza contra la Evasión para engancharlo; si lo engancha, lo trae hasta quedar pegado (no camina:
     sin No2 ni oportunidad; las trampas y zonas del camino sí lo tocan) y sigue el golpe; si no, no hay golpe (P224, 2026-10-29).
   · ⚖ Carga que derriba (`ataque.derriba` = las casillas que corrió, desde 3; la carrera la hace js/55): si pega, Fuerza + X contra la Res.CC; si gana, Sentado.
   Lo llama el mapa del GM (maneja a los creeps): `disparoResuelto` (js/14) y el botón ✨ de los Flash de creep (js/71). */

// ===== 🛡 Interponerse =====
let interponerDuelos = new Map(), interponerEscucha = null;
function interponerEscuchar(){
  if(interponerEscucha || !soyGM || !fbDb || !fbUsuario || typeof fbRutaCampana !== 'function') return;
  interponerEscucha = fbDb.collection(fbRutaCampana('duelos')).where('estado', '==', 'esperando').onSnapshot(q => {
    interponerDuelos = new Map(q.docs.map(x => [x.id, x.data()]));
  }, err => { console.error('Interponerse: no se pudieron escuchar los duelos', err); interponerEscucha = null; });
}
setInterval(() => { try{ interponerEscuchar(); }catch(e){} }, 3000);
const INTERPONER_DIST = 2;
// A quién puede cubrir: los aliados (creeps) que atacan ahora en un duelo abierto, a 2 casillas o menos, antes de que elijan cómo defenderse.
// → [{id (el token del aliado), t, mismo: false, dueloId}]
function interponerObjetivos(c){
  interponerEscuchar();
  const alc = Math.max(1, Math.round(num(c.h.interponerse && c.h.interponerse.distancia)) || INTERPONER_DIST), out = [];
  for(const [id, d] of interponerDuelos){
    if(!d || d.estado !== 'esperando' || d.fase !== 'contacto' || d.defensa || d.hab || !d.ataque || d.grupo) continue;
    const def = d.defensor;
    if(!def || def.tipo !== 'creep' || def.tokenId === c.id || (d.atacante && d.atacante.tokenId === c.id)) continue;
    if(d.atacante && d.atacante.tipo === 'creep') continue;   // (un creep contra otro: no lo cubre)
    const t = tokens.get(def.tokenId);
    if(!t || distanciaHex(c.t, t) > alc) continue;
    out.push({id: def.tokenId, t, mismo: false, dueloId: id});
  }
  return out;
}
async function interponerseUsar(c, objetivoId){
  const o = interponerObjetivos(c).find(x => x.id === objetivoId);
  const nom = nombreDe(c.t);
  if(!o){ toast(`${c.h.nombre}: ya no se puede (el duelo avanzó o el aliado ya no está cerca)`); return; }
  const d = interponerDuelos.get(o.dueloId), aliado = nombreDe(o.t), quien = (d && d.atacante && d.atacante.nombre) || 'el rival';
  // La casilla: pegada al aliado, libre, la más cerca de él (si ya está pegado, se queda donde está).
  let dest = distanciaHex(c.t, o.t) <= 1 ? {col: c.t.col, fila: c.t.fila} : null;
  if(!dest){
    const ocupada = x => elementoSolidoEn(x.col, x.fila) || [...tokens.entries()].some(([id, y]) => id !== c.id && y.col === x.col && y.fila === x.fila && !y.bajoTierra);
    dest = vecinosDeCasilla(o.t).filter(v => !ocupada(v)).sort((a, b) => distanciaHex(c.t, a) - distanciaHex(c.t, b))[0] || null;
  }
  if(!dest){ AvisoCombate.mostrar({icono: '🛡', titulo: c.h.nombre, texto: `No hay una casilla libre al lado de ${aliado}: ${nom} no puede interponerse.`}); return; }
  const k = flashCreepCosto(c);
  const ok = await AvisoCombate.preguntar(`${nom} salta al lado de ${aliado} y se come el golpe de ${quien}, con +2 a la Defensa contra ese golpe. Cuesta ${k.txt}${k.ajenoTxt}.`,
    {icono: '🛡', titulo: `${nom}: ${c.h.nombre}`, si: 'Interponerse', no: 'Cancelar'});
  if(!ok) return;
  const sp = CreepCalculo.modoSP(c.sc), mult = k.ajeno ? 2 : 1;
  try{
    await modificarCreep(String(c.t.fichaId), sc => {
      const h = (sc.habilidades || []).find(x => x.id === c.h.id);
      if(h){ if(sp) sc.sp = Math.max(0, CreepCalculo.spActual(sc) - CreepCalculo.costoSpHab(sc, h) * mult); else h.cdActual = k.ajeno ? Combatiente.cdFlash(num(h.cd), false) : num(h.cd); }   // (con turnos de espera, en turno ajeno: un 50 % más, 2026-11-03)
      EstadosAplicar.aplicarACreep(sc, {nombre: 'Interpuesto'});
      return {};
    });
    if(dest.col !== c.t.col || dest.fila !== c.t.fila)
      await coleccionTokens().doc(c.id).update({col: dest.col, fila: dest.fila, rotacion: rotacionDePaso(hexCentro(dest.col, dest.fila), hexCentro(o.t.col, o.t.fila)), ruta: firebase.firestore.FieldValue.delete()});
    // El duelo sigue igual, pero ahora defiende él (las opciones de defensa se vuelven a calcular).
    await fbDb.collection(fbRutaCampana('duelos')).doc(o.dueloId).update({defensor: {ref: String(c.t.fichaId), tipo: 'creep', nombre: String(nom).slice(0, 40), uid: String(c.t.duenoUid || ''), tokenId: c.id,
      interpuesto: {aliado: String(aliado).slice(0, 40), aliadoTokenId: o.id}}});   // 🛡 adentro de `defensor` (las reglas de Firestore no aceptan campos nuevos en el duelo): el cuadro lo muestra («Ahora le pega a…») y anima el cambio (comun/duelo.js)
    if(typeof Duelo !== 'undefined' && Duelo.olvidarOpciones) Duelo.olvidarOpciones(o.dueloId);
  }catch(err){ console.error('Interponerse:', err); toast(`${c.h.nombre}: no se pudo (${err.message || err}) — hacelo a mano`); return; }
  const txt = `${nom} salta al lado de ${aliado} y se mete en el golpe: ahora ${quien} le pega a ${nom}, que tiene +2 a la Defensa contra ese golpe (${k.txt}).`;
  mesaLinea(`🛡 ${txt}`, 'recordatorio');
  momentoAbrir({tipo: 'interponerse', icono: '🛡', titulo: `${nom} se interpone`, resultado: txt, estado: 'listo', datos: {aviso: true, boton: 'Entendido'}});
}

// ===== Lo que pasa al resolverse el ataque (disparoResuelto, js/14) =====
function choquePesadoResuelto(d){
  if(!soyGM || !d || !d.ataque || d.hab || !d.atacante || d.atacante.tipo !== 'creep') return;
  const pego = d.resultado === 'pego' || d.resultado === 'mitad';
  if(!pego) return;
  if(num(d.ataque.derriba) > 0) cargaDerribaResuelto(d).catch(err => console.error('Carga que derriba:', err));
  if(d.ataque.sien) golpeSienResuelto(d).catch(err => console.error('Golpe en la sien:', err));
  if(d.ataque.sigue) golpeQueSigueResuelto(d).catch(err => console.error('Dos al hilo:', err));
}
const choquePesadoHechos = new Set();
// Lo que pregunta algo espera a que el cuadro del duelo se cierre o se minimice (hasta 2 minutos), para no salirle encima.
async function esperarDueloCerrado(maxMs){
  const t0 = Date.now();
  while(Date.now() - t0 < (maxMs || 120000)){
    const f = document.getElementById('duelo-fondo');
    if(!f || f.classList.contains('min') || !f.childElementCount || getComputedStyle(f).display === 'none') return;
    await new Promise(r => setTimeout(r, 400));
  }
}
function choquePesadoUnaVez(d, que){ const k = `${d.id}:${que}`; if(choquePesadoHechos.has(k)) return false; choquePesadoHechos.add(k); return true; }

// ⚔ Dos al hilo (dueño, 2026-10-27, «vamos así»; cambiado el 2026-10-30: «me hace ruido que tenga que matar para funcionar… si pega, pasa al
// siguiente. Es un golpe doble. Pero tiene que haber al menos dos adyacentes al atacante»): si pegó, otro rival pegado; el segundo no sigue. Los dos
// rivales pegados se avisan al usarla (acEjecutarHab, js/12). El segundo golpe NO cobra No2 ni cuenta como otro ataque del turno (dueño, 2026-11-10:
// «pagás SP (o el cooldown), pero te cuesta los nitros de un solo ataque… como el barrido»).
// Los rivales pegados al creep (a la vista, en juego), menos `fuera`. → la lista, o null si el creep no tiene token.
function golpeQueSigueRivales(sc, fuera){
  const e = [...tokens.entries()].find(([, x]) => x.tipo === 'creep' && x.fichaId === sc.id);
  if(!e) return null;
  const ta = e[1], yo = {ref: sc.id, tipo: 'creep', nombre: sc.nombre};
  return [...tokens.entries()].map(([id, x]) => ({...x, id})).filter(x => x.id !== fuera && distanciaHex(x, ta) === 1 && !x.oculto && !x.bajoTierra
    && !etereoDe(x) && dueloEsRival(yo, x) && !(typeof iniciativaFueraDeJuego === 'function' && iniciativaFueraDeJuego(x.id)));
}
function golpeQueSigueRivalesPegados(sc){ const l = golpeQueSigueRivales(sc, null); return l ? l.length : null; }
// ⚔ Dos al hilo, el segundo (dueño, 2026-11-10: «al terminar se minimiza y te tiene que dar a elegir el segundo objetivo, que tiene que ser el
// siguiente dentro del círculo en una dirección o en la otra, como si estuviera girando el ataque. No puede ser cualquiera adyacente si hay alguno
// interpuesto»; «no es necesario que los dos enemigos estén adyacentes entre sí… es como un swing, pero en vez de dar toda la vuelta, pega uno,
// avanza hasta el siguiente, pega dos»): las 6 casillas pegadas al atacante, en el sentido de las agujas del reloj (el ángulo de barridoAngulo,
// js/108), y desde la del primer golpeado, hacia cada lado, lo primero que aparece (Combatiente.dosAlHiloSiguientes): rival = candidato; cualquier
// otro token (un aliado, alguien neutral), un Sólido / colisión (elementoSolidoEn) o una pared (paredCorta, js/34: entre el atacante y la casilla, o
// entre dos casillas seguidas del giro) tapan ese lado. No cuentan (casilla vacía): los ocultos, bajo tierra, etéreos y caídos. → [{id, sentido}].
function dosAlHiloCandidatos(sc, ta, primeroId){
  const p = tokens.get(primeroId);
  if(!p || typeof vecinosDeCelda !== 'function') return null;
  const yo = {ref: sc.id, tipo: 'creep', nombre: sc.nombre};
  const anillo = vecinosDeCelda(ta).map(c => ({...c, ang: barridoAngulo(ta, c)})).sort((x, y) => x.ang - y.ang);
  const i = anillo.findIndex(c => c.col === p.col && c.fila === p.fila);
  if(i < 0) return null;   // (el primero ya no está pegado: se elige a mano)
  const cuenta = x => !x.oculto && !x.bajoTierra && !etereoDe(x) && !(typeof iniciativaFueraDeJuego === 'function' && iniciativaFueraDeJuego(x.id));
  const pared = (a, b) => typeof paredCorta === 'function' && paredCorta(a, b);
  const ocup = anillo.map((c, k) => {
    if(k === i) return {id: primeroId, rival: false};
    const x = [...tokens.entries()].map(([id, t]) => ({...t, id})).find(t => t.id !== ta.id && t.col === c.col && t.fila === c.fila && cuenta(t));
    if(x) return pared(ta, c) ? {obstaculo: true} : {id: x.id, rival: dueloEsRival(yo, x)};
    if((typeof elementoSolidoEn === 'function' && elementoSolidoEn(c.col, c.fila)) || pared(ta, c)) return {obstaculo: true};
    return null;
  });
  const cortes = anillo.map((c, k) => pared(c, anillo[(k + 1) % anillo.length]));
  return Combatiente.dosAlHiloSiguientes(ocup, i, cortes);
}
// Elegir el segundo en el mapa: brillan los candidatos; clic en uno. En el cartel: «No, se queda» y «✋ Elegir a mano» (cualquier rival pegado, fuera
// de la regla). → el id elegido, o null.
function dosAlHiloElegirEnMapa(nom, caido, cands, todos){
  return new Promise(resolve => {
    let listo = false;
    const fin = v => { if(listo) return; listo = true; objetivosResaltados = null; pedirDibujo(); resolve(v); };
    const aMano = async () => {
      if(typeof elegirDestinoTerminar === 'function') elegirDestinoTerminar();
      objetivosResaltados = null; pedirDibujo();
      if(!todos.length){ toast('Dos al hilo: no hay ningún rival pegado'); fin(null); return; }
      const v = await Confirmar.elegir(`⚠ Fuera de la regla: el segundo golpe va al siguiente rival del círculo, sin saltear a nadie. A mano, ${nom} puede seguir contra cualquier rival pegado (lo decide la mesa).`,
        {titulo: 'Dos al hilo · a mano', icono: '✋', no: 'No, se queda', opciones: todos.map(x => ({valor: x.id, texto: nombreDe(x), detalle: x.tipo === 'pj' ? 'personaje' : ''}))});
      fin(v || null);
    };
    const pedir = () => {
      objetivosResaltados = new Set(cands.map(c => c.id)); pedirDibujo();
      const quienes = cands.map(c => `${esc(nombreDe(tokens.get(c.id)))}${c.sentido === 'horario' ? ' ↻' : c.sentido === 'antihorario' ? ' ↺' : ''}`).join(' · ');
      elegirDestino(h => {
        const c = cands.find(x => { const t = tokens.get(x.id); return t && t.col === h.col && t.fila === h.fila; });
        if(!c){ toast('Dos al hilo: elegí a uno de los que brillan (el siguiente del círculo, para un lado o el otro)'); pedir(); return; }
        fin(c.id);
      }, `<b>⚔ Dos al hilo: ${esc(nom)} le pegó a ${esc(caido)} — ¿contra quién sigue?</b> <span>brilla el siguiente rival del círculo hacia cada lado (${quienes}) · no puede saltear a nadie · sin No2 de más</span><button type="button" class="btn" data-dah-no>No, se queda</button><button type="button" class="btn" data-dah-mano title="Cualquier rival pegado, fuera de la regla">✋ Elegir a mano</button>`,
      true, () => fin(null));
      const av = $('#colocando-aviso');
      const bNo = av && av.querySelector('[data-dah-no]'), bMano = av && av.querySelector('[data-dah-mano]');
      if(bNo) bNo.onclick = e => { e.stopPropagation(); if(typeof elegirDestinoTerminar === 'function') elegirDestinoTerminar(); fin(null); };
      if(bMano) bMano.onclick = e => { e.stopPropagation(); aMano(); };
    };
    pedir();
  });
}
async function golpeQueSigueResuelto(d){
  if(!choquePesadoUnaVez(d, 'sigue')) return;
  const ta0 = tokens.get(d.atacante.tokenId), sc = ta0 ? creepPrivadoDe(ta0.fichaId) : null;
  if(!ta0 || !sc || num(sc.hp) <= 0) return;
  const ta = {...ta0, id: d.atacante.tokenId};
  const todos = golpeQueSigueRivales(sc, d.defensor.tokenId) || [];
  const nom = nombreDe(ta), caido = d.defensor.nombre;
  const cands = dosAlHiloCandidatos(sc, ta, d.defensor.tokenId);
  if(!todos.length && !(cands && cands.length)){ mesaLinea(`⚔ ${nom} le pegó a ${caido}, pero no tiene otro rival pegado para seguir (Dos al hilo)`, 'recordatorio'); return; }
  // Que se alcance a leer el resultado; después el cuadro se repliega a su token (como entre los golpes del Barrido) y se elige en el mapa.
  await new Promise(r => setTimeout(r, typeof BARRIDO_PAUSA_MS === 'number' ? BARRIDO_PAUSA_MS : 1400));
  try{ if(typeof Duelo !== 'undefined' && Duelo.apartar && !Duelo.apartar(d.id) && Duelo.abiertoId && Duelo.abiertoId() === d.id) Duelo.minimizar(); }catch(e){}
  let elegido = null;
  if(cands && cands.length) elegido = await dosAlHiloElegirEnMapa(nom, caido, cands, todos);
  else{
    // Nadie en el círculo que valga (los dos lados tapados, o el primero ya no está pegado): solo a mano.
    const tapado = cands ? 'los dos lados del círculo están tapados' : `${caido} ya no está pegado`;
    elegido = await Confirmar.elegir(`${nom} le pegó a ${caido}, pero ${tapado}: no hay un siguiente rival para el segundo golpe. ⚠ A mano (fuera de la regla), la mesa puede elegir a cualquier rival pegado.`,
      {titulo: 'Dos al hilo', icono: '⚔', no: 'No, se queda', opciones: todos.map(x => ({valor: x.id, texto: `✋ ${nombreDe(x)}`, detalle: x.tipo === 'pj' ? 'personaje' : ''}))});
  }
  if(!elegido){ mesaLinea(`⚔ ${nom} le pegó a ${caido} y no siguió (Dos al hilo)`, 'recordatorio'); return; }
  const c = (cands || []).find(x => x.id === elegido);
  const giro = !c ? ' — elegido a mano' : c.sentido === 'horario' ? ' — girando ↻' : c.sentido === 'antihorario' ? ' — girando ↺' : '';
  const h = (sc.habilidades || []).find(x => x && x.duelo && x.duelo.sigue);
  mesaLinea(`⚔ ${nom} le pegó a ${caido} y sigue contra ${nombreDe(tokens.get(elegido))}${giro} (Dos al hilo: sin No2 de más)`, 'recordatorio');
  // El segundo golpe: con su arma, sin los arreglos de la habilidad y sin volver a seguir.
  const atq = h ? CreepAcciones.ataqueDeHab(sc, {...h, nombre: `${h.nombre} (el segundo)`, duelo: {...h.duelo, arma: {}, sigue: false}}) : Combatiente.ataqueConSuArma(sc, 'normal', CreepCalculo.alcance(sc));
  if(atq && atq.sigue) delete atq.sigue;
  // 🌀 Como un golpe del Barrido (dueño, 2026-11-10: «que siga la misma lógica que el barrido: late un token, se despliega el menú, se resuelve, se
  // repliega; late el siguiente token, se despliega, se resuelve, se repliega»): el duelo del segundo se arma directo sobre el elegido, sin abrir las
  // Acciones del creep (barridoUnGolpe, js/108); el cuadro late en su token y se despliega desde ahí (comun/duelo.js animarEntrada). El primero
  // ya se replegó a su token antes de elegir (Duelo.apartar, arriba).
  const r = await barridoUnGolpe({yo: {ref: sc.id, tipo: 'creep', nombre: sc.nombre}}, atq, elegido);
  if(r === 'cancelado') mesaLinea(`✖ Se canceló el segundo golpe de Dos al hilo`, 'recordatorio');
  // El último, como el del Barrido: queda a la vista con su resultado y se repliega a su token al cerrarlo («Terminar duelo»).
}

// 🪝 El gancho va como un proyectil (dueño, 2026-10-30: «tiene que haber un camino libre. Si hay cualquier obstáculo entre medio, no se puede tirar
// la habilidad, y si el obstáculo roza, ahí lo decide la mesa. Es como un proyectil»): la línea de tiro de js/32. Tapada: no se tira (se elige otro,
// sin gastar nada; la salida a mano, «Ignorar obstáculo»); roza: lo decide la mesa. Lo llama dueloElegirObjetivoMapa (js/13) antes del enganche.
// → true: sigue; false: elegir otro.
async function arrastrarLinea(mio, t, ataque){
  if(distanciaHex(mio, t) <= 1 || typeof lineaDeTiro !== 'function') return true;
  const lt = lineaDeTiro(mio, t, new Set([mio.id, t.id]));
  if(lt.estado === 'libre') return true;
  const hab = ataque.habNombre || 'Arrastrar', nom = nombreDe(mio), obj = nombreDe(t), tapa = tiroTapanTxt(lt.tapan), roza = lt.estado === 'roza';
  const r = await tiroPreguntar({icono: '🪝', titulo: roza ? `${hab}: la línea roza` : `${hab}: no hay línea libre`,
    texto: roza
      ? `La línea de ${nom} hacia ${obj} pasa justo por el borde de ${tapa}. ¿Pasa el gancho? Lo decide la mesa.`
      : `Entre ${nom} y ${obj} está ${tapa}: el gancho va como un proyectil y necesita la línea libre. Elegí otro objetivo.`,
    opciones: roza
      ? [{valor: 'igual', texto: 'Pasa', detalle: 'lo decidió la mesa'}, {valor: 'otro', texto: 'No pasa: elegir otro', sec: true}]
      : [{valor: 'otro', texto: 'Elegir otro'}, {valor: 'igual', texto: 'Ignorar obstáculo', detalle: 'lo decide la mesa', sec: true}]});
  if(r !== 'igual') return false;
  mesaLinea(`🪝 ${nom} tiró ${hab} a ${obj} con la línea ${roza ? 'rozando' : 'tapada por'} ${tapa} (lo decidió la mesa)`, 'alerta-roja');
  return true;
}
/* 🪝 Arrastrar, el flujo del dueño (2026-11-04; reemplaza al de dos tiempos con Con + Fuerza, P224): «el arrastre es una acción en sí misma».
   1. Ejecutar → elige el objetivo (a 3 casillas o menos, con la línea libre: arrastrarLinea).
   2. Sale el gancho hacia el rival (la animación, todas las pantallas).
   3. Un duelo común, a la vista (comun/duelo.js): quien la usa tira su PdG con su botón y el rival su Evasión (un creep: el GM desde su pantalla;
      un personaje: su jugador). Empate: no engancha.
   4. Si engancha: el efecto «🪝 Gancho» (`trae`) lo aplica la pantalla del GM (dueloGanchoTraer: la animación del gancho arrastrándolo hasta
      dejarlo pegado). Si no: el gancho vuelve. Fin de la acción: no hay golpe; después hace lo que quiera.
   5. Tras un arrastre exitoso, el arrastrado queda Desequilibrado (−2 a la Evasión) hasta el final del turno de quien lo arrastró (dueño, 2026-11-05;
      antes daba +2 PdG al siguiente ataque de quien arrastraba). Lo pone y lo saca la pantalla del GM (desequilibradoPoner / desequilibradosFinTurno).
   Antes (hasta hoy) el enganche lo tiraba una sola pantalla sin mostrar nada (dueño: «no me ofreció tirar la PdG, ni vi la tirada de Evasión del
   rival»). → siempre false (no sigue ningún golpe). */
async function arrastrarDueloGancho(yo, mio, t, ataque){
  const hab = ataque.habNombre || 'Arrastrar', nom = nombreDe(mio), obj = nombreDe(t);
  const fx = (res, sinLanza, dueloId) => typeof ganchoFxPublicar === 'function' ? ganchoFxPublicar(mio.id, t.id, res, null, sinLanza, dueloId).catch(err => console.error('Arrastrar: la animación', err)) : Promise.resolve();
  await fx('sale');
  const gancho = {
    nombre: `${hab}: el gancho`.slice(0, 60), objetivo: 'enemigo',
    detalle: `${nom} le tira el gancho a ${obj}: su Probabilidad de Golpe contra la Evasión de ${obj} (empate: no lo engancha). Si lo engancha, lo arrastra hasta dejarlo pegado (no camina: sin No2 ni ataques de oportunidad; las trampas y zonas del camino sí lo tocan) y ${obj} queda Desequilibrado: −2 a la Evasión hasta el final del turno de ${nom}.`,
    tira: {stat: 'pdg', etq: 'PdG'}, contra: [{modo: 'eva', stat: 'eva', etq: 'Evasión'}], dano: null, empatePierde: true,
    efectos: [{nombre: 'Gancho', trae: Math.max(1, Math.round(num(ataque.arrastra)) || 3), detalle: 'Lo arrastra hasta dejarlo pegado (lo mueve la pantalla del GM)'}],
  };
  let id = null;
  try{
    id = await Duelo.crear({yo, ataque: {hab: gancho, habNombre: hab}}, {id: t.id, nombre: nombreDe(t), tipo: t.tipo, fichaId: t.fichaId, duenoUid: t.duenoUid}, mio.id);
  }catch(err){
    console.error('Arrastrar: no se pudo abrir el duelo del gancho', err);
    toast(`No se pudo abrir el duelo del gancho: tirá a mano la PdG de ${nom} contra la Evasión de ${obj}`);
    return false;
  }
  if(!id) return false;
  const fin = await new Promise(resolve => {
    let listo = false, quitar = null;
    const terminar = v => { if(listo) return; listo = true; try{ quitar && quitar(); }catch(e){} clearTimeout(reloj); resolve(v); };
    const reloj = setTimeout(() => terminar({tiempo: true}), 15 * 60000);
    quitar = fbDb.collection(fbRutaCampana('duelos')).doc(id).onSnapshot(doc => {
      const d = doc.exists ? doc.data() : null;
      if(!d || d.estado === 'cancelado'){ terminar({cancelado: true}); return; }
      const ef = (d.efectos || [])[0];
      if(ef && (ef.aplicado || ef.omitido)){ terminar({engancha: true, trae: !!ef.aplicado && !ef.omitido && !ef.sinEfecto}); return; }
      if(d.estado === 'resuelto' && d.resultado !== 'pego' && d.resultado !== 'mitad'){ terminar({engancha: false}); return; }
      if(d.estado === 'resuelto' && !ef) terminar({engancha: d.resultado === 'pego', trae: false});
    }, () => terminar({tiempo: true}));
  });
  if(fin.tiempo){ toast(`El duelo del gancho de ${hab} no terminó: resolvelo a mano con la mesa`); return false; }
  if(fin.cancelado) return false;
  if(!fin.engancha){
    await fx('falla', true, id);
    mesaLinea(`🪝 ${nom} le tira el gancho a ${obj}: no lo engancha.`, 'recordatorio');
    return false;
  }
  // ✔ Engancha: el Desequilibrado (−2 Evasión) lo pone la pantalla del GM al terminar el arrastre (dueloGanchoTraer).
  return false;
}
// El efecto «🪝 Gancho» (`ef.trae`), en la pantalla del GM (aplicaSolo, js/14): el arrastre con su animación. → {nota} | {nota, sinEfecto}.
async function dueloGanchoTraer(d){
  const ta = d.atacante && tokens.get(d.atacante.tokenId), td = tokens.get(d.defensor.tokenId);
  if(!ta || !td) return {manual: true, nota: 'uno de los dos ya no está en el mapa: traelo a mano'};
  const hab = String((d.hab && d.hab.nombre) || 'Arrastrar').replace(/: el gancho$/, '');
  const out = {};
  const fin = await arrastrarTraer(d.defensor.tokenId, d.atacante.tokenId, hab, nombreDe(ta), d.id, out);
  // 🫨 Al llegar (o si ya estaba pegado o no había por dónde): Desequilibrado. Un Inamovible no se tambalea.
  if(!out.inamovible) await desequilibradoPoner(d.atacante.tokenId, d.defensor.tokenId, hab).catch(err => console.error('Arrastrar: el Desequilibrado', err));
  return {nota: fin ? 'lo arrastra hasta dejarlo pegado: queda Desequilibrado (−2 Evasión)' : out.inamovible ? 'lo engancha, pero es Inamovible: no se mueve' : 'lo engancha, pero no se mueve (ya estaba pegado o no hay por dónde): queda Desequilibrado (−2 Evasión)'};
}
/* 🫨 Desequilibrado (dueño, 2026-11-05: «le da −2 a la Evasión a la persona arrastrada, pero que sea un efecto que dure solamente hasta el final del
   turno de la persona que ejecutó arrastrar; y que cuando se aplique… aparezca una animación sobre el token, un −2 EVA»). Reemplaza al +2 PdG de antes.
   Lo pone la pantalla del GM (la que resuelve el gancho): a un creep directo, a un personaje o una invocación por su ficha (encolarPj). Queda anotado
   quién arrastró a quién (en memoria y en localStorage, por partida) y, al terminar el turno de quien arrastró (iniciativaSiguiente, js/04), se le saca
   a todos los que arrastró. Sin orden de turnos, o si esa anotación se perdió, vence solo como un estado de 1 turno. */
const DESEQ_CLAVE = () => `desequilibrados:${typeof FB_CAMPANA !== 'undefined' ? FB_CAMPANA : ''}`;
function desequilibradosLeer(){ try{ return JSON.parse(localStorage.getItem(DESEQ_CLAVE()) || '{}') || {}; }catch(e){ return {}; } }
function desequilibradosGuardar(m){ try{ localStorage.setItem(DESEQ_CLAVE(), JSON.stringify(m)); }catch(e){} }
async function desequilibradoPoner(atkId, defId, hab){
  const t = tokens.get(defId);
  if(!t || !t.fichaId) return;
  // Con quien arrastró en el orden de turnos, no vence solo: lo saca el fin de SU turno (antes, con «1 turno», se iba en el Mantenimiento del arrastrado
  // —p. ej. al empezar la ronda— antes de que terminara el turno de quien arrastró; visto en Claude · pruebas, 2026-11-05). Sin orden: 1 turno.
  const enOrden = typeof iniciativa !== 'undefined' && iniciativa && Array.isArray(iniciativa.orden) && iniciativa.orden.some(o => o.id === atkId);
  const spec = {nombre: 'Desequilibrado', ...(enOrden ? {permanente: true} : {turnos: 1}), polaridad: 'debuff', mods: [{stat: 'eva', val: -2}],
    detalle: `Lo arrastró ${nombreDe(tokens.get(atkId)) || 'alguien'} con ${hab || 'Arrastrar'}: −2 a la Evasión hasta el final de su turno.`};
  if(t.tipo === 'creep') await modificarCreep(t.fichaId, sc => EstadosAplicar.aplicarACreep(sc, spec));
  else await EstadosAplicar.encolarPj({fichaId: t.fichaId, duenoUid: t.duenoUid, spec, origen: hab || 'Arrastrar'});
  const m = desequilibradosLeer();
  m[atkId] = [...new Set([...(m[atkId] || []), defId])];
  desequilibradosGuardar(m);
  if(typeof ganchoEvaPublicar === 'function') ganchoEvaPublicar(defId, '−2 EVA');   // el «−2 EVA» flotando sobre el token, en todas las pantallas (js/96)
  mesaLinea(`🫨 ${nombreDe(t)} queda Desequilibrado: −2 a la Evasión hasta el final del turno de ${nombreDe(tokens.get(atkId))}.`, 'recordatorio');
}
// Al terminar el turno de `atkId` (js/04, iniciativaSiguiente, la pantalla del GM): se le saca el Desequilibrado a los que arrastró. → líneas para la Crónica.
async function desequilibradosFinTurno(atkId){
  const m = desequilibradosLeer(), ids = m[atkId];
  if(!ids || !ids.length) return [];
  delete m[atkId]; desequilibradosGuardar(m);
  const lineas = [];
  const sacar = lista => { const i = (lista || []).findIndex(e => e && /^Desequilibrado/i.test(String(e.nombre || ''))); if(i < 0) return false; lista.splice(i, 1); return true; };
  for(const id of ids){
    const t = tokens.get(id);
    if(!t || !t.fichaId) continue;
    try{
      let saco = false;
      if(t.tipo === 'creep') await modificarCreep(t.fichaId, sc => { saco = sacar(sc.estados); return saco; });
      else {
        const [fichaId, invId] = String(t.fichaId).split(SEP_INVOCACION);
        await editarPersonajeMapa(fichaId, S => { saco = sacar(invId ? ((S.invocaciones || []).find(x => x && x.id === invId) || {}).estados : S.efectos); return saco; });
      }
      if(saco && !t.oculto && !enSigilo(t)) lineas.push(`${nombreDe(t)} recupera el equilibrio (se va el −2 a la Evasión).`);
    }catch(err){ console.error('No se pudo sacar el Desequilibrado:', err); }
  }
  return lineas;
}
// Lo trae hasta quedar pegado a quien lo arrastra; las trampas del camino lo tocan (la primera que pisa lo frena ahí) y las zonas, también.
// → la casilla donde quedó, o null si no se movió.
async function arrastrarTraer(defId, atkId, hab, quien, dueloId, out){
  const t = tokens.get(defId), ta = tokens.get(atkId);
  if(!t || !ta) return null;
  const nom = nombreDe(t), titulo = `${hab}: ${quien} arrastra a ${nom}`;
  const im = chanceDe(t, 'inamovible');
  const fx = (res, celdas) => typeof ganchoFxPublicar === 'function' ? ganchoFxPublicar(atkId, defId, res, celdas, true, dueloId).catch(err => console.error('Arrastrar: la animación', err)) : Promise.resolve();
  if(im && await inamovibleSale(t, im, titulo)){ if(out) out.inamovible = true; await fx('suelta'); return null; }   // el cartel con el d6 (js/21)
  const ocupada = x => elementoSolidoEn(x.col, x.fila) || [...tokens.values()].some(y => y !== t && y.col === x.col && y.fila === x.fila && !y.bajoTierra);
  const pared = (a, b) => typeof paredCorta === 'function' && paredCorta(a, b);
  const ruta = [{col: t.col, fila: t.fila}];
  let c = ruta[0];
  for(let i = 0; i < 6 && distanciaHex(c, ta) > 1; i++){
    const sig = vecinosDeCasilla(c).filter(v => !ocupada(v) && !pared(c, v) && distanciaHex(v, ta) < distanciaHex(c, ta)).sort((p, q) => distanciaHex(p, ta) - distanciaHex(q, ta))[0];
    if(!sig) break;
    c = sig; ruta.push(c);
  }
  if(ruta.length < 2){ await fx('suelta'); momentoAbrir({tipo: 'gancho', icono: '🪝', titulo, resultado: distanciaHex(t, ta) <= 1 ? `Ya estaba pegado a ${quien}.` : 'No hay por dónde traerlo: queda donde está.', estado: 'listo'}); return null; }
  // La primera trampa del camino lo frena ahí y se dispara (como si la pisara).
  const tr = typeof trampasEvaluarRuta === 'function' ? trampasEvaluarRuta(defId, t, ruta, 0) : null;
  const corte = tr && tr.tipo === 'pisa' ? tr.indice : -1;
  const final = corte > 0 ? ruta.slice(0, corte + 1) : ruta, fin = final[final.length - 1], pasos = final.length - 1;
  // 🪝 La cadena primero: vuela, engancha y se tensa; recién ahí se mueve el token (cada pantalla lo dibuja siguiendo la cadena, js/96).
  const anim = fx('trae', final.map(x => ({col: x.col, fila: x.fila})));
  if(typeof ganchoFxAntesDeArrastrar === 'function') await new Promise(r => setTimeout(r, ganchoFxAntesDeArrastrar(final, true)));
  try{ await coleccionTokens().doc(defId).update({col: fin.col, fila: fin.fila, ruta: firebase.firestore.FieldValue.delete()}); }
  catch(err){ console.error('Arrastrar: no se pudo mover', err); await anim; momentoAbrir({tipo: 'gancho', icono: '🪝', titulo, resultado: `Traelo ${pasos} casillas a mano (no se pudo mover solo).`, estado: 'listo'}); return null; }
  await anim;   // el aviso, la trampa y el golpe, cuando la cadena ya lo soltó
  const trampaTxt = corte > 0 ? ' En el camino pisa algo: se frena ahí.' : '';
  momentoAbrir({tipo: 'gancho', icono: '🪝', titulo, resultado: `Lo trae ${pasos} casillero${pasos === 1 ? '' : 's'} hacia ${quien} (no camina: sin No2 ni ataques de oportunidad).${trampaTxt}`, estado: 'listo',
    datos: {arrastre: {tokenId: defId, celdas: final.map(x => ({col: x.col, fila: x.fila}))}}});   // las zonas del camino: las revisa la pantalla de su dueño (arrastreZonasMomento)
  mesaLinea(`🪝 ${quien} arrastra a ${nom} ${pasos} casillero${pasos === 1 ? '' : 's'}${trampaTxt ? ' — pisó una trampa en el camino' : ''}`, 'recordatorio');
  if(corte > 0 && typeof trampaResolver === 'function'){
    trampaPendiente = {tokenId: defId, tipo: 'pisa', id: tr.id, el: tr.el, celda: fin, desde: final[final.length - 2]};
    setTimeout(() => { trampaResolver().catch(err => console.error('Arrastrar: la trampa', err)); }, 600);
  }
  return fin;
}
// Las zonas del camino de alguien arrastrado (2026-10-27): cada pantalla revisa lo suyo (zonaEsMia: el dueño a su personaje, el GM a sus creeps), así
// que la que lo arrastró avisa con el momento y la del dueño las revisa. Solo un momento de recién (al entrar al mapa no se repiten los viejos).
const arrastresVistos = new Set();
function arrastreZonasMomento(id, d){
  const a = d && d.datos && d.datos.arrastre;
  if(!a || !Array.isArray(a.celdas) || a.celdas.length < 2 || arrastresVistos.has(id)) return;
  arrastresVistos.add(id);
  const cuando = d.creado && d.creado.toMillis ? d.creado.toMillis() : Date.now();
  if(Date.now() - cuando > 20000 || typeof zonaRevisarEntrada !== 'function') return;
  setTimeout(() => { try{ zonaRevisarEntrada(a.tokenId, a.celdas, 0); }catch(err){ console.error('Arrastrar: las zonas del camino', err); } }, 800);   // (que llegue antes la casilla nueva)
}

// 🔨 Golpe en la sien (dueño, 2026-11-10; el Martillero nv4): si pegó, su Fuerza contra la Res.CC del golpeado; si no le llega, Stun 1 turno (empate: no).
// Las inmunidades (Inmunidad a CC, Invulnerable, Protección de jefe) las aplica la regla común (EstadosAplicar / la ficha del dueño). Mismo camino que la
// Carga que derriba: las dos tiradas a la vista en la Mesa (con los dados) y el aviso en la Crónica; si no se puede tirar, ✋ a mano.
async function golpeSienResuelto(d){
  if(!choquePesadoUnaVez(d, 'sien')) return;
  const t = tokens.get(d.defensor.tokenId), ta = tokens.get(d.atacante.tokenId);
  const sc = ta ? creepPrivadoDe(ta.fichaId) : null;
  if(!t || !sc) return;
  const nom = nombreDe(ta), obj = nombreDe(t);
  const rf = Combatiente.tirarStat(CreepCalculo.statValor(sc, 'fue'), sc.estados, 'fue');
  const rr = Combatiente.tirarStat(trampaValorStat(t, 'rescc'), confusionEstadosDe(t), 'rescc');
  if(!rf || !rr){ mesaLinea(`🔨 ${nom} le dio en la sien a ${obj}: ✋ tirá a mano su Fuerza contra la Res.CC de ${obj} (si no le llega, Stun 1 turno)`, 'alerta-roja'); return; }
  mesaPublicar(`🔨 ${nom} · Golpe en la sien · Fuerza`, {...rf, quien: nom, desde: 'gm'});
  mesaPublicar(`${obj} · Res.CC (para no quedar aturdido)`, {...rr, quien: obj, ...(t.tipo === 'creep' ? {desde: 'gm'} : {ficha: String(t.fichaId).split(SEP_INVOCACION)[0]})});
  const pierde = rr.total < rf.total;
  let frena = '';
  if(pierde){
    try{
      if(t.tipo === 'creep'){
        let r = null;
        await modificarCreep(String(t.fichaId), c => { r = EstadosAplicar.aplicarACreep(c, {nombre: 'Stun', turnos: 1}); return {}; });
        if(r && !r.ok) frena = r.motivo || 'no le hace nada';
      }else{
        try{ frena = Combatiente.inmunidad(structuredClone(((vinculo(t) || {}).resumen || {}).estados || []), EstadosAplicar.componer({nombre: 'Stun', turnos: 1}), null) || ''; }catch(e){ frena = ''; }
        if(!frena){ const f = fichasPub.get(String(t.fichaId).split(SEP_INVOCACION)[0]); await EstadosAplicar.encolarPj({fichaId: t.fichaId, duenoUid: (f && f.duenoUid) || t.duenoUid, spec: {nombre: 'Stun', turnos: 1}, origen: `${nom} · Golpe en la sien`}); }
      }
    }catch(err){ console.error('Golpe en la sien: no se pudo aturdir', err); mesaLinea(`🔨 ${obj} queda con Stun 1 turno (✋ ponéselo a mano: no se pudo solo)`, 'alerta-roja'); }
  }
  if(typeof esperarDadosMapa === 'function') await esperarDadosMapa();
  const fin = !pierde ? `${obj} aguanta el golpe y sigue entero` : frena ? `${obj} no llegó, pero no le hace nada (${frena})` : `${obj} queda con Stun 1 turno (sin No2 ese turno)`;
  const txt = `${nom} le da en la sien a ${obj}: Fuerza ${rf.total} contra su Res.CC ${rr.total} → ${fin}.`;
  mesaLinea(`🔨 ${txt}`, 'recordatorio');
  momentoAbrir({tipo: 'sien', icono: '🔨', titulo: `${nom}: Golpe en la sien`, resultado: txt, estado: 'listo', datos: {aviso: true, boton: 'Entendido', ...(t.tipo === 'pj' && t.duenoUid ? {paraUid: t.duenoUid} : {})}});
}

// ⚖ Carga que derriba (dueño, 2026-10-27): si corrió 3 o más y pegó, Fuerza + X contra la Res.CC; si gana, Sentado (empate: no cae).
async function cargaDerribaResuelto(d){
  if(!choquePesadoUnaVez(d, 'derriba')) return;
  const t = tokens.get(d.defensor.tokenId), ta = tokens.get(d.atacante.tokenId);
  const sc = ta ? creepPrivadoDe(ta.fichaId) : null;
  if(!t || !sc) return;
  const x = Math.round(num(d.ataque.derriba)), nom = nombreDe(ta), obj = nombreDe(t);
  const rf = Combatiente.tirarStat(CreepCalculo.statValor(sc, 'fue') + x, sc.estados, 'fue');
  const rr = Combatiente.tirarStat(trampaValorStat(t, 'rescc'), confusionEstadosDe(t), 'rescc');
  if(!rf || !rr){ mesaLinea(`🏃 ${nom} carga contra ${obj}: ✋ tirá a mano Fuerza + ${x} contra su Res.CC (si gana, Sentado)`, 'alerta-roja'); return; }
  mesaPublicar(`🏃 ${nom} · Carga que derriba · Fuerza + ${x}`, {...rf, quien: nom, desde: 'gm'});
  mesaPublicar(`${obj} · Res.CC (para no caer)`, {...rr, quien: obj, ...(t.tipo === 'creep' ? {desde: 'gm'} : {ficha: String(t.fichaId).split(SEP_INVOCACION)[0]})});
  const cae = rr.total < rf.total;
  if(cae){
    try{
      if(t.tipo === 'creep') await modificarCreep(String(t.fichaId), c => { EstadosAplicar.aplicarACreep(c, {nombre: 'Sentado'}); return {}; });
      else{ const f = fichasPub.get(String(t.fichaId).split(SEP_INVOCACION)[0]); await EstadosAplicar.encolarPj({fichaId: t.fichaId, duenoUid: (f && f.duenoUid) || t.duenoUid, spec: {nombre: 'Sentado'}, origen: `${nom} · Carga que derriba`}); }
    }catch(err){ console.error('Carga que derriba: no se pudo sentar', err); mesaLinea(`🏃 ${obj} cae Sentado (✋ ponéselo a mano: no se pudo solo)`, 'alerta-roja'); }
  }
  if(typeof esperarDadosMapa === 'function') await esperarDadosMapa();
  const txt = `${nom} llega a toda carrera (Fuerza + ${x}: ${rf.total}) contra la Res.CC de ${obj} (${rr.total}): ${cae ? `${obj} cae Sentado` : `${obj} se mantiene en pie`}.`;
  mesaLinea(`🏃 ${txt}`, 'recordatorio');
  momentoAbrir({tipo: 'carga', icono: '🏃', titulo: `${nom}: Carga que derriba`, resultado: txt, estado: 'listo', datos: {aviso: true, boton: 'Entendido', ...(t.tipo === 'pj' && t.duenoUid ? {paraUid: t.duenoUid} : {})}});
}
