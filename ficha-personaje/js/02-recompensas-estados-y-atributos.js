// js/02-recompensas-estados-y-atributos.js — tramo 2 de 14 del script de ficha.html (paso 5, nivel A: mismo código, en el mismo orden).
/* ---------- Recompensas del combate (XP y DDE) ----------
   El GM las publica en campanas/<id>/recompensas (una por personaje); la ficha las aplica UNA sola vez (transacción
   sobre el documento) apenas está abierta y editable, y avisa con un pop-up si sube de nivel. */
let recompensasPendientes = [], recompensasAplicando = false;
function recompensasEscuchar(){
  if(!fbUsuario) return;
  // El GM escucha todas las pendientes: si toma el control de un personaje, le toca aplicarle las suyas (🎮, 2026-09-30).
  const col = fbDb.collection(fbRutaCampana('recompensas'));
  (fbMiembro && fbMiembro.gm ? col.where('aplicada', '==', false) : col.where('duenoUid', '==', fbUsuario.uid).where('aplicada', '==', false)).onSnapshot(snap => {
    recompensasPendientes = snap.docs;
    recompensasRevisar();
  }, err => console.error('Error escuchando las recompensas:', err));
}
// Trampas consumibles que no se dispararon: vuelven a la MOCHILA (se apilan con las iguales, que no ocupan ranura nueva) y, si la mochila no tiene lugar, al CINTURÓN.
// Si tampoco hay lugar allá, se dejan en la mochila igual (que quede de más) antes que perderlas.
function devolverTrampasAlJugador(items){
  let aMochila = 0, aCinturon = 0;
  items.forEach(js => {
    let it = null;
    try{ it = JSON.parse(js); }catch(e){}
    if(!it) return;
    const pila = S.inventario.find(x => !x.equipado && x.consumible && x.nombre === it.nombre);
    if(pila){ pila.unidades = num(pila.unidades) + 1; aMochila++; return; }
    const cap = capMochilaEfectivo();
    if(!(cap > 0) || mochilaUsada() + ranurasDe(it) <= cap){ agregarConsumibleAInventario(it, 1); aMochila++; return; }
    const pilaC = S.cinturon.find(x => x.consumible && x.nombre === it.nombre);
    if(pilaC){ pilaC.unidades = num(pilaC.unidades) + 1; aCinturon++; return; }
    if(S.cinturon.length < capCinturonEfectivo()){
      const c = structuredClone(it); c.id = uid(); c.unidades = 1; c.ranuras = 1; c.equipado = false;
      S.cinturon.push(c); aCinturon++; return;
    }
    agregarConsumibleAInventario(it, 1); aMochila++;   // sin lugar en ningún lado: mejor de más que perdida
  });
  renderInventario(); renderList('cinturon');
  return {total: aMochila + aCinturon, aMochila, aCinturon};
}
async function recompensasRevisar(){
  const f = fichaVivo;
  if(!f || !f.cargada || f.soloLectura || f.editaGM || recompensasAplicando) return;
  const mias = recompensasPendientes.filter(d => d.data().fichaId === f.id);
  if(!mias.length) return;
  recompensasAplicando = true;
  try{
    for(const d of mias){
      const tomada = await fbDb.runTransaction(async tx => {
        const x = await tx.get(d.ref);
        if(!x.exists || x.data().aplicada) return false;
        // El GM con el control no puede marcarla como aplicada (las reglas se lo dejan al dueño), pero sí borrarla: mismo efecto.
        if(fichaControloYo(f)) tx.delete(d.ref); else tx.update(d.ref, {aplicada: true});
        return true;
      });
      if(!tomada || fichaVivo !== f) continue;
      const r = d.data();
      const nivelAntes = num(S.meta.nivel);
      if(num(r.xp) > 0) applyExp(num(S.meta.exp) + num(r.xp));
      if(num(r.dde) > 0){ S.meta.dde = Math.round((num(S.meta.dde) + num(r.dde)) * 100) / 100; $('#f-dde').value = fmt(S.meta.dde); }
      if(num(r.despojos) > 0){ S.loot.normal = num(S.loot.normal) + num(r.despojos); $('#f-loot-normal').value = S.loot.normal; }
      let vueltas = null;
      if(Array.isArray(r.devolver) && r.devolver.length) vueltas = devolverTrampasAlJugador(r.devolver);
      refresh();
      const partes = [];
      if(num(r.xp) > 0) partes.push(`+${fmt(num(r.xp))} XP`);
      if(num(r.dde) > 0) partes.push(`+${fmt(num(r.dde))} DDE`);
      if(num(r.despojos) > 0) partes.push(`+${fmt(num(r.despojos))} despojos`);
      if(partes.length) toast(`🎁 ${partes.join(' · ')}`);
      if(vueltas && vueltas.total) toast(`🪤 ${vueltas.total} trampa${vueltas.total === 1 ? '' : 's'} sin disparar ${vueltas.total === 1 ? 'se desarmó' : 'se desarmaron'} y volvió${vueltas.total === 1 ? '' : 'eron'} ${vueltas.aCinturon ? (vueltas.aMochila ? 'a tu mochila y al cinturón' : 'a tu cinturón') : 'a tu mochila'}`);
    }
  }catch(err){
    console.error('No se pudieron aplicar las recompensas:', err);
  }finally{
    recompensasAplicando = false;
  }
}

/* ---------- Estados que te dejan otros (una habilidad de un creep, una trampa) ----------
   El GM o el mapa dejan un aviso en campanas/<id>/estados; la ficha lo aplica UNA sola vez (transacción sobre el documento) apenas
   está abierta y editable, respetando Invulnerable, Inmunidad a CC, Sangre pura y Coagulación extrema (comun/estados-aplicar.js). */
let estadosPendientes = [], estadosAplicando = false;
function estadosEscuchar(){
  if(!fbUsuario) return;
  // El GM escucha todos los pendientes: si toma el control de un personaje, le toca aplicarle los suyos (🎮, 2026-09-30).
  const col = fbDb.collection(fbRutaCampana('estados'));
  (fbMiembro && fbMiembro.gm ? col.where('aplicada', '==', false) : col.where('duenoUid', '==', fbUsuario.uid).where('aplicada', '==', false)).onSnapshot(snap => {
    estadosPendientes = snap.docs;
    estadosRevisar();
  }, err => console.error('Error escuchando los estados recibidos:', err));
}
async function estadosRevisar(){
  const f = fichaVivo;
  if(!f || !f.cargada || f.soloLectura || f.editaGM || estadosAplicando) return;
  const mios = estadosPendientes.filter(d => d.data().fichaId === f.id);
  if(!mios.length) return;
  estadosAplicando = true;
  try{
    for(const d of mios){
      const tomada = await fbDb.runTransaction(async tx => {
        const x = await tx.get(d.ref);
        if(!x.exists || x.data().aplicada) return false;
        if(fichaControloYo(f)) tx.delete(d.ref); else tx.update(d.ref, {aplicada: true});   // 🎮 el GM lo borra en vez de marcarlo
        return true;
      });
      if(!tomada || fichaVivo !== f) continue;
      let spec = null;
      try{ spec = JSON.parse(d.data().spec || 'null'); }catch(e){}
      if(spec && spec.nombre) aplicarEstadoRecibido(spec, d.data().origen);
    }
  }catch(err){
    console.error('No se pudieron aplicar los estados recibidos:', err);
  }finally{
    estadosAplicando = false;
  }
}
// Un preset se encuentra por su nombre o por un nombre viejo (alias): "Escudo especial" pasó a llamarse "Escudo especial" (2026-09-24).
const presetPorNombre = (lista, nombre) => lista.find(p => p.nombre === nombre || (p.alias || []).includes(nombre));
// Un estado armado a partir de lo que manda una habilidad o una trampa ({nombre, turnos, mods, hp, stacks, escudoMagico…}):
// el preset con ese nombre con los números de la habilidad encima (comun/combatiente.js, ajustarPreset), o uno propio.
// Lo usan lo que le llega al personaje y lo que una invocación se pone a sí misma.
function estadoDeSpec(spec){
  const preset = presetPorNombre(EFECTOS_PRESET, spec.nombre);
  let draft;
  if(preset){
    const {nombre, ...resto} = preset;
    draft = {id: uid(), nombre, ...structuredClone(resto)};
    // Los números que manda la habilidad (turnos, bonos, daño por turno, escudo, stacks del Veneno) pisan los del preset:
    // la misma regla que los creeps (comun/combatiente.js). Ej.: Blindaje con otro escudo, Nube tóxica con Veneno ×3.
    Combatiente.ajustarPreset(draft, spec, 'hpturno');
  }else{
    const mods = (spec.mods || []).map(m => ({stat: m.stat, val: num(m.val)}));
    const txt = mods.map(m => `${num(m.val) > 0 ? '+' : ''}${fmt(num(m.val))} ${STAT_LABEL[m.stat] || m.stat}`);
    if(spec.hp) txt.push(`${spec.hp > 0 ? '+' : ''}${spec.hp} HP por turno`);
    if(spec.escudoMagico) txt.push(`escudo de ${num(spec.escudoMagico)}`);
    draft = {id: uid(), nombre: spec.nombre || 'Efecto', polaridad: spec.polaridad || (spec.escudoMagico ? 'buff' : 'debuff'), turnos: num(spec.turnos), stacks: 1, hpturno: num(spec.hp), stacksturno: 0,
      permanente: false, detalle: spec.detalle || txt.join(', '), mods, ...(num(spec.escudoMagico) ? {escudoMagico: num(spec.escudoMagico)} : {})};
  }
  draft.activo = true;
  if(!draft.polaridad) draft.polaridad = 'debuff';
  return draft;
}
function aplicarEstadoRecibido(spec, origen){
  // Durabilidad (2026-09-26): la Armadura rota y el desgaste son de los ÍTEMS, no un estado del personaje.
  if(spec.nombre === 'Desgaste'){
    const it = S.inventario.find(x => x.id === spec.item);
    if(it && durableItem(it)){ desgastarItem(it, 1); renderList('equipo'); renderList('mochila'); refresh(); }
    else toast(`Desgaste: no encuentro ese ítem en tu inventario`);
    return;
  }
  if(spec.nombre === 'Armadura rota'){ rompeArmaduraAlAzar(Math.max(1, num(spec.stacks) || 1)); return; }
  const draft = estadoDeSpec(spec);
  const quien = origen ? `${origen}: ` : '';
  // Inmunidades, acumulación y renovación: la regla común (comun/combatiente.js, agregarEstado).
  const r = Combatiente.agregarEstado(S.efectos, draft);
  if(!r.ok){ toast(`🛡 ${quien}Inmune ahora mismo (${r.motivo}) — ${draft.nombre} no te afectó`); return; }
  if(r.que === 'yaLoTiene'){ toast(`${quien}${draft.nombre}: ya lo tenías, no se acumula`); return; }
  renderList('efectos');
  refresh();
  toast(`🎯 ${quien}recibiste ${draft.nombre}${r.que === 'renovado' ? ' (se renovó el que tenías)' : r.que === 'acumulado' ? ` (×${r.estado.stacks})` : ''}`);
}

