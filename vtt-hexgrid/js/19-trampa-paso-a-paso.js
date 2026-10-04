// js/19-trampa-paso-a-paso.js — caer en una trampa, paso a paso (2026-10-04, pedido del dueño: «con su momento para cada tirada y su anuncio
// de cada resultado»; «que lo tire la víctima»). Va después del arranque: solo define funciones.
/* Al dispararse una trampa, la pantalla de quien movió crea un momento por afectado (js/08, trampaAplicarEfectos → trampaMomentoNuevo):
   tipo 'trampa', con lo que hace la trampa en `datos` y en qué paso va (`datos.fase`). Lo resuelve la pantalla de quien maneja a la víctima
   (su dueño, el GM con 🎮 el control, el GM para un creep), en el cuadro con la estética del duelo (AvisoCombate.mostrar, con clave):
     1 «Para esquivarla» (si tiene salvación): «🎲 Tirar Evasión»; los dados ruedan y recién quietos se anuncia el resultado;
     2 «Daño»: «🎲 Tirar el daño»; los dados de la trampa ruedan, se aplica y se anuncia (Defensa, escudo, Invulnerable);
     3 «Lo que le deja»: el estado se aplica solo (sin tirada) y dice cómo soltarse;
     4 el cartel grande del resultado y «Entendido».
   Cada paso queda escrito en el momento (`datos.pasos`, `datos.lineas`): el resto de la mesa lo sigue en la Crónica, renglón por renglón. Si
   quien tiene que tirar no está, el GM lo hace desde la Crónica («🎲 Tirar por él»); cerrar el cuadro antes de terminar lo deja en la Crónica
   con «🪤 Seguir». Un paso se toma con una transacción (`datos.tirando`), así dos pantallas no tiran el mismo. En una trampa de área cada uno
   tira lo suyo, también el daño. */
const trampasDatos = new Map();     // id → el último momento de una trampa que resuelve esta pantalla
const trampasTomadas = new Set();   // las que esta pantalla resuelve aunque no le toquen (el GM tirando por alguien)
const trampasCerradas = new Set();  // las que se cerraron con ✕ o «Entendido» (no se vuelven a abrir solas)
const trampaCola = [];              // las que esperan su turno para mostrarse
let trampaEnPantalla = null;        // la que se ve ahora
let trampaTirandoAca = null;        // la que está tirando esta pantalla (dados rodando)
const TRAMPA_PENDIENTE_MS = 30 * 60 * 1000;   // en la Crónica, una sin terminar se queda (hasta que alguien la resuelva)

const trampaSpec = dt => { try{ return dt.spec ? JSON.parse(dt.spec) : null; }catch(e){ return null; } };
const trampaEtq = s => s.etq || ZONA_STAT_LABEL[s.stat] || s.stat;
const trampaEsperarDados = () => new Promise(r => { if(document.hidden || typeof Duelo === 'undefined' || !Duelo.esperarDados) r(); else Duelo.esperarDados(r); });

