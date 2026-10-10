# Balance de combate — método paso a paso

> Arrancó el 2026-10-09 (dueño: «vamos con el método que me propusiste paso a paso, con testeos»). Herramienta:
> [`herramientas/balance_combate.py`](../herramientas/balance_combate.py) (daño esperado por turno; las palancas son opciones de la línea de
> comandos). Pasos: **1** medir (la tabla) → **2** fijar metas con el dueño → **3** probar las palancas de a una, volviendo a medir → **4** elegir
> la combinación, ajustar el catálogo, programar y probar en el mapa.

## Paso 1 — La tabla base (2026-10-09)

**Cómo se mide:** cada clase con su reparto sugerido de atributos (33 + 3 por nivel), con cada familia de arma y los dados típicos del catálogo para
la calidad de ese nivel (Común 1 dado, Buena 1–2, Rara 2; daño fijo ~0), contra un blanco liviano, medio y pesado con la Defensa y las resistencias
de la curva por nivel (`calculadora_defensa.py`, CURVA). Daño esperado **por turno**, contando los ataques que pagan los No2 sin moverse; «—» = no
le alcanzan los No2 para un ataque con esa arma. El arco: Tipo 4, mitad de los ataques con 1 dado y mitad con 2, más la mitad de la Fuerza (lo
decidido). El defensor se defiende con la Evasión (sin Parry ni escudo). La última columna: el mejor daño de esa clase contra el del Warrior.
Los magos, supports y debuffers pegan con hechizos: acá solo se ve su golpe físico (de referencia).

**Lo que se ve:**
1. **Las resistencias bajas abundantes apagan las armas livianas (la sospecha del dueño, confirmada en parte):** la daga y el arco (Tipo 4) caen a
   casi 0 contra un blanco medio o pesado desde nivel 3; la maza (Tipo 10, la resistencia escasa) es la mejor contra el pesado.
2. **Ruptura nueva — el costo de atacar contra los No2:** atacar cuesta el Tipo ÷ 2 y los No2 salen de la Agilidad. El Warrior (Agilidad 4) no puede
   atacar con una maza a nivel 1 (cuesta 5); el Tanque (Agilidad 3) no puede usar hacha ni maza ni a nivel 3. Justo las clases fuertes no pueden
   usar las armas pesadas.
3. **Ruptura nueva — la Defensa entera contra el daño chico:** sin crítico, el golpe resta la Defensa entera; el que no tiene Fuerza no entra.
4. **Asalto y Shooter dominan contra lo liviano y lo medio** (135 %–230 % del Warrior: muchos ataques y críticos contra resistencias bajas) y se
   desploman contra lo pesado (el Shooter, 9 % a nivel 5).
5. **El arco es la familia más floja en todos los casos** (casi 0 contra medio y pesado desde nivel 3).
6. El Warrior pega poco contra un blanco liviano de nivel 5 (la Evasión 14 del Asalto le gana a su Destreza 7).

## Paso 2 — Metas (propuesta, a decidir con el dueño)
- **M1.** Las cuatro clases de combate (Warrior, Tanque, Asalto, Shooter), con su mejor arma, contra un blanco medio: entre el 60 % y el 140 % del Warrior.
- **M2.** Contra un blanco pesado, ninguna clase de combate en 0: al menos el 30 % del Warrior.
- **M3.** Ninguna familia es la mejor en todo: cada Tipo tiene su blanco (Tipo 4 contra lo liviano, Tipo 10 contra lo pesado…).
- **M4.** El arco rinde al menos el 60–75 % del mejor cuerpo a cuerpo de la misma clase (el rango ya es una ventaja).
- **M5.** Toda clase puede hacer al menos un ataque por turno con cualquier arma de su nivel (o se decide a propósito que las armas pesadas piden Agilidad).

**Decidido (dueño, 2026-10-09):** M5 **es a propósito** — «si querés usar un arma Tipo 10, sí o sí te tenés que poner mínimo Agilidad 5; si no,
vas a tener que usar armas de otro tipo». El reparto de atributos condiciona el equipo, y eso es parte del juego: no se toca el costo de atacar.
El dueño delega el afinado en el criterio de Claude («voy a empezar a confiar en tu criterio para ver cómo afinamos»). Con eso, el **Tanque
entre 35 % y 50 % del Warrior** se lee como su rol (aguantar, no pegar), no como una falla.

