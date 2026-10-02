// js/08-equipo-botin-y-mesa-comun.js — tramo 8 de 14 del script de ficha.html (paso 5, nivel A: mismo código, en el mismo orden).
/* ---------- Equipo y mochila (panel del mapa, 🛡 en el token propio) ----------
   Dos columnas: lo equipado, slot por slot, y lo equipable de la mochila.
   Los botones Sacar / Equipar son los mismos data-toggle de la lista de
   inventario (si el slot está lleno abre Reemplazar/Comparar). El mapa lo
   pide con el mensaje 'abrir-equipo' (ver MODO_BOTONERA). */
// Lo que se ve y la regla viven en comun/ficha-equipo.js (hoja de ruta A4, 2026-10-02): el mapa muestra la misma ventana.
function renderEquipo(){ $('#equipo-body').innerHTML = FichaEquipo.html(S, {lupa: true}); }
/* ---------- Ficha liviana dentro del mapa (2026-09-26, pedido del dueño) ----------
   El 📜 del token propio abre este menú: un resumen chico (Nivel, Despojos, DDE y Defensa, cada uno con su descripción al pasar el mouse; la vida, el SP y los No2 ya se
   ven en los circulitos del token) y un botón por módulo. Cada módulo se abre en su propia ventana encima del menú (las mismas ventanas de siempre); al cerrarla se vuelve
   al menú. «Ver ficha completa» la abre en otra pestaña. */
function fichaMapaAbrir(){
  document.querySelectorAll('.scrim.open').forEach(s => s.classList.remove('open'));
  modoBotoneraInv = '';
  const c = compute();
  const esp = (S.loot.especial || []).reduce((a, l) => a + num(l.cantidad), 0);
  const caja = (etq, valor, tip) => `<div title="${esc(tip)}" style="border:1px solid var(--line);border-radius:6px;padding:7px 10px;cursor:help"><div class="hint" style="margin:0">${etq}</div><div style="font-size:18px;font-weight:700">${valor}</div></div>`;
  $('#fm-titulo').textContent = ((S.meta && S.meta.nombre) ? S.meta.nombre : 'Mi ficha') + ' · Nivel ' + fmt(num(S.meta.nivel) || 1);
  $('#fm-resumen').innerHTML =
    caja('Defensa', Number.isNaN(c.final.def) ? '?' : fmt(c.final.def), 'Cuánto daño te restan las armaduras en cada golpe que recibís. Los golpes críticos la ignoran. Se calcula con todo lo que llevás equipado (y baja con la Armadura rota de cada pieza).') +
    caja('DDE', fmt(num(S.meta.dde)), 'Tu dinero (DDE): sirve para comprar en las tiendas y es lo que cobrás al vender ítems y despojos.') +
    caja('Despojos', `${fmt(num(S.loot.normal))} · ${fmt(num(S.loot.magico))} · ${fmt(esp)}`, 'Materiales que soltaron los rivales: normales · mágicos · especiales. Las tiendas los compran (1 DDE cada normal) y sirven para reparar con talentos.');
  const hayBotin = (typeof combatePublicado === 'function') && (combatePublicado() || (combateActual && (combateActual.jugadores || []).length));
  const boton = (id, txt, tip) => `<button type="button" class="btn" data-fm="${id}" title="${esc(tip)}" style="padding:10px">${txt}</button>`;
  $('#fm-botones').innerHTML =
    boton('stats', '📊 Stats', 'Tus atributos y stats: se pueden modificar desde acá.') +
    boton('habilidades', '✨ Habilidades', 'Todas tus habilidades, para verlas y ejecutarlas.') +
    (tiendaAbiertaAhora ? boton('tienda', '🏪 Tienda', 'La tienda que publicó el GM: comprar, vender y reparar.') : '') +
    (hayBotin ? boton('botin', '🎁 Botín', 'El botín del último combate.') : '') +
    boton('completa', '📜 Ver ficha completa', 'Abre tu ficha completa en otra pestaña.');
  $('#scrim-ficha-mapa').classList.add('open');
  botoneraAvisarMapa('botonera-lista');
}
$('#fm-x').onclick = () => $('#scrim-ficha-mapa').classList.remove('open');
$('#stats-mapa-x').onclick = () => $('#scrim-stats-mapa').classList.remove('open');
$('#fm-botones').addEventListener('click', e => {
  const b = e.target.closest('[data-fm]');
  if(!b) return;
  const m = b.dataset.fm;
  if(m === 'stats'){ renderAttrs(); $('#scrim-stats-mapa').classList.add('open'); }
  else if(m === 'habilidades'){ renderTodasHabilidades(); $('#scrim-todas-habilidades').classList.add('open'); }
  else if(m === 'tienda'){ abrirVendedor(); }
  else if(m === 'botin'){ botinLootCuerpo(); $('#scrim-botin-loot').classList.add('open'); }
  else if(m === 'completa'){ window.open(location.origin + location.pathname + '?partida=' + encodeURIComponent(FB_CAMPANA) + '#' + encodeURIComponent(fichaVivo.id), '_blank', 'noopener'); }
});

