// js/18-ventanas-gm.js — tramo 18 del script de mapa.html: las ventanas del GM de fin de combate (2026-10-02, hoja de ruta A6a).
/* ---------- 🏁 Finalizar combate y 🎁 Despojos (GM), hechos por el mapa ----------
   Antes cargaban GM Tools en el marco (?modo=finalizar|botin). Ahora el mapa las muestra en un recuadro aislado (shadow DOM con el
   gm-tools.css de siempre, como las Acciones nuevas) con comun/combate-fin.js, el mismo código que usa GM Tools: el reporte «Batalla
   terminada» (XP, oro, quién cobra, despojos), 📢 Publicar despojos y el botín para despojar. Los creeps salen de su parte privada
   (solo cuentan los que tienen token en el mapa publicado); al publicar, se marcan recompensados con modificarCreep (GM Tools, abierto
   en otra pestaña, se entera por la firma). El Ver de un ítem, con comun/creep-lupa.js (verItem). */
const VG_PIEZAS = ['../comun/combate-fin.js?v=20261004rt'];
var vg = null;            // {host, raiz}
var vgRep = null;         // el estado del reporte (CombateFin.nuevo)
var vgCreeps = [];        // los creeps del reporte, con su parte privada
var vgBotin = null, vgBotinEscucha = null;
async function vgCargar(){
  await acCargarPiezas();   // creep-calculo / creep-lupa y el gm-tools.css (acCss)
  await bnCargarPiezas();   // el catálogo de fábrica y lo que subió el grupo (bnItemsSubidos)
  await cargarPiezas(VG_PIEZAS);
  if(!vg) vg = vgCrear();
  vg.raiz.querySelector('#vg-css').textContent = acCss + ' #vg-raiz{font-family:"Space Grotesk",system-ui,sans-serif;font-size:14px;line-height:1.45;color:var(--paper)}';
}
// El catálogo en la forma del equipo de un creep (la misma que CATALOGO_EQUIPO de GM Tools).
function vgCatalogo(){
  return ItemsSubidos.mezclar(structuredClone(CATALOGO_BASE), bnItemsSubidos).filter(it => it.tipoItem)
    .map(it => ({...CreepCalculo.itemParaCreep(it), ...(it._bib ? {_bib: it._bib} : {})}));
}
function vgCrear(){
  const host = document.createElement('div');
  host.id = 'ventanas-gm';
  host.hidden = true;
  document.body.appendChild(host);
  const raiz = host.attachShadow({mode: 'open'});
  raiz.innerHTML = `<style id="vg-css"></style><div id="vg-raiz">
    <div class="scrim" id="vg-finalizar"><div class="modal" style="max-width:980px;width:94vw">
      <header><h3>⚔ Batalla terminada <span class="hint" style="font-weight:400;font-size:13px">— revisá y ajustá lo que van a ver los jugadores; recién se les muestra cuando publicás</span></h3><button class="iconbtn" data-vg="cerrar-fin">Cerrar</button></header>
      <div class="body" id="vg-fin-cuerpo" style="display:flex;flex-direction:column;gap:16px"></div>
      <footer>
        <button class="btn ghost" data-vg="cerrar-fin">Cerrar</button>
        <button class="btn primary" data-vg="publicar" title="Publica lo que revisaste: carga la XP y el oro en las fichas y les abre a los jugadores, en el mapa, la ventana de la batalla para que elijan los despojos">📢 Publicar despojos</button>
      </footer>
    </div></div>
    <div class="scrim" id="vg-botin"><div class="modal" style="max-width:600px">
      <header><h3>⚔ Batalla terminada — despojos</h3><button class="iconbtn" data-vg="cerrar-botin">Cerrar</button></header>
      <div class="body" id="vg-botin-cuerpo"></div>
      <footer>
        <button class="btn ghost" data-vg="cerrar-botin">Cerrar</button>
        <button class="btn primary" data-vg="despojar" title="Último paso: convierte en despojos lo que nadie tomó, carga la XP, el oro y los despojos en las fichas y cierra el botín del todo">🏁 Cerrar botín y repartir XP y oro</button>
      </footer>
    </div></div>
    <div class="scrim" id="vg-veritem"><div class="modal">
      <header><h3 id="vg-veritem-titulo">Ítem</h3><button class="iconbtn" data-vg="cerrar-item">Cerrar</button></header>
      <div class="body" id="vg-veritem-cuerpo"></div>
    </div></div>
  </div>`;
  // Clic en el fondo de una ventana: se cierra esa (cerrar el botín no despoja).
  ['vg-finalizar', 'vg-botin', 'vg-veritem'].forEach(id => raiz.querySelector('#' + id).addEventListener('mousedown', e => { if(e.target.id === id) vgCerrar(id); }));
  raiz.addEventListener('change', e => {
    const t = e.composedPath()[0];
    if(vgRep && raiz.querySelector('#vg-fin-cuerpo').contains(t) && CombateFin.cambio(vgRep, t)) vgFinDibujar();
    else if(vgBotin && raiz.querySelector('#vg-botin-cuerpo').contains(t) && CombateFin.botinCambio(vgBotin, t)) vgBotinDibujar();
  });
  raiz.addEventListener('click', e => {
    const b = e.composedPath()[0].closest && e.composedPath()[0].closest('button');
    if(!b) return;
    const a = b.dataset.vg;
    if(a === 'cerrar-fin'){ vgCerrar('vg-finalizar'); return; }
    if(a === 'cerrar-botin'){ vgCerrar('vg-botin'); return; }
    if(a === 'cerrar-item'){ vgCerrar('vg-veritem'); return; }
    if(a === 'publicar'){ vgPublicar(); return; }
    if(a === 'despojar'){ vgDespojar(); return; }
    if(b.dataset.botinVer !== undefined){ const it = vgBotin && CombateFin.botinItem(vgBotin, b.dataset.botinVer); if(it) vgVerItem(it); return; }
    if(vgRep && raiz.querySelector('#vg-fin-cuerpo').contains(b)){
      const r = CombateFin.clic(vgRep, b, raiz.querySelector('#vg-fin-cuerpo'), vgCreeps, vgCatalogo());
      if(!r) return;
      e.preventDefault();   // el Ver de un ítem está adentro de su etiqueta: que no le cambie la casilla
      if(r === true) vgFinDibujar(); else if(r.ver) vgVerItem(r.ver); else if(r.toast) toast(r.toast);
    }
  });
  return {host, raiz};
}
function vgAbrir(id){ vg.host.hidden = false; vg.raiz.querySelector('#' + id).classList.add('open'); }
function vgCerrar(id){
  if(!vg) return;
  vg.raiz.querySelector('#' + id).classList.remove('open');
  if(id === 'vg-botin' && vgBotinEscucha){ vgBotinEscucha(); vgBotinEscucha = null; }
  if(!vg.raiz.querySelector('.scrim.open')) vg.host.hidden = true;
}
function vgVerItem(item){
  const v = CreepLupa.verItem(item);
  vg.raiz.querySelector('#vg-veritem-titulo').textContent = v.titulo;
  vg.raiz.querySelector('#vg-veritem-cuerpo').innerHTML = v.html;
  vgAbrir('vg-veritem');
}

