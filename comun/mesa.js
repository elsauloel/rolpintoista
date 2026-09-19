/* =========================================================
   MESA — tiradas compartidas en vivo (Firebase)
   Compartido por la ficha, gm-tools y el mapa (antes estaba copiado en
   los tres). Todas las tiradas pasan por mesaPublicar(), que las guarda
   en campanas/<partida>/tiradas; la Mesa muestra las últimas de todos al
   instante. Sin internet las tiradas funcionan igual, solo que no se
   comparten. Ver docs/workflow-firebase.md.

   Cada herramienta define, en su propio script:
   - MESA_DESDE: 'ficha' | 'gm' | 'mapa' (se guarda en cada tirada).
   - mesaQuien(origen): quién tira (el personaje, el creep o '').
     Si el origen empieza con "<quien> · ", ese prefijo se saca del origen
     (gm-tools arma "<creep> · Bloqueo").
   - MESA_AVISAR_SIN_SESION (opcional): avisar si se tira sin haber
     entrado a la partida (el mapa).
   La ficha y gm-tools usan la cajita flotante: mesaIniciar(alEntrar)
   la arma, entra a la partida y después llama a alEntrar(). El mapa
   tiene su propia Mesa en el HTML y solo usa mesaPublicar/mesaEscuchar.
   Usa $, esc, fmt, num y toast de cada herramienta.
   ========================================================= */

const MESA_MAX = 30;

let mesaIdsVistos = null;

function mesaEstado(texto){
  const el = document.getElementById('mesa-estado');
  if(el) el.textContent = texto;
}

// Descripción de la habilidad que se está ejecutando: viaja con su tirada,
// para que sea una sola línea en la Mesa y no dos.
let mesaTextoPendiente = '';
function mesaConTexto(detalle){ mesaTextoPendiente = String(detalle || '').slice(0, 300); }

async function mesaPublicar(origen, r){
  if(!fbDb || !fbUsuario || !fbMiembro){
    if(typeof MESA_AVISAR_SIN_SESION !== 'undefined' && MESA_AVISAR_SIN_SESION) toast('Entrá a la mesa para tirar');
    return;
  }
  const texto = mesaTextoPendiente;
  mesaTextoPendiente = '';
  const quien = String(mesaQuien(origen) || '');
  let origenTxt = String(origen || '');
  if(quien && origenTxt.startsWith(quien + ' · ')) origenTxt = origenTxt.slice(quien.length + 3);
  const doc = {
    uid: fbUsuario.uid,
    jugador: fbMiembro.nombre,
    quien,
    origen: origenTxt,
    formula: String(r.formula || ''),
    rolls: (r.rolls || []).slice(0, 100),
    mod: num(r.mod),
    total: num(r.total),
    desde: MESA_DESDE,
    cuando: firebase.firestore.FieldValue.serverTimestamp(),
  };
  try{
    await fbDb.collection(fbRutaCampana('tiradas')).add(texto ? {...doc, texto} : doc);
  }catch(err){
    // Reglas viejas (no conocen "texto"): se publica la tirada igual.
    if(texto && err.code === 'permission-denied'){
      try{
        await fbDb.collection(fbRutaCampana('tiradas')).add({...doc, cuando: firebase.firestore.FieldValue.serverTimestamp()});
        return;
      }catch(e2){ err = e2; }
    }
    console.error('No se pudo publicar la tirada en la mesa:', err);
    toast('La tirada no se pudo compartir con la mesa');
  }
}

// Color del nombre en la Mesa: dorado las propias, verde las de aliados,
// rojo las de creeps (desde gm-tools con un creep), blanco las neutras
// (tiradas libres sin personaje de otros) y lila el pase de turno.
function mesaClaseQuien(t){
  if(t.desde === 'mantenimiento') return 'mesa-q-turno';
  if(t.desde === 'gm' && t.quien) return 'mesa-q-creep';
  if(fbUsuario && t.uid === fbUsuario.uid) return 'mesa-q-propia';
  return t.quien ? 'mesa-q-aliado' : 'mesa-q-neutra';
}

