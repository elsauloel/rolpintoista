# Revisión de las ballestas Comunes y Buenas (2026-10-11, propuesta para el OK del dueño)

> Pedido del dueño: «tocará revisar todas las ballestas; hacete varias pruebas de combate de ballesta contra otras armas para volver a afinar la
> calculadora». Las Raras para arriba quedan afuera (dueño: «ignoralas»). Decidido: **las Comunes con Recarga 3** (un disparo fuerte por turno) y
> **las Buenas con Recarga 2**, con una mezcla de bases (2d6+5, 3d6+2 o 2d6+2 con Perfora 3).

## Cómo se midió
`herramientas/balance_ballestas.py` (las reglas de `balance_combate.py`, que ahora sí cobran la Recarga N, 2N, 3N… y aplican la Perfora): lo que
rinde la ballesta del Shooter ÷ su mejor arma cuerpo a cuerpo de la misma calidad, contra el blanco medio. Banda buscada: 74–106 %. Los bonos y los
efectos al golpear no entran en el %: solo dados, daño fijo, Perfora y Recarga.

## La calculadora, recalibrada (`herramientas/calculadora_armas.py`, `BAL_DANO`)
El daño de una ballesta se cobra por su promedio (dados + daño fijo + Perfora × 1,15) en una recta por Recarga, ajustada a lo medido: con Recarga 3,
1d6+2 (82 %) ≈ 6 puntos y 1d6+3 (100 %) ≈ 7; con Recarga 2, 2d6+3 (32 %) ≈ 8, 2d6+5 (82 %) ≈ 10,4 y 3d6+2 (98 %) ≈ 10,8. **Una ballesta con Recarga 2
vale al menos lo de una Buena** (a nivel 1 dispara dos veces y una 1d6 pelada ya rinde 103 %). Antes cobraba 1d6 como 1,5 puntos y 3d6+2 como 7,9.

## Lo que cambia
- **El daño ocupa casi toda la calidad:** el **Rango de bono** (0,75 por punto) ya no entra en casi ninguna. Propuesta: las ballestas pierden el
  Rango de bono (queda el de la Destreza), salvo alguna «larga» puntual que resigne daño.
- **Con bonos fuertes, menos daño** (igual que los arcos): una ballesta con dos mecánicas queda por debajo de la banda; con una sola, adentro.

