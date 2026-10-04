/* =========================================================
   FICHA-GUARDADO — la forma de un personaje y cómo se guarda y se lee de Firebase, fuera de la ficha
   (paso 5, nivel B, área 4 de docs/plan-paso5.md, 2026-10-01)
   Lo que antes vivía adentro de ficha-personaje (js/01, js/06 y js/12) y no es pantalla:
   - El MODELO: el personaje en blanco (`DEFAULT`) y las migraciones que ponen al día una ficha vieja (Iteración 2
     Bonos → SP y Acciones → No2, Inteligencia → Especial, la escala de Tipos +2).
   - `normalizar(datos)`: una ficha que llega (de la mesa o de un archivo) mezclada con el personaje en blanco — lo que
     hacía `aplicarFicha` antes de dibujar.
   - Las PARTES de Firebase: en qué documento va cada cosa (`campanas/<id>/fichas/<id>/partes/<parte>`), cómo se
     arman para guardar (`partes`), cómo se leen (`leerParte`, `armarDatos`) y cómo se aplica una que cambió
     (`aplicarParte`).
   - `leer(db, ruta)` / `cargar(db, ruta)`: traer un personaje de Firebase UNA vez, sin la ficha abierta — lo que va a
     necesitar el mapa para dibujar la Botonera él mismo (paso 4, etapa 3).
   Reciben la ficha (`S`) en vez de leerla de una variable global. La ficha conserva sus nombres de siempre como alias
   y sigue haciendo lo que se ve (dibujar, avisos, el guardado en vivo con su temporizador y la escucha de cambios).
   Necesita comun/catalogo.js (CATALOGO_BASE); `completar` y `cargar` usan además comun/ficha-calculo.js.
   gm-tools tiene su propia copia de las migraciones de Tipos y de Especial para los creeps (con 'armaDetalle' de más):
   no se tocó.
   ========================================================= */
