// js/19-trampa-paso-a-paso.js — caer en una trampa, paso a paso (2026-10-04, pedido del dueño: «con su momento para cada tirada y su anuncio
// de cada resultado»; «que lo tire la víctima»). Va después del arranque: solo define funciones.
/* Al dispararse una trampa, la pantalla de quien movió crea un momento por afectado (js/08, trampaAplicarEfectos → trampaMomentoNuevo):
   tipo 'trampa', con lo que hace la trampa en `datos` y en qué paso va (`datos.fase`). Lo resuelve la pantalla de quien maneja a la víctima
   (su dueño, el GM con 🎮 el control, el GM para un creep), en el cuadro con la estética del duelo (AvisoCombate.mostrar, con clave):
     1 «Para esquivarla» (si tiene salvación): «🎲 Tirar Evasión»; los dados ruedan y recién quietos se anuncia el resultado;
     2 «Daño»: «🎲 Tirar el daño»; los dados de la trampa ruedan y se anuncia cuánto pega; después «💔 Aplicar el daño» (2026-10-17, dueño:
       «que el aplicar daño involucre por lo menos un clic por parte del jugador para que se entere») lo descuenta solo y dice cuánto entró
       (Defensa, escudo, Invulnerable) y cómo quedó la vida;
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
// Qué se resiste (dueño, 2026-10-04, norma general: «antes de tirar, el usuario tiene que ver claramente qué está tirando para resistir»).
function trampaQueSeResiste(dt){
  const sp = trampaSpec(dt), cosas = [];
  if(sp && sp.nombre) cosas.push(sp.nombre);
  if(dt.pierdeSp) cosas.push('perder SP');
  if(dt.portal) cosas.push('el portal');
  return cosas.join(' y ') || 'lo que deja';
}
const trampaTituloSalva = (s, dt) => s.que === 'efecto' ? `Para resistir: ${dt ? trampaQueSeResiste(dt) : 'el efecto'}` : s.que === 'mitad' ? 'Para recibir la mitad del daño' : 'Para esquivarla';
// El orden (dueño, 2026-10-04): si la tirada resiste solo el efecto, primero se anuncia el daño (que entra seguro) y después se tira para
// resistir lo que deja. Si la tirada esquiva la trampa o la mitad del daño, va antes.
const trampaDanoPrimero = dt => !!(dt.requiereDano || (dt.salva && dt.salva.que === 'efecto' && (dt.dano || dt.danoFijo)));
// (Reflejos de mangosta ya no va acá: se juega ANTES de que la trampa se dispare, js/23 — 2026-10-06, P164.)
const trampaFaseInicial = dt => trampaDanoPrimero(dt) ? trampaFaseSiguiente(dt, 'empuje') : dt.salva ? 'salva' : trampaFaseSiguiente(dt, 'salva');
function trampaLogra(dt){
  const s = dt.salva;
  if(s.logra) return s.logra;
  return s.que === 'mitad' ? 'recibe la mitad del daño' : s.que === 'efecto' ? (dt.dano ? 'resiste lo que le deja (el daño entra igual)' : 'lo resiste') : 'la esquiva';
}
// El paso que sigue después de `fase`, según lo que tiene la trampa y lo que ya esquivó.
// Cada efecto tiene su momento en el Anuncio (dueño, 2026-10-04): lo que le deja, lo que va a mano, el muro y la nube son pasos propios,
// con «▶ Seguir» (sin tirada).
function trampaFaseSiguiente(dt, fase){
  // El Dardo (requiereDano, 2026-10-04): primero el daño; si no pasa la Defensa, lo que deja no entra (ni se tira para resistirlo).
  const orden = trampaDanoPrimero(dt) ? ['empuje', 'dano', 'salva', 'sp', 'portal', 'estado', 'mano', 'muro', 'zona', 'fin'] : ['empuje', 'salva', 'dano', 'sp', 'portal', 'estado', 'mano', 'muro', 'zona', 'fin'];
  const agarro = dt.evita !== 'todo' && dt.evita !== 'efecto';
  for(const f of orden.slice(orden.indexOf(fase) + 1)){
    if(f === 'salva' && dt.salva && agarro) return f;
    if(f === 'dano' && (dt.dano || dt.danoFijo) && dt.evita !== 'todo') return f;
    if(f === 'sp' && dt.pierdeSp && agarro) return f;
    if(f === 'portal' && dt.portal && agarro) return num(dt.inamovible) > 0 && !dt.firmePortal ? 'firme-portal' : f;   // Inamovible (pies): primero su chance
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
  // La chance de Inamovible (pies, 2026-10-04): que el muro o el portal no lo muevan.
  if(dt.fase === 'firme-empuje' || dt.fase === 'firme-portal'){
    const pct = dt.inamovible, siempre = num(pct) >= 100;
    const que = dt.fase === 'firme-portal' ? 'el portal no se lo lleva' : 'no sale despedido';
    const d = Combatiente.chanceDado(pct), necesita = d ? d.caras - d.exitos + 1 : 0;
    return {titulo: 'Inamovible',
      texto: siempre ? `Inamovible (siempre): ${que}.` : `Inamovible ${Combatiente.chanceTexto(pct)}: con ${necesita} o más en 1d${d ? d.caras : 6}, ${que}.`,
      boton: siempre ? '▶ Seguir' : `🎲 Tirar Inamovible (1d${d ? d.caras : 6})`, espera: `${dt.quien} tira Inamovible…`};
  }
  if(dt.fase === 'empuje') return {titulo: 'Sale despedido', texto: 'El muro sale justo donde está parado: tira 1d6 para ver a qué casilla vecina sale despedido (las 6 vecinas en ronda, la 1 hacia el frente del muro; si le toca una ocupada, la siguiente libre). Después, 1d6 de daño directo.',
    boton: '🎲 Tirar adónde sale (1d6)', espera: `${dt.quien} tira adónde sale despedido…`};
  if(dt.fase === 'salva' && dt.salva){
    const s = dt.salva, etq = trampaEtq(s);
    const efecto = s.que === 'efecto', que = trampaQueSeResiste(dt), sp = trampaSpec(dt);
    const queLargo = efecto && sp && sp.nombre ? que.replace(sp.nombre, EstadosAplicar.texto(sp)) : que;   // «Parálisis (2 turnos)»
    return {titulo: trampaTituloSalva(s, dt),
      texto: efecto ? `Tira ${etq} para resistir ${queLargo}. Contra ${s.dif}: con ${s.dif} o más, ${trampaLogra(dt)}.` : `${etq} contra ${s.dif}: con ${s.dif} o más, ${trampaLogra(dt)}.`,
      boton: efecto ? `🎲 Tirar ${etq} para resistir ${que}` : `🎲 Tirar ${etq}`, espera: `${dt.quien} tira ${etq}${efecto ? ` para resistir ${que}` : ''}…`};
  }
  if(dt.fase === 'dano' && dt.danoFijo) return {titulo: 'Le llega la descarga', texto: `${dt.danoFijo} de daño${dt.elemento ? ' ' + Combatiente.ELEMENTOS[dt.elemento].icono : ''}, directo a la vida (la mitad del salto anterior; lo frenan ${dt.elemento ? Combatiente.ELEMENTOS[dt.elemento].etq + (Combatiente.frenaArmaduraMagica(dt.elemento) ? ' y la Defensa especial' : '') : 'la Defensa especial'}).`,
    boton: '▶ Recibir la descarga', espera: `a ${dt.quien} le llega la descarga…`};
  if(dt.fase === 'dano-aplicar'){
    const freno = dt.ignoraDef ? 'directo a la vida' : 'menos su Defensa';
    const el = dt.elemento ? ` (lo ${Combatiente.frenaArmaduraMagica(dt.elemento) ? `frenan ${Combatiente.ELEMENTOS[dt.elemento].etq} y la Defensa especial` : `frena ${Combatiente.ELEMENTOS[dt.elemento].etq}`})` : '';
    return {titulo: 'Aplicar el daño', texto: `${fmt(num(dt.danoMonto))} de daño, ${freno}${el}. ⚙ Al tocar el botón se descuenta solo de la vida de ${dt.quien}.`,
      boton: `💔 Aplicar el daño (${fmt(num(dt.danoMonto))})`, espera: `${dt.quien} aplica el daño…`};
  }
  if(dt.fase === 'dano') return {titulo: 'Daño', texto: `La trampa pega ${dt.dano}${dt.elemento ? ' ' + Combatiente.ELEMENTOS[dt.elemento].icono : ''}${dt.evita === 'mitad' ? ' (la mitad)' : ''}${dt.ignoraDef ? ', directo a la vida' : ', menos la Defensa'}${dt.elemento ? ` (lo ${Combatiente.frenaArmaduraMagica(dt.elemento) ? `frenan ${Combatiente.ELEMENTOS[dt.elemento].etq} y la Defensa especial` : `frena ${Combatiente.ELEMENTOS[dt.elemento].etq}`})` : ''}.`,
    boton: `🎲 Tirar el daño (${dt.dano})`, espera: `${dt.quien} tira el daño…`};
  if(dt.fase === 'portal'){
    if(dt.portal && dt.portal.destino) return {titulo: 'El portal', texto: 'El portal se lo lleva a la casilla que marcó quien lo puso.', boton: '🌀 Atravesar el portal', espera: `${dt.quien} viaja por el portal…`};
    const elige = trampaEligePortal(dt), dueno = nombreMiembro(dt.duenoTrampa) || 'quien la puso';
    return {titulo: 'El portal', texto: elige ? `El portal se lo lleva: elegí en el mapa adónde lo mandás (hasta ${dt.portal.rango} casillas, una casilla libre).` : `El portal se lo lleva: ${dueno} elige adónde lo manda…`,
      boton: elige ? '🌀 Elegir adónde lo mandás' : null, espera: `${dueno} elige adónde manda a ${dt.quien}…`};
  }
  if(dt.fase === 'portal-mover') return {titulo: 'El portal', texto: 'Lo manda al lugar elegido…', boton: null, espera: `${dt.quien} viaja por el portal…`};
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
    dano: p.dano || '', ignoraDef: !!p.ignoraDef, elemento: p.elemento || '', altura: p.altura || 'piso', pierdeSp: p.pierdeSp || '',
    cadena: p.cadena && p.pisador ? {rango: num(p.cadena.rango) || 3, golpeados: [p.tokenId || '']} : null,
    celdas: Array.isArray(p.celdas) ? p.celdas.slice(0, 120) : [],
    portal: p.portal ? {rango: num(p.portal.rango) || 8, ...(p.portal.destino ? {destino: String(p.portal.destino)} : {})} : null, duenoTrampa: p.duenoTrampa || '', requiereDano: !!p.requiereDano, ...(num(p.perfora) > 0 ? {perfora: num(p.perfora)} : {}), ...(p.adelante ? {adelante: p.adelante} : {}), spec: p.specJson || '', muro: num(p.muro), muroLargo: num(p.muroLargo), zona: num(p.zona), aMano: p.aMano || '',
    fase: '', tirando: false, evita: '', pasos: [],
    ...(p.explota ? {explota: p.explota} : {}),   // 💥 (2026-10-17)
  };
  // Los pies de la víctima (2026-10-04, js/21): Inamovible (para el portal). Reflejos de mangosta ya se jugó antes del disparo (js/23).
  const vic = tokens.get(p.tokenId);
  if(vic){ const im = chanceDe(vic, 'inamovible'); if(im) dt.inamovible = im; }
  dt.fase = trampaFaseInicial(dt);
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
  const im = chanceDe(x, 'inamovible');   // Inamovible (pies, js/21): primero su chance de que el muro no lo despida
  if(im){ dt.inamovible = im; dt.fase = 'firme-empuje'; }
  dt.lineas = trampaLineas(dt);
  return momentoAbrir({tipo: 'trampa', icono: '🧱', titulo: `${quien}: el muro sale debajo de sus pies`, estado: 'paso', datos: dt});
}

// El destino del portal lo elige quien puso la trampa (o el GM, si quien la puso no está).
const trampaEligePortal = dt => !(dt.portal && dt.portal.destino) && !!fbUsuario && (dt.duenoTrampa === fbUsuario.uid || (soyGM && !miembros.has(dt.duenoTrampa)));
// ¿Esta pantalla resuelve a esta víctima?
function trampaMeToca(id, dt){
  if(trampasTomadas.has(id)) return true;
  if(dt.fase === 'portal' && trampaEligePortal(dt)) return true;
  if(dt.creep) return soyGM;
  const base = String(dt.fichaId || '').split(SEP_INVOCACION)[0];
  return base ? bnManejo(base) : soyGM;   // un token sin ficha: el GM
}

/* La Descarga que salta (2026-10-04, dueño): cuando a una víctima se le terminó de resolver, la descarga salta al enemigo más cercano (del
   mismo bando que la víctima) a `rango` casillas o menos (4 desde el 2026-10-13), con la mitad del daño QUE LE ENTRÓ (para abajo, dueño 2026-10-07 y 2026-10-13: con 1 ya no salta), una sola vez por enemigo. Cada salto es un
   momento propio: todas las pantallas ven el rayo en el mapa y, después, a quien lo recibe le aparece el Anuncio para resistir la Parálisis. */
