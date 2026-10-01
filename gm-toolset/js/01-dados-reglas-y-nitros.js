// js/01-dados-reglas-y-nitros.js — tramo 1 de 12 del script de gm-tools.html (paso 5, nivel A: mismo código, en el mismo orden).
const $ = s => document.querySelector(s);
const uid = () => Math.random().toString(36).slice(2,9);
const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
const fmt = n => Number.isInteger(n) ? n : Math.round(n*100)/100;
const esc = s => String(s??'').replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));

/* =========================================================
   DADOS (fórmulas en comun/tiradas.js)
   ========================================================= */


// Toda tirada va a la Mesa (la tirada libre por fórmula también está ahí).
function registrarTirada(origen, r){
  mesaPublicar(origen, r);
  window.dispatchEvent(new CustomEvent('tirada-registrada', {detail: {origen, r}}));   // el duelo (comun/duelo.js) recoge su PdG / Evasión de acá
  registrarEvento(`🎲 ${origen}: ${r.formula} = ${fmt(r.total)}`);
}

/* Historial de la sesión: tiradas y acciones, como en la ficha. Se cuelga
   del toast — todo lo que ya se avisa en pantalla queda anotado sin tener
   que registrarlo a mano en cada lugar. Vive en la pestaña, no se guarda. */
let sesionHistorial = [];

function registrarEvento(texto){
  sesionHistorial.unshift({texto, hora: new Date()});
  sesionHistorial = sesionHistorial.slice(0, 80);
  renderHistorialSesion();
}

function renderHistorialSesion(){
  const el = $('#historial-body');
  if(!el) return;
  el.innerHTML = sesionHistorial.length
    ? sesionHistorial.map(h => `<div>${horaTxt(h.hora)} — ${esc(h.texto)}</div>`).join('')
    : '<div style="opacity:.6">Sin eventos todavía.</div>';
}

/* ---------- Tirar un stat del creep: el motor común (comun/combatiente.js) ---------- */
// Estados que parten la TIRADA a la mitad (Pajaritos, Lisiado, Parálisis, Sentado): comun/combatiente.js, la misma regla que la ficha.
function mitadesDeTirada(estados, statId){ return Combatiente.mitadesDeTirada(estados, statId); }
function aplicarMitades(total, n){ return Combatiente.aplicarMitades(total, n); }
// La tirada de un stat del creep es la misma que la de un personaje o una invocación (comun/combatiente.js): Afortunado
// (dos veces, queda la mejor), mitades y Evasión mínimo 1.
function tirarValorStat(nombre, valor, sc, statId){
  const r = Combatiente.tirarStat(valor, sc ? sc.estados : [], statId);
  if(!r){ toast(`${nombre}: ${fmt(num(valor))} no se puede tirar con dados reales`); return; }
  registrarTirada(nombre, r);
}

const COLORES = ['#C4485A','#D07B3A','#8FB84F','#4FA88C','#9B7BD4','#6FA8D8'];

// Copia liviana (sin imágenes) del catálogo del fabricante de ficha.html,
// solo armas y escudos — para equipar creeps rápido. Si el catálogo de
// ficha.html cambia, esta lista hay que actualizarla a mano.
// El catálogo de fábrica vive en comun/catalogo.js (una sola copia para todas las herramientas); acá se arma la forma que
// usa GM Tools para el equipo de los creeps: sin id, la Defensa separada de los otros bonos (`def`), sin los campos que un
// creep no usa. Misma forma que escribía antes herramientas/catalogo_comun.py (item_gm).
function itemParaCreep(it){
  const arma = it.tipoItem.startsWith('arma_');
  const o = {nombre: it.nombre, tipoItem: it.tipoItem, tier: it.tier, tipoDado: arma ? (it.tipoDado || 0) : 0, danoFijo: arma ? (it.danoFijo || 0) : 0,
    peso: it.peso || 0, precioCompra: it.precioCompra || 0, def: (it.mods || []).filter(m => m.stat === 'def').reduce((a, m) => a + (Number(m.val) || 0), 0)};
  if(arma && it.danoAmplificado) o.danoAmplificado = it.danoAmplificado;
  if(it.durPorPeso) o.durPorPeso = it.durPorPeso;   // durabilidad de diseño (si no es la de siempre)
  if(arma && it.armaDeRango) o.armaDeRango = true;
  if(arma && (it.efectosGolpe || []).length) o.efectosGolpe = structuredClone(it.efectosGolpe);
  if(it.tipoItem === 'consumibles'){ o.consumible = true; if(it.curahp) o.curahp = it.curahp; if(it.legacy) o.legacy = true; }
  const otros = (it.mods || []).filter(m => m.stat !== 'def');
  if(otros.length) o.mods = structuredClone(otros);
  o.detalle = it.detalle || '';
  if(it.descripcionNarrativa) o.descripcionNarrativa = it.descripcionNarrativa;
  return o;
}
const CATALOGO_EQUIPO = CATALOGO_BASE.filter(it => it.tipoItem).map(itemParaCreep);
// Lo subido por el grupo (comun/items-subidos.js), sumado a CATALOGO_EQUIPO en su lugar (se rearma entero desde la fábrica).
let itemsSubidosGM = [];
function cargarItemsSubidosGM(){
  return ItemsSubidos.cargar().then(l => {
    itemsSubidosGM = l;
    const lista = ItemsSubidos.mezclar(structuredClone(CATALOGO_BASE), l).filter(it => it.tipoItem);
    CATALOGO_EQUIPO.splice(0, CATALOGO_EQUIPO.length, ...lista.map(it => ({...itemParaCreep(it), ...(it._bib ? {_bib: it._bib} : {})})));
  });
}
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

// Base para volcar un creep guardado: sin la marca, así uno viejo no la hereda.
function creepBaseGuardado(){
  const base = nuevoCreep();
  delete base.escalaTipos;
  return base;
}

