// js/04-invocaciones.js — tramo 4 de 14 del script de ficha.html (paso 5, nivel A: mismo código, en el mismo orden).
/* =========================================================
   INVOCACIONES
   ========================================================= */

const INV_COLORES = ['#C4485A','#D07B3A','#8FB84F','#4FA88C','#9B7BD4','#6FA8D8'];

function nuevaInvocacion(){
  return {
    id: uid(), nombre:'Invocación nueva', imagen:'', color: INV_COLORES[Math.floor(Math.random()*INV_COLORES.length)],
    activa:true, cooldown:3, cooldownActual:3,
    hp:5, hpMax:5, spd:5,  // Hp.Max = Con*5
    con:1, fue:1, agl:1, des:1, esp:1,
    ataquesTurno:0,  // inv.nitros lo pone migrarInvocacion: arranca en el máximo
    armaTipo:8, armaPeso:1, armaFijo:0, armaAmplificado:0, armaDeRango:false, armaNatural:false, armaNombre:'', armaDetalle:'',
    armaMods:[], armaEfectos:[], armaManos:'arma_1m',
    defensa:0, equipo:[],
    crit:[0,0,0,0,0],
    habilidades:[],
    estados:[],
    notas:'',
  };
}

/* =========================================================
   INVOCACIONES — motor de stats, igual que los creeps de gm-tools:
   mismos Nitros (No2), la misma arma con mods de equipo y efectos al
   golpear, los mismos estados alterados y habilidades con asistente paso
   a paso — la maneja el jugador que invoca, no el GM. Duplicado a
   propósito (no importado), como ya pasa entre la ficha y gm-tools con el
   formato de efecto/estado — ver gm-toolset/CLAUDE.md.
   ========================================================= */
const IT2_INV = {
  nitrosHabilidad: 1,             // costo por defecto de una habilidad (el de atacar es Combatiente.costoAtaque)
};
const ATTR_IDS_INV = ['con','fue','agl','des','esp'];
// Stats secundarios de una invocación: los mismos que un PJ (GRUPOS),
// salvo Hp.Max/No2 (ya se ven en las barras) y Crg.Max/SP/SP Regen (no aplican).
const INV_STAT_EXCLUIR = ['hpmax','nitros','crgmax','sp','spregen'];
const INV_DERIVADOS_POR_ATTR = Object.fromEntries(GRUPOS.map(g => [g.id, g.derived.filter(d => !INV_STAT_EXCLUIR.includes(d.id))]));
const INV_STAT_ATTR = Object.fromEntries(GRUPOS.flatMap(g => g.derived.map(d => [d.id, g.id])));
// Mismo criterio que STATS_CON_TIRADA en la Botonera de la ficha: los 5
// atributos base + los secundarios que no tienen ya su propio botón en Combate.
const INV_STATS_TIRADA_IDS = ['con','fue','agl','des','esp','resmg','rescc','ini','pdgmg','resm'];
// Stats que puede tirar una habilidad (incluye PdG, Bloqueo y Parry, que
// en la Botonera ya tienen su propio botón de Combate y por eso no están
// en INV_STATS_TIRADA_IDS) — mismos que ofrece gm-tools para un creep.
const INV_STATS_HAB = ['resmg','rescc','bloqueo','eva','ini','pdg','parry','pdgmg','resm'];

function invFuentesEquipo(inv){ return FichaResumen.invFuentesEquipo(inv); }   // comun/ficha-resumen.js
function invModTotal(inv, statId){ return FichaResumen.invModTotal(inv, statId); }
// Cada fuente (equipo o estado activo) que le suma a un stat, con su valor
// — para la 🔍 (de dónde sale cada tirada).
function aportesModInv(inv, statId){
  const out = [];
  invFuentesEquipo(inv).forEach(it => {
    const v = (it.mods||[]).filter(m => m.stat === statId).reduce((a, m) => a + num(m.val), 0);
    if(v) out.push({nombre: it.nombre || '(sin nombre)', val: v});
  });
  (inv.estados||[]).forEach(es => {
    if(es.activo === false) return;
    const stacks = Math.max(1, num(es.stacks)||1);
    const v = (es.mods||[]).filter(m => m.stat === statId).reduce((a, m) => a + num(m.val) * stacks, 0);
    if(v) out.push({nombre: es.nombre || '(sin nombre)', val: v});
  });
  return out;
}
function invEstadosArmadura(inv){
  const activos = (inv.estados||[]).filter(e => e.activo !== false);
  return {rota: activos.filter(e => e.armaduraRota).reduce((a, e) => a + Math.max(1, num(e.stacks) || 1), 0)};
}
function invAporteArmadura(inv, statId){
  return (inv.equipo||[]).filter(it => slotDe(it.tipoItem) === 'armadura')
    .reduce((a,it) => a + (statId === 'def' ? num(it.def) : (it.mods||[]).filter(m=>m.stat===statId).reduce((s,m)=>s+num(m.val),0)), 0);
}
function invDefensaEfectiva(inv){
  const {arruinada, rota} = invEstadosArmadura(inv);
  let v = num(inv.defensa);
  if(arruinada) v -= invAporteArmadura(inv, 'def');
  v -= rota;  // Armadura rota: -1 por cada acumulación
  return Math.max(0, v);
}
function invCritEfectivo(inv, i){
  const {arruinada} = invEstadosArmadura(inv);
  let v = num(inv.crit[i]);
  if(arruinada) v -= invAporteArmadura(inv, 'tipo'+(i+1));
  return v;
}
function invEstadoActivo(inv, flag){
  return (inv.estados || []).some(e => e.activo !== false && e[flag]);
}
function invStatValor(inv, statId){
  const attr = INV_STAT_ATTR[statId] || statId;
  let v = num(inv[attr]) + invModTotal(inv, attr);
  if(statId !== attr) v += invModTotal(inv, statId);
  return v;
}
function invNitrosMax(inv){ return FichaResumen.invNitrosMax(inv); }
// Nitros de una habilidad: un número, o "ATAQUE" = lo que le cuesta un
// ataque con su arma (Tipo ÷ 2 el primero del turno) y cuenta como ese ataque.
function habInvAtaque(h){ return String((h && h.nitrosCosto) ?? '').trim().toUpperCase() === 'ATAQUE'; }
// Parry y Bloqueo de una invocación (2026-09-24), igual que un creep: el Parry cuesta 1 No2 (2026-09-26); el Bloqueo = su Bloqueo + el Peso de su arma.
function pesoArmaInv(inv){ return Math.max(1, num(inv.armaPeso) || 1); }
// Con qué para la invocación (Parry y Bloqueo): su arma si no es natural, si no un escudo de su equipo; null = no puede
// (regla del dueño 2026-09-30, comun/combatiente.js — la misma que personajes y creeps). El Bloqueo suma el peso de eso.
function defensaInv(inv){
  if(!inv) return null;
  return Combatiente.armaParaDefensa({arma: inv.armaNombre ? {nombre: inv.armaNombre, peso: pesoArmaInv(inv)} : null, natural: inv.armaNatural === true,
    escudos: (inv.equipo || []).filter(it => slotDe(it.tipoItem) === 'escudo').map(it => ({nombre: it.nombre, peso: num(it.peso)}))});
}
function bloqueoValorInv(inv){ const d = defensaInv(inv); return invStatValor(inv, 'bloqueo') + (d ? num(d.peso) : 0); }
function costoAtaqueInv(inv){ return Combatiente.costoAtaque(num(inv.armaTipo) || 8, inv.ataquesTurno); }   // regla común (comun/combatiente.js)
function costoNitrosHabInv(inv, h){ return Combatiente.costoNitrosHab(h, () => costoAtaqueInv(inv), IT2_INV.nitrosHabilidad); }
function costoHabInvTxt(inv, h){
  const n = costoNitrosHabInv(inv, h);
  if(habInvAtaque(h)) return `${fmt(n)} No2 (como un ataque)`;
  return n ? `${fmt(n)} No2` : 'sin costo';
}
// ¿Se puede usar ahora? La regla común (P133): cooldown, No2 y vida (una 📣 manual no cobra nada).
function bloqueoHabInv(inv, h){ return Combatiente.bloqueoHab(h, {modo: modoHab(h), nitros: inv.nitros, costo: costoNitrosHabInv(inv, h), hp: inv.hp}); }
function invDanoTxt(inv, extra){
  const dados = Math.max(1, num(inv.armaPeso)||1) + Math.max(0, num(inv.armaAmplificado));
  const tipo = num(inv.armaTipo)||8;
  const fijo = num(inv.armaFijo) + (inv.armaDeRango ? 0 : num(extra));
  return `${dados}d${tipo}${fijo?` + ${fmt(fijo)}`:''}`;
}
function invAtaqueTxt(inv){
  return invDanoTxt(inv, invStatValor(inv, 'dmg'));
}
function modsAfectanHpInv(mods){
  return (mods || []).some(m => m.stat === 'con' || m.stat === 'hpmax');
}
// Recalcula hpMax = con*5 + mods de Hp.Max (con efectivo, equipo y estados
// incluidos, igual que la ficha y los creeps). Si estaba lleno, sigue
// lleno con el nuevo máximo; si no, solo se recorta si se pasa.
function actualizarHpMaxPorConInv(inv){
  const conEfectivo = num(inv.con) + invModTotal(inv, 'con');
  const nuevoHpMax = Math.max(0, conEfectivo * 5 + invModTotal(inv, 'hpmax'));
  const estabaFull = num(inv.hp) >= num(inv.hpMax);
  inv.hpMax = nuevoHpMax;
  inv.hp = estabaFull ? nuevoHpMax : Math.min(num(inv.hp), nuevoHpMax);
}

// Rellena campos que invocaciones viejas (guardadas antes de esta
// actualización) no tienen, para que el resto del código no se tope con
// undefined. Convierte Acciones/Movimiento (viejo) a No2, igual que ya
// se hizo en la ficha y en los creeps con la Iteración 2.
function migrarInvocacion(inv){
  const crit = Array.isArray(inv.crit) ? inv.crit.map(v=>num(v)) : [];
  while(crit.length < 5) crit.push(0);
  inv.crit = crit.slice(0, 5);
  inv.equipo = Array.isArray(inv.equipo) ? inv.equipo : [];
  inv.estados = Array.isArray(inv.estados) ? inv.estados : [];
  inv.habilidades = Array.isArray(inv.habilidades) ? inv.habilidades : [];
  inv.armaMods = Array.isArray(inv.armaMods) ? inv.armaMods : [];
  inv.armaEfectos = Array.isArray(inv.armaEfectos) ? inv.armaEfectos : [];
  if(inv.armaManos === undefined) inv.armaManos = 'arma_1m';
  if(inv.armaAmplificado === undefined) inv.armaAmplificado = 0;
  if(inv.armaDeRango === undefined) inv.armaDeRango = false;
  if(inv.armaNombre === undefined) inv.armaNombre = '';
  if(inv.armaDetalle === undefined) inv.armaDetalle = '';
  if(inv.defensa === undefined) inv.defensa = 0;
  if(inv.notas === undefined) inv.notas = '';
  if(inv.acc !== undefined || inv.accMax !== undefined){
    delete inv.acc; delete inv.accMax; delete inv.nitros;  // arranca lleno, abajo
  }
  inv.habilidades.forEach(h => {
    if(h.nitrosCosto === undefined) h.nitrosCosto = IT2_INV.nitrosHabilidad;
    if(h.tiradaStat === undefined) h.tiradaStat = '';
    if(h.tiradaExtra === undefined) h.tiradaExtra = '';
    if(h.cdActual === undefined) h.cdActual = 0;
    if(h.efectoNombre === undefined) h.efectoNombre = '';
  });
  if(inv.nitros === undefined || inv.nitros === null) inv.nitros = invNitrosMax(inv);
  if(inv.ataquesTurno === undefined) inv.ataquesTurno = 0;
  return inv;
}

