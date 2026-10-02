// js/02-editar-creep-y-recompensas.js — tramo 2 de 12 del script de gm-tools.html (paso 5, nivel A: mismo código, en el mismo orden).
/* ---------- Editar creep: la ficha completa en una ventana ---------- */
let editandoCreepId = null;

function renderEditarCreep(){
  const sc = S.creeps.find(s => s.id === editandoCreepId);
  if(!sc){ cerrarEditarCreep(); return; }
  // Redibujar no tiene que mover la ventana ni sacar el foco de lo que se escribe.
  const scrim = $('#scrim-editar-creep');
  const scroll = scrim.scrollTop;
  const activo = document.activeElement;
  const cuerpo = $('#editar-creep-body');
  const clave = activo && cuerpo.contains(activo) ? [...activo.attributes].filter(a => a.name.startsWith('data-')).map(a => `[${a.name}="${CSS.escape(a.value)}"]`).join('') : '';
  cuerpo.innerHTML = cardHtml(sc);
  scrim.scrollTop = scroll;
  if(clave){
    const nuevo = cuerpo.querySelector(clave);
    if(nuevo) nuevo.focus();
  }
}

function abrirEditarCreep(scId){
  editandoCreepId = scId;
  renderEditarCreep();
  $('#scrim-editar-creep').scrollTop = 0;
  $('#scrim-editar-creep').classList.add('open');
}

function cerrarEditarCreep(){
  editandoCreepId = null;
  $('#scrim-editar-creep').classList.remove('open');
  $('#editar-creep-body').innerHTML = '';
  if(verCreepBib && verCreepBib.editando) volverAVerCreepBib();   // se estaba editando la copia de un creep de la biblioteca
}

/* =========================================================
   Recompensas del creep: oro, arma natural y trofeo
   ========================================================= */
// Las reglas de recompensas viven en comun/creep-calculo.js (2026-10-02, A6a): acá quedan los nombres de siempre.
const TIPOS_CRIATURA = CreepCalculo.TIPOS_CRIATURA;
const TIPOS_CON_ARMA_NATURAL = CreepCalculo.TIPOS_CON_ARMA_NATURAL;
const TROFEO_PRECIO_NIVEL = CreepCalculo.TROFEO_PRECIO_NIVEL;
const AYUDA_ORO = 'Cuánto oro (doblones del espacio) suelta este creep al morir.\nSugerido: humanos 15 / 40 / 75 / 120 / 175 (nivel 1 a 5); humanoides la mitad (10 / 20 / 40 / 60 / 90); jefes el doble; el resto 0.\nAl finalizar el combate se tira una variación al azar de ±20% y el GM puede ajustar el total antes de repartirlo.';
const AYUDA_NATURAL = 'Marcala si el arma es parte del cuerpo (colmillo, garra, puño, tentáculo).\nUn arma natural no se puede equipar: al morir el creep suelta un TROFEO (que se guarda en la mochila y se vende o se convierte en despojos).\nSin marcar, el arma es un objeto y se suelta como ítem equipable.';
const AYUDA_TROFEO = 'Es opcional: solo para cambiar lo automático.\nSi el creep tiene arma natural, ya suelta un trofeo con el nombre de su arma y un valor según su nivel (16 / 30 / 50 / 75 / 110; jefes el doble).\nUsalo cuando quieras algo único: un dragón que deja «Escama de ceniza» por 400 en vez de sus colmillos. Vacío = el automático.';

function nombreLimpioCreep(sc){ return CreepCalculo.nombreLimpio(sc); }
function tipoDeCreep(sc){ return CreepCalculo.tipoDe(sc); }
function oroSugeridoCreep(sc){ return CreepCalculo.oroSugerido(sc); }
function trofeoPrecioAuto(sc){ return CreepCalculo.trofeoPrecioAuto(sc); }
function trofeoDeCreep(sc){ return CreepCalculo.trofeo(sc); }   // el trofeo que suelta al morir (o null)
function despojosDePrecio(precioCompra){ return CreepCalculo.despojosDePrecio(precioCompra); }
function dropsResumenCreep(sc){ return CreepCalculo.dropsResumen(sc); }
function ayudaQ(txt){ return `<span class="ayuda-q con-tip" data-tip="${esc(txt)}">?</span>`; }

