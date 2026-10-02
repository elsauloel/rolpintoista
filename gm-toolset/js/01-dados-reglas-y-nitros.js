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
function tirarValorStat(nombre, valor, sc, statId){ publicarTiradaCreep(CreepAcciones.tirada(nombre, valor, sc, statId)); }   // comun/creep-acciones.js
// Una tirada armada por comun/creep-acciones.js ({origen, r} o {error}), a la Mesa.
function publicarTiradaCreep(t){
  if(!t) return;
  if(t.error){ toast(t.error); return; }
  registrarTirada(t.origen, t.r);
}

const COLORES = ['#C4485A','#D07B3A','#8FB84F','#4FA88C','#9B7BD4','#6FA8D8'];

// Copia liviana (sin imágenes) del catálogo del fabricante de ficha.html,
// solo armas y escudos — para equipar creeps rápido. Si el catálogo de
// ficha.html cambia, esta lista hay que actualizarla a mano.
// El catálogo de fábrica vive en comun/catalogo.js (una sola copia para todas las herramientas); acá se arma la forma que
// usa GM Tools para el equipo de los creeps: sin id, la Defensa separada de los otros bonos (`def`), sin los campos que un
// creep no usa. Misma forma que escribía antes herramientas/catalogo_comun.py (item_gm).
function itemParaCreep(it){ return CreepCalculo.itemParaCreep(it); }   // comun/creep-calculo.js
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
const DADOS_ARMA = CreepCalculo.DADOS_ARMA;   // comun/creep-calculo.js

/* ---------- Escala de Tipos de arma +2 ----------
   Los Tipos pasaron de 2/4/6/8/10 a 4/6/8/10/12 (igual que en ficha.html).
   Los creeps guardados antes traen armaTipo, el equipo y los textos con la
   escala vieja: normalizarCreep los corre +2 una sola vez y los marca con
   escalaTipos. Los creeps nuevos ya nacen marcados. */
// La migración (escala de Tipos +2, Inteligencia → Especial, PdG en las habilidades de daño) vive en comun/creep-calculo.js
// (paso 4 etapa 4a, 2026-10-01): estos son los atajos de siempre.
const ESCALA_TIPOS = CreepCalculo.ESCALA_TIPOS;
function correrTiposTexto(txt){ return CreepCalculo.correrTiposTexto(txt); }
function migrarObjTipos(o){ return CreepCalculo.migrarObjTipos(o); }
function migrarCreepTipos(sc){ return CreepCalculo.migrarCreepTipos(sc); }
function migrarObjEspecial(o){ return CreepCalculo.migrarObjEspecial(o); }
function migrarHabPdg(sc){ return CreepCalculo.migrarHabPdg(sc); }
function migrarCreepEspecial(sc){ return CreepCalculo.migrarCreepEspecial(sc); }

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

function danoTxt(sc, extra){ return CreepCalculo.danoTxt(sc, extra); }

// Lo que el creep tiene puesto y da bonos: su equipo y su arma (sc.armaMods).
function fuentesEquipoCreep(sc){ return CreepCalculo.fuentesEquipo(sc); }

// Suma los modificadores que apuntan a un stat puntual, vengan del equipo
// puesto o de estados activos — mismo criterio que collectMods()+modTotal
// en ficha.html, para que un ítem con "bloqueo +N" o un estado que suba
// Fuerza afecten al creep de verdad y no solo la Res. a crítico.
function creepModTotal(sc, statId){ return CreepCalculo.modTotal(sc, statId); }