// Esquivarla entera es la excepción; lo común es resistir lo que deja (dueño, 2026-10-04). `logra`: el texto propio de la trampa.
const trampaTituloSalva = s => s.que === 'efecto' ? 'Para resistirlo' : 'Para esquivarla';
function trampaLogra(dt){
  const s = dt.salva;
  if(s.logra) return s.logra;
  return s.que === 'mitad' ? 'recibe la mitad del daño' : s.que === 'efecto' ? (dt.dano ? 'resiste lo que le deja (el daño entra igual)' : 'lo resiste') : 'la esquiva';
}
// El paso que sigue después de `fase`, según lo que tiene la trampa y lo que ya esquivó.
// Cada efecto tiene su momento en el Anuncio (dueño, 2026-10-04): lo que le deja, lo que va a mano, el muro y la nube son pasos propios,
// con «▶ Seguir» (sin tirada).
function trampaFaseSiguiente(dt, fase){
  const orden = ['empuje', 'salva', 'dano', 'sp', 'estado', 'mano', 'muro', 'zona', 'fin'];
  const agarro = dt.evita !== 'todo' && dt.evita !== 'efecto';
  for(const f of orden.slice(orden.indexOf(fase) + 1)){
    if(f === 'dano' && (dt.dano || dt.danoFijo) && dt.evita !== 'todo') return f;
    if(f === 'sp' && dt.pierdeSp && agarro) return f;
    if(f === 'estado' && dt.spec && agarro) return f;
    if(f === 'mano' && dt.aMano && agarro) return f;
    if(f === 'muro' && dt.muro) return f;
    if(f === 'zona' && dt.zona) return f;
    if(f === 'fin') return f;
  }
  return 'fin';
}
const TRAMPA_INFO = ['estado', 'mano', 'muro', 'zona'];   // los pasos sin tirada
function trampaTextoInfo(dt){
  if(dt.fase === 'mano') return {titulo: 'Lo que va a mano', texto: dt.aMano};
  if(dt.fase === 'muro') return {titulo: 'El muro', texto: `Se levanta ${num(dt.muroLargo) === 1 ? 'un pilar' : `un muro de ${num(dt.muroLargo) || 3} casillas`} justo delante, por ${dt.muro} turnos: hay que rodearlo.`};
  if(dt.fase === 'zona') return {titulo: 'Queda en el piso', texto: `El efecto dura ${dt.zona} turnos: en cada Mantenimiento, a quien siga encima se le renueva (con su tirada para resistirlo), y quien entre también lo sufre.`};
  return null;
}
// Lo que falta: {titulo, texto, boton, espera} (espera = el renglón de la Crónica mientras tanto).
function trampaPasoQueFalta(dt){
  if(dt.fase === 'empuje') return {titulo: 'Sale despedido', texto: 'El muro sale justo donde está parado: tira 1d6 para ver a qué casilla vecina sale despedido (las 6 vecinas en ronda, la 1 hacia el frente del muro; si le toca una ocupada, la siguiente libre). Después, 1d6 de daño directo.',
    boton: '🎲 Tirar adónde sale (1d6)', espera: `${dt.quien} tira adónde sale despedido…`};
  if(dt.fase === 'salva' && dt.salva){
    const s = dt.salva, etq = trampaEtq(s);
    return {titulo: trampaTituloSalva(s), texto: `${etq} contra ${s.dif}: con ${s.dif} o más, ${trampaLogra(dt)}.`, boton: `🎲 Tirar ${etq}`, espera: `${dt.quien} tira ${etq}…`};
  }
  if(dt.fase === 'dano' && dt.danoFijo) return {titulo: 'Le llega la descarga', texto: `${dt.danoFijo} de daño${dt.elemento ? ' ' + Combatiente.ELEMENTOS[dt.elemento].icono : ''}, directo a la vida (la mitad del salto anterior; lo frenan ${dt.elemento ? Combatiente.ELEMENTOS[dt.elemento].etq + ' y ' : ''}la Armadura mágica).`,
    boton: '▶ Recibir la descarga', espera: `a ${dt.quien} le llega la descarga…`};
  if(dt.fase === 'dano') return {titulo: 'Daño', texto: `La trampa pega ${dt.dano}${dt.elemento ? ' ' + Combatiente.ELEMENTOS[dt.elemento].icono : ''}${dt.evita === 'mitad' ? ' (la mitad)' : ''}${dt.ignoraDef ? ', directo a la vida' : ', menos la Defensa'}${dt.elemento ? ` (lo frenan ${Combatiente.ELEMENTOS[dt.elemento].etq} y la Armadura mágica)` : ''}.`,
    boton: `🎲 Tirar el daño (${dt.dano})`, espera: `${dt.quien} tira el daño…`};
  if(dt.fase === 'sp') return {titulo: 'Le chupa el SP', texto: `La runa le arranca ${dt.pierdeSp} de SP.`, boton: `🎲 Tirar cuánto SP pierde (${dt.pierdeSp})`, espera: `${dt.quien} tira cuánto SP pierde…`};
  if(dt.fase === 'estado'){ const sp = trampaSpec(dt); return {titulo: 'Lo que le deja', texto: sp ? EstadosAplicar.texto(sp) : '', boton: '▶ Seguir', espera: `${dt.quien}: lo que le deja…`}; }
  const info = trampaTextoInfo(dt);
  if(info) return {...info, boton: '▶ Seguir', espera: `${dt.quien}: ${info.titulo.toLowerCase()}…`};
  return null;
}
function trampaLineas(dt){
  const l = (dt.pasos || []).map(p => `${p.titulo}: ${p.texto}`);
  const f = trampaPasoQueFalta(dt);
  if(f) l.push(`⏳ ${f.espera}`);
  return l;
}
// El final: el muro (si es el que la pisó), el cartel grande y el resumen.
function trampaFinal(dt){
  const pasos = [...(dt.pasos || [])];
  const e = dt.evita;
  const veredicto = e === 'todo' ? {tono: 'bueno', grande: '¡LA ESQUIVÓ!'} : (e === 'efecto' || e === 'mitad') ? {tono: 'neutro', grande: e === 'mitad' ? 'LA MITAD' : '¡LO RESISTIÓ!'}
    : {tono: 'malo', grande: dt.pisador ? '¡CAYÓ EN LA TRAMPA!' : '¡LO ALCANZÓ!'};
  const resultado = pasos.map(p => p.texto).join(' · ') || 'no le hizo nada';
  return {resultado, datos: {...dt, pasos, fase: 'fin', tirando: false, veredicto, lineas: pasos.map(p => `${p.titulo}: ${p.texto}`)}};
}

