# «El origen de las especies»: los goblins de la Grieta (rework de los kobolds)

> Hoja de trabajo (dueño, 2026-10-27). Se retoma desde acá en cualquier conversación. Método: [`metodo-diseno-encuentros.md`](metodo-diseno-encuentros.md)
> (grupo → creeps → progresión → botín). Se diseña primero y se programa después.

## Lo que pidió el dueño (2026-10-27)

- «Los kobolds ya no van a existir… los vamos a usar como base, pero van a ser goblins… que tienen algún tipo de control mental, maldición, por
  parte de unos cultistas.»
- «Reworkearlos para que sean más poderosos que los de la última pelea, que fue bastante aburrida… los creeps no le hicieron prácticamente nada a
  los jugadores. Los jugadores no subieron de nivel.»
- **Tres encuentros**, con **goblins de nivel 2 o 3** acompañados de **humanos**: los goblins son la base, los humanos los comandantes, «más astutos».
- Primer encuentro, en función de los jugadores: **algo que le pase la armadura a Petro**, **tiradores que aparezcan por los costados y apunten a
  Larry**, puede haber **magia**, **alguien que ponga trampas**.
- **Solo habilidades auditadas** (las de estos días, `HABILIDADES_CREEP_CATALOGO`); las demás quedan archivadas como referencia.

## El grupo (leído de la partida el 2026-10-27, solo lectura)

| | Petro (Rockardo, Tanque N2) | Larry (Debuffer N2) | Bizzante (Asalto/Summoner N2) |
|---|---|---|---|
| Vida | 35 (Regeneración) | 20 | 25 (+2 por turno, Túnica) |
| Defensa / Def.Esp | **12** / 0 | 4 / 0 | 5 / 1 |
| Evasión / Parry / Bloqueo | 7 / 8 / 9 | 4 / 5 / 4 | 8 / 8 / 6 |
| Res.Esp / Res.CC / Res.Mt | 7 / 7 / **5** | **4** / 5 / **19** | 5 / 5 / 9 |
| Res. a crítico (T4…T12) | 1·1·1·1·0 | 0 | 2·0·0·0·0 |
| Ataque | Maza 3d10 + 10 (Tipo 10), 9 No2 | Drenar Vida, Pedos Tóxicos (zona), 57 SP, Rango 5, 4 No2 | Machete 1d6 + 6 (Rompe armadura), 2 Abejas (10 HP) |
| Cinturón | nada | nada | 1 Poción de HP, Antorcha |

Lectura: a Petro no le entra un arma común (Defensa 12); su punto flaco es la **Res.Mt 5** (control mental) y la Def.Esp 0. Larry es frágil (20 HP,
Evasión 4, Res.Esp 4), pero con Res.Mt 19 el control mental no le hace nada; si los goblins se amontonan, los Pedos los barren. Bizzante es el blando
del cuerpo a cuerpo; sus abejas caen con cualquier área.

(También están en la partida «Estrella culona», la ficha de prueba del dueño, y «Aurelius Risus, el mago sonriente», Asesino N1: falta confirmar si juega.)

## De kobold a goblin (los conceptos que se conservan)

| Kobold de antes | Goblin nuevo | Rol (línea de `creeps-humanoides.md`) | Encuentro |
|---|---|---|---|
| Kobold Rabioso | Goblin rompecorazas | Warrior — Hachero (W1) | 1 |
| Kobold ballestero / de ojo fino | Goblin ballestero ×2 | Rango — Tirador (R1) y Trabador (R3) | 1 |
| Kobold boom boom | Goblin trampero | Hunter (R4) | 1 |
| Kobold maldiciente | (lo reemplaza el cultista humano) | Debuffer (D1) | 1 |
| Kobold escudero de barril | Goblin escudero | Tanque | 2 |
| Kobold farolero | Goblin farolero | Mago — Piromante (M1) | 2 |
| Kobold hongero | Goblin hongero | Support — Sanador (S1) | 2 |
| Kobold tunelero | Goblin tunelero | Choque liviano (Excavar todavía no está auditada) | 2 o 3 |
| Capataz kobold | Capataz goblin (lugarteniente) | Jefe de los goblins | 3 |

