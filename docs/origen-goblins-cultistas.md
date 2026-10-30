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

### 👑 1. Jefe humano, mago buffer — nivel 3 (quedó como mago debuffer de nivel 4, más abajo: OK del dueño)

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

### 🛡 2. Goblin picapiedras (choque pesado) — nivel 3 (OK del dueño, 2026-10-27)

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

### 🗡 3. Goblin tunelero (choque liviano) — nivel 2 (OK del dueño, 2026-10-27)

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

### 🏹 5. Arquero humano del culto (Rango, tirador), anti-Larry — nivel 3 (OK del dueño, 2026-10-27: atributos, pasiva y flechas)

Dueño (2026-10-27): «seguimos con el arquero, que también va a tener foco en Larry. Y después vamos al ballestero, que va a tener foco en Bizzante.»

- **Atributos (39)**: Con 10 · Fue 8 · Agi 9 · Des 10 · Esp 2. Vida 50, No2 9, PdG 10 (12 quieto, con el anillo), Evasión 9, Dmg 8, Rango 10 (14 con el arco).
- **Equipo** (nivel 3: las manos + 4 Comunes + 1 Buena): **Arco del rastreador de bestias** (Buena: Tipo 6, 2 dados, Rango +4, Contra el Marcado +2 PdG;
  es de los arcos Buenos que faltan probar en el mapa); **Anillo de Puntería Certera** (PdG +2 si no se movió ni esta ronda ni la anterior), **Capucha de
  lana del culto** (Def.Esp +1, Res.Esp +1), **Chaleco de cuero** (Defensa +2), **Perneras de cuero hervido** (Defensa +1, Evasión +1, Iniciativa −1).
  Queda con Defensa 3, Def.Esp 1, Evasión 10. **Consumible**: Poción de HP (los creeps todavía no usan el carcaj; las flechas especiales, como drop).
- **Skills (4)**: **Disparo señalador** (un ataque + 2 SP, cd 3: si pega, Presa 2 turnos —Evasión −1 y +2 de daño para todos— y Marcado) · **Tiro a la
  cabeza** (1 No2, 2 SP, cd 3: el próximo disparo +2 PdG, Crítico frecuente +1 y potente +1) · **Ráfaga encadenada** (3 SP, cd 3: hasta 3 disparos al
  mismo blanco, cada uno mejor) · **Vigilancia** (1 No2, 2 SP, cd 3: el primero que se mueva en su alcance recibe un disparo con +2 PdG). Sale Tiro certero
  (el Perfora no le sirve contra la Defensa 4 de Larry); entra Disparo señalador, porque con el jefe debuffer nadie más pone la Presa.
- **Sinergia propia**: Disparo señalador deja a Larry Marcado → el arco suma +2 PdG contra el Marcado; quieto, el anillo suma otros +2. La Presa la cobran
  también el híbrido (Red y Remate) y el ballestero.
- **Números contra Larry** (Evasión 4, Defensa 4, 20 de vida): un disparo común le pega el 84 %; Marcado y Presa, el 98 %. El arco hace 2d6 + 8 (15): le
  pasan ~11 (13 con la Presa). Turno 1, Disparo señalador: Larry queda con ~11. Turno 2: **cae el 95 %** (con un solo disparo alcanza casi siempre; la
  Ráfaga, con sus 9 No2, son 2 disparos: 3 + 6). Contra Bizzante y Petro le pega el 67 %.
- **Riesgo**: muy letal contra Larry si tiene línea de tiro. La respuesta de los jugadores es cubrirse (paredes, Petro adelante, el Pedo para saltar
  detrás de algo). Palancas para bajarlo: Fuerza 6 (−2 de daño) o un arco Común de Tipo 4. A decidir con el dueño.