/* ---------- Ítems de una invocación (arma y armadura): asistente paso a
   paso compartido, igual que en la ficha y en gm-tools ---------- */
function portadorInv(invId){
  const inv = S.invocaciones.find(x => x.id === invId);
  if(!inv) return null;
  return {nombre: inv.nombre, nitros: invNitrosMax(inv), dmg: invStatValor(inv, 'dmg'), rango: invStatValor(inv, 'rng'), def: invDefensaEfectiva(inv)};
}
function cfgItemInv(){
  return {
    contexto: 'invocacion',
    stats: MOD_TARGETS.filter(s => !['sp','spregen','crgmax','capcinturon','capmochila','luz','veoculto'].includes(s.id)).map(s => ({id:s.id, label:s.label})),
    ejemplos: (tipoItem, t) => (S.catalogo || []).filter(it => ES_ARMA(it.tipoItem) && num(it.tipoDado) === t).map(it => it.nombre),
  };
}
function armaDeInvComoDraft(inv){
  return {
    nombre: inv.armaNombre || '', tipoItem: inv.armaManos || 'arma_1m', tipoDado: num(inv.armaTipo) || 8,
    peso: Math.max(1, num(inv.armaPeso) || 1), danoFijo: num(inv.armaFijo), danoAmplificado: num(inv.armaAmplificado),
    armaDeRango: !!inv.armaDeRango, mods: structuredClone(inv.armaMods || []), detalle: inv.armaDetalle || '',
    efectosGolpe: structuredClone(inv.armaEfectos || []),
  };
}
function ponerArmaEnInv(inv, d){
  inv.armaNombre = d.nombre;
  inv.armaManos = d.tipoItem;
  inv.armaTipo = num(d.tipoDado) || 8;
  inv.armaPeso = Math.max(1, num(d.peso) || 1);
  inv.armaFijo = num(d.danoFijo);
  inv.armaAmplificado = Math.max(0, num(d.danoAmplificado));
  inv.armaDeRango = !!d.armaDeRango;
  inv.armaMods = structuredClone(d.mods || []);
  inv.armaEfectos = structuredClone(d.efectosGolpe || []);
  inv.armaDetalle = d.detalle || '';
}
function ponerEquipoEnInv(inv, d){
  const def = (d.mods || []).filter(m => m.stat === 'def').reduce((a, m) => a + num(m.val), 0);
  const mods = (d.mods || []).filter(m => m.stat !== 'def');
  inv.defensa = num(inv.defensa) + def;
  inv.equipo = inv.equipo || [];
  inv.equipo.push({id: uid(), nombre: d.nombre, tipoItem: d.tipoItem, def, mods, detalle: d.detalle || '', peso: num(d.peso)});   // peso: el de un escudo suma al Bloqueo
  if(modsAfectanHpInv(mods)) actualizarHpMaxPorConInv(inv);
}
function abrirEditorArmaInv(invId){
  const inv = S.invocaciones.find(x => x.id === invId);
  if(!inv) return;
  AsistenteItem.abrir({...cfgItemInv(),
    titulo: `Arma de ${inv.nombre}`,
    nuevo: false,
    fijarCategoria: true,
    draft: armaDeInvComoDraft(inv),
    portador: () => portadorInv(invId),
    onGuardar: d => {
      const actual = S.invocaciones.find(x => x.id === invId);
      if(!actual){ toast('Esa invocación ya no está'); return true; }
      ponerArmaEnInv(actual, d);
      renderInvocaciones();
      toast('Arma actualizada');
      return true;
    },
  });
}
function abrirItemNuevoInv(invId){
  const inv = S.invocaciones.find(x => x.id === invId);
  if(!inv) return;
  AsistenteItem.abrir({...cfgItemInv(),
    titulo: `Ítem para ${inv.nombre}`,
    nuevo: true,
    draft: {tier: 'A definir', peso: 0},
    portador: () => portadorInv(invId),
    conRanuras: false,
    textoGuardar: 'Crear y equipar',
    onGuardar: d => {
      const actual = S.invocaciones.find(x => x.id === invId);
      if(!actual) return true;
      if(String(d.tipoItem).startsWith('arma_')) ponerArmaEnInv(actual, d);
      else ponerEquipoEnInv(actual, d);
      toast(`${actual.nombre} equipado con ${d.nombre}`);
      renderInvocaciones();
      return true;
    },
  });
}
function quitarEquipoDeInv(invId, equipoId){
  const inv = S.invocaciones.find(x => x.id === invId);
  if(!inv) return;
  const it = inv.equipo.find(x => x.id === equipoId);
  if(!it) return;
  inv.defensa = num(inv.defensa) - num(it.def);
  inv.equipo = inv.equipo.filter(x => x.id !== equipoId);
  if(modsAfectanHpInv(it.mods)) actualizarHpMaxPorConInv(inv);
  renderInvocaciones();
}

/* ---------- Tarjeta de la Botonera de Invocaciones: lo mínimo (nombre,
   imagen, cooldown, HP, No2) queda editable ahí mismo; todo lo demás
   (atributos, arma, armadura, habilidades, estados) va en "✎ Editar";
   "▶ Usar" abre sus Acciones para jugarla en combate. ---------- */
function renderInvocaciones(){
  const grid = $('#inv-grid');
  if(!grid) return;
  S.invocaciones.forEach(migrarInvocacion);
  $('#inv-empty').style.display = S.invocaciones.length ? 'none' : 'block';
  grid.innerHTML = S.invocaciones.map(inv => invCardHtml(inv)).join('');
  if(editandoInvId && $('#scrim-editar-inv').classList.contains('open')) renderEditarInv();
  if(botoneraInvId && $('#scrim-botonera-inv').classList.contains('open')) renderBotoneraInv();
}

function invCardHtml(inv){
  const dormida = inv.activa === false;
  return `
  <div class="inv-card ${dormida?'inv-dormida':''}" style="--accent:${inv.color}" data-invid="${inv.id}">
    <div class="inv-chead">
      <input class="inv-name" data-invf="nombre" data-invid="${inv.id}" value="${esc(inv.nombre)}">
      <button class="mini" data-dupinv="${inv.id}" title="Duplicar esta invocación">Duplicar</button>
      <button class="inv-xbtn" data-rminv="${inv.id}" title="Eliminar del todo">×</button>
    </div>
    ${dormida ? `<div class="inv-dormida-bar">
      <span>No invocada — la ficha se guardó, lista para volver a invocar</span>
      <button class="inv-reinvocar" data-reinvocar="${inv.id}">Invocar</button>
    </div>` : ''}
    <div class="inv-imgwrap">
      <button type="button" class="inv-imgpick" data-invimg="${inv.id}">
        ${inv.imagen ? `<img src="${inv.imagen}" alt="">` : `<span class="inv-imgempty">+<small>Imagen</small></span>`}
      </button>
      ${inv.imagen ? `<button class="mini" data-invimgrm="${inv.id}" style="margin-top:5px">Quitar imagen</button>` : ''}
      <input type="file" class="inv-imginput" data-invimginput="${inv.id}" accept="image/*" hidden>
    </div>
    <div class="inv-cbody">
      <div class="inv-cooldownbox">
        <span class="cdl">Cooldown</span>
        <span class="cdn">Dura <input type="number" data-invf="cooldown" data-invid="${inv.id}" value="${inv.cooldown}" min="0" title="Cuántos turnos dura la invocación"> turnos ·</span>
        <span class="cdn">${dormida ? 'Dormida' : `Quedan <b style="color:var(--brass)">${fmt(num(inv.cooldownActual))}</b>`}</span>
      </div>
      <div class="inv-vitalbar">
        <div class="inv-vitalmini hp">
          <div class="vl">HP</div>
          <div class="vn"><input type="number" data-invf="hp" data-invid="${inv.id}" value="${inv.hp}"><span class="vmax">/ </span><input type="number" data-invf="hpMax" data-invid="${inv.id}" value="${inv.hpMax}" style="width:30px"></div>
        </div>
        <div class="inv-vitalmini acc" title="Nitros: se gastan al atacar y usar habilidades. Se recargan en cada Mantenimiento">
          <div class="vl">No2</div>
          <div class="vn"><input type="number" data-invf="nitros" data-invid="${inv.id}" value="${fmt(num(inv.nitros))}"><span class="vmax">/ ${fmt(invNitrosMax(inv))}</span></div>
        </div>
      </div>
      <div class="inv-botones-fila">
        <button type="button" class="btn" data-editarinv="${inv.id}" style="flex:1">✎ Editar</button>
        <button type="button" class="btn primary" data-usarinv="${inv.id}" style="flex:1" ${dormida?'disabled':''}>▶ Usar</button>
      </div>
    </div>
  </div>`;
}

function invHabHtml(inv, h){
  return `<div class="inv-hab">
    <div class="inv-habtop">
      <span class="inv-hn">${esc(h.nombre || 'Sin nombre')} <span title="${esc(MODOS_HAB[modoHab(h) || 'semi'].nombre)}: ${esc(MODOS_HAB[modoHab(h) || 'semi'].corto)}">${MODOS_HAB[modoHab(h) || 'semi'].icono}</span></span>
      <button type="button" class="mini" data-edithabinv="${inv.id}:${h.id}" title="Editar">✎</button>
      <button type="button" class="inv-rm" data-rmhabinv="${inv.id}:${h.id}" title="Eliminar">×</button>
    </div>
    <div class="hint">${esc(costoHabInvTxt(inv, h))}${num(h.cd) > 0 ? ` · CD ${fmt(num(h.cd))}` : ''}</div>
    ${h.detalle ? `<div class="hint">${esc(h.detalle)}</div>` : ''}
  </div>`;
}

function invEstadoChipHtml(inv, es){
  const activo = es.activo !== false;
  return `<div class="inv-hab" style="${activo?'':'opacity:.5'}">
    <div class="inv-habtop">
      <span class="inv-hn">${esc(es.nombre || 'Estado')}</span>
      <span class="hint" style="flex:none">${es.permanente ? 'No vence' : (num(es.turnos) ? `${fmt(num(es.turnos))}t` : '')}</span>
      <button type="button" class="inv-rm" data-rmestadoinv="${inv.id}:${es.id}" title="Quitar">×</button>
    </div>
    ${es.detalle ? `<div class="hint">${esc(es.detalle)}</div>` : ''}
  </div>`;
}

/* ---------- Editor completo de una invocación (atributos, arma, armadura,
   res. a críticos, habilidades, estados, notas) ---------- */