function nuevoCreep(){
  return {
    id: uid(), nombre:'Creep nuevo', imagen:'', nivel:1, color: COLORES[Math.floor(Math.random()*COLORES.length)],
    hp:5, hpMax:5, spd:5,  // Hp.Max = Con*5
    ataquesTurno:0,  // sc.nitros lo pone normalizarCreep: arranca en el máximo (creepNitrosMax)
    con:1, fue:1, agl:1, des:1, esp:1,
    armaTipo:8, armaPeso:1, armaFijo:0, armaAmplificado:0, armaDeRango:false, armaNombre:'', armaDetalle:'',
    armaMods:[], armaEfectos:[], armaManos:'arma_1m',
    defensa:0, armadmg:0, armaduraTipo:'', equipo:[],
    crit:[0,0,0,0,0],
    habilidades:[],
    estados:[],
    notas:'',
    grupo:'', tipoCriatura:'', tipoCriaturaOtro:'', jefe:false, oroBase:0, armaNatural:false, trofeoEspecial:{nombre:'', precio:0},   // recompensas
    escalaTipos: ESCALA_TIPOS,
  };
}

// Biblioteca global de creeps (comun/biblioteca.js): un creep guardado va sin
// imagen, con la vida llena y sin estados pasajeros; al agregarlo a la mesa
// se vuelca sobre la base (como uno cargado de Firebase) con ids nuevos.
// (La limpieza completa es la plantilla `Plantillas.creep`, que aplica Biblioteca.guardar.) Si el creep salió de la
// biblioteca (`bibOrigen`), pregunta si es una corrección de ese o uno nuevo.
function guardarCreepEnBiblioteca(sc, origen){
  const datos = JSON.parse(creepFichaJson(sc));
  delete datos.id;
  delete datos._borrador;
  datos.hp = datos.hpMax;
  datos.nitros = null;
  datos.ataquesTurno = 0;
  datos.estados = (datos.estados || []).filter(es => es && es.permanente);
  const o = origen || sc.bibOrigen;
  Biblioteca.guardar({tipo: 'creeps', datos, nombre: sc.nombre, nivel: sc.nivel, grupos: CREEPS_GRUPOS, base: typeof CREEPS_BASE !== 'undefined' ? CREEPS_BASE : [],
    basadoEn: o && o.id ? {id: o.id, nombre: sc.nombre} : null,
    alSubir: r => { if(!sc._borrador){ sc.bibOrigen = {tipo: 'creeps', id: r.id, version: r.version}; delete sc.bibIgnorada; } cargarCreepsSubidos(); }});
}

/* 🔔 Versión nueva de un creep (subida unificada, paso 3): los creeps agregados desde la biblioteca guardan de dónde
   salieron (`bibOrigen`); si alguien corrige el original, la tarjeta muestra 🔔 y se puede actualizar sin perder lo del
   combate (vida, estados, grupo, imagen). Lo subido se lee al entrar y cada vez que se abre "+ Creep". */
let creepsSubidos = [];
function cargarCreepsSubidos(){
  if(typeof Biblioteca === 'undefined' || !Biblioteca.lista) return Promise.resolve();
  return Biblioteca.lista('creeps').then(l => { creepsSubidos = l; renderAll(); }).catch(() => {});
}
const versionNuevaDeCreep = sc => typeof Biblioteca !== 'undefined' && Biblioteca.versionNueva ? Biblioteca.versionNueva(creepsSubidos, sc.bibOrigen, sc.bibIgnorada) : null;
function actualizarCreepDesdeBib(sc, e){
  const d = Plantillas.creep(e.datos);
  const combate = {id: sc.id, imagen: sc.imagen, grupo: sc.grupo, color: sc.color, estados: sc.estados, hp: sc.hp, nitros: sc.nitros,
    ataquesTurno: sc.ataquesTurno, recompensado: sc.recompensado};
  Object.assign(sc, d, combate);
  sc.habilidades = (d.habilidades || []).map(h => ({...h, id: uid(), cdActual: h.cdArranca ? num(h.cd) : 0}));
  sc.equipo = (d.equipo || []).map(it => ({...it, id: uid()}));
  sc.hp = Math.min(num(sc.hp), num(sc.hpMax));
  sc.bibOrigen = {tipo: 'creeps', id: e.id, version: e.version || 1};
  delete sc.bibIgnorada;
}
function abrirVersionNuevaCreep(sc){
  const e = versionNuevaDeCreep(sc);
  if(!e) return;
  Biblioteca.avisoVersion({nombre: sc.nombre, entrada: e, que: 'El creep', dejarTxt: 'Dejar el mío',
    actualizarTxt: 'cambia sus atributos, arma, equipo y habilidades por los nuevos; se quedan su vida (con el tope del máximo nuevo), sus estados, su grupo y su imagen.',
    alActualizar: () => { actualizarCreepDesdeBib(sc, e); toast(`${sc.nombre} actualizado a la versión ${fmt(e.version || 1)}`); renderAll(); },
    alDejar: () => { sc.bibIgnorada = e.id + ':' + (e.version || 1); renderAll(); }});
}

function agregarCreepDeBiblioteca(datos, meta){
  const sc = Object.assign(creepBaseGuardado(), datos, {id: uid(), imagen: '', grupo: grupoParaNuevo()});
  if(meta && meta.id) sc.bibOrigen = {tipo: 'creeps', id: meta.id, version: meta.version || 1};
  sc.habilidades = (sc.habilidades || []).map(h => ({...h, id: uid(), cdActual: h.cdArranca ? num(h.cd) : 0}));
  sc.estados = (sc.estados || []).map(es => ({...es, id: uid()}));
  sc.equipo = (sc.equipo || []).map(it => ({...it, id: uid()}));
  S.creeps.push(sc);
  renderAll();
  toast(`${sc.nombre} agregado a la mesa`);
}

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

