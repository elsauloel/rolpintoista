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
    if(!el.arma || !el.origen || !puedeLevantarla(el, t)) return;
    if(distanciaHex(t, el.origen) <= 1) out.push({id, nombre: el.armaNombre || 'Arma', propia: el.armaDe === ref});
  });
  return out;
}
/* 🔒 Por ahora, un arma que se cayó la levanta solo su dueño (dueño, 2026-10-22: «una regla implícita de que solamente el dueño del arma lo puede
   levantar por ahora, y evitamos narrativamente»). Hasta que los creeps tengan inventario (docs/pendientes.md): hoy el arma de un creep no es un
   ítem, y si otro se la llevaba el creep la seguía teniendo. Una flecha que erró es de quien la tiró (js/33); lo que no tiene dueño conocido (armas viejas en el piso) lo levanta cualquiera. */
const puedeLevantarla = (el, t) => !el.armaDe || (!!t && el.armaDe === armaRefDe(t));
// ¿Su arma está en el piso, en algún lado del mapa? (la Botonera no le ofrece «levantarla» sin ir a buscarla)
function armaPropiaEnElPiso(t){
  const ref = armaRefDe(t);
  if(!ref) return false;
  for(const el of elementos.values()) if(el.arma && el.armaDe === ref) return true;
  return false;
}
// El arma de un creep o de una invocación, como ítem (la del catálogo si se llama igual; si no, armada con sus datos).
function armaComoItem(c, dueno){
  const a = Combatiente.armaEnMano(c);   // 🗡 la puerta única (docs/plan-inventario-creeps.md)
  const cat = typeof CATALOGO_BASE !== 'undefined' ? CATALOGO_BASE.find(i => i && i.nombre === a.nombre && /^arma_/.test(i.tipoItem || '')) : null;
  if(cat) return structuredClone(cat);
  return {nombre: String(a.nombre || 'Arma'), tipoItem: 'arma_1m', tier: 'Común', peso: 1, ranuras: 1, precioCompra: 0, consumible: false, curahp: 0,
    tipoDado: a.tipoDado, danoFijo: a.danoFijo, armaDeRango: a.armaDeRango, mods: structuredClone(a.mods),
    detalle: `El arma que se le cayó a ${dueno}.`};
}
// La deja en el piso (lo hace el mapa del GM, al aplicar el Desarmado del duelo). `vuela`: cuántas casillas sale volando (1d6 = la dirección).
// `o` (2026-10-21, 🤺 Desarmar, js/62): `celda` = dónde cae (la eligió la ruleta); `itemId` / `itemNombre` = lo que tenía en la mano en ese cruce (el
// arma o el escudo con que paró). Lo natural no se cae. → {nota, cayo, escudo}.
async function armaSoltar(t, vuela, o){
  o = o || {};
  const quien = nombreDe(t);
  const esInv = t.tipo === 'pj' && String(t.fichaId).includes(SEP_INVOCACION);
  let item = null, piezaCreep = null;
  if(t.tipo === 'creep' || esInv){
    const c = t.tipo === 'creep' ? creepPrivadoDe(t.fichaId) : await invDeToken(t);
    if(!c) return {manual: true, nota: 'no se pudo leer su arma: ponela en el piso a mano'};
    const nom = String(o.itemNombre || '').trim();
    const pieza = t.tipo === 'creep' && nom && nom !== Combatiente.armaEnMano(c).nombre ? (c.equipo || []).find(e => e && e.nombre === nom) : null;   // paró con un escudo
    if(pieza){
      if(pieza.natural) return {nota: `${nom} es natural: no se le cae`};
      piezaCreep = pieza; item = structuredClone(pieza);
    }else{
      if(Combatiente.armaEnMano(c).natural || !String(Combatiente.armaEnMano(c).nombre || '').trim()) return {nota: 'su arma es natural: no se le cae'};
      if(armaPropiaEnElPiso(t)) return {nota: 'su arma ya estaba en el piso'};   // (un creep no la pierde de sus datos: que no suelte otra copia)
      item = armaComoItem(c, quien);
    }
  }else{
    const p = await fbDb.doc(fbRutaCampana(`fichas/${t.fichaId}/partes/inventario`)).get();
    const inv = p.exists ? (JSON.parse(p.data().json || '{}').inventario || []) : [];
    item = (o.itemId && inv.find(x => x && x.id === o.itemId)) || (o.itemNombre && inv.find(x => x && x.equipado && x.nombre === o.itemNombre))
      || inv.find(x => x && x.equipado && (x.tipoItem === 'arma_1m' || x.tipoItem === 'arma_2m')) || null;
    if(!item) return {nota: 'no tenía un arma en la mano'};
  }
  // Dónde cae: la casilla que le dieron, en su casilla, o `vuela` casillas hacia un lado al azar (1d6).
  let celda = o.celda ? {col: o.celda.col, fila: o.celda.fila} : {col: t.col, fila: t.fila}, dir = 0;
  if(!o.celda && num(vuela) > 0){
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
  // El escudo de un creep (Desarmar): sale de su equipo.
  if(piezaCreep){
    try{ await modificarCreep(String(t.fichaId), c => { const i = (c.equipo || []).findIndex(e => e && (e.id ? e.id === piezaCreep.id : e.nombre === piezaCreep.nombre)); if(i >= 0) c.equipo.splice(i, 1); return {}; }); }
    catch(err){ console.error('No se pudo sacar el escudo del creep:', err); }
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
  return {cayo: true, escudo: !!(typeof Combatiente !== 'undefined' && Combatiente.esEscudo(item)), nota: `se le cayó ${item.nombre}${o.celda ? ' lejos' : num(vuela) > 0 ? ` y voló ${Math.round(num(vuela))} casillas` : ''}`};
}
/* Levantar sin perder nada (dueño, 2026-10-22: el Caronero se perdió cuando la página se recargó en el medio). Antes el arma se borraba del piso
   primero y después se guardaba en quien la levantaba: si la página se cerraba entre una cosa y la otra, desaparecía. Ahora, en este orden:
   1) armaLeer: se lee del piso sin sacarla; 2) se guarda en quien la levanta (y se espera a que quede guardado); 3) armaQuitarDelPiso: recién ahí
   se saca, con una transacción que solo funciona si todavía está (si dos la agarran a la vez, gana uno; el otro deshace lo suyo). Si algo se corta
   entre 2 y 3, lo peor es que quede en los dos lados (el GM la borra del piso), nunca que se pierda. */
async function armaLeer(elId, t){   // → {it, propia} o null
  const el = elementos.get(elId);
  if(!el || !el.arma){ toast('Esa arma ya no está en el piso'); return null; }
  if(!puedeLevantarla(el, t)){ toast(`🔒 Por ahora, ${el.armaNombre || 'esa arma'} solo la puede levantar su dueño`); return null; }
  if(t && el.origen && distanciaHex(t, el.origen) > 1 && !(await AvisoCombate.preguntar(`${el.armaNombre || 'El arma'} está a ${distanciaHex(t, el.origen)} casillas: hay que estar al lado. ¿Levantarla igual?`, {icono: '🗡', titulo: 'Levantar el arma', si: 'Sí, levantarla'}))) return null;
  let it = {};
  try{ it = JSON.parse(el.armaItem || '{}') || {}; }catch(e){}
  it = {...it, nombre: it.nombre || el.armaNombre || 'Arma', id: `arma-${Date.now().toString(36)}`, equipado: false};
  return {it, propia: !!t && el.armaDe === armaRefDe(t)};
}
async function armaQuitarDelPiso(elId){   // → true si la sacó; false si ya no estaba (otro se la llevó antes) o no se pudo
  const ref = coleccionElementos().doc(elId);
  try{ return await fbDb.runTransaction(async tx => { const x = await tx.get(ref); if(!x.exists) return false; tx.delete(ref); return true; }); }
  catch(err){ console.error('No se pudo sacar el arma del piso:', err); return false; }
}
// Espera a que la Botonera haya guardado lo que cambió (hasta ~10 s). → true si quedó guardado.
async function bnEsperarGuardado(){
  if(!bn || !bn.sesion || typeof FichaSesion === 'undefined' || !FichaSesion.pendiente) return true;
  const f = bn.sesion, pend = () => FichaSesion.pendiente(f, () => FichaGuardado.partes(bn.S));
  for(let i = 0; i < 20 && pend(); i++) await new Promise(r => setTimeout(r, 500));
  return !pend();
}
// Se dibuja como una ficha REDONDA (dueño, 2026-10-07: lo que no es un personaje ni una criatura va redondo, para distinguirlo de los tokens
// hexagonales), con el 🗡️ adentro; su nombre sale en el cartel de arriba a la derecha al seleccionarla, como el de un token (js/10
// elementoQueEs). La dibuja js/05, con el resto de los elementos.
function armaDibujar(el, z){
  const p = hexCentro(el.origen.col, el.origen.fila), R = HEX * 0.62;
  ctx.save();
  // ✨ Se puede levantar (dueño, 2026-10-22): un anillo dorado que titila alrededor, sin apretar nada (levantadorPara, abajo).
  if(levantadorPara(el)){
    const f = 0.5 + 0.5 * Math.sin(performance.now() / 260);
    ctx.beginPath(); ctx.arc(p.x, p.y, R * (1.22 + 0.12 * f), 0, Math.PI * 2);
    ctx.lineWidth = (3 + 3 * f) / z; ctx.strokeStyle = `rgba(255,210,90,${0.45 + 0.5 * f})`;
    ctx.shadowColor = 'rgba(255,210,90,.9)'; ctx.shadowBlur = 18 * f;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(28,24,26,.92)'; ctx.fill();
  ctx.lineWidth = 3 / z; ctx.strokeStyle = '#C9C9C9'; ctx.stroke();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `700 ${R * 1.05}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", system-ui, sans-serif`;
  ctx.fillStyle = '#EDE3D2';   // (si el 🗡️ sale en blanco y negro, que se vea claro sobre el fondo oscuro)
  ctx.fillText(/"flecha"\s*:/.test(String(el.armaItem || '')) ? '🏹' : '🗡️', p.x, p.y + R * 0.06);   // una flecha especial que erró (js/33)
  ctx.restore();
}

/* ---------- ✨ Levantar con un clic en el mapa (dueño, 2026-10-22) ----------
   «Si estás en tu turno y te parás en un casillero adyacente a un arma o algún objeto que puedas levantar, debería aparecer titilando… haciendo
   clic sobre el objeto, el mapa te dice: este objeto está en el suelo, ¿querés levantarlo? Sí, no.» Vale para el personaje que maneja esta
   pantalla (su dueño o quien tiene 🎮 su control), parado encima o al lado; en combate, solo en su turno (fuera de combate, siempre). Levantarlo
   es lo mismo que desde la Botonera (bnLevantarArma: 1 No2; si va en la mano y hay una libre, «¿Querés dejarlo equipado?»).
   Los creeps también (dueño, 2026-10-22, «sumalo»): en la pantalla del GM, el arma de un creep titila cuando ese creep está al lado (en combate,
   en su turno) y el clic la levanta como el botón de sus Acciones (acLevantarArmaDe: 1 No2, vuelve a tenerla y se le va el Desarmado). */
function levantadorPara(el){   // → {id, t} del personaje mío (o del creep, si soy el GM) que lo puede levantar ahora, o null
  if(!el || !el.arma || !el.origen || typeof puedoMover !== 'function') return null;
  for(const [id, t] of tokens){
    const esPj = t && t.tipo === 'pj' && !String(t.fichaId || '').includes(SEP_INVOCACION) && puedoMover(t);
    const esCreep = t && t.tipo === 'creep' && soyGM && t.fichaId && !((typeof creepPrivadoDe === 'function' && creepPrivadoDe(t.fichaId)) || {}).muerto;
    if(!esPj && !esCreep) continue;
    if(distanciaHex(t, el.origen) > 1 || !puedeLevantarla(el, t)) continue;   // 🔒 solo su dueño, por ahora
    if(modoMapa === 'combate' && typeof esSuTurno === 'function' && esSuTurno(id) === false) continue;
    return {id, t};
  }
  return null;
}
// ¿Hay algo titilando? (js/05 sigue dibujando mientras sea así)
function armasTitilan(){
  for(const el of elementos.values()) if(el.arma && levantadorPara(el)) return true;
  return false;
}
// El clic en el mapa (js/06): si en esa casilla hay algo que este personaje puede levantar, pregunta y lo levanta. → true si era eso.
function armaClicLevantar(m){
  const c = mundoAHex(m.x, m.y);
  const e = [...elementos.entries()].find(([, x]) => x.arma && x.origen && x.origen.col === c.col && x.origen.fila === c.fila && levantadorPara(x));
  if(!e) return false;
  armaLevantarDesdeMapa(e[0]);
  return true;
}
async function armaLevantarDesdeMapa(elId){
  const el = elementos.get(elId), quien = el && levantadorPara(el);
  if(!quien) return;
  const nombre = el.armaNombre || 'Este objeto';
  const si = await AvisoCombate.preguntar(`${nombre} está en el suelo.\n¿${quien.t.tipo === 'creep' ? `Lo levanta ${nombreDe(quien.t)}` : 'Querés levantarlo'}? (cuesta ${fmt(Combatiente.COSTO_LEVANTAR_ARMA)} No2)`,
    {icono: /"flecha"\s*:/.test(String(el.armaItem || '')) ? '🏹' : '🗡️', titulo: 'Levantar', si: 'Sí, levantarlo', no: 'No'});
  if(!si) return;
  if(quien.t.tipo === 'creep'){ await acLevantarArmaDe(quien.t.fichaId, elId); return; }   // 👹 un creep (el GM)
  // La sesión del personaje (la de la Botonera nueva): si no está abierta, se abre escondida, solo para esto.
  const fichaId = quien.t.fichaId, visible = !!(bn && bn.host && !bn.host.hidden && bn.fichaId === fichaId);
  if(!(bn && bn.fichaId === fichaId && bn.S)){ await abrirBotoneraNueva(fichaId, ''); if(bn && !visible) bn.host.hidden = true; }
  if(!(await bnSesionLista(fichaId))){ toast('No se pudo leer el personaje'); return; }
  if(bn && !visible) bn.host.hidden = true;
  await bnLevantarArma(elId);
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
      const botones = libre ? [{texto: '✋ Sí, equiparlo', detalle: 'lo tenés en la mano enseguida', alClic: () => fin({destino: 'mano', soltar: []})}]
        : (/2m$/.test(it.tipoItem) ? [{texto: `🔁 Reemplazar lo que tenés en las manos (+${fmt(extra)} No2)`, detalle: manos.map(m => m.nombre).join(' y ') + ' → a la mochila', alClic: () => fin({destino: 'mano', soltar: manos})}]
          : manos.map(m => ({texto: `🔁 Reemplazar ${m.nombre} (+${fmt(extra)} No2)`, detalle: `${m.nombre} → a la mochila`, alClic: () => fin({destino: 'mano', soltar: [m]})})));
      // Comparar con lo que tiene en la mano (dueño, 2026-10-08): en el mismo cartel, cada número antes → después.
      if(manos.length && !comparando) botones.push({texto: '⚖ Comparar con lo que tenés en la mano', sec: true, alClic: () => { comparando = true; dibujar(); }});
      botones.push({texto: libre ? '🎒 No, a la mochila' : '🎒 A la mochila', sec: true, alClic: () => fin({destino: 'mochila', soltar: []})});
      const pasos = [{titulo: libre ? 'Tenés una mano libre' : 'Tenés las manos ocupadas', texto: libre ? '¿Querés dejarlo equipado?' : `¿Lo cambiás por lo que tenés en la mano (cuesta ${fmt(extra)} No2 más) o lo guardás?`}];
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
    const x = await armaLeer(elId, t);
    if(!x) return;
    // Lo de antes, por si otro se la lleva primero (se deshace todo).
    const antes = FichaGuardado.partes(S), respaldo = structuredClone({inventario: S.inventario || [], efectos: S.efectos || [], cinturon: S.cinturon || [], nitros: S.nitros});
    cobrar(costo, 'levantó un arma');
    const des = (S.efectos || []).find(Combatiente.esDesarmado);
    if(des) S.efectos = S.efectos.filter(e => e !== des);
    // Si va en la mano, se elige siempre (dueño, 2026-10-22: «si tenés una mano libre, te pregunta: ¿querés dejarlo equipado? Sí, no»; antes,
    // estando Desarmado y con la mano libre, volvía a la mano sin preguntar).
    let r = {destino: 'mochila', soltar: []};
    if(FichaCombate.esMano(x.it.tipoItem)) r = await levantadoElegir(S, x.it, quien);
    if(r.soltar.length){
      cobrar(costo, 'cambió lo que tenía en la mano');
      const ids = new Set(r.soltar.map(i => i.id));
      S.inventario = (S.inventario || []).map(i => ids.has(i.id) ? {...i, equipado: false} : i);
    }
    x.it.equipado = r.destino === 'mano';
    S.inventario = [...(S.inventario || []), x.it];
    // 🏹 Una flecha especial va derecho al carcaj si hay lugar (sin más costo que levantarla); si no, a la mochila.
    let alCarcaj = false;
    if(x.it.flecha && FichaEquipo.carcajDe(S)){
      const antes = FichaEquipo.flechasDelCarcaj(S).reduce((a, f) => a + num(f.unidades || 1), 0);
      FichaEquipo.alCarcaj(S, x.it.id, {toast: () => {}, cambio: () => {}, modoCombate: () => false, avisarSinNitros: () => {}});
      alCarcaj = FichaEquipo.flechasDelCarcaj(S).reduce((a, f) => a + num(f.unidades || 1), 0) > antes;
    }
    bnUi(antes).cambio();
    await bnEsperarGuardado();
    if(!(await armaQuitarDelPiso(elId))){   // se le adelantaron: vuelve todo como estaba
      Object.assign(S, structuredClone(respaldo));
      bnUi(FichaGuardado.partes(S)).cambio();
      toast(`Se te adelantaron: ${x.it.nombre} ya no está en el piso`);
      return;
    }
    mesaLinea(`${x.it.flecha ? '🏹' : '🗡️'} ${quien} levantó ${x.it.nombre}${r.destino === 'mano' ? ' y lo tiene en la mano' : alCarcaj ? ' (al carcaj)' : ' (a la mochila)'}${r.soltar.length ? ` · guardó ${r.soltar.map(i => i.nombre).join(' y ')} (+${fmt(costo)} No2)` : ''}`);
  };
  if(num(S.nitros) < costo) bnSinNitros(costo, 'levantar el arma', () => seguir()); else seguir();
}
async function bnInvLevantarArma(invId, elId){
  if(!bn || !bn.S || !bnPuedeGuardar()) return;
  const inv = (bn.S.invocaciones || []).find(x => x && x.id === invId);
  if(!inv) return;
  if(num(inv.nitros) < Combatiente.COSTO_LEVANTAR_ARMA){ toast(`${inv.nombre}: no le alcanzan los No2 — levantar el arma cuesta 1`); return; }
  const t = tokenDePj(bn.fichaId + SEP_INVOCACION + invId);
  const x = await armaLeer(elId, t);
  if(!x) return;
  const antes = FichaGuardado.partes(bn.S), respaldo = structuredClone({nitros: inv.nitros, estados: inv.estados || [], equipo: inv.equipo || []});
  inv.nitros = num(inv.nitros) - Combatiente.COSTO_LEVANTAR_ARMA;
  const des = (inv.estados || []).find(Combatiente.esDesarmado);
  if(des) inv.estados = inv.estados.filter(e => e !== des);
  if(!x.propia) inv.equipo = [...(inv.equipo || []), x.it];   // la suya ya la tenía (sus datos); la de otro, al equipo
  bnUi(antes).cambio();
  await bnEsperarGuardado();
  if(!(await armaQuitarDelPiso(elId))){   // se le adelantaron: vuelve todo como estaba
    Object.assign(inv, structuredClone(respaldo));
    bnUi(FichaGuardado.partes(bn.S)).cambio();
    toast(`Se te adelantaron: ${x.it.nombre} ya no está en el piso`);
    return;
  }
  mesaLinea(`🗡️ ${inv.nombre} levantó ${x.it.nombre}`);
}
async function acLevantarArma(elId){
  if(typeof ac === 'undefined' || !ac || !ac.creepId) return;
  await acLevantarArmaDe(ac.creepId, elId);
}
// Un creep levanta un arma del piso (desde sus Acciones o con un clic en el mapa): 1 No2; la suya vuelve a tenerla, la de otro va a su equipo.
async function acLevantarArmaDe(creepId, elId){
  const sc0 = typeof creepPrivadoDe === 'function' ? creepPrivadoDe(creepId) : null;
  if(!sc0) return;
  if(num(sc0.nitros) < Combatiente.COSTO_LEVANTAR_ARMA){ toast(`${sc0.nombre}: no le alcanzan los No2 — levantar el arma cuesta 1`); return; }
  const x = await armaLeer(elId, tokenDeCreep(creepId));
  if(!x) return;
  let respaldo = null;
  await acCambiarCreep(creepId, c => {
    respaldo = structuredClone({nitros: c.nitros, estados: c.estados || [], equipo: c.equipo || []});
    c.nitros = num(c.nitros) - Combatiente.COSTO_LEVANTAR_ARMA;
    const des = (c.estados || []).find(Combatiente.esDesarmado);
    if(des) c.estados = c.estados.filter(e => e !== des);
    if(!x.propia) c.equipo = [...(c.equipo || []), x.it];
    return {aviso: ''};
  });
  if(!(await armaQuitarDelPiso(elId))){   // se le adelantaron: vuelve todo como estaba
    if(respaldo) await acCambiarCreep(creepId, c => { Object.assign(c, structuredClone(respaldo)); return {aviso: ''}; });
    toast(`Se te adelantaron: ${x.it.nombre} ya no está en el piso`);
    return;
  }
  mesaLinea(`🗡️ ${sc0.nombre} levantó ${x.it.nombre}`, 'recordatorio', sc0.nombre);
  if(typeof ac !== 'undefined' && ac && ac.creepId === creepId && ac.host && !ac.host.hidden && typeof acDibujar === 'function') acDibujar();
}
