// js/05-estados-y-botonera.js — tramo 5 de 14 del script de ficha.html (paso 5, nivel A: mismo código, en el mismo orden).
/* ---------- Estados alterados: los que entran + "Ver todos" ----------
   La cabecera está fijada: el cuadro de estados no crece. Se muestran los
   chips que entran en ESTADOS_FILAS filas; el resto se esconde y aparece un
   botón "＋N · Ver todos" que abre la lista completa (mismos chips, mismos
   botones). */
const ESTADOS_FILAS = 1;

function ajustarEstados(){
  const el = $('#list-efectos');
  if(!el) return;
  el.querySelector('.ef-mas')?.remove();
  const chips = [...el.querySelectorAll('.ef-chip')];
  chips.forEach(c => { c.style.display = ''; });
  if($('#scrim-todos-estados').classList.contains('open')) renderTodosEstados();
  if(!chips.length || !el.offsetParent) return;
  const filas = [...new Set(chips.map(c => c.offsetTop))].sort((a, b) => a - b);
  if(filas.length <= ESTADOS_FILAS) return;
  const limite = filas[ESTADOS_FILAS];
  let visibles = chips.filter(c => c.offsetTop < limite);
  chips.filter(c => c.offsetTop >= limite).forEach(c => { c.style.display = 'none'; });
  const mas = document.createElement('button');
  mas.type = 'button';
  mas.className = 'ef-mas';
  el.appendChild(mas);
  // El botón tiene que entrar en la última fila visible: si no, se esconde un chip más.
  const poner = () => { mas.textContent = `＋${chips.length - visibles.length} · Ver todos`; };
  poner();
  while(mas.offsetTop >= limite && visibles.length > 1){
    visibles.pop().style.display = 'none';
    poner();
  }
  mas.title = `${chips.length} estados en total: tocá para verlos todos`;
  mas.onclick = () => { renderTodosEstados(); $('#scrim-todos-estados').classList.add('open'); };
}
function renderTodosEstados(){
  $('#todos-estados-body').innerHTML = estadosTodos().length ? estadosTodos().map(LISTS.efectos.row).join('') : '<div class="hint">Sin estados alterados.</div>';
}
$('#todos-estados-x').onclick = () => $('#scrim-todos-estados').classList.remove('open');
$('#scrim-todos-estados').addEventListener('mousedown', e => { if(e.target.id === 'scrim-todos-estados') $('#scrim-todos-estados').classList.remove('open'); });
let ajustarEstadosT = null;
window.addEventListener('resize', () => { clearTimeout(ajustarEstadosT); ajustarEstadosT = setTimeout(ajustarEstados, 150); });

/* Globito con la descripción del estado, al pasar el cursor. Uno solo
   para todos los chips, colgado del body y posicionado a mano. */
let efTipEl = null;

function mostrarEfTip(chip){
  const det = chip.dataset.tip;
  if(!det) return;
  if(!efTipEl){
    efTipEl = document.createElement('div');
    efTipEl.className = 'ef-tip';
    document.body.appendChild(efTipEl);
  }
  efTipEl.textContent = det;
  efTipEl.style.display = 'block';
  efTipEl.style.left = '0px';
  efTipEl.style.top = '0px';
  const r = chip.getBoundingClientRect();
  const g = efTipEl.getBoundingClientRect();
  const margen = 8;
  let left = r.left;
  if(left + g.width > window.innerWidth - margen) left = window.innerWidth - g.width - margen;
  if(left < margen) left = margen;
  // Arriba del chip; si no entra, abajo.
  let top = r.top - g.height - 6;
  if(top < margen) top = r.bottom + 6;
  efTipEl.style.left = `${Math.round(left)}px`;
  efTipEl.style.top = `${Math.round(top)}px`;
}

function ocultarEfTip(){
  if(efTipEl) efTipEl.style.display = 'none';
}

