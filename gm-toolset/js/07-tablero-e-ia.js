// js/07-tablero-e-ia.js — tramo 7 de 12 del script de gm-tools.html (paso 5, nivel A: mismo código, en el mismo orden).
/* =========================================================
   GITHUB
   Queda solo para el catálogo ("Agregar al catálogo"). Los creeps
   ya no se suben acá: se guardan solos en la mesa (ver CREEPS EN VIVO).
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
/* =========================================================
   TABLERO DE COMBATE
   Personajes de los jugadores en vivo (Firebase) y tus creeps tal como
   los tenés abiertos (ver "Tablero en vivo").
   ========================================================= */

async function ghLeerJson(ruta){
  const url = `https://api.github.com/repos/${GH_REPO}/contents/${ruta}?ref=${GH_BRANCH}`;
  const cab = {Accept: 'application/vnd.github.raw+json'};
  const token = localStorage.getItem('gh-token');
  if(token) cab.Authorization = 'Bearer ' + token.trim();
  const resp = await fetch(url, {headers: cab, cache: 'no-store'});
  if(resp.status === 404) return null;
  if(resp.status === 429 || resp.status === 403) throw {limite: true};
  if(!resp.ok) throw new Error(`GitHub respondió ${resp.status} leyendo ${ruta}`);
  return await resp.json();
}

/* ---------- Tablero en vivo (Firebase) ----------
   Mientras el Tablero está abierto escucha las fichas de los jugadores
   y se redibuja solo. Al cerrarlo deja de escuchar. (La ficha tenía una
   copia de este Tablero; se quitó porque lo mismo se ve en el mapa.) */

let tableroCortes = [];
const tableroDatos = {fichas: null, creeps: null};

function tableroFechaIso(ts){
  return ts && ts.toDate ? ts.toDate().toISOString() : '';
}

function tarjetaDeFicha(doc){
  const d = doc.data({serverTimestamps: 'estimate'});
  const r = d.resumen || {};
  return {
    id: doc.id, nombre: d.nombre || 'Sin nombre', nivel: num(r.nivel), imagen: d.miniatura || '',
    // La barra de SP usa bonos/bonosMax; las fichas de la Iteración 2
    // publican sp/spMax (las viejas, bonos/bonosMax).
    hp: num(r.hp), hpMax: num(r.hpMax),
    bonos: num(r.spMax !== undefined ? r.sp : r.bonos), bonosMax: num(r.spMax !== undefined ? r.spMax : r.bonosMax),
    muerto: !!r.muerto, estados: r.estados || [], actualizado: tableroFechaIso(d.actualizado),
  };
}

function tableroCerrar(){
  tableroCortes.forEach(cortar => cortar());
  tableroCortes = [];
  if(tableroMapaActivoCorte){ tableroMapaActivoCorte(); tableroMapaActivoCorte = null; }
  tableroTokensMapa = new Set();
  tableroDatos.fichas = tableroDatos.creeps = null;
  $('#scrim-tablero').classList.remove('open');
}

function tableroEscucharColeccion(coleccion, clave, aTarjeta){
  tableroCortes.push(fbDb.collection(fbRutaCampana(coleccion)).onSnapshot(snap => {
    tableroDatos[clave] = snap.docs.map(aTarjeta);
    renderTablero();
  }, err => {
    console.error(`Error escuchando ${coleccion} para el tablero:`, err);
    $('#tablero-body').innerHTML = '<div class="hint">No se pudo leer el tablero. ¿Están publicadas las reglas nuevas?</div>';
  }));
}

