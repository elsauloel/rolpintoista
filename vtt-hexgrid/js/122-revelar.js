/* js/122-revelar.js — 👁 Revelar a mano lo que está oculto (2026-11-20, dueño: «un personaje tiró para detectar una trampa, pasó algo raro con las
   tiradas, el sistema entendió que la trampa no fue detectada, pero en realidad sí fue detectada por un malentendido. Y yo como GM no tenía una
   forma de revelar lo que estaba oculto… Tanto para GMs como para jugadores, uno tiene que poder hacerles clic y revelarlas»).
   Tres cosas, con las reglas en comun/revelar.js (puras, con pruebas):
   1. **Un elemento del mapa** (una trampa oculta, algo «Invisible para jugadores»): al hacerle clic sale el cartel «⬡ Hexágono…» de siempre (js/104)
      y ahí, arriba, el botón «👁 Revelar …». El GM, con cualquiera que vea (y «🙈 Volver a ocultar» una trampa ya revelada); un jugador, con las
      suyas (las que puso él o un personaje que maneja). Revelar una trampa es marcarla `descubierta`: el mismo camino de cuando la detectan
      (js/16), así que no hay otra lógica de «quién la ve» (`puedeVerElemento`, js/07).
   2. **Un token**: en sus botones (js/10), «👁»: el GM con uno oculto (lo de siempre, `oculto`) o en sigilo; un jugador con el suyo en sigilo. Sacar
      el sigilo a mano es sacar el estado, sin tirada y SIN el Marcado de cuando lo descubren (eso es de `romperSigilo`; duda P254).
   3. **La tirada de detectar una trampa** (js/16): al GM le queda «✋ Resolver a mano» (detectada / no detectada) en la tarjeta de la Crónica y en su
      propio cartel, por si los dados no cuentan lo que pasó en la mesa.
   Todo deja su línea en la Mesa (`sigiloAviso`, js/02). */

// ¿Es mío? Lo puse yo, o lo puso un personaje (o una invocación suya) que manejo.
function revelarEsMio(el){
  if(!el || !fbUsuario) return false;
  if(el.duenoUid === fbUsuario.uid) return true;
  const c = typeof colocadorDe === 'function' ? colocadorDe(el) : null;
  if(!c || c.tipo !== 'pj') return false;
  const f = fichasPub.get(String(c.ref || '').split(SEP_INVOCACION)[0]);
  if(!f) return false;
  const ctrl = f.resumen && f.resumen.control;
  return ctrl ? ctrl === fbUsuario.uid : f.duenoUid === fbUsuario.uid;
}
function revelarOpcionElemento(el){
  if(!el || !fbUsuario || !fbMiembro || (typeof pausaSoloMirar === 'function' && pausaSoloMirar())) return null;
  return Revelar.elemento(el, {gm: soyGM, mio: revelarEsMio(el)});
}
// Los botones del cartel de la casilla (js/104): uno por cada elemento de esa casilla que se pueda revelar o volver a ocultar.
function revelarBotonesHex(items){
  const vistos = new Set(), out = [];
  (items || []).forEach(x => {
    if(!x || !x.elId || vistos.has(x.elId)) return;
    vistos.add(x.elId);
    const op = revelarOpcionElemento(elementos.get(x.elId));
    if(op) out.push(`<button type="button" class="hi-revelar${op.accion === 'ocultar' ? ' hi-ocultar' : ''}" data-revelar-el="${esc(x.elId)}" title="${esc(op.titulo)}">${esc(op.texto)}</button>`);
  });
  return out.length ? `<div class="hi-acciones">${out.join('')}</div>` : '';
}
/* Volver a ocultar una trampa. Las reglas de Firestore nuevas dejan al GM apagar `descubierta`; mientras no estén pegadas en la consola, el GM
   la vuelve a colocar igual (misma trampa, sin la marca) si es suya o dice quién la puso (así no cambia de bando). → true si quedó oculta. */
async function revelarOcultarTrampa(id){
  const el = elementos.get(id);
  if(!el) return false;
  const ref = coleccionElementos().doc(id);
  try{ await ref.update({descubierta: false}); return true; }
  catch(err){
    if(!(err && err.code === 'permission-denied') || !(el.duenoUid === fbUsuario.uid || colocadorDe(el))) throw err;
    const snap = await ref.get();
    if(!snap.exists) return false;
    const d = snap.data();
    delete d.descubierta;
    await coleccionElementos().add({...d, duenoUid: fbUsuario.uid, creado: firebase.firestore.FieldValue.serverTimestamp()});
    await ref.delete();
    return true;
  }
}
let revelarEnCurso = false;
async function revelarElementoAplicar(id){
  const el = elementos.get(id), op = revelarOpcionElemento(el);
  if(!op || revelarEnCurso) return;
  revelarEnCurso = true;
  const nombre = op.que === 'trampa' ? (el.trampaNombre || '') : '';
  try{
    if(op.accion === 'ocultar'){
      if(!(await revelarOcultarTrampa(id))) return;
    }else{
      if(op.que === 'trampa' && typeof descubrirTrampa === 'function') descubrirTrampa(id);   // ya, en esta pantalla
      for(const c of op.cambios) await coleccionElementos().doc(id).update(c);
    }
    const l = Revelar.linea(op, {gm: soyGM, quien: fbMiembro.nombre, nombre});
    if(l) sigiloAviso(l.origen, l.formula);
    toast(op.accion === 'ocultar' ? '🙈 Quedó oculta de nuevo' : '👁 Revelado: ahora lo ven todos');
  }catch(err){
    console.error('No se pudo revelar / ocultar:', err);
    toast(err && err.code === 'permission-denied'
      ? (op.accion === 'ocultar' ? 'No se pudo volver a ocultar: faltan pegar las reglas nuevas de Firestore' : 'No se pudo revelar (sin permiso)')
      : 'No se pudo — revisá la consola');
  }finally{
    revelarEnCurso = false;
    if(typeof hexInfoRefrescar === 'function'){ hexInfoFirma = ''; hexInfoRefrescar(); }
    pedirDibujo();
  }
}