/* --- 🏁 Finalizar combate --- */
async function abrirFinalizarMapa(){
  if(!soyGM) return;
  try{ await vgCargar(); }catch(err){ console.error(err); toast('No se pudo abrir el reporte del combate'); return; }
  vgRep = CombateFin.nuevo();
  vgCreeps = [];
  vgAbrir('vg-finalizar');
  vgFinDibujar();
  vgCargarJugadores();
  try{
    vgRep.enMapa = await CombateFin.creepsEnMapa();
    vgCreeps = await vgLeerCreeps([...vgRep.enMapa]);
  }catch(err){
    console.error('No se pudieron leer los creeps del mapa publicado:', err);
    vgRep.enMapa = new Set();
    toast('No se pudo leer el mapa publicado: no hay creeps para repartir');
  }
  vgFinDibujar();
}
// La parte privada de cada creep (la que usa GM Tools), normalizada.
async function vgLeerCreeps(ids){
  const docs = await Promise.all(ids.map(id => fbDb.doc(fbRutaCampana(`creeps/${id}/privado/ficha`)).get().then(d => [id, d]).catch(() => [id, null])));
  return docs.filter(([, d]) => d && d.exists).map(([id, d]) => {
    let crudo = {};
    try{ crudo = JSON.parse(d.data().json || '{}'); }catch(e){}
    const sc = CreepCalculo.normalizar(crudo);
    sc.id = id;
    return sc;
  });
}
async function vgCargarJugadores(){
  if(!vgRep || vgRep.cargando) return;
  const rep = vgRep;
  rep.cargando = true;
  try{ rep.jugadores = await CombateFin.jugadores(rep.jugadores); }
  catch(err){ console.error('No se pudieron leer los personajes:', err); rep.jugadores = rep.jugadores || []; }
  finally{ rep.cargando = false; if(rep === vgRep) vgFinDibujar(); }
}
function vgFinDibujar(){
  if(!vg || !vgRep) return;
  const v = CombateFin.vista(vgRep, vgCreeps, vgCatalogo());
  vg.raiz.querySelector('#vg-fin-cuerpo').innerHTML = v.html;
  const b = vg.raiz.querySelector('[data-vg="publicar"]');
  b.style.display = v.publicar === 'oculto' ? 'none' : '';
  if(v.publicar !== 'oculto') b.disabled = v.publicar !== 'activo';
  if(v.faltanJugadores) vgCargarJugadores();
}
async function vgPublicar(){
  if(!vgRep) return;
  const res = await CombateFin.publicar(vgRep, {creeps: vgCreeps, cat: vgCatalogo(), combateActual: combateMapa,
    confirmar: texto => confirm(texto), alEmpezar: vgFinDibujar});
  if(!res) return;
  if(res.error){ toast(res.error); vgFinDibujar(); return; }
  // No se vuelven a contar en el próximo reporte (GM Tools, abierto en otra pestaña, se entera por la firma).
  for(const f of res.filas){
    try{ await modificarCreep(f.sc.id, c => { c.recompensado = true; return {}; }); }
    catch(err){ console.error(`No se pudo marcar como recompensado al creep ${f.sc.id}`, err); }
  }
  vgRep = null;
  vgCerrar('vg-finalizar');
  toast(res.items.length ? 'Publicado ✓ — los jugadores ven la ventana de la batalla en el mapa; cuando hayan elegido, apretás Despojar' : 'Publicado ✓ — la XP y el oro se cargan solos en las fichas');
  if(res.items.length){
    combateMapa = {...(combateMapa || {}), estado: 'publicado'};   // sin esperar al snapshot
    abrirBotinGMMapa();   // el GM ve qué toma cada uno; puede cerrar la ventana y volver a abrirla con 🎁
  }
}

