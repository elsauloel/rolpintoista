# 🎲 Auditoría de tiradas (2026-11-10)

**La regla del dueño (2026-11-10):** las tiradas las hace **el usuario involucrado, con su botón, en el cuadro del duelo de siempre** (el mismo de
los ataques y las habilidades). El mapa no tira solo, y no se inventan carteles nuevos. Si el jugador no está, el GM tira por él. Siempre queda
**✋ Resolver a mano**.

Esta hoja junta **todo lo que hoy se tira sin que el involucrado apriete un botón en el cuadro del duelo**, para decidir por bloques qué se cambia.
Es solo una revisión: no se tocó código. Parte de la lista que había en `pendientes.md` («Tiradas que todavía hace sola el mapa») y la completa.

**Qué significa cada recomendación:**
- **A** — pasar al cuadro del duelo como **tirada contra tirada** (cada lado tira con su botón).
- **B** — pasar al cuadro del duelo como **una sola tirada** con su botón (un daño, una chance «entra / no entra»), sin rival.
- **C** — **dejarla automática a propósito** (se explica por qué).
- **D** — **preguntarle al dueño**.

**En curso (otro ayudante, no se cuentan acá):** Golpe en la sien, Carga que derriba, Salto aplastante, Tolerar un efecto (Espina tóxica) y Atraer
(gancho) pasan al cuadro del duelo, y se saca el cartel `js/115`.

**Ya andan bien (no hay que tocarlas):** el ataque y la defensa, el crítico (los d20 con botón), el empate (la moneda con botón), los efectos del arma
al pegar (el atacante los tira con su botón dentro del duelo), las Ejecuciones de habilidades (incluidas las zonas que van por duelo, como la Nube
tóxica y los Pedos tóxicos), la iniciativa, la cura, la Varita del caos, la Tormenta arcana (la cantidad la tira quien la usa) y los consumibles y
habilidades sin Ejecución (los tira quien los usa, con su botón).

## Resumen por bloque

| Bloque | Casos | Recomendación | Esfuerzo |
|---|---|---|---|
| 1 · Resistencias: un stat contra otro (Res.Mt, Res.Esp, Res.CC…) | 8 | **A** (6), **B** (1), **D** (1) | media |
| 2 · Daños que salen solos | 6 | **B** | chica |
| 3 · Chances «entra / no entra» que salen solas | 8 | **B** (7), **C** (1) | chica |
| 4 · Carteles propios con botón (no tiran solos, pero no usan el duelo) | 7 | **D** | media a grande |
| 5 · Al azar a propósito (escondido, o solo de orden) | 7 | **C** | — |
| **Total** | **36** | | |

## 1 · Resistencias: un stat contra otro

| # | Qué | De quién | Dónde | Hoy | Rec. | Esfuerzo |
|---|---|---|---|---|---|---|
| 1 | **Zona persistente** (la que se pisa: brasas, nube de una trampa, zona del GM) | estado / zona | `js/08` `zonaResolverBanner` l. ~681 y ~691 | la víctima tira su resistencia con un botón en un cartel propio; **la tirada de quien creó la zona sale sola** | **A**: el mismo duelo de zona que ya usa la Nube tóxica (`js/112`) | media |
| 2 | **Zona por duelo** (Nube tóxica, Pedos tóxicos): la tirada de quien la creó contra cada uno | habilidad | `js/112` `zonaDueloTirada` l. ~237 | con la zona ya puesta, la tirada de quien la creó **sale sola** en cada duelo nuevo (su valor guardado, con dados nuevos) | **A**: que la tire quien la creó con su botón (o una sola vez para todos, como en el área) | chica |
| 3 | **Escudo elemental**: el efecto del elemento (quemadura, congelado…) | habilidad (creep y clase) | `js/106` `escudoQuemarYa` l. ~578 | **las dos salen solas**: la Res.Esp de quien se quema y el Ef.Esp del escudo | **A** | media |
| 4 | **Anulación** («Dispel»): sobre zonas e invocaciones | habilidad | `js/13` `anulaZona` / `anularEn` l. ~2372, 2379, 2477 | **las dos salen solas**: el Ef.Esp de quien anula y la Res.Mt de quien creó la zona o invocó | **A** | media |
| 5 | **Aura espeluznante / de miedo**: al entrar | habilidad / estado | `js/52` `auraResolver` l. ~148 | un cartel propio; **un solo botón tira los dos lados** (Ef.Esp del dueño del aura y Res.Mt del que entra) | **A** | chica |
| 6 | **Mala sombra** (mufa): al empezar la ronda | habilidad | `js/102` `ordenTirarValor` l. ~150 | **sale sola**: la Res.Mt contra el Ef.Esp | **A** | media |
| 7 | **Cebo** (Hunter): la Res.Mt de cada rival que lo ve | habilidad (creep) | `js/80` `ceboAtraer` l. ~46 | **sale sola**: la Res.Mt contra una dificultad fija | **B** (la tira quien lo ve, contra el número fijo) | chica |
| 8 | **Choque por empujón**: el daño de colisión (una Constitución por cada casilla que faltó) | regla general | `js/13` `colisionTirar` l. ~2227 | **sale sola** | **D**: ¿quién la tira? ¿el que empujó o el empujado? | media |