let editandoInvId = null;
function abrirEditarInv(invId){
  if(!S.invocaciones.some(x => x.id === invId)) return;
  editandoInvId = invId;
  renderEditarInv();
  $('#scrim-editar-inv').classList.add('open');
}
function cerrarEditarInv(){
  editandoInvId = null;
  $('#scrim-editar-inv').classList.remove('open');
}
// Al tipear un atributo no se redibuja todo el editor (se perdería el
// foco): solo se refrescan los secundarios de esa columna.
function actualizarDerivInvEnDOM(inv){
  const body = $('#editarinv-body');
  if(!body) return;
  body.querySelectorAll('.inv-derivcol').forEach((col, idx) => {
    const a = ATTR_IDS_INV[idx];
    if(!a) return;
    const bs = col.querySelectorAll('.inv-deriv b');
    INV_DERIVADOS_POR_ATTR[a].forEach((d, i) => { if(bs[i]) bs[i].textContent = fmt(invStatValor(inv, d.id)); });
  });
}
function renderEditarInv(){
  const inv = S.invocaciones.find(x => x.id === editandoInvId);
  if(!inv){ cerrarEditarInv(); return; }
  $('#editarinv-titulo').textContent = `Editar · ${inv.nombre}`;
  $('#editarinv-body').innerHTML = `
    <div class="inv-sectlabel" style="margin-top:0">Atributos</div>
    <div class="inv-row5">
      ${ATTR_IDS_INV.map(a => `<div class="inv-minif"><label>${esc(STAT_LABEL[a])}</label><input type="number" data-invattr="${a}" data-invid="${inv.id}" value="${num(inv[a])}"></div>`).join('')}
    </div>
    <div class="inv-derivgrid">
      ${ATTR_IDS_INV.map(a => `<div class="inv-derivcol"><span class="inv-derivattr">${esc(STAT_LABEL[a])}</span>${INV_DERIVADOS_POR_ATTR[a].map(d => `<div class="inv-deriv"><span>${esc(d.label)}</span><b>${fmt(invStatValor(inv, d.id))}</b></div>`).join('')}</div>`).join('')}
    </div>
    <div class="inv-editar-separador"><span>Arma</span></div>
    <div class="inv-arma-compacta">
      <div class="inv-arma-top">
        <span class="inv-arma-nombre">${inv.armaNombre ? esc(inv.armaNombre) : '<span class="hint">Sin nombre</span>'}</span>
        <span class="inv-danopreview"><b>${esc(invDanoTxt(inv, invStatValor(inv,'dmg')))}</b></span>
        <button type="button" class="mini" data-editararmainv="${inv.id}">✎ Editar</button>
      </div>
      ${inv.armaDetalle ? `<div class="hint">${esc(inv.armaDetalle)}</div>` : ''}
      ${(inv.armaEfectos||[]).length ? `<div class="hint"><b>Al golpear:</b> ${esc(EfectosGolpe.resumenLista(inv.armaEfectos))}</div>` : ''}
      <label class="hint" style="display:flex;gap:6px;align-items:center;margin-top:4px" title="Un arma natural (garras, colmillos, puños…) no permite Parry ni Bloqueo, por ahora (regla del dueño, 2026-09-30)."><input type="checkbox" data-invf="armaNatural" data-invid="${inv.id}" style="width:auto"${inv.armaNatural ? ' checked' : ''}> Es un arma natural (garras, colmillos…): sin Parry ni Bloqueo</label>
    </div>
    <div class="inv-editar-separador"><span>Defensa y armadura</span></div>
    <div class="inv-row3">
      <div class="inv-minif"><label>Defensa</label><input type="number" data-invf="defensa" data-invid="${inv.id}" value="${inv.defensa}"></div>
      <div></div><div></div>
    </div>
    <div class="inv-equipo-list">
      ${inv.equipo.length ? inv.equipo.map(it => `
      <div class="inv-equipo-item">
        <span class="inv-equipo-nombre">${esc(it.nombre)}</span>
        <span class="hint">+${fmt(num(it.def))} DEF</span>
        <button type="button" class="inv-rm" data-quitarequipoinv="${inv.id}:${it.id}" title="Quitar">×</button>
      </div>`).join('') : `<div class="hint">Sin armadura.</div>`}
    </div>
    <button type="button" class="inv-addhab" data-additeminv="${inv.id}" style="margin-top:6px">+ Ítem</button>
    <div class="inv-editar-separador"><span>Resistencia a críticos</span></div>
    <div class="inv-critgrid">
      ${['Tipo 4','Tipo 6','Tipo 8','Tipo 10','Tipo 12'].map((lbl,i) => `<div class="inv-critcell"><label>${lbl}</label><input type="number" data-invcrit="${i}" data-invid="${inv.id}" value="${inv.crit[i]}"></div>`).join('')}
    </div>
    <div class="inv-editar-separador"><span>Habilidades</span></div>
    <div class="inv-hablist">
      ${inv.habilidades.length ? inv.habilidades.map(h => invHabHtml(inv, h)).join('') : '<div class="hint">Sin habilidades.</div>'}
    </div>
    <button type="button" class="inv-addhab" data-addhabinv="${inv.id}" style="margin-top:6px">+ Habilidad</button>
    <div class="inv-editar-separador"><span>Estados alterados</span></div>
    <div class="inv-hablist">
      ${(inv.estados||[]).length ? inv.estados.map(es => invEstadoChipHtml(inv, es)).join('') : '<div class="hint">Sin estados activos.</div>'}
    </div>
    <button type="button" class="inv-addhab" data-addestadoinv="${inv.id}" style="margin-top:6px">+ Estado</button>
    <div class="inv-editar-separador"><span>Notas</span></div>
    <textarea class="inv-notas" data-invf="notas" data-invid="${inv.id}" placeholder="Lo que haga falta recordar de esta invocación.">${esc(inv.notas)}</textarea>
  `;
}

/* ---------- Acciones de una invocación (Botonera): Combate, tiradas de
   stats y habilidades — igual estructura que las Acciones de un creep en
   gm-tools, con la 🔍 y sin costo salvo Atacar/habilidades. ---------- */
let botoneraInvId = null;
function abrirBotoneraInv(invId){
  const inv = S.invocaciones.find(x => x.id === invId);
  if(!inv){ toast('Esa invocación ya no está'); return; }
  if(inv.activa === false){ toast(`${inv.nombre} está dormida — tocá "Invocar" para reactivarla`); return; }
  botoneraInvId = invId;
  renderBotoneraInv();
  $('#scrim-botonera-inv').classList.add('open');
}
function renderBotoneraInv(){
  const inv = S.invocaciones.find(x => x.id === botoneraInvId);
  if(!inv) return;
  const costoAtaque = costoAtaqueInv(inv);
  const sinNitrosAtaque = num(inv.nitros) < costoAtaque;
  const cualAtaque = num(inv.ataquesTurno) === 0 ? 'primer ataque del turno (Tipo ÷ 2)' : 'ataque extra (Tipo completo)';
  $('#botonerainv-titulo').textContent = inv.nombre;
  $('#botonerainv-badge').textContent = `No2 ${fmt(num(inv.nitros))}/${fmt(invNitrosMax(inv))}`;

  const tilesStats = INV_STATS_TIRADA_IDS.map(id => `
    <button type="button" class="botonera-tile" data-invtirarstat="${inv.id}:${id}" title="${esc(STAT_LABEL[id]||id)}">
      ${lupaBotonHtml(`inv:${inv.id}:stat:${id}`)}
      <span class="bt-label">${esc(STAT_LABEL[id]||id)}</span>
      <span class="bt-value">${fmt(invStatValor(inv, id))}</span>
    </button>`).join('');

  const f = v => { const x = formulaParaValor(v); return x ? x.formula : ''; };
  const defInv = defensaInv(inv);
  const combate = [
    {stat:'pdg', nombre:`Atacar (PdG) · ${fmt(costoAtaque)} No2`, dado: f(invStatValor(inv,'pdg')), sinNitros: sinNitrosAtaque, clave:`inv:${inv.id}:atacar`, motivo:`${sinNitrosAtaque?'Sin No2 · ':''}Cuesta ${fmt(costoAtaque)} No2 · ${cualAtaque}`, attr:`data-invatacar="${inv.id}"`},
    {nombre:'Daño Arma', dado: invDanoTxt(inv, invStatValor(inv,'dmg')), clave:`inv:${inv.id}:danio`, motivo:'Sin costo', attr:`data-invdanio="${inv.id}"`},
    {stat:'eva', nombre:'Esquivar (Eva)', dado: f(invStatValor(inv,'eva')), clave:`inv:${inv.id}:stat:eva`, motivo:'Sin costo', attr:`data-invtirarstat="${inv.id}:eva"`},
    // Parry y Bloqueo solo con un arma de verdad o un escudo (regla del dueño, 2026-09-30): sin eso, o con un arma
    // natural, no aparecen (defensaInv).
    ...(defInv ? [{stat:'parry', nombre:`Parry · ${fmt(Combatiente.costoParry())} No2`, dado: f(invStatValor(inv,'parry')), sinNitros: num(inv.nitros) < Combatiente.costoParry(), clave:`inv:${inv.id}:stat:parry`, motivo:`${num(inv.nitros) < Combatiente.costoParry() ? 'Sin No2 · ' : ''}Cuesta ${fmt(Combatiente.costoParry())} No2 · con ${defInv.nombre}`, attr:`data-invtirarstat="${inv.id}:parry"`},
      parryPendienteInv.has(inv.id)
        ? {stat:'bloqueo', nombre:`Bloqueo · ${defInv.nombre}`, dado: f(bloqueoValorInv(inv)), clave:`inv:${inv.id}:stat:bloqueo`, motivo:`Tras el Parry · sin costo · su Bloqueo + el Peso de ${defInv.nombre} (${fmt(num(defInv.peso))}) es el dado`, attr:`data-invtirarstat="${inv.id}:bloqueo"`}
        // Apagado hasta el Parry, pero muestra lo que tiraría (para decidir entre Parry y Evasión).
        : {stat:'bloqueo', nombre:'Bloqueo · tras el Parry', dado: f(bloqueoValorInv(inv)), sinNitros: true, clave:`inv:${inv.id}:stat:bloqueo`, motivo: `${Combatiente.BLOQUEO_SOLO_TRAS_PARRY} · con ${defInv.nombre} tiraría esto`, attr:`data-invtirarstat="${inv.id}:bloqueo"`}] : []),
  ];
  const tilesCombate = combate.map(c => {
    const mt = c.stat ? ModTirada.tile(inv.estados, c.stat) : {clase: '', html: '', titulo: ''};
    return `
    <button type="button" class="botonera-tile${c.sinNitros?' bt-sin-nitros':''}${mt.clase}" ${c.attr} title="${esc(c.motivo + mt.titulo)}">
      ${lupaBotonHtml(c.clave)}${ModTirada.ayuda(c.stat)}
      <span class="bt-label">${esc(c.nombre)}</span><span class="bt-value bt-value-formula">🎲${c.dado?` ${esc(c.dado)}`:''}</span>${mt.html}
    </button>`;
  }).join('');

  const filasHab = inv.habilidades.map(h => {
    const bloqueo = bloqueoHabInv(inv, h);
    const motivo = [costoHabInvTxt(inv,h), num(h.cd)>0?`CD ${fmt(num(h.cd))}`:''].filter(Boolean).join(' · ');
    return `<div class="cat-row bot-fila">
      <div class="bot-fila-info">
        <div class="cat-nombre">${esc(h.nombre||'Sin nombre')}</div>
        <div class="bot-fila-costo">${esc(bloqueo || motivo)}</div>
      </div>
      <div class="bot-fila-btns">
        <button type="button" class="mini" data-verhabinv="${inv.id}:${h.id}">Ver</button>
        <button type="button" class="ejecutar-btn con-lupa${bloqueo?' sin-recursos':''}" data-ejecutarhabinv="${inv.id}:${h.id}" ${bloqueo?`aria-disabled="true" title="${esc(bloqueo)}"`:''}>${modoHab(h) === 'manual' ? 'Anunciar' : 'Ejecutar'}${lupaBotonHtml(`inv:${inv.id}:hab:${h.id}`, 'en-boton')}</button>
        ${botonSegundaHabInv(inv, h)}
      </div>
    </div>`;
  }).join('');

  $('#botonerainv-body').innerHTML = `
    <div class="botonera-grid botonera-grid-even">
      <div class="botonera-caja">
        <div class="cat-grouphead" style="margin-top:0"><span>Combate</span></div>
        <div class="botonera-combate-grid">${tilesCombate}</div>
        <div class="botonera-defensa botonera-combate-bottom" style="margin-top:6px">
          <div class="botonera-tile bt-info" title="Defensa (no se tira)">
            <span class="bt-label">Defensa</span><span class="bt-value">${fmt(invDefensaEfectiva(inv))}</span>
          </div>
          <div class="botonera-crit">
            <div class="botonera-crit-t">Resistencia a críticos</div>
            <div class="botonera-crit-grid">
              ${[0, 1, 2, 3, 4].map(i => `
              <div class="botonera-tile bt-info" title="Resistencia a crítico Tipo ${4 + 2 * i} (no se tira)">
                <span class="bt-label">Tipo ${4 + 2 * i}</span><span class="bt-value">${fmt(invCritEfectivo(inv, i))}</span>
              </div>`).join('')}
            </div>
          </div>
        </div>
      </div>
      <div class="botonera-caja">
        <div class="cat-grouphead" style="margin-top:0"><span>Tiradas de stats</span></div>
        <div class="botonera-stats-grid">${tilesStats}</div>
      </div>
    </div>
    <div class="botonera-caja">
      <div class="cat-grouphead" style="margin-top:0"><span>Habilidades</span></div>
      <div class="botonera-list-grid">${inv.habilidades.length ? filasHab : '<div class="hint">Sin habilidades cargadas.</div>'}</div>
    </div>`;
}