/* ---------- El circulito que sale de la propia trampa (2026-11-20, dueño: «para las trampas también debería aparecer un botón que se despliegue
   desde el propio token, al igual que… los circulitos de alrededor») ----------
   Al hacer clic en la casilla (sale el cartel, js/104), si ahí hay algo que esta pantalla puede revelar o volver a ocultar, un circulito 👁 / 🙈
   arriba a la derecha de la casilla, con el mismo aspecto que los botones de un token. Hace lo mismo que el botón del cartel (que queda: dice con
   palabras qué es). Lo ubica cada dibujo (`revelarCirculoUbicar`, lo llama js/104 desde `hexInfoDibujar`). */
function revelarCirculoOpciones(){
  if(!hexInfoCelda || seleccion) return [];
  const out = [], igual = c => c.col === hexInfoCelda.col && c.fila === hexInfoCelda.fila;
  elementos.forEach((el, id) => {
    if(id === ID_BORRADOR || !puedeVerElemento(el) || !celdasDeElemento(el).some(igual)) return;
    const op = revelarOpcionElemento(el);
    if(op) out.push({id, op});
  });
  return out;
}
function revelarCirculoUbicar(){
  let caja = $('#revelar-hud');
  const ops = typeof hexInfoCelda !== 'undefined' ? revelarCirculoOpciones() : [];
  if(!ops.length){ if(caja && !caja.hidden){ caja.hidden = true; caja.dataset.firma = ''; } return; }
  if(!caja){
    caja = document.createElement('div'); caja.id = 'revelar-hud'; caja.hidden = true;
    ($('#hud').parentElement || document.body).appendChild(caja);
    // (en `pointerdown` y en captura: el cartel de la casilla se cierra con cualquier pointerdown fuera del lienzo, js/104)
    caja.addEventListener('pointerdown', e => {
      const b = e.target.closest('[data-revelar-el]');
      if(!b) return;
      e.preventDefault(); e.stopPropagation();
      revelarElementoAplicar(b.dataset.revelarEl);
    }, true);
  }
  const firma = ops.map(x => x.id + ':' + x.op.accion + ':' + x.op.texto).join('|');
  if(caja.dataset.firma !== firma){
    caja.dataset.firma = firma;
    caja.innerHTML = ops.map(x => `<button type="button" class="hud-circulo icono${x.op.accion === 'ocultar' ? ' ocultar' : ''}" data-revelar-el="${esc(x.id)}" title="${esc(x.op.texto.replace(/^\S+\s*/, '') + ': ' + x.op.titulo)}" aria-label="${esc(x.op.texto)}">${x.op.accion === 'ocultar' ? '🙈' : '👁'}</button>`).join('');
  }
  const c = hexCentro(hexInfoCelda.col, hexInfoCelda.fila);
  caja.style.left = Math.round(c.x * vista.zoom + vista.x) + 'px';
  caja.style.top = Math.round(c.y * vista.zoom + vista.y) + 'px';
  // En ronda, arrancando arriba a la derecha (arriba y a la izquierda están el 🔒 y el ⚙ de una forma seleccionada).
  const r = HEX * vista.zoom + 18;
  [...caja.children].forEach((b, i) => {
    const ang = (-45 + i * 42) * Math.PI / 180;
    b.style.left = Math.round(Math.cos(ang) * r) + 'px'; b.style.top = Math.round(Math.sin(ang) * r) + 'px';
  });
  caja.hidden = false;
}

