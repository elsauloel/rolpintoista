// js/14-herramientas-y-arranque.js — tramo 14 de 14 del script de mapa.html (paso 5, nivel A: mismo código, en el mismo orden): caja de herramientas, bitácora, Mesa y el arranque.
/* ---------- Caja de herramientas ----------
   Barra de la izquierda del mapa. Cada herramienta se diseña por separado;
   mientras tanto figuran como "Pronto". Para sumar una: agregarla a
   HERRAMIENTAS con `lista: true` y atender `herramientaActiva` en el mapa. */
// Se usa ya en renderToolkit (más abajo): declarada acá arriba para que
// exista cuando el toolkit se dibuja por primera vez.
let bitacoraFlotanteAbierta = false;

// Imagen de fondo (opcional) para el próximo elemento (Terreno/Formas
// unificadas) que se cree — el picker de "Elegir imagen"/"Cambiar"/
// "Quitar" bajo el panel de la herramienta.
function imagenElementoOpcionHtml(imagen){
  return `<label class="etiqueta">Imagen de fondo (opcional)</label>
    <div class="fila" style="margin-top:0;align-items:center">
      ${imagen ? `<img src="${imagen}" alt="" style="width:32px;height:32px;border-radius:4px;object-fit:cover;border:1px solid var(--line)">` : ''}
      <button type="button" class="btn" data-elemento-imagen="1">${imagen ? 'Cambiar' : 'Elegir imagen'}</button>
      ${imagen ? `<button type="button" class="btn peligro" data-elemento-imagen-quitar="1">Quitar</button>` : ''}
    </div>`;
}

const HERRAMIENTAS = [
  {id: 'lapiz', icono: '✏️', nombre: 'Lápiz', detalle: 'Dibujar a mano sobre el mapa', lista: true, atajo: 'L'},
  {id: 'elemento', icono: '⬡', nombre: 'Terreno y Formas', detalle: 'Nubes, charcos, muros… con color o imagen; "Sólido" bloquea el paso', lista: true, atajo: 'G'},
  {id: 'niebla', icono: '🌫', nombre: 'Niebla', detalle: 'Destapar o tapar zonas a mano, o reiniciar (GM)', lista: true, soloGM: true},
  // No son modos de dibujo propios: aparecen colgando de ⬡ Terreno y Formas cuando se despliega (ver renderToolkit).
  // "Formas libres" activa el mismo modo 'elemento' de siempre — el clic en ⬡ ahora solo despliega/repliega, así
  // que hace falta esta fila para poder entrar a ese modo (antes era el propio ⬡ el que lo activaba directo).
  {id: 'formalibre', icono: '⬡', nombre: 'Formas libres', detalle: 'Nubes, charcos, muros… con color o imagen; "Sólido" bloquea el paso', lista: true, sub: true},
  {id: 'trampa', icono: '🪤', nombre: 'Trampas', detalle: 'Ocultas; se disparan solas cuando un rival las pisa', lista: true, sub: true},
  {id: 'zonapersistente', icono: '🌫', nombre: 'Zonas con efectos persistentes', detalle: 'Quedan puestas varios turnos: daño y/o estado, al entrar y en cada Mantenimiento', lista: true, sub: true},
  // No es un modo de dibujo: abre o cierra la bitácora flotante (más abajo).
  {id: 'bitacora', icono: '📖', nombre: 'Bitácora', detalle: 'Notas compartidas de la partida', lista: true, atajo: 'Ctrl+B'},
];
let herramientaActiva = '';
// Salir de una herramienta de dibujo (lápiz/terreno/formas): clic derecho
// en el mapa, Esc, la ✕ de su ventanita, o tocar el mismo botón de nuevo.
// Borrador de Terreno/Formas (ver `borradorElemento`): crearlo de verdad o tirarlo.
function consolidarBorradorElemento(){
  const d = borradorElemento;
  borradorElemento = null;
  if(d && d.celdas.size >= 1) guardarElemento(d.tipo, d.origen, [...d.celdas.values()]);
  renderHerramientaFlotante(); pedirDibujo();
}
function descartarBorradorElemento(){
  if(!borradorElemento) return;
  borradorElemento = null;
  renderHerramientaFlotante(); pedirDibujo();
}
function desactivarHerramienta(){
  if(!herramientaActiva) return;
  if(borradorElemento) consolidarBorradorElemento();
  herramientaActiva = '';
  dibujando = null;
  dibujandoElemento = null;
  pintandoColision = null;
  lienzo.style.cursor = 'default';
  renderToolkit();
}
let toolkitAbierto = false;
try{ toolkitAbierto = localStorage.getItem('mapa-toolkit-abierto') === '1'; }catch(e){}
// ⬡ Terreno y Formas despliega tres sub-opciones (Formas libres/Trampas/Zonas, 2026-09-28, pedido del dueño)
// en vez de entrar directo a un modo — mismo criterio que "botón que despliega botones".
let elementoSubmenuAbierto = false;

function renderToolkit(){
  $('#toolkit').classList.toggle('abierto', toolkitAbierto);
  $('#lienzo-caja').classList.toggle('toolkit-abierto', toolkitAbierto);
  const pestana = $('#toolkit-pestana');
  pestana.setAttribute('aria-expanded', toolkitAbierto ? 'true' : 'false');
  pestana.title = (toolkitAbierto ? 'Esconder las herramientas' : 'Abrir las herramientas') + ' (atajo: H)';
  const MODOS_ELEMENTO = ['elemento', 'trampa', 'zonapersistente'];
  const filaHerramienta = h => {
    const activa = h.id === 'bitacora' ? bitacoraFlotanteAbierta : h.id === 'elemento' ? (elementoSubmenuAbierto || MODOS_ELEMENTO.includes(herramientaActiva))
      : h.id === 'formalibre' ? herramientaActiva === 'elemento' : herramientaActiva === h.id;
    return `<li>
    <button type="button" class="tk-herramienta${activa ? ' activa' : ''}${h.sub ? ' tk-sub' : ''}" data-herramienta="${h.id}" aria-pressed="${activa}"${h.atajo ? ` title="${esc(h.nombre)} — atajo de teclado: ${esc(h.atajo)}"` : ''}>
      <span class="tk-icono" aria-hidden="true">${h.icono}</span>
      <span class="tk-nombre">${esc(h.nombre)}${h.lista ? '' : '<span class="tk-pronto">Pronto</span>'}${h.id === 'elemento' ? `<span class="tk-flecha">${elementoSubmenuAbierto ? '▾' : '▸'}</span>` : ''}</span>
      <span class="tk-detalle">${esc(h.detalle)}</span>
    </button></li>`;
  };
  $('#toolkit-lista').innerHTML = HERRAMIENTAS.filter(h => (!h.soloGM || soyGM) && !h.sub).map(h => {
    if(h.id !== 'elemento') return filaHerramienta(h);
    const subFilas = elementoSubmenuAbierto ? HERRAMIENTAS.filter(x => x.sub && (!x.soloGM || soyGM)).map(filaHerramienta).join('') : '';
    return filaHerramienta(h) + subFilas;
  }).join('');
  renderHerramientaFlotante();
}

