// js/05-trampas-e-items.js — tramo 5 de 12 del script de gm-tools.html (paso 5, nivel A: mismo código, en el mismo orden).
/* ---------- 🪤 Trampa de una habilidad de creep (2026-09-24, pedido del dueño) ----------
   Un paso propio del editor de habilidades, con la trampa a la vista: la habilidad puede colocar una trampa oculta al ejecutarse
   (`h.trampaColocar = {nombre, detalle, dano, radio, cant, estado}`). Las habilidades armadas por el programa ya traían una y no se
   podía cambiar ni sacar; ahora se enciende, se configura o se apaga desde acá. Sacarla borra `trampaColocar`. */
const HC_TRAMPA_DANO_RE = /^\d{1,2}d\d{1,3}([+-]\d{1,3})?$/i;
// La trampa que se está editando, en la forma única (P123, comun/plantillas.js). Los campos #hc-trampa-* de antes quedaron sin uso.
let hcTrampa = null;
function hcTrampaResumen(){
  if(!$('#hc-trampa-on').checked || !hcTrampa) return 'no coloca';
  return AsistenteTrampa.resumenTexto(hcTrampa);
}
function hcTrampaRender(){
  const on = $('#hc-trampa-on').checked;
  const nom = hcTrampa ? String(hcTrampa.nombre || '').trim() : '';
  $('#hc-trampa-resumen').innerHTML = on
    ? `<div class="hint" style="margin-bottom:8px"><b>${esc(nom || $('#hc-nombre').value.trim() || 'Sin nombre')}</b><br>${esc(hcTrampaResumen())}</div>
      <button type="button" class="btn primary" id="hc-trampa-asistente" style="width:100%">🪄 ${nom ? 'Cambiar' : 'Armar'} la trampa paso a paso</button>`
    : '';
  $('#hc-trampa-campos').style.opacity = on ? '1' : '.4';
  $('#hc-trampa-campos').querySelectorAll('input,select').forEach(el => { el.disabled = !on; });
  $('#hc-trampa-ayuda').textContent = on
    ? 'La trampa se coloca sola en secreto, al lado del token del creep, en el mapa que estás mirando; los jugadores no la ven hasta que se dispara.'
    : 'Sin trampa: la habilidad no coloca nada en el mapa.';
}
function hcCargarTrampa(h){
  hcTrampa = h.trampaColocar ? Plantillas.trampaDesde(h.trampaColocar) : null;   // las viejas {radio, estado:{…}} se traducen solas
  $('#hc-trampa-on').checked = !!hcTrampa;
  hcTrampaRender();
}
function hcGuardarTrampa(h){
  if(!$('#hc-trampa-on').checked || !hcTrampa){ delete h.trampaColocar; return; }
  h.trampaColocar = {...structuredClone(hcTrampa), nombre: String(hcTrampa.nombre || '').trim().slice(0, 40) || h.nombre};
}

function hcResumenHtml(){
  const fila = (titulo, valor) => `<div class="resumen-fila"><span>${titulo}</span><b>${esc(valor)}</b></div>`;
  const detalle = $('#hc-detalle').value.trim();
  const estado = $('#hc-efecto-nombre').value.trim();
  const turnos = num($('#hc-efecto-turnos').value);
  const cd = num($('#hc-cd').value);
  return `<div class="resumen-nombre">${esc($('#hc-nombre').value.trim() || '(sin nombre)')}</div>
    <div class="resumen-desc">${detalle ? esc(detalle) : '<span style="color:var(--muted)">(sin descripción)</span>'}</div>
    ${fila('Ejecución', (m => `${m.icono} ${m.nombre} (${m.corto})`)(MODOS_HAB_CREEP[editingHabCreep.modo || 'semi']))}
    ${fila("No2", $("#hc-nitros-modo").value === "ataque" ? "como un ataque" : fmt(Math.max(0, num($("#hc-acciones").value))))}
    ${fila('Cooldown', cd ? `${fmt(cd)} turno${cd === 1 ? '' : 's'}` : 'sin cooldown')}
    ${num($('#hc-hpcosto').value) > 0 ? fila('Vida', `${fmt(num($('#hc-hpcosto').value))} HP`) : ''}
    ${fila('Otro costo', $('#hc-costo').value.trim() || 'ninguno')}
    ${fila("Al ejecutar", hcStatLabel($("#hc-tirada-stat").value) || $("#hc-tirada").value.trim() || "no tira")}
    ${fila("Efecto", $("#hc-tirada-stat").value && $("#hc-tirada").value.trim() ? $("#hc-tirada").value.trim() + " (botón 🎲)" : "sin tirada de efecto")}
    ${fila('Estado', estado ? `${estado}${turnos ? ` (${fmt(turnos)} turnos)` : ''}` : 'ninguno')}
    ${fila('🪤 Trampa', hcTrampaResumen())}`;
}

/* Ver una habilidad de la biblioteca en detalle (👁 Ver): calculada con el nivel del creep. Desde ahí se puede Agregar,
   ✎ Editar (asistente paso a paso sobre una copia; no toca al creep) y, ya editada, 📚 Biblioteca para proponer esa versión. */
let verHab = null;   // {scId, ent, hab, editada}
/* Habilidades de jugador y de creep son un solo tipo en la biblioteca (`biblioteca_skills`, P122), con la marca `para`
   bien a la vista porque pagan distinto: 🐾 creep = cooldown, 🧙 jugador = SP (ver P125). Lo que se subió antes como
   habilidad de creep (`biblioteca_habs_creep`, `{habilidad}`) se sigue mostrando: LEGADO_HABS lo lee de ahí. */