// Al dispararse (js/08): el momento de un afectado.
async function trampaMomentoNuevo(p){
  const x = p.x, s = p.salva;
  const dt = {
    tokenId: p.tokenId || '', creep: x.tipo === 'creep', fichaId: String(x.fichaId || ''), quien: p.quien, nombreT: p.nombreT, pisador: !!p.pisador,
    salva: s ? {stat: String(s.stat), etq: String(s.etq || ''), dif: num(s.dif), que: String(s.que || 'todo'), ...(s.logra ? {logra: String(s.logra)} : {})} : null,
    dano: p.dano || '', ignoraDef: !!p.ignoraDef, elemento: p.elemento || '', pierdeSp: p.pierdeSp || '',
    cadena: p.cadena && p.pisador ? {rango: num(p.cadena.rango) || 3, golpeados: [p.tokenId || '']} : null, spec: p.specJson || '', muro: num(p.muro), muroLargo: num(p.muroLargo), zona: num(p.zona), aMano: p.aMano || '',
    fase: '', tirando: false, evita: '', pasos: [],
  };
  dt.fase = dt.salva ? 'salva' : trampaFaseSiguiente(dt, 'salva');
  const titulo = p.pisador ? `${p.quien} pisó «${p.nombreT}»` : `${p.quien} quedó en el área de «${p.nombreT}»`;
  if(dt.fase === 'fin'){   // nada que tirar ni mostrar: solo se anuncia
    const f = trampaFinal(dt);
    return momentoAbrir({tipo: 'trampa', icono: '🪤', titulo, estado: 'listo', resultado: f.resultado, datos: f.datos});
  }
  dt.lineas = trampaLineas(dt);
  return momentoAbrir({tipo: 'trampa', icono: '🪤', titulo, estado: 'paso', datos: dt});
}

// Un token parado donde se levanta un muro (js/08, trampaLevantarMuro): sale despedido (paso «empuje») y recibe 1d6 directo.
async function trampaMomentoEmpuje(e, nombreT, prohibidas){
  const x = e.x, quien = x.oculto ? 'Alguien' : nombreDe(x);
  const dt = {tokenId: e.tokenId, creep: x.tipo === 'creep', fichaId: String(x.fichaId || ''), quien, nombreT, pisador: false, salva: null,
    dano: '1d6', ignoraDef: true, spec: '', muro: 0, aMano: '', fase: 'empuje', tirando: false, evita: '', pasos: [],
    empuje: {col: e.col, fila: e.fila, frente: e.frente, prohibidas}};
  dt.lineas = trampaLineas(dt);
  return momentoAbrir({tipo: 'trampa', icono: '🧱', titulo: `${quien}: el muro sale debajo de sus pies`, estado: 'paso', datos: dt});
}

// ¿Esta pantalla resuelve a esta víctima?
function trampaMeToca(id, dt){
  if(trampasTomadas.has(id)) return true;
  if(dt.creep) return soyGM;
  const base = String(dt.fichaId || '').split(SEP_INVOCACION)[0];
  return base ? bnManejo(base) : soyGM;   // un token sin ficha: el GM
}

/* La Descarga que salta (2026-10-04, dueño): cuando a una víctima se le terminó de resolver, la descarga salta al enemigo más cercano (del
   mismo bando que la víctima) a `rango` casillas o menos, con la mitad del daño (para arriba), una sola vez por enemigo. Cada salto es un
   momento propio: todas las pantallas ven el rayo en el mapa y, después, a quien lo recibe le aparece el Anuncio para resistir la Parálisis. */
