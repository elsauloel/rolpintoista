// js/01-modelo-y-reglas.js — tramo 1 de 14 del script de ficha.html (paso 5, nivel A: mismo código, en el mismo orden).
/* =========================================================
   MODELO
   ========================================================= */

// Atributos y stats: viven en comun/ficha-calculo.js (paso 5, nivel B); acá, los mismos nombres de siempre.
const GRUPOS = FichaCalculo.GRUPOS;
const EXTRA = FichaCalculo.EXTRA;
const STAT_LIST = FichaCalculo.STAT_LIST;

const DADOS_ARMA = [4, 6, 8, 10, 12];

/* =========================================================
   ITERACIÓN 2 — Nitros (No2) y SP
   Nitros reemplaza a Acciones y a Movimiento: su máximo es el substat
   No2 (fórmula base agl + mods) y se recarga en cada Mantenimiento.
   SP reemplaza a Bonos: se gasta con habilidades y NO se recarga entero al
   pasar turno: cada Mantenimiento recupera SP Regen (substat de Int,
   base 0 + mods de habilidades, equipo o estados), sin pasar del máximo. El resto, con
   recargas, consumibles, descanso o a mano.

   Todo lo marcado PLACEHOLDER está sin confirmar: se ajusta acá y en la
   pantalla aparece con ⚠.
   ========================================================= */
const IT2 = {
  // Costos confirmados.
  nitrosMover: 1,               // por casillero
  nitrosConsumirCinturon: 1,
  nitrosConsumirMochila: 2,
  nitrosHabilidad: 1,           // costo por defecto de una habilidad nueva
  nitrosSigilo: 1,              // entrar en sigilo (a revisar, P1)
  nitrosLevantarse: 1,          // pararse estando Sentado (decidido 2026-09-24)
  nitrosEquipar: 1,             // equipar o desequipar un ítem, solo en modo combate del mapa
  // PLACEHOLDER: equipo, estados y catálogo viejos que daban "+N Bonos"
  // pasan a dar "+N × esto" de SP.
  spPorBono: 1,
  // PLACEHOLDER: Tipo con el que se cobra un ataque sin arma equipada.
  tipoSinArma: 4,
  // (El costo de atacar —Tipo ÷ 2 para arriba el primero— pasó al motor común: Combatiente.costoAtaque, comun/combatiente.js.)
  // PLACEHOLDER: Rengo cobra esto por casillero; Inmovilizado no deja moverse.
  nitrosMoverRengo: 2,
  inmovilizadoBloqueaMover: true,
  // PLACEHOLDER: tope de X en costos variables. null = solo frena lo
  // disponible. Si se confirma, poner una función: c => c.final.esp
  limiteXNitros: null,
  limiteXSp: null,
  // PLACEHOLDER: penalidad por peso de más. Hoy no resta nada (antes
  // restaba de Bonos); se puede sumar en la fórmula de SP (clic en el stat → fx), ej. esp*3 - sobrecarga.
  penalidadSobrecargaDefinida: false,
};
const IT2_PENDIENTE = txt => `<span class="it2-pendiente" title="Sin confirmar (Iteración 2): ${esc(txt)}">⚠</span>`;
const STATS_VIEJOS_IT2 = {bonos:'sp', mov:'nitros', accionesmax:'nitros'};

function migrarModsIt2(mods){
  (Array.isArray(mods) ? mods : []).forEach(m => {
    if(!m || !STATS_VIEJOS_IT2[m.stat]) return;
    if(m.stat === 'bonos') m.val = num(m.val) * IT2.spPorBono;
    m.stat = STATS_VIEJOS_IT2[m.stat];
  });
}