function equipoModoAbrir(){
  document.querySelectorAll('.scrim.open').forEach(s => s.classList.remove('open'));
  modoBotoneraInv = '';
  renderEquipo();
  $('#scrim-equipo').classList.add('open');
  botoneraAvisarMapa('botonera-lista');
}
// El mapa abre el botín del combate en este iframe (mensaje 'abrir-botin').
function botinModoAbrir(){
  if(!combatePublicado() && !(combateActual && (combateActual.jugadores || []).length)){ toast('No hay botín publicado'); botoneraAvisarMapa('botonera-cerrada'); return; }
  document.querySelectorAll('.scrim.open').forEach(s => s.classList.remove('open'));
  botinLootCuerpo();
  $('#scrim-botin-loot').classList.add('open');
  botoneraAvisarMapa('botonera-lista');
}
// Desde el dock de la ficha: el mismo panel que abre el 🛡 del token en el mapa.
$('#btn-equipo').onclick = () => { renderEquipo(); $('#scrim-equipo').classList.add('open'); };

/* ---------- Botín del combate (lo que soltaron los creeps) ----------
   El GM publica un doc por ítem en campanas/<id>/botin ({nombre, json con la plantilla, precioCompra, despojos, tomadoPor}).
   Acá se lista lo que nadie tomó todavía: "Sumar a la mochila" lo reclama con una transacción (el primero se lo lleva) y lo
   agrega a la mochila; si la mochila está llena no entra. Lo que sobra, el GM lo convierte en despojos ("Despojar"). */
let botinLoot = [];   // [{docId, nombre, item, despojos, origen}]
/* Estado del combate (campanas/<id>/combate/actual): {numero, estado: 'publicado' | 'cerrado', jugadores: [{fichaId, nombre, estado, xp, dde}]}.
   Un combate NUEVO abre solo la ventana "Batalla terminada" (dentro del mapa la abre el mapa); el botón 🎁 del dock solo se habilita con el botín
   publicado; cuando el GM lo cierra (convierte en despojos lo que nadie tomó) la ventana se cierra y el botón se apaga. */
