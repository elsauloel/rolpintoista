// js/03-acciones-y-lupa.js — tramo 3 de 12 del script de gm-tools.html (paso 5, nivel A: mismo código, en el mismo orden).
/* ---------- Lupa de las Acciones del creep (igual que la Botonera de la ficha) ----------
   Cada botón trae un 🔍 (data-lupa="creepId|tipo|clave") que abre
   #lupa-pop con el desglose: atributo base, modificadores y de dónde vienen,
   cómo se reparte en dados y el costo en No2 con su motivo. */


function lupaStatCreep(sc, statId, o){ return CreepLupa.stat(sc, statId, o); }   // comun/creep-lupa.js (paso 4 etapa 4c, tanda 6)

// Contenido de la 🔍 (comun/lupa.js lo pide con lupaContenido).
function lupaContenido(clave){ return lupaHtmlCreep(clave); }

function lupaHtmlCreep(clave){   // comun/creep-lupa.js (paso 4 etapa 4c, tanda 6): lo usa también el mapa
  return CreepLupa.contenido(S.creeps.find(s => s.id === clave.split('|')[0]), clave);
}


// El dibujo de las Acciones vive en comun/creep-botonera.js (paso 4 etapa 4b, 2026-10-01): lo usa también el mapa.
function renderAccionesCreep(){
  const sc = S.creeps.find(s => s.id === accionesCreepId);
  if(!sc) return;
  const r = CreepBotonera.html(sc, {parryPendiente: parryPendienteCreep.has(sc.id), consumibles: CreepAcciones.consumiblesDe(CATALOGO_BASE), cinSel: window.cinSelCreep});   // el cinturón (2026-10-04)
  $('#acciones-creep-titulo').textContent = r.titulo;
  $('#acciones-creep-badge').textContent = r.badge;
  $('#acciones-creep-lista').innerHTML = r.html;
}

function abrirAccionesCreep(scId){
  accionesCreepId = scId;
  renderAccionesCreep();
  $('#scrim-acciones-creep').classList.add('open');
}

let verHabAccion = null;   // {scId, habId}: la habilidad que se está viendo (para Editar y Reemplazar)
function abrirVerHabAccion(scId, habId){
  const sc = S.creeps.find(s => s.id === scId);
  const h = sc && sc.habilidades.find(x => x.id === habId);
  if(!h) return;
  verHabAccion = {scId, habId};
  const v = CreepLupa.verHab(sc, h);   // comun/creep-lupa.js
  $('#verhab-nombre').textContent = v.titulo;
  $('#verhab-body').innerHTML = v.html;
  $('#scrim-ver-hab').classList.add('open');
}

const SVG_LAPIZ = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';

function muertoBadgeHtml(sc){
  if(num(sc.hp) > 0) return '';
  return `<div class="creep-muerto-badge">💀 MUERTO
    <button type="button" class="revivir-creep-btn" data-revivircreep="${sc.id}">Revivir</button>
  </div>`;
}

// Qué dado va a tirar cada botón de Combate, para no tener que
// adivinarlo antes de apretar (igual que en la ficha).
function formulasCombateCreep(sc){ return CreepBotonera.formulasCombate(sc); }   // comun/creep-botonera.js

