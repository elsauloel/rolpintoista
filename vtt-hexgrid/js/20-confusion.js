// js/20-confusion.js — la Confusión, automatizada (2026-10-04, pedido del dueño). Va después del arranque: solo define funciones.
/* Regla (dueño, 2026-10-04): la Confusión afecta a quién elegís como objetivo de una acción hostil; las defensas (Evasión, Parry, Bloqueo) no.
   La tirada va ANTES de la primera acción del turno (moverse incluido: si no, se gasta los No2 moviéndose y saca provecho). Al soltar la ruta o
   apretar una acción, antes de que pase, aparece el Anuncio «Estás confundido: tirá antes» con qué significa cada resultado y el botón:
     1d4 · 1 el GM decide qué hace · 2 pierde el turno · 3 objetivo al azar · 4 actúa normal.
   Se tira UNA vez por turno (de Mantenimiento a Mantenimiento) y el resultado vale para todo el turno; no hay segundo intento.
   Con «al azar» se elige un objetivo entre los tokens visibles (cada uno con su número en el mapa; se tira el dado común más chico que alcance y
   se repite lo que se pase): toda acción hostil del turno va contra él; los pormenores, a mano en la mesa.
   Cuando el resultado no deja actuar (1 o 2), se avisa y se deja seguir igual (la mesa decide: las herramientas ayudan, no prohíben).
   El resultado queda en un momento (`tipo: 'confusion'`, `datos.clave` = token@Mantenimiento): lo ven todas las pantallas y la Crónica. */
const confusionTurno = new Map();   // 'tokenId@mant' → {res, objetivoId, objetivo}
let confusionEnCurso = null;        // la tirada que se está haciendo en esta pantalla
let confusionNumeros = null;        // [{id, n}] los números sobre los candidatos, mientras se elige al azar
let confusionPase = '';             // el token al que se le deja pasar la próxima acción (el «Seguir» después de tirar)
// Los botones que son una acción (atacar, una habilidad, un consumible, levantarse, soltarse, sigilo); las defensas y las tiradas sueltas, no.
const CONFUSION_BOTONES = ['ejecutar', 'consume', 'levantarse', 'soltarse', 'sigilo', 'invatacar', 'ejecutarhabinv', 'invlevantarse', 'invsoltarse',
  'atacarcreep', 'levantarcreep', 'soltarcreep'];
const confusionEsAccion = b => !!b && (b.dataset.botoneraaccion === 'atacar' || CONFUSION_BOTONES.some(k => k in b.dataset));
// Vuelve a apretar el botón (si la ventana se redibujó, el mismo botón de nuevo, por sus datos).
function confusionReclic(raiz, b, tokenId){
  let x = b && b.isConnected ? b : null;
  if(!x && raiz) x = [...raiz.querySelectorAll('button')].find(y => Object.keys(b.dataset).every(k => y.dataset[k] === b.dataset[k]) && Object.keys(y.dataset).length === Object.keys(b.dataset).length);
  if(!x){ toast('Volvé a apretar la acción'); return; }
  confusionPase = tokenId;
  x.click();
}
const CONFUSION_TEXTOS = {
  1: ['El GM decide', 'Este turno, lo que hace lo decide el GM.'],
  2: ['Pierde el turno', 'Este turno no hace nada.'],
  3: ['Objetivo al azar', 'Se elige al azar un objetivo entre los que ve: toda acción hostil de este turno va contra él.'],
  4: ['Actúa normal', 'Este turno actúa normal.'],
};
const CONFUSION_CORTO = {1: 'decide el GM', 2: 'pierde el turno', 3: 'objetivo al azar', 4: 'actúa normal'};
const confusionClave = id => `${id}@${Math.round(num(mantenimientoNumero))}`;

// Los estados de un token (personaje, invocación o creep), como los ve esta pantalla.
function confusionEstadosDe(t){
  if(!t || !t.fichaId) return [];
  if(t.tipo === 'creep') return (creepPrivadoDe(t.fichaId) || {}).estados || [];
  const [base, invId] = String(t.fichaId).split(SEP_INVOCACION);
  const r = (fichasPub.get(base) || {}).resumen || {};
  if(invId) return ((r.invocaciones || []).find(i => i && i.id === invId) || {}).estados || [];
  return r.estados || [];
}
const confusionTiene = t => confusionEstadosDe(t).some(e => e && e.activo !== false && (e.confusion || /^confusi[oó]n$/i.test(String(e.nombre || '').trim())));
function confusionTokenDe(fichaId, tipo){
  for(const [id, t] of tokens) if(String(t.fichaId) === String(fichaId) && (!tipo || (tipo === 'creep') === (t.tipo === 'creep'))) return id;
  return '';
}