async function trampaSaltar(dt){
  const c = dt.cadena, n = Math.floor(num(dt.danoEntro !== undefined ? dt.danoEntro : dt.danoTirado) / 2), de = tokens.get(dt.tokenId);
  if(!c || n < 1 || !de) return;
  const golpeados = new Set(c.golpeados || []), lado = x => x.tipo === 'creep' ? 'creep' : 'pj';
  const cand = [...tokens.entries()].filter(([id, x]) => !golpeados.has(id) && x.fichaId && !x.oculto && lado(x) === lado(de) && distanciaHex(x, de) <= (num(c.rango) || 4))
    .sort((a, b) => distanciaHex(a[1], de) - distanciaHex(b[1], de));
  if(!cand.length) return;
  const [hid, h] = cand[0], quien = nombreDe(h);
  const nd = {tokenId: hid, creep: h.tipo === 'creep', fichaId: String(h.fichaId || ''), quien, nombreT: dt.nombreT, pisador: false, salva: dt.salva || null,
    dano: '', danoFijo: n, ignoraDef: true, elemento: dt.elemento || '', pierdeSp: '', spec: dt.spec || '', muro: 0, muroLargo: 0, zona: 0, aMano: '',
    fase: '', tirando: false, evita: '', pasos: [], cadena: {rango: num(c.rango) || 4, golpeados: [...golpeados, hid]}, salto: {desde: dt.tokenId, hacia: hid}};
  nd.fase = trampaFaseInicial(nd);
  nd.lineas = trampaLineas(nd);
  await momentoAbrir({tipo: 'trampa', icono: '⚡', titulo: `La descarga salta a ${quien}`, estado: 'paso', datos: nd});
}
const efectosRayo = [], RAYO_FX_MS = 2900, saltosVistos = new Set(), trampaRetenidas = new Set();
// Los saltos que llegaron con otro Anuncio a la vista: su rayo se muestra recién cuando les toca (2026-10-04, probado con el dueño: si no, el
// rayo se dibujaba detrás de la ventana abierta y no se veía).
const rayoPendientes = new Set();
function trampaRetenerConRayo(id){
  const d = trampasDatos.get(id), s = d && d.datos && d.datos.salto;
  if(s) rayoSaltoEfecto(s.desde, s.hacia);
  trampaRetenidas.add(id);
  setTimeout(() => { trampaRetenidas.delete(id); trampaMomento(id, trampasDatos.get(id) || d); }, 2500);   // 2,5 s para ver el rayo (dueño, 2026-10-04)
}
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

