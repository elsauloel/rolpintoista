/* =========================================================
   COMBATIENTE — el motor de reglas común (paso 1 de docs/plan-consolidacion.md, 2026-09-30)
   Un personaje, una invocación y un creep son lo mismo para las reglas: alguien con stats, estados, No2, HP y escudo.
   Acá viven, UNA sola vez, las reglas que antes estaban copiadas en la ficha, GM Tools, el mapa y comun/estados-aplicar.js.
   Son funciones puras: reciben los datos (la lista de estados, el valor actual…) y devuelven el resultado, sin tocar la
   pantalla ni Firebase. Cada herramienta las llama con lo suyo (S.efectos en la ficha, sc.estados en un creep,
   inv.estados en una invocación). Cada regla que se sume acá suma sus pruebas en comun/pruebas.html.
   Solo usa formulaParaValor (comun/tiradas.js) al tirar; se carga antes que estados-presets.js / estados-aplicar.js.
   ========================================================= */
const Combatiente = (() => {
  const n = v => { const x = Number(v); return Number.isFinite(x) ? x : 0; };
  const activos = estados => (estados || []).filter(e => e && e.activo !== false);

  /* ---------- Tiradas a la mitad (2026-09-24, dueño) ----------
     Pajaritos (PdG y Evasión), Lisiado (PdG y Parry) y Sentado (Evasión) parten la TIRADA a la mitad: se tira el dado
     completo y al resultado se lo divide por 2, para abajo, mínimo 1 — una vez por cada uno. Parálisis (PdG, Parry y
     Evasión) es una sola mitad por stat y no se suma a Lisiado ni a Pajaritos. Devuelve cuántas veces se parte. */
  function mitadesDeTirada(estados, statId){
    const act = activos(estados);
    let m = 0;
    if(['pdg', 'eva'].includes(statId) && act.some(e => e.mitadPdgEva)) m++;
    if(['pdg', 'parry'].includes(statId) && act.some(e => e.lisiado)) m++;
    if(['pdg', 'parry', 'eva'].includes(statId) && m === 0 && act.some(e => e.paralisis)) m++;
    if(statId === 'eva' && act.some(e => e.sentado)) m++;
    return m;
  }
  function aplicarMitades(total, veces){ for(let i = 0; i < veces; i++) total = Math.max(1, Math.floor(total / 2)); return total; }
  // Los estados que parten esa tirada, para mostrarlos ("Pajaritos ÷2"): uno por cada mitad que cuenta mitadesDeTirada
  // (dos estados con la misma marca parten una sola vez, así que se muestra el primero).
  function estadosQueParten(estados, statId){
    const act = activos(estados), out = [];
    const primero = marca => act.find(e => e[marca]);
    if(['pdg', 'eva'].includes(statId) && primero('mitadPdgEva')) out.push(primero('mitadPdgEva'));
    if(['pdg', 'parry'].includes(statId) && primero('lisiado')) out.push(primero('lisiado'));
    if(['pdg', 'parry', 'eva'].includes(statId) && !out.length && primero('paralisis')) out.push(primero('paralisis'));
    if(statId === 'eva' && primero('sentado')) out.push(primero('sentado'));
    return out;
  }

  /* ---------- Tirar un stat (2026-09-30, tanda 2) ----------
     La misma tirada para personaje, invocación y creep: el valor se reparte en dados reales (formulaParaValor, de
     comun/tiradas.js); con Afortunado, PdG/Parry/Evasión se tiran DOS veces y queda la mejor (la otra viaja en `ventaja`
     para que la Mesa la muestre); después se parte a la mitad lo que corresponda y la Evasión nunca baja de 1.
     `o.extra`: un número fijo que se suma antes de partir (ej. la penalidad por sobrepeso de la ficha). `o.azar`: para las
     pruebas (por defecto Math.random). Devuelve lo que se publica en la Mesa ({formula, rolls, mod, total, estados,
     ventaja?}) o null si el valor no se puede tirar con dados reales. No publica nada: eso lo hace cada herramienta. */
  const STATS_AFORTUNADO = ['pdg', 'parry', 'eva'];
  function afortunado(estados, statId){ return STATS_AFORTUNADO.includes(statId) && activos(estados).some(e => e.afortunado); }
  function tirarStat(valor, estados, statId, o){
    o = o || {};
    const f = formulaParaValor(valor);
    if(!f) return null;
    const azar = o.azar || Math.random;
    const tirar = () => { const rolls = f.combo.map(d => 1 + Math.floor(azar() * d)); return {rolls, total: rolls.reduce((a, b) => a + b, 0) + f.mod}; };
    const conVentaja = afortunado(estados, statId);
    let intento = tirar(), ventaja = null;
    if(conVentaja){
      const segundo = tirar();
      const gana = segundo.total > intento.total ? segundo : intento, pierde = gana === intento ? segundo : intento;
      ventaja = {rolls: pierde.rolls, total: pierde.total, elegido: gana.total};
      intento = gana;
    }
    const ex = n(o.extra);
    const mit = statId ? mitadesDeTirada(estados, statId) : 0;
    let total = aplicarMitades(intento.total + ex, mit);
    if(statId === 'eva') total = Math.max(1, total);   // una tirada de Evasión nunca baja de 1 (regla del dueño, 2026-09-28)
    return {formula: f.formula + (ex ? (ex > 0 ? `+${ex}` : `${ex}`) : '') + ' ÷2'.repeat(mit), rolls: intento.rolls, mod: f.mod + ex, total,
      estados: statId ? estadosQueAfectan(estados, statId, conVentaja) : [], ...(ventaja ? {ventaja} : {})};
  }
  // Los estados que cambiaron esa tirada, para pintarlos en la Mesa (verde a favor, rojo en contra): los que le suman o
  // restan al stat, los que la parten a la mitad (los mismos que cuenta la tirada) y Afortunado si se tiró dos veces.
  function estadosQueAfectan(estados, statId, conVentaja){
    const parten = new Set(estadosQueParten(estados, statId)), out = [];
    activos(estados).forEach(e => {
      const p = e.polaridad === 'buff' ? 'buff' : e.polaridad === 'debuff' ? 'debuff' : 'otro';
      if((e.mods || []).some(m => m.stat === statId && n(m.val))) out.push({n: e.nombre, p});
      else if(parten.has(e)) out.push({n: e.nombre, p: 'debuff'});
    });
    if(conVentaja){ const af = activos(estados).find(e => e.afortunado); if(af) out.push({n: af.nombre, p: 'buff'}); }
    return out;
  }
  // El Parry cuesta siempre 1 No2, con cualquier arma o escudo (2026-09-26, dueño). Sin arma ni escudo no se puede (P121).
  function costoParry(){ return 1; }
  /* Parry y Bloqueo: SOLO con un arma o un escudo de verdad (regla del dueño, 2026-09-30, "hasta que diga lo contrario").
     Sin nada no hay opción, y un arma natural (garras, colmillos, puños…) tampoco la da por ahora: sería circunstancial y
     narrativo, se evalúa más adelante. Recibe {arma: {nombre, peso}|null, natural, escudos: [{nombre, peso}]} y devuelve
     con qué se para (el arma si es de verdad, si no el primer escudo) o null. El Bloqueo suma el peso de eso. */
  function armaParaDefensa(o){
    o = o || {};
    if(o.arma && o.arma.nombre && !o.natural) return o.arma;
    return (o.escudos || []).find(e => e && e.nombre) || null;
  }
  const SIN_ARMA_DEFENSA = 'Sin un arma o un escudo no hay Parry ni Bloqueo (un arma natural tampoco, por ahora)';

  /* ---------- Escudo especial y Excedente de vida: cambiar el valor a mano (2026-09-24, dueño) ----------
     El texto puede ser un número (valor nuevo), +N / −N (sumar o restar) o «max N» (cambia el máximo). `max === null` =
     excedente de vida (valor neto, sin tope ni «max N»). Devuelve {max, actual} o null si el texto no se entiende. */
  function escudoParsear(txt, actual, max){
    const t = String(txt || '').trim().replace(',', '.').replace('−', '-');
    if(!t) return null;
    const neto = max === null;
    if(!neto){
      const m = /^max\s*(\d+(?:\.\d+)?)$/i.exec(t);
      if(m){ const nm = Math.max(1, parseFloat(m[1])); return {max: nm, actual: Math.min(actual, nm)}; }
    }
    let v;
    if(/^[+-]\d+(?:\.\d+)?$/.test(t)) v = actual + parseFloat(t);
    else if(/^\d+(?:\.\d+)?$/.test(t)) v = parseFloat(t);
    else return null;
    return {max: neto ? null : max, actual: Math.max(0, neto ? v : Math.min(max, v))};
  }

  /* ---------- Estados que se acumulan ----------
     Devuelven el estado que ya estaba (actualizado) o null si no había uno igual (entonces se agrega el nuevo). */
  // Veneno: suma sus stacks enteros y dura tantos turnos como stacks. Veneno severo (permanente) no se acumula.
  function acumularVeneno(estados, nuevo){
    if(!nuevo || !nuevo.esVeneno) return null;
    const ya = (estados || []).find(e => e.esVeneno && e.nombre === nuevo.nombre);
    if(!ya) return null;
    if(!nuevo.permanente){
      ya.stacks = Math.max(1, n(ya.stacks) || 1) + Math.max(1, n(nuevo.stacks) || 1);
      ya.turnos = ya.stacks;
      ya.activo = true;
    }
    return ya;
  }
  // Sangrado (2026-09-22) y Escarcha (2026-09-25): cada reaplicación suma +1 stack (el daño por turno sube de a 1; la
  // Escarcha además renueva su duración), no una tirada nueva de stacks.
  function acumularSangrado(estados, nuevo){
    const clave = nuevo && nuevo.esSangrado ? 'esSangrado' : nuevo && nuevo.esEscarcha ? 'esEscarcha' : '';
    if(!clave) return null;
    const ya = (estados || []).find(e => e[clave] && e.nombre === nuevo.nombre);
    if(!ya) return null;
    ya.stacks = Math.max(1, n(ya.stacks) || 1) + 1;
    ya.activo = true;
    if(clave === 'esEscarcha') ya.turnos = Math.max(n(ya.turnos), n(nuevo.turnos));
    return ya;
  }

  /* ---------- Un preset con los números que manda la habilidad ----------
     Cuando una habilidad, trampa o zona aplica un estado estándar (Veneno, Sangrado…) con sus propios números, esos números
     mandan sobre los del preset: turnos, bonos, daño/cura por turno, escudo, detalle y, en el Veneno (no el severo), los
     stacks (que son también sus turnos). `base` es la copia del preset (se modifica y se devuelve); `campoHp` es el nombre
     del daño por turno en esa herramienta ('hpTurno' en creeps, 'hpturno' en la ficha). Antes (hasta el 2026-09-30) la
     ficha solo respetaba turnos y escudo: un Veneno ×3 de la Nube tóxica le llegaba ×4 a un personaje. */
  function ajustarPreset(base, spec, campoHp){
    const s = spec || {};
    if(s.turnos !== undefined && s.turnos !== null) base.turnos = n(s.turnos);
    if(Array.isArray(s.mods) && s.mods.length) base.mods = s.mods.map(m => ({stat: m.stat, val: n(m.val)}));
    if(n(s.hp)) base[campoHp || 'hpTurno'] = n(s.hp);
    if(n(s.stacks) && base.esVeneno && !base.permanente){ base.stacks = n(s.stacks); base.turnos = base.stacks; }
    if(n(s.escudoMagico)) base.escudoMagico = n(s.escudoMagico);
    if(s.detalle) base.detalle = s.detalle;
    return base;
  }

  /* ---------- Inmunidades ----------
     ¿Este debuff rebota en quien lo recibe? Devuelve el motivo ('Invulnerable', 'Inmunidad a CC', 'Sangre pura',
     'Coagulación extrema', 'Protección de jefe') o false. `o.jefe`: un creep jefe es inmune a Stun (P95). */
  function inmunidad(estados, est, o){
    if(!est || est.polaridad !== 'debuff') return false;
    if(o && o.jefe && est.nombre === 'Stun') return 'Protección de jefe';
    const act = activos(estados);
    if(act.some(e => e.invulnerable)) return 'Invulnerable';
    if(est.esCC && act.some(e => e.inmunidadCC)) return 'Inmunidad a CC';
    if(est.esVeneno && act.some(e => e.sangrePura)) return 'Sangre pura';
    if(est.esSangrado && act.some(e => e.coagulacionExtrema)) return 'Coagulación extrema';
    return false;
  }

  return {mitadesDeTirada, aplicarMitades, estadosQueParten, tirarStat, afortunado, estadosQueAfectan, costoParry, armaParaDefensa, SIN_ARMA_DEFENSA,
    escudoParsear, acumularVeneno, acumularSangrado, ajustarPreset, inmunidad};
})();
