# Balance — peleas simuladas entre arquetipos (2026-10-10)

> Pedido del dueño (2026-10-10): «simulá peleas de los distintos arquetipos con distintos equipos, desde el estándar común a uno de nivel más alto, 1 vs 1 y 2 vs 2, con distintos tipos de armas, a veces la mejor para su clase, a veces una que no tanto». Herramienta: [`herramientas/simular_peleas.py`](../herramientas/simular_peleas.py) (`py simular_peleas.py --n 400`). Cada cruce: 400 peleas hasta que un equipo cae, con armas al azar del catálogo real de esa familia y esa calidad (nivel 1 = Común, 3 = Buena, 5 = Rara).

**Qué mide:** vida (Constitución × 5), Defensa y resistencias a crítico de la curva por nivel (Shooter y Asalto con armadura liviana, Warrior media, Tanque pesada), escudo (+Defensa, Parry contra disparos, Bloqueo), iniciativa, No2 por turno (Agilidad), costo de atacar (la ballesta con su Recarga), Evasión o Parry → Bloqueo (el defensor elige Parry si su Destreza es mayor que su Agilidad y guarda 1 No2 para eso), crítico completo, Perfora, la Fuerza que suma cada familia y la distancia (arrancan a 6 casilleros; el cuerpo a cuerpo se acerca a 1 No2 por casillero; el arco no dispara pegado y se aleja comiéndose el ataque de oportunidad).

**Qué NO mide:** efectos al golpear (veneno, sangrado, lisiado, rompe armadura…), habilidades y SP, consumibles, terreno y línea de tiro, hechizos (Mago, Support y Debuffer no entran), y la inteligencia táctica de un jugador real. Los números son una guía, no un veredicto.

## Lo que se ve (resumen para el dueño)

1. **La armadura pesada vuelve al Tanque casi intocable para cualquiera sin mucha Fuerza.** Con su Defensa de la curva (11 / 15 / 20 con el
   escudo, nivel 1 / 3 / 5), el tirador con arco o ballesta y el asalto con daga le ganan **0 %** en todos los niveles: casi ningún golpe le hace
   daño (diagnóstico: 0–3 % de los ataques pasan la armadura). Solo le pega quien suma toda la Fuerza (el guerrero), y apenas.
2. **Las armas de rango se caen desde nivel 3 contra armadura media o pesada.** A nivel 1 el tirador le gana al guerrero el 100 % (lo
   kitea: tiene más Agilidad y el guerrero no lo alcanza), pero a nivel 3 cae al 5–37 % y a nivel 5 al 9–25 %: el arco hace ~1,7 de daño por
   disparo contra Defensa 13. **La ballesta rinde mejor que el arco** (36 % contra 10 % a nivel 3), pero su Perfora no alcanza contra la
   curva de Defensa, que sube más rápido.
3. **El guerrero y el tanque dominan; el asalto queda atrás**, y **la daga es la peor arma del asalto** (21–38 %): con la espada o la maza le va
   mejor. Las armas livianas (Tipo 4) chocan con la Resistencia a Tipo 4, la más común.
4. **Espada y escudo es la mejor opción del guerrero y del tanque** (65–80 %): el escudo suma Defensa y deja parar disparos.
5. **Un nivel de equipo arriba gana casi siempre** (84–100 %). Es esperable, pero muestra lo empinada que es la curva.
6. **Mono-Destreza no rompe nada**: sigue lo medido antes (no entró en estas peleas).

## Qué palanca lo arreglaría (probadas en el simulador, ninguna aplicada)

Ver la tabla «Palancas probadas» al final. En corto:
- **Perfora por calidad en dagas y ballestas (+1 / +2 / +3):** arregla el rango y el asalto **contra armadura media** (ballesta 98 % / 67 %, daga
  56–66 % contra el guerrero) pero **no contra el tanque** (sigue en 0 %: la Perfora tiene tope 5 y la Defensa pesada llega a 20).
