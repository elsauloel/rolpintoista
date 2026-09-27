# Reglas de casteo (SP) — reglas definidas y mapa de revisión

> Empezado el 2026-09-21. **Esto no es "la magia"**: es todo lo que se **castea con SP** y no es un ataque con un arma.
> Lo que cuenta como casteo es **algo subjetivo y narrativo** — lo decide la mesa; estas reglas son la plataforma, no un corsé
> (ver "La esencia del Rol Pintoísta" en el `CLAUDE.md` de la raíz). Los stats se llaman **PdG.Esp** y **Res.Esp** (renombrados 2026-09-27, antes PdG.Mg / Res.Mg; los ids no cambiaron, siguen `pdgmg`, `resmg`)
> hasta que se decida otro nombre (ver P97).
>
> Estado: **los 5 pasos de decisión cerrados; el Paso 6 (tipo de daño y daño recibido) también, en su mayoría —
> ya lo cubría el sistema de duelo de habilidades (2026-09-27)**. Del Paso 7, la **Armadura mágica ya tiene código
> (2026-09-27)**; falta la reacción de esquivar áreas.
> Ver "Orden propuesto" más abajo y [`proceso-casteo.md`](proceso-casteo.md). Las preguntas abiertas están en
> [`preguntas-abiertas.md`](preguntas-abiertas.md), P97.

## 1. Reglas definidas (2026-09-21)

### 1.1 Daño de casteo: por defecto ignora armadura (Paso 1 cerrado, 2026-09-27)
La gracia del daño de casteo es que **ignora la armadura (Defensa) por defecto**, sea cual sea el elemento (**arcano** — el nombre
oficial del daño genérico "sin apellido", cerrado en el Paso 5, ya usado en el catálogo: Orbe arcano, Tormenta arcana, Ráfaga arcana,
Armadura arcana —, relámpago, fuego, hielo, ácido, sagrado, oscuro, psíquico, viento, tierra…). No hace falta una lista cerrada de
tipos: **lo que decide no es el elemento, es cómo se describe la habilidad.**

**Única excepción — objeto físico arrojado:** si la habilidad se narra como lanzar algo sólido y tangible (una aguja de hielo, una
piedra, un dardo), ese daño **respeta la armadura**, igual que cualquier proyectil físico — no por ser "hielo" o "tierra", sino por ser
un objeto que una placa de metal puede frenar. **Un mismo elemento puede ser las dos cosas** según cómo se lo describa: una "ráfaga de
hielo" (energía) ignora armadura; una "aguja de hielo" (objeto) no.

- **Críticos y Resistencia a crítico (Tipo 4–12):** no aplican al daño de casteo — son del sistema de armas (Tipo del dado). El casteo
  va a tener su propia resistencia por tipo más adelante (Paso 3), no antes.
- **Daño de trampas:** depende de cada trampa, con la misma regla — por defecto ignora armadura, salvo que la trampa sea un mecanismo
  físico (una lanza, un peso que cae, una red con puntas), que sí la respeta.
- **Daño físico** (armas): sigue restando la Defensa como siempre — esta regla es solo para el daño de casteo.
- **Armadura mágica** (algo que reduce el daño que la armadura común no reduce): sigue **rara y escasa**, a definir en el Paso 3 —
  sobre esos tipos se podrá diseñar **resistencia por tipo de daño**, tanto en habilidades como en equipo.

### 1.2 Qué tira cada lado (según la habilidad)
| Caso | Tira el casteador | Tira el defensor |
|---|---|---|
| **Proyectil** (aguja de hielo, bola de fuego lanzada…) | **PdG.Esp** (como su probabilidad de golpe) | **Evasión** |
| **Efecto abstracto sobre el cuerpo** (una maldición, un efecto que no es un proyectil) | **PdG.Esp** | **Res.Esp** (sale de Constitución) |
| **Control mental** (cualquier skill ligada a la mente) | **PdG.Esp** por defecto (salvo que la habilidad puntual diga otra cosa) | **Res.Mt** (sale de Especial) |

