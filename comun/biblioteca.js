/* =========================================================
   BIBLIOTECA GLOBAL (creeps, pasivas, trampas y, más adelante, skills)
   Base de datos compartida por todas las campañas, para que un GM no
   arme creeps de cero en cada partida. Solo texto, sin imágenes.

   Firestore (fuera de las campañas):
   - biblioteca_<tipo>/{id}  → la oficial. La lee cualquier cuenta
     confirmada; solo el dueño del proyecto (BIBLIOTECA_DUENO_EMAIL)
     escribe.
   - propuestas_<tipo>/{id}  → el camino VIEJO (hasta 2026-09-29): lo que
     mandaba un no-dueño quedaba ahí hasta que el dueño lo aprobaba. Se sigue
     mostrando al dueño mientras quede algo, y es el respaldo si las reglas
     nuevas todavía no están publicadas.
   Cada entrada: {nombre, etiquetas[], descripcion, nivel, json,
   autorUid, autorNombre, creado} + (desde 2026-09-29) {auditado, version,
   reemplaza, editorUid, editorNombre, actualizado}. `json` es el elemento
   como texto, ya limpio con su plantilla (comun/plantillas.js).

   SUBIDA UNIFICADA (paso 1 de docs/plan-subida-unificada.md, 2026-09-29):
   - Lo que sube cualquiera va DIRECTO a biblioteca_<tipo>, disponible al
     instante para todos, con `auditado: false` (🔶 sin auditar). Lo que sube
     el dueño entra auditado. Solo el dueño marca ✅ auditado.
   - Al subir algo que salió de otro elemento (`opts.basadoEn`), se pregunta
     si es una CORRECCIÓN de ese elemento (lo reemplaza: misma entrada,
     `version` + 1, vuelve a "sin auditar") o algo NUEVO. Corregir uno de
     fábrica (entrada `base-…` del código) crea una entrada con
     `reemplaza: 'base-…'` que lo tapa en la lista.
   - Al bajar, `alElegir(datos, meta)` recibe `meta = {tipo, id, version}`
     para que la copia guarde `bibOrigen` y la herramienta pueda avisar
     "hay una versión nueva" (`Biblioteca.entrada(tipo, id)`).

   Usa las globales de sesion.js (fbDb, fbUsuario, fbMiembro) y las clases
   .scrim/.modal/.btn/.iconbtn/.f de la herramienta donde se cargue.
   Reglas: firebase/firestore.rules. Ver docs/workflow-firebase.md.
   ========================================================= */

const BIBLIOTECA_DUENO_EMAIL = 'rolpintoista@gmail.com';

