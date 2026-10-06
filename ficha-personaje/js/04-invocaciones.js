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
   INVOCACIONES — motor de stats, igual que los creeps de gm-tools: vive en comun/inv-calculo.js (paso 4, etapa 4e, tanda 1,
   2026-10-01), con la invocación como parámetro, así lo usa también el mapa. Acá quedan los nombres de siempre.
   ========================================================= */
const IT2_INV = InvCalculo.IT2_INV;
const ATTR_IDS_INV = InvCalculo.ATTR_IDS_INV;
const INV_STAT_EXCLUIR = InvCalculo.INV_STAT_EXCLUIR;
const INV_DERIVADOS_POR_ATTR = InvCalculo.INV_DERIVADOS_POR_ATTR;
const INV_STAT_ATTR = InvCalculo.INV_STAT_ATTR;
const INV_STATS_TIRADA_IDS = InvCalculo.INV_STATS_TIRADA_IDS;
const INV_STATS_HAB = InvCalculo.INV_STATS_HAB;
function invFuentesEquipo(inv){ return InvCalculo.fuentesEquipo(inv); }
function invModTotal(inv, statId){ return InvCalculo.modTotal(inv, statId); }
function aportesModInv(inv, statId){ return InvCalculo.aportesMod(inv, statId); }
function invEstadosArmadura(inv){ return InvCalculo.estadosArmadura(inv); }
function invAporteArmadura(inv, statId){ return InvCalculo.aporteArmadura(inv, statId); }
function invDefensaEfectiva(inv){ return InvCalculo.defensaEfectiva(inv); }
function invCritEfectivo(inv, i){ return InvCalculo.critEfectivo(inv, i); }
function invEstadoActivo(inv, flag){ return InvCalculo.estadoActivo(inv, flag); }
function invStatValor(inv, statId){ return InvCalculo.statValor(inv, statId); }
function invNitrosMax(inv){ return InvCalculo.nitrosMax(inv); }
function habInvAtaque(h){ return InvCalculo.habAtaque(h); }
function pesoArmaInv(inv){ return InvCalculo.pesoArma(inv); }
function defensaInv(inv){ return InvCalculo.defensa(inv); }
function bloqueoValorInv(inv){ return InvCalculo.bloqueoValor(inv); }
function costoAtaqueInv(inv){ return InvCalculo.costoAtaque(inv); }
function costoNitrosHabInv(inv, h){ return InvCalculo.costoNitrosHab(inv, h); }
function costoHabInvTxt(inv, h){ return InvCalculo.costoHabTxt(inv, h); }
function bloqueoHabInv(inv, h){ return InvCalculo.bloqueoHab(inv, h); }
function invDanoTxt(inv, extra){ return InvCalculo.danoTxt(inv, extra); }
function invAtaqueTxt(inv){ return InvCalculo.ataqueTxt(inv); }
function modsAfectanHpInv(mods){ return InvCalculo.modsAfectanHp(mods); }
function actualizarHpMaxPorConInv(inv){ return InvCalculo.actualizarHpMaxPorCon(inv); }
function migrarInvocacion(inv){ return InvCalculo.migrar(inv); }

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
    sinEspecial: true,   // las invocaciones todavía no usan armas especiales (ver docs/pendientes.md)
    stats: MOD_TARGETS.filter(s => !['sp','spregen','crgmax','capcinturon','capmochila','luz','veoculto'].includes(s.id)).map(s => ({id:s.id, label:s.label})),
    ejemplos: (tipoItem, t) => (S.catalogo || []).filter(it => ES_ARMA(it.tipoItem) && num(it.tipoDado) === t).map(it => it.nombre),
  };
}
function armaDeInvComoDraft(inv){
  return {
    nombre: inv.armaNombre || '', tipoItem: inv.armaManos || 'arma_1m', tipoDado: num(inv.armaTipo) || 8,
    peso: Math.max(1, num(inv.armaPeso) || 1), danoFijo: num(inv.armaFijo), danoAmplificado: num(inv.armaAmplificado),
    armaDeRango: !!inv.armaDeRango, mods: structuredClone(inv.armaMods || []), detalle: inv.armaDetalle || '',
    efectosGolpe: structuredClone(inv.armaEfectos || []), ...Combatiente.rasgosDeItem(Combatiente.armaDeCombatiente(inv)),
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
  inv.armaRasgos = Combatiente.rasgosDeItem(d); delete inv.armaEspalda; delete inv.armaIgnoraResistCrit;   // los rasgos del arma
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
  if(invPap && invPap.abierto()) invPap.redibujar();
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
/* El editor de una invocación, paso a paso en la ventana común (comun/paso-a-paso.js, 2026-10-02, tanda 6 de docs/plan-paso-a-paso.md):
   Qué es → Atributos → Arma → Defensa → Habilidades → Estados → Notas (→ Resumen al crear). Los campos se guardan al escribir (los mismos
   manejadores de siempre, js/06); al editar, Cancelar vuelve a como estaba al abrir y Guardar deja lo hecho; al crear, Cancelar la saca. */
let invPap = null;
function invEditando(){ return S.invocaciones.find(x => x.id === editandoInvId) || null; }
const INV_PASOS = [
  {id: 'que', nombre: 'Qué es', ayuda: '<b>¿Qué es?</b> El nombre, la imagen y cuántos turnos dura cada vez que se invoca (después se duerme y queda guardada para volver a invocarla).'},
  {id: 'atributos', nombre: 'Atributos', ayuda: '<b>Atributos.</b> Igual que un creep: Constitución da la vida (×5), Agilidad los No2; abajo se ven los secundarios que salen de cada uno.'},
  {id: 'arma', nombre: 'Arma', ayuda: '<b>¿Con qué pega?</b> El arma (o el arma natural) y lo que hace al golpear.'},
  {id: 'defensa', nombre: 'Defensa', ayuda: '<b>¿Cómo aguanta?</b> Su Defensa, la armadura que lleva y la resistencia a críticos de cada Tipo de arma.'},
  {id: 'habilidades', nombre: 'Habilidades', ayuda: '<b>Habilidades.</b> Cada una se arma en su propio paso a paso.'},
  {id: 'estados', nombre: 'Estados', ayuda: '<b>Estados alterados</b> que tiene ahora.'},
  {id: 'notas', nombre: 'Notas', ayuda: '<b>Notas.</b> Lo que haga falta recordar de esta invocación.'},
];
function invPasoHtml(id, inv){
  if(id === 'que') return `
    <div class="pap-campo"><label>Nombre</label><input data-invf="nombre" data-invid="${inv.id}" maxlength="60" value="${esc(inv.nombre)}"></div>
    <div class="pap-campo"><label>Imagen (opcional)</label><div class="pap-fila" style="align-items:center">
      ${inv.imagen ? `<img src="${inv.imagen}" alt="" style="width:64px;height:64px;object-fit:cover;border-radius:6px;border:2px solid ${esc(inv.color)}">` : ''}
      <button type="button" class="pap-boton" data-invimg="${inv.id}">${inv.imagen ? 'Cambiar imagen' : 'Elegir imagen'}</button>
      ${inv.imagen ? `<button type="button" class="pap-boton" data-invimgrm="${inv.id}">Quitar</button>` : ''}
      <input type="file" data-invimginput="${inv.id}" accept="image/*" hidden></div></div>
    <div class="pap-campo"><label>Cuántos turnos dura</label><input type="number" min="0" data-invf="cooldown" data-invid="${inv.id}" value="${inv.cooldown}" style="max-width:120px"></div>`;
  if(id === 'atributos') return `
    <div class="inv-row5">
      ${ATTR_IDS_INV.map(a => `<div class="inv-minif"><label>${esc(STAT_LABEL[a])}</label><input type="number" data-invattr="${a}" data-invid="${inv.id}" value="${num(inv[a])}"></div>`).join('')}
    </div>
    <div class="inv-derivgrid" style="margin-top:12px">
      ${ATTR_IDS_INV.map(a => `<div class="inv-derivcol"><span class="inv-derivattr">${esc(STAT_LABEL[a])}</span>${INV_DERIVADOS_POR_ATTR[a].map(d => `<div class="inv-deriv"><span>${esc(d.label)}</span><b>${fmt(invStatValor(inv, d.id))}</b></div>`).join('')}</div>`).join('')}
    </div>`;
  if(id === 'arma') return `
    <div class="inv-arma-compacta">
      <div class="inv-arma-top">
        <span class="inv-arma-nombre">${inv.armaNombre ? esc(inv.armaNombre) : '<span class="hint">Sin nombre</span>'}</span>
        <span class="inv-danopreview"><b>${esc(invDanoTxt(inv, invStatValor(inv,'dmg')))}</b></span>
        <button type="button" class="mini" data-editararmainv="${inv.id}">✎ Editar</button>
      </div>
      ${inv.armaDetalle ? `<div class="hint">${esc(inv.armaDetalle)}</div>` : ''}
      ${(inv.armaEfectos||[]).length ? `<div class="hint"><b>Al golpear:</b> ${esc(EfectosGolpe.resumenLista(inv.armaEfectos))}</div>` : ''}
      <label class="hint" style="display:flex;gap:6px;align-items:center;margin-top:4px" title="Un arma natural (garras, colmillos, puños…) no permite Parry ni Bloqueo, por ahora (regla del dueño, 2026-09-30)."><input type="checkbox" data-invf="armaNatural" data-invid="${inv.id}" style="width:auto"${inv.armaNatural ? ' checked' : ''}> Es un arma natural (garras, colmillos…): sin Parry ni Bloqueo</label>
    </div>`;
  if(id === 'defensa') return `
    <div class="inv-row3">
      <div class="inv-minif"><label>Defensa</label><input type="number" data-invf="defensa" data-invid="${inv.id}" value="${inv.defensa}"></div>
      <div></div><div></div>
    </div>
    <div class="inv-editar-separador" style="margin-top:12px"><span>Armadura</span></div>
    <div class="inv-equipo-list">
      ${inv.equipo.length ? inv.equipo.map(it => `
      <div class="inv-equipo-item">
        <span class="inv-equipo-nombre">${esc(it.nombre)}</span>
        <span class="hint">+${fmt(num(it.def))} DEF</span>
        <button type="button" class="inv-rm" data-quitarequipoinv="${inv.id}:${it.id}" title="Quitar">×</button>
      </div>`).join('') : `<div class="hint">Sin armadura.</div>`}
    </div>
    <button type="button" class="inv-addhab" data-additeminv="${inv.id}" style="margin-top:6px">+ Ítem</button>
    <div class="inv-editar-separador" style="margin-top:12px"><span>Resistencia a críticos</span></div>
    <div class="inv-critgrid">
      ${['Tipo 4','Tipo 6','Tipo 8','Tipo 10','Tipo 12'].map((lbl,i) => `<div class="inv-critcell"><label>${lbl}</label><input type="number" data-invcrit="${i}" data-invid="${inv.id}" value="${inv.crit[i]}"></div>`).join('')}
    </div>`;
  if(id === 'habilidades') return `
    <div class="inv-hablist">
      ${inv.habilidades.length ? inv.habilidades.map(h => invHabHtml(inv, h)).join('') : '<div class="hint">Sin habilidades.</div>'}
    </div>
    <button type="button" class="inv-addhab" data-addhabinv="${inv.id}" style="margin-top:6px">+ Habilidad</button>`;
  if(id === 'estados') return `
    <div class="inv-hablist">
      ${(inv.estados||[]).length ? inv.estados.map(es => invEstadoChipHtml(inv, es)).join('') : '<div class="hint">Sin estados activos.</div>'}
    </div>
    <button type="button" class="inv-addhab" data-addestadoinv="${inv.id}" style="margin-top:6px">+ Estado</button>`;
  if(id === 'notas') return `<textarea class="inv-notas" data-invf="notas" data-invid="${inv.id}" placeholder="Lo que haga falta recordar de esta invocación." style="min-height:120px">${esc(inv.notas)}</textarea>`;
  // Resumen (al crear)
  const fila = (t, v) => `<div class="resumen-fila"><span>${t}</span><b>${v}</b></div>`;
  return `<div class="resumen-hab">${fila('Nombre', esc(inv.nombre || '—'))}${fila('Dura', `${fmt(num(inv.cooldown))} turno(s)`)}${fila('Vida', fmt(num(inv.hpMax)))}${fila('No2', fmt(invNitrosMax(inv)))}
    ${fila('Ataque', esc(invDanoTxt(inv, invStatValor(inv, 'dmg'))))}${fila('Defensa', fmt(invDefensaEfectiva(inv)))}${fila('Habilidades', inv.habilidades.length ? esc(inv.habilidades.map(h => h.nombre).join(', ')) : '—')}</div>`;
}
function abrirEditarInv(invId, o){
  const inv = S.invocaciones.find(x => x.id === invId);
  if(!inv) return;
  if(invPap) cerrarEditarInv();
  const nueva = !!(o && o.nueva);
  editandoInvId = invId;
  const antes = structuredClone(inv), inicial = JSON.stringify(inv);
  const descartar = () => {
    const i = S.invocaciones.findIndex(x => x.id === invId);
    if(nueva){ if(i >= 0) S.invocaciones.splice(i, 1); }
    else if(i >= 0) S.invocaciones[i] = antes;
    editandoInvId = null; invPap = null;
    renderInvocaciones();
  };
  invPap = PasoAPaso.abrir({
    titulo: () => nueva ? 'Invocación nueva' : `Editar invocación · ${(invEditando() || inv).nombre}`, crear: nueva, z: 52,
    textoCrear: '✔ Crear la invocación',
    pasos: () => (nueva ? INV_PASOS.concat([{id: 'resumen', nombre: 'Resumen', ayuda: '<b>Así queda.</b> Después se usa con ▶ Usar, desde su tarjeta o desde el mapa.'}]) : INV_PASOS)
      .map(p => ({...p, html: () => { const x = invEditando(); return x ? invPasoHtml(p.id, x) : ''; },
        alMontar: (c, a) => { if(p.id === 'que'){ const n = a.raiz.querySelector('[data-invf="nombre"]'); if(n) setTimeout(() => { n.focus(); if(nueva) n.select(); }, 30); } }})),
    alTecla: e => {
      if(e.key !== 'Enter' || e.target.tagName !== 'INPUT') return;
      e.preventDefault();
      e.target.dispatchEvent(new Event('change', {bubbles: true}));
      const n = invPap.paso();
      if(n < (nueva ? INV_PASOS.length : INV_PASOS.length - 1)) invPap.irA(n + 1);
    },
    confirmarCancelar: () => { const x = invEditando(); return x && JSON.stringify(x) !== inicial ? (nueva ? '¿Cancelar? La invocación que estás armando se descarta.' : '¿Descartar los cambios de esta invocación?') : ''; },
    alCancelar: () => descartar(),
    alGuardar: () => { editandoInvId = null; invPap = null; renderInvocaciones(); },
    alCrear: () => { const x = invEditando(); editandoInvId = null; invPap = null; renderInvocaciones(); if(x) toast(`${x.nombre} lista: se usa con ▶ Usar`); },
  });
}
function cerrarEditarInv(){
  editandoInvId = null;
  if(invPap){ const v = invPap; invPap = null; v.cerrar(); }
}
// Al tipear un atributo no se redibuja todo el editor (se perdería el foco): solo se refrescan los secundarios.
function actualizarDerivInvEnDOM(inv){
  const body = invPap && invPap.abierto() ? invPap.raiz : null;
  if(!body) return;
  body.querySelectorAll('.inv-derivcol').forEach((col, idx) => {
    const a = ATTR_IDS_INV[idx];
    if(!a) return;
    const bs = col.querySelectorAll('.inv-deriv b');
    INV_DERIVADOS_POR_ATTR[a].forEach((d, i) => { if(bs[i]) bs[i].textContent = fmt(invStatValor(inv, d.id)); });
  });
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
function renderBotoneraInv(){   // el dibujo vive en comun/inv-botonera.js (paso 4, etapa 4e, tanda 2): lo usa también el mapa
  const inv = S.invocaciones.find(x => x.id === botoneraInvId);
  if(!inv) return;
  const r = InvBotonera.html(inv, {parryPendiente: parryPendienteInv.has(inv.id)});
  $('#botonerainv-titulo').textContent = r.titulo;
  $('#botonerainv-badge').textContent = r.badge;
  $('#botonerainv-body').innerHTML = r.html;
}

function verHabInv(invId, habId){
  const inv = S.invocaciones.find(x => x.id === invId);
  const h = inv && inv.habilidades.find(x => x.id === habId);
  if(!inv || !h) return;
  const v = InvLupa.verHab(inv, h);   // comun/inv-lupa.js
  $('#verhabinv-nombre').textContent = v.titulo;
  $('#verhabinv-body').innerHTML = v.html;
  $('#scrim-verhabinv').classList.add('open');
}

/* ---------- Ejecutar las acciones de una invocación: mismos costos y
   mecánica que un creep, publicado en la Mesa a su propio nombre
   ("Invocación · Acción", igual que gm-tools arma "Creep · Acción"). ---------- */
// La misma tirada que el personaje y los creeps (comun/combatiente.js): con Afortunado también tira dos veces (P100).
function tirarValorStatInv(inv, nombre, valor, statId){ publicarTiradaInv(InvAcciones.tirada(inv, nombre, valor, statId)); }   // comun/inv-acciones.js (4e, tanda 3)
function publicarTiradaInv(t){
  if(!t) return;
  if(t.error){ toast(t.error); return; }
  registrarTirada(t.origen, t.r);
}
// Atacar con una invocación: igual que el personaje, primero se elige el token al que ataca (duelo, comun/duelo.js).
// Primero «¿Qué ataque es?» (normal / oportunidad / contraataque, 2026-10-03: igual que personajes y creeps), en el mismo cartel del personaje.
function invAtacar(invId){
  const inv = S.invocaciones.find(x => x.id === invId);
  if(!inv) return;
  $('#tipo-ataque-lista').innerHTML = InvAcciones.menuTipoAtaque(inv, 'data-invtipoataque');
  $('#scrim-tipo-ataque').classList.add('open');
}
$('#tipo-ataque-lista').addEventListener('click', e => {
  const b = e.target.closest('[data-invtipoataque]');
  if(!b) return;
  const [tipo, invId] = b.dataset.invtipoataque.split(':');
  $('#scrim-tipo-ataque').classList.remove('open');
  invAtacarCon(invId, tipo);
});
function invAtacarCon(invId, tipo){
  const inv = S.invocaciones.find(x => x.id === invId);
  if(!inv) return;
  if(typeof Duelo !== 'undefined' && Duelo.disponible() && fichaVivo && fichaVivo.id && !fichaVivo.soloLectura && !fichaVivo.editaGM){
    Duelo.elegirObjetivo({yo: {ref: fichaVivo.id + '~' + inv.id, tipo: 'pj', nombre: inv.nombre},
      ataque: InvAcciones.ataqueDuelo(inv, tipo), suelto: () => invAtacarSuelto(invId, tipo)});
  }else invAtacarSuelto(invId, tipo);
}
function invAtacarSuelto(invId, tipo){
  tipo = tipo || 'normal';
  const inv = S.invocaciones.find(x => x.id === invId);
  if(!inv) return;
  const qs = Combatiente.preguntaSentado(inv.estados, inv.nombre);   // Sentado no puede atacar: avisa y deja seguir
  if(qs && !confirm(qs)) return;
  // Sin No2 suficientes: «¿Atacar igual?» (B-7, como los creeps): gasta los que tenga y deja la línea roja.
  const forzar = InvAcciones.faltanNitros(inv, tipo);
  if(forzar && !confirm(InvAcciones.preguntaSinNitros(inv, tipo))) return;
  const p = InvAcciones.pagarAtaque(inv, forzar, tipo);   // comun/inv-acciones.js
  if(p.error){ toast(p.error); return; }
  InvAcciones.alertaSinNitros(inv, p.forzado, tipo);
  if(tipo === 'normal') parryPendienteInv.delete(inv.id);   // atacar cierra el Parry que esperaba su Bloqueo
  renderInvocaciones();
  publicarTiradaInv(InvAcciones.tiradaAtaque(inv, tipo));
  toast(p.aviso);
}
// Levantarse y Soltarse de una invocación (2026-10-03, comun/inv-acciones.js): las mismas reglas que el personaje y los creeps.
function invLevantarse(invId){
  const inv = S.invocaciones.find(x => x.id === invId);
  const x = inv && InvAcciones.levantarse(inv);
  if(!x) return;
  if(x.error){ toast(x.error); return; }
  renderInvocaciones();
  toast(x.aviso);
}
function invSoltarse(invId){
  const inv = S.invocaciones.find(x => x.id === invId);
  const t = inv && InvAcciones.tiradaSoltarse(inv);
  if(!t) return;
  if(num(inv.nitros) < t.s.no2){ toast(`${inv.nombre}: no le alcanzan los No2 — soltarse cuesta ${t.s.no2}`); return; }
  publicarTiradaInv({origen: t.origen, r: t.r});
  const x = InvAcciones.aplicarSoltarse(inv, t);
  renderInvocaciones();
  toast(x.error || x.aviso);
}
function invDanio(invId, sinEfectos, mods){   // sinEfectos: el duelo resuelve los efectos del golpe por su cuenta; mods: lo que suma un ataque con arreglos
  const inv = S.invocaciones.find(x => x.id === invId);
  if(!inv) return;
  const t = InvAcciones.dano(inv, mods);   // comun/inv-acciones.js
  if(!t) return;
  registrarTirada(t.origen, t.r);
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
  const p = InvAcciones.tirarStat(inv, statId, {...(o || {}), parryPendiente: parryPendienteInv.has(inv.id)});   // comun/inv-acciones.js
  if(p.error){ toast(p.error); return; }
  if(p.parry === 'sacar') parryPendienteInv.delete(inv.id);
  if(p.parry === 'poner') parryPendienteInv.add(inv.id);
  if(p.parry) renderInvocaciones();
  if(p.aviso) toast(p.aviso);
  publicarTiradaInv(p.tirada);
}
function habilidadInvTira(h){ return InvHabilidades.tira(h); }   // comun/inv-habilidades.js (4e, tanda 5)
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
function anunciarHabilidadInv(inv, h){ InvHabilidades.anunciar(inv, h, invHabUi); }
// Igual que en el personaje (tirarPrimeraDeHab): al ejecutar se tira solo la primera; la fórmula, si hay stat, va con el botón 🎲.
function tirarExtraDeHabInv(inv, h){
  const t = InvHabilidades.tiradaPrimera(inv, h);
  if(!t) return false;
  publicarTiradaInv(t);
  return true;
}
function tirarSegundaDeHabInv(invId, habId){
  const inv = S.invocaciones.find(x => x.id === invId);
  const h = inv && inv.habilidades.find(x => x.id === habId);
  if(!h) return;
  publicarTiradaInv(InvHabilidades.tiradaSegunda(inv, h));
}
const botonSegundaHabInv = (inv, h) => InvBotonera.botonSegundaHab(inv, h);   // comun/inv-botonera.js
// Tres modos (2026-09-30): 📣 manual solo anuncia; 💰 semi cobra No2 y cooldown y tira la primera; ✨ auto abre la Ejecución
// paso a paso a nombre de la invocación (ref `fichaId~invId`, como su ataque), o aplica directo si es solo sobre ella y sin tiradas.
function alcanceDeHabInv(inv, c, statTira){ return InvHabilidades.alcanceHab(inv, c, statTira); }   // comun/combatiente.js
// La Ejecución de una invocación: la misma regla que el personaje y el creep (comun/combatiente.js, habEjecucion). Las
// invocaciones no tienen costo variable, así que ninguna «X» se toca.
function habDueloInv(inv, h){ return InvHabilidades.habEjecucion(inv, h); }
// «Ataque con mi arma, con arreglos» de una invocación (2026-09-30, P134): el mismo armado que el personaje y el creep
// (comun/combatiente.js, ataqueConArreglos), con el arma de la invocación y su alcance (o el que diga la habilidad).
function ataqueDeHabInv(inv, h){ return InvHabilidades.ataqueDeHab(inv, h); }
// El PdG del ataque con arreglos, con lo que le suma la habilidad (los No2 ya los cobró la habilidad).
function tirarPdgDeArreglosInv(inv, atq){ publicarTiradaInv(InvHabilidades.tiradaPdgArreglos(inv, atq)); }
// Se anuncia y va al cuadro del duelo como un ataque de la invocación; sin duelo, se tira el PdG suelto.
function lanzarAtaqueDeHabInv(inv, h){ InvHabilidades.lanzarAtaque(inv, h, invHabUi); }
// ⚡ Flash de una invocación (igual que un creep, P135/P136): cooldown y vida — el doble en turno ajeno —, nunca No2.
const costoFlashInv = h => InvDuelo.costoFlash(h);   // comun/inv-duelo.js (4e, tanda 4)
function pagarFlashInv(inv, h){ return InvDuelo.pagarFlash(inv, h, dueloInvUi); }   // comun/inv-duelo.js; dueloInvUi en js/11
function usarFlashFueraDelDueloInv(inv, h){ return InvHabilidades.usarFlashFuera(inv, h, invHabUi); }
// Pone un estado en la invocación con la regla común (inmunidades, acumulación y renovación: comun/combatiente.js,
// agregarEstado — antes se sumaba directo y duplicaba). Devuelve el texto para la Mesa.
function ponerEstadoEnInv(inv, d){ return InvHabilidades.ponerEstado(inv, d); }
// Un efecto del cuadro de Ejecución sobre la propia invocación: cura, o el estado armado igual que uno recibido (el preset
// con lo que traiga la habilidad encima, o uno propio).
function aplicarSpecAInv(inv, ef){ return InvHabilidades.aplicarSpec(inv, ef, EFECTOS_PRESET); }
// Lo que la ficha hace después de ejecutar una habilidad de invocación (comun/inv-habilidades.js): publicar a su nombre, redibujar,
// el duelo a nombre de la invocación (ref `fichaId~invId`, como su ataque).
const invDueloDisponible = () => !!(typeof Duelo !== 'undefined' && Duelo.disponible() && fichaVivo && fichaVivo.id && !fichaVivo.soloLectura && !fichaVivo.editaGM);
const invHabUi = {
  mesaHabilidad: (inv, nombre, detalle) => mesaPublicarHabilidadInv(inv, nombre, detalle),
  mesaConTexto: t => mesaConTexto(t),
  publicar: t => publicarTiradaInv(t),
  toast: t => toast(t),
  cambio: () => renderInvocaciones(),
  cambiar: fn => { if(fn() !== false) renderInvocaciones(); },
  parry: parryPendienteInv,
  dueloDisponible: () => invDueloDisponible(),
  elegirObjetivo: (inv, cfg) => Duelo.elegirObjetivo({yo: {ref: fichaVivo.id + '~' + inv.id, tipo: 'pj', nombre: inv.nombre}, ...cfg}),
  // 4f (P134): zona persistente y trampa — el mismo camino que el personaje, a nombre de «fichaId~invId».
  enMapa: () => window.parent !== window,
  ref: inv => fichaVivo && fichaVivo.id ? fichaVivo.id + '~' + inv.id : '',
  colocarZona: msg => { try{ MensajesMapa.alMapa(msg.tipo, msg); return true; }catch(err){ console.error('No se pudo avisar la zona al mapa:', err); return false; } },
  colocarTrampa: (inv, h) => FichaAcciones.colocarTrampaDeHab(S, h, {yo: () => ({ref: invHabUi.ref(inv)}), enMapa: invHabUi.enMapa, valorStat: st => InvCalculo.statValor(inv, st),
    alMapa: (tipo, msg) => MensajesMapa.alMapa(tipo, msg), mesaHabilidad: (nombre, detalle) => mesaPublicarHabilidadInv(inv, nombre, detalle), toast: t => toast(t)}),
};
function invEjecutarHab(invId, habId){
  const inv = S.invocaciones.find(x => x.id === invId);
  const h = inv && inv.habilidades.find(x => x.id === habId);
  if(!inv || !h) return;
  const p = InvHabilidades.ejecutar(inv, h, EFECTOS_PRESET, invDueloDisponible());   // comun/inv-habilidades.js
  if(p.modo === 'manual'){ mesaPublicarHabilidadInv(inv, h.nombre, h.detalle || h.efectoDetalle || ''); toast(`${h.nombre || 'Habilidad'} anunciada`); return; }
  if(p.modo === 'flash'){ usarFlashFueraDelDueloInv(inv, h); return; }
  if(p.error){ toast(p.error); return; }
  InvHabilidades.terminar(inv, h, p, invHabUi);
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
  {corto: '🪤 Trampa', titulo: '¿Coloca una trampa en el mapa?',
   ayuda: 'Opcional. Al ejecutarla, la trampa queda en el mapa: en ✨ automática se elige la casilla con un clic; si no, queda al lado de la invocación. La ven solo los de su bando hasta que alguien la pisa.'},
];
// Pasos visibles según el modo (índices de PASOS_HAB_INV / data-hi-paso). El estado sobre la invocación (sistema anterior)
// aparece en semi y en auto solo si ya lo tenía.
function hiOrden(){
  const m = editingHabInv && editingHabInv.modo, conEstado = !!$('#hi-efecto-nombre').value.trim();
  if(m === 'semi') return [6, 0, 1, 2, 3, 8, ...(conEstado ? [4] : []), 5];   // 8: 🪤 Trampa (paso 4, etapa 4f)
  if(m === 'auto') return [6, 0, 1, 7, 8, ...(conEstado ? [4] : []), 5];
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
      if(e.pap) e.pap.redibujar();
    }});
}

