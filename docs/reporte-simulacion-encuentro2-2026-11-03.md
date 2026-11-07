# Simulación del Encuentro 2 de El origen — 2026-11-03

Pedido del dueño: copiar en «Claude · pruebas» los tres personajes de El origen, armar un mapa con el fondo del mapa publicado, meter a los creeps
de «MINAS DUNGEON», rodear al grupo y simular la pelea. En El origen **solo se leyó**; todo lo creado está en «Claude · pruebas».

## Cómo quedó armado (queda en «Claude · pruebas» para mirarlo)

- **Mapa «Encuentro 2 (simulación)»**, con el fondo, el ancho y la posición del mapa publicado de El origen (ENTRADA MINAS) y la luz de la escena en
  5, con niebla. Ese mapa no tenía formas propias: sus 3 elementos eran restos de la última pelea (un virote tirado, la nube de Pedos y una Red tendida),
  así que no se copiaron. (MINAS DUNGEON tiene su propio fondo y tampoco tiene formas.) Al terminar volví a publicar el mapa que estaba antes.
- **Personajes**, copiados con todo (atributos, equipo, habilidades, pasivas, cinturón e invocaciones), a vida llena, sin estados de la pelea anterior
  y con el equipo reparado: **Larry (copia)** y **Rockardo Petroshvnick Son (copia)** a nombre de Jugador 1, **Bizzante (copia)** a nombre de Jugador 2,
  con sus abejas (Diestra y Gorda en el mapa).
- **Creeps**: la parte privada de los de El origen no se puede leer con la cuenta de prueba (no es su GM), así que se armaron con las definiciones de
  `docs/origen-goblins-cultistas.md` y lo que se ve en público (nombres del equipo y del arma). **Diferencias probables con lo que cargó el dueño**:
  - **Goblin rompehuesos**: en público tiene «Martillo» y «Escudo» (no el Martillo de bola a dos manos): se le puso **Martillo de herrero** y **Escudo de
    cuero mojado** (a ojo). 5.ª habilidad, Puño de roca.
  - **Ratas** («Dientes infecciosos»): el arma natural armada sobre la Aguja del boticario (Tipo 4, Perfora 2, Veneno 3 al 50 %, seguro si es crítico);
    su tercera habilidad es **Polvareda** (la Bomba de humo con otro nombre). Equipo natural según el documento.
  - **Arquero del culto: fuego**: sin anillo (en público no tiene) y con **Guanteletes de cazador**; «Marca de caza» = el Disparo señalador.
  - **Goblin Alquimista** = el Chamán del azufre, con Coraza rúnica y **Guanteletes de cuero tachonado**.
  - **Capataz del culto**: con **Grito espeluznante** (en lugar del Grito de pánico).
- **Ubicación**: el grupo en el medio de las vías (Rockardo adelante, Bizzante y Larry atrás, las abejas a los costados); el Rompehuesos **pegado** a
  Rockardo, una Rata a 3 casillas al oeste y otra a 4 al sur, el Capataz a 5 al noreste, el Arquero a 9 al este y el Alquimista a 8 al norte.

## Lo que se jugó con clics

- Modo combate, «Traer tokens», **🎲 Tirar iniciativa** (el GM por los creeps, cada jugador por los suyos) y **Ordenar**: Rockardo quedó **primero por la
  Prisa** con 3, y a cada jugador le llegó su aviso («quedaste primero porque tenés Prisa», «Larry: quedaste en el puesto 8»).
- **Un duelo completo**: la Rata le muerde a Larry desde sus Acciones → PdG 1d6+1d8 = 5 contra la Evasión de Larry 1d4 = 3 → 1d4+6 = 9 − Defensa 4 =
  **5 a la vida (20 → 15)** → el Veneno salió (2 en d2), pero Larry es inmune a lo tóxico. El resumen salió en la Mesa.
- El resto de las rondas se simuló aparte (abajo): jugar las 3 rondas enteras con clics, con 11 combatientes, no entraba en el tiempo.

## Las 3 rondas, simuladas con los números del juego

