# Balance — peleas simuladas entre arquetipos (2026-10-10)

> Pedido del dueño (2026-10-10): «simulá peleas de los distintos arquetipos con distintos equipos, desde el estándar común a uno de nivel más alto, 1 vs 1 y 2 vs 2, con distintos tipos de armas, a veces la mejor para su clase, a veces una que no tanto». Herramienta: [`herramientas/simular_peleas.py`](../herramientas/simular_peleas.py) (`py simular_peleas.py --n 400`). Cada cruce: 400 peleas hasta que un equipo cae, con armas al azar del catálogo real de esa familia y esa calidad (nivel 1 = Común, 3 = Buena, 5 = Rara).

**Qué mide:** vida (Constitución × 5), Defensa y resistencias a crítico de la curva por nivel (Shooter y Asalto con armadura liviana, Warrior media, Tanque pesada), escudo (+Defensa, Parry contra disparos, Bloqueo), iniciativa, No2 por turno (Agilidad), costo de atacar (la ballesta con su Recarga), Evasión o Parry → Bloqueo (el defensor elige Parry si su Destreza es mayor que su Agilidad y guarda 1 No2 para eso), crítico completo, Perfora, la Fuerza que suma cada familia y la distancia (arrancan a 6 casilleros; el cuerpo a cuerpo se acerca a 1 No2 por casillero; el arco no dispara pegado y se aleja comiéndose el ataque de oportunidad).

**Segunda vuelta:** con **los efectos al golpear** modelados como en el juego (veneno, veneno severo, sangrado, quemadura, rompe armadura, lisiado, pajaritos, derribar → sentado, aturdir → stun, rengo, drena vida, daño elemental extra) y con **el Mago con varitas** (SP = Especial × 3 y su recarga; el costo que sube por uso; el daño directo ignora la Defensa y el especial lo frena la Defensa especial, que el simulador supone 0 en armadura liviana, ¼ de la Defensa en la media y ⅓ en la pesada). A nivel 5 el mago usa varitas Buenas: no hay Raras en el catálogo.

**Qué NO mide:** habilidades, consumibles, terreno y línea de tiro, Support y Debuffer, y la inteligencia táctica de un jugador real. Los números son una guía, no un veredicto.

## Lo que se ve (segunda vuelta, 2026-10-10 — resumen para el dueño)

Corrida con el catálogo de hoy (las dagas y espadas con Perfora, las ballestas nuevas, el Rango como bono en las Comunes), los efectos al
golpear modelados y el Mago con varitas. Lo de la primera vuelta que sigue valiendo se repite acá.

1. **Cuánto suman los efectos al golpear** (tabla «Cuánto suman», abajo). Cada vez que entran: **Sangrado ~6 de daño**, **Veneno ~5**, **Veneno
   severo ~10** (dura toda la pelea), **Prende fuego ~3**, **Drena vida ~0,3 de cura**. Repartido entre todos los ataques de un arma que lo trae
   (con su % y los que fallan): **~0,5 a 0,7 de daño por ataque**, que para un arma liviana (1–3 de daño por ataque contra armadura media) es **un
   20–40 % más**. O sea: la daga que envenena al 25 % suma bastante menos que eso; una al 50 % o «siempre», bastante más. Los de control (lisiado,
   derribar, rompe armadura…) no se ven en daño: su peso está en «con y sin efectos».
2. **Con y sin efectos, por clase:** el que más gana es **el asalto con daga** (nivel 5: 54 % con efectos contra 40 % sin). Al **guerrero con
   hacha** le va peor con efectos (los efectos de los demás lo castigan: tiene poca Evasión). El resto casi no cambia.
3. **Los magos con varita son fuertes** (le ganan al guerrero 70–100 % y al tanque 81–97 %: el daño directo ignora la armadura) y **pierden
   contra el asalto** (15–30 %: Evasión alta, los persigue). Van de 72 % a nivel 1 a **46 % a nivel 5**, porque **no hay varitas Raras** en el catálogo
   (usan Buenas). Con una daga, el mago no hace nada (0–4 %).
4. **La Perfora cambió las cosas:** la **ballesta** pasó a ser la mejor arma del tirador (53–55 % desde nivel 3; el arco, 16–34 %) y contra el
   guerrero gana 70 % / 55 % (antes 37 % / 17 %); contra el tanque ya pega algo (24–28 %, antes 0). El **asalto con daga** subió a 52–56 %.