const LEGADO_HABS = {tipo: 'habs_creep', convertir: d => d && d.habilidad ? {...d.habilidad, para: 'creep'} : d};
const paraDeDatos = d => d && d.sp ? 'creep' : (d && d.para) || 'creep';   // las recetas de fábrica (sp) son de creep
const PARA_TXT = {creep: '🐾 Creep · cooldown', jugador: '🧙 Jugador · SP'};
function paraHabHtml(h){
  if(h.para !== 'jugador') return `<div class="hint" style="margin-bottom:6px"><b>${PARA_TXT.creep}</b></div>`;
  return `<div class="hint" style="margin-bottom:6px;color:#e0a040"><b>${PARA_TXT.jugador}</b> — es una habilidad de jugador: paga con SP, que un creep no tiene. Revisale el costo y, si hace falta, ponele cooldown.</div>`;
}
// Una habilidad de la biblioteca lista para un creep: las recetas de fábrica se calculan con su nivel; lo subido va tal
// cual. `meta` = de dónde salió ({tipo, id, version}), para el aviso de versión nueva. Una de jugador conserva la marca.
function habDeBiblioteca(sc, datos, meta){
  const para = paraDeDatos(datos);
  const h = datos.sp ? armarHabilidadDeCreep(datos, sc.nivel) : structuredClone(datos.habilidad || datos);
  delete h.para; delete h.clase;
  return {...h, id: uid(), cdActual: h.cdArranca ? num(h.cd) : 0, ...(para === 'jugador' ? {para: 'jugador'} : {}), ...(meta ? {bibOrigen: meta} : {})};
}
const avisoJugador = h => h.para === 'jugador' ? ' — 🧙 es de jugador (paga con SP): revisale el costo' : '';
const metaHab = ent => ent ? {tipo: 'skills', id: ent.id, version: ent.version || 1} : null;
function verHabBiblioteca(scId, datos, ent){
  const sc = S.creeps.find(s => s.id === scId);
  if(!sc) return;
  verHab = {scId, ent, hab: habDeBiblioteca(sc, datos, metaHab(ent)), editada: false, fija: !datos.sp};
  renderVerHab();
  $('#scrim-ver-habbib').classList.add('open');
}
function renderVerHab(){
  const v = verHab, sc = v && S.creeps.find(s => s.id === v.scId);
  if(!sc){ $('#scrim-ver-habbib').classList.remove('open'); return; }
  const h = v.hab;
  const linea = (label, val) => (val === '' || val === null || val === undefined) ? '' : `<div class="view-line"><span class="view-label">${esc(label)}</span><span class="view-value">${esc(val)}</span></div>`;
  const cd = num(h.cd);
  const partes = habPartes(h);
  const tirada = [hcStatLabel(h.tiradaStat), h.tiradaExtra].filter(Boolean).join(' + ');
  const mods = (h.efectoMods || []).map(m => `${ATTR_LABELS[m.stat] || m.stat} ${conSigno(num(m.val))}`).join(', ');
  const aplica = h.estadoObjetivo ? (typeof h.estadoObjetivo === 'object' ? h.estadoObjetivo.nombre : h.estadoObjetivo) : '';
  const nota = v.editada ? (v.modo === 'creep' ? 'Versión editada por vos en esta copia del creep: todavía no está en la biblioteca.' : 'Versión editada por vos: todavía no está en la biblioteca ni en el creep.')
    : v.modo === 'creep' ? `Habilidad de ${sc.nombre || 'el creep'} (nivel ${sc.nivel || 1}).`
    : v.fija ? 'Versión propuesta a la biblioteca, con valores fijos (no escala con el nivel).'
    : `Calculada para ${sc.nombre || 'el creep'} (nivel ${sc.nivel || 1}).`;
  $('#verhabbib-titulo').textContent = h.nombre || 'Habilidad';
  $('#verhabbib-body').innerHTML = `
    <div class="view-lines" style="padding:14px 16px 10px">
      ${paraHabHtml(h)}
      <div class="hint">${esc(nota)}</div>
      ${(v.ent && v.ent.etiquetas || []).length ? `<div class="vc-chips">${v.ent.etiquetas.map(t => `<span class="vc-chip">${esc(t)}</span>`).join('')}</div>` : ''}
      ${linea('Costo', costoHabCreepTxt(sc, h))}
      ${linea('Cooldown', cd ? `${fmt(cd)} turno${cd === 1 ? '' : 's'}${h.cdArranca ? ' · lenta (arranca en cooldown)' : ''}` : 'sin cooldown')}
      ${linea('Otro costo', h.costo)}
      ${linea('Tirada', tirada || 'no tira')}
      ${linea('Cura', h.curaHp ? `${fmt(num(h.curaHp))} HP` : '')}
      ${linea('Estado sobre sí mismo', h.efectoNombre ? `${h.efectoNombre}${num(h.efectoTurnos) ? ` (${fmt(num(h.efectoTurnos))} turnos)` : ''}${mods ? ` · ${mods}` : ''}` : '')}
      ${linea('Estado sobre el objetivo', aplica)}
      ${linea('Trampa', h.trampaColocar ? 'Se coloca sola en el mapa al ejecutarla' : '')}
    </div>
    <div class="view-detalle"><span class="view-label">Descripción (lo que ve la mesa)</span>${esc(habTextoMesa(h) || 'Sin descripción.')}</div>
    ${partes.auto ? `<div class="view-detalle"><span class="view-label">⚙ Automatizado (solo para el GM)</span>${esc(partes.auto)}</div>` : ''}
    ${partes.mano ? `<div class="view-detalle"><span class="view-label">✋ A mano (solo para el GM)</span>${esc(partes.mano)}</div>` : ''}`;
  $('#verhabbib-biblioteca').disabled = !v.editada;
  $('#verhabbib-agregar').hidden = v.modo === 'creep';
}
$('#verhabbib-x').onclick = () => { $('#scrim-ver-habbib').classList.remove('open'); verHab = null; };
$('#scrim-ver-habbib').addEventListener('mousedown', e => { if(e.target.id === 'scrim-ver-habbib') $('#verhabbib-x').click(); });
$('#verhabbib-agregar').onclick = () => {
  const sc = verHab && S.creeps.find(s => s.id === verHab.scId);
  if(!sc) return;
  const h = structuredClone(verHab.hab);
  sc.habilidades.push(h);
  $('#verhabbib-x').click();
  const bib = document.getElementById('scrim-biblioteca');
  if(bib) bib.classList.remove('open');
  renderAll();
  toast(`${h.nombre} agregada a ${sc.nombre || 'el creep'} (nivel ${sc.nivel || 1})${avisoJugador(h)}`);
};
$('#verhabbib-editar').onclick = () => {
  if(!verHab) return;
  const v = verHab;
  if(v.modo === 'creep'){ editarHabDeCreepBib(v.scId, v.habId); return; }   // la habilidad ya es del creep: se edita ahí mismo
  abrirEditorHabCreep(v.scId, null, {borrador: v.hab, alGuardar: () => { v.editada = true; renderVerHab(); }});
};
$('#verhabbib-biblioteca').onclick = () => {
  const sc = verHab && S.creeps.find(s => s.id === verHab.scId);
  if(sc && verHab.editada) proponerHabilidadABiblioteca(sc, verHab.hab);
};
// ⬆ Sube a la biblioteca una habilidad ya calculada (queda con valores fijos), marcada 🐾 de creep (o 🧙 si ya era de
// jugador). Si salió de otra (`bibOrigen`), pregunta si es una corrección o algo nuevo (comun/biblioteca.js).
function proponerHabilidadABiblioteca(sc, hab){
  const h = structuredClone(hab);
  delete h.id;
  h.cdActual = h.cdArranca ? num(h.cd) : 0;
  const o = hab.bibOrigen;
  Biblioteca.guardar({tipo: 'skills', datos: {...h, para: h.para === 'jugador' ? 'jugador' : 'creep'}, nombre: h.nombre, nivel: sc.nivel,
    grupos: HABS_CREEP_GRUPOS, base: typeof HABILIDADES_CREEP_BASE !== 'undefined' ? HABILIDADES_CREEP_BASE : [], legado: LEGADO_HABS,
    basadoEn: o && o.id ? {id: o.id, nombre: h.nombre} : null,
    alSubir: r => { hab.bibOrigen = {tipo: 'skills', id: r.id, version: r.version}; renderAll(); }});
}
// Ver una habilidad que ya está en un creep (las filas de la copia de un creep de la biblioteca): sin Agregar, porque ya es suya.
function verHabDeCreep(scId, habId){
  const sc = S.creeps.find(s => s.id === scId);
  const hab = sc && sc.habilidades.find(h => h.id === habId);
  if(!hab) return;
  verHab = {scId, ent: null, hab, editada: !!(verCreepBib && verCreepBib.habsEditadas.has(habId)), fija: false, modo: 'creep', habId};
  renderVerHab();
  $('#scrim-ver-habbib').classList.add('open');
}

/* Catálogo de habilidades para creeps (comun/skills-creep-base.js): se elige una, se calcula con el nivel del creep y se agrega.
   "Crear de cero" sigue abriendo el asistente paso a paso de siempre. */
