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
function filaSocialBotonera(i){
  return `<div class="cat-row bot-fila">
    <div class="bot-fila-info">
      <div class="cat-nombre">${esc(i.nombre)}</div>
      <div class="bot-fila-costo" title="${esc(tiradaSocialTxt(i))}">${esc(nivelSocialTxt(i))}</div>
    </div>
    <div class="bot-fila-btns">
      <button class="mini" data-view="sociales:${i.id}">Ver</button>
      <button class="ejecutar-btn con-lupa" data-tirarsocial="${i.id}">Ejecutar${lupaBotonHtml(`social:${i.id}`, "en-boton")}</button>
    </div>
  </div>`;
}

function renderBotonera(){
  const c = compute();
  let html = '';

  $('#botonera-badge-nitros').textContent = `No2 ${fmt(num(S.nitros))}/${fmt(nitrosMaximo(c))}`;
  const spMax = spMaximo(c);
  $('#botonera-badge-sp').textContent = `SP ${fmt(spMax - num(S.spGastado))}/${fmt(spMax)}`;
  $('#botonera-badge-def').textContent = `Def ${Number.isNaN(c.final.def) ? '?' : fmt(c.final.def)}`;

  // Habilidades sociales: arriba de todo en modo narrativo, al final (con
  // el resto de las habilidades) en modo combate — según lo que publique
  // el mapa (modoMapa; 'combate' si todavía no se sabe).
  const socialesHtml = `<div class="botonera-caja">
    <div class="cat-grouphead botonera-caja-head" style="margin-top:0"><button type="button" class="colapsar-btn" data-colapsar="botonera-sociales" title="Contraer/expandir">👁</button><span>Talentos</span></div>
    <div class="botonera-list-grid">
      ${S.sociales.length ? S.sociales.map(filaSocialBotonera).join('') : `<div class="hint">Sin talentos cargados.</div>`}
    </div>
  </div>`;
  if(modoMapa === 'narrativo') html += socialesHtml;

  // Los que ya tienen su propio botón en la caja de Combate (PdG, Dmg, Eva,
  // Parry, Bloqueo) no hace falta repetirlos acá. Los 5 principales (Con,
  // Fue, Agi, Des, Int) van siempre, igual que en el contenedor de Atributos.
  const STATS_REDUNDANTES_COMBATE = ['pdg', 'eva', 'parry', 'bloqueo'];
  const statsRollables = [
    ...ATTR_LIST,
    ...STAT_LIST.filter(s => !STATS_SIN_TIRADA.includes(s.id) && !STATS_REDUNDANTES_COMBATE.includes(s.id)),
  ];
  const fCombate = formulasCombate();
  // Parry y Bloqueo solo con un arma o un escudo equipado (regla del dueño, 2026-09-30): sin eso quedan apagados.
  const sinDefArma = !armasYEscudosParaParry().length;
  // El Bloqueo solo existe después de un Parry, con esa misma arma o escudo (regla del dueño, 2026-09-30).
  const armaBloqueo = parryArmaPendiente ? S.inventario.find(x => x.id === parryArmaPendiente && x.equipado) || null : null;
  // Aunque todavía no se pueda tirar, se ve QUÉ tirarías con cada arma o escudo, para decidir entre Parry y Evasión
  // (pedido del dueño, 2026-09-30): con uno, su fórmula; con varios, «Espada 1d8 · Escudo 1d10».
  const fBloq = it => (formulaParaValor(bloqueoValorConArma(it)) || {}).formula || '';
  const bloqueoPrevio = armaBloqueo ? fBloq(armaBloqueo)
    : (() => { const l = armasYEscudosParaParry(); return l.length === 1 ? fBloq(l[0].item) : l.map(a => `${a.item.nombre} ${fBloq(a.item)}`).join(' · '); })();
  // El Parry también se muestra por arma o escudo: cada uno suma solo sus propios bonos a Parry (P129).
  const fParryIt = it => { const f = formulaParaValor(statParaArma('parry', it)); return f ? f.formula + ' ÷2'.repeat(mitadesDeTirada(S.efectos, 'parry')) : ''; };
  const parryPrevio = (() => { const l = armasYEscudosParaParry(); return l.length === 1 ? fParryIt(l[0].item) : l.map(a => `${a.item.nombre} ${fParryIt(a.item)}`).join(' · '); })();
  // Con dos armas, Atacar y Daño se desdoblan: uno por arma.
  const armasBotonera = armasEquipadasConDano();
  // Estados alterados que modifican cada tirada (2026-09-25): el botón se pinta de verde/rojo y dice cuáles (comun/modificadores-tirada.js).
  const mtEva = ModTirada.tile(S.efectos, 'eva'), mtParry = ModTirada.tile(S.efectos, 'parry'), mtBloqueo = ModTirada.tile(S.efectos, 'bloqueo');

  // Percepción: tirada de Destreza (con dado más alto si tiene la pasiva Percepción aumentada).
  html += `<div class="botonera-caja" style="margin-bottom:8px"><button type="button" class="ejecutar-btn" data-botoneraaccion="percepcion" style="width:100%" title="Tirada de percepción: tu Destreza${tienePercepcionAumentada() ? ', con un dado más alto (Percepción aumentada)' : ''}">🔎 Tirar percepción${tienePercepcionAumentada() ? ' · dado más alto' : ''}</button></div>`;

  // Sentado: levantarse cuesta 1 No2 (ver levantarse).
  if(efectoSentado()){
    const falta = num(S.nitros) < num(IT2.nitrosLevantarse);
    html += `<div class="botonera-caja" style="margin-bottom:8px"><button class="ejecutar-btn${falta ? ' sin-recursos' : ''}" data-levantarse="1" style="width:100%" ${falta ? 'aria-disabled="true" title="No te alcanzan los Nitros"' : ''}>🧍 Levantarse · ${fmt(num(IT2.nitrosLevantarse))} No2</button></div>`;
  }

  // Sigilo: botón directo para quien tiene la habilidad (ver alternarSigilo).
  if(tieneSigilo()){
    const dentro = !!efectoSigilo();
    const falta = !dentro && num(S.nitros) < num(IT2.nitrosSigilo);
    html += `<div class="botonera-caja" style="margin-bottom:8px"><button class="ejecutar-btn${dentro ? ' usada' : ''}${falta ? ' sin-recursos' : ''}" data-sigilo="1" style="width:100%" ${falta ? 'aria-disabled="true" title="No te alcanzan los Nitros"' : ''}>🕶 ${dentro ? 'Salir del sigilo' : `Entrar en sigilo · ${fmt(num(IT2.nitrosSigilo))} No2`}</button></div>`;
  }

  html += `<div class="botonera-grid botonera-grid-even">
    <div class="botonera-caja">
      <div class="cat-grouphead botonera-caja-head" style="margin-top:0"><button type="button" class="colapsar-btn" data-colapsar="botonera-combate" title="Contraer/expandir">👁</button><span>Combate</span></div>
      <div class="botonera-combate-wrap">
        <div class="botonera-combate-grid">
          ${(armasBotonera.length ? armasBotonera : [null]).map(a => {
            const arma = a && a.item;
            const nombre = armasBotonera.length > 1 ? ` · ${esc(arma.nombre)}` : '';
            const fPdg = formulaParaValor(pdgParaArma(arma, c).valor);
            const costo = costoAtaqueNitros(arma);
            const sinNitros = costo > num(S.nitros);
            const mtP = ModTirada.tile(S.efectos, 'pdg');
            return `
          <button type="button" class="botonera-tile${sinNitros ? ' bt-sin-nitros' : ''}${mtP.clase}" data-botoneraaccion="atacar" data-arma="${arma ? arma.id : ''}" title="Atacar${arma ? ` con ${esc(arma.nombre)}` : ''} · ${fmt(costo)} No2${esc(mtP.titulo)}">
            ${lupaBotonHtml(`atacar:${arma ? arma.id : ''}`)}
            <span class="bt-label">Atacar (PdG)${nombre}</span><span class="bt-value bt-value-formula">🎲 ${esc(fPdg ? fPdg.formula : '')}</span>
            <span class="bt-mod">${fmt(costo)} No2${ataquesConArma(arma) ? '' : ' · 1.º ataque'}</span>${mtP.html}
          </button>
          <button type="button" class="botonera-tile" data-botoneraaccion="danio" data-arma="${arma ? arma.id : ''}" title="Daño${arma ? ` · ${esc(arma.nombre)}` : ''}" ${arma ? '' : 'disabled'}>
            ${arma ? lupaBotonHtml(`danio:${arma.id}`) : ''}
            <span class="bt-label">Daño${nombre || ' Arma'}</span><span class="bt-value bt-value-formula">🎲 ${esc(arma ? armaDanoTxt(arma, c.final.dmg) : 'sin arma equipada')}</span>
          </button>`;
          }).join('')}
        </div>
        <div class="botonera-combate-grid botonera-combate-bottom">
          <button type="button" class="botonera-tile${mtEva.clase}" data-botoneraaccion="esquivar" title="Esquivar${esc(mtEva.titulo)}">
            ${lupaBotonHtml('stat:eva')}${ModTirada.ayuda('eva')}
            <span class="bt-label">Esquivar (Eva)</span><span class="bt-value bt-value-formula">🎲 ${esc(fCombate.eva)}</span>${mtEva.html}
          </button>
          <button type="button" class="botonera-tile${mtParry.clase}${sinDefArma ? ' bt-sin-nitros' : ''}" data-botoneraaccion="parry" title="${esc(sinDefArma ? Combatiente.SIN_ARMA_DEFENSA : 'Parry con arma o escudo: siempre cuesta 1 No2 (' + costoParryTxt() + ')' + mtParry.titulo)}">
            ${lupaBotonHtml('stat:parry')}${ModTirada.ayuda('parry')}
            <span class="bt-label">Parry</span><span class="bt-value bt-value-formula">${sinDefArma ? 'sin arma ni escudo' : `🎲 ${esc(parryPrevio)}`}</span>${sinDefArma ? '' : mtParry.html}
          </button>
          <button type="button" class="botonera-tile${mtBloqueo.clase}${!armaBloqueo ? ' bt-sin-nitros' : ''}" data-botoneraaccion="bloqueo" title="${esc(sinDefArma ? Combatiente.SIN_ARMA_DEFENSA : !armaBloqueo ? Combatiente.BLOQUEO_SOLO_TRAS_PARRY + ': si ganaste el Parry, aguantás la fuerza del golpe con tu Fuerza + el peso de tu arma o escudo' : `Bloqueo con ${armaBloqueo.nombre} (tras el Parry): tu Bloqueo (de Fuerza) MÁS su peso; esa suma es el dado que tirás` + mtBloqueo.titulo)}">
            ${lupaBotonHtml('stat:bloqueo')}${ModTirada.ayuda('bloqueo')}
            <span class="bt-label">Bloqueo${armaBloqueo ? ` · ${esc(armaBloqueo.nombre)}` : sinDefArma ? '' : ' · tras el Parry'}</span><span class="bt-value bt-value-formula">${sinDefArma ? 'sin arma ni escudo' : `🎲 ${esc(bloqueoPrevio)}`}</span>${sinDefArma ? '' : mtBloqueo.html}
          </button>
          <button type="button" class="botonera-tile" data-botoneraaccion="fuerzagolpe" style="grid-column:1/-1" title="Fuerza del golpe: tu Fuerza + el peso de tu arma; esa suma es el dado. Es tu tirada contra el Bloqueo del defensor cuando gana el Parry.">
            <span class="bt-label">Fuerza del golpe (contra su Bloqueo)</span><span class="bt-value bt-value-formula">🎲 Fue + peso</span>
          </button>
        </div>
        <div class="botonera-defensa botonera-combate-bottom">
          <div class="botonera-tile bt-info" title="Defensa (no se tira)">
            ${lupaBotonHtml('defensa:def')}
            <span class="bt-label">Defensa</span><span class="bt-value">${Number.isNaN(c.final.def) ? '?' : fmt(c.final.def)}</span>
          </div>
          <div class="botonera-crit">
            <div class="botonera-crit-t">Resistencia a críticos</div>
            <div class="botonera-crit-grid">
              ${TIPOS_IDS.map(id => `
              <div class="botonera-tile bt-info" title="${esc(STAT_FULL[id])} (no se tira)">
                ${lupaBotonHtml(`defensa:${id}`)}
                <span class="bt-label">${esc(STAT_LABEL[id])}</span><span class="bt-value">${Number.isNaN(c.final[id]) ? '?' : fmt(c.final[id])}</span>
              </div>`).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="botonera-caja">
      <div class="cat-grouphead botonera-caja-head" style="margin-top:0"><button type="button" class="colapsar-btn" data-colapsar="botonera-stats" title="Contraer/expandir">👁</button><span>Tiradas de stats</span></div>
      <div class="botonera-stats-grid">
        ${statsRollables.map(s => {
          const m = c.modTotal[s.id];
          const valCls = m>0 ? 'mod-plus' : m<0 ? 'mod-minus' : '';
          const origins = c.mods[s.id] || [];
          const origenTxt = origins.length===1 ? origins[0].origen : origins.length>1 ? `${origins.length} orígenes` : '';
          const tituloMod = m ? ` — ${m>0?'+':''}${fmt(m)}${origenTxt?` (${esc(origenTxt)})`:''}` : '';
          return `
          <button type="button" class="botonera-tile" data-tirarstat="${s.id}" title="${esc(s.full || s.label)}${tituloMod}">
            ${lupaBotonHtml(`stat:${s.id}`)}
            <span class="bt-label">${esc(s.label)}</span>
            <span class="bt-value ${valCls}">${fmt(c.final[s.id])}</span>
            ${m ? `<span class="bt-mod">${m>0?'+':''}${fmt(m)}</span>` : ''}
          </button>`;
        }).join('')}
      </div>
    </div>
  </div>`;

  const consumiblesCinturon = S.cinturon.filter(i => i.consumible);
  const consumiblesMochila = S.inventario.filter(i => i.consumible);
  const filaConsumible = (i, key) => `<div class="cat-row bot-fila">
    <div class="bot-fila-info"><div class="cat-nombre">${esc(i.nombre)}</div></div>
    <div class="bot-fila-btns">
      <button class="mini" data-view="${key}:${i.id}">Ver</button>
      ${consumeButton(i, key, true)}
    </div>
  </div>`;

  html += `<div class="botonera-grid botonera-grid-even">
    <div class="botonera-caja">
      <div class="cat-grouphead botonera-caja-head" style="margin-top:0"><button type="button" class="colapsar-btn" data-colapsar="botonera-habilidades" title="Contraer/expandir">👁</button><span>Habilidades</span></div>
      <div class="botonera-list-grid">
        ${S.habilidades.length ? S.habilidades.map(i => {
          const sinNitros = sinNitrosPara(i);
          // Nombre y costo a la izquierda; Ver y Ejecutar siempre juntos a la derecha.
          return `<div class="cat-row bot-fila">
            <div class="bot-fila-info">
              <div class="cat-nombre">${esc(i.nombre)}</div>
              ${costoHabilidadTxt(i) ? `<div class="bot-fila-costo" title="Lo que cuesta ejecutarla">${esc(costoHabilidadTxt(i))}</div>` : ''}
            </div>
            <div class="bot-fila-btns">
              <button class="mini" data-view="habilidades:${i.id}">Ver</button>
              <button class="ejecutar-btn${habAutomatizada(i) ? ' con-lupa' : ''}${sinNitros?" sin-recursos":""}" data-ejecutar="${i.id}" ${sinNitros?'aria-disabled="true" title="No te alcanzan los recursos"':""}>${habAutomatizada(i) ? 'Ejecutar' + lupaBotonHtml(`habx:${i.id}`, "en-boton") : 'Anunciar'}</button>
              ${botonSegundaHab(i)}
            </div>
          </div>`;
        }).join('') : `<div class="hint">Sin habilidades cargadas.</div>`}
      </div>
    </div>
    <div class="botonera-caja">
      <div class="cat-grouphead botonera-caja-head" style="margin-top:0"><button type="button" class="colapsar-btn" data-colapsar="botonera-consumibles" title="Contraer/expandir">👁</button><span>Consumibles</span></div>
      <div class="botonera-list-grid">
        ${consumiblesCinturon.length ? consumiblesCinturon.map(i => filaConsumible(i, 'cinturon')).join('') : `<div class="hint">Sin consumibles en el cinturón.</div>`}
      </div>
    </div>
  </div>`;

  html += `<div class="botonera-caja">
    <div class="cat-grouphead botonera-caja-head" style="margin-top:0"><button type="button" class="colapsar-btn" data-colapsar="botonera-consumibles-mochila" title="Contraer/expandir">👁</button><span>Consumibles en mochila</span></div>
    <div class="botonera-list-grid">
      ${consumiblesMochila.length ? consumiblesMochila.map(i => filaConsumible(i, 'inventario')).join('') : `<div class="hint">Sin consumibles en la mochila.</div>`}
    </div>
  </div>`;

  if(modoMapa !== 'narrativo') html += socialesHtml;

  $('#botonera-body').innerHTML = html;
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
function jobCostoDe(x){
  if(!x || x.job === false) return 0;
  const n = num(x.jobCosto);
  const uno = x.jobCosto === undefined || x.jobCosto === null || x.jobCosto === "" ? 1 : Math.max(0, n);
  return uno * pasivaCompras(x);
}

// Inteligencia (el nuevo significado, reintroducido 2026-09-18 tras liberar
// el nombre al renombrar el atributo viejo a Especial): no es un atributo
// que se reparte, se calcula sola — 6 al crear el personaje, +3 por nivel.
// Se "invierte" en habilidades sociales (ver más abajo): el total no baja,
// es un presupuesto igual que el de Job (jobBudget) — lo gastado queda
// funcionando, "resto" es lo que falta repartir.
function inteligenciaAuto(){
  const nivel = Math.max(1, num(S.meta.nivel) || 1);
  return 6 + 3 * (nivel - 1);
}
// Total de Inteligencia: el automático (6 + 3 por nivel) o, si se fijó a mano (2026-09-24, pedido del dueño), ese valor libre.
function inteligenciaManual(){
  const m = S.meta.inteligenciaManual;
  return (m !== null && m !== undefined && m !== '' && Number.isFinite(Number(m))) ? Number(m) : null;
}
function inteligenciaValor(){
  const m = inteligenciaManual();
  return m !== null ? m : inteligenciaAuto();
}
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
function inteligenciaBudget(){
  const total = inteligenciaValor();
  const gastado = S.sociales.reduce((a, x) => a + Math.max(0, num(x.puntosInt)), 0);
  return {total, gastado, resto: total - gastado};
}
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
function nivelSocial(i){ return Math.max(0, num(i.puntosInt)) + Math.max(0, num(i.nivelExtra)); }
function dadoCarasSocial(i){ return nivelSocial(i) * 2; }
function nivelSocialTxt(i){
  const n = nivelSocial(i);
  const caras = dadoCarasSocial(i);
  return `Nivel ${fmt(n)}${caras ? ` · d${fmt(caras)}` : ''}`;
}
function formulaSocial(i){
  const caras = dadoCarasSocial(i);
  const inte = inteligenciaBudget().resto;
  return caras > 0 ? `1d${caras}+${inte}` : `+${inte}`;
}
function tiradaSocialTxt(i){
  const caras = dadoCarasSocial(i);
  return `Tira ${caras ? `1d${caras} + ` : ''}Inteligencia sin invertir (${fmt(inteligenciaBudget().resto)})`;
}
function tirarSocial(i){
  const r = tirarDados(formulaSocial(i));
  if(!r){ toast(`${i.nombre}: sin nivel ni Inteligencia sin invertir — no hay nada que tirar`); return; }
  registrarTirada(i.nombre, r);
}

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
  const nivel = Math.max(1, num(S.meta.nivel) || 1);
  const total = 3 + 3 * (nivel - 1);
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
// mecánica real del preset "Afortunado".
const EFECTO_FLAGS_ESPECIALES = ['esCC', 'esVeneno', 'esSangrado', 'afortunado', 'invulnerable',
  'inmunidadCC', 'sangrePura', 'coagulacionExtrema', 'blindado', 'espinas', 'mitadPdgEva',
  'lisiado', 'paralisis', 'esEscarcha', 'inmovilizado', 'rengo', 'cansado', 'exhausto', 'hypeado', 'sentado', 'armaduraRota', 'escudoMagico', 'excedenteVida', 'forzarNitros'];
function flagsDePreset(nombrePreset){
  const p = presetPorNombre(EFECTOS_PRESET, (nombrePreset || '').trim());
  if(!p) return {};
  const out = {polaridad: p.polaridad};
  EFECTO_FLAGS_ESPECIALES.forEach(f => { if(p[f] !== undefined) out[f] = p[f]; });
  return out;
}

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

