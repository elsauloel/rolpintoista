/* ---------- 🎭 Acción incierta y creeps sin revelar (2026-10-09; idea de Pablo del 30/9 en «A desarrollar»; dueño: «acciones, no moverse») ----------
   Para los jugadores (el GM ve todo como siempre):
   - Un creep que todavía no vieron (detrás de la niebla, en sigilo desde el arranque, oculto por el GM) no existe: no aparece en el orden de
     turnos ni en la Mesa. Cuando lo ven por primera vez queda «revelado» (`revelado: true` en su token; lo escribe el mapa del GM,
     inciertaRevisar) y desde ahí su lugar en el orden no desaparece aunque se esconda.
   - Lo que hace un creep que no se ve (en sigilo, detrás de la niebla, oculto) no lo nombra: si ya lo conocen sale en la Mesa «🎭 Alguien
     está realizando una acción incierta», sin el nombre ni el detalle; si no, nada (mesaFiltrar, que comun/mesa.js usa antes de dibujar;
     desde el 2026-11-20 mira a quién NOMBRA cada texto, lleve o no «quien», y vale también para la Crónica: ver más abajo «🙈»). Moverse
     no se anuncia.
   - Colocar una trampa (comun/tokens-auto.js) deja una línea `desde: 'incierta-pj' | 'incierta-creep'` con el detalle: su bando la ve entera;
     el rival ve «acción incierta» (sin el nombre) si quien la puso es conocido (un creep revelado, aunque no se vea), y si no, nada.
   Cada línea se decide una vez (al llegar, o a los 3 s si hubo que esconderla) y se recuerda en la sesión: no cambia si después se lo ve.
   Limitación: la ficha suelta y GM Tools no filtran (solo el mapa sabe qué ve cada uno). */

// ¿Lo ven los jugadores ahora? (para el mapa del GM, que ve todo: la unión de lo que ven los personajes).
function visibleParaJugadores(t){
  if(!t || t.oculto) return false;
  if(typeof tapadoPorNiebla === 'function' && tapadoPorNiebla(t)) return false;
  if(typeof marcado === 'function' && marcado(t)) return true;
  if(t.tipo === 'creep' && enSigilo(t)) return false;
  if(!nieblaActiva) return true;
  return nieblaVista.has(nbPack(t.col, t.fila)) || oidoPorJugadores(t);   // o lo oyen (el punto ciego, 2026-10-15)
}
// ¿Los jugadores saben que existe? (revelado alguna vez, o a la vista ahora).
function creepConocido(t){
  if(!t || t.tipo !== 'creep' || t.oculto) return false;
  return !!t.revelado || (soyGM ? visibleParaJugadores(t) : tokenVisiblePorNiebla(t));
}

// El mapa del GM marca como revelados los creeps que los jugadores ven (solo en el mapa publicado, el que miran ellos).
const inciertaEscribiendo = new Set();
let inciertaSinPermiso = false, inciertaListo = false;
function inciertaRevisar(){
  if(typeof fbDb === 'undefined' || !fbDb || !fbMiembro) return;
  if(escucharTokens.listo && !inciertaListo){ inciertaListo = true; if(typeof mesaRefiltrar === 'function') mesaRefiltrar(); }   // la Mesa esperaba a los tokens
  if(!soyGM || inciertaSinPermiso || !escucharTokens.listo || mapaMostrado !== mapaActivo) return;
  tokens.forEach((t, id) => {
    if(t.tipo !== 'creep' || t.revelado || t.oculto || inciertaEscribiendo.has(id) || !visibleParaJugadores(t)) return;
    inciertaEscribiendo.add(id);
    coleccionTokens().doc(id).update({revelado: true})
      .catch(err => { if(err.code === 'permission-denied') inciertaSinPermiso = true; console.error('No se pudo marcar el creep como revelado (¿faltan pegar las reglas?):', err); })
      .finally(() => setTimeout(() => inciertaEscribiendo.delete(id), 5000));
  });
}
setInterval(inciertaRevisar, 1500);