// (Acumular Veneno/Sangrado/Escarcha, inmunidades y renovar: Combatiente.agregarEstado, comun/combatiente.js — ver agregarEstadoConAviso.)

function attrBudget(){
  const nivel = Math.max(1, num(S.meta.nivel) || 1);
  const total = 33 + 3 * (nivel - 1);
  const usado = ATTR_LIST.reduce((a,at) => a + num(S.attrs[at.id]), 0);
  return {total, usado, pend: total - usado};
}

function renderAttrs(){
  const c = compute();
  const pb = attrBudget();
  $('#attr-points').innerHTML = `
    <span class="pt-label">Puntos de atributo</span>
    <span class="pt-nums">${pb.usado} / ${pb.total}</span>
    ${pb.pend !== 0 ? `<span class="pt-pend ${pb.pend<0?'over':''}">${pb.pend>0?`+${pb.pend} por asignar`:`${Math.abs(pb.pend)} de más`}</span>` : `<span class="pt-ok">al día</span>`}
  `;
  const htmlAttrs = GRUPOS.map(g => {
    const m = c.modTotal[g.id];
    const valCls = m>0 ? 'mod-plus' : m<0 ? 'mod-minus' : '';
    let descHtml = '';
    if(m){
      const origins = c.mods[g.id] || [];
      const origenTxt = origins.length===1 ? origins[0].origen : origins.length>1 ? `${origins.length} orígenes` : '';
      descHtml = `<button type="button" class="glyph-desc" data-stat="${g.id}" title="Ver detalle">${m>0?'+':''}${fmt(m)} → ${fmt(c.final[g.id])}${origenTxt?` · ${esc(origenTxt)}`:''}</button>`;
    }
    return `
    <div class="attr" style="--accent:${g.color}">
      <div class="head">
        <div class="glyph">
          <div class="ab">${g.label}</div>
          <input type="number" class="glyph-val ${valCls}" data-attr="${g.id}" data-mod="${m}" value="${fmt(c.final[g.id])}" title="${esc(g.full)}">
          <button type="button" class="dado-btn" data-tirarstat="${g.id}" title="Tirar dados para ${esc(g.full)}">🎲</button>
        </div>
        <div class="full">
          <span class="full-name">${g.full}</span>
          ${descHtml}
        </div>
      </div>
      <div class="derived" style="--dcols:${g.derived.length}">
        ${g.derived.map(d => statTile(d, c)).join('')}
        ${(openStat === g.id || g.derived.some(d=>d.id===openStat)) ? breakdown(openStat, c) : ''}
      </div>
    </div>`;
  }).join('');
  $('#attrs').innerHTML = htmlAttrs;
  if($('#stats-mapa-attrs')){   // la copia del menú de Stats de la ficha liviana del mapa
    $('#stats-mapa-attrs').innerHTML = htmlAttrs;
    $('#stats-mapa-puntos').innerHTML = $('#attr-points').innerHTML;
  }
}

function statTile(d, c, showMod=true){
  const m = c.modTotal[d.id];
  const val = Number.isNaN(c.final[d.id]) ? '?' : fmt(c.final[d.id]);
  const cls = m>0 ? 'boosted' : m<0 ? 'nerfed' : '';
  const valCls = showMod ? (m>0?'mod-plus':m<0?'mod-minus':'') : '';
  let descHtml = '';
  if(showMod && m){
    const origins = c.mods[d.id] || [];
    const origenTxt = origins.length===1 ? origins[0].origen : origins.length>1 ? `${origins.length} orígenes` : '';
    descHtml = `<span class="dv-desc">${m>0?'+':''}${fmt(m)}${origenTxt?` · ${esc(origenTxt)}`:''}</span>`;
  }
  const puedeTirar = !STATS_SIN_TIRADA.includes(d.id);
  return `<div class="d ${cls}" data-stat="${d.id}" title="${esc(d.full)}">
    <span class="dl">${d.label}</span>
    <span class="dv ${valCls}">${val}</span>
    ${puedeTirar ? `<button type="button" class="dado-btn" data-tirarstat="${d.id}" title="Tirar dados para ${esc(d.full)}">🎲</button>` : ''}
    ${descHtml}
  </div>`;
}

function breakdown(id, c){
  const rows = (c.mods[id]||[]).map(m =>
    `<div class="row"><span>${esc(m.origen)}</span><b>${m.val>0?'+':''}${fmt(m.val)}</b></div>`).join('');
  const attr = ES_ATTR(id);
  const baseTxt = Number.isNaN(c.base[id]) ? 'fórmula inválida' : fmt(c.base[id]);
  return `<div class="breakdown">
    <div class="row"><span>${attr ? 'Valor propio' : 'Base'}</span><b>${baseTxt}</b></div>
    ${rows || '<div class="row" style="opacity:.6"><span>Sin modificadores activos</span><b>–</b></div>'}
    <div class="row tot"><span>${STAT_LABEL[id]} · ${STAT_FULL[id]}</span><b>${Number.isNaN(c.final[id])?'?':fmt(c.final[id])}</b></div>
    ${attr
      ? `<div class="hint" style="margin-top:7px">Los derivados de ${STAT_FULL[id]} usan ${fmt(c.final[id])}, no ${fmt(c.base[id])}. Editá el valor propio desde el número grande de arriba.</div>`
      : `<div class="fx"><span style="color:var(--copper)">fx</span><input data-formula="${id}" value="${esc(S.formulas[id]||'')}"></div>`}
  </div>`;
}

const TIPOS_IDS = ['tipo1','tipo2','tipo3','tipo4','tipo5'];

function renderArmadura(){
  const c = compute();
  const m = c.modTotal.def;
  const tile = $('#def-tile');
  tile.classList.toggle('boosted', m > 0);
  tile.classList.toggle('nerfed', m < 0);
  $('#v-def').textContent = Number.isNaN(c.final.def) ? '?' : fmt(c.final.def);
  $('#def-breakdown').innerHTML = openStat === 'def' ? breakdown('def', c) : '';
  const tv = $('#vision-tile');
  tv.classList.toggle('boosted', c.modTotal.vision > 0);
  tv.classList.toggle('nerfed', c.modTotal.vision < 0);
  $('#v-vision').textContent = Number.isNaN(c.final.vision) ? '?' : fmt(c.final.vision);
  $('#vision-breakdown').innerHTML = openStat === 'vision' ? breakdown('vision', c) : '';

  $('#tipos').innerHTML = TIPOS_IDS.map(id => {
    const d = EXTRA.find(e => e.id === id);
    return statTile(d, c, false);
  }).join('');
  $('#tipos-breakdown').innerHTML = TIPOS_IDS.includes(openStat) ? breakdown(openStat, c) : '';

  renderEfectosArmas();
  renderEfectosOtros();
}

