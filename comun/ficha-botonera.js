/* =========================================================
   FICHA-BOTONERA — el dibujo de la Botonera de un personaje, fuera de la ficha (paso 4, etapa 3b de
   docs/plan-paso4-etapa3.md, 2026-10-01)
   Lo que antes vivía en ficha-personaje (renderBotonera en js/05 y sus ayudantes de js/02, js/03, js/05 y js/11), movido
   tal cual: arma el HTML de la Botonera (Percepción, Levantarse, Sigilo, Combate, Tiradas de stats, Habilidades,
   Consumibles, Talentos) a partir de la ficha (`S`) y de un contexto, en vez de leerlos de variables globales. Así la
   dibujan igual la ficha y el mapa. No hace nada al tocar los botones: cada pantalla engancha los `data-*` de siempre.
   html(S, o) → {html, nitros, sp, def} (los tres últimos son los textos de las insignias de la cabecera).
   o: {modoMapa: 'combate'|'narrativo', parryArmaPendiente: id del arma/escudo del último Parry (o null), lupa: false
       para no dibujar las 🔍 (por ahora el mapa no tiene la lupa de la ficha)}.
   Necesita comun/combatiente.js, ficha-calculo.js, ficha-combate.js, ficha-habilidades.js, modificadores-tirada.js y
   tiradas.js (formulaParaValor); la 🔍, lupa.js.
   ========================================================= */