function cardHtml(sc){
  return `
  <div class="card${num(sc.hp)<=0?' card-muerto':''}" style="--accent:${sc.color}" data-id="${sc.id}">
    <div class="chead">
      <input class="name" data-f="nombre" data-id="${sc.id}" value="${esc(sc.nombre)}">
      <div class="mini-f" style="width:44px">
        <label class="lv-label">Lv</label>
        <input class="lv" type="number" data-f="nivel" data-id="${sc.id}" value="${sc.nivel}">
      </div>
      <button class="verbtn" data-asistente="${sc.id}" title="Editar este creep con el asistente paso a paso (nombre, atributos, arma, defensa, habilidades…)">✎ Editar paso a paso</button>
      <button class="verbtn" data-dup="${sc.id}" title="Duplicar este creep">Duplicar</button>
      <button class="verbtn" data-bib="${sc.id}" title="Guardar este creep en la biblioteca para usarlo en cualquier partida">📚 Biblioteca</button>
      <button class="xbtn" data-del="${sc.id}" title="Eliminar creep">×</button>
      <button type="button" class="iconbtn" data-cerrareditar="1" title="Cerrar (Esc)">Cerrar</button>
    </div>
    ${muertoBadgeHtml(sc)}
    <div class="imgwrap">
      <button type="button" class="imgpick" data-img="${sc.id}">
        ${sc.imagen ? `<img src="${sc.imagen}" alt="">` : `<span class="imgempty">+<small>Imagen</small></span>`}
      </button>
      ${sc.imagen ? `<button class="imgrm" data-imgrm="${sc.id}">Quitar imagen</button>` : ''}
      <input type="file" class="imginput" data-imginput="${sc.id}" accept="image/*" hidden>
    </div>
    <div class="cbody">

      ${mapaSelectHtml(sc)}

      <div class="vitalbar">
        <div class="vital-mini hp">
          <div class="vl">HP</div>
          <div class="vn"><input type="text" inputmode="decimal" data-f="hp" data-id="${sc.id}" value="${sc.hp}" title="Escribí un número para fijarlo, o +10 / -5 para sumar o restar al valor actual, y apretá Enter"><span class="vmax">/ </span><input type="number" data-f="hpMax" data-id="${sc.id}" value="${sc.hpMax}"></div>
          <div class="dano-entrante">
            <label>Daño</label>
            <input type="text" inputmode="decimal" data-danocreep="${sc.id}" placeholder="0" title="Escribí el daño del golpe y apretá Enter: se le resta la Defensa del creep y el resto sale del HP">
          </div>
        </div>
        <div class="vital-mini acc" title="Nitros: se gastan al atacar, moverse y usar habilidades. Máximo = Agilidad + mods; se recargan en cada Mantenimiento">
          <div class="vl">No2</div>
          <div class="vn"><input type="number" data-f="nitros" data-id="${sc.id}" value="${fmt(num(sc.nitros))}"><span class="vmax">/ ${fmt(creepNitrosMax(sc))}</span></div>
        </div>
      </div>

      <div class="row3" style="grid-template-columns:1fr 1fr 1fr">
        <div class="mini-f con-tip" data-tip="${esc(ataqueOrigenTxt(sc))}"><label>Ataque</label><div class="valor-fijo">${esc(ataqueCreepTxt(sc))}</div></div>
        <div class="mini-f con-tip" data-tip="${esc(defensaOrigenTxt(sc))}"><label>Defensa${creepDefensaEfectiva(sc)!==num(sc.defensa) ? ` <button type="button" class="mod-origen-btn efectivo-badge" data-modorigen="${esc(creepArmaduraOrigenTxt(sc))}">efect. ${fmt(creepDefensaEfectiva(sc))}</button>` : ''}</label><input type="number" data-f="defensa" data-id="${sc.id}" value="${sc.defensa}"></div>
        <div class="mini-f con-tip" data-tip="${esc(armadmgOrigenTxt(sc))}" title="Se resta al daño de casteo que ignora la Defensa (Paso 3 del casteo). No sale de ningún atributo: normalmente 0, salvo ítems Raros o mejores."><label>Armad. mágica${creepArmadmgEfectiva(sc)!==num(sc.armadmg) ? ` <span class="mod-origen-btn efectivo-badge">efect. ${fmt(creepArmadmgEfectiva(sc))}</span>` : ''}</label><input type="number" data-f="armadmg" data-id="${sc.id}" value="${sc.armadmg}"></div>
      </div>
      <div class="row3" style="grid-template-columns:repeat(5,1fr)" title="Resistencias elementales (2026-10-04): cada una se resta al daño de su elemento, además de la Defensa especial. Lo que den su equipo y sus estados se suma solo.">
        ${Object.entries(Combatiente.ELEMENTOS).map(([el, x]) => `<div class="mini-f"><label>${x.icono} ${esc(x.etq)}${CreepCalculo.resElemental(sc, el) !== num(sc['res' + el]) ? ` <span class="mod-origen-btn efectivo-badge">efect. ${fmt(CreepCalculo.resElemental(sc, el))}</span>` : ''}</label><input type="number" data-f="res${el}" data-id="${sc.id}" value="${num(sc['res' + el])}"></div>`).join('')}
      </div>


      <div>
        <div class="sect-label" style="display:flex;justify-content:space-between;align-items:center">
          <span>Atributos</span>
          <span class="attr-budget-badge" style="${attrBudgetStyle(sc)}">${attrBudgetTxt(sc)}</span>
        </div>
        <div class="row5 attr-cols" style="margin-top:4px">
          ${ATTR_IDS.map(a => `<div class="attr-col">${attrCellHtml(sc, a)}${derivadosHtml(sc, a)}</div>`).join('')}
        </div>
      </div>

      <div class="editar-separador"><span>Equipados</span></div>

      <div>
        <div class="sect-label">Arma</div>
        <div class="arma-compacta" style="margin-top:4px">
          <div class="arma-compacta-top">
            <span class="equipado-nombre">${sc.armaNombre ? esc(sc.armaNombre) : '<span class="hint">Sin nombre</span>'}</span>
            <span class="valor-caja" title="Daño">${danoTxt(sc)}</span>
            <button class="rm" data-armanat="${sc.id}" title="Arma natural del catálogo (garras, colmillos, aguijón…)">🐾</button>
            ${sc.armaNombre ? `<button class="rm" data-verarmacreep="${sc.id}" title="Ver el arma (y editarla y subirla al catálogo)">👁</button>` : ''}
            <button class="rm" data-editararma="${sc.id}" title="Editar arma">✎</button>
          </div>
          <div class="arma-detalle">${sc.armaDetalle ? esc(sc.armaDetalle) : 'Sin efecto.'}</div>
          ${(sc.armaEfectos || []).length ? `<div class="arma-detalle"><b>Al golpear:</b> ${esc(EfectosGolpe.resumenLista(sc.armaEfectos))}</div>` : ''}
        </div>
      </div>

      <div>
        <div class="sect-label">Armadura</div>
        <div class="equipo-list" style="margin-top:4px">
          ${sc.equipo.length ? sc.equipo.map(it => `
            <div class="equipo-item">
              <div class="equipo-item-info">
                <div class="equipo-item-top">
                  <span class="equipado-nombre">${esc(it.nombre)}</span>
                  <span class="valor-caja" title="Defensa que otorga"><small>DEF</small>+${fmt(num(it.def))}</span>
                  <button class="rm" data-verequipocreep="${sc.id}:${it.id}" title="Ver la pieza (y editarla y subirla al catálogo)">👁</button>
                  <button class="rm" data-quitarequipo="${sc.id}:${it.id}" title="Quitar">×</button>
                </div>
                <div class="equipo-item-meta">${esc(TIPOITEM_LABEL_GM[it.tipoItem] || it.tipoItem)}</div>
                ${it.detalle ? `<div class="arma-detalle">${esc(it.detalle)}</div>` : ''}
              </div>
            </div>`).join('') : `<div class="hint">Sin armadura.</div>`}
        </div>
        <button type="button" class="addhab" data-equipardelfabricante="${sc.id}" style="margin-top:6px">⚔ Equipar del fabricante</button>
      </div>

      ${sc.crit.some(v => num(v) !== 0) ? `
      <div>
        <div class="sect-label">Res. a críticos</div>
        <div class="crit-grid" style="margin-top:4px">
          ${['Tipo 4','Tipo 6','Tipo 8','Tipo 10','Tipo 12'].map((lbl,i) => num(sc.crit[i]) !== 0
            ? `<div class="crit-cell"><label>${lbl}${creepCritEfectivo(sc,i)!==num(sc.crit[i]) ? ` <button type="button" class="mod-origen-btn efectivo-badge" data-modorigen="${esc(creepArmaduraOrigenTxt(sc))}">${fmt(creepCritEfectivo(sc,i))}</button>` : ''}</label><input type="number" data-crit="${i}" data-id="${sc.id}" value="${sc.crit[i]}"></div>`
            : '').join('')}
        </div>
      </div>` : ''}

      ${recompensasHtml(sc)}

      <div class="editar-separador"><span>Habilidades</span></div>

      <div>
        <div class="hab-list" style="margin-top:4px">
          ${sc.habilidades.map(h => habHtml(sc, h)).join('')}
        </div>
        <button class="addhab" data-addhab="${sc.id}" style="margin-top:6px">+ Habilidad</button>
      </div>

      <div>
        <div class="sect-label">Estados</div>
        <div class="est-list" style="margin-top:4px">
          ${sc.estados.length ? sc.estados.map(es => estadoHtml(sc.id, es)).join('') : '<div class="hint">Sin estados activos.</div>'}
        </div>
        <button class="addhab" data-addestado="${sc.id}" style="margin-top:6px">+ Estado</button>
      </div>

      <div>
        <div class="sect-label">Notas</div>
        <textarea class="notas" data-f="notas" data-id="${sc.id}" style="margin-top:4px" placeholder="Lo que haga falta recordar de este creep.">${esc(sc.notas)}</textarea>
      </div>

    </div>
  </div>`;
}

