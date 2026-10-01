// js/12-en-vivo.js — tramo 12 de 14 del script de ficha.html (paso 5, nivel A: mismo código, en el mismo orden).
/* =========================================================
   MESA — tiradas compartidas en vivo: comun/mesa.js
   Acá solo va lo propio de esta herramienta: MESA_DESDE, mesaQuien()
   (quién tira) y lo que publica cosas que no son tiradas.
   ========================================================= */

const MESA_DESDE = 'ficha';

// Quién tiró: el personaje cargado en la ficha.
// Si el origen viene prefijado "<invocación> · ...", la tirada es de esa
// invocación (mismo criterio que gm-tools con sus creeps); si no, es del
// propio personaje.
function mesaQuien(origen){
  const inv = S.invocaciones.find(i => i.nombre && String(origen || '').startsWith(i.nombre + ' · '));
  if(inv) return inv.nombre;
  return ((S.meta && S.meta.nombre) || '').trim();
}


/* =========================================================
   FICHA EN VIVO (Firebase)
   El personaje abierto se guarda solo en campanas/<campaña>/fichas/<id>:
   el documento principal tiene dueño, nombre, un resumen público (HP,
   SP, estados) y una miniatura del retrato para el token del mapa;
   el contenido va repartido en fichas/<id>/partes/<parte> (general,
   inventario, efectos…) para escribir solo lo que cambió, y espaciado
   por el tope diario de escrituras del plan gratis.
   Imágenes: solo se guardan el retrato de la cabecera (parte "retrato")
   y las de las invocaciones (parte "imgInvocaciones"). Las de ítems,
   habilidades y catálogo no viajan (quedan vacías al volver a abrir).
   Las invocaciones también se publican en el resumen (nombre, HP,
   miniatura) para poder vincularlas a un token del mapa.
   Todos los miembros ven cualquier ficha de PJ; solo el dueño la
   modifica (lo imponen las reglas). Ver docs/workflow-firebase.md.
   ========================================================= */

// Qué va en cada parte y cómo se arman, leen y aplican: comun/ficha-guardado.js (paso 5, nivel B, área 4).
const PARTES_FICHA = FichaGuardado.PARTES;
const CLAVES_CON_PARTE = FichaGuardado.CLAVES_CON_PARTE;
const CATALOGO_IDS = FichaGuardado.CATALOGO_IDS;
// Cuándo se escribe (1,2 s quieto, o cada 5 s si no para de cambiar): comun/ficha-sesion.js (paso 4, etapa 3a).
const GUARDAR_QUIETO_MS = FichaSesion.QUIETO_MS;
const GUARDAR_MAX_MS = FichaSesion.MAX_MS;
const MINIATURA_PX = 96;
const MINIATURA_MAX = 60000;   // tope que aceptan las reglas
const GM_SIN_PERSONAJES = 'Como GM, tus personajes y creeps se manejan desde gm-tools. Acá solo podés mirar las fichas de los jugadores.';

const fichaSerializar = FichaGuardado.serializar;
function fichaPartesActuales(){ return FichaGuardado.partes(S); }
function fichaImagenesInvocaciones(){ return FichaGuardado.imagenesInvocaciones(S); }
function fichaPonerImagenesInvocaciones(mapa){ FichaGuardado.ponerImagenesInvocaciones(S, mapa); }
const fichaLeerParte = FichaGuardado.leerParte;
// Las imágenes de las invocaciones no viajan con su parte: se vuelven a poner desde la última parte imgInvocaciones leída.
function fichaAplicarParte(parte, datos){
  FichaGuardado.aplicarParte(S, parte, datos, {
    mezclarCatalogo: lista => ItemsSubidos.mezclar(lista, itemsSubidos, DEFAULT.catalogo),
    imgInvocaciones: fichaVivo ? (fichaVivo.ultimo.imgInvocaciones || '') : null,
  });
}