- **Regla de oro:** *qué tira cada lado tiene que estar escrito en la descripción de cada habilidad de casteo*, porque hay muchos casos particulares.
- El PdG físico contra Evasión de un ataque con arma no cambia.

**Formato y casos particulares (Paso 2 cerrado, 2026-09-27):**
- **Formato de la línea:** no es un campo de texto nuevo — cuando la habilidad ya usa el sistema de duelo (`duelo: {tira, contra}`, como
  Taunt), esa estructura **ya es** la respuesta, no hace falta duplicarla en texto. Para las que siguen sin auditar, alcanza con que la
  primera frase del `detalle` lo diga en criollo, mismo estilo que ya tiene Taunt: *"Tirás PdG.Esp contra el Res.Esp del objetivo."*
  Al auditar cada una, ese texto se reemplaza por (o se acompaña de) el campo real.
- **Habilidades mixtas** (daño + debuff): **una sola tirada**, la de ataque/contraste principal; si conecta, el debuff se aplica solo,
  sin tirada aparte — salvo que la propia habilidad diga explícitamente lo contrario. Así ya funcionan las maldiciones del Debuffer: una
  tirada, **PdG.Esp vs Res.Esp**.
- **Sobre uno mismo o un aliado:** **no hay tirada** (ni contra el objetivo ni contra nada) — pero **sí se abre el cuadro de duelo**
  (sin oposición: `duelo: {contra: []}` o `sinOposicion`), visible a **toda la mesa**, directo en el paso de efectos, con su botón
  **«Aplicar»** para el estado (o la cura) — así todos tienen tiempo de leer qué pasó antes de que se aplique, no una línea suelta en
  el log (pedido del dueño, 2026-09-27; ver [`duelo-de-habilidades.md`](duelo-de-habilidades.md) §7, ya construido en `comun/duelo.js` +
  `comun/asistente-duelo-hab.js`, sin probar en mesa todavía). Única excepción a que no haya tirada: si la propia habilidad define una
  variable al azar (el ×2 de X de Rayo Mágico), que no es "tirar contra alguien".

### 1.3 Efectos en área: cómo se esquivan (Paso 4 cerrado, 2026-09-27)
**Primero, el contraste de siempre:** el que actúa tira **PdG.Esp** (si es un hechizo) o **PdG** (si es algo físico arrojado, una
molotova) **contra la Evasión** de cada defensor en el área — el mismo mecanismo que un proyectil normal (§1.2). **Recién si el
defensor gana esa Evasión**, gana además **el derecho a un dodge roll**: moverse hasta **2 casilleros** para intentar salir del área.
Si pierde la Evasión, no llega a esa opción.

- **Costo del dodge roll:** **1 No2 por casillero** (hasta 2) — la regla de movimiento de siempre, nada especial.
- **Es una reacción fuera de turno:** se resuelve en el momento del casteo, sea o no el turno del defensor. Sin límite explícito de
  veces por ronda — lo frena el No2 disponible.
- **Inmovilizado, Rengo, Stun:**
  - **Stun:** ni siquiera llega a tirar Evasión (ya falla directo, regla existente) → sin dodge roll.
  - **Inmovilizado:** puede ganar la Evasión (es reflejos, no movimiento), pero **no puede usar el dodge roll** porque no se puede
    mover — se queda en el área.
  - **Rengo:** puede moverse, pero el dodge roll le cuesta el **doble** de No2 por casillero, como el movimiento normal con Rengo.
  - Sin No2 suficientes: se mueve lo que pueda pagar.
- **No hay término medio:** si salió completamente del área, no recibe nada; si sigue adentro por cualquier motivo (perdió la
  Evasión, no tenía No2, Inmovilizado, no alcanzó a salir del todo), recibe el **efecto completo**, sin mitad.
- **Las trampas no se esquivan así:** ni Evasión ni dodge roll — el elemento sorpresa es la gracia de una trampa.

