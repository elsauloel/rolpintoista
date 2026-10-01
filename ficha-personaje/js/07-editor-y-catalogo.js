// js/07-editor-y-catalogo.js — tramo 7 de 14 del script de ficha.html (paso 5, nivel A: mismo código, en el mismo orden).
/* =========================================================
   GITHUB — solo para publicar en el catálogo compartido
   El resto de la sincronización con GitHub (traer la última versión del
   archivo, subir la ficha a datos/personajes/) era de la plataforma
   vieja y ya no existe: todo el estado de partida vive en Firebase (ver
   docs/workflow-firebase.md). Lo único que sigue por acá es "📦 Agregar
   al catálogo", que publica en datos/catalogo.json de la rama main.
   ========================================================= */

const GH_REPO = 'elsauloel/rolpintoista';
const GH_BRANCH = 'main';

const GH_TOKEN_URL = 'https://github.com/settings/tokens/new?description=Rolpintoista&scopes=public_repo';

/* Pide el token en un cartel dentro de esta misma pestaña.
   Antes se abría GitHub con window.open() y enseguida se llamaba a
   prompt(): como la pestaña de GitHub se lleva el foco, el navegador
   no muestra el prompt de la pestaña de atrás y no quedaba a la vista
   dónde pegar el token. Ahora el cartel se abre primero y el botón
   "Abrir GitHub" es el que abre la otra pestaña. */
function ghPedirToken(){
  return new Promise(res => {
    const btnCss = 'padding:8px 12px;border-radius:8px;border:1px solid #555;background:#2a2a30;color:#eee;cursor:pointer;font:inherit';
    const fondo = document.createElement('div');
    fondo.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;padding:16px;z-index:9999';
    const caja = document.createElement('div');
    caja.style.cssText = 'background:#1b1b1f;color:#eee;border:1px solid #444;border-radius:12px;max-width:460px;width:100%;padding:18px;font:14px/1.5 system-ui,sans-serif';
    caja.innerHTML =
      '<h3 style="margin:0 0 10px;font-size:16px">Token de GitHub</h3>' +
      '<ol style="margin:0 0 14px;padding-left:20px">' +
        '<li>Tocá <b>Abrir GitHub</b>: se abre en otra pestaña, ya con los permisos correctos elegidos.</li>' +
        '<li>Bajá hasta el final y tocá <b>Generate token</b>.</li>' +
        '<li>Copiá el token verde (ojo: solo se muestra una vez).</li>' +
        '<li>Volvé <b>a esta pestaña</b> y pegalo en el casillero de abajo.</li>' +
      '</ol>' +
      '<button type="button" data-gh="abrir" style="' + btnCss + ';width:100%;margin-bottom:10px">Abrir GitHub ↗</button>' +
      '<input type="text" data-gh="input" placeholder="Pegá el token acá (ghp_…)" ' +
        'style="width:100%;box-sizing:border-box;padding:9px;border-radius:8px;border:1px solid #555;background:#111;color:#eee;font:inherit;margin-bottom:12px">' +
      '<div style="display:flex;gap:8px;justify-content:flex-end">' +
        '<button type="button" data-gh="cancelar" style="' + btnCss + '">Cancelar</button>' +
        '<button type="button" data-gh="guardar" style="' + btnCss + ';border-color:#6a8;background:#2c4636">Guardar</button>' +
      '</div>' +
      '<div style="margin-top:10px;opacity:.65;font-size:12px">Queda guardado en este navegador para las próximas veces.</div>';
    fondo.appendChild(caja);
    document.body.appendChild(fondo);
    const campo = caja.querySelector('[data-gh="input"]');
    campo.focus();
    const cerrar = valor => {
      document.removeEventListener('keydown', teclas);
      fondo.remove();
      res(valor);
    };
    const teclas = e => {
      if(e.key === 'Escape') cerrar(null);
      if(e.key === 'Enter' && document.activeElement === campo) cerrar(campo.value.trim() || null);
    };
    document.addEventListener('keydown', teclas);
    caja.querySelector('[data-gh="abrir"]').onclick = () => window.open(GH_TOKEN_URL, '_blank');
    caja.querySelector('[data-gh="cancelar"]').onclick = () => cerrar(null);
    caja.querySelector('[data-gh="guardar"]').onclick = () => cerrar(campo.value.trim() || null);
    fondo.onmousedown = e => { if(e.target === fondo) cerrar(null); };
  });
}

async function ghToken(pedirDeNuevo){
  let t = localStorage.getItem('gh-token');
  if(!t || pedirDeNuevo){
    t = await ghPedirToken();
    if(t) localStorage.setItem('gh-token', t.trim());
  }
  return t ? t.trim() : null;
}

// Convierte texto a base64 vía Blob para bancar UTF-8 y fichas grandes
// (los retratos van embebidos y la ficha puede pesar más de 1 MB).
function aBase64(texto){
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(',')[1]);
    r.onerror = rej;
    r.readAsDataURL(new Blob([texto]));
  });
}

/* Para pisar un archivo que ya está en el repo hay que mandarle a GitHub
   el sha de la versión anterior; si no, contesta 422 ("sha wasn't
   supplied"). Antes, si la consulta del sha fallaba por lo que fuera, se
   seguía igual sin sha y la subida moría con ese 422 sin decir por qué.
   Ahora, si la consulta directa no sirve, el sha se busca en el listado
   de la carpeta (otra ruta de la API, respuesta chica) y cualquier
   rareza queda anotada en la consola. */