function recompensasHtml(sc){
  const t = sc.tipoCriatura || '';
  const sug = oroSugeridoCreep(sc);
  const esp = sc.trofeoEspecial || {};
  return `
    <div class="editar-separador"><span>Recompensas</span></div>
    <div class="row3" style="grid-template-columns:1fr 1fr">
      <div class="mini-f"><label>Tipo de criatura</label>
        <select data-rec="tipoCriatura" data-id="${sc.id}">
          <option value="">(sin definir)</option>
          ${TIPOS_CRIATURA.map(x => `<option value="${x}"${t === x ? ' selected' : ''}>${x}</option>`).join('')}
          <option value="otros"${t === 'otros' ? ' selected' : ''}>otros…</option>
        </select>
        ${t === 'otros' ? `<input type="text" data-rec="tipoCriaturaOtro" data-id="${sc.id}" value="${esc(sc.tipoCriaturaOtro || '')}" placeholder="¿Qué tipo es?" maxlength="30" style="margin-top:4px">` : ''}
      </div>
      <div class="mini-f"><label>¿Es jefe?</label>
        <label style="display:flex;gap:6px;align-items:center;font-size:12.5px"><input type="checkbox" data-rec="jefe" data-id="${sc.id}"${sc.jefe ? ' checked' : ''}> Jefe (doble oro y trofeo; protección: inmune a Stun y +1 Res.Esp)</label>
      </div>
    </div>
    <div class="mini-f" style="margin-top:8px"><label>Oro que carga (DDE) ${ayudaQ(AYUDA_ORO)}</label>
      <div style="display:flex;gap:6px;align-items:center">
        <input type="number" min="0" step="5" data-rec="oroBase" data-id="${sc.id}" value="${fmt(num(sc.oroBase))}" style="width:110px">
        <button type="button" class="addhab" data-oro-sugerido="${sc.id}" style="margin:0">Usar el sugerido (${fmt(sug)})</button>
      </div>
    </div>
    <div class="mini-f" style="margin-top:8px">
      <label style="display:flex;gap:6px;align-items:center;font-size:12.5px;text-transform:none;letter-spacing:0"><input type="checkbox" data-rec="armaNatural" data-id="${sc.id}"${sc.armaNatural ? ' checked' : ''}> El arma es parte del cuerpo (arma natural) ${ayudaQ(AYUDA_NATURAL)}</label>
    </div>
    <div class="mini-f" style="margin-top:8px"><label>Trofeo especial (opcional) ${ayudaQ(AYUDA_TROFEO)}</label>
      <div style="display:flex;gap:6px">
        <input type="text" data-rec="trofeoNombre" data-id="${sc.id}" value="${esc(esp.nombre || '')}" placeholder="Nombre (vacío = automático)" maxlength="60" style="flex:1">
        <input type="number" min="0" data-rec="trofeoPrecio" data-id="${sc.id}" value="${num(esp.precio) > 0 ? num(esp.precio) : ''}" placeholder="Valor de compra" style="width:120px">
      </div>
    </div>
    <div class="hint" style="margin-top:6px"><b>Al morir suelta:</b> ${esc(dropsResumenCreep(sc))}</div>`;
}
function recompensasVerHtml(sc){ return CreepLupa.recompensasVerHtml(sc); }   // comun/creep-lupa.js

