/* =========================================================
   INV-DUELO — lo que el duelo (comun/duelo.js) le pide a una invocación, fuera de la ficha (paso 4, etapa 4e, tanda 4 de
   docs/plan-paso4-etapa4.md, 2026-10-01)
   Lo que antes eran las ramas «si el lado es una invocación» de window.DUELO_HOOKS (ficha-personaje/js/11) y pagarFlashInv /
   costoFlashInv (js/04), copiado tal cual: atacar, crítico, efectos del arma, daño, Flash, habilidad dirigida, defensa, Fuerza
   del golpe, Bloqueo y contraataque. Un lado del duelo que es una invocación lleva ref = «fichaId~invId».
   hooks(ui) → los ganchos (cada uno busca su invocación con ui.inv(lado)). ui = {
     inv(lado) → la invocación (el objeto vivo, se cambia en el lugar) o null,
     registrar(origen, r) → publica una tirada (la ficha: registrarTirada; el mapa: a la Mesa y 'tirada-registrada'),
     toast(t), confirmar?(texto) → bool (por defecto, confirm), cambiar(fn) → hace fn (que cambia la invocación; si devuelve false no cambió nada) y lo guarda/dibuja,
     parry → el Set de invocaciones con un Parry esperando su Bloqueo, soy(lado), controlDe(lado) }.
   pagarFlash(inv, h, ui) (async) y costoFlash(h): el ⚡ Flash de una invocación (como un creep: cooldown y vida).
   Necesita comun/inv-calculo.js, inv-acciones.js, combatiente.js, efectos-golpe.js, confirmar-turno.js y tiradas.js.
   ========================================================= */
