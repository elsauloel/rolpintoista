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
  function pasarTurnoEstados(estados, campos){
    const lista = estados || [], c = campos || {hp: 'hpTurno', stacks: 'stacksTurno'};
    const act = activos(lista);
    const invulnerable = act.some(e => e.invulnerable), sangrePura = act.some(e => e.sangrePura), coagulacion = act.some(e => e.coagulacionExtrema);
    const eventos = [], fin = new Set();
    let hp = 0;
    lista.forEach(e => {
      if(!e || e.activo === false) return;
      if(n(e.escudoMagico) > 0 && !e.excedenteVida){
        const antes = n(e.escudoMagicoActual ?? e.escudoMagico);
        if(antes < n(e.escudoMagico)) eventos.push({tipo: 'escudo', nombre: e.nombre, de: antes, a: n(e.escudoMagico)});
        e.escudoMagicoActual = n(e.escudoMagico);
      }
      const hayStacks = e.stacks !== undefined && e.stacks !== null && e.stacks !== '';
      const stacks = Math.max(1, n(e.stacks) || 1);
      let d = n(e[c.hp]) * stacks;
      if(d < 0 && (invulnerable || (e.esVeneno && sangrePura) || (e.esSangrado && coagulacion))){ eventos.push({tipo: 'inmune', nombre: e.nombre}); d = 0; }
      if(d){ hp += d; eventos.push({tipo: 'hp', nombre: e.nombre, hp: d, stacks}); }
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
    return {hp, quedan: lista.filter(e => !fin.has(e)), terminados: lista.filter(e => fin.has(e)), eventos};
  }
  // El reporte en texto llano (Mesa del personaje, 📜 Historial del GM), un renglón por cosa que pasó.
  const fmtN = x => Number.isInteger(x) ? String(x) : String(Math.round(x * 100) / 100);
  function reporteTurno(eventos){
    return (eventos || []).map(ev => {
      if(ev.tipo === 'escudo') return `${ev.nombre}: escudo especial ${fmtN(ev.de)} → ${fmtN(ev.a)}`;
      if(ev.tipo === 'inmune') return `${ev.nombre}: no le hizo efecto (inmunidad)`;
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
  function costoAtaque(tipo, ataquesPrevios){ return n(ataquesPrevios) === 0 ? costoPrimerAtaque(tipo) : n(tipo); }
  // Cuántos ataques alcanzan con esos No2 (el primero a mitad de precio, los demás completos).
  function ataquesPosibles(tipo, nitros){ const t = n(tipo), p = costoPrimerAtaque(t); return n(nitros) < p ? 0 : 1 + (t > 0 ? Math.floor((n(nitros) - p) / t) : 0); }

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
  function durMax(item){ return Math.max(DUR_MIN, Math.round(durPorPeso(item) * Math.max(0, Math.round(n(item && item.peso))))); }
  // Texto para las características del ítem: «12 (4 por punto de Peso)»; null si el ítem no tiene durabilidad.
  function durTexto(item){
    if(!esDurable(item)) return null;
    const pp = durPorPeso(item), max = durMax(item);
    const nota = max === DUR_MIN && pp * Math.max(0, Math.round(n(item.peso))) < DUR_MIN ? 'el mínimo' : `${pp} por punto de Peso${pp > DUR_POR_PESO ? ', más resistente' : pp < DUR_POR_PESO ? ', frágil' : ''}`;
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
    const clave = nuevo && nuevo.esSangrado ? 'esSangrado' : nuevo && nuevo.esEscarcha ? 'esEscarcha' : '';
    if(!clave) return null;
    const ya = (estados || []).find(e => e[clave] && e.nombre === nuevo.nombre);
    if(!ya) return null;
    ya.stacks = Math.max(1, n(ya.stacks) || 1) + 1;
    ya.activo = true;
    if(clave === 'esEscarcha') ya.turnos = Math.max(n(ya.turnos), n(nuevo.turnos));
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
    if(nuevo.activo !== false){
      const motivo = inmunidad(estados, nuevo, o);
      if(motivo) return {ok: false, que: 'bloqueado', motivo};
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
    if(Array.isArray(s.mods) && s.mods.length) base.mods = s.mods.map(m => ({stat: m.stat, val: n(m.val)}));
    if(n(s.hp)) base[campoHp || 'hpTurno'] = n(s.hp);
    if(n(s.stacks) && base.esVeneno && !base.permanente){ base.stacks = n(s.stacks); base.turnos = base.stacks; }
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
    return statTira === 'pdgmg' || statTira === 'dmgesp' ? v('rangocasteo') : 0;   // Dmg.Esp (2026-10-02): también del Especial
  }
  // Un efecto de la Ejecución, en la forma que usa el cuadro del duelo (y el estado que pone, `spec`).
  function efectoDeEjecucion(e){
    return {nombre: e.nombre || (e.cura ? 'Curación' : ''), caras: 1, exitos: 1,
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
    const formula = formulaDanoHab(h, c, o.X);
    return {
      nombre: h.nombre, objetivo: c.objetivo || 'enemigo',
      alcance: c.objetivo === 'uno mismo' || c.objetivo === 'area' || c.objetivo === 'onda' ? 0 : alcanceHab(c, stat, o.stat),
      tira: c.tiraFormula ? {formula: sx(c.tiraFormula), etq: c.tiraEtiqueta || 'Tirada'} : (stat ? {stat, etq: etq(stat), bono: nf(h.tiradaBono)} : null),
      contra: (c.contra || []).map(s => ({modo: s, stat: s, etq: etq(s)})),
      dano: c.dano && formula ? {formula, tipo, ignoraDef: c.ignoraDano !== undefined ? !!c.ignoraDano : tipo !== 'fisico'} : null,
      efectos: (c.efectos || []).map(efectoDeEjecucion),
      ...(c.objetivo === 'area' || c.objetivo === 'onda' ? {radio: nf(c.radio)} : {}),
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
      zonaEstado: c.zonaEstado || null, zonaDano: c.dano && !dif ? formulaDanoHab(h, c, o.X) : '',
      zonaIgnoraDef: c.dano ? (c.ignoraDano !== undefined ? !!c.ignoraDano : (c.tipoDano || 'arcano') !== 'fisico') : false,
      zonaDanoDif: dif, zonaDanoTipo: c.dano ? (TIPO_DANO_NOMBRE[c.tipoDano || 'arcano'] || '') : '',
      zonaTiraExtra: c.dano && c.danoExtra ? String(c.danoExtra) : '', zonaNota: c.efectoLibre ? (o.X === undefined || o.X === null ? String(c.efectoLibre) : sustituirX(String(c.efectoLibre), o.X)) : '',
      resistStat: (c.contra && c.contra[0]) || '', resistValor: o.resistValor === undefined ? null : o.resistValor};
  }
  // La trampa que coloca una habilidad, lista para el mapa: si no trae nombre propio, lleva el de la habilidad.
  function trampaDeHab(h){
    const t = h && h.trampaColocar;
    return t ? {...t, nombre: String(t.nombre || '').trim() || h.nombre} : null;
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
    return {tipo: 'habilidad-arma', habNombre: h.nombre, armaId: arma.id || '', armaNombre: arma.nombre || '', tipoDado: arma.tipoDado, rango: !!arma.rango,
      alcance: o.alcance, sinParry: !!a.sinParry,
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

  return {mitadesDeTirada, aplicarMitades, estadosQueParten, tirarStat, afortunado, estadosQueAfectan, pasarTurnoEstados, reporteTurno, nitrosMax, costoPrimerAtaque, costoAtaque, ataquesPosibles, costoParry, armaParaDefensa, SIN_ARMA_DEFENSA, BLOQUEO_SOLO_TRAS_PARRY,
    DUR_POR_PESO, DUR_MIN, esDurable, durPorPeso, durMax, durTexto,
    escudoParsear, acumularVeneno, acumularSangrado, agregarEstado, ajustarPreset, efectoPermanente, inmunidad,
    modoHab, tipoEjecucion, sustituirX, esCostoAtaque, costoNitrosHab, bloqueoHab, alcanceHab, efectoDeEjecucion, habEjecucion, sobreSiSinTiradas, ejecucionNoDisponible,
    formulaDanoHab, zonaDeHab, trampaDeHab, ataqueConArreglos, flashPara, cdFlash, costoFlash};
})();