let S = { turno:1, creeps:[] };

function danoTxt(sc, extra){
  const dados = Math.max(1, num(sc.armaPeso)||1) + Math.max(0, num(sc.armaAmplificado));
  const tipo = num(sc.armaTipo)||8;
  const fijo = num(sc.armaFijo) + (sc.armaDeRango ? 0 : num(extra));
  return `${dados}d${tipo}${fijo?` + ${fmt(fijo)}`:''}`;
}

// Lo que el creep tiene puesto y da bonos: su equipo y su arma (sc.armaMods).
function fuentesEquipoCreep(sc){
  const arma = (sc.armaMods || []).length ? [{nombre: sc.armaNombre || 'Arma', mods: sc.armaMods}] : [];
  return [...(sc.equipo || []), ...arma];
}

// Suma los modificadores que apuntan a un stat puntual, vengan del equipo
// puesto o de estados activos — mismo criterio que collectMods()+modTotal
// en ficha.html, para que un ítem con "bloqueo +N" o un estado que suba
// Fuerza afecten al creep de verdad y no solo la Res. a crítico.
function creepModTotal(sc, statId){
  let total = 0;
  fuentesEquipoCreep(sc).forEach(it => (it.mods||[]).forEach(m => { if(m.stat === statId) total += num(m.val); }));
  (sc.estados||[]).forEach(es => {
    if(es.activo === false) return;
    const stacks = Math.max(1, num(es.stacks)||1);
    (es.mods||[]).forEach(m => { if(m.stat === statId) total += num(m.val) * stacks; });
  });
  return total;
}

