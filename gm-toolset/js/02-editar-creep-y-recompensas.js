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
  encuadrarMiniaturas(cuerpo);   // 🖼 la imagen con su encuadre (js/03)
  scrim.scrollTop = scroll;
  ubicarPieEditarCreep();
  if(clave){
    const nuevo = cuerpo.querySelector(clave);
    if(nuevo) nuevo.focus();
  }
}

/* ✔ Guardar / Cancelar (dueño, 2026-10-30: «en ningún lugar dice guardar, sólo dice cerrar… Debería existir el botón de guardar y cancelar. El cancelar
   debe avisar: tenés cambios sin guardar… idealmente siempre visibles, que queden en una esquina flotando»): lo que se toca se ve al momento (y GM Tools lo
   guarda solo, como siempre); Guardar cierra dejándolo así; Cancelar (y Esc, y el clic afuera) vuelve a como estaba al abrir, preguntando antes si cambió algo. */
let editandoCreepCopia = null;
function abrirEditarCreep(scId){
  editandoCreepId = scId;
  const sc = S.creeps.find(s => s.id === scId);
  editandoCreepCopia = sc ? structuredClone(sc) : null;
  renderEditarCreep();
  $('#scrim-editar-creep').scrollTop = 0;
  $('#scrim-editar-creep').classList.add('open');
  ubicarPieEditarCreep();
}
/* Los botones, adentro de la ventana (dueño, 2026-10-30: «por fuera del menú se pierden… ponelos DENTRO del menú de edición, flotando en su esquina
   inferior derecha»): flotan sobre la pantalla (si no, se irían con el scroll), pero alineados con el borde derecho de la ventana y, cuando se ve su final,
   arriba de su borde de abajo. */
function ubicarPieEditarCreep(){
  const pie = document.querySelector('.editar-creep-pie'), card = $('#editar-creep-body .card') || $('#editar-creep-body');
  if(!pie || !card || !$('#scrim-editar-creep').classList.contains('open')) return;
  const r = card.getBoundingClientRect();
  pie.style.right = Math.max(12, document.documentElement.clientWidth - r.right + 14) + 'px';
  pie.style.bottom = Math.max(14, window.innerHeight - r.bottom + 14) + 'px';
}
$('#scrim-editar-creep').addEventListener('scroll', ubicarPieEditarCreep, {passive: true});
window.addEventListener('resize', ubicarPieEditarCreep);
function editarCreepCambio(){
  const sc = S.creeps.find(s => s.id === editandoCreepId);
  return !!(sc && editandoCreepCopia && JSON.stringify(sc) !== JSON.stringify(editandoCreepCopia));
}
function guardarEditarCreep(){
  const sc = S.creeps.find(s => s.id === editandoCreepId);
  const hubo = editarCreepCambio();
  cerrarEditarCreep();
  if(sc) toast(hubo ? `${nombreLimpioCreep(sc)} guardado` : 'Sin cambios');
}
async function cancelarEditarCreep(){
  if(!editandoCreepId) return;
  if(editarCreepCambio()){
    const si = await Confirmar.preguntar('Tenés cambios sin guardar. ¿Descartarlos?', {titulo: 'Cancelar', icono: '✎', si: 'Sí, descartar', no: 'No, seguir editando', peligro: true});
    if(!si) return;
    const i = S.creeps.findIndex(s => s.id === editandoCreepId);
    if(i >= 0 && editandoCreepCopia) S.creeps[i] = structuredClone(editandoCreepCopia);
    cerrarEditarCreep();
    renderAll();
    return;
  }
  cerrarEditarCreep();
}