// Ítems, habilidades y estados guardados con los campos viejos. Se puede
// correr varias veces sobre lo mismo sin cambiar nada.
function migrarObjIt2(o){
  if(!o || typeof o !== 'object') return;
  migrarModsIt2(o.mods);
  migrarModsIt2(o.efectoMods);
  [['curabonosPct', 'curaspPct'], ['accionesCosto', 'nitrosCosto'], ['forzarAccionesMax', 'forzarNitros']].forEach(([viejo, nuevo]) => {
    if(o[viejo] === undefined) return;
    if(o[nuevo] === undefined) o[nuevo] = o[viejo];
    delete o[viejo];
  });
}

function migrarEstadoIt2(st){
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
  // SP Regen (2026-09-24, regla por defecto del dueño): TODOS los personajes regeneran, en el Mantenimiento, la mitad de su
  // Especial redondeada hacia abajo (base floor(esp/2)) + lo que sumen habilidades, equipo o estados. Las fichas que tenían la base
  // vieja (0, o floor(int/2)) pasan a la nueva UNA sola vez (marca spRegenAuto); si después alguien la deja a mano en 0, se respeta.
  if(f.spregen === undefined || f.spregen === 'floor(int/2)') f.spregen = 'floor(esp/2)';
  if(!st.spRegenAuto){
    if(f.spregen === '0') f.spregen = 'floor(esp/2)';
    st.spRegenAuto = true;
  }
  // Crítico frecuente (2026-09-25): el stat Crit dejó de salir de la Destreza (regla nueva del crítico, P113/P115). Las fichas viejas pasan a base 0 UNA sola vez.
  if(!st.critFrecuenteAuto){
    if(f.crit === 'des') f.crit = '0';
    st.critFrecuenteAuto = true;
  }
  if(f.critpot === undefined) f.critpot = '0';   // Crítico potente (2026-09-25)
  if(f.vision === undefined) f.vision = '6';
  Object.keys(f).forEach(k => {
    if(typeof f[k] === 'string') f[k] = f[k].replace(/\b(bonos|bon)\b/g, 'sp').replace(/\b(mov|accionesmax)\b/g, 'nitros');
  });
  // bonosGastados solo existe en fichas viejas, así que manda aunque el
  // merge con DEFAULT ya haya puesto spGastado en 0.
  if(st.bonosGastados !== undefined){
    st.spGastado = num(st.bonosGastados);
    delete st.bonosGastados;
  }
  if(st.spGastado === undefined) st.spGastado = 0;
  delete st.acciones;  // los Nitros arrancan llenos (ver renderAll)
  if(st.ataquesTurno === undefined) st.ataquesTurno = 0;
  if(!st.ataquesArma || typeof st.ataquesArma !== 'object') st.ataquesArma = {};
  // La habilidad base "Movimiento" se quitó: moverse se cobra desde el mapa.
  if(Array.isArray(st.habilidades)) st.habilidades = st.habilidades.filter(h => !h || h.id !== 'movimiento');
  ['inventario', 'cinturon', 'habilidades', 'pasivas', 'sociales', 'efectos', 'efectosPersonalizados', 'catalogo']
    .forEach(k => (Array.isArray(st[k]) ? st[k] : []).forEach(migrarObjIt2));
}

// El atributo Inteligencia se renombró a Especial (id 'int' -> 'esp', 2026-09-18)
// para poder reusar el nombre "Inteligencia" después con un significado
// distinto. Corre sobre S ya armado (ver renderAll); se puede correr varias
// veces sin cambiar nada, porque una vez migrado no queda ningún 'int'.
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
  // WildCards se sacó: ese lugar en la ficha ahora lo ocupa la Inteligencia
  // nueva (se calcula sola, no se guarda ningún valor).
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
   Los Tipos pasaron de 2/4/6/8/10 a 4/6/8/10/12. Las fichas guardadas antes
   traen tipoDado/armaTipo y los textos ("Resistencia a críticos tipo 2",
   "T2 P1") con la escala vieja: se corren +2 una sola vez y la ficha queda
   marcada con escalaTipos. No se puede correr dos veces sobre lo mismo. */