// Dock izquierdo: cada botón con data-dock-panel abre su panel al lado (uno a la vez).
document.addEventListener('click', e => {
  const b = e.target.closest('[data-dock-panel]');
  if(!b) return;
  const panel = $('#dock-panel-' + b.dataset.dockPanel);
  const abrir = panel.hidden;
  document.querySelectorAll('.dock-panel').forEach(p => { p.hidden = true; });
  panel.hidden = !abrir;
});
document.addEventListener('pointerdown', e => {
  if(e.target.closest('.dock-item')) return;
  document.querySelectorAll('.dock-panel').forEach(p => { p.hidden = true; });
});
document.addEventListener('pointerdown', e => {
  const pop = $('#loot-esp-pop');
  if(pop && !pop.hidden && !e.target.closest('.counter.loot')) pop.hidden = true;
});
document.addEventListener('mouseover', e => {
  const chip = e.target.closest('.ef-chip.con-tip');
  if(chip) mostrarEfTip(chip);
});
document.addEventListener('mouseout', e => {
  const chip = e.target.closest('.ef-chip.con-tip');
  if(chip && !chip.contains(e.relatedTarget)) ocultarEfTip();
});
// Si la lista scrollea o se cierra la ficha, el globito no puede quedar flotando.
document.addEventListener('scroll', ocultarEfTip, true);

function renderInventario(){
  renderList('equipo');
  renderList('mochila');
  renderArmadura();
}

function renderTodasHabilidades(){
  const grid = $('#todas-habilidades-grid');
  if(!S.habilidades.length){ grid.innerHTML = '<div class="hint">Sin habilidades cargadas.</div>'; return; }
  grid.innerHTML = `<div class="habs-grid">${S.habilidades.map(i => {
    const sinNitros = sinNitrosPara(i);
    const bloqueada = sinNitros;
    return `<div class="habs-grid-item">
      <div class="habs-grid-nombre">${esc(i.nombre)}</div>
      <div class="habs-grid-btns">
        <button class="mini" data-view="habilidades:${i.id}">Ver</button>
        <button class="ejecutar-btn" data-ejecutar="${i.id}" ${bloqueada?'disabled':''}>${habAutomatizada(i) ? 'Ejecutar' : 'Anunciar'}</button>
        ${botonSegundaHab(i)}
      </div>
      ${costoHabilidadTxt(i) ? `<div class="habs-grid-costo">${esc(costoHabilidadTxt(i))}</div>` : ''}
    </div>`;
  }).join('')}</div>`;
}

// Fila de una habilidad social en la Botonera: nivel/dado a la izquierda,
// Ejecutar (con su 🔍) a la derecha — mismo patrón que las de combate.
function filaSocialBotonera(i){ return FichaBotonera.filaSocialBotonera(S, i, lupaBotonHtml); }   // comun/ficha-botonera.js

function renderBotonera(){
  // El dibujo de la Botonera: comun/ficha-botonera.js (paso 4, etapa 3b), el mismo que usa el mapa.
  const r = FichaBotonera.html(S, {modoMapa, parryArmaPendiente});
  const rr = $('#botonera-reroll');   // 🪙 apagado y tachado sin Moneda Re-Roll (2026-10-09, dueño)
  if(rr) rr.classList.toggle('sin-moneda', !FichaDuelo.monedaReroll(S));
  $('#botonera-badge-nitros').textContent = r.nitros;
  $('#botonera-badge-sp').textContent = r.sp;
  $('#botonera-badge-def').textContent = r.def;
  $('#botonera-body').innerHTML = r.html;
  aplicarColapsados();
}