async function ghShaPorListado(ruta, cab){
  const partes = ruta.split('/');
  const archivo = partes.pop();
  const carpeta = partes.join('/');
  const resp = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${carpeta}?ref=${GH_BRANCH}`, {headers: cab, cache: 'no-store'});
  if(resp.status === 401 || resp.status === 403) throw {auth:true};
  if(!resp.ok) return undefined;
  const cuerpo = await resp.json();
  const lista = Array.isArray(cuerpo) ? cuerpo : (cuerpo.entries || []);
  const item = lista.find(x => x.name === archivo);
  return item ? item.sha : undefined;
}

async function ghSha(ruta, cab){
  const resp = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${ruta}?ref=${GH_BRANCH}`, {headers: cab, cache: 'no-store'});
  if(resp.status === 401 || resp.status === 403) throw {auth:true};
  if(resp.status === 404) return undefined; // todavía no existe: se crea de cero
  if(resp.ok){
    const sha = (await resp.json()).sha;
    if(sha) return sha;
    console.warn(`GitHub contestó 200 para ${ruta} pero sin sha — lo busco en el listado de la carpeta`);
  }else{
    console.warn(`GitHub respondió ${resp.status} consultando ${ruta} — busco el sha en el listado de la carpeta`);
  }
  return await ghShaPorListado(ruta, cab);
}

async function ghSubir(ruta, contenidoB64, token, mensaje){
  const url = `https://api.github.com/repos/${GH_REPO}/contents/${ruta}`;
  const cab = {Authorization: 'Bearer ' + token, Accept: 'application/vnd.github.object+json'};
  const mandar = sha => fetch(url, {
    method: 'PUT',
    headers: cab,
    body: JSON.stringify({message: mensaje, content: contenidoB64, branch: GH_BRANCH, ...(sha ? {sha} : {})}),
  });
  const sha = await ghSha(ruta, cab);
  let resp = await mandar(sha);
  // 422 = el archivo existe y el sha que mandamos no le sirve: o no lo
  // encontramos, o alguien subió una versión nueva recién. Se vuelve a
  // pedir el sha y se reintenta una sola vez.
  if(resp.status === 422){
    const nuevo = await ghShaPorListado(ruta, cab);
    if(nuevo && nuevo !== sha) resp = await mandar(nuevo);
  }
  if(resp.status === 401 || resp.status === 403) throw {auth:true};
  if(!resp.ok) throw new Error(`GitHub respondió ${resp.status} subiendo ${ruta}: ${await resp.text()}`);
}

// Acceso directo: lleva la partida en la dirección, así el mapa abre la
// misma partida que esta ficha.
if(typeof FB_CAMPANA !== 'undefined' && FB_CAMPANA){
  $('#acceso-mapa').href = '../vtt-hexgrid/mapa.html?partida=' + encodeURIComponent(FB_CAMPANA);
  $('#acceso-respaldo').onclick = async () => {
    const btn = $('#acceso-respaldo');
    if(!fbDb || !fbMiembro){ toast('Sin conexión con la partida: no se puede armar el respaldo'); return; }
    btn.disabled = true;
    toast('Armando el respaldo de la partida…');
    try{ toast(await fbBajarRespaldo()); }
    catch(err){ console.error('No se pudo armar el respaldo:', err); toast('No se pudo armar el respaldo — mirá la consola'); }
    finally{ btn.disabled = false; }
  };
}

// Cerrar cualquier popup con la tecla Escape.
document.addEventListener('keydown', e => {
  if(e.key !== 'Escape') return;
  document.querySelectorAll('.scrim.open').forEach(scrim => {
    const closeBtn = scrim.querySelector('[id$="-x"]');
    if(closeBtn) closeBtn.click(); else scrim.classList.remove('open');
  });
});

/* =========================================================
   LECTURA DE GITHUB
   Lee un JSON del repo (lo usa "Agregar al catálogo").
   ========================================================= */

async function ghLeerJson(ruta){
  const url = `https://api.github.com/repos/${GH_REPO}/contents/${ruta}?ref=${GH_BRANCH}`;
  const resp = await fetch(url, {headers: ghCabeceras('application/vnd.github.raw+json'), cache: 'no-store'});
  if(resp.status === 404) return null;
  if(resp.status === 429 || resp.status === 403) throw {limite: true};
  if(!resp.ok) throw new Error(`GitHub respondió ${resp.status} leyendo ${ruta}`);
  return await resp.json();
}

function ghCabeceras(accept){
  const cab = {Accept: accept};
  const token = localStorage.getItem('gh-token');
  if(token) cab.Authorization = 'Bearer ' + token.trim();
  return cab;
}

$('#btn-personajes').onclick = () => abrirPersonajes();
$('#btn-vendedor').onclick = () => abrirVendedor();
$('#presets-x').onclick = () => { if(presetDestino === 'duelo') cerrarPresetsDuelo(null); else $('#scrim-presets').classList.remove('open'); };
$('#presets-personalizado').onclick = () => { const destino = presetDestino; $('#scrim-presets').classList.remove('open'); abrirAsistenteEstadoFicha(destino); };
$('#scrim-presets').addEventListener('mousedown', e => { if(e.target.id === 'scrim-presets'){ if(presetDestino === 'duelo') cerrarPresetsDuelo(null); else $('#scrim-presets').classList.remove('open'); } });
$('#tipoitem-x').onclick = () => $('#scrim-tipoitem').classList.remove('open');
$('#scrim-tipoitem').addEventListener('mousedown', e => { if(e.target.id === 'scrim-tipoitem') $('#scrim-tipoitem').classList.remove('open'); });
document.addEventListener('click', e => {
  if(e.target.closest('#item-efecto-preset-abrir')){ abrirPresetsEfecto('item'); return; }
  if(e.target.closest('#tipoitem-abrir')){ abrirTipoItem(); return; }
  const presetVer = e.target.closest('[data-presetver]');
  if(presetVer){ verPresetEfecto(presetVer.dataset.presetver); return; }
  const presetEdit = e.target.closest('[data-presetedit]');
  if(presetEdit){ editarPresetEfecto(presetEdit.dataset.presetedit); return; }
  const preset = e.target.closest('[data-preset]');
  if(preset && preset.closest('#presets-body')){ aplicarPresetEfecto(preset.dataset.preset); return; }
  const tipo = e.target.closest('[data-tipoitem]');
  if(tipo){ aplicarTipoItem(tipo.dataset.tipoitem); return; }
});
$('#tienda-salir').onclick = () => salirDeLaTienda();
$('#catalogo-orden').addEventListener('change', e => { catalogoOrden = e.target.value; renderCatalogoModal(); });
$('#catalogo-orden-dir').addEventListener('click', () => { catalogoOrdenDesc = !catalogoOrdenDesc; renderCatalogoModal(); });