function asignarManos(){
  const enManos = S.inventario.filter(i => i.equipado && ES_MANO(i.tipoItem));
  const dosManos = enManos.find(a => a.tipoItem === 'arma_2m' || a.tipoItem === 'escudo_2m');
  const unaMano = enManos.filter(a => a.tipoItem === 'arma_1m' || a.tipoItem === 'escudo_1m');
  const mapa = new Map();
  if(dosManos){
    mapa.set(dosManos.id, 1);
    const otro = unaMano[0];
    if(otro) mapa.set(otro.id, 2);
  }else{
    const pref1 = unaMano.find(a => String(a.manoPreferida) === '1');
    const pref2 = unaMano.find(a => String(a.manoPreferida) === '2' && a !== pref1);
    const resto = unaMano.filter(a => a !== pref1 && a !== pref2);
    const m1 = pref1 || resto.shift() || null;
    const m2 = pref2 || resto.shift() || null;
    if(m1) mapa.set(m1.id, 1);
    if(m2) mapa.set(m2.id, 2);
  }
  return mapa;
}

function renderEfectosArmas(){
  const enManos = S.inventario.filter(i => i.equipado && ES_MANO(i.tipoItem));
  if(!enManos.length){
    $('#efectos-armas').innerHTML = `<div class="empty">No tenés nada equipado en las manos.</div>`;
    actualizarTextosCombate();
    return;
  }
  const dosManos = enManos.find(a => a.tipoItem === 'arma_2m' || a.tipoItem === 'escudo_2m');
  const manos = asignarManos();
  const m1 = enManos.find(a => manos.get(a.id) === 1) || null;
  const m2 = enManos.find(a => manos.get(a.id) === 2) || null;
  const esDosManos = !!(dosManos && m1 && m1.id === dosManos.id);

  const manoHtml = (item, label) => {
    if(!item) return `<div class="mano-box"><div class="mano-label">${label}</div><div class="mano-vacio">—</div></div>`;
    const esElDosManos = esDosManos && item.id === dosManos.id;
    const dano = armaDanoTxt(item);
    const esArma = ES_ARMA(item.tipoItem);
    return `<div class="mano-box">
      <div class="mano-label">${label}${esElDosManos ? ' (dos manos)' : ''}</div>
      <div class="mano-nombre">${esc(item.nombre)}</div>
      ${esArma ? `<div class="mano-tipo">Tipo ${num(item.tipoDado)||8}</div>` : ''}
      ${dano ? `<div class="mano-dano">${dano}</div>` : ''}
      ${item.detalle ? `<div class="mano-fx">${esc(item.detalle)}</div>` : ''}
    </div>`;
  };

  $('#efectos-armas').innerHTML = esDosManos
    ? `<div class="manos-grid manos-grid-single">${manoHtml(m1, 'Mano 1')}</div>`
    : `<div class="manos-grid">${manoHtml(m1, 'Mano 1')}${manoHtml(m2, 'Mano 2')}</div>`;

  actualizarTextosCombate();
}

// Fórmulas de las 4 tiradas de Combate — se usa tanto para los botones
// de la caja Combate como para las tiles de la Botonera, así siempre
// muestran lo mismo.
function formulasCombate(){
  const c = compute();
  const fPdg = formulaParaValor(c.final.pdg);
  const fEva = formulaParaValor(c.final.eva);
  const fParry = formulaParaValor(c.final.parry);
  const fBloqueo = formulaParaValor(c.final.bloqueo);
  const armas = S.inventario.filter(i => i.equipado && ES_MANO(i.tipoItem) && ES_ARMA(i.tipoItem));
  let danio;
  if(armas.length === 1) danio = armaDanoTxt(armas[0], c.final.dmg);
  else if(armas.length > 1) danio = 'elegís arma';
  else danio = 'sin arma equipada';
  const conMit = (f, id) => f ? f.formula + ' ÷2'.repeat(mitadesDeTirada(S.efectos, id)) : '';
  return {pdg: conMit(fPdg, 'pdg'), eva: conMit(fEva, 'eva'), parry: conMit(fParry, 'parry'), bloqueo: fBloqueo ? fBloqueo.formula : '', danio};
}

// Los botones de Combate muestran qué van a tirar, para no tener que
// adivinar antes de apretar.
function actualizarTextosCombate(){
  const f = formulasCombate();
  $('#btn-atacar-pdg').textContent = `🎲 Atacar (PdG)${f.pdg ? ` · ${f.pdg}` : ''}`;
  $('#btn-esquivar').textContent = `🎲 Esquivar (Eva)${f.eva ? ` · ${f.eva}` : ''}`;
  $('#btn-parry').textContent = `🎲 Parry${f.parry ? ` · ${f.parry}` : ''}`;
  $('#btn-bloqueo').textContent = `🎲 Bloqueo${f.bloqueo ? ` · ${f.bloqueo}` : ''}`;
  $('#btn-danio-arma').textContent = `🎲 Daño Arma · ${f.danio}`;
}

function armasEquipadasConDano(){
  const manos = asignarManos();
  return S.inventario
    .filter(i => i.equipado && !itemRoto(i) && ES_MANO(i.tipoItem) && armaDanoTxt(i))
    .map(i => ({item: i, mano: manos.get(i.id) || null}))
    .sort((a, b) => (a.mano || 99) - (b.mano || 99));
}

function tirarDanoDeArma(it){
  const dmg = compute().final.dmg;
  const r = tirarDados(armaDanoTxt(it, dmg));
  if(!r) return;
  registrarTirada(it.nombre, r);
  efectosAlPegar(it);
}

function pedirArmaYTirar(){
  const armas = armasEquipadasConDano();
  if(!armas.length){ toast('No tenés ningún arma equipada con daño para tirar'); return; }
  if(armas.length === 1){ tirarDanoDeArma(armas[0].item); return; }
  const dmg = compute().final.dmg;
  $('#elegir-arma-lista').innerHTML = armas.map(a => `
    <button class="btn" data-elegirarma="${a.item.id}" style="width:100%">
      ${a.mano ? `Mano ${a.mano}: ` : ''}${esc(a.item.nombre)} — ${esc(armaDanoTxt(a.item, dmg))}
    </button>`).join('');
  $('#scrim-elegir-arma').classList.add('open');
}

function renderEfectosOtros(){
  const equipados = S.inventario.filter(i => i.equipado);
  const lineas = [];
  equipados.forEach(i => {
    const otrosMods = (i.mods||[]).filter(m => m.stat && m.stat !== 'def' && !TIPOS_IDS.includes(m.stat));
    if(otrosMods.length){
      const partes = otrosMods.map(m => `${STAT_LABEL[m.stat]||m.stat} ${num(m.val)>0?'+':''}${fmt(num(m.val))}`).join(', ');
      lineas.push(`<div class="efecto-otro"><b>${esc(i.nombre)}</b> — ${esc(partes)}</div>`);
    }
    if(!ES_MANO(i.tipoItem) && i.detalle && i.detalle.trim()){
      lineas.push(`<div class="efecto-otro"><b>${esc(i.nombre)}</b> — ${esc(i.detalle)}</div>`);
    }
  });
  $('#efectos-otros').innerHTML = lineas.length ? lineas.join('') : `<div class="empty">Sin efectos adicionales equipados.</div>`;
}

function computeSlots(){
  const equipados = S.inventario.filter(i => i.equipado);
  return SLOT_DEFS.map(sd => {
    let usado = 0;
    equipados.forEach(i => {
      if(!sd.cats.includes(i.tipoItem)) return;
      usado += sd.peso ? (sd.peso[i.tipoItem] || 1) : 1;
    });
    return {...sd, usado};
  });
}

// Consume 1 unidad del Ankh (esté donde esté) y revive con 25% del HP
// máximo (mínimo 1, para no reventar todos los Ankh de un saque si el HP
// máximo es muy bajo). No toca S.muerto — eso lo resuelve revisarMuerte()
// en el siguiente renderVitals().
function aplicarRevivirConAnkh(key, id){
  const it = S[key].find(x => x.id === id);
  if(!it) return null;
  it.unidades = num(it.unidades) - 1;
  purgarSiAgotado(key, it.id);
  const cc = compute();
  const hpmaxAnkh = Number.isNaN(cc.final.hpmax) ? 0 : cc.final.hpmax;
  S.hp = Math.max(1, Math.floor(hpmaxAnkh * 0.25));
  $('#f-hp').value = S.hp;
  return it.nombre;
}

/* Toda baja de HP pasa por acá. Antes cada camino asignaba S.hp por su
   cuenta y algunos dejaban valores negativos: la cabecera mostraba 0 pero
   por dentro había un pozo (-40, por ejemplo), así que curar +5 dejaba -35
   y el jugador seguía muerto sin entender por qué. El HP nunca baja de 0. */