Se leyeron del juego los números de cada uno (vida, Defensa, Def. especial, Evasión, Parry, PdG, PdG.Esp, Ef.Esp, resistencias, armas) y se tiraron los
dados igual que el juego (cada stat con sus dados reales, contacto, daño menos Defensa, crítico con el rango del Tipo, los d20 y la Resistencia a crítico).
Simplificaciones: todos llegan a donde quieren pegar (no se miden pasos), cada uno hace una acción principal por turno con una decisión razonable, sin
Flash ni reacciones. Plan de cada lado: Rockardo pega con la maza al Rompehuesos; Larry tira los Pedos sobre el amontonamiento (o Drenar vida si está
herido); Bizzante con el machete a una rata; las abejas a las ratas. Los creeps: el Arquero, **Marca de caza** a Larry; las Ratas con **Ojo de asesino**;
el Alquimista le pone el **Arma elemental de ácido** al Rompehuesos y después Bola de fuego / Corroer; el Rompehuesos **Arrastra** a Larry y después
martillo (Golpe demoledor en la 2.ª); el Capataz clava el **Cristal de la Grieta** (+3 PdG y +5 de daño a los suyos) y después Tirar la bronca / Zap.

**Una pelea narrada** (orden de iniciativa de la prueba):

```

RONDA 1
  Rockardo → Rompehuesos (maza): 7 contra 8 — falla.
  Arquero → Larry (Marca de caza): 8 contra 4 — pega 8 (−Def 4). Larry queda en 12/20.
    Larry: Presa y Marcado (−1 Eva, +2 de daño para todos) 2 turnos.
  Rata 1 → Larry (Ojo de asesino (mordida)): 8 contra 1 — pega ¡crítico ×3! 33 directo. Larry queda en 0/20 💀 CAE.
  Rata 2 → Bizzante (Ojo de asesino (mordida)): 12 contra 4 — pega ¡crítico ×2! 18 directo. Bizzante queda en 7/25.
  Alquimista: Arma elemental (elige ácido, +1 SP) al Rompehuesos: +1d6 ácido y Armadura rota por golpe, 3 turnos.
  Bizzante → Rata 2 (machete): 1 contra 12 — falla.
  Rompehuesos → Rockardo (martillo): 7 contra 5 — pega 1 (−Def 14). Rockardo queda en 34/35.
    Rockardo: Armadura rota por el ácido (Def 13).
  Capataz: Cristal de la Grieta junto a sus goblins: aliados a 3 casillas +3 PdG y +5 de daño mientras siga en pie (50 de vida).
  Abeja Gorda → Rata 1 (aguijón): 1 contra 3 — falla.
  Abeja Diestra → Rata 1 (aguijón): 6 contra 2 — pega ¡crítico ×2! 10 directo. Rata 1 queda en 20/30.

RONDA 2
  Rockardo → Rompehuesos (maza): 6 contra 7 — falla.
  Arquero → Bizzante (disparo): 10 contra 1 — pega 5 (−Def 5). Bizzante queda en 2/25.
  Arquero → Bizzante (Ráfaga, 2.º): 11 contra 5 — pega 9 (−Def 5). Bizzante queda en 0/25 💀 CAE.
  Rata 1 → Rockardo (Ojo de asesino (mordida)): 7 contra 3 — pega ¡crítico ×2! 28 directo. Rockardo queda en 6/35.
  Rata 2 → Rockardo (Ojo de asesino (mordida)): 10 contra 3 — pega ¡crítico ×2! 32 directo. Rockardo queda en 0/35 💀 CAE.
  Alquimista: Bola de fuego sobre Abeja Gorda, Abeja Diestra:
  Alquimista → Abeja Gorda (Bola de fuego): 7 contra 3 — pega 6 (−Def.Esp 0). Abeja Gorda queda en 39/45.
  Alquimista → Abeja Diestra (Bola de fuego): 9 contra 7 — pega 8 (−Def.Esp 0). Abeja Diestra queda en 2/10.
  Rompehuesos → Abeja Gorda (Golpe demoledor): 3 contra 3 — pega 34 (−Def 3). Abeja Gorda queda en 5/45.
    Abeja Gorda: Armadura rota por el ácido (Def 2).
  Abeja Gorda → Rata 1 (aguijón): 4 contra 4 — falla.
  Abeja Diestra → Rata 1 (aguijón): 2 contra 7 — falla.
  Abeja Gorda: Quemadura −2 (3).
  Abeja Diestra: Quemadura −2 (0).

RONDA 3
  Rompehuesos → Abeja Gorda (martillo): 1 contra 2 — falla.
  Abeja Gorda → Rata 1 (aguijón): 6 contra 10 — falla.
  Abeja Gorda: Quemadura −2 (1).

AL FINAL: Rockardo 0/35 · Larry 0/20 · Bizzante 0/25 · Abeja Gorda 1/45 · Abeja Diestra 0/10 · Capataz 75/75 · Rompehuesos 90/90 · Rata 1 20/30 · Rata 2 30/30 · Arquero 40/40 · Alquimista 50/50
```

