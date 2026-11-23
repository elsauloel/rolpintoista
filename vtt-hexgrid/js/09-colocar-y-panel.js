// js/09-colocar-y-panel.js — tramo 9 de 14 del script de mapa.html (paso 5, nivel A: mismo código, en el mismo orden): colocar un token nuevo, panel del costado, botón de mapas.
/* ---------- Colocar un token nuevo: lugar y orientación ----------
   "Poner en el mapa" ya no lo tira en el centro de la vista: primero se elige la
   casilla (clic) y después hacia dónde mira (se mueve el mouse y clic). Recién ahí
   se crea. Esc o clic derecho cancelan. Entretanto se ve una vista previa. */
let colocando = null;   // {datos, paso: 'lugar' | 'orientacion', celda, hover, rotacion}

function iniciarColocacion(datos){
  colocando = {datos, paso: 'lugar', celda: null, hover: null, rotacion: 0};
  creando = false;
  renderPanel(true);
  lienzo.style.cursor = 'crosshair';
  pedirDibujo();
}
function cancelarColocacion(avisar){
  if(!colocando) return;
  colocando = null;
  lienzo.style.cursor = 'default';
  if(avisar !== false) toast('Token cancelado: no se creó');
  pedirDibujo();
}
function colocacionMover(px, py){
  const m = pantallaAMundo(px, py);
  if(colocando.paso === 'lugar'){
    colocando.hover = mundoAHex(m.x, m.y);
  }else{
    const c = hexCentro(colocando.celda.col, colocando.celda.fila);
    const dx = m.x - c.x, dy = m.y - c.y;
    if(Math.hypot(dx, dy) > HEX * 0.3){
      // 0° = frente abajo, sentido horario (igual que el ↻ del HUD), a los 6 lados.
      const ang = Math.atan2(-dx, dy) * 180 / Math.PI;
      colocando.rotacion = (((Math.round(ang / 60) * 60) % 360) + 360) % 360;
    }
  }
  pedirDibujo();
}
function colocacionClic(px, py){
  const m = pantallaAMundo(px, py);
  if(colocando.paso === 'lugar'){
    colocando.celda = mundoAHex(m.x, m.y);
    colocando.paso = 'orientacion';
  }else{
    const d = colocando;
    colocando = null;
    lienzo.style.cursor = 'default';
    crearToken({...d.datos, col: d.celda.col, fila: d.celda.fila, rotacion: d.rotacion});
  }
  pedirDibujo();
}
// Cartel fijo que dice qué paso toca.
function actualizarAvisoColocacion(){
  const el = $('#colocando-aviso');
  // Mientras se elige una casilla (elegirDestino: el centro de un área, un teleport, el giro del Remolino…) el cartel es suyo: no esconderlo
  // (2026-10-13: lo escondía en el redibujo siguiente y no se veía qué hacer).
  if(!colocando){ if(!el.hidden && !elegirDestinoCb) el.hidden = true; return; }
  const txt = colocando.paso === 'lugar'
    ? `Poné a <b>${esc(colocando.datos.nombre)}</b>: elegí la casilla con un clic`
    : `Ahora elegí hacia dónde mira <b>${esc(colocando.datos.nombre)}</b>: movés el mouse y clic para confirmar`;
  const html = txt + ' <span>· Esc o clic derecho cancelan</span>';
  if(el.dataset.html !== html){ el.dataset.html = html; el.innerHTML = html; }
  el.hidden = false;
}

async function crearToken(datos){
  const vistaCentro = pantallaAMundo(anchoPx / 2, altoPx / 2);
  // Con lugar elegido (colocando) usa esa casilla y orientación; si no, el centro de la vista.
  const casilla = Number.isFinite(datos.col) ? {col: datos.col, fila: datos.fila} : mundoAHex(vistaCentro.x, vistaCentro.y);
  try{
    const doc = {
      nombre: datos.nombre,
      color: datos.color,
      tipo: datos.tipo,
      duenoUid: datos.duenoUid || fbUsuario.uid,
      col: casilla.col,
      fila: casilla.fila,
      creado: firebase.firestore.FieldValue.serverTimestamp(),
    };
    if(datos.fichaId) doc.fichaId = datos.fichaId;
    if(datos.imagen) doc.imagen = datos.imagen;
    if(datos.descripcion && !datos.fichaId) doc.descripcion = String(datos.descripcion).slice(0, TokensAuto.DESCRIPCION_MAX);   // ＋ Token suelto (2026-11-22)
    if(Number.isFinite(datos.rotacion) && datos.rotacion !== 0) doc.rotacion = datos.rotacion;
    // 📦 Token suelto paso a paso (2026-11-23): ¿ocupa lugar en la iniciativa? y su vida. Si las reglas publicadas son viejas (no conocen esos
    // campos), se pone igual sin ellos y se avisa (avisar antes que bloquear).
    const campos = !datos.fichaId && datos.campos ? datos.campos : null;
    let ref;
    try{ ref = await coleccionTokens().add(campos ? {...doc, ...campos} : doc); }
    catch(err){
      if(!campos || err.code !== 'permission-denied') throw err;
      ref = await coleccionTokens().add(doc);
      toast('El token se puso, pero sin lo de la iniciativa ni la vida: faltan pegar las reglas nuevas de Firestore (token suelto paso a paso). Avisale al GM');
    }
    creando = false;
    seleccionar(ref.id);
    if(doc.tipo === 'creep' && doc.fichaId) creepLlegoAlMapa(doc.fichaId);   // el creep pasa a este mapa (comun/creeps-mapas.js)
  }catch(err){
    console.error('No se pudo crear el token:', err);
    // ＋ Token suelto (2026-11-22): con descripción, si las reglas publicadas son viejas Firestore rechaza el token entero.
    toast('No se pudo crear el token' + (err.code !== 'permission-denied' ? '' : datos.descripcion ? ': faltan pegar las reglas nuevas de Firestore (descripción de los tokens sueltos). Avisale al GM, o probá sin descripción' : ' (sin permiso)'));
  }
}

async function editarToken(id, cambios){
  try{
    await coleccionTokens().doc(id).update(cambios);
    toast('Token guardado');
  }catch(err){
    console.error('No se pudo guardar el token:', err);
    // Barras y aura son campos nuevos del token: si las reglas publicadas en
    // Firebase son viejas, Firestore rechaza la escritura entera.
    const nuevos = Object.keys(cambios || {}).some(k => k === 'barras' || k === 'aura' || k === 'rotacion' || k === 'oculto');
    toast(err.code !== 'permission-denied' ? 'No se pudo guardar'
      : nuevos ? 'No se pudo guardar: faltan publicar las reglas nuevas de Firestore (consola → Firestore → Reglas)'
      : 'No se pudo guardar (sin permiso)');
  }
}

async function borrarToken(id){
  const t = tokens.get(id);
  if(!puedoBorrar(t)) return;
  if(!(await Confirmar.preguntar(`¿Sacar el token "${nombreDe(t)}" del mapa?`, {titulo: 'Sacar token', si: 'Sacar', peligro: true}))) return;
  try{
    const mapa = mapaMostrado;
    await coleccionTokens().doc(id).delete();
    // 🔗 Sacaste a un creep del tablero: ¿qué hacemos con él? (js/101, 2026-11-05)
    if(soyGM && t && t.tipo === 'creep' && t.fichaId && typeof creepTokenSacado === 'function') creepTokenSacado(t.fichaId, mapa, nombreDe(t));
  }catch(err){
    console.error('No se pudo borrar el token:', err);
    toast('No se pudo borrar el token');
  }
}

function escucharTokens(){
  escucharTokens.listo = false;
  const mapaDeEsteListener = mapaMostrado;   // 🔗 de qué mapa son estos tokens (js/101)
  cortarTokensListener = coleccionTokens().onSnapshot(snap => {
    const nuevosInv = [];
    snap.docChanges().forEach(ch => {
      if(ch.type === 'added' && escucharTokens.listo && soyGM) nuevosInv.push(ch.doc.id);   // una invocación nueva entra al orden de turnos (P161)
      // 🔗 Aparece el token de un creep en este mapa: GM Tools lo sigue (el creep queda en el mapa de su token; js/101, 2026-11-05).
      if(escucharTokens.listo && soyGM && typeof creepMapaRevisar === 'function' && ch.type === 'added'){
        const t = ch.doc.data();
        if(t && t.tipo === 'creep' && t.fichaId) creepMapaRevisar(t.fichaId, mapaDeEsteListener);
      }
      if(ch.type === 'removed'){
        // 🐝 Una invocación que se va del mapa (murió, se terminaron sus turnos, la sacaron) sale del orden de turnos (2026-11-23, P275): lo hace la
        // pantalla del GM, aunque el token lo haya borrado la del jugador (antes quedaba la fila «(token borrado)»). (js/54 temporalFueraDelOrden)
        const ido = tokens.get(ch.doc.id);
        if(escucharTokens.listo && soyGM && mapaDeEsteListener === mapaMostrado && ido && String(ido.fichaId || '').includes(SEP_INVOCACION) && typeof temporalFueraDelOrden === 'function'
          && typeof iniciativa !== 'undefined' && iniciativa.orden.some(o => o.id === ch.doc.id)) setTimeout(() => temporalFueraDelOrden(ch.doc.id), 0);
        tokens.delete(ch.doc.id); visibles.delete(ch.doc.id);
        if(seleccion === ch.doc.id) seleccion = null;
        return;
      }
      const d = ch.doc.data({serverTimestamps: 'estimate'});
      // Ruta nueva de otro (la propia ya se mostró al mover): estela unos segundos.
      const previo = tokens.get(ch.doc.id);
      if(ch.type === 'modified' && previo && (previo.col !== Math.round(num(d.col)) || previo.fila !== Math.round(num(d.fila)))) cerrarGirosLibres(ch.doc.id);   // otro token se movió: acción ajena
      const ruta = Array.isArray(d.ruta) ? d.ruta.map(v => Math.round(num(v))) : [];
      const rutaJson = JSON.stringify(ruta);
      if(ch.type === 'modified' && ruta.length > 2 && previo && previo.rutaJson !== rutaJson){
        const celdas = [];
        for(let i = 0; i + 1 < ruta.length; i += 2) celdas.push({col: ruta[i], fila: ruta[i + 1]});
        estelas.set(ch.doc.id, {celdas, hasta: Date.now() + ESTELA_MS});
        if(typeof contarCasilleros === 'function') contarCasilleros(ch.doc.id, celdas.length - 1, true);   // lo que se movió (Contra el que corre, js/35; el Paso fantasma lo guarda quien movió)
      }
      // 👻 Cambió de casilla sin camino nuevo (el Salto, el Dash, un empujón, el Mover libre): corta la cadena de pasos seguidos del Paso fantasma (js/07).
      else if(ch.type === 'modified' && previo && (previo.col !== Math.round(num(d.col)) || previo.fila !== Math.round(num(d.fila))) && typeof pasoFantasmaCortar === 'function') pasoFantasmaCortar(ch.doc.id);
      // 💧 Pasos en el agua (js/50): las ondas por donde pasó (con ruta, el camino; si no, la casilla nueva).
      if(ch.type === 'modified' && previo && typeof aguaPasos === 'function' && (previo.col !== Math.round(num(d.col)) || previo.fila !== Math.round(num(d.fila)))){
        const nueva = {col: Math.round(num(d.col)), fila: Math.round(num(d.fila))};
        if(ruta.length > 2 && previo.rutaJson !== rutaJson){ const cs = []; for(let i = 0; i + 1 < ruta.length; i += 2) cs.push({col: ruta[i], fila: ruta[i + 1]}); setTimeout(() => aguaPasos(ch.doc.id, cs), 0); }
        else setTimeout(() => aguaPasos(ch.doc.id, [nueva]), 0);
      }
      tokens.set(ch.doc.id, {
        rutaJson,
        nombre: String(d.nombre || '?'),
        color: d.color,
        tipo: d.tipo === 'creep' ? 'creep' : 'pj',
        duenoUid: d.duenoUid,
        fichaId: typeof d.fichaId === 'string' ? d.fichaId : '',
        col: Math.round(num(d.col)),
        fila: Math.round(num(d.fila)),
        creadoMs: d.creado && d.creado.toMillis ? d.creado.toMillis() : 0,
        // Ojo: lo que no se copie acá se pierde al volver de Firebase.
        aura: d.aura && typeof d.aura === 'object' ? d.aura : null,
        barras: d.barras && typeof d.barras === 'object' ? d.barras : null,
        imagen: typeof d.imagen === 'string' ? d.imagen : '',
        descripcion: typeof d.descripcion === 'string' ? d.descripcion : '',   // ＋ Token suelto (2026-11-22)
        // 📦 Token suelto paso a paso (2026-11-23): ¿ocupa lugar en la iniciativa? (sin el campo: la regla de siempre, OrdenTurnos.ocupaLugar) y su vida.
        ...(typeof d.iniciativa === 'boolean' ? {iniciativa: d.iniciativa} : {}),
        ...(Number.isFinite(d.hpMax) && d.hpMax > 0 ? {hpMax: Math.round(d.hpMax), hp: Math.round(num(d.hp))} : {}),
        rotacion: (((Math.round(num(d.rotacion) / 60) * 60) % 360) + 360) % 360,
        oculto: d.oculto === true,
        revelado: d.revelado === true,   // 🎭 los jugadores ya vieron a este creep (js/29)
        bajoTierra: d.bajoTierra === true,   // 🕳 bajo tierra (js/46)
        tunel: Array.isArray(d.tunel) ? d.tunel.map(Number) : null,   // 🕳 la estela del túnel (js/46)
      });
      if(d.pf && typeof pasoFantasmaRemoto === 'function') pasoFantasmaRemoto(ch.doc.id, d.pf);   // 👻 el Paso fantasma guardado en el token (js/07)
    });
    renderIniciativa();
    nuevosInv.forEach(id => { if(typeof invocacionAlOrden === 'function') invocacionAlOrden(id); });
    actualizarCabecera();   // el personaje principal es el de su token en este mapa
    const primeraVez = !escucharTokens.listo;
    escucharTokens.listo = true;
    if(primeraVez && !ajustarTamano.habiaVista) centrarEnMios();
    avisoSinTokenRevisar();   // 🎭 ¿tu personaje no tiene token en este mapa? (2026-11-20)
    renderTokensMenu(true);   // 👥 el panel, al día si está abierto (js/13)
    renderPanel();
    // Ojo (2026-09-22): la ruptura de sigilo vivía solo adentro de dibujar(), que se
    // dispara con requestAnimationFrame — en una pestaña de fondo (minimizada, otra
    // pestaña al frente) el navegador frena esos frames y la detección podía tardar
    // mucho en notarse aunque la posición ya hubiera llegado por Firebase. Se llama acá
    // también, directo desde la llegada del dato, así no depende de que se esté dibujando.
    sigiloRevisar();
    if(typeof oporLimpiar === 'function') oporLimpiar();   // ataque de oportunidad: los pares que ya no están pegados se renuevan (js/17)
    pedirDibujo();
  }, err => {
    console.error('Error escuchando los tokens:', err);
    mostrarAviso('No se pudieron leer los tokens. ¿Están publicadas las reglas nuevas de Firestore? (mirá la consola)');
  });
}