## 2 · Daños que salen solos

| # | Qué | De quién | Dónde | Hoy | Rec. | Esfuerzo |
|---|---|---|---|---|---|---|
| 9 | **El daño de una zona** al que no la resiste | zona | `js/08` l. ~722, 723 | **sale solo** | **B**: lo tira quien creó la zona (el GM si es del GM) | media |
| 10 | **Varita inestable**: el daño que le explota en la mano a quien la usó | ítem | `js/13` `dueloRiesgo` l. ~2535 | **sale solo** | **B** (lo tira quien la usó) | chica |
| 11 | **Virote que estalla** | ítem (munición) | `js/33` l. ~160 | **sale solo** | **B** (lo tira quien disparó) | chica |
| 12 | **Mordida que no suelta**: el daño que se repite al no soltarse | habilidad (creep) | `js/54` `mordidaDano` l. ~233 | **sale solo** | **B** (lo tira el dueño de la mordida, el GM) | chica |
| 13 | **Cepo del cazador**: el daño al fallar el intento de soltarse | trampa / estado | `comun/creep-acciones.js` l. ~104 y `comun/ficha-acciones.js` l. ~100 | **sale solo** | **B** | chica |
| 14 | **Desarmar una trampa**: el 1d10 de qué pasa al fallar | regla general | `js/28` l. ~64 | el intento lo tira quien desarma con su botón; **el 1d10 de la falla sale solo** | **B** (lo tira quien desarma) | chica |

## 3 · Chances «entra / no entra» que salen solas

| # | Qué | De quién | Dónde | Hoy | Rec. | Esfuerzo |
|---|---|---|---|---|---|---|
| 15 | **Parálisis del Escudo eléctrico** | habilidad | `js/106` l. ~609 | **sale sola** | **B** (la tira el dueño del escudo) | chica |
| 16 | **Parálisis del rayo en cadena**, en cada salto | habilidad / arma | `js/13` `dueloCadena` l. ~2182, 2196 | **sale sola**, una por salto | **B** (con muchos saltos conviene un botón que tire todas juntas) | media |
| 17 | **Rayo en el agua**: la chance de cada uno en el charco | superficie | `js/50` `aguaConduceRayo` l. ~812 | **sale sola** | **B** | chica |
| 18 | **Flecha eléctrica**: la Parálisis del salto | ítem (munición) | `js/33` l. ~99 | **sale sola** | **B** | chica |
| 19 | **Estado de una zona con chance** (Veneno 50 % de la Varita de miasma) | zona / ítem | `js/08` l. ~777 | **sale sola** | **B** | chica |
| 20 | **Romper el escudo** (un golpe con Romper armadura parado con el escudo) | regla del arma | `js/26` `dueloRompeEscudo` l. ~76 | **sale sola** (va a la Mesa) | **B** (la tira el atacante, como los otros efectos del arma) | chica |
| 21 | **Orbe salvaje**: el d6 de qué hace | ítem (talismán) | `js/53` `talSalvajeRodar` l. ~100 | **sale solo** | **B** (lo tira quien lo lleva) | chica |
| 22 | **Saque rápido**: no pagar No2 al sacar un consumible | ítem / pasiva | `comun/creep-acciones.js` l. ~375 (y la ficha) | **sale sola, sin dados que rueden** | **C**: el dueño lo pidió así el 2026-10-05 («se tira callado y se anuncia en texto») | — |

