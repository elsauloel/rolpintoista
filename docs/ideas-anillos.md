# Lluvia de ideas: anillos nuevos

> Pedido del dueño (2026-10-18): «desde que hice los anillos hasta hoy pasamos por muchas instancias de diseño: tirame una lluvia de ideas
> para anillos que cubran bonos que estén faltando, y también anillos con mecánicas, incluidas las más nuevas». Para podar: el dueño marca
> cuáles sí, cuáles con cambios y cuáles no; después se cargan calidad por calidad (Común y Buena primero), como en `rework-anillos.md`.
>
> Marcas: **⚙** ya se puede armar con lo que existe (un stat o una mecánica que el juego ya hace sola) · **🔧** hay que programar algo ·
> la calidad es una sugerencia. Los nombres son provisorios (los retoca el dueño).

## ✅ Elegidos por el dueño (2026-10-18, «me gusta»)

**Cargados y probados en el mapa (2026-10-18):** los cuatro de abajo, en `comun/catalogo.js` (`anillo-del-pantano`, `anillo-del-ultimo-aliento`, `anillo-del-trebol`, `anillo-del-alquimista`). El del último aliento quedó **Raro, 350** (dueño). Mecánica: el pantano es Envenenador +1 (`venenista`); el último aliento, `ultimoAliento` (`FichaAcciones.fijarHp` y el daño del mapa, `danioPj`; se recarga en `FichaMantenimiento.descansar`); el trébol, `trebol` (el botón 🍀 de js/25 pone un estado con `afortunadoTodo` que gasta la próxima tirada de `tirarValorStat`); el alquimista, `alquimista` (`costoDeSacar`).

- **Anillo del pantano**: tus Venenos entran con 1 stack más (y, como dura tantos turnos como stacks, 1 turno más), venga de un arma, una
  varita, una habilidad, una zona o una trampa. Propuesta: Buena, 170. 🔧
- **Anillo del último aliento**: una vez por día, cuando un golpe te dejaría en 0, quedás con 1 (se recarga al pasar de día). Propuesta: Buena,
  200, o el primer anillo Raro (pregunta al dueño). 🔧
- **Anillo del trébol**: una vez por combate, un botón 🍀 (como la Polilla) y tu próxima tirada sale como Afortunado. Propuesta: Buena, 160. 🔧
- **Anillo del alquimista**: el primer consumible del turno sacado del cinturón no cuesta No2 (el cuarto «me gusta»). Propuesta: Buena, 150. 🔧

## A. Bonos que faltan (hoy ningún anillo los da)

| Anillo | Qué hace |
|---|---|
| Anillo de pies ligeros | Iniciativa +2 · Común ⚙ |
| Anillo del caminante | Pasos gratis +1 (el primer casillero de cada turno no gasta No2) · Común ⚙ |
| Anillo de sombra | Sigilo +2 · Común ⚙ |
| Anillo de amparo | Defensa especial +1 · Común ⚙ (hoy hay Res.Esp, no Defensa especial) |
| Anillos de malla (serie) | Res. crítico Tipo 6 / 8 / 10 / 12 +1, uno por Tipo · Común ⚙ (hoy solo existe el de Tipo 4) |
| Anillos de resguardo (serie) | Res. fuego / hielo / eléctrica / tóxico / ácido +2, fijo · Común ⚙ (hoy solo el Cambiante, +1 a elegir) |
| Anillo de manantial | Regeneración de SP +1 · Buena ⚙ |
| Anillo de savia | Regeneración de vida +1 · Buena ⚙ |
| Anillo del ojo de halcón | Crítico frecuente +1 · Buena ⚙ |
| Anillo del filo cruel | Crítico potente +1 · Buena ⚙ |
| Anillo del tirador | PdG a distancia +1 · Común ⚙ |
| Anillo del duelista | PdG de oportunidad y de contraataque +2 · Común ⚙ |
| Anillo de bolsillos | Cinturón +1 ranura · Común ⚙ |
| Anillo de la mula | Mochila +4 ranuras · Común ⚙ |
| Anillo de pisada atenta | Percepción +2 para notar trampas y +2 para desarmarlas · Común ⚙/🔧 |