function cerrarEditarCreep(){
  editandoCreepCopia = null;
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
const AYUDA_ORO = 'Cuánto oro (doblones del espacio) suelta este creep al morir.\nSugerido: humanos 15 / 40 / 75 / 120 / 175 (nivel 1 a 5); humanoides la mitad (10 / 20 / 40 / 60 / 90); jefes el doble; el resto 0.\nAl finalizar el combate se tira una variación al azar de ±20% y el GM puede ajustar el total antes de repartirlo.';
const AYUDA_NATURAL = 'Marcala si el arma es parte del cuerpo (colmillo, garra, puño, tentáculo).\nUn arma natural no se puede equipar: al marcarla te ofrece cambiarle el nombre (Garras, Colmillos…) y al morir el creep suelta un TROFEO (que se guarda en la mochila y se vende o se convierte en despojos).\nSin marcar, el arma es un objeto y se suelta como ítem equipable.';
const AYUDA_TROFEO = 'Es opcional: solo para cambiar lo automático.\nSi el creep tiene arma natural, ya suelta un trofeo con el nombre de su arma que vale lo mismo que su equipo natural (el arma y las piezas marcadas 🐾, a su precio del catálogo o estimado): venderlo da lo mismo que vender ese equipo. Con solo piezas naturales, el trofeo se llama «Trofeo de …».\nUsalo cuando quieras algo único: un dragón que deja «Escama de ceniza» por 400 en vez de sus colmillos. Vacío = el automático.';

function nombreLimpioCreep(sc){ return CreepCalculo.nombreLimpio(sc); }
function tipoDeCreep(sc){ return CreepCalculo.tipoDe(sc); }
function oroSugeridoCreep(sc){ return CreepCalculo.oroSugerido(sc); }
function trofeoDeCreep(sc){ return CreepCalculo.trofeo(sc); }   // el trofeo que suelta al morir (o null)
function despojosDePrecio(precioCompra){ return CreepCalculo.despojosDePrecio(precioCompra); }
function dropsResumenCreep(sc){ return CreepCalculo.dropsResumen(sc); }
/* 🔍 Lo mismo en HTML, con un globo por ítem al pasar el mouse (dueño, 2026-10-30: «que cada nombre de ítem listado tenga el hover para ver su
   detalle»): el globo es el «Ver» del ítem (CreepLupa.verItem) y lo muestra comun/lupa.js (lupaHoverHtml). */
function globoItemGM(it, nombre){
  const item = it && (it.detalle || it.mods) ? it : (CATALOGO_EQUIPO || []).find(x => x && x.nombre === (nombre || (it && it.nombre)));
  if(!item || typeof CreepLupa === 'undefined') return '';
  try{ const v = CreepLupa.verItem(item); return `<div class="view-title">${esc(v.titulo || item.nombre || nombre || '')}</div>${v.html}`; }catch(e){ return ''; }
}
function conGlobo(txtHtml, globo){ return typeof lupaHoverHtml === 'function' ? lupaHoverHtml(txtHtml, globo) : txtHtml; }
function dropsResumenCreepHtml(sc){ return CreepCalculo.dropsResumen(sc, {nombre: (n, it) => conGlobo(esc(n), globoItemGM(it, n)), texto: t => esc(t)}); }
function ayudaQ(txt){ return `<span class="ayuda-q con-tip" data-tip="${esc(txt)}">?</span>`; }

/* Pasivas de un creep (2026-10-15, dueño: «habilitemos habilidades pasivas para creeps»): las mismas del catálogo de los personajes
   (comun/pasivas.js + lo subido a la biblioteca), con compras. Suman como en un personaje (CreepCalculo.modTotal) y la vida por turno, al
   empezar su turno (CreepAcciones). */
// 🧪 El cinturón en la ficha del lápiz (dueño, 2026-10-30: «el sumarle cosas al cinturón también debe estar en el menú que se abre con el lápiz, en la parte
// de recompensas»): el mismo de las Acciones (con el panel de filtros), sin el botón de usar.
function cinturonEditorHtml(sc){
  const cin = CreepBotonera.cinturonHtml(sc, {consumibles: CreepAcciones.consumiblesDe(CATALOGO_BASE)}).replace(/<button class="hab-ejecutar" data-cin-consumir[^>]*>[^<]*<\/button>/g, '');
  return `<div class="editar-separador"><span>Cinturón</span></div>
    <div class="hint" style="margin-bottom:6px">Consumibles que puede usar en la pelea. Si los usa, se ofrecen como botín; si no, al final del combate decidís si se ofrecen.</div>${cin}`;
}
function pasivasCreepHtml(sc){
  const ps = sc.pasivas || [];
  return `<div class="editar-separador"><span>Pasivas</span></div>
    ${ps.length ? ps.map(p => `<div class="equipo-item" style="display:flex;gap:8px;align-items:center">
      <div style="flex:1"><b>${esc(p.nombre)}</b>${CreepCalculo.pasivaComprasCreep(p) > 1 ? ` ×${CreepCalculo.pasivaComprasCreep(p)}` : ''}<div class="hint">${esc(p.detalle || '')}</div></div>
      <button type="button" class="mini" data-pasivacreep-menos="${sc.id}|${p.id}" title="Una compra menos (en 1, la saca)">−</button>
      <button type="button" class="mini" data-pasivacreep-mas="${sc.id}|${p.id}" title="Una compra más">+</button>
      <button type="button" class="mini" data-pasivacreep-quitar="${sc.id}|${p.id}" title="Sacar la pasiva">✕</button></div>`).join('') : '<div class="hint">Sin pasivas.</div>'}
    <button type="button" class="addhab" data-pasivacreep="${sc.id}" style="margin-top:6px">+ Pasiva</button>`;
}
function agregarPasivaACreep(sc, datos){
  const clave = datos.poolId || String(datos.nombre || '').toLowerCase();
  sc.pasivas = Array.isArray(sc.pasivas) ? sc.pasivas : [];
  const ya = sc.pasivas.find(p => (p.poolId || String(p.nombre || '').toLowerCase()) === clave);
  if(ya) ya.compras = CreepCalculo.pasivaComprasCreep(ya) + 1;
  else sc.pasivas.push(pasivaParaCombatiente(datos, uid()));   // comun/pasivas.js (con el estado que da, si da uno)
  Combatiente.sincronizarEstadosDePasivas(sc.estados = sc.estados || [], sc.pasivas, estadosPresetCreep(), uid);   // Vuela… (2026-10-16)
  if((datos.mods || []).some(m => m.stat === 'con' || m.stat === 'hpmax')) actualizarHpMaxPorCon(sc);
  toast(`${sc.nombre}: ${datos.nombre}${ya ? ' ×' + ya.compras : ''}`);
  renderAll();
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-pasivacreep], [data-pasivacreep-mas], [data-pasivacreep-menos], [data-pasivacreep-quitar]');
  if(!b) return;
  if(b.dataset.pasivacreep){
    const sc = S.creeps.find(s => s.id === b.dataset.pasivacreep);
    if(!sc) return;
    Biblioteca.abrir({tipo: 'pasivas', titulo: `Pasiva para ${sc.nombre}`, base: typeof PASIVAS_BASE !== 'undefined' ? PASIVAS_BASE : [],
      alElegir: datos => agregarPasivaACreep(sc, datos), subtitulo: e2 => (e2.datos && e2.datos.detalle ? ` · ${e2.datos.detalle.slice(0, 60)}` : '')});
    return;
  }
  const [scId, pId] = String(b.dataset.pasivacreepMas || b.dataset.pasivacreepMenos || b.dataset.pasivacreepQuitar).split('|');
  const sc = S.creeps.find(s => s.id === scId), p = sc && (sc.pasivas || []).find(x => x.id === pId);
  if(!p) return;
  if(b.dataset.pasivacreepMas) p.compras = CreepCalculo.pasivaComprasCreep(p) + 1;
  else if(b.dataset.pasivacreepMenos && CreepCalculo.pasivaComprasCreep(p) > 1) p.compras = CreepCalculo.pasivaComprasCreep(p) - 1;
  else sc.pasivas = sc.pasivas.filter(x => x !== p);
  Combatiente.sincronizarEstadosDePasivas(sc.estados = sc.estados || [], sc.pasivas, estadosPresetCreep(), uid);   // sin la pasiva, se va su estado
  if((p.mods || []).some(m => m.stat === 'con' || m.stat === 'hpmax')) actualizarHpMaxPorCon(sc);
  renderAll();
});