async function trampaSaltar(dt){
  const c = dt.cadena, n = Math.ceil(num(dt.danoTirado) / 2), de = tokens.get(dt.tokenId);
  if(!c || n < 1 || !de) return;
  const golpeados = new Set(c.golpeados || []), lado = x => x.tipo === 'creep' ? 'creep' : 'pj';
  const cand = [...tokens.entries()].filter(([id, x]) => !golpeados.has(id) && x.fichaId && !x.oculto && lado(x) === lado(de) && distanciaHex(x, de) <= (num(c.rango) || 3))
    .sort((a, b) => distanciaHex(a[1], de) - distanciaHex(b[1], de));
  if(!cand.length) return;
  const [hid, h] = cand[0], quien = nombreDe(h);
  const nd = {tokenId: hid, creep: h.tipo === 'creep', fichaId: String(h.fichaId || ''), quien, nombreT: dt.nombreT, pisador: false, salva: dt.salva || null,
    dano: '', danoFijo: n, ignoraDef: true, elemento: dt.elemento || '', pierdeSp: '', spec: dt.spec || '', muro: 0, muroLargo: 0, zona: 0, aMano: '',
    fase: '', tirando: false, evita: '', pasos: [], cadena: {rango: num(c.rango) || 3, golpeados: [...golpeados, hid]}, salto: {desde: dt.tokenId, hacia: hid}};
  nd.fase = nd.salva ? 'salva' : trampaFaseSiguiente(nd, 'salva');
  nd.lineas = trampaLineas(nd);
  await momentoAbrir({tipo: 'trampa', icono: '⚡', titulo: `La descarga salta a ${quien}`, estado: 'paso', datos: nd});
}
const efectosRayo = [], RAYO_FX_MS = 1900, saltosVistos = new Set(), trampaRetenidas = new Set();
function rayoSaltoEfecto(desdeId, haciaId){
  const a = tokens.get(desdeId), b = tokens.get(haciaId);
  if(!a || !b) return;
  efectosRayo.push({a: hexCentro(a.col, a.fila), b: hexCentro(b.col, b.fila), desde: Date.now()});
  pedirDibujo();
}
function dibujarEfectosRayo(){
  const ahora = Date.now();
  let activo = false;
  for(let i = efectosRayo.length - 1; i >= 0; i--){
    const fx = efectosRayo[i], edad = ahora - fx.desde;
    if(edad > RAYO_FX_MS){ efectosRayo.splice(i, 1); continue; }
    const k = Math.min(1, edad / 350), apagar = Math.min(1, (RAYO_FX_MS - edad) / 500);
    const bx = fx.a.x + (fx.b.x - fx.a.x) * k, by = fx.a.y + (fx.b.y - fx.a.y) * k;   // el rayo llega en un tercio de segundo
    const dx = bx - fx.a.x, dy = by - fx.a.y, largo = Math.hypot(dx, dy) || 1, nx = -dy / largo, ny = dx / largo;
    ctx.save();
    [[9, `rgba(255,230,90,${0.35 * apagar})`], [3.5, `rgba(255,250,210,${apagar})`]].forEach(([ancho, color]) => {
      ctx.beginPath(); ctx.moveTo(fx.a.x, fx.a.y);
      const tramos = 9;
      for(let s = 1; s < tramos; s++){ const f = s / tramos, desvio = (Math.random() - 0.5) * HEX * 0.6; ctx.lineTo(fx.a.x + dx * f + nx * desvio, fx.a.y + dy * f + ny * desvio); }
      ctx.lineTo(bx, by); ctx.strokeStyle = color; ctx.lineWidth = ancho / vista.zoom; ctx.lineJoin = 'round'; ctx.stroke();
    });
    if(k >= 1){   // el que recibe: un anillo que late
      const fase = ((edad - 350) / 600) % 1;
      ctx.beginPath(); ctx.arc(fx.b.x, fx.b.y, HEX * (0.6 + 0.9 * fase), 0, 2 * Math.PI);
      ctx.strokeStyle = `rgba(255,230,90,${(1 - fase) * apagar})`; ctx.lineWidth = 4 / vista.zoom; ctx.stroke();
    }
    ctx.restore();
    activo = true;
  }
  return activo;
}