let estadoChipAbierto = null;  // 'scId:esId' del estado con los botones a la vista

// Esconde los botones del estado abierto sin redibujar (para no sacarle el
// foco a un campo que se esté por usar). Si el clic fue en uno de esos
// botones, se quitan después de que su propia acción lo lea.
function cerrarChipEstado(boton){
  estadoChipAbierto = null;
  const limpiar = () => document.querySelectorAll('.chip-estado-wrap.abierto').forEach(w => {
    w.classList.remove('abierto');
    w.querySelectorAll('.chip-accion').forEach(x => x.remove());
  });
  if(boton && boton.classList.contains('chip-accion')) setTimeout(limpiar, 0);
  else limpiar();
}

function cardCompactoHtml(sc){
  // Cada estado: la descripción al pasar el mouse; al tocarlo, botones para
  // quitarlo (×) o editarlo (⚙).
  const chips = sc.estados.map(es => {
    const clave = `${sc.id}:${es.id}`;
    const abierto = estadoChipAbierto === clave;
    const dura = es.permanente ? 'perm.' : `${fmt(num(es.turnos))}t`;
    const xRota = es.armaduraRota && num(es.stacks) > 1 ? ` ×${fmt(num(es.stacks))}` : '';
    return `<span class="chip-estado-wrap${abierto ? ' abierto' : ''}">
      <button type="button" class="chip-estado con-tip" data-toggleestado="${clave}" data-tip="${esc(es.detalle || 'Sin descripción.')}">${esc(es.nombre || '(sin nombre)')}${xRota} · ${dura}</button>
      ${abierto ? `${es.armaduraRota ? `<button type="button" class="chip-accion" data-stackestado="${clave}:-1" title="Un punto menos de armadura rota (al llegar a 0, se repara)">−</button>
      <button type="button" class="chip-accion" data-stackestado="${clave}:1" title="Un punto más de armadura rota">+</button>` : ''}${es.permanente ? '' : `<button type="button" class="chip-accion" data-turnoestado="${clave}:-1" title="Un turno menos">−</button>
      <button type="button" class="chip-accion" data-turnoestado="${clave}:1" title="Un turno más">+</button>`}
      <button type="button" class="chip-accion chip-quitar" data-rmestado="${clave}" title="Quitar el estado">✕</button>
      <button type="button" class="chip-accion" data-editarestado="${clave}" title="Editar el estado">⚙</button>` : ''}
    </span>`;
  }).join('')
    || `<span class="chip-estado chip-estado-vacio">Sin estados</span>`;
  return `
  <div class="card card-compacto${num(sc.hp)<=0?' card-muerto':''}" style="--accent:${sc.color}" data-id="${sc.id}">
    <div class="chead">
      <button type="button" class="eyebtn" data-editarcreep="${sc.id}" title="Editar creep">${SVG_LAPIZ}</button>
      <span class="name-compacto">${esc(sc.nombre)}</span>
      <span class="lv-compacto">Lv ${fmt(num(sc.nivel))}</span>
      ${versionNuevaDeCreep(sc) ? `<button class="verbtn" data-versioncreep="${sc.id}" title="Alguien corrigió el creep de la biblioteca del que salió este: ver y decidir si actualizarlo">🔔</button>` : ''}
      <button class="verbtn" data-ver="${sc.id}">Ver</button>
      <button class="xbtn" data-del="${sc.id}" title="Eliminar creep">×</button>
    </div>
    <div class="mapa-fila">${mapaSelectHtml(sc, true)}</div>
    ${muertoBadgeHtml(sc)}
    <div class="cbody-compacto">
      <div class="vitalbar">
        <div class="vital-mini hp">
          <div class="vl">HP</div>
          <div class="vn"><input type="text" inputmode="decimal" data-f="hp" data-id="${sc.id}" value="${sc.hp}" title="Escribí un número para fijarlo, o +10 / -5 para sumar o restar al valor actual, y apretá Enter"><span class="vmax">/ </span><input type="number" data-f="hpMax" data-id="${sc.id}" value="${sc.hpMax}"></div>
          <div class="dano-entrante">
            <label>Daño</label>
            <input type="text" inputmode="decimal" data-danocreep="${sc.id}" placeholder="0" title="Escribí el daño del golpe y apretá Enter: se le resta la Defensa del creep y el resto sale del HP">
          </div>
        </div>
        <div class="vital-mini acc" title="Nitros: se gastan al atacar, moverse y usar habilidades. Máximo = Agilidad + mods; se recargan en cada Mantenimiento">
          <div class="vl">No2</div>
          <div class="vn-static">${fmt(num(sc.nitros))}/${fmt(creepNitrosMax(sc))}</div>
          <div class="acc-mini-bar"><div class="acc-mini-fill" style="width:${creepNitrosMax(sc)>0 ? Math.max(0,Math.min(100,num(sc.nitros)/creepNitrosMax(sc)*100)) : 0}%"></div></div>
        </div>
      </div>
      <div class="chips-estados">${chips}<button type="button" class="chip-estado chip-add" data-addestado="${sc.id}">+ Estado</button></div>
      <button type="button" class="addhab" data-abriracciones="${sc.id}" style="margin-top:2px">⚡ Acciones</button>
      ${habsMiniHtml(sc)}
    </div>
  </div>`;
}