## Paso 3 — Las palancas, de a una (2026-10-09)

`py balance_combate.py --metas` (resumen de las metas; la columna M1 muestra Tanque · Asalto · Shooter contra el Warrior, blanco medio).

| Palanca | Qué pasa | Veredicto |
|---|---|---|
| Base | Tan 34–51 % · Asa 79–146 % · Sho 74–95 %; el arco rinde 84 % a nivel 1 y **0 %** a nivel 3 y 5 | El único problema real es el arco |
| Bajar la resistencia a Tipo 4 a la mitad (`--res 4=0.5`) | Asalto y Shooter pasan a **2 a 4,5 veces** el Warrior | **Descartada.** La abundancia de resistencia baja es justo lo que frena a las clases rápidas (la sospecha del dueño no se confirmó) |
| El primer ataque cuesta Tipo ÷ 3 (`--costo-div 3`) | Arregla M5 | **Descartada:** M5 es a propósito |
| Las armas Tipo 4 ignoran media Defensa (`--perfora 0.5`) | Asalto sube a 173–219 %; el arco, 15 % a nivel 5 | Descartada |
| Crítico frecuente en todo el Tipo 4 (`--crit-frec-t4 2`) | Asalto y Shooter a 270–300 % | Descartada |
| Las armas Tipo 4 suman Destreza (`--sutileza 1`) | Shooter a 250–390 % | Descartada |
| La Defensa resta la mitad (`--def-mult 0.5`) | Asalto a 185 %; el arco, 9 % a nivel 5 | Descartada |
| **Palancas solo del arco** | Lo que toque al arco no desarma lo demás | **Por acá** |

**Por qué el arco se cae desde nivel 3:** la Defensa y la resistencia a Tipo 4 crecen con el nivel y el arco no (1–2 d4 en toda calidad). Una regla
general (ignorar resistencia, perforar Defensa, Crítico frecuente) se pasa de largo a nivel 1 y se queda corta a nivel 5: los saltos del crítico son
grandes. **Lo que crece con la calidad tiene que ser el arco mismo.** El dueño habilitó más dados y d6 (no d8, por ahora; 2026-10-09).

**El Tipo es el dado (dueño, 2026-10-09):** «no quiero disociar el tipo y las caras del dado: un arco que tira dados de 6 es Tipo 6, y que se
balancee en ese aspecto». Para acercarse a un d6 sin romper la paridad, un arco Tipo 4 puede llevar **daño fijo** (1d4+1 ≈ 1d6). Se descartó la
primera propuesta (Tipo 4 para el crítico con dados d6). **Quedan dos familias de arco:**
- **Tipo 4 — el arco liviano** (corto, de caza): juega al crítico; contra la resistencia a Tipo 4, la más abundante. Crece con dados y daño fijo.
- **Tipo 6 — el arco largo** (de tejo, de guerra): pega más parejo; contra la resistencia a Tipo 6, menos frecuente.

**La escalera del arco** (`balance_combate.py --arco-tipo T --arco-dados N --arco-fijo F`; contra un blanco medio, lo que rinde el arco del Shooter
respecto de su mejor cuerpo a cuerpo). Cada calidad tiene un arco «flojo» y uno «bueno» para diseñar en el medio; todos suman además la mitad de la
Fuerza (redondeada para arriba):

| Calidad | Tipo 4 (liviano) | Tipo 6 (largo) |
|---|---|---|
| Común (nivel 1) | 1d4+1 → 74 % · 1d4+2 → 91 % · 2d4 → 106 % | 1d6 → 77 % · 1d6+1 → 103 % |
| Buena (nivel 3) | 3d4+1 → 53 % · 2d4+4 → 70 % · 3d4+2 → 91 % | 2d6+2 → 51 % · 3d6 → 93 % |
| Rara (nivel 5) | 4d4+2 → 72 % · 2d4+2 con Crít. frecuente +1 y PdG +2 → 103 % | 3d6+2 → 69 % · 3d6+3 → 89 % · 4d6 → 105 % |

