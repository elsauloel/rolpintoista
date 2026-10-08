/* ---------- 🗡 El arma en el piso (2026-10-07, dueño) ----------
   Cuando a alguien lo desarman (Varita del manotazo; la Varita del desarme la hace volar 2 casillas en una dirección al azar), su arma
   queda en el mapa como un elemento `arma: true`, con el ícono 🗡 y su nombre, que ven todos. La puede levantar CUALQUIERA que esté
   encima o al lado, por 1 No2, desde su Botonera: el que estaba Desarmado vuelve a tener un arma en la mano (la suya o la que levantó);
   el que no, se la guarda en la mochila. Un creep o una invocación no pierde su arma de verdad (no es un ítem): queda Desarmado, y su
   arma, hecha ítem, queda en el piso por si otro la levanta (si la levanta él mismo, vuelve a tenerla).
   El elemento lleva quién era el dueño (`armaDe` = "fichaId|tipo") y el ítem entero (`armaItem`, JSON). */
const armaRefDe = t => t && t.fichaId ? `${t.fichaId}|${t.tipo === 'creep' ? 'creep' : 'pj'}` : '';
// Las armas en el piso a 1 casilla o menos del token (o encima): [{id, nombre, propia}].
function armasCercaDe(t){
  if(!t) return [];
  const ref = armaRefDe(t), out = [];
  elementos.forEach((el, id) => {
    if(!el.arma || !el.origen) return;
    if(distanciaHex(t, el.origen) <= 1) out.push({id, nombre: el.armaNombre || 'Arma', propia: el.armaDe === ref});
  });
  return out;
}
// ¿Su arma está en el piso, en algún lado del mapa? (la Botonera no le ofrece «levantarla» sin ir a buscarla)
function armaPropiaEnElPiso(t){
  const ref = armaRefDe(t);
  if(!ref) return false;
  for(const el of elementos.values()) if(el.arma && el.armaDe === ref) return true;
  return false;
}
// El arma de un creep o de una invocación, como ítem (la del catálogo si se llama igual; si no, armada con sus datos).
function armaComoItem(c, dueno){
  const cat = typeof CATALOGO_BASE !== 'undefined' ? CATALOGO_BASE.find(i => i && i.nombre === c.armaNombre && /^arma_/.test(i.tipoItem || '')) : null;
  if(cat) return structuredClone(cat);
  return {nombre: String(c.armaNombre || 'Arma'), tipoItem: 'arma_1m', tier: 'Común', peso: 1, ranuras: 1, precioCompra: 0, consumible: false, curahp: 0,
    tipoDado: num(c.armaTipo) || 8, danoFijo: num(c.armaFijo), armaDeRango: !!c.armaDeRango, mods: structuredClone(c.armaMods || []),
    detalle: `El arma que se le cayó a ${dueno}.`};
}
// La deja en el piso (lo hace el mapa del GM, al aplicar el Desarmado del duelo). `vuela`: cuántas casillas sale volando (1d6 = la dirección).
async function armaSoltar(t, vuela){
  const quien = nombreDe(t);
  const esInv = t.tipo === 'pj' && String(t.fichaId).includes(SEP_INVOCACION);
  let item = null;
  if(t.tipo === 'creep' || esInv){
    const c = t.tipo === 'creep' ? creepPrivadoDe(t.fichaId) : await invDeToken(t);
    if(!c) return {manual: true, nota: 'no se pudo leer su arma: ponela en el piso a mano'};
    if(c.armaNatural || !String(c.armaNombre || '').trim()) return {nota: 'su arma es natural: no se le cae'};
    item = armaComoItem(c, quien);
  }else{
    const p = await fbDb.doc(fbRutaCampana(`fichas/${t.fichaId}/partes/inventario`)).get();
    const inv = p.exists ? (JSON.parse(p.data().json || '{}').inventario || []) : [];
    item = inv.find(x => x && x.equipado && (x.tipoItem === 'arma_1m' || x.tipoItem === 'arma_2m')) || null;
    if(!item) return {nota: 'no tenía un arma en la mano'};
  }
  // Dónde cae: en su casilla, o `vuela` casillas hacia un lado al azar (1d6).
  let celda = {col: t.col, fila: t.fila}, dir = 0;
  if(num(vuela) > 0){
    dir = Math.floor(Math.random() * 6);
    const c0 = hexACubo(celda), [dq, dr] = VECINO_LADO[dir];
    const q = c0.q + dq * Math.round(num(vuela)), r = c0.r + dr * Math.round(num(vuela));
    celda = {col: cuboACol(q, r), fila: cuboAFila(q, r)};
  }
  const limpio = {...item, equipado: false};
  delete limpio.enMesa; delete limpio.reservado; delete limpio.reservadoPara;
  let json = JSON.stringify(limpio);
  if(json.length > 6000){ delete limpio.descripcionNarrativa; delete limpio.imagen; json = JSON.stringify(limpio).slice(0, 6000); }
  try{
    await coleccionElementos().add({
      tipo: 'flor', origen: celda, celdas: [0, 0], rotacion: 0, color: '#C9C9C9', alfa: 0, solido: false, invisible: false,
      imagen: '', imgZoom: 1, imgDX: 0, imgDY: 0, fijado: true,
      arma: true, armaNombre: String(item.nombre || 'Arma').slice(0, 60), armaDe: armaRefDe(t), armaItem: json,
      duenoUid: fbUsuario.uid, creado: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }catch(err){
    console.error('No se pudo poner el arma en el piso:', err);
    return {manual: true, nota: `se le cayó ${item.nombre} (ponela en el piso a mano: ¿faltan las reglas nuevas de Firebase?)`};
  }
  // El personaje la pierde de verdad (sale de su inventario); recién ahora, para no perderla si falló lo de arriba.
  if(t.tipo === 'pj' && !esInv){
    const ref = fbDb.doc(fbRutaCampana(`fichas/${t.fichaId}/partes/inventario`));
    try{
      await fbDb.runTransaction(async tx => {
        const p = await tx.get(ref);
        if(!p.exists) return;
        const datos = JSON.parse(p.data().json || '{}');
        datos.inventario = (datos.inventario || []).filter(x => !(x && x.id === item.id));
        tx.set(ref, {json: JSON.stringify(datos), actualizado: firebase.firestore.FieldValue.serverTimestamp()});
      });
    }catch(err){ console.error('No se pudo sacar el arma del inventario:', err); }
  }
  return {nota: `se le cayó ${item.nombre}${num(vuela) > 0 ? ` y voló ${Math.round(num(vuela))} casillas` : ''}`};
}
// Quien la levanta: el elemento se borra primero (si dos la agarran a la vez, gana uno). → {it, propia} o null.
async function armaTomar(elId, t){
  const el = elementos.get(elId);
  if(!el || !el.arma){ toast('Esa arma ya no está en el piso'); return null; }
  if(t && el.origen && distanciaHex(t, el.origen) > 1 && !confirm(`${el.armaNombre || 'El arma'} está a ${distanciaHex(t, el.origen)} casillas: hay que estar al lado. ¿Levantarla igual?`)) return null;
  try{ await coleccionElementos().doc(elId).delete(); }
  catch(err){ console.error('No se pudo levantar el arma:', err); toast('No se pudo levantar el arma (¿faltan las reglas nuevas de Firebase?)'); return null; }
  let it = {};
  try{ it = JSON.parse(el.armaItem || '{}') || {}; }catch(e){}
  it = {...it, nombre: it.nombre || el.armaNombre || 'Arma', id: `arma-${Date.now().toString(36)}`, equipado: false};
  return {it, propia: !!t && el.armaDe === armaRefDe(t)};
}
// Se dibuja como una ficha REDONDA (dueño, 2026-10-07: lo que no es un personaje ni una criatura va redondo, para distinguirlo de los tokens
// hexagonales), con el 🗡 adentro y el nombre del arma debajo (los dibuja js/05, con el resto de los elementos).
function armaDibujar(el, z){
  const p = hexCentro(el.origen.col, el.origen.fila), R = HEX * 0.62;
  ctx.save();
  ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(28,24,26,.92)'; ctx.fill();
  ctx.lineWidth = 3 / z; ctx.strokeStyle = '#C9C9C9'; ctx.stroke();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `700 ${R * 1.05}px system-ui, sans-serif`;
  ctx.fillText('🗡', p.x, p.y + R * 0.04);
  const txt = String(el.armaNombre || 'Arma');
  ctx.font = `700 ${11 / z}px "Space Mono", monospace`;
  const w = ctx.measureText(txt).width + 8 / z, h = 15 / z, y = p.y + R + 3 / z;
  ctx.fillStyle = 'rgba(15,12,14,.85)'; ctx.fillRect(p.x - w / 2, y, w, h);
  ctx.fillStyle = '#EDE3D2'; ctx.fillText(txt, p.x, y + h / 2);
  ctx.restore();
}

// ---------- Levantarla: desde la Botonera de un personaje, de una invocación o desde las Acciones de un creep (1 No2) ----------
const tokenDePj = fichaId => [...tokens.values()].find(x => x.tipo === 'pj' && x.fichaId === fichaId) || null;
const tokenDeCreep = id => [...tokens.values()].find(x => x.tipo === 'creep' && x.fichaId === id) || null;
// Lo que la Botonera de ese token necesita saber: las armas al lado y si la suya está en el piso.
function armasOpciones(t){ return t ? {armasCerca: armasCercaDe(t), armaEnElPiso: armaPropiaEnElPiso(t)} : {}; }
async function bnLevantarArma(elId){
  if(!bn || !bn.S || !bnPuedeGuardar()) return;
  const S = bn.S, t = tokenDePj(bn.fichaId), costo = Combatiente.COSTO_LEVANTAR_ARMA;
  const seguir = async forzar => {
    const x = await armaTomar(elId, t);
    if(!x) return;
    const ui = bnUi(FichaGuardado.partes(S));
    S.nitros = num(S.nitros) - (forzar && costo > num(S.nitros) ? FichaAcciones.gastoNitrosForzado(S, costo, 'levantó un arma') : costo);
    const des = (S.efectos || []).find(Combatiente.esDesarmado);
    if(des){ S.efectos = S.efectos.filter(e => e !== des); x.it.equipado = true; }   // vuelve a tener un arma en la mano
    S.inventario = [...(S.inventario || []), x.it];
    ui.cambio();
    const quien = ((S.meta && S.meta.nombre) || 'Alguien').trim();
    mesaLinea(`🗡 ${quien} levantó ${x.it.nombre}${des ? ' y la tiene en la mano' : ' (a la mochila)'}`);
  };
  if(num(S.nitros) < costo) bnSinNitros(costo, 'levantar el arma', () => seguir(true)); else seguir(false);
}
async function bnInvLevantarArma(invId, elId){
  if(!bn || !bn.S || !bnPuedeGuardar()) return;
  const inv = (bn.S.invocaciones || []).find(x => x && x.id === invId);
  if(!inv) return;
  if(num(inv.nitros) < Combatiente.COSTO_LEVANTAR_ARMA){ toast(`${inv.nombre}: no le alcanzan los No2 — levantar el arma cuesta 1`); return; }
  const t = tokenDePj(bn.fichaId + SEP_INVOCACION + invId);
  const x = await armaTomar(elId, t);
  if(!x) return;
  const ui = bnUi(FichaGuardado.partes(bn.S));
  inv.nitros = num(inv.nitros) - Combatiente.COSTO_LEVANTAR_ARMA;
  const des = (inv.estados || []).find(Combatiente.esDesarmado);
  if(des) inv.estados = inv.estados.filter(e => e !== des);
  if(!x.propia) inv.equipo = [...(inv.equipo || []), x.it];   // la suya ya la tenía (sus datos); la de otro, al equipo
  ui.cambio();
  mesaLinea(`🗡 ${inv.nombre} levantó ${x.it.nombre}`);
}
async function acLevantarArma(elId){
  const sc0 = typeof acCreep === 'function' ? acCreep() : null;
  if(!sc0) return;
  if(num(sc0.nitros) < Combatiente.COSTO_LEVANTAR_ARMA){ toast(`${sc0.nombre}: no le alcanzan los No2 — levantar el arma cuesta 1`); return; }
  const x = await armaTomar(elId, tokenDeCreep(ac.creepId));
  if(!x) return;
  await acCambiar(c => {
    c.nitros = num(c.nitros) - Combatiente.COSTO_LEVANTAR_ARMA;
    const des = (c.estados || []).find(Combatiente.esDesarmado);
    if(des) c.estados = c.estados.filter(e => e !== des);
    if(!x.propia) c.equipo = [...(c.equipo || []), x.it];
    return {aviso: ''};
  });
  mesaLinea(`🗡 ${sc0.nombre} levantó ${x.it.nombre}`);
}