document.addEventListener('change', e => {
  const t = e.target;
  if(t.dataset.rec === undefined || !t.dataset.id) return;
  const sc = S.creeps.find(s => s.id === t.dataset.id);
  if(!sc) return;
  const campo = t.dataset.rec;
  const sugPrevio = oroSugeridoCreep(sc);
  const seguirSugerido = () => { if(!num(sc.oroBase) || num(sc.oroBase) === sugPrevio) sc.oroBase = oroSugeridoCreep(sc); };
  if(campo === 'tipoCriatura'){
    sc.tipoCriatura = t.value;
    sc.armaNatural = TIPOS_CON_ARMA_NATURAL.includes(t.value);   // valor sugerido por tipo; se puede cambiar
    seguirSugerido();
  }else if(campo === 'tipoCriaturaOtro'){ sc.tipoCriaturaOtro = t.value; }
  else if(campo === 'jefe'){ sc.jefe = t.checked; seguirSugerido(); }
  else if(campo === 'oroBase'){ sc.oroBase = Math.max(0, num(t.value)); }
  else if(campo === 'armaNatural'){ sc.armaNatural = t.checked; }
  else if(campo === 'trofeoNombre'){ sc.trofeoEspecial = {...(sc.trofeoEspecial || {}), nombre: t.value.trim()}; }
  else if(campo === 'trofeoPrecio'){ sc.trofeoEspecial = {...(sc.trofeoEspecial || {}), precio: Math.max(0, num(t.value))}; }
  renderAll();
});
document.addEventListener('click', e => {
  const b = e.target.closest('[data-oro-sugerido]');
  if(!b) return;
  const sc = S.creeps.find(s => s.id === b.dataset.oroSugerido);
  if(!sc) return;
  sc.oroBase = oroSugeridoCreep(sc);
  renderAll();
});

/* =========================================================
   Asistente paso a paso para crear o editar un creep entero
   Trabaja sobre el creep real: "crear" lo agrega al empezar y lo quita si se cancela.
   ========================================================= */
const ASIST_PASOS = ['Qué es', 'Atributos', 'Arma', 'Armadura', 'Habilidades', 'Recompensas', 'Resumen'];
const ROLES_CREEP = {brutal: 'Brutal (pega fuerte)', tanque: 'Tanque (aguanta)', rapido: 'Rápido (asalto)', rango: 'A distancia', mago: 'Mago', apoyo: 'Apoyo', debuffer: 'Debuffer (maldiciones)'};
const PESOS_ROL = {brutal: [.26, .30, .14, .16, .14], tanque: [.36, .26, .10, .12, .16], rapido: [.16, .18, .30, .24, .12],
  rango: [.18, .10, .24, .32, .16], mago: [.20, .08, .16, .16, .40], apoyo: [.24, .10, .16, .14, .36], debuffer: [.22, .08, .18, .14, .38]};
const RAREZA_ARMA = ['Común', 'Común', 'Común (o Buena Calidad)', 'Buena Calidad', 'Buena Calidad (o Raro)'];
const RAREZA_ARMADURA = ['ninguna (opcional)', 'Común', 'Buena Calidad (o Común)', 'Buena Calidad', 'Raro (o Buena Calidad)'];
let asist = null;   // {id, paso, nuevo, rol}
function asistCreepAbierto(){ try{ return !!asist; }catch(e){ return false; } }