function fichaResumen(){
  const c = compute();
  const n = v => (typeof v === 'number' && !Number.isNaN(v)) ? v : num(v);
  const spMax = n(spMaximo(c));
  return {
    nivel: num(S.meta.nivel),
    hp: num(S.hp),
    hpMax: n(c.final.hpmax),
    ini: n(c.final.ini),   // Iniciativa: el mapa la usa para el botón "Tirar iniciativa" de la lista de turnos
    def: n(c.final.def),   // Defensa total: el mapa la resta al daño que se le asigna al token
    armadmg: n(c.final.armadmg),   // Armadura mágica (Paso 3 del casteo): el mapa la resta al daño de casteo que ignora la Defensa
    muerto: {activo: !!(S.muerto && S.muerto.activo), turnos: num(S.muerto && S.muerto.turnos), definitivo: !!(S.muerto && S.muerto.definitivo)},   // el mapa tiñe de rojo la pantalla de su jugador y le da el botón Revivir
    esp: n(c.final.esp),   // Especial
    resmg: n(c.final.resmg),   // Res.Esp (2026-09-28): el mapa la usa para tirar sola la resistencia de una zona persistente, sin que la ficha esté abierta
    percepcion: n(c.final.percepcion),   // Percepción (de Destreza, 2026-09-22): por si el mapa la necesita más adelante
    rng: n(c.final.rng),               // Rango (de Destreza): el mapa lo usa para el visualizador de rango (📏)
    rangocasteo: n(c.final.rangocasteo),   // Rango de casteo (de Especial): visualizador de rango mágico (🔮)
    luz: n(c.final.luz), veoculto: n(c.final.veoculto),   // luz que lleva encima y radio en el que ve lo oculto: el mapa los lee (farol, bengala, yelmo del ojo que todo lo ve)
    vision: n(c.final.vision),   // Campo de visión (base 6 + ítems, pasivas y estados): el mapa lo suma a la luz de la escena para el radio de cada token
    // Crítico (2026-09-25): el mapa arma con esto la Calculadora de crítico sin que haya que escribirlo (equipo, habilidades y estados ya sumados).
    // Crítico frecuente y potente DE ESA ARMA (la misma de armaTipo): lo de la otra arma equipada no cuenta.
    ...(() => { const a = (S.inventario || []).find(i => i.equipado && /^arma/.test(i.tipoItem || '') && [4, 6, 8, 10, 12].includes(num(i.tipoDado))); return {crit: n(statParaArma('crit', a || null)), critpot: n(statParaArma('critpot', a || null))}; })(),
    armaTipo: (() => { const a = (S.inventario || []).find(i => i.equipado && /^arma/.test(i.tipoItem || '') && [4, 6, 8, 10, 12].includes(num(i.tipoDado))); return a ? num(a.tipoDado) : 0; })(),   // Tipo de su arma equipada
    rescrit: ['tipo1', 'tipo2', 'tipo3', 'tipo4', 'tipo5'].map(k => n(c.final[k])),   // Resistencia a crítico contra armas de Tipo 4, 6, 8, 10 y 12
    percepcionAumentada: tienePercepcionAumentada(),   // el mapa le avisa de las trampas ocultas cercanas
    sp: spMax - num(S.spGastado),
    spMax,
    // Para mover el token desde el mapa: Nitros que quedan y cuánto cuesta
    // cada casillero (0 = no se puede mover, ej. Inmovilizado).
    nitros: S.nitros === null || S.nitros === undefined ? n(c.final.nitros) : num(S.nitros),
    nitrosMax: n(c.final.nitros),
    costoMover: IT2.inmovilizadoBloqueaMover && estadoActivo('inmovilizado') ? 0 : costoMoverCasillero(),
    muerto: !!(S.muerto && S.muerto.activo),
    muertoDef: !!(S.muerto && S.muerto.definitivo),   // muerto de verdad (el GM lo usa al repartir la experiencia)
    // 🎮 Si el GM tiene el control, su uid: el mapa le deja usar este token como si fuera suyo (Botonera, moverlo pagando No2).
    ...(fichaVivo && fichaVivo.control && fichaVivo.control.uid ? {control: fichaVivo.control.uid} : {}),
    estados: estadosTodos()
      .filter(e => e && e.activo !== false && e.nombre)
      .slice(0, 30)
      .map(e => ({
        nombre: String(e.nombre).slice(0, 60),
        turnos: num(e.turnos),
        permanente: !!e.permanente,
        ...((e.escudoMagicoActual !== undefined || num(e.escudoMagico) > 0) ? {escudo: num(e.escudoMagicoActual ?? e.escudoMagico), ...(e.excedenteVida ? {excedente: true, ...(e.excedenteTope ? {tope: num(e.excedenteTope)} : {})} : {escudoMax: num(e.escudoMagico)})} : {}), ...(e.armaduraRota ? {armaduraRota: true, stacks: Math.max(1, num(e.stacks) || 1)} : {}),
        ...(e.derivado ? {derivado: true} : {}),
        polaridad: e.polaridad === 'buff' || e.polaridad === 'debuff' ? e.polaridad : '',
        // Para el globito del mapa al pasar el mouse por el estado.
        detalle: String(e.detalle || '').slice(0, 300),
      })),
    invocaciones: (S.invocaciones || [])
      .filter(inv => inv && inv.id)
      .slice(0, 20)
      .map(inv => ({
        id: String(inv.id),
        nombre: String(inv.nombre || 'Invocación').slice(0, 60),
        hp: num(inv.hp),
        hpMax: num(inv.hpMax),
        // Nitros y estados, para que el token en el mapa muestre lo mismo
        // que un PJ o un creep (barra de No2, estados con su detalle).
        nitros: num(inv.nitros),
        nitrosMax: invNitrosMax(inv),
        activa: inv.activa !== false,
        miniatura: fichaMiniaturaInvocacion(inv.imagen),
        estados: (inv.estados || [])
          .filter(e => e && e.activo !== false && e.nombre)
          .slice(0, 30)
          .map(e => ({
            nombre: String(e.nombre).slice(0, 60),
            turnos: num(e.turnos),
            permanente: !!e.permanente,
            ...((e.escudoMagicoActual !== undefined || num(e.escudoMagico) > 0) ? {escudo: num(e.escudoMagicoActual ?? e.escudoMagico), ...(e.excedenteVida ? {excedente: true, ...(e.excedenteTope ? {tope: num(e.excedenteTope)} : {})} : {escudoMax: num(e.escudoMagico)})} : {}), ...(e.armaduraRota ? {armaduraRota: true, stacks: Math.max(1, num(e.stacks) || 1)} : {}),
            polaridad: e.polaridad === 'buff' || e.polaridad === 'debuff' ? e.polaridad : '',
            detalle: String(e.detalle || '').slice(0, 300),
          })),
      })),
  };
}

