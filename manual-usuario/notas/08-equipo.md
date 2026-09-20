+++
capitulo: Equipo y economía
icono: 🛡️
resumen: Qué llevás puesto y en la mochila, cuánto pesa, cuánto cuesta y cómo se consigue.
+++

+++
titulo: Equipo y ranuras
alias: [Ranuras, Slots, Equipar, Equipado, Equipo]
tags: [equipo, reglas-base]
estado: borrador
+++
Tu equipo se reparte en **ranuras** (slots). Lo que está *equipado* suma sus bonos a tus stats; lo que está en la **mochila** no.

| Ranura | Cuántos ítems | Notas |
|---|---|---|
| **Manos** (armas y escudos) | 2 manos en total | Un arma de [[Armas\|una mano]] usa 1; de dos manos usa las 2. Igual con [[Escudos]]. |
| **Torso** (armadura) | 1 blanda **+** 1 rígida | Ver [[Armaduras y piezas de defensa]] |
| **Cabeza** | 1 | |
| **Manos** (guantes) | 1 | |
| **Piernas** | 1 | |
| **Pies** | 1 | |
| **[[Anillos]]** | 2 (uno por mano) | |
| **[[Cinturón y consumibles\|Cinturón]]** | 5 por defecto | Para consumibles a mano |
| **Otros** | libre | Categoría comodín |

## Equipar y desequipar
- Desde el botón **🛡 Equipo** de la ficha (o el 🛡 de tu token en el mapa): ves lo equipado por ranura y la mochila, con *Sacar / Equipar / Cambiar*, **Ver** y **Editar**.
- **En combate cuesta [[Costos en Nitros|1 No2]]** cada equipar/desequipar (2 si reemplazás uno por otro). En narrativo, nada.
- El [[Carga máxima|peso equipado]] se ve arriba del panel.

> [!question] Detalles abiertos
> - ¿Los anillos tienen restricción de mano, o da igual cuál va en cuál?
> - ¿"Otros" tiene límite de cantidad?

+++
titulo: Armas
alias: [Arma, Arma de una mano, Arma de dos manos, Armas de rango]
tags: [equipo, combate]
estado: borrador
+++
Un arma se define por su **[[Daño y Tipo de arma|Tipo y peso]]** (cuánto y cómo pega), su **empuñadura** (una mano o dos) y si es **de rango** o cuerpo a cuerpo ([[Ataques a distancia]]).

- **Una mano** (`arma_1m`): dejás la otra mano libre para un [[Escudos|escudo]] o una segunda arma.
- **Dos manos** (`arma_2m`): ocupa las dos manos. Suelen ser más pesadas o de rango largo (arcos, ballestas, espadones).
- **Bonos:** muchas dan modificadores (Crítico +1, Parry +2, Rango +3).
- **[[Efectos al golpear]]:** Envenenar, Rompe armadura, Aturdir…
- Cada arma paga **su propio primer ataque barato** por turno ([[Costos en Nitros]]).

> [!example] Cuatro armas del catálogo
> **Daga** (Común, Tipo 4) · **Espada larga** (Buena calidad, Tipo 6) · **Hacha de batalla a dos manos** (Raro, Tipo 10, peso 3) · **Arco del cazador de eclipses** (Legendario, a distancia, +2 crítico, sangrado).

+++
titulo: Escudos
alias: [Escudo, Escudo de una mano, Escudo de dos manos, Pavés]
tags: [equipo, combate]
estado: borrador
+++
Los escudos dan **[[Defensa]]** y **[[Resistencia a crítico]]**, a veces **[[Bloqueo]]** o **[[Parry]]**. Los hay de **una mano** (podés combinarlos con un arma) y de **dos manos** (más grandes: con uno equipado no llevás arma).

> [!example] Del catálogo
> *Tapa de tacho de basura* (Común, Def 3) · *Broquel de acero* (Raro, Parry +3) · *Muralla de acero* (Raro, dos manos, Def 12, Bloqueo +3, Movimiento −1) · *Baluarte del Último Bastión* (Legendario, dos manos, inmune a rotura de armadura).

> [!question] Escudos en la defensa
> El **Parry con escudo** todavía no está definido ([[Defenderse de un ataque]]).

+++
titulo: Armaduras y piezas de defensa
alias: [Armadura, Armadura blanda, Armadura rígida, Casco, Guantes, Piernas, Botas, Pieza de defensa]
tags: [equipo]
estado: borrador
+++
Las piezas de defensa dan [[Defensa]] y [[Resistencia a crítico]] (y a veces bonos como Evasión o HP máximo). Se equipan en su ranura ([[Equipo y ranuras]]).

