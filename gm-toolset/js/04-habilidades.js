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

const TIER_COLOR = {'Común':'#9A867E', 'Buena Calidad':'#A8C256', 'Raro':'#5B8DBE', 'Excepcional':'#E0A458', 'Legendario':'#9B7BD4', 'A definir':'#D4574E'};
const STAT_LABEL_GM = CreepCalculo.STAT_LABEL;   // comun/creep-calculo.js
const STAT_FULL_GM = {
  tipo1:'Resistencia a crítico Tipo 4', tipo2:'Resistencia a crítico Tipo 6', tipo3:'Resistencia a crítico Tipo 8',
  tipo4:'Resistencia a crítico Tipo 10', tipo5:'Resistencia a crítico Tipo 12',
  pdg:'Probabilidad de golpe', eva:'Evasión', ini:'Iniciativa', mov:'Movimiento', parry:'Parry', crit:'Crítico frecuente (baja el rango del crítico)', critpot:'Crítico potente (baja los umbrales del d20)',
  bonos:'Bonos', rangocasteo:'Rango', accionesmax:'Acciones máximas', nitros:'Nitros',
  resm:'Resistencia mental', resmg:'Resistencia especial', rescc:'Resistencia a CC',
  con:'Constitución', fue:'Fuerza', agl:'Agilidad', des:'Destreza', esp:'Especial',
};
const SLOT_MAP_GM = CreepCalculo.SLOT_MAP;   // comun/creep-calculo.js

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

// El filtro (comun/filtro-catalogo.js, 2026-10-08): el mismo de la tienda, con «De dónde sale». Devuelve pares {it, idx}: el idx en
// CATALOGO_EQUIPO lo necesita el botón Equipar. El ítem al azar respeta los filtros activos.
let equipoFiltro = null;
function filtroEquipo(){
  if(!equipoFiltro) equipoFiltro = FiltroCatalogo.crear($('#equipar-creep-filtros'), {base: () => CATALOGO_EQUIPO, origen: true, clave: 'equipo-creep',
    alCambiar: () => renderEquiparCreepLista()});
  return equipoFiltro;
}
function conIndice(items){ const idx = new Map(CATALOGO_EQUIPO.map((it, i) => [it, i])); return items.map(it => ({it, idx: idx.get(it)})); }
function equiparCreepVisibles(){ return conIndice(filtroEquipo().filtrar()); }

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

function elegirItemAleatorioGM(){
  const visibles = equiparCreepVisibles();
  if(!visibles.length){ toast('No hay ítems que coincidan con los filtros activos'); return; }
  const {it, idx} = visibles[Math.floor(Math.random() * visibles.length)];
  $('#item-aleatorio-gm-body').innerHTML = `<div class="cat-grid">${equipoItemHtml(it, idx)}</div>`;
  $('#scrim-item-aleatorio-gm').classList.add('open');
}

function renderEquiparCreepLista(){
  const fe = filtroEquipo();
  fe.actualizar();
  const html = fe.agrupar(fe.filtrar()).map(g => `<div class="cat-grouphead">${esc(g.label)} · ${fmt(g.items.length)}</div>
    <div class="cat-grid">${conLegacyPrimeroGM(conIndice(g.items)).map(({it, idx}) => equipoItemHtml(it, idx)).join('')}</div>`).join('');
  $('#equipar-creep-lista').innerHTML = html || `<div class="hint">No hay ítems con esos filtros. Probá sacar alguno (✕ Limpiar todo).</div>`;
}

function abrirEquiparCreep(scId){
  equipandoCreepId = scId;
  filtroEquipo().limpiar();
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