function repartirAtributos(total, pesos){
  const v = pesos.map(p => Math.max(1, Math.floor(total * p)));
  let resto = total - v.reduce((a, b) => a + b, 0);
  const orden = pesos.map((p, i) => [p, i]).sort((a, b) => b[0] - a[0]).map(x => x[1]);
  for(let k = 0; resto > 0; k++, resto--) v[orden[k % orden.length]]++;
  return v;
}
function cambiarAtributoBase(sc, id, valor){
  const agl = id === 'agl' && sc.nitros !== null && sc.nitros !== undefined ? {full: num(sc.nitros) >= creepNitrosMax(sc)} : null;
  sc[id] = Math.max(1, Math.round(num(valor)) || 1);
  if(id === 'con') actualizarHpMaxPorCon(sc);
  if(agl) actualizarNo2PorAgl(sc, agl);
}
function abrirAsistenteCreep(scId){
  let nuevo = false;
  if(!scId){
    const sc = nuevoCreep();
    sc.nombre = 'Creep nuevo';
    sc.mapa = mapaParaNuevo();
    S.creeps.push(sc);
    scId = sc.id;
    nuevo = true;
    renderAll();
  }
  asist = {id: scId, paso: 0, nuevo, rol: 'brutal'};
  $('#scrim-asistente-creep').classList.add('open');
  renderAsistenteCreep();
}
function cerrarAsistenteCreep(cancelar){
  if(!asist) return;
  if(cancelar && asist.nuevo){
    S.creeps = S.creeps.filter(s => s.id !== asist.id);   // el creep no se llegó a terminar
  }
  asist = null;
  $('#scrim-asistente-creep').classList.remove('open');
  renderAll();
}
function renderAsistenteCreep(){
  if(!asist) return;
  const sc = S.creeps.find(s => s.id === asist.id);
  if(!sc){ cerrarAsistenteCreep(false); return; }
  const modal = $('#asistente-creep-body');
  const scroll = $('#scrim-asistente-creep').scrollTop;
  const n = Math.max(1, Math.round(num(sc.nivel)) || 1);
  const p = asist.paso;
  const campo = (et, html, ayuda) => `<div class="mini-f" style="margin-bottom:12px"><label>${et}</label>${html}${ayuda ? `<div class="hint" style="margin-top:4px">${ayuda}</div>` : ''}</div>`;
  let h = '';
  if(p === 0){
    const t = sc.tipoCriatura || '';
    h = campo('Nombre', `<input type="text" data-ac-campo="nombre" value="${esc(sc.nombre)}" maxlength="60">`)
      + `<div style="display:flex;gap:12px">${campo('Nivel', `<input type="number" min="1" max="30" data-ac-campo="nivel" value="${n}" style="width:90px">`)}
          ${campo('Color', `<input type="color" data-ac-campo="color" value="${esc(sc.color || '#B87333')}" style="width:60px;height:34px;padding:2px">`)}</div>`
      + campo('Tipo de criatura', `<select data-rec="tipoCriatura" data-id="${sc.id}">
          <option value="">(elegí uno)</option>${TIPOS_CRIATURA.map(x => `<option value="${x}"${t === x ? ' selected' : ''}>${x}</option>`).join('')}
          <option value="otros"${t === 'otros' ? ' selected' : ''}>Otros…</option></select>
          ${t === 'otros' ? `<input type="text" data-rec="tipoCriaturaOtro" data-id="${sc.id}" value="${esc(sc.tipoCriaturaOtro || '')}" placeholder="Escribí qué tipo es" maxlength="30" style="margin-top:6px">` : ''}`,
          'Define cuánto oro se sugiere y si el arma es natural por defecto (podés cambiar ambas cosas después).')
      + campo('¿Es un jefe?', `<label style="display:flex;gap:6px;align-items:center"><input type="checkbox" data-rec="jefe" data-id="${sc.id}"${sc.jefe ? ' checked' : ''}> Sí: deja el doble de oro y de trofeo, es inmune a Stun y tiene +1 Res.Esp (protección de jefe)</label>`)
      + campo('Imagen (opcional)', `<button type="button" class="addhab" data-ac-img="1" style="margin:0">${sc.imagen ? 'Cambiar imagen' : '+ Elegir imagen'}</button>
          <input type="file" data-imginput="${sc.id}" accept="image/*" hidden>`)
      + campo('Nota (opcional)', `<textarea rows="3" data-ac-campo="notas" maxlength="600" style="width:100%">${esc(sc.notas || '')}</textarea>`);
  }else if(p === 1){
    const b = attrBudgetCreep(sc);
    h = `<p class="hint" style="margin:0 0 10px">Elegí un <b>rol</b> y cargá el preset para el nivel ${n}: reparte solo los <b>${fmt(b.total)}</b> puntos (33 + 3 por nivel). Después ajustás lo que quieras: el presupuesto es una guía, solo avisa.</p>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <select data-ac-rol="1">${Object.entries(ROLES_CREEP).map(([k, v]) => `<option value="${k}"${asist.rol === k ? ' selected' : ''}>${v}</option>`).join('')}</select>
        <button type="button" class="addhab" data-ac-preset="1" style="margin:0">Cargar preset</button>
      </div>
      <div class="row5" style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px">${ATTR_IDS.map(a => `<div class="mini-f"><label>${ATTR_LABELS[a]}</label><input type="number" min="1" data-ac-attr="${a}" value="${num(sc[a])}"></div>`).join('')}</div>
      <div class="hint" style="margin-top:8px" id="ac-derivados"></div>
      <div class="hint" style="margin-top:4px" id="ac-presupuesto" style="${attrBudgetStyle(sc)}"></div>`;
  }else if(p === 2){
    h = `<p class="hint" style="margin:0 0 10px">Rareza sugerida para el nivel ${n}: <b>${RAREZA_ARMA[Math.min(n, 5) - 1]}</b>.</p>
      <div class="arma-compacta"><div class="arma-compacta-top"><span class="equipado-nombre">${sc.armaNombre ? esc(sc.armaNombre) : '<span class="hint">Sin arma</span>'}</span><span class="valor-caja">${danoTxt(sc)}</span></div>
        <div class="arma-detalle">${sc.armaDetalle ? esc(sc.armaDetalle) : 'Sin efecto.'}</div></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin:10px 0">
        <button type="button" class="addhab" data-editararma="${sc.id}" style="margin:0">✎ Crear o editar el arma (paso a paso)</button>
        <button type="button" class="addhab" data-equipardelfabricante="${sc.id}" style="margin:0">⚔ Elegir del fabricante</button>
        <button type="button" class="addhab" data-armanat="${sc.id}" style="margin:0">🐾 Arma natural del catálogo</button>
      </div>
      ${campo('¿El arma es parte del cuerpo?', `<label style="display:flex;gap:6px;align-items:center"><input type="checkbox" data-rec="armaNatural" data-id="${sc.id}"${sc.armaNatural ? ' checked' : ''}> Arma natural (colmillo, garra, puño…) ${ayudaQ(AYUDA_NATURAL)}</label>`,
          'Si es natural, al morir suelta un trofeo en vez del arma y ningún jugador la puede equipar.')}`;
  }else if(p === 3){
    h = `<p class="hint" style="margin:0 0 10px">Rareza sugerida para el nivel ${n}: <b>${RAREZA_ARMADURA[Math.min(n, 5) - 1]}</b>. Defensa total: <b>${fmt(num(sc.defensa))}</b>.</p>
      <div class="equipo-list">${sc.equipo.length ? sc.equipo.map(it => `<div class="equipo-item"><div class="equipo-item-info"><div class="equipo-item-top">
        <span class="equipado-nombre">${esc(it.nombre)}</span><span class="valor-caja"><small>DEF</small>+${fmt(num(it.def))}</span>
        <button class="rm" data-verequipocreep="${sc.id}:${it.id}" title="Ver la pieza (y editarla y subirla al catálogo)">👁</button>
        <button class="rm" data-quitarequipo="${sc.id}:${it.id}" title="Quitar">×</button></div>
        <div class="equipo-item-meta">${esc(TIPOITEM_LABEL_GM[it.tipoItem] || it.tipoItem)}</div></div></div>`).join('') : '<div class="hint">Sin armadura.</div>'}</div>
      <button type="button" class="addhab" data-equipardelfabricante="${sc.id}" style="margin-top:8px">⚔ Equipar del fabricante</button>`;
  }else if(p === 4){
    h = `<p class="hint" style="margin:0 0 10px">Podés crear una habilidad <b>custom</b> con el asistente. Se sugiere <b>una rápida (cooldown 2) y una lenta</b> (cooldown 3 a 6, arranca en cooldown). Un pool de habilidades prediseñadas queda para más adelante.</p>
      <div class="hab-list">${sc.habilidades.length ? sc.habilidades.map(x => `<div class="equipo-item"><div class="equipo-item-top">
        <span class="equipado-nombre">${esc(x.nombre || '(sin nombre)')}</span><span class="hint">${esc(costoHabCreepTxt(sc, x))}${num(x.cd) > 0 ? ` · CD ${fmt(num(x.cd))}` : ''}${x.cdArranca ? ' · lenta' : ''}</span>
        <button class="rm" data-edithab="${sc.id}:${x.id}" title="Editar">✎</button><button class="rm" data-rmhab="${sc.id}:${x.id}">×</button></div></div>`).join('') : '<div class="hint">Sin habilidades.</div>'}</div>
      <button type="button" class="addhab" data-addhab="${sc.id}" style="margin-top:8px">+ Habilidad custom</button>`;
  }else if(p === 5){
    const xp = xpBasePorNivel(n);
    h = `<p class="hint" style="margin:0 0 10px">Lo que suelta este creep cuando lo derrotan. La XP que da es <b>${fmt(xp)}</b> (sale del nivel; no se edita acá).</p>${recompensasHtml(sc).replace(/<div class="editar-separador">.*?<\/div>/s, '')}`;
  }else{
    h = `<p class="hint" style="margin:0 0 10px">Revisá cómo quedó. Todo se puede volver a cambiar desde cualquier paso.</p>
      <div class="vc-cajas vc-2">
        <div class="vc-caja"><span class="vc-caja-label">HP</span><span class="vc-caja-valor">${fmt(num(sc.hpMax))}</span></div>
        <div class="vc-caja"><span class="vc-caja-label">No2</span><span class="vc-caja-valor">${fmt(creepNitrosMax(sc))}</span></div>
        <div class="vc-caja"><span class="vc-caja-label">Ataque</span><span class="vc-caja-valor">${esc(ataqueCreepTxt(sc))}</span></div>
        <div class="vc-caja"><span class="vc-caja-label">Defensa</span><span class="vc-caja-valor">${fmt(creepDefensaEfectiva(sc))}</span></div>
      </div>
      <div class="hint" style="margin-top:8px"><b>${esc(nombreLimpioCreep(sc))}</b> · nivel ${n} · ${esc(tipoDeCreep(sc) || 'tipo sin definir')}${sc.jefe ? ' · jefe' : ''} · ${ATTR_IDS.map(a => `${ATTR_LABELS[a]} ${num(sc[a])}`).join(' · ')}</div>
      <div class="hint" style="margin-top:6px"><b>Habilidades:</b> ${esc(sc.habilidades.map(x => x.nombre).join(', ') || 'ninguna')}</div>
      <div class="hint" style="margin-top:6px"><b>Al morir suelta:</b> ${esc(dropsResumenCreep(sc))}</div>
      <div style="margin-top:12px"><button type="button" class="addhab" data-ac-bib="1" style="margin:0">📚 Guardar en la biblioteca (propuesta)</button></div>`;
  }
  const pasos = ASIST_PASOS.map((t, i) => `<button type="button" class="btn${i === p ? ' primary' : ''}" data-ac-paso="${i}" style="padding:4px 9px;font-size:12px">${i + 1}. ${t}</button>`).join('');
  modal.innerHTML = `<header><h3>${asist.nuevo ? 'Crear un creep' : 'Editar creep'} · paso ${p + 1} de ${ASIST_PASOS.length}: ${ASIST_PASOS[p]}</h3><button class="iconbtn" data-ac-cancelar="1">${asist.nuevo ? 'Cancelar' : 'Cerrar'}</button></header>
    <div class="body"><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">${pasos}</div>${h}</div>
    <footer style="display:flex;justify-content:space-between;gap:8px"><button type="button" class="btn ghost" data-ac-nav="atras"${p === 0 ? ' disabled' : ''}>← Atrás</button>
      ${p === ASIST_PASOS.length - 1 ? '<button type="button" class="btn primary" data-ac-listo="1">✔ Listo</button>' : '<button type="button" class="btn primary" data-ac-nav="sig">Siguiente →</button>'}</footer>`;
  $('#scrim-asistente-creep').scrollTop = scroll;
  if(p === 1) actualizarAsistAtributos(sc);
}
function actualizarAsistAtributos(sc){
  const d = $('#ac-derivados'), pres = $('#ac-presupuesto');
  if(d) d.innerHTML = `HP máximo: <b>${fmt(num(sc.hpMax))}</b> · No2: <b>${fmt(creepNitrosMax(sc))}</b>`;
  if(pres){ const b = attrBudgetCreep(sc); pres.innerHTML = `Presupuesto: <b>${fmt(b.usado)}</b> de ${fmt(b.total)}${b.pend < 0 ? ` <span style="color:var(--danger)">(+${fmt(Math.abs(b.pend))} de más: es solo una guía)</span>` : b.pend > 0 ? ` (te sobran ${fmt(b.pend)})` : ''}`; }
}
document.addEventListener('click', e => {
  if(!asist) return;
  const cap = e.target.closest('#scrim-asistente-creep');
  if(!cap) return;
  const sc = S.creeps.find(s => s.id === asist.id);
  const b = e.target.closest('[data-ac-paso],[data-ac-nav],[data-ac-cancelar],[data-ac-listo],[data-ac-preset],[data-ac-img],[data-ac-bib]');
  if(!b || !sc) return;
  if(b.dataset.acPaso !== undefined){ asist.paso = +b.dataset.acPaso; renderAsistenteCreep(); }
  else if(b.dataset.acNav){ asist.paso = Math.max(0, Math.min(ASIST_PASOS.length - 1, asist.paso + (b.dataset.acNav === 'sig' ? 1 : -1))); renderAsistenteCreep(); }
  else if(b.dataset.acCancelar){
    if(asist.nuevo && !confirm('¿Cancelar? El creep que estás armando se descarta.')) return;
    cerrarAsistenteCreep(true);
  }
  else if(b.dataset.acListo){ toast(`${nombreLimpioCreep(sc)} listo`); cerrarAsistenteCreep(false); }
  else if(b.dataset.acPreset){
    const n = Math.max(1, Math.round(num(sc.nivel)) || 1);
    const v = repartirAtributos(33 + 3 * (n - 1), PESOS_ROL[asist.rol]);
    ATTR_IDS.forEach((a, i) => cambiarAtributoBase(sc, a, v[i]));
    renderAll();
  }
  else if(b.dataset.acImg){ cap.querySelector('[data-imginput]')?.click(); }
  else if(b.dataset.acBib){ guardarCreepEnBiblioteca(sc); }
});
document.addEventListener('input', e => {
  if(!asist) return;
  const t = e.target;
  const sc = S.creeps.find(s => s.id === asist.id);
  if(!sc || !t.closest('#scrim-asistente-creep')) return;
  if(t.dataset.acCampo){
    const c = t.dataset.acCampo;
    sc[c] = c === 'nivel' ? Math.max(1, num(t.value)) : t.value;
    if(c === 'nivel') sc.oroBase = num(sc.oroBase) ? sc.oroBase : oroSugeridoCreep(sc);
  }else if(t.dataset.acAttr){
    cambiarAtributoBase(sc, t.dataset.acAttr, t.value);
    actualizarAsistAtributos(sc);
  }
});
document.addEventListener('change', e => {
  if(!asist) return;
  const t = e.target;
  if(t.dataset && t.dataset.acRol !== undefined){ asist.rol = t.value; }
});

