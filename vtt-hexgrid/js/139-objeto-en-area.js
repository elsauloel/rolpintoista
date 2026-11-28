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
/* Publica el aviso por cada objeto. lista = [{id, ...token}] · o = {efecto, quienTokenId, quienNombre, demora}. No espera la respuesta. */
function objetosEnAreaAvisar(lista, o){
  o = o || {};
  const objs = (lista || []).filter(t => t && t.id && objetoEnAreaEs(t, t.id));
  if(!objs.length || typeof momentoAbrir !== 'function') return;
  const efecto = String(o.efecto || 'un efecto').replace(/^[^\wÁÉÍÓÚáéíóúÑñ¿¡]+/, '').trim().slice(0, 60) || 'un efecto';
  const quien = objetoQuienLanzo(o.quienTokenId, o.quienNombre);
  const ir = () => objs.forEach(t => {
    const para = objetoDecideUids(t);
    if(!para.length) return;
    const objeto = String(nombreDe(t) || 'Un objeto').slice(0, 40);
    momentoAbrir({tipo: 'objeto-area', icono: '🚩', titulo: TokensAuto.OBJETO_AREA_TXT({objeto, efecto, quien}).slice(0, 200), estado: 'esperando',
      datos: {paraUids: para, tokenId: t.id, objeto, efecto, quien, ...(o.zonaId ? {zonaId: String(o.zonaId)} : {})}})
      .catch(err => console.error('El aviso del objeto en el área:', err));
  });
  if(o.demora > 0) setTimeout(ir, o.demora); else ir();
}
// Los que están adentro de una lista de casillas / pegados: la usan el Barrido (js/108) y el Salto aplastante (js/55).
function objetosAlLado(centros, excluirId){
  return [...tokens.entries()].map(([id, t]) => ({...t, id}))
    .filter(t => t.id !== excluirId && !t.bajoTierra && objetoEnAreaEs(t, t.id) && centros.some(c => distanciaHex(c, t) === 1));
}

/* ---------- El cartel (en la pantalla de quien decide) ---------- */
const objetoAreaMostrados = new Set();
function objetoAreaMomento(id, d){
  const clave = 'objarea:' + id, dt = d.datos || {};
  if(d.estado !== 'esperando'){ if(objetoAreaMostrados.has(id)) AvisoCombate.cartel(clave, null); return; }
  if(!fbUsuario || !Array.isArray(dt.paraUids) || !dt.paraUids.includes(fbUsuario.uid) || objetoAreaMostrados.has(id)) return;
  const ms = d.creado && d.creado.toMillis ? d.creado.toMillis() : Date.now();
  if(Date.now() - ms > 30 * 60 * 1000) return;
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