const ESCALA_TIPOS = 2;
// Lista de tipos después de "tipo(s)" o "crítico(s)/crit" ("área tipo 3" no es de arma).
const RE_TIPOS_LISTA = /(?<![Áá]rea )(\b(?:[Tt]ipos?|[Cc]r[ií]tic[oa]s?|[Cc]rit)\s+(?:de\s+)?)((?:10|[2468])\b(?:\s*(?:,|y)\s*(?:10|[2468])\b)*)(?!\s*%)/g;
// Notación corta de arma: "T2 P1", "T6, P1", "3d T4".
const RE_TIPOS_T = /\bT(10|[2468])(?=\s*,?\s*P\d)|(?<=\dd ?)T(10|[2468])\b/g;
let tiposGuardarJunto = false;  // recién migrada: todas las partes se guardan en el mismo lote

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

// Sobre los datos crudos que llegan (antes del merge con DEFAULT, que ya
// trae la marca). Devuelve true si hubo que correrlos.
function migrarEstadoTipos(st){
  if(!st || typeof st !== 'object' || num(st.escalaTipos) >= ESCALA_TIPOS) return false;
  ['inventario', 'cinturon', 'habilidades', 'pasivas', 'sociales', 'efectos', 'efectosPersonalizados', 'catalogo', 'invocaciones', 'equipo', 'mochila']
    .forEach(k => (Array.isArray(st[k]) ? st[k] : []).forEach(migrarObjTipos));
  st.escalaTipos = ESCALA_TIPOS;
  return true;
}

const CATEGORIAS = [
  {id:'', label:'— elegir categoría —'},
  {id:'arma_1m', label:'Arma de una mano', arma:true},
  {id:'arma_2m', label:'Arma de dos manos', arma:true},
  {id:'escudo_1m', label:'Escudo de una mano', defensivo:true},
  {id:'escudo_2m', label:'Escudo de dos manos', defensivo:true},
  {id:'armadura_blanda', label:'Armadura blanda', defensivo:true},
  {id:'armadura_rigida', label:'Armadura rígida', defensivo:true},
  {id:'manos', label:'Manos', defensivo:true},
  {id:'piernas', label:'Piernas', defensivo:true},
  {id:'cabeza', label:'Cabeza', defensivo:true},
  {id:'pies', label:'Pies', defensivo:true},
  {id:'cinturon', label:'Cinturón', defensivo:true},
  {id:'mochila', label:'Mochila', defensivo:true},
  {id:'anillos', label:'Anillos'},
  {id:'otros', label:'Otros'},
  {id:'consumibles', label:'Consumibles'},
];
const CATEGORIA_LABEL = Object.fromEntries(CATEGORIAS.map(c=>[c.id, c.label]));

// Slot de equipamiento, para el filtro por slot del catálogo del
// fabricante. Desde la fusión blando/rígido el tipoItem de cabeza,
// manos, piernas y pies ES directamente el slot.
// Ranuras del equipo: comun/ficha-calculo.js.
const SLOT_MAP = FichaCalculo.SLOT_MAP;
const slotDe = FichaCalculo.slotDe;

const GRUPO_COMPRA_MAP = {
  arma_1m:'armas', arma_2m:'armas',
  escudo_1m:'escudos', escudo_2m:'escudos',
  armadura_blanda:'defensa', armadura_rigida:'defensa',
  manos:'defensa', piernas:'defensa', cabeza:'defensa', pies:'defensa',
  cinturon:'defensa', mochila:'defensa',
  consumibles:'consumibles',
  anillos:'accesorios',
  otros:'otros', '':'otros'
};
const GRUPO_COMPRA_LABEL = {armas:'Armas', escudos:'Escudos', defensa:'Defensa', accesorios:'Accesorios', consumibles:'Consumibles', otros:'Otros'};
const GRUPO_COMPRA_ORDEN = ['consumibles','armas','defensa','escudos','accesorios','otros'];
function grupoCompraDe(tipoItem){ return GRUPO_COMPRA_MAP[tipoItem] || 'otros'; }
const ORDEN_EQUIPO = {
  arma_1m:1, arma_2m:1,
  escudo_1m:2, escudo_2m:2,
  armadura_blanda:3, armadura_rigida:3,
  manos:4, piernas:4, cabeza:4, pies:4,
  cinturon:4, mochila:4,
  anillos:5, otros:5, consumibles:5, '':5,
};
function ordenEquipoDe(i){
  return ORDEN_EQUIPO[i.tipoItem] ?? 5;
}
const ES_ARMA = catId => CATEGORIAS.find(c=>c.id===catId)?.arma === true;
const ES_MANO = catId => ['arma_1m','arma_2m','escudo_1m','escudo_2m'].includes(catId);

