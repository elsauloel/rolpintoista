/* =========================================================
   FICHA-DUELO — lo que el duelo (comun/duelo.js) le pide a un PERSONAJE: tirar su PdG, su defensa, su daño, la Fuerza del
   golpe, el Bloqueo, su crítico, el Flash, la Moneda Re-Roll, una habilidad dirigida, con qué arma contraataca (paso 4,
   etapa 3c-4c de docs/plan-paso4-etapa3.md, 2026-10-01).
   Antes vivía solo en la ficha (window.DUELO_HOOKS, js/11): ahora la ficha y la Botonera nueva del mapa arman los mismos
   ganchos con `FichaDuelo.hooks(() => S, ui)`. Las invocaciones NO están acá: la ficha las sigue resolviendo con su código
   (el mapa se las pide al marco).
     ui = el mismo de FichaAcciones para combate (toast, registrarTirada, cambio, getParry/setParry, preguntarSobrepeso,
          elegirArma, efectosAlPegar, avisarSinNitros) + soy(lado), controlDe(lado), reabrir(id, campo) (Duelo.reabrir) y
          fijarHp(valor) (baja la vida y revisa Ankh/muerte como cada pantalla lo haga).
     cambio(lista) además puede recibir 'vitals', 'inventario' y 'cinturon' (qué redibujar).
   Copiado tal cual de la ficha (js/11 DUELO_HOOKS, js/02 Moneda Re-Roll, js/11 pagarFlash), con `S` como parámetro.
   Necesita ficha-calculo.js, ficha-combate.js, ficha-habilidades.js, ficha-botonera.js, ficha-acciones.js, combatiente.js,
   efectos-golpe.js, tiradas.js y confirmar-turno.js antes.
   ========================================================= */