// reemplazarId: si viene, lo que se elige NO se suma sino que pisa esa habilidad del creep (botón ↻ Reemplazar del visor).
function abrirCatalogoHabilidades(scId, reemplazarId){
  const sc = S.creeps.find(s => s.id === scId);
  if(!sc) return;
  const vieja = reemplazarId ? sc.habilidades.find(x => x.id === reemplazarId) : null;
  Biblioteca.abrir({
    tipo: 'skills', legado: LEGADO_HABS,
    titulo: vieja ? `Reemplazar «${vieja.nombre || 'habilidad'}» de ${sc.nombre || 'el creep'}` : `Habilidad para ${sc.nombre || 'el creep'}`,
    textoCrearDeCero: vieja ? '✎ Mejor editar la actual (paso a paso)' : '+ Crear de cero (paso a paso)',
    alCrearDeCero: () => abrirEditorHabCreep(sc.id, vieja ? vieja.id : null),
    base: typeof HABILIDADES_CREEP_BASE !== 'undefined' ? HABILIDADES_CREEP_BASE : [],
    // Siempre a la vista para quién es (P122): 🐾 de creep (cooldown) o 🧙 de jugador (SP).
    subtitulo: e => paraDeDatos(e.datos) === 'jugador' ? ` · ${PARA_TXT.jugador}`
      : ` · ${PARA_TXT.creep} · ` + (e.datos.sp ? `${e.etiquetas.includes('lenta') ? 'lenta' : 'rápida'} · escala con el nivel del creep` : `${e.datos.cdArranca ? 'lenta' : 'rápida'} · valores fijos`),
    alVer: (datos, ent) => verHabBiblioteca(sc.id, datos, ent),
    alElegir: (datos, meta) => {
      const h = habDeBiblioteca(sc, datos, meta);
      const i = vieja ? sc.habilidades.indexOf(vieja) : -1;
      if(i >= 0){
        sc.habilidades[i] = h;   // en el mismo lugar de la lista
        renderAll();
        toast(`${vieja.nombre || 'La habilidad'} reemplazada por ${h.nombre}${avisoJugador(h)}`);
        return;
      }
      sc.habilidades.push(h);
      renderAll();
      toast(`${h.nombre} agregada a ${sc.nombre || 'el creep'} (nivel ${sc.nivel || 1})${avisoJugador(h)}`);
    },
    grupos: HABS_CREEP_GRUPOS,
  });
}
// Etiquetas de las habilidades de creeps, agrupadas por criterio: sirven de filtro en la biblioteca y de opciones al guardar.
const HABS_CREEP_GRUPOS = [
  {nombre: 'Función', tags: ['daño', 'defensa', 'buff', 'debuff', 'curación', 'control', 'movilidad', 'invocación', 'área']},
  {nombre: 'Mecánica del juego', tags: ['sigilo', 'trampas', 'terreno y formas', 'niebla y visión', 'iniciativa', 'aura', 'estados alterados', 'orientación', 'percepción', 'movimiento', 'botín', 'jefe']},
  {nombre: 'A quién apunta', tags: ['a sí mismo', 'un enemigo', 'zona o área', 'aliados', 'terreno']},
  {nombre: 'Velocidad', tags: ['rápida', 'lenta']},
  {nombre: 'Rol', tags: ['melee', 'tanque', 'asalto', 'rango', 'mágico', 'apoyo', 'debuffer']},
  {nombre: 'Raza', tags: ['cualquiera', 'humano', 'humanoide', 'bestia', 'planta', 'elemental', 'no-muerto', 'constructo', 'alienígena']},
  {nombre: 'Automatización', tags: ['toda automatizada', 'con parte a mano']},
];
// Ídem para los creeps.
const CREEPS_GRUPOS = [
  {nombre: 'Escenario', tags: ['minas', 'bosque', 'montañas', 'templo alienígena']},
  {nombre: 'Nivel', tags: ['nivel 1', 'nivel 2', 'nivel 3', 'nivel 4', 'nivel 5']},
  {nombre: 'Rol', tags: ['melee', 'tanque', 'asalto', 'rango', 'mágico', 'apoyo', 'debuffer']},
  {nombre: 'Tipo', tags: ['humano', 'humanoide', 'bestia', 'constructo', 'planta', 'no-muerto', 'elemental', 'alienígena']},
  {nombre: 'Facción', tags: ['bandidos', 'bárbaros', 'guardia de la ciudad', 'piratas espaciales', 'cultistas', 'mercenarios']},
  {nombre: 'Tribu', tags: ['goblin', 'tribu goblin', 'kobold', 'tribu kobold', 'hombre cabra', 'clan cabruno']},
  {nombre: 'Mecánica', tags: ['trampas', 'sigilo']},
];

/* Catálogo de armas naturales (comun/armas-naturales-base.js): garras, colmillos, aguijones, tentáculos, aliento…
   Al elegir una se calcula con el nivel del creep y reemplaza su arma; el creep pasa a tener arma natural (suelta trofeo). */
function abrirCatalogoArmasNaturales(scId){
  const sc = S.creeps.find(s => s.id === scId);
  if(!sc) return;
  Biblioteca.abrir({
    tipo: 'armas_naturales', titulo: `Arma natural para ${sc.nombre || 'el creep'}`,
    base: typeof ARMAS_NATURALES_BASE !== 'undefined' ? ARMAS_NATURALES_BASE : [],
    subtitulo: e => ` · ${e.etiquetas.includes('pesada') ? 'pesada' : e.etiquetas.includes('ligera') ? 'ligera' : 'media'} · ${e.etiquetas.includes('a distancia') ? 'a distancia' : 'cuerpo a cuerpo'}`,
    alElegir: datos => {
      if(sc.armaNombre && !confirm(`${sc.nombre || 'El creep'} ya tiene "${sc.armaNombre}". ¿Reemplazarla por ${datos.nombre}?`)) return;
      Object.assign(sc, armarArmaNatural(datos, sc.nivel));
      renderAll();
      toast(`${datos.nombre} equipada (arma natural, nivel ${sc.nivel || 1})`);
    },
    grupos: [
      {nombre: 'Parte del cuerpo', tags: ['garras', 'colmillos', 'aguijón', 'espinas', 'cuernos', 'cola', 'alas', 'patas', 'puños', 'tentáculos', 'pinzas', 'pico', 'lengua', 'enjambre', 'toque', 'aliento', 'escupitajo', 'hilo', 'energía', 'proyectil']},
      {nombre: 'Efecto al golpear', tags: ['Envenenar', 'Veneno severo', 'Sangrado', 'Rompe armadura', 'Aturdir', 'Derribar', 'Lisiado', 'Dejar rengo', 'Pajaritos', 'Inmovilizar', 'Agarrar', 'Empuje', 'Drena vida', 'Prende fuego', 'Ignora armadura', 'Ignora 1 de Res. crítico', 'Ceguera', 'sin efecto']},
      {nombre: 'Alcance', tags: ['cuerpo a cuerpo', 'a distancia']},
      {nombre: 'Potencia', tags: ['ligera', 'media', 'pesada']},
      {nombre: 'Tipo de daño', tags: ['cortante', 'perforante', 'contundente', 'elemental', 'mágico', 'ácido']},
    ],
  });
}

