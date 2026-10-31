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

    const tileStat = d => `
    <button type="button" class="botonera-tile" data-tirarstatcreep="${sc.id}:${d.id}" title="${esc(d.label)}">
      ${lupaBotonHtml(`${sc.id}|stat|${d.id}`)}
      <span class="bt-label">${esc(d.label)}</span>
      <span class="bt-value">${fmt(statValor(sc, d.id))}</span>
    </button>`;
    // En columnas, cada atributo con lo suyo debajo, como la Botonera del personaje (2026-10-18).
    const tilesStats = `<div class="botonera-stats-cols">${Combatiente.columnasStats(STATS_TIRADA_IDS).map(col => `<div class="botonera-stats-col">${col.map(id => tileStat(STAT_LOOKUP[id])).join('')}</div>`).join('')}</div>`;

    const fc = formulasCombate(sc);
    const defCreep = defensa(sc);
    const combate = [
      // Atacar sin No2 no se deshabilita (un botón deshabilitado no deja abrir la 🔍): al tocarlo avisa.
      {stat:'pdg', nombre:`Atacar (PdG) · ${fmt(costoAtaqueSc)} No2`, dado: fc.pdg, sinNitros: sinNitrosAtaque, lupa:'atacar', motivo: `${sinNitrosAtaque ? 'Sin No2 · ' : ''}Cuesta ${fmt(costoAtaqueSc)} No2 · ${cualAtaque}`, attr:`data-atacarcreep="${sc.id}"`},
      {nombre: Combatiente.sinArmaEnMano(sc) ? 'Daño (sin arma)' : 'Daño Arma', dado: danoTxt(sc, statValor(sc, 'dmg')), lupa:'danio', motivo: Combatiente.sinArmaEnMano(sc) ? 'Sin costo · no tiene nada en la mano: 1d4 + su Daño' : 'Sin costo', attr:`data-daniocreep="${sc.id}"`},
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
      combate.push({nombre: `✨ Atacar · ${e.nombre || it.nombre} · ${fmt(c.no2)} No2${c.enEspera ? ` · en espera ${fmt(c.enEspera)}` : ''}`, dado: e.dano ? `${e.dano}${e.sumaEspecial ? (e.sumaEspecial === true ? ' + Ef.Esp' : num(e.sumaEspecial) === 0.25 ? ' + ¼ Ef.Esp' : ' + ½ Ef.Esp') : ''}` : '✨',
        sinNitros: sinNitros || c.enEspera > 0, motivo: `${c.enEspera ? `En espera ${fmt(c.enEspera)} turno(s) · ` : sinNitros ? 'Sin No2 · ' : ''}Cuesta ${fmt(c.no2)} No2 y deja ${fmt(c.espera)} turno(s) de espera (su SP ${fmt(num(e.sp))}) · ${String(it.detalle || '').split(' ⚙')[0]}`,
        attr: `data-especialcreep="${sc.id}:${it.id}"`});
    });
    // Sentado: levantarse cuesta 1 No2 y saca el estado (ver data-levantarcreep).
    const sentadoCreep = (sc.estados || []).some(e => e.activo !== false && e.sentado);
    if(sentadoCreep){
      const sinNitrosLev = num(sc.nitros) < 1;
      combate.push({nombre:`🧍 Levantarse · ${fmt(Combatiente.conExtenuado(sc.estados, Combatiente.costoLevantarse(st => C().modTotal(sc, st))))} No2`, dado:'', soloTexto:true, sinNitros: sinNitrosLev, motivo: `${sinNitrosLev ? 'Sin No2 · ' : ''}Cuesta 1 No2 y saca el estado Sentado`, attr:`data-levantarcreep="${sc.id}"`});
    }
    // 🔁 Lo que tiene guardado y va en la mano (paso 7, 2026-10-22): sacarlo cuesta 1 No2 en combate; lo de la mano que no entre se guarda.
    Combatiente.gruposDeEquipo(sc).guardado.filter(Combatiente.vaEnLaMano).forEach(it => {
      const sinNo2 = num(sc.nitros) < Combatiente.COSTO_SACAR_PIEZA;
      combate.push({nombre:`🔁 Sacar ${it.nombre} · ${fmt(Combatiente.COSTO_SACAR_PIEZA)} No2`, dado:'', soloTexto:true, sinNitros: sinNo2,
        motivo: `${sinNo2 ? 'Sin No2 · ' : ''}La tiene guardada: la pone en la mano (en combate, 1 No2); lo que tenga en la mano y no entre se guarda`, attr:`data-sacarpiezacreep="${sc.id}:${it.id}"`});
    });
    // Las armas en el piso al lado (el mapa las pasa, 2026-10-07): las levanta cualquiera, 1 No2 cada una.
    (o.armasCerca || []).forEach(a => {
      const sinArma = num(sc.nitros) < Combatiente.COSTO_LEVANTAR_ARMA;
      combate.push({nombre:`🗡️ Levantar ${a.nombre}${a.propia ? ' (la suya)' : ''} · ${fmt(Combatiente.COSTO_LEVANTAR_ARMA)} No2`, dado:'', soloTexto:true, sinNitros: sinArma,
        motivo: `${sinArma ? 'Sin No2 · ' : ''}Cuesta 1 No2. Si es la suya, vuelve a tenerla; si no, se la queda`, attr:`data-levantararmacreep="${a.id}"`});
    });
    // Soltarse (2026-10-03): el estado que dejó una trampa de Atrapar dice qué tira y cuánto cuesta.
    (o.atrapadosCerca || []).forEach(a => {   // 🤝 ayudar a un aliado atrapado al lado (2026-10-20, js/54)
      const sinNo2 = num(sc.nitros) < a.no2;
      combate.push({nombre: `🤝 Ayudar a soltar a ${a.nombre} · ${a.etq} contra ${a.dif} · ${a.no2} No2`, dado: '', soloTexto: true, sinNitros: sinNo2, motivo: `${sinNo2 ? 'Sin No2 · ' : ''}${a.nombre} está atrapado (${a.est}): tira su ${a.etq} contra ${a.dif}; si llega, lo suelta. Cuesta ${a.no2} No2 aunque no lo logre`, attr: `data-ayudarsoltarcreep="${a.tokenId}"`});
    });
    const soltableCreep = Combatiente.estadoSoltable(sc.estados);
    if(soltableCreep && !Combatiente.soltarNorm(soltableCreep.soltar).alEmpezar){   // (una sola tirada, al empezar el turno)
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
      if(num(h.cd) > 0 && !C().modoSP(sc)) partes.push(`CD ${fmt(num(h.cd))}`);   // (en modo SP no hay cooldown)
      // 💧 Sin SP suficiente en modo SP (dueño, 2026-10-29): en rojo, pero se deja ejecutar (avisa antes: CreepAcciones.confirmarSP).
      const sinSp = !bloqueo && C().modoSP(sc) && !(h.excavar && h.emerger) && C().spActual(sc) < C().costoSpHab(sc, h);
      const motivo = bloqueo ? `${bloqueo} · ${partes.join(' · ')}` : sinSp ? `Sin SP · ${partes.join(' · ')}` : partes.join(' · ');
      return {id: h.id, nombre: h.nombre || 'Sin nombre', disabled: !!bloqueo, rojo: sinSp, motivo, attr:`data-ejecutar="${sc.id}:${h.id}"`, flash: Combatiente.esFlash(h), boton: botonHabTxt(h), segunda: botonSegundaHab(h, sc), cdHtml: C().modoSP(sc) ? '' : cdControlesHtml(sc, h)};
    });

    const filaHab = f => `
    <div class="accion-row">
      <div class="accion-nombre">${esc(f.nombre)}</div>
      <span class="hab-estado ${f.disabled || f.rojo?'cd':'ok'}">${esc(f.motivo)}</span>
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
              <span class="bt-label">Def. especial</span><span class="bt-value">${fmt(armadmgEfectiva(sc))}</span>
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
        ${tilesStats}
      </div>
    </div>
    <div class="botonera-caja">
      <div class="acciones-grupo-label" style="margin-top:0;display:flex;align-items:center;gap:8px;flex-wrap:wrap">Habilidades
        <button type="button" class="btn chico" data-modosp="${esc(sc.id)}" title="Probar sus habilidades pagando con SP (sin cooldown) o con cooldown, como siempre">${C().modoSP(sc) ? `💧 Con SP · ${fmt(C().spActual(sc))}/${fmt(C().spMax(sc))} (recarga ${fmt(C().spRegen(sc))})` : '⏱ Con cooldown'} ⇄</button></div>
      <div class="botonera-list-grid">${filasHab.map(filaHab).join('')}</div>
    </div>
    ${cinturonHtml(sc, o)}`;
    return {titulo: sc.nombre, badge: `No2 ${fmt(num(sc.nitros))}/${fmt(nitrosMax(sc))}${C().modoSP(sc) ? ` · SP ${fmt(C().spActual(sc))}/${fmt(C().spMax(sc))}` : ''}`, html: cuerpo + Combatiente.FLASH_CSS};
  }

  /* El cinturón del creep (2026-10-04): 1 ranura = 1 unidad, base 5; usar uno cuesta 1 No2. opts.consumibles = [{id, nombre, tier}] del
     catálogo para cargarle (null: todavía no llegó el catálogo); opts.cinSel: el último elegido (queda marcado). Botones: data-cin-consumir / data-cin-quitar ("creepId:itemId") y
     data-cin-agregar (creepId, con el elegido en el desplegable data-cin-sel). */
  function cinturonHtml(sc, opts){
    const o = opts || {}, usado = C().cinturonUsado(sc), cap = C().capCinturon(sc);
    const costo = Combatiente.conExtenuado(sc.estados, typeof FichaCalculo !== 'undefined' ? num(FichaCalculo.IT2.nitrosConsumirCinturon) || 1 : 1);   // + Extenuado
    const filas = (sc.cinturon || []).map(it => `
      <div class="accion-row">
        <div class="accion-nombre"><span${it.detalle ? ` title="${esc(it.detalle)}" style="text-decoration:underline dotted;cursor:help"` : ''}>${esc(it.nombre)}</span>${it.azar ? ' <span title="Su consumible al azar: si lo usa, lo suelta seguro; si no, con la chance de su tipo">🎲</span>' : ''} <span class="hint">×${fmt(num(it.unidades))}${num(it.curahp) ? ` · ${num(it.curahp) > 0 ? '+' : ''}${fmt(num(it.curahp))} HP` : ''}${it.efectoNombre ? ` · ${esc(it.efectoNombre)}` : ''}</span></div>
        <button class="hab-ejecutar" data-cin-consumir="${sc.id}:${it.id}" ${num(sc.nitros) < costo ? 'title="No le alcanzan los No2: pregunta antes"' : ''}>Usar · ${fmt(costo)} No2</button>
        <button class="verbtn" data-cin-quitar="${sc.id}:${it.id}" title="Sacarlo del cinturón">✕</button>
      </div>`).join('');
    const lista = o.consumibles;
    const agregar = !lista ? '<div class="hint">Cargando el catálogo de consumibles…</div>'
      : usado >= cap ? '<div class="hint">El cinturón está lleno.</div>'
      : cinPickerHtml(sc, lista);
    return `<div class="botonera-caja">
      <div class="acciones-grupo-label" style="margin-top:0">🧪 Cinturón · ${fmt(usado)}/${fmt(cap)} ranuras</div>
      <div class="botonera-list-grid">${filas || '<div class="hint">Sin consumibles en el cinturón.</div>'}${agregar}</div>
    </div>`;
  }

  /* 🧪 Elegir un consumible para el cinturón (dueño, 2026-10-30: «no debe abrir un desplegable con una lista infinita, sino un menú con ciertos filtros»):
     ＋ Al cinturón abre un panel con buscador y las categorías de la góndola (Combatiente.GONDOLA_CATEGORIAS); cada fila tiene su «＋» (data-cin-agregar
     + data-cin-item, lo atiende cada pantalla). Filtrar no redibuja: lo hacen cinAbrir/cinFiltrar/cinCat en el lugar (sirve adentro del recuadro aislado del
     mapa). Queda abierto entre redibujos (`cinAbiertos`), para sumar varios. */
  const cinAbiertos = new Set(), cinFiltros = new Map();   // (lo buscado y la categoría, por creep: sobreviven al redibujo)
  const sinAcento = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  function cinPickerHtml(sc, lista){
    const cats = (typeof Combatiente !== 'undefined' && Combatiente.GONDOLA_CATEGORIAS) || [];
    const catDe = it => (typeof Combatiente !== 'undefined' && Combatiente.categoriaGondola) ? Combatiente.categoriaGondola(it) : '';
    const hay = new Set(lista.map(catDe));
    const abierto = cinAbiertos.has(sc.id), fil = cinFiltros.get(sc.id) || {q: '', cat: ''};
    const pasa = (txt, cat) => (!fil.q || txt.includes(sinAcento(fil.q).trim())) && (!fil.cat || cat === fil.cat);
    const filas = lista.map(c => { const txt = sinAcento([c.nombre, c.tier, c.detalle, c.efectoNombre].join(' ')), cat = catDe(c); return `<div class="cin-fila" data-cin-txt="${esc(txt)}" data-cin-cat="${esc(cat)}"
        style="display:${pasa(txt, cat) ? 'flex' : 'none'};gap:8px;align-items:center;padding:5px 6px;border-bottom:1px solid rgba(255,255,255,.06)">
        <div style="flex:1;min-width:0"><b>${esc(c.nombre)}</b>${c.tier ? ` <span class="hint">· ${esc(c.tier)}</span>` : ''}${c.detalle ? `<div class="hint" style="font-size:11px;line-height:1.3">${esc(String(c.detalle).slice(0, 140))}${String(c.detalle).length > 140 ? '…' : ''}</div>` : ''}</div>
        <button class="hab-ejecutar" data-cin-agregar="${sc.id}" data-cin-item="${esc(c.id)}" title="Sumarlo al cinturón">＋</button></div>`; }).join('');
    return `<div style="grid-column:1/-1">
      <button class="hab-ejecutar" data-cin-abrir="${sc.id}" onclick="CreepBotonera.cinAbrir(this)">${abierto ? '▾' : '＋'} Al cinturón</button>
      <div data-cin-panel="${sc.id}" data-cat="${esc(fil.cat)}"${abierto ? '' : ' hidden'} style="margin-top:6px;border:1px solid rgba(255,255,255,.12);border-radius:8px;padding:8px">
        <input type="text" value="${esc(fil.q)}" placeholder="Buscar (nombre, efecto…)" oninput="CreepBotonera.cinFiltrar(this)" style="width:100%;box-sizing:border-box;margin-bottom:6px">
        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px">${cats.filter(([k]) => hay.has(k)).map(([k, ic, et]) => `<button type="button" class="verbtn" data-cin-catbtn="${esc(k)}" onclick="CreepBotonera.cinCat(this)"${fil.cat === k ? ' style="outline:2px solid #E0A458"' : ''}>${ic} ${esc(et)}</button>`).join('')}</div>
        <div data-cin-lista style="max-height:260px;overflow-y:auto">${filas}</div>
        <div class="hint" data-cin-vacio hidden>Nada con esos filtros.</div>
      </div></div>`;
  }
  function cinAbrir(btn){
    const caja = btn.parentElement, panel = caja && caja.querySelector('[data-cin-panel]');
    if(!panel) return;
    panel.hidden = !panel.hidden;
    const id = btn.dataset.cinAbrir;
    if(panel.hidden) cinAbiertos.delete(id); else{ cinAbiertos.add(id); const inp = panel.querySelector('input'); if(inp) inp.focus(); }
    btn.textContent = `${panel.hidden ? '＋' : '▾'} Al cinturón`;
  }
  function cinRefiltrar(panel){
    const crudo = (panel.querySelector('input') || {}).value || '', q = sinAcento(crudo).trim(), cat = panel.dataset.cat || '';
    cinFiltros.set(panel.dataset.cinPanel, {q: crudo, cat});
    let n = 0;
    panel.querySelectorAll('.cin-fila').forEach(f => { const ok = (!q || f.dataset.cinTxt.includes(q)) && (!cat || f.dataset.cinCat === cat); f.style.display = ok ? 'flex' : 'none'; if(ok) n++; });
    const v = panel.querySelector('[data-cin-vacio]'); if(v) v.hidden = n > 0;
  }
  function cinFiltrar(inp){ const panel = inp.closest('[data-cin-panel]'); if(panel) cinRefiltrar(panel); }
  function cinCat(b){
    const panel = b.closest('[data-cin-panel]');
    if(!panel) return;
    panel.dataset.cat = panel.dataset.cat === b.dataset.cinCatbtn ? '' : b.dataset.cinCatbtn;
    panel.querySelectorAll('[data-cin-catbtn]').forEach(x => { x.style.outline = x.dataset.cinCatbtn === panel.dataset.cat ? '2px solid #E0A458' : ''; });
    cinRefiltrar(panel);
  }

  return {cinAbrir, cinFiltrar, cinCat, html, cinturonHtml, formulasCombate, habStatTirable, habTieneSegunda, botonSegundaHab, botonHabTxt, cdControlesHtml};
})();