5. **El tanque con escudo sigue casi intocable para el arco y la daga** (0–8 %): la armadura pesada (P186) sigue siendo el problema de fondo. El
   mago es lo único que lo baja seguido.
6. **Espada y escudo sigue siendo lo mejor para guerrero y tanque**; la hacha a dos manos del guerrero quedó floja (20–43 %). La maza del tanque
   no sirve (le pide Agilidad 5, a propósito).
7. **En parejas, «tanque + mago» es lo más fuerte** (gana casi todo a nivel 1 y 3); a nivel 5 se empareja.
8. **Un nivel de equipo arriba gana casi siempre** (92–100 %), salvo el mago (66–86 %: sus varitas no mejoran).

**Palancas** (tabla al final; ninguna aplicada): con el catálogo nuevo, **el daño mínimo de 1 por dado** sigue siendo la que mejor acomoda al
tanque (el arco le gana 42–66 %, la ballesta 54–92 %) sin tocar al guerrero contra el tanque. Las de Perfora se pasan contra armadura media
(daga y ballesta 80–100 % contra el guerrero).

**Para decidir:** P186 (armadura pesada: el daño mínimo de 1 por dado); faltan **varitas Raras** (o que las varitas escalen) para que el mago no se
caiga a nivel 5; y la **hacha a dos manos** del guerrero rinde menos que espada y escudo.


## 1 vs 1 · nivel 1 (Común) · cada clase con su mejor arma

Cada celda: % de peleas que gana la clase de la fila contra la de la columna (turnos promedio).

| | Warrior (hacha 2 manos) | Tanque (espada y escudo) | Asalto (daga) | Mago (varita) | Shooter (arco) |
|---|---|---|---|---|---|
| **Warrior** | — | 45 % (16.0) | 41 % (8.5) | 0 % (6.8) | 0 % (13.2) |
| **Tanque** | 61 % (15.4) | — | 78 % (23.6) | 2 % (8.9) | 67 % (27.2) |
| **Asalto** | 62 % (8.6) | 5 % (23.4) | — | 76 % (4.0) | 84 % (5.2) |
| **Mago** | 100 % (6.8) | 97 % (8.9) | 26 % (3.9) | — | 67 % (4.9) |
| **Shooter** | 100 % (13.0) | 0 % (27.6) | 20 % (5.2) | 30 % (4.8) | — |

## 1 vs 1 · nivel 3 (Buena Calidad) · cada clase con su mejor arma

Cada celda: % de peleas que gana la clase de la fila contra la de la columna (turnos promedio).

| | Warrior (hacha 2 manos) | Tanque (espada y escudo) | Asalto (daga) | Mago (varita) | Shooter (arco) |
|---|---|---|---|---|---|
| **Warrior** | — | 18 % (15.8) | 46 % (9.7) | 22 % (5.3) | 86 % (11.6) |
| **Tanque** | 80 % (16.0) | — | 95 % (17.1) | 13 % (6.9) | 84 % (24.1) |
| **Asalto** | 53 % (9.7) | 2 % (17.7) | — | 73 % (3.4) | 85 % (3.7) |
| **Mago** | 78 % (5.2) | 86 % (6.9) | 30 % (3.4) | — | 60 % (3.8) |
| **Shooter** | 13 % (11.0) | 2 % (24.3) | 18 % (3.9) | 43 % (3.6) | — |

## 1 vs 1 · nivel 5 (Raro) · cada clase con su mejor arma

Cada celda: % de peleas que gana la clase de la fila contra la de la columna (turnos promedio).

| | Warrior (hacha 2 manos) | Tanque (espada y escudo) | Asalto (daga) | Mago (varita) | Shooter (arco) |
|---|---|---|---|---|---|
| **Warrior** | — | 38 % (14.8) | 34 % (10.6) | 35 % (5.2) | 73 % (7.4) |
| **Tanque** | 66 % (15.6) | — | 56 % (28.7) | 18 % (7.7) | 98 % (16.3) |
| **Asalto** | 62 % (11.6) | 6 % (29.5) | — | 84 % (3.2) | 69 % (3.3) |
| **Mago** | 70 % (5.3) | 81 % (7.6) | 15 % (3.1) | — | 22 % (2.7) |
| **Shooter** | 26 % (7.4) | 0 % (16.0) | 36 % (3.3) | 82 % (2.6) | — |

## 1 vs 1 · ¿qué juego de armas le conviene a cada clase?

% de victorias promedio de la clase con ese juego contra las otras tres clases (cada una con su mejor arma).