let combateActual = null, combatePrimero = true, combateNumeroVisto = null;
function combateEscuchar(){
  if(!fbUsuario) return;
  fbDb.doc(fbRutaCampana('combate/actual')).onSnapshot(snap => {
    const d = snap.exists ? snap.data() : null;
    const nuevo = !combatePrimero && !!d && d.numero !== combateNumeroVisto;
    const cerrada = !!combateActual && combateActual.estado === 'publicado' && !!d && d.estado !== 'publicado';
    combatePrimero = false;
    combateActual = d;
    if(d) combateNumeroVisto = d.numero;
    botinLootRender();
    const abierta = $('#scrim-botin-loot').classList.contains('open');
    if(nuevo && !document.documentElement.classList.contains('modo-botonera') && botinPuedeTomar()){
      toast('⚔ Batalla terminada');
      botinLootCuerpo();
      $('#scrim-botin-loot').classList.add('open');
    }else if(cerrada && abierta){
      $('#scrim-botin-loot').classList.remove('open');
      toast('El GM cerró el botín: lo que nadie tomó se convirtió en despojos');
    }
  }, err => console.error('Error escuchando el fin del combate:', err));
}
const combatePublicado = () => !!(combateActual && combateActual.estado === 'publicado');
function botinLootEscuchar(){
  if(!fbUsuario) return;
  fbDb.collection(fbRutaCampana('botin')).onSnapshot(snap => {
    botinLoot = FichaBotin.loot(snap);   // comun/ficha-botin.js (A5)
    botinLootRender();
  }, err => console.error('Error escuchando el botín:', err));
}
function botinItemPorId(id){
  const b = botinLoot.find(x => x.item.id === id);
  return b ? b.item : null;
}
function botinPuedeTomar(){
  const f = fichaVivo;
  return !!(f && f.cargada && !f.soloLectura && !f.editaGM);
}
function mochilaUsada(){ return FichaEquipo.mochilaUsada(S); }   // comun/ficha-equipo.js
const botinTextoItem = item => FichaBotin.textoItem(item);   // comun/ficha-botin.js (A5)
function botinLootRender(){
  const btn = $('#btn-botin-loot');
  if(btn){
    btn.disabled = !combatePublicado();   // solo con el botín publicado
    $('#botin-loot-n').textContent = combatePublicado() && botinLoot.length ? `(${botinLoot.length})` : '';
  }
  if($('#scrim-botin-loot').classList.contains('open')) botinLootCuerpo();
}
// La ventana y «Sumar a la mochila»: comun/ficha-botin.js (A5, 2026-10-02; el mapa usa lo mismo).
function botinLootCuerpo(){
  $('#botin-loot-body').innerHTML = FichaBotin.html(S, {combate: combateActual, loot: botinLoot, puede: botinPuedeTomar(), fichaId: fichaVivo && fichaVivo.id});
}
function botinTomar(docId){
  return FichaBotin.tomar(S, botinLoot.find(x => x.docId === docId), {toast: t => toast(t), puede: botinPuedeTomar, cambio: () => { renderInventario(); refresh(); }});
}
$('#btn-botin-loot').onclick = () => { botinLootCuerpo(); $('#scrim-botin-loot').classList.add('open'); };
$('#botin-loot-x').onclick = () => $('#scrim-botin-loot').classList.remove('open');
$('#botin-loot-body').addEventListener('click', e => {
  const t = e.target.closest('[data-botin-tomar]');
  if(t){ botinTomar(t.dataset.botinTomar); return; }
  const c = e.target.closest('[data-botin-comparar]');
  if(c){ abrirComparar(c.dataset.botinComparar); return; }
  if(e.target.closest('#botin-loot-mochila')){ $('#scrim-botin-loot').classList.remove('open'); renderEquipo(); $('#scrim-equipo').classList.add('open'); }
});

/* ---------- Mesa común (2026-09-25, pedido del dueño) ----------
   Cualquier jugador ofrece desde su mochila un ítem, DDE o despojos; cualquier otro jugador los ve y se los lleva. Vive en
   campanas/<id>/mesaComun (un doc por oferta: {tipo: 'item'|'dde'|'despojos', nombre, json (el ítem), itemId, fichaId, cantidad,
   despojo ('normal'|'magico'|'especial'), despojoNombre, ofrecidoPor, ofrecidoNombre, tomadoPor, tomadoNombre, creado}).
   - ÍTEM: no sale de la mochila del dueño (sigue ocupando sus ranuras, marcado `enMesa`) hasta que otro lo toma; ahí el dueño lo pierde solo.
   - DDE y despojos: se descuentan al ofrecerlos (quedan en la mesa) y se devuelven si se retira la oferta.
   - Se toma con una transacción (el primero se lo lleva), igual que el botín. */