## Encuentro 1 — la composición del dueño (2026-10-27)

Dueño: «un choque pesado, un choque liviano, dos shooters, uno humano y uno goblin, el humano con arco, el goblin con ballesta, y el humano jefe que
sea mago de buffer… en nivel 1 tenés 2 skills, a partir de nivel 2, 3, 4, un skill más por nivel. Pensémoslos para que generen sinergia consigo
mismos y entre sí.» (La primera propuesta —cultista Debuffer, rompecorazas, dos ballesteros, trampero— quedó descartada.)

Propuesta de skills (esperando el OK; todas auditadas):

- 👑 **Jefe humano, mago buffer (Support), nivel 3 — 4 skills**: Armas perforantes · Señalar la presa · ¡A la carga! · Bendecir el arma (Flash).
- 🏹 **Arquero humano (Rango, tirador), nivel 3 — 4 skills**: Tiro certero · Tiro a la cabeza · Ráfaga encadenada · Vigilancia.
- 🏹 **Ballestero goblin (Rango, trabador), nivel 2 — 3 skills**: Tiro a la rodilla · Clavar a la pared · Red tendida.
- 🛡 **Choque pesado goblin, nivel 3 — 4 skills**: Provocar · Romper armadura · Golpe demoledor · Piel de hierro.
- 🗡 **Choque liviano goblin (sangrador), nivel 2 — 3 skills**: Golpe que sangra · Sal en la herida · Hit and run.

Sinergias: la Presa del jefe sobre Larry (−2 Evasión, +4 de daño de cada golpe) la cobran los dos tiradores y el liviano; las Armas perforantes
(3 puntos pasan siempre la Defensa) hacen que el Sangrado del liviano le entre a Petro; el pesado provoca a Petro (Res.Mt 5) y le rompe la armadura;
la Red y la Vigilancia frenan a Petro si va por los tiradores; ¡A la carga! suma a todos. Riesgo a simular: Ráfaga encadenada sobre una Presa puede
tirar a Larry en un turno.

### Lo minero y el que se enterraba (dueño, 2026-10-27: «había algo de los kobolds que eran medio mineros en su equipo; había uno que se enterraba, que me gustaría mezclar»)

Lo que ya hay en el catálogo y en los kobolds de la partida: **Ballesta de la grieta** (Común: Tipo 4, +2, Armadura rota doble 50 %), **Varita de la
grieta** (Buena: 1d6 arcano y −2 Defensa 2 turnos), **Hachón de minero** (Buena: Tipo 8, 2 dados, Rompe armadura 33 %), **Hacha con pico** (Buena),
**Honda de minero**, **Casco de minero** (y reforzado), **Botas de minero** (Pisada atenta), **Mochila de minero con farol**, **Lámpara de minero**
(consumible), **Capucha de lana del culto**. «La Grieta» ya existe en el lore (la ballesta, la varita, la capucha del culto): el culto la adora.

El que se enterraba: el **Kobold tunelero** (Daga; Excavar y Puñalada desde abajo, de El origen, sin auditar; la mecánica ya está programada para
creeps: `vtt-hexgrid/js/46-bajo-tierra.js`). Propuesta: el **choque liviano** pasa a ser el **Goblin tunelero**, con esas dos auditadas.

Guía general propuesta (esperando el OK):

- 👑 Jefe humano, mago buffer, N3 — Varita de la grieta + Capucha de lana del culto. Armas perforantes · Señalar la presa · ¡A la carga! · Bendecir el arma.
- 🏹 Arquero humano, N3 — arco. Tiro certero · Tiro a la cabeza · Ráfaga encadenada · Vigilancia.
- 🏹 Ballestero goblin, N2 — Ballesta de la grieta, Casco de minero. Tiro a la rodilla · Clavar a la pared · Red tendida.
- 🛡 Choque pesado goblin (picapiedras), N3 — Hachón de minero, Casco de minero, Botas de minero. Provocar · Romper armadura · Golpe demoledor · Piel de hierro.
- 🗡 Choque liviano goblin (tunelero), N2 — Daga o pico chico, Botas de minero. Excavar · Puñalada desde abajo · Golpe que sangra.