// Ventanita propia de Lápiz/Terreno/Formas (la única activa a la vez):
// antes esto se desplegaba adentro de la barra lateral, sumando un
// bloque más cada vez que había una herramienta lista.
function renderHerramientaFlotante(){
  pedirDibujo();  // color/imagen/sólido del panel se ven en vivo en el borrador
  const caja = $('#herramienta-flotante');
  if(!herramientaActiva){ caja.hidden = true; caja.innerHTML = ''; return; }
  const datos = HERRAMIENTAS.find(h => h.id === herramientaActiva);
  let cuerpo = '';
  if(herramientaActiva === 'lapiz'){
    cuerpo = `
      <div class="tk-lapiz-colores">${COLORES.map(c => `<button type="button" class="tk-color${c === lapizColor ? ' elegido' : ''}" data-lapiz-color="${c}" style="background:${c}" title="${c}"></button>`).join('')}</div>
      <label class="etiqueta" style="margin-top:0">Estilo</label>
      <select id="lapiz-estilo-select">
        <option value="libre"${lapizEstilo === 'libre' ? ' selected' : ''}>✏️ Libre (a mano alzada)</option>
        <option value="casillas"${lapizEstilo === 'casillas' ? ' selected' : ''}>⬡ Por casilleros (trayectoria)</option>
      </select>
      <label class="tk-lapiz-check"><input type="checkbox" id="lapiz-permanente-check"${lapizPermanente ? ' checked' : ''}> ${lapizEstilo === 'casillas' ? 'Trayectoria fija' : 'Dibujo permanente'}</label>
      <p class="tk-lapiz-ayuda">${lapizEstilo === 'casillas'
        ? (lapizPermanente ? 'Queda fija en esas casillas: se selecciona (fuera de la herramienta) y se borra con Suprimir. No se mueve.' : 'Marcá la trayectoria arrastrando casillero por casillero; se ve un par de segundos y se borra sola.')
        : (lapizPermanente ? 'Queda como un objeto: cualquiera con permiso lo mueve o lo rota después.' : 'Se ve un par de segundos y se borra sola, como la estela al moverse.')}</p>`;
  }else if(herramientaActiva === 'niebla'){
    cuerpo = `
      <label class="etiqueta" style="margin-top:0">Pincel</label>
      <select id="niebla-modo-select">
        <option value="destapar"${nieblaModo === 'destapar' ? ' selected' : ''}>Destapar</option>
        <option value="tapar"${nieblaModo === 'tapar' ? ' selected' : ''}>Tapar</option>
      </select>
      <label class="etiqueta">Tamaño: ${Combatiente.areaTxt(nieblaPincelRadio)}</label>
      <input type="range" id="niebla-radio" min="0" max="5" step="1" value="${nieblaPincelRadio}">
      <p class="tk-lapiz-ayuda">Arrastrá sobre el mapa para ${nieblaModo === 'destapar' ? 'destapar' : 'volver a tapar'} zonas. ${nieblaActiva ? '' : 'La niebla está apagada: prendela con el botón de la cabecera.'}</p>
      <div class="fila"><button type="button" class="btn peligro" id="niebla-reiniciar">Reiniciar (tapar todo)</button></div>`;
  }else if(herramientaActiva === 'elemento' || herramientaActiva === 'trampa'){
    // Trampas ya no vive adentro de "Formas libres" con una casilla: es su propio modo (2026-09-28, el ⬡ ahora
    // despliega los tres). 🔥 Terreno incendiado también salió de acá — lo reemplaza 🌫 Zonas con efectos
    // persistentes (una zona con solo daño, sin estado, es lo mismo que era el fuego, ahora también jugable por
    // una habilidad); el mecanismo viejo sigue andando tal cual para lo que ya estaba colocado, sin tocarlo.
    const esTrampa = herramientaActiva === 'trampa';
    if(elemTipo === 'colision' && (!soyGM || esTrampa)) elemTipo = 'flor';   // la Colisión es solo de Formas libres + GM
    const selectorForma = `
      <label class="etiqueta" style="margin-top:0">Forma</label>
      <select id="elem-tipo-select">
        <option value="flor"${elemTipo === 'flor' ? ' selected' : ''}>Flor (un centro + alrededor)</option>
        <option value="linea"${elemTipo === 'linea' ? ' selected' : ''}>Línea</option>
        <option value="libre"${elemTipo === 'libre' ? ' selected' : ''}>Forma libre (pintar casilleros)</option>
        ${soyGM && !esTrampa ? `<option value="colision"${elemTipo === 'colision' ? ' selected' : ''}>🧱 Colisión del mapa</option>` : ''}
      </select>`;
    if(elemTipo === 'colision' && !esTrampa){
      cuerpo = selectorForma + `
      <p class="tk-lapiz-ayuda" style="margin-top:8px"><b>Colisión del mapa</b>: ya viene configurada (sólida: bloquea el paso y la vista; visible para todos). Arrastrá para pintar los casilleros o hacé clic de a uno. Los casilleros que quedan pegados se <b>fusionan solos</b> en una sola forma. Mantené <b>Shift</b> para <b>borrar</b> casilleros. Todos ven el contorno, y adentro se borra la grilla para que se vea el dibujo del fondo sin líneas.</p>
      <p class="tk-lapiz-ayuda">Hoy hay <b>${colisionInfo().celdas.length}</b> casillero${colisionInfo().celdas.length === 1 ? '' : 's'} de colisión en este mapa.</p>`;
    }else cuerpo = selectorForma + `
      <label class="etiqueta">Color</label>
      <div class="tk-lapiz-colores">${COLORES.map(c => `<button type="button" class="tk-color${c === elemColor ? ' elegido' : ''}" data-elem-color="${c}" style="background:${c}" title="${c}"></button>`).join('')}</div>
      <label class="etiqueta">Transparencia</label>
      <input type="range" id="elem-alfa-slider" min="0" max="100" step="5" value="${elemAlfa}">
      ${imagenElementoOpcionHtml(elemImagen)}
      ${esTrampa ? '' : `<label class="tk-lapiz-check"><input type="checkbox" id="elem-solido-check"${elemSolido ? ' checked' : ''}> Sólido (bloquea el paso)</label>
      ${soyGM ? `<label class="tk-lapiz-check"><input type="checkbox" id="elem-invisible-check"${elemInvisible ? ' checked' : ''}> Invisible para jugadores</label>` : ''}`}
      <label class="etiqueta" title="Para efectos que afectan un área durante X turnos: la forma se elimina sola al terminar el último turno (cuando el GM pasa el turno con ⟳ Mantenimiento)">Turnos que dura (opcional)</label>
      <input type="number" id="elem-turnos" min="0" max="99" step="1" value="${elemTurnos || ''}" placeholder="0 = sin límite" title="Vacío o 0: queda hasta que alguien la borre. N: se elimina sola al terminar el turno N (cada ⟳ Mantenimiento del GM cuenta un turno)">
      ${esTrampa ? `<div class="tk-lapiz-ayuda" style="margin-top:6px"><b>${esc(elemTrampaNombre || 'Sin nombre')}</b><br>${esc(trampaResumenFrase(elemTrampaNombre, trampaDanoValido(elemTrampaDano) ? elemTrampaDano.trim() : '', elemTrampaIgnoraDef, elemTrampaEstado, elemTrampaEstadoTurnos, elemTrampaAmiga, elemTrampaTeleport ? (elemTrampaDestino || 'un destino (falta marcarlo)') : ''))}</div>
      ${elemTrampaTeleport ? `<button type="button" class="btn" id="trampa-destino" style="margin-top:6px;width:100%">🌀 ${elemTrampaDestino ? 'Cambiar' : 'Elegir'} el destino en el mapa</button>` : ''}
      <button type="button" class="btn primary" id="trampa-asistente" style="margin-top:6px;width:100%" title="Nombre, superficie, daño, estado y más, paso a paso">🪄 ${elemTrampaNombre ? 'Cambiar' : 'Armar'} la trampa paso a paso</button>
      <button type="button" class="btn" id="trampa-guardar" style="margin-top:6px;width:100%" title="Dejarla guardada para colocarla de nuevo cuando quieras">💾 Guardar como recurrente</button>
      ${trampasGuardadasHtml()}` : ''}
      <p class="tk-lapiz-ayuda">${elemTipo === 'flor' ? `Clic para elegir el centro y arrastrá hasta el tamaño que quieras (diámetro hasta ${2 * TAMANO_ELEMENTO_MAX + 1}); un clic solo deja una casilla.` : elemTipo === 'linea' ? 'Clic y arrastrá: la línea llega hasta donde sueltes, en la dirección más cercana.' : 'Clic y arrastrá para pintar los casilleros.'}${esTrampa ? '' : ` ${elemSolido ? 'Sólido — bloquea ese casillero y cualquier ruta que lo cruce.' : 'Transitable — no bloquea el paso.'}${soyGM ? ' Invisible: solo vos y quien lo creó ven el contorno (punteado violeta); con Sólido sirve para marcar zonas intransitables ya dibujadas en el fondo, sin que se note un dibujo de más.' : ''}`}</p>
      ${borradorElemento ? `<div class="nt-pista" style="color:var(--paper);border-top:1px solid var(--line);padding-top:8px;margin-top:8px">
        Borrador: ajustá lo de arriba y mirá cómo queda en el mapa. Hacé clic en otro lado (o Enter) para crearlo; Esc o clic derecho lo descartan.</div>
        <div class="fila"><button type="button" class="btn primary" id="borrador-crear">✔ Crear</button><button type="button" class="btn" id="borrador-descartar">Descartar</button></div>` : ''}`;
  }else{
    caja.hidden = true; caja.innerHTML = ''; return;
  }
  caja.hidden = false;
  caja.innerHTML = `
    <div class="herr-cab"><span>${datos ? datos.icono + ' ' + esc(datos.nombre) : ''}</span><button type="button" id="herr-cerrar" title="Salir de esta herramienta (Esc o clic derecho en el mapa)">✕</button></div>
    ${cuerpo}`;
}

