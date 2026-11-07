# Reporte: el próximo encuentro de «El origen de las especies» (simulado, 2026-10-22)

Pedido del dueño (2026-10-22, antes de irse a dormir): copiar a los tres jugadores activos de la partida (Larry, Bizzante y Rockardo
Petroshvnick Son), imaginar un escenario de pelea para el próximo encuentro con los goblins y kobolds que ya están cargados en esa
partida, y simularlo con todos sus pasos (iniciativa, turnos, acciones según SP y No2) para evaluar contra qué creeps la pelea es
divertida, justa y con riesgo, pero con chance de sobrevivir. Se aceptan sugerencias de subir de nivel a los creeps, darles las skills
que venimos trabajando y mejor equipo.

Todo se hizo «en el aire», sin tocar la partida ni el mapa: los datos se leyeron de Firebase (solo lectura) y la simulación corre en una
página nueva, `herramientas/simulador-encuentro.html`, sobre el motor de reglas real (ver «Cómo se simuló», al final).

## Resumen en tres líneas

- Con los creeps tal cual están, cuatro de los seis encuentros que probé son un paseo: los personajes ganan siempre y Rockardo termina
  sin un rasguño. El problema no es la cantidad de creeps sino que casi nada les pasa la Defensa 14 de Rockardo, y Larry barre grupos
  enteros con Pedos Tóxicos + Drenar Vida.
- Lo que sí lastima a los personajes: el daño que ignora la Defensa (crítico, Perfora, veneno, magia), los grupos de 5 o 6 con un
  tirador atrás, y los sanadores/buffers que estiran la pelea hasta que a Bizzante o a Larry se les acaba la vida.
- **Recomendación: «El chamán»** — Chamán goblin, Goblin portaestandarte, Goblin de choque ×2 y Goblin arquero del claro, tal cual están
  cargados, sin subirles nada. Cinco cuerpos con cinco roles distintos (cura, buff, dos que sostienen con Perfora, un tirador que
  envenena). Los personajes ganan el 87 % de las veces, pierden del todo un 0-3 %, y en un 10-13 % la pelea se empantana (dos caídos y
  Rockardo solo contra los de choque: en la mesa, retirada o rescate). Alguien cae en la mitad de las peleas; dos, en una de cada tres o
  cuatro. Es el riesgo que pediste, con salida. En la historia del Bosque encaja como la retaguardia del ocultista (los goblins que
  sobrevivieron al sendero se replegaron con el chamán y el portaestandarte); si el próximo es «La guarida» del plan, ojo que los lobos y el
  ocultista no entraron en la simulación (pedido: goblins y kobolds).

## Los tres personajes (como están en la ficha hoy)

- **Rockardo Petroshvnick Son** (Tanque / Warrior, nivel 2): 35 HP, Defensa 14 (Cota de malla + Escudo de acero), Evasión 7, Parry 8,
  Bloqueo 9, Res.Esp 7. Maza (Raro, Tipo 10): 3d10 + 10 de daño, 4 No2 por ataque, 9 No2 por turno. 15 SP (regen 2): Blindaje (1 SP:
  Barrera que absorbe 8), Shockwave (4 SP: Fuerza contra Constitución de todos los pegados, deja Pajaritos). Regeneración pasiva +3 por
  turno. **Sin pociones en el cinturón.**
- **Bizzante** (Asalto ligero / Summoner, nivel 2): 25 HP, Defensa 5, Evasión 8, Parry 8, Bloqueo 6, Res.Esp 5. Machete (Tipo 6, 1d6 + 6)
  y Lanza corta. 27 SP (regen 4): Lisiar (2 SP, un ataque que deja Lesión), Invocar Abeja Mejorada (5 SP, no automatizada), Robar SP,
  Mochila Panal. Túnica de sanador (+2 HP por turno). Cinturón: 3 Pociones de HP (+20).