function verHabInv(invId, habId){
  const inv = S.invocaciones.find(x => x.id === invId);
  const h = inv && inv.habilidades.find(x => x.id === habId);
  if(!inv || !h) return;
  $('#verhabinv-nombre').textContent = h.nombre || 'Sin nombre';
  $('#verhabinv-body').innerHTML = `<div class="hint" style="margin-bottom:10px">${esc(costoHabInvTxt(inv,h))}${num(h.cd)>0?` · ${fmt(num(h.cd))} turno(s) de cooldown`:' · sin cooldown'}</div>
    <div>${h.detalle ? esc(h.detalle) : 'Sin detalle cargado.'}</div>`;
  $('#scrim-verhabinv').classList.add('open');
}

/* ---------- Ejecutar las acciones de una invocación: mismos costos y
   mecánica que un creep, publicado en la Mesa a su propio nombre
   ("Invocación · Acción", igual que gm-tools arma "Creep · Acción"). ---------- */
// La misma tirada que el personaje y los creeps (comun/combatiente.js): con Afortunado también tira dos veces (P100).
function tirarValorStatInv(inv, nombre, valor, statId){
  const r = Combatiente.tirarStat(valor, inv.estados, statId);
  if(!r){ toast(`${nombre}: ${fmt(num(valor))} no se puede tirar con dados reales`); return; }
  registrarTirada(`${inv.nombre} · ${nombre}`, r);
}
// Atacar con una invocación: igual que el personaje, primero se elige el token al que ataca (duelo, comun/duelo.js).
function invAtacar(invId){
  const inv = S.invocaciones.find(x => x.id === invId);
  if(!inv) return;
  if(typeof Duelo !== 'undefined' && Duelo.disponible() && fichaVivo && fichaVivo.id && !fichaVivo.soloLectura && !fichaVivo.editaGM){
    Duelo.elegirObjetivo({yo: {ref: fichaVivo.id + '~' + inv.id, tipo: 'pj', nombre: inv.nombre},
      ataque: {tipo: 'normal', armaId: '', armaNombre: inv.armaNombre || '', tipoDado: num(inv.armaTipo) || 8, rango: !!inv.armaDeRango, alcance: inv.armaDeRango ? Math.max(1, Math.round(num(invStatValor(inv, 'rng')))) : 1}, suelto: () => invAtacarSuelto(invId)});
  }else invAtacarSuelto(invId);
}
function invAtacarSuelto(invId){
  const inv = S.invocaciones.find(x => x.id === invId);
  if(!inv) return;
  const costo = costoAtaqueInv(inv);
  if(costo > num(inv.nitros)){
    toast(`${inv.nombre}: no le alcanzan los Nitros — este ataque cuesta ${fmt(costo)} y tiene ${fmt(num(inv.nitros))}`);
    return;
  }
  const primero = num(inv.ataquesTurno) === 0;
  inv.nitros = num(inv.nitros) - costo;
  inv.ataquesTurno = num(inv.ataquesTurno) + 1;
  parryPendienteInv.delete(inv.id);   // atacar cierra el Parry que esperaba su Bloqueo
  renderInvocaciones();
  tirarValorStatInv(inv, 'Atacar (PdG)', invStatValor(inv, 'pdg'), 'pdg');
  toast(`${inv.nombre}: -${fmt(costo)} No2 · ${primero ? 'primer ataque del turno' : 'ataque extra'}`);
}
function invDanio(invId, sinEfectos, mods){   // sinEfectos: el duelo resuelve los efectos del golpe por su cuenta; mods: lo que suma un ataque con arreglos
  const inv = S.invocaciones.find(x => x.id === invId);
  if(!inv) return;
  let formula = invDanoTxt(inv, invStatValor(inv, 'dmg'));
  if(mods){
    if(num(mods.dados) > 0) formula += ` + ${Math.round(num(mods.dados))}d${num(inv.armaTipo) || 8}`;
    if(num(mods.fijo)) formula += ` ${num(mods.fijo) > 0 ? '+' : '-'} ${fmt(Math.abs(num(mods.fijo)))}`;
  }
  const r = tirarDados(formula);
  if(!r) return;
  registrarTirada(`${inv.nombre} · Daño Arma`, r);
  if(!sinEfectos && (inv.armaEfectos||[]).length) EfectosGolpe.alPegar({
    arma: inv.armaNombre || 'el arma',
    efectos: inv.armaEfectos,
    publicar: linea => {
      registrarEvento(`⚠ ${linea.origen}: ${linea.formula.replace(/\n/g,' · ')}`);
      if(!fbDb || !fbUsuario || !fbMiembro) return;
      fbDb.collection(fbRutaCampana('tiradas')).add({
        uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: inv.nombre,
        origen: linea.origen.slice(0,120), formula: linea.formula.slice(0,900),
        rolls: linea.rolls.slice(0,100), mod:0, total:0, desde:'efecto',
        cuando: firebase.firestore.FieldValue.serverTimestamp(),
      }).catch(err=>console.error('No se pudieron publicar los efectos en la Mesa:', err));
    },
  });
}
// Invocaciones con un Parry esperando su Bloqueo (el Bloqueo solo existe después de un Parry, regla del dueño 2026-09-30).
// Se limpia al bloquear, atacar o pasar el turno. `o.trasParry`: el duelo ya sabe que el Parry se ganó.
const parryPendienteInv = new Set();
function invTirarStat(invId, statId, o){
  const inv = S.invocaciones.find(x => x.id === invId);
  if(!inv) return;
  if((statId === 'parry' || statId === 'bloqueo') && !defensaInv(inv)){ toast(`${inv.nombre}: ${Combatiente.SIN_ARMA_DEFENSA}`); return; }
  if(statId === 'bloqueo'){
    if(!(o && o.trasParry) && !parryPendienteInv.has(inv.id)){ toast(`${inv.nombre}: ${Combatiente.BLOQUEO_SOLO_TRAS_PARRY}`); return; }
    parryPendienteInv.delete(inv.id);
    renderInvocaciones();
  }
  if(statId === 'parry'){
    const costo = Combatiente.costoParry();   // el Parry siempre cuesta 1 No2
    if(costo > num(inv.nitros)){
      toast(`${inv.nombre}: no le alcanzan los No2 — el Parry cuesta ${fmt(costo)} No2 y tiene ${fmt(num(inv.nitros))}`);
      return;
    }
    inv.nitros = num(inv.nitros) - costo;
    parryPendienteInv.add(inv.id);   // si gana el Parry, sigue el Bloqueo
    renderInvocaciones();
    toast(`${inv.nombre}: Parry −${fmt(costo)} No2 · quedan ${fmt(inv.nitros)}`);
  }
  const valor = statId === 'bloqueo' ? bloqueoValorInv(inv) : invStatValor(inv, statId);
  tirarValorStatInv(inv, STAT_LABEL[statId] || statId, valor, statId);
}
function habilidadInvTira(h){ return !!(h.tiradaStat || (h.tiradaExtra||'').trim()); }
function mesaPublicarHabilidadInv(inv, nombre, detalle){
  if(!fbDb || !fbUsuario || !fbMiembro) return;
  fbDb.collection(fbRutaCampana('tiradas')).add({
    uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: inv.nombre,
    origen: String(nombre || 'Habilidad').slice(0, 80),
    formula: String(detalle || '').slice(0, 300),
    rolls: [], mod: 0, total: 0, desde: 'habilidad',
    cuando: firebase.firestore.FieldValue.serverTimestamp(),
  }).catch(err => console.error('No se pudo publicar la habilidad de la invocación en la Mesa:', err));
}
function anunciarHabilidadInv(inv, h){
  const detalle = (h && (h.detalle || h.efectoDetalle)) || '';
  if(habilidadInvTira(h)) mesaConTexto(detalle);
  else mesaPublicarHabilidadInv(inv, h.nombre, detalle);
}
// Igual que en el personaje (tirarPrimeraDeHab): al ejecutar se tira solo la primera; la fórmula, si hay stat, va con el botón 🎲.
function tirarExtraDeHabInv(inv, h){
  if(h.tiradaStat){
    tirarValorStatInv(inv, `${h.nombre} · ${STAT_LABEL[h.tiradaStat]||h.tiradaStat}`, invStatValor(inv, h.tiradaStat), h.tiradaStat);
    return true;
  }
  const formula = (h.tiradaExtra||'').trim();
  if(formula){
    const r = tirarDados(formula);
    if(r){ registrarTirada(`${inv.nombre} · ${h.nombre}`, r); return true; }
  }
  return false;
}
function tirarSegundaDeHabInv(invId, habId){
  const inv = S.invocaciones.find(x => x.id === invId);
  const h = inv && inv.habilidades.find(x => x.id === habId);
  if(!h) return;
  const r = tirarDados((h.tiradaExtra||'').trim());
  if(r) registrarTirada(`${inv.nombre} · ${h.nombre} · Efecto`, r); else toast('La fórmula de la habilidad no es válida');
}
const botonSegundaHabInv = (inv, h) => (h.tiradaStat && (h.tiradaExtra||'').trim())
  ? `<button type="button" class="mini" data-danohabinv="${inv.id}:${h.id}" title="Segunda tirada de la habilidad (daño o efecto): ${esc(String(h.tiradaExtra).trim())}">🎲 ${esc(String(h.tiradaExtra).trim())}</button>` : '';
