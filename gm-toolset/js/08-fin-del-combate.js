// js/08-fin-del-combate.js — tramo 8 de 12 del script de gm-tools.html (paso 5, nivel A: mismo código, en el mismo orden).
/* =========================================================
   FINALIZAR COMBATE — resumen de XP y loot
   ========================================================= */

// XP base por nivel: 40 × nivel, más un bonus escalonado que crece con
// el nivel (progresión triangular: 5 × nivel × (nivel-1)). Da 40/90/150
// para nivel 1/2/3 — coincide con el ejemplo original. Para nivel 4 da
// 220 en vez de los 200 del ejemplo (que no encajaba con la progresión
// de los niveles anteriores); queda para ajustar junto con el resto
// del sistema de recompensas en una próxima iteración.
function xpBasePorNivel(nivel){
  const n = Math.max(1, num(nivel) || 1);
  return 40 * n + 5 * n * (n - 1);
}

// XP que da un creep que escapó, sobre la que daría derrotado.
const XP_ESCAPO_PCT = 0.2;

/* ---------- Reporte del combate: XP, oro, ítems y jugadores; se publica a las fichas ----------
   El GM revisa y ajusta (ítems, XP, oro, quién cobra) y publica: cada jugador recibe su XP y su oro solos en la
   ficha (campanas/<id>/recompensas) y los ítems quedan en el botín para tomarlos (campanas/<id>/botin). */
let xpContarEscapados = true;
let combateRep = nuevoCombateRep();
function nuevoCombateRep(){ return {oro: {}, extra: {}, xpPorJugador: null, ddePorJugador: null, quitados: new Set(), extras: [], jugadores: null, cargando: false, publicando: false, enMapa: null}; }

/* Solo cuentan para la recompensa los creeps que tienen un token vinculado en el MAPA PUBLICADO (el que ven los jugadores):
   en gm-tools puede haber muchos creeps armados de antemano que no están en la pelea. */
async function cargarCreepsEnMapa(){
  if(!fbDb || !fbMiembro){ combateRep.enMapa = new Set(S.creeps.map(s => s.id)); renderReporteCombate(); return; }
  try{
    const act = await fbDb.doc(fbRutaCampana('mapa/activo')).get();
    const mapaId = act.exists && act.data().mapaId ? act.data().mapaId : '_principal';
    const ruta = mapaId === '_principal' ? 'tokens' : `mapas/${mapaId}/tokens`;
    const snap = await fbDb.collection(fbRutaCampana(ruta)).get();
    combateRep.enMapa = new Set(snap.docs.map(d => d.data()).filter(t => t.tipo === 'creep' && t.fichaId).map(t => t.fichaId));
  }catch(err){
    console.error('No se pudieron leer los tokens del mapa publicado:', err);
    combateRep.enMapa = new Set();
    toast('No se pudo leer el mapa publicado: no hay creeps para repartir');
  }
  renderReporteCombate();
}

// El oro se tira UNA sola vez por creep (±20% sobre su valor base) y no se recalcula al reabrir el reporte.
function oroDeCreep(sc){
  if(combateRep.oro[sc.id] === undefined){
    const base = num(sc.oroBase);
    combateRep.oro[sc.id] = base > 0 ? Math.max(0, Math.round(base * (1 + (Math.random() * 0.4 - 0.2)))) : 0;
  }
  return combateRep.oro[sc.id];
}