function abrirEditorHabCreep(scId, habId, opc){
  const sc = S.creeps.find(s => s.id === scId);
  if(!sc) return;
  // habId vacío = habilidad nueva (se agrega al guardar).
  // opc.borrador = una habilidad suelta (la de la biblioteca): se edita ella, no se agrega al creep; al guardar avisa con opc.alGuardar.
  const h = opc && opc.borrador ? opc.borrador : habId ? sc.habilidades.find(x => x.id === habId) : {};
  if(!h) return;
  editingHabCreep = {scId, habId: habId || null, paso: 0, borrador: !!(opc && opc.borrador), alGuardar: opc && opc.alGuardar,
    modo: (habId || (opc && opc.borrador)) ? modoHabCreep(h) : null, duelo: h.duelo && typeof h.duelo === 'object' ? structuredClone(h.duelo) : null};
  $('#scrim-hab-creep').classList.toggle('desde-biblioteca', !!(editingHabCreep.borrador || (opc && opc.encima)));   // por encima de las ventanas de Ver
  $('#hc-titulo-modal').textContent = editingHabCreep.borrador ? `Editar habilidad de la biblioteca · ${h.nombre || ''}` : habId ? `Editar habilidad · ${sc.nombre || 'creep'}` : `Nueva habilidad · ${sc.nombre || 'creep'}`;
  $('#hc-nombre').value = h.nombre || '';
  $('#hc-costo').value = h.costo || '';
  $("#hc-nitros-modo").value = habCreepAtaque(h) ? "ataque" : "num";
  $("#hc-acciones").value = habCreepAtaque(h) ? IT2_CREEP.nitrosHabilidad : (h.nitrosCosto ?? IT2_CREEP.nitrosHabilidad);
  editingHabCreepPdgAuto = false;
  $('#hc-cd').value = h.cd || 0;
  $('#hc-hpcosto').value = h.hpCosto || 0;
  $('#hc-cd-arranca').checked = !!h.cdArranca;
  $('#hc-detalle').value = h.detalle || '';
  $('#hc-tirada').value = h.tiradaExtra || '';
  $("#hc-tirada-stat").innerHTML = hcOpcionesStat(h.tiradaStat || "");
  $('#hc-efecto-preset').innerHTML = '<option value="">— elegir preset o completar a mano —</option>' + optgroupsEstadosPresetHtml() + optgroupsEstadosPersonalizadosHtml();
  $('#hc-efecto-nombre').value = h.efectoNombre || '';
  $('#hc-efecto-turnos').value = h.efectoTurnos || 0;
  $('#hc-efecto-stacks').value = h.efectoStacks || 1;
  $('#hc-efecto-hpturno').value = h.efectoHpTurno || 0;
  $('#hc-efecto-detalle').value = h.efectoDetalle || '';
  $('#hc-efecto-polaridad').value = h.efectoPolaridad || 'otro';
  $('#hc-efecto-mods').value = JSON.stringify(h.efectoMods || []);
  hcCargarTrampa(h);
  hcAplicarModoNitros();
  $('#scrim-hab-creep').classList.add('open');
  hcMostrarPaso(0);
}

function guardarEditorHabCreep(){
  if(!editingHabCreep) return;
  const sc = S.creeps.find(s => s.id === editingHabCreep.scId);
  if(!sc){ editingHabCreep = null; return; }
  let h = editingHabCreep.habId ? sc.habilidades.find(x => x.id === editingHabCreep.habId) : null;
  if(editingHabCreep.habId && !h){ editingHabCreep = null; return; }
  if(!$('#hc-nombre').value.trim()){ hcMostrarPaso(1); return; }
  if(!h && editingHabCreep.borrador && verHab) h = verHab.hab;   // la habilidad de la biblioteca que se está viendo
  if(!h){
    h = {id: uid(), cdActual: 0};
    sc.habilidades.push(h);
  }
  h.nombre = $('#hc-nombre').value.trim() || 'Sin nombre';
  h.costo = $('#hc-costo').value;
  h.nitrosCosto = $("#hc-nitros-modo").value === "ataque" ? "ATAQUE" : Math.max(0, num($("#hc-acciones").value) || 0);
  h.cd = Math.max(0, num($('#hc-cd').value) || 0);
  const hpCostoHab = Math.max(0, num($('#hc-hpcosto').value) || 0);
  if(hpCostoHab) h.hpCosto = hpCostoHab; else delete h.hpCosto;
  // Habilidad lenta: empieza con el cooldown ya activo (al crearla, al marcarla, y en cada combate nuevo).
  const eraLenta = !!h.cdArranca;
  h.cdArranca = $('#hc-cd-arranca').checked;
  if(h.cdArranca && (!eraLenta || !editingHabCreep.habId)) h.cdActual = h.cd;
  h.detalle = $('#hc-detalle').value;
  h.tiradaExtra = $('#hc-tirada').value.trim();
  h.tiradaStat = $("#hc-tirada-stat").value;
  h.efectoNombre = $('#hc-efecto-nombre').value.trim();
  h.efectoTurnos = Math.max(0, num($('#hc-efecto-turnos').value) || 0);
  h.efectoStacks = Math.max(1, num($('#hc-efecto-stacks').value) || 1);
  h.efectoHpTurno = num($('#hc-efecto-hpturno').value) || 0;
  h.efectoDetalle = $('#hc-efecto-detalle').value;
  h.efectoPolaridad = $('#hc-efecto-polaridad').value || 'otro';
  try{ h.efectoMods = JSON.parse($('#hc-efecto-mods').value) || []; }catch(e){ h.efectoMods = []; }
  hcGuardarTrampa(h);
  h.modo = editingHabCreep.modo || 'semi';
  h.automatizada = h.modo !== 'manual';
  if(editingHabCreep.duelo) h.duelo = editingHabCreep.duelo; else delete h.duelo;
  const alGuardar = editingHabCreep.alGuardar;
  editingHabCreep = null;
  $('#scrim-hab-creep').classList.remove('open');
  if(alGuardar){ alGuardar(h); return; }   // habilidad de la biblioteca: se vuelve a la vista, sin tocar al creep
  renderAll();
  toast(`${h.nombre} guardada`);
}

/* ---------- Ítems de creeps: asistente paso a paso (comun/asistente-item.js) ----------
   El ✎ del arma de un creep y "✎ Ítem custom" abren el mismo asistente que
   la ficha, con los números del creep (No2, Dmg, Rango, Defensa). Un arma
   reemplaza la del creep; el resto va a su equipo. */
function portadorCreep(scId){
  const sc = S.creeps.find(s => s.id === scId);
  if(!sc) return null;
  return {nombre: sc.nombre, nitros: creepNitrosMax(sc), dmg: creepStatValor(sc, 'dmg'), rango: creepStatValor(sc, 'rng'), def: creepDefensaEfectiva(sc)};
}

function cfgItemGM(){
  return {
    contexto: 'creep',
    stats: [...CREEP_DERIVED_STATS.map(s => ({id: s.id, label: s.label})),
      ...['tipo1', 'tipo2', 'tipo3', 'tipo4', 'tipo5'].map(id => ({id, label: `Res. crítico ${STAT_LABEL_GM[id]}`})),
      {id: 'armadmg', label: 'Armadura mágica'}],
    ejemplos: (tipoItem, t) => CATALOGO_EQUIPO.filter(it => String(it.tipoItem || '').startsWith('arma_') && num(it.tipoDado) === t).map(it => it.nombre),
  };
}

function armaDeCreepComoDraft(sc){
  return {
    nombre: sc.armaNombre || '', tipoItem: sc.armaManos || 'arma_1m', tipoDado: num(sc.armaTipo) || 8,
    peso: Math.max(1, num(sc.armaPeso) || 1), danoFijo: num(sc.armaFijo), danoAmplificado: num(sc.armaAmplificado),
    armaDeRango: !!sc.armaDeRango, mods: structuredClone(sc.armaMods || []), detalle: sc.armaDetalle || '',
    efectosGolpe: structuredClone(sc.armaEfectos || []),
  };
}

