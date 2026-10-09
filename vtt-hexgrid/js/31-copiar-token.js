/* ---------- 📋 Copiar y pegar un token (2026-10-09, pedido del dueño; solo el GM) ----------
   Ctrl+C con un token seleccionado lo copia; Ctrl+V lo pega en la casilla donde está el mouse, mirando para el mismo lado y oculto si el
   original lo estaba. Un token de creep pregunta «¿Querés crear su ficha?»:
   - Sí: duplica el creep en GM Tools (un creep nuevo «… (copia)», con sus atributos, arma, equipo, habilidades, vida y estados, en este mapa;
     duplicarCreepDesdeMapa escribe lo mismo que guarda GM Tools, así GM Tools lo levanta solo) y el token nuevo queda vinculado a él.
   - Solo el token: un token sin ficha (como un NPC), con el nombre, el color y la imagen.
   Un token de personaje se pega sin vincular (un NPC con su nombre e imagen). */
let portapapelesToken = null;
function copiarTokenSeleccionado(){
  const t = seleccion ? tokens.get(seleccion) : null;
  if(!t) return;
  const v = vinculo(t);
  portapapelesToken = {nombre: nombreDe(t), color: t.color || '#9A867E', tipo: t.tipo, fichaId: t.fichaId || '', rotacion: t.rotacion || 0, oculto: !!t.oculto,
    imagen: t.imagen || (v && typeof v.miniatura === 'string' && v.miniatura.length <= 60000 ? v.miniatura : '')};
  portapapelesElemento = null;   // lo último que se copió es lo que se pega
  toast(`📋 Copiado: ${portapapelesToken.nombre} — Ctrl+V lo pega donde esté el mouse`);
}
const uidCorto = () => Math.random().toString(36).slice(2, 9);
// Un creep nuevo, copia de otro, con lo que guarda GM Tools: lo público (con su firma), la ficha privada y la imagen. → {id, nombre}.
async function duplicarCreepDesdeMapa(creepId){
  const col = fbDb.collection(fbRutaCampana('creeps'));
  const base = col.doc(creepId);
  const [pub, priv, img] = await Promise.all([base.get(), base.collection('privado').doc('ficha').get(), base.collection('privado').doc('imagen').get()]);
  if(!pub.exists || !priv.exists) throw new Error('El creep ya no existe');
  const sc = JSON.parse(priv.data().json || '{}');
  const nuevo = col.doc();
  sc.id = nuevo.id;
  sc.nombre = (sc.nombre || 'Creep') + ' (copia)';
  sc.mapa = mapaMostrado;
  ['habilidades', 'estados', 'equipo', 'cinturon'].forEach(k => { if(Array.isArray(sc[k])) sc[k] = sc[k].map(x => x && typeof x === 'object' ? {...x, id: uidCorto()} : x); });
  delete sc.bibOrigen; delete sc.recompensado;
  const imagen = img.exists ? String(img.data().dato || '') : '';
  const json = JSON.stringify({...sc, imagen: ''});
  const p = pub.data();
  const lote = fbDb.batch();
  lote.set(nuevo, {
    nombre: String(sc.nombre).slice(0, 60), orden: num(p.orden) + 1, color: String(p.color || ''), mapa: String(sc.mapa || '').slice(0, 80),
    resumen: p.resumen || {}, firma: hashGm(json) + '-' + hashGm(imagen), actualizado: firebase.firestore.FieldValue.serverTimestamp(),
    ...(p.miniatura ? {miniatura: p.miniatura} : {}), ...(p.tarjeta ? {tarjeta: p.tarjeta} : {}),
  });
  lote.set(nuevo.collection('privado').doc('ficha'), {json});
  if(imagen) lote.set(nuevo.collection('privado').doc('imagen'), {dato: imagen});
  await lote.commit();
  return {id: nuevo.id, nombre: sc.nombre};
}
async function pegarTokenEn(c, celda, fichaId, nombre){
  await coleccionTokens().add({
    nombre: String(nombre || c.nombre).slice(0, 40), color: /^#[0-9a-fA-F]{6}$/.test(c.color) ? c.color : '#9A867E', tipo: c.tipo === 'creep' || !fichaId ? 'creep' : 'pj',
    duenoUid: fbUsuario.uid, col: celda.col, fila: celda.fila, rotacion: c.rotacion || 0, oculto: !!c.oculto,
    ...(fichaId ? {fichaId} : (c.imagen ? {imagen: c.imagen} : {})),
    creado: firebase.firestore.FieldValue.serverTimestamp(),
  });
}
function pegarToken(){
  const c = portapapelesToken;
  if(!c || !fbUsuario) return;
  const celda = punteroMundo ? mundoAHex(punteroMundo.x, punteroMundo.y) : null;
  if(!celda){ toast('Poné el mouse sobre la casilla donde lo querés pegar'); return; }
  const soloToken = async () => {
    try{ await pegarTokenEn(c, celda, '', c.nombre); toast(`📋 ${c.nombre} pegado (sin ficha)`); }
    catch(err){ console.error('No se pudo pegar el token:', err); toast('No se pudo pegar el token — mirá la consola'); }
  };
  if(c.tipo !== 'creep' || !c.fichaId || !creepsPub.has(c.fichaId)){ soloToken(); return; }
  AvisoCombate.mostrar({icono: '📋', titulo: `Pegar a ${c.nombre}`,
    texto: '¿Querés crear su ficha? Se duplica el creep en GM Tools (atributos, arma, equipo, habilidades, vida y estados) y el token nuevo queda vinculado a la copia.',
    botones: [
      {texto: '✔ Sí, crear su ficha', alClic: async () => {
        AvisoCombate.cerrar();
        try{
          const n = await duplicarCreepDesdeMapa(c.fichaId);
          await pegarTokenEn(c, celda, n.id, n.nombre);
          toast(`📋 ${n.nombre}: ficha duplicada en GM Tools y token pegado`);
        }catch(err){ console.error('No se pudo duplicar el creep:', err); toast('No se pudo duplicar el creep — mirá la consola'); }
      }},
      {texto: 'Solo el token', sec: true, detalle: 'un token sin ficha, como un NPC', alClic: () => { AvisoCombate.cerrar(); soloToken(); }},
      {texto: 'Cancelar', sec: true, alClic: () => AvisoCombate.cerrar()},
    ]});
}