- **Cambios (dueño, 2026-10-27)**: «todos los arcos que tengan tipo 6, pasalos a tipo 4» (hecho en el catálogo: el Arco del rastreador de bestias queda
  2d4, y el primer disparo cuesta 2 No2, los siguientes 4). Y «con Especial 2 no va a poder usar habilidades; le bajaría un poco de Constitución y le
  subiría Especial… también le podría dar una habilidad pasiva que le dé más SP» → propuesta: **Con 8 · Fue 8 · Agi 9 · Des 10 · Esp 4** (Vida 40, SP 12)
  y la pasiva **Recuperación mental** (+1 SP por turno: recarga 3). Sus habilidades cuestan 2 o 3 SP, así que puede usar una por turno sin quedarse seco.
  (El SP solo cuenta con el creep en modo SP; en modo cooldown no se cobra.)
- ~~Números con el arco de Tipo 4 (2d4 + 8)~~ **Corregido (2026-10-27, al crearlo)**: el arco suma **la mitad** del Dmg (`Combatiente.dmgDelArma`):
  2d4 + 4 (9 de promedio), ~5 contra la Defensa 4 de Larry. Larry queda con ~16 tras el Disparo señalador; en el turno 2 un disparo solo no lo tumba,
  la Ráfaga sí el 61 %; en el turno 3, el 95 %. Bastante menos letal de lo que se había calculado.
- **Flechas especiales de los creeps: ya están programadas** (2026-10-20, `vtt-hexgrid/js/12-acciones-nuevas.js`, `acFlechas`): un creep con arco o ballesta
  que lleva flechas o virotes especiales en el **cinturón** elige cuál al atacar, igual que un personaje (se gasta y cobra su No2 al disparar). Solo en
  el ataque común (como un personaje): las habilidades que disparan con el arma (Disparo señalador, Clavar a la pared…) no preguntan. **Decidido (dueño, 2026-10-27)**:
  «una habilidad de disparo debería poder usar una flecha o virote especial» → programado para personajes y creeps (falta probarlo en el mapa). **Consumible propuesto**: 3 **Flechas silbadoras** (Común, Demora) en el cinturón.

### 🏹 6. Goblin ballestero (Rango, trabador), anti-Bizzante — nivel 2 (OK del dueño, 2026-10-27)

Dueño (2026-10-27): «después vamos al ballestero, que va a tener foco en Bizzante».

- **Atributos (36)**: Con 7 · Fue 3 · Agi 8 · Des 13 · Esp 5. Vida 35, No2 8, PdG 13 (15 quieto, con el anillo), Evasión 8, Rango 13, SP 15 (recarga 2).
  La Destreza alta sirve tres veces: puntería, la red (Fuerza contra su Destreza) y lo difícil de detectar sus trampas.
- **Equipo** (nivel 2: las manos + 4 Comunes): **Ballesta de la grieta** (Tipo 4, 1d4 + 2, Armadura rota doble 50 %, seguro si es crítico; Recarga 2;
  lo minero de la Grieta); **Casco de minero** (Defensa +1, luz), **Botas de minero** (Defensa +1, Pisada atenta), **Chaleco de cuero** (Defensa +2),
  **Anillo de Puntería Certera** (PdG +2 si no se movió). Defensa 4. **Consumible**: 3 **Virotes perforantes** (Perfora 2) en el cinturón.
- **Skills (3)**: **Tiro a la rodilla** (un ataque + 2 SP, cd 3: Rengo 2 turnos) · **Clavar a la pared** (un ataque + 3 SP, cd 3: +3 PdG, lo empuja
  hasta 3 casillas; si choca contra algo sólido, Inmovilizado 3 turnos) · **Red tendida** (2 No2, 3 SP, cd 3: red oculta; al pisarla cae en 7 casillas,
  Fuerza contra su Destreza o Inmovilizado hasta el final de la ronda y una más).
- **Rol**: frenar a Bizzante (el Asalto que viene a buscar a los tiradores) y ablandarlo para los demás. La ballesta casi no le pasa la Defensa 5
  (1d4 + 2: ~1 por tiro; 2 seguros con el Virote perforante), pero la mitad de las veces le deja Armadura rota doble (−2 Defensa), y eso lo cobran el
  tunelero y el híbrido. A las abejas de Bizzante (10 de vida) las baja en dos o tres tiros.