function abrirToolkit(abrir){
  toolkitAbierto = abrir;
  try{ localStorage.setItem('mapa-toolkit-abierto', abrir ? '1' : ''); }catch(e){}
  renderToolkit();
}

$('#toolkit-pestana').onclick = () => abrirToolkit(!toolkitAbierto);
$('#toolkit-lista').addEventListener('click', e => {
  const b = e.target.closest('[data-herramienta]');
  if(!b) return;
  const h = HERRAMIENTAS.find(x => x.id === b.dataset.herramienta);
  if(!h) return;
  if(h.id === 'bitacora'){ abrirBitacoraFlotante(!bitacoraFlotanteAbierta); return; }
  if(!h.lista){ toast(`${h.nombre}: todavía en diseño`); return; }
  // ⬡ Terreno y Formas: el clic despliega/repliega Formas libres/Trampas/Zonas en vez de entrar directo (2026-09-28).
  if(h.id === 'elemento'){
    if(['elemento', 'trampa', 'zonapersistente'].includes(herramientaActiva)){ desactivarHerramienta(); elementoSubmenuAbierto = false; renderToolkit(); return; }
    elementoSubmenuAbierto = !elementoSubmenuAbierto;
    renderToolkit();
    return;
  }
  if(h.id === 'zonapersistente'){
    elementoSubmenuAbierto = false;
    abrirAsistenteZonaNueva();
    return;
  }
  // "Formas libres" activa el modo 'elemento' de siempre (no tiene uno propio, ver HERRAMIENTAS).
  const modo = h.id === 'formalibre' ? 'elemento' : h.id;
  if(herramientaActiva === modo){ desactivarHerramienta(); elementoSubmenuAbierto = false; renderToolkit(); return; }
  if(borradorElemento) consolidarBorradorElemento();
  elementoSubmenuAbierto = false;
  herramientaActiva = modo;
  elemTrampa = h.id === 'trampa';   // el modo ya implica "es una trampa": no hace falta la casilla de antes
  renderToolkit();
  if(elemTrampa && !elemTrampaNombre.trim()) abrirAsistenteTrampaPanel();   // igual que antes al tildar la casilla
});
$('#herramienta-flotante').addEventListener('click', async e => {
  // Trampas recurrentes: guardar la que se está armando, cargar una guardada o borrarla.
  if(e.target.closest('#trampa-guardar')){
    const nombre = elemTrampaNombre.trim();
    if(!nombre){ toast('Ponele un nombre a la trampa para guardarla'); return; }
    const g = {nombre: nombre.slice(0, 40), detalle: elemTrampaDetalle.trim().slice(0, 200), amiga: elemTrampaAmiga,
      tipo: elemTipo, tamano: elemTamano, color: elemColor, alfa: elemAlfa, dano: trampaDanoValido(elemTrampaDano) ? elemTrampaDano.trim() : '', ignoraDef: elemTrampaIgnoraDef, estado: elemTrampaEstado, estadoTurnos: elemTrampaEstadoTurnos,
      ...(elemTrampaTeleport ? {teleport: true} : {}),
      ...(elemTrampaDejaZona ? {dejaZona: true, zonaTurnos: elemTrampaZonaTurnos, zonaEnMantenimiento: elemTrampaZonaEnMant, zonaCadaPaso: elemTrampaZonaCadaPaso,
        zonaResistStat: elemTrampaZonaResistStat, zonaResistValor: elemTrampaZonaResistValor} : {}),
      ...(elemTrampaBibOrigen ? {bibOrigen: elemTrampaBibOrigen} : {})};
    guardarTrampaRecurrente(g);
    toast(`Trampa "${g.nombre}" guardada`);
    return;
  }
  if(e.target.closest('#trampas-catalogo')){ abrirCatalogoTrampas(); return; }
  const tgProponer = e.target.closest('[data-tg-proponer]');
  if(tgProponer){
    const g = trampasGuardadas[num(tgProponer.dataset.tgProponer)];
    // ⬆ Subir (subida unificada, paso 4): disponible para todos al instante; si salió del catálogo, corrección o nueva.
    if(g) Biblioteca.guardar({tipo: 'trampas', datos: g, nombre: g.nombre, nivel: 0, base: typeof TRAMPAS_BASE !== 'undefined' ? TRAMPAS_BASE : [],
      basadoEn: g.bibOrigen && g.bibOrigen.id ? {id: g.bibOrigen.id, nombre: g.nombre} : null,
      alSubir: r => { g.bibOrigen = {tipo: 'trampas', id: r.id, version: r.version}; delete g.bibIgnorada; guardarTrampasGuardadas(); cargarTrampasSubidas(); }});
    return;
  }
  const tgVersion = e.target.closest('[data-tg-version]');
  if(tgVersion){
    const g = trampasGuardadas[num(tgVersion.dataset.tgVersion)];
    const ent = g && versionNuevaDeTrampa(g);
    if(ent) Biblioteca.avisoVersion({nombre: g.nombre, entrada: ent, que: 'La trampa',
      actualizarTxt: 'reemplaza tu trampa guardada (daño, estado, forma…) por la nueva.',
      alActualizar: () => { const i = trampasGuardadas.indexOf(g); if(i >= 0) trampasGuardadas[i] = {...structuredClone(ent.datos), bibOrigen: {tipo: 'trampas', id: ent.id, version: ent.version || 1}}; guardarTrampasGuardadas(); renderHerramientaFlotante(); toast(`Trampa "${g.nombre}" actualizada`); },
      alDejar: () => { g.bibIgnorada = ent.id + ':' + (ent.version || 1); guardarTrampasGuardadas(); renderHerramientaFlotante(); }});
    return;
  }
  const tgUsar = e.target.closest('[data-tg-usar]');
  if(tgUsar){
    cargarTrampaEnPanel(trampasGuardadas[num(tgUsar.dataset.tgUsar)]);
    return;
  }
  const tgBorrar = e.target.closest('[data-tg-borrar]');
  if(tgBorrar){
    const g = trampasGuardadas[num(tgBorrar.dataset.tgBorrar)];
    if(g && (await Confirmar.preguntar(`¿Borrar la trampa guardada "${g.nombre}"?`, {titulo: 'Borrar', si: 'Borrar', peligro: true}))){
      trampasGuardadas.splice(num(tgBorrar.dataset.tgBorrar), 1);
      guardarTrampasGuardadas();
      renderHerramientaFlotante();
    }
    return;
  }
  if(e.target.closest('#herr-cerrar')){ desactivarHerramienta(); return; }
  if(e.target.closest('#niebla-reiniciar')){ nieblaReiniciar(); return; }
  if(e.target.closest('#borrador-crear')){ consolidarBorradorElemento(); return; }
  if(e.target.closest('#borrador-descartar')){ descartarBorradorElemento(); return; }
  const color = e.target.closest('[data-lapiz-color]');
  if(color){
    lapizColor = color.dataset.lapizColor;
    try{ localStorage.setItem('lapiz-color', lapizColor); }catch(err){}
    renderHerramientaFlotante();
    return;
  }
  const colorElem = e.target.closest('[data-elem-color]');
  if(colorElem){
    elemColor = colorElem.dataset.elemColor;
    try{ localStorage.setItem('elem-color', elemColor); }catch(err){}
    renderHerramientaFlotante();
    return;
  }
  const imgElegir = e.target.closest('[data-elemento-imagen]');
  if(imgElegir){
    const entrada = $('#elemento-imagen-archivo');
    entrada.onchange = async ev => {
      const file = ev.target.files[0];
      ev.target.value = '';
      if(!file) return;
      try{
        elemImagen = await prepararImagenElemento(file);
        renderHerramientaFlotante();
      }catch(err){
        console.error('No se pudo preparar la imagen del elemento:', err);
        toast(err.message === 'no-image' ? 'Eso no es una imagen' : 'No se pudo usar esa imagen');
      }
    };
    entrada.click();
    return;
  }
  const imgQuitar = e.target.closest('[data-elemento-imagen-quitar]');
  if(imgQuitar){
    elemImagen = '';
    renderHerramientaFlotante();
  }
});
$('#herramienta-flotante').addEventListener('change', e => {
  if(e.target.id === 'niebla-modo-select'){
    nieblaModo = e.target.value === 'tapar' ? 'tapar' : 'destapar';
    renderHerramientaFlotante();
    return;
  }
  if(e.target.id === 'lapiz-estilo-select'){
    lapizEstilo = e.target.value === 'casillas' ? 'casillas' : 'libre';
    try{ localStorage.setItem('lapiz-estilo', lapizEstilo); }catch(err){}
    renderHerramientaFlotante();
    return;
  }
  if(e.target.id === 'lapiz-permanente-check'){
    lapizPermanente = e.target.checked;
    try{ localStorage.setItem('lapiz-permanente', lapizPermanente ? '1' : ''); }catch(err){}
    renderHerramientaFlotante();
    return;
  }
  if(e.target.id === 'elem-tipo-select'){
    elemTipo = e.target.value;
    borradorElemento = null;  // otra forma: el borrador de la anterior ya no aplica
    try{ localStorage.setItem('elem-tipo', elemTipo); }catch(err){}
    renderHerramientaFlotante();
    return;
  }
  if(e.target.id === 'elem-solido-check'){
    elemSolido = e.target.checked;
    try{ localStorage.setItem('elem-solido', elemSolido ? '1' : ''); }catch(err){}
    renderHerramientaFlotante();
    return;
  }
  if(e.target.id === 'elem-trampa-estado'){
    elemTrampaEstado = e.target.value;
    elemTrampaEstadoStacks = 0; elemTrampaEstadoHp = 0;   // eligió otro estado a mano: los stacks y el daño por turno eran del anterior
    if(!elemTrampaEstado) elemTrampaEstadoTurnos = 0;
    renderHerramientaFlotante();
    return;
  }
  if(e.target.id === 'elem-trampa-ignora-def'){
    elemTrampaIgnoraDef = e.target.checked;
    renderHerramientaFlotante();
    return;
  }
  if(e.target.id === 'elem-trampa-amiga'){
    elemTrampaAmiga = e.target.checked;
    renderHerramientaFlotante();
    return;
  }
  if(e.target.id === 'elem-invisible-check'){
    elemInvisible = e.target.checked;
    try{ localStorage.setItem('elem-invisible', elemInvisible ? '1' : ''); }catch(err){}
    pedirDibujo();
    return;
  }
  if(e.target.id === 'elem-tamano-input'){
    elemTamano = Math.max(1, Math.min(TAMANO_ELEMENTO_MAX, Math.round(num(e.target.value)) || 1));
    try{ localStorage.setItem('elem-tamano', elemTamano); }catch(err){}
    renderHerramientaFlotante();
  }
});
$('#herramienta-flotante').addEventListener('click', e => {
  if(e.target.closest('#trampa-asistente')) abrirAsistenteTrampaPanel();
  if(e.target.closest('#trampa-destino')) elegirDestino(h => { elemTrampaDestino = h.col + ',' + h.fila; renderHerramientaFlotante(); toast('Destino marcado'); });
});
$('#herramienta-flotante').addEventListener('input', e => {
  if(e.target.id === 'elem-turnos'){ elemTurnos = Math.max(0, Math.min(99, Math.round(num(e.target.value)) || 0)); return; }
  if(e.target.id === 'elem-trampa-nombre'){ elemTrampaNombre = e.target.value; return; }
  if(e.target.id === 'elem-trampa-detalle'){ elemTrampaDetalle = e.target.value; return; }
  if(e.target.id === 'elem-trampa-dano'){ elemTrampaDano = e.target.value; return; }
  if(e.target.id === 'elem-trampa-estado-turnos'){ elemTrampaEstadoTurnos = Math.max(0, Math.min(20, Math.round(num(e.target.value)) || 0)); return; }
  if(e.target.id === 'niebla-radio'){
    nieblaPincelRadio = Math.max(0, Math.min(5, num(e.target.value)));
    const et = e.target.previousElementSibling;
    if(et) et.textContent = `Tamaño: ${Combatiente.areaTxt(nieblaPincelRadio)}`;
  }
  if(e.target.id === 'elem-alfa-slider'){
    elemAlfa = num(e.target.value);
    try{ localStorage.setItem('elem-alfa', elemAlfa); }catch(err){}
    pedirDibujo();  // se ve en vivo sobre el borrador
  }
  if(e.target.id === 'elem-tamano-input'){
    const v = Math.round(num(e.target.value));
    if(v >= 1 && v <= TAMANO_ELEMENTO_MAX) elemTamano = v;
  }
});
renderToolkit();