// Contenido de una fila de tirada normal (no las líneas del sistema ni las
// de efectos al golpear, que arman lo suyo aparte): lo usa cada fila de
// #mesa-cuerpo y, si existe, el resumen de la última tirada (#mesa-resumen,
// lo único que se ve con la cajita achicada — ver mesaRender más abajo).
function mesaFilaContenido(t){
  const quien = t.quien || t.jugador || '?';
  const usuario = t.quien && t.jugador && t.quien !== t.jugador ? ` <span class="mesa-usuario">(${esc(t.jugador)})</span>` : '';
  const mod = num(t.mod) ? ` ${t.mod > 0 ? '+' : ''}${fmt(num(t.mod))}` : '';
  return `<span class="mesa-total">${fmt(num(t.total))}</span>` +
    `<span class="mesa-quien ${mesaClaseQuien(t)}">${esc(quien)}</span>${usuario} ${esc(t.origen)}` +
    `<div class="mesa-detalle">${esc(t.formula)} [${esc((t.rolls || []).join(', '))}]${esc(mod)}</div>` +
    (t.texto ? `<div class="mesa-texto">${esc(t.texto)}</div>` : '');
}

// Alerta del ojo 👁 del GM (revela lo que estaba oculto): línea roja en la
// Mesa y, en todas las pantallas, un destello rojo con un ojo grande que
// aparece de golpe y a 1–2 segundos se apaga con fade. (Idea a futuro: cambiar
// el emoji por un PNG de ojo con fondo transparente.)
function mesaAlertaOjo(){
  if(!document.getElementById('mesa-alerta-css')){
    const st = document.createElement('style');
    st.id = 'mesa-alerta-css';
    st.textContent =
      '.mesa-tirada.mesa-alerta{background:rgba(160,20,20,.9)!important;color:#fff!important;border:1px solid #ff6a6a!important}' +
      '.mesa-tirada.mesa-alerta .mesa-quien,.mesa-tirada.mesa-alerta .mesa-detalle{color:#fff!important}' +
      '#alerta-ojo{position:fixed;inset:0;z-index:99999;pointer-events:none;display:flex;align-items:center;justify-content:center;' +
        'background:radial-gradient(ellipse at center,rgba(200,20,20,.35) 0%,rgba(150,0,0,.6) 60%,rgba(90,0,0,.8) 100%);opacity:1;transition:opacity 1.3s ease-out}' +
      '#alerta-ojo span{font-size:min(55vmin,420px);line-height:1;filter:drop-shadow(0 0 30px rgba(255,60,30,.9))}' +
      '#alerta-ojo.apagar{opacity:0}';
    document.head.appendChild(st);
  }
  document.getElementById('alerta-ojo')?.remove();
  const capa = document.createElement('div');
  capa.id = 'alerta-ojo';
  capa.innerHTML = '<span>👁</span>';
  document.body.appendChild(capa);
  setTimeout(() => capa.classList.add('apagar'), 1100);
  setTimeout(() => capa.remove(), 2600);
}