| Clase · juego | Nivel 1 | Nivel 3 | Nivel 5 |
|---|---|---|---|
| Warrior · hacha 2 manos ★ | 20 % | 43 % | 43 % |
| Warrior · espada y escudo | 57 % | 61 % | 57 % |
| Warrior · arco | 12 % | 26 % | 25 % |
| Warrior · ballesta | 2 % | 16 % | 24 % |
| Tanque · maza y escudo | 17 % | 19 % | 22 % |
| Tanque · espada y escudo ★ | 49 % | 70 % | 58 % |
| Tanque · ballesta de mano y escudo | 0 % | 20 % | 7 % |
| Asalto · daga ★ | 56 % | 52 % | 54 % |
| Asalto · espada | 66 % | 55 % | 62 % |
| Asalto · maza 2 manos | 45 % | 27 % | 51 % |
| Asalto · arco | 35 % | 41 % | 51 % |
| Mago · varita ★ | 72 % | 61 % | 46 % |
| Mago · daga | 2 % | 4 % | 0 % |
| Shooter · arco ★ | 36 % | 16 % | 34 % |
| Shooter · ballesta | 38 % | 55 % | 53 % |
| Shooter · daga | 11 % | 3 % | 19 % |
| Shooter · hacha 2 manos | 12 % | 9 % | 14 % |

## Diferencia de nivel · la misma clase y arma, un nivel de equipo arriba

% que gana el de nivel más alto (atributos y equipo de su nivel).

| Clase | Nivel 3 contra nivel 1 | Nivel 5 contra nivel 3 |
|---|---|---|
| Warrior | 100 % | 100 % |
| Tanque | 100 % | 92 % |
| Asalto | 99 % | 99 % |
| Mago | 86 % | 66 % |
| Shooter | 100 % | 96 % |

## 2 vs 2 · parejas

% que gana la pareja de la fila contra la de la columna (turnos promedio). Cada uno con su mejor arma salvo que se diga.


### Nivel 1

| | Warrior + Shooter | Tanque + Shooter (ballesta) | Warrior + Tanque | Asalto + Asalto | Shooter + Shooter | Warrior + Mago | Tanque + Mago |
|---|---|---|---|---|---|---|---|
| **Warrior + Shooter** | — | 0 % (15.5) | 0 % (37.1) | 35 % (9.7) | 32 % (11.2) | 20 % (8.8) | 0 % (11.0) |
| **Tanque + Shooter (ballesta)** | 100 % (15.6) | — | 48 % (33.5) | 57 % (28.2) | 97 % (15.4) | 28 % (10.9) | 0 % (13.4) |
| **Warrior + Tanque** | 42 % (36.3) | 3 % (32.8) | — | 55 % (28.7) | 21 % (36.9) | 0 % (12.7) | 0 % (12.8) |
| **Asalto + Asalto** | 68 % (9.5) | 14 % (27.1) | 12 % (27.8) | — | 89 % (6.6) | 74 % (7.5) | 11 % (25.5) |
| **Shooter + Shooter** | 68 % (11.0) | 2 % (16.3) | 8 % (36.3) | 11 % (6.5) | — | 42 % (8.9) | 0 % (11.4) |
| **Warrior + Mago** | 80 % (9.0) | 62 % (11.1) | 100 % (12.5) | 24 % (7.6) | 58 % (8.6) | — | 37 % (8.9) |
| **Tanque + Mago** | 100 % (10.9) | 96 % (13.6) | 100 % (12.6) | 56 % (27.0) | 96 % (10.9) | 63 % (8.9) | — |

### Nivel 3

| | Warrior + Shooter | Tanque + Shooter (ballesta) | Warrior + Tanque | Asalto + Asalto | Shooter + Shooter | Warrior + Mago | Tanque + Mago |
|---|---|---|---|---|---|---|---|
| **Warrior + Shooter** | — | 2 % (13.3) | 0 % (20.4) | 46 % (7.3) | 74 % (11.0) | 19 % (9.2) | 0 % (8.9) |
| **Tanque + Shooter (ballesta)** | 96 % (13.8) | — | 48 % (32.3) | 86 % (19.5) | 91 % (10.2) | 28 % (9.6) | 6 % (11.4) |
| **Warrior + Tanque** | 98 % (20.6) | 4 % (31.9) | — | 84 % (21.8) | 8 % (35.2) | 42 % (10.7) | 1 % (10.5) |
| **Asalto + Asalto** | 50 % (7.3) | 6 % (18.4) | 8 % (23.5) | — | 70 % (4.6) | 77 % (9.2) | 8 % (25.5) |
| **Shooter + Shooter** | 18 % (10.0) | 4 % (10.9) | 20 % (35.1) | 34 % (4.7) | — | 16 % (9.3) | 4 % (11.8) |
| **Warrior + Mago** | 82 % (9.5) | 68 % (9.8) | 67 % (10.8) | 19 % (8.8) | 79 % (8.7) | — | 35 % (7.3) |
| **Tanque + Mago** | 99 % (8.9) | 92 % (11.6) | 100 % (10.5) | 72 % (25.2) | 90 % (10.6) | 55 % (7.2) | — |