**2000 peleas de 3 rondas:**

| | Cae en 3 rondas |
|---|---|
| Larry | **100 %** (casi siempre en la ronda 1) |
| Bizzante | **100 %** |
| Rockardo | **99 %** |
| Abeja Diestra / Gorda | 85 % / 26 % |
| Cualquier creep | **0 %** |

**Variantes, para ver qué lo vuelve tan letal:**

| Variante | Larry | Bizzante | Rockardo |
|---|---|---|---|
| Tal cual | 100 % | 100 % | 99 % |
| Sin el Cristal de la Grieta | 100 % | 100 % | 92 % |
| Ratas sin Ojo de asesino | 100 % | 100 % | 88 % |
| Una sola rata | 100 % | 100 % | 84 % |
| Una rata, sin Ojo de asesino ni Cristal | 100 % | 96 % | 34 % |

## Qué tan peligroso resultó

**Muy por encima de lo que el grupo aguanta**: en la simulación el grupo no gana nunca y en 3 rondas no tumba a ningún creep.
- **Larry cae siempre y primero**: 20 de vida, Evasión 4 y Defensa 4. Una mordida de rata con crítico (×2 o ×3, sin Defensa) le hace 18–33; la Marca de
  caza del Arquero lo deja Presa (+2 de daño para todos) y el Arrastrar del Rompehuesos lo trae al lado del martillo.
- **El grupo casi no pega**: Rockardo (PdG 8) contra el Parry 8 del Rompehuesos falla la mitad; Bizzante (PdG 8) contra la Evasión 12 de las ratas casi
  nunca entra. Los creeps tienen mucha más vida (75, 90, 50, 40, 30, 30).
- **Lo más letal**: las dos ratas (PdG 14 contra Evasiones de 4 a 8, crítico frecuente), y el Arquero.

## Recomendaciones para el dueño

- **Sacar una rata** o hacer que la segunda llegue después (con el Chillido o en la ronda 2), y **bajarles el PdG o la Evasión** (Des 13 → 10, Agi 11 →
  9): hoy los jugadores casi no les pegan y ellas pegan siempre.
- **Que el Arquero no arranque con Marca de caza sobre Larry** (o que esté más lejos, con línea de tiro tapada por las galerías).
- **El Cristal de la Grieta desde la ronda 2**, cuando el grupo ya se movió.
- **Ojo con el nivel**: el grupo es de nivel 2 (117 de experiencia) y los creeps son de nivel 3 a 5.
- Si se quiere dejar así, darle al grupo algo (un aliado, consumibles de defensa o un primer turno para posicionarse) y que **Larry no empiece al alcance**.

## Bugs

- **El resumen del duelo dice «Quedó con Envenenar»** cuando Larry es inmune a lo tóxico y no le quedó nada, y usa el nombre del efecto del arma
  («Envenenar») en vez del estado («Veneno»). Anotado, sin arreglar.