Lo que **no** alcanza: 1d4 pelado (54 % a nivel 1, 0 desde nivel 3), cualquier arco de 1–2 dados desde nivel 3, y el Tipo 4 a nivel 5 solo con
dados y daño fijo hasta 3d4+4 (48 %). Lo que **se pasa**: 2d4+2 o 2d6 a nivel 1 (~150–200 %), 3d6+1 a nivel 3 (124 %). Excepcional y Legendario
quedan fuera de lo que mide la herramienta (nivel 5 como techo): se siguen con la misma línea (más dados, daño fijo, PdG, Crítico frecuente; sin d8
por ahora). Contra un blanco pesado el arco sigue rindiendo poco: su blanco es lo liviano y lo medio (M3).

**Crítico en los arcos (medido, 2026-10-09):** se puede, pero es caro. En Tipo 4, Crítico frecuente +1 vale más que +2 de daño fijo (Común:
1d4 con Crít. frec. +1 → 137 %, contra 1d4+2 → 91 %; Buena: 2d4+1 con Crít. frec. +1 → 123 %). La escalera es el **presupuesto** del arco: si trae
crítico, resigna dados o daño fijo. Lo mismo vale para todo el Tipo 4 (Crít. frec. +1 en todas: Asalto 152 % a nivel 1, dentro a nivel 3 y 5), y el
catálogo ya lo cumple: ninguna de las 28 Tipo 4 Comunes trae Crítico frecuente (solo potente), aparece desde Buena.

**Qué mide el %:** el daño por turno del arco del Shooter ÷ el de su mejor arma cuerpo a cuerpo de la misma calidad, contra el blanco medio (100 % =
pega lo mismo). Lo de las clases (Tan/Asa/Sho) es esa clase con su mejor arma ÷ el Warrior con la suya. La herramienta tiene en cuenta el crítico
completo (niveles, resistencia, d20, supercrítico, sin Defensa); **todavía no** el Crítico potente, el Parry y el Bloqueo del defensor ni los
efectos al golpear.

**Paso 4 (sigue):** programar el arco — la mitad de la Fuerza (✅ 2026-10-09, `Combatiente.dmgDelArma`), la distancia mínima (2 casilleros libres),
sin pegar con el arco ni ataque de oportunidad — y pasar los arcos del catálogo a la escalera (precio con `calculadora_armas.py`); después, probar en el mapa.

## El presupuesto de un arco (2026-10-09, para la lluvia de ideas)

La calculadora de armas (`herramientas/calculadora_armas.py`) le pone puntos (PC) a todo lo que trae un arma; cada calidad es una banda de puntos:
**Común hasta 7,5 · Buena 7,5–11 · Rara 11–17 · Excepcional 17–26 · Legendaria 26+**. Al pasar la escalera por la calculadora apareció que cobraba
los dados del arco como los de una espada (el Bueno caía en Raro): **un arco necesita más dados para rendir lo mismo** (mitad de la Fuerza, crítico
contra la resistencia más común), así que su daño se cobra ×0,7 (`DESCUENTO_ARCO`). Con eso cada arco de la escalera cae en su calidad:

| Calidad | Lo que usa el daño | Lo que queda libre para bonos |
|---|---|---|
| Común (hasta 7,5) | 4,5 (1d6) a 6,6 (1d4+2) | 1 a 3 puntos |
| Buena (7,5–11) | 9,5 (3d4+1, 2d6+2) a 10,9 (3d4+2) | casi nada con el más fuerte; ~1,5 con el más flojo |
| Rara (11–17) | 12,8 (3d6+2) a 13,7 (3d6+3) | 3 a 4 puntos |

**Lo que cuesta cada cosa en un arco** (puntos): Crítico frecuente +1 → 5,25 en Tipo 4 / 3 en Tipo 6 · Crítico potente +1 → 1,2 · PdG +1 → 3,5 ·
Rango +1 → 0,75 · +1 daño fijo → 1,4 (T4) / 0,9 (T6) · +1 dado → 1,75 (T4) / 2,45 (T6) · Veneno 50 % → 1,25 · Sangrado 50 % → 1,5 · Lisiado 25 % →
1,1 · Prende fuego 33 % → 1,5 · Iniciativa +1 → 0,6 · cada punto de Peso de más → −0,2.

**Cómo se diseña la diversidad:** se parte de un arco de la escalera y se cambia daño por otra cosa dentro de la banda. Un arco «de precisión» baja
dados y suma Crítico (frecuente o potente) o PdG; uno «venenoso» baja daño y suma Veneno; uno «largo» suma Rango; uno «pesado» suma Peso y un dado.
El total de puntos manda la calidad y el precio (`precio_libre`). Lo de diseño sin número (sweet spot, tiro con comba) se agrega aparte, con criterio.
**El juego admite cierto desbalance** (dueño, 2026-10-09): el GM lo afina en lo puntual; el número busca que nada se rompa feo.

