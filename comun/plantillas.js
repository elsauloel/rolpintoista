/* =========================================================
   PLANTILLAS DE ELEMENTOS (compartido: biblioteca, auditoría de skills, ficha, gm-tools, mapa)
   Qué datos viajan cuando se sube un elemento a la biblioteca (o se guarda en un archivo de fábrica): todo lo que
   define QUÉ ES y QUÉ HACE, nada de lo que es del momento o de quien lo tiene (vida actual, cooldown corriendo, grupo,
   ids internos). Ver docs/plan-subida-unificada.md, sección "Plantillas" (2026-09-29, pasos 0e y 1).

   `Plantillas.limpiar(tipo, datos)` devuelve una copia limpia (no toca el original). `Biblioteca.guardar` la aplica
   sola antes de subir. Tipos: skills (habilidad de jugador), habs_creep, creeps, pasivas, trampas, estados, items.
   Un tipo sin plantilla viaja tal cual.

   Dos estilos, a propósito:
   - "lista de lo que viaja" (skills, pasivas, trampas, estados): la forma ya está cerrada y revisada.
   - "lista de lo que NO viaja" (habs_creep, creeps, items): la forma todavía tiene campos viejos o poco usados que
     no conviene perder por no haberlos listado; se sacan solo los que se sabe que son del momento.
   ========================================================= */