- Con la automatización, la tecla B y el ⚡ del token no abrieron las Acciones de la rata, y el clic en el token para elegir el objetivo no se tomó (hubo que
  hacerlo por dentro). No está confirmado que pase con el mouse de verdad.

## Capturas (`/home/user/capturas/`)

`sim-e2-01-armado-GM.png` (el armado) · `sim-e2-02-iniciativa-GM.png` · `sim-e2-03-aviso-orden-J1.png` · `sim-e2-04-acciones-rata-GM.png` ·
`sim-e2-05-duelo-rata-larry-GM.png` · `sim-e2-06-duelo-rata-larry-fin-GM.png` · `sim-e2-07-duelo-rata-larry-J1.png` · `sim-e2-08-duelo-visto-por-J1.png` ·
`sim-e2-09-tras-el-mordisco-GM.png`

## Segunda vuelta (grupo a nivel 3, creeps reales) — 2026-11-03

Con la cuenta de Claude ya co-GM de El origen, los creeps de «MINAS DUNGEON» se leyeron **tal cual los cargó el dueño** (solo lectura de Firestore, sin
abrir GM Tools ni el mapa de El origen). Todo lo modificado está en «Claude · pruebas», mapa «Encuentro 2 (simulación)».

### Qué se le sumó a cada personaje (copias, de nivel 2 a 3)

| Personaje | Atributos (+3) | Pieza Buena | Habilidad | Pasiva | Queda |
|---|---|---|---|---|---|
| **Larry** | Con +2, Agi +1 (era el más frágil) | **Coraza rúnica** (Def +2, Def.Esp +2, Res.Esp +2, SP +3, Res.Mt +1): tapaba su Def.Esp 0 y su Res.Esp 4 | **Maldición debilitante** (−1 a todas las tiradas del rival, acumulable) | **Robustez** (+5 de vida) | Vida 35, Def 6, Def.Esp 2, Eva 5, Res.Esp 8, No2 5 |
| **Rockardo** | Des +2, Con +1 (su problema era pegar: PdG 8) | **Guanteletes del mazo** (PdG con contundentes +1, Def +1, Bloqueo +1): su maza es contundente | **Taunt** (provocar: que los creeps vayan contra él y no contra Larry) | **Puntería** (+1 PdG) | Vida 40, Def 15, Def.Esp 0, PdG 11 (12 con la maza) |
| **Bizzante** | Con +2, Des +1 | **Guantes de cuero reforzado** (Def +1, Def.Esp +1, Parry +1) | **Ojo de asesino** (+1 PdG, +2 de daño, +1 a los dos críticos) | **Pies ligeros** (+1 Evasión) | Vida 35, Def 6, Def.Esp 2, Eva 9, PdG 9 |

Subidos con la experiencia (como lo hace la ficha) y con el presupuesto de atributos y Job justos (39 de 39; Job 8 de 9).

### En qué diferían los creeps reales de la versión aproximada

- **Goblin rompehuesos**: Con 13 · Fue 11 · Agi 6 · Des 8 (no 14/11/6/7), 85 de vida; **Martillo de carpintero** (no de herrero) y **Escudo fluorescente
  de bronce**; cinturón: Poción de Ímpetu y Piel de Cristal mayor.
- **Arquero del culto: fuego**: Con 7 · Fue 6 · Agi 8 · **Des 13** · Esp 5, 35 de vida, **PdG 14** (era 11); **Arco de emboscada** (no el de estopa);
  pasiva **Impulso** (no Recuperación mental); **Mina explosiva** (no la del cazador); cinturón: 3 Flechas silbadoras y **Mina napalm**.
- **Goblin Alquimista** (el Chamán): **Esp 15** (no 14), Des 7; cinturón: Poción de HP y **Pergamino de Escudo Arcano**; sin pasiva.
- **Capataz del culto**: igual a lo definido; su tercera habilidad es **Grito de pánico** (en la copia se ve como Grito espeluznante, por la
  puesta al día del nombre); cinturón con Town portal, Piel de Cristal mayor, Pergamino grupal de Reserva Ampliada y Runa de silencio.