### Nivel 5

| | Warrior + Shooter | Tanque + Shooter (ballesta) | Warrior + Tanque | Asalto + Asalto | Shooter + Shooter | Warrior + Mago | Tanque + Mago |
|---|---|---|---|---|---|---|---|
| **Warrior + Shooter** | — | 16 % (13.2) | 16 % (22.8) | 48 % (6.1) | 68 % (7.3) | 40 % (7.1) | 14 % (13.8) |
| **Tanque + Shooter (ballesta)** | 88 % (13.5) | — | 50 % (29.6) | 48 % (25.3) | 74 % (14.3) | 50 % (9.7) | 19 % (14.6) |
| **Warrior + Tanque** | 74 % (21.9) | 16 % (29.9) | — | 23 % (33.7) | 34 % (26.7) | 12 % (10.6) | 4 % (13.7) |
| **Asalto + Asalto** | 44 % (6.6) | 7 % (26.3) | 6 % (35.0) | — | 53 % (4.3) | 85 % (8.9) | 13 % (33.1) |
| **Shooter + Shooter** | 29 % (7.2) | 9 % (13.6) | 22 % (27.1) | 42 % (4.2) | — | 52 % (8.4) | 16 % (19.9) |
| **Warrior + Mago** | 57 % (7.1) | 55 % (10.0) | 84 % (10.4) | 8 % (8.5) | 44 % (8.6) | — | 41 % (8.1) |
| **Tanque + Mago** | 80 % (13.3) | 70 % (15.3) | 91 % (14.4) | 18 % (34.0) | 46 % (22.5) | 50 % (8.1) | — |

## Familias de armas contra la misma vara (un Warrior con hacha a 2 manos)

% que gana la clase de la fila con esa arma contra el Warrior con hacha del mismo nivel. Sirve para comparar armas entre sí, no clases.


**Shooter**

| Arma | Nivel 1 | Nivel 3 | Nivel 5 |
|---|---|---|---|
| Daga | 10 % | 0 % | 0 % |
| Espada | 22 % | 0 % | 1 % |
| Hacha | 4 % | 0 % | 0 % |
| Maza | 2 % | 0 % | 1 % |
| Arco | 99 % | 10 % | 30 % |
| Ballesta | 100 % | 70 % | 55 % |

**Asalto**

| Arma | Nivel 1 | Nivel 3 | Nivel 5 |
|---|---|---|---|
| Daga | 62 % | 42 % | 56 % |
| Espada | 80 % | 55 % | 64 % |
| Hacha | 26 % | 44 % | 82 % |
| Maza | 45 % | 28 % | 70 % |
| Arco | 32 % | 56 % | 64 % |
| Ballesta | 82 % | 40 % | 67 % |

**Warrior**

| Arma | Nivel 1 | Nivel 3 | Nivel 5 |
|---|---|---|---|
| Daga | 44 % | 60 % | 40 % |
| Espada | 64 % | 63 % | 50 % |
| Hacha | 48 % | 54 % | 48 % |
| Maza | 0 % | 68 % | 60 % |
| Arco | 54 % | 60 % | 41 % |
| Ballesta | 7 % | 20 % | 12 % |

## Cuánto suman los efectos al golpear

Juntado en todas las peleas de arriba. «Por aplicación»: el daño que hizo cada vez que entró (en el momento o por turno, hasta que venció o terminó la pelea; Drena vida: lo que curó). «Por ataque»: ese daño repartido entre todos los ataques hechos con armas que lo traen (cuenta la probabilidad y los que fallan): **es lo que suma, en promedio, tener ese efecto en el arma**. Los de control (lisiado, pajaritos, sentado, stun, rengo, rompe armadura) no hacen daño propio: su valor se ve en la tabla de abajo.

