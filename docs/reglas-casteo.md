# Reglas de casteo (SP) — reglas definidas y mapa de revisión

> Empezado el 2026-09-21. **Esto no es "la magia"**: es todo lo que se **castea con SP** y no es un ataque con un arma.
> Lo que cuenta como casteo es **algo subjetivo y narrativo** — lo decide la mesa; estas reglas son la plataforma, no un corsé
> (ver "La esencia del Rol Pintoísta" en el `CLAUDE.md` de la raíz). Los stats siguen llamándose PdG.Mg y Res.Mg (ids `pdgmg`, `resmg`)
> hasta que se decida otro nombre (ver P97).
>
> Estado: **reglas base definidas; nada implementado todavía**. Se aplica por partes (ver "Orden propuesto"). Las preguntas
> abiertas están en [`preguntas-abiertas.md`](preguntas-abiertas.md), P97.

## 1. Reglas definidas (2026-09-21)

### 1.1 Daño de casteo: depende de la habilidad
No todo el daño de casteo es igual. Cada habilidad dice de qué tipo es, y el tipo decide **si la armadura (Defensa) lo reduce**:

| Tipo | ¿Ignora armadura? | Ejemplos dados |
|---|---|---|
| **Daño mágico genérico** (nombre por definir: "plasma", "arcano"…) | **Sí** | el daño de casteo "sin nombre" |
| **Relámpago** | **Sí** | rayos |
| **Fuego** | **Sí** ("no se resiste con armadura") | |
| **Proyectil de casteo físico** | **No, respeta la armadura** | una aguja de hielo: es un objeto lanzado |
| **Daño físico** (armas) | No | ataques con arma |

- La lista de tipos (y cuáles ignoran armadura) **no está cerrada**: falta decidir cuáles más hay (hielo, ácido, sagrado, oscuro…) — P97.
- Sobre esos tipos se podrá diseñar **resistencia por tipo de daño**, tanto en habilidades como en equipo (P97).
- **Armadura mágica** (algo que reduce el daño que la armadura común no reduce): debe ser **rara y escasa**, porque la gracia de este
  daño es que ignora armadura.

### 1.2 Qué tira cada lado (según la habilidad)
| Caso | Tira el casteador | Tira el defensor |
|---|---|---|
| **Proyectil** (aguja de hielo, bola de fuego lanzada…) | **PdG.Mg** (como su probabilidad de golpe) | **Evasión** |
| **Efecto abstracto sobre el cuerpo** (una maldición, un efecto que no es un proyectil) | **PdG.Mg** | **Res.Mg** (sale de Constitución) |
| **Control mental** (cualquier skill ligada a la mente) | lo que diga la habilidad | **Res.Mt** (sale de Especial) |

- **Regla de oro:** *qué tira cada lado tiene que estar escrito en la descripción de cada habilidad de casteo*, porque hay muchos casos particulares.
- El PdG físico contra Evasión de un ataque con arma no cambia.

### 1.3 Efectos en área: cómo se esquivan
- El defensor puede **tirar Evasión para hacer un roll (girar/rodar)**, con un **máximo de 2 casilleros** de desplazamiento.
- **Necesita No2 disponibles** para hacerlo. Si los tiene, se desplaza; **si se desplaza lo suficiente como para salir del área, esquiva**.
- (Detalles a definir: costo en No2, cuánto significa "tirar Evasión" si no hay número que superar, si es una reacción fuera de turno… — P97.)

## 2. Mapa de revisión (qué puede necesitar cambios)

Números tomados del repo el 2026-09-21. **"Revisar" no es "cambiar"**: cada punto se decide por separado.