### Sexto creep y trampas (dueño, 2026-10-27)

- «Yo sumaría un choque más, un híbrido entre Full Warrior y choque liviano, para que también distraiga a Bizante y al mago. No lo marcaría como jefe
  aún, pero lo pondría a nivel 4 y que sea un debuffer.» → 🗡⚔ **Choque híbrido (warrior + liviano), nivel 4 (5 skills), con debuffs**, contra
  Bizzante y Larry. A confirmar: goblin o humano, y si «el mago» es Larry.
- «Que alguno de ellos ponga trampas también.» → el ballestero ya trae Red tendida; se puede sumar una trampa de choque liviano (Polvo cegador,
  Abrojos, Aguja en el piso, Cordón oculto) al tunelero o al híbrido.

## Creep por creep

### 👑 1. Jefe humano, mago buffer — nivel 3 (propuesta, esperando el OK)

- **Atributos (39)**: Con 9 · Fue 3 · Agi 6 · Des 6 · Esp 15. Vida 45, No2 6, Rango 6, SP 47 (regen 7).
- **Equipo** (criterio del dueño, nivel 3: las manos + 4 Comunes + 1 Buena): manos, Varita de la grieta (Buena, la de nivel 3) y Grimorio gastado;
  piezas, Capucha de lana del culto, Túnica de aprendiz, Mitones del primer conjuro y Babuchas bordadas del adivino. Queda: PdG.Esp 16, Defensa 0,
  Def.Esp 3, Res.Esp 12, Res.Mt 19, Evasión 6. **Consumible**: Poción de SP menor (o un Pergamino grupal de Furia de Combate, si un creep lo puede usar).
- **Skills**: Armas perforantes (1 No2, 3 SP, cd 3) · Señalar la presa (1 No2, 2 SP, cd 3) · ¡A la carga! (2 No2, 3 SP, cd 3) · Bendecir el arma
  (Flash, 2 SP, cd 2; el doble en turno ajeno). La varita: 1 No2 + 3 SP, 1d6 arcano y −2 Defensa 2 turnos.
- **Números** (su PdG.Esp 16, 2d8, contra cada uno): Señalar la presa entra 97 % contra Larry (Res.Esp 4), 94 % contra Bizzante (5), 88 % contra
  Petro (7). La varita contra la Evasión: Larry 97 %, Petro 88 %, Bizzante 87 %.
- **Plan de turnos**: 1.º ¡A la carga! + Armas perforantes al picapiedras (3 No2); 2.º Señalar la presa a Larry + la varita a Petro (2 No2, −2
  Defensa); Bendecir el arma, con el botón, al que está por pegar.
- **Botín**: la Varita de la grieta (Buena) y la Capucha del culto; candidato a llevar los drops fijos de la Polilla y la Runa aceleradora.

#### El jefe, a nivel 4 (dueño, 2026-10-27: «le subiría un nivel más… y le pondría algún equipo que le pare, por lo menos uno de crítico tipo 4 y
algo de defensa… elegí el mejor objeto posible»; y «el mago» era Larry: el híbrido va por Bizzante y Larry)

- **Atributos (42)**: Con 12 · Fue 3 · Agi 6 · Des 6 · Esp 15 (los 3 puntos nuevos, a la Constitución: más vida, sin subir más la puntería).
  Vida 60, No2 6, Rango 6, SP 47 (regen 7).
- **Equipo** (nivel 4: las manos + 3 Comunes + 2 Buenas): Varita de la grieta (Buena) y Grimorio gastado; **Capacete de hierro** (Buena: Defensa +3,
  Res. crítico Tipo 4 +1, Res.Mt +1 — el que más Defensa da de los que tienen Tipo 4), Túnica de aprendiz, Mitones del primer conjuro, Babuchas
  bordadas del adivino. Sale la Capucha del culto. Queda: PdG.Esp 16, Defensa 3, Def.Esp 2, Res. crítico Tipo 4 1, Res.Esp 14, Res.CC 12, Res.Mt 20,
  Evasión 6. Consumible: Poción de SP menor.