// Si una ficha no tiene miniatura publicada (el token quedaría con la inicial), se arma
// una desde su retrato (`fichas/{id}/partes/retrato`), una sola vez por sesión. Solo
// se guarda en memoria: no escribe nada.
const miniaturasLocales = new Map();   // fichaId -> data URL de 96 px
const miniaturasPedidas = new Set();
const miniaturasInvalidas = new Set(); // fichas cuya miniatura publicada no sirve (se usa la local)
// Busca la foto de la ficha: en su parte "retrato" y, si no está, en "general" (fichas viejas).
async function fotoDeFicha(fichaId){
  const leer = async parte => {
    const doc = await fbDb.doc(fbRutaCampana(`fichas/${fichaId}/partes/${parte}`)).get();
    return doc.exists ? String(doc.data().json || '') : '';
  };
  const crudo = await leer('retrato');
  if(crudo){
    let src = crudo;
    try{ const d = JSON.parse(crudo); src = typeof d === 'string' ? d : String((d && (d.miniatura || d.imagen)) || ''); }catch(e){}
    if(src.startsWith('data:')) return src;
  }
  const general = await leer('general');
  if(general){
    try{ const d = JSON.parse(general); const src = String((d && d.meta && (d.meta.miniatura || d.meta.imagen)) || ''); if(src.startsWith('data:')) return src; }catch(e){}
  }
  return '';
}
async function miniaturaDesdeRetrato(fichaId, forzar){
  if(miniaturasPedidas.has(fichaId) && !forzar) return;
  miniaturasPedidas.add(fichaId);
  try{
    const src = await fotoDeFicha(fichaId);
    if(!src){ console.warn('La ficha ' + fichaId + ' no tiene foto para armar la miniatura del token'); return; }
    const img = new Image();
    await new Promise((ok, ko) => { img.onload = ok; img.onerror = ko; img.src = src; });
    const lado = Math.min(img.naturalWidth, img.naturalHeight);
    if(!lado) return;
    const c = document.createElement('canvas');
    c.width = c.height = 96;
    c.getContext('2d').drawImage(img, (img.naturalWidth - lado) / 2, (img.naturalHeight - lado) / 2, lado, lado, 0, 0, 96, 96);
    const mini = c.toDataURL('image/jpeg', 0.8);
    miniaturasLocales.set(fichaId, mini);
    const f = fichasPub.get(fichaId);
    if(f && (!f.miniatura || miniaturasInvalidas.has(fichaId))) f.miniatura = mini;
    pedirDibujo();
  }catch(err){ console.warn('No se pudo armar la miniatura de la ficha ' + fichaId, err); miniaturasPedidas.delete(fichaId); }
}
// Una miniatura publicada que no carga (vacía, cortada o rota) se reemplaza por la del retrato.
function verificarMiniatura(fichaId, src){
  const rota = () => { miniaturasInvalidas.add(fichaId); miniaturaDesdeRetrato(fichaId, true); };
  if(typeof src !== 'string' || src.length < 200 || !src.startsWith('data:image')){ rota(); return; }
  const img = new Image();
  img.onerror = rota;
  img.src = src;
}

// Fichas de PJ y creeps: solo lo público (nombre, resumen, miniatura), para
// las barras, estados e imagen de los tokens vinculados.
function mostrarSubidaNivelMapa(nivel, nombre){
  let cap = document.getElementById('scrim-nivel-nuevo');
  if(!cap){
    cap = document.createElement('div');
    cap.id = 'scrim-nivel-nuevo';
    cap.style.cssText = 'position:fixed;inset:0;z-index:120;background:rgba(8,5,7,.78);display:flex;align-items:center;justify-content:center';
    cap.innerHTML = '<div style="background:var(--panel);border:1px solid var(--brass);border-radius:6px;padding:30px 34px;text-align:center;max-width:380px"><div style="font-size:54px">🎉</div><div style="font-family:Fraunces,serif;font-weight:900;font-size:28px;color:var(--brass);margin:8px 0" id="nivel-nuevo-titulo"></div><div style="color:var(--paper);margin-bottom:16px">¡Felicitaciones! Abrí tu ficha para repartir tus puntos nuevos.</div><button class="btn primary" id="nivel-nuevo-ok">¡Genial!</button></div>';
    document.body.appendChild(cap);
    cap.querySelector('#nivel-nuevo-ok').onclick = () => { cap.style.display = 'none'; };
  }
  cap.querySelector('#nivel-nuevo-titulo').textContent = `${nombre}: ¡subiste al nivel ${nivel}!`;
  cap.style.display = 'flex';
}

function escucharVinculables(){
  const escuchar = (coleccion, mapa, campos) => fbDb.collection(fbRutaCampana(coleccion)).onSnapshot(snap => {
    snap.docChanges().forEach(ch => {
      if(ch.type === 'removed'){ mapa.delete(ch.doc.id); return; }
      const d = ch.doc.data();
      const o = {};
      campos.forEach(k => { o[k] = d[k]; });
      o.nombre = String(d.nombre || '?');
      if(coleccion === 'fichas'){
        // Si sube de nivel un personaje mío (por ejemplo al cobrar la experiencia de un combate), pop-up de felicitación.
        const previo = mapa.get(ch.doc.id);
        if(previo && fbUsuario && d.duenoUid === fbUsuario.uid && previo.resumen && d.resumen && num(d.resumen.nivel) > num(previo.resumen.nivel) && num(previo.resumen.nivel) > 0){
          mostrarSubidaNivelMapa(num(d.resumen.nivel), o.nombre);
        }
        if(typeof sobrepesoFichaCambio === 'function') sobrepesoFichaCambio(ch.doc.id, previo, d);   // ⚖ el cartel «Tenés sobrepeso» del dueño (js/132)
        if((!o.miniatura || miniaturasInvalidas.has(ch.doc.id)) && miniaturasLocales.has(ch.doc.id)) o.miniatura = miniaturasLocales.get(ch.doc.id);
        if(!o.miniatura) miniaturaDesdeRetrato(ch.doc.id);
        else if(!miniaturasLocales.has(ch.doc.id) && !miniaturasInvalidas.has(ch.doc.id)) verificarMiniatura(ch.doc.id, o.miniatura);
      }
      // Tarjeta del creep (🪪, ver hudTarjetaHtml): el nombre del arma y de cada pieza de equipo (sin def/mods/detalle) y la nota.
      // La ficha del creep es privada del GM: esto lo publican aparte GM Tools y modificarCreep (CreepCalculo.tarjetaPublica).
      if(coleccion === 'creeps'){
        o.notas = String(d.notas || '').trim();
        o.armaNombre = String(d.armaNombre || '').trim();
        o.armaNatural = d.armaNatural === true;
        o.sinArma = d.sinArma === true;   // ✋ nada en la mano (paso 5)
        o.equipoNombres = Array.isArray(d.equipoNombres) ? d.equipoNombres.map(n => String(n || '').trim()).filter(Boolean) : [];
        o.manosNombres = Array.isArray(d.manosNombres) ? d.manosNombres.map(n => String(n || '').trim()).filter(Boolean) : [];   // lo de las manos (2026-10-17)
        o.tipoCriatura = String(d.tipoCriatura || '').trim();   // Matabestias de los arcos (js/35, 2026-10-11)
        o.revelado = d.revelado && typeof d.revelado === 'object' ? {...d.revelado} : {};   // 🎯 lo que los jugadores ya descubrieron (js/89, 2026-11-01)
        o.pasosSilenciosos = d.pasosSilenciosos === true;
        o.percepcionAumentada = d.percepcionAumentada === true;   // 👁 sin punto ciego para el sigilo (js/02, 2026-11-09)   // 👣 Pasos silenciosos (js/02, 2026-10-15)
        o.masDanoElem = d.masDanoElem && typeof d.masDanoElem === 'object' ? {...d.masDanoElem} : {};   // 💍 sus anillos elementales (js/53, 2026-11-10)
        o.auraMiedo = num(d.auraMiedo); o.auraEfEsp = num(d.auraEfEsp);   // 💀 la Calavera con vela (js/52, 2026-10-18)
        o.estandarteRadio = num(d.estandarteRadio); o.estandartePdg = num(d.estandartePdg); o.estandarteDano = num(d.estandarteDano); o.estandarteSilencio = num(d.estandarteSilencio); o.estandarteDe = String(d.estandarteDe || ''); o.estandarteDeId = String(d.estandarteDeId || ''); o.estandarteCon = String(d.estandarteCon || '');   // 🔍 (js/127)   // 🚩 el Estandarte de guerra y 🤐 el Tótem de silencio (js/73)
        o.meteoroCol = num(d.meteoroCol); o.meteoroFila = num(d.meteoroFila); o.meteoroRadio = num(d.meteoroRadio);   // ☄ la sombra del meteoro (js/74)
      }
      mapa.set(ch.doc.id, o);
    });
    renderIniciativa();   // el sigilo de un creep/personaje cambia si aparece en la lista
    if(coleccion === 'fichas') actualizarCabecera();   // el nombre del personaje principal
    if(coleccion === 'fichas'){ escucharVinculables.fichasListas = true; avisoSinTokenRevisar(); renderTokensMenu(true); }   // 🎭 ¿falta tu token? (2026-11-20)
    if(coleccion === 'fichas' && typeof sobrepesoIniRevisar === 'function') sobrepesoIniRevisar();   // ⚖ el GM acomoda el número de quien cambió de sobrepeso (js/132)
    try{ actualizarMuerteMapa(); }catch(err){ console.error('muerte en el mapa:', err); }
    renderPanel();
    sigiloRevisar();   // por si el estado Sigilo se aplicó/quitó a mano estando ya en un cono rival
    revisarAutoLentes();   // entrar en sigilo prende el modo lentes solo (no muestra todo de una)
    if(tableroAbierto) renderTablero();   // el HP/estados de las fichas o creeps del tablero cambió
    if(coleccion === 'creeps' && soyGM){ renderMapasMenu(true); if(!$('#tokens-menu').hidden) renderTokensMenu(); }   // cuántos creeps tiene cada mapa
    renderPolillaBoton();   // el estado «Polilla revoloteando» se aplicó/gastó (propio o desde otra pantalla)
    pedirDibujo();
  }, err => console.error(`Error escuchando ${coleccion}:`, err));
  escuchar('fichas', fichasPub, ['duenoUid', 'resumen', 'miniatura']);
  escuchar('creeps', creepsPub, ['orden', 'resumen', 'miniatura', 'tarjeta', 'imagenCompleta', 'mapa', 'color']);
}

