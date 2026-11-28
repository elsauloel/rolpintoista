/* =========================================================
   🔘 EL ESTADO EN CORTO Y EN DETALLE (compartido; hoy lo usa el mapa)
   Pedido del dueño (2026-11-23): «al poner el hover en el icono, que solamente diga sobrepeso: número, y en qué consiste… solamente el efecto. Si
   después querés ver el detalle… apretando el icono de estados alterados… ahí puedas ver el detalle de cada estado: cuál es el origen, por qué, quién
   es el caster». Y: «en los estados alterados que tengan duración, sí tienen que aparecer [los turnos que quedan] en el hover del icono».

   - `globo(e, o)` → {titulo, efecto, dura}: lo que dice el globo de un iconito alrededor del token (y cada renglón del globo del token).
     «Sobrepeso: 2» · «−2 a Evasión, salvo que pague 1 No2 · Parry/escudo/dodge roll +1 No2 · −2 a Iniciativa» · sin duración.
   - `texto(e, o)` → la misma cosa en una línea: «Quemadura 2 · Arde: pierde 2 HP por turno · quedan 2 turnos».
   - `detalle(e, o)` → {descripcion, origen: [renglones], cortada?}: para la ventana ◎ Estados alterados del token. Solo lo que el estado trae guardado
     (quién lo protege, a quién marcó, de quién tiene miedo, quién lo provocó, quién le pegó la sanguijuela, de qué arma, de qué pasiva o pieza
     viene, la cuenta del sobrepeso). Lo que hoy no se guarda (quién puso un Veneno, con qué habilidad) no se inventa: ver P314.
     La Vida extra (2026-11-26): en corto «+N de vida por encima de tu máximo» y, en el detalle, de dónde viene (o «Cargado a mano»).
   `e` = un estado como lo publica el resumen (de un personaje, una invocación o un creep). `o` = {sobre, sobreCuenta, nombreDe(id)}: el sobrepeso y
   su cuenta del resumen del personaje, y cómo nombrar un token o una ficha por su id (el Escudo elemental guarda el id de quien lo tiró).
   Funciones puras: sin pantalla ni Firebase (pruebas en comun/pruebas.html).
   ========================================================= */