// Armadura rota activa reduce la Defensa — igual que en ficha.html.
function creepEstadosArmadura(sc){
  const activos = (sc.estados||[]).filter(e => e.activo !== false);
  return {
    rota: activos.filter(e => e.armaduraRota).reduce((a, e) => a + Math.max(1, num(e.stacks) || 1), 0),  // puntos de Defensa que quita
  };
}
function creepAporteArmadura(sc, statId){
  return (sc.equipo||[]).filter(it => slotDeGM(it.tipoItem) === 'armadura')
    .reduce((a,it) => a + (statId === 'def' ? num(it.def) : (it.mods||[]).filter(m=>m.stat===statId).reduce((s,m)=>s+num(m.val),0)), 0);
}
function creepDefensaEfectiva(sc){
  const {rota} = creepEstadosArmadura(sc);
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
function creepArmadmgEfectiva(sc){
  return Math.max(0, num(sc.armadmg) + creepModTotal(sc, 'armadmg'));
}
function armadmgOrigenTxt(sc){
  const L = [];
  let deItems = 0;
  fuentesEquipoCreep(sc).forEach(it => {
    const v = (it.mods || []).filter(m => m.stat === 'armadmg').reduce((a, m) => a + num(m.val), 0);
    if(!v) return;
    deItems += v;
    L.push(`${conSigno(v)} por ${it.nombre || '(sin nombre)'}`);
  });
  const resto = num(sc.armadmg) - deItems;
  if(resto || !L.length) L.push(`${conSigno(resto)} base (cargada a mano)`);
  L.push(`= ${fmt(creepArmadmgEfectiva(sc))}`);
  return L.join('\n');
}
function creepCritEfectivo(sc, i){
  return num(sc.crit[i]);
}
/* Stats secundarios de los creeps: los mismos que un PJ, cada uno sale de
   su atributo (fórmula base = el atributo) + mods (ver creepStatValor).
   Hp.Max y No2 ya se ven arriba; Crg.Max y SP no aplican a los creeps. */
const CREEP_DERIVADOS_POR_ATTR = {
  con: [['resmg', 'Res.Esp'], ['rescc', 'Res.CC']],
  fue: [['dmg', 'Dmg'], ['bloqueo', 'Bloqueo']],
  agl: [['eva', 'Eva'], ['ini', 'Iniciativa']],
  des: [['rng', 'Rng'], ['pdg', 'PdG'], ['crit', 'Crít.Frec.'], ['critpot', 'Crít.Pot.'], ['parry', 'Parry'], ['percepcion', 'Percep.']],
  esp: [['pdgmg', 'PdG.Esp'], ['resm', 'Res.Mt'], ['rangocasteo', 'Rango Cast.']],
};
const ATTR_NOMBRE = {con:'Constitución', fue:'Fuerza', agl:'Agilidad', des:'Destreza', esp:'Especial'};

// De dónde sale un stat secundario: su atributo y lo que lo modifica.
function statOrigenTxt(sc, statId, label){
  const attr = CREEP_STAT_LOOKUP[statId].attr;
  const L = [`${ATTR_NOMBRE[attr]} base: ${fmt(num(sc[attr]))}`];
  aportesModCreep(sc, attr).forEach(a => L.push(`${conSigno(a.val)} ${ATTR_NOMBRE[attr]} por ${a.nombre}`));
  aportesModCreep(sc, statId).forEach(a => L.push(`${conSigno(a.val)} ${label} por ${a.nombre}`));
  if((statId === 'pdg' || statId === 'eva') && creepEstadoActivo(sc, 'mitadPdgEva')) L.push('Pajaritos: a la mitad');
  if((statId === 'pdg' || statId === 'parry') && creepEstadoActivo(sc, 'lisiado')) L.push('Lisiado: a la mitad');
  if(['pdg', 'parry', 'eva'].includes(statId) && creepEstadoActivo(sc, 'paralisis')) L.push('Parálisis: a la mitad');
  L.push(`= ${fmt(creepStatValor(sc, statId))}`);
  return L.join('\n');
}

function creepEstadoActivo(sc, flag){
  return (sc.estados || []).some(e => e.activo !== false && e[flag]);
}

function derivadosHtml(sc, attr){
  return `<div class="derivados">${CREEP_DERIVADOS_POR_ATTR[attr].map(([id, label]) => `
    <div class="derivado con-tip" data-deriv="${id}" data-tip="${esc(statOrigenTxt(sc, id, label))}">
      <span>${label}</span><b>${fmt(creepStatValor(sc, id))}</b>
    </div>`).join('')}</div>`;
}

// Al tipear un atributo no se redibuja la tarjeta: se refrescan sus secundarios acá.
function actualizarDerivadosEnDOM(sc, card){
  if(!card) return;
  card.querySelectorAll('[data-deriv]').forEach(el => {
    const id = el.dataset.deriv;
    const par = Object.values(CREEP_DERIVADOS_POR_ATTR).flat().find(([x]) => x === id);
    el.querySelector('b').textContent = fmt(creepStatValor(sc, id));
    el.dataset.tip = statOrigenTxt(sc, id, par ? par[1] : id);
  });
}

// Cada fuente (equipo o estado activo) que le suma a un stat, con su valor.
function aportesModCreep(sc, statId){
  const out = [];
  fuentesEquipoCreep(sc).forEach(it => {
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
const conSigno = v => `${v > 0 ? '+' : ''}${fmt(v)}`;

// Ataque = daño del arma + Fuerza (Dmg), el mismo que tira "Daño Arma".
function ataqueCreepTxt(sc){
  return danoTxt(sc, creepStatValor(sc, 'dmg'));
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
    aportesModCreep(sc, 'fue').forEach(a => L.push(`${conSigno(a.val)} Fuerza por ${a.nombre}`));
    aportesModCreep(sc, 'dmg').forEach(a => L.push(`${conSigno(a.val)} Daño por ${a.nombre}`));
  }
  L.push(`= ${ataqueCreepTxt(sc)}`);
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
  const {rota} = creepEstadosArmadura(sc);
  if(rota) L.push(`Armadura rota: -${rota} de Defensa`);
  L.push(`= ${fmt(creepDefensaEfectiva(sc))}`);
  return L.join('\n');
}

// De dónde sale una resistencia a crítico (i = 0..4 → Tipo 4..12): lo que
// da cada pieza de equipo (se suma a sc.crit al equiparla), el resto cargado
// a mano, y si la armadura está rota o arruinada (ver creepCritEfectivo).
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
  L.push(`= ${conSigno(creepCritEfectivo(sc, i))}`);
  return L.join('\n');
}

function creepArmaduraOrigenTxt(sc){
  const activos = (sc.estados||[]).filter(e => e.activo !== false && e.armaduraRota);
  const nombres = activos.map(e => e.nombre || '(sin nombre)').join(', ');
  return `Reducido por: ${nombres || 'estado activo'}`;
}

// Nombres de los estados activos que aportan un mod a ese stat, para
// poder mostrar "de dónde sale" al tocar el indicador +/-.
function origenesModCreep(sc, statId){
  const deEquipo = fuentesEquipoCreep(sc)
    .filter(it => (it.mods||[]).some(m => m.stat === statId))
    .map(it => it.nombre || '(sin nombre)');
  const deEstados = (sc.estados||[])
    .filter(es => es.activo !== false && (es.mods||[]).some(m => m.stat === statId))
    .map(es => es.nombre || '(sin nombre)');
  return [...deEquipo, ...deEstados];
}

function attrCellHtml(sc, a){
  const mod = creepModTotal(sc, a);
  const cls = mod>0 ? 'mod-plus' : mod<0 ? 'mod-minus' : '';
  const origenes = mod ? origenesModCreep(sc, a) : [];
  const texto = `Base ${fmt(num(sc[a]))} ${mod>0?'+':''}${fmt(mod)}${origenes.length?` por ${esc(origenes.join(', '))}`:''}`;
  return `<div class="mini-f">
    <label>${ATTR_LABELS[a]}${mod ? ` <button type="button" class="mod-origen-btn ${cls}" data-modorigen="${esc(texto)}">${mod>0?'+':''}${fmt(mod)}</button>` : ''}</label>
    <input type="number" class="${cls}" data-attr="${a}" data-id="${sc.id}" data-attrmod="${mod}" value="${fmt(num(sc[a])+mod)}">
  </div>`;
}

/* =========================================================
   REGLAS DEL JUEGO (tomadas de ficha.html)
   Hp.Max = Con*5. Acciones máx. = 3 (constante, no por nivel).
   Puntos de atributo = 33 + 3*(nivel-1), repartidos entre
   con/fue/agl/des/esp. Acá son guías informativas para el
   máster, no bloquean nada — un creep puede romper la regla
   a propósito.
   ========================================================= */

// ¿Estos modificadores cambian el Hp.Max? (Con, o Hp.Max directo)
function modsAfectanHp(mods){
  return (mods || []).some(m => m.stat === 'con' || m.stat === 'hpmax');
}

// Recalcula hpMax = con*5 + mods de Hp.Max (con efectivo; equipo y estados
// incluidos, igual que en la ficha) cuando cambia con o algo que da Hp.Max.
// Si el creep estaba a HP lleno lo deja lleno; si no, sólo recorta hp si se
// pasa del nuevo máximo. Después el máster puede seguir editando hp/hpMax a
// mano hasta el próximo recálculo.
function actualizarHpMaxPorCon(sc){
  const conEfectivo = num(sc.con) + creepModTotal(sc, 'con');
  const nuevoHpMax = Math.max(0, conEfectivo * 5 + creepModTotal(sc, 'hpmax'));
  const estabaFull = num(sc.hp) >= num(sc.hpMax);
  sc.hpMax = nuevoHpMax;
  sc.hp = estabaFull ? nuevoHpMax : Math.min(num(sc.hp), nuevoHpMax);
}

/* El HP acepta "+10" o "-5" además de un número fijo, igual que la ficha:
   en combate se anota lo que pegó, no el total. Se guarda el valor al
   entrar al campo para poder sumarle el delta al salir o con Enter. */
const deltaBase = new WeakMap();

function resolverDeltaHp(input){
  const sc = S.creeps.find(s => s.id === input.dataset.id);
  if(!sc) return;
  const crudo = (input.value || '').trim();
  const m = crudo.match(/^([+-])\s*(\d+(?:[.,]\d+)?)$/);
  const base = deltaBase.has(input) ? deltaBase.get(input) : num(sc.hp);
  let val;
  if(m){
    val = base + parseFloat(m[2].replace(',', '.')) * (m[1] === '-' ? -1 : 1);
  }else if(/^-?\d+(?:[.,]\d+)?$/.test(crudo)){
    val = parseFloat(crudo.replace(',', '.'));
  }else{
    // Ni delta ni número: fue un error de tipeo. Se deja el HP como estaba
    // en vez de mandarlo a 0, que en combate mataría al creep de una.
    input.value = fmt(base);
    return;
  }
  // El HP del creep es lo que más se toca en combate: queda anotado con
  // el antes y el después, que es lo que después uno quiere reconstruir.
  const previo = num(sc.hp);
  if(val !== previo){
    const dif = val - previo;
    registrarEvento(`${sc.nombre || 'Creep'}: ${fmt(previo)} → ${fmt(val)} HP (${dif > 0 ? '+' : ''}${fmt(dif)})`);
  }
  sc.hp = val;
  input.value = fmt(val);
  deltaBase.set(input, val);
  // renderAll redibuja la tarjeta entera: badge de muerte, barra y todo.
  renderAll();
}

/* Daño entrante del creep: se escribe el golpe crudo y se le descuenta la
   Defensa efectiva — la que ya tiene en cuenta si la armadura está rota
   (mitad) o arruinada (cero). Resta plana con piso en 0, igual que la ficha. */
function aplicarDanioCreep(input){
  const sc = S.creeps.find(s => s.id === input.dataset.danocreep);
  if(!sc) return;
  const crudo = (input.value || '').trim();
  if(!crudo) return;
  if(!/^\d+(?:[.,]\d+)?$/.test(crudo)){
    toast('Escribí el daño del golpe, sin signo — la Defensa se resta sola');
    input.value = '';
    return;
  }
  const golpe = parseFloat(crudo.replace(',', '.'));
  const activos = (sc.estados||[]).filter(e => e.activo !== false);

  if(activos.some(e => e.invulnerable)){
    input.value = '';
    toast(`${sc.nombre || 'Creep'}: Invulnerable, el golpe de ${fmt(golpe)} no hizo nada`);
    return;
  }

  const defensa = creepDefensaEfectiva(sc);
  let recibido = Math.max(0, golpe - defensa);

  const capas = activos.filter(e => (e.escudoMagicoActual !== undefined || num(e.escudoMagico) > 0) && num(e.escudoMagicoActual ?? e.escudoMagico) > 0)
    .sort((a, b) => (a.excedenteVida ? 1 : 0) - (b.excedenteVida ? 1 : 0));   // primero los escudos, al final el excedente de vida
  let absorbido = 0;
  const detalleAbs = [];
  capas.forEach(c => {
    if(recibido <= 0) return;
    const actual = num(c.escudoMagicoActual ?? c.escudoMagico), tomado = Math.min(recibido, actual);
    c.escudoMagicoActual = actual - tomado;
    if(c.excedenteVida) c.escudoMagico = c.escudoMagicoActual;   // valor neto: no hay máximo
    absorbido += tomado; recibido -= tomado;
    detalleAbs.push(`${c.nombre} absorbió ${fmt(tomado)}${c.escudoMagicoActual ? ` (quedan ${fmt(c.escudoMagicoActual)}${c.excedenteVida ? '' : '/' + fmt(c.escudoMagico)})` : ' (se agotó)'}`);
  });

  const previo = num(sc.hp);
  sc.hp = previo - recibido;
  input.value = '';

  const extra = [];
  detalleAbs.forEach(d => extra.push(d));
  const sufijo = extra.length ? ` · ${extra.join(' · ')}` : '';

  if(recibido <= 0){
    toast(`${sc.nombre || 'Creep'}: golpe de ${fmt(golpe)} · Defensa ${fmt(defensa)} lo frenó entero${sufijo}`);
  }else{
    toast(`${sc.nombre || 'Creep'}: ${fmt(golpe)} − Defensa ${fmt(defensa)} = ${fmt(recibido)} de daño (${fmt(previo)} → ${fmt(sc.hp)} HP)${sufijo}`);
  }
  renderAll();
}

document.addEventListener('keydown', e => {
  const i = e.target;
  if(e.key === 'Enter' && i.dataset && i.dataset.danocreep){
    e.preventDefault();
    aplicarDanioCreep(i);
    i.blur();
  }
});

document.addEventListener('focusin', e => {
  const i = e.target;
  if(i.dataset && i.dataset.f === 'hp' && i.dataset.id){
    deltaBase.set(i, num(i.value));
    i.select();
  }
});

document.addEventListener('keydown', e => {
  const i = e.target;
  if(e.key === 'Enter' && i.dataset && i.dataset.f === 'hp' && i.dataset.id){
    e.preventDefault();
    resolverDeltaHp(i);
    i.blur();
  }
});

document.addEventListener('focusout', e => {
  const i = e.target;
  if(i.dataset && i.dataset.f === 'hp' && i.dataset.id) resolverDeltaHp(i);
});

function actualizarVitalesEnDOM(sc, card){
  if(!card) return;
  const inHp = card.querySelector('[data-f="hp"]');
  const inHpMax = card.querySelector('[data-f="hpMax"]');
  if(inHp) inHp.value = fmt(sc.hp);
  if(inHpMax) inHpMax.value = fmt(sc.hpMax);
}

// Nitros: mismo criterio que actualizarHpMaxPorCon (si estaba lleno, el
// nuevo máximo por Agilidad también queda lleno; si no, solo se recorta
// si se pasa) — pero acá no hay un "sc.nitrosMax" guardado, así que el
// "antes" se toma llamando a creepNitrosMax() antes de tocar sc.agl.
function actualizarNo2PorAgl(sc, antes){
  if(sc.nitros === null || sc.nitros === undefined) return;  // todavía no se solidificó: arranca lleno solo
  const nuevoMax = creepNitrosMax(sc);
  sc.nitros = antes.full ? nuevoMax : Math.min(num(sc.nitros), nuevoMax);
}
function actualizarNo2EnDOM(sc, card){
  if(!card) return;
  const inNo2 = card.querySelector('[data-f="nitros"]');
  if(inNo2){
    inNo2.value = fmt(num(sc.nitros));
    const max = inNo2.closest('.vn');
    if(max) max.querySelector('.vmax').textContent = '/ ' + fmt(creepNitrosMax(sc));
  }
}

function attrBudgetCreep(sc){
  const nivel = Math.max(1, num(sc.nivel) || 1);
  const total = 33 + 3 * (nivel - 1);
  const usado = ATTR_IDS.reduce((a,id) => a + num(sc[id]), 0);
  return {total, usado, pend: total - usado};
}
function attrBudgetTxt(sc){
  const b = attrBudgetCreep(sc);
  return `${fmt(b.usado)}/${fmt(b.total)}${b.pend<0?` · +${fmt(Math.abs(b.pend))} de más`:''}`;
}
function attrBudgetStyle(sc){
  const over = attrBudgetCreep(sc).pend < 0;
  return `font-family:'Space Mono',monospace;font-size:9px;letter-spacing:0;text-transform:none;color:${over?'var(--danger)':'var(--muted)'}`;
}
function actualizarBadgePresupuesto(sc, card){
  if(!card) return;
  const badge = card.querySelector('.attr-budget-badge');
  if(!badge) return;
  badge.textContent = attrBudgetTxt(sc);
  badge.setAttribute('style', attrBudgetStyle(sc));
}

/* =========================================================
   NITROS (No2) de los creeps — mismas reglas que la ficha (bloque IT2 de
   ficha.html). Reemplazan a las Acciones: el máximo es Agilidad efectiva
   + mods de No2 (los viejos de Movimiento y Acciones máx. cuentan como
   No2, igual que en la ficha) y se recargan en cada Mantenimiento.
   sc.nitros = los que le quedan en el turno; sc.ataquesTurno = ataques
   hechos desde el último Mantenimiento.
   ========================================================= */
const IT2_CREEP = {
  nitrosHabilidad: 1,            // costo por defecto de una habilidad (el de atacar es Combatiente.costoAtaque)
};
// Moverse no está acá: lo cobra el mapa al arrastrar el token del creep
// (1 No2 por casillero, 2 con Rengo, nada con Inmovilizado).

function creepNitrosMax(sc){
  // Natural = Agilidad efectiva + bonos a Nitros (los viejos de Movimiento y Acciones máx. cuentan como No2); los estados
  // (Cansado, Hypeado, Exhausto, Stun) los aplica el motor común (comun/combatiente.js), igual que a personajes e invocaciones.
  return Combatiente.nitrosMax(num(sc.agl) + creepModTotal(sc, 'agl') + creepModTotal(sc, 'nitros') + creepModTotal(sc, 'mov') + creepModTotal(sc, 'accionesmax'), sc.estados);
}

// Nitros de una habilidad: un número, o "ATAQUE" = lo que le cuesta un
// ataque con su arma (Tipo ÷ 2 el primero del turno) y cuenta como ese ataque.
function habCreepAtaque(h){ return String((h && h.nitrosCosto) ?? "").trim().toUpperCase() === "ATAQUE"; }
function costoNitrosHabCreep(sc, h){ return Combatiente.costoNitrosHab(h, () => costoAtaqueCreep(sc), IT2_CREEP.nitrosHabilidad); }   // comun/combatiente.js
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
function costoHabCreepTxt(sc, h){
  const n = costoNitrosHabCreep(sc, h);
  if(habCreepAtaque(h)) return `${fmt(n)} No2 (como un ataque)`;
  return n ? `${fmt(n)} No2` : "sin costo";
}

// Primer ataque del turno: Tipo ÷ 2 (redondeado para arriba); los demás, Tipo completo.
// Parry y Bloqueo de un creep (2026-09-24, pedido del dueño; igual que en la ficha): el Parry cuesta 1 No2 (2026-09-26; antes el Peso de su arma);
// el Bloqueo suma su Bloqueo + el Peso del arma y ESA SUMA es el dado.
function pesoArmaCreep(sc){ return Math.max(1, num(sc.armaPeso) || 1); }
function costoParryCreep(sc){ return Combatiente.costoParry(); }   // siempre 1 No2, sin importar el arma (comun/combatiente.js)
// Con qué para el creep (Parry y Bloqueo): su arma si no es natural, si no un escudo de su equipo; null = no puede
// (regla del dueño 2026-09-30, comun/combatiente.js). El Bloqueo suma el peso de eso.
function defensaCreep(sc){
  if(!sc) return null;
  return Combatiente.armaParaDefensa({arma: sc.armaNombre ? {nombre: sc.armaNombre, peso: pesoArmaCreep(sc)} : null, natural: sc.armaNatural,
    escudos: (sc.equipo || []).filter(it => slotDeGM(it.tipoItem) === 'escudo').map(it => ({nombre: it.nombre, peso: num(it.peso)}))});
}
function bloqueoValorCreep(sc){ const d = defensaCreep(sc); return creepStatValor(sc, 'bloqueo') + (d ? num(d.peso) : 0); }
// Creeps con un Parry esperando su Bloqueo: el Bloqueo solo existe después de un Parry (regla del dueño, 2026-09-30).
// Se limpia al bloquear, atacar, en el Mantenimiento y al reiniciar el combate. El duelo no lo necesita (ya sabe si ganó el Parry).
const parryPendienteCreep = new Set();
// Fuerza del golpe (reglas del escudo, 2026-09-26): la tirada del atacante contra el Bloqueo del defensor = su Fuerza (con los estados activos) + el peso de su arma; la SUMA es el dado.
function fuerzaGolpeValorCreep(sc){ return num(sc.fue) + (sc.estados || []).filter(e => e.activo !== false).reduce((a, e) => a + (e.mods || []).filter(m => m.stat === 'fue').reduce((x, m) => x + num(m.val) * Math.max(1, num(e.stacks) || 1), 0), 0) + pesoArmaCreep(sc); }
// Contraataque (regla a prueba, 2026-09-26): tras un Parry, siempre cuesta lo de un primer ataque y no suma al conteo de ataques del turno.
function costoContraataqueCreep(sc){ return Combatiente.costoPrimerAtaque(num(sc.armaTipo) || 8); }   // regla común (comun/combatiente.js)
// Menú de Atacar del creep (2026-09-26, pedido del dueño): Ataque normal / Ataque de oportunidad / Contraataque. Normal: el primero del turno cuesta Tipo ÷ 2 y los siguientes el Tipo completo;
// oportunidad y contraataque siempre cuestan Tipo ÷ 2 y no suman al conteo de ataques del turno.
function atacarNormalCreep(sc){
  if((sc.estados || []).some(e => e.activo !== false && e.sentado) && !confirm(`${sc.nombre} está Sentado y no puede atacar. ¿Atacar igual?`)) return;
  const costo = costoAtaqueCreep(sc);
  if(costo > num(sc.nitros)){
    toast(`${sc.nombre}: no le alcanzan los No2 — este ataque cuesta ${fmt(costo)} y tiene ${fmt(num(sc.nitros))}`);
    return;
  }
  const primero = num(sc.ataquesTurno) === 0;
  sc.nitros = num(sc.nitros) - costo;
  sc.ataquesTurno = num(sc.ataquesTurno) + 1;
  parryPendienteCreep.delete(sc.id);   // atacar cierra el Parry que esperaba su Bloqueo
  renderAll();
  const pdg = creepStatValor(sc, 'pdg');
  tirarValorStat(`${sc.nombre} · PdG`, pdg, sc, 'pdg');
  toast(`${sc.nombre}: −${fmt(costo)} No2 · ${primero ? 'primer ataque del turno' : `ataque ${fmt(sc.ataquesTurno)} del turno`} · quedan ${fmt(sc.nitros)}`);
}
function ataqueEspecialCreep(sc, tipo){
  const nombre = tipo === 'oportunidad' ? 'Ataque de oportunidad' : 'Contraataque', costo = costoContraataqueCreep(sc);
  if(costo > num(sc.nitros)){
    toast(`${sc.nombre}: no le alcanzan los No2 — el ${nombre.toLowerCase()} cuesta ${fmt(costo)} y tiene ${fmt(num(sc.nitros))}`);
    return;
  }
  sc.nitros = num(sc.nitros) - costo;
  renderAll();
  const bonoContra = (sc.armaMods || []).filter(m => m.stat === (tipo === 'contra' ? 'pdgcontra' : tipo === 'oportunidad' ? 'pdgopor' : '')).reduce((a, m) => a + num(m.val), 0);   // PdG en contraataque de su arma
  tirarValorStat(`${sc.nombre} · ${nombre} (PdG)`, creepStatValor(sc, 'pdg') + bonoContra, sc, 'pdg');
  toast(`${sc.nombre}: ${nombre.toLowerCase()} −${fmt(costo)} No2 (lo de un primer ataque)${bonoContra ? ` · PdG +${fmt(bonoContra)} por ${tipo === 'contra' ? 'contraataque' : 'oportunidad'}` : ''} · quedan ${fmt(sc.nitros)}`);
}
function preguntarTipoAtaqueCreep(sc){
  const normal = costoAtaqueCreep(sc), primero = num(sc.ataquesTurno) === 0, especial = costoContraataqueCreep(sc);
  $('#tipo-ataque-creep-lista').innerHTML = `<div class="hint">${esc(sc.nombre)}</div>
    <button class="btn" data-tipoataquecreep="normal:${sc.id}" style="width:100%">⚔ Ataque normal — ${fmt(normal)} No2<br><span class="hint">${primero ? 'primer ataque del turno (Tipo ÷ 2)' : 'Tipo completo (ya atacó este turno)'}</span></button>
    <button class="btn" data-tipoataquecreep="oportunidad:${sc.id}" style="width:100%">🏃 Ataque de oportunidad — ${fmt(especial)} No2<br><span class="hint">siempre Tipo ÷ 2; no suma al conteo de ataques</span></button>
    <button class="btn" data-tipoataquecreep="contra:${sc.id}" style="width:100%">↩ Contraataque — ${fmt(especial)} No2<br><span class="hint">tras un Parry; siempre Tipo ÷ 2; no suma al conteo de ataques</span></button>`;
  $('#scrim-tipo-ataque-creep').classList.add('open');
}
function costoAtaqueCreep(sc){ return Combatiente.costoAtaque(num(sc.armaTipo) || 8, sc.ataquesTurno); }   // regla común (comun/combatiente.js)

// Por qué no se puede ejecutar una habilidad ahora ('' = se puede).
// Cooldown de una habilidad de creep, a mano (2026-09-24, pedido del dueño): el GM puede subirlo, bajarlo o resetearlo en cualquier
// momento, por ejemplo después de ejecutar una habilidad para probar algo. − y + cambian los turnos que le quedan; ↺ (solo con
// cooldown activo) lo deja en 0.
function cdControlesHtml(sc, h){
  const v = Math.max(0, num(h.cdActual));
  const ref = `${sc.id}:${h.id}`;
  return `<span class="cd-ctl" title="Cooldown: turnos que le quedan a esta habilidad">
    <button type="button" data-cdmod="${ref}:-1" title="Un turno menos de cooldown">−</button>
    <span class="cd-val${v > 0 ? ' activo' : ''}">CD ${fmt(v)}</span>
    <button type="button" data-cdmod="${ref}:1" title="Un turno más de cooldown">+</button>
    ${v > 0 ? `<button type="button" data-cdmod="${ref}:reset" title="Resetear el cooldown (queda listo para usarse)">↺</button>` : ''}
  </span>`;
}

/* Tres modos de ejecución (2026-09-30, los mismos que en la ficha — ver MODOS_HAB en ficha-personaje/ficha.html): 'manual'
   (📣 Anunciar: solo el texto, no cobra ni pone cooldown), 'semi' (💰 cobra No2 y cooldown, tira la tirada inicial; los efectos
   van a mano) y 'auto' (✨ la Ejecución paso a paso, `h.duelo`). Las de antes lo deducen: automatizada === false → manual, con
   `duelo` → auto, el resto → semi. Lo del sistema anterior (estado propio, cura, trampa al lado del token, estado sobre el
   objetivo de las habilidades de fábrica) se sigue aplicando en semi y en auto. */
const MODOS_HAB_CREEP = {
  manual: {icono: '📣', nombre: 'Manual', boton: 'Anunciar', corto: 'solo se anuncia', explica: 'El botón se llama <b>Anunciar</b>: publica la descripción en la Mesa y todo lo demás (costo, cooldown, tiradas y efectos) va a mano.'},
  semi: {icono: '💰', nombre: 'Semiautomático', boton: 'Ejecutar', corto: 'cobra No2 y cooldown, tira la tirada inicial', explica: 'Al tocar <b>Ejecutar</b> cobra solo los <b>No2</b> y pone el <b>cooldown</b>, y <b>tira la tirada inicial</b> si la tiene (por lo general, la PdG). Los efectos se resuelven a mano.'},
  auto: {icono: '✨', nombre: 'Automático', boton: 'Ejecutar', corto: 'ejecución paso a paso', explica: 'Al tocar <b>Ejecutar</b> se abre la <b>Ejecución paso a paso</b>: cobra, elegís el objetivo en el mapa, cada uno tira en su momento y se aplican los efectos. Si es solo sobre el creep y no tira nada, se aplica directo. Si coloca una trampa, elegís la casilla en el mapa (los jugadores no se enteran).'},
};
function modoHabCreep(h){ return Combatiente.modoHab(h, h && h.duelo && typeof h.duelo === 'object' ? h.duelo : null); }   // la regla común
const botonHabCreepTxt = h => modoHabCreep(h) === 'manual' ? 'Anunciar' : 'Ejecutar';
function etiquetaModoCreep(h){ const m = MODOS_HAB_CREEP[modoHabCreep(h) || 'semi']; return `<span class="tag" title="${esc(m.nombre)}: ${esc(m.corto)}">${m.icono}</span>`; }
// ¿Se puede usar ahora? La regla común (P133): cooldown, No2 y vida (una 📣 manual no cobra nada).
function bloqueoHabCreep(sc, h){ return Combatiente.bloqueoHab(h, {modo: modoHabCreep(h), nitros: sc.nitros, costo: costoNitrosHabCreep(sc, h), hp: sc.hp}); }

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
function normalizarCreep(sc){
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
  if(typeof sc.grupo !== 'string') sc.grupo = '';
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
  if(sc.nitros === undefined || sc.nitros === null) sc.nitros = creepNitrosMax(sc);
  if(sc.ataquesTurno === undefined) sc.ataquesTurno = 0;
  delete sc.compacto;  // la tarjeta ya no se despliega: se edita en una ventana
  return sc;
}

// Un creep de la biblioteca que se está viendo/editando ("Ver" → ✎ Editar) vive un rato en S.creeps marcado `_borrador`, para
// poder usar los mismos editores: no se guarda en la mesa, no se ve en la grilla ni en el Tablero y no recibe el Mantenimiento.
function creepsReales(){ return S.creeps.filter(sc => !sc._borrador); }

function renderAll(){
  $('#turno-badge').textContent = 'Turno ' + S.turno;
  if(typeof mesaPonerTurno === 'function') mesaPonerTurno(S.turno);
  const grid = $('#grid');
  $('#empty').style.display = creepsReales().length ? 'none' : 'block';
  S.creeps.forEach(normalizarCreep);
  renderGruposBarra();
  const visibles = S.creeps.filter(pasaGrupo);
  grid.innerHTML = visibles.map(sc => cardCompactoHtml(sc)).join('');
  if(creepsReales().length && !visibles.length){ $('#empty').style.display = 'block'; $('#empty').textContent = 'No hay creeps en este grupo. Con el grupo abierto, "+ Creep" agrega uno acá, o cambiale el grupo a un creep desde su ficha.'; }
  else $('#empty').textContent = 'Sin creeps todavía. Tocá "+ Creep" para agregar el primero.';
  if($('#scrim-editar-creep').classList.contains('open')) renderEditarCreep();
  if(asistCreepAbierto()) renderAsistenteCreep();
  if($('#scrim-acciones-creep').classList.contains('open')) renderAccionesCreep();
  renderTablero();  // si está abierto, refleja los cambios de los creeps
}