function renderLootEspecial(){
  const list = S.loot.especial || [];
  $('#loot-esp-list').innerHTML = list.length ? list.map(l => `
    <div class="loot-esp-row">
      <input class="nom" data-loot-esp="${l.id}" data-lk="nombre" value="${esc(l.nombre)}" placeholder="Tipo de despojo">
      <input class="cant" type="number" data-loot-esp="${l.id}" data-lk="cantidad" value="${l.cantidad}">
      <button class="rm" data-loot-esp-rm="${l.id}" title="Quitar">×</button>
    </div>`).join('') : `<div class="loot-esp-empty">Sin tipos agregados.</div>`;
  lootEspTotal();
}
function lootEspTotal(){
  const el = $('#loot-esp-total');
  if(el) el.textContent = fmt((S.loot.especial || []).reduce((a, l) => a + num(l.cantidad), 0));
}

// Puntos de Job que costó (1 si no dice otra cosa).
function jobCostoDe(x){ return FichaLupa.jobCostoDe(x); }   // comun/ficha-lupa.js

// Inteligencia (el nuevo significado, reintroducido 2026-09-18 tras liberar
// el nombre al renombrar el atributo viejo a Especial): no es un atributo
// que se reparte, se calcula sola — 6 al crear el personaje, +3 por nivel.
// Se "invierte" en habilidades sociales (ver más abajo): el total no baja,
// es un presupuesto igual que el de Job (jobBudget) — lo gastado queda
// funcionando, "resto" es lo que falta repartir.
function inteligenciaAuto(){ return FichaBotonera.inteligenciaAuto(S); }   // comun/ficha-botonera.js
// Total de Inteligencia: el automático (6 + 3 por nivel) o, si se fijó a mano (2026-09-24, pedido del dueño), ese valor libre.
function inteligenciaManual(){ return FichaBotonera.inteligenciaManual(S); }
function inteligenciaValor(){ return FichaBotonera.inteligenciaValor(S); }
// Editar a mano el total: número (el total nuevo), +N / -N (sumar o restar) o "auto" (vuelve al cálculo automático).
function editarInteligencia(){
  if(fichaVivo && fichaVivo.soloLectura){ toast('Este personaje no es tuyo: no podés cambiarle la Inteligencia'); return; }
  const b = inteligenciaBudget(), auto = inteligenciaAuto();
  const txt = prompt(`Inteligencia — total ahora: ${fmt(b.total)}${inteligenciaManual() !== null ? ' (fijado a mano)' : ' (automático)'}; ${fmt(b.gastado)} invertidos; automático sería ${fmt(auto)}.
Escribí el total nuevo, +N o -N, o "auto" para volver al cálculo automático.`, fmt(b.total));
  if(txt === null) return;
  const t = String(txt).trim().replace(',', '.').replace('−', '-').toLowerCase();
  let nuevo;
  if(t === 'auto' || t === '') nuevo = null;
  else if(/^[+-]\d+(?:\.\d+)?$/.test(t)) nuevo = b.total + parseFloat(t);
  else if(/^\d+(?:\.\d+)?$/.test(t)) nuevo = parseFloat(t);
  else { toast('Escribí un número, +N, -N o "auto"'); return; }
  S.meta.inteligenciaManual = nuevo === null ? null : Math.max(0, nuevo);
  renderInteligencia();
  renderList('sociales');
  refresh();
  toast(nuevo === null ? `Inteligencia automática: ${fmt(inteligenciaAuto())}` : `Inteligencia fijada a mano: ${fmt(S.meta.inteligenciaManual)}`);
}
function inteligenciaBudget(){ return FichaBotonera.inteligenciaBudget(S); }
function renderInteligencia(){
  const b = inteligenciaBudget();
  $('#v-inteligencia').textContent = fmt(b.resto);
  $('#v-inteligencia-sub').textContent = `${fmt(b.gastado)} invertidos de ${fmt(b.total)}${inteligenciaManual() !== null ? ' · a mano' : ''}`;
  const invertidos = S.sociales.filter(x => num(x.puntosInt) > 0);
  const detalle = invertidos.length
    ? invertidos.map(x => `· ${x.nombre}: ${fmt(num(x.puntosInt))}`).join('\n')
    : 'Sin puntos invertidos todavía.';
  $('#c-inteligencia').title = `${fmt(b.total)} en total (${inteligenciaManual() !== null ? 'fijado a mano; automático sería ' + fmt(inteligenciaAuto()) : '6 al crear, +3 por nivel'}) - ${fmt(b.gastado)} invertidos = ${fmt(b.resto)} sin usar.

${detalle}

Tocá para cambiar el total a mano.`;
}

