// js/16-momentos.js — los momentos (2026-10-02, P146) y «algo está fuera de lugar» (Percepción aumentada, P145). Va después del arranque:
// solo define funciones y escuchas (la escucha de los momentos arranca sola cuando hay sesión).
/* ---------- Momentos (P146, pedido del dueño: "que tengan su momento", no que pasen silbando bajito por la Mesa) ----------
   Lo que pasa en el mapa —percepción, zonas, trampas que se disparan, sigilo roto— es un documento de `campanas/<id>/momentos`
   ({tipo, icono, titulo, resultado, estado, resuelve, datos}) que ven TODAS las pantallas:
   - quien tiene que resolverlo (tirar algo) lo ve en un cartel al CENTRO de su pantalla, con su botón (con la estética del duelo: `AvisoCombate.cartel`, comun/aviso-combate.js);
   - **el Aviso** (nombre dado por el dueño, 2026-10-02): a quien le pasó algo (`datos.paraUid`; ej. pisó una trampa) se le cuenta en el
     mismo cartelito del centro, con «Entendido» (`momentoAvisoCentro`, `#momento-aviso-centro`). `datos.aviso: true` = le llega aunque lo
     haya publicado su propia pantalla;
   - **la Crónica** (nombre dado por el dueño, 2026-10-02): los demás lo ven en la ESQUINA de arriba a la derecha del mapa
     (`#momentos-feed`), siempre igual —mismo lugar, misma tarjeta: ícono, título y resultado—, sin interrumpir su juego: el título apenas
     empieza y el resultado cuando se resuelve; cada tarjeta se va sola a los ~14 s de su último cambio.
   Todo lo que el resto de la mesa tenga que enterarse en el mapa va por acá (momentoAbrir), no por un cartel propio.
   Se cuenta lo que ya es público (el daño que recibe un creep, no la vida que le queda; el nombre de una trampa descubierta; un oculto sin
   descubrir no se nombra). `datos.centro`: quien lo creó lo sigue en un cartelito del centro (no se le repite en la esquina). */
const MOMENTO_DURA_MS = 14000;
const momentosDesde = Date.now() - 5000;   // los que ya estaban al entrar no se muestran
let momentosEscucha = null;
const momentosFeed = new Map();   // id → {d, hasta, orden}
// ✕ Cerrar una tarjeta de la Crónica (2026-11-09, dueño: «deben tener un botón X para cerrarlos»): solo en esta pantalla. El momento sigue
// en Firebase y lo que esperaba (una tirada, «Aplicar por él») sigue su curso: la tarjeta solo se esconde.
const momentosCerrados = new Set();
let momentosOrden = 0;
const coleccionMomentos = () => fbDb.collection(fbRutaCampana('momentos'));

