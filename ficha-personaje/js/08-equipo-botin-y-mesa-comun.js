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

/* ---------- 🤝 Pasarle cosas a otro personaje y 📦 el baúl común (2026-10-05, P157; reemplaza a la mesa común) ----------
   La regla y las ventanas viven en comun/intercambio.js (las mismas que usa el mapa); acá solo cómo se toca al personaje abierto. */
const intercambioHost = {
  maneja: id => !!(fichaVivo && fichaVivo.id === id && fichaVivo.cargada && botinPuedeTomar()),
  leer: id => (fichaVivo && fichaVivo.id === id && fichaVivo.cargada) ? S : null,
  con: async (id, fn) => {
    if(!intercambioHost.maneja(id)) return false;
    const hubo = await fn(S);
    if(hubo){
      $('#f-dde').value = fmt(S.meta.dde); $('#f-loot-normal').value = S.loot.normal; $('#f-loot-magico').value = S.loot.magico;
      renderLootEspecial(); renderInventario(); renderList('cinturon');
      if($('#scrim-equipo').classList.contains('open')) renderEquipo();
      refresh();
    }
    return hubo;
  },
  enCombate: () => enCombateAhora(),
  tienda: () => (tiendaCargada && $('#scrim-catalogo').classList.contains('open')) ? tiendaCargada : null,
  toast: t => toast(t),
  propias: () => fichaVivo ? [fichaVivo.id] : [],
};
function intercambioIniciar(){ Intercambio.iniciar(intercambioHost); }
$('#btn-pasar').onclick = () => { if(fichaVivo) Intercambio.abrirDar(fichaVivo.id); else toast('Abrí tu personaje primero'); };
$('#tienda-baul').onclick = () => { if(fichaVivo) Intercambio.abrirBaul(fichaVivo.id); };

$('#equipo-x').onclick = () => $('#scrim-equipo').classList.remove('open');
$('#scrim-equipo').addEventListener('mousedown', e => { if(e.target.id === 'scrim-equipo') $('#scrim-equipo').classList.remove('open'); });