- **Larry** (Debuffer, gusano, nivel 2): 20 HP, Defensa 4, Evasión 4, Res.Esp 4, Rango 5. Especial 19 → 57 SP (regen 9), Dmg.Esp 19.
  Sin arma. Drenar Vida (X SP + 2 No2: X + 1dX contra Res.Esp, la diferencia como daño arcano directo, se cura lo que drena), Pedos
  Tóxicos (5 SP + 2 No2: zona de diámetro 5, cada exposición tira Dmg.Esp contra Res.Esp, la diferencia como daño tóxico directo, y un
  d20: 7+ Pajaritos, 17+ Stun, 20 desmayo; **simulado ya con el nerf de 1 turno = dos efectos**), Pedo Meteórico (no automatizada),
  Transfusión sanguínea (1 SP + 1 No2). Solo 4 No2 por turno: le alcanzan justo para una Pedos y un Drenar.

Lo que pesa en el balance: Rockardo tiene la Defensa de un personaje de nivel 5 o 6 (la Maza rara y la Cota) y Larry tiene 57 SP para
gastar. Bizzante es el blando del grupo y el que se mete primero en el cuerpo a cuerpo.

## Los creeps que hay cargados en la partida (29)

Goblins: Goblin de choque ×2 (N1, 50 HP, Def 4, Lanza corta 1d4 + 8 con Perfora 2 en Ensartar y sostener; Pared de escudos), Goblin
marcado ×2 (N1, 45 HP, Def 2, Hoz del quintero 1d6 + 7; Tajo frenético, No siente el dolor), Goblin hondero ×3 (N1, 35 HP, honda 1d10 + 2
a 6 casillas; Piedrazo a la cabeza, Lluvia de piedras), Goblin arquero del claro (N1, 35 HP, Arco del monte 1d4 + 3 a 15 casillas con
Envenenar; Flecha untada, Tiro certero), Goblin portaestandarte (N2, 55 HP, Def 5; ¡Por el amo!, Pared de escudos), Goblin jinete de
lobo (N2, 45 HP, Def 5; Carga montada, Aullido de la manada), Goblin domador (N1, 45 HP; ¡Azuzar!, Chasquido), Chamán goblin (N2, 45 HP;
Savia que cierra heridas, Espina de sombra, Trampa de sombra), dos Chamanes Goblin viejos (N2, Regeneración, Proyectil mágico / Veneno,
trampas), tres Goblins del bosque viejos (Garrotazo 2d8 + 8, Caída de culo).

Kobolds: Capataz kobold (N3, jefe, 60 HP, Def 5, 1d10 + 11; ¡A laburar!, Golpe al piso, Trago de grapa, Bronca acumulada), Kobold
Rabioso ×2 (N1, 45 HP, Def 4, 1d4 + 10; Picada, Furia del filón), Kobold escudero de barril (N1, 60 HP, Def 5; Tapa de barril, ¡Tu
vieeeja!), Kobold maldiciente (N2, 40 HP, Def 0; Mal de ojo, Maldición de la sangre), Kobold ballestero (N2, 40 HP, ballesta 1d4 + 2 a
12; Virote a las juntas, Virote al pie) y otro de ojo fino, Kobold boom boom (N2, 35 HP; Cartucho, Cartucho enterrado), Kobold farolero
(N1, 30 HP; Aceite hirviendo, Destello de farol), Kobold tunelero (N2, 30 HP; Excavar, Puñalada desde abajo), Kobold hondero (N1, 25
HP), Kobold hongero (N3, 30 HP; Untar veneno, Bejines, Esporas curativas).

## Los encuentros que probé con los creeps tal cual están (40 peleas cada uno)

Cómo leer cada renglón: cuántas veces ganan los personajes · cuántas caen los tres · «sin definir» = llegó a 12 rondas sin terminar
(en la práctica, un combate que se empantanó: casi siempre Rockardo solo contra dos o tres creeps que se cubren entre sí, con Bizzante y
Larry ya caídos) · rondas promedio · cuántas veces cae cada personaje · con cuánta vida terminan (promedio).

