// js/04-habilidades.js — tramo 4 de 12 del script de gm-tools.html (paso 5, nivel A: mismo código, en el mismo orden).
/* ---------- Habilidades dirigidas en el duelo (2026-09-27, docs/duelo-de-habilidades.md): ver habDueloDe en ficha.html. `h.duelo` = {objetivo, tira, contra: [stats], dano, tipoDano, efectos} ---------- */
const habStatCreep = (sc, stat) => ATTR_IDS.includes(stat) ? num(sc[stat]) + creepModTotal(sc, stat) : creepStatValor(sc, stat);
const habEtqCreep = stat => (CREEP_STAT_LOOKUP[stat] && CREEP_STAT_LOOKUP[stat].label) || (ATTR_LABELS && ATTR_LABELS[stat]) || stat;
// Alcance en casilleros de un creep: cuerpo a cuerpo = 1 + el Alcance de su arma (mod `rng`); arma de rango = su Rango.
function alcanceDeCreep(sc){ return CreepCalculo.alcance(sc); }   // comun/creep-calculo.js
function alcanceDeHabCreep(sc, c, statTira){ return Combatiente.alcanceHab(c, statTira, s => creepStatValor(sc, s)); }   // comun/combatiente.js
// La Ejecución de un creep: la misma regla que personajes e invocaciones (comun/combatiente.js, habEjecucion) — ahora
// también con la tirada personalizada y los textos «a mano», que antes se perdían. Sin costo variable: ninguna «X» se toca.
function habEjecucionCreep(sc, h){ return CreepAcciones.habEjecucion(sc, h); }   // comun/creep-acciones.js
function habDueloCreep(sc, h){
  if(typeof Duelo === 'undefined' || !Duelo.disponible() || !gmVivo.activo) return null;
  return habEjecucionCreep(sc, h);
}
// «Ataque con mi arma, con arreglos» de un creep (Golpe brutal, Carga…; P134, 2026-09-30): el mismo armado que el personaje
// (comun/combatiente.js, ataqueConArreglos), con el arma del creep y su alcance (o el que diga la habilidad).
function ataqueDeHabCreep(sc, h){ return CreepAcciones.ataqueDeHab(sc, h); }   // comun/creep-acciones.js
// El PdG del ataque con arreglos, con lo que le suma la habilidad (los No2 ya los cobró la habilidad).
function tirarPdgDeArreglosCreep(sc, atq){ publicarTiradaCreep(CreepDuelo.pdgDeArreglos(sc, atq)); }   // comun/creep-duelo.js
// Se anuncia y va al cuadro del duelo (elegir el objetivo en el mapa); sin duelo, se tira el PdG suelto.
function lanzarAtaqueDeHabCreep(sc, h){
  const atq = ataqueDeHabCreep(sc, h);
  parryPendienteCreep.delete(sc.id);   // atacar cierra el Parry que esperaba su Bloqueo
  mesaPublicarHabilidadCreep(sc, h);
  if(atq && typeof Duelo !== 'undefined' && Duelo.disponible() && gmVivo.activo)
    Duelo.elegirObjetivo({yo: {ref: sc.id, tipo: 'creep', nombre: sc.nombre}, ataque: atq, suelto: () => tirarPdgDeArreglosCreep(sc, atq)});
  else tirarPdgDeArreglosCreep(sc, atq);
}
// ⚡ Flash de un creep (P135, 2026-09-30): no gasta No2 (igual que en el personaje); su límite es el cooldown, y la vida si
// la habilidad la cuesta. Texto del costo para el botón del duelo.
const costoFlashCreep = h => CreepDuelo.costoFlash(h);   // comun/creep-duelo.js
function costoFlashCreepTxt(h){ return CreepDuelo.costoFlashTxt(h); }
// «¿Es el turno del creep?» (P136, regla del dueño): en su turno el Flash cuesta lo que dice la habilidad (cooldown y vida);
// en turno ajeno, el doble. Nunca No2. Pregunta, revisa la vida y cobra; null = no se usó.
function pagarFlashCreep(sc, h){ return CreepDuelo.pagarFlash(gmDueloUi, sc.id, h.id); }   // comun/creep-duelo.js (gmDueloUi: js/12)
// Ejecutar un ⚡ Flash con el botón, fuera del cuadro del duelo: la misma regla de costo; se anuncia y el bono se suma a mano.
async function usarFlashFueraDelDueloCreep(sc, h){
  const p = await pagarFlashCreep(sc, h);
  if(!p) return;
  const f = h.duelo.flash || {};
  mesaPublicarHabilidadCreep(sc, h, `⚡ Flash: +${fmt(num(f.bono))} a la tirada.`);
  toast(`${h.nombre}: ⚡ +${fmt(num(f.bono))} (sumalo a mano a la tirada; dentro del duelo se suma solo) · ${ConfirmarTurno.textoCosto(p)}`);
}
function lanzarDueloDeHabCreep(sc, h, hab){
  Duelo.elegirObjetivo({yo: {ref: sc.id, tipo: 'creep', nombre: sc.nombre}, ataque: {tipo: 'habilidad', hab, alcance: hab.alcance}, suelto: () => tirarExtraDeHab(h, sc)});
}
// Zona persistente de una habilidad de creep (2026-09-28): igual que ficha.html, no abre el cuadro del duelo —
// le avisa al mapa (si gm-tools corre embebido ahí, ?modo=acciones) para que la coloque donde el GM marque el
// centro. Si hay tirada («tira» del 🎯), la tira UNA vez acá (con los stats del creep) y manda el total. Sin el
// mapa embebido no hay dónde marcar el centro — mismo límite que ya tienen los hechizos de área.
function colocarZonaDeHabCreep(sc, h){
  if(!(h && h.duelo && typeof h.duelo === 'object' && h.duelo.objetivo === 'zona')) return false;
  if(window.parent === window) return false;
  const z = CreepAcciones.zonaDeHab(sc, h);   // comun/creep-acciones.js: el mensaje (la tirada la hace la zona en cada exposición, P143)
  if(!z) return false;
  if(z.tirada) registrarTirada(z.tirada.origen, z.tirada.r);
  try{
    MensajesMapa.alMapa(z.zona.tipo, z.zona);
    return true;
  }catch(err){ console.error('No se pudo avisar la zona al mapa:', err); return false; }
}