- **Armadura media y pesada al 75 %:** ayuda a todos un poco; el tanque sigue casi intocable para el rango.
- **Un golpe que entra pasa al menos ¼ de su daño (un «daño mínimo»):** es la única que hace pelear contra el tanque (64–99 %), pero lo da
  vuelta demasiado: el asalto con daga le gana al tanque el 99 % a nivel 5.
- **Perfora por calidad + armadura al 75 %:** lo más parejo contra el guerrero, pero se pasa (asalto 86–94 %) y el tanque sigue fuerte contra el arco.

**Propuesta para decidir (P186):** el problema de fondo es que **la Defensa sube más rápido que el daño de quien no suma Fuerza**. Dos caminos que
se pueden combinar: (a) **Perfora que crece con la calidad** en las familias que no suman Fuerza (ballestas, dagas, quizás arcos), sin tope 5; y
(b) **un daño mínimo más chico** (por ejemplo, el golpe que entra pasa al menos 1 punto por dado, o ⅛) para que la armadura pesada frene mucho pero
no del todo. Antes de tocar nada conviene medir (a) sin tope y (b) más chico con la misma herramienta, y mirar las resistencias a Tipo 4.


## 1 vs 1 · nivel 1 (Común) · cada clase con su mejor arma

Cada celda: % de peleas que gana la clase de la fila contra la de la columna (turnos promedio).

| | Warrior (hacha 2 manos) | Tanque (espada y escudo) | Asalto (daga) | Shooter (arco) |
|---|---|---|---|---|
| **Warrior** | — | 66 % (17.7) | 66 % (9.0) | 0 % (14.8) |
| **Tanque** | 34 % (17.8) | — | 89 % (23.6) | 67 % (28.7) |
| **Asalto** | 34 % (9.2) | 1 % (24.0) | — | 79 % (5.5) |
| **Shooter** | 100 % (13.9) | 0 % (28.4) | 18 % (5.6) | — |

## 1 vs 1 · nivel 3 (Buena Calidad) · cada clase con su mejor arma

Cada celda: % de peleas que gana la clase de la fila contra la de la columna (turnos promedio).

| | Warrior (hacha 2 manos) | Tanque (espada y escudo) | Asalto (daga) | Shooter (arco) |
|---|---|---|---|---|
| **Warrior** | — | 33 % (19.6) | 80 % (10.6) | 93 % (12.0) |
| **Tanque** | 65 % (19.9) | — | 96 % (18.2) | 72 % (28.5) |
| **Asalto** | 21 % (10.0) | 0 % (18.4) | — | 79 % (4.6) |
| **Shooter** | 5 % (11.5) | 0 % (28.6) | 25 % (4.5) | — |

## 1 vs 1 · nivel 5 (Raro) · cada clase con su mejor arma

Cada celda: % de peleas que gana la clase de la fila contra la de la columna (turnos promedio).

| | Warrior (hacha 2 manos) | Tanque (espada y escudo) | Asalto (daga) | Shooter (arco) |
|---|---|---|---|---|
| **Warrior** | — | 44 % (22.6) | 86 % (15.2) | 84 % (8.5) |
| **Tanque** | 48 % (22.2) | — | 46 % (34.0) | 96 % (19.3) |
| **Asalto** | 13 % (15.0) | 0 % (33.4) | — | 46 % (3.8) |
| **Shooter** | 11 % (8.3) | 0 % (19.2) | 52 % (3.8) | — |

## 1 vs 1 · ¿qué juego de armas le conviene a cada clase?

% de victorias promedio de la clase con ese juego contra las otras tres clases (cada una con su mejor arma).

