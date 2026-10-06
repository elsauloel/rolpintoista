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
    if(!f){
      // Un stat en 0 o en negativo (2026-10-06: dos debuffs dejaron una Evasión en −5 y el duelo quedaba trabado): no hay dados que tirar; el
      // resultado es el valor, y la Evasión nunca baja de 1. Antes devolvía null («no se puede tirar») y la tirada no salía.
      const v = Math.round(n(valor));
      if(!Number.isFinite(Number(valor)) || v > 0) return null;
      const ex0 = n(o.extra), tot = v + ex0;
      return {formula: `${v}${ex0 ? (ex0 > 0 ? `+${ex0}` : `${ex0}`) : ''} (sin dados)`, rolls: [], mod: tot, total: statId === 'eva' ? Math.max(1, tot) : tot,
        estados: statId ? estadosQueAfectan(estados, statId, false) : []};
    }
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
  /* ---------- Pase de turno de los estados (paso 2, 2026-09-30) ----------
     Lo que le hacen los estados a quien los tiene en cada Mantenimiento — igual para personaje, invocación y creep:
       · Escudo especial: se recarga entero (el Excedente de vida no: es un valor neto).
       · Daño o cura por turno × stacks. El daño no hace efecto con Invulnerable, ni el de Veneno con Sangre pura, ni el de
         Sangrado con Coagulación extrema.
       · Stacks por turno (suben o bajan); en 0 stacks, el estado se termina.
       · Turnos: se descuenta 1; en 0 se termina. Uno que no es permanente y no tiene turnos (dato a medio cargar) hace su
         efecto este turno y se va (dueño, 2026-09-30; antes el personaje lo dejaba para siempre y el creep lo borraba).
     Los estados pausados (activo === false) no hacen nada ni vencen. Modifica los estados y devuelve {hp, quedan,
     terminados, eventos}: `hp` es cuánto cambia la vida (lo aplica cada herramienta, con su tope y su muerte), `quedan` la
     lista sin los que se terminaron. `campos` = nombres del daño por turno y de los stacks por turno en esa herramienta
     ({hp:'hpturno', stacks:'stacksturno'} en la ficha; {hp:'hpTurno', stacks:'stacksTurno'} en los creeps). */
  /* El TURNO PROPIO (2026-10-06, dueño, P161 — «turno completo»): con el orden de turnos del mapa, cada uno tiene su propio reloj.
     · AL EMPEZAR su turno: recarga No2 y SP, bajan sus cooldowns y se DISPARA lo que se dispara (veneno, sangrado, regeneración, el escudo
       que se recarga) — `dispararEstados`.
     · AL TERMINAR su turno: baja el contador de sus estados (turnos y stacks) — `contarEstados`.
     · Lo que se dispara pega también APENAS TE LO PONEN (`dispararAlAplicar`, dueño: «aunque te apliquen un antídoto, por lo menos una vez va
       a haber tenido efecto»); cada estado se dispara una vez por vuelta (`disparado`, que se apaga al contar): uno de N turnos pega N veces.
     · El contador baja al terminar el turno del afectado aunque se lo hayan puesto en ese mismo turno (dueño: «una regla clara, limpia y
       homogénea»; las trampas se diseñan con eso en cuenta — P162).
     El ⟳ Mantenimiento de la ronda sigue para fuera de combate y para quien no está en el orden de turnos (y el mapa lo pasa solo al cambiar de
     ronda, por lo que es de la ronda): `estadosEnMantenimiento(turnoEn, numero)` → false si tuvo un turno propio durante el Mantenimiento
     anterior (`turnoEn` = el número de Mantenimiento de ese turno): su turno ya lo atiende todo. Sin orden de turnos, `pasarTurnoEstados`
     hace las dos cosas juntas, como siempre (si ya se disparó al aplicarse, solo cuenta). */
  const estadosEnMantenimiento = (turnoEn, turno) => turnoEn === undefined || turnoEn === null || n(turnoEn) < n(turno) - 1;
  // La marca del turno en curso que lleva cada estado nuevo (la pone el mapa: «mapa:paso»; sin orden de turnos, nada). Hoy solo informa.
  let marcaTurno = null;
  function fijarMarcaTurno(fn){ marcaTurno = typeof fn === 'function' ? fn : null; }
  function dispararEstados(estados, campos){
    const lista = estados || [], c = campos || {hp: 'hpTurno', stacks: 'stacksTurno'};
    const resFuego = Math.max(0, n(c.resFuego));   // la Quemadura (2026-10-04): la Res. fuego le resta a cada turno
    const act = activos(c.todos || lista);   // las inmunidades miran todos sus estados (al aplicarse, se dispara uno solo)
    const invulnerable = act.some(e => e.invulnerable), sangrePura = act.some(e => e.sangrePura), coagulacion = act.some(e => e.coagulacionExtrema);
    const eventos = [];
    let hp = 0;
    lista.forEach(e => {
      if(!e || e.activo === false || e.disparado) return;
      e.disparado = true;
      if(n(e.escudoMagico) > 0 && !e.excedenteVida){
        const antes = n(e.escudoMagicoActual ?? e.escudoMagico);
        if(antes < n(e.escudoMagico)) eventos.push({tipo: 'escudo', nombre: e.nombre, de: antes, a: n(e.escudoMagico)});
        e.escudoMagicoActual = n(e.escudoMagico);
      }
      const stacks = Math.max(1, n(e.stacks) || 1);
      let d = n(e[c.hp]) * stacks;
      if(d < 0 && e.esQuemadura && resFuego){ const antes = d; d = Math.min(0, d + resFuego); eventos.push({tipo: 'resfuego', nombre: e.nombre, de: -antes, a: -d, res: resFuego}); }
      if(d < 0 && (invulnerable || (e.esVeneno && sangrePura) || (e.esSangrado && coagulacion))){ eventos.push({tipo: 'inmune', nombre: e.nombre}); d = 0; }
      if(d){ hp += d; eventos.push({tipo: 'hp', nombre: e.nombre, hp: d, stacks}); }
    });
    return {hp, eventos};
  }
  function contarEstados(estados, campos){
    const lista = estados || [], c = campos || {hp: 'hpTurno', stacks: 'stacksTurno'};
    const eventos = [], fin = new Set();
    lista.forEach(e => {
      if(!e || e.activo === false) return;
      e.disparado = false;   // en la vuelta que viene se vuelve a disparar
      const hayStacks = e.stacks !== undefined && e.stacks !== null && e.stacks !== '';
      const stacks = Math.max(1, n(e.stacks) || 1);
      const ds = n(e[c.stacks]);
      if(ds){
        e.stacks = Math.max(0, stacks + ds);
        eventos.push({tipo: 'stacks', nombre: e.nombre, de: stacks, a: e.stacks});
        if(e.stacks === 0){ fin.add(e); eventos.push({tipo: 'fin', nombre: e.nombre}); }
      }else if(hayStacks && n(e.stacks) === 0 && !fin.has(e)){ fin.add(e); eventos.push({tipo: 'fin', nombre: e.nombre}); }
      if(!e.permanente){
        const antes = n(e.turnos);
        if(antes > 0){
          e.turnos = antes - 1;
          if(e.turnos === 0){ if(!fin.has(e)){ fin.add(e); eventos.push({tipo: 'vence', nombre: e.nombre, de: antes}); } }
          else eventos.push({tipo: 'turnos', nombre: e.nombre, de: antes, a: e.turnos});
        }else if(!fin.has(e)){ fin.add(e); eventos.push({tipo: 'fin', nombre: e.nombre}); }
      }
    });
    return {quedan: lista.filter(e => !fin.has(e)), terminados: lista.filter(e => fin.has(e)), eventos};
  }
  // El pase de turno de siempre (⟳ Mantenimiento, sin orden de turnos): dispara (lo que no se disparó al aplicarse) y cuenta.
  function pasarTurnoEstados(estados, campos){
    const d = dispararEstados(estados, campos), k = contarEstados(estados, campos);
    return {hp: d.hp, quedan: k.quedan, terminados: k.terminados, eventos: [...d.eventos, ...k.eventos]};
  }
  // Recién puesto (r = lo que devolvió agregarEstado): si es nuevo o se renovó, se dispara ya. → {hp, eventos}; la vida la aplica quien lo puso.
  function dispararAlAplicar(r, estados, campos){
    if(!r || !r.ok || !r.estado || (r.que !== 'nuevo' && r.que !== 'renovado')) return {hp: 0, eventos: []};
    return dispararEstados([r.estado], {...(campos || {}), todos: estados});
  }
  // El reporte en texto llano (Mesa del personaje, 📜 Historial del GM), un renglón por cosa que pasó.
  const fmtN = x => Number.isInteger(x) ? String(x) : String(Math.round(x * 100) / 100);
  function reporteTurno(eventos){
    return (eventos || []).map(ev => {
      if(ev.tipo === 'escudo') return `${ev.nombre}: escudo especial ${fmtN(ev.de)} → ${fmtN(ev.a)}`;
      if(ev.tipo === 'inmune') return `${ev.nombre}: no le hizo efecto (inmunidad)`;
      if(ev.tipo === 'resfuego') return `${ev.nombre}: Res. fuego ${fmtN(ev.res)} le saca ${fmtN(ev.de - ev.a)} (de ${fmtN(ev.de)} a ${fmtN(ev.a)})`;
      if(ev.tipo === 'hp') return `${ev.nombre}: ${ev.hp > 0 ? '+' : '−'}${fmtN(Math.abs(ev.hp))} HP${ev.stacks > 1 ? ` (${fmtN(ev.stacks)} stacks)` : ''}`;
      if(ev.tipo === 'stacks') return `${ev.nombre}: stacks ${fmtN(ev.de)} → ${fmtN(ev.a)}`;
      if(ev.tipo === 'turnos') return `${ev.nombre}: ${fmtN(ev.de)} → ${fmtN(ev.a)} turno${ev.a === 1 ? '' : 's'}`;
      if(ev.tipo === 'vence') return `${ev.nombre}: ${fmtN(ev.de)} → 0 turnos, se terminó`;
      if(ev.tipo === 'fin') return `${ev.nombre}: se terminó`;
      return '';
    }).filter(Boolean);
  }

  /* ---------- Máximo de No2 con los estados (tanda 3, 2026-09-30) ----------
     `natural` = Agilidad efectiva + bonos a Nitros (cada herramienta lo arma con lo suyo). Cansado lo deja en 2/3 del natural
     (para abajo); Hypeado suma un tercio del natural (para arriba); "Forzar Nitros máx." (Stun = 0, estados propios) y
     Exhausto (un tercio del natural, para abajo) son TOPES: gana el más bajo y nunca suben el máximo (dueño, 2026-09-30: hasta
     entonces el personaje lo tomaba como "fijar", y un forzado más alto que su máximo se lo subía). Mínimo 0. Antes había
     tres copias (ficha, invocaciones, creeps). */
  function nitrosMax(natural, estados){
    if(!Number.isFinite(Number(natural))) return natural;   // la ficha usa NaN para "no se puede calcular"
    const act = activos(estados), nat = n(natural);
    let v = nat;
    if(act.some(e => e.cansado)) v = Math.floor(nat * 2 / 3);
    if(act.some(e => e.hypeado)) v += Math.ceil(nat / 3);
    const topes = act.filter(e => e.forzarNitros !== '' && e.forzarNitros !== null && e.forzarNitros !== undefined).map(e => n(e.forzarNitros));
    if(act.some(e => e.exhausto)) topes.push(Math.floor(nat / 3));
    if(topes.length) v = Math.min(v, ...topes);
    return Math.max(0, v);
  }

  /* ---------- Costo de atacar (tanda 3, 2026-09-30) ----------
     El primer ataque del turno con un arma cuesta Tipo ÷ 2 (para arriba) en No2; los siguientes, el Tipo completo. El ataque
     de oportunidad y el contraataque cuestan siempre lo de un primer ataque y no suman al conteo. Antes estaba en la ficha, las
     invocaciones, los creeps y el asistente de ítems, cada uno con su copia. */
  function costoPrimerAtaque(tipo){ return Math.ceil(n(tipo) / 2); }
  /* Ataque de oportunidad y contraataque (regla universal, dueño 2026-10-03): cuestan lo de un primer ataque (costoPrimerAtaque), no cuentan
     como ataque del turno y suman su PdG especial — «PdG en oportunidad» / «PdG en contraataque» — venga de donde venga (arma, equipo,
     pasivas, estados), igual para personajes, creeps e invocaciones. `statAtaqueEspecial(tipo)` → el stat ('' si es un ataque normal). */
  const ATAQUE_ESPECIAL = {oportunidad: {stat: 'pdgopor', nombre: 'Ataque de oportunidad'}, contra: {stat: 'pdgcontra', nombre: 'Contraataque'}};
  const statAtaqueEspecial = tipo => (ATAQUE_ESPECIAL[tipo] || {}).stat || '';
  /* Evasión contra oportunidad / contra contraataque (dueño, 2026-10-04, mecánicas de las piernas): suman a la Evasión del defensor solo
     contra ese tipo de ataque (no al Parry). Peso de diseño: Evasión +1 ≈ contra oportunidad +2 ≈ contra contraataque +3.
     `statEvaEspecial(tipo)` → el stat ('' si es un ataque normal). */
  const EVA_ESPECIAL = {oportunidad: {stat: 'evaopor', nombre: 'contra oportunidad'}, contra: {stat: 'evacontra', nombre: 'contra contraataque'}};
  const statEvaEspecial = tipo => (EVA_ESPECIAL[tipo] || {}).stat || '';
  /* Lo que se suma a la Evasión del defensor en un duelo (2026-10-04): la Evasión contra oportunidad / contraataque según el ataque, y Pasos de
     baile si ya se movió en el turno (lo sabe el mapa: window.mapaSeMovio(tokenId); fuera del mapa no cuenta). `valorDe(statId)` → el valor de
     ese stat en quien se defiende. → {val, txt} («+2 contra oportunidad · +1 Pasos de baile»). */
  function evaExtraDuelo(d, valorDe){
    const partes = [];
    let val = 0;
    const tipo = d && d.ataque && d.ataque.tipo, st = statEvaEspecial(tipo);
    const fmtN = v => `${v > 0 ? '+' : '−'}${Math.abs(v)}`;
    if(st){ const v = n(valorDe(st)); if(v){ val += v; partes.push(`${fmtN(v)} ${EVA_ESPECIAL[tipo].nombre}`); } }
    const tokenId = d && d.defensor && d.defensor.tokenId;
    const movio = !!tokenId && typeof window !== 'undefined' && typeof window.mapaSeMovio === 'function' && window.mapaSeMovio(tokenId);
    if(movio){ const v = n(valorDe('pasosbaile')); if(v){ val += v; partes.push(`${fmtN(v)} Pasos de baile`); } }
    return {val, txt: partes.join(' · ')};
  }
  /* Las mecánicas «con chance» de las piezas (dueño, 2026-10-04): Retirada limpia, Inamovible, Recuperarse rápido, Reflejos de mangosta. El stat
     va en %, tope 100 (100 = siempre, sin tirar). Se tira 1d6: 33 % = 5–6, 50 % = 4–6. `chanceDado(pct)` → {caras, exitos} o null (siempre /
     nunca); `chanceTexto(pct)` → «33 % (5–6 en d6)» o «siempre». (`retirada*`: los mismos, con el nombre con el que nacieron.) */
  const chancePct = v => Math.max(0, Math.min(100, Math.round(n(v))));
  function chanceDado(v){
    const pct = chancePct(v);
    if(pct <= 0 || pct >= 100) return null;
    return {caras: 6, exitos: Math.min(5, Math.max(1, Math.round(pct * 6 / 100)))};
  }
  function chanceTexto(v){
    const pct = chancePct(v), d = chanceDado(pct);
    if(pct >= 100) return 'siempre';
    if(!d) return '';
    return `${pct} % (${d.exitos > 1 ? (d.caras - d.exitos + 1) + '–' : ''}${d.caras} en d${d.caras})`;
  }
  const retiradaPct = chancePct, retiradaDado = chanceDado, retiradaTexto = chanceTexto;
  /* Las ranuras del cinturón (dueño, 2026-10-04/05): 1 ranura = 1 unidad; el Portapergaminos es una ranura aparte donde entran
     `portapergaminos` pergaminos (3 = entran 3; dueño, 2026-10-05: reemplaza a «agruparlos de a N por ranura»); las ranuras exclusivas (pociones, pergaminos, trampas, Ankh) se llenan primero con lo suyo. Igual para personajes y
     creeps. `ranurasCinturon(items, o)` → las ranuras COMUNES que ocupan; `entranEnCinturon(items, it, cuantas, cap, o)` → cuántas unidades de
     `it` entran todavía. o = {portapergaminos, excl: {pocion, pergamino, trampa, ankh}}. */
  function categoriaConsumible(it){
    const nom = String((it && it.nombre) || '').toLowerCase();
    if(it && it.trampaDatos) return 'trampa';
    if(/ankh/.test(nom)) return 'ankh';
    if(/pergamino/.test(nom)) return 'pergamino';
    if(/poci[oó]n|elixir|t[oó]nico|brebaje|ung[uü]ento|filtro/.test(nom) || n(it && it.curahp) > 0) return 'pocion';
    return 'otro';
  }
  function ranurasCinturon(items, o){
    o = o || {};
    const por = {};
    (items || []).forEach(it => {
      if(!it) return;
      const c = categoriaConsumible(it), u = it.consumible ? Math.max(0, n(it.unidades)) : 1;
      por[c] = (por[c] || 0) + u;
    });
    if(por.pergamino) por.pergamino = Math.max(0, por.pergamino - Math.max(0, Math.round(n(o.portapergaminos))));   // los que van en el Portapergaminos
    const excl = o.excl || {};
    return Object.entries(por).reduce((a, [c, slots]) => a + Math.max(0, slots - Math.max(0, n(excl[c]))), 0);
  }
  function entranEnCinturon(items, it, cuantas, cap, o){
    let k = 0;
    while(k < cuantas && ranurasCinturon([...(items || []), {...it, consumible: true, unidades: k + 1}], o) <= cap) k++;
    return k;
  }
  /* Los estados que traban el movimiento (Recuperarse rápido, dueño 2026-10-04): duran 1 turno menos con la chance de los pies. */
  const ESTADOS_TRABA = ['Inmovilizado', 'Rengo', 'Sentado', 'Lento'];
  const esTraba = e => !!e && (e.inmovilizado || e.rengo || e.sentado || e.lento || ESTADOS_TRABA.includes(String(e.nombre || '').trim()));
  /* Soltarse (2026-10-03, trampas de Atrapar; pedido del dueño: «que el botón diga exactamente qué tira y cuánto cuesta»): un estado puede
     traer `soltar: {stat, etq, dif, no2}` (lo pone la trampa que lo dejó). Igual para personajes, invocaciones y creeps: se paga lo que diga
     (se suelte o no), se tira el stat contra la dificultad y, si llega, se saca el estado. */
  const SOLTAR_ETQ = {fue: 'Fuerza', agl: 'Agilidad', des: 'Destreza', con: 'Constitución'};
  function soltarNorm(s){
    if(!s || !s.stat || !(Number(s.dif) >= 1)) return null;
    const hunde = Math.max(0, Math.min(5, Math.round(Number(s.hunde) || 0)));   // arena movediza (dueño, 2026-10-04): si falla, se hunde más (+N turnos)
    return {stat: String(s.stat), etq: String(s.etq || SOLTAR_ETQ[s.stat] || s.stat).slice(0, 20), dif: Math.round(Number(s.dif)), no2: Math.max(0, Math.round(Number(s.no2) || 0)), ...(hunde ? {hunde} : {})};
  }
  const estadoSoltable = estados => (estados || []).find(e => e && e.activo !== false && soltarNorm(e.soltar)) || null;
  const textoSoltarse = e => { const s = soltarNorm(e && e.soltar); return s ? `🔓 Soltarse · ${s.etq} contra ${s.dif} · ${s.no2} No2${s.hunde ? ` · si falla, se hunde: +${s.hunde} turno${s.hunde === 1 ? '' : 's'}` : ''}` : ''; };
  // «Si te resistís, te hundís más rápido» (los dibujitos de los 80 y 90): un intento fallido le suma turnos al estado. → true si se hundió.
  function hundirSiFalla(est, t){
    if(!est || !t || t.ok || !t.s || !t.s.hunde) return false;
    est.turnos = Math.max(0, Math.round(Number(est.turnos) || 0)) + t.s.hunde;
    return true;
  }
  // La tirada (no cobra ni saca nada: eso lo hace cada uno). valor = el stat de quien se suelta. → {s, r, ok}
  function tiradaSoltarse(e, valor, estados, azar){
    const s = soltarNorm(e && e.soltar);
    if(!s) return null;
    const r = tirarStat(valor, estados, s.stat, azar ? {azar} : undefined);
    return {s, r, ok: !!r && r.total >= s.dif};
  }
  // Sentado no puede atacar (regla del dueño, 2026-10-03: igual para personajes, invocaciones y creeps, y para cualquier ataque): se avisa y
  // se deja seguir. Se pregunta al pagar el ataque. → el texto de la pregunta, o '' si no está Sentado. Sin nombre, en segunda persona.
  // Silencio (2026-10-04): una habilidad que cuesta SP (un número o «X») no se puede usar; se avisa y se deja seguir. → la pregunta, o ''.
  const cuestaSp = h => !!h && (String(h.costo || '').trim().toUpperCase() === 'X' || n(h.costo) > 0);
  const preguntaSilencio = (estados, h, nombre) => !(estados || []).some(e => e && e.activo !== false && e.silencio) || !cuestaSp(h) ? ''
    : `${nombre ? nombre + ' está' : 'Estás'} en Silencio: no ${nombre ? 'puede' : 'podés'} usar habilidades que cuestan SP. ¿Usar ${(h && h.nombre) || 'la habilidad'} igual?`;
  const preguntaSentado = (estados, nombre) => !(estados || []).some(e => e && e.activo !== false && e.sentado) ? ''
    : nombre ? `${nombre} está Sentado y no puede atacar. ¿Atacar igual?` : 'Estás Sentado: no podés atacar. ¿Atacar igual?';
  /* «Ignora N de Resistencia a crítico» de un arma (2026-10-03, pedido del dueño): el campo `ignoraResistCrit` del arma (también el viejo
     efecto al golpear «Ignora N de Res. crítico», que no se aplicaba solo). El duelo se lo resta a la Resistencia del defensor antes de
     calcular el crítico (lo pide al atacante con statsCritico). `arma` = {ignoraResistCrit, efectosGolpe} (un creep o una invocación: sus
     campos armaIgnoraResistCrit / armaEfectos). */
  /* Rasgos de un arma (2026-10-03, mecánicas de firma): lo que el arma cambia en CÓMO se ataca —no el daño ni los efectos al golpear—.
     espalda {pdg, fijo, critpot} · ignoraResistCrit N · sinParry (no se puede parrear) · oporGratis (el ataque de oportunidad no cuesta No2) ·
     ahorroNitros N (el primer ataque del turno con ella cuesta N menos) · critD20 N (N d20 más al tirar el crítico). Un ítem los lleva sueltos; un
     creep o una invocación, en `armaRasgos` (los campos viejos armaEspalda / armaIgnoraResistCrit también cuentan). */
  const RASGOS_ARMA = ['espalda', 'ignoraResistCrit', 'sinParry', 'oporGratis', 'ahorroNitros', 'critD20'];
  function rasgosDeItem(it){
    const o = {};
    if(!it) return o;
    RASGOS_ARMA.forEach(k => { const v = it[k]; if(v && (typeof v !== 'object' || Object.keys(v).length)) o[k] = typeof v === 'object' ? structuredClone(v) : v; });
    return o;
  }
  // El arma de un creep o de una invocación (sus campos arma*), en la forma de un ítem: Tipo, efectos al golpear y rasgos.
  function armaDeCombatiente(x){
    if(!x) return null;
    const r = {...(x.armaRasgos || {})};
    if(x.armaEspalda && !r.espalda) r.espalda = x.armaEspalda;
    if(n(x.armaIgnoraResistCrit) && !r.ignoraResistCrit) r.ignoraResistCrit = n(x.armaIgnoraResistCrit);
    return {nombre: x.armaNombre || '', tipoDado: n(x.armaTipo) || 8, efectosGolpe: x.armaEfectos || [], ...r};
  }
  // Lo que el ataque lleva al duelo por su arma: el bono por la espalda y «no se puede parrear».
  function ataqueDeArma(arma){
    const o = {};
    if(arma && arma.espalda) o.espalda = arma.espalda;
    if(arma && arma.sinParry) o.sinParry = true;
    return o;
  }
  // Costos con los rasgos: el primer ataque del turno con el arma (ahorroNitros) y el ataque de oportunidad (oporGratis).
  const costoConAhorro = (costo, arma, previos) => Math.max(0, costo - (n(previos) === 0 ? n(arma && arma.ahorroNitros) : 0));
  const costoEspecial = (tipoDado, arma, tipo) => tipo === 'oportunidad' && arma && arma.oporGratis ? 0 : costoPrimerAtaque(tipoDado);
  const RE_IGNORA_CRIT = /^ignora\s+(\d+)\s+de\s+res/i;
  const esEfectoIgnora = e => RE_IGNORA_CRIT.test(String((e && e.nombre) || '').trim());
  function ignoraResistCritArma(arma){
    if(!arma) return 0;
    const viejo = (arma.efectosGolpe || []).reduce((a, e) => { const m = RE_IGNORA_CRIT.exec(String((e && e.nombre) || '').trim()); return a + (m ? n(m[1]) : 0); }, 0);
    return Math.max(0, Math.round(n(arma.ignoraResistCrit) + viejo));
  }
  // El menú «¿Qué ataque es?» (los tres botones), igual en todas las pantallas. o = {nombre, normal, primero, especial, attr, ref,
  // primeroTxt?, siguienteTxt?}: `attr` = el data-atributo de los botones, `ref` lo que va después de «tipo:».
  function menuTipoAtaqueHtml(o){
    const e = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
    const b = (tipo, txt) => `<button class="btn" ${o.attr}="${tipo}:${e(o.ref)}" style="width:100%">${txt}</button>`;
    return `<div class="hint">${e(o.nombre)}</div>
    ${b('normal', `⚔ Ataque normal — ${n(o.normal)} No2<br><span class="hint">${o.primero ? (o.primeroTxt || 'primer ataque del turno (Tipo ÷ 2)') : (o.siguienteTxt || 'Tipo completo (ya atacó este turno)')}</span>`)}
    ${b('oportunidad', `🏃 Ataque de oportunidad — ${n(o.especialOpor ?? o.especial)} No2<br><span class="hint">${o.especialOpor === 0 ? 'gratis con esta arma' : 'siempre Tipo ÷ 2'}; no suma al conteo de ataques</span>`)}
    ${b('contra', `↩ Contraataque — ${n(o.especial)} No2<br><span class="hint">solo tras ganar un Parry y un Bloqueo; siempre Tipo ÷ 2; no suma al conteo de ataques</span>`)}`;
  }
  function costoAtaque(tipo, ataquesPrevios){ return n(ataquesPrevios) === 0 ? costoPrimerAtaque(tipo) : n(tipo); }
  // Cuántos ataques alcanzan con esos No2 (el primero a mitad de precio, los demás completos).
  function ataquesPosibles(tipo, nitros){ const t = n(tipo), p = costoPrimerAtaque(t); return n(nitros) < p ? 0 : 1 + (t > 0 ? Math.floor((n(nitros) - p) / t) : 0); }

  // El Parry cuesta siempre 1 No2, con cualquier arma o escudo (2026-09-26, dueño). Sin arma ni escudo no se puede (P121).
  function costoParry(){ return 1; }
  /* No2 en negativo por defenderse (2026-10-06, dueño, a probar): las defensas que cuestan No2 (Parry, la Evasión que paga el sobrepeso, el
     dodge roll) se pueden hacer sin No2: quedás en negativo y esa deuda se descuenta en la próxima recarga (`recargarNo2`). Solo las defensas;
     todo lo demás sigue sin poder pasar de 0. Se avisa muy claro: a quien la hace, un cartel; a los demás, la Crónica (`avisarDeudaNo2`, que
     usa `window.avisoDeudaNo2` si la pantalla lo define —el mapa—; si no, un toast). */
  const recargarNo2 = (max, actual) => n(actual) < 0 ? n(max) + n(actual) : n(max);
  function avisarDeudaNo2(o){
    if(!o || n(o.quedan) >= 0) return;
    try{ if(typeof window !== 'undefined' && typeof window.avisoDeudaNo2 === 'function'){ window.avisoDeudaNo2(o); return; } }catch(e){}
    if(typeof toast === 'function') toast(`⚠ ${o.nombre ? o.nombre + ': ' : ''}sin No2 para ${o.accion}: queda en ${o.quedan} No2 (se descuenta en la próxima recarga)`);
  }
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
  /* El Bloqueo SIEMPRE viene después de un Parry (regla y concepto del dueño, 2026-09-30): cuando te atacan, el Parry
     (Destreza) es interceptar el arma del rival con tu arma o tu escudo; si lo lográs, el Bloqueo (Fuerza + el peso de tu
     arma o escudo) es aguantar la fuerza del golpe (Fuerza del atacante + el peso de su arma). Bloqueo sin Parry no existe,
     salvo que se diseñe para un contexto especial. Cada herramienta recuerda el Parry que quedó esperando su Bloqueo. */
  const BLOQUEO_SOLO_TRAS_PARRY = 'El Bloqueo se tira solo después de un Parry, con la misma arma o escudo';

  /* ---------- Durabilidad de un ítem (2026-09-26, docs/durabilidad.md; variable de diseño desde 2026-09-30) ----------
     Armas, escudos y piezas de armadura tienen durabilidad: puntos por cada punto de Peso (3 por defecto) y como mínimo 3.
     Cada ítem puede traer su propio `durPorPeso` (dueño, 2026-09-30: "una variable de diseño, para generar objetos de
     mejor calidad"): 4 o 5 = más resistente para su peso; 2 = frágil. Sin el campo vale 3. La durabilidad ACTUAL de una
     copia (`dur`, lo que se gastó) y su Armadura rota (`armRota`) son de esa copia, no del diseño. */
  const DUR_POR_PESO = 3, DUR_MIN = 3;
  const TIPOS_DURABLES = ['cabeza', 'manos', 'piernas', 'pies'];
  function esDurable(item){ const t = String((item && item.tipoItem) || ''); return !(item && item.consumible) && (/^(arma_|escudo_|armadura_)/.test(t) || TIPOS_DURABLES.includes(t)); }
  function durPorPeso(item){ const v = n(item && item.durPorPeso); return v > 0 ? v : DUR_POR_PESO; }
  /* Resistente / Frágil (dueño, 2026-10-04): `durExtra` suma o resta durabilidad TOTAL (Resistente ×N = +N, Frágil ×N = −N), no por Peso: más
     margen de diseño. Con Frágil (u otro efecto que la baje) puede quedar por debajo de 3, pero nunca menos de 1. `durPorPeso` queda solo para las
     copias viejas que lo traen. */
  function durExtra(item){ return Math.round(n(item && item.durExtra)); }
  function durBase(item){ return Math.max(DUR_MIN, Math.round(durPorPeso(item) * Math.max(0, Math.round(n(item && item.peso))))); }
  function durMax(item){ const b = durBase(item), x = durExtra(item); return x < 0 ? Math.max(1, b + x) : b + x; }
  // Texto para las características del ítem: «12 (Resistente ×3)»; null si el ítem no tiene durabilidad.
  function durTexto(item){
    if(!esDurable(item)) return null;
    const x = durExtra(item), pp = durPorPeso(item), max = durMax(item);
    const nota = x > 0 ? `Resistente ×${x}` : x < 0 ? `Frágil ×${-x}` : pp !== DUR_POR_PESO ? `${pp} por punto de Peso` : `${DUR_POR_PESO} por punto de Peso`;
    return `${max} (${nota})`;
  }

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
    const clave = nuevo && nuevo.esSangrado ? 'esSangrado' : nuevo && nuevo.esQuemadura ? 'esQuemadura' : nuevo && nuevo.esEscarcha ? 'esEscarcha' : '';
    if(!clave) return null;
    const ya = (estados || []).find(e => e[clave] && e.nombre === nuevo.nombre);
    if(!ya) return null;
    if(clave !== 'esQuemadura') ya.stacks = Math.max(1, n(ya.stacks) || 1) + 1;   // la Quemadura no sube (dueño, 2026-10-04: identidad propia)
    ya.activo = true;
    if(clave === 'esEscarcha') ya.turnos = Math.max(n(ya.turnos), n(nuevo.turnos));
    if(clave === 'esQuemadura' && n(nuevo.turnos) > 0) ya.turnos = n(nuevo.turnos);   // la Quemadura: solo vuelven a contar los turnos
    // Sangrado (regla del dueño, 2026-10-03): +1 stack y los turnos vuelven a los del Sangrado nuevo (el estándar); si alguno es permanente, queda permanente.
    if(clave === 'esSangrado'){
      if(nuevo.permanente){ ya.permanente = true; ya.turnos = 0; }
      else if(!ya.permanente && n(nuevo.turnos) > 0) ya.turnos = n(nuevo.turnos);
    }
    return ya;
  }

  /* ---------- Ponerle un estado a alguien (paso 2, tanda 2, 2026-09-30) ----------
     La misma regla para el "+ Estado" a mano (personaje, invocación, creep), lo que llega de una habilidad o trampa, y el
     formulario completo:
       1. Inmunidades (Invulnerable, Inmunidad a CC, Sangre pura, Coagulación, jefe contra Stun): rebota. (Un estado que se
          carga pausado no se revisa.)
       2. Armadura rota: +1 stack al que ya tenía.
       3. Veneno: suma sus stacks (el severo, si ya lo tiene, no hace nada). Sangrado y Escarcha: +1 stack.
       4. Si ya tiene uno con el mismo nombre: SE RENUEVA — queda uno solo, con los números nuevos (dueño, 2026-09-30:
          antes el "+ Estado" a mano dejaba dos iguales y solo lo que llegaba a un creep desde una habilidad lo renovaba).
          Los que vienen de un ítem equipado no se tocan.
       5. Si no, se agrega.
     Modifica la lista y devuelve {ok, que: 'bloqueado'|'acumulado'|'yaLoTiene'|'renovado'|'nuevo', estado, motivo?}.
     `o.jefe`: el que lo recibe es un creep jefe. */
  function agregarEstado(estados, nuevo, o){
    if(!Array.isArray(estados) || !nuevo) return {ok: false, que: 'nada'};
    if(marcaTurno && nuevo.pasoTurno === undefined){ const m = marcaTurno(); if(m) nuevo.pasoTurno = m; }   // en qué turno se lo pusieron (turno propio)
    if(nuevo.activo !== false){
      const motivo = inmunidad(estados, nuevo, o);
      if(motivo) return {ok: false, que: 'bloqueado', motivo};
      if(esMarca(nuevo)) for(let i = estados.length - 1; i >= 0; i--) if(esSigilo(estados[i])) estados.splice(i, 1);   // la marca le saca el sigilo
    }
    if(nuevo.armaduraRota){
      const ya = estados.find(e => e && e.armaduraRota);
      if(ya){ ya.stacks = Math.max(1, n(ya.stacks) || 1) + 1; ya.activo = true; return {ok: true, que: 'acumulado', estado: ya}; }
    }
    const veneno = acumularVeneno(estados, nuevo);
    if(veneno) return {ok: true, que: nuevo.permanente ? 'yaLoTiene' : 'acumulado', estado: veneno};
    const sangrado = acumularSangrado(estados, nuevo);
    if(sangrado) return {ok: true, que: 'acumulado', estado: sangrado};
    const igual = estados.find(e => e && e.nombre === nuevo.nombre && !e.origenItem && !e.derivado);
    if(igual){
      const id = igual.id;
      Object.keys(igual).forEach(k => { delete igual[k]; });
      Object.assign(igual, nuevo, id !== undefined ? {id} : {});
      return {ok: true, que: 'renovado', estado: igual};
    }
    estados.push(nuevo);
    return {ok: true, que: 'nuevo', estado: nuevo};
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
    if(n(s.turnos) > 0 && base.permanente) base.permanente = false;   // con turnos puestos, vence (ej. Sangrado por 2 turnos de un arma, 2026-10-03)
    if(Array.isArray(s.mods) && s.mods.length) base.mods = s.mods.map(m => ({stat: m.stat, val: n(m.val)}));
    if(n(s.hp)) base[campoHp || 'hpTurno'] = n(s.hp);
    if(n(s.stacks) && base.esVeneno && !base.permanente){ base.stacks = n(s.stacks); base.turnos = base.stacks; }
    if(n(s.stacks) && (base.esSangrado || base.esQuemadura)) base.stacks = n(s.stacks);   // un arma que deja Sangrado con más stacks (2026-10-03)
    if(n(s.escudoMagico)) base.escudoMagico = n(s.escudoMagico);
    if(s.detalle) base.detalle = s.detalle;
    return base;
  }

  /* ¿El estado que pone una habilidad o un ítem al usarse (efectoNombre…) no vence? (P137, 2026-10-01, igual para personajes,
     invocaciones y creeps): si la habilidad/ítem lo dice (efectoPermanente, la casilla "No vence" / "Sin límite"), manda eso;
     si nunca se tocó, lo que diga el estado (`preset`). */
  function efectoPermanente(src, preset){
    const v = src && src.efectoPermanente;
    return v !== undefined && v !== null ? !!v : !!(preset && preset.permanente);
  }

  /* ---------- Inmunidades ----------
     ¿Este debuff rebota en quien lo recibe? Devuelve el motivo ('Invulnerable', 'Inmunidad a CC', 'Sangre pura',
     'Coagulación extrema', 'Protección de jefe') o false. `o.jefe`: un creep jefe es inmune a Stun (P95). */
  // Marcado (2026-10-05): mientras dure no puede entrar en sigilo, y al ponérselo se le cae el que tenía.
  const esSigilo = e => String((e && e.nombre) || '').trim().toLowerCase() === 'sigilo';
  const esMarca = e => !!e && (!!e.marcado || String(e.nombre || '').trim().toLowerCase() === 'marcado');
  const marcadoEn = estados => activos(estados).some(esMarca);
  function inmunidad(estados, est, o){
    if(est && esSigilo(est) && marcadoEn(estados)) return 'Marcado';
    if(!est || est.polaridad !== 'debuff') return false;
    if(o && o.jefe && est.nombre === 'Stun') return 'Protección de jefe';
    const act = activos(estados);
    if(act.some(e => e.invulnerable)) return 'Invulnerable';
    if(est.esCC && act.some(e => e.inmunidadCC)) return 'Inmunidad a CC';
    if(est.esVeneno && act.some(e => e.sangrePura)) return 'Sangre pura';
    if(est.esSangrado && act.some(e => e.coagulacionExtrema)) return 'Coagulación extrema';
    return false;
  }

  /* ---------- Usar una habilidad (paso 3, 2026-09-30) ----------
     Lo mismo para personaje, invocación y creep: en qué modo se ejecuta, qué cuesta, si se puede usar ahora, hasta dónde
     llega y lo que el cuadro del duelo necesita (la ✨ Ejecución). Cada herramienta pone lo suyo: de dónde salen los stats
     del que la usa, las etiquetas y la X del costo variable (solo los personajes la tienen). */
  const MODOS_HAB = ['manual', 'semi', 'auto'];
  const nf = v => { const x = parseFloat(v); return Number.isFinite(x) ? x : 0; };   // como num() de las herramientas: '2 No2' = 2
  // 📣 manual / 💰 semi / ✨ auto. `duelo`: la Ejecución que tiene armada (la propia o la de su plantilla); las viejas sin
  // `modo` lo deducen: automatizada === false → manual, con Ejecución → auto, el resto → semi. null = nueva, sin elegir.
  function modoHab(h, duelo){
    if(!h) return 'semi';
    if(h.modo === null) return null;
    if(MODOS_HAB.includes(h.modo)) return h.modo;
    if(h.automatizada === false) return 'manual';
    return duelo ? 'auto' : 'semi';
  }
  // Qué arma la Ejecución: 'arma' (ataque con arreglos), 'flash' (reacción), 'zona' (persistente) o 'dirigida'.
  function tipoEjecucion(c){
    if(!c || typeof c !== 'object') return '';
    if(c.modo === 'arma' || c.modo === 'flash') return c.modo;
    return c.objetivo === 'zona' ? 'zona' : 'dirigida';
  }
  // Cambia la «X» del costo variable por el número elegido, en una fórmula («1dX», «X+2») o en un texto libre.
  // \bx\b sola no alcanza: en «1dX» la X queda pegada a la «d»; por eso la segunda pasada para «dX»/«Xd».
  function sustituirX(formula, X){
    const s = String(Math.max(0, Math.round(nf(X))));
    return String(formula || '').replace(/\bx\b/gi, s).replace(/dx/gi, 'd' + s).replace(/xd/gi, s + 'd');
  }
  const esCostoAtaque = h => String((h && h.nitrosCosto) ?? '').trim().toUpperCase() === 'ATAQUE';
  const esCostoX = v => /x/i.test(String(v ?? ''));
  // No2 de una habilidad: "ATAQUE" = lo que cuesta un ataque con su arma (y cuenta como ese ataque), X = se elige al
  // usarla (acá 0), sin cargar (undefined/null) = el costo por defecto de quien la usa.
  function costoNitrosHab(h, costoAtaque, porDefecto){
    if(esCostoAtaque(h)) return nf(typeof costoAtaque === 'function' ? costoAtaque() : costoAtaque);
    if(esCostoX(h && h.nitrosCosto)) return 0;
    return nf((h && h.nitrosCosto) ?? porDefecto);
  }
  // ¿Se puede usar ahora? '' = sí; si no, el motivo. Se cobra lo que la habilidad tenga cargado, sea de quien sea (P133):
  // cooldown, No2 y vida (tiene que sobrar vida después de pagarla). Una 📣 manual no cobra nada.
  function bloqueoHab(h, o){
    o = o || {};
    if(o.modo === 'manual') return '';
    if(nf(h && h.cdActual) > 0) return `Cooldown · ${nf(h.cdActual)} turno(s)`;
    if(o.nitros !== undefined && nf(o.nitros) < nf(o.costo)) return 'Sin No2';
    if(o.hp !== undefined && nf(h && h.hpCosto) > 0 && nf(o.hp) <= nf(h.hpCosto)) return 'Sin vida';
    return '';
  }
  // Hasta dónde llega (casilleros; 0 = sin límite, no resalta). `stat(id)` da el Rango ('rng') o el Rango de casteo
  // ('rangocasteo') de quien la usa. En automático, los hechizos (PdG.Mg) usan el Rango de casteo y el resto no resalta.
  function alcanceHab(c, statTira, stat){
    const modo = c && c.alcance !== undefined ? c.alcance : 'auto';
    const v = id => { const x = Number(stat ? stat(id) : 0); return Number.isFinite(x) ? Math.max(0, Math.round(x)) : 0; };
    if(modo === 'casteo') return v('rangocasteo');
    if(modo === 'rango') return v('rng');
    if(modo === 'adyacente') return 1;
    if(modo === 'ilimitado') return 0;
    if(modo === 'fijo') return Math.max(0, Math.round(nf(c.alcanceN)));
    return statTira === 'pdgmg' || statTira === 'dmgesp' ? v('rangocasteo') : 0;   // Ef.Esp (2026-10-02): también del Especial
  }
  // Un efecto de la Ejecución, en la forma que usa el cuadro del duelo (y el estado que pone, `spec`).
  function efectoDeEjecucion(e){
    // «Pierde No2» (2026-10-02, Sonic Boom): el objetivo pierde `no2` (+ la diferencia entre las tiradas) No2; en 0, Sentado.
    if(e && e.no2 !== undefined) return {nombre: 'Pierde No2', caras: 1, exitos: 1, spec: null, no2: Math.max(0, Math.round(nf(e.no2))), no2Dif: !!e.no2Dif, no2Sentado: !!e.no2Sentado,
      detalle: `Pierde ${nf(e.no2)}${e.no2Dif ? ' + la diferencia' : ''} No2${e.no2Sentado ? '; si se queda sin No2, queda Sentado' : ''}.`};
    // Con probabilidad (2026-10-05, armas especiales): `caras`/`exitos` como los efectos de un arma (33 % = 5 o 6 en d6: el duelo tira un d3 como d6); sin eso, entra siempre.
    const caras = Math.max(1, Math.round(nf(e.caras)) || 1);
    return {nombre: e.nombre || (e.cura ? 'Curación' : ''), caras, exitos: Math.min(caras, Math.max(1, Math.round(nf(e.exitos)) || 1)),
      spec: e.cura ? null : {nombre: e.nombre, turnos: e.turnos, mods: e.stat ? [{stat: e.stat, val: nf(e.val)}] : e.mods,
        polaridad: e.stat ? (nf(e.val) >= 0 ? 'buff' : 'debuff') : (e.escudo ? 'buff' : undefined), hp: e.hp, stacks: e.stacks, escudoMagico: e.escudo},
      cura: nf(e.cura), detalle: e.detalle || ''};
  }
  /* Lo que el cuadro del duelo necesita para una habilidad dirigida ✨ (y las de área, onda y zona), o null si la
     Ejecución es un ataque con arma o un Flash. `h` la habilidad, `c` su Ejecución. `o.stat(id)`: stats de quien la usa
     (para el alcance); `o.etq(id)`: nombre de un stat; `o.X`: la X elegida al pagar el costo variable — sin `o.X` no se
     toca ninguna «X» de los textos. La tirada personalizada, el daño que escala con X y los textos a mano valen igual
     para los tres (antes el creep los perdía). */
  function habEjecucion(h, c, o){
    if(tipoEjecucion(c) === '' || c.modo === 'arma' || c.modo === 'flash') return null;
    o = o || {};
    const etq = o.etq || (s => s), conX = o.X !== undefined && o.X !== null, X = nf(o.X);
    const sx = t => conX ? sustituirX(t, X) : t;
    const stat = c.tira !== undefined ? c.tira : (h.tiradaStat || '');
    const tipo = c.tipoDano || 'arcano';
    // «El daño de tu arma» (2026-10-02, Daño en área): la fórmula del arma de quien la usa (`o.armaDano`, la que tira «Daño»).
    const formula = c.danoArma ? formulaDanoHab({tiradaExtra: o.armaDano || ''}, c, o.X) : formulaDanoHab(h, c, o.X);
    return {
      nombre: h.nombre, objetivo: c.objetivo || 'enemigo',
      alcance: c.objetivo === 'uno mismo' || c.objetivo === 'area' || c.objetivo === 'onda' || c.objetivo === 'cono' || c.objetivo === 'linea' ? 0 : alcanceHab(c, stat, o.stat),
      tira: c.tiraFormula ? {formula: sx(c.tiraFormula), etq: c.tiraEtiqueta || 'Tirada'} : (stat ? {stat, etq: etq(stat), bono: nf(h.tiradaBono)} : null),
      contra: (c.contra || []).map(s => ({modo: s, stat: s, etq: etq(s)})),
      // Daño «la diferencia» (2026-10-02, Drenar Vida): no se tira, es lo que quien la usa le ganó a la resistencia. «Drena»: quien la
      // usa se cura lo que hizo de daño, y puede pasar su vida máxima hasta `drenaTope` % (como Excedente de vida).
      dano: c.dano && (formula || c.danoDiferencia) ? {formula: c.danoDiferencia ? '' : formula, tipo, ignoraDef: c.ignoraDano !== undefined ? !!c.ignoraDano : tipo !== 'fisico',
        ...(c.danoDiferencia ? {diferencia: true} : {}), ...(c.drena ? {drena: true, drenaTope: Math.max(0, nf(c.drenaTope))} : {})} : null,
      efectos: (c.efectos || []).map(efectoDeEjecucion),
      ...(c.objetivo === 'area' || c.objetivo === 'onda' ? {radio: nf(c.radio)} : {}),
      ...(c.objetivo === 'linea' ? {largo: Math.max(1, Math.round(nf(c.largo)) || 4)} : {}),   // línea recta desde quien la usa (2026-10-05, Varita láser)
      ...(c.objetivo === 'onda' && c.ondaDodge ? {dodge: true} : {}),   // la onda que deja dodge roll (Daño en área)
      ...(c.objetivo === 'onda' && c.conVista ? {conVista: true} : {}),   // la luz (2026-10-05, Varita de la luz): solo los que ve (los sólidos la tapan)
      // Tercera tanda de armas especiales (2026-10-05): lo que deja en el suelo un área (bola de fuego, ventisca), el −1 por casillero (pelea
      // cercana), lo que atrae (gancho, con la Fuerza del objetivo contra el Ef.Esp de quien la usa), los dos misiles que se reparten y el
      // crítico de lo físico invocado (Tipo de su familia: estaca 4, canto rodado 10).
      ...(c.zonaQueda ? {zonaQueda: {...c.zonaQueda, ...(c.zonaQueda.tira && o.stat ? {tiraValor: Math.round(nf(o.stat(c.zonaQueda.tira)))} : {})}} : {}),
      ...(c.menosDistancia ? {menosDistancia: true} : {}),
      ...(c.atrae ? {atrae: {casillas: Math.max(1, Math.round(nf(c.atrae.casillas)) || 2), contra: c.atrae.contra || 'fue', ...(o.stat ? {tiraValor: Math.round(nf(o.stat(c.atrae.tira || 'dmgesp')))} : {})}} : {}),
      ...(c.reparte ? {reparte: {cada: String(c.reparte.cada || '1d4'), total: Math.max(2, Math.round(nf(c.reparte.total)) || 2)}} : {}),
      ...(nf(c.critTipo) ? {critTipo: Math.round(nf(c.critTipo))} : {}),   // la luz (2026-10-05, Varita de la luz): solo los rivales en sigilo que alcanza
      // Rayo en cadena (2026-10-05, Varita de chispa eléctrica): si el golpe entra, salta `saltos` veces al más cercano del mismo bando a
      // `rango` casillas o menos, la mitad cada salto (P118: la misma regla de ⚡ Rayo en cadena del token y de la trampa Descarga).
      ...(c.cadena ? {cadena: {saltos: Math.max(1, Math.round(nf(c.cadena.saltos)) || 2), rango: Math.max(1, Math.round(nf(c.cadena.rango)) || 3)}} : {}),
      ...(c.efectoLibre ? {efectoLibre: sx(c.efectoLibre)} : {}),
      ...(c.efectosNota ? {efectosNota: sx(c.efectosNota)} : {}),
      ...(c.contraOtro ? {contraOtro: c.contraOtro} : {}),
    };
  }
  // La fórmula de daño de la Ejecución: la de la habilidad («tiradaExtra») más danoFijoPorX × X (P119); sin X, tal cual.
  function formulaDanoHab(h, c, X){
    const base = String((h && h.tiradaExtra) || '').trim();
    const extra = X !== undefined && X !== null && c && c.danoFijoPorX ? nf(c.danoFijoPorX) * nf(X) : 0;
    return base && extra ? `${base}${extra > 0 ? '+' : ''}${extra}` : base;
  }
  /* Lo que el mapa necesita para dejar puesta la zona persistente de una habilidad (el mensaje 'zona-persistente-habilidad',
     igual para personaje y creep). `o.fichaId` y `o.tipo` ('pj'|'creep'): quién la usa; `o.X`: el costo variable;
     `o.resistValor`: la tirada de «tira», hecha UNA vez y reusada contra cada uno que entra o sigue adentro. */
  // Daño «la diferencia» (2026-10-02, Pedos Tóxicos): `zonaDanoDif` = cada uno que no resiste recibe la tirada de quien la creó
  // menos la suya; `zonaTiraExtra` (ej. '1d20') + `zonaNota`: si el daño entra, se tira y se publica con ese texto (a mano).
  const TIPO_DANO_NOMBRE = {arcano: 'arcano', fuego: 'de fuego', hielo: 'de hielo', rayo: 'de rayo', toxico: 'tóxico', fisico: 'físico'};
  function zonaDeHab(h, c, o){
    o = o || {};
    const dif = !!(c.dano && c.danoDiferencia);
    return {tipo: 'zona-persistente-habilidad', fichaId: o.fichaId, casteadorTipo: o.tipo, nombre: h.nombre,
      radio: Math.max(1, nf(c.radio) || 1), zonaTurnos: Math.max(1, nf(c.zonaTurnos) || 3), zonaAmiga: !!c.zonaAmiga,
      zonaEstado: c.zonaEstado || null, zonaDano: c.dano && !dif ? formulaDanoHab(h, c, o.X) : (dif && c.danoSuma ? String(c.danoSuma) : ''),   // con «la diferencia», `danoSuma` se le suma (miasma: + 1d4)
      zonaIgnoraDef: c.dano ? (c.ignoraDano !== undefined ? !!c.ignoraDano : (c.tipoDano || 'arcano') !== 'fisico') : false,
      zonaDanoDif: dif, zonaDanoTipo: c.dano ? (TIPO_DANO_NOMBRE[c.tipoDano || 'arcano'] || '') : '',
      zonaTiraExtra: c.dano && c.danoExtra ? String(c.danoExtra) : '', zonaNota: c.efectoLibre ? (o.X === undefined || o.X === null ? String(c.efectoLibre) : sustituirX(String(c.efectoLibre), o.X)) : '',
      resistStat: (c.contra && c.contra[0]) || '', resistValor: o.resistValor === undefined ? null : o.resistValor,
      // La tirada de la zona (2026-10-02, P143): el stat de quien la crea y su VALOR en ese momento; el mapa lo tira cada vez que la zona
      // afecta a alguien (antes se tiraba una sola vez al ejecutar: `resistValor`, que sigue valiendo para las zonas viejas).
      tiraStat: c.tira || '', tiraValor: Number.isFinite(o.tiraValor) ? Math.round(o.tiraValor) : null,
      ...(c.niebla ? {niebla: true} : {})};   // la niebla (2026-10-05, Varita de niebla): tapa la vista, no hace nada más
  }
  // La trampa que coloca una habilidad, lista para el mapa: si no trae nombre propio, lleva el de la habilidad.
  // `valorDe(statId)` (2026-10-02, P145): el valor de un stat de quien la coloca — la dificultad para detectarla sale de su Destreza (trampas
  // físicas) o de su Efecto especial (mágicas, `detectarStat: 'dmgesp'`), en el momento de colocarla. Sin `valorDe`, queda la de siempre (8).
  function trampaDeHab(h, valorDe){
    const t = h && h.trampaColocar;
    if(!t) return null;
    const out = {...t, nombre: String(t.nombre || '').trim() || h.nombre};
    if(typeof valorDe === 'function'){
      const v = Number(valorDe(t.detectarStat === 'dmgesp' ? 'dmgesp' : 'des'));
      const oculta = Math.max(0, Math.round(n(valorDe('trampaoculta'))));   // Guantes de trampero (2026-10-05): tus trampas, más difíciles de ver
      if(Number.isFinite(v)) out.detectar = Math.max(1, Math.round(v)) + oculta;
    }
    return out;
  }
  /* «Ataque con mi arma, con arreglos» (Golpe brutal, Carga, Takle…): el ataque que va al duelo, con lo que le suma la
     habilidad (PdG, dados del Tipo del arma, daño fijo, crítico, ignorar resistencia a crítico, sin Parry, efectos al pegar
     y los que solo pasan si es crítico). Igual para personaje y creep. `o.arma` = {id, nombre, tipoDado, rango} de quien
     ataca; `o.alcance` = casilleros (lo calcula quien llama: el de su arma o el que diga la habilidad); `o.X` = el costo
     variable (sin X, ninguna «X» de los textos se toca). */
  function ataqueConArreglos(h, c, o){
    if(!c || typeof c !== 'object' || c.modo !== 'arma') return null;
    o = o || {};
    const a = c.arma || {}, arma = o.arma || {}, conX = o.X !== undefined && o.X !== null, X = nf(o.X);
    const sx = t => conX ? sustituirX(t, X) : t;
    const mapEf = e => ({nombre: e.nombre || (e.cura ? 'Curación' : ''), caras: 1, exitos: 1,
      spec: e.cura ? null : {nombre: e.nombre, turnos: e.turnos, mods: e.stat ? [{stat: e.stat, val: nf(e.val)}] : e.mods, polaridad: e.stat ? (nf(e.val) >= 0 ? 'buff' : 'debuff') : undefined},
      cura: nf(e.cura), detalle: e.detalle || ''});
    const critico = c.critico ? {
      ...(c.critico.efectos && c.critico.efectos.length ? {efectos: c.critico.efectos.map(mapEf)} : {}),
      ...(c.critico.efectosNota ? {efectosNota: sx(c.critico.efectosNota)} : {}),
    } : null;
    // Por la espalda (2026-10-03): lo del arma más lo de la habilidad (`arma.espaldaPdg/Fijo/Critpot` del ✨, ej. Backstab).
    const ESP = {pdg: 'espaldaPdg', fijo: 'espaldaFijo', critpot: 'espaldaCritpot'};
    const esp = Object.keys(ESP).reduce((acc, k) => { const v = nf(arma.espalda && arma.espalda[k]) + nf(a[ESP[k]]); if(v > 0) acc[k] = v; return acc; }, {});
    return {tipo: 'habilidad-arma', habNombre: h.nombre, armaId: arma.id || '', armaNombre: arma.nombre || '', tipoDado: arma.tipoDado, rango: !!arma.rango,
      alcance: o.alcance, sinParry: !!a.sinParry || !!arma.sinParry, ...(Object.keys(esp).length ? {espalda: esp} : {}),
      mods: {pdg: nf(a.pdg) + nf(a.pdgPorX) * X, dados: nf(a.dadosPorX) * X, fijo: nf(a.fijo) + nf(a.fijoPorX) * X, ignoraResistCrit: nf(a.ignoraResistCrit), critBono: nf(a.critBono), critpotBono: nf(a.critpotBono)},
      efectos: (c.efectos || []).map(mapEf),
      ...(c.efectosNota ? {efectosNota: sx(c.efectosNota)} : {}),
      ...(critico && Object.keys(critico).length ? {critico} : {})};
  }
  /* ⚡ Flash (P136, regla del dueño 2026-09-30): en el propio turno cuesta lo que dice la habilidad; en turno ajeno, EL DOBLE —
     SP (personaje), cooldown (creep) y vida por igual, se use dentro del duelo o con el botón. `costo` = {sp, cd, hp};
     `o.spAjeno`: si la habilidad tiene cargado a mano otro SP para turno ajeno, manda ese. */
  function costoFlash(costo, turnoPropio, o){
    const c = costo || {}, k = turnoPropio ? 1 : 2;
    const out = {sp: Math.max(0, nf(c.sp)) * k, cd: Math.max(0, nf(c.cd)) * k, hp: Math.max(0, nf(c.hp)) * k};
    const aj = o && o.spAjeno;
    if(!turnoPropio && aj !== undefined && aj !== null && String(aj).trim() !== '') out.sp = Math.max(0, nf(aj));
    return out;
  }
  const cdFlash = (cd, turnoPropio) => costoFlash({cd}, turnoPropio).cd;
  /* ⚡ Flash: ¿esta Ejecución es un Flash que vale para esa tirada del duelo? `campo`: 'pdg', 'eva' (la defensa), 'bloqueo',
     'fuerza' o 'dano'. Sin `modo`, para 'eva' vale si sirve para Evasión o Parry (la lista de opciones); con `modo`, para la
     defensa que se eligió ('parry' o la Evasión). */
  // Una habilidad con ⚡ Flash (se puede usar en turno ajeno, al doble): en las Botoneras late con un brillo (dueño, 2026-10-06).
  const esFlash = h => !!(h && h.duelo && h.duelo.modo === 'flash');
  const FLASH_CSS = `<style>.bt-flash{animation:bt-flash-late 1.6s ease-in-out infinite;border-color:#ffd25a !important}
@keyframes bt-flash-late{0%,100%{box-shadow:0 0 0 0 rgba(255,210,90,0)}50%{box-shadow:0 0 12px 3px rgba(255,210,90,.75)}}</style>`;
  function flashPara(c, campo, modo){
    if(!c || typeof c !== 'object' || c.modo !== 'flash' || !c.flash) return false;
    const en = c.flash.en || [];
    if(campo !== 'eva') return en.includes(campo);
    return modo === undefined ? en.includes('eva') || en.includes('parry') : en.includes(modo === 'parry' ? 'parry' : 'eva');
  }
  // Solo sobre uno mismo y sin nada que tirar ni resistir (Blindaje y parecidos): se aplica directo, sin abrir el cuadro.
  const sobreSiSinTiradas = hab => !!(hab && hab.objetivo === 'uno mismo' && !hab.tira && !hab.dano && !(hab.contra || []).length);
  // Por qué una ✨ se ejecuta como 💰 en quien todavía no tiene esa parte (P134: a las invocaciones les falta la zona
  // persistente; un ⚡ Flash se usa dentro del duelo, antes de una tirada). '' = se puede.
  function ejecucionNoDisponible(c, quien){
    const t = tipoEjecucion(c);
    if(!t) return 'todavía no tiene armada la ejecución paso a paso (✨)';
    if(quien === 'pj') return '';
    if(t === 'flash') return 'un ⚡ Flash se usa dentro del duelo, antes de una tirada';
    return '';
  }

  /* ---------- Repartos sugeridos de atributos (2026-10-02: los de los roles de creeps; los usan el asistente de creeps de GM Tools y el de
     personaje nuevo, comun/asistente-personaje.js — decisión del dueño: las clases sugieren el reparto de su rol, siempre como orientación).
     Pesos en el orden de los atributos: Con, Fue, Agl, Des, Esp. ---------- */
  const ROLES = {brutal: 'Brutal (pega fuerte)', tanque: 'Tanque (aguanta)', rapido: 'Rápido (asalto)', rango: 'A distancia', mago: 'Mago', apoyo: 'Apoyo', debuffer: 'Debuffer (maldiciones)'};
  const PESOS_ROL = {brutal: [.26, .30, .14, .16, .14], tanque: [.36, .26, .10, .12, .16], rapido: [.16, .18, .30, .24, .12],
    rango: [.18, .10, .24, .32, .16], mago: [.20, .08, .16, .16, .40], apoyo: [.24, .10, .16, .14, .36], debuffer: [.22, .08, .18, .14, .38]};
  // Cada clase de personaje, con el rol de creep que comparte su reparto.
  const ROL_DE_CLASE = {warrior: 'brutal', asalto: 'rapido', tanque: 'tanque', mago: 'mago', shooter: 'rango', support: 'apoyo', debuffer: 'debuffer'};
  // `total` puntos repartidos según `pesos`, con `minimo` en cada uno (los creeps: 1; un personaje nuevo: 3).
  // (Con mínimo 1 da lo mismo que la cuenta que tenía GM Tools.)
  function repartirAtributos(total, pesos, minimo){
    const m = Math.max(0, Number(minimo) || 1);
    const v = pesos.map(p => Math.max(m, Math.floor(total * p)));
    let resto = total - v.reduce((a, b) => a + b, 0);
    const orden = pesos.map((p, i) => [p, i]).sort((a, b) => b[0] - a[0]).map(x => x[1]);
    for(let k = 0; resto > 0; k++, resto--) v[orden[k % orden.length]]++;
    for(let k = 0, vueltas = 0; resto < 0 && vueltas < 1000; k++, vueltas++){ const i = orden[k % orden.length]; if(v[i] > m){ v[i]--; resto++; } }   // los mínimos se pasaron del total
    return v;
  }

  /* Elementos (2026-10-04, dueño): el daño de un elemento se frena con la resistencia a ese elemento (Res. fuego…) y con la Armadura mágica
     (que resta TODO daño mágico, arcano o elemental). `elementoDe(texto)` reconoce el elemento en el tipo de un daño ('Fuego', 'de fuego',
     'tóxico'…) → 'fuego' | 'hielo' | 'rayo' | 'toxico' | 'acido' | ''. */
  const ELEMENTOS = {fuego: {etq: 'Res. fuego', icono: '🔥'}, hielo: {etq: 'Res. hielo', icono: '❄'}, rayo: {etq: 'Res. rayo', icono: '⚡'},
    toxico: {etq: 'Res. tóxico', icono: '☠'}, acido: {etq: 'Res. ácido', icono: '🧪'}};
  // «Res. rayo 2» o, si es negativa, «Res. rayo −2 (vulnerable)»: lo que se muestra al restarla del daño (2026-10-06).
  const resElementalTxt = (el, res) => `${ELEMENTOS[el] ? ELEMENTOS[el].etq : 'Res. ' + el} ${res < 0 ? '−' + (-res) + ' (vulnerable)' : res}`;
  function elementoDe(texto){
    const t = String(texto || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if(/fuego|llama|quema/.test(t)) return 'fuego';
    if(/hielo|escarcha|frio/.test(t)) return 'hielo';
    if(/rayo|electric|relampago/.test(t)) return 'rayo';
    if(/toxic|veneno|espora/.test(t)) return 'toxico';
    if(/acido/.test(t)) return 'acido';
    return '';
  }
  const esMagicoTipo = texto => !!elementoDe(texto) || /arcan|magic/i.test(String(texto || ''));
  // El daño tóxico (lo que se respira, los venenos) no es mágico: no lo frena la Armadura mágica, solo la Res. tóxico (y se resiste con
  // Res.Esp, la de la Constitución). Dueño, 2026-10-05.
  const frenaArmaduraMagica = el => el !== 'toxico';

  /* ✋ La parte a mano de un arma especial (2026-10-05, dueño: «siempre que un efecto o mecánica sea demasiado complejo de automatizar se debe
     poder agregar una tirada o texto que lo explique, para que se resuelva manual»). `especial.aMano = {texto, tirada?, etiqueta?}`: al usarla, el
     texto va a la Mesa («✋ A mano: …») y, si hay tirada, se tira sola con ese texto. → {texto, tirada, etiqueta} o null. */
  function aManoEspecial(e){
    const a = e && e.aMano;
    if(!a) return null;
    const texto = String(a.texto || '').trim(), tirada = String(a.tirada || '').replace(/\s+/g, '');
    if(!texto && !tirada) return null;
    return {texto, tirada, etiqueta: String(a.etiqueta || '').trim() || 'A mano'};
  }
  /* Guantes de Buena calidad (2026-10-05, dueño). `valorDe(statId)` = el stat de quien ataca (personaje, invocación o creep).
     pdgExtraArma: el PdG con una familia de armas (pdgt4/6/8/10, según el Tipo) o a distancia (pdgdist), al atacar con esa arma.
     ahorroEspecial: los No2 de menos del ataque de oportunidad (oporahorro) o del contraataque (contraahorro); quien llama hace max(0, costo − ahorro). */
  function pdgExtraArma(valorDe, arma){
    if(!arma || typeof valorDe !== 'function') return 0;
    const v = st => Math.max(0, Math.round(n(valorDe(st))));
    const t = n(arma.tipoDado ?? arma.armaTipo);
    return ([4, 6, 8, 10].includes(t) ? v('pdgt' + t) : 0) + (arma.armaDeRango ? v('pdgdist') : 0);
  }
  const AHORRO_ESPECIAL = {oportunidad: 'oporahorro', contra: 'contraahorro', contraataque: 'contraahorro'};
  function ahorroEspecial(tipo, valorDe){
    const st = AHORRO_ESPECIAL[tipo];
    return st && typeof valorDe === 'function' ? Math.max(0, Math.round(n(valorDe(st)))) : 0;
  }
  return {pdgExtraArma, ahorroEspecial, aManoEspecial, ELEMENTOS, elementoDe, esMagicoTipo, frenaArmaduraMagica, ROLES, PESOS_ROL, ROL_DE_CLASE, repartirAtributos, mitadesDeTirada, aplicarMitades, estadosQueParten, tirarStat, afortunado, estadosQueAfectan, pasarTurnoEstados, dispararEstados, contarEstados, dispararAlAplicar, estadosEnMantenimiento, fijarMarcaTurno, reporteTurno, nitrosMax, costoPrimerAtaque, ATAQUE_ESPECIAL, statAtaqueEspecial, EVA_ESPECIAL, statEvaEspecial, evaExtraDuelo, retiradaPct, retiradaDado, retiradaTexto, chancePct, chanceDado, chanceTexto, ESTADOS_TRABA, esTraba, categoriaConsumible, ranurasCinturon, entranEnCinturon, preguntaSentado, preguntaSilencio, soltarNorm, estadoSoltable, textoSoltarse, tiradaSoltarse, hundirSiFalla, menuTipoAtaqueHtml, ignoraResistCritArma, esEfectoIgnora, RASGOS_ARMA, rasgosDeItem, armaDeCombatiente, ataqueDeArma, costoConAhorro, costoEspecial, costoAtaque, ataquesPosibles, costoParry, recargarNo2, avisarDeudaNo2, armaParaDefensa, SIN_ARMA_DEFENSA, BLOQUEO_SOLO_TRAS_PARRY,
    DUR_POR_PESO, DUR_MIN, esDurable, durPorPeso, durExtra, durBase, durMax, durTexto,
    escudoParsear, acumularVeneno, acumularSangrado, agregarEstado, ajustarPreset, efectoPermanente, inmunidad,
    marcadoEn, resElementalTxt, modoHab, tipoEjecucion, sustituirX, esCostoAtaque, costoNitrosHab, bloqueoHab, alcanceHab, efectoDeEjecucion, habEjecucion, sobreSiSinTiradas, ejecucionNoDisponible,
    formulaDanoHab, zonaDeHab, trampaDeHab, ataqueConArreglos, esFlash, FLASH_CSS, flashPara, cdFlash, costoFlash};
})();
