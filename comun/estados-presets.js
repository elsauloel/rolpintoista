/* =========================================================
   PRESETS DE ESTADOS ALTERADOS (compartido: ficha, gm-tools, mapa, auditoría de skills)
   La lista ÚNICA de estados estándar del juego (Veneno, Sangrado, Stun, Vida extra…). Antes vivía copiada tres
   veces —`EFECTOS_PRESET` en ficha.html, `ESTADOS_PRESET_GM` en gm-tools.html y `DEBUFFS`/`BUFFS` en
   estados-aplicar.js— y las copias se habían ido separando (Sangrado, Afortunado, textos viejos de Inmovilizado y
   Rengo, Barrera que faltaba en gm-tools). Se juntaron el 2026-09-29 (paso 0d de `docs/plan-subida-unificada.md`).
   Para cambiar un preset o sumar uno nuevo, se toca SOLO acá.

   Forma: la de un creep (`hpTurno`, `stacksTurno`). Cada herramienta la pide adaptada a lo suyo:
   - `estadosPresetFicha()`  → ficha.html (`hpturno`, `stacksturno`; Armadura rota lleva su −1 Defensa como mod,
     que es como la ficha la cuenta: mods × stacks).
   - `estadosPresetCreep()`  → gm-tools.html y `EstadosAplicar` (con `stacks: 1, hpTurno: 0` por defecto; Armadura
     rota sin mod, porque los creeps la cuentan aparte, por acumulación).
   Los textos van en tercera persona para que sirvan igual a un personaje que a un creep.
   Las cantidades son el punto de partida: al activar un preset, `estado-preguntas.js` pregunta HP, escudo, stacks,
   bonos y turnos, así que acá lo que importa es QUÉ hace cada estado (sus marcas), no tanto sus números.
   ========================================================= */