// Miniaturas de las invocaciones para el resumen: se calculan aparte (tardan
// un instante) y, cuando están, se vuelve a revisar el resumen.
const miniaturasInvocaciones = new Map();  // imagen -> miniatura ('' mientras se calcula)
function fichaMiniaturaInvocacion(imagen){
  if(!imagen || !imagen.startsWith('data:')) return '';
  if(miniaturasInvocaciones.has(imagen)) return miniaturasInvocaciones.get(imagen);
  miniaturasInvocaciones.set(imagen, '');
  fichaMiniatura(imagen).then(m => {
    miniaturasInvocaciones.set(imagen, m);
    if(fichaVivo) fichaVivo.revisarResumen = true;
  });
  return '';
}

function fichaNombre(){
  return String(S.meta.nombre || '').trim().slice(0, 60) || 'Sin nombre';
}

// La miniatura del personaje (token del mapa): si el jugador ya eligió a
// mano qué parte se ve (comun/recorte-imagen.js, S.meta.miniatura), se
// usa esa; si no, se recorta el centro del retrato como antes.
async function fichaMiniaturaActual(){
  return S.meta.miniatura || await fichaMiniatura(S.meta.imagen);
}

// Retrato achicado para el token del mapa (unos pocos KB).
function fichaMiniatura(dataUrl){
  return new Promise(res => {
    if(!dataUrl){ res(''); return; }
    const img = new Image();
    img.onload = () => {
      const lado = Math.min(img.naturalWidth, img.naturalHeight);
      if(!lado){ res(''); return; }
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = MINIATURA_PX;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, (img.naturalWidth - lado) / 2, (img.naturalHeight - lado) / 2, lado, lado, 0, 0, MINIATURA_PX, MINIATURA_PX);
      try{ res(canvas.toDataURL('image/jpeg', 0.8)); }catch(e){ res(''); }
    };
    img.onerror = () => res('');
    img.src = dataUrl;
  });
}

/* ---------- Estado visible (barra superior y cartel de solo lectura) ---------- */

function fichaEstado(texto, tipo){
  const el = $('#guardado-estado');
  if(!el) return;
  el.textContent = texto;
  el.dataset.estado = tipo || '';
}

function fichaEstadoAlDia(){
  const f = fichaVivo;
  if(!f){ fichaEstado('Sin personaje abierto: los cambios no se guardan.'); return; }
  if(!f.cargada){ fichaEstado('Cargando personaje…'); return; }
  if(f.soloLectura){ fichaEstado('Solo lectura: tus cambios acá no se guardan.', 'lectura'); return; }
  if(f.reintentarDesde){ fichaEstado('⚠ No se pudo guardar — reintentando', 'error'); return; }
  if(f.escribiendo){ fichaEstado('Guardando…'); return; }
  if(Object.keys(f.sucias).length){ fichaEstado('Cambios sin guardar…'); return; }
  fichaEstado(`✓ Guardado en la mesa · ${fichaNombre()}${f.editaGM ? ' (editando como GM)' : ''}`, 'ok');
}

// Usuario a mostrar en la barra junto al personaje abierto: el dueño, si es
// de otro (se busca una sola vez por apertura, no en cada render), o vos.
// fichaIdentidadRender() usa este valor cacheado para no repetir la
// consulta a Firebase en cada tecla (p.ej. al cambiarle el nombre).
let fichaIdentidadUsuario = '';

function fichaIdentidadRender(){
  const f = fichaVivo;
  // La pestaña dice el personaje abierto y la partida (2026-09-27, pedido del dueño): "Aurelio · Nombre de la partida · Ficha".
  try{
    const partida = fbPartida && fbPartida.nombre ? fbPartida.nombre : '';
    const nombre = f && f.cargada ? String(fichaNombre() || '').trim() : '';
    document.title = nombre ? `${nombre}${partida ? ' · ' + partida : ''} · Ficha` : `${partida ? partida + ' · ' : ''}Ficha de personaje`;
  }catch(e){}
  $('#barra-partida').innerHTML = f && f.cargada
    ? `<b>📜 Ficha</b> <span class="sec">${barraTexto(esc(fichaNombre()), fichaIdentidadUsuario ? esc(fichaIdentidadUsuario) : undefined)}</span>`
    : `<b>📜 Ficha</b> <span class="sec">${esc(barraTexto())}</span>`;
}