function tirarExtraDeHab(h, sc){ publicarTiradaCreep(CreepAcciones.tiradaPrimeraHab(sc, h)); }   // comun/creep-acciones.js
function tirarSegundaDeHab(h, sc){ publicarTiradaCreep(CreepAcciones.tiradaSegundaHab(sc, h)); }
const botonSegundaHabCreep = (h, sc) => CreepBotonera.botonSegundaHab(h, sc);   // comun/creep-botonera.js
// Lo que pasa después de cobrar una habilidad (comun/creep-acciones.js, terminarHab): cómo lo hace GM Tools.
const gmHabUi = {
  mesaHabilidad: (sc, h, extra) => mesaPublicarHabilidadCreep(sc, h, extra),
  mesaConTexto: t => mesaConTexto(t),
  publicar: (sc, t) => publicarTiradaCreep(t),
  toast: t => toast(t),
  habDuelo: (sc, h) => habDueloCreep(sc, h),
  lanzarAtaque: (sc, h) => lanzarAtaqueDeHabCreep(sc, h),
  lanzarDuelo: (sc, h, hab) => lanzarDueloDeHabCreep(sc, h, hab),
  colocarTrampa: (sc, h, auto) => { if(!(auto && pedirTrampaAlMapaCreep(sc, h))) colocarTrampaDeHab(sc, h); },
  colocarZona: (sc, h) => colocarZonaDeHabCreep(sc, h),
  elegirObjetivo: (sc, h) => elegirObjetivoDeHab(sc, h),
};

let equipandoCreepId = null;

const normalizarBusqueda = s => (s || '').toString().normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim();

