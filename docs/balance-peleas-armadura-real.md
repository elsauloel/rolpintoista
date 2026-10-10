# Balance — peleas simuladas entre arquetipos (2026-10-10)

> Pedido del dueño (2026-10-10): «simulá peleas de los distintos arquetipos con distintos equipos, desde el estándar común a uno de nivel más alto, 1 vs 1 y 2 vs 2, con distintos tipos de armas, a veces la mejor para su clase, a veces una que no tanto». Herramienta: [`herramientas/simular_peleas.py`](../herramientas/simular_peleas.py) (`py simular_peleas.py --n 400`). Cada cruce: 300 peleas hasta que un equipo cae, con armas al azar del catálogo real de esa familia y esa calidad (nivel 1 = Común, 3 = Buena, 5 = Rara).

**Qué mide:** vida (Constitución × 5), Defensa y resistencias a crítico de la curva por nivel (Shooter y Asalto con armadura liviana, Warrior media, Tanque pesada), escudo (+Defensa, Parry contra disparos, Bloqueo), iniciativa, No2 por turno (Agilidad), costo de atacar (la ballesta con su Recarga), Evasión o Parry → Bloqueo (el defensor elige Parry si su Destreza es mayor que su Agilidad y guarda 1 No2 para eso), crítico completo, Perfora, la Fuerza que suma cada familia y la distancia (arrancan a 6 casilleros; el cuerpo a cuerpo se acerca a 1 No2 por casillero; el arco no dispara pegado y se aleja comiéndose el ataque de oportunidad).

**Segunda vuelta:** con **los efectos al golpear** modelados como en el juego (veneno, veneno severo, sangrado, quemadura, rompe armadura, lisiado, pajaritos, derribar → sentado, aturdir → stun, rengo, drena vida, daño elemental extra) y con **el Mago con varitas** (SP = Especial × 3 y su recarga; el costo que sube por uso; el daño directo ignora la Defensa y el especial lo frena la Defensa especial, que el simulador supone 0 en armadura liviana, ¼ de la Defensa en la media y ⅓ en la pesada). A nivel 5 el mago usa varitas Buenas: no hay Raras en el catálogo.

**Qué NO mide:** habilidades, consumibles, terreno y línea de tiro, Support y Debuffer, y la inteligencia táctica de un jugador real. Los números son una guía, no un veredicto.

## Con armaduras REALES del catálogo (2026-10-10, solo Común y Buena — resumen para el dueño)

Esta corrida arma la armadura de cada uno con **piezas del catálogo** (cabeza, torso, manos, piernas, pies y escudo; el tanque elige el tercio
con más Defensa, el resto el del medio; el liviano con torso blando), en vez de la curva de Defensa máxima del informe anterior
([`balance-peleas.md`](balance-peleas.md)). Lo que cambia: el guerrero de armadura media pasa de Defensa 7–10 a **3,5–5,5** y de Res. T4 1–2 a
**0,7–0,9**; el tanque casi igual (Defensa 9–13, Res. T4 2–2,3); los livianos, Defensa 0,5–1,3.

1. **El Crítico frecuente sí rinde** (prueba con la misma daga, nivel 3): contra el guerrero, de 7,3 a **9,3** de daño por ataque; contra el
   tanque, de 1,6 a **3,0** — tanto o más que Perfora 2 (8,6 y 2,8). La «abundancia» de Resistencia a crítico del informe anterior venía de la
   curva máxima, no del catálogo.
2. **El asalto pasa a ser el más fuerte** (daga 69–70 %; le gana al guerrero 84–90 % y al mago 95 %) y **el tirador sube** (arco 55–58 %,
   ballesta 55–67 %).
3. **El guerrero queda muy flojo** (hacha 14–23 %; con espada y escudo 35–45 %): con poca armadura real y poca Evasión, le pegan todos.
4. **El tanque sigue fuerte** (espada y escudo 46–64 %), pero ya no es intocable: el asalto le gana 25–33 % y el tirador 22–29 %.
5. **El mago baja** (53 % a nivel 1, 38 % a nivel 3): con armaduras reales, el daño físico ya entra y su ventaja de ignorar la Defensa pesa menos.

**Lectura:** el problema de fondo no es tanto la armadura pesada como **cuánta armadura lleva de verdad cada rol**. Con el catálogo de hoy, las
piezas de armadura media rinden poco y el guerrero sufre. Para la revisión: ¿la armadura media (y la del guerrero) tiene que proteger más?


## 1 vs 1 · nivel 1 (Común) · cada clase con su mejor arma

Cada celda: % de peleas que gana la clase de la fila contra la de la columna (turnos promedio).