## La propuesta, ballesta por ballesta (sin el Rango de bono; los demás bonos y efectos, como están)
| Ballesta | Daño (antes → después) | Rinde | Precio | Calidad | Nota |
|---|---|---|---|---|---|
| Ballesta corta | 1d6+1 · Perfora 1 · R2 → **1d6+2 · Perfora 1 · R3** | 155 % → **93 %** | 50 → 90 | Común |  |
| Ballesta de acecho | 1d6 · Perfora 1 · R2 → **1d6 · Perfora 1 · R3** | 123 % → **63 %** | 55 → 90 | Común |  |
| Ballesta de batida | 1d6 · Perfora 1 · R2 → **1d6 · R3** | 134 % → **50 %** | 65 → 80 | Común |  |
| Ballesta de cazador | 1d6 · Perfora 2 · R2 → **1d6+2 · Perfora 1 · R3** | 149 % → **89 %** | 70 → 85 | Común |  |
| Ballesta de doble cuerda | 1d6 · Perfora 1 · R2 → **1d6 · R3** | 123 % → **52 %** | 60 → 90 | ⚠ Buena Calidad | Con Recarga 3, Doble cuerda (3, 3, 9) le da dos disparos a nivel 1: vale casi lo de una Recarga 2. Queda justo en el borde con Buena: o se la pasa a Buena, o la Común lleva otra cosa. |
| Ballesta de estribo | 1d6+2 · Perfora 2 · R3 → **1d6+2 · Perfora 1 · R3** | 104 % → **88 %** | 85 → 85 | Común |  |
| Ballesta de mano | 1d6 · Perfora 1 · R2 → **1d6 · Perfora 1 · R3** | 123 % → **60 %** | 60 → 90 | Común |  |
| Ballesta de mira | 1d6 · R2 → **1d6 · R3** | 105 % → **51 %** | 85 → 80 | Común |  |
| Ballesta de pared | 1d6+2 · Perfora 1 · R2 → **1d6+2 · Perfora 1 · R3** | 181 % → **92 %** | 45 → 75 | Común |  |
| Ballesta de quemarropa | 1d6 · R2 → **1d6 · R3** | 101 % → **51 %** | 50 → 75 | Común |  |
| Ballesta de tiro largo | 1d6 · Perfora 1 · R2 → **1d6+1 · Perfora 1 · R3** | 123 % → **76 %** | 75 → 90 | Común |  |
| Ballesta de virote dentado | 1d6 · R2 → **1d6+2 · R3** | 100 % → **78 %** | 40 → 80 | Común |  |
| Ballesta del baqueano | 1d6 · R2 → **1d6+2 · R3** | 101 % → **82 %** | 70 → 85 | Común |  |
| Ballesta del calderero | 1d6 · R2 → **1d6+2 · R3** | 100 % → **84 %** | 40 → 85 | Común |  |
| Ballesta del matrero | 1d6 · Perfora 1 · R2 → **1d6+1 · Perfora 1 · R3** | 120 % → **74 %** | 50 → 90 | Común |  |
| Ballesta del rematador | 1d6+1 · R2 → **1d6+2 · R3** | 119 % → **82 %** | 45 → 80 | Común |  |
| Ballesta rompescudos | 1d6 · R2 → **1d6 · R3** | 100 % → **50 %** | 65 → 95 | Común |  |
| Ballesta abollacascos | 2d6+2 · R2 → **2d6+3 · R2** | 19 % → **34 %** | 160 → 130 | Buena Calidad | Rompe armadura 50 % cuesta mucho: le queda 2d6+3 (34 %). Propuesta: Rompe armadura 25 % y 2d6+4. |
| Ballesta de centinela | 2d6 · Perfora 2 · R2 → **2d6+1 · Perfora 2 · R2** | 69 % → **73 %** | 160 → 150 | Buena Calidad |  |
| Ballesta de escolta | 2d6+1 · Perfora 1 · R2 → **2d6+3 · Perfora 1 · R2** | 37 % → **51 %** | 150 → 160 | Buena Calidad |  |
| Ballesta de estopa | 2d6+2 · R2 → **2d6+4 · R2** | 19 % → **57 %** | 150 → 150 | Buena Calidad |  |
| Ballesta de fortín | 2d6+1 · Perfora 2 · R2 → **2d6+2 · Perfora 2 · R2** | 66 % → **73 %** | 160 → 160 | Buena Calidad |  |
| Ballesta de guardia | 2d6+2 · Perfora 3 · R2 → **2d6+2 · Perfora 3 · R2** | 104 % → **114 %** | 170 → 150 | Buena Calidad |  |
| Ballesta de la ciénaga | 2d6 · Perfora 2 · R2 → **2d6+1 · Perfora 2 · R2** | 72 % → **73 %** | 160 → 150 | Buena Calidad |  |
| Ballesta de mano reforzada | 2d6+1 · Perfora 2 · R2 → **2d6+2 · Perfora 2 · R2** | 75 % → **73 %** | 130 → 140 | Buena Calidad |  |
| Ballesta de mira corta | 2d6 · R2 → **2d6+3 · R2** | 3 % → **33 %** | 160 → 200 | ⚠ Raro | La distancia ideal (PdG +2 de 1 a 3) vale ~4,5 puntos. Propuesta: PdG +1, o franja de 1 a 2. |
| Ballesta de primer tiro | 2d6+1 · Perfora 1 · R2 → **2d6+3 · Perfora 1 · R2** | 39 % → **54 %** | 150 → 160 | Buena Calidad |  |
| Ballesta de punta de diamante | 2d6+1 · Perfora 2 · R2 → **2d6+2 · Perfora 2 · R2** | 71 % → **75 %** | 160 → 160 | Buena Calidad |  |
| Ballesta de tiro rápido | 2d6+1 · Perfora 1 · R2 → **2d6+2 · Perfora 1 · R2** | 37 % → **46 %** | 170 → 150 | Buena Calidad |  |
| Ballesta de tranquera | 2d6 · Perfora 3 · R3 → **2d6 · Perfora 3 · R2** | 104 % → **99 %** | 170 → 180 | ⚠ Raro | Llega cargada vale ~3 puntos: con 2d6 y Perfora 3 se pasa a Rara. Propuesta: 2d6+1 · Perfora 2 y Llega cargada. |
| Ballesta de vigía | 2d6 · R2 → **2d6+3 · R2** | 4 % → **33 %** | 160 → 180 | ⚠ Raro | Apuntada firme + Alcance con caída no entran juntas. Propuesta: sacar la caída. |
| Ballesta del acechador | 2d6 · R2 → **2d6+3 · R2** | 4 % → **35 %** | 170 → 190 | ⚠ Raro | Emboscada + Espalda a distancia no entran juntas. Propuesta: sacar la Emboscada. |
| Ballesta del boyero | 2d6+2 · R2 → **3d6+1 · R2** | 19 % → **72 %** | 130 → 140 | Buena Calidad |  |
| Ballesta del rastreador | 2d6 · R2 → **2d6+3 · R2** | 4 % → **33 %** | 180 → 200 | ⚠ Raro | Lisiado 25 % + ignora 1 de Res. crítico no entran con daño de Buena. Propuesta: sacar «ignora 1 de Res. crítico». |
| Ballesta remachadora | 2d6+1 · Perfora 1 · R2 → **2d6+2 · Perfora 1 · R2** | 38 % → **46 %** | 170 → 150 | Buena Calidad |  |
| Ballesta virotera | 2d6+2 · R2 → **2d6+3 · R2** | 18 % → **33 %** | 190 → 160 | Buena Calidad | Con sus tres bonos le queda 2d6+3 (33 %): floja. Propuesta: dejar Cargador y Carcaj integrado y sacar el Virote recuperable. |