function fijarHp(valor){
  const c = compute();
  const hpmax = Number.isNaN(c.final.hpmax) ? 0 : c.final.hpmax;
  const tope = hpmax > 0 ? hpmax : Math.max(0, num(valor));
  S.hp = Math.max(0, Math.min(tope, num(valor)));
  const campo = $('#f-hp');
  if(campo) campo.value = fmt(S.hp);
  renderVitals();   // acá adentro se revisa el Ankh y el estado de muerte
  return S.hp;
}

// Si el HP llega a 0 y hay un Ankh de Reencarnación en el cinturón, se
// activa solo (auto-consumo). Si está en la mochila en vez de equipado,
// NO se activa solo — hay un botón de Consumir aparte para activarlo a
// mano (pensado para el caso de un aliado a distancia cero).
function revisarAnkh(){
  if(num(S.hp) > 0) return;
  if(S.muerto && S.muerto.definitivo) return; // muerte definitiva: ya no hay vuelta atrás
  const idx = S.cinturon.findIndex(i => i.nombre === 'Ankh de Reencarnación' && num(i.unidades) > 0);
  if(idx < 0) return;
  const nombre = aplicarRevivirConAnkh('cinturon', S.cinturon[idx].id);
  renderList('cinturon');
  toast(`¡${nombre} se activó solo! Revivís con ${fmt(S.hp)} HP.`);
}

function revisarMuerte(){
  if(!S.muerto) S.muerto = {activo:false, turnos:5, definitivo:false};
  if(num(S.hp) > 0){
    if(S.muerto.activo){
      S.muerto = {activo:false, turnos:5, definitivo:false};
      $('#overlay-muerte').classList.remove('open');
    }
    return;
  }
  if(!S.muerto.activo && !S.muerto.definitivo){
    S.muerto.activo = true;
    S.muerto.turnos = 5;
    $('#scrim-muerte').classList.add('open');
  }
  renderOverlayMuerte();
}

function renderOverlayMuerte(){
  // Dentro del mapa (iframe): le avisa el estado de muerte para que tiña TODA la pantalla del mapa, no solo esta ventana.
  try{ botoneraAvisarMapa('muerte-estado', {activo: !!(S.muerto && S.muerto.activo), turnos: num(S.muerto && S.muerto.turnos), definitivo: !!(S.muerto && S.muerto.definitivo)}); }catch(e){}
  if(!S.muerto || !S.muerto.activo){ $('#overlay-muerte').classList.remove('open'); return; }
  $('#overlay-muerte').classList.add('open');
  $('#btn-revivir').style.display = S.muerto.definitivo ? 'none' : '';
  $('#overlay-muerte-centro').innerHTML = S.muerto.definitivo
    ? `<div class="muerte-final">TE HAS MORIDO BIEN MUERTO Y YA NO HAY VUELTA ATRÁS</div>`
    : `<div class="muerte-label">INCONSCIENTE · turnos hasta morir:</div><div class="muerte-numero">${fmt(S.muerto.turnos)}</div>`;
}

function renderVitals(){
  revisarAnkh();
  revisarMuerte();
  const c = compute();
  const hpmax = Number.isNaN(c.final.hpmax) ? 0 : c.final.hpmax;
  $('#v-hpmax').textContent = fmt(hpmax);
  // El HP puede quedar en negativo internamente (overkill), pero en el
  // contador de la cabecera nunca se muestra por debajo de 0.
  if(document.activeElement !== $('#f-hp')) $('#f-hp').value = fmt(Math.max(0, num(S.hp)));
  $('#bar-hp').style.width = pct(S.hp, hpmax);

  // capacidad
  const crg = Number.isNaN(c.final.crgmax) ? 0 : c.final.crgmax;
  setCap('equipo', c.pesoEquipado, crg);
  const capMochilaTotal = capMochilaEfectivo();
  setCap('mochila', S.inventario.filter(i=>!i.equipado).reduce((a,i)=>a+ranurasDe(i),0), capMochilaTotal);
  const bonusMochila = capMochilaTotal - num(S.caps.mochila);
  $('#cap-mochila-bonus-txt').textContent = bonusMochila ? ` (+${fmt(bonusMochila)} de la mochila equipada)` : '';
  const capCinturonBase = num(S.caps.cinturon);
  const capCinturonTotal = capCinturonEfectivo();
  setCap('cinturon', S.cinturon.length, capCinturonTotal);
  $('#cap-cinturon-total').textContent = fmt(capCinturonTotal);
  const bonusCinturon = capCinturonTotal - capCinturonBase;
  $('#cap-cinturon-bonus-txt').textContent = bonusCinturon ? ` (+${fmt(bonusCinturon)} del cinturón equipado)` : '';
  $('#cap-equipo-t').textContent = fmt(crg);

  // SP: se gasta con habilidades; al pasar turno recupera SP Regen.
  const spMax = spMaximo(c);
  const gastado = num(S.spGastado);
  const sp = spMax - gastado;
  // Segunda barra del recuadro de vida (arriba de todo).
  if(document.activeElement !== $('#f-sp-vital')) $('#f-sp-vital').value = fmt(Math.max(0, sp));
  $('#v-spmax-vital').textContent = fmt(spMax);
  $('#bar-sp').style.width = pct(Math.max(0, sp), spMax);
  $('#equipo-over').innerHTML = c.sobrecarga > 0
    ? `Te pasás por ${fmt(c.sobrecarga)}: −${fmt(c.sobrecarga)} a la Evasión al tirarla, o pagás 1 No2 para evitarlo. ${IT2_PENDIENTE('regla de sobrepeso en prueba')}` : '';
}

// SP máximo = el calculado (Especial × 3 + bonos) + un ajuste a mano (`S.meta.spMaxExtra`, puede ser negativo) que se fija desde el
// token del mapa (2026-09-24, pedido de los jugadores): así se puede subir o bajar el máximo sin tocar la fórmula.
function spMaximo(c){
  c = c || compute();
  if(Number.isNaN(c.final.sp)) return 0;
  return Math.max(0, c.final.sp + num(S.meta.spMaxExtra));
}

function nitrosMaximo(c){
  c = c || compute();
  return Number.isNaN(c.final.nitros) ? 0 : c.final.nitros;
}

function setCap(key, used, total){
  $('#cap-'+key+'-n').textContent = fmt(used);
  const bar = $('#cap-'+key+'-bar');
  bar.classList.toggle('over', total>0 && used>total);
  bar.firstElementChild.style.width = pct(used, total);
}

function pct(v, max){ return max>0 ? Math.min(100, Math.max(0, v/max*100))+'%' : '0%'; }
function fmt(n){ return Number.isInteger(n) ? n : Math.round(n*100)/100; }
function esc(s){ return String(s??'').replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch])); }

function statOptions(sel){
  const opt = s => `<option value="${s.id}" ${sel===s.id?'selected':''}>${s.label} — ${s.full}</option>`;
  return `<optgroup label="Atributos">${ATTR_LIST.map(opt).join('')}</optgroup>`
       + GRUPOS.map(g => `<optgroup label="${g.label} · ${g.full}">${g.derived.map(opt).join('')}</optgroup>`).join('')
       + `<optgroup label="Otros">${EXTRA.map(opt).join('')}</optgroup>`;
}

function jobTag(i){
  if(i.job === false){
    return i.origen
      ? `<span class="tag origen">${esc(i.origen)}</span>`
      : `<span class="tag origen">fuera de Job</span>`;
  }
  const costo = jobCostoDe(i);
  return `<span class="tag job">${costo === 1 ? "Job" : `Job ${fmt(costo)}`}</span>`;
}

function modTags(mods){
  return (mods||[]).filter(m=>m.stat).map(m =>
    `<span class="tag mod ${num(m.val)<0?'neg':''}" title="${esc(STAT_FULL[m.stat]||'')}">${STAT_LABEL[m.stat]||m.stat} ${num(m.val)>0?'+':''}${fmt(num(m.val))}</span>`).join('');
}

function thumb(i){
  return i.imagen ? `<img class="item-thumb" src="${i.imagen}" alt="">` : '';
}

function ranurasDe(i){
  return (i.ranuras === undefined || i.ranuras === '') ? 1 : num(i.ranuras);
}

function unitStepper(i, key){
  return `<div class="unit-stepper">
    <span class="unit-label">Cantidad</span>
    <button class="unit-btn" data-unit="${key}:${i.id}:-1">−</button>
    <span class="unit-n">${fmt(num(i.unidades))}</span>
    <button class="unit-btn" data-unit="${key}:${i.id}:1">+</button>
  </div>`;
}