document.addEventListener('click', e => {
  const b = e.target.closest('[data-asistente]');
  if(b) abrirAsistenteCreep(b.dataset.asistente);
});

let accionesCreepId = null;

// Los 5 atributos base (entradas con attr apuntando a sí mismas) más los
// stats secundarios derivados de un PJ (Res.Esp/Res.CC de Con, Dmg/
// Potencia de Fue, Eva/Ini/Mov de Agl, Rango/PdG/Crítico/Parry/Percepción
// de Des, PdG.Esp/Res.M/Rango de casteo de Especial), sin agregar una grilla a la ficha
// del creep — se tiran desde acá, en Acciones. El set completo se usa
// también para cálculos internos (formulasCombateCreep, danoTxt, etc.);
// CREEP_STATS_TIRADA_IDS más abajo recorta cuáles se muestran como botón.
const CREEP_DERIVED_STATS = CreepCalculo.DERIVED_STATS;   // comun/creep-calculo.js (paso 4 etapa 4a)

// Mismo criterio que STATS_SIN_TIRADA/STATS_REDUNDANTES_COMBATE en la
// Botonera de la ficha: los 5 atributos base + los secundarios que no
// tienen ya su propio botón en la caja de Combate.
const CREEP_STATS_TIRADA_IDS = CreepCalculo.STATS_TIRADA_IDS;

const CREEP_STAT_LOOKUP = CreepCalculo.STAT_LOOKUP;
function creepStatValor(sc, statId){ return CreepCalculo.statValor(sc, statId); }