- **Quinta skill**: Ojo certero (1 No2, 3 SP, cd 3: Crítico frecuente +2 y potente +2, 2 turnos) al arquero. Alternativa: Arrojo (Flash, 3 SP: escudo de 10).

#### Corrección del dueño (2026-10-27): el jefe es **debuffer**, no support

Dueño: «cuando dije híbrido me refería a un choque que sea híbrido entre Warrior y choque liviano, para molestar a Larry y a Bizzante. Cuando dije lo
de nivel 4 me refería al mago de los creeps, que yo en principio me lo imaginaba como debuffer, no como support. Así que lo subiría a nivel 4 y le
pondría algún skill de daño siniestro que sume algo de daño mágico directo, estilo debuff.»

- 👑 **Jefe humano, mago debuffer, nivel 4** — atributos y equipo como arriba (Con 12 · Fue 3 · Agi 6 · Des 6 · Esp 15; Varita de la grieta, Grimorio
  gastado, Capacete de hierro, Túnica de aprendiz, Mitones del primer conjuro, Babuchas bordadas del adivino; Poción de SP menor).
- **Skills (propuesta)**: **Aguja siniestra** (2 No2, 3 SP, cd 3: PdG.Esp contra Evasión, 1d6 siniestro directo, Herida sombría y Punto débil 2 turnos)
  · **Maldición de la coraza** (2 No2, 3 SP, cd 3: contra Res.Esp, −2 Defensa y −2 Def.Esp 3 turnos) · **Confusión** (2 No2, 3 SP, cd 4 lenta: contra
  Res.Mt, el control mental del culto) · **Sanguijuela** (2 No2, 3 SP, cd 3: 2d6 siniestro, se cura la mitad, el objetivo no se cura 4 turnos) ·
  **Mal de ojo** (Flash, 5 SP, el botón 🧿).
- **Números** (PdG.Esp 16): contra la Evasión (Aguja, Sanguijuela, la varita) Larry 97 %, Petro 88 %, Bizzante 87 %; contra la Res.Esp (Coraza, Mal
  de ojo) Larry 97 %, Bizzante 94 %, Petro 88 %; Confusión contra la Res.Mt: Petro 94 %, Bizzante 80 %, Larry 35 %.
- Se van Armas perforantes, Señalar la presa, ¡A la carga!, Bendecir el arma y Ojo certero (eran de support).

### 🛡 2. Goblin picapiedras (choque pesado) — nivel 3 (propuesta, esperando el OK)

- **Atributos (39)**: Con 11 · Fue 9 · Agi 6 · Des 8 · Esp 5. Vida 55 (+5 = 60), No2 6, PdG 8, Parry 8, Dmg 9, Bloqueo 9, Evasión 6, Res.Esp y Res.CC 11,
  Res.Mt 5, Rango 8. SP 15 (regen 2) si va en modo SP.
- **Equipo** (nivel 3: las manos + 4 Comunes + 1 Buena): **Hachón de minero** (Buena: Tipo 8, 2d8 + 1, Rompe armadura 33 %) y **Escudo de cuero
  endurecido** (Defensa +2, Res. crítico Tipo 4 +1); **Peto de placas de aprendiz** (Defensa +4, Tipo 4 +1, Vida +5, Res.CC +1, Iniciativa −1),
  **Casco de minero** (Defensa +1, Luz +3), **Botas de minero** (Pisada atenta, Defensa +1), **Grebas de cuero** (Defensa +1, Tipo 4 +1).
  Queda con **Defensa 9** (15 con Piel de hierro) y Res. crítico Tipo 4 3. **Consumible**: Poción de Cuero Duro (escudo de 15 contra el daño físico:
  para aguantar la maza de Petro).
- **Skills**: Provocar (1 No2, 2 SP, cd 2: PdG.Esp + nivel contra Res.Mt) · Romper armadura (un ataque + 2 SP, cd 3) · Golpe demoledor (un ataque +
  4 SP, cd 4, lenta) · Piel de hierro (1 No2, 4 SP, cd 3: +6 Defensa, +6 Def.Esp, +1 resistencia a crítico, 2 turnos).
