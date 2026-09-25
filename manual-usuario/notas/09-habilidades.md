+++
capitulo: Habilidades y clases
icono: ✨
resumen: Skills activas, pasivas y sociales; las siete clases y la biblioteca compartida.
+++

+++
titulo: Habilidades
alias: [Habilidad, Skills, Skill, Habilidades activas, Habilidad automatizada, Flash, Espameable, Cooldown]
tags: [habilidades, reglas-base]
estado: borrador
+++
Una **habilidad** es algo especial que tu personaje sabe hacer: un golpe, un hechizo, una maldición, una cura. Se compran con **[[Puntos de Job]]** y se **ejecutan** desde la ficha o la [[La Botonera|Botonera]].

## De dónde salen
- **De clase:** copiadas del pool de las [[Clases|siete clases]]. Cuestan **1 punto de Job**, sean de tu clase o de otra.
- **Custom:** inventadas por vos o el GM. Cuestan **2 puntos de Job**.

## Qué tiene una habilidad
- **Costo en [[SP]]** (a veces un *X* variable) y **en [[Nitros (No2)|Nitros]]** (por defecto 1; una habilidad "de ataque" cuesta lo que un ataque, y cuenta como tal).
- A veces **costo en HP** y un **cooldown** (turnos que hay que esperar).
- Una **tirada** (un stat y/o una fórmula) y un **estado** que se aplica sobre uno mismo.
- **Cura HP** sobre uno mismo, si es una habilidad de curación.

## Automatizada o solo anunciada
Al crearla, el asistente te pregunta **¿la automatizamos?**

| | Qué hace al ejecutarla |
|---|---|
| **Sí** | Descuenta SP, Nitros y HP solos; tira lo que tenga que tirar; aplica el estado. |
| **No** | Botón **Anunciar**: publica la descripción en la [[La Mesa\|Mesa]], sin costo, sin tirada y sin estado. La resuelve el grupo. |

> [!tip] Lo que no automatiza, se dice
> Muchas habilidades tienen efectos sobre *otros* (empujar, marcar, quitar Nitros): eso queda escrito en la descripción y se resuelve en la mesa ([[La esencia del Rol Pintoísta]]).

## Palabras que vas a ver en las descripciones
| Palabra | Significa |
|---|---|
| **Flash** | No cuesta Nitros y se puede usar **durante el turno de otro**. Se declara **antes de que tire los dados**, nunca después de ver el resultado. |
| **Espameable** | Se puede repetir en el turno; el límite lo ponen los Nitros. |
| **Cooldown** | Turnos de espera antes de volver a usarla. |
| **Amplificar** | Dados de daño de más, del [[Daño y Tipo de arma\|Tipo]] del arma. |
| **X** | Costo variable: elegís cuánto invertir al ejecutarla. |
| **Critical Matters** | Si el ataque es [[Golpe crítico\|crítico]], el efecto cambia. |
| **⚖ A definir en mesa** | La duda no se cerró: se decide entre todos cuando aparezca en juego. |

## Ejecutarla
En la Botonera, cada habilidad tiene **Ejecutar** y una **🔍** que te dice cuánto cuesta y cuánto te queda. Si no te alcanzan los Nitros, el botón queda apagado (la 🔍 sigue funcionando).

Ver también: [[Pasivas]], [[Biblioteca de la comunidad]].

+++
titulo: Pasivas
alias: [Pasiva, Habilidades pasivas, Catálogo de pasivas, Percepción aumentada]
tags: [habilidades]
estado: borrador
+++
Una **pasiva** es una habilidad que **funciona sola, siempre**: no se ejecuta ni cuesta Nitros. Se compran con [[Puntos de Job]] (por defecto, 1 punto).

## Cómo se agregan
En la ficha: **"+ Pasiva → catálogo"**. Elegís del catálogo y se copia a tu personaje; también podés inventar una propia.

## Qué hacen
Bonos a un stat (**+5 HP máx**, **+3 SP**), **regeneración** (+3 HP por turno), o efectos especiales. Los que se pueden automatizar funcionan al cargarlos; lo demás queda como recordatorio en el texto.

## Escalón
Cada compra da **lo que daría 1 punto del atributo del que sale el stat**: HP máx 5, SP 3, el resto 1. (Excepción: la resistencia a CC da +2.)

## Se acumulan, con tope
Podés **comprar la misma pasiva varias veces** y los bonos se suman. El **tope de compras** es **la mitad de tu nivel** (redondeado hacia abajo, mínimo 1).

## Algunas del catálogo base
| Pasiva | Efecto |
|---|---|
| **Robustez** | +5 HP máx |
| **Reserva de poder** | +3 SP |
| **Recuperación mental** | +1 SP por turno |
| **Regeneración** | +3 HP por turno |
| **Voluntad de hierro** | Res. mental/CC |
| **Percepción aumentada** | Te avisa de trampas cercanas ([[Trampas]]) |
| **Ojo avizor**, **Vista de halcón** | Más visión |
| **Golpe fuerte**, **Puntería**, **Ojo crítico** | Más Daño, PdG, Crítico |
| **Pies ligeros**, **Reflejos de gato**, **Impulso** | Movimiento, Evasión, Nitros |
| **Espalda de mula**, **Bolsillos extra** | Carga y capacidad |