// Lo llama momentoRecibido (js/16) con cada cambio de un momento de trampa.
function trampaMomento(id, d){
  const dt = d.datos || {};
  // Un salto de la Descarga: primero se ve el rayo en todas las pantallas y recién después aparece el Anuncio.
  if(dt.salto && !saltosVistos.has(id)){
    saltosVistos.add(id);
    rayoSaltoEfecto(dt.salto.desde, dt.salto.hacia);
    if(d.estado !== 'listo' && trampaMeToca(id, dt)){
      trampaRetenidas.add(id); trampasDatos.set(id, d);
      setTimeout(() => { trampaRetenidas.delete(id); trampaMomento(id, trampasDatos.get(id) || d); }, 1500);
      return;
    }
  }
  if(trampaRetenidas.has(id)){ trampasDatos.set(id, d); return; }
  if(trampaMeToca(id, dt) && !trampasCerradas.has(id)){
    trampasDatos.set(id, d);
    if(momentosFeed.delete(id)) renderMomentosFeed();
    if(trampaEnPantalla === id) trampaDibujar(id);
    else{ if(!trampaCola.includes(id)) trampaCola.push(id); trampaMostrarSiguiente(); }
    return;
  }
  if(trampasCerradas.has(id) && trampasDatos.has(id)) trampasDatos.set(id, d);
  if(trampasCerradas.has(id) && d.estado === 'listo' && trampaMeToca(id, dt)){ momentosFeed.delete(id); renderMomentosFeed(); return; }   // ya lo vio
  const ya = momentosFeed.get(id);
  momentosFeed.set(id, {d, hasta: Date.now() + (d.estado === 'listo' ? MOMENTO_DURA_MS : TRAMPA_PENDIENTE_MS), orden: ya ? ya.orden : ++momentosOrden});
  renderMomentosFeed();
}

function trampaMostrarSiguiente(){
  if(trampaEnPantalla && AvisoCombate.abiertoClave() === 'trampa:' + trampaEnPantalla) return;   // hay una a la vista: espera su turno
  trampaEnPantalla = null;
  while(trampaCola.length){
    const id = trampaCola.shift();
    if(!trampasDatos.has(id) || trampasCerradas.has(id)) continue;
    trampaEnPantalla = id;
    trampaDibujar(id);
    return;
  }
}

function trampaDibujar(id){
  const d = trampasDatos.get(id);
  if(!d) return;
  const dt = d.datos || {}, listo = d.estado === 'listo';
  const falta = listo ? null : trampaPasoQueFalta(dt);
  const rodando = trampaTirandoAca === id;
  const pasos = [...(dt.pasos || [])];
  let botones = [];
  if(falta){
    pasos.push({titulo: falta.titulo, texto: rodando ? '🎲 Rodando…' : dt.tirando ? 'Se está tirando en otra pantalla…' : falta.texto, espera: true});
    if(falta.boton){
      const x = tokens.get(dt.tokenId);
      const f = dt.fase === 'salva' && x ? formulaParaValor(trampaValorStat(x, dt.salva.stat)) : null;
      botones = [{texto: rodando ? '🎲 Rodando…' : falta.boton + (f ? ` (${f.formula})` : ''), deshabilitado: rodando || dt.tirando, alClic: () => trampaTirar(id)}];
    }else botones = [{texto: 'Aplicando…', deshabilitado: true}];
  }
  AvisoCombate.mostrar({clave: 'trampa:' + id, icono: d.icono || '🪤', titulo: d.titulo || '', pasos,
    veredicto: listo ? dt.veredicto : null, botones,   // lo que va a mano ya tuvo su paso propio
    alCerrar: () => {
      if(trampaEnPantalla !== id) return;
      trampaEnPantalla = null;
      trampasCerradas.add(id);
      const dd = trampasDatos.get(id);
      if(dd && dd.estado !== 'listo'){ momentosFeed.set(id, {d: dd, hasta: Date.now() + TRAMPA_PENDIENTE_MS, orden: ++momentosOrden}); renderMomentosFeed(); }
      setTimeout(trampaMostrarSiguiente, 0);
    }});
}

// El botón de la tarjeta de la Crónica: quien la resuelve y la cerró («🪤 Seguir») o el GM por alguien que no está («🎲 Tirar por él»).
function trampaBotonFeed(id, d){
  if(d.estado === 'listo') return '';
  const dt = d.datos || {};
  const texto = trampaMeToca(id, dt) ? '🪤 Seguir' : soyGM ? '🎲 Tirar por él' : '';
  return texto ? `<div style="margin-top:6px"><button type="button" data-trampa-seguir="${esc(id)}" style="font-size:12px;padding:3px 10px;border-radius:6px;border:1px solid #c98545;background:#2a2016;color:#f0c890;cursor:pointer">${texto}</button></div>` : '';
}
function trampaSeguir(id){
  const v = momentosFeed.get(id);
  const d = trampasDatos.get(id) || (v && v.d);
  if(!d) return;
  trampasTomadas.add(id);
  trampasCerradas.delete(id);
  trampasDatos.set(id, d);
  momentosFeed.delete(id); renderMomentosFeed();
  if(trampaEnPantalla && trampaEnPantalla !== id && !trampaCola.includes(trampaEnPantalla)) trampaCola.unshift(trampaEnPantalla);   // la que se veía vuelve a la fila
  trampaEnPantalla = id;
  trampaDibujar(id);
}