// Armadura rota activa reduce la Defensa — igual que en ficha.html.
function creepEstadosArmadura(sc){ return CreepCalculo.estadosArmadura(sc); }
function creepAporteArmadura(sc, statId){ return CreepCalculo.aporteArmadura(sc, statId); }
function creepDefensaEfectiva(sc){ return CreepCalculo.defensaEfectiva(sc); }
// Armadura mágica (Paso 3 de las reglas de casteo, docs/reglas-casteo.md):
// stat general, fijo, que NO sale de ningún atributo (base a mano, 0 por
// defecto) — solo la dan ítems Raros o mejores, vía sus bonos genéricos
// (no tiene un campo propio como "def" en las piezas de armadura). Protege
// el daño de casteo que "ignora la Defensa" (Paso 1); no tiene nada que ver
// con Escudo especial ni con la habilidad "Armadura arcana" del Mago.
function creepArmadmgEfectiva(sc){ return CreepCalculo.armadmgEfectiva(sc); }
function armadmgOrigenTxt(sc){ return CreepCalculo.armadmgOrigenTxt(sc); }
function creepCritEfectivo(sc, i){ return CreepCalculo.critEfectivo(sc, i); }
/* Stats secundarios de los creeps: los mismos que un PJ, cada uno sale de
   su atributo (fórmula base = el atributo) + mods (ver creepStatValor).
   Hp.Max y No2 ya se ven arriba; Crg.Max y SP no aplican a los creeps. */
const CREEP_DERIVADOS_POR_ATTR = CreepCalculo.DERIVADOS_POR_ATTR;   // comun/creep-calculo.js
const ATTR_NOMBRE = CreepCalculo.ATTR_NOMBRE;

// De dónde sale un stat secundario: su atributo y lo que lo modifica.
function statOrigenTxt(sc, statId, label){ return CreepCalculo.statOrigenTxt(sc, statId, label); }

function creepEstadoActivo(sc, flag){ return CreepCalculo.estadoActivo(sc, flag); }

function derivadosHtml(sc, attr){ return CreepLupa.derivadosHtml(sc, attr); }   // comun/creep-lupa.js

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
function aportesModCreep(sc, statId){ return CreepCalculo.aportesMod(sc, statId); }
const conSigno = CreepCalculo.conSigno;

// Ataque = daño del arma + Fuerza (Dmg), el mismo que tira "Daño Arma".
function ataqueCreepTxt(sc){ return CreepCalculo.ataqueTxt(sc); }

// De dónde sale el Ataque: dados y fijo del arma, Fuerza y lo que la sube,
// mods directos de Dmg. Un arma de rango no suma Fuerza (ver danoTxt).
function ataqueOrigenTxt(sc){ return CreepCalculo.ataqueOrigenTxt(sc); }

// De dónde sale la Defensa: lo que da cada pieza de armadura, el resto
// cargado a mano, y si la armadura está rota o arruinada.
function defensaOrigenTxt(sc){ return CreepCalculo.defensaOrigenTxt(sc); }

// De dónde sale una resistencia a crítico (i = 0..4 → Tipo 4..12): lo que
// da cada pieza de equipo (se suma a sc.crit al equiparla), el resto cargado
// a mano, y si la armadura está rota o arruinada (ver creepCritEfectivo).
function critOrigenTxt(sc, i){ return CreepCalculo.critOrigenTxt(sc, i); }

function creepArmaduraOrigenTxt(sc){ return CreepCalculo.armaduraOrigenTxt(sc); }

// Nombres de los estados activos que aportan un mod a ese stat, para
// poder mostrar "de dónde sale" al tocar el indicador +/-.
function origenesModCreep(sc, statId){ return CreepCalculo.origenesMod(sc, statId); }

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
function modsAfectanHp(mods){ return CreepCalculo.modsAfectanHp(mods); }

// Recalcula hpMax = con*5 + mods de Hp.Max (con efectivo; equipo y estados
// incluidos, igual que en la ficha) cuando cambia con o algo que da Hp.Max.
// Si el creep estaba a HP lleno lo deja lleno; si no, sólo recorta hp si se
// pasa del nuevo máximo. Después el máster puede seguir editando hp/hpMax a
// mano hasta el próximo recálculo.
function actualizarHpMaxPorCon(sc){ return CreepCalculo.actualizarHpMaxPorCon(sc); }

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
function actualizarNo2PorAgl(sc, antes){ return CreepCalculo.actualizarNo2PorAgl(sc, antes); }
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
const IT2_CREEP = CreepCalculo.IT2_CREEP;   // comun/creep-calculo.js
// Moverse no está acá: lo cobra el mapa al arrastrar el token del creep
// (1 No2 por casillero, 2 con Rengo, nada con Inmovilizado).