const EstadoCorto = (() => {
  const n = v => Number(v) || 0;
  const f = v => { const x = Math.round(n(v) * 100) / 100; return String(x); };
  const menos = v => `−${f(Math.abs(n(v)))}`;
  const norm = s => String(s || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  // Las etiquetas de los números (las de la ficha si están; si no, estas).
  const ETQ = {def: 'Defensa', armadmg: 'Def. especial', dmg: 'Daño', dmgesp: 'Ef.Esp', pdg: 'PdG', pdgmg: 'PdG.Esp', eva: 'Evasión', parry: 'Parry',
    bloqueo: 'Bloqueo', percepcion: 'Percepción', sigilo: 'Sigilo', sp: 'SP máx.', hp: 'Vida máx.', nitros: 'No2 máx.', ini: 'Iniciativa', resmg: 'Res.Esp'};
  function etiqueta(stat){
    const t = (typeof FichaCalculo !== 'undefined' && FichaCalculo.STAT_LABEL) || (typeof CreepCalculo !== 'undefined' && CreepCalculo.STAT_LABEL) || {};
    return t[stat] || ETQ[stat] || stat;
  }

  /* Lo que hace cada estado de la lista común, en una línea (comun/estados-presets.js tiene la regla entera; esto es solo el «qué te hace»). Un estado
     que no está acá usa la primera frase de su descripción. Al sumar un estado nuevo a la lista, conviene sumarlo también acá si su descripción es larga. */
  const CORTO = {
    // (2026-11-23, dueño: «que diga cuánto cura cada turno»): los de vida por turno y los que se apilan, con su número si llegó (`vt` = la vida por
    // turno ya multiplicada por los stacks, `st` = los stacks); si no llegó, la regla por stack.
    'veneno': (vt, st) => vt ? `${menos(vt)} de vida al empezar el turno` : st > 1 ? `−${f(st)} de vida al empezar el turno` : '−1 vida por stack al empezar el turno',
    'veneno severo': vt => vt ? `${menos(vt)} de vida al empezar el turno, +1 cada turno` : 'Daño al empezar cada turno, +1 cada turno',
    'sangrado': (vt, st) => vt ? `${menos(vt)} de vida cada turno` : st > 1 ? `−${f(st)} de vida cada turno` : '−1 vida por stack cada turno',
    'quemadura': vt => `${vt ? menos(vt) : '−2'} de vida cada turno (le resta su Res. fuego)`,
    'regeneracion': (vt, st, e) => vt > 0 ? `Cura ${f(vt)} de vida cada turno` : e && e.curaDado ? `Cura ${e.curaDado} de vida cada turno` : 'Cura vida cada turno',
    'escarcha': (vt, st) => `−${f(Math.max(1, st))} a sus No2 máximos`, 'debilitado': (vt, st) => `−${f(Math.max(1, st))} a todas sus tiradas`,
    'stun': 'No puede hacer nada · Evasión 1', 'sueno': 'Dormido: no puede hacer nada · Evasión 1 · lo despierta el daño',
    'pajaritos': 'PdG, PdG.Esp y Evasión a la mitad', 'lisiado': 'PdG y Parry a la mitad', 'paralisis': 'PdG, Parry y Evasión a la mitad · recarga 1 No2 menos',
    'cansado': 'No2 máximos a 2/3', 'exhausto': 'No2 máximos a 1/3', 'hypeado': 'No2 máximos +1/3',
    'inmovilizado': 'No se puede mover', 'rengo': 'Moverse cuesta 2 No2 por casilla', 'lento': 'La 1.ª casilla de cada turno cuesta el doble de No2',
    'miedo': 'Acercarse a quien lo asustó cuesta el doble de No2 · −2 PdG y −2 daño contra él',
    'panico': 'Acercarse a un rival cuesta el doble de No2 · −2 PdG y −2 daño contra todos',
    'provocado': 'Su turno es para ir contra quien lo provocó', 'confusion': 'Antes de actuar tira 1d4: puede perder el turno o atacar a cualquiera',
    'silencio': 'No puede usar habilidades con SP', 'silenciado': 'No puede usar habilidades con SP',
    'sentado': 'Evasión a la mitad · no puede atacar · levantarse cuesta 1 No2', 'ceguera': 'Ve a 2 casillas · PdG y PdG.Esp a la mitad',
    'marcado': 'No puede entrar en sigilo · se lo ve aunque haya niebla', 'invulnerable': 'No recibe daño ni estados malos',
    'afortunado': 'PdG, Parry y Evasión: tira dos veces y se queda con la mejor', 'sigilo': 'Oculto: sus rivales no lo ven',
    'expuesto': 'Evasión a la mitad · sin Parry, oportunidad ni dodge roll', 'desarmado': 'Se le cayó el arma: levantarla cuesta 1 No2',
    'desequilibrado': 'Evasión −2', 'escalofrio': 'PdG −2', 'mente abierta': 'Res.Mt −2', 'deslumbrado': 'Res.Esp −2', 'herida sombria': 'No se cura con nada',
    'presa': 'Evasión −1 · le pegan +2 de daño', 'presa senalada': 'Evasión −2 · le pegan +4 de daño', 'coraza maldita': 'Defensa −2 y Defensa especial −2',
    'sanguijuela': 'Las curas que recibe se las lleva quien se la pegó', 'sequia': 'No recupera vida ni SP por sí mismo',
    'espinas': 'Devuelve 1/4 del daño cuerpo a cuerpo', 'espejo': 'Devuelve 1/4 del daño especial', 'etereo': 'No puede ser objetivo ni atacar',
    'llama de fenix': 'Si cae, revive con toda la vida', 'piel de hierro': '+(3 + nivel) Defensa y Defensa especial · +1 Res. a crítico',
  };
  // La descripción sin lo que no es el efecto: las notas de automatización (⚙ / ✋), los avisos (⚠), los ejemplos y de dónde viene.
  function limpiar(txt){
    let s = String(txt || '').replace(/\(Sin auditar\)\s*/gi, '').replace(/PLACEHOLDER[^.]*\.?/g, '');
    const partes = s.split(/\s*[⚙✋⚠]/);
    s = (partes[0].trim() || String(partes[1] || '').replace(/^\s*(Automatizado|A mano)[^:]*:\s*/i, '')).trim().replace(/^Viene de [^:.]*:\s*/i, '');   // «Viene de tu pasiva X: recupera 3…» → «Recupera 3…»
    s = s.charAt(0).toUpperCase() + s.slice(1);
    const frases = s.split(/(?<=[.!?])\s+/).map(x => x.trim()).filter(Boolean)
      .filter(x => !/^(Ej\.|Ejemplo|Viene de|Se va sol|Se saca|Regla provisoria)/i.test(x));
    // Solo la primera frase (lo que hace); la segunda, únicamente si la primera es muy corta («Arde.»). Las reglas finas, en la ventana ◎.
    let out = frases[0] || '';
    if(out && out.length < 18 && frases[1] && (out + ' ' + frases[1]).length <= 160) out += ' ' + frases[1];
    // «Frenético: +3 a la PdG…» → «+3 a la PdG…» (el nombre o la imagen antes de los dos puntos sobra cuando después vienen los números).
    const c = out.indexOf(':');
    if(c > 0 && c < 35 && /[\d+−]/.test(out.slice(c + 1))) out = out.slice(c + 1).trim();
    // Largo: sin los paréntesis y, si sigue largo, cortado en la última coma antes de ~110 letras.
    if(out.length > 110) out = out.replace(/(?<![+−-])\s*\([^)]*\)/g, '');
    if(out.length > 110){
      const cut = Math.max(out.lastIndexOf(', ', 110), out.lastIndexOf('; ', 110));
      out = (cut > 50 ? out.slice(0, cut) : out.slice(0, 107).replace(/\s+\S*$/, '')) + '…';
    }
    out = out.charAt(0).toUpperCase() + out.slice(1);
    return out.replace(/[.\s]+$/, '');
  }
  function presetDe(nombre){
    const lista = typeof ESTADOS_PRESET !== 'undefined' && Array.isArray(ESTADOS_PRESET) ? ESTADOS_PRESET : [];
    const k = norm(nombre), base = k.replace(/\s*\(.*\)\s*$/, '');
    return lista.find(p => p && (norm(p.nombre) === k || norm(p.nombre) === base)) || null;
  }
  const esSobrepeso = e => !!e && norm(e.nombre) === 'sobrepeso';
  /* ❤ La Vida extra común (dueño, 2026-11-23: «la explicación de vida extra está innecesariamente larga. Se entiende bastante solo con el nombre, aunque
     está bueno que diga algo como "vida por encima de tu máximo", y que diga el origen»): en corto, cuánta es y «vida por encima de tu máximo»; en la
     ventana ◎, de dónde viene (Combatiente.vidaExtraOrigenTxt: el ítem o la habilidad, o «Cargado a mano»). Los escudos de los anillos (otro nombre) no. */
  const esVidaExtra = e => !!e && (!!e.excedente || !!e.excedenteVida) && /^(vida extra|excedente de vida)$/.test(norm(e.nombre));
  const VE_CORTO = 'Vida por encima de tu máximo';
  function veOrigenTxt(e){
    if(typeof Combatiente !== 'undefined' && Combatiente.vidaExtraOrigenTxt) return Combatiente.vidaExtraOrigenTxt(e);
    const l = (Array.isArray(e && e.fuentes) ? e.fuentes : []).filter(Boolean);
    return l.length ? `Viene de ${l.join(', ')}.` : 'Cargado a mano.';
  }
  const esArmRota = e => !!e && (!!e.armaduraRota || norm(e.nombre) === 'armadura rota');

  // El número que va al lado del nombre: el sobrepeso, o los stacks si hay más de uno (Armadura rota, siempre).
  function numero(e, o){
    if(esSobrepeso(e)){ const s = sobrepesoDe(e, o); return s > 0 ? s : null; }
    const st = n(e.stacks);
    if(esArmRota(e)) return Math.max(1, st);
    return st > 1 ? st : null;
  }
  function dura(e){
    if(!e || e.derivado) return '';
    const h = typeof Combatiente !== 'undefined' && Combatiente.hastaTxt ? Combatiente.hastaTxt(e) : (e.hasta ? 'hasta ' + e.hasta : '');
    if(h) return h;
    if(e.permanente) return '';
    const t = n(e.turnos);
    return t > 0 ? (t === 1 ? 'queda 1 turno' : `quedan ${f(t)} turnos`) : '';
  }
  // Lo que hace, en corto. Lo concreto primero (escudo, números, vida por turno); si no trae, su descripción limpia (o la del preset).
  // La vida por turno: la que llega publicada (`vidaTurno`, ya por los stacks) o, del lado del GM, la de su ficha privada (por stack × stacks).
  function vidaTurno(e){
    if(e.vidaTurno !== undefined) return n(e.vidaTurno);
    const hp = n(e.hpturno !== undefined ? e.hpturno : e.hpTurno);
    return hp * Math.max(1, n(e.stacks) || 1);
  }
  // El número del sobrepeso: el del estado, el del resumen o, de un resumen viejo, el de su descripción («Se pasa por 2…» / «Te pasás por 2…»).
  function sobrepesoDe(e, o){
    const m = String((e && e.detalle) || '').match(/pas(?:a|ás) por (\d+(?:[.,]\d+)?)/);
    return n(e && e.sobrepeso) || n(o && o.sobre) || (m ? n(m[1].replace(',', '.')) : 0);
  }
  function efecto(e, o){
    if(!e) return '';
    if(esSobrepeso(e)){
      // (2026-11-23, dueño: «Sobrepeso: X · −X a Evasión, salvo que pague 1 No2 · Parry/escudo/dodge roll +1 No2», y la Iniciativa en el mismo estilo)
      const s = sobrepesoDe(e, o);
      return s > 0 ? `−${f(s)} a Evasión, salvo que pague 1 No2 · Parry/escudo/dodge roll +1 No2 · −${f(s)} a Iniciativa`
        : 'Menos Evasión, salvo que pague 1 No2 · Parry/escudo/dodge roll +1 No2 · menos Iniciativa';
    }
    if(esArmRota(e)){
      const menosDef = [...String(e.detalle || '').matchAll(/−(\d+(?:[.,]\d+)?) Defensa/g)].reduce((a, m) => a + n(String(m[1]).replace(',', '.')), 0);
      if(e.derivado) return menosDef > 0 ? `Defensa −${f(menosDef)}` : 'Piezas abolladas: menos Defensa';
      return `Defensa −${f(Math.max(1, n(e.stacks)))}`;
    }
    if(esVidaExtra(e)){
      const v = e.escudo !== undefined && e.escudo !== null ? e.escudo : e.escudoMagicoActual !== undefined ? e.escudoMagicoActual : e.excedenteVida ? e.escudoMagico : undefined;
      return v !== undefined && v !== null ? `+${f(v)} de vida por encima de tu máximo${e.tope ? ' (tope ' + f(e.tope) + ')' : ''}` : VE_CORTO;
    }
    const vt = vidaTurno(e), st = n(e.stacks);
    const escudo = e.escudo !== undefined && e.escudo !== null ? (e.excedente ? `Vida extra +${f(e.escudo)}${e.tope ? ' (tope ' + f(e.tope) + ')' : ''}` : `Escudo ${f(e.escudo)}${e.escudoMax !== undefined ? '/' + f(e.escudoMax) : ''}`) : '';
    const p = presetDe(e.nombre);
    const c = p && CORTO[norm(p.nombre)];
    // (un estado con el nombre de la lista pero con números propios —«Debilitado (Goblin)»: Defensa −2—: van sus números, no los de la lista)
    const modsDe = l => JSON.stringify((Array.isArray(l) ? l : []).filter(m => m && m.stat && n(m.val)).map(m => [m.stat, n(m.val)]));
    const propios = Array.isArray(e.mods) && e.mods.length && modsDe(e.mods) !== modsDe(p && p.mods);
    if(c && !propios) return [escudo, typeof c === 'function' ? c(vt, st, e) : c].filter(Boolean).join(' · ');
    const partes = escudo ? [escudo] : [];
    (Array.isArray(e.mods) ? e.mods : []).filter(m => m && m.stat && n(m.val)).forEach(m => partes.push(`${etiqueta(m.stat)} ${n(m.val) > 0 ? '+' : '−'}${f(Math.abs(n(m.val)))}`));
    if(vt) partes.push(vt > 0 ? `Cura ${f(vt)} de vida cada turno` : `${menos(vt)} de vida cada turno`);
    else if(e.curaDado) partes.push(`Cura ${e.curaDado} de vida cada turno`);
    if(e.invulnerable && !partes.length) partes.push('No recibe daño');
    if(partes.length) return partes.join(' · ');
    const propio = limpiar(e.detalle);
    if(propio) return propio;
    return p ? limpiar(p.detalle) : '';
  }
  function globo(e, o){
    const num = numero(e, o || {});
    return {titulo: String((e && e.nombre) || '?') + (num !== null ? ': ' + f(num) : ''), efecto: efecto(e, o || {}), dura: dura(e)};
  }
  function texto(e, o){
    const g = globo(e, o);
    return [g.titulo, g.efecto, g.dura].filter(Boolean).join(' · ');
  }

  // El detalle para la ventana ◎: la descripción entera (sin las notas internas de ⚙/✋ que ya están en «Detalles técnicos») y de dónde viene.
  function detalle(e, o){
    o = o || {};
    const origen = [];
    const nom = id => { if(!id) return ''; try{ return (o.nombreDe && o.nombreDe(id)) || ''; }catch(err){ return ''; } };
    if(esSobrepeso(e)){
      const s = sobrepesoDe(e, o);
      if(o.sobreCuenta && typeof Combatiente !== 'undefined' && Combatiente.sobrepesoCuentaTxt){
        const c = Combatiente.sobrepesoCuentaTxt(o.sobreCuenta).replace('tu equipo pesa', 'el equipo pesa').replace('tu Carga máxima es', 'la Carga máxima es');
        origen.push(`Por qué: ${c}${s > 0 ? ` → se pasa por ${f(s)}` : ''}.`);
      }else origen.push('Por qué: lleva más peso que su Carga máxima.');
      origen.push('Se va solo cuando deja de cargar de más.');
      return {descripcion: '', origen};
    }
    if(esVidaExtra(e)){
      origen.push(veOrigenTxt(e));
      const h0 = typeof Combatiente !== 'undefined' && Combatiente.hastaTxt ? Combatiente.hastaTxt(e) : '';
      if(h0) origen.push(`Dura ${h0}.`);
      return {descripcion: '', origen};
    }
    const det0 = String((e && e.detalle) || '').trim();
    const viene = det0.match(/^Viene de ([^:.]*)[:.]\s*/);   // «Viene de tu pasiva "X": …» / «Viene de tu equipo: …»
    const det = viene ? det0.slice(viene[0].length) : det0;
    if(e && e.derivado){
      if(e.area) origen.push('Viene de un área: se va solo al salir de ella.');
      else if(viene) origen.push(`Viene de ${viene[1].trim()}.`);
      else origen.push('Viene de una pasiva o del equipo: no se saca a mano.');
    }
    // Un nombre guardado se muestra salvo que sea de alguien que esta pantalla no ve (`o.oculto(id)`: un creep escondido para un jugador).
    const quien = (nombre, id) => (id && o.oculto && o.oculto(id)) ? 'alguien que no se ve' : nombre;
    if(e && (e.protegeNombre || (e.protege && nom(e.protege)))) origen.push(`Protege a ${quien(e.protegeNombre || nom(e.protege), e.protege)}.`);
    if(e && e.marcaNombre) origen.push(`Marcó a ${quien(e.marcaNombre, e.marca)}.`);
    if(e && e.miedoDeNombre) origen.push(`Le tiene miedo a ${quien(e.miedoDeNombre, e.miedoDe)}.`);
    if(e && e.provocaDeNombre) origen.push(`Lo provocó ${quien(e.provocaDeNombre, e.provocaDe)}.`);
    if(e && e.chupaNombre) origen.push(`Se la pegó ${quien(e.chupaNombre, e.chupaDe)} (la vida que chupa va para quien la pegó).`);
    if(e && e.escudoDe && nom(e.escudoDe)) origen.push(`Lo puso ${quien(nom(e.escudoDe), e.escudoDe)}.`);
    if(e && e.armaDe && e.armaDe.nombre) origen.push(`En el arma: ${e.armaDe.nombre}.`);
    const h = typeof Combatiente !== 'undefined' && Combatiente.hastaTxt ? Combatiente.hastaTxt(e || {}) : '';
    if(h) origen.push(`Dura ${h}.`);
    let desc = (det.split(/\s*[⚙✋]/)[0] || '').trim();
    const mayus = x => x.charAt(0).toUpperCase() + x.slice(1);
    /* 📜 La descripción que llegó cortada (lo que se publica se corta en 200 o 300 letras; 2026-11-26, dueño: «debería haber alguna forma de poder leer
       el texto completo»): si es la de un estado de la lista común, va entera desde ahí; si no, `cortada` (la ventana ◎ ofrece «ver entera», que la
       busca guardada: `entera`). */
    let cortada = !!desc && det0.length >= 190 && !/[.!?…)]$/.test(desc);
    if(cortada){
      const p = presetDe(e && e.nombre), pd = p ? (String(p.detalle || '').split(/\s*[⚙✋]/)[0] || '').trim() : '';
      if(pd.length > desc.length && norm(pd).startsWith(norm(desc).slice(0, 40))){ desc = pd; cortada = false; }
    }
    if(desc) desc = mayus(desc) + (cortada ? '…' : '');
    if(!desc){ const p = presetDe(e && e.nombre); desc = p ? String(p.detalle || '').split(/\s*[⚙✋]/)[0].trim() : ''; }
    return {descripcion: desc, origen, ...(cortada ? {cortada: true} : {})};
  }
  /* 📜 La descripción entera de un estado que llegó cortado: entre los estados guardados de verdad (`guardados`: los de la ficha o los del creep
     completo), el del mismo nombre cuya descripción empieza igual y es más larga. → el texto (sin «⚙ Automatizado / ✋ A mano») o ''. */
  function entera(e, guardados){
    const det0 = String((e && e.detalle) || '').trim(), corta = norm((det0.split(/\s*[⚙✋]/)[0] || '').replace(/^Viene de [^:.]*[:.]\s*/i, '')).slice(0, 40);
    const g = (Array.isArray(guardados) ? guardados : []).find(x => x && norm(x.nombre) === norm(e && e.nombre) && String(x.detalle || '').trim().length > det0.length
      && norm(String(x.detalle).replace(/^Viene de [^:.]*[:.]\s*/i, '')).startsWith(corta));
    if(!g) return '';
    const d = (String(g.detalle).trim().replace(/^Viene de [^:.]*[:.]\s*/i, '').split(/\s*[⚙✋]/)[0] || '').trim();
    return d ? d.charAt(0).toUpperCase() + d.slice(1) : '';
  }

  /* Los números de un estado para el resumen público (2026-11-23, dueño: «que diga cuánto cura cada turno… que el corto nunca pierda el número»): la vida
     por turno ya multiplicada por los stacks, los stacks, el dado de cura, sus números (mods) y el sobrepeso. `campoHp` = 'hpturno' (personaje) o
     'hpTurno' (invocación, creep). Lo usan comun/ficha-resumen.js, GM Tools (creepPublico) y el mapa (modificarCreep). */
  function pub(e, campoHp){
    if(!e) return {};
    const st = Math.max(1, n(e.stacks) || 1), vt = n(e[campoHp || 'hpturno']) * st;
    const mods = (Array.isArray(e.mods) ? e.mods : []).filter(m => m && m.stat && n(m.val)).slice(0, 8).map(m => ({stat: String(m.stat).slice(0, 20), val: n(m.val)}));
    return {...(vt ? {vidaTurno: vt} : {}), ...(st > 1 ? {stacks: st} : {}), ...(e.curaDado ? {curaDado: String(e.curaDado).slice(0, 12)} : {}),
      ...(mods.length ? {mods} : {}), ...(n(e.sobrepeso) > 0 ? {sobrepeso: n(e.sobrepeso)} : {}),
      // ❤ De dónde viene la Vida extra (2026-11-26): el ítem o la habilidad, y si una parte se cargó a mano.
      ...(Array.isArray(e.fuentes) && e.fuentes.length ? {fuentes: e.fuentes.slice(0, 4).map(x => String(x || '').slice(0, 40))} : {}), ...(e.aMano ? {aMano: true} : {})};
  }

  return {CORTO, pub, vidaTurno, limpiar, numero, dura, efecto, globo, texto, detalle, entera};
})();
if(typeof window !== 'undefined') window.EstadoCorto = EstadoCorto;