function ponerArmaEnCreep(sc, d){
  sc.armaNombre = d.nombre;
  sc.armaManos = d.tipoItem;
  sc.armaTipo = num(d.tipoDado) || 8;
  sc.armaPeso = Math.max(1, num(d.peso) || 1);
  sc.armaFijo = num(d.danoFijo);
  sc.armaAmplificado = Math.max(0, num(d.danoAmplificado));
  sc.armaDeRango = !!d.armaDeRango;
  sc.armaMods = structuredClone(d.mods || []);
  sc.armaEfectos = structuredClone(d.efectosGolpe || []);
  sc.armaDetalle = d.detalle || '';
}

// Pieza de equipo (no arma): la Defensa va aparte, como en CATALOGO_EQUIPO.
function ponerEquipoEnCreep(sc, d){
  const def = (d.mods || []).filter(m => m.stat === 'def').reduce((a, m) => a + num(m.val), 0);
  const mods = (d.mods || []).filter(m => m.stat !== 'def');
  sc.defensa = num(sc.defensa) + def;
  aplicarModsEquipo(sc, mods, 1);
  sc.equipo = sc.equipo || [];
  sc.equipo.push({id: uid(), nombre: d.nombre, tipoItem: d.tipoItem, def, mods, detalle: d.detalle || ''});
  actualizarArmaduraTipo(sc);
  if(modsAfectanHp(mods)) actualizarHpMaxPorCon(sc);
}

function itemComoEntradaCatalogoGM(d){
  const esArma = String(d.tipoItem).startsWith('arma_');
  return {
    id: 'new-' + slugItemCatalogo(d.nombre), nombre: d.nombre, tier: d.tier || 'A definir', imagen: '',
    tipoItem: d.tipoItem, peso: num(d.peso), ranuras: num(d.ranuras), precioCompra: num(d.precioCompra),
    ...(esArma ? {tipoDado: d.tipoDado, danoFijo: num(d.danoFijo), danoAmplificado: num(d.danoAmplificado), armaDeRango: !!d.armaDeRango, efectosGolpe: d.efectosGolpe || []} : {}),
    unidades: 1, cargaMax: 0, consumible: false, curahp: 0, escalaTipos: ESCALA_TIPOS,
    mods: d.mods || [], detalle: d.detalle || '', descripcionNarrativa: d.descripcionNarrativa || '',
  };
}

function abrirEditorArmaCreep(scId){
  const sc = S.creeps.find(s => s.id === scId);
  if(!sc) return;
  AsistenteItem.abrir({...cfgItemGM(),
    titulo: `Arma de ${sc.nombre}`,
    nuevo: false,
    fijarCategoria: true,
    draft: armaDeCreepComoDraft(sc),
    portador: () => portadorCreep(scId),
    tiers: Object.keys(TIER_COLOR),
    botones: [{texto: '⬆ Subir al catálogo', accion: d => EditarItem.subir(d, {catalogo: catalogoGMCompleto(), alSubir: () => cargarItemsSubidosGM()})}],
    onGuardar: d => {
      const actual = S.creeps.find(s => s.id === scId);
      if(!actual){ toast('Ese creep ya no está'); return true; }
      ponerArmaEnCreep(actual, d);
      renderAll();
      toast('Arma actualizada');
      return true;
    },
  });
}

// Ítem nuevo hecho por el GM: se equipa a un creep y/o se publica en el catálogo.
function abrirItemCustomGM(){
  const opciones = [{v: '', l: '— ninguno (solo para el catálogo) —'}, ...creepsReales().map(sc => ({v: sc.id, l: sc.nombre}))];
  const valor = creepsReales().some(sc => sc.id === equipandoCreepId) ? equipandoCreepId : (creepsReales()[0] ? creepsReales()[0].id : '');
  AsistenteItem.abrir({...cfgItemGM(),
    titulo: 'Ítem custom',
    nuevo: true,
    draft: {tier: 'A definir', peso: 0},
    categorias: AsistenteItem.CATEGORIAS.map(c => c.id).filter(id => id !== 'consumibles'),
    destinos: {label: 'Equipar a', opciones, valor, nota: 'Un arma reemplaza la del creep; lo demás se suma a su equipo. Si no lo equipás a nadie, igual lo podés publicar en el catálogo desde el último paso.'},
    portador: portadorCreep,
    tiers: Object.keys(TIER_COLOR),
    conPrecio: true,
    conRanuras: true,
    textoGuardar: 'Crear y equipar',
    botones: [{
      texto: '⬆ Subir al catálogo',
      accion: d => publicarEnCatalogoGM(itemComoEntradaCatalogoGM(d)),
    }],
    onGuardar: (d, scId) => {
      const sc = S.creeps.find(s => s.id === scId);
      if(!sc){ toast('Elegí a qué creep equiparlo (paso 1), o publicalo con "Agregar al catálogo"'); return false; }
      if(String(d.tipoItem).startsWith('arma_')) ponerArmaEnCreep(sc, d);
      else ponerEquipoEnCreep(sc, d);
      toast(`${sc.nombre} equipado con ${d.nombre}`);
      registrarEvento(`✎ Ítem custom: ${sc.nombre} equipado con ${d.nombre}`);
      renderAll();
      return true;
    },
  });
}

// Daño del arma del creep: si trae efectos al golpear, van resaltados a la
// Mesa (y los que dependen de suerte abren el pop-up para tirar).
function efectosAlPegarCreep(sc){
  EfectosGolpe.alPegar({
    arma: `${sc.nombre} · ${sc.armaNombre || 'arma'}`,
    efectos: sc.armaEfectos,
    publicar: linea => {
      registrarEvento(`⚠ ${linea.origen}: ${linea.formula.replace(/\n/g, ' · ')}`);
      if(!fbDb || !fbUsuario || !fbMiembro) return;
      fbDb.collection(fbRutaCampana('tiradas')).add({
        uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: String(sc.nombre || '').slice(0, 60),
        origen: linea.origen.slice(0, 120), formula: linea.formula.slice(0, 900),
        rolls: linea.rolls.slice(0, 100), mod: 0, total: 0, desde: 'efecto-gm',
        cuando: firebase.firestore.FieldValue.serverTimestamp(),
      }).catch(err => console.error('No se pudieron publicar los efectos en la Mesa:', err));
    },
  });
}

function verCreep(id){
  const sc = S.creeps.find(x => x.id === id);
  if(!sc) return;
  verCreepDatos(sc, false);
}
/* Ver un creep de la biblioteca (todavía no está en la mesa): se arma una copia con los valores por defecto y se muestra
   con todo el detalle. La copia es un borrador (`_borrador`, ver creepsReales) que vive mientras la ventana está abierta:
   desde ahí se puede Agregar a la mesa, ✎ Editar (la ficha completa de siempre) y, ya editado, 📚 Biblioteca para proponer
   esa versión. Cada habilidad tiene además su propio Ver, ✎ y 📚. Al cerrar, el borrador se descarta. */