/* ---------- 🙈 Lo que hace alguien que no se ve, no lo nombra (2026-11-20, dueño: «no puede suceder que la rata haga algo y se revele») ----------
   UN solo criterio para todo texto que le llega a un jugador —la Mesa (mesaFiltrar), la Crónica y los Avisos (inciertaMomento, que usa
   js/16)—: se mira a quién NOMBRA el texto (comun/no-visto.js). Si nombra a un creep que esta pantalla no ve (niebla, sigilo, oculto por
   el GM, adentro de una nube): solo a él → no aparece (o «🎭 Alguien está realizando una acción incierta» si ya lo conocen); a él y a
   alguien que sí se ve (un personaje) → aparece con «Alguien» en su lugar. El GM ve todo completo, como siempre.
   «No se ve» se decide con lo mismo que dibuja el mapa (tokenVisiblePorNiebla + oculto), con dos márgenes para que el orden de llegada
   no cambie el resultado: si se lo vio hasta NO_VISTO_MS antes de que llegara la línea, cuenta como visto (la rata A LA VISTA que usa su
   Polvareda: sus líneas llegan unos segundos después de que la nube la tapó, y sí la nombran; a uno que el GM oculta a mano no se le
   da ese margen); y una línea recién llegada que habría que esconder se vuelve a
   mirar a los NO_VISTO_ESPERA_MS (lo detectaron, atacó y quedó delatado: aparece con su nombre). Después queda decidida. */
const NO_VISTO_MS = 8000, NO_VISTO_ESPERA_MS = 3000;
const noVistoUltima = new Map();    // token → la última vez que esta pantalla lo vio
const noVistoLlegada = new Map();   // línea o momento → cuándo llegó a esta pantalla
function loVeoAhora(t){ return !!t && !(t.oculto && !soyGM) && tokenVisiblePorNiebla(t); }
function noVistoMarcar(){
  if(typeof soyGM === 'undefined' || soyGM || !escucharTokens.listo) return;
  const ahora = Date.now();
  tokens.forEach((t, id) => {
    if(t.tipo !== 'creep') return;
    if(t.oculto) noVistoUltima.delete(id);   // lo escondió el GM a mano: sin margen, desde ya no se lo nombra
    else if(loVeoAhora(t)) noVistoUltima.set(id, ahora);
  });
}
setInterval(noVistoMarcar, 500);
// Quién está escondido para esta pantalla y quién no (por nombre: dos tokens con el mismo nombre, uno a la vista → ese nombre se ve).
function noVistoContexto(desde, mantenimiento){
  noVistoMarcar();
  const porNombre = new Map(), visibles = [], escondidos = [];
  tokens.forEach((t, id) => {
    const n = String(nombreDe(t) || '').trim();
    if(!n) return;
    if(t.tipo !== 'creep'){ visibles.push(n); return; }
    const g = porNombre.get(n) || {visto: false, conocido: false};
    if(loVeoAhora(t) || (noVistoUltima.get(id) || 0) >= desde - NO_VISTO_MS) g.visto = true;
    if(creepConocido(t)) g.conocido = true;
    porNombre.set(n, g);
  });
  porNombre.forEach((g, n) => { if(g.visto) visibles.push(n); else escondidos.push({nombre: n, conocido: g.conocido}); });
  return {escondidos, visibles, mantenimiento: !!mantenimiento};
}
// → {modo: 'ver' | 'anon' | 'incierta' | 'nada', esconder, todos, firme} (firme: ya no cambia)
function noVistoDecidir(clave, texto, mantenimiento){
  let ms = noVistoLlegada.get(clave);
  if(!ms){
    ms = Date.now(); noVistoLlegada.set(clave, ms);
    if(noVistoLlegada.size > 800) [...noVistoLlegada.keys()].slice(0, 300).forEach(k => noVistoLlegada.delete(k));
  }
  const dec = NoVisto.decidir(texto, noVistoContexto(ms, mantenimiento));
  dec.firme = dec.modo === 'ver' || Date.now() - ms >= NO_VISTO_ESPERA_MS;
  return dec;
}
const nombresDeTokens = () => [...new Set([...tokens.values()].map(t => String(nombreDe(t) || '').trim()).filter(Boolean))];
/* La Crónica y los Avisos (js/16): el momento como lo ve esta pantalla. → {d, modo, firme}: `d` ya sin el nombre de los que no se ven
   (para un Aviso al centro, que se muestra igual); `modo` 'nada' / 'incierta' = no va a la esquina. Sirve también para la tarjeta de un
   duelo ({titulo, lineas}). */
