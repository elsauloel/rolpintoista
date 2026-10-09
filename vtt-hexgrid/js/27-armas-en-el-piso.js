/* ---------- 🗡️ El arma en el piso (2026-10-07, dueño) ----------
   Cuando a alguien lo desarman (Varita del manotazo; la Varita del desarme la hace volar 2 casillas en una dirección al azar), su arma
   queda en el mapa como un elemento `arma: true`, con el ícono 🗡️ y su nombre, que ven todos. La puede levantar CUALQUIERA que esté
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
    if(armaPropiaEnElPiso(t)) return {nota: 'su arma ya estaba en el piso'};   // (un creep no la pierde de sus datos: que no suelte otra copia)
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
  if(t && el.origen && distanciaHex(t, el.origen) > 1 && !(await AvisoCombate.preguntar(`${el.armaNombre || 'El arma'} está a ${distanciaHex(t, el.origen)} casillas: hay que estar al lado. ¿Levantarla igual?`, {icono: '🗡', titulo: 'Levantar el arma', si: 'Sí, levantarla'}))) return null;
  try{ await coleccionElementos().doc(elId).delete(); }
  catch(err){ console.error('No se pudo levantar el arma:', err); toast('No se pudo levantar el arma (¿faltan las reglas nuevas de Firebase?)'); return null; }
  let it = {};
  try{ it = JSON.parse(el.armaItem || '{}') || {}; }catch(e){}
  it = {...it, nombre: it.nombre || el.armaNombre || 'Arma', id: `arma-${Date.now().toString(36)}`, equipado: false};
  return {it, propia: !!t && el.armaDe === armaRefDe(t)};
}
// Se dibuja como una ficha REDONDA (dueño, 2026-10-07: lo que no es un personaje ni una criatura va redondo, para distinguirlo de los tokens
// hexagonales), con el 🗡️ adentro; su nombre sale en el cartel de arriba a la derecha al seleccionarla, como el de un token (js/10
// elementoQueEs). La dibuja js/05, con el resto de los elementos.
function armaDibujar(el, z){
  const p = hexCentro(el.origen.col, el.origen.fila), R = HEX * 0.62;
  ctx.save();
  ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(28,24,26,.92)'; ctx.fill();
  ctx.lineWidth = 3 / z; ctx.strokeStyle = '#C9C9C9'; ctx.stroke();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `700 ${R * 1.05}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", system-ui, sans-serif`;
  ctx.fillStyle = '#EDE3D2';   // (si el 🗡️ sale en blanco y negro, que se vea claro sobre el fondo oscuro)
  ctx.fillText(/"flecha"\s*:/.test(String(el.armaItem || '')) ? '🏹' : '🗡️', p.x, p.y + R * 0.06);   // una flecha especial que erró (js/33)
  ctx.restore();
}

// ---------- Levantarla: desde la Botonera de un personaje, de una invocación o desde las Acciones de un creep (1 No2) ----------
const tokenDePj = fichaId => [...tokens.values()].find(x => x.tipo === 'pj' && x.fichaId === fichaId) || null;
const tokenDeCreep = id => [...tokens.values()].find(x => x.tipo === 'creep' && x.fichaId === id) || null;
// Lo que la Botonera de ese token necesita saber: las armas al lado y si la suya está en el piso.
function armasOpciones(t){ return t ? {armasCerca: armasCercaDe(t), armaEnElPiso: armaPropiaEnElPiso(t)} : {}; }
/* Lo que se levanta y va en la mano (arma, escudo, orbe; 2026-10-08, dueño): con la mano libre se elige «Equiparlo» o «A la mochila»; con las
   manos ocupadas, «Reemplazar …» (lo que tenía va a la mochila) por 1 No2 más, o «A la mochila». Cerrar el cartel = a la mochila.
   → {destino: 'mano' | 'mochila', soltar: [ítems que dejan la mano]}. */