- **Ratas**: iguales a lo definido (PdG 15, Evasión 12, «Polvareda» como tercera habilidad, Chillido).

### Lo que se jugó con clics

- **Iniciativa**: modo combate, «Traer tokens», cada uno tiró la suya, **Ordenar** → cartel de Prisa → ✔ Aplicar: **Rockardo primero por la Prisa**
  y cada jugador recibió su puesto. (En la prueba automática, el clic en el botón «Ordenar» no abrió el cartel; abierto con la misma función que llama
  el botón. No se pudo confirmar si pasa con el mouse de verdad.)
- **Rata → Larry** (Evasión): la mordida pegó, pero con la **Defensa 6 nueva le entró 1** (35 → 34). En la primera vuelta le había entrado 5 de 20.
- **Rompehuesos → Rockardo** (Parry con la maza, Bloqueo, Fuerza del golpe): pasó el golpe, 1d10 + 11 contra Defensa 15: **le entró 1** (40 → 39).

### Resultado (2000 peleas de 3 rondas, con los números reales y las mismas reglas simplificadas de la primera vuelta)

| | Primera vuelta (nivel 2, creeps aproximados) | **Segunda vuelta (nivel 3, creeps reales)** |
|---|---|---|
| Larry cae | 100 %, casi siempre en la ronda 1 | **100 %**: la mitad en la ronda 1, la otra mitad en la 2 |
| Bizzante cae | 100 % | **99 %**, casi siempre en la ronda 2 |
| Rockardo cae | 99 % | **92 %**, casi siempre en la ronda 3 |
| Creeps que caen | ninguno | casi ninguno (Rompehuesos 4 %, una rata 2–3 %) |
| Personajes en pie al final | — | 0,08 de 3 |

Variantes: **con una sola rata**, Larry 100 %, Bizzante 87 %, Rockardo 49 %; **sin el Cristal**, 100 / 96 / 61 %; **una rata, sin Cristal y sin Ojo de
asesino**, Larry 100 %, Bizzante 29 %, Rockardo 2 % (1,7 personajes en pie de 3).

**Lectura**: la subida de nivel ayuda (Rockardo aguanta una ronda más, Larry ya no cae siempre en la primera), pero **el encuentro sigue siendo
casi seguro letal**. Lo que mata no es el daño de base (contra Defensa 6 las mordidas entran poco: se vio en los duelos), sino **los críticos de las
ratas** (PdG 15 contra Evasión 5: con Ojo de asesino crítico ×2 o ×3 directo, que ignora la Defensa: 18–42 de una) y que **todos van contra Larry**
(Marca de caza, mordida, Arrastrar, Zap). El grupo casi no les saca vida a los creeps en 3 rondas (el Rompehuesos tiene 85, el Capataz 75).

### Recomendaciones de ajuste

1. **Ratas**: es lo que más cambia el resultado. Bajarles la Destreza (13 → 10: PdG 12) o sacarles **Ojo crítico** (la pasiva): así dejan de critear
   casi siempre a Larry. O una sola rata desde el principio y la otra con el Chillido.
2. **El Cristal de la Grieta en la ronda 2**, no en la 1 (sin él Rockardo pasa de caer 92 % a 61 %).
3. **Repartir los objetivos**: que el Arquero abra con Marca de caza sobre Rockardo o Bizzante, no sobre Larry, y que el Rompehuesos arrastre a
   Bizzante; Larry (el que más daño en área hace con los Pedos) es el que el grupo necesita vivo.
4. **Menos vida en los grandes** si se quiere que el grupo pueda ganar: hoy en 3 rondas no tumban a nadie. Por ejemplo el Rompehuesos sin el Anillo
   de Vitalidad Extendida y el Capataz que intente escaparse con el Town portal antes (a la mitad de la vida).
5. Con 1 + 2 + 3 juntos, la simulación queda cerca de «una pelea dura que se puede ganar» (la variante más suave: 1,7 de 3 en pie a la ronda 3).

### Para tener en cuenta

