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
