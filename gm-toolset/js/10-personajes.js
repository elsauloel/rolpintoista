// js/10-personajes.js — tramo 10 de 12 del script de gm-tools.html (paso 5, nivel A: mismo código, en el mismo orden).
/* ---------- Personajes: lista de las fichas de la partida ----------
   Se leen al abrir la lista (gm-tools no las escucha siempre, solo con el
   Tablero abierto). Cada una abre en una pestaña nueva, en solo lectura. */
async function renderListaPersonajes(){
  const caja = $('#personajes-lista');
  if(!fbDb || !fbMiembro){ caja.innerHTML = '<div class="desplegable-vacio">Sin conexión con la partida.</div>'; return; }
  caja.innerHTML = '<div class="desplegable-vacio">Cargando…</div>';
  try{
    const [fichas, miembros] = await Promise.all([
      fbDb.collection(fbRutaCampana('fichas')).get(),
      fbDb.collection(fbRutaCampana('miembros')).get(),
    ]);
    const nombres = new Map(miembros.docs.map(d => [d.id, String(d.data().nombre || '')]));
    const lista = fichas.docs.map(d => ({id: d.id, ...d.data()}))
      .sort((a, b) => String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es'));
    caja.innerHTML = lista.length
      ? lista.map(f => {
          const dueno = nombres.get(f.duenoUid);
          const mini = f.miniatura ? `<img class="pj-mini" src="${esc(f.miniatura)}" alt="">` : '<span class="pj-mini"></span>';
          return `<div class="pj-fila">
            <a href="../ficha-personaje/ficha.html?partida=${encodeURIComponent(FB_CAMPANA)}#${encodeURIComponent(f.id)}" target="_blank" rel="noopener" title="Abrir la ficha en una pestaña nueva">` +
              `${mini}<span class="pj-nombre">${esc(f.nombre || 'Sin nombre')}</span>${dueno ? `<span class="pj-dueno">${esc(dueno)}</span>` : ''}</a>` +
            `<button type="button" class="pj-borrar" data-borrar-personaje="${esc(f.id)}" data-nombre="${esc(f.nombre || 'Sin nombre')}" title="Borrar a ${esc(f.nombre || 'este personaje')} de la partida">✕</button>
          </div>`;
        }).join('')
      : '<div class="desplegable-vacio">Todavía no hay personajes en la partida.</div>';
    caja.querySelectorAll('[data-borrar-personaje]').forEach(b => {
      b.onclick = () => borrarPersonajeGM(b.dataset.borrarPersonaje, b.dataset.nombre, b);
    });
  }catch(err){
    console.error('No se pudieron leer los personajes:', err);
    caja.innerHTML = '<div class="desplegable-vacio">No se pudieron leer los personajes — mirá la consola.</div>';
  }
}

// Mismo criterio que "Borrar personaje" de la ficha (confirmar + escribir el
// nombre), pero acá el GM puede borrar la de cualquier jugador; de paso saca
// los tokens que la usan (el suyo y los de sus invocaciones).
/* Habilidad que deja un estado sobre otro (h.estadoObjetivo): el GM elige a quién le pegó (o nadie, si falló) y se le aplica solo.
   Un creep lo recibe directo; un personaje lo recibe por un aviso en campanas/<id>/estados que su ficha aplica sola (comun/estados-aplicar.js). */
async function elegirObjetivoDeHab(sc, h){
  const spec = h.estadoObjetivo;
  let toks = [];
  try{
    const mapaId = await TokensAuto.mapaQueMiraElGM();
    const snap = await fbDb.collection(fbRutaCampana(TokensAuto.rutaTokens(mapaId))).get();
    toks = snap.docs.map(d => ({id: d.id, ...d.data()}));
  }catch(err){ console.error('No se pudieron leer los tokens para elegir objetivo:', err); }
  toks = toks.filter(t => t.fichaId && !String(t.fichaId).includes('~') && !(t.tipo === 'creep' && t.fichaId === sc.id))
    .sort((a, b) => (a.tipo === b.tipo ? 0 : a.tipo === 'pj' ? -1 : 1) || String(a.nombre).localeCompare(String(b.nombre), 'es'));
  const cap = document.createElement('div');
  cap.className = 'scrim open';
  cap.style.zIndex = '400';
  cap.innerHTML = `<div class="modal" style="max-width:440px">
    <header><h3>🎯 ¿A quién le pegó ${esc(h.nombre || 'la habilidad')}?</h3></header>
    <div class="body">
      <p class="hint" style="margin:0 0 10px">Se le aplica solo: <b>${esc(EstadosAplicar.texto(spec))}</b>. Elegí a quien la recibió; si falló, tocá "Nadie".</p>
      ${toks.length ? toks.map(t => `<button type="button" class="addhab" data-obj="${esc(t.id)}" style="display:block;width:100%;margin:0 0 6px;text-align:left">${t.tipo === 'pj' ? '🧑' : '👹'} ${esc(t.nombre)}${t.oculto ? ' 🙈' : ''}</button>`).join('') : '<div class="hint">No hay otros tokens en el mapa que estás viendo.</div>'}
    </div>
    <footer><button class="btn ghost" data-obj-nadie>Nadie (falló)</button></footer>
  </div>`;
  document.body.appendChild(cap);
  const cerrar = () => cap.remove();
  cap.addEventListener('click', async e => {
    if(e.target.closest('[data-obj-nadie]') || e.target === cap){ cerrar(); return; }
    const b = e.target.closest('[data-obj]');
    if(!b) return;
    const tok = toks.find(t => t.id === b.dataset.obj);
    cerrar();
    if(tok) await aplicarEstadoAObjetivo(tok, spec, `${sc.nombre}: ${h.nombre || ''}`);
  });
}
async function aplicarEstadoAObjetivo(tok, spec, origen){
  try{
    if(tok.tipo === 'creep'){
      const c = S.creeps.find(x => x.id === tok.fichaId);
      if(!c){ toast(`${tok.nombre} no está entre los creeps de esta mesa`); return; }
      const r = EstadosAplicar.aplicarACreep(c, spec);
      if(!r.ok){ toast(`${c.nombre}: inmune ahora mismo (${r.motivo}) — no recibió ${spec.nombre}`); return; }
      if(modsAfectanHp(r.estado.mods)) actualizarHpMaxPorCon(c);
      renderAll();
      toast(`🎯 ${c.nombre} recibe ${EstadosAplicar.texto(spec)}`);
      return;
    }
    await EstadosAplicar.encolarPj({fichaId: tok.fichaId, duenoUid: tok.duenoUid, spec, origen});
    toast(`🎯 ${tok.nombre} recibe ${EstadosAplicar.texto(spec)} (su ficha lo aplica sola)`);
  }catch(err){
    console.error('No se pudo aplicar el estado:', err);
    toast('No se pudo aplicar el estado' + (err.code === 'permission-denied' ? ' (faltan pegar las reglas nuevas)' : ''));
  }
}

/* Habilidad con trampa: la coloca sola, oculta a los jugadores, al lado del token del creep en el mapa que el GM está mirando. */
// ✨ Automática embebida en el mapa (⚔ Acciones): el GM elige la casilla con un clic (mismo camino que la trampa de un jugador,
// trampaDeHabilidad en el mapa). Devuelve false si no hay mapa (entonces se coloca sola al lado del token, como siempre).
function pedirTrampaAlMapaCreep(sc, h){
  if(window.parent === window) return false;
  try{ MensajesMapa.alMapa('trampa-habilidad', {fichaId: sc.id, tipoToken: 'creep', nombre: h.nombre, trampa: Combatiente.trampaDeHab(h, st => CreepCalculo.statValor(sc, st))}); return true; }
  catch(err){ console.error('No se pudo avisar la trampa al mapa:', err); return false; }
}
// ✨ Automática, solo sobre el propio creep y sin tiradas: aplica los efectos del cuadro de Ejecución directo (como Blindaje en la ficha).
// Devuelve null si no es ese caso; si no, {hechos} (para el aviso del GM) y {nota} (los textos «a mano», para la Mesa:
// lo que le pasó al creep no se publica, su vida es secreta). La regla de «solo sobre sí y sin tiradas» es la común.
function aplicarHabCreepSobreSi(sc, h){ return CreepAcciones.sobreSi(sc, h); }   // comun/creep-acciones.js
async function colocarTrampaDeHab(sc, h){
  try{
    const r = await TokensAuto.colocarTrampas({fichaId: sc.id, tipoToken: 'creep', trampa: Combatiente.trampaDeHab(h, st => CreepCalculo.statValor(sc, st))});   // forma única (P123)
    if(r.colocadas) toast(`🪤 ${r.colocadas === 1 ? 'Trampa colocada' : r.colocadas + ' trampas colocadas'} al lado de ${sc.nombre}, oculta${r.colocadas === 1 ? '' : 's'} a los jugadores`);
    else if(r.motivo === 'sin-token') toast(`${sc.nombre} no tiene token en ese mapa: la trampa no se colocó (ponela a mano con Terreno y Formas → Trampa)`);
    else toast('No hay casilla libre al lado del token para la trampa');
  }catch(err){
    console.error('No se pudo colocar la trampa:', err);
    toast('No se pudo colocar la trampa' + (err.code === 'permission-denied' ? ' (sin permiso)' : ' — ponela a mano'));
  }
}

/* Al borrar un creep: si hay tokens que lo representan (en el mapa de siempre o en cualquier mapa guardado), pregunta si borrarlos también. */
async function preguntarBorrarTokensDeCreep(creepId){
  if(!fbDb || !fbUsuario) return;
  try{
    const tokens = await CreepsMapas.tokensDeCreep(creepId);   // en todos los mapas (comun/creeps-mapas.js)
    if(!tokens.length) return;
    if(!confirm(`Ese creep tiene ${tokens.length} token${tokens.length === 1 ? '' : 's'} en el mapa (contando todos los mapas guardados).\n\n¿Borrar también ${tokens.length === 1 ? 'ese token' : 'esos tokens'}?\nSi elegís "Cancelar", quedan en el mapa como tokens sin vincular.`)) return;
    const lote = fbDb.batch();
    tokens.forEach(d => lote.delete(d.ref));
    await lote.commit();
    toast(`${tokens.length} token${tokens.length === 1 ? '' : 's'} borrado${tokens.length === 1 ? '' : 's'} del mapa`);
  }catch(err){
    console.error('No se pudieron borrar los tokens del creep:', err);
    toast('No se pudieron borrar los tokens — borralos desde el mapa');
  }
}

async function borrarPersonajeGM(id, nombre, boton){
  const aviso = `Esto borra a ${nombre} de la partida, para todos, y no se puede deshacer.\n\n` +
                `Si el jugador lo quiere conservar, avisale antes (podés bajar un respaldo con "💾 Respaldo partida").\n\n¿Seguís?`;
  if(!confirm(aviso)) return;
  const escrito = prompt(`Para confirmar el borrado, escribí el nombre tal cual: ${nombre}`);
  if(escrito === null) return;
  if(escrito.trim().toLowerCase() !== nombre.trim().toLowerCase()){
    toast('El nombre no coincide — no se borró nada');
    return;
  }
  boton.disabled = true;
  try{
    const base = fbDb.doc(fbRutaCampana(`fichas/${id}`));
    // El mapa de siempre tiene sus tokens en tokens/*; los mapas guardados
    // aparte (vtt-hexgrid/mapa.html, "🗺 Mapas") los tienen cada uno en
    // mapas/{mapaId}/tokens/*, así que hay que barrer todos.
    const [partes, tokensPrincipal, mapasDocs] = await Promise.all([
      base.collection('partes').get(),
      fbDb.collection(fbRutaCampana('tokens')).where('tipo', '==', 'pj').get(),
      fbDb.collection(fbRutaCampana('mapas')).get(),
    ]);
    const tokensExtra = await Promise.all(mapasDocs.docs.map(m =>
      fbDb.collection(fbRutaCampana(`mapas/${m.id}/tokens`)).where('tipo', '==', 'pj').get()
    ));
    const esDelPersonaje = t => { const v = t.data().fichaId || ''; return v === id || v.startsWith(id + '~'); };
    const lote = fbDb.batch();
    partes.docs.forEach(d => lote.delete(d.ref));
    tokensPrincipal.docs.filter(esDelPersonaje).forEach(t => lote.delete(t.ref));
    tokensExtra.forEach(snap => snap.docs.filter(esDelPersonaje).forEach(t => lote.delete(t.ref)));
    lote.delete(base);
    await lote.commit();
    toast(`${nombre} borrado de la partida`);
    renderListaPersonajes();
  }catch(err){
    console.error('No se pudo borrar el personaje:', err);
    toast('No se pudo borrar el personaje — revisá la consola');
    boton.disabled = false;
  }
}

function abrirListaPersonajes(abrir){
  $('#personajes-lista').hidden = !abrir;
  $('#btn-personajes').setAttribute('aria-expanded', abrir ? 'true' : 'false');
  if(abrir) renderListaPersonajes();
}

$('#btn-personajes').onclick = () => abrirListaPersonajes($('#personajes-lista').hidden);
// Se cierra al elegir una ficha, al tocar afuera o con Escape.
$('#personajes-lista').addEventListener('click', e => { if(e.target.closest('a')) abrirListaPersonajes(false); });
document.addEventListener('pointerdown', e => {
  if(!$('#personajes-lista').hidden && !e.target.closest('#personajes-caja')) abrirListaPersonajes(false);
});
document.addEventListener('keydown', e => { if(e.key === 'Escape' && !$('#personajes-lista').hidden) abrirListaPersonajes(false); });

// Accesos de la barra de arriba: abren la misma partida que esta pestaña.
if(typeof FB_CAMPANA !== 'undefined' && FB_CAMPANA){
  $('#acceso-mapa').href = '../vtt-hexgrid/mapa.html?partida=' + encodeURIComponent(FB_CAMPANA);
  $('#acceso-vendedor').href = 'vendor-generator.html?partida=' + encodeURIComponent(FB_CAMPANA);
}
$('#view-x').onclick = cerrarVerCreep;
$('#scrim-view').addEventListener('mousedown', e => { if(e.target.id==='scrim-view') cerrarVerCreep(); });

// Escape cierra solo la ventana de más arriba (la de editar un creep puede
// tener abierta encima la de una habilidad, un estado, etc.).
document.addEventListener('keydown', e => {
  if(e.key !== 'Escape') return;
  const abiertos = [...document.querySelectorAll('.scrim.open')];
  if(!abiertos.length) return;
  const capa = s => num(getComputedStyle(s).zIndex);
  const arriba = abiertos.reduce((a, s) => capa(s) >= capa(a) ? s : a);
  if(arriba.id === 'scrim-editar-creep'){ cerrarEditarCreep(); return; }
  const closeBtn = arriba.querySelector('[id$="-x"]');
  if(closeBtn) closeBtn.click(); else arriba.classList.remove('open');
});
$('#scrim-editar-creep').addEventListener('mousedown', e => { if(e.target.id === 'scrim-editar-creep') cerrarEditarCreep(); });
$('#veritem-x').onclick = () => $('#scrim-ver-item').classList.remove('open');
$('#veritem-editar').onclick = () => { $('#scrim-ver-item').classList.remove('open'); editarYSubirItemGM(verItemActual); };
$('#veritem-baja').onclick = async () => {
  if(!verItemActual) return;
  const ok = await ItemsSubidos.solicitarBaja(verItemActual);
  if(ok){ $('#scrim-ver-item').classList.remove('open'); cargarItemsSubidosGM(); }
};
$('#scrim-ver-item').addEventListener('mousedown', e => { if(e.target.id==='scrim-ver-item') $('#scrim-ver-item').classList.remove('open'); });
$('#equipar-creep-x').onclick = () => { equipandoCreepId = null; $('#scrim-equipar-creep').classList.remove('open'); };
$('#scrim-equipar-creep').addEventListener('mousedown', e => { if(e.target.id==='scrim-equipar-creep'){ equipandoCreepId = null; $('#scrim-equipar-creep').classList.remove('open'); } });
$('#tablero-x').addEventListener('click', tableroCerrar);
$('#historial-x').addEventListener('click', () => $('#scrim-historial').classList.remove('open'));
$('#scrim-historial').addEventListener('mousedown', e => { if(e.target.id === 'scrim-historial') $('#scrim-historial').classList.remove('open'); });
$('#scrim-tablero').addEventListener('mousedown', e => { if(e.target.id === 'scrim-tablero') tableroCerrar(); });
$('#equipar-creep-item-aleatorio').addEventListener('click', elegirItemAleatorioGM);
$('#item-aleatorio-gm-tirar-de-nuevo').addEventListener('click', elegirItemAleatorioGM);
$('#item-aleatorio-gm-x').onclick = () => $('#scrim-item-aleatorio-gm').classList.remove('open');
$('#item-aleatorio-gm-cerrar').onclick = () => $('#scrim-item-aleatorio-gm').classList.remove('open');
$('#scrim-item-aleatorio-gm').addEventListener('mousedown', e => { if(e.target.id==='scrim-item-aleatorio-gm') $('#scrim-item-aleatorio-gm').classList.remove('open'); });
$('#acciones-creep-x').onclick = () => { accionesCreepId = null; $('#scrim-acciones-creep').classList.remove('open'); };
$('#scrim-acciones-creep').addEventListener('mousedown', e => { if(e.target.id==='scrim-acciones-creep'){ accionesCreepId = null; $('#scrim-acciones-creep').classList.remove('open'); } });
$('#verhab-x').onclick = () => $('#scrim-ver-hab').classList.remove('open');
// Desde el visor de una habilidad del creep: ✎ Editar (editor paso a paso) y ↻ Reemplazar (elegir otra de la biblioteca).
$('#verhab-editar').onclick = () => {
  if(!verHabAccion) return;
  const {scId, habId} = verHabAccion;
  $('#scrim-ver-hab').classList.remove('open');
  abrirEditorHabCreep(scId, habId, {encima: true});
};
$('#verhab-subir').onclick = () => {
  if(!verHabAccion) return;
  const sc = S.creeps.find(s => s.id === verHabAccion.scId);
  const h = sc && sc.habilidades.find(x => x.id === verHabAccion.habId);
  if(h) proponerHabilidadABiblioteca(sc, h);
};
$('#verhab-reemplazar').onclick = () => {
  if(!verHabAccion) return;
  const {scId, habId} = verHabAccion;
  $('#scrim-ver-hab').classList.remove('open');
  abrirCatalogoHabilidades(scId, habId);
};
$('#scrim-ver-hab').addEventListener('mousedown', e => { if(e.target.id==='scrim-ver-hab') $('#scrim-ver-hab').classList.remove('open'); });
$('#verestado-eliminar').onclick = () => {
  if(!viendoEstadoCreep) return;
  const {scId, esId} = viendoEstadoCreep;
  const sc = S.creeps.find(s => s.id === scId);
  if(sc){
    const es = sc.estados.find(x => x.id === esId);
    const teniaCon = es && modsAfectanHp(es.mods);
    sc.estados = sc.estados.filter(x => x.id !== esId);
    if(teniaCon) actualizarHpMaxPorCon(sc);
    renderAll();
  }
  viendoEstadoCreep = null;
  $('#scrim-ver-estado').classList.remove('open');
};
$('#verestado-editar').onclick = () => {
  if(!viendoEstadoCreep) return;
  const {scId, esId} = viendoEstadoCreep;
  $('#scrim-ver-estado').classList.remove('open');
  abrirEditorEstadoCreep(scId, esId);
};
$('#scrim-ver-estado').addEventListener('mousedown', e => { if(e.target.id==='scrim-ver-estado'){ viendoEstadoCreep = null; $('#scrim-ver-estado').classList.remove('open'); } });
$('#presets-creep-x').onclick = () => { if(presetsCreepDestino === 'duelo') cerrarPresetsDuelo(null); else $('#scrim-presets-creep').classList.remove('open'); };
// Menú paso a paso para crear un estado de cero (comun/asistente-estado.js); el formulario completo sigue en el último paso.
function armarPresetDeAsistenteGM(res){
  return {nombre: res.nombre, polaridad: res.polaridad, turnos: res.turnos, permanente: res.permanente, stacks: 1, hpTurno: res.hp, stacksTurno: 0,
    escudoMagico: res.escudo, mods: res.mods, detalle: res.detalle, ...res.flags, ...(res.forzarNitros !== undefined ? {forzarNitros: res.forzarNitros} : {})};
}
$('#presets-creep-personalizado').onclick = () => {
  $('#scrim-presets-creep').classList.remove('open');
  const scId = presetsCreepScId, sc = S.creeps.find(x => x.id === scId);
  const extra = {def: ['Def', 'Defensa'], dmg: ['Dmg', 'Daño'], pdg: null, eva: null, parry: null, nitros: null, resm: null, resmg: null, rescc: null, ini: null, crit: null, critpot: null};
  const ids = ['def', 'dmg', 'pdg', 'eva', 'parry', 'nitros', 'con', 'fue', 'agl', 'des', 'esp', 'resm', 'resmg', 'rescc', 'ini', 'crit', 'critpot'];
  AsistenteEstado.abrir({
    titulo: 'Crear un estado alterado',
    para: sc ? sc.nombre : '',
    stats: ids.map(id => ({id, label: (extra[id] && extra[id][0]) || STAT_LABEL_GM[id] || id, full: (extra[id] && extra[id][1]) || STAT_FULL_GM[id] || ''})),
    alTerminar: res => {
      const preset = armarPresetDeAsistenteGM(res);
      if(res.guardar){
        S.estadosPersonalizados = S.estadosPersonalizados || [];
        const i = S.estadosPersonalizados.findIndex(p => p.nombre === preset.nombre);
        if(i >= 0) S.estadosPersonalizados[i] = preset; else S.estadosPersonalizados.push(preset);
        PresetsGM.guardar(S.estadosPersonalizados);   // en la partida (comun/presets-gm.js)
      }
      presetsCreepScId = scId;
      activarEstadoPresetCreep(preset);
    },
    alFormulario: res => abrirEditorEstadoCreep(scId, null, res),   // el editor común con lo del asistente
  });
};
$('#scrim-presets-creep').addEventListener('mousedown', e => { if(e.target.id === 'scrim-presets-creep'){ if(presetsCreepDestino === 'duelo') cerrarPresetsDuelo(null); else $('#scrim-presets-creep').classList.remove('open'); } });
$('#btn-item-custom-gm').addEventListener('click', abrirItemCustomGM);
let revivirCreepId = null;
let revivirCreepModo = 'pct';
function calcularHpRevivirCreep(){
  const sc = S.creeps.find(s => s.id === revivirCreepId);
  const hpMax = sc ? num(sc.hpMax) : 0;
  if(revivirCreepModo === 'pct'){
    const pct = Math.max(0, Math.min(100, num($('#f-revivircreep-pct').value) || 0));
    return {hpMax, val: Math.max(1, Math.floor(hpMax * pct / 100))};
  }
  return {hpMax, val: Math.max(1, Math.floor(num($('#f-revivircreep-valor').value) || 1))};
}
function actualizarRevivirCreepUI(){
  $('#revivircreep-modo-pct').classList.toggle('primary', revivirCreepModo === 'pct');
  $('#revivircreep-modo-valor').classList.toggle('primary', revivirCreepModo === 'valor');
  $('#revivircreep-campo-pct').style.display = revivirCreepModo === 'pct' ? '' : 'none';
  $('#revivircreep-campo-valor').style.display = revivirCreepModo === 'valor' ? '' : 'none';
  const {hpMax, val} = calcularHpRevivirCreep();
  $('#revivircreep-preview').textContent = `Revive con ${fmt(val)} / ${fmt(hpMax)} HP`;
}
$('#revivircreep-modo-pct').onclick = () => { revivirCreepModo = 'pct'; actualizarRevivirCreepUI(); };
$('#revivircreep-modo-valor').onclick = () => { revivirCreepModo = 'valor'; actualizarRevivirCreepUI(); };
$('#f-revivircreep-pct').addEventListener('input', actualizarRevivirCreepUI);
$('#f-revivircreep-valor').addEventListener('input', actualizarRevivirCreepUI);
$('#revivircreep-confirmar').onclick = () => {
  const sc = S.creeps.find(s => s.id === revivirCreepId);
  if(!sc) return;
  const {val} = calcularHpRevivirCreep();
  sc.hp = val;
  revivirCreepId = null;
  $('#scrim-revivir-creep').classList.remove('open');
  renderAll();
  toast(`${sc.nombre} revivido con ${fmt(val)} HP`);
};
$('#revivircreep-cancel').onclick = () => { revivirCreepId = null; $('#scrim-revivir-creep').classList.remove('open'); };
$('#revivircreep-x').onclick = () => { revivirCreepId = null; $('#scrim-revivir-creep').classList.remove('open'); };
$('#scrim-revivir-creep').addEventListener('mousedown', e => { if(e.target.id==='scrim-revivir-creep'){ revivirCreepId = null; $('#scrim-revivir-creep').classList.remove('open'); } });
$('#finalizar-combate-x').onclick = () => $('#scrim-finalizar-combate').classList.remove('open');
$('#finalizar-combate-cerrar').onclick = () => $('#scrim-finalizar-combate').classList.remove('open');
$('#finalizar-combate-publicar').onclick = publicarRecompensas;
$('#scrim-finalizar-combate').addEventListener('mousedown', e => { if(e.target.id==='scrim-finalizar-combate') $('#scrim-finalizar-combate').classList.remove('open'); });
$('#scrim-ia').addEventListener('mousedown', e => { if(e.target.id==='scrim-ia') $('#scrim-ia').classList.remove('open'); });
document.addEventListener('keydown', e => {
  if(e.key !== 'Escape') return;
  $('#scrim-ia').classList.remove('open');
});

$('#file-input').onchange = ev => {
  const f = ev.target.files[0]; if(!f) return;
  const r = new FileReader();
  r.onload = () => {
    try{
      let data = JSON.parse(r.result);
      // Respaldo de toda la partida (lo baja el GM desde el inicio): se usan sus creeps.
      if(data && data.tipo === 'respaldo-partida'){
        if(!data.gmCreeps){ toast('Ese respaldo lo bajó un jugador: no trae los creeps completos (solo el GM puede)'); return; }
        data = data.gmCreeps;
      }
      if(!Array.isArray(data.creeps)) throw new Error('formato inválido');
      if(data.turno === undefined && data.actualizado !== undefined){
        toast('Ese archivo es creeps-publico.json (la vista recortada para jugadores) — cargá gm-creeps.json, que es el que tiene todos tus datos');
        return;
      }
      S = { turno: num(data.turno)||1, creeps: data.creeps.map(sc => {
        return Object.assign(creepBaseGuardado(), sc);
      }) };
      renderAll();
      toast('Cargado');
    }catch(err){
      toast('Ese archivo no es válido');
    }
  };
  r.readAsText(f);
  ev.target.value = '';
};

// Al abrir la herramienta con la lista vacía, arranca con un creep nuevo
// en blanco (nivel 1) en vez del mismo creep de ejemplo hardcodeado.
S.creeps.push(nuevoCreep());
renderAll();