- La simulación sigue simplificando (no mide pasos ni la línea de tiro, una acción por turno, los jugadores no usan consumibles): es una guía.
- Quedan en «Claude · pruebas»: el mapa, las tres copias a nivel 3 y los seis creeps copiados de El origen (con el daño de los dos duelos).

### Variante pedida por el dueño: una sola rata y el Cristal recién en la ronda 2 (2026-11-03)

Mismo grupo a nivel 3 y creeps reales; 2000 peleas. «Gana» = caen todos los creeps.

| Variante | Rondas | Larry cae (ronda) | Bizzante cae (ronda) | Rockardo cae (ronda) | En pie del grupo | Creeps caídos (promedio) | Gana | Cae el grupo entero |
|---|---|---|---|---|---|---|---|---|
| **A** · 1 rata + Cristal en R2 | 3 | 100 % (R1 59 %, R2 40 %) | 80 % (sobre todo R3) | 24 % (R3) | 0,96 de 3 | 0,14 | 0 % | 24 % |
| A | 4 | 100 % | 98 % (R3 62 %, R4 16 %) | 86 % (R4 59 %) | 0,17 | 0,24 | 0 % | 85 % |
| **B** · A + ratas Des 10 (PdG 12) | 3 | 100 % (R1 50 %, R2 48 %) | 65 % (R3) | 15 % (R3) | 1,21 | 0,16 | 0 % | 14 % |
| B | 4 | 100 % | 95 % | 72 % (R4) | 0,33 | 0,28 | 0 % | 71 % |
| **C** · A + ratas sin Ojo crítico | 3 | 100 % (R1 44 %, R2 54 %) | 65 % (R3) | 12 % (R3) | 1,24 | 0,20 | 0 % | 11 % |
| C | 4 | 100 % | 95 % | 75 % (R4) | 0,30 | 0,29 | 0 % | 74 % |

Los creeps que llegan a caer son casi siempre el Rompehuesos (≈ 13 % en 4 rondas) o una rata (5–11 %); el Capataz, el Arquero y el Alquimista no caen.

**Lectura**: ninguna de las dos combinaciones lo deja «duro pero ganable»: **en ninguna el grupo gana** (0 %), y con tiempo (4 rondas) termina cayendo
entero 7 de cada 10 veces. La más suave es la **C** (una rata, Cristal en R2, ratas sin Ojo crítico), apenas mejor que la B. El problema ya no es solo
la rata: **Larry cae el 100 % en las dos primeras rondas** porque lo apuntan el Arquero (Marca de caza y Ráfaga), el gancho del Rompehuesos y el Zap, y
**el grupo no tiene daño para tumbar 300 de vida de creeps** (85 + 75 + 50 + 35 + 30) en 3–4 rondas. Para que sea ganable hace falta además bajar la
cantidad o la vida de los creeps (por ejemplo, sacar al Arquero o al Alquimista, o que el Capataz escape a la mitad de su vida) y repartir los
objetivos para que no vayan todos a Larry.

(Simplificación conocida: con «una sola rata» la segunda queda en el mapa sin actuar, como en la primera vuelta; no cambia el resultado.)

### Variante pedida por el dueño: sin el Arquero y el Capataz escapa a la mitad de su vida

Reglas de esta variante: el Arquero no está; cuando el Capataz llega a la mitad de su vida usa el Town portal y sale de la pelea. No cuenta como caído, pero ya no actúa.

- **V1:** dos ratas, Cristal en la ronda 1.
- **V2:** una sola rata, Cristal en la ronda 2 y ratas sin Ojo crítico.

Son 2000 peleas por fila. «Hasta el final» significa que la pelea sigue hasta que cae un bando, con un tope de 8 rondas.