$('#personajes-nuevo').onclick = () => {
  $('#scrim-personajes').classList.remove('open');
  crearPersonajeNuevo();
};
$('#personajes-archivo').onclick = () => {
  $('#scrim-personajes').classList.remove('open');
  cargarArchivoLocal();
};
$('#personajes-x').onclick = () => $('#scrim-personajes').classList.remove('open');
$('#scrim-personajes').addEventListener('mousedown', e => { if(e.target.id==='scrim-personajes') $('#scrim-personajes').classList.remove('open'); });

let toastT;
function toast(msg){
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(()=>t.classList.remove('show'), 2200);
  registrarEvento(msg);
}

/* =========================================================
   EDITOR (modal)
   ========================================================= */

const SCHEMA = {
  inventario: {titulo:'Ítem de inventario', campos:['nombre','imagen','tipoItem','manoPreferida','peso','ranuras','tipoDado','danoFijo','danoAmplificado','armaDeRango','precioCompra','precioVentaAuto','equipado','unidades','consumible','cargaMax','cargaActual','curahp','curaspPct','efectoNombre','efectoTurnos','efectoHpTurno','efectoDetalle','tiradaExtra','detalle'], mods:true},
  cinturon: {titulo:'Ítem del cinturón', campos:['nombre','imagen','tipoItem','precioCompra','precioVentaAuto','unidades','consumible','cargaMax','cargaActual','curahp','curaspPct','efectoNombre','efectoTurnos','efectoHpTurno','efectoDetalle','tiradaExtra','detalle'], mods:true},
  catalogo: {titulo:'Ítem del catálogo', campos:['nombre','imagen','tipoItem','peso','tipoDado','danoFijo','danoAmplificado','armaDeRango','precioCompra','precioVentaAuto','consumible','cargaMax','curahp','curaspPct','efectoNombre','efectoTurnos','efectoHpTurno','efectoDetalle','tiradaExtra','detalle'], mods:true},
  habilidades:{titulo:'Habilidad', campos:['nombre','imagen','costo','nitrosCosto','job','origen','efectoNombre','efectoTurnos','efectoHpTurno','efectoDetalle','tiradaExtra','detalle'], mods:false},
  pasivas:  {titulo:'Pasiva', campos:['nombre','imagen','job','jobCosto','compras','regenHp','origen','detalle'], mods:true},
  // El dado ya no se escribe a mano: sale del nivel (botón "+ Nivel" en la lista).
  sociales: {titulo:'Talento', campos:['nombre','imagen','detalle'], mods:false},
  efectos:  {titulo:'Estado alterado', campos:['nombre','imagen','turnos','stacks','hpturno','stacksturno','forzarNitros','escudoMagico','mitadPdgEva','armaduraRota','permanente','activo','popup','detalle'], mods:true},
};
const CAMPO_LABEL = {nombre:'Nombre', peso:'Peso', ranuras:'Ranuras (si no está equipado)', costo:'Costo en SP (ej. 2 SP, o X si es variable)', nitrosCosto:'Costo en Nitros', dado:'Dado', stacks:'Stacks', detalle:'Detalle',
  equipado:'Equipado', activo:'Activo', turnos:'Turnos restantes', hpturno:'HP por turno (por stack)',
  stacksturno:'Stacks por turno', permanente:'Permanente (no vence)', popup:'Pop-up al mantenimiento',
  compras:'Compras (los efectos y el costo en Job se multiplican; tope por pasiva: mitad del nivel)', regenHp:'HP que recupera en cada Mantenimiento (por compra)',
  job:'Adquirida con puntos de Job', jobCosto:'Puntos de Job que costó (si fue con Job)', origen:'Cómo se consiguió (si no fue con Job)', imagen:'Imagen',
  unidades:'Cantidad (unidades en la pila)', consumible:'Consumible', curahp:'HP al consumir (+ cura / − daña)',
  precioCompra:'Precio de compra', tipoItem:'Categoría de ítem', tipoDado:'Tipo de arma (caras del dado)', danoFijo:'Daño fijo',
  danoAmplificado:'Daño amplificado (dados extra sin sumar peso)', armaDeRango:'Arma de rango (el botón de Daño Arma no suma el stat Dmg)',
  manoPreferida:'Mano', efectoNombre:'Nombre del estado', efectoTurnos:'Turnos del estado', efectoHpTurno:'HP por turno del estado', efectoEscudo:'HP del escudo del estado', efectoStacks:'Stacks del estado', efectoDetalle:'Detalle del estado',
  curaspPct:'% de SP al consumir (0-100, redondea hacia arriba)',
  cargaMax:'Cargas por unidad (usos antes de gastar 1 de la cantidad)', cargaActual:'Cargas restantes (de la unidad actual)',
  forzarNitros:'Forzar Nitros máx. a (vacío = no forzar; el más bajo activo gana)', mitadPdgEva:'PdG y Evasión a la mitad (redondeado abajo)',
  escudoMagico:'Escudo especial — HP de una barra secundaria que absorbe daño antes que el HP real; se recarga entera en cada Mantenimiento mientras el estado siga activo (dejalo en 0 si no aplica)',
  armaduraRota:'Armadura rota: -1 Defensa por cada acumulación (stack)',
  tiradaExtra:'Tirada de efecto: fórmula de dados, botón 🎲 (opcional, ej. 2d6+3)',
  tiradaStat:'Tirada al ejecutar: stat (opcional)'};