// En gm-tools los creeps salen de lo que tenés abierto (con números).
function tableroCreepsLocales(){
  return creepsReales().map(sc => ({
    id: sc.id,
    nombre: sc.nombre,
    nivel: num(sc.nivel),
    imagen: sc.imagen || '',
    hp: num(sc.hp),
    hpMax: num(sc.hpMax),
    estados: (sc.estados || []).filter(es => es.activo !== false).map(es => ({nombre: es.nombre, turnos: num(es.turnos), permanente: !!es.permanente, ...((es.escudoMagicoActual !== undefined || num(es.escudoMagico) > 0) ? {escudo: num(es.escudoMagicoActual ?? es.escudoMagico), ...(es.excedenteVida ? {excedente: true, ...(es.excedenteTope ? {tope: num(es.excedenteTope)} : {})} : {escudoMax: num(es.escudoMagico)})} : {}), ...(es.armaduraRota ? {armaduraRota: true, stacks: Math.max(1, num(es.stacks) || 1)} : {}), detalle: es.detalle || ''})),
  }));
}

// El tablero solo muestra lo que tiene token en el mapa PUBLICADO (2026-09-22, a pedido del
// dueño) — no todo lo que hay abierto en gm-tools, que puede incluir cosas de otro escenario
// o todavía sin poner en el mapa. Mismo esquema de colecciones que vtt-hexgrid/mapa.html
// (campanas/{id}/tokens para el mapa principal, campanas/{id}/mapas/{id}/tokens para uno
// guardado); acá no hace falta filtrar oculto/sigilo, porque esto lo ve solo el GM.
const TABLERO_MAPA_PRINCIPAL = '_principal';
let tableroMapaActivo = TABLERO_MAPA_PRINCIPAL;
let tableroMapaActivoCorte = null;
let tableroTokensMapa = new Set();   // fichaId (de pj o creep) con token en el mapa publicado
function tableroColeccionTokensDe(mapaId){
  return mapaId === TABLERO_MAPA_PRINCIPAL
    ? fbDb.collection(fbRutaCampana('tokens'))
    : fbDb.collection(fbRutaCampana(`mapas/${mapaId}/tokens`));
}
function tableroEscucharMapaPublicado(){
  tableroCortes.push(fbDb.doc(fbRutaCampana('mapa/activo')).onSnapshot(doc => {
    tableroMapaActivo = (doc.exists && doc.data().mapaId) || TABLERO_MAPA_PRINCIPAL;
    if(tableroMapaActivoCorte) tableroMapaActivoCorte();
    tableroTokensMapa = new Set();
    tableroMapaActivoCorte = tableroColeccionTokensDe(tableroMapaActivo).onSnapshot(snap => {
      tableroTokensMapa = new Set(snap.docs.map(d => d.data().fichaId).filter(x => typeof x === 'string' && x));
      renderTablero();
    }, err => console.error('Error escuchando los tokens del mapa publicado:', err));
  }, err => console.error('Error escuchando el mapa publicado:', err)));
}