// Tres modos (2026-09-30): 📣 manual solo anuncia; 💰 semi cobra No2 y cooldown y tira la primera; ✨ auto abre la Ejecución
// paso a paso a nombre de la invocación (ref `fichaId~invId`, como su ataque), o aplica directo si es solo sobre ella y sin tiradas.
function alcanceDeHabInv(inv, c, statTira){ return Combatiente.alcanceHab(c, statTira, s => invStatValor(inv, s)); }   // comun/combatiente.js
// La Ejecución de una invocación: la misma regla que el personaje y el creep (comun/combatiente.js, habEjecucion). Las
// invocaciones no tienen costo variable, así que ninguna «X» se toca.
function habDueloInv(inv, h){
  return Combatiente.habEjecucion(h, h && h.duelo, {stat: s => invStatValor(inv, s), etq: s => STAT_LABEL[s] || s});
}
// «Ataque con mi arma, con arreglos» de una invocación (2026-09-30, P134): el mismo armado que el personaje y el creep
// (comun/combatiente.js, ataqueConArreglos), con el arma de la invocación y su alcance (o el que diga la habilidad).
function ataqueDeHabInv(inv, h){
  const c = h && h.duelo;
  return Combatiente.ataqueConArreglos(h, c, {arma: {id: '', nombre: inv.armaNombre || '', tipoDado: num(inv.armaTipo) || 8, rango: !!inv.armaDeRango},
    alcance: c && c.alcance !== undefined && c.alcance !== 'auto' ? alcanceDeHabInv(inv, c, 'pdg') : (inv.armaDeRango ? Math.max(1, Math.round(num(invStatValor(inv, 'rng')))) : 1)});
}
// El PdG del ataque con arreglos, con lo que le suma la habilidad (los No2 ya los cobró la habilidad).
function tirarPdgDeArreglosInv(inv, atq){
  tirarValorStatInv(inv, 'Atacar (PdG)', invStatValor(inv, 'pdg') + num(atq && atq.mods && atq.mods.pdg), 'pdg');
}
// Se anuncia y va al cuadro del duelo como un ataque de la invocación; sin duelo, se tira el PdG suelto.
function lanzarAtaqueDeHabInv(inv, h){
  const atq = ataqueDeHabInv(inv, h);
  parryPendienteInv.delete(inv.id);   // atacar cierra el Parry que esperaba su Bloqueo
  mesaPublicarHabilidadInv(inv, h.nombre, h.detalle || h.efectoDetalle || '');
  if(atq && typeof Duelo !== 'undefined' && Duelo.disponible() && fichaVivo && fichaVivo.id && !fichaVivo.soloLectura && !fichaVivo.editaGM)
    Duelo.elegirObjetivo({yo: {ref: fichaVivo.id + '~' + inv.id, tipo: 'pj', nombre: inv.nombre}, ataque: atq, suelto: () => tirarPdgDeArreglosInv(inv, atq)});
  else tirarPdgDeArreglosInv(inv, atq);
}
// ⚡ Flash de una invocación (igual que un creep, P135/P136): cooldown y vida — el doble en turno ajeno —, nunca No2.
const costoFlashInv = h => ({cd: num(h.cd), hp: num(h.hpCosto)});
async function pagarFlashInv(inv, h){
  const motivo = Combatiente.bloqueoHab(h, {hp: inv.hp});
  if(motivo){ toast(`${inv.nombre}: ${h.nombre || 'Habilidad'} no se puede usar — ${motivo}`); return null; }
  const p = await ConfirmarTurno.flash(`⚡ ${h.nombre || 'Flash'}`, costoFlashInv(h), {quien: inv.nombre});
  if(!p) return null;
  if(p.hp > 0 && num(inv.hp) <= p.hp){ toast(`${inv.nombre}: no le alcanza la vida para ${h.nombre} (${fmt(p.hp)} HP)`); return null; }
  h.cdActual = p.cd;
  if(p.hp > 0) inv.hp = num(inv.hp) - p.hp;
  renderInvocaciones();
  return p;
}
async function usarFlashFueraDelDueloInv(inv, h){
  const p = await pagarFlashInv(inv, h);
  if(!p) return;
  const f = h.duelo.flash || {};
  mesaPublicarHabilidadInv(inv, h.nombre, `${h.detalle || ''}${h.detalle ? ' — ' : ''}⚡ Flash: +${fmt(num(f.bono))} a la tirada.`);
  toast(`${h.nombre}: ⚡ +${fmt(num(f.bono))} (sumalo a mano a la tirada; dentro del duelo se suma solo) · ${ConfirmarTurno.textoCosto(p)}`);
}
// Pone un estado en la invocación con la regla común (inmunidades, acumulación y renovación: comun/combatiente.js,
// agregarEstado — antes se sumaba directo y duplicaba). Devuelve el texto para la Mesa.
function ponerEstadoEnInv(inv, d){
  inv.estados = inv.estados || [];
  const r = Combatiente.agregarEstado(inv.estados, d);
  if(!r.ok) return `${d.nombre}: no le hizo efecto (${r.motivo})`;
  if(r.que === 'yaLoTiene') return `${d.nombre}: ya lo tenía`;
  const e = r.estado;
  if(modsAfectanHpInv(e.mods || [])) actualizarHpMaxPorConInv(inv);
  if(r.que === 'acumulado') return `${e.nombre} ×${fmt(num(e.stacks))}`;
  return `${e.nombre}${r.que === 'renovado' ? ' renovado' : ''}${e.permanente ? ' (no vence)' : e.turnos ? ` (${fmt(e.turnos)} turno${e.turnos === 1 ? '' : 's'})` : ''}${e.escudoMagico ? `, 🛡${fmt(e.escudoMagico)}` : ''}`;
}
// Un efecto del cuadro de Ejecución sobre la propia invocación: cura, o el estado armado igual que uno recibido (el preset
// con lo que traiga la habilidad encima, o uno propio).
function aplicarSpecAInv(inv, ef){
  if(ef.cura){ inv.hp = Math.min(num(inv.hpMax) > 0 ? num(inv.hpMax) : Infinity, num(inv.hp) + num(ef.cura)); return `+${fmt(num(ef.cura))} HP`; }
  return ponerEstadoEnInv(inv, estadoDeSpec(ef.spec || {nombre: ef.nombre}));
}
function invEjecutarHab(invId, habId){
  const inv = S.invocaciones.find(x => x.id === invId);
  const h = inv && inv.habilidades.find(x => x.id === habId);
  if(!inv || !h) return;
  const modo = modoHab(h);
  if(modo === 'manual'){ mesaPublicarHabilidadInv(inv, h.nombre, h.detalle || h.efectoDetalle || ''); toast(`${h.nombre || 'Habilidad'} anunciada`); return; }
  if(modo === 'auto' && Combatiente.tipoEjecucion(h.duelo) === 'flash'){ usarFlashFueraDelDueloInv(inv, h); return; }   // ⚡ su propia regla de costo (P136)
  const bloqueo = bloqueoHabInv(inv, h);
  if(bloqueo){ toast(`${inv.nombre}: ${h.nombre||'Habilidad'} — ${bloqueo}`); return; }
  // Se cobra lo que la habilidad tenga cargado (P133): No2, cooldown y vida; y si trae una cura del sistema anterior, cura.
  const costo = costoNitrosHabInv(inv, h), costoHp = num(h.hpCosto), curaHp = num(h.curaHp);
  inv.nitros = num(inv.nitros) - costo;
  if(habInvAtaque(h)) inv.ataquesTurno = num(inv.ataquesTurno) + 1;
  if(num(h.cd) > 0) h.cdActual = num(h.cd);
  if(costoHp > 0) inv.hp = num(inv.hp) - costoHp;
  if(curaHp > 0) inv.hp = Math.min(num(inv.hpMax) > 0 ? num(inv.hpMax) : Infinity, num(inv.hp) + curaHp);
  let efectoTxt = '';
  if((h.efectoNombre||'').trim()){
    const nombre = h.efectoNombre.trim();
    // Estado al ejecutar (sistema anterior): con las marcas de su preset, si tiene uno, para que valgan las inmunidades.
    efectoTxt = ponerEstadoEnInv(inv, {...flagsDePreset(nombre), id: uid(), nombre, detalle: h.efectoDetalle||'', turnos: Math.max(0,num(h.efectoTurnos)||0),
      hpturno: num(h.efectoHpTurno)||0, permanente: !!h.efectoPermanente, activo: true, stacks:1, stacksturno:0,
      polaridad: h.efectoPolaridad||'otro', mods: structuredClone(h.efectoMods||[])});
  }
  let hDuelo = null, aplicadoDirecto = '', falta = '', esArma = false;
  if(modo === 'auto'){
    // Lo que todavía no anda para invocaciones (la zona persistente — P134) se avisa y va como 💰.
    falta = Combatiente.ejecucionNoDisponible(h.duelo, 'inv');
    esArma = !falta && Combatiente.tipoEjecucion(h.duelo) === 'arma';   // ataque con arreglos: al duelo como un ataque
    const hab = falta || esArma ? null : habDueloInv(inv, h);
    if(falta || esArma){ /* el aviso va al final, junto con lo que se cobró; el ataque, más abajo */ }
    else if(Combatiente.sobreSiSinTiradas(hab)){
      aplicadoDirecto = hab.efectos.map(ef => aplicarSpecAInv(inv, ef)).join(' · ');
      mesaPublicarHabilidadInv(inv, h.nombre, [h.detalle || '', aplicadoDirecto ? '→ ' + aplicadoDirecto : '', hab.efectoLibre || '', hab.efectosNota || ''].filter(Boolean).join(' '));
    }else if(typeof Duelo !== 'undefined' && Duelo.disponible() && fichaVivo && fichaVivo.id && !fichaVivo.soloLectura && !fichaVivo.editaGM) hDuelo = hab;
  }
  if(esArma) lanzarAtaqueDeHabInv(inv, h);
  else if(hDuelo){
    mesaPublicarHabilidadInv(inv, h.nombre, h.detalle || h.efectoDetalle || '');
    Duelo.elegirObjetivo({yo: {ref: fichaVivo.id + '~' + inv.id, tipo: 'pj', nombre: inv.nombre}, ataque: {tipo: 'habilidad', hab: hDuelo, alcance: hDuelo.alcance}, suelto: () => tirarExtraDeHabInv(inv, h)});
  }else if(!aplicadoDirecto){
    anunciarHabilidadInv(inv, h);
    tirarExtraDeHabInv(inv, h);
  }
  renderInvocaciones();
  const partes = ['ejecutada', costo?`-${fmt(costo)} No2`:'sin costo de Nitros'];
  if(costoHp > 0) partes.push(`-${fmt(costoHp)} HP`);
  if(curaHp > 0) partes.push(`+${fmt(curaHp)} HP`);
  if(falta) partes.push(`⚠ ${falta}: se ejecutó como semiautomática`);
  if(aplicadoDirecto) partes.push(aplicadoDirecto);
  if(efectoTxt) partes.push(efectoTxt);
  toast(`${h.nombre||'Habilidad'} ${partes.join(' · ')}`);
}

function duplicarInvocacion(invId){
  const idx = S.invocaciones.findIndex(x => x.id === invId);
  if(idx < 0) return;
  const copia = structuredClone(S.invocaciones[idx]);
  copia.id = uid();
  copia.nombre = (copia.nombre || 'Invocación') + ' (copia)';
  copia.habilidades = (copia.habilidades || []).map(h => ({...h, id: uid()}));
  copia.estados = (copia.estados || []).map(es => ({...es, id: uid()}));
  copia.equipo = (copia.equipo || []).map(it => ({...it, id: uid()}));
  S.invocaciones.splice(idx + 1, 0, copia);
  renderInvocaciones();
  toast(`${copia.nombre} creada`);
}

/* ---------- Habilidades de una invocación: mismo asistente paso a paso
   que un creep de gm-tools (campos fijos, no el editor genérico de la
   ficha) — qué es, costo (No2 o "como un ataque"), tirada, estado al
   ejecutar, resumen. ---------- */