| Variante | Rondas | Cae Larry | Cae Bizzante | Cae Rockardo | PJ en pie (de 3) | Creeps caídos | Gana el grupo | Cae el grupo entero | Escapa el Capataz | Rondas promedio |
|---|---|---|---|---|---|---|---|---|---|---|
| V1 | 3 | 98 % | 95 % | 75 % | 0,32 | 0,16 | 0 % | 75 % | 0 % | 3 |
| V1 | 4 | 99 % | 99 % | 96 % | 0,06 | 0,22 | 0 % | 96 % | 0 % | 4 |
| V1 | hasta el final | 99 % | 99 % | 100 % | 0,02 | 0,22 | 0 % | 99 % | 1 % | 3,3 |
| V2 | 3 | 79 % | 13 % | 3 % | 2,05 | 0,48 | 0 % | 1 % | 0 % | 3 |
| V2 | 4 | 85 % | 42 % | 39 % | 1,34 | 0,75 | 0 % | 24 % | 1 % | 4 |
| V2 | hasta el final | 88 % | 72 % | 94 % | 0,46 | 1,11 | 4 % | 71 % | 11 % | 5,8 |

Lectura:

- **Sacar al Arquero no alcanza.** Con dos ratas y el Cristal en R1 (V1), el grupo cae entero casi siempre:
  - Larry cae en R1–R2.
  - Bizzante cae en R2–R3.
  - Rockardo cae en R3–R4.
- **V2 aguanta mucho más al principio.** Al final de la R3 quedan unos 2 de 3 en pie. Pero si la pelea sigue hasta el final, el grupo gana solo el 4 % y cae entero el 71 %.
- **El Town portal casi no se usa.** El Capataz escapa como mucho el 11 % de las veces. Al grupo le falta daño para bajarle la mitad de la vida: casi todo el daño se va en la rata y el Rompehuesos.
- **Para que el encuentro sea ganable con tres PJ de nivel 3** hace falta, además de V2, bajar la vida o la defensa del Rompehuesos, o la del Capataz, o sacar al Alquimista.

Nota: en esta corrida los PJ pueden atacar a cualquier creep (incluidos el Alquimista y el Capataz). En las anteriores tenían una lista de objetivos más corta, por eso los números de V1 cambian apenas.

### Ajuste pedido por el dueño: bajar vida y Defensa (y quizás un nivel) sin quitar al Chamán

Las pruebas parten de la versión 2:

- sin Arquero;
- una sola rata, sin Ojo crítico;
- Cristal en la ronda 2;
- el Capataz escapa a la mitad de su vida;
- el Chamán (el Goblin Alquimista) sigue en la pelea.

Cada pelea va hasta el final, con un tope de 8 rondas. Cada opción se corrió 2000 veces. Se probaron unas 650 combinaciones:

- vida −10 a −40 y Defensa −1 a −3 al Rompehuesos y al Capataz;
- vida y Defensa del Chamán;
- vida y puntería de la rata;
- bajar un nivel a uno, dos o los tres.

**Corrección del simulador.** Hasta ahora, la rata que llega con el Chillido aparecía pero no atacaba, y nadie la atacaba. Como quedaba «en pie», el grupo nunca podía ganar. Ya está corregido: la rata llamada pelea y se le puede pegar. Esto hace la pelea un poco más difícil. Con el arreglo, la versión 2 sin cambios da:

- el grupo gana el 5 %;
- el grupo cae entero el 85 %.

Antes daba 4 % y 71 %. Las tablas anteriores de este reporte se corrieron sin este arreglo.

**Qué es «bajar un nivel» acá** (−3 atributos según su rol; la habilidad que pierde no estaba en la simulación):

| Creep | Atributos | Vida | Efecto | Habilidad que pierde |
|---|---|---|---|---|
| Rompehuesos 4→3 | Fue −2, Con −1 | −5 | Su daño fijo baja 2 | Puño de roca |
| Capataz 5→4 | Esp −2, Con −1 | −5 | PdG.Esp y Ef.Esp −2 | Hálito polar |
| Chamán 4→3 | Esp −2, Con −1 | −5 | PdG.Esp y Ef.Esp −2 | Parpadeo |

**Resultado principal.** Bajando solo vida y Defensa, el grupo gana como mucho un 55–60 %. Con eso, en un tercio de las peleas cae el grupo entero. Para entrar en la franja pedida hay que tocar también **el daño de la rata**: −4 a su PdG, como si tuviera Des 9. Ni así se baja de un 20 % de «cae el grupo entero»:

- Las peleas se polarizan: o cae casi nadie, o caen los tres.
- El que define es Larry. Cae temprano (R2–R3) por la rata, el Arrastrar del Rompehuesos y la Bola de fuego.
- Cuando cae, los otros dos quedan en desventaja.

Lo único que lo baja de 10 % fue sacar el Cristal de la Grieta y además recortar daño del Rompehuesos y del Chamán.

| Opción | Rompehuesos (vida / Def) | Capataz (vida / Def) | Chamán (vida / Def) | Rata (vida / PdG) | Gana el grupo | Cae el grupo entero | Caen 0 / 1 / 2 PJ | Rondas (si gana) | Quién suele caer |
|---|---|---|---|---|---|---|---|---|---|
| Sin cambios (V2) | 85 / 6 | 75 / 7 | 50 / 5 | 30 / 15 | 5 % | 85 % | 3 / 6 / 7 % | 5,4 (6,2) | Larry 91 % (R2), Rockardo 96 %, Bizzante 86 % |
| Más difícil: vida −30, Def −3, Rompehuesos un nivel menos | 50 / 3 | 45 / 4 | 30 / 3 | 20 / 11 | 60 % | 29 % | 37 / 22 / 13 % | 5,8 (5,5) | Larry 52 % (R2–R3), Rockardo 47 % (R5–R6) |
| Solo vida y Defensa (sin bajar niveles) | 45 / 3 | 35 / 4 | 30 / 3 | 20 / 11 | 65 % | 27 % | 39 / 20 / 12 % | 5,6 (5,4) | Larry 52 %, Rockardo 44 % |
| Vida/Def + Rompehuesos un nivel menos | 40 / 3 | 35 / 4 | 30 / 3 | 20 / 11 | 68 % | 24 % | 42 / 24 / 11 % | 5,6 (5,3) | Larry 49 %, Rockardo 39 % |
| **Recomendada: vida/Def + un nivel menos a los tres** | **40 / 3** | **30 / 4** | **25 / 3** | **20 / 11** | **73 %** | **21 %** | **47 / 22 / 10 %** | **5,4 (5,1)** | **Larry 47 % (R2), Rockardo 33 %, Bizzante 24 %** |
| Más fácil: la recomendada sin Cristal, Rompehuesos Fue −3 y Chamán PdG.Esp −4 | 40 / 3 | 30 / 4 | 25 / 3 | 20 / 11 | 84 % | 8 % | 59 / 24 / 8 % | 5,6 (5,2) | Larry 37 % (R2) |

Cómo se llega a los números de la **recomendada**:

- **Rompehuesos:** vida 85 → 40 (−40 y −5 del nivel), Def 6 → 3, Con 12, Fue 9 (daño fijo 9).
- **Capataz:** vida 75 → 30 (−40 y −5), Def 7 → 4, PdG.Esp 14, Ef.Esp 14. Escapa al llegar a 15 de vida, cosa que pasa en el 43 % de las peleas.
- **Chamán:** vida 50 → 25 (−20 y −5), Def 5 → 3, PdG.Esp 15, Ef.Esp 13.
- **Rata** (también la que llega con el Chillido): vida 30 → 20, PdG 15 → 11.

Lectura:

- Con la recomendada, el grupo gana el 73 % en unas 5 rondas. Lo normal es que caiga **Larry** (en la R2) o nadie.
- Todavía cae el grupo entero 1 de cada 5 peleas, así que no llega al «rara vez (< 10 %)». Para llegar hay que sacar el Cristal o recortar daño, como en la opción «más fácil». Pero esa opción ya gana el 84 %, por encima de la franja pedida.
- Entre las dos opciones de igual tamaño, **bajar un nivel rinde más que solo vida/Def**: 73 % contra 65 % de victorias y 21 % contra 27 % de caída total, con menos recorte de vida.
- El simulador es simple: los PJ no se curan, no se retiran ni usan acciones defensivas. En mesa, con esas decisiones, la caída total debería ser menor.