function haceCuanto(iso){
  if(!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  if(!Number.isFinite(ms) || ms < 0) return '';
  const min = Math.floor(ms / 60000);
  if(min < 1) return 'recién';
  if(min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if(h < 24) return `hace ${h} h`;
  return `hace ${Math.floor(h / 24)} d`;
}

function tableroCardHtml(x, tipo){
  // De los creeps, los jugadores reciben solo el porcentaje de vida
  // (hpPct): la barra se muestra sin números.
  const conNumeros = x.hpPct === undefined || x.hpPct === null;
  const hp = num(x.hp);
  const hpMax = num(x.hpMax);
  const pct = conNumeros
    ? (hpMax > 0 ? Math.max(0, Math.min(100, (hp / hpMax) * 100)) : 0)
    : Math.max(0, Math.min(100, num(x.hpPct)));
  const caido = conNumeros ? (hp <= 0 || x.muerto) : !!x.muerto;
  const spMax = num(x.bonosMax);
  const spPct = spMax > 0 ? Math.max(0, Math.min(100, (num(x.bonos) / spMax) * 100)) : 0;
  const estados = (x.estados || []).filter(e => e && e.nombre);
  const desde = haceCuanto(x.actualizado);
  return `<div class="tablero-card ${tipo === 'pj' ? 'es-pj' : 'es-creep'}${caido ? ' caido' : ''}">
    <div class="tablero-card-top">
      ${x.imagen ? `<img class="tablero-foto" src="${esc(x.imagen)}" alt="">` : ''}
      <div class="tablero-nombre">${esc(x.nombre)}${x.nivel ? ` <span class="tablero-nivel">Lv ${fmt(num(x.nivel))}</span>` : ''}</div>
    </div>
    <div class="tablero-hp-fila">
      <div class="tablero-hp-barra"><div class="tablero-hp-fill" style="width:${pct}%"></div></div>
      ${conNumeros ? `<span class="tablero-hp-txt">${fmt(Math.max(0, hp))}${hpMax ? `/${fmt(hpMax)}` : ''}</span>` : ''}
    </div>
    ${spMax > 0 ? `<div class="tablero-hp-fila">
      <div class="tablero-hp-barra"><div class="tablero-hp-fill sp" style="width:${spPct}%"></div></div>
      <span class="tablero-hp-txt">${fmt(num(x.bonos))}/${fmt(spMax)} SP</span>
    </div>` : ''}
    ${caido ? `<div class="tablero-caido">${tipo === 'pj' ? 'Caído' : 'Derrotado'}</div>` : ''}
    ${estados.length ? `<div class="tablero-estados">${estados.map(e => {
      const det = (e.detalle || '').trim();
      return `<span class="tablero-estado${det ? ' con-tip' : ''}"><b>${esc(e.nombre)}</b>${e.permanente ? '' : (num(e.turnos) ? ` ${fmt(num(e.turnos))}t` : '')}${det ? `<span class="tablero-estado-tip">${esc(det)}</span>` : ''}</span>`;
    }).join('')}</div>` : ''}
    ${desde ? `<div class="tablero-viejo">${esc(desde)}</div>` : ''}
  </div>`;
}

function renderTablero(){
  if(!$('#scrim-tablero').classList.contains('open')) return;
  const fichasTodas = tableroDatos.fichas;
  const fichas = fichasTodas === null ? null : fichasTodas.filter(f => tableroTokensMapa.has(f.id));
  const creeps = tableroCreepsLocales().filter(c => tableroTokensMapa.has(c.id));
  let html = '';
  if(fichas === null){
    html += `<div class="tablero-grupo">Personajes</div><div class="hint">${fbMiembro ? 'Cargando…' : 'Entrá a la mesa para ver los personajes de los jugadores.'}</div>`;
  }else if(fichas.length){
    const orden = fichas.slice().sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    html += `<div class="tablero-grupo">Personajes · ${fmt(orden.length)} · en vivo</div>`;
    html += `<div class="tablero-grid">${orden.map(x => tableroCardHtml(x, 'pj')).join('')}</div>`;
  }else{
    html += `<div class="tablero-grupo">Personajes</div><div class="hint">${fichasTodas && fichasTodas.length ? 'Ninguno tiene token en el mapa publicado todavía.' : 'Ningún jugador creó personajes todavía.'}</div>`;
  }
  if(creeps.length){
    html += `<div class="tablero-grupo">Creeps · ${fmt(creeps.length)}</div>`;
    html += `<div class="tablero-grid">${creeps.map(x => tableroCardHtml(x, 'creep')).join('')}</div>`;
  }
  $('#tablero-body').innerHTML = html;
  const enPie = creeps.filter(c => num(c.hp) > 0).length;
  $('#tablero-sello').textContent = creeps.length ? `${fmt(enPie)} creep(s) en pie` : '';
}

function abrirTablero(){
  $('#scrim-tablero').classList.add('open');
  $('#tablero-refrescar').style.display = 'none';
  renderTablero();
  if(fbDb && fbMiembro && !tableroCortes.length){
    tableroEscucharColeccion('fichas', 'fichas', tarjetaDeFicha);
    tableroEscucharMapaPublicado();
  }
}

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

/* =========================================================
   GENERAR CREEP CON IA (OpenRouter)
   Usa un modelo gratuito de OpenRouter para armar un creep
   completo a partir de una descripción libre. La clave se
   pide una sola vez (como el token de GitHub) y queda en
   localStorage — nunca se sube a ningún lado.
   ========================================================= */

const OR_MODELS = [
  {id:'nvidia/nemotron-3-super-120b-a12b:free', label:'Nemotron 3 Super (NVIDIA) — recomendado'},
  {id:'openai/gpt-oss-20b:free', label:'GPT-OSS 20B (OpenAI)'},
  {id:'nvidia/nemotron-nano-9b-v2:free', label:'Nemotron Nano (rápido y liviano)'},
];

function poblarSelectorModelos(){
  const sel = $('#ia-modelo');
  if(sel.options.length) return; // ya poblado
  const guardado = localStorage.getItem('openrouter-modelo');
  sel.innerHTML = OR_MODELS.map(m => `<option value="${m.id}">${esc(m.label)}</option>`).join('');
  if(guardado && OR_MODELS.some(m => m.id === guardado)) sel.value = guardado;
}

function orKey(pedirDeNuevo){
  let t = localStorage.getItem('openrouter-key');
  if(!t || pedirDeNuevo){
    t = prompt('Pegá tu clave de OpenRouter (la que copiaste en el paso "2. Crear clave").\n\nQueda guardada en este navegador.');
    if(t) localStorage.setItem('openrouter-key', t.trim());
  }
  return t ? t.trim() : null;
}

const IA_SISTEMA = `Sos un asistente que diseña enemigos ("creeps") para un juego de rol táctico. Devolvé SOLO un objeto JSON, sin texto alrededor ni bloques de código, con exactamente este formato:
{
  "nombre": string, "nivel": number,
  "con": number, "fue": number, "agl": number, "des": number, "esp": number,
  "spd": number,
  "armaTipo": 4 | 6 | 8 | 10 | 12, "armaPeso": number, "armaFijo": number,
  "defensa": number, "armaduraTipo": string,
  "crit": [number, number, number, number],
  "habilidades": [{"nombre": string, "detalle": string, "cd": number}],
  "notas": string
}
No incluyas hp, hpMax ni nitros — esos se calculan aparte con fórmulas fijas del juego, no los inventes vos.
Regla de atributos: con + fue + agl + des + esp debe sumar aproximadamente 33 + 3×(nivel-1) puntos (a nivel 1 son ~33 puntos repartidos entre los cinco). Repartilos de forma pareja o especializada según el concepto (ej. un tanque con con y fue altos y agl/esp bajos), pero respetá ese total aproximado — no generes números al azar sin relación con el nivel pedido. Variá los valores según cada creep, no repitas siempre el mismo patrón.
Regla de arma: "armaPeso" es la cantidad de dados que tira el arma al hacer daño (el daño final es armaPeso × d(armaTipo) + armaFijo) — SIEMPRE un número entero, normalmente 1 a 3 (hasta 4 o 5 solo para un arma pesada de dos manos). Nunca un decimal ni un número grande.
Regla de resistencia a crítico ("crit", 4 valores para armas Tipo 4/6/8/10): en este juego esa resistencia la da la armadura equipada, no el cuerpo del bicho — así que lo normal es [0,0,0,0]. Solo poné algún 1, 2 o máximo 3 en algún valor si el concepto del creep tiene explícitamente una coraza, caparazón o blindaje pesado (ej. un cangrejo acorazado, un robot blindado). Un animal común (perro, rata, lobo) va siempre en [0,0,0,0].
Generá entre 2 y 4 habilidades temáticas, cada una con "detalle" describiendo el efecto en una o dos líneas y "cd" en turnos (0 si no tiene cooldown). Ajustá defensa y el resto de los números al nivel y la descripción pedidos.`;

// Schema estricto (además del prompt) para que el modelo no pueda devolver
// tipos raros o campos de más — reduce los valores "al azar" que devuelven
// los modelos gratuitos cuando sólo se les pide JSON suelto.
const CREEP_SCHEMA = {
  type: 'object',
  properties: {
    nombre: {type: 'string'},
    nivel: {type: 'number'},
    con: {type: 'number'}, fue: {type: 'number'}, agl: {type: 'number'}, des: {type: 'number'}, esp: {type: 'number'},
    spd: {type: 'number'},
    armaTipo: {type: 'number', enum: [4,6,8,10,12]},
    armaPeso: {type: 'integer', minimum: 1, maximum: 5}, armaFijo: {type: 'number'},
    defensa: {type: 'number'}, armaduraTipo: {type: 'string'},
    crit: {type: 'array', items: {type: 'integer', minimum: 0, maximum: 3}, minItems: 4, maxItems: 4},
    habilidades: {
      type: 'array', minItems: 2, maxItems: 4,
      items: {
        type: 'object',
        properties: {nombre: {type: 'string'}, detalle: {type: 'string'}, cd: {type: 'number'}},
        required: ['nombre','detalle','cd'], additionalProperties: false,
      },
    },
    notas: {type: 'string'},
  },
  required: ['nombre','nivel','con','fue','agl','des','esp','spd','armaTipo','armaPeso','armaFijo','defensa','armaduraTipo','crit','habilidades','notas'],
  additionalProperties: false,
};

// hp/hpMax = con*5 y No2 = agl son reglas fijas del juego (ver ficha.html).
// No se le piden al modelo porque los modelos gratuitos las ignoran o inventan
// números — se calculan siempre acá, así el creep generado nunca las rompe.
function creepDesdeIA(data){
  const base = nuevoCreep();
  const con = num(data.con);
  const hpMax = Math.max(1, con * 5);
  const creep = Object.assign(base, {
    nombre: (data.nombre || base.nombre).toString(),
    nivel: num(data.nivel) || 1,
    hp: hpMax, hpMax,
    spd: num(data.spd) || 5,
    con, fue: num(data.fue), agl: num(data.agl), des: num(data.des), esp: num(data.esp),
    armaTipo: DADOS_ARMA.includes(num(data.armaTipo)) ? num(data.armaTipo) : 8,
    // armaPeso = cantidad de dados de daño: siempre entero, 1 a 5 (ver armaDanoTxt en ficha.html).
    armaPeso: Math.min(5, Math.max(1, Math.round(num(data.armaPeso)) || 1)),
    armaFijo: num(data.armaFijo),
    defensa: num(data.defensa),
    armaduraTipo: (data.armaduraTipo || '').toString(),
    // Resistencia a crítico: la da la armadura, no el bicho — 0 es lo normal, tope 3.
    crit: Array.isArray(data.crit) && data.crit.length
      ? [0,1,2,3,4].map(i => Math.min(3, Math.max(0, Math.round(num(data.crit[i])))))
      : [0,0,0,0,0],
    notas: (data.notas || '').toString(),
  });
  const habilidades = Array.isArray(data.habilidades) ? data.habilidades : [];
  creep.habilidades = [
    ...habilidades.map(h => ({id:uid(), nombre:(h.nombre||'').toString(), detalle:(h.detalle||'').toString(), cd:num(h.cd), cdActual:0})),
  ];
  creep.estados = [];
  return creep;
}

async function generarCreepIA(promptUsuario){
  if(!promptUsuario){ toast('Describí el creep antes de generar'); return; }
  const key = orKey(false);
  if(!key){ toast('Sin clave de OpenRouter no se puede generar'); return; }
  const modelo = $('#ia-modelo').value || OR_MODELS[0].id;
  localStorage.setItem('openrouter-modelo', modelo);
  const btn = $('#ia-generar');
  const textoOriginal = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Generando…';
  btn.classList.add('ia-loading');
  toast('Generando creep con IA…');
  try{
    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelo,
        response_format: {
          type: 'json_schema',
          json_schema: {name: 'creep', strict: true, schema: CREEP_SCHEMA},
        },
        provider: {require_parameters: true},
        messages: [
          {role: 'system', content: IA_SISTEMA},
          {role: 'user', content: promptUsuario},
        ],
      }),
    });
    if(resp.status === 401){
      localStorage.removeItem('openrouter-key');
      toast('La clave de OpenRouter no sirve o venció — tocá Generar de nuevo');
      return;
    }
    if(!resp.ok) throw new Error(`OpenRouter respondió ${resp.status}: ${await resp.text()}`);
    const data = await resp.json();
    const texto = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if(!texto) throw new Error('Respuesta vacía del modelo');
    const obj = JSON.parse(texto);
    const creep = creepDesdeIA(obj);
    if(!creep.mapa && typeof mapaParaNuevo === 'function') creep.mapa = mapaParaNuevo();
    S.creeps.push(creep);
    renderAll();
    ofrecerTokenEnMapa(creep);   // ¿su token en el mapa? (js/09)
    $('#scrim-ia').classList.remove('open');
    toast(`Creep generado: ${creep.nombre} ✓ — revisalo antes de usarlo`);
  }catch(err){
    console.error('Error generando creep con IA:', err);
    toast('No se pudo generar el creep — revisá la consola');
  }finally{
    btn.disabled = false;
    btn.textContent = textoOriginal;
    btn.classList.remove('ia-loading');
  }
}