### A. Herramientas (código)
| # | Qué | Dónde | Hoy | Necesita |
|---|---|---|---|---|
| A1 | **Tipo de daño de una habilidad** | habilidades de ficha, invocaciones y creeps; armas y "efectos al golpear" | no existe el campo | un campo `tipoDanio` (y de ahí "ignora armadura") |
| A2 | **Cálculo del daño recibido** | `resolverGolpe`/`danioPj`/`danioCreep` (mapa), `danioCreep` (gm-tools), ficha | **siempre resta la Defensa** | recibir el tipo y no restar Defensa si ignora armadura |
| A3 | **Daño de trampas** (`trampaDano`) | mapa, asistente de trampas | resta Defensa siempre ("menos la Defensa de cada uno") | tipo de daño por trampa (una runa explosiva no es igual que un foso) |
| A4 | **Qué tira cada lado** | ficha/gm-tools (tirada de la habilidad, `tiradaStat`), Botonera, Acciones, la Mesa | el atacante tira PdG o el stat elegido; el defensor no tiene tirada automática | campo/aviso "tira PdG.Mg vs Evasión / Res.Mg / Res.Mt", visible en la descripción y en la Mesa |
| A5 | **Esquivar un área (roll de 2 casilleros)** | mapa (movimiento, No2) | no existe | reacción del defensor: cobrar No2 y mover hasta 2 casilleros; ver si sale del área |
| A6 | **Resistencia por tipo de daño** | stats de ficha y creeps, mods de ítems, lupa | solo Res.Mg, Res.Mt, Res.CC y las resistencias a crítico (Tipo 4–12) | stats o un mecanismo por tipo (P97) |
| A7 | **Armadura mágica** | stats, ítems, estado | existe el estado **Escudo mágico** (barra de HP que absorbe todo, incluso true damage) y la skill "Armadura Mágica" (reduce 50%) | definir si son lo mismo o distintos; una regla clara |
| A8 | **Efectos al golpear con elemento** | `efectosGolpe` de armas (Prende fuego, Explosión…), armas naturales | son un recordatorio | ver si el daño extra sigue la regla de su tipo |
| A9 | **Nombres de los stats** | interfaz de ficha/creeps/catálogo | PdG.Mg / Res.Mg / Rango de casteo | decidir si "Mg" se renombra (P97) |

### B. Contenido ya creado
| # | Qué | Cantidad | Qué mirar |
|---|---|---|---|
| B1 | **Skills de clase** (`comun/skills-clase.js`) | 62 skills, ~13 tocan casteo (Chispazo, Rayo Mágico, Orbe arcano, Tormenta arcana, Ráfaga arcana, Toque mágico, Carga Elemental, Armadura Mágica, Telekinesis, Control Mental, Endurecimiento, Smite, Drenar vida) | tipo de daño, qué tira cada lado, y que se ajuste a estas reglas (el borrador manda menos que estas reglas) |
| B2 | **Habilidades de creeps** (`comun/skills-creep-base.js`) | 321; las de daño de casteo (Chispa, Bola de fuego, Rayo, Misil arcano, Llamarada, Lanza de hielo, Explosión psíquica, Rayo de vacío…), los debuffs y las 57 con estado automático | agregar tipo de daño y "qué tira cada lado" a cada descripción; separar proyectil / efecto abstracto / mental |
| B3 | **Creeps base** (`comun/creeps-base.js`) | 134; roles mágico, apoyo y debuffer | las habilidades de sus dos slots |
| B4 | **Armas naturales** (`comun/armas-naturales-base.js`) | 66; el filtro "Tipo de daño" ya tiene elemental, mágico, ácido | pasar esos tres a los tipos de estas reglas |
| B5 | **Catálogo de ítems** (`datos/catalogo.json`) | 665; 14 con Res.Mg, 5 con PdG.Mg, 13 con Rango de casteo, 8 bastones/báculos, 22 consumibles de casteo, ~45 que mencionan fuego/rayo/arcano en el detalle | qué ítems son "armadura mágica"; resistencias por tipo; consumibles |
| B6 | **Trampas base y asistente** (`comun/trampas-base.js`) | 24 trampas | tipo de daño de cada una (runas, escarcha, veneno, ácido…) |
| B7 | **Pasivas** (`comun/pasivas.js`) | las que dan Res.Mg | coherencia con la resistencia por tipo |
| B8 | **Estados** (`ESTADOS_PRESET`) | Escudo mágico, Sangre pura, Blindado… | cuáles son resistencias por tipo |
| B9 | **Manual** (`manual-usuario/notas` 03, 07, 08, 09, 11, 12) | Especial, Resistencias, estados, habilidades, glosario | una nota nueva de "casteo" y ajustar el glosario |

## 3. Orden propuesto
1. **Definir y documentar** (este archivo + manual): la lista de tipos de daño y cuáles ignoran armadura; el nombre del daño genérico; las preguntas de P97.
2. **Tipo de daño en las habilidades** (A1, A2, A3): el campo `tipoDanio` y el cálculo del daño recibido; primero solo el de armadura sí/no.
3. **"Qué tira cada lado" en las descripciones** (A4): un formato fijo de una línea; empezar por las habilidades de creeps y las skills de clase.
4. **Resistencia por tipo** (A6, A7, B5, B8): recién cuando estén los tipos.
5. **Esquivar áreas** (A5): la reacción del defensor.
6. **Auditoría de contenido** (B1–B8): skill por skill, tanda por tanda (clase → creeps → armas naturales → trampas → catálogo), sin cambios masivos.