- **Números**: el hachón hace 2d8 + 10 (19 de promedio): a Petro le pasan ~7 (9 con la Coraza maldita del jefe), a Bizzante ~14, a Larry ~15. Su PdG 8
  (1d8) contra Petro: 50 % (Evasión 7 o Parry 8); contra Bizzante 49 %; contra Larry 75 %. Provocar: Petro 97 %, Bizzante 62 %, Larry 14 %.
- **Sinergias**: provoca a Petro (que con la Confusión del jefe puede terminar pegándole a los suyos), se pone Piel de hierro y le rompe la armadura con
  cada golpe que pega; la Coraza maldita del jefe le suma −2. Mientras Petro está con él, no va por el jefe ni por los tiradores.
- **Cambio del dueño (2026-10-27)**: «el golpe demoledor yo lo reemplazaría por alguno que dé demora, ya que tiene duplicado romper armadura» →
  propuesta: **Golpe de escudo** (un ataque + 2 SP, cd 2: pega con el escudo, sin Parry, contra la Evasión; si pasa algo de daño, Sentado y Demora 1).
  Alternativas: Puño de roca (un ataque + 2 SP, cd 2: +2 al daño y Demora) o Takle (Flash, 2 No2 y 3 SP: Con + 2 contra Con, −3 No2, empujón y al final
  del orden).
- **Elegido (dueño, 2026-10-27): Golpe de escudo**, con la regla corregida: «no suma el peso del escudo. Usa el escudo como si fuera un arma de tipo 10…
  si es un escudo que pesa 3, tira 3 de 10 y daño». Programado (`comun/creep-duelo.js`, `formulaDano`). Con el Escudo de cuero endurecido (peso 2):
  2d10 + 9 (20 de promedio).
- **Costo (dueño, 2026-10-27)**: el Golpe de escudo cuesta **5 No2** (lo de un primer ataque de Tipo 10) **y 2 SP** (se probó 4 No2 y 3 SP y volvió atrás). Programado.
- **Consumibles (dueño, 2026-10-27)**: además de la Poción de Cuero Duro (la usa en la pelea), un **Óleo reparador** como drop temático («ya que tiene
  romper armadura»): hoy se usa solo fuera de combate (repara 3 de durabilidad y 3 de armadura rota de una pieza no rota), así que el creep no lo usa;
  va como drop fijo. A decidir si el óleo se puede usar en combate.
- **Decidido (dueño, 2026-10-27)**: el Óleo reparador solo como drop (se usa fuera de combate; el creep no lo usa). La Poción de Cuero Duro se cambia por la
  **Poción de Piel de Cristal** (Común: escudo de 15 que absorbe solo el daño especial), porque su Defensa especial es 0 (6 con Piel de hierro).

### 🗡 3. Goblin tunelero (choque liviano) — nivel 2 (propuesta, esperando el OK)

Dueño (2026-10-27): «en tunelero, el fin de enterrarse, que sea el mismo skill con golpes desde abajo, que sea solo todo un solo skill. Que no sean dos
skills, porque si no después buscarlos vinculados el uno al otro va a ser una pasada.»

- **Atributos (36)**: Con 6 · Fue 7 · Agi 10 · Des 9 · Esp 4. Vida 30, No2 10, PdG 9 (10 con los guanteletes), Evasión 10, Dmg 7.
- **Equipo** (nivel 2: las manos + 4 Comunes): **Pica Hielos** (Tipo 4, 2 dados, PdG −1: el pico chico); **Chaleco de cuero** (Defensa +2), **Casco de
  minero** (Defensa +1, luz), **Botas de minero** (Defensa +1, Pisada atenta), **Guanteletes de cazador** (PdG +1, Defensa +1, Res. crítico Tipo 4 +1).
  Defensa 5. **Consumible**: Poción de HP.