function componerFondo(){
  const dato = fondoImagen || (fondoPos && fondoPos.dato) || '';
  if(!dato){ fondo = null; return; }
  const p = fondoPos || {};
  fondo = {
    dato,
    x: p.x !== undefined ? num(p.x) : -ANCHO_CASILLA / 2,
    y: p.y !== undefined ? num(p.y) : -HEX,
    ancho: num(p.ancho) || ANCHO_CASILLA * 20,
  };
}
/* 🏷 El nombre guardado en el token sigue al del creep o el personaje (2026-11-03, dueño: un token decía «Goblin híbrido» y su creep ya se
   llamaba «Goblin scout»). El token guarda su `nombre` al colocarse; si después se renombra el creep en GM Tools (o el personaje), el token
   quedaba con el viejo: el dibujo y la Mesa usan el del creep (nombreDe), pero el panel del token, los buscadores y los scripts, el viejo.
   La pantalla del GM pone al día el nombre de los tokens vinculados del mapa abierto.
   (2026-11-20, dueño: «estaría bueno que lo solucione la pantalla del jugador y que además el GM tenga permiso para modificarlo») La pantalla del
   jugador DUEÑO pone al día el nombre de los tokens de sus personajes en TODOS los mapas de la partida (`TokensAuto.nombresPonerAlDia`, comun/
   tokens-auto.js: una vez por personaje y por nombre; también al cambiarle el nombre). El GM también lo intenta con los tokens de personaje del
   mapa abierto: lo dejan las reglas nuevas (solo el campo `nombre`); mientras no estén pegadas en la consola, falla en silencio (sin error). */
const tokensNombreHecho = new Map();   // tokenId -> nombre ya escrito (para no repetir)
function tokensSincronizarNombres(){
  if(!fbDb || !fbUsuario || typeof coleccionTokens !== 'function' || typeof tokens === 'undefined') return;
  if(!soyGM){   // el jugador: sus personajes, en todos los mapas
    if(typeof TokensAuto === 'undefined' || !TokensAuto.nombresPonerAlDia || typeof fichasPub === 'undefined') return;
    fichasPub.forEach((f, fichaId) => { if(f && f.duenoUid === fbUsuario.uid) TokensAuto.nombresPonerAlDia({fichaId, nombre: f.nombre}).catch(() => {}); });
    return;
  }
  tokens.forEach((t, id) => {
    if(!t || !t.fichaId || !t.tipo) return;
    const v = vinculo(t), nombre = v && v.nombre && v.nombre !== '?' ? String(v.nombre).slice(0, 40) : '';
    if(!nombre || t.nombre === nombre || tokensNombreHecho.get(id) === nombre) return;
    if(t.tipo !== 'creep' && t.tipo !== 'pj') return;
    if(t.tipo === 'pj' && String(t.fichaId).includes(SEP_INVOCACION)) return;   // las invocaciones guardan su propio nombre
    tokensNombreHecho.set(id, nombre);
    // El de un personaje: si las reglas todavía no lo dejan (sin pegar), calla y no insiste (lo va a corregir la pantalla de su jugador).
    coleccionTokens().doc(id).update({nombre}).catch(err => { if(t.tipo === 'pj') return; tokensNombreHecho.delete(id); console.error('No se pudo poner al día el nombre del token:', err); });
  });
}
setInterval(() => { try{ tokensSincronizarNombres(); }catch(e){ console.error(e); } }, 5000);

function escucharFondo(){
  cortarFondo1 = fbDb.doc(fbRutaCampana(rutaMapaEstado('fondo'))).onSnapshot(doc => {
    if(arrastreFondo) return;
    fondoPos = doc.exists ? doc.data() : null;
    componerFondo();
    renderPanel();
    pedirDibujo();
  }, err => console.error('Error escuchando el fondo del mapa:', err));
  cortarFondo2 = fbDb.doc(fbRutaCampana(rutaMapaEstado('fondoImagen'))).onSnapshot(doc => {
    fondoImagen = doc.exists ? String(doc.data().dato || '') : '';
    componerFondo();
    renderPanel();
    pedirDibujo();
  }, err => console.error('Error escuchando la imagen de fondo:', err));
}

async function guardarFondo(cambios){
  try{
    await fbDb.doc(fbRutaCampana(rutaMapaEstado('fondo'))).set({...cambios, actualizado: firebase.firestore.FieldValue.serverTimestamp()}, {merge: true});
  }catch(err){
    console.error('No se pudo guardar el fondo:', err);
    toast(err.code === 'permission-denied' ? 'Solo el GM puede cambiar el fondo' : 'No se pudo guardar el fondo');
  }
}

// Imagen propia de un token que no está vinculado a una ficha ni a un creep
// (NPC, objetos, etc.): un cuadrado chico para que entre en el documento
// del token, con el recorte (elegir zoom y qué parte se ve) armado por
// comun/recorte-imagen.js — ver también token-etiqueta y HUD.
const TOKEN_IMG_PX = 96;
const TOKEN_IMG_MAX = 60000;   // tope que aceptan las reglas
async function elegirImagenToken(id){
  const entrada = $('#token-imagen-archivo');
  entrada.onchange = async ev => {
    const file = ev.target.files[0];
    ev.target.value = '';
    if(!file) return;
    try{
      const dato = await recortarImagen(file, {lado: TOKEN_IMG_PX, tope: TOKEN_IMG_MAX});
      await editarToken(id, {imagen: dato});
    }catch(err){
      if(err.message === 'cancelado') return;
      console.error('No se pudo preparar la imagen del token:', err);
      toast(err.message === 'no-image' ? 'Eso no es una imagen' : 'No se pudo usar esa imagen');
    }
  };
  entrada.click();
}

function prepararImagenFondo(file){
  return new Promise((res, rej) => {
    if(!file.type || !file.type.startsWith('image/')){ rej(new Error('no-image')); return; }
    const lector = new FileReader();
    lector.onerror = () => rej(lector.error);
    lector.onload = () => {
      const img = new Image();
      img.onerror = () => rej(new Error('bad-image'));
      img.onload = () => {
        let lado = 2000, calidad = 0.82, dato = '';
        for(let i = 0; i < 8; i++){
          const escala = Math.min(1, lado / Math.max(img.naturalWidth, img.naturalHeight));
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.naturalWidth * escala);
          canvas.height = Math.round(img.naturalHeight * escala);
          const c = canvas.getContext('2d');
          c.fillStyle = '#17121A'; c.fillRect(0, 0, canvas.width, canvas.height);
          c.drawImage(img, 0, 0, canvas.width, canvas.height);
          dato = canvas.toDataURL('image/jpeg', calidad);
          if(dato.length < 900000) break;
          lado = Math.round(lado * 0.8); calidad = Math.max(0.6, calidad - 0.05);
        }
        dato.length < 900000 ? res(dato) : rej(new Error('muy-grande'));
      };
      img.src = lector.result;
    };
    lector.readAsDataURL(file);
  });
}

// Textura de fondo de un elemento de Terreno/Formas: se achica pero no
// se recorta (no es cuadrada, cubre la caja del elemento como "cover"
// al dibujarla — ver cajaCeldas).
const ELEMENTO_IMG_LADO = 1200, ELEMENTO_IMG_MAX = 120000;
function prepararImagenElemento(file){
  return new Promise((res, rej) => {
    if(!file.type || !file.type.startsWith('image/')){ rej(new Error('no-image')); return; }
    const lector = new FileReader();
    lector.onerror = () => rej(lector.error);
    lector.onload = () => {
      const img = new Image();
      img.onerror = () => rej(new Error('bad-image'));
      img.onload = () => {
        let lado = ELEMENTO_IMG_LADO, calidad = 0.8, dato = '';
        for(let i = 0; i < 8; i++){
          const escala = Math.min(1, lado / Math.max(img.naturalWidth, img.naturalHeight));
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.naturalWidth * escala);
          canvas.height = Math.round(img.naturalHeight * escala);
          const c = canvas.getContext('2d');
          c.drawImage(img, 0, 0, canvas.width, canvas.height);
          dato = canvas.toDataURL('image/jpeg', calidad);
          if(dato.length < ELEMENTO_IMG_MAX) break;
          lado = Math.round(lado * 0.8); calidad = Math.max(0.55, calidad - 0.06);
        }
        dato.length < ELEMENTO_IMG_MAX ? res(dato) : rej(new Error('muy-grande'));
      };
      img.src = lector.result;
    };
    lector.readAsDataURL(file);
  });
}

