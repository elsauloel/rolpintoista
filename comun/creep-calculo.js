/* =========================================================
   CREEP-CALCULO — las reglas de un creep, fuera de GM Tools (paso 4, etapa 4a de docs/plan-paso4-etapa4.md, 2026-10-01)
   Lo que antes vivía en gm-toolset/js/01 y js/02 (creepStatValor, creepModTotal, Defensa, Armadura mágica, críticos, No2
   máximo, costos de atacar / Parry / habilidades, Bloqueo, Fuerza del golpe, daño del arma, normalizarCreep y sus
   migraciones, los textos de "de dónde sale"), copiado tal cual: todo recibe el creep (`sc`). Así calculan igual GM Tools y
   el mapa (que tenía copias parciales: creepModTotalMapa, creepDefensaMapa, zonaStatCreep…). No toca pantalla ni Firebase.
   Necesita comun/combatiente.js.
   ========================================================= */
const CreepCalculo = (() => {
  const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
  const fmt = n => Number.isInteger(n) ? n : Math.round(n*100)/100;

  const IT2_CREEP = {
    nitrosHabilidad: 1,            // costo por defecto de una habilidad (el de atacar es Combatiente.costoAtaque)
  };
  const DADOS_ARMA = [4, 6, 8, 10, 12];

  /* ---------- Escala de Tipos de arma +2 ----------
     Los Tipos pasaron de 2/4/6/8/10 a 4/6/8/10/12 (igual que en ficha.html).
     Los creeps guardados antes traen armaTipo, el equipo y los textos con la
     escala vieja: normalizarCreep los corre +2 una sola vez y los marca con
     escalaTipos. Los creeps nuevos ya nacen marcados. */
  const ESCALA_TIPOS = 2;
  const RE_TIPOS_LISTA = /(?<![Áá]rea )(\b(?:[Tt]ipos?|[Cc]r[ií]tic[oa]s?|[Cc]rit)\s+(?:de\s+)?)((?:10|[2468])\b(?:\s*(?:,|y)\s*(?:10|[2468])\b)*)(?!\s*%)/g;
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
    ['detalle', 'descripcionNarrativa', 'efectoDetalle', 'equipoEstadoDetalle', 'armaDetalle', 'notas']
      .forEach(k => { if(typeof o[k] === 'string') o[k] = correrTiposTexto(o[k]); });
  }

  function migrarCreepTipos(sc){
    if(num(sc.escalaTipos) >= ESCALA_TIPOS) return;
    migrarObjTipos(sc);
    ['equipo', 'habilidades', 'estados'].forEach(k => (Array.isArray(sc[k]) ? sc[k] : []).forEach(migrarObjTipos));
    sc.escalaTipos = ESCALA_TIPOS;
  }

  // El atributo Inteligencia se renombró a Especial (id 'int' -> 'esp',
  // 2026-09-18) para poder reusar el nombre después con un significado
  // distinto — ver la misma migración en ficha.html. Se puede correr varias
  // veces sin cambiar nada.
  function migrarObjEspecial(o){
    if(!o || typeof o !== 'object') return;
    (Array.isArray(o.mods) ? o.mods : []).forEach(m => { if(m && m.stat === 'int') m.stat = 'esp'; });
    (Array.isArray(o.efectoMods) ? o.efectoMods : []).forEach(m => { if(m && m.stat === 'int') m.stat = 'esp'; });
    if(o.tiradaStat === 'int') o.tiradaStat = 'esp';
    ['detalle', 'descripcionNarrativa', 'efectoDetalle', 'equipoEstadoDetalle', 'armaDetalle', 'notas'].forEach(k => {
      if(typeof o[k] === 'string') o[k] = o[k].replace(/Inteligencia/g, 'Especial').replace(/inteligencia/g, 'especial');
    });
  }

  // 2026-09-24: las habilidades de creep armadas por el programa que tiran daño ("⚙ Automatizado: ... tira 2d6+3 de daño")
  // ahora traen vinculada la tirada de PdG (o PdG.Esp si es mágica) para que Ejecutar tire primero la probabilidad de golpe.
  // A las ya guardadas se les agrega al cargar; a las que ya tienen un stat elegido a mano no se las toca.
  function migrarHabPdg(sc){
    const U = window.CreepsBaseUtil;
    (Array.isArray(sc.habilidades) ? sc.habilidades : []).forEach(h => {
      if(!h || h.tiradaStat || !String(h.tiradaExtra || '').trim() || h.trampaColocar) return;
      if(!/tira [^;]*? de daño/i.test(String(h.detalle || ''))) return;
      h.tiradaStat = U && U.esHabMagica && U.esHabMagica(h.nombre, h.detalle) ? 'pdgmg' : 'pdg';
    });
  }

  function migrarCreepEspecial(sc){
    if(sc.int !== undefined){
      if(sc.esp === undefined) sc.esp = sc.int;
      delete sc.int;
    }
    (Array.isArray(sc.armaMods) ? sc.armaMods : []).forEach(m => { if(m && m.stat === 'int') m.stat = 'esp'; });
    ['equipo', 'habilidades', 'estados'].forEach(k => (Array.isArray(sc[k]) ? sc[k] : []).forEach(migrarObjEspecial));
  }

  /* ---------- Ranuras del equipo ---------- */
  const SLOT_MAP = {
    arma_1m:'mano', arma_2m:'mano',
    escudo_1m:'escudo', escudo_2m:'escudo',
    armadura_blanda:'armadura', armadura_rigida:'armadura',
    cabeza:'cabeza', manos:'manos', piernas:'piernas', pies:'pies',
    cinturon:'cinturon', mochila:'mochila',
  };
  function slotDe(tipoItem){ return SLOT_MAP[tipoItem] || 'otro'; }

  /* ---------- Stats ---------- */
  function danoTxt(sc, extra){
    const dados = Math.max(1, num(sc.armaPeso)||1) + Math.max(0, num(sc.armaAmplificado));
    const tipo = num(sc.armaTipo)||8;
    const fijo = num(sc.armaFijo) + (sc.armaDeRango ? 0 : num(extra));
    return `${dados}d${tipo}${fijo?` + ${fmt(fijo)}`:''}`;
  }

  // Lo que el creep tiene puesto y da bonos: su equipo y su arma (sc.armaMods).
  function fuentesEquipo(sc){
    const arma = (sc.armaMods || []).length ? [{nombre: sc.armaNombre || 'Arma', mods: sc.armaMods}] : [];
    return [...(sc.equipo || []), ...arma];
  }

  // Suma los modificadores que apuntan a un stat puntual, vengan del equipo
  // puesto o de estados activos — mismo criterio que collectMods()+modTotal
  // en ficha.html, para que un ítem con "bloqueo +N" o un estado que suba
  // Fuerza afecten al creep de verdad y no solo la Res. a crítico.
  function modTotal(sc, statId){
    let total = 0;
    fuentesEquipo(sc).forEach(it => (it.mods||[]).forEach(m => { if(m.stat === statId) total += num(m.val); }));
    (sc.estados||[]).forEach(es => {
      if(es.activo === false) return;
      const stacks = Math.max(1, num(es.stacks)||1);
      (es.mods||[]).forEach(m => { if(m.stat === statId) total += num(m.val) * stacks; });
    });
    return total;
  }

  // Armadura rota activa reduce la Defensa — igual que en ficha.html.
  function estadosArmadura(sc){
    const activos = (sc.estados||[]).filter(e => e.activo !== false);
    return {
      rota: activos.filter(e => e.armaduraRota).reduce((a, e) => a + Math.max(1, num(e.stacks) || 1), 0),  // puntos de Defensa que quita
    };
  }
  function aporteArmadura(sc, statId){
    return (sc.equipo||[]).filter(it => slotDe(it.tipoItem) === 'armadura')
      .reduce((a,it) => a + (statId === 'def' ? num(it.def) : (it.mods||[]).filter(m=>m.stat===statId).reduce((s,m)=>s+num(m.val),0)), 0);
  }
  function defensaEfectiva(sc){
    const {rota} = estadosArmadura(sc);
    let v = num(sc.defensa);
    // Bonos de Defensa de los estados (ej. Piel de escoria): se suman por stack.
    (sc.estados || []).forEach(es => { if(es.activo === false) return; const st = Math.max(1, num(es.stacks) || 1); (es.mods || []).forEach(m => { if(m.stat === 'def') v += num(m.val) * st; }); });
    v -= rota;
    return Math.max(0, v);
  }
  // Armadura mágica (Paso 3 de las reglas de casteo, docs/reglas-casteo.md):
  // stat general, fijo, que NO sale de ningún atributo (base a mano, 0 por
  // defecto) — solo la dan ítems Raros o mejores, vía sus bonos genéricos
  // (no tiene un campo propio como "def" en las piezas de armadura). Protege
  // el daño de casteo que "ignora la Defensa" (Paso 1); no tiene nada que ver
  // con Escudo especial ni con la habilidad "Armadura arcana" del Mago.
  function armadmgEfectiva(sc){
    return Math.max(0, num(sc.armadmg) + modTotal(sc, 'armadmg'));
  }
  function critEfectivo(sc, i){
    return num(sc.crit[i]);
  }
  /* Stats secundarios de los creeps: los mismos que un PJ, cada uno sale de
     su atributo (fórmula base = el atributo) + mods (ver statValor).
     Hp.Max y No2 ya se ven arriba; Crg.Max y SP no aplican a los creeps. */
  const DERIVADOS_POR_ATTR = {
    con: [['resmg', 'Res.Esp'], ['rescc', 'Res.CC']],
    fue: [['dmg', 'Dmg'], ['bloqueo', 'Bloqueo']],
    agl: [['eva', 'Eva'], ['ini', 'Iniciativa']],
    des: [['rng', 'Rng'], ['pdg', 'PdG'], ['crit', 'Crít.Frec.'], ['critpot', 'Crít.Pot.'], ['parry', 'Parry'], ['percepcion', 'Percep.']],
    esp: [['pdgmg', 'PdG.Esp'], ['dmgesp', 'Ef.Esp'], ['resm', 'Res.Mt'], ['rangocasteo', 'Rango Cast.']],
  };
  const ATTR_NOMBRE = {con:'Constitución', fue:'Fuerza', agl:'Agilidad', des:'Destreza', esp:'Especial'};

  // Los 5 atributos base (entradas con attr apuntando a sí mismas) más los
  // stats secundarios derivados de un PJ (Res.Esp/Res.CC de Con, Dmg/
  // Potencia de Fue, Eva/Ini/Mov de Agl, Rango/PdG/Crítico/Parry/Percepción
  // de Des, PdG.Esp/Res.M/Rango de casteo de Especial). STATS_TIRADA_IDS
  // recorta cuáles se muestran como botón en las Acciones.
  const DERIVED_STATS = [
    {id:'con', label:'Con', attr:'con'}, {id:'fue', label:'Fue', attr:'fue'},
    {id:'agl', label:'Agi', attr:'agl'}, {id:'des', label:'Des', attr:'des'}, {id:'esp', label:'Esp', attr:'esp'},
    {id:'resmg', label:'Res.Esp', attr:'con'}, {id:'rescc', label:'Res.CC', attr:'con'},
    {id:'dmg', label:'Dmg', attr:'fue'}, {id:'bloqueo', label:'Bloqueo', attr:'fue'},
    {id:'eva', label:'Eva', attr:'agl'}, {id:'ini', label:'Iniciativa', attr:'agl'}, {id:'mov', label:'Mov', attr:'agl'},
    {id:'rng', label:'Rango', attr:'des'}, {id:'pdg', label:'PdG', attr:'des'}, {id:'crit', label:'Crítico frecuente', attr:'des'}, {id:'critpot', label:'Crítico potente', attr:'des'}, {id:'parry', label:'Parry', attr:'des'}, {id:'percepcion', label:'Percepción', attr:'des'},
    {id:'pdgmg', label:'PdG.Esp', attr:'esp'}, {id:'dmgesp', label:'Ef.Esp', attr:'esp'}, {id:'resm', label:'Res.Mt', attr:'esp'}, {id:'rangocasteo', label:'Rango de casteo', attr:'esp'},
  ];
  // Mismo criterio que STATS_SIN_TIRADA/STATS_REDUNDANTES_COMBATE en la
  // Botonera de la ficha: los 5 atributos base + los secundarios que no
  // tienen ya su propio botón en la caja de Combate.
  const STATS_TIRADA_IDS = ['con', 'fue', 'agl', 'des', 'esp', 'resmg', 'rescc', 'ini', 'pdgmg', 'dmgesp', 'resm', 'percepcion'];
  const STAT_LOOKUP = Object.fromEntries(DERIVED_STATS.map(d => [d.id, d]));
  function statValor(sc, statId){
    const d = STAT_LOOKUP[statId];
    if(!d) return 0;
    // Suma tanto lo que sube el atributo que lo gobierna (fue, des, etc.,
    // que arrastra a todos sus derivados) como lo que apunta directo al
    // derivado (p.ej. un ítem con "bloqueo +N" que no toca Fuerza). Para un
    // atributo base tirado directo (statId === d.attr) no hay que sumar el
    // mod dos veces.
    let v = num(sc[d.attr]) + modTotal(sc, d.attr);
    if(statId !== d.attr) v += modTotal(sc, statId);
    // Pajaritos (PdG/Eva) y Lisiado (PdG/Parry) ya no achican el stat: parten el resultado de la tirada (mitadesDeTirada, en tirarValorStat).
    if(statId === 'resmg' && sc.jefe) v += 1;   // protección de jefe: +1 Res.Esp (la tirada contra los debuffs)
    if(statId === 'mov'){
      const activos = (sc.estados||[]).filter(e => e.activo !== false);
      if(activos.some(e => e.inmovilizado)) v = 0;
      else if(activos.some(e => e.rengo)) v = Math.floor(v / 2);
    }
    return v;
  }
  function estadoActivo(sc, flag){
    return (sc.estados || []).some(e => e.activo !== false && e[flag]);
  }
  // Cada fuente (equipo o estado activo) que le suma a un stat, con su valor.
  function aportesMod(sc, statId){
    const out = [];
    fuentesEquipo(sc).forEach(it => {
      const v = (it.mods||[]).filter(m => m.stat === statId).reduce((a, m) => a + num(m.val), 0);
      if(v) out.push({nombre: it.nombre || '(sin nombre)', val: v, tipo: 'equipado'});
    });
    (sc.estados||[]).forEach(es => {
      if(es.activo === false) return;
      const stacks = Math.max(1, num(es.stacks)||1);
      const v = (es.mods||[]).filter(m => m.stat === statId).reduce((a, m) => a + num(m.val) * stacks, 0);
      if(v) out.push({nombre: es.nombre || '(sin nombre)', val: v, tipo: 'estado alterado'});
    });
    return out;
  }
  // Nombres de los estados activos que aportan un mod a ese stat, para
  // poder mostrar "de dónde sale" al tocar el indicador +/-.
  function origenesMod(sc, statId){
    const deEquipo = fuentesEquipo(sc)
      .filter(it => (it.mods||[]).some(m => m.stat === statId))
      .map(it => it.nombre || '(sin nombre)');
    const deEstados = (sc.estados||[])
      .filter(es => es.activo !== false && (es.mods||[]).some(m => m.stat === statId))
      .map(es => es.nombre || '(sin nombre)');
    return [...deEquipo, ...deEstados];
  }

  /* ---------- De dónde sale cada cosa (textos para la 🔍 y los globitos) ---------- */
  const conSigno = v => `${v > 0 ? '+' : ''}${fmt(v)}`;
  // De dónde sale un stat secundario: su atributo y lo que lo modifica.
  function statOrigenTxt(sc, statId, label){
    const attr = STAT_LOOKUP[statId].attr;
    const L = [`${ATTR_NOMBRE[attr]} base: ${fmt(num(sc[attr]))}`];
    aportesMod(sc, attr).forEach(a => L.push(`${conSigno(a.val)} ${ATTR_NOMBRE[attr]} por ${a.nombre}`));
    aportesMod(sc, statId).forEach(a => L.push(`${conSigno(a.val)} ${label} por ${a.nombre}`));
    if((statId === 'pdg' || statId === 'eva') && estadoActivo(sc, 'mitadPdgEva')) L.push('Pajaritos: a la mitad');
    if((statId === 'pdg' || statId === 'parry') && estadoActivo(sc, 'lisiado')) L.push('Lisiado: a la mitad');
    if(['pdg', 'parry', 'eva'].includes(statId) && estadoActivo(sc, 'paralisis')) L.push('Parálisis: a la mitad');
    L.push(`= ${fmt(statValor(sc, statId))}`);
    return L.join('\n');
  }
  function armadmgOrigenTxt(sc){
    const L = [];
    let deItems = 0;
    fuentesEquipo(sc).forEach(it => {
      const v = (it.mods || []).filter(m => m.stat === 'armadmg').reduce((a, m) => a + num(m.val), 0);
      if(!v) return;
      deItems += v;
      L.push(`${conSigno(v)} por ${it.nombre || '(sin nombre)'}`);
    });
    const resto = num(sc.armadmg) - deItems;
    if(resto || !L.length) L.push(`${conSigno(resto)} base (cargada a mano)`);
    L.push(`= ${fmt(armadmgEfectiva(sc))}`);
    return L.join('\n');
  }
  // Ataque = daño del arma + Fuerza (Dmg), el mismo que tira "Daño Arma".
  function ataqueTxt(sc){
    return danoTxt(sc, statValor(sc, 'dmg'));
  }
  // De dónde sale el Ataque: dados y fijo del arma, Fuerza y lo que la sube,
  // mods directos de Dmg. Un arma de rango no suma Fuerza (ver danoTxt).
  function ataqueOrigenTxt(sc){
    const dados = Math.max(1, num(sc.armaPeso)||1) + Math.max(0, num(sc.armaAmplificado));
    const L = [`${dados}d${num(sc.armaTipo)||8} por ${sc.armaNombre || 'el arma'}`];
    if(num(sc.armaFijo)) L.push(`${conSigno(num(sc.armaFijo))} fijo del arma`);
    if(sc.armaDeRango){
      L.push('Arma de rango: no suma Fuerza');
    }else{
      L.push(`${conSigno(num(sc.fue))} Fuerza base`);
      aportesMod(sc, 'fue').forEach(a => L.push(`${conSigno(a.val)} Fuerza por ${a.nombre}`));
      aportesMod(sc, 'dmg').forEach(a => L.push(`${conSigno(a.val)} Daño por ${a.nombre}`));
    }
    L.push(`= ${ataqueTxt(sc)}`);
    return L.join('\n');
  }
  // De dónde sale la Defensa: lo que da cada pieza de armadura, el resto
  // cargado a mano, y si la armadura está rota o arruinada.
  function defensaOrigenTxt(sc){
    const L = [];
    let deItems = 0;
    (sc.equipo||[]).forEach(it => {
      if(!num(it.def)) return;
      deItems += num(it.def);
      L.push(`${conSigno(num(it.def))} por ${it.nombre || '(sin nombre)'}`);
    });
    const resto = num(sc.defensa) - deItems;
    if(resto || !L.length) L.push(`${conSigno(resto)} base (cargada a mano)`);
    const {rota} = estadosArmadura(sc);
    if(rota) L.push(`Armadura rota: -${rota} de Defensa`);
    L.push(`= ${fmt(defensaEfectiva(sc))}`);
    return L.join('\n');
  }
  // De dónde sale una resistencia a crítico (i = 0..4 → Tipo 4..12): lo que
  // da cada pieza de equipo (se suma a sc.crit al equiparla), el resto cargado
  // a mano, y si la armadura está rota o arruinada (ver critEfectivo).
  function critOrigenTxt(sc, i){
    const stat = 'tipo' + (i + 1);
    const L = [];
    let deItems = 0;
    (sc.equipo||[]).forEach(it => {
      const v = (it.mods||[]).filter(m => m.stat === stat).reduce((a, m) => a + num(m.val), 0);
      if(!v) return;
      deItems += v;
      L.push(`${conSigno(v)} por ${it.nombre || '(sin nombre)'}`);
    });
    const resto = num(sc.crit[i]) - deItems;
    if(resto || !L.length) L.push(`${conSigno(resto)} base (cargada a mano)`);
    L.push(`= ${conSigno(critEfectivo(sc, i))}`);
    return L.join('\n');
  }
  function armaduraOrigenTxt(sc){
    const activos = (sc.estados||[]).filter(e => e.activo !== false && e.armaduraRota);
    const nombres = activos.map(e => e.nombre || '(sin nombre)').join(', ');
    return `Reducido por: ${nombres || 'estado activo'}`;
  }

  /* ---------- Vida y No2 ---------- */
  // ¿Estos modificadores cambian el Hp.Max? (Con, o Hp.Max directo)
  function modsAfectanHp(mods){
    return (mods || []).some(m => m.stat === 'con' || m.stat === 'hpmax');
  }
  // Recalcula hpMax = con*5 + mods de Hp.Max (con efectivo; equipo y estados
  // incluidos, igual que en la ficha) cuando cambia con o algo que da Hp.Max.
  // Si el creep estaba a HP lleno lo deja lleno; si no, sólo recorta hp si se
  // pasa del nuevo máximo.
  function actualizarHpMaxPorCon(sc){
    const conEfectivo = num(sc.con) + modTotal(sc, 'con');
    const nuevoHpMax = Math.max(0, conEfectivo * 5 + modTotal(sc, 'hpmax'));
    const estabaFull = num(sc.hp) >= num(sc.hpMax);
    sc.hpMax = nuevoHpMax;
    sc.hp = estabaFull ? nuevoHpMax : Math.min(num(sc.hp), nuevoHpMax);
  }
  function nitrosMax(sc){
    // Natural = Agilidad efectiva + bonos a Nitros (los viejos de Movimiento y Acciones máx. cuentan como No2); los estados
    // (Cansado, Hypeado, Exhausto, Stun) los aplica el motor común (comun/combatiente.js), igual que a personajes e invocaciones.
    return Combatiente.nitrosMax(num(sc.agl) + modTotal(sc, 'agl') + modTotal(sc, 'nitros') + modTotal(sc, 'mov') + modTotal(sc, 'accionesmax'), sc.estados);
  }
  function actualizarNo2PorAgl(sc, antes){
    if(sc.nitros === null || sc.nitros === undefined) return;  // todavía no se solidificó: arranca lleno solo
    const nuevoMax = nitrosMax(sc);
    sc.nitros = antes.full ? nuevoMax : Math.min(num(sc.nitros), nuevoMax);
  }

  /* ---------- Costos ---------- */
  // Primer ataque del turno: Tipo ÷ 2 (redondeado para arriba); los demás, Tipo completo.
  function costoAtaque(sc){ return Combatiente.costoAtaque(num(sc.armaTipo) || 8, sc.ataquesTurno); }   // regla común (comun/combatiente.js)
  // Nitros de una habilidad: un número, o "ATAQUE" = lo que le cuesta un
  // ataque con su arma (Tipo ÷ 2 el primero del turno) y cuenta como ese ataque.
  function habAtaque(h){ return String((h && h.nitrosCosto) ?? "").trim().toUpperCase() === "ATAQUE"; }
  function costoNitrosHab(sc, h){ return Combatiente.costoNitrosHab(h, () => costoAtaque(sc), IT2_CREEP.nitrosHabilidad); }   // comun/combatiente.js
  /* La descripción de las habilidades del catálogo termina con un aviso para el GM: "⚙ Automatizado: … ✋ A mano: …".
     Eso es cosa de la herramienta (se ve en Ver y en la tarjeta), no de la mesa: a la Mesa, que lee todo el mundo,
     va solo lo que hace la habilidad (la descripción más lo que se resuelve a mano, que también es lo que hace). */
  function habPartes(h){
    const t = String((h && (h.detalle || h.descripcion)) || '');
    const i = t.indexOf('⚙');
    if(i < 0) return {descripcion: t.trim(), auto: '', mano: ''};
    const resto = t.slice(i).replace(/^⚙\s*Automati[a-z]*:\s*/i, '');
    const j = resto.indexOf('✋');
    const auto = (j < 0 ? resto : resto.slice(0, j)).trim().replace(/\.$/, '');
    const mano = j < 0 ? '' : resto.slice(j).replace(/^✋\s*A mano:\s*/i, '').trim();
    return {descripcion: t.slice(0, i).trim(), auto, mano: /^nada, todo está automatizado\.?$/i.test(mano) ? '' : mano};
  }
  function habTextoMesa(h){
    const p = habPartes(h);
    return [p.descripcion, p.mano].filter(Boolean).join(' ');
  }
  function costoHabTxt(sc, h){
    const n = costoNitrosHab(sc, h);
    if(habAtaque(h)) return `${fmt(n)} No2 (como un ataque)`;
    return n ? `${fmt(n)} No2` : "sin costo";
  }
  // Parry y Bloqueo de un creep (2026-09-24, pedido del dueño; igual que en la ficha): el Parry cuesta 1 No2 (2026-09-26; antes el Peso de su arma);
  // el Bloqueo suma su Bloqueo + el Peso del arma y ESA SUMA es el dado.
  function pesoArma(sc){ return Math.max(1, num(sc.armaPeso) || 1); }
  function costoParry(sc){ return Combatiente.costoParry(); }   // siempre 1 No2, sin importar el arma (comun/combatiente.js)
  // Con qué para el creep (Parry y Bloqueo): su arma si no es natural, si no un escudo de su equipo; null = no puede
  // (regla del dueño 2026-09-30, comun/combatiente.js). El Bloqueo suma el peso de eso.
  function defensa(sc){
    if(!sc) return null;
    return Combatiente.armaParaDefensa({arma: sc.armaNombre ? {nombre: sc.armaNombre, peso: pesoArma(sc)} : null, natural: sc.armaNatural,
      escudos: (sc.equipo || []).filter(it => slotDe(it.tipoItem) === 'escudo').map(it => ({nombre: it.nombre, peso: num(it.peso)}))});
  }
  function bloqueoValor(sc){ const d = defensa(sc); return statValor(sc, 'bloqueo') + (d ? num(d.peso) : 0); }
  // Fuerza del golpe (reglas del escudo, 2026-09-26): la tirada del atacante contra el Bloqueo del defensor = su Fuerza (con los estados activos) + el peso de su arma; la SUMA es el dado.
  function fuerzaGolpeValor(sc){ return num(sc.fue) + (sc.estados || []).filter(e => e.activo !== false).reduce((a, e) => a + (e.mods || []).filter(m => m.stat === 'fue').reduce((x, m) => x + num(m.val) * Math.max(1, num(e.stacks) || 1), 0), 0) + pesoArma(sc); }
  // Contraataque (regla a prueba, 2026-09-26): tras un Parry, siempre cuesta lo de un primer ataque y no suma al conteo de ataques del turno.
  function costoContraataque(sc){ return Combatiente.costoPrimerAtaque(num(sc.armaTipo) || 8); }   // regla común (comun/combatiente.js)
  // ¿Le alcanzan los No2 para un ataque de oportunidad (lo de un primer ataque con su arma)? (2026-10-02, pedido del dueño: el mapa solo
  // frena a quien se aleja si el que se queda puede aprovecharlo.) Se publica en su resumen (`opor`): los jugadores no ven sus No2.
  function oportunidadPosible(sc){
    const n = sc.nitros === null || sc.nitros === undefined ? nitrosMax(sc) : num(sc.nitros);
    return !(num(sc.hp) <= 0) && n >= costoContraataque(sc);
  }
  // Alcance de su arma, en casilleros: un arma de rango usa su Rango; una de cuerpo a cuerpo, 1 + lo que le sume a Rango.
  function alcance(sc){
    if(sc.armaDeRango){ const v = statValor(sc, 'rng'); return Number.isNaN(v) ? 0 : Math.max(1, Math.round(v)); }
    const bono = (sc.armaMods || []).filter(m => m.stat === 'rng').reduce((a, m) => a + num(m.val), 0);
    return 1 + Math.max(0, Math.round(bono));
  }

  /* ---------- Habilidades: modo y si se pueden usar ---------- */
  function modoHab(h){ return Combatiente.modoHab(h, h && h.duelo && typeof h.duelo === 'object' ? h.duelo : null); }   // la regla común
  // ¿Se puede usar ahora? La regla común (P133): cooldown, No2 y vida (una 📣 manual no cobra nada).
  function bloqueoHab(sc, h){ return Combatiente.bloqueoHab(h, {modo: modoHab(h), nitros: sc.nitros, costo: costoNitrosHab(sc, h), hp: sc.hp}); }

  /* ---------- Normalizar un creep guardado ---------- */
  // Estados de creeps guardados antes de los No2: los presets que tocaban
  // Acciones pasan a tocar No2 (solo si el estado no trae ya ese efecto).
  const ESTADOS_NITROS_MIGRAR = {
    Cansado: {mods:[{stat:'nitros', val:-1}]},
    Hypeado: {mods:[{stat:'nitros', val:1}]},
    Exhausto: {forzarNitros:1},
    Stun: {forzarNitros:0},
  };
  // Rellena campos que creeps viejos (guardados antes de una función nueva)
  // pueden no tener, para que el resto del código no se tope con undefined.
  function normalizar(sc){
    const crit = Array.isArray(sc.crit) ? sc.crit.map(v=>num(v)) : [];
    while(crit.length < 5) crit.push(0);
    sc.crit = crit.slice(0, 5);
    sc.equipo = Array.isArray(sc.equipo) ? sc.equipo : [];
    sc.estados = Array.isArray(sc.estados) ? sc.estados : [];
    sc.habilidades = Array.isArray(sc.habilidades) ? sc.habilidades : [];
    sc.armaMods = Array.isArray(sc.armaMods) ? sc.armaMods : [];
    sc.armaEfectos = Array.isArray(sc.armaEfectos) ? sc.armaEfectos : [];
    migrarCreepTipos(sc);
    migrarCreepEspecial(sc);
    migrarHabPdg(sc);
    // Recompensas (2026-09-20): los creeps viejos no las traen.
    if(typeof sc.mapa !== 'string') sc.mapa = '';   // en qué mapa está (comun/creeps-mapas.js; '' = la Reserva)
    if(sc.tipoCriatura === undefined) sc.tipoCriatura = '';
    if(sc.tipoCriaturaOtro === undefined) sc.tipoCriaturaOtro = '';
    sc.jefe = sc.jefe === true;
    sc.oroBase = Math.max(0, num(sc.oroBase));
    sc.armaNatural = sc.armaNatural === true;
    if(!sc.trofeoEspecial || typeof sc.trofeoEspecial !== 'object') sc.trofeoEspecial = {nombre: '', precio: 0};
    // Acciones → No2.
    if(sc.acc !== undefined || sc.accMax !== undefined){
      delete sc.acc;
      delete sc.accMax;
      delete sc.nitros;  // arranca lleno (abajo), aunque la carga haya traído un valor por defecto
      sc.estados.forEach(es => {
        const m = ESTADOS_NITROS_MIGRAR[es.nombre];
        if(!m) return;
        const yaTiene = (es.forzarNitros !== undefined && es.forzarNitros !== '') || (es.mods || []).some(x => x.stat === 'nitros');
        if(yaTiene) return;
        if(m.mods) es.mods = [...(es.mods || []), ...structuredClone(m.mods)];
        if(m.forzarNitros !== undefined) es.forzarNitros = m.forzarNitros;
      });
    }
    // La habilidad Movimiento se quitó: moverse se cobra desde el mapa. Se
    // saca siempre, por si una pestaña con la versión vieja la vuelve a meter.
    sc.habilidades = sc.habilidades.filter(h => h && h.nombre !== 'Movimiento');
    delete sc.sinMovimiento;
    sc.habilidades.forEach(h => {
      if(h.accionesCosto === undefined) return;
      if(h.nitrosCosto === undefined) h.nitrosCosto = h.accionesCosto;
      delete h.accionesCosto;
    });
    if(sc.nitros === undefined || sc.nitros === null) sc.nitros = nitrosMax(sc);
    if(sc.ataquesTurno === undefined) sc.ataquesTurno = 0;
    delete sc.compacto;  // la tarjeta ya no se despliega: se edita en una ventana
    return sc;
  }

  /* ---------- Recompensas del creep: oro, arma natural y trofeo (2026-10-02, hoja de ruta A6a) ----------
     Copiado tal cual de gm-toolset/js/02 (tipoDeCreep, oroSugeridoCreep, trofeoDeCreep, dropsResumenCreep…): lo usan GM Tools y
     el «Ver» de un creep (comun/creep-lupa.js), también en el mapa. */
  const TIPOS_CRIATURA = ['humano', 'humanoide', 'bestia', 'planta', 'elemental', 'constructo', 'no-muerto', 'alienígena'];
  const TIPOS_CON_ARMA_NATURAL = ['bestia', 'planta', 'elemental', 'alienígena', 'constructo', 'no-muerto'];
  const TROFEO_PRECIO_NIVEL = [16, 30, 50, 75, 110];
  const TIPOITEM_LABEL = {
    escudo_1m:'Escudo 1 mano', escudo_2m:'Escudo 2 manos',
    armadura_blanda:'Armadura blanda', armadura_rigida:'Armadura rígida',
    manos:'Manos', cabeza:'Cabeza', pies:'Pies', piernas:'Piernas',
  };
  // Etiquetas cortas de los stats de un ítem de creep (antes STAT_LABEL_GM de GM Tools).
  const STAT_LABEL = {
    tipo1:'Tipo 4', tipo2:'Tipo 6', tipo3:'Tipo 8', tipo4:'Tipo 10', tipo5:'Tipo 12',
    pdg:'PdG', eva:'Eva', ini:'Iniciativa', mov:'Mov', parry:'Parry', crit:'Crítico frecuente', critpot:'Crítico potente',
    bonos:'Bonos', rangocasteo:'Rango Cast.', accionesmax:'Acciones máx.', nitros:'No2',
    resm:'Res.Mt', resmg:'Res.Esp', rescc:'Res.CC',
    con:'Con', fue:'Fue', agl:'Agi', des:'Des', esp:'Esp',
  };
  // Un ítem del catálogo en la forma del equipo de un creep (antes itemParaCreep de GM Tools, js/01): sin id, la Defensa separada de los
  // otros bonos (`def`), sin los campos que un creep no usa. Es la forma de CATALOGO_EQUIPO (GM Tools) y del catálogo del fin del combate.
  function itemParaCreep(it){
    const arma = it.tipoItem.startsWith('arma_');
    const o = {nombre: it.nombre, tipoItem: it.tipoItem, tier: it.tier, tipoDado: arma ? (it.tipoDado || 0) : 0, danoFijo: arma ? (it.danoFijo || 0) : 0,
      peso: it.peso || 0, precioCompra: it.precioCompra || 0, def: (it.mods || []).filter(m => m.stat === 'def').reduce((a, m) => a + (Number(m.val) || 0), 0)};
    if(arma && it.danoAmplificado) o.danoAmplificado = it.danoAmplificado;
    if(it.durPorPeso) o.durPorPeso = it.durPorPeso;   // durabilidad de diseño (si no es la de siempre)
    if(arma && it.armaDeRango) o.armaDeRango = true;
    if(arma && it.espalda) o.espalda = structuredClone(it.espalda);   // por la espalda
    if(arma && num(it.ignoraResistCrit) > 0) o.ignoraResistCrit = num(it.ignoraResistCrit);   // ignora Resistencia a crítico
    if(arma && (it.efectosGolpe || []).length) o.efectosGolpe = structuredClone(it.efectosGolpe);
    if(it.tipoItem === 'consumibles'){ o.consumible = true; if(it.curahp) o.curahp = it.curahp; if(it.legacy) o.legacy = true; }
    const otros = (it.mods || []).filter(m => m.stat !== 'def');
    if(otros.length) o.mods = structuredClone(otros);
    o.detalle = it.detalle || '';
    if(it.descripcionNarrativa) o.descripcionNarrativa = it.descripcionNarrativa;
    return o;
  }
  function nombreLimpio(sc){ return String(sc.nombre || 'Creep').replace(/\s*\(auditar\)\s*$/i, '').trim(); }
  function tipoDe(sc){
    return sc.tipoCriatura === 'otros' ? String(sc.tipoCriaturaOtro || '').trim().toLowerCase() : String(sc.tipoCriatura || '');
  }
  function oroSugerido(sc){
    const n = Math.max(1, Math.round(num(sc.nivel)) || 1);
    const humano = 5 * n * n + 10 * n;   // 15, 40, 75, 120, 175
    const t = tipoDe(sc);
    let v = 0;
    if(t === 'humano') v = humano;
    else if(t === 'humanoide') v = Math.floor(humano / 2 / 5 + 0.5) * 5;   // la mitad, a múltiplos de 5
    return sc.jefe ? v * 2 : v;
  }
  function trofeoPrecioAuto(sc){
    const n = Math.max(1, Math.round(num(sc.nivel)) || 1);
    const base = n <= 5 ? TROFEO_PRECIO_NIVEL[n - 1] : 110 + 40 * (n - 5);
    return sc.jefe ? base * 2 : base;
  }
  // El trofeo que suelta al morir (o null). El "especial" reemplaza al automático.
  function trofeo(sc){
    const esp = sc.trofeoEspecial || {};
    const nombreEsp = String(esp.nombre || '').trim();
    if(!nombreEsp && !sc.armaNatural) return null;
    const nombre = nombreEsp || `${sc.armaNombre || 'Arma natural'} de ${nombreLimpio(sc)}`;
    const precio = num(esp.precio) > 0 ? num(esp.precio) : trofeoPrecioAuto(sc);
    return {nombre, precioCompra: precio, especial: !!nombreEsp};
  }
  function despojosDePrecio(precioCompra){ return Math.ceil(num(precioCompra) / 4); }   // un cuarto del precio de compra
  function dropsResumen(sc){
    const partes = [];
    if(sc.armaNombre && !sc.armaNatural) partes.push(`${sc.armaNombre} (arma equipable)`);
    (sc.equipo || []).forEach(it => partes.push(`${it.nombre} (equipo)`));
    const tr = trofeo(sc);
    if(tr) partes.push(`${tr.nombre} (trofeo: compra ${fmt(tr.precioCompra)}, venta ${fmt(tr.precioCompra / 2)}, ${fmt(despojosDePrecio(tr.precioCompra))} despojos)`);
    if(num(sc.oroBase) > 0) partes.push(`${fmt(num(sc.oroBase))} DDE de oro (±20% al final del combate)`);
    return partes.length ? partes.join(' · ') : 'nada';
  }

  return {IT2_CREEP, DADOS_ARMA, ESCALA_TIPOS, DERIVED_STATS, STATS_TIRADA_IDS, STAT_LOOKUP, DERIVADOS_POR_ATTR, ATTR_NOMBRE, SLOT_MAP,
    TIPOS_CRIATURA, TIPOS_CON_ARMA_NATURAL, TROFEO_PRECIO_NIVEL, TIPOITEM_LABEL, STAT_LABEL, itemParaCreep, nombreLimpio, tipoDe, oroSugerido, trofeoPrecioAuto,
    trofeo, despojosDePrecio, dropsResumen,
    correrTiposTexto, migrarObjTipos, migrarCreepTipos, migrarObjEspecial, migrarHabPdg, migrarCreepEspecial, slotDe,
    danoTxt, fuentesEquipo, modTotal, estadosArmadura, aporteArmadura, defensaEfectiva, armadmgEfectiva, critEfectivo,
    statValor, estadoActivo, aportesMod, origenesMod, conSigno, statOrigenTxt, armadmgOrigenTxt, ataqueTxt, ataqueOrigenTxt,
    defensaOrigenTxt, critOrigenTxt, armaduraOrigenTxt, modsAfectanHp, actualizarHpMaxPorCon, nitrosMax, actualizarNo2PorAgl,
    costoAtaque, habAtaque, costoNitrosHab, habPartes, habTextoMesa, costoHabTxt, pesoArma, costoParry, defensa, bloqueoValor,
    fuerzaGolpeValor, costoContraataque, oportunidadPosible, alcance, modoHab, bloqueoHab, ESTADOS_NITROS_MIGRAR, normalizar};
})();