function levantadoElegir(S, it, quien){
  const manos = (S.inventario || []).filter(i => i && i.equipado && FichaCombate.esMano(i.tipoItem));
  const libre = !FichaEquipo.slotOcupado(S, it).ocupado;
  return new Promise(res => {
    let listo = false, comparando = false;
    const fin = v => { if(listo) return; listo = true; AvisoCombate.cerrar(); res(v); };
    const extra = Combatiente.COSTO_LEVANTAR_ARMA;
    const dibujar = () => {
      const botones = libre ? [{texto: '✋ Equiparlo', detalle: 'lo tenés en la mano enseguida', alClic: () => fin({destino: 'mano', soltar: []})}]
        : (/2m$/.test(it.tipoItem) ? [{texto: `🔁 Reemplazar lo que tenés en las manos (+${fmt(extra)} No2)`, detalle: manos.map(m => m.nombre).join(' y ') + ' → a la mochila', alClic: () => fin({destino: 'mano', soltar: manos})}]
          : manos.map(m => ({texto: `🔁 Reemplazar ${m.nombre} (+${fmt(extra)} No2)`, detalle: `${m.nombre} → a la mochila`, alClic: () => fin({destino: 'mano', soltar: [m]})})));
      // Comparar con lo que tiene en la mano (dueño, 2026-10-08): en el mismo cartel, cada número antes → después.
      if(manos.length && !comparando) botones.push({texto: '⚖ Comparar con lo que tenés en la mano', sec: true, alClic: () => { comparando = true; dibujar(); }});
      botones.push({texto: '🎒 A la mochila', sec: true, alClic: () => fin({destino: 'mochila', soltar: []})});
      const pasos = [{titulo: libre ? 'Tenés una mano libre' : 'Tenés las manos ocupadas', texto: libre ? '¿Lo equipás o lo guardás?' : `¿Lo cambiás por lo que tenés en la mano (cuesta ${fmt(extra)} No2 más) o lo guardás?`}];
      if(comparando) manos.forEach(m => pasos.push({titulo: `${it.nombre} contra ${m.nombre}`, texto: compararTexto(it, m)}));
      AvisoCombate.mostrar({clave: 'levantar', icono: '🗡️', titulo: `${quien} levanta ${it.nombre}`, pasos, botones, alCerrar: () => fin({destino: 'mochila', soltar: []})});
    };
    dibujar();
  });
}
// «Daño promedio 4,5 → 5,5 (+1) · PdG 0 → 1 (+1)…»: lo nuevo contra lo que tiene en la mano (los números de FichaEquipo.statsComparables).
function compararTexto(nuevo, viejo){
  const a = FichaEquipo.statsComparables(viejo), b = FichaEquipo.statsComparables(nuevo);
  const claves = [...new Set([...Object.keys(a), ...Object.keys(b)])];
  if(!claves.length) return 'Ninguno de los dos tiene números para comparar.';
  const etq = k => (FichaEquipo.STAT_COMPARABLE_LABEL || {})[k] || (FichaCalculo.STAT_LABEL || {})[k] || k;
  return claves.map(k => {
    const x = num(a[k]), y = num(b[k]), d = Math.round((y - x) * 10) / 10;
    return `${etq(k)}: ${fmt(x)} → ${fmt(y)}${d ? ` (${d > 0 ? '+' : ''}${fmt(d)})` : ' (igual)'}`;
  }).join(' · ');
}
async function bnLevantarArma(elId){
  if(!bn || !bn.S || !bnPuedeGuardar()) return;
  const S = bn.S, t = tokenDePj(bn.fichaId), costo = Combatiente.COSTO_LEVANTAR_ARMA;
  const quien = ((S.meta && S.meta.nombre) || 'Alguien').trim();
  const cobrar = (n, que) => { S.nitros = num(S.nitros) - (n > num(S.nitros) ? FichaAcciones.gastoNitrosForzado(S, n, que) : n); };
  const seguir = async () => {
    const x = await armaTomar(elId, t);
    if(!x) return;
    cobrar(costo, 'levantó un arma');
    const des = (S.efectos || []).find(Combatiente.esDesarmado);
    if(des) S.efectos = S.efectos.filter(e => e !== des);
    // Desarmado y con la mano libre: vuelve a tenerla en la mano, sin preguntar. Si no, se elige (si va en la mano).
    let r = {destino: 'mochila', soltar: []};
    if(FichaCombate.esMano(x.it.tipoItem)){
      r = des && !FichaEquipo.slotOcupado(S, x.it).ocupado ? {destino: 'mano', soltar: []} : await levantadoElegir(S, x.it, quien);
    }
    if(r.soltar.length){
      cobrar(costo, 'cambió lo que tenía en la mano');
      const ids = new Set(r.soltar.map(i => i.id));
      S.inventario = (S.inventario || []).map(i => ids.has(i.id) ? {...i, equipado: false} : i);
    }
    x.it.equipado = r.destino === 'mano';
    S.inventario = [...(S.inventario || []), x.it];
    bnUi(FichaGuardado.partes(S)).cambio();
    mesaLinea(`🗡️ ${quien} levantó ${x.it.nombre}${r.destino === 'mano' ? ' y lo tiene en la mano' : ' (a la mochila)'}${r.soltar.length ? ` · guardó ${r.soltar.map(i => i.nombre).join(' y ')} (+${fmt(costo)} No2)` : ''}`);
  };
  if(num(S.nitros) < costo) bnSinNitros(costo, 'levantar el arma', () => seguir()); else seguir();
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
  mesaLinea(`🗡️ ${inv.nombre} levantó ${x.it.nombre}`);
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
  mesaLinea(`🗡️ ${sc0.nombre} levantó ${x.it.nombre}`);
}