/* 💥 Una trampa que explota (2026-10-17, dueño: «al pisar la trampa se congele el mapa, durante un segundo y medio haya una animación de
   explosión y ahí aparezca el anuncio»): la primera vez que una pantalla ve el disparo (una clave por disparo, aunque agarre a varios), dibuja la
   explosión sobre sus casillas y deja el mapa quieto EXPLOSION_MS (un velo transparente que no deja tocar nada); el Anuncio de quien la resuelve
   espera a que termine (trampaRetenidas, como el rayo de la Descarga). */
const EXPLOSION_MS = 1500, efectosExplosion = [], explosionesVistas = new Map();   // clave → cuándo empezó
function explosionEmpezar(ex){
  if(!ex || !ex.clave) return 0;
  if(!explosionesVistas.has(ex.clave)){
    explosionesVistas.set(ex.clave, Date.now());
    const cs = [];
    for(let i = 0; i + 1 < (ex.celdas || []).length; i += 2) cs.push(hexCentro(num(ex.celdas[i]), num(ex.celdas[i + 1])));
    if(cs.length){
      const cx = cs.reduce((a, p) => a + p.x, 0) / cs.length, cy = cs.reduce((a, p) => a + p.y, 0) / cs.length;
      const r = Math.max(HEX, ...cs.map(p => Math.hypot(p.x - cx, p.y - cy) + HEX));
      efectosExplosion.push({cs, cx, cy, r, desde: Date.now(), luz: ex.tono === 'luz', chispas: Array.from({length: 26}, () => ({ang: Math.random() * 2 * Math.PI, vel: 0.5 + Math.random() * 0.8}))});
      pedirDibujo();
    }
    explosionCongelar(EXPLOSION_MS);
  }
  return Math.max(0, explosionesVistas.get(ex.clave) + EXPLOSION_MS - Date.now());
}
function explosionCongelar(ms){
  let v = document.getElementById('explosion-congela');
  if(!v){ v = document.createElement('div'); v.id = 'explosion-congela'; v.style.cssText = 'position:fixed;inset:0;z-index:99990;cursor:wait;background:transparent'; document.body.appendChild(v); }
  clearTimeout(v._t);
  v.hidden = false;
  if(typeof soltar === 'function') try{ soltar(); }catch(e){}   // si estaba arrastrando un token, lo suelta
  v._t = setTimeout(() => { v.hidden = true; }, ms);
}
function dibujarEfectosExplosion(){
  const ahora = Date.now();
  let activo = false;
  for(let i = efectosExplosion.length - 1; i >= 0; i--){
    const fx = efectosExplosion[i], edad = ahora - fx.desde;
    if(edad > EXPLOSION_MS){ efectosExplosion.splice(i, 1); continue; }
    const t = edad / EXPLOSION_MS, apagar = t < 0.6 ? 1 : Math.max(0, 1 - (t - 0.6) / 0.4);
    ctx.save();
    // Las casillas: un fogonazo blanco-amarillo que pasa a naranja y se apaga.
    // ☀ El destello (fx.luz, 2026-10-26): blanco que pasa a dorado claro y se apaga, sin el naranja del fuego.
    const col = fx.luz ? (t < 0.2 ? `rgba(255,255,245,${0.95 * apagar})` : `rgba(255,238,160,${(0.75 - 0.4 * t) * apagar})`)
      : t < 0.15 ? `rgba(255,248,210,${0.85 * apagar})` : t < 0.45 ? `rgba(255,170,40,${0.7 * apagar})` : `rgba(200,60,20,${0.55 * apagar})`;
    fx.cs.forEach(p => { ctx.beginPath(); trazarHex(p.x, p.y); ctx.fillStyle = col; ctx.fill(); });
    // La onda: dos anillos que se agrandan desde el centro.
    [[0, 9], [0.18, 5]].forEach(([retraso, ancho]) => {
      const u = Math.max(0, Math.min(1, (t - retraso) / 0.55));
      if(u <= 0 || u >= 1) return;
      ctx.beginPath(); ctx.arc(fx.cx, fx.cy, fx.r * (0.2 + 1.1 * u), 0, 2 * Math.PI);
      ctx.strokeStyle = fx.luz ? `rgba(255,250,${Math.round(220 - 60 * u)},${(1 - u) * apagar})` : `rgba(255,${Math.round(220 - 120 * u)},60,${(1 - u) * apagar})`; ctx.lineWidth = ancho / vista.zoom; ctx.stroke();
    });
    // Las chispas: salen disparadas y se apagan.
    fx.chispas.forEach(c => {
      const d = fx.r * c.vel * Math.min(1, t * 1.6), x = fx.cx + Math.cos(c.ang) * d, y = fx.cy + Math.sin(c.ang) * d;
      ctx.beginPath(); ctx.arc(x, y, (3 + 3 * (1 - t)) / vista.zoom, 0, 2 * Math.PI); ctx.fillStyle = fx.luz ? `rgba(255,252,${Math.round(230 - 80 * t)},${apagar})` : `rgba(255,${Math.round(200 - 100 * t)},70,${apagar})`; ctx.fill();
    });
    ctx.restore();
    activo = true;
  }
  return activo;
}