const TIER_COLOR = {'Común':'#9A867E', 'Buena Calidad':'#A8C256', 'Raro':'#5B8DBE', 'Excepcional':'#E0A458', 'Legendario':'#9B7BD4', 'A definir':'#D4574E'};
const STAT_LABEL_GM = CreepCalculo.STAT_LABEL;   // comun/creep-calculo.js
const STAT_FULL_GM = {
  tipo1:'Resistencia a crítico Tipo 4', tipo2:'Resistencia a crítico Tipo 6', tipo3:'Resistencia a crítico Tipo 8',
  tipo4:'Resistencia a crítico Tipo 10', tipo5:'Resistencia a crítico Tipo 12',
  pdg:'Probabilidad de golpe', eva:'Evasión', ini:'Iniciativa', mov:'Movimiento', parry:'Parry', crit:'Crítico frecuente (baja el rango del crítico)', critpot:'Crítico potente (baja los umbrales del d20)',
  bonos:'Bonos', rangocasteo:'Rango de casteo', accionesmax:'Acciones máximas', nitros:'Nitros',
  resm:'Resistencia mental', resmg:'Resistencia especial', rescc:'Resistencia a CC',
  con:'Constitución', fue:'Fuerza', agl:'Agilidad', des:'Destreza', esp:'Especial',
};
const SLOT_MAP_GM = CreepCalculo.SLOT_MAP;   // comun/creep-calculo.js
function slotDeGM(tipoItem){ return CreepCalculo.slotDe(tipoItem); }

function modsResumenHtmlGM(mods){
  const list = (mods || []).filter(m => m.stat && m.stat !== 'def');
  if(!list.length) return '';
  return list.map(m => {
    const label = TIPO_STAT_A_CRIT_IDX[m.stat] !== undefined ? `Res.Crít. ${STAT_LABEL_GM[m.stat]}` : (STAT_LABEL_GM[m.stat] || (typeof FichaCalculo !== 'undefined' && FichaCalculo.STAT_LABEL[m.stat]) || m.stat);   // los stats nuevos (guantes, cascos…) con su nombre, no el interno
    const val = num(m.val);
    const suf = '';
    const cls = val > 0 ? 'mod-plus' : val < 0 ? 'mod-minus' : '';
    return `<span class="${cls}">${esc(label)} ${val>0?'+':''}${fmt(val)}${suf}</span>`;
  }).join(' · ');
}

// Texto completo del ítem para la búsqueda (nombre, detalle, tier, categoría,
// mods en forma corta y completa) — igual criterio que en ficha.html.
function textoBusquedaDeGM(item){
  const partes = [item.nombre, item.detalle, item.tier, TIPOITEM_LABEL_GM[item.tipoItem] || item.tipoItem];
  (item.mods || []).forEach(m => { partes.push(STAT_LABEL_GM[m.stat] || m.stat, STAT_FULL_GM[m.stat]); });
  return normalizarBusqueda(partes.filter(Boolean).join(' '));
}

function equipoItemHtml(item, idx){
  const esArma = String(item.tipoItem).startsWith('arma_');
  const esCons = item.tipoItem === 'consumibles';
  const esp = item.especial;   // ✨ una varita: su hechizo, no un daño físico (decía «Daño 1d0»)
  const statTxt = esp
    ? `✨ ${esp.dano ? `${esc(esp.dano)}${esp.sumaEspecial === true ? ' + Ef.Esp' : num(esp.sumaEspecial) ? ' + ½ Ef.Esp' : ''}` : 'sin daño'} · ${num(esp.no2 ?? 1)} No2 · espera ${CreepAcciones.ESPERA_POR_SP(num(esp.sp))}`
    : esArma
    ? `Daño ${Math.max(1,item.peso)}d${item.tipoDado}${item.danoFijo?` +${item.danoFijo}`:''}`
    : (esCons ? (item.curahp ? `Cura ${fmt(item.curahp)} HP` : 'Consumible') : item.orbe ? '🔮 Orbe (al usar una varita)' : `Defensa +${item.def}`);
  const tierColor = TIER_COLOR[item.tier] || TIER_COLOR['Común'];
  const modsHtml = modsResumenHtmlGM(item.mods);
  return `<div class="cat-row cat-card">
    <div class="cat-info">
      <div class="cat-card-titulo">
        <div class="cat-nombre">${esc(item.nombre)}</div>
        ${item.tier ? `<div class="cat-tier-badge" style="color:${tierColor};border-color:${tierColor};background:${tierColor}22">${esc(item.tier)}</div>` : ''}
      </div>
      <div class="cat-meta"><b>${esc(statTxt)}</b> · Peso ${fmt(num(item.peso))}</div>
      ${modsHtml ? `<div class="cat-mods">${modsHtml}</div>` : ''}
      ${item.detalle ? `<div class="cat-detalle">${esc(item.detalle)}</div>` : ''}
    </div>
    <button type="button" class="mini" data-veritem="${idx}">Ver</button>
    ${equipandoCreepId && !esCons ? `<button type="button" class="cat-btn-equipar" data-equiparitem="${idx}">Equipar</button>` : ''}
  </div>`;
}