- **Números contra Bizzante** (Evasión 8): un tiro le pega el 75 %; quieto, el 88 %; Clavar a la pared (quieto, +3), más del 90 %.
- **Sinergias**: el Rengo del Tiro a la rodilla y el del tunelero (que sale de abajo pegado a Bizzante) lo dejan clavado lejos de los tiradores; la Red
  tendida va en el camino de Bizzante o de Petro (los que caminan); Clavar a la pared se arma con las paredes del mapa que está haciendo el dueño.
- **Cambio (dueño, 2026-10-27)**: «pondría la ballesta de filo fino y el virote especial, que sea algún virote que rompa armadura» → **Ballesta de
  filo fino** (Común: Tipo 4, 1d4 + 4, Crítico potente +2, Recarga 2; ~1,5 por tiro contra la Defensa 5 de Bizzante) y 3 **Virotes rompe-corazas** (Buena: Rompe
  armadura, 1 stack, +1 No2 al dispararlo; el único que rompe armadura sin ser Raro, salvo el de ácido, que suma 1d4 ácido). Cada virote que pega le
  baja 1 la Defensa a Bizzante, para el tunelero y el híbrido.
- **Vuelta atrás (dueño, 2026-10-27)**: «vamos a dejarlo con el arma que habías propuesto vos… en vez de virotes perforantes, vamos con virotes
  dentados que dejen sangrando; esto podría ser sinergia con Sal en la herida del choque liviano» → **Ballesta de la grieta** otra vez (1d4 + 2,
  Armadura rota doble 50 %) y 3 **Virotes dentados** (Común: Sangrado, +1 No2 al dispararlo). Sinergia: el virote deja sangrando a Bizzante (el sangrado
  no lo frena la Defensa y le come la regeneración de la túnica) y el tunelero cobra **Sal en la herida** (si ya sangra, +2 dados y el sangrado sube).

## ✅ Encuentro 1 cerrado (dueño, 2026-10-27: «los otros tres están bien, ok»)

Los seis creeps aprobados: el jefe (mago debuffer, N4), el picapiedras (N3), el tunelero (N2), el híbrido (N3), el arquero (N3) y el ballestero (N2).
**Lo que sigue**: cuando el dueño termine el mapa del encuentro, crear los seis en El origen con sus tokens en ese mapa (es la partida real: con el
OK del dueño en el momento). Antes, probar en «Claude · pruebas» lo que usan y todavía no se vio en el mapa: Excavar y la estela, la flecha o virote
especial en una habilidad de disparo, el Golpe de escudo y la Red (docs/pruebas-en-el-mapa.md). Después: los encuentros 2 y 3.

## ✅ Creados en El origen (2026-10-27, con el OK del dueño: «creá estos creeps en el mapa ENTRADA MINAS»)

Con el paso a paso de GM Tools, a mano (la auditoría del asistente quedó en `auditoria-asistente-creeps.md`). Los seis en **ENTRADA MINAS**, cada uno con
su token oculto: **Cultista de la Grieta** (el jefe, N4, marcado Jefe), **Goblin picapiedras** (N3), **Goblin tunelero** (N2), **Goblin híbrido** (N3),
**Arquero del culto** (N3) y **Goblin ballestero** (N2), con el equipo, las habilidades, los consumibles de diseño en el cinturón (Poción de SP menor,
Piel de Cristal ×2, Poción de HP, 3 Flechas silbadoras, 3 Virotes dentados), la pasiva del arquero (Recuperación mental), el Óleo reparador como drop
fijo del picapiedras y la Red del híbrido sin cooldown al empezar. La Confusión del jefe sí arranca en cooldown (es lenta, como en el catálogo).
- **Además, al crear, cada uno recibió su consumible al azar** (la regla de los drops): el jefe, Ankh de Reencarnación y Runa de silencio; el
  picapiedras, Poción de Cuero Duro; el tunelero, Pergamino grupal de Paso Fantasma; el híbrido, Sales aromáticas; el arquero, Flecha de fuego y
  Vendas; el ballestero, Virote relámpago y Mate cebado. ✅ (dueño, 2026-10-29) El Ankh del jefe ya lo sacó él a mano; los drops los gestiona él al finalizar el combate (qué le llega a los jugadores y qué no).