// ¿La ficha se abre solo para mirar? El dueño la edita; cualquier otro la mira.
// El GM también la mira, pero puede pasar a editarla (para ayudar a un jugador
// nuevo a configurar habilidades, automatizarlas, etc.): f.editaGM.
function fichaSoloLecturaPara(duenoUid, f){
  // 🎮 Control del GM (2026-09-30, pedido del dueño): mientras el GM tiene el control, él la usa como si fuera el dueño y
  // todos los demás —el dueño incluido— la ven en solo lectura, hasta que la devuelve.
  const ctl = f && f.control && f.control.uid;
  if(ctl) return ctl !== fbUsuario.uid;
  // Tu propio personaje nunca arranca en solo lectura, seas GM o no (2026-09-29, bug real: un GM que también
  // juega con su propio PJ —"múltiples cuentas, mismo dueño" no aplica acá, es la MISMA cuenta con los dos roles—
  // lo abría en solo lectura por defecto, como si fuera de otro jugador, y las habilidades con duelo (que
  // chequean fichaVivo.soloLectura) no hacían nada, sin ningún aviso). El resto de las reglas de GM (fichas
  // ajenas en solo lectura salvo "Editar como GM") sigue igual.
  if(duenoUid === fbUsuario.uid) return false;
  if(fbMiembro.gm) return !(f && f.editaGM);
  return true;
}

/* ---------- 🎮 Tomar / devolver el control (2026-09-30, pedido del dueño) ----------
   Distinto de "✎ Editar como GM" (que es para configurar): con el control, el GM USA el personaje como si fuera su dueño —
   Botonera, duelos, habilidades, token en el mapa pagando No2, botín, estados que le llegan y Mantenimiento—. El dueño
   queda en solo lectura con un cartel hasta que se lo devuelve, y la Mesa avisa las dos cosas. No pide permiso al jugador
   (juego entre amigos: anotado en "Antes de abrirlo al público"). La marca vive en la parte `control` de la ficha
   ({uid, nombre, desde}; "null" = la tiene su dueño) y, para el mapa, en `resumen.control` (el uid del GM). */
const fichaControloYo = f => !!(f && f.control && fbUsuario && f.control.uid === fbUsuario.uid);
function fichaAvisarMesaControl(texto){
  if(!fbDb || !fbUsuario || !fbMiembro) return;
  fbDb.collection(fbRutaCampana('tiradas')).add({
    uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: fichaNombre(),
    origen: texto.slice(0, 80), formula: '', rolls: [], mod: 0, total: 0, desde: 'recordatorio',
    cuando: firebase.firestore.FieldValue.serverTimestamp(),
  }).catch(err => console.error('No se pudo avisar en la Mesa:', err));
}
async function fichaTomarControl(){
  const f = fichaVivo;
  if(!f || !fbMiembro.gm || !f.cargada || fichaControloYo(f)) return;
  if(!confirm(`¿Tomar el control de ${fichaNombre()}?\n\nLo vas a usar como si fueras su jugador (Botonera, duelos, habilidades, token, Mantenimiento). Su jugador queda en solo lectura hasta que se lo devuelvas, y la Mesa avisa.`)) return;
  const base = fbDb.doc(fbRutaCampana(`fichas/${f.id}`));
  const control = {uid: fbUsuario.uid, nombre: fbMiembro.nombre || 'GM', desde: Date.now()};
  try{
    await base.collection('partes').doc('control').set({json: JSON.stringify(control), actualizado: firebase.firestore.FieldValue.serverTimestamp()});
    await base.update({'resumen.control': fbUsuario.uid});
  }catch(err){ console.error('No se pudo tomar el control:', err); toast('No se pudo tomar el control — revisá la consola'); return; }
  f.editaGM = false;
  fichaControlCambio(f, control, true);
  fichaAvisarMesaControl(`🎮 El GM (${control.nombre}) tomó el control de ${fichaNombre()}`);
}
async function fichaDevolverControl(){
  const f = fichaVivo;
  if(!f || !fichaControloYo(f)) return;
  await fichaGuardarTick(true);   // sube lo último antes de soltarlo
  const base = fbDb.doc(fbRutaCampana(`fichas/${f.id}`));
  try{
    await base.collection('partes').doc('control').set({json: 'null', actualizado: firebase.firestore.FieldValue.serverTimestamp()});
    await base.update({'resumen.control': firebase.firestore.FieldValue.delete()});
  }catch(err){ console.error('No se pudo devolver el control:', err); toast('No se pudo devolver el control — revisá la consola'); return; }
  fichaAvisarMesaControl(`↩ El GM devolvió el control de ${fichaNombre()} a su jugador`);
  fichaControlCambio(f, null, true);
}
// Llega (o cambia) la marca de control: recalcula quién puede editar y avisa. `avisar` = false en la carga inicial.
function fichaControlCambio(f, control, avisar){
  const antes = f.soloLectura;
  f.control = control && control.uid ? control : null;
  if(f.control) f.editaGM = false;
  const ahora = fichaSoloLecturaPara(f.duenoUid, f);
  // Al dueño que queda en solo lectura: primero sube lo que tenía sin guardar (fichaGuardarTick mira soloLectura al empezar).
  if(!antes && ahora && fichaHayPendiente()) fichaGuardarTick(true);
  f.soloLectura = ahora;
  if(avisar && antes !== ahora){
    const mio = f.duenoUid === fbUsuario.uid;
    if(f.control && mio) toast(`🎮 El GM (${f.control.nombre}) tomó el control de tu personaje: queda en solo lectura hasta que te lo devuelva`);
    else if(!f.control && mio) toast('↩ El GM te devolvió el control de tu personaje');
    else if(fichaControloYo(f)) toast(`🎮 Tenés el control de ${fichaNombre()}: lo usás como si fueras su jugador`);
    else if(!f.control) toast('Devolviste el control: la ficha vuelve a solo lectura');
  }
  fichaMostrarLectura();
  fichaEstadoAlDia();
  if(!f.soloLectura){ mantenimientoRevisar(); recompensasRevisar(); estadosRevisar(); }
  renderBotoneraSiAbierta();
}