function cargaIndicator(i){
  const cargaMax = Math.max(1, num(i.cargaMax) || 1);
  if(cargaMax <= 1) return '';
  const carga = Math.min(cargaMax, Math.max(0, num(i.cargaActual ?? cargaMax)));
  return `<div class="unit-stepper"><span class="unit-label">Cargas de la unidad actual</span><span class="unit-n">${carga}/${cargaMax}</span></div>`;
}

// Lo que está en la mochila es una copia del ítem del catálogo hecha en el
// momento de comprarlo. Si el efecto se configuró después, esa copia no lo
// tiene y el consumible no hace nada. Se busca el original por nombre, que
// es la única referencia al catálogo que sobrevive a la copia.
function configEfectoDe(it){
  // El catálogo es la referencia compartida y siempre gana sobre lo que
  // haya quedado copiado en el ítem al comprarlo/agregarlo — si se le
  // completó el efecto en el catálogo después (como pasó con las pociones
  // y pergaminos que ya tenían nombre de estado pero sin modificadores),
  // los ítems que la gente ya tenía en la mochila tienen que verlo también.
  // Solo se usa lo propio del ítem si no hay match en el catálogo (algo
  // 100% custom, nunca publicado).
  const base = (S.catalogo || []).find(c => sinAviso(c.nombre) === sinAviso(it.nombre));
  if(base && (base.efectoNombre || '').trim()) return base;
  return it;
}

// Invulnerable, Inmunidad a CC, Sangre pura y Coagulación extrema (comun/combatiente.js). objEfecto: un preset o un draft del editor.
function estaBloqueadoElDebuff(objEfecto){ return !!Combatiente.inmunidad(S.efectos, objEfecto); }

// Oleo reparador: quita Armadura rota si está activa (es permanente, no vence sola). Devuelve cuántas se quitaron.
function repararArmadura(){
  const antes = S.efectos.length;
  S.efectos = S.efectos.filter(e => e.nombre !== 'Armadura rota');
  return antes - S.efectos.length;
}

/* ---------- Sigilo: entrar y salir con un botón (Botonera) ----------
   Quien tiene la habilidad "Sigilo" ve en la Botonera un botón directo, sin
   pasar por "+ Estado". Entrar cuesta IT2.nitrosSigilo (1 No2, a revisar) y
   aplica el estado alterado "Sigilo" sobre uno mismo (el mapa lo lee de ahí);
   salir es gratis. No se avisa en la Mesa: el sigilo no se anuncia. */
const tieneSigilo = () => S.habilidades.some(h => String(h.nombre || '').trim().toLowerCase() === 'sigilo');
const efectoSigilo = () => S.efectos.find(e => e.activo !== false && String(e.nombre || '').trim().toLowerCase() === 'sigilo');

function alternarSigilo(forzar){
  const actual = efectoSigilo();
  if(actual){
    S.efectos = S.efectos.filter(e => e !== actual);
    renderList('efectos'); refresh();
    toast('Saliste del sigilo');
    return;
  }
  const costo = num(IT2.nitrosSigilo);
  if(num(S.nitros) < costo && !forzar){
    avisarSinNitros(costo, 'entrar en sigilo', () => alternarSigilo(true));
    return;
  }
  const preset = EFECTOS_PRESET.find(p => p.nombre === 'Sigilo');
  S.nitros = num(S.nitros) - (forzar && costo > num(S.nitros) ? gastoNitrosForzado(costo, 'entró en sigilo') : costo);
  S.efectos.push({id: uid(), nombre: 'Sigilo', imagen: '', turnos: 0, stacks: 1, hpturno: 0, stacksturno: 0,
    permanente: true, activo: true, popup: false, detalle: (preset && preset.detalle) || '', mods: [], ...flagsDePreset('Sigilo')});
  renderList('efectos'); renderNitros(); refresh();
  toast(`Entraste en sigilo${costo ? ` · -${fmt(costo)} No2` : ''}`);
}

/* ---------- Sentado: levantarse cuesta 1 No2 ----------
   El estado Sentado no vence solo; el botón "Levantarse" de la Botonera lo saca y cobra IT2.nitrosLevantarse. */
const efectoSentado = () => S.efectos.find(e => e.activo !== false && e.sentado);
function levantarse(forzar){
  const actual = efectoSentado();
  if(!actual) return;
  const costo = num(IT2.nitrosLevantarse);
  if(num(S.nitros) < costo && !forzar){
    avisarSinNitros(costo, 'levantarte', () => levantarse(true));
    return;
  }
  S.nitros = num(S.nitros) - (forzar && costo > num(S.nitros) ? gastoNitrosForzado(costo, 'se levantó') : costo);
  S.efectos = S.efectos.filter(e => e !== actual);
  renderList('efectos'); renderNitros(); refresh();
  toast(`Te levantaste${costo ? ` · -${fmt(costo)} No2` : ''}`);
}

function aplicarEfectoDeConsumo(it){
  const src = configEfectoDe(it);
  const nombre = (src.efectoNombre || '').trim();
  if(!nombre) return null;
  // El ítem no sabe de categorías/inmunidades — se infiere buscando un
  // preset con el mismo nombre (así "Veneno", "Sangrado", etc. quedan
  // bloqueados por sus inmunidades aunque lleguen desde un consumible), o
  // el que declare en efectoPreset — para poder mostrar un nombre propio
  // ("Coagulación extrema (pergamino)") sin perder la mecánica real del
  // preset "Coagulación extrema" (mismo mecanismo que equipoEstadoPreset).
  const nombrePresetEfectivo = presetPorNombre(EFECTOS_PRESET, nombre) ? nombre : (src.efectoPreset || '').trim();
  const preset = presetPorNombre(EFECTOS_PRESET, nombrePresetEfectivo);
  if(estaBloqueadoElDebuff(preset)){
    toast(`Inmune ahora mismo — ${nombre} no hizo efecto`);
    return null;
  }
  const turnos = num(src.efectoTurnos);
  const hpturno = num(src.efectoHpTurno);
  const permanente = !!src.efectoPermanente;
  const mods = structuredClone((src.efectoMods || []).filter(m => m.stat));
  // El estado se queda solo en la lista: sin una descripción propia hay que
  // acordarse de qué ítem salió. Si el ítem no trae un texto pensado para el
  // estado, se usa el suyo, que es mejor que nada.
  const detalle = (src.efectoDetalle || '').trim() || (src.detalle || '').trim();
  const categorias = flagsDePreset(nombrePresetEfectivo);
  // Cantidades propias de la habilidad/ítem (las que se eligieron en el asistente de estados): mandan sobre las del preset.
  const escudo = num(src.efectoEscudo), stacks = Math.max(1, num(src.efectoStacks) || 1);
  if(escudo > 0) categorias.escudoMagico = escudo;
  // Ponerlo: la regla común (comun/combatiente.js, agregarEstado) — inmunidades, Veneno y Sangrado que se acumulan y, si ya
  // tiene uno igual (no el de un ítem equipado), se renueva (P132). Reaplicar recarga el escudo entero.
  const nuevo = {id:uid(), nombre, imagen:'', turnos, stacks, hpturno, stacksturno:0, permanente, activo:true, popup:false, detalle, mods, ...categorias};
  if(num(nuevo.escudoMagico) > 0) nuevo.escudoMagicoActual = num(nuevo.escudoMagico);
  const r = Combatiente.agregarEstado(S.efectos, nuevo);
  if(!r.ok){ toast(`Inmune ahora mismo (${r.motivo}) — ${nombre} no hizo efecto`); return null; }
  return r.estado;
}

// Tira la fórmula custom configurada en el ítem/habilidad (si tiene) y
// la publica en la Mesa, igual que un ataque o un chequeo manual.

// Stats secundarios que se pueden tirar (los que tienen 🎲 en Atributos).
function STATS_CON_TIRADA(){
  return STAT_LIST.filter(s => !STATS_SIN_TIRADA.includes(s.id));
}

// Al ejecutar: tira el stat vinculado (con su valor del momento, mods
// incluidos) y/o la fórmula manual. Se puede tener las dos.
function tirarExtraDeItem(it){
  let tiro = false;
  const stat = it.tiradaStat;
  if(stat && (ATTR_LIST.some(a => a.id === stat) || STATS_CON_TIRADA().some(s => s.id === stat))){
    tirarValorStat(`${it.nombre} · ${STAT_LABEL[stat]}`, compute().final[stat] + num(it.tiradaBono), stat);
    tiro = true;
  }
  const formula = (it.tiradaExtra || '').trim();
  if(formula){
    const r = tirarDados(formula);
    if(r){ registrarTirada(it.nombre, r); tiro = true; }
  }
  return tiro;
}

/* Ejecutar una habilidad tira SOLO la primera tirada que le corresponde: el stat vinculado (PdG, PdG.Esp u otro) o,
   si no tiene, la fórmula. La segunda (la fórmula: el daño o el efecto) va aparte con el botón 🎲, igual que en las
   armas (Atacar → Daño) — decidido 2026-09-24. */