| Clase · juego | Nivel 1 | Nivel 3 | Nivel 5 |
|---|---|---|---|
| Warrior · hacha 2 manos ★ | 46 % | 72 % | 69 % |
| Warrior · espada y escudo | 70 % | 75 % | 66 % |
| Warrior · arco | 14 % | 47 % | 47 % |
| Warrior · ballesta | 1 % | 24 % | 31 % |
| Tanque · maza y escudo | 24 % | 24 % | 30 % |
| Tanque · espada y escudo ★ | 65 % | 80 % | 66 % |
| Tanque · ballesta de mano y escudo | 0 % | 26 % | 8 % |
| Asalto · daga ★ | 38 % | 30 % | 21 % |
| Asalto · espada | 61 % | 38 % | 33 % |
| Asalto · maza 2 manos | 44 % | 24 % | 46 % |
| Asalto · arco | 26 % | 39 % | 36 % |
| Shooter · arco ★ | 38 % | 10 % | 23 % |
| Shooter · ballesta | 37 % | 36 % | 25 % |
| Shooter · daga | 3 % | 0 % | 5 % |
| Shooter · hacha 2 manos | 8 % | 6 % | 7 % |

## Diferencia de nivel · la misma clase y arma, un nivel de equipo arriba

% que gana el de nivel más alto (atributos y equipo de su nivel).

| Clase | Nivel 3 contra nivel 1 | Nivel 5 contra nivel 3 |
|---|---|---|
| Warrior | 99 % | 100 % |
| Tanque | 100 % | 84 % |
| Asalto | 100 % | 100 % |
| Shooter | 100 % | 94 % |

## 2 vs 2 · parejas

% que gana la pareja de la fila contra la de la columna (turnos promedio). Cada uno con su mejor arma salvo que se diga.


### Nivel 1

| | Warrior + Shooter | Tanque + Shooter (ballesta) | Warrior + Tanque | Asalto + Asalto | Shooter + Shooter |
|---|---|---|---|---|---|
| **Warrior + Shooter** | — | 0 % (17.5) | 1 % (37.3) | 66 % (10.1) | 39 % (11.8) |
| **Tanque + Shooter (ballesta)** | 100 % (17.3) | — | 7 % (39.4) | 61 % (28.4) | 98 % (17.7) |
| **Warrior + Tanque** | 35 % (37.3) | 0 % (39.4) | — | 66 % (27.2) | 27 % (37.4) |
| **Asalto + Asalto** | 35 % (10.0) | 3 % (31.3) | 2 % (26.1) | — | 87 % (7.0) |
| **Shooter + Shooter** | 70 % (12.0) | 0 % (16.9) | 0 % (37.8) | 11 % (6.6) | — |

### Nivel 3

| | Warrior + Shooter | Tanque + Shooter (ballesta) | Warrior + Tanque | Asalto + Asalto | Shooter + Shooter |
|---|---|---|---|---|---|
| **Warrior + Shooter** | — | 14 % (17.6) | 0 % (22.6) | 84 % (8.3) | 82 % (12.4) |
| **Tanque + Shooter (ballesta)** | 90 % (16.9) | — | 11 % (39.0) | 88 % (19.7) | 90 % (11.4) |
| **Warrior + Tanque** | 96 % (22.1) | 1 % (39.4) | — | 90 % (19.3) | 10 % (37.7) |
| **Asalto + Asalto** | 13 % (8.7) | 0 % (19.1) | 0 % (19.9) | — | 48 % (5.4) |
| **Shooter + Shooter** | 14 % (12.5) | 0 % (10.4) | 0 % (39.2) | 50 % (5.2) | — |

### Nivel 5

| | Warrior + Shooter | Tanque + Shooter (ballesta) | Warrior + Tanque | Asalto + Asalto | Shooter + Shooter |
|---|---|---|---|---|---|
| **Warrior + Shooter** | — | 20 % (19.8) | 13 % (24.9) | 96 % (8.2) | 82 % (8.5) |
| **Tanque + Shooter (ballesta)** | 72 % (19.7) | — | 0 % (39.4) | 47 % (27.4) | 78 % (14.5) |
| **Warrior + Tanque** | 66 % (24.7) | 7 % (38.9) | — | 64 % (28.9) | 57 % (29.3) |
| **Asalto + Asalto** | 2 % (8.2) | 0 % (27.4) | 0 % (27.2) | — | 35 % (4.7) |
| **Shooter + Shooter** | 18 % (9.6) | 0 % (14.9) | 0 % (30.8) | 69 % (4.6) | — |

