/* =========================================================
   BIBLIOTECA GLOBAL (creeps, pasivas, trampas y, más adelante, skills)
   Base de datos compartida por todas las campañas, para que un GM no
   arme creeps de cero en cada partida. Solo texto, sin imágenes.

   Firestore (fuera de las campañas):
   - biblioteca_<tipo>/{id}  → la oficial. La lee cualquier cuenta
     confirmada; solo el dueño del proyecto (BIBLIOTECA_DUENO_EMAIL)
     escribe.
   - propuestas_<tipo>/{id}  → lo que manda cualquier GM con "Guardar en
     la biblioteca". Solo la ven su autor y el dueño, que las audita y las
     pasa a la oficial (o las rechaza).
   Cada entrada: {nombre, etiquetas[], descripcion, nivel, json,
   autorUid, autorNombre, creado}. `json` es el creep/skill como texto.

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
    creeps: ['bandidos', 'bosque', 'cavernas', 'infierno', 'pantano', 'montaña', 'desierto', 'ciudad', 'mar',
      'bestia', 'no-muerto', 'demonio', 'humanoide', 'elemental', 'jefe',
      'melee', 'rango', 'mágico', 'tanque', 'apoyo', 'emboscador', 'debuffer'],
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

  function armarEntrada(fila){
    const d = fila.data();
    let datos = null;
    try{ datos = JSON.parse(d.json || ''); }catch(e){ datos = null; }
    return {id: fila.id, nombre: d.nombre || '', etiquetas: Array.isArray(d.etiquetas) ? d.etiquetas : [],
      descripcion: d.descripcion || '', nivel: d.nivel, autorUid: d.autorUid, autorNombre: d.autorNombre || '', datos};
  }

  async function leer(coleccion){
    const snap = await fbDb.collection(coleccion).get();
    return snap.docs.map(armarEntrada).filter(e => e.datos)
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  }

  // Entradas incluidas en el código (opts.base): siempre están, aun sin Firebase.
  function entradasBase(opts){
    return (opts.base || []).map(b => ({id: `base-${b.poolId}`, nombre: b.nombre, etiquetas: b.etiquetas || [],
      descripcion: b.detalle || '', nivel: b.nivel !== undefined ? b.nivel : b.jobCosto, autorUid: '', autorNombre: '', datos: b.datos || b, base: true}));
  }

  async function cargar(tipo, forzar){
    const st = estado[tipo];
    if(!forzar && st.oficial) return;
    const base = entradasBase(st.opts);
    if(!hayMesa()){ st.oficial = base; st.propuestas = []; return; }
    try{
      st.oficial = [...base, ...await leer(`biblioteca_${tipo}`)];
      st.propuestas = esDueno() ? await leer(`propuestas_${tipo}`) : [];
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
      .bib-pop{display:none;position:absolute;top:calc(100% + 4px);left:0;z-index:5;min-width:220px;max-width:340px;background:var(--panel,#1a1418);border:1px solid var(--copper,#c98545);border-radius:8px;padding:10px;box-shadow:0 10px 26px rgba(0,0,0,.6)}
      .bib-grupo.abierto .bib-pop{display:block}
      .bib-activos{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:12px;width:100%}
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
    <div class="scrim" id="scrim-biblioteca-guardar" style="z-index:95">
      <div class="modal" style="max-width:480px">
        <header><h3 id="bibg-titulo">Guardar en la biblioteca</h3><button class="iconbtn" id="bibg-x">Cerrar</button></header>
        <div class="body" style="display:flex;flex-direction:column;gap:10px">
          <div class="hint" id="bibg-aviso"></div>
          <div class="f"><label>Nombre</label><input id="bibg-nombre" maxlength="60"></div>
          <div class="f"><label>Etiquetas (separadas por coma)</label>
            <input id="bibg-etiquetas" list="bibg-sugeridas" placeholder="ej: bosque, bestia, melee">
            <datalist id="bibg-sugeridas"></datalist>
            <div class="hint" id="bibg-sug-txt"></div></div>
          <div class="f"><label>Descripción corta (opcional)</label><textarea id="bibg-desc" rows="3" maxlength="300"></textarea></div>
        </div>
        <footer>
          <button class="btn ghost" id="bibg-cancel">Cancelar</button>
          <button class="btn primary" id="bibg-ok">Guardar</button>
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
  }

  let actual = null;

  function listaVista(st){
    return st.vista === 'propuestas' ? st.propuestas : st.oficial;
  }

  function pintar(){
    const st = estado[actual];
    const q = id => document.getElementById(id);
    q('bib-tabs').innerHTML = esDueno()
      ? `<button class="btn ${st.vista === 'oficial' ? 'primary' : ''}" data-bibvista="oficial">Oficial (${st.oficial.length})</button>
         <button class="btn ${st.vista === 'propuestas' ? 'primary' : ''}" data-bibvista="propuestas">Propuestas (${st.propuestas.length})</button>`
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
          <div class="tit">${esc(e.nombre)}${st.opts.subtitulo ? esc(st.opts.subtitulo(e)) : (e.nivel !== undefined && e.nivel !== null ? ` · Lv ${esc(e.nivel)}` : '')}</div>
          <div class="tags">${e.etiquetas.map(esc).join(' · ') || 'sin etiquetas'}${propuestas ? ` · de ${esc(e.autorNombre)}` : ''}</div>
          ${e.descripcion ? `<div class="desc">${esc(e.descripcion)}</div>` : ''}
        </div>
        <div class="acc">
          <button class="btn primary" data-bibacc="agregar" data-id="${esc(e.id)}">${propuestas ? 'Traer a mi mesa' : 'Agregar'}</button>
          ${st.opts.alVer ? `<button class="btn" data-bibacc="ver" data-id="${esc(e.id)}">👁 Ver</button>` : ''}
          ${esDueno() && propuestas ? `<button class="btn" data-bibacc="aprobar" data-id="${esc(e.id)}">Aprobar</button>
            <button class="btn ghost" data-bibacc="rechazar" data-id="${esc(e.id)}">Rechazar</button>` : ''}
          ${esDueno() && !propuestas && !e.base ? `<button class="btn" data-bibacc="etiquetas" data-id="${esc(e.id)}">✎ Etiquetas</button>
            <button class="btn ghost" data-bibacc="borrar" data-id="${esc(e.id)}">Borrar</button>` : ''}
        </div>
      </div>`).join('') : '<div class="hint">No hay nada con ese filtro.</div>';
  }

  async function accionFila(e){
    const b = e.target.closest('[data-bibacc]'); if(!b) return;
    const st = estado[actual];
    const coleccion = (st.vista === 'propuestas' ? 'propuestas_' : 'biblioteca_') + actual;
    const lista = listaVista(st);
    const ent = lista.find(x => x.id === b.dataset.id);
    if(!ent) return;
    const acc = b.dataset.bibacc;
    try{
      if(acc === 'ver'){
        st.opts.alVer(structuredClone(ent.datos), ent);
      }else if(acc === 'agregar'){
        st.opts.alElegir(structuredClone(ent.datos));
        document.getElementById('scrim-biblioteca').classList.remove('open');
      }else if(acc === 'rechazar'){
        if(!confirm(`¿Rechazar la propuesta "${ent.nombre}"? Se borra.`)) return;
        await fbDb.collection(coleccion).doc(ent.id).delete();
        st.propuestas = lista.filter(x => x !== ent);
        pintar();
      }else if(acc === 'borrar'){
        if(!confirm(`¿Borrar "${ent.nombre}" de la biblioteca oficial? No se puede deshacer.`)) return;
        await fbDb.collection(coleccion).doc(ent.id).delete();
        st.oficial = lista.filter(x => x !== ent);
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
        });
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
        <span class="hint"> …o elegí uno de la biblioteca:</span>`;
      q('bib-cero-btn').onclick = () => { q('scrim-biblioteca').classList.remove('open'); opts.alCrearDeCero(); };
    }else cero.style.display = 'none';
    q('scrim-biblioteca').classList.add('open');
    q('bib-lista').innerHTML = '<div class="hint">Cargando…</div>';
    try{
      await cargar(tipo, false);
      pintar();
    }catch(err){
      console.error('Biblioteca:', err);
      q('bib-lista').innerHTML = '<div class="hint">No se pudo cargar la biblioteca (¿publicaste las reglas nuevas de Firestore?).</div>';
    }
  }

  /**
   * Guarda algo en la biblioteca. opts: {tipo, datos, nombre, nivel?}.
   * El dueño guarda directo en la oficial; cualquier otro GM manda una
   * propuesta para que el dueño la revise.
   */
  function guardar(opts){
    if(!hayMesa()){ aviso('Entrá primero a una partida para usar la biblioteca.'); return; }
    asegurarVentana();
    const tipo = opts.tipo;
    const q = id => document.getElementById(id);
    const dueno = esDueno();
    q('bibg-aviso').textContent = dueno
      ? 'Se guarda directo en la biblioteca oficial.'
      : 'Se manda como propuesta: el dueño la revisa y, si la aprueba, pasa a la biblioteca oficial.';
    q('bibg-nombre').value = opts.nombre || '';
    q('bibg-etiquetas').value = '';
    q('bibg-desc').value = '';
    const sug = SUGERENCIAS[tipo] || [];
    q('bibg-sugeridas').innerHTML = sug.map(s => `<option value="${esc(s)}">`).join('');
    q('bibg-sug-txt').textContent = sug.length ? 'Ideas: ' + sug.join(', ') : '';
    q('scrim-biblioteca-guardar').classList.add('open');
    q('bibg-ok').onclick = async () => {
      const nombre = q('bibg-nombre').value.trim().slice(0, 60);
      if(!nombre){ aviso('Ponele un nombre.'); return; }
      const json = JSON.stringify(opts.datos);
      if(json.length > 200000){ aviso('Es demasiado grande para la biblioteca.'); return; }
      const coleccion = (dueno ? 'biblioteca_' : 'propuestas_') + tipo;
      q('bibg-ok').disabled = true;
      try{
        await fbDb.collection(coleccion).add({
          nombre, etiquetas: limpiarEtiquetas(q('bibg-etiquetas').value),
          descripcion: q('bibg-desc').value.trim().slice(0, 300),
          nivel: Math.max(0, Math.round(Number(opts.nivel) || 0)),
          json, autorUid: fbUsuario.uid, autorNombre: String((fbMiembro && fbMiembro.nombre) || '').slice(0, 40),
          creado: firebase.firestore.FieldValue.serverTimestamp(),
        });
        if(estado[tipo]) estado[tipo].oficial = null;  // la próxima vez se vuelve a leer
        q('scrim-biblioteca-guardar').classList.remove('open');
        aviso(dueno ? `"${nombre}" guardado en la biblioteca` : `"${nombre}" mandado como propuesta`);
      }catch(err){
        console.error('Biblioteca:', err);
        aviso(err.code === 'permission-denied' ? 'La biblioteca no te dejó guardar (¿reglas de Firestore sin publicar?).' : 'No se pudo guardar (mirá la consola).');
      }finally{
        q('bibg-ok').disabled = false;
      }
    };
  }

  return {abrir, guardar, esDueno};
})();