const SLOT_DEFS = [
  {id:'cabeza', label:'Cabeza', cats:['cabeza'], max:1},
  {id:'torso_blanda', label:'Armadura blanda', cats:['armadura_blanda'], max:1},
  {id:'torso_rigida', label:'Armadura rígida', cats:['armadura_rigida'], max:1},
  {id:'manos', label:'Manos', cats:['manos'], max:1},
  {id:'manos_arma', label:'Manos (armas y escudos)', cats:['arma_1m','arma_2m','escudo_1m','escudo_2m'], max:2, peso:{arma_1m:1, arma_2m:2, escudo_1m:1, escudo_2m:2}},
  {id:'anillos', label:'Anillos', cats:['anillos'], max:2},
  {id:'pies', label:'Pies', cats:['pies'], max:1},
  {id:'piernas', label:'Piernas', cats:['piernas'], max:1},
  {id:'cinturon', label:'Cinturón', cats:['cinturon'], max:1},
  {id:'mochila', label:'Mochila', cats:['mochila'], max:1},   // un solo cinturón y una sola mochila puestos (2026-09-25)
];
const ATTR_LIST = FichaCalculo.ATTR_LIST;
const MOD_TARGETS = FichaCalculo.MOD_TARGETS;
const STAT_LABEL = FichaCalculo.STAT_LABEL;
const STAT_FULL = FichaCalculo.STAT_FULL;
const ES_ATTR = FichaCalculo.ES_ATTR;

const DEFAULT = {
  meta:{nombre:'', raza:'', clase:'', subclase:'',
        nivel:1, exp:0, dde:0, wildcards:0, wildcardsMax:0, inteligenciaManual:null, spMaxExtra:0, imagen:'', miniatura:''},
  bitacora:[{id:'j1', nombre:'Página 1', texto:''}],
  bitacoraActiva:'j1',
  loot:{normal:0, magico:0, especial:[]},
  attrs:{con:1, fue:1, agl:1, des:1, esp:1},
  // spGastado: SP usado desde la última recarga. nitros: los que quedan en
  // el turno (null = arrancan llenos). ataquesTurno: para cobrar el primer
  // ataque del turno a mitad de precio.
  // ataquesArma: ataques de cada arma en el turno ({idArma|'sin-arma': n});
  // el primero con cada arma cuesta la mitad.
  hp:5, turno:1, log:[], spGastado:0, nitros:null, ataquesTurno:0, ataquesArma:{},
  escalaTipos: ESCALA_TIPOS,  // ver migrarEstadoTipos
  muerto:{activo:false, turnos:5, definitivo:false},
  caps:{mochila:20, cinturon:5},
  armadura:{nota:''},
  spRegenAuto:false,   // ya se pasó la base de SP Regen a la regla por defecto (mitad del Especial); ver migrarEstadoIt2
  formulas:{
    resmg:'con', rescc:'con', hpmax:'con*5',
    dmg:'fue', bloqueo:'fue', crgmax:'fue',
    eva:'agl', ini:'agl', nitros:'agl',
    rng:'des', pdg:'des', crit:'0', critpot:'0', pdgcontra:'0', pdgopor:'0', parry:'des', percepcion:'des',   // crit = Crítico frecuente (2026-09-25): ya no sale de la Destreza, solo lo suman equipo, skills y estados
    pdgmg:'esp', resm:'esp', sp:'esp*3', spregen:'floor(esp/2)', rangocasteo:'esp',
    def:'0', armadmg:'0', tipo1:'0', tipo2:'0', tipo3:'0', tipo4:'0', tipo5:'0', capcinturon:'0', capmochila:'0', luz:'0', veoculto:'0', vision:'6'
  },
  inventario:[],
  cinturon:[],
  habilidades:[],
  pasivas:[],
  sociales:[],
  efectos:[],
  efectosPersonalizados:[],
  invocaciones:[],
  // El catálogo de fábrica vive en comun/catalogo.js (una sola copia para todas las herramientas, paso 5 de
  // docs/plan-subida-unificada.md); lo subido por el grupo se suma desde la biblioteca.
  catalogo: structuredClone(CATALOGO_BASE)
};

