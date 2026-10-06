/* =========================================================
   FICHA-HABILIDADES — ejecutar y cobrar una habilidad/ítem, fuera de la ficha (paso 5, nivel B, área 3 de
   docs/plan-paso5.md, 2026-10-01)
   Lo que antes vivía adentro de ficha-personaje (js/02 y js/11) y no toca pantalla ni Firebase: el costo en SP/No2 de
   una habilidad (fijo o "X", y cuándo cuenta como un ataque), y el "estado del sistema anterior" que una habilidad o
   un ítem aplica al ejecutarse/consumirse (antes de que existiera la Ejecución paso a paso, comun/combatiente.js).
   Reciben la ficha (`S`) y la lista de presets en vez de leerlos de variables globales, así los puede usar cualquier
   pantalla que tenga los datos de un personaje. Lo que sigue en la ficha: elegir arma, abrir el cuadro del costo
   variable, el cuadro de Ejecución (Duelo) y publicar en la Mesa — eso es pantalla, no esta pieza.
   Necesita comun/combatiente.js (Combatiente.inmunidad/agregarEstado) y comun/items-subidos.js (sinAviso).

   OJO — esto es el "sistema anterior" nada más: gm-tools (creeps) e invocaciones tienen su propia versión de "aplicar
   el efecto al consumir" con diferencias de verdad frente a la de acá (no solo de nombre de campo) — ver P137 en
   docs/preguntas-abiertas.md. No se tocaron esas dos: esta pieza es solo la que usaba ficha-personaje, movida tal
   cual, sin cambiar ninguna regla.
   ========================================================= */