function creepNitrosMax(sc){ return CreepCalculo.nitrosMax(sc); }

// Nitros de una habilidad: un número, o "ATAQUE" = lo que le cuesta un
// ataque con su arma (Tipo ÷ 2 el primero del turno) y cuenta como ese ataque.
function habCreepAtaque(h){ return CreepCalculo.habAtaque(h); }
function costoNitrosHabCreep(sc, h){ return CreepCalculo.costoNitrosHab(sc, h); }   // comun/combatiente.js
/* La descripción de las habilidades del catálogo termina con un aviso para el GM: "⚙ Automatizado: … ✋ A mano: …".
   Eso es cosa de la herramienta (se ve en Ver y en la tarjeta), no de la mesa: a la Mesa, que lee todo el mundo,
   va solo lo que hace la habilidad (la descripción más lo que se resuelve a mano, que también es lo que hace). */
function habPartes(h){ return CreepCalculo.habPartes(h); }
function habTextoMesa(h){ return CreepCalculo.habTextoMesa(h); }
function costoHabCreepTxt(sc, h){ return CreepCalculo.costoHabTxt(sc, h); }

// Primer ataque del turno: Tipo ÷ 2 (redondeado para arriba); los demás, Tipo completo.
// Parry y Bloqueo de un creep (2026-09-24, pedido del dueño; igual que en la ficha): el Parry cuesta 1 No2 (2026-09-26; antes el Peso de su arma);
// el Bloqueo suma su Bloqueo + el Peso del arma y ESA SUMA es el dado.
function pesoArmaCreep(sc){ return CreepCalculo.pesoArma(sc); }
function costoParryCreep(sc){ return CreepCalculo.costoParry(sc); }   // siempre 1 No2, sin importar el arma (comun/combatiente.js)
// Con qué para el creep (Parry y Bloqueo): su arma si no es natural, si no un escudo de su equipo; null = no puede
// (regla del dueño 2026-09-30, comun/combatiente.js). El Bloqueo suma el peso de eso.
function defensaCreep(sc){ return CreepCalculo.defensa(sc); }
function bloqueoValorCreep(sc){ return CreepCalculo.bloqueoValor(sc); }
// Creeps con un Parry esperando su Bloqueo: el Bloqueo solo existe después de un Parry (regla del dueño, 2026-09-30).
// Se limpia al bloquear, atacar, en el Mantenimiento y al reiniciar el combate. El duelo no lo necesita (ya sabe si ganó el Parry).
const parryPendienteCreep = new Set();
// Fuerza del golpe (reglas del escudo, 2026-09-26): la tirada del atacante contra el Bloqueo del defensor = su Fuerza (con los estados activos) + el peso de su arma; la SUMA es el dado.
function fuerzaGolpeValorCreep(sc){ return CreepCalculo.fuerzaGolpeValor(sc); }
// Contraataque (regla a prueba, 2026-09-26): tras un Parry, siempre cuesta lo de un primer ataque y no suma al conteo de ataques del turno.
function costoContraataqueCreep(sc){ return CreepCalculo.costoContraataque(sc); }   // regla común (comun/combatiente.js)
// Menú de Atacar del creep (2026-09-26, pedido del dueño): Ataque normal / Ataque de oportunidad / Contraataque. Normal: el primero del turno cuesta Tipo ÷ 2 y los siguientes el Tipo completo;
// oportunidad y contraataque siempre cuestan Tipo ÷ 2 y no suman al conteo de ataques del turno.
function atacarNormalCreep(sc){
  if((sc.estados || []).some(e => e.activo !== false && e.sentado) && !confirm(`${sc.nombre} está Sentado y no puede atacar. ¿Atacar igual?`)) return;
  const forzar = CreepAcciones.faltanNitros(sc, 'normal');   // sin No2: avisar y dejar seguir (2026-10-02)
  if(forzar && !confirm(CreepAcciones.preguntaSinNitros(sc, 'normal'))) return;
  const x = CreepAcciones.pagarAtaque(sc, 'normal', forzar);   // comun/creep-acciones.js
  if(x.error){ toast(x.error); return; }
  CreepAcciones.alertaSinNitros(sc, 'normal', x.forzado);
  parryPendienteCreep.delete(sc.id);   // atacar cierra el Parry que esperaba su Bloqueo
  renderAll();
  publicarTiradaCreep(CreepAcciones.tiradaAtaque(sc, 'normal'));
  toast(x.aviso);
}
function ataqueEspecialCreep(sc, tipo){
  const forzar = CreepAcciones.faltanNitros(sc, tipo);
  if(forzar && !confirm(CreepAcciones.preguntaSinNitros(sc, tipo))) return;
  const x = CreepAcciones.pagarAtaque(sc, tipo, forzar);   // comun/creep-acciones.js
  if(x.error){ toast(x.error); return; }
  CreepAcciones.alertaSinNitros(sc, tipo, x.forzado);
  renderAll();
  publicarTiradaCreep(CreepAcciones.tiradaAtaque(sc, tipo));
  toast(x.aviso);
}
function preguntarTipoAtaqueCreep(sc){
  const normal = costoAtaqueCreep(sc), primero = num(sc.ataquesTurno) === 0, especial = costoContraataqueCreep(sc);
  $('#tipo-ataque-creep-lista').innerHTML = `<div class="hint">${esc(sc.nombre)}</div>
    <button class="btn" data-tipoataquecreep="normal:${sc.id}" style="width:100%">⚔ Ataque normal — ${fmt(normal)} No2<br><span class="hint">${primero ? 'primer ataque del turno (Tipo ÷ 2)' : 'Tipo completo (ya atacó este turno)'}</span></button>
    <button class="btn" data-tipoataquecreep="oportunidad:${sc.id}" style="width:100%">🏃 Ataque de oportunidad — ${fmt(especial)} No2<br><span class="hint">siempre Tipo ÷ 2; no suma al conteo de ataques</span></button>
    <button class="btn" data-tipoataquecreep="contra:${sc.id}" style="width:100%">↩ Contraataque — ${fmt(especial)} No2<br><span class="hint">solo tras ganar un Parry y un Bloqueo; siempre Tipo ÷ 2; no suma al conteo de ataques</span></button>`;
  $('#scrim-tipo-ataque-creep').classList.add('open');
}
function costoAtaqueCreep(sc){ return CreepCalculo.costoAtaque(sc); }   // regla común (comun/combatiente.js)

