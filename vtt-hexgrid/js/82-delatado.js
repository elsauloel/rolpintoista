// js/82-delatado.js — 🔦 el creep que ataca se delata.
/* (dueño, 2026-10-28: «si un creep tira un proyectil, hechizo o cualquier efecto que seleccione a un objetivo enemigo o lo afecte con un efecto de
   área/superficie, la ubicación del ejecutor de esa acción debe quedar revelada hasta el final de la ronda: ese hexágono del mapa debe revelar la neblina
   como si estuviera iluminado. Si el creep se mueve de ese hex después de actuar, hacia algún lugar con neblina, deja de estar revelado»).
   La pantalla del GM anota la casilla del creep en `delatados` (un documento del estado del mapa: mapa/delatados o mapas/<id>/estado/delatados, que el GM
   ya puede escribir: sin reglas nuevas) = {tokens: {<tokenId>: {col, fila, mant}}}. Vale mientras el creep siga en esa casilla y no haya pasado la ronda
   (`mant` = el número de Mantenimiento: «⟳ Pasar de ronda» lo corta). Esa casilla cuenta como vista para los jugadores (nieblaActualizar, js/03) y el creep
   se ve (tokenVisiblePorNiebla). Lo dispara: un duelo que crea un creep contra un personaje o una invocación (ataques, habilidades dirigidas, cada objetivo
   de un área u onda) y una zona que crea un creep. Las trampas no: esas son a escondidas. */
let delatados = {}, delatadosMapa = null, delatadosCorte = null;
function delatadosEscuchar(){
  if(typeof fbDb === 'undefined' || !FB_CAMPANA || !mapaMostrado || mapaMostrado === delatadosMapa) return;
  if(delatadosCorte) delatadosCorte();
  delatadosMapa = mapaMostrado; delatados = {};
  delatadosCorte = fbDb.doc(fbRutaCampana(rutaMapaEstado('delatados'))).onSnapshot(doc => {
    delatados = (doc.exists && doc.data().tokens) || {};
    nieblaFirma = '';   // que la niebla se recalcule
    pedirDibujo();
  }, err => console.error('No se pudo escuchar a los delatados:', err));
}
setInterval(() => { try{ delatadosEscuchar(); }catch(err){} }, 1000);
function delatadoEn(id, t){
  const x = id && delatados[id];
  return !!x && !!t && !t.oculto && t.col === x.col && t.fila === x.fila && num(x.mant) === num(mantenimientoNumero);
}
const delatadoToken = t => delatadoEn(idDeToken(t), t);
// Las casillas que alumbra un delatado (para la niebla) y su firma.
function delatadosCeldas(){
  const L = [];
  Object.keys(delatados).forEach(id => { const t = tokens.get(id); if(delatadoEn(id, t)) L.push(nbPack(t.col, t.fila)); });
  return L;
}
async function delatar(tokenId){
  if(!soyGM || !tokenId) return;
  const t = tokens.get(tokenId);
  if(!t || t.oculto) return;
  const ya = delatados[tokenId];
  if(ya && ya.col === t.col && ya.fila === t.fila && num(ya.mant) === num(mantenimientoNumero)) return;
  const cambios = {[`tokens.${tokenId}`]: {col: t.col, fila: t.fila, mant: num(mantenimientoNumero)}, actualizado: firebase.firestore.FieldValue.serverTimestamp()};
  Object.keys(delatados).forEach(id => { if(id !== tokenId && (!tokens.has(id) || num(delatados[id].mant) !== num(mantenimientoNumero))) cambios[`tokens.${id}`] = firebase.firestore.FieldValue.delete(); });   // de paso, lo viejo
  const ref = fbDb.doc(fbRutaCampana(rutaMapaEstado('delatados')));
  try{ await ref.update(cambios); }
  catch(err){
    try{ await ref.set({tokens: {[tokenId]: {col: t.col, fila: t.fila, mant: num(mantenimientoNumero)}}, actualizado: firebase.firestore.FieldValue.serverTimestamp()}); }
    catch(err2){ console.error('No se pudo delatar al creep:', err2); }
  }
}
const tokenIdDeRef = ref => { for(const [id, x] of tokens) if(x && x.fichaId === ref) return id; return ''; };
// Los duelos que crea un creep contra un personaje o una invocación.
if(typeof Duelo !== 'undefined' && Duelo.crear){
  const crearSinDelatar = Duelo.crear;
  Duelo.crear = async function(cfg, tokDef, miTokenId, ...resto){
    const r = await crearSinDelatar.call(this, cfg, tokDef, miTokenId, ...resto);
    try{
      const yo = cfg && cfg.yo;
      if(soyGM && yo && tokDef && (yo.tipo === 'creep') !== (tokDef.tipo === 'creep')) delatar(miTokenId || tokenIdDeRef(yo.ref));
    }catch(err){ console.error('No se pudo delatar al creep:', err); }
    return r;
  };
}
// Las zonas que crea un creep (una nube, un charco de fuego…).
if(typeof crearElementoZona === 'function'){
  const zonaSinDelatar = crearElementoZona;
  crearElementoZona = async function(centro, cfg){
    const r = await zonaSinDelatar(centro, cfg);
    try{ if(soyGM && cfg && cfg.casteadorRef) delatar(tokenIdDeRef(cfg.casteadorRef)); }
    catch(err){ console.error('No se pudo delatar al creep:', err); }
    return r;
  };
}

/* Lo de los jugadores (dueño, el mismo día: «me resulta particularmente relevante para personajes con rango, casters y armas de rango, pero debe aplicar a
   todos»): un personaje que ataca a un creep o deja una zona también se delata (al GM le importa si estaba en sigilo o invisible). Como la marca la escribe
   solo el GM, su pantalla mira los duelos y las zonas nuevas que crean los jugadores. Lo de antes de abrir el mapa no cuenta. */
let delatarDuelosCorte = null;
const delatarZonasVistas = new Set();
let delatarZonasListo = false;
setInterval(() => {
  try{
    if(!soyGM || typeof fbDb === 'undefined' || !FB_CAMPANA) return;
    if(!delatarDuelosCorte){
      let primera = true;
      delatarDuelosCorte = fbDb.collection(fbRutaCampana('duelos')).orderBy('creado', 'desc').limit(8).onSnapshot(snap => {
        if(primera){ primera = false; return; }
        snap.docChanges().forEach(ch => {
          if(ch.type !== 'added') return;
          const d = ch.doc.data(), a = d.atacante || {}, de = d.defensor || {};
          if(a.tipo !== 'creep' && de.tipo === 'creep') delatar(a.tokenId || tokenIdDeRef(a.ref));
        });
      }, err => console.error('No se pudo mirar los duelos (delatar):', err));
    }
    // Las zonas que deja un jugador (un hechizo que queda en el piso).
    elementos.forEach((el, id) => {
      if(delatarZonasVistas.has(id)) return;
      delatarZonasVistas.add(id);
      if(delatarZonasListo && el && el.zona && !el.trampa && el.zonaCasteadorTipo === 'pj' && el.zonaCasteadorRef) delatar(tokenIdDeRef(el.zonaCasteadorRef));
    });
    delatarZonasListo = true;
  }catch(err){}
}, 1000);