- **Patrulla goblin** (Goblin de choque ×2, Goblin hondero, Goblin marcado): ganan 100 % · nadie cae del todo · 5,5 rondas · cae
  Bizzante 23 % · terminan Rockardo 100 %, Bizzante 63 %, Larry 91 %. Un calentamiento.
- **Las minas** (Capataz kobold, Kobold Rabioso ×2, Kobold hondero, Kobold maldiciente): ganan 98 % · 4,7 rondas · cae Bizzante 28 % ·
  Rockardo 100 %, Bizzante 54 %, Larry 96 %. El Capataz pega fuerte (1d10 + 11) pero no le pasa la Defensa a Rockardo, y Larry lo drena.
- **El jinete** (Goblin jinete de lobo, Goblin domador, Goblin marcado ×2): ganan 100 % · 3,6 rondas · cae Bizzante 13 %. El más flojo.
- **Kobolds variados** (escudero de barril, ballestero, boom boom, farolero, tunelero): ganan 100 % · 5 rondas · cae Larry 23 %,
  Bizzante 8 %. El ballestero y el boom boom le llegan a Larry; el resto no molesta.
- **El chamán** (Chamán goblin, Goblin portaestandarte, Goblin de choque ×2, Goblin arquero del claro): ganan 87 % · sin definir 13 % ·
  8,6 rondas · caen Bizzante 40 %, Larry 30 % · algún caído en el 47 % de las peleas, dos o más en el 23 % · terminan Rockardo 95 %,
  Bizzante 49 %, Larry 55 %. **Este ya es un combate de verdad**: la Espina de sombra y las Pared de escudos estiran la pelea, el
  arquero envenena (el Veneno se acumula y le come la vida a Rockardo por detrás de la Defensa), y los dos de choque con Perfora 2 se
  turnan sobre Bizzante.
- **La grande** (Capataz kobold, escudero de barril, ballestero, Rabioso ×2, maldiciente): ganan 90 % · pierden 3 % · sin definir
  7 % · 9,5 rondas · caen Bizzante 60 %, Larry 50 %, Rockardo 3 % · dos o más caídos en el 43 % · terminan Rockardo 95 %, Bizzante 29 %,
  Larry 40 %. Seis cuerpos: Bizzante y Larry caen seguido y Rockardo termina la pelea solo. Se gana, pero con dos en el piso casi la mitad
  de las veces: para una sesión normal es demasiado; para un «todo o nada» con el jefe, está en el límite.

(Los cuatro primeros se corrieron con una versión de la IA de Larry que regalaba vida por Transfusión hasta quedarse en 2 HP; en «El chamán» y
«La grande», ya corregida. En los cuatro primeros eso solo pudo inflar las caídas de Larry, que de todos modos son pocas.)

## Las variantes (30 peleas cada una)

Lo que el dueño dejó abierto: subir de nivel, darles las skills nuevas (Patotear, Sal en la herida), mejor equipo. Subir un nivel acá es
+3 atributos repartidos (Fuerza, Constitución, Agilidad…), con la vida y los No2 recalculados; las armas son del catálogo, puestas como lo
hace GM Tools; las skills, las recetas de fábrica armadas para el nivel del creep.

- **Patrulla+** (Goblin de choque ×2 **de nivel 2**, Goblin hondero, Goblin marcado **con Patotear**, Goblin marcado **con Sal en la
  herida**): ganan 100 % · 6,4 rondas · cae Bizzante 23 % · terminan Rockardo 99 %, Bizzante 54 %, Larry 93 %. Igual que la Patrulla de
  antes: ni el nivel ni las dos skills cambian el resultado, porque a Rockardo no le entra nada.