/* ---------- Habilidades sociales: nivel por Inteligencia invertida o por
   tirada máxima, dado = nivel × 2 caras, tirada = 1dNivel×2 + Inteligencia
   (el total, no lo que queda por invertir). Sin nivel, tira solo Inteligencia. ---------- */
function nivelSocial(i){ return FichaBotonera.nivelSocial(i); }   // comun/ficha-botonera.js
function dadoCarasSocial(i){ return FichaBotonera.dadoCarasSocial(i); }
function nivelSocialTxt(i){ return FichaBotonera.nivelSocialTxt(i); }
function formulaSocial(i){ return FichaLupa.formulaSocial(S, i); }   // comun/ficha-lupa.js
function tiradaSocialTxt(i){ return FichaBotonera.tiradaSocialTxt(S, i); }
function tirarSocial(i){ FichaAcciones.tirarSocial(S, i, combateUi); }   // comun/ficha-acciones.js (paso 3c-7)

let nivelSocialId = null;
function abrirNivelSocial(id){
  const i = S.sociales.find(x => x.id === id);
  if(!i) return;
  nivelSocialId = id;
  const b = inteligenciaBudget();
  $('#nivelsocial-titulo').textContent = `Nivel del talento · ${i.nombre}`;
  $('#f-nivelsocial-manual-int').value = Math.max(0, num(i.puntosInt));
  $('#f-nivelsocial-manual-extra').value = Math.max(0, num(i.nivelExtra));
  $('#nivelsocial-info').textContent = `${nivelSocialTxt(i)} — ${i.puntosInt ? `${fmt(num(i.puntosInt))} de Inteligencia` : 'sin Inteligencia invertida'}${i.nivelExtra ? ` + ${fmt(num(i.nivelExtra))} por tirada máxima` : ''}.`;
  $('#f-nivelsocial-puntos').value = Math.min(Math.max(1, b.resto), 1) || 1;
  $('#f-nivelsocial-puntos').max = Math.max(1, b.resto);
  $('#nivelsocial-disponible').textContent = `Tenés ${fmt(b.resto)} de Inteligencia sin invertir (de ${fmt(b.total)} en total).`;
  $('#nivelsocial-confirmar').disabled = b.resto <= 0;
  $('#scrim-nivel-social').classList.add('open');
}
function nivelarSocialPorTiradaMaxima(){
  const i = S.sociales.find(x => x.id === nivelSocialId);
  if(!i) return;
  i.nivelExtra = Math.max(0, num(i.nivelExtra)) + 1;
  $('#scrim-nivel-social').classList.remove('open');
  renderList('sociales'); renderInteligencia();
  toast(`${i.nombre}: ${nivelSocialTxt(i)} (tirada máxima)`);
}
// Ajuste a mano (regla del dueño, 2026-09-30: la regla está, el mecanismo queda libre): cada jugador fija la Inteligencia
// invertida y los niveles extra de su talento, para arriba o para abajo. Si invierte más de lo que tiene, avisa pero lo deja.
function nivelarSocialAMano(){
  const i = S.sociales.find(x => x.id === nivelSocialId);
  if(!i) return;
  const antesInt = Math.max(0, num(i.puntosInt));
  i.puntosInt = Math.max(0, Math.round(num($('#f-nivelsocial-manual-int').value)));
  i.nivelExtra = Math.max(0, Math.round(num($('#f-nivelsocial-manual-extra').value)));
  $('#scrim-nivel-social').classList.remove('open');
  renderList('sociales'); renderInteligencia();
  const b = inteligenciaBudget();
  toast(`${i.nombre}: ${nivelSocialTxt(i)}${b.resto < 0 ? ` · ojo: invertiste ${fmt(-b.resto)} de Inteligencia de más` : i.puntosInt !== antesInt ? ` · te quedan ${fmt(b.resto)} de Inteligencia` : ''}`);
}
function nivelarSocialPorInteligencia(){
  const i = S.sociales.find(x => x.id === nivelSocialId);
  if(!i) return;
  const n = Math.max(1, num($('#f-nivelsocial-puntos').value) || 1);
  const b = inteligenciaBudget();
  if(n > b.resto){ toast(`Solo te quedan ${fmt(b.resto)} de Inteligencia sin invertir`); return; }
  i.puntosInt = Math.max(0, num(i.puntosInt)) + n;
  $('#scrim-nivel-social').classList.remove('open');
  renderList('sociales'); renderInteligencia();
  toast(`${i.nombre}: ${nivelSocialTxt(i)} (+${fmt(n)} de Inteligencia)`);
}
function renderBotoneraSiAbierta(){
  if($('#scrim-botonera').classList.contains('open')) renderBotonera();
}

