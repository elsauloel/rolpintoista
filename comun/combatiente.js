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
  // Stun (dueño, 2026-10-06): no puede hacer nada; si lo atacan, su Evasión es 1. Un estado viejo sin la marca `stun` se reconoce por el nombre.
  const esStun = e => !!e && e.activo !== false && (!!e.stun || /^stun$/i.test(String(e.nombre || '').trim()));
  const stuneado = estados => (estados || []).some(esStun);
  function tirarStat(valor, estados, statId, o){
    o = o || {};
    if(statId === 'eva' && stuneado(estados))   // stuneado: la Evasión es 1, sin tirar
      return {formula: '1 (Stun: Evasión 1, sin tirar)', rolls: [], mod: 1, total: 1, estados: estadosQueAfectan(estados, statId, false)};
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
       · Vida extra: es neta (2026-10-07); solo se renueva entera la que el efecto marca con `recarga`.
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
     · AL TERMINAR su turno: hasta el 2026-10-08 bajaba el contador. Desde P177 (dueño) el contador baja AL EMPEZAR, antes de disparar
       (`empezarTurnoEstados`), y el fin solo le saca lo «recién» a lo que se puso en ese turno (`terminarTurnoEstados`).
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
      if(n(e.escudoMagico) > 0 && (e.recarga || (!e.excedenteVida && !e.sinRecarga))){   // la Vida extra es neta (2026-10-07): solo se renueva si el efecto lo dice (`recarga`)
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
  // `o.alEmpezar` (P177, 2026-10-08): lo cuenta el inicio del turno — un estado `recien` (puesto fuera de su turno) no descuenta esta vez.
  function contarEstados(estados, campos, o){
    const lista = estados || [], c = campos || {hp: 'hpTurno', stacks: 'stacksTurno'};
    const eventos = [], fin = new Set();
    lista.forEach(e => {
      if(!e || e.activo === false) return;
      if(e.recien){ delete e.recien; if(o && o.alEmpezar) return; }
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
  // Lo que se va AL EMPEZAR el turno del afectado (`alEmpezarTurno`, ej. Titilando, 2026-10-06): lo sacan las funciones de inicio de turno antes
  // de disparar. → {quedan, eventos}. (Sin orden de turnos, el ⟳ lo cuenta como cualquier otro: dura hasta el próximo Mantenimiento.)
  function vencerAlEmpezar(estados){
    const lista = estados || [], fin = lista.filter(e => e && e.activo !== false && e.alEmpezarTurno);
    return {quedan: lista.filter(e => !fin.includes(e)), eventos: fin.map(e => ({tipo: 'fin', nombre: e.nombre}))};
  }
  /* Bolsillo de emergencia (cinturón, 2026-10-06, dueño): al bajar del 25 % de la vida (sin llegar a 0), se toma sola la poción de curación que más
     cura del cinturón, una vez por combate. `emergenciaCruza(antes, ahora, max)`: ¿cruzó el 25 % hacia abajo? `pocionEmergencia(cinturon)`: cuál. */
  const emergenciaCruza = (antes, ahora, max) => n(max) > 0 && n(ahora) > 0 && n(ahora) < n(max) * 0.25 && n(antes) >= n(max) * 0.25;
  const pocionEmergencia = cinturon => (cinturon || []).filter(i => i && n(i.curahp) > 0 && n(i.unidades) > 0).sort((a, b) => n(b.curahp) - n(a.curahp))[0] || null;
  // Titilando (2026-10-06): un estado listo para agregar a quien vuelve de estar caído. `presets` = la lista en la forma de esa herramienta
  // (estadosPresetFicha / estadosPresetCreep). Se agrega con agregarEstado (si ya lo tenía, se renueva).
  // (2026-10-08, dueño: Titilando = Invulnerable): el revivido queda Invulnerable hasta que empieza su próximo turno (y por ser invulnerable, titila).
  function estadoTitilando(presets){
    const pre = (presets || []).find(p => p && p.invulnerable && !p.soloSistema);
    return pre ? {id: 'tit' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), activo: true, ...structuredClone(pre), turnos: 1, permanente: false,
      alEmpezarTurno: true, titilando: true, detalle: 'Recién revivido: invulnerable (no recibe daño ni debuffs) hasta que empieza su próximo turno. En el mapa, titila.'} : null;
  }
  // ¿Titila? Cualquier estado activo que da invulnerabilidad (dueño: «asociar la animación de titilar a la invulnerabilidad en general»).
  const titila = estados => (estados || []).some(e => e && e.activo !== false && (e.invulnerable || e.titilando || /^(invulnerable|titilando)$/i.test(String(e.nombre || '').trim())));
  /* P177 (dueño, 2026-10-08): los turnos de un estado bajan AL EMPEZAR el turno de quien lo tiene, antes de que pegue — así uno de N turnos dura
     N rondas completas desde que se aplica. Lo recién puesto lleva `recien` (agregarEstado): si se lo pusieron en su propio turno, el fin de ese
     turno se lo saca (terminarTurnoEstados) y su próximo inicio ya descuenta; si se lo pusieron fuera de su turno, su próximo inicio no descuenta
     (le toca el turno entero) y el siguiente sí. Al empezar: cuenta y después dispara lo que sigue (veneno, regeneración…). */
  function empezarTurnoEstados(estados, campos){
    const k = contarEstados(estados, campos, {alEmpezar: true});
    const d = dispararEstados(k.quedan, {...(campos || {}), todos: k.quedan});
    return {hp: d.hp, quedan: k.quedan, terminados: k.terminados, eventos: [...k.eventos, ...d.eventos]};
  }
  function terminarTurnoEstados(estados){
    (estados || []).forEach(e => { if(e && e.recien) delete e.recien; });
    return {hp: 0, quedan: estados || [], terminados: [], eventos: []};
  }
  // El pase de turno de siempre (⟳ Mantenimiento, sin orden de turnos): dispara (lo que no se disparó al aplicarse) y cuenta.
  function pasarTurnoEstados(estados, campos){
    const d = dispararEstados(estados, campos), k = contarEstados(estados, campos);
    return {hp: d.hp, quedan: k.quedan, terminados: k.terminados, eventos: [...d.eventos, ...k.eventos]};
  }
  // Recién puesto (r = lo que devolvió agregarEstado): si es nuevo o se renovó, se dispara ya. → {hp, eventos}; la vida la aplica quien lo puso.
  // `campos.hpActual` (opcional): la vida de quien lo recibe; si está caído (0), una cura no entra (curaQueEntra).
  function dispararAlAplicar(r, estados, campos){
    if(!r || !r.ok || !r.estado || (r.que !== 'nuevo' && r.que !== 'renovado')) return {hp: 0, eventos: []};
    const d = dispararEstados([r.estado], {...(campos || {}), todos: estados});
    if(campos && campos.hpActual !== undefined && d.hp > 0 && n(campos.hpActual) <= 0) return {hp: 0, eventos: [...d.eventos, {tipo: 'caido', nombre: r.estado.nombre}]};
    return d;
  }
  /* Una cura no levanta a un caído (dueño, 2026-10-06: «una poción de cura normal no revive a alguien inconsciente; tiene que ser un efecto
     que diga revivir»): con la vida en 0, lo que sume vida no entra (el daño sí, aunque ya no baja de 0). Para levantarlo: ✚ Revivir, un Ankh,
     un efecto que reviva (y ahí queda Titilando). → lo que entra de `delta`. Igual para personajes, invocaciones y creeps. */
  const curaQueEntra = (hpActual, delta) => (n(delta) > 0 && n(hpActual) <= 0 ? 0 : n(delta));
  const CAIDO_TXT = 'está caído: una cura no lo levanta (hace falta revivirlo)';
  // El reporte en texto llano (Mesa del personaje, 📜 Historial del GM), un renglón por cosa que pasó.
  const fmtN = x => Number.isInteger(x) ? String(x) : String(Math.round(x * 100) / 100);
  function reporteTurno(eventos){
    return (eventos || []).map(ev => {
      if(ev.tipo === 'escudo') return `${ev.nombre}: vida extra ${fmtN(ev.de)} → ${fmtN(ev.a)}`;
      if(ev.tipo === 'inmune') return `${ev.nombre}: no le hizo efecto (inmunidad)`;
      if(ev.tipo === 'resfuego') return `${ev.nombre}: Res. fuego ${fmtN(ev.res)} le saca ${fmtN(ev.de - ev.a)} (de ${fmtN(ev.de)} a ${fmtN(ev.a)})`;
      if(ev.tipo === 'hp') return `${ev.nombre}: ${ev.hp > 0 ? '+' : '−'}${fmtN(Math.abs(ev.hp))} HP${ev.stacks > 1 ? ` (${fmtN(ev.stacks)} stacks)` : ''}`;
      if(ev.tipo === 'stacks') return `${ev.nombre}: stacks ${fmtN(ev.de)} → ${fmtN(ev.a)}`;
      if(ev.tipo === 'turnos') return `${ev.nombre}: ${fmtN(ev.de)} → ${fmtN(ev.a)} turno${ev.a === 1 ? '' : 's'}`;
      if(ev.tipo === 'vence') return `${ev.nombre}: ${fmtN(ev.de)} → 0 turnos, se terminó`;
      if(ev.tipo === 'fin') return `${ev.nombre}: se terminó`;
      if(ev.tipo === 'caido') return `${ev.nombre}: no cura a un caído`;
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
    // Paso fantasma (anillo, 2026-10-06): si en esta ronda se movió 3 casilleros o más (lo sabe el mapa: window.mapaCasillerosRonda).
    const casilleros = !!tokenId && typeof window !== 'undefined' && typeof window.mapaCasillerosRonda === 'function' ? n(window.mapaCasillerosRonda(tokenId)) : 0;
    if(casilleros >= 3){ const v = n(valorDe('pasofantasma')); if(v){ val += v; partes.push(`${fmtN(v)} Paso fantasma`); } }
    return {val, txt: partes.join(' · ')};
  }
  /* Las mecánicas «con chance» de las piezas (dueño, 2026-10-04): Retirada limpia, Inamovible, Recuperarse rápido, Reflejos de mangosta. El stat
     va en %, tope 100 (100 = siempre, sin tirar). El dado (dueño, 2026-10-06): 10 % d10, 13 % d8, 17 % d6, 20 % 2 en d10, 25 % d4, 33 % 2 en d6,
     50 % moneda (d2) — en general, el dado que da justo ese porcentaje y, si ninguno, el más cercano (a igual, el más chico). `chanceDado(pct)` →
     {caras, exitos} o null (siempre / nunca); `chanceTexto(pct)` → «33 % (5–6 en d6)», «50 % (2 en d2)» o «siempre». (`retirada*`: los
     mismos, con el nombre con el que nacieron.) */
  const chancePct = v => Math.max(0, Math.min(100, Math.round(n(v))));
  const CHANCE_CARAS = [2, 4, 6, 8, 10, 20];
  function chanceDado(v){
    const pct = chancePct(v);
    if(pct <= 0 || pct >= 100) return null;
    let mejor = null;
    CHANCE_CARAS.forEach(caras => {
      const exitos = Math.min(caras - 1, Math.max(1, Math.round(pct * caras / 100))), err = Math.abs(exitos * 100 / caras - pct);
      if(!mejor || err < mejor.err - 0.6) mejor = {caras, exitos, err};
    });
    return {caras: mejor.caras, exitos: mejor.exitos};
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
  // Desarmado (2026-10-07): tampoco puede atacar con su arma hasta levantarla (la misma pregunta, en el mismo lugar).
  const esDesarmado = e => !!e && e.activo !== false && (e.desarmado || /^desarm(ado|e)$/i.test(String(e.nombre || '').trim()));
  const preguntaSentado = (estados, nombre) => (estados || []).some(e => e && e.activo !== false && e.sentado)
    ? (nombre ? `${nombre} está Sentado y no puede atacar. ¿Atacar igual?` : 'Estás Sentado: no podés atacar. ¿Atacar igual?')
    : (estados || []).some(esDesarmado) ? (nombre ? `${nombre} está Desarmado: se le cayó el arma (levantarla cuesta 1 No2). ¿Atacar igual?` : 'Estás Desarmado: se te cayó el arma (levantarla cuesta 1 No2). ¿Atacar igual?')
    : '';
  // Lo que se «levanta» pagando No2 (2026-10-07): primero el cuerpo (Sentado, 1 No2 menos Levantarse rápido), después el arma (Desarmado, 1 No2).
  // → {est, arma} o null.
  function levantable(estados){
    const act = (estados || []).filter(e => e && e.activo !== false);
    const s = act.find(e => e.sentado);
    if(s) return {est: s, arma: false};
    const d = act.find(esDesarmado);
    return d ? {est: d, arma: true} : null;
  }
  const COSTO_LEVANTAR_ARMA = 1;
  /* «Ignora N de Resistencia a crítico» de un arma (2026-10-03, pedido del dueño): el campo `ignoraResistCrit` del arma (también el viejo
     efecto al golpear «Ignora N de Res. crítico», que no se aplicaba solo). El duelo se lo resta a la Resistencia del defensor antes de
     calcular el crítico (lo pide al atacante con statsCritico). `arma` = {ignoraResistCrit, efectosGolpe} (un creep o una invocación: sus
     campos armaIgnoraResistCrit / armaEfectos). */
  /* Rasgos de un arma (2026-10-03, mecánicas de firma): lo que el arma cambia en CÓMO se ataca —no el daño ni los efectos al golpear—.
     espalda {pdg, fijo, critpot} · ignoraResistCrit N · sinParry (no se puede parrear) · oporGratis (el ataque de oportunidad no cuesta No2) ·
     ahorroNitros N (el primer ataque del turno con ella cuesta N menos) · critD20 N (N d20 más al tirar el crítico). Un ítem los lleva sueltos; un
     creep o una invocación, en `armaRasgos` (los campos viejos armaEspalda / armaIgnoraResistCrit también cuentan).
     arco (2026-10-09, dueño; docs/rework-armas-rango.md): el arma de rango es un arco — suma la mitad del Dmg (ver dmgDelArma).
     recarga N (2026-10-10, dueño: las ballestas): un arma de rango que no es arco cobra el disparo N, 2N, 3N… No2 (ver recargaDe).
     perfora N (2026-10-10, dueño: «la gracia de la ballesta es perforar»): el golpe ignora N puntos de la Defensa (no toda; con crítico no hace
     falta). Cualquier arma puede traerla; se suma a la de la flecha o el virote. La aplica el mapa con el daño (ataque.perfora). */
  const RASGOS_ARMA = ['espalda', 'ignoraResistCrit', 'sinParry', 'oporGratis', 'ahorroNitros', 'critD20', 'arco', 'ideal', 'tiroAlto', 'sinTiroAlto', 'recarga', 'perfora', 'apuntada', 'cargada', 'atraviesaEscudos'];
  /* Rasgos de ballesta con el mapa (2026-10-10, dueño; docs/ideas-ballestas.md): **apuntada N** (+N PdG si no te moviste en el turno: el mapa lo
     suma al apuntar), **cargada** (llega cargada: el primer disparo del turno es gratis si no disparaste con ella el turno anterior; ver
     cargadaGratis) y **atraviesaEscudos** (si te paran el disparo con un escudo, el escudo se abolla: 1 stack de Armadura rota; lo hace el mapa). */
  const cargadaGratis = (arma, previos, descargada) => !!(arma && (arma.cargada || (arma.armaRasgos && arma.armaRasgos.cargada)) && n(previos) === 0 && !descargada);
  /* Cuánto del Dmg (la Fuerza) suma el daño de un arma (2026-10-09, dueño): cuerpo a cuerpo, entero; un arco, la mitad redondeada para arriba;
     cualquier otra de rango (ballesta, pólvora), nada. `arma` = {armaDeRango, arco} (un ítem; de un creep o una invocación: armaDeRango y
     armaRasgos.arco). */
  const esArco = arma => !!(arma && arma.armaDeRango && (arma.arco || (arma.armaRasgos && arma.armaRasgos.arco)));
  function dmgDelArma(arma, dmg){
    const v = n(dmg);
    if(!arma || !arma.armaDeRango) return v;
    return esArco(arma) ? Math.ceil(v / 2) : 0;
  }
  /* La Recarga (2026-10-10, dueño; docs/rework-armas-rango.md): la ballesta es lenta — el primer disparo del turno cuesta N No2, el segundo 2N, el
     tercero 3N… (1 = rápida o de repetición, 2 = la común, 3 = de asedio), en vez de Tipo ÷ 2 y después el Tipo. Solo en un arma de rango que no
     sea arco. 0 = sin Recarga (cobra como cualquier arma). El ataque de oportunidad con ella cuesta N (lo de un primer disparo). */
  const RECARGA_NOMBRE = {1: 'rápida', 2: 'común', 3: 'de asedio'};
  function recargaDe(arma){
    if(!arma || !arma.armaDeRango || esArco(arma)) return 0;
    const r = Math.round(n(arma.recarga || (arma.armaRasgos && arma.armaRasgos.recarga)));
    return r > 0 ? Math.min(5, r) : 0;
  }
  /* La munición especial (2026-10-10, dueño): el arco dispara flechas y la ballesta (un arma con Recarga), virotes. Las dos van en el carcaj
     (`flecha` en el ítem; un virote lleva `flecha.virote = true`) y comparten la mecánica («¿Qué flecha?», Perfora, efectos, daño híbrido). */
  const municionDe = arma => esArco(arma) ? 'flecha' : recargaDe(arma) ? 'virote' : '';
  const esVirote = it => !!(it && it.flecha && it.flecha.virote);
  const sirveLaMunicion = (arma, it) => { const m = municionDe(arma); return !!m && !!(it && it.flecha) && (m === 'virote') === esVirote(it); };
  const recargaTxt = r => `Recarga ${r}${RECARGA_NOMBRE[r] ? ` (${RECARGA_NOMBRE[r]})` : ''}: ${[1, 2, 3].map(k => k * r).join(', ')}… No2`;
  // El texto de cuánto Dmg suma («arco: la mitad del Dmg» / «de rango: no suma Dmg»; cuerpo a cuerpo, '').
  const dmgDelArmaTxt = arma => !arma || !arma.armaDeRango ? '' : esArco(arma) ? 'arco: suma la mitad del Dmg' : 'de rango: no suma Dmg';
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
    return {nombre: x.armaNombre || '', tipoDado: n(x.armaTipo) || 8, armaDeRango: !!x.armaDeRango, efectosGolpe: x.armaEfectos || [], ...r};
  }
  // Lo que el ataque lleva al duelo por su arma: el bono por la espalda y «no se puede parrear».
  function ataqueDeArma(arma){
    const o = {};
    if(arma && arma.espalda) o.espalda = arma.espalda;
    if(arma && arma.sinParry) o.sinParry = true;
    if(esArco(arma)) o.arco = true;   // el mapa pide la distancia mínima del arco al elegir el objetivo (no viaja al duelo)
    if(arma && arma.armaDeRango && arma.ideal) o.ideal = arma.ideal;   // la distancia ideal y el tiro alto: los usa el mapa al apuntar
    if(tieneTiroAlto(arma)) o.tiroAlto = true;
    if(n(arma && arma.perfora) > 0) o.perfora = Math.min(5, Math.round(n(arma.perfora)));   // Perfora N del arma (la suma el mapa al daño)
    if(arma && arma.armaDeRango && n(arma.apuntada) > 0) o.apuntada = Math.min(5, Math.round(n(arma.apuntada)));   // +N PdG si no se movió (el mapa)
    if(arma && arma.armaDeRango && arma.atraviesaEscudos) o.atraviesaEscudos = true;
    return o;
  }
  /* La distancia ideal de un arma de rango (sweet spot, 2026-10-09, dueño): `ideal = {donde: 'cerca' | 'medio' | 'lejos' | 'franja', ancho,
     desde, hasta, pdg, crit, critpot, fijo, ignora}`. «Cerca» = justo después de la distancia mínima; «medio» = la mitad del alcance; «lejos» = las
     últimas casillas del alcance (se mueven con el Rango de quien la usa); «franja» = de `desde` a `hasta`. El objetivo adentro → el bono del tiro.
     Ubicarse cuesta No2: es el balance (dueño). */
  const IDEAL_DONDE = {cerca: 'cerca', medio: 'a media distancia', lejos: 'lejos', franja: 'en una franja fija'};
  function franjaIdeal(ideal, alcance){
    if(!ideal) return null;
    const min = ARCO_LIBRES + 1, ancho = Math.max(1, Math.round(n(ideal.ancho) || 2)), al = Math.max(min, Math.round(n(alcance)));
    if(ideal.donde === 'franja') return {desde: Math.max(1, Math.round(n(ideal.desde))), hasta: Math.max(Math.round(n(ideal.desde)), Math.round(n(ideal.hasta)))};
    if(ideal.donde === 'lejos') return {desde: Math.max(min, al - ancho + 1), hasta: al};
    if(ideal.donde === 'medio'){ const c = Math.round((min + al) / 2), d = Math.max(min, c - Math.floor((ancho - 1) / 2)); return {desde: d, hasta: d + ancho - 1}; }
    return {desde: min, hasta: min + ancho - 1};   // cerca
  }
  const BONOS_IDEAL = ['pdg', 'crit', 'critpot', 'fijo', 'ignora'];
  // El bono del tiro si el objetivo está en la distancia ideal (o null): {pdg, crit, critpot, fijo, ignora, motivo}.
  function bonoIdeal(arma, distancia, alcance){
    const id = arma && arma.ideal, f = franjaIdeal(id, alcance), d = n(distancia);
    if(!f || d < f.desde || d > f.hasta) return null;
    const o = {motivo: 'distancia ideal'};
    BONOS_IDEAL.forEach(k => { if(n(id[k])) o[k] = Math.round(n(id[k])); });
    return Object.keys(o).length > 1 ? o : null;
  }
  function idealTxt(ideal){
    if(!ideal) return '';
    const b = [n(ideal.pdg) ? `PdG +${n(ideal.pdg)}` : '', n(ideal.crit) ? `Crítico frecuente +${n(ideal.crit)}` : '', n(ideal.critpot) ? `Crítico potente +${n(ideal.critpot)}` : '',
      n(ideal.fijo) ? `+${n(ideal.fijo)} de daño` : '', n(ideal.ignora) ? `ignora ${n(ideal.ignora)} de Res. crítico` : ''].filter(Boolean).join(', ');
    const donde = ideal.donde === 'franja' ? `de ${n(ideal.desde)} a ${n(ideal.hasta)} casilleros` : `${IDEAL_DONDE[ideal.donde] || 'cerca'} (franja de ${Math.max(1, Math.round(n(ideal.ancho) || 2))})`;
    return `Distancia ideal ${donde}: ${b || 'sin bono'}`;
  }
  // El tiro alto (2026-10-09, dueño): pasa por encima de los tokens del medio (no de los Sólidos), con el objetivo a TIRO_ALTO_MIN o más y PdG −2.
  const TIRO_ALTO_MIN = 4, TIRO_ALTO_PDG = -2;
  // Todos los arcos lo tienen (mecánica de firma, dueño 2026-10-09) salvo que el arco traiga `sinTiroAlto` (una debilidad que lo abarata); otra
  // arma de rango, solo si trae `tiroAlto`.
  const tieneTiroAlto = arma => !!(arma && arma.armaDeRango && (esArco(arma) ? !(arma.sinTiroAlto || (arma.armaRasgos && arma.armaRasgos.sinTiroAlto)) : (arma.tiroAlto || (arma.armaRasgos && arma.armaRasgos.tiroAlto))));
  /* El arco y la distancia (2026-10-09, dueño; P183 abierta para la mesa): con el arco hacen falta al menos ARCO_LIBRES casilleros libres entre
     el arquero y el objetivo (el objetivo a ARCO_LIBRES + 1 o más), no se pega cuerpo a cuerpo y no se hacen ataques de oportunidad.
     2026-10-10 (dueño): 1 casillero libre — el arco no pega al lado, pero a 2 sí (antes eran 2 libres: objetivo a 3 o más). */
  const ARCO_LIBRES = 1;
  const arcoLibresTxt = () => ARCO_LIBRES === 1 ? '1 casillero libre' : `${ARCO_LIBRES} casilleros libres`;
  const arcoMuyCerca = (arma, distancia) => esArco(arma) && n(distancia) <= ARCO_LIBRES;
  const sirveDeOportunidad = arma => !esArco(arma);
  // Costos con los rasgos: el primer ataque del turno con el arma (ahorroNitros) y el ataque de oportunidad (oporGratis).
  const costoConAhorro = (costo, arma, previos) => Math.max(0, costo - (n(previos) === 0 ? n(arma && arma.ahorroNitros) : 0));
  const costoEspecial = (tipoDado, arma, tipo) => tipo === 'oportunidad' && arma && arma.oporGratis ? 0 : recargaDe(arma) || costoPrimerAtaque(tipoDado);
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
    const rc = recargaDe(o.arma);   // una ballesta: su Recarga (o.arma, opcional)
    return `<div class="hint">${e(o.nombre)}</div>
    ${b('normal', `⚔ Ataque normal — ${n(o.normal)} No2<br><span class="hint">${rc ? e(recargaTxt(rc)) : o.primero ? (o.primeroTxt || 'primer ataque del turno (Tipo ÷ 2)') : (o.siguienteTxt || 'Tipo completo (ya atacó este turno)')}</span>`)}
    ${b('oportunidad', `🏃 Ataque de oportunidad — ${n(o.especialOpor ?? o.especial)} No2<br><span class="hint">${o.especialOpor === 0 ? 'gratis con esta arma' : rc ? `lo de un primer disparo (Recarga ${rc})` : 'siempre Tipo ÷ 2'}; no suma al conteo de ataques</span>`)}
    ${b('contra', `↩ Contraataque — ${n(o.especial)} No2<br><span class="hint">solo tras ganar un Parry y un Bloqueo; siempre Tipo ÷ 2; no suma al conteo de ataques</span>`)}`;
  }
  // `arma` (opcional): con Recarga, el disparo cuesta Recarga × (los ya hechos + 1).
  function costoAtaque(tipo, ataquesPrevios, arma){ const rc = recargaDe(arma); if(rc) return rc * (Math.max(0, Math.round(n(ataquesPrevios))) + 1); return n(ataquesPrevios) === 0 ? costoPrimerAtaque(tipo) : n(tipo); }
  // Cuántos ataques alcanzan con esos No2 (el primero a mitad de precio, los demás completos; con Recarga, N, 2N, 3N…).
  function ataquesPosibles(tipo, nitros, arma){
    const rc = recargaDe(arma);
    if(rc){ let k = 0, g = 0; while(g + rc * (k + 1) <= n(nitros)){ g += rc * (k + 1); k++; } return k; }
    const t = n(tipo), p = costoPrimerAtaque(t); return n(nitros) < p ? 0 : 1 + (t > 0 ? Math.floor((n(nitros) - p) / t) : 0);
  }

  // El Parry cuesta siempre 1 No2, con cualquier arma o escudo (2026-09-26, dueño). Sin arma ni escudo no se puede (P121).
  function costoParry(){ return 1; }
  /* Escudos de Buena calidad (2026-10-06, dueño: «programá todas las mecánicas nuevas»). Parada fácil: el primer Parry de cada turno no cuesta
     No2 (`paradafacil`; la marca del turno la lleva cada uno). Bloqueo firme: +N al Bloqueo contra el primer golpe que recibe en el turno
     (`bloqueofirme`; la marca es la misma de la Defensa contra el primer golpe). valorDe(stat) → el valor de ese stat de quien se defiende. */
  function parryGratis(valorDe, usado){ return !usado && n(valorDe('paradafacil')) > 0; }
  function bloqueoFirme(valorDe, yaRecibio){ return yaRecibio ? 0 : Math.max(0, Math.round(n(valorDe('bloqueofirme')))); }
  // Un escudo de verdad (para el Muro de escudos): un ítem de la ranura de escudo que no es un orbe.
  const esEscudo = it => !!it && /^escudo/.test(String(it.tipoItem || '')) && !it.orbe;
  // El orbe salvaje al usar una varita, con el d6 ya tirado: el Común, con 1 te hace 1 de daño y con 6 sale doble; el domado (Buena calidad,
  // `orbeSalvaje: 'domado'`), con 1 no pasa nada y con 5 o 6 sale doble.
  function orbeSalvaje(o, d){
    const domado = !!o && o.orbeSalvaje === 'domado';
    return {domado, dano: !domado && d === 1 ? 1 : 0, doble: domado ? d >= 5 : d === 6};
  }
  /* No2 en negativo por defenderse (2026-10-06, dueño, a probar): las defensas que cuestan No2 (Parry, la Evasión que paga el sobrepeso, el
     dodge roll) se pueden hacer sin No2: quedás en negativo y esa deuda se descuenta en la próxima recarga (`recargarNo2`). Solo las defensas;
     todo lo demás sigue sin poder pasar de 0. Se avisa muy claro: a quien la hace, un cartel; a los demás, la Crónica (`avisarDeudaNo2`, que
     usa `window.avisoDeudaNo2` si la pantalla lo define —el mapa—; si no, un toast). */
  // Levantarse de Sentado (1 No2) menos lo de «Levantarse rápido» (botas de jinete, 2026-10-06).
  const costoLevantarse = valorDe => Math.max(0, 1 - n(valorDe ? valorDe('levantarse') : 0));
  // `estados` (2026-10-08, dueño): con Parálisis recarga 1 No2 menos.
  const paralizado = estados => activos(estados).some(e => e.paralisis);
  function recargarNo2(max, actual, estados){
    const base = n(actual) < 0 ? n(max) + n(actual) : n(max);
    return paralizado(estados) ? Math.min(base, Math.max(base - 1, Math.min(0, base))) : base;
  }
  function avisarDeudaNo2(o){
    if(!o || n(o.quedan) >= 0) return;
    try{ if(typeof window !== 'undefined' && typeof window.avisoDeudaNo2 === 'function'){ window.avisoDeudaNo2(o); return; } }catch(e){}
    if(typeof toast === 'function') toast(`⚠ ${o.nombre ? o.nombre + ': ' : ''}sin No2 para ${o.accion}: queda en ${o.quedan} No2 (se descuenta en la próxima recarga)`);
  }
  /* Parry y Bloqueo: SOLO con un arma o un escudo de verdad (regla del dueño, 2026-09-30, "hasta que diga lo contrario").
     Sin nada no hay opción, y un arma natural (garras, colmillos, puños…) tampoco la da por ahora: sería circunstancial y
     narrativo, se evalúa más adelante. Recibe {arma: {nombre, peso}|null, natural, escudos: [{nombre, peso}]} y devuelve
     con qué se para (el arma si es de verdad, si no el primer escudo) o null. El Bloqueo suma el peso de eso. */
  /* El arco y los disparos (2026-10-09, dueño): con un arma de rango no se parrea (`o.arco`: desde 2026-10-10, cualquier arma de rango), y un disparo (flecha, virote, bala) solo se para con un
     escudo (`o.soloEscudo`: el ataque es de rango; ver contraDisparo). */
  function armaParaDefensa(o){
    o = o || {};
    if(o.arma && o.arma.nombre && !o.natural && !o.arco && !o.soloEscudo) return o.arma;
    return (o.escudos || []).find(e => e && e.nombre) || null;
  }
  const SIN_ARMA_DEFENSA = 'Sin un arma o un escudo no hay Parry ni Bloqueo (un arma natural tampoco, por ahora)';
  // ¿El ataque del duelo es un disparo? (un arma de rango, no una habilidad): contra eso, Parry solo con escudo (2026-10-09, dueño).
  const contraDisparo = d => !!(d && d.ataque && d.ataque.rango && d.ataque.tipo !== 'habilidad');
  // ¿Sirve este ítem para parrear? Solo un arma cuerpo a cuerpo o un escudo: ninguna de rango (arco, ballesta, pólvora; dueño, 2026-10-10:
  // «la ballesta, en cuanto al Parry, es igual que un arco: solo se parrea con armas de melee»); contra un disparo, solo un escudo.
  // Las varitas y los orbes tampoco parrean (dueño, 2026-10-10: «mucho menos las varitas»); un báculo (arma especial a dos manos) sí.
  const esVarita = it => !!(it && it.especial && it.tipoItem !== 'arma_2m');
  const sirveParaParry = (item, disparo) => !(item && (item.armaDeRango || item.orbe || esVarita(item))) && (!disparo || esEscudo(item));
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

  /* ---------- Vida extra y Vida extra: cambiar el valor a mano (2026-09-24, dueño) ----------
     El texto puede ser un número (valor nuevo), +N / −N (sumar o restar) o «max N» (cambia el máximo). `max === null` =
     vida extra (valor neto, sin tope ni «max N»). Devuelve {max, actual} o null si el texto no se entiende. */
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
  // Lo que se pone (o se renueva o se acumula) queda `recien`: su primer inicio de turno no le descuenta si se lo pusieron fuera de su turno (P177).
  function agregarEstado(estados, nuevo, o){
    const r = agregarEstado0(estados, nuevo, o);
    if(r && r.ok && r.estado && r.que !== 'yaLoTiene' && !r.estado.origenItem && !r.estado.derivado) r.estado.recien = true;
    return r;
  }
  function agregarEstado0(estados, nuevo, o){
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
    // Vida extra (dueño, 2026-10-07: «quiero que se sumen»): otra Vida extra no reemplaza a la que había — se suma, cada una con su duración
    // (queda aparte en la lista; el daño se come primero la que vence antes). Antes (P137) reemplazaba.
    if(nuevo.excedenteVida && n(nuevo.escudoMagico) > 0 && estados.some(e => e && e.excedenteVida && e.nombre === nuevo.nombre && e.activo !== false)){
      if(nuevo.escudoMagicoActual === undefined) nuevo.escudoMagicoActual = n(nuevo.escudoMagico);
      estados.push(nuevo);
      return {ok: true, que: 'nuevo', sumado: true, estado: nuevo};
    }
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
    if(o && o.armaNatural && esDesarmado(est)) return 'Arma natural';   // (dueño, 2026-10-08): no se le cae — su arma es parte del cuerpo
    const act = activos(estados);
    if(act.some(e => e.invulnerable)) return 'Invulnerable';
    if(est.esCC && act.some(e => e.inmunidadCC)) return 'Inmunidad a CC';
    if(est.esVeneno && act.some(e => e.sangrePura)) return 'Sangre pura';
    if(est.esSangrado && act.some(e => e.coagulacionExtrema)) return 'Coagulación';
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
  // Hasta dónde llega (casilleros; 0 = sin límite, no resalta). `stat(id)` da el Rango ('rng') de quien la usa. En automático, lo especial
  // (PdG.Esp, Ef.Esp) usa el Rango y el resto no resalta. El rango lo da la Destreza, siempre (dueño, 2026-10-07): ya no hay Rango de casteo
  // del Especial; una habilidad vieja con alcance 'casteo' usa el Rango.
  function alcanceHab(c, statTira, stat){
    const modo = c && c.alcance !== undefined ? c.alcance : 'auto';
    const v = id => { const x = Number(stat ? stat(id) : 0); return Number.isFinite(x) ? Math.max(0, Math.round(x)) : 0; };
    if(modo === 'casteo' || modo === 'rango') return v('rng');
    if(modo === 'adyacente') return 1;
    if(modo === 'ilimitado') return 0;
    if(modo === 'fijo') return Math.max(0, Math.round(nf(c.alcanceN)));
    return statTira === 'pdgmg' || statTira === 'dmgesp' ? v('rng') : 0;
  }
  /* La cura con dados (2026-10-07, dueño: Varita de cura 1d10, cura mayor 2d8): `cura` puede ser un número o una fórmula («1d10», «2d8+1»);
     la fórmula se tira acá, una vez, al armar la Ejecución (el resto del camino —duelo, ficha, mapa, creeps— sigue recibiendo un número).
     → {cura, formula, rolls} o null. */
  const ES_FORMULA_CURA = /^\s*\d*d\d+(\s*[+-]\s*\d+)?\s*$/i;
  function curaTirada(v){
    if(typeof v === 'string' && ES_FORMULA_CURA.test(v) && typeof tirarDados === 'function'){
      const r = tirarDados(v.replace(/\s+/g, ''));
      if(r) return {cura: Math.max(0, Math.round(nf(r.total))), formula: v.replace(/\s+/g, ''), rolls: r.rolls || []};
    }
    return null;
  }
  // Un efecto de la Ejecución, en la forma que usa el cuadro del duelo (y el estado que pone, `spec`).
  function efectoDeEjecucion(e){
    // «Pierde No2» (2026-10-02, Sonic Boom): el objetivo pierde `no2` (+ la diferencia entre las tiradas) No2; en 0, Sentado.
    // La purga (2026-10-07, Varita de la purga): le saca el estado malo más reciente (el mapa elige cuál: js/13 dueloAplicarEfecto).
    if(e && e.purga) return {nombre: 'Purga', caras: 1, exitos: 1, spec: null, purga: true, detalle: 'Le saca el estado malo más reciente.'};
    if(e && e.no2 !== undefined) return {nombre: 'Pierde No2', caras: 1, exitos: 1, spec: null, no2: Math.max(0, Math.round(nf(e.no2))), no2Dif: !!e.no2Dif, no2Sentado: !!e.no2Sentado,
      detalle: `Pierde ${nf(e.no2)}${e.no2Dif ? ' + la diferencia' : ''} No2${e.no2Sentado ? '; si se queda sin No2, queda Sentado' : ''}.`};
    // Con probabilidad (2026-10-05, armas especiales): `caras`/`exitos` como los efectos de un arma (33 % = 5 o 6 en d6: el duelo tira un d3 como d6); sin eso, entra siempre.
    const caras = Math.max(1, Math.round(nf(e.caras)) || 1);
    return {nombre: e.nombre || (e.cura ? 'Curación' : ''), caras, exitos: Math.min(caras, Math.max(1, Math.round(nf(e.exitos)) || 1)),
      ...(nf(e.vuela) > 0 ? {vuela: Math.round(nf(e.vuela))} : {}),
      ...(nf(e.empuja) > 0 ? {empuja: Math.round(nf(e.empuja))} : {}),   // lo empuja N casillas, lejos de quien la usa (2026-10-08, ráfaga helada, vendaval)   // el arma vuela N casillas (el Desarmado de la Varita del desarme, 2026-10-07)
      spec: e.cura ? null : {nombre: e.nombre, turnos: e.turnos, mods: e.stat ? [{stat: e.stat, val: nf(e.val)}] : e.mods,
        polaridad: e.stat ? (nf(e.val) >= 0 ? 'buff' : 'debuff') : (e.escudo ? 'buff' : undefined), hp: e.hp, stacks: e.stacks, escudoMagico: e.escudo},
      ...(() => { const t = curaTirada(e.cura); return t ? {cura: t.cura, detalle: `${e.detalle ? e.detalle + ' ' : ''}Cura ${t.formula}: ${t.rolls.length ? '[' + t.rolls.join(', ') + '] = ' : ''}${t.cura}.`.slice(0, 200)} : {cura: nf(e.cura), detalle: e.detalle || ''}; })()};
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
    // Regla (dueño, 2026-10-08): lo que se invoca con magia y puede hacer crítico (`critTipo`: la púa de hielo, el canto rodado) tira PdG, como un
    // golpe común (Destreza); todo lo demás, PdG.Esp.
    const stat0 = c.tira !== undefined ? c.tira : (h.tiradaStat || '');
    const stat = nf(c.critTipo) > 0 && stat0 === 'pdgmg' ? 'pdg' : stat0;
    const tipo = c.tipoDano || 'arcano';
    // «El daño de tu arma» (2026-10-02, Daño en área): la fórmula del arma de quien la usa (`o.armaDano`, la que tira «Daño»).
    const formula = c.danoArma ? formulaDanoHab({tiradaExtra: o.armaDano || ''}, c, o.X) : formulaDanoHab(h, c, o.X);
    return {
      nombre: h.nombre, objetivo: c.objetivo || 'enemigo',
      alcance: c.objetivo === 'uno mismo' || c.objetivo === 'area' || c.objetivo === 'onda' || c.objetivo === 'cono' || c.objetivo === 'linea' ? 0 : alcanceHab(c, stat, o.stat),
      tira: c.tiraFormula ? {formula: sx(c.tiraFormula), etq: c.tiraEtiqueta || 'Tirada'} : (stat ? {stat, etq: etq(stat), bono: nf(h.tiradaBono)} : null),
      contra: (c.contra || []).map(s => ({modo: s, stat: s, etq: etq(s)})),
      // Daño «la diferencia» (2026-10-02, Drenar Vida): no se tira, es lo que quien la usa le ganó a la resistencia. «Drena»: quien la
      // usa se cura lo que hizo de daño, y puede pasar su vida máxima hasta `drenaTope` % (como Vida extra).
      // Daño directo (ignora la Defensa especial: proyectiles chicos) y True Damage (ignora toda defensa y la Res. elemental): dueño, 2026-10-07.
      dano: c.dano && (formula || c.danoDiferencia) ? {formula: c.danoDiferencia ? '' : formula, tipo, ignoraDef: c.trueDamage ? true : c.ignoraDano !== undefined ? !!c.ignoraDano : tipo !== 'fisico',
        ...(c.trueDamage ? {trueDamage: true} : c.danoDirecto && tipo !== 'fisico' ? {directo: true} : {}),
        ...(c.danoDiferencia ? {diferencia: true} : {}), ...(c.drena ? {drena: true, drenaTope: Math.max(0, nf(c.drenaTope)), ...(nf(c.drenaPct) > 0 && nf(c.drenaPct) < 100 ? {drenaPct: Math.round(nf(c.drenaPct))} : {})} : {})} : null,   // drenaPct: cura solo ese % (2026-10-07, la Sanguijuela)
      efectos: (c.efectos || []).map(efectoDeEjecucion),
      ...(c.objetivo === 'area' || c.objetivo === 'onda' ? {radio: nf(c.radio)} : {}),
      ...(c.objetivo === 'linea' ? {largo: Math.max(1, Math.round(nf(c.largo)) || 4)} : {}),   // línea recta desde quien la usa (2026-10-05, Varita láser)
      ...((c.objetivo === 'onda' || c.objetivo === 'cono') && c.ondaDodge ? {dodge: true} : {}),   // la onda o el cono que deja dodge roll (Daño en área, Ráfaga arcana)
      ...(c.objetivo === 'onda' && c.conVista ? {conVista: true} : {}),   // la luz (2026-10-05, Varita de la luz): solo los que ve (los sólidos la tapan)
      // Tercera tanda de armas especiales (2026-10-05): lo que deja en el suelo un área (bola de fuego, ventisca), el −1 por casillero (pelea
      // cercana), lo que atrae (gancho, con la Fuerza del objetivo contra el Ef.Esp de quien la usa), los dos misiles que se reparten y el
      // crítico de lo físico invocado (Tipo de su familia: estaca 4, canto rodado 10).
      ...(c.zonaQueda ? {zonaQueda: {...c.zonaQueda, ...(c.zonaQueda.tira && o.stat ? {tiraValor: Math.round(nf(o.stat(c.zonaQueda.tira)))} : {})}} : {}),
      ...(c.menosDistancia ? {menosDistancia: true} : {}),
      ...(c.menosPorOrden ? {menosPorOrden: true} : {}),   // −1 a cada uno de los siguientes en la línea (2026-10-08, láser largo)
      ...(c.despeja ? {despeja: true} : {}),   // apaga el fuego y despeja la niebla que toca (2026-10-08, vendaval)
      // El riesgo (2026-10-08, Varita inestable): si en los dados del daño sale `si` (un 1), quien la usa se hace `dano`.
      ...(c.riesgo ? {riesgo: {si: Math.max(1, Math.round(nf(c.riesgo.si)) || 1), dano: String(c.riesgo.dano || '2d4'), ...(c.riesgo.porCada ? {porCada: true} : {})}} : {}),
      ...(c.fuegoAmigo ? {fuegoAmigo: true} : {}),   // un área que también agarra a los aliados (2026-10-07, Bola de fuego mayor)
      ...(c.atrae ? {atrae: {casillas: Math.max(1, Math.round(nf(c.atrae.casillas)) || 2), contra: c.atrae.contra || 'fue', ...(o.stat ? {tiraValor: Math.round(nf(o.stat(c.atrae.tira || 'dmgesp')))} : {})}} : {}),
      ...(c.reparte ? {reparte: {cada: String(c.reparte.cada || '1d4'), total: Math.max(2, Math.round(nf(c.reparte.total)) || 2)}} : {}),
      ...(nf(c.critTipo) ? {critTipo: Math.round(nf(c.critTipo))} : {}),   // la luz (2026-10-05, Varita de la luz): solo los rivales en sigilo que alcanza
      // Rayo en cadena (2026-10-05, Varita de chispa eléctrica): si el golpe entra, salta `saltos` veces al más cercano del mismo bando a
      // `rango` casillas o menos, la mitad cada salto (P118: la misma regla de ⚡ Rayo en cadena del token y de la trampa Descarga).
      ...(c.cadena ? {cadena: {saltos: Math.max(1, Math.round(nf(c.cadena.saltos)) || 2), rango: Math.max(1, Math.round(nf(c.cadena.rango)) || 3), ...(c.cadena.efectos ? {efectos: true} : {})}} : {}),   // efectos: también a los que salta (2026-10-07)
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
  const TIPO_DANO_NOMBRE = {arcano: 'arcano', fuego: 'de fuego', hielo: 'de hielo', rayo: 'eléctrico', toxico: 'tóxico', fisico: 'físico'};
  function zonaDeHab(h, c, o){
    o = o || {};
    const dif = !!(c.dano && c.danoDiferencia);
    return {tipo: 'zona-persistente-habilidad', fichaId: o.fichaId, casteadorTipo: o.tipo, nombre: h.nombre,
      radio: Math.max(1, nf(c.radio) || 1), zonaTurnos: Math.max(1, nf(c.zonaTurnos) || 3), zonaAmiga: !!c.zonaAmiga, zonaAltura: c.zonaAltura || '',
      zonaEstado: zonaEstadoDe(c, o), zonaDano: c.dano && !dif ? formulaDanoHab(h, c, o.X) : (dif && c.danoSuma ? String(c.danoSuma) : ''),   // con «la diferencia», `danoSuma` se le suma (miasma: + 1d4)
      zonaIgnoraDef: c.dano ? (c.ignoraDano !== undefined ? !!c.ignoraDano : (c.tipoDano || 'arcano') !== 'fisico') : false,
      zonaDirecto: !!(c.dano && (c.danoDirecto || c.trueDamage) && (c.tipoDano || 'arcano') !== 'fisico'),   // daño directo: no lo frena la Defensa especial (2026-10-07)
      zonaDanoDif: dif, zonaDanoTipo: c.dano ? (TIPO_DANO_NOMBRE[c.tipoDano || 'arcano'] || '') : '',
      zonaTiraExtra: c.dano && c.danoExtra ? String(c.danoExtra) : '', zonaNota: c.efectoLibre ? (o.X === undefined || o.X === null ? String(c.efectoLibre) : sustituirX(String(c.efectoLibre), o.X)) : '',
      resistStat: (c.contra && c.contra[0]) || '', resistValor: o.resistValor === undefined ? null : o.resistValor,
      // La tirada de la zona (2026-10-02, P143): el stat de quien la crea y su VALOR en ese momento; el mapa lo tira cada vez que la zona
      // afecta a alguien (antes se tiraba una sola vez al ejecutar: `resistValor`, que sigue valiendo para las zonas viejas).
      tiraStat: c.tira || '', tiraValor: Number.isFinite(o.tiraValor) ? Math.round(o.tiraValor) : null,
      ...(c.niebla ? {niebla: true} : {}),   // la niebla (2026-10-05, Varita de niebla): tapa la vista, no hace nada más
      ...(/^#[0-9a-fA-F]{6}$/.test(c.zonaColor || '') ? {zonaColor: c.zonaColor} : {}),
      // (2026-10-08) cada paso adentro la dispara (campo de estática); afecta enseguida a los que ya están adentro («aparece bajo los pies»);
      // es una luz (luz flotante: ilumina y deja ver lo oculto mientras dura).
      ...(c.zonaCadaPaso ? {zonaCadaPaso: true} : {}), ...(c.zonaInmediata ? {zonaInmediata: true} : {}), ...(c.zonaLuz ? {zonaLuz: true} : {}),
      ...(c.zonaEnMantenimiento === false ? {zonaEnMantenimiento: false} : {}),   // solo al pisarla (el campo de estática), no por quedarse
      // La forma (2026-10-08): 'linea' (muro de fuego: inicio y hacia dónde sigue) o 'camino' (chorro de lava: casilla por casilla, cada una pegada
      // a la anterior, la primera a ⅓ de tu Rango), de `zonaLargo` casillas. Sin forma: la flor de siempre.
      ...(['linea', 'camino'].includes(c.zonaForma) ? {zonaForma: c.zonaForma, zonaLargo: Math.max(2, Math.min(8, Math.round(nf(c.zonaLargo)) || 3))} : {})};
  }
  // El estado que deja la zona. Si se suelta contra un stat de quien la tira (2026-10-07, Varita de arena movediza: Fuerza contra tu Ef.Esp) y es el
  // mismo stat que tira la zona, la dificultad es ese valor al crearla.
  function zonaEstadoDe(c, o){
    const e = c.zonaEstado || null;
    if(!e || !e.soltar || !e.soltar.difStat || e.soltar.difStat !== c.tira || !Number.isFinite(o.tiraValor)) return e;
    return {...e, soltar: {...e.soltar, dif: Math.max(1, Math.round(o.tiraValor))}};
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
      // La tirada para evitarla o para soltarse, contra un stat de quien la coloca (dueño, 2026-10-07: la trampa portal, Res.Esp contra tu
      // Ef.Esp): `salvacion.difStat` / `soltar.difStat`. Sin `valorDe`, queda la dificultad fija que traiga (`dif`).
      ['salvacion', 'soltar'].forEach(k => {
        if(!t[k] || !t[k].difStat) return;
        const d = Number(valorDe(t[k].difStat));
        if(Number.isFinite(d)) out[k] = {...t[k], dif: Math.max(1, Math.round(d) + Math.round(n(t[k].difMas)))};   // `difMas`: + N (la trampa portal Buena: tu Ef.Esp + 2)
      });
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
      spec: e.cura ? null : {nombre: e.nombre, turnos: e.turnos, mods: e.stat ? [{stat: e.stat, val: nf(e.val)}] : e.mods, polaridad: e.stat ? (nf(e.val) >= 0 ? 'buff' : 'debuff') : undefined,
        ...(nf(e.stacks) > 0 ? {stacks: Math.round(nf(e.stacks))} : {})},   // (Sangrado de N: Tajear, 2026-10-10)
      cura: nf(e.cura), detalle: e.detalle || ''});
    const critico = c.critico ? {
      ...(c.critico.efectos && c.critico.efectos.length ? {efectos: c.critico.efectos.map(mapEf)} : {}),
      ...(c.critico.efectosNota ? {efectosNota: sx(c.critico.efectosNota)} : {}),
    } : null;
    // Por la espalda (2026-10-03): lo del arma más lo de la habilidad (`arma.espaldaPdg/Fijo/Critpot` del ✨, ej. Backstab).
    const ESP = {pdg: 'espaldaPdg', fijo: 'espaldaFijo', critpot: 'espaldaCritpot'};
    const esp = Object.keys(ESP).reduce((acc, k) => { const v = nf(arma.espalda && arma.espalda[k]) + nf(a[ESP[k]]); if(v > 0) acc[k] = v; return acc; }, {});
    const perfora = Math.min(5, Math.round(nf(arma.perfora) + nf(a.perfora)));   // Perfora: la del arma + la de la habilidad (Tajear, 2026-10-10)
    return {tipo: 'habilidad-arma', habNombre: h.nombre, armaId: arma.id || '', armaNombre: arma.nombre || '', tipoDado: arma.tipoDado, rango: !!arma.rango,
      alcance: o.alcance, sinParry: !!a.sinParry || !!arma.sinParry, ...(Object.keys(esp).length ? {espalda: esp} : {}), ...(perfora > 0 ? {perfora} : {}),
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

  /* Elementos (2026-10-04, dueño): el daño de un elemento se frena con la resistencia a ese elemento (Res. fuego…) y con la Defensa especial
     (que resta TODO daño mágico, arcano o elemental). `elementoDe(texto)` reconoce el elemento en el tipo de un daño ('Fuego', 'de fuego',
     'tóxico'…) → 'fuego' | 'hielo' | 'rayo' | 'toxico' | 'acido' | ''. */
  const ELEMENTOS = {fuego: {etq: 'Res. fuego', icono: '🔥'}, hielo: {etq: 'Res. hielo', icono: '❄'}, rayo: {etq: 'Res. eléctrica', icono: '⚡'},   // «eléctrico» en lo que se ve (dueño, 2026-10-07: «rayo» es un haz); el id sigue `rayo`
    toxico: {etq: 'Res. tóxico', icono: '☠'}, acido: {etq: 'Res. ácido', icono: '🧪'}};
  /* Las cinco resistencias elementales en la Botonera y en Equipo y mochila (dueño, 2026-10-06: debajo de las resistencias a crítico), igual para
     personajes, invocaciones y creeps. `valorDe(el)` → el número; `lupa(el)` → el botón 🔍 (o ''). Mismas clases que la fila de crítico. */
  function resElementalesHtml(valorDe, lupa){
    const tiles = Object.keys(ELEMENTOS).map(el => {
      const v = n(valorDe(el)), etq = ELEMENTOS[el].etq.replace('Res. ', '');
      const titulo = `${ELEMENTOS[el].etq}: se resta al daño de ${etq}${v < 0 ? ' — negativa: vulnerable, ese daño entra de más' : ''} (no se tira)`;
      return `<div class="botonera-tile bt-info" title="${titulo}">${lupa ? lupa(el) : ''}<span class="bt-label">${ELEMENTOS[el].icono} ${etq.charAt(0).toUpperCase() + etq.slice(1)}</span><span class="bt-value"${v < 0 ? ' style="color:#e07a6a"' : ''}>${v < 0 ? '−' + fmtN(-v) : fmtN(v)}</span></div>`;
    }).join('');
    return `<div class="botonera-crit"><div class="botonera-crit-t">Resistencias elementales</div><div class="botonera-crit-grid">${tiles}</div></div>`;
  }
  // «Res. eléctrica 2» o, si es negativa, «Res. eléctrica −2 (vulnerable)»: lo que se muestra al restarla del daño (2026-10-06).
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
  // La Defensa especial (ex Defensa especial; dueño, 2026-10-07, P169) frena TODO el daño especial, también el tóxico (antes, 2026-10-05, el
  // tóxico no). Lo que no frena: el daño directo (proyectiles chicos) y el True Damage — eso lo decide quien aplica el daño, no el elemento.
  const frenaArmaduraMagica = () => true;

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
  /* Un arma especial con modos (2026-10-08, Varita gemela: aceite o bola de fuego): cada modo es como un arma aparte —su propia casilla en la Botonera,
     su costo y lo que hace— con id «<id>~<n>» y `_modoDe` = el id de la varita (los usos del turno y las cargas se cuentan en la varita). */
  function especialesConModos(items){
    const out = [];
    (items || []).forEach(it => {
      const e = (it && it.especial) || {};
      if(!Array.isArray(e.modos) || !e.modos.length){ out.push(it); return; }
      const {modos, ...base} = e;
      modos.forEach((m, k) => out.push({...it, id: `${it.id}~${k}`, _modoDe: it.id, detalle: m.detalle || it.detalle,
        especial: {...base, ...m, nombre: `${it.nombre}: ${m.nombre || 'modo ' + (k + 1)}`}}));
    });
    return out;
  }
  /* El caos (2026-10-08, Varita del caos): los estados que puede sortear y cuánto duran (docs/estados-turnos.md, la propuesta que corrige el
     dueño: si cambia ahí, cambia acá). `spec` lista para EstadosAplicar (turnos de quien la usa; cantidades fijas donde el preset pregunta). */
  const CAOS_ESTADOS = {
    buff: [{nombre: 'Regeneración', turnos: 3, hp: 2}, {nombre: 'Hypeado', turnos: 2}, {nombre: 'Crítico frecuente', turnos: 2}, {nombre: 'Crítico potente', turnos: 2},
      {nombre: 'Invulnerable', turnos: 1}, {nombre: 'Inmunidad a CC', turnos: 2}, {nombre: 'Espinas', turnos: 3}, {nombre: 'Espejo', turnos: 3},
      {nombre: 'Vida extra', turnos: 3, escudoMagico: 10}, {nombre: 'Barrera', turnos: 2, escudoMagico: 8}, {nombre: 'Afortunado', turnos: 2},
      {nombre: 'Sangre pura', turnos: 3}, {nombre: 'Coagulación', turnos: 3}, {nombre: 'Blindado', turnos: 2}, {nombre: 'Inamovible', turnos: 2},
      {nombre: 'Sigilo'}],   // (dueño, 2026-10-08: el Sigilo también entra; dura hasta que lo descubran)
    debuff: [{nombre: 'Veneno', stacks: 4}, {nombre: 'Sangrado', turnos: 2}, {nombre: 'Quemadura', turnos: 3}, {nombre: 'Escarcha', turnos: 2},
      {nombre: 'Armadura rota'}, {nombre: 'Pajaritos', turnos: 2}, {nombre: 'Cansado', turnos: 2}, {nombre: 'Exhausto', turnos: 1},
      {nombre: 'Stun', turnos: 1}, {nombre: 'Confusión', turnos: 2}, {nombre: 'Lisiado', turnos: 2}, {nombre: 'Inmovilizado', turnos: 1},
      {nombre: 'Rengo', turnos: 2}, {nombre: 'Lento', turnos: 2}, {nombre: 'Miedo', turnos: 2}, {nombre: 'Provocado', turnos: 1},
      {nombre: 'Parálisis', turnos: 1}, {nombre: 'Silencio', turnos: 1}, {nombre: 'Ceguera', turnos: 1}, {nombre: 'Marcado', turnos: 2}, {nombre: 'Sentado'},
      {nombre: 'Desarmado', vuela: 2}],   // como la Expelliarmus: el arma vuela 2 casillas a un lado al azar
  };
  /* El d20 del caos (dueño, 2026-10-08, segunda vuelta): `caos = {exito}` (la Común 10, la Buena 8). Lo que se quiere es, a un aliado, un buff;
     a un rival, un debuff. 20: sale bien y quien la usa elige cuál; exito…19: sale bien, al azar; 2…exito−1: sale al revés (al mismo objetivo), al
     azar; 1: sale al revés y elige cuál el bando contrario. → {que: 'buff'|'debuff', a: 'objetivo', bien, elige: 'propio'|'rival'|''}. */
  function caosResultado(d20, aliado, caos){
    // Una copia vieja de la varita (la del d10: {exito: 6, contra, propio}) se juega como la Común nueva.
    const ex = caos && caos.contra !== undefined ? 10 : Math.min(19, Math.max(2, n(caos && caos.exito) || 10)), d = n(d20);
    const bien = d >= 20 || (d > 1 && d >= ex);
    // 'rival' = el bando contrario a quien la usa: si la usa un jugador, el GM; si la usa un creep, los jugadores (dueño, 2026-10-08).
    return {que: aliado === bien ? 'buff' : 'debuff', a: 'objetivo', bien, elige: d >= 20 ? 'propio' : d <= 1 ? 'rival' : ''};
  }
  // `excluir`: nombres que no pueden salir (el Desarmado contra un arma natural).
  const caosEstado = (pol, azar, excluir) => { const l = (CAOS_ESTADOS[pol] || []).filter(e => !(excluir || []).includes(e.nombre)); return structuredClone(l[Math.floor((azar || Math.random)() * l.length)] || l[0]); };
  const AHORRO_ESPECIAL = {oportunidad: 'oporahorro', contra: 'contraahorro', contraataque: 'contraahorro'};
  function ahorroEspecial(tipo, valorDe){
    const st = AHORRO_ESPECIAL[tipo];
    return st && typeof valorDe === 'function' ? Math.max(0, Math.round(n(valorDe(st)))) : 0;
  }
  /* Cuánto No2 cuesta el ataque de un duelo y por qué (2026-10-08, dueño: «que diga cuántos nitros va a descontar, con el ? que explique de dónde
     sale»). o = {tipoArma, hechos (ataques ya hechos con esa arma / en el turno), costo, tiene (No2 que tiene), ataque: 'normal'|'oportunidad'|'contra'|
     'habilidad-arma'} → {no2, lineas}. Lo usan los ganchos `vista` de personajes, creeps e invocaciones. */
  function costoAtaqueLineas(o){
    const t = Math.round(n(o.tipoArma)) || 8, costo = Math.max(0, Math.round(n(o.costo))), mitad = Math.ceil(t / 2);
    if(o.ataque === 'habilidad-arma') return {no2: 0, lineas: ['Los No2 de este ataque ya los cobró la habilidad.']};
    const rc = recargaDe(o.arma);
    if(rc){   // una ballesta (o.arma, opcional): Recarga N → N, 2N, 3N…
      const h = Math.max(0, Math.round(n(o.hechos))), especial = o.ataque === 'oportunidad' || o.ataque === 'contra';
      if(!especial && h === 0 && Math.round(n(o.costo)) === 0 && o.arma && (o.arma.cargada || (o.arma.armaRasgos && o.arma.armaRasgos.cargada)))   // llega cargada (2026-10-10)
        return {no2: 0, lineas: ['Llega cargada: este disparo es gratis (no disparó con ella el turno anterior)', recargaTxt(rc)]};
      const base = especial ? rc : rc * (h + 1), l = [recargaTxt(rc)];
      l.push(especial ? `${o.ataque === 'contra' ? 'Contraataque' : 'Ataque de oportunidad'}: lo de un primer disparo = ${rc}; no cuenta como disparo del turno`
        : h ? `Ya disparó ${h === 1 ? 'una vez' : `${h} veces`} este turno: el disparo ${h + 1}.º = ${rc} × ${h + 1} = ${base}` : `Primer disparo del turno: ${rc}`);
      if(costo !== base) l.push(`${costo < base ? 'Ahorro' : 'Recargo'} (arma, equipo o estados): ${costo < base ? '−' : '+'}${Math.abs(base - costo)}`);
      l.push(`Cuesta ${costo} No2 · tiene ${Math.round(n(o.tiene))}${costo > n(o.tiene) ? ' (no le alcanzan: pregunta y deja seguir)' : ''}`);
      return {no2: costo, lineas: l};
    }
    const l = [`Tipo del arma: ${t}`];
    if(o.ataque === 'oportunidad' || o.ataque === 'contra') l.push(`${o.ataque === 'contra' ? 'Contraataque' : 'Ataque de oportunidad'}: lo de un primer ataque (Tipo ÷ 2${t % 2 ? ', para arriba' : ''} = ${mitad}); no cuenta como ataque del turno`);
    // `porArma`: un personaje cuenta el primer ataque por arma (cada arma tiene el suyo a mitad de precio).
    else if(n(o.hechos) > 0) l.push(`Ya atacó ${n(o.hechos) === 1 ? 'una vez' : `${Math.round(n(o.hechos))} veces`} ${o.porArma ? 'con esta arma' : ''} este turno: Tipo completo = ${t}`.replace('  ', ' '));
    else l.push(`Primer ataque ${o.porArma ? 'con esta arma' : 'del turno'}: Tipo ÷ 2${t % 2 ? ', para arriba' : ''} = ${mitad}`);
    const base = o.ataque === 'oportunidad' || o.ataque === 'contra' ? mitad : n(o.hechos) > 0 ? t : mitad;
    if(costo !== base) l.push(`${costo < base ? 'Ahorro' : 'Recargo'} (arma, equipo o estados): ${costo < base ? '−' : '+'}${Math.abs(base - costo)}`);
    l.push(`Cuesta ${costo} No2 · tiene ${Math.round(n(o.tiene))}${costo > n(o.tiene) ? ' (no le alcanzan: pregunta y deja seguir)' : ''}`);
    return {no2: costo, lineas: l};
  }

  // Áreas por diámetro (dueño, 2026-10-08: «radio 1» se entendía como una sola casilla). Adentro se sigue guardando el radio (los anillos
  // alrededor del centro: 0 = una casilla, 1 = la flor de 7, 2 = 19…); lo que se lee dice el diámetro y cuántas casillas son.
  const diametro = radio => 2 * Math.max(0, Math.round(nf(radio))) + 1;
  const casillasArea = radio => { const r = Math.max(0, Math.round(nf(radio))); return 3 * r * (r + 1) + 1; };
  function areaTxt(radio){
    const r = Math.max(0, Math.round(nf(radio)));
    return r ? `diámetro ${diametro(r)} (${casillasArea(r)} casillas)` : 'una casilla (diámetro 1)';
  }
  // Las opciones de un <select> de tamaño: el valor es el radio, el texto dice el diámetro.
  function diametroOpciones(radio, o = {}){
    const min = o.min !== undefined ? o.min : 0, actual = Math.max(min, Math.round(nf(radio)));
    const max = Math.max(o.max !== undefined ? o.max : 6, actual);
    let h = '';
    for(let r = min; r <= max; r++) h += `<option value="${r}"${r === actual ? ' selected' : ''}>Diámetro ${diametro(r)} · ${r ? `${casillasArea(r)} casillas${r === 1 ? ' (una flor)' : ''}` : 'una casilla'}</option>`;
    return h;
  }

  /* Curar estados por grupo (P180, dueño 2026-10-08: «crear un ítem para cada debuff es un pésimo diseño: agruparlos conceptualmente… para tener
     consumibles útiles y que la única salida no sea el Cura Plus, y que el Cura Plus además sea caro»). Un consumible con `curaEstados: ['heridas']`
     saca, al usarlo, los estados de ese grupo; `['todo']` (el Cura Plus) saca los de todos los grupos. Lo que no está en ningún grupo no se cura con
     un consumible: tiene su propia salida (Armadura rota se repara, Desarmado se levanta el arma, Sentado se levanta, Inmovilizado se suelta;
     Silencio, Marcado y Mareo de invocación se esperan). Un estado nuevo que se pueda curar: sumarlo a su grupo acá. */
  const GRUPOS_CURA = {
    heridas: {label: 'Heridas', estados: ['Sangrado', 'Lisiado', 'Rengo']},
    venenos: {label: 'Venenos', estados: ['Veneno', 'Veneno severo'], patron: /veneno|toxic/},   // cualquier veneno, también los que vengan
    mente: {label: 'Mente e ilusiones', estados: ['Confusión', 'Miedo', 'Provocado', 'Ceguera']},
    aturdimiento: {label: 'Aturdimiento', estados: ['Pajaritos', 'Stun']},
    elementales: {label: 'Elementales', estados: ['Quemadura', 'Escarcha', 'Parálisis']},
    fatiga: {label: 'Fatiga', estados: ['Cansado', 'Exhausto', 'Lento']},
  };
  const normEstado = t => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  // El grupo de un estado (por su nombre), o ''.
  function grupoCuraDe(nombre){
    const n = normEstado(nombre);
    if(!n) return '';
    for(const [k, g] of Object.entries(GRUPOS_CURA)){
      if(g.estados.some(e => { const x = normEstado(e); return n === x || n.startsWith(x + ' '); }) || (g.patron && g.patron.test(n))) return k;
    }
    return '';
  }
  // Qué cura un ítem: la lista de grupos (['todo'] = todos), o [] si no cura estados.
  // (Una copia vieja de Vendas, Antídoto o Cura Plus en una mochila no trae `curaEstados`: se la reconoce por el nombre.)
  const CURA_POR_NOMBRE = {'vendas': ['heridas'], 'antidoto': ['venenos'], 'cura plus': ['todo']};
  function curaDeItem(it){
    if(!it) return [];
    const lista = Array.isArray(it.curaEstados) ? it.curaEstados : (CURA_POR_NOMBRE[normEstado(it.nombre)] || []);
    return lista.includes('todo') ? Object.keys(GRUPOS_CURA) : lista.filter(k => GRUPOS_CURA[k]);
  }
  // Saca de la lista los estados de esos grupos. → {quedan, sacados: [nombres]}. No toca los buffs ni lo que no está en un grupo.
  function curarEstados(estados, grupos){
    const g = new Set(grupos || []), quedan = [], sacados = [];
    (estados || []).forEach(e => { const k = e && grupoCuraDe(e.nombre); if(k && g.has(k)) sacados.push(e.nombre); else quedan.push(e); });
    return {quedan, sacados};
  }
  // El texto de lo que cura un ítem: «Heridas (Sangrado, Lisiado, Rengo)».
  const textoCura = grupos => grupos.map(k => `${GRUPOS_CURA[k].label} (${GRUPOS_CURA[k].estados.join(', ')})`).join(' · ');

  return {cargadaGratis, esVarita, municionDe, esVirote, sirveLaMunicion, recargaDe, recargaTxt, RECARGA_NOMBRE, arcoLibresTxt, GRUPOS_CURA, grupoCuraDe, curaDeItem, curarEstados, textoCura, costoAtaqueLineas, diametro, casillasArea, areaTxt, diametroOpciones, especialesConModos, CAOS_ESTADOS, caosResultado, caosEstado, levantable, esDesarmado, COSTO_LEVANTAR_ARMA, curaTirada, ES_FORMULA_CURA, emergenciaCruza, pocionEmergencia, resElementalesHtml, curaQueEntra, CAIDO_TXT, vencerAlEmpezar, estadoTitilando, titila, pdgExtraArma, ahorroEspecial, aManoEspecial, ELEMENTOS, elementoDe, esMagicoTipo, frenaArmaduraMagica, ROLES, PESOS_ROL, ROL_DE_CLASE, repartirAtributos, mitadesDeTirada, aplicarMitades, estadosQueParten, tirarStat, afortunado, estadosQueAfectan, pasarTurnoEstados, empezarTurnoEstados, terminarTurnoEstados, dispararEstados, contarEstados, dispararAlAplicar, estadosEnMantenimiento, fijarMarcaTurno, reporteTurno, nitrosMax, costoPrimerAtaque, ATAQUE_ESPECIAL, statAtaqueEspecial, EVA_ESPECIAL, statEvaEspecial, evaExtraDuelo, retiradaPct, retiradaDado, retiradaTexto, chancePct, chanceDado, chanceTexto, ESTADOS_TRABA, esTraba, categoriaConsumible, ranurasCinturon, entranEnCinturon, preguntaSentado, preguntaSilencio, soltarNorm, estadoSoltable, textoSoltarse, tiradaSoltarse, hundirSiFalla, menuTipoAtaqueHtml, ignoraResistCritArma, esEfectoIgnora, RASGOS_ARMA, rasgosDeItem, IDEAL_DONDE, franjaIdeal, bonoIdeal, idealTxt, TIRO_ALTO_MIN, TIRO_ALTO_PDG, tieneTiroAlto, esArco, contraDisparo, sirveParaParry, dmgDelArma, dmgDelArmaTxt, ARCO_LIBRES, arcoMuyCerca, sirveDeOportunidad, armaDeCombatiente, ataqueDeArma, costoConAhorro, costoEspecial, costoAtaque, ataquesPosibles, costoParry, recargarNo2, avisarDeudaNo2, stuneado, costoLevantarse, armaParaDefensa, SIN_ARMA_DEFENSA, BLOQUEO_SOLO_TRAS_PARRY, parryGratis, bloqueoFirme, esEscudo, orbeSalvaje,
    DUR_POR_PESO, DUR_MIN, esDurable, durPorPeso, durExtra, durBase, durMax, durTexto,
    escudoParsear, acumularVeneno, acumularSangrado, agregarEstado, ajustarPreset, efectoPermanente, inmunidad,
    marcadoEn, resElementalTxt, modoHab, tipoEjecucion, sustituirX, esCostoAtaque, costoNitrosHab, bloqueoHab, alcanceHab, efectoDeEjecucion, habEjecucion, sobreSiSinTiradas, ejecucionNoDisponible,
    formulaDanoHab, zonaDeHab, trampaDeHab, ataqueConArreglos, esFlash, FLASH_CSS, flashPara, cdFlash, costoFlash};
})();
