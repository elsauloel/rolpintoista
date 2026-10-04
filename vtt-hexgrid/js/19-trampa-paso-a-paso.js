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
function trampaFaseSiguiente(dt, fase){
  const orden = ['salva', 'dano', 'estado', 'fin'];
  for(const f of orden.slice(orden.indexOf(fase) + 1)){
    if(f === 'dano' && dt.dano && dt.evita !== 'todo') return f;
    if(f === 'estado' && dt.spec && dt.evita !== 'todo' && dt.evita !== 'efecto') return f;
    if(f === 'fin') return f;
  }
  return 'fin';
}
// Lo que falta: {titulo, texto, boton, espera} (espera = el renglón de la Crónica mientras tanto).
function trampaPasoQueFalta(dt){
  if(dt.fase === 'salva' && dt.salva){
    const s = dt.salva, etq = trampaEtq(s);
    return {titulo: trampaTituloSalva(s), texto: `${etq} contra ${s.dif}: con ${s.dif} o más, ${trampaLogra(dt)}.`, boton: `🎲 Tirar ${etq}`, espera: `${dt.quien} tira ${etq}…`};
  }
  if(dt.fase === 'dano') return {titulo: 'Daño', texto: `La trampa pega ${dt.dano}${dt.evita === 'mitad' ? ' (la mitad)' : ''}${dt.ignoraDef ? ', directo a la vida' : ', menos la Defensa'}.`,
    boton: `🎲 Tirar el daño (${dt.dano})`, espera: `${dt.quien} tira el daño…`};
  if(dt.fase === 'estado'){ const sp = trampaSpec(dt); return {titulo: 'Lo que le deja', texto: sp ? EstadosAplicar.texto(sp) : '', boton: null, espera: 'aplicando lo que le deja…'}; }
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
  if(dt.muro) pasos.push({titulo: 'El muro', texto: `Se levanta una pared delante, por ${dt.muro} turnos: hay que rodearla.`});
  const e = dt.evita;
  const veredicto = e === 'todo' ? {tono: 'bueno', grande: '¡LA ESQUIVÓ!'} : (e === 'efecto' || e === 'mitad') ? {tono: 'neutro', grande: e === 'mitad' ? 'LA MITAD' : '¡LO RESISTIÓ!'}
    : {tono: 'malo', grande: dt.pisador ? '¡CAYÓ EN LA TRAMPA!' : '¡LO ALCANZÓ!'};
  const resultado = pasos.map(p => p.texto).join(' · ') || 'no le hizo nada';
  return {resultado: resultado + (dt.aMano ? ` · ✋ ${dt.aMano}` : ''), datos: {...dt, pasos, fase: 'fin', tirando: false, veredicto, lineas: pasos.map(p => `${p.titulo}: ${p.texto}`)}};
}

// Al dispararse (js/08): el momento de un afectado.
async function trampaMomentoNuevo(p){
  const x = p.x, s = p.salva;
  const dt = {
    tokenId: p.tokenId || '', creep: x.tipo === 'creep', fichaId: String(x.fichaId || ''), quien: p.quien, nombreT: p.nombreT, pisador: !!p.pisador,
    salva: s ? {stat: String(s.stat), etq: String(s.etq || ''), dif: num(s.dif), que: String(s.que || 'todo'), ...(s.logra ? {logra: String(s.logra)} : {})} : null,
    dano: p.dano || '', ignoraDef: !!p.ignoraDef, spec: p.specJson || '', muro: num(p.muro), aMano: p.aMano || '',
    fase: '', tirando: false, evita: '', pasos: [],
  };
  dt.fase = dt.salva ? 'salva' : trampaFaseSiguiente(dt, 'salva');
  const titulo = p.pisador ? `${p.quien} pisó «${p.nombreT}»` : `${p.quien} quedó en el área de «${p.nombreT}»`;
  if(dt.fase === 'fin'){   // nada que tirar ni aplicar (una de muro, una alarma): solo se anuncia
    const f = trampaFinal(dt);
    return momentoAbrir({tipo: 'trampa', icono: '🪤', titulo, estado: 'listo', resultado: f.resultado, datos: f.datos});
  }
  dt.lineas = trampaLineas(dt);
  return momentoAbrir({tipo: 'trampa', icono: '🪤', titulo, estado: 'paso', datos: dt});
}

// ¿Esta pantalla resuelve a esta víctima?
function trampaMeToca(id, dt){
  if(trampasTomadas.has(id)) return true;
  if(dt.creep) return soyGM;
  const base = String(dt.fichaId || '').split(SEP_INVOCACION)[0];
  return base ? bnManejo(base) : soyGM;   // un token sin ficha: el GM
}