// Tarjeta de "Ver" de un ítem del catálogo — mismo formato que la de
// vendor-generator.html/ficha.html, con imagen y descripción narrativa
// si el ítem las trae.
function verItemGM(idx){ verItemDatos(CATALOGO_EQUIPO[idx]); }
// Ventana de detalles de un ítem (del catálogo, una plantilla del botín, o el arma o una pieza de un creep). Su botón
// "✎ Editar y subir" arma una copia y la sube al catálogo compartido (comun/editar-item.js); no toca lo que se está viendo.
let verItemActual = null;
function catalogoGMCompleto(){ return ItemsSubidos.mezclar(structuredClone(CATALOGO_BASE), itemsSubidosGM); }
function editarYSubirItemGM(item){
  if(!item) return;
  EditarItem.abrir({item, catalogo: catalogoGMCompleto(), contexto: 'creep', stats: cfgItemGM().stats,
    alSubir: () => cargarItemsSubidosGM()});
}
// El arma de un creep y sus piezas de armadura, como ítems (para verlos y subirlos).
function armaDeCreepComoItem(sc){ return armaDeCreepComoDraft(sc); }
function piezaDeCreepComoItem(it){ return {nombre: it.nombre, tipoItem: it.tipoItem, def: num(it.def), mods: structuredClone(it.mods || []), detalle: it.detalle || ''}; }
function verItemDatos(item){
  if(!item) return;
  verItemActual = item;
  const v = CreepLupa.verItem(item);   // comun/creep-lupa.js (A6a: el mapa del GM muestra el mismo)
  $('#veritem-titulo').textContent = v.titulo;
  $('#veritem-body').innerHTML = v.html;
  // Solicitar eliminar solo tiene sentido si esto es de verdad un ítem del catálogo (no el arma de un creep, una pieza,
  // o una plantilla de botín, que no tienen id ahí).
  $('#veritem-baja').style.display = (item.id && catalogoGMCompleto().some(c => c.id === item.id)) ? '' : 'none';
  $('#scrim-ver-item').classList.add('open');
}

// Igual criterio que catalogoVisibles() en ficha.html: "aleatorio" tiene
// que respetar los filtros activos ahora mismo, no todo el catálogo.
function equiparCreepVisibles(){
  const filtro = $('#equipar-creep-filtro') ? $('#equipar-creep-filtro').value : '';
  const filtroSlot = $('#equipar-creep-filtro-slot') ? $('#equipar-creep-filtro-slot').value : '';
  const filtroTier = $('#equipar-creep-filtro-tier') ? $('#equipar-creep-filtro-tier').value : '';
  const busqueda = normalizarBusqueda($('#equipar-creep-buscar') ? $('#equipar-creep-buscar').value : '');
  let visibles = CATALOGO_EQUIPO.map((it, idx) => ({it, idx}));
  if(filtro === 'armas') visibles = visibles.filter(({it}) => it.tipoItem.startsWith('arma_'));
  if(filtro === 'escudos') visibles = visibles.filter(({it}) => it.tipoItem.startsWith('escudo'));
  if(filtro === 'defensa') visibles = visibles.filter(({it}) => !it.tipoItem.startsWith('arma_') && !it.tipoItem.startsWith('escudo') && it.tipoItem !== 'consumibles' && it.tipoItem !== 'anillos');
  if(filtro === 'accesorios') visibles = visibles.filter(({it}) => it.tipoItem === 'anillos');
  if(filtro === 'consumibles') visibles = visibles.filter(({it}) => it.tipoItem === 'consumibles');
  if(filtroSlot) visibles = visibles.filter(({it}) => slotDeGM(it.tipoItem) === filtroSlot);
  if(filtroTier) visibles = visibles.filter(({it}) => it.tier === filtroTier);
  if(busqueda) visibles = visibles.filter(({it}) => textoBusquedaDeGM(it).includes(busqueda));
  return visibles;
}