/* ---------- Bitácora de la partida ----------
   Compartida con la ficha (mismo esquema, mismos permisos): todos la
   leen; cualquiera suma páginas y entradas y corrige cualquiera; borra el
   autor (o quien creó la página) o el GM. Acá vive en una cajita
   flotante y arrastrable (mismo patrón que la Mesa de la ficha), que se
   abre y se cierra del todo con 📖 en la caja de herramientas.
   campanas/<partida>/bitacora/<página> = {nombre, creado, creadoUid, creadoPor}
   campanas/<partida>/bitacora/<página>/entradas/<id> =
     {texto, uid, autor, creado, editado?, editadoUid?, editadoPor?} */
const BITACORA_COLORES = ['#E0A458', '#8EE6A8', '#7FB3F0', '#F08FA8', '#C9A8F5', '#F2D16B', '#6FD6C8', '#F0A36F'];
let bitacoraPaginas = [];        // [{id, nombre, creadoUid}]
let bitacoraActiva = '';
let bitacoraEntradas = [];       // de la página activa
let bitacoraCorteEntradas = null;
let bitacoraEditando = '';       // id de la entrada que se está corrigiendo
let bitacoraConectada = false;

function bitacoraColor(uid){
  let h = 0;
  for(const ch of String(uid || '')) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return BITACORA_COLORES[h % BITACORA_COLORES.length];
}
function bitacoraFecha(ts){
  if(!ts || !ts.toDate) return '';
  const d = ts.toDate();
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function bitacoraEscuchar(){
  if(bitacoraConectada) return;
  bitacoraConectada = true;
  try{ bitacoraActiva = localStorage.getItem('bitacora-activa-' + FB_CAMPANA) || ''; }catch(e){}
  fbDb.collection(fbRutaCampana('bitacora')).orderBy('creado').onSnapshot(snap => {
    bitacoraPaginas = snap.docs.map(d => ({id: d.id, ...d.data()}));
    if(!bitacoraPaginas.some(p => p.id === bitacoraActiva)) bitacoraElegir(bitacoraPaginas.length ? bitacoraPaginas[0].id : '');
    else if(!bitacoraCorteEntradas) bitacoraElegir(bitacoraActiva);
    else bitacoraRender();
  }, err => {
    console.error('Error escuchando la bitácora:', err);
    $('#bitacora-estado').textContent = 'No se pudo leer. ¿Reglas nuevas de Firestore?';
  });
}

// Página anterior (-1) o siguiente (+1) a la activa, en el orden de
// bitacoraPaginas (por fecha de creación). No hace nada en las puntas.
function bitacoraIrPagina(delta){
  const idx = bitacoraPaginas.findIndex(p => p.id === bitacoraActiva);
  if(idx < 0) return;
  const destino = idx + delta;
  if(destino < 0 || destino >= bitacoraPaginas.length) return;
  bitacoraElegir(bitacoraPaginas[destino].id);
}

function bitacoraElegir(id){
  bitacoraActiva = id;
  bitacoraEditando = '';
  try{ localStorage.setItem('bitacora-activa-' + FB_CAMPANA, id); }catch(e){}
  if(bitacoraCorteEntradas){ bitacoraCorteEntradas(); bitacoraCorteEntradas = null; }
  bitacoraEntradas = [];
  if(id){
    bitacoraCorteEntradas = fbDb.collection(fbRutaCampana(`bitacora/${id}/entradas`)).orderBy('creado')
      .onSnapshot(snap => {
        bitacoraEntradas = snap.docs.map(d => ({id: d.id, ...d.data({serverTimestamps: 'estimate'})}));
        const lista = $('#bitacora-entradas');
        const alFondo = lista.scrollHeight - lista.scrollTop - lista.clientHeight < 30;
        bitacoraRender();
        if(alFondo) lista.scrollTop = lista.scrollHeight;
      }, err => console.error('Error escuchando las entradas de la bitácora:', err));
  }
  bitacoraRender();
}

function bitacoraPuedeBorrar(uidAutor){
  return !!(fbMiembro && (soyGM || (fbUsuario && fbUsuario.uid === uidAutor)));
}

function bitacoraRender(){
  const tabs = $('#bitacora-tabs'), lista = $('#bitacora-entradas');
  if(!tabs || !lista) return;
  const conectado = !!(bitacoraConectada && fbDb && fbMiembro);
  $('#bitacora-estado').textContent = conectado ? '' : 'conectando…';
  $('#btn-bitacora-add').disabled = !conectado;
  $('#bitacora-sumar').disabled = !conectado || !bitacoraActiva;
  $('#bitacora-nueva').disabled = !conectado || !bitacoraActiva;
  if(!conectado){
    tabs.innerHTML = '';
    lista.innerHTML = '<div class="bit-vacia">Sin conexión con la partida.</div>';
    return;
  }
  // No redibujar las pestañas mientras alguien les cambia el nombre (pero
  // sí después de clickear una flecha o borrar: el foco queda en ese
  // botón, que también está adentro de #bitacora-tabs).
  const editandoNombre = document.activeElement && document.activeElement.matches
    && document.activeElement.matches('[data-bit-nombre]') && tabs.contains(document.activeElement);
  if(!editandoNombre){
    const idx = bitacoraPaginas.findIndex(p => p.id === bitacoraActiva);
    const activa = idx >= 0 ? bitacoraPaginas[idx] : null;
    // Una sola pestaña a la vez (la activa) con flechas para pasar de
    // página y un contador — antes se listaban todas juntas y la fila
    // se agrandaba sin límite a medida que se sumaban páginas.
    tabs.innerHTML = activa ? `
      <button type="button" class="bit-nav-flecha" data-bit-pag-prev title="Página anterior"${idx <= 0 ? ' disabled' : ''}>◀</button>
      <div class="bit-tab active" data-bit-pagina="${esc(activa.id)}">
        <input class="bit-tab-name" data-bit-nombre="${esc(activa.id)}" value="${esc(activa.nombre || 'Página')}" maxlength="40" title="Editá el nombre y apretá Enter">
        ${bitacoraPuedeBorrar(activa.creadoUid) ? `<button type="button" class="bit-tab-x" data-bit-borrar-pagina="${esc(activa.id)}" title="Borrar página">×</button>` : ''}
      </div>
      <button type="button" class="bit-nav-flecha" data-bit-pag-next title="Página siguiente"${idx >= bitacoraPaginas.length - 1 ? ' disabled' : ''}>▶</button>
      <span class="bit-contador">${idx + 1}/${bitacoraPaginas.length}</span>
    ` : '';
  }
  if(!bitacoraPaginas.length){
    lista.innerHTML = '<div class="bit-vacia">Todavía no hay páginas. Tocá "+ Página" para empezar.</div>';
    return;
  }
  if(!bitacoraEntradas.length){
    lista.innerHTML = '<div class="bit-vacia">Esta página está vacía: sumá lo primero abajo.</div>';
    return;
  }
  // No redibujar mientras alguien corrige una entrada (se perdería lo escrito).
  if(bitacoraEditando && lista.querySelector('textarea[data-bit-edicion]')) return;
  lista.innerHTML = bitacoraEntradas.map(en => {
    const color = bitacoraColor(en.uid);
    const firma = `${esc(en.autor || '?')} · ${bitacoraFecha(en.creado)}` +
      (en.editadoPor ? ` · editado por ${esc(en.editadoPor)} ${bitacoraFecha(en.editado)}` : '');
    if(en.id === bitacoraEditando){
      return `<div class="bit-entrada" style="border-left-color:${color};flex-direction:column">
        <textarea data-bit-edicion="${esc(en.id)}">${esc(en.texto || '')}</textarea>
        <div class="fila" style="margin-top:4px;gap:6px">
          <button type="button" class="mini" data-bit-guardar="${esc(en.id)}">Guardar</button>
          <button type="button" class="mini" data-bit-cancelar="1">Cancelar</button>
        </div>
      </div>`;
    }
    return `<div class="bit-entrada" style="border-left-color:${color}">
      <div class="bit-texto" style="color:${color}">${esc(en.texto || '')} <span class="bit-firma">(${firma})</span></div>
      <div class="bit-botones">
        <button type="button" class="mini" data-bit-editar="${esc(en.id)}" title="Corregir">✎</button>
        ${bitacoraPuedeBorrar(en.uid) ? `<button type="button" class="mini peligro" data-bit-borrar="${esc(en.id)}" title="Borrar">✕</button>` : ''}
      </div>
    </div>`;
  }).join('');
}

async function bitacoraNuevaPagina(){
  if(!fbDb || !fbMiembro) return;
  try{
    const ref = await fbDb.collection(fbRutaCampana('bitacora')).add({
      nombre: `Página ${bitacoraPaginas.length + 1}`,
      creado: firebase.firestore.FieldValue.serverTimestamp(),
      creadoUid: fbUsuario.uid,
      creadoPor: fbMiembro.nombre,
    });
    bitacoraElegir(ref.id);
    setTimeout(() => { const i = document.querySelector(`[data-bit-nombre="${ref.id}"]`); if(i){ i.focus(); i.select(); } }, 300);
  }catch(err){
    console.error('No se pudo crear la página:', err);
    toast(err.code === 'permission-denied' ? 'No se pudo: faltan publicar las reglas nuevas de Firestore' : 'No se pudo crear la página');
  }
}

async function bitacoraSumar(){
  const campo = $('#bitacora-nueva');
  const texto = campo.value.trim();
  if(!texto || !bitacoraActiva || !fbDb || !fbMiembro) return;
  campo.disabled = true;
  try{
    await fbDb.collection(fbRutaCampana(`bitacora/${bitacoraActiva}/entradas`)).add({
      texto: texto.slice(0, 4000),
      uid: fbUsuario.uid,
      autor: fbMiembro.nombre,
      creado: firebase.firestore.FieldValue.serverTimestamp(),
    });
    campo.value = '';
    const lista = $('#bitacora-entradas');
    setTimeout(() => { lista.scrollTop = lista.scrollHeight; }, 50);
  }catch(err){
    console.error('No se pudo sumar a la bitácora:', err);
    toast(err.code === 'permission-denied' ? 'No se pudo: faltan publicar las reglas nuevas de Firestore' : 'No se pudo sumar a la bitácora');
  }finally{
    campo.disabled = false;
    campo.focus();
  }
}

async function bitacoraGuardarEdicion(id){
  const campo = document.querySelector(`textarea[data-bit-edicion="${id}"]`);
  if(!campo) return;
  const texto = campo.value.trim();
  if(!texto){ toast('Si querés sacarla, usá ✕'); return; }
  try{
    await fbDb.doc(fbRutaCampana(`bitacora/${bitacoraActiva}/entradas/${id}`)).update({
      texto: texto.slice(0, 4000),
      editado: firebase.firestore.FieldValue.serverTimestamp(),
      editadoUid: fbUsuario.uid,
      editadoPor: fbMiembro.nombre,
    });
    bitacoraEditando = '';
    bitacoraRender();
  }catch(err){
    console.error('No se pudo corregir la entrada:', err);
    toast('No se pudo guardar la corrección');
  }
}

async function bitacoraBorrarPagina(id){
  const p = bitacoraPaginas.find(x => x.id === id);
  if(!(await Confirmar.preguntar(`¿Borrar la página "${p ? p.nombre : ''}" con todo lo que tiene, para toda la mesa?`, {titulo: 'Borrar', si: 'Borrar', peligro: true}))) return;
  try{
    const entradas = await fbDb.collection(fbRutaCampana(`bitacora/${id}/entradas`)).get();
    const lote = fbDb.batch();
    entradas.docs.forEach(d => lote.delete(d.ref));
    lote.delete(fbDb.doc(fbRutaCampana(`bitacora/${id}`)));
    await lote.commit();
  }catch(err){
    console.error('No se pudo borrar la página:', err);
    toast('No se pudo borrar la página (solo quien la creó o el GM)');
  }
}

$('#btn-bitacora-add').onclick = bitacoraNuevaPagina;
$('#bitacora-sumar').onclick = bitacoraSumar;
$('#bitacora-nueva').addEventListener('keydown', e => {
  if(e.key === 'Enter' && (e.ctrlKey || e.metaKey)){ e.preventDefault(); bitacoraSumar(); }
});
$('#bitacora-tabs').addEventListener('click', e => {
  const borrar = e.target.closest('[data-bit-borrar-pagina]');
  if(borrar){ bitacoraBorrarPagina(borrar.dataset.bitBorrarPagina); return; }
  if(e.target.closest('[data-bit-pag-prev]')){ bitacoraIrPagina(-1); return; }
  if(e.target.closest('[data-bit-pag-next]')){ bitacoraIrPagina(1); return; }
  const tab = e.target.closest('[data-bit-pagina]');
  if(tab && tab.dataset.bitPagina !== bitacoraActiva) bitacoraElegir(tab.dataset.bitPagina);
});
$('#bitacora-tabs').addEventListener('change', e => {
  const input = e.target.closest('[data-bit-nombre]');
  if(!input) return;
  const nombre = input.value.trim().slice(0, 40);
  if(!nombre) return;
  fbDb.doc(fbRutaCampana(`bitacora/${input.dataset.bitNombre}`)).update({nombre})
    .catch(err => { console.error('No se pudo renombrar la página:', err); toast('No se pudo renombrar la página'); });
});
$('#bitacora-tabs').addEventListener('keydown', e => {
  if(e.key === 'Enter' && e.target.matches('[data-bit-nombre]')){ e.preventDefault(); e.target.blur(); }
});
$('#bitacora-entradas').addEventListener('click', async e => {
  const editar = e.target.closest('[data-bit-editar]');
  if(editar){
    bitacoraEditando = editar.dataset.bitEditar;
    bitacoraRender();
    const campo = document.querySelector(`textarea[data-bit-edicion="${bitacoraEditando}"]`);
    if(campo){ campo.focus(); campo.setSelectionRange(campo.value.length, campo.value.length); }
    return;
  }
  const guardar = e.target.closest('[data-bit-guardar]');
  if(guardar){ bitacoraGuardarEdicion(guardar.dataset.bitGuardar); return; }
  if(e.target.closest('[data-bit-cancelar]')){ bitacoraEditando = ''; bitacoraRender(); return; }
  const borrar = e.target.closest('[data-bit-borrar]');
  if(borrar){
    if(!(await Confirmar.preguntar('¿Borrar esta entrada de la bitácora, para toda la mesa?', {titulo: 'Borrar', si: 'Borrar', peligro: true}))) return;
    fbDb.doc(fbRutaCampana(`bitacora/${bitacoraActiva}/entradas/${borrar.dataset.bitBorrar}`)).delete()
      .catch(err => { console.error('No se pudo borrar la entrada:', err); toast('No se pudo borrar (solo su autor o el GM)'); });
  }
});

/* Cajita flotante y arrastrable (mismo patrón que #mesa en la ficha). */
{
  const caja = $('#bitacora-flotante');
  const cabecera = $('#bitacora-cabecera');
  let posicion = null;
  try{ posicion = JSON.parse(localStorage.getItem('bitacora-posicion') || 'null'); }catch(e){}
  const encuadrar = () => {
    if(!posicion){ caja.style.left = caja.style.top = ''; return; }
    const x = Math.max(0, Math.min(posicion.x, window.innerWidth - caja.offsetWidth));
    const y = Math.max(0, Math.min(posicion.y, window.innerHeight - caja.offsetHeight));
    caja.style.left = x + 'px'; caja.style.top = y + 'px';
    caja.style.right = caja.style.bottom = 'auto';
  };
  window.addEventListener('resize', () => { if(!caja.hidden) encuadrar(); });

  let arrastre = null, recienMovida = false;
  cabecera.addEventListener('pointerdown', e => {
    if(e.button !== 0 || e.target.closest('#bitacora-cerrar, #bitacora-opacidad-caja')) return;
    const r = caja.getBoundingClientRect();
    arrastre = {px: e.clientX, py: e.clientY, x: r.left, y: r.top, movio: false};
    cabecera.setPointerCapture(e.pointerId);
  });
  cabecera.addEventListener('pointermove', e => {
    if(!arrastre) return;
    const dx = e.clientX - arrastre.px, dy = e.clientY - arrastre.py;
    if(!arrastre.movio && Math.abs(dx) + Math.abs(dy) < 5) return;
    arrastre.movio = true;
    caja.classList.add('arrastrando');
    posicion = {x: arrastre.x + dx, y: arrastre.y + dy};
    encuadrar();
  });
  const soltar = () => {
    if(!arrastre) return;
    recienMovida = arrastre.movio;
    arrastre = null;
    caja.classList.remove('arrastrando');
    if(recienMovida){
      posicion = {x: parseFloat(caja.style.left), y: parseFloat(caja.style.top)};
      try{ localStorage.setItem('bitacora-posicion', JSON.stringify(posicion)); }catch(e){}
    }
  };
  cabecera.addEventListener('pointerup', soltar);
  cabecera.addEventListener('pointercancel', soltar);

  const aplicarColapso = colapsada => {
    caja.classList.toggle('colapsada', colapsada);
    $('#bitacora-flecha').textContent = colapsada ? '▸' : '▾';
    try{ localStorage.setItem('bitacora-colapsada', colapsada ? '1' : ''); }catch(e){}
    encuadrar();
  };
  cabecera.onclick = e => {
    if(recienMovida){ recienMovida = false; return; }
    if(e.target.closest('#bitacora-cerrar, #bitacora-opacidad-caja')) return;
    aplicarColapso(!caja.classList.contains('colapsada'));
  };
  $('#bitacora-cerrar').onclick = () => abrirBitacoraFlotante(false);

  // Transparencia: se guarda por navegador y se aplica solo al fondo (el
  // texto y los botones quedan siempre nítidos), como la aura de un token.
  const aplicarOpacidad = pct => {
    const hex = getComputedStyle(document.documentElement).getPropertyValue('--panel').trim();
    caja.style.background = colorConAlfa(hex, Math.max(30, Math.min(100, pct)) / 100);
  };
  let opacidad = 100;
  try{ opacidad = parseInt(localStorage.getItem('bitacora-opacidad'), 10) || 100; }catch(e){}
  $('#bitacora-opacidad-slider').value = opacidad;
  aplicarOpacidad(opacidad);
  $('#bitacora-opacidad-slider').addEventListener('input', e => {
    const pct = num(e.target.value);
    aplicarOpacidad(pct);
    try{ localStorage.setItem('bitacora-opacidad', pct); }catch(e2){}
  });
  const opacidadCaja = $('#bitacora-opacidad-caja');
  const opacidadBtn = $('#bitacora-opacidad-btn');
  const opacidadLista = $('#bitacora-opacidad-lista');
  const abrirOpacidad = abrir => {
    opacidadLista.hidden = !abrir;
    opacidadBtn.setAttribute('aria-expanded', abrir ? 'true' : 'false');
  };
  opacidadBtn.onclick = () => abrirOpacidad(opacidadLista.hidden);
  document.addEventListener('pointerdown', e => {
    if(!opacidadLista.hidden && !e.target.closest('#bitacora-opacidad-caja')) abrirOpacidad(false);
  });
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && !opacidadLista.hidden) abrirOpacidad(false); });

  window.abrirBitacoraFlotante = abrir => {
    bitacoraFlotanteAbierta = abrir;
    try{ localStorage.setItem('mapa-bitacora-abierta', abrir ? '1' : ''); }catch(e){}
    caja.hidden = !abrir;
    renderToolkit();
    if(!abrir) return;
    let colapsada = false;
    try{ colapsada = localStorage.getItem('bitacora-colapsada') === '1'; }catch(e){}
    aplicarColapso(colapsada);
    if(fbDb && fbMiembro) bitacoraEscuchar();
  };
}
try{
  if(localStorage.getItem('mapa-bitacora-abierta') === '1') abrirBitacoraFlotante(true);
}catch(e){}