// Toma el paso (que otra pantalla no lo esté tirando) → los datos, o null.
async function trampaTomar(id, fase){
  const ref = coleccionMomentos().doc(id);
  try{
    return await fbDb.runTransaction(async tx => {
      const s = await tx.get(ref);
      if(!s.exists) return null;
      const dt = s.data().datos || {};
      if(s.data().estado === 'listo' || dt.fase !== fase || dt.tirando) return null;
      tx.update(ref, {'datos.tirando': true});
      return dt;
    });
  }catch(err){ console.error('No se pudo tomar el paso de la trampa:', err); return null; }
}
async function trampaGuardar(id, dt){
  if(dt.fase === 'fin'){
    const f = trampaFinal(dt);
    await momentoActualizar(id, {estado: 'listo', resultado: f.resultado, datos: f.datos});
    if(f.datos.pasos.length) alertaRojaAnonima(`🪤 ${dt.nombreT}`, `${dt.quien}: ${f.resultado}`);
    if(dt.cadena) await trampaSaltar(f.datos).catch(err => console.error('No se pudo hacer saltar la descarga:', err));
    return;
  }
  await momentoActualizar(id, {datos: {...dt, tirando: false, lineas: trampaLineas(dt)}});
}

async function trampaTirar(id){
  if(trampaTirandoAca) return;
  const d = trampasDatos.get(id);
  const fase = d && d.datos && d.datos.fase;
  if(!['salva', 'dano', 'empuje', 'sp', ...TRAMPA_INFO].includes(fase)) return;
  const dt = await trampaTomar(id, fase);
  if(!dt){ toast('Ese paso ya se está tirando en otra pantalla'); return; }
  trampaTirandoAca = id;
  trampaDibujar(id);
  try{
    if(fase === 'salva') await trampaPasoSalva(id, dt);
    else if(fase === 'empuje') await trampaPasoEmpuje(id, dt);
    else if(fase === 'sp') await trampaPasoSp(id, dt);
    else if(fase === 'estado') await trampaPasoEstado(id, dt);
    else if(TRAMPA_INFO.includes(fase)) await trampaPasoInfo(id, dt);
    else await trampaPasoDano(id, dt);
  }catch(err){
    console.error('No se pudo resolver el paso de la trampa:', err);
    toast('No se pudo resolver ese paso de la trampa');
    await momentoActualizar(id, {'datos.tirando': false});
  }finally{
    trampaTirandoAca = null;
    if(trampaEnPantalla === id) trampaDibujar(id);
  }
}

// 0 · Sale despedido (el muro salió donde estaba parado): tira 1d6 y se mueve a esa vecina (o la siguiente libre).
async function trampaPasoEmpuje(id, dt){
  const e = dt.empuje, r = tirarDados('1d6');
  try{ await mesaPublicar(`Adónde sale despedido (${dt.nombreT})`, {formula: r.formula, rolls: r.rolls, mod: r.mod, total: r.total, quien: dt.quien, ...(dt.creep ? {desde: 'gm'} : {})}); }catch(err){}
  await trampaEsperarDados();
  const v = trampaVecinaLibre(e.col, e.fila, e.frente, new Set(e.prohibidas || []), r.total - 1);
  let texto;
  if(v){
    try{
      await coleccionTokens().doc(dt.tokenId).update({col: v.col, fila: v.fila, ruta: firebase.firestore.FieldValue.delete()});
      texto = `1d6 = ${r.total} → sale despedido a la casilla ${v.k ? `${((r.total - 1 + v.k) % 6) + 1} (la ${r.total} estaba ocupada)` : r.total}`;
    }catch(err){ console.error('No se pudo mover el token despedido:', err); texto = `1d6 = ${r.total} → movelo a mano a la casilla ${r.total} (o la siguiente libre)`; }
  }else texto = `1d6 = ${r.total} → no queda lugar: movelo a mano`;
  const sig = {...dt, pasos: [...(dt.pasos || []), {titulo: 'Sale despedido', texto}]};
  sig.fase = trampaFaseSiguiente(sig, 'empuje');
  await trampaGuardar(id, sig);
}