| Efecto | Veces que entró | Daño por aplicación | Daño por ataque |
|---|---|---|---|
| Sangrado | 56114 | 6.2 | 0.61 |
| Envenenar | 45707 | 4.7 | 0.52 |
| Prende fuego | 18762 | 2.6 | 0.71 |
| Veneno severo | 1448 | 10.4 | 0.55 |
| Drena vida | 37955 | 0.3 | 0.20 |
| Rompe armadura | 65320 | 0.0 | 0.00 |
| Lisiado | 152047 | 0.0 | 0.00 |
| Rengo | 9676 | 0.0 | 0.00 |
| Derribar | 30028 | 0.0 | 0.00 |
| Demora | 15465 | 0.0 | 0.00 |
| Pajaritos | 4285 | 0.0 | 0.00 |
| Aturdir | 442 | 0.0 | 0.00 |

**Cada clase con su mejor arma, con y sin los efectos** (% de victorias promedio contra las otras clases; nivel 1 / 3 / 5).

| Clase · arma | Con efectos | Sin efectos |
|---|---|---|
| Warrior · hacha 2 manos | 24 % / 44 % / 42 % | 26 % / 53 % / 57 % |
| Tanque · espada y escudo | 50 % / 67 % / 57 % | 49 % / 63 % / 51 % |
| Asalto · daga | 53 % / 51 % / 54 % | 52 % / 48 % / 40 % |
| Mago · varita | 77 % / 64 % / 45 % | 76 % / 63 % / 50 % |
| Shooter · arco | 37 % / 15 % / 34 % | 36 % / 11 % / 34 % |

## Palancas probadas (2026-10-10)

Ninguna está aplicada: es lo que pasaría con cada una. % de victorias de la fila; nivel 1 / 3 / 5.

| Palanca | Shooter (arco) vs Warrior | Shooter (ballesta) vs Warrior | Asalto (daga) vs Warrior | Shooter (arco) vs Tanque | Shooter (ballesta) vs Tanque | Asalto (daga) vs Tanque | Warrior (hacha 2 manos) vs Tanque |
|---|---|---|---|---|---|---|---|
| Como hoy | 100 % / 14 % / 23 % | 100 % / 69 % / 60 % | 57 % / 52 % / 56 % | 0 % / 1 % / 0 % | 8 % / 28 % / 24 % | 4 % / 3 % / 8 % | 42 % / 18 % / 36 % |
| Perfora +1/+2/+3 (por calidad) en dagas y ballestas | 100 % / 14 % / 23 % | 100 % / 92 % / 86 % | 80 % / 80 % / 84 % | 0 % / 0 % / 0 % | 6 % / 20 % / 22 % | 14 % / 15 % / 14 % | 36 % / 18 % / 30 % |
| Armadura media y pesada al 75 % | 100 % / 29 % / 54 % | 100 % / 92 % / 90 % | 88 % / 84 % / 90 % | 0 % / 6 % / 10 % | 10 % / 48 % / 35 % | 30 % / 36 % / 23 % | 54 % / 34 % / 55 % |
| Un golpe que entra pasa al menos ¼ de su daño | 100 % / 47 % / 54 % | 100 % / 89 % / 83 % | 69 % / 66 % / 91 % | 66 % / 78 % / 60 % | 66 % / 94 % / 92 % | 78 % / 70 % / 96 % | 34 % / 26 % / 36 % |
| Perfora por calidad + armadura al 75 % | 100 % / 29 % / 54 % | 100 % / 96 % / 98 % | 94 % / 94 % / 96 % | 0 % / 10 % / 9 % | 8 % / 65 % / 60 % | 57 % / 72 % / 71 % | 57 % / 41 % / 44 % |
| Perfora por calidad SIN tope (+2/+4/+6) en dagas y ballestas | 100 % / 14 % / 23 % | 100 % / 94 % / 98 % | 90 % / 91 % / 100 % | 0 % / 0 % / 0 % | 10 % / 53 % / 56 % | 32 % / 34 % / 60 % | 49 % / 15 % / 38 % |
| Daño mínimo: 1 por dado si el golpe entra | 100 % / 57 % / 52 % | 100 % / 90 % / 80 % | 62 % / 66 % / 86 % | 42 % / 66 % / 60 % | 54 % / 92 % / 78 % | 50 % / 46 % / 88 % | 42 % / 19 % / 34 % |
| Perfora sin tope + 1 por dado (la propuesta) | 100 % / 57 % / 52 % | 100 % / 96 % / 97 % | 92 % / 89 % / 98 % | 44 % / 70 % / 58 % | 52 % / 90 % / 85 % | 57 % / 55 % / 88 % | 32 % / 16 % / 29 % |