function jobBudget(){
  const total = FichaCalculo.jobTotal(S.meta.nivel);   // 3 al nivel 1 y 3 más por nivel (comun/ficha-calculo.js)
  const gastado = [...S.habilidades, ...S.pasivas].reduce((a, x) => a + jobCostoDe(x), 0);
  return {total, gastado, resto: total - gastado};
}

function renderJob(){
  const jb = jobBudget();
  const box = $('#c-job');
  box.classList.toggle('penal', jb.resto < 0);
  $('#v-job').textContent = fmt(jb.resto);
  $('#v-job-sub').textContent = `${jb.gastado} usados de ${jb.total}`;
  box.title = jb.resto < 0
    ? `Te pasaste por ${Math.abs(jb.resto)}: ${jb.gastado} puntos gastados en habilidades/pasivas contra ${jb.total} disponibles.`
    : `${jb.total} puntos (3 base + 2 por nivel) − ${jb.gastado} usados = ${jb.resto} disponibles.`;
}

// Para trackear en qué se fueron los puntos de Job: la lista completa de
// habilidades y pasivas adquiridas con Job, clickeables para ir directo
// a verlas.
function abrirJobLista(){
  const con = [
    ...S.habilidades.filter(x => x.job !== false).map(x => ({...x, tipo:'habilidades'})),
    ...S.pasivas.filter(x => x.job !== false).map(x => ({...x, tipo:'pasivas'})),
  ];
  $('#job-lista').innerHTML = con.length
    ? con.map(x => `<button type="button" class="btn ghost" data-jobver="${x.tipo}:${x.id}" style="width:100%;text-align:left">${esc(x.nombre)} <span class="hint" style="float:right">${x.tipo === "habilidades" ? "Habilidad" : "Pasiva"} · ${fmt(jobCostoDe(x))} Job</span></button>`).join('')
    : `<div class="hint">Todavía no gastaste puntos de Job en nada.</div>`;
  $('#scrim-job').classList.add('open');
}

function renderPortrait(){
  const img = $('#portrait-img'), empty = $('#portrait-empty'), rm = $('#portrait-rm');
  if(S.meta.imagen){
    img.src = S.meta.miniatura || S.meta.imagen; img.style.display = 'block'; empty.style.display = 'none'; rm.style.display = 'flex';
  }else{
    img.removeAttribute('src'); img.style.display = 'none'; empty.style.display = 'flex'; rm.style.display = 'none';
  }
}