let verCreepBib = null;   // {id, ent, editado, habsEditadas:Set, editando, listaAbierta}
function descartarBorradorCreep(){
  S.creeps = S.creeps.filter(sc => !sc._borrador);
  verCreepBib = null;
}
function verCreepDeBiblioteca(datos, ent){
  descartarBorradorCreep();
  const sc = Object.assign(creepBaseGuardado(), structuredClone(datos), {id: uid(), _borrador: true});
  sc.habilidades = (sc.habilidades || []).map(h => ({...h, id: uid()}));
  sc.estados = (sc.estados || []).map(es => ({...es, id: uid()}));
  sc.nitros = creepNitrosMax(sc);   // en la vista previa, con los No2 llenos
  S.creeps.push(sc);
  verCreepBib = {id: sc.id, ent, editado: false, habsEditadas: new Set(), editando: false, listaAbierta: false};
  verCreepDatos(sc, true);
}
function borradorCreep(){ return verCreepBib && S.creeps.find(s => s.id === verCreepBib.id); }
function cerrarVerCreep(){
  $('#scrim-view').classList.remove('open');
  if(verCreepBib && !verCreepBib.editando) descartarBorradorCreep();
}
// Lo que se vuelve a mostrar al terminar de editar el creep (la ventana de Ver y la lista de la biblioteca de atrás).
function volverAVerCreepBib(){
  const v = verCreepBib, sc = borradorCreep();
  if(!v) return;
  v.editando = false;
  if(!sc){ verCreepBib = null; return; }
  v.editado = true;
  const bib = document.getElementById('scrim-biblioteca');
  if(bib && v.listaAbierta) bib.classList.add('open');
  verCreepDatos(sc, true);
}
function datosLimpiosDelBorrador(sc){
  const d = structuredClone(sc);
  delete d._borrador;
  return d;
}
$('#view-editar').onclick = () => {
  if(verCreepMesaId && !verCreepBib){   // creep de la mesa: se abre su ficha completa (editable)
    const id = verCreepMesaId;
    $('#scrim-view').classList.remove('open');
    abrirEditarCreep(id);
    return;
  }
  const sc = borradorCreep();
  if(!sc) return;
  const bib = document.getElementById('scrim-biblioteca');
  verCreepBib.listaAbierta = !!(bib && bib.classList.contains('open'));
  if(bib) bib.classList.remove('open');   // la ficha completa va por debajo de la lista: se esconde mientras se edita
  verCreepBib.editando = true;
  $('#scrim-view').classList.remove('open');
  abrirEditarCreep(sc.id);
};
$('#view-agregar').onclick = () => {
  const sc = borradorCreep();
  if(!sc) return;
  const ent = verCreepBib && verCreepBib.ent;
  agregarCreepDeBiblioteca(datosLimpiosDelBorrador(sc), ent ? {id: ent.id, version: ent.version} : null);
  const bib = document.getElementById('scrim-biblioteca');
  if(bib) bib.classList.remove('open');
  cerrarVerCreep();
};
$('#view-biblioteca').onclick = () => {
  const sc = borradorCreep();
  const ent = verCreepBib && verCreepBib.ent;
  if(sc && verCreepBib.editado) guardarCreepEnBiblioteca(sc, ent ? {id: ent.id, version: ent.version} : null);
};
$('#view-body').addEventListener('click', e => {
  const b = e.target.closest('[data-vc-hab]');
  const sc = borradorCreep();
  if(!b || !sc) return;
  const hab = sc.habilidades.find(h => h.id === b.dataset.vcId);
  if(!hab) return;
  if(b.dataset.vcHab === 'ver') verHabDeCreep(sc.id, hab.id);
  else if(b.dataset.vcHab === 'editar') editarHabDeCreepBib(sc.id, hab.id);
  else if(b.dataset.vcHab === 'bib') proponerHabilidadABiblioteca(sc, hab);
});
function editarHabDeCreepBib(scId, habId){
  abrirEditorHabCreep(scId, habId, {encima: true, alGuardar: () => {
    const sc = borradorCreep();
    if(!sc) return;
    verCreepBib.habsEditadas.add(habId);
    verCreepBib.editado = true;
    if(verHab && verHab.habId === habId){ verHab.editada = true; renderVerHab(); }
    verCreepDatos(sc, true);
  }});
}
let verCreepMesaId = null;   // el creep de la mesa que se está viendo (para el botón ✎ Editar)
function verCreepDatos(sc, completo){
  // Recuadro con título chico y valor destacado; tip = texto al pasar el mouse.
  const caja = (label, valor, tip) => `<div class="vc-caja${tip ? ' con-tip' : ''}"${tip ? ` data-tip="${esc(tip)}"` : ''}>
      <span class="vc-caja-label">${esc(label)}</span><span class="vc-caja-valor">${esc(valor)}</span></div>`;
  const seccion = (titulo, contenido) => `<div class="vc-seccion"><div class="sect-label">${esc(titulo)}</div>${contenido}</div>`;

  const critLabels = ['Tipo 4','Tipo 6','Tipo 8','Tipo 10','Tipo 12'];
  const crits = sc.crit.map((v, i) => num(v) ? caja(`Res. ${critLabels[i]}`, conSigno(creepCritEfectivo(sc, i)), critOrigenTxt(sc, i)) : '').join('');

  const habilidades = sc.habilidades.map(h => {
    const partes = [];
    const costo = costoNitrosHabCreep(sc, h);
    partes.push(costoHabCreepTxt(sc, h));
    if(num(h.cd) > 0) partes.push(`CD ${fmt(num(h.cd))}`);
    const tip = `${partes.join(' · ')}\n${h.detalle || 'Sin descripción.'}`;
    return `<span class="vc-chip con-tip" data-tip="${esc(tip)}">${esc(h.nombre || '(sin nombre)')}</span>`;
  }).join('');

  const estados = sc.estados.map(es => {
    const dura = es.permanente ? 'permanente' : `${fmt(num(es.turnos))}t`;
    return `<span class="vc-chip vc-estado-${es.polaridad || 'otro'} con-tip" data-tip="${esc(es.detalle || 'Sin descripción.')}">${esc(es.nombre || '(sin nombre)')} · ${dura}</span>`;
  }).join('');

  // Todo lo equipado: el arma y cada pieza de armadura, con su número destacado.
  const equipado = (nombre, tipo, valor, detalle) => `<div class="vc-equipo">
      <div class="equipo-item-top">
        <span class="equipado-nombre">${esc(nombre)}</span>
        <span class="valor-caja">${valor}</span>
      </div>
      <div class="equipo-item-meta">${esc(tipo)}</div>
      ${detalle ? `<div class="arma-detalle">${esc(detalle)}</div>` : ''}
    </div>`;
  const equipo = [
    equipado(sc.armaNombre || 'Arma sin nombre', sc.armaDeRango ? 'Arma de rango' : 'Arma', esc(danoTxt(sc)),
      [sc.armaDetalle, (sc.armaEfectos || []).length ? `Al golpear: ${EfectosGolpe.resumenLista(sc.armaEfectos)}` : ''].filter(Boolean).join(' · ')),
    ...(sc.equipo || []).map(it => equipado(it.nombre || '(sin nombre)', TIPOITEM_LABEL_GM[it.tipoItem] || it.tipoItem || '', `<small>DEF</small>+${fmt(num(it.def))}`, it.detalle)),
  ].join('');

  $('#view-title-header').textContent = sc.nombre || 'Creep';
  $('#view-body').innerHTML = `
    <div class="view-wrap">
      <div class="view-image-wrap">${sc.imagen ? `<img src="${esc(sc.imagen)}" class="view-image" alt="">` : `<span class="view-image-empty">Sin imagen</span>`}</div>
      <div class="view-info">
        <div class="view-title">${esc(sc.nombre)} <span class="vc-nivel">Lv ${fmt(num(sc.nivel))}</span></div>
        <div class="vc-cajas vc-2">
          ${caja('HP', `${fmt(num(sc.hp))} / ${fmt(num(sc.hpMax))}`)}
          ${caja('No2', `${fmt(num(sc.nitros))} / ${fmt(creepNitrosMax(sc))}`)}
        </div>
        <div class="sect-label" style="margin-top:12px">Estados alterados</div>
        ${estados ? `<div class="vc-chips" style="margin-top:6px">${estados}</div>` : '<div class="hint" style="margin-top:4px">Sin estados.</div>'}
      </div>
    </div>
    <div class="vc-cuerpo">
      ${seccion('Atributos', `<div class="vc-cajas vc-5">${ATTR_IDS.map(a => {
        const mod = creepModTotal(sc, a);
        return `<div class="attr-col">${caja(ATTR_LABELS[a], fmt(num(sc[a]) + mod), mod ? `Base ${fmt(num(sc[a]))} ${conSigno(mod)} por ${origenesModCreep(sc, a).join(', ')}` : '')}${derivadosHtml(sc, a)}</div>`;
      }).join('')}</div>`)}
      ${seccion('Daño y defensa', `<div class="vc-cajas vc-2">
        ${caja('Daño', ataqueCreepTxt(sc), ataqueOrigenTxt(sc))}
        ${caja('Defensa', fmt(creepDefensaEfectiva(sc)), defensaOrigenTxt(sc))}
        ${creepArmadmgEfectiva(sc) ? caja('Armadura mágica', fmt(creepArmadmgEfectiva(sc)), armadmgOrigenTxt(sc)) : ''}
      </div>
      ${crits ? `<div class="vc-cajas vc-5">${crits}</div>` : ''}`)}
      ${seccion('Habilidades', completo
        ? (sc.habilidades.length ? sc.habilidades.map(h => `<div class="vc-equipo">
            <div class="equipo-item-top"><span class="equipado-nombre">${esc(h.nombre || '(sin nombre)')}</span>
              <span class="vc-hab-acc">
                <button type="button" class="btn ghost" data-vc-hab="ver" data-vc-id="${esc(h.id)}" title="Ver la habilidad en detalle">👁 Ver</button>
                <button type="button" class="btn ghost" data-vc-hab="editar" data-vc-id="${esc(h.id)}" title="Editar esta habilidad (solo en esta copia del creep)">✎ Editar</button>
                <button type="button" class="btn ghost" data-vc-hab="bib" data-vc-id="${esc(h.id)}"${verCreepBib && verCreepBib.habsEditadas.has(h.id) ? '' : ' disabled'} title="${verCreepBib && verCreepBib.habsEditadas.has(h.id) ? 'Proponer tu versión de esta habilidad a la biblioteca' : 'Editá la habilidad para poder proponer tu versión'}">📚 Biblioteca</button>
              </span></div>
            <div class="equipo-item-meta">${esc([costoHabCreepTxt(sc, h), num(h.cd) > 0 ? `CD ${fmt(num(h.cd))}` : '', h.cdArranca ? 'lenta (arranca en cooldown)' : ''].filter(Boolean).join(' · '))}</div>
            ${h.detalle ? `<div class="arma-detalle">${esc(h.detalle)}</div>` : ''}</div>`).join('') : '<div class="hint">Sin habilidades.</div>')
        : (habilidades ? `<div class="vc-chips">${habilidades}</div>` : '<div class="hint">Sin habilidades.</div>'))}
      ${seccion('Equipo', `<div class="vc-equipos">${equipo}</div>`)}
      ${seccion('Recompensas', recompensasVerHtml(sc))}
    </div>
    ${sc.notas ? `<div class="view-detalle"><span class="view-label">Notas</span>${esc(sc.notas)}</div>` : ''}
  `;
  $('#scrim-view').classList.toggle('desde-biblioteca', !!completo);   // por encima de la ventana de la biblioteca
  // Un creep de la mesa (no una copia de la biblioteca): el pie trae solo «✎ Editar», que abre la ficha completa para modificar los stats a mano.
  const enMesa = !completo && !sc._borrador;
  verCreepMesaId = enMesa ? sc.id : null;
  $('#view-pie').hidden = !(completo || enMesa);
  ['view-biblioteca', 'view-agregar'].forEach(id => { const b = $('#' + id); if(b) b.style.display = enMesa ? 'none' : ''; });
  $('#view-biblioteca').disabled = !(completo && verCreepBib && verCreepBib.editado);
  $('#scrim-view').classList.add('open');
}