async function fichaAlternarEdicionGM(){
  const f = fichaVivo;
  if(!f || !fbMiembro.gm || !f.cargada) return;
  if(f.editaGM){
    await fichaGuardarTick(true);   // sube lo que quedó pendiente antes de volver a mirar
    f.editaGM = false;
    f.soloLectura = true;
    toast('Volviste a solo lectura');
  }else{
    f.editaGM = true;
    f.soloLectura = false;
    toast('Editás esta ficha como GM: lo que cambies se guarda en el personaje');
  }
  fichaMostrarLectura();
  fichaEstadoAlDia();
}

// El GM abre desde el mapa el selector o el editor de estados de un personaje que no es suyo: pasa a editar como GM sin avisar
// (mismo modo que "✎ Editar como GM"; las reglas ya lo permiten) para que lo que cambie se guarde en el personaje.
function fichaEditarComoGMSilencioso(){
  const f = fichaVivo;
  if(!f || !fbMiembro.gm || f.editaGM || !f.cargada) return;
  f.editaGM = true;
  f.soloLectura = false;
  fichaMostrarLectura();
  fichaEstadoAlDia();
}

async function fichaMostrarLectura(){
  let cartel = $('#ficha-lectura');
  const f = fichaVivo;
  const editaGM = !!(f && f.editaGM && fbMiembro.gm);
  const controlo = fichaControloYo(f);
  if(!f || (!f.soloLectura && !editaGM && !controlo)){
    if(cartel) cartel.remove();
    fichaIdentidadUsuario = '';
    fichaIdentidadRender();
    return;
  }
  if(!cartel){
    cartel = document.createElement('div');
    cartel.id = 'ficha-lectura';
    document.body.appendChild(cartel);
  }
  cartel.classList.toggle('editando-gm', editaGM || controlo);
  const boton = (texto, accion, titulo) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'mini'; b.textContent = texto; b.onclick = accion;
    if(titulo) b.title = titulo;
    cartel.appendChild(b);
  };
  const armar = dueno => {
    const deQuien = dueno ? ' de ' + dueno : '';
    const mio = f.duenoUid === fbUsuario.uid;
    if(controlo){
      cartel.textContent = `🎮 Tenés el control del personaje${deQuien}: lo usás como si fueras su jugador (Botonera, duelos, token, Mantenimiento). Su jugador lo ve en solo lectura.`;
      boton('↩ Devolver el control', fichaDevolverControl, 'Se lo devolvés a su jugador; la Mesa avisa');
      return;
    }
    if(f.control && mio){
      cartel.textContent = `🎮 El GM (${f.control.nombre}) tiene el control de tu personaje: lo ves en solo lectura hasta que te lo devuelva.`;
      return;
    }
    cartel.textContent = editaGM
      ? `Editando como GM el personaje${deQuien}: lo que cambies se guarda en su ficha.`
      : `Solo lectura: ${dueno ? 'personaje de ' + dueno : 'este personaje no es tuyo'}${f.control ? ` (lo controla el GM, ${f.control.nombre})` : ''}. Los cambios que hagas acá no se guardan.`;
    if(fbMiembro.gm){
      boton(editaGM ? 'Volver a solo lectura' : '✎ Editar como GM', fichaAlternarEdicionGM, 'Para configurar la ficha (habilidades, equipo…); no la juega');
      if(!f.control) boton('🎮 Tomar el control', fichaTomarControl, 'Usarlo como si fueras su jugador, hasta devolvérselo');
    }
  };
  armar('');
  fichaIdentidadUsuario = '';  // se corrige abajo apenas se sepa el dueño; mientras, muestra tu nombre
  fichaIdentidadRender();
  try{
    const m = await fbDb.doc(fbRutaCampana(`miembros/${f.duenoUid}`)).get();
    if(m.exists && fichaVivo === f && (f.soloLectura || f.editaGM || fichaControloYo(f))){
      armar(m.data().nombre);
      fichaIdentidadUsuario = m.data().nombre;
      fichaIdentidadRender();
    }
  }catch(e){}
}