$('#fondo-archivo').onchange = async ev => {
  const file = ev.target.files[0];
  ev.target.value = '';
  if(!file) return;
  toast('Preparando la imagen…');
  try{
    const dato = await prepararImagenFondo(file);
    // Si no había fondo, arranca con la esquina en la casilla 0,0 y 20 casillas de ancho.
    const base = fondo ? {x: fondo.x, y: fondo.y, ancho: fondo.ancho} : {x: -ANCHO_CASILLA / 2, y: -HEX, ancho: ANCHO_CASILLA * 20};
    const ts = firebase.firestore.FieldValue.serverTimestamp();
    const lote = fbDb.batch();
    lote.set(fbDb.doc(fbRutaCampana(rutaMapaEstado('fondoImagen'))), {dato, actualizado: ts});
    // La posición en su propio documento (y sin la imagen, si era un fondo de antes).
    lote.set(fbDb.doc(fbRutaCampana(rutaMapaEstado('fondo'))), {...base, dato: firebase.firestore.FieldValue.delete(), actualizado: ts}, {merge: true});
    await lote.commit();
    toast('Fondo cargado');
  }catch(err){
    console.error('No se pudo cargar el fondo:', err);
    toast(err.message === 'muy-grande' ? 'La imagen es demasiado pesada' : 'No se pudo usar esa imagen');
  }
};

function escucharMiembros(){
  fbDb.collection(fbRutaCampana('miembros')).onSnapshot(snap => {
    miembros.clear();
    snap.docs.forEach(d => miembros.set(d.id, {nombre: String(d.data().nombre || '?'), gm: d.data().gm === true}));
    const yo = miembros.get(fbUsuario.uid);
    if(yo){ fbMiembro = {...fbMiembro, ...yo}; soyGM = yo.gm; }
    bnPintarInterruptor();
    renderModo();
    actualizarCabecera();
    renderPanel();
    pedirDibujo();
  }, err => console.error('Error escuchando miembros:', err));
}

/* ---------- Panel del costado ---------- */

let firmaPanel = '';

function seleccionar(id){
  if(seleccion === id && !creando) return;
  const habiaBotonera = !$('#botonera-capa').hidden && botonera.lista && !botonera.completa;
  if(seleccion !== id){ editandoToken = false; moverLibre = null; hudCerrar(); hudNivel = 'vital'; }
  seleccion = id;
  if(id){ creando = false; trazoSeleccionado = null; elementoSeleccionado = null; }
  renderPanel();
  pedirDibujo();
  // Botonera o Acciones abiertas y se elige otro token que también tiene la suya: la ventana cambia sola a ese token.
  if(habiaBotonera && id && botoneraDeToken(tokens.get(id))) abrirBotoneraDeSeleccion();
}

function trazoSeleccionar(id){
  if(trazoSeleccionado === id) return;
  if(typeof trazoCfgCerrar === 'function') trazoCfgCerrar();   // el ⚙ del dibujo anterior (js/34)
  trazoSeleccionado = id;
  if(id){ if(seleccion) seleccionar(null); elementoSeleccionado = null; }
  pedirDibujo();
}

function elementoSeleccionar(id){
  if(elementoSeleccionado === id) return;
  if(editandoElemento && editandoElemento.id !== id) cerrarEditorElemento(true);
  elementoSeleccionado = id;
  if(id){ if(seleccion) seleccionar(null); trazoSeleccionado = null; }
  pedirDibujo();
}

function htmlColores(elegido, habilitado){
  return '<div class="colores">' + COLORES.map(c =>
    `<button type="button" class="color${c.toLowerCase() === String(elegido).toLowerCase() ? ' elegido' : ''}" data-color="${c}" style="background:${c}" ${habilitado ? '' : 'disabled'} title="${c}"></button>`
  ).join('') + '</div>';
}

function conectarColores(caja, alElegir){
  caja.querySelectorAll('[data-color]').forEach(b => b.onclick = () => {
    caja.querySelectorAll('[data-color]').forEach(x => x.classList.toggle('elegido', x === b));
    alElegir(b.dataset.color);
  });
}

// Opciones para vincular un token: los personajes propios (jugador) o los
// creeps (GM), según el tipo de token.
// todasLasFichas: el GM armando el token de otro jugador ve las fichas de
// todos (con el nombre de su dueño al lado), no solo las suyas propias.
function opcionesVinculo(tipo, elegido, todasLasFichas){
  let lista;
  if(tipo === 'creep'){
    lista = [...creepsPub.entries()].sort((a, b) => num(a[1].orden) - num(b[1].orden));
  }else{
    // Cada personaje (propio, o todos si todasLasFichas) y, debajo, sus invocaciones.
    lista = [];
    [...fichasPub.entries()]
      .filter(([, f]) => todasLasFichas || f.duenoUid === fbUsuario.uid)
      .sort((a, b) => a[1].nombre.localeCompare(b[1].nombre, 'es'))
      .forEach(([id, f]) => {
        const dueno = todasLasFichas ? nombreMiembro(f.duenoUid) : '';
        lista.push([id, {...f, nombre: dueno ? `${f.nombre} — ${dueno}` : f.nombre}]);
        ((f.resumen && f.resumen.invocaciones) || []).forEach(inv => {
          lista.push([id + SEP_INVOCACION + inv.id, {nombre: `   ↳ ${inv.nombre || 'Invocación'} (invocación de ${f.nombre})`}]);
        });
      });
  }
  const enMapa = new Set([...tokens.values()].map(t => t.fichaId).filter(Boolean));
  const opcion = ([id, v]) => `<option value="${esc(id)}"${id === elegido ? ' selected' : ''}>${esc(v.nombre)}${enMapa.has(id) && id !== elegido ? ' (ya en el mapa)' : ''}</option>`;
  if(tipo === 'creep'){
    // Por mapa (comun/creeps-mapas.js): primero los de este mapa, después la Reserva y los demás mapas. Elegir uno de otro mapa lo
    // muda a este (creepLlegoAlMapa).
    const ids = new Set([...mapasLista.keys(), MAPA_PRINCIPAL]);
    const porMapa = new Map();
    lista.forEach(e => { const m = CreepsMapas.mapaDe(e[1], ids); if(!porMapa.has(m)) porMapa.set(m, []); porMapa.get(m).push(e); });
    const orden = [mapaMostrado, CreepsMapas.RESERVA, ...CreepsMapas.ordenar(mapasLista).map(m => m.id)].filter((m, i, a) => a.indexOf(m) === i && porMapa.has(m));
    const titulo = m => m === mapaMostrado ? `En este mapa (${nombreMapa(m)})` : m === CreepsMapas.RESERVA ? 'Reserva (en ningún mapa)' : `En «${nombreMapa(m)}» (se muda a este)`;
    return '<option value="">Sin vincular</option>' + orden.map(m =>
      `<optgroup label="${esc(titulo(m))}">${porMapa.get(m).map(opcion).join('')}</optgroup>`).join('');
  }
  return '<option value="">Sin vincular</option>' + lista.map(opcion).join('');
}

// Lista de miembros para elegir dueño de un token de tipo "pj" (igual
// formato que el selector de "Cambiar dueño" del panel de edición).
function opcionesDueno(elegido){
  return [...miembros.entries()].map(([uid, m]) =>
    `<option value="${esc(uid)}"${uid === elegido ? ' selected' : ''}>${esc(m.nombre)}${m.gm ? ' (GM)' : ''}</option>`
  ).join('');
}

// Barras y estados en el panel. De los PJ se ven los números (su ficha es
// visible para todos); de los creeps, solo cuán llena está la barra.
// Vida y SP desde el mapa, guardados en la ficha o en el creep, así los ve
// cambiados la ficha, gm-tools, el tablero y los demás. Los PJ los cambia
// su dueño; los creeps, el GM (lo imponen las reglas).
function puedoCambiarVida(t){
  if(t && TokensAuto.sueltoVida(t)) return !!fbUsuario && !pausaSoloMirar() && (soyGM || t.duenoUid === fbUsuario.uid);   // 📦 un token suelto con vida: quien lo puso y el GM (2026-11-23)
  if(!t || !t.fichaId || !fbUsuario || pausaSoloMirar()) return false;   // ⏸ en pausa, solo mirar (js/04)
  if(t.tipo === 'creep') return soyGM && creepsPub.has(t.fichaId);
  const v = vinculo(t);
  return !!v && ((!soyGM && v.duenoUid === fbUsuario.uid && !controlAjeno(t.fichaId)) || controloFicha(t.fichaId));   // 🎮 con el control del GM, su dueño solo mira
}
// Estados alterados (agregar, sacar, cambiar turnos, editar): el dueño en su personaje y el GM en TODOS (2026-09-24, pedido
// del dueño); los creeps, el GM. La vida de un personaje sigue siendo solo de su dueño.
function puedoCambiarEstados(t){
  if(!t || !t.fichaId || !fbUsuario || pausaSoloMirar()) return false;
  if(t.tipo === 'creep') return soyGM && creepsPub.has(t.fichaId);
  const v = vinculo(t);
  return !!v && (soyGM || (v.duenoUid === fbUsuario.uid && !controlAjeno(t.fichaId)));
}

// "12" fija el valor; "+5" / "-3" suma o resta. null si no se entiende.
// Firebase (plan gratis) corta todo cuando se pasa de la cuota del día (20.000 escrituras / 50.000 lecturas): el error crudo dice "quota exceeded".
const CUOTA_AGOTADA_TXT = 'Se acabó la cuota gratis de Firebase por hoy (se renueva sola de madrugada, ~4 a.m. de Argentina). Hasta entonces no se puede guardar nada.';
function esCuotaAgotada(err){ return !!err && (err.code === 'resource-exhausted' || /quota/i.test(String(err.message || ''))); }
function leerValorVital(texto, actual){
  const crudo = String(texto || '').trim().replace(',', '.').replace('−', '-');
  const m = crudo.match(/^([+-])\s*(\d+(?:\.\d+)?)$/);
  if(m) return actual + parseFloat(m[2]) * (m[1] === '-' ? -1 : 1);
  if(/^\d+(?:\.\d+)?$/.test(crudo)) return parseFloat(crudo);
  return null;
}
const ERROR_TIPEO = 'tipeo';