const PASOS_HAB_INV = [
  {corto: 'Qué es', titulo: '¿Cómo se llama y qué hace?',
   ayuda: 'Esta descripción se lee en la Mesa cada vez que se usa.'},
  {corto: 'Costo', titulo: '¿Cuánto le cuesta y cada cuánto se puede usar?',
   ayuda: 'Los No2 se recargan en cada Mantenimiento.'},
  {corto: 'Tirada al ejecutar', titulo: '¿Qué se tira al tocar Ejecutar?',
   ayuda: 'Lo que se tira apenas tocás Ejecutar: elegí el stat del golpe o de la prueba (por ejemplo PdG para un ataque). Es la PRIMERA tirada, de golpe. Si no elegís ninguno, Ejecutar no tira un stat (y si en el paso siguiente hay una fórmula, Ejecutar tira esa fórmula directamente). Si la habilidad incluye un ataque (o cuesta lo mismo que uno), conviene elegir PdG.'},
  {corto: 'Tirada de efecto', titulo: '¿Tiene una tirada de efecto (daño, curación…)?',
   ayuda: 'La tirada interna de la habilidad: daño, curación, duración… (por ejemplo 2d6+3). Aparece como un botoncito 🎲 en la misma tarjeta, al lado de Ejecutar, y solo si esta tirada existe y hay un stat en el paso anterior. Sin stat, Ejecutar tira esta fórmula directamente y no hay botón aparte. Se puede dejar vacía.'},
  {corto: 'Estado', titulo: '¿Aplica un estado alterado?',
   ayuda: 'Se aplica sobre la propia invocación al ejecutarla. Si no aplica ninguno, dejá el nombre vacío y seguí.'},
  {corto: 'Listo', titulo: 'Revisá cómo quedó',
   ayuda: 'Si algo no está bien, tocá el paso arriba para volver. Si está todo, guardala.'},
  {corto: 'Cómo se ejecuta', titulo: '¿Cómo se ejecuta esta habilidad?',
   ayuda: 'Tres formas, de menos a más automática (las mismas que las habilidades del personaje). Se puede cambiar cuando quieras.'},
  {corto: 'Ejecución', titulo: '¿Cómo se juega paso a paso?',
   ayuda: 'A quién apunta, qué tira cada uno, el daño y los efectos: el mismo cuadro de Ejecución que se abre para toda la mesa al usarla.'},
];
// Pasos visibles según el modo (índices de PASOS_HAB_INV / data-hi-paso). El estado sobre la invocación (sistema anterior)
// aparece en semi y en auto solo si ya lo tenía.
function hiOrden(){
  const m = editingHabInv && editingHabInv.modo, conEstado = !!$('#hi-efecto-nombre').value.trim();
  if(m === 'semi') return [6, 0, 1, 2, 3, ...(conEstado ? [4] : []), 5];
  if(m === 'auto') return [6, 0, 1, 7, ...(conEstado ? [4] : []), 5];
  return [6, 0, 5];
}
const EXPLICA_MODO_INV = {
  manual: 'El botón se llama <b>Anunciar</b>: publica la descripción en la Mesa y todo lo demás (No2, cooldown, tiradas y efectos) va a mano.',
  semi: 'Al tocar <b>Ejecutar</b> cobra solo los <b>No2</b> y pone el <b>cooldown</b>, y <b>tira la tirada inicial</b> si la tiene. Los efectos se resuelven a mano.',
  auto: 'Al tocar <b>Ejecutar</b> se abre la <b>Ejecución paso a paso</b> a nombre de la invocación: elegís el objetivo, cada uno tira en su momento y se aplican los efectos. Si es solo sobre la invocación y no tira nada, se aplica directo.',
};
function hiModosRender(){
  const m = editingHabInv.modo;
  $('#hi-modos').innerHTML = Object.entries(MODOS_HAB).map(([k, v]) => `<button type="button" class="opcion-btn modo-hab-btn ${m === k ? 'activa' : ''}" data-hi-modo="${k}"><b>${v.icono} ${v.nombre}</b><span>${EXPLICA_MODO_INV[k]}</span></button>`).join('')
    + (m === null ? '<div class="hint">Elegí una para seguir.</div>' : '');
}
function hiEjecucionRender(){
  const c = editingHabInv.duelo;
  $('#hi-ejecucion-resumen').innerHTML = c ? `Configurada: <b>${esc(resumenEjecucionHab(c))}</b>.` : 'Todavía <b>no está configurada</b>: sin esto, al ejecutarla solo cobra y tira la tirada inicial (como la semiautomática).';
  $('#hi-ejecucion-abrir').textContent = `✨ ${c ? 'Cambiar' : 'Armar'} la ejecución paso a paso`;
}
function hiAbrirEjecucion(){
  const e = editingHabInv;
  AsistenteDueloHab.abrir({nombre: $('#hi-nombre').value.trim() || 'Habilidad', inicial: e.duelo || null, siempreActivo: true, tieneFormula: !!$('#hi-tirada').value.trim(),
    costoInicial: {sp: '', nitrosCosto: $('#hi-nitros-modo').value === 'ataque' ? 'ATAQUE' : num($('#hi-acciones').value), hpCosto: num($('#hi-hpcosto').value)}, elegirEstado: elegirEstadoDuelo,
    alGuardar: r => {
      if(editingHabInv !== e) return;
      if(r){
        e.duelo = r.duelo;
        if(r.costo.nitrosCosto === 'ATAQUE') $('#hi-nitros-modo').value = 'ataque';
        else{ $('#hi-nitros-modo').value = 'num'; $('#hi-acciones').value = Math.max(0, num(r.costo.nitrosCosto)); }
        $('#hi-hpcosto').value = Math.max(0, num(r.costo.hpCosto));
        hiAplicarModoNitros();
      }else{ e.duelo = null; e.modo = 'semi'; }
      hiMostrarPaso(e.paso);
    }});
}

let editingHabInv = null;   // {invId, habId, paso}
let editingHabInvPdgAuto = false;

function hiAplicarModoNitros(){
  const modo = $('#hi-nitros-modo').value;
  document.querySelectorAll('[data-hi-nitros-modo]').forEach(b => b.classList.toggle('activa', b.dataset.hiNitrosModo === modo));
  $('#hi-acciones-caja').style.visibility = modo === 'ataque' ? 'hidden' : 'visible';
  const inv = editingHabInv && S.invocaciones.find(x => x.id === editingHabInv.invId);
  $('#hi-ataque-ayuda').textContent = modo === 'ataque'
    ? `Cuesta lo mismo que un ataque con su arma (Tipo ÷ 2 el primero del turno, Tipo completo después) y cuenta como ese ataque.${inv ? ` Hoy: ${fmt(costoAtaqueInv(inv))} No2.` : ''}`
    : 'Siempre gasta esa cantidad.';
  if(modo === 'ataque' && !$('#hi-tirada-stat').value){ $('#hi-tirada-stat').value = 'pdg'; editingHabInvPdgAuto = true; }
  else if(modo !== 'ataque' && editingHabInvPdgAuto){ $('#hi-tirada-stat').value = ''; editingHabInvPdgAuto = false; }
}

// `n` es la posición dentro de los pasos visibles (hiOrden), no el índice de PASOS_HAB_INV.
function hiMostrarPaso(n){
  if(!editingHabInv) return;
  const orden = hiOrden(), total = orden.length;
  let destino = Math.max(0, Math.min(total - 1, n));
  if(destino > 0 && editingHabInv.modo === null){ toast('Primero elegí cómo se ejecuta'); destino = 0; }
  else if(destino > 1 && !$('#hi-nombre').value.trim()){ toast('Primero ponele un nombre'); destino = 1; }
  editingHabInv.paso = destino;
  const paso = destino, idx = orden[paso];
  const nueva = !editingHabInv.habId;
  const listoParaSeguir = editingHabInv.modo !== null && !!$('#hi-nombre').value.trim();
  $('#hi-pasos').innerHTML = orden.map((ix, i) => {
    const bloqueado = nueva && i > paso && !listoParaSeguir;
    return `<button type="button" class="paso-chip${i === paso ? ' activo' : ''}${i < paso ? ' hecho' : ''}" data-hi-ir="${i}" ${bloqueado ? 'disabled' : ''}>${i + 1}. ${PASOS_HAB_INV[ix].corto}</button>`;
  }).join('');
  $('#hi-paso-titulo').textContent = PASOS_HAB_INV[idx].titulo;
  $('#hi-paso-ayuda').textContent = PASOS_HAB_INV[idx].ayuda;
  document.querySelectorAll('#scrim-hab-inv .hi-paso').forEach(el => { el.hidden = num(el.dataset.hiPaso) !== idx; });
  if(idx === 6) hiModosRender();
  if(idx === 7) hiEjecucionRender();
  $('#hi-atras').style.visibility = paso > 0 ? 'visible' : 'hidden';
  $('#hi-siguiente').hidden = paso === total - 1;
  $('#habinv-guardar').hidden = nueva && paso !== total - 1;
  if(paso === total - 1) $('#hi-resumen').innerHTML = hiResumenHtml();
  const primero = document.querySelector(`#scrim-hab-inv .hi-paso[data-hi-paso="${idx}"] input:not([type=hidden]),#scrim-hab-inv .hi-paso[data-hi-paso="${idx}"] select,#scrim-hab-inv .hi-paso[data-hi-paso="${idx}"] textarea`);
  if(primero) setTimeout(() => primero.focus(), 30);
}

function hiOpcionesStat(elegido){
  const op = id => `<option value="${id}" ${elegido === id ? 'selected' : ''}>${esc(STAT_LABEL[id]||id)}</option>`;
  return '<option value="">— no tira un stat —</option>' +
    `<optgroup label="Principales">${ATTR_IDS_INV.map(op).join('')}</optgroup>` +
    `<optgroup label="Secundarios">${INV_STATS_HAB.map(op).join('')}</optgroup>`;
}

function hiResumenHtml(){
  const fila = (titulo, valor) => `<div class="resumen-fila"><span>${titulo}</span><b>${esc(valor)}</b></div>`;
  const detalle = $('#hi-detalle').value.trim();
  const estado = $('#hi-efecto-nombre').value.trim();
  const turnos = num($('#hi-efecto-turnos').value);
  const cd = num($('#hi-cd').value);
  return `<div class="resumen-nombre">${esc($('#hi-nombre').value.trim() || '(sin nombre)')}</div>
    <div class="resumen-desc">${detalle ? esc(detalle) : '<span style="color:var(--muted)">(sin descripción)</span>'}</div>
    ${fila('Ejecución', (m => `${m.icono} ${m.nombre} (${m.corto})`)(MODOS_HAB[editingHabInv.modo || 'semi']))}
    ${editingHabInv.modo === 'auto' ? fila('Paso a paso', editingHabInv.duelo ? resumenEjecucionHab(editingHabInv.duelo) : 'sin configurar') : ''}
    ${fila('No2', $('#hi-nitros-modo').value === 'ataque' ? 'como un ataque' : fmt(Math.max(0, num($('#hi-acciones').value))))}
    ${fila('Cooldown', cd ? `${fmt(cd)} turno${cd===1?'':'s'}` : 'sin cooldown')}
    ${num($('#hi-hpcosto').value) > 0 ? fila('Vida', `${fmt(num($('#hi-hpcosto').value))} HP`) : ''}
    ${fila('Al ejecutar', STAT_LABEL[$('#hi-tirada-stat').value] || $('#hi-tirada').value.trim() || 'no tira')}
    ${fila('Efecto', $('#hi-tirada-stat').value && $('#hi-tirada').value.trim() ? $('#hi-tirada').value.trim() + ' (botón 🎲)' : 'sin tirada de efecto')}
    ${fila('Estado', estado ? `${estado}${turnos ? ` (${fmt(turnos)} turnos)` : ''}` : 'ninguno')}`;
}