let editingHabInv = null;   // {invId, habId, modo, duelo, pap}: pap = la ventana común (comun/paso-a-paso.js)
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

// `n` es la posición dentro de los pasos visibles (hiOrden), no el índice de PASOS_HAB_INV. Lo que todavía no se puede lo avisa la
// ventana común (puedeIr).
function hiMostrarPaso(n){ if(editingHabInv && editingHabInv.pap) editingHabInv.pap.irA(n); }
// El paso `idx` (índice de PASOS_HAB_INV) para la ventana común: su bloque de ficha.html, tal cual (conserva lo escrito).
function hiPasoVentana(idx){
  const P = PASOS_HAB_INV[idx], bloque = document.querySelector(`.hi-paso[data-hi-paso="${idx}"]`);
  return {id: String(idx), nombre: P.corto, ayuda: `<b>${P.titulo}</b> ${P.ayuda}`, html: () => {
    if(idx === 6) hiModosRender();
    if(idx === 7) hiEjecucionRender();
    if(idx === 8) hiTrampaRender();
    if(idx === 5) $('#hi-resumen').innerHTML = hiResumenHtml();
    bloque.hidden = false;
    return bloque;
  }, alMontar: () => {
    const primero = bloque.querySelector('input:not([type=hidden]):not([type=checkbox]),select,textarea');
    if(primero) setTimeout(() => primero.focus(), 30);
  }};
}
function cerrarEditorHabInv(){
  const e = editingHabInv;
  editingHabInv = null;
  if(e && e.pap) e.pap.cerrar();
}
function hiDatosPantalla(){
  return ['hi-nombre', 'hi-detalle', 'hi-nitros-modo', 'hi-acciones', 'hi-cd', 'hi-hpcosto', 'hi-tirada', 'hi-tirada-stat', 'hi-efecto-nombre', 'hi-efecto-turnos', 'hi-efecto-hpturno', 'hi-efecto-detalle']
    .map(id => $('#' + id).value).concat([$('#hi-efecto-permanente').checked, $('#hi-trampa-on').checked]);
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
    ${fila('Estado', estado ? `${estado}${turnos ? ` (${fmt(turnos)} turnos)` : ''}` : 'ninguno')}
    ${fila('🪤 Trampa', hiTrampaResumen())}`;
}
/* ---------- 🪤 La trampa que coloca una habilidad de invocación (paso 4, etapa 4f, 2026-10-02, P134): el mismo asistente y la misma
   forma de trampa que las habilidades del personaje y de los creeps (comun/asistente-trampa.js, P123). ---------- */
let hiTrampa = null;
const hiTrampaArmada = () => !!(hiTrampa && (String(hiTrampa.nombre || '').trim() || hiTrampa.dano));
function hiTrampaResumen(){
  if(!$('#hi-trampa-on').checked || !hiTrampa) return 'no coloca';
  return AsistenteTrampa.resumenTexto(hiTrampa);
}
function hiTrampaRender(){
  const on = $('#hi-trampa-on').checked;
  const nom = hiTrampa ? String(hiTrampa.nombre || '').trim() : '';
  $('#hi-trampa-resumen').innerHTML = on
    ? `<div class="hint" style="margin-bottom:8px"><b>${esc(nom || $('#hi-nombre').value.trim() || 'Sin nombre')}</b><br>${esc(hiTrampaResumen())}</div>
      <div style="display:flex;gap:8px"><button type="button" class="btn" id="hi-trampa-elegir" style="flex:1">🪤 Elegir otra trampa</button>
      <button type="button" class="btn primary" id="hi-trampa-asistente" style="flex:1">🪄 Ajustar todo, paso a paso</button></div>`
    : '';
  $('#hi-trampa-ayuda').textContent = on
    ? 'Al ejecutarla se coloca la trampa (y la habilidad se anuncia como siempre, sin decir dónde quedó).'
    : 'Sin trampa: la habilidad no coloca nada en el mapa.';
}
function hiAbrirAsistenteTrampa(){
  AsistenteTrampa.abrir({
    contexto: 'habilidad', editando: false, estados: trampaEstadosLista(), inicial: AsistenteTrampa.inicialDe(hiTrampa || {}),
    alTerminar: res => { hiTrampa = AsistenteTrampa.aTrampa(res); $('#hi-trampa-on').checked = true; hiTrampaRender(); },
    alCancelar: () => { if(!hiTrampaArmada()){ $('#hi-trampa-on').checked = false; hiTrampaRender(); } },
  });
}
// Al tildar la trampa (o «Elegir otra trampa»): el menú común — una conocida por tipo, de cero (comun/elegir-trampa.js).
function hiElegirTrampa(){
  ElegirTrampa.abrir({inicial: hiTrampa,
    alTerminar: t => { hiTrampa = t; $('#hi-trampa-on').checked = true; hiTrampaRender(); },
    alCancelar: () => { if(!hiTrampaArmada()){ $('#hi-trampa-on').checked = false; hiTrampaRender(); } }});
}
document.addEventListener('change', e => { if(e.target && e.target.id === 'hi-trampa-on'){ hiTrampaRender(); if(e.target.checked && !hiTrampaArmada()) hiElegirTrampa(); } });
document.addEventListener('click', e => {
  if(!e.target || !e.target.closest) return;
  if(e.target.closest('#hi-trampa-asistente')) hiAbrirAsistenteTrampa();
  else if(e.target.closest('#hi-trampa-elegir')) hiElegirTrampa();
});

function abrirEditorHabInv(invId, habId){
  const inv = S.invocaciones.find(x => x.id === invId);
  if(!inv) return;
  const h = habId ? inv.habilidades.find(x => x.id === habId) : {};
  if(!h) return;
  cerrarEditorHabInv();
  editingHabInv = {invId, habId: habId || null, modo: habId ? modoHab(h) : null, duelo: h.duelo && typeof h.duelo === 'object' ? structuredClone(h.duelo) : null};
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
  $('#hi-efecto-permanente').checked = Combatiente.efectoPermanente(h, presetPorNombre(EFECTOS_PRESET, (h.efectoNombre || '').trim()));   // P137
  $('#hi-efecto-polaridad').value = h.efectoPolaridad || 'otro';
  $('#hi-efecto-mods').value = JSON.stringify(h.efectoMods || []);
  hiTrampa = h.trampaColocar ? Plantillas.trampaDesde(h.trampaColocar) : null;   // 4f: la trampa que coloca (las viejas se traducen solas)
  $('#hi-trampa-on').checked = !!hiTrampa;
  hiAplicarModoNitros();
  const e = editingHabInv, inicial = JSON.stringify(hiDatosPantalla());
  e.pap = PasoAPaso.abrir({
    titulo: habId ? `Editar habilidad · ${inv.nombre}` : `Nueva habilidad · ${inv.nombre}`, crear: !habId, z: 55,
    pasos: () => hiOrden().map(hiPasoVentana),
    puedeIr: i => i > 0 && e.modo === null ? 'Primero elegí cómo se ejecuta' : i > 1 && !$('#hi-nombre').value.trim() ? 'Primero ponele un nombre' : '',
    alClic: ev => { const b = ev.target.closest('[data-hi-modo]'); if(b && editingHabInv === e){ e.modo = b.dataset.hiModo; e.pap.redibujar(); } },
    alTecla: ev => {
      if(ev.key !== 'Enter' || !ev.target.matches('[data-hi-enter]')) return;
      ev.preventDefault();
      if(e.pap.paso() < hiOrden().length - 1) hiMostrarPaso(e.pap.paso() + 1);
    },
    confirmarCancelar: () => JSON.stringify(hiDatosPantalla()) === inicial && e.modo === (habId ? modoHab(h) : null) ? ''
      : (habId ? '¿Descartar los cambios de esta habilidad?' : '¿Cancelar? La habilidad que estás armando se descarta.'),
    alGuardar: () => guardarEditorHabInv(), alCrear: () => guardarEditorHabInv(),
    alCancelar: () => { if(editingHabInv === e) editingHabInv = null; },
  });
}

function guardarEditorHabInv(){
  if(!editingHabInv) return;
  const inv = S.invocaciones.find(x => x.id === editingHabInv.invId);
  if(!inv){ editingHabInv = null; return; }
  let h = editingHabInv.habId ? inv.habilidades.find(x => x.id === editingHabInv.habId) : null;
  if(editingHabInv.habId && !h){ editingHabInv = null; return; }
  if(!$('#hi-nombre').value.trim()){ hiMostrarPaso(1); if(editingHabInv.pap) editingHabInv.pap.aviso('Ponele un nombre antes de guardarla'); return false; }
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
  if($('#hi-trampa-on').checked && hiTrampa) h.trampaColocar = {...structuredClone(hiTrampa), nombre: String(hiTrampa.nombre || '').trim().slice(0, 40) || h.nombre};
  else delete h.trampaColocar;
  cerrarEditorHabInv();
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
$('#hi-ejecucion-abrir').onclick = hiAbrirEjecucion;
document.querySelectorAll('[data-hi-nitros-modo]').forEach(b => b.onclick = () => {
  $('#hi-nitros-modo').value = b.dataset.hiNitrosModo;
  hiAplicarModoNitros();
});
$('#hi-tirada-stat').addEventListener('change', () => { editingHabInvPdgAuto = false; });
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
  if(editingHabInv && editingHabInv.pap) editingHabInv.pap.redibujar();   // con estado, el paso Estado ya cuenta en las pestañas
});
$('#hi-efecto-nombre').addEventListener('change', () => { if(editingHabInv && editingHabInv.pap) editingHabInv.pap.redibujar(); });
$('#botonerainv-x').onclick = () => { botoneraInvId = null; $('#scrim-botonera-inv').classList.remove('open'); };
$('#scrim-botonera-inv').addEventListener('mousedown', e => { if(e.target.id==='scrim-botonera-inv'){ botoneraInvId = null; $('#scrim-botonera-inv').classList.remove('open'); } });
$('#verhabinv-x').onclick = () => $('#scrim-verhabinv').classList.remove('open');
$('#scrim-verhabinv').addEventListener('mousedown', e => { if(e.target.id==='scrim-verhabinv') $('#scrim-verhabinv').classList.remove('open'); });

const defValorDe = i => FichaEquipo.defValor(i);   // comun/ficha-equipo.js

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
          ${(contexto === 'mochila') ? Intercambio.botonDar(i) + Intercambio.botonDespojos(i) : ''}
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
          ${Intercambio.botonDar(i)}<button class="mini" data-tomochila="${i.id}" title="Devolver esta unidad a la mochila">← Mochila</button>
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