> [!question] Todavía por definir
> - Las **pasivas situacionales** (que solo valen en cierto momento) se irán viendo más adelante.
> - Los +1 de No2, Rango y Crítico están marcados ⚠ en el catálogo: son los que más hay que revisar.

+++
titulo: Inteligencia y habilidades sociales
alias: [Inteligencia, Habilidades sociales, Sociales, Habilidad social, Presupuesto social]
tags: [habilidades, personaje]
estado: borrador
+++
Además de los cinco [[Atributos]] hay un número aparte, la **Inteligencia**, para las **habilidades sociales** (persuadir, mentir, intimidar, regatear…).

## El presupuesto
No se reparte como los atributos: **se calcula sola**. **6 al crear el personaje, +3 por nivel.** Funciona como el presupuesto de Job: el total no baja, y lo que invertís en habilidades sociales se resta del disponible. El contador muestra cuánto te queda; al pasar el mouse ves en qué se fue cada punto.

## Cómo funciona una habilidad social
Cada habilidad social tiene un **nivel** (puntos de Inteligencia invertidos + subidas gratis).

- **Dado = nivel × 2 caras.** Nivel 2 → d4; nivel 3 → d6; nivel 0 → sin dado.
- **La tirada** es siempre `1d(nivel × 2) + tu Inteligencia sin invertir`.

> [!example] Persuadir nivel 3
> Tenés Inteligencia total 9 y 3 puntos invertidos en Persuadir → te quedan 6 sin invertir. Tirás **1d6 + 6**.

## Subir de nivel
El botón **+ Nivel** de cada habilidad social ofrece dos caminos:
1. **Por Inteligencia:** elegís cuántos puntos invertís (se restan del presupuesto).
2. **Por tirada máxima:** si sacás el máximo en la tirada, **subís +1 nivel gratis**.

## En la Botonera
Con nivel, aparecen en la Botonera: **arriba de todo en [[Modo narrativo y modo combate|modo narrativo]]**, y al final en combate.

+++
titulo: Biblioteca de la comunidad
alias: [Biblioteca, Biblioteca global, Propuestas, Auditar propuestas]
tags: [herramientas, gm]
estado: borrador
+++
La **biblioteca** es un catálogo **global y compartido** (no de una sola partida) donde se juntan creaciones del grupo: **creeps, pasivas, habilidades y trampas**.

- **Elegir:** un buscador con **etiquetas** para encontrar lo que necesitás (en la ficha al agregar una pasiva; en GM Tools al agregar un creep; en el mapa al poner una trampa).
- **Proponer:** si creaste algo que merece quedar, **📤 lo proponés** y queda pendiente.
- **Auditar:** el **dueño del proyecto** revisa las propuestas y las aprueba: pasan a ser oficiales.
- Hay una base de entradas **que vive en el código** (por ejemplo, los [[Catálogo de creeps]]), que siempre está disponible.

Ver también: [[Catálogo de ítems]].

+++
titulo: Warrior
alias: [Guerrero]
tags: [clases, habilidades]
estado: borrador
+++
Guerrero cuerpo a cuerpo: golpes potentes, cargas y saltos. Pool de [[Clases|clase]].

## Automatizadas (listas para usar)
| Skill | Costo | Efecto |
|---|---|---|
| **Arte de la guerra** | SP 2 · Flash (a confirmar) | +2 a una sola tirada de PdG, Parry, Bloqueo o Daño. |
| **Amplificar daño** | SP X (máx. 3) · No2: ataque | Ataque con +X dados de daño del Tipo del arma. |
| **Cañón Vasco** | SP 2 + X · No2 1 | Salta X casillas; si cae sobre un enemigo lo empuja 1; onda expansiva a los adyacentes. |
| **Carga** | SP X · No2 X + ataque | Avanza X casilleros en línea recta y ataca con +X de daño fijo y +X a la PdG. |

## En revisión (solo se anuncian)
Estoicismo (+2 Def por cada enemigo adyacente), Remolino (ataque a todos los adyacentes), [[Parry]] (skill), Contraataque y Sacadito.

> [!question] Por definir
> Arte de la guerra: ¿se puede usar en todas las tiradas del turno o una sola vez por turno? Sacadito: qué pasa con los Nitros sobrantes.

+++
titulo: Asalto
alias: [Asesino, Rogue]
tags: [clases, habilidades, sigilo]
estado: pendiente
+++
Ágil y letal: velocidad, [[Sigilo|invisibilidad]], críticos y venenos. Pool de [[Clases|clase]].

**Skills del borrador** (todavía sin automatizar): Dash, Lisiar ([[Lisiado]]), Tajear (sangrado), Invi (invisibilidad, se detecta con Percepción), Envenenar arma, Backstab (+5 desde la espalda, ignora 1 de resistencia a crítico), Degollar, Sprint, Tronco de huida y Robar SP.