- Siguen en ENTRADA MINAS los 15 kobolds y ratas de antes (no se tocaron): a decidir si pasan a la Reserva.
- Los nombres son de trabajo: el dueño los cambia si quiere. Los drops fijos del jefe (Polilla mística y Runa aceleradora, `pendientes.md`) no se
  pusieron: a confirmar.
- **Excavar, cambio (dueño, 2026-10-28)**: «que salga en la ubicación que está, no hasta 4 casillas; si está adyacente a un rival, puede atacarle con el
  skill» → al ejecutarla bajo tierra, el tunelero sale en su casilla (sin elegir otra) y apuñala a un rival pegado. Para salir al lado de alguien, primero
  se lo mueve por abajo.

## Encuentro 2 — propuesta conceptual (2026-10-29, esperando al dueño en la compu)

Dueño: «el próximo encuentro va a ser ya dentro de las minas; podemos repetir alguno de los creeps anteriores, en especial el tunelero, pero al menos un
nivel más… y agregar alguno nuevo»; «en el segundo encuentro va a haber algún personaje poderoso tipo mini boss, pero jefe jefe va a ser para el tercero»;
«en el segundo encuentro va a aparecer un town portal».

- **La mina pelea**: penumbra (Luz de la escena 2 o 3), galerías angostas de una o dos casillas (el que se para en el medio tapa el paso; Clavar a la pared
  tiene paredes), **bolsas de grisú** (zonas de gas que marean y **explotan si les llega fuego**: arma de doble filo; hay que programar que el fuego detone
  una zona) y **derrumbes** (trampas que cortan un pasillo o separan al grupo).
- **Los que vuelven**: **dos Goblins tuneleros** (uno a nivel 3, con una skill más —una trampa—, y otro a nivel 2); opcional, el **ballestero a nivel 3**.
- **Los nuevos** (lo que le faltaba al grupo goblin del encuentro 1): **Goblin escudero** (Tanque: tapa de vagoneta como escudo, tapa el pasillo, provoca a
  Petro, desarma, cuida al farolero); **Goblin farolero** (Mago de fuego: aceite hirviendo y llamaradas; su farol es la luz de la sala —si cae, se
  oscurece— y cerca del grisú es una bomba; contra la Def.Esp 0 de Petro); **Goblin hongero** (Support: cura con hongos y esporas, estira la pelea, el
  objetivo prioritario).
- **El mini jefe, tres opciones**: **A. Capataz del culto** (humano: maneja el control mental con un **Cristal de la Grieta**; mientras esté en pie los
  goblins pelean mejor; si lo rompen, quedan aturdidos o liberados un momento; él pelea de lejos con maldiciones, una versión chica del jefe del 3 —la
  preferida de Claude—); **B. Capataz goblin** (lugarteniente: látigo y pico pesado, arrea a los demás, turnos extra, empujones, llama refuerzos);
  **C. Gusano de roca domado** (bestia grande que cava, sale de abajo, se traga a uno o derrumba el techo).
- **El Town portal** (pendiente del 2026-10-28: crearlo y ponerlo de drop): el mini jefe lo lleva encima e **intenta escapar** con poca vida; si no lo
  frenan, se va (vuelve en el 3); si lo tumban antes, el pergamino queda en el botín y el grupo puede volver al pueblo a descansar y comprar antes del
  final. En el mapa: **simple** (se dibuja el portal en la mina y el GM cambia el mapa publicado a mano) o **automático** (el que lo pisa pasa solo al
  mapa del pueblo y vuelve por el mismo portal; trabajo nuevo: hoy los tokens de personaje no cambian de mapa solos).
- **Total**: 5 o 6 creeps más el mini jefe.
- **Preguntas al dueño**: 1) qué mini jefe; 2) si intenta escapar con el portal; 3) portal simple o automático; 4) si va el grisú que explota.


### 👑 Encuentro 2 — el mini jefe: Capataz del culto, nivel 5 (dueño, 2026-10-29: «vamos con el capataz del culto, nivel 5 como jefe»)

Propuesta (esperando el OK; solo skills auditadas, ninguna repetida con el Cultista de la Grieta del encuentro 1):

- **Concepto**: humano, el que maneja a los goblins con el **Cristal de la Grieta**. No pega fuerte: hace que los goblins peguen fuerte. Una versión chica
  del jefe del 3.