/* --- Ítems que suelta un creep, ya con la forma de un ítem de la ficha --- */
function medianaPrecio(lista){
  const v = lista.map(i => num(i.precioCompra)).filter(x => x > 0).sort((a, b) => a - b);
  return v.length ? v[Math.floor(v.length / 2)] : 0;
}
function tierPorPrecio(p){ return p <= 120 ? 'Común' : p <= 170 ? 'Buena Calidad' : p <= 500 ? 'Raro' : 'Excepcional'; }   // los rangos del catálogo
function ajustePorEfectos(mods, efectos){
  const suma = (mods || []).filter(m => m.stat !== 'def' && num(m.val) > 0).reduce((a, m) => a + num(m.val), 0);
  return suma * 8 + (efectos || []).length * 40;
}
// Precio estimado de un arma que no está en el catálogo: mediana de las de su Tipo y peso, ajustada por bonos y efectos.
// El pool de comparación es de la rareza que corresponde al nivel del creep (1–2 Común, 3–4 hasta Buena Calidad, 5 todas).
function poolPorNivel(lista, nivel){
  const n = num(nivel) || 1;
  const ok = lista.filter(i => n <= 2 ? i.tier === 'Común' : n <= 4 ? (i.tier === 'Común' || i.tier === 'Buena Calidad') : true);
  return ok.length ? ok : lista;
}
function precioEstimadoArma(d, nivel){
  const armas = poolPorNivel(CATALOGO_EQUIPO.filter(i => /^arma_/.test(i.tipoItem)), nivel);
  let base = medianaPrecio(armas.filter(i => num(i.tipoDado) === num(d.tipoDado) && num(i.peso) === num(d.peso)));
  if(!base) base = medianaPrecio(armas.filter(i => num(i.tipoDado) === num(d.tipoDado)));
  if(!base) base = 60;
  return Math.max(20, Math.round((base + ajustePorEfectos(d.mods, d.efectosGolpe)) / 5) * 5);
}
// Ídem para una pieza de defensa: mediana de las de su categoría y Defensa parecida.
function precioEstimadoEquipo(d, nivel){
  const piezas = poolPorNivel(CATALOGO_EQUIPO.filter(i => i.tipoItem === d.tipoItem), nivel);
  let base = medianaPrecio(piezas.filter(i => Math.abs(num(i.def) - num(d.def)) <= 1));
  if(!base) base = Math.max(30, num(d.def) * 25);
  return Math.max(20, Math.round((base + ajustePorEfectos(d.mods, [])) / 5) * 5);
}
function plantillaDeCatalogo(c){
  const mods = [...(c.mods || [])];
  if(num(c.def)) mods.unshift({stat: 'def', val: num(c.def)});
  return {nombre: c.nombre, tipoItem: c.tipoItem, tier: c.tier || 'Común', peso: num(c.peso), ranuras: num(c.ranuras) || 0, precioCompra: num(c.precioCompra),
    tipoDado: num(c.tipoDado), danoFijo: num(c.danoFijo), danoAmplificado: num(c.danoAmplificado), armaDeRango: !!c.armaDeRango, mods,
    efectosGolpe: structuredClone(c.efectosGolpe || []), detalle: c.detalle || '', descripcionNarrativa: c.descripcionNarrativa || '', consumible: false};
}
function plantillaArmaCreep(sc){
  const c = CATALOGO_EQUIPO.find(i => i.nombre === sc.armaNombre && /^arma_/.test(i.tipoItem));
  if(c) return {...plantillaDeCatalogo(c), estimado: false};
  const d = {tipoDado: num(sc.armaTipo) || 8, peso: Math.max(1, num(sc.armaPeso) || 1), mods: structuredClone(sc.armaMods || []), efectosGolpe: structuredClone(sc.armaEfectos || [])};
  const precio = precioEstimadoArma(d, sc.nivel);
  return {nombre: sc.armaNombre, tipoItem: sc.armaManos || 'arma_1m', tier: tierPorPrecio(precio), peso: d.peso, ranuras: 0, precioCompra: precio,
    tipoDado: d.tipoDado, danoFijo: num(sc.armaFijo), danoAmplificado: num(sc.armaAmplificado), armaDeRango: !!sc.armaDeRango, mods: d.mods, efectosGolpe: d.efectosGolpe,
    detalle: sc.armaDetalle || '', descripcionNarrativa: `Arma de ${nombreLimpioCreep(sc)}.`, consumible: false, estimado: true};
}
function plantillaEquipoCreep(it, nivel){
  const c = CATALOGO_EQUIPO.find(i => sinAviso(i.nombre) === sinAviso(it.nombre) && i.tipoItem === it.tipoItem);
  if(c) return {...plantillaDeCatalogo(c), estimado: false};
  const mods = [...(it.mods || [])];
  if(num(it.def)) mods.unshift({stat: 'def', val: num(it.def)});
  const precio = precioEstimadoEquipo({tipoItem: it.tipoItem, def: it.def, mods: it.mods}, nivel);
  return {nombre: it.nombre, tipoItem: it.tipoItem, tier: tierPorPrecio(precio), peso: 1, ranuras: 0, precioCompra: precio, tipoDado: 0, danoFijo: 0, danoAmplificado: 0,
    armaDeRango: false, mods, efectosGolpe: [], detalle: it.detalle || '', descripcionNarrativa: '', consumible: false, estimado: true};
}
function plantillaTrofeo(tr, sc){
  return {nombre: tr.nombre, tipoItem: 'otros', tier: 'Común', peso: 0, ranuras: 1, precioCompra: tr.precioCompra, tipoDado: 0, danoFijo: 0, danoAmplificado: 0, armaDeRango: false,
    mods: [], efectosGolpe: [], detalle: `Trofeo de ${nombreLimpioCreep(sc)}. No se equipa: se vende en una tienda o se convierte en despojos.`,
    descripcionNarrativa: 'Un recuerdo de una pelea que salió bien.', consumible: false, trofeo: true, estimado: false};
}
function itemsDeCreep(sc){
  const out = [];
  const nom = nombreLimpioCreep(sc);
  if(sc.armaNombre && !sc.armaNatural){ const t = plantillaArmaCreep(sc); out.push({clave: `${sc.id}:arma`, nombre: t.nombre, precioCompra: t.precioCompra, template: t, origen: nom}); }
  (sc.equipo || []).forEach(it => { const t = plantillaEquipoCreep(it, sc.nivel); out.push({clave: `${sc.id}:eq:${it.id}`, nombre: t.nombre, precioCompra: t.precioCompra, template: t, origen: nom}); });
  const tr = trofeoDeCreep(sc);
  if(tr) out.push({clave: `${sc.id}:trofeo`, nombre: tr.nombre, precioCompra: tr.precioCompra, template: plantillaTrofeo(tr, sc), origen: nom, trofeo: true});
  return out;
}
function itemsExtraDelReporte(){
  return combateRep.extras.map((e, i) => ({clave: `extra:${i}`, nombre: e.nombre, precioCompra: e.precioCompra, origen: 'Botín extra',
    template: {nombre: e.nombre, tipoItem: 'otros', tier: 'Común', peso: 0, ranuras: 1, precioCompra: e.precioCompra, tipoDado: 0, danoFijo: 0, danoAmplificado: 0, armaDeRango: false,
      mods: [], efectosGolpe: [], detalle: '', descripcionNarrativa: '', consumible: false, estimado: false}}));
}

