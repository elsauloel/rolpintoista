/* =========================================================
   CREEP-DUELO — lo que el duelo (comun/duelo.js) le pide a un creep, fuera de GM Tools (paso 4, etapa 4c, tanda 4 de
   docs/plan-paso4-etapa4.md, 2026-10-01)
   Lo que antes era window.DUELO_HOOKS de gm-toolset/js/12 (y pagarFlashCreep / tirarPdgDeArreglosCreep de js/04), copiado tal
   cual: su PdG (ataque normal, de oportunidad, contraataque o «con arreglos» de una habilidad), cómo se defiende (Evasión o
   Parry), la Fuerza del golpe, el Bloqueo, el daño de su arma, el crítico, los efectos al golpear, el ⚡ Flash y las tiradas de
   una habilidad dirigida. Así contestan igual GM Tools (con su creep en memoria) y el mapa (con la parte privada que escucha).
   hooks(ui) → los ganchos. ui = {
     creep(ref) → el creep para leer (o null), cambiar(ref, fn) → Promise con lo que devuelve fn(sc) (fn cambia el creep; si
     devuelve {error}, no se guarda y se avisa; Promise de null), publicar(sc, t) (una tirada de comun/creep-acciones.js:
     {origen, r}, {error} o null), toast(t), confirmar(texto) → bool, soy(lado) → bool, borrarParry(ref) }
   Necesita comun/combatiente.js, creep-calculo.js, creep-acciones.js, efectos-golpe.js, confirmar-turno.js y tiradas.js.
   ========================================================= */