const TIERS_ORDEN_GM = ['Común', 'Buena Calidad', 'Raro', 'Excepcional', 'Legendario'];

// Daño máximo posible del arma. Lo que no es arma da 0 y queda al final
// del orden por daño (ver ordenarEquipo).
function danoDeGM(it){
  if(!it.tipoItem.startsWith('arma_')) return 0;
  return Math.max(1, num(it.peso) || 1) * (num(it.tipoDado) || 8) + num(it.danoFijo);
}

const ORDENES_GM = {
  categoria: {label:'Categoría', cmp:(a,b) => TIERS_ORDEN_GM.indexOf(a.tier) - TIERS_ORDEN_GM.indexOf(b.tier)},
  nombre:    {label:'Nombre',    cmp:(a,b) => a.nombre.localeCompare(b.nombre, 'es')},
  precio:    {label:'Precio',    cmp:(a,b) => num(a.precioCompra) - num(b.precioCompra)},
  peso:      {label:'Peso',      cmp:(a,b) => num(a.peso) - num(b.peso)},
  rareza:    {label:'Rareza',    cmp:(a,b) => TIERS_ORDEN_GM.indexOf(a.tier) - TIERS_ORDEN_GM.indexOf(b.tier)},
  dano:      {label:'Daño',     valor: danoDeGM},
  defensa:   {label:'Defensa',  valor: it => num(it.def)},
};

let equipoOrden = 'categoria';
let equipoOrdenDesc = false;

// Recibe y devuelve pares {it, idx}: el idx es el índice en
// CATALOGO_EQUIPO y lo necesita el botón Equipar, así que ordenar no
// puede perderlo.
function ordenarEquipo(pares){
  const def = ORDENES_GM[equipoOrden] || ORDENES_GM.categoria;
  const porNombre = (a, b) => a.it.nombre.localeCompare(b.it.nombre, 'es');
  // Criterio con valor propio (daño, defensa): lo que no aplica queda al
  // final siempre, no mezclado entre los que sí tienen.
  if(def.valor){
    const con = pares.filter(p => def.valor(p.it) > 0);
    const sin = pares.filter(p => def.valor(p.it) <= 0).sort(porNombre);
    con.sort((a, b) => def.valor(a.it) - def.valor(b.it) || porNombre(a, b));
    if(equipoOrdenDesc) con.reverse();
    return [...con, ...sin];
  }
  const orden = pares.slice().sort((a,b) => def.cmp(a.it, b.it) || porNombre(a, b));
  return equipoOrdenDesc ? orden.reverse() : orden;
}

// Entre los consumibles, los legacy ("los de siempre") van primero, sea
// cual sea el criterio de orden elegido. Acá no hay concepto de stock
// fijo (eso es propio de una tienda generada, no de este catálogo de
// equipo). No toca el orden de nada que no sea consumible: el sort es
// estable y el comparador da 0 apenas uno de los dos no es consumible.
function conLegacyPrimeroGM(pares){
  return pares.slice().sort((a, b) => {
    if(a.it.tipoItem !== 'consumibles' || b.it.tipoItem !== 'consumibles') return 0;
    return (b.it.legacy ? 1 : 0) - (a.it.legacy ? 1 : 0);
  });
}

function renderEquipoOrdenControles(){
  const sel = $('#equipar-creep-orden');
  if(sel && !sel.dataset.listo){
    sel.innerHTML = Object.entries(ORDENES_GM).map(([k,v]) => `<option value="${k}">${esc(v.label)}</option>`).join('');
    sel.dataset.listo = '1';
  }
  if(sel) sel.value = equipoOrden;
  const b = $('#equipar-creep-orden-dir');
  if(b) b.textContent = equipoOrdenDesc ? '↓ Mayor a menor' : '↑ Menor a mayor';
}

function elegirItemAleatorioGM(){
  const visibles = equiparCreepVisibles();
  if(!visibles.length){ toast('No hay ítems que coincidan con los filtros activos'); return; }
  const {it, idx} = visibles[Math.floor(Math.random() * visibles.length)];
  $('#item-aleatorio-gm-body').innerHTML = `<div class="cat-grid">${equipoItemHtml(it, idx)}</div>`;
  $('#scrim-item-aleatorio-gm').classList.add('open');
}