// Habilidades del creep, a mano en la tarjeta: nombre + Ver + Ejecutar (mismos botones que las Acciones).
function habsMiniHtml(sc){
  const habs = sc.habilidades || [];
  if(!habs.length) return '';
  return `<div class="habs-mini">${habs.map(h => {
    const bloqueo = bloqueoHabCreep(sc, h);
    const partes = [costoHabCreepTxt(sc, h)];
    if(num(h.cd) > 0) partes.push(`CD ${fmt(num(h.cd))}`);
    const titulo = (bloqueo ? bloqueo + ' · ' : '') + partes.join(' · ');
    return `<div class="hab-mini">
      <span class="hab-mini-nombre" title="${esc(titulo)}">${esc(h.nombre || 'Sin nombre')}</span>
      <button type="button" class="verbtn" data-verhabaccion="${sc.id}:${h.id}">Ver</button>
      <button type="button" class="hab-ejecutar" data-ejecutar="${sc.id}:${h.id}" title="${esc(titulo)}" ${bloqueo ? 'disabled' : ''}>${botonHabCreepTxt(h)}</button>
      ${botonSegundaHabCreep(h, sc)}
      ${cdControlesHtml(sc, h)}
    </div>`;
  }).join('')}</div>`;
}

// Banderas que un estado de creep puede llevar más allá de lo genérico
// (nombre/turnos/stacks/hpTurno/etc.) — se guardan/leen todas igual, así
// que un solo array evita repetirlas en los 4 lugares que las tocan
// (abrir editor, guardar, elegir preset, guardar como preset personalizado).
const FLAGS_ESTADO_CREEP = ['armaduraRota','silencio','confusion','lisiado','paralisis','esEscarcha','mitadPdgEva','inmovilizado','rengo','lento','cansado','exhausto','hypeado','sentado','excedenteVida','invulnerable','inmunidadCC','sangrePura','coagulacionExtrema','afortunado','blindado','espinas','espejo','esCC','esVeneno','esSangrado'];