| | Warrior (hacha 2 manos) | Tanque (espada y escudo) | Asalto (daga) | Mago (varita) | Shooter (arco) |
|---|---|---|---|---|---|
| **Warrior** | — | 43 % (11.6) | 15 % (3.9) | 0 % (6.8) | 0 % (7.6) |
| **Tanque** | 58 % (11.7) | — | 63 % (16.5) | 5 % (8.6) | 52 % (21.8) |
| **Asalto** | 84 % (3.7) | 33 % (16.5) | — | 95 % (2.9) | 72 % (3.0) |
| **Mago** | 100 % (6.8) | 93 % (8.4) | 4 % (2.8) | — | 19 % (3.1) |
| **Shooter** | 99 % (7.4) | 29 % (20.9) | 30 % (2.9) | 79 % (3.2) | — |

## 1 vs 1 · nivel 3 (Buena Calidad) · cada clase con su mejor arma

Cada celda: % de peleas que gana la clase de la fila contra la de la columna (turnos promedio).

| | Warrior (hacha 2 manos) | Tanque (espada y escudo) | Asalto (daga) | Mago (varita) | Shooter (arco) |
|---|---|---|---|---|---|
| **Warrior** | — | 15 % (11.6) | 16 % (3.7) | 39 % (4.8) | 17 % (4.1) |
| **Tanque** | 85 % (11.3) | — | 72 % (11.7) | 25 % (6.7) | 71 % (16.9) |
| **Asalto** | 90 % (3.7) | 25 % (11.7) | — | 96 % (2.1) | 68 % (1.9) |
| **Mago** | 65 % (4.9) | 72 % (6.6) | 7 % (2.1) | — | 6 % (2.1) |
| **Shooter** | 89 % (4.2) | 22 % (16.6) | 31 % (2.0) | 95 % (2.0) | — |

## 1 vs 1 · ¿qué juego de armas le conviene a cada clase?

% de victorias promedio de la clase con ese juego contra las otras tres clases (cada una con su mejor arma).

| Clase · juego | Nivel 1 | Nivel 3 |
|---|---|---|
| Warrior · hacha 2 manos ★ | 14 % | 23 % |
| Warrior · espada y escudo | 35 % | 45 % |
| Warrior · arco | 20 % | 17 % |
| Warrior · ballesta | 2 % | 8 % |
| Tanque · maza y escudo | 12 % | 16 % |
| Tanque · espada y escudo ★ | 46 % | 64 % |
| Tanque · ballesta de mano y escudo | 4 % | 32 % |
| Asalto · daga ★ | 69 % | 70 % |
| Asalto · espada | 77 % | 60 % |
| Asalto · maza 2 manos | 56 % | 36 % |
| Asalto · arco | 67 % | 62 % |
| Mago · varita ★ | 53 % | 38 % |
| Mago · daga | 1 % | 2 % |
| Shooter · arco ★ | 58 % | 55 % |
| Shooter · ballesta | 55 % | 67 % |
| Shooter · daga | 32 % | 34 % |
| Shooter · hacha 2 manos | 17 % | 16 % |

## Diferencia de nivel · la misma clase y arma, un nivel de equipo arriba

% que gana el de nivel más alto (atributos y equipo de su nivel).

| Clase | Nivel 3 contra nivel 1 | Nivel 5 contra nivel 3 |
|---|---|---|
| Warrior | 94 % | — |
| Tanque | 99 % | — |
| Asalto | 85 % | — |
| Mago | 96 % | — |
| Shooter | 97 % | — |

## 2 vs 2 · parejas

% que gana la pareja de la fila contra la de la columna (turnos promedio). Cada uno con su mejor arma salvo que se diga.


### Nivel 1

| | Warrior + Shooter | Tanque + Shooter (ballesta) | Warrior + Tanque | Asalto + Asalto | Shooter + Shooter | Warrior + Mago | Tanque + Mago |
|---|---|---|---|---|---|---|---|
| **Warrior + Shooter** | — | 27 % (11.1) | 37 % (27.9) | 23 % (4.7) | 59 % (6.3) | 73 % (6.4) | 15 % (10.3) |
| **Tanque + Shooter (ballesta)** | 82 % (11.3) | — | 79 % (23.5) | 49 % (14.9) | 80 % (11.4) | 43 % (9.6) | 25 % (11.7) |
| **Warrior + Tanque** | 41 % (25.9) | 1 % (24.7) | — | 31 % (19.4) | 7 % (18.9) | 3 % (11.7) | 0 % (12.1) |
| **Asalto + Asalto** | 74 % (4.8) | 51 % (15.9) | 61 % (18.8) | — | 84 % (3.9) | 97 % (3.8) | 53 % (15.6) |
| **Shooter + Shooter** | 41 % (6.3) | 21 % (11.0) | 71 % (20.2) | 19 % (4.1) | — | 69 % (6.5) | 25 % (10.7) |
| **Warrior + Mago** | 33 % (6.3) | 48 % (9.5) | 97 % (12.0) | 5 % (3.6) | 21 % (6.3) | — | 42 % (8.5) |
| **Tanque + Mago** | 87 % (10.2) | 77 % (11.8) | 100 % (11.9) | 37 % (17.0) | 75 % (11.2) | 59 % (8.5) | — |