function abrirEditorHabInv(invId, habId){
  const inv = S.invocaciones.find(x => x.id === invId);
  if(!inv) return;
  const h = habId ? inv.habilidades.find(x => x.id === habId) : {};
  if(!h) return;
  editingHabInv = {invId, habId: habId || null, paso: 0, modo: habId ? modoHab(h) : null, duelo: h.duelo && typeof h.duelo === 'object' ? structuredClone(h.duelo) : null};
  $('#hi-titulo-modal').textContent = habId ? `Editar habilidad · ${inv.nombre}` : `Nueva habilidad · ${inv.nombre}`;
  $('#hi-nombre').value = h.nombre || '';
  $('#hi-nitros-modo').value = habInvAtaque(h) ? 'ataque' : 'num';
  $('#hi-acciones').value = habInvAtaque(h) ? IT2_INV.nitrosHabilidad : (h.nitrosCosto ?? IT2_INV.nitrosHabilidad);
  editingHabInvPdgAuto = false;
  $('#hi-cd').value = h.cd || 0;
  $('#hi-hpcosto').value = h.hpCosto || 0;
  $('#hi-detalle').value = h.detalle || '';
  $('#hi-tirada').value = h.tiradaExtra || '';
  $('#hi-tirada-stat').innerHTML = hiOpcionesStat(h.tiradaStat || '');
  $('#hi-efecto-preset').innerHTML = '<option value="">— elegir preset o completar a mano —</option>' + optgroupsEfectosPresetHtml();
  $('#hi-efecto-nombre').value = h.efectoNombre || '';
  $('#hi-efecto-turnos').value = h.efectoTurnos || 0;
  $('#hi-efecto-hpturno').value = h.efectoHpTurno || 0;
  $('#hi-efecto-detalle').value = h.efectoDetalle || '';
  $('#hi-efecto-permanente').checked = !!h.efectoPermanente;
  $('#hi-efecto-polaridad').value = h.efectoPolaridad || 'otro';
  $('#hi-efecto-mods').value = JSON.stringify(h.efectoMods || []);
  hiAplicarModoNitros();
  $('#scrim-hab-inv').classList.add('open');
  hiMostrarPaso(0);
}

function guardarEditorHabInv(){
  if(!editingHabInv) return;
  const inv = S.invocaciones.find(x => x.id === editingHabInv.invId);
  if(!inv){ editingHabInv = null; return; }
  let h = editingHabInv.habId ? inv.habilidades.find(x => x.id === editingHabInv.habId) : null;
  if(editingHabInv.habId && !h){ editingHabInv = null; return; }
  if(!$('#hi-nombre').value.trim()){ hiMostrarPaso(1); return; }
  if(!h){
    h = {id: uid(), cdActual: 0};
    inv.habilidades.push(h);
  }
  h.nombre = $('#hi-nombre').value.trim() || 'Sin nombre';
  h.nitrosCosto = $('#hi-nitros-modo').value === 'ataque' ? 'ATAQUE' : Math.max(0, num($('#hi-acciones').value) || 0);
  h.cd = Math.max(0, num($('#hi-cd').value) || 0);
  const hpCostoInv = Math.max(0, num($('#hi-hpcosto').value) || 0);
  if(hpCostoInv) h.hpCosto = hpCostoInv; else delete h.hpCosto;
  h.detalle = $('#hi-detalle').value;
  h.tiradaExtra = $('#hi-tirada').value.trim();
  h.tiradaStat = $('#hi-tirada-stat').value;
  h.efectoNombre = $('#hi-efecto-nombre').value.trim();
  h.efectoTurnos = Math.max(0, num($('#hi-efecto-turnos').value) || 0);
  h.efectoHpTurno = num($('#hi-efecto-hpturno').value) || 0;
  h.efectoDetalle = $('#hi-efecto-detalle').value;
  h.efectoPermanente = $('#hi-efecto-permanente').checked;
  h.efectoPolaridad = $('#hi-efecto-polaridad').value || 'otro';
  try{ h.efectoMods = JSON.parse($('#hi-efecto-mods').value) || []; }catch(e){ h.efectoMods = []; }
  h.modo = editingHabInv.modo || 'semi';
  h.automatizada = h.modo !== 'manual';
  if(editingHabInv.duelo) h.duelo = editingHabInv.duelo; else delete h.duelo;
  editingHabInv = null;
  $('#scrim-hab-inv').classList.remove('open');
  renderInvocaciones();
  toast(`${h.nombre} guardada`);
}

/* ---------- "+ Estado" de una invocación: mismo selector de presets que
   el "+ Estado" de la ficha, targeteando inv.estados en vez de S.efectos.
   No tiene "Editar" desde la tarjeta (a propósito, para no duplicar el
   editor genérico) — se activa directo o se borra desde la lista. ---------- */
let presetInvId = null;
function abrirPresetsEfectoInv(invId){
  presetInvId = invId;
  abrirPresetsEfecto('inv');
}
function activarEfectoPresetInv(preset){
  const inv = S.invocaciones.find(x => x.id === presetInvId);
  if(!inv) return;
  const {nombre, ...resto} = preset;
  const datos = {id: uid(), nombre, ...structuredClone(resto)};
  inv.estados = inv.estados || [];
  // La misma regla que el personaje y los creeps (antes la invocación no revisaba inmunidades: Invulnerable no frenaba un Stun).
  const r = agregarEstadoConAviso(inv.estados, datos, inv.nombre);
  if(r.ok && modsAfectanHpInv(r.estado.mods)) actualizarHpMaxPorConInv(inv);
  renderInvocaciones();
}

// Cableado del editor de habilidad de invocación (campos fijos, no el
// editor genérico) — mismo patrón que gm-tools con sus habilidades de creep.
$('#habinv-guardar').onclick = guardarEditorHabInv;
$('#hi-ejecucion-abrir').onclick = hiAbrirEjecucion;
$('#hi-modos').addEventListener('click', e => {
  const b = e.target.closest('[data-hi-modo]');
  if(!b || !editingHabInv) return;
  editingHabInv.modo = b.dataset.hiModo;
  hiMostrarPaso(0);
});
$('#hi-pasos').addEventListener('click', e => {
  const chip = e.target.closest('[data-hi-ir]');
  if(chip && editingHabInv) hiMostrarPaso(num(chip.dataset.hiIr));
});
document.querySelectorAll('[data-hi-nitros-modo]').forEach(b => b.onclick = () => {
  $('#hi-nitros-modo').value = b.dataset.hiNitrosModo;
  hiAplicarModoNitros();
});
$('#hi-tirada-stat').addEventListener('change', () => { editingHabInvPdgAuto = false; });
$('#hi-siguiente').onclick = () => { if(editingHabInv) hiMostrarPaso(editingHabInv.paso + 1); };
$('#hi-atras').onclick = () => { if(editingHabInv) hiMostrarPaso(editingHabInv.paso - 1); };
$('#scrim-hab-inv').addEventListener('keydown', e => {
  if(e.key !== 'Enter' || !editingHabInv || !e.target.matches('[data-hi-enter]')) return;
  e.preventDefault();
  if(editingHabInv.paso < hiOrden().length - 1) hiMostrarPaso(editingHabInv.paso + 1);
});
$('#hi-nombre').addEventListener('input', () => { if(editingHabInv && !editingHabInv.habId) hiMostrarPaso(editingHabInv.paso); });
$('#hi-efecto-preset').addEventListener('change', e => {
  if(!e.target.value) return;
  const [tipo, idx] = e.target.value.split(':');
  const preset = (tipo === 'std' ? EFECTOS_PRESET : (S.efectosPersonalizados || []))[+idx];
  if(!preset) return;
  $('#hi-efecto-nombre').value = preset.nombre;
  $('#hi-efecto-turnos').value = preset.turnos ?? 0;
  $('#hi-efecto-hpturno').value = preset.hpturno ?? 0;
  $('#hi-efecto-detalle').value = preset.detalle || '';
  $('#hi-efecto-permanente').checked = !!preset.permanente;
  $('#hi-efecto-polaridad').value = preset.polaridad || 'otro';
  $('#hi-efecto-mods').value = JSON.stringify(preset.mods || []);
});
$('#habinv-cancel').onclick = () => { editingHabInv = null; $('#scrim-hab-inv').classList.remove('open'); };
$('#habinv-x').onclick = () => { editingHabInv = null; $('#scrim-hab-inv').classList.remove('open'); };
$('#scrim-hab-inv').addEventListener('mousedown', e => { if(e.target.id==='scrim-hab-inv'){ editingHabInv = null; $('#scrim-hab-inv').classList.remove('open'); } });
$('#editarinv-x').onclick = cerrarEditarInv;
$('#scrim-editar-inv').addEventListener('mousedown', e => { if(e.target.id==='scrim-editar-inv') cerrarEditarInv(); });
$('#botonerainv-x').onclick = () => { botoneraInvId = null; $('#scrim-botonera-inv').classList.remove('open'); };
$('#scrim-botonera-inv').addEventListener('mousedown', e => { if(e.target.id==='scrim-botonera-inv'){ botoneraInvId = null; $('#scrim-botonera-inv').classList.remove('open'); } });
$('#verhabinv-x').onclick = () => $('#scrim-verhabinv').classList.remove('open');
$('#scrim-verhabinv').addEventListener('mousedown', e => { if(e.target.id==='scrim-verhabinv') $('#scrim-verhabinv').classList.remove('open'); });

function defValorDe(i){
  return (i.mods||[]).filter(m => m.stat === 'def').reduce((a,m) => a + num(m.val), 0);
}

function invRow(i, contexto){
  const dano = armaDanoTxt(i);
  const defVal = defValorDe(i);
  const statTxt = dano
    ? `Daño ${dano}`
    : (defVal ? `Defensa ${defVal>0?'+':''}${fmt(defVal)}` : '');
  const pesoTag = `<span class="tag">peso ${fmt(num(i.peso))}</span>`;
  const mano = (contexto === 'equipo' && dano) ? asignarManos().get(i.id) : null;
  const atacarTxt = mano ? `Atacar (Mano ${mano})` : 'Atacar';
  return `<div class="item">
      <div class="ihead">
        ${thumb(i)}
        <div><div class="iname">${esc(i.nombre)} ${pesoTag}</div>
          ${durLineaHtml(i)}
          ${statTxt ? `<div class="istat">${statTxt} ${dano ? `<button class="mini" data-tirararma="${i.id}" title="Tirar el daño de esta arma">🎲 ${atacarTxt}</button>` : ''}</div>` : ''}
          ${i.detalle ? `<div class="idesc">${esc(i.detalle)}</div>` : ''}
        </div>
        <div class="rowbtns">
          ${!i.consumible ? `<button class="mini ${i.equipado?'on':''}" data-toggle="${i.id}" title="${i.equipado?'Pasar a mochila':'Equipar'}">${i.equipado?'← Mochila':'Equipar'}</button>` : ''}
          ${(contexto === 'mochila') ? (i.enMesa ? `<button class="mini" data-mesa-ret-item="${i.enMesa}" title="Sacarlo de la mesa común">🤝 En la mesa · retirar</button>` : `<button class="mini" data-mesa-pub="${i.id}" title="Ofrecerlo en la mesa común: sigue en tu mochila hasta que otro jugador se lo lleve">🤝 A la mesa</button>`) : ''}
          ${(contexto === 'mochila' && i.consumible) ? `<button class="mini" data-tocinturon="${i.id}" ${num(i.unidades)<=0?'disabled':''} title="Mover 1 unidad de esta pila al cinturón">→ Cinturón</button>` : ''}
          <button class="mini" data-view="inventario:${i.id}">Ver</button><button class="mini" data-edit="inventario:${i.id}">Editar</button>
          <button class="mini danger" data-rmitem="inventario:${i.id}" title="Eliminar">×</button>
        </div>
      </div>
      ${i.consumible ? unitStepper(i, 'inventario') : ''}
      ${i.consumible ? cargaIndicator(i) : ''}
      ${consumeButton(i, 'inventario')}
      </div>`;
}