- **Minas+** (Capataz kobold **de nivel 4 con Hachón de minero**, Kobold Rabioso ×2 **con Patotear**, Kobold hondero, Kobold maldiciente, **más
  un Kobold ballestero**): ganan 97 % · pierden 3 % · 9 rondas · caen **Bizzante 73 %**, Larry 33 %, Rockardo 3 % · dos o más caídos en el
  33 % · terminan Rockardo 93 %, Bizzante 17 %, Larry 53 %. Se gana casi siempre, pero Bizzante termina en el piso tres de cada cuatro veces:
  el Capataz con el hacha y los dos Rabiosos patoteando lo bajan en dos rondas. Riesgo alto y concentrado en uno.
- **Chamán+** (Chamán goblin **de nivel 3**, Goblin portaestandarte, Goblin de choque ×2 **con Espada de la colimba**, Goblin arquero del claro,
  **más un Goblin marcado con Sal en la herida**): ganan 67 % · pierden 3 % · **sin definir 30 %** · 10,2 rondas · caen Larry 60 %, Bizzante
  53 % · dos o más caídos en el 43 %. Demasiado: seis cuerpos, espadas de dos dados y un chamán que cura más.
- **Emboscada en el claro** (Goblin arquero del claro ×2, Goblin hondero ×2, Goblin de choque ×2): ganan 63 % · **pierden 13 %** · sin
  definir 23 % · 7,9 rondas · caen Bizzante 60 %, Larry 53 %, **Rockardo 13 %** · dos o más caídos en el 40 %. El único encuentro que tira a
  Rockardo: cuatro tiradores que no se paran con Parry y dos flechas untadas por ronda. Una matanza, para no usar así.
- **El Capataz manda** (Capataz kobold **de nivel 5 con Hachón de minero**, Kobold escudero de barril, Kobold Rabioso ×2 **con Patotear**, Kobold
  maldiciente, Kobold ballestero): ganan 87 % · nadie pierde · sin definir 13 % · 10,6 rondas · caen Bizzante 63 %, Larry 27 % · dos o más
  caídos en el 20 % · terminan Rockardo 96 %, Bizzante 27 %, Larry 68 %. Un jefe que se siente (70 HP, 2d8 + 12 con Rompe armadura) y una
  pelea larga; Rockardo lo termina casi siempre, pero Bizzante cae dos de cada tres veces.

Segunda tanda, buscando el punto justo alrededor de «El chamán»:

- **El chamán + un Goblin marcado con Sal en la herida** (seis cuerpos): ganan 70 % · pierden 3 % · sin definir 27 % · 10 rondas · caen
  Bizzante 63 %, Larry 63 % · **dos o más caídos en el 50 %**. El sexto cuerpo rompe el balance: con cinco se gana el 87 %, con seis el 70 %.
- **El chamán, con los dos de choque con Espada de la colimba** (Tipo 6, dos dados, Sangrado 25 %; cinco cuerpos): ganan 87 % · nadie
  pierde · sin definir 13 % · 9,3 rondas · caen Bizzante 30 %, Larry 37 % · dos o más caídos en el 20 % · terminan Rockardo 98 %, Bizzante
  53 %, Larry 44 %. Prácticamente igual que con las lanzas: el arma mejor no cambia la pelea (lo que hace la diferencia son el chamán y el
  arquero, no el filo de los de choque).
- **La guarida, la parte goblin** (Goblin jinete de lobo, Goblin domador, Chamán goblin y, en lugar de los tres lobos que no entraron en la
  simulación, dos Goblin de choque): ganan 97 % · pierden 3 % · **5,5 rondas** · caen Bizzante 47 %, **Rockardo 10 %**, Larry 3 % · dos o
  más caídos en el 10 %. Corta y violenta: la Carga montada y el Chasquido (Miedo) del domador son de las pocas cosas que llegan a voltear a
  Rockardo. Con los lobos de verdad (Mordisco que lisia, en manada sobre el más débil) sería más dura que esto, sobre todo para Larry.