const FichaBotonera = (() => {
  const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
  // Iguales a los de la ficha (el HTML tiene que salir letra por letra igual).
  function fmt(n){ return Number.isInteger(n) ? n : Math.round(n*100)/100; }
  function esc(s){ return String(s??'').replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch])); }
  const IT2 = () => FichaCalculo.IT2;

  // Stats que no se tiran (no tienen 🎲 en Atributos) y los de resistencia a crítico.
  /* Los stats secundarios que SÍ se tiran (2026-10-05, dueño: «¿en qué momento se puso todo esto como tiradas de stat?»). Antes era al revés —todos
     menos una lista de excluidos— y cada stat nuevo de equipo (ranuras, pasamanos, resistencias elementales, %…) aparecía como tirada en la
     Botonera y como opción de tirada en el editor de habilidades. Ahora es una lista fija, la misma de los creeps (comun/creep-calculo.js,
     STATS_TIRADA_IDS) más los de la caja de Combate (PdG, Eva, Parry, Bloqueo). Un stat nuevo que se tire hay que sumarlo acá a propósito. */
  const STATS_CON_TIRADA_IDS = ['resmg', 'rescc', 'ini', 'percepcion', 'sigilo', 'pdgmg', 'dmgesp', 'resm', 'pdg', 'eva', 'parry', 'bloqueo'];
  const TIPOS_IDS = ['tipo1','tipo2','tipo3','tipo4','tipo5'];

  /* ---------- Recursos ---------- */
  // SP máximo = el calculado (Especial × 3 + bonos) + un ajuste a mano (`S.meta.spMaxExtra`, puede ser negativo).
  function spMaximo(S, c){
    c = c || FichaCalculo.calcular(S);
    if(Number.isNaN(c.final.sp)) return 0;
    return Math.max(0, c.final.sp + num(S.meta.spMaxExtra));
  }
  function nitrosMaximo(S, c){
    c = c || FichaCalculo.calcular(S);
    return Number.isNaN(c.final.nitros) ? 0 : c.final.nitros;
  }

  /* ---------- Percepción, sigilo, sentado ---------- */
  function tienePercepcionAumentada(S){
    return (S.pasivas || []).some(p => p.poolId === 'percepcion-aumentada' || p.percepcionAumentada)
      || (S.efectos || []).some(e => /percepci[oó]n aumentada/i.test(e.nombre || ''))   // el colirio del vidente: estado con turnos
      || (S.inventario || []).some(i => i.equipado && (i.percepcionAumentada || /percepci[oó]n aumentada/i.test(i.equipoEstadoNombre || '')));   // el anillo de percepción aumentada
  }
  const tieneSigilo = S => S.habilidades.some(h => String(h.nombre || '').trim().toLowerCase() === 'sigilo');
  const efectoSigilo = S => S.efectos.find(e => e.activo !== false && String(e.nombre || '').trim().toLowerCase() === 'sigilo');
  const efectoSentado = S => S.efectos.find(e => e.activo !== false && e.sentado);

  /* ---------- Habilidades ---------- */
  function statsConTirada(){ return FichaCalculo.STAT_LIST.filter(s => STATS_CON_TIRADA_IDS.includes(s.id)); }
  function habStatTirable(it){
    const s = it.tiradaStat;
    return !!(s && (FichaCalculo.ATTR_LIST.some(a => a.id === s) || statsConTirada().some(x => x.id === s)));
  }
  function habTieneSegundaTirada(it){ return habStatTirable(it) && !!(it.tiradaExtra || '').trim(); }
  const botonSegundaHab = it => habTieneSegundaTirada(it)
    ? `<button type="button" class="mini" data-danohab="${esc(it.id)}" title="Segunda tirada de la habilidad (daño o efecto): ${esc(String(it.tiradaExtra).trim())}">🎲 ${esc(String(it.tiradaExtra).trim())}</button>` : '';
  // El duelo de una habilidad: el que se le configuró (null = se lo sacaron) o, si nunca se tocó, el de la skill de clase
  // de la que salió (así las que ya estaban en la mochila también lo traen).
  function dueloDe(it){
    if(!it) return null;
    if(it.duelo !== undefined) return it.duelo;
    const base = it.habClaseId && typeof CLASES_SKILLS !== 'undefined' ? CLASES_SKILLS.flatMap(c => c.habilidades).find(h => h.id === it.habClaseId) : null;
    return base && base.duelo ? base.duelo : null;
  }
  const modoHab = h => Combatiente.modoHab(h, h && dueloDe(h));
  const habAutomatizada = h => modoHab(h) !== 'manual';
  // Con costo de Nitros "ATAQUE": lo mismo que un ataque con el arma que se elija al ejecutarla.
  function armasParaHabilidad(S){
    const armas = FichaCombate.armasEquipadasConDano(S);
    return armas.length ? armas.map(a => ({arma: a.item, mano: a.mano})) : [{arma: null, mano: null}];
  }
  const costoAtaqueNitros = (S, arma) => FichaCombate.costoAtaque(S, arma);
  function costoAtaqueMinimo(S){
    return Math.min(...armasParaHabilidad(S).map(o => costoAtaqueNitros(S, o.arma)));
  }
  function costoAtaqueHabTxt(S){
    const opciones = armasParaHabilidad(S);
    if(opciones.length === 1) return `${fmt(costoAtaqueNitros(S, opciones[0].arma))} No2 (ataque${opciones[0].arma ? ` con ${opciones[0].arma.nombre}` : ' sin arma'})`;
    return `ataque: ${opciones.map(o => `${o.arma.nombre} ${fmt(costoAtaqueNitros(S, o.arma))}`).join(' / ')} No2`;
  }
  // Nitros fijos de una habilidad (0 si son X: se eligen al usarla).
  function costoNitrosHab(S, h, arma){
    return Combatiente.costoNitrosHab(h, () => arma === undefined ? costoAtaqueMinimo(S) : costoAtaqueNitros(S, arma), IT2().nitrosHabilidad);
  }
  function sinNitrosPara(S, h){
    if(!habAutomatizada(h)) return false;
    if(num(h.hpCosto) > 0 && num(S.hp) <= num(h.hpCosto)) return true;
    if(FichaHabilidades.nitrosVariable(h)) return false;
    return num(S.nitros) < costoNitrosHab(S, h);
  }
  // Lo que cuesta ejecutar una habilidad, para verlo sin abrir la tarjeta. El costo en SP es texto libre.
  function costoHabilidadTxt(S, h){
    if(!habAutomatizada(h)) return '';
    const partes = [];
    const nitros = costoNitrosHab(S, h);
    if(Combatiente.esFlash(h)) partes.push('⚡ Flash (sin No2; el doble en turno ajeno)');   // un Flash nunca cobra No2 (P136)
    else if(FichaHabilidades.nitrosAtaque(h)) partes.push(costoAtaqueHabTxt(S));
    else if(FichaHabilidades.nitrosVariable(h)) partes.push("X No2");
    else if(nitros) partes.push(`${fmt(nitros)} No2`);
    const costo = String(h.costo || '').trim();
    if(costo) partes.push(/sp|bono/i.test(costo) ? costo : `${costo} SP`);
    if(num(h.hpCosto) > 0) partes.push(`${fmt(num(h.hpCosto))} HP`);
    if(num(h.curaHp) > 0) partes.push(`cura ${fmt(num(h.curaHp))} HP`);
    return partes.join(' · ');
  }

  /* ---------- Parry ---------- */
  function costoParryTxt(S){
    const armas = FichaCombate.armasYEscudosParaParry(S);
    if(!armas.length) return 'no podés parriar sin un arma o escudo equipado';
    return armas.map(a => `${a.item.nombre}: ${fmt(Combatiente.costoParry(a.item))} No2`).join(' · ');
  }

  /* ---------- Consumibles ---------- */
  function costoConsumirNitros(key){
    return key === 'cinturon' ? IT2().nitrosConsumirCinturon : IT2().nitrosConsumirMochila;
  }
  // conLupa: en la Botonera la 🔍 va dentro del botón (sin "disabled", que no deja abrirla).
  function consumeButton(i, key, conLupa, lupa){
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
      Consumir <span class="consume-fx">(${partes.join(" · ")})</span>${lupa(`cons:${key}:${i.id}`, "en-boton")}
    </button>`;
    }
    return `<button class="consume-btn" data-consume="${i.id}" ${agotado?"disabled":""}>
    Consumir <span class="consume-fx">(${partes.join(" · ")})</span>
  </button>`;
  }

  /* ---------- Talentos (habilidades sociales) e Inteligencia ---------- */
  function inteligenciaAuto(S){
    const nivel = Math.max(1, num(S.meta.nivel) || 1);
    return 6 + 3 * (nivel - 1);
  }
  function inteligenciaManual(S){
    const m = S.meta.inteligenciaManual;
    return (m !== null && m !== undefined && m !== '' && Number.isFinite(Number(m))) ? Number(m) : null;
  }
  function inteligenciaValor(S){
    const m = inteligenciaManual(S);
    return m !== null ? m : inteligenciaAuto(S);
  }
  function inteligenciaBudget(S){
    const total = inteligenciaValor(S);
    const gastado = S.sociales.reduce((a, x) => a + Math.max(0, num(x.puntosInt)), 0);
    return {total, gastado, resto: total - gastado};
  }
  function nivelSocial(i){ return Math.max(0, num(i.puntosInt)) + Math.max(0, num(i.nivelExtra)); }
  function dadoCarasSocial(i){ return nivelSocial(i) * 2; }
  function nivelSocialTxt(i){
    const n = nivelSocial(i);
    const caras = dadoCarasSocial(i);
    return `Nivel ${fmt(n)}${caras ? ` · d${fmt(caras)}` : ''}`;
  }
  function tiradaSocialTxt(S, i){
    const caras = dadoCarasSocial(i);
    return `Tira ${caras ? `1d${caras} + ` : ''}Inteligencia sin invertir (${fmt(inteligenciaBudget(S).resto)})`;
  }
  // Fila de una habilidad social en la Botonera: nivel/dado a la izquierda, Ejecutar (con su 🔍) a la derecha.
  function filaSocialBotonera(S, i, lupa){
    return `<div class="cat-row bot-fila">
    <div class="bot-fila-info">
      <div class="cat-nombre">${esc(i.nombre)}</div>
      <div class="bot-fila-costo" title="${esc(tiradaSocialTxt(S, i))}">${esc(nivelSocialTxt(i))}</div>
    </div>
    <div class="bot-fila-btns">
      <button class="mini" data-view="sociales:${i.id}">Ver</button>
      <button class="ejecutar-btn con-lupa" data-tirarsocial="${i.id}">Ejecutar${lupa(`social:${i.id}`, "en-boton")}</button>
    </div>
  </div>`;
  }

  /* ---------- Tiradas de la Botonera (paso 4, etapa 3c, 2026-10-01) ----------
     Las arma cualquiera que tenga los datos del personaje (la ficha, o el mapa con la Botonera nueva) y después las publica
     a su manera. Devuelven {origen, r} (r: lo que va a la Mesa) o {error}. */
  // Un stat (no la Evasión, que lleva el cartel de sobrepeso de la ficha): la tirada del motor común (Afortunado, mitades).
  function tiradaStat(S, statId){
    const c = FichaCalculo.calcular(S);
    const nombre = FichaCalculo.STAT_LABEL[statId] || statId, valor = c.final[statId];
    if(!formulaParaValor(valor)) return {error: `${nombre}: ${fmt(num(valor))} no se puede tirar con dados reales`};
    return {origen: nombre, r: Combatiente.tirarStat(valor, S.efectos, statId, {extra: undefined})};
  }
  // Percepción (de Destreza): con Percepción aumentada, cada dado sube un escalón (d6 → d8, d8 → d10…). azar: para las pruebas.
  const PERCEPCION_DADO_SUBE = {2: 4, 3: 4, 4: 6, 6: 8, 8: 10, 10: 12, 12: 20, 20: 20};
  // La tirada a partir del valor (2026-10-02: la usa también el mapa, con el valor que publica la ficha, para «algo está fuera de lugar», P145).
  function tiradaPercepcionValor(valor, mejor, azar){
    azar = azar || Math.random;
    const f = formulaParaValor(valor);
    if(!f) return null;
    const combo = f.combo.map(d => mejor ? (PERCEPCION_DADO_SUBE[d] || d) : d);
    const rolls = combo.map(d => 1 + Math.floor(azar() * d));
    const cuenta = {};
    combo.forEach(d => { cuenta[d] = (cuenta[d] || 0) + 1; });
    const formula = Object.keys(cuenta).map(Number).sort((a, b) => a - b).map(d => `${cuenta[d]}d${d}`).join('+') + (f.mod ? `+${f.mod}` : '');
    return {formula, rolls, mod: f.mod, total: rolls.reduce((a, b) => a + b, 0) + f.mod};
  }
  function tiradaPercepcion(S, azar){
    const valor = FichaCalculo.calcular(S).final.percepcion;
    const mejor = tienePercepcionAumentada(S);
    const r = tiradaPercepcionValor(valor, mejor, azar);
    if(!r) return {error: `Percepción: ${fmt(num(valor))} no se puede tirar con dados reales`};
    return {origen: mejor ? 'Percepción (aumentada)' : 'Percepción', r};
  }

  /* ---------- La Botonera ---------- */
  function html(S, o){
    o = o || {};
    const modoMapa = o.modoMapa || 'combate';
    const parryArmaPendiente = o.parryArmaPendiente || null;
    const lupaBotonHtml = (clave, cls) => o.lupa === false || typeof window.lupaBotonHtml !== 'function' ? '' : window.lupaBotonHtml(clave, cls);
    const c = FichaCalculo.calcular(S);
    let html = '';

    const badgeNitros = `No2 ${fmt(num(S.nitros))}/${fmt(nitrosMaximo(S, c))}`;
    const spMax = spMaximo(S, c);
    const badgeSp = `SP ${fmt(spMax - num(S.spGastado))}/${fmt(spMax)}`;
    const badgeDef = `Def ${Number.isNaN(c.final.def) ? '?' : fmt(c.final.def)}`;

    // Habilidades sociales: arriba de todo en modo narrativo, al final (con el resto de las habilidades) en modo combate —
    // según lo que publique el mapa (modoMapa; 'combate' si todavía no se sabe).
    const socialesHtml = `<div class="botonera-caja">
    <div class="cat-grouphead botonera-caja-head" style="margin-top:0"><button type="button" class="colapsar-btn" data-colapsar="botonera-sociales" title="Contraer/expandir">👁</button><span>Talentos</span></div>
    <div class="botonera-list-grid">
      ${S.sociales.length ? S.sociales.map(i => filaSocialBotonera(S, i, lupaBotonHtml)).join('') : `<div class="hint">Sin talentos cargados.</div>`}
    </div>
  </div>`;
    if(modoMapa === 'narrativo') html += socialesHtml;

    // Los que ya tienen su propio botón en la caja de Combate (PdG, Dmg, Eva, Parry, Bloqueo) no hace falta repetirlos acá; la
    // Armadura mágica (no se tira) va con la Defensa, en los valores de Combate (2026-10-02).
    // Los 5 principales (Con, Fue, Agi, Des, Esp) van siempre, igual que en el contenedor de Atributos.
    const STATS_REDUNDANTES_COMBATE = ['pdg', 'eva', 'parry', 'bloqueo', 'armadmg'];
    const statsRollables = [
      ...FichaCalculo.ATTR_LIST,
      ...statsConTirada().filter(s => !STATS_REDUNDANTES_COMBATE.includes(s.id)),
    ];
    const fCombate = FichaCombate.formulasCombate(S);
    // Parry y Bloqueo solo con un arma o un escudo equipado (regla del dueño, 2026-09-30): sin eso quedan apagados.
    const armasParry = FichaCombate.armasYEscudosParaParry(S);
    const sinDefArma = !armasParry.length;
    // El Bloqueo solo existe después de un Parry, con esa misma arma o escudo (regla del dueño, 2026-09-30).
    const armaBloqueo = parryArmaPendiente ? S.inventario.find(x => x.id === parryArmaPendiente && x.equipado) || null : null;
    // Aunque todavía no se pueda tirar, se ve QUÉ tirarías con cada arma o escudo, para decidir entre Parry y Evasión.
    const fBloq = it => (formulaParaValor(FichaCombate.bloqueoValor(S, it)) || {}).formula || '';
    const bloqueoPrevio = armaBloqueo ? fBloq(armaBloqueo)
      : (() => { const l = FichaCombate.armasYEscudosParaParry(S); return l.length === 1 ? fBloq(l[0].item) : l.map(a => `${a.item.nombre} ${fBloq(a.item)}`).join(' · '); })();
    // El Parry también se muestra por arma o escudo: cada uno suma solo sus propios bonos a Parry (P129).
    const fParryIt = it => { const f = formulaParaValor(FichaCombate.statParaArma(S, 'parry', it)); return f ? f.formula + ' ÷2'.repeat(Combatiente.mitadesDeTirada(S.efectos, 'parry')) : ''; };
    const parryPrevio = (() => { const l = FichaCombate.armasYEscudosParaParry(S); return l.length === 1 ? fParryIt(l[0].item) : l.map(a => `${a.item.nombre} ${fParryIt(a.item)}`).join(' · '); })();
    // Con dos armas, Atacar y Daño se desdoblan: uno por arma.
    const armasBotonera = FichaCombate.armasEquipadasConDano(S);
    // Estados alterados que modifican cada tirada: el botón se pinta de verde/rojo y dice cuáles (comun/modificadores-tirada.js).
    const mtEva = ModTirada.tile(S.efectos, 'eva'), mtParry = ModTirada.tile(S.efectos, 'parry'), mtBloqueo = ModTirada.tile(S.efectos, 'bloqueo');

    // Percepción: tirada de Destreza (con dado más alto si tiene la pasiva Percepción aumentada).
    html += `<div class="botonera-caja" style="margin-bottom:8px"><button type="button" class="ejecutar-btn" data-botoneraaccion="percepcion" style="width:100%" title="Tirada de percepción: tu Destreza${tienePercepcionAumentada(S) ? ', con un dado más alto (Percepción aumentada)' : ''}">🔎 Tirar percepción${tienePercepcionAumentada(S) ? ' · dado más alto' : ''}</button></div>`;

    // Sentado: levantarse cuesta 1 No2.
    if(efectoSentado(S)){
      const falta = num(S.nitros) < Math.max(0, num(IT2().nitrosLevantarse) - num(c.final.levantarse));
      html += `<div class="botonera-caja" style="margin-bottom:8px"><button class="ejecutar-btn${falta ? ' sin-recursos' : ''}" data-levantarse="1" style="width:100%" ${falta ? 'aria-disabled="true" title="No te alcanzan los Nitros"' : ''}>🧍 Levantarse · ${fmt(num(IT2().nitrosLevantarse))} No2</button></div>`;
    }

    // Soltarse (2026-10-03): un estado que dejó una trampa de Atrapar; el botón dice qué tira y cuánto cuesta.
    const soltable = Combatiente.estadoSoltable(S.efectos);
    if(soltable){
      const s = Combatiente.soltarNorm(soltable.soltar), falta = num(S.nitros) < s.no2;
      html += `<div class="botonera-caja" style="margin-bottom:8px"><button class="ejecutar-btn${falta ? ' sin-recursos' : ''}" data-soltarse="1" style="width:100%" title="${esc(`${soltable.nombre}: tirás ${s.etq} contra ${s.dif}; si llegás, te soltás. Cuesta ${s.no2} No2 aunque no lo logres.`)}"${falta ? ' aria-disabled="true"' : ''}>${esc(Combatiente.textoSoltarse(soltable))}</button></div>`;
    }

    // Sigilo: botón directo para quien tiene la habilidad.
    if(tieneSigilo(S)){
      const dentro = !!efectoSigilo(S);
      const falta = !dentro && num(S.nitros) < num(IT2().nitrosSigilo);
      html += `<div class="botonera-caja" style="margin-bottom:8px"><button class="ejecutar-btn${dentro ? ' usada' : ''}${falta ? ' sin-recursos' : ''}" data-sigilo="1" style="width:100%" ${falta ? 'aria-disabled="true" title="No te alcanzan los Nitros"' : ''}>🕶 ${dentro ? 'Salir del sigilo' : `Entrar en sigilo · ${fmt(num(IT2().nitrosSigilo))} No2`}</button></div>`;
    }

    const especiales = typeof FichaAcciones !== 'undefined' && FichaAcciones.armasEspeciales ? FichaAcciones.armasEspeciales(S) : [];   // ✨ armas especiales equipadas
    html += `<div class="botonera-grid botonera-grid-even">
    <div class="botonera-caja">
      <div class="cat-grouphead botonera-caja-head" style="margin-top:0"><button type="button" class="colapsar-btn" data-colapsar="botonera-combate" title="Contraer/expandir">👁</button><span>Combate</span></div>
      <div class="botonera-combate-wrap">
        <div class="botonera-combate-grid">
          ${/* Solo los ataques posibles (dueño, 2026-10-05): a mano limpia, solo si no lleva ninguna arma (ni física ni especial). */ ''}
          ${(armasBotonera.length ? armasBotonera : especiales.length ? [] : [null]).map(a => {
            const arma = a && a.item;
            const nombre = armasBotonera.length > 1 ? ` · ${esc(arma.nombre)}` : '';
            const fPdg = formulaParaValor(FichaCombate.pdgParaArma(S, arma, c).valor);
            const costo = costoAtaqueNitros(S, arma);
            const sinNitros = costo > num(S.nitros);
            const mtP = ModTirada.tile(S.efectos, 'pdg');
            return `
          <button type="button" class="botonera-tile${sinNitros ? ' bt-sin-nitros' : ''}${mtP.clase}" data-botoneraaccion="atacar" data-arma="${arma ? arma.id : ''}" title="Atacar${arma ? ` con ${esc(arma.nombre)}` : ''} · ${fmt(costo)} No2${esc(mtP.titulo)}">
            ${lupaBotonHtml(`atacar:${arma ? arma.id : ''}`)}
            <span class="bt-label">Atacar (PdG)${nombre}</span><span class="bt-value bt-value-formula">🎲 ${esc(fPdg ? fPdg.formula : '')}</span>
            <span class="bt-mod">${fmt(costo)} No2${FichaCombate.ataquesConArma(S, arma) ? '' : ' · 1.º ataque'}</span>${mtP.html}
          </button>
          <button type="button" class="botonera-tile" data-botoneraaccion="danio" data-arma="${arma ? arma.id : ''}" title="Daño${arma ? ` · ${esc(arma.nombre)}` : ''}" ${arma ? '' : 'disabled'}>
            ${arma ? lupaBotonHtml(`danio:${arma.id}`) : ''}
            <span class="bt-label">Daño${nombre || ' Arma'}</span><span class="bt-value bt-value-formula">🎲 ${esc(arma ? FichaCombate.armaDanoTxt(arma, c.final.dmg) : 'sin arma equipada')}</span>
          </button>
          ${/* Atacar es siempre un ataque normal (dueño, 2026-10-06): la oportunidad y el contraataque los ofrece el mapa solo; esto, a mano. */ ''}
          <button type="button" class="botonera-tile" data-botoneraaccion="otroataque" data-arma="${arma ? arma.id : ''}" title="A mano, por si el mapa no lo detectó: el ataque de oportunidad se ofrece solo cuando un rival se aleja, y el contraataque después de ganar el Parry y el Bloqueo. Atacar es siempre un ataque normal." style="opacity:.75;min-height:0">
            <span class="bt-label">↪ Oportunidad o contraataque, a mano${nombre}</span>
          </button>`;
          }).join('')}
          ${especiales.map(i => {
            // ✨ Un arma especial (2026-10-05, dueño): se usa desde Atacar, como un ataque más — «¿Qué ataque es?» → Ataque normal → sus reglas.
            const e = i.especial || {}, costo = FichaAcciones.costoEspecialTxt(S, i), falta = FichaAcciones.costoEspecial(S, i).no2 > num(S.nitros);
            const tipo = e.duelo && e.duelo.tipoDano ? ` ${e.duelo.tipoDano}` : '';
            return `
          <button type="button" class="botonera-tile${falta ? ' bt-sin-nitros' : ''}" data-botoneraaccion="atacar" data-arma="${i.id}" title="Atacar con ${esc(i.nombre)} (arma especial) · ${esc(costo)}">
            <span class="bt-label">✨ Atacar · ${esc(e.nombre || i.nombre)}</span><span class="bt-value bt-value-formula">${e.dano ? `🎲 ${esc(e.dano)}${esc(tipo)}` : '✨ sin daño'}</span>
            <span class="bt-mod">${esc(costo)}</span>
          </button>
          <button type="button" class="botonera-tile" data-view="inventario:${i.id}" title="Qué hace ${esc(i.nombre)}">
            <span class="bt-label">Qué hace · ${esc(e.nombre || i.nombre)}</span><span class="bt-value" style="font-size:11px;line-height:1.3;white-space:normal">${esc(FichaAcciones.ataqueEspecialMenu(S, i).que)}</span>
          </button>`;
          }).join('')}
        </div>
        <div class="botonera-combate-grid botonera-combate-bottom">
          <button type="button" class="botonera-tile${mtEva.clase}" data-botoneraaccion="esquivar" title="Esquivar${esc(mtEva.titulo)}">
            ${lupaBotonHtml('stat:eva')}${ModTirada.ayuda('eva')}
            <span class="bt-label">Esquivar (Eva)</span><span class="bt-value bt-value-formula">${Combatiente.stuneado(S.efectos) ? '1 (Stun)' : `🎲 ${esc(fCombate.eva)}`}</span>${mtEva.html}
          </button>
          <button type="button" class="botonera-tile${mtParry.clase}${sinDefArma ? ' bt-sin-nitros' : ''}" data-botoneraaccion="parry" title="${esc(sinDefArma ? Combatiente.SIN_ARMA_DEFENSA : 'Parry con arma o escudo: siempre cuesta 1 No2 (' + costoParryTxt(S) + ')' + mtParry.titulo)}">
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
        <div class="botonera-valores">
          <div class="botonera-valores-t">Valores (no se tiran)</div>
          <div class="botonera-valores-fila">
            <div class="botonera-tile bt-info" title="Defensa (no se tira)">
              ${lupaBotonHtml('defensa:def')}
              <span class="bt-label">Defensa</span><span class="bt-value">${Number.isNaN(c.final.def) ? '?' : fmt(c.final.def)}</span>
            </div>
            <div class="botonera-tile bt-info" title="Armadura mágica: se resta al daño de casteo que ignora la Defensa (no se tira)">
              ${lupaBotonHtml('defensa:armadmg')}
              <span class="bt-label">Armad. mágica</span><span class="bt-value">${Number.isNaN(c.final.armadmg) ? '?' : fmt(c.final.armadmg || 0)}</span>
            </div>
          </div>
          <div class="botonera-crit">
            <div class="botonera-crit-t">Resistencia a críticos</div>
            <div class="botonera-crit-grid">
              ${TIPOS_IDS.map(id => `
              <div class="botonera-tile bt-info" title="${esc(FichaCalculo.STAT_FULL[id])} (no se tira)">
                ${lupaBotonHtml(`defensa:${id}`)}
                <span class="bt-label">${esc(FichaCalculo.STAT_LABEL[id])}</span><span class="bt-value">${Number.isNaN(c.final[id]) ? '?' : fmt(c.final[id])}</span>
              </div>`).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="botonera-caja">
      <div class="cat-grouphead botonera-caja-head" style="margin-top:0"><button type="button" class="colapsar-btn" data-colapsar="botonera-stats" title="Contraer/expandir">👁</button><span>Tiradas de stats</span></div>
      <div class="botonera-stats-cols">
        ${/* Cada atributo con sus secundarios debajo (dueño, 2026-10-05: «PdG.Esp y Ef.Esp deberían estar abajo de Esp»): una columna por atributo,
             con los que salen de él según FichaCalculo.GRUPOS. */ ''}
        ${FichaCalculo.GRUPOS.map(g => `<div class="botonera-stats-col">${[g, ...g.derived].filter(s => statsRollables.some(x => x.id === s.id)).map(s => {
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
        }).join('')}</div>`).join('')}
      </div>
    </div>
  </div>`;

    const consumiblesCinturon = S.cinturon.filter(i => i.consumible);
    const consumiblesMochila = S.inventario.filter(i => i.consumible);
    const filaConsumible = (i, key) => `<div class="cat-row bot-fila">
    <div class="bot-fila-info"><div class="cat-nombre">${esc(i.nombre)}</div></div>
    <div class="bot-fila-btns">
      <button class="mini" data-view="${key}:${i.id}">Ver</button>
      ${consumeButton(i, key, true, lupaBotonHtml)}
    </div>
  </div>`;

    html += `<div class="botonera-grid botonera-grid-even">
    <div class="botonera-caja">
      <div class="cat-grouphead botonera-caja-head" style="margin-top:0"><button type="button" class="colapsar-btn" data-colapsar="botonera-habilidades" title="Contraer/expandir">👁</button><span>Habilidades</span></div>
      <div class="botonera-list-grid">
        ${S.habilidades.length ? S.habilidades.map(i => {
          const sinNitros = sinNitrosPara(S, i);
          // Nombre y costo a la izquierda; Ver y Ejecutar siempre juntos a la derecha.
          return `<div class="cat-row bot-fila">
            <div class="bot-fila-info">
              <div class="cat-nombre">${esc(i.nombre)}</div>
              ${costoHabilidadTxt(S, i) ? `<div class="bot-fila-costo" title="Lo que cuesta ejecutarla">${esc(costoHabilidadTxt(S, i))}</div>` : ''}
            </div>
            <div class="bot-fila-btns">
              <button class="mini" data-view="habilidades:${i.id}">Ver</button>
              <button class="ejecutar-btn${habAutomatizada(i) ? ' con-lupa' : ''}${sinNitros?" sin-recursos":""}${Combatiente.esFlash(i) ? ' bt-flash' : ''}" data-ejecutar="${i.id}" ${sinNitros?'aria-disabled="true" title="No te alcanzan los recursos"':Combatiente.esFlash(i) ? 'title="⚡ Flash: se puede usar en turno ajeno (cuesta el doble)"' : ''}>${habAutomatizada(i) ? 'Ejecutar' + lupaBotonHtml(`habx:${i.id}`, "en-boton") : 'Anunciar'}</button>
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

    html += Combatiente.FLASH_CSS;   // el brillo de las habilidades con ⚡ Flash
    return {html, nitros: badgeNitros, sp: badgeSp, def: badgeDef};
  }

  return {STATS_CON_TIRADA_IDS, TIPOS_IDS, PERCEPCION_DADO_SUBE, html, tiradaStat, tiradaPercepcion, tiradaPercepcionValor,
    spMaximo, nitrosMaximo, tienePercepcionAumentada, tieneSigilo, efectoSigilo, efectoSentado,
    statsConTirada, habStatTirable, habTieneSegundaTirada, botonSegundaHab, dueloDe, modoHab, habAutomatizada,
    armasParaHabilidad, costoAtaqueMinimo, costoAtaqueHabTxt, costoNitrosHab, sinNitrosPara, costoHabilidadTxt,
    costoParryTxt, costoConsumirNitros, consumeButton,
    inteligenciaAuto, inteligenciaManual, inteligenciaValor, inteligenciaBudget, nivelSocial, dadoCarasSocial,
    nivelSocialTxt, tiradaSocialTxt, filaSocialBotonera};
})();