function mantenimiento(){
  S.turno += 1;
  parryPendienteCreep.clear();
  let enCooldown = 0;
  let hpAplicado = 0;
  let vencidos = 0;
  // El pase de turno de cada creep: la regla vive en comun/creep-acciones.js (2026-10-02, A2b: la usa también el mapa).
  creepsReales().forEach(sc => {
    const r = CreepAcciones.mantenimiento(sc, typeof gmMantenimientoSenal === 'number' ? gmMantenimientoSenal : undefined);   // en combate lo hace su turno (P161)
    enCooldown += r.enCooldown;
    hpAplicado += r.hpAplicado;
    vencidos += r.vencidos;
    // Reporte para el 📜 Historial del GM (2026-09-24): qué le pasó a este creep en el pase de turno, con el antes y el después.
    if(r.rep.length && typeof historialReporteMantenimiento === 'function') historialReporteMantenimiento(sc.nombre, r.rep);
  });
  renderAll();
  const detalle = [
    enCooldown ? `${enCooldown} CD en cuenta regresiva` : '',
    hpAplicado ? `${hpAplicado} estado(s) aplicados` : '',
    vencidos ? `${vencidos} estado(s) vencidos` : '',
  ].filter(Boolean).join(' · ');
  toast(`Turno ${S.turno} · No2 recargados${detalle ? ` · ${detalle}` : ''}`);
}