const ESTADOS_PRESET = [
  {nombre:'Veneno', polaridad:'debuff', stacks:4, turnos:4, hpTurno:-1, stacksTurno:-1, esVeneno:true,
    detalle:'Pierde HP por stack cada turno. Se agota junto con los stacks.'},
  {nombre:'Regeneración', polaridad:'buff', stacks:1, turnos:3, hpTurno:5, stacksTurno:0,
    detalle:'Cura HP cada turno.'},
  {nombre:'Pajaritos', polaridad:'debuff', turnos:3, mitadPdgEva:true, esCC:true,
    detalle:'PdG y Evasión a la mitad (redondeado hacia abajo) mientras dure.'},
  // PLACEHOLDER (Iteración 2): Exhausto, Stun, Hypeado, Inmovilizado y Rengo
  // pasaron de Acciones/Movimiento a Nitros 1 a 1, sin recalibrar. Cansado ya
  // se recalibró (2026-09-21, P28): pierde un tercio de sus No2 máximos.
  {nombre:'Cansado', polaridad:'debuff', turnos:3, cansado:true,
    detalle:'Sus No2 máximos quedan en 2/3 (redondeado hacia abajo). Ej.: con 9 de máximo, pierde 3 y le quedan 6.'},
  {nombre:'Exhausto', polaridad:'debuff', turnos:3, exhausto:true, esCC:true,
    detalle:'Sus No2 máximos quedan en un tercio (redondeado hacia abajo). Ej.: con 9 de máximo, le quedan 3.'},
  // Stun (dueño, 2026-10-06): «el Stun es no poder hacer nada; y si te atacan, tu Evasión es 1. Punto.» No le toca los No2.
  {nombre:'Stun', polaridad:'debuff', turnos:2, stun:true, esCC:true,
    detalle:'No puede hacer nada mientras dura: ni atacar, ni moverse, ni usar habilidades o consumibles, ni hacer Parry. Si lo atacan, su Evasión es 1 (sin tirar). No le toca los No2. ⚙ Automatizado: la Evasión sale 1 sola; en el mapa, cualquier acción avisa que está stuneado (y la mesa puede dejarla pasar).'},
  {nombre:'Hypeado', polaridad:'buff', turnos:3, hypeado:true,
    detalle:'Sus No2 máximos suben un tercio del natural (redondeado hacia arriba). Ej.: con 9 de máximo, gana 3 y llega a 12; con 7, gana 3 y llega a 10.'},
  {nombre:'Armadura rota', polaridad:'debuff', stacks:1, turnos:0, permanente:true, armaduraRota:true,
    detalle:'−1 Defensa por cada acumulación (×N). Permanente y acumulable: cada rotura suma una; solo se cura con un ítem o habilidad especial (Oleo reparador la quita entera). Los ± del chip ajustan cuántas hay.'},
  {nombre:'Veneno severo', polaridad:'debuff', stacks:1, turnos:0, hpTurno:-1, stacksTurno:1, permanente:true, esVeneno:true,
    detalle:'Hace daño apenas se lo ponen y al empezar cada uno de sus turnos. Al terminar cada turno aumenta 1 el daño para el siguiente.'},
  // Sangrado (2026-09-22): N de daño = N stacks de 1 HP, así cada reaplicación suma +1 al daño por turno.
  {nombre:'Sangrado', polaridad:'debuff', stacks:2, turnos:0, hpTurno:-1, stacksTurno:0, permanente:true, esSangrado:true,
    detalle:'Pierde HP por turno. Si se lo vuelven a aplicar mientras ya lo tiene, no se duplica: suma +1 al daño por turno.'},
  // Quemadura (2026-10-04, dueño: «como un Sangrado que se resiste con resistencia a fuego»): 2 de daño por turno, 3 turnos; si lo vuelven a
  // quemar, solo vuelven a contar los turnos (no sube, para que no sea igual al Sangrado). La Res. fuego le resta a cada turno.
  {nombre:'Quemadura', polaridad:'debuff', stacks:2, turnos:3, hpTurno:-1, stacksTurno:0, esQuemadura:true,
    detalle:'Arde: pierde 2 HP por turno, 3 turnos. Si lo vuelven a quemar, vuelven a contar los turnos (no se suma). ⚙ Automatizado: su Res. fuego le resta a cada turno.'},
  // Confusión (2026-10-04, dueño): afecta a quién elige como objetivo de una acción hostil; las defensas no. ⚙ La tira el mapa (js/20).
  {nombre:'Confusión', polaridad:'debuff', turnos:2, confusion:true, esCC:true,
    detalle:'Confundido: antes de su primera acción de cada turno (moverse incluido) tira 1d4 — 1 el GM decide qué hace, 2 pierde el turno, 3 objetivo al azar entre los que ve (toda acción hostil del turno va contra él), 4 actúa normal. El resultado vale para todo el turno. Las defensas no se tocan. ⚙ Automatizado en el mapa: la tirada aparece sola.'},
  {nombre:'Lisiado', polaridad:'debuff', turnos:3, lisiado:true, esCC:true,
    detalle:'PdG y Parry a la mitad (redondeado hacia abajo) mientras dure.'},
  {nombre:'Inmovilizado', polaridad:'debuff', turnos:3, inmovilizado:true, esCC:true,
    detalle:'No se puede mover mientras dure (los Nitros siguen sirviendo para lo demás). ⚠ Regla provisoria.'},
  {nombre:'Rengo', polaridad:'debuff', turnos:3, rengo:true, esCC:true,
    detalle:'Moverse cuesta 2 Nitros por casillero mientras dure. ⚠ Valor provisorio (antes Movimiento a la mitad).'},
  // Lento (2026-10-04, dueño, con las mecánicas de los pies): el primer casillero que se mueve en cada turno cuesta el doble. Lo acorta Recuperarse rápido.
  {nombre:'Lento', polaridad:'debuff', turnos:2, lento:true, esCC:true,
    detalle:'Lento: el primer casillero que se mueve en cada turno cuesta el doble de No2 mientras dure.'},
  {nombre:'Miedo', polaridad:'debuff', turnos:2, esCC:true, mods:[{stat:'pdg', val:-2}, {stat:'dmg', val:-2}],
    detalle:'Miedo: −2 PdG y −2 Daño mientras dure, y no puede acercarse voluntariamente a quien lo asustó (✋ a mano: el jugador o el GM lo respeta; si termina su turno más cerca de la fuente pierde 1 No2). Es un control (lo reducen la resistencia a CC y la Inmunidad a CC).'},
  {nombre:'Provocado', polaridad:'debuff', turnos:2, esCC:true,
    detalle:'Provocado (Taunt): ira dirigida. Mientras dure, su turno es para ir contra quien lo provocó: atacarlo o usar contra él una habilidad hostil (si no llega, acercarse). No se cura, no se protege ni hace otra cosa en lugar de eso (✋ a mano: lo respeta el jugador o el GM). Es un control (lo reducen la resistencia a CC y la Inmunidad a CC).'},
  {nombre:'Escarcha', polaridad:'debuff', turnos:2, stacks:1, esEscarcha:true, mods:[{stat:'nitros', val:-1}],
    detalle:'Escarcha (acumulable): se le congela el impulso, −1 a sus No2 máximos por cada stack mientras dure. Cada nueva aplicación suma un stack (×2, ×3…) y renueva la duración. Fuego y hielo se cancelan entre sí (a mano). La duración la elige quien lo coloca.'},
  // 1 turno (dueño, 2026-10-08; antes 2).
  {nombre:'Parálisis', polaridad:'debuff', turnos:1, paralisis:true, esCC:true,
    detalle:'Parálisis: PdG, Parry y Evasión a la mitad (redondeado hacia abajo) mientras dure, y recarga 1 No2 menos. Mezcla de Lisiado y Pajaritos, más suave que un Stun; cada stat se parte una sola vez (no se suma a Lisiado ni a Pajaritos sobre el mismo stat).'},
  {nombre:'Crítico frecuente', polaridad:'buff', turnos:2, mods:[{stat:'crit', val:1}],
    detalle:'Crítico frecuente +1: el rango del crítico baja 1 punto (un arma Tipo 4 hace crítico con diferencia 3; mínimo 2), y también la diferencia para el doble crítico. Editá el valor para darle más puntos. La duración la elige quien lo da.'},
  {nombre:'Crítico potente', polaridad:'buff', turnos:2, mods:[{stat:'critpot', val:1}],
    detalle:'Crítico potente +1: los umbrales del d20 bajan (doble daño desde 6, triple y cuádruple más lento: 1 de cada 2 y 1 de cada 3 puntos). Editá el valor para darle más puntos. La duración la elige quien lo da.'},
  // Silencio (2026-10-04, dueño: la Runa de silencio automatizada): no puede usar habilidades que cuestan SP. Se avisa al ejecutarla y se deja seguir.
  {nombre:'Silencio', polaridad:'debuff', turnos:1, silencio:true, esCC:true,
    detalle:'Silenciado: no puede usar habilidades que cuestan SP mientras dure. ⚙ Automatizado: al ejecutar una habilidad con costo en SP, avisa (y deja seguir si la mesa lo decide).'},
  {nombre:'Sentado', polaridad:'debuff', permanente:true, turnos:0, sentado:true, esCC:true,
    detalle:'Está en el piso: su Evasión se parte a la mitad (al resultado de la tirada, redondeado hacia abajo), no puede atacar y no puede hacer dodge roll (✋ a mano). No vence solo: levantarse cuesta 1 No2 (botón Levantarse de la Botonera o de las Acciones del creep).'},
  // Desarmado (dueño, 2026-10-07, la Varita del manotazo): el arma cae en su casilla y levantarla cuesta 1 No2. Como Sentado: no vence solo.
  {nombre:'Desarmado', alias:['Desarme'], polaridad:'debuff', permanente:true, turnos:0, desarmado:true, esCC:true,
    detalle:'Se le cayó el arma: no puede atacar con ella hasta levantarla, que cuesta 1 No2 (el botón «Levantar el arma» de la Botonera). ⚙ Automatizado: al atacar, avisa (y deja seguir si la mesa lo decide); en el mapa el arma queda en el piso (🗡 con su nombre) y la levanta cualquiera que esté al lado, desde su Botonera.'},
  // Ceguera (dueño, 2026-10-07, la Varita del eclipse): 1 turno, solo ve a 1 casilla y −2 PdG.
  {nombre:'Ceguera', polaridad:'debuff', turnos:1, ceguera:true, mods:[{stat:'pdg', val:-2}],
    detalle:'Ciego: solo ve a 1 casilla alrededor y tiene −2 PdG. ⚙ Automatizado: el −2 y, en el mapa, lo que ve un personaje (1 casilla, ni su propia luz).'},
  // Invulnerable = Titilando (2026-10-08, dueño: «son lo mismo»): siempre que alguien es invulnerable, titila. Al revivir se pone Invulnerable
  // hasta su próximo turno (Combatiente.estadoTitilando); `Titilando` queda como otro nombre de lo mismo (los estados ya puestos).
  {nombre:'Invulnerable', alias:['Titilando'], polaridad:'buff', turnos:3, invulnerable:true,
    detalle:'No recibe daño de ninguna fuente (golpes, veneno, sangrado, etc.) y no se le puede aplicar ningún debuff. En el mapa, su token titila.'},
  {nombre:'Inmunidad a CC', polaridad:'buff', turnos:2, inmunidadCC:true,
    detalle:'Inmune a los controles: Stun, Exhausto, Inmovilizado, Rengo, Lisiado y Pajaritos (no se le pueden aplicar mientras dure). Veneno y Sangrado no cuentan como control.'},
  {nombre:'Espinas', polaridad:'buff', turnos:3, espinas:true,
    detalle:'Mientras dure, cada ataque cuerpo a cuerpo que recibe le devuelve al atacante 1/4 (25 %) del daño del golpe (con el crítico, antes de la Defensa), redondeado hacia arriba, directo a la vida. ⚙ Automatizado en el duelo; ✋ a mano fuera de él.'},
  // Espejo (dueño, 2026-10-07): el espejo de las Espinas para el daño especial — a cualquier distancia (la magia se tira de lejos).
  {nombre:'Espejo', polaridad:'buff', turnos:3, espejo:true,
    detalle:'Mientras dure, cada ataque de daño especial que recibe (varita, báculo, habilidad, o el daño elemental de un arma; a cualquier distancia, también en un área) le devuelve al que lo tiró 1/4 (25 %) de ese daño (antes de la Defensa especial), redondeado hacia arriba, directo a la vida. Las zonas que quedan en el piso y los saltos del rayo no cuentan. ⚙ Automatizado en el duelo; ✋ a mano fuera de él.'},
  // Vida extra (dueño, 2026-10-07): el ex Escudo especial y el ex Excedente de vida son lo mismo — vida de más, NETA (lo que se gasta no
  // vuelve), salvo que el efecto diga que se renueva (`recarga: true`). Absorbe el daño de cualquier fuente, también el True Damage. Sin turnos,
  // dura hasta gastarse; con turnos, vence. Si llega otra, se suma: cada una aparte, con su duración (dueño, 2026-10-07; antes reemplazaba, P137).
  {nombre:'Vida extra', alias:['Escudo especial', 'Escudo mágico', 'Excedente de vida'], polaridad:'buff', permanente:true, turnos:0, escudoMagico:5, excedenteVida:true,
    detalle:'Vida de más: se gasta antes que la vida y absorbe el daño de cualquier fuente, también el True Damage. Es neta: lo que se gasta no vuelve (salvo que el efecto diga que se renueva). Sin turnos dura hasta gastarse; si el efecto le pone turnos, vence. Se sube o baja a mano desde el chip.'},
  // Barrera (dueño, 2026-10-06): 2 turnos — con el turno propio, la de 1 turno que uno se pone en su turno se iba antes de que lo atacaran.
  {nombre:'Barrera', polaridad:'buff', turnos:2, escudoMagico:8,
    detalle:'Blindaje del Tanque: absorbe daño de la próxima fuente de daño, como una barra de HP secundaria (🛡). Si la fuente hace más, el resto entra normal. Dura 2 turnos de quien la tiene (si se la pone en su turno, lo cubre hasta el final del siguiente).'},
  {nombre:'Afortunado', polaridad:'buff', turnos:3, afortunado:true,
    detalle:'Toda tirada de PdG, Parry o Evasión se hace dos veces y se queda con la mejor.'},
  {nombre:'Sangre pura', polaridad:'buff', turnos:3, sangrePura:true,
    detalle:'Inmune a todo tipo de Veneno: no se le puede aplicar y el que ya tenga puesto no le hace daño mientras dure.'},
  // Coagulación (2026-10-08, dueño: antes «Coagulación extrema»; la marca interna sigue siendo coagulacionExtrema).
  {nombre:'Coagulación', alias:['Coagulación extrema'], polaridad:'buff', turnos:3, coagulacionExtrema:true,
    detalle:'Inmune a Sangrado: no se le puede aplicar y el que ya tenga puesto no le hace daño mientras dure.'},
  {nombre:'Blindado', polaridad:'buff', turnos:3, blindado:true,
    detalle:'✋ A mano: inmune a golpes críticos. Cuando le pegan con un crítico, la mesa lo anula (no le hace daño). El estado solo recuerda que está activo y cuántos turnos dura.'},
  {nombre:'Sigilo', polaridad:'buff', turnos:0, permanente:true,
    detalle:'Oculto: sus rivales no lo ven en el mapa. Se rompe si entra en el cono de detección de un rival o si hace una acción hostil (un ataque o una skill individual sobre un rival). Cada paso dentro de la zona de alerta de un rival pide una tirada de detección (en principio su Destreza contra el Especial del que vigila).'},
  // Marcado (2026-10-05, Varita del rastreador y Varita de la luz): se resiste con Res.Esp (lo tira quien la usa: PdG.Esp contra Res.Esp).
  // Mareo de invocación (2026-10-06, dueño): una invocación nueva entra al final del orden de turnos y su primer turno no hace nada.
  // `soloSistema` (2026-10-08, dueño): no aparece en los menús para elegir un estado (solo lo pone el mapa a una invocación recién llegada).
  {nombre:'Mareo de invocación', polaridad:'debuff', turnos:1, forzarNitros:0, soloSistema:true,
    detalle:'Recién invocada: en su primer turno no puede hacer nada (sin No2). ⚙ Automatizado: se lo pone el mapa al sumarla al orden de turnos.'},
  // Inamovible (2026-10-06, dueño: «el buff tiene que existir; la armadura simplemente te lo aplica»): la chance de no moverse, en 100 %.
  {nombre:'Inamovible', polaridad:'buff', turnos:2, mods:[{stat:'inamovible', val:100}],
    detalle:'No lo pueden empujar ni atraer (ganchos, muros que empujan, portales). ⚙ Automatizado: el mapa no lo mueve.'},
  {nombre:'Marcado', polaridad:'debuff', turnos:3, marcado:true,
    detalle:'⚙ Automatizado: no puede entrar en sigilo (si estaba, sale) y se lo sigue viendo con un brillo, aunque vuelva la niebla de guerra o esté en una nube de niebla. Se resiste con Res.Esp.'},
];

// La lista en la forma de la ficha: `hpturno`/`stacksturno`, y Armadura rota con su −1 Defensa como mod.
function estadosPresetFicha(){
  return ESTADOS_PRESET.map(p => {
    const {hpTurno, stacksTurno, ...resto} = structuredClone(p);
    const f = {...resto};
    if(hpTurno !== undefined) f.hpturno = hpTurno;
    if(stacksTurno !== undefined) f.stacksturno = stacksTurno;
    if(f.armaduraRota && !(f.mods || []).some(m => m.stat === 'def')) f.mods = [...(f.mods || []), {stat:'def', val:-1}];
    return f;
  });
}

// La lista en la forma de un creep (gm-tools, EstadosAplicar): con los valores por defecto que espera un estado de creep.
function estadosPresetCreep(){
  return ESTADOS_PRESET.map(p => ({stacks: 1, hpTurno: 0, ...structuredClone(p)}));
}