## Torso: blanda y rígida
Solo el torso distingue **blanda** (flexible: gambesones, cueros) y **rígida** (dura: placas, corazas). **Podés llevar una de cada una a la vez.** Las armaduras pesadas dan más Defensa pero suelen bajar tu Evasión o tu Movimiento y sumar [[Carga máxima|peso]].

## Cabeza, manos, piernas, pies
Categoría **plana**: un solo ítem por ranura, sin distinción de material.

## Qué esperar según la rareza
La [[Rareza]] sube la Defensa y las resistencias, pero **las resistencias a críticos altos son escasas** a propósito: ver [[Resistencia a crítico]].

> [!warning] Los estados las afectan
> [[Armadura rota]] (−1 Def por acumulación) y Armadura arruinada (anula las armaduras del torso) las castigan.

+++
titulo: Anillos
alias: [Anillo, Anillos mágicos]
tags: [equipo]
estado: borrador
+++
Los **anillos** ocupan dos ranuras (**uno por mano**) y dan **un bono chico y específico**: Evasión +1, Rango +1, HP máximo +10, Iniciativa +1… Los hay de cada [[Rareza]]: a mayor rareza, más bono (y a veces varios).

Algunos no dan números sino un **efecto de estado** ("Anillo de Sangre limpia": inmunidad a veneno). Ver [[Invulnerable]].

+++
titulo: Cinturón y consumibles
alias: [Cinturón, Consumibles, Consumible, Pociones, Pergaminos, Cinto]
tags: [equipo, recursos]
estado: borrador
+++
Los **consumibles** (pociones, pergaminos, vendas, bombas…) se gastan al usarlos. Pueden **curar HP**, **aplicarte un estado** o dar un efecto especial.

## Cinturón vs mochila
| Dónde está | Costo de usarlo |
|---|---|
| En el **cinturón** | **1** [[Nitros (No2)\|Nitro]] |
| En la **mochila** | **2** Nitros (el doble) |

- El **cinturón** tiene **5 ranuras** por defecto; se compran cinturones para ampliarlo.
- Cada consumible viene en **unidades**; algunos tienen varias cargas.

> [!example] Efecto de un pergamino
> *Pergamino de Buena Fortuna*: al usarlo se activa el estado [[Afortunado]] durante todo el combate. *Ankh de Reencarnación*: solo funciona si está **en el cinturón** cuando llegás a HP 0 ([[Muerte]]).

Ver también: [[Estados alterados]].

+++
titulo: Mochila
alias: [Inventario, Mochila (inventario)]
tags: [equipo]
estado: borrador
+++
La **mochila** es tu inventario general (20 ranuras por defecto). Lo que está adentro **no suma bonos ni peso** a tu [[Carga máxima]]. Sacar un consumible de ahí cuesta el doble en Nitros: [[Cinturón y consumibles]]. Cada ítem ocupa una o más ranuras.

+++
titulo: Carga máxima
alias: [Crg.Max, Peso, Peso equipado, Sobrepeso, Sobrecarga]
tags: [equipo, stats]
estado: borrador
+++
Tu **[[Fuerza]]** define tu **Carga máxima** (Crg.Max): cuánto peso podés llevar **equipado** sin castigo.

- **Solo cuenta lo equipado.** Lo que está en la mochila no suma.
- Cada ítem equipado tiene un **peso**. Se suman todos.
- Si te pasás, **por cada punto de peso que sobra perdés 1 de [[SP]] máximo**.

> [!example] Sobrecargado
> Crg.Max 8, llevás 10 de peso → te pasás por 2 → tu SP máximo baja en 2.

> [!question] Fórmula y efectos
> - ¿Cuál es la fórmula exacta FUE → Crg.Max?
> - ¿Hay piso (se puede llegar a 0 SP)? ¿El sobrepeso afecta el movimiento?
> - ¿La penalidad baja el máximo del combate o se recalcula cada vez que cambia el equipo?

+++
titulo: Rareza
alias: [Tier, Tiers, Común, Buena Calidad, Raro, Excepcional, Legendario, Calidad]
tags: [equipo, catálogo]
estado: borrador
+++
Cada ítem del [[Catálogo de ítems]] tiene una **rareza** (tier). Hay cinco:

| Rareza | Qué esperar |
|---|---|
| **Común** | Lo de todos los días. Barato y fácil de conseguir. Números bajos. |
| **Buena Calidad** | Mejor hecho. Un escalón sobre lo común. |
| **Raro** | Ya se nota en la mesa. Puede traer un bono particular. |
| **Excepcional** | Ítems especiales, con efectos fuertes. Precio alto. |
| **Legendario** | Piezas únicas de historia propia. Pueden romper reglas menores. |

## Rango de precios (en [[DDE]])
Como orientación, los precios del catálogo van de **decenas** en lo Común a **más de mil** en lo Legendario. Un ítem Común típico cuesta 30–90; Excepcional, cientos; Legendario, 1000–2000.

> [!tip] Inicio de partida
> En las tiendas de **Inicio de partida** el GM limita la rareza a **Raro como tope**: nadie arranca con algo Excepcional.

> [!question] Qué puede esperar encontrar el jugador
> Falta el texto de "qué implica cada rareza" para el jugador (dónde se consigue, con qué frecuencia). Hoy es una guía de diseño.

+++
titulo: Catálogo de ítems
alias: [Catálogo, Ítems, Items]
tags: [equipo, catálogo, herramientas]
estado: borrador
+++
El **catálogo** es la lista compartida de ítems del juego: **más de 600** armas, escudos, armaduras, anillos, cinturones y consumibles, organizados por [[Rareza]] y categoría. Está en la ficha ("comprar del catálogo"), en el [[Generador de tiendas]] y en el editor de catálogo.

> [!info] Son sugerencias
> Cada ítem del catálogo es **una invitación, no una regla**: podés usarlo tal cual, modificarlo o inventar tus propios ([[Crear tus propios ítems]]). Ver [[La esencia del Rol Pintoísta]].

## Cómo está organizado
- **Categorías:** armas (1 y 2 manos), escudos, armaduras blandas y rígidas, cabeza, manos, piernas, pies, cinturones, anillos y consumibles.
- **Cada ítem** tiene nombre, rareza, precio, peso, bonos, un **detalle** (qué hace, para el jugador) y una **descripción** (cómo es, con humor).
- El catálogo **no lleva imágenes** por ahora.

## Cómo llega un ítem nuevo
Cualquiera puede **proponer** un ítem que creó en la mesa (📦 *Agregar al catálogo*); el dueño del proyecto lo revisa. → [[Biblioteca de la comunidad]]

+++
titulo: Crear tus propios ítems
alias: [Ítem custom, Item custom, Crear ítem, Asistente de ítems, Ítems propios]
tags: [equipo, herramientas]
estado: borrador
+++
Podés inventar tus propios ítems: es una de las libertades centrales del [[La esencia del Rol Pintoísta|espíritu sandbox]]. Un **asistente paso a paso** (el mismo en la ficha, en GM Tools, en el generador de tiendas y en el editor del catálogo) te guía:

1. **Qué es:** categoría, nombre y descripción con tus palabras.
2. **Lo práctico** (según la categoría):
   - **Armas:** [[Daño y Tipo de arma|Tipo, peso y daño]], empuñadura (una o dos manos; rango o alcance), bonos y [[Efectos al golpear|efectos al golpear]].
   - **Defensa:** [[Defensa]] y [[Resistencia a crítico|resistencias a crítico]].
   - **Otros:** bonos a stats.
3. **Estado al equipar:** un estado que se activa solo al ponértelo.
4. **Precio y lugar** (mochila, cinturón, equipado). Resumen y listo.

Los **consumibles** usan un formulario aparte (cargas, curación, estado que aplican).

> [!tip] Consejo de diseño
> Para que se sienta parte del mundo, ponele un efecto **absurdo pero coherente** ([[Filosofía del mundo]]): una gorra de policía que da +1 a intimidar solo si estás de espaldas.

Para publicarlo en el catálogo compartido: 📦 **Agregar al catálogo** ([[Catálogo de ítems]]).

+++
titulo: DDE
alias: [Moneda, Dinero, Economía, Plata, Precio]
tags: [economía]
estado: pendiente
+++
**DDE** es la **moneda** del juego y la unidad de precio de todos los ítems del [[Catálogo de ítems]]. Tu saldo está en el botón **💰 DDE y despojos** del dock de la ficha.

Los precios van de decenas (lo Común) a miles (lo Legendario): ver [[Rareza]].

> [!question] Cómo se gana y gasta en mesa
> Este es el lado *jugador* de la economía: cuánto DDE recibís por misión, qué se vende y a qué precio, si hay descuentos. La fórmula de precios interna es material de diseño y no necesariamente va en el manual.