const CAMPO_NUM = ['curaHp','compras','regenHp','jobCosto','peso','ranuras','stacks','turnos','hpturno','stacksturno','unidades','curahp','precioCompra','danoFijo','danoAmplificado','tipoDado','nitrosCosto','hpCosto','efectoTurnos','efectoHpTurno','efectoEscudo','efectoStacks','curaspPct','cargaMax','cargaActual','forzarNitros','equipoEstadoHpTurno','escudoMagico'];

// Presets estándar de Estados alterados: configuración de base, 100% editable
// una vez elegidos. La lista vive en comun/estados-presets.js (una sola para
// ficha, gm-tools y mapa); acá se pide con los nombres de campo de la ficha.
const EFECTOS_PRESET = estadosPresetFicha();

const POLARIDAD_EFECTO_LABEL = {buff:'Buffs', debuff:'Debuffs', otro:'Otros'};
// Los presets en grilla: cada uno muestra lo que hace (turnos, HP por
// turno, stacks) sin tener que abrirlo. Reemplaza al desplegable, donde
// solo se veía el nombre y había que elegir a ciegas.
const CFG_PREGUNTAS_FICHA = {hp: 'hpturno', statLabel: id => STAT_LABEL[id] || id};
function presetBtnHtml(p, valor, clase){
  const datos = [];
  if((presetDestino === 'directo' || presetDestino === 'inv') && valor.startsWith('std:')){
    // Los presets estándar ya traen el efecto pero no las cantidades: al activarlos se pregunta cada una.
    EstadoPreguntas.chips(p, CFG_PREGUNTAS_FICHA).forEach(t => datos.push(`<span class="preset-dato">${esc(t)}: a elegir</span>`));
    const detP = (p.detalle || '').trim();
    return presetTarjetaHtml(p, valor, clase, datos, detP);
  }
  const hpturno = num(p.hpturno);
  if(hpturno) datos.push(`<span class="preset-dato ${hpturno > 0 ? 'bueno' : 'malo'}">${hpturno > 0 ? '+' : ''}${fmt(hpturno)} HP/turno</span>`);
  if(p.permanente) datos.push(`<span class="preset-dato">No vence</span>`);
  else if(num(p.turnos)) datos.push(`<span class="preset-dato">${fmt(num(p.turnos))} turnos</span>`);
  if(num(p.stacks) > 1) datos.push(`<span class="preset-dato">${fmt(num(p.stacks))} stacks</span>`);
  if(num(p.escudoMagico) > 0) datos.push(`<span class="preset-dato bueno">🛡${fmt(num(p.escudoMagico))}</span>`);
  (p.mods || []).forEach(m => {
    if(!m.stat) return;
    const v = num(m.val);
    datos.push(`<span class="preset-dato ${v > 0 ? 'bueno' : 'malo'}">${esc(STAT_LABEL[m.stat] || m.stat)} ${v > 0 ? '+' : ''}${fmt(v)}</span>`);
  });
  return presetTarjetaHtml(p, valor, clase, datos, (p.detalle || '').trim());
}
function presetTarjetaHtml(p, valor, clase, datos, det){
  const cuerpo = `
    <span class="preset-nombre">${esc(p.nombre)}</span>
    ${datos.length ? `<span class="preset-datos">${datos.join('')}</span>` : ''}
    ${det ? `<span class="preset-detalle">${esc(det.length > 90 ? det.slice(0, 88) + '…' : det)}</span>` : ''}`;
  // El selector "directo" (botón + Estado) da tres acciones por tarjeta en
  // vez de activar con un solo clic; los otros destinos (rellenar el
  // editor de un ítem/efecto) siguen siendo un único botón clickeable.
  if(presetDestino === 'directo'){
    return `<div class="preset-card ${clase}">
      ${cuerpo}
      <div class="preset-card-btns">
        <button type="button" class="mini" data-presetver="${esc(valor)}">Ver</button>
        <button type="button" class="mini" data-preset="${esc(valor)}">Activar</button>
        <button type="button" class="mini" data-presetedit="${esc(valor)}">Editar</button>
      </div>
    </div>`;
  }
  // Las invocaciones no tienen el editor genérico de estados (sería
  // duplicar el editor de la ficha entera): se activa directo o no.
  if(presetDestino === 'inv'){
    return `<div class="preset-card ${clase}">
      ${cuerpo}
      <div class="preset-card-btns">
        <button type="button" class="mini" data-presetver="${esc(valor)}">Ver</button>
        <button type="button" class="mini" data-preset="${esc(valor)}">Activar</button>
      </div>
    </div>`;
  }
  return `<button type="button" class="preset-btn ${clase}" data-preset="${esc(valor)}">${cuerpo}
  </button>`;
}