let S = structuredClone(DEFAULT);
let openStat = null;

const $ = s => document.querySelector(s);
const uid = () => Math.random().toString(36).slice(2,9);
const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
// El catálogo embebido todavía viene con Bonos/Mov/Acciones (se regenera
// desde datos/catalogo.json): se pasa a SP/Nitros al abrir la ficha.
migrarEstadoIt2(DEFAULT);
migrarEstadoIt2(S);

function fileToDataURL(file, maxDim=480, quality=0.85){
  return new Promise((resolve, reject) => {
    if(!file.type || !file.type.startsWith('image/')){ reject(new Error('no-image')); return; }
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('bad-image'));
      img.onload = () => {
        let w = img.naturalWidth, h = img.naturalHeight;
        if(w > maxDim || h > maxDim){
          if(w >= h){ h = Math.round(h * maxDim / w); w = maxDim; }
          else { w = Math.round(w * maxDim / h); h = maxDim; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#1A1418';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/* =========================================================
   CÁLCULO
   ========================================================= */

/* ---------- Durabilidad (2026-09-26, reglas del dueño en docs/durabilidad.md) ----------
   Armas, escudos y piezas de armadura: 3 puntos de durabilidad por punto de Peso (mínimo 3). Cada ítem guarda `dur` (actual; sin él vale el máximo) y, las piezas de
   armadura, `armRota` (puntos de Armadura rota: cada uno baja 1 la Defensa de ESA pieza y sigue aunque se la saque). Un ítem con 0 de durabilidad está ROTO: ocupa el
   slot pero no aporta ningún efecto (es como si no lo tuvieras equipado). Rompe armadura elige una pieza equipada al azar; un Bloqueo perdido gasta 1 punto del arma o escudo
   con el que se bloqueó. Los creeps y las invocaciones no llevan. */
// Cuánta durabilidad tiene cada ítem es regla común (comun/combatiente.js): 3 por punto de Peso salvo que el ítem traiga su
// propio `durPorPeso` (variable de diseño, 2026-09-30), mínimo 3.
// Qué ítems tienen durabilidad, cuánta les queda y si están rotos: comun/ficha-calculo.js.
const {SLOTS_DURABLES, SLOTS_ARMADURA, durableItem, esArmaduraItem, durMax, durActual, itemRoto, armRotaDe} = FichaCalculo;

// Aviso al quedar en 1 punto y al romperse: cartel y una línea en la Mesa para todos.
function durAviso(i){
  const a = durActual(i), quien = ((S.meta && S.meta.nombre) || '').trim();
  const txt = a <= 0 ? `💥 ${i.nombre} se rompió: sigue ocupando el lugar pero no da ningún efecto hasta que se repare` : a === 1 ? `⚠ ${i.nombre} está a punto de romperse (queda 1 punto de durabilidad)` : '';
  if(!txt) return;
  toast(txt);
  try{ publicarRecordatorios([{nombre: `🔧 ${quien ? quien + ': ' : ''}${txt}`, detalle: ''}]); }catch(e){}
}
function desgastarItem(i, n){
  const antes = durActual(i);
  i.dur = Math.max(0, antes - Math.max(1, n || 1));
  if(durActual(i) !== antes) durAviso(i);
}
// Rompe armadura: una pieza de armadura equipada (que todavía no esté rota) elegida AL AZAR, sin distinguir por ninguna característica.
function rompeArmaduraAlAzar(veces){
  const tocadas = [];
  for(let k = 0; k < Math.max(1, veces || 1); k++){
    const pool = S.inventario.filter(i => i.equipado && esArmaduraItem(i) && durActual(i) > 0);
    if(!pool.length) break;
    const it = pool[Math.floor(Math.random() * pool.length)];
    it.armRota = Math.min(durMax(it), armRotaDe(it) + 1);
    desgastarItem(it, 1);
    tocadas.push(it.nombre);
  }
  if(!tocadas.length){ toast('Rompe armadura: no tenés piezas de armadura equipadas que se puedan romper'); return 0; }
  toast(`💥 Rompe armadura: se dañó ${[...new Set(tocadas)].join(', ')}`);
  renderList('equipo'); renderList('mochila');
  refresh();
  return tocadas.length;
}
function durLineaHtml(i){
  if(!durableItem(i)) return '';
  const max = durMax(i), act = durActual(i), ar = armRotaDe(i);
  const cls = act <= 0 ? 'roto' : act <= 1 ? 'aviso' : '';
  const est = act <= 0 ? ' · ROTO (sin efectos)' : act <= 1 ? ' · a punto de romperse' : '';
  return `<div class="idur ${cls}" title="Durabilidad: ${fmt(Combatiente.durPorPeso(i))} puntos por cada punto de Peso (mínimo ${Combatiente.DUR_MIN}). Reparar solo fuera de combate: herrero (1 de oro por punto) o talento con despojos (2 por punto).">🔧 ${fmt(act)}/${fmt(max)}${ar ? ` · Armadura rota ×${fmt(ar)}` : ''}${est}
    <button class="mini" data-durmod="${i.id}:-1" title="Un punto menos (a mano)">−</button><button class="mini" data-durmod="${i.id}:1" title="Reparar 1 punto (solo fuera de combate)">+</button></div>`;
}

// Los bonos de equipo, pasivas y estados, con su origen: comun/ficha-calculo.js (modsDe).
function collectMods(){ return FichaCalculo.modsDe(S); }

// Cuánto aporta a un stat el equipo puesto en un slot puntual (p.ej.
// 'armadura', para que "Arruina armadura" no toque guantes ni casco).
function aporteSlot(slot, statId){
  return S.inventario.filter(i => i.equipado && slotDe(i.tipoItem) === slot)
    .reduce((a,i) => a + (i.mods||[]).filter(m=>m.stat===statId).reduce((s,m)=>s+num(m.val),0), 0);
}

function evalFormula(expr, ctx){ return FichaCalculo.evalFormula(expr, ctx); }

// Datos de partida de la Calculadora de crítico (comun/critico.js): el Crítico frecuente y potente de este personaje y el Tipo de su arma equipada.
function criticoDatosIniciales(){
  const c = compute();
  const arma = (S.inventario || []).find(i => i.equipado && /^arma/.test(i.tipoItem || '') && [4, 6, 8, 10, 12].includes(num(i.tipoDado)));
  const d = {};
  // El crítico de un arma vale solo para esa arma: con dos equipadas, lo que da la otra no cuenta (statParaArma).
  const cf = statParaArma('crit', arma || null), cp = statParaArma('critpot', arma || null);
  if(!Number.isNaN(cf)) d.frecuente = Math.max(0, Math.round(cf));
  if(!Number.isNaN(cp)) d.potente = Math.max(0, Math.round(cp));
  if(arma) d.tipo = num(arma.tipoDado);
  return d;
}
// Los stats finales del personaje (base + equipo + pasivas + estados, fórmulas, No2 máximo): el cálculo vive en
// comun/ficha-calculo.js (paso 5, nivel B, área 1) y recibe la ficha; acá se le pasa la abierta.
function compute(){ return FichaCalculo.calcular(S); }

// Ranuras para consumibles del cinturón: la base la pone el jugador a mano
// (S.caps.cinturon, como siempre), y el cinturón equipado la puede ampliar
// vía el mod "capcinturon" (ver EFECTOS_PRESET/catálogo — cualquier ítem
// con "Ranuras +N" o "Ranuras para consumibles +N" en el detalle carga
// ese mod).
// La mochila es un slot de equipo (2026-09-25): la base la pone el jugador a mano (S.caps.mochila) y la mochila equipada la amplía con el mod "capmochila".
function capMochilaEfectivo(){
  const bonus = compute().final.capmochila;
  return num(S.caps.mochila) + (Number.isNaN(bonus) ? 0 : bonus);
}
function capCinturonEfectivo(){
  const bonus = compute().final.capcinturon;
  return num(S.caps.cinturon) + (Number.isNaN(bonus) ? 0 : bonus);
}

/* =========================================================
   RENDER
   ========================================================= */

function expThreshold(nivel){
  return Math.max(1, num(nivel) || 1) * 100;
}

function renderExp(){
  $('#v-exp-max').textContent = fmt(expThreshold(S.meta.nivel));
}

function applyExp(rawValue){
  let nivel = Math.max(1, num(S.meta.nivel) || 1);
  let exp = Math.max(0, num(rawValue));
  let subio = false;
  let thr = expThreshold(nivel);
  while(exp >= thr){
    exp -= thr;
    nivel += 1;
    subio = true;
    thr = expThreshold(nivel);
  }
  S.meta.exp = exp;
  S.meta.nivel = nivel;
  if(subio){
    $('#f-exp').value = S.meta.exp;
    $('#f-nivel').value = S.meta.nivel;
    mostrarSubidaNivel(nivel);
  }
  renderExp();
}

/* Pop-up de subida de nivel (también le aparece en el mapa: mira el nivel de su ficha en el resumen). */
function mostrarSubidaNivel(nivel){
  toast(`¡Subiste a nivel ${nivel}!`);
  if(document.documentElement.classList.contains('modo-botonera')) return;   // dentro del mapa, el cartel lo muestra el mapa (mostrarSubidaNivelMapa)
  let cap = document.getElementById('scrim-nivel-nuevo');
  if(!cap){
    cap = document.createElement('div');
    cap.className = 'scrim';
    cap.id = 'scrim-nivel-nuevo';
    cap.style.zIndex = '90';
    cap.innerHTML = '<div class="modal" style="max-width:380px;text-align:center;border-top-color:var(--brass)"><div class="body" style="padding:34px 20px;display:flex;flex-direction:column;align-items:center;gap:14px"><div style="font-size:54px">🎉</div><div style="font-family:Fraunces,serif;font-weight:900;font-size:30px;color:var(--brass)" id="nivel-nuevo-titulo"></div><div style="color:var(--paper)">¡Felicitaciones! Ya podés repartir tus puntos nuevos de atributo y de Job.</div><button class="btn primary" id="nivel-nuevo-ok">¡Genial!</button></div></div>';
    document.body.appendChild(cap);
    cap.querySelector('#nivel-nuevo-ok').onclick = () => cap.classList.remove('open');
    cap.addEventListener('mousedown', e => { if(e.target === cap) cap.classList.remove('open'); });
  }
  cap.querySelector('#nivel-nuevo-titulo').textContent = `¡Subiste al nivel ${nivel}!`;
  cap.classList.add('open');
}