/* ---------- Mesa (tiradas compartidas): comun/mesa.js ---------- */

const MESA_DESDE = 'mapa';
const MESA_AVISAR_SIN_SESION = true;
// Las tiradas del mapa salen a nombre del usuario.
function mesaQuien(){ return ''; }








$('#mesa-historial').innerHTML = mesaBorrarHtml();
// Grilla de dados debajo del botón de la barra de arriba (comun/grilla-dados.js).
grillaConectar($('#toolkit-dados'), {
  lado: 'costado',
  // Debajo de la grilla: prender/apagar la animación y elegir cómo se ven y suenan los dados 3D.
  pie: '<a href="../comun/prueba-dados.html" target="_blank" rel="noopener" title="Elegir cómo se ven y suenan tus dados 3D">Personalización 🎲</a>' + dadosBotonHtml().replace('class="dados3d-boton"', 'class="dados3d-boton" data-texto="1"'),
  alTirar: f => mesaPublicar('Tirada libre', tirarDados(f)),
});

$('#mesa-tirar').onsubmit = e => {
  e.preventDefault();
  const r = tirarDados($('#mesa-formula').value);
  if(!r){ toast('Fórmula no válida — ej: 2d6+3'); return; }
  mesaPublicar('Tirada libre', r);
  $('#mesa-formula').value = '';
};