function generarReporteCombate(contarEscapados){
  const filas = S.creeps.filter(sc => !sc.recompensado && combateRep.enMapa && combateRep.enMapa.has(sc.id)).map(sc => {
    const derrotado = num(sc.hp) <= 0;
    const xpBase = xpBasePorNivel(sc.nivel);
    const xp = derrotado ? xpBase : Math.round(xpBase * XP_ESCAPO_PCT);
    const cuenta = derrotado || contarEscapados;
    return {sc, derrotado, xp, cuenta, oro: derrotado ? oroDeCreep(sc) : 0, items: derrotado ? itemsDeCreep(sc) : []};
  });
  const xpTotal = filas.reduce((a, f) => a + (f.cuenta ? f.xp : 0), 0);
  return {filas, xpTotal};
}

/* --- Jugadores: las fichas de la partida, con su estado al terminar el combate --- */
function estadoDeFicha(f){
  const r = f.resumen || {};
  if(r.hp !== undefined && num(r.hp) <= 0) return r.muertoDef ? 'muerto' : 'inconsciente';
  return 'en pie';
}
async function cargarJugadoresCombate(){
  if(combateRep.cargando || !fbDb || !fbMiembro) return;
  combateRep.cargando = true;
  try{
    const [fichas, miembros] = await Promise.all([fbDb.collection(fbRutaCampana('fichas')).get(), fbDb.collection(fbRutaCampana('miembros')).get()]);
    const nombres = new Map(miembros.docs.map(d => [d.id, String(d.data().nombre || '')]));
    const previos = new Map((combateRep.jugadores || []).map(j => [j.id, j]));
    combateRep.jugadores = fichas.docs.map(d => ({id: d.id, nombre: String(d.data().nombre || 'Sin nombre'), duenoUid: d.data().duenoUid, dueno: nombres.get(d.data().duenoUid) || '',
      estado: estadoDeFicha(d.data()), incluido: previos.has(d.id) ? previos.get(d.id).incluido : true}))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  }catch(err){
    console.error('No se pudieron leer los personajes:', err);
    combateRep.jugadores = combateRep.jugadores || [];
  }finally{
    combateRep.cargando = false;
    renderReporteCombate();
  }
}
const FACTOR_XP_ESTADO = {'en pie': 1, inconsciente: 0.25, muerto: 0};