/* Antes de una acción (o de moverse): devuelve true si la frena (y se encarga de seguir con `seguir()` cuando corresponda). Lo llaman el
   soltar de una ruta (js/06), la Botonera nueva (js/11) y las Acciones de los creeps (js/12). */
function confusionAntes(tokenId, seguir){
  if(tokenId && confusionPase === tokenId){ confusionPase = ''; return false; }
  const t = tokens.get(tokenId);
  if(!t || modoMapa !== 'combate' || !confusionTiene(t)) return false;
  const clave = confusionClave(tokenId), ya = confusionTurno.get(clave);
  if(ya){ return confusionYaTirada(t, ya, seguir); }
  confusionBuscar(tokenId, clave).then(r => {
    if(r){ if(!confusionYaTirada(t, r, seguir)) seguir(); }
    else confusionPedirTirada(tokenId, seguir);
  });
  return true;
}
// Por si esta pantalla se abrió después de tirarla: la busca en los momentos.
async function confusionBuscar(tokenId, clave){
  try{
    const s = await coleccionMomentos().where('datos.clave', '==', clave).limit(1).get();
    if(s.empty) return null;
    const dt = s.docs[0].data().datos || {};
    if(!dt.res) return null;
    const r = {res: num(dt.res), objetivoId: dt.objetivoId || '', objetivo: dt.objetivo || ''};
    confusionTurno.set(clave, r);
    return r;
  }catch(err){ console.error('No se pudo leer la tirada de Confusión:', err); return null; }
}
// Con la tirada del turno ya hecha: 4 sigue; 3 sigue y recuerda el objetivo; 1 y 2 avisan y dejan seguir igual.
function confusionYaTirada(t, r, seguir){
  if(r.res === 4) return false;
  if(r.res === 3){ toast(`😵 Confusión: este turno su objetivo es ${r.objetivo || 'el que salió al azar'}`); return false; }
  const [titulo, texto] = CONFUSION_TEXTOS[r.res] || CONFUSION_TEXTOS[2];
  AvisoCombate.mostrar({icono: '😵', titulo: `${nombreDe(t)} está confundido`, pasos: [{titulo, texto}], botones: [
    {texto: 'Entendido', alClic: () => AvisoCombate.cerrar()},
    {texto: r.res === 1 ? 'Seguir (lo indicó el GM)' : 'Hacerlo igual (lo decide la mesa)', sec: true, alClic: () => { AvisoCombate.cerrar(); seguir(); }},
  ]});
  return true;
}

function confusionPedirTirada(tokenId, seguir){
  const t = tokens.get(tokenId);
  if(!t) return;
  const tabla = [1, 2, 3, 4].map(n => `${n}: ${CONFUSION_CORTO[n]}`).join(' · ');
  const dibujar = (rodando) => AvisoCombate.mostrar({clave: 'confusion:' + tokenId, icono: '😵', titulo: `${nombreDe(t)} está confundido`,
    pasos: [{titulo: 'Estás confundido: tirá antes', texto: `Antes de su primera acción del turno tira 1d4. ${tabla}. El resultado vale para todo el turno (las defensas no se tocan).`, espera: true}],
    botones: [{texto: rodando ? '🎲 Rodando…' : '🎲 Tirar 1d4', deshabilitado: !!rodando, alClic: () => confusionTirar(tokenId, seguir, dibujar)},
      {texto: 'Ahora no', sec: true, alClic: () => AvisoCombate.cerrar()}]});
  dibujar(false);
}

