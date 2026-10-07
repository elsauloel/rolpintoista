/* =========================================================
   CREEP-BOTONERA — el dibujo de las Acciones de un creep, fuera de GM Tools (paso 4, etapa 4b de docs/plan-paso4-etapa4.md,
   2026-10-01)
   Lo que antes vivía en gm-toolset (renderAccionesCreep y formulasCombateCreep en js/03, botonSegundaHabCreep en js/04,
   cdControlesHtml en js/01), copiado tal cual: arma el HTML de la ventana de Acciones (Combate, Defensa y resistencias,
   Tiradas de stats, Habilidades) a partir del creep (`sc`). Así la dibujan igual GM Tools y el mapa. No hace nada al tocar los
   botones: cada pantalla engancha los `data-*` de siempre.
   html(sc, o) → {titulo, badge, html}. o: {parryPendiente: true si el creep tiene un Parry esperando su Bloqueo,
       lupa: false para no dibujar las 🔍}.
   Necesita comun/combatiente.js, creep-calculo.js, modificadores-tirada.js y tiradas.js (formulaParaValor); la 🔍, lupa.js.
   ========================================================= */
const CreepBotonera = (() => {
  const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
  const fmt = n => Number.isInteger(n) ? n : Math.round(n*100)/100;
  const esc = s => String(s??'').replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
  const C = () => CreepCalculo;

  // Qué dado va a tirar cada botón de Combate, para no tener que
  // adivinarlo antes de apretar (igual que en la ficha).
  function formulasCombate(sc){
    const f = (v, id) => { const x = formulaParaValor(v); return x ? x.formula + ' ÷2'.repeat(Combatiente.mitadesDeTirada(sc.estados, id)) : ''; };
    return {
      pdg: f(C().statValor(sc, 'pdg'), 'pdg'),
      eva: f(C().statValor(sc, 'eva'), 'eva'),
      parry: f(C().statValor(sc, 'parry'), 'parry'),
      bloqueo: f(C().bloqueoValor(sc)),
      fuerza: f(C().fuerzaGolpeValor(sc)),
    };
  }

  // Ejecutar tira SOLO la primera tirada que le corresponde (PdG, PdG.Esp u otro stat vinculado; si no hay stat, la fórmula).
  // La fórmula (el daño o el efecto), si hay stat, va aparte con el botón 🎲 — igual que Atacar → Daño (2026-09-24).
  function habStatTirable(h, sc){ return !!(sc && h.tiradaStat && C().STAT_LOOKUP[h.tiradaStat]); }
  function habTieneSegunda(h, sc){ return habStatTirable(h, sc) && !!String(h.tiradaExtra || "").trim(); }
  const botonSegundaHab = (h, sc) => habTieneSegunda(h, sc)
    ? `<button type="button" class="verbtn" data-danohabcreep="${sc.id}:${h.id}" title="Segunda tirada (daño o efecto): ${esc(String(h.tiradaExtra).trim())}">🎲 ${esc(String(h.tiradaExtra).trim())}</button>` : '';
  const botonHabTxt = h => C().modoHab(h) === 'manual' ? 'Anunciar' : 'Ejecutar';

  // Cooldown de una habilidad de creep, a mano (2026-09-24, pedido del dueño): el GM puede subirlo, bajarlo o resetearlo en cualquier
  // momento, por ejemplo después de ejecutar una habilidad para probar algo. − y + cambian los turnos que le quedan; ↺ (solo con
  // cooldown activo) lo deja en 0.
  function cdControlesHtml(sc, h){
    const v = Math.max(0, num(h.cdActual));
    const ref = `${sc.id}:${h.id}`;
    return `<span class="cd-ctl" title="Cooldown: turnos que le quedan a esta habilidad">
    <button type="button" data-cdmod="${ref}:-1" title="Un turno menos de cooldown">−</button>
    <span class="cd-val${v > 0 ? ' activo' : ''}">CD ${fmt(v)}</span>
    <button type="button" data-cdmod="${ref}:1" title="Un turno más de cooldown">+</button>
    ${v > 0 ? `<button type="button" data-cdmod="${ref}:reset" title="Resetear el cooldown (queda listo para usarse)">↺</button>` : ''}
  </span>`;
  }

  function html(sc, o){
    o = o || {};
    const lupaBotonHtml = (clave, cls) => o.lupa === false || typeof window.lupaBotonHtml !== 'function' ? '' : window.lupaBotonHtml(clave, cls);
    const {statValor, defensa, danoTxt, costoParry, costoAtaque, bloqueoHab, costoNitrosHab, costoHabTxt, defensaEfectiva, armadmgEfectiva, critEfectivo, nitrosMax, pesoArma, STAT_LOOKUP, STATS_TIRADA_IDS} = C();
    const costoAtaqueSc = costoAtaque(sc);
    const sinNitrosAtaque = num(sc.nitros) < costoAtaqueSc;
    const cualAtaque = num(sc.ataquesTurno) === 0 ? 'primer ataque del turno (Tipo ÷ 2)' : 'ataque extra (Tipo completo)';

    const tilesStats = STATS_TIRADA_IDS.map(id => STAT_LOOKUP[id]).map(d => `
    <button type="button" class="botonera-tile" data-tirarstatcreep="${sc.id}:${d.id}" title="${esc(d.label)}">
      ${lupaBotonHtml(`${sc.id}|stat|${d.id}`)}
      <span class="bt-label">${esc(d.label)}</span>
      <span class="bt-value">${fmt(statValor(sc, d.id))}</span>
    </button>`).join('');

    const fc = formulasCombate(sc);
    const defCreep = defensa(sc);
    const combate = [
      // Atacar sin No2 no se deshabilita (un botón deshabilitado no deja abrir la 🔍): al tocarlo avisa.
      {stat:'pdg', nombre:`Atacar (PdG) · ${fmt(costoAtaqueSc)} No2`, dado: fc.pdg, sinNitros: sinNitrosAtaque, lupa:'atacar', motivo: `${sinNitrosAtaque ? 'Sin No2 · ' : ''}Cuesta ${fmt(costoAtaqueSc)} No2 · ${cualAtaque}`, attr:`data-atacarcreep="${sc.id}"`},
      {nombre:'Daño Arma', dado: danoTxt(sc, statValor(sc, 'dmg')), lupa:'danio', motivo:'Sin costo', attr:`data-daniocreep="${sc.id}"`},
      {stat:'eva', nombre:'Esquivar (Eva)', dado: Combatiente.stuneado(sc.estados) ? '1 (Stun)' : fc.eva, lupa:'stat|eva', motivo:'Sin costo', attr:`data-esquivarcreep="${sc.id}"`},
      // Parry y Bloqueo solo con un arma de verdad o un escudo (regla del dueño, 2026-09-30): sin eso, o con un arma
      // natural, no aparecen (defensa).
      ...(defCreep ? [{stat:'parry', nombre:`Parry · ${fmt(costoParry(sc))} No2`, dado: fc.parry, sinNitros: num(sc.nitros) < costoParry(sc), lupa:'stat|parry', motivo:`${num(sc.nitros) < costoParry(sc) ? 'Sin No2 · ' : ''}Cuesta ${fmt(costoParry(sc))} No2 · con ${defCreep.nombre}`, attr:`data-parrycreep="${sc.id}"`},
        // El Bloqueo solo se tira después de un Parry; antes queda apagado pero muestra lo que tiraría (para decidir).
        o.parryPendiente
          ? {stat:'bloqueo', nombre:`Bloqueo · ${defCreep.nombre}`, dado: fc.bloqueo, lupa:'stat|bloqueo', motivo:`Tras el Parry · sin costo · su Bloqueo + el Peso de ${defCreep.nombre} (${fmt(num(defCreep.peso))}) es el dado`, attr:`data-bloqueocreep="${sc.id}"`}
          : {stat:'bloqueo', nombre:'Bloqueo · tras el Parry', dado: fc.bloqueo, sinNitros: true, lupa:'stat|bloqueo', motivo:`${Combatiente.BLOQUEO_SOLO_TRAS_PARRY} · con ${defCreep.nombre} tiraría esto`, attr:`data-bloqueocreep="${sc.id}"`}] : []),
      {nombre:'Fuerza del golpe', dado: fc.fuerza, motivo:`Sin costo · su Fuerza + el Peso de su arma (${fmt(pesoArma(sc))}) es el dado: su tirada contra el Bloqueo del defensor`, attr:`data-fuerzacreep="${sc.id}"`},
    ];
    // Atacar es siempre un ataque normal (dueño, 2026-10-06): la oportunidad y el contraataque los ofrece el mapa solo; esto, a mano.
    combate.push({nombre: '↪ Oportunidad o contraataque, a mano', dado: '', soloTexto: true, motivo: 'A mano, por si el mapa no lo detectó: el ataque de oportunidad se ofrece solo cuando un rival se aleja, y el contraataque después de ganar el Parry y el Bloqueo. Atacar es siempre un ataque normal.', attr: `data-otroataquecreep="${sc.id}"`});
    // ✨ Sus armas especiales (2026-10-05): un «Atacar» más cada una, con su costo (No2) y su espera (el SP de un creep, ver CreepAcciones).
    if(typeof CreepAcciones !== 'undefined' && CreepAcciones.especialesCreep) CreepAcciones.especialesCreep(sc).forEach(it => {
      const c = CreepAcciones.costoEspecialCreep(sc, it), e = it.especial || {}, sinNitros = num(sc.nitros) < c.no2;
      combate.push({nombre: `✨ Atacar · ${e.nombre || it.nombre} · ${fmt(c.no2)} No2${c.enEspera ? ` · en espera ${fmt(c.enEspera)}` : ''}`, dado: e.dano ? `${e.dano}${e.sumaEspecial ? ' + Ef.Esp' : ''}` : '✨',
        sinNitros: sinNitros || c.enEspera > 0, motivo: `${c.enEspera ? `En espera ${fmt(c.enEspera)} turno(s) · ` : sinNitros ? 'Sin No2 · ' : ''}Cuesta ${fmt(c.no2)} No2 y deja ${fmt(c.espera)} turno(s) de espera (su SP ${fmt(num(e.sp))}) · ${String(it.detalle || '').split(' ⚙')[0]}`,
        attr: `data-especialcreep="${sc.id}:${it.id}"`});
    });
    // Sentado: levantarse cuesta 1 No2 y saca el estado (ver data-levantarcreep).
    const sentadoCreep = (sc.estados || []).some(e => e.activo !== false && e.sentado);
    if(sentadoCreep){
      const sinNitrosLev = num(sc.nitros) < 1;
      combate.push({nombre:'🧍 Levantarse · 1 No2', dado:'', soloTexto:true, sinNitros: sinNitrosLev, motivo: `${sinNitrosLev ? 'Sin No2 · ' : ''}Cuesta 1 No2 y saca el estado Sentado`, attr:`data-levantarcreep="${sc.id}"`});
    }
    // Soltarse (2026-10-03): el estado que dejó una trampa de Atrapar dice qué tira y cuánto cuesta.
    const soltableCreep = Combatiente.estadoSoltable(sc.estados);
    if(soltableCreep){
      const s = Combatiente.soltarNorm(soltableCreep.soltar), sinNitrosSol = num(sc.nitros) < s.no2;
      combate.push({nombre: Combatiente.textoSoltarse(soltableCreep), dado:'', soloTexto:true, sinNitros: sinNitrosSol, motivo: `${sinNitrosSol ? 'Sin No2 · ' : ''}${soltableCreep.nombre}: tira ${s.etq} contra ${s.dif}; si llega, se suelta. Cuesta ${s.no2} No2 aunque no lo logre`, attr:`data-soltarcreep="${sc.id}"`});
    }
    // Estados alterados que modifican cada tirada (2026-09-25): el botón se pinta de verde/rojo y dice cuáles (comun/modificadores-tirada.js).
    combate.forEach(f => { f.mt = f.stat ? ModTirada.tile(sc.estados, f.stat) : {clase: '', html: '', titulo: ''}; });
    const tilesCombate = combate.map(f => f.soloTexto ? `
    <button type="button" class="botonera-tile${f.sinNitros ? ' bt-sin-nitros' : ''}" ${f.attr} title="${esc(f.motivo)}">
      <span class="bt-label">${esc(f.nombre)}</span>
    </button>` : `
    <button type="button" class="botonera-tile${f.sinNitros ? ' bt-sin-nitros' : ''}${f.mt.clase}" ${f.attr} title="${esc(f.motivo + f.mt.titulo)}">
      ${f.lupa ? lupaBotonHtml(`${sc.id}|${f.lupa}`) : ''}${ModTirada.ayuda(f.stat)}
      <span class="bt-label">${esc(f.nombre)}</span><span class="bt-value bt-value-formula">🎲${f.dado ? ` ${esc(f.dado)}` : ''}</span>${f.mt.html}
    </button>`).join('');

    const filasHab = sc.habilidades.map(h => {
      const bloqueo = bloqueoHab(sc, h);
      const costo = costoNitrosHab(sc, h);
      const partes = [costoHabTxt(sc, h)];
      if(num(h.cd) > 0) partes.push(`CD ${fmt(num(h.cd))}`);
      const motivo = bloqueo ? `${bloqueo} · ${partes.join(' · ')}` : partes.join(' · ');
      return {id: h.id, nombre: h.nombre || 'Sin nombre', disabled: !!bloqueo, motivo, attr:`data-ejecutar="${sc.id}:${h.id}"`, flash: Combatiente.esFlash(h), boton: botonHabTxt(h), segunda: botonSegundaHab(h, sc), cdHtml: cdControlesHtml(sc, h)};
    });

    const filaHab = f => `
    <div class="accion-row">
      <div class="accion-nombre">${esc(f.nombre)}</div>
      <span class="hab-estado ${f.disabled?'cd':'ok'}">${esc(f.motivo)}</span>
      <button class="verbtn" data-verhabaccion="${sc.id}:${f.id}">Ver</button>
      ${lupaBotonHtml(`${sc.id}|hab|${f.id}`, 'mini')}
      <button class="hab-ejecutar${f.flash ? ' bt-flash' : ''}" ${f.attr} ${f.disabled?'disabled':''}${f.flash ? ' title="⚡ Flash: se puede usar en turno ajeno (cuesta el doble)"' : ''}>${f.boton || 'Ejecutar'}</button>
      ${f.segunda || ''}
      ${f.cdHtml || ''}
    </div>`;

    const cuerpo = `
    <div class="botonera-grid botonera-grid-even">
      <div class="botonera-caja">
        <div class="acciones-grupo-label" style="margin-top:0">Combate</div>
        <div class="botonera-combate-grid">${tilesCombate}</div>
        <div class="botonera-valores">
          <div class="botonera-valores-t">Valores (no se tiran)</div>
          <div class="botonera-valores-fila">
            <div class="botonera-tile bt-info" title="Defensa (no se tira)">
              ${lupaBotonHtml(`${sc.id}|defensa|def`)}
              <span class="bt-label">Defensa</span><span class="bt-value">${fmt(defensaEfectiva(sc))}</span>
            </div>
            <div class="botonera-tile bt-info" title="Defensa especial: se resta al daño de casteo que ignora la Defensa (no se tira)">
              ${lupaBotonHtml(`${sc.id}|defensa|armadmg`)}
              <span class="bt-label">Armad. mágica</span><span class="bt-value">${fmt(armadmgEfectiva(sc))}</span>
            </div>
          </div>
          <div class="botonera-crit">
            <div class="botonera-crit-t">Resistencia a críticos</div>
            <div class="botonera-crit-grid">
              ${[0, 1, 2, 3, 4].map(i => `
              <div class="botonera-tile bt-info" title="Resistencia a crítico Tipo ${4 + 2 * i} (no se tira)">
                ${lupaBotonHtml(`${sc.id}|defensa|tipo${i + 1}`)}
                <span class="bt-label">Tipo ${4 + 2 * i}</span><span class="bt-value">${fmt(critEfectivo(sc, i))}</span>
              </div>`).join('')}
            </div>
          </div>
          ${Combatiente.resElementalesHtml(el => CreepCalculo.resElemental(sc, el))}
        </div>
      </div>
      <div class="botonera-caja">
        <div class="acciones-grupo-label" style="margin-top:0">Tiradas de stats</div>
        <div class="botonera-stats-grid">${tilesStats}</div>
      </div>
    </div>
    <div class="botonera-caja">
      <div class="acciones-grupo-label" style="margin-top:0">Habilidades</div>
      <div class="botonera-list-grid">${filasHab.map(filaHab).join('')}</div>
    </div>
    ${cinturonHtml(sc, o)}`;
    return {titulo: sc.nombre, badge: `No2 ${fmt(num(sc.nitros))}/${fmt(nitrosMax(sc))}`, html: cuerpo + Combatiente.FLASH_CSS};
  }

  /* El cinturón del creep (2026-10-04): 1 ranura = 1 unidad, base 5; usar uno cuesta 1 No2. opts.consumibles = [{id, nombre, tier}] del
     catálogo para cargarle (null: todavía no llegó el catálogo); opts.cinSel: el último elegido (queda marcado). Botones: data-cin-consumir / data-cin-quitar ("creepId:itemId") y
     data-cin-agregar (creepId, con el elegido en el desplegable data-cin-sel). */
  function cinturonHtml(sc, opts){
    const o = opts || {}, usado = C().cinturonUsado(sc), cap = C().capCinturon(sc);
    const costo = typeof FichaCalculo !== 'undefined' ? num(FichaCalculo.IT2.nitrosConsumirCinturon) || 1 : 1;
    const filas = (sc.cinturon || []).map(it => `
      <div class="accion-row">
        <div class="accion-nombre">${esc(it.nombre)} <span class="hint">×${fmt(num(it.unidades))}${num(it.curahp) ? ` · ${num(it.curahp) > 0 ? '+' : ''}${fmt(num(it.curahp))} HP` : ''}${it.efectoNombre ? ` · ${esc(it.efectoNombre)}` : ''}</span></div>
        <button class="hab-ejecutar" data-cin-consumir="${sc.id}:${it.id}" ${num(sc.nitros) < costo ? 'title="No le alcanzan los No2: pregunta antes"' : ''}>Usar · ${fmt(costo)} No2</button>
        <button class="verbtn" data-cin-quitar="${sc.id}:${it.id}" title="Sacarlo del cinturón">✕</button>
      </div>`).join('');
    const lista = o.consumibles;
    const agregar = !lista ? '<div class="hint">Cargando el catálogo de consumibles…</div>'
      : usado >= cap ? '<div class="hint">El cinturón está lleno.</div>'
      : `<div class="accion-row"><select data-cin-sel="${sc.id}" style="flex:1;min-width:0">${lista.map(c => `<option value="${esc(c.id)}"${c.id === o.cinSel ? ' selected' : ''}>${esc(c.nombre)}${c.tier ? ` · ${esc(c.tier)}` : ''}</option>`).join('')}</select>
          <button class="hab-ejecutar" data-cin-agregar="${sc.id}">＋ Al cinturón</button></div>`;
    return `<div class="botonera-caja">
      <div class="acciones-grupo-label" style="margin-top:0">🧪 Cinturón · ${fmt(usado)}/${fmt(cap)} ranuras</div>
      <div class="botonera-list-grid">${filas || '<div class="hint">Sin consumibles en el cinturón.</div>'}${agregar}</div>
    </div>`;
  }

  return {html, cinturonHtml, formulasCombate, habStatTirable, habTieneSegunda, botonSegundaHab, botonHabTxt, cdControlesHtml};
})();