// Mismo hash que gm-tools usa para la firma del creep (gmHash): al cambiar
// la firma, gm-tools se da cuenta y trae el creep actualizado.
function hashGm(s){
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for(let i = 0; i < s.length; i++){
    const ch = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

// Cambia el creep completo (parte privada) en una transacción y pone al día
// su resumen público y la firma. Devuelve lo que devuelva cambiar(sc).
async function modificarCreep(creepId, cambiar){
  const base = fbDb.doc(fbRutaCampana(`creeps/${creepId}`));
  const privRef = base.collection('privado').doc('ficha');
  return fbDb.runTransaction(async tx => {
    const [priv, pub] = await Promise.all([tx.get(privRef), tx.get(base)]);
    if(!priv.exists || !pub.exists) throw new Error('El creep ya no existe');
    const sc = CreepCalculo.normalizar(JSON.parse(priv.data().json || '{}'));   // 🗡 convertido (paso 8): lo que se guarda queda en la forma nueva
    const hpAntes = num(sc.hp);
    const resultado = cambiar(sc);
    // 💀 Si con este cambio cayó (la vida pasó a 0), se le van los estados (P257, 2026-11-21: «al momento de morir se le eliminan todos los estados
    // alterados»; queda lo del equipo y la Llama de Fénix sin usar, el criterio de Combatiente.quedaAlVolver).
    { const sac = Combatiente.caerSiCayo(sc, 'estados', hpAntes);   // (el mismo corte que GM Tools, P270)
      if(sac.length) setTimeout(() => creepCaidaContar(creepId, sc.nombre, sac), 0); }
    CreepCalculo.vidaAlDia(sc);   // ❤ si el cambio tocó el equipo o un estado con Vida +N (2026-11-06)
    const hpMax = num(sc.hpMax);
    const json = JSON.stringify(sc);
    // La firma es hash(creep)-hash(imagen); la imagen no cambia.
    const firmaVieja = String(pub.data().firma || '');
    const parteImagen = firmaVieja.includes('-') ? firmaVieja.slice(firmaVieja.indexOf('-') + 1) : hashGm('');
    tx.set(privRef, {json});
    tx.update(base, {
      mapa: String(sc.mapa || '').slice(0, 80),   // en qué mapa está (comun/creeps-mapas.js)
      'resumen.hpPct': hpMax > 0 ? Math.round(Math.max(0, Math.min(1, sc.hp / hpMax)) * 100) : 0,
      'resumen.spPct': CreepCalculo.spPct(sc) ?? firebase.firestore.FieldValue.delete(),   // 💧 la barra de SP, en modo SP (2026-10-29)
      'resumen.muerto': sc.hp <= 0,
      'resumen.opor': CreepCalculo.oportunidadPosible(sc),   // ataque de oportunidad (2026-10-02)
      'resumen.sinOpor': CreepCalculo.sinOportunidad(sc),
      'resumen.expuesto': Combatiente.expuesto(sc.estados),   // Expuesto (Degollar, 2026-10-10)   // su arma no sirve de oportunidad (un arco, 2026-10-09)
      ...CreepCalculo.tarjetaPublica(sc),   // la 🪪: nombres del arma y del equipo, y la nota (lo mismo que publica GM Tools)
      'resumen.estados': (Array.isArray(sc.estados) ? sc.estados : [])
        .filter(e => e && e.activo !== false && e.nombre).slice(0, 30)
        .map(e => ({
          nombre: String(e.nombre).slice(0, 60), turnos: num(e.turnos), permanente: !!e.permanente, ...Combatiente.hastaPub(e), ...(e.invulnerable ? {invulnerable: true} : {}), ...((e.escudoMagicoActual !== undefined || num(e.escudoMagico) > 0) ? {escudo: num(e.escudoMagicoActual ?? e.escudoMagico), ...(e.excedenteVida ? {excedente: true, ...(e.excedenteTope ? {tope: num(e.excedenteTope)} : {})} : {escudoMax: num(e.escudoMagico)})} : {}), ...(e.armaduraRota ? {armaduraRota: true, stacks: Math.max(1, num(e.stacks) || 1)} : {}),
          ...(e.vigilancia ? {vigilancia: Math.max(1, Math.round(num(CreepCalculo.alcance(sc))))} : {}),   // 👁 Vigilancia: el alcance del disparo (js/58)
          ...Combatiente.atrapaPub(e),   // 🕸 la telaraña o la red, encima del token (js/68)
          ...(e.marcado ? {marcado: true} : {}),   // ⚡ brilla y se lo ve en la niebla (el Rayo cargado, 2026-10-24)
          ...(e.escudoElemental ? {escudoElemental: String(e.escudoElemental).slice(0, 20), escudoEsp: Math.round(Number(e.escudoEsp) || 0), escudoDe: String(e.escudoDe || '').slice(0, 80)} : {}),   // 🛡 Escudo elemental (js/106): el Ef.Esp de quien lo tiró
          ...(e.protege ? {protege: String(e.protege).slice(0, 80)} : {}),   // 🛡 el Escudo humano: a quién protege (el lazo de js/95, para todas las pantallas)
          polaridad: e.polaridad === 'buff' || e.polaridad === 'debuff' ? e.polaridad : '',
        })),
      firma: hashGm(json) + '-' + parteImagen,
      actualizado: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return resultado;
  });
}

// 💀 El creep que cayó y perdió sus estados: lo cuenta en la Mesa (si los jugadores lo ven) o solo en esta pantalla (P257).
function creepCaidaContar(creepId, nombre, sacados){
  const txt = Combatiente.caidaTxt(nombre, sacados);
  if(!txt) return;
  let t = null; for(const x of tokens.values()) if(x.tipo === 'creep' && x.fichaId === creepId){ t = x; break; }
  const publico = !!t && !t.oculto && (typeof creepConocido !== 'function' || creepConocido(t)) && !(typeof enSigilo === 'function' && enSigilo(t));
  if(publico){ try{ mesaLinea(txt, 'recordatorio'); }catch(e){} }
  else toast(txt);
}
async function cambiarVidaCreep(creepId, texto, clave){
  await modificarCreep(creepId, sc => {
    if(clave === 'sp'){   // 💧 el SP de un creep en modo SP, a mano desde el token (2026-10-29): entre 0 y su máximo
      const nuevoSp = leerValorVital(texto, CreepCalculo.spActual(sc));
      if(nuevoSp === null) throw new Error(ERROR_TIPEO);
      sc.sp = Math.max(0, Math.min(CreepCalculo.spMax(sc), nuevoSp));
      return;
    }
    const hpMax = num(sc.hpMax);
    const nuevo = leerValorVital(texto, num(sc.hp));
    if(nuevo === null) throw new Error(ERROR_TIPEO);
    sc.hp = Math.max(0, hpMax > 0 ? Math.min(hpMax, nuevo) : nuevo);
  });
}

async function cambiarVidaPj(t, clave, texto, levantar){   // levantar: a mano, deja de estar inconsciente (sin Titilando)
  const [fichaId, invId] = t.fichaId.split(SEP_INVOCACION);
  const base = fbDb.doc(fbRutaCampana(`fichas/${fichaId}`));
  const parteRef = base.collection('partes').doc(invId ? 'invocaciones' : 'general');
  const ts = firebase.firestore.FieldValue.serverTimestamp();
  await fbDb.runTransaction(async tx => {
    const [parte, ficha] = await Promise.all([tx.get(parteRef), tx.get(base)]);
    if(!parte.exists || !ficha.exists) throw new Error('La ficha todavía no se guardó en la mesa');
    const datos = JSON.parse(parte.data().json || '{}');
    const r = ficha.data().resumen || {};
    const cambios = {actualizado: ts};
    if(invId){
      const inv = (datos.invocaciones || []).find(i => i && i.id === invId);
      if(!inv) throw new Error('La invocación ya no existe');
      const nuevo = leerValorVital(texto, num(inv.hp));
      if(nuevo === null) throw new Error(ERROR_TIPEO);
      inv.hp = Math.max(0, num(inv.hpMax) > 0 ? Math.min(num(inv.hpMax), nuevo) : nuevo);
      cambios['resumen.invocaciones'] = (r.invocaciones || []).map(i => i.id === invId ? {...i, hp: inv.hp} : i);
    }else if(clave === 'hp'){
      const hpMax = num(r.hpMax);
      const nuevo = leerValorVital(texto, num(datos.hp));
      if(nuevo === null) throw new Error(ERROR_TIPEO);
      datos.hp = Math.max(0, hpMax > 0 ? Math.min(hpMax, nuevo) : nuevo);
      cambios['resumen.hp'] = datos.hp;
      if(levantar && datos.hp > 0 && datos.muerto && datos.muerto.activo && !datos.muerto.definitivo){ datos.muerto = {activo: false, turnos: 5, definitivo: false}; cambios['resumen.muerto'] = false; }
    }else{
      // SP disponible = máximo - gastado (igual que en la ficha).
      const {spMax, campoGastado, campoResumen} = spDeResumen(r);
      const nuevo = leerValorVital(texto, spMax - num(datos[campoGastado]));
      if(nuevo === null) throw new Error(ERROR_TIPEO);
      const sp = Math.min(spMax, nuevo);
      datos[campoGastado] = spMax - sp;
      cambios[campoResumen] = sp;
    }
    tx.set(parteRef, {json: JSON.stringify(datos), actualizado: ts});
    tx.update(base, cambios);
  });
}

// 📜 Historial (comun/historial.js): cada segundo se le pasan los creeps con token para que anote cambios de HP y de estados.
// Si gm-tools está abierto en otra pestaña, solo una de las dos registra (turno en localStorage).
setInterval(() => {
  if(!soyGM || typeof historialObservarCreeps !== 'function' || window.parent !== window) return;
  historialObservarCreeps([...creepsPriv.entries()].filter(([, e]) => e && e.sc).map(([id, e]) => ({
    id, nombre: e.sc.nombre, hp: e.sc.hp,
    publico: [...tokens.values()].some(t => t.tipo === 'creep' && t.fichaId === id && (typeof visibleParaJugadores === 'function' ? visibleParaJugadores(t) : !t.oculto && !enSigilo(t))),   // lo ven los jugadores AHORA (con la niebla y las nubes, 2026-11-20)
    estados: (Array.isArray(e.sc.estados) ? e.sc.estados : []).filter(x => x && x.activo !== false && x.nombre).map(x => ({nombre: x.nombre, turnos: num(x.turnos)})),
  })));
}, 1000);

function creepPrivadoDe(creepId){
  const e = creepsPriv.get(creepId);
  return e ? e.sc : null;
}

// GM: escucha la parte privada de cada creep que tiene token en el mapa
// (vida con números y No2 para cobrar al moverlo). Deja de escuchar los
// que ya no están.
function actualizarEscuchasCreeps(){
  const queridos = new Set(soyGM && fbDb
    ? [...tokens.values()].filter(t => t.tipo === 'creep' && t.fichaId).map(t => t.fichaId)
    : []);
  creepsPriv.forEach((e, id) => {
    if(queridos.has(id)) return;
    e.cortar();
    creepsPriv.delete(id);
  });
  queridos.forEach(id => {
    if(creepsPriv.has(id)) return;
    const e = {sc: null, cortar: null};
    creepsPriv.set(id, e);
    e.cortar = fbDb.doc(fbRutaCampana(`creeps/${id}/privado/ficha`)).onSnapshot(doc => {
      let sc = null;
      try{ sc = doc.exists ? JSON.parse(doc.data().json || '{}') : null; }catch(err){}
      if(sc) try{ CreepCalculo.normalizar(sc); }catch(err){ console.error('No se pudo leer el creep:', err); }   // 🗡 convertido, como en GM Tools (paso 8)
      e.sc = sc;
      renderPanel();
      if(ac && ac.creepId === id && !ac.host.hidden) acDibujar();   // ⚗ las Acciones nuevas de ese creep, al día
      flCreepCambio(id);   // y su ficha lite, si está abierta (js/15)
    }, err => console.error('Error leyendo el creep:', err));
  });
}

// Ayuda del (?) de la barra del costado: cómo se mueven los tokens y la guía de colores de los bordes.
function actualizarAyudaToken(){
  const item = (color, texto) => `<span><i style="border-color:${color}"></i>${texto}</span>`;
  // El GM no suele tener tokens de personaje propios: el dorado solo
  // aparece en su leyenda si tiene alguno.
  const gmConPropios = soyGM && [...tokens.values()].some(x => claseToken(x) === 'propio');
  const ayuda = soyGM
    ? 'Tocá un token para ver de quién es. Vos movés los creeps y los NPC arrastrándolos; los personajes los mueve cada jugador. ' +
      'En modo combate los creeps gastan sus No2 al moverse (si se pasan, te pide confirmar); los NPC se mueven sin costo. Con el switch de arriba pasás de modo narrativo a combate para toda la mesa. '
    : 'Tocá un token para ver de quién es. Arrastrá los tuyos para moverlos: la estela marca la ruta casillero por casillero. En modo combate tus personajes gastan No2 al moverse (si te pasás, te pide confirmar); en modo narrativo, no. ';
  const leyenda = soyGM
    ? (gmConPropios ? item(BORDE.propio, 'Tuyos') : '') + item(BORDE.creep, 'Creeps') + item(BORDE.npc, 'NPC') + item(BORDE.jugador, 'Jugadores')
    : item(BORDE.propio, 'Tuyos') + item(BORDE.jugador, 'Otros jugadores') + item(BORDE.creep, 'Creeps') + item(BORDE.npc, 'NPC');
  $('#ayuda-token-globo').innerHTML =
    ayuda +
    'Arrastrá el fondo para desplazarte y usá la rueda o −/+ para el zoom.' +
    '<span class="leyenda">' + leyenda + '</span>';
}

function renderPanel(forzar){
  renderMapasMenu(forzar);
  const panel = $('#panel-token');
  const t = seleccion ? tokens.get(seleccion) : null;
  actualizarEscuchasCreeps();
  const clave = JSON.stringify([creando, seleccion, editandoToken]);
  const v = t ? vinculo(t) : null;
  const opciones = (creando || t) ? [
    [...fichasPub.entries()].filter(([, f]) => f.duenoUid === (fbUsuario && fbUsuario.uid)).map(([id, f]) => id + f.nombre + JSON.stringify(((f.resumen && f.resumen.invocaciones) || []).map(i => [i.id, i.nombre]))),
    [...creepsPub.entries()].map(([id, c]) => id + c.nombre),
  ] : null;
  const firma = clave + '|' + JSON.stringify([
    t && [t.nombre, t.color, t.tipo, t.duenoUid, t.col, t.fichaId, t.fila],
    v && [v.nombre, v.resumen],
    opciones, soyGM, [...miembros.entries()], !!fbMiembro,
    t && t.tipo === 'creep' && (s => s && [s.hp, s.hpMax, s.nitros])(creepPrivadoDe(t.fichaId)),
  ]);
  if(!forzar){
    if(firma === firmaPanel) return;
    // Si sigue abierto el mismo panel, no pisar lo que alguien está
    // escribiendo o eligiendo.
    const mismoPanel = firmaPanel.startsWith(clave + '|');
    if(mismoPanel && (creando || panel.contains(document.activeElement))) return;
  }
  firmaPanel = firma;
  actualizarAyudaToken();
  renderNiebla();
  renderOjo();
  $('#caja-mantenimiento').hidden = !soyGM;
  $('#toolkit-tienda').hidden = !fbMiembro;   // jugadores: comprar y vender; GM: abre el generador de tiendas
  $('#toolkit-tienda').title = soyGM ? 'Tienda: abrir el generador de tiendas (en otra pestaña) para armar, publicar y abrir o cerrar la tienda' : 'Tienda: abrir la tienda que publicó el GM y comprar o vender (cerrada, se puede mirar, pero no comprar ni vender)';
  actualizarBotonMapas();

  // Los datos del token se ven en los controles flotantes (HUD): el panel
  // del costado queda solo con Token (?) y la configuración de los dados.
  panel.innerHTML = '';   // (la ayuda de los tokens vive en el (?) de la barra de arriba: actualizarAyudaToken)
}

/* ---------- Editar token, paso a paso en la ventana común (comun/paso-a-paso.js, 2026-10-02, tanda 6 de docs/plan-paso-a-paso.md) ----------
   Vinculado a → Cómo se ve (nombre y color) → Dueño (GM, solo un personaje). Guardar siempre; «Sacar del mapa» en el pie. */
let editarTokenPap = null;
function abrirEditarToken(id){
  const t = tokens.get(id);
  if(!t) return;
  if(TokensAuto.esSuelto(t) && fbUsuario && TokensAuto.sueltoPuedeEditar(t, fbUsuario.uid, soyGM)){ abrirTokenSuelto(id); return; }   // ＋ Token suelto: nombre, descripción, imagen (2026-11-22)
  if(editarTokenPap) editarTokenPap.cerrar();
  editandoToken = true;
  const v = vinculo(t), editable = puedoMover(t);
  const tipoTxt = t.tipo === 'creep' ? (t.fichaId ? 'creep' : 'NPC') : (v && v.invocacion ? 'invocación' : 'personaje');
  const st = {vinculo: t.fichaId || '', nombre: t.nombre || '', color: t.color, dueno: t.duenoUid || ''};
  const conDueno = soyGM && t.tipo === 'pj';
  const pasos = [
    ...(editable ? [
      {id: 'cual', nombre: 'Vinculado a', ayuda: `<b>¿De qué ficha saca sus datos?</b> Vinculado, toma el nombre, la imagen, las barras y los estados${t.tipo === 'creep' ? ' del creep (si es de otro mapa, se muda a este)' : ' de la ficha'}. Sin vincular es un ${t.tipo === 'creep' ? 'NPC u objeto' : 'token suelto'}.`,
        html: () => `<div class="pap-campo"><label>Vinculado a</label><select id="te-vinculo" size="12" style="width:100%">${opcionesVinculo(t.tipo, st.vinculo)}</select></div>`},
      {id: 've', nombre: 'Cómo se ve', ayuda: '<b>Nombre y color.</b> El nombre solo cuenta si no está vinculado; el color se ve si no tiene imagen.',
        html: () => `<div class="pap-campo"><label>Nombre</label><input id="te-nombre" maxlength="40" value="${esc(st.nombre)}"></div><div class="pap-campo"><label>Color</label>${htmlColores(st.color, true)}</div>`,
        alMontar: (c, a) => conectarColores(a.raiz, col => { st.color = col; })},
    ] : [{id: 'info', nombre: 'Token', ayuda: '<b>Este token no lo movés vos.</b>', html: () => `<p style="font-size:15px;margin:0"><b>${esc(nombreDe(t))}</b></p><p class="pap-nota">Casilla ${t.col}, ${t.fila}</p>`}]),
    ...(conDueno ? [{id: 'dueno', nombre: 'Dueño', ayuda: '<b>¿Quién lo mueve?</b> Para cuando alguien cambió de cuenta.',
      html: () => `<div class="pap-campo"><label>Dueño</label><select id="te-dueno">${opcionesDueno(st.dueno)}</select></div>`}] : []),
  ];
  const cerrado = () => { editarTokenPap = null; editandoToken = false; renderPanel(true); pedirDibujo(); };
  async function guardar(){
    const cambios = {};
    if(editable){
      const vv = st.vinculo ? vinculo({tipo: t.tipo, fichaId: st.vinculo}) : null;
      const nombre = (st.nombre.trim() || (vv ? vv.nombre : '')).slice(0, 40);
      if(!nombre){ api.irA('ve'); api.aviso('El token necesita un nombre'); return false; }
      Object.assign(cambios, {nombre, color: st.color, fichaId: st.vinculo ? st.vinculo : firebase.firestore.FieldValue.delete()});
    }
    if(conDueno && st.dueno && st.dueno !== t.duenoUid) cambios.duenoUid = st.dueno;
    if(Object.keys(cambios).length) await editarToken(id, cambios);
    if(editable && t.tipo === 'creep' && st.vinculo && st.vinculo !== t.fichaId) creepLlegoAlMapa(st.vinculo);   // vinculado a un creep de otro mapa: se muda acá
    cerrado();
  }
  const api = editarTokenPap = PasoAPaso.abrir({
    titulo: `Editar token · ${tipoTxt} · ${nombreDe(t)}`, crear: false, z: 95,
    pasos,
    alInput: e => { if(e.target.id === 'te-nombre') st.nombre = e.target.value; },
    alCambio: e => {
      if(e.target.id === 'te-vinculo'){ st.vinculo = e.target.value; const vv = st.vinculo ? vinculo({tipo: t.tipo, fichaId: st.vinculo}) : null; if(vv) st.nombre = String(vv.nombre || '').slice(0, 40); }
      else if(e.target.id === 'te-dueno') st.dueno = e.target.value;
    },
    alTecla: e => { if(e.key === 'Enter' && e.target.id === 'te-nombre'){ e.preventDefault(); guardar().then(r => { if(r !== false && api.abierto()) api.cerrar(); }); } },
    confirmarCancelar: '',
    alGuardar: () => guardar(),
    alCancelar: () => cerrado(),
    extras: puedoBorrar(t) ? [{id: 'borrar', texto: 'Sacar del mapa', alClic: () => { api.cerrar(); cerrado(); borrarToken(id); }}] : [],
  });
}

/* ---------- 🗺 Mapas: botón del borde izquierdo (solo GM) ----------
   Mapas guardados (ver, publicar, renombrar, borrar, cuántos creeps tiene y traer sus tokens, + Nuevo mapa) y el fondo del mapa que se está mirando.
   Vive en un menú al costado del botón, como el de 🎭 Tokens: la barra lateral (donde se ve la Mesa) no se usa para menús. */
let mapasMenuFirma = '';
// 🖼 (2026-11-03, maqueta aprobada por el dueño): el fondo se edita adentro de la tarjeta del mapa; acá, de cuál está abierto (solo en memoria).
let mapasFondoAbierto = '';
// «hoy», «ayer», «hace 3 días», «hace 2 semanas», «hace 4 meses».
function haceTxt(ms){
  const dias = Math.floor((Date.now() - ms) / 864e5);
  if(dias < 1) return 'hoy';
  if(dias < 2) return 'ayer';
  if(dias < 14) return `hace ${dias} días`;
  if(dias < 60) return `hace ${Math.floor(dias / 7)} semanas`;
  return `hace ${Math.floor(dias / 30)} meses`;
}
function mapaUsoTxt(id){
  if(id === mapaActivo) return 'Lo están viendo los jugadores';
  if(mapasUsos[id]) return `Último uso: ${haceTxt(mapasUsos[id])}`;
  const c = (mapasLista.get(id) || {}).creadoMs;
  return c ? `Creado ${haceTxt(c)} · sin uso registrado` : 'Sin uso registrado';
}
function renderMapasMenu(forzar){
  const menu = $('#mapas-menu'), boton = $('#toolkit-mapas');
  if(!menu || !boton) return;
  if(!soyGM || !fbMiembro) mapasMenuAbierto = false;
  menu.hidden = !mapasMenuAbierto;
  boton.classList.toggle('activo', mapasMenuAbierto);
  if(!mapasMenuAbierto) return;
  if(mapasFondoAbierto && mapasFondoAbierto !== mapaMostrado && mapasFondoAbierto !== mapaEligiendoGM) mapasFondoAbierto = '';   // pasó a ver otro mapa: se cierra
  if(!forzar && menu.contains(document.activeElement) && menu.innerHTML) return;   // no pisar lo que se está escribiendo
  // Arriba el publicado (en verde); después, del más usado últimamente al menos usado (mapaUsoMs, js/01).
  const filas = [MAPA_PRINCIPAL, ...[...mapasLista.keys()].filter(id => id !== MAPA_PRINCIPAL)]
    .sort((a, b) => mapaUsoMs(b) - mapaUsoMs(a))
    .map(id => {
      const viendo = id === mapaMostrado, activo = id === mapaActivo, fondoAbierto = viendo && mapasFondoAbierto === id;
      return `<div class="mapa-fila${viendo ? ' viendo' : ''}${activo ? ' activo' : ''}">
        <span class="mapa-nombre">${esc(nombreMapa(id))}${activo ? ' <b>· en juego</b>' : ''}${viendo ? ' <span class="mapa-viendo-tag">LO ESTÁS VIENDO</span>' : ''}</span>
        <div class="mapa-uso">${esc(mapaUsoTxt(id))}</div>
        <div class="fila" style="margin-top:4px">
          ${viendo ? '' : `<button type="button" class="btn" data-mapa-ver="${esc(id)}">Ver</button>`}
          ${activo ? '' : `<button type="button" class="btn primary" data-mapa-publicar="${esc(id)}">Publicar</button>`}
          <button type="button" class="btn" data-mapa-renombrar="${esc(id)}" title="Renombrar">✎</button>
          <button type="button" class="btn${fondoAbierto ? ' on' : ''}" data-mapa-fondo="${esc(id)}" title="${viendo ? 'Fondo de este mapa' : 'Ver este mapa y editar su fondo'}">🖼</button>
          ${id === MAPA_PRINCIPAL ? '' : `<button type="button" class="btn peligro" data-mapa-borrar="${esc(id)}" title="Borrar">✕</button>`}
        </div>
        ${fondoAbierto ? fondoMapaHtml(id) : ''}
        ${creepsDeMapaHtml(id)}
      </div>`;
    }).join('');
  const html =
    '<div class="fila" style="margin:0 0 8px;justify-content:space-between"><h2>🗺 Mapas</h2><button type="button" class="btn primary" id="mapa-nuevo">+ Nuevo mapa</button></div>' +
    '<p class="ayuda" style="margin-top:0">"Ver" cambia lo que estás mirando vos, para ir armándolo. "Publicar" cambia lo que ven los jugadores. 🖼 edita el fondo de ese mapa.</p>' +
    filas;
  if(!forzar && html === mapasMenuFirma) return;
  mapasMenuFirma = html;
  menu.innerHTML = html;
  conectarMapasMenu(menu);
}
// El bloque del fondo, adentro de la tarjeta del mapa que se está viendo (los mismos ids de siempre: #fondo-cargar, #fondo-ancho…).
function fondoMapaHtml(id){
  const casillas = fondo ? Math.round(fondo.ancho / ANCHO_CASILLA * 10) / 10 : 20;
  return '<div class="mapa-fondo"><h3>🖼 Fondo de ' + esc(nombreMapa(id)) + '</h3>' +
    '<div class="fila" style="margin-top:8px">' +
      `<button type="button" class="btn primary" id="fondo-cargar">${fondo ? 'Cambiar imagen' : 'Cargar imagen'}</button>` +
      (fondo ? '<button type="button" class="btn peligro" id="fondo-quitar">Quitar</button>' : '') +
    '</div>' +
    (fondo
      ? `<label class="etiqueta">Ancho, en casillas</label><div class="fila" style="margin-top:0"><input id="fondo-ancho" type="number" min="1" max="400" step="0.5" value="${casillas}"><button type="button" class="btn" id="fondo-ancho-ok">Aplicar</button></div>` +
        `<label class="fila" style="cursor:pointer"><input type="checkbox" id="fondo-mover" style="width:auto"${moverFondo ? ' checked' : ''}> Arrastrar el fondo con el mouse</label>` +
        '<p class="ayuda" style="margin-top:6px">Con esa casilla tildada, arrastrar un lugar vacío mueve la imagen para acomodarla a la grilla. Destildala para volver a desplazar la vista.</p>'
      : '<p class="ayuda" style="margin-top:8px">La imagen se achica sola para que entre en la mesa. Todos la ven debajo de la grilla. Después de cargarla, acá mismo vas a poder cambiarle el ancho (en casillas) y moverla con el mouse para acomodarla a la grilla.</p>') +
    '</div>';
}
function conectarMapasMenu(menu){
  menu.querySelectorAll('[data-mapa-fondo]').forEach(b => b.onclick = () => {
    const id = b.dataset.mapaFondo;
    if(id !== mapaMostrado){ mapasFondoAbierto = id; verMapa(id); renderMapasMenu(true); return; }   // primero pasa a verlo
    mapasFondoAbierto = mapasFondoAbierto === id ? '' : id;
    if(!mapasFondoAbierto) moverFondo = false;
    renderMapasMenu(true);
  });
  menu.querySelectorAll('[data-mapa-ver]').forEach(b => b.onclick = () => verMapa(b.dataset.mapaVer));
  menu.querySelectorAll('[data-mapa-publicar]').forEach(b => b.onclick = () => publicarMapa(b.dataset.mapaPublicar));
  menu.querySelectorAll('[data-mapa-renombrar]').forEach(b => b.onclick = () => renombrarMapa(b.dataset.mapaRenombrar));
  menu.querySelectorAll('[data-mapa-borrar]').forEach(b => b.onclick = () => borrarMapa(b.dataset.mapaBorrar));
  menu.querySelectorAll('[data-mapa-traer]').forEach(b => b.onclick = () => traerCreepsDelMapa(b.dataset.mapaTraer));
  menu.querySelectorAll('[data-mapa-botin]').forEach(b => b.onclick = () => abrirBotinEstimadoMapa(b.dataset.mapaBotin));
  $('#mapa-nuevo').onclick = crearMapa;
  if($('#fondo-cargar')) $('#fondo-cargar').onclick = () => $('#fondo-archivo').click();
  if($('#fondo-quitar')) $('#fondo-quitar').onclick = async () => {
    if(!(await Confirmar.preguntar('¿Quitar la imagen de fondo del mapa?', {titulo: 'Quitar fondo', si: 'Quitar', peligro: true}))) return;
    try{
      const lote = fbDb.batch();
      lote.delete(fbDb.doc(fbRutaCampana(rutaMapaEstado('fondo'))));
      lote.delete(fbDb.doc(fbRutaCampana(rutaMapaEstado('fondoImagen'))));
      await lote.commit();
      moverFondo = false;
    }
    catch(err){ console.error(err); toast('No se pudo quitar el fondo'); }
  };
  if($('#fondo-ancho-ok')) $('#fondo-ancho-ok').onclick = () => {
    const n = num($('#fondo-ancho').value);
    if(n < 1 || n > 400){ toast('Poné un ancho entre 1 y 400 casillas'); return; }
    fondo.ancho = n * ANCHO_CASILLA;
    pedirDibujo();
    guardarFondo({ancho: fondo.ancho});
  };
  if($('#fondo-mover')) $('#fondo-mover').onchange = e => { moverFondo = e.target.checked; };
}
function abrirMapasMenu(abrir){
  if(abrir && !(soyGM && fbMiembro)) return;
  mapasMenuAbierto = abrir;
  if(abrir){ abrirTokensMenu(false); creando = false; seleccion = null; }
  else moverFondo = false;
  renderMapasMenu(true);
  renderPanel(true);
  pedirDibujo();
}
$('#toolkit-mapas').onclick = e => { e.stopPropagation(); abrirMapasMenu(!mapasMenuAbierto); };
$('#mapas-menu').addEventListener('click', e => e.stopPropagation());
// Solo se cierra con el mismo botón o con Esc: mientras se acomoda el fondo hay que poder tocar el mapa con el menú abierto.
document.addEventListener('keydown', e => { if(e.key === 'Escape' && mapasMenuAbierto && !editandoElemento && !moverLibre && !herramientaActiva && !colocando && !creando) abrirMapasMenu(false); });

/* ---------- 🎭 Poner tu personaje en el mapa: un solo camino (2026-11-20) ----------
   Dueño: «lo del botón de personajes y el botón de tokens es poco claro». El botón «🎭 Ponerlo en el mapa» del panel 👥 Personajes y tokens
   (js/13; desde el 2026-11-22 es la única lista: se fueron el 👥 de la cabecera y el «⬇ Traer a … ya» del 🎭) y el cartel que sale al entrar a un mapa donde tu personaje no tiene token hacen LO MISMO: `ponerPersonajeEnMapa`
   (elegís la casilla con un clic y hacia dónde mira). Quiénes faltan: `TokensAuto.sinToken` (comun/tokens-auto.js).
   Lo único que hoy limita a un jugador para poner su token es ser miembro de la partida (`fbMiembro`): si no lo es, no se ofrece nada. */
function misPersonajesSinToken(){
  if(!fbMiembro || !fbUsuario) return [];
  return TokensAuto.sinToken(fichasPub.entries(), tokens.values(), fbUsuario.uid);
}
// `fichaId` puede ser una invocación (`<fichaId>~<invId>`). El token queda del dueño del personaje: si lo pone el GM, a nombre del jugador
// (2026-11-22, panel 👥 Personajes y tokens). Un jugador solo pone los suyos (las reglas de Firestore no le dejan otra cosa).
function ponerPersonajeEnMapa(fichaId, color){
  const base = String(fichaId || '').split(SEP_INVOCACION)[0];
  const f = fichasPub.get(base);
  const v = vinculo({tipo: 'pj', fichaId});
  if(!f || !v || !fbMiembro || !fbUsuario) return false;
  if(!soyGM && f.duenoUid !== fbUsuario.uid){ toast(`${f.nombre} no es tuyo: lo pone su jugador o el GM`); return false; }
  if([...tokens.values()].some(t => t.fichaId === fichaId)){ toast(`${v.nombre} ya está en este mapa`); return false; }
  if(tokenNuevoPap){ const w = tokenNuevoPap; tokenNuevoPap = null; w.cerrar(); }
  avisoSinTokenCerrar();
  iniciarColocacion({nombre: String(v.nombre || 'Personaje').slice(0, 40), color: color || COLORES[Math.floor(Math.random() * COLORES.length)], tipo: 'pj', fichaId, imagen: '',
    duenoUid: f.duenoUid || fbUsuario.uid});
  return true;
}
// El cartel: sale solo al ENTRAR al mapa (una vez por mapa en cada entrada: si dijo «Ahora no» no insiste hasta que vuelva a entrar), nunca al GM, y se va solo si
// el token aparece (lo puso él o se lo trajo el GM). Lo revisan la llegada de los tokens y la de las fichas.
const avisoSinTokenVistos = new Set();   // mapas donde ya se ofreció en esta entrada
let avisoSinTokenMapa = null;            // el mapa del cartel que está en pantalla
function avisoSinTokenCerrar(){
  avisoSinTokenMapa = null;
  const el = $('#sin-token-aviso'); if(el){ el.hidden = true; el.innerHTML = ''; }
}
function avisoSinTokenRevisar(){
  const el = $('#sin-token-aviso'); if(!el) return;
  if(avisoSinTokenMapa !== null && (avisoSinTokenMapa !== mapaMostrado || !misPersonajesSinToken().length)){ avisoSinTokenCerrar(); }
  if(soyGM || !fbMiembro || !escucharTokens.listo || !escucharVinculables.fichasListas) return;
  if(avisoSinTokenMapa !== null || avisoSinTokenVistos.has(mapaMostrado)) return;
  avisoSinTokenVistos.add(mapaMostrado);   // se mira UNA vez, al entrar: si después el GM le saca el token (o muere), no sale un cartel de la nada
  const faltan = misPersonajesSinToken();
  if(!faltan.length || colocando || creando) return;
  avisoSinTokenMapa = mapaMostrado;
  el.innerHTML = `<span class="sta-txt">${faltan.length === 1 ? `<b>${esc(faltan[0][1].nombre)}</b> todavía no está en este mapa.` : esc(TokensAuto.sinTokenTexto(faltan.map(x => x[1].nombre)))}</span>` +
    faltan.map(([id, f]) => `<button type="button" class="btn primary chico" data-sta-poner="${esc(id)}">🎭 ${faltan.length === 1 ? 'Ponerlo ahora' : 'Poner a ' + esc(f.nombre)}</button>`).join('') +
    '<button type="button" class="btn chico" data-sta-no="1">Ahora no</button>';
  el.hidden = false;
}
document.addEventListener('click', e => {
  const b = e.target.closest('#sin-token-aviso button'); if(!b) return;
  if(b.dataset.staPoner) ponerPersonajeEnMapa(b.dataset.staPoner);
  else{ avisoSinTokenCerrar(); toast('Cuando quieras: el 👥 del borde izquierdo → «🎭 Ponerlo en el mapa»'); }
});

let tokenNuevoPap = null;
function cancelarNuevoToken(){
  if(!creando) return;
  creando = false;
  if(tokenNuevoPap){ const v = tokenNuevoPap; tokenNuevoPap = null; v.cerrar(); }
  renderPanel(true); pedirDibujo();
}
/* ---------- ＋ Token suelto (2026-11-22, dueño: «que a los jugadores también se les ofrezca la opción de agregar un token suelto. Que le puedan
   cargar una imagen, un nombre y una descripción») ----------
   Un token sin ficha ni creep: un NPC, un cofre, un objeto. Para todos (jugadores y GM), desde el panel 👥 Personajes y tokens (js/13). Tres pasos
   (2026-11-23): 1) nombre, descripción, imagen y color; 2) ¿ocupa lugar en la iniciativa? (`iniciativa`); 3) ¿tiene vida? (`hp`/`hpMax`: se lo puede
   atacar, js/13 `sueltoHooksDuelo` y `dueloAplicarDano`; su círculo de vida, js/10). Al crear, se elige la casilla y hacia dónde mira (iniciarColocacion). El de un jugador es tipo 'pj' sin
   ficha (lo mueve él, borde de los suyos); el del GM, tipo 'creep' sin ficha (un NPC, borde gris), como siempre. La descripción la lee cualquiera:
   al pasar el mouse por el token (js/30) y en su tarjeta 🪪 (js/10). `editId`: editar uno que ya está (lo edita y lo borra quien lo puso y el GM:
   TokensAuto.sueltoPuedeEditar; las reglas de Firestore dejan al GM tocar nombre, descripción, imagen y color de uno de un jugador). */
function abrirTokenSuelto(editId){
  if(!fbMiembro || !fbUsuario) return;
  const t0 = editId ? tokens.get(editId) : null;
  if(editId && !(t0 && TokensAuto.sueltoPuedeEditar(t0, fbUsuario.uid, soyGM))){ toast('Ese token no lo podés editar: lo editan quien lo puso y el GM'); return; }
  if(tokenNuevoPap) tokenNuevoPap.cerrar();
  if(!t0){ creando = true; seleccion = null; moverFondo = false; renderPanel(true); pedirDibujo(); }
  const vida0 = t0 ? TokensAuto.sueltoVida(t0) : null;
  // 📦 (2026-11-23) Uno nuevo arranca en «No» y «No» (dueño: «esto es para objetos inanimados»; P305). Uno de antes, sin el campo, ocupaba lugar: «Sí».
  const st = {nombre: t0 ? t0.nombre : '', descripcion: t0 ? (t0.descripcion || '') : '', imagen: t0 ? (t0.imagen || '') : '', color: t0 ? t0.color : COLORES[Math.floor(Math.random() * COLORES.length)],
    iniciativa: t0 ? t0.iniciativa !== false : false, conVida: !!vida0, hpMax: vida0 ? vida0.max : 10};
  const MAX = TokensAuto.DESCRIPCION_MAX;
  const pasos = [{id: 've', nombre: 'Cómo es', ayuda: '<b>Un token sin ficha:</b> un NPC, un cofre, un objeto, una marca. La descripción la puede leer cualquiera de la mesa: al pasar el mouse por el token y en su tarjeta 🪪.',
    html: () => `<div class="pap-campo"><label>Nombre</label><input type="text" id="ts-nombre" maxlength="40" placeholder="Ej: Cofre de la bodega" value="${esc(st.nombre)}"></div>` +
      `<div class="pap-campo"><label>Descripción (opcional)</label><textarea id="ts-desc" rows="4" maxlength="${MAX}" placeholder="Qué es, cómo se ve, qué se nota al mirarlo…">${esc(st.descripcion)}</textarea><p class="pap-nota" id="ts-cuenta">${st.descripcion.length} / ${MAX}</p></div>` +
      '<div class="pap-campo"><label>Imagen (opcional)</label><div class="pap-fila" style="align-items:center">' +
        (st.imagen ? `<img src="${esc(st.imagen)}" alt="" style="width:48px;height:48px;border-radius:50%;object-fit:cover;border:2px solid ${esc(st.color)}">` : '') +
        `<button type="button" class="pap-boton" data-ts-img="elegir">${st.imagen ? 'Cambiar imagen' : 'Elegir imagen'}</button>` +
        (st.imagen ? '<button type="button" class="pap-boton" data-ts-img="quitar">Quitar</button>' : '') + '</div></div>' +
      `<div class="pap-campo"><label>Color (se ve si no tiene imagen)</label>${htmlColores(st.color, true)}</div>`,
    alMontar: (c, a) => { conectarColores(a.raiz, col => { st.color = col; }); const n = a.raiz.querySelector('#ts-nombre'); if(n && !t0) setTimeout(() => n.focus(), 30); }},
    // 📦 Paso a paso (2026-11-23, dueño: «¿Ocupa lugar en la iniciativa? Sí / No»; «¿El token tiene HP? Sí / No»).
    {id: 'ini', nombre: 'Iniciativa', ayuda: '<b>¿Ocupa lugar en la iniciativa?</b> Si decís que sí, cuando el GM arma el orden de turnos entra como uno más (con su turno). Un objeto que no hace nada (un cofre, una puerta, un barril) va mejor afuera.',
      html: () => sueltoSiNo('ini', st.iniciativa, '🎲 Sí: tiene su turno en el orden', '🪨 No: queda afuera del orden de turnos')},
    {id: 'vida', nombre: 'Vida', ayuda: '<b>¿El token tiene vida (HP)?</b> Si tiene, se lo puede elegir como objetivo de un ataque y el golpe le baja la vida. Y hasta ahí: no tiene Defensa, ni estados, ni se defiende: su Evasión es 1 (el mínimo), sin tirar.',
      html: () => sueltoSiNo('vida', st.conVida, '❤ Sí: tiene vida y se lo puede atacar', '— No: no tiene vida') +
        (st.conVida ? `<div class="pap-campo" style="margin-top:12px"><label>¿Cuánta vida tiene?</label><input type="number" id="ts-hp" min="1" max="${TokensAuto.VIDA_MAX}" step="1" value="${esc(String(st.hpMax))}" style="max-width:140px">` +
          `<p class="pap-nota">${vida0 ? `Ahora le quedan ${vida0.hp} de ${vida0.max}. Si bajás el máximo, la vida no pasa del nuevo.` : 'Arranca con la vida llena. Al llegar a 0 queda roto (sigue en el mapa: lo saca quien lo puso o el GM).'}</p></div>` : '')}];
  function sueltoSiNo(clave, valor, si, no){
    const b = (v, txt) => `<button type="button" class="pap-boton" data-ts-sino="${clave}:${v ? 'si' : 'no'}" style="${valor === v ? 'border-style:solid;background:rgba(201,133,69,.35);color:#fff' : 'opacity:.75'}">${valor === v ? '✔ ' : ''}${txt}</button>`;
    return `<div class="pap-fila">${b(true, si)}${b(false, no)}</div>`;
  }
  const cerrado = () => { tokenNuevoPap = null; if(!t0){ creando = false; renderPanel(true); } pedirDibujo(); };
  async function guardar(){
    const n = TokensAuto.sueltoNorm(st);
    if(n.falta){ api.aviso(n.falta); return false; }
    const cambios = {nombre: n.nombre, color: st.color, descripcion: n.descripcion || firebase.firestore.FieldValue.delete(), imagen: st.imagen || firebase.firestore.FieldValue.delete()};
    const {poner, quitar} = TokensAuto.sueltoCampos(n, t0);
    const extra = {...poner}; quitar.forEach(k => { extra[k] = firebase.firestore.FieldValue.delete(); });
    try{ await coleccionTokens().doc(editId).update({...cambios, ...extra}); toast('Token guardado'); }
    catch(err){
      console.error('No se pudo guardar el token suelto:', err);
      if(err.code !== 'permission-denied'){ toast('No se pudo guardar'); return false; }
      // 📦 Reglas viejas (no conocen la iniciativa ni la vida): se guarda igual lo de antes y se avisa.
      try{ await coleccionTokens().doc(editId).update(cambios); toast('Se guardó el nombre, la descripción y la imagen, pero no lo de la iniciativa ni la vida: faltan pegar las reglas nuevas de Firestore (token suelto paso a paso). Avisale al GM'); }
      catch(err2){ console.error('No se pudo guardar el token suelto (sin lo nuevo):', err2); toast('No se pudo guardar: faltan pegar las reglas nuevas de Firestore (tokens sueltos). Avisale al GM'); return false; }
    }
    cerrado();
  }
  const api = tokenNuevoPap = PasoAPaso.abrir({
    titulo: t0 ? `Editar token suelto · ${t0.nombre}` : '＋ Token suelto', crear: !t0, z: 95, ancho: 760, textoCrear: '✔ Poner en el mapa',
    pasos,
    alClic: e => {
      const b = e.target.closest('button'); if(!b) return;
      if(b.dataset.tsSino){ const [k, v] = b.dataset.tsSino.split(':'); if(k === 'ini') st.iniciativa = v === 'si'; else st.conVida = v === 'si'; api.redibujar(); return; }
      if(b.dataset.tsImg === 'quitar'){ st.imagen = ''; api.redibujar(); return; }
      if(b.dataset.tsImg === 'elegir'){
        const entrada = $('#token-imagen-archivo');
        entrada.onchange = async ev => {
          const file = ev.target.files[0];
          ev.target.value = '';
          if(!file) return;
          try{ st.imagen = await recortarImagen(file, {lado: TOKEN_IMG_PX, tope: TOKEN_IMG_MAX}); if(tokenNuevoPap === api) api.redibujar(); }
          catch(err){
            if(err.message === 'cancelado') return;
            console.error('No se pudo preparar la imagen del token:', err);
            toast(err.message === 'no-image' ? 'Eso no es una imagen' : 'No se pudo usar esa imagen');
          }
        };
        entrada.click();
      }
    },
    alInput: e => {
      if(e.target.id === 'ts-nombre') st.nombre = e.target.value;
      if(e.target.id === 'ts-hp') st.hpMax = e.target.value;
      if(e.target.id === 'ts-desc'){ st.descripcion = e.target.value; const c = api.raiz.querySelector('#ts-cuenta'); if(c) c.textContent = `${st.descripcion.length} / ${MAX}`; }
    },
    alTecla: e => {
      if(e.key !== 'Enter' || e.target.id !== 'ts-nombre') return;
      e.preventDefault();
      if(t0){ guardar(); return; }
      if(!String(st.nombre || '').trim()){ api.aviso('Ponele un nombre.'); return; }
      api.irA('ini');   // 📦 al crear, Enter pasa al paso siguiente (2026-11-23)
    },
    confirmarCancelar: '',
    alCrear: () => { const n = TokensAuto.sueltoNorm(st); if(n.falta){ api.aviso(n.falta); return false; } poner(n); },
    alGuardar: () => guardar(),
    alCancelar: () => cerrado(),
    extras: t0 && puedoBorrar(t0) ? [{id: 'borrar', texto: 'Sacar del mapa', alClic: () => { api.cerrar(); cerrado(); borrarToken(editId); }}] : [],
  });
  function poner(n){
    tokenNuevoPap = null;
    iniciarColocacion({nombre: n.nombre, color: st.color, tipo: soyGM ? 'creep' : 'pj', fichaId: '', imagen: st.imagen, descripcion: n.descripcion, campos: TokensAuto.sueltoCampos(n, null).poner});
  }
}