const Biblioteca = (() => {
  const esc = s => String(s ?? '').replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
  const aviso = m => { if(typeof toast === 'function') toast(m); else alert(m); };

  // Etiquetas sugeridas al guardar (cada uno puede escribir las suyas).
  const SUGERENCIAS = {
    trampas: ['foso', 'veneno', 'explosiva', 'alarma', 'mágica', 'mecánica', 'atrapa', 'fuego amigo'],
    pasivas: ['stat', 'regeneración', 'resistencia', 'defensiva', 'ofensiva', 'utilidad', 'visión', 'situacional'],
    habs_creep: ['daño', 'defensa', 'buff', 'debuff', 'curación', 'control', 'movilidad', 'área', 'rápida', 'lenta', 'sigilo', 'trampas'],
    creeps: ['bandidos', 'bosque', 'cavernas', 'infierno', 'pantano', 'montaña', 'desierto', 'ciudad', 'mar',
      'bestia', 'no-muerto', 'demonio', 'humanoide', 'elemental', 'jefe',
      'melee', 'rango', 'mágico', 'tanque', 'apoyo', 'asalto', 'debuffer'],
  };

  const estado = {};   // tipo -> {oficial, propuestas, vista, filtros:Set, texto, opts}

  const esDueno = () => !!(fbUsuario && fbUsuario.email === BIBLIOTECA_DUENO_EMAIL && fbUsuario.emailVerified);
  const hayMesa = () => !!(fbDb && fbUsuario);

  function limpiarEtiquetas(txt){
    const vistas = new Set();
    String(txt || '').split(',').forEach(t => {
      const e = t.trim().toLowerCase().slice(0, 30);
      if(e) vistas.add(e);
    });
    return [...vistas].slice(0, 12);
  }

  const ms = t => (t && typeof t.toMillis === 'function') ? t.toMillis() : 0;

  function armarEntrada(fila){
    const d = fila.data();
    let datos = null;
    try{ datos = JSON.parse(d.json || ''); }catch(e){ datos = null; }
    return {id: fila.id, nombre: d.nombre || '', etiquetas: Array.isArray(d.etiquetas) ? d.etiquetas : [],
      descripcion: d.descripcion || '', nivel: d.nivel, autorUid: d.autorUid, autorNombre: d.autorNombre || '', datos,
      // Lo de antes de la subida unificada ya había pasado por el dueño: cuenta como auditado.
      auditado: d.auditado !== false, version: Number(d.version) || 1, reemplaza: d.reemplaza || '',
      editorNombre: d.editorNombre || '',
      fecha: ms(d.actualizado) || ms(d.creado) || 0};
  }

  async function leer(coleccion){
    const snap = await fbDb.collection(coleccion).get();
    return snap.docs.map(armarEntrada).filter(e => e.datos)
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  }

  // Entradas incluidas en el código (opts.base): siempre están, aun sin Firebase.
  function entradasBase(opts){
    return (opts.base || []).map(b => ({id: `base-${b.poolId}`, nombre: b.nombre, etiquetas: b.etiquetas || [],
      descripcion: b.detalle || '', nivel: b.nivel !== undefined ? b.nivel : b.jobCosto, autorUid: '', autorNombre: '', datos: b.datos || b, base: true,
      auditado: true, version: 1, reemplaza: ''}));
  }

  // `opts.legado = {tipo, convertir(datos)}`: una colección de antes que se sigue mostrando junto a esta (las habilidades
  // de creep vivían en biblioteca_habs_creep hasta que se juntaron con las de jugador en biblioteca_skills, P122).
  // Sus entradas se leen de su colección (`col`), se convierten a la forma nueva y se pueden auditar, borrar y corregir;
  // una corrección de una entrada vieja es una entrada nueva con `reemplaza` (como las de fábrica).
  async function leerLegado(opts, prefijo){
    const L = opts && opts.legado;
    if(!L) return [];
    const col = prefijo + L.tipo;
    const lista = await leer(col).catch(() => []);
    return lista.map(e => ({...e, col, legado: true, datos: L.convertir ? L.convertir(e.datos) : e.datos}));
  }

  async function cargar(tipo, forzar){
    const st = estado[tipo];
    if(!forzar && st.oficial) return;
    const base = entradasBase(st.opts);
    if(!hayMesa()){ st.oficial = base; st.propuestas = []; return; }
    try{
      const subidas = [...await leer(`biblioteca_${tipo}`), ...await leerLegado(st.opts, 'biblioteca_')];
      // Una corrección de un elemento de fábrica (o de una colección vieja) lo tapa: queda solo la versión corregida.
      const tapados = new Set(subidas.map(e => e.reemplaza).filter(Boolean));
      st.oficial = [...base, ...subidas].filter(e => !tapados.has(e.id)).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
      st.propuestas = esDueno() ? [...await leer(`propuestas_${tipo}`).catch(() => []), ...await leerLegado(st.opts, 'propuestas_')] : [];
    }catch(err){
      if(!base.length) throw err;
      console.error('Biblioteca:', err);
      st.oficial = base; st.propuestas = [];
    }
  }

  /* ---------- Ventana principal ---------- */

  function asegurarVentana(){
    if(document.getElementById('scrim-biblioteca')) return;
    const estilos = document.createElement('style');
    estilos.textContent = `
      .bib-chips{display:flex;flex-wrap:wrap;gap:6px}
      .bib-chip{border:1px solid var(--line,#5b4a3a);background:transparent;color:inherit;border-radius:999px;padding:3px 10px;font-size:12px;cursor:pointer}
      .bib-chip.on{background:var(--copper,#c98545);color:#180F08;border-color:var(--copper,#c98545)}
      .bib-lista{display:flex;flex-direction:column;gap:8px;max-height:46vh;overflow:auto}
      .bib-fila{display:flex;gap:10px;align-items:flex-start;border:1px solid var(--line,#5b4a3a);border-radius:8px;padding:8px 10px}
      .bib-fila .info{flex:1;min-width:0}
      .bib-fila .tit{font-weight:700}
      .bib-fila .tags{font-size:11px;opacity:.75;margin-top:2px}
      .bib-fila .desc{font-size:12px;opacity:.85;margin-top:4px}
      .bib-fila .acc{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
      .bib-tabs{display:flex;gap:8px}
      .bib-grupos{display:flex;flex-wrap:wrap;gap:8px;align-items:flex-start}
      .bib-grupo{position:relative}
      .bib-grupo > button{display:flex;gap:6px;align-items:center}
      .bib-grupo > button .n{background:var(--copper,#c98545);color:#180F08;border-radius:999px;padding:0 7px;font-size:11px;font-weight:700}
      .bib-pop{display:none;position:absolute;top:calc(100% + 4px);left:0;z-index:5;min-width:220px;max-width:340px;background:var(--panel,#1a1418);border:1px solid var(--copper,#c98545);border-radius:8px;padding:10px;box-shadow:0 10px 26px rgba(0,0,0,.6);max-height:240px;overflow:auto}
      .bib-grupo.abierto .bib-pop{display:block}
      .bib-activos{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:12px;width:100%}
      .bib-sinaud{font-size:11px;font-weight:600;color:#e0a040;margin-left:6px;white-space:nowrap}
      .bib-ver{font-size:11px;opacity:.7;margin-left:6px}
      .bib-cual{display:flex;flex-direction:column;gap:6px}
      .bib-cual button{text-align:left;white-space:normal}
    `;
    document.head.appendChild(estilos);
    const cont = document.createElement('div');
    cont.innerHTML = `
    <div class="scrim" id="scrim-biblioteca">
      <div class="modal" style="max-width:820px">
        <header><h3 id="bib-titulo">📚 Biblioteca</h3><button class="iconbtn" id="bib-x">Cerrar</button></header>
        <div class="body" style="display:flex;flex-direction:column;gap:10px">
          <div class="bib-tabs" id="bib-tabs"></div>
          <div id="bib-cero" style="display:none"></div>
          <input type="search" id="bib-buscar" placeholder="Buscar por nombre o descripción…">
          <div class="bib-chips" id="bib-chips"></div>
          <div class="hint" id="bib-cuenta"></div>
          <div class="bib-lista" id="bib-lista"></div>
        </div>
      </div>
    </div>
    <div class="scrim" id="scrim-biblioteca-guardar" style="z-index:99700">
      <div class="modal" style="max-width:480px">
        <header><h3 id="bibg-titulo">⬆ Subir a la biblioteca</h3><button class="iconbtn" id="bibg-x">Cerrar</button></header>
        <div class="body" style="display:flex;flex-direction:column;gap:10px">
          <div class="hint" id="bibg-aviso"></div>
          <div id="bibg-cual"></div>
          <div class="f"><label>Nombre</label><input id="bibg-nombre" maxlength="60"></div>
          <div class="f"><label>Etiquetas</label>
            <div class="bib-grupos" id="bibg-tags" style="margin-bottom:6px"></div>
            <input id="bibg-etiquetas" placeholder="Las que elijas arriba aparecen acá; podés escribir otras, separadas por coma"></div>
          <div class="f"><label>Descripción corta (opcional)</label><textarea id="bibg-desc" rows="3" maxlength="300"></textarea></div>
        </div>
        <footer>
          <button class="btn ghost" id="bibg-cancel">Cancelar</button>
          <button class="btn primary" id="bibg-ok">⬆ Subir</button>
        </footer>
      </div>
    </div>`;
    document.body.append(...cont.children);

    const q = id => document.getElementById(id);
    q('bib-x').onclick = () => q('scrim-biblioteca').classList.remove('open');
    q('scrim-biblioteca').addEventListener('mousedown', e => { if(e.target.id === 'scrim-biblioteca') q('bib-x').click(); });
    q('bibg-x').onclick = q('bibg-cancel').onclick = () => q('scrim-biblioteca-guardar').classList.remove('open');
    q('bib-buscar').addEventListener('input', e => {
      const st = estado[actual]; if(!st) return;
      st.texto = e.target.value.trim().toLowerCase();
      pintarLista();
    });
    q('bib-chips').addEventListener('click', e => {
      const g = e.target.closest('[data-bibgrupo]');
      if(g){
        const st = estado[actual];
        if(g.dataset.bibgrupo === '__limpiar'){ st.filtros.clear(); st.grupoAbierto = null; }
        else st.grupoAbierto = st.grupoAbierto === g.dataset.bibgrupo ? null : g.dataset.bibgrupo;
        pintarChips(); pintarLista();
        return;
      }
      const b = e.target.closest('[data-bibtag]'); if(!b) return;
      const st = estado[actual];
      const t = b.dataset.bibtag;
      if(st.filtros.has(t)) st.filtros.delete(t); else st.filtros.add(t);
      pintarChips(); pintarLista();
    });
    q('scrim-biblioteca').addEventListener('mousedown', e => {
      const st = estado[actual];
      if(st && st.grupoAbierto && !e.target.closest('.bib-grupo')){ st.grupoAbierto = null; pintarChips(); }
    });
    q('bib-tabs').addEventListener('click', e => {
      const b = e.target.closest('[data-bibvista]'); if(!b) return;
      estado[actual].vista = b.dataset.bibvista;
      estado[actual].filtros.clear();
      pintar();
    });
    q('bib-lista').addEventListener('click', accionFila);

    // Selector de etiquetas de "Guardar en la biblioteca": el campo de texto es la fuente de verdad, los chips lo escriben.
    q('bibg-tags').addEventListener('click', e => {
      const g = e.target.closest('[data-bibggrupo]');
      if(g){ tagsGuardar.abierto = tagsGuardar.abierto === g.dataset.bibggrupo ? null : g.dataset.bibggrupo; pintarTagsGuardar(); return; }
      const b = e.target.closest('[data-bibgtag]'); if(!b) return;
      const sel = limpiarEtiquetas(q('bibg-etiquetas').value);
      const t = b.dataset.bibgtag.toLowerCase().slice(0, 30);
      q('bibg-etiquetas').value = (sel.includes(t) ? sel.filter(x => x !== t) : [...sel, t]).join(', ');
      pintarTagsGuardar();
    });
    q('bibg-etiquetas').addEventListener('input', pintarTagsGuardar);
    q('scrim-biblioteca-guardar').addEventListener('mousedown', e => {
      if(tagsGuardar.abierto && !e.target.closest('.bib-grupo')){ tagsGuardar.abierto = null; pintarTagsGuardar(); }
    });
  }

  const tagsGuardar = {grupos: [], abierto: null};
  function pintarTagsGuardar(){
    const sel = new Set(limpiarEtiquetas(document.getElementById('bibg-etiquetas').value));
    const chip = t => `<button type="button" class="bib-chip${sel.has(t.toLowerCase()) ? ' on' : ''}" data-bibgtag="${esc(t)}">${esc(t)}</button>`;
    document.getElementById('bibg-tags').innerHTML = tagsGuardar.grupos.map(g => {
      const n = g.tags.filter(t => sel.has(t.toLowerCase())).length;
      return `<div class="bib-grupo${tagsGuardar.abierto === g.nombre ? ' abierto' : ''}">
        <button type="button" class="btn${n ? ' primary' : ''}" data-bibggrupo="${esc(g.nombre)}">${esc(g.nombre)}${n ? ` <span class="n">${n}</span>` : ''} ▾</button>
        <div class="bib-pop"><div class="bib-chips">${g.tags.map(chip).join('')}</div></div></div>`;
    }).join('');
  }
  // Todas las etiquetas disponibles: las de los grupos definidos + las que ya usan las entradas de la biblioteca + las sugeridas del tipo.
  function armarGruposTags(defGrupos, tags){
    const usadas = new Set();
    const out = (defGrupos || []).map(g => {
      g.tags.forEach(t => usadas.add(t));
      return {nombre: g.nombre, tags: [...g.tags]};
    });
    const otros = [...tags].filter(t => !usadas.has(t)).sort((a, b) => a.localeCompare(b, 'es'));
    if(otros.length) out.push({nombre: defGrupos && defGrupos.length ? 'Otros' : 'Etiquetas', tags: otros});
    return out;
  }

  let actual = null;

  function listaVista(st){
    if(st.vista === 'propuestas') return st.propuestas;
    if(st.vista === 'sinauditar') return st.oficial.filter(e => !e.auditado);
    return st.oficial;
  }

  function pintar(){
    const st = estado[actual];
    const q = id => document.getElementById(id);
    const sinAud = st.oficial.filter(e => !e.auditado).length;
    // Pestañas: todo / lo que falta auditar (la ven todos) / las propuestas del camino viejo (solo el dueño, si quedan).
    q('bib-tabs').innerHTML = (sinAud || (esDueno() && st.propuestas.length))
      ? `<button class="btn ${st.vista === 'oficial' ? 'primary' : ''}" data-bibvista="oficial">Todo (${st.oficial.length})</button>
         ${sinAud ? `<button class="btn ${st.vista === 'sinauditar' ? 'primary' : ''}" data-bibvista="sinauditar">🔶 Sin auditar (${sinAud})</button>` : ''}
         ${esDueno() && st.propuestas.length ? `<button class="btn ${st.vista === 'propuestas' ? 'primary' : ''}" data-bibvista="propuestas">Propuestas viejas (${st.propuestas.length})</button>` : ''}`
      : '';
    pintarChips();
    pintarLista();
  }

  function pintarChips(){
    const st = estado[actual];
    const cuenta = {};
    listaVista(st).forEach(e => e.etiquetas.forEach(t => { cuenta[t] = (cuenta[t] || 0) + 1; }));
    const tags = Object.keys(cuenta).sort((a, b) => a.localeCompare(b, 'es'));
    const chip = t => `<button class="bib-chip${st.filtros.has(t) ? ' on' : ''}" data-bibtag="${esc(t)}">${esc(t)} · ${cuenta[t]}</button>`;
    const cont = document.getElementById('bib-chips');
    if(!st.opts.grupos){ cont.className = 'bib-chips'; cont.innerHTML = tags.map(chip).join(''); return; }
    // Filtros agrupados por criterio, cada grupo en un menú desplegable.
    const grupos = agruparEtiquetas(st, tags);
    cont.className = 'bib-grupos';
    cont.innerHTML = grupos.map(g => {
      const sel = g.tags.filter(t => st.filtros.has(t)).length;
      return `<div class="bib-grupo${st.grupoAbierto === g.nombre ? ' abierto' : ''}">
        <button class="btn${sel ? ' primary' : ''}" data-bibgrupo="${esc(g.nombre)}">${esc(g.nombre)}${sel ? ` <span class="n">${sel}</span>` : ''} ▾</button>
        <div class="bib-pop"><div class="bib-chips">${g.tags.map(chip).join('')}</div></div></div>`;
    }).join('') + (st.filtros.size ? `<div class="bib-activos"><span class="hint">Filtrando:</span>${[...st.filtros].map(t =>
      `<button class="bib-chip on" data-bibtag="${esc(t)}">${esc(t)} ✕</button>`).join('')}<button class="btn ghost" data-bibgrupo="__limpiar">Limpiar filtros</button></div>` : '');
  }
  // opts.grupos = [{nombre, tags:[...]}]; lo que no está en ningún grupo va a "Otros".
  function agruparEtiquetas(st, tags){
    const usadas = new Set();
    const out = st.opts.grupos.map(g => {
      const ts = g.tags.filter(t => tags.includes(t));
      ts.forEach(t => usadas.add(t));
      return {nombre: g.nombre, tags: ts};
    }).filter(g => g.tags.length);
    const otros = tags.filter(t => !usadas.has(t));
    if(otros.length) out.push({nombre: 'Otros', tags: otros});
    return out;
  }
  // Con grupos: dentro de un grupo alcanza con una de las etiquetas elegidas (o); entre grupos deben cumplirse todos (y).
  function pasaFiltros(st, e){
    if(!st.opts.grupos) return [...st.filtros].every(t => e.etiquetas.includes(t));
    const porGrupo = {};
    agruparEtiquetas(st, [...new Set(listaVista(st).flatMap(x => x.etiquetas))]).forEach(g => g.tags.forEach(t => { porGrupo[t] = g.nombre; }));
    const req = {};
    st.filtros.forEach(t => { (req[porGrupo[t] || 'Otros'] = req[porGrupo[t] || 'Otros'] || []).push(t); });
    return Object.values(req).every(ts => ts.some(t => e.etiquetas.includes(t)));
  }

  function pintarLista(){
    const st = estado[actual];
    const propuestas = st.vista === 'propuestas';
    const f = listaVista(st).filter(e =>
      pasaFiltros(st, e)
      && (!st.texto || (e.nombre + ' ' + e.descripcion).toLowerCase().includes(st.texto)));
    document.getElementById('bib-cuenta').textContent = `${f.length} de ${listaVista(st).length}`;
    document.getElementById('bib-lista').innerHTML = f.length ? f.map(e => `
      <div class="bib-fila">
        <div class="info">
          <div class="tit">${esc(e.nombre)}${st.opts.subtitulo ? esc(st.opts.subtitulo(e)) : (e.nivel !== undefined && e.nivel !== null ? ` · Lv ${esc(e.nivel)}` : '')}
            ${!propuestas && !e.auditado ? '<span class="bib-sinaud" title="Lo subió alguien del grupo y todavía no lo revisó el dueño. Se puede usar igual.">🔶 sin auditar</span>' : ''}
            ${e.version > 1 ? `<span class="bib-ver" title="Veces que se corrigió">v${esc(e.version)}</span>` : ''}</div>
          <div class="tags">${e.etiquetas.map(esc).join(' · ') || 'sin etiquetas'}${(propuestas || !e.base) && e.autorNombre ? ` · de ${esc(e.autorNombre)}` : ''}${e.editorNombre ? ` · corregido por ${esc(e.editorNombre)}` : ''}</div>
          ${e.descripcion ? `<div class="desc">${esc(e.descripcion)}</div>` : ''}
        </div>
        <div class="acc">
          <button class="btn primary" data-bibacc="agregar" data-id="${esc(e.id)}">${propuestas ? 'Traer a mi mesa' : 'Agregar'}</button>
          ${st.opts.alVer ? `<button class="btn" data-bibacc="ver" data-id="${esc(e.id)}">👁 Ver</button>` : ''}
          ${esDueno() && propuestas ? `<button class="btn" data-bibacc="aprobar" data-id="${esc(e.id)}">Aprobar</button>
            <button class="btn ghost" data-bibacc="rechazar" data-id="${esc(e.id)}">Rechazar</button>` : ''}
          ${esDueno() && !propuestas && !e.base && !e.auditado ? `<button class="btn" data-bibacc="auditar" data-id="${esc(e.id)}">✅ Auditado</button>` : ''}
          ${esDueno() && !propuestas && !e.base ? `<button class="btn" data-bibacc="etiquetas" data-id="${esc(e.id)}">✎ Etiquetas</button>` : ''}
          ${!propuestas && !e.base && (esDueno() || (!e.auditado && fbUsuario && e.autorUid === fbUsuario.uid)) ? `<button class="btn ghost" data-bibacc="borrar" data-id="${esc(e.id)}">Borrar</button>` : ''}
        </div>
      </div>`).join('') : '<div class="hint">No hay nada con ese filtro.</div>';
  }

  async function accionFila(e){
    const b = e.target.closest('[data-bibacc]'); if(!b) return;
    const st = estado[actual];
    const tipoAct = actual;
    const lista = listaVista(st);
    const ent = lista.find(x => x.id === b.dataset.id);
    if(!ent) return;
    const coleccion = ent.col || ((st.vista === 'propuestas' ? 'propuestas_' : 'biblioteca_') + actual);
    const acc = b.dataset.bibacc;
    try{
      if(acc === 'ver'){
        st.opts.alVer(structuredClone(ent.datos), ent);
      }else if(acc === 'agregar'){
        // meta: de dónde salió la copia, para el aviso de "hay una versión nueva" (la herramienta la guarda en bibOrigen).
        st.opts.alElegir(structuredClone(ent.datos), {tipo: tipoAct, id: ent.id, version: ent.version || 1, reemplaza: ent.reemplaza || ''});
        document.getElementById('scrim-biblioteca').classList.remove('open');
      }else if(acc === 'rechazar'){
        if(!confirm(`¿Rechazar la propuesta "${ent.nombre}"? Se borra.`)) return;
        await fbDb.collection(coleccion).doc(ent.id).delete();
        st.propuestas = lista.filter(x => x !== ent);
        pintar();
      }else if(acc === 'borrar'){
        if(!confirm(`¿Borrar "${ent.nombre}" de la biblioteca? No se puede deshacer.`)) return;
        await fbDb.collection(coleccion).doc(ent.id).delete();
        await cargar(tipoAct, true);   // relee: si era la corrección de uno de fábrica, el original vuelve a aparecer
        pintar();
      }else if(acc === 'auditar'){
        await fbDb.collection(coleccion).doc(ent.id).update({auditado: true});
        ent.auditado = true;
        aviso(`"${ent.nombre}" quedó auditado`);
        pintar();
      }else if(acc === 'etiquetas'){
        const txt = prompt('Etiquetas (separadas por coma):', ent.etiquetas.join(', '));
        if(txt === null) return;
        ent.etiquetas = limpiarEtiquetas(txt);
        await fbDb.collection(coleccion).doc(ent.id).update({etiquetas: ent.etiquetas});
        pintar();
      }else if(acc === 'aprobar'){
        const ts = firebase.firestore.FieldValue.serverTimestamp();
        const batch = fbDb.batch();
        batch.set(fbDb.collection(`biblioteca_${actual}`).doc(ent.id), {
          nombre: ent.nombre, etiquetas: ent.etiquetas, descripcion: ent.descripcion, nivel: ent.nivel ?? 0,
          json: JSON.stringify(ent.datos), autorUid: ent.autorUid, autorNombre: ent.autorNombre, creado: ts,
        });   // sin `auditado`: cuenta como auditado (y así anda también con las reglas viejas)
        batch.delete(fbDb.collection(coleccion).doc(ent.id));
        await batch.commit();
        st.propuestas = lista.filter(x => x !== ent);
        st.oficial = [...st.oficial, ent].sort((a, c) => a.nombre.localeCompare(c.nombre, 'es'));
        aviso(`"${ent.nombre}" pasó a la biblioteca oficial`);
        pintar();
      }
    }catch(err){
      console.error('Biblioteca:', err);
      aviso(err.code === 'permission-denied' ? 'No tenés permiso para eso en la biblioteca.' : 'No se pudo completar (mirá la consola).');
    }
  }

  /**
   * Abre la biblioteca. opts: {tipo, titulo, alElegir(datos), alCrearDeCero?,
   * textoCrearDeCero?}. `datos` es el creep/skill (copia) sin id.
   */
  async function abrir(opts){
    if(!hayMesa() && !(opts.base && opts.base.length)){ aviso('Entrá primero a una partida para usar la biblioteca.'); return; }
    asegurarVentana();
    const tipo = opts.tipo;
    actual = tipo;
    estado[tipo] = estado[tipo] || {oficial: null, propuestas: [], vista: 'oficial', filtros: new Set(), texto: ''};
    const st = estado[tipo];
    st.opts = opts; st.vista = 'oficial'; st.filtros.clear(); st.texto = ''; st.grupoAbierto = null;
    const q = id => document.getElementById(id);
    q('bib-titulo').textContent = `📚 ${opts.titulo || 'Biblioteca'}`;
    q('bib-buscar').value = '';
    const cero = q('bib-cero');
    if(opts.alCrearDeCero){
      cero.style.display = '';
      cero.innerHTML = `<button class="btn primary" id="bib-cero-btn">${esc(opts.textoCrearDeCero || 'Crear de cero')}</button>
        ${opts.alAsistente ? `<button class="btn primary" id="bib-asistente-btn">${esc(opts.textoAsistente || 'Crear paso a paso')}</button>` : ''}
        <span class="hint"> …o elegí uno de la biblioteca:</span>`;
      q('bib-cero-btn').onclick = () => { q('scrim-biblioteca').classList.remove('open'); opts.alCrearDeCero(); };
      if(opts.alAsistente) q('bib-asistente-btn').onclick = () => { q('scrim-biblioteca').classList.remove('open'); opts.alAsistente(); };
    }else cero.style.display = 'none';
    // opts.z: abrirla por encima de otra ventana (ej. el editor de una habilidad, en la ventana común paso a paso); si no, la altura de siempre.
    q('scrim-biblioteca').style.zIndex = opts.z ? String(opts.z) : '';
    q('scrim-biblioteca').classList.add('open');
    q('bib-lista').innerHTML = '<div class="hint">Cargando…</div>';
    try{
      await cargar(tipo, true);   // siempre relee: lo que subió otro aparece sin recargar la página
      pintar();
    }catch(err){
      console.error('Biblioteca:', err);
      q('bib-lista').innerHTML = '<div class="hint">No se pudo cargar la biblioteca (¿publicaste las reglas nuevas de Firestore?).</div>';
    }
  }

  /**
   * Sube algo a la biblioteca (el "Subir" único, paso 1 de la subida unificada).
   * opts: {tipo, datos, nombre, nivel?, grupos?, base?, basadoEn?}.
   * - `datos` se limpia con su plantilla (comun/plantillas.js) antes de subir.
   * - Queda disponible al instante para todos; si no lo sube el dueño, marcado "sin auditar".
   * - `basadoEn = {id, nombre?}`: el elemento de la biblioteca del que salió (id de Firebase o `base-…` de fábrica).
   *   Si viene, se pregunta si es una corrección de ese elemento o algo nuevo.
   * - `datosPara(modo)` (opcional, en lugar de `datos`): arma los datos según lo que se eligió ('correccion' | 'nuevo');
   *   la ficha lo usa para que una corrección quede en la clase del original y algo nuevo vaya al pool custom.
   * - `alSubir({id, version, modo})` (opcional): se llama al terminar bien, con la entrada que quedó (no con el
   *   camino viejo), para que la copia de quien subió apunte a esa versión y no se avise a sí mismo.
   * - Si las reglas nuevas de Firestore todavía no están publicadas, cae al camino viejo (propuesta).
   */
  function guardar(opts){
    if(!hayMesa()){ aviso('Entrá primero a una partida para usar la biblioteca.'); return; }
    asegurarVentana();
    const tipo = opts.tipo;
    const q = id => document.getElementById(id);
    const dueno = esDueno();
    const datosDe = m => { const d = opts.datosPara ? opts.datosPara(m) : opts.datos; return typeof Plantillas !== 'undefined' ? Plantillas.limpiar(tipo, d) : d; };
    const st = estado[tipo] = estado[tipo] || {oficial: null, propuestas: [], vista: 'oficial', filtros: new Set(), texto: '', opts: {base: opts.base, grupos: opts.grupos, legado: opts.legado}};
    if(!st.opts) st.opts = {base: opts.base, grupos: opts.grupos, legado: opts.legado};
    if(opts.legado && !st.opts.legado){ st.opts.legado = opts.legado; st.oficial = null; }
    // El elemento del que salió (si todavía existe en la lista cargada), para ofrecer "es una corrección".
    const origenEnt = () => opts.basadoEn && (st.oficial || []).find(e => e.id === opts.basadoEn.id || (e.reemplaza && e.reemplaza === opts.basadoEn.id));
    let modo = opts.basadoEn ? '' : 'nuevo';   // '' = todavía no eligió; 'correccion' | 'nuevo'
    const pintarCual = () => {
      const b = opts.basadoEn;
      if(!b){ q('bibg-cual').innerHTML = ''; return; }
      const nom = (origenEnt() || {}).nombre || b.nombre || 'el original';
      q('bibg-cual').innerHTML = `<div class="f"><label>¿Qué estás subiendo?</label><div class="bib-cual">
        <button type="button" class="btn${modo === 'correccion' ? ' primary' : ''}" data-bibgcual="correccion">✎ Una corrección de «${esc(nom)}» — la reemplaza para todos (quien ya lo tenga ve el aviso de versión nueva)</button>
        <button type="button" class="btn${modo === 'nuevo' ? ' primary' : ''}" data-bibgcual="nuevo">＋ Algo nuevo — «${esc(nom)}» queda como está y esto se suma aparte</button>
      </div></div>`;
    };
    const avisoTxt = () => (modo === 'correccion'
      ? 'Reemplaza al original para todos, al instante.'
      : 'Queda disponible para todos al instante.')
      + (dueno ? ' Como sos el dueño, entra ya auditado.' : ' Queda marcado 🔶 sin auditar hasta que lo revise el dueño.');
    q('bibg-aviso').textContent = avisoTxt();
    q('bibg-nombre').value = opts.nombre || '';
    q('bibg-etiquetas').value = '';
    q('bibg-desc').value = '';
    q('bibg-cual').onclick = e => {
      const b = e.target.closest('[data-bibgcual]'); if(!b) return;
      modo = b.dataset.bibgcual;
      // Una corrección arranca con las etiquetas y la descripción del original (si no se escribió nada todavía).
      const o = origenEnt();
      if(modo === 'correccion' && o){
        if(!q('bibg-etiquetas').value.trim()) q('bibg-etiquetas').value = o.etiquetas.join(', ');
        if(!q('bibg-desc').value.trim()) q('bibg-desc').value = o.descripcion || '';
        pintarTagsGuardar();
      }
      q('bibg-aviso').textContent = avisoTxt();
      pintarCual();
    };
    pintarCual();
    // Etiquetas para elegir: primero las conocidas de entrada; después se suman las que ya usa la biblioteca (si se puede leer).
    const defGrupos = opts.grupos || (st.opts && st.opts.grupos) || null;
    const conocidas = new Set(SUGERENCIAS[tipo] || []);
    (defGrupos || []).forEach(g => g.tags.forEach(t => conocidas.add(t)));
    tagsGuardar.grupos = armarGruposTags(defGrupos, conocidas);
    tagsGuardar.abierto = null;
    pintarTagsGuardar();
    cargar(tipo, false).then(() => {
      [...(st.oficial || []), ...(st.propuestas || [])].forEach(e => e.etiquetas.forEach(t => conocidas.add(t)));
      tagsGuardar.grupos = armarGruposTags(defGrupos, conocidas);
      pintarTagsGuardar();
      pintarCual();
    }).catch(() => {});
    q('scrim-biblioteca-guardar').classList.add('open');
    q('bibg-ok').onclick = async () => {
      const nombre = q('bibg-nombre').value.trim().slice(0, 60);
      if(!nombre){ aviso('Ponele un nombre.'); return; }
      if(!modo){ aviso('Elegí si es una corrección o algo nuevo.'); return; }
      await cargar(tipo, false).catch(() => {});   // para encontrar el original aunque se haya tocado Subir enseguida
      const json = JSON.stringify(datosDe(modo));
      if(json.length > 200000){ aviso('Es demasiado grande para la biblioteca.'); return; }
      const comun = {
        nombre, etiquetas: limpiarEtiquetas(q('bibg-etiquetas').value),
        descripcion: q('bibg-desc').value.trim().slice(0, 300),
        nivel: Math.max(0, Math.round(Number(opts.nivel ?? (modo === 'correccion' && origenEnt() ? origenEnt().nivel : 0)) || 0)), json,
      };
      const quien = String((fbMiembro && fbMiembro.nombre) || fbUsuario.displayName || '').slice(0, 40);
      const ts = firebase.firestore.FieldValue.serverTimestamp();
      const col = fbDb.collection(`biblioteca_${tipo}`);
      q('bibg-ok').disabled = true;
      let msg = '', subido = null;
      try{
        const o = modo === 'correccion' ? origenEnt() : null;
        const idOrigen = opts.basadoEn && opts.basadoEn.id;
        if(modo === 'correccion' && !o && !String(idOrigen || '').startsWith('base-'))
          throw Object.assign(new Error('ya no existe'), {code: 'no-existe'});
        if(modo === 'correccion' && o && !o.base && !o.legado){
          // Corrección de algo ya subido: misma entrada, versión + 1, vuelve a "sin auditar" (salvo que corrija el dueño).
          const ref = col.doc(o.id);
          await fbDb.runTransaction(async tx => {
            const doc = await tx.get(ref);
            if(!doc.exists) throw Object.assign(new Error('ya no existe'), {code: 'no-existe'});
            const version = (Number(doc.data().version) || 1) + 1;
            tx.update(ref, {...comun, auditado: dueno, version, editorUid: fbUsuario.uid, editorNombre: quien, actualizado: ts});
            subido = {id: o.id, version, modo};
          });
          msg = `"${nombre}" corregido para todos`;
        }else{
          // Algo nuevo, o la corrección de uno de fábrica o de una colección vieja (lo tapa con `reemplaza`).
          const reemplaza = modo === 'correccion' ? String(o ? o.id : idOrigen) : '';
          const ref = await col.add({...comun, autorUid: fbUsuario.uid, autorNombre: quien, creado: ts,
            auditado: dueno, version: reemplaza ? 2 : 1, reemplaza});
          subido = {id: ref.id, version: reemplaza ? 2 : 1, modo};
          msg = reemplaza ? `"${nombre}" reemplaza al original para todos` : `"${nombre}" subido: ya lo pueden usar todos`;
        }
      }catch(err){
        if(err && err.code === 'no-existe'){ aviso('El original ya no está en la biblioteca: subilo como algo nuevo.'); q('bibg-ok').disabled = false; return; }
        if(!(err && err.code === 'permission-denied')){
          console.error('Biblioteca:', err);
          aviso('No se pudo subir (mirá la consola).');
          q('bibg-ok').disabled = false;
          return;
        }
        // Reglas viejas todavía publicadas: el camino de antes (el dueño directo a la oficial, el resto como propuesta).
        try{
          await fbDb.collection((dueno ? 'biblioteca_' : 'propuestas_') + tipo).add({...comun, autorUid: fbUsuario.uid, autorNombre: quien, creado: ts});
          msg = dueno ? `"${nombre}" guardado (reglas viejas: publicá las nuevas de Firestore)`
            : `"${nombre}" mandado como propuesta (el dueño tiene que publicar las reglas nuevas para que se vea al instante)`;
        }catch(err2){
          console.error('Biblioteca:', err2);
          aviso('La biblioteca no te dejó guardar (¿reglas de Firestore sin publicar?).');
          q('bibg-ok').disabled = false;
          return;
        }
      }
      q('bibg-ok').disabled = false;
      st.oficial = null;   // la próxima vez se vuelve a leer
      q('scrim-biblioteca-guardar').classList.remove('open');
      aviso(msg);
      if(subido && opts.alSubir) try{ opts.alSubir(subido); }catch(e){ console.error('Biblioteca:', e); }
    };
  }

  /**
   * Lo subido de un tipo (sin lo de fábrica), leído de nuevo de Firebase, para herramientas que muestran la
   * biblioteca con su propia pantalla (la ficha con "+ Habilidad"). Cada entrada: {id, nombre, etiquetas,
   * descripcion, nivel, autorNombre, editorNombre, auditado, version, reemplaza, datos}. [] si no se puede leer.
   */
  async function lista(tipo){
    estado[tipo] = estado[tipo] || {oficial: null, propuestas: [], vista: 'oficial', filtros: new Set(), texto: '', opts: {}};
    if(!estado[tipo].opts) estado[tipo].opts = {};
    try{ await cargar(tipo, true); }catch(e){ console.error('Biblioteca:', e); return []; }
    return (estado[tipo].oficial || []).filter(e => !e.base).map(e => ({...e, datos: structuredClone(e.datos)}));
  }

  /**
   * La entrada actual de la biblioteca con ese id (o la que reemplaza a ese elemento de fábrica), para el aviso de
   * "hay una versión nueva": {id, nombre, version, auditado, datos} o null. `forzar` vuelve a leer de Firebase.
   */
  async function entrada(tipo, id, forzar){
    estado[tipo] = estado[tipo] || {oficial: null, propuestas: [], vista: 'oficial', filtros: new Set(), texto: '', opts: {}};
    if(!estado[tipo].opts) estado[tipo].opts = {};
    try{ await cargar(tipo, !!forzar); }catch(e){ return null; }
    const lista = estado[tipo].oficial || [];
    const e = lista.find(x => x.id === id) || lista.find(x => x.reemplaza && x.reemplaza === id);
    return e ? {id: e.id, nombre: e.nombre, version: e.version || 1, auditado: e.auditado, datos: structuredClone(e.datos)} : null;
  }

  /**
   * Busca, en una lista de `lista(tipo)`, la versión actual del elemento del que salió una copia (`origen = {id,
   * version}`, lo que la copia guarda en `bibOrigen`). Devuelve la entrada si es MÁS NUEVA que la de la copia y la
   * copia no dijo "Dejar la mía" para esa versión (`ignorada = 'id:version'`); si no, null.
   */
  function versionNueva(subidas, origen, ignorada){
    if(!origen || !origen.id) return null;
    const e = String(origen.id).startsWith('base-') ? (subidas || []).find(x => x.reemplaza === origen.id) : (subidas || []).find(x => x.id === origen.id);
    if(!e || (e.version || 1) <= (origen.version || 1)) return null;
    if(ignorada === e.id + ':' + (e.version || 1)) return null;
    return e;
  }

  /**
   * El cartel "🔔 hay una versión nueva" (decisión 3 del plan de subida unificada): el mismo para habilidades, creeps,
   * pasivas y trampas. opts: {nombre, entrada, que ('La habilidad'…), actualizarTxt (qué cambia y qué se queda),
   * dejarTxt ('Dejar la mía'), alActualizar(), alDejar()}. "Ahora no" no hace nada (vuelve a avisar la próxima vez).
   */
  function avisoVersion(opts){
    const e = opts.entrada;
    let fondo = document.getElementById('scrim-bib-version');
    if(!fondo){ fondo = document.createElement('div'); fondo.className = 'scrim'; fondo.id = 'scrim-bib-version'; fondo.style.zIndex = '99700'; document.body.appendChild(fondo); }
    const quien = e.editorNombre || e.autorNombre;
    const dejar = opts.dejarTxt || 'Dejar la mía';
    fondo.innerHTML = `<div class="modal" style="max-width:480px">
      <header><h3>🔔 ${esc(opts.nombre || e.nombre)}: hay una versión nueva</h3></header>
      <div class="body" style="display:flex;flex-direction:column;gap:8px">
        <div>${esc(opts.que || 'El elemento')}: el original de la biblioteca se corrigió${quien ? ` (por <b>${esc(quien)}</b>)` : ''} y ahora va por la versión ${esc(e.version || 1)}${e.auditado ? '' : ' (🔶 sin auditar todavía)'}.</div>
        ${(e.datos && e.datos.detalle) || e.descripcion ? `<div class="hint">${esc((e.datos && e.datos.detalle) || e.descripcion)}</div>` : ''}
        <div class="hint"><b>Actualizar</b> ${esc(opts.actualizarTxt || 'reemplaza lo tuyo por la versión nueva.')} <b>${esc(dejar)}</b> no vuelve a avisar de esta versión.</div>
      </div>
      <footer style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end">
        <button type="button" class="btn ghost" data-bv="despues">Ahora no</button>
        <button type="button" class="btn" data-bv="dejar">${esc(dejar)}</button>
        <button type="button" class="btn primary" data-bv="actualizar">Actualizar</button>
      </footer></div>`;
    fondo.classList.add('open');
    fondo.onclick = ev => {
      const b = ev.target.closest('[data-bv]');
      if(!b && ev.target !== fondo) return;
      fondo.classList.remove('open');
      if(!b || b.dataset.bv === 'despues') return;
      if(b.dataset.bv === 'dejar'){ if(opts.alDejar) opts.alDejar(); }
      else if(opts.alActualizar) opts.alActualizar();
    };
  }

  /* ---------- Para la pantalla única de auditoría (datos/auditoria.html, paso 6) ----------
     `col` = la colección de la entrada si no es la de siempre (las viejas de biblioteca_habs_creep traen `ent.col`). */
  const colDe = (tipo, col) => fbDb.collection(col || `biblioteca_${tipo}`);
  async function auditar(tipo, id, col){ await colDe(tipo, col).doc(id).update({auditado: true}); }
  async function descartar(tipo, id, col){ await colDe(tipo, col).doc(id).delete(); }
  // El dueño corrige una entrada desde la auditoría: misma entrada, versión + 1, queda auditada.
  async function corregirComoDueno(tipo, id, datos, col){
    const limpio = typeof Plantillas !== 'undefined' ? Plantillas.limpiar(tipo, datos) : datos;
    const json = JSON.stringify(limpio);
    if(json.length > 200000) throw new Error('Es demasiado grande para la biblioteca.');
    const ref = colDe(tipo, col).doc(id);
    const quien = String((fbMiembro && fbMiembro.nombre) || (fbUsuario && fbUsuario.displayName) || '').slice(0, 40);
    await fbDb.runTransaction(async tx => {
      const doc = await tx.get(ref);
      if(!doc.exists) throw new Error('Esa entrada ya no existe.');
      tx.update(ref, {json, auditado: true, version: (Number(doc.data().version) || 1) + 1,
        editorUid: fbUsuario.uid, editorNombre: quien, actualizado: firebase.firestore.FieldValue.serverTimestamp()});
    });
  }
  // Las propuestas del camino viejo (propuestas_<tipo>), que solo ve el dueño.
  async function propuestasViejas(tipo){ return esDueno() ? leer(`propuestas_${tipo}`).catch(() => []) : []; }
  async function aprobarPropuesta(tipo, ent){
    const batch = fbDb.batch();
    batch.set(fbDb.collection(`biblioteca_${tipo}`).doc(ent.id), {
      nombre: ent.nombre, etiquetas: ent.etiquetas, descripcion: ent.descripcion, nivel: ent.nivel ?? 0,
      json: JSON.stringify(ent.datos), autorUid: ent.autorUid, autorNombre: ent.autorNombre, creado: firebase.firestore.FieldValue.serverTimestamp(),
    });
    batch.delete(fbDb.collection(`propuestas_${tipo}`).doc(ent.id));
    await batch.commit();
  }
  async function rechazarPropuesta(tipo, id){ await fbDb.collection(`propuestas_${tipo}`).doc(id).delete(); }

  return {abrir, guardar, entrada, lista, versionNueva, avisoVersion, esDueno,
    auditar, descartar, corregirComoDueno, propuestasViejas, aprobarPropuesta, rechazarPropuesta};
})();