// El reparto de XP y de oro entre los jugadores incluidos.
function calcularReparto(rep){
  const incluidos = (combateRep.jugadores || []).filter(j => j.incluido);
  const n = incluidos.length;
  const xpTotal = Math.max(0, rep.xpTotal);
  const oroTotal = Math.max(0, rep.filas.reduce((a, f) => a + (f.derrotado ? f.oro : 0), 0));
  const xpBase = n ? Math.ceil(xpTotal / n) : 0;            // como si todos estuvieran vivos, redondeo hacia arriba
  const ddeCada = n ? Math.ceil(oroTotal / n) : 0;
  // Lo que el GM fija: un valor por jugador que vale para todos (si no toca nada, el calculado) y, aparte, un extra de cada uno
  // por circunstancias particulares. El inconsciente cobra el 25% del valor por jugador (hacia abajo) y el muerto nada; el extra se suma encima.
  const xpValor = combateRep.xpPorJugador !== null ? combateRep.xpPorJugador : xpBase;
  const ddeValor = combateRep.ddePorJugador !== null ? combateRep.ddePorJugador : ddeCada;
  const porJugador = incluidos.map(j => {
    const ex = combateRep.extra[j.id] || {};
    const xpParte = Math.floor(xpValor * FACTOR_XP_ESTADO[j.estado]);
    return {j, xpParte, ddeParte: ddeValor, xpExtra: num(ex.xp), ddeExtra: num(ex.dde),
      xp: Math.max(0, xpParte + num(ex.xp)), dde: Math.max(0, Math.round((ddeValor + num(ex.dde)) * 100) / 100)};
  });
  return {n, xpTotal, oroTotal, xpBase, ddeCada, xpValor, ddeValor, porJugador};
}
function itemsPublicables(rep){
  const todos = [...rep.filas.flatMap(f => f.items), ...itemsExtraDelReporte()];
  return todos.filter(i => !combateRep.quitados.has(i.clave));
}

