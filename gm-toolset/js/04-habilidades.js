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
  const z = CreepAcciones.zonaDeHab(sc, h);   // comun/creep-acciones.js: la tirada (una vez) y el mensaje
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
const STAT_LABEL_GM = {
  tipo1:'Tipo 4', tipo2:'Tipo 6', tipo3:'Tipo 8', tipo4:'Tipo 10', tipo5:'Tipo 12',
  pdg:'PdG', eva:'Eva', ini:'Iniciativa', mov:'Mov', parry:'Parry', crit:'Crítico frecuente', critpot:'Crítico potente',
  bonos:'Bonos', rangocasteo:'Rango Cast.', accionesmax:'Acciones máx.', nitros:'No2',
  resm:'Res.Mt', resmg:'Res.Esp', rescc:'Res.CC',
  con:'Con', fue:'Fue', agl:'Agi', des:'Des', esp:'Esp',
};
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
    const label = TIPO_STAT_A_CRIT_IDX[m.stat] !== undefined ? `Res.Crít. ${STAT_LABEL_GM[m.stat]}` : (STAT_LABEL_GM[m.stat] || m.stat);
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
  const statTxt = esArma
    ? `Daño ${Math.max(1,item.peso)}d${item.tipoDado}${item.danoFijo?` +${item.danoFijo}`:''}`
    : (esCons ? (item.curahp ? `Cura ${fmt(item.curahp)} HP` : 'Consumible') : `Defensa +${item.def}`);
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
  item = {tipoItem: 'otros', ...item};
  const linea = (label, val) => (val === '' || val === null || val === undefined)
    ? '' : `<div class="view-line"><span class="view-label">${esc(label)}</span><span class="view-value">${esc(val)}</span></div>`;
  const esArma = item.tipoItem.startsWith('arma_');
  const esCons = item.tipoItem === 'consumibles';
  const L = [];
  L.push(linea('Categoría', TIPOITEM_LABEL_GM[item.tipoItem] || item.tipoItem));
  if(item.tier) L.push(linea('Rareza', item.tier));
  if(esArma) L.push(linea('Daño', `${Math.max(1,num(item.peso))}d${num(item.tipoDado)||8}${num(item.danoFijo)?` +${fmt(num(item.danoFijo))}`:''}`));
  if(item.def) L.push(linea('Defensa', `${num(item.def)>0?'+':''}${fmt(num(item.def))}`));
  L.push(linea('Peso', fmt(num(item.peso))));
  // Durabilidad (variable de diseño del ítem, comun/combatiente.js). Los creeps no la gastan: importa si lo sueltan o se publica.
  if(Combatiente.durTexto(item)) L.push(linea('Durabilidad', Combatiente.durTexto(item)));
  if(item.precioCompra !== undefined) L.push(linea('Precio', `${fmt(num(item.precioCompra))} DDE${item.estimado ? ' (estimado por comparación con el catálogo)' : ''}`));
  if(item.trofeo) L.push(linea('Trofeo', 'No se equipa: se vende en una tienda o se convierte en despojos'));
  if(esArma && (item.efectosGolpe || []).length) L.push(linea('Al golpear', EfectosGolpe.resumenLista(item.efectosGolpe)));
  if(esCons) L.push(linea('Consumible', item.curahp ? `${num(item.curahp)>0?'+':''}${fmt(num(item.curahp))} HP al consumir` : 'Sin efecto numérico'));
  const otros = (item.mods || []).filter(m => m.stat && m.stat !== 'def');
  if(otros.length) L.push(linea('Otros modificadores', otros.map(m => `${STAT_LABEL_GM[m.stat]||m.stat} ${num(m.val)>0?'+':''}${fmt(num(m.val))}`).join(', ')));

  $('#veritem-titulo').textContent = item.nombre || 'Ítem';
  $('#veritem-body').innerHTML = `
    <div class="view-wrap">
      <div class="view-image-wrap">${item.imagen ? `<img src="${esc(item.imagen)}" class="view-image" alt="">` : `<span class="view-image-empty">Sin imagen</span>`}</div>
      <div class="view-info">
        <div class="view-title">${esc(item.nombre)}</div>
        <div class="view-lines">${L.filter(Boolean).join('')}</div>
      </div>
    </div>
    ${item.detalle ? `<div class="view-detalle"><span class="view-label">Detalle</span>${esc(item.detalle)}</div>` : ''}
    ${(item.descripcionNarrativa||'').trim() ? `<div class="view-detalle view-narrativa">${esc(item.descripcionNarrativa)}</div>` : ''}
  `;
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