### 1.4 Resistencia al daño de casteo: Armadura mágica (Paso 3 cerrado, 2026-09-27)
**Un solo stat nuevo, general — no uno por elemento** (consistente con 1.1: no hay lista de tipos, así que tampoco hace falta una
resistencia por tipo). Se llama **Armadura mágica**: un **número fijo** que se resta al daño de casteo que ignora la armadura normal,
igual que la Defensa se resta al daño físico. **No deriva de ningún atributo**: arranca en 0 para todos, la dan **ítems de tier alto**
(Raro en adelante, marcados a mano en el catálogo) — no equipo común, no una base automática. Si alguna habilidad de clase llegara a
darla, se decide caso por caso al auditarla, no como regla general.

**Son tres cosas distintas** (no hay que unificarlas):
- **Armadura mágica** (esto, nuevo): un stat permanente mientras dure el ítem/efecto que la da; resta un número fijo al daño de casteo.
- **Escudo especial** (el estado, ex "Escudo mágico"): un buffer temporal de HP que absorbe cualquier daño, incluso true damage — no
  cambia, sigue como está.
- **"Armadura arcana"** (la skill del Mago, **renombrada 2026-09-27** — antes "Armadura Mágica", para no confundirla con el stat de
  arriba): su propio efecto puntual, reduce 50 % (máx. 10) y refleja el daño absorbido al terminar — no cambia, es una habilidad con
  su propia mecánica, no el stat general.

**Código (Paso 7, 2026-09-27):** stat `armadmg`, se computa igual que Defensa (ficha: `EXTRA`/`compute()`, `resumen.armadmg`;
creeps de gm-tools: `sc.armadmg`/`creepArmadmgEfectiva`), y se puede dar como bono de ítem desde `comun/asistente-item.js` (paso
Bonos). En el mapa, `danioPj`/`danioCreep` reciben un parámetro nuevo `restaIgnorando` que reemplaza el `0` fijo — pero **solo**
para el daño de casteo real de `dueloAplicarDano` (`hab.dano.ignoraDef`, Paso 6). Un crítico real, una trampa que ignora la
Defensa, el fuego de terreno y el Rayo en cadena siguen ignorando la Defensa entera sin restar nada: la Armadura mágica es la
resistencia al daño de casteo del Paso 1, no un "ignora-ignorar" general para cualquier mecánica que hoy salta la Defensa.

## 2. Mapa de revisión (qué puede necesitar cambios)

Números tomados del repo el 2026-09-21. **"Revisar" no es "cambiar"**: cada punto se decide por separado.

### A. Herramientas (código)
| # | Qué | Dónde | Hoy | Necesita |
|---|---|---|---|---|
| A1 | **Tipo de daño de una habilidad** | habilidades de ficha, invocaciones y creeps; armas y "efectos al golpear" | no existe el campo | un campo `tipoDanio` (y de ahí "ignora armadura") |
| A2 | **Cálculo del daño recibido** | `resolverGolpe`/`danioPj`/`danioCreep` (mapa), `danioCreep` (gm-tools), ficha | **siempre resta la Defensa** | recibir el tipo y no restar Defensa si ignora armadura |
| A3 | **Daño de trampas** (`trampaDano`) | mapa, asistente de trampas | resta Defensa siempre ("menos la Defensa de cada uno") | tipo de daño por trampa (una runa explosiva no es igual que un foso) |
| A4 | **Qué tira cada lado** | ficha/gm-tools (tirada de la habilidad, `tiradaStat`), Botonera, Acciones, la Mesa | el atacante tira PdG o el stat elegido; el defensor no tiene tirada automática | campo/aviso "tira PdG.Esp vs Evasión / Res.Esp / Res.Mt", visible en la descripción y en la Mesa |
| A5 | **Esquivar un área (roll de 2 casilleros)** | mapa (movimiento, No2) | no existe | reacción del defensor: cobrar No2 y mover hasta 2 casilleros; ver si sale del área |
| A6 | **Resistencia por tipo de daño** | stats de ficha y creeps, mods de ítems, lupa | solo Res.Esp, Res.Mt, Res.CC y las resistencias a crítico (Tipo 4–12) | ✅ Paso 3: un stat nuevo, **Armadura mágica** (número fijo, no por elemento) |
| A7 | **Armadura mágica** | stats, ítems, estado | existe el estado **Escudo especial** (barra de HP que absorbe todo, incluso true damage) y la skill "Armadura arcana" (reduce 50%) | ✅ Paso 3: son **tres cosas distintas** — ver §1.4 |
| A8 | **Efectos al golpear con elemento** | `efectosGolpe` de armas (Prende fuego, Explosión…), armas naturales | son un recordatorio | ver si el daño extra sigue la regla de su tipo |
| A9 | **Nombres de los stats** | interfaz de ficha/creeps/catálogo | PdG.Esp / Res.Esp / Rango de casteo | ✅ hecho 2026-09-27: "Mg" se renombró a "Esp" (solo la etiqueta; los ids `pdgmg`/`resmg` no cambiaron) |

