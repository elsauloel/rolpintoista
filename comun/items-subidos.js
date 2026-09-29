/* =========================================================
   ÍTEMS SUBIDOS POR EL GRUPO (compartido: ficha, gm-tools, generador de tiendas)
   Paso 5 de docs/plan-subida-unificada.md (2026-09-29, P124): los ítems que suben jugadores y GM viven en la biblioteca de
   Firebase (`biblioteca_items`, comun/biblioteca.js), disponibles al instante, y cada herramienta los suma al catálogo de
   fábrica (comun/catalogo.js, CATALOGO_BASE):
   - una CORRECCIÓN de un ítem de fábrica (entrada con `reemplaza: 'base-<id>'`) lo reemplaza conservando su id, así lo que
     ya está en mochilas y tiendas lo sigue reconociendo;
   - un ítem NUEVO entra con id `usr-<id de la entrada>`.
   Cada ítem sumado lleva `_bib = {id, version, auditado, autor}` (de dónde salió) para mostrar 🔶 sin auditar y para no
   guardarlo adentro de la ficha como si fuera propio.
   ========================================================= */
const ItemsSubidos = (() => {
  const clon = v => structuredClone(v);

  // Una entrada de la biblioteca como ítem de catálogo.
  function itemDeEntrada(e){
    const reemplaza = String(e.reemplaza || '');
    const id = reemplaza.startsWith('base-') ? reemplaza.slice(5) : 'usr-' + e.id;
    return {...clon(e.datos || {}), id, imagen: '',
      _bib: {id: e.id, version: e.version || 1, auditado: e.auditado !== false, autor: e.editorNombre || e.autorNombre || ''}};
  }

  /* La lista con lo subido sumado: corrige los de fábrica, saca lo que ya no está en la biblioteca (y si era una corrección,
     vuelve el de fábrica) y agrega lo nuevo al final. `base` = el catálogo de fábrica (por defecto CATALOGO_BASE); lo que la
     lista tenga aparte (ítems propios de una ficha, creados a mano en una tienda) queda como está. */
  function mezclar(lista, subidas, base){
    const nuevos = new Map((subidas || []).filter(e => e && e.datos).map(e => { const it = itemDeEntrada(e); return [it.id, it]; }));
    const fabrica = new Map((base || (typeof CATALOGO_BASE !== 'undefined' ? CATALOGO_BASE : [])).map(i => [i.id, i]));
    const out = (lista || [])
      .map(i => nuevos.has(i.id) ? clon(nuevos.get(i.id)) : (i._bib && fabrica.has(i.id) ? clon(fabrica.get(i.id)) : i))
      .filter(i => !i._bib || nuevos.has(i.id));
    nuevos.forEach((it, id) => { if(!out.some(x => x.id === id)) out.push(clon(it)); });
    return out;
  }

  // Lee lo subido (sin lo de fábrica). [] si no se puede (sin sesión, reglas viejas…).
  function cargar(){
    if(typeof Biblioteca === 'undefined' || !Biblioteca.lista) return Promise.resolve([]);
    return Biblioteca.lista('items').catch(() => []);
  }

  // De qué elemento de la biblioteca sale un ítem (para "¿corrección o algo nuevo?" al subirlo): el propio `_bib`, o el de
  // fábrica con ese id, o el del catálogo con ese nombre.
  function basadoEn(item, catalogo){
    if(!item) return null;
    if(item._bib && item._bib.id) return {id: item._bib.id, nombre: item.nombre};
    const cat = catalogo || [];
    const porId = item.id && cat.find(c => c.id === item.id);
    const c = porId || cat.find(c => c.nombre === item.nombre);
    if(!c) return null;
    if(c._bib && c._bib.id) return {id: c._bib.id, nombre: c.nombre};
    const esFabrica = typeof CATALOGO_BASE !== 'undefined' && CATALOGO_BASE.some(b => b.id === c.id);
    return esFabrica ? {id: 'base-' + c.id, nombre: c.nombre} : null;
  }

  // "🔶 sin auditar · v2 · subido por X" (texto corto para las filas del catálogo); '' si es de fábrica.
  function etiqueta(it){
    const b = it && it._bib;
    if(!b) return '';
    return [b.auditado ? '' : '🔶 sin auditar', b.version > 1 ? 'v' + b.version : '', b.autor ? 'subido por ' + b.autor : 'subido'].filter(Boolean).join(' · ');
  }

  return {itemDeEntrada, mezclar, cargar, basadoEn, etiqueta};
})();