async function momentoAbrir(m){   // → id del momento (o null si no se pudo: sin reglas publicadas, sin sesión)
  if(!fbDb || !fbUsuario || !fbMiembro) return null;
  try{
    const ref = await coleccionMomentos().add({
      tipo: String(m.tipo || ''), icono: String(m.icono || ''), titulo: String(m.titulo || '').slice(0, 200),
      ...(m.resultado ? {resultado: String(m.resultado).slice(0, 400)} : {}),
      estado: String(m.estado || ''), resuelve: String(m.resuelve || ''), datos: (typeof momentoMarcaOculta === 'function' ? momentoMarcaOculta(m.datos) : m.datos) || {},   // 🙈 (js/130, P320)
      creadoPor: fbUsuario.uid, creado: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return ref.id;
  }catch(err){ console.error('No se pudo publicar el momento (¿faltan publicar las reglas?):', err); return null; }
}
async function momentoActualizar(id, cambios){
  if(!id) return;
  const c = {...cambios};
  if(c.resultado !== undefined) c.resultado = String(c.resultado).slice(0, 400);
  try{ await coleccionMomentos().doc(id).update(c); }catch(err){ console.error('No se pudo actualizar el momento:', err); }
}
function momentosEscuchar(){
  if(momentosEscucha || !fbDb || !fbUsuario || !fbMiembro) return;
  momentosEscucha = coleccionMomentos().orderBy('creado', 'desc').limit(20).onSnapshot(snap => {
    snap.docChanges().forEach(ch => {
      if(ch.type === 'removed') return;
      const d = ch.doc.data();
      const ms = d.creado && d.creado.toMillis ? d.creado.toMillis() : Date.now();
      // 🕶 Un pedido de sigilo sin terminar (js/116) vuelve aunque sea de antes de entrar (2026-11-11, prueba en el mapa: al recargar la
      // pantalla del GM quedaba colgado): si sigue esperando una tirada y es de la última media hora, se muestra de nuevo.
      const sigiloPendiente = d.tipo === 'sigilo-pedido' && ['percepcionGM', 'percepcionJug', 'sigiloJugador', 'sigiloTirando', 'esperandoGM'].includes(d.estado) && Date.now() - ms < 30 * 60 * 1000;
      // (…y su resultado, en la pantalla que todavía muestra el cartel: si no, quedaba «tirá tu Sigilo» después de recargar.)
      const sigiloConCartel = d.tipo === 'sigilo-pedido' && typeof sigiloJugCartel !== 'undefined' && sigiloJugCartel.has(ch.doc.id);
      // 🪤 Lo mismo con una trampa sin terminar (2026-11-12, el dueño: J1 pisó una trampa con la pantalla del GM cerrada y, al abrirla, el GM
      // no veía nada y quedaba trabada): si es de la última media hora y le falta un paso, se vuelve a mostrar a quien le toque.
      const trampaPend = d.tipo === 'trampa' && d.estado !== 'listo' && Date.now() - ms < 30 * 60 * 1000;
      // ▶ Y el «Empieza tu turno» sin aplicar de esta pantalla (2026-11-23, cola: al recargar se perdían la ventana y el renglón de la zona).
      if(ms < momentosDesde && d.tipo === 'inicio-turno' && inicioRecuperable(d, ms)){ inicioRecuperar(ch.doc.id, d); return; }
      if(ms < momentosDesde && d.tipo === 'inicio-turno' && inicioMostrados.has(ch.doc.id)){ momentoRecibido(ch.doc.id, d); return; }   // (el recuperado: cuando el GM lo aplica o pasa el turno)
      if(ms < momentosDesde && !sigiloPendiente && !sigiloConCartel && !trampaPend) return;
      momentoRecibido(ch.doc.id, d);
    });
  }, err => console.error('Error escuchando los momentos:', err));
  // 🪤 Las trampas sin terminar que quedaron fuera de los últimos 20 momentos (2026-11-12): una sola vez al entrar.
  coleccionMomentos().where('tipo', '==', 'trampa').limit(100).get().then(snap => snap.docs.forEach(doc => {
    const d = doc.data(), ms = d.creado && d.creado.toMillis ? d.creado.toMillis() : 0;
    if(d.estado !== 'listo' && ms && Date.now() - ms < 30 * 60 * 1000) momentoRecibido(doc.id, d);
  })).catch(err => console.error('No se pudieron leer las trampas pendientes:', err));
  if(soyGM) momentosBarrerViejos();
}
// El GM borra los de más de 2 horas al entrar (no hace falta guardarlos: la Mesa queda como registro).
async function momentosBarrerViejos(){
  try{
    const viejo = firebase.firestore.Timestamp.fromMillis(Date.now() - 2 * 3600 * 1000);
    const snap = await coleccionMomentos().where('creado', '<', viejo).limit(200).get();
    if(snap.empty) return;
    const lote = fbDb.batch();
    snap.docs.forEach(d => lote.delete(d.ref));
    await lote.commit();
  }catch(err){ console.error('No se pudieron barrer los momentos viejos:', err); }
}
const momentosArranque = setInterval(() => { if(typeof fbMiembro !== 'undefined' && fbMiembro && fbUsuario && fbDb){ clearInterval(momentosArranque); momentosEscuchar(); } }, 1000);

// El rayo que salta (2026-10-05, Varita de chispa eléctrica): cada pantalla lo ve una vez, salto por salto (solo si es de recién: al entrar
// al mapa no se repiten los viejos).
const rayosVistos = new Set();
const momentosChicosVistos = new Set();   // los avisos chicos ya mostrados (un momento puede llegar más de una vez)
function rayoMomento(id, d){
  if(rayosVistos.has(id)) return;
  rayosVistos.add(id);
  const t = d.creado && d.creado.toMillis ? d.creado.toMillis() : Date.now();
  if(Date.now() - t > 20000 || typeof rayoSaltoEfecto !== 'function') return;
  if(d.datos.apartar) try{ const ab = Duelo.abiertoId && Duelo.abiertoId(); if(ab) Duelo.apartar(ab); }catch(e){}   // ⚡ la cadena de a uno (js/13): el cuadro se aparta para ver los saltos
  if((d.datos.flotan || d.datos.reporte) && typeof rayoFxReproducir === 'function'){ rayoFxReproducir(d.datos); return; }   // 🔢 el «−X», los estados y el reporte (js/110)
  d.datos.saltos.forEach((s, i) => setTimeout(() => rayoSaltoEfecto(s.desde, s.hacia), i * 450));
}
/* 🎰 El rodillo que giró otra pantalla (2026-11-01, el Arma elemental al azar; Combatiente.elegirVarianteAzar): las demás lo ven girar una vez (solo si
   es de recién), con «✔ Visto». La pantalla que lo giró ya lo vio. */
const rodillosVistos = new Set();
function rodilloMomento(id, d){
  if(rodillosVistos.has(id) || !d.datos || !d.datos.rodillo || typeof Rodillo === 'undefined') return;
  rodillosVistos.add(id);
  if(fbUsuario && d.creadoPor === fbUsuario.uid) return;
  const t = d.creado && d.creado.toMillis ? d.creado.toMillis() : Date.now();
  if(Date.now() - t > 20000) return;
  if(document.getElementById('rodillo-fondo')) return;   // ya hay uno abierto: queda en la Crónica
  Rodillo.girar({...d.datos.rodillo, auto: true, aplicar: '✔ Visto'});
}
const caosHechos = new Set();
function momentoRecibido(id, d){
  // 🙈 Lo que hace alguien que esta pantalla no ve, no lo nombra (js/29, 2026-11-20): desde acá `d` va con «Alguien» en su lugar (para un
  // Aviso al centro o una trampa, que se muestran igual) y `nv.modo` dice si va a la esquina. Los efectos de más abajo usan `d.datos`, no el texto.
  const dCompleto = d;
  const nv = !soyGM && typeof inciertaMomento === 'function' ? inciertaMomento(id, d) : null;
  if(nv) d = nv.d;
  if(typeof revelarMomento === 'function') revelarMomento(d);   // ✋ el GM resolvió a mano que una trampa no fue detectada (js/122)
  if(d.tipo === 'meteoro-sombra'){ momentosFeed.delete(id); renderMomentosFeed(); if(typeof meteoroSombraMomento === 'function') meteoroSombraMomento(id, d); return; }   // ☄ el aviso de la sombra, sin tarjeta (js/74)
  if(d.tipo === 'robo-pedido'){ if(typeof roboMomento === 'function') roboMomento(id, d); return; }
  if(d.tipo === 'robo-huida'){ if(typeof roboHuidaMomento === 'function') roboHuidaMomento(id, d); return; }   // 🫳 la huida de un personaje que robó (js/47, 2026-11-03)
  if(d.tipo === 'estallido' && d.datos && d.datos.explota && typeof explosionEmpezar === 'function') explosionEmpezar(d.datos.explota);
  if(d.tipo === 'provocado-brillo' && typeof provocadoBrilloRecibido === 'function') provocadoBrilloRecibido(d);   // 😤 (js/77)   // 😤 la bronca que estalla (js/51)
  if(d.tipo === 'fin-combate' && typeof finCombateMomento === 'function') finCombateMomento(id);   // 🏁 lo de fin de combate de cada uno (js/25)
  if(d.tipo === 'inicio-turno' && inicioTurnoMomento(id, d)) return;
  // 🙈 Lo que le pasa a alguien escondido (su turno, «▶ Empieza tu turno», Provocado; js/04): solo a los que lo ven (su bando, el GM con 👁, quien lo
  // vea ahora); a sus rivales, nada (2026-11-23, dueño). A quien va dirigido le llega siempre.
  if(d.datos && (d.datos.escondido || d.datos.sinEscondido) && typeof momentoEscondidoVer === 'function' && !momentoEscondidoVer(d)
    && !(d.datos.paraUid && fbUsuario && d.datos.paraUid === fbUsuario.uid) && !(Array.isArray(d.datos.paraUids) && fbUsuario && d.datos.paraUids.includes(fbUsuario.uid))){ momentosFeed.delete(id); renderMomentosFeed(); return; }
  if(d.tipo === 'pergamino-grupal' && typeof pergaminoGrupalMomento === 'function') pergaminoGrupalMomento(id, d);   // 📜 Aplicar o a mano (js/25, 2026-11-03)
  if(d.tipo === 'malviaje' && typeof malviajeMomento === 'function' && malviajeMomento(id, d)) return;   // 🌺 la tirada del Malviaje, al afectado al centro (js/52, 2026-11-03)
  if(d.tipo === 'diablito' && typeof diablitoMomento === 'function' && diablitoMomento(id, d)) return;   // 😈 la Botella con un diablito (js/53)   // ▶ Empieza tu turno: al centro de su dueño (js/04)   // 🫳 el robo en sigilo (js/47): solo la víctima y el GM
  if(d.tipo === 'rayo' && d.datos && Array.isArray(d.datos.saltos)) rayoMomento(id, d);
  if(d.tipo === 'escudo-dado' && typeof escudoDadoMomento === 'function') escudoDadoMomento(id, d);   // 🎲 el dado del Escudo elemental: lo tira quien lo tiró (js/106, 2026-11-09)
  if(d.tipo === 'desarme' && d.datos && typeof desarmeRuleta === 'function') desarmeRuleta(id, d.datos);
  if(d.tipo === 'transfusion' && typeof transfusionFxRecibido === 'function') transfusionFxRecibido(id, d);   // 🩸 el chorro de sangre (js/92, 2026-11-03)
  if(d.tipo === 'onda' && typeof ondaFxRecibido === 'function') ondaFxRecibido(id, d);   // 💥 la onda del Shockwave (js/94, 2026-11-03)
  if(d.tipo === 'cambio-fx'){ if(typeof cambioFxRecibido === 'function') cambioFxRecibido(id, d); return; }   // 🔄 Cambiar de lugar (js/107): sin tarjeta
  if(d.tipo === 'resu-fx' || d.tipo === 'resu-pista'){ if(typeof resuFxRecibido === 'function') resuFxRecibido(id, d); return; }   // ✨ las animaciones de resurrección (js/125): sin tarjeta
  if(d.tipo === 'lanza-fx'){ if(typeof lanzaFxRecibido === 'function') lanzaFxRecibido(id, d); return; }   // ✨ la Lanza arcana (js/120): sin tarjeta
  if(d.tipo === 'lanza-golpe'){ if(typeof lanzaGolpeRecibido === 'function') lanzaGolpeRecibido(id, d); return; }   // ✨ el destello de Deslumbrado (js/120): sin tarjeta
  if(d.tipo === 'blink-tv'){ if(typeof blinkTvRecibido === 'function') blinkTvRecibido(id, d); return; }   // 📺 el Parpadeo (js/111): sin tarjeta
  if(d.tipo === 'gancho-fx'){ if(typeof ganchoFxRecibido === 'function') ganchoFxRecibido(id, d); return; }
  if(d.tipo === 'gancho-eva'){ if(typeof ganchoEvaRecibido === 'function') ganchoEvaRecibido(id, d); return; }   // 🫨 el «−2 EVA» del arrastrado (js/96): sin tarjeta   // 🪝 la cadena de Arrastrar (js/96): sin tarjeta
  if(d.tipo === 'escudo-golpe'){ if(typeof escudoHumanoGolpeRecibido === 'function') escudoHumanoGolpeRecibido(id, d); return; }   // 🛡 el golpe que se reparte (js/95): sin tarjeta
  if(d.tipo === 'onda-golpe'){ if(typeof ondaFxGolpeRecibido === 'function') ondaFxGolpeRecibido(id, d); return; }   // 💫 los pajaritos de quien no la resistió: sin tarjeta   // 🩸 el chorro de sangre (js/92, 2026-11-03)
  if(d.tipo === 'ritmo-elegir' && typeof ritmoElegirMomento === 'function') ritmoElegirMomento(id, d);   // 🥁 Marcar el ritmo con varios aliados pegados (js/102)
  if(d.tipo === 'demora' && d.datos && d.datos.demoraMovio && typeof demoraAnimar === 'function') demoraAnimar(d.datos.demoraToken, id);   // ⏬ la lista de turnos animada (js/100)
  if(d.tipo === 'demora' && d.datos && d.datos.adelantoMovio && typeof demoraSube === 'function') demoraSube(d.datos.demoraToken, id);   // ⏫ sube en el orden (Arrojo): la misma animación
  if(d.tipo === 'demora' && d.datos && d.datos.demoraChoca && typeof demoraChoque === 'function') demoraChoque(d.datos.demoraToken, id);   // ⏬ ya era el último: se choca con el borde
  if(d.tipo === 'rodillo') rodilloMomento(id, d);   // 🎰 el rodillo de otro (el Arma elemental al azar, 2026-11-01)
  if(d.tipo === 'mal-de-ojo' && typeof malDeOjoMomento === 'function') malDeOjoMomento(id, d);   // 🧿 volver a tirar y quedarse con la peor (js/60)
  if(d.tipo === 'zona-extra' && typeof zonaExtraMomento === 'function') zonaExtraMomento(id, d);   // 🎲 la tirada extra de una zona, para quien la creó (js/66)   // 🤺 la ruleta de casillas (js/62)
  if(d.tipo === 'gancho' && typeof arrastreZonasMomento === 'function') arrastreZonasMomento(id, d);
  if(d.tipo === 'gancho-pedido' && typeof ganchoPedidoMomento === 'function') ganchoPedidoMomento(id, d).catch(err => console.error('Arrastrar (pedido):', err));   // 🪝 el gancho de un personaje contra un creep: lo resuelve el GM (js/78, 2026-11-04)   // ⚖ Arrastrar: las zonas del camino, para el dueño (js/78)
  if(d.tipo === 'confusion') confusionMomento(d);   // la tirada de Confusión del turno (js/20)
  if(d.tipo === 'soltar-ayuda' && typeof soltarAyudaMomento === 'function') soltarAyudaMomento(id, d);
  if(d.tipo === 'anula-zona' && typeof anulaZonaMomento === 'function') anulaZonaMomento(id, d);   // 🚫 la Anulación contra la zona de un creep (js/13, 2026-11-02)
  if(d.tipo === 'sueno-despertar' && typeof suenoMomento === 'function') suenoMomento(id, d);   // 💤 lo sacudió un aliado (js/87, 2026-11-01)   // 🤝 «¿Lo ayudás a zafarse?» (js/54, 2026-10-23)
  oporMomento(id, d);   // el ataque de oportunidad: la pregunta a quien decide y la respuesta a quien se aleja (js/17)
  // Una trampa, paso a paso (js/19): la víctima la resuelve al centro; el resto, en la Crónica.
  if(d.tipo === 'trampa' && d.datos && d.datos.fase){ trampaMomento(id, d); return; }
  // 🕶 El sigilo de un personaje (2026-11-11, js/116): privado (el GM y quien maneja al escondido); la Percepción la tira el GM y el Sigilo, el jugador.
  if(d.tipo === 'sigilo-pedido' && typeof sigiloMomentoVisible === 'function' && !sigiloMomentoVisible(d)){ momentosFeed.delete(id); renderMomentosFeed(); return; }
  if(d.tipo === 'sigilo-pedido' && typeof sigiloJugadorMomento === 'function' && sigiloJugadorMomento(id, d) && !(percepcionBanner && percepcionBanner.momentoId === id)){ momentosFeed.delete(id); renderMomentosFeed(); return; }
  // El pedido de detección al GM (P145): la pantalla del GM tira la Destreza del oculto.
  if(d.tipo === 'sigilo-pedido' && d.estado === 'esperandoGM' && soyGM) deteccionGMAbrir(id, d);
  if(d.tipo === 'turno-fin' && d.estado === 'esperandoGM' && soyGM && typeof finTurnoDelJugador === 'function') finTurnoDelJugador(id, d);   // ✅ un jugador terminó su turno (js/04, 2026-10-22)
  if(d.tipo === 'orden-pedir' && d.estado === 'esperandoGM' && soyGM && typeof ordenPedidoDelGM === 'function') ordenPedidoDelGM(id, d);   // ('orden-pedir', 2026-11-05: el nombre nuevo, que las pestañas viejas del GM —sin el control de tokens— no toman)   // 🎺 el orden de turnos (js/102, 2026-11-05)
  // La Varita del caos que usó un jugador sobre un creep (o con un arma que vuela): la aplica la pantalla del GM (js/13 caosAplicar).
  if(d.tipo === 'caos' && d.estado === 'esperandoGM' && soyGM && d.datos && d.datos.caos && !caosHechos.has(id)){
    caosHechos.add(id);
    const c = d.datos.caos;
    // Salió 1: elige el GM (el bando contrario) cuál, y lo aplica.
    if(c.elegir){
      caosElegir(c.elegir, d.titulo || 'Varita del caos', `${c.nombre || 'El objetivo'} recibe ${c.elegir === 'buff' ? 'un buff' : 'un debuff'}: como bando contrario, elegí cuál.`).then(async spec => {
        if(spec.nombre === 'Provocado') spec.detalle = 'Provocado: contra quién lo elige el bando contrario (✋ a mano).';
        const nota = await caosAplicar(c.tokenId, spec, d.titulo || 'Varita del caos');
        momentoActualizar(id, {estado: 'listo', resultado: `1d20 → 1: ${c.nombre || 'el objetivo'} recibe ${spec.nombre} (lo eligió el GM).${nota}`});
      });
    }
    // Lo demás (un creep, o el arma que vuela): el anuncio al GM, con «Aplicar» (dueño, 2026-10-08).
    else{
      const aplicar = () => caosAplicar(c.tokenId, c.spec, d.titulo || 'Varita del caos').then(nota => momentoActualizar(id, {estado: 'listo', resultado: String(d.resultado || '').replace(' (lo aplica el GM)', '') + nota}));
      AvisoCombate.mostrar({icono: '🎲', titulo: d.titulo || 'Varita del caos', texto: String(d.resultado || '').replace(' (lo aplica el GM)', ''),
        botones: [{texto: '✔ Aplicar', alClic: () => { AvisoCombate.cerrar(); aplicar(); }},
          {texto: 'No aplicar', sec: true, alClic: () => { AvisoCombate.cerrar(); momentoActualizar(id, {estado: 'listo', resultado: String(d.resultado || '').replace(' (lo aplica el GM)', '') + ' (el GM no lo aplicó)'}); }}],
        alCerrar: () => { caosHechos.delete(id); }});   // cerrado sin decidir: vuelve a aparecer con el próximo aviso
    }
  }
  // Quien está esperando la respuesta en su cartelito.
  if(percepcionBanner && percepcionBanner.momentoId === id && d.estado === 'listo' && !percepcionBanner.resultado) percepcionRespuesta(d);
  // Si otra pantalla del GM ya lo resolvió, esta cierra su cartelito.
  if(deteccionBanner && deteccionBanner.id === id && d.estado === 'listo' && deteccionBanner.resultado === null){ deteccionBanner = null; renderDeteccionBanner(); }
  // Lo que me toca a mí (el jugador dueño, cuando el GM toma o devuelve el control de su personaje): al centro, no en la esquina.
  // (datos.aviso: el Aviso de lo que le pasó, ej. una trampa — le llega aunque lo haya publicado su propia pantalla.)
  // Un aviso chico (2026-10-06, la Coraza del guardián): a quien le toca, un toast — y la Crónica sigue, como para todos.
  // 🙈 Solo para el GM (2026-11-05: un token oculto que se mueve fuera de su turno): los jugadores no lo ven ni en la Crónica.
  if(d.datos && d.datos.soloGM && !soyGM){ momentosFeed.delete(id); renderMomentosFeed(); return; }
  // 🙈 Solo nombra a quien no se ve: no va a la esquina (un Aviso para esta pantalla sí sale, ya sin el nombre). Recién llegado, se vuelve a mirar una vez.
  const paraEsta = d.datos && ((d.datos.paraUid && d.datos.paraUid === fbUsuario.uid) || (Array.isArray(d.datos.paraUids) && d.datos.paraUids.includes(fbUsuario.uid)));
  if(nv && (nv.modo === 'nada' || nv.modo === 'incierta') && !paraEsta){
    momentosFeed.delete(id); renderMomentosFeed();
    if(!nv.firme) momentoNoVistoReintentar(id, dCompleto);
    return;
  }
  // ▶ «Empieza el turno de X» (2026-11-14, dueño): a quien maneja a X no le sale la tarjeta: ya tiene la ventana «Empieza tu turno».
  if(d.tipo === 'turno' && d.datos && d.datos.tokenId && inicioTurnoTarjetaSobra(d.datos.tokenId)){ momentosFeed.delete(id); renderMomentosFeed(); return; }
  const chicoParaMi = d.datos && d.datos.chico && d.datos.paraUid && d.datos.paraUid === fbUsuario.uid;
  if(chicoParaMi && !momentosChicosVistos.has(id)){ momentosChicosVistos.add(id); toast(`${d.icono || ''} ${d.titulo}: ${d.resultado || ''}`.trim()); }
  // `paraUids` (2026-10-08, el choque de un empujón): el mismo aviso al centro para varios (cada involucrado).
  const paraMi = d.datos && ((d.datos.paraUid && d.datos.paraUid === fbUsuario.uid) || (Array.isArray(d.datos.paraUids) && d.datos.paraUids.includes(fbUsuario.uid))
    || (d.datos.soloGM && d.datos.aviso && soyGM));   // 🙈 el aviso solo para el GM: al centro, en cada pantalla de GM (2026-11-05)
  // (La tirada extra de una zona tiene su propio cartel, con el botón para tirar — js/66: el aviso genérico lo tapaba. 2026-10-22)
  if(!chicoParaMi && paraMi && d.tipo !== 'zona-extra' && d.tipo !== 'escudo-dado' && d.tipo !== 'mal-de-ojo' && d.tipo !== 'malviaje' && d.tipo !== 'pergamino-grupal' && (d.creadoPor !== fbUsuario.uid || d.datos.aviso)){ momentoAvisoCentro(id, d); return; }
  // La esquina: todo, salvo lo que esta pantalla ya sigue al centro.
  const mio = d.creadoPor === fbUsuario.uid && d.datos && d.datos.centro
    && !(typeof revelarEsDeteccion === 'function' && revelarEsDeteccion(d));   // ✋ la detección de una trampa ya tirada le queda al GM en la Crónica aunque el pedido lo haya creado su pantalla (js/122)
  if(d.tipo === 'oportunidad' && oporSoyDecisor(d)){ momentosFeed.delete(id); renderMomentosFeed(); return; }   // lo decide esta pantalla, al centro
  if(d.tipo === 'oportunidad' && d.datos && d.datos.secreto && d.estado !== 'si'){ momentosFeed.delete(id); renderMomentosFeed(); return; }   // 🥷 hasta que ataque, nadie más lo ve (P235, js/17)
  const delGM = d.tipo === 'sigilo-pedido' && soyGM && (d.estado === 'esperandoGM' || (deteccionBanner && deteccionBanner.id === id));
  if(delGM) momentosFeed.delete(id);
  if(mio || delGM){ renderMomentosFeed(); return; }
  const ya = momentosFeed.get(id);
  // ▶ El inicio de turno sin aplicar queda (el GM tiene «Aplicar por él»); 🎲 la tirada extra de una zona, mientras espere algo (el GM tiene
  // «Tirar por él», «Que se aplique» y «Aplicar»: a los 14 s se borraba y el GM se quedaba sin el botón; 2026-10-22).
  const largo = (d.tipo === 'inicio-turno' && d.estado === 'esperando') || (d.tipo === 'malviaje' && d.estado !== 'listo') || (d.tipo === 'mal-de-ojo' && d.estado === 'esperando') || (d.tipo === 'escudo-dado' && d.estado === 'esperando') || (d.tipo === 'zona-extra' && ['esperando', 'tirado', 'aplicar'].includes(d.estado));
  momentosFeed.set(id, {d, hasta: Date.now() + (largo ? 30 * 60 * 1000 : typeof revelarEsDeteccion === 'function' && revelarEsDeteccion(d) && !(d.datos && d.datos.aMano) ? 3 * 60 * 1000 : MOMENTO_DURA_MS), orden: ya ? ya.orden : ++momentosOrden});   // el más nuevo, arriba (✋ una detección de trampa le queda 3 min al GM, para «Resolver a mano», js/122)
  renderMomentosFeed();
}
/* ▶ Empieza tu turno (js/04, 2026-10-17): a su dueño (o a quien tiene 🎮 su control), al centro, con lo que va a pasar y «✔ Aplicar»; al tocarlo,
   el mismo cartel dice «✔ Ya se aplicó» y se cierra con «Entendido». El resto lo ve en la Crónica (el GM, con «▶ Aplicar por él» mientras
   espera). → true si esta pantalla lo mostró al centro. */
const inicioMostrados = new Set(), inicioAplicadoAca = new Set(), inicioNoAplicadoVisto = new Set();
/* ▶🔥 Las zonas de «al empezar su turno», adentro de esta ventana (dueño, 2026-11-22, opción A: «un solo cartel con todo lo que pasa al empezar el
   turno»; js/08 zonaInicioOfrecer). Cada zona es un renglón más (debajo de los No2 y lo demás) con su botón, que se habilita después de «✔ Aplicar»
   (P274). Mientras se resuelve (el cuadro del duelo para tirar el daño), la ventana se esconde: no tapa el cuadro; vuelve con el resultado. Se cierra
   con «Entendido» cuando no falta nada (sin zonas, «✔ Aplicar» la cierra, como siempre). */
const inicioVentanas = new Map();   // id del momento → {d, tokenId, aplicado: '' | 'aca' | 'gm' | 'no', zonas: [renglón de js/08]}
const inicioCerrados = new Map();   // tokenId → el paso del orden de turnos en que se cerró su ventana (las zonas que lleguen después, en ese mismo turno, van con su cartel de siempre)
const inicioPasoDe = clave => { const c = String(clave || ''); return Number(c.slice(c.lastIndexOf(':') + 1)); };
function inicioYaCerrado(tokenId){ return inicioCerrados.has(tokenId) && inicioCerrados.get(tokenId) === Math.round(num(iniciativa.paso)); }
function inicioZonasDe(v, elIds){
  (elIds || []).forEach(elId => {
    if(v.zonas.some(z => z.elId === elId)) return;
    const r = typeof zonaInicioRenglon === 'function' ? zonaInicioRenglon(elId, v.tokenId) : null;
    if(r) v.zonas.push(r);
  });
}
// js/08: las zonas de ese token, si su ventana ya está a la vista en esta pantalla → true (si no, esperan a que llegue).
function inicioZonasSumar(tokenId, elIds){
  for(const [id, v] of inicioVentanas) if(v.tokenId === tokenId){ inicioZonasDe(v, elIds); inicioVentanaDibujar(id); return true; }
  return false;
}
const inicioFaltan = v => v.zonas.filter(z => z.estado !== 'listo');
/* 🐝 (P299, dueño, 2026-11-23: «sí») La ventana de una invocación dice de quién es el turno: «▶ Empieza el turno de Abeja de prueba», con un primer
   renglón que aclara que no es el turno del personaje. → null si es un personaje (sigue «Empieza tu turno»). */
function inicioDeInvocacion(tokenId){
  const t = tokens.get(tokenId);
  if(!t || !String(t.fichaId || '').includes(SEP_INVOCACION)) return null;
  const f = fichasPub.get(String(t.fichaId).split(SEP_INVOCACION)[0]);
  const nombre = nombreDe(t), pj = (f && (f.nombre || (f.resumen && f.resumen.nombre))) || '';
  return {nombre, titulo: `Empieza el turno de ${nombre}`,
    paso: {titulo: `🐝 Es el turno de ${nombre}`, texto: `Empieza el turno de tu invocación${pj ? `, no el de ${pj}` : ''}: lo de abajo le pasa a ${nombre}.`}};
}
const inicioTitulo = tokenId => { const iv = inicioDeInvocacion(tokenId); return iv ? iv.titulo : 'Empieza tu turno'; };
function inicioVentanaDibujar(id){
  const v = inicioVentanas.get(id);
  if(!v) return;
  const dt = v.d.datos || {}, clave = 'inicio-turno:' + id;
  const iv = inicioDeInvocacion(v.tokenId);
  const pasos = [...(iv ? [iv.paso] : []), ...(dt.pasos || [])];
  if(v.aplicado === 'aca' && v.zonas.length) pasos.push({titulo: '✔ Aplicado', texto: 'Los estados, la regeneración, la vida y los No2 quedaron como dice arriba.'});
  v.zonas.forEach((z, k) => {
    const listo = z.estado === 'listo', tirando = z.estado === 'tirando';
    pasos.push({titulo: `${z.icono} ${z.nombre}${listo ? '' : iv ? `: ${iv.nombre} está adentro al empezar su turno` : ': estás adentro al empezar tu turno'}`, texto: listo ? z.resultado : z.texto, espera: !listo,
      botones: listo ? [] : [{texto: tirando ? '⏳ Resolviendo…' : z.boton, deshabilitado: tirando || !v.aplicado,
        titulo: !v.aplicado ? 'Primero «✔ Aplicar» lo del turno; después, la zona' : '', alClic: () => inicioZonaIr(id, k)}]});
  });
  const faltan = inicioFaltan(v);
  const veredicto = v.aplicado === 'no' ? {tono: 'malo', grande: iv ? '⏱ YA NO ES SU TURNO' : '⏱ YA NO ES TU TURNO', chico: 'Cambió el orden de turnos: el inicio no se aplicó.'}
    : v.aplicado === 'gm' ? {tono: 'bueno', grande: '✔ YA SE APLICÓ', chico: (/solo al pasar el turno/.test(v.d.resultado || '') ? 'Se aplicó solo al pasar el turno.' : 'Lo aplicó el GM.')
        + (faltan.length ? ` Lo de la zona sigue pendiente: tiralo igual.` : '')}   // (con la zona ya tirada, sin «sigue pendiente»: cola 2026-11-23)
    : (!faltan.length && v.zonas.length === 1 && v.zonas[0].veredicto) ? v.zonas[0].veredicto : null;
  let botones = [], sinPie = false;
  if(!v.aplicado) botones = [{texto: '✔ Aplicar', id: 'inicio-turno-aplicar', alClic: () => inicioAplicarClic(id)}];
  else if(faltan.length) sinPie = true;   // (el botón de cada zona va en su renglón)
  else botones = [{texto: 'Entendido', alClic: () => AvisoCombate.cerrar()}];
  AvisoCombate.mostrar({clave, icono: '▶', titulo: iv ? iv.titulo : 'Empieza tu turno', pasos, texto: '', soloBoton: true, veredicto, botones, sinPie,
    alCerrar: () => { inicioMostrados.delete(id); inicioVentanas.delete(id); inicioCerrados.set(v.tokenId, inicioPasoDe(dt.clave)); }});   // cerrado sin aplicar: el GM lo puede aplicar por él, y al pasar el turno se aplica solo
}
function inicioAplicarClic(id){
  const v = inicioVentanas.get(id);
  if(!v) return;
  inicioAplicadoAca.add(id);
  // Sin zonas, se cierra al tocarlo (2026-11-14, dueño: una sola ventana, sin el segundo paso «Ya se aplicó»). Con zonas, queda para tirarlas.
  if(!v.zonas.length) AvisoCombate.cerrar();
  else{ v.aplicado = 'aca'; inicioVentanaDibujar(id); }
  inicioTurnoAplicar(id, v.d, false);   // (si falla, avisa con un toast)
}
// El botón de una zona: la ventana se esconde mientras se resuelve (el cuadro del duelo del daño no queda tapado) y vuelve con el resultado.
async function inicioZonaIr(id, k){
  const v = inicioVentanas.get(id), z = v && v.zonas[k];
  if(!z || z.estado !== 'pend' || !v.aplicado) return;
  z.estado = 'tirando';
  inicioVentanaDibujar(id);
  AvisoCombate.esconder('inicio-turno:' + id, true);
  let r = null;
  try{ r = await zonaInicioResolver(z); }catch(err){ console.error('La zona al empezar el turno:', err); }
  if(!inicioVentanas.has(id)) return;
  if(r){ z.estado = 'listo'; z.resultado = r.resultado || 'sin efecto'; z.veredicto = r.veredicto || null; }
  else z.estado = 'pend';
  inicioVentanaVolver(id);
}
// Vuelve a mostrar la ventana: si mientras tanto salió otro aviso al centro (la reemplazó), espera a que se cierre; y espera a que se cierre el cuadro
// del duelo (el resultado del daño se lee ahí; se cierra solo a los pocos segundos), para no taparlo.
const inicioDueloAbierto = () => typeof Duelo !== 'undefined' && Duelo.abiertoId && !!Duelo.abiertoId();
function inicioVentanaVolver(id, n){
  if(!inicioVentanas.has(id)) return;
  const clave = 'inicio-turno:' + id;
  if(((AvisoCombate.abierto() && AvisoCombate.abiertoClave() !== clave) || inicioDueloAbierto()) && num(n) < 400){ setTimeout(() => inicioVentanaVolver(id, num(n) + 1), 700); return; }
  if(AvisoCombate.abiertoClave() === clave) AvisoCombate.esconder(clave, false);
  inicioVentanaDibujar(id);
}
// Si otro aviso la reemplazó con algo pendiente (una zona sin tirar, o «✔ Aplicar»), vuelve sola cuando ese se cierra. Y mientras esté abierto el
// cuadro de un duelo en esta pantalla (otra zona, la de una invocación, un ataque), se aparta: no lo tapa (visto en el mapa, 2026-11-22: el daño de la
// Nube sobre la abeja se abrió debajo de la ventana); vuelve cuando el cuadro se cierra o se minimiza.
setInterval(() => {
  for(const [id, v] of inicioVentanas){
    const clave = 'inicio-turno:' + id;
    if(AvisoCombate.abiertoClave() === clave){
      const tirando = v.zonas.some(z => z.estado === 'tirando');
      if(inicioDueloAbierto() && !AvisoCombate.escondida(clave)){ AvisoCombate.esconder(clave, true); v.porDuelo = true; }
      else if(!inicioDueloAbierto() && v.porDuelo && !tirando){ v.porDuelo = false; AvisoCombate.esconder(clave, false); }
      continue;
    }
    if(v.zonas.some(z => z.estado === 'tirando') || AvisoCombate.escondida(clave)) continue;
    if(!AvisoCombate.abierto() && !inicioDueloAbierto()) inicioVentanaDibujar(id);
  }
}, 500);
function inicioTurnoMomento(id, d){
  const dt = d.datos || {};
  if(!dt.paraUid || dt.paraUid !== fbUsuario.uid) return false;
  if(d.estado === 'esperando'){
    if(inicioMostrados.has(id)) return true;
    // (una zona de afuera resolviéndose con el cuadro del duelo abierto: la ventana espera a que termine, así no lo tapa)
    if(typeof zonaBanner !== 'undefined' && zonaBanner && zonaBanner.tirando && !zonaBanner.enInicio){ setTimeout(() => inicioTurnoMomento(id, d), 800); return true; }
    inicioMostrados.add(id);
    const v = {d, tokenId: dt.tokenId, aplicado: '', zonas: []};
    inicioVentanas.set(id, v);
    inicioCerrados.delete(dt.tokenId);
    inicioZonasDe(v, typeof zonaInicioTomar === 'function' ? zonaInicioTomar(dt.tokenId) : []);   // las zonas que llegaron antes que la ventana
    inicioVentanaDibujar(id);
    return true;
  }
  const v = inicioVentanas.get(id);
  // Ya aplicado desde acá: sin zonas la ventana ya se cerró (2026-11-14). Solo si el turno cambió en el medio, el aviso de que no se aplicó.
  if(d.estado === 'listo' && inicioAplicadoAca.has(id)){
    if(dt.noAplicado && !inicioNoAplicadoVisto.has(id)){
      inicioNoAplicadoVisto.add(id);
      if(v){ v.aplicado = 'no'; v.d = d; inicioVentanaDibujar(id); }
      else AvisoCombate.mostrar({clave: 'inicio-turno:' + id, icono: '▶', titulo: inicioTitulo(dt.tokenId), texto: '', soloBoton: true,
        veredicto: {tono: 'malo', grande: inicioDeInvocacion(dt.tokenId) ? '⏱ YA NO ES SU TURNO' : '⏱ YA NO ES TU TURNO', chico: 'Cambió el orden de turnos: el inicio no se aplicó.'}, botones: [{texto: 'Entendido', alClic: () => AvisoCombate.cerrar()}]});
    }
    return true;
  }
  // Ya aplicado (por el GM, o solo al pasar el turno) con la ventana abierta acá: el mismo cartel, con lo que pasó; las zonas siguen con su botón.
  if(d.estado === 'listo' && v){
    if(!v.aplicado){ v.aplicado = dt.noAplicado ? 'no' : 'gm'; v.d = {...d, datos: {...dt, pasos: dt.pasos || (v.d.datos || {}).pasos || []}}; inicioVentanaDibujar(id); }
    return true;
  }
  return d.estado === 'listo' && inicioMostrados.has(id);
}
// ¿Esta pantalla maneja ese token y le va a salir su «Empieza tu turno»? (un personaje o una invocación; los creeps no tienen la ventana)
function inicioTurnoTarjetaSobra(tokenId){
  const t = tokens.get(tokenId);
  if(!t || t.tipo === 'creep' || !t.fichaId || !fbUsuario) return false;
  const f = fichasPub.get(String(t.fichaId).split(SEP_INVOCACION)[0]), ctrl = f && f.resumen && f.resumen.control;
  return ctrl ? ctrl === fbUsuario.uid : (t.duenoUid === fbUsuario.uid || !!(f && f.duenoUid === fbUsuario.uid));
}
/* ▶🔥 Recargar la página con «Empieza tu turno» sin aplicar (2026-11-23, cola «Zona al empezar el turno: lo que quedó sin probar»; probado en el mapa:
   al recargar no volvían ni la ventana ni el renglón de la zona, y la zona no se aplicaba nunca —el inicio sí, solo al pasar el turno—). Si el momento
   es de esta pantalla, sigue esperando, es de la última media hora y todavía es el turno de ese token, la ventana vuelve y las zonas de «al empezar su
   turno» se juntan de nuevo (js/08 zonasAlEmpezarTurno). Sin el inicio aplicado ninguna zona se pudo haber tirado (el botón se habilita después de
   «✔ Aplicar», P274): no hay riesgo de que pegue dos veces. */
const inicioRecuperados = new Set();
function inicioRecuperable(d, ms){
  const dt = (d && d.datos) || {};
  return !!(d && d.tipo === 'inicio-turno' && d.estado === 'esperando' && fbUsuario && dt.paraUid === fbUsuario.uid && dt.tokenId && Date.now() - num(ms) < 30 * 60 * 1000);
}
function inicioRecuperar(id, d, n){
  if(inicioRecuperados.has(id) && !n) return;
  inicioRecuperados.add(id);
  // (el orden de turnos y el modo del mapa pueden llegar después que los momentos: hasta 30 s; probado en el mapa: sin esperar al modo, las zonas no se
  // juntaban porque el mapa todavía creía estar en narrativo)
  const listo = typeof iniciativaCargada !== 'undefined' && iniciativaCargada && (typeof escucharModo !== 'function' || escucharModo.listo === true);
  if(!listo){ if(num(n) < 30) setTimeout(() => inicioRecuperar(id, d, num(n) + 1), 1000); return; }
  const dt = d.datos || {};
  if(typeof inicioTurnoVigente === 'function' && !inicioTurnoVigente(dt.tokenId, dt.clave)) return;   // ya no es su turno: lo aplica el pase de turno
  if(!inicioTurnoMomento(id, d)) return;
  if(typeof zonasAlEmpezarTurno === 'function') setTimeout(() => zonasAlEmpezarTurno(), 1500);   // (un respiro para que lleguen las zonas; una vez por token y ronda: zonaTurnoVisto)
}
// (fin de lo que vuelve al recargar)
// 🙈 Un momento recién llegado que se escondió (js/29): a los 3 s se mira de nuevo, por si a quien nombra se lo vio enseguida (lo detectaron,
// atacó y quedó delatado). Solo la tarjeta de la esquina: lo demás del momento ya pasó.
const momentosNoVistoPend = new Map();
function momentoNoVistoReintentar(id, d){
  const habia = momentosNoVistoPend.has(id);
  momentosNoVistoPend.set(id, d);
  if(habia) return;
  setTimeout(() => {
    const x = momentosNoVistoPend.get(id);
    momentosNoVistoPend.delete(id);
    if(!x || typeof inciertaMomento !== 'function') return;
    const nv = inciertaMomento(id, x);
    if(nv.modo !== 'ver' && nv.modo !== 'anon') return;
    momentosFeed.set(id, {d: nv.d, hasta: Date.now() + MOMENTO_DURA_MS, orden: ++momentosOrden});
    renderMomentosFeed();
  }, (typeof NO_VISTO_ESPERA_MS === 'number' ? NO_VISTO_ESPERA_MS : 3000) + 400);
}
let momentosFeedTimer = null;
function renderMomentosFeed(){
  const caja = $('#lienzo-caja');
  if(!caja) return;
  let feed = document.getElementById('momentos-feed');
  if(!feed){
    feed = document.createElement('div');
    feed.id = 'momentos-feed';
    feed.style.cssText = 'position:absolute;right:12px;top:118px;width:min(300px,60vw);z-index:31;display:flex;flex-direction:column;gap:6px;pointer-events:none';
    feed.addEventListener('click', ev => {
      const bam = ev.target.closest('[data-detectar-amano]'); if(bam){ if(typeof revelarAManoDeMomento === 'function') revelarAManoDeMomento(bam.dataset.detectarAmano); return; }   // ✋ (js/122)
      const bx = ev.target.closest('[data-momento-cerrar]'); if(bx){ momentosCerrados.add(bx.dataset.momentoCerrar); renderMomentosFeed(); return; }
      const bmsj = ev.target.closest('[data-mensaje-abrir]'); if(bmsj){ momentosCerrados.add(bmsj.dataset.mensajeClave); renderMomentosFeed(); if(typeof Mensajes !== 'undefined') Mensajes.abrirConversacion(bmsj.dataset.mensajeAbrir); return; }   // 🕊️ (comun/mensajes.js)
      const b = ev.target.closest('[data-trampa-seguir]'); if(b) trampaSeguir(b.dataset.trampaSeguir);
      const bm = ev.target.closest('[data-mal-de-ojo]'); if(bm){ const v = momentosFeed.get(bm.dataset.malDeOjo); if(v && typeof malDeOjoTirar === 'function'){ bm.disabled = true; malDeOjoTirar(bm.dataset.malDeOjo, v.d, true); } }   // 🧿 (js/60)
      const bz = ev.target.closest('[data-zona-extra]'); if(bz){ const v = momentosFeed.get(bz.dataset.zonaExtra); if(v && typeof zonaExtraTirar === 'function'){ bz.disabled = true; zonaExtraTirar(bz.dataset.zonaExtra, v.d, true); } }   // 🎲 (js/66)
      const bzo = ev.target.closest('[data-zona-extra-ok]'); if(bzo){ bzo.disabled = true; momentoActualizar(bzo.dataset.zonaExtraOk, {estado: 'aplicar'}); }   // 🎲→◎ el GM acepta por quien tiró (js/66)
      const bza = ev.target.closest('[data-zona-extra-aplicar]'); if(bza){ const v = momentosFeed.get(bza.dataset.zonaExtraAplicar); if(v && typeof zonaExtraAplicar === 'function'){ bza.disabled = true; zonaExtraAplicar(bza.dataset.zonaExtraAplicar, v.d, true); } }   // 🎲→◎ el GM aplica por quien lo recibe (js/66)
      const bi = ev.target.closest('[data-inicio-aplicar]'); if(bi){ const v = momentosFeed.get(bi.dataset.inicioAplicar); if(v){ bi.disabled = true; inicioTurnoAplicar(bi.dataset.inicioAplicar, v.d, true); } }
    });
    caja.appendChild(feed);
    if(!document.getElementById('momentos-feed-css')){
      const st = document.createElement('style'); st.id = 'momentos-feed-css';
      st.textContent = '#momentos-feed .momento-x{position:absolute;top:4px;right:5px;width:20px;height:20px;padding:0;border:0;border-radius:5px;background:transparent;color:#8d97ad;font-size:13px;line-height:20px;text-align:center;cursor:pointer}' +
        '#momentos-feed .momento-x:hover{background:rgba(255,255,255,.12);color:#fff}';
      document.head.appendChild(st);
    }
  }
  const ahora = Date.now();
  momentosFeed.forEach((v, k) => { if(v.hasta < ahora){ momentosFeed.delete(k); momentosCerrados.delete(k); } });
  const lista = [...momentosFeed.entries()].filter(([k]) => !momentosCerrados.has(k)).sort((a, b) => b[1].orden - a[1].orden).slice(0, 4);
  feed.innerHTML = lista.map(([k, v]) => {
    const d = v.d, queda = v.hasta - ahora, lineas = d.lineas || (d.datos && d.datos.lineas);
    if(d.tipo === 'mensaje' && typeof Mensajes !== 'undefined') return Mensajes.cronicaHtml(k, d.mensaje, ahora - (v.desde || ahora), queda);   // 🕊️ un mensaje secreto que me llegó
    return `<div style="position:relative;pointer-events:auto;background:rgba(21,26,38,.94);border:1px solid #39435c;border-left:3px solid #c98545;border-radius:8px;padding:8px 10px;color:#e9ecf4;font-size:13px;line-height:1.35;box-shadow:0 6px 18px rgba(0,0,0,.45);opacity:${queda < 1500 ? Math.max(0.15, queda / 1500) : 1};transition:opacity .4s">
      <button type="button" class="momento-x" data-momento-cerrar="${esc(k)}" title="Cerrar (solo en tu pantalla)">✕</button>
      <div style="padding-right:18px"><span style="font-size:15px">${esc(d.icono || '•')}</span> <b>${esc(d.titulo || '')}</b></div>
      ${lineas ? lineas.map((l, i) => `<div style="margin-top:3px;color:${i === lineas.length - 1 ? '#e9ecf4' : '#9aa3b8'}">${esc(l)}</div>`).join('')
        : d.resultado ? `<div style="margin-top:3px;color:#cfd6e6">${esc(d.resultado)}</div>` : (d.estado === 'listo' ? '' : '<div style="margin-top:3px;color:#8d97ad">…</div>')}
      ${d.tipo === 'trampa' && d.datos && d.datos.fase ? trampaBotonFeed(k, d) : ''}
      ${typeof revelarBotonFeed === 'function' ? revelarBotonFeed(k, d) : ''}
      ${d.tipo === 'mal-de-ojo' && d.estado === 'esperando' && soyGM && !(d.datos && fbUsuario && d.datos.paraUid === fbUsuario.uid) ? `<div style="margin-top:6px"><button type="button" data-mal-de-ojo="${esc(k)}" style="font-size:12px;padding:3px 10px;border-radius:6px;border:1px solid #8a6fd0;background:#2a1f3a;color:#e9ecf4;cursor:pointer">🎲 Tirar por él</button></div>` : ''}
      ${d.tipo === 'zona-extra' && d.estado === 'esperando' && soyGM && !(d.datos && fbUsuario && d.datos.paraUid === fbUsuario.uid) ? `<div style="margin-top:6px"><button type="button" data-zona-extra="${esc(k)}" style="font-size:12px;padding:3px 10px;border-radius:6px;border:1px solid #6fae7d;background:#1f3a27;color:#e9ecf4;cursor:pointer">🎲 Tirar por él</button></div>` : ''}
      ${d.tipo === 'zona-extra' && d.estado === 'tirado' && soyGM && !(d.datos && fbUsuario && d.datos.paraUid === fbUsuario.uid) ? `<div style="margin-top:6px"><button type="button" data-zona-extra-ok="${esc(k)}" style="font-size:12px;padding:3px 10px;border-radius:6px;border:1px solid #6fae7d;background:#1f3a27;color:#e9ecf4;cursor:pointer">✔ Que se aplique (por él)</button></div>` : ''}
      ${d.tipo === 'zona-extra' && d.estado === 'aplicar' && soyGM && !(typeof zonaExtraManejo === 'function' && d.datos && zonaExtraManejo(d.datos.objetivo)) ? `<div style="margin-top:6px"><button type="button" data-zona-extra-aplicar="${esc(k)}" style="font-size:12px;padding:3px 10px;border-radius:6px;border:1px solid #6fae7d;background:#1f3a27;color:#e9ecf4;cursor:pointer">◎ Aplicar por él</button></div>` : ''}
      ${d.tipo === 'inicio-turno' && d.estado === 'esperando' && soyGM ? `<div style="margin-top:6px"><button type="button" data-inicio-aplicar="${esc(k)}" style="font-size:12px;padding:3px 10px;border-radius:6px;border:1px solid #6fae7d;background:#1d2a20;color:#bfe8c7;cursor:pointer">▶ Aplicar por él</button></div>` : ''}
    </div>`;
  }).join('');
  clearTimeout(momentosFeedTimer);
  if(momentosFeed.size) momentosFeedTimer = setTimeout(renderMomentosFeed, 500);
}

// 🕊️ Un mensaje secreto que me llegó (comun/mensajes.js, 2026-11-22, dueño: «en la Crónica con animación, fondo y borde brillante, algo que llame
// mucho la atención»): su tarjeta, solo en esta pantalla (no es un momento: no se escribe nada). Al irse queda el 🕊️ flotante con el globito.
window.mensajesCronica = m => {
  const k = 'msj:' + m.id;
  if(momentosFeed.has(k)) return;
  momentosFeed.set(k, {d: {tipo: 'mensaje', mensaje: m, estado: 'listo'}, hasta: Date.now() + (typeof Mensajes !== 'undefined' ? Mensajes.CRONICA_MS : 20000), orden: ++momentosOrden, desde: Date.now()});
  renderMomentosFeed();
};

/* ---------- Un duelo que esta pantalla no tiene abierto (P151, dueño 2026-10-03) ----------
   comun/duelo.js avisa cada paso (contacto, Bloqueo, crítico, daño, efectos, fin) recién cuando los dados quedaron quietos: una tarjeta por
   duelo en la Crónica, con un renglón por paso (el último, resaltado). Es local: cada pantalla la arma con el duelo que ya escucha, sin
   escribir nada. */
function dueloPasoCronica(d, nuevos, todos){
  const id = 'duelo:' + d.id;
  const ya = momentosFeed.get(id);
  let tarjeta = {icono: d.hab ? '✨' : '⚔', titulo: `${d.atacante.nombre} → ${d.defensor.nombre}${d.hab ? ' · ' + d.hab.nombre : ''}`, lineas: todos.map(p => p.txt), estado: 'listo'};
  // 🙈 Un duelo entre dos que esta pantalla no ve no va a la Crónica; si no ve a uno de los dos, sale «Alguien» (js/29, 2026-11-20).
  if(!soyGM && typeof inciertaMomento === 'function'){
    const nv = inciertaMomento(id, tarjeta);
    if(nv.modo === 'nada' || nv.modo === 'incierta'){ momentosFeed.delete(id); renderMomentosFeed(); return; }
    tarjeta = nv.d;
  }
  momentosFeed.set(id, {d: tarjeta, hasta: Date.now() + MOMENTO_DURA_MS, orden: ya ? ya.orden : ++momentosOrden});
  renderMomentosFeed();
}

/* ---------- «Algo está fuera de lugar» (Percepción aumentada, P145) ----------
   El cartelito del centro, en la pantalla de quien camina. Dos casos: una trampa oculta al lado (trampaId) o un rival en sigilo en su zona
   de alerta (ocultoId). Tira Percepción (la de la ficha, con el dado un escalón más alto; sale en la Mesa como una Percepción cualquiera).
   - Trampa: gana si llega a su dificultad (`trampaDetectar`, 6 si no tiene) → `descubierta` (la ve todo el equipo).
   - Sigilo: la Destreza del creep es privada del GM → el momento pasa a «esperandoGM» y la pantalla del GM la tira (deteccionGMAbrir);
     gana el que detecta si su Percepción es MAYOR (empate: el oculto sigue escondido). Si gana, el GM le saca el Sigilo. */
let percepcionBanner = null;            // {tokenId, trampaId?, ocultoId?, momentoP, momentoId, resultado, esperando}
let percepcionSigiloPendiente = null;   // {tokenId, ocultoId, celda} cortado por la zona de alerta, se resuelve al llegar
const percepcionChequeados = new Set(); // 'token:oculto:casillero' que ya pidieron la tirada (sigilo)
// Al terminar un movimiento con varios ocultos en la zona de alerta (js/08 percepcionPublicarAvisos): una tirada por oculto, de a una.
const percepcionColaFin = [];
function percepcionSiguienteFin(){
  if(percepcionBanner) return;   // ya hay un cartel de Percepción abierto: sigue cuando se cierre
  while(percepcionColaFin.length){
    const p = percepcionColaFin.shift();
    const t = tokens.get(p.tokenId), o = p.ocultoId ? tokens.get(p.ocultoId) : null, el = p.trampaId ? elementos.get(p.trampaId) : null;
    if(t && ((o && enSigilo(o)) || (el && !el.disparada && !el.descubierta))){ percepcionAbrir(p); return; }
    // (un pedido de otra pantalla que ya no hace falta: el escondido ya no está escondido o la trampa ya saltó → se cierra sin decir nada)
    if(p.momentoId) momentoActualizar(p.momentoId, {estado: 'listo', resultado: `${t ? nombreDe(t) : 'Alguien'} no nota nada raro.`});
  }
}
function percepcionAbrir(o){
  const t = tokens.get(o.tokenId);
  if(!t) return;
  // 🔎 Siempre incierto (dueño, 2026-11-11): solo quién percibe, con una frase que no dice por qué (Combatiente.percepcionIncierta).
  const frase = o.frase || Combatiente.percepcionIncierta(nombreDe(t), Date.now() + ':' + o.tokenId);
  percepcionBanner = {...o, frase, resultado: null, esperando: false, momentoId: o.momentoId || null, externo: !!o.momentoId};
  percepcionBanner.momentoP = o.momentoId ? Promise.resolve(o.momentoId) : momentoAbrir({tipo: o.ocultoId ? 'sigilo-pedido' : 'percepcion', icono: '🔎', titulo: frase,
    estado: 'tirando', resuelve: fbUsuario.uid, datos: {centro: true, frase}});
  const pb = percepcionBanner;
  pb.momentoP.then(id => { pb.momentoId = id; });
  renderPercepcionBanner();
}
function percepcionSigiloResolver(){
  const p = percepcionSigiloPendiente;
  percepcionSigiloPendiente = null;
  if(!p) return;
  const c = p.celda;
  percepcionChequeados.add(p.tokenId + ':' + p.ocultoId + ':' + nbPack(c.col, c.fila));
  percepcionAbrir({tokenId: p.tokenId, ocultoId: p.ocultoId});
}
function renderPercepcionBanner(){
  // Con la estética del cuadro del duelo (2026-10-03, pedido del dueño: unificar los carteles de combate): comun/aviso-combate.js.
  if(!percepcionBanner){ AvisoCombate.cartel('percepcion', null); return; }
  const t = tokens.get(percepcionBanner.tokenId);
  const quien = t ? nombreDe(t) : '';
  if(percepcionBanner.resultado){
    const cerrar = () => { percepcionBanner = null; renderPercepcionBanner(); percepcionSiguienteFin(); };
    AvisoCombate.cartel('percepcion', {icono: '🔎', titulo: `${quien}: Percepción`, texto: percepcionBanner.resultado,
      botones: percepcionBanner.desarmar
        ? [{texto: `${typeof trampaEsMagica === 'function' && trampaEsMagica(elementos.get(percepcionBanner.desarmar)) ? '✨ Disiparla' : '🪤 Desarmarla'}${modoMapa === 'combate' ? ' (1 No2)' : ''}`, id: 'percepcion-banner-desarmar', alClic: desarmarDesdeBanner}, {texto: 'Dejarla', sec: true, alClic: cerrar}]
        : [{texto: 'Listo', id: 'percepcion-banner-ok', alClic: cerrar},
          // ✋ El GM, en su propio cartel (tiró por un creep o por quien no estaba): decide él qué pasó (js/122, 2026-11-20).
          ...(soyGM && percepcionBanner.trampaId && typeof revelarAManoAbrir === 'function' ? [{texto: '✋ Resolver a mano', sec: true, id: 'percepcion-banner-amano', titulo: 'Si los dados no cuentan lo que pasó en la mesa: decidí vos si la detectó o no',
            alClic: () => { const pb = percepcionBanner; revelarAManoAbrir({momentoId: pb.momentoId, trampaId: pb.trampaId, detector: quien, resultado: pb.resultado,
              alResolver: (det, tx) => { if(percepcionBanner === pb){ pb.resultado = tx.resultado; pb.desarmar = null; renderPercepcionBanner(); } }}); }}] : [])]});
  }else if(percepcionBanner.esperando){
    AvisoCombate.cartel('percepcion', {icono: '🔎', titulo: `${quien}: Percepción ${percepcionBanner.total}`, texto: 'Esperando qué pasa…'});
  }else{
    // 🔎 Incierto (dueño, 2026-11-11): «<quien> siente un movimiento extraño…» — nunca quién, cuántos, qué hacen ni dónde.
    const deCreep = t && t.tipo === 'creep', porEl = percepcionBanner.porEl;
    AvisoCombate.cartel('percepcion', {icono: '🔎', titulo: `${percepcionBanner.frase}${porEl ? ` · tirá por ${quien}` : ''}`,
      texto: deCreep || porEl ? `Tirá la Percepción de ${quien}.` : `${quien}, tirá Percepción.`,
      botones: [{texto: '🎲 Tirar Percepción', id: 'percepcion-banner-ir', alClic: percepcionResolverBanner}]});
  }
}
async function percepcionResolverBanner(){
  const pb = percepcionBanner;
  if(!pb || pb.resultado || pb.esperando) return;
  const bt = document.getElementById('percepcion-banner-ir'); if(bt) bt.disabled = true;
  const t = tokens.get(pb.tokenId);
  if(!t){ percepcionBanner = null; renderPercepcionBanner(); return; }
  try{ await bnCargarPiezas(); }catch(err){ console.error(err); toast('No se pudo tirar Percepción'); if(bt) bt.disabled = false; return; }
  const f = fichasPub.get(String(t.fichaId).split(SEP_INVOCACION)[0]);
  // La Percepción de quien camina: un personaje, su resumen; una invocación, la suya; un creep, sus datos (2026-10-04: iguales para todos).
  const ri = resumenDeInv(t), sc = t.tipo === 'creep' ? creepPrivadoDe(t.fichaId) : null;
  const valor = sc ? num(CreepCalculo.statValor(sc, 'percepcion')) : ri ? num(ri.percepcion) : f && f.resumen ? num(f.resumen.percepcion) : 0;
  const aumentada = tokenPercepcionAumentada(t);   // con Pisada atenta sola (solo trampas), la Percepción normal
  const r = FichaBotonera.tiradaPercepcionValor(valor, aumentada);
  if(!r){ toast('Percepción: sin valor para tirar (abrí la ficha una vez para que lo publique)'); percepcionBanner = null; renderPercepcionBanner(); return; }
  const nombre = nombreDe(t);
  // Un pedido de otra pantalla (js/116): una sola pantalla lo tira (la de quien percibe o, si no estaba, el GM por él).
  if(pb.externo && typeof sigiloTomar === 'function' && !(await sigiloTomar(pb.momentoId, 'percepcionJug', 'percepcionTirando'))){ percepcionBanner = null; renderPercepcionBanner(); percepcionSiguienteFin(); return; }
  // (En la Mesa, «Percepción» sola: ni «aumentada» ni «Pisada atenta», que dirían por qué se tira.)
  try{ mesaPublicar(`${nombre} · Percepción`, {...r, quien: nombre, ficha: String(t.fichaId).split(SEP_INVOCACION)[0]}); }catch(err){}
  const mid = await pb.momentoP;
  if(pb.ocultoId){
    // Sigilo: la resuelve la pantalla del GM (la Destreza del oculto es privada).
    pb.esperando = true; pb.total = r.total; pb.momentoId = mid;
    renderPercepcionBanner();
    if(!mid){ pb.esperando = false; pb.resultado = 'no se pudo avisar al GM (¿faltan publicar las reglas?)'; renderPercepcionBanner(); return; }
    // 🕶 Si el escondido es un personaje (2026-11-11, js/116): tira su Sigilo su jugador, con su botón (privado: él y el GM).
    const ocu = tokens.get(pb.ocultoId);
    if(ocu && typeof sigiloEsDeJugador === 'function' && sigiloEsDeJugador(ocu)){
      momentoActualizar(mid, {titulo: pb.frase, estado: 'sigiloJugador', resuelve: '', datos: {centro: true, privado: true, ocultoId: pb.ocultoId, ocultoFicha: String(ocu.fichaId || ''),
        ocultoNombre: nombreDe(ocu), detectorId: pb.tokenId, detector: nombre, detectorTipo: t.tipo, detectorFicha: String(t.fichaId || ''), frase: pb.frase,
        pasos: num(pb.pasos) || 1, paso: num(pb.paso) || 1, percepcion: r.total, desde: Date.now()}});
      return;
    }
    momentoActualizar(mid, {titulo: pb.frase, estado: 'esperandoGM', resuelve: 'gm', datos: {centro: true, privado: true, ocultoId: pb.ocultoId, ocultoFicha: String((ocu && ocu.fichaId) || ''),
      ocultoNombre: ocu ? nombreDe(ocu) : '', detectorId: pb.tokenId, detector: nombre, detectorTipo: t.tipo, detectorFicha: String(t.fichaId || ''), frase: pb.frase,
      pasos: num(pb.pasos) || 1, paso: num(pb.paso) || 1, percepcion: r.total}});
    return;
  }
  const el = elementos.get(pb.trampaId);
  const dif = el ? Math.max(1, Math.round(num(el.trampaDetectar)) || 6) : Infinity;
  if(el && !el.disparada && r.total >= dif){
    descubrirTrampa(pb.trampaId);   // ya, en esta pantalla
    try{ await coleccionElementos().doc(pb.trampaId).update({descubierta: true}); }   // y para todo su equipo
    catch(err){ console.error('No se pudo marcar la trampa como descubierta (¿faltan publicar las reglas?):', err); }
    pb.resultado = `encontraste algo: ${el.trampaNombre ? `«${el.trampaNombre}», ` : ''}una trampa (${r.total} contra ${dif}).`;
    // Desarmar trampas (talento, 2026-10-08, js/28): si es de un rival, ofrece desarmarla.
    if(typeof tokenDesarmaTrampas === 'function' && tokenDesarmaTrampas(t) && trampaEsRival(t, el)){ pb.desarmar = pb.trampaId; pb.resultado += typeof trampaEsMagica === 'function' && trampaEsMagica(el) ? ' Es mágica: ¿querés disiparla (Efecto especial)?' : ' ¿Querés desarmarla (Destreza)?'; }
    momentoActualizar(mid, {estado: 'listo', resultado: `…y encuentra una trampa${el.trampaNombre ? `: «${el.trampaNombre}»` : ''}.`, 'datos.trampaId': pb.trampaId, 'datos.detector': nombre});   // (trampaId y detector: para el «✋ Resolver a mano» del GM, js/122)
  }else{
    pb.resultado = 'Mmm... Puede que estés flasheando.';   // texto del dueño (2026-10-02); la tirada ya está en la Mesa
    if(typeof trampaPerdio === 'function') trampaPerdio(pb.tokenId, pb.trampaId);   // en combate, con esta trampa ya no hay otro intento (2026-10-08)
    momentoActualizar(mid, {estado: 'listo', resultado: 'Mmm... puede que esté flasheando.', 'datos.trampaId': pb.trampaId, 'datos.detector': nombre});
  }
  renderPercepcionBanner();
}
// La respuesta del GM a un pedido de sigilo, en el cartelito de quien buscaba.
function percepcionRespuesta(d){
  const pb = percepcionBanner;
  pb.esperando = false;
  pb.resultado = d.datos && d.datos.detectado ? `¡Encontraste a alguien! ${d.datos.ocultoNombre ? d.datos.ocultoNombre + ' estaba escondido.' : ''}` : 'Mmm... Puede que estés flasheando.';
  renderPercepcionBanner();
}

/* ---------- El pedido de detección, en la pantalla del GM (P145) ----------
   Al centro, porque el GM es quien resuelve: «Silvia siente que algo está fuera de lugar… <oculto> tira Destreza». Tira la Destreza del
   creep (la misma tirada de stat de siempre, con sus estados), compara con la Percepción que mandó el jugador y, si la Percepción es mayor,
   le saca el Sigilo (romperSigilo, sin repetir el momento). La tirada del oculto no va a la Mesa: lo delataría. */
let deteccionBanner = null;   // {id, d, resultado}
function deteccionGMAbrir(id, d){
  if(deteccionBanner && deteccionBanner.id === id) return;
  deteccionBanner = {id, d, resultado: null};
  renderDeteccionBanner();
}
function renderDeteccionBanner(){
  // Con la estética del cuadro del duelo (2026-10-03, pedido del dueño: unificar los carteles de combate): comun/aviso-combate.js.
  if(!deteccionBanner){ AvisoCombate.cartel('deteccion', null); return; }
  const dt = deteccionBanner.d.datos || {};
  const oculto = tokens.get(dt.ocultoId);
  const nomOculto = oculto ? nombreDe(oculto) : 'el oculto';
  if(deteccionBanner.resultado){
    AvisoCombate.cartel('deteccion', {icono: '🔎', titulo: 'Detección', texto: deteccionBanner.resultado,
      botones: [{texto: 'Listo', id: 'deteccion-banner-ok', alClic: () => { deteccionBanner = null; renderDeteccionBanner(); }}]});
  }else{
    // (El GM tira el Sigilo de SU creep escondido: acá sí dice cuál; el título, incierto como en todos lados.)
    AvisoCombate.cartel('deteccion', {icono: '🔎', titulo: dt.frase || Combatiente.percepcionIncierta(dt.detector, deteccionBanner.id),
      pasos: [{titulo: 'Percepción', texto: `${dt.detector || 'Alguien'} sacó ${dt.percepcion}.`}, {titulo: 'Para seguir escondido', texto: `${nomOculto} (en sigilo) tira Sigilo (Destreza + bonos): tiene que sacar ${dt.percepcion} o más.`}],
      botones: [{texto: `🎲 Tirar Sigilo de ${nomOculto}`, id: 'deteccion-banner-ir', alClic: deteccionGMResolver}]});
  }
}
async function deteccionGMResolver(){
  const db = deteccionBanner;
  if(!db || db.resultado) return;
  const bt = document.getElementById('deteccion-banner-ir'); if(bt) bt.disabled = true;
  const dt = db.d.datos || {};
  const oculto = tokens.get(dt.ocultoId);
  const nomOculto = oculto ? nombreDe(oculto) : 'el oculto';
  // Sigilo (2026-10-04, dueño): el oculto tira su Sigilo = Destreza + lo que le den ítems, pasivas o estados (las fichas viejas: Destreza).
  let des = 0, estados = [];
  if(oculto && oculto.tipo === 'creep'){
    const sc = creepPrivadoDe(oculto.fichaId);
    if(sc){ des = CreepCalculo.statValor(sc, 'sigilo'); estados = sc.estados || []; }
  }else if(oculto){
    const f = fichasPub.get(String(oculto.fichaId).split(SEP_INVOCACION)[0]);
    des = f && f.resumen ? num(f.resumen.sigilo !== undefined ? f.resumen.sigilo : f.resumen.des) : 0;
  }
  const rd = Combatiente.tirarStat(des, estados, 'des');
  const total = rd ? rd.total : 0;
  const detectado = !!oculto && enSigilo(oculto) && num(dt.percepcion) > total;   // empate: sigue escondido
  if(detectado) await romperSigilo(dt.ocultoId, dt.detector || 'alguien', `Lo descubrió ${dt.detector || 'alguien'} con Percepción aumentada`, true);
  db.resultado = detectado   // antes de avisar: el aviso vuelve enseguida por la escucha y no tiene que cerrar este cartelito
    ? `${dt.detector || 'Alguien'} descubre a ${nomOculto} (Percepción ${dt.percepcion} contra Sigilo ${total}).`
    : `${nomOculto} sigue escondido (Percepción ${dt.percepcion} contra Sigilo ${total}).`;
  renderDeteccionBanner();
  await momentoActualizar(db.id, {estado: 'listo', resultado: detectado ? `…¡y descubre a ${nomOculto}!` : 'Mmm... puede que esté flasheando.',
    datos: {...dt, detectado, sigilo: total, ...(detectado ? {ocultoNombre: nomOculto} : {})}});
  // Una tirada por paso (2026-11-11): si sigue escondido y quedan pasos en la zona de quien percibe, el siguiente (js/116).
  const sig = !detectado && Combatiente.sigiloPasoSiguiente(dt.paso, dt.pasos, false);
  if(sig && oculto && enSigilo(oculto) && typeof sigiloPedirPercepcion === 'function') await sigiloPedirPercepcion(dt.ocultoId, dt.detectorId, dt.pasos, sig);
}

/* ---------- Un aviso al centro para quien le toca (P146) ----------
   Sin nada que tirar: solo el momento y «Entendido». Lo usa el cambio de control (el GM toma o devuelve el personaje de un jugador). */
let avisoCentro = null;   // {id, d}
const avisosDanoVistos = new Set();   // 📣 los avisos de daño directo ya mostrados (P246)
function momentoAvisoCentro(id, d, espera){
  // 📣 El aviso de un daño directo (P246, js/08) no tapa otro aviso abierto: espera a que se cierre (hasta 1 minuto), así dos que llegan juntos
  // (el Espejito y el salto del rayo, por ejemplo) se leen uno detrás del otro.
  // (Una sola vez por aviso: el mismo momento vuelve a llegar cuando el servidor le pone la hora.)
  if(d && d.tipo === 'zona-dano'){
    if(!espera && avisosDanoVistos.has(id)) return;
    avisosDanoVistos.add(id);
    if(typeof AvisoCombate !== 'undefined' && AvisoCombate.abierto && AvisoCombate.abierto() && num(espera) < 85){
      setTimeout(() => momentoAvisoCentro(id, d, num(espera) + 1), 700); return; }
  }
  // ✨ Mientras se ve una resurrección (js/125), el cartel espera: primero la animación, después «Volviste…».
  if(typeof resuFxAvisoEspera === 'function' && resuFxAvisoEspera(id, d, espera)) return;
  avisoCentro = {id, d};
  // Con la estética del cuadro del duelo (2026-10-03, pedido del dueño: unificar los pop-ups de efectos de combate): comun/aviso-combate.js.
  const dt = d.datos || {};
  AvisoCombate.mostrar({icono: d.icono || '•', titulo: dt.tituloAviso || d.titulo || '', pasos: Array.isArray(dt.pasos) ? dt.pasos : [],   // (tituloAviso / textoAviso: en segunda persona para quien le pasó, 2026-10-28)
    texto: Array.isArray(dt.pasos) && dt.pasos.length ? '' : ((dt.porUid && fbUsuario && dt.porUid[fbUsuario.uid]) || dt.textoAviso || d.resultado || ''), veredicto: dt.veredicto || null, aMano: dt.aMano || '',
    ...(dt.boton ? {boton: String(dt.boton).slice(0, 30)} : {}),   // ej. «💚 Aceptar» de una cura (2026-10-07)
    alCerrar: () => {
      avisoCentro = null;
      // 😤 Provocado por alguien (js/04 provocadoAvisar): al aceptarlo, quien provoca brilla en todas las pantallas hasta que pasa el turno (js/77).
      if(d.tipo === 'provocado' && dt.provocaDe && typeof provocadoBrilloPedir === 'function') provocadoBrilloPedir(dt.provocaDe, dt.provocaDeNombre, dt.provocadoNombre);
    }});
}