> [!question] Sin auditar
> Ninguna está cargada como automatizada. Cada una se revisa una por una (costos nuevos en SP/Nitros) antes de pasar al pool de la ficha.

+++
titulo: Tanque
alias: [Tank]
tags: [clases, habilidades]
estado: borrador
+++
El que aguanta: defensa, cura propia y control de tropa. Pool de [[Clases|clase]].

## Automatizadas
| Skill | Costo | Efecto |
|---|---|---|
| **Blindaje** | SP 1 · Flash (SP ×2: 2 SP en turno ajeno) | Solo sobre uno mismo: estado **Barrera**, absorbe 8 de la próxima fuente de daño ([[Escudo mágico]]). |
| **Recuperación** | SP 1 · No2 2 | Curás **9 HP** fijos sobre vos (sin pasar el máximo). Se puede usar con la vida llena: gasta igual. |
| **Piel resistente** | SP 5 · No2 1 | 2 turnos sobre vos: Defensa +5, Res. Mágica +5 y +1 a cada resistencia a crítico. |
| **Shockwave** | SP 4 · Flash (SP ×2 en turno ajeno) | Onda expansiva: tirás **Fuerza**; cada enemigo adyacente tira **Constitución** y el que pierde queda en [[Pajaritos]] 2 turnos. La tirada de Fuerza es automática; el resto se resuelve a mano. |

## En revisión
Aura de espinas (devuelve 1/4 del daño), Sonic Boom, Daño en área, Takle, Taunt y Miti-Miti (comparte la mitad del daño con un protegido).

## Estados de la clase
- [[Pajaritos]]: PdG y Evasión a la mitad.
- **Sentado**: la Evasión se parte a la mitad (al resultado de la tirada, para abajo), no podés hacer dodge roll y no vence solo: **levantarte cuesta 1 No2** (botón Levantarse de la Botonera). Ver [[Sentado]].

> [!question] Sin confirmar
> En *Piel resistente*, el +1 a las resistencias a crítico y la duración de 2 turnos completos son una propuesta, sin confirmar. En *Aura de espinas* faltan definir si el 1/4 se calcula sobre el daño que llega al HP o antes de la Defensa, si es solo melee o cualquier ataque, y cómo se redondea.

+++
titulo: Mago
alias: [Hechicero, Wizard]
tags: [clases, habilidades]
estado: pendiente
+++
Hechizos de daño y control, movidos por [[Especial]]. Pool de [[Clases|clase]]. Casi todos son **Hechizo (PG: Esp · Daño: Esp)**.

**Skills del borrador:** Chispazo (proyectil T4 P1 que ignora armadura), Rayo Mágico, Orbe arcano (área de flor de 1), Tormenta arcana (1d20 proyectiles en flor de 2), Ráfaga arcana (cono de 3), Toque mágico, Carga Elemental (fuego +50%, frío −1 No2 cada 5 de daño, eléctrico se propaga), Armadura Mágica (−50% daño hasta 10), Telekinesis y Control Mental.

> [!question] Sin auditar
> Todavía no hay skills automatizadas de Mago. Falta revisar costos (No2 y SP) una por una.

+++
titulo: Shooter
alias: [Tirador, Arquero]
tags: [clases, habilidades]
estado: pendiente
+++
Tirador: puntería, marcar objetivos y ráfagas. Pool de [[Clases|clase]]; usa mucho [[Ataques a distancia]].

**Skills del borrador:** Apuntar, Acelerado, Enfocado, Parry a distancia (Flash), Headshot (+5 daño, falla si no es crítico), Proyectil perforante, Marcar, Repetición, Disparo múltiple y Tiro con comba.

> [!question] Sin auditar
> Ninguna automatizada todavía.

+++
titulo: Support
alias: [Apoyo, Healer, Sanador]
tags: [clases, habilidades]
estado: pendiente
+++
Apoyo: curas, buffs y ayuda al equipo. Pool de [[Clases|clase]].

**Skills del borrador:** Empower (+3 a una tirada), Blessing (+1 a todas 2 turnos), Heal (4 + 1d6 HP), Shield (absorbe 14), Acelerador (casilla que da +2 No2), Endurecimiento (Def 3, Res.Mg 3), Re-roll (repetir tiradas aliadas), Smite, Transferir SP y Adrenalina.

> [!question] Sin auditar
> Ninguna automatizada todavía.

+++
titulo: Debuffer
alias: [Maldiciones, Maldición, Hechicero oscuro]
tags: [clases, habilidades, estado]
estado: pendiente
+++
Maldiciones, venenos y control. Pool de [[Clases|clase]]. Sus maldiciones enfrentan **Especial contra Res. Mental** ([[Resistencias]]).

**Skills del borrador:** Enyetar (repetir y quedarse con el más bajo), Confusión, Maldición debilitante (−1 a todas las tiradas), Maldición extenuante, Maldición tormentosa, Drenar vida, Balas de sangre, Transfusión sanguínea, [[Veneno]] y Nube tóxica (área que envenena).

> [!question] Sin auditar
> Ninguna automatizada todavía. Ojo: la página del Debuffer del PDF nuevo repetía la del Support; se usan las tarjetas de la versión anterior.