function habStatTirable(it){
  const s = it.tiradaStat;
  return !!(s && (ATTR_LIST.some(a => a.id === s) || STATS_CON_TIRADA().some(x => x.id === s)));
}
function habTieneSegundaTirada(it){ return habStatTirable(it) && !!(it.tiradaExtra || '').trim(); }
/* ---------- Habilidades dirigidas en el duelo (2026-09-27, docs/duelo-de-habilidades.md) ----------
   Una habilidad con `duelo` = {objetivo: 'enemigo'|'aliado'|'uno mismo', tira: stat (por defecto su tiradaStat), contra: [stats con los que se resiste el objetivo],
   dano: true si la fórmula de la habilidad (tiradaExtra) es daño, tipoDano: 'arcano'|'fuego'|'hielo'|'rayo'|'fisico', efectos: [{nombre, turnos, mods, hp, cura}]}
   abre el duelo al ejecutarla en vez de tirar el stat suelto. */
/* Ataque con arma hecho con una habilidad (2026-09-27): `duelo.modo === 'arma'` + `duelo.arma = {pdg, pdgPorX, dadosPorX, fijo, fijoPorX, sinParry}` y `duelo.x` ('sp' o 'nitros': cuál es la X de
   su costo). Al ejecutarla se abre el duelo de ATAQUE de siempre (PdG, Evasión o Parry, crítico, daño con los efectos del arma) con lo que la habilidad le suma. Los No2 del ataque ya
   los cobró la habilidad: el duelo no los vuelve a cobrar. */