// Vuelve a tapar todo lo descubierto de la niebla del mapa PUBLICADO (el
// que ven los jugadores) — mismo dato que "↺ Restablecer niebla" del mapa
// (vtt-hexgrid/mapa.html, nieblaReiniciar()), pero disparado desde acá al
// reiniciar el combate. Mejor esfuerzo: si falla, no interrumpe el resto.
async function nieblaReiniciarDesdeGM(){
  if(!fbDb || !fbMiembro) return;
  try{
    const act = await fbDb.doc(fbRutaCampana('mapa/activo')).get();
    const mapaId = act.exists && act.data().mapaId ? act.data().mapaId : '_principal';
    const ruta = mapaId === '_principal' ? 'mapa/niebla' : `mapas/${mapaId}/estado/niebla`;
    await fbDb.doc(fbRutaCampana(ruta)).set({descubiertas: []}, {merge: true});
  }catch(err){ console.error('No se pudo restablecer la niebla al reiniciar el combate:', err); }
}

// Qué pasa al reiniciar combate (decidido 2026-09-22): los cooldowns de
// habilidades vuelven a 0, salvo las marcadas "habilidad lenta"
// (cdArranca), que arrancan con el cooldown ya activo; los Nitros de los
// creeps se recargan a full; se restablece la niebla de guerra del mapa
// publicado (los jugadores no ven nada tapado, ni ella ni sus creeps
// quedan al descubierto por el reinicio, hasta que alguien vuelva a
// moverse).
function reiniciarCombate(){
  if(!confirm('¿Reiniciar el combate? El contador vuelve a cero.')) return;
  S.turno = 0;
  parryPendienteCreep.clear();
  S.creeps.forEach(sc => {
    (sc.habilidades || []).forEach(h => { h.cdActual = h.cdArranca ? num(h.cd) : 0; });
    sc.nitros = creepNitrosMax(sc);
    sc.recompensado = false;   // un combate nuevo: vuelve a contar para el reporte
  });
  combateRep = nuevoCombateRep();
  nieblaReiniciarDesdeGM();
  renderAll();
  toast('Combate reiniciado · Turno 0 · No2 recargados · niebla restablecida');
}


