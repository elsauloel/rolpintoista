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

   Solicitar eliminar un ítem (2026-09-30, pedido del dueño): `solicitarBaja(item)` pide una justificación y sube una
   entrada más a `biblioteca_items` marcada `datos.baja = true`; una vez auditada por el dueño, `mezclar` saca ese ítem
   del catálogo (de fábrica o subido) sin borrar nada — revisar y aprobar/rechazar es el paso 6, datos/auditoria.html.
   ========================================================= */
// El nombre sin la marca ⚠️ que lleva un ítem de fábrica con una observación de la auditoría (docs/auditoria-catalogo-2026-09.md):
// las búsquedas por nombre (una copia en una mochila o en un creep contra el catálogo) la ignoran.
function sinAviso(s){ return String(s ?? '').replace(/^⚠️\s*/, ''); }

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
     lista tenga aparte (ítems propios de una ficha, creados a mano en una tienda) queda como está.
     Solicitudes de eliminar (`e.datos.baja`, ver solicitarBaja): no son ítems — no entran a `nuevos`. Una vez auditadas
     (aprobadas por el dueño) sacan del catálogo al ítem que señalan (de fábrica o subido), sin borrar nada: alcanza con
     descartar la solicitud desde datos/auditoria.html para que el ítem vuelva. */
  /* `archivo: true` (dueño, 2026-10-06: «dejar publicado solo lo que estuvimos reworkeando»): el ítem de fábrica queda en comun/catalogo.js como
     referencia (el editor lo muestra), pero no se publica: mezclar lo saca, y con él la tienda, el catálogo de la ficha y el de GM Tools. Una
     corrección subida desde el juego lo vuelve a publicar. */
  const publicado = i => !!i && !i.archivo;
  function mezclar(lista, subidas, base){
    const activas = (subidas || []).filter(e => e && e.datos && !e.datos.baja);
    const eliminados = new Set((subidas || []).filter(e => e && e.datos && e.datos.baja && e.auditado).map(e => e.datos.itemId));
    const nuevos = new Map(activas.map(e => { const it = itemDeEntrada(e); return [it.id, it]; }));
    const fabrica = new Map((base || (typeof CATALOGO_BASE !== 'undefined' ? CATALOGO_BASE : [])).map(i => [i.id, i]));
    const out = (lista || [])
      .map(i => nuevos.has(i.id) ? clon(nuevos.get(i.id)) : (i._bib && fabrica.has(i.id) ? clon(fabrica.get(i.id)) : i))
      .filter(i => !i._bib || nuevos.has(i.id))
      .filter(i => !eliminados.has(i.id))
      .filter(i => !i.archivo || nuevos.has(i.id));   // archivo (2026-10-06): lo de la versión anterior no se publica (queda en el catálogo como referencia)
    nuevos.forEach((it, id) => { if(!out.some(x => x.id === id) && !eliminados.has(id)) out.push(clon(it)); });
    return out;
  }

  /* Pide eliminar un ítem del catálogo (pedido del dueño, 2026-09-30): cualquiera lo puede pedir, con una justificación
     escrita obligatoria. Va a la misma biblioteca de ítems (biblioteca_items), como una entrada más marcada
     `datos.baja = true` — no hace falta ninguna regla de Firestore nueva. Si lo pide el dueño entra ya auditado (se
     elimina al instante, mismo criterio que subir/corregir); si lo pide cualquier otro queda 🔶 sin auditar hasta que el
     dueño la revise en datos/auditoria.html (✅ Auditado = confirma la baja; 🗑 Descartar = la rechaza, el ítem vuelve). */
  async function solicitarBaja(item){
    const avisar = m => (typeof toast === 'function' ? toast(m) : alert(m));
    if(typeof fbDb === 'undefined' || typeof fbUsuario === 'undefined' || !fbUsuario){ avisar('Entrá primero a una partida para usar la biblioteca.'); return false; }
    if(!item || !item.id || !item.nombre) return false;
    const duenoEmail = typeof BIBLIOTECA_DUENO_EMAIL !== 'undefined' ? BIBLIOTECA_DUENO_EMAIL : 'el dueño del proyecto';
    if(!(await Confirmar.preguntar(`¿Solicitar eliminar "${item.nombre}" del catálogo? No se borra al instante: lo tiene que aprobar ${duenoEmail}.`, {titulo: 'Solicitar eliminar', si: 'Solicitar', peligro: true}))) return false;
    const motivo = (prompt('¿Por qué debería eliminarse? (obligatorio)') || '').trim();
    if(!motivo){ avisar('Hace falta escribir el motivo.'); return false; }
    const dueno = typeof BIBLIOTECA_DUENO_EMAIL !== 'undefined' && fbUsuario.email === BIBLIOTECA_DUENO_EMAIL && fbUsuario.emailVerified;
    const quien = String((typeof fbMiembro !== 'undefined' && fbMiembro && fbMiembro.nombre) || fbUsuario.displayName || '').slice(0, 40);
    try{
      await fbDb.collection('biblioteca_items').add({
        nombre: `🗑 Eliminar: ${item.nombre}`.slice(0, 60), etiquetas: ['baja'], descripcion: motivo.slice(0, 300), nivel: 0,
        json: JSON.stringify({baja: true, itemId: item.id, itemNombre: item.nombre, motivo: motivo.slice(0, 500)}),
        autorUid: fbUsuario.uid, autorNombre: quien, version: 1,
        creado: firebase.firestore.FieldValue.serverTimestamp(), auditado: dueno,
      });
    }catch(err){
      console.error('ItemsSubidos.solicitarBaja:', err);
      avisar('No se pudo pedir la baja (¿reglas de Firestore sin publicar?).');
      return false;
    }
    avisar(dueno ? `"${item.nombre}" se sacó del catálogo.` : `Pedido enviado: alguien tiene que aprobar que se elimine "${item.nombre}".`);
    return true;
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
    const c = porId || cat.find(c => sinAviso(c.nombre) === sinAviso(item.nombre));
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

  return {publicado, itemDeEntrada, mezclar, cargar, basadoEn, etiqueta, solicitarBaja};
})();