function renderAll(){
  // Cualquier ficha que llegue (archivo, mesa, otra ventana) pasa por acá.
  migrarEstadoIt2(S);
  migrarEstadoEspecial(S);
  if(S.nitros === null || S.nitros === undefined) S.nitros = nitrosMaximo();
  $('#f-nombre').value = S.meta.nombre;
  fichaIdentidadRender();  // por si cambió el nombre del personaje
  ['raza','clase','subclase','nivel','exp','dde','wildcards','wildcardsMax'].forEach(k => $('#f-'+k).value = S.meta[k]);
  renderPortrait();
  $('#f-loot-normal').value = S.loot.normal;
  $('#f-loot-magico').value = S.loot.magico;
  renderLootEspecial();
  $('#f-hp').value = S.hp;
  $('#f-capmochila').value = S.caps.mochila;
  $('#f-capcinturon').value = S.caps.cinturon;
  $('#f-armanota').value = S.armadura.nota;
  $('#eyebrow').textContent = [S.meta.raza, S.meta.clase, S.meta.subclase].filter(Boolean).join(' · ') || 'Ficha de personaje';
  renderAttrs();
  renderArmadura();
  Object.keys(LISTS).forEach(renderList);
  renderTurno();
  renderNitros();
  renderVitals();
  renderPolillaBoton();
  renderJob();
  renderInteligencia();
  renderExp();
  renderInvocaciones();
}

// Igual que configEfectoDe: el catálogo es la referencia fresca, gana
// sobre lo que haya quedado copiado en el ítem al comprarlo/agregarlo.
function configEquipoEstadoDe(it){
  const base = (S.catalogo || []).find(c => sinAviso(c.nombre) === sinAviso(it.nombre));
  if(base && (base.equipoEstadoNombre || '').trim()) return base;
  return it;
}

// Los campos de un preset que hacen algo más que un modificador sumable
// (afortunado, inmunidades, etc.) — un ítem puede pedir "activate igual
// que este preset" sin copiarle el nombre, vía equipoEstadoPreset, para
// poder mostrar un nombre propio ("Afortunado (anillo)") sin perder la
// mecánica real del preset "Afortunado". comun/ficha-habilidades.js (paso 5, nivel B, área 3).
function flagsDePreset(nombrePreset){ return FichaHabilidades.flagsDePreset(EFECTOS_PRESET, nombrePreset); }

/* Ítems que aplican un estado mientras están puestos (los Guantes de piel
   de troll y su regeneración, por ejemplo). El estado aparece solo al
   equiparlos y se va al sacárselos, marcado con origenItem para no
   confundirlo con uno que haya puesto el jugador.

   Si el jugador lo pausa, se respeta: no se reactiva ni se duplica. Si lo
   borra teniendo el ítem puesto, vuelve — lo genera el ítem, no él. */
function sincronizarEstadosDeEquipo(){
  if(!Array.isArray(S.efectos)) S.efectos = [];
  const puestos = [...(S.inventario || []), ...(S.cinturon || [])]
    .filter(i => i.equipado && (configEquipoEstadoDe(i).equipoEstadoNombre || '').trim());
  const idsPuestos = new Set(puestos.map(i => i.id));

  // Lo que salía de un ítem que ya no está puesto se va con él.
  S.efectos = S.efectos.filter(e => !e.origenItem || idsPuestos.has(e.origenItem));

  puestos.forEach(i => {
    if(S.efectos.some(e => e.origenItem === i.id)) return;
    const src = configEquipoEstadoDe(i);
    S.efectos.push({
      id: uid(), nombre: (src.equipoEstadoNombre || '').trim(), imagen: '',
      origenItem: i.id,
      turnos: 0, permanente: true, activo: true,
      stacks: 1, stacksturno: 0,
      hpturno: num(src.equipoEstadoHpTurno),
      popup: false,
      detalle: (src.equipoEstadoDetalle || '').trim() || `Mientras tengas ${i.nombre} equipado.`,
      mods: [],
      ...flagsDePreset(src.equipoEstadoPreset),
    });
  });
}

function refresh(){
  sincronizarEstadosDeEquipo();
  renderAttrs(); renderArmadura(); renderVitals(); renderJob(); renderInteligencia(); renderExp(); renderNitros();
  renderList('efectos');
  renderPolillaBoton();
  if($('#scrim-equipo').classList.contains('open')) renderEquipo();
}