const FichaGuardado = (() => {
  const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };

  /* ---------- Iteración 2: Bonos → SP, Acciones y Movimiento → No2 ---------- */
  const STATS_VIEJOS_IT2 = {bonos: 'sp', mov: 'nitros', accionesmax: 'nitros'};
  // spPorBono: cuánto SP vale un "+1 Bono" viejo (IT2.spPorBono de la ficha; hoy 1).
  function migrarModsIt2(mods, spPorBono){
    (Array.isArray(mods) ? mods : []).forEach(m => {
      if(!m || !STATS_VIEJOS_IT2[m.stat]) return;
      if(m.stat === 'bonos') m.val = num(m.val) * (spPorBono ?? 1);
      m.stat = STATS_VIEJOS_IT2[m.stat];
    });
  }
  // Ítems, habilidades y estados guardados con los campos viejos. Se puede correr varias veces sobre lo mismo sin
  // cambiar nada.
  function migrarObjIt2(o, spPorBono){
    if(!o || typeof o !== 'object') return;
    migrarModsIt2(o.mods, spPorBono);
    migrarModsIt2(o.efectoMods, spPorBono);
    [['curabonosPct', 'curaspPct'], ['accionesCosto', 'nitrosCosto'], ['forzarAccionesMax', 'forzarNitros']].forEach(([viejo, nuevo]) => {
      if(o[viejo] === undefined) return;
      if(o[nuevo] === undefined) o[nuevo] = o[viejo];
      delete o[viejo];
    });
  }
  function migrarEstadoIt2(st, spPorBono){
    const f = st.formulas || (st.formulas = {});
    ['bonos', 'mov', 'accionesmax'].forEach(k => delete f[k]);
    // Armadura rota ahora resta 1 de Defensa por cada acumulación (antes: la mitad).
    (st.efectos || []).forEach(e => {
      if(e.armaduraRota && !(e.mods || []).some(m => m.stat === 'def')){
        e.mods = [...(e.mods || []), {stat: 'def', val: -1}];
        e.stacks = Math.max(1, num(e.stacks) || 1);
      }
    });
    ['sp', 'nitros'].forEach(k => { if(f[k] === undefined) f[k] = k === 'sp' ? 'esp*3' : 'agl'; });
    // SP Regen (2026-09-24, regla por defecto del dueño): TODOS los personajes regeneran, en el Mantenimiento, la mitad de
    // su Especial redondeada hacia abajo (base floor(esp/2)) + lo que sumen habilidades, equipo o estados. Las fichas que
    // tenían la base vieja (0, o floor(int/2)) pasan a la nueva UNA sola vez (marca spRegenAuto); si después alguien la
    // deja a mano en 0, se respeta.
    if(f.spregen === undefined || f.spregen === 'floor(int/2)') f.spregen = 'floor(esp/2)';
    if(!st.spRegenAuto){
      if(f.spregen === '0') f.spregen = 'floor(esp/2)';
      st.spRegenAuto = true;
    }
    // Crítico frecuente (2026-09-25): el stat Crit dejó de salir de la Destreza (regla nueva del crítico, P113/P115).
    // Las fichas viejas pasan a base 0 UNA sola vez.
    if(!st.critFrecuenteAuto){
      if(f.crit === 'des') f.crit = '0';
      st.critFrecuenteAuto = true;
    }
    if(f.critpot === undefined) f.critpot = '0';   // Crítico potente (2026-09-25)
    if(f.vision === undefined) f.vision = '6';
    Object.keys(f).forEach(k => {
      if(typeof f[k] === 'string') f[k] = f[k].replace(/\b(bonos|bon)\b/g, 'sp').replace(/\b(mov|accionesmax)\b/g, 'nitros');
    });
    // bonosGastados solo existe en fichas viejas, así que manda aunque el merge con DEFAULT ya haya puesto spGastado en 0.
    if(st.bonosGastados !== undefined){
      st.spGastado = num(st.bonosGastados);
      delete st.bonosGastados;
    }
    if(st.spGastado === undefined) st.spGastado = 0;
    delete st.acciones;  // los Nitros arrancan llenos (ver completar)
    if(st.ataquesTurno === undefined) st.ataquesTurno = 0;
    if(!st.ataquesArma || typeof st.ataquesArma !== 'object') st.ataquesArma = {};
    // La habilidad base "Movimiento" se quitó: moverse se cobra desde el mapa.
    if(Array.isArray(st.habilidades)) st.habilidades = st.habilidades.filter(h => !h || h.id !== 'movimiento');
    ['inventario', 'cinturon', 'habilidades', 'pasivas', 'sociales', 'efectos', 'efectosPersonalizados', 'catalogo']
      .forEach(k => (Array.isArray(st[k]) ? st[k] : []).forEach(o => migrarObjIt2(o, spPorBono)));
  }

  /* ---------- Inteligencia → Especial (id 'int' → 'esp', 2026-09-18) ----------
     Para poder reusar el nombre "Inteligencia" con otro significado. Se puede correr varias veces sin cambiar nada. */
  function migrarObjEspecial(o){
    if(!o || typeof o !== 'object') return;
    (Array.isArray(o.mods) ? o.mods : []).forEach(m => { if(m && m.stat === 'int') m.stat = 'esp'; });
    (Array.isArray(o.efectoMods) ? o.efectoMods : []).forEach(m => { if(m && m.stat === 'int') m.stat = 'esp'; });
    if(o.tiradaStat === 'int') o.tiradaStat = 'esp';
    ['detalle', 'descripcionNarrativa', 'efectoDetalle', 'equipoEstadoDetalle', 'notas'].forEach(k => {
      if(typeof o[k] === 'string') o[k] = o[k].replace(/Inteligencia/g, 'Especial').replace(/inteligencia/g, 'especial');
    });
  }
  function migrarEstadoEspecial(st){
    if(!st || typeof st !== 'object') return;
    if(st.attrs && typeof st.attrs === 'object' && st.attrs.int !== undefined){
      if(st.attrs.esp === undefined) st.attrs.esp = st.attrs.int;
      delete st.attrs.int;
    }
    // WildCards se sacó: ese lugar en la ficha ahora lo ocupa la Inteligencia nueva (se calcula sola).
    if(st.meta && typeof st.meta === 'object') delete st.meta.wld;
    if(st.formulas && typeof st.formulas === 'object'){
      Object.keys(st.formulas).forEach(k => {
        if(typeof st.formulas[k] === 'string') st.formulas[k] = st.formulas[k].replace(/\bint\b/g, 'esp');
      });
    }
    ['inventario', 'cinturon', 'habilidades', 'pasivas', 'sociales', 'efectos', 'efectosPersonalizados', 'catalogo']
      .forEach(k => (Array.isArray(st[k]) ? st[k] : []).forEach(migrarObjEspecial));
    (Array.isArray(st.invocaciones) ? st.invocaciones : []).forEach(inv => {
      if(!inv || typeof inv !== 'object') return;
      if(inv.int !== undefined){
        if(inv.esp === undefined) inv.esp = inv.int;
        delete inv.int;
      }
      (Array.isArray(inv.armaMods) ? inv.armaMods : []).forEach(m => { if(m && m.stat === 'int') m.stat = 'esp'; });
      (Array.isArray(inv.equipo) ? inv.equipo : []).forEach(migrarObjEspecial);
      (Array.isArray(inv.habilidades) ? inv.habilidades : []).forEach(migrarObjEspecial);
    });
  }

  /* ---------- Escala de Tipos de arma +2 ----------
     Los Tipos pasaron de 2/4/6/8/10 a 4/6/8/10/12. Las fichas guardadas antes traen tipoDado/armaTipo y los textos
     ("Resistencia a críticos tipo 2", "T2 P1") con la escala vieja: se corren +2 una sola vez y la ficha queda marcada
     con escalaTipos. No se puede correr dos veces sobre lo mismo. */
  const ESCALA_TIPOS = 2;
  // Lista de tipos después de "tipo(s)" o "crítico(s)/crit" ("área tipo 3" no es de arma).
  const RE_TIPOS_LISTA = /(?<![Áá]rea )(\b(?:[Tt]ipos?|[Cc]r[ií]tic[oa]s?|[Cc]rit)\s+(?:de\s+)?)((?:10|[2468])\b(?:\s*(?:,|y)\s*(?:10|[2468])\b)*)(?!\s*%)/g;
  // Notación corta de arma: "T2 P1", "T6, P1", "3d T4".
  const RE_TIPOS_T = /\bT(10|[2468])(?=\s*,?\s*P\d)|(?<=\dd ?)T(10|[2468])\b/g;
  function correrTiposTexto(txt){
    if(typeof txt !== 'string' || !txt) return txt;
    return txt
      .replace(RE_TIPOS_LISTA, (m, pre, lista) => pre + lista.replace(/\d+/g, n => +n + 2))
      .replace(RE_TIPOS_T, (m, a, b) => 'T' + (+(a || b) + 2));
  }
  function migrarObjTipos(o){
    if(!o || typeof o !== 'object') return;
    if(num(o.tipoDado) > 0) o.tipoDado = num(o.tipoDado) + 2;
    if(num(o.armaTipo) > 0) o.armaTipo = num(o.armaTipo) + 2;
    ['detalle', 'descripcionNarrativa', 'efectoDetalle', 'equipoEstadoDetalle', 'notas']
      .forEach(k => { if(typeof o[k] === 'string') o[k] = correrTiposTexto(o[k]); });
    if(Array.isArray(o.habilidades)) o.habilidades.forEach(migrarObjTipos);  // de las invocaciones
  }
  // Sobre los datos crudos que llegan (antes del merge con DEFAULT, que ya trae la marca). Devuelve true si hubo que
  // correrlos (la ficha guarda entonces todas las partes en el mismo lote).
  function migrarEstadoTipos(st){
    if(!st || typeof st !== 'object' || num(st.escalaTipos) >= ESCALA_TIPOS) return false;
    ['inventario', 'cinturon', 'habilidades', 'pasivas', 'sociales', 'efectos', 'efectosPersonalizados', 'catalogo', 'invocaciones', 'equipo', 'mochila']
      .forEach(k => (Array.isArray(st[k]) ? st[k] : []).forEach(migrarObjTipos));
    st.escalaTipos = ESCALA_TIPOS;
    return true;
  }

  /* ---------- El personaje en blanco ---------- */
  const DEFAULT = {
    meta: {nombre: '', raza: '', clase: '', subclase: '',
      nivel: 1, exp: 0, dde: 0, wildcards: 0, wildcardsMax: 0, inteligenciaManual: null, spMaxExtra: 0, imagen: '', miniatura: ''},
    bitacora: [{id: 'j1', nombre: 'Página 1', texto: ''}],
    bitacoraActiva: 'j1',
    loot: {normal: 0, magico: 0, especial: []},
    attrs: {con: 1, fue: 1, agl: 1, des: 1, esp: 1},
    // spGastado: SP usado desde la última recarga. nitros: los que quedan en el turno (null = arrancan llenos).
    // ataquesTurno: para cobrar el primer ataque del turno a mitad de precio. ataquesArma: ataques de cada arma en el
    // turno ({idArma|'sin-arma': n}); el primero con cada arma cuesta la mitad.
    hp: 5, turno: 1, log: [], spGastado: 0, nitros: null, ataquesTurno: 0, ataquesArma: {},
    escalaTipos: ESCALA_TIPOS,  // ver migrarEstadoTipos
    muerto: {activo: false, turnos: 5, definitivo: false},
    caps: {mochila: 20, cinturon: 5},
    armadura: {nota: ''},
    spRegenAuto: false,   // ya se pasó la base de SP Regen a la regla por defecto (mitad del Especial); ver migrarEstadoIt2
    formulas: {
      resmg: 'con', rescc: 'con', hpmax: 'con*5',
      dmg: 'fue', bloqueo: 'fue', crgmax: 'fue',
      eva: 'agl', ini: 'agl', nitros: 'agl',
      rng: 'des', pdg: 'des', crit: '0', critpot: '0', pdgcontra: '0', pdgopor: '0', parry: 'des', percepcion: 'des',   // crit = Crítico frecuente (2026-09-25): ya no sale de la Destreza
      pdgmg: 'esp', dmgesp: 'esp', resm: 'esp', sp: 'esp*3', spregen: 'floor(esp/2)', rangocasteo: 'esp',
      def: '0', armadmg: '0', tipo1: '0', tipo2: '0', tipo3: '0', tipo4: '0', tipo5: '0', capcinturon: '0', capmochila: '0', luz: '0', veoculto: '0', vision: '6',
      sigilo: 'des', resfuego: '0', reshielo: '0', resrayo: '0', restoxico: '0', resacido: '0'   // 2026-10-04
    },
    inventario: [],
    cinturon: [],
    habilidades: [],
    pasivas: [],
    sociales: [],
    efectos: [],
    efectosPersonalizados: [],
    invocaciones: [],
    // El catálogo de fábrica vive en comun/catalogo.js; lo subido por el grupo se suma desde la biblioteca.
    catalogo: typeof CATALOGO_BASE !== 'undefined' ? structuredClone(CATALOGO_BASE) : []   // el mapa no carga el catálogo
  };
  // El catálogo embebido puede traer Bonos/Mov/Acciones: se pasa a SP/Nitros una vez.
  migrarEstadoIt2(DEFAULT);
  // Los ítems del catálogo de fábrica: los únicos que NO viajan en la parte "catalogo" de cada ficha.
  const CATALOGO_IDS = new Set(DEFAULT.catalogo.map(c => c.id));

  function mergeDeep(base, incoming){
    if(!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) return structuredClone(base);
    const out = structuredClone(base);
    Object.keys(incoming).forEach(k => {
      const bv = out[k], iv = incoming[k];
      if(iv && typeof iv === 'object' && !Array.isArray(iv) && bv && typeof bv === 'object' && !Array.isArray(bv)){
        out[k] = mergeDeep(bv, iv);
      } else if(iv !== undefined){
        out[k] = iv;
      }
    });
    return out;
  }

  // Lo de fábrica + lo subido por el grupo (comun/items-subidos.js), si quien llama no pasa otra cosa.
  const mezclarPorDefecto = lista => (typeof ItemsSubidos !== 'undefined' ? ItemsSubidos.mezclar(lista, [], DEFAULT.catalogo) : lista);

  /* ---------- Una ficha que llega, mezclada con el personaje en blanco ----------
     `data` son los datos crudos (de la mesa o de un archivo); se modifican (migración de Tipos, nombre viejo de una
     fórmula). o.mezclarCatalogo(lista): cómo sumar al catálogo lo subido por el grupo (la ficha pasa el suyo).
     Devuelve {S, tiposMigrados}. No dibuja nada: las migraciones de Iteración 2 / Especial y los No2 iniciales los
     completa `completar` (en la ficha, renderAll). */
  function normalizar(data, o){
    o = o || {};
    const tiposMigrados = migrarEstadoTipos(data);
    const fresh = structuredClone(DEFAULT);
    const next = {...fresh, ...data};
    // Potencia pasó a llamarse Bloqueo: las fichas guardadas antes traen la fórmula con el nombre viejo. Se renombra
    // para no perderla si estaba personalizada (si ya tiene Bloqueo, gana el nuevo).
    if(data.formulas && data.formulas.potencia !== undefined){
      if(data.formulas.bloqueo === undefined) data.formulas.bloqueo = data.formulas.potencia;
      delete data.formulas.potencia;
    }
    ['meta', 'loot', 'armadura', 'caps', 'formulas'].forEach(k => { next[k] = mergeDeep(fresh[k], data[k]); });
    ['inventario', 'cinturon', 'habilidades', 'pasivas', 'sociales', 'efectos', 'bitacora', 'invocaciones'].forEach(k => {
      next[k] = Array.isArray(data[k]) && data[k].length ? data[k] : fresh[k];
    });
    // El catálogo NO es un dato del personaje: es la referencia compartida del juego, así que siempre gana la versión
    // fresca. Lo único que se conserva de `data.catalogo` son los ids que esta versión ni conoce: ítems que en algún
    // momento se agregaron directo al catálogo de esa ficha y nunca se publicaron.
    {
      const propio = Array.isArray(data.catalogo) ? data.catalogo : [];
      const frescoIds = new Set(fresh.catalogo.map(i => i.id));
      const soloLocal = propio.filter(item => !frescoIds.has(item.id));
      next.catalogo = (o.mezclarCatalogo || mezclarPorDefecto)([...structuredClone(fresh.catalogo), ...soloLocal.filter(i => !i._bib)]);
    }
    // Migración: fichas viejas guardaban equipo y mochila como listas separadas.
    if(!(Array.isArray(data.inventario) && data.inventario.length) && (Array.isArray(data.equipo) || Array.isArray(data.mochila))){
      next.inventario = [
        ...(data.equipo || []).map(i => ({...i, equipado: true})),
        ...(data.mochila || []).map(i => ({...i, equipado: false, ranuras: i.ranuras ?? 1})),
      ];
    }
    if(!next.bitacora.some(p => p.id === next.bitacoraActiva)) next.bitacoraActiva = next.bitacora[0].id;
    return {S: next, tiposMigrados};
  }
  // Lo que la ficha completa cada vez que dibuja (renderAll): migraciones que se pueden correr de nuevo sin cambiar
  // nada, y los No2 llenos si todavía no se fijaron.
  function completar(S, o){
    o = o || {};
    migrarEstadoIt2(S, o.spPorBono);
    migrarEstadoEspecial(S);
    if(S.nitros === null || S.nitros === undefined){
      const n = FichaCalculo.calcular(S).final.nitros;
      S.nitros = Number.isNaN(n) ? 0 : n;
    }
    return S;
  }

  /* ---------- Las partes en Firebase ----------
     El personaje se guarda en campanas/<campaña>/fichas/<id>: el documento principal tiene dueño, nombre, un resumen
     público (HP, SP, estados) y una miniatura del retrato para el token del mapa; el contenido va repartido en
     fichas/<id>/partes/<parte> para escribir solo lo que cambió (por el tope diario de escrituras del plan gratis).
     Imágenes: solo viajan el retrato (parte "retrato") y las de las invocaciones (parte "imgInvocaciones"). La parte
     "control" no es un dato del personaje: es quién lo maneja (el GM con 🎮 Tomar el control). */
  const PARTES = {
    general: ['meta', 'attrs', 'hp', 'turno', 'spGastado', 'nitros', 'ataquesTurno', 'ataquesArma', 'muerto', 'caps', 'armadura', 'formulas', 'loot'],
    notas: ['bitacora', 'bitacoraActiva', 'log'],
    inventario: ['inventario'],
    cinturon: ['cinturon'],
    habilidades: ['habilidades', 'pasivas', 'sociales'],
    efectos: ['efectos', 'efectosPersonalizados'],
    invocaciones: ['invocaciones'],
  };
  const CLAVES_CON_PARTE = new Set([...Object.values(PARTES).flat(), 'catalogo']);
  // Las imágenes embebidas (data:...) no se guardan, salvo el retrato, que va en su propia parte.
  const serializar = valor => JSON.stringify(valor, (k, v) => (typeof v === 'string' && v.startsWith('data:')) ? '' : v);
  // {idInvocación: imagen} de las invocaciones que tienen imagen propia.
  function imagenesInvocaciones(S){
    const res = {};
    (S.invocaciones || []).forEach(inv => {
      if(inv && typeof inv.imagen === 'string' && inv.imagen.startsWith('data:')) res[inv.id] = inv.imagen;
    });
    return res;
  }
  function ponerImagenesInvocaciones(S, mapa){
    (S.invocaciones || []).forEach(inv => { if(inv) inv.imagen = (mapa && mapa[inv.id]) || ''; });
  }
  // {parte: json} de todo el personaje, listo para comparar con lo último guardado y escribir lo que cambió.
  function partes(S){
    const res = {};
    Object.entries(PARTES).forEach(([parte, claves]) => {
      const o = {};
      claves.forEach(k => { o[k] = k === 'meta' ? {...S.meta, imagen: '', miniatura: ''} : S[k]; });
      res[parte] = serializar(o);
    });
    const otros = {};
    Object.keys(S).forEach(k => { if(!CLAVES_CON_PARTE.has(k)) otros[k] = S[k]; });
    res.otros = serializar(otros);
    // Del catálogo solo viaja lo que no está en el de fábrica ni salió de la biblioteca (ítems agregados a mano).
    res.catalogo = serializar({catalogo: (S.catalogo || []).filter(i => !CATALOGO_IDS.has(i.id) && !i._bib)});
    res.retrato = JSON.stringify({imagen: S.meta.imagen || '', miniatura: S.meta.miniatura || ''});
    res.imgInvocaciones = JSON.stringify(imagenesInvocaciones(S));
    return res;
  }
  // Pasa una parte guardada a claves del personaje (sin tocarlo todavía).
  function leerParte(parte, json){
    let datos;
    try{ datos = JSON.parse(json); }catch(e){ return {}; }
    if(parte === 'retrato'){
      if(typeof datos === 'string') return {retrato: datos, retratoMiniatura: ''};
      return {retrato: (datos && datos.imagen) || '', retratoMiniatura: (datos && datos.miniatura) || ''};
    }
    if(parte === 'imgInvocaciones') return {imgInvocaciones: datos && typeof datos === 'object' ? datos : {}};
    return datos && typeof datos === 'object' ? datos : {};
  }
  // Todas las partes de un personaje ([{id, json}]) juntas: {datos (para normalizar), control, ultimo ({parte: json},
  // lo leído tal cual), imgInvocaciones}.
  function armarDatos(docs){
    const datos = {}, ultimo = {};
    let retrato = '', retratoMiniatura = '', imgInvocaciones = {}, control = null;
    (docs || []).forEach(({id, json}) => {
      json = String(json || '');
      if(id === 'control'){ let c = null; try{ c = JSON.parse(json); }catch(e){} control = c && c.uid ? c : null; return; }
      ultimo[id] = json;
      const leido = leerParte(id, json);
      if(id === 'retrato'){ retrato = leido.retrato; retratoMiniatura = leido.retratoMiniatura; }
      else if(id === 'imgInvocaciones') imgInvocaciones = leido.imgInvocaciones;
      else Object.assign(datos, leido);
    });
    if(!datos.meta) datos.meta = {};
    datos.meta.imagen = retrato;
    datos.meta.miniatura = retratoMiniatura;
    return {datos, control, ultimo, imgInvocaciones};
  }
  // Una parte que cambió desde otra ventana, sobre el personaje ya cargado. o.mezclarCatalogo: como en normalizar;
  // o.imgInvocaciones: el json de la parte imgInvocaciones ya guardada (las imágenes no viajan con las invocaciones).
  function aplicarParte(S, parte, datos, o){
    o = o || {};
    if(parte === 'retrato'){ S.meta.imagen = datos.retrato || ''; S.meta.miniatura = datos.retratoMiniatura || ''; return; }
    if(parte === 'imgInvocaciones'){ ponerImagenesInvocaciones(S, datos.imgInvocaciones); return; }
    if(parte === 'catalogo'){
      const propios = Array.isArray(datos.catalogo) ? datos.catalogo : [];
      S.catalogo = (o.mezclarCatalogo || mezclarPorDefecto)((S.catalogo || []).filter(i => CATALOGO_IDS.has(i.id)).concat(propios.filter(i => !i._bib)));
      return;
    }
    if(datos.meta){ datos.meta.imagen = S.meta.imagen; datos.meta.miniatura = S.meta.miniatura; }
    Object.keys(datos).forEach(k => { S[k] = datos[k]; });
    if(parte === 'invocaciones' && o.imgInvocaciones !== undefined && o.imgInvocaciones !== null){
      let mapa = {};
      try{ mapa = JSON.parse(o.imgInvocaciones || '{}'); }catch(e){}
      ponerImagenesInvocaciones(S, mapa);
    }
  }

  /* ---------- Traer un personaje de Firebase, una vez ----------
     `ruta` = fbRutaCampana(`fichas/${id}`). leer: el documento y sus partes como vienen ({id, duenoUid, nombre,
     resumen, miniatura, datos, control, ultimo, imgInvocaciones}, o null si no existe). cargar: además lo deja listo
     para usar ({..., S}), igual que la ficha al abrirlo — sin dibujar nada ni quedarse escuchando. */
  async function leer(db, ruta){
    const ref = db.doc(ruta);
    const [doc, snap] = await Promise.all([ref.get(), ref.collection('partes').get()]);
    if(!doc.exists) return null;
    const d = doc.data() || {};
    const armado = armarDatos(snap.docs.map(p => ({id: p.id, json: (p.data() || {}).json})));
    return {id: doc.id, duenoUid: d.duenoUid, nombre: d.nombre, resumen: d.resumen || null, miniatura: d.miniatura || '', ...armado};
  }
  async function cargar(db, ruta, o){
    const l = await leer(db, ruta);
    if(!l) return null;
    const {S} = normalizar(l.datos, o);
    ponerImagenesInvocaciones(S, l.imgInvocaciones);
    completar(S, o);
    return {...l, S};
  }

  return {ESCALA_TIPOS, DEFAULT, CATALOGO_IDS, PARTES, CLAVES_CON_PARTE,
    migrarModsIt2, migrarObjIt2, migrarEstadoIt2, migrarObjEspecial, migrarEstadoEspecial,
    correrTiposTexto, migrarObjTipos, migrarEstadoTipos, mergeDeep,
    normalizar, completar,
    serializar, imagenesInvocaciones, ponerImagenesInvocaciones, partes, leerParte, armarDatos, aplicarParte,
    leer, cargar};
})();