// Lo llama momentoRecibido (js/16) con cada cambio de un momento de trampa.
function trampaMomento(id, d){
  const dt = d.datos || {};
  // 💥 Explota: primero la explosión en el mapa (todas las pantallas); el Anuncio de quien la resuelve, cuando termina.
  if(dt.explota && d.estado !== 'listo'){
    const resta = explosionEmpezar(dt.explota);
    if(resta > 0 && trampaMeToca(id, dt) && !trampaRetenidas.has(id)){
      trampasDatos.set(id, d); trampaRetenidas.add(id);
      setTimeout(() => { trampaRetenidas.delete(id); trampaMomento(id, trampasDatos.get(id) || d); }, resta + 50);
      return;
    }
  }
  // El portal: cuando se eligió el destino, todas las pantallas ven los pulsos (una vez).
  if(dt.destino && dt.destino.desde && !saltosVistos.has(id + ':portal')){
    saltosVistos.add(id + ':portal');
    efectosTeleport.push({a: hexCentro(dt.destino.desde.col, dt.destino.desde.fila), b: hexCentro(dt.destino.col, dt.destino.fila), desde: Date.now()});
    pedirDibujo();
  }
  // Un salto de la Descarga: primero se ve el rayo en todas las pantallas y recién después aparece el Anuncio.
  if(dt.salto && !saltosVistos.has(id)){
    saltosVistos.add(id);
    const mia = d.estado !== 'listo' && trampaMeToca(id, dt);
    const ocupada = trampaEnPantalla && trampaEnPantalla !== id && AvisoCombate.abiertoClave() === 'trampa:' + trampaEnPantalla;
    if(mia && ocupada) rayoPendientes.add(id);   // espera en la fila; el rayo, cuando le toque (trampaMostrarSiguiente)
    else{
      if(mia){ trampasDatos.set(id, d); trampaRetenerConRayo(id); return; }
      rayoSaltoEfecto(dt.salto.desde, dt.salto.hacia);
    }
  }
  if(trampaRetenidas.has(id)){ trampasDatos.set(id, d); return; }
  if(trampaEnPantalla === id){ trampasDatos.set(id, d); trampaDibujar(id); if(d.estado !== 'listo' && dt.fase === 'portal-mover' && !dt.tirando) trampaPasoPortalMover(id); return; }
  if(trampaMeToca(id, dt) && !trampasCerradas.has(id)){
    trampasDatos.set(id, d);
    if(momentosFeed.delete(id)) renderMomentosFeed();
    if(trampaEnPantalla === id) trampaDibujar(id);
    else{ if(!trampaCola.includes(id)) trampaCola.push(id); trampaMostrarSiguiente(); }
    if(d.estado !== 'listo' && dt.fase === 'portal-mover' && !dt.tirando) trampaPasoPortalMover(id);   // lo mueve quien maneja a la víctima
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
    if(rayoPendientes.delete(id)){ trampaRetenerConRayo(id); return; }   // primero el rayo en el mapa; el Anuncio, 1,5 s después
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
    if(falta.boton && trampaMeToca(id, dt)){   // en otra pantalla (quien eligió el portal) se ve, sin botón
      const x = tokens.get(dt.tokenId);
      const f = dt.fase === 'salva' && x ? formulaParaValor(trampaValorStat(x, dt.salva.stat)) : null;
      botones = [{texto: rodando ? '🎲 Rodando…' : falta.boton + (f ? ` (${f.formula})` : ''), deshabilitado: rodando || dt.tirando, alClic: () => trampaTirar(id)}];
    }else botones = [{texto: dt.fase === 'portal' ? 'Esperando…' : 'Aplicando…', deshabilitado: true}];
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
  if(fase === 'portal'){ trampaPasoPortal(id); return; }
  if(!['salva', 'dano', 'dano-aplicar', 'empuje', 'sp', 'firme-empuje', 'firme-portal', ...TRAMPA_INFO].includes(fase)) return;
  const dt = await trampaTomar(id, fase);
  if(!dt){ toast('Ese paso ya se está tirando en otra pantalla'); return; }
  trampaTirandoAca = id;
  trampaDibujar(id);
  try{
    if(fase === 'firme-empuje' || fase === 'firme-portal') await trampaPasoChance(id, dt, fase);
    else if(fase === 'salva') await trampaPasoSalva(id, dt);
    else if(fase === 'empuje') await trampaPasoEmpuje(id, dt);
    else if(fase === 'sp') await trampaPasoSp(id, dt);
    else if(fase === 'estado') await trampaPasoEstado(id, dt);
    else if(TRAMPA_INFO.includes(fase)) await trampaPasoInfo(id, dt);
    else if(fase === 'dano-aplicar') await trampaPasoDanoAplicar(id, dt);
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

// La chance de Inamovible (pies, 2026-10-04): si sale, no lo mueve (ni el muro ni el portal). Con 100 % sale siempre, sin tirar.
async function trampaPasoChance(id, dt, fase){
  const pct = Combatiente.chancePct(dt.inamovible), d = Combatiente.chanceDado(pct);
  const mec = 'Inamovible';
  let ok = pct >= 100, texto = `${mec} (siempre)`;
  if(d){
    const r = tirarDados('1d' + d.caras);
    try{ await mesaPublicar(`${mec} · ${Combatiente.chanceTexto(pct)} (${dt.nombreT})`, {formula: r.formula, rolls: r.rolls, mod: r.mod, total: r.total, quien: dt.quien, ...(dt.creep ? {desde: 'gm'} : {})}); }catch(err){}
    await trampaEsperarDados();
    const necesita = d.caras - d.exitos + 1;
    ok = r.total >= necesita;
    texto = `1d${d.caras} = ${r.total} (con ${necesita} o más)`;
  }
  const res = fase === 'firme-portal' ? (ok ? 'no se mueve: el portal no se lo lleva' : 'no alcanzó: el portal se lo lleva')
    : (ok ? 'no se mueve: el muro no lo despide' : 'no alcanzó: sale despedido');
  const sig = {...dt, pasos: [...(dt.pasos || []), {titulo: mec, texto: `${texto} → ${res}`}]};
  if(fase === 'firme-portal'){
    sig.firmePortal = ok ? 'si' : 'no';
    sig.fase = ok ? trampaFaseSiguiente(sig, 'portal') : 'portal';
  }else sig.fase = ok ? trampaFaseSiguiente(sig, 'empuje') : 'empuje';
  await trampaGuardar(id, sig);
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
  const sig = {...dt, evita: ok ? (s.que || 'todo') : '', pasos: [...(dt.pasos || []), {titulo: trampaTituloSalva(s, dt), texto}]};
  sig.fase = trampaFaseSiguiente(sig, 'salva');
  await trampaGuardar(id, sig);
}

// 2 · Daño: la víctima tira los dados de la trampa y se anuncia cuánto pega; después lo aplica con «💔 Aplicar el daño» (trampaPasoDanoAplicar,
// 2026-10-17, dueño: un clic para que se entere de que se le descuenta, aunque sea automático). Un salto de la Descarga trae su daño ya fijo
// (la mitad del anterior): no se tira, y «▶ Recibir la descarga» ya es ese clic (se aplica en el mismo paso).
async function trampaPasoDano(id, dt){
  const r = dt.danoFijo ? {formula: String(dt.danoFijo), total: num(dt.danoFijo), rolls: [], mod: 0} : tirarDados(dt.dano);
  if(!r) throw new Error('Fórmula de daño inválida: ' + dt.dano);
  if(!dt.danoFijo){
    try{ await mesaPublicar(`Daño a ${dt.quien}`, {formula: r.formula, rolls: r.rolls, mod: r.mod, total: r.total, quien: `🪤 ${dt.nombreT}`}); }catch(err){}
    await trampaEsperarDados();
  }
  const monto = dt.evita === 'mitad' ? Math.floor(r.total / 2) : r.total;
  if(dt.danoFijo || monto <= 0) return trampaPasoDanoAplicar(id, {...dt, danoTirado: r.total, danoMonto: monto, danoFormula: r.formula});
  const texto = `${r.formula} = ${r.total}${dt.evita === 'mitad' ? ` → la mitad: ${monto}` : ''}`;
  await trampaGuardar(id, {...dt, danoTirado: r.total, danoMonto: monto, danoFormula: r.formula, fase: 'dano-aplicar', pasos: [...(dt.pasos || []), {titulo: 'Daño', texto}]});
}
// Lo aplica (se anuncia sin la vida de un creep: es privada).
async function trampaPasoDanoAplicar(id, dt){
  const x = tokens.get(dt.tokenId);
  const agT = typeof aguaRayo === 'function' && x ? aguaRayo(x, dt.elemento, num(dt.danoMonto)) : null;   // 💧 en el agua, el rayo ×1,5 (js/50)
  const monto = agT ? agT.monto : num(dt.danoMonto);
  let res = null, freno = '', restaFreno = 0;
  if(monto > 0 && x && x.fichaId){
    try{
      // Daño de un elemento (2026-10-04): resta la resistencia a ese elemento y, como es daño mágico, la Defensa especial.
      const rr = dt.elemento ? await resistenciasDe(x, dt.elemento) : {res: 0, armadmg: 0};
      const arm = dt.elemento && dt.ignoraDef && Combatiente.frenaArmaduraMagica(dt.elemento) ? rr.armadmg : 0;   // la Defensa especial (también lo tóxico, 2026-10-07)
      freno = [...(arm ? [`Defensa especial ${arm}`] : []), ...(rr.res ? [Combatiente.resElementalTxt(dt.elemento, rr.res)] : [])].join(' − ');
      const suela = dt.altura === 'aire' ? 0 : Math.max(0, statPiesDe(x, 'suelagruesa'));   // solo lo que toca el piso (2026-10-07)   // Suela gruesa (pies, 2026-10-06): lo que pisás hace menos
      if(suela){ rr.res = num(rr.res) + suela; freno = [freno, `Suela gruesa ${suela}`].filter(Boolean).join(' − '); }
      restaFreno = num(arm) + num(rr.res);
      const oT = {magico: !!dt.elemento, ...(num(dt.perfora) > 0 && !dt.ignoraDef ? {perfora: num(dt.perfora)} : {})};   // el Orbe de absorción (js/26)   // 🗡 la Perfora de la trampa (la Aguja, 2026-10-27)
      if(x.tipo === 'creep'){ if(soyGM) res = await danioCreep(x, String(monto), dt.ignoraDef, arm, rr.res, oT); }
      else res = await (String(x.fichaId).includes(SEP_INVOCACION) ? danioInv : danioPj)(x, String(monto), dt.ignoraDef, arm, rr.res, oT);
    }catch(err){ console.error('No se pudo aplicar el daño de la trampa:', err); }
  }
  let texto = dt.danoFijo ? `${num(dt.danoTirado)} de descarga` : monto <= 0 ? `${dt.danoFormula} = ${num(dt.danoTirado)}` : `${fmt(monto)}`;
  if(monto <= 0) texto += ' → sin daño';
  else if(res){
    const g = res.r;
    texto += g.invulnerable ? ' → Invulnerable: no le hizo nada'
      : (dt.ignoraDef ? `${freno ? ` − ${freno}` : ''} → ${fmt(g.recibido)} de daño directo a la vida` : ` − Defensa ${fmt(g.defensa - restaFreno)}${g.perfora ? ` (pasa${g.perfora > 1 ? 'n' : ''} ${fmt(g.perfora)} por la Perfora)` : ''}${freno ? ` − ${freno}` : ''} → ${fmt(g.recibido)} de daño`) + (num(g.absorbido) - num(g.vida) > 0 ? ` (el escudo absorbió ${fmt(num(g.absorbido) - num(g.vida))})` : '') + (num(g.vida) > 0 ? ` (la Vida extra se llevó ${fmt(g.vida)})` : '');
    if(!g.invulnerable) texto += ` · ✔ ya se descontó de la vida${x && x.tipo !== 'creep' && Number.isFinite(Number(res.previo)) && Number.isFinite(Number(res.nuevo)) ? ` (${fmt(num(res.previo))} → ${fmt(num(res.nuevo))})` : ''}`;
  }else texto += ` → ${monto} de daño${dt.ignoraDef ? ' directo a la vida' : ' menos su Defensa'} — aplicalo a mano`;
  const entro = monto <= 0 ? 0 : res ? num(res.r.recibido) : monto;   // lo que llegó a la vida (sin poder aplicarlo, se da por hecho)
  // ¿Lo lastimó? (P227, 2026-10-27): la vida, más lo que se llevó su Vida extra (es vida); lo que se comió un escudo no cuenta.
  const lastimo = entro + (res ? num(res.r.vida) : 0);
  const sinHerida = dt.requiereDano && lastimo <= 0;
  if(sinHerida) texto += ' → no lo lastimó: lo que deja no entra';
  const titulo = dt.danoFijo ? 'Le llega la descarga' : monto <= 0 ? 'Daño' : 'Daño aplicado';
  const sig = {...dt, danoEntro: entro, ...(sinHerida ? {evita: 'efecto'} : {}), pasos: [...(dt.pasos || []), {titulo, texto}]};
  sig.fase = trampaFaseSiguiente(sig, 'dano');
  await trampaGuardar(id, sig);
}

/* El portal (2026-10-04, dueño: Portal cósmico, rango 8): quien puso la trampa elige en el mapa adónde manda a la víctima (una casilla libre a
   `rango` o menos de donde está). Si esa pantalla puede mover el token, lo mueve; si no (un jugador mandando a un creep), deja el destino y lo
   mueve la pantalla de quien maneja a la víctima (paso «portal-mover»). Todos ven los pulsos del teleport. */
function trampaPasoPortal(id){
  const d = trampasDatos.get(id), dt = d && d.datos;
  if(dt && dt.portal && dt.portal.destino){ trampaPortalFijo(id); return; }
  if(!dt || !trampaEligePortal(dt)) return;
  const x = tokens.get(dt.tokenId);
  if(!x){ toast('La víctima ya no está en el mapa'); return; }
  trampaEnPantalla = null; AvisoCombate.cerrar(); trampaEnPantalla = id;   // se esconde mientras se elige (sin darla por cerrada)
  const volver = () => trampaDibujar(id);
  elegirDestino(async c => {
    if(distanciaHex(c, x) > dt.portal.rango){ toast(`Tiene que ser a ${dt.portal.rango} casillas o menos de ${dt.quien}`); trampaPasoPortal(id); return; }
    if(elementoSolidoEn(c.col, c.fila) || [...tokens.values()].some(y => y !== x && y.col === c.col && y.fila === c.fila)){ toast('Esa casilla no está libre: elegí otra'); trampaPasoPortal(id); return; }
    elegirDestinoTerminar();
    const tomado = await trampaTomar(id, 'portal');
    if(!tomado){ volver(); return; }
    const sig = {...tomado, destino: {col: c.col, fila: c.fila, desde: {col: x.col, fila: x.fila}}};
    if(puedoMover(x) || soyGM){ await trampaPortalMover(id, sig); return; }
    sig.fase = 'portal-mover';
    await trampaGuardar(id, sig);
  }, `<b>🌀 ¿Adónde lo mandás?</b> <span>clic en una casilla libre a ${dt.portal.rango} casillas o menos de ${esc(dt.quien)} · Esc o clic derecho cancelan</span>`, false, volver);
}
// El portal con destino fijo (2026-10-05, Varita del portal): lo marcó quien lo puso al colocarlo; si está ocupado, la casilla libre más cerca.
async function trampaPortalFijo(id){
  const d = trampasDatos.get(id), dt = d && d.datos, x = dt && tokens.get(dt.tokenId), dst = dt && destinoParsear(dt.portal.destino);
  if(!x || !dst){ toast('La víctima ya no está en el mapa'); return; }
  const tomado = await trampaTomar(id, 'portal');
  if(!tomado) return;
  const c = casillaLibreCerca(dst);
  const sig = {...tomado, destino: {col: c.col, fila: c.fila, desde: {col: x.col, fila: x.fila}}};
  if(puedoMover(x) || soyGM){ await trampaPortalMover(id, sig); return; }
  sig.fase = 'portal-mover';
  await trampaGuardar(id, sig);
}
async function trampaPasoPortalMover(id){
  const d = trampasDatos.get(id), dt0 = d && d.datos, x = dt0 && tokens.get(dt0.tokenId);
  if(!x || !(puedoMover(x) || soyGM)) return;
  const dt = await trampaTomar(id, 'portal-mover');
  if(dt) await trampaPortalMover(id, dt);
}
async function trampaPortalMover(id, dt){
  const c = dt.destino;
  let texto;
  try{
    await coleccionTokens().doc(dt.tokenId).update({col: c.col, fila: c.fila, ruta: firebase.firestore.FieldValue.delete()});
    texto = `El portal se lo lleva ${distanciaHex(c, c.desde)} casillas más allá.`;
  }catch(err){ console.error('No se pudo mover a la víctima del portal:', err); texto = 'El portal se lo lleva — movelo a mano al lugar elegido.'; }
  const sig = {...dt, pasos: [...(dt.pasos || []), {titulo: 'El portal', texto}]};
  sig.fase = trampaFaseSiguiente(sig, 'portal');
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
  let que = ' — aplicalo a mano', inmune = '', cayo = '';
  // 🪢 El Cordón oculto (2026-10-27, dueño: «cae del otro lado de la trampa en la misma dirección en la que venía caminando y queda sentado»): antes de
  // quedar Sentado, cae una casilla más allá, si está libre (sin token ni Sólido ni pared en el medio); si no, cae donde está.
  if(dt.adelante && x){
    const c = dt.adelante;
    const libre = !elementoSolidoEn(c.col, c.fila) && ![...tokens.values()].some(y => y !== x && y.col === c.col && y.fila === c.fila && !y.bajoTierra)
      && !(typeof paredCorta === 'function' && paredCorta({col: x.col, fila: x.fila}, c));
    if(libre){
      try{ await coleccionTokens().doc(dt.tokenId).update({col: c.col, fila: c.fila, ruta: firebase.firestore.FieldValue.delete()}); cayo = ' · tropieza y cae una casilla más allá'; }
      catch(err){ console.error('Cordón oculto: no se pudo mover', err); cayo = ' · tropieza (corrélo una casilla a mano)'; }
    }else cayo = ' · tropieza, pero no hay lugar adelante: cae donde está';
  }
  try{
    if(spec && x && x.tipo === 'creep' && x.fichaId && soyGM){
      await modificarCreep(x.fichaId, sc => { const r = EstadosAplicar.aplicarACreep(sc, spec); if(!r.ok) inmune = r.motivo || 'inmune'; });
      que = inmune ? ` — no le hace nada (${inmune})` : '';
    }else if(spec && x && x.tipo === 'pj' && x.fichaId && x.duenoUid){
      await EstadosAplicar.encolarPj({fichaId: x.fichaId, duenoUid: x.duenoUid, spec, origen: dt.nombreT});
      que = '';
    }
  }catch(err){ console.error('No se pudo aplicar el estado de la trampa:', err); }
  let texto = `${spec ? EstadosAplicar.texto(spec) : 'un estado'}${que}${cayo}`;
  const suelta = spec && !inmune ? Combatiente.textoSoltarse(spec) : '';
  if(suelta) texto += ` · Para salir, ${dt.creep ? 'en sus Acciones' : 'en la Botonera'}: ${suelta}`;
  const sig = {...dt, pasos: [...(dt.pasos || []), {titulo: 'Lo que le deja', texto}]};
  sig.fase = trampaFaseSiguiente(sig, 'estado');
  await trampaGuardar(id, sig);
}
