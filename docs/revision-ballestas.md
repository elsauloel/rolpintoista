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

## ✅ Aplicado (2026-10-11, OK del dueño)
Todas las Comunes y Buenas perdieron el Rango de bono (queda el de la Destreza; el Rango −1 de la corta sigue). Las Comunes pasaron a Recarga 3 y las
Buenas a Recarga 2, con el daño de la tabla de arriba. Recortes: la de doble cuerda **pasó a Buena** (con Recarga 3 su mecánica la dejaba en el borde)
→ 2d6+2 · Perfora 1; la de tranquera, Recarga 2 y 2d6 · Perfora 2 con Llega cargada (150); la del rastreador sin «ignora 1 de Res. crítico» (3d6+1);
la de vigía sin la caída (2d6+3); la de mira corta con PdG +1 de 1 a 3 (2d6+3); la del acechador sin la Emboscada (2d6+3); la virotera sin el
virote recuperable (2d6+4); la abollacascos con Rompe armadura 25 % (3d6+1). Las de dos mecánicas o una mecánica cara quedan con menos daño de base
(Comunes ~50 %, Buenas ~35–55 %), como los arcos: su mecánica pone el resto.

**Ajuste (2026-10-11, dueño: «la de fortín, punta de diamante y mano reforzada son iguales»):** para que no queden mellizas, la de cazador recupera Rango +3 (1d6+1, la Común «de lejos», 85), la de estribo es la del disparo fuerte (1d6+3, 100 %, 80) y la de guardia recupera Rango +2 (2d6+1 · Perfora 2, 140).

## 2026-10-11 · Segunda vuelta: la Perfora de base (propuesta para el OK, sin cargar)
El dueño, viendo la lista: «sin sumar tu Dmg, ¿no para todo la armadura?», «si no tenés Destreza para garantizar críticos no sirve para nada», «y daño T4
+N?», «le metemos ignora resist y crit frec, además de perfora y rompe». Medido en todas las clases (Warrior, Tanque, Asalto, Shooter, Mago,
Support), contra el blanco medio y el pesado:
- Una ballesta de **daño fijo, sin Perfora**, solo le sirve al que mete críticos (Shooter, Asalto): al resto la Defensa le come todo, y contra el
  pesado no le hace nada a nadie. **Tipo 4** no ayuda (la Resistencia a Tipo 4 es la más común y el d4 pega menos).
- **La Perfora** hace andar la ballesta para cualquiera: al Mago y al Support les rinde igual o más que su arma cuerpo a cuerpo (nivel 3: casi el
  doble), y contra el pesado deja de rebotar.
- **Crítico frecuente e «ignora Resistencia»** solo suman en manos de quien tiene Destreza, y ahí multiplican: «ignora 2» en una Buena triplica al
  Shooter. La calculadora ahora cobra el doble el «ignora» en una ballesta (`BAL_IGNORA_MULT`); el Crítico frecuente +1 mide manso.
- **Rompe armadura** (no lo mide el simulador): baja la Defensa del blanco para todo el grupo y no depende del crítico: el rasgo «de equipo».

**Propuesta:** la Perfora es la base de todas; el daño fijo alto queda en la de estribo («el disparo fuerte», la de tirador); la del rastreador
es la Buena «de tirador» (Crítico frecuente +1); la de pared suma Rompe armadura. Rinde = Shooter contra el blanco medio / pesado (su mejor
cuerpo a cuerpo = 100 %) y el Mago contra el medio.

