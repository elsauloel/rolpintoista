// js/10-habilidades-pasivas-e-items.js — tramo 10 de 14 del script de ficha.html (paso 5, nivel A: mismo código, en el mismo orden).
/* ---------- + Habilidad: de clase (pool cargado) o custom ----------
   Job: cualquier habilidad de clase prefabricada 1 punto, custom 2.
   El pool sale de comun/skills-clase.js (CLASES_SKILLS). */
const HAB_JOB_CUSTOM = FichaEditor.HAB_JOB_CUSTOM;   // comun/ficha-editor.js (A6b)
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
const TIPODANO_TAGS = ['arcano', 'fuego', 'hielo', 'rayo', 'tóxico', 'físico'];
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
// La habilidad `habId` del pool `claseId`, lista para el personaje (la usan «+ Habilidad → De clase» y el asistente de personaje nuevo).
function habDeClase(claseId, habId){
  const deCreep = claseId === '_creep';
  const esCustomPool = claseId === '_custom' || deCreep;
  const clase = esCustomPool ? null : CLASES_SKILLS.find(c => c.id === claseId);
  const base = habsDelPool(claseId).find(h => h.id === habId);
  if(!base) return null;
  const job = esCustomPool ? HAB_JOB_CUSTOM : HAB_JOB_CLASE;
  // Se copia todo lo que trae la skill (costo, tirada, estado al ejecutar, la Ejecución completa…), y de dónde salió
  // (`bibOrigen`) para el aviso de versión nueva. Una subida sin Ejecución queda sin (null): si no, `dueloDe` caería en
  // la Ejecución de la de fábrica con el mismo id.
  const {_bib, para, clase: _clase, ...copia} = structuredClone(base);
  return {
    ...copia,
    id: uid(), costo: base.costo || '', nitrosCosto: base.nitrosCosto ?? IT2.nitrosHabilidad,
    automatizada: base.automatizada !== false, job: true, jobCosto: job, origen: '', imagen: '',
    habClaseId: base.id, habClase: deCreep ? 'De creep' : esCustomPool ? 'Pool custom' : clase.nombre,
    ...(para === 'creep' ? {para: 'creep'} : {}),   // queda la marca 🐾 a la vista en la ficha
    ...(_bib ? {bibOrigen: {tipo: 'skills', id: _bib.id, version: _bib.version}} : {}),
    ...(_bib && _bib.subida ? {duelo: copia.duelo || null} : {}),
  };
}
function agregarHabClase(claseId, habId){
  const deCreep = claseId === '_creep';
  const esCustomPool = claseId === '_custom' || deCreep;
  const base = habsDelPool(claseId).find(h => h.id === habId);
  if(!base) return;
  if(S.habilidades.some(x => claveHabClase(x) === base.id)){ toast(`${base.nombre} ya está en tu pool`); return; }
  const job = esCustomPool ? HAB_JOB_CUSTOM : HAB_JOB_CLASE;
  S.habilidades.push(habDeClase(claseId, habId));
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

// Una pasiva del catálogo, lista para el personaje (la usan «+ Pasiva» y el asistente de personaje nuevo).
function pasivaDeCatalogo(datos, meta){
  const clave = datos.poolId || (meta && String(meta.reemplaza || '').startsWith('base-') ? meta.reemplaza.slice(5) : claveDePasiva(datos));
  return {
    ...structuredClone(datos), id: uid(), poolId: clave, compras: 1,
    mods: (datos.mods || []).map(m => ({...m})), regenHp: num(datos.regenHp) || 0,
    job: true, jobCosto: Math.max(0, num(datos.jobCosto) || 1), origen: '', imagen: '',
    ...(meta && meta.id ? {bibOrigen: {tipo: 'pasivas', id: meta.id, version: meta.version || 1}} : {}),
  };
}
// Las pasivas del catálogo (de fábrica, con sus correcciones, y lo subido), como {datos, meta}.
function pasivasDelCatalogo(){
  const subidas = (typeof pasivasSubidas !== 'undefined' ? pasivasSubidas : []) || [];
  const base = (typeof PASIVAS_BASE !== 'undefined' ? PASIVAS_BASE : []).map(p => {
    const corr = subidas.find(e => e.reemplaza === 'base-' + p.poolId);
    return corr ? {datos: corr.datos, meta: corr} : {datos: p, meta: null};
  });
  return base.concat(subidas.filter(e => !e.reemplaza && e.datos && !e.datos.baja).map(e => ({datos: e.datos, meta: e})));
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
    S.pasivas.push(pasivaDeCatalogo(datos, meta));
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

/* El editor (formulario, paso a paso de habilidades, asistente de ítems) es un componente común: comun/ficha-editor.js (A6b,
   2026-10-02). La ventana es la común paso a paso (comun/paso-a-paso.js); editorFicha (al final de este archivo) lo conecta. */
function openEditor(key, id, equipadoPreset, opciones){ return editorFicha.abrir(key, id, equipadoPreset, opciones); }
// Los pasos y los modos del editor de habilidades viven en comun/ficha-editor.js (A6b): acá, los nombres de siempre.
const PASOS_HAB = FichaEditor.PASOS_HAB;
const MODOS_HAB = FichaEditor.MODOS_HAB;
function modoHab(h){ return FichaBotonera.modoHab(h); }   // la regla común (comun/combatiente.js), vía comun/ficha-botonera.js
const habAutomatizada = h => FichaBotonera.habAutomatizada(h);
function habLegado(h){ return FichaEditor.habLegado(h); }
function pasosHabilidad(draft){ return FichaEditor.pasosHabilidad(draft); }

function habilidadIrAPaso(n){ editorFicha.irAPaso(n); }

// 🪤 La trampa de una habilidad se arma en el editor común (comun/ficha-editor.js, A6b). Los estados que puede dejar, para el editor de las invocaciones:
function trampaEstadosLista(){ return FichaEditor.trampaEstadosLista(); }
// Se ejecuta con la habilidad: coloca la trampa en el mapa (si hay token del personaje en el mapa en juego).
// Habilidad con zona en el mapa (zonaMapa: 'cono'): le avisa al mapa (la ficha corre en su iframe) para que dibuje el área 3 segundos.
function avisarZonaAlMapa(h){ FichaAcciones.avisarZonaAlMapa(S, h, habUi); }   // comun/ficha-acciones.js (paso 3c-5c)
// Trampa consumible: la coloca junto a tu token (comun/ficha-acciones.js, paso 3c-7). Devuelve true si se colocó.
function colocarTrampaDeItem(it){ return FichaAcciones.colocarTrampaDeItem(fichaVivo ? fichaVivo.id : '', it, consumoUi); }
function colocarTrampaDeHab(h){ return FichaAcciones.colocarTrampaDeHab(S, h, habUi); }   // comun/ficha-acciones.js (paso 3c-5c)
function abrirAsistenteItem(key, id, op){ editorFicha.abrirAsistenteItem(key, id, op); }   // el asistente de ítems, desde el editor común

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

function drawEditor(){ editorFicha.dibujar(); }

function getModVal(draft, statId){ return FichaEditor.getModVal(draft, statId); }   // comun/ficha-editor.js (A6b)
function setModVal(draft, statId, val){ FichaEditor.setModVal(draft, statId, val); }

function slugItemCatalogo(s){ return FichaEditor.slugItemCatalogo(s); }   // comun/ficha-editor.js (A6b)
function itemComoEntradaDeCatalogo(draft){ return FichaEditor.itemComoEntradaDeCatalogo(draft); }

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

document.addEventListener('keydown', e => { if(e.key==='Escape'){ closeModal(); $('#scrim-reminder').classList.remove('open'); $('#scrim-view').classList.remove('open'); $('#scrim-costox').classList.remove('open'); $('#scrim-chooser').classList.remove('open'); $('#scrim-catalogo').classList.remove('open'); $('#scrim-portrait').classList.remove('open'); $('#scrim-elegir-arma').classList.remove('open'); $('#scrim-revivir').classList.remove('open'); $('#scrim-item-aleatorio').classList.remove('open'); if(presetDestino === 'duelo') cerrarPresetsDuelo(null); else $('#scrim-presets').classList.remove('open'); $('#scrim-tipoitem').classList.remove('open'); $('#scrim-comparar').classList.remove('open'); $('#scrim-slot-lleno').classList.remove('open'); $('#scrim-equipo').classList.remove('open'); $('#scrim-sin-nitros').classList.remove('open'); $('#scrim-todos-estados').classList.remove('open'); document.querySelectorAll('.dock-panel').forEach(p => { p.hidden = true; }); } });
// El editor común (comun/ficha-editor.js, A6b): todo se edita en la ventana común paso a paso. Lo que la ficha hace a su manera va en el ctx.
const editorFicha = FichaEditor.crear(document.body, {
  S: () => S,
  toast: m => toast(m),
  confirmar: t => confirm(t),
  // Se guardó o se borró algo de esas listas: se redibuja (y el guardado en vivo lo sube solo).
  alCambiar: keys => {
    keys.forEach(k => {
      if(k === 'inventario') renderInventario();
      else if(k === 'catalogo'){ $('#catalogo-buscar').value = ''; renderCatalogoModal(); $('#scrim-catalogo').classList.add('open'); }
      else renderList(k);
    });
    refresh();
  },
  elegirTipoItem: actual => elegirTipoItemFicha(actual),
  elegirEstadoItem: () => elegirEstadoItemFicha(),
  elegirEstadoDuelo: () => elegirEstadoDuelo(),
  alSubirCatalogo: () => cargarItemsSubidos(),
});
// `editing` (el borrador abierto) es el del editor común: lo leen y lo tocan los presets y la categoría (js/07).
Object.defineProperty(window, 'editing', {get: () => editorFicha.estado, set: v => { editorFicha.estado = v; }, configurable: true});
function closeModal(){ editorFicha.cerrar(); }


