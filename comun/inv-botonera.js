/* =========================================================
   INV-BOTONERA — el dibujo de la Botonera de una invocación, fuera de la ficha (paso 4, etapa 4e, tanda 2 de
   docs/plan-paso4-etapa4.md, 2026-10-01)
   Lo que antes vivía en ficha-personaje/js/04-invocaciones.js (renderBotoneraInv y botonSegundaHabInv), copiado tal cual con la
   invocación como parámetro: arma el HTML (Combate, Defensa y resistencias, Tiradas de stats, Habilidades). No hace nada al
   tocar los botones: cada pantalla engancha los `data-*` de siempre (data-invtirarstat, data-invatacar…).
   html(inv, o) → {titulo, badge, html}. o: {parryPendiente: true si tiene un Parry esperando su Bloqueo, lupa: false para no
       dibujar las 🔍}.
   Necesita comun/inv-calculo.js, combatiente.js, ficha-calculo.js (STAT_LABEL), ficha-botonera.js (modoHab),
   modificadores-tirada.js y tiradas.js (formulaParaValor); la 🔍, lupa.js.
   ========================================================= */
const InvBotonera = (() => {
  const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
  const fmt = n => Number.isInteger(n) ? n : Math.round(n*100)/100;
  const esc = s => String(s??'').replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
  const I = InvCalculo;

  const botonSegundaHab = (inv, h) => (h.tiradaStat && (h.tiradaExtra||'').trim())
    ? `<button type="button" class="mini" data-danohabinv="${inv.id}:${h.id}" title="Segunda tirada de la habilidad (daño o efecto): ${esc(String(h.tiradaExtra).trim())}">🎲 ${esc(String(h.tiradaExtra).trim())}</button>` : '';

  function html(inv, o){
    o = o || {};
    const lupaBotonHtml = (clave, cls) => o.lupa === false || typeof window.lupaBotonHtml !== 'function' ? '' : window.lupaBotonHtml(clave, cls);
    const costoAtaque = I.costoAtaque(inv);
    const sinNitrosAtaque = num(inv.nitros) < costoAtaque;
    const cualAtaque = num(inv.ataquesTurno) === 0 ? 'primer ataque del turno (Tipo ÷ 2)' : 'ataque extra (Tipo completo)';
    const titulo = inv.nombre, badge = `No2 ${fmt(num(inv.nitros))}/${fmt(I.nitrosMax(inv))}`;

    const tilesStats = I.INV_STATS_TIRADA_IDS.map(id => `
      <button type="button" class="botonera-tile" data-invtirarstat="${inv.id}:${id}" title="${esc(FichaCalculo.STAT_LABEL[id]||id)}">
        ${lupaBotonHtml(`inv:${inv.id}:stat:${id}`)}
        <span class="bt-label">${esc(FichaCalculo.STAT_LABEL[id]||id)}</span>
        <span class="bt-value">${fmt(I.statValor(inv, id))}</span>
      </button>`).join('');

    const f = v => { const x = formulaParaValor(v); return x ? x.formula : ''; };
    const defInv = I.defensa(inv);
    const combate = [
      {stat:'pdg', nombre:`Atacar (PdG) · ${fmt(costoAtaque)} No2`, dado: f(I.statValor(inv,'pdg')), sinNitros: sinNitrosAtaque, clave:`inv:${inv.id}:atacar`, motivo:`${sinNitrosAtaque?'Sin No2 · ':''}Cuesta ${fmt(costoAtaque)} No2 · ${cualAtaque}`, attr:`data-invatacar="${inv.id}"`},
      {nombre:'Daño Arma', dado: I.danoTxt(inv, I.statValor(inv,'dmg')), clave:`inv:${inv.id}:danio`, motivo:'Sin costo', attr:`data-invdanio="${inv.id}"`},
      {stat:'eva', nombre:'Esquivar (Eva)', dado: Combatiente.stuneado(inv.estados) ? '1 (Stun)' : f(I.statValor(inv,'eva')), clave:`inv:${inv.id}:stat:eva`, motivo:'Sin costo', attr:`data-invtirarstat="${inv.id}:eva"`},
      // Parry y Bloqueo solo con un arma de verdad o un escudo (regla del dueño, 2026-09-30): sin eso, o con un arma
      // natural, no aparecen (I.defensa).
      ...(defInv ? [{stat:'parry', nombre:`Parry · ${fmt(Combatiente.costoParry())} No2`, dado: f(I.statValor(inv,'parry')), sinNitros: num(inv.nitros) < Combatiente.costoParry(), clave:`inv:${inv.id}:stat:parry`, motivo:`${num(inv.nitros) < Combatiente.costoParry() ? 'Sin No2 · ' : ''}Cuesta ${fmt(Combatiente.costoParry())} No2 · con ${defInv.nombre}`, attr:`data-invtirarstat="${inv.id}:parry"`},
        o.parryPendiente
          ? {stat:'bloqueo', nombre:`Bloqueo · ${defInv.nombre}`, dado: f(I.bloqueoValor(inv)), clave:`inv:${inv.id}:stat:bloqueo`, motivo:`Tras el Parry · sin costo · su Bloqueo + el Peso de ${defInv.nombre} (${fmt(num(defInv.peso))}) es el dado`, attr:`data-invtirarstat="${inv.id}:bloqueo"`}
          // Apagado hasta el Parry, pero muestra lo que tiraría (para decidir entre Parry y Evasión).
          : {stat:'bloqueo', nombre:'Bloqueo · tras el Parry', dado: f(I.bloqueoValor(inv)), sinNitros: true, clave:`inv:${inv.id}:stat:bloqueo`, motivo: `${Combatiente.BLOQUEO_SOLO_TRAS_PARRY} · con ${defInv.nombre} tiraría esto`, attr:`data-invtirarstat="${inv.id}:bloqueo"`}] : []),
    ];
    // Levantarse y Soltarse (2026-10-03): las mismas que un personaje y un creep, con lo que tira y cuesta escrito en el botón.
    const lv0 = Combatiente.levantable(inv.estados), lvInv = lv0 && lv0.arma && o.armaEnElPiso ? null : lv0, sentadaInv = !!lvInv, armaInv = !!(lvInv && lvInv.arma), soltableInv = Combatiente.estadoSoltable(inv.estados);   // (o Desarmado, 2026-10-07)
    const costoLev = armaInv ? Combatiente.COSTO_LEVANTAR_ARMA : Math.max(0, num(FichaCalculo.IT2.nitrosLevantarse) - num(I.modTotal(inv, 'levantarse'))), sSol = soltableInv && Combatiente.soltarNorm(soltableInv.soltar);
    // Las armas en el piso al lado (el mapa las pasa, 2026-10-07): las levanta cualquiera, 1 No2 cada una.
    const tilesArmas = (o.armasCerca || []).map(a => `
      <button type="button" class="botonera-tile${num(inv.nitros) < Combatiente.COSTO_LEVANTAR_ARMA ? ' bt-sin-nitros' : ''}" data-invlevantararma="${inv.id}:${a.id}" title="Cuesta 1 No2. Si es la suya, vuelve a tenerla; si no, se la queda"><span class="bt-label">🗡 Levantar ${esc(a.nombre)}${a.propia ? ' (la suya)' : ''} · ${fmt(Combatiente.COSTO_LEVANTAR_ARMA)} No2</span></button>`).join('');
    const tilesExtra = (sentadaInv ? `
      <button type="button" class="botonera-tile${num(inv.nitros) < costoLev ? ' bt-sin-nitros' : ''}" data-invlevantarse="${inv.id}" title="Cuesta ${fmt(costoLev)} No2 y saca el estado ${armaInv ? 'Desarmado' : 'Sentado'}"><span class="bt-label">${armaInv ? '🗡 Levantar el arma' : '🧍 Levantarse'} · ${fmt(costoLev)} No2</span></button>` : '')
      + (sSol ? `
      <button type="button" class="botonera-tile${num(inv.nitros) < sSol.no2 ? ' bt-sin-nitros' : ''}" data-invsoltarse="${inv.id}" title="${esc(`${soltableInv.nombre}: tira ${sSol.etq} contra ${sSol.dif}; si llega, se suelta. Cuesta ${sSol.no2} No2 aunque no lo logre`)}"><span class="bt-label">${esc(Combatiente.textoSoltarse(soltableInv))}</span></button>` : '');
    // Atacar es siempre un ataque normal (dueño, 2026-10-06): la oportunidad y el contraataque los ofrece el mapa solo; esto, a mano.
    const tileOtro = `
      <button type="button" class="botonera-tile" data-invotroataque="${inv.id}" title="A mano, por si el mapa no lo detectó: el ataque de oportunidad se ofrece solo cuando un rival se aleja, y el contraataque después de ganar el Parry y el Bloqueo. Atacar es siempre un ataque normal." style="opacity:.75;min-height:0"><span class="bt-label">↪ Oportunidad o contraataque, a mano</span></button>`;
    const tilesCombate = tilesExtra + tilesArmas + combate.map(c => {
      const mt = c.stat ? ModTirada.tile(inv.estados, c.stat) : {clase: '', html: '', titulo: ''};
      return `
      <button type="button" class="botonera-tile${c.sinNitros?' bt-sin-nitros':''}${mt.clase}" ${c.attr} title="${esc(c.motivo + mt.titulo)}">
        ${lupaBotonHtml(c.clave)}${ModTirada.ayuda(c.stat)}
        <span class="bt-label">${esc(c.nombre)}</span><span class="bt-value bt-value-formula">🎲${c.dado?` ${esc(c.dado)}`:''}</span>${mt.html}
      </button>`;
    }).join('') + tileOtro;

    const filasHab = inv.habilidades.map(h => {
      const bloqueo = I.bloqueoHab(inv, h);
      const motivo = [I.costoHabTxt(inv,h), num(h.cd)>0?`CD ${fmt(num(h.cd))}`:''].filter(Boolean).join(' · ');
      return `<div class="cat-row bot-fila">
        <div class="bot-fila-info">
          <div class="cat-nombre">${esc(h.nombre||'Sin nombre')}</div>
          <div class="bot-fila-costo">${esc(bloqueo || motivo)}</div>
        </div>
        <div class="bot-fila-btns">
          <button type="button" class="mini" data-verhabinv="${inv.id}:${h.id}">Ver</button>
          <button type="button" class="ejecutar-btn con-lupa${bloqueo?' sin-recursos':''}${Combatiente.esFlash(h) ? ' bt-flash' : ''}" data-ejecutarhabinv="${inv.id}:${h.id}" ${bloqueo?`aria-disabled="true" title="${esc(bloqueo)}"`:''}>${FichaBotonera.modoHab(h) === 'manual' ? 'Anunciar' : 'Ejecutar'}${lupaBotonHtml(`inv:${inv.id}:hab:${h.id}`, 'en-boton')}</button>
          ${botonSegundaHab(inv, h)}
        </div>
      </div>`;
    }).join('');

    return {titulo, badge, html: `
      <div class="botonera-grid botonera-grid-even">
        <div class="botonera-caja">
          <div class="cat-grouphead" style="margin-top:0"><span>Combate</span></div>
          <div class="botonera-combate-grid">${tilesCombate}</div>
          <div class="botonera-valores">
            <div class="botonera-valores-t">Valores (no se tiran)</div>
            <div class="botonera-valores-fila">
              <div class="botonera-tile bt-info" title="Defensa (no se tira)">
                <span class="bt-label">Defensa</span><span class="bt-value">${fmt(I.defensaEfectiva(inv))}</span>
              </div>
              <div class="botonera-tile bt-info" title="Defensa especial: se resta al daño de casteo que ignora la Defensa (no se tira)">
                <span class="bt-label">Armad. mágica</span><span class="bt-value">${fmt(Math.max(0, num(I.statValor(inv, 'armadmg'))))}</span>
              </div>
            </div>
            <div class="botonera-crit">
              <div class="botonera-crit-t">Resistencia a críticos</div>
              <div class="botonera-crit-grid">
                ${[0, 1, 2, 3, 4].map(i => `
                <div class="botonera-tile bt-info" title="Resistencia a crítico Tipo ${4 + 2 * i} (no se tira)">
                  <span class="bt-label">Tipo ${4 + 2 * i}</span><span class="bt-value">${fmt(I.critEfectivo(inv, i))}</span>
                </div>`).join('')}
              </div>
            </div>
            ${Combatiente.resElementalesHtml(el => I.statValor(inv, 'res' + el))}
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
      </div>` + Combatiente.FLASH_CSS};
  }

  return {html, botonSegundaHab};
})();
