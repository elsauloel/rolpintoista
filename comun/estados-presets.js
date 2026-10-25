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
    detalle:'PdG, PdG.Esp y Evasión a la mitad (redondeado hacia abajo) mientras dure.'},
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
    detalle:'−1 Defensa por cada acumulación (×N). Permanente y acumulable: cada rotura suma una. En un personaje no queda como estado: cae en una pieza de armadura equipada al azar (esa pieza pierde 1 de Defensa y 1 de durabilidad) y se arregla reparando la pieza. Los ± del chip ajustan cuántas hay.'},
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
  // 🦷 Mordisco feroz (2026-10-21, dueño): el mordido no se mueve; al empezar su turno tira para soltarse (gratis) y, si no se suelta, el mordisco le
  // vuelve a hacer daño. Lo suelta la bestia al empezar su siguiente turno. La bestia queda «Mordiendo» (tampoco se mueve). ⚙ El mapa: js/54.
  {nombre:'Mordido', polaridad:'debuff', turnos:0, permanente:true, inmovilizado:true, esCC:true,
    detalle:'Agarrado de los dientes: no se puede mover. Al empezar su turno tira para soltarse, gratis; si no se suelta, el mordisco le vuelve a hacer daño. Lo suelta la bestia al empezar su siguiente turno. ⚙ Automatizado en el mapa.'},
  // 👁 Vigilancia (2026-10-21, dueño; creeps y Shooter): hasta que empiece su próximo turno, el primer rival que se mueva dentro del alcance de su arma, a la
  // vista y con línea de tiro, recibe un disparo (el mapa lo frena, como al ataque de oportunidad: vtt-hexgrid/js/58). Un solo disparo.
  {nombre:'Vigilancia', polaridad:'buff', turnos:0, permanente:true, alEmpezarTurno:true, vigilancia:true,
    detalle:'En vigilancia: hasta que empiece su próximo turno, el primer rival que se mueva dentro del alcance de su arma, a la vista y con línea de tiro libre, recibe un disparo con +2 a la Probabilidad de Golpe (el movimiento se frena ahí). Quien ya estaba adentro, solo si se mueve. Un solo disparo. ⚙ Automatizado en el mapa.'},
  // 🛡 Aguante (2026-10-21, dueño, los creeps de choque pesado): +2 Defensa y +2 Defensa especial hasta que empiece su próximo turno; cuenta los golpes
  // que le pegan (`golpes`) y su próximo ataque suma +1 dado del Tipo de su arma por cada uno (vtt-hexgrid/js/56).
  {nombre:'Aguante', polaridad:'buff', turnos:0, permanente:true, alEmpezarTurno:true, aguante:true, mods:[{stat:'def', val:2}, {stat:'armadmg', val:2}],
    detalle:'En modo aguante: +2 a la Defensa y +2 a la Defensa especial hasta que empiece su próximo turno. Cuenta cada golpe que le pega: en su próximo turno, su primer ataque suma +1 dado del Tipo de su arma por cada uno, hasta su nivel + 1 dados (1 SP por dado; en modo cooldown, +1 turno de cooldown por dado). Si no ataca en ese turno, lo pierde. ⚙ Automatizado en el mapa.'},
  // 🤼 El agarre de las bestias (2026-10-21, dueño: «skills de agarre con y sin daño por parte de bestias»): como el Mordido, sin morder.
  {nombre:'Agarrado', polaridad:'debuff', turnos:0, permanente:true, inmovilizado:true, esCC:true,
    detalle:'Agarrado: no se puede mover. Al empezar su turno tira para soltarse, gratis (si el agarre aprieta, cuando no se suelta le vuelve a hacer daño). Lo suelta al empezar el siguiente turno de quien lo agarró. ⚙ Automatizado en el mapa.'},
  {nombre:'Agarrando', polaridad:'otro', turnos:0, permanente:true, inmovilizado:true,
    detalle:'Tiene a alguien agarrado: no se mueve. Lo suelta al empezar su próximo turno, o antes si el otro se zafa. ⚙ Automatizado en el mapa.'},
  {nombre:'Mordiendo', polaridad:'otro', turnos:0, permanente:true, inmovilizado:true,
    detalle:'Tiene a alguien agarrado de los dientes: no se mueve. Lo suelta al empezar su próximo turno, o antes si el otro se zafa. ⚙ Automatizado en el mapa.'},
  {nombre:'Rengo', polaridad:'debuff', turnos:3, rengo:true, esCC:true,
    detalle:'Moverse cuesta 2 Nitros por casillero mientras dure. ⚠ Valor provisorio (antes Movimiento a la mitad).'},
  // Lento (2026-10-04, dueño, con las mecánicas de los pies): el primer casillero que se mueve en cada turno cuesta el doble. Lo acorta Recuperarse rápido.
  {nombre:'Lento', polaridad:'debuff', turnos:2, lento:true, esCC:true,
    detalle:'Lento: el primer casillero que se mueve en cada turno cuesta el doble de No2 mientras dure.'},
  // Miedo (2026-10-18, dueño, con la Calavera con vela; reemplaza al de −2 PdG y −2 Daño): lleva `miedoDe` = el token que lo asustó (y
  // `miedoDeNombre`). Moverse hacia él cuesta 2 No2 por casillero (el mapa, js/04 y js/52) y lo que haga contra él va con −1 PdG y −1 al daño
  // (el duelo, `ataque.miedo`). Dura hasta que empieza su próximo turno.
  {nombre:'Miedo', polaridad:'debuff', turnos:1, esCC:true, miedo:true, alEmpezarTurno:true,
    detalle:'Asustado: cada casillero que se mueve hacia quien lo asustó le cuesta 2 No2, y todo lo que hace contra él (un ataque, una habilidad, una varita) va con −1 a la probabilidad de golpe y −1 al daño, común o especial. Dura hasta que empieza su próximo turno. Es un control (lo frenan la resistencia a CC y la Inmunidad a CC). ⚙ Automatizado en el mapa. ✋ A mano: el −1 en un área o una onda que lo incluye, y el Miedo que no viene de nadie (una trampa).'},
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
  // Expuesto (dueño, 2026-10-10: Degollar del Asalto): hasta que empieza su próximo turno (`alEmpezarTurno`; sin orden de turnos, hasta el ⟳).
  // Debilitado (2026-10-11, dueño: Maldición debilitante del Debuffer): −1 a todas las tiradas que salen de un stat derivado (ataque, defensas,
  // daño, resistencias, Percepción, Sigilo, Iniciativa) por 2 turnos. `apila` (Combatiente.agregarEstado): otra vez = un stack más (−1 más) y vuelve
  // a durar 2 turnos. Los mods se multiplican por los stacks en personajes, creeps e invocaciones.
  {nombre:'Debilitado', polaridad:'debuff', turnos:2, stacks:1, apila:true, mods:[{stat:'pdg', val:-1}, {stat:'pdgmg', val:-1}, {stat:'eva', val:-1}, {stat:'parry', val:-1}, {stat:'bloqueo', val:-1}, {stat:'dmg', val:-1}, {stat:'dmgesp', val:-1}, {stat:'resmg', val:-1}, {stat:'resm', val:-1}, {stat:'rescc', val:-1}, {stat:'percepcion', val:-1}, {stat:'sigilo', val:-1}, {stat:'ini', val:-1}],
    detalle:'−1 a todas sus tiradas por cada stack (ataque, defensas, daño, resistencias, Percepción, Sigilo, Iniciativa) durante 2 turnos. Si se lo vuelven a poner, −1 más y vuelve a durar 2 turnos. ⚙ Automatizado. ✋ A mano: una tirada de un atributo pelado (Fuerza, Constitución…) no lo resta sola.'},
  // Bendecido (2026-10-11, dueño: Blessing del Support): el espejo de Debilitado, +1 a las mismas tiradas por 2 turnos. No se apila: otra vez
  // renueva los 2 turnos.
  // Extenuado (2026-10-12, dueño: Maldición extenuante del Debuffer): +1 No2 por stack a todo lo que cuesta No2, y moverse cuesta 1 No2 más
  // cada 2 casillas por stack. 1 turno; se apila (`apila`) y vuelve a durar 1 turno. Lo suman Combatiente.conExtenuado y el mapa (costoPasos).
  // Acelerado (2026-10-12, dueño: Shooter): −1 No2 por stack al próximo disparo de este turno (solo armas a distancia); se apila; se va al
  // terminar el turno (`alTerminarTurno`) o lo gasta ese disparo (Combatiente.acelerado / gastarAcelerado, en FichaCombate).
  // Endurecido (2026-10-12, dueño: Endurecimiento del Support): una armadura temporal — +3 Defensa, +3 Armadura mágica y +1 a la resistencia a
  // crítico contra los cinco Tipos. 2 turnos; otra vez renueva (no se apila).
  {nombre:'Endurecido', polaridad:'buff', turnos:2, mods:[{stat:'def', val:3}, {stat:'armadmg', val:3}, {stat:'tipo1', val:1}, {stat:'tipo2', val:1}, {stat:'tipo3', val:1}, {stat:'tipo4', val:1}, {stat:'tipo5', val:1}],
    detalle:'Una armadura temporal: +3 de Defensa, +3 de Armadura mágica y +1 a la resistencia a crítico contra todos los Tipos (4 a 12). Dura 2 turnos; otra vez vuelve a durar 2 turnos (no se suma). ⚙ Automatizado.'},
  {nombre:'Acelerado', polaridad:'buff', turnos:1, stacks:1, apila:true, acelera:true, alTerminarTurno:true,
    detalle:'Su próximo ataque con un arma a distancia de este turno cuesta 1 No2 menos por stack (mínimo 0). Lo gasta ese disparo; si termina el turno sin disparar, se pierde. ⚙ Automatizado.'},
  {nombre:'Extenuado', polaridad:'debuff', turnos:1, stacks:1, apila:true, extenuante:true,
    detalle:'+1 No2 por stack a todo lo que cuesta No2 (atacar, habilidades, Parry, consumir, equipar, levantarse, el sigilo…) y, al moverse, 1 No2 más cada 2 casillas por stack. Dura 1 turno; otra vez es +1 más y vuelve a durar 1 turno. ⚙ Automatizado.'},
  // Atormentado (2026-10-12, dueño: Maldición tormentosa del Debuffer): cada acción que cuesta No2 le saca vida (lo que costó − 1, +1 por stack de
  // más) y moverse, 1 de vida por stack cada 2 casillas. Directo a la vida. 3 turnos; se apila y vuelve a durar 3. Combatiente.cobroTormenta.
  {nombre:'Atormentado', polaridad:'debuff', turnos:3, stacks:1, apila:true, tormenta:true,
    detalle:'Cada acción que le cuesta No2 le saca vida: lo que costó menos 1 (atacar con 3 No2 = 2; algo de 1 No2, nada), +1 por cada stack de más. Al moverse, pierde 1 de vida por stack cada 2 casillas. Va directo a la vida: lo frenan los escudos, la vida extra e Invulnerable. Dura 3 turnos; otra vez es +1 más y vuelve a durar 3 turnos. ⚙ Automatizado.'},
  {nombre:'Bendecido', polaridad:'buff', turnos:2, mods:[{stat:'pdg', val:1}, {stat:'pdgmg', val:1}, {stat:'eva', val:1}, {stat:'parry', val:1}, {stat:'bloqueo', val:1}, {stat:'dmg', val:1}, {stat:'dmgesp', val:1}, {stat:'resmg', val:1}, {stat:'resm', val:1}, {stat:'rescc', val:1}, {stat:'percepcion', val:1}, {stat:'sigilo', val:1}, {stat:'ini', val:1}],
    detalle:'+1 a todas sus tiradas (ataque, defensas, daño, resistencias, Percepción, Sigilo, Iniciativa) durante 2 turnos. Otra vez no se suma: vuelve a durar 2 turnos. ⚙ Automatizado. ✋ A mano: una tirada de un atributo pelado (Fuerza, Constitución…) no lo suma sola.'},
  // 💪 Empower (Support; dueño, 2026-10-22: «se debe poder elegir antes de una tirada. Se aprieta y la siguiente tirada le suma el valor del
  // empower… es sólo para la siguiente tirada después de activarlo»): +3 por stack a la próxima tirada y nada más. `unaTirada`: lo gasta esa
  // tirada (FichaAcciones.tirarValorStat y el daño; las que tira el mapa, js/37 mesaTrasPublicar). Otro Empower antes de tirar = un stack más (+6).
  {nombre:'Empower', polaridad:'buff', turnos:0, permanente:true, stacks:1, apila:true, unaTirada:true, mods:[{stat:'pdg', val:3}, {stat:'pdgmg', val:3}, {stat:'eva', val:3}, {stat:'parry', val:3}, {stat:'bloqueo', val:3}, {stat:'dmg', val:3}, {stat:'dmgesp', val:3}, {stat:'resmg', val:3}, {stat:'resm', val:3}, {stat:'rescc', val:3}, {stat:'percepcion', val:3}, {stat:'sigilo', val:3}, {stat:'ini', val:3}],
    detalle:'+3 a su próxima tirada (ataque, defensa, daño, Fuerza del golpe, resistencias, Percepción, Sigilo, Iniciativa…), +3 más por cada Empower que se sume antes de tirar. Esa tirada lo gasta. ⚙ Automatizado. ✋ A mano: una tirada que no sale de un stat (un dado fijo de una habilidad) no lo usa ni lo gasta.'},
  // Repitiendo (Shooter, 2026-10-13): X disparos encadenados con la misma arma al mismo blanco; el 2.º +1 PdG y +1 dado, el 3.º +2 y +2. Lo cuenta el mapa.
  {nombre:'Repitiendo', polaridad:'buff', turnos:1, stacks:1, repetir:true, alEmpezarTurno:true,
    detalle:'Encadena disparos iguales (misma arma, mismo blanco): el 2.º suma +1 PdG y +1 dado de daño, el 3.º +2 y +2. Cada disparo paga sus No2. Cambiar de arma o de blanco corta la cadena; se termina al empezar su próximo turno. ⚙ Automatizado en el mapa.'},
  // Sprint (Asalto, 2026-10-13): los próximos 3 casilleros que camina están pagos (solo paga los recargos: Rengo, terreno lento). Lo descuenta el mapa.
  {nombre:'Sprint', polaridad:'buff', turnos:1, sprint:3, alEmpezarTurno:true,
    detalle:'Los próximos 3 casilleros que camina en este turno ya están pagos: solo paga lo que sumen Rengo o el terreno lento, y alejarse de un rival le da su ataque de oportunidad. Se termina al empezar su próximo turno. ⚙ Automatizado en el mapa.'},
  // Ojo certero (2026-10-24, dueño: el Support de los creeps): Crítico frecuente +2 y Crítico potente +2, dos turnos completos de quien lo recibe
  // (`turnosCompletos`: el turno en que se lo dan no cuenta, aunque sea el suyo; Combatiente.terminarTurnoEstados).
  {nombre:'Ojo certero', polaridad:'buff', turnos:2, turnosCompletos:true, mods:[{stat:'crit', val:2}, {stat:'critpot', val:2}],
    detalle:'Le afinan la puntería: Crítico frecuente +2 y Crítico potente +2 durante sus próximos 2 turnos completos (el turno en que se lo dan no cuenta). Si se lo vuelven a dar, no se suma: vuelve a durar 2 turnos. ⚙ Automatizado.'},
  // Sequía (2026-10-24, dueño: la Maldición de la sequía del Debuffer, «sólo corta las regeneraciones de SP y HP propias, no las externas»).
  {nombre:'Sequía', polaridad:'debuff', turnos:3, sequia:true,
    detalle:'Una maldición que lo seca por dentro: mientras dure no recupera vida ni SP por sí mismo al empezar el turno (sus pasivas de regeneración, la Regeneración de vida de su equipo, su SP Regen). Lo que le dan otros (una cura, la Regeneración de un aliado, una zona de curación) entra igual. ⚙ Automatizado.'},
  // Coraza maldita (2026-10-24, dueño: la Maldición de la coraza del Debuffer): −2 a la Defensa y a la Defensa especial; todos le pegan más.
  {nombre:'Coraza maldita', polaridad:'debuff', turnos:3, mods:[{stat:'def', val:-2}, {stat:'armadmg', val:-2}],
    detalle:'Una maldición le ablanda la armadura: −2 a su Defensa y −2 a su Defensa especial durante 3 turnos, contra todos. Si se la vuelven a poner, no se suma: vuelve a durar 3 turnos. ⚙ Automatizado.'},
  {nombre:'Expuesto', polaridad:'debuff', turnos:1, expuesto:true, mitadEva:true, alEmpezarTurno:true,
    detalle:'Quedó al descubierto: hasta que empieza su próximo turno, su Evasión se parte a la mitad (al resultado, para abajo) y no puede reaccionar con nada que cueste No2: ni Parry (y por lo tanto ni Bloqueo ni contraataque), ni ataque de oportunidad, ni dodge roll. ⚙ Automatizado: la Evasión, las defensas del duelo, la oportunidad y el dodge roll.'},
  {nombre:'Sentado', polaridad:'debuff', permanente:true, turnos:0, sentado:true, esCC:true,
    detalle:'Está en el piso: su Evasión se parte a la mitad (al resultado de la tirada, redondeado hacia abajo), no puede atacar y no puede hacer dodge roll (✋ a mano). No vence solo: levantarse cuesta 1 No2 (botón Levantarse de la Botonera o de las Acciones del creep).'},
  // Desarmado (dueño, 2026-10-07, la Varita del manotazo): el arma cae al piso. Desde el 2026-10-22 no queda como estado (Combatiente.agregarEstado):
  // es el efecto; se queda acá para la inmunidad (es un control) y para el caos.
  {nombre:'Desarmado', alias:['Desarme'], polaridad:'debuff', permanente:true, turnos:0, desarmado:true, esCC:true,
    detalle:'Se le cayó el arma: no puede atacar con ella hasta levantarla, que cuesta 1 No2 (el botón «Levantar el arma» de la Botonera). ⚙ Automatizado: al atacar, avisa (y deja seguir si la mesa lo decide); en el mapa el arma queda en el piso (🗡 con su nombre) y la levanta cualquiera que esté al lado, desde su Botonera.'},
  // Ceguera (dueño, 2026-10-07, la Varita del eclipse): 1 turno, solo ve a 1 casilla y −2 PdG.
  {nombre:'Ceguera', alias: ['Cegado', 'Cegada'], polaridad:'debuff', turnos:1, ceguera:true, esCC:true,
    detalle:'Ciego: ve solo a 2 casillas alrededor, no puede elegir objetivos más lejos y sus tiradas de PdG y PdG.Esp valen la mitad (para abajo). ⚙ Automatizado: la mitad y, en el mapa, lo que ve (2 casillas, ni su propia luz) y el aviso al elegir un objetivo más lejos.'},   // (2026-10-20, dueño: antes 1 casilla y −2 PdG)
  // Invulnerable = Titilando (2026-10-08, dueño: «son lo mismo»): siempre que alguien es invulnerable, titila. Al revivir se pone Invulnerable
  // hasta su próximo turno (Combatiente.estadoTitilando); `Titilando` queda como otro nombre de lo mismo (los estados ya puestos).
  {nombre:'Invulnerable', alias:['Titilando'], polaridad:'buff', turnos:3, invulnerable:true,
    detalle:'No recibe daño de ninguna fuente (golpes, veneno, sangrado, etc.) y no se le puede aplicar ningún debuff. En el mapa, su token titila.'},
  {nombre:'Inmunidad a CC', polaridad:'buff', turnos:2, inmunidadCC:true,
    detalle:'Inmune a todos los controles, los del cuerpo y los mentales: Stun, Pajaritos, Parálisis, Exhausto, Lisiado, Rengo, Ceguera, Inmovilizado, Lento, Sentado, Desarmado, Miedo, Confusión, Provocado, Silencio (no se le pueden aplicar mientras dure). Veneno y Sangrado no cuentan como control.'},
  // Inmunidad mental (2026-10-18, dueño, P210): solo los controles mentales (Combatiente.GRUPOS_CC.mental). La dan el Atrapasueños y otros talismanes.
  {nombre:'Inmunidad mental', polaridad:'buff', turnos:2, inmunidadMental:true,
    detalle:'Inmune a los controles mentales: Miedo, Confusión, Provocado, Sueño y Silencio (no se le pueden aplicar mientras dure). Los del cuerpo (Stun, Inmovilizado…) le entran igual.'},
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
  // Shield (Support, dueño 2026-10-11): absorbe 14 de daño y dura hasta gastarse — no vence por turnos ni se recarga; gastado, se va (seGasta).
  {nombre:'Shield', polaridad:'buff', permanente:true, turnos:0, escudoMagico:14, sinRecarga:true, seGasta:true,
    detalle:'Shield del Support: absorbe 14 de daño, de un golpe o de varios, como una barra de HP secundaria (🛡). Dura hasta gastarse: no vence por turnos ni se recarga.'},
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
  // 🔥 Llama de Fénix (dueño, 2026-10-20, el Elixir de Fénix): si cae mientras dura, revive con toda la vida (y todo el SP) y queda Titilando.
  {nombre:'Llama de Fénix', polaridad:'buff', turnos:3, fenix:true,
    detalle:'Si cae (vida 0) mientras dura, revive con toda la vida y todo el SP, y queda Titilando hasta su próximo turno; la llama se apaga. ⚙ Automatizado.'},
  // 👻 Etéreo (dueño, 2026-10-20): como el Ojo de Kicillof, para cualquiera. Lo lee el mapa (Combatiente.etereo).
  {nombre:'Etéreo', alias:['Etérea'], polaridad:'buff', turnos:2, etereo:true,
    detalle:'Se vuelve etéreo: todos lo ven (medio transparente), pero no puede ser objetivo de nada (ataques, habilidades, áreas, el salto del rayo) y él tampoco puede atacar ni usar habilidades o consumibles: solo observa (y se mueve) hasta que se le va el estado. Atraviesa personajes, objetos sólidos y paredes; no pisa trampas ni zonas; no da ni recibe ataques de oportunidad. ⚙ Automatizado en el mapa (si igual quiere actuar, el mapa avisa y deja «Hacerlo igual»: lo decide la mesa).'},
  {nombre:'Blindado', polaridad:'buff', turnos:3, blindado:true,
    detalle:'Inmune a los golpes críticos: un golpe que iba a ser crítico entra como uno normal. ⚙ Automatizado en el duelo (2026-10-20).'},
  {nombre:'Sigilo', polaridad:'buff', turnos:0, permanente:true,
    detalle:'Oculto: sus rivales no lo ven en el mapa. Se rompe si entra en el cono de detección de un rival o si hace una acción hostil (un ataque o una skill individual sobre un rival). Cada paso dentro de la zona de alerta de un rival pide una tirada de detección (en principio su Destreza contra el Especial del que vigila).'},
  // Marcado (2026-10-05, Varita del rastreador y Varita de la luz): se resiste con Res.Esp (lo tira quien la usa: PdG.Esp contra Res.Esp).
  // Mareo de invocación (2026-10-06, dueño): una invocación nueva entra al final del orden de turnos y su primer turno no hace nada.
  // `soloSistema` (2026-10-08, dueño): no aparece en los menús para elegir un estado (solo lo pone el mapa a una invocación recién llegada).
  // (dueño, 2026-10-20: «no es que no tiene nitros»: tiene sus No2 y puede reaccionar —dodge roll, Parry, Evasión—; lo que no puede es actuar en su turno.)
  {nombre:'Mareo de invocación', polaridad:'debuff', turnos:1, mareado:true, soloSistema:true,
    detalle:'Recién invocada: en su primer turno no puede actuar (ni moverse, ni atacar, ni usar habilidades o consumibles). Tiene sus No2 y sí puede reaccionar: dodge roll, Parry, Evasión. ⚙ Automatizado: se lo pone el mapa al sumarla al orden de turnos y le frena las acciones de su turno (la mesa puede dejarlas pasar).'},
  // Inamovible (2026-10-06, dueño: «el buff tiene que existir; la armadura simplemente te lo aplica»): la chance de no moverse, en 100 %.
  {nombre:'Inamovible', polaridad:'buff', turnos:2, mods:[{stat:'inamovible', val:100}],
    detalle:'No lo pueden empujar ni atraer (ganchos, muros que empujan, portales). ⚙ Automatizado: el mapa no lo mueve.'},
  // Maldito (2026-10-17, dueño: «un skill que castigue por uso de SP… por dos turnos te deja maldito y por cada punto de SP perdés un punto de
  // HP»; la vida se pierde al pagar —antes del efecto— y puede dejarlo caído): `sangraSp` (FichaAcciones.gastarSp). Lo pone la Maldición de la
  // sangre del Kobold maldiciente. Un creep no paga SP: no lo siente.
  {nombre:'Maldito', polaridad:'debuff', turnos:2, sangraSp:true,
    detalle:'Maldición de la sangre: cada punto de SP que gastes te saca 1 de vida, directo, en el momento de pagar (antes de que salga el efecto; puede dejarte caído). Un creep (mientras los creeps no gastan SP): cada habilidad que usa le saca tanta vida como su cooldown. ⚙ Automatizado: al pagar SP (o al usar la habilidad, un creep) se descuenta la vida y se avisa.'},
  // Vuela (2026-10-16, dueño; para las abejas de Bizzante y los creeps voladores): como Levitar sin límite y sin aterrizar (la marca `levitar`
  // en 100, como Inamovible), pasa por encima de los tokens (no de paredes ni Sólidos; al cruzar a un rival, antes le da su ataque de
  // oportunidad) y no le entran Sentado ni Rengo (`volador`, Combatiente.inmunidad). Cuerpo a cuerpo se le pega normal (vuela bajo); −1 a la
  // Evasión contra disparos (`evadisparo`). También es una pasiva (comun/pasivas.js, `estado: 'Vuela'`).
  {nombre:'Vuela', polaridad:'buff', permanente:true, turnos:0, volador:true, mods:[{stat:'levitar', val:100}, {stat:'evadisparo', val:-1}],
    detalle:'Vuela bajo: nunca toca el piso. No lo frena el terreno lento, no pisa ni detecta trampas y no lo tocan las zonas del piso (las del aire, como gas o humo, sí). Pasa por encima de los tokens (no de paredes ni Sólidos), pero no puede terminar encima de nadie; si cruza por encima de un rival, antes ese rival tiene su ataque de oportunidad. No le entran Sentado ni Rengo. Cuerpo a cuerpo se le pega normal, y a los disparos (arco, ballesta, honda, arrojadiza) se expone más: −1 a la Evasión contra ellos. ⚙ Automatizado.'},
  // Arma envenenada (2026-10-10, dueño: Envenenar arma del Asalto): un estado con CARGAS (Combatiente.gastarCarga): cada ataque con arma, pegue o
  // no, gasta una y suma su `golpe` (+3 de daño y Veneno ×3) a ese golpe. Sin cargas, se va. Volver a ponerlo lo deja otra vez en 2.
  {nombre:'Arma envenenada', polaridad:'buff', permanente:true, cargas:2, golpe:{fijo:3, efectos:[{nombre:'Envenenar', stacks:3}]},
    detalle:'Sus próximos 2 ataques con arma (peguen o no) suman +3 de daño y Veneno ×3 (el veneno entra si el golpe hace daño). Cada ataque gasta una carga. ⚙ Automatizado.'},
  // Arma bendecida (2026-10-24, dueño: Bendecir el arma del Support de los creeps): su próximo ataque con arma suma un dado del Tipo de su arma.
  {nombre:'Arma bendecida', polaridad:'buff', turnos:2, cargas:1, golpe:{dados:1},
    detalle:'Su próximo ataque con arma suma un dado más del Tipo de su arma al daño (pegue o no, ese ataque la gasta). Si no ataca, se va a los 2 turnos. ⚙ Automatizado en el duelo.'},
  // Ojo de asesino (2026-10-11, dueño: Asalto, como mecánica de cargas): su próximo ataque con arma de este turno tiene Crítico frecuente +1.
  {nombre:'Ojo de asesino', polaridad:'buff', turnos:1, cargas:1, golpe:{crit:1},
    detalle:'Su próximo ataque con arma de este turno tiene Crítico frecuente +1 (el rango del crítico baja 1; mínimo 2). Lo gasta ese ataque, pegue o no. ⚙ Automatizado.'},
  // Enfocado (2026-10-11, dueño: Shooter): una carga que se APILA (`golpePorStack`, Combatiente.agregarEstado): cada uso suma un stack y +2 de
  // daño a su próximo ataque con arma, aunque sea en otro turno. Lo gasta ese ataque, pegue o no.
  {nombre:'Enfocado', polaridad:'buff', permanente:true, turnos:0, cargas:1, stacks:1, golpePorStack:{fijo:2}, golpe:{fijo:2},
    detalle:'Su próximo ataque con arma suma +2 de daño por cada stack (se usa varias veces seguidas y se suma todo). No vence: lo gasta ese ataque, pegue o no. ⚙ Automatizado.'},
  // Armadura arcana (2026-10-10, dueño: Mago): absorbe el 50 % de cada golpe que le llega (hasta 10 en total) y, al terminar, explota
  // con lo que absorbió alrededor (Combatiente.absorberPct, explosivos; el mapa: resolverGolpe y explotarAlTerminar).
  {nombre:'Armadura arcana', polaridad:'buff', turnos:2, absorbePct:50, absorbeMax:10, absorbido:0, explota:{radio:1, tipo:'arcano', directo:true},
    detalle:'Absorbe el 50 % de cada golpe que le llega (después de la Defensa), hasta 10 en total. Al terminar, explota: lo que absorbió, como daño arcano directo a cada rival al lado (PdG.Esp contra Evasión; quien gana tiene dodge roll). ⚙ Automatizado en el mapa.'},
  // Los óleos del Bazar (2026-10-10, aprobados por el dueño): la misma mecánica de cargas.
  {nombre:'Óleo venenoso', polaridad:'buff', permanente:true, cargas:1, golpe:{fijo:2, efectos:[{nombre:'Envenenar', stacks:3}]},
    detalle:'Su próximo ataque con arma (pegue o no) suma +2 de daño y Veneno ×3 (el veneno entra si el golpe hace daño). ⚙ Automatizado.'},
  {nombre:'Óleo venenoso concentrado', polaridad:'buff', permanente:true, cargas:2, golpe:{fijo:3, efectos:[{nombre:'Envenenar', stacks:3}]},
    detalle:'Sus próximos 2 ataques con arma (peguen o no) suman +3 de daño y Veneno ×3 (el veneno entra si el golpe hace daño). Cada ataque gasta una carga. ⚙ Automatizado.'},
  // 🔥❄⚡🧪☠ Arma elemental (2026-10-21, dueño, el Support): durante 3 turnos, cada golpe con arma que pega suma +1d4 del elemento (daño directo:
  // solo lo frena la resistencia a ese elemento; no se multiplica con el crítico) y lo de su elemento (lo de la Carga Elemental, sobre esa parte del
  // daño). `golpePorTurnos`: suma a cada golpe sin gastar cargas (Combatiente.gastarCarga). `armaElemental`: una sola a la vez (la nueva reemplaza).
  {nombre:'Arma ígnea', polaridad:'buff', turnos:3, armaElemental:'fuego', golpePorTurnos:true, golpe:{efectos:[{nombre:'Fuego', dado:'1d4', danoMagico:true, mult:1.5}]},
    detalle:'Su arma arde: cada golpe con arma que pega suma +1d4 de daño de fuego, ×1,5 (para arriba). Es daño directo: solo lo frena la resistencia al fuego. Dura 3 turnos; otra arma elemental la reemplaza. ⚙ Automatizado en el duelo.'},
  {nombre:'Arma helada', polaridad:'buff', turnos:3, armaElemental:'hielo', golpePorTurnos:true, golpe:{efectos:[{nombre:'Hielo', dado:'1d4', danoMagico:true, porDano:{estado:'Escarcha', cada:5, mas1:true}}]},
    detalle:'Su arma congela: cada golpe con arma que pega suma +1d4 de daño de hielo y deja Escarcha 1 (y una más cada 5 de daño de hielo que entra). Es daño directo: solo lo frena la resistencia al hielo. Dura 3 turnos; otra arma elemental la reemplaza. ⚙ Automatizado en el duelo.'},
  {nombre:'Arma eléctrica', polaridad:'buff', turnos:3, armaElemental:'rayo', golpePorTurnos:true, golpe:{efectos:[{nombre:'Eléctrico', dado:'1d4', danoMagico:true, cadena:true}, {nombre:'Parálisis', caras:10, exitos:2, turnos:1}]},
    detalle:'Su arma chisporrotea: cada golpe con arma que pega suma +1d4 de daño eléctrico, que salta al rival más cercano (4 casillas o menos) con la mitad de lo que entró, sin repetir, y 20 % de Parálisis 1 turno al golpeado. Es daño directo: solo lo frena la resistencia eléctrica. Dura 3 turnos; otra arma elemental la reemplaza. ⚙ Automatizado en el duelo.'},
  {nombre:'Arma ácida', polaridad:'buff', turnos:3, armaElemental:'acido', golpePorTurnos:true, golpe:{efectos:[{nombre:'Ácido', dado:'1d4', danoMagico:true, porDano:{estado:'Armadura rota', cada:5, mas1:true}}]},
    detalle:'Su arma corroe: cada golpe con arma que pega suma +1d4 de daño de ácido y deja Armadura rota 1 (y una más cada 5 de daño de ácido que entra). Es daño directo: solo lo frena la resistencia al ácido. Dura 3 turnos; otra arma elemental la reemplaza. ⚙ Automatizado en el duelo.'},
  {nombre:'Arma venenosa', polaridad:'buff', turnos:3, armaElemental:'toxico', golpePorTurnos:true, golpe:{efectos:[{nombre:'Tóxico', dado:'1d4', danoMagico:true, porDano:{estado:'Veneno', cada:3}}]},
    detalle:'Su arma gotea veneno: cada golpe con arma que pega suma +1d4 de daño tóxico y deja Veneno, 1 stack cada 3 de daño tóxico que entra (mínimo 1). Es daño directo: solo lo frena la resistencia tóxica. Dura 3 turnos; otra arma elemental la reemplaza. ⚙ Automatizado en el duelo.'},
  // 🪓 Golpe anunciado (2026-10-21, dueño: El que avisa no traiciona / Zarpazo erguido): lo carga un turno a la vista de todos; en su próximo turno
  // lo descarga (vtt-hexgrid/js/63). Se va al empezar su turno (pasa a `sc.golpeListo`); se corta si le entran 10 de daño o más mientras lo carga
  // (`cortaDano`, la cuenta en `danoRecibido`: vtt-hexgrid/js/10; dueño, 2026-10-21: «que no se corte con cualquier daño»).
  // Carga arcana (2026-10-24, dueño: la Descarga arcana del Mago; «si lo empieza a cargar estando cubierto por la niebla, se revela su ubicación: una luz recubre al creep,
  // como si quedara marcado»): el golpe anunciado de un hechizo, con `marcado` (brilla y se lo ve a través de la niebla) mientras carga.
  {nombre:'Carga arcana', polaridad:'buff', turnos:0, permanente:true, alEmpezarTurno:true, golpeAnunciado:true, cortaDano:10, marcado:true,
    detalle:'Junta energía a la vista de todos: una luz lo recubre (brilla y se lo ve aunque esté en la niebla, como Marcado) y en su próximo turno la descarga (Descarga arcana). Si mientras la carga le entran 10 de daño o más (sumando los golpes), se le corta. ⚙ Automatizado (vtt-hexgrid/js/63).'},
  {nombre:'Golpe anunciado', polaridad:'buff', turnos:0, permanente:true, alEmpezarTurno:true, golpeAnunciado:true, cortaDano:10,
    detalle:'Carga un golpe a la vista de todos: en su próximo turno descarga un ataque con +3 dados del Tipo de su arma, que no se puede parrear y empuja 2 casillas (cuesta los No2 del ataque y 3 SP). Si su objetivo está pegado y se aleja, se lo come de oportunidad (los No2 de una oportunidad y los 3 SP). Si mientras lo carga le entran 10 de daño o más (sumando los golpes), se le cae el golpe. ⚙ Automatizado en el mapa.'},
  // 🎯 Apuntando a la cabeza (2026-10-21, dueño, el Tiro a la cabeza de los creeps): su próximo disparo +2 PdG, Crítico frecuente +1 y Crítico potente +1
  // (`apunta`, lo suma el mapa: vtt-hexgrid/js/35); se gasta al disparar y se pierde si le entra daño (`pierdeAlDano`, js/10).
  {nombre:'Apuntando a la cabeza', polaridad:'buff', turnos:0, permanente:true, apunta:{pdg:2, crit:1, critpot:1}, pierdeAlDano:true,
    detalle:'Apunta con calma: su próximo disparo con un arma a distancia suma +2 a la Probabilidad de Golpe, Crítico frecuente +1 y Crítico potente +1. Se gasta al disparar; si antes le hacen daño (que le llegue a la vida), pierde la puntería. ⚙ Automatizado en el mapa.'},
  // 🎯 Presa (2026-10-21, dueño, el Disparo señalador; después, el Señalar la presa del Support): Evasión −1 (un mod: vale contra todo) y +2 al daño de
  // quien lo ataque siendo su rival (`presa`: lo suma el duelo, comun/duelo.js; lo detecta el mapa, vtt-hexgrid/js/13). Va junto con el Marcado.
  {nombre:'Presa', polaridad:'debuff', turnos:2, presa:2, mods:[{stat:'eva', val:-1}],
    detalle:'Lo señalaron: su Evasión baja 1 y todo el que lo ataca le hace +2 de daño (con arma o con una habilidad que haga daño). Dura 2 turnos; volver a señalarlo lo renueva. Con otra Presa encima, vale solo la más fuerte (el daño y la Evasión). ⚙ Automatizado en el mapa.'},
  // 🎯 La del Support (2026-10-25, Señalar la presa; dueño: «menos 2 a Evasión y más 4 al daño»). `presa` = cuánto daño de más le hacen (js/13 presaContra).
  // ✨ La Lanza de luz del Mago (2026-10-25, dueño: «que además deje un estado de −2 a la resistencia especial»; 2 turnos).
  {nombre:'Deslumbrado', polaridad:'debuff', turnos:2, mods:[{stat:'resmg', val:-2}],
    detalle:'La luz lo dejó encandilado: su Resistencia especial baja 2 (le cuesta más resistir maldiciones, controles y todo lo que se tira contra su Res.Esp). Dura 2 turnos; volver a deslumbrarlo lo renueva. ⚙ Automatizado.'},
  {nombre:'Presa señalada', polaridad:'debuff', turnos:2, presa:4, mods:[{stat:'eva', val:-2}],
    detalle:'Lo señalaron para que todos vayan por él: su Evasión baja 2 y todo el que lo ataca le hace +4 de daño (con arma o con una habilidad que haga daño). Dura 2 turnos; volver a señalarlo lo renueva. Con otra Presa encima, vale solo la más fuerte (el daño y la Evasión). ⚙ Automatizado en el mapa.'},
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
