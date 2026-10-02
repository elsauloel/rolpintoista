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
// Los costos de la Iteración 2 (No2 y SP) viven en comun/ficha-calculo.js (paso 4, etapa 3b): el mapa también los usa.
const IT2 = FichaCalculo.IT2;
const IT2_PENDIENTE = txt => `<span class="it2-pendiente" title="Sin confirmar (Iteración 2): ${esc(txt)}">⚠</span>`;
// Las migraciones que ponen al día una ficha vieja (Iteración 2: Bonos → SP y Acciones/Movimiento → No2; Inteligencia →
// Especial; escala de Tipos +2) viven en comun/ficha-guardado.js (paso 5, nivel B, área 4). Acá, los mismos nombres de siempre.
const migrarModsIt2 = mods => FichaGuardado.migrarModsIt2(mods, IT2.spPorBono);
const migrarObjIt2 = o => FichaGuardado.migrarObjIt2(o, IT2.spPorBono);
const migrarEstadoIt2 = st => FichaGuardado.migrarEstadoIt2(st, IT2.spPorBono);
const migrarObjEspecial = FichaGuardado.migrarObjEspecial;
const migrarEstadoEspecial = FichaGuardado.migrarEstadoEspecial;
const ESCALA_TIPOS = FichaGuardado.ESCALA_TIPOS;
const correrTiposTexto = FichaGuardado.correrTiposTexto;
const migrarObjTipos = FichaGuardado.migrarObjTipos;
const migrarEstadoTipos = FichaGuardado.migrarEstadoTipos;
let tiposGuardarJunto = false;  // recién migrada a la escala de Tipos: todas las partes se guardan en el mismo lote

const CATEGORIAS = FichaEquipo.CATEGORIAS;   // comun/ficha-equipo.js (A5, 2026-10-02)
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

const SLOT_DEFS = FichaEquipo.SLOT_DEFS;   // comun/ficha-equipo.js (hoja de ruta A4, 2026-10-02)
const ATTR_LIST = FichaCalculo.ATTR_LIST;
const MOD_TARGETS = FichaCalculo.MOD_TARGETS;
const STAT_LABEL = FichaCalculo.STAT_LABEL;
const STAT_FULL = FichaCalculo.STAT_FULL;
const ES_ATTR = FichaCalculo.ES_ATTR;

// El personaje en blanco: comun/ficha-guardado.js (paso 5, nivel B, área 4), ya pasado a SP/No2.
const DEFAULT = FichaGuardado.DEFAULT;

let S = structuredClone(DEFAULT);
let openStat = null;

const $ = s => document.querySelector(s);
const uid = () => Math.random().toString(36).slice(2,9);
const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
migrarEstadoIt2(S);   // no cambia nada (DEFAULT ya viene al día); queda por las dudas

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

// Aviso al quedar en 1 punto y al romperse, desgaste y Rompe armadura al azar: comun/ficha-acciones.js (paso 3c-5b). Se llaman en
// tiempo de uso, así que pueden usar habUi (js/11).
function durAviso(i){ FichaAcciones.durAviso(S, i, habUi); }
function desgastarItem(i, n){ FichaAcciones.desgastarItem(S, i, n, habUi); }
// Rompe armadura: una pieza de armadura equipada (que todavía no esté rota) elegida AL AZAR, sin distinguir por ninguna característica.
function rompeArmaduraAlAzar(veces){ return FichaAcciones.rompeArmaduraAlAzar(S, veces, habUi); }
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
function capMochilaEfectivo(){ return FichaEquipo.capMochila(S); }   // comun/ficha-equipo.js
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