function mesaRender(docs){
  const cuerpo = $('#mesa-cuerpo');
  const primeraVez = mesaIdsVistos === null;
  const nuevasIds = new Set(primeraVez ? [] : docs.map(d => d.id).filter(id => !mesaIdsVistos.has(id)));
  // La última tirada (no las líneas del sistema) va con fondo verde.
  const ultima = docs.find(d => !["mantenimiento", "recordatorio", "habilidad", "efecto", "efecto-gm", "alerta"].includes(d.data().desde));
  const ultimaId = ultima ? ultima.id : null;
  // Resumen de esa misma última tirada: solo existe en la Mesa flotante
  // (ficha y gm-tools) — es lo que se ve con la cajita achicada, ver CSS de
  // #mesa-resumen en cada herramienta.
  const resumen = document.getElementById('mesa-resumen');
  if(resumen){
    resumen.classList.toggle('con-tirada', !!ultima);
    resumen.innerHTML = ultima
      ? mesaFilaContenido(ultima.data({serverTimestamps: 'estimate'}))
      : '<div class="mesa-vacia">Todavía nadie tiró.</div>';
  }
  let hayAjena = false;
  cuerpo.innerHTML = docs.length ? '' : '<div class="mesa-vacia">Todavía nadie tiró.</div>';
  docs.forEach(d => {
    const t = d.data({serverTimestamps: 'estimate'});
    const nueva = !primeraVez && !mesaIdsVistos.has(d.id);
    if(nueva && fbUsuario && t.uid !== fbUsuario.uid) hayAjena = true;
    // Efectos al golpear de un arma: línea resaltada (comun/efectos-golpe.js).
    if(EfectosGolpe.esLineaMesa(t)){
      const div = document.createElement('div');
      div.className = 'mesa-tirada mesa-efecto' + (nueva ? ' nueva' : '');
      div.innerHTML = EfectosGolpe.mesaHtml(t, t.desde === 'efecto-gm' ? 'mesa-q-creep' : mesaClaseQuien(t));
      if(nueva) setTimeout(() => div.classList.remove('nueva'), 1500);
      cuerpo.appendChild(div);
      return;
    }
    // Alerta del ojo del GM: línea roja bien evidente y el destello en pantalla.
    if(t.desde === 'alerta'){
      const div = document.createElement('div');
      div.className = 'mesa-tirada mesa-sistema mesa-alerta' + (nueva ? ' nueva' : '');
      div.innerHTML = `<span class="mesa-quien">👁 ${esc(t.origen)}</span>${t.formula ? `<div class="mesa-detalle">${esc(t.formula)}</div>` : ''}`;
      if(nueva){ setTimeout(() => div.classList.remove('nueva'), 1500); mesaAlertaOjo(); }
      cuerpo.appendChild(div);
      return;
    }
    // Líneas del sistema (no son tiradas): pase de turno y recordatorios.
    if(t.desde === 'mantenimiento' || t.desde === 'recordatorio' || t.desde === 'habilidad'){
      const div = document.createElement('div');
      div.className = 'mesa-tirada mesa-sistema' + (t.desde === 'mantenimiento' ? ' mesa-turno' : '') + (nueva ? ' nueva' : '');
      div.innerHTML = t.desde === 'mantenimiento'
        ? `<span class="mesa-quien mesa-q-turno">⟳ ${esc(t.origen)}</span><div class="mesa-detalle">Pasó el turno</div>`
        : `<span class="mesa-quien ${mesaClaseQuien(t)}">${esc(t.quien || t.jugador || '?')}</span>${t.quien && t.jugador && t.quien !== t.jugador ? ` <span class="mesa-usuario">(${esc(t.jugador)})</span>` : ''} ${t.desde === "habilidad" ? "⚡" : "🔔"} ${esc(t.origen)}${t.desde === "habilidad"
            ? `<div class="mesa-texto">${t.formula ? esc(t.formula) : "(esta habilidad no tiene descripción cargada)"}</div>`
            : (t.formula ? `<div class="mesa-detalle">${esc(t.formula)}</div>` : "")}`;
      if(nueva) setTimeout(() => div.classList.remove('nueva'), 1500);
      cuerpo.appendChild(div);
      return;
    }
    const div = document.createElement('div');
    div.className = 'mesa-tirada' + (d.id === ultimaId ? ' ultima' : '') + (nueva ? ' nueva' : '');
    div.innerHTML = mesaFilaContenido(t);
    if(nueva) setTimeout(() => div.classList.remove('nueva'), 1500);
    cuerpo.appendChild(div);
  });
  mesaIdsVistos = new Set(docs.map(d => d.id));
  // Aviso opcional a la herramienta de que llegaron tiradas nuevas (el mapa lo
  // usa para cerrar el "giro gratis" cuando alguien hace algo).
  if(!primeraVez && typeof mesaAlAccionNueva === 'function'){
    const nuevas = docs.filter(d => nuevasIds.has(d.id));
    if(nuevas.length) mesaAlAccionNueva(nuevas);
  }
  // Dados 3D para las tiradas nuevas, de la más vieja a la más nueva.
  if(!primeraVez && typeof dadosAnimarTirada === 'function'){
    docs.filter(d => nuevasIds.has(d.id)).reverse().forEach(d => dadosAnimarTirada(d.data()));
  }
  // Cajita flotante achicada: avisa que llegó una tirada de otro.
  const mesa = document.getElementById('mesa');
  if(hayAjena && mesa && mesa.classList.contains('colapsada')) mesa.classList.add('aviso');
}

