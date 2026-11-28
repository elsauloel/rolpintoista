/* js/139-objeto-en-area.js — 🚩 Un objeto adentro de un área: «¿Lo afecta?» (2026-11-27, dueño, P372 ✅).
   «Hay ciertos efectos de área que sí deberían afectarlos, en particular el daño… una ráfaga de fuego debería hacerle daño a un tótem, pero una nube de
   veneno no, porque el tótem no respira. Entonces… en vez de abrirse el duelo de manera directa con los objetos que tienen HP, los efectos en área le
   debe aparecer al propietario del objeto o al GM en su defecto una notificación que diga: tal objeto está dentro del área de tal efecto. ¿Lo afecta?
   Sí, no. Y si lo afecta, se resuelve a mano.»
   Objeto = el tótem y el estandarte (`esInerte`, js/73) y los tokens sueltos con vida (comun/tokens-auto.js): no entran al duelo de ninguna onda, cono,
   línea, hechizo de área, Meteoro, Tormenta, Barrido / Remolino ni Salto aplastante (js/13, js/108, js/55), y las zonas del suelo ya no los contaban
   (`zonaAplicaA`, js/08). En cambio, si quedan adentro y tienen vida, la pantalla que lanzó el efecto publica un momento `objeto-area` (js/16 lo pasa
   a `objetoAreaMomento`) para quien decide (`TokensAuto.objetoQuienDecide`: el jugador que lo puso y el GM; un tótem, un estandarte o un objeto del GM,
   solo el GM): un cartel «🚩 X está dentro del área de Y (de Z). ¿Lo afecta?» con Sí / No. Contesta el primero (el momento pasa a `listo` y el cartel se
   cierra en las demás pantallas). «Sí»: selecciona el objeto, lo centra y abre el menú de la vida del círculo rojo («1 · Recibe daño»), y deja la
   línea en la Mesa. Sin tirada ni estados. La cascada del área sigue con los combatientes sin esperar.
   Desde el 2026-11-28 (dueño, opción A; P375) el cartel espera a que termine el duelo del área (`datos.espera`, ver objetosEnAreaAvisar) y a que en
   esa pantalla no haya un cuadro de duelo abierto a la vista; si se atasca, sale igual a los 5 minutos y medio.
   Las zonas del suelo: la pantalla del GM mira cada 1,5 s qué objetos con vida hay adentro de cada zona y pregunta UNA vez por zona y objeto
   (`objetoZonaPreguntados`, recordado también en el navegador). */

// ¿Es un objeto con vida que hay que preguntar? (un tótem o estandarte en pie, o un token suelto con vida que no está roto)
function objetoEnAreaEs(t, id){
  if(!t) return false;
  const inerte = typeof esInerte === 'function' && esInerte(t);
  if(!inerte && !TokensAuto.esSuelto(t)) return false;
  const tid = id || t.id || (typeof zonaIdDe === 'function' ? zonaIdDe(t) : '');
  return TokensAuto.objetoConVida(t, {inerte, enPie: inerte ? (typeof estandarteEnPie === 'function' ? estandarteEnPie(tid, tokens.get(tid) || t) : true) : true});
}
// ¿Lo saca del duelo de un área? Todo objeto que no sea el token viejo de un creep sin vincular (ese lo maneja sueltoNoAtacable, js/13).
function objetoFueraDelArea(t){
  if(!t) return false;
  if(typeof esInerte === 'function' && esInerte(t)) return true;
  return !!TokensAuto.sueltoVida(t);
}
function objetoGmUids(){ const out = []; miembros.forEach((m, uid) => { if(m && m.gm) out.push(uid); }); return out; }
function objetoDecideUids(t){
  return TokensAuto.objetoQuienDecide(t, {inerte: typeof esInerte === 'function' && esInerte(t), gmUids: objetoGmUids(), miembros: [...miembros.keys()]});
}
// El nombre de quien lanzó el efecto, sin delatar a uno escondido.
function objetoQuienLanzo(tokenId, nombre){
  const t = tokenId ? tokens.get(tokenId) : null;
  if(t && (t.oculto || (typeof enSigilo === 'function' && enSigilo(t)))) return 'alguien';
  return String((t ? nombreDe(t) : '') || nombre || '').slice(0, 40);
}
/* Publica el aviso por cada objeto. lista = [{id, ...token}] · o = {efecto, quienTokenId, quienNombre, demora, espera}. No espera la respuesta.
   `espera` (2026-11-28, dueño, opción A; P375): el cartel no sale encima del duelo del área. {areas: [ids]} = hasta que esas áreas terminen
   (toda la cascada; la lleva el GM, así que no depende de esta pantalla); {seq: true} = hasta que quien lo lanzó avise que terminó su secuencia
   (el Barrido, el Salto aplastante, la Tormenta y el Meteoro) con `objetosEnAreaSoltar(ids)`. Sin `espera`, sale enseguida (salvo un duelo
   abierto a la vista en la pantalla de quien decide). → Promise con los ids de los momentos publicados. */
