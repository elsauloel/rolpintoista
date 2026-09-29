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
  const HAB = ['id', 'nombre', 'detalle', 'automatizada', 'etiquetas', 'costo', 'nitrosCosto', 'hpCosto', 'turnoAjenoSp',
    'tiradaStat', 'tiradaBono', 'tiradaExtra', 'curaHp',
    'efectoNombre', 'efectoTurnos', 'efectoHpTurno', 'efectoEscudo', 'efectoStacks', 'efectoPermanente', 'efectoMods', 'efectoDetalle',
    'zonaMapa', 'zonaRadio', 'portalMapa', 'trampaColocar', 'duelo'];
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
    ['id', 'imagen', '_borrador', 'grupo', 'recompensado'].forEach(k => delete out[k]);
    if(out.hpMax !== undefined) out.hp = out.hpMax;
    out.nitros = null;
    out.ataquesTurno = 0;
    out.estados = (out.estados || []).filter(es => es && es.permanente);
    out.habilidades = (out.habilidades || []).map(habCreep);
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

  /* ---- Trampa del mapa ("Trampas guardadas") ---- con la zona que deja al dispararse, si la tiene. */
  const TRAMPA = ['nombre', 'detalle', 'amiga', 'tipo', 'tamano', 'color', 'alfa', 'dano', 'ignoraDef', 'estado', 'estadoTurnos',
    'dejaZona', 'zonaTurnos', 'zonaEnMantenimiento', 'zonaCadaPaso', 'zonaResistStat', 'zonaResistValor'];
  function trampa(t){
    const out = {};
    TRAMPA.forEach(k => { if(k in t && t[k] !== undefined) out[k] = clon(t[k]); });
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
    ['id', 'imagen', 'equipado', 'cargaActual'].forEach(k => delete out[k]);   // se revisa en el paso 5 (ítems)
    return out;
  }

  const POR_TIPO = {skills: habilidad, habs_creep: habCreep, creeps: creep, pasivas: pasiva, trampas: trampa, estados: estado, items: item};
  function limpiar(tipo, datos){
    if(!datos || typeof datos !== 'object') return datos;
    // habs_creep viaja envuelta: {habilidad: {...}} (así lo guarda gm-tools desde siempre).
    if(tipo === 'habs_creep' && datos.habilidad) return {...clon(datos), habilidad: sinOrigen(habCreep(datos.habilidad))};
    const f = POR_TIPO[tipo];
    return sinOrigen(f ? f(datos) : clon(datos));
  }
  // `bibOrigen` = {tipo, id, version}: la marca que lleva una copia bajada de la biblioteca, para avisar "hay una
  // versión nueva". Es de la copia, no del elemento: no se sube.
  function sinOrigen(o){ if(o && typeof o === 'object') delete o.bibOrigen; return o; }

  return {limpiar, habilidad, habCreep, creep, pasiva, trampa, estado, item, HAB};
})();