/* =========================================================
   🔎 ESCANEAR EL GRUPO (2026-10-09, pedido del dueño: «antes de crear un combate, un escaneo del party … y con una IA para tareas puntuales»)
   Los números los saca el programa con el mismo motor de la ficha (comun/escaneo-grupo.js, cargado recién al abrir, con ficha-calculo,
   ficha-guardado y ficha-combate); la IA (la misma clave y modelo de OpenRouter que «+ Creep con IA») solo propone un equipo de creeps con ese
   escaneo. No escribe nada en la partida.
   ========================================================= */
const ESCANEO_PIEZAS = ['../comun/ficha-calculo.js?v=20261007am', '../comun/ficha-guardado.js?v=20261007am', '../comun/ficha-combate.js?v=20261005mn', '../comun/escaneo-grupo.js?v=20261009d'];
let escaneo = {perfiles: [], fuera: new Set(), cargando: false};
function escaneoCargarScript(src){
  return new Promise((ok, mal) => {
    if([...document.scripts].some(s => s.src && s.src.includes(src.split('?')[0].replace('../', '')))){ ok(); return; }
    const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => mal(new Error('No se pudo cargar ' + src));
    document.head.appendChild(s);
  });
}
function escaneoVentana(){
  let f = document.getElementById('scrim-escaneo');
  if(f) return f;
  f = document.createElement('div');
  f.className = 'scrim'; f.id = 'scrim-escaneo';
  f.innerHTML = `<div class="modal" style="max-width:1000px;width:calc(100vw - 40px)">
    <header><h3>🔎 Escanear el grupo</h3><button class="iconbtn" data-esc="cerrar">Cerrar</button></header>
    <div style="padding:12px 16px;max-height:calc(100vh - 140px);overflow:auto">
      <div class="hint" style="margin-bottom:6px">Los números salen de las fichas, con el mismo cálculo que ve cada jugador (equipo, pasivas y estados de ahora). En rojo lo más bajo del grupo y en verde lo más alto. Destildá a quien no va a estar en el combate.</div>
      <div id="escaneo-quienes" style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:8px"></div>
      <div id="escaneo-cuerpo"><div class="hint">Leyendo las fichas…</div></div>
      <div class="eg-sec" style="font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin:14px 0 4px">🤖 Pedirle a la IA un equipo de creeps para este grupo</div>
      <textarea id="escaneo-notas" style="min-height:54px;width:100%" placeholder="Opcional: escenario, nivel, tono… ej. «minas abandonadas, nivel 3, que sea difícil pero ganable»"></textarea>
      <div style="display:flex;gap:8px;align-items:center;margin-top:6px">
        <span class="hint" style="flex:1">Usa la misma clave y modelo de «+ Creep con IA» (OpenRouter). La IA solo propone: vos decidís y armás los creeps.</span>
        <button class="btn primary" data-esc="ia">🤖 Proponer creeps</button>
      </div>
      <div id="escaneo-ia" style="white-space:pre-wrap;margin-top:10px;font-size:13px;line-height:1.5"></div>
    </div></div>`;
  document.body.appendChild(f);
  f.addEventListener('click', e => {
    if(e.target === f || e.target.closest('[data-esc="cerrar"]')){ f.classList.remove('open'); return; }
    if(e.target.closest('[data-esc="ia"]')){ escaneoPedirIA(); return; }
  });
  f.addEventListener('change', e => {
    const c = e.target.closest('[data-esc-quien]');
    if(!c) return;
    if(c.checked) escaneo.fuera.delete(c.dataset.escQuien); else escaneo.fuera.add(c.dataset.escQuien);
    escaneoDibujar();
  });
  return f;
}
const escaneoElegidos = () => escaneo.perfiles.filter(p => !escaneo.fuera.has(p.id));
function escaneoDibujar(){
  const f = escaneoVentana();
  f.querySelector('#escaneo-quienes').innerHTML = escaneo.perfiles.map(p => `<label style="display:inline-flex;gap:5px;align-items:center;cursor:pointer"><input type="checkbox" data-esc-quien="${esc(p.id)}"${escaneo.fuera.has(p.id) ? '' : ' checked'}> ${esc(p.nombre)} <span class="hint">nv ${fmt(p.nivel)}</span></label>`).join('');
  f.querySelector('#escaneo-cuerpo').innerHTML = EscaneoGrupo.html(escaneoElegidos());
}
async function abrirEscaneo(){
  if(!fbDb || !fbMiembro || !fbMiembro.gm){ toast('El escaneo es del GM, con la partida abierta'); return; }
  const f = escaneoVentana();
  f.classList.add('open');
  if(escaneo.cargando) return;
  escaneo.cargando = true;
  f.querySelector('#escaneo-cuerpo').innerHTML = '<div class="hint">Leyendo las fichas…</div>';
  try{
    for(const src of ESCANEO_PIEZAS) await escaneoCargarScript(src);
    const snap = await fbDb.collection(fbRutaCampana('fichas')).get();
    const perfiles = [];
    for(const d of snap.docs){
      try{
        const r = await FichaGuardado.cargar(fbDb, fbRutaCampana('fichas/' + d.id));
        if(r && r.S) perfiles.push(EscaneoGrupo.perfil(r.S, d.id));
      }catch(err){ console.error('No se pudo leer la ficha ' + d.id + ':', err); }
    }
    escaneo.perfiles = perfiles.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    escaneoDibujar();
  }catch(err){
    console.error('No se pudo escanear el grupo:', err);
    f.querySelector('#escaneo-cuerpo').innerHTML = '<div class="hint">No se pudo leer el grupo — mirá la consola.</div>';
  }finally{ escaneo.cargando = false; }
}
async function escaneoPedirIA(){
  const ps = escaneoElegidos();
  if(!ps.length){ toast('Elegí al menos un personaje'); return; }
  const key = orKey(false);
  if(!key){ toast('Sin clave de OpenRouter no se puede (pegala en «+ Creep con IA»)'); return; }
  const f = escaneoVentana(), caja = f.querySelector('#escaneo-ia'), btn = f.querySelector('[data-esc="ia"]');
  const modelo = localStorage.getItem('openrouter-modelo') || OR_MODELS[0].id;
  btn.disabled = true; btn.textContent = 'Pensando…';
  caja.textContent = '🤖 La IA está mirando el escaneo…';
  try{
    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST', headers: {'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json'},
      body: JSON.stringify({model: modelo, messages: [{role: 'system', content: EscaneoGrupo.IA_SISTEMA}, {role: 'user', content: EscaneoGrupo.textoParaIA(ps, f.querySelector('#escaneo-notas').value.trim())}]}),
    });
    if(resp.status === 401){ localStorage.removeItem('openrouter-key'); caja.textContent = 'La clave de OpenRouter no sirve o venció: volvé a pegarla en «+ Creep con IA».'; return; }
    if(!resp.ok) throw new Error(`OpenRouter respondió ${resp.status}: ${await resp.text()}`);
    const data = await resp.json();
    const texto = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    caja.textContent = texto ? String(texto).trim() : 'La IA no devolvió nada: probá de nuevo o con otro modelo.';
  }catch(err){
    console.error('No se pudo pedir la propuesta a la IA:', err);
    caja.textContent = 'No se pudo hablar con la IA — mirá la consola.';
  }finally{ btn.disabled = false; btn.textContent = '🤖 Proponer creeps'; }
}
if(document.getElementById('btn-escaneo')) document.getElementById('btn-escaneo').onclick = abrirEscaneo;