- **Skills (3)**:
  1. **Por abajo** (una sola, nueva: junta Excavar y Puñalada desde abajo; el nombre, a gusto del dueño). Si está arriba: se mete en la tierra (1 No2): nadie
     lo puede elegir de objetivo ni le llega un área, un salto eléctrico o una oportunidad; puede quedarse abajo los turnos que quiera. Si está abajo: sale
     por una casilla libre a 4 o menos del pozo y apuñala con su arma (lo de un ataque): +3 PdG, +1d6 al daño, Crítico frecuente +1; si pega, Rengo 1 turno
     (crítico: Rengo 2 y Lisiado 1). Cooldown 2 desde que sale. **Falta programarla** (hoy son dos: `excavar` y `emerger`, vtt-hexgrid/js/46).
  2. **Golpe que sangra** (un ataque, cd 2): Sangrado.
  3. **Polvo cegador** (la trampa: 1 No2, 2 SP, cd 3): Ceguera 1 turno en 7 casillas (ve a 2, PdG y PdG.Esp a la mitad), Res.CC contra su Destreza.
- **Números**: sale de abajo con PdG 10 + 3; el daño, 2d4 + 7 + 1d6 (15 de promedio): a Larry le pasan ~11, a Bizzante ~10, a Petro ~3.
- **Sinergias**: abajo no lo alcanzan los Pedos de Larry; sale pegado a Larry (o a Bizzante), lo deja Rengo para que no se escape de los tiradores; el Polvo
  cegador en el camino de Larry le corta la visión (no puede apuntar a más de 2) y a Bizzante le parte el PdG.
- **La estela del túnel (idea del dueño, 2026-10-27: «mientras el chabón está enterrado, deja atrás una estela de tierra levantada, roquitas, algo así,
  que quede hasta el principio de su siguiente turno, durante una ronda completa. Cuando se va, van desapareciendo de a uno, de atrás para adelante, con
  cierta lentitud, no es que simplemente hace un blink out»)**. Se puede: hoy un token bajo tierra ya se mueve (el GM lo arrastra) y los jugadores no lo
  ven. Plan: cada casilla que recorre abajo (y el tramo hasta donde sale) queda marcada en el token (`tunel`, campo nuevo: hay que pegar la regla) y el mapa
  dibuja tierra removida con piedritas en esas casillas; al empezar su próximo turno se borran de a una, de la más vieja a la más nueva, cada una con un
  desvanecido. A decidir: ¿la estela la ven los jugadores (delata por dónde va)? Sin programar todavía.
- **Ajuste (dueño, 2026-10-27)**: «lo pienso muy vulnerable [a] Larry, así que lo voy a enfocar más en Bizzante». Y Larry casi no camina (tiene muy pocos
  No2; se mueve con el pedo que salta alto), así que **las trampas casi no le sirven contra él**. Propuesta: el tunelero va por Bizzante y cambia el **Polvo
  cegador** por **Sal en la herida** (un ataque + 2 SP, cd 3: si ya sangra, +2 dados y el sangrado sube): Golpe que sangra → Sal en la herida, contra la
  regeneración de la túnica de Bizzante. Números contra Bizzante (Defensa 5, Evasión/Parry 8): saliendo de abajo pega el 84 % (PdG 1d10 + 3), un ataque
  común el 60 %; Por abajo le pasa ~10, Golpe que sangra ~7 + 2 por turno, Sal en la herida (sangrando) ~12. La trampa del encuentro sigue siendo la Red del
  ballestero (para Petro y Bizzante, que sí caminan).
- **Siguiente**: el híbrido, enfocado en aguantar a Larry y lidiar con él.
- **La estela, decidida (dueño, 2026-10-27)**: «está bien que la vean los jugadores, porque si no es muy zarpado, como una especie de super sigilo
  indetectable. Que los jugadores sepan dónde va. Y también el GM agarra la ficha, la desplaza, la suelta, que la animación de la creación de la estela de
  tierra que ven todos también sea de atrás para adelante de manera suave.» → la ven todos; al soltar el token, la estela aparece casilla por casilla desde
  la primera hasta la última, suave; dura hasta el principio de su próximo turno y se va igual, de atrás para adelante. Sin programar todavía.

### 🗡⚔ 4. Goblin híbrido (Warrior + choque liviano), anti-Larry — nivel 3 (OK del dueño)

Dueño (2026-10-27): «el siguiente choque… el híbrido, más enfocado en resistir a Larry y en lidiar con él. Larry tiene muy pocos nitros… se creó ese skill
donde puede tirarse un pedo para desplazarse con un salto alto; las trampas mucho no van a servir porque él prácticamente no se desplaza.»