async function confusionTirar(tokenId, seguir, dibujar){
  if(confusionEnCurso) return;
  const t = tokens.get(tokenId), clave = confusionClave(tokenId);
  if(!t) return;
  confusionEnCurso = tokenId;
  dibujar(true);
  try{
    const quien = nombreDe(t), r = tirarDados('1d4');
    try{ await mesaPublicar(`Confusión de ${quien}`, {formula: r.formula, rolls: r.rolls, mod: r.mod, total: r.total, quien, ...(t.tipo === 'creep' ? {desde: 'gm'} : {})}); }catch(err){}
    await trampaEsperarDados();
    const res = r.total, pasos = [{titulo: 'Confusión', texto: `1d4 = ${res} → ${CONFUSION_CORTO[res]}`}];
    let objetivoId = '', objetivo = '';
    if(res === 3){
      const o = await confusionAlAzar(tokenId);
      if(o){ objetivoId = o.id; objetivo = o.nombre; pasos.push({titulo: 'Objetivo al azar', texto: o.texto}); }
      else pasos.push({titulo: 'Objetivo al azar', texto: 'No ve a nadie: actúa normal.'});
    }
    const dato = {res, objetivoId, objetivo};
    confusionTurno.set(clave, dato);
    await momentoAbrir({tipo: 'confusion', icono: '😵', titulo: `${quien} está confundido`, estado: 'listo',
      resultado: pasos.map(p => p.texto).join(' · '), datos: {clave, tokenId, ...dato, pasos}});
    const [tit, txt] = CONFUSION_TEXTOS[res];
    const sigue = res === 4 || res === 3;
    AvisoCombate.mostrar({clave: 'confusion:' + tokenId, icono: '😵', titulo: `${quien} está confundido`, pasos,
      veredicto: {tono: sigue ? 'neutro' : 'malo', grande: tit.toUpperCase(), chico: res === 3 && objetivo ? `Toda acción hostil de este turno va contra ${objetivo} (los pormenores, a mano en la mesa).` : txt},
      botones: sigue ? [{texto: 'Seguir', alClic: () => { AvisoCombate.cerrar(); seguir(); }}, {texto: 'Cerrar', sec: true, alClic: () => AvisoCombate.cerrar()}]
        : [{texto: 'Entendido', alClic: () => AvisoCombate.cerrar()}]});
  }catch(err){ console.error('No se pudo tirar la Confusión:', err); toast('No se pudo tirar la Confusión'); AvisoCombate.cerrar(); }
  finally{ confusionEnCurso = null; confusionNumeros = null; pedirDibujo(); }
}

// El objetivo al azar: los tokens que ve (sin él mismo), del más cerca al más lejos, cada uno con su número en el mapa; se tira el dado común
// más chico que alcance (d4, d6, d8, d10, d12, d20) y se repite lo que se pase. Uno solo: va a ese sin tirar.
async function confusionAlAzar(tokenId){
  const t = tokens.get(tokenId);
  const cand = [...tokens.entries()].filter(([id, x]) => id !== tokenId && x.fichaId && !x.oculto && !enSigilo(x))
    .sort((a, b) => distanciaHex(a[1], t) - distanciaHex(b[1], t));
  if(!cand.length) return null;
  const lista = cand.map(([id, x], i) => ({id, n: i + 1, nombre: nombreDe(x)}));
  if(lista.length === 1) return {id: lista[0].id, nombre: lista[0].nombre, texto: `${lista[0].nombre} (es el único que ve)`};
  confusionNumeros = lista;
  pedirDibujo();
  const caras = [4, 6, 8, 10, 12, 20].find(c => c >= lista.length) || lista.length;
  const quien = nombreDe(t), tiradas = [];
  AvisoCombate.mostrar({clave: 'confusion:' + tokenId, icono: '😵', titulo: `${quien} está confundido`,
    pasos: [{titulo: 'Objetivo al azar', texto: lista.map(c => `${c.n} ${c.nombre}`).join(' · ') + ` — se tira 1d${caras}${caras > lista.length ? ` (más de ${lista.length}: se vuelve a tirar)` : ''}.`, espera: true}],
    botones: [{texto: '🎲 Rodando…', deshabilitado: true}]});
  for(let i = 0; i < 20; i++){
    const r = tirarDados(`1d${caras}`);
    tiradas.push(r.total);
    try{ await mesaPublicar(`Objetivo al azar de ${quien}`, {formula: r.formula, rolls: r.rolls, mod: r.mod, total: r.total, quien, ...(t.tipo === 'creep' ? {desde: 'gm'} : {})}); }catch(err){}
    await trampaEsperarDados();
    const c = lista.find(x => x.n === r.total);
    if(c) return {id: c.id, nombre: c.nombre, texto: `1d${caras} = ${tiradas.join(', luego ')} → ${c.n}: ${c.nombre}`};
  }
  return null;
}

// Los números sobre los candidatos (los dibuja el bucle del mapa, js/05).
function dibujarConfusionNumeros(){
  if(!confusionNumeros) return false;
  ctx.save();
  confusionNumeros.forEach(c => {
    const x = tokens.get(c.id);
    if(!x) return;
    const p = hexCentro(x.col, x.fila), r = HEX * 0.42;
    ctx.beginPath(); ctx.arc(p.x, p.y - HEX * 0.75, r, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(150,90,220,.95)'; ctx.fill();
    ctx.lineWidth = 2 / vista.zoom; ctx.strokeStyle = '#fff'; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.round(HEX * 0.5)}px "Space Grotesk",sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(c.n), p.x, p.y - HEX * 0.75);
  });
  ctx.restore();
  return false;
}

// Lo llama momentoRecibido (js/16): las otras pantallas se enteran de la tirada del turno.
function confusionMomento(d){
  const dt = d.datos || {};
  if(dt.clave && dt.res) confusionTurno.set(dt.clave, {res: num(dt.res), objetivoId: dt.objetivoId || '', objetivo: dt.objetivo || ''});
}