function verPresetEfecto(valor){
  const [tipo, idx] = valor.split(':');
  const preset = (tipo === 'std' ? EFECTOS_PRESET : (S.efectosPersonalizados || []))[+idx];
  if(!preset) return;
  viewing = null;
  const linea = (label, val) => (val === '' || val === null || val === undefined) ? '' : `<div class="view-line"><span class="view-label">${esc(label)}</span><span class="view-value">${esc(val)}</span></div>`;
  const L = [];
  L.push(linea('Duración', preset.permanente ? 'Permanente' : (num(preset.turnos) > 0 ? `${fmt(num(preset.turnos))} turno(s)` : 'Sin duración fija')));
  if(num(preset.stacks) > 1) L.push(linea('Stacks', fmt(num(preset.stacks))));
  if(num(preset.hpturno)) L.push(linea('HP por turno (por stack)', `${num(preset.hpturno)>0?'+':''}${fmt(num(preset.hpturno))}`));
  const pMods = (preset.mods || []);
  if(pMods.length) L.push(linea('Modificadores', pMods.map(m => `${STAT_LABEL[m.stat]||m.stat} ${num(m.val)>0?'+':''}${fmt(num(m.val))}`).join(', ')));
  $('#view-title-header').textContent = preset.nombre || 'Estado';
  $('#view-body').innerHTML = `
    <div class="view-wrap">
      <div class="view-info">
        <div class="view-title">${esc(preset.nombre)}</div>
        <div class="view-lines">${L.filter(Boolean).join('') || '<div class="view-line"><span class="view-value">Sin datos adicionales.</span></div>'}</div>
      </div>
    </div>
    ${preset.detalle ? `<div class="view-detalle"><span class="view-label">Detalle</span>${esc(preset.detalle)}</div>` : ''}
  `;
  $('#view-edit-btn').style.display = 'none';
  $('#view-del-btn').style.display = 'none';
  $('#scrim-view').classList.add('open');
}

function editarPresetEfecto(valor){
  const [tipo, idx] = valor.split(':');
  const preset = (tipo === 'std' ? EFECTOS_PRESET : (S.efectosPersonalizados || []))[+idx];
  if(!preset) return;
  $('#scrim-presets').classList.remove('open');
  openEditor('efectos', null);
  const {nombre, ...resto} = preset;
  Object.assign(editing.draft, structuredClone(resto));
  editing.draft.nombre = nombre;
  drawEditor();
}

// La botonera de estados sirve para varios destinos: el editor de estados
// (donde el preset llena la ficha entera), el de ítems/habilidades
// (donde solo llena los campos del efecto que dispara) y el paso "Efectos"
// del 🎯/✨ (destino 'duelo', ver elegirEstadoDuelo más abajo).
let presetDestino = 'efecto';
// Selector real de estados para el paso "Efectos" del cuadro de Ejecución (2026-09-28, pedido del dueño —
// "siguiendo el mismo andamiaje" del +Estado de siempre, en vez de reinventar un selector adentro de
// comun/asistente-duelo-hab.js): abre la misma grilla de presets + EstadoPreguntas, y resuelve la Promise que
// pide AsistenteDueloHab.abrir({elegirEstado: elegirEstadoDuelo}). null = canceló.
let presetDueloResolver = null;
function elegirEstadoDuelo(){
  return new Promise(resolve => {
    presetDueloResolver = resolve;
    abrirPresetsEfecto('duelo');
    $('#scrim-presets').style.zIndex = 99600;   // encima del cuadro de Ejecución (z-index 99500)
  });
}
function cerrarPresetsDuelo(valor){
  $('#scrim-presets').classList.remove('open');
  $('#scrim-presets').style.zIndex = '';
  const resolver = presetDueloResolver;
  presetDueloResolver = null;
  if(resolver) resolver(valor);
}

function abrirTipoItem(){
  const grupos = {armas:'Armas', escudos:'Escudos', defensa:'Defensa', consumibles:'Consumibles', otros:'Otros'};
  const draft = editing && editing.draft;
  let html = '';
  Object.keys(grupos).forEach(g => {
    const del = CATEGORIAS.filter(c => c.id && grupoCompraDe(c.id) === g);
    if(!del.length) return;
    html += `<div class="preset-grupo">${grupos[g]} · ${fmt(del.length)}</div>`;
    html += `<div class="preset-grid">${del.map(c =>
      `<button type="button" class="tipoitem-btn ${g} ${draft && draft.tipoItem === c.id ? 'activa' : ''}" data-tipoitem="${esc(c.id)}">${esc(c.label)}</button>`
    ).join('')}</div>`;
  });
  $('#tipoitem-body').innerHTML = html;
  $('#scrim-tipoitem').classList.add('open');
}

function aplicarTipoItem(id){
  $('#scrim-tipoitem').classList.remove('open');
  if(!editing) return;
  editing.draft.tipoItem = id;
  // Un ítem nuevo que deja de ser consumible sigue en el asistente de ítems.
  if(!editing.id && id !== 'consumibles' && (editing.key === 'inventario' || editing.key === 'catalogo')){
    const {key, draft} = editing;
    closeModal();
    abrirAsistenteItem(key, null, {draft});
    return;
  }
  drawEditor();
}

function abrirPresetsEfecto(destino){
  presetDestino = destino || 'efecto';
  const propios = S.efectosPersonalizados || [];
  // "Directo" (el + Estado de arriba) activa el estado con un clic — no
  // tiene sentido el atajo de "empezar en blanco" acá, para eso está el
  // botón "Estado personalizado" del header, que sí abre el editor.
  let html = (presetDestino === 'directo' || presetDestino === 'inv') ? '' : `<button type="button" class="preset-blanco" data-preset="">— Empezar en blanco —</button>`;
  ['buff','debuff','otro'].forEach(pol => {
    const del = EFECTOS_PRESET.map((p,i) => ({p,i})).filter(({p}) => (p.polaridad || 'otro') === pol);
    if(!del.length) return;
    html += `<div class="preset-grupo">${POLARIDAD_EFECTO_LABEL[pol]} · ${fmt(del.length)}</div>`;
    html += `<div class="preset-grid">${del.map(({p,i}) => presetBtnHtml(p, `std:${i}`, pol)).join('')}</div>`;
  });
  if(propios.length){
    html += `<div class="preset-grupo">Mis presets · ${fmt(propios.length)}</div>`;
    html += `<div class="preset-grid">${propios.map((p,i) => presetBtnHtml(p, `custom:${i}`, 'propio')).join('')}</div>`;
  }
  $('#presets-body').innerHTML = html;
  $('#presets-personalizado').style.display = (presetDestino === 'directo' || presetDestino === 'inv') ? '' : 'none';
  $('#presets-titulo').textContent = presetDestino === 'inv' ? `Estado para ${(S.invocaciones.find(x=>x.id===presetInvId)||{}).nombre||'la invocación'}` : 'Estado alterado';
  $('#scrim-presets').classList.add('open');
}