- **Emboscada chica** (un arquero del claro, un hondero, dos de choque y un marcado con Patotear): ganan 90 % · nadie pierde · sin definir
  10 % · 6 rondas · caen Bizzante 30 %, Larry 30 % · dos o más caídos en el 27 % · terminan Rockardo 97 %, Bizzante 53 %, Larry 64 %. La
  otra candidata: más corta que «El chamán», con el mismo riesgo repartido entre Bizzante y Larry, pero sin cura ni buffs del otro lado (menos
  «jugadas» de los creeps).

Tercera tanda: encontré que el simulador dejaba a los personajes sin Parry contra cualquier disparo de un creep, cuando la regla real es
«contra un disparo, Parry solo con escudo» (dueño, 2026-10-09). Corregido, volví a correr los tres encuentros con tiradores: **El chamán**
87 % · pierden 3 % · sin definir 10 % · caen Bizzante 43 %, Larry 60 % · dos o más caídos 37 % (igual de ganable; el reparto de caídas
cambió, pero eso es ruido: con 30 peleas cada número se mueve 10 o 15 puntos entre una tanda y otra). **Emboscada en el claro** 57 % ·
pierden 13 % · sin definir 30 % (sigue siendo la matanza: a Bizzante y a Larry nadie los cubre). **Emboscada chica**: los números de arriba
son los de esta corrida.

## Lo que aprendí viendo las peleas narradas

- **A Rockardo no lo lastiman las armas comunes.** 1d4 + 8 contra Defensa 14 es cero. Lo único que le entra: críticos (ignoran la
  Defensa), Perfora (Ensartar y sostener pasa 2), Veneno y Sangrado (daño por turno), y la magia (Espina de sombra, Maldición). Un
  encuentro que quiera hacerle sentir algo al tanque necesita de eso, no más goblins con lanza.
- **Bizzante es el que cae.** Entra primero, Defensa 5, 25 HP; los creeps lo eligen (en la simulación van al más blando, que es lo que haría
  cualquier GM). Las tres pociones son su seguro; cuando se le acaban, cae. Si la mesa quiere que el riesgo se reparta, los creeps tienen
  que tener motivos para ir a Larry (tiradores, un tunelero que emerge atrás) o para quedarse con Rockardo (Patotear sobre el tanque no
  sirve, sí Perfora y Sangrado).
- **Larry decide la pelea.** Pedos Tóxicos (dos efectos con el nerf) sobre tres o cuatro creeps saca entre 15 y 40 HP en total por tirada y
  deja Stun o Pajaritos a la mitad, y Drenar Vida con X = 12 son 12 + 1d12 contra Res.Esp 7-9: unos 10-12 de daño directo por turno.
  Los creeps con Res.Esp 12-13 (Capataz, escudero de barril) resisten; los demás no. Si el encuentro no lo presiona a él (un arquero, un
  ballestero, algo que lo llegue a 5 casillas), Larry pelea gratis.
- **Rockardo gasta el SP enseguida.** Blindaje cada turno (1 SP) está bien; Shockwave (4 SP) contra Constitución 9-10 falla la mitad de
  las veces. En la simulación se queda sin SP para la ronda 4; un jugador real quizás lo cuide más.
- **Los creeps paran mucho.** Con escudo, Parry 6-8 contra PdG de los personajes 8: la mitad de los golpes van a Parry, y de esos el
  Bloqueo frena una buena parte. Pared de escudos (Endurecido) encima lo vuelve una pared: por eso las peleas «sin definir».

## Sugerencias para los creeps (todo conversable)

- **No subir de nivel a los de cuerpo a cuerpo comunes.** Un Goblin de choque de nivel 2 (55 HP, 1d4 + 9) le hace exactamente lo mismo a
  Rockardo que uno de nivel 1: cero. Subir de nivel sirve para el que tiene algo que sí entra (el Chamán con su Espina de sombra, el Capataz
  con su hacha grande) y para que un jefe aguante más; para el resto, solo alarga la pelea.