const InvDuelo = (() => {
  const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
  const fmt = n => Number.isInteger(n) ? n : Math.round(n*100)/100;
  const I = () => InvCalculo, A = () => InvAcciones;

  // ⚡ Flash de una invocación (igual que un creep, P135/P136): cooldown y vida — el doble en turno ajeno —, nunca No2.
  const costoFlash = h => ({cd: num(h.cd), hp: num(h.hpCosto)});
  async function pagarFlash(inv, h, ui){
    const motivo = Combatiente.bloqueoHab(h, {hp: inv.hp});
    if(motivo){ ui.toast(`${inv.nombre}: ${h.nombre || 'Habilidad'} no se puede usar — ${motivo}`); return null; }
    const p = await ConfirmarTurno.flash(`⚡ ${h.nombre || 'Flash'}`, costoFlash(h), {quien: inv.nombre});
    if(!p) return null;
    if(p.hp > 0 && num(inv.hp) <= p.hp){ ui.toast(`${inv.nombre}: no le alcanza la vida para ${h.nombre} (${fmt(p.hp)} HP)`); return null; }
    ui.cambiar(() => {
      h.cdActual = p.cd;
      if(p.hp > 0) inv.hp = num(inv.hp) - p.hp;
    });
    return p;
  }

  function hooks(ui){
    // Evasión contra oportunidad / contra contraataque (2026-10-04): lo que suma a la Evasión contra el ataque de este duelo.
    const evaEsp = (inv, d) => inv ? Combatiente.evaExtraDuelo(d, st => num(I().modTotal(inv, st))) : {val: 0, txt: ''};
    const publicar = t => { if(!t) return; if(t.error){ ui.toast(t.error); return; } ui.registrar(t.origen, t.r); };
    // Una tirada de stat con su regla (el Parry cobra y deja el Bloqueo pendiente; el Bloqueo lo cierra): invTirarStat.
    function tirarStat(inv, statId, o){
      let p;
      ui.cambiar(() => {
        p = A().tirarStat(inv, statId, {...(o || {}), parryPendiente: ui.parry.has(inv.id)});
        if(p.error) return false;
        if(p.parry === 'sacar') ui.parry.delete(inv.id);
        if(p.parry === 'poner') ui.parry.add(inv.id);
        return !!p.parry;
      });
      if(p.error){ ui.toast(p.error); return; }
      if(p.aviso) ui.toast(p.aviso);
      publicar(p.tirada);
    }
    // El ataque suelto (sin arreglos): cobra, cierra el Parry pendiente y tira el PdG: invAtacarSuelto.
    // Sin No2 suficientes pregunta «¿Atacar igual?» (B-7, 2026-10-02: antes se rechazaba): gasta los que tenga y deja la línea roja.
    // tipo: 'normal', 'oportunidad' o 'contra' (los dos últimos, como los creeps: lo de un primer ataque y el PdG especial de su arma).
    function atacarSuelto(inv, tipo){
      const qs = Combatiente.preguntaSentado(inv.estados, inv.nombre);   // Sentado no puede atacar: avisa y deja seguir
      if(qs && !(ui.confirmar || (t => confirm(t)))(qs)) return;
      const forzar = A().faltanNitros(inv, tipo);
      if(forzar && !(ui.confirmar || (t => confirm(t)))(A().preguntaSinNitros(inv, tipo))) return;
      let p;
      ui.cambiar(() => {
        p = A().pagarAtaque(inv, forzar, tipo);
        if(p.error) return false;
        if(tipo !== 'oportunidad' && tipo !== 'contra') ui.parry.delete(inv.id);   // atacar cierra el Parry que esperaba su Bloqueo
      });
      if(p.error){ ui.toast(p.error); return; }
      A().alertaSinNitros(inv, p.forzado, tipo);
      publicar(A().tiradaAtaque(inv, tipo));
      ui.toast(p.aviso);
    }
    const ladoDe = (d, campo) => (campo === 'pdg' || campo === 'fuerza' || campo === 'dano') ? d.atacante : d.defensor;
    return {
      soy: lado => ui.soy(lado),
      registrarTirada: (origen, r) => ui.registrar(origen, r),   // el daño de una habilidad dirigida (duelo.js, tirarDanoHab)
      controlDe: lado => ui.controlDe ? ui.controlDe(lado) : '',
      // El ataque de siempre (paga los No2 y tira el PdG); con arreglos, los No2 ya los cobró la habilidad.
      atacar: d => {
        const inv = ui.inv(d.atacante);
        if(!inv) return;
        if(d.ataque.tipo === 'habilidad-arma') publicar(A().tirada(inv, 'Atacar (PdG)', I().statValor(inv, 'pdg') + num(d.ataque && d.ataque.mods && d.ataque.mods.pdg), 'pdg'));
        else atacarSuelto(inv, d.ataque.tipo);
      },
      // Las invocaciones siguen las mismas reglas que los creeps.
      statsCritico: d => {
        const inv = ui.inv(d.atacante);
        const f = I().statValor(inv, 'crit'), p = I().statValor(inv, 'critpot');
        return {frecuente: Number.isNaN(f) ? 0 : Math.max(0, Math.round(f)), potente: Number.isNaN(p) ? 0 : Math.max(0, Math.round(p)),
          ignora: Combatiente.ignoraResistCritArma(Combatiente.armaDeCombatiente(inv)), d20: Math.max(0, Math.round(num(Combatiente.armaDeCombatiente(inv).critD20)))};
      },
      resistenciaCritico: d => {
        const i = [4, 6, 8, 10, 12].indexOf(num(d.ataque.tipoDado));
        if(i < 0) return 0;
        const inv = ui.inv(d.defensor);
        return num((inv.crit || [])[i]);
      },
      efectosArma: d => {
        const inv = ui.inv(d.atacante);
        return (inv.armaEfectos || []).map(e => ({...EfectosGolpe.normalizar(e), stacks: num(e.stacks)}));
      },
      // El daño del arma (sin los efectos del golpe: los resuelve el duelo en su paso de efectos).
      dano: d => {
        const inv = ui.inv(d.atacante);
        if(!inv) return;
        const t = A().dano(inv, d.ataque.tipo === 'habilidad-arma' ? (d.ataque.mods || {}) : null);
        if(t) ui.registrar(t.origen, t.r);
      },
      rerollInfo: () => ({disponible: false}),
      flashOpciones: (d, campo) => {
        const inv = ui.inv(ladoDe(d, campo));
        return (inv.habilidades || []).filter(h => Combatiente.flashPara(h.duelo, campo)).map(h => ({habId: h.id, nombre: h.nombre, bono: num(h.duelo.flash.bono), en: h.duelo.flash.en || [],
          costoTxt: ConfirmarTurno.textoFlash(costoFlash(h)), motivoNo: Combatiente.bloqueoHab(h, {hp: inv.hp}).toLowerCase()}));   // invocación: como un creep (cooldown)
      },
      flashUsar: (d, campo, modo, habId) => {
        const inv = ui.inv(ladoDe(d, campo));
        const hi = (inv.habilidades || []).find(x => x.id === habId);
        if(!hi || !Combatiente.flashPara(hi.duelo, campo)) return null;
        if(!Combatiente.flashPara(hi.duelo, campo, modo)){ ui.toast(`${hi.nombre} no vale para esta tirada (${modo === 'parry' ? 'Parry' : campo})`); return null; }
        return pagarFlash(inv, hi, ui).then(p => p ? {bono: num(hi.duelo.flash.bono), etq: hi.nombre, quien: inv.nombre} : null);
      },
      // Habilidades dirigidas: la tirada de quien la usa (quien = 'atacante') o la de quien se resiste (quien = 'defensor', modo = el stat que eligió).
      habTirar: (d, quien, modo) => {
        const inv = ui.inv(quien === 'atacante' ? d.atacante : d.defensor);
        const c = quien === 'atacante' ? d.hab.tira : (d.hab.contra || []).find(x => x.modo === modo);
        if(!c) return;
        const nombre = quien === 'atacante' ? `${d.hab.nombre} · ${c.etq}` : c.etq;
        // Tirada personalizada: la fórmula ya viene resuelta; acá solo se tira y se anuncia.
        if(c.formula){ const r = tirarDados(c.formula); if(r) ui.registrar(nombre, r); else ui.toast(`No se pudo tirar «${c.etq}»: la fórmula «${c.formula}» no es válida (revisá la habilidad)`); return; }
        if(!c.stat) return;
        publicar(A().tirada(inv, nombre, num(I().statValor(inv, c.stat)) + num(c.bono), c.stat));
      },
      habValor: (d, quien, stat) => {
        const inv = ui.inv(quien === 'atacante' ? d.atacante : d.defensor);
        const v = I().statValor(inv, stat);
        const f = formulaParaValor(num(v));
        return f ? f.formula : fmt(num(v));
      },
      puedeParry: d => !!I().defensa(ui.inv(d.defensor)),   // arma de verdad o escudo (2026-09-30)
      // Cómo puede defenderse (elige a ciegas): Evasión, o Parry con su arma o un escudo (siempre 1 No2).
      opcionesDefensa: d => {
        const inv = ui.inv(d.defensor);
        const fx = (v, statId, estados) => { const f = formulaParaValor(v); if(!f) return fmt(num(v)); const mit = statId ? Combatiente.mitadesDeTirada(estados, statId) : 0; return f.formula + ' ÷2'.repeat(mit); };
        const c = Combatiente.costoParry();
        const ee = evaEsp(inv, d);
        const ops = [{modo: 'evasion', etiqueta: '🏃 Evasión', info: [`Evasión 🎲 ${fx(I().statValor(inv, 'eva') + ee.val, 'eva', inv.estados)}${ee.val ? ` (con ${ee.txt})` : ''}`]}];
        // Parry solo con un arma de verdad o un escudo (regla del dueño, 2026-09-30; un arma natural no alcanza, por ahora).
        const def = I().defensa(inv);
        if(def) ops.push({modo: 'parry', itemId: '', itemNombre: def.nombre, etiqueta: `${def.nombre === inv.armaNombre ? '🗡' : '🛡'} Parry · ${def.nombre}`, costo: c, motivoNo: c > num(inv.nitros) ? 'no le alcanzan los No2' : '',
          info: [`Parry 🎲 ${fx(I().statValor(inv, 'parry'), 'parry', inv.estados)}`, `si ganás, Bloqueo 🎲 ${fx(I().bloqueoValor(inv))}`]});
        return ops;
      },
      defender: (d, modo) => {
        const inv = ui.inv(d.defensor);
        if(!inv) return;
        if(modo === 'parry') tirarStat(inv, 'parry');
        else { const ee = evaEsp(inv, d); publicar(A().tirada(inv, ee.val ? `Evasión (${ee.txt})` : 'Evasión', I().statValor(inv, 'eva') + ee.val, 'eva')); }
      },
      // La Fuerza del golpe del atacante contra el Bloqueo del defensor (Fue + peso de su arma).
      fuerza: d => {
        const inv = ui.inv(d.atacante);
        if(inv) publicar(A().tirada(inv, 'Fuerza del golpe', I().statValor(inv, 'fue') + I().pesoArma(inv), 'fue'));
      },
      // El Bloqueo con lo que hizo Parry (el duelo ya sabe que lo ganó).
      bloquear: d => {
        const inv = ui.inv(d.defensor);
        if(inv) tirarStat(inv, 'bloqueo', {trasParry: true});
      },
      armaContra: d => {
        const inv = ui.inv(d.defensor);
        return {armaId: '', armaNombre: inv.armaNombre || '', tipoDado: num(inv.armaTipo) || 8};
      },
    };
  }

  return {hooks, pagarFlash, costoFlash};
})();