**Fuera de la escalera** (ya aprobado como idea, 2026-10-06, `pendientes.md`): los anillos de **atributo** (Agilidad, Fuerza…) o de
**Evasión +3** serían **artefactos**, de botín y únicos, no de tienda.

## B. Mecánicas con lo nuevo

### Miedo, controles y la mente
| Anillo | Qué hace |
|---|---|
| Anillo de la mirada helada | La primera vez en la ronda que alguien te ataca cuerpo a cuerpo, tira Res.Mt contra tu Ef.Esp o queda con Miedo de vos · Buena 🔧 |
| Anillo de la mente clara | Una vez por combate, el primer control **mental** que te entra no entra (Inmunidad mental de un uso) · Buena 🔧 |
| Anillo del ancla | Inamovible: no te empujan ni te arrastran (gancho, embestida, explosiones) · Buena ⚙ (el preset existe) |
| Anillo de suelo firme | +2 a la Agilidad para no caerte (hielo, aceite, trampas que sientan) · Común 🔧 |

### Elementos
| Anillo | Qué hace |
|---|---|
| Anillo de escarcha profunda | Tu daño de hielo deja 1 stack más de Escarcha · Buena 🔧 |
| Anillo conductor | Tu rayo salta la primera vez **entero** (no la mitad) · Rara 🔧 |
| Anillo de brasas vivas | Las zonas de fuego que creás duran 1 turno más · Buena 🔧 |
| Anillo del pantano | Tus Venenos entran con 1 stack más · Buena 🔧 (el reverso de la Piedra bezoar) |

### Sigilo, marca y espalda
| Anillo | Qué hace |
|---|---|
| Anillo del zorro | Por la espalda, +1 PdG más (se suma al +1 / +2 de la regla) · Común 🔧 |
| Anillo del cazador | +2 de daño contra quien está Marcado · Buena 🔧 |
| Anillo del sexto sentido | Siempre te avisa «Pasos a tu espalda» aunque el que viene tenga Pasos silenciosos · Común 🔧 |

### Vida, aguante y la última línea
| Anillo | Qué hace |
|---|---|
| Anillo de la sangre fría | Una vez por combate, al bajar del 25 % de la vida, Vida extra 5 · Buena 🔧 (como el Bolsillo de emergencia) |
| Anillo del último aliento | Una vez por día, cuando caerías a 0 quedás con 1 · Rara 🔧 |
| Anillo de la vampira | Drena el 10 % (para arriba) del daño que hacés con un arma · Buena/Rara 🔧 (la mecánica «Drena vida» existe en las armas: hay que sumarla desde un anillo) |
| Anillo del sacrificio | Si te falta SP, lo pagás con vida (1 por SP) · Buena 🔧 |

### Turnos, suerte y repetir
| Anillo | Qué hace |
|---|---|
| Anillo del trébol | Una vez por combate, tu próxima tirada se tira como Afortunado (botón, como la Polilla) · Buena 🔧 |
| Anillo del jugador | Al descansar, +1 Wildcard (por encima del tope de siempre) · Buena 🔧 |
| Anillo del relámpago | Prisa: vas antes que todos en la ronda (entre los que tienen Prisa decide la iniciativa) · Rara ⚙ (Prisa existe) |
| Anillo del martillo lento | Tus críticos dejan Demora (baja 1 lugar en el orden de turnos) · Buena 🔧 |

### Aliados, invocaciones y equipo
| Anillo | Qué hace |
|---|---|
| Anillo del juramento | Guardián +1: el aliado al lado tuyo tiene +1 Defensa · Buena ⚙ (Guardián existe) |
| Anillo de mando | Los aliados a 1 casilla: +1 Res.CC (un estandarte chico, sin ocupar la mano) · Buena ⚙ |
| Anillo del vínculo | Tus invocaciones aparecen sin Mareo de invocación y con +5 de vida · Buena 🔧 |
| Anillo del alquimista | El primer consumible del turno sacado del cinturón no cuesta No2 · Buena 🔧 |
| Anillo del arquero | Carcaj +3 flechas y la primera flecha especial del combate no cuesta No2 · Común ⚙/🔧 |
| Anillo del rompehuesos | Con un arma Tipo 8 o más, tus críticos dejan 1 Armadura rota más · Buena 🔧 |