// Presets estándar de estados: la lista vive en comun/estados-presets.js (una sola
// para ficha, gm-tools y mapa); acá se pide en la forma de un creep.
const ESTADOS_PRESET_GM = estadosPresetCreep();

const POLARIDAD_ESTADO_LABEL = {buff:'Buffs', debuff:'Debuffs', otro:'Otros'};
function optgroupsEstadosPresetHtml(){
  return ['buff','debuff','otro'].map(pol => {
    const opts = ESTADOS_PRESET_GM.map((p,i) => ({p,i})).filter(({p}) => (p.polaridad||'otro') === pol);
    if(!opts.length) return '';
    return `<optgroup label="${POLARIDAD_ESTADO_LABEL[pol]}">${opts.map(({p,i}) => `<option value="std:${i}">${esc(p.nombre)}</option>`).join('')}</optgroup>`;
  }).join('');
}
function optgroupsEstadosPersonalizadosHtml(){
  const personalizados = S.estadosPersonalizados || [];
  if(!personalizados.length) return '';
  return `<optgroup label="Mis presets">${personalizados.map((p,i) => `<option value="custom:${i}">${esc(p.nombre)}</option>`).join('')}</optgroup>`;
}

// Selector de presets con tarjetas — mismo mecanismo que "+ Estado" en
// ficha.html: clic en una tarjeta activa el estado directo sobre el
// creep, sin pasar por el editor. "Estado personalizado" abre el
// editor de siempre para armar uno de cero.
const CFG_PREGUNTAS_GM = {hp: 'hpTurno', statLabel: id => ATTR_LABELS[id] || STAT_LABEL_GM[id] || id};
function presetBtnHtmlCreep(p, valor, clase){
  const datos = [];
  if(valor.startsWith('std:')){
    // Los presets estándar ya traen el efecto pero no las cantidades: al activarlos se pregunta cada una.
    EstadoPreguntas.chips(p, CFG_PREGUNTAS_GM).forEach(t => datos.push(`<span class="preset-dato">${esc(t)}: a elegir</span>`));
    const detP = (p.detalle || '').trim();
    return `<button type="button" class="preset-btn ${clase}" data-presetcreep="${esc(valor)}">
    <span class="preset-nombre">${esc(p.nombre)}</span>
    ${datos.length ? `<span class="preset-datos">${datos.join('')}</span>` : ''}
    ${detP ? `<span class="preset-detalle">${esc(detP.length > 90 ? detP.slice(0, 88) + '…' : detP)}</span>` : ''}
  </button>`;
  }
  const hpTurno = num(p.hpTurno);
  if(hpTurno) datos.push(`<span class="preset-dato ${hpTurno > 0 ? 'bueno' : 'malo'}">${hpTurno > 0 ? '+' : ''}${fmt(hpTurno)} HP/turno</span>`);
  if(p.permanente) datos.push(`<span class="preset-dato">No vence</span>`);
  else if(num(p.turnos)) datos.push(`<span class="preset-dato">${fmt(num(p.turnos))} turnos</span>`);
  if(num(p.stacks) > 1) datos.push(`<span class="preset-dato">${fmt(num(p.stacks))} stacks</span>`);
  if(num(p.escudoMagico) > 0) datos.push(`<span class="preset-dato bueno">🛡${fmt(num(p.escudoMagico))}</span>`);
  (p.mods || []).forEach(m => {
    if(!m.stat) return;
    const v = num(m.val);
    datos.push(`<span class="preset-dato ${v > 0 ? 'bueno' : 'malo'}">${esc(ATTR_LABELS[m.stat] || m.stat)} ${v > 0 ? '+' : ''}${fmt(v)}</span>`);
  });
  const det = (p.detalle || '').trim();
  return `<button type="button" class="preset-btn ${clase}" data-presetcreep="${esc(valor)}">
    <span class="preset-nombre">${esc(p.nombre)}</span>
    ${datos.length ? `<span class="preset-datos">${datos.join('')}</span>` : ''}
    ${det ? `<span class="preset-detalle">${esc(det.length > 90 ? det.slice(0, 88) + '…' : det)}</span>` : ''}
  </button>`;
}