+++
titulo: Tiendas
alias: [Vendedor, Tienda, Comprar, Vender, Botín]
tags: [economía, herramientas]
estado: borrador
+++
Los ítems se compran y se venden en **tiendas** que arma y maneja el GM con el [[Generador de tiendas]]:

1. El GM arma la tienda (aleatoria o curada a mano) y la **publica**.
2. **El GM decide cuándo está abierta.** Con un interruptor la abre o la cierra. Mientras está **cerrada**, tu botón **🏪 Vendedor** aparece desactivado y, al pasar el cursor, dice **"Tienda cerrada"**.
3. Con la tienda abierta, entrás con **🏪 Vendedor** y ves su stock en vivo. Comprás y el ítem va a tu mochila, con el DDE descontado.
4. **Vender solo se puede en una tienda.** Dentro del Vendedor, el botón **💰 Vender** abre tu mochila: elegís qué ítems vender (y cuántas unidades) y ves cuánto vas a cobrar. También ahí vendés tus [[Despojos]].
5. **Cualquier tienda, de cualquier tamaño y tipo, compra de todo:** los ítems de los jugadores y los despojos.

## Cuánto pagan
- **Valor de venta de un ítem:** si el ítem no tiene uno propio, es **la mitad de su precio de compra**.
- Cada tienda tiene dos **ajustes de precios**: uno **al comprar** (lo que pagás) y otro **al vender** (lo que cobrás, ítems y despojos incluidos). Un vendedor avaro puede cobrar caro y pagar poco.
- Lo que tenés **equipado no se vende**: sacalo antes.

Además hay **tiendas guardadas** (una por lugar) para volver a ellas.

+++
titulo: Despojos
alias: [Despojo, Loot, Botín, Despojar]
tags: [economía, combate]
estado: borrador
+++
Los **despojos** son lo que dejan los enemigos y nadie se llevó. Se anotan en el dock de la ficha (**💰 DDE y despojos**).

- **Qué son:** una moneda intermedia. Cuando termina un combate, los ítems que soltaron los enemigos quedan en una lista; los jugadores toman los que quieran, y lo que sobra, cuando el GM aprieta **Despojar**, se convierte en despojos y se reparte entre los jugadores.
- **Cuánto valen:** **1 despojo se vende por 1 DDE** en cualquier tienda ([[Tiendas]]). Un ítem despojado da despojos por la **mitad de su valor de venta** (un cuarto de su precio de compra, si no tiene uno propio).
- **Tipos:** además del despojo común, la ficha tiene contadores de despojos **mágicos** y **especiales** que se anotan a mano por ahora.

> [!question] A futuro
> Se piensa un sistema de crafteo donde los despojos sirvan para fabricar cosas. Todavía no está diseñado.

+++
titulo: Experiencia y despojos
alias: [Experiencia, XP, Exp, Final del combate, Recompensas, Oro de los creeps]
tags: [economía, combate]
estado: borrador
+++
Al **finalizar un combate**, el GM ve un reporte con la experiencia, el oro y los ítems que soltaron los enemigos derrotados, los ajusta si hace falta y lo **publica**.

## Experiencia
- **Cada creep derrotado da XP** según su nivel. El total del combate se divide **entre la cantidad de jugadores**, como si todos estuvieran vivos (redondeando hacia arriba).
- Un jugador **inconsciente** ([[Muerte|inconsciente y muerte]]) recibe **solo el 25%** de lo que le tocaba, redondeado hacia abajo. Uno **muerto**, nada.
- El GM puede **sumar o restar** experiencia por circunstancias especiales de la pelea, y **dejar a un jugador afuera** (por ejemplo, si no estuvo en el combate).
- La experiencia se carga **sola** en la ficha. Si sube de nivel, le aparece un aviso de felicitación.

## Oro (DDE)
Cada creep humano o humanoide carga un poco de oro, con una pequeña variación al azar (±20%). Al publicar, el total se reparte entre los jugadores y se suma solo a su ficha. Una línea **verde** en la [[La Mesa|Mesa]] cuenta cuánto recibió cada uno.

## Ítems y despojos
Los ítems que soltaron los enemigos quedan en una lista: cada jugador toma con **"Sumar a la mochila"** los que quiera. Cuando el GM aprieta **Despojar**, todo lo que quedó se convierte en [[Despojos]] y se reparte.

> [!info] En construcción
> Esta parte del sistema se está armando por tandas: algunas piezas todavía no funcionan en la herramienta.