function mesaEscuchar(){
  $('#mesa-cuerpo').innerHTML = '<div class="mesa-vacia">Cargando tiradas…</div>';
  fbDb.collection(fbRutaCampana('tiradas'))
    .orderBy('cuando', 'desc').limit(MESA_MAX)
    .onSnapshot(snap => {
      mesaEstado(`${fbPartida.nombre} · ${fbMiembro.nombre} · ${fbMiembro.gm ? "GM" : "jugador"}`);
      mesaRender(snap.docs);
    }, err => {
      console.error('Error escuchando la mesa:', err);
      mesaEstado('desconectada');
      $('#mesa-cuerpo').innerHTML = '<div class="mesa-vacia">No se pudieron leer las tiradas — mirá la consola.</div>';
    });
}

// Cajita flotante de la ficha y gm-tools. Arma la cajita, entra a la
// partida y, si todo está bien, llama a alEntrar().
async function mesaIniciar(alEntrar){
  const mesa = document.createElement('div');
  mesa.id = 'mesa';
  mesa.innerHTML =
    '<div id="mesa-cabecera" title="Clic: achicar o agrandar · Arrastrar: mover">' +
      fbLinkInicioHtml('⌂') + '<span id="mesa-titulo">Mesa</span>' + dadosBotonHtml() + mesaBorrarHtml() + '<span id="mesa-estado">conectando…</span><span id="mesa-flecha"></span>' +
    '</div>' +
    '<div id="mesa-resumen"></div>' +
    '<div id="mesa-cuerpo"></div>' +
    '<form id="mesa-tirar"><input id="mesa-formula" placeholder="Tirada libre, ej: 2d6+3" autocomplete="off"><button type="submit" class="btn">Tirar</button></form>' +
    '<div id="mesa-grilla"><button type="button" class="btn" title="Grilla de dados: elegí dado y cantidad">🎲 Dados</button></div>';
  document.body.appendChild(mesa);
  const cabecera = $('#mesa-cabecera');
  dadosConectarBoton(mesa);
  // Grilla de dados al costado de la cajita (comun/grilla-dados.js).
  grillaConectar($('#mesa-grilla button'), {ancla: mesa, alTirar: f => registrarTirada('Tirada libre', tirarDados(f))});

  // Tirada libre por fórmula, igual que en el mapa: se publica en la Mesa
  // y queda en el historial de la sesión.
  $('#mesa-tirar').onsubmit = e => {
    e.preventDefault();
    const r = tirarDados($('#mesa-formula').value);
    if(!r){ toast('Fórmula no válida — ej: 2d6+3'); return; }
    registrarTirada('Tirada libre', r);
    $('#mesa-formula').value = '';
  };

  // Posición: la cajita se arrastra desde la cabecera y el lugar queda
  // guardado en este navegador. Mientras nunca se la movió, va abajo a la
  // derecha, justo encima del dock si la herramienta tiene uno (aunque la
  // barra ocupe dos renglones). Nunca queda afuera de la pantalla.
  const dock = document.querySelector('.dock');
  let posicion = null;
  try{ posicion = JSON.parse(localStorage.getItem('mesa-posicion') || 'null'); }catch(e){}
  const encuadrar = () => {
    if(!posicion){
      mesa.style.left = mesa.style.top = mesa.style.right = '';
      mesa.style.bottom = dock ? (dock.offsetHeight + 12) + 'px' : '';
      return;
    }
    const x = Math.max(0, Math.min(posicion.x, window.innerWidth - mesa.offsetWidth));
    const y = Math.max(0, Math.min(posicion.y, window.innerHeight - mesa.offsetHeight));
    mesa.style.left = x + 'px';
    mesa.style.top = y + 'px';
    mesa.style.right = mesa.style.bottom = 'auto';
  };
  window.addEventListener('resize', encuadrar);

  let arrastre = null, recienMovida = false;
  cabecera.addEventListener('pointerdown', e => {
    if(e.button !== 0 || e.target.closest('.fb-inicio, .dados3d-boton, .dados3d-config, .mesa-borrar')) return;
    const r = mesa.getBoundingClientRect();
    arrastre = {px: e.clientX, py: e.clientY, x: r.left, y: r.top, movio: false};
    cabecera.setPointerCapture(e.pointerId);
  });
  cabecera.addEventListener('pointermove', e => {
    if(!arrastre) return;
    const dx = e.clientX - arrastre.px, dy = e.clientY - arrastre.py;
    if(!arrastre.movio && Math.abs(dx) + Math.abs(dy) < 5) return;  // un clic con pulso tembloroso no es arrastre
    arrastre.movio = true;
    mesa.classList.add('arrastrando');
    posicion = {x: arrastre.x + dx, y: arrastre.y + dy};
    encuadrar();
  });
  const soltar = () => {
    if(!arrastre) return;
    recienMovida = arrastre.movio;
    arrastre = null;
    mesa.classList.remove('arrastrando');
    if(recienMovida){
      posicion = {x: parseFloat(mesa.style.left), y: parseFloat(mesa.style.top)};
      try{ localStorage.setItem('mesa-posicion', JSON.stringify(posicion)); }catch(e){}
    }
  };
  cabecera.addEventListener('pointerup', soltar);
  cabecera.addEventListener('pointercancel', soltar);

  const aplicarColapso = colapsada => {
    mesa.classList.toggle('colapsada', colapsada);
    if(!colapsada) mesa.classList.remove('aviso');
    $('#mesa-flecha').textContent = colapsada ? '▸' : '▾';
    try{ localStorage.setItem('mesa-colapsada', colapsada ? '1' : ''); }catch(e){}
    encuadrar();
  };
  let colapsada = false;
  try{ colapsada = localStorage.getItem('mesa-colapsada') === '1'; }catch(e){}
  aplicarColapso(colapsada);
  cabecera.onclick = e => {
    if(recienMovida){ recienMovida = false; return; }  // soltar después de arrastrar no achica la cajita
    if(!e.target.closest('.fb-inicio, .dados3d-boton, .dados3d-config, .mesa-borrar')) aplicarColapso(!mesa.classList.contains('colapsada'));
  };
  // Solo se ve con la cajita achicada (ver CSS): un clic ahí también la agranda.
  $('#mesa-resumen').onclick = () => aplicarColapso(false);

  // Sin sesión, sin partida elegida o sin haberse unido: al inicio del sitio.
  const entrada = await fbEntrarAPartida();
  if(entrada === 'redirigiendo') return;
  if(entrada !== 'ok'){
    mesaEstado('sin internet');
    $('#mesa-cuerpo').innerHTML = '<div class="mesa-vacia">No se pudo cargar Firebase. Las tiradas siguen funcionando, pero no se comparten.</div>';
    return;
  }
  alEntrar();
}