function renderEquiparCreepLista(){
  const visibles = equiparCreepVisibles();
  let html = '';
  if(equipoOrden === 'categoria'){
    const armas = ordenarEquipo(visibles.filter(({it}) => it.tipoItem.startsWith('arma_')));
    const escudos = ordenarEquipo(visibles.filter(({it}) => it.tipoItem.startsWith('escudo')));
    const defensa = ordenarEquipo(visibles.filter(({it}) => !it.tipoItem.startsWith('arma_') && !it.tipoItem.startsWith('escudo') && it.tipoItem !== 'consumibles'));
    const consumibles = conLegacyPrimeroGM(ordenarEquipo(visibles.filter(({it}) => it.tipoItem === 'consumibles')));
    if(armas.length) html += `<div class="cat-grouphead">Armas</div><div class="cat-grid">${armas.map(({it,idx}) => equipoItemHtml(it, idx)).join('')}</div>`;
    if(escudos.length) html += `<div class="cat-grouphead">Escudos (suman a Defensa)</div><div class="cat-grid">${escudos.map(({it,idx}) => equipoItemHtml(it, idx)).join('')}</div>`;
    if(defensa.length) html += `<div class="cat-grouphead">Defensa</div><div class="cat-grid">${defensa.map(({it,idx}) => equipoItemHtml(it, idx)).join('')}</div>`;
    if(consumibles.length) html += `<div class="cat-grouphead">Consumibles</div><div class="cat-grid">${consumibles.map(({it,idx}) => equipoItemHtml(it, idx)).join('')}</div>`;
  }else{
    const orden = conLegacyPrimeroGM(ordenarEquipo(visibles));
    if(orden.length){
      html += `<div class="cat-grouphead">${esc(ORDENES_GM[equipoOrden].label)} · ${fmt(orden.length)}</div>`;
      html += `<div class="cat-grid">${orden.map(({it,idx}) => equipoItemHtml(it, idx)).join('')}</div>`;
    }
  }
  renderEquipoOrdenControles();
  $('#equipar-creep-lista').innerHTML = html || `<div class="hint">No hay ítems que coincidan con la búsqueda.</div>`;
}

function abrirEquiparCreep(scId){
  equipandoCreepId = scId;
  $('#equipar-creep-filtro').value = '';
  $('#equipar-creep-filtro-slot').value = '';
  $('#equipar-creep-filtro-tier').value = '';
  $('#equipar-creep-buscar').value = '';
  renderEquiparCreepLista();
  $('#scrim-equipar-creep').classList.add('open');
}

const TIPOITEM_LABEL_GM = CreepCalculo.TIPOITEM_LABEL;   // comun/creep-calculo.js
const TIPO_STAT_A_CRIT_IDX = {tipo1:0, tipo2:1, tipo3:2, tipo4:3, tipo5:4};

// Aplica (signo 1) o revierte (signo -1) los modificadores de un ítem de
// equipo sobre los campos del creep que tienen dónde guardarlos. Bonos/Res.M/
// Res.CC no tienen campo propio en un creep, así que quedan solo en el
// detalle del ítem — no se pierden, simplemente no suman a ningún número.
function aplicarModsEquipo(sc, mods, signo){
  (mods||[]).forEach(m => {
    if(TIPO_STAT_A_CRIT_IDX[m.stat] !== undefined){
      const i = TIPO_STAT_A_CRIT_IDX[m.stat];
      sc.crit[i] = num(sc.crit[i]) + signo * num(m.val);
    }else if(m.stat === 'mov'){
      sc.spd = num(sc.spd) + signo * num(m.val);
    }
  });
}

// El texto libre de "Armadura" refleja por default lo que hay en sc.equipo
// (nombres separados por coma), tanto si se equipó del catálogo como si el
// creep es un custom armado a mano con esos mismos ítems.
function actualizarArmaduraTipo(sc){
  sc.armaduraTipo = (sc.equipo||[]).map(it => it.nombre).join(', ');
}