- **Atributos (39)**: Con 11 · Fue 8 · Agi 8 · Des 8 · Esp 4. Vida 55 (+5 = 60), No2 8, PdG 8 (9 con los guanteletes), Evasión 8, Dmg 8, Res.Esp 11.
- **Equipo** (nivel 3: las manos + 4 Comunes + 1 Buena): **Espada de la colimba** (Tipo 6, 2 dados, Sangrado 25 %) y **Cruz de plata** (Buena, otra mano:
  Res.Esp +2 en toda tirada; una vez por ronda, si le gana la Res.Esp a una habilidad o varita, los estados le rebotan 1 turno a quien la tiró); **Capa de
  viajero** (Def.Esp +1, Res.Esp +1, Vida +5), **Capucha de lana del culto** (Def.Esp +1, Res.Esp +1), **Escarpines de piel de cururú** (Def.Esp +1, Res.
  tóxico +1), **Guanteletes de cazador** (PdG +1, Defensa +1, Tipo 4 +1). Queda con **Res.Esp 15**, Def.Esp 3, Res. tóxico 1.
- **Skills (4)**: **Salto** (un ataque + 2 SP, cd 3: hasta 3 casilleros por encima de lo que haya, sin No2 ni oportunidad, +1 PdG y Crítico frecuente +1)
  · **Red** (auditada, debuffer/hunter; 2 No2 y 3 SP, cd 4, lenta: PdG contra Evasión, dentro de su Rango; si gana, Inmovilizado hasta 3 turnos; al
  empezar su turno el atrapado tira Fuerza contra la Destreza del híbrido para soltarse, gratis; un aliado pegado lo ayuda por 1 No2) · **Remate** (un ataque + 2 SP, cd 3: herido a la
  mitad +2 dados, a un cuarto +3) · **Ojo de asesino** (un ataque + 2 SP, cd 2: +1 PdG, +2 al daño, +1/+1 a los críticos).
- **Números contra Larry** (Con 4, Evasión 4, Defensa 4, 20 de vida, 4 No2): la Red lo atrapa el 86 % (a Bizzante, el 62 %); Larry se suelta solo el 25 %
  por turno (Fuerza 4 contra Destreza 8), con Bizzante pegado ayudándolo el 68 %; Salto le pega el 94 %, un
  golpe común el 86 %; la espada hace 2d6 + 8 (15): le pasan ~11 por golpe; con Larry a la mitad, el Remate (+2d6) lo tumba. Aguantando a Larry: el Drenar
  Vida con X = 5 lo resiste el 61 %, con X = 8 el 18 %, con X = 10 el 6 %; los Pedos le ganan el 66 % (contra Res.Esp 4 sería el 99 %).
- **Cambio (dueño, 2026-10-27)**: «una red, tipo red Neruvian… para reemplazar el tackle sin que pierda su turno» → **Red** en lugar de Takle: Larry no
  pierde el turno (puede tirar Drenar Vida y Pedos), pero no se escapa con el salto del Pedo. **Consumible**: «como la del cuero, que da escudo, pero contra
  daño especial» → **Poción de Piel de Cristal** (Común, escudo de 15 que absorbe solo el daño especial), para aguantar el Drenar Vida y los Pedos.
- **Decidido (dueño, 2026-10-27)**: «le vamos a quitar a la red que empiece con cooldown. Que quede así» → en este creep la Red **arranca disponible** (cd 4 desde que la usa; al crearlo, `cdArranca: false` en su copia). OK al híbrido.
- **El tunelero: la habilidad única se llama «Excavar»** (dueño, 2026-10-27). Al programarla, reemplaza a «Excavar (El origen)» y a «Puñalada desde abajo» (las dos sin auditar) y a la vieja «Excavar» de fábrica.
- **Programado (2026-10-27)**: la habilidad **Excavar** única (`comun/skills-creep-base.js`; meterse 1 No2 sin cooldown; salir = un ataque, cd 2) y **la estela del túnel** (vtt-hexgrid/js/46). Falta: pegar la regla nueva (`tunel`) y probarlo en el mapa.
