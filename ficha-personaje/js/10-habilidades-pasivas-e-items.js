// js/10-habilidades-pasivas-e-items.js — tramo 10 de 14 del script de ficha.html (paso 5, nivel A: mismo código, en el mismo orden).
/* ---------- + Habilidad: de clase (pool cargado) o custom ----------
   Job: cualquier habilidad de clase prefabricada 1 punto, custom 2.
   El pool sale de comun/skills-clase.js (CLASES_SKILLS). */
const HAB_JOB_CUSTOM = 2;
const HAB_JOB_CLASE = 1;
const normClase = t => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
const claveHabClase = h => h.habClaseId || '';
function esMiClase(clase){
  const mia = normClase(S.meta.clase);
  return !!mia && (mia === normClase(clase.nombre) || mia === clase.id);
}
// Mismo vocabulario de "función" y "tipo de daño" que datos/auditoria-skills.html (ver su comentario): ahí es
// donde se cargan las etiquetas (`h.etiquetas`), acá solo se leen para armar los filtros del pool.
const FUNCION_TAGS = ['daño', 'defensa', 'buff', 'debuff', 'curación', 'control', 'movilidad', 'invocación', 'área'];
const TIPODANO_TAGS = ['arcano', 'fuego', 'hielo', 'rayo', 'físico'];
let poolFiltroFuncion = '', poolFiltroTipoDano = '';
/* Habilidades subidas por el grupo (subida unificada, paso 2 de docs/plan-subida-unificada.md, 2026-09-29).
   "+ Habilidad" muestra lo de fábrica (CLASES_SKILLS / SKILLS_CUSTOM de comun/skills-clase.js) MÁS lo que subió
   cualquiera a la biblioteca (`biblioteca_skills`, comun/biblioteca.js), al instante. Una corrección de una de fábrica
   la reemplaza en la lista (conserva su id, así "Ya la tenés" sigue andando); una subida nueva aparece en su clase
   (`datos.clase`) o en el pool custom. Solo las `para: 'jugador'` (P122: las de creep pagan con cooldown, no SP). */