// El duelo de una habilidad: el que se le configuró con 🎯 (null = se lo sacaron) o, si nunca se tocó, el de la skill de clase de la que salió (así las que ya estaban en la mochila también lo traen).
function dueloDe(it){
  if(!it) return null;
  if(it.duelo !== undefined) return it.duelo;
  const base = it.habClaseId && typeof CLASES_SKILLS !== 'undefined' ? CLASES_SKILLS.flatMap(c => c.habilidades).find(h => h.id === it.habClaseId) : null;
  return base && base.duelo ? base.duelo : null;
}
function ataqueDeHabArma(it, arma, xSp, xNitros){
  const c = dueloDe(it);
  if(!c || c.modo !== 'arma' || typeof Duelo === 'undefined' || !Duelo.disponible() || !fichaVivo || !fichaVivo.id || fichaVivo.soloLectura || fichaVivo.editaGM) return null;
  // El ataque con arreglos lo arma la regla común (comun/combatiente.js, ataqueConArreglos), la misma que usa un creep.
  // ⚡ Critical Matters: los efectos/nota de `c.critico` solo se suman si el golpe termina siendo crítico (comun/duelo.js).
  return Combatiente.ataqueConArreglos(it, c, {X: c.x === 'sp' ? num(xSp) : num(xNitros),
    arma: {id: arma ? arma.id : '', nombre: arma ? arma.nombre : '', tipoDado: tipoAtaque(arma), rango: !!(arma && arma.armaDeRango)},
    alcance: c.alcance !== undefined && c.alcance !== 'auto' ? alcanceDeHab(c, 'pdg') : alcanceDeArma(arma)});
}
function xDeHab(it, xSp, xNitros){ return spVariable(it) ? num(xSp) : nitrosVariable(it) ? num(xNitros) : 0; }
// Reemplaza el token «X» (sin importar mayúsculas) de una fórmula de dados o de un texto libre por un número —
// mismo criterio que ya usa danoFijoPorX, generalizado para tirada personalizada y efecto a mano/personalizado.
// \bx\b sola no alcanza: en «1dX» la X queda pegada a la «d» (las dos son \w, sin borde de palabra ahí) y no
// la tocaba — la fórmula quedaba con una X literal y tirarDados fallaba en silencio (bug real, 2026-09-28).
// Por eso hay una segunda pasada para «dX»/«Xd» (dado de X caras / X dados), sin tocar el resto del texto
// libre (una palabra como "excedente" no tiene "dx"/"xd" pegados, así que no se toca).
function sustituirX(formula, X){ return Combatiente.sustituirX(formula, X); }   // comun/combatiente.js
// Aplica un efecto del cuadro de Ejecución directo sobre el propio personaje, sin esperar al GM (2026-09-29,
// bug real reportado con Blindaje: un buff sobre uno mismo se quedaba en «Aplicando…» para siempre si el GM no
// tenía el mapa abierto y conectado — antes SOLO el mapa del GM podía aplicar un efecto, comun/duelo.js
// cfgEscuchar.aplicarEfecto, gateado a soyGM()). Escribir la propia ficha nunca necesita el permiso de nadie
// más, así que este hook (pasado a Duelo.escuchar) se habilita también para `esMio(d.defensor)` — ver el
// cambio de esa fecha en comun/duelo.js. Cualquier otro caso (un aliado, un rival) sigue dependiendo del mapa.
function dueloAplicarEfectoPropio(d, ef){
  if(!fichaVivo || d.defensor.tipo !== 'pj' || d.defensor.ref !== fichaVivo.id) return {manual: true, nota: 'a mano'};
  const spec = Duelo.specDeEfecto(ef);
  if(!spec) return {manual: true, nota: 'a mano'};
  if(spec.cura){
    const antes = num(S.hp);
    fijarHp(antes + num(spec.cura));
    return {nota: `+${fmt(num(spec.cura))} HP (${fmt(antes)} → ${fmt(num(S.hp))})`};
  }
  aplicarEstadoRecibido(spec, `${d.atacante.nombre} · ${ef.nombre}`);
  return {nota: typeof EstadosAplicar !== 'undefined' ? EstadosAplicar.texto(spec) : spec.nombre};
}
// Lo último que hace ejecutar una habilidad: anunciarla y tirar su primera tirada, o abrir el duelo (habilidad
// dirigida o ataque con arma). La tirada personalizada de una habilidad dirigida (ver habDueloDe) ya vive
// DENTRO del duelo (hab.tira.formula), no acá — no hace falta ninguna ventanita aparte en la ficha.
function terminarEjecucionHab(it, arma, xSp, xNitros){
  // 💰 Semiautomática: ya cobró el costo; anuncia y tira la tirada inicial (si tiene). Los efectos, a mano.
  if(modoHab(it) !== 'auto'){ anunciarHabilidad(it); tirarPrimeraDeHab(it); return; }
  if(!dueloDe(it)){
    if(it.trampaColocar) return;   // una trampa sola: el anuncio y la casilla ya los maneja colocarTrampaDeHab
    toast(`${it.nombre}: todavía no tiene armada la ejecución paso a paso (✨) — se ejecutó como semiautomática`); anunciarHabilidad(it); tirarPrimeraDeHab(it); return;
  }
  const aArma = ataqueDeHabArma(it, arma, xSp, xNitros);
  if(aArma){
    mesaPublicarHabilidad(it.nombre, it.detalle || it.efectoDetalle || '');
    Duelo.elegirObjetivo({yo: {ref: fichaVivo.id, tipo: 'pj', nombre: (S.meta && S.meta.nombre) || 'Personaje'}, ataque: aArma, suelto: () => tirarPrimeraDeHab(it)});
    return;
  }
  // Zona persistente (2026-09-28): no abre el cuadro del duelo — queda puesta en el mapa y se resuelve sola,
  // de a uno, mientras dura (ver comun/asistente-duelo-hab.js y comun/CLAUDE.md "Zona persistente").
  const cZona = dueloDe(it);
  if(cZona && typeof cZona === 'object' && cZona.objetivo === 'zona'){
    mesaPublicarHabilidad(it.nombre, it.detalle || it.efectoDetalle || '');
    if(!colocarZonaDeHab(it, xSp, xNitros)) toast(`${it.nombre}: para colocar la zona hace falta tener el mapa abierto`);
    return;
  }
  // Solo sobre uno mismo y sin nada que tirar (Blindaje y parecidos): no hace falta el cuadro — se aplica directo y se anuncia.
  if(aplicarHabSobreMiDirecto(it, habDueloDatos(it, xSp, xNitros))) return;
  const hDuelo = habDueloDe(it, xSp, xNitros);   // habilidad dirigida (duelo): se anuncia sin tirada y la contienda va en el cuadro del duelo
  if(hDuelo) mesaPublicarHabilidad(it.nombre, it.detalle || it.efectoDetalle || ''); else anunciarHabilidad(it);
  if(!(hDuelo && lanzarDueloDeHab(it, hDuelo))) tirarPrimeraDeHab(it);
}
// Manda al mapa (la ficha corre en su iframe) todo lo que hace falta para crear la zona: radio, duración, estado
// y/o daño, y con qué resistencia. Si hay tirada («tira» del 🎯), la tira UNA vez acá y manda el total — esa
// misma tirada es la que se reusa contra cada uno que entra o sigue adentro en el Mantenimiento (mismo criterio
// que la PdG.Esp compartida de los hechizos de área). Devuelve false si no se pudo avisar (sin mapa abierto).
function colocarZonaDeHab(it, xSp, xNitros){
  const c = dueloDe(it);
  if(!c || typeof c !== 'object' || c.objetivo !== 'zona') return false;
  if(window.parent === window || !fichaVivo || !fichaVivo.id) return false;
  const stat = c.tira || '';
  let resistValor = null;
  if(stat){
    const r = Combatiente.tirarStat(compute().final[stat], S.efectos, stat);
    if(r){
      resistValor = r.total;
      registrarTirada(`${it.nombre} · ${STAT_LABEL[stat] || stat}`, r);
    }
  }
  try{
    // El mensaje lo arma la regla común (comun/combatiente.js, zonaDeHab), el mismo que manda un creep.
    const zona = Combatiente.zonaDeHab(it, c, {fichaId: fichaVivo.id, tipo: 'pj', X: xDeHab(it, xSp, xNitros), resistValor});
    MensajesMapa.alMapa(zona.tipo, zona);
    return true;
  }catch(err){ console.error('No se pudo avisar la zona al mapa:', err); return false; }
}
// Alcance en casilleros de un ataque: cuerpo a cuerpo = 1 + el Alcance del arma (su bono `rng`); arma de rango = su Rango.
function alcanceDeArma(arma){
  if(arma && arma.armaDeRango){ const v = statParaArma('rng', arma); return Number.isNaN(v) ? 0 : Math.max(1, Math.round(v)); }
  const bono = arma ? (arma.mods || []).filter(m => m.stat === 'rng').reduce((a, m) => a + num(m.val), 0) : 0;
  return 1 + Math.max(0, Math.round(bono));
}
// Alcance de una habilidad según lo que configuró el 🎯: 'casteo' (Rango de casteo), 'rango' (Rango), 'adyacente' (1), un número, o sin límite (0 = no resalta).
// Hasta dónde llega: la regla común (comun/combatiente.js), con el Rango y el Rango de casteo del personaje.
function alcanceDeHab(c, statTira){ return Combatiente.alcanceHab(c, statTira, s => compute().final[s]); }
function habDueloDe(it, xSp, xNitros){
  if(typeof Duelo === 'undefined' || !Duelo.disponible() || !fichaVivo || !fichaVivo.id || fichaVivo.soloLectura || fichaVivo.editaGM) return null;
  return habDueloDatos(it, xSp, xNitros);
}
// Lo mismo que habDueloDe pero sin pedir que el duelo esté conectado (lo usa el atajo de «solo sobre vos, sin tiradas»).
// La Ejecución para el cuadro del duelo: la regla común (comun/combatiente.js, habEjecucion), la misma de invocaciones y
// creeps. La X ya se eligió al pagar el costo variable (confirmarCostoVariable): daño por X, tirada personalizada y
// textos a mano llegan con la X ya sustituida.
function habDueloDatos(it, xSp, xNitros){
  return Combatiente.habEjecucion(it, dueloDe(it), {stat: s => compute().final[s], etq: s => STAT_LABEL[s] || s, X: xDeHab(it, xSp, xNitros)});
}
// Resumen de una ejecución paso a paso, en una línea (para el editor y la tarjeta).
function resumenEjecucionHab(c){
  if(!c || typeof c !== 'object') return '';
  if(c.modo === 'arma') return 'ataque con tu arma';
  if(c.modo === 'flash') return 'flash';
  const OBJ = {enemigo: 'a un enemigo', aliado: 'a un aliado', 'uno mismo': 'sobre vos', area: 'en un área', onda: 'onda alrededor tuyo', zona: 'zona persistente'};
  const tira = c.tiraFormula ? (c.tiraEtiqueta || 'tirada propia') : c.tira ? (STAT_LABEL[c.tira] || c.tira) : '';
  const partes = [OBJ[c.objetivo] || c.objetivo || 'a un enemigo'];
  if(tira) partes.push(`tira ${tira}${(c.contra || []).length ? ' contra ' + c.contra.map(s => STAT_LABEL[s] || s).join('/') : ''}`);
  if(c.dano) partes.push('hace daño');
  if((c.efectos || []).length) partes.push(c.efectos.map(e => e.nombre || (e.cura ? 'cura' : 'efecto')).join(', '));
  return partes.join(' · ');
}
// Abre el cuadro que arma la ejecución paso a paso de una habilidad (comun/asistente-duelo-hab.js). Guardarla la deja
// en ✨ Automático; sacarla la deja en 💰 Semiautomático.
function abrirEjecucionHab(it, alTerminar){
  AsistenteDueloHab.abrir({nombre: it.nombre || 'Habilidad', inicial: dueloDe(it) || null, siempreActivo: true, tieneFormula: !!String(it.tiradaExtra || '').trim(), costoVariable: spVariable(it) ? 'sp' : nitrosVariable(it) ? 'nitros' : '',
    costoInicial: {sp: it.costo, nitrosCosto: it.nitrosCosto, hpCosto: it.hpCosto, turnoAjenoSp: it.turnoAjenoSp}, elegirEstado: elegirEstadoDuelo,
    alGuardar: r => {
      if(r){ it.duelo = r.duelo; it.costo = r.costo.sp; it.nitrosCosto = r.costo.nitrosCosto; it.hpCosto = r.costo.hpCosto; it.turnoAjenoSp = r.costo.turnoAjenoSp || ''; it.modo = 'auto'; it.automatizada = true; }
      else{
        if(it.habClaseId && (function(){ const base = CLASES_SKILLS.flatMap(c => c.habilidades).find(h => h.id === it.habClaseId); return base && base.duelo; })()) it.duelo = null;
        else delete it.duelo;
        if(modoHab(it) === 'auto' || it.modo === 'auto') it.modo = 'semi';
      }
      if(alTerminar) alTerminar(r);
    }});
}
// ✨ Automática, solo sobre uno mismo y sin tiradas (Blindaje y parecidos): se aplica directo, sin abrir el cuadro, y se anuncia
// en la Mesa con lo que pasó. Devuelve false si no es ese caso (entonces sigue el cuadro de siempre).
function aplicarHabSobreMiDirecto(it, h){
  if(!Combatiente.sobreSiSinTiradas(h) || !fichaVivo || !fichaVivo.id || fichaVivo.soloLectura) return false;
  const d = {defensor: {tipo: 'pj', ref: fichaVivo && fichaVivo.id}, atacante: {nombre: (S.meta && S.meta.nombre) || 'Personaje'}};
  const hechos = (h.efectos || []).map(ef => { const r = dueloAplicarEfectoPropio(d, ef); return r && !r.manual && r.nota ? r.nota : `${ef.nombre || 'Efecto'}: a mano`; });
  const texto = [it.detalle || it.efectoDetalle || '', hechos.length ? '→ ' + hechos.join(' · ') : '', h.efectoLibre || '', h.efectosNota || ''].filter(Boolean).join(' ');
  mesaPublicarHabilidad(it.nombre, texto);
  renderList('efectos'); renderVitals();
  return true;
}
function lanzarDueloDeHab(it, hab){
  if(!hab) return false;
  Duelo.elegirObjetivo({yo: {ref: fichaVivo.id, tipo: 'pj', nombre: (S.meta && S.meta.nombre) || 'Personaje'}, ataque: {tipo: 'habilidad', hab, alcance: hab.alcance}, suelto: () => tirarPrimeraDeHab(it)});
  return true;
}

function tirarPrimeraDeHab(it){
  if(habStatTirable(it)){
    tirarValorStat(`${it.nombre} · ${STAT_LABEL[it.tiradaStat]}`, compute().final[it.tiradaStat] + num(it.tiradaBono), it.tiradaStat);   // tiradaBono: bono fijo de la habilidad al stat (ej. Takle: +1 PdG)
    return true;
  }
  const formula = (it.tiradaExtra || '').trim();
  if(formula){
    const r = tirarDados(formula);
    if(r){ registrarTirada(it.nombre, r); return true; }
  }
  return false;
}
function tirarSegundaDeHab(id){
  const it = S.habilidades.find(h => h.id === id);
  if(!it) return;
  const r = tirarDados((it.tiradaExtra || '').trim());
  if(r) registrarTirada(`${it.nombre} · Efecto`, r);
  else toast('La fórmula de la habilidad no es válida');
}
const botonSegundaHab = it => habTieneSegundaTirada(it)
  ? `<button type="button" class="mini" data-danohab="${esc(it.id)}" title="Segunda tirada de la habilidad (daño o efecto): ${esc(String(it.tiradaExtra).trim())}">🎲 ${esc(String(it.tiradaExtra).trim())}</button>` : '';