## Familias de armas contra la misma vara (un Warrior con hacha a 2 manos)

% que gana la clase de la fila con esa arma contra el Warrior con hacha del mismo nivel. Sirve para comparar armas entre sí, no clases.


**Shooter**

| Arma | Nivel 1 | Nivel 3 | Nivel 5 |
|---|---|---|---|
| Daga | 4 % | 0 % | 0 % |
| Espada | 16 % | 0 % | 0 % |
| Hacha | 7 % | 0 % | 0 % |
| Maza | 1 % | 0 % | 2 % |
| Arco | 100 % | 6 % | 14 % |
| Ballesta | 100 % | 38 % | 12 % |

**Asalto**

| Arma | Nivel 1 | Nivel 3 | Nivel 5 |
|---|---|---|---|
| Daga | 30 % | 22 % | 19 % |
| Espada | 71 % | 36 % | 36 % |
| Hacha | 28 % | 46 % | 78 % |
| Maza | 32 % | 18 % | 55 % |
| Arco | 18 % | 60 % | 67 % |
| Ballesta | 67 % | 19 % | 39 % |

**Warrior**

| Arma | Nivel 1 | Nivel 3 | Nivel 5 |
|---|---|---|---|
| Daga | 24 % | 32 % | 3 % |
| Espada | 50 % | 45 % | 20 % |
| Hacha | 46 % | 52 % | 50 % |
| Maza | 0 % | 53 % | 60 % |
| Arco | 56 % | 47 % | 28 % |
| Ballesta | 0 % | 10 % | 3 % |

## Palancas probadas (2026-10-10)

Ninguna está aplicada: es lo que pasaría con cada una. % de victorias de la fila; nivel 1 / 3 / 5.

| Palanca | Shooter (arco) vs Warrior | Shooter (ballesta) vs Warrior | Asalto (daga) vs Warrior | Shooter (arco) vs Tanque | Shooter (ballesta) vs Tanque | Asalto (daga) vs Tanque | Warrior (hacha 2 manos) vs Tanque |
|---|---|---|---|---|---|---|---|
| Como hoy | 100 % / 11 % / 9 % | 100 % / 37 % / 17 % | 34 % / 18 % / 19 % | 0 % / 0 % / 0 % | 0 % / 2 % / 0 % | 2 % / 0 % / 0 % | 64 % / 35 % / 51 % |
| Perfora +1/+2/+3 (por calidad) en dagas y ballestas | 100 % / 11 % / 9 % | 100 % / 98 % / 67 % | 60 % / 56 % / 66 % | 0 % / 0 % / 0 % | 0 % / 2 % / 0 % | 5 % / 0 % / 0 % | 62 % / 34 % / 40 % |
| Armadura media y pesada al 75 % | 100 % / 26 % / 43 % | 100 % / 98 % / 65 % | 76 % / 52 % / 60 % | 0 % / 0 % / 2 % | 0 % / 22 % / 0 % | 8 % / 13 % / 0 % | 68 % / 56 % / 64 % |
| Un golpe que entra pasa al menos ¼ de su daño | 100 % / 47 % / 33 % | 100 % / 91 % / 62 % | 51 % / 46 % / 78 % | 68 % / 83 % / 64 % | 28 % / 94 % / 91 % | 86 % / 70 % / 99 % | 55 % / 42 % / 62 % |
| Perfora por calidad + armadura al 75 % | 100 % / 26 % / 43 % | 100 % / 100 % / 95 % | 90 % / 86 % / 94 % | 0 % / 0 % / 3 % | 0 % / 55 % / 24 % | 28 % / 56 % / 30 % | 73 % / 62 % / 64 % |