let presetsCreepScId = null;
// La grilla de presets sirve para dos destinos: aplicar directo a un creep abierto ('creep', de siempre) y el
// paso "Efectos" del 🎯/✨ de una habilidad ('duelo', 2026-09-28 — ver elegirEstadoDuelo más abajo).
let presetsCreepDestino = 'creep';
function abrirPresetsEstadoCreep(scId){
  presetsCreepDestino = 'creep';
  presetsCreepScId = scId;
  const propios = S.estadosPersonalizados || [];
  let html = '';
  ['buff','debuff','otro'].forEach(pol => {
    const del = ESTADOS_PRESET_GM.map((p,i) => ({p,i})).filter(({p}) => (p.polaridad || 'otro') === pol);
    if(!del.length) return;
    html += `<div class="preset-grupo">${POLARIDAD_ESTADO_LABEL[pol]} · ${fmt(del.length)}</div>`;
    html += `<div class="preset-grid">${del.map(({p,i}) => presetBtnHtmlCreep(p, `std:${i}`, pol)).join('')}</div>`;
  });
  if(propios.length){
    html += `<div class="preset-grupo">Mis presets · ${fmt(propios.length)}</div>`;
    html += `<div class="preset-grid">${propios.map((p,i) => presetBtnHtmlCreep(p, `custom:${i}`, 'propio')).join('')}</div>`;
  }
  $('#presets-creep-body').innerHTML = html;
  $('#presets-creep-personalizado').style.display = '';
  $('#scrim-presets-creep').classList.add('open');
}
// Selector real de estados para el paso "Efectos" del cuadro de Ejecución (2026-09-28, pedido del dueño —
// "siguiendo el mismo andamiaje" del selector de siempre, en vez de reinventar uno adentro de
// comun/asistente-duelo-hab.js): misma grilla + EstadoPreguntas, con "— Empezar en blanco —" (esto no lo tiene
// el selector de aplicar directo a un creep). Devuelve una Promise: null = canceló.
let presetDueloResolverGM = null;
function elegirEstadoDuelo(){
  return new Promise(resolve => {
    presetDueloResolverGM = resolve;
    presetsCreepDestino = 'duelo';
    const propios = S.estadosPersonalizados || [];
    let html = `<button type="button" class="preset-blanco" data-presetcreep="">— Empezar en blanco —</button>`;
    ['buff','debuff','otro'].forEach(pol => {
      const del = ESTADOS_PRESET_GM.map((p,i) => ({p,i})).filter(({p}) => (p.polaridad || 'otro') === pol);
      if(!del.length) return;
      html += `<div class="preset-grupo">${POLARIDAD_ESTADO_LABEL[pol]} · ${fmt(del.length)}</div>`;
      html += `<div class="preset-grid">${del.map(({p,i}) => presetBtnHtmlCreep(p, `std:${i}`, pol)).join('')}</div>`;
    });
    if(propios.length){
      html += `<div class="preset-grupo">Mis presets · ${fmt(propios.length)}</div>`;
      html += `<div class="preset-grid">${propios.map((p,i) => presetBtnHtmlCreep(p, `custom:${i}`, 'propio')).join('')}</div>`;
    }
    $('#presets-creep-body').innerHTML = html;
    $('#presets-creep-personalizado').style.display = 'none';
    $('#scrim-presets-creep').classList.add('open');
    $('#scrim-presets-creep').style.zIndex = 99600;   // encima del cuadro de Ejecución (z-index 99500)
  });
}
function cerrarPresetsDuelo(valor){
  $('#scrim-presets-creep').classList.remove('open');
  $('#scrim-presets-creep').style.zIndex = '';
  const resolver = presetDueloResolverGM;
  presetDueloResolverGM = null;
  if(resolver) resolver(valor);
}