### B. Contenido ya creado
| # | Qué | Cantidad | Qué mirar |
|---|---|---|---|
| B1 | **Skills de clase** (`comun/skills-clase.js`) | 62 skills, ~13 tocan casteo (Chispazo, Rayo Mágico, Orbe arcano, Tormenta arcana, Ráfaga arcana, Toque mágico, Carga Elemental, Armadura arcana, Telekinesis, Control Mental, Endurecimiento, Smite, Drenar vida) | tipo de daño, qué tira cada lado, y que se ajuste a estas reglas (el borrador manda menos que estas reglas) |
| B2 | **Habilidades de creeps** (`comun/skills-creep-base.js`) | 321; las de daño de casteo (Chispa, Bola de fuego, Rayo, Misil arcano, Llamarada, Lanza de hielo, Explosión psíquica, Rayo de vacío…), los debuffs y las 57 con estado automático | agregar tipo de daño y "qué tira cada lado" a cada descripción; separar proyectil / efecto abstracto / mental |
| B3 | **Creeps base** (`comun/creeps-base.js`) | 134; roles mágico, apoyo y debuffer | las habilidades de sus dos slots |
| B4 | **Armas naturales** (`comun/armas-naturales-base.js`) | 66; el filtro "Tipo de daño" ya tiene elemental, mágico, ácido | pasar esos tres a los tipos de estas reglas |
| B5 | **Catálogo de ítems** (`datos/catalogo.json`) | 665; 14 con Res.Esp, 5 con PdG.Esp, 13 con Rango de casteo, 8 bastones/báculos, 22 consumibles de casteo, ~45 que mencionan fuego/rayo/arcano en el detalle | qué ítems son "armadura mágica"; resistencias por tipo; consumibles |
| B6 | **Trampas base y asistente** (`comun/trampas-base.js`) | 24 trampas | tipo de daño de cada una (runas, escarcha, veneno, ácido…) |
| B7 | **Pasivas** (`comun/pasivas.js`) | las que dan Res.Esp | coherencia con la resistencia por tipo |
| B8 | **Estados** (`ESTADOS_PRESET`) | Escudo mágico, Sangre pura, Blindado… | cuáles son resistencias por tipo |
| B9 | **Manual** (`manual-usuario/notas` 03, 07, 08, 09, 11, 12) | Especial, Resistencias, estados, habilidades, glosario | una nota nueva de "casteo" y ajustar el glosario |

## 3. Orden propuesto (el proceso completo, con decisiones y estados, está en [`proceso-casteo.md`](proceso-casteo.md))
1. **Definir y documentar** (este archivo + manual): la lista de tipos de daño y cuáles ignoran armadura; el nombre del daño genérico; las preguntas de P97.
2. **Tipo de daño en las habilidades** (A1, A2, A3): el campo `tipoDanio` y el cálculo del daño recibido; primero solo el de armadura sí/no.
3. **"Qué tira cada lado" en las descripciones** (A4): un formato fijo de una línea; empezar por las habilidades de creeps y las skills de clase.
4. **Resistencia por tipo** (A6, A7, B5, B8): recién cuando estén los tipos.
5. **Esquivar áreas** (A5): la reacción del defensor.
6. **Auditoría de contenido** (B1–B8): skill por skill, tanda por tanda (clase → creeps → armas naturales → trampas → catálogo), sin cambios masivos.