## 4 · Carteles propios con botón (no tiran solos, pero no usan el cuadro del duelo)

El dueño se quejó del cartel `js/115` (2026-11-10). Estos ya existían antes y **tienen botón**, pero son carteles propios. ¿Se pasan al cuadro del
duelo o se dejan?

| # | Qué | Dónde | Hoy | Rec. | Esfuerzo |
|---|---|---|---|---|---|
| 23 | **Trampas paso a paso**: «pisaste la trampa, tirá…», el daño de quien la puso | `js/19` | cartel propio, cada uno con su botón (rehecho hoy) | **D** | grande |
| 24 | **Retirada limpia, Inamovible, Recuperarse rápido, Reflejos de mangosta** (chances de piezas) | `js/21`, `js/23`, `js/17` | cartel propio con «🎲 Tirar 1d6» (regla del dueño del 2026-10-04: «no pueden ser silenciosas») | **D** | media |
| 25 | **Escudo elemental**: el 1d6 de daño al entrar o al empezar el turno pegado | `js/106` | cartel propio con botón | **D** | media |
| 26 | **Malviaje** (Res.Mt y el 1d6) | `js/52` l. ~283 | cartel propio con botón | **D** | chica |
| 27 | **Soltarse / ayudar a zafarse** | `js/54` | cartel propio con botón | **D** | media |
| 28 | **Confusión**: el 1d4 de qué hace en su turno | `js/20` l. ~110 | aviso propio con botón | **D** | chica |
| 29 | **Tirada extra de una zona** (Pedos tóxicos: el d20 de qué le pasa) | `js/66` | cartel propio con botón | **D** | chica |

## 5 · Al azar a propósito

| # | Qué | Dónde | Por qué dejarla así (**C**) |
|---|---|---|---|
| 30 | **Detección del que está en sigilo**: la Destreza del oculto | `js/16` `deteccionGMResolver` l. ~412 | la tira el GM a escondidas: si la tirara el jugador a la vista, se delata. **Confirmar con el dueño.** |
| 31 | **Robo en sigilo**: la tirada del ladrón | `js/47` l. ~179 | no va a la Mesa para no delatarlo |
| 32 | **Qué se roba** (ítem al azar, oro) | `js/47` l. ~46, 64, 112 | es solo sortear qué cosa |
| 33 | **Dónde cae el arma** desarmada o soltada | `js/62` l. ~224, `js/27` l. ~58 | es solo un lugar |
| 34 | **Qué pieza rompe** Romper armadura | `comun/ficha-acciones.js` l. ~1097 | es solo sortear la pieza (lo avisa al jugador) |
| 35 | **A quién le cae cada proyectil** de la Tormenta arcana, y **a quién ataca** un Confundido | `js/44` l. ~10, `js/20` l. ~151 | es un sorteo de objetivo; la cantidad la tira quien la usa |
| 36 | **El botín** al terminar el combate | `comun/combate-fin.js` | es un sorteo de premios |

## Preguntas para el dueño

1. **Bloque 4:** los carteles propios que ya tienen botón (las trampas, las chances de las piezas, el 1d6 del Escudo elemental, el Malviaje,
   soltarse, la Confusión y la tirada extra de la zona), ¿los pasamos todos al cuadro del duelo, o te sirven así? Las trampas son el más grande.
2. **Choque por empujón (#8):** el daño de colisión, ¿lo tira quien empujó o el empujado?
3. **Detección del sigilo (#30):** ¿está bien que el GM la tire a escondidas?
4. **Saque rápido (#22):** ¿sigue callado, como pediste el 2026-10-05, o ahora también con botón?
5. **Bloques 1 a 3:** ¿se aprueban en bloque (A y B) para hacerlos de a tandas?