## Más adelante — «Probemos romper el juego» (dueño, 2026-10-09)

Cuando terminemos con los arcos y el catálogo esté más o menos consolidado: la prueba de perillas en serio, con números, tablas y comparaciones, y
**personajes peleando entre sí** con distintas armas y armaduras. «Buscar la falla, no para emparcharla, sino para tratar de balancearla.» Son
demasiadas variables: antes de probar, fijar **un criterio y un orden** (qué se mide primero, contra qué metas) y recién ahí los testeos. Mientras
tanto, el dueño prefiere **seguir avanzando aunque quede flojo o con alguna falla antes que quedarse trabado**. Para entonces, sumar a la
herramienta lo que hoy no mide: Crítico potente, Parry y Bloqueo, efectos al golpear, y duelos completos (con movimiento, como `duelo_arco.py`).

## Tabla base completa (paso 1)

## Nivel 1 · contra un blanco liviano (Defensa 4, Evasión 10, Res {4: 1})
| Clase | Daga T4 | Espada T6 | Hacha T8 | Maza T10 | Arco T4 | Mejor / Warrior |
|---|---|---|---|---|---|---|
| Warrior | 2.4 | 2.8 | 3.2 | — | 1.5 | 100 % |
| Tanque | 1.2 | 1.2 | — | — | 0.7 | 39 % |
| Asalto | 5.2 | 5.6 | 2.6 | 3.2 | 3.2 | 177 % |
| Shooter | 3.0 | 3.1 | 2.7 | 2.7 | 3.3 | 104 % |
| Mago | 0.5 | 0.7 | 1.1 | 1.4 | 0.6 | 43 % |
| Support | 0.6 | 0.5 | 0.7 | 0.9 | 0.7 | 27 % |
| Debuffer | 0.3 | 0.5 | 0.7 | 0.9 | 0.4 | 29 % |

## Nivel 1 · contra un blanco medio (Defensa 7, Evasión 4, Res {4: 1, 6: 0})
| Clase | Daga T4 | Espada T6 | Hacha T8 | Maza T10 | Arco T4 | Mejor / Warrior |
|---|---|---|---|---|---|---|
| Warrior | 3.7 | 4.3 | 5.0 | — | 1.2 | 100 % |
| Tanque | 1.7 | 2.1 | — | — | 0.7 | 42 % |
| Asalto | 3.4 | 6.6 | 2.6 | 3.3 | 1.4 | 132 % |
| Shooter | 2.9 | 4.6 | 3.1 | 2.2 | 3.6 | 92 % |
| Mago | 0.0 | 0.4 | 0.9 | 1.5 | 0.2 | 30 % |
| Support | 0.0 | 0.2 | 0.6 | 1.0 | 0.3 | 21 % |
| Debuffer | 0.0 | 0.2 | 0.6 | 1.1 | 0.2 | 21 % |

## Nivel 1 · contra un blanco pesado (Defensa 10, Evasión 3, Res {4: 2, 6: 1})
| Clase | Daga T4 | Espada T6 | Hacha T8 | Maza T10 | Arco T4 | Mejor / Warrior |
|---|---|---|---|---|---|---|
| Warrior | 1.9 | 2.6 | 3.3 | — | 0.2 | 100 % |
| Tanque | 0.8 | 1.3 | — | — | 0.1 | 38 % |
| Asalto | 0.0 | 0.8 | 1.1 | 1.8 | 0.1 | 52 % |
| Shooter | 0.0 | 0.0 | 3.0 | 1.0 | 0.0 | 90 % |
| Mago | 0.0 | 0.0 | 0.1 | 0.5 | 0.0 | 15 % |
| Support | 0.0 | 0.0 | 0.1 | 0.4 | 0.0 | 11 % |
| Debuffer | 0.0 | 0.0 | 0.1 | 0.4 | 0.0 | 11 % |