// 1 · Para esquivarla: la víctima tira su stat; recién con los dados quietos se anuncia.
async function trampaPasoSalva(id, dt){
  const s = dt.salva, etq = trampaEtq(s), x = tokens.get(dt.tokenId);
  const estados = !x ? [] : x.tipo === 'creep' ? ((creepPrivadoDe(x.fichaId) || {}).estados || []) : (((fichasPub.get(String(x.fichaId).split(SEP_INVOCACION)[0]) || {}).resumen || {}).estados || []);
  const rd = x ? Combatiente.tirarStat(trampaValorStat(x, s.stat), estados, s.stat) : null;
  let ok = false, texto;
  if(rd){
    try{ await mesaPublicar(`${etq} (${dt.nombreT})`, {formula: rd.formula, rolls: rd.rolls, mod: rd.mod, total: rd.total, estados: rd.estados, quien: dt.quien,
      ...(rd.ventaja ? {ventaja: rd.ventaja} : {}), ...(dt.creep ? {desde: 'gm'} : {})}); }catch(err){}
    await trampaEsperarDados();
    ok = rd.total >= num(s.dif);   // llegar a la dificultad alcanza (como detectarla)
    const no = s.que === 'efecto' ? 'no lo resistió' : 'no la esquivó';
    texto = `${etq} ${rd.total} contra ${s.dif} → ${!ok ? no : s.logra ? (s.que === 'efecto' ? `lo resistió: ${s.logra}` : s.logra) : s.que === 'mitad' ? 'recibe la mitad del daño' : s.que === 'efecto' ? '¡lo resistió!' : '¡la esquivó!'}`;
  }else texto = `${etq}: no tiene ese número cargado → ${s.que === 'efecto' ? 'no lo resistió' : 'no la esquivó'} (si correspondía, ajustalo a mano)`;
  const sig = {...dt, evita: ok ? (s.que || 'todo') : '', pasos: [...(dt.pasos || []), {titulo: trampaTituloSalva(s), texto}]};
  sig.fase = trampaFaseSiguiente(sig, 'salva');
  await trampaGuardar(id, sig);
}

// 2 · Daño: la víctima tira los dados de la trampa; se aplica y se anuncia (sin la vida que le queda: la de un creep es privada).
async function trampaPasoDano(id, dt){
  // Un salto de la Descarga trae su daño ya fijo (la mitad del anterior): no se tira.
  const r = dt.danoFijo ? {formula: String(dt.danoFijo), total: num(dt.danoFijo), rolls: [], mod: 0} : tirarDados(dt.dano);
  if(!r) throw new Error('Fórmula de daño inválida: ' + dt.dano);
  if(!dt.danoFijo){
    try{ await mesaPublicar(`Daño a ${dt.quien}`, {formula: r.formula, rolls: r.rolls, mod: r.mod, total: r.total, quien: `🪤 ${dt.nombreT}`}); }catch(err){}
    await trampaEsperarDados();
  }
  const monto = dt.evita === 'mitad' ? Math.floor(r.total / 2) : r.total;
  const x = tokens.get(dt.tokenId);
  let res = null, freno = '';
  if(monto > 0 && x && x.fichaId){
    try{
      // Daño de un elemento (2026-10-04): resta la resistencia a ese elemento y, como es daño mágico, la Armadura mágica.
      const rr = dt.elemento ? await resistenciasDe(x, dt.elemento) : {res: 0, armadmg: 0};
      const arm = dt.elemento && dt.ignoraDef ? rr.armadmg : 0;
      freno = [...(arm ? [`Armadura mágica ${arm}`] : []), ...(rr.res ? [`${Combatiente.ELEMENTOS[dt.elemento].etq} ${rr.res}`] : [])].join(' − ');
      if(x.tipo === 'creep'){ if(soyGM) res = await danioCreep(x, String(monto), dt.ignoraDef, arm, rr.res); }
      else res = await (String(x.fichaId).includes(SEP_INVOCACION) ? danioInv : danioPj)(x, String(monto), dt.ignoraDef, arm, rr.res);
    }catch(err){ console.error('No se pudo aplicar el daño de la trampa:', err); }
  }
  let texto = dt.danoFijo ? `${r.total} de descarga` : `${r.formula} = ${r.total}${dt.evita === 'mitad' ? ` → la mitad: ${monto}` : ''}`;
  if(monto <= 0) texto += ' → sin daño';
  else if(res){
    const g = res.r;
    texto += g.invulnerable ? ' → Invulnerable: no le hizo nada'
      : (dt.ignoraDef ? `${freno ? ` − ${freno}` : ''} → ${fmt(g.recibido)} de daño directo a la vida` : ` − Defensa ${fmt(g.defensa - (freno ? num(freno.split(' ').pop()) : 0))}${freno ? ` − ${freno}` : ''} → ${fmt(g.recibido)} de daño`) + (g.absorbido ? ` (el escudo absorbió ${fmt(g.absorbido)})` : '');
  }else texto += ` → ${monto} de daño${dt.ignoraDef ? ' directo a la vida' : ' menos su Defensa'} — aplicalo a mano`;
  const sig = {...dt, danoTirado: r.total, pasos: [...(dt.pasos || []), {titulo: dt.danoFijo ? 'Le llega la descarga' : 'Daño', texto}]};
  sig.fase = trampaFaseSiguiente(sig, 'dano');
  await trampaGuardar(id, sig);
}