function objetosEnAreaAvisar(lista, o){
  o = o || {};
  const objs = (lista || []).filter(t => t && t.id && objetoEnAreaEs(t, t.id));
  if(!objs.length || typeof momentoAbrir !== 'function') return Promise.resolve([]);
  const efecto = String(o.efecto || 'un efecto').replace(/^[^\wÁÉÍÓÚáéíóúÑñ¿¡]+/, '').trim().slice(0, 60) || 'un efecto';
  const quien = objetoQuienLanzo(o.quienTokenId, o.quienNombre);
  const espera = o.espera && (o.espera.seq || (Array.isArray(o.espera.areas) && o.espera.areas.length))
    ? (o.espera.seq ? {seq: true} : {areas: o.espera.areas.filter(Boolean).map(String).slice(0, 10)}) : null;
  const ir = () => Promise.all(objs.map(t => {
    const para = objetoDecideUids(t);
    if(!para.length) return null;
    const objeto = String(nombreDe(t) || 'Un objeto').slice(0, 40);
    return momentoAbrir({tipo: 'objeto-area', icono: '🚩', titulo: TokensAuto.OBJETO_AREA_TXT({objeto, efecto, quien}).slice(0, 200), estado: 'esperando',
      datos: {paraUids: para, tokenId: t.id, objeto, efecto, quien, ...(o.zonaId ? {zonaId: String(o.zonaId)} : {}), ...(espera ? {espera} : {})}})
      .catch(err => { console.error('El aviso del objeto en el área:', err); return null; });
  })).then(ids => ids.filter(Boolean));
  return o.demora > 0 ? new Promise(r => setTimeout(() => ir().then(r), o.demora)) : ir();
}
// Terminó la secuencia de quien lo lanzó (o se canceló): los carteles que esperaban ya pueden salir (si no hay un duelo a la vista).
function objetosEnAreaSoltar(ids){
  (ids || []).forEach(id => { if(id && typeof momentoActualizar === 'function') momentoActualizar(id, {'datos.espera': {}}); });
}
// Los que están adentro de una lista de casillas / pegados: la usan el Barrido (js/108) y el Salto aplastante (js/55).
function objetosAlLado(centros, excluirId){
  return [...tokens.entries()].map(([id, t]) => ({...t, id}))
    .filter(t => t.id !== excluirId && !t.bajoTierra && objetoEnAreaEs(t, t.id) && centros.some(c => distanciaHex(c, t) === 1));
}