## C. Malditos (algo bueno con algo malo)

| Anillo | Qué hace |
|---|---|
| Anillo del glotón | Vida +10 · No2 máximo −1 · Común ⚙ |
| Anillo del apostador | Crítico potente +2 · Evasión −1 · Buena ⚙ |
| Anillo del tuerto | Crítico frecuente +1 · Visión −2 · Común ⚙ |
| Anillo del avaro | Tu parte del oro +20 % · Res.Mt −2 · Común ⚙ |
| Anillo de la furia ciega | Daño +3 · no podés hacer Parry · Buena 🔧 |

## D. De a dos (aprovechar que son dos manos)

| Anillos | Qué hacen |
|---|---|
| Anillos gemelos | Cada uno solo no hace nada; con los dos puestos, PdG +1 y Evasión +1 · Buena 🔧 |
| Anillo del sol y Anillo de la luna | Cada uno da algo chico (Luz +2 / Visión +2); juntos, además, ves lo oculto a 2 casillas · Buena 🔧 |

## E. Por día (pedido del dueño, 2026-10-19: «anillos que otorguen efectos por día, por ejemplo +6 de maná extra que funcione igual a la vida extra»)

Hecho: **Anillo de la siesta** (Buena, 150): cada descanso, Vida extra 10 (no se recarga por turno; vuelve con el próximo descanso).

| Anillo | Qué hace |
|---|---|
| Anillo del mate cocido | Cada descanso, **SP extra 6**: se gasta antes que tu SP y no vuelve hasta el próximo descanso · Buena 🔧 (mecánica nueva: «SP extra», como la Vida extra) |
| Anillo del madrugador | El primer combate del día arrancás con 2 No2 de más (por encima del máximo; se van en la primera recarga) · Buena 🔧 (como lo de más del Matelisto) |
| Anillo del curandero | Una vez por día, botón: te sacás un estado malo a elección · Buena 🔧 |
| Anillo de la segunda oportunidad | Una vez por día, botón: repetís una tirada tuya y te quedás con la mejor (como el 🧚 Re-roll, sin SP) · Buena 🔧 |
| Anillo del paso de sombra | Una vez por día, te movés hasta 3 casillas sin No2 y sin ataque de oportunidad · Rara 🔧 |
| Anillo del faro | Una vez por día, botón: una luz en flor de 7 alrededor tuyo que revela lo oculto por 3 turnos (como la Varita de la luz, sin varita) · Buena ⚙/🔧 |
| Anillo del herrero ambulante | Cada descanso, todas las piezas de tu equipo recuperan 1 de durabilidad · Buena 🔧 |
| Anillo de la mesa servida | Cada descanso, una Poción de HP chica aparece en tu cinturón (si hay lugar) · Buena 🔧 |
| Anillo del escudo de la mañana | Cada descanso, Escudo especial 6 (Vida extra solo contra daño especial) · Buena 🔧 |

**Decidido (dueño, 2026-10-19) y cargado:** **Madrugador** (3 No2, Común, 110), **Curandero** (dos veces por día, con su botón 🩹 junto a la Polilla y
la moneda; Buena, 160), **Herrero ambulante** (1 punto por cada pieza que lo necesite; Buena, 140) y **Mesa servida** (una Poción de HP por
descanso; Buena, 150). **No van:** Segunda oportunidad (redundante con las wildcards), Paso de sombra y Faro. **En pregunta:** el Escudo de la mañana
(una Vida extra solo contra daño especial: hay que programarla). Además, la **Puntería certera** pasó a la regla del Foco: PdG +2 si no te
moviste ni en esta ronda ni en la anterior.