/* ---------- Guardado ---------- */

// El guardado en sí (qué partes cambiaron, cuándo escribir, reintentar) vive en comun/ficha-sesion.js (paso 4, etapa 3a), el
// mismo que usa el mapa. Acá, lo propio de la ficha: qué se guarda (partes, resumen, nombre, miniatura) y qué se muestra.
function fichaOpcionesGuardado(f){
  return {
    db: fbDb, ruta: fbRutaCampana(`fichas/${f.id}`), marcaDeTiempo: () => firebase.firestore.FieldValue.serverTimestamp(),
    partes: fichaPartesActuales, resumen: fichaResumen, nombre: fichaNombre, miniatura: fichaMiniaturaActual,
    juntos: () => tiposGuardarJunto, juntosListo: () => { tiposGuardarJunto = false; },
    alEstado: fichaEstadoAlDia, vigente: () => fichaVivo === f,
    alError: (err, primeraVez) => {
      if(primeraVez) toast(err.code === 'permission-denied'
        ? 'No se pudo guardar: la mesa no te deja modificar este personaje'
        : 'No se pudo guardar la ficha en la mesa — se reintenta sola');
    },
  };
}
async function fichaGuardarTick(forzar){
  const f = fichaVivo;
  if(!f || f.soloLectura || !f.cargada || f.escribiendo) return;
  return FichaSesion.guardar(f, forzar, fichaOpcionesGuardado(f));
}

setInterval(() => fichaGuardarTick(false), 1000);

function fichaHayPendiente(){ return FichaSesion.pendiente(fichaVivo, fichaPartesActuales); }

window.addEventListener('beforeunload', e => {
  if(!fichaHayPendiente()) return;
  fichaGuardarTick(true);
  e.preventDefault();
  e.returnValue = '';
});

/* ---------- Abrir, escuchar, soltar ---------- */

// soloEnPestana: la ficha de otro jugador (abierta desde el mapa o desde
// Personajes) queda en la dirección, pero no pasa a ser "la tuya" en este
// navegador.
function fichaRecordar(id, soloEnPestana){
  if(!soloEnPestana){ try{ localStorage.setItem('ficha-actual-' + FB_CAMPANA, id || ''); }catch(e){} }
  try{ history.replaceState(null, '', id ? '#' + id : location.pathname + location.search); }catch(e){}
}

// El estado de un personaje abierto (fichaVivo): comun/ficha-sesion.js.
function fichaNuevoEstado(id, duenoUid, cargada){ return FichaSesion.nueva(id, duenoUid, cargada, fichaSoloLecturaPara(duenoUid, null)); }

// Escuchar el personaje: comun/ficha-sesion.js (paso 4, etapa 3a), el mismo que usa el mapa. Acá, lo que la ficha hace en
// cada momento (armarse y dibujarse, avisos, solo lectura, control del GM).
function fichaEscuchar(f){
  FichaSesion.escuchar(f, {
    db: fbDb, ruta: fbRutaCampana(`fichas/${f.id}`), vigente: () => fichaVivo === f,
    // Documento principal: si cambia el dueño (el GM lo reasignó) o se borra.
    alDoc: doc => {
      if(!doc.exists){
        if(doc.metadata.hasPendingWrites) return;
        toast('Este personaje se borró de la mesa');
        fichaDesenganchar();
        return;
      }
      const d = doc.data();
      const lectura = fichaSoloLecturaPara(d.duenoUid, f);
      f.duenoUid = d.duenoUid;
      f.miniaturaDoc = typeof d.miniatura === 'string' ? d.miniatura : '';   // la que ven los tokens del mapa
      if(lectura !== f.soloLectura){
        f.soloLectura = lectura;
        toast(lectura ? 'Este personaje pasó a otro dueño: queda en solo lectura' : 'Ahora este personaje es tuyo');
        fichaMostrarLectura();
        fichaEstadoAlDia();
      }
    },
    // La primera vez: la ficha entera (la marca de control y lo leído ya están en f).
    alCargar: armado => {
      f.soloLectura = fichaSoloLecturaPara(f.duenoUid, f);   // con la marca de control ya leída
      aplicarFicha(armado.datos);
      fichaPonerImagenesInvocaciones(armado.imgInvocaciones);
      renderInvocaciones();
      f.cargada = true;
      // Si la ficha tiene retrato pero el token del mapa se quedó sin miniatura, la vuelve a publicar.
      if(!f.soloLectura && !f.miniaturaDoc && (S.meta.imagen || S.meta.miniatura)){ f.reponerMiniatura = true; }
      f.revisarResumen = true;
      fichaMostrarLectura();
      fichaEstadoAlDia();
      // ?precarga=1 (paso 4): el mapa la carga de antemano, o para un duelo, sin abrir nada; avisa que está lista y espera.
      if(MODO_BOTONERA){ if(new URLSearchParams(location.search).get('precarga') === '1') botoneraAvisarMapa('botonera-lista'); else botoneraModoAbrir(); }
      mantenimientoRevisar();
      recompensasRevisar();
    },
    alControl: nuevo => fichaControlCambio(f, nuevo, true),
    aplicarParte: (parte, datos) => fichaAplicarParte(parte, datos),
    alCambiar: () => {
      renderAll();
      if(!f.soloLectura) toast('La ficha se actualizó desde otra ventana');
      fichaEstadoAlDia();
    },
    alErrorPartes: () => fichaEstado('⚠ No se pudo leer el personaje — mirá la consola', 'error'),
  });
}