let viendoEstadoCreep = null; // {scId, esId}

function abrirVerEstadoCreep(scId, esId){
  const sc = S.creeps.find(s => s.id === scId);
  const es = sc && sc.estados.find(x => x.id === esId);
  if(!es) return;
  viendoEstadoCreep = {scId, esId};
  const stacks = Math.max(1, num(es.stacks) || 1);
  const hpTotal = num(es.hpTurno) * stacks;
  const linea = (label, val) => (val === '' || val === null || val === undefined) ? '' : `<div class="view-line"><span class="view-label">${esc(label)}</span><span class="view-value">${esc(val)}</span></div>`;
  $('#verestado-nombre').textContent = es.nombre || 'Sin nombre';
  $('#verestado-body').innerHTML = [
    linea('Turnos restantes', es.permanente ? 'No vence' : fmt(num(es.turnos))),
    linea('Stacks', fmt(stacks)),
    linea('HP por turno', hpTotal ? `${hpTotal>=0?'+':''}${fmt(hpTotal)}` : ''),
    linea('Activo', es.activo === false ? 'No' : 'Sí'),
    (es.mods||[]).length ? linea('Modificadores', es.mods.map(m => `${ATTR_LABELS[m.stat]||m.stat} ${num(m.val)>0?'+':''}${fmt(num(m.val))}`).join(', ')) : '',
    es.detalle ? `<div class="view-detalle"><span class="view-label">Detalle</span>${esc(es.detalle)}</div>` : '',
  ].filter(Boolean).join('');
  $('#scrim-ver-estado').classList.add('open');
}

let editingEstadoCreep = null; // {scId, esId} — esId es null para un estado nuevo
let ecMods = [];

function abrirEditorEstadoCreep(scId, esId){
  const sc = S.creeps.find(s => s.id === scId);
  if(!sc) return;
  let es = null;
  if(esId){
    es = sc.estados.find(x => x.id === esId);
    if(!es) return;
  }
  editingEstadoCreep = {scId, esId};
  ecMods = structuredClone((es && es.mods) || []);
  $('#ec-preset').innerHTML = '<option value="">— elegir preset o completar a mano —</option>' + optgroupsEstadosPresetHtml() + optgroupsEstadosPersonalizadosHtml();
  $('#ec-preset').value = '';
  $('#ec-nombre').value = es ? es.nombre : '';
  $('#ec-detalle').value = es ? (es.detalle||'') : '';
  $('#ec-turnos').value = es ? es.turnos : 1;
  $('#ec-stacks').value = es ? es.stacks : 1;
  $('#ec-hpturno').value = es ? es.hpTurno : 0;
  $('#ec-stacksturno').value = es ? (es.stacksTurno ?? 0) : 0;
  $('#ec-activo').checked = es ? es.activo !== false : true;
  $('#ec-permanente').checked = es ? !!es.permanente : false;
  $('#ec-preset').dataset.polaridad = es ? (es.polaridad||'otro') : 'otro';
  FLAGS_ESTADO_CREEP.forEach(f => { $('#ec-preset').dataset[f.toLowerCase()] = es && es[f] ? '1' : ''; });
  $('#ec-preset').dataset.forzarnitros = es && es.forzarNitros !== undefined && es.forzarNitros !== null ? String(es.forzarNitros) : '';
  $('#ec-escudomagico').value = es ? (es.escudoMagico ?? 0) : 0;
  renderEcMods();
  actualizarBotonesPresetEc();
  $('#scrim-estado-creep').classList.add('open');
}

