/* =========================================================
   FICHA-RESUMEN — lo que se publica de un personaje para los demás (paso 4, etapa 3c de docs/plan-paso4-etapa3.md,
   2026-10-01)
   El documento de cada personaje (campanas/<id>/fichas/<id>) lleva un `resumen` público: vida, SP, No2, Defensa, estados,
   invocaciones… — lo que leen los tokens del mapa, el Tablero, la Calculadora de crítico, el historial. Hasta ahora lo armaba
   solo la ficha (fichaResumen, js/12); para que el mapa pueda guardar un personaje (cobrar No2, poner un estado) tiene que
   poder armarlo él también, igual. Copiado tal cual de la ficha, con `S` como parámetro.
   También los estados "derivados" (no se guardan: la regeneración de las pasivas y el Sobrepeso), el costo de moverse y el
   No2 máximo de una invocación, que el resumen usa.
   Necesita ficha-calculo.js, ficha-combate.js, ficha-botonera.js y combatiente.js antes.
   ========================================================= */
const FichaResumen = (() => {
  const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
  function fmt(n){ return Number.isInteger(n) ? n : Math.round(n*100)/100; }
  const IT2 = () => FichaCalculo.IT2;

  /* ---------- Estados derivados (js/04) ---------- */
  function estadosDePasivas(S){
    return (S.pasivas || []).filter(p => num(p.regenHp) > 0).map(p => {
      const hp = num(p.regenHp) * FichaCalculo.pasivaCompras(p);
      return {id: 'pasiva:' + p.id, nombre: p.nombre, polaridad: 'buff', permanente: true, stacks: 1, turnos: 0, hpturno: hp, activo: true, derivado: true,
        detalle: `Viene de tu pasiva "${p.nombre}": recupera ${fmt(hp)} HP en cada Mantenimiento.`};
    });
  }
  // Sobrepeso: estado derivado (no se guarda): aparece solo mientras el equipo pasa la Crg.Max. La penalidad se decide al tirar Evasión.
  function estadoSobrepeso(S){
    const s = FichaCalculo.calcular(S).sobrecarga;
    if(!(s > 0)) return [];
    return [{id: 'sobrepeso', nombre: 'Sobrepeso', polaridad: 'debuff', permanente: true, stacks: 1, turnos: 0, hpturno: 0, activo: true, derivado: true, sobrepeso: s,
      detalle: `Tu equipo pesa ${fmt(s)} de más: al tirar Evasión restás ${fmt(s)}, salvo que pagues 1 No2 para evitarlo.`}];
  }
  const estadosTodos = S => [...(S.efectos || []), ...estadosDePasivas(S), ...estadoSobrepeso(S)];

  /* ---------- Moverse (js/11) ---------- */
  function estadoActivo(S, flag){
    return (S.efectos || []).some(e => e.activo !== false && e[flag]);
  }
  function costoMoverCasillero(S){
    return estadoActivo(S, 'rengo') ? IT2().nitrosMoverRengo : IT2().nitrosMover;
  }

  // Lo que le cuesta moverse un casillero a una invocación: como a un personaje (Rengo, el doble) y, como a un creep, Inmovilizado no se mueve.
  function invCostoMover(inv){
    const act = (inv.estados || []).filter(e => e && e.activo !== false);
    if(act.some(e => e.inmovilizado)) return 0;
    return act.some(e => e.rengo) ? IT2().nitrosMoverRengo : IT2().nitrosMover;
  }

  /* ---------- No2 máximo de una invocación (js/04) ---------- */
  function invFuentesEquipo(inv){
    const arma = (inv.armaMods || []).length ? [{nombre: inv.armaNombre || 'Arma', mods: inv.armaMods}] : [];
    return [...(inv.equipo || []), ...arma];
  }
  function invModTotal(inv, statId){
    let total = 0;
    invFuentesEquipo(inv).forEach(it => (it.mods||[]).forEach(m => { if(m.stat === statId) total += num(m.val); }));
    (inv.estados||[]).forEach(es => {
      if(es.activo === false) return;
      const stacks = Math.max(1, num(es.stacks)||1);
      (es.mods||[]).forEach(m => { if(m.stat === statId) total += num(m.val) * stacks; });
    });
    return total;
  }
  function invNitrosMax(inv){
    // Natural = Agilidad efectiva + bonos a Nitros; los estados los aplica el motor común (comun/combatiente.js).
    return Combatiente.nitrosMax(num(inv.agl) + invModTotal(inv, 'agl') + invModTotal(inv, 'nitros'), inv.estados);
  }

  /* ---------- El resumen (js/12, fichaResumen) ----------
     o: {control: {uid} | null (🎮 si el GM tiene el control), miniaturaInv(imagen) (la miniatura de una invocación; la
     ficha la calcula aparte y devuelve '' mientras tanto)}. */
  function resumen(S, o){
    o = o || {};
    const c = FichaCalculo.calcular(S);
    const n = v => (typeof v === 'number' && !Number.isNaN(v)) ? v : num(v);
    const spMax = n(FichaBotonera.spMaximo(S, c));
    const statParaArma = (statId, arma) => FichaCombate.statParaArma(S, statId, arma);
    const miniaturaInv = o.miniaturaInv || (() => '');
    return {
      nivel: num(S.meta.nivel),
      hp: num(S.hp),
      hpMax: n(c.final.hpmax),
      ini: n(c.final.ini),   // Iniciativa: el mapa la usa para el botón "Tirar iniciativa" de la lista de turnos
      def: n(c.final.def),   // Defensa total: el mapa la resta al daño que se le asigna al token
      armadmg: n(c.final.armadmg),   // Defensa especial (Paso 3 del casteo): el mapa la resta al daño de casteo que ignora la Defensa
      muerto: {activo: !!(S.muerto && S.muerto.activo), turnos: num(S.muerto && S.muerto.turnos), definitivo: !!(S.muerto && S.muerto.definitivo)},   // el mapa tiñe de rojo la pantalla de su jugador y le da el botón Revivir
      esp: n(c.final.esp),   // Especial
      resmg: n(c.final.resmg),   // Res.Esp (2026-09-28): el mapa la usa para tirar sola la resistencia de una zona persistente, sin que la ficha esté abierta
      // Evasión, Fuerza, Res.CC y Res.Mt (2026-10-02): el mapa tira con esto la salvación de una trampa por quien la pisa.
      eva: n(c.final.eva), fue: n(c.final.fue), rescc: n(c.final.rescc), resm: n(c.final.resm),
      percepcion: n(c.final.percepcion),   // Percepción (de Destreza, 2026-09-22): por si el mapa la necesita más adelante
      sigilo: n(c.final.sigilo),   // Sigilo (2026-10-04): el mapa lo tira cuando lo intentan descubrir
      // Resistencias elementales (2026-10-04): el mapa las resta al daño de su elemento.
      resfuego: n(c.final.resfuego), reshielo: n(c.final.reshielo), resrayo: n(c.final.resrayo), restoxico: n(c.final.restoxico), resacido: n(c.final.resacido),
      rng: n(c.final.rng),               // Rango (de Destreza): el visualizador de rango (📏) y el alcance de todo, también de la magia (2026-10-07)
      luz: n(c.final.luz), veoculto: n(c.final.veoculto),   // luz que lleva encima y radio en el que ve lo oculto: el mapa los lee (farol, bengala, yelmo del ojo que todo lo ve)
      vision: n(c.final.vision),
      venenista: n(c.final.venenista),
      guardian: n(c.final.guardian),
      // Escudos de Buena calidad (2026-10-06): el mapa los mira al aplicar el daño (Muro de escudos: ¿hay un aliado con escudo al lado?), al
      // terminar un duelo bloqueado (Empujón) y al recibir daño mágico (el Orbe de absorción).
      conEscudo: (S.inventario || []).some(i => i && i.equipado && Combatiente.esEscudo(i) && !FichaCalculo.itemRoto(i)),
      muroescudos: n(c.final.muroescudos), empujon: n(c.final.empujon),
      orbeAbsorcion: (S.inventario || []).filter(i => i && i.equipado && i.orbe && !FichaCalculo.itemRoto(i)).reduce((a, i) => Math.max(a, num(i.orbeAbsorcion)), 0),
      levitar: n(c.final.levitar), suelagruesa: n(c.final.suelagruesa), embestida: n(c.final.embestida), pasodoble: n(c.final.pasodoble),   // piernas (2026-10-06)
      emergencia: n(c.final.emergencia), emergenciaUsada: !!S.emergenciaUsada,
      ...Object.fromEntries(['cascara', 'primerasangre', 'foco', 'pulso', 'pasofantasma', 'cambiante', 'absorbearmadura', 'impulsofue', 'impulsodes', 'impulsoesp', 'impulsocon']
        .map(k => [k, n(c.final[k])]).filter(([, v]) => v)),   // anillos Comunes (2026-10-06): el mapa los mira (js/13, js/25)
      anillosDados: !!S.anillosDados, absorbeUsada: !!S.absorbeUsada,   // Bolsillo de emergencia (cinturón, 2026-10-06): el mapa lo mira   // pies (2026-10-06): el mapa los mira al moverse y al aplicar daño del piso   // Coraza del guardián (2026-10-06): el mapa se la suma a la Defensa de los aliados al lado
      defprimer: n(c.final.defprimer), defdist: n(c.final.defdist),   // torso blando (2026-10-06): el mapa los suma a la Defensa al aplicar el daño   // Guantes del envenenador (2026-10-05): el mapa le suma esos stacks a los venenos que pone en el duelo
      pasosGratis: n(c.final.pasosgratis),
      retirada: n(c.final.retirada),   // Retirada limpia (%): el mapa la tira al alejarse de un rival (js/17)
      // Los pies (2026-10-04): el mapa las tira (js/08, js/19, js/21); Pasos de baile la lee el duelo.
      pisadaAtenta: n(c.final.pisadaatenta) > 0, inamovible: n(c.final.inamovible), recuperarse: n(c.final.recuperarse), reflejos: n(c.final.reflejos),   // los primeros casilleros de cada turno, gratis (el mapa los descuenta del costo de moverse)   // Campo de visión (base 6 + ítems, pasivas y estados): el mapa lo suma a la luz de la escena para el radio de cada token
      // Crítico (2026-09-25): el mapa arma con esto la Calculadora de crítico sin que haya que escribirlo (equipo, habilidades y estados ya sumados).
      // Crítico frecuente y potente DE ESA ARMA (la misma de armaTipo): lo de la otra arma equipada no cuenta.
      ...(() => { const a = (S.inventario || []).find(i => i.equipado && /^arma/.test(i.tipoItem || '') && [4, 6, 8, 10, 12].includes(num(i.tipoDado))); return {crit: n(statParaArma('crit', a || null)), critpot: n(statParaArma('critpot', a || null))}; })(),
      armaTipo: (() => { const a = (S.inventario || []).find(i => i.equipado && /^arma/.test(i.tipoItem || '') && [4, 6, 8, 10, 12].includes(num(i.tipoDado))); return a ? num(a.tipoDado) : 0; })(),   // Tipo de su arma equipada
      rescrit: ['tipo1', 'tipo2', 'tipo3', 'tipo4', 'tipo5'].map(k => n(c.final[k])),   // Resistencia a crítico contra armas de Tipo 4, 6, 8, 10 y 12
      percepcionAumentada: FichaBotonera.tienePercepcionAumentada(S),   // el mapa le avisa de las trampas ocultas cercanas
      sp: spMax - num(S.spGastado),
      spMax,
      // Para mover el token desde el mapa: Nitros que quedan y cuánto cuesta
      // cada casillero (0 = no se puede mover, ej. Inmovilizado).
      nitros: S.nitros === null || S.nitros === undefined ? n(c.final.nitros) : num(S.nitros),
      nitrosMax: n(c.final.nitros),
      // Lo menos que le cuesta un ataque de oportunidad con alguna de sus manos (2026-10-02): el mapa frena a un rival que se aleja solo si
      // nitros ≥ esto. Sin armas con daño, a mano limpia.
      oporCosto: (() => { const armas = FichaCombate.armasEquipadasConDano(S).map(x => x.item); return Math.min(...(armas.length ? armas : [null]).map(a => FichaCombate.costoAtaqueEspecial(a, 'oportunidad', S))); })(),
      costoMover: IT2().inmovilizadoBloqueaMover && estadoActivo(S, 'inmovilizado') ? 0 : costoMoverCasillero(S),
      muerto: !!(S.muerto && S.muerto.activo),
      muertoDef: !!(S.muerto && S.muerto.definitivo),   // muerto de verdad (el GM lo usa al repartir la experiencia)
      // 🎮 Si el GM tiene el control, su uid: el mapa le deja usar este token como si fuera suyo (Botonera, moverlo pagando No2).
      ...(o.control && o.control.uid ? {control: o.control.uid} : {}),
      estados: estadosTodos(S)
        .filter(e => e && e.activo !== false && e.nombre)
        .slice(0, 30)
        .map(e => ({
          nombre: String(e.nombre).slice(0, 60),
          turnos: num(e.turnos),
          permanente: !!e.permanente, ...(e.invulnerable ? {invulnerable: true} : {}),
          ...((e.escudoMagicoActual !== undefined || num(e.escudoMagico) > 0) ? {escudo: num(e.escudoMagicoActual ?? e.escudoMagico), ...(e.excedenteVida ? {excedente: true, ...(e.excedenteTope ? {tope: num(e.excedenteTope)} : {})} : {escudoMax: num(e.escudoMagico)})} : {}), ...(e.armaduraRota ? {armaduraRota: true, stacks: Math.max(1, num(e.stacks) || 1)} : {}),
          ...(e.derivado ? {derivado: true} : {}), ...(e.confusion ? {confusion: true} : {}), ...(e.anillo ? {anillo: true} : {}), ...(e.impulso ? {impulso: e.impulso, impulsoVal: num(e.impulsoVal)} : {}),   // la Confusión: el mapa la tira (js/20)
          ...(e.espinas ? {espinas: true} : {}), ...(e.espejo ? {espejo: true} : {}),   // el mapa devuelve el daño aunque el estado tenga un nombre propio («Espinas (poción)»)
          ...(e.lento ? {lento: true} : {}),   // Lento: el primer casillero del turno cuesta el doble (el mapa, js/04)
          polaridad: e.polaridad === 'buff' || e.polaridad === 'debuff' ? e.polaridad : '',
          // Para el globito del mapa al pasar el mouse por el estado.
          detalle: String(e.detalle || '').slice(0, 300),
        })),
      invocaciones: (S.invocaciones || [])
        .filter(inv => inv && inv.id)
        .slice(0, 20)
        .map(inv => ({
          id: String(inv.id),
          nombre: String(inv.nombre || 'Invocación').slice(0, 60),
          hp: num(inv.hp),
          hpMax: num(inv.hpMax),
          // Nitros y estados, para que el token en el mapa muestre lo mismo
          // que un PJ o un creep (barra de No2, estados con su detalle).
          nitros: num(inv.nitros),
          nitrosMax: invNitrosMax(inv),
          oporCosto: Math.max(0, Combatiente.costoEspecial(num(inv.armaTipo) || 8, Combatiente.armaDeCombatiente(inv), 'oportunidad') - Combatiente.ahorroEspecial('oportunidad', st => invModTotal(inv, st))),   // ataque de oportunidad (2026-10-02)
          // Las reglas del mapa, iguales para todos (dueño, 2026-10-04): moverse cuesta No2 (Rengo el doble, Inmovilizado no se mueve), los Pasos
          // gratis, las chances de las piezas (Retirada limpia, Inamovible, Recuperarse rápido, Reflejos de mangosta) y Pisada atenta con su Percepción.
          costoMover: invCostoMover(inv), pasosGratis: num(invModTotal(inv, 'pasosgratis')), retirada: num(invModTotal(inv, 'retirada')),
          inamovible: num(invModTotal(inv, 'inamovible')), recuperarse: num(invModTotal(inv, 'recuperarse')), reflejos: num(invModTotal(inv, 'reflejos')),
          venenista: num(invModTotal(inv, 'venenista')),   // Guantes del envenenador (2026-10-05)
          guardian: num(invModTotal(inv, 'guardian')),
          conEscudo: (inv.equipo || []).some(i => Combatiente.esEscudo(i)), muroescudos: num(invModTotal(inv, 'muroescudos')), empujon: num(invModTotal(inv, 'empujon')),   // escudos (2026-10-06)
          levitar: num(invModTotal(inv, 'levitar')), suelagruesa: num(invModTotal(inv, 'suelagruesa')), embestida: num(invModTotal(inv, 'embestida')), pasodoble: num(invModTotal(inv, 'pasodoble')),   // Coraza del guardián (2026-10-06)
          pisadaAtenta: num(invModTotal(inv, 'pisadaatenta')) > 0, ...(typeof InvCalculo !== 'undefined' ? {percepcion: num(InvCalculo.statValor(inv, 'percepcion'))} : {}),
          activa: inv.activa !== false,
          miniatura: miniaturaInv(inv.imagen),
          estados: (inv.estados || [])
            .filter(e => e && e.activo !== false && e.nombre)
            .slice(0, 30)
            .map(e => ({
              nombre: String(e.nombre).slice(0, 60),
              turnos: num(e.turnos),
              permanente: !!e.permanente, ...(e.invulnerable ? {invulnerable: true} : {}),
              ...((e.escudoMagicoActual !== undefined || num(e.escudoMagico) > 0) ? {escudo: num(e.escudoMagicoActual ?? e.escudoMagico), ...(e.excedenteVida ? {excedente: true, ...(e.excedenteTope ? {tope: num(e.excedenteTope)} : {})} : {escudoMax: num(e.escudoMagico)})} : {}), ...(e.armaduraRota ? {armaduraRota: true, stacks: Math.max(1, num(e.stacks) || 1)} : {}),
              polaridad: e.polaridad === 'buff' || e.polaridad === 'debuff' ? e.polaridad : '', ...(e.confusion ? {confusion: true} : {}), ...(e.lento ? {lento: true} : {}),
              detalle: String(e.detalle || '').slice(0, 300),
            })),
        })),
    };
  }

  return {estadosDePasivas, estadoSobrepeso, estadosTodos, estadoActivo, costoMoverCasillero, invCostoMover, invFuentesEquipo, invModTotal, invNitrosMax, resumen};
})();