// Le chupa el SP (2026-10-04, Succión arcana): tira cuánto y se lo saca a un personaje (las invocaciones y los creeps no tienen SP).
async function trampaPasoSp(id, dt){
  const r = tirarDados(dt.pierdeSp);
  if(!r) throw new Error('Fórmula de SP inválida: ' + dt.pierdeSp);
  try{ await mesaPublicar(`SP que pierde ${dt.quien}`, {formula: r.formula, rolls: r.rolls, mod: r.mod, total: r.total, quien: `🪤 ${dt.nombreT}`}); }catch(err){}
  await trampaEsperarDados();
  const x = tokens.get(dt.tokenId);
  let texto = `${r.formula} = ${r.total}`;
  if(x && x.tipo === 'pj' && x.fichaId && !String(x.fichaId).includes(SEP_INVOCACION) && x.duenoUid){
    try{ await EstadosAplicar.encolarPj({fichaId: x.fichaId, duenoUid: x.duenoUid, spec: {nombre: 'Pierde SP', stacks: r.total}, origen: dt.nombreT}); texto += ` → pierde ${r.total} de SP`; }
    catch(err){ console.error('No se pudo sacar el SP:', err); texto += ` → pierde ${r.total} de SP (aplicalo a mano)`; }
  }else texto += ' → no tiene SP: no le hace nada';
  const sig = {...dt, pasos: [...(dt.pasos || []), {titulo: 'Le chupa el SP', texto}]};
  sig.fase = trampaFaseSiguiente(sig, 'sp');
  await trampaGuardar(id, sig);
}

// Lo que va a mano, el muro, la nube: solo se muestran, cada uno en su momento.
async function trampaPasoInfo(id, dt){
  const info = trampaTextoInfo(dt);
  const sig = {...dt, pasos: [...(dt.pasos || []), info]};
  sig.fase = trampaFaseSiguiente(sig, dt.fase);
  await trampaGuardar(id, sig);
}

// 3 · Lo que le deja: sin tirada (a un creep directo; a un personaje o invocación, por comun/recibidos.js) y dice cómo soltarse.
async function trampaPasoEstado(id, dt){
  const spec = trampaSpec(dt), x = tokens.get(dt.tokenId);
  let que = ' — aplicalo a mano', inmune = '';
  try{
    if(spec && x && x.tipo === 'creep' && x.fichaId && soyGM){
      await modificarCreep(x.fichaId, sc => { const r = EstadosAplicar.aplicarACreep(sc, spec); if(!r.ok) inmune = r.motivo || 'inmune'; });
      que = inmune ? ` — no le hace nada (${inmune})` : '';
    }else if(spec && x && x.tipo === 'pj' && x.fichaId && x.duenoUid){
      await EstadosAplicar.encolarPj({fichaId: x.fichaId, duenoUid: x.duenoUid, spec, origen: dt.nombreT});
      que = '';
    }
  }catch(err){ console.error('No se pudo aplicar el estado de la trampa:', err); }
  let texto = `${spec ? EstadosAplicar.texto(spec) : 'un estado'}${que}`;
  const suelta = spec && !inmune ? Combatiente.textoSoltarse(spec) : '';
  if(suelta) texto += ` · Para salir, ${dt.creep ? 'en sus Acciones' : 'en la Botonera'}: ${suelta}`;
  const sig = {...dt, pasos: [...(dt.pasos || []), {titulo: 'Lo que le deja', texto}]};
  sig.fase = trampaFaseSiguiente(sig, 'estado');
  await trampaGuardar(id, sig);
}