function activarEstadoPresetCreep(preset){
  $('#scrim-presets-creep').classList.remove('open');
  const sc = S.creeps.find(s => s.id === presetsCreepScId);
  if(!sc) return;
  const datos = {
    nombre: preset.nombre,
    detalle: preset.detalle || '',
    turnos: preset.turnos ?? 0,
    stacks: preset.stacks ?? 1,
    hpTurno: preset.hpTurno ?? 0,
    stacksTurno: preset.stacksTurno ?? 0,
    activo: true,
    permanente: !!preset.permanente,
    escudoMagico: preset.escudoMagico ?? 0,
    forzarNitros: preset.forzarNitros ?? '',
    polaridad: preset.polaridad || 'otro',
    mods: structuredClone(preset.mods || []),
  };
  FLAGS_ESTADO_CREEP.forEach(f => { datos[f] = !!preset[f]; });
  // Inmunidades, acumulación (Armadura rota, Veneno, Sangrado, Escarcha) y renovación de uno igual: comun/combatiente.js.
  const r = Combatiente.agregarEstado(sc.estados, {id: uid(), ...datos}, {jefe: sc.jefe});
  if(!r.ok){ toast(`${sc.nombre}: inmune ahora mismo (${r.motivo}) — ${preset.nombre} no se pudo aplicar`); return; }
  if(r.que === 'yaLoTiene'){ toast(`${sc.nombre}: ${datos.nombre} ya lo tiene, no se acumula`); return; }
  if(modsAfectanHp(r.estado.mods)) actualizarHpMaxPorCon(sc);
  // Lo que se dispara (veneno, regeneración…) pega apenas se lo ponen (2026-10-06, P161).
  const dis = Combatiente.dispararAlAplicar(r, sc.estados, {hp: 'hpTurno', resFuego: CreepCalculo.resElemental(sc, 'fuego'), hpActual: sc.hp});
  if(dis.hp) sc.hp = Math.max(0, Math.min(num(sc.hpMax) || Infinity, num(sc.hp) + dis.hp));
  renderAll();
  toast(`${sc.nombre}: ${textoEstadoAgregado(r, 'hpTurno')}${dis.hp ? ` · ya ${dis.hp < 0 ? 'sacó' : 'curó'} ${fmt(Math.abs(dis.hp))} HP` : ''}`);
}
// Lo que se le avisa al que pone un estado (misma frase en la ficha, las invocaciones y los creeps).
function textoEstadoAgregado(r, campoHp){ return CreepEditor.textoEstadoAgregado(r, campoHp); }   // comun/creep-editor.js (A6c)