function inciertaMomento(id, d){
  if(soyGM || !escucharTokens.listo || typeof NoVisto === 'undefined') return {d, modo: 'ver', firme: true};
  const dl = d.datos && Array.isArray(d.datos.lineas) ? d.datos.lineas : [];
  const texto = [d.titulo, d.resultado, ...(Array.isArray(d.lineas) ? d.lineas : []), ...dl].filter(x => typeof x === 'string' && x).join('\n');
  const dec = noVistoDecidir('momento:' + id, texto, false);
  if(!dec.esconder.length) return {d, modo: dec.modo, firme: dec.firme};
  const x = NoVisto.anonimoEn(d, ['titulo', 'resultado', 'lineas'], dec);
  if(dl.length) x.datos = NoVisto.anonimoEn(d.datos, ['lineas'], dec);
  return {d: x, modo: dec.modo, firme: dec.firme};
}

/* ---------- La Mesa: qué ve cada uno ---------- */
const inciertaTexto = n => soyGM ? `🎭 ${n || 'Alguien'} está realizando una acción incierta` : NoVisto.INCIERTA;   // a los jugadores, sin el nombre (2026-11-20)
let inciertaDecisiones = null;
const inciertaClave = () => 'mesa-incierta-' + (typeof FB_CAMPANA !== 'undefined' ? FB_CAMPANA : '');
function inciertaCargar(){
  if(inciertaDecisiones) return;
  try{ inciertaDecisiones = new Map(Object.entries(JSON.parse(sessionStorage.getItem(inciertaClave()) || '{}'))); }catch(e){ inciertaDecisiones = new Map(); }
}
function inciertaGuardar(){
  try{ sessionStorage.setItem(inciertaClave(), JSON.stringify(Object.fromEntries([...inciertaDecisiones].slice(-400)))); }catch(e){}
}
function creepPorNombre(n){
  for(const t of tokens.values()) if(t.tipo === 'creep' && nombreDe(t) === n) return t;
  return null;
}
function tokenPorFicha(fichaId, tipo){
  if(!fichaId) return null;
  for(const t of tokens.values()) if(t.tipo === tipo && t.fichaId === fichaId) return t;
  return null;
}
// 'ver' (tal cual) | 'incierta' (sin el nombre ni el detalle) | 'nada' (no aparece) | 'anon' + los nombres que se cambian por «Alguien».
// → {modo, esconder?, firme}
const ANON_SEP = '\u0001';
function inciertaDecidir(t, id){
  const des = String(t.desde || '');
  if(des === 'incierta-pj'){
    if(!soyGM) return {modo: 'ver', firme: true};   // su bando: el detalle
    const tok = tokenPorFicha(t.ficha, 'pj');
    return {modo: tok && !tok.oculto && !ocultoPorSigiloParaMi(tok) ? 'incierta' : 'nada', firme: true};
  }
  if(soyGM || des === 'incierta' || des === 'publico') return {modo: 'ver', firme: true};   // 📣 un mensaje a todo el grupo (comun/mensajes.js) lo ven todos, tal cual
  if(des === 'incierta-creep'){
    const tok = tokenPorFicha(t.ficha, 'creep') || creepPorNombre(t.quien);
    return {modo: !tok || creepConocido(tok) ? 'incierta' : 'nada', firme: true};
  }
  // Todo lo demás: por a quién nombra (lleve o no «quien»: la mayoría de los anuncios del mapa no lo llevan).
  const est = Array.isArray(t.estados) ? t.estados.map(e => e && e.n).filter(Boolean) : [];
  const texto = [t.quien, t.origen, t.formula, t.texto, ...est].filter(x => typeof x === 'string' && x).join('\n');
  return noVistoDecidir('mesa:' + id, texto, des === 'mantenimiento' || des === 'reporte');
}
function inciertaDoc(d, t){
  const x = {...t, origen: inciertaTexto(t.quien), quien: '', formula: '', rolls: [], mod: 0, total: 0, desde: 'incierta', texto: '', estados: [], destacar: ''};
  delete x.ventaja;
  return {id: d.id, data: () => x};
}
// La misma línea con «Alguien» en lugar de los que no se ven (lo demás, igual: lo que le pasa a un personaje no se esconde).
function inciertaAnonDoc(d, t, esconder){
  const x = NoVisto.anonimoEn(t, ['quien', 'origen', 'formula', 'texto'], {todos: nombresDeTokens(), esconder});
  return {id: d.id, data: () => x};
}
let noVistoTimer = null, noVistoPasada = 0;
function noVistoReintentar(){   // lo recién llegado que se escondió se vuelve a mirar una vez (por si se lo vio enseguida)
  if(noVistoTimer) return;
  const f = () => {
    noVistoTimer = null;
    const antes = noVistoPasada;
    if(typeof mesaRefiltrar === 'function') mesaRefiltrar();
    if(noVistoPasada === antes) noVistoTimer = setTimeout(f, 1000);   // la Mesa estaba esperando a los dados: después
  };
  noVistoTimer = setTimeout(f, NO_VISTO_ESPERA_MS + 300);
}
// comun/mesa.js lo llama con los documentos de la Mesa antes de dibujarlos.
/* 🙈 Las líneas de un duelo oculto (P263, 2026-11-22; comun/duelo.js las marca `oculta-<pj|creep>:<desde>` con la ficha del escondido): las ve su
   bando (los jugadores, si el escondido es un personaje; el GM, si es un creep), el GM con 👁 Revelar lo oculto y quien lo esté viendo ahora.
   Al resto no le llega nada (ni «Alguien», ni la acción incierta). */