function renderReporteCombate(){
  if(combateRep.enMapa === null){
    $('#finalizar-combate-body').innerHTML = `<div class="hint">Buscando los creeps que están en el mapa publicado…</div>`;
    $('#finalizar-combate-publicar').style.display = 'none';
    return;
  }
  const rep = generarReporteCombate(xpContarEscapados);
  if(!rep.filas.length){
    $('#finalizar-combate-body').innerHTML = `<div class="hint">No hay creeps para repartir. Solo cuentan los creeps con un <b>token vinculado en el mapa publicado</b> que todavía no se repartieron.</div>`;
    $('#finalizar-combate-publicar').style.display = 'none';
    return;
  }
  $('#finalizar-combate-publicar').style.display = '';
  if(combateRep.jugadores === null && !combateRep.cargando) cargarJugadoresCombate();
  const {filas} = rep;
  const rp = calcularReparto(rep);
  const hayEscapados = filas.some(f => !f.derrotado);
  const filasHtml = filas.map(f => `
    <div class="reporte-fila${f.cuenta ? '' : ' no-cuenta'}">
      <span class="reporte-nombre">${esc(f.sc.nombre)}<span class="reporte-nivel">Lv ${fmt(num(f.sc.nivel))}</span></span>
      <span class="reporte-estado ${f.derrotado ? 'derrotado' : 'escapo'}">${f.derrotado ? 'Derrotado' : 'Escapó'}</span>
      <span class="reporte-xp" title="${f.cuenta ? '' : 'No se cuenta en el total'}">+${fmt(f.xp)} XP${f.derrotado && f.oro ? ` · ${fmt(f.oro)} DDE` : ''}</span>
    </div>`).join('');

  const itemHtml = i => `<label class="reporte-loot-item" style="cursor:pointer;display:inline-flex;gap:5px;align-items:center${combateRep.quitados.has(i.clave) ? ';opacity:.45' : ''}" title="${i.template.estimado ? 'Precio estimado por comparación con el catálogo' : ''}">
      <input type="checkbox" data-rep-item="${esc(i.clave)}"${combateRep.quitados.has(i.clave) ? '' : ' checked'}>${esc(i.nombre)}${i.trofeo ? ' 🏆' : ''} <span class="reporte-loot-precio">${fmt(i.precioCompra)} DDE${i.template.estimado ? ' (est.)' : ''}</span><button type="button" class="iconbtn" data-rep-ver="${esc(i.clave)}" style="padding:2px 8px;font-size:11px">Ver</button></label>`;
  const conItems = filas.filter(f => f.items.length);
  const extras = itemsExtraDelReporte();
  const lootHtml = (conItems.length || extras.length)
    ? conItems.map(f => `<div class="reporte-loot-creep"><div class="reporte-loot-nombre">${esc(f.sc.nombre)}</div><div class="reporte-loot-items">${f.items.map(itemHtml).join('')}</div></div>`).join('')
      + (extras.length ? `<div class="reporte-loot-creep"><div class="reporte-loot-nombre">Botín extra</div><div class="reporte-loot-items">${extras.map(itemHtml).join('')}</div></div>` : '')
    : `<div class="hint">Ningún creep derrotado suelta ítems.</div>`;

  const jug = combateRep.jugadores;
  const jugHtml = jug === null ? '<div class="hint">Cargando personajes…</div>'
    : jug.length ? jug.map(j => {
        const p = rp.porJugador.find(x => x.j === j);
        return `<label class="reporte-fila${j.incluido ? '' : ' no-cuenta'}" style="cursor:pointer;gap:8px;align-items:center">
          <input type="checkbox" data-rep-jug="${esc(j.id)}"${j.incluido ? ' checked' : ''}>
          <span class="reporte-nombre">${esc(j.nombre)}${j.dueno ? `<span class="reporte-nivel">${esc(j.dueno)}</span>` : ''}</span>
          <span class="reporte-estado ${j.estado === 'en pie' ? 'escapo' : 'derrotado'}">${esc(j.estado)}</span>
          ${j.incluido ? `<span class="rep-valor" title="Extra por circunstancias particulares (puede ser negativo)"><span class="hint" style="font-weight:400">extra</span> <input type="number" step="1" class="rep-num${p.xpExtra ? ' editado' : ''}" data-rep-xp="${esc(j.id)}" value="${p.xpExtra}"> XP</span>
            <span class="rep-valor" title="Extra por circunstancias particulares (puede ser negativo)"><input type="number" step="1" class="rep-num${p.ddeExtra ? ' editado' : ''}" data-rep-dde="${esc(j.id)}" value="${p.ddeExtra}"> DDE</span>
            <span class="rep-final" title="Lo que va a recibir">= <b>+${fmt(p.xp)}</b> XP · <b>+${fmt(p.dde)}</b> DDE</span>` : '<span class="reporte-xp">sin recompensas</span>'}</label>`;
      }).join('')
    : '<div class="hint">Todavía no hay personajes en la partida.</div>';

  $('#finalizar-combate-body').innerHTML = `
    <div>
      <div class="reporte-seccion-titulo">Lo que recibe cada jugador</div>
      <div class="rep-por-jugador">
        <label>Experiencia por jugador <input type="number" min="0" step="1" class="rep-num rep-num-grande${combateRep.xpPorJugador !== null ? ' editado' : ''}" id="rep-xp-todos" value="${rp.xpValor}"> XP</label>
        <label>Oro por jugador <input type="number" min="0" step="1" class="rep-num rep-num-grande${combateRep.ddePorJugador !== null ? ' editado' : ''}" id="rep-dde-todos" value="${rp.ddeValor}"> DDE</label>
        ${(combateRep.xpPorJugador !== null || combateRep.ddePorJugador !== null) ? `<button type="button" class="iconbtn" id="rep-todos-reset" title="Volver a lo calculado (${fmt(rp.xpBase)} XP · ${fmt(rp.ddeCada)} DDE)">↺ calculado</button>` : `<span class="hint">calculado: se puede cambiar</span>`}
      </div>
      <div class="reporte-lista">${jugHtml}</div>
      <div class="hint" style="margin-top:4px">Destildá a quien no estuvo en el combate. Cambiá el <b>valor por jugador</b> de arriba y se aplica a todos. Si alguien merece más o menos por una circunstancia particular, ponele un <b>extra</b> (también puede ser negativo). En pie cobra el 100% de la XP, inconsciente el 25% (hacia abajo), muerto nada; el oro es parejo.</div>
    </div>
    <div>
      <div class="reporte-seccion-titulo">Cálculo: experiencia y oro de los creeps</div>
      <div class="reporte-lista">${filasHtml}</div>
      ${hayEscapados ? `<label class="reporte-contar-escapados"><input type="checkbox" id="finalizar-combate-contar-escapados" ${xpContarEscapados ? 'checked' : ''}> Contar la XP de los que escaparon (${fmt(XP_ESCAPO_PCT * 100)}% de lo que darían derrotados)</label>` : ''}
      <div class="reporte-total">Calculado — XP total: <b>${fmt(rp.xpTotal)}</b> · ${rp.n ? `base por jugador (÷${rp.n}, hacia arriba): <b>${fmt(rp.xpBase)}</b>` : 'elegí al menos un jugador'}</div>
      <div class="reporte-total">Calculado — oro total: <b>${fmt(rp.oroTotal)} DDE</b> (ya incluye su variación de ±20%, no se vuelve a tirar) · ${rp.n ? `<b>${fmt(rp.ddeCada)}</b> DDE por jugador (hacia arriba)` : ''}</div>
    </div>
    <div>
      <div class="reporte-seccion-titulo">Despojos: equipos y trofeos que los jugadores van a poder elegir</div>
      <div class="reporte-loot-lista">${lootHtml}</div>
      <div style="display:flex;gap:6px;margin-top:8px"><input type="text" id="rep-extra-nombre" placeholder="Ítem extra (nombre)" style="flex:1"><input type="number" min="0" id="rep-extra-precio" placeholder="Precio" style="width:90px"><button type="button" class="btn" id="rep-extra-add">+ Sumar</button></div>
    </div>`;

  const b = $('#finalizar-combate-body');
  b.querySelectorAll('[data-rep-ver]').forEach(x => x.onclick = e => {
    e.preventDefault(); e.stopPropagation();
    const it = [...rep.filas.flatMap(f => f.items), ...itemsExtraDelReporte()].find(i => i.clave === x.dataset.repVer);
    if(it) verItemDatos(it.template);
  });
  b.querySelectorAll('[data-rep-item]').forEach(c => c.onchange = () => { if(c.checked) combateRep.quitados.delete(c.dataset.repItem); else combateRep.quitados.add(c.dataset.repItem); renderReporteCombate(); });
  b.querySelectorAll('[data-rep-jug]').forEach(c => c.onchange = () => { const j = combateRep.jugadores.find(x => x.id === c.dataset.repJug); if(j) j.incluido = c.checked; renderReporteCombate(); });
  $('#rep-xp-todos').onchange = e => { combateRep.xpPorJugador = Math.max(0, Math.round(num(e.target.value))); renderReporteCombate(); };
  $('#rep-dde-todos').onchange = e => { combateRep.ddePorJugador = Math.max(0, Math.round(num(e.target.value) * 100) / 100); renderReporteCombate(); };
  if($('#rep-todos-reset')) $('#rep-todos-reset').onclick = () => { combateRep.xpPorJugador = null; combateRep.ddePorJugador = null; renderReporteCombate(); };
  b.querySelectorAll('[data-rep-xp],[data-rep-dde]').forEach(inp => inp.onchange = () => {
    const id = inp.dataset.repXp || inp.dataset.repDde, campo = inp.dataset.repXp ? 'xp' : 'dde';
    (combateRep.extra[id] = combateRep.extra[id] || {})[campo] = Math.round(num(inp.value) * 100) / 100;
    renderReporteCombate();
  });
  $('#rep-extra-add').onclick = () => {
    const nombre = $('#rep-extra-nombre').value.trim();
    if(!nombre){ toast('Escribí el nombre del ítem extra'); return; }
    combateRep.extras.push({nombre: nombre.slice(0, 60), precioCompra: Math.max(0, num($('#rep-extra-precio').value))});
    renderReporteCombate();
  };
  const contar = $('#finalizar-combate-contar-escapados');
  if(contar) contar.addEventListener('change', e => { xpContarEscapados = e.target.checked; renderReporteCombate(); });
  $('#finalizar-combate-publicar').disabled = combateRep.publicando || !rp.n;
}