/* ---------- El cartel (en la pantalla de quien decide) ---------- */
// Espera a que termine el duelo del área (2026-11-28, P375): los que llegaron y todavía no salen quedan en `objetoAreaPend`; un reloj los mira.
const objetoAreaMostrados = new Set();
const objetoAreaPend = new Map();   // id → {d, desde}
const objetoAreaLeidas = new Map();   // áreas que esta pantalla no tiene en `areasActivas`: id → {estado, ms} (leídas una vez cada tanto)
function objetoAreaEstado(id){
  const a = typeof areasActivas !== 'undefined' ? areasActivas.get(id) : null;
  if(a) return 'activa';   // (en `areasActivas` solo están las que siguen: en curso, eligiendo o en secuencia)
  const l = objetoAreaLeidas.get(id);
  if(l && l.estado === 'terminada') return 'terminada';
  if(!l || Date.now() - l.ms > 4000){
    objetoAreaLeidas.set(id, {estado: (l && l.estado) || '?', ms: Date.now()});
    try{
      coleccionAreas().doc(id).get().then(doc => {
        const x = doc.exists ? doc.data() : null;
        const sigue = !!x && (areaEnCurso(x) || areaEligiendo(x) || x.estado === 'secuencia-mapa');
        objetoAreaLeidas.set(id, {estado: sigue ? 'activa' : 'terminada', ms: Date.now()});
        objetoAreaRevisarPend();
      }).catch(() => {});
    }catch(err){}
  }
  return 'activa';   // hasta saber, espera (el tope lo suelta igual)
}
function objetoAreaDueloAVista(){
  try{ return !!(typeof Duelo !== 'undefined' && Duelo.abiertoId && Duelo.abiertoId()); }catch(err){ return false; }
}
function objetoAreaRevisarPend(){
  if(!objetoAreaPend.size) return;
  const ahora = Date.now();
  [...objetoAreaPend.entries()].forEach(([id, p]) => {
    const dt = p.d.datos || {}, ms = p.d.creado && p.d.creado.toMillis ? p.d.creado.toMillis() : p.desde;
    const por = TokensAuto.objetoAreaEspera({espera: dt.espera, creadoMs: ms, ahora, areaEstado: objetoAreaEstado, dueloAVista: objetoAreaDueloAVista()});
    if(por){
      // La secuencia la suelta quien la lanzó editando el momento; por si el aviso no llega (la lista de momentos solo trae los últimos 20), se relee.
      if(por === 'seq' && ahora - (p.leido || p.desde) > 4000){
        p.leido = ahora;
        coleccionMomentos().doc(id).get().then(doc => { if(doc.exists && objetoAreaPend.has(id)){ objetoAreaPend.get(id).d = doc.data(); if(doc.data().estado !== 'esperando') objetoAreaPend.delete(id); } }).catch(() => {});
      }
      return;
    }
    objetoAreaPend.delete(id);
    objetoAreaMostrar(id, p.d);
  });
}
setInterval(() => { try{ objetoAreaRevisarPend(); }catch(err){ console.error('Los carteles de los objetos en el área:', err); } }, 700);
function objetoAreaMomento(id, d){
  const clave = 'objarea:' + id, dt = d.datos || {};
  if(d.estado !== 'esperando'){ objetoAreaPend.delete(id); if(objetoAreaMostrados.has(id)) AvisoCombate.cartel(clave, null); return; }
  if(!fbUsuario || !Array.isArray(dt.paraUids) || !dt.paraUids.includes(fbUsuario.uid) || objetoAreaMostrados.has(id)) return;
  const ms = d.creado && d.creado.toMillis ? d.creado.toMillis() : Date.now();
  if(Date.now() - ms > 30 * 60 * 1000) return;
  const p = objetoAreaPend.get(id);
  objetoAreaPend.set(id, {...(p || {}), d, desde: p ? p.desde : Date.now()});
  objetoAreaRevisarPend();
}
function objetoAreaMostrar(id, d){
  const clave = 'objarea:' + id, dt = d.datos || {};
  if(objetoAreaMostrados.has(id)) return;
  objetoAreaMostrados.add(id);
  const otro = soyGM && dt.paraUids.some(u => !(miembros.get(u) || {}).gm);
  const nombreJug = otro ? ((miembros.get(dt.paraUids.find(u => !(miembros.get(u) || {}).gm)) || {}).nombre || 'su jugador') : '';
  const contestar = async si => {
    AvisoCombate.cartel(clave, null);
    // El primero que contesta: si otra pantalla ya contestó, no se hace nada.
    try{
      const ref = coleccionMomentos().doc(id);
      const ya = await fbDb.runTransaction(async tx => {
        const s = await tx.get(ref);
        if(!s.exists || s.data().estado !== 'esperando') return true;
        tx.update(ref, {estado: 'listo', resultado: si ? 'Lo afecta: se resuelve a mano' : 'No lo afecta'});
        return false;
      });
      if(ya){ toast('Eso ya lo decidió otra persona'); return; }
    }catch(err){ console.error('No se pudo guardar la respuesta del objeto en el área:', err); }
    if(!si) return;
    const decide = soyGM ? 'El GM' : (fbMiembro && fbMiembro.nombre) || 'Alguien';
    mesaLinea(TokensAuto.OBJETO_AREA_SI_TXT({decide, efecto: dt.efecto, objeto: dt.objeto}), 'recordatorio');
    objetoVidaAMano(dt.tokenId);
  };
  AvisoCombate.cartel(clave, {icono: '🚩', titulo: '¿Lo afecta?',
    pasos: [{titulo: String(dt.objeto || 'Un objeto'), texto: TokensAuto.OBJETO_AREA_TXT({objeto: dt.objeto, efecto: dt.efecto, quien: dt.quien})}],
    texto: otro ? `Lo decide ${nombreJug} (es su objeto); si no está, decidí vos.` : 'Si lo afecta, se resuelve a mano: se te abre su vida para cambiarla.',
    botones: [{texto: 'Sí', alClic: () => contestar(true)}, {texto: 'No', sec: true, alClic: () => contestar(false)}]});
}
// «Sí»: el objeto seleccionado y centrado, con el menú de la vida abierto («1 · Recibe daño»).
function objetoVidaAMano(tokenId){
  const t = tokens.get(tokenId);
  if(!t){ toast('Ese objeto ya no está en este mapa: cambiale la vida a mano'); return; }
  if(typeof puedoCambiarVida === 'function' && !puedoCambiarVida(t)){ toast(`No podés cambiar la vida de ${nombreDe(t)} desde acá`); return; }
  try{ const ab = typeof Duelo !== 'undefined' && Duelo.abiertoId && Duelo.abiertoId(); if(ab && Duelo.minimizar) Duelo.minimizar(); }catch(err){}   // el cuadro del duelo se minimiza (queda «⚔ Ver duelo»): si no, tapa el menú de la vida
  seleccionar(tokenId);
  hudNivel = 'vital'; hudEditando = ''; hudGlobo = 'hp'; hpModo = 'danio';
  const c = hexCentro(t.col, t.fila);
  centrarEn(c.x, c.y);
  pedirDibujo();
  setTimeout(() => { const i = document.querySelector('#hud [data-hud-hp-in]'); if(i) i.focus(); }, 80);
}