// Por qué no se puede ejecutar una habilidad ahora ('' = se puede).
// Cooldown de una habilidad de creep, a mano (2026-09-24, pedido del dueño): el GM puede subirlo, bajarlo o resetearlo en cualquier
// momento, por ejemplo después de ejecutar una habilidad para probar algo. − y + cambian los turnos que le quedan; ↺ (solo con
// cooldown activo) lo deja en 0.
function cdControlesHtml(sc, h){ return CreepBotonera.cdControlesHtml(sc, h); }   // comun/creep-botonera.js

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
function modoHabCreep(h){ return CreepCalculo.modoHab(h); }   // la regla común
const botonHabCreepTxt = h => CreepBotonera.botonHabTxt(h);
function etiquetaModoCreep(h){ const m = MODOS_HAB_CREEP[modoHabCreep(h) || 'semi']; return `<span class="tag" title="${esc(m.nombre)}: ${esc(m.corto)}">${m.icono}</span>`; }
// ¿Se puede usar ahora? La regla común (P133): cooldown, No2 y vida (una 📣 manual no cobra nada).
function bloqueoHabCreep(sc, h){ return CreepCalculo.bloqueoHab(sc, h); }

// Estados de creeps guardados antes de los No2: los presets que tocaban
// Acciones pasan a tocar No2 (solo si el estado no trae ya ese efecto).
const ESTADOS_NITROS_MIGRAR = CreepCalculo.ESTADOS_NITROS_MIGRAR;

// Rellena campos que creeps viejos (guardados antes de una función nueva)
// pueden no tener, para que el resto del código no se tope con undefined.
function normalizarCreep(sc){ return CreepCalculo.normalizar(sc); }

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