| Ballesta (precio) | Daño (antes → propuesta) | Lo que tiene | Shooter medio / pesado | Mago medio |
|---|---|---|---|---|
| Ballesta de estribo (80) | 1d6+3 → **1d6+3** | — | 97 / 0 % | 24 % |
| Ballesta corta (95) | 1d6+2 · Perfora 1 → **1d6+1 · Perfora 2** | 1 mano · Rango −1 | 91 / 58 % | 94 % |
| Ballesta de pared (100) | 1d6+2 · Perfora 1 → **1d6+1 · Perfora 2** | Evasión −1 · Rompe armadura 25 % | 91 / 58 % | 92 % |
| Ballesta del calderero (95) | 1d6+2 → **1d6+1 · Perfora 1** | Rompe armadura 33 % (5–6 en d6) | 76 / 29 % | 46 % |
| Ballesta del rematador (95) | 1d6+2 → **1d6 · Perfora 2** | Remate: Crítico frecuente +2 | 74 / 53 % | 85 % |
| Ballesta de tiro largo (95) | 1d6+1 · Perfora 1 → **1d6 · Perfora 2** | Alcance con caída: −2 de daño por casillero de más | 73 / 54 % | 85 % |
| Ballesta del baqueano (95) | 1d6+2 → **1d6 · Perfora 2** | Lisiado 25 % (4 en d4) | 72 / 54 % | 85 % |
| Ballesta del matrero (90) | 1d6+1 · Perfora 1 → **1d6 · Perfora 2** | Veneno 2 stacks 33 % (5–6 en d6) | 71 / 54 % | 85 % |
| Ballesta de virote dentado (95) | 1d6+2 → **1d6 · Perfora 2** | Sangrado 33 % (5–6 en d6) | 71 / 54 % | 84 % |
| Ballesta de cazador (95) | 1d6+1 → **1d6 · Perfora 1** | Rango +3 | 67 / 29 % | 46 % |
| Ballesta de batida (85) | 1d6 → **1d6 · Perfora 1** | Tirador de apoyo +1 PdG | 64 / 29 % | 46 % |
| Ballesta de mira (90) | 1d6 → **1d6 · Perfora 1** | Apuntada firme +2 | 63 / 29 % | 47 % |
| Ballesta de acecho (90) | 1d6 · Perfora 1 → **1d6 · Perfora 1** | Emboscada: Crítico frecuente +2 | 63 / 29 % | 46 % |
| Ballesta de mano (90) | 1d6 · Perfora 1 → **1d6 · Perfora 1** | 1 mano · Iniciativa +2 | 62 / 29 % | 46 % |
| Ballesta de quemarropa (95) | 1d6 → **1d6 · Perfora 1** | 1 mano · A quemarropa (a 1 casilla): +3 de daño | 60 / 29 % | 46 % |
| Ballesta rompescudos (95) | 1d6 → **1d6** | Rompe armadura 25 % (4 en d4), seguro si es crítico · Atraviesa escudos | 51 / 0 % | 0 % |
| Ballesta abollacascos (160) | 3d6+1 → **2d6+1 · Perfora 3** | Rompe armadura 25 % (4 en d4) | 109 / 132 % | 247 % |
| Ballesta del boyero (160) | 3d6+1 → **2d6+1 · Perfora 3** | Derribar 25 % (4 en d4) | 109 / 131 % | 239 % |
| Ballesta de punta de diamante (160) | 2d6+2 · Perfora 2 → **2d6+1 · Perfora 3** | Punta de diamante | 108 / 131 % | 247 % |
| Ballesta de mano reforzada (140) | 2d6+2 · Perfora 2 → **2d6+1 · Perfora 3** | 1 mano | 108 / 131 % | 249 % |
| Ballesta de centinela (160) | 2d6+1 · Perfora 2 → **2d6 · Perfora 3** | Oportunidad sin No2 | 107 / 130 % | 244 % |
| Ballesta de la ciénaga (150) | 2d6+1 · Perfora 2 → **2d6 · Perfora 3** | Veneno 3 stacks 50 % (2 en d2) | 107 / 130 % | 241 % |
| Ballesta virotera (160) | 2d6+4 → **2d6 · Perfora 3** | Cargador 2 · Carcaj integrado +3 | 107 / 130 % | 244 % |
| Ballesta de fortín (160) | 2d6+2 · Perfora 2 → **2d6+1 · Perfora 3** | Rompe armadura 25 % (4 en d4) | 107 / 131 % | 250 % |
| Ballesta de doble cuerda (170) | 2d6+2 · Perfora 1 → **2d6 · Perfora 3** | Doble cuerda | 107 / 130 % | 240 % |
| Ballesta de vigía (160) | 2d6+3 → **2d6 · Perfora 3** | Apuntada firme +2 | 107 / 131 % | 238 % |
| Ballesta de guardia (150) | 2d6+1 · Perfora 2 → **2d6 · Perfora 3** | Rango +2 | 107 / 129 % | 252 % |
| Ballesta de tiro rápido (160) | 2d6+2 · Perfora 1 → **2d6 · Perfora 3** | Tiro rápido | 106 / 130 % | 241 % |
| Ballesta remachadora (160) | 2d6+2 · Perfora 1 → **2d6 · Perfora 3** | Remachadora | 105 / 131 % | 250 % |
| Ballesta de mira corta (160) | 2d6+3 → **2d6 · Perfora 3** | Distancia ideal de 1 a 3 casilleros: PdG +1 | 105 / 129 % | 244 % |
| Ballesta de estopa (140) | 2d6+4 → **2d6 · Perfora 3** | Prende fuego 33 % (5–6 en d6) | 105 / 129 % | 244 % |
| Ballesta de primer tiro (170) | 2d6+3 · Perfora 1 → **2d6+2 · Perfora 2** | Primer disparo: +1 dado | 77 / 87 % | 171 % |
| Ballesta de escolta (170) | 2d6+3 · Perfora 1 → **2d6+2 · Perfora 2** | Tirador de apoyo +1 PdG | 75 / 87 % | 167 % |
| Ballesta de tranquera (150) | 2d6 · Perfora 2 → **2d6 · Perfora 2** | Llega cargada | 72 / 87 % | 163 % |
| Ballesta del acechador (150) | 2d6+3 → **2d6 · Perfora 2** | Espalda a distancia: +2 PdG, +1 de daño | 71 / 87 % | 166 % |
| Ballesta del rastreador (150) | 3d6+1 → **2d6 · Perfora 1** | Lisiado 25 % (4 en d4) · Crítico frecuente +1 | 70 / 44 % | 83 % |