// Corta la conexión con el personaje abierto sin guardar nada más.
function fichaDesenganchar(){
  const f = fichaVivo;
  if(!f) return;
  FichaSesion.cortar(f);
  fichaVivo = null;
  fichaRecordar('');
  fichaMostrarLectura();
  fichaEstadoAlDia();
}

// Guarda lo pendiente del personaje abierto y lo suelta.
async function fichaSoltar(){
  const f = fichaVivo;
  if(!f) return;
  for(let i = 0; f.escribiendo && i < 100; i++) await new Promise(r => setTimeout(r, 100));
  if(fichaVivo === f && !f.soloLectura && f.cargada) await fichaGuardarTick(true);
  if(fichaVivo === f) fichaDesenganchar();
}

async function fichaAbrir(id){
  if(!fbDb || !fbMiembro || !id) return false;
  if(fichaVivo && fichaVivo.id === id) return true;
  let doc;
  try{
    doc = await fbDb.doc(fbRutaCampana(`fichas/${id}`)).get();
  }catch(err){
    console.error('No se pudo abrir el personaje:', err);
    toast('No se pudo abrir el personaje');
    return false;
  }
  if(!doc.exists){ toast('Ese personaje ya no está en la mesa'); return false; }
  await fichaSoltar();
  const f = fichaNuevoEstado(id, doc.data().duenoUid, false);
  fichaVivo = f;
  fichaRecordar(id, doc.data().duenoUid !== (fbUsuario && fbUsuario.uid));
  fichaEstadoAlDia();
  fichaEscuchar(f);
  return true;
}

async function crearPersonajeNuevo(datos){
  if(!fbDb || !fbMiembro){ toast('Sin conexión con la partida: no se pueden crear personajes'); return; }
  if(fbMiembro.gm){ toast(GM_SIN_PERSONAJES); return; }
  if(!datos && !confirm('¿Crear un personaje nuevo, en blanco, en la mesa?\n\nEl personaje que tenés abierto queda guardado como está.')) return;
  await fichaSoltar();
  if(datos) aplicarFicha(datos); else fichaNueva();
  try{
    const ts = firebase.firestore.FieldValue.serverTimestamp();
    const ref = fbDb.collection(fbRutaCampana('fichas')).doc();
    await ref.set({
      duenoUid: fbUsuario.uid,
      nombre: fichaNombre(),
      resumen: fichaResumen(),
      miniatura: await fichaMiniaturaActual(),
      creado: ts,
      actualizado: ts,
    });
    const f = fichaNuevoEstado(ref.id, fbUsuario.uid, true);
    fichaVivo = f;
    fichaRecordar(ref.id);
    fichaEscuchar(f);
    await fichaGuardarTick(true);
    toast(datos ? 'Archivo cargado como personaje nuevo' : 'Personaje nuevo creado en la mesa');
  }catch(err){
    console.error('No se pudo crear el personaje:', err);
    toast('No se pudo crear el personaje en la mesa — revisá la consola');
    fichaEstadoAlDia();
  }
}

function fichaCargarArchivo(data){
  // Respaldo de toda la partida (lo baja el GM desde el inicio): se elige
  // cuál de sus personajes cargar.
  if(data && data.tipo === 'respaldo-partida'){
    const lista = Array.isArray(data.fichas) ? data.fichas.filter(f => f && f.ficha) : [];
    if(!lista.length){ toast('Ese respaldo no tiene personajes'); return; }
    const opciones = lista.map((f, i) => `${i + 1}. ${f.nombre || 'Sin nombre'}${f.dueno ? ` (de ${f.dueno})` : ''}`).join('\n');
    const eleccion = prompt(`Es un respaldo de toda la partida. ¿Qué personaje querés cargar?\n\n${opciones}\n\nEscribí el número:`);
    const n = parseInt(eleccion, 10);
    if(!n || n < 1 || n > lista.length) return;
    data = lista[n - 1].ficha;
  }
  if(fichaVivo){
    if(fichaVivo.soloLectura){ toast('Este personaje no es tuyo: no podés cargarle un archivo'); return; }
    aplicarFicha(data);  // se guarda solo en la mesa
    return;
  }
  if(fbMiembro){ crearPersonajeNuevo(data); return; }
  aplicarFicha(data);
}

/* ---------- Personajes (modal) ---------- */