/* ---------- Tokens ---------- */
function revelarOpcionToken(t){
  if(!t || !fbUsuario) return null;
  const sigilo = enSigilo(t) && puedoCambiarEstados(t);
  return Revelar.token({oculto: !!t.oculto, sigilo}, {gm: soyGM, mio: !soyGM && sigilo});   // (puedoCambiarEstados: para un jugador, solo lo suyo)
}
// El botón, entre los del token (js/10 le pasa su `icono`).
function revelarHudIcono(t, icono){
  const op = revelarOpcionToken(t);
  return op && !op.enMenu ? icono('revelar', '👁', op.titulo, false) : '';   // (el de un token oculto por el GM: adentro del «⋯», el 🙈 de siempre)
}
async function revelarTokenAplicar(id){
  const t = tokens.get(id), op = revelarOpcionToken(t);
  if(!op) return;
  if(op.que === 'oculto'){ editarToken(id, {oculto: false}); return; }   // (lo mismo que el 🙈 del ⋯; mostrar un token de preparación no se anuncia)
  const e = estadoDe(t);
  const idx = e ? e.estados.findIndex(s => String((s && s.nombre) || '').trim().toLowerCase() === 'sigilo') : -1;
  if(idx < 0) return;
  const nombre = nombreDe(t);
  try{
    if(typeof sigiloRompiendo !== 'undefined'){ sigiloRompiendo.add(id); setTimeout(() => sigiloRompiendo.delete(id), 3000); }
    await hudEstadoCambiar(t, idx, 'quitar');
    const l = Revelar.linea(op, {gm: soyGM, nombre});
    if(l) sigiloAviso(l.origen, l.formula);
  }catch(err){ console.error('No se pudo sacar el sigilo:', err); toast('No se pudo revelar — sacale el estado Sigilo a mano'); }
}

/* ---------- ✋ Resolver a mano la tirada de detectar una trampa ---------- */
// ¿Esta tarjeta de la Crónica es una Percepción contra una trampa ya tirada? (el GM la puede corregir)
function revelarEsDeteccion(d){
  return !!(soyGM && d && (d.tipo === 'percepcion' || d.tipo === 'sigilo-pedido') && d.estado === 'listo' && d.datos && d.datos.trampaId);
}
function revelarBotonFeed(id, d){
  if(!revelarEsDeteccion(d)) return '';
  return `<div style="margin-top:6px"><button type="button" data-detectar-amano="${esc(id)}" style="font-size:12px;padding:3px 10px;border-radius:6px;border:1px solid #c98545;background:#2a2016;color:#f0c890;cursor:pointer" title="Si los dados no cuentan lo que pasó en la mesa: decidí vos si la detectó o no">✋ Resolver a mano</button></div>`;
}
// o = {momentoId, trampaId, detector, resultado (lo que dio el sistema), alResolver(detectada, textos)}
function revelarAManoAbrir(o){
  const el = elementos.get(o.trampaId);
  const nomT = el && el.trampaNombre && puedeVerElemento(el) ? ` («${el.trampaNombre}»)` : '';   // (una trampa de los jugadores que el GM todavía no ve: sin nombrarla hasta que decida)
  if(!el || el.disparada){ toast(el ? 'Esa trampa ya se disparó: la ven todos' : 'Esa trampa ya no está en el mapa'); return; }
  const resolver = async detectada => {
    AvisoCombate.cerrar();
    const tx = Revelar.aMano(detectada, {detector: o.detector, nombre: el.trampaNombre || ''});
    try{
      if(detectada){ if(!el.descubierta) await coleccionElementos().doc(o.trampaId).update({descubierta: true}); }
      else if(el.descubierta) await revelarOcultarTrampa(o.trampaId);
      if(o.momentoId) await momentoActualizar(o.momentoId, {resultado: tx.resultado, 'datos.aMano': detectada ? 'si' : 'no'});
      sigiloAviso(tx.origen, tx.formula);
      toast(detectada ? '✋ A mano: detectada. Ahora la ven todos' : '✋ A mano: no detectada. Sigue oculta');
      if(o.alResolver) o.alResolver(detectada, tx);
    }catch(err){
      console.error('No se pudo resolver a mano la detección:', err);
      toast(err && err.code === 'permission-denied' ? 'No se pudo: faltan pegar las reglas nuevas de Firestore' : 'No se pudo — revisá la consola');
    }
    pedirDibujo();
  };
  AvisoCombate.mostrar({clave: 'detectar-a-mano', icono: '✋', titulo: 'Detectar la trampa: resolver a mano',
    texto: `${o.detector || 'Alguien'} tiró Percepción contra una trampa${nomT}.${o.resultado ? ` El sistema dio: «${o.resultado}»` : ''} Ahora está ${el.descubierta ? 'a la vista de todos' : 'oculta'}. ¿Qué pasó en la mesa?`,
    botones: [{texto: '👁 La detectó', alClic: () => resolver(true), titulo: 'La trampa pasa a verse para todos. Sigue armada.'},
      {texto: '🙈 No la detectó', sec: true, alClic: () => resolver(false), titulo: 'La trampa queda (o vuelve a quedar) oculta.'}]});
}
function revelarAManoDeMomento(id){
  const v = momentosFeed.get(id), d = v && v.d;
  if(!revelarEsDeteccion(d)) return;
  revelarAManoAbrir({momentoId: id, trampaId: d.datos.trampaId, detector: d.datos.detector || '', resultado: d.resultado || ''});
}
// Cada pantalla: si el GM dijo «no la detectó», esta deja de verla aunque la hubiera descubierto (js/07 la recordaba en este navegador).
function revelarMomento(d){
  if(d && d.datos && d.datos.aMano === 'no' && d.datos.trampaId && typeof trampaOlvidar === 'function') trampaOlvidar(d.datos.trampaId);
}