// Lo llama momentoRecibido (js/16) con cada cambio de un momento de trampa.
function trampaMomento(id, d){
  const dt = d.datos || {};
  if(trampaMeToca(id, dt) && !trampasCerradas.has(id)){
    trampasDatos.set(id, d);
    if(momentosFeed.delete(id)) renderMomentosFeed();
    if(trampaEnPantalla === id) trampaDibujar(id);
    else{ if(!trampaCola.includes(id)) trampaCola.push(id); trampaMostrarSiguiente(); }
    if(d.estado !== 'listo' && dt.fase === 'estado' && !dt.tirando) trampaPasoEstado(id);   // sin tirada: se aplica solo
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
    veredicto: listo ? dt.veredicto : null, aMano: listo ? dt.aMano : '', botones,
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
  const dt = d.datos || {};
  if(dt.fase === 'estado' && !dt.tirando) trampaPasoEstado(id);
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
    return;
  }
  await momentoActualizar(id, {datos: {...dt, tirando: false, lineas: trampaLineas(dt)}});
}

async function trampaTirar(id){
  if(trampaTirandoAca) return;
  const d = trampasDatos.get(id);
  const fase = d && d.datos && d.datos.fase;
  if(fase !== 'salva' && fase !== 'dano') return;
  const dt = await trampaTomar(id, fase);
  if(!dt){ toast('Ese paso ya se está tirando en otra pantalla'); return; }
  trampaTirandoAca = id;
  trampaDibujar(id);
  try{
    if(fase === 'salva') await trampaPasoSalva(id, dt);
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
    texto = `${etq} ${rd.total} contra ${s.dif} → ${!ok ? no : s.logra ? `lo resistió: ${s.logra}` : s.que === 'mitad' ? 'recibe la mitad del daño' : s.que === 'efecto' ? '¡lo resistió!' : '¡la esquivó!'}`;
  }else texto = `${etq}: no tiene ese número cargado → ${s.que === 'efecto' ? 'no lo resistió' : 'no la esquivó'} (si correspondía, ajustalo a mano)`;
  const sig = {...dt, evita: ok ? (s.que || 'todo') : '', pasos: [...(dt.pasos || []), {titulo: trampaTituloSalva(s), texto}]};
  sig.fase = trampaFaseSiguiente(sig, 'salva');
  await trampaGuardar(id, sig);
}

// 2 · Daño: la víctima tira los dados de la trampa; se aplica y se anuncia (sin la vida que le queda: la de un creep es privada).
async function trampaPasoDano(id, dt){
  const r = tirarDados(dt.dano);
  if(!r) throw new Error('Fórmula de daño inválida: ' + dt.dano);
  try{ await mesaPublicar(`Daño a ${dt.quien}`, {formula: r.formula, rolls: r.rolls, mod: r.mod, total: r.total, quien: `🪤 ${dt.nombreT}`}); }catch(err){}
  await trampaEsperarDados();
  const monto = dt.evita === 'mitad' ? Math.floor(r.total / 2) : r.total;
  const x = tokens.get(dt.tokenId);
  let res = null;
  if(monto > 0 && x && x.fichaId){
    try{
      if(x.tipo === 'creep'){ if(soyGM) res = await danioCreep(x, String(monto), dt.ignoraDef); }
      else res = await (String(x.fichaId).includes(SEP_INVOCACION) ? danioInv : danioPj)(x, String(monto), dt.ignoraDef);
    }catch(err){ console.error('No se pudo aplicar el daño de la trampa:', err); }
  }
  let texto = `${r.formula} = ${r.total}${dt.evita === 'mitad' ? ` → la mitad: ${monto}` : ''}`;
  if(monto <= 0) texto += ' → sin daño';
  else if(res){
    const g = res.r;
    texto += g.invulnerable ? ' → Invulnerable: no le hizo nada'
      : (dt.ignoraDef ? ` → ${fmt(g.recibido)} de daño directo a la vida` : ` − Defensa ${fmt(g.defensa)} → ${fmt(g.recibido)} de daño`) + (g.absorbido ? ` (el escudo absorbió ${fmt(g.absorbido)})` : '');
  }else texto += ` → ${monto} de daño${dt.ignoraDef ? ' directo a la vida' : ' menos su Defensa'} — aplicalo a mano`;
  const sig = {...dt, pasos: [...(dt.pasos || []), {titulo: 'Daño', texto}]};
  sig.fase = trampaFaseSiguiente(sig, 'dano');
  await trampaGuardar(id, sig);
}

// 3 · Lo que le deja: sin tirada, se aplica solo (a un creep directo; a un personaje o invocación, por comun/recibidos.js) y dice cómo soltarse.
async function trampaPasoEstado(id){
  const dt = await trampaTomar(id, 'estado');
  if(!dt) return;
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