const TIPOITEM_LABEL_GM = {
  escudo_1m:'Escudo 1 mano', escudo_2m:'Escudo 2 manos',
  armadura_blanda:'Armadura blanda', armadura_rigida:'Armadura rígida',
  manos:'Manos', cabeza:'Cabeza', pies:'Pies', piernas:'Piernas',
};
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
  if(!item.tipoItem.startsWith('arma_')){
    const mods = structuredClone(item.mods || []);
    sc.defensa = num(sc.defensa) + num(item.def);
    aplicarModsEquipo(sc, mods, 1);
    sc.equipo = sc.equipo || [];
    sc.equipo.push({id: uid(), nombre: item.nombre, tipoItem: item.tipoItem, def: num(item.def), mods, detalle: item.detalle || ''});
    actualizarArmaduraTipo(sc);
    if(modsAfectanHp(mods)) actualizarHpMaxPorCon(sc);
    toast(`${sc.nombre} equipado con ${item.nombre}`);
  }else{
    sc.armaTipo = item.tipoDado;
    sc.armaPeso = Math.max(1, item.peso);
    sc.armaFijo = item.danoFijo;
    sc.armaAmplificado = num(item.danoAmplificado);
    sc.armaDeRango = !!item.armaDeRango;
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

let editingHabCreep = null;   // {scId, habId (null = nueva), paso}

/* Habilidades de creeps: editor paso a paso, como el de la ficha pero con
   lo que tiene un creep (sin SP ni Job; con cooldown y "otro costo"). Al
   crear, Guardar aparece en el último paso; al editar, siempre. */
const PASOS_HAB_CREEP = [
  {corto: 'Qué es', titulo: '¿Cómo se llama y qué hace?',
   ayuda: 'Esta descripción se lee en la Mesa cada vez que el creep la usa.'},
  {corto: 'Costo', titulo: '¿Cuánto le cuesta y cada cuánto la puede usar?',
   ayuda: 'Los No2 se recargan en cada Mantenimiento.'},
  {corto: 'Tirada al ejecutar', titulo: '¿Qué se tira al tocar Ejecutar?',
   ayuda: "Lo que se tira apenas tocás Ejecutar: elegí el stat del golpe o de la prueba (por ejemplo PdG para un ataque). Es la PRIMERA tirada, de golpe. Si no elegís ninguno, Ejecutar no tira un stat (y si en el paso siguiente hay una fórmula, Ejecutar tira esa fórmula directamente). Si la habilidad incluye un ataque (o cuesta lo mismo que uno), conviene elegir PdG."},
  {corto: 'Tirada de efecto', titulo: '¿Tiene una tirada de efecto (daño, curación…)?',
   ayuda: "La tirada interna de la habilidad: daño, curación, duración… (por ejemplo 2d6+3). Aparece como un botoncito 🎲 en la misma tarjeta, al lado de Ejecutar, y solo si esta tirada existe y hay un stat en el paso anterior. Sin stat, Ejecutar tira esta fórmula directamente y no hay botón aparte. Se puede dejar vacía."},
  {corto: 'Estado', titulo: '¿Le aplica un estado alterado?',
   ayuda: 'Se aplica sobre el propio creep al ejecutarla. Si no aplica ninguno, dejá el nombre vacío y seguí.'},
  {corto: '🪤 Trampa', titulo: '¿Coloca una trampa en el mapa?',
   ayuda: 'Al ejecutarla, la habilidad deja sola una trampa oculta a los jugadores al lado del token del creep. Acá elegís qué trampa es, cuánto daño hace y qué estado deja, o se la sacás.'},
  {corto: 'Listo', titulo: 'Revisá cómo quedó',
   ayuda: 'Si algo no está bien, tocá el paso arriba para volver. Si está todo, guardala.'},
  {corto: 'Cómo se ejecuta', titulo: '¿Cómo se ejecuta esta habilidad?',
   ayuda: 'Tres formas, de menos a más automática. Se puede cambiar cuando quieras.'},
  {corto: 'Ejecución', titulo: '¿Cómo se juega paso a paso?',
   ayuda: 'A quién apunta, qué tira cada uno, el daño y los efectos: el mismo cuadro de Ejecución que se abre para toda la mesa al usarla.'},
];
// Qué pasos (índices de PASOS_HAB_CREEP / data-hc-paso) muestra el editor según el modo. Lo del sistema anterior (estado propio,
// trampa al lado del token) aparece en semi solo si la habilidad ya lo tenía; en auto la trampa es una opción más (se elige la casilla).
function hcOrden(){
  const m = editingHabCreep && editingHabCreep.modo;
  const conEstado = !!$('#hc-efecto-nombre').value.trim(), conTrampa = $('#hc-trampa-on').checked;
  if(m === 'semi') return [7, 0, 1, 2, 3, ...(conEstado ? [4] : []), ...(conTrampa ? [5] : []), 6];
  if(m === 'auto') return [7, 0, 1, 8, 5, ...(conEstado ? [4] : []), 6];
  return [7, 0, 6];
}
function hcModosRender(){
  const m = editingHabCreep.modo;
  $('#hc-modos').innerHTML = Object.entries(MODOS_HAB_CREEP).map(([k, v]) => `<button type="button" class="opcion-btn modo-hab-btn ${m === k ? 'activa' : ''}" data-hc-modo="${k}"><b>${v.icono} ${v.nombre}</b><span>${v.explica}</span></button>`).join('')
    + (m === null ? '<div class="hint">Elegí una para seguir.</div>' : '');
}
function hcEjecucionRender(){
  const c = editingHabCreep.duelo;
  const OBJ = {enemigo: 'a un enemigo', aliado: 'a un aliado', 'uno mismo': 'sobre el creep', area: 'en un área', onda: 'onda alrededor', zona: 'zona persistente'};
  $('#hc-ejecucion-resumen').innerHTML = c
    ? `Configurada: <b>${esc(c.modo === 'arma' ? 'ataque con su arma' : (OBJ[c.objetivo] || c.objetivo || 'a un enemigo') + (c.tira ? ' · tira ' + habEtqCreep(c.tira) : '') + (c.dano ? ' · hace daño' : '') + ((c.efectos || []).length ? ' · ' + c.efectos.map(e => e.nombre || 'efecto').join(', ') : ''))}</b>. Si además coloca una trampa, está en el paso siguiente.`
    : 'Todavía <b>no está configurada</b>. Si la habilidad solo coloca una trampa, alcanza con el paso siguiente (🪤); si no, armala acá.';
  $('#hc-ejecucion-abrir').textContent = `✨ ${c ? 'Cambiar' : 'Armar'} la ejecución paso a paso`;
}
function hcAbrirEjecucion(){
  const e = editingHabCreep;
  AsistenteDueloHab.abrir({nombre: $('#hc-nombre').value.trim() || 'Habilidad', inicial: e.duelo || null, siempreActivo: true, tieneFormula: !!$('#hc-tirada').value.trim(),
    costoInicial: {sp: $('#hc-costo').value, nitrosCosto: $('#hc-nitros-modo').value === 'ataque' ? 'ATAQUE' : num($('#hc-acciones').value), hpCosto: num($('#hc-hpcosto').value)}, elegirEstado: elegirEstadoDuelo,
    alGuardar: r => {
      if(editingHabCreep !== e) return;
      if(r){
        e.duelo = r.duelo;
        $('#hc-costo').value = r.costo.sp || '';
        if(r.costo.nitrosCosto === 'ATAQUE'){ $('#hc-nitros-modo').value = 'ataque'; }
        else{ $('#hc-nitros-modo').value = 'num'; $('#hc-acciones').value = Math.max(0, num(r.costo.nitrosCosto)); }
        $('#hc-hpcosto').value = Math.max(0, num(r.costo.hpCosto));
        hcAplicarModoNitros();
      }else{ e.duelo = null; e.modo = 'semi'; }
      hcMostrarPaso(e.paso);
    }});
}

// Modo de costo de Nitros: número o "lo mismo que un ataque" (con su arma).
function hcAplicarModoNitros(){
  const modo = $("#hc-nitros-modo").value;
  document.querySelectorAll("[data-hc-nitros-modo]").forEach(b => b.classList.toggle("activa", b.dataset.hcNitrosModo === modo));
  $("#hc-acciones-caja").style.visibility = modo === "ataque" ? "hidden" : "visible";
  const sc = editingHabCreep && S.creeps.find(s => s.id === editingHabCreep.scId);
  $("#hc-ataque-ayuda").textContent = modo === "ataque"
    ? `Cuesta lo mismo que un ataque con su arma (Tipo ÷ 2 el primero del turno, Tipo completo después) y cuenta como ese ataque.${sc ? ` Hoy: ${fmt(costoAtaqueCreep(sc))} No2.` : ""}`
    : "Siempre gasta esa cantidad.";
}

// `n` es la posición dentro de los pasos visibles (hcOrden), no el índice de PASOS_HAB_CREEP.
function hcMostrarPaso(n){
  if(!editingHabCreep) return;
  const orden = hcOrden(), total = orden.length;
  let destino = Math.max(0, Math.min(total - 1, n));
  if(destino > 0 && editingHabCreep.modo === null){ toast('Primero elegí cómo se ejecuta'); destino = 0; }
  else if(destino > 1 && !$('#hc-nombre').value.trim()){ toast('Primero ponele un nombre'); destino = 1; }
  editingHabCreep.paso = destino;
  const paso = destino, idx = orden[paso];
  const nueva = !editingHabCreep.habId && !editingHabCreep.borrador;
  const listoParaSeguir = editingHabCreep.modo !== null && !!$('#hc-nombre').value.trim();
  $('#hc-pasos').innerHTML = orden.map((ix, i) => {
    const bloqueado = nueva && i > paso && !listoParaSeguir;
    return `<button type="button" class="paso-chip${i === paso ? ' activo' : ''}${i < paso ? ' hecho' : ''}" data-hc-ir="${i}" ${bloqueado ? 'disabled' : ''}>${i + 1}. ${PASOS_HAB_CREEP[ix].corto}</button>`;
  }).join('');
  $('#hc-paso-titulo').textContent = PASOS_HAB_CREEP[idx].titulo;
  $('#hc-paso-ayuda').textContent = PASOS_HAB_CREEP[idx].ayuda;
  document.querySelectorAll('#scrim-hab-creep .hc-paso').forEach(el => { el.hidden = num(el.dataset.hcPaso) !== idx; });
  if(idx === 7) hcModosRender();
  if(idx === 8) hcEjecucionRender();
  $('#hc-atras').style.visibility = paso > 0 ? 'visible' : 'hidden';
  $('#hc-siguiente').hidden = paso === total - 1;
  $('#habcreep-guardar').hidden = nueva && paso !== total - 1;
  if(paso === total - 1) $('#hc-resumen').innerHTML = hcResumenHtml();
  const primero = document.querySelector(`#scrim-hab-creep .hc-paso[data-hc-paso="${idx}"] input:not([type=hidden]),#scrim-hab-creep .hc-paso[data-hc-paso="${idx}"] select,#scrim-hab-creep .hc-paso[data-hc-paso="${idx}"] textarea`);
  if(primero) setTimeout(() => primero.focus(), 30);
}

// Stats que un creep puede tirar en una habilidad: los 5 atributos y los
// secundarios con tirada (los mismos que ofrece la ficha).
const HC_STATS_SECUNDARIOS = ["resmg", "rescc", "bloqueo", "eva", "ini", "pdg", "parry", "pdgmg", "resm", "percepcion"];
function hcStatLabel(id){
  const d = id ? CREEP_STAT_LOOKUP[id] : null;
  return d ? (ATTR_NOMBRE[id] || d.label) : "";
}
function hcOpcionesStat(elegido){
  const op = id => `<option value="${id}" ${elegido === id ? "selected" : ""}>${esc(hcStatLabel(id))}</option>`;
  return '<option value="">— no tira un stat —</option>' +
    `<optgroup label="Principales">${["con", "fue", "agl", "des", "esp"].map(op).join("")}</optgroup>` +
    `<optgroup label="Secundarios">${HC_STATS_SECUNDARIOS.filter(id => CREEP_STAT_LOOKUP[id]).map(op).join("")}</optgroup>`;
}