- **Lo que le entra al tanque es Perfora, veneno y magia.** Ensartar y sostener (Perfora 2) ya está bien pensado; la Flecha untada (Veneno
  ×3) es lo que más le baja la vida a Rockardo en todas las simulaciones. Un goblin con un arma que envenene o sangre (Hacha oxidada,
  Cuchillo de cazador, Espada de la colimba) le da «algo que hacer» al tanque sin inflar números.
- **Patotear y Sal en la herida rinden, pero no cambian solas un encuentro.** En la Patrulla+ (dos marcados, uno con cada una) el grupo igual
  ganó el 100 %: el bono de dados lo frena la Defensa de Rockardo, y a Bizzante lo matan igual con o sin la skill. Donde sí se notan es en los
  encuentros largos (Minas+, Chamán+): ahí los dados extra y el Sangrado acumulado terminan de bajar a Bizzante y a Larry.
- **El Capataz con un arma de Buena Calidad** (Hachón de minero, Tipo 8, 2 dados, +1, Rompe armadura 33 %) y un nivel más es un jefe que se
  siente: en Minas+ Bizzante cae el 73 % de las veces y Larry el 33 %, y sin embargo el grupo gana el 97 %. Es el perfil de «jefe que
  asusta pero se puede». La Bronca acumulada (no simulada) lo hace peor: cada golpe a él suma, y al quinto estalla una onda de 3d10 + 11.
- **Los tiradores son el riesgo real.** Con dos arqueros y dos honderos (Emboscada) el grupo pierde el 13 % de las peleas y queda
  empantanado otro 23 %: los disparos no se paran con Parry, el arquero envenena y Larry (Rango 5, Evasión 4) no llega a los que tiran desde
  12 o 15 casillas. Dos tiradores en un encuentro es el tope para este grupo; cuatro, una matanza.
- **Más de cinco cuerpos es demasiado** para tres personajes de nivel 2 sin curandero: en todos los encuentros de seis, dos personajes caen en
  más del 40 % de las peleas. Cinco creeps con roles distintos (frente, tirador, apoyo, uno que pegue distinto) es el número.
- **A Larry hay que presionarlo o la pelea es gratis**: un tirador que lo elija a él, un tunelero que emerja a su lado o un creep con
  Res.Esp alta (escudero de barril, Capataz) que no se drene. Y a Rockardo conviene darle un motivo para no quedarse quieto (un apoyo atrás
  que haya que ir a buscar).

## Qué haría yo con el encuentro recomendado (para que la mesa decida)

- Dejar a los cinco como están. Si querés que Rockardo sienta algo, la única palanca que vale es el arquero: que tire a él las dos primeras
  flechas untadas (el Veneno se acumula y le come 5-8 por turno por detrás de la Defensa), no a Bizzante.
- Que el chamán se guarde la Savia que cierra heridas para el portaestandarte (en la simulación la gasta en sí mismo apenas lo tocan).
- Si la pelea sale fácil (Larry stunea a dos con los Pedos en la primera ronda), tenés a mano un Goblin marcado con Sal en la herida como
  refuerzo: con seis cuerpos la pelea pasa de ganable al 87 % a ganable al 70 %, así que entra solo si hace falta.
- Si querés que sea el cierre del Bosque y no un encuentro más, el Capataz de las minas no pega acá, pero el perfil del «jefe que asusta y se
  puede» está medido: un jefe de nivel 4-5 con un arma de Buena Calidad de dos dados y Rompe armadura, acompañado de cuatro, da 87-97 % de
  victoria con Bizzante cayendo dos de cada tres veces. Para el ocultista (nivel 3, 60 HP, magia que ignora la Defensa) ese perfil se cumple
  solo: su daño ya es del tipo que le entra a Rockardo.