## Nivel 3 · contra un blanco liviano (Defensa 6, Evasión 12, Res {4: 2})
| Clase | Daga T4 | Espada T6 | Hacha T8 | Maza T10 | Arco T4 | Mejor / Warrior |
|---|---|---|---|---|---|---|
| Warrior | 2.5 | 2.8 | 3.2 | 3.6 | 0.9 | 100 % |
| Tanque | 1.4 | 1.7 | — | — | 0.6 | 47 % |
| Asalto | 6.0 | 8.1 | 7.3 | 3.9 | 2.4 | 227 % |
| Shooter | 2.1 | 8.7 | 3.9 | 3.7 | 1.3 | 242 % |
| Mago | 0.6 | 0.6 | 1.0 | 1.2 | 0.3 | 35 % |
| Support | 0.6 | 0.6 | 1.0 | 1.3 | 0.3 | 37 % |
| Debuffer | 0.5 | 0.6 | 1.0 | 1.4 | 0.3 | 40 % |

## Nivel 3 · contra un blanco medio (Defensa 10, Evasión 5, Res {4: 2, 6: 1, 8: 0})
| Clase | Daga T4 | Espada T6 | Hacha T8 | Maza T10 | Arco T4 | Mejor / Warrior |
|---|---|---|---|---|---|---|
| Warrior | 2.8 | 3.6 | 4.3 | 5.0 | 0.3 | 100 % |
| Tanque | 1.3 | 1.6 | — | — | 0.2 | 33 % |
| Asalto | 2.4 | 3.5 | 6.3 | 3.9 | 0.3 | 126 % |
| Shooter | 0.1 | 0.8 | 4.7 | 3.4 | 0.0 | 94 % |
| Mago | 0.0 | 0.3 | 0.7 | 1.3 | 0.0 | 26 % |
| Support | 0.0 | 0.3 | 0.7 | 1.2 | 0.0 | 24 % |
| Debuffer | 0.0 | 0.2 | 0.6 | 1.2 | 0.0 | 25 % |

## Nivel 3 · contra un blanco pesado (Defensa 14, Evasión 3, Res {4: 3, 6: 2, 8: 1})
| Clase | Daga T4 | Espada T6 | Hacha T8 | Maza T10 | Arco T4 | Mejor / Warrior |
|---|---|---|---|---|---|---|
| Warrior | 1.4 | 2.4 | 3.6 | 4.6 | 0.0 | 100 % |
| Tanque | 0.7 | 1.6 | — | — | 0.0 | 34 % |
| Asalto | 0.1 | 0.8 | 2.2 | 2.0 | 0.0 | 47 % |
| Shooter | 0.0 | 0.0 | 0.2 | 4.4 | 0.0 | 95 % |
| Mago | 0.0 | 0.0 | 0.2 | 0.7 | 0.0 | 15 % |
| Support | 0.0 | 0.0 | 0.2 | 0.7 | 0.0 | 14 % |
| Debuffer | 0.0 | 0.0 | 0.2 | 0.7 | 0.0 | 15 % |

## Nivel 5 · contra un blanco liviano (Defensa 8, Evasión 14, Res {4: 2})
| Clase | Daga T4 | Espada T6 | Hacha T8 | Maza T10 | Arco T4 | Mejor / Warrior |
|---|---|---|---|---|---|---|
| Warrior | 3.6 | 1.9 | 2.4 | 2.8 | 0.9 | 100 % |
| Tanque | 0.7 | 0.8 | 1.0 | — | 0.1 | 29 % |
| Asalto | 7.3 | 7.0 | 6.8 | 3.9 | 0.9 | 202 % |
| Shooter | 2.4 | 8.7 | 4.1 | 4.5 | 0.2 | 240 % |
| Mago | 0.2 | 0.4 | 0.7 | 1.0 | 0.0 | 27 % |
| Support | 0.2 | 0.3 | 0.5 | 0.7 | 0.0 | 19 % |
| Debuffer | 0.1 | 0.2 | 0.4 | 0.5 | 0.0 | 14 % |

## Nivel 5 · contra un blanco medio (Defensa 13, Evasión 6, Res {4: 3, 6: 2, 8: 1, 10: 0, 12: 0})
| Clase | Daga T4 | Espada T6 | Hacha T8 | Maza T10 | Arco T4 | Mejor / Warrior |
|---|---|---|---|---|---|---|
| Warrior | 7.8 | 5.2 | 6.5 | 7.9 | 0.2 | 100 % |
| Tanque | 2.0 | 2.9 | 3.9 | — | 0.0 | 50 % |
| Asalto | 2.0 | 3.5 | 6.7 | 5.3 | 0.0 | 85 % |
| Shooter | 0.0 | 0.5 | 1.2 | 6.0 | 0.0 | 75 % |
| Mago | 0.0 | 0.1 | 0.5 | 1.4 | 0.0 | 18 % |
| Support | 0.0 | 0.1 | 0.6 | 1.5 | 0.0 | 19 % |
| Debuffer | 0.0 | 0.1 | 0.5 | 1.1 | 0.0 | 14 % |