// Construye el efecto igual que si se hubiera abierto el editor en blanco,
// se le hubiera aplicado el preset a mano y se hubiera tocado Guardar — sin
// mostrar nada de eso: abre y cierra el editor en el mismo tick, así el
// navegador nunca llega a pintar el paso intermedio.
function activarEfectoPreset(preset){
  openEditor('efectos', null);
  const {nombre, ...resto} = preset;
  Object.assign(editing.draft, structuredClone(resto));
  editing.draft.nombre = nombre;
  const draft = editing.draft;
  closeModal();
  agregarEstadoConAviso(S.efectos, draft, '');
  renderList('efectos');
  refresh();
}
// Ponerle un estado al personaje o a una invocación: inmunidades, acumulación (Armadura rota, Veneno, Sangrado, Escarcha) y
// renovación de uno igual son la regla común (comun/combatiente.js, agregarEstado). Devuelve el resultado.
function agregarEstadoConAviso(lista, nuevo, quien){
  const r = Combatiente.agregarEstado(lista, nuevo);
  const q = quien ? quien + ': ' : '';
  if(!r.ok){ toast(`🛡 ${q}inmune ahora mismo (${r.motivo}) — ${nuevo.nombre} no se pudo aplicar`); return r; }
  if(r.que === 'yaLoTiene'){ toast(`${q}${nuevo.nombre}: ya lo tiene, no se acumula`); return r; }
  const e = r.estado;
  const txt = r.que === 'acumulado'
    ? (e.esEscarcha ? `${e.nombre} ×${e.stacks} (−${e.stacks} No2 máx.)` : e.esSangrado ? `${e.nombre}: +1 al daño por turno (${fmt(Math.abs(num(e.hpturno)) * num(e.stacks))} ahora)` : `${e.nombre} ×${e.stacks}`)
    : r.que === 'renovado' ? `${e.nombre} renovado (ya lo tenía)` : `${e.nombre} activado`;
  toast(q + txt);
  return r;
}

// Menú paso a paso para crear un estado alterado de cero (comun/asistente-estado.js): reemplaza al botón "Estado personalizado"
// que abría el formulario completo (el formulario sigue disponible desde el último paso). destino: 'directo' (el personaje) o 'inv'.
function armarPresetDeAsistente(res){
  return {nombre: res.nombre, polaridad: res.polaridad, turnos: res.turnos, permanente: res.permanente, stacks: 1, hpturno: res.hp, stacksturno: 0,
    escudoMagico: res.escudo, mods: res.mods, detalle: res.detalle, popup: false, ...res.flags,
    ...(res.forzarNitros !== undefined ? {forzarNitros: res.forzarNitros} : {})};
}
function abrirAsistenteEstadoFicha(destino){
  const inv = destino === 'inv' ? S.invocaciones.find(x => x.id === presetInvId) : null;
  AsistenteEstado.abrir({
    titulo: 'Crear un estado alterado',
    para: inv ? inv.nombre : (S.meta.nombre || ''),
    stats: MOD_TARGETS.filter(s => !['sp', 'spregen', 'crgmax', 'capcinturon', 'capmochila', 'luz', 'veoculto'].includes(s.id)).map(s => ({id: s.id, label: STAT_LABEL[s.id] || s.id, full: STAT_FULL[s.id] || ''})),
    alTerminar: res => {
      const preset = armarPresetDeAsistente(res);
      if(res.guardar){
        S.efectosPersonalizados = S.efectosPersonalizados || [];
        const i = S.efectosPersonalizados.findIndex(p => p.nombre === preset.nombre);
        if(i >= 0) S.efectosPersonalizados[i] = preset; else S.efectosPersonalizados.push(preset);
      }
      (destino === 'inv' ? activarEfectoPresetInv : activarEfectoPreset)(preset);
    },
    alFormulario: destino === 'inv' ? null : (res => {
      openEditor('efectos', null);
      const {nombre, ...resto} = armarPresetDeAsistente(res);
      Object.assign(editing.draft, structuredClone(resto));
      editing.draft.nombre = nombre;
      drawEditor();
    }),
  });
}