function mesaOcultaVer(t){
  const o = typeof mesaOcultaParte === 'function' ? mesaOcultaParte(t) : null;
  if(!o) return null;
  return escondidoLoVeo(o.tipo, tokenPorFicha(t.ficha, o.tipo)) ? o : false;
}
/* 🙈 Quién ve a quién (2026-11-23, dueño, sobre el inicio de turno de una rata escondida y envenenada: «a los rivales no les debería salir nada, a
   sus aliados sí»). UNA regla (NoVisto.loVeElEscondido) para todo lo que le pasa a alguien escondido: las líneas `oculta-…` de la Mesa (de arriba)
   y los momentos marcados `datos.escondido` / `datos.sinEscondido` (la tarjeta «Empieza el turno de…», «▶ Empieza tu turno», Provocado; js/04).
   Lo ve su bando, el GM con 👁 y quien lo vea ahora (`loVeoAhora`, lo mismo que dibuja el mapa). */
function escondidoLoVeo(tipo, tok){
  const loVe = !!tok && loVeoAhora(tok) && !(tipo === 'pj' && soyGM && ocultoPorSigiloParaMi(tok));
  return NoVisto.loVeElEscondido({tipo, soyGM: !!soyGM, ojo: typeof ojoRevelando !== 'undefined' && ojoRevelando, loVe});
}
// ¿Este token está escondido para el bando rival ahora? → {tipo, tokenId} (lo que se guarda en el momento) o null. Lo decide la pantalla que publica
// (casi siempre la del GM, que es la que pasa el turno; un creep a la vista de los jugadores lo sabe solo el GM: visibleParaJugadores).
function escondidoDe(id, fila){
  const t = tokens.get(id);
  if(!t) return null;
  const f = fila || ((typeof iniciativa !== 'undefined' && iniciativa.orden) || []).find(x => x.id === id);
  const tipo = t.tipo === 'creep' ? 'creep' : 'pj';
  const delatado = typeof delatadoToken === 'function' && delatadoToken(t);
  const esc = NoVisto.escondido({tipo, oculto: !!t.oculto, filaOculta: !!(f && f.oculto), sigilo: enSigilo(t) && !delatado,
    tapado: typeof tapadoPorNiebla === 'function' && tapadoPorNiebla(t), invisible: invisibleParaRivales(t) && !delatado,
    aLaVista: tipo === 'creep' && soyGM ? visibleParaJugadores(t) : undefined});
  return esc ? {tipo, tokenId: id} : null;
}
// Un momento marcado: ¿lo ve esta pantalla? (`escondido`: solo los que lo ven; `sinEscondido`: lo que les llega aparte a los que NO lo ven).
function momentoEscondidoVer(d){
  const dt = (d && d.datos) || {}, e = dt.escondido || dt.sinEscondido;
  if(!e || !e.tokenId) return true;
  const ve = escondidoLoVeo(e.tipo === 'creep' ? 'creep' : 'pj', tokens.get(e.tokenId));
  return dt.escondido ? ve : !ve;
}
const mesaOcultaDecision = new Map();   // id → la decisión, una sola vez (como el resto de la Mesa: no cambia si después se lo ve)
function mesaFiltrar(docs){
  docs = docs.map(d => {
    let o = mesaOcultaDecision.get(d.id);
    if(o === undefined){ o = mesaOcultaVer(d.data()); if(o !== null && escucharTokens.listo) mesaOcultaDecision.set(d.id, o); }
    return o === null ? d : o ? mesaOcultaDoc(d, o.desde) : null;
  }).filter(Boolean);
  if(!escucharTokens.listo){   // sin los tokens todavía: lo dudoso espera (mesaRefiltrar lo vuelve a pasar cuando llegan)
    // (a un jugador, nada: casi cualquier línea puede nombrar a alguien que no ve, y todavía no se sabe a quién ve; 2026-11-20)
    return soyGM ? docs.filter(d => d.data().desde !== 'incierta-pj') : [];
  }
  inciertaCargar();
  noVistoPasada++;
  let cambio = false, pendiente = false, ultimaIncierta = null;
  const out = [];
  docs.forEach(d => {
    const t = d.data({serverTimestamps: 'estimate'});
    let dec = inciertaDecisiones.get(d.id);
    if(!dec){
      const r = inciertaDecidir(t, d.id);
      dec = r.modo === 'anon' ? ['anon', ...r.esconder].join(ANON_SEP) : r.modo;
      if(r.firme){ inciertaDecisiones.set(d.id, dec); cambio = true; }
      else pendiente = true;
    }
    if(dec === 'ver') out.push(d);
    else if(dec.startsWith('anon' + ANON_SEP)) out.push(inciertaAnonDoc(d, t, dec.split(ANON_SEP).slice(1)));
    else if(dec === 'incierta'){
      // Varias líneas seguidas de lo mismo (una habilidad deja dos o tres) son UNA acción incierta, no tres.
      const ms = t.cuando && t.cuando.toMillis ? t.cuando.toMillis() : 0;
      const pegada = ultimaIncierta !== null && out.length && out[out.length - 1].__incierta && Math.abs(ultimaIncierta - ms) < 20000;
      ultimaIncierta = ms;
      if(pegada) return;
      const x = inciertaDoc(d, t); x.__incierta = true;
      out.push(x);
    }
  });
  if(cambio) inciertaGuardar();
  if(pendiente) noVistoReintentar();
  return out;
}