const Plantillas = (() => {
  const esVacio = v => v === null || v === undefined || v === false || v === '' || v === 0
    || (Array.isArray(v) && !v.length) || (typeof v === 'object' && v && !Array.isArray(v) && !Object.keys(v).length);
  const clon = v => (typeof structuredClone === 'function' ? structuredClone(v) : JSON.parse(JSON.stringify(v)));

  /* ---- Habilidad de jugador (clase / pool custom) ----
     En este orden. Lo vacío se omite (salvo id/nombre/detalle/nitrosCosto: nitrosCosto ausente vale lo de siempre al
     cargarla en la ficha, no 0); los efecto* solo si hay efectoNombre; `automatizada` solo cuando es false. */
  const HAB = ['id', 'nombre', 'detalle', 'automatizada', 'modo', 'etiquetas', 'costo', 'nitrosCosto', 'hpCosto', 'turnoAjenoSp',
    'tiradaStat', 'tiradaBono', 'tiradaExtra', 'curaHp',
    'efectoNombre', 'efectoTurnos', 'efectoHpTurno', 'efectoEscudo', 'efectoStacks', 'efectoPermanente', 'efectoMods', 'efectoDetalle',
    'zonaMapa', 'zonaRadio', 'portalMapa', 'trampaColocar', 'duelo',
    // Solo en lo subido a la biblioteca (el archivo de fábrica no los lleva): para quién es (P122: 'jugador' paga con
    // SP, 'creep' con cooldown) y en qué lista de "+ Habilidad" aparece (id de clase o '_custom').
    'para', 'clase'];
  const HAB_SIEMPRE = new Set(['id', 'nombre', 'detalle', 'nitrosCosto']);
  function habilidad(h){
    const out = {}, conEfecto = !!String(h.efectoNombre || '').trim();
    HAB.forEach(k => {
      if(!(k in h)) return;
      const v = h[k];
      if(HAB_SIEMPRE.has(k)){ out[k] = clon(v); return; }
      if(k === 'automatizada'){ if(v === false) out[k] = false; return; }
      if(k.startsWith('efecto')){ if(conEfecto && v !== '' && v !== null && v !== undefined && !(Array.isArray(v) && !v.length)) out[k] = clon(v); return; }
      if(!esVacio(v)) out[k] = clon(v);
    });
    return out;
  }

  /* ---- Habilidad de creep ---- sin id; cdActual queda "de arranque" (0, o el cooldown entero si es lenta). */
  function habCreep(h){
    const out = clon(h);
    delete out.id;
    out.cdActual = out.cdArranca ? Math.max(0, Number(out.cd) || 0) : 0;
    return out;
  }

  /* ---- Creep ---- sin imagen, con la vida llena, sin estados pasajeros ni lo de la mesa de quien lo sube. */
  function creep(c){
    const out = clon(c);
    ['id', 'imagen', '_borrador', '_creando', 'grupo', 'mapa', 'recompensado'].forEach(k => delete out[k]);
    if(out.hpMax !== undefined) out.hp = out.hpMax;
    out.nitros = null;
    out.ataquesTurno = 0;
    out.estados = (out.estados || []).filter(es => es && es.permanente);
    out.habilidades = (out.habilidades || []).map(h => { const x = habCreep(h); delete x.bibOrigen; delete x.bibIgnorada; return x; });
    return out;
  }

  /* ---- Pasiva ---- */
  function pasiva(p){
    const out = {nombre: String(p.nombre || ''), detalle: String(p.detalle || ''), jobCosto: Math.max(1, Number(p.jobCosto) || 1),
      mods: (p.mods || []).filter(m => m && m.stat).map(m => ({stat: m.stat, val: Number(m.val) || 0}))};
    if(Number(p.regenHp)) out.regenHp = Number(p.regenHp);
    if(Array.isArray(p.etiquetas) && p.etiquetas.length) out.etiquetas = [...p.etiquetas];
    return out;
  }

  /* ---- Trampa: UNA sola forma para el mapa y para las habilidades (P123, 2026-09-29) ----
     Es la forma de las trampas del mapa ("Trampas guardadas", catálogo): nombre, detalle, amiga (el efecto alcanza a los
     aliados del área), ignoraDef, dano, estado (nombre) + estadoTurnos (+ estadoMods si es un estado propio con bonos),
     tipo ('flor' | 'linea' | 'libre') + tamano (flor: su RADIO, 0 = una casilla, 1 = flor de 7, 2 = flor de 19 — como en el
     mapa y en las trampas consumibles; línea: su largo), color, alfa, teleport,
     la zona que deja al dispararse (dejaZona, zonaTurnos, zonaEnMantenimiento, zonaCadaPaso, zonaResistStat,
     zonaResistValor), turnos (cuánto dura la trampa puesta; 0 = sin límite) y `cant` (cuántas deja una habilidad cada vez
     que se ejecuta). Una habilidad guarda esto mismo en `trampaColocar`, así una trampa del catálogo sirve para las dos cosas.
     `trampaDesde(t)` traduce cualquier trampa, también las viejas de las habilidades ({radio, cant, estado: {nombre,
     turnos}}), a esta forma. */
  const TRAMPA = ['nombre', 'detalle', 'amiga', 'tipo', 'tamano', 'color', 'alfa', 'dano', 'ignoraDef', 'estado', 'estadoTurnos', 'estadoMods', 'estadoStacks', 'teleport',
    'dejaZona', 'zonaTurnos', 'zonaEnMantenimiento', 'zonaCadaPaso', 'zonaResistStat', 'zonaResistValor', 'turnos', 'cant',
    'detectar', 'detectarStat',   // dificultad para detectarla (P145): un número (mapa) o de qué stat de quien la coloca sale (habilidad)
    'estadoHp', 'salvacion', 'efectoManual',   // un estado propio con daño por turno; la tirada para evitarla ({stat, etq, dif, que}); lo que queda a mano
    'muro',   // trampa de muro (2026-10-03): {largo: 3 | 5, turnos} — al dispararse se levanta una pared delante de quien la pisó
    'soltar',   // cómo se suelta quien quedó agarrado (2026-10-03, Atrapar): {stat, etq, dif, no2} — va con el estado que deja
    'efecto'];   // superficie de efecto (2026-10-03): {area: 'pisador' | 'trampa' | 'flor', radio} — si no dice, la deduce el mapa
  function trampaDesde(t){
    if(!t || typeof t !== 'object') return null;
    const n = v => Number(v) || 0;
    const out = clon(t);
    delete out.forma; delete out.radio; delete out.largo;
    out.tipo = ['flor', 'linea', 'libre'].includes(t.tipo) ? t.tipo : (t.forma === 'linea' ? 'linea' : 'flor');
    out.tamano = t.tamano !== undefined ? Math.max(0, Math.min(30, Math.round(n(t.tamano))))
      : out.tipo === 'linea' ? Math.max(1, Math.round(n(t.largo)) || 3) : Math.max(0, Math.round(n(t.radio)));
    if(out.tipo === 'linea') out.tamano = Math.max(1, out.tamano);
    if(t.estado && typeof t.estado === 'object'){
      out.estado = String(t.estado.nombre || '');
      if(t.estadoTurnos === undefined) out.estadoTurnos = n(t.estado.turnos);
      if(Array.isArray(t.estado.mods) && t.estado.mods.length) out.estadoMods = clon(t.estado.mods);
    }else out.estado = String(t.estado || '');
    out.estadoTurnos = Math.max(0, Math.round(n(out.estadoTurnos)));
    out.cant = Math.max(1, Math.min(6, Math.round(n(t.cant)) || 1));
    return out;
  }
  // Radio de la flor para colocarla (0 = una sola casilla): es el mismo `tamano`.
  const radioDeTrampa = t => Math.max(0, Math.round(Number(t && t.tamano) || 0));
  function trampa(t){
    const x = trampaDesde(t) || {};
    const out = {};
    TRAMPA.forEach(k => { if(k in x && x[k] !== undefined) out[k] = clon(x[k]); });
    return out;
  }

  /* ---- Estado alterado propio ("Mis presets") ---- en la forma de comun/estados-presets.js (hpTurno/stacksTurno). */
  const MARCAS_ESTADO = ['esCC', 'esVeneno', 'esSangrado', 'mitadPdgEva', 'lisiado', 'paralisis', 'esEscarcha', 'inmovilizado',
    'rengo', 'cansado', 'exhausto', 'hypeado', 'sentado', 'invulnerable', 'inmunidadCC', 'sangrePura', 'coagulacionExtrema',
    'afortunado', 'blindado', 'espinas', 'armaduraRota', 'excedenteVida'];
  function estado(e){
    const out = {nombre: String(e.nombre || 'Estado'), polaridad: e.polaridad || 'otro', detalle: String(e.detalle || '')};
    const n = v => Number(v) || 0;
    if(e.permanente) out.permanente = true;
    out.turnos = n(e.turnos);
    if(n(e.stacks) > 1) out.stacks = n(e.stacks);
    const hp = e.hpTurno !== undefined ? e.hpTurno : e.hpturno;
    const st = e.stacksTurno !== undefined ? e.stacksTurno : e.stacksturno;
    if(n(hp)) out.hpTurno = n(hp);
    if(n(st)) out.stacksTurno = n(st);
    if(Array.isArray(e.mods) && e.mods.length) out.mods = e.mods.filter(m => m && m.stat).map(m => ({stat: m.stat, val: n(m.val)}));
    if(n(e.escudoMagico)) out.escudoMagico = n(e.escudoMagico);
    if(e.forzarNitros !== undefined && e.forzarNitros !== '' && e.forzarNitros !== null) out.forzarNitros = n(e.forzarNitros);
    MARCAS_ESTADO.forEach(k => { if(e[k]) out[k] = true; });
    return out;
  }

  /* ---- Ítem ---- la forma del catálogo, sin imagen ni lo de quien lo lleva. */
  function item(it){
    const out = clon(it);
    // `dur` y `armRota` son el desgaste de ESA copia (la de la mochila de alguien), no del diseño: no viajan.
    // `durPorPeso` sí (la durabilidad es una variable de diseño del ítem).
    ['id', 'imagen', 'equipado', 'cargaActual', '_bib', 'dur', 'armRota'].forEach(k => delete out[k]);
    return out;
  }

  const POR_TIPO = {skills: habilidad, habs_creep: habCreep, creeps: creep, pasivas: pasiva, trampas: trampa, estados: estado, items: item};
  function limpiar(tipo, datos){
    if(!datos || typeof datos !== 'object') return datos;
    // habs_creep viaja envuelta: {habilidad: {...}} (así lo guarda gm-tools desde siempre).
    if(tipo === 'habs_creep' && datos.habilidad) return {...clon(datos), habilidad: sinOrigen(habCreep(datos.habilidad))};
    // Habilidad de creep dentro del tipo único de habilidades (P122): se limpia como de creep (cooldown, estado sobre el
    // objetivo…), no con la lista de la de jugador.
    if(tipo === 'skills' && datos.para === 'creep') return sinOrigen({...habCreep(datos), para: 'creep'});
    const f = POR_TIPO[tipo];
    return sinOrigen(f ? f(datos) : clon(datos));
  }
  // `bibOrigen` = {tipo, id, version}: la marca que lleva una copia bajada de la biblioteca, para avisar "hay una
  // versión nueva". Es de la copia, no del elemento: no se sube.
  function sinOrigen(o){ if(o && typeof o === 'object'){ delete o.bibOrigen; delete o.bibIgnorada; } return o; }

  return {limpiar, habilidad, habCreep, creep, pasiva, trampa, trampaDesde, radioDeTrampa, estado, item, HAB};
})();