let skillsSubidas = [], skillsDeCreep = [];
async function cargarSkillsSubidas(){
  if(typeof Biblioteca === 'undefined' || !Biblioteca.lista) return;
  const todas = (await Biblioteca.lista('skills')).filter(e => e.datos);
  skillsSubidas = todas.filter(e => (e.datos.para || 'jugador') === 'jugador');
  // Las 🐾 de creep (pagan con cooldown, P122/P125) se ofrecen aparte, con el aviso bien visible (🐾 De creep).
  skillsDeCreep = todas.filter(e => e.datos.para === 'creep');
}
const claseDeSubida = e => { const c = e.datos.clase; return c && CLASES_SKILLS.some(x => x.id === c) ? c : '_custom'; };
// Una entrada subida, en la forma de una skill del pool; `_bib` = de dónde salió (para Agregar y el aviso de versión).
function skillDeEntrada(e, idPool){
  return {...structuredClone(e.datos), id: idPool,
    _bib: {id: e.id, version: e.version || 1, auditado: e.auditado, autor: e.editorNombre || e.autorNombre || '', subida: true}};
}
function habsDelPool(claseId){
  if(claseId === '_creep') return skillsDeCreep.map(e => skillDeEntrada(e, 'bib-' + e.id));
  const esCustom = claseId === '_custom';
  const clase = esCustom ? null : CLASES_SKILLS.find(c => c.id === claseId);
  const fabrica = esCustom ? (typeof SKILLS_CUSTOM !== 'undefined' ? SKILLS_CUSTOM : []) : (clase ? clase.habilidades : []);
  const lista = fabrica.map(h => {
    const corr = skillsSubidas.find(e => e.reemplaza === 'base-' + h.id);
    return corr ? skillDeEntrada(corr, h.id) : {...h, _bib: {id: 'base-' + h.id, version: 1, auditado: true}};
  });
  skillsSubidas.filter(e => !e.reemplaza && claseDeSubida(e) === claseId).forEach(e => lista.push(skillDeEntrada(e, 'bib-' + e.id)));
  return lista;
}
// De qué elemento de la biblioteca salió una habilidad del personaje ({tipo, id, version}); las de clase que se
// agregaron antes de la subida unificada no tienen `bibOrigen`: salen de la de fábrica, versión 1.
function origenDeHab(it){
  if(it.bibOrigen && it.bibOrigen.id) return it.bibOrigen;
  if(it.habClaseId && !String(it.habClaseId).startsWith('bib-')) return {tipo: 'skills', id: 'base-' + it.habClaseId, version: 1};
  return null;
}
// ¿Hay una versión más nueva de la que tiene el personaje? Devuelve la entrada de la biblioteca, o null.
function versionNuevaDeHab(it){
  const o = origenDeHab(it);
  if(!o) return null;
  return typeof Biblioteca !== 'undefined' && Biblioteca.versionNueva ? Biblioteca.versionNueva([...skillsSubidas, ...skillsDeCreep], o, it.bibIgnorada) : null;
}
// ⬆ Subir: la habilidad del personaje, con toda su configuración, a la biblioteca (comun/biblioteca.js). Si salió de
// otra, pregunta si es una corrección (queda en la clase del original) o algo nuevo (va al pool custom).
function subirHabilidad(it){
  if(typeof Biblioteca === 'undefined' || typeof Plantillas === 'undefined') return;
  const o = origenDeHab(it);
  const claseOrigen = () => {
    const id = String(it.habClaseId || '');
    if(id.startsWith('bib-')){ const e = skillsSubidas.find(x => 'bib-' + x.id === id); return e ? claseDeSubida(e) : '_custom'; }
    const c = CLASES_SKILLS.find(c => c.habilidades.some(h => h.id === id));
    return c ? c.id : '_custom';
  };
  Biblioteca.guardar({tipo: 'skills', nombre: it.nombre, nivel: 0,
    basadoEn: o ? {id: o.id, nombre: it.nombre} : null,
    datosPara: modo => {
      if(it.para === 'creep' && modo === 'correccion'){ const d = structuredClone(it); ['id', 'job', 'jobCosto', 'origen', 'imagen', 'habClaseId', 'habClase', 'usadaEsteTurno'].forEach(k => delete d[k]); return {...d, para: 'creep'}; }
      const d = Plantillas.habilidad(it); delete d.id; return {...d, para: 'jugador', clase: modo === 'correccion' ? claseOrigen() : '_custom'};
    },
    alSubir: r => {
      it.bibOrigen = {tipo: 'skills', id: r.id, version: r.version};
      delete it.bibIgnorada;
      if(r.modo === 'nuevo'){ it.habClaseId = 'bib-' + r.id; it.habClase = 'Pool custom'; delete it.para; }
      refresh();
      cargarSkillsSubidas().then(() => renderList('habilidades')).catch(() => {});
    }});
}
// Pisa la configuración de la habilidad con la versión de la biblioteca; conserva lo del personaje (Job, imagen…).
function actualizarHabDesdeBib(it, e){
  const guardar = {id: it.id, job: it.job, jobCosto: it.jobCosto, origen: it.origen, imagen: it.imagen, habClaseId: it.habClaseId, habClase: it.habClase};
  Plantillas.HAB.forEach(k => delete it[k]);
  const {para, clase, id, ...d} = structuredClone(e.datos);
  Object.assign(it, d, guardar, {costo: d.costo || '', nitrosCosto: d.nitrosCosto ?? IT2.nitrosHabilidad, automatizada: d.automatizada !== false,
    duelo: d.duelo || null, bibOrigen: {tipo: 'skills', id: e.id, version: e.version || 1}, ...(para === 'creep' ? {para: 'creep'} : {})});
  delete it.bibIgnorada;
}
function abrirVersionNuevaHab(it){
  const e = versionNuevaDeHab(it);
  if(!e) return;
  Biblioteca.avisoVersion({nombre: it.nombre, entrada: e, que: 'La habilidad',
    actualizarTxt: 'reemplaza la configuración de tu habilidad (costo, tirada, Ejecución…) por la nueva; tu Job y tu imagen quedan.',
    alActualizar: () => { actualizarHabDesdeBib(it, e); toast(`${it.nombre} actualizada a la versión ${fmt(e.version || 1)}`); renderList('habilidades'); refresh(); },
    alDejar: () => { it.bibIgnorada = e.id + ':' + (e.version || 1); renderList('habilidades'); refresh(); }});
}
// '_custom' es un id de pseudo-clase (no está en CLASES_SKILLS) para el pool SKILLS_CUSTOM (2026-09-29, pedido del
// dueño): mismo menú y mismo mecanismo de "Agregar" que una clase real, pero cuesta 2 de Job (HAB_JOB_CUSTOM, lo
// mismo que armar una habilidad custom de cero) en vez de 1 — es una skill sin auditar del todo por la mesa, no
// una ya cerrada de una clase.
let habClaseVista;
function abrirHabClase(claseId, yaLeido){
  // Lo subido se relee cada vez que se abre (y se redibuja al llegar): lo que subió otro aparece sin recargar.
  habClaseVista = claseId;
  if(!yaLeido) cargarSkillsSubidas().then(() => { if($('#scrim-hab-clase').classList.contains('open') && habClaseVista === claseId) abrirHabClase(claseId, true); }).catch(() => {});
  const deCreep = claseId === '_creep';
  const esCustomPool = claseId === '_custom' || deCreep;
  const clase = esCustomPool ? null : CLASES_SKILLS.find(c => c.id === claseId);
  $('#scrim-hab-clase').classList.add('open');
  if(claseId !== '_custom'){ poolFiltroFuncion = ''; poolFiltroTipoDano = ''; }   // filtros del pool: se resetean al salir de él
  if(!clase && !esCustomPool){
    $('#hab-clase-titulo').textContent = 'Nueva habilidad';
    const pool = habsDelPool('_custom');
    const deCreep = habsDelPool('_creep');
    $('#hab-clase-body').innerHTML = `
      <div class="hint" style="margin-bottom:10px">Habilidad de clase = elegís una ya armada y queda cargada con toda su configuración. Custom = la armás vos paso a paso.</div>
      <div class="opcion-fila" style="margin-bottom:14px">
        <button type="button" class="opcion-btn" data-habclase-custom="1">Habilidad custom<br><small>2 de Job</small></button>
        <button type="button" class="opcion-btn" data-habclase-clase="_custom" ${pool.length ? '' : 'disabled'}>🧩 Pool custom<br><small>${pool.length ? pool.length + ' cargada' + (pool.length === 1 ? '' : 's') + ' · 2 de Job' : 'sin cargar'}</small></button>
        <button type="button" class="opcion-btn" data-habclase-clase="_creep" ${deCreep.length ? '' : 'disabled'} title="Habilidades pensadas para creeps: pagan con cooldown, no con SP">🐾 De creep<br><small>${deCreep.length ? deCreep.length + ' · 2 de Job · usan cooldown' : 'ninguna subida'}</small></button>
      </div>
      <div class="cat-grouphead" style="margin-top:0"><span>Habilidad de clase</span></div>
      <div class="hint" style="margin:6px 0">Cualquier habilidad de clase cuesta 1 de Job${S.meta.clase ? ` (tu clase: <b>${esc(S.meta.clase)}</b>)` : ''}.</div>
      <div class="opcion-fila">${CLASES_SKILLS.map(c => { const n = habsDelPool(c.id).length; return `<button type="button" class="opcion-btn" data-habclase-clase="${c.id}" ${n ? '' : 'disabled'}>${esc(c.nombre)}${esMiClase(c) ? ' ★' : ''}<br><small>${n ? n + ' cargada' + (n === 1 ? '' : 's') : 'sin cargar'}</small></button>`; }).join('')}</div>`;
    return;
  }
  const listaCompleta = habsDelPool(claseId);
  const lista = claseId === '_custom' ? listaCompleta.filter(h => (!poolFiltroFuncion || (h.etiquetas || []).includes(poolFiltroFuncion)) && (!poolFiltroTipoDano || (h.etiquetas || []).includes(poolFiltroTipoDano))) : listaCompleta;
  const costo = esCustomPool ? HAB_JOB_CUSTOM : HAB_JOB_CLASE;
  $('#hab-clase-titulo').textContent = deCreep ? '🐾 Habilidades de creep' : esCustomPool ? '🧩 Pool custom' : `Habilidades de ${clase.nombre}`;
  $('#hab-clase-body').innerHTML = `
    <button type="button" class="btn ghost" data-habclase-volver="1" style="margin-bottom:10px">← Volver</button>
    ${deCreep ? `<div class="hint" style="margin-bottom:8px;color:#e0a040"><b>🐾 Creep · cooldown</b> — estas habilidades se armaron para creeps: pagan con <b>cooldown</b>, no con SP. En tu ficha no hay cooldown: si agregás una, ponele un costo en SP (✎ Editar).</div>` : ''}
    <div class="hint" style="margin-bottom:8px">Cada una cuesta <b>${costo} de Job</b>${claseId === '_custom' ? ' — pool abierto de cualquiera, sin auditar del todo por la mesa' : ''}. Te quedan ${fmt(jobBudget().resto)}.</div>
    ${claseId === '_custom' ? `<div class="opcion-fila" style="margin-bottom:10px">
      <select id="pool-filtro-funcion" style="flex:1;min-width:140px">${'<option value="">Cualquier función</option>'}${FUNCION_TAGS.map(t => `<option value="${esc(t)}"${poolFiltroFuncion === t ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select>
      <select id="pool-filtro-tipodano" style="flex:1;min-width:140px">${'<option value="">Cualquier tipo de daño</option>'}${TIPODANO_TAGS.map(t => `<option value="${esc(t)}"${poolFiltroTipoDano === t ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select>
    </div>` : ''}
    <div class="habs-grid" style="grid-template-columns:1fr">${lista.map(h => {
      const ya = S.habilidades.some(x => claveHabClase(x) === h.id);
      const costoTxt = costoHabilidadTxt({...h, automatizada: h.automatizada !== false});
      return `<div class="habs-grid-item">
        <div style="display:flex;justify-content:space-between;gap:8px"><b>${esc(h.nombre)}</b>
        <button type="button" class="mini" data-habclase-agregar="${esCustomPool ? claseId : clase.id}:${h.id}" ${ya ? 'disabled' : ''}>${ya ? 'Ya la tenés' : 'Agregar'}</button></div>
        ${h._bib && h._bib.subida ? `<div class="hint" style="margin-top:2px">${h._bib.auditado ? '' : '<b style="color:#e0a040" title="La subió alguien del grupo y todavía no la revisó el dueño. Se puede usar igual.">🔶 sin auditar</b> · '}${h._bib.version > 1 ? `v${fmt(h._bib.version)} · ` : ''}subida por ${esc(h._bib.autor || 'alguien')}</div>` : ''}
        ${costoTxt ? `<div class="habs-grid-costo">${esc(costoTxt)}</div>` : ''}
        ${(h.etiquetas || []).length ? `<div class="hint" style="margin-top:2px">${h.etiquetas.map(esc).join(' · ')}</div>` : ''}
        <div class="hint" style="margin-top:4px">${esc(h.detalle)}</div>
      </div>`;
    }).join('') || `<div class="hint">${esCustomPool && listaCompleta.length ? 'Ninguna con ese filtro.' : 'Todavía no hay ninguna acá.'}</div>`}</div>`;
  if(claseId === '_custom'){
    $('#pool-filtro-funcion').onchange = e => { poolFiltroFuncion = e.target.value; abrirHabClase('_custom', true); };
    $('#pool-filtro-tipodano').onchange = e => { poolFiltroTipoDano = e.target.value; abrirHabClase('_custom', true); };
  }
}
function agregarHabClase(claseId, habId){
  const deCreep = claseId === '_creep';
  const esCustomPool = claseId === '_custom' || deCreep;
  const clase = esCustomPool ? null : CLASES_SKILLS.find(c => c.id === claseId);
  const base = habsDelPool(claseId).find(h => h.id === habId);
  if(!base) return;
  if(S.habilidades.some(x => claveHabClase(x) === base.id)){ toast(`${base.nombre} ya está en tu pool`); return; }
  const job = esCustomPool ? HAB_JOB_CUSTOM : HAB_JOB_CLASE;
  // Se copia todo lo que trae la skill (costo, tirada, estado al ejecutar, la Ejecución completa…), y de dónde salió
  // (`bibOrigen`) para el aviso de versión nueva. Una subida sin Ejecución queda sin (null): si no, `dueloDe` caería en
  // la Ejecución de la de fábrica con el mismo id.
  const {_bib, para, clase: _clase, ...copia} = structuredClone(base);
  S.habilidades.push({
    ...copia,
    id: uid(), costo: base.costo || '', nitrosCosto: base.nitrosCosto ?? IT2.nitrosHabilidad,
    automatizada: base.automatizada !== false, job: true, jobCosto: job, origen: '', imagen: '',
    habClaseId: base.id, habClase: deCreep ? 'De creep' : esCustomPool ? 'Pool custom' : clase.nombre,
    ...(para === 'creep' ? {para: 'creep'} : {}),   // queda la marca 🐾 a la vista en la ficha
    ...(_bib ? {bibOrigen: {tipo: 'skills', id: _bib.id, version: _bib.version}} : {}),
    ...(_bib && _bib.subida ? {duelo: copia.duelo || null} : {}),
  });
  $('#scrim-hab-clase').classList.remove('open');
  renderList('habilidades');
  refresh();
  toast(deCreep ? `🐾 ${base.nombre} agregada (${job} de Job) — es de creep: ponele un costo en SP` : `${base.nombre} agregada (${job} de Job)`);
}
$('#hab-clase-x').onclick = () => $('#scrim-hab-clase').classList.remove('open');
$('#scrim-hab-clase').addEventListener('mousedown', e => { if(e.target.id === 'scrim-hab-clase') $('#scrim-hab-clase').classList.remove('open'); });
$('#hab-clase-body').addEventListener('click', e => {
  const b = e.target.closest('button'); if(!b) return;
  if(b.dataset.habclaseCustom){ $('#scrim-hab-clase').classList.remove('open'); openEditor('habilidades', null); return; }
  if(b.dataset.habclaseClase){ abrirHabClase(b.dataset.habclaseClase); return; }
  if(b.dataset.habclaseVolver){ abrirHabClase(); return; }
  if(b.dataset.habclaseAgregar){ const [c, h] = b.dataset.habclaseAgregar.split(':'); agregarHabClase(c, h); }
});

/* ---------- + Pasiva: catálogo (base del código + aprobadas en Firebase) o custom ----------
   Una pasiva se compra varias veces (`compras`): sus efectos y su costo en Job se
   multiplican. Tope por pasiva: mitad del nivel, redondeada hacia abajo (mínimo 1).
   Efectos automatizados: mods (bonos a stats) y regenHp (Mantenimiento).
   Las creadas de cero se pueden mandar como propuesta con "📚 Proponer". */
const pasivaCompras = FichaCalculo.pasivaCompras;   // comun/ficha-calculo.js
const PASIVA_TOPE = () => Math.max(1, Math.floor(Math.max(1, num(S.meta.nivel) || 1) / 2));
const claveDePasiva = d => d.poolId || ('p-' + normClase(d.nombre));

/* Subida unificada (paso 4 de docs/plan-subida-unificada.md): una pasiva agregada desde la biblioteca guarda de dónde
   salió (`bibOrigen`); ⬆ Subir pregunta si es una corrección o una nueva, y si el original se corrige la fila muestra
   🔔 (cartel compartido `Biblioteca.avisoVersion`). */
let pasivasSubidas = [];
function cargarPasivasSubidas(){
  if(typeof Biblioteca === 'undefined' || !Biblioteca.lista) return Promise.resolve();
  return Biblioteca.lista('pasivas').then(l => { pasivasSubidas = l; renderList('pasivas'); }).catch(() => {});
}
// Las pasivas de fábrica que se agregaron antes de esto no tienen `bibOrigen`: salen de la de fábrica (poolId), versión 1.
function origenDePasiva(p){
  if(p.bibOrigen && p.bibOrigen.id) return p.bibOrigen;
  if(p.poolId && typeof PASIVAS_BASE !== 'undefined' && PASIVAS_BASE.some(b => b.poolId === p.poolId)) return {tipo: 'pasivas', id: 'base-' + p.poolId, version: 1};
  return null;
}
const versionNuevaDePasiva = p => typeof Biblioteca !== 'undefined' && Biblioteca.versionNueva ? Biblioteca.versionNueva(pasivasSubidas, origenDePasiva(p), p.bibIgnorada) : null;
function abrirVersionNuevaPasiva(p){
  const e = versionNuevaDePasiva(p);
  if(!e) return;
  Biblioteca.avisoVersion({nombre: p.nombre, entrada: e, que: 'La pasiva',
    actualizarTxt: 'cambia su nombre, descripción, costo en Job y bonos por los nuevos; las veces que la compraste quedan.',
    alActualizar: () => {
      const d = e.datos;
      Object.assign(p, {nombre: d.nombre || p.nombre, detalle: d.detalle || '', jobCosto: Math.max(0, num(d.jobCosto) || 1),
        mods: (d.mods || []).map(m => ({...m})), regenHp: num(d.regenHp) || 0, bibOrigen: {tipo: 'pasivas', id: e.id, version: e.version || 1}});
      delete p.bibIgnorada;
      toast(`${p.nombre} actualizada a la versión ${fmt(e.version || 1)}`);
      renderList('pasivas'); refresh();
    },
    alDejar: () => { p.bibIgnorada = e.id + ':' + (e.version || 1); renderList('pasivas'); refresh(); }});
}

function abrirPasivaNueva(){
  cargarPasivasSubidas();
  Biblioteca.abrir({
    tipo: 'pasivas', titulo: 'Pasiva nueva',
    base: PASIVAS_BASE,
    textoCrearDeCero: '+ Crear de cero',
    alCrearDeCero: () => openEditor('pasivas', null),
    alElegir: agregarPasivaDeCatalogo,
    subtitulo: e => ` · ${fmt(num(e.datos.jobCosto) || 1)} Job`,
  });
}

function agregarPasivaDeCatalogo(datos, meta){
  // La corrección de una de fábrica se acumula con la de fábrica (misma clave), no como otra pasiva distinta.
  const clave = datos.poolId || (meta && String(meta.reemplaza || '').startsWith('base-') ? meta.reemplaza.slice(5) : claveDePasiva(datos));
  const costo = Math.max(0, num(datos.jobCosto) || 1);
  const tope = PASIVA_TOPE();
  const ya = S.pasivas.find(p => (p.poolId || claveDePasiva(p)) === clave);
  if(ya){
    if(pasivaCompras(ya) >= tope){ toast(`${ya.nombre}: ya tenés el máximo de compras (${tope}, la mitad de tu nivel)`); return; }
    ya.compras = pasivaCompras(ya) + 1;
    toast(`${ya.nombre} ×${ya.compras} (+${costo} de Job) · te quedan ${fmt(jobBudget().resto)}`);
  }else{
    S.pasivas.push({
      ...structuredClone(datos), id: uid(), poolId: clave, compras: 1,
      mods: (datos.mods || []).map(m => ({...m})), regenHp: num(datos.regenHp) || 0,
      job: true, jobCosto: costo, origen: '', imagen: '',
      ...(meta && meta.id ? {bibOrigen: {tipo: 'pasivas', id: meta.id, version: meta.version || 1}} : {}),
    });
    toast(`${datos.nombre} agregada (${costo} de Job) · te quedan ${fmt(jobBudget().resto)}`);
  }
  renderList('pasivas');
  refresh();
}

// ⬆ Sube una pasiva a la biblioteca compartida: disponible para todos al instante (el dueño la audita después).
function proponerPasiva(id){
  const p = S.pasivas.find(x => x.id === id);
  if(!p) return;
  const datos = {nombre: p.nombre, detalle: p.detalle || '', jobCosto: Math.max(1, num(p.jobCosto) || 1),
    mods: (p.mods || []).map(m => ({stat: m.stat, val: num(m.val)})), regenHp: num(p.regenHp) || 0};
  const o = origenDePasiva(p);
  Biblioteca.guardar({tipo: 'pasivas', datos, nombre: p.nombre, nivel: datos.jobCosto, base: typeof PASIVAS_BASE !== 'undefined' ? PASIVAS_BASE : [],
    basadoEn: o ? {id: o.id, nombre: p.nombre} : null,
    alSubir: r => { p.bibOrigen = {tipo: 'pasivas', id: r.id, version: r.version}; delete p.bibIgnorada; refresh(); cargarPasivasSubidas(); }});
}

function openEditor(key, id, equipadoPreset, opciones){
  const sc = SCHEMA[key];
  const defaults = {id:uid(), nombre:'', peso:0, ranuras:1, detalle:'', mods:[],
    equipado: equipadoPreset !== undefined ? equipadoPreset : true,
    activo:true, stacks:1, costo:'', nitrosCosto:IT2.nitrosHabilidad, dado:'', turnos:'', hpturno:0, stacksturno:0, permanente:false, popup:false,
    compras:1, regenHp:0,
    job:true, origen:'', imagen:'', categoria:'', tipoItem:'', tipoDado:8, danoFijo:0, danoAmplificado:0, armaDeRango:false, manoPreferida:'',
    unidades:1, consumible:false, curahp:0, precioCompra:0,
    efectoNombre:'', efectoTurnos:0, efectoHpTurno:0, efectoEscudo:0, efectoStacks:1, efectoPermanente:false, efectoDetalle:'', efectoMods:[], curaspPct:0, cargaMax:1, cargaActual:1,
    forzarNitros:'', mitadPdgEva:false, armaduraRota:false, escudoMagico:0, tiradaExtra:'', tiradaStat:'',
    equipoEstadoNombre:'', equipoEstadoHpTurno:0, equipoEstadoDetalle:''};
  const op = opciones || {};
  const item = op.draft ? Object.assign({}, defaults, op.draft) : id ? Object.assign({}, defaults, S[key].find(x=>x.id===id)) : defaults;
  // Ítems de inventario y catálogo (menos consumibles): asistente paso a paso.
  if(!op.formulario && (key === 'inventario' || key === 'catalogo') && item.tipoItem !== 'consumibles'){
    abrirAsistenteItem(key, id, {equipadoPreset, draft: op.draft});
    return;
  }
  editing = {key, id, draft: structuredClone(item), paso: 0};
  // Una habilidad nueva arranca sin respuesta a "¿automatizarla?": es lo
  // primero que se pregunta. Las que ya existen (sin el dato) cuentan como
  // automatizadas.
  if(key === 'habilidades' && !id && !op.draft){ editing.draft.automatizada = null; editing.draft.modo = null; editing.draft.jobCosto = HAB_JOB_CUSTOM; }
  $("#modal-save").style.display = "";
  $('#modal-title').textContent = (id ? 'Editar ' : 'Nueva ') + sc.titulo.toLowerCase();
  $('#modal-del').style.display = id ? 'block' : 'none';
  $('#modal-catalogo').style.display = (key === 'inventario' || key === 'cinturon' || key === 'catalogo') ? 'block' : 'none';
  $('#modal-activar').style.display = key === 'efectos' ? '' : 'none';
  drawEditor();
  $('#scrim').classList.add('open');
  setTimeout(()=>$('#modal-body').querySelector('input')?.focus(), 40);
}

function campoImagenHtml(draft){
  return `<div class="f">
    <label>${CAMPO_LABEL.imagen}</label>
    <button type="button" class="itempick" id="itempick">
      ${draft.imagen ? `<img src="${draft.imagen}" alt="">` : `<span class="itempick-empty">+<small>Imagen</small></span>`}
    </button>
    ${draft.imagen ? `<button type="button" class="mini" id="itempick-remove" style="margin-top:6px">Quitar imagen</button>` : ''}
    <input type="file" id="itempick-input" accept="image/*" hidden>
  </div>`;
}
/* ---------- Habilidades: editor paso a paso ----------
   Crear o editar una habilidad va en pasos cortos, cada uno con una
   pregunta que guía al jugador. Al crear, "Guardar" aparece en el último
   paso; al editar, está siempre (y se puede saltar a cualquier paso). */
const PASOS_HAB = {
  auto: {id: 'auto', corto: 'Cómo se ejecuta', titulo: '¿Cómo se ejecuta esta habilidad?',
   ayuda: 'Tres formas, de menos a más automática. Se puede cambiar cuando quieras.'},
  ejecucion: {id: 'ejecucion', corto: 'Ejecución', titulo: '¿Cómo se juega paso a paso?',
   ayuda: 'El costo, a quién apunta, qué tira cada uno, el daño y los efectos. Se arma en el cuadro de Ejecución (✨), el mismo que se abre para toda la mesa al usarla.'},
  anterior: {id: 'anterior', corto: 'Del sistema anterior', titulo: 'Lo que tenía del sistema anterior',
   ayuda: 'Esta habilidad todavía tiene cosas del sistema de automatización anterior. Se siguen aplicando solas al ejecutarla hasta que la adaptes: lo ideal es pasarla a ✨ Automático y armar ahí su ejecución.'},
  que: {id: 'que', corto: 'Qué es', titulo: '¿Cómo se llama y qué hace?',
   ayuda: 'Contalo como lo leería la mesa: esta descripción aparece en la Mesa cada vez que la uses.'},
  costo: {id: 'costo', corto: 'Costo', titulo: '¿Qué cuesta usarla?',
   ayuda: 'Se descuenta solo al ejecutarla. El SP se gasta y no vuelve al pasar turno; los Nitros (No2) se recargan en cada Mantenimiento. SP vacío = no gasta. En SP y en No2, X = lo elegís al usarla.'},
  tiradaEj: {id: 'tiradaEj', corto: 'Tirada al ejecutar', titulo: '¿Qué se tira al tocar Ejecutar?',
   ayuda: 'Lo que se tira apenas tocás Ejecutar: elegí el stat del golpe o de la prueba (por ejemplo PdG para un ataque). Es la PRIMERA tirada, de golpe. Si no elegís ninguno, Ejecutar no tira un stat (y si en el paso siguiente hay una fórmula, Ejecutar tira esa fórmula directamente).'},
  tiradaEf: {id: 'tiradaEf', corto: 'Tirada de efecto', titulo: '¿Tiene una tirada de efecto (daño, curación…)?',
   ayuda: 'La tirada interna de la habilidad: daño, curación, duración… (por ejemplo 2d6+3). Aparece como un botoncito 🎲 en la misma tarjeta, al lado de Ejecutar, y solo si esta tirada existe y hay un stat en el paso anterior. Sin stat, Ejecutar tira esta fórmula directamente y no hay botón aparte. Se puede dejar vacía.'},
  efecto: {id: 'efecto', corto: 'Efecto', titulo: '¿Qué pasa cuando la usás?',
   ayuda: 'La tirada: podés vincularla a un stat (se tira con su valor del momento, con los modificadores activos), escribir una fórmula, las dos cosas o ninguna (por ejemplo, si incluye un ataque, elegí PdG para que tire el golpe). Y lo que habilita: un estado alterado sobre vos (un buff, un recordatorio). Si no aplica ninguno, dejá el nombre vacío.'},
  origen: {id: 'origen', corto: 'Origen', titulo: '¿Cómo la conseguiste?',
   ayuda: 'Las que se compran con puntos de Job descuentan de tu Job disponible.'},
  listo: {id: 'listo', corto: 'Listo', titulo: 'Revisá cómo quedó',
   ayuda: 'Si algo no está bien, tocá el paso arriba para volver. Si está todo, guardala.'},
};
// Automatizada (o sin definir, como las de antes): pide costo y efecto.
// No automatizada: solo qué es, origen y listo.
/* Tres modos de ejecución (regla del dueño, 2026-09-30 — reemplaza a "¿automatizarla? sí/no" + el tilde "¿se juega en el
   duelo?", que se superponían): 'manual' (📣 Anunciar: publica el texto y todo va a mano), 'semi' (💰 cobra solo el costo
   —Nitros, SP, HP— y tira la tirada inicial si la tiene; los efectos van a mano) y 'auto' (✨ la Ejecución paso a paso:
   objetivo, tiradas de cada uno, efectos). Se guarda en `h.modo`; las de antes lo deducen: automatizada === false →
   manual, con `duelo` configurado → auto, el resto → semi. Lo del sistema anterior (estado sobre uno mismo, cura, trampa)
   se sigue aplicando en semi y en auto hasta que se adapte cada habilidad. */
const MODOS_HAB = {
  manual: {icono: '📣', nombre: 'Manual', boton: 'Anunciar', corto: 'solo se anuncia'},
  semi: {icono: '💰', nombre: 'Semiautomático', boton: 'Ejecutar', corto: 'cobra el costo y tira la tirada inicial'},
  auto: {icono: '✨', nombre: 'Automático', boton: 'Ejecutar', corto: 'ejecución paso a paso'},
};
function modoHab(h){ return FichaBotonera.modoHab(h); }   // la regla común (comun/combatiente.js), vía comun/ficha-botonera.js
const habAutomatizada = h => FichaBotonera.habAutomatizada(h);
// Lo del sistema anterior que tiene cargado la habilidad (se sigue aplicando en semi y auto hasta adaptarla).
function habLegado(h){
  const L = [];
  if(String(h.efectoNombre || '').trim()) L.push(`estado «${h.efectoNombre}» sobre vos`);
  if(num(h.curaHp) > 0) L.push(`cura ${fmt(num(h.curaHp))} HP`);
  if(h.trampaColocar && modoHab(h) !== 'auto') L.push('coloca una trampa');
  if(h.zonaMapa || h.portalMapa) L.push(h.portalMapa ? 'abre un portal' : 'marca una zona');
  return L;
}
function pasosHabilidad(draft){
  const m = modoHab(draft);
  const anterior = habLegado(draft).length ? [PASOS_HAB.anterior] : [];
  if(m === 'semi') return [PASOS_HAB.auto, PASOS_HAB.que, PASOS_HAB.costo, PASOS_HAB.tiradaEj, PASOS_HAB.tiradaEf, ...anterior, PASOS_HAB.origen, PASOS_HAB.listo];
  if(m === 'auto') return [PASOS_HAB.auto, PASOS_HAB.que, PASOS_HAB.ejecucion, ...anterior, PASOS_HAB.origen, PASOS_HAB.listo];
  return [PASOS_HAB.auto, PASOS_HAB.que, PASOS_HAB.origen, PASOS_HAB.listo];
}

function drawEditorHabilidad(){
  const {draft} = editing;
  const pasos = pasosHabilidad(draft);
  const total = pasos.length;
  const paso = Math.max(0, Math.min(total - 1, editing.paso || 0));
  editing.paso = paso;
  const info = pasos[paso];
  const nuevo = !editing.id;
  const etiqueta = (texto, extra) => `<span style="font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)">${texto}</span>${extra || ''}`;

  let html = `<div class="pasos-hab">${pasos.map((p, i) => {
    // Al crear, no se puede saltar adelante sin haber respondido lo primero
    // (¿automatizar?) ni sin nombre.
    const bloqueado = nuevo && i > paso && (modoHab(draft) === null || !(draft.nombre || '').trim());
    return `<button type="button" class="paso-chip${i === paso ? ' activo' : ''}${i < paso ? ' hecho' : ''}" data-hab-paso="${i}" ${bloqueado ? 'disabled' : ''}>${i + 1}. ${p.corto}</button>`;
  }).join('')}</div>`;
  html += `<div class="paso-titulo">${info.titulo}</div><p class="paso-ayuda">${info.ayuda}</p>`;

  if(info.id === 'auto'){
    const m = modoHab(draft);
    const EXPLICA = {
      manual: 'El botón se llama <b>Anunciar</b>: publica la descripción en la Mesa y la mesa se ocupa de todo lo demás (costos, tiradas y efectos, a mano). No cobra ni tira nada.',
      semi: 'Al tocar <b>Ejecutar</b> la ficha <b>cobra sola el costo</b> (Nitros, SP y HP, si tiene) y <b>tira la tirada inicial</b> si la tiene (por lo general, la PdG). Publica la descripción en la Mesa; los efectos se resuelven a mano.',
      auto: 'Al tocar <b>Ejecutar</b> se abre la <b>Ejecución paso a paso</b>, a la vista de toda la mesa: cobra el costo, elegís el objetivo en el mapa, cada involucrado tira en su momento, se ven los resultados y se aplican los efectos. Si es solo sobre vos y no tira nada (como Blindaje), se aplica directo con un anuncio.',
    };
    html += `<div class="modos-hab">${Object.entries(MODOS_HAB).map(([k, v]) => `
        <button type="button" class="opcion-btn modo-hab-btn ${m === k ? 'activa' : ''}" data-hab-modo="${k}">
          <b>${v.icono} ${v.nombre}</b><span>${EXPLICA[k]}</span>
        </button>`).join('')}</div>
      ${m === null ? '<div class="hint" style="margin-top:8px">Elegí una para seguir.</div>' : ''}`;
  }
  if(info.id === 'ejecucion'){
    const c = dueloDe(draft);
    html += `<div class="hint" style="margin:6px 0 10px">${c ? `Configurada: <b>${esc(resumenEjecucionHab(c))}</b>.` : 'Todavía <b>no está configurada</b>: sin esto, al ejecutarla solo cobra el costo y tira la tirada inicial (como la semiautomática).'}</div>
      <button type="button" class="btn primary" data-hab-ejecucion="1" style="width:100%">✨ ${c ? 'Cambiar' : 'Armar'} la ejecución paso a paso</button>
      <div class="hint" style="margin:14px 0 0">¿La habilidad coloca una trampa? Tildalo acá: al ejecutarla se cobra el costo, se anuncia en la Mesa (sin decir dónde) y elegís la casilla en el mapa.</div>`;
    html += trampaHtml(draft);
  }
  if(info.id === 'anterior'){
    html += `<div class="hint" style="margin:0 0 10px">Tiene: <b>${esc(habLegado(draft).join(' · '))}</b>.</div>`;
    html += `<div class="f"><label>Vida (HP) que cura</label>
        <input data-c="curaHp" type="number" step="1" min="0" value="${esc(num(draft.curaHp))}" data-hab-enter="1" style="max-width:120px">
        <div class="hint" style="margin-top:5px">Se suma sola a tu vida al ejecutarla, sin pasar del máximo. 0 = no cura.</div></div>`;
    html += htmlEstadoAlUsar('habilidades', draft);
    html += trampaHtml(draft);
  }
  if(info.id === 'que'){
    html += `<div class="f"><label>Nombre</label><input data-c="nombre" value="${esc(draft.nombre)}" placeholder="ej. Golpe certero" data-hab-enter="1"></div>
      <div class="f"><label>Descripción</label><textarea data-c="detalle" rows="4" placeholder="ej. Un golpe preciso que ignora la mitad de la Defensa del rival.">${esc(draft.detalle)}</textarea></div>`;
  }
  if(info.id === 'costo'){
    // Nitros: un número fijo, X (se elige al usarla) o lo que cueste un
    // ataque con el arma que se elija al ejecutarla.
    const modo = nitrosAtaque(draft) ? 'ataque' : (nitrosVariable(draft) ? 'x' : 'num');
    const opcion = (valor, texto) => `<button type="button" class="opcion-btn ${modo === valor ? 'activa' : ''}" data-nitros-modo="${valor}">${texto}</button>`;
    html += `<div class="f"><label>SP que gasta</label><input data-c="costo" value="${esc(draft.costo ?? '')}" placeholder="ej. 3 · o X si varía" data-hab-enter="1"></div>
      <div class="f"><label>Nitros (No2) que gasta</label>
        <div class="opcion-fila">
          ${opcion('num', 'Un número')}${opcion('x', 'X (lo elijo al usarla)')}${opcion('ataque', 'Lo mismo que un ataque')}
        </div>
        ${modo === 'num' ? `<input data-c="nitrosCosto" type="number" step="1" min="0" value="${esc(num(draft.nitrosCosto ?? IT2.nitrosHabilidad))}" data-hab-enter="1" style="margin-top:6px;max-width:120px">` : ''}
        <div class="hint" style="margin-top:5px">${modo === 'ataque'
          ? `Para habilidades que incluyen un ataque: cuesta lo mismo que atacar con el arma que elijas al ejecutarla (Tipo ÷ 2 el primer ataque del turno con esa arma, Tipo completo después) y cuenta como ese ataque. Hoy: ${esc(costoAtaqueTxt())}.`
          : modo === 'x' ? 'Al ejecutarla te pregunta cuántos Nitros gastar.' : 'Siempre gasta esa cantidad.'}</div>
      </div>
      <div class="f"><label>Vida (HP) que gasta</label>
        <input data-c="hpCosto" type="number" step="1" min="0" value="${esc(num(draft.hpCosto))}" data-hab-enter="1" style="max-width:120px">
        <div class="hint" style="margin-top:5px">Se descuenta sola al ejecutarla. No te deja usarla si te dejaría en 0: tenés que tener más vida que el costo. 0 = no gasta.</div>
      </div>
      `;
  }
  if(info.id === 'tiradaEj'){
    const opcionStat = s => `<option value="${s.id}" ${draft.tiradaStat === s.id ? 'selected' : ''}>${esc(s.label)} · ${esc(s.full)}</option>`;
    html += `<div class="f"><label>Tirada al ejecutar: stat</label>
        <select data-c="tiradaStat">
          <option value="">— no tira un stat —</option>
          <optgroup label="Principales">${ATTR_LIST.map(opcionStat).join('')}</optgroup>
          <optgroup label="Secundarios">${STATS_CON_TIRADA().map(opcionStat).join('')}</optgroup>
        </select></div>`;
  }
  if(info.id === 'tiradaEf'){
    html += `<div class="f"><label>Tirada de efecto: fórmula de dados (opcional)</label><input data-c="tiradaExtra" value="${esc(draft.tiradaExtra ?? '')}" placeholder="ej. 2d6+3 o 1d20" data-hab-enter="1"></div>
      <div class="hint" style="margin-top:6px">${draft.tiradaStat ? 'Al ejecutar se tira ' + esc(STAT_LABEL[draft.tiradaStat] || draft.tiradaStat) + ' y esta fórmula queda en el botón 🎲 de la tarjeta.' : 'No elegiste un stat: Ejecutar va a tirar esta fórmula directamente (sin botón 🎲 aparte).'}</div>`;
  }
  if(info.id === 'efecto'){
    html += htmlEstadoAlUsar('habilidades', draft);
    html += trampaHtml(draft);
  }
  if(info.id === 'origen'){
    const conJob = draft.job !== false;
    html += `<label class="f" style="display:flex;align-items:center;gap:8px;cursor:pointer">
        <input type="checkbox" data-c="job" ${conJob ? 'checked' : ''} style="width:auto" data-hab-redibujar="1">
        ${etiqueta("La compré con puntos de Job")}
      </label>` +
      (conJob ? `<div class="f"><label>¿Cuántos puntos de Job te costó?</label><input data-c="jobCosto" type="number" step="1" min="0" value="${fmt(jobCostoDe(draft))}" data-hab-enter="1" style="max-width:120px">
        <div class="hint" style="margin-top:5px">De clase prefabricada: 1. Custom: 2. Te quedan ${fmt(jobBudget().resto)} de Job${editing.id ? " (contando esta)" : ""}.</div></div>` : `<div class="f"><label>¿De dónde salió?</label><input data-c="origen" value="${esc(draft.origen ?? '')}" placeholder="ej. Regalo de un hechicero, raza, objeto…" data-hab-enter="1"></div>`) +
      campoImagenHtml(draft);
  }
  if(info.id === 'listo'){
    const fila = (titulo, valor) => `<div class="resumen-fila"><span>${titulo}</span><b>${valor}</b></div>`;
    const modo = modoHab(draft) || 'semi', auto = modo === 'semi';
    const costoSp = String(draft.costo ?? '').trim();
    const tiradaEj = draft.tiradaStat ? (STAT_LABEL[draft.tiradaStat] || draft.tiradaStat) : (String(draft.tiradaExtra || '').trim() || 'no tira'), tiradaEf = draft.tiradaStat && String(draft.tiradaExtra || '').trim() ? String(draft.tiradaExtra).trim() + ' (botón 🎲)' : 'sin tirada de efecto';
    const estado = String(draft.efectoNombre || '').trim();
    html += `<div class="resumen-hab">
      <div class="resumen-nombre">${esc(draft.nombre || '(sin nombre)')}</div>
      <div class="resumen-desc">${draft.detalle ? esc(draft.detalle) : '<span style="color:var(--muted)">(sin descripción)</span>'}</div>
      ${fila('Ejecución', `${MODOS_HAB[modo].icono} ${MODOS_HAB[modo].nombre} (${MODOS_HAB[modo].corto})`)}
      ${modo === 'auto' ? fila('Paso a paso', esc(dueloDe(draft) ? resumenEjecucionHab(dueloDe(draft)) : 'sin configurar')) : ''}
      ${habLegado(draft).length ? fila('Del sistema anterior', esc(habLegado(draft).join(' · '))) : ''}
      ${auto ? `${fila('SP', esc(costoSp || 'no gasta'))}
      ${fila("No2", nitrosAtaque(draft) ? "como un ataque (elegís el arma al usarla)" : nitrosVariable(draft) ? "X (lo elegís al usarla)" : fmt(num(draft.nitrosCosto ?? IT2.nitrosHabilidad)))}
      ${fila('HP', num(draft.hpCosto) > 0 ? fmt(num(draft.hpCosto)) : 'no gasta')}
      ${fila('Al ejecutar', esc(tiradaEj))}
      ${fila('Efecto', esc(tiradaEf))}
      ` : ''}
      ${fila("Origen", esc(draft.job !== false ? `Puntos de Job (${fmt(jobCostoDe(draft))})` : (draft.origen || "otro")))}
    </div>`;
  }

  html += `<div class="paso-nav">
    ${paso > 0 ? '<button type="button" class="btn ghost" data-hab-atras="1">← Atrás</button>' : '<span></span>'}
    ${paso < total - 1 ? '<button type="button" class="btn primary" data-hab-siguiente="1">Siguiente →</button>' : ''}
  </div>`;
  $('#modal-body').innerHTML = html;
  // Al crear, "Guardar" recién en el último paso; al editar, siempre.
  $('#modal-save').style.display = (!nuevo || paso === total - 1) ? '' : 'none';
}

// Pasos del asistente abierto (habilidades), o null si es el formulario común.
function pasosDelEditor(){
  return editing && editing.key === 'habilidades' ? pasosHabilidad(editing.draft) : null;
}

function habilidadIrAPaso(n){
  const pasos = pasosDelEditor();
  if(!pasos) return;
  const destino = Math.max(0, Math.min(pasos.length - 1, n));
  // Lo primero: ¿automatizarla? Sin esa respuesta no se avanza.
  if(destino > 0 && modoHab(editing.draft) === null){
    toast('Primero elegí cómo se ejecuta');
    editing.paso = 0;
    drawEditor();
    return;
  }
  if(destino > 1 && !(editing.draft.nombre || '').trim()){
    toast('Primero ponele un nombre');
    editing.paso = 1;
    drawEditor();
    $('#modal-body').querySelector('[data-c="nombre"]')?.focus();
    return;
  }
  editing.paso = destino;
  drawEditor();
  $('#modal-body').querySelector('input:not([type=checkbox]),textarea,select')?.focus();
}

$('#modal-body').addEventListener('click', e => {
  if(!pasosDelEditor()) return;
  const modoNitros = e.target.closest("[data-nitros-modo]");
  if(modoNitros){
    const m = modoNitros.dataset.nitrosModo;
    const d = editing.draft;
    d.nitrosCosto = m === "ataque" ? "ATAQUE" : m === "x" ? "X" : ((nitrosAtaque(d) || nitrosVariable(d)) ? IT2.nitrosHabilidad : num(d.nitrosCosto ?? IT2.nitrosHabilidad));
    // Costo de ataque: la tirada por defecto es PdG (si no eligió otra). Si
    // después cambia de opción, se saca el PdG que se había puesto solo.
    if(m === "ataque" && !d.tiradaStat){ d.tiradaStat = "pdg"; editing.pdgAuto = true; }
    else if(m !== "ataque" && editing.pdgAuto && d.tiradaStat === "pdg"){ d.tiradaStat = ""; editing.pdgAuto = false; }
    drawEditor();
    return;
  }
  const modoBtn = e.target.closest('[data-hab-modo]');
  if(modoBtn){
    editing.draft.modo = modoBtn.dataset.habModo;
    editing.draft.automatizada = editing.draft.modo !== 'manual';
    drawEditor();
    return;
  }
  if(e.target.closest('[data-hab-ejecucion]')){ abrirEjecucionHab(editing.draft, () => drawEditor()); return; }
  const chip = e.target.closest('[data-hab-paso]');
  if(chip){ habilidadIrAPaso(num(chip.dataset.habPaso)); return; }
  if(e.target.closest('[data-hab-siguiente]')){ habilidadIrAPaso((editing.paso || 0) + 1); return; }
  if(e.target.closest('[data-hab-atras]')){ habilidadIrAPaso((editing.paso || 0) - 1); return; }
});
$('#modal-body').addEventListener('keydown', e => {
  const pasos = pasosDelEditor();
  if(!pasos) return;
  if(e.key === 'Enter' && e.target.matches('[data-hab-enter]')){
    e.preventDefault();
    e.target.dispatchEvent(new Event('change', {bubbles: true}));
    if((editing.paso || 0) < pasos.length - 1) habilidadIrAPaso((editing.paso || 0) + 1);
  }
});
$('#modal-body').addEventListener('change', e => {
  // Después de que handleModalFieldChange actualice el borrador.
  if(pasosDelEditor() && e.target.matches("[data-hab-redibujar]")) setTimeout(drawEditor, 0);
});

// Sección "Estado alterado al usar" (consumibles y habilidades).
/* ---------- 🪤 Trampa de una habilidad (2026-09-24, pedido del dueño) ----------
   Una habilidad del personaje puede colocar una trampa oculta en el mapa al ejecutarse: `h.trampaColocar` = una trampa en la forma
   única (P123: la misma del mapa y del catálogo, ver `Plantillas.trampaDesde` en comun/plantillas.js; las viejas {radio, cant,
   estado:{…}} se traducen solas). Se coloca sola al lado del token del personaje (comun/tokens-auto.js, igual que las de los
   creeps); los demás no la ven hasta que la pisan. Sin trampa, la habilidad no toca el mapa. */
const TRAMPA_DANO_RE = /^\d{1,2}d\d{1,3}([+-]\d{1,3})?$/i;
/* Menú paso a paso (comun/asistente-trampa.js, 2026-09-25): reemplaza a los campos sueltos. Guarda también fuego amigo (`amiga`) y el estado que deja. */
// Estados que puede dejar una trampa (los debuffs con duración de EstadosAplicar) y el spec {nombre, turnos} que se guarda.
function trampaEstadosLista(){
  return EstadosAplicar.DEBUFFS.filter(p => !p.permanente && Number(p.turnos) > 0 && !p.esVeneno).map(p => ({nombre: p.nombre, detalle: p.detalle || '', turnos: Number(p.turnos), permanente: false}));
}
function trampaEstadoSpec(nombre, turnos){
  if(!nombre) return null;
  const p = EstadosAplicar.DEBUFFS.find(x => x.nombre === nombre);
  return {nombre, turnos: turnos > 0 ? turnos : (p ? Number(p.turnos) : 0)};
}
function trampaAbrirAsistente(){
  const ed = editing, t = ed.draft.trampaColocar || {};
  AsistenteTrampa.abrir({
    contexto: 'habilidad', editando: false, estados: trampaEstadosLista(), inicial: AsistenteTrampa.inicialDe(t),
    alTerminar: res => {
      if(editing !== ed) return;
      ed.draft.trampaColocar = AsistenteTrampa.aTrampa(res);   // forma única (P123)
      drawEditor();
    },
    alCancelar: () => { if(editing === ed && ed.draft.trampaColocar && !String(ed.draft.trampaColocar.nombre || '').trim() && !ed.draft.trampaColocar.dano){ delete ed.draft.trampaColocar; drawEditor(); } },
  });
}
const trampaResumenTexto = t => AsistenteTrampa.resumenTexto(t);
function trampaHtml(draft){
  const t = draft.trampaColocar || null;
  const campo = (k, etiqueta, tipo, extra) => `<div class="f"><label>${etiqueta}</label><input data-tr="${k}" type="${tipo}" value="${esc(t && t[k] !== undefined ? t[k] : '')}" ${extra || ''}></div>`;
  return `<div class="f" style="margin-top:10px"><label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:8px 10px;border:1px solid var(--copper);border-radius:var(--r);background:rgba(201,133,69,.10)">
      <input type="checkbox" data-tr="on" ${t ? 'checked' : ''} style="width:auto"> <span><b>🪤 Esta habilidad coloca una trampa</b><br><span style="font-size:12px;color:var(--muted);text-transform:none;letter-spacing:0">${modoHab(draft) === 'auto' ? 'Al ejecutarla elegís en el mapa dónde colocarla. La ven solo los de tu bando: el GM se entera de que la colocaste, pero no de dónde.' : 'Al ejecutarla deja sola una trampa oculta al lado de tu token, en el mapa que se está jugando.'}</span></span></label></div>
    ${t ? `<button type="button" class="btn" id="hab-trampa-pre" style="width:100%;margin-bottom:8px">📚 Trampas preconstruidas</button>
      <div class="hint" style="margin:4px 0 8px"><b>${esc(t.nombre || 'Sin nombre')}</b><br>${esc(trampaResumenTexto(t))}</div>
      <button type="button" class="btn primary" id="hab-trampa-asistente" style="width:100%">🪄 ${t.nombre ? 'Cambiar' : 'Armar'} la trampa paso a paso</button>` : ''}`;
}
function trampaGuardarCampo(el){
  const d = editing.draft, k = el.dataset.tr;
  if(k === 'on'){ d.trampaColocar = el.checked ? (d.trampaColocar || {nombre: '', detalle: '', dano: '', ignoraDef: false, tipo: 'flor', tamano: 0, cant: 1}) : undefined; if(!el.checked) delete d.trampaColocar; drawEditor(); if(el.checked && !String(d.trampaColocar.nombre || '').trim()) trampaAbrirAsistente(); return; }
  const t = d.trampaColocar; if(!t) return;
  if(k === 'ignoraDef') t[k] = el.checked;
  else if(k === 'radio' || k === 'cant') t[k] = Math.max(k === 'cant' ? 1 : 0, Math.min(6, Math.round(num(el.value) || 0)));
  else t[k] = el.value;
}
// Se ejecuta con la habilidad: coloca la trampa en el mapa (si hay token del personaje en el mapa en juego).
// Habilidad con zona en el mapa (zonaMapa: 'cono'): le avisa al mapa (la ficha corre en su iframe) para que dibuje el área 3 segundos.
function avisarZonaAlMapa(h){ FichaAcciones.avisarZonaAlMapa(S, h, habUi); }   // comun/ficha-acciones.js (paso 3c-5c)
// Trampa consumible: la coloca junto a tu token (comun/ficha-acciones.js, paso 3c-7). Devuelve true si se colocó.
function colocarTrampaDeItem(it){ return FichaAcciones.colocarTrampaDeItem(fichaVivo ? fichaVivo.id : '', it, consumoUi); }
function colocarTrampaDeHab(h){ return FichaAcciones.colocarTrampaDeHab(S, h, habUi); }   // comun/ficha-acciones.js (paso 3c-5c)
function trampaPreconstruidas(){
  const ed = editing;
  Biblioteca.abrir({
    tipo: 'trampas', titulo: 'Trampa preconstruida',
    base: typeof TRAMPAS_BASE !== 'undefined' ? TRAMPAS_BASE : [],
    subtitulo: e => (e.nivel ? ` · nivel ${e.nivel}` : '') + (e.datos && e.datos.dano ? ` · 💥 ${e.datos.dano}` : ''),
    grupos: [{nombre: 'Efecto', tags: ['daño', 'veneno', 'explosiva', 'fuego', 'inmoviliza', 'debuff', 'control', 'alarma']}, {nombre: 'Origen', tags: ['mecánica', 'mágica', 'natural']}, {nombre: 'Nivel', tags: ['nivel 1', 'nivel 2', 'nivel 3', 'nivel 4', 'nivel 5']}],
    alElegir: async datos => {
      const qs = [{clave: 'radio', min: 0, texto: '¿De qué tamaño es? (radio: 0 = una casilla, 1 = una flor de 1, 2 = una flor de 2…)'}];
      if(datos.dano) qs.push({clave: 'dano', tipo: 'texto', texto: '¿Cuánto daño hace? (dados, ej. 2d6 o 1d8+3)', patron: TRAMPA_DANO_RE, error: 'Escribilo así: 2d6 o 1d8+3.', placeholder: 'ej. 2d6+3'});
      qs.push({clave: 'cant', min: 1, texto: '¿Cuántas trampas coloca cada vez que la ejecutás?'});
      const r = await EstadoPreguntas.preguntar({titulo: 'Trampa', nombre: datos.nombre}, qs, x => x);
      if(!r || editing !== ed) return;
      // La trampa del catálogo entera (forma única, P123: con su estado, color y la zona que deja), con el tamaño, el daño y la
      // cantidad que se eligieron recién. Si es una línea, el "radio" que se preguntó se toma como su largo.
      const base = Plantillas.trampaDesde(datos);
      ed.draft.trampaColocar = {...base, nombre: String(datos.nombre || '').slice(0, 40), detalle: String(datos.detalle || '').slice(0, 200), dano: r.dano || '',
        tamano: base.tipo === 'linea' ? Math.max(1, Math.min(20, r.radio || 1)) : Math.max(0, Math.min(6, r.radio)), cant: Math.max(1, Math.min(6, r.cant))};
      delete ed.draft.trampaColocar.teleport;   // el teleport no lo coloca una habilidad (su destino se marca en el mapa)
      drawEditor();
      toast(`Trampa "${datos.nombre}" cargada`);
    },
  });
}

function htmlEstadoAlUsar(key, draft){
  let html = '';
    const personalizadosIt = S.efectosPersonalizados || [];
    html += `<div class="f"><label>Estado alterado al ${key === 'habilidades' ? 'ejecutar' : 'consumir'} (opcional)</label>
      <button type="button" class="btn preset-abrir" id="item-efecto-preset-abrir">Elegir de la lista · ${fmt(EFECTOS_PRESET.length + personalizadosIt.length)} estados</button>
      <input data-c="efectoNombre" placeholder="${key === 'habilidades' ? 'ej. Espinas' : 'ej. Regeneración (poción)'}" value="${esc(draft.efectoNombre??'')}" style="margin-top:6px"></div>
      <label class="f" style="display:flex;align-items:center;gap:8px;cursor:pointer">
        <input type="checkbox" data-c="efectoPermanente" ${draft.efectoPermanente?'checked':''} style="width:auto">
        <span style="font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)">No vence (queda hasta usarlo o borrarlo a mano)</span>
      </label>
      ${!draft.efectoPermanente ? `<div class="f2">
        <div class="f"><label>${CAMPO_LABEL.efectoTurnos}</label><input data-c="efectoTurnos" type="number" step="any" value="${esc(draft.efectoTurnos??0)}"></div>
        <div class="f"><label>${CAMPO_LABEL.efectoHpTurno}</label><input data-c="efectoHpTurno" type="number" step="any" value="${esc(draft.efectoHpTurno??0)}"></div>
      </div>` : `<div class="f"><label>${CAMPO_LABEL.efectoHpTurno}</label><input data-c="efectoHpTurno" type="number" step="any" value="${esc(draft.efectoHpTurno??0)}"></div>`}
      ${num(draft.efectoEscudo) > 0 || num(draft.efectoStacks) > 1 ? `<div class="f2">
        ${num(draft.efectoEscudo) > 0 ? `<div class="f"><label>${CAMPO_LABEL.efectoEscudo}</label><input data-c="efectoEscudo" type="number" step="any" value="${esc(draft.efectoEscudo)}"></div>` : ''}
        ${num(draft.efectoStacks) > 1 ? `<div class="f"><label>${CAMPO_LABEL.efectoStacks}</label><input data-c="efectoStacks" type="number" step="any" value="${esc(draft.efectoStacks)}"></div>` : ''}
      </div>` : ''}
      <div class="f"><label>${CAMPO_LABEL.efectoDetalle}</label><textarea data-c="efectoDetalle" rows="2" placeholder="Qué hace el estado, tal como lo va a leer el jugador. Si lo dejás vacío se usa el detalle del ítem.">${esc(draft.efectoDetalle??'')}</textarea></div>
      <div class="f"><label>Modificadores de atributo (opcional)</label>
        <div id="efectomods">${(draft.efectoMods||[]).map((m,i)=>`
        <div class="modrow">
          <select data-em="${i}" data-emk="stat">
            <option value="">— elegir stat —</option>
            ${statOptions(m.stat)}
          </select>
          <input data-em="${i}" data-emk="val" type="number" step="any" value="${esc(m.val)}">
          <button class="mini" data-rmefectomod="${i}">×</button>
        </div>`).join('')}</div>
        <button type="button" class="iconbtn iconbtn-add" id="addefectomod">+ Modificador de atributo</button>
        <div class="hint" style="margin-top:6px">Cada modificador suma o resta a un atributo mientras el estado esté activo: uno principal (Fuerza, Destreza, Agilidad…) o uno secundario (PdG, Evasión, Defensa, No2, SP…). Ej.: +2 Fuerza durante los turnos que dure, o −1 PdG.</div>
      </div>
      <div class="hint" style="margin:-4px 0 8px">Si le ponés nombre, al consumir este ítem se activa (o refresca) ese estado en Estados alterados. Con "No vence" tildado, el estado queda ahí hasta que lo borres vos manualmente.</div>`;
  return html;
}

/* ---------- Ítems: asistente paso a paso (comun/asistente-item.js) ----------
   Crear o editar cualquier ítem de inventario o del catálogo (menos
   consumibles) va por el asistente compartido, con los números de este
   personaje. El resumen deja volver al formulario común. */
function portadorFicha(idItem){
  const c = compute();
  const usado = computeSlots().find(sl => sl.id === 'manos_arma');
  return {
    nombre: S.meta.nombre || 'vos', nitros: num(nitrosMaximo(c)), dmg: num(c.final.dmg), rango: num(c.final.rng), def: num(c.final.def),
    cargaUsada: S.inventario.filter(i => i.equipado && i.id !== idItem).reduce((a, i) => a + num(i.peso), 0),
    cargaMax: num(c.final.crgmax),
    manosUsadas: usado ? usado.usado : 0,
  };
}

function abrirAsistenteItem(key, id, op){
  op = op || {};
  const original = id ? S[key].find(x => x.id === id) : null;
  const base = structuredClone(op.draft || original || {
    id: uid(), nombre: '', tipoItem: '', peso: 0, ranuras: 1, detalle: '', mods: [], imagen: '',
    equipado: op.equipadoPreset !== undefined ? op.equipadoPreset : true, activo: true, unidades: 1, consumible: false,
    precioCompra: 0, tipoDado: 8, danoFijo: 0, danoAmplificado: 0, armaDeRango: false, manoPreferida: '', efectosGolpe: [],
    equipoEstadoNombre: '', equipoEstadoHpTurno: 0, equipoEstadoDetalle: '',
  });
  if(!base.id) base.id = uid();
  const enInventario = key === 'inventario';
  AsistenteItem.abrir({
    contexto: 'ficha',
    nuevo: !original,
    titulo: original ? `Editar ${original.nombre}` : key === 'catalogo' ? 'Ítem nuevo del catálogo' : 'Ítem nuevo',
    draft: base,
    stats: MOD_TARGETS.map(x => ({id: x.id, label: x.label})),
    portador: () => portadorFicha(base.id),
    ejemplos: (tipoItem, t) => (S.catalogo || []).filter(it => ES_ARMA(it.tipoItem) && num(it.tipoDado) === t).map(it => it.nombre),
    tiers: Object.keys(TIER_COLOR),
    conImagen: true,
    imagenADatos: file => fileToDataURL(file, 480, 0.85),
    conEstadoEquipar: true,
    conPrecio: true,
    conLugar: enInventario,
    conRanuras: !enInventario,
    conMano: enInventario,
    textoGuardar: original ? 'Guardar' : 'Crear',
    botones: [
      ...(enInventario ? [{texto: '⬆ Subir al catálogo', accion: d => subirItemAlCatalogo({...base, ...d}, 'inventario')}] : []),
      ...(original ? [{texto: 'Eliminar', accion: () => {
        if(!confirm(`¿Eliminar "${original.nombre}"? No se puede deshacer.`)) return;
        S[key] = S[key].filter(x => x.id !== id);
        AsistenteItem.cerrar();
        despuesDeEditarItem(key);
      }}] : []),
    ],
    onFormulario: d => openEditor(key, id, undefined, {formulario: true, draft: {...base, ...d}}),
    onConsumible: d => openEditor(key, id, undefined, {formulario: true, draft: {...base, ...d, tipoItem: 'consumibles', consumible: true}}),
    onGuardar: d => {
      const item = {...base, ...d, consumible: false};
      if(!ES_ARMA(item.tipoItem)) ['tipoDado', 'danoFijo', 'danoAmplificado', 'armaDeRango', 'efectosGolpe'].forEach(k => delete item[k]);
      const i = S[key].findIndex(x => x.id === item.id);
      if(i >= 0) S[key][i] = item; else S[key].push(item);
      despuesDeEditarItem(key);
      toast(`${item.nombre} ${original ? 'guardado' : 'creado'}`);
      return true;
    },
  });
}

function despuesDeEditarItem(key){
  if(key === 'inventario') renderInventario();
  else if(key === 'catalogo'){ $('#catalogo-buscar').value = ''; renderCatalogoModal(); $('#scrim-catalogo').classList.add('open'); }
  refresh();
}

// Daño de un arma con efectos al golpear: recordatorio resaltado en la Mesa
// y, si alguno depende de la suerte, el pop-up para tirarlo.
function efectosAlPegar(arma){
  EfectosGolpe.alPegar({
    arma: arma.nombre,
    efectos: arma.efectosGolpe,
    publicar: linea => {
      registrarEvento(`⚠ ${linea.origen}: ${linea.formula.replace(/\n/g, ' · ')}`);
      if(!fbDb || !fbUsuario || !fbMiembro) return;
      fbDb.collection(fbRutaCampana('tiradas')).add({
        uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: mesaQuien(),
        origen: linea.origen.slice(0, 120), formula: linea.formula.slice(0, 900),
        rolls: linea.rolls.slice(0, 100), mod: 0, total: 0, desde: 'efecto',
        cuando: firebase.firestore.FieldValue.serverTimestamp(),
      }).catch(err => console.error('No se pudieron publicar los efectos en la Mesa:', err));
    },
  });
}

// Sección "Estado alterado al equipar" (ítems no consumibles y armas).
function htmlEstadoAlEquipar(draft){
  const tieneEstadoEquipo = (draft.equipoEstadoNombre || '').trim() || editing.estadoEquipoAbierto;
  return `<div class="f">
      <label>Estado alterado al equipar</label>
      ${tieneEstadoEquipo ? `
        <input data-c="equipoEstadoNombre" placeholder="ej. Regeneración" value="${esc(draft.equipoEstadoNombre??'')}">
        <div class="f"><label>HP por turno (mientras esté puesto)</label><input data-c="equipoEstadoHpTurno" type="number" step="any" value="${esc(draft.equipoEstadoHpTurno??0)}" style="margin-top:6px"></div>
        <textarea data-c="equipoEstadoDetalle" rows="2" placeholder="Qué hace el estado. Si lo dejás vacío se usa el detalle del ítem." style="margin-top:6px">${esc(draft.equipoEstadoDetalle??'')}</textarea>
        <button type="button" class="mini" id="rmestadoequipo" style="margin-top:6px">Quitar estado alterado</button>
        <div class="hint" style="margin-top:6px">Se activa solo al equipar el ítem y se va al sacártelo — no cuenta turnos, dura lo que dure puesto.</div>
      ` : `<button type="button" class="iconbtn iconbtn-add" id="addestadoequipo">+ Estado alterado</button>`}
    </div>`;
}

function drawEditor(){
  const {key, draft} = editing;
  if(key === "habilidades"){ drawEditorHabilidad(); return; }
  $('#modal-save').style.display = '';
  const sc = SCHEMA[key];
  const FLAGS = ['equipado','activo','permanente','popup','job','consumible','mitadPdgEva','armaduraRota','armaDeRango'];
  const ESPECIALES = ['imagen','categoria','tipoItem','tipoDado','danoFijo','precioVentaAuto','manoPreferida'];
  const cortos = sc.campos.filter(c => c!=='detalle' && !ESPECIALES.includes(c) && !FLAGS.includes(c));
  const flags = sc.campos.filter(c => FLAGS.includes(c));
  const esArma = ES_ARMA(draft.tipoItem);

  let html = '';
  html += `<div class="f"><label>${CAMPO_LABEL.nombre}</label><input data-c="nombre" value="${esc(draft.nombre)}"></div>`;
  if(key === 'habilidades' && sc.campos.includes('detalle')){
    html += `<div class="f"><label>${CAMPO_LABEL.detalle}</label><textarea data-c="detalle">${esc(draft.detalle)}</textarea></div>`;
  }
  if(key === 'efectos'){
    const personalizados = S.efectosPersonalizados || [];
    const yaGuardado = personalizados.some(p => p.nombre === draft.nombre);
    html += `<div class="f">
      <button type="button" class="mini" id="efecto-preset-guardar">${yaGuardado ? 'Actualizar' : 'Guardar'} como preset personalizado</button>
      ${yaGuardado ? `<button type="button" class="mini danger" id="efecto-preset-borrar" style="margin-left:6px">Borrar preset "${esc(draft.nombre)}"</button>` : ''}
      <div class="hint" style="margin-top:5px">Guarda esta configuración (turnos, stacks, HP por turno, modificadores, etc.) para poder elegirla de nuevo junto a los demás presets.</div>
    </div>`;
    html += `<div class="f"><label>${CAMPO_LABEL.detalle}</label><textarea data-c="detalle">${esc(draft.detalle)}</textarea></div>`;
  }
  if(sc.campos.includes('tipoItem')){
    const catActual = CATEGORIAS.find(c => c.id === draft.tipoItem);
    html += `<div class="f"><label>${CAMPO_LABEL.tipoItem}</label>
      <button type="button" class="btn preset-abrir" id="tipoitem-abrir">${esc(catActual && catActual.id ? catActual.label : '— elegir categoría —')}</button></div>`;
    const slotDef = key !== 'catalogo' ? SLOT_DEFS.find(sd => sd.cats.includes(draft.tipoItem)) : null;
    if(slotDef){
      const slots = computeSlots();
      const usado = slots.find(s => s.id === slotDef.id)?.usado || 0;
      const sobre = usado > slotDef.max;
      html += `<div class="hint" style="margin:-4px 0 8px${sobre?';color:var(--danger)':''}">${esc(slotDef.label)}: ${fmt(usado)} / ${fmt(slotDef.max)} ocupados${sobre?' — te pasaste':''}</div>`;
    }
  }
  if(draft.tipoItem === 'arma_1m' || draft.tipoItem === 'escudo_1m'){
    html += `<div class="f"><label>${CAMPO_LABEL.manoPreferida}</label>
      <select data-c="manoPreferida">
        <option value="" ${!draft.manoPreferida?'selected':''}>Automática</option>
        <option value="1" ${String(draft.manoPreferida)==='1'?'selected':''}>Mano 1</option>
        <option value="2" ${String(draft.manoPreferida)==='2'?'selected':''}>Mano 2</option>
      </select>
      <div class="hint" style="margin-top:5px">Define en qué mano aparece dentro de "Efectos de equipo" cuando tenés dos cosas equipadas.</div>
    </div>`;
  }
  if(sc.campos.includes('imagen') && key !== 'habilidades' && key !== 'efectos'){
    html += campoImagenHtml(draft);
  }
  const resto = cortos.filter(c => {
    if(c==='nombre') return false;
    if(c==='curahp') return false;
    // Los campos del estado alterado van juntos en su propia sección (más abajo).
    if(['efectoNombre','efectoTurnos','efectoHpTurno','efectoEscudo','efectoStacks','efectoDetalle','curaspPct'].includes(c)) return false;
    if(c==='forzarNitros') return false;
    if(c==='ranuras' && draft.equipado) return false;
    if(['unidades','cargaMax','cargaActual'].includes(c) && !draft.consumible) return false;
    if(key === 'habilidades' && c === 'tiradaExtra') return false;
    return true;
  });
  const esDefensivo = CATEGORIAS.find(c => c.id === draft.tipoItem)?.defensivo === true;
  if(resto.length || esDefensivo){
    html += `<div class="f2">`
      + resto.map(c => `<div class="f"><label>${CAMPO_LABEL[c]}</label>
      <input data-c="${c}" ${CAMPO_NUM.includes(c)?'type="number" step="any"':''} value="${esc(draft[c]??'')}"></div>`).join('')
      + (esDefensivo ? `<div class="f"><label>Defensa</label><input data-defmod="def" type="number" step="any" value="${getModVal(draft,'def')}"></div>` : '')
      + `</div>`;
  }
  if(key === 'habilidades'){
    const opcionStat = s => `<option value="${s.id}" ${draft.tiradaStat === s.id ? 'selected' : ''}>${esc(s.label)} · ${esc(s.full)}</option>`;
    html += `<div class="f2">
      <div class="f"><label>${CAMPO_LABEL.tiradaStat}</label>
        <select data-c="tiradaStat">
          <option value="">— ninguno —</option>
          <optgroup label="Principales">${ATTR_LIST.map(opcionStat).join('')}</optgroup>
          <optgroup label="Secundarios">${STATS_CON_TIRADA().map(opcionStat).join('')}</optgroup>
        </select>
      </div>
      <div class="f"><label>${CAMPO_LABEL.tiradaExtra}</label><input data-c="tiradaExtra" value="${esc(draft.tiradaExtra??'')}"></div>
    </div>
    <div class="hint" style="margin:-4px 0 8px">El stat se tira con su valor del momento (con los modificadores de equipo y estados activos), igual que su 🎲. Si cargás las dos cosas, se tiran las dos.</div>
    <div class="f2">
      <label class="f" style="display:flex;align-items:center;height:100%;gap:8px;cursor:pointer">
        <input type="checkbox" data-c="job" ${draft.job !== false ? 'checked' : ''} style="width:auto">
        <span style="font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)">${CAMPO_LABEL.job}</span>
      </label>
    </div>`;
  }
  if(esDefensivo){
    html += `<div class="f">
      <label>Resistencia a críticos</label>
      <div class="defres-grid">
        ${TIPOS_IDS.map(id => {
          const d = EXTRA.find(e => e.id === id);
          return `<div class="defres-cell">
            <label>${esc(d.label)}</label>
            <input data-defmod="${id}" type="number" step="any" value="${getModVal(draft, id)}">
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }
  if(sc.campos.includes('curahp') && draft.consumible){
    html += `<div class="f"><label>${CAMPO_LABEL.curahp}</label>
      <input data-c="curahp" type="number" step="any" value="${esc(draft.curahp??0)}"></div>`;
  }
  if(sc.campos.includes('curaspPct') && draft.consumible){
    html += `<div class="f"><label>${CAMPO_LABEL.curaspPct}</label>
      <input data-c="curaspPct" type="number" step="any" min="0" max="100" value="${esc(draft.curaspPct??0)}"></div>`;
  }
  if(sc.campos.includes('efectoNombre') && (draft.consumible || key === 'habilidades')) html += htmlEstadoAlUsar(key, draft);
  if(esArma && (sc.campos.includes('tipoDado') || sc.campos.includes('danoFijo'))){
    html += `<div class="f2">
      <div class="f"><label>${CAMPO_LABEL.tipoDado}</label>
        <select data-c="tipoDado">
          ${DADOS_ARMA.map(d => `<option value="${d}" ${(num(draft.tipoDado)||8)===d?'selected':''}>d${d}${d===12?' (explosivos/modernas)':''}</option>`).join('')}
        </select></div>
      <div class="f"><label>${CAMPO_LABEL.danoFijo}</label><input data-c="danoFijo" type="number" step="any" value="${esc(draft.danoFijo??0)}"></div>
      <div class="f"><label>${CAMPO_LABEL.danoAmplificado}</label><input data-c="danoAmplificado" type="number" step="1" min="0" value="${esc(draft.danoAmplificado??0)}"></div>
    </div>
    <div class="hint" id="dano-hint" style="margin:-4px 0 8px">Daño: ${armaDanoTxt(draft)} (peso × d${num(draft.tipoDado)||8}${num(draft.danoAmplificado)?` + ${num(draft.danoAmplificado)} dado${num(draft.danoAmplificado)>1?'s':''} por daño amplificado`:''}, más el fijo)</div>`;
  }
  if(sc.campos.includes('precioVentaAuto')){
    html += `<div class="f"><label>Precio de venta (mitad de compra)</label>
      <div style="font-family:'Space Mono',monospace;font-weight:700;color:var(--brass);padding:5px 7px">${fmt(precioVentaDe(draft))}</div>
    </div>`;
  }
  const FLAGS_OCULTOS = ['mitadPdgEva','armaduraRota'];
  flags.filter(c => !FLAGS_OCULTOS.includes(c) && !(key === 'habilidades' && c === 'job')).forEach(c => {
    const on = (c==='activo' || c==='job') ? draft[c] !== false : !!draft[c];
    html += `<label class="f" style="display:flex;align-items:center;gap:8px;cursor:pointer">
      <input type="checkbox" data-c="${c}" ${on?'checked':''} style="width:auto">
      <span style="font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)">${CAMPO_LABEL[c]}</span></label>`;
  });
  if(sc.campos.includes('detalle') && key !== 'habilidades' && key !== 'efectos')
    html += `<div class="f"><label>Detalle</label><textarea data-c="detalle">${esc(draft.detalle)}</textarea></div>`;

  if(sc.mods){
    const esEstado = key === "efectos";
    html += `<div class="f"><label>${esEstado ? "Modificadores de atributo (opcional)" : "Modificadores"}</label>
      <div id="mods">${(draft.mods||[]).map((m,i)=>{
        if(esDefensivo && (m.stat === 'def' || TIPOS_IDS.includes(m.stat))) return '';
        return `
        <div class="modrow">
          <select data-m="${i}" data-mk="stat">
            <option value="">— elegir stat —</option>
            ${statOptions(m.stat)}
          </select>
          <input data-m="${i}" data-mk="val" type="number" step="any" value="${esc(m.val)}">
          <button class="mini" data-rmmod="${i}">×</button>
        </div>`;
      }).join('')}</div>
      <button class="iconbtn iconbtn-add" id="addmod">${esEstado ? "+ Modificador de atributo" : "+ Modificador"}</button>
      <div class="hint" style="margin-top:6px">${esEstado
        ? "Cada modificador suma o resta a un atributo mientras el estado esté activo: uno principal (Fuerza, Destreza, Agilidad…) o uno secundario (PdG, Evasión, Defensa, No2, SP…). Ej.: +2 Fuerza durante los turnos que dure, o −1 PdG."
        : "Se suman al stat mientras el ítem esté equipado o el efecto activo."}</div>
    </div>`;
  }
  if(sc.campos.includes('tipoItem') && !draft.consumible) html += htmlEstadoAlEquipar(draft);
  if((key === 'habilidades' || key === 'efectos') && sc.campos.includes('imagen')){
    html += campoImagenHtml(draft);
  }
  $('#modal-body').innerHTML = html;
}

function getModVal(draft, statId){
  const m = (draft.mods||[]).find(mm => mm.stat === statId);
  return m ? m.val : 0;
}
function setModVal(draft, statId, val){
  draft.mods = draft.mods || [];
  const idx = draft.mods.findIndex(mm => mm.stat === statId);
  if(val === 0){
    if(idx >= 0) draft.mods.splice(idx, 1);
  }else if(idx >= 0){
    draft.mods[idx].val = val;
  }else{
    draft.mods.push({stat: statId, val});
  }
}

function handleModalFieldChange(e){
  const t = e.target;
  if(t.dataset.tr){ trampaGuardarCampo(t); return; }
  if(t.dataset.c){
    const c = t.dataset.c;
    editing.draft[c] = t.type === "checkbox" ? t.checked : (CAMPO_NUM.includes(c) ? (t.value===""?"":num(t.value)) : t.value);
    // Nitros de una habilidad: un número o X (lo elegís al usarla).
    if(c === "nitrosCosto") editing.draft[c] = esCostoVariable(t.value) ? "X" : (t.value.trim() === "" ? "" : num(t.value));
    if(c === "tiradaStat") editing.pdgAuto = false;  // lo eligió a mano
    // Con nombre ya se puede saltar a cualquier paso del asistente.
    if(c === 'nombre' && pasosDelEditor()) document.querySelectorAll('#modal-body [data-hab-paso]').forEach(b => { b.disabled = !t.value.trim() && num(b.dataset.habPaso) > (editing.paso || 0); });
    if(['tipoItem','equipado','consumible','efectoPermanente'].includes(c)){ drawEditor(); return; }
    if(['peso','tipoDado','danoFijo','danoAmplificado'].includes(c)){
      const hint = document.getElementById('dano-hint');
      const da = num(editing.draft.danoAmplificado);
      if(hint) hint.textContent = `Daño: ${armaDanoTxt(editing.draft)} (peso × d${num(editing.draft.tipoDado)||8}${da?` + ${da} dado${da>1?'s':''} por daño amplificado`:''}, más el fijo)`;
    }
  }
  if(t.dataset.defmod){
    setModVal(editing.draft, t.dataset.defmod, num(t.value));
    return;
  }
  if(t.dataset.m !== undefined){
    const i = +t.dataset.m, k = t.dataset.mk;
    editing.draft.mods[i][k] = k==='val' ? num(t.value) : t.value;
  }
  if(t.dataset.em !== undefined){
    const i = +t.dataset.em, k = t.dataset.emk;
    editing.draft.efectoMods[i][k] = k==='val' ? num(t.value) : t.value;
  }
}
$('#modal-body').addEventListener('input', handleModalFieldChange);
$('#modal-body').addEventListener('change', handleModalFieldChange);
$('#modal-body').addEventListener('click', e => {
  const b = e.target.closest('button'); if(!b) return;
  if(b.id === 'addmod'){ editing.draft.mods = editing.draft.mods||[]; editing.draft.mods.push({stat:'', val:0}); drawEditor(); }
  if(b.dataset.rmmod !== undefined){ editing.draft.mods.splice(+b.dataset.rmmod,1); drawEditor(); }
  if(b.id === 'hab-trampa-pre'){ trampaPreconstruidas(); return; }
  if(b.id === 'hab-trampa-asistente'){ trampaAbrirAsistente(); return; }
  if(b.id === 'addefectomod'){ editing.draft.efectoMods = editing.draft.efectoMods||[]; editing.draft.efectoMods.push({stat:'', val:0}); drawEditor(); }
  if(b.dataset.rmefectomod !== undefined){ editing.draft.efectoMods.splice(+b.dataset.rmefectomod,1); drawEditor(); }
  if(b.id === 'addestadoequipo'){ editing.estadoEquipoAbierto = true; drawEditor(); }
  if(b.id === 'rmestadoequipo'){
    editing.draft.equipoEstadoNombre = ''; editing.draft.equipoEstadoHpTurno = 0; editing.draft.equipoEstadoDetalle = '';
    editing.estadoEquipoAbierto = false;
    drawEditor();
  }
  if(b.id === 'itempick'){ document.getElementById('itempick-input').click(); }
  if(b.id === 'itempick-remove'){ editing.draft.imagen = ''; drawEditor(); }
  if(b.id === 'efecto-preset-guardar'){
    const d = editing.draft;
    if(!d.nombre.trim()){ toast('Ponéle nombre al estado antes de guardarlo como preset'); return; }
    const preset = {
      nombre: d.nombre, imagen: d.imagen || '', turnos: d.turnos, stacks: d.stacks,
      hpturno: d.hpturno, stacksturno: d.stacksturno, permanente: !!d.permanente,
      forzarNitros: d.forzarNitros, mitadPdgEva: !!d.mitadPdgEva,
      armaduraRota: !!d.armaduraRota,
      mods: structuredClone(d.mods || []), detalle: d.detalle || '',
    };
    S.efectosPersonalizados = S.efectosPersonalizados || [];
    const idx = S.efectosPersonalizados.findIndex(p => p.nombre === preset.nombre);
    if(idx >= 0) S.efectosPersonalizados[idx] = preset; else S.efectosPersonalizados.push(preset);
    toast(`Preset "${preset.nombre}" guardado`);
    drawEditor();
  }
  if(b.id === 'efecto-preset-borrar'){
    if(!confirm(`¿Borrar el preset "${editing.draft.nombre}"?\n\nEsto no borra el estado activo, solo el preset guardado para reutilizar.`)) return;
    S.efectosPersonalizados = (S.efectosPersonalizados || []).filter(p => p.nombre !== editing.draft.nombre);
    toast('Preset borrado');
    drawEditor();
  }
});
$('#modal-body').addEventListener('change', async e => {
  if(e.target.id === 'itempick-input'){
    const file = e.target.files[0]; if(!file) return;
    try{
      editing.draft.imagen = await fileToDataURL(file, 480, 0.85);
      drawEditor();
    }catch(err){
      toast('No se pudo cargar esa imagen');
    }
  }
});
function slugItemCatalogo(s){
  return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'item';
}

// Convierte un ítem de inventario/cinturón (instancia de un personaje) en
// una entrada de catálogo del fabricante: descarta lo que solo tiene
// sentido para una instancia (equipado, cargaActual, manoPreferida) y le
// pone un id y un tier nuevos, porque el catálogo no los hereda de nada.
function itemComoEntradaDeCatalogo(draft){
  return {
    id: 'new-' + slugItemCatalogo(draft.nombre),
    nombre: draft.nombre, tier: 'A definir', imagen: draft.imagen || '',
    tipoItem: draft.tipoItem, peso: num(draft.peso), ranuras: num(draft.ranuras) || 1,
    ...(ES_ARMA(draft.tipoItem) ? {
      tipoDado: num(draft.tipoDado) || 8, danoFijo: num(draft.danoFijo),
      danoAmplificado: num(draft.danoAmplificado), armaDeRango: !!draft.armaDeRango,
      efectosGolpe: structuredClone(draft.efectosGolpe || []),
    } : {}),
    precioCompra: num(draft.precioCompra),
    unidades: num(draft.unidades) || 1, cargaMax: num(draft.cargaMax),
    consumible: !!draft.consumible, curahp: num(draft.curahp), curaspPct: num(draft.curaspPct),
    efectoNombre: draft.efectoNombre || '', efectoTurnos: num(draft.efectoTurnos),
    efectoHpTurno: num(draft.efectoHpTurno), efectoEscudo: num(draft.efectoEscudo), efectoStacks: Math.max(1, num(draft.efectoStacks) || 1), efectoPermanente: !!draft.efectoPermanente,
    efectoDetalle: draft.efectoDetalle || '', efectoMods: structuredClone(draft.efectoMods || []),
    equipoEstadoNombre: draft.equipoEstadoNombre || '', equipoEstadoHpTurno: num(draft.equipoEstadoHpTurno),
    equipoEstadoDetalle: draft.equipoEstadoDetalle || '',
    mods: structuredClone((draft.mods || []).filter(m => m.stat)),
    detalle: draft.detalle || '',
  };
}

/* ⬆ Subir al catálogo (paso 5 de docs/plan-subida-unificada.md, P124): el ítem va a la biblioteca compartida de Firebase
   (tipo `items`), disponible al instante para todos, 🔶 sin auditar hasta que lo revise el dueño. Antes escribía
   datos/catalogo.json por GitHub (con token) y no llegaba a nadie hasta correr un script. Si el ítem salió del catálogo
   (mismo id, o mismo nombre), se puede elegir que sea una CORRECCIÓN de ese ítem: lo reemplaza para todos. */
function agregarAlCatalogoDelFabricante(){
  if(editing) subirItemAlCatalogo(editing.draft, editing.key);
}
// `key` = 'catalogo' si es un ítem del catálogo (se sube tal cual); si no, es un ítem de un personaje (mochila, cinturón).
function subirItemAlCatalogo(draft, key){
  if(!String(draft.nombre || '').trim()){ toast('Poné un nombre antes de subirlo al catálogo'); return; }
  if(!draft.tipoItem){ toast('Elegí una categoría antes de subirlo al catálogo'); return; }
  const datos = key === 'catalogo' ? structuredClone(draft) : itemComoEntradaDeCatalogo(draft);
  if(key !== 'catalogo'){ const base = (S.catalogo || []).find(c => sinAviso(c.nombre) === sinAviso(draft.nombre)); if(base && base.tier) datos.tier = base.tier; }
  Biblioteca.guardar({tipo: 'items', datos, nombre: datos.nombre, nivel: 0, basadoEn: ItemsSubidos.basadoEn(draft, S.catalogo),
    alSubir: () => cargarItemsSubidos()});
}
$('#modal-catalogo').onclick = agregarAlCatalogoDelFabricante;

// Lo subido por el grupo, sumado al catálogo de esta ficha (comun/items-subidos.js). Se lee al entrar y después de subir.
let itemsSubidos = [];
function mezclarItemsSubidos(){
  if(!Array.isArray(S.catalogo)) return;
  S.catalogo = ItemsSubidos.mezclar(S.catalogo, itemsSubidos, DEFAULT.catalogo);
  if(document.getElementById('scrim-catalogo') && $('#scrim-catalogo').classList.contains('open')) renderCatalogoModal();
}
function cargarItemsSubidos(){
  return ItemsSubidos.cargar().then(l => { itemsSubidos = l; mezclarItemsSubidos(); });
}

$('#modal-save').onclick = () => {
  const {key, id, draft} = editing;
  if(!draft.nombre.trim()) draft.nombre = 'Sin nombre';
  // Un estado nuevo desde el formulario completo: la misma regla que el "+ Estado" (inmunidades, acumular o renovar).
  if(key === 'efectos' && !id){
    closeModal();
    agregarEstadoConAviso(S.efectos, draft, '');
    renderList('efectos');
    refresh();
    return;
  }
  if(key === 'inventario' && draft.tipoItem === 'consumibles' && draft.equipado){
    // Los consumibles no van a "Equipo": si se marcan como equipados, pasan al cinturón.
    if(id) S.inventario = S.inventario.filter(x => x.id !== id);
    draft.equipado = false;
    const ya = S.cinturon.findIndex(x => x.id === draft.id);
    if(ya >= 0) S.cinturon[ya] = draft; else S.cinturon.push(draft);
    closeModal();
    renderInventario(); renderList('cinturon');
    refresh();
    toast(`${draft.nombre} pasó al cinturón`);
    return;
  }
  if(id){ const i = S[key].findIndex(x=>x.id===id); S[key][i] = draft; }
  else S[key].push(draft);
  closeModal();
  if(key === 'inventario') renderInventario();
  else if(key === 'catalogo'){ $('#catalogo-buscar').value = ''; renderCatalogoModal(); $('#scrim-catalogo').classList.add('open'); }
  else renderList(key);
  refresh();
};
$('#modal-del').onclick = () => {
  const {key, id} = editing;
  const it = S[key].find(x=>x.id===id);
  if(it && !confirm(`¿Eliminar "${it.nombre}"? No se puede deshacer.`)) return;
  S[key] = S[key].filter(x=>x.id!==id);
  closeModal();
  if(key === 'inventario') renderInventario();
  else if(key === 'catalogo'){ $('#catalogo-buscar').value = ''; renderCatalogoModal(); $('#scrim-catalogo').classList.add('open'); }
  else renderList(key);
  refresh();
};
$('#modal-cancel').onclick = closeModal;
$('#modal-x').onclick = closeModal;
$('#modal-activar').onclick = () => $('#modal-save').click();
$('#scrim').addEventListener('mousedown', e => { if(e.target.id==='scrim') closeModal(); });
document.addEventListener('keydown', e => { if(e.key==='Escape'){ closeModal(); $('#scrim-reminder').classList.remove('open'); $('#scrim-view').classList.remove('open'); $('#scrim-costox').classList.remove('open'); $('#scrim-chooser').classList.remove('open'); $('#scrim-catalogo').classList.remove('open'); $('#scrim-portrait').classList.remove('open'); $('#scrim-elegir-arma').classList.remove('open'); $('#scrim-revivir').classList.remove('open'); $('#scrim-item-aleatorio').classList.remove('open'); if(presetDestino === 'duelo') cerrarPresetsDuelo(null); else $('#scrim-presets').classList.remove('open'); $('#scrim-tipoitem').classList.remove('open'); $('#scrim-comparar').classList.remove('open'); $('#scrim-slot-lleno').classList.remove('open'); $('#scrim-equipo').classList.remove('open'); $('#scrim-sin-nitros').classList.remove('open'); $('#scrim-todos-estados').classList.remove('open'); document.querySelectorAll('.dock-panel').forEach(p => { p.hidden = true; }); } });
function closeModal(){ $('#scrim').classList.remove('open'); editing = null; }