/* ---------- Arranque ---------- */

function mostrarAviso(html, boton){
  const a = $('#aviso-mapa');
  a.innerHTML = html + (boton ? `<div><button type="button" class="btn primary" id="aviso-boton">${esc(boton.texto)}</button></div>` : '');
  a.hidden = false;
  if(boton) $('#aviso-boton').onclick = boton.accion;
}

function arrancarEnVivo(){
  $('#aviso-mapa').hidden = true;
  soyGM = fbMiembro.gm === true;
  actualizarCabecera();
  if($('#btn-reroll')) $('#btn-reroll').hidden = true;   // (2026-10-10, dueño) el cuadradito de la barra se sacó: la moneda se usa con su botón brillante (comun/flotantes.js)
  bnPintarInterruptor();   // ⚗ Botonera nueva (prueba, para quien la quiera prender)
  if(soyGM && bnActiva()) acCargarPiezas().catch(err => console.error(err));   // los ganchos del duelo de los creeps (paso 4c, tanda 4)
  $('#btn-botonera-nueva').onclick = bnAlternar;
  escucharMiembros();
  escucharVinculables();
  escucharMantenimiento();
  recibidosEscuchar();   // los estados y las recompensas que les llegan a mis personajes (B-8)
  Pausa.iniciar({donde: 'mapa'});   // ⏸ la pausa de la partida (2026-10-10): el jugador ve el mapa congelado
  if(soyGM) Pausa.boton($('#btn-pausa-mapa'));
  PPT.iniciar();   // ✊ piedra, papel o tijera: los juegos donde juego yo (comun/ppt.js)
  // Estos dos disparan cambiarMapaMostrado (y con eso, fondo/modo/
  // iniciativa/tokens del mapa que corresponda).
  escucharMapas();
  escucharMapaActivo();
  escucharBotinParaJugador();
  mesaEscuchar();
  mesaHistorialAlEntrar();
  // Duelo paso a paso (comun/duelo.js): el cuadro se abre solo para todos; las tiradas de cada uno se piden al iframe de su ficha (o de las Acciones del creep).
  setTimeout(precargarMarco, 6000);   // abrir más rápido la primera Botonera o Acciones (paso 4)
  Duelo.escuchar({stacksExtra: (d, spec) => /veneno/i.test(String(spec.nombre || '')) ? venenistaDe(d.atacante) : 0,   // el envenenador (js/13)
    relay: dueloRelayMapa, hooksLocal: lado => bnHooksDuelo(lado) || bnHooksDueloInv(lado) || acHooksDuelo(lado), controlDe: lado => {   // 🎮 personaje controlado por el GM: su lado lo maneja el GM
    if(!lado || lado.tipo !== 'pj') return '';
    const f = fichasPub.get(String(lado.ref || '').split(SEP_INVOCACION)[0]);
    return (f && f.resumen && f.resumen.control) || '';
  }, aplicar: dueloAplicarDano, aplicarEfecto: dueloAplicarEfecto, opcionesLocal: dueloOpcionesLocal, flashLocal: dueloFlashLocal, grupoResuelto: dueloGrupoResuelto, chequearDodge: dueloChequearDodge, dodgeEmpieza: dueloDodgeEmpieza, dodgeTermina: dueloDodgeTermina, paso: (...a) => dueloPasoCronica(...a), aplicaDemora: true, bloqueado: d => { dueloEmpujon(d); dueloAtraviesaEscudo(d).catch(err => console.error('No se pudo abollar el escudo:', err)); }, flechaErrada: d => flechaErrada(d), terminaTurno: d => dueloTerminaTurno(d).catch(err => console.error('No se pudo terminar el turno (Degollar):', err))});   // 🏹 la flecha especial que erra (js/33)   // Empujón (js/26)   // js/16 carga después
  escucharAreas();   // hechizos de área (Paso 4/7 del casteo): el círculo compartido y, el GM, la cascada
  actualizarBotonMapas();
  // Si ya estaba abierta de una sesión anterior, recién ahora hay conexión.
  if(bitacoraFlotanteAbierta) bitacoraEscuchar();
  renderPanel(true);
}

async function iniciar(){
  new ResizeObserver(ajustarTamano).observe(lienzo);
  ajustarTamano();
  renderPanel(true);

  // Sin sesión, sin partida elegida o sin haberse unido: al inicio del sitio.
  const entrada = await fbEntrarAPartida();
  if(entrada === 'redirigiendo') return;
  if(entrada !== 'ok'){
    estado('sin internet');
    mostrarAviso('No se pudo cargar Firebase. Revisá la conexión y recargá la página.');
    $('#mesa-cuerpo').innerHTML = '<div class="mesa-vacia">Sin conexión.</div>';
    return;
  }
  arrancarEnVivo();
}

iniciar();
