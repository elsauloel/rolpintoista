/* ---------- 🎭 Acción incierta y creeps sin revelar (2026-10-09; idea de Pablo del 30/9 en «A desarrollar»; dueño: «acciones, no moverse») ----------
   Para los jugadores (el GM ve todo como siempre):
   - Un creep que todavía no vieron (detrás de la niebla, en sigilo desde el arranque, oculto por el GM) no existe: no aparece en el orden de
     turnos ni en la Mesa. Cuando lo ven por primera vez queda «revelado» (`revelado: true` en su token; lo escribe el mapa del GM,
     inciertaRevisar) y desde ahí su lugar en el orden no desaparece aunque se esconda.
   - Lo que hace un creep revelado que no se ve (en sigilo o detrás de la niebla) sale en la Mesa como «🎭 Goblin está realizando una acción
     incierta», sin el detalle (mesaFiltrar, que comun/mesa.js usa antes de dibujar). Moverse no se anuncia.
   - Colocar una trampa (comun/tokens-auto.js) deja una línea `desde: 'incierta-pj' | 'incierta-creep'` con el detalle: su bando la ve entera;
     el rival ve «acción incierta» si quien la puso está a la vista (un creep revelado, aunque no se vea), y si no, nada.
   Cada línea se decide una vez, al llegar, y se recuerda en la sesión: no cambia si después se lo ve.
   Limitación: la ficha suelta y GM Tools no filtran (solo el mapa sabe qué ve cada uno). */

// ¿Lo ven los jugadores ahora? (para el mapa del GM, que ve todo: la unión de lo que ven los personajes).
function visibleParaJugadores(t){
  if(!t || t.oculto) return false;
  if(typeof tapadoPorNiebla === 'function' && tapadoPorNiebla(t)) return false;
  if(typeof marcado === 'function' && marcado(t)) return true;
  if(t.tipo === 'creep' && enSigilo(t)) return false;
  if(!nieblaActiva) return true;
  return nieblaVista.has(nbPack(t.col, t.fila));
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

/* ---------- La Mesa: qué ve cada uno ---------- */
const inciertaTexto = n => `🎭 ${n || 'Alguien'} está realizando una acción incierta`;
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
// 'ver' (tal cual) | 'incierta' (sin el detalle) | 'nada' (no aparece).
function inciertaDecidir(t){
  const des = String(t.desde || '');
  if(des === 'incierta-pj'){
    if(!soyGM) return 'ver';   // su bando: el detalle
    const tok = tokenPorFicha(t.ficha, 'pj');
    return tok && !tok.oculto && !ocultoPorSigiloParaMi(tok) ? 'incierta' : 'nada';
  }
  if(soyGM) return 'ver';
  if(des === 'incierta-creep'){
    const tok = tokenPorFicha(t.ficha, 'creep') || creepPorNombre(t.quien);
    return !tok || creepConocido(tok) ? 'incierta' : 'nada';
  }
  if(!t.quien) return 'ver';
  const tok = creepPorNombre(t.quien);
  if(!tok || (!tok.oculto && tokenVisiblePorNiebla(tok))) return 'ver';
  if(!creepConocido(tok)) return 'nada';
  return des === 'mantenimiento' ? 'ver' : 'incierta';
}
function inciertaDoc(d, t){
  const x = {...t, origen: inciertaTexto(t.quien), quien: '', formula: '', rolls: [], mod: 0, total: 0, desde: 'incierta', texto: '', estados: [], destacar: ''};
  delete x.ventaja;
  return {id: d.id, data: () => x};
}
// comun/mesa.js lo llama con los documentos de la Mesa antes de dibujarlos.
function mesaFiltrar(docs){
  if(!escucharTokens.listo){   // sin los tokens todavía: lo dudoso espera (mesaRefiltrar lo vuelve a pasar cuando llegan)
    return docs.filter(d => { const t = d.data(); return soyGM ? t.desde !== 'incierta-pj' : !t.quien && !String(t.desde || '').startsWith('incierta'); });
  }
  inciertaCargar();
  let cambio = false;
  const out = [];
  docs.forEach(d => {
    const t = d.data({serverTimestamps: 'estimate'});
    let dec = inciertaDecisiones.get(d.id);
    if(!dec){ dec = inciertaDecidir(t); inciertaDecisiones.set(d.id, dec); cambio = true; }
    if(dec === 'ver') out.push(d);
    else if(dec === 'incierta') out.push(inciertaDoc(d, t));
  });
  if(cambio) inciertaGuardar();
  return out;
}