- **Atributos (45)**: Con 13 · Fue 4 · Agi 6 · Des 6 · Esp 16. Vida 65 (+10 del jubón = 75).
- **Equipo** (nivel 5: las manos + 3 Comunes + 3 Buenas): manos, **Varita del embrollo** (Buena: 1d4 arcano y 25 % de Confusión) y **Calavera con vela**
  (Buena, otra mano: Def.Esp +2, luz, aura espeluznante de 3 casillas contra la Res.Mt); piezas Buenas, **Jubón de cuero tachonado** (Defensa +2, Def.Esp
  +2, Tipo 4 +2, Vida +10), **Yelmo de cubo** (Defensa +2, Tipo 10 +1 contra la maza de Petro, Iniciativa −1), **Polainas tachonadas de taller** (Defensa +1,
  Def.Esp +1, Tipo 4 +1); Comunes, **Mitones del primer conjuro**, **Babuchas bordadas del adivino**, **Anillo de Foco Arcano**.
- **Skills (6)**:
  1. **Cristal de la Grieta** = el **Estandarte de guerra** con otro nombre (2 No2, 4 SP, cd 4, arranca disponible): lo clava en una casilla; sus aliados a
     3 casillas suman +3 PdG y +5 al daño mientras siga en pie (50 de vida a nivel 5, sin defensas). Romperlo es la decisión del grupo.
  2. **Tirar la bronca** (2 No2, 4 SP, cd 3): los rivales a 3 casillas del escudero tiran Res.Mt o quedan Provocados por él 2 turnos (Petro, Res.Mt 5).
  3. **Grito de pánico** (2 No2, 4 SP, cd 3): su defensa cuando lo alcanzan: onda de 3 casillas, Res.Mt, 1d6 arcano y Miedo.
  4. **Maldición de la sequía** (2 No2, 3 SP, cd 3): corta la Regeneración de Petro y la de la túnica de Bizzante 3 turnos.
  5. **Redoble de tambores** (2 No2, 3 SP, cd 3): +2 No2 a los goblins a 4 casillas y −1 a sus cooldowns.
  6. **Empuje** (Flash, 2 SP): +3 a la próxima tirada de un goblin (o a una resistencia suya).
- **Consumible**: Poción de Piel de Cristal mayor (escudo contra el daño especial: el Drenar Vida y los Pedos de Larry); y el Town portal si escapa.
- **A decidir**: si al romperse el Cristal los goblins quedan aturdidos un momento (mecánica nueva) o solo se pierde el bonus; si escapa con el Town portal;
  si va el grisú.
- **Decidido (dueño, 2026-10-29)**: al romperse el Cristal **no pasa nada más** (solo se termina el bonus; sin mecánica nueva). **Sí escapa con el Town
  portal** cuando le queda poca vida: lo lleva en el cinturón (un creep ya lo puede usar desde sus Acciones: el GM elige la casilla al lado y después lo
  mueve al portal). El grisú: el dueño no lo entendió; se le explicó y queda a su respuesta.
- **Decidido (dueño, 2026-10-30)**: el grisú queda afuera por ahora (anotado en `pendientes.md`, «Ideas del dueño para retomar»).
- **Cambio pedido (dueño, 2026-10-30)**: «quiero que sea mezcla del control/support pero también que haga daño elemental». Propuesta (esperando el OK):
  la mano pasa a la **Varita del relámpago** (Buena: 1d8 eléctrico que salta al más cercano a 4, la mitad); salen **Empuje** y **Maldición de la sequía**;
  entran **Zap** (2 No2, 3 SP, cd 3: 1d4 eléctrico directo y Parálisis 1 turno si no resiste con su Res.Esp; salta con 50 % y 25 % de Parálisis) y
  **Prisión de hielo** (2 No2, 3 SP, cd 3: contra la Evasión, 2d4 de hielo e Inmovilizado hasta 2 turnos; se rompe con Fuerza contra su Ef.Esp). El
  grupo tiene Def.Esp 0 / 0 / 1: el daño elemental entra casi entero. Alternativa: dejar la Sequía y sacar el Redoble.
