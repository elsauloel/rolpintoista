/* =========================================================
   FICHA-STATS — los atributos y stats de un personaje (la ventana 📊 Stats), para cualquier pantalla (2026-10-02, hoja de ruta A6a de
   docs/pendientes.md: el mapa la muestra él mismo, sin abrir la ficha escondida)
   Lo que antes vivía en la ficha (js/02 attrBudget, renderAttrs, statTile, breakdown; js/06 el cambio de un atributo y de una fórmula),
   copiado tal cual con el personaje (`S`) como parámetro:
   - presupuesto(S): {total, usado, pend} — los puntos de atributo (33 + 3 por nivel).
   - puntosHtml(S), atributosHtml(S, abierto): el contador de puntos y los cinco atributos con sus derivados; `abierto` es el stat con
     su desglose a la vista (el de siempre: tocar un stat lo abre). statTile(d, c, conMod) y desglose(S, id, c) por separado.
   - cambiarAtributo(S, attrId, valorFinal, mod): el número grande de un atributo — guarda el valor propio (final − lo que suma el
     equipo/estados) y la vida y los No2 siguen a su máximo nuevo (si estaban llenos, siguen llenos; si no, solo se recortan).
   - cambiarFormula(S, id, txt): la fórmula de un stat derivado.
   Necesita comun/ficha-calculo.js y ficha-botonera.js (STATS_CON_TIRADA_IDS).
   ========================================================= */
const FichaStats = (() => {
  const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
  const fmt = n => Number.isInteger(n) ? n : Math.round(n*100)/100;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const C = () => FichaCalculo;

  function presupuesto(S){
    const nivel = Math.max(1, num(S.meta.nivel) || 1);
    const total = 33 + 3 * (nivel - 1);
    const usado = C().ATTR_LIST.reduce((a,at) => a + num(S.attrs[at.id]), 0);
    return {total, usado, pend: total - usado};
  }
  function puntosHtml(S){
    const pb = presupuesto(S);
    return `
    <span class="pt-label">Puntos de atributo</span>
    <span class="pt-nums">${pb.usado} / ${pb.total}</span>
    ${pb.pend !== 0 ? `<span class="pt-pend ${pb.pend<0?'over':''}">${pb.pend>0?`+${pb.pend} por asignar`:`${Math.abs(pb.pend)} de más`}</span>` : `<span class="pt-ok">al día</span>`}
  `;
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
    const puedeTirar = FichaBotonera.STATS_CON_TIRADA_IDS.includes(d.id);
    return `<div class="d ${cls}" data-stat="${d.id}" title="${esc(d.full)}">
    <span class="dl">${d.label}</span>
    <span class="dv ${valCls}">${val}</span>
    ${puedeTirar ? `<button type="button" class="dado-btn" data-tirarstat="${d.id}" title="Tirar dados para ${esc(d.full)}">🎲</button>` : ''}
    ${descHtml}
  </div>`;
  }
  function desglose(S, id, c){
    const rows = (c.mods[id]||[]).map(m =>
      `<div class="row"><span>${esc(m.origen)}</span><b>${m.val>0?'+':''}${fmt(m.val)}</b></div>`).join('');
    const attr = C().ES_ATTR(id);
    const baseTxt = Number.isNaN(c.base[id]) ? 'fórmula inválida' : fmt(c.base[id]);
    const L = C().STAT_LABEL, F = C().STAT_FULL;
    return `<div class="breakdown">
    <div class="row"><span>${attr ? 'Valor propio' : 'Base'}</span><b>${baseTxt}</b></div>
    ${rows || '<div class="row" style="opacity:.6"><span>Sin modificadores activos</span><b>–</b></div>'}
    <div class="row tot"><span>${L[id]} · ${F[id]}</span><b>${Number.isNaN(c.final[id])?'?':fmt(c.final[id])}</b></div>
    ${attr
      ? `<div class="hint" style="margin-top:7px">Los derivados de ${F[id]} usan ${fmt(c.final[id])}, no ${fmt(c.base[id])}. Editá el valor propio desde el número grande de arriba.</div>`
      : `<div class="fx"><span style="color:var(--copper)">fx</span><input data-formula="${id}" value="${esc((S.formulas || {})[id]||'')}"></div>`}
  </div>`;
  }
  function atributosHtml(S, abierto){
    const c = C().calcular(S);
    return C().GRUPOS.map(g => {
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
        ${(abierto === g.id || g.derived.some(d=>d.id===abierto)) ? desglose(S, abierto, c) : ''}
      </div>
    </div>`;
    }).join('');
  }
  // HP y Nitros dependen de atributos: si estaban llenos, siguen llenos con el nuevo máximo; si no, solo se recortan si se pasan
  // (nunca "curan" de arriba). Si S.nitros sigue null (no solidificado), se deja así.
  function cambiarAtributo(S, attrId, valor, mod){
    const antes = C().calcular(S);
    const hpMaxAntes = Number.isNaN(antes.final.hpmax) ? 0 : antes.final.hpmax;
    const hpFull = num(S.hp) >= hpMaxAntes;
    const nitrosSolidificado = S.nitros !== null && S.nitros !== undefined;
    const nitrosMaxAntes = Number.isNaN(antes.final.nitros) ? 0 : antes.final.nitros;
    const nitrosFull = nitrosSolidificado && num(S.nitros) >= nitrosMaxAntes;
    S.attrs[attrId] = num(valor) - num(mod);
    const despues = C().calcular(S);
    const hpMaxDespues = Number.isNaN(despues.final.hpmax) ? 0 : despues.final.hpmax;
    S.hp = hpFull ? hpMaxDespues : Math.min(num(S.hp), hpMaxDespues);
    if(nitrosSolidificado){
      const nitrosMaxDespues = Number.isNaN(despues.final.nitros) ? 0 : despues.final.nitros;
      S.nitros = nitrosFull ? nitrosMaxDespues : Math.min(num(S.nitros), nitrosMaxDespues);
    }
  }
  function cambiarFormula(S, id, txt){ S.formulas[id] = txt; }

  return {presupuesto, puntosHtml, statTile, desglose, atributosHtml, cambiarAtributo, cambiarFormula};
})();