function actualizarBotonesPresetEc(){
  const nombre = $('#ec-nombre').value.trim();
  const personalizados = S.estadosPersonalizados || [];
  const yaGuardado = nombre && personalizados.some(p => p.nombre === nombre);
  $('#ec-guardarpreset').textContent = yaGuardado ? 'Actualizar preset personalizado' : '☆ Guardar como preset personalizado';
  $('#ec-borrarpreset').style.display = yaGuardado ? '' : 'none';
}

function renderEcMods(){
  $('#ec-mods-lista').innerHTML = ecMods.map((m,i) => `
    <div class="est-modrow">
      <select data-ecmodstat="${i}">
        ${[...ATTR_IDS, 'nitros'].map(a => `<option value="${a}" ${m.stat===a?'selected':''}>${a === 'nitros' ? 'No2 máx.' : ATTR_LABELS[a]}</option>`).join('')}
      </select>
      <input type="number" data-ecmodval="${i}" value="${m.val}">
      <button class="rm" data-ecmodrm="${i}">×</button>
    </div>`).join('');
}

// El tope de No2 (Stun, Exhausto) no tiene campo propio en el editor: viaja
// con el preset elegido o con el estado que se está editando.
function forzarNitrosDelEditor(){
  const v = $('#ec-preset').dataset.forzarnitros;
  return v === undefined || v === '' ? '' : num(v);
}

function guardarEditorEstadoCreep(){
  if(!editingEstadoCreep) return;
  const sc = S.creeps.find(s => s.id === editingEstadoCreep.scId);
  if(!sc) return;
  const nombre = $('#ec-nombre').value.trim() || 'Sin nombre';
  const datos = {
    nombre,
    detalle: $('#ec-detalle').value,
    turnos: Math.max(0, num($('#ec-turnos').value) || 0),
    stacks: Math.max(1, num($('#ec-stacks').value) || 1),
    hpTurno: num($('#ec-hpturno').value) || 0,
    stacksTurno: num($('#ec-stacksturno').value) || 0,
    activo: $('#ec-activo').checked,
    permanente: $('#ec-permanente').checked,
    polaridad: $('#ec-preset').dataset.polaridad || 'otro',
    escudoMagico: num($('#ec-escudomagico').value) || 0,
    forzarNitros: forzarNitrosDelEditor(),
    mods: structuredClone(ecMods),
  };
  FLAGS_ESTADO_CREEP.forEach(f => { datos[f] = $('#ec-preset').dataset[f.toLowerCase()] === '1'; });
  if(editingEstadoCreep.esId){
    const es = sc.estados.find(x => x.id === editingEstadoCreep.esId);
    if(es) Object.assign(es, datos);
    if(modsAfectanHp(datos.mods)) actualizarHpMaxPorCon(sc);
    editingEstadoCreep = null;
    $('#scrim-estado-creep').classList.remove('open');
    renderAll();
    toast(`${nombre} guardado`);
    return;
  }
  // Un estado nuevo: la misma regla que el "+ Estado" (inmunidades, acumular o renovar uno igual), comun/combatiente.js.
  const r = Combatiente.agregarEstado(sc.estados, {id: uid(), ...datos}, {jefe: sc.jefe});
  editingEstadoCreep = null;
  $('#scrim-estado-creep').classList.remove('open');
  if(!r.ok){ toast(`${sc.nombre}: inmune ahora mismo (${r.motivo}) — ${nombre} no se pudo aplicar`); return; }
  if(r.que === 'yaLoTiene'){ toast(`${sc.nombre}: ${nombre} ya lo tiene, no se acumula`); return; }
  if(modsAfectanHp(r.estado.mods)) actualizarHpMaxPorCon(sc);
  renderAll();
  toast(`${sc.nombre}: ${textoEstadoAgregado(r, 'hpTurno')}`);
}

// Escudo especial / Excedente de vida: cambiar el valor a mano (número, +N/−N o «max N»): comun/combatiente.js.
function escudoParsear(txt, actual, max){ return Combatiente.escudoParsear(txt, actual, max); }

function estadoHtml(scId, es){
  const stacks = Math.max(1, num(es.stacks) || 1);
  const hpTotal = num(es.hpTurno) * stacks;
  const efectoTxt = es.detalle ? es.detalle : (hpTotal ? `${hpTotal>=0?'+':''}${fmt(hpTotal)} HP/turno` : 'Sin efecto numérico');
  const escudoBtns = (es.escudoMagicoActual !== undefined || num(es.escudoMagico) > 0) ? `<button class="rm" data-escudo="${scId}:${es.id}:-1" title="Un punto menos de escudo">−</button><button class="rm" data-escudo="${scId}:${es.id}:set" style="width:auto;padding:0 6px" title="Escribir el valor (número, +N, -N; en un escudo, «max N» cambia el máximo)">${es.excedenteVida ? '❤+' + fmt(num(es.escudoMagicoActual ?? es.escudoMagico)) + (es.excedenteTope ? '/' + fmt(num(es.excedenteTope)) : '') : '🛡' + fmt(num(es.escudoMagicoActual ?? es.escudoMagico)) + '/' + fmt(num(es.escudoMagico))}</button><button class="rm" data-escudo="${scId}:${es.id}:1" title="Un punto más de escudo">+</button>` : '';
  return `<div class="estado-compacto estado-${es.polaridad||'otro'}">
    <div class="estado-compacto-info">
      <div class="estado-compacto-nombre">${esc(es.nombre || '(sin nombre)')}</div>
      <div class="estado-compacto-meta">${esc(efectoTxt)} · ${fmt(num(es.turnos))} turno(s)</div>
    </div>
    ${escudoBtns}
    <button class="rm" data-editarestado="${scId}:${es.id}" title="Editar">✎</button>
    <button class="rm" data-rmestado="${scId}:${es.id}">×</button>
  </div>`;
}

function habHtml(sc, h){
  const scId = sc.id;
  const bloqueo = bloqueoHabCreep(sc, h);
  const bloqueado = !!bloqueo;
  const costo = costoNitrosHabCreep(sc, h);
  const estadoTxt = bloqueo || `Disponible · ${costoHabCreepTxt(sc, h)}`;

  return `<div class="hab" data-habid="${h.id}">
    <div class="hab-top">
      <input class="hn" data-habf="nombre" data-scid="${scId}" data-habid="${h.id}" value="${esc(h.nombre)}" placeholder="Nombre">
      <div class="dur">
        <span class="durlabel">CD</span>
        <input type="number" data-habf="cd" data-scid="${scId}" data-habid="${h.id}" value="${h.cd||0}" min="0" title="Turnos de reutilización. 0 = sin cooldown">
      </div>
      ${etiquetaModoCreep(h)}<button class="rm" data-duelohabcreep="${scId}:${h.id}" title="Ejecución: cómo se juega esta habilidad">✨</button>
      <button class="rm" data-edithab="${scId}:${h.id}" title="Editar">✎</button>
      <button class="rm" data-rmhab="${scId}:${h.id}">×</button>
    </div>
    <div class="hab-detalle-text${h.detalle ? '' : ' vacio'}">${h.detalle ? esc(h.detalle) : 'Sin detalle — tocá ✎ para escribir uno.'}</div>
    <div class="hab-bottom">
      <span class="hab-estado ${bloqueado?'cd':'ok'}">${esc(estadoTxt)}</span>
      <button class="hab-ejecutar" data-ejecutar="${scId}:${h.id}" ${bloqueado?'disabled':''}>${botonHabCreepTxt(h)}</button>
      ${botonSegundaHabCreep(h, S.creeps.find(x => x.id === scId))}
      ${cdControlesHtml(S.creeps.find(x => x.id === scId) || {id: scId}, h)}
    </div>
  </div>`;
}