const FichaHabilidades = (() => {
  const n = v => { const x = parseFloat(v); return Number.isFinite(x) ? x : 0; };

  /* ---------- Costo en SP/Nitros: fijo o "X" (se elige al ejecutar) ---------- */
  // Igual que la ficha de siempre: cualquier costo que tenga una "x" ("X", "X SP", "x") se elige al ejecutar.
  const esCostoVariable = v => /x/i.test(String(v || ''));
  // Número del costo en SP de una habilidad ("2 SP"; las viejas dicen "1 bono").
  function parseCostoSp(costo){
    if(!costo) return 0;
    const m = String(costo).match(/(\d+(\.\d+)?)/);
    return m ? n(m[1]) : 0;
  }
  const nitrosAtaque = h => String((h && h.nitrosCosto) ?? '').trim().toUpperCase() === 'ATAQUE';
  const spVariable = h => esCostoVariable(h && h.costo);
  const nitrosVariable = h => esCostoVariable(h && h.nitrosCosto) && !nitrosAtaque(h);
  const habCostoVariable = h => spVariable(h) || nitrosVariable(h);

  /* ---------- El "estado del sistema anterior" al ejecutar/consumir ----------
     Una habilidad o un ítem puede llevar efectoNombre/efectoTurnos/efectoHpTurno/efectoPermanente/efectoMods/
     efectoDetalle/efectoEscudo/efectoStacks: el estado que pone al ejecutarse/consumirse. `presets` es la lista de
     presets de la ficha (EFECTOS_PRESET); `src` es el ítem/habilidad (o, para un consumible, lo que diga el catálogo
     si lo completó después — ver `configEfectoDe`). Devuelve el estado armado (sin aplicarlo) o null si no hay nombre. */
  const presetPorNombre = (lista, nombre) => (lista || []).find(p => p.nombre === nombre || (p.alias || []).includes(nombre));
  // (afortunado, inmunidades, etc.) — un ítem puede pedir "activate igual que este preset" sin copiarle el nombre
  // (equipoEstadoPreset), para poder mostrar un nombre propio sin perder la mecánica real del preset.
  const FLAGS_ESPECIALES = ['esCC', 'esVeneno', 'esSangrado', 'esQuemadura', 'afortunado', 'invulnerable',
    'inmunidadCC', 'sangrePura', 'coagulacionExtrema', 'blindado', 'espinas', 'mitadPdgEva',
    'lisiado', 'paralisis', 'silencio', 'confusion', 'esEscarcha', 'inmovilizado', 'rengo', 'lento', 'cansado', 'exhausto', 'hypeado', 'sentado',
    'armaduraRota', 'escudoMagico', 'excedenteVida', 'forzarNitros'];
  function flagsDePreset(presets, nombrePreset){
    const p = presetPorNombre(presets, (nombrePreset || '').trim());
    if(!p) return {};
    const out = {polaridad: p.polaridad};
    FLAGS_ESPECIALES.forEach(f => { if(p[f] !== undefined) out[f] = p[f]; });
    return out;
  }
  // Lo que está en la mochila es una copia del ítem del catálogo hecha al comprarlo. Si el efecto se configuró
  // después en el catálogo, esa copia no lo tiene: el catálogo manda (y es la única referencia que sobrevive a la
  // copia, por nombre — ver el comentario largo original en ficha-personaje/js/02).
  function configEfectoDe(S, it){
    const base = (S.catalogo || []).find(c => sinAviso(c.nombre) === sinAviso(it.nombre));
    if(base && (base.efectoNombre || '').trim()) return base;
    return it;
  }
  const estaBloqueadoElDebuff = (S, objEfecto) => !!Combatiente.inmunidad(S.efectos, objEfecto);
  // uid: igual que el de la ficha (Math.random, base36) — no importa que no coincida letra por letra con otra
  // sesión, un id solo tiene que ser único en la lista de estados de ESTE personaje.
  const uid = () => Math.random().toString(36).slice(2, 9);
  function aplicarEfectoDeConsumo(S, it, presets){
    const src = configEfectoDe(S, it);
    const nombre = (src.efectoNombre || '').trim();
    if(!nombre) return null;
    // El ítem no sabe de categorías/inmunidades — se infiere buscando un preset con el mismo nombre (así "Veneno",
    // "Sangrado", etc. quedan bloqueados por sus inmunidades aunque lleguen desde un consumible), o el que declare
    // en efectoPreset — para poder mostrar un nombre propio sin perder la mecánica real del preset.
    const nombrePresetEfectivo = presetPorNombre(presets, nombre) ? nombre : (src.efectoPreset || '').trim();
    const preset = presetPorNombre(presets, nombrePresetEfectivo);
    if(estaBloqueadoElDebuff(S, preset)) return {ok: false, motivo: 'inmune', nombre};
    const turnos = n(src.efectoTurnos);
    const hpturno = n(src.efectoHpTurno);
    const permanente = Combatiente.efectoPermanente(src, preset);   // P137: la casilla de la habilidad/ítem, o lo del estado
    const mods = (src.efectoMods || []).filter(m => m && m.stat).map(m => ({stat: m.stat, val: n(m.val)}));
    // El estado se queda solo en la lista: sin una descripción propia hay que acordarse de qué ítem salió. Si el
    // ítem no trae un texto pensado para el estado, se usa el suyo, que es mejor que nada.
    const detalle = (src.efectoDetalle || '').trim() || (src.detalle || '').trim();
    const categorias = flagsDePreset(presets, nombrePresetEfectivo);
    // Cantidades propias de la habilidad/ítem (las que se eligieron en el asistente de estados): mandan sobre las del preset.
    const escudo = n(src.efectoEscudo), stacks = Math.max(1, n(src.efectoStacks) || 1);
    if(escudo > 0) categorias.escudoMagico = escudo;
    const nuevo = {id: uid(), nombre, imagen: '', turnos, stacks, hpturno, stacksturno: 0, permanente, activo: true,
      popup: false, detalle, mods, ...categorias};
    if(n(nuevo.escudoMagico) > 0) nuevo.escudoMagicoActual = n(nuevo.escudoMagico);
    const r = Combatiente.agregarEstado(S.efectos, nuevo);
    if(!r.ok) return {ok: false, motivo: r.motivo, nombre};
    // Lo que se dispara (regeneración, veneno…) pega apenas se lo pone (2026-10-06, P161).
    let c = null;
    try{ c = FichaCalculo.calcular(S); }catch(e){}   // (un personaje a medio armar)
    const dis = Combatiente.dispararAlAplicar(r, S.efectos, {hp: 'hpturno', resFuego: c ? n(c.final.resfuego) : 0});
    if(dis.hp){ const hm = c && !Number.isNaN(c.final.hpmax) ? n(c.final.hpmax) : 0; S.hp = Math.max(0, Math.min(hm > 0 ? hm : Infinity, n(S.hp) + dis.hp)); }
    return {ok: true, estado: r.estado, disparo: dis};
  }

  return {parseCostoSp, spVariable, nitrosVariable, nitrosAtaque, habCostoVariable,
    presetPorNombre, flagsDePreset, configEfectoDe, estaBloqueadoElDebuff, aplicarEfectoDeConsumo};
})();