/* ---------- Las zonas del suelo: una sola vez por zona y objeto (la pantalla del GM) ---------- */
const OBJETO_ZONA_LS = 'objeto-zona-preguntados';
const objetoZonaPreguntados = (() => {
  try{ return new Set(JSON.parse(localStorage.getItem(OBJETO_ZONA_LS) || '[]')); }catch(err){ return new Set(); }
})();
function objetoZonaRecordar(k){
  objetoZonaPreguntados.add(k);
  try{ localStorage.setItem(OBJETO_ZONA_LS, JSON.stringify([...objetoZonaPreguntados].slice(-400))); }catch(err){}
}
// ¿Esa zona le haría algo? (como zonaAplicaA, sin la regla de los objetos): no a quien la creó; a todos si es amiga, si no a los rivales. Sin el
// agua (no hace nada) ni la de curación.
function objetoZonaLeToca(el, t){
  if(!el || !el.zona || el.portal) return false;
  if(typeof zonaCuraDe === 'function' && zonaCuraDe(el)) return false;
  const sup = typeof superficieSpec === 'function' ? superficieSpec(el) : null;
  if(sup && sup.superficie && !sup.nombre) return false;
  if(t.fichaId && t.fichaId === el.zonaCasteadorRef && t.tipo === el.zonaCasteadorTipo) return false;
  return !!el.zonaAmiga || (el.zonaCasteadorTipo === 'creep' ? t.tipo === 'pj' : t.tipo === 'creep');
}
function objetoZonaRevisar(){
  if(!soyGM || !fbUsuario || typeof elementos === 'undefined' || typeof momentoAbrir !== 'function') return;
  elementos.forEach((el, elId) => {
    if(!el || !el.zona) return;
    let cs = null;
    tokens.forEach((t, tid) => {
      if(t.bajoTierra || !objetoEnAreaEs(t, tid) || !objetoZonaLeToca(el, t)) return;
      const k = `${typeof mapaMostrado !== 'undefined' ? mapaMostrado : ''}:${TokensAuto.objetoZonaClave(elId, tid)}`;
      if(objetoZonaPreguntados.has(k)) return;
      if(!cs) cs = new Set(celdasDeElemento(el).map(c => c.col + ',' + c.fila));
      if(!cs.has(t.col + ',' + t.fila)) return;
      if(alturaDe(el) === 'piso' && typeof vuelaToken === 'function' && vuelaToken(t)) return;
      objetoZonaRecordar(k);
      const de = el.zonaCasteadorRef ? [...tokens.entries()].find(([, x]) => x.fichaId === el.zonaCasteadorRef && (x.tipo === 'creep') === (el.zonaCasteadorTipo === 'creep')) : null;
      objetosEnAreaAvisar([{...t, id: tid}], {efecto: el.zonaNombre || el.trampaNombre || 'una zona', quienTokenId: de ? de[0] : '', zonaId: elId});
    });
  });
}
setInterval(() => { try{ objetoZonaRevisar(); }catch(err){ console.error('Los objetos en las zonas:', err); } }, 1500);