function aplicarPresetEstadoCreep(valor){
  if(presetsCreepDestino === 'duelo'){
    if(!valor){ cerrarPresetsDuelo({modo: 'manual'}); return; }
    const [tipoD, idxD] = valor.split(':');
    const presetD = (tipoD === 'std' ? ESTADOS_PRESET_GM : (S.estadosPersonalizados || []))[+idxD];
    if(!presetD){ cerrarPresetsDuelo(null); return; }
    const armar = p => ({modo: 'preset', nombre: p.nombre, turnos: p.turnos, permanente: !!p.permanente, hp: num(p.hpTurno), mods: p.mods, stacks: p.stacks, escudoMagico: num(p.escudoMagico), polaridad: p.polaridad, detalle: p.detalle});
    if(tipoD === 'std') EstadoPreguntas.pedir(presetD, CFG_PREGUNTAS_GM).then(armado => cerrarPresetsDuelo(armado ? armar(armado) : null));
    else cerrarPresetsDuelo(armar(presetD));
    return;
  }
  const [tipo, idx] = valor.split(':');
  const preset = (tipo === 'std' ? ESTADOS_PRESET_GM : (S.estadosPersonalizados || []))[+idx];
  if(!preset) return;
  // Un preset estándar pregunta sus cantidades (HP, turnos…) antes de activarse; los propios ya traen las que se eligieron.
  if(tipo === 'std') EstadoPreguntas.pedir(preset, CFG_PREGUNTAS_GM).then(armado => { if(armado) activarEstadoPresetCreep(armado); });
  else activarEstadoPresetCreep(preset);
}

const ATTR_IDS = ['con','fue','agl','des','esp'];
const ATTR_LABELS = {con:'Con', fue:'Fue', agl:'Agi', des:'Des', esp:'Esp'};

// Crea o refresca un estado del creep a partir de una habilidad con un
// efecto configurado (preset o a mano) — igual variedad que en ficha.html:
// nombre, turnos, stacks, HP por turno, detalle y modificadores de atributo.
// (Inmunidades — Invulnerable, Inmunidad a CC, Sangre pura, Coagulación extrema, jefe contra Stun — y acumular Veneno:
// Combatiente.agregarEstado, comun/combatiente.js.)

function aplicarEfectoDeConsumoCreep(sc, h){   // comun/creep-acciones.js (paso 4 etapa 4c, tanda 5)
  const r = CreepAcciones.efectoDeHab(sc, h, ESTADOS_PRESET_GM);
  if(r.aviso) toast(r.aviso);
  return r.estado;
}

// Tirada de una habilidad del creep: el stat vinculado (con su valor del
// momento) y/o la fórmula. Se pueden tener las dos.
function habCreepTira(h){ return CreepAcciones.habTira(h); }   // comun/creep-acciones.js
// Ejecutar tira SOLO la primera tirada que le corresponde (PdG, PdG.Esp u otro stat vinculado; si no hay stat, la fórmula).
// La fórmula (el daño o el efecto), si hay stat, va aparte con el botón 🎲 — igual que Atacar → Daño (2026-09-24).
function habCreepStatTirable(h, sc){ return CreepBotonera.habStatTirable(h, sc); }
function habCreepTieneSegunda(h, sc){ return CreepBotonera.habTieneSegunda(h, sc); }