// Línea verde en la Mesa (comun/mesa.js, desde 'recompensa').
async function mesaLineaVerde(origen, formula){
  if(!fbDb || !fbUsuario || !fbMiembro) return;
  try{
    await fbDb.collection(fbRutaCampana('tiradas')).add({
      uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: '', origen: String(origen).slice(0, 200), formula: String(formula || '').slice(0, 600),
      rolls: [], mod: 0, total: 0, desde: 'recompensa', cuando: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }catch(err){ console.error('No se pudo escribir la línea verde en la Mesa:', err); }
}

function abrirReporteFinalizar(){
  combateRep.enMapa = null;
  renderReporteCombate();
  cargarCreepsEnMapa();
  cargarJugadoresCombate();
  $('#scrim-finalizar-combate').classList.add('open');
}

async function publicarRecompensas(){
  if(combateRep.publicando) return;
  if(!fbDb || !fbMiembro || !fbMiembro.gm){ toast('Solo el GM de la partida puede publicar'); return; }
  const rep = generarReporteCombate(xpContarEscapados);
  const rp = calcularReparto(rep);
  if(!rp.n){ toast('Elegí al menos un jugador'); return; }
  if(combateActual && combateActual.estado === 'publicado'){ toast('Hay un botín anterior sin cerrar: cerralo primero con 🎁 Despojos (ahí se pagan su XP y su oro)'); return; }
  const items = itemsPublicables(rep);
  if(!confirm(`¿Publicar los despojos?\n\n${rp.porJugador.map(({j, xp, dde}) => `· ${j.nombre}: +${fmt(xp)} XP, +${fmt(dde)} DDE`).join('\n')}\n· ${items.length} ítem(s) en el botín\n\n${items.length ? 'La XP y el oro se cargan en las fichas cuando cierres el botín (último paso, 🎁 Despojos). A los jugadores se les abre la ventana en el mapa para que elijan.' : 'Como no hay ítems, la XP y el oro se cargan solos en las fichas.'}`)) return;
  combateRep.publicando = true;
  renderReporteCombate();
  try{
    const ts = firebase.firestore.FieldValue.serverTimestamp();
    const batch = fbDb.batch();
    // Con ítems en el botín, la XP y el oro se cargan en las fichas al CERRAR el botín (🎁 Despojos → cerrar); sin ítems, ya mismo.
    if(!items.length) rp.porJugador.forEach(({j, xp, dde}) => {
      batch.set(fbDb.collection(fbRutaCampana('recompensas')).doc(), {fichaId: j.id, duenoUid: j.duenoUid, nombre: j.nombre.slice(0, 60), xp, dde, despojos: 0, estado: j.estado, aplicada: false, creado: ts});
    });
    batch.set(fbDb.doc(fbRutaCampana('combate/actual')), {numero: Date.now(), estado: items.length ? 'publicado' : 'cerrado', titulo: 'Batalla terminada', items: items.length, creado: ts,
      jugadores: rp.porJugador.slice(0, 30).map(({j, xp, dde}) => ({fichaId: j.id, duenoUid: j.duenoUid, nombre: j.nombre.slice(0, 60), estado: j.estado, xp: Math.round(xp), dde: Math.round(dde * 100) / 100}))});
    items.forEach(i => {
      batch.set(fbDb.collection(fbRutaCampana('botin')).doc(), {nombre: String(i.nombre).slice(0, 80), json: JSON.stringify(i.template), origen: String(i.origen).slice(0, 80),
        precioCompra: num(i.precioCompra), despojos: Math.ceil(num(i.precioCompra) / 4), tomadoPor: '', tomadoNombre: '', creado: ts});
    });
    await batch.commit();
    combateActual = {...(combateActual || {}), estado: items.length ? 'publicado' : 'cerrado'};   // sin esperar al snapshot
    actualizarBotonDespojos();
    const lineas = rp.porJugador.map(({j, xp, dde}) => `${j.nombre}: +${fmt(xp)} XP${j.estado !== 'en pie' ? ` (${j.estado})` : ''}, +${fmt(dde)} DDE`).join(' · ');
    await mesaLineaVerde('🎁 Recompensas del combate', lineas + (items.length ? ` · ${items.length} ítem(s) en el botín` : ''));
    rep.filas.forEach(f => { f.sc.recompensado = true; });   // no se vuelven a contar en el próximo reporte
    combateRep = nuevoCombateRep();
    renderAll();
    $('#scrim-finalizar-combate').classList.remove('open');
    toast(items.length ? 'Publicado ✓ — los jugadores ven la ventana de la batalla en el mapa; cuando hayan elegido, apretás Despojar' : 'Publicado ✓ — la XP y el oro se cargan solos en las fichas');
    if(items.length) abrirBotinGM();   // el GM ve qué toma cada uno; puede cerrar la ventana y volver a abrirla con 🎁 Despojos
  }catch(err){
    console.error('No se pudieron publicar las recompensas:', err);
    combateRep.publicando = false;
    renderReporteCombate();
    toast(err.code === 'permission-denied' ? 'Faltan las reglas nuevas de Firebase (recompensas/botín): pegalas en la consola' : 'No se pudo publicar — mirá la consola');
  }
}