let mesaComun = [], mesaReintentos = 0;
const mcQuien = () => String(S.meta.nombre || (fbMiembro && fbMiembro.nombre) || '').slice(0, 60);
function mesaComunEscuchar(){
  if(!fbUsuario) return;
  fbDb.collection(fbRutaCampana('mesaComun')).onSnapshot(snap => {
    mesaComun = snap.docs.map(d => {
      const x = d.data();
      let item = null;
      if(x.tipo === 'item'){ try{ item = JSON.parse(x.json || 'null'); }catch(e){} }
      return {docId: d.id, tipo: x.tipo || 'item', nombre: x.nombre || (item && item.nombre) || '', item, cantidad: num(x.cantidad), despojo: x.despojo || '', despojoNombre: x.despojoNombre || '',
        ofrecidoPor: x.ofrecidoPor || '', ofrecidoNombre: x.ofrecidoNombre || '', itemId: x.itemId || '', tomadoPor: x.tomadoPor || '', tomadoNombre: x.tomadoNombre || ''};
    });
    if(!snap.metadata.fromCache) mesaComunReconciliar();   // con solo la caché puede faltar lo publicado: no se toca nada
    mesaComunRender();
  }, err => console.error('Error escuchando la mesa común:', err));
}
const mesaComunLista = () => mesaComun.filter(x => !x.tomadoPor);
function mesaComunReconciliar(){
  if(!botinPuedeTomar()){ if(mesaReintentos++ < 30) setTimeout(mesaComunReconciliar, 1500); return; }
  let cambio = false;
  mesaComun.filter(x => x.ofrecidoPor === fbUsuario.uid && x.tomadoPor).forEach(x => {
    if(x.tipo === 'item'){
      const i = S.inventario.findIndex(v => v.id === x.itemId && v.enMesa === x.docId);
      if(i >= 0){ S.inventario.splice(i, 1); cambio = true; }
    }
    toast(`🤝 ${x.tomadoNombre || 'Alguien'} se llevó ${x.nombre} de la mesa común`);
    fbDb.collection(fbRutaCampana('mesaComun')).doc(x.docId).delete().catch(err => console.error('No se pudo limpiar la mesa común:', err));
  });
  S.inventario.forEach(i => { if(i.enMesa && !mesaComun.some(x => x.docId === i.enMesa)){ delete i.enMesa; cambio = true; } });   // la oferta ya no existe
  if(cambio){ renderInventario(); refresh(); }
}
async function mesaComunCrear(datos){
  const ref = fbDb.collection(fbRutaCampana('mesaComun')).doc();
  await ref.set({tomadoPor: '', tomadoNombre: '', fichaId: (fichaVivo && fichaVivo.id) || '', ofrecidoPor: fbUsuario.uid, ofrecidoNombre: mcQuien(), ...datos, creado: firebase.firestore.FieldValue.serverTimestamp()});
  return ref.id;
}
function mesaComunPuede(){
  if(botinPuedeTomar()) return true;
  toast('Abrí tu personaje (con permiso de edición) para usar la mesa común');
  return false;
}
async function mesaComunPublicarItem(id){
  if(!mesaComunPuede()) return;
  const it = S.inventario.find(x => x.id === id);
  if(!it || it.equipado || it.enMesa) return;
  const copia = structuredClone(it);
  delete copia.enMesa; delete copia.equipado;
  if(String(copia.imagen || '').length > 40000) copia.imagen = '';
  const json = JSON.stringify(copia);
  if(json.length > 200000){ toast('El ítem es demasiado grande para ofrecerlo'); return; }
  try{
    it.enMesa = await mesaComunCrear({tipo: 'item', nombre: String(it.nombre || '').slice(0, 80), json, itemId: it.id});
  }catch(err){
    console.error('No se pudo ofrecer el ítem:', err);
    toast('No se pudo ofrecer' + (err.code === 'permission-denied' ? ' (sin permiso: faltan pegar las reglas)' : ''));
    return;
  }
  renderInventario(); refresh();
  toast(`🤝 ${it.nombre} está en la mesa común (sigue en tu mochila hasta que alguien se lo lleve)`);
}
function mesaDespojoRef(tipo, nombre){
  if(tipo === 'normal') return {get: () => num(S.loot.normal), set: v => { S.loot.normal = v; $('#f-loot-normal').value = v; }};
  if(tipo === 'magico') return {get: () => num(S.loot.magico), set: v => { S.loot.magico = v; $('#f-loot-magico').value = v; }};
  const buscar = () => (S.loot.especial || []).find(l => String(l.nombre).trim().toLowerCase() === String(nombre).trim().toLowerCase());
  return {get: () => { const l = buscar(); return l ? num(l.cantidad) : 0; }, set: v => {
    let l = buscar();
    if(!l){ l = {id: uid(), nombre: String(nombre), cantidad: 0}; (S.loot.especial = S.loot.especial || []).push(l); }
    l.cantidad = v; renderLootEspecial();
  }};
}
async function mesaComunPublicarDde(n){
  if(!mesaComunPuede()) return;
  n = Math.floor(num(n) * 100) / 100;
  if(!(n > 0)) return;
  if(n > num(S.meta.dde)){ toast(`No tenés tantos DDE (tenés ${fmt(num(S.meta.dde))})`); return; }
  S.meta.dde = Math.round((num(S.meta.dde) - n) * 100) / 100; $('#f-dde').value = fmt(S.meta.dde); refresh();
  try{ await mesaComunCrear({tipo: 'dde', nombre: `${fmt(n)} DDE`, cantidad: n}); toast(`🤝 ${fmt(n)} DDE en la mesa común`); }
  catch(err){
    console.error('No se pudo ofrecer el oro:', err);
    S.meta.dde = Math.round((num(S.meta.dde) + n) * 100) / 100; $('#f-dde').value = fmt(S.meta.dde); refresh();
    toast('No se pudo ofrecer' + (err.code === 'permission-denied' ? ' (sin permiso: faltan pegar las reglas)' : ''));
  }
}
async function mesaComunPublicarDespojos(tipo, nombre, n){
  if(!mesaComunPuede()) return;
  n = Math.floor(num(n));
  if(!(n > 0)) return;
  const r = mesaDespojoRef(tipo, nombre);
  if(n > r.get()){ toast(`No tenés tantos despojos (tenés ${fmt(r.get())})`); return; }
  r.set(r.get() - n); refresh();
  const etiqueta = tipo === 'normal' ? 'normales' : tipo === 'magico' ? 'mágicos' : String(nombre);
  try{ await mesaComunCrear({tipo: 'despojos', nombre: `${fmt(n)} despojos ${etiqueta}`, cantidad: n, despojo: tipo, despojoNombre: tipo === 'especial' ? String(nombre).slice(0, 60) : ''}); toast(`🤝 ${fmt(n)} despojos en la mesa común`); }
  catch(err){
    console.error('No se pudieron ofrecer los despojos:', err);
    r.set(r.get() + n); refresh();
    toast('No se pudo ofrecer' + (err.code === 'permission-denied' ? ' (sin permiso: faltan pegar las reglas)' : ''));
  }
}
// Retira una oferta propia si nadie se la llevó todavía: el ítem se libera y el oro / los despojos vuelven.
async function mesaComunRetirar(docId){
  if(!mesaComunPuede()) return;
  const x = mesaComun.find(v => v.docId === docId);
  if(!x) return;
  const ref = fbDb.collection(fbRutaCampana('mesaComun')).doc(docId);
  let ok = false;
  try{
    ok = await fbDb.runTransaction(async tx => {
      const d = await tx.get(ref);
      if(!d.exists || d.data().tomadoPor) return false;
      tx.delete(ref);
      return true;
    });
  }catch(err){ console.error('No se pudo retirar:', err); toast('No se pudo retirar'); return; }
  if(!ok){ toast('Ya se lo llevaron'); return; }
  if(x.tipo === 'item'){ const i = S.inventario.find(v => v.id === x.itemId); if(i) delete i.enMesa; renderInventario(); }
  else if(x.tipo === 'dde'){ S.meta.dde = Math.round((num(S.meta.dde) + x.cantidad) * 100) / 100; $('#f-dde').value = fmt(S.meta.dde); }
  else{ const r = mesaDespojoRef(x.despojo, x.despojoNombre); r.set(r.get() + x.cantidad); }
  refresh();
  toast(`${x.nombre}: retirado de la mesa común`);
}
async function mesaComunTomar(docId){
  if(!mesaComunPuede()) return;
  const x = mesaComun.find(v => v.docId === docId);
  if(!x || x.tomadoPor) return;
  if(x.ofrecidoPor === fbUsuario.uid){ toast('Es tuyo: si no lo querés en la mesa, retiralo'); return; }
  if(x.tipo === 'item' && x.item){
    const cap = capMochilaEfectivo();
    if(cap > 0 && mochilaUsada() + ranurasDe(x.item) > cap){ toast(`Mochila llena: ${x.nombre} no entra`); return; }
  }
  const ref = fbDb.collection(fbRutaCampana('mesaComun')).doc(docId);
  let ok = false, quien = '';
  try{
    ok = await fbDb.runTransaction(async tx => {
      const d = await tx.get(ref);
      if(!d.exists) return false;
      if(d.data().tomadoPor){ quien = d.data().tomadoNombre || ''; return false; }
      tx.update(ref, {tomadoPor: fbUsuario.uid, tomadoNombre: mcQuien()});
      return true;
    });
  }catch(err){
    console.error('No se pudo tomar de la mesa común:', err);
    toast('No se pudo tomar' + (err.code === 'permission-denied' ? ' (sin permiso: faltan pegar las reglas)' : ''));
    return;
  }
  if(!ok){ toast(quien ? `${x.nombre} ya lo tomó ${quien}` : `${x.nombre} ya no está`); return; }
  if(x.tipo === 'item' && x.item){
    const nuevo = structuredClone(x.item);
    nuevo.id = uid(); nuevo.equipado = false; delete nuevo.enMesa;
    nuevo.unidades = num(nuevo.unidades) || 1; nuevo.ranuras = nuevo.ranuras ?? 1;
    S.inventario.push(nuevo);
    renderInventario();
  }else if(x.tipo === 'dde'){ S.meta.dde = Math.round((num(S.meta.dde) + x.cantidad) * 100) / 100; $('#f-dde').value = fmt(S.meta.dde); }
  else{ const r = mesaDespojoRef(x.despojo, x.despojoNombre); r.set(r.get() + x.cantidad); }
  refresh();
  toast(`🤝 ${x.nombre} → tuyo`);
  try{
    await fbDb.collection(fbRutaCampana('tiradas')).add({
      uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: String(S.meta.nombre || ''), origen: `🤝 ${S.meta.nombre || fbMiembro.nombre} tomó ${x.nombre} de la mesa común`, formula: '',
      rolls: [], mod: 0, total: 0, desde: 'recompensa', cuando: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }catch(err){ console.error('No se pudo escribir en la Mesa:', err); }
}
function mesaComunRender(){
  const n = mesaComunLista().length, b = $('#mesa-comun-n');
  if(b) b.textContent = n ? `(${n})` : '';
  if($('#scrim-mesa-comun').classList.contains('open')) mesaComunCuerpo();
}
function mesaComunCuerpo(){
  const cuerpo = $('#mesa-comun-body');
  const previo = {dde: (cuerpo.querySelector('#mesa-dde') || {}).value || '', dn: (cuerpo.querySelector('#mesa-desp-n') || {}).value || '', dt: (cuerpo.querySelector('#mesa-desp-tipo') || {}).value || 'normal'};
  const yo = fbUsuario && fbUsuario.uid, puede = botinPuedeTomar();
  const cap = capMochilaEfectivo(), usado = mochilaUsada();
  const lista = mesaComunLista();
  const linea = x => {
    const mio = x.ofrecidoPor === yo;
    const icono = x.tipo === 'item' ? '🎒' : x.tipo === 'dde' ? '💰' : '🦴';
    const texto = x.tipo === 'item' && x.item ? botinTextoItem(x.item) : '';
    return `<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--line, #444)">
      <div style="flex:1;min-width:0" title="${esc(texto)}">
        <div style="font-weight:600">${icono} ${esc(x.nombre)}${x.tipo === 'item' && x.item && num(x.item.unidades) > 1 ? ` <span class="hint">(×${fmt(num(x.item.unidades))})</span>` : ''}</div>
        <div class="hint">de ${mio ? 'vos' : esc(x.ofrecidoNombre || '—')}${texto ? ' · ' + esc(texto.slice(0, 140)) : ''}</div>
      </div>
      ${mio ? `<button type="button" class="mini danger" data-mesa-retirar="${esc(x.docId)}">Retirar</button>`
            : `<button type="button" class="btn primary" data-mesa-tomar="${esc(x.docId)}"${puede ? '' : ' disabled'}>Llevármelo</button>`}
    </div>`;
  };
  const especiales = (S.loot.especial || []).filter(l => num(l.cantidad) > 0);
  cuerpo.innerHTML = `
    <div class="hint" style="margin-bottom:10px">Lo que ofrecés no se pierde: los ítems siguen ocupando tu mochila hasta que otro jugador se los lleva; el oro y los despojos quedan acá y volvés a recibirlos si retirás la oferta.</div>
    <div class="hint" style="display:flex;justify-content:space-between;gap:8px;margin-bottom:8px"><span>Tu mochila: <b>${fmt(usado)}${cap > 0 ? ' / ' + fmt(cap) : ''}</b> ranuras</span><span>Tenés <b>${fmt(num(S.meta.dde))}</b> DDE</span></div>
    ${puede ? '' : '<div class="hint" style="margin-bottom:8px">Abrí tu personaje (con permiso de edición) para ofrecer o llevarte cosas.</div>'}
    <div class="hint" style="text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">En la mesa ahora</div>
    ${lista.length ? lista.map(linea).join('') : '<div class="hint" style="margin-bottom:8px">No hay nada ofrecido todavía.</div>'}
    <div class="hint" style="text-transform:uppercase;letter-spacing:.08em;margin:14px 0 6px">Ofrecer</div>
    <div class="hint" style="margin-bottom:8px">Un ítem: usá el botón <b>🤝 A la mesa</b> de su tarjeta en la mochila.</div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:8px">
      <span>💰 DDE</span><input id="mesa-dde" type="number" min="0" step="1" value="${esc(previo.dde)}" style="width:100px"><button type="button" class="mini" id="mesa-dde-pub"${puede ? '' : ' disabled'}>Ofrecer DDE</button>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">
      <span>🦴 Despojos</span>
      <select id="mesa-desp-tipo"><option value="normal">Normales (${fmt(num(S.loot.normal))})</option><option value="magico">Mágicos (${fmt(num(S.loot.magico))})</option>${especiales.map(l => `<option value="esp:${esc(l.nombre)}">${esc(l.nombre)} (${fmt(num(l.cantidad))})</option>`).join('')}</select>
      <input id="mesa-desp-n" type="number" min="0" step="1" value="${esc(previo.dn)}" style="width:100px"><button type="button" class="mini" id="mesa-desp-pub"${puede ? '' : ' disabled'}>Ofrecer despojos</button>
    </div>`;
  const sel = cuerpo.querySelector('#mesa-desp-tipo');
  if(sel && [...sel.options].some(o => o.value === previo.dt)) sel.value = previo.dt;
}
$('#btn-mesa-comun').onclick = () => { mesaComunCuerpo(); $('#scrim-mesa-comun').classList.add('open'); };
$('#mesa-comun-x').onclick = () => $('#scrim-mesa-comun').classList.remove('open');
$('#scrim-mesa-comun').addEventListener('mousedown', e => { if(e.target.id === 'scrim-mesa-comun') $('#scrim-mesa-comun').classList.remove('open'); });
$('#mesa-comun-body').addEventListener('click', e => {
  const t = e.target.closest('[data-mesa-tomar]');
  if(t){ mesaComunTomar(t.dataset.mesaTomar); return; }
  const r = e.target.closest('[data-mesa-retirar]');
  if(r){ mesaComunRetirar(r.dataset.mesaRetirar); return; }
  if(e.target.closest('#mesa-dde-pub')){ mesaComunPublicarDde($('#mesa-dde').value).then(() => { $('#mesa-dde').value = ''; }); return; }
  if(e.target.closest('#mesa-desp-pub')){
    const v = $('#mesa-desp-tipo').value;
    mesaComunPublicarDespojos(v.startsWith('esp:') ? 'especial' : v, v.startsWith('esp:') ? v.slice(4) : '', $('#mesa-desp-n').value).then(() => { $('#mesa-desp-n').value = ''; });
  }
});

$('#equipo-x').onclick = () => $('#scrim-equipo').classList.remove('open');
$('#scrim-equipo').addEventListener('mousedown', e => { if(e.target.id === 'scrim-equipo') $('#scrim-equipo').classList.remove('open'); });