## Nivel 5 · contra un blanco pesado (Defensa 18, Evasión 4, Res {4: 4, 6: 3, 8: 2, 10: 1, 12: 1})
| Clase | Daga T4 | Espada T6 | Hacha T8 | Maza T10 | Arco T4 | Mejor / Warrior |
|---|---|---|---|---|---|---|
| Warrior | 2.1 | 2.5 | 4.1 | 5.7 | 0.0 | 100 % |
| Tanque | 0.2 | 1.1 | 2.3 | — | 0.0 | 41 % |
| Asalto | 0.0 | 0.2 | 1.6 | 2.0 | 0.0 | 34 % |
| Shooter | 0.0 | 0.0 | 0.1 | 0.6 | 0.0 | 10 % |
| Mago | 0.0 | 0.0 | 0.0 | 0.3 | 0.0 | 5 % |
| Support | 0.0 | 0.0 | 0.0 | 0.4 | 0.0 | 7 % |
| Debuffer | 0.0 | 0.0 | 0.0 | 0.2 | 0.0 | 4 % |

## La ballesta y el «mono-Destreza» (2026-10-09, primera medición)

`balance_combate.py --ballesta` suma la ballesta (no suma Fuerza; dados del Tipo + daño fijo 3/4/5 por nivel; `--bal-tipo`, `--bal-costo arma|varita`)
y el personaje **MonoDes** (casi todo a Destreza: nivel 1 = Des 21, Agl 3, Con 3). Contra el blanco medio, en % del Warrior:

| | Shooter con ballesta T6 | Shooter, su mejor otra arma | MonoDes con ballesta T6 | MonoDes, su mejor otra arma |
|---|---|---|---|---|
| Nivel 1 (cobra como arma) | 94 % | 98 % | 198 % | 207 % |
| Nivel 3 (cobra como arma) | 25 % | 89 % | 136 % | 261 % |
| Nivel 5 (cobra como arma) | 13 % | 72 % | 67 % | 223 % |
| Nivel 1 (cobra como varita: 1, 2, 3…) | 291 % | 95 % | 391 % | 202 % |

**Lectura:**
1. **El problema del mono-Destreza no es de la ballesta: es general.** Con cualquier arma, volcarse todo a Destreza duplica al Warrior (críticos
   contra la Evasión baja). La ballesta casi no le suma a eso. El freno tiene que ser general (o aceptarse por lo expuesto que queda: Con 3 = 15 de
   vida, Agl 3 = 3 No2 y Evasión baja) — **falta medir la exposición** (el daño que recibe).
2. **Cobrar como varita (1, 2, 3…) dispara la ballesta** (2–4 veces más): es mucho más barato que el Tipo. Descartado; cobra como cualquier arma.
3. **Con el costo de arma, la ballesta se cae desde nivel 3** para un tirador normal (25 % / 13 %): sin Fuerza, su daño fijo no pasa la Defensa.
   Su identidad tiene que traer con qué pasar la armadura: **los virotes con Perfora** y **Rompe armadura** en la ballesta (lo decidido).

**Mono-Destreza con la ballesta «lenta» y su exposición (2026-10-10, medido):** con la ballesta de la escalera nueva (1d6+1 / 2d6+6 / 2d6+9, cobro
2, 4, 6…) el MonoDes hace **un solo disparo por turno** (Agilidad 3–5) y rinde **menos que con su arma cuerpo a cuerpo** (nivel 3: 11,3 contra
13,2; nivel 5: 8,9 contra 17,5): la ballesta no le suma al problema, el cobro «lento» lo frena. **Exposición** (el Warrior con su mejor arma, contra
armadura liviana): el MonoDes cae en **~2 turnos** (vida 15–25, Evasión 3–5) y el Shooter en **6–8**. Dueño: en la práctica no va a existir (necesita
Agilidad para atacar, Constitución para no morir y Espíritu para el SP de sus habilidades); si alguien lo arma, lo paga con la vida.