function restaurarSpDeConsumo(it){
  const pct = num(it.curaspPct);
  if(pct <= 0) return 0;
  const restaurar = Math.ceil(spMaximo() * Math.min(pct, 100) / 100);
  S.spGastado = Math.max(0, num(S.spGastado) - restaurar);
  return restaurar;
}

// Nitros que cuesta consumir un ítem según de dónde sale.
/* ---------- Moneda Re-Roll (2026-09-27, regla del dueño; docs/reroll.md) ----------
   Con una Moneda Re-Roll equipada (cinturón o mochila) se puede volver a hacer CUALQUIER tirada tuya, sin costo de No2: se abre una ventana con tus últimas tiradas y elegís
   cuál repetir («una moneda por tirada»: cada tirada solo se puede re-rolear una vez — la que sale de repetirla es una tirada nueva, que se puede re-rolear de nuevo con otra
   moneda). Después de usarla se tira una moneda: par (2) se conserva, impar (1) se rompe (gasta una unidad, como cualquier consumible). Botón 🪙 fijo en el mapa (jugadores) y
   en la cabecera de la Botonera; en el duelo, el botón flotante 🪙 reabre la última tirada tuya del duelo (docs/duelo-de-habilidades.md). */
const esMonedaReroll = i => !!i && !!(i.rerollMoneda || /moneda re-?roll/i.test(String(i.nombre || '')));
function monedaReroll(){
  const enC = S.cinturon.find(i => esMonedaReroll(i) && num(i.unidades) > 0);
  if(enC) return {key: 'cinturon', it: enC};
  const enM = S.inventario.find(i => esMonedaReroll(i) && num(i.unidades) > 0 && !i.enMesa);
  return enM ? {key: 'inventario', it: enM} : null;
}
// Tira la moneda: par se conserva, impar se rompe.
function tirarMonedaReroll(m){
  const r = tirarDados('1d2');   // 2 = par (se conserva) · 1 = impar (se rompe)
  const par = r.total % 2 === 0;
  registrarTirada(`🪙 Moneda Re-Roll · ${par ? 'par: se conserva' : 'impar: se rompe'}`, r);
  if(!par){
    m.it.unidades = num(m.it.unidades) - 1;
    purgarSiAgotado(m.key, m.it.id);
    if(m.key === 'inventario') renderInventario(); else renderList('cinturon');
    toast(`🪙 La moneda se rompió (impar)${num(m.it.unidades) > 0 ? '' : ': era la última'}`);
  }else toast('🪙 La moneda se conserva (par)');
  refresh();
  return !par;
}
// Vuelve a tirar los mismos dados de una tirada anterior (con sus mismos bonos y mitades). `u` es una entrada de dadosHistorial.
function repetirTirada(u){
  const mit = (String(u.formula || '').match(/÷2/g) || []).length;
  const base = String(u.formula || '').replace(/÷2/g, '').replace(/\+\s*\d+\s*⚡/g, '');
  const p = typeof parseDados === 'function' ? parseDados(base) : null;
  if(!p || !p.dados.length){ toast('No se puede repetir esa tirada'); return false; }
  const rolls = [];
  p.dados.forEach(g => { for(let k = 0; k < g.n; k++) rolls.push(1 + Math.floor(Math.random() * g.caras)); });
  const total = aplicarMitades(rolls.reduce((a, b) => a + b, 0) + num(u.mod), mit);
  registrarTirada(`${String(u.origen).replace(/ \(re-roll\)$/, '')} (re-roll)`, {formula: u.formula, rolls, mod: u.mod, total, estados: u.estados});
  return true;
}
let rerollUsados = new Set();   // ids de dadosHistorial que ya usaron su moneda (una por tirada; no se guarda, es de esta sesión)
function renderReroll(){
  const m = monedaReroll();
  const lista = dadosHistorial.filter(h => !/^🪙 Moneda Re-Roll/.test(String(h.origen)));
  $('#reroll-aviso').innerHTML = m
    ? `Tenés una Moneda Re-Roll en <b>${m.key === 'cinturon' ? 'el cinturón' : 'la mochila'}</b>. Elegí qué tirada repetir: no cuesta No2, pero después se tira la moneda (par se conserva, impar se rompe).`
    : `No tenés una Moneda Re-Roll equipada (cinturón o mochila). Podés ver tus últimas tiradas igual.`;
  $('#reroll-lista').innerHTML = lista.length ? lista.map(h => {
    const usada = rerollUsados.has(h.rerollId);
    return `<div class="item"><div class="ihead"><div><div class="iname">${esc(h.origen)}</div><div class="idesc">${esc(h.formula || '')}${h.rolls && h.rolls.length ? ' → ' + h.rolls.join(' + ') : ''}${num(h.mod) ? ' ' + (num(h.mod) > 0 ? '+' : '−') + ' ' + Math.abs(num(h.mod)) : ''} = <b>${fmt(num(h.total))}</b></div></div>
      ${usada ? '<span class="tag">ya usó su re-roll</span>' : `<button type="button" class="mini" data-rerollpick="${h.rerollId}"${m ? '' : ' disabled'}>🪙 Re-roll</button>`}</div></div>`;
  }).join('') : '<div class="hint">Todavía no hiciste ninguna tirada.</div>';
}
function abrirReroll(){
  renderReroll();
  $('#scrim-reroll').classList.add('open');
}
$('#reroll-x').onclick = () => $('#scrim-reroll').classList.remove('open');
$('#scrim-reroll').addEventListener('mousedown', e => { if(e.target.id === 'scrim-reroll') $('#scrim-reroll').classList.remove('open'); });
$('#reroll-lista').addEventListener('click', e => {
  const b = e.target.closest('[data-rerollpick]');
  if(!b) return;
  const id = Number(b.dataset.rerollpick);
  const h = dadosHistorial.find(x => x.rerollId === id);
  const m = monedaReroll();
  if(!h || !m || rerollUsados.has(id)) return;
  rerollUsados.add(id);
  if(!repetirTirada(h)) return;
  setTimeout(() => tirarMonedaReroll(m), 900);
  renderReroll();
});
// Botón 🪙 (Botonera y mapa): abre la ventana de re-roll.
function rerollFuera(){ abrirReroll(); }

function costoConsumirNitros(key){
  return key === 'cinturon' ? IT2.nitrosConsumirCinturon : IT2.nitrosConsumirMochila;
}

// conLupa: en la Botonera la 🔍 va dentro del botón (sin "disabled", que no deja abrirla).
function consumeButton(i, key, conLupa){
  if(!i.consumible) return '';
  if(i.nombre === 'Ankh de Reencarnación'){
    if(key === 'cinturon') return `<span class="hint">Se activa solo al llegar tu HP a 0</span>`;
    return `<button class="consume-btn" data-consumirankh="${key}:${i.id}" ${num(i.unidades)<=0?'disabled':''}>
      Consumir <span class="consume-fx">(revive con 25% del HP máx.)</span>
    </button>
    <span class="hint">En la mochila no se activa solo — usalo a mano para el caso de un aliado a distancia cero.</span>`;
  }
  const partes = [];
  if(i.trampaDatos) partes.push('🪤 se coloca en el mapa');
  if(i.curahp) partes.push(`${num(i.curahp)>0?'+':''}${fmt(num(i.curahp))} HP`);
  if(num(i.curaspPct) > 0) partes.push(`${fmt(num(i.curaspPct))}% SP`);
  partes.push(`-${costoConsumirNitros(key)} No2`);
  const agotado = num(i.unidades) <= 0;
  if(conLupa){
    return `<button class="consume-btn con-lupa${agotado ? " sin-recursos" : ""}" data-consume="${i.id}"${agotado ? ' aria-disabled="true"' : ""}>
      Consumir <span class="consume-fx">(${partes.join(" · ")})</span>${lupaBotonHtml(`cons:${key}:${i.id}`, "en-boton")}
    </button>`;
  }
  return `<button class="consume-btn" data-consume="${i.id}" ${agotado?"disabled":""}>
    Consumir <span class="consume-fx">(${partes.join(" · ")})</span>
  </button>`;
}

function priceTags(i){
  const c = num(i.precioCompra), v = precioVentaDe(i);
  let out = '';
  if(c) out += `<span class="tag price buy">compra ${fmt(c)}</span>`;
  if(v) out += `<span class="tag price sell">venta ${fmt(v)}</span>`;
  return out;
}

function precioVentaDe(i){
  return Math.round((num(i.precioCompra) / 2) * 100) / 100;
}

function armaDanoTxt(i, extra){
  if(!ES_ARMA(i.tipoItem)) return '';
  const dados = Math.max(1, num(i.peso) || 1) + Math.max(0, num(i.danoAmplificado));
  const tipo = num(i.tipoDado) || 8;
  const fijo = num(i.danoFijo) + (i.armaDeRango ? 0 : num(extra));
  return `${dados}d${tipo}${fijo ? ` + ${fmt(fijo)}` : ''}`;
}