const FichaDuelo = (() => {
  const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
  function fmt(n){ return Number.isInteger(n) ? n : Math.round(n*100)/100; }
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  /* ---------- Moneda Re-Roll (js/02) ---------- */
  const esMonedaReroll = i => !!i && !!(i.rerollMoneda || /moneda re-?roll/i.test(String(i.nombre || '')));
  function monedaReroll(S){
    const enC = S.cinturon.find(i => esMonedaReroll(i) && num(i.unidades) > 0);
    if(enC) return {key: 'cinturon', it: enC};
    const enM = S.inventario.find(i => esMonedaReroll(i) && num(i.unidades) > 0 && !i.enMesa);
    return enM ? {key: 'inventario', it: enM} : null;
  }
  // Tira la moneda: par se conserva, impar se rompe.
  function tirarMonedaReroll(S, m, ui){
    const r = tirarDados('1d2');   // 2 = par (se conserva) · 1 = impar (se rompe)
    const par = r.total % 2 === 0;
    ui.registrarTirada(`🪙 Moneda Re-Roll · ${par ? 'par: se conserva' : 'impar: se rompe'}`, r);
    if(!par){
      m.it.unidades = num(m.it.unidades) - 1;
      FichaAcciones.purgarSiAgotado(S, m.key, m.it.id);
      ui.cambio([m.key === 'inventario' ? 'inventario' : 'cinturon']);
      ui.toast(`🪙 La moneda se rompió (impar)${num(m.it.unidades) > 0 ? '' : ': era la última'}`);
    }else ui.toast('🪙 La moneda se conserva (par)');
    ui.cambio(['refresh']);
    return !par;
  }

  /* ---------- ⚡ Flash (js/11, P136): en tu turno cuesta lo que dice la habilidad (SP y vida); en turno ajeno, el doble.
     Nunca cuesta No2. Pregunta el turno, revisa que alcance y cobra; null = no se usó. ---------- */
  const costoFlashDe = h => ({sp: FichaHabilidades.parseCostoSp(h.costo), hp: num(h.hpCosto)});
  async function pagarFlash(S, h, ui){
    const p = await ConfirmarTurno.flash(`⚡ ${h.nombre || 'Flash'}`, costoFlashDe(h), {spAjeno: h.turnoAjenoSp});
    if(!p) return null;
    if(p.sp > FichaBotonera.spMaximo(S) - num(S.spGastado)){ ui.toast(`No te alcanzan los SP para ${h.nombre} (${fmt(p.sp)} SP)`); return null; }
    if(p.hp > 0 && num(S.hp) <= p.hp){ ui.toast(`No te alcanza la vida para ${h.nombre} (${fmt(p.hp)} HP)`); return null; }
    S.spGastado = num(S.spGastado) + p.sp;
    if(p.hp > 0) ui.fijarHp(num(S.hp) - p.hp);
    ui.cambio(['vitals', 'refresh']);
    return p;
  }

  // Un Flash con el botón Ejecutar, fuera del cuadro del duelo (js/11): la misma regla de costo, se anuncia y el bono se suma a
  // mano. ui suma mesaHabilidad(nombre, detalle) y cambio(['habilidades']).
  async function usarFlashFueraDelDuelo(S, it, ui){
    const p = await pagarFlash(S, it, ui);
    if(!p) return;
    const f = FichaBotonera.dueloDe(it).flash || {};
    ui.mesaHabilidad(it.nombre, `${it.detalle || ''}${it.detalle ? ' — ' : ''}⚡ Flash: +${fmt(num(f.bono))} a la tirada.`);
    ui.cambio(['habilidades']);
    ui.toast(`${it.nombre}: ⚡ +${fmt(num(f.bono))} (sumalo a mano a la tirada; dentro del duelo se suma solo) · ${ConfirmarTurno.textoCosto(p)}`);
  }

  /* ---------- Los ganchos del duelo para un personaje (js/11, DUELO_HOOKS: lo que no es de invocaciones) ---------- */
  function hooks(getS, ui){
    const tirarValorStat = (nombre, valor, statId, extra, sobrepeso, sobre) => FichaAcciones.tirarValorStat(getS(), nombre, valor, statId, extra, sobrepeso, sobre, ui);
    const compute = () => FichaCalculo.calcular(getS());
    const armaDelInv = id => id ? getS().inventario.find(x => x.id === id) || null : null;
    const armasYEscudosParaParry = () => FichaCombate.armasYEscudosParaParry(getS());
    const statParaArma = (statId, arma) => FichaCombate.statParaArma(getS(), statId, arma);
    return {
      soy: lado => ui.soy(lado),
      controlDe: lado => ui.controlDe ? ui.controlDe(lado) : '',
      registrarTirada: (origen, r) => ui.registrarTirada(origen, r),
      // El ataque de siempre (paga los No2 y tira el PdG).
      atacar: d => {
        const S = getS();
        const arma = d.ataque.armaId ? S.inventario.find(x => x.id === d.ataque.armaId) || null : null;
        if(d.ataque.tipo === 'habilidad-arma'){   // los No2 del ataque ya los cobró la habilidad: solo se tira el PdG (con lo que le suma)
          tirarValorStat(arma ? `PdG · ${arma.nombre}` : 'PdG', FichaCombate.pdgParaArma(S, arma).valor + num(d.ataque.mods && d.ataque.mods.pdg), 'pdg');
          return;
        }
        if(d.ataque.tipo === 'normal') FichaAcciones.atacarConArma(S, arma, undefined, ui); else FichaAcciones.ataqueEspecialConArma(S, arma, d.ataque.tipo, undefined, ui);
      },
      // Para el crítico: el Crítico frecuente y potente del atacante (con el arma que usa).
      statsCritico: d => {
        const arma = armaDelInv(d.ataque.armaId);
        const f = statParaArma('crit', arma), p = statParaArma('critpot', arma);
        const conque = arma || (FichaCombate.armasEquipadasConDano(getS())[0] || {}).item || null;   // sin arma elegida: la principal (como el daño)
        return {frecuente: Number.isNaN(f) ? 0 : Math.max(0, Math.round(f)), potente: Number.isNaN(p) ? 0 : Math.max(0, Math.round(p)), ignora: Combatiente.ignoraResistCritArma(conque), d20: Math.max(0, Math.round(num(conque && conque.critD20)))};
      },
      // La Resistencia a crítico del defensor contra el Tipo del arma.
      resistenciaCritico: d => {
        const i = [4, 6, 8, 10, 12].indexOf(num(d.ataque.tipoDado));
        if(i < 0) return 0;
        const v = compute().final['tipo' + (i + 1)];
        return Number.isNaN(v) ? 0 : Math.max(0, Math.round(v));
      },
      // Los efectos al golpear del arma que el duelo resuelve uno por uno.
      efectosArma: d => {
        const S = getS();
        const arma = d.ataque.armaId ? S.inventario.find(x => x.id === d.ataque.armaId) || null : (FichaCombate.armasEquipadasConDano(S)[0] || {}).item || null;
        return arma ? (arma.efectosGolpe || []).map(e => ({...EfectosGolpe.normalizar(e), stacks: num(e.stacks)})) : [];
      },
      // El daño del arma del ataque (sin los efectos del golpe: los resuelve el duelo en su paso de efectos).
      dano: d => {
        const S = getS();
        const arma = d.ataque.armaId ? S.inventario.find(x => x.id === d.ataque.armaId) || null : (FichaCombate.armasEquipadasConDano(S)[0] || {}).item || null;
        // Sin arma: el daño sin arma (provisorio, P150) — antes avisaba y el duelo quedaba esperando.
        let formula = arma ? FichaCombate.armaDanoTxt(arma, compute().final.dmg) : FichaCombate.danoSinArmaTxt(compute().final.dmg);
        const m = d.ataque.tipo === 'habilidad-arma' ? (d.ataque.mods || {}) : null;   // lo que le suma la habilidad: dados del Tipo del arma y daño fijo
        if(m){
          if(num(m.dados) > 0) formula += ` + ${Math.round(num(m.dados))}d${FichaCombate.tipoAtaque(arma)}`;
          if(num(m.fijo)) formula += ` ${num(m.fijo) > 0 ? '+' : '−'} ${fmt(Math.abs(num(m.fijo)))}`.replace('−', '-');
        }
        const r = tirarDados(formula);
        if(r) ui.registrarTirada(`Daño · ${arma ? arma.nombre : 'sin arma'}`, r);
      },
      // Moneda Re-Roll: ¿tengo una? / usarla para reabrir una tirada del duelo.
      rerollInfo: d => {
        const m = monedaReroll(getS());
        return m ? {disponible: true, donde: m.key === 'cinturon' ? 'el cinturón' : 'la mochila'} : {disponible: false};
      },
      rerollUsar: async (d, campo) => {
        const m = monedaReroll(getS());
        if(!m){ ui.toast('No tenés una Moneda Re-Roll'); return false; }
        const ok = await ui.reabrir(d.id, campo);
        if(!ok){ ui.toast('La tirada ya no se puede repetir (no se gastó la moneda)'); return false; }
        setTimeout(() => tirarMonedaReroll(getS(), m, ui), 800);
        return true;
      },
      // Flash: las habilidades Flash que me sirven para esta tirada del duelo (se marcan ANTES de tirar) y su uso.
      flashOpciones: (d, campo) => {
        const S = getS();
        const sp = FichaBotonera.spMaximo(S) - num(S.spGastado);
        return S.habilidades.filter(h => Combatiente.flashPara(FichaBotonera.dueloDe(h), campo))   // regla común (comun/combatiente.js)
          .map(h => { const c = FichaBotonera.dueloDe(h).flash, costo = FichaHabilidades.parseCostoSp(h.costo); return {habId: h.id, nombre: h.nombre, bono: num(c.bono), en: c.en || [], costoSp: costo,
            costoTxt: ConfirmarTurno.textoFlash(costoFlashDe(h), {spAjeno: h.turnoAjenoSp}), motivoNo: costo > sp ? 'no te alcanzan los SP' : ''}; });
      },
      // Usarlo: «¿es tu turno?» — en turno ajeno cuesta el doble (P136); se cobra al contestar y el duelo suma el bono.
      flashUsar: (d, campo, modo, habId) => {
        const S = getS();
        const h = S.habilidades.find(x => x.id === habId), c = h && FichaBotonera.dueloDe(h);
        if(!c || c.modo !== 'flash' || !c.flash) return null;
        if(!Combatiente.flashPara(c, campo, modo)){ ui.toast(`${h.nombre} no vale para esta tirada (${modo === 'parry' ? 'Parry' : campo})`); return null; }
        return pagarFlash(S, h, ui).then(p => p ? {bono: num(c.flash.bono), etq: h.nombre, quien: (S.meta && S.meta.nombre) || 'Personaje'} : null);
      },
      // Habilidades dirigidas: la tirada de quien la usa (quien = 'atacante') o la de quien se resiste (quien = 'defensor', modo = el stat que eligió).
      habTirar: (d, quien, modo) => {
        const c = quien === 'atacante' ? d.hab.tira : (d.hab.contra || []).find(x => x.modo === modo);
        if(!c) return;
        const nombre = quien === 'atacante' ? `${d.hab.nombre} · ${c.etq}` : c.etq;
        // Tirada personalizada: la fórmula ya viene resuelta (X sustituida) desde la habilidad — acá solo se tira y se anuncia.
        if(c.formula){ const r = tirarDados(c.formula); if(r) ui.registrarTirada(nombre, r); else ui.toast(`No se pudo tirar «${c.etq}»: la fórmula «${c.formula}» no es válida (revisá la habilidad)`); return; }
        if(!c.stat) return;
        const v = compute().final[c.stat];
        tirarValorStat(nombre, num(v) + num(c.bono), c.stat);
      },
      // «Cuánto tirarías»: la fórmula de dados de ese stat (para el botón de defensa).
      habValor: (d, quien, stat) => {
        const v = compute().final[stat];
        const f = formulaParaValor(num(v));
        return f ? f.formula : fmt(num(v));
      },
      // ¿El objetivo de una habilidad dirigida puede parriar ahora? (sin arma ni escudo equipado, no hay Parry.)
      puedeParry: d => armasYEscudosParaParry().length > 0,
      // Cómo puede defenderse (elige a ciegas): Evasión, o Parry con cada arma o escudo equipado (siempre 1 No2).
      opcionesDefensa: d => {
        const S = getS();
        // «cuánto tirarías»: la fórmula de dados de cada defensa (con las mitades de Lisiado/Pajaritos/Sentado…) y, para cada Parry, el Bloqueo que tirarías si ganás.
        const fx = (v, statId, estados) => { const f = formulaParaValor(v); if(!f) return fmt(num(v)); const mit = statId ? Combatiente.mitadesDeTirada(estados, statId) : 0; return f.formula + ' ÷2'.repeat(mit); };
        const c = compute();
        const sobre = c.sobrecarga;
        // Con sobrepeso la Evasión pide elegir: pagar 1 No2 para tirar sin penalidad o tirar con −N. Se elige acá, en el cuadro del duelo.
        const ops = sobre > 0
          ? [{modo: 'evasion', itemId: 'pagado', etiqueta: '🏃 Evasión · pagando 1 No2', costo: 1, motivoNo: num(S.nitros) < 1 ? 'no te alcanzan los No2' : '', info: [`Evasión 🎲 ${fx(c.final.eva, 'eva', S.efectos)}`, `sin la penalidad de sobrepeso (−${fmt(sobre)})`]},
             {modo: 'evasion', itemId: 'penal', etiqueta: `🏃 Evasión · con penalidad −${fmt(sobre)}`, motivoNo: '', info: [`Evasión 🎲 ${fx(c.final.eva, 'eva', S.efectos)} −${fmt(sobre)}`, 'no gastás No2']}]
          : [{modo: 'evasion', itemId: '', etiqueta: '🏃 Evasión', motivoNo: '', info: [`Evasión 🎲 ${fx(c.final.eva, 'eva', S.efectos)}`]}];
        // Sin arma ni escudo equipado no se puede parriar (regla del dueño, 2026-09-28).
        armasYEscudosParaParry().forEach(a => {
          const costo = Combatiente.costoParry();
          ops.push({modo: 'parry', itemId: a.item.id, itemNombre: a.item.nombre, etiqueta: `${String(a.item.tipoItem).startsWith('escudo') ? '🛡' : '🗡'} Parry · ${a.item.nombre}`, costo, motivoNo: costo > num(S.nitros) ? 'no te alcanzan los No2' : '',
            info: [`Parry 🎲 ${fx(statParaArma('parry', a.item), 'parry', S.efectos)}`, `si ganás, Bloqueo 🎲 ${fx(FichaCombate.bloqueoValor(S, a.item))}`]});
        });
        return ops;
      },
      defender: (d, modo, itemId) => {
        const S = getS();
        if(modo === 'parry') FichaAcciones.parryConArma(S, itemId ? S.inventario.find(x => x.id === itemId) || null : null, undefined, ui);
        else if(itemId === 'pagado' || itemId === 'penal'){   // Evasión con sobrepeso: la elección ya se hizo en el cuadro del duelo
          const sobre = compute().sobrecarga;
          if(itemId === 'pagado'){
            if(num(S.nitros) < 1){ ui.toast('No tenés No2 para pagar: elegí tirar con la penalidad'); return; }
            S.nitros = num(S.nitros) - 1; ui.cambio(['nitros', 'refresh']);
          }
          tirarValorStat('Evasión', compute().final.eva, 'eva', undefined, itemId === 'pagado' ? 'pagado' : 'penal', sobre);
        }
        else tirarValorStat('Evasión', compute().final.eva, 'eva');
      },
      // La Fuerza del golpe del atacante contra el Bloqueo del defensor (Fue + peso de su arma).
      fuerza: d => FichaAcciones.fuerzaGolpeConArma(getS(), armaDelInv(d.ataque.armaId), ui),
      // El Bloqueo del defensor con el mismo arma o escudo con el que hizo Parry.
      bloquear: d => {
        const it = d.defensa && d.defensa.itemId ? getS().inventario.find(x => x.id === d.defensa.itemId) || null : null;
        ui.setParry(null);
        // Con el arma o escudo del Parry; si ya no está, con el primero que haya en mano; sin nada, no hay Bloqueo.
        const conQue = it || ((armasYEscudosParaParry()[0] || {}).item) || null;
        if(!conQue){ ui.toast(Combatiente.SIN_ARMA_DEFENSA); return; }
        FichaAcciones.bloqueoConArma(getS(), conQue, ui);
      },
      // Con qué arma contraataca (la del Parry si es un arma con daño; si no, la primera arma equipada con daño).
      armaContra: d => {
        const S = getS();
        const usada = d.defensa && d.defensa.itemId ? S.inventario.find(x => x.id === d.defensa.itemId) : null;
        const conDano = FichaCombate.armasEquipadasConDano(S);
        const it = (usada && conDano.some(a => a.item.id === usada.id)) ? usada : (conDano.length ? conDano[0].item : null);
        return {armaId: it ? it.id : '', armaNombre: it ? it.nombre : '', tipoDado: FichaCombate.tipoAtaque(it)};
      },
    };
  }

  /* ---------- La ventana de la Moneda Re-Roll (2026-10-02, hoja de ruta A6a: la usan la ficha y el mapa) ----------
     rerollHtml(S, lista): el aviso (¿tiene moneda?) y la lista de "mis últimas tiradas" (comun/tiradas-propias.js) con su botón
     (`data-rerollpick` = la clave) o "ya usó su re-roll". repetirTirada(u, registrar): vuelve a tirar los mismos dados de una tirada
     (con sus mismos bonos y mitades) y la registra con registrar(origen, r); false si no se puede. */
  function rerollHtml(S, lista){
    const m = monedaReroll(S);
    lista = (lista || []).filter(h => !/^🪙 Moneda Re-Roll/.test(String(h.origen)));
    const aviso = m
      ? `Tenés una Moneda Re-Roll en <b>${m.key === 'cinturon' ? 'el cinturón' : 'la mochila'}</b>. Elegí qué tirada repetir: no cuesta No2, pero después se tira la moneda (par se conserva, impar se rompe).`
      : `No tenés una Moneda Re-Roll equipada (cinturón o mochila). Podés ver tus últimas tiradas igual.`;
    const filas = lista.length ? lista.map(h => {
      const usada = TiradasPropias.usada(h, S.rerollUsados);
      return `<div class="item"><div class="ihead"><div><div class="iname">${esc(h.origen)}</div><div class="idesc">${esc(h.formula || '')}${h.rolls && h.rolls.length ? ' → ' + h.rolls.join(' + ') : ''}${num(h.mod) ? ' ' + (num(h.mod) > 0 ? '+' : '−') + ' ' + Math.abs(num(h.mod)) : ''} = <b>${fmt(num(h.total))}</b></div></div>
      ${usada ? '<span class="tag">ya usó su re-roll</span>' : `<button type="button" class="mini" data-rerollpick="${esc(h.clave)}"${m ? '' : ' disabled'}>🪙 Re-roll</button>`}</div></div>`;
    }).join('') : '<div class="hint">Todavía no hiciste ninguna tirada.</div>';
    return {aviso, filas};
  }
  function repetirTirada(u, registrar, toast){
    const mit = (String(u.formula || '').match(/÷2/g) || []).length;
    const base = String(u.formula || '').replace(/÷2/g, '').replace(/\+\s*\d+\s*⚡/g, '');
    const p = typeof parseDados === 'function' ? parseDados(base) : null;
    if(!p || !p.dados.length){ if(toast) toast('No se puede repetir esa tirada'); return false; }
    const rolls = [];
    p.dados.forEach(g => { for(let k = 0; k < g.n; k++) rolls.push(1 + Math.floor(Math.random() * g.caras)); });
    const total = Combatiente.aplicarMitades(rolls.reduce((a, b) => a + b, 0) + num(u.mod), mit);
    registrar(`${String(u.origen).replace(/ \(re-roll\)$/, '')} (re-roll)`, {formula: u.formula, rolls, mod: u.mod, total, estados: u.estados});
    return true;
  }
  // Usar la moneda en una tirada: la marca (una moneda por tirada), la repite y, un momento después, tira la moneda.
  function usarReroll(S, h, ui){
    const m = monedaReroll(S);
    if(!h || !m || TiradasPropias.usada(h, S.rerollUsados)) return false;
    S.rerollUsados = [...(S.rerollUsados || []), h.clave, ...(h.docId && h.docId !== h.clave ? [h.docId] : [])].slice(-50);
    if(!repetirTirada(h, ui.registrarTirada, ui.toast)) return false;
    setTimeout(() => tirarMonedaReroll(S, m, ui), 900);
    return true;
  }

  return {esMonedaReroll, monedaReroll, tirarMonedaReroll, rerollHtml, repetirTirada, usarReroll, costoFlashDe, pagarFlash, usarFlashFueraDelDuelo, hooks};
})();