### Nivel 3

| | Warrior + Shooter | Tanque + Shooter (ballesta) | Warrior + Tanque | Asalto + Asalto | Shooter + Shooter | Warrior + Mago | Tanque + Mago |
|---|---|---|---|---|---|---|---|
| **Warrior + Shooter** | — | 13 % (7.6) | 33 % (16.9) | 32 % (3.2) | 50 % (3.7) | 85 % (5.0) | 21 % (10.3) |
| **Tanque + Shooter (ballesta)** | 76 % (7.5) | — | 86 % (18.7) | 66 % (13.1) | 55 % (11.1) | 83 % (6.7) | 27 % (10.0) |
| **Warrior + Tanque** | 61 % (15.2) | 5 % (18.2) | — | 51 % (15.1) | 9 % (21.6) | 52 % (9.0) | 1 % (9.6) |
| **Asalto + Asalto** | 67 % (3.3) | 36 % (11.8) | 42 % (17.4) | — | 70 % (2.7) | 97 % (3.2) | 42 % (15.0) |
| **Shooter + Shooter** | 38 % (3.9) | 33 % (11.6) | 59 % (23.5) | 33 % (2.8) | — | 88 % (3.8) | 46 % (12.4) |
| **Warrior + Mago** | 21 % (5.0) | 19 % (6.4) | 48 % (9.3) | 2 % (3.3) | 13 % (3.9) | — | 39 % (7.4) |
| **Tanque + Mago** | 72 % (10.6) | 73 % (10.0) | 98 % (9.5) | 43 % (16.6) | 41 % (12.9) | 61 % (7.3) | — |

## Familias de armas contra la misma vara (un Warrior con hacha a 2 manos)

% que gana la clase de la fila con esa arma contra el Warrior con hacha del mismo nivel. Sirve para comparar armas entre sí, no clases.


**Shooter**

| Arma | Nivel 1 | Nivel 3 |
|---|---|---|
| Daga | 41 % | 21 % |
| Espada | 13 % | 29 % |
| Hacha | 10 % | 1 % |
| Maza | 5 % | 1 % |
| Arco | 97 % | 86 % |
| Ballesta | 99 % | 99 % |

**Asalto**

| Arma | Nivel 1 | Nivel 3 |
|---|---|---|
| Daga | 87 % | 85 % |
| Espada | 77 % | 79 % |
| Hacha | 48 % | 69 % |
| Maza | 54 % | 38 % |
| Arco | 89 % | 99 % |
| Ballesta | 97 % | 88 % |

**Warrior**

| Arma | Nivel 1 | Nivel 3 |
|---|---|---|
| Daga | 57 % | 59 % |
| Espada | 55 % | 58 % |
| Hacha | 55 % | 52 % |
| Maza | 0 % | 61 % |
| Arco | 100 % | 99 % |
| Ballesta | 69 % | 82 % |

## Cuánto suman los efectos al golpear

Juntado en todas las peleas de arriba. «Por aplicación»: el daño que hizo cada vez que entró (en el momento o por turno, hasta que venció o terminó la pelea; Drena vida: lo que curó). «Por ataque»: ese daño repartido entre todos los ataques hechos con armas que lo traen (cuenta la probabilidad y los que fallan): **es lo que suma, en promedio, tener ese efecto en el arma**. Los de control (lisiado, pajaritos, sentado, stun, rengo, rompe armadura) no hacen daño propio: su valor se ve en la tabla de abajo.

| Efecto | Veces que entró | Daño por aplicación | Daño por ataque |
|---|---|---|---|
| Sangrado | 16637 | 5.2 | 0.62 |
| Envenenar | 14072 | 3.1 | 0.50 |
| Prende fuego | 8402 | 2.3 | 0.66 |
| Lisiado | 32934 | 0.0 | 0.00 |
| Rompe armadura | 10003 | 0.0 | 0.00 |
| Rengo | 484 | 0.0 | 0.00 |
| Derribar | 3011 | 0.0 | 0.00 |
| Pajaritos | 745 | 0.0 | 0.00 |
| Demora | 1840 | 0.0 | 0.00 |
| Aturdir | 158 | 0.0 | 0.00 |

**Cada clase con su mejor arma, con y sin los efectos** (% de victorias promedio contra las otras clases; nivel 1 / 3).

| Clase · arma | Con efectos | Sin efectos |
|---|---|---|
| Warrior · hacha 2 manos | 13 % / 19 % | 17 % / 26 % |
| Tanque · espada y escudo | 45 % / 60 % | 44 % / 62 % |
| Asalto · daga | 72 % / 69 % | 70 % / 66 % |
| Mago · varita | 56 % / 33 % | 56 % / 38 % |
| Shooter · arco | 58 % / 60 % | 57 % / 57 % |