- Para Larry: que el arquero y el chamán le disputen el Rango. Si llega a 5 casillas de tres goblins juntos sin que nadie lo moleste, los Pedos
  más el Drenar sacan 20-40 de vida por turno y deciden la pelea solos.

## Una pelea completa, contada

Está aparte, para no hacer ilegible este reporte: [`reporte-encuentro-origen-2026-10-22-pelea.md`](reporte-encuentro-origen-2026-10-22-pelea.md)
(nueve rondas: Rockardo abre con Shockwave y le saca 22 al chamán, Larry gasea a los cuatro goblins y los deja con Pajaritos, el arquero
envenena a Larry; en la ronda 4 los dos de choque, con Bendecido y Endurecido del portaestandarte, bajan a Bizzante a 0; Larry drena al
portaestandarte hasta matarlo y se cura; Rockardo termina al último de choque y camina seis casilleros para aplastar al arquero. Ganan, con
Bizzante en el piso y Larry a 14 de 20.)

## Cómo se simuló (y qué no se simula)

La página `herramientas/simulador-encuentro.html` carga los mismos archivos de reglas que la ficha, GM Tools y el mapa (`comun/ficha-
calculo.js`, `ficha-combate.js`, `ficha-acciones.js`, `ficha-mantenimiento.js`, `creep-calculo.js`, `creep-acciones.js`,
`combatiente.js`, `critico.js`, `estados-aplicar.js`, el catálogo y las recetas de skills de creep) y los datos reales de la partida
exportados a un JSON (las tres fichas con sus partes y los 29 creeps con su ficha privada; el archivo no se sube al repo). Cada pelea:
los tres personajes con la vida, el SP y los No2 llenos y sin estados (salvo los de la túnica); los creeps con la vida llena y los
cooldowns como al empezar; iniciativa tirada con las reglas de cada uno; los turnos con el inicio y el fin de turno de verdad
(Mantenimiento de la ficha y del creep: regeneraciones, estados que vencen, No2 que vuelven); los ataques con el duelo completo (PdG contra
Evasión o Parry si al defensor le conviene y tiene No2, Fuerza del golpe contra Bloqueo, crítico con la Calculadora, Perfora, la Defensa,
los efectos al golpear con su probabilidad); las habilidades dirigidas, de área y de onda con su tirada contra la resistencia que elija
mejor el defensor; las zonas (Pedos) con una exposición al entrar y otra al final de la ronda; las pociones (menos del 40 % de vida).

La IA es simple y a propósito conservadora: Rockardo avanza, Blindaje si tiene un rival a 2 o menos, Shockwave si tiene dos pegados,
y ataca con la Maza mientras le alcancen los No2; Bizzante toma poción si hace falta, avanza y usa Lisiar (si le queda SP) o ataca;
Larry pasa vida por Transfusión a un aliado por debajo del 35 % (sin quedar él por debajo de la mitad), se acerca hasta su Rango, tira
Pedos donde junte 2 o más rivales sin aliados adentro, y Drenar Vida al más herido; si lo tienen pegado retrocede. Los creeps usan
primero los buffs y las curas, eligen al rival a tiro más fácil de lastimar, usan una habilidad de área si agarra a dos, la dirigida
si tienen, y atacan con las habilidades de ataque y después con el arma mientras les alcancen los No2.

Lo que **no** se simula (y que en la mesa puede mover la aguja): el mapa es una línea (sin flanqueos, obstáculos ni línea de tiro); no
hay dodge roll contra las áreas; no se colocan trampas ni se usan Excavar/Emerger, refuerzos, invocaciones (la abeja de Bizzante), Bronca
acumulada, Esporas curativas, contraataques ni ataques de oportunidad; Demora, Mal de ojo, Marcar y Robo quedan «a mano»; los efectos del
d20 de los Pedos se aplican solos (en la mesa los decide quien los tira); el Desarmar y El que avisa no traiciona de los creeps no están.
Patotear y Sal en la herida sí (los bonos se calculan como en el mapa).