async function abrirPersonajes(){
  const lista = $('#personajes-lista');
  $('#scrim-personajes').classList.add('open');
  if(!fbDb || !fbMiembro){
    lista.innerHTML = '<div class="hint">Sin conexión con la partida. Podés cargar un archivo .json, pero no se guarda en ningún lado.</div>';
    return;
  }
  lista.innerHTML = '<div class="hint">Buscando personajes…</div>';
  try{
    const [fichas, miembros] = await Promise.all([
      fbDb.collection(fbRutaCampana('fichas')).get(),
      fbDb.collection(fbRutaCampana('miembros')).get(),
    ]);
    const nombres = new Map(miembros.docs.map(d => [d.id, d.data().nombre]));
    const todas = fichas.docs
      .map(d => ({id: d.id, ...d.data()}))
      .sort((a, b) => String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es'));
    const mias = todas.filter(x => x.duenoUid === fbUsuario.uid);
    const otras = todas.filter(x => x.duenoUid !== fbUsuario.uid);
    lista.innerHTML = '';
    const titulo = texto => {
      const t = document.createElement('div');
      t.className = 'hint';
      t.textContent = texto;
      lista.appendChild(t);
    };
    const fila = (x, propia) => {
      const abierto = fichaVivo && fichaVivo.id === x.id;
      const wrap = document.createElement('div');
      wrap.style.cssText = 'display:flex;gap:7px;align-items:stretch';
      const b = document.createElement('button');
      b.className = 'btn' + (abierto ? ' primary' : '');
      b.style.flex = '1';
      const nivel = x.resumen && x.resumen.nivel ? ` · Lv ${fmt(num(x.resumen.nivel))}` : '';
      const dueno = propia ? '' : ` — ${nombres.get(x.duenoUid) || '¿?'}`;
      b.textContent = `${x.nombre || 'Sin nombre'}${nivel}${dueno}${abierto ? ' (abierto)' : ''}`;
      if(!propia && !abierto) b.title = fbMiembro.gm ? 'Se abre en una pestaña nueva, en solo lectura (como GM la podés editar desde ahí)' : 'Se abre en una pestaña nueva, en solo lectura';
      b.onclick = async () => {
        $('#scrim-personajes').classList.remove('open');
        if(abierto) return;
        // La ficha de otro jugador va en otra pestaña, así no se pierde la propia.
        if(!propia){
          window.open(`ficha.html?partida=${encodeURIComponent(FB_CAMPANA)}#${encodeURIComponent(x.id)}`, '_blank', 'noopener');
          return;
        }
        await fichaAbrir(x.id);
      };
      wrap.appendChild(b);
      if(propia){
        const borrar = document.createElement('button');
        borrar.className = 'iconbtn';
        borrar.textContent = '✕';
        borrar.title = `Borrar a ${x.nombre || 'este personaje'} de la mesa`;
        borrar.onclick = () => borrarPersonaje(x.id, x.nombre || 'Sin nombre');
        wrap.appendChild(borrar);
      }
      lista.appendChild(wrap);
    };
    if(fbMiembro.gm){
      // El GM usa gm-tools para lo suyo: acá solo mira las fichas de los jugadores.
      titulo('Personajes de los jugadores (solo para ver). Los tuyos y los creeps se manejan desde gm-tools.');
      if(todas.length) todas.forEach(x => fila(x, false));
      else titulo('Todavía nadie creó personajes.');
    }else{
      titulo('Tus personajes');
      if(mias.length) mias.forEach(x => fila(x, true));
      else titulo('Todavía no tenés ninguno: creá uno nuevo o cargá un archivo.');
      if(otras.length){
        titulo('De los demás (solo para ver)');
        otras.forEach(x => fila(x, false));
      }
    }
    ['#personajes-nuevo', '#personajes-archivo'].forEach(s => { $(s).style.display = fbMiembro.gm ? 'none' : ''; });
  }catch(err){
    console.error('Error listando personajes:', err);
    lista.innerHTML = '<div class="hint">No se pudo traer la lista de personajes. ¿Están publicadas las reglas nuevas?</div>';
  }
}

async function borrarPersonaje(id, nombre){
  const aviso = `Esto borra a ${nombre} de la mesa, para todos, y no se puede deshacer.\n\n` +
                `Si querés conservarlo, antes abrilo y bajá una copia con 💾 Guardar copia.\n\n¿Seguís?`;
  if(!confirm(aviso)) return;
  const escrito = prompt(`Para confirmar el borrado, escribí el nombre tal cual: ${nombre}`);
  if(escrito === null) return;
  if(escrito.trim().toLowerCase() !== nombre.trim().toLowerCase()){
    toast('El nombre no coincide — no se borró nada');
    return;
  }
  const eraElAbierto = fichaVivo && fichaVivo.id === id;
  if(eraElAbierto){ fichaDesenganchar(); fichaNueva(); }
  try{
    const base = fbDb.doc(fbRutaCampana(`fichas/${id}`));
    const partes = await base.collection('partes').get();
    const batch = fbDb.batch();
    partes.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    await base.delete();
    toast(`${nombre} borrado de la mesa`);
    abrirPersonajes();
  }catch(err){
    console.error('Error borrando el personaje:', err);
    toast('No se pudo borrar el personaje — revisá la consola');
  }
}