const LISTS = {
  equipo:{
    empty:'Nada equipado todavía.',
    row:i => invRow(i, 'equipo')
  },
  mochila:{
    empty:'Mochila vacía.',
    row:i => invRow(i, 'mochila')
  },
  cinturon:{
    empty:'Cinturón vacío.',
    row:i => `<div class="item">
      <div class="ihead">
        ${thumb(i)}
        <div><div class="iname">${esc(i.nombre)}</div>
          ${i.detalle ? `<div class="idesc">${esc(i.detalle)}</div>` : ''}
        </div>
        <div class="rowbtns">
          <button class="mini" data-tomochila="${i.id}" title="Devolver esta unidad a la mochila">← Mochila</button>
          <button class="mini" data-view="cinturon:${i.id}">Ver</button><button class="mini" data-edit="cinturon:${i.id}">Editar</button>
          <button class="mini danger" data-rmitem="cinturon:${i.id}" title="Eliminar">×</button>
        </div>
      </div>
      ${unitStepper(i, 'cinturon')}
      ${cargaIndicator(i)}
      ${consumeButton(i, 'cinturon')}
      </div>`
  },
  habilidades:{
    empty:'Sin habilidades cargadas.',
    row:i => {
      const sinNitros = sinNitrosPara(i);
      const bloqueada = sinNitros;
      return `<div class="item">
      <div class="ihead">
        ${thumb(i)}
        <div><div class="iname">${esc(i.nombre)} ${i.costo?`<span class="tag cost">${esc(i.costo)}</span>`:''}<span class="tag cost" title="${esc(MODOS_HAB[modoHab(i) || 'semi'].nombre)}: ${esc(MODOS_HAB[modoHab(i) || 'semi'].corto)}">${MODOS_HAB[modoHab(i) || 'semi'].icono} ${esc(MODOS_HAB[modoHab(i) || 'semi'].nombre.toLowerCase())}</span>${i.para === 'creep' ? ' <span class="tag cost" title="Habilidad pensada para creeps: paga con cooldown, no con SP. En la ficha no hay cooldown: revisale el costo.">🐾 de creep</span>' : ''}${versionNuevaDeHab(i) ? ` <button type="button" class="mini" data-versionhab="${i.id}" title="Alguien corrigió la habilidad de la que salió esta: ver y decidir si actualizarla">🔔 versión nueva</button>` : ''}</div>
          <div class="idesc">${esc(i.detalle)}</div>
        </div>
        <div class="rowbtns"><button class="mini" data-view="habilidades:${i.id}">Ver</button><button class="mini" data-edit="habilidades:${i.id}">Editar</button><button class="mini" data-duelohab="${i.id}" title="Ejecución: cómo se juega esta habilidad (qué se tira, con qué se resiste, daño y efectos)">✨</button><button class="mini" data-subirhab="${i.id}" title="Subir a la biblioteca con toda su configuración: queda disponible para todos al instante">⬆</button></div>
      </div>
      <button class="ejecutar-btn" data-ejecutar="${i.id}" ${bloqueada?'disabled':''}>${habAutomatizada(i) ? 'Ejecutar' + (sinNitros?' · sin recursos':'') : 'Anunciar'}</button>
      ${botonSegundaHab(i) ? `<div style="margin-top:6px">${botonSegundaHab(i)}</div>` : ''}
      </div>`;
    }
  },
  pasivas:{
    empty:'Sin pasivas.',
    row:i => `<div class="item">
      <div class="ihead">
        ${thumb(i)}
        <div><div class="iname">${esc(i.nombre)}${pasivaCompras(i) > 1 ? ' <span class="tag cost">×' + pasivaCompras(i) + '</span>' : ''}${versionNuevaDePasiva(i) ? ` <button type="button" class="mini" data-versionpasiva="${i.id}" title="Alguien corrigió la pasiva de la que salió esta: ver y decidir si actualizarla">🔔 versión nueva</button>` : ''}</div><div class="idesc">${esc(i.detalle)}</div>
        <div class="imeta">${modTags(i.mods)}</div></div>
        <div class="rowbtns"><button class="mini" data-proponerpasiva="${i.id}" title="Subir esta pasiva a la biblioteca compartida: queda disponible para todos al instante">⬆ Subir</button><button class="mini" data-view="pasivas:${i.id}">Ver</button><button class="mini" data-edit="pasivas:${i.id}">Editar</button></div>
      </div></div>`
  },
  sociales:{
    empty:'Sin talentos.',
    row:i => `<div class="item">
      <div class="ihead">
        ${thumb(i)}
        <div><div class="iname">${esc(i.nombre)} <span class="tag cost" title="${esc(tiradaSocialTxt(i))}">${esc(nivelSocialTxt(i))}</span></div>
          <div class="idesc">${esc(i.detalle)}</div></div>
        <div class="rowbtns"><button class="mini" data-view="sociales:${i.id}">Ver</button><button class="mini" data-edit="sociales:${i.id}">Editar</button><button class="mini" data-nivelsocial="${i.id}" title="Subir o bajar el nivel del talento (por Inteligencia, por tirada máxima o a mano)">± Nivel</button><button class="mini" data-tirarsocial="${i.id}">Dado</button></div>
      </div></div>`
  },
  efectos:{
    empty:'Sin estados alterados. Buen momento.',
    // Chip: lo justo para leerlo de un vistazo en combate. El detalle, los
    // modificadores y el resto se abren con un clic en el nombre.
    row:i => {
      if(i.derivado){
        // De una pasiva: solo lectura (sin pausar ni abrir el editor).
        return `<div class="ef-chip de-equipo${i.detalle ? ' con-tip' : ''}"${i.detalle ? ` data-tip="${esc(i.detalle)}"` : ''}>
        <span class="ef-chip-cuerpo" style="cursor:help"><span class="ef-chip-nombre">${esc(i.nombre)}</span>
          <span class="ef-chip-datos">${i.sobrepeso ? `−${fmt(i.sobrepeso)} Eva` : `∞ · +${fmt(num(i.hpturno))} HP`}</span></span>
        <span class="ef-chip-equipo" title="${i.sobrepeso ? 'Sale del peso de tu equipo: se va al sacarte equipo' : 'Viene de una pasiva: se va si la sacás'}">${i.sobrepeso ? '⚖' : '✦'}</span>
      </div>`;
      }
      const st = Math.max(1, num(i.stacks)||1);
      const hp = num(i.hpturno)*st;
      const activo = i.activo !== false;
      const urgente = activo && !i.permanente && num(i.turnos) === 1;
      const dur = i.permanente ? '∞' : (num(i.turnos) > 0 ? `${fmt(num(i.turnos))}t` : '');
      const partes = [];
      if(st > 1) partes.push(`×${fmt(st)}`);
      if(dur) partes.push(dur);
      if(hp) partes.push(`${hp > 0 ? '+' : ''}${fmt(hp)} HP`);
      const det = (i.detalle || '').trim();
      const deEquipo = !!i.origenItem;
      return `<div class="ef-chip${activo ? '' : ' pausado'}${urgente ? ' urgente' : ''}${det ? ' con-tip' : ''}${deEquipo ? ' de-equipo' : ''}"${det ? ` data-tip="${esc(det)}"` : ''}>
        <button type="button" class="ef-chip-toggle" data-toggle="${i.id}" title="${activo ? 'Pausar' : 'Activar'}">${activo ? '✓' : '○'}</button>
        ${i.armaduraRota ? `<button type="button" class="ef-chip-toggle" data-armrota="${i.id}:-1" title="Un punto menos de armadura rota (al llegar a 0, se repara)">−</button><button type="button" class="ef-chip-toggle" data-armrota="${i.id}:1" title="Un punto más de armadura rota">+</button>` : ''}
        <button type="button" class="ef-chip-cuerpo" data-view="efectos:${i.id}" title="Ver el detalle">
          <span class="ef-chip-nombre">${esc(i.nombre)}</span>
          ${partes.length ? `<span class="ef-chip-datos">${esc(partes.join(' · '))}</span>` : ''}
        </button>
        ${(i.escudoMagicoActual !== undefined || num(i.escudoMagico) > 0) ? `<button type="button" class="ef-chip-toggle" data-escudo="${i.id}:-1" title="Un punto menos de escudo">−</button><button type="button" class="ef-chip-toggle" data-escudo="${i.id}:set" style="width:auto;padding:0 6px" title="Escribir el valor (número, +N, -N; en un escudo, «max N» cambia el máximo)">${i.excedenteVida ? '❤+' + fmt(num(i.escudoMagicoActual ?? i.escudoMagico)) + (i.excedenteTope ? '/' + fmt(num(i.excedenteTope)) : '') : '🛡' + fmt(num(i.escudoMagicoActual ?? i.escudoMagico)) + '/' + fmt(num(i.escudoMagico))}</button><button type="button" class="ef-chip-toggle" data-escudo="${i.id}:1" title="Un punto más de escudo">+</button>` : ''}
        ${deEquipo ? '<span class="ef-chip-equipo" title="Viene de un ítem equipado: se va al sacártelo">⚙</span>' : ''}
        ${i.popup ? '<span class="ef-chip-pop" title="Avisa en el mantenimiento">◆</span>' : ''}
      </div>`;
    }
  }
};

// Escudo especial / Excedente de vida: cambiar el valor a mano (número, +N/−N o «max N»): comun/combatiente.js.
function escudoParsear(txt, actual, max){ return Combatiente.escudoParsear(txt, actual, max); }

// Estados que vienen de una pasiva (2026-09-24, pedido del dueño): hoy solo la regeneración (`regenHp`). No se guardan: se arman
// cada vez a partir de las pasivas, aparecen entre los estados alterados activos y en el resumen que ve el mapa, pero son de
// solo lectura (se sacan quitando la pasiva) y el Mantenimiento ya los aplica por su lado, así no se cuentan dos veces.
// Qué efectos de ítems y pasivas deben mostrarse como estado y cuáles no es una pregunta abierta (docs/preguntas-abiertas.md).
function estadosDePasivas(){ return FichaResumen.estadosDePasivas(S); }   // comun/ficha-resumen.js
// Sobrepeso: estado derivado (no se guarda): aparece solo mientras el equipo pasa la Crg.Max. La penalidad se decide al tirar Evasión.
function estadoSobrepeso(){ return FichaResumen.estadoSobrepeso(S); }
const estadosTodos = () => FichaResumen.estadosTodos(S);

function renderList(key){
  const el = $('#list-'+key);
  if(!el) return;
  let arr;
  if(key === 'equipo'){
    const manos = asignarManos();
    arr = S.inventario.filter(i=>i.equipado).slice().sort((a,b) => {
      const oa = ordenEquipoDe(a), ob = ordenEquipoDe(b);
      if(oa !== ob) return oa - ob;
      return (manos.get(a.id) || 99) - (manos.get(b.id) || 99);
    });
  }else if(key === 'mochila'){
    arr = S.inventario.filter(i=>!i.equipado).slice().sort((a,b) => ordenEquipoDe(a) - ordenEquipoDe(b));
  }else if(key === 'efectos'){
    arr = estadosTodos();
  }else{
    arr = S[key];
  }
  el.innerHTML = arr.length ? arr.map(LISTS[key].row).join('') : `<div class="empty">${LISTS[key].empty}</div>`;
  if(key === 'efectos') ajustarEstados();
  if(key === 'pasivas') renderList('efectos');   // una pasiva con regeneración cambia los estados que se ven
  if(key === 'habilidades' && $('#scrim-todas-habilidades').classList.contains('open')) renderTodasHabilidades();
  if(['habilidades','inventario','mochila','equipo','cinturon','sociales'].includes(key) && $('#scrim-botonera').classList.contains('open')) renderBotonera();
}