// 🎲 El consumible al azar (la regla de los drops), con «Otro» y «✕ Sacar»: en Recompensas del lápiz y en el paso «Pasivas y cinturón» del asistente
// (dueño, 2026-10-30: «la parte de consumible al azar debe tener el botón de re-rollearlo»).
function consumibleAzarHtml(sc){
  return CombateFin.cuantosAlAzar(sc) > 0 || CombateFin.municionDeCreep(sc) || (sc.consumibleAzar || []).length || sc.municionAzar ? `<div class="mini-f" style="margin-top:8px"><label>🎲 Consumible al azar: lo lleva en el cinturón; si lo usa en el combate lo suelta seguro, si no, con la chance de su tipo${CombateFin.municionDeCreep(sc) ? ` · y una ${CombateFin.municionDeCreep(sc) === 'virote' ? 'virote' : 'flecha'} especial, que suelta seguro` : ''}</label>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;font-size:12.5px">
        <b>${[...(sc.consumibleAzar || []), ...(sc.municionAzar ? [sc.municionAzar] : [])].length ? [...(sc.consumibleAzar || []), ...(sc.municionAzar ? [sc.municionAzar] : [])].map(n => { const c = CATALOGO_BASE.find(i => i.nombre === n && i.tipoItem === 'consumibles');   // qué hace, al pasar el mouse
          return c && c.detalle ? `<span title="${esc(c.detalle)}" style="text-decoration:underline dotted;cursor:help">${esc(n)}</span>` : esc(n); }).join(', ') : 'ninguno'}</b>
        ${CombateFin.cuantosAlAzar(sc) > 0 || CombateFin.municionDeCreep(sc) ? `<button type="button" class="addhab" data-azar-otro="${sc.id}" style="margin:0">🎲 ${(sc.consumibleAzar || []).length || sc.municionAzar ? 'Otro' : 'Darle uno'}</button>` : ''}
        ${(sc.consumibleAzar || []).length || sc.municionAzar ? `<button type="button" class="addhab" data-azar-quitar="${sc.id}" style="margin:0">✕ Sacar</button>` : ''}
      </div></div>` : '';
}
function recompensasHtml(sc, o){
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
        <label style="display:flex;gap:6px;align-items:center;font-size:12.5px;text-transform:none;letter-spacing:0"><input type="checkbox" data-rec="jefe" data-id="${sc.id}"${sc.jefe ? ' checked' : ''}> Jefe (doble oro y trofeo; protección: inmune a Stun y +1 Res.Esp)</label>
      </div>
    </div>
    <div class="mini-f" style="margin-top:8px"><label>Oro que carga (DDE) ${ayudaQ(AYUDA_ORO)}</label>
      <div style="display:flex;gap:6px;align-items:center">
        <input type="number" min="0" step="5" data-rec="oroBase" data-id="${sc.id}" value="${fmt(num(sc.oroBase))}" style="width:110px">
        <button type="button" class="addhab" data-oro-sugerido="${sc.id}" style="margin:0">Usar el sugerido (${fmt(sug)})</button>
      </div>
    </div>
    ${''/* (El «arma natural» se marca con el 🐾 de cada pieza del equipo: dueño, 2026-10-30, «ya no es necesaria».) */}
    <div class="mini-f" style="margin-top:8px"><label>Trofeo especial (opcional) ${ayudaQ(AYUDA_TROFEO)}</label>
      <div style="display:flex;gap:6px">
        <input type="text" data-rec="trofeoNombre" data-id="${sc.id}" value="${esc(esp.nombre || '')}" placeholder="Nombre (vacío = automático)" maxlength="60" style="flex:1">
        <input type="number" min="0" data-rec="trofeoPrecio" data-id="${sc.id}" value="${num(esp.precio) > 0 ? num(esp.precio) : ''}" placeholder="Valor de compra" style="width:120px">
      </div>
    </div>
    <div class="mini-f" style="margin-top:8px"><label>Drops fijos (opcional): ítems del catálogo que suelta siempre</label>
      <div style="display:flex;gap:6px">
        <input type="text" data-rec="dropsFijos" data-id="${sc.id}" value="${esc(CreepCalculo.dropsFijos(sc).join(', '))}" placeholder="Elegilos del catálogo (o escribilos, separados por coma)" maxlength="300" style="flex:1">
        <button type="button" class="addhab" data-dropsfijos-cat="${sc.id}" style="margin:0;white-space:nowrap" title="Abrir el catálogo y sumar ítems a sus drops fijos">📚 Del catálogo</button>
      </div>
    </div>
    ${['humano', 'humanoide'].includes(CreepCalculo.tipoDe(sc)) ? (() => {
      const act = CreepCalculo.arquetipos(sc), manual = CreepCalculo.arquetiposManual(sc).length > 0, auto = CreepCalculo.arquetiposAuto(sc);
      return `<div class="mini-f" style="margin-top:8px"><label>Arquetipo: qué consumibles suelta más ${manual ? '(elegido a mano)' : '(automático, por sus datos)'}</label>
        <div style="display:flex;gap:12px;flex-wrap:wrap;font-size:12.5px">${Object.entries(CreepCalculo.ARQUETIPOS).map(([k, t]) =>
          `<label style="display:flex;gap:5px;align-items:center;text-transform:none;letter-spacing:0"><input type="checkbox" data-rec="arquetipo" data-arq="${k}" data-id="${sc.id}"${act.includes(k) ? ' checked' : ''}><span style="white-space:nowrap">${t}</span></label>`).join('')}</div>
        ${manual ? `<button type="button" class="addhab" data-arq-auto="${sc.id}" style="margin:4px 0 0">Volver al automático (${esc(CreepCalculo.arquetiposTxt(auto))})</button>` : ''}
      </div>`; })() : ''}
    ${o && o.sinAzar ? '' : consumibleAzarHtml(sc)}
    <div class="hint" style="margin-top:6px"><b>Al morir suelta:</b> ${dropsResumenCreepHtml(sc)}</div>`;
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
    marcarArmaNatural(sc, TIPOS_CON_ARMA_NATURAL.includes(t.value));   // valor sugerido por tipo; se puede cambiar (js/05)
    seguirSugerido();
  }else if(campo === 'tipoCriaturaOtro'){ sc.tipoCriaturaOtro = t.value; }
  else if(campo === 'jefe'){ sc.jefe = t.checked; seguirSugerido(); }
  else if(campo === 'oroBase'){ sc.oroBase = Math.max(0, num(t.value)); }
  else if(campo === 'armaNatural'){ marcarArmaNatural(sc, t.checked); if(t.checked) setTimeout(() => renombrarArmaNatural(sc.id), 0); }   // 🐾 y le ofrece cambiarle el nombre (js/05)
  else if(campo === 'trofeoNombre'){ sc.trofeoEspecial = {...(sc.trofeoEspecial || {}), nombre: t.value.trim()}; }
  else if(campo === 'trofeoPrecio'){ sc.trofeoEspecial = {...(sc.trofeoEspecial || {}), precio: Math.max(0, num(t.value))}; }
  else if(campo === 'arquetipo'){   // (2026-10-19) los arquetipos a mano; ninguno = vuelve al automático
    const act = new Set(CreepCalculo.arquetipos(sc));
    if(t.checked) act.add(t.dataset.arq); else act.delete(t.dataset.arq);
    sc.arquetipos = [...act];
    if(!sc.arquetipos.length) delete sc.arquetipos;
  }
  else if(campo === 'dropsFijos'){ sc.dropsFijos = t.value.split(',').map(x => x.trim()).filter(Boolean).slice(0, 10); if(!sc.dropsFijos.length) delete sc.dropsFijos; }
  renderAll();
});
// 🎲 El consumible al azar de un creep (2026-10-19): dárselo, cambiarlo (las veces que quiera el GM) o sacarlo.
function consumibleAzarCreep(sc){
  const r = CombateFin.darConsumiblesAlAzar(sc, CATALOGO_EQUIPO);
  r.avisos.forEach(a => toast(a));
  return r.nombres;
}
document.addEventListener('click', e => {
  const dc = e.target.closest('[data-dropsfijos-cat]');
  if(dc){ abrirDropsFijosCreep(dc.dataset.dropsfijosCat); return; }
  const df = e.target.closest('[data-dropfijo]');
  if(df){ sumarDropFijo(Number(df.dataset.dropfijo)); return; }
  const z = e.target.closest('[data-azar-otro], [data-azar-quitar]');
  if(z){
    const sc = S.creeps.find(s => s.id === (z.dataset.azarOtro || z.dataset.azarQuitar));
    if(!sc) return;
    if(z.dataset.azarQuitar){ CombateFin.quitarConsumiblesAlAzar(sc); toast(`${nombreLimpioCreep(sc)}: sin consumible al azar`); }
    else{ const n = consumibleAzarCreep(sc); toast(n.length ? `🎲 ${nombreLimpioCreep(sc)}: ${n.join(', ')}` : 'No salió ninguno'); }
    renderAll();
    return;
  }
  const a = e.target.closest('[data-arq-auto]');
  if(a){ const sc = S.creeps.find(s => s.id === a.dataset.arqAuto); if(sc){ delete sc.arquetipos; renderAll(); } return; }
  const b = e.target.closest('[data-oro-sugerido]');
  if(!b) return;
  const sc = S.creeps.find(s => s.id === b.dataset.oroSugerido);
  if(!sc) return;
  sc.oroBase = oroSugeridoCreep(sc);
  renderAll();
});

/* =========================================================
   Asistente paso a paso para crear o editar un creep entero (la referencia del estándar paso a paso: docs/plan-paso-a-paso.md;
   la ventana es comun/paso-a-paso.js). Crear: «✔ Crear» al final; editar: Guardar siempre visible, Cancelar repone la copia.
   ========================================================= */
const ASIST_PASOS = ['Qué es', 'Atributos', 'Arma', 'Defensa y resistencias', 'Habilidades', 'Pasivas y cinturón', 'Recompensas', 'Resumen'];   // (Pasivas y cinturón: 2026-10-30, dueño)
const ROLES_CREEP = Combatiente.ROLES;      // los roles y sus repartos viven en comun/combatiente.js (los usa también el personaje nuevo)
const PESOS_ROL = Combatiente.PESOS_ROL;
const RAREZA_ARMA = ['Común', 'Común', 'Común (o Buena Calidad)', 'Buena Calidad', 'Buena Calidad (o Raro)'];
const RAREZA_ARMADURA = ['ninguna (opcional)', 'Común', 'Buena Calidad (o Común)', 'Buena Calidad', 'Raro (o Buena Calidad)'];
let asist = null;   // {id, nuevo, rol, copia, api}: la ventana es la común (comun/paso-a-paso.js, 2026-10-02)
function asistCreepAbierto(){ try{ return !!asist; }catch(e){ return false; } }
const creepAsist = () => asist ? S.creeps.find(s => s.id === asist.id) : null;
const ASIST_AYUDA = [
  'Lo básico: cómo se llama, de qué nivel es y qué tipo de criatura. El tipo sugiere el oro que deja y si su arma es natural.',
  'Cómo se reparten sus cinco atributos. Elegí un rol para cargar un reparto sugerido y después ajustalo a gusto.',
  'Con qué ataca: elegila del fabricante o creala paso a paso (si es parte del cuerpo, marcala como natural).',   // (dueño, 2026-10-30: «primero elegir del fabricante, segundo crear o editar, sólo esos dos botones»)
  'Lo que lleva puesto para defenderse y, si tiene, sus resistencias o debilidades naturales a algún elemento. Todo es opcional.',
  'Lo que sabe hacer además de atacar.',
  'Opcional: pasivas (bonos que siempre tiene) y consumibles en el cinturón, que puede usar en la pelea.',
  'Lo que deja cuando lo derrotan: oro, trofeo y equipo.',
  'Revisá cómo quedó. Todo se puede volver a cambiar desde cualquier paso.',
];

function repartirAtributos(total, pesos){ return Combatiente.repartirAtributos(total, pesos, 1); }
function cambiarAtributoBase(sc, id, valor){
  const agl = id === 'agl' && sc.nitros !== null && sc.nitros !== undefined ? {full: num(sc.nitros) >= creepNitrosMax(sc)} : null;
  sc[id] = Math.max(1, Math.round(num(valor)) || 1);
  if(id === 'con') actualizarHpMaxPorCon(sc);
  if(agl) actualizarNo2PorAgl(sc, agl);
}
// Crear (sin scId) o editar un creep, paso a paso. Al crear, el creep vive en S.creeps marcado `_creando` (no se ve en la grilla ni se
// guarda en la partida) hasta «✔ Crear»; al editar se guarda una copia y Cancelar la repone.
function abrirAsistenteCreep(scId){
  if(asist) return;
  let nuevo = false;
  if(!scId){
    const sc = nuevoCreep();
    sc.nombre = 'Creep nuevo';
    sc.mapa = mapaParaNuevo();
    sc._creando = true;
    S.creeps.push(sc);
    scId = sc.id;
    nuevo = true;
  }
  const sc0 = S.creeps.find(s => s.id === scId);
  if(!sc0) return;
  asist = {id: scId, nuevo, rol: 'brutal', copia: nuevo ? null : structuredClone(sc0)};
  asist.api = PasoAPaso.abrir({
    titulo: () => asist && asist.nuevo ? 'Crear un creep' : 'Editar creep',
    crear: nuevo, z: 79,
    pasos: ASIST_PASOS.map((nombre, i) => ({id: String(i), nombre, ayuda: ASIST_AYUDA[i], html: () => htmlPasoAsistCreep(i),
      alMontar: i === 1 ? () => { const sc = creepAsist(); if(sc) actualizarAsistAtributos(sc); } : undefined})),
    confirmarCancelar: () => asist && !asist.nuevo && JSON.stringify(creepAsist()) !== JSON.stringify(asist.copia) ? '¿Descartar los cambios de este creep?'
      : asist && asist.nuevo ? '¿Cancelar? El creep que estás armando se descarta.' : '',
    alClic: e => clicAsistCreep(e), alInput: e => inputAsistCreep(e), alCambio: e => { const t = e.target; if(t.dataset && t.dataset.acRol !== undefined) asist.rol = t.value; },
    alCrear: () => {
      const sc = creepAsist();
      if(sc){
        delete sc._creando;
        const n = !sc.consumibleAzar && !sc.municionAzar && (CombateFin.cuantosAlAzar(sc) > 0 || CombateFin.municionDeCreep(sc)) ? consumibleAzarCreep(sc) : [];   // 🎲 nace con su consumible al azar
        toast(`${nombreLimpioCreep(sc)} creado${n.length ? ` · 🎲 ${n.join(', ')} en el cinturón` : ''}`);
      }
      terminarAsistCreep(); if(sc) ofrecerTokenEnMapa(sc);
    },
    alGuardar: () => { const sc = creepAsist(); if(sc) toast(`${nombreLimpioCreep(sc)} guardado`); terminarAsistCreep(); },
    alCancelar: () => {
      if(asist.nuevo) S.creeps = S.creeps.filter(s => s.id !== asist.id);   // el creep no se llegó a terminar
      else if(asist.copia){ const i = S.creeps.findIndex(s => s.id === asist.id); if(i >= 0) S.creeps[i] = asist.copia; }
      terminarAsistCreep();
    },
  });
  renderAll();
}
function terminarAsistCreep(){ asist = null; renderAll(); }
function renderAsistenteCreep(){
  if(!asist) return;
  if(!creepAsist()){ asist.api.cerrar(); asist = null; return; }   // lo borraron desde otro lado
  asist.api.redibujar();
}
// 🐾 El botón de natural de una pieza (2026-10-30, dueño: «la diferencia visual de cuando está marcada o no es muy poca»): marcada, una píldora verde
// llena «🐾 Natural»; sin marcar, una apagada «🐾 ¿Natural?». La pieza natural, además, con el borde izquierdo verde (`.equipo-item.natural`).
function natBotonHtml(sc, it){
  return `<button type="button" class="nat-btn${it.natural ? ' on' : ''}" data-naturalequipo="${sc.id}:${it.id}" title="${it.natural ? 'Natural (parte del cuerpo): no se suelta al morir · tocá para que sea una pieza que se suelta' : 'Tocá para marcarla natural (piel, caparazón…): da sus bonos pero no se suelta al morir'}">🐾 ${it.natural ? 'Natural' : '¿Natural?'}</button>`;
}
// 🧾 Lo que da cada pieza y la suma del equipo (2026-10-30, dueño: «también te debe mostrar la defensa y resistencias modificadas por cada objeto, y
// debajo también un listado de la sumatoria de bonos y efectos del equipo completo»). La Defensa con Combatiente.defDeItem; lo demás, sus mods.
const ETQ_PIEZA_EXTRA = {hpmax: 'Vida', sp: 'SP máximo', evaopor: 'Evasión en oportunidad', impulsodes: 'Impulso de Destreza (1 por combate)',
  impulsofue: 'Impulso de Fuerza (1 por combate)', impulsocon: 'Impulso de Constitución (1 por combate)', impulsoesp: 'Impulso de Especial (1 por combate)',
  defprimer: 'Defensa contra el 1.er golpe', cascara: 'Cáscara protectora', primerasangre: 'Primera sangre', pulso: 'Pulso quieto (PdG)', foco: 'Foco (PdG.Esp)',
  pasofantasma: 'Paso fantasma', retirada: 'Retirada (%)', pasosgratis: 'Pasos gratis', pasosbaile: 'Pasos de baile', capmochila: 'Mochila'};
const etqPieza = stat => stat === 'def' ? 'Defensa' : (CreepCalculo.STAT_LABEL[stat] || ETQ_PIEZA_EXTRA[stat] || stat);
function bonosDePieza(it){
  const out = [], d = Combatiente.defDeItem(it);
  if(d) out.push({stat: 'def', val: d});
  (it.mods || []).forEach(m => { if(m && m.stat && m.stat !== 'def' && num(m.val)) out.push({stat: m.stat, val: num(m.val)}); });
  return out;
}
function efectosDePieza(it){
  const L = [];
  if(num(it.perfora) > 0) L.push(`Perfora ${fmt(num(it.perfora))}`);
  (it.efectosGolpe || []).forEach(e => {
    const c = num(e.caras), x = num(e.exitos), pct = c > 1 && x > 0 && x < c ? ` ${Math.round(100 * x / c)} %` : '';
    L.push(`Al golpear: ${e.nombre || 'efecto'}${num(e.stacks) > 1 ? ` ×${fmt(num(e.stacks))}` : ''}${pct}${e.seguroCritico ? ' (seguro si es crítico)' : ''}`);
  });
  return L;
}
const bonosTxt = l => l.map(b => `${etqPieza(b.stat)} ${b.val > 0 ? '+' : ''}${fmt(b.val)}`).join(' · ');
function sumaEquipoHtml(sc){
  const piezas = Combatiente.equipoPuesto(sc);
  const tot = new Map();
  piezas.forEach(it => bonosDePieza(it).forEach(b => tot.set(b.stat, (tot.get(b.stat) || 0) + b.val)));
  const bonos = [...tot].filter(([, v]) => v).map(([stat, val]) => ({stat, val}));
  const efectos = piezas.flatMap(it => efectosDePieza(it).map(t => `${it.nombre}: ${t}`));
  return `<div class="equipo-suma"><div class="equipo-suma-tit">Suma del equipo completo (con el arma)</div>
    <div>${bonos.length ? esc(bonosTxt(bonos)) : '<span class="hint">No suma ningún bono.</span>'}</div>
    ${efectos.length ? `<div class="equipo-suma-tit" style="margin-top:6px">Efectos</div><ul>${efectos.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}</div>`;
}
// Una pieza del equipo en el asistente (pasos Arma y Armadura), con 🐾 natural, 👁 ver y × quitar. Una varita o un báculo muestra su daño ✨ en vez
// de la Defensa (2026-10-28); lo que no da Defensa no muestra el «DEF +0».
function asistPiezaHtml(sc, it){
  const valor = it.especial ? esc(CreepCalculo.especialDanoTxt(sc, it)) : num(it.def) ? `<small>DEF</small>+${fmt(num(it.def))}` : '';
  const tipo = (it.especial ? '✨ Arma especial · ' : '') + (TIPOITEM_LABEL_GM[it.tipoItem] || it.tipoItem || '');
  return `<div class="equipo-item${it.natural ? ' natural' : ''}"><div class="equipo-item-info"><div class="equipo-item-top">
        <span class="equipado-nombre">${esc(it.nombre)}</span>${valor ? `<span class="valor-caja">${valor}</span>` : ''}
${natBotonHtml(sc, it)}
        <button class="rm" data-verequipocreep="${sc.id}:${it.id}" title="Ver la pieza (y editarla y subirla al catálogo)">👁</button>
        <button class="rm" data-quitarequipo="${sc.id}:${it.id}" title="Quitar">×</button></div>
        <div class="equipo-item-meta">${esc(tipo)}${it.natural ? ' · 🐾 natural: no se suelta' : ''}</div>
        ${(() => { const t = [bonosTxt(bonosDePieza(it)), ...efectosDePieza(it)].filter(Boolean).join(' · '); return `<div class="equipo-item-bonos">${t ? esc(t) : '<span class="hint">No suma nada</span>'}</div>`; })()}</div></div>`;
}
function htmlPasoAsistCreep(p){
  const sc = creepAsist();
  if(!sc) return '';
  const n = Math.max(1, Math.round(num(sc.nivel)) || 1);
  const campo = (et, html, ayuda) => `<div class="pap-campo"><label>${et}</label>${html}${ayuda ? `<div class="pap-nota">${ayuda}</div>` : ''}</div>`;
  if(p === 0){
    const t = sc.tipoCriatura || '';
    return campo('Nombre', `<input type="text" data-ac-campo="nombre" value="${esc(sc.nombre)}" maxlength="60">`)
      + `<div class="pap-fila">${campo('Nivel', `<input type="number" min="1" max="30" data-ac-campo="nivel" value="${n}" style="width:90px">`)}
          ${campo('Color', `<input type="color" data-ac-campo="color" value="${esc(sc.color || '#B87333')}" style="width:60px;height:36px;padding:2px">`)}</div>`
      + campo('Tipo de criatura', `<select data-rec="tipoCriatura" data-id="${sc.id}">
          <option value="">(elegí uno)</option>${TIPOS_CRIATURA.map(x => `<option value="${x}"${t === x ? ' selected' : ''}>${x}</option>`).join('')}
          <option value="otros"${t === 'otros' ? ' selected' : ''}>Otros…</option></select>
          ${t === 'otros' ? `<input type="text" data-rec="tipoCriaturaOtro" data-id="${sc.id}" value="${esc(sc.tipoCriaturaOtro || '')}" placeholder="Escribí qué tipo es" maxlength="30" style="margin-top:6px">` : ''}`,
          'Define cuánto oro se sugiere y si el arma es natural por defecto (podés cambiar ambas cosas después).')
      + campo('¿Es un jefe?', `<label style="display:flex;gap:8px;align-items:center"><input type="checkbox" data-rec="jefe" data-id="${sc.id}"${sc.jefe ? ' checked' : ''}> Sí: deja el doble de oro y de trofeo, es inmune a Stun y tiene +1 Res.Esp (protección de jefe)</label>`)
      + campo('Imagen (opcional)', `<button type="button" class="pap-boton" data-ac-img="1">${sc.imagen ? 'Cambiar imagen' : '+ Elegir imagen'}</button>
          <input type="file" data-imginput="${sc.id}" accept="image/*" hidden>`)
      + campo('Nota (opcional)', `<textarea rows="3" data-ac-campo="notas" maxlength="600">${esc(sc.notas || '')}</textarea>`, 'La ven los jugadores en la 🪪 tarjeta del creep en el mapa (junto con los nombres de su arma y su equipo).');
  }
  if(p === 1){
    const b = attrBudgetCreep(sc);
    return `<p class="pap-nota" style="margin:0 0 10px">Nivel ${n}: <b>${fmt(b.total)}</b> puntos para repartir (33 + 3 por nivel). El presupuesto es una guía: solo avisa.</p>
      <div class="pap-fila" style="align-items:center;margin-bottom:12px">
        <select data-ac-rol="1" style="width:auto">${Object.entries(ROLES_CREEP).map(([k, v]) => `<option value="${k}"${asist.rol === k ? ' selected' : ''}>${v}</option>`).join('')}</select>
        <button type="button" class="pap-boton" data-ac-preset="1">Cargar el reparto de ese rol</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px">${ATTR_IDS.map(a => `<div class="pap-campo"><label>${ATTR_LABELS[a]}</label><input type="number" min="1" data-ac-attr="${a}" value="${num(sc[a])}"></div>`).join('')}</div>
      <div class="pap-nota" id="ac-derivados"></div>
      <div class="pap-nota" id="ac-presupuesto"></div>`;
  }
  if(p === 2){
    // ✨ Lo que va en las manos además del arma (una varita o un báculo —un arma especial—, un escudo, un orbe): se ve acá, no en Armadura
    // (2026-10-28, dueño: «el sistema sigue sin entender que varitas y báculos son armas especiales»).
    const enManos = Combatiente.equipoSinArma(sc).filter(CreepCalculo.enLasManos);
    const sinFisica = Combatiente.sinArmaEnMano(sc) && enManos.some(it => it.especial);
    return `<p class="pap-nota" style="margin:0 0 10px">Rareza sugerida para el nivel ${n}: <b>${RAREZA_ARMA[Math.min(n, 5) - 1]}</b>.</p>
      ${sinFisica ? '' : `<div class="arma-compacta"><div class="arma-compacta-top"><span class="equipado-nombre">${Combatiente.armaEnMano(sc).nombre ? esc(Combatiente.armaEnMano(sc).nombre) : '<span class="hint">Sin arma</span>'}</span><span class="valor-caja">${danoTxt(sc)}</span></div>
        <div class="arma-detalle">${Combatiente.armaEnMano(sc).detalle ? esc(Combatiente.armaEnMano(sc).detalle) : 'Sin efecto.'}</div></div>`}
      ${enManos.length ? `<div class="equipo-list" style="margin-top:8px">${enManos.sort((x, y) => (y.especial ? 1 : 0) - (x.especial ? 1 : 0)).map(it => asistPiezaHtml(sc, it)).join('')}</div>` : ''}
      <div class="pap-fila" style="gap:8px;margin:10px 0">
        <button type="button" class="pap-boton" data-equipardelfabricante="${sc.id}">⚔ Elegir del fabricante</button>
        <button type="button" class="pap-boton" data-editararma="${sc.id}">✎ Crear o editar el arma (paso a paso)</button>
      </div>
      ${campo('¿El arma es parte del cuerpo?', `<label style="display:flex;gap:8px;align-items:center"><input type="checkbox" data-rec="armaNatural" data-id="${sc.id}"${Combatiente.armaEnMano(sc).natural ? ' checked' : ''}> Arma natural (colmillo, garra, puño…) ${ayudaQ(AYUDA_NATURAL)}</label>`,
          'Si es natural, al morir suelta un trofeo en vez del arma y ningún jugador la puede equipar.')}`;
  }
  if(p === 3){
    const vestido = Combatiente.equipoSinArma(sc).filter(it => !CreepCalculo.enLasManos(it));   // (lo de las manos está en el paso Arma)
    return `<p class="pap-nota" style="margin:0 0 10px">Rareza sugerida para el nivel ${n}: <b>${RAREZA_ARMADURA[Math.min(n, 5) - 1]}</b>. Defensa total: <b>${fmt(creepDefensaEfectiva(sc))}</b> · Defensa especial: <b>${fmt(creepArmadmgEfectiva(sc))}</b>.</p>
      <div class="equipo-list">${vestido.length ? vestido.map(it => asistPiezaHtml(sc, it)).join('') : '<div class="hint">Sin armadura.</div>'}</div>
      <button type="button" class="pap-boton" data-equipardelfabricante="${sc.id}" style="margin-top:10px">⚔ Equipar del fabricante</button>
      ${sumaEquipoHtml(sc)}
      ${asistResElementalesHtml(sc)}`;
  }
  if(p === 4){
    return `<p class="pap-nota" style="margin:0 0 10px">Se sugieren hasta <b>${Math.max(2, n + 1)} habilidades</b> (nivel 1: dos, y una más por nivel).</p>
      <div class="hab-list">${sc.habilidades.length ? sc.habilidades.map(x => `<div class="equipo-item"><div class="equipo-item-top">
        <span class="equipado-nombre">${esc(x.nombre || '(sin nombre)')}</span><span class="hint">${esc(costoHabCreepTxt(sc, x))}${num(x.cd) > 0 ? ` · CD ${fmt(num(x.cd))}` : ''}${x.cdArranca ? ' · lenta' : ''}</span>
        <button class="rm" data-edithab="${sc.id}:${x.id}" title="Editar">✎</button><button class="rm" data-rmhab="${sc.id}:${x.id}">×</button></div></div>`).join('') : '<div class="hint">Sin habilidades.</div>'}</div>
      <button type="button" class="pap-boton" data-addhab="${sc.id}" style="margin-top:10px">+ Habilidad</button>`;
  }
  if(p === 5){
    // 🧪 Pasivas y cinturón (dueño, 2026-10-30: «agregaría este paso, explicando que es una sugerencia… esos drops se pueden ofrecer o no al party al
    // final del combate, y pueden usarlos o no los creeps»). El cinturón sin el botón de Usar (se está armando, no peleando).
    const cin = CreepBotonera.cinturonHtml(sc, {consumibles: CreepAcciones.consumiblesDe(CATALOGO_BASE), cinSel: window.cinSelCreep}).replace(/<button class="hab-ejecutar" data-cin-consumir[^>]*>[^<]*<\/button>/g, '');
    return `<p class="pap-nota" style="margin:0 0 10px">Todo esto es una <b>sugerencia</b>: se puede dejar vacío.</p>
      <p class="pap-nota" style="margin:0 0 10px"><b>Pasivas:</b> bonos que tiene siempre (por ejemplo, Impulso: +1 No2), las mismas del catálogo de los personajes.</p>
      ${pasivasCreepHtml(sc).replace(/<div class="editar-separador">.*?<\/div>/s, '')}
      <p class="pap-nota" style="margin:14px 0 10px"><b>Cinturón:</b> consumibles que el creep puede usar en la pelea (una poción, un escudo…). Si los usa, después se ofrecen
      como botín; si no los usa, al final del combate decidís si se ofrecen al grupo o no. Además, al crearlo se le suma solo un consumible al azar (la regla de los drops).</p>
      ${cin}
      ${consumibleAzarHtml(sc)}`;
  }
  if(p === 6){
    const xp = xpBasePorNivel(n);
    return `<p class="pap-nota" style="margin:0 0 10px">La XP que da es <b>${fmt(xp)}</b> (sale del nivel; no se edita acá).</p>${recompensasHtml(sc, {sinAzar: true}).replace(/<div class="editar-separador">.*?<\/div>/s, '')}`;
  }
  return `<div class="vc-cajas vc-2">
        <div class="vc-caja"><span class="vc-caja-label">HP</span><span class="vc-caja-valor">${fmt(num(sc.hpMax))}</span></div>
        <div class="vc-caja"><span class="vc-caja-label">No2</span><span class="vc-caja-valor">${fmt(creepNitrosMax(sc))}</span></div>
        <div class="vc-caja"><span class="vc-caja-label">Ataque</span><span class="vc-caja-valor">${esc(Combatiente.sinArmaEnMano(sc) && CreepCalculo.especialesEnMano(sc).length ? CreepCalculo.especialesEnMano(sc).map(it => CreepCalculo.especialDanoTxt(sc, it)).join(' · ') : ataqueCreepTxt(sc))}</span></div>
        <div class="vc-caja"><span class="vc-caja-label">Defensa</span><span class="vc-caja-valor">${fmt(creepDefensaEfectiva(sc))}</span></div>
        <div class="vc-caja"><span class="vc-caja-label">Def. especial</span><span class="vc-caja-valor">${fmt(creepArmadmgEfectiva(sc))}</span></div>
      </div>
      <div class="pap-nota" style="margin-top:8px"><b>${esc(nombreLimpioCreep(sc))}</b> · nivel ${n} · ${esc(tipoDeCreep(sc) || 'tipo sin definir')}${sc.jefe ? ' · jefe' : ''} · ${ATTR_IDS.map(a => `${ATTR_LABELS[a]} ${num(sc[a])}`).join(' · ')}</div>
      ${asistResumenMasHtml(sc)}
      <div class="pap-nota" style="margin-top:6px"><b>Al morir suelta:</b> ${dropsResumenCreepHtml(sc)}</div>
      <div style="margin-top:12px"><button type="button" class="pap-boton" data-ac-bib="1">📚 Guardar en la biblioteca (propuesta)</button></div>`;
}
/* El resumen, más completo (dueño, 2026-10-30: «Defensa especial, resistencias, si las tuviera, cantidad de habilidades (y cuáles, con hover)»): las defensas
   que se tiran, las resistencias (a crítico y elementales, solo las que tiene), las habilidades con su globo, las pasivas y el cinturón. */
function asistResumenMasHtml(sc){
  const v = id => fmt(creepStatValor(sc, id));
  const linea = (et, html) => `<div class="pap-nota" style="margin-top:6px"><b>${et}:</b> ${html}</div>`;
  const crit = [4, 6, 8, 10, 12].map((t, i) => [t, CreepCalculo.critEfectivo(sc, i)]).filter(([, x]) => num(x) !== 0);
  const elem = Object.entries(Combatiente.ELEMENTOS || {}).map(([el, d]) => [d.etq.replace('Res. ', ''), CreepCalculo.resElemental(sc, el)]).filter(([, x]) => num(x) !== 0);
  const habs = sc.habilidades || [];
  const habHtml = habs.map(h => conGlobo(esc(h.nombre || '(sin nombre)'), (() => { try{ const r = CreepLupa.verHab(sc, h); return `<div class="view-title">${esc(r.titulo)}</div>${r.html}`; }catch(e){ return ''; } })())).join(', ');
  const cin = (sc.cinturon || []).map(c => conGlobo(esc(c.nombre) + (num(c.unidades) > 1 ? ` ×${fmt(num(c.unidades))}` : ''), globoItemGM(c, c.nombre)));
  return linea('Defensas que se tiran', `Evasión ${v('eva')} · Parry ${v('parry')} · Bloqueo ${fmt(CreepCalculo.bloqueoValor(sc))}`)
    + linea('Resistencias', `Especial ${v('resmg')} · Control ${v('rescc')} · Mental ${v('resm')}`
      + (crit.length ? ` · a crítico ${crit.map(([t, x]) => `Tipo ${t} ${fmt(num(x))}`).join(', ')}` : ' · a crítico: ninguna')
      + (elem.length ? ` · ${elem.map(([e, x]) => `${e} ${fmt(num(x))}`).join(', ')}` : ''))
    + linea(`Habilidades (${habs.length})`, habHtml || 'ninguna')
    + linea('Pasivas', (sc.pasivas || []).map(p => esc(p.nombre) + (CreepCalculo.pasivaComprasCreep(p) > 1 ? ` ×${CreepCalculo.pasivaComprasCreep(p)}` : '')).join(', ') || 'ninguna')
    + linea('Cinturón', cin.join(', ') || 'vacío');
}
/* 🔥 Resistencias y debilidades naturales (dueño, 2026-10-30: «el paso de resistencias o debilidades naturales a algún elemento… resistencia a fuego,
   debilidad a tóxico… que puede ser racial»): la base de cada elemento (sc.resfuego…, la misma de la ficha del lápiz; data-f la guarda). Positiva: se
   resta al daño de ese elemento; negativa: lo recibe aumentado. Lo que sume su equipo va aparte (se ve en «efect.»). */
function asistResElementalesHtml(sc){
  return `<div class="pap-campo" style="margin-top:16px"><label>Resistencias y debilidades naturales (opcional)</label>
    <div class="pap-nota" style="margin:0 0 8px">Lo propio de su raza o su naturaleza: un número positivo es resistencia (se le resta a ese daño); uno negativo, debilidad (lo recibe aumentado). 0 = nada. Lo que le dé el equipo se suma solo.</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px">${Object.entries(Combatiente.ELEMENTOS).map(([el, x]) => {
      const base = num(sc['res' + el]), ef = CreepCalculo.resElemental(sc, el);
      return `<div class="pap-campo"><label>${x.icono} ${esc(x.etq.replace('Res. ', ''))}${ef !== base ? ` <span class="pap-nota">(con equipo ${ef > 0 ? '+' : ''}${fmt(ef)})</span>` : ''}</label><input type="number" data-f="res${el}" data-id="${sc.id}" value="${base}" step="1"></div>`;
    }).join('')}</div></div>`;
}
function actualizarAsistAtributos(sc){
  const raiz = asist && asist.api ? asist.api.raiz : document;
  const d = raiz.querySelector('#ac-derivados'), pres = raiz.querySelector('#ac-presupuesto');
  if(d) d.innerHTML = `HP máximo: <b>${fmt(num(sc.hpMax))}</b> · No2: <b>${fmt(creepNitrosMax(sc))}</b>`;
  if(pres){ const b = attrBudgetCreep(sc); pres.innerHTML = `Presupuesto: <b>${fmt(b.usado)}</b> de ${fmt(b.total)}${b.pend < 0 ? ` <span style="color:var(--danger)">(+${fmt(Math.abs(b.pend))} de más: es solo una guía)</span>` : b.pend > 0 ? ` (te sobran ${fmt(b.pend)})` : ''}`; }
}
// Los botones propios del asistente (el resto —arma, equipo, habilidades, recompensas— los atiende GM Tools como en la ficha del creep).
function clicAsistCreep(e){
  const sc = creepAsist();
  const b = e.target.closest('[data-ac-preset],[data-ac-img],[data-ac-bib]');
  if(!b || !sc) return;
  if(b.dataset.acPreset){
    const n = Math.max(1, Math.round(num(sc.nivel)) || 1);
    const v = repartirAtributos(33 + 3 * (n - 1), PESOS_ROL[asist.rol]);
    ATTR_IDS.forEach((a, i) => cambiarAtributoBase(sc, a, v[i]));
    renderAll();
  }
  else if(b.dataset.acImg){ const inp = asist.api.raiz.querySelector('[data-imginput]'); if(inp) inp.click(); }
  else if(b.dataset.acBib){ guardarCreepEnBiblioteca(sc); }
}
function inputAsistCreep(e){
  const t = e.target, sc = creepAsist();
  if(!sc) return;
  if(t.dataset.acCampo){
    const c = t.dataset.acCampo;
    sc[c] = c === 'nivel' ? Math.max(1, num(t.value)) : t.value;
    if(c === 'nivel') sc.oroBase = num(sc.oroBase) ? sc.oroBase : oroSugeridoCreep(sc);
  }else if(t.dataset.acAttr){
    cambiarAtributoBase(sc, t.dataset.acAttr, t.value);
    actualizarAsistAtributos(sc);
  }
}

document.addEventListener('click', e => {
  const b = e.target.closest('[data-asistente]');
  if(b) abrirAsistenteCreep(b.dataset.asistente);
});

let accionesCreepId = null;

// Los 5 atributos base (entradas con attr apuntando a sí mismas) más los
// stats secundarios derivados de un PJ (Res.Esp/Res.CC de Con, Dmg/
// Potencia de Fue, Eva/Ini/Mov de Agl, Rango/PdG/Crítico/Parry/Percepción
// de Des, PdG.Esp/Res.M de Especial), sin agregar una grilla a la ficha
// del creep — se tiran desde acá, en Acciones. El set completo se usa
// también para cálculos internos (formulasCombateCreep, danoTxt, etc.);
// CREEP_STATS_TIRADA_IDS más abajo recorta cuáles se muestran como botón.
const CREEP_DERIVED_STATS = CreepCalculo.DERIVED_STATS;   // comun/creep-calculo.js (paso 4 etapa 4a)

// Mismo criterio que STATS_CON_TIRADA_IDS/STATS_REDUNDANTES_COMBATE en la
// Botonera de la ficha: los 5 atributos base + los secundarios que no
// tienen ya su propio botón en la caja de Combate.
const CREEP_STATS_TIRADA_IDS = CreepCalculo.STATS_TIRADA_IDS;

const CREEP_STAT_LOOKUP = CreepCalculo.STAT_LOOKUP;
function creepStatValor(sc, statId){ return CreepCalculo.statValor(sc, statId); }