function quitarEquipoDeCreep(scId, equipoId){
  const sc = S.creeps.find(s => s.id === scId);
  const item = sc && (sc.equipo||[]).find(x => x.id === equipoId);
  if(!sc || !item) return;
  sc.defensa = Math.max(0, num(sc.defensa) - num(item.def));
  aplicarModsEquipo(sc, item.mods, -1);
  sc.equipo = sc.equipo.filter(x => x.id !== equipoId);
  actualizarArmaduraTipo(sc);
  if(modsAfectanHp(item.mods)) actualizarHpMaxPorCon(sc);
  renderAll();
  toast(`${item.nombre} quitado`);
}

function equiparItemEnCreep(idx){
  const sc = S.creeps.find(s => s.id === equipandoCreepId);
  const item = CATALOGO_EQUIPO[idx];
  if(!sc || !item) return;
  if(CreepCalculo.vaAlEquipo(item)){   // (un arma especial va al equipo: no le cambia el arma)
    const mods = structuredClone(item.mods || []);
    sc.defensa = num(sc.defensa) + num(item.def);
    aplicarModsEquipo(sc, mods, 1);
    sc.equipo = sc.equipo || [];
    sc.equipo.push({id: uid(), nombre: item.nombre, tipoItem: item.tipoItem, def: num(item.def), mods, detalle: item.detalle || '', ...CreepCalculo.magiaDeItem(item)});
    actualizarArmaduraTipo(sc);
    if(modsAfectanHp(mods)) actualizarHpMaxPorCon(sc);
    toast(`${sc.nombre} equipado con ${item.nombre}`);
  }else{
    sc.armaTipo = item.tipoDado;
    sc.armaPeso = Math.max(1, item.peso);
    sc.armaFijo = item.danoFijo;
    sc.armaAmplificado = num(item.danoAmplificado);
    sc.armaDeRango = !!item.armaDeRango;
    sc.armaRasgos = Combatiente.rasgosDeItem(item); delete sc.armaEspalda; delete sc.armaIgnoraResistCrit;   // los rasgos del arma (comun/combatiente.js)
    sc.armaNombre = item.nombre;
    sc.armaDetalle = item.detalle || '';
    sc.armaMods = structuredClone(item.mods || []);
    sc.armaEfectos = structuredClone(item.efectosGolpe || []);
    sc.armaManos = item.tipoItem;
    toast(`${sc.nombre} equipado con ${item.nombre}`);
  }
  $('#scrim-equipar-creep').classList.remove('open');
  $('#scrim-item-aleatorio-gm').classList.remove('open');
  renderAll();
}

function slugItemCatalogo(s){
  return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'item';
}

// ⬆ Sube un ítem al catálogo compartido (biblioteca de Firebase, tipo `items`; paso 5 de docs/plan-subida-unificada.md):
// disponible al instante para todos. Si tiene el nombre de un ítem del catálogo, se puede elegir que sea una corrección.
function publicarEnCatalogoGM(nuevo){
  const cat = ItemsSubidos.mezclar(structuredClone(CATALOGO_BASE), itemsSubidosGM);
  Biblioteca.guardar({tipo: 'items', datos: nuevo, nombre: nuevo.nombre, nivel: 0, basadoEn: ItemsSubidos.basadoEn(nuevo, cat),
    alSubir: () => cargarItemsSubidosGM()});
}


/* Habilidades de creeps: el editor paso a paso es común (comun/creep-editor.js, A6c, 2026-10-02): GM Tools lo arma en su ventana de
   siempre (#scrim-hab-creep, la crea el componente). Acá, lo que GM Tools hace a su manera. */
const editorHabCreep = CreepEditor.crear(document.body, {
  creep: scId => S.creeps.find(s => s.id === scId),
  guardarHab: (scId, aplicar) => { const sc = S.creeps.find(s => s.id === scId); if(sc){ aplicar(sc); renderAll(); } },
  personalizados: () => S.estadosPersonalizados || [],
  elegirEstadoDuelo: () => elegirEstadoDuelo(),
  toast: m => toast(m),
}, {id: 'scrim-hab-creep'});
function hcStatLabel(id){ return CreepEditor.statLabel(id); }
// habId vacío = habilidad nueva; opc = {borrador, alGuardar, encima} (ver comun/creep-editor.js).
function abrirEditorHabCreep(scId, habId, opc){ editorHabCreep.abrir(scId, habId, opc); }