const CreepDuelo = (() => {
  const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
  const fmt = n => Number.isInteger(n) ? n : Math.round(n*100)/100;
  const C = () => CreepCalculo, A = () => CreepAcciones;
  const ATTR_IDS = ['con','fue','agl','des','esp'];
  const habStat = (sc, stat) => ATTR_IDS.includes(stat) ? num(sc[stat]) + C().modTotal(sc, stat) : C().statValor(sc, stat);

  // ⚡ Flash de un creep (P135, 2026-09-30): no gasta No2 (igual que en el personaje); su límite es el cooldown, y la vida si
  // la habilidad la cuesta.
  const costoFlash = h => ({cd: num(h.cd), hp: num(h.hpCosto)});
  function costoFlashTxt(h){ return ConfirmarTurno.textoFlash(costoFlash(h)); }
  // «¿Es el turno del creep?» (P136, regla del dueño): en su turno el Flash cuesta lo que dice la habilidad (cooldown y vida);
  // en turno ajeno, el doble. Nunca No2. Pregunta, revisa la vida y cobra; null = no se usó.
  async function pagarFlash(ui, ref, habId){
    const sc = ui.creep(ref), h = sc && (sc.habilidades || []).find(x => x.id === habId);
    if(!h) return null;
    const motivo = Combatiente.bloqueoHab(h, {hp: sc.hp});
    if(motivo){ ui.toast(`${sc.nombre}: ${h.nombre || 'Habilidad'} no se puede usar — ${motivo}`); return null; }
    const p = await ConfirmarTurno.flash(`⚡ ${h.nombre || 'Flash'}`, costoFlash(h), {quien: sc.nombre, ident: {nombre: sc.nombre, ref: sc.id}});
    if(!p) return null;
    return ui.cambiar(ref, c => {
      const hh = (c.habilidades || []).find(x => x.id === habId);
      if(p.hp > 0 && num(c.hp) <= p.hp) return {error: `${c.nombre}: no le alcanza la vida para ${h.nombre} (${fmt(p.hp)} HP)`};
      if(hh) hh.cdActual = p.cd;
      if(p.hp > 0) c.hp = num(c.hp) - p.hp;
      return p;
    });
  }

  // Atacar en el duelo: normal, de oportunidad o contraataque (cobra y tira el PdG). El normal pregunta si está Sentado. Sin No2
  // suficientes pregunta «¿Atacar igual?» (2026-10-02: antes se rechazaba y el aviso quedaba en GM Tools, escondido en el mapa).
  function atacarCon(ui, ref, tipo){
    const sc = ui.creep(ref);
    if(!sc) return;
    const qs = Combatiente.preguntaSentado(sc.estados, sc.nombre);   // Sentado no puede atacar (cualquier ataque): avisa y deja seguir
    if(qs && !ui.confirmar(qs)) return;
    const forzar = A().faltanNitros(sc, tipo);
    if(forzar && !ui.confirmar(A().preguntaSinNitros(sc, tipo))) return;
    return ui.cambiar(ref, c => A().pagarAtaque(c, tipo, forzar)).then(x => {
      if(!x) return;
      A().alertaSinNitros(sc, tipo, x.forzado);
      if(tipo === 'normal') ui.borrarParry(ref);   // atacar cierra el Parry que esperaba su Bloqueo
      ui.publicar(sc, A().tiradaAtaque(ui.creep(ref) || sc, tipo));
      ui.toast(x.aviso);
    });
  }
  // El PdG del ataque con arreglos, con lo que le suma la habilidad (los No2 ya los cobró la habilidad).
  function pdgDeArreglos(sc, atq){
    return A().tirada(`${sc.nombre} · PdG`, C().statValor(sc, 'pdg') + num(atq && atq.mods && atq.mods.pdg) + Combatiente.pdgExtraArma(st => C().modTotal(sc, st), {tipoDado: num(sc.armaTipo), armaDeRango: !!sc.armaDeRango}), sc, 'pdg');
  }

  function hooks(ui){
    const deLado = lado => lado ? ui.creep(lado.ref) : null;
    // Evasión contra oportunidad / contra contraataque (2026-10-04): lo que suma a la Evasión contra el ataque de este duelo.
    const evaEsp = (sc, d) => sc ? Combatiente.evaExtraDuelo(d, st => num(C().modTotal(sc, st))) : {val: 0, txt: ''};
    return {
      soy: lado => ui.soy(lado),
      // El daño de una habilidad dirigida (duelo.js, tirarDanoHab) se publica a nombre del creep (2026-10-05: en el mapa no había cómo y se quedaba callado).
      registrarTirada: (origen, r, d) => { const sc = d ? deLado(d.atacante) : null; if(sc) ui.publicar(sc, {origen, r}); else ui.toast('No se encontró el creep para tirar el daño'); },
      atacar: d => {
        const sc = deLado(d.atacante);
        if(!sc) return;
        if(d.ataque.tipo === 'habilidad-arma'){ ui.publicar(sc, pdgDeArreglos(sc, d.ataque)); return; }   // los No2 ya los cobró la habilidad
        return atacarCon(ui, d.atacante.ref, d.ataque.tipo === 'normal' ? 'normal' : d.ataque.tipo);
      },
      // Para el crítico: el Crítico frecuente y potente del creep y su Resistencia a crítico contra el Tipo del arma que lo ataca.
      statsCritico: d => {
        const sc = deLado(d.atacante);
        return sc ? {frecuente: Math.max(0, Math.round(C().modTotal(sc, 'crit'))), potente: Math.max(0, Math.round(C().modTotal(sc, 'critpot'))),
          ignora: Combatiente.ignoraResistCritArma(Combatiente.armaDeCombatiente(sc)), d20: Math.max(0, Math.round(num(Combatiente.armaDeCombatiente(sc).critD20)))} : {frecuente: 0, potente: 0};
      },
      resistenciaCritico: d => {
        const sc = deLado(d.defensor);
        const i = [4, 6, 8, 10, 12].indexOf(num(d.ataque.tipoDado));
        return sc && i >= 0 ? num((sc.crit || [])[i]) : 0;
      },
      // Los efectos al golpear del arma del creep, que el duelo resuelve uno por uno.
      efectosArma: d => {
        const sc = deLado(d.atacante);
        return sc ? (sc.armaEfectos || []).map(e => ({...EfectosGolpe.normalizar(e), stacks: num(e.stacks)})) : [];
      },
      // El daño del arma del creep (sin los efectos del golpe: los resuelve el duelo en su paso de efectos).
      dano: d => {
        const sc = deLado(d.atacante);
        if(!sc) return;
        let formula = C().danoTxt(sc, C().statValor(sc, 'dmg'));
        const m = d.ataque.tipo === 'habilidad-arma' ? (d.ataque.mods || {}) : null;   // lo que le suma la habilidad: dados del Tipo del arma y daño fijo
        if(m){
          if(num(m.dados) > 0) formula += ` + ${Math.round(num(m.dados))}d${num(sc.armaTipo) || 8}`;
          if(num(m.fijo)) formula += ` ${num(m.fijo) > 0 ? '+' : '-'} ${fmt(Math.abs(num(m.fijo)))}`;
        }
        const r = tirarDados(formula);
        if(r) ui.publicar(sc, {origen: `${sc.nombre} · Daño`, r});
      },
      // ⚡ Flash (P135): las reacciones del creep que sirven para esta tirada del duelo (se marcan antes de tirar) y su uso.
      flashOpciones: (d, campo) => {
        const lado = (campo === 'pdg' || campo === 'fuerza' || campo === 'dano') ? d.atacante : d.defensor;
        const sc = deLado(lado);
        if(!sc) return [];
        return (sc.habilidades || []).filter(h => Combatiente.flashPara(h.duelo, campo)).map(h => ({habId: h.id, nombre: h.nombre, bono: num(h.duelo.flash.bono), en: h.duelo.flash.en || [],
          costoTxt: costoFlashTxt(h), motivoNo: Combatiente.bloqueoHab(h, {hp: sc.hp}).toLowerCase()}));
      },
      flashUsar: (d, campo, modo, habId) => {
        const lado = (campo === 'pdg' || campo === 'fuerza' || campo === 'dano') ? d.atacante : d.defensor;
        const sc = deLado(lado);
        const h = sc && (sc.habilidades || []).find(x => x.id === habId);
        if(!h || !Combatiente.flashPara(h.duelo, campo)) return null;
        if(!Combatiente.flashPara(h.duelo, campo, modo)){ ui.toast(`${h.nombre} no vale para esta tirada (${modo === 'parry' ? 'Parry' : campo})`); return null; }
        // «¿es su turno?»: lo de la habilidad o el doble (P136); sin No2
        return pagarFlash(ui, lado.ref, habId).then(p => p ? {bono: num(h.duelo.flash.bono), etq: h.nombre, quien: sc.nombre} : null);
      },
      // Habilidades dirigidas: la tirada del creep que la usa (quien = 'atacante') o la del creep que se resiste (quien = 'defensor').
      habTirar: (d, quien, modo) => {
        const lado = quien === 'atacante' ? d.atacante : d.defensor;
        const sc = deLado(lado);
        const c = quien === 'atacante' ? d.hab.tira : (d.hab.contra || []).find(x => x.modo === modo);
        if(!sc || !c) return;
        const nombre = quien === 'atacante' ? `${d.hab.nombre} · ${c.etq}` : c.etq;
        // Tirada personalizada (la fórmula llega lista desde habEjecucion): se tira y se anuncia, como en la ficha.
        if(c.formula){ const r = tirarDados(c.formula); if(r) ui.publicar(sc, {origen: nombre, r}); else ui.toast(`No se pudo tirar «${c.etq}»: la fórmula «${c.formula}» no es válida (revisá la habilidad)`); return; }
        if(!c.stat) return;
        ui.publicar(sc, A().tirada(nombre, habStat(sc, c.stat) + num(c.bono), sc, c.stat));
      },
      habValor: (d, quien, stat) => {
        const sc = deLado(quien === 'atacante' ? d.atacante : d.defensor);
        if(!sc) return '';
        const v = habStat(sc, stat), f = formulaParaValor(v);
        return f ? f.formula : fmt(num(v));
      },
      // ¿El creep objetivo de una habilidad dirigida puede parriar ahora? (2026-09-29, misma regla que un ataque
      // normal, P121: sin arma no hay Parry.)
      puedeParry: d => !!C().defensa(deLado(d.defensor)),   // arma de verdad o escudo (un arma natural no alcanza, por ahora)
      // Cómo puede defenderse el creep (elige el GM, a ciegas): Evasión o Parry con su arma (siempre 1 No2).
      opcionesDefensa: d => {
        const sc = deLado(d.defensor);
        if(!sc) return [];
        // «Cuánto tirarías» antes de elegir (2026-09-27, pedido del dueño).
        const fx = (v, statId) => { const f = formulaParaValor(v); if(!f) return fmt(num(v)); const mit = statId ? Combatiente.mitadesDeTirada(sc.estados, statId) : 0; return f.formula + ' ÷2'.repeat(mit); };
        const gratis = Combatiente.parryGratis(st => C().modTotal(sc, st), num((sc.usosEspecial || {})._parry));   // Parada fácil (2026-10-06)
        const c = gratis ? 0 : C().costoParry(sc);
        const ee = evaEsp(sc, d);
        const ops = [{modo: 'evasion', etiqueta: '🏃 Evasión', info: [`Evasión 🎲 ${fx(C().statValor(sc, 'eva') + ee.val, 'eva')}${ee.val ? ` (con ${ee.txt})` : ''}`]}];
        // Parry solo con un arma de verdad o un escudo (regla del dueño, 2026-09-30; un arma natural no alcanza, por ahora).
        const def = C().defensa(sc);
        if(Combatiente.stuneado(sc.estados)) return [{modo: 'evasion', etiqueta: '🏃 Evasión · Stun: 1', info: ['⚡ Stun: no puede hacer nada; su Evasión es 1']}];   // Stun (2026-10-06)
        if(def) ops.push({modo: 'parry', itemId: '', itemNombre: def.nombre, etiqueta: `${def.nombre === sc.armaNombre ? '🗡' : '🛡'} Parry · ${def.nombre}${gratis ? ' · gratis (Parada fácil)' : ''}`, costo: c, motivoNo: '',
          info: [`Parry 🎲 ${fx(C().statValor(sc, 'parry'), 'parry')}`, `si gana, Bloqueo 🎲 ${fx(C().bloqueoValor(sc))}`, ...(c > num(sc.nitros) ? ['⚠ sin No2: queda en negativo (se descuenta al recargar)'] : [])]});
        return ops;
      },
      defender: (d, modo) => {
        const sc = deLado(d.defensor);
        if(!sc) return;
        if(modo === 'parry'){
          if(!C().defensa(sc)){ ui.toast(`${sc.nombre}: ${Combatiente.SIN_ARMA_DEFENSA}`); return; }
          return ui.cambiar(d.defensor.ref, c => A().pagarParry(c)).then(x => {   // sin No2 queda en negativo (2026-10-06)
            if(!x) return;
            if(x.deuda) Combatiente.avisarDeudaNo2(x.deuda);
            ui.publicar(sc, A().tirada(`${sc.nombre} · Parry`, C().statValor(sc, 'parry'), sc, 'parry'));
            ui.toast(x.aviso);
          });
        }
        const ee = evaEsp(sc, d);
        ui.publicar(sc, A().tirada(`${sc.nombre} · Evasión${ee.val ? ` (${ee.txt})` : ''}`, C().statValor(sc, 'eva') + ee.val, sc, 'eva'));
      },
      fuerza: d => {
        const sc = deLado(d.atacante);
        if(sc) ui.publicar(sc, A().tirada(`${sc.nombre} · Fuerza del golpe`, C().fuerzaGolpeValor(sc)));
      },
      bloquear: d => {
        const sc = deLado(d.defensor);
        const firme = sc ? A().bloqueoFirmeCreep(sc) : 0;   // Bloqueo firme (2026-10-06)
        if(sc) ui.publicar(sc, A().tirada(`${sc.nombre} · Bloqueo${firme ? ` (+${fmt(firme)} Bloqueo firme)` : ''}`, C().bloqueoValor(sc) + firme, sc, 'bloqueo'));
      },
      armaContra: d => {
        const sc = deLado(d.defensor);
        return {armaId: '', armaNombre: (sc && sc.armaNombre) || '', tipoDado: (sc && num(sc.armaTipo)) || 8};
      },
    };
  }

  return {hooks, pagarFlash, costoFlash, costoFlashTxt, pdgDeArreglos, atacarCon, habStat};
})();