/* --- 🎁 Despojos: lo que nadie tomó → despojos, y se pagan la XP y el oro --- */
async function abrirBotinGMMapa(){
  if(!soyGM) return;
  if(!combatePublicado()){ toast('No hay botín publicado: se habilita cuando confirmás el fin de un combate con ítems'); return; }
  try{ await vgCargar(); }catch(err){ console.error(err); toast('No se pudo abrir el botín'); return; }
  if(!vgBotin) vgBotin = CombateFin.nuevoBotin();
  if(!vgBotinEscucha) vgBotinEscucha = fbDb.collection(fbRutaCampana('botin')).onSnapshot(snap => {
    vgBotin.docs = snap.docs.map(d => ({id: d.id, ...d.data()}));
    vgBotinDibujar();
  }, err => console.error('No se pudo escuchar el botín:', err));
  vgAbrir('vg-botin');
  vgBotinDibujar();
  if(vgBotin.jugadores === null){
    try{
      vgBotin.jugadores = await CombateFin.jugadoresBotin();
      vgBotin.incluidos = new Set(vgBotin.jugadores.map(j => j.id));
    }catch(err){ vgBotin.jugadores = []; console.error(err); }
    vgBotinDibujar();
  }
}
function vgBotinDibujar(){
  if(!vg || !vgBotin || !vg.raiz.querySelector('#vg-botin').classList.contains('open')) return;
  const v = CombateFin.botinVista(vgBotin);
  vg.raiz.querySelector('#vg-botin-cuerpo').innerHTML = v.html;
  const b = vg.raiz.querySelector('[data-vg="despojar"]');
  b.disabled = vgBotin.ocupado;
  b.textContent = v.boton;
}
async function vgDespojar(){
  if(!vgBotin) return;
  const res = await CombateFin.despojar(vgBotin, {combateActual: combateMapa, confirmar: texto => confirm(texto), alEmpezar: vgBotinDibujar});
  if(!res) return;
  if(res.error){ toast(res.error); vgBotinDibujar(); return; }
  toast(res.mensaje);
  vgBotin = null;   // el próximo combate arranca con la lista de personajes de nuevo
  vgCerrar('vg-botin');
}
// El combate cambió (js/12, escucharBotinParaJugador): si el botín ya no está publicado, su ventana se cierra (salvo mientras despoja).
function vgCombateCambio(){
  if(vg && !combatePublicado() && vg.raiz.querySelector('#vg-botin').classList.contains('open') && !(vgBotin && vgBotin.ocupado)) vgCerrar('vg-botin');
}
document.addEventListener('keydown', e => {
  if(e.key !== 'Escape' || !vg || vg.host.hidden || elegirDestinoCb) return;
  const abiertas = [...vg.raiz.querySelectorAll('.scrim.open')];
  if(!abiertas.length) return;
  e.preventDefault();
  e.stopPropagation();
  vgCerrar(abiertas[abiertas.length - 1].id);   // la de más arriba
});