function aplicarPresetEfecto(valor){
  if(presetDestino === 'duelo'){
    if(!valor){ cerrarPresetsDuelo({modo: 'manual'}); return; }
    const [tipoD, idxD] = valor.split(':');
    const presetD = (tipoD === 'std' ? EFECTOS_PRESET : (S.efectosPersonalizados || []))[+idxD];
    if(!presetD){ cerrarPresetsDuelo(null); return; }
    const armar = p => ({modo: 'preset', nombre: p.nombre, turnos: p.turnos, permanente: !!p.permanente, hp: num(p.hpturno), mods: p.mods, stacks: p.stacks, escudoMagico: num(p.escudoMagico), polaridad: p.polaridad, detalle: p.detalle});
    if(tipoD === 'std') EstadoPreguntas.pedir(presetD, CFG_PREGUNTAS_FICHA).then(armado => cerrarPresetsDuelo(armado ? armar(armado) : null));
    else cerrarPresetsDuelo(armar(presetD));
    return;
  }
  $('#scrim-presets').classList.remove('open');
  if(!valor) return;
  const [tipo, idx] = valor.split(':');
  const preset = (tipo === 'std' ? EFECTOS_PRESET : (S.efectosPersonalizados || []))[+idx];
  if(!preset) return;
  if(presetDestino === 'directo' || presetDestino === 'inv'){
    const activar = presetDestino === 'directo' ? activarEfectoPreset : activarEfectoPresetInv;
    // Un preset estándar pregunta sus cantidades (HP, turnos…) antes de activarse; los propios ya traen las que el jugador eligió.
    if(tipo === 'std') EstadoPreguntas.pedir(preset, CFG_PREGUNTAS_FICHA).then(armado => { if(armado) activar(armado); });
    else activar(preset);
    return;
  }
  if(!editing) return;
  if(presetDestino === 'item'){
    // Un preset estándar pregunta sus cantidades (HP, escudo, stacks, bonos, turnos / sin límite) y las guarda en la habilidad/ítem.
    const cargar = p => {
      const d = editing.draft;
      d.efectoNombre = preset.nombre;
      d.efectoTurnos = p.turnos ?? 0;
      d.efectoHpTurno = p.hpturno ?? 0;
      d.efectoPermanente = !!p.permanente;
      d.efectoEscudo = num(p.escudoMagico);
      d.efectoStacks = num(p.stacks) > 1 ? num(p.stacks) : 1;
      if(tipo === 'std' && (p.mods || []).some(m => m && m.stat)) d.efectoMods = structuredClone(p.mods.filter(m => m && m.stat));
      if(preset.detalle && !(d.efectoDetalle || '').trim()) d.efectoDetalle = preset.detalle;
      drawEditor();
    };
    const ed = editing;
    if(tipo === 'std') EstadoPreguntas.pedir(preset, CFG_PREGUNTAS_FICHA).then(armado => { if(armado && editing === ed) cargar(armado); });
    else cargar(preset);
    return;
  }else{
    const {nombre, ...resto} = preset;
    Object.assign(editing.draft, structuredClone(resto));
    editing.draft.nombre = nombre;
  }
  drawEditor();
}

function optgroupsEfectosPresetHtml(){
  return ['buff','debuff','otro'].map(pol => {
    const opts = EFECTOS_PRESET.map((p,i) => ({p,i})).filter(({p}) => (p.polaridad||'otro') === pol);
    if(!opts.length) return '';
    return `<optgroup label="${POLARIDAD_EFECTO_LABEL[pol]}">${opts.map(({p,i}) => `<option value="std:${i}">${esc(p.nombre)}</option>`).join('')}</optgroup>`;
  }).join('');
}

let editing = null;

let viewing = null;

function openViewer(key, id){
  const it = key === 'catalogo' ? itemCatalogo(id) : S[key].find(x => x.id === id);
  if(!it) return;
  viewing = {key, id};
  // La tarjeta la arma comun/ficha-lupa.js (paso 4 etapa 3c-6): la misma que muestra el "Ver" de la Botonera del mapa.
  const v = FichaLupa.ver(S, key, it);
  $('#view-title-header').textContent = v.titulo;
  $('#view-body').innerHTML = v.html;
  // Un ítem que no es de esta ficha editable (de la tienda, del catálogo, de la mochila de otro) no se edita en el lugar:
  // Editar arma una copia y la sube al catálogo compartido (comun/editar-item.js). Borrar no tiene sentido ahí.
  const ajeno = verItemAjeno(key);
  $('#view-edit-btn').textContent = ajeno ? '✎ Editar y subir' : 'Editar';
  $('#view-edit-btn').title = ajeno ? 'Editá una copia y subila al catálogo compartido (no cambia este ítem)' : '';
  $('#view-edit-btn').style.display = '';
  $('#view-del-btn').style.display = ajeno ? 'none' : '';
  $('#view-baja-btn').style.display = (key === 'catalogo' && ajeno) ? '' : 'none';
  $('#scrim-view').classList.add('open');
}
const ES_KEY_ITEM = k => k === 'inventario' || k === 'cinturon' || k === 'catalogo';
function verItemAjeno(key){
  if(!ES_KEY_ITEM(key)) return false;
  if(fichaVivo && fichaVivo.soloLectura) return true;
  if(key !== 'catalogo') return false;
  // Del catálogo: solo los ítems propios de esta ficha se editan en el lugar; los de fábrica, los subidos por el grupo,
  // los de la tienda y los del botín se editan como copia para subir.
  const it = viewing && (S.catalogo || []).find(x => x.id === viewing.id);
  return !it || !!it._bib || CATALOGO_BASE.some(b => b.id === it.id);
}

/* =========================================================
   CATÁLOGO DEL FABRICANTE
   ========================================================= */

let chooserPreset = true;

let chooserTarget = 'inventario';

function abrirChooser(target, equipadoPreset){
  chooserTarget = target;
  chooserPreset = equipadoPreset;
  $('#scrim-chooser').classList.add('open');
}

const TIER_COLOR = {'Común':'#9A867E', 'Buena Calidad':'#A8C256', 'Raro':'#5B8DBE', 'Excepcional':'#E0A458', 'Legendario':'#9B7BD4', 'A definir':'#D4574E'};

// Lista legible de TODOS los mods del ítem (menos Defensa, que ya se ve en
// el resumen) — atributos secundarios, resistencias a crítico, lo que sea.
// Así la tarjeta no depende de que el detalle escrito a mano mencione cada
// mod: siempre refleja los datos reales del ítem.
function modsResumenHtml(item){
  const mods = (item.mods || []).filter(m => m.stat && m.stat !== 'def');
  if(!mods.length) return '';
  return mods.map(m => {
    const label = TIPOS_IDS.includes(m.stat) ? `Res.Crít. ${STAT_LABEL[m.stat]}` : (STAT_LABEL[m.stat] || m.stat);
    const val = num(m.val);
    const suf = '';
    const cls = val > 0 ? 'mod-plus' : val < 0 ? 'mod-minus' : '';
    return `<span class="${cls}">${esc(label)} ${val>0?'+':''}${fmt(val)}${suf}</span>`;
  }).join(' · ');
}

// Texto completo del ítem para la búsqueda: nombre, detalle, tier,
// categoría/slot y todos los mods en su forma legible — así "stun",
// "veneno" o "constitución" encuentran el ítem aunque esas palabras no
// estén en el nombre.
function textoBusquedaDe(item){
  const partes = [item.nombre, item.detalle, item.tier, CATEGORIA_LABEL[item.tipoItem], SLOT_LABEL[slotDe(item.tipoItem)]];
  (item.mods || []).forEach(m => {
    partes.push(STAT_LABEL[m.stat] || m.stat, STAT_FULL[m.stat]);
  });
  return normalizarBusqueda(partes.filter(Boolean).join(' '));
}

function precioTiendaHtml(item){
  const base = num(item.precioCompra);
  const final = precioDeCompra(item);
  if(final === base) return `<b>${fmt(base)} DDE</b>`;
  return `<span class="precio-lista">${fmt(base)}</span><b>${fmt(final)} DDE</b>`;
}

// Slot que ocupa un ítem según SLOT_DEFS, y si ese slot ya está lleno o
// ya hay algo del mismo tipo puesto (para el botón Comparar). Devuelve
// null para lo que no ocupa un slot del cuerpo (consumibles, etc.).
function slotOcupadoInfo(item){
  const slotDef = SLOT_DEFS.find(sd => sd.cats.includes(item.tipoItem));
  if(!slotDef) return null;
  const usado = computeSlots().find(s => s.id === slotDef.id)?.usado || 0;
  const propio = slotDef.peso ? (slotDef.peso[item.tipoItem] || 1) : 1;
  const equipados = S.inventario.filter(i => i.equipado && i.tipoItem === item.tipoItem);
  return {ocupado: usado + propio > slotDef.max, equipados};
}

function catalogoRowHtml(item){
  const dano = armaDanoTxt(item);
  const defVal = defValorDe(item);
  const statTxt = dano ? `Daño ${dano}` : (defVal ? `Defensa ${defVal>0?'+':''}${fmt(defVal)}` : '');
  const tierColor = TIER_COLOR[item.tier] || TIER_COLOR['Común'];
  const catLabel = CATEGORIA_LABEL[item.tipoItem];
  const slotInfo = slotOcupadoInfo(item);
  return `<div class="cat-row cat-card" data-catid="${item.id}">
    ${thumb(item)}
    <div class="cat-info">
      <div class="cat-card-titulo">
        <div class="cat-nombre">${esc(item.nombre)}${item._bib ? ` <span class="hint" style="font-weight:600;${item._bib.auditado ? '' : 'color:#e0a040'}" title="Lo subió alguien del grupo${item._bib.auditado ? '' : ' y todavía no lo revisó el dueño (se puede usar igual)'}">${esc(ItemsSubidos.etiqueta(item))}</span>` : ''}</div>
        ${item.tier ? `<div class="cat-tier-badge" style="color:${tierColor};border-color:${tierColor};background:${tierColor}22">${esc(item.tier)}</div>` : ''}
      </div>
      <div class="cat-meta">${precioTiendaHtml(item)} · Peso ${fmt(num(item.peso))}${statTxt ? ` · ${esc(statTxt)}` : ''}${item.consumible?` · consumible${item.curahp?` (${num(item.curahp)>0?'+':''}${fmt(num(item.curahp))} HP)`:''}`:''}</div>
      ${catLabel ? `<div class="cat-tipo">${esc(catLabel)}</div>` : ''}
      ${slotInfo && (slotInfo.ocupado || slotInfo.equipados.length) ? `<div class="cat-slot-fila">
        ${slotInfo.ocupado ? `<span class="cat-slot-badge">Slot ocupado</span>` : ''}
        ${slotInfo.equipados.length ? `<button type="button" class="cat-btn-comparar" data-comparar="${item.id}">Comparar</button>` : ''}
      </div>` : ''}
      ${item.detalle ? `<div class="cat-detalle">${esc(item.detalle)}</div>` : ''}
    </div>
    <div class="cat-actions">
      <input type="number" class="cat-qty" data-catqty="${item.id}" value="1" min="1">
      ${tiendaCargada && tiendaCargada.agregarGratis ? `<button class="cat-btn add" data-catalogoadd="${item.id}" title="El GM permitió agregar ítems gratis en esta tienda">Agregar a mochila (gratis)</button>` : ''}
      <button class="cat-btn buy" data-catalogocarrito="${item.id}">+ Carrito</button>
    </div>
    <div class="cat-manage">
      <button data-view="catalogo:${item.id}">Ver</button>
      <button data-catalogoedit="${item.id}">Editar</button>
      <button data-catalogodel="${item.id}">Eliminar</button>
    </div>
  </div>`;
}

// Stats de un ítem en forma comparable: Defensa, daño promedio del arma
// (dados*(caras+1)/2 + fijo, no la tirada exacta) y todos sus mods menos
// Defensa (que ya va aparte).
const STAT_COMPARABLE_LABEL = {def:'Defensa', danoprom:'Daño prom.'};
function statsComparablesDe(item){
  const out = {};
  const defVal = defValorDe(item);
  if(defVal) out.def = defVal;
  if(ES_ARMA(item.tipoItem)){
    const dados = Math.max(1, num(item.peso) || 1) + Math.max(0, num(item.danoAmplificado)), caras = num(item.tipoDado) || 8, fijo = num(item.danoFijo);
    out.danoprom = Math.round((dados * (caras + 1) / 2 + fijo) * 10) / 10;
  }
  (item.mods || []).forEach(m => {
    if(!m.stat || m.stat === 'def') return;
    out[m.stat] = (out[m.stat] || 0) + num(m.val);
  });
  return out;
}

