# Preguntas abiertas de diseño

Lista única de huecos de diseño y reglas sin decidir de Rol Pintoísta.
Sirve para no depender de lo que se habló en cada conversación: cuando
algo queda sin decidir, se anota acá; cuando se decide, se pasa a donde
corresponda (plan, manual, código) y se saca de acá (o se marca ✅ con
la respuesta y la fecha, y se limpia de vez en cuando).

**Cómo se usa (regla para todas las conversaciones):**
- Toda pregunta de diseño que quede abierta se agrega acá, en su tema,
  con un número nuevo (no se reutilizan), el contexto mínimo para
  entenderla sin la conversación, y de dónde salió (fecha y tema).
- Si la pregunta tiene una recomendación, se anota como "Propuesta".
- Al responderla: se aplica, se documenta donde corresponda y se marca
  ✅ acá con la respuesta y la fecha.
- Lo marcado `PLACEHOLDER` en el código también cuenta como pregunta
  abierta y tiene que estar listado acá.

Estados: 🔲 abierta · ✅ respondida (pendiente de limpiar)

---

## Sigilo

Diseño en curso: ver "Sigilo (en diseño)" en [`plan-sistema-nuevo.md`](plan-sistema-nuevo.md).

- ✅ **P1. Costo de entrar en sigilo.** Respondido 2026-09-19: se deja en 1 No2 (`IT2.nitrosSigilo`); el usuario lo va a revisar después con sus colegas.
- ✅ **P2. Moverse en sigilo.** Respondido 2026-09-19: cuesta lo mismo que moverse normal (*a debatir*).
- 🔲 **P3. Tirada de detección: qué se tira.** En principio **Destreza (el que se esconde) contra Especial (el que vigila)**, anotado el 2026-09-19 y "a debatir". No hace falta cerrarlo para programar el mecanismo: la tirada no es automática, la resuelve la mesa a mano.
- ✅ **P4. Tirada de detección: quién tira.** Respondido 2026-09-19: tiran los dos, cada uno con su stat (en principio Destreza el que se esconde y Especial el que vigila, P3).
- ✅ **P5. Tirada de detección: cuántas.** Confirmada 2026-09-19 (escenario 1, se mueve el oculto): **una por cada paso que da dentro de la zona de alerta**, sin interrumpir el movimiento (el oculto sabe dónde están las zonas y cada paso es consciente); el mapa solo anuncia en rojo en la Mesa que corresponde la tirada. Escenario 2 (se mueve quien ve al oculto): pendiente (cada casillero de la ruta que cae en la alerta cuenta como una tirada). Como la tirada es manual, el mapa solo cuenta y avisa cuántas hay que hacer.
- ✅ **P6. Otras formas de detectar.** Respondido 2026-09-19: sí, se puede buscar a propósito (sin automatizar: la resuelve la mesa a mano, como el resto de la detección).
- ✅ **P7. Qué es "acción hostil".** Respondido 2026-09-19: cualquier acción con efecto directo sobre un enemigo: un ataque o una skill individual (invocar una nube tóxica en área, no; a debatir). **Es una regla, pero no se puede automatizar su detección: queda entre los jugadores.** Quien la hace sale del sigilo a mano con el botón de la Botonera (o el GM saca el estado del creep).
- ✅ **P8. Última posición conocida.** Respondido 2026-09-19: sí, quien se esconde a la vista de otro deja una marca "?" en su última posición vista **por dos turnos** (`SIGILO_MARCA_TURNOS`, los que pasa el Mantenimiento). Construido; vive en cada navegador.
- ✅ **P9. Dónde aparece al ser detectado.** Respondido 2026-09-19: donde lo detectaron.
- ✅ **P10. La ficha del que está en sigilo.** Respondido 2026-09-19: el GM **no** la ve. Tiene un botón con un ojo 👁 que revela todos los ítems y personajes ocultos (pronto habrá trampas); al apretarlo, los jugadores reciben un aviso muy evidente: mensaje en la Mesa con fondo rojo y un efecto tipo filtro rojo de la muerte con un ojo grande en el centro que aparece de golpe y se apaga con fade en 1–2 s (idea: PNG de ojo de Sauron con fondo transparente, a conseguir).
- ✅ **P11. Tiradas en la Mesa del que está en sigilo.** Respondido 2026-09-19: sus tiradas se ven en la Mesa.
- ✅ **P12. Sigilo como estado alterado.** Respondido 2026-09-19: en principio sí.

## Orientación y campo de visión (mapa)

- ✅ **P13. Grilla.** Resuelto (2026-09-17): la grilla se giró a "de lado arriba" y los tokens miran a uno de los 6 lados.
- ✅ **P14. Girar cuesta No2.** **Revertido 2026-09-24: girar ya NO cuesta No2** (`COSTO_GIRO_NO2 = 0`). Lo que sigue es el historial de la regla anterior. Respondido 2026-09-19: sí, **1 No2 por giro de 60° y solo en combate** (en narrativo es gratis), abierto a debate. Construido en el mapa (COSTO_GIRO_NO2). Caminar deja al token mirando hacia donde fue, gratis (P15). Lo de "cada movimiento que desbloquee niebla cuesta 1 No2" se dejó de lado ("lo pasamos por alto"). **Actualización 2026-09-19:** en combate, después de moverse el token elige hacia dónde queda mirando gratis (su primer giro, o quedarse como llegó); esa ventana se cierra con cualquier acción posterior, propia o ajena; desde ahí cada giro cuesta 1 No2.
- ✅ **P15. Mirada al moverse.** Respondido 2026-09-19: el token queda mirando hacia donde caminó, salvo que gaste más No2 en girarse.
- ✅ **P16. Diagonales de atrás.** Respondido 2026-09-19: los dos hexágonos rojos del costado (las diagonales traseras del token) son parte de la zona de alerta; solo queda libre el de justo atrás.
- ✅ **P17. Obstáculos.** Respondido 2026-09-19 (junto con la P52): se prueba que los elementos sólidos tapen la vista.
- ✅ **P18. Automático o manual.** Respondido 2026-09-19: el mapa rompe el sigilo solo únicamente si el personaje entra en el campo de detección automática (el cono) del enemigo. El jugador puede arrastrar el token para evaluar rutas, pero la ruta no se efectiviza hasta que lo suelta en una ubicación. La tirada de detección es manual.
- ✅ **P19. Cuándo se muestra el cono.** Respondido 2026-09-19: cuando un personaje está en sigilo, ve automáticamente el cono de detección y la zona de alerta dibujados semitransparentes.
- ✅ **P20. Quién tiene orientación.** Respondido 2026-09-19: los creeps y las invocaciones tienen orientación, zona de detección y alerta, y punto ciego atrás, igual que los personajes.
- ✅ **P21. Tamaño del cono.** Respondido 2026-09-19: hoy son 16 hexágonos (rombo de 4 × 4), pero el cono y la superficie de visión se pueden modificar por efectos de distintas fuentes (ítems, skills, estados…).

## Combate y reglas (Iteración 2)

Valores que el código usa pero están marcados `PLACEHOLDER` (bloque `IT2` de `ficha-personaje/ficha.html`; se ven con ⚠ en la ficha).

- 🔲 **P22. Tipo de un ataque sin arma.** Hoy 4 (`IT2.tipoSinArma`). *(código)*
- 🔲 **P23. Redondeo del primer ataque con Tipo impar.** Hoy Tipo ÷ 2 redondeado para arriba (`IT2.redondeoPrimerAtaque`). Con la escala de Tipos 4–12 todos los Tipos son pares, así que solo importa sin arma o con valores cargados a mano. *(código)*
- 🔲 **P24. Rengo e Inmovilizado.** Hoy Rengo cobra 2 No2 por casillero y Inmovilizado no deja moverse. *(código)*
- 🔲 **P25. Tope de X en costos variables.** Hoy no hay tope (solo frena lo que tengas). ¿Hay un máximo, ej. según Especial? *(código)*
- 🔲 **P26. Penalidad por sobrecarga.** Llevar más peso del que se puede no resta nada hoy (antes restaba de Bonos). ¿Qué penaliza? *(código)*
- 🔲 **P27. Conversión de Bonos viejos a SP.** Equipo, estados y catálogo que daban "+N Bonos" hoy dan "+N SP" (1 a 1, `IT2.spPorBono`). ¿Es la conversión correcta? *(código)*
- 🔲 **P28. Estados que tocaban Acciones/Movimiento.** Stun, Hypeado, Inmovilizado y Rengo pasaron a Nitros 1 a 1, sin recalibrar. ¿Qué valores llevan? *(código)* **Ya recalibrados (2026-09-21):** Cansado corta los No2 máximos a 2/3 (pierde un tercio, redondeado hacia abajo, sobre el modificador sumable); Exhausto los corta a un tercio del máximo natural (redondeado hacia abajo, con tope — no se acumula con Cansado, gana el más restrictivo), la misma lógica de cuando 1 Acción (de un máximo de ~3) equivalía a un tercio de la capacidad del turno.
- ✅ **P29. SP Regen como stat.** Decidido 2026-09-24 (regla por defecto del dueño): **todos los jugadores regeneran SP en el Mantenimiento, automatizado, al principio del Mantenimiento y por la mitad del Especial redondeada hacia abajo** (base `floor(esp/2)`, sigue sumando lo de habilidades, equipo y estados). Las fichas con la base vieja (0) pasan a la nueva una sola vez (`spRegenAuto`). *(2026-09-16)*
- 🔲 **P43. Mecánica de armas de dos manos.** El asistente de ítems
  (`comun/asistente-item.js`) ya deja elegir "Arma de dos manos" (ocupa las
  dos manos: no se puede llevar escudo ni segunda arma), pero no tiene
  ninguna regla mecánica propia todavía (¿bonus de daño, Tipo, algo más
  frente a una de una mano?). Queda de lado a propósito hasta nuevo aviso
  — no tocar sin que se pida. *(2026-09-17)*

## Recompensas

- 🔲 **P30. Experiencia por creep.** Fórmula actual: 40 × nivel + 5 × nivel × (nivel − 1) → 40/90/150/220 (el ejemplo original decía 200 para nivel 4). ¿Se cambia? ¿Tiene que importar el nivel de los jugadores o cuánto costó la pelea? Escapados: 20 %. *(2026-09-16)*

## Herramientas

- 🔲 **P31. Tiradas desde el mapa.** Hoy salen a nombre del usuario. ¿Usan el nombre del token que tengas seleccionado? *(2026-09-16)*
- 🔲 **P32. Hora en el Historial de la sesión.** Se sacó de la Mesa. ¿Se saca también del Historial de la ficha y gm-tools? *(2026-09-16)*
- 🔲 **P33. Catálogo y Excel.** Siguen con los stats viejos (Bonos, sin SP, Nitros ni SP Regen). ¿Se actualizan para que los ítems del catálogo puedan dar esos stats? *(2026-09-16)*
- 🔲 **P34. Dado Fudge** en la grilla de dados. ¿Se agrega? *(2026-09-15)*
- 🔲 **P35. Accesos repetidos.** Con el menú ☰ quedaron duplicados "⌂ Inicio", "🗺 Mapa", "⚔ GM Tools", "⌂ Partida" en las barras de cada herramienta. ¿Se sacan o quedan como atajo? *(2026-09-16)*
- 🔲 **P36. Defensa de los creeps en las Acciones.** La Botonera de los personajes muestra Defensa y Resistencia a críticos con su 🔍. ¿Se suma lo mismo en las Acciones de los creeps? *(2026-09-17)*
- 🔲 **P37. Versión para celular.** Decidido: por ahora solo compu. Se retoma solo si se pide. *(2026-09-17)*
- ✅ **P38. Caja de herramientas del mapa: quién usa qué.** Respondido
  2026-09-18: Lápiz, Terreno y Formas son de cualquier miembro por igual
  (crear); mover/rotar/borrar lo que creó cualquiera de las tres, solo su
  dueño o el GM. La única excepción es puntual: dentro de Formas, marcar
  un sólido como "invisible para jugadores" es solo del GM (checkbox que
  ni aparece si no lo es).
- ✅ **P39. Lápiz.** Respondido 2026-09-18: por default el trazo se ve unos
  segundos y se borra solo (como una estela); tildando "Dibujo
  permanente" queda como un objeto que se mueve y rota. Colores: paleta
  fija de 10, sin grosor configurable. Lo borra su dueño o el GM
  (si es permanente); si no es permanente, cualquiera (para que no quede
  huérfano). Construido en `vtt-hexgrid/mapa.html` ✏️, ver
  [`../vtt-hexgrid/CLAUDE.md`](../vtt-hexgrid/CLAUDE.md).
- ✅ **P40. Formas hexagonales.** Respondido y construido 2026-09-18: son
  objetos sólidos (bloquean casillero y trayectoria contra Formas,
  "avisa y bloquea" sin rodeo automático — ver P46), a diferencia de
  Terreno que es transitable; el GM además puede crear sólidos
  **invisibles para los jugadores** (él ve el contorno punteado violeta,
  ellos nada) para marcar sobre el fondo del mapa qué partes ya dibujadas
  son intransitables, sin que se note un dibujo extra. Ver
  [`../vtt-hexgrid/CLAUDE.md`](../vtt-hexgrid/CLAUDE.md). Queda pendiente
  (sección "Pendiente" de ese mismo archivo) la colisión
  token-contra-token: se decidió "todos los PJ aliados, creeps enemigos
  por default, el GM puede marcar un creep aliado o neutral" — falta
  sumarle el campo `bando` al creep y el chequeo en el mapa, más la regla
  de que en combate nadie comparte hexágono sin importar bando.
- 🔲 **P41. Terreno (arena movediza, veneno, arena tóxica…).** La parte
  visual (color + transparencia sobre la grilla, sin base de imágenes) ya
  está construida — ver P45 y
  [`../vtt-hexgrid/CLAUDE.md`](../vtt-hexgrid/CLAUDE.md). Sigue sin
  responder la parte mecánica: ¿qué hace cada uno al pisarlo o al
  quedarse (daño, No2 extra, estado alterado)? ¿Se aplica solo o es un
  recordatorio para el GM? *(2026-09-17)*
- ✅ **P45. Terreno con imágenes/texturas en vez de colores.** Respondido
  y construido 2026-09-19: no hace falta elegir entre una cosa u otra —
  Terreno y Formas dejan subir una imagen de fondo opcional (sin base
  propia, la sube cada uno; se achica y cubre la forma del elemento) que
  se usa en vez del color plano si está puesta, ver
  [`../vtt-hexgrid/CLAUDE.md`](../vtt-hexgrid/CLAUDE.md).
- ✅ **P46. Colisión de Formas con pathfinding automático.** Se eligió
  "avisa y bloquea" (si la ruta arrastrada cruza un sólido, se bloquea la
  confirmación y el jugador la vuelve a dibujar a mano) en vez de que el
  mapa calcule solo el rodeo más corto; queda anotado para evaluar más
  adelante si conviene sumar pathfinding automático. *(2026-09-18)*
  **Decidido (dueño, 2026-10-12): que el mapa calcule el rodeo.** Al arrastrar un token, mientras el camino directo no choca, la ruta sigue al
  mouse como siempre; cuando choca con algo Sólido o una pared de línea, el mapa busca solo el camino más corto (A*) hasta la casilla del mouse,
  rodeando (un paso que sale de terreno lento cuesta más). Si no hay paso, el token se choca como antes. **En modo combate, los rivales también
  cortan el paso** (el camino los rodea; los que no se ven, no) **y por un aliado se pasa, pero nadie termina el movimiento encima de otro**
  (dueño, el mismo día; es lo de P40). En narrativo, los tokens no tapan.
  (`rutaRodeo` en `vtt-hexgrid/js/06-mouse.js`.)
- 🔲 **P42. Grilla del mapa girada 30° (código).** La grilla pasó de hexágonos "de punta arriba" a "de lado arriba" para poder rotar tokens con el frente alineado a un lado (no a un vértice). Esto corre la posición en pantalla de todo lo que ya estaba puesto: el fondo (imagen del mapa) va a quedar desalineado y hay que volver a ajustarlo (arrastrar + ancho en casillas), y los tokens que ya estaban en el tablero conviene revisarlos y, si hace falta, reacomodarlos a mano. *(2026-09-17)*
- ✅ **P44. "Esp" con dos significados en `docs/clases-borrador.md`.**
  Respondido 2026-09-18: **Special Power se abrevia siempre "SP"**, nunca
  "Esp" — regla fija de acá en adelante (código, docs, fichas de skill). El
  usuario aclaró además que ese archivo no es una referencia a preservar:
  se adapta a las decisiones que se van tomando, no al revés. Con eso ya
  actualicé la terminología de `clases-borrador.md` (todo "Int"/
  "Inteligencia" pasó a "Esp"/"Especial"); la mecánica de cada skill sigue
  ⏳ sin confirmar, eso lo sigue revisando el usuario skill por skill.

## Niebla de guerra (mapa)

Diseño recién empezado (2026-09-19). Idea del usuario: el GM tiene un botón
para activarla/desactivarla en cada mapa; **doble niebla** — negra (no deja
ver ni mapa ni tokens) y gris semitransparente (deja ver el mapa ya
descubierto pero no los tokens fuera del campo de visión); cada personaje
tiene un campo de visión que descubre niebla frente a él; a futuro items,
efectos, skills y estados lo amplían o reducen. Los colores naranja/azul del
diagrama del campo de visión son del sistema de sigilo (más arriba), no de
esto.

- ✅ **P47. Forma del campo de visión por defecto.** Respondido
  2026-09-19 con un diagrama (token mirando hacia arriba): la visión
  general es el **disco de radio 6 hexágonos** alrededor del token, **menos
  una cuña de 120° hacia atrás** (punto ciego: el hexágono de atrás y los
  que quedan entre las dos diagonales traseras; las diagonales mismas sí se
  ven, y con ellas 5 de los 6 vecinos). Adentro van anidados el
  cono de 16 hexágonos (azul) y la zona de alerta (naranja/rojo), que son del
  sigilo y no cambian la niebla. Medido a ojo del diagrama (radio 6, cuña
  de 120°) — confirmar. *(2026-09-19)*
- ✅ **P48. Quién ve por quién.** Respondido 2026-09-19: todos los aliados jugadores ven lo mismo (la unión de sus campos de visión).
- ✅ **P49. Memoria de lo descubierto.** Respondido 2026-09-19: es por grupo, se guarda entre sesiones (Firestore) y el GM la puede reiniciar y destapar/tapar a mano.
- ✅ **P50. Qué ve el GM.** Respondido 2026-09-19: todo, con la opción "Como jugador" (sin ella, la niebla apenas se le insinúa).
- 🔲 **P51. Creeps y niebla.** ¿La niebla es solo para jugadores (los creeps
  no la usan)? ¿Los creeps que están dentro de la visión se ven, y los
  demás desaparecen del mapa del jugador? *(2026-09-19)*
- ✅ **P52. Obstáculos y niebla.** Respondido 2026-09-19: se prueba que los elementos Sólidos tapen la vista (misma respuesta que la P17).
- ✅ **P53. Tokens vistos y luego perdidos.** Respondido 2026-09-19: queda una marca de "última posición vista" (hecho, anotada en memoria local de cada navegador; no se guarda entre sesiones).
- 🔲 **P54. Alcance de lo oculto.** Por ahora, ¿alcanza con ocultarlo en lo
  visual (un jugador técnico que mire la base de datos vería todo), como el
  token "oculto"? *(2026-09-19)*

## Habilidades automatizadas

- 🔲 **P55. "Otro recurso" en el costo de una habilidad.** El asistente
  ya automatiza No2, SP y HP. El usuario mencionó "u otro recurso": ¿cuál?
  (¿municiones, cargas de un ítem, un recurso propio de una clase?). Además,
  hoy pagar HP no deja usarla si te dejaría en 0 (hay que tener más vida que
  el costo): ¿está bien, o se puede pagar con la vida entera? *(2026-09-19)*

## Biblioteca de creeps y de skills (GM)

Idea del usuario (2026-09-19): una base de datos de **creeps** y otra de
**skills**, parte del juego y no de una campaña — para que cualquier GM no
tenga que crear creeps/skills de cero en cada partida. "Crear creep nuevo"
ofrece: elegir de la biblioteca, o crear de cero. Solo texto, sin imágenes.
Filtros por categoría. Ejemplos de creeps: bandidos, criaturas de bosque,
de cavernas, adefesios infernales. Ejemplos de skills: rango, melee, daño
físico, daño mágico, tanque.

- ✅ **P56. Dónde vive la biblioteca.** Hecho 2026-09-19: Firebase, colecciones globales (ver workflow-firebase.md). Pregunta original: ¿Firebase (colección global, se
  edita en vivo, más simple) o archivo en el repo sincronizado por GitHub
  como el catálogo (versionable, igual para todos)? Recomendación: ver
  conversación 2026-09-19. *(2026-09-19)*
- ✅ **P57. Quién puede editarla.** Respondido 2026-09-19: dos niveles.
  **Biblioteca oficial**: solo el dueño del proyecto la edita, todos los GM
  la leen. **Propuestas**: cualquier GM aprieta "Guardar en la biblioteca" y
  el creep/skill queda como propuesta pendiente (con quién la mandó); el
  dueño las audita, ajusta y etiqueta una por una, y recién ahí pasan a la
  oficial. Los jugadores comunes no ven la biblioteca. Falta confirmar si
  mandan propuestas solo los GM (sugerido) o cualquier cuenta.
- 🔲 **P58. Categorías.** Hoy las etiquetas son libres (con sugerencias). Definir la lista de etiquetas (creeps: ambiente,
  tipo, rol, nivel; skills: rol, tipo de daño, alcance) y si un ítem puede
  tener varias. *(2026-09-19)*

## Pool de habilidades pasivas

Idea del usuario (2026-09-19): un pool prefabricado de pasivas que se
eligen con puntos de Job (hoy cada pasiva ya cuesta 1 Job y da `mods`).
Ejemplo: por 1 Job, +1 a un stat secundario; si es HP, no es +1 sino el
equivalente que da Con (5), o sea +5 HP máx.

- ✅ **P59. Escalado.** Respondido 2026-09-19: tabla de escalones. 1 Job =
  un escalón del stat (HP máx = 5, SP = 3…). Se carga como tabla única.
- 🔲 **P60. Valor del escalón de cada stat.** Hay que fijar la tabla
  completa (HP 5 y SP 3 salen de las reglas; faltan No2, Crg.Max, Res.Mt,
  PdG, etc.). *(2026-09-19)*
- ✅ **P61. Regeneración.** Respondido 2026-09-19: valores arbitrarios por
  ahora: **1 SP por turno y 3 HP por turno** por cada compra.
- ✅ **P62. "FP".** Era SP.
- ✅ **P63. Apilar.** Respondido 2026-09-19: sí, la misma pasiva se puede
  comprar más de una vez.
- ✅ **P64. Tope de compras.** Respondido 2026-09-19: el tope es la **mitad
  del nivel, redondeada hacia abajo, y es POR CADA PASIVA
  (ej. nivel 6 → hasta 3 copias de cada una). *(2026-09-19)*
- 🔲 **P65. Pasivas situacionales.** Se van viendo más adelante
  (2026-09-19).
- ✅ **P66. Quién las carga.** Respondido 2026-09-19: mismo esquema que la
  biblioteca: el desarrollador carga las oficiales; **cualquier usuario,
  también los jugadores** (no solo los GM), puede mandar propuestas. Esto
  cierra la duda que quedaba en P57: mandan propuestas todas las cuentas.
- ✅ **P67. Qué es una pasiva.** Aclarado 2026-09-19: una pasiva **no es un
  bonus a un stat**: es una habilidad que se carga y tiene efectos, ligados
  o no a stats (ej. regeneración de HP —ligada a Constitución en concepto
  pero no es un stat—, +2 a las tiradas contra crowd control, +1 al campo
  de visión). Regla de construcción: **si el efecto se puede automatizar,
  se automatiza al cargar la pasiva**; si no, queda como recordatorio.
- 🔲 **P68. Lista de efectos automatizables de las pasivas.** Ver la lista
  propuesta en la conversación del 2026-09-19 (bonos a stats, regeneración
  por turno, bonus a tiradas por situación, campo de visión, resistencias).
  Falta que el usuario la revise efecto por efecto. *(2026-09-19)*
- ✅ **P69. Campo de visión en la ficha.** Hecho 2026-09-19: stat `vision`
  (radio en hexágonos, base 6 por la P47), en un cuadro "Campo de visión"
  debajo de Defensa; se puede modificar con mods de pasivas, ítems y
  estados (aparece en "Otros" al elegir el stat). La niebla del mapa todavía
  no lo lee.
- ✅ **P70. Escalones excepcionales.** Respondido 2026-09-19: la pasiva de
  Res.CC da **+2** por 1 Job (excepción a "+1"); la de campo de visión da
  **+1**. Resto de la tabla de escalones (P60) sigue pendiente.
- ✅ **P71. "+ Pasiva" con catálogo.** Hecho 2026-09-19: "+ Pasiva" pregunta
  "Crear de cero" o elegir del catálogo (`comun/pasivas.js` + aprobadas en
  `biblioteca_pasivas`). Se compra varias veces (`compras`, efectos y Job
  multiplicados; tope por pasiva = mitad del nivel redondeada hacia abajo,
  **con mínimo 1** para que a nivel 1 se pueda comprar; confirmado 2026-09-19). Efectos
  automatizados: bonos a stats y regeneración de HP en el Mantenimiento
  (`regenHp`). Cada pasiva propia tiene "📚 Proponer" (cualquier jugador) y
  el dueño las audita desde la pestaña Propuestas. Tanda inicial: Robustez
  (+5 Hp.Max), Reserva de poder (+3 SP), Recuperación mental (+1 SP Regen),
  Regeneración (3 HP/turno), Voluntad de hierro (+2 Res.CC), Ojo avizor (+1
  visión). Faltan las de 2 y 3 Job y el resto de la tabla (P60).
- ✅ **P72. Pasivas de los demás stats secundarios.** Cargadas 2026-09-19 a
  pedido del usuario, 1 Job cada una, +1 (Res.Mg, Dmg, Bloqueo, Crg.Max, Eva,
  Iniciativa, No2, Rng, PdG, Crit, Parry, PdG.Mg, Res.Mt, Rango de casteo).
  Marcadas "⚠ a revisar" No2, Rng y Crit (fuertes para 1 Job). No se
  cargaron Defensa, Ranuras de cinturón ni Res.Crit (Tipo 4–12): esperan
  decisión. Falta seguir con las de 2 y 3 Job. *(2026-09-19)*
  **Actualización 2026-09-19:** se sumaron Defensa (+1) y Ranuras de
  cinturón (+1); las resistencias a críticos quedan afuera por ahora.

## Estados alterados (buffs y debuffs)

- 🔲 **P73. Repasar todos los buffs y debuffs, uno por uno.** Pedido del
  usuario 2026-09-19: revisar, auditar y modificar cada estado alterado
  (presets de `EFECTOS_PRESET` en `ficha-personaje/ficha.html` y
  `ESTADOS_PRESET_GM` en `gm-toolset/gm-tools.html`), uno a uno con el usuario.
  Empezó con Armadura rota (P74). Lista actual: Veneno, Regeneración,
  Pajaritos, Cansado, Exhausto, Stun, Hypeado, Armadura rota, Armadura
  arruinada, Veneno severo, Sangrado, Lisiado, Inmovilizado, Rengo,
  Invulnerable, Inmunidad a CC, Espinas, Escudo mágico, Afortunado, Sangre
  pura, Coagulación extrema, Blindado, Sigilo. *(2026-09-19)*
- ✅ **P74. Armadura rota.** Hecho 2026-09-19: ya no corta a la mitad
  Defensa y Res. a crítico. Cada acumulación resta **1 de Defensa** (solo
  Defensa), es permanente y acumulable: activar el estado de nuevo suma un
  stack en vez de duplicarlo. Se cura solo con ítem/habilidad especial
  (Oleo reparador la quita entera). El chip tiene **− / +** para ajustar los
  stacks (al llegar a 0 se repara), en la ficha, en las invocaciones y en
  los creeps de gm-tools. Los estados viejos se convierten solos. En la
  ficha el −1 es un mod de Defensa del estado (se ve en el desglose de
  Defensa); en creeps e invocaciones se aplica por la marca.

## Parry y Bloqueo

- ✅ **P75. Parry con arma: costo y Bloqueo.** Decidido 2026-09-19: el **Parry
  siempre cuesta No2**, lo mismo que un primer ataque con esa arma (Tipo ÷ 2),
  sin importar los ataques que ya hiciste en el turno. El **Bloqueo** se tira
  con el substat Bloqueo (deriva de Fuerza) **más el peso del arma**. Con dos
  armas equipadas se elige con cuál en los dos casos. Hecho en la ficha
  (`parryConArma`, `bloqueoConArma`, `elegirArmaDefensa`). Sin arma: el Parry
  cuesta lo de un ataque sin arma (provisorio) y el Bloqueo no suma peso.
  **Actualización 2026-09-19:** el Bloqueo del defensor usa solo el arma con la
  que hizo el Parry (no vuelve a preguntar); si no hubo Parry antes (ej. el
  Bloqueo del atacante), se elige el arma como siempre.
- 🔲 **P76. Parry con escudo.** Distinto al de arma; falta definir su paso a
  paso (costo, qué se tira, con qué se suma). *(2026-09-19)*
- 🔲 **P77. Cadena Parry → Bloqueo.** Sin resolver: si es el Bloqueo del
  atacante contra el del defensor, y qué pasa si gana el Parry pero pierde el
  Bloqueo. Hoy cada tirada es suelta y la resuelve la mesa. *(2026-09-19)*

## Trampas (mapa)

Idea del usuario (2026-09-19): jugadores y GM pueden crear objetos en el mapa y
asignarles el rol de **trampa**; cuando un personaje **rival** del dueño la
pisa, se dispara y se avisa en el log (la Mesa). Diseño recién empezado.
Propuesta de base: la trampa es un elemento del mapa (Terreno y Formas) con una
marca `trampa` (nombre y descripción de qué hace, escritos por quien la crea);
al confirmar un movimiento, el mapa mira si alguna casilla de la ruta cae en una
trampa enemiga y publica una línea roja en la Mesa. Solo avisa (los efectos se
resuelven a mano, como el resto de los avisos).

- ✅ **P78–P84 (trampas, primera versión hecha 2026-09-20; ver vtt-hexgrid/CLAUDE.md).** P78 (rival). Trampa de un jugador: ¿la disparan los creeps y
  también otros jugadores, o solo los creeps? Trampa del GM: ¿los personajes?
  ¿Los aliados del dueño nunca la activan? *(2026-09-19)*
- 🔲 **P79. Visibilidad.** ¿La trampa la ven solo su dueño (y el GM), o también
  sus aliados? ¿Se ve distinto a los demás objetos (marca de trampa)? Los rivales
  no la ven hasta que se dispara. *(2026-09-19)*
- 🔲 **P80. Cuándo se dispara.** ¿Al pasar por la casilla en cualquier punto de
  la ruta (y el movimiento se corta ahí, como con los conos de detección) o solo
  si termina el movimiento encima? Propuesta: cualquier casilla de la ruta, y se
  corta ahí. *(2026-09-19)*
- 🔲 **P81. Una vez o siempre.** ¿Se gasta al dispararse (desaparece o queda
  marcada como disparada) o sigue armada? Propuesta: una vez, con opción de
  dejarla armada. *(2026-09-19)*
- 🔲 **P82. Qué hace.** ¿Solo aviso con el texto que puso el creador, o más
  adelante daño/estado automáticos? Propuesta: solo aviso por ahora. *(2026-09-19)*
- 🔲 **P83. Detectar y desarmar.** ¿Hay tirada para verla o desarmarla, o eso
  queda entre los jugadores a mano? *(2026-09-19)*
- 🔲 **P84. Quién puede crear.** ¿Cualquier jugador, en cualquier lugar del mapa,
  o con algún límite (cantidad, costo de No2, solo en combate)? *(2026-09-19)*

## Sigilo: detección durante el movimiento del rival

- ✅ **P85. Detección a lo largo de la ruta del que camina (hecho 2026-09-19, ver vtt-hexgrid/CLAUDE.md).** Hoy, cuando se
  mueve el personaje oculto se revisa casillero por casillero, pero cuando se
  mueve el rival (el oculto queda quieto) solo cuenta la posición final. Se
  quiere revisar también los casilleros del medio del rival (con su cono mirando
  hacia el siguiente paso). **Decidido 2026-09-19: el sistema tiene que ser el
  mismo en las dos direcciones** — creep que camina y personaje oculto, o
  personaje que camina y creep oculto. Falta: si el movimiento del que camina se
  corta ahí, y si el sigilo se rompe solo o dispara una tirada de detección a
  mano. Se puede resolver junto con las trampas (P78–P84), que necesitan la misma
  revisión de la ruta. *(2026-09-19)*

- 🔲 **P86. Trampas como consumibles del catálogo.** Pedido del usuario
  2026-09-20 (anotado): crear trampas en el catálogo de consumibles — un
  consumible "trampa" que, al usarlo, arma una trampa en el mapa (con nombre,
  qué hace y fuego amigo ya cargados). Falta definir cómo se coloca desde el
  consumible y si gasta la unidad al colocarla o al dispararse. Hoy las trampas
  recurrentes se guardan por navegador (P78–P84, primera versión). *(2026-09-20)*
- ✅ **P87. Armas de dos manos.** 2026-09-20: se había descartado y se sacó del
  asistente de ítems, pero el usuario **se arrepintió el mismo día**: la opción
  de arma de una o dos manos queda como estaba (revertido).

- 🔲 **P88. Auditoría del catálogo (2026-09-20, hecha sin preguntar; a corregir).**
  Qué se hizo, para que el usuario ajuste lo que no le cierre:
  - **Resistencia a críticos en defensas, por tier** (Tipos 4, 6, 8, 10, 12):
    Común solo Tipo 4 y 6; Buena Calidad hasta Tipo 8; Raro hasta Tipo 8 (Tipo 10
    solo en armadura rígida o con Defensa ≥ 9); Excepcional hasta Tipo 10;
    Legendario hasta Tipo 12 (1 punto). Los valores altos (Tipo 10 y 12) son
    raros, y tope de +1. Lo que sobraba se bajó al Tipo más alto permitido (no se
    sumó, se tomó el mayor). Excepciones a propósito: Casco de Magnetto y
    Guanteletes de Adamantium (+2 a todos). 57 ítems cambiaron; su Detalle se
    reescribió para que diga lo mismo que los números.
  - **Se completó**: 36 ítems sin Detalle (texto armado con sus números), 37 sin
    precio (mediana de su rubro y tier) y **35 ítems que estaban ocultos
    (`ocultoEnCatalogo`) ahora se ven** (los de la tanda "ia-").
  - **Pool nuevo (32 ítems)**: armas a distancia (no había ninguna salvo el
    Lanzallamas) — honda, ballesta de mano, pistola de chispa, pistola de duelo,
    revólver, arcos y ballesta pesada; 9 armas de dos manos cuerpo a cuerpo
    (bastón ferrado a Espadón del Titán caído); 4 escudos de dos manos (no había
    ninguno); 5 anillos de Buena Calidad (había 0) y 5 consumibles Legendarios
    (había 0). Todos con precio, narrativa, Detalle y estados/efectos al golpear
    cuando corresponde.
  - **Sin tocar (a decidir)**: los mods `mov` siguen (la ficha los convierte a
    No2 al abrir); el `crit +10` de la Cachiporra y el Martillo de sargento
    parece un valor de la escala vieja; los precios de anillos (1200–3000) son
    muy altos comparados con el resto del catálogo; Lanzallamas es el único
    arma de rango antiguo y ahora conviven con los nuevos.

- 🔲 **P90. Trampas: catálogo base y daño automático (2026-09-20).** Se inventaron 24 trampas
  (todas a auditar) y un asistente paso a paso para crear las propias. Se automatizó lo único que hoy se
  puede: el **daño** (`trampaDano`). Sigue a mano: estados sobre otros, tiradas para evitarla, alarmas.
  Pendiente de decidir: ¿aplicar estados automáticamente a quien la activa (habría que poner el estado en su
  ficha)? ¿el daño de área debería alcanzar también a los personajes de otros jugadores (hoy solo se les avisa)?
  Las **dificultades y los daños** del catálogo son una guía mía (6 + 2 por nivel; 1d6 a 5d6).
- 🔲 **P89. Manual nuevo (2026-09-20).** Se escribió el manual completo (13 capítulos,
  ~110 notas, navegable como un vault: `manual-usuario/notas/*.md` → `datos/manual.json`).
  **Todas las dudas quedaron dentro del propio manual** como recuadros `> [!question]`,
  que se juntan en la pantalla 📌 Pendientes (hoy ~50). Cosas puntuales que conviene
  mirar primero: (1) reglas que puse como "confirmadas" aunque salgan solo del código
  (Regeneración de 5 HP, Sigilo a 1 No2, etc.); (2) el ejemplo de "Un turno de ejemplo";
  (3) las notas de clase de Asalto/Mago/Shooter/Support/Debuffer, que solo listan el
  borrador sin automatizar; (4) el crítico y las resistencias, que siguen "en pausa".
  `datos/reglas.json` (el borrador viejo) quedó como archivo histórico. La página ya no
  tiene modo de edición: se edita el `.md` y se recompila.

- 🔲 **P91. Botín, experiencia y despojos (en debate, 2026-09-20; todavía sin construir).**
  **Cerrado:**
  1. Los ítems que sueltan los creeps derrotados (arma y equipo) se publican a los jugadores en una lista con **"Sumar a la mochila"**; el primero que lo toca se lo lleva.
  2. Un ítem que **no está en el catálogo** se convierte en un ítem **compatible con la ficha** (equipable), con sus mismos números; el precio lo fija Claude por comparación con ítems parecidos del catálogo, ajustado por efectos.
  3. **Filtro del GM** antes de publicar (destildar ítems, sumar botín extra) y **XP editable** (cálculo automático + sumar/restar del GM).
  4. **Mochila llena**: no deja cargar; lo que no entra pasa a **despojos**. Lo que nadie toma, también.
  5. Los jugadores ven **solo el nombre** (características al pasar el mouse); si el ítem se puede equipar en una ranura ya ocupada, botón **Comparar**; acceso fácil a la mochila y cuántas ranuras libres quedan.
  6. **Quién puede tomar**: sin regla programada (lo decide la narrativa).
  7. **"Loot" pasa a llamarse "despojos"** (incluido el contador de la ficha).
  8. **Despojos** = lo que los creeps dropean y los jugadores no se llevan. El GM aprieta **"Despojar"** y se reparte entre los jugadores (fracción: redondeo hacia arriba). Son una **moneda intermedia** (a futuro, crafteo).
  9. **Valor**: si un ítem se despoja, al **vender los despojos** se obtiene la **mitad de su valor de venta** en **doblones del espacio (DDE)**. Los despojos se venden en **cualquier tienda** (opción nueva en el menú del Vendedor).
  **Abierto:** (a) tratamiento de los tres tipos actuales del contador (Normal, Mágico, Especial); (b) qué más se puede hacer con los despojos; (c) si los creeps sin ítems también dan despojos (ej. "Piel de lobo"); (d) confirmar que "valor de venta" = precio de catálogo; (e) el resumen de XP/loot que ve hoy solo el GM, ¿lo ven también los jugadores?
  **Aclaración (2026-09-20, sobre P91):** el **valor de venta** de un ítem es lo que el jugador recibe al vendérselo a una tienda; si el ítem no tiene un valor de venta propio, es **la mitad de su precio de compra** (así funciona hoy la ficha, `precioVentaDe`). Los **despojos de un ítem** valen la mitad de su valor de venta (= un cuarto del precio de compra si no tiene uno propio), a 1 DDE por despojo, redondeando hacia arriba. **Vender ítems** hoy solo existe en la ventana "Ver" de cada ítem; falta la opción **"Vender"** dentro del Vendedor (abre la mochila, elegir varios ítems y despojos). Sin decidir: ¿se mantiene la venta fuera de la tienda?, ¿el ajuste de precios de la tienda afecta lo que paga?, ¿cada tienda compra de todo?
  **Tiendas, decidido (2026-09-20, sobre P91):** (1) **no se puede vender fuera de la tienda**: se quita el botón "Vender" de la ventana de cada ítem; (2) **el GM decide cuándo la tienda está accesible**: hoy cualquier jugador ve la tienda publicada en cualquier momento y lugar con el botón 🏪; (3) el **ajuste de precios de la tienda rige para comprar y para vender**; (4) **cualquier tienda, de cualquier tamaño y característica**, compra tanto despojos como los ítems de los jugadores. Falta cerrar: cómo se abre/cierra la tienda (¿interruptor aparte de Publicar?), y si el ajuste al vender es el mismo número que al comprar o uno propio.
  **Oro y reparto, decidido (2026-09-20, sobre P91):** (1) el master define **cuánto oro (DDE) carga cada creep**; al final del combate aparece junto al botín. (2) Escala para probar: **humanos 15/40/75/120/175** por nivel 1–5; **humanoides (todo lo etiquetado así) la mitad, redondeada a múltiplos de 5**: 10/20/40/60/90; **jefes el doble**; **no humanoides, 0**; **variación al azar de ±20%**. (3) **Despojos y DDE se cargan solos en la ficha de cada jugador**, con un aviso claro (pop-up o línea en la Mesa) que diga cuántos se sumaron a cada uno. (4) **Antes de publicar, el GM puede dejar a un jugador afuera** de las recompensas (no estuvo en el combate por una razón excepcional, etc.). (5) **Experiencia por estado**: consciente 100%; **inconsciente (no muerto) 25%**; muerto 0%. (6) En la lista donde los jugadores toman ítems se ve **en cuántos despojos se convertiría cada uno**. **Falta cerrar:** qué es "inconsciente" y "muerto" en la ficha (HP 0 dentro de los 5 mantenimientos vs. muerte definitiva), si el 25% también rige para oro y despojos, cuándo se acreditan XP, oro y despojos (al publicar vs. al despojar), a quién van los despojos de un ítem que no entró en la mochila, y cómo se redondea la XP por jugador.
  **Cierre parcial (2026-09-20, sobre P91):** aviso de recompensas = **línea verde en la Mesa** (no pop-up), siempre verde; **"muerto" pasa a llamarse "inconsciente"** y **"muerte definitiva/permadeath" pasa a llamarse "muerto"**; el **25% rige solo para la XP**: la XP se divide entre la cantidad de jugadores como si todos estuvieran vivos (redondeo hacia arriba) y el inconsciente recibe el 25% de lo suyo (redondeo hacia abajo), el muerto 0; la **XP también se carga sola** en la ficha y, si sube de nivel, sale un **pop-up de felicitación en el mapa y/o la ficha, donde esté el jugador**; los ítems que no entran en una mochila llena **quedan en la lista**; flujo: lista de ítems → los jugadores toman → el master pregunta y aprieta **"Despojar"** → todo lo que queda se convierte en despojos y se carga solo (redondeo hacia arriba). **Despojos mágico y especial: se dejan como están** hasta definir cómo calcularlos. **Tienda**: **interruptor abierta/cerrada del GM**; cerrada, el botón 🏪 del jugador aparece **desactivado** y al pasar el cursor dice **"Tienda cerrada"**; **dos ajustes de precio** (comprar y vender), y el de vender también rige para los despojos. **Creeps sin ítems**: el usuario lo desarrolla en el próximo mensaje.
  **Oro del creep, precisiones (2026-09-20, sobre P91):** cada creep tiene un **valor base fijo de oro** (campo editable); la **variación de ±20% se tira una sola vez** al finalizar el combate y **no se recalcula** al reabrir el reporte (el GM puede ajustar el total a mano). En la **herramienta para crear un creep** tiene que haber un lugar para el **oro que carga**, con un ícono **"?"** al lado de la casilla que, al apoyar el cursor, muestre la sugerencia (la escala: humanos 15/40/75/120/175 por nivel 1–5; humanoides la mitad a múltiplos de 5; jefes el doble; no humanoides 0; variación ±20%).

- 🔲 **P92. Asistente paso a paso para crear un creep entero (en debate, 2026-09-20; todavía sin construir).**
  Aparece en **+ Creep → "Crear paso a paso"** (junto a biblioteca y "de cero"). Pasos: 1) qué es (nombre, nivel, **tipo de criatura con la opción "Otros" donde se escribe cuál**, jefe, color, imagen, nota); 2) atributos con **presets por nivel/rol que se cargan solos y se pueden modificar a mano** (el presupuesto 33 + 3 por nivel es esa guía); 3) arma y 4) armadura/equipo, del catálogo o propios, con **sugerencia de rareza según el nivel**; 5) habilidades: **crear una custom** con el asistente existente y, a futuro, un **pool de habilidades prediseñadas (pendiente, se diseña después)**; 6) recompensas: oro que carga (con "?" y sugerencia), XP informativa, si suelta sus ítems; 7) resumen tipo "Ver" y crear (o crear y proponer a la biblioteca). Campos nuevos: **tipo de criatura** y **jefe**. **Faltan por responder** (el usuario las va a redactar): si el asistente sirve solo para crear o también para editar, y si se puede volver a pasos anteriores sin perder lo cargado.
  **P92, cerrado (2026-09-20):** el asistente **sirve también para editar** un creep ya creado (los pasos se abren con sus datos) y **se puede volver a pasos anteriores sin perder lo cargado**.

- 🔲 **P93. Armas naturales y trofeos (cerrado el diseño, 2026-09-20; sin construir).**
  Hoy todos los creeps "sueltan" su arma como botín, aunque sea un colmillo. **Criterio:** campo del creep **"arma natural"**: si está marcado, el arma es parte del cuerpo y **no se suelta como arma sino como un trofeo**. Por defecto natural: bestias, plantas, elementales y alienígenas; objeto: humanos y humanoides; constructos y no-muertos se revisan uno por uno. **Trofeo:** ítem **no equipable** con nombre inspirado en el creep ("Garra de topo excavador"), que el jugador guarda en la mochila y **vende en una tienda o convierte en despojos**. **Apilable en una sola ranura** de la mochila. **Precio** (solo por nivel del creep, siempre por debajo del arma equivalente): **compra 16/30/50/75/110** para nivel 1–5, venta la mitad, despojos un cuarto (4/8/13/19/28); **jefes el doble**. **Trofeos especiales**: el GM puede ponerle **nombre y valor propios** a un creep (dragón, jefe…); ese campo va en el editor del creep **con una ayuda ("?") clara que explique en qué caso conviene usarlo**. Los trofeos son ítems del catálogo **ocultos de las tiendas**. En el reporte, un creep sin nada dice "no suelta ítems".

- ✅ **P94. Pool de armas naturales (hecho 2026-09-20: `comun/armas-naturales-base.js`, 66 armas generales con efectos, botón 🐾 en gm-tools).** Diseñar un **pool de armas naturales con distintas variantes** (garras, colmillos, tentáculos, puños…) para cargarlas en un creep de manera automática sin configurar sus stats paso a paso. Se conecta con P92 (asistente de creeps) y P93 (trofeos). Sin fecha.

- ✅ **P91, tanda 1 hecha (2026-09-20):** renombres (loot → despojos en la ficha y el manual; "muerto" → **inconsciente** y "permadeath" → **muerto**), **tienda abierta/cerrada** con interruptor del GM, **dos ajustes de precio** (comprar y vender), **venta solo dentro de la tienda** (botón 💰 Vender: mochila con casillas + despojos) y se quitó el "Vender" de la ventana de cada ítem. Sin cambios de reglas de Firebase. **Faltan las tandas 2 (campos del creep y su asistente), 3 (fin del combate y publicación) y 4 (botín de los jugadores y despojar).**

- ✅ **P91/P92, tanda 2 hecha (2026-09-20):** campos del creep (tipo, jefe, oro base, arma natural, trofeo especial), sección **Recompensas** con ayudas "?", **asistente paso a paso** para crear y editar creeps (con preset de atributos por rol y nivel y sugerencia de rareza), y los **120 creeps base** ya cargados (17 jefes, oro por escala, 51 con arma natural y su trofeo con nombre propio). Nota: los trofeos viven en el creep; se convierten en ítem de mochila (no equipable) en la tanda 4. Faltan las **tandas 3 y 4**.

- ✅ **P91, tanda 3 hecha (2026-09-20):** reporte de fin de combate con jugadores (estado y exclusión), XP (ajuste del GM, base ⌈total÷jugadores⌉, inconsciente ⌊25%⌋), oro (±20% tirado una vez, ajuste del GM), botín con filtro y publicación a las fichas (`recompensas`, `botin`), línea verde en la Mesa, aplicación automática en la ficha y pop-up de subida de nivel (ficha y mapa). **Hay que pegar las reglas nuevas** (`recompensas` y `botin`). Falta la **tanda 4**.
- ✅ **P95 (versión inicial, 2026-09-21: jefe = inmune a Stun y +1 Res.Mg, automático; ampliar después con resistencia a controles o fases).** Antes: **P95. "Boss protection" (jefes, 2026-09-20; a diseñar).** Los creeps marcados como **jefe** tendrían por defecto una condición **"boss protection"** que los protege de efectos brutales (Stun, muertes instantáneas, control total…). Sin diseñar: qué efectos bloquea exactamente (¿Stun, Inmovilizado, Exhausto, Control mental, Confusión, muerte instantánea/Ejecución?), si es inmunidad total o **reducción** (por ejemplo, el Stun dura la mitad o tiene chance de fallar), si se **rompe/decae** durante el combate (por ejemplo, tras N usos o al bajar de cierto HP), si es un **estado visible** en el creep (con su descripción) y si el GM puede **quitarla**. Se conecta con la regla de inmunidades ("inmunidad a X" es hoy un recordatorio manual) y con P73 (repasar buffs y debuffs).

- 🔲 **P96. Creeps en el reporte, grupos de creeps y tokens automáticos (2026-09-20; en debate).**
  **Hecho:** el reporte de fin de combate solo cuenta los creeps con un **token vinculado en el mapa publicado** (en GM Tools puede haber muchos creeps armados de antemano). **Pedido, sin construir:** (1) el botón **🏁 Finalizar combate también en el mapa** (solo GM); (2) **grupos o pestañas de creeps** en GM Tools (por escenario, ej. "5 creeps para tal combate, 4 para otro") y, con un grupo abierto, un botón **CREAR TOKENS** (desde GM Tools) o **IMPORTAR TOKENS** (desde el mapa) que cree **un token por cada creep del grupo**; (3) en cualquier mapa nuevo, un botón **"Crear tokens de jugadores"** que cree automáticamente los tokens de los personajes. Faltan definir: dónde se ponen los tokens (posición y hacia dónde miran), en qué mapa (el publicado o el que el GM está viendo), qué pasa con los que ya tienen token, si un creep puede estar en más de un grupo, y si los nuevos tokens arrancan ocultos.

- ✅ **P91, tanda 4 hecha + pedidos de P96 (2026-09-20):** **grupos de creeps** en GM Tools (pestañas; un creep en un solo grupo, para repetirlo se duplica) con **🎯 Crear tokens** (GM Tools) / **📥 Importar tokens** (mapa): un token por creep del grupo, en una fila al centro de lo que el GM ve, en el mapa que está viendo, salteando los que ya tienen token y **ocultos**; **👥 Tokens de jugadores** en el mapa (visibles); **🏁 Finalizar combate y 🎁 Botín en el mapa** (solo GM, `comun/tokens-auto.js`). **Botín en la ficha**: botón 🎁 del dock con contador, lista con nombre (hover con características, "≈ N despojos"), **Sumar a la mochila** (el primero se lo lleva; mochila llena = no entra; trofeos iguales se apilan), **Comparar** si el slot está ocupado, ranuras libres y **Abrir mochila**; los trofeos no se equipan. El GM aprieta **Despojar** en 🎁 Botín: lo que quedó se convierte en despojos y se reparte entre los jugadores (hacia arriba). Necesita las reglas `botin`/`recompensas` pegadas en la consola.

- ✅ **P97. Reglas de casteo con SP — los 5 pasos de decisión cerrados (2026-09-21 a 2026-09-27; reglas completas en [`reglas-casteo.md`](reglas-casteo.md); nada implementado en código todavía, eso sigue en `pendientes.md`).** Definido: **por defecto, todo daño de casteo ignora armadura**, sea cual sea el elemento — la única excepción es un objeto físico arrojado (aguja de hielo, piedra, dardo), que respeta la armadura como cualquier proyectil físico; un mismo elemento puede ser las dos cosas según cómo se lo narre (Paso 1); qué tira cada lado según la habilidad (proyectil: PdG.Esp vs Evasión; efecto abstracto: PdG.Esp vs Res.Esp; control mental: PdG.Esp por defecto vs Res.Mt, salvo que la habilidad diga otra cosa); una habilidad mixta (daño + debuff) tira **una sola vez**, el debuff se aplica solo si conecta; sobre uno mismo o un aliado **no se tira nada, pero se abre igual el cuadro de duelo sin oposición** (visible a toda la mesa, con botón «Aplicar» para el estado — ya construido, [`duelo-de-habilidades.md`](duelo-de-habilidades.md)); el formato de la descripción usa el campo `duelo` cuando la habilidad ya está automatizada, o una frase tipo "Tirás PdG.Esp contra el Res.Esp del objetivo" si todavía no (Paso 2); los críticos y las Resistencias a crítico (Tipo 4–12) no aplican al daño de casteo; el daño de trampas depende de cada trampa; la resistencia al daño de casteo es un solo stat nuevo, **Armadura mágica** (número fijo, no por elemento, no deriva de ningún atributo, solo en ítems de tier alto), distinta del estado Escudo especial y de la skill **Armadura arcana** del Mago (renombrada 2026-09-27, antes "Armadura Mágica", para no confundirla con el stat — Paso 3); un área se esquiva primero con el contraste de siempre (PdG.Esp o PdG del que actúa contra la Evasión de cada defensor); solo si el defensor gana esa Evasión gana el derecho a un **dodge roll** (moverse hasta 2 casilleros, 1 No2 por casillero, doble con Rengo, imposible con Stun o Inmovilizado); **no hay término medio** — fuera del área del todo o efecto completo, nunca mitad; las trampas no se esquivan así, elemento sorpresa (Paso 4); el daño genérico se llama **"arcano"** (ya usado en el catálogo), "Mg" se renombró a "Esp" (PdG.Esp, Res.Esp — los ids `pdgmg`/`resmg` no cambiaron), "Hechizo" se mantiene (Paso 5). **Sigue:** Pasos 6–8 (implementación en código y auditoría de contenido) — ver [`proceso-casteo.md`](proceso-casteo.md) y `pendientes.md`.

- 🔲 **P98. Tres velocidades de habilidad para creeps: rápida, intermedia y lenta (idea conceptual, 2026-09-21; sin diseñar ni construir — "las vamos a ir viendo").**
  Hoy hay dos: **rápida** (CD 2–3) y **lenta** (CD 4–6, arranca con el cooldown activo; en el código `lenta = cd >= 4`, `comun/skills-creep-base.js`, y el filtro "Velocidad" de la biblioteca de habilidades de gm-tools). **Idea del usuario:** pasar a tres, con la velocidad **equivalente al poder del efecto** (más lenta, más potente):
  · **Rápida:** CD 2 o 3.
  · **Intermedia:** CD 3 o 4, **empieza con el CD activo**.
  · **Lenta:** CD 5 o 6, **empieza con el CD activo**.
  El mensaje del usuario se cortó en "Debería haber una equi…" (probablemente una **equivalencia entre poder y velocidad**); pendiente completarlo. **Por decidir:** (1) esa equivalencia (cuántos dados de daño, cuánta cura o qué tipo de efecto corresponde a cada velocidad); (2) el CD 3 cae en rápida **y** en intermedia, así que el CD solo no alcanza: ¿cada habilidad guarda su velocidad, o se distingue por poder?; (3) qué pasa con las habilidades actuales (321 del catálogo y las de los creeps base): ¿se reclasifican solas —las de CD 4 pasarían de lentas a intermedias— o se revisan una por una?; (4) cómo se ve en el asistente de habilidades y en el filtro de la biblioteca.

- ✅ **P99. Habilidad social "Reparar equipo" (idea, 2026-09-21). Decidida y construida el 2026-10-12 (dueño): es un talento (cualquier talento con «repar» en el nombre), sin tirada: 2 despojos por punto, una pieza rota al doble hasta quedar entera; tope de 3 puntos por nivel por día (se renueva con ⏳ Pasar de día); fuera de combate, desde Equipo y mochila. El Óleo reparador vuelve (3 puntos a una pieza dañada, no a una rota). En la tienda, un solo botón de reparar para todo (no por sección).** Lo de abajo, historia: Sumar al pool de habilidades sociales (las que se aprenden con puntos de Inteligencia, junto a las demás) una nueva: gasta **despojos** (loot) para reparar escudos y armaduras — pensada como alternativa a **Oleo reparador** para sacarse Armadura rota (Armadura arruinada se eliminó del repaso de debuffs, 2026-09-21) — y quizás reparar equipo dañado en general, si en algún momento existe ese concepto más allá de ese estado. **Por decidir:** nombre definitivo, cuántos despojos por punto de reparación (o por stack de Armadura rota), si repara Armadura arruinada entera o de a poco, si tiene nivel/tirada como las demás sociales o es un efecto fijo, si tiene cooldown o límite de usos, y si además del gasto de despojos hace falta una tirada.

- ✅ **P100. Las invocaciones no tiran dos veces con Afortunado (bug encontrado 2026-09-22; resuelto 2026-09-30: personaje, invocación y creep tiran un stat con la misma función, `Combatiente.tirarStat` en comun/combatiente.js).** El PJ y los creeps de gm-tools, con el estado Afortunado activo, tiran PdG/Parry/Evasión dos veces y se quedan con la mejor. Las invocaciones (`tirarValorStatInv` en ficha.html) no tienen esa lógica: el estado se puede aplicar pero no hace nada. Falta sumarle el mismo mecanismo (`conVentaja`/doble tirada) que ya tienen los otros dos.
- ✅ **P101. Pajaritos ya está implementado para creeps (arreglado 2026-09-22).** `ESTADOS_PRESET_GM` y `comun/estados-aplicar.js` llevan `mitadPdgEva:true`; `creepStatValor` lo aplica a PdG/Evasión (mismo `floor`) y `FLAGS_ESTADO_CREEP` lo copia al aplicar el preset. Si un creep tiene Pajaritos y Lisiado juntos, el PdG se parte al medio dos veces (igual que en la ficha).

- ✅ **P102. Mecánica de Wildcards (2026-09-22; decidida 2026-10-15).** **Decidido (dueño, 2026-10-15):** al pasar el día el GM elige el descanso:
  normal = 1 wildcard al que no tiene, reparador = quedan en 2; se usan igual que la Moneda Re-Roll (repetir una tirada tuya), pero se gastan
  siempre; cartita 🃏 que gira en el rincón. Ver `docs/reroll.md`. Pregunta original: El contador volvió a la ficha (panel ⭐ Exp y Job, `S.meta.wildcards`/`wildcardsMax`, los dos a mano, sin fórmula ni tope) pero todavía sin ninguna regla de juego. La idea original (de una versión anterior, ver el manual) era un recurso diario para repetir una tirada. **Por decidir:** ¿se usa para eso?; ¿cuántos por día o por descanso; se acumulan?; ¿se puede usar para repetir la tirada de otro jugador?; ¿tiene botón propio en la Botonera (como Afortunado) o queda a mano, tildando el estado?

- 🔲 **P103. Biblioteca abierta a habilidades y personajes de jugador (idea a futuro, 2026-09-22).** Hoy la biblioteca (`comun/biblioteca.js`) sirve para creeps, pasivas, trampas y habilidades de creep — la sube cualquier GM como propuesta y el dueño del proyecto la aprueba. La idea es extender el mismo mecanismo a las habilidades de clase y a personajes enteros creados por un jugador, para cuando el proyecto se abra a más gente que el grupo actual. **Por decidir:** ¿qué tipos nuevos hacen falta (`habs_pj`, `personajes`)?; ¿un jugador propone desde su propia ficha, o sigue siendo el GM el que sube?; ¿qué datos de un personaje tiene sentido compartir (solo la idea/las habilidades, o la ficha completa)?; nada de esto es urgente — es la dirección a seguir cuando se retome el tema.

- ✅ **P104. Ataque de oportunidad (regla establecida, 2026-09-22; costo cerrado 2026-09-27: siempre la MITAD del Tipo del arma, redondeado para arriba, sin sumar al conteo de ataques del turno; ya lo hace el botón Atacar → «de oportunidad»).** Cuando dos fichas de bandos distintos están adyacentes y una se aleja, la otra tiene un ataque de oportunidad: se puede hacer con No2 disponibles y cuesta lo mismo que un primer ataque. El mapa no frena el movimiento ni resuelve la tirada — solo avisa en rojo en la Mesa ("Fulano se alejó de Mengano: posible ataque de oportunidad", `oportunidadEvaluarRuta`/`oportunidadPublicarAvisos` en `vtt-hexgrid/mapa.html`). **Pendiente de diseño** (para cuando se retome): habilidades con más PdG/Evasión en ataques de oportunidad; habilidades que dejan bloquearlos; ¿corresponde también entre aliados en algún caso (PvP), o solo entre bandos distintos como está ahora (reusa `rivalesDe`)?

- ✅ **P105. La zona de alerta del escenario 2, resuelta (2026-09-22): solo cuenta si te quedás parado.** `percepcionEvaluarRuta` (cuando quien camina NO está en sigilo y se acerca a un rival oculto) sigue chequeando la zona **propia de quien camina** (no la fija del oculto que dibuja 👓 — eso se mantiene: importa hacia dónde presta atención quien camina). Lo que cambió: **el cono** (línea de visión directa) se sigue mirando en cada paso de la ruta — cruzarlo delata igual, de paso o no. **La zona de alerta** en cambio ya no acumula pasos: pasar de largo por ahí sin quedarse ya no dispara nada; se mira nomás en la casilla donde termina la ruta, orientada hacia el último paso dado. Antes contaba cada paso de más adentro de la zona (aunque fuera solo de paso), lo que generaba pedidos de tirada que no coincidían con lo que se veía dibujado con 👓. `rotacionDePaso(pa, pb)` nueva (comparte la fórmula que antes estaba repetida en el bucle).

- 🔲 **P106. ¿Qué efectos de ítems y pasivas se muestran como estado alterado y cuáles no? (2026-09-24, dicho por el dueño).** Todavía no se encontró el criterio conceptual. **Por ahora** solo la pasiva de **regeneración** (`regenHp`) aparece entre los estados alterados activos (como estado derivado de solo lectura, `estadosDePasivas` en la ficha, con ✦; también en el resumen que ve el mapa). Los efectos de ítems equipados que ya se muestran (los que llevan `origenItem`, marcados con ⚙) siguen como estaban. Falta decidir la regla general (¿solo lo que tiene HP por turno o duración?, ¿todos los bonos de pasivas?).
- ✅ **P107. Activar una trampa rompe el sigilo (2026-09-24).** Regla dicha por el dueño: un personaje (o creep) en sigilo que dispara una trampa pierde el sigilo. Hecho en `trampaResolver` (mapa). **Descubrir una trampa (sin pisarla) NO rompe el sigilo, pero la trampa se vuelve visible para quien la descubrió** (dicho por el dueño, 2026-09-24; `descubrirTrampa`, por navegador: la ve solo esa persona). Queda abierto si al descubrirla debe verla también su equipo, y si la vista debe depender del resultado de la tirada de percepción (hoy se revela apenas salta el aviso).

- ✅ **P108. Sobrepeso: CERRADA (2026-09-27, dueño):** la regla de abajo queda como está — **el pago de 1 No2 vale solo para esa tirada de Evasión; el sobrepeso solo afecta a la Evasión (no al movimiento ni al Parry/Bloqueo); no se aplica a creeps.** Historial: **P108. Sobrepeso: regla en prueba (2026-09-24, dicha por el dueño).** Si el equipo pesa más que la Crg.Max, aparece el estado derivado **Sobrepeso** (⚖, no se guarda): −1 a la Evasión por cada punto de más, **solo al tirar Evasión**. Al apretar Esquivar (o el 🎲 de Evasión) sale un pop-up: **pagar 1 No2 y tirar sin penalidad**, o **tirar con la penalidad** (`tirarValorStat`, ficha). Reemplaza la regla vieja (−SP máximo). **Por decidir:** ¿el pago vale solo para esa tirada (como está hoy) o para todo el turno? ¿Afecta también al movimiento o a Parry/Bloqueo? ¿Se aplica a creeps? Hoy no.

- 🔲 **P109. ¿Tiene sentido que Sonic Boom se use con Flash en turno ajeno? (2026-09-24, dicho por el dueño).** Por ahora sí: se deja con Flash (SP x 2 = el doble, 4 SP en turno ajeno, a mano). Falta decidir con el grupo si conviene, porque es un cono de control (quita No2 y puede dejar Sentado) que se usaría fuera de turno. Cargada también en las preguntas de las 🛠 Herramientas de diseño.

- 🔲 **P110. Daño en área del Tanque: ¿se esquiva normal o exige dodge roll? ¿Se puede parrear? (2026-09-24, dicho por el dueño).** Por ahora el texto dice que los afectados **pueden** esquivar con dodge roll (a mano); no define si la Evasión común también sirve ni si el Parry puede pararlo. Cargada también en las preguntas de las 🛠 Herramientas de diseño. Se relaciona con el paso 5 de `proceso-casteo.md` (esquivar áreas).

- ✅ **P111. Flash: SIEMPRE cuesta 0 Nitros (decidido por el dueño, 2026-09-27).** Además de poder usarse en turno ajeno, **la skill en sí no cobra ningún No2 adicional**, pero **el movimiento que incluya cuesta sus No2 de siempre** (Takle: 1 No2 por casilla, hasta 2; el dueño lo aclaró el mismo día). Aplicado: Blindaje, Shockwave, Sonic Boom y Takle ya tenían `nitrosCosto: 0`; el texto de Takle lo aclara. *(Sin definir todavía: si el ataque de Takle paga los No2 de un ataque o va incluido en el 0 de la skill.)* *(La skill sin auditar «Parry» del Warrior, «No2 1 + Flash», se audita en su momento: al dueño le parece medio obsoleta.)* Historial: **P111. Flash: ¿siempre significa que no cuesta Nitros, o solo que se puede usar en turno ajeno? (2026-09-24, dicho por el dueño).** La regla general de `clases-borrador.md` dice "Flash = no cuesta Nitros y se puede usar durante el turno de cualquier jugador". Se duda si la parte de "no cuesta Nitros" es parte de la definición o si Flash solo habilita usarla fuera de turno. Afecta a Blindaje, Shockwave, Sonic Boom y Takle (que incluye ataque y desplazamiento). **Ejemplo para pensar el costo — Takle:** Flash, con un desplazamiento de hasta 2 casillas y un ataque con +1 PdG: ¿0 No2 en total, o 2 No2 de movimiento más lo que cuesta un ataque? Cargada también en las preguntas de las 🛠 Herramientas de diseño.
- 🔲 **P112. Peso de cada efecto de arma y fórmula de calidad/precio (2026-09-25, idea del dueño).** Cada efecto de arma (Rompe armadura, Sangrado, Envenenar, Knockdown…) tendría un **peso** según cuán relevante es en combate, para calcular la **calidad y el precio** de un arma y, eventualmente, una mecánica de balance. Hoy `comun/guia-diseno.js` tiene pesos provisorios de 1 a 5. Falta decidir: la escala, cómo suman varios efectos, cómo entran el Tipo/Peso del arma, la rareza y el nivel de la familia (🏠 casa / 🤝 habilitado / ✨ excepcional: ¿un efecto excepcional cuesta más o menos?) y si el resultado sugiere el precio o lo calcula solo.
- 🔶 **P113. Cómo funciona el golpe crítico (regla dicha por el dueño, 2026-09-25; en elaboración).** **Decidido:** quien ataca con un arma tira su probabilidad de golpe (PdG) y el otro tira Evasión; **el crítico lo determina el TIPO del arma: si la diferencia PdG − Evasión es igual o mayor al Tipo del arma, es golpe crítico.** Un crítico **ignora la armadura** en el daño y **además se tira un dado para ver qué otro efecto tiene** (la tabla de efectos la pasa el dueño después). **Choca con lo que hace hoy la ficha y dice el manual** (nota "Golpe crítico": la chance sale del stat **Crítico (Crit)**, de Destreza, con "Crítico +1/+2" en armas y skills): hay que decidir qué pasa con el stat Crit y con esos bonos (¿bajan el umbral? ¿suman a la diferencia?). **Dado del crítico (dicho el mismo día): se tira 1d20 y el resultado da el multiplicador de daño: 7 o más → **doble daño (×2)**; 17 o más → **triple daño (×3)**; 20 → **cuádruple daño (×4)**** (**con menos de 7 no hay multiplicador (×1): solo ignora la armadura; el multiplicador se aplica a TODO el daño del golpe** —dados del arma, bono de Fuerza y cualquier otro bono—, confirmado por el dueño). **Doble crítico (dicho el mismo día): si la diferencia PdG − Evasión es el DOBLE del Tipo (o más), es un doble crítico.** Su efecto: si el defensor tiene equipo que **bloquea un crítico**, ese bloqueo se lleva el primero y **con el segundo se activa el efecto crítico igual** (la Resistencia a crítico funcionaría como "cuántos críticos anula", por Tipo de arma). **Generalización (dicha el mismo día): el nivel del crítico es N = diferencia ÷ Tipo (redondeado hacia abajo); con nivel N se tira el d20 N veces y se queda con el MEJOR dado** (ej.: arma Tipo 4 y diferencia de 8 o más = doble crítico = 2d20, el mejor; 12 o más = 3d20…). La **Resistencia a crítico resta niveles**: el defensor con resistencia R contra ese Tipo se lleva R críticos, o sea que se tira con N − R dados (si N − R ≤ 0, no hay crítico). **Confirmado por el dueño: un punto de resistencia = un nivel menos** (doble crítico contra 1 punto cuenta como crítico simple; crítico simple contra 1 punto no es crítico). **Pendiente:** (a) ya cerrado el dado (queda por ver si el crítico tiene más efectos además del multiplicador); (b) cómo entra la **Resistencia a crítico** (el dueño está por explicar el dilema; hoy es un número por Tipo 4/6/8/10/12 que se acumula en la armadura); (c) después, el peso de la resistencia a crítico y de cada efecto en la calidad/tier/precio de un ítem (P112). Hasta que se cierre, no se cambia el código.
  - ✅ **Resistencia a crítico, corregida (dueño, 2026-11-04: «hubo un error grave a la hora de diseñar la resistencia a los críticos… si alguien tiene resistencia a crítico tipo 4 ×1, para hacerle crítico tienen que hacerle una diferencia de 5, y de 6 si tuviera ×2. Esto cambia todos los cálculos del juego»)**: cada punto de resistencia **suma 1 al rango** del crítico, en cada nivel (Tipo 4 ×1: 5, 10, 15…), y ya no resta niveles. Con el Crítico frecuente se compensan punto por punto y el mínimo de 2 va al final: rango = Tipo − frecuente + resistencia, mínimo 2. Hecho en `comun/critico.js` (lo usan el duelo, la calculadora y el simulador). Queda rehacer los balances que contaban con la regla vieja (la tabla de máximos de `guia-de-diseno.md`, los simuladores y reportes de encuentros).
- 🔶 **P114. Escasez de la Resistencia a crítico por slots (idea del dueño, 2026-09-25; en elaboración).** **Dilema:** las resistencias a crítico de Tipo alto tienen que ser MUCHO más escasas que las de Tipo bajo (Res. Tipo 10 ≪ Res. Tipo 4), pero sin volver a nadie inmune a los críticos. **Idea:** regularlo por **slots elegibles**: cada Tipo de resistencia solo la pueden dar ciertos slots de equipo, así el máximo que se puede juntar equipado queda limitado por diseño. Ejemplo del dueño: **Tipo 10 solo en cascos** (un solo ítem equipado a la vez, pocos cascos y de buena calidad); **Tipo 8 en solo dos slots (y no el casco)**; **Tipo 6 en solo tres slots**; **Tipo 4 compartido en más slots** ("tipo 2" fue un error de tipeo: **no existe**, los Tipos son 4, 6, 8, 10 y 12). Falta definir: qué slots exactamente, qué pasa con el **Tipo 12**, y el balance (con el nivel de crítico N = diferencia ÷ Tipo, un máximo de resistencia R alto anula los críticos de ese Tipo). **Datos del catálogo hoy** (`tipo1`=Tipo 4 … `tipo5`=Tipo 12, ítems con esa resistencia por slot): Tipo 10 en cabeza 4, armadura rígida 8, piernas 2, pies 3, manos 3, escudos 2, anillos 1; Tipo 12 en 7 ítems (cabeza 2, manos 2, piernas 1, pies 1, armadura rígida 1). Aplicar esta regla obligaría a auditar y reubicar esas resistencias. Sigue la convención suave por rareza de la nota "Resistencia a crítico" del manual.
  **Anillos (aclaración del dueño, 2026-09-25):** los anillos son **mágicos y de a uno por mano (2 slots, como ya limita la ficha: `max: 2`)**. Dan **más libertad** de efectos, pero tienen que ser **más escasos y caros** que el resto del equipo. Todo esto son **preceptos para un futuro rework completo del catálogo** (el dueño va dando líneas cada vez más específicas).
- ✅ **P115. Dos formas de mejorar el crítico (dicho y cerrado por el dueño, 2026-09-25).** Se diseñan armas, ítems y skills con dos palancas, con estos nombres: **(1) Crítico FRECUENTE (frecuencia)**: baja el "rango" del crítico, o sea el número contra el que se compara la diferencia PdG − Evasión (un arma Tipo 4 con crítico frecuente ×1 hace crítico con diferencia 3 y **doble crítico con diferencia 6**; el **mínimo siempre es 2**). Como cambia el valor de referencia, cambia también el nivel N = diferencia ÷ rango. **(2) Crítico POTENTE (potencia)**: baja el umbral del d20 para los multiplicadores (ej. doble daño con 6+ en vez de 7+). **En principio baja TODOS los umbrales juntos** (7→6, 17→16, 20→19); si hiciera falta afinar, se puede jugar con que baje uno y no otro. Los nombres definitivos son **frecuencia** y **potencia** del crítico: todo va a estar explicado en las herramientas (Guía de diseño, ítems y skills). **Vocabulario fijado:** **doble crítico** = la diferencia es el doble del rango: el crítico se activa dos veces (2d20, vale el mejor); **doble daño / triple daño / cuádruple daño** = el multiplicador que da el d20 (×2 / ×3 / ×4). **Skills existentes que ya lo tocan:** "+1 al crítico" (Lisiar, Tajear, Degollar, Headshot, Apuntar…) pasa a ser **Crítico frecuente**; "crítico mejorado" (Headshot) pasa a **Crítico potente**. **Decisiones del mismo día:** (a) **el mundo del crítico corresponde a las armas de Tipo 4 y 6** (punzantes y cortantes): **las de Tipo 4 tienen como universo el Crítico FRECUENTE y las de Tipo 6 el Crítico POTENTE** (cambio de opinión del mismo día; **ambas familias juegan con las dos herramientas, pero con ese acento**: un Tipo 4 usa más frecuente y algo de potente; un Tipo 6, más potente y algo de frecuente; y pueden aparecer en otras armas). Las pesadas (Tipo 8+) quedan para sus efectos de casa (Rompe armadura, Knockdown…). (b) **Cómo baja cada umbral con Crítico potente ×P (dicho por el dueño, 2026-09-25):** **doble daño 1 a 1** (7 − P); **triple daño 1 a 2** (baja 1 cada 2 puntos: 17 − P÷2, hacia abajo); **cuádruple daño 1 a 3** (baja 1 cada 3 puntos: 20 − P÷3, hacia abajo). Ejemplo: P=1 → 6 / 17 / 20; P=2 → 5 / 16 / 20; P=3 → 4 / 16 / 19; P=4 → 3 / 15 / 19; P=5 → 2 / 15 / 19; P=6 → 1 / 14 / 18. **Piso (confirmado por el dueño):** el umbral del doble daño llega como mínimo a **1** (con el d20 siempre hay doble daño); **seguir sumando puntos de potente sigue bajando los otros umbrales, cada uno a su propia escala** (triple 1 cada 2 puntos, cuádruple 1 cada 3). Ejemplos: P=8 → 1 / 13 / 18; P=12 → 1 / 11 / 16. (c) **Los estados de crítico (frecuente y potente) se pueden dar tanto a otros como a uno mismo.** (d) Aprobadas por el dueño las skills **Punto débil** (Debuffer) y **Temple** (Tanque). **Pendiente:** un set corto de skills que definan la regla (propuesta del asistente, a auditar por el dueño) y cargar la mecánica en la ficha y el mapa.
- 🔶 **P116. Armas mágicas y armas para mago (dicho por el dueño, 2026-09-25; en elaboración, "vamos por partes").** Hoy el catálogo casi no tiene (solo el Báculo mágico es realmente mágico; los otros bastones son físicos). **División decidida: armas mágicas de DAÑO y armas mágicas de EFECTO.** **Armas de efecto:** dan **pequeños efectos mágicos / pequeños hechizos que se castean con el arma**, tiran **probabilidad de golpe mágico** (Hechizo: PG con Especial) y se pagan **generalmente con 1 Nitro (No2) y SP según el efecto**. **Aclaraciones del mismo día:** un arma de efecto lleva **uno o más efectos, escalando con la calidad y la potencia** de los efectos; **no se diferencian necesariamente de las skills de Mago**: un buen arma de mago puede tener efectos potentes; **1 a 3 SP es un costo barato**. **Aporte de Seba (amigo del dueño, consultado sobre cómo encarar esto):** las armas mágicas, aunque tengan efectos parecidos a hechizos (como un proyectil mágico), **no usan SP pero SÍ escalan con ataques sucesivos en un turno** (como una arma física); ejemplos: **Varita de heal** (útil para llevar en la mano izquierda), **Varita de translocación** (mueve una unidad 2 o 3 espacios; tira Res. mágica), **Varita de hongo venenoso** (deja un hongo, no es invisible, es gratis); "y así, podés hacer lo que se te ocurra". **CONTRADICCIÓN a resolver:** el dueño había dicho "1 Nitro + SP según el efecto" y Seba propone "sin SP, con costo que escala por ataque sucesivo": falta decidir cuál rige o cómo se combinan. **Armas de DAÑO — el mínimo (dicho por el dueño el mismo día):** lo más básico es una **Varita de proyectil mágico** (un arma mágica **común, de calidad baja**; no es un buen arma, es el piso): **1d4 de daño directo a la vida** (ignora la Defensa), cuesta **1 Nitro y nada de SP**, y tira **probabilidad de golpe mágico contra Evasión**. (Para comparar: el Chispazo de la clase Mago es T4 P1 que ignora armadura, SP 1 y No2 3.) **Escala de calidad de la varita (mismo día):** una Varita de proyectil mágico de **buena calidad** cuesta lo mismo (**1 Nitro**, sin SP) pero hace **1d6** en vez de 1d4 (misma idea: la calidad sube el dado del daño con el mismo costo). **Cambio de Chispazo (mismo día):** la skill **Chispazo** de la clase Mago pasa de SP 1 / No2 3 / T4 a **SP 1 / No2 1 / T6 (1d6)** para equipararla a la varita de buena calidad ("3 Nitros por un d4 es carísimo"); queda **marcada a auditar** (el dueño la va a revisar con sus colegas). **Regla de diseño del daño mágico (mismo día): no existe la "defensa mágica"; el daño mágico va directo a la vida.** Las skills que hacen daño mágico con el Especial como daño **tienen que ser muy caras**; la alternativa equilibrada es un efecto que **use el Especial del usuario para calcular la potencia pero haga daño FÍSICO** (ej.: estalactita de hielo), de modo que la armadura del defensor sí cuente. Skills de Mago a revisar con este criterio (además de Chispazo, ya rebalanceado): Rayo Mágico, Orbe arcano, Tormenta arcana y Ráfaga arcana. **El SP como palanca de balance de la magia (mismo día):** quienes se enfocan en magia tienen **bastante SP al inicio del combate** y, por las reglas del juego, una **regeneración de SP mayor que el promedio** (la regeneración base depende del Especial, hoy "en definición"). Por eso el SP es un **buen regulador**: cobrar SP en los efectos mágicos equilibra lo que pueden hacer, mientras que los Nitros (escasos para todos) se reservan como costo más pesado. (Aclaración: en el dictado "LSP"/"LCP" era "el SP", no una sigla.) **Tipos de daño mágico (mismo día):** **Arcano** = el daño más puro, **sin efectos adicionales y directo a la vida**. **Elementales, por ahora tres: fuego, hielo y rayo** (el dueño acepta sugerencias). Los elementos también abren **espacio de diseño en el equipo defensivo** (resistencias o protecciones elementales). **Sugerencias del asistente (a aprobar):** cada elemento con su efecto de casa ya existente en el juego: **fuego → Prende fuego** (daño por turnos), **hielo → Escarcha** (−1 No2 máx.), **rayo → Stun/Aturdir** (sin No2); candidatos futuros: **ácido → Rompe armadura**, **veneno → Veneno**, **sagrado** (ya hay "holy" en Smite) y **sombra/sangre** (Drenar vida). **Efectos de los elementos (mismo día):** **hielo = Escarcha** (−1 a los No2 máximos), confirmado. **Rayo = Parálisis** (nuevo debuff): más suave que un Stun; **una mezcla de Lisiado y Pajaritos: corta a la mitad los tres stats que cubren esos dos (PdG, Parry y Evasión)**; se aplica una sola vez a cada stat (no se acumula con Lisiado ni Pajaritos). **Fuego (definido en principio, mismo día): trabaja en ÁREA y deja el terreno INCENDIADO** (no es un daño por turnos sobre la víctima, que sería igual a Veneno o Sangrado): p. ej. una **bola de fuego (flor)** o una **llamarada (cono)**; el terreno incendiado sería una forma del mapa con turnos. **Escarcha pasa a ser ACUMULABLE**: el personaje "se va congelando" con cada stack (hoy es un solo −1 No2 máx.). **Fuego y hielo se cancelan entre sí.** Falta definir: cuánto quita cada stack y qué pasa al llegar a cierto número de stacks (¿congelado del todo?), y cómo se cancelan en detalle (¿un golpe de fuego quita stacks de Escarcha? ¿el hielo apaga el terreno incendiado?). **El peso como palanca de balance de las armas mágicas (mismo día):** también se juega con el **peso**: una **varita pesa 1**, un **báculo puede pesar mucho**. El peso del arma debe tener **relevancia INTERMEDIA como drawback** (ni baja ni alta; el dueño aclaró que no es baja) — ver la tabla de relevancias en `docs/guia-de-diseno.md` §0b, porque el Sobrepeso hoy es un castigo moderado (P108: −1 a la Evasión por punto de más al tirar Evasión, o pagar 1 No2). **Pendiente:** (a) el resto de las armas de daño (cómo escalan sobre esa base y se equilibran contra las físicas); (b) cómo se elige el efecto al castear cuando el arma tiene varios y cuál es la regla de costo (SP, Nitros escalados, o ambos); (c) qué mecánicas nuevas piden los ejemplos de Seba (mover unidades a la fuerza 2–3 casillas con tirada de Res. mágica, mano izquierda/off-hand, un hongo visible que se deja en el mapa —ojo: la palabra "trampa" es solo para colocar trampas ocultas—); (d) el peso de cada efecto en calidad y precio (P112) y la libertad creativa de efectos con un balance equiparable al de las armas físicas.
- 🔶 **P116 (actualización, 2026-09-25): estados de los elementos ya creados.** Se crearon **Escarcha acumulable** (stacks, −1 No2 máx. por stack, renueva la duración), **Parálisis** (PdG, Parry y Evasión a la mitad, una vez por stat) y el **Terreno incendiado** del fuego (forma del mapa con daño 5 editable, al entrar y en cada Mantenimiento, directo a la vida). **Falta:** que fuego y hielo se cancelen solos (hoy a mano), cuánto quita cada stack de Escarcha al llegar a muchos stacks (¿congelado?), y colocar el fuego desde una skill (bola de fuego en flor, llamarada en cono).
- 🔶 **P117. Armas híbridas: físicas con efectos y daño mágico (idea del dueño, 2026-09-25, para el rework del catálogo).** Puede haber **armas de tier alto con efectos mágicos** que además **suman daño mágico** con los efectos ligados al **tipo de daño mágico** (arcano, fuego, hielo, rayo: ver P116). Son **armas híbridas** y tienen que ser **raras como mínimo, si no excepcionales o legendarias** (nunca comunes ni de buena calidad). Al calcular su calidad y precio (P112) hay que sumar lo físico (Tipo, Peso, crítico, efectos de familia) y lo mágico (daño mágico directo a la vida, efecto del elemento, costo en Nitros y SP), con los Nitros como recurso muy preciado.
- ✅ **P118. Efecto de cadena del rayo (dicho por el dueño, 2026-09-25; regla cerrada).** El **daño de rayo** puede **saltar de un personaje a otro**: **hasta 3 casillas de distancia** del último golpeado, **una sola vez por objetivo**, y **cada salto hace la mitad del daño del anterior, redondeado hacia abajo** (cambiado por el dueño el 2026-10-07: «salta tantas veces como le permita el número»: 8 → 4 → 2 → 1; el salto que llega con 1 es el último; vale para todo el rayo: armas, habilidades, la ⚡ del token y la Descarga eléctrica; antes, hacia arriba). Implementado como **⚡ Rayo en cadena** en "Recibe daño" del token (mapa): el daño va **directo a la vida** (magia, sin Defensa) y salta al **más cercano** de los del **mismo bando** que el primer golpeado (los rivales de quien lanza el rayo), hasta que no quede nadie a ≤ 3 casillas; aplica solo lo que ese cliente puede (creeps si es el GM, sus propios personajes) y avisa en la Mesa el resto para aplicarlo a mano. Pendiente: que una skill o arma de rayo lo dispare sola; si alcanza a aliados; su peso en calidad y precio (P112).
- 🔶 **P116 (actualización, 2026-09-25): el hielo y el rayo NO aplican siempre Escarcha y Parálisis.** Son dos debuffs muy poderosos, así que el daño de hielo y de rayo tiene sus **propias características** y **un porcentaje de probabilidad de aplicar** Escarcha o Parálisis (no una regla fija). Así esas armas y skills se pueden usar **con más frecuencia o pagando menos costo**. Esos estados **valen mucho al cotizar**: en recursos (Nitros, SP), en skills, y en dinero y rareza de ítems y armas (P112). Idea de implementación: reutilizar el sistema de **efectos al golpear con probabilidad** de las armas (50 % = moneda, 25 % = d4…).
- ✅ **P115 (corrección, 2026-09-25): se invierten las casas del crítico.** Dueño: "Vamos a revertir las casas: que las de **Tipo 6** sean **Crítico frecuente** y las de **Tipo 4** sean **Crítico potente**." → **Tipo 6 (cortantes) acentúa el Crítico FRECUENTE; Tipo 4 (punzantes) acentúa el Crítico POTENTE** (siguen pudiendo llevar las dos herramientas). Encaja con la regla del rango: un Tipo 4 solo aprovecha 2 puntos de Frecuente, un Tipo 6 hasta 4.
- ✅ **P116 (regla, 2026-09-25): el daño mágico no hace crítico.** Arcano, eléctrico y de fuego no critican; solo critican los ataques físicos (aunque salgan de un hechizo, como una estaca de hielo). Ver guía de diseño §0.

- ⏸ **P-Explosión (en pausa, 2026-09-26).** Definición del efecto Explosión (Tipo 12) — 2026-09-26.** El T12 es exclusivamente del efecto Explosión (regla del dueño). Falta definir: **(a)** radio (propuesta: flor de radio 1; radio 2 solo en las legendarias), **(b)** cuánto daño recibe el área (propuesta: la mitad del golpe, sin tirar de nuevo), **(c)** si el objetivo principal recibe el golpe completo (propuesta: sí), **(d)** fuego amigo (propuesta: alcanza a todos, aliados incluidos), **(e)** probabilidad (propuesta: siempre, es el efecto del arma), **(f)** si se automatiza el área en el mapa (propuesta: sí, con la flor de la trampa) o queda a mano. Mientras tanto las 5 armas dicen «daño del área a confirmar». Además: qué hacer con **Lanzallamas** y **Martillo del Titán** del catálogo.

  *Pausada por el dueño: el mundo T12 no se inventa hasta que esté consolidado el resto. Martillo del Titán quitado; Lanzallamas Excepcional; tanda 6 retirada.*

- ⬜ **P-Duelo. Ataque paso a paso en vivo entre atacante y defensor — 2026-09-26.** Idea del dueño: al atacar se elige el token objetivo y se abre un menú compartido donde ambos ven y tiran cada etapa (PdG vs Evasión, Parry, Bloqueo, crítico y su resistencia, daño y defensa, efectos), con aviso al defensor y cada paso bien visible. Propuesta y 8 preguntas en [`ataque-paso-a-paso.md`](ataque-paso-a-paso.md).
  *P-Duelo, avance 2026-09-26:* decididos defensor ausente (GM tira por él), efectos con botón «Aplicar», 1 contra 1 primero y hacerlo ya. **Nueva pregunta P-Duelo-efectos:** cada efecto de golpe lleva «se aplica solo si hace daño / aunque no pase»; los valores por defecto propuestos están en `ataque-paso-a-paso.md` (falta confirmar).

- ✅ **P-Empate. Empate de PdG contra Evasión — decidido 2026-09-26.** Regla del dueño: si empatan y **solo una** de las dos tiradas lleva un «+» fijo (el +1 de los stats impares), **gana la que NO lo lleva**; si las **dos** lo llevan (o ninguna), se resuelve con **par o impar**: cualquiera de los dos elige, **el primero que elige decide**, se tira un dado (d6) y gana el que acierta. Automatizado en `comun/duelo.js` (estado `empate`). Interpretación a confirmar: «lleva +» = la tirada tiene un bono fijo mayor que 0.

- ✅ **P-Duelo-defensa. Etapa 2 del duelo: Evasión / Parry / Bloqueo desde el defensor — decidido 2026-09-26.** Elige la defensa a ciegas (antes de ver el PdG); Parry ganado + Bloqueo perdido = pasa la mitad del daño y se gasta 1 punto de durabilidad (ver P-Durabilidad); **el crítico contra un Parry se calcula igual que contra Evasión, con el Parry**; **el contraataque solo se ofrece si se gana el Bloqueo**; **sin tiempo límite** para elegir la defensa. Detalle en `ataque-paso-a-paso.md`.

- 🔶 **P-Durabilidad. Durabilidad de armas, escudos y armaduras — 2026-09-26 (reglas casi cerradas).** Decidido: 3 puntos por Peso (mínimo 3), se gasta 1 al perder el Bloqueo (mitad del daño, redondeo hacia arriba) y con Rompe armadura (nunca con crítico; pieza al azar entre las equipadas), aviso al quedar en 1, no se repara en combate (Óleo reparador —ya no de cinturón—, herrero y talentos con despojos), creeps sin durabilidad pero Rompe armadura les baja la Defensa. Confirmado: al llegar a 0 la pieza queda rota; Armadura rota sigue para todos; Parry sin perder el Bloqueo no gasta durabilidad. Faltan: cómo conviven Armadura rota y la durabilidad de la pieza, y el Peso 0 de armas y escudos (precios de reparación decididos: herrero 1 de oro por punto, talento 2 de despojos por punto; el Óleo en stand-by) en [`durabilidad.md`](durabilidad.md).

- ✅ **P-Grupos-mapa. Los tokens de un mapa y los creeps del grupo de gm-tools tienen que ser lo mismo — 2026-09-26.** **Resuelta (2026-10-02, pedido del dueño: «los grupos en realidad son mapas… un creep en un grupo es como una piedrita»): cada creep está en UN mapa (`sc.mapa`, `comun/creeps-mapas.js`) o en la Reserva; las pestañas de GM Tools son los mapas; «🗺 Mover a…» lo muda con su token; vincular en el mapa un token a un creep de otro mapa lo muda a ese mapa; los grupos viejos se convirtieron solos (con token → el mapa del token; vinculado → su mapa; si no, un mapa nuevo con su nombre). Se sacaron los grupos, el vínculo grupo↔mapa (`gm/gruposMapas`) y el arrastre. Decisiones del dueño: al mover un creep, su token se muda; un grupo sin mapa pasa a ser un mapa vacío.**

- ⬜ **P-Ficha-mapa. «Ficha light» de los jugadores dentro del mapa — 2026-09-26.** Idea del dueño: que el 📜 del token propio abra una **versión liviana de la ficha** en el mapa, que sea un **menú de botones** (no un gran despliegue de información) y que **cada módulo conceptual se abra en su propia ventana emergente**: Botonera, Equipo y mochila, Habilidades, Estados, (Atributos y stats), Tienda y Botín cuando corresponda, y un botón **«Ver ficha completa»** que la abre en otra pestaña. **Es viable y de riesgo bajo** porque la ficha ya sabe abrirse en el mapa como iframe con ventanas sueltas (Botonera, Equipo, Botín, Tienda y Estados ya tienen su mensaje); falta el menú-hub y, para lo que hoy no tiene ventana propia (Atributos, Pasivas, Sociales, Notas), ventanas nuevas de solo lectura. Preguntas: (1) qué módulos entran; (2) si el hub muestra arriba un resumen chico (nombre, nivel, vida/SP/No2, Defensa); (3) si al GM le sirve el mismo hub para los creeps (hoy ve la ventana «Ver»); (4) si se puede editar desde esas ventanas o algunas son solo de lectura.

- ✅ **P119. Fórmulas de daño variable en el duelo de habilidades (2026-09-27, salió al auditar Rayo Mágico; resuelta el mismo día auditándolo paso a paso).** El duelo de habilidades (`comun/duelo.js`, `hab.dano.formula`) tiraba siempre una fórmula fija por habilidad. **Método encontrado:** mismo criterio que ya usa el modo "ataque con mi arma, con arreglos" para su X (`dadosPorX`/`fijoPorX`, resuelta ANTES de crear el duelo, en el momento de pagar el costo) — se sumó `duelo.danoFijoPorX` (cuánto suma la fórmula por cada punto de X) al 🎯, visible solo si la habilidad ya tiene costo variable (`cfg.costoVariable`, derivado de `spVariable`/`nitrosVariable`); `habDueloDe(it, xSp, xNitros)` arma la fórmula final (`base + danoFijoPorX * X`) con la X que ya se eligió en `#scrim-costox`, justo antes de crear el duelo — no hace falta que el duelo mismo sepa nada de X. **Rayo Mágico** quedó auditada con esto (`danoFijoPorX: 2`). **Simplificación consciente (b) elegida:** el tope "X no puede ser mayor a Especial" queda ✋ a mano (no hay un límite por habilidad todavía — ver el placeholder general `IT2.limiteXSp`, sin confirmar); no se armó una fórmula con dados extra por X (`danoDadosPorX`), solo el caso fijo, ampliable si alguna skill lo necesita. (c) Las demás skills de casteo con X se resuelven de a una si hace falta, con este mismo mecanismo ya construido — no hacía falta una pasada masiva.

- ✅ **P121. ¿Las invocaciones y los creeps también deberían perder el Parry sin arma ni escudo? — 2026-09-28,
  resuelta el mismo día.** Sí, la misma regla: el dueño confirmó "invocaciones y GM Tools van a seguir las
  mismas reglas". Se sacó Parry del combate de una invocación (`ficha.html`, cuando `!inv.armaNombre`) y de un
  creep (`gm-tools.html`, cuando `!sc.armaNombre`), tanto de su fila de combate propia como del menú "Elegí
  cómo te defendés" del duelo — un arma natural (garras, colmillos…) puesta en `armaNombre` sigue contando
  como arma, así que esos creeps no pierden Parry. **Cambiado el 2026-09-30 (dueño):** un arma natural ya NO da Parry ni Bloqueo, por ahora; un escudo sí (ver P127).

- ⏸ **P120. Reglas de arma de rango, pendientes — 2026-09-27 (auditando la clase Shooter).** Al llegar a la clase **Shooter** en `docs/clases-borrador.md`, la mayoría de sus 10 skills piden mecánicas que todavía no existen en el juego: **cooldown de arma para personajes** (Acelerado — hoy el cooldown solo existe en las habilidades de creep), **reaccionar a un ataque entrante con un disparo propio** (Parry a distancia), **un ataque normal (no hechizo de área) que pegue a más de un objetivo** (Proyectil perforante, Disparo múltiple — el sistema de área en cascada de `comun/duelo.js` hoy es solo para habilidades tipo hechizo), **una marca sobre el objetivo que da bono mientras lo ataques** (Marcar — `efectoMods` de hoy siempre es sobre quien lo tiene, no "bono contra X"), y **línea de tiro esquivando obstáculos** (Tiro con comba). El dueño decidió **dejar Shooter en pausa entera hasta definir las reglas generales de arma de rango** (el módulo "Reglas del tiro" al pie de `clases-borrador.md`, hoy solo la fórmula vieja del PDF con 1d20 y distancia máxima = DES, sin uso real en el juego) — de ahí probablemente salgan resueltas varias de estas mecánicas de una. **Solo 2 de las 10 cerraban limpio con lo que ya existe** (Enfocado con `duelo:{modo:'arma', arma:{fijo:2}}`; Headshot igual salvo la salvedad "falla si no es crítico", que no se puede automatizar) y una a medias con precedente (Apuntar, como Cañón Vasco: cobra No2/SP variable pero el bono en sí queda a mano) — no se cargó ninguna todavía, para no auditarlas a medias antes de la base. Se sigue con **Support** mientras tanto.

- ✅ **P122. ¿Habilidades de jugador y de creep deberían ser un solo tipo de elemento? — 2026-09-29 (paso 0e de
  `docs/plan-subida-unificada.md`), decidida el mismo día.** Al escribir las plantillas quedó a la vista que son casi iguales: comparten
  nombre, descripción, costos, tirada, efecto propio, trampa y la Ejecución completa; el creep suma cooldown,
  "habilidad lenta" y el estado que deja al golpear, y el jugador suma HP de costo, zona/portal y etiquetas.
  **Decidido (dueño): sí, un solo tipo, con una condición** — mientras los creeps paguen con cooldown y los
  jugadores con SP (ver P125), **cada habilidad tiene que dejar bien claro y a la vista para quién es y con qué se
  paga**: marca `para: 'jugador' | 'creep'` en la habilidad, y en la lista, el detalle y al agregarla una etiqueta
  visible (🧙 Jugador · SP / 🐾 Creep · cooldown). Usar una de creep en un personaje (o al revés) se avisa, no se
  bloquea (esencia sandbox).

- ⬜ **P125. ¿Los creeps pasan a pagar sus habilidades con SP, como los jugadores? — 2026-09-29.** Hoy los creeps
  usan cooldown como costo para simplificar el trabajo del GM; el dueño lo está evaluando a nivel diseño del juego.
  Si se unifica (todos con SP), la marca `para` de P122 deja de separar recursos y una habilidad sirve igual para los
  dos. Mientras tanto, la distinción tiene que quedar visible.

- ✅ **P123. ¿Una sola forma de trampa? — 2026-09-29 (paso 0e), decidida y hecha el mismo día.** Había dos: la del mapa
  ("Trampas guardadas": forma, color, daño, estado, zona que deja) y la que coloca una habilidad (`trampaColocar`: radio,
  cantidad, daño, estado). **Decidido (dueño): unificarlas.** La de la habilidad usa la forma del mapa más `cant`
  (`Plantillas.trampaDesde`/`radioDeTrampa` en `comun/plantillas.js`; las viejas se traducen solas al leerlas). El
  asistente de trampas en una habilidad tiene ahora los mismos pasos que en el mapa (forma flor o línea, color, zona que
  deja al dispararse, cuánto dura) **salvo el teleport** (su destino se marca con un clic en el mapa) y la forma libre
  (se pinta a mano). Una trampa del catálogo elegida desde una habilidad conserva su estado, su color y su zona.

- ✅ **P124. Ítems subidos por jugadores: ¿viven en Firebase o van al catálogo de GitHub? — 2026-09-29 (paso 0e), decidida el mismo día: en Firebase; y además se simplificó todo el circuito del catálogo (ver `docs/plan-subida-unificada.md`, paso 5).**
  La decisión 4 del plan dice "lo subido vive en Firebase"; el catálogo de ítems hoy vive en `datos/catalogo.json`
  (rama `main`, Excel, `importar_json.py`, catálogo copiado adentro de los HTML). **Propuesta**: los ítems subidos
  viven en Firebase igual que el resto (disponibles al instante, sin token), con id `usr-<slug>`; el catálogo de
  GitHub queda como "de fábrica" y cada tanto una conversación pasa a él lo aprobado. Se decide en el paso 5.
- 🔶 **P126. Talentos (antes "habilidades sociales") e Inteligencia — 2026-09-30, regla fijada, mecanismo abierto.** Dueño:
  "La inteligencia arranca con 6 puntos. Se puede invertir un punto de inteligencia en cargar un talento. Por cada un punto
  de inteligencia se suman dos puntos de los talentos [= 2 caras del dado]. Eso por default. Pero hasta que terminemos de
  definirlo, dejemos que cada jugador pueda gestionar sus propios puntos… Establezcamos la regla, pero dejemos libre el
  mecanismo por ahora." → **Regla:** Inteligencia 6 + 3 por nivel del personaje (confirmado); 1 punto invertido = +1 nivel
  del talento = +2 caras del dado (d2, d4, d6…); tirada 1d(nivel × 2) + Inteligencia sin invertir; +1 nivel gratis por
  tirada máxima. **Mecanismo libre:** el total de Inteligencia se edita a mano (ya existía) y cada talento se ajusta a mano
  con **± Nivel → ✎ A mano** (Inteligencia invertida y niveles extra, para arriba o para abajo; avisa si se invierte de
  más, no bloquea). En pantalla se llaman **Talentos** (los datos siguen en `S.sociales`). **Queda por definir:** el
  catálogo de talentos, Carisma/Persuasión/Intuición y cómo cerrar el mecanismo (ver "A desarrollar").
- ✅ **P127. El peso del arma en el Bloqueo: ¿mínimo 1 para creeps e invocaciones? — 2026-09-30, resuelta el mismo día.** Regla del dueño: **Parry y Bloqueo solo con un arma o un escudo**; sin nada no hay opción, y **un arma natural tampoco** (garras, colmillos: circunstancial y narrativo, se evalúa más adelante). El caso "sin arma" desaparece: el Bloqueo suma el peso del arma o escudo con el que se para (`Combatiente.armaParaDefensa`). Pregunta original:
  El Bloqueo es tu Bloqueo + el Peso del arma, y esa suma es el dado (igual en los tres). Diferencia encontrada: al
  **personaje** sin arma se le suma 0 y con un arma de Peso 0, 0; a un **creep** o una **invocación** se le suma **como
  mínimo 1** (`pesoArmaCreep`/`pesoArmaInv`: `Math.max(1, armaPeso)`), aunque no tenga arma. Lo mismo pasa en la
  Fuerza del golpe de un creep. ¿Cuál vale para todos: 0 sin arma (como el personaje) o mínimo 1? Hasta decidirlo quedan
  como están.
- ✅ **P128. Bloqueo sin Parry — 2026-09-30, regla y concepto del dueño.** El Parry (Destreza) es interceptar el arma del
  rival con tu arma o escudo; si sale, el Bloqueo (Fuerza + pesos) es aguantar el golpe. **No hay Bloqueo sin Parry** (salvo
  un contexto especial que se diseñe más adelante). En personaje, invocación y creep el botón de Bloqueo se ve siempre,
  apagado y con lo que tirarías (para decidir entre Parry y Evasión), y se habilita recién después de un Parry, con la
  misma arma o escudo (`Combatiente.BLOQUEO_SOLO_TRAS_PARRY`). En el duelo ya era así.
- ✅ **P129. ¿El bono a Parry/Bloqueo de un escudo cuenta solo cuando parás con ESE escudo? — 2026-09-30, resuelta el mismo día: SÍ, "cada uno con lo suyo"** (dueño). En la ficha, `statParaArma` ya no suma al Parry/Bloqueo los bonos de OTRA arma o escudo en mano; los botones y el duelo muestran la tirada de cada uno ("Espada 1d2 · Escudo 1d3"). Los creeps y las invocaciones tienen una sola defensa (arma, o escudo si no hay arma) y siguen sumando todo su equipo: pendiente si alguna vez llevan arma y escudo a la vez. Pregunta original: Surge del
  espacio de diseño de escudos ("un escudo con +1 al Parry, otro con +1 al Bloqueo", ver `guia-de-diseno.md`). Hoy, en la
  ficha, el bono de un **arma** solo cuenta cuando se usa esa arma (`statParaArma`), pero el de un **escudo** cuenta para
  **cualquier** Parry o Bloqueo: con espada y escudo +1 Parry, parar con la espada también suma el +1 (y el +1 Parry de la
  espada NO cuenta al parar con el escudo). Propuesta: que cada uno cuente solo con lo suyo (el escudo al parar con el escudo,
  el arma con el arma), igual que el PdG y el Crítico de cada arma.
- ✅ **P130. "Forzar Nitros máx. a N": ¿tope o fija el máximo? — 2026-09-30, resuelta el mismo día: es un TOPE** (dueño). Solo
  puede bajar el máximo de No2, nunca subirlo (para subir están Hypeado o un bono a Nitros). Diferencia encontrada al unificar
  (paso 1 de la consolidación): creeps e invocaciones ya lo tomaban como tope; el personaje lo tomaba como "fijar" y un estado
  armado a mano con N más alto le subía el máximo. Ahora los tres usan `Combatiente.nitrosMax`.
- ✅ **P131. Un estado sin turnos y sin marcar "permanente" (dato a medio cargar) — 2026-09-30, resuelta: hace su efecto una vez y se
  va en el próximo pase de turno** (dueño). Diferencia encontrada en el paso 2 de la consolidación: el personaje lo dejaba para
  siempre (como permanente) y el creep lo borraba. Ningún estado de fábrica ni de ítems equipados cae en este caso; solo uno
  armado a mano sin turnos. Regla en `Combatiente.pasarTurnoEstados`. De paso: un estado con 0 stacks se termina en los tres.
- ✅ **P132. Un estado que ya tiene y que no se acumula — 2026-09-30, resuelta: SE RENUEVA** (dueño). Queda uno solo, con los
  números nuevos (turnos, bonos, escudo). Veneno, Sangrado, Escarcha y Armadura rota siguen con su regla de acumular. Diferencia
  encontrada en el paso 2 de la consolidación: lo que llegaba a un creep desde una habilidad o trampa ya renovaba, pero el
  "+ Estado" a mano (personaje, invocación, creep), el formulario completo y lo que le llegaba al personaje dejaban dos iguales.
  Los estados que da un ítem equipado no se renuevan (el de a mano va aparte). Regla en `Combatiente.agregarEstado`.
- ✅ **P133. Qué se cobra al usar una habilidad — 2026-09-30, resuelta: LO QUE LA HABILIDAD TENGA CARGADO, SEA DE QUIEN SEA**
  (dueño). Antes cada uno pagaba distinto: el personaje SP + No2 + vida (y algunas curaban), el creep No2 + cooldown (y cura),
  la invocación No2 + cooldown, sin vida ni cura. Ahora creeps e invocaciones también pueden costar vida (campo "Vida (HP) que
  cuesta" en su editor y en el paso Costo de la ✨ Ejecución, que antes se mostraba y no se guardaba) y curar; hace falta que
  sobre vida después de pagar ("Sin vida"). El SP sigue siendo solo del personaje; el cooldown, de creeps e invocaciones.
  Regla en `Combatiente.bloqueoHab` / `costoNitrosHab` (paso 3 de la consolidación).
- ✅ **P134. Ataque con arma, Flash y zona en creeps e invocaciones — 2026-09-30, resuelta: SE AVISA AHORA, SE SUMA DESPUÉS** **(2026-10-02: ya se sumó la zona persistente de las invocaciones, y sus trampas — etapa 4f.)**
  (dueño). La ✨ Ejecución deja elegir "Ataque con mi arma, con arreglos" y "⚡ Reacción Flash", pero solo andaban en
  personajes: en un creep armaban un cuadro de habilidad que no correspondía y en una invocación (igual que la zona) se
  ejecutaban como semiautomáticas sin decir nada. Ahora se avisa ("todavía no anda para creeps/invocaciones: se ejecutó como
  semiautomática", `Combatiente.ejecucionNoDisponible`) y sumarlos queda en `pendientes.md` para una tanda propia.
  **Creeps e invocaciones: hecho el mismo día** (pedido del dueño): ataque con arma con arreglos y ⚡ Flash (ver P135; la
  invocación paga el Flash como un creep: cooldown y vida, el doble en turno ajeno). Falta la zona persistente y las trampas
  de las invocaciones.
- ✅ **P135. Qué le cuesta un ⚡ Flash a un creep — 2026-09-30, resuelta: SOLO COOLDOWN** (dueño). Igual que en el personaje
  (que paga solo SP), no gasta No2: su límite es el cooldown de la habilidad, y la vida si la habilidad la cuesta. En el duelo,
  el botón del Flash dice "cooldown N" en vez de "N SP"; en cooldown aparece apagado.
- ✅ **P136. El costo de un Flash en turno ajeno — 2026-09-30, regla del dueño: EL DOBLE, SIEMPRE.** "Una habilidad con Flash
  funciona siempre así: en tu turno cobra un costo; en turno ajeno, el doble. No importa si es con duelo o con el
  semiautomático: esa es la regla del juego, y la implementación se adapta a la regla, no al revés." Vale para personajes
  (SP) y creeps (cooldown), y la vida también se duplica. Al usar un ⚡ Flash (en el cuadro del duelo o con el botón
  Ejecutar) un cartel pregunta de quién es el turno; sin nada que cobrar, no pregunta. Nunca cuesta No2. Si la habilidad tiene
  cargado a mano otro SP para turno ajeno (`turnoAjenoSp`), manda ese. Regla en `Combatiente.costoFlash`; cartel en
  `ConfirmarTurno.flash` (`comun/confirmar-turno.js`). Manual: 09-habilidades.
- ✅ **P137 — resuelta 2026-10-01 (dueño): (1) "no vence" en los tres — la habilidad/ítem lo marca o lo desmarca (casilla "No vence" / "Sin límite"); si nunca se tocó, manda el estado (`Combatiente.efectoPermanente`). Los creeps ganan la casilla en su editor (las invocaciones ya la tenían). (2) El Excedente de vida que da una habilidad **reemplaza** al que había, en los tres (los creeps lo sumaban).** Aplicado en `comun/combatiente.js`, `ficha-habilidades.js`, `creep-acciones.js`, `ficha-personaje/js/04` y el editor de habilidades de creep de GM Tools. Revisado: ningún ítem del catálogo cambia de comportamiento. Lo que sigue es el planteo original:
  🔲 **P137. "Permanente" y el Excedente de vida en el efecto de consumo: la ficha, gm-tools e invocaciones no hacen lo mismo (2026-10-01, encontrado al mover `aplicarEfectoDeConsumo` al motor — paso 5, nivel B, área 3).** El "estado del sistema anterior" que una habilidad/ítem aplica al ejecutarse/consumirse (`efectoNombre`, `efectoTurnos`, `efectoHpTurno`, `efectoEscudo`, `efectoStacks`…) tiene dos puntos donde las tres copias difieren: (1) **¿quién decide si el estado queda permanente?** La ficha (ítems y habilidades de personaje) siempre usa el campo propio `efectoPermanente` de la habilidad/ítem (hasta puede CONTRADECIR al preset). gm-tools (habilidades de creep) no tiene ese campo en su editor: siempre usa el `permanente` del preset, sin poder pisarlo. Las invocaciones tampoco tienen el campo. (2) **Escudo de tipo Excedente de vida**: en gm-tools, si el preset es "Excedente de vida" y la habilidad da más escudo (`efectoEscudo`), se SUMA al que ya tenía puesto (`excPrevio + suma`); en la ficha y en las invocaciones, el nuevo valor REEMPLAZA al anterior. **Por decidir**: ¿se le agrega a las habilidades de creep (y a las de invocación) un campo propio de "no vence", como ya tiene la ficha? ¿El Excedente de vida se suma o se reemplaza, y vale igual para los tres? Una vez decidido, se puede terminar de unificar `aplicarEfectoDeConsumo`/`aplicarEfectoDeConsumoCreep`/el bloque equivalente de `invEjecutarHab` en `comun/ficha-habilidades.js` (o un lugar común a los tres, ya que no es solo de la ficha).

- ✅ **P138. "Mis últimas tiradas" (Moneda Re-Roll y Polilla) — 2026-10-01, resuelta: SALEN DE LA MESA** (dueño). Antes vivían solo en la memoria de la ficha abierta (se perdían al recargar y no veían lo tirado en otra ventana); para que el mapa pueda hacer las tiradas de la Botonera (paso 4, etapa 3c) cada tirada de un personaje se publica con su `ficha` y la ficha escucha las de su personaje (`comun/tiradas-propias.js`), juntadas con las de esa ventana. La marca "ya usó su moneda" se guarda en la ficha (`S.rerollUsados`, hasta 50). Cambio visible: la lista muestra también lo tirado en otra ventana o antes de recargar. Regla nueva de Firestore (campo `ficha` de `tiradas`): hasta pegarla, se comporta como antes (solo lo de esa ventana).

- ✅ **P139 — resuelta 2026-10-01 (dueño): por definición, SOLO se contraataca después de un Parry Y un Bloqueo exitosos, los
  dos.** "En el menú de duelo, si alguien siendo atacado tiene éxito en el Parry y en el Bloqueo, el siguiente paso debería
  ser una pregunta: ¿tenés posibilidad de contraatacar? Sí o no. Si acepta sí, se inicia el menú de duelo paso a paso, pero
  ahora invertido: quien defendía ataca, quien atacaba defiende." Aplicado en `comun/duelo.js`: con «bloqueado» el
  defensor (o el GM) ve «¿Contraatacás a X? Sí / No»; Sí abre el duelo nuevo al revés (como ya hacía el botón), No anota
  `contra: 'no'` (sin reglas nuevas: el campo ya estaba) y los demás ven «decidió no contraatacar». Fuera del duelo, el
  Contraataque del menú de Atacar no puede saber si se ganaron los dos: su texto lo recuerda ("solo tras ganar un Parry y un
  Bloqueo") y deja seguir (avisar, no bloquear). Lo de "¿cuántos por turno?" queda contestado por la misma definición: uno
  por cada Parry + Bloqueo ganados. Manual (Contraataque) actualizado. Lo que sigue es el planteo original:
- ~~P139. El contraataque fuera del duelo: ¿exige ganar el Parry/Bloqueo? ¿cuántos por turno? (2026-10-01, pasado acá desde el manual — `manual-usuario/notas/06-combate.md`, nota Contraataque — y `docs/pendientes.md` §104, al empezar el paso 3c-4b; la regla es del 2026-09-26).** Lo decidido: el contraataque es **regla a prueba**; lo habilita un Parry (con arma o escudo); **siempre cuesta lo de un primer ataque** (Tipo ÷ 2) y **no suma al conteo** de ataques del turno; con escudo se pega con la otra arma; las armas Tipo 6 pueden traer **PdG en contraataque** (`pdgcontra`). **Dentro del duelo ya está decidido** (P-Duelo-defensa, 2026-09-26): el botón ⚔ Contraatacar **solo aparece si el defensor gana el Bloqueo**, y abre un duelo nuevo (`contraDe`). **Abierto, para el botón Atacar → Contraataque suelto** (fuera del duelo): hoy es libre, la mesa lo usa cuando corresponde. (1) ¿Exige haber **ganado** el Parry y/o el Bloqueo, como en el duelo, o basta con haber parado? (2) ¿Se puede contraatacar **más de una vez por turno** (uno por cada Parry)? Hoy nada lo limita salvo los No2. Al mudar Atacar al mapa (3c-4b) se conserva tal cual está.~~

- ✅ **P140 — resuelta 2026-10-01 (dueño): las dos propuestas.** (1) Primero la prueba el GM en una sesión real (con 🎮 el control de un personaje); después la prende el jugador que quiera: el interruptor ⚗ ya lo ve cualquiera de la partida (opt-in, por navegador). (2) Editar carga la ficha escondida recién cuando se toca (abrir la Botonera nueva ya no la precarga). Lo que sigue es el planteo original:
- ~~**P140. La Botonera nueva del mapa: ¿cómo se prueba con jugadores y qué hace "Editar"? (2026-10-01, al terminar la etapa 3c del paso 4 — `docs/plan-paso4-etapa3.md`).** La Botonera que dibuja el mapa ya hace todos los botones sin la ficha escondida, pero hoy solo la ve el GM con el interruptor ⚗. Antes de que sea la de todos (3d) hay que decidir: (1) **cómo se prueba en una partida de verdad**: que el GM la use un rato con 🎮 el control de un personaje en una sesión real, o abrir ⚗ a los jugadores (cada uno la prende en su navegador, opt-in). (2) **Qué hace "Editar"** desde el Ver de la Botonera cuando la ficha ya no se cargue escondida para abrirla: abrir la ficha en otra pestaña (simple) o mudar los editores al mapa (grande). Propuesta: (1) primero el GM en una sesión real, después ⚗ para los jugadores que quieran; (2) abrir la ficha escondida solo cuando se toca Editar (como hoy, sin precargarla).~~

- ✅ **P141 — resuelta 2026-10-01 (dueño): (1) creeps primero; (2) el mismo interruptor ⚗; (3) P137, esperar.** Lo que sigue es el planteo original:
- ~~**P141. Etapa 4 del paso 4 (Acciones de los creeps y Botonera de las invocaciones en el mapa): orden e interruptor (2026-10-01, `docs/plan-paso4-etapa4.md`).** (1) ¿Creeps primero o invocaciones primero? *Recomendado: creeps* (es lo que el GM usa en cada combate; después las invocaciones reusan sus reglas). (2) ¿El mismo interruptor ⚗ "Botonera nueva" para las Acciones nuevas de los creeps? *Recomendado: sí, uno solo*. (3) P137 (diferencias entre ficha, GM Tools e invocaciones) hace falta decidirla antes de las invocaciones, no antes de los creeps. Mientras no se conteste, se avanza con lo recomendado (la 4a, las reglas de los creeps en `comun/creep-calculo.js`, ya está hecha y sirve para cualquier orden).~~

- ✅ **P142 — resuelta 2026-10-02 (dueño): la Armadura mágica reduce el daño tóxico** (en el duelo ya pasaba; ahora también en las zonas de habilidad). Planteo original:
- ~~**P142. El daño «Tóxico»: ¿qué lo frena? (2026-10-02, al sumar el tipo Tóxico para Pedos Tóxicos).** El dueño dijo que el daño tóxico
  «a fines prácticos no es igual al arcano». Por ahora Tóxico es un tipo más del paso «Daño» (etiqueta propia: "4 de daño tóxico") y,
  como los mágicos, arranca con «Ignora la Defensa» tildado (un gas pasa la armadura; se puede destildar). Abierto: en un duelo, el daño
  de habilidad que ignora la Defensa se reduce con la **Armadura mágica** del objetivo — ¿también el tóxico, o lo frena otra cosa
  (Inmunidad a veneno, Constitución…)? En las zonas persistentes hoy no resta Armadura mágica (ningún tipo).~~

- **P143. Zonas persistentes de habilidad (Pedos Tóxicos): ¿la fuerza de la nube se decide al lanzarla o en cada exposición? Y las **Actualización (dueño, 2026-10-05):** el daño tóxico (el que se respira, y los venenos) **se resiste con Res.Esp**, la que da la Constitución; no es exactamente mágico pero no contempla armadura. **Y no lo frena la Armadura mágica** (dueño, mismo día): solo la Res. tóxico (`Combatiente.frenaArmaduraMagica`).
  peculiaridades del daño tóxico (2026-10-02, abierta a pedido del dueño para que la discutan Enro y Seba — también va en la pestaña
  💬 Preguntas de las Herramientas de diseño).** (1) a) **Al lanzarla**: una tirada al crear la zona, el mismo número para todos los que
  entren durante sus turnos; b) **en cada exposición**: la habilidad no falla (la nube aparece siempre) y cada vez que afecta a alguien (al
  entrar o en cada Mantenimiento) se tira de nuevo el stat de quien la lanzó (con el valor que tenía al lanzarla) contra la resistencia de
  ese alguien. **Mientras se decide, quedó armado como (b)** (2026-10-02). ¿Vale igual para todas las zonas de habilidad o depende de cada
  una? (2) Daño tóxico: hoy va directo a la vida por defecto (se puede destildar) y lo reduce la Armadura mágica (P142). ¿La Inmunidad a
  veneno lo anula? ¿Algo más lo frena (Constitución, una máscara…)? ¿Otra peculiaridad frente al arcano (acumular, dejar Veneno…)?
  **Planteo del dueño (2026-10-02):** el tóxico ya trae de por sí una resistencia propia — quien lo recibe tira **Res.Esp** contra el
  daño —, y el daño arcano esa resistencia no la tiene. Entonces no es daño físico (que frena la Defensa) ni arcano (que va directo,
  solo con la Armadura mágica): es un **lugar intermedio**. ¿Lo consolidamos como **regla del tipo tóxico** (todo daño tóxico se resiste
  con Res.Esp) o es una **peculiaridad de esta skill puntual** (Pedos Tóxicos)?

- ✅ **P144. La Armadura mágica: ¿un stat más o un bono excepcional?** **Decidida (dueño, 2026-10-12: «esto ya lo definimos, existe la armadura especial»): es un stat, la **Defensa especial** (`armadmg`, «Def. especial»), que se resta al daño especial como la Defensa al físico.** Lo de abajo queda como historia.
  ~~ (2026-10-02, abierta a pedido del dueño para que la discutan Enro y
  Seba — también va en la pestaña 💬 Preguntas de las Herramientas de diseño).** Hoy existe como stat (`armadmg`, paso 7 de las reglas de
  casteo, 2026-09-27): arranca en 0, no sale de ningún atributo, la dan ítems (por criterio, Raros o mejores) y se resta al daño mágico
  que ignora la Defensa (en el duelo, en las zonas de habilidad y al tóxico, P142). Planteo: ¿debería ser un **stat** como los demás (que
  aparece en la ficha, sube con pasivas, etc.) o un **bono particular y excepcional**, que se mantenga en valores bajos y solo lo
  otorguen algunos equipos, efectos, habilidades o consumibles, y cuyo único trabajo sea reducir el daño mágico? ¿Qué topes o valores
  típicos? ¿Debería reducir todo daño mágico o solo algunos tipos?~~

- **P145. Percepción aumentada: "algo está fuera de lugar" (2026-10-02, pedido del dueño; reemplaza el aviso actual).** **Respondido el mismo día:** (a) la trampa tiene su dificultad para detectarla — de fábrica o armada a mano, un número (común 8: espacio de diseño, trampas de buena o mala calidad); colocada por una habilidad, la Destreza (física) o el Efecto especial (mágica) de quien la coloca; (b) en sigilo, Percepción contra Destreza; (c) descubierta, la ve todo el equipo; (d) la tirada nunca dice para qué es. **Trampas y sigilo: hechos (2026-10-02; el sigilo lo resuelve la pantalla del GM — empate: sigue escondido).** Lo decidido:
  con la pasiva, (1) **trampas**: al quedar al lado de una trampa oculta de un rival, el movimiento se corta **sin revelar nada ni decir
  "trampa"** — solo «Algo está fuera de lugar… tirá Percepción»; si gana contra la dificultad de la trampa, recién ahí la ve; si pierde,
  sigue moviéndose libre: pisarla la detona, y pasar por **otro** casillero al lado vuelve a cortar y pedir tirada. (2) **Sigilo**: la zona
  de alerta de quien camina cuenta **en cada paso** (sin la pasiva sigue como P105: solo donde termina); si alguien en sigilo queda en ella,
  mismo corte y misma tirada; si gana, lo descubre (pierde el sigilo). Abierto: (a) ¿de dónde sale la **dificultad para detectar una
  trampa** (campo nuevo del asistente con un valor por defecto, algo de quien la puso, o un número fijo)? (b) en sigilo, ¿Percepción
  **contra qué** (una tirada de Destreza del que se esconde —cerca de P3— o un número fijo)? (c) al descubrir una trampa, ¿la ve solo
  quien la descubrió o todo su bando? (d) la tirada sale en la Mesa como una Percepción cualquiera, sin decir para qué (propuesta).

- ✅ **P146 — resuelta 2026-10-02 (dueño): cartelito al centro para quien resuelve; para los demás, flotando en la esquina de arriba a la derecha del mapa, contando lo que pasa sin interrumpir; eventos: percepción, zonas, trampas disparadas y sigilo roto; se cuenta solo lo que ya es público (el daño, no la vida que le queda a un creep; el nombre de una trampa descubierta). Hecho: `vtt-hexgrid/js/16-momentos.js`.** Planteo original:
- ~~**P146. Que los eventos tengan "su momento" para toda la mesa (2026-10-02, pedido del dueño: "no quiero que las cosas queden
  simplemente comunicadas en el log… pasa como silbando bajito").** Hoy solo el duelo se abre en todas las pantallas; la percepción
  («algo está fuera de lugar»), las zonas (resistir, daño, el d20 de Pedos Tóxicos), las trampas disparadas y el sigilo roto quedan en
  un cartelito de una sola pantalla + una línea en la Mesa. Propuesta: una **escena común** — una tarjeta grande en todas las pantallas
  que encadena el momento (texto → dados 3D → resultado) y se va sola; los botones de tirar, solo en la pantalla de quien tira. Abierto:
  (1) qué eventos la tienen (propuesta: percepción, zonas, trampas, sigilo roto); (2) cuánto se cuenta (sin la vida de los creeps; un
  oculto sin descubrir es "alguien"; ¿el nombre de la trampa?); (3) ¿tapa el centro del mapa unos segundos o va arriba sin tapar?~~
- ✅ **P147 — resuelta 2026-10-02 (dueño): el DDE inicial de un personaje nuevo es 300 doblones del espacio, salvo que el GM fije otro para su
  partida** («⚙ Partida» en la página de inicio; `campanas/<id>/ajustes/partida`). El acompañante del asistente de personaje nuevo sugiere los
  atributos con los repartos de los roles de creeps (siempre como orientación). Hecho: `comun/asistente-personaje.js`.
- ✅ **P148 — resuelta 2026-10-02 (dueño): las trampas hacen solas todo lo que se pueda (daño, estado y la tirada para evitarla), siempre
  anunciándolo: al afectado con **el Aviso** (cartel al centro de su pantalla) y al resto con **la Crónica** (las tarjetas de arriba a la
  derecha del mapa, siempre iguales). Duración de los estados de trampa: **3 turnos como regla general; Stun 1** (sugerencias aceptadas:
  Sentado y Sangrado no vencen solos —se paran / los curan—; el Veneno dura sus stacks).** Hecho: `vtt-hexgrid/js/08` (`trampaAplicarEfectos`),
  `comun/trampas-base.js` (`FICHA_TRAMPAS`) y las 72 trampas consumibles del catálogo. Quedan a mano (dicho en cada texto, «(a mano)»):
  liberarse de Inmovilizado / Arena, pararse con No2, la confusión, el silencio de SP, drenar SP, −2 a todas las tiradas, ver aliados como
  enemigos y el teletransporte del portal.

- 🔲 **P150. El daño de un ataque sin arma** (2026-10-03, apareció probando un duelo: juan atacó sin arma y el duelo quedó «Tirando…» porque no
  había daño definido). **Provisorio:** 1 dado del Tipo sin arma (P22: 4) + Dmg = `1d4 + Dmg` (`FichaCombate.danoSinArmaTxt`), en el duelo y en el
  botón Daño de la Botonera. ¿Así, o los puños pegan distinto (sin Dmg, mitad, un efecto propio)? *(código)*
  **Desde el 2026-10-22 (D4, paso 5 de `docs/plan-inventario-creeps.md`)** el mismo `1d4 + Dmg` vale también para un creep o una invocación
  sin nada en la mano. Sigue abierta la pregunta de si los puños pegan distinto.

- ✅ **P151. Qué ve de un duelo ajeno quien lo minimizó** — **Decidido (dueño, 2026-10-03): (c), las dos.** Hecho: el botón dice el
  último paso ya revelado y el mapa arma una tarjeta por duelo en la Crónica con un renglón por paso (`Duelo.pasosDe`, hook `paso` de
  `Duelo.escuchar`, `dueloPasoCronica` en `vtt-hexgrid/js/16`); cada paso espera a los dados. Probado en vivo con dos cuentas. (2026-10-03, probado en vivo: GM con el control de juan contra un creep, mirado
  desde la cuenta de un jugador). Hoy el cuadro se le abre solo a todos con el paso a paso; minimizado queda el chip «⚔ Ver duelo: A → B»
  **sin cambiar de texto** hasta que el duelo termina (ahí desaparece), y los pasos solo llegan como tiradas sueltas en la Mesa (PdG,
  Evasión, Daño) más el resumen al final. **Nada va a la Crónica ni al Aviso.** Propuesta: (a) el chip dice en qué va («PdG 6 contra
  Evasión 4 → pegó», «Daño 4 → 0»); (b) cada momento clave (pegó/falló, crítico, daño aplicado, fin) como tarjeta de la Crónica para
  quien lo tiene minimizado; (c) las dos. *(código)*

- 🔲 **P152. ¿El precio de un arma tiene que contar la velocidad (el costo en Nitros)?** (2026-10-03, pregunta del dueño durante el rework del
  Tipo 10). Hoy `precio_libre` cuenta el daño de los dados por golpe, no por Nitro: una daga 1d4 (2 No2) y un martillo 1d10 (5 No2) se valoran por
  lo que pegan en un golpe. El Tipo sí cuenta en el daño fijo / Dmg (valen más en Tipos bajos), en el crítico y en el daño amplificado (un dado más
  del Tipo: un d10 amplificado vale 5,5 y un d4, 2,5). Lo que lo compensa hoy: la Defensa se resta en cada golpe (golpes chicos rinden poco contra
  armadura) y el techo de cada calidad es el mismo para todos los Tipos. **Decisión provisoria del dueño: seguir así; lo vuelve a evaluar con
  más tiempo.** *(diseño, `herramientas/calculadora_armas.py`)*

- 🔲 **P153. ¿El fuego amigo en área vale también para las habilidades?** (2026-10-03). El dueño fijó como regla general que **lo que es de área
  tiene fuego amigo** (salvo lo que salta de enemigo en enemigo, como el rayo en cadena, que no es de área). Ya se aplica a las **trampas**. Hoy,
  en cambio, un **hechizo de área** y la **onda** alrededor de quien la usa eligen solo rivales (`dueloElegirAreaMapa`, js/13), y una **zona
  persistente** deja elegir si afecta a los aliados (`zonaAmiga`). ¿Pasan todas a pegarle también a los aliados? *(diseño + código)*
  **Para debatir con el grupo** (dueño, 2026-10-03): publicada en 🛠 Herramientas de diseño → 💬 Preguntas.
- 🔲 **P154. ¿El sobrepeso baja la Iniciativa?** (2026-10-04, del rework de la defensa). Idea: que llevar de más (armaduras pesadas) cueste
  Iniciativa, como contrapeso natural de mucha Defensa. Al dueño le parece que «puede ser exactamente la solución que estábamos buscando»;
  **lo va a consultar con sus colegas**. Por ahora las penalidades de sobrepeso quedan como están. *(diseño, para el grupo)* **Publicada en 🛠 Herramientas de diseño → 💬 Preguntas (2026-10-04).**

### P155 — Confusión: cómo se automatiza (2026-10-04) ✅ decidida y hecha el mismo día (ver `rework-trampas.md`)
**Contexto:** la Niebla de confusión deja Confusión. El dueño: la tirada tiene que ser **antes** de moverse o de cualquier acción (si no, el
jugador gasta los No2 moviéndose y saca provecho): al confirmar la ruta o la acción, antes de que pase, aparece el Anuncio «Estás confundido:
tirá antes» con qué significa cada resultado y el botón; según lo que salga se resuelve. El objetivo al azar se elige entre los tokens visibles.
**Propuesta (2026-10-04, esperando OK):** 1d4 — 1 el GM elige (destino u objetivo, en el mapa, como el Portal); 2 pierde la acción (se cobra
igual, para que no se pueda reintentar); 3 al azar (ataque/habilidad: a cada candidato visible a su alcance se le pone un número en el mapa y se
tira el dado estándar más chico que alcance, repitiendo lo que se pase; movimiento: 1d6 para la dirección, los mismos pasos); 4 normal.


- 🔲 **P156. Lanzamiento: tirar un consumible o colocar una trampa a distancia** (2026-10-04, del rework del cinturón). ¿Cómo se tira un frasco o una bomba, o se coloca una trampa lejos (alcance, puntería, qué pasa si falla)? Hasta definirlo queda en pausa la mecánica de cinturón «Brazo de lanzador» (+N casilleros al tirar o colocar algo). También anotada en las Preguntas de las Herramientas de diseño.

- ✅ **P157. Pasar objetos entre jugadores y el baúl del grupo** (2026-10-05, dueño: «que uno pueda abrir la mochila, o la tarjeta del ítem, y decir ofrecerlo a otro jugador o moverlo al baúl del inventario compartido»). **Decidido y hecho (2026-10-05, `comun/intercambio.js`)**, reemplaza a la «mesa común»: (1) **fuera de combate se ofrece a cualquiera** («los jugadores determinan cuándo sí y cuándo no»): 🤝 Dar en cada ítem de la mochila y el cinturón (ficha y ventana 🛡 Equipo del mapa) y 🤝 Pasar (oro y despojos); (2) **el ítem queda reservado hasta que el otro acepta** (ocupa lugar y no se usa, equipa ni vende; se puede cancelar); el oro y los despojos se apartan al ofrecerlos; al aceptar, línea en la Mesa; si rechaza, vuelve; (3) **el baúl reemplaza a la mesa común**, **no se usa en combate** y **se abre solo desde una tienda abierta** (dueño: «como el cajero del centro Pokémon»); (4) **lugar limitado, mejorable**: **10 ranuras por integrante del grupo** (cada personaje de la partida; el oro y los despojos no ocupan); (5) **registro de movimientos** (quién guardó y quién sacó cada cosa, `baulLog`) y línea en la Mesa; (6) lo que había en la mesa común vuelve solo a quien lo ofreció. (7) **en combate** (hecho el mismo día): solo ítems y solo a un aliado al lado (el mapa mira los tokens a 1 casillero); 1 No2 desde el cinturón (0 con **Pasamanos**), 2 desde la mochila, se paga al ofrecer (si lo rechaza, los No2 no vuelven); lo que llega va al cinturón si entra; **Alforja compartida**: el aliado al lado saca él mismo un consumible de tu mochila por 1 No2 (paquete `pedido`, lo entrega sola la pantalla del dueño). **Falta**: los baúles móviles (a futuro, por quest: en `pendientes.md`). Reglas de Firestore nuevas (`paquetes`, `baul`, `baulLog`).
- ✅ **P158. ¿Cuántas ranuras de mochila ocupa un arma o una pieza de equipo?** (2026-10-05, encontrado probando el baúl: 541 ítems del catálogo tenían `ranuras: 0` y 9 piezas viejas usaban el número como «ranuras de cinturón que da»). **Decidido (dueño, 2026-10-05): «todo elemento debe cobrar al menos 1 slot en la mochila, por ahora, salvo que diga lo contrario (objetos stackeables)».** Hecho: el catálogo entero en 1 (550 ítems corregidos; los cinturones viejos ya daban sus ranuras con `capcinturon`); `FichaEquipo.ranuras` cobra mínimo 1 (también a las copias que ya están en las mochilas) salvo `sinRanura: true`; una pila de algo apilable (consumibles, trofeos iguales) ocupa 1 por pila; el asistente de ítems no deja poner 0. Una mochila que con esto quede pasada no pierde nada: solo no entra nada más hasta hacer lugar.
- 🔲 **P159. ¿Cuánto tiene que pegar un mago contra un guerrero?** (2026-10-05, salió de la calculadora de armas especiales). Con las varitas Comunes
  (1, 2, 3 No2 por uso + el SP de su efecto), un mago con Especial 6 hace en un combate de 4 turnos unas **2 a 3 veces** el daño por turno de un guerrero
  con un arma física Común; y la habilidad **Chispazo** (1d6 directo, 1 No2 + 1 SP, sin incremento ni límite por turno) rinde todavía más por SP. A
  favor del mago: menos vida y menos defensa, y gasta su SP (que no usa en otras habilidades). Pregunta para cuando se trabajen las clases: ¿está bien
  esa diferencia?, ¿Chispazo necesita un freno (costo que sube, una vez por turno)? La herramienta para medirlo: `herramientas/calculadora_especiales.py`.
- ✅ **P160. ¿Un arma especial se puede usar como ataque de oportunidad o contraataque?** (2026-10-05). **Decidida por el dueño el mismo día: no** —
  «no es dentro de sus opciones; que cada botón tenga su recorrido propio». El «✨ Atacar» de una varita va directo a sus reglas, sin el cartel «¿Qué ataque es?».
  Pregunta original: Desde que las armas especiales se
  usan desde Atacar (dueño: «se tratan como un ataque»), el cartel «¿Qué ataque es?» solo ofrece el **ataque normal** con sus reglas (1 No2 + 1 por
  uso + su SP). ¿Una varita puede ir de oportunidad (cuando un rival sale de tu alcance) o de contraataque (tras ganar Parry y Bloqueo)? ¿Con qué
  costo, y solo las que apuntan a un rival? Mientras tanto, no aparecen (la mesa lo puede hacer a mano).
- ✅ **P161. Turno continuo: ¿opción completa o intermedia?** (2026-10-06). **Decidida por el dueño el mismo día: el turno completo**, para
  probarlo (en Herramientas de diseño quedó como comunicado, no como pregunta). Con el orden de turnos del mapa, cada uno tiene su reloj: **al
  empezar su turno** recarga No2 y SP, bajan sus cooldowns (y la espera de sus varitas), corren las pasivas que curan y la cuenta de muerte, y
  **se dispara** lo que se dispara (veneno, sangrado, regeneración, el escudo); **al terminarlo** baja el contador de sus estados. **Lo que se
  dispara pega también apenas te lo ponen** (dueño: «aunque te apliquen un antídoto, por lo menos una vez va a haber tenido efecto»): cada
  estado pega una vez por vuelta, así uno de N turnos pega N veces. **El ⟳ Mantenimiento sigue** fuera de combate y para quien no está en el
  orden; con orden de turnos lo pasa solo el **cambio de ronda** (la línea de la lista de turnos: formas que vencen, zonas, fuego, trampas) y a
  quien tuvo turno propio no le toca nada. **Las rondas se siguen contando.** Una **invocación nueva** entra al final del orden con **Mareo de
  invocación** (su primer turno no hace nada). Cada pase de turno se cuenta en la Crónica y en la Mesa. Después: revisar Pajaritos, Stun y los
  estados fuertes por 1 turno (`pendientes.md` §6) y pensar la herramienta de «pasa el tiempo» (fuera de combate).
- ✅ **P162. Un estado que te ponen durante tu propio turno, ¿cuenta ese fin de turno?** (2026-10-06). **Decidida por el dueño el mismo día: sí**
  (lo de 1 turno que cae en tu turno dura el resto de ese turno; se valora barato al diseñarlo, y la Barrera pasó a 2 turnos) — la regla limpia y pareja: el contador baja al terminar el turno del afectado, aunque se lo hayan puesto en ese mismo turno (un
  Stun de 1 turno puesto en tu turno se va al terminarlo; el veneno igual ya pegó al aplicarse). Consecuencia de diseño: lo que se activa en
  tu propio turno (sobre todo las **trampas**: Pajaritos, Stun) nunca dura menos de 2 turnos. La alternativa: que empiece a contar en el
  próximo (la marca `pasoTurno` de cada estado ya lo permitiría).
- **P163. Defensas en No2 negativos** (2026-10-06, idea del dueño, a probar). Las defensas que cuestan No2 (Parry, la Evasión que paga el
  sobrepeso, el dodge roll) se pueden hacer sin No2: quedás en negativo y la deuda se descuenta en tu próxima recarga. Solo las defensas; lo demás
  sigue sin pasar de 0. Se avisa muy claro: a quien la hace, un cartel (como el Aviso); a los demás, la Crónica. Las acciones fuera de turno
  también van a la Crónica. A revisar después de probarlo en mesa.
  **No aplica al ataque de oportunidad ni al contraataque** (dueño, 2026-10-06): son ataques, siguen sin bajar de 0 (sin No2 avisan y gastan lo
  que haya, con la línea roja, como siempre).
  Subida a 🛠 Herramientas de diseño → Preguntas (2026-10-06) como decisión ya establecida, **sujeta a la aprobación del grupo**.
  **Ajuste del dueño (2026-10-23):** «se puede siempre y cuando no tengas ya nitros negativos. Una vez que ya estás en nitros negativos, no podés
  seguir gastando nitros para acciones defensivas». Defensivas: Parry, dodge roll, la Evasión que paga el sobrepeso, ayudar a zafar a alguien.
  Hecho: `Combatiente.defensaSinNo2` (Parry de personajes, invocaciones y creeps; la Evasión pagando; el dodge roll del mapa; la ayuda para
  zafar; en el duelo la opción queda apagada con el motivo).
  **Cambio del dueño (2026-11-01):** «Vamos a dejarlo para acciones ofensivas tipo ataque de oportunidad también. Pero ahora sí la restricción es
  siempre que tengas 0 nitros o más. Si ya tenés nitros negativos, ahí no podés hacer ninguna acción que te siga restando.» Hecho: el ataque de
  oportunidad y el contraataque van a negativo como una defensa (sin preguntar); ya en negativo, nada que cueste No2 (tampoco el «¿Hacerlo igual?»
  de ninguna acción ni pasar un ítem). Ver `comun/CLAUDE.md`, «💸 No2 negativos».
- ✅ **P164. Reflejos de mangosta: ¿tirada contra la trampa?** (2026-10-06, idea del dueño revisando los pies). Hoy: al pisar una trampa, con la
  chance de Reflejos (las Sandalias de mangosta, siempre) se ofrece un dodge roll (salir a 1–2 casilleros pagando el movimiento). El dueño
  propone que active un anuncio/duelo: la dificultad de la trampa contra tu Evasión (o el dodge). **Propuesta**: con Reflejos, el Anuncio
  pide «Tirar Evasión contra N» (N = la dificultad de evitarla de la trampa si tiene; si no, su dificultad de detección, 8 la común);
  si llega, el dodge roll de siempre (elegís la casilla, pagás el movimiento); si no, la trampa se dispara. Falta decidir: ¿qué número
  es N?, ¿la tirada reemplaza a la chance o se suma (primero la chance, después la tirada)?
  **Dueño (2026-10-06)**: el dodge roll no tiene que ser garantía de zafar — tiene que haber una tirada; definirla juntos.
  **Decidido y hecho (dueño, 2026-10-06)**: se juega ANTES de que la trampa se dispare. «Pisaste una trampa» (sin decir cuál: es una apuesta,
  no sabés el efecto ni el área) → la chance de Reflejos → **Evasión contra la dificultad de la trampa** (siempre la suya, la de detectarla; 8
  la común) → si llega, dodge roll en la dirección y distancia que elijas (hasta 2, pagando el movimiento) → se dispara la trampa: si quedaste
  fuera de su área, zafaste; si seguís adentro, se aplica. Las trampas no tienen tirada de evasión propia (la «salvación» es resistir efectos).
- ✅ **P165. Titilando: ¿hasta cuándo?** (2026-10-06, hecho a pedido del dueño; **confirmado por el dueño el mismo día**: sí, revivido en su propio turno se le va al terminar ese turno). Quien vuelve de estar caído titila y es invulnerable hasta
  que **empieza** su próximo turno. Dos casos a confirmar en mesa: (1) si lo reviven **en su propio turno** (un Ankh que salta por el
  veneno al empezar), se le va al terminar ese mismo turno (el contador baja al terminar el turno, P162); (2) sin orden de turnos, dura
  hasta el próximo ⟳ Mantenimiento. Cualquier estado invulnerable (Invulnerable, Titilando) hace titilar el token.
  **Solo lo ponen los efectos que reviven** (dueño, 2026-10-06): ✚ Revivir y el Ankh. Una poción o una cura normal no revive a un inconsciente.
- ✅ **P166. Una cura no levanta a un caído** (dueño, 2026-10-06): con la vida en 0, una poción, la cura de una habilidad o la regeneración
  del turno no suben la vida (el daño sí sigue entrando). Para levantarlo hace falta un efecto que diga «revivir» (✚ Revivir, Ankh), que
  además lo deja Titilando. Salida a mano: el círculo de vida del token avisa y deja cambiarla igual (lo decide la mesa).
- ⬜ **P167. ¿Cuánto cura una poción?** (dueño, 2026-10-06: «dejalo planteado como pregunta»; también en Herramientas de diseño → Preguntas).
  Los valores vienen de la escala vieja: Poción de HP (Común, $25) cura 25; la grande, 3 cargas de 25 (Raro, $80); la mayor, 100 (Raro, $100);
  la mayor grande, 3 × 100 (Excepcional). Hoy la vida de un personaje liviano ronda 25–35: una poción Común lo llena casi entero y la mayor
  sobra de lejos. Opciones: (a) números más chicos (Común 8–10, Buena 15, Rara 25…); (b) un porcentaje de la vida máxima, como la Poción de
  SP (Común 30 %, Buena 50 %, Rara 100 %); (c) dados (2d6, 4d6…), que suman azar. Se suma la Mano de boticario (+N por poción).
  **Propuesta de Claude (2026-10-08, el dueño la revisa en la compu):** número fijo (no %), cada calidad ≈ el doble; Común $1 por punto. Sifón 10 ($10) ·
  Poción de HP 20 ($20) · grande, Buena, 3 × 20 ($70) · mayor, Rara, 45 ($110) · mayor grande, Excepcional, 3 × 45 ($350). Nivel 1: 25–40 de vida (Con × 5); +5 por nivel.
- 🔶 **P168. ¿Qué hace «Buena calidad» en una varita?** (2026-10-07, repaso de las armas especiales de Buena: ver «Armas especiales de Buena
  calidad» en `docs/rework-armas.md`). El SP sube con la fuerza del tiro, así que «lo mismo, más grande» rinde igual o menos por turno que la
  Común. Opciones: (a) la escala de SP corre un escalón en Buena (más efecto por el mismo SP); (b) la escala igual y Buena trae formas y
  efectos nuevos; (c) las dos (propuesta de Claude).
  **Dueño (2026-10-07): (c), «probemos por acá»** (a probar).
- ✅ **P169. El daño mágico que suma Ef.Esp escala con el nivel** (dueño, 2026-10-07, mirando los báculos de Buena). El Ef.Esp de quien
  ataca sube con el nivel, pero la Res.Esp y la Evasión de quien recibe no suben igual: un báculo que suma el Ef.Esp (o la mitad) se vuelve
  cada vez más fuerte. Lo mismo vale para lo físico invocado (púa, canto rodado, granizo), aunque ahí frena la Defensa. Opciones en
  `docs/rework-armas.md` (Armas especiales de Buena calidad).
  **Dueño (2026-10-07):** el tope por calidad «terminaría siendo lo mismo que ponerle +3, +5, que sea un daño fijo». Claude: casi —para un
  mago, sí—; la diferencia está en quien tiene poco Especial (un guerrero con un báculo suma menos), que es justo el freno del tanque con el
  báculo de sangre. Dicho de otra forma: «+3 fijo, pero nunca más que tu Ef.Esp». A decidir: eso o el fijo a secas.
  **Dueño (2026-10-07, segunda vuelta):** como el Especial da el SP y todos usan SP, casi nadie va a tener Ef.Esp bajo: el tope es, en la
  práctica, un fijo («+3 fijo, nunca más que tu Ef.Esp: me parece bien, pero terminemos de pensar el dilema»). **La clave: qué salvación y qué
  defensa tiene el daño mágico frente al físico** («es clave en el sistema de juego»). Hoy: lo físico se frena con Evasión, Parry o Bloqueo para
  no recibirlo y con la Defensa (todo el equipo, sube con la calidad) para bajarlo; lo mágico solo con Evasión (o Res.Esp en los que no se
  esquivan; dodge roll en las áreas) y casi nada para bajarlo (Armadura mágica solo desde Raro; Res. elemental chica y de tema). Propuesta de
  Claude: el daño lo marca el arma (fijo por calidad, con tope en tu Ef.Esp) y la defensa la marca el equipo (Armadura mágica escasa desde
  Buena); opciones en `docs/rework-armas.md`.
  **Provisorio (dueño, 2026-10-07):** hasta resolverlo con el grupo, ninguna arma especial suma el Ef.Esp: daño fijo (dados o neto).
  **✅ Resuelta (dueño con el grupo, 2026-10-07): existe la Defensa especial.** Hay Defensa física y **Defensa especial**; la especial se
  equipa como cualquier otra (todo el catálogo defensivo hay que revisarlo para sumarla). Algunos efectos especiales llevan el tag **True
  Damage**: ignoran la Defensa especial — para los proyectiles chicos. **Todo daño que sume el Ef.Esp del personaje sí choca con la Defensa
  especial.** Con esto vuelve el Ef.Esp al daño (como la Fuerza contra la Defensa). Plan y preguntas: `docs/rework-armas.md`
  («Defensa especial»).
  **Corrección (dueño, 2026-10-07):** **True Damage** = ignora toda defensa (física, especial, cualquier armadura), muy controlado. **Daño
  directo** = daño especial que ignora la Defensa especial, para los proyectiles chicos («como un crítico que ignora armadura, sin
  multiplicador»). El Ef.Esp siempre choca con la Defensa especial.
- ✅ **P170. Dos Vida extra (ex Escudo especial / Excedente de vida) a la vez** (dueño, 2026-10-07): **se suman**, cada una aparte con su
  duración (antes la nueva reemplazaba a la anterior, P137). Un drenaje solo agrega lo que falta para su tope. La Vida extra es neta: solo se
  renueva la que el efecto marca con `recarga`.
- ✅ **P171. Equipo que se repara solo (la piel de troll)** (nota del dueño, 2026-10-07, mirando el Chaleco de piel de troll del torso Común:
  «se cierra sola cuando se raja»). Le encanta como diseño. Falta definir **en qué contexto y con qué frecuencia** se repara (durabilidad y/o
  Armadura rota): si se regenerara cada turno, anularía por completo el Rompe armadura. **Dueño (2026-10-08): 1 punto al terminar cada combate**
  (por turno sería casi indestructible: rara vez baja más de 1 por turno). Hecho: `autoRepara` en el ítem (el Chaleco de piel de troll, 1); lo aplica el
  mapa al salir del modo combate (js/25). Más adelante, ver un pulso intermedio entre «por turno» y «por combate».
- ✅ **P172. La duración de una zona cuenta los turnos de quien la tiró** (dueño, 2026-10-07, con el fuego que deja la Bola de fuego): hoy una
  zona vence por Mantenimientos (la ronda). Propuesta: con orden de turnos, una zona de N turnos se va al empezar el N-ésimo turno siguiente de
  quien la tiró (así el fuego de 1 turno quema a todos los que actúan antes de que el mago vuelva a jugar); sin orden de turnos, como hoy.
  **Hecho (2026-10-07, «sigamos»):** con orden de turnos, al empezar el turno de alguien sus zonas pierden un turno y con 0 se van (js/07
  `zonasDelQueLaTiro`, desde ▶ Siguiente); el vencimiento por Mantenimiento queda una ronda más tarde, de respaldo. Sin orden de turnos, como antes.
  **Ampliado (dueño, 2026-10-07: «siempre los turnos contando al caster»):** también las trampas que coloca alguien y la zona que dejan al
  dispararse (la trampa guarda quién la puso; mientras esa persona esté en el orden de turnos, no las vence el Mantenimiento).
- 🔲 **P173. Grupos de buffs y debuffs** (dueño, 2026-10-07, con el Maleficio de Buena): «tener un crit plus cada turno me sigue pareciendo
  mucho; dejémoslo para cuando tenga desarrollados los grupos de buffs y debuffs». El dueño va a desarrollar los grupos (qué buffs y debuffs se
  apilan entre sí y cuáles no, por familia). Mientras tanto, la **Varita del maleficio** (−1 a la Res. crítico de un tipo a elección, 2 turnos,
  no acumulable) queda en espera, fuera de la primera tanda de Buena.
- ✅ **P174. El rango lo da la Destreza, siempre** (dueño, 2026-10-07): «no existe el rango mágico por Especial». **Hecho:** se fue el Rango de
  casteo (`rangocasteo`) de la ficha, los creeps, las invocaciones y el mapa (el botón 🔮 y la tecla T); las varitas, los báculos y las
  habilidades usan el **Rango** (`rng`, de la Destreza): `Combatiente.alcanceHab` (una habilidad vieja con alcance «casteo» usa el Rango). Lo
  que daba +Rango de casteo: **los consumibles se eliminaron** (pergaminos y pociones de Extensión del Conjuro) y **los equipables pasan a
  +Rango** (9 piezas Raras o mejores, archivadas, y sus copias en el equipo de los creeps; la pasiva Largo alcance arcano, +1 Rango). Una copia
  vieja con «+Rango de casteo» en un inventario suma al Rango.


- ✅ **P175. Varita del vendaval: el empuje ahora se resiste (Res.Esp) — ¿qué le damos a cambio?** (dueño, 2026-10-08). Ya quedó: PdG.Esp contra
  Res.Esp para el empuje; despejar niebla y fuego no se resiste y solo saca las casillas que toca. Opciones: bajarle el precio (80 → 65), sumarle daño
  directo (1d4 arcano) o un % de Escarcha (se pisa con la Ráfaga helada, que es la de hielo). Propuesta: precio 65 y sin daño (es una de utilidad). **Decidido (dueño, 2026-10-08): 65 DDE, sin daño, y tiene fuego amigo** (empuja también a los aliados del cono). Hecho.
- ✅ **P176. Varita inestable: afinar el riesgo** (dueño, 2026-10-08, «cómo era antes, afinemos»). Antes (Buena): 2d6 y, si salía algún 1, 2d4 a vos
  (≈30 % de las veces, ≈1,5 de daño propio en promedio). Ahora: 1d4 por cada 1 (≈0,8 en promedio). Común: 1d8 y 1d4 con el 1 (≈0,3). **Decidido (dueño, 2026-10-08): Buena 2d6 y 1d6 por cada 1; Común 1d8 y 1d6 con el 1.** Hecho.
- ✅ **P177. ¿Los turnos de un estado se descuentan al EMPEZAR el turno (antes de que pegue) en vez de al terminarlo?** (dueño, 2026-10-08, «ayudame a
  pensarlo»). Hoy: lo que «sucede» (veneno, regeneración) pega al empezar el turno de quien lo tiene; el contador baja al terminar su turno. Ver la
  respuesta del 2026-10-08 en la conversación (y `docs/estados-turnos.md`). **Decidido y hecho (dueño, 2026-10-08):** el contador baja al EMPEZAR
  el turno de quien lo tiene, antes de que pegue; lo puesto fuera de su turno no descuenta en su primer inicio (le toca el turno entero). Así uno de N
  turnos dura N rondas completas desde que se aplica. El ⟳ Mantenimiento de la ronda (sin orden de turnos) sigue como antes. `Combatiente.empezarTurnoEstados`
  / `terminarTurnoEstados`, la marca `recien` que pone `agregarEstado`.
  **Ajuste (dueño, 2026-10-24, con Ojo certero): turnos completos para los efectos ACTIVOS.** «Los buffs relevantes durante las acciones de la persona
  beneficiada —más daño, más probabilidad de golpe— cuentan turnos completos; los defensivos está bien que resulten desde el momento en que son
  casteados»; «lo mismo a la inversa: los debuffs relevantes durante acciones activas —menos probabilidad de golpe, menos daño— también completos; los
  que afectan una variable o un efecto pasivo, como menos Defensa o menos Evasión, no». Un efecto activo (`Combatiente.efectoActivo`: cambia PdG,
  PdG.Esp, daño, Ef.Esp o crítico; suma a los golpes; o es Pajaritos, Lisiado, Ceguera, Silencio, Confusión, Extenuado, Atormentado, Maldito) no cuenta el
  turno en que se lo ponen aunque sea el propio: un estado de N turnos se tiene durante N turnos completos. Los pasivos, como antes. Stun y Miedo, con su
  propia regla.
- ✅ **P178. Daño de colisión** (dueño, 2026-10-08, vendaval): si un empujón choca contra algo (un Sólido, un token, el borde) antes de recorrer todo, hay
  daño de colisión — a definir cuánto y a quién (¿también a aquello contra lo que choca?). **Decidido (dueño, 2026-10-21): «Tira Constitución por cada
  casillero que le faltó recorrer, menos armadura. Y si es contra otro pj, cada uno usa la Constitución del otro».** Contra algo sólido, la Constitución
  es la del empujado; contra otro token, el empujado recibe la del otro y el otro la del empujado. Automatizado en el empujón del duelo (`avisoColision`,
  vtt-hexgrid/js/13): Mesa, Crónica y el Anuncio a quien maneja a cada uno.
- ✅ **P179. Identidad de las tiendas: ¿qué hacemos con Ramos generales?** (dueño, 2026-10-08: «quedó medio borrosa y redundante… quizás quitarla o
  buscarle una vuelta»). Hoy: Herrero (armas cuerpo a cuerpo, escudos, armaduras), Bazar arcano (consumibles, varitas, orbes, anillos, piezas de caster)
  y Ramos (un poco de todo + trampas, mochilas, cinturones y consumibles básicos). Propuesta: reconvertirla en la tienda del **cazador / talabartero**
  (cuero, madera y cuerda: armas a distancia, armaduras blandas, botas, piernas, cinturones, mochilas, trampas y lo de explorar), así las tres quedan
  ligadas a los tres estilos: Herrero = metal y Defensa (Fuerza/Constitución), Cazador = Destreza/Agilidad (distancia, sigilo, trampas), Bazar = Especial.
  También ordena la reparación por tipo de tienda. Detalle en `docs/rework-tiendas.md` («Identidad de las tiendas»).
  **Decidido y hecho (dueño, 2026-10-08): una tienda, tres «habitaciones»** — ⚒ Herrería (guerra pesada), 🧵 Talabartería (cuero, madera y
  cuerda) y ✨ Bazar arcano, que abren a la vez como pestañas de la misma tienda («ir a más de una tienda es burocratizar»; así cada estilo sabe
  dónde buscar y no está todo mezclado). El GM tilda qué secciones abre (por defecto las tres; el tamaño es el total y se reparte); sin pestaña
  «Todo», pero si lo que se busca está en otra pestaña, se avisa. Un solo carrito. La reparación sigue siendo un solo botón que repara todo; se
  separa por sección cuando se defina si existe el «loot mágico».
- ✅ **P180. Consumibles que curan estados, por grupo** (dueño, 2026-10-08: «crear un ítem para cada debuff es un pésimo diseño; agruparlos
  conceptualmente: lisiado y sangrado, todo tipo de venenos, confusión, miedo e ilusiones… para tener consumibles útiles y que la única salida no sea
  el Cura Plus, y que el Cura Plus además sea caro»). Retoma el pendiente del 2026-09-22 («cura estados» por familia) y se cruza con P173 (grupos
  de buffs y debuffs). Propuesta en la conversación del 2026-10-08: Heridas (Vendas), Venenos (Antídoto), Mente (Té de tilo), Aturdimiento
  (Sales aromáticas), Elementales (Ungüento), Fatiga (Mate cebado); lo que no se cura con un consumible queda afuera; Cura Plus = todo, caro.
  **Decidido y hecho (dueño, 2026-10-08):** los seis grupos como se propusieron (Ceguera en Mente, Lento en Fatiga) y sus curas, Comunes, «legacy»
  (en toda tienda) y a 25 DDE: Vendas (heridas: + Rengo), Antídoto (venenos), Té de tilo (mente), Sales aromáticas (aturdimiento), **Ungüento de la
  Turca** (elementales, nombre del dueño) y Mate cebado (fatiga). El **Cura Plus** cura todos los grupos, Buena calidad, 120 DDE. Automático al usarlos
  (`Combatiente.GRUPOS_CURA`, `grupoCuraDe`, `curaDeItem`, `curarEstados`; el ítem lleva `curaEstados`).
- ✅ **P181. Disponibilidad y variedad de cada sección de la tienda** (dueño, 2026-10-08: «¿cuánta disponibilidad tiene que haber? … en la
  talabartería tiene que haber muchas trampas. Trampas, pociones que no son de curación y pergaminos: los jugadores no gastan plata en eso hasta
  que están sobrados… amplia disponibilidad, para fomentar el uso; y frecuentes en los drops de los creeps… definir un porqué a la disponibilidad
  y la variedad de cada tipo»). Hoy una capital trae ~2 trampas, 3 pociones y 1 pergamino (los gastables compiten con el equipo y casi no son
  Comunes). Propuesta del 2026-10-08: equipo (piezas únicas, pocas) y **góndola de gastables** aparte (muchas variedades, no se agotan) por sección;
  drops de gastables más frecuentes. Ver la conversación.
  **Decidido y hecho (dueño, 2026-10-08):** se separan equipo y **góndola de gastables** (trampas, pociones que no curan, pergaminos, luces: no compiten
  con el equipo, 3 unidades de cada uno, se reponen al volver a publicar); la calidad de un consumible pesa más en los drops que en la tienda (el
  precio ya filtra; a nivel bajo salen más los de calidad baja). Más ítems por pestaña: el tamaño pasa a ser por sección. La Talabartería trae siempre
  una mochila y un cinturón desde pueblito. Drops: humanos 60 %, humanoides 45 %, el resto 15 %; un jefe, uno seguro y chance de otro. Todos los
  consumibles se van a revisar más adelante (los diseñó a ojo); las clasificaciones ya quedan armadas.
- ❓ **P182. ¿La Moneda Re-Roll cuesta No2? — 2026-10-09, abierta para la mesa** (dueño: «teníamos un hueco legal ahí»). Hoy la moneda se usa en
  cualquier momento **sin pagar No2**, esté en el **cinturón o en la mochila** (cualquier otro consumible cuesta 1 No2 desde el cinturón y 2 desde la
  mochila), y después se tira la moneda: par se conserva, impar se rompe. **Por ahora queda así, como excepción al uso de No2** (dueño). Para
  debatir con el grupo: ¿debería costar como un consumible (1 cinturón / 2 mochila)? ¿Solo desde el cinturón? ¿Una por turno o por combate?
  Va también a Herramientas de diseño → Preguntas (para los colegas).
- ❓ **P183. La distancia mínima del arco — 2026-10-09, abierta para la mesa** (dueño: «lo podemos dejar como discutible»). **Por ahora**: con el
  arco hacen falta **al menos 2 casilleros libres** entre el arquero y el objetivo (objetivo a 3 o más), con el arco no se pega cuerpo a cuerpo ni se
  hacen ataques de oportunidad. Para debatir con el grupo: ¿se puede disparar más cerca, **con desventaja**? Por ejemplo, **cara a cara** (adyacente)
  el rival tiene un **ataque de oportunidad** («hay algo en tensar el arco que lleva tiempo»); y a **2 o 3 casilleros**, ¿alguna desventaja extra?
  Ver [`rework-armas-rango.md`](rework-armas-rango.md). Va también a Herramientas de diseño → Preguntas (para los colegas).
- ❓ **P184. El arco y el sigilo — 2026-10-09, para afinar más adelante** (dueño: «el dilema eterno… un dilema filosófico previo a
  Aristóteles»). Regla de hoy: quien es atacado por alguien **en sigilo** tira **1 de Evasión**. Con el arco eso arma un francotirador: dispara
  escondido desde lejos, sin riesgo, y la Evasión de 1 le da muchos niveles de crítico (el Tipo 4 es el de rango más chico). Para debatir:
  ¿disparar rompe el sigilo (o lo rompe después del primer tiro)? ¿El primer disparo desde el sigilo vale como «sorpresa» y los siguientes no?
  ¿La Evasión 1 vale a cualquier distancia o solo cerca? ¿Hace falta una tirada de sigilo al disparar? Ver P183 (distancia mínima) y
  [`rework-armas-rango.md`](rework-armas-rango.md).
  **Decidido en parte (dueño, 2026-10-09; sin programar todavía, «después evaluamos cómo funciona el resto»):** **disparar rompe el sigilo**;
  **solo el primer disparo cuenta como sorpresa**; **la Evasión 1 vale solo de cerca**. Idea para después: el arco hace ruido y, si se dispara
  desde el sigilo, hay que tirar para que no te escuchen (y se complica con las armas de fuego). Sigue abierto el resto.
- ❓ **P185. La comba (tiro curvo) — 2026-10-09, para pensar** (dueño: «no le veo tanta diferencia [con el tiro alto]… lo pensaría»). Propuesta: la
  flecha dobla y rodea un obstáculo **Sólido** (alguien detrás de una columna), algo que el tiro alto no hace (pasa por encima de los tokens, no de
  los muros); regla posible: «la línea puede quebrarse una vez» (vale si hay una casilla intermedia que ve al objetivo y que se ve desde el
  arquero), desde Raro, con PdG −1. **No se programa** hasta que el dueño decida. **Dueño (2026-10-09): «la comba podemos incluirla, pero habría
  que establecer cuán curva es… dejémosla para después».** Lo que falta definir: cuánto dobla (¿una casilla de desvío? ¿un ángulo?). Lo ya decidido y programado: la línea de tiro, el tiro alto y la
  distancia ideal (ver [`rework-armas-rango.md`](rework-armas-rango.md)).

- ❓ **P186. La armadura pesada contra quien no suma Fuerza — 2026-10-10, del estudio de peleas** ([`balance-peleas.md`](balance-peleas.md)). En las peleas simuladas, el Tanque (Defensa 11 / 15 / 20) es casi intocable para el tirador y el asalto (0 %), y el rango se cae desde nivel 3 contra armadura media: la Defensa sube más rápido que el daño de las familias que no suman Fuerza. Palancas medidas (ninguna aplicada): Perfora por calidad en dagas y ballestas (arregla contra armadura media, no contra el tanque), armadura al 75 %, y un daño mínimo de ¼ (arregla al tanque pero se pasa). Medido después: la que mejor acomoda es **un daño mínimo de 1 por dado** (si el golpe entra y la armadura lo frena todo, pasa 1 por cada dado del arma): el tanque deja de ser intocable sin cambiar al guerrero contra el tanque; la Perfora sin tope se pasa contra armadura media. Propuesta: probar esa regla y ajustar fino con la Perfora de cada arma. **Decide el dueño.**
  **Dueño (2026-10-10):** el daño mínimo **no**: «ponerle un daño arbitrario es un parche poco sofisticado»; **amerita un debate más profundo**.
  Además, **las habilidades del asalto y del mago van a cumplir esa función** (mejorar el crítico, etc.): medir la armadura pesada con ellas.
  **Dato (2026-10-10, peleas simuladas):** las dagas **con Crítico frecuente rinden peor** que las que no lo tienen (asalto contra guerrero, nivel 3:
  22 % contra 59 %; nivel 5: 34 % contra 73 %): la Resistencia a crítico Tipo 4 lo apaga y esas dagas resignan la Perfora. Hoy el Crítico
  frecuente en dagas está sobrevaluado frente a la Perfora (entra en la revisión de sinergias de bonos).
- ❓ **P187. Varitas Raras — 2026-10-10, del estudio de peleas** ([`balance-peleas.md`](balance-peleas.md)). No hay varitas de calidad Rara en el
  catálogo (solo Comunes y Buenas): en las peleas simuladas el mago con varita gana 72 % a nivel 1 y cae a 46 % a nivel 5 (usa Buenas). Opciones:
  crear varitas Raras (y Excepcionales), o que el daño de las varitas escale con el Especial. **Decide el dueño.**
- ❓ **P188. La hacha a dos manos frente a espada y escudo — 2026-10-10, del estudio de peleas.** El guerrero con hacha a dos manos gana
  20–43 % contra las otras clases; con espada y escudo, 57–61 %. Revisar cuánto vale el arma a dos manos frente al escudo (Defensa, Parry contra
  disparos, Bloqueo) en la calculadora y el catálogo. **Decide el dueño.**
  **Dueño (2026-10-10): sí, darle más valor a lo de dos manos.** Falta definir cómo (más dados o daño por el mismo puntaje en la calculadora,
  un rasgo propio de las armas a dos manos…) y rehacer el catálogo con eso.
- ❓ **P189. Ignora Resistencia a crítico como identidad del Tipo 4 — 2026-10-10** (dueño: «la clave es ignora N resistencias al crítico,
  definitivamente va por ahí»). Hoy la Resistencia a crítico es tan abundante que el Crítico frecuente casi no suma contra armadura (peleas
  simuladas: una daga con +1 pasa de 2,1 a 2,1 de daño por ataque ante el guerrero). Plan a decidir: ¿de qué partes de la armadura se saca la
  Resistencia a crítico? ¿cuánto «Ignora N» llevan las Tipo 4 por calidad (y las Tipo 6, menos)? Rework de esas armas y medir con el simulador.
  **La cuenta (2026-10-10):** piezas de defensa con Res. crítico — Común (245): T4 12 %, T6 3 %, T8 1 %, T10 1 %; Buena (208): T4 18 %, T6 6 %,
  T8 3 %, T10 3 % (todas de a 1; no hay defensas Raras). Con ~7 piezas, un personaje junta ~1 de Res. T4. Armas que la ignoran: T4 Común 0/36,
  Buena 0/26, Rara 5/22, Excepcional 4/20; T6 Buena 1/33, Rara 1/33; T8+ ninguna. **Propuesta (dueño: «una frecuencia similar»):** T4 Común ~12 %
  e Ignora 1, Buena ~18 % e Ignora 1, Rara/Excepcional Ignora 1–2; T6 1–2 por calidad con Ignora 1. **Ojo:** el simulador de peleas usa la curva de
  Defensa máxima (Res. T4 2–3 en armadura media), más que el catálogo real (~1): antes de reworkear, medir con armaduras armadas del catálogo.
  **Corrección (2026-10-10, peleas con armaduras reales del catálogo, Común y Buena):** con las piezas reales, el guerrero de armadura media
  tiene Res. T4 ~0,7–0,9 (no 1–2) y **el Crítico frecuente sí rinde** (daga nivel 3: 7,3 → 9,3 de daño por ataque contra el guerrero; 1,6 → 3,0
  contra el tanque; tanto o más que Perfora 2). La «abundancia» venía de la curva máxima del simulador. Lo que sí aparece: **la armadura media
  real protege poco y el guerrero queda muy flojo** (ver [`balance-peleas-armadura-real.md`](balance-peleas-armadura-real.md)). Revisar antes
  de sacar Resistencia a crítico de la armadura.
- ❓ **P190. La armadura media — 2026-10-10** ([`diagnostico-armadura-media.md`](diagnostico-armadura-media.md)). No existe una armadura media: las
  piezas son o muy defensivas (el torso rígido) o utilitarias (Defensa 0); la mitad o dos tercios de cabeza, manos, piernas y pies no dan
  Defensa; el presupuesto se va en Defensa especial y resistencias elementales; ir pesado casi no tiene contras. El guerrero con piezas «medias»
  pierde casi todo (14–16 %) y con las más defensivas le gana al asalto y al tirador (76–81 %). Soluciones posibles: A tres pesos por parte
  (liviana / media / pesada), B contras reales para lo pesado, C Defensa más barata en las partes chicas, D encarecer o enrarecer la Defensa
  especial y las resistencias, E bono de conjunto, F posturas del guerrero. El dueño eligió **A + B + D** (2026-10-10). Medido con kits de prueba: −4 Evasión no alcanza (lo pesado sigue dominando); **−2 PdG con la
  pesada completa sí** (la media pasa a ser la mejor del guerrero), pero el tanque queda sin poder cerrar peleas (empata casi todo); −1 PdG se queda
  corto. Recomendación: −2 PdG + una habilidad del tanque que lo compense (F). **En pausa (dueño, 2026-10-10):** los pesos con contra que se acumula le parecen enroscados; si el desbalance no es desmedido,
  se regula con las habilidades y con el equipo que el GM pone a disposición. Se retoma cuando tenga tiempo para pensarlo.
- ❓ **P191. Backstab y el ataque por la espalda — 2026-10-10** (auditoría de skills de clase, Asalto). Hoy el mapa da el bono «por la
  espalda» solo si el atacante está **en sigilo** y en el **punto ciego** del rival. Backstab (2 SP): «Únicamente por la espalda. +5 de daño
  fijo. Ignora 1 de resistencia a crítico». Preguntas: (1) ¿exige sigilo, como la regla general, o le alcanza con el punto ciego (flanquear en
  pleno combate)? (2) ¿+5 de daño e ignora 1 por 2 SP? (se apila con el bono por la espalda del arma, +1/+2); (3) fuera de la espalda, ¿se usa
  igual como ataque común sin bono, o no se puede? Propuesta de Claude: la regla común (sigilo + punto ciego), los números así, y avisar sin
  bloquear; sumar «ignora resistencia a crítico» al bono por la espalda (sirve también para armas). **El dueño lo habla con el grupo**
  (anotada en 🛠 Herramientas de diseño → Preguntas).
- ❓ **P192. Paredes de línea: ¿cuándo una línea cierra un hexágono? — 2026-10-10** (mapa, las paredes de línea fina, `vtt-hexgrid/js/34-paredes.js`).
  Hoy una pared nunca ocupa un casillero: solo impide pasar de un casillero al de al lado si la línea queda entre sus centros (con el imán, la
  pared va siempre por los bordes y no hay duda). Un garabato a mano que cruza un hexágono por el medio deja que un token se pare ahí. Opciones:
  (1) dejarlo así; (2) cerrar el hexágono si la línea pasa cerca de su centro (por ejemplo, a menos de un tercio del radio); (3) cerrar todo
  hexágono que la línea toque (pared «gruesa», como la Colisión de casilleros). Propuesta de Claude: la (2). **El dueño lo define conversando.**
- ❓ **P193. Tronco de huída: ¿2 SP fijos o el doble en turno ajeno? — 2026-10-10** (auditoría de skills de clase, Asalto). Todo Flash cuesta el
  doble en turno ajeno (P136). Tronco de huída casi siempre se usa en el turno del rival (es una defensa), así que con la regla común costaría 4 SP.
  **El dueño la dejó en 2 SP fijos** (`turnoAjenoSp: "2"`), con la duda para el grupo (anotada en 🛠 Herramientas de diseño → Preguntas):
  ¿los Flash defensivos deberían pagar igual el doble, o tener su propio costo de turno ajeno?
- ❓ **P194. En pausa, ¿equipar o desequipar cuesta No2? — 2026-10-10** (pausa de la partida, probándola). Si el mapa quedó en modo combate al pausar,
  la ficha sigue cobrando como en combate: desequipar la ballesta pidió 1 No2 (con «Realizar de cualquier modo» si no alcanzan). Entre sesiones
  parece más natural que la pausa cuente como modo narrativo (sin costos de combate). Propuesta de Claude: mientras dure la pausa, la ficha no
  cobra No2 por equipar, desequipar ni pasar cosas a la mochila. **A decidir por el dueño.**
- ❓ **P195. Recargar en vez de disparar (la Manivela) — 2026-10-11** (ballestas). El dueño: «parece interesante, para cuando no puede atacar por lo
  que sea, adelanta los No2, ¿correcto?» — **Sí**: en un turno sin disparar se pagan los No2 de un disparo (la Recarga) y el primer disparo del
  turno siguiente sale gratis; no ahorra No2, los mueve a un turno en que sobraban. Falta decidir: (a) ¿regla de todas las ballestas o un rasgo de
  algunas (y en qué calidad)?; (b) ¿se paga con un botón propio «⚙ Cargar» en la Botonera? Propuesta de Claude: regla de todas las ballestas, con
  el botón; «Llega cargada» queda como la versión mejor (gratis, sin pagar antes). **A decidir por el dueño.**
- ❓ **P196. Anillo de armadura indestructible: ¿demasiado poderoso? — 2026-10-12, EN PAUSA (dueño: «lo vamos a revisar, ponelo en pausa porque
  puede ser demasiado poderoso»).** Absorbe la primera Armadura rota de cada combate (`absorbearmadura`). Ese mismo día se arregló para que funcione en
  personajes (antes no hacía nada: la rotura va a las piezas). Mientras se revisa, el anillo está **archivado** (`archivo: true` en
  `comun/catalogo.js`): no sale en las tiendas ni en el catálogo para comprar; quien ya lo tenga, lo conserva y le sigue funcionando. Falta decidir:
  ¿se baja (una sola vez por día, solo una pieza, Raro en vez de Común, más caro) o se saca?
- ❓ **P197. Invi (Asalto): ¿qué es frente al Sigilo? — 2026-10-13, EN PAUSA (dueño: «la dejamos como está, como anunciar, hasta que la debata
  con mis colegas»).** Original: «Invi [5] — Invi × 2 turnos. Se detecta con Percepción (DES). El rango para esta tirada depende de a qué velocidad
  se mueva: a velocidad normal (1 No2 por casillero) el rango es una flor de 3; a velocidad lenta (2 No2 por casillero), una flor de 2» (el pool
  decía «(ESP)»). Preguntas: (1) ¿un Sigilo mejorado (estado Invisible 2 turnos que no rompe el cono; solo lo descubre la Percepción de un rival
  dentro de su flor: diámetro 7 caminando normal, diámetro 5 caminando lento) o invisibilidad total sin tirada?; (2) la Percepción, ¿contra su
  Sigilo (Destreza) o contra su Especial?; (3) ¿se tira a cada paso dentro de la flor o una vez por turno?; (4) ¿la rompe una acción hostil (como
  el Sigilo) o solo el tiempo / ser descubierto?; (5) ¿5 SP + el No2 de entrar en sigilo (1)? Propuesta de Claude: la primera opción de cada una.
  Mientras tanto queda en el pool como «(Sin auditar)»: solo se anuncia.
- ❓ **P198. La honda: ¿cuánto alcanza? — 2026-10-14.** El dueño creó la categoría «honda» (arma de rango contundente: suma la mitad del
  Dmg, le tira al de al lado, sin tiro alto ni flechas, sin oportunidad) y pidió que el alcance no sea fijo sino «el rango con alguna
  penalidad». Idea del dueño: que la penalidad salga de la diferencia entre Fuerza y Destreza (pero, si la Fuerza es menor, el alcance
  terminaría siendo la Fuerza: «hay que pensarlo»). **Provisorio (Claude):** la mitad del Rango, para abajo (`Combatiente.HONDA_RANGO`,
  `alcanceHonda`). Falta: auditar la categoría y armar la serie de hondas del catálogo (ver `pendientes.md`).
- ✅ **P199. El robo en sigilo, sin anuncio — 2026-10-14.** **Decidido (dueño, el mismo día):** la víctima tira Percepción sin saber para qué («¿Sentiste un movimiento raro?»); si pierde, «Mmm… puede que estés flasheando» y se entera al empezar su próximo turno («sentís el cinturón más liviano… te falta X»); si gana, «¡juan pescó a X metiendo mano en su cinturón!» y el ladrón queda Marcado 2 turnos. Quien pierde el sigilo porque lo descubren queda Marcado 2 turnos; salir por las suyas no marca. Construido (vtt-hexgrid/js/47, js/03). Planteo original: El dueño: el robo puede dejar al ladrón en sigilo si sale bien, y «preferiría que la
  acción no sea necesaria, no sea anunciada» (hoy el cuadro se le abre a todos con «Sigilo contra Percepción», el jugador tira su Percepción, la Mesa
  anuncia la habilidad y la Crónica lo cuenta). Propuesta: si el ladrón está en sigilo, el robo es secreto — lo ve solo el GM, la Percepción del
  personaje se tira sola con su valor publicado, y nada va a la Mesa ni a la Crónica pública. Falta decidir: (a) si sale bien, ¿el robado se entera
  en el momento («te falta algo del cinturón»), recién al buscarlo, o nunca hasta que mire? (b) si sale mal, ¿lo pillan (queda revelado y se anuncia
  «juan pilló a X metiéndole la mano»)? Sin sigilo, el robo sigue siendo un duelo a la vista.
- ✅ **P200. Pasos silenciosos: cómo se consiguen — 2026-10-15.** **Decidido (dueño, el mismo día):** «Ataque por la espalda» = +1 PdG
  para cualquiera en el punto ciego del defensor; «Pasos silenciosos» es una **pasiva de job** que suma +1 PdG más por la espalda, y a quien
  la tiene se lo ve recién pegado, sin darle tiempo al otro a darse vuelta. Sin pasos silenciosos, al oírlo a 3 casilleros el personaje puede
  darse vuelta gratis, salvo que esté **flanqueado** (enfrentando a otro rival). Construido (comun/pasivas.js, vtt-hexgrid/js/02, 13, 17, 49;
  comun/duelo.js). Planteo original: Regla nueva (dueño, el mismo día, hecha): **el oído** — un rival a 3 casilleros
  o menos de un personaje se ve aunque esté en su punto ciego (salvo en sigilo; las paredes y los Sólidos tapan; no descubre el terreno;
  `OIDO_RADIO`, vtt-hexgrid/js/02–03). La excepción, en palabras del dueño: «ahí ya podemos jugar con habilidades, pasos silenciosos, sin que
  sea necesariamente sigilo, como un sigilo soft». El mapa ya la respeta: un estado con `pasosSilenciosos` (o llamado «Pasos silenciosos»)
  no se oye. Falta decidir quién lo tiene y cómo: ¿una pasiva (para personajes y creeps), un estado que da una habilidad (cuántos turnos,
  cuánto cuesta), o algo propio de ciertos creeps (lobos, felinos, goblins exploradores)? ¿Pisar ciertos terrenos (hojas secas, agua) lo anula?
- ✅ **P201. ¿Los creeps también se dan vuelta? — 2026-10-15.** **Decidido (dueño, 2026-10-30):** «los creeps también» (la pregunta le sale al GM por sus creeps visibles), y «la del sigilo reemplaza a la otra, no se suman»: atacar por la espalda desde el sigilo deja la defensa del defensor en 1, sin el +1 PdG. Las dos, automatizadas (vtt-hexgrid/js/49, comun/duelo.js `ataque.sorpresa`). Planteo original: La regla del dueño habla del personaje: «el pj debe tener la opción de darse
  vuelta». Hoy la pregunta le aparece solo a quien maneja un personaje o una invocación (vtt-hexgrid/js/49); a un creep que un personaje se le
  acerca por la espalda, el GM lo gira a mano si quiere. ¿Va también para los creeps (la pregunta al GM), o los creeps «poco inteligentes» no
  se dan vuelta? Y, relacionado: la Evasión 1 de atacar desde el sigilo por la espalda (regla del 2026-09-26, a mano), ¿sigue además del +1 PdG?
- ✅ **P202. ¿Un personaje puede comprar la pasiva «Vuela»? — 2026-10-16; decidida 2026-10-17.** **Decidido (dueño):** sí, «pero va a haber
  que justificarla narrativamente con el máster» (lo dice el detalle de la pasiva); el costo sigue en Job 3, provisorio. Pregunta original: El dueño pidió Vuela como pasiva para las abejas de Bizzante; como
  las pasivas de creeps e invocaciones salen del mismo catálogo que las de los personajes, también aparece en «+ Pasiva» de la ficha. Quedó con
  **Job 3, provisorio** (comun/pasivas.js). ¿Se ofrece a los personajes, a qué costo, o es solo de criaturas?

- ✅ **P203. El charco de agua y el rayo — 2026-10-17; decidida el mismo día (provisorio).** **Decidido (dueño):** vale para cualquiera
  (personajes, invocaciones, creeps) salvo que levite o vuele; el fuego lo seca; y «si hay algún efecto eléctrico que tiene probabilidad de
  dejar parálisis, que esa probabilidad aumente y que el daño también aumente, todo en un 50 % o el doble» (escuchaba sugerencias). **Quedó:**
  el daño de rayo ×1,5 (para arriba, `AGUA_MULT_RAYO`) y la Parálisis con el doble de chance, a quien está parado en el agua
  (vtt-hexgrid/js/50; comun/duelo.js `aguaParalisis`). Si en la mesa se siente poco, subir a ×2.

- ✅ **P204. La Calavera con vela (talismán) — 2026-10-18; decidida el mismo día.** **Decidido (dueño):** Luz portada +2, Visión +1, Defensa especial +2, y «siempre que te hagan objetivo de un ataque o habilidad, esto incluye los ataques con varitas, tienen que tirar un dado y tienen 50 % de tener miedo. Igual el miedo se resiste con resistencia mental». **Decisión final del dueño (mismo día), reemplaza a lo de abajo:** «mientras tengas la calavera, tenés un aura espeluznante de tres casilleros alrededor tuyo. Al ingresar a ese aura, tenés la tirada de resistencia contra miedo. Si pega, tenés miedo». Y el Miedo pasa a ser (para todo el juego): «cualquier movimiento en dirección al objetivo que te dio miedo cuesta 2 nitros. Y cualquier acción que lo tenga como objetivo tiene −1 a la probabilidad de golpe y −1 al daño, tanto comunes como especiales». Los detalles que faltan, en P209. Antes: **Corregido por el dueño el mismo día:** «la primera vez que te hacen objetivo en cada ronda, esa persona tiene que tirar resistencia mental para no quedar con miedo» (sin moneda). Quedó: el primero que te elige de objetivo en cada ronda tira Res.Mt contra el Ef.Esp de quien lleva la calavera; si no llega, queda con Miedo (el estado de siempre: −2 PdG, −2 Daño, 2 turnos, no se acerca a quien lo asustó). Provisorio: la dificultad (Ef.Esp) la propuso Claude. Pregunta original: El dueño: «me gusta, pero provocar miedo de forma constante y pasiva me parece medio
  broken. busquémosle la vuelta». Opciones: (a) activa: una vez por combate, 1 No2, alzás la calavera y los rivales a 2 casillas que te ven
  tiran Res.Mt o quedan con Miedo 1 turno; (b) una vez por rival: el primero que llega a pegado tuyo tira Res.Mt (una sola vez por combate cada
  uno); (c) de reacción: cuando te pegan cuerpo a cuerpo, 25 % de que quien te pegó tire Res.Mt o Miedo 1 turno. Hoja: docs/talismanes.md.
- ✅ **P205. La Estampita del Gauchito Gil (talismán) — 2026-10-18; decidida el mismo día.** **Decidido (dueño):** pasa a ser la **Estatuilla del Gauchito Gil**: «la primera tirada de probabilidad, evasión o parry de una ronda se tira como afortunado, se tira doble y se elige la mejor», y Defensa especial +2. (Claude: «probabilidad» = PdG o PdG.Esp; una sola tirada por ronda, la primera de esas.) Pregunta original: ¿Afortunado una tirada o N turnos? Opciones: (a) una tirada: una vez por
  combate repetís una tirada tuya que ya salió y te quedás con la mejor (como el 🧚 Re-roll, sin SP); (b) una vez por combate te ponés
  Afortunado 1 turno (PdG, Parry y Evasión dos veces, la mejor); (c) empezás el combate Afortunado 2 turnos.
- ✅ **P206. El Muñeco vudú (talismán) — 2026-10-18; decidida el mismo día.** **Decidido (dueño, la recomendación de Claude):** PdG.Esp +1 y, la primera vez en cada turno que pegás con una varita, el objetivo queda Debilitado 1 turno (se apila con la Maldición debilitante). Antes, **el dueño (mismo día):** PdG.Esp +1, y en vez de inventar «Embrujado», usar un estado que ya exista y quede parecido (a elegir). Lo de abajo es la propuesta original: Idea del dueño: al usar la varita contra un rival, queda marcado 1 turno. Falta: (a) solo
  tus golpes le pegan +1, sin tirada aparte (si la varita entró, queda); (b) +1 al daño de todo el grupo contra él (más fuerte, para más
  calidad); (c) +1 PdG y +1 daño tuyos. Va con un estado propio («Embrujado»), no con Marcado (que es del sigilo).
- ✅ **P207. El estado Sueño (para el Atrapasueños) — 2026-10-18; decidida el mismo día.** **Decidido (dueño):** el Atrapasueños da Defensa especial +2 y Res.Mt +3 (sin inmunidad). El estado Sueño no se crea por ahora (queda en GRUPOS_CC.mental por si vuelve; la Campana de bronce saca Pajaritos y Confusión). Pregunta original: Propuesta: Dormido no actúa ni se mueve, su Evasión es 1 (como Stun), el
  primer daño que recibe lo despierta; 2 turnos; se resiste con Res.Mt; control (lo frena la Inmunidad a CC). ¿Quién lo da (una varita, creeps)?
  Si no se define ahora: el Atrapasueños da inmunidad a Pajaritos y Confusión hasta que exista Sueño.
- ✅ **P208. La maldición de la Cabeza reducida (talismán) — 2026-10-18; decidida el mismo día.** **Decidido (dueño):** «a la cabeza reducida le vamos a dar +1 al daño especial. Y siempre que pegue con una varita por primera vez en un turno, el objetivo queda maldito» (el estado Maldito de siempre: cada SP que gaste le saca 1 de vida, 2 turnos). Confirmado (dueño): el +1 es al Ef.Esp y conserva la Res.Mt +2. Pregunta original: Al pegar con una varita (una vez por turno), opciones: (a) la idea
  original: se le critica más fácil, −1 Res. crítico a todos los Tipos por 2 turnos (le sirve al grupo); (b) Debilitado 1 turno (−1 a sus
  tiradas; ya existe, pero pisa la Maldición debilitante del Debuffer); (c) Maldito 1 turno (cada SP que gaste le saca vida; pisa la Maldición
  de la sangre).
- ✅ **P209. El Miedo nuevo: los detalles — 2026-10-18; decidida el mismo día.** **Decidido (dueño):** dura hasta que empieza el próximo turno de quien lo tiene; se tira cada vez que se entra al aura; la tirada es el Ef.Esp de quien lleva la calavera contra la Res.Mt de quien entra; solo a los rivales; reemplaza al Miedo de antes. **Quedó** (2026-10-18): el preset Miedo (`miedo`, `miedoDe`, `alEmpezarTurno`), el costo de 2 No2 por paso hacia quien asustó (vtt-hexgrid/js/04 `costoPasos`), el −1 PdG y −1 al daño en el duelo (`ataque.miedo`) y el aura (vtt-hexgrid/js/52). El empate lo gana la calavera (como las zonas). ✋ A mano: el −1 en un área u onda. Pregunta original: El dueño redefinió el Miedo (P204): moverse hacia quien te asustó cuesta 2 No2 por
  casillero, y todo lo que hagas contra él va con −1 PdG/PdG.Esp y −1 al daño (común y especial). Faltan: (1) ¿cuánto dura? — 2 turnos como
  hoy, o mientras sigas adentro del aura de la Calavera; (2) ¿se vuelve a tirar cada vez que alguien entra al aura, o una vez por combate por
  rival?; (3) la Res.Mt, ¿contra el Ef.Esp de quien lleva la calavera o contra un número fijo?; (4) el aura afecta solo a rivales (propuesta);
  (5) el Miedo de las habilidades de creeps y del catálogo pasa a ser este (sin el −2/−2 general de antes).
- ✅ **P210. Separar el control (CC) de lo mental — 2026-10-18; decidida el mismo día.** **Decidido (dueño):** sirven los grupos, las inmunidades y que el estado mande la resistencia por defecto. **Quedó:** `Combatiente.GRUPOS_CC` — 🧠 mentales (Miedo, Confusión, Provocado, Sueño, Silencio: Res.Mt), 💫 aturdimiento (Stun, Pajaritos, Parálisis, Exhausto: Res.CC), 🦵 heridas (Lisiado, Rengo: Res.CC), 👁 sentidos (Ceguera: Res.CC), ⛓ atrapar (Inmovilizado, Lento: Fuerza), 🤸 equilibrio (Sentado: Agilidad), ✋ desarme (Desarmado: Fuerza). La Inmunidad a CC frena todos; la Inmunidad mental (preset nuevo), solo los mentales. Los asistentes de la Ejecución y de las trampas proponen la resistencia del estado. Silencio como mental y Ceguera con Res.CC: confirmados por el dueño el mismo día. **Precisión del dueño (mismo día):** «lo que hoy llamamos crowd control debería englobar todos los efectos de crowd control. Y ahí tiene que haber uno que divida entre los que se defienden con resistencia mental y los que se defienden con algún otro stat, que depende de cómo podemos definir todos los de crowd control que no son mentales». O sea: CC es el paraguas; adentro, los mentales (Res.Mt) y los no mentales, con su stat por definir. Lo de abajo es la primera propuesta (queda superada en lo de las dos familias separadas): El dueño: «tenemos que separar lo que es crowd control, lo que es efectos
  mentales, sobre todo para definir las resistencias y algunos efectos de inmunidad». Hoy: 14 estados llevan la marca de control (`esCC`:
  Pajaritos, Exhausto, Stun, Confusión, Lisiado, Inmovilizado, Rengo, Lento, Miedo, Provocado, Parálisis, Silencio, Sentado, Desarmado) y la
  Inmunidad a CC los bloquea a todos, aunque su texto nombra solo los físicos. Con qué se resiste lo elige cada habilidad o trampa (Res.CC,
  Res.Mt o Res.Esp), sin regla. Propuesta de Claude: dos familias — **control** (el cuerpo; Res.CC, de Constitución; lo frena la Inmunidad a
  CC): Stun, Inmovilizado, Rengo, Lento, Sentado, Lisiado, Exhausto, Parálisis, Pajaritos, Desarmado — y **mental** (la cabeza; Res.Mt, de
  Especial; lo frena una Inmunidad mental nueva): Miedo, Confusión, Provocado, Sueño y quizás Silencio y Ceguera. El estado dice con qué se
  resiste por defecto; la habilidad lo puede cambiar (el asistente lo propone solo).

- ✅ **P211. Auditoría de los pergaminos — 2026-10-19; cerrada el 2026-10-20** (todo lo decidido, en la hoja; los 69 en uso, auditados). El dueño: «los pergaminos los creé hace siglos: pegate una auditada». Hoja
  completa en [`auditoria-pergaminos.md`](auditoria-pergaminos.md). Lo principal: los «todo el combate» no terminan nunca (error); Piernas de
  Viento e Ímpetu hoy dan No2 (muy baratos); Ojo del Verdugo +3 de Crítico frecuente; Buena Fortuna, Inmunidad a CC y Blindaje fuertes para
  un combate entero a 125; Regeneración y Escudo Especial flojos; los seis «de crafteo» sin efecto definido; Velo Eterno ¿Res.Esp o Def.Esp?
- ✅ **P212. Auditoría de las pociones — 2026-10-20; cerrada el mismo día** (todo lo decidido, en la hoja). Hoja completa en [`auditoria-pociones.md`](auditoria-pociones.md): Sangre de
  dragón no termina nunca; Piernas de Viento, Ímpetu, Segundo aire e Hypeado dan No2 baratos; Ojo del Verdugo +3; Buena Fortuna, Inmunidad a CC,
  Blindaje y Escudo Especial caros; Invulnerabilidad barata; las «grandes» de 3 cargas mal de precio; Elixir de Fénix flojo; falta SP Común.

- ✅ **P213. Etéreo como estado — 2026-10-20; decidida el mismo día.** El dueño: «podemos definir ya etéreo como un estado para futuros usos». Hoy es una marca propia del
  Ojo de Kicillof (se ve medio transparente; no es objetivo de nada; atraviesa personajes, Sólidos y paredes; no pisa trampas ni zonas; sin
  oportunidad). Propuesta de Claude: un estado **Etéreo** por turnos con todo eso, que cualquiera puede poner; el Ojo lo lleva puesto. Tampoco
  lo pueden elegir los aliados (ni curar ni bufear); la excepción futura sería Dispel Magic. **Falta decidir**: ¿un etéreo puede atacar o usar
  habilidades sobre otros? Propuesta: no (solo moverse y usar cosas sobre sí mismo); el mapa avisa con «hacerlo igual (lo decide la mesa)».
  **Decidido (dueño)**: «un personaje etéreo no puede atacar ni puede ser atacado; solamente puede observar hasta que se pierda el estado».
  Hecho: preset «Etéreo» (2 turnos), `Combatiente.etereo`; en el mapa nadie lo elige de objetivo y atacar, habilidades y consumibles avisan
  con «Hacerlo igual»; moverse sí. El Ojo de Kicillof lo lleva puesto. Probado en el mapa. Nota del manual «Etéreo».

- ✅ **P214. El rayo en el charco: ¿salto y corriente, o una sola cosa? — 2026-10-20; decidida el mismo día.** Probado en el mapa (Varita de chispa eléctrica contra
  Silvia parada en un charco, con el Lobo en el mismo charco): el Lobo recibió **dos veces**, el salto eléctrico (6, la mitad de lo que le
  entró a Silvia, ×1,5 por el agua) y además la corriente por el agua (9, el golpe entero ×1,5). Hoy las dos reglas se suman. Propuesta de
  Claude: la corriente le llega a todos los del charco y el salto arranca desde ahí pero **saltea a los que ya recibió el agua** (salta al más
  cercano que no esté en el charco). Alternativa: dejarlo como está (el agua es muy mala idea con un rayo cerca).
  **Decidido (dueño): el salto nunca repite objetivo y cada salto pega menos que el anterior.** Regla: cada salto, la mitad de lo que le entró al
  anterior (para abajo), menos su Res. eléctrica; si el que recibe está en el agua, × 1,5 (para arriba): en el agua cada salto pega el 75 % del
  anterior. Desde alguien en un charco, el salto llega a todos los de ese charco sin límite de distancia (primero ellos, del más cercano) y después
  sigue afuera (4 casillas, al mismo bando). Un golpe de rayo que no salta, contra alguien mojado, igual salta solo por el charco. Se fue el «todos los
  del charco reciben el golpe entero». Ejemplo, 10 a cinco en fila: sin agua 10, 5, 2, 1; todos en el charco 15, 11, 8, 6, 5.

- ✅ **P215. ¿La recarga mínima de 1 SP por turno vale también para los personajes? — 2026-10-20; decidida: sí (dueño).** El dueño la fijó para los creeps con SP («aunque
  tenga tres, uno de Especial recarga uno de SP»). Hoy un personaje recarga la mitad de su Especial (`spregen: floor(esp/2)`): con Especial 1, 0 por
  turno. Propuesta: la misma regla para todos (mínimo 1). **Hecho:** `FichaCalculo.calcular` deja el SP Regen final en 1 como mínimo.
- ⏳ **P216. La economía del SP: ¿las habilidades que suman Efecto especial están baratas? — 2026-10-21 (dueño, con la Bola de fuego de creep).**
  El dueño: «puede ser que los skills también estén baratos… el sistema de cooldown termina siendo o muy rápido (uno sí, uno no) o muy lento (uno sí,
  dos no); el SP debería poder tener más matices. Un caster con Especial 15 debería tener una amplia regeneración, pero las habilidades que le suman
  Efecto especial al daño tienen que costar mucho más».
  **Los números (2026-10-21):** jugadores y creeps tienen la misma cuenta: SP máximo = Especial × 3 (un caster de Especial 15: 45 SP) y recarga =
  la mitad del Especial (7 por turno). Una pelea dura 3 a 5 turnos: el caster tiene unos 45 + 4 × 7 ≈ 73 SP para gastar en toda la pelea, así que
  cualquier habilidad de hasta ~7 SP se puede tirar **todos los turnos** sin agotarse (ya lo había mostrado la simulación del 2026-10-07: «el SP casi
  no frena»). El freno real por turno es el No2: el Orbe arcano del Mago (1d12+4 directo en área) cuesta 4 SP y **5 No2**, y eso lo deja en uno por
  turno. Comparación de daño: Orbe arcano ≈ 10 por objetivo (4 SP); Bola de fuego de creep con ¼ del Ef.Esp ≈ 8 por objetivo + Quemadura (3 SP):
  **la del creep está a la par de la del jugador; las dos están baratas en SP.** El Toque mágico del Mago suma el Ef.Esp entero (3d6 + Ef.Esp) por 3 SP.
  **Propuesta de Claude — el costo en SP según cada cuánto se quiere que salga:** con la recarga R ≈ la mitad del Especial, una habilidad que cuesta
  ~R sale todos los turnos; ~2R, uno sí y uno no; ~3R, uno de cada tres; el resto del SP (el máximo) da un arranque fuerte de 2 o 3 usos. Para que
  escale sola con el caster, **las que suman Efecto especial cuestan su Especial en SP** (≈ 2R: uno sí, uno no, sea del nivel que sea); en modo
  cooldown, cooldown 2. Las grandes de área, 1,5 × Especial (≈ uno de cada tres). Y quizás bajar el SP máximo de los creeps (Especial × 2) para que
  el arranque no sea tan largo. Falta decidir: el criterio, si vale también para los jugadores (el Toque mágico, el Orbe arcano) y una simulación
  con el criterio elegido. **La página para debatirla con la mesa:** https://claude.ai/artifact/C7VPwWPg9BpWfF1L1hUGb6 (dueño: «dejemos la pregunta
  abierta para debatir con mis colegas»). Mientras tanto, la Bola de fuego de creep ya usa «cuesta su Especial en SP», para probarla.
  **Decidido el criterio general (dueño, 2026-10-23):** «cualquier skill que sume Efecto especial en su daño va a tener un costo proporcional al
  Efecto especial; después afinamos el caso particular». Por ahora, como la Bola de fuego: cuesta su Especial en SP (`spCosto: 'esp'`). Una skill de
  daño fijo (sin Ef.Esp) lleva un costo fijo. Sigue abierto: la proporción de cada caso, si vale igual para los jugadores, y la recarga.
  **Otra posibilidad (dueño, 2026-10-21): reducir la recarga, o quitarla.** La cuenta: en una sola pelea la recarga casi no pesa (el mago de
  Especial 13 tiene 57 SP con la de hoy, 48 con la mitad, 39 sin recarga: en los tres casos, una habilidad de 3 SP sale todos los turnos); donde
  cambia todo es entre peleas: hoy el SP también se recarga fuera de combate (cada pelea empieza llena). Si se quita la recarga y el SP vuelve solo
  al descansar o al pasar de día, pasa a ser un recurso del día entero (3 o 4 peleas por día: ~10 a 13 SP por pelea). Opciones: 1) subir el costo de
  las que suman Ef.Esp; 2) reducir la recarga (sola, cambia poco); 3) quitarla y que vuelva al descansar (cambia la forma de jugar); 4) combinar.
  **Simulación de un día (2026-10-21; 3 peleas, mago de Especial 13 con Toque mágico; usos del Toque por pelea · daño por pelea):**
  hoy 4/4/4 · 90/90/90; cuesta su Especial 4/4/4 (igual: el SP guardado, Especial × 3, alcanza para todo); cuesta su Especial + SP guardado × 2
  3/3/3 · 71; cuesta su Especial + recarga a la mitad 3/3/3 · 71; las dos cosas 2/2/2 · 52; barato + sin recarga (SP por día) 4/4/4 (igual);
  cuesta su Especial + sin recarga, SP por día 3/0/0 · 69/8/8 (se gasta todo en la primera pelea); cuesta su Especial + recarga a la mitad, SP
  por día 3/1/1 · 71/33/33. Con peleas de 6 turnos: hoy 6 usos, cuesta su Especial 5. **Conclusión: ninguna opción sola cambia una pelea de 4
  turnos; lo que manda es el SP guardado. Lo que de verdad da matices es combinar el costo con un SP guardado más chico o una recarga menor.**
  **En pausa (dueño, 2026-10-21): «déjalo pendiente para cuando tenga tiempo de encarar el tema de la recarga».**
  **Análisis con la recarga (2026-10-22, Claude, a pedido del dueño: «contemplando que existe la regeneración, lo cual hace que el SP sea más
  barato»).** Simulado con Especial 9 y 15 (arranca lleno, recarga al empezar cada turno, una por turno). Hoy el SP máximo (Especial × 3) son seis
  turnos de recarga: en una pelea de 4 turnos el de Especial 15 tiene 45 + 3 × 7 = 66 SP y la recarga es solo un tercio; todo lo que cueste hasta
  su Especial sale todos los turnos, y para «uno sí, uno no» tendría que costar 2 × Especial. **Propuesta:** SP máximo = Especial × 2 (la recarga
  pasa a ser el 41 % del SP de la pelea) con la recarga igual, y costos por familia: utilidad 2–5 fijos (XXXX); suma Ef.Esp a uno = su Especial
  (XX·X); suma Ef.Esp en área = 1,5 × (X·X·); las que definen la pelea = 2 × (X···). Da lo mismo con Especial 9 y 15 porque escala sola. Fuera,
  por ahora: el SP por día (sin recarga entre peleas) y bajar la recarga. **El dueño lo llevó a debatir con sus colegas (2026-10-22): «después lo
  elaboro con vos».**

### P217 — ¿Una bestia puede hacer Parry con sus garras? (2026-10-21) ✅ decidida y hecha el mismo día
**Decisión (dueño): mecánicamente sí, para todos —si en cada caso tiene sentido lo decide la mesa—; el peso es el del arma (el ítem del catálogo que se le equipa y se marca natural), 1 si no tiene.** El arma natural va última: un arma o un escudo de verdad, primero. Y no se cae al desarmar.
Contexto: la habilidad **Desarmar** (choque pesado) funciona en el paso del Bloqueo, que solo existe después de un Parry. El dueño dijo que una
bestia (un oso hormiguero) «puede parrear con sus garras y obligar a desarmar a su rival». Pero hoy un arma natural **no** sirve para Parry
(`Combatiente.armaParaDefensa`: «un arma natural tampoco, por ahora», regla del 30/9). Mientras tanto, una bestia con Desarmar solo desarma
**atacando** (cuando el personaje le hace Parry a ella). Pregunta: ¿se permite el Parry con armas naturales (para todos, o solo para bestias)?
¿Con qué peso para el Bloqueo?

- ✅ (decidida 2026-10-22, «dale con las recomendaciones»: D1–D7 de `docs/plan-inventario-creeps.md`; Desarmado = no tener nada en la mano, sin arma se ataca como en P150, cualquiera levanta cualquier arma, creeps e invocaciones con ítems guardados; en construcción por pasos) **P217. Desarmado deja de ser un estado, y el arma de un creep que levanta otro** (2026-10-22, dueño: «desarmado no debería ser un
  estado: desarmado es no tener un arma equipada»). Contexto: a un **personaje** el arma ya le sale del inventario al caer, así que el estado
  sobra. A un **creep o una invocación** el arma no es un ítem (es parte de sus datos): hoy el estado Desarmado es la forma en que el mapa sabe
  que la perdió; se reemplazaría mirando si su arma está en el piso. Falta decidir: (a) **atacar sin nada en la mano**: hoy hay un provisorio
  (P150: 1d4 + Daño); el dueño dijo «se tira a mano y se resuelve en la mesa hasta que definamos» — ¿se saca el 1d4 + Daño y queda un aviso
  ✋, o queda como sugerencia editable? (b) **si otro levanta el arma de un creep** (hoy se puede): el creep que la perdió sigue teniéndola en
  sus datos (cuando le sacan el Desarmado vuelve a pegar con ella como si nada) — ¿pasa a pegar «sin arma» hasta conseguir otra? Y el creep
  que la levanta la guarda en su equipo, pero sigue atacando con su arma de siempre — ¿se puede cambiar de arma? *(código, cuando se decida)*
  **Dirección del dueño (2026-10-22):** «todo lo que tenga manos debería poder usar lo mismo»: un creep humanoide (y una invocación) usa las
  mismas armas, escudos y talismanes que un jugador, con una especie de inventario: si levanta un arma, guarda la suya y después las cambia.
  Implica que el arma del creep deje de ser un dato fijo y pase a ser un ítem (como la del jugador): ver el plan, cuando se arme.

### P218 — Consumibles con dificultad mínima: ¿a cuáles se les aplica? (2026-10-23) ✅ decidida y hecha el mismo día

**Decidido en parte (dueño, 2026-10-23):** (1) **sí, el mínimo para detectar las trampas compradas, por calidad: Común 6, Buena 8, Rara 10**
— hecho (`Combatiente.DETECTAR_MIN_TIER` / `detectarMinDe`, `detectarMin` en `trampaDeHab`; personaje y creep); las flechas especiales no dejan
en No2 negativos (el creep, igual que el personaje: gasta hasta 0 y avisa en rojo). Los puntos 2–4 («los cauces, efectivamente»): a confirmar
qué quiso decir antes de programarlos.
**Y el Efecto especial de los pergaminos (dueño, 2026-10-23: «lo mismo el especial para pergaminos que lo requieran: la calidad mínima de algunos
efectos de consumibles»):** un consumible con Ejecución que usa tu Ef.Esp —para tirar o como dificultad— lo toma como mínimo según su calidad
(Común 6, Buena 8, Rara 10): `Combatiente.conMinimoDeCalidad` (en `habDeConsumible`), `tira.min` en el duelo. La Red Nerubian (Buena) pasa de
mínimo 6 a **8**. El PdG.Esp con que se tira la Red queda sin mínimo (dueño: «está bien que sea PdG.Esp»).
**Trampas mágicas (dueño, 2026-10-23, «sí»):** las 9 que se compran con escape (Trampa de escarcha, Runa de debilidad, Arena movediza, Lluvia de
cascotes, Runa de silencio, Succión arcana, Tumba de hielo, Espejo de discordia, Portal cósmico): evitarlas o soltarse es contra el **Ef.Esp de quien
la puso, con el número de la tabla como mínimo** (`difStat: 'dmgesp'` + `difMin` en `salvacion` / `soltar`); la Arena movediza (Buena) pasó de 6 a
8 para entrar en el patrón (evitar: Común 7, Buena 9, Rara 11; soltarse: 6, 8, 10). Las físicas siguen fijas. ✅ P218 cerrada (lo de «los cauces»,
descartado por el dueño).
**Ajuste (dueño, 2026-10-23, el mismo día): todo pasa a 7, 9, 11** («la dificultad en 7 para las comunes, partiendo de ahí»): detectar una
trampa comprada, el mínimo del Ef.Esp de los pergaminos (la Red Nerubian, mínimo 9) y soltarse de cualquier trampa comprada (Trampa de oso y Red
de caza 7; Cepo reforzado, Cola de carpintero y Arena movediza 9; Cepo de dientes de sierra, Resina de árbol negro y Tumba de hielo 11). Evitarlas
ya era 7, 9, 11. Una sola tabla: `Combatiente.DETECTAR_MIN_TIER`.

Regla del dueño (2026-10-23), ya aplicada al **Pergamino de red Nerubian**: la dificultad para soltarse es el **Efecto especial neto** de quien lo
usa (su valor, no una tirada), **con un mínimo de 6** («es algo que vos pagaste, es consumible, solo funciona una vez»); si quien lo usa tiene más,
sube. En el código es el dato `difMin` (en `soltar`, `salvacion`, la zona que deja: `Combatiente.efectoDeEjecucion`, `trampaDeHab`,
`zonaEstadoDe`). Candidatos para la misma regla (propuesta de Claude, a decidir):
1. **Las ~40 trampas consumibles** (Trampa de oso, Red de caza, Arena movediza, Runas, Portal cósmico…): la **dificultad para detectarlas** hoy es
   tu Destreza (físicas) o tu Efecto especial (mágicas), **sin mínimo**: con un stat bajo, tu trampa comprada es fácil de ver. Propuesta: mínimo
   por calidad (Común 6, Buena 7, Rara 8…).
2. **La salvación / el soltarse de las trampas mágicas** (Arena movediza, Tumba de hielo, Runa de debilidad, Succión arcana, Portal cósmico,
   Espejo de discordia): hoy es un número fijo (6, 7…). Propuesta: tu Efecto especial neto, **con ese número como mínimo** (como la Red). Las
   físicas (Trampa de oso: Fuerza contra 6) quedarían fijas: no dependen de quien la arma.
3. **Los pergaminos que tiran** (Pergamino de luz cegadora: tu Ef.Esp contra su Res.CC; la Red: tu PdG.Esp contra su Evasión): no es una
   dificultad sino una tirada. Variante de la misma idea: «tirás como si tuvieras al menos 6» (un piso para la tirada).
4. **Los consumibles de zona** (Bengalas, Bomba de humo, Bombucha de talco): si su zona se resiste contra un stat tuyo, mínimo igual.
Las pociones y los pergaminos de bono (Furia, Escudo Arcano…) no aplican: su efecto es fijo, no depende de quien los usa.

### P219 — ¿El daño eléctrico (rayo) se esquiva? (2026-10-25) ⏸ en pausa (2026-10-30): caso por caso, desde Carga Elemental

**Contexto:** al armar **Zap** (Mago, creep) el dueño decidió que no se esquiva con la Evasión: el daño pasa siempre y la Res.Esp solo resiste el
estado (marca `danoSiempre` del duelo, `comun/duelo.js`). Hoy cada rayo lo hace a su manera: la Cadena de rayos, las varitas y las flechas de rayo
se esquivan con la Evasión; Zap no. Pregunta anotada también en las 🛠 Herramientas de diseño (pestaña Preguntas), a pedido del dueño: si no se
esquiva, ¿qué pasa cuando suma el Efecto especial?; si se esquiva, ¿cómo?; ¿se resiste el daño, el estado o los dos?
**Propuesta del dueño (2026-10-25):** «poner como característica del daño de relámpago que no se esquive, y para balancearlo, que haga menos
daño por costo que el fuego, y que tenga más costo en general, que es más o menos lo mismo».
**Falta:** confirmar que vale para todo el rayo (habilidades de creep y de clase, varitas, flechas, trampas de descarga) y repasarlos uno por uno
(el costo o el daño, contra el fuego); decidir qué se tira entonces para sus estados (Zap: PdG.Esp contra Res.Esp) y si suma el Ef.Esp.
**En pausa (dueño, 2026-10-30: «deberíamos ver caso por caso… me gustaría que fuera una regla general, pero tal vez algún ejemplo amerite
revisarlo»; después: «anotá este tema como pendiente para otro momento»).** Se retoma **caso por caso, uno por mensaje** (efecto, texto original,
descripción actual, cómo funciona hoy y cómo quedaría con la regla), empezando por el **caso 1 de 12, Carga Elemental ⚡ (Mago)**, que ya se le
presentó (hoy: el primer golpe usa la tirada de la skill cargada y se esquiva con Evasión; los saltos no se esquivan, al mismo bando, 4 casillas, la
mitad cada vez, sin tope; dudas: el eléctrico quedaría como el único elemento de la Carga que no se esquiva; con la Ráfaga arcana, todo el cono).
Inventario del 2026-10-30:
- **Hoy se esquivan (12):** Carga Elemental ⚡; Cadena de rayos (creep); Varita de chispa eléctrica, Varita de la flor de chispas, Varita del relámpago;
  Arma eléctrica (creep), Lanza del alba, Ballesta Tormenta del Plata, Flecha y Virote de tormenta (el rayo va pegado a un golpe de arma: sugerencia,
  que esos sigan esquivándose); Flecha y Virote relámpago (sin daño eléctrico, solo Parálisis).
- **Ya no se esquivan (8):** Zap, Centella, Misil elemental ⚡, Varita del campo de estática (zona), Descarga eléctrica (trampa consumible y la base),
  Descarga oculta, el ⚡ Rayo en cadena del GM.
- **A mano (19):** Chispa, Rayo y Descarga eléctrica (biblioteca) y 16 habilidades de creeps sueltos (Chispita, Golem de cobre, Nube de estática,
  Chamán del rayo, Arquero de tormenta, Espíritu de la tormenta, Arpía de tormenta, Chamán de la tormenta, Kobold chamán de la tormenta, Hombre cabra
  oráculo, Cigarra de tormenta…); la mitad tira PdG físico por la expresión `MAGICA_RE`.
- **Desajustes:** la Varita de chispa eléctrica dice «salta hasta llegar a 1» pero tiene `saltos: 2`; la trampa Descarga eléctrica (ítem) dice 3
  casillas y el salto llega a 4; la trampa base deja Stun en vez de Parálisis.

### P220 — Los tótems y estandartes: ¿cómo se llama esa categoría? (2026-10-25) ✅ «estructuras», por ahora

**Contexto:** el Estandarte de guerra y el Tótem de silencio ponen un token propio que no actúa (tiene vida y se rompe). El dueño: «los tótems serían
otra categoría, no sé, invocaciones inertes, no sé bien cómo llamarlas». **Decidido el mismo día:** las ondas y áreas de apoyo («a sus aliados») no
los cuentan; los ataques sí (vtt-hexgrid/js/73 `esInerte`, js/13). En el código se llaman «inertes» por ahora.
**Falta:** el nombre para el juego (¿inertes? ¿estructuras? ¿objetos invocados?) y si otras cosas entran en la categoría (pilares, muros con vida).
**Decidido (dueño, 2026-10-30):** «vamos a llamarlos estructuras por ahora, a falta de un mejor nombre; igual te acepto más sugerencias». En el juego se
dicen **estructuras** (en el código siguen como `esInerte`). Sugerencias que quedaron sobre la mesa: emplazamientos, construcciones, fetiches, artefactos
plantados. Sigue abierto si entran otras cosas (pilares, muros con vida).

### P221 — ¿Daño de luz y daño siniestro, como contrapuntos? (2026-10-25) ✅ decidida (2026-10-26)

**Decidido (dueño, 2026-10-26: «me gusta esa definición»; «hagamos que el daño oscuro deje eso, un estado de no se puede curar»):** ☀ **Luz** — revela y castiga lo oscuro: si entra daño, **Marcado** hasta su próximo turno; ×1,5 contra no-muertos y demonios. 🌑 **Siniestro** — la herida que no cierra: si entra daño, **Herida sombría** (no se cura con nada hasta el final de su próximo turno); a no-muertos y demonios no les hace nada. Con sus resistencias (Res. luz, Res. siniestro). Hecho en `Combatiente.identidadElemento` / `sinCura` (comun/combatiente.js), el duelo y las zonas (vtt-hexgrid/js/13, js/08). La primera habilidad siniestra: la **Sanguijuela** del Mago.


**El dueño (2026-10-25, al hacer el Grito de pánico arcano):** «vamos a evaluar la posibilidad de que exista el daño de luz y el daño siniestro como
contrapuntos, pero solo si podemos encontrarle alguna identidad que lo justifique, alguna característica, así como los demás elementos tienen sus propias
características». Hoy: arcano (puro, directo), fuego (quema; seca el agua), hielo (Escarcha; el suelo resbala), rayo (salta; no se esquiva, P219), ácido
(rompe armadura), tóxico (envenena).
**Ideas para evaluar (Claude, a decidir):** *Luz* — revela: lo que golpea queda Marcado (no entra en sigilo, se lo ve en la niebla) o Deslumbrado; pega más
a no-muertos y sombras; podría curar a un aliado si lo alcanza. *Siniestro* (sombra) — corta la curación del golpeado un turno (la Sequía chica) o le roba
vida a quien lo lanza; pega más a lo vivo y nada a no-muertos; puede asustar (Miedo). Falta: ver si alcanza para una identidad propia y no pisar al arcano.

### P222 — ¿Las habilidades de clase que ya tiene un personaje se actualizan solas cuando cambia la clase? (2026-10-27) ✅ decidida (2026-10-27)

Al cambiar el Taunt (PdG.Esp + nivel), el Golpe brutal (+1/+1 críticos y +2 al daño) y el Contraataque (Flash, 1 SP), solo cambian las que se
agregan de ahora en más: un personaje que ya las tenía conserva su copia (probado en el mapa: el Contraataque de juan seguía con su costo viejo).
**A decidir:** ¿se actualizan solas las copias que no se editaron a mano (por su id de clase), se ofrece un botón «traer la versión de la clase», o
queda así (cada mesa decide)?

**Decidido (dueño, 2026-10-27):** «las habilidades de clase que un personaje ya tiene, podrías detectarlas vos y reemplazarlas». Hecho:
`FichaGuardado.migrarHabsDeClase` (la ficha al dibujarse y la Botonera del mapa al abrirse, que la guarda enseguida y avisa «🔄 se pusieron al día…»).
Cada copia guarda `claseHuella` (cómo era la de clase al copiarse o ponerse al día): si la clase cambia, la copia toma la versión nueva; **si se
editó a mano después, se respeta** (sigue siendo de quien la editó). Lo del personaje (Job, imagen, origen) y del turno (cooldown, cargas) se
conserva; una subida de la biblioteca sigue con su 🔔. Probado en el mapa: juan puso al día 6 (Contraataque a 1 SP, Re-roll, Transfusión…).

### P223 — El Segundo aliento «una vez por combate»: ¿cuándo se libera? (2026-10-27) ✅ decidida (2026-10-27)

Hoy queda marcado en la habilidad del creep («Ya la usó en este combate») hasta que el GM lo edite: no hay un «empieza el combate» que lo libere solo.
Casi siempre da igual (un creep pelea un combate). **A decidir:** ¿se libera al «Finalizar combate», al pasar a narrativo, o queda así?

**Decidido (dueño, 2026-10-27):** «se desbloquea al finalizar el combate». Hecho: `unaVezAlTerminar` (vtt-hexgrid/js/25), con lo demás de
«Finalizar combate»: la pantalla del GM libera las habilidades de los creeps del mapa. Probado en el mapa con el Tanque (prueba).

### P224 — Arrastrar en una sola tirada (2026-10-27) ✅ decidida (2026-10-29) · 🔄 redefinida (2026-11-04)
**Flujo nuevo (dueño, 2026-11-04; reemplaza todo lo de abajo):** «el arrastre es una acción en sí misma». (1) Ejecutar → elegir el objetivo a 3 casillas o
menos, con la línea libre. (2) Sale la animación del gancho hacia el rival. (3) Se abre un duelo a la vista: quien la usa tira su **PdG** con su botón, el
rival tira su **Evasión** (si es un creep, la tira el GM); empate: no engancha. (4) Si engancha, la animación del gancho arrastrándolo hasta dejarlo pegado;
si no, el gancho vuelve. Fin de la acción. **Ya no hay tirada de Constitución + Fuerza** ni golpe incluido. (5) El siguiente ataque contra ese rival,
en el mismo turno, tiene **+2 PdG**. Vale para la de clase (Tanque: 2 No2 fijos + 2 SP) y la de creep (sigue costando lo de un ataque, cooldown 2 o
2 SP; el dueño todavía no decidió si pasa a 2 No2 fijos). Hecho en `vtt-hexgrid/js/78-choque-pesado.js` (`arrastrarDueloGancho`, `dueloGanchoTraer`,
`arrastreBonoUsar`) y `comun/duelo.js` (el efecto `trae` y `empatePierde`).

**Cambio (dueño, 2026-11-04): el enganche tira la Probabilidad de Golpe, no la Destreza** («no debe tirar Destreza sino PdG»). Lo de abajo que dice «Destreza» es la versión anterior.

Lo definido decía «Destreza contra la Evasión; si lo engancha, lo arrastra y le pega con su arma con +2 PdG» (dos tiradas). Se programó en una sola: un
ataque con su arma a 3 casillas o menos con +2 PdG (contra la Evasión o el Parry); si pega, lo trae y le hace el daño. **A confirmar** (o separarlo en dos).

(2026-10-27, dueño: «anotalo pendiente para que lo revise cuando esté en la compu» → `docs/pendientes.md`, sección 🖥.)

**Decidido (dueño, 2026-10-29): «vamos con la B»** — en dos tiempos, como estaba definido. Primero el **enganche**: la Destreza de quien lo tira contra la
Evasión del rival (empate: no lo engancha; no se parrea). Si lo engancha, **lo trae hasta quedar pegado aunque después falle el golpe**, y sigue el ataque
con su arma con +2 PdG contra la defensa que elija. Si no lo engancha, no hay golpe (el ataque se gastó). Si ya estaba pegado, va directo al golpe.
**Hecho** (2cda7122): `arrastrarEnganche` / `arrastrarTraer` en `vtt-hexgrid/js/78-choque-pesado.js`, llamado desde `dueloElegirObjetivoMapa` (js/13);
el texto en `comun/skills-creep-base.js`. Probado en «Claude · pruebas» (el Warrior contra juan): falla («Destreza 2 contra su Evasión 3: no lo engancha. No
hay golpe») y engancha («Destreza 14 contra su Evasión 6»: lo trae 2 casilleros y se abre el duelo con +2 PdG). Los creeps que ya tenían Arrastrar guardado
siguen con el texto viejo (la mecánica nueva les vale igual); el del Warrior de pruebas se actualizó.

### P225 — ¿Las áreas alcanzan a un personaje caído? (2026-10-27) ✅ decidida (2026-10-27)

Probando el Sonic Boom se vio que un área (cono, onda, flor) también le pega a un personaje con la vida en 0: así funcionó siempre el motor
(junta a todos los rivales que quedan adentro). Un caído no se defiende, y el daño de más puede acercarlo a morir del todo.
**A decidir:** ¿las áreas lo saltean (como si no estuviera), lo alcanzan igual (como hoy), o lo alcanzan solo si quien la tira lo elige?

**Decidido (dueño, 2026-10-27):** «los personajes con 0 HP son un cuerpo esperando a ser resucitado. Nada más.» Hecho: ningún área (flor, cono, onda,
línea), zona, trampa de área ni salto eléctrico alcanza a un caído (personaje o invocación en 0, creep derrotado): `iniciativaFueraDeJuego` en
`dueloElegirAreaMapa` (js/13), `zonaRevisarToken` y `trampaAfectados` (js/08) y `rayoCadena` (js/10). Lo que sí le sigue pasando: su cuenta de muerte
y lo que ya tenía encima (su turno). La idea de usar los consumibles de un caído quedó en `docs/pendientes.md` (Ideas del dueño).
**Agregado (dueño, 2026-10-27):** «puede que haya efectos de movimiento, de desplazamiento que los afecte, pero vamos a dejarlo a mano, no lo vamos a
programar por ahora». Un empuje, un arrastre o una atracción sobre un caído: ✋ a mano (el GM mueve el cuerpo si corresponde). El resto, como quedó.


### P226 — Colocar una trampa en la zona de alerta (naranja) de un rival (2026-10-27) ✅ decidida (2026-10-27)

Regla nueva del dueño (2026-10-27): «una trampa no se puede poner en el campo de visión directa de un enemigo»; al colocarla se ven los conos del
sigilo. Hecho: el **cono azul** no sirve (avisa y la vuelve a pedir). La **zona de alerta naranja** (en el sigilo, la que pide una tirada de
Percepción) por ahora **sí sirve**. **A decidir:** ¿se deja así, se prohíbe también, o se puede pero el rival tira Percepción para verla colocar?

**Decidido (dueño, 2026-10-27):** «la zona naranja no dispara nada de detección de trampas»: queda como está (se puede, sin tirada).

### P227 — Escudo y Vida extra: ¿lo que absorbe cuenta como daño? (2026-10-27) ✅ decidida y programada

**Dueño (2026-10-27):** «el escudo especial… a fines prácticos funciona como si fuera una barra de vida extra, que al consumirse se consumió el
escudo. Pero eso no cuenta como daño, cuenta como el escudo… una trampa que perfora uno a alguien que tiene un escudo especial, no le aplica el
veneno. Por otro lado, la vida extra de Larry sí, porque no es un escudo, es vida extra… solamente se llena cuando está full vida… me gustaría
distinguir que los escudos especiales que funcionan como una barra de HP sí frenan los efectos que solo aplican al pasar algo de daño».

**Cómo está hoy:** desde el 2026-10-07 (P170) el Escudo especial y el Excedente de vida son un solo estado, **Vida extra** (los alias se juntaron);
aparte están Shield, Envión y Barrera. Y las dos cuentas no coinciden: en el **duelo**, lo que absorbe cualquiera de ellos **cuenta** como daño (el
veneno de un arma entra); en las **trampas**, lo que absorbe cualquiera **no cuenta** (el Dardo no envenena).

**Regla nueva:** dos clases. **Escudo** (Shield, Envión, Barrera/Blindaje, Escudo especial…): lo que absorbe no es daño; si se come todo el golpe,
no entra nada de lo que pide lastimar. **Vida extra** (lo que sobra de una cura o un drenaje, como el de Larry): es vida; lo que absorbe sí es daño.
La misma cuenta en el duelo, las trampas y las zonas. **Falta:** confirmar qué va en cada clase (los ~20 ítems y habilidades que hoy dan «Vida extra»).

**Criterio ✅ (dueño, 2026-10-27: «me sirve ese criterio»):** **Vida extra** = solo lo que sobra cuando una cura o un drenaje pasa del máximo (Drenar
vida, el Colmillo de la Reina Araña). Todo lo que da «absorbe N» es un **Escudo**. Claros como escudo: Pergamino y Poción de Escudo especial, Pociones
de Cuero duro, Piel de cristal y Aguante, Shield, Envión, Barrera (Blindaje), los 5 del Escudo humano, «No siente el dolor» (El origen). **Dudosos,
llevados al dueño:** Relicario de sangre, Anillo de la siesta, Anillo del sereno, Anillo del escudo de la mañana, los Orbes de resguardo y del custodio,
Escudo de caparazón y Anillo de cáscara protectora.

**Clasificación ✅ (dueño, 2026-10-27):** «cuando se habla de vida extra es así: la vida extra solo aplica si te subiste de tu máximo; si no, es
simplemente una curación». O sea, **«Vida extra N» = te curás N y lo que pasa del máximo queda como Vida extra** (con la vida llena, son N de Vida
extra). **Vida extra:** Drenar vida, Colmillo de la Reina Araña, **Relicario de sangre** (cambia: «cada vez que matás a alguien con daño especial, te
curás 10; si te pasás de tu máximo, eso se convierte en vida extra»), **Anillo de la siesta**, **Anillo del sereno** y **Anillo del escudo de la mañana**
(siguen frenando solo su tipo de daño). **Escudo:** los Orbes de resguardo y del custodio, el Escudo de caparazón, el Anillo de cáscara protectora y
todos los «claros» de arriba. **Programado (2026-10-28):** el Relicario ya estaba; los Orbes, el Escudo de caparazón y la Cáscara ya eran escudo; los anillos de la siesta, del sereno y del escudo de la mañana pasaron a Vida extra (lo que se llevan cuenta como daño). **El Envión cambió de nombre** (dueño: «no me cierra nada el nombre»): ahora es **Arrojo** (2026-10-27; «Envión» quedó como alias).

**Relicario de sangre, efecto nuevo (dueño, 2026-10-27):** «sumale como efecto al relicario de sangre que toda curación cuenta como vida extra. Por
ejemplo, te puedes tomar una poción y que suba como vida extra hasta el final del combate. Obviamente que si te la bajan también». Con el Relicario
equipado, **cualquier curación que pase del máximo queda como Vida extra** (no se pierde), y esa Vida extra dura **hasta el «Finalizar combate»**; el daño
la gasta como siempre. A confirmar: si tiene un tope (el Drenar vida llega hasta +50 % del máximo).
**Tope ✅ (dueño, 2026-10-27):** la Vida extra del Relicario de sangre llega hasta **un 50 % por encima del máximo**, como el Drenar vida.

### P228 — El veneno de las trampas: ¿se resiste? (2026-10-27) ✅ decidida

**Dueño (2026-10-27):** «depende de cómo se ejecutan. Si el veneno es por una nube, ahí sí hay una resistencia. Si es por daño físico, siempre que
pase el daño físico, el veneno no se resiste». **Por golpe** (Aguja, Dardos envenenados, Espina de mantícora): sin tirada; entra si lastima (lo que
absorbe un escudo no cuenta, P227). **Por nube o gas** (Nube de veneno, Bomba de esporas, las zonas tóxicas): Res.Esp, como hoy. **Programado** en
la auditoría de trampas (2026-10-27). **2026-10-28 (dueño):** los Dardos quedan como el auditado (1d6+3, el veneno si lastima) y se borró la versión vieja del
📚 del GM (que se esquivaba con Evasión contra 10); la plantilla «☠ Veneno» del asistente arranca igual. La **Espina de mantícora**, por ser Rara, pasa a **2d6+3**.

### P229 — El Pacto: ¿con cuánta vida revive y en qué orden va? (2026-10-28) ✅ decidida

**Contexto:** el Pacto (dueño, 2026-10-28: «cuando alguien tiene un pacto y su hp llega a cero, revive de forma automática y queda titilando
(invulnerable) hasta el inicio de su próximo turno; el pacto se gasta») no dice con cuánta vida vuelve. **Hoy (PLACEHOLDER, `Combatiente.PACTO_VIDA_PCT`):**
con **un cuarto de la vida máxima** (mínimo 1), como el Ankh de Reencarnación. **Orden** cuando hay varias cosas que levantan: primero la Llama de Fénix
(no gasta el pacto), después el Pacto, después el Ankh del cinturón (no se gasta si lo levantó el pacto). Para confirmar o cambiar: ¿un cuarto, la mitad,
toda, 1? ¿El Pacto antes o después del Ankh?

**Dueño (2026-10-28): «correcto»** a las dos: revive con **un cuarto de la vida máxima** y el orden es **Llama de Fénix → Pacto → Ankh**. Y al revivir, **un solo
anuncio**: «Zafaste de morir: te salvó el pacto» para quien cae (en la Crónica, «X zafó de morir: lo salvó el pacto»), sin cartelito ni línea en la Mesa.

### P230 — 🧿 Mal de ojo: ¿sigue habiendo una tirada para echarlo? (2026-10-28) ✅ decidida

**Contexto:** el dueño pidió (2026-10-28) que el Mal de ojo se viva así: «el jugador tira PdG en su duelo; el rival tira "mal de ojo"; selecciona la
tirada; al jugador le aparece "fulano te tiró mal de ojo: volvé a tirar PdG y quedate con el peor resultado", botón "tirar PdG"». Antes había una
contienda previa (el PdG.Esp del creep contra la Res.Esp del personaje; si el personaje ganaba, no pasaba nada). **Hoy (programado así):** sin esa
contienda: el GM elige la tirada, se cobra el costo (el doble en turno ajeno) y el personaje la repite sí o sí. ¿Va así, o se vuelve a poner la tirada de
resistencia antes del aviso? (El Enyetar de los jugadores sigue con la contienda: si se cambia uno, ¿se cambia el otro?)

**Dueño (2026-10-28): «está bien que no tire resistencia; vamos a dejarlo así para hacer un paso menos. Debería ser bastante costoso, así que recordame eso
para corroborar».** Queda sin la contienda. Pendiente: revisar el costo (hoy 5 SP o cooldown 3; el doble en turno ajeno) — anotado en `docs/pendientes.md`.

### P231 — 🕳 Excavar: ¿bajo tierra ve? ¿Con qué arma sale? ¿Cancelar el ataque deja salir gratis? (2026-10-28) ✅ decidida

**Contexto (visto probando Excavar con la cuenta del GM, «Claude · pruebas»):**
1. El Tunelero, **moviéndose bajo tierra**, entró en un cono que tocaba a juan (en sigilo) y **lo detectó**: «juan perdió el sigilo». ¿Un creep bajo tierra
   ve (y detecta en sigilo), o mientras está abajo no ve nada hasta salir?
2. Al salir, el ataque de Excavar usa **el arma que tiene en la mano**: como venía de disparar, preguntó «¿Qué flecha?» y apuntaba con el arco a 14 casillas,
   aunque la habilidad dice «sale apuñalando» (y antes salía con la Daga). ¿Sale siempre con un arma de mano (la daga), o con la que tenga?
3. Si al salir se cancela el ataque (Esc), se le devuelve el costo y el cooldown («canceló Excavar»), **pero igual queda afuera**: salir le salió gratis.
   ¿Cancelar lo deja abajo, o salir sin atacar está bien (y entonces, ¿cuesta algo?)?

**Propuesta:** 1) bajo tierra no ve ni detecta (sale y recién ahí); 2) sale con su arma de mano (la daga), como dice el texto; 3) cancelar el ataque lo deja
abajo (no pasó nada). — sin decidir.

**Dueño (2026-10-28):** bajo tierra **ve** (detecta en sigilo, como pasó). Sale atacando **solo con un arma cuerpo a cuerpo de Tipo 4 a 10** (ni de rango ni
especial). Si se cancela el ataque al salir, **se le pregunta: ¿vuelve bajo tierra o queda afuera?** Además: mientras está bajo tierra, **un botón flotante**
abajo, donde aparece «Limpiar dados»: «⬆ Salir» y, si está pegado a un rival, también «⚔ Atacar». Y **Excavar también para jugadores**, en una clase
«Misceláneas». **Hecho:** `Combatiente.sirveParaEmerger` / `armaParaEmerger`; js/12 (creep) y `FichaAcciones.ejecutarHabilidad` + js/11 (jugador); botones en
js/46; la habilidad `miscelaneas-excavar` en `comun/skills-clase.js`. **Costos (dueño, el mismo día):** meterse, 1 No2 y 1 SP (`excavarSp`); salir atacando,
2 SP y los No2 de un ataque, con los bonos del creep: +3 PdG, +1d6 de daño, Crítico frecuente +1 y Rengo 1 turno (crítico: Rengo 2 y Lisiado 1).
Salir con el botón es **sin costo** (a confirmar). Las reglas de Firestore nuevas (la estela de un jugador, `tunel`) hay que pegarlas.


### P232 — 🏪 Los otros tamaños de tienda, con el criterio del ambulante (2026-10-28) ✅ decidida

**Contexto:** el ambulante pasó a una lista fija por sección (lo esencial) y su góndola, a cantidades por categoría (`FIJO_AMBULANTE`,
`gondolaPorCategoria`, `docs/rework-tiendas.md`). El dueño (2026-10-28): «habría que hacer un paralelismo con el resto de tamaños de local, tirame
sugerencias». Hoy pueblito…capital siguen sorteando con la receta de pesos (8–10 / 12–15 / 18–22 / 26–32 piezas por sección).

**Propuesta (sin decidir):** cada tamaño = un **núcleo fijo** que crece (más armas de familias distintas, más defensivas distintas, la utilitaria) +
**un resto al azar** con la receta de siempre, cada vez más grande; los totales quedan como hoy. Góndola por categoría que crece con el tamaño
(pergaminos, trampas, pociones de otros usos, munición, enfermería; la capital, todo). Un lugar del núcleo sin ítem: en el ambulante queda vacío; en
los demás, se rellena con la receta. Detalle de los números en la conversación del 2026-10-28.

**Dueño (2026-10-28):** «así» (base fija más un resto al azar), «va así» (rellenar el lugar vacío fuera del ambulante) y el carcaj también en el
pueblito. **Hecho** (7d79a3af): `FIJO_POR_TAMANO` y `gondolaPorCategoria` en `comun/generador-tiendas.js`; la capital, 8 por categoría (con «todo lo
que haya» daba 236). Detalle en `docs/rework-tiendas.md`.


### P233 — ↩ Cancelar el duelo de una habilidad que ya se cobró (2026-10-29) ✅ decidida

**Contexto:** probando el modo SP de los creeps. Una habilidad que va al duelo (Disparo señalador, Excavar…) cobra su SP, sus No2 y su cooldown al
ejecutarla, antes del duelo. Si el duelo se cancela antes de tirar, no se devuelve nada ni se pregunta. Con un ataque común, en cambio, «Cancelar duelo»
pregunta «¿Cuenta como un ataque hecho?» y, si no cuenta, devuelve los No2 (2026-10-15). Desde hoy está además «✋ Terminar a mano», que a propósito no
devuelve nada.

**Propuesta (sin decidir):** el mismo criterio que el ataque: al cancelar el duelo de una habilidad ya cobrada, preguntar «¿Cuenta como usada?»; si no
cuenta, devolver lo que pagó (SP, No2, vida) y sacarle el cooldown.

**Dueño (2026-10-29):** «está bien, me parece bien que preguntes si se cobra o no». **Hecho** (34d5e76c): la pantalla que ejecuta la habilidad anota lo
que pagó (`Duelo.pagoHab`) y el duelo lo lleva (`ataque.pagoHab`); «Cancelar» pregunta «¿Cuenta como usada?» y, si no, quien maneja al atacante lo
devuelve (gancho `devolverHab` de CreepDuelo, FichaDuelo e InvDuelo). Probado con el Tunelero: «se le devolvió 4 No2, 2 SP». También desde GM Tools suelto
(9a874b70, probado: 8 → 4 No2 y cooldown 3; «No cuenta» → 8 No2 y cooldown 0).


### P234 — 🪝 Arrastrar: si lo engancha pero no hay por dónde traerlo, ¿le pega igual? (2026-10-30) ✅

**Contexto:** probando el empate del gancho en el mapa (Warrior contra juan, con el Tanque en el medio). Enganchó, empató la fuerza, ganó
piedra, papel o tijera y… no había casilla libre para traerlo: la Crónica dijo «No hay por dónde traerlo: queda donde está». Hoy el código igual
abre el duelo del golpe (como si lo hubiera traído), y la Mesa dice «lo trae y le pega».

**Propuesta (sin decidir):** si no lo puede mover ni un casillero, no hay golpe (como cuando pierde la fuerza: «no pasa nada») y la Mesa lo dice
así; si lo mueve aunque sea uno y queda pegado, le pega. Alternativa: le pega igual (el gancho ya lo tiene agarrado).

**✅ Decidido (dueño, 2026-10-30):** «tiene que haber un camino libre. Si hay cualquier obstáculo entre medio, no se puede tirar la habilidad, y
si el obstáculo roza, ahí lo decide la mesa. Es como un proyectil.» El gancho usa la línea de tiro de los disparos (`vtt-hexgrid/js/78`,
`arrastrarLinea`): tapada → «Elegir otro» sin gastar nada (salida a mano: «Ignorar obstáculo»); roza → «Pasa» / «No pasa». Con la línea libre
siempre hay por dónde traerlo (salvo una trampa del camino, que lo frena ahí), así que el caso de la pregunta ya no se da.

### P235 — 🥷 Oportunidad de un rival escondido: ¿se frena y se lo nombra? (2026-10-30) ✅

**Contexto:** probando el ataque de oportunidad desde el sigilo: el Warrior estaba en sigilo a la espalda de juan y juan se alejó. Al jugador le salió
al centro «Te alejás de Warrior (prueba)… esperando a ver si aprovecha» y en la Mesa «juan se alejó de Warrior (prueba): posible ataque de
oportunidad». O sea, el juego delata al escondido (su nombre y que está ahí), aunque el GM después decida no atacar.

**Propuesta (sin decidir):** si quien se aleja no ve al rival (sigilo, oculto, niebla), no se frena ni se avisa nada: al GM (o a quien maneje al
escondido) le sale la pregunta en silencio y, si ataca, recién ahí se revela (el duelo ya dice «desde el sigilo»). Alternativa: se frena igual pero
sin nombre («algo se mueve a tu espalda…»).

**✅ Decidido (dueño, 2026-10-30):** «tu propuesta me parece bien. Que solo avises si la persona decide hacer el ataque de oportunidad.» Hecho en
`vtt-hexgrid/js/17-oportunidad.js` (`oportunidadSecretas`, `datos.secreto`): no frena ni avisa; la pregunta en silencio a quien maneja al escondido; si ataca,
se abre el duelo y queda en la Mesa y la Crónica (y quien se alejó recibe «¡… te ataca de oportunidad desde las sombras!»); si no, ningún rastro.

### P236 — ¿Perfora como habilidad pasiva? ¿Cuánto vale contra «+1 al daño»? (2026-10-30) ✅ pasiva Perforante, Perfora 2 por 1 Job

**Contexto:** el dueño, al diseñar la Rata de galería: «perfora armadura podría ser una habilidad pasiva… si hay una pasiva que da más uno al daño, no sé
si perfora uno es igual, mejor o peor». La Perfora N **no se suma**: es un piso (N puntos pasan siempre la Defensa; si el golpe ya pasa más, no cambia
nada; `Combatiente.perforaPasa`). Así que vale **menos** que +N al daño: solo sirve cuando la Defensa frenaría casi todo (Petro, Defensa 12), no hace
nada en un crítico (ya ignora la Defensa) y el +1 al daño sí se multiplica en el crítico. Su gracia: asegura que el golpe lastime, y con eso entran los
efectos «si lo lastima» (veneno). Propuesta: una pasiva de 1 Job con **Perfora 2** (al lado de Golpe fuerte, +1 al daño). Falta: que el dueño decida y
programarla (los estados ya traen `perforaGolpe`, como Armas perforantes).
**Decidido (dueño, 2026-10-30: «respecto a la pasiva con perfora, hacemos como decís vos»)** y programado: pasiva **Perforante** (1 Job, `comun/pasivas.js`)
que da el estado permanente **Perforante** (`perforaGolpe: 2`, `comun/estados-presets.js`); el mapa la suma a la Perfora del arma (js/13,
`Combatiente.perforaDeEstados`). Falta probarla en el mapa.

### P237 — La XP de un creep repartida en sus partes (nivel, habilidades, pasivas, equipo) (2026-10-31) ✅ la propuesta, programada

**Contexto:** el dueño, 2026-10-31: «esa proporción de experiencia me parece bien en principio… me gustaría que esté distribuida en nivel de creep,
cantidad de habilidades, habilidades pasivas, equipo; que cada elemento que se le sume, sume un poquito más de experiencia… evaluar cuáles son los
estándares para diseñar creeps por nivel… todos los creeps tengan por estándar una habilidad pasiva incluida y contemplada; si un GM le quiere agregar una
pasiva más, está bien, solo que ese creep va a dar más experiencia». Hoy la XP sale solo del nivel (`xpBasePorNivel`: 40/90/150/220/300).
**El estándar por nivel** (ya decidido en `creeps-humanoides.md`, más la pasiva nueva): atributos 33 + 3 por nivel; habilidades nivel + 1; **1 pasiva**;
equipo: N1 arma + 2 Comunes · N2 las manos + 4 Comunes · N3 + 4 Comunes y 1 Buena · N4 + 3 Comunes y 2 Buenas · N5 + 3 Comunes y 3 Buenas.
**Propuesta de Claude:** un creep estándar da exactamente la XP de hoy, repartida: **50 % el nivel** (atributos), **35 % habilidades + pasiva** (cada una
vale lo mismo: la parte ÷ (nivel + 2)), **15 % el equipo** (en puntos: Común 1, Buena 2, Raro 3; estándar N1 3 · N2 5 · N3 7 · N4 8 · N5 10, el arma
cuenta). Cada habilidad, pasiva o punto de equipo de más suma su parte; de menos, resta. Ejemplos: N3 (150) = 75 + 10,5 por habilidad/pasiva + 3,2 por
punto de equipo; N5 (300) = 150 + 15 + 4,5. La Rata de la grieta (N3: 4 habilidades, 1 pasiva, arma Buena + 4 Comunes = 6 puntos) daría ~147; con una
pasiva más, ~157.
**Falta decidir:** si se reparte así o se suma encima de lo de hoy; los porcentajes; si lo de menos resta; si cuentan los puntos de atributo de más; el
jefe (hoy duplica oro y trofeo, no XP); y dónde se ve el desglose (el paso Recompensas del asistente y «Batalla terminada»).
**Decidido (dueño, 2026-10-31: «podemos partir de ahí; si te parece, queda más o menos bien»)** y programado: la propuesta tal cual (repartida, 50/35/15,
lo de menos resta). Lo que no se definió queda como estaba: los puntos de atributo no cuentan y el jefe no da más XP. `CombateFin.xpDeCreep(sc)` /
`xpDesgloseTxt` (comun/combate-fin.js), en «Batalla terminada», en el estimado del grupo y en el paso Recompensas del asistente (con el desglose).
**Atributos y jefe (dueño, el mismo día: «los puntos de atributo además pueden sumar, aunque generalmente no los usamos; y el jefe da un 25 % más»):** el
50 % del nivel se reparte entre los puntos de atributo del presupuesto (33 + 3 por nivel): cada punto de más suma esa parte (N3: 75 ÷ 39 ≈ 1,9) y cada
uno de menos la resta; un jefe da el total × 1,25 (`XP_JEFE`).

### P238 — 🪱 Sanguijuela: si quien la lanzó está caído o ya no está en el mapa, ¿qué pasa con la cura? (2026-11-03) ✅

**Contexto:** desde el 2026-11-03 (dueño: «toda curación a alguien con una sanguijuela le va al debuffer. Y si tiene full vida, le va como vida extra»),
la cura que recibiría el portador se la lleva quien lanzó la Sanguijuela. Caso borde: el lanzador está caído (0 de vida) o su token ya no está.
**Decidido (dueño, 2026-11-03: «claro que la cura se pierde simplemente»):** la cura se pierde — al portador tampoco le entra. Programado
(`Combatiente.repartoCuraRobada`: caído → `perdida`; un creep que ya no existe, el aviso lo descarta con una línea en la Mesa).

### P239 — ❤ Una sola Vida extra, venga de donde venga (2026-11-03) ✅

**Contexto:** en la prueba del mapa, el Maldito lleno se robó dos curas (25 y 5) y le quedaron dos estados «Vida extra 25» y «Vida extra 5» (desde
el 2026-10-07 cada Vida extra quedaba aparte, con su duración). Dueño: «la vida extra debería ser la misma independientemente si viene de la
Sanguijuela o no… un valor que, independientemente de su fuente, debería mostrarse igual».
**Decidido y programado** (`Combatiente.sumarVidaExtra` / `juntarVidaExtra` / la rama de Vida extra de `agregarEstado`): la Vida extra común es **un
solo estado** «Vida extra N» por personaje, creep o invocación; toda fuente suma ahí (Relicario, Drenar vida, la Sanguijuela, Escudo arcano y los
efectos que dan «Vida extra», el Anillo de la siesta, a mano). Al juntar dos: **dura lo de la más larga** (permanente si alguna lo es; si no, los
turnos más altos) y **se va al terminar el combate solo si todas se iban** (criterio de Claude: la más simple que no hace perder vida de más). Los
**topes** (+50 % del Relicario y del Drenar vida) se siguen midiendo sobre el total. El **Anillo de la siesta** sigue sin sumarse de descanso en
descanso: al descansar, la Vida extra queda en lo que tenía o en la del anillo, lo que sea más. **No se juntan** los escudos de los anillos del sereno
y de la mañana (solo contra un tipo de daño) ni los escudos que no son Vida extra (Arrojo, Orbe de resguardo, Armadura mágica…). Las guardadas aparte
se juntan solas al empezar el turno de quien las tiene.

### P240 ✅ — 💪 ¿El escudo atado al antebrazo vale también con un arma a dos manos? (2026-11-03)

**✅ Decidida (dueño, 2026-11-03): «Sí, un escudo puede ir con un arma de dos manos.»** Queda como está programado (no ocupa la mano).

**Contexto:** el dueño pidió el rasgo «Atado al antebrazo» para escudos (2026-11-03: «alguien que tiene dos armas no puede tener escudo, salvo la
excepcionalidad de un escudo que se ate en el antebrazo… que sea bastante bueno»): el escudo no ocupa la mano, así que entra con dos armas. Quedó
programado como «no ocupa la mano» en general (`Combatiente.manosQueOcupa`), así que **hoy también entra con un arma a dos manos**.
**Pregunta:** ¿se deja así (dos manos + escudo atado) o se limita a las armas de una mano? Claude propuso «sí, porque va atado y no se agarra», pero
el dueño todavía no lo decidió.

### P241 ✅ — 🪤 La dificultad de una trampa puesta por habilidad: ¿tirada al colocar o valor fijo? (2026-11-03)
Hoy la dificultad es el **valor fijo** de la Destreza de quien la pone (las compradas, el mínimo por calidad: 7 / 9 / 11), y solo tira el que la pisa.
Opciones: A) valor fijo; B) tirada al colocar; C) tirada al colocar con ventaja. **Decidido (dueño, 2026-11-03): la A, «vamos con la recomendación A»** —
la trampa ya paga un costo con resultado incierto (puede que nadie la pise); el valor fijo compensa ese riesgo. No cambia nada del código.


### ✅ P242 — 💚 Manos de curandero: ¿suma también a las curas por turno? (2026-11-06) — RESUELTA
**✅ Decisión del dueño (2026-11-06): «+5 en curas directas o individuales y +2 en curas en área y regeneraciones; y que también aplique a
pergaminos y a pociones».** Aplicado: a uno (Sanar, Purificar, varitas/armas que curan, Segundo aliento, una poción) +5; en área (la Oleada,
cada curado de un sub-duelo de área) y por turno (cada pulso del Círculo y del Aura sanadora, cada turno de una Regeneración que da —el Bálsamo, un
pergamino de Regeneración, también a cada aliado del pergamino de grupo—) +2. La Transfusión, no. Texto viejo de la pregunta:
La pasiva **Manos de curandero** (dueño, 2026-11-06: «+1 me parece muy poco, probemos +5») suma **+5 a cada cura directa** que da quien la tiene:
las curas de habilidades y armas que pasan por el duelo (Sanar, Oleada sanadora —+5 a cada curado—, Purificar, la Varita de cura y las curas de
clase con `cura`) y las que se hace él mismo (el Segundo aliento, la cura sobre sí). **No** suma (por ahora) a las curas **por turno**:
Regeneración, Bálsamo, el Círculo de sanación y el Aura sanadora (cada pulso), ni a la Transfusión (no es una cura: pasa vida) ni a las pociones.
**Pregunta para el dueño:** ¿las curas por turno también deberían llevar el +5 (en cada pulso, o solo en el primero)? Hoy, con +5 en cada pulso,
un Aura sanadora de 4 pulsos daría +20 por aliado.

### ✅ P243 — 🔀 Intercambio arcano: ¿un aliado Inamovible tira su chance? (2026-11-18, Claude)
**✅ Decidido (dueño, 2026-11-19: «está bien. con un rival debe aparecer el recordatorio de que el rival es inamovible (no debería poder moverlo)»)**: el aliado acepta el cambio sin tirar; con un rival Inamovible tiene que aparecer el recordatorio de que es Inamovible (si su Inamovible aguanta, no se mueve nadie). A la cola: revisar que el recordatorio salga.
El Intercambio arcano (M4 Arcano nivel 5) reusa el cambio de lugar de «Cambiar de lugar», donde un rival **Inamovible** (las Botas de estibador,
por ejemplo) tira su chance y, si le sale, no se mueve nadie. La skill aprobada no dice qué pasa con un aliado Inamovible. **Elegido lo más simple
mientras tanto**: a un rival, el Inamovible tira su chance como en Cambiar de lugar; a un aliado, no (el aliado acepta el cambio, igual que le entra
sin tirada). **Pregunta para el dueño:** ¿está bien así, o el Inamovible también frena el cambio con un aliado?

### ✅ P244 — 😇 Renovar el Pacto: los detalles chicos (2026-11-19, Claude)
**✅ Decidido (dueño, 2026-11-19, en la compu: «bien, renovarlo desde el token como gm me gustó cómo quedó. Técnicamente también debería poderse quitar. Desde el mismo lugar no estaría mal»)**: los tres detalles quedan como están; el botón sigue en el menú «⋯» del token; se suma **quitar el Pacto** desde el mismo menú. A la cola.
Al programar «Renovar el Pacto» (cola de programación, 2026-11-19) quedaron tres cosas que el pedido no decía. **Elegido mientras tanto**: (1) el botón
😇 del menú del token sale **solo con el Pacto gastado** (con el Pacto activo no hay nada que renovar); (2) en la ficha, el cartel «El Pacto lo renueva el GM
cuando la historia lo da. ¿Lo cambiás igual?» sale solo al pasarlo de «No» a «Sí» y solo al jugador (si lo marca el GM, se renueva sin preguntar y la
línea dice «El GM le renovó el Pacto a…»); (3) pasarlo a mano de «Sí» a «No» no pregunta ni deja línea en la Mesa (como antes). **Pregunta para el
dueño:** ¿está bien así, o querés el botón también con el Pacto activo, o una línea en la Mesa cuando alguien lo saca a mano?

### ✅ P245 — 🎲 El daño de una zona que tira el dueño de quien la creó: los casos raros (2026-11-19, Claude)
**✅ Decidido (dueño, 2026-11-19: «me parece bien, con una salvedad… un daño fijo sin dados… igual tiene que comunicarse, sobre todo la persona afectada. Si te entra un daño directo, te tiene que aparecer una notificación que diga, te ingresó tanto de daño por tal razón»)**: lo oculto sale solo y la zona puesta a mano la tira el jugador, como quedó; el daño fijo se aplica directo pero con un aviso al afectado («Te entraron N de daño por <zona>»). A la cola.
Al programar que el daño de las zonas con cartel lo tire, en el cuadro del duelo, quien maneja a quien creó la zona (#9 de `auditoria-tiradas.md`),
quedaron casos que el pedido no decía. **Elegido mientras tanto**: (1) si el que entra está **oculto** (el GM lo escondió), el cuadro del duelo lo
delataría: el daño sigue saliendo solo, como antes (igual que las chances con un token oculto); (2) una zona que un jugador puso **a mano** (sin un
personaje detrás) la tira él, a nombre de su primer personaje; (3) un daño **sin dados** (un número fijo, o «la diferencia» sola) no se tira: se
aplica directo, como antes; (4) lo aplica el camino de siempre del cuadro del duelo («💔 Aplicar el daño» del que lo recibe), con la Defensa, la
Defensa especial (solo en las zonas de habilidad o con elemento, como antes), las resistencias y la Suela gruesa de lo que se pisa. **Pregunta para el
dueño:** ¿está bien así, o preferís otra cosa en alguno de estos casos?

### ✅ P246 — 📣 Otros daños directos que entran sin aviso al afectado (2026-11-19, Claude)
**✅ Decidido (dueño, 2026-11-19: «ponele a todos el mismo aviso»)**: los seis daños directos de la lista llevan el mismo aviso al afectado que el daño fijo de las zonas («Te entraron N de daño por …»). **✅ Hecho (2026-11-19)**: una sola función para todos, `danoDirectoAvisar` (`vtt-hexgrid/js/08`, la misma del daño fijo de las zonas), con la cuenta, la línea en la Mesa, la Crónica y el Aviso al centro con «Entendido» para quien maneja al que lo recibe (el GM, en tercera persona, para un creep). Si llegan dos avisos juntos, el segundo espera a que se cierre el primero. Probados en el mapa: Terreno incendiado (al entrar y en el Mantenimiento), Maldición tormentosa, Tendón cortado, Escudo humano, Espejito y el salto del rayo por el agua. Sin probar en el mapa (anotado en `pruebas-en-el-mapa.md`): el Orbe salvaje con 1 (el d6 sale al azar; usa el mismo camino que el Espejito). Los saltos de una varita o del Relámpago se resuelven cada uno en su propio cuadro del duelo, que ya se ve; el aviso nuevo es para los saltos sueltos (el rayo por el agua y la flecha que salta).
Al sumar el aviso del daño fijo de una zona (P245) se revisaron los otros daños que el mapa aplica solo. **No se tocaron**; hoy se cuentan solo en la
Mesa (a veces en rojo) y un toast en la pantalla que los aplica, sin el Aviso al centro para quien maneja al que lo recibe: (1) 🔥 **Terreno incendiado**
al entrar y en cada Mantenimiento (`fuegoEntrada` / `fuegoMantenimiento`, js/08); (2) ⛈ **Maldición tormentosa** al moverse (`tormentaAlMoverse`,
js/08); (3) 🦵 **Tendón cortado** al caminar sangrando (`tendonAlMoverse`, js/107); (4) 🛡 **Miti-Miti / Escudo humano**: lo que se lleva quien protege
(`mitiMitiCobrar`, js/10); (5) ⚡ los saltos del **Relámpago en cadena** (`rayoCadenaAplicar`, js/10: Mesa y Crónica); (6) 🪞🔮 el **Espejito** y el
**Orbe salvaje** con 1, que le pegan a quien atacó (js/53). Las Espinas y el Espejo se ven en el cuadro del duelo; las trampas y el Escudo elemental ya
tienen su cartel para la víctima. En los tres primeros, casi siempre los aplica la pantalla de quien maneja al que lo recibe (la que lo movió), salvo
con el GM con 🎮 el control. **Pregunta para el dueño:** ¿les sumamos el mismo aviso («Te entraron N de daño por…») a todos, a algunos, o así está bien?

### P247 — 🪵 Un tótem o un estandarte, ¿cuenta para «Flanqueado» y para «Pasos a tu espalda»? (2026-11-19, Claude)
Probando el Tótem de silencio del D4 en «Claude · pruebas 2»: al clavarlo detrás de Blanco J1 b, a Jugador 1 le salió «👂 Pasos a tu espalda · Blanco J1 b
oye a Tótem de silencio de Control mental 4 acercarse por la espalda… ¡Flanqueado!» (`vtt-hexgrid/js/49-darse-vuelta.js`). **Arreglado** lo evidente: un
objeto inerte (tótem, estandarte: `esInerte`, js/73) no camina, así que ya no da «Pasos a tu espalda». **Queda la duda:** un tótem o un estandarte
**pegado** a alguien, ¿cuenta como «está enfrentando a un rival» (`vueltaFlanco`)? Hoy sí: con un tótem pegado de frente, si otro rival se le acerca por
atrás no se le ofrece darse vuelta (sale «Flanqueado»). Propuesta de Claude: que no cuente (un objeto no lo tiene ocupado); sin tocar hasta que decida el dueño.


### P248 — ✅ 🔨 Maestría en armas pesadas: ¿las maestrías de las otras familias? (2026-11-20, Claude)
La pasiva nueva (dueño: «da +2 a pdg en armas de tipo 10, y además da +1 al parry con ese tipo de armas», `comun/pasivas.js`) quedó con **jobCosto 1**
(confirmado por el dueño el mismo día). Para el Parry se sumó el stat `parryt10` («Parry con contundentes»): se suma solo al parar con un arma de Tipo 10,
nunca con un escudo ni con otra arma, y el asistente de ítems lo ofrece como bono. La cuenta (`Combatiente.parryExtraArma`) ya sirve para `parryt4/6/8`,
pero no se registraron (dueño: solo lo de Tipo 10 por ahora). **Para el dueño:** ¿querés las maestrías de las otras familias (Tipo 4, 6 y 8)?
**✅ Resuelta (2026-11-20):** sí; el dueño definió las cinco (punzantes, cortantes, hachas, arcos y ballestas) y quedaron programadas — ver P253 y P260.

### P249 — 🐝 Táctica de enjambre: ¿también el PdG especial y los ataques con habilidad? (2026-11-20, Claude)
La pasiva nueva (dueño: «tenés +1 a la pdg por cada aliado adyacente. cuesta 2 puntos de job», `comun/pasivas.js`, stat `enjambre`) quedó, **mientras
tanto, con lo mínimo**: suma solo al **PdG común** y solo en los **ataques con arma** (el normal, el de una habilidad «con tu arma» como Pegar fuerte,
el contraataque y el de oportunidad), +1 por cada aliado pegado a quien ataca, **sin tope**, contado al abrirse el duelo. No suma al PdG.Esp (hechizos),
ni a las habilidades que no pegan con el arma, ni a los daños sueltos. Los aliados son los de la Patota (mismo bando, con ficha, en pie, no bajo
tierra): cuentan también las invocaciones y los que están escondidos; un tótem o estandarte con ficha también cuenta. Si se compra dos veces, da +2 por
aliado. No hay indicador sobre el token: se ve en el cuadro del duelo y en la tirada. **Para el dueño:** ¿la querés también para el PdG.Esp / los
hechizos? ¿Con algún tope? ¿Los objetos inertes (tótem, estandarte) cuentan como aliado?

### P250 — ✅ 🏹 Carcaj incluido: detalles que quedaron elegidos «mientras tanto» (2026-11-20, Claude)
El carcaj incluido (dueño: «que cualquier jugador tenga por default un carcaj de 5 slot para virotes/flechas especiales incluído, sin peso adicional,
por cargar cualquier arco o ballesta»; `comun/ficha-equipo.js`) quedó así, **mientras tanto**: (a) el **Carcaj integrado +N** de una ballesta también
le suma al incluido (5 + N), igual que a uno de verdad; (b) con un carcaj de verdad puesto vale **solo** ese (no se suman los 5 del incluido);
(c) si el arco se le cae o se lo sacan por un camino que no es «Sacar» (desarme, soltarlo en el mapa), las flechas del incluido **quedan guardadas**
y se ven en Equipo como «Carcaj incluido (sin arco ni ballesta)» con «→ Mochila»: al volver a equipar un arco siguen ahí; (d) **«Cargar todo lo que
entre» y «Vaciar a la mochila»** cobran, en combate, una acción de equipar **por cada clase** de flecha que se mueve (la misma regla que pasarlas de
a una); (e) al comprar un arco se sigue regalando el **Carcaj de cuero (10)** si no tenía ninguno, y su texto del catálogo («Viene con cada arco o
ballesta que se compra») no se tocó. **Para el dueño:** ¿está bien así? ¿El Carcaj de cuero se sigue regalando con cada arco, ahora que hay uno incluido?
**✅ Decidido (dueño, 2026-11-20):** «NO»: el **Carcaj de cuero ya no se regala** con cada arco o ballesta (se compra aparte: es el de 10 lugares; todo
arco o ballesta trae el incluido de 5), y **con un carcaj de verdad puesto vale solo ese** (b). Aplicado el mismo día (`comun/ficha-tienda.js`, texto
del Carcaj de cuero en `comun/catalogo.js`); a quien ya tenía uno regalado no se le saca. Lo demás (a, c, d) queda como está.

### P251 — ☥ ¿Con qué volvés?: detalles que quedaron elegidos «mientras tanto» (2026-11-20, Claude)
Con más de una forma de volver (Pacto, Ankh de Reencarnación en el cinturón, Llama de Fénix) ahora elige quien maneja al personaje. Quedó así,
**mientras tanto**: (a) mientras no elige está **caído como cualquier caído**: los 5 turnos para morir corren igual (no se frenan por tener opciones);
(b) un Ankh **en la mochila** no cuenta como opción (como siempre: solo el del cinturón se usa solo; el de la mochila, con su botón Consumir);
(c) si mientras está caído se queda con **una sola** forma (por ejemplo le quitan el Pacto), esa se usa sola en la próxima revisión, como siempre con
una sola; (d) al GM el cartel le sale solo únicamente si tiene 🎮 el control; si no, elige por el jugador con el ☥ del token cuando quiera (la Mesa le
avisa que hay alguien eligiendo); (e) con una sola forma **no se pregunta** (ni «¿querés usar tu Ankh?»): automático. **Para el dueño:** ¿está bien así?
¿Los turnos para morir tendrían que esperar mientras elige?

### P252 — 🌿 Al terminar «Finalizar combate», ¿se limpia también el orden de turnos? (2026-11-20, Claude)

> ✅ **Respondida (dueño, 2026-11-22):** «sí, la lista de iniciativa se limpia al terminar el combate» (en la cola).
> ✅ **Hecho (2026-11-22):** al terminar el combate se vacía el orden de turnos (`TokensAuto.limpiarIniciativa`); el interruptor a mano no lo toca.
Desde el 2026-11-20, cuando el proceso de «🏁 Finalizar combate» termina (se cierra el botín, o se publica sin ítems), el mapa publicado vuelve solo a
modo narrativo, igual que si el GM tocara el interruptor. **El interruptor no limpia el orden de turnos** (si había uno armado, la lista queda como
estaba y el GM la borra con «Limpiar»), así que el cambio automático **tampoco lo limpia**: se eligió lo más conservador, no borrar nada que el GM no
haya pedido. **Para el dueño:** ¿querés que al terminar el combate también se limpie sola la lista del orden de turnos (y, en ese caso, también al
pasar a narrativo a mano con el interruptor)?

### P253 — ✅ ⚔ Maestrías de Tipo 4, 6 y 8: lo que quedó sin definir (2026-11-20, Claude)
El dueño definió las tres (ver `docs/cola-de-pruebas.md`): punzantes melee (+1 daño, +2 PdG en oportunidad), cortantes (+1 Parry, +1 Bloqueo, +1 PdG
en contraataque) y hachas (el segundo ataque del turno cuesta 2 No2 menos). **(a) ✅ la de hachas cuesta 1 Job** (dueño, 2026-11-20). ~~quedó en
2, provisorio~~ **(b) ✅ de rango, dos maestrías** (dueño, 2026-11-20): arcos = +1 PdG y +2 Crítico potente; ballestas = +1 PdG y Perfora +1; 1 Job cada una.
**✅ Resuelta (2026-11-20):** programadas con los ajustes del dueño (punzantes: +1 al daño, +1 PdG en oportunidad —ya no +2— y +1 PdG por la espalda;
hachas: 2 No2 menos desde el segundo ataque y +1 Bloqueo). Lo que quedó elegido «mientras tanto» al programarlas: P260.

### P254 — 👁 Revelar a mano lo oculto: lo que quedó elegido «mientras tanto» (2026-11-20, Claude)
Al programar «👁 Revelar» (`docs/cola-de-pruebas.md`; `vtt-hexgrid/js/122-revelar.js`) se eligió lo más conservador. **Para el dueño:**
**(a) Un jugador revela solo LO SUYO** (la trampa que puso él o un personaje que maneja; su token en sigilo). No revela la trampa de otro jugador
(aunque la vea, por ser del mismo bando) ni nada que no vea. ¿Está bien, o cualquier jugador debería poder revelar las trampas de su bando?
**(b) «🙈 Volver a ocultar» una trampa es solo del GM.** Un jugador que reveló su trampa no la puede volver a esconder (se lo pide al GM).
**(c) El GM revela lo que VE.** Las trampas de los jugadores el GM no las ve (regla del 2026-09-30: se entera de que la pusieron, no de dónde), y
el «👁 Revelar lo oculto» del menú del ojo le muestra a los personajes en sigilo pero NO esas trampas. ¿Tendría que mostrárselas también?
**(d) Revelar a mano a alguien en sigilo le saca el estado y nada más**: sin tirada y **sin el «Marcado» 2 turnos** de cuando lo descubren
(ese es de la detección de verdad). Si el GM lo quiere marcado, se lo pone con «+ Estado». ¿O revelar a mano debería marcarlo también?
**(e) Bajo tierra no tiene «Revelar»**: no está oculto del todo (se ve el montículo) y sale con su habilidad. ¿Hace falta un «sacarlo a mano»?
**(f) No hay «detectada solo por Fulano»:** hoy una trampa detectada la ven todos (`descubierta`), así que revelar es siempre «a todos».
**✅ Respuestas del dueño (2026-11-20):** (a) correcto. (b) correcto. (c) correcto que el GM no vea las trampas de los jugadores, **pero el «👁 Revelar
lo oculto» del menú del ojo SÍ se las tiene que mostrar** (en la cola). (d) correcto: revelar a mano no deja Marcado. (f) correcto, revelar es para todos;
queda como conversación de diseño pendiente poder revelar solo para un jugador (`docs/pendientes.md` §4). (e) sin responder. Además: el botón de revelar
una trampa va como circulito que sale de la propia trampa, y el 👁 de un token oculto por el GM vuelve adentro del «⋯» (en la cola).

### P255 — 🙈 Lo que hace alguien que no se ve: lo que quedó elegido y la propuesta de «percibís algo raro» (2026-11-20, Claude)

Contexto: el dueño pidió que un creep en sigilo (o en la niebla, u oculto) no quede delatado por la Mesa ni por la Crónica (`docs/cola-de-pruebas.md`,
«🐀 Un creep en sigilo…»). Quedó un solo criterio (`comun/no-visto.js` + `vtt-hexgrid/js/29`): un texto que nombra a un creep que el jugador no ve
no lo nombra. Al aplicarlo hubo que elegir algunas cosas; quedan así salvo que el dueño diga otra cosa:

**(a) «Acción incierta», ahora sin nombre.** Desde el 2026-10-09 (idea de Pablo) un creep conocido que no se ve dejaba «🎭 Rata de la grieta está
realizando una acción incierta». Eso era justo lo que delataba. Ahora dice «🎭 Alguien está realizando una acción incierta» (y varias líneas seguidas
de una misma acción cuentan como una sola). De un creep que nunca vieron no sale nada. ¿Está bien que quede «Alguien…», o preferís que no salga nada
tampoco de los conocidos?

**(b) El cuadro del duelo sí lo nombra.** Si un creep que no se ve ataca (o le tira una habilidad) a un personaje, a todos se les abre el cuadro del
duelo con su nombre («ATACA Rata de la grieta. 2»). Con un ataque es la regla de siempre (atacar saca del sigilo y lo deja delatado en esa casilla).
Con una habilidad que no es un ataque (un mal de ojo desde la niebla, por ejemplo) hoy también lo nombra. No se tocó. ¿Tendría que decir «Alguien»
hasta que se lo vea?

**(c) El orden de turnos.** Un creep que ya vieron conserva su fila con su nombre aunque se esconda (decisión del 2026-10-09), y se marca cuando le
toca. No dice dónde está, pero sí que sigue en juego y cuándo actúa. No se tocó (la tarjeta «Empieza el turno de…» de la Crónica sí se esconde).

**(d) Del otro lado: un personaje en sigilo visto por el GM.** El GM no ve el token, pero en su Mesa y su Crónica sí lee todo lo que ese personaje
tira o hace, con nombre (salvo colocar una trampa, que ya le sale «acción incierta»). No se tocó: el GM modera y resuelve las tiradas. ¿Querés que al
GM también le salga «Alguien…» de un jugador en sigilo?

**(e) Al entrar de nuevo al mapa**, las líneas viejas de la Mesa se vuelven a decidir con lo que se ve en ese momento: lo que hizo una rata cuando
estaba a la vista puede quedar como «Alguien…» si ahora está escondida. (Sin recargar, cada línea queda como salió.)

**(f) Propuesta, sin programar: «percibís algo raro → tirada de Percepción».** Hoy ya existe para moverse (el escondido que camina por la zona de
alerta de un rival, o el rival que termina su movimiento con un escondido en su zona de alerta: «Fulano siente un movimiento extraño…», con la
Percepción siempre incierta). Lo que se podría sumar, con la misma tirada y el mismo cartel (nunca dice quién, qué ni dónde):
1. **Usar una habilidad ruidosa estando escondido** (el Chillido que llama a otra rata, un grito, un golpe al piso): tirada para quien lo tenga en su
   zona de alerta. *Recomendado.* Haría falta una marca «hace ruido» en la habilidad.
2. **La Polvareda / Bomba de humo desde donde no se ve**: la nube ya se ve; no hace falta tirada. *No recomendado.*
3. **Colocar una trampa** a la vista de un rival (en su zona de alerta): tirada; si la gana, ve la trampa (no a quien la puso). *Recomendado.*
4. **Recibir daño estando escondido** (pisar fuego, una zona, un área que lo alcanza): se queja. Tirada para los que estén a 3 casillas o menos.
   *Recomendado para el daño; para un estado que no duele, no.*
5. **Curarse, tomar una poción, cambiar de arma, tiradas sueltas del GM, cooldowns, su Mantenimiento**: nada. *No recomendado: es ruido para la mesa.*
6. **Empezar su turno pegado a un personaje** (a 1 casilla, fuera del cono): una tirada por turno. *Para pensar: puede ser mucho.*
7. **Llamar refuerzos**: el que llega aparece a la vista si cae a la vista; el que llamó, como el punto 1.
Si gana la Percepción, lo de siempre: el escondido tira su Sigilo y, si pierde, queda a la vista.
**✅ Respuestas del dueño (2026-11-20):** (a) «Alguien está realizando una acción incierta» está bien. (b) El cuadro del duelo nombra a quien ataca
desde donde no se ve: está bien, «al atacar se revela su posición». (c) El orden de turnos mantiene la fila del creep conocido que se escondió:
correcto. Lo de «percibís algo raro» por habilidades ruidosas: «por ahora afuera». (d) y (e) sin responder; quedan como están.

### P256 — ☥ Al resucitar se van los estados: lo que quedó elegido «mientras tanto» (2026-11-20, Claude)

> ✅ **Respondida (dueño, 2026-11-22):** (a), (c), (e) y (g) «correcto», como están. (i): «si le subís la vida a mano, te debe aparecer una notificación que diga: el personaje está caído, ¿querés resucitarlo con esa cantidad de vida? Sí / No» (en la cola). El resto, como está.
> ✅ **(i) hecho (2026-11-22):** Sí = el ✚ Revivir con esa vida (estados, Titilando, Mesa, animación corta); No = no se le sube y sigue caído. Duda: P280.
El dueño: «al resucitar se le borran todos los estados alterados, los temporales, circunstanciales, los de alguna habilidad o alguna poción o algún
pergamino. Tanto los buenos como los malos». Se hizo así (`Combatiente.quedaAlVolver`, comun/combatiente.js); estas son las dudas, con lo elegido:
- (a) **La Llama de Fénix que no se usó** (volvió con el Ankh o el Pacto teniendo las dos): **queda**, porque el cartel «¿Con qué volvés?» promete
  que las otras formas «te quedan guardadas». El Pacto sin gastar también queda (no es un estado).
- (b) **Veneno severo, Sangrado, Marcado, Mala sombra, Sanguijuela, Maldito** y cualquier otro «permanente» que puso un golpe o una habilidad: **se
  van** (es lo que dice la frase). ¿Alguno debería sobrevivir a la muerte?
- (c) **Armadura rota:** **queda** (en un personaje es de las piezas; en un creep o una invocación se dejó igual, por ser daño a la armadura y no un
  estado «de paso»). **Desarmado:** queda (el arma sigue en el piso). ¿Está bien?
- (d) **Sigilo y Sentado:** se van (vuelve de pie y a la vista). **Agarrado / Mordido** (y Agarrando / Mordiendo): se van; el otro lado se suelta
  solo cuando le toca.
- (e) **Un estado «sin límite» puesto a mano** (por el GM o el jugador, con nombre propio: un rasgo, una maldición de la historia): hoy **se va**,
  porque no hay forma de distinguirlo de uno que dejó una poción. Los que el sistema reconoce como rasgo sí quedan: Vuela, «Inmune a …», lo de las
  pasivas y lo del equipo. ¿Hace falta una marca «rasgo: no se va al morir» para los estados a mano?
- (f) **La Bronca de un creep y los Toques de carga:** quedan (son cuentas del combate, no estados de paso). **La Vida extra** (también la del
  Relicario): se va.
- (g) **Los cooldowns, el SP y los No2:** no se tocan (no son estados). **Los estados de las invocaciones del que vuelve:** no se tocan (solo se
  limpia quien vuelve). ¿Alguno debería reiniciarse?
- (h) **Una invocación que revive a mano desde la ficha** (subiéndole la vida): no pasa por el punto común (solo el ✚ de su token en el mapa).
- (i) **Subirle la vida a mano a un caído** (HP directo desde el token): cuando su pantalla lo saca de «inconsciente», cuenta como volver y se le
  van los estados. ¿O eso no debería contar como resucitar?

### P257 — ▶ «Iniciar combate»: lo que quedó elegido «mientras tanto» (2026-11-20, Claude)

> ✅ **Respondida (dueño, 2026-11-22):** «todo es correcto», como está.

> ✅ **Decidida (dueño, 2026-11-21):** «un caído queda como estaba al caer. Mismos nitros, no hay recarga ni regeneración de nada. También al momento de morir se le eliminan todos los estados alterados». Se programa en la cola («🔁 Turnos, caídos y resurrección»).
El botón del orden de turnos (dueño, 2026-11-20). Dudas chicas, con lo elegido:
- (a) **Los estados del primero:** su turno empieza como cualquier otro (regeneración, recarga, lo que se dispara al empezar); los turnos de sus
  estados bajan al TERMINAR su turno, como siempre. No se hizo nada distinto por ser el primer turno del combate.
- (b) **Cooldowns, SP y vida:** «Iniciar combate» solo llena los No2 (y, al primero, lo de su inicio de turno). ¿Los cooldowns o el SP deberían
  arrancar de alguna forma especial al empezar un combate?
- (c) **Cuándo se vuelve a ofrecer:** después de que el mapa vuelve a narrativo (o de «Limpiar») y de apretar Ordenar otra vez. Si un combate termina
  y el siguiente empieza sin pasar por narrativo ni Limpiar, el botón no aparece (se juega como antes). «Traer tokens» a mitad de combate no lo
  vuelve a ofrecer, para que no se recarguen los No2 por accidente. ¿Está bien, o preferís un botón chico «reiniciar combate» siempre a mano?
- (d) **«Siguiente» sin haber iniciado:** avisa y ofrece iniciar o «pasar el turno sin iniciar» (no bloquea). ¿O debería iniciar directo?
- (e) **Los caídos:** también quedan con los No2 llenos; el primero que juega es el primero de la lista que no está caído.
- (f) **La ronda:** al iniciar vuelve a «Ronda 1» aunque el orden viniera con otra cuenta de un combate anterior.


### P258 — 💍 Puntería certera y Foco: qué cuenta como «moverse» y qué pasa en la ronda 1 (2026-11-20, Claude)

> ✅ **Respondida (dueño, 2026-11-22):** «es correcto, así como lo planteás».

El ítem dice «si no te moviste ni en esta ronda ni en la anterior». Al arreglar que el bono saliera de más (ahora «quién se movió» se anota en la
partida y lo ven todas las pantallas) hubo que elegir algunas cosas que el texto no dice. Quedó así, «mientras tanto» (se cambia fácil):
- (a) **La ronda 1 del combate no da el bono.** Como no hubo una ronda anterior, se tomó «dos rondas quieto» al pie de la letra: lo más temprano
  que se activa es al empezar la ronda 2 (si no se movió en la 1). Antes lo daba desde el primer ataque del combate. ¿Está bien, o en la ronda 1
  vale con no haberse movido desde que empezó el combate?
- (b) **Cuenta como moverse** lo que el personaje hace por su cuenta: caminar (también el dodge roll), la Carga, el Takle, el Salto, el Dash, el
  Parpadeo / teletransporte propio, interponerse.
- (c) **No cuenta que lo muevan:** un empujón, que lo arrastren (el gancho, Atraer), tropezar en una trampa, el Cebo; ni el 🦶 Mover libre (la
  salida «sin reglas», que también usa el GM para acomodar). ¿Un empujón debería hacerle perder la puntería? ¿Y pasar por un portal?
- (d) **La «ronda»** es la del orden de turnos (la misma para todos), no «de tu turno a tu turno». Con eso, el que juega último y se mueve en su
  turno recupera el bono antes (en rondas) que el que juega primero. ¿Lo preferís contado por turno propio?
- (e) **El cartel «🎯 Puntería certera» / «🔮 Foco»** lo ven quien maneja al personaje y el GM (no el resto de la mesa, para no llenar la pantalla
  de carteles ajenos). ¿Lo ven todos?
- (f) **El aviso antes de moverse** («Si te movés, la perdés») sale cada vez que vas a caminar con el bono activo (si cancelás y volvés a
  arrastrar, pregunta de nuevo; después de «Moverme igual» ya no hay bono que perder). Solo al caminar: el Salto, el Dash, la Carga y el Parpadeo
  no preguntan (son habilidades que ya elegiste usar). El dodge roll tampoco. ¿Alguno de esos debería preguntar?
- (g) **Sin orden de turnos** (narrativo, o combate sin lista) sigue como antes: lo recuerda solo la pantalla que movió, sin cartel ni aviso.
- (h) ✅ (dueño, 2026-11-21: «arreglalo también»; hecho, ver P271) La **Apuntada** y la **Apuntada firme** de las ballestas («si no te moviste…») siguen con la memoria de una sola pantalla: tienen el mismo
  problema que tenía el anillo. ¿Las paso al mismo mecanismo?

### P259 — 🔍 «Ver detalle» de una zona: lo que quedó elegido «mientras tanto» (2026-11-20, Claude)

> ✅ **Respondida (dueño, 2026-11-22):** (3) «sí vale la pena»: que la nube guarde quién la puso y con qué (sin delatar al que está escondido); (4) «Ver detalle» de los tótems y estandartes, también (los dos en la cola). (2) como está.
> ✅ **(3) y (4) hechos (2026-11-22):** la nube guarda quién y con qué (no hicieron falta reglas nuevas) y lo muestra salvo a quien no ve a quien la puso («Alguien»); los tótems y estandartes tienen su «🔍 Ver detalle». Duda: P281.

> ✅ **Muro de fuego decidido (dueño, 2026-11-21):** «debería hacer daño a un personaje/token al iniciar el turno del mismo, si este está parado sobre el muro». Se corrige el mapa (cola: «🔥 Muro de fuego al empezar el turno»). Lo demás de P259 sigue abierto.
> ✅ **Hecho (2026-11-21):** el mapa, el texto de la habilidad, «Ver detalle» y el cartel de arriba dicen «al empezar su turno adentro». Queda P272 (la Varita del muro de fuego).

Contexto: la tarjeta «Ver detalle» de una zona (`vtt-hexgrid/js/127-zona-detalle.js`, `comun/zona-detalle.js`). Para que el dueño decida:

1. **«Empieza su turno adentro» o «al pasar de ronda».** El texto del Muro de fuego (y de otras zonas) dice que quema a quien «empieza su turno
   adentro»; el mapa, hoy, lo hace **cada vez que se pasa de ronda** (el Mantenimiento), a todos los que siguen adentro a la vez. La tarjeta dice
   lo que el mapa hace. ¿Se corrige el texto de las habilidades, o se cambia el mapa para que sea al empezar el turno de cada uno?
2. **La descripción de la habilidad de un creep, al jugador.** Hoy el jugador ve todo lo que la zona hace (daño, estado, tirada), pero no el texto
   de la habilidad del creep (trae costos y cooldowns). ¿Está bien así, o que la vea?
3. **La nube (Polvareda, Bomba de humo) no guarda quién la puso ni con qué.** La tarjeta dice «a mano». Guardarlo pide permisos nuevos de
   Firebase (y habría que no mostrárselo al jugador si quien la puso está escondido, que es justo el caso de la Polvareda). ¿Vale la pena?
4. **Tótems y estandartes.** Son tokens, no zonas: su cartel es otro y no llevan el botón. ¿Se les suma un «Ver detalle» propio?

### P260 — ⚔ Las cinco maestrías: lo que quedó elegido «mientras tanto» (2026-11-20, Claude)

> ✅ **Respondida (dueño, 2026-11-22):** (4) «las armas naturales sí se ven afectadas por las maestrías del mismo tipo de arma»; (7) «volver a cargar una misma pasiva que uno ya tiene cuesta un punto de Job más que la carga anterior: si cuesta 1, la segunda copia cuesta 2 y la tercera 3» (verificar si ya está así). Los dos en la cola. El resto, como está.
> ✅ **(4) y (7) hechos (2026-11-22):** lo natural y el puño cuentan por su Tipo (duda: P282); la copia N de una pasiva cuesta N − 1 más (no estaba así: cada copia costaba lo mismo).
Las maestrías de punzantes, cortantes, hachas, arcos y ballestas (`comun/pasivas.js`; la cuenta, `Combatiente.familiaDeArma` / `MAESTRIA_STATS`) quedaron
con estas decisiones conservadoras. **Para el dueño**, cuando quieras:
1. **El Bloqueo de cortantes y de hachas vale al bloquear CON esa arma** (como el Parry de las armas pesadas: no con un escudo). Dijiste «+1 al
   bloqueo, siempre» para las hachas: lo tomé como «no importa qué ataque sea». ¿O querías que valga también bloqueando con el escudo, mientras
   tengas el hacha en la otra mano?
2. **«Ballesta» = el arma de rango con Recarga** (así las distingue el juego para los virotes): entran también los **arcabuces**, que usan la misma
   mecánica. La **honda** no es ni arco ni ballesta: no recibe ninguna de las dos. ¿Los arcabuces afuera?
3. **Un arma de rango nunca es punzante, cortante ni hacha**, tenga el Tipo que tenga (una ballesta de Tipo 6 no recibe la de cortantes; un arcabuz
   de Tipo 8, la de hachas tampoco).
4. **Las armas naturales** (garras, colmillos, aguijón) y **el puño** no cuentan para ninguna maestría, aunque sean de Tipo 4. (Los guantes de «PdG
   con punzantes» sí las cuentan, como antes.) ¿Un creep de garras tendría que poder usar la de punzantes?
5. **Hachas:** la rebaja es por arma (el segundo ataque del turno *con esa hacha*), igual que el «primer ataque a mitad de precio». No rebaja el
   ataque de oportunidad ni el contraataque (ya cuestan lo de un primer ataque).
6. **Punzantes por la espalda:** el +1 se suma al +1 de siempre (y al de Paso ligero). Desde el sigilo no suma, porque ahí la defensa del rival ya
   vale 1 (la regla que ya había).
7. **Comprada dos veces**, cada bono se duplica (como cualquier pasiva): la de hachas llegaría a 4 No2 menos. ¿Tope de una compra para las maestrías?

### P261 — 🛡 Aguante de trinchera: lo que quedó elegido «mientras tanto» (2026-11-20, Claude)

> ✅ **Respondida (dueño, 2026-11-22):** «correcta como está planteada».
La pasiva (dueño: «+1 la defensa y +1 la defensa especial por cada enemigo adyacente», 2 de Job; `comun/pasivas.js`, stat `trinchera`) quedó así:
1. **Sin tope**, como la Táctica de enjambre. ¿Le ponés uno?
2. **Qué cuenta como enemigo pegado:** los rivales que se ven y están en pie — ni los escondidos (ocultos, en sigilo, bajo tierra, etéreos), ni los
   caídos, ni los tótems o estandartes. Es la cuenta que ya aprobaste para el **Estoicismo** («+Defensa por cada enemigo adyacente»), y no la del
   enjambre (que cuenta a los aliados escondidos y a los tótems). Me pareció más coherente que las dos cosas que dicen «enemigo pegado» cuenten
   igual, y además así la Defensa de más no delata a un rival escondido. ¿Preferís que cuente como el enjambre?
3. **Cuándo se cuenta:** en el momento en que le llega el golpe (si entre el ataque y el daño alguien se movió, vale lo del momento del daño). El
   cuadro del duelo lo anuncia al abrirse cuando esa pantalla puede saberlo; si un jugador ataca a un creep que la tiene, recién se ve en la cuenta
   del daño (la pasiva de un creep solo la ve el GM).
4. **Qué daño:** todo el que aplica el mapa con la Defensa (duelos, trampas, zonas). La **Defensa especial** de más, por ahora, solo en los duelos
   (un hechizo, una habilidad): el daño especial de una zona o una trampa no la suma. Un **crítico** ignora la Defensa entera, también esta.
5. **Comprada dos veces**, +2 por enemigo.
6. **Fuera del mapa** (la ficha suelta) no suma: se suma a mano.


### P262 — 🎁 Dar a un jugador: ¿una casilla «en secreto»? y lo que quedó elegido «mientras tanto» (2026-11-21, Claude)

> ✅ **Respondida (dueño, 2026-11-22):** (5) «está bien que la ventana le avise al GM» si la mochila queda llena (en la cola). El resto, como está.
> ✅ **(5) hecho (2026-11-22):** la ventana lo dice abajo y «🎁 Dar» pregunta «¿Dar igual?» (no bloquea).
La ventana «🎁 Dar a un jugador» (`comun/dar-jugador.js`) deja siempre una línea en la Mesa que ven todos («🎁 El GM le dio a Fulano: …»).
1. **¿Una casilla «en secreto»?** Para que esa línea no la vean los demás (un ítem que el GM le pasa a uno solo por la historia). No se programó:
   falta decidir si la línea directamente no sale, o si sale solo para el GM y para quien lo recibe.
2. **Los consumibles nuevos:** «✎ Ítem nuevo» usa el asistente de ítems, que no arma consumibles; para dar un consumible hay que elegir uno del
   catálogo. ¿Hace falta poder inventar un consumible en el momento?
3. **El ítem nuevo no se sube al catálogo:** queda solo en la mochila de quien lo recibe (desde ahí lo puede subir con «⬆ Subir al catálogo»).
   ¿Querés un botón para subirlo en el mismo paso?
4. **Hasta 50 unidades** de un mismo ítem por vez (cada unidad viaja escrita en el aviso). ¿Alcanza?
5. **La mochila llena** se mide por ranuras (el peso solo cuenta para lo equipado): se da igual, lo avisa el cartel del jugador y una línea en la Mesa.
   El GM no lo ve antes de dar. ¿Querés que la ventana le avise de antemano?
6. **Experiencia:** la ventana no da XP (no estaba en el pedido). ¿La sumo?


### P263 — ✅ 🙈 Cuando un jugador le pega con un área a alguien que no ve, el cuadro del duelo lo nombra (2026-11-21, Claude)

> ✅ **Decidida y hecha (dueño, 2026-11-22):** «no se debería abrir el duelo para el atacante. Al personaje en sigilo sí se le debe ofrecer la
> oportunidad de esquivar, si correspondiera, y en el caso de que lo logre, todo eso debería pasar desapercibido por el equipo rival»; y «si el que
> está escondido tarda en hacer su tirada, el juego se frenaría… habría que encontrar alguna forma creativa». Quedó así (`vtt-hexgrid/js/130`,
> `comun/duelo.js`): el escondido va en un área aparte, que corre en paralelo; su duelo solo lo ve quien lo maneja (o quien lo ve); el bando que
> la lanzó no espera nada, no ve cuadro ni Crónica ni líneas de la Mesa (ni si esquivó, ni si le pegó); si nadie contesta en 40 s, la pantalla
> del GM lo resuelve sola. Lo que quedó elegido «mientras tanto»: P287. Cuánto daño delata a alguien en sigilo: P288.
Visto en el clon de El origen: la rata estaba en sigilo, pegada a Rockardo, y él usó el Shockwave (la onda alcanza a los enemigos pegados). A los
dos jugadores se les abrió el cuadro del duelo con «Rockardo Pedruscko VS **Rata de la grieta. 2**», aunque ninguno la veía. Después todo salió bien:
la Mesa dijo «le hizo Shockwave a **Alguien**», el «Ver detalle del duelo» también, y la rata siguió en sigilo. La regla escrita hoy dice que
«atacar saca del sigilo y abre el cuadro con el nombre», pero eso es cuando ataca el escondido; acá el escondido es el que recibe.
1. ¿El cuadro del duelo tiene que decir «Alguien» (o «algo que no ves») en lugar del nombre mientras el objetivo siga escondido?
2. ¿O que un área que le pega a un escondido lo delate (como cuando un creep ataca desde la niebla)?
3. ¿O queda así (el jugador se entera del nombre porque «sintió que le pegó a algo»)?

### P264 — 🔦 Un creep que pone una zona desde la niebla: ¿se lo nombra o no? (2026-11-21, Claude)
Dos reglas tuyas se cruzan. La del 28/10: un creep que afecta a un rival con un área o una zona **queda delatado** (se lo ve en su casilla hasta
que se mueva o pase la ronda). La del 20/11: lo que hace alguien que no se ve, **no lo nombra**. Probado en el clon con el Goblin Alquimista
tirando el Muro de fuego desde la niebla: mientras elegía el largo, a los jugadores les salió «🎭 Alguien está realizando una acción incierta»
(bien); al aparecer el muro, el goblin quedó delatado y a la vista. Pero la línea de la Mesa quedó distinta en cada pantalla: a un jugador le
pasó a decir «Goblin Alquimista ⚡ Muro de fuego…» (lo vio enseguida) y al otro le quedó «Alguien…».
1. ¿Poner una zona delata al creep (como hoy) o tendría que seguir escondido, y solo verse la zona?
2. Si lo delata: ¿la línea de la Mesa tiene que nombrarlo en todas las pantallas por igual (hoy depende de cuántos segundos tardó cada una en verlo)?

### P265 — 🏹 Los arcabuces del catálogo no tienen Recarga: la Maestría en ballestas no les suma (2026-11-21, Claude)

> ⏸ **Para después (dueño, 2026-11-22: «me parece bien»):** se decide cuando toque la pólvora en el rework de las armas de rango (`docs/rework-armas-rango.md`); hoy las cinco armas de pólvora están archivadas.
En P260 quedó escrito que «ballesta» es el arma de rango con Recarga y que ahí «entran también los arcabuces». Visto con clics en la pasada de
pruebas: con la Maestría en ballestas y un **Arcabuz de cubierta**, la 🔍 de Atacar no suma nada. El motivo: los dos arcabuces del catálogo
(Arcabuz de cubierta y Arcabuz de mecha, los dos archivados) no tienen el dato de Recarga, así que el juego no los cuenta como ballesta (cobran
como un arma común: Tipo ÷ 2 y después el Tipo). No se tocó nada.
1. ¿Los arcabuces tienen que llevar Recarga (y entonces reciben la maestría y usan virotes), o quedan afuera de la maestría?

### P266 — 💍 Puntería certera y Foco: el ataque de oportunidad se pregunta antes que el aviso «si te movés, lo perdés» (2026-11-21, Claude)

> ✅ **Respondida (dueño, 2026-11-23):** el aviso del anillo sale **primero**, antes de ofrecerle al rival el ataque de oportunidad («está bien como lo planteás vos»). **Aplicada el 2026-11-24** (`oportunidadTrasAvisoQuieto`, vtt-hexgrid/js/17): Cancelar = sin moverse, sin oportunidad y sin perder nada; «Moverme igual» = lo pierde y recién ahí la oportunidad.
Visto con clics (Blanco J1 con el Anillo de Foco Arcano, pegado a un creep): al arrastrar el token, primero sale «⚔ Te alejás de … esperando a
ver si aprovecha el ataque de oportunidad» y el GM decide; recién después le aparece al jugador «Tenés Foco activo (+2 a PdG.Esp). Si te
movés, lo perdés. [Moverme igual] [Cancelar]». Si el GM ya atacó y el jugador elige Cancelar, el token se queda donde estaba pero el ataque
de oportunidad ya se jugó. Pasa igual con Puntería certera (es la misma pieza). No se tocó.
1. ¿El aviso del anillo tiene que salir primero (antes de ofrecerle al rival el ataque de oportunidad)?

### P267 — 🔮 Foco arcano: lo que quedó elegido «mientras tanto» (2026-11-21, Claude)

> ✅ **Respondida (dueño, 2026-11-23):** (1) vale también en áreas y misiles, bien; (2) no suma al Ef.Esp, bien; (3) castear no cuenta como moverse, correcto. Queda como está.
El Anillo de Foco Arcano quedó como el de Puntería certera (ronda 1 sin bono, «se movió» anotado en la partida, cartel «🔮 Foco», aviso antes de
moverse, que te muevan no lo apaga). Lo propio de un anillo de casteo:
1. **Vale para toda tirada de PdG.Esp de una habilidad o una varita**, también la Varita de misiles (cada misil suma su +2) y las áreas o
   líneas (ahí el casteador tira una sola vez para todos: se suma una vez). Antes solo lo sumaba la habilidad de un solo objetivo. ¿Está bien, o
   en un área no tendría que valer?
2. **No vale para lo que tira Ef.Esp** (una zona como la Nube tóxica) ni para lo que no tira nada. ¿Tendría que sumar también al Ef.Esp?
3. **Castear no cuenta como moverse**; el Parpadeo / teletransporte propio sí (como en Puntería certera).

### P268 — 🌫 Una zona hecha a mano «de fuego» ahora es de fuego de verdad (2026-11-21, Claude)
El asistente de «Zonas con efectos persistentes» dejaba elegir el tipo de daño (fuego, hielo, eléctrico, tóxico, luz, siniestro), pero la zona se
guardaba sin ese dato: el daño entraba siempre directo. Se arregló (se guarda), y eso cambia cómo pegan esas zonas: ahora le restan la
resistencia a ese elemento **y la Defensa especial** del que la pisa (como cualquier daño especial que no es «directo»), sale el cartel «INMUNE
AL FUEGO», una de fuego se dibuja como fuego y una tóxica cuenta como nube (el viento la despeja). Las «arcanas» y las físicas siguen igual.
1. ¿Las zonas hechas a mano por el GM tienen que restar la Defensa especial (como quedó), o su daño elemental tendría que ser directo (solo la
   resistencia al elemento), como el de las varitas y el Muro de fuego?

### P269 — ⏭ Pasar de ronda: qué les pasa a los que se saltean (2026-11-21, Claude)

> ✅ **Decidida (dueño, 2026-11-22):** «correcto»: a los que se saltean se les aplica lo de «al terminar tu turno» y el Muro de fuego no los quema.
El botón nuevo «⏭ Pasar de ronda» (orden de turnos, solo el GM) hace lo mismo que apretar ▶ Siguiente con cada uno que faltaba. Quedó elegido
«mientras tanto» (lo más parecido a pasar esos turnos uno por uno, como ya se hacía con los caídos que se saltean):
1. **Cada uno que se saltea pasa su turno sin jugar**: le empieza (recarga No2 y SP, bajan sus cooldowns, pegan su Veneno o su Quemadura) y le
   termina (lo de «al terminar tu turno»: la Calma le devuelve No2 si no atacó, un estado que explota al vencer explota) y sus zonas pierden un turno.
   ¿Está bien, o preferís que se salteen «congelados» (sin recargar ni que les pase nada)?
2. **Un caído que se saltea** solo baja su cuenta para morir (como con ▶ Siguiente).
3. **El Muro de fuego** (que desde el 2026-11-21 quema al empezar el turno de quien está parado encima) **no les quema** a los que se saltean con
   «⏭ Pasar de ronda»: solo al que empieza a jugar. ¿Les tendría que quemar también?

### P270 — 💀 «Al morir se van los estados»: ¿al caer o al morir del todo? (2026-11-21, Claude)

> ✅ **Decidida (dueño, 2026-11-22):** «sí»: al caer en 0 se borran los estados. «Si un creep cae desde GM Tools… no debería ser así»: tiene que perderlos también (en la cola).
> ✅ **Hecho (2026-11-23):** un creep que cae desde GM Tools (por cualquier camino) pierde los estados igual que en el mapa, con la misma línea en la Mesa; la ficha suelta y, en el mapa, la Botonera nueva y el pase de turno de un personaje ahora también cuentan la caída. Lo que quedó elegido: P292.
P257 dice «al momento de morir se le eliminan todos los estados alterados». Se tomó **morir = caer** (la vida a 0, inconsciente o derrotado), porque
la decisión venía con «un caído queda como estaba al caer». Así quedó:
1. **Al caer** se le van todos los estados, menos lo del equipo, lo derivado y la Llama de Fénix sin usar (el mismo criterio que al volver de la
   muerte). La Mesa lo cuenta («💀 X cayó: se le fueron 2 estados (…)»). ¿O tendría que ser recién al morir del todo (cuando se le acaban los turnos)?
2. **Un creep** que cae desde el mapa (un golpe, la vida a mano en el token) también los pierde. Si se le baja la vida a 0 desde GM Tools suelto,
   todavía no (ahí no se tocó nada).
3. **Caído = queda como cayó** al empezar su turno, al pasar de ronda y al «Iniciar combate»: no recarga No2 ni SP, no regenera vida, no bajan sus
   cooldowns. Sus invocaciones que siguen de pie, sí. Lo único que corre es la cuenta para morir (y la Llama de Fénix de un creep, que lo revive al
   empezar su turno).

### P271 — 🎯 Las Apuntadas de las ballestas: ¿cartel y aviso como el anillo? (2026-11-21, Claude)

> ✅ **Respondida (dueño, 2026-11-23):** (1) «sí, sumale el aviso» (y el cartel), como el anillo; (2) la Apuntada firme no vale en la ronda 1, «y de hecho la Apuntada simple tampoco debería valer desde la ronda 1. Tampoco en el anillo» (el anillo ya no daba bono en la ronda 1). En la cola.
> ✅ **Hecho (2026-11-23):** el cartel «🎯 Apuntada» / «🎯 Apuntada firme» y el aviso antes de moverse (también antes de Dash, Salto, Carga, Takle y Parpadeo; con el anillo, un solo aviso), ninguna Apuntada en la ronda 1 (el anillo tampoco, verificado), y la 🔍 de Atacar y el cuadro del duelo dicen si suma y por qué. Probado con clics en «Claude · pruebas 2». Dudas: P293.
Las Apuntadas ya usan lo anotado en la partida (lo que se movió cuenta en todas las pantallas; que te muevan, no), como pediste. Lo que NO se les sumó
(no estaba en el pedido): el cartel dorado cuando se activa y el aviso «si te movés, la perdés» que tienen Puntería certera y Foco. Además, la
**Apuntada firme** quedó como el anillo: recién desde la ronda 2 (en la 1 no hay «turno anterior» quieto); la Apuntada simple vale desde la ronda 1.
1. ¿Les sumo el cartel y el aviso?
2. ¿La Apuntada firme en la ronda 1, sí o no?

### P272 — 🔥 La Varita del muro de fuego: ¿también al empezar el turno? (2026-11-21, Claude)

> ✅ **Decidida (dueño, 2026-11-22):** «sí»: la Varita del muro de fuego también pega al empezar el turno (en la cola).
> ✅ **Hecho (2026-11-23):** el mapa, el texto de la varita, «Ver detalle» y el cartel de arriba dicen «al entrar o cruzarlo y al empezar su turno adentro»; las copias viejas se ponen al día solas. Dudas: P294 y P295.
El Muro de fuego (la habilidad de los magos creep) ya quema al empezar el turno de quien está parado encima (P259). La **Varita del muro de fuego**
(Buena Calidad, 1d4 de fuego, 3 casillas) dice otra cosa en su texto: «a cada rival que entra y, en cada Mantenimiento, al que sigue adentro», y así
sigue (no se tocó: el pedido era el Muro). ¿La paso al mismo comportamiento (y cambio su texto), o queda distinta a propósito?

### P273 — 💍 El aviso de los anillos antes de una habilidad que mueve: ¿cuándo sobra? (2026-11-21, Claude)
Con Puntería certera o Foco activos, el Dash, el Salto, el Takle, la Carga que derriba, el Parpadeo y la Varita del blink apagan el anillo como
caminar (ya lo hacían) y ahora, además, avisan **al tocar Ejecutar, antes de cobrar**: «Si te movés con Dash, los perdés. [Usarla igual] [Cancelar]».
Se pregunta ahí porque después ya está cobrado. Dos casos en los que el aviso puede sobrar:
1. **La Varita del blink sobre un aliado**: el aviso sale igual (todavía no se eligió a quién); si teletransportás a otro, tu anillo no se apaga.
2. **El Salto, el Takle o la Carga con el objetivo ya pegado**: no se mueve (ataca sin saltar ni correr) y el anillo sigue, pero el aviso salió.
¿Está bien así (el aviso dice «si te movés…»), o preferís que en esos casos no avise?

### P274 — 🔥 Al empezar el turno sobre una zona: ¿primero lo del turno y después la zona? (2026-11-22, Claude)

> ✅ **Decidida (dueño, 2026-11-22):** «el orden me parece bien»: primero lo del turno y después la zona.
Ahora la zona que pega al empezar el turno (el Muro de fuego) es un renglón más de «▶ Empieza tu turno», con su botón. **Elegí, por lo más seguro,
que el botón de la zona se habilite recién después de «✔ Aplicar»**: primero lo del turno (los estados bajan, la regeneración, los No2) y después
el fuego. El orden importa en un caso: si el fuego te deja en 0 antes de aplicar el turno, el turno empieza «caído» y no regenera nada; así, primero
regenerás y después te quemás. Si el GM aplica el turno por el jugador (o se aplica solo al pasar el turno), el botón de la zona queda habilitado
igual. ¿Está bien ese orden, o preferís que la zona vaya primero (o que se pueda en cualquier orden)?

### P275 — 🐝 Una invocación fuera del orden de turnos parada en una zona: ¿también adentro del cartel? (2026-11-22, Claude)

> ✅ **Decidida (dueño, 2026-11-22):** «una invocación debería ubicarse en la lista en el orden de turnos», con su propia tirada de iniciativa al invocarse (en la cola). **Aplicado (2026-11-23):** al aparecer con el orden armado tira su iniciativa (va a la Mesa) y entra en su lugar; al irse, sale del orden. Dudas: P301–P304.
Visto en el mapa: la abeja de Blanco J1 (una invocación que **no** está en el orden de turnos) estaba dentro de una zona. Como no tiene turno propio,
la zona le pega al pasar de ronda, con su cartel de siempre, en la pantalla de su dueño. Ese cartel queda esperando y, cuando después empieza el turno
del personaje, sale «▶ Empieza tu turno» y se ven los dos a la vez (son de dos fichas distintas). Si el jugador toca el de la abeja y se abre el
cuadro del daño, la ventana del turno ya se aparta (no lo tapa). ¿Querés que la zona de una invocación sin turno propio también vaya como renglón del
«Empieza tu turno» de su dueño (pegaría al empezar el turno del dueño en vez de al pasar de ronda), o está bien así?

### P276 — 🔗 Un token suelto, ¿se puede vincular después a una ficha o a un creep? (2026-11-22, Claude)
Con el panel «👥 Personajes y tokens», «✎ Editar token» de un token sin ficha abre la ventana del token suelto (nombre, descripción, imagen, color) y
ya no la de antes, que dejaba elegir «Vinculado a…». **Elegí lo más simple: un suelto queda suelto.** Para un creep, el GM lo trae con «👹 Traer
creeps…» (y saca el suelto); para un personaje, «🎭 Ponerlo en el mapa». Los tokens **vinculados** siguen con su «✎ Editar token» de siempre
(cambiar el vínculo y el dueño). ¿Hace falta poder convertir un suelto en el token de un creep (por ejemplo, un NPC que se vuelve enemigo), o así está bien?

### ✅ P277 — 🪨 El token suelto de un jugador: ¿cómo se comporta en combate? (2026-11-22, Claude)

> ✅ **Resuelta (dueño, 2026-11-22, «token suelto paso a paso»; aplicado el 2026-11-23):** al crearlo se pregunta «¿Ocupa lugar en la iniciativa? Sí / No» y «¿Tiene vida? Sí / No»; con vida, se lo puede atacar y hasta ahí. Lo que quedó abierto de eso: P305–P308. Ocultarlo (👁 del GM) sigue como estaba.
El de un jugador es un token «de personaje» sin ficha (lo mueve él, borde de los suyos); el del GM, un NPC (borde gris). **Elegí no cambiar nada de lo
que ya hacía un token sin ficha**: se mueve sin costo de No2, no tiene vida ni estados, y entra en «Traer tokens» del orden de turnos igual que
cualquier token del mapa (como ya pasa con los NPC; está en la cola el pedido de que «Tirar iniciativa» no meta lo que no va). ¿Un token suelto de
jugador debería quedar fuera del orden de turnos siempre? ¿Y el GM debería poder ocultarlo (hoy sí puede: 👁 en su HUD)?

### P278 — 🤝 Las otras puertas de «Dar» y «Pasar»: ¿se dejan o se sacan? (2026-11-22, Claude)

> ✅ **Decidida (dueño, 2026-11-22):** «reemplazá el emoji del regalito por el emoji de las manos… que el regalo quede solo para el botín» (en la cola). Las puertas se quedan; cambia el ícono.
> **Aplicada (2026-11-23):** el 🤝 en el «⋯» del token, en cada fila de 👥 Personajes, en el Ver de un ítem, en la ventana «Dar a un jugador», en su cartel «El GM te dio algo», en «Dar como GM» y en «Darle un ítem» de mano a mano. El 🎁 quedó en Despojos / botín (y en dos lugares que no son ni dar ni botín: P309). Ojo con el 🤝 repetido en el token: P310.
Con el botón **🤝 Dar** del menú de la izquierda (mapa, ficha y GM Tools) quedan varias puertas que llevan a las mismas dos ventanas. **Elegí no sacar
ninguna** y anotarlas: (a) en la ficha, «🤝 Pasar» arriba de la mochila y «🤝 Pasar a un aliado» en la ventanita «💰 DDE y despojos» abren
exactamente lo mismo que el 🤝 Dar del jugador (las más redundantes; la de la ventanita de DDE es la candidata a irse); (b) el «🤝 Dar» / «🤝 Pasar a
un aliado» de cada ítem de la mochila sirve para no buscar el ítem en la lista (se queda); (c) el 🎁 del «⋯» del token (mapa) y el 🎁 de cada fila de
👥 Personajes (GM Tools) abren «Dar a un jugador» con ese personaje ya marcado (atajo; se queda); (d) «🎁 Dar a un jugador» en el Ver de un ítem de GM
Tools, con el ítem ya puesto (se queda); (e) el 🤝 de mano a mano del token pegado también deja **pedir** (se queda). ¿Saco (a)? ¿Y el 🎁 del «⋯» y de
👥 Personajes pasan a ser 🤝, para que el 🎁 sea siempre y solo el botín?

### P279 — 💨 La Prisa con la tirada partida a la mitad o con Afortunado: ¿el +5 se suma antes o después? (2026-11-22, Claude)

> ✅ **Decidida (dueño, 2026-11-22):** «dejalo así como lo decidiste»: el +5 de la Prisa se suma después y entero.
La Prisa pasó a ser +5 fijo al RESULTADO de la tirada de Iniciativa (el dado sale de la Iniciativa sin la Prisa: 1d6+5). Si un estado partiera la tirada de
Iniciativa a la mitad (hoy ninguno lo hace: Pajaritos, Lisiado, Parálisis y Sentado tocan PdG, Evasión o Parry) o con Afortunado, **elegí sumar el +5
después**, entero: primero el dado (con su mitad o su segunda tirada) y al final el +5. Con Afortunado, las dos tiradas llevan su +5. ¿Va así, o el +5
también tendría que partirse? Además, «Iniciativa fija» quedó como un bono más (stat `inifijo`): cualquier ítem o estado podría dar un fijo a la
Iniciativa con ese mismo mecanismo (hoy solo la Prisa lo usa).

### P280 — ☥ La vida subida a mano a un caído: ¿queda Titilando? (2026-11-22, Claude)
Con el «Sí» del cartel nuevo (P256 (i)) el caído vuelve como con ✚ Revivir: se le van los estados y **queda Titilando** (Invulnerable hasta que empieza
su próximo turno), con la línea «✚ X vuelve con N de vida, Titilando… (lo revivió el GM, subiéndole la vida a mano)» y la animación corta. Antes, la
vida a mano lo levantaba **sin** Titilando. Además, ese cambio no se deshace con Ctrl+Z (es una resurrección, no un número). ¿Va con Titilando, o la
vida a mano lo levanta sin él?

### P281 — 🤐 El nombre del tótem o del estandarte delata a quien lo clavó (2026-11-22, Claude)

> ✅ **Decidida (dueño, 2026-11-22):** «correcto, sacale el nombre del creep» al token del tótem y del estandarte (en la cola).
> ✅ **Aplicada (2026-11-23):** el token, su ficha y su nota se llaman como la habilidad («Estandarte de guerra», «Tótem de silencio»). Los ya clavados con el nombre viejo los renombra solo la pantalla del GM al verlos. «Ver detalle» sigue diciendo de quién es con la regla de P259 (4). Duda que salió: P311.
El «Ver detalle» nuevo (P259 (4)) no nombra a quien clavó el tótem si esa pantalla no lo ve («Alguien»), pero **el token** se llama «Tótem de silencio
de <creep>» / «Estandarte de <creep>» (así se crea desde el 2026-10-24), y ese nombre se ve debajo del token y en el cartel de arriba. ¿Se le saca
el nombre del creep al token («Tótem de silencio», a secas)?

### P282 — 👊 El puño cuenta como punzante (2026-11-22, Claude)

> ✅ **Decidida (dueño, 2026-11-22):** «por ahora está bien», pero «el puño todavía es toda una gran incógnita de desarrollo»: queda así hasta que se diseñe el puño.
Desde P260 (4) las armas naturales y el puño cuentan por su Tipo. El puño es Tipo 4, así que **suma la Maestría en armas punzantes** (+1 al daño, +1
PdG de oportunidad y por la espalda). Lo elegí así porque el pedido decía «y el puño si tiene Tipo». ¿Está bien, o el puño queda afuera? (Los guantes
de «PdG con punzantes» siguen como antes: al puño de un personaje no le suman; al de un creep sin arma, sí.)

### P283 — 🛡 Aguante de trinchera con cualquier daño: lo que quedó elegido «mientras tanto» (2026-11-22, Claude)

**Punto 1 decidido (dueño, 2026-11-23): alcanza con el aviso** («casi siempre todo esto va a suceder en el mapa»). Idea para más adelante: que GM Tools avise cuando en el mapa pasan cosas que requieren ir ahí (anotada en la cola).

Pedido del dueño (2026-11-22): «debería contemplarse para cualquier daño que tenga en cuenta esas defensas, independientemente si es trampa, ataque u
otra cosa». Ahora la regla de a dónde va el bono está en un solo lugar (`Combatiente.trincheraDelGolpe`) y todo daño del mapa pasa por ahí. Quedan dos
cosas chicas para decidir:
1. **GM Tools no lo cuenta.** El cuadro «daño» de un creep en GM Tools resta la Defensa pero no sabe quién lo tiene pegado (eso lo sabe el mapa).
   Mientras tanto, si el creep tiene la pasiva, el aviso del daño dice «el Aguante de trinchera no se cuenta acá (lo cuenta el mapa): si tiene enemigos
   pegados, sumalo a mano» (lo mismo que la ficha suelta, P261 punto 6). ¿Alcanza así, o querés que GM Tools mire el mapa?
2. **Las Armas perforantes contra la Defensa especial.** «Pasan N siempre» se cuenta contra la Defensa especial del equipo; el +N del Aguante se resta
   después, así que puede frenar parte de lo que «pasaba siempre». (Contra la Defensa común sí está bien: la Perfora se cuenta con el Aguante incluido.)
   Mientras tanto queda así (es un caso muy raro). ¿Lo emparejo?
   **Decidido (dueño, 2026-11-24): (a)** — emparejarlo con la Defensa común: el Aguante se suma a la Defensa especial antes de contar la Perfora
   («pasan N siempre» es siempre). De paso, la cuenta muestra la Defensa especial real (no lo que frenó).
   ✅ **Aplicado (2026-11-24):** `Combatiente.perforaContraEsp` / `perforaEspPartes` (comun/combatiente.js), usados por el daño del duelo (vtt-hexgrid/js/13)
   y su cuenta (js/10). Probado con clics en «Claude · pruebas 2».

**Diagnóstico (2026-11-24):** el caso existe de verdad, pero es raro: hoy lo único que «perfora» la Defensa especial es el estado **Armas perforantes**
(lo da el Armero, creep Support, desde nivel 2) y solo cuenta en una habilidad con daño especial (no directo) contra alguien con Aguante de trinchera
y enemigos pegados. Ejemplo: daño especial 8, Defensa especial 6, Aguante +2, Perfora 3 → hoy entran **1** (la cuenta dice «pasan 3» y después el
Aguante resta 2); contra la Defensa común, con los mismos números, entran **3**. Opciones: (a) emparejarlo, contar el Aguante dentro de la Defensa
especial antes de la Perfora (entran 3, como en la común; recomendada); (b) dejarlo así (entra 1); (c) dejar el resultado pero arreglar la cuenta
para que diga claro que el Aguante frenó 2 de los 3 que pasaban (hoy muestra «Defensa especial 5», que confunde). Espera la respuesta del dueño.

### P284 — ✋ Consumibles propios, a mano: lo que quedó elegido «mientras tanto» (2026-11-22, Claude)

> ✅ **Respondida (dueño, 2026-11-22):** (1) y (3) «están bien resueltas», como están. (2) «no estaría mal agregarle como opción tirar un dado»: el consumible propio puede llevar una tirada opcional que sale al consumirlo (en la cola).
> ✅ **(2) aplicada (2026-11-24):** el asistente tiene «🎲 Tirada al consumirlo (opcional)» en el paso Unidades; al consumirlo se tira sola (a nombre de
> quien lo consume) y sale en la Mesa junto al «✋ a mano»; el Ver dice «🎲 al consumirlo: 2d4+1». Ver `docs/cola-de-pruebas.md`.

Pedido del dueño (2026-11-22): «que +ítem te deje crear ítems consumibles, pero sin automatización… que los efectos de los consumibles custom se
resuelvan a mano». Ya está: en el asistente de ítems, la categoría Consumible tiene un camino corto (qué es · unidades · precio/peso · listo) y el ítem
queda marcado «✋ A mano: el efecto lo resuelve la mesa.». Quedan tres cosas chicas para decidir:
1. **GM Tools, «✎ Ítem custom»**: se puede armar un consumible propio, pero **no se le equipa a un creep** (el cinturón de un creep usa los consumibles
   del catálogo, por nombre): «Crear y equipar» avisa y deja subirlo al catálogo (⬆) o dárselo a un jugador (🎁 Dar a un jugador). ¿Querés que un
   creep pueda llevar uno propio?
2. **Una tirada propia**: hoy un consumible propio no tira nada al usarse (la Mesa muestra qué hace y listo). ¿Querés que pueda llevar una tirada
   opcional (ej. «tira 1d6») que salga sola al consumirlo, como el «✋ A mano» de las varitas?
3. **Mismo nombre que uno del catálogo**: el cinturón junta las pilas por nombre; un consumible propio que se llame igual que uno de fábrica
   (ej. «Poción de vida») se apilaría con él. Mientras tanto queda así (es raro); ¿avisamos al crearlo?

### ✅ P285 — 🕊️ Mensajes secretos: lo que quedó elegido «mientras tanto» (2026-11-22, Claude)

> ✅ **Aplicada (2026-11-24):** paloma siempre a la vista y ruta principal (con algo sin leer abre esa conversación; si no, «Mensaje secreto» /
> «Mensaje a todo el grupo»); 📣 mensaje público; `/r` responde al último que me escribió; además (directrices del 2026-11-24) los mensajes
> en la Mesa de quien puede verlos, la paloma que vibra y el aviso flotante. Lo nuevo que quedó elegido: P318.

> ✅ **Respondida (dueño, 2026-11-22):** (1) «está bien que se borre» así; (2) «me gusta la sugerencia»: `/r` responde al último que me escribió; (3) «la paloma flotante me gusta que quede y que de hecho esa sea la ruta principal para abrir el mensaje, más que la Mesa; de última que sean ambas»; (4) paloma en todos lados, bien; (5) no hace falta «responder a todos». Lo que cambia, en la cola.

Pedido del dueño (2026-11-22, «✉ Mensajes secretos entre usuarios», decisiones (a)–(g) en `docs/cola-de-pruebas.md`). Está hecho
(`comun/mensajes.js`); quedan cosas chicas para decidir:
1. **Qué es «limpiar el registro general».** Elegí los dos botones del GM que ya limpian la Mesa: el **🗑 de la Mesa** borra *todos* los mensajes
   secretos (junto con todas las tiradas) y el **🆕 Registro nuevo** (📜 Historial, y el recordatorio al pasar a combate) borra los de *antes del
   combate anterior*, igual que las tiradas. La limpieza automática (lo de más de 30 días o de antes del combate anterior, cuando entra el GM) **no**
   los toca: no se borran solos. ¿Está bien así?
2. **`/r` hace lo mismo que `/m`.** En otros juegos `/r` es «responder al último que me escribió» (sin poner el nombre). ¿Lo querés así?
3. **El 🕊️ flotante aparece recién cuando hay algún mensaje** (mandado o recibido) en el registro; sin mensajes no se ve (para mandar está el 🕊️ de la
   Mesa). ¿O preferís que esté siempre?
4. **La paloma en todos lados** (dueño, 2026-11-22: «el botoncito flotante… podría tener el icono de una paloma blanca, como si fuera una paloma
   mensajera. El emoji»): la usé también en el botón del pie de la Mesa, en la fila de la Mesa, en la tarjeta de la Crónica y en las ventanas, para
   que todo lo de los mensajes se reconozca igual. ¿Te gusta así o la dejamos solo en el flotante?
5. **Un mensaje a varios**: cada uno lo ve en la conversación con quien lo mandó, con «También para: …»; si responde, le contesta solo a quien lo
   mandó (no a todos). ¿Hace falta «responder a todos»?

### P286 — 📖 Glosario en «Ver detalle»: los textos nuevos y qué se marca (2026-11-22, Claude)

> ✅ **Respondida en parte (dueño, 2026-11-22):** (1) los textos de las resistencias quedan «como ok hasta que te diga lo contrario» (los va a ver en el mapa); (4) «una marca por tarjeta está bien». (2) y (3) siguen como están, sin respuesta todavía.

Pedido del dueño (2026-11-22: «en el menú de "Ver detalle" de las trampas y las zonas… le agregaría el glosario con hover»). Está hecho
(`comun/zona-detalle.js` → `ZonaDetalle.html`, `comun/glosario.js`); quedan cosas chicas para mirar:
1. **Las tres resistencias.** Antes su globo decía solo el nombre largo («Resistencia especial»). Les escribí un texto sacado de la nota
   «Resistencias» del manual: **Res.Esp** (de la Constitución) contra el daño y los efectos especiales; **Res.CC** (de la Constitución) contra los
   estados de control (Stun, Inmovilizado, Rengo, Lisiado, Pajaritos, Exhausto); **Res.Mt** (del Especial) contra el control mental y las maldiciones
   de la mente (ejemplo: la Mala sombra). El manual dice que las tres están «en pausa, mezcladas». ¿Los textos te sirven así?
2. **PdG, Defensa y Evasión se marcan solo en «Ver detalle».** En el resto del juego siguen sin globo a propósito (la regla de 2026-10-09: «llenarían
   todo de vínculos»). ¿Los querés también en otros lados (el Ver de las habilidades, la Mesa)?
3. **Fuego amigo y Mantenimiento** tienen entrada nueva, así que ahora llevan su globo **en todo el juego** (el Ver de las habilidades y los ítems, la
   Mesa), no solo en la tarjeta. ¿Está bien?
4. **Una marca por tarjeta:** un término se marca la primera vez que aparece en toda la tarjeta (lo destacado de arriba primero). Si aparece de nuevo
   más abajo (por ejemplo, «Expuesto» en «Estado que deja»), ahí va sin marcar. ¿O preferís que se marque en cada fila?

### P287 — 🙈 Un área contra alguien escondido: lo que quedó elegido «mientras tanto» (2026-11-22, Claude)

> ✅ **Respondida (dueño, 2026-11-23):** «lo que elegiste mientras tanto está bien».
Hecho con P263 (el escondido va en un área aparte, en paralelo; solo lo ve quien lo maneja). Probado con clics en «Claude · pruebas 2». Quedaron
elegidas estas cosas, todas cambiables:
1. **Dos tiradas de quien la lanza.** Para no hacer esperar a nadie, contra el escondido la tirada de quien lanza el área (y el daño, si es de «una
   tirada para todos») se hace sola al lanzarla, sin que la vea nadie; contra los que sí ve, la tira él con su botón, como siempre. O sea: puede
   salir un número contra los visibles y otro contra el escondido (en la prueba: 4 contra el Protector, 1 contra la rata). ¿Está bien, o preferís
   que el escondido espere la tirada de los visibles (a riesgo de frenarlo un poco)?
2. **Si le pega, el bando que la lanzó tampoco ve nada** (lo más conservador): ni «Alguien» en la Mesa ni el golpe en el mapa. Lo único que
   puede enterarlo es la regla de siempre: si el daño le saca más vida que su Sigilo, se delata (P288) y ahí sí aparece con su nombre. ¿Querés que
   al atacante le llegue algo cuando le pega («sentís que le diste a algo»)?
3. **Si en el área solo había escondidos**, quien la lanza ve «No hay nadie adentro del área» (lo mismo que si no hubiera nadie) y la animación de
   la onda no sale (para que no se note la diferencia). Lo malo: el escondido tampoco ve la onda. ¿Te parece?
4. **El tiempo: 40 segundos** sin que nadie haga nada en el duelo del escondido. Pasado eso, la pantalla del GM lo hace por él: tira su
   resistencia con el valor de su stat (sin anillos ni Flash: el número de la ficha o del creep, como «🎲 Tirar a mano»), no se mueve en el dodge
   roll, acepta el daño y tira/aplica los efectos. Necesita la pantalla del GM abierta. ¿40 s está bien? ¿Querés un aviso en su pantalla antes?
5. **Quién lo ve:** quien lo maneja (su jugador, el GM si es un creep), el GM con 👁 Revelar lo oculto, y quien lo ve en ese momento (un aliado
   de un personaje escondido lo ve). Lo que una pantalla no vio mientras pasaba no lo ve después aunque el escondido quede a la vista (la Mesa
   también se decide una vez).
6. **Qué áreas van aparte:** las de rivales con una tirada de quien la lanza (área, onda, cono, línea). Siguen como antes (a la vista): las de
   aliados, la Tormenta arcana y el Meteoro, los misiles repartidos, las zonas con duelo y las que tiran el daño contra cada uno.
7. **El escondido no salta al frente:** si a quien lo maneja ya se le abrió otro duelo, el suyo queda como botón abajo (como cualquier duelo).
8. **La tirada hecha de antemano** sale de lo que la Botonera de quien la lanza dice que tiraría (con Pajaritos y esas mitades), sin Flash, sin el
   Foco ni el Ojo de carancho; si no la tiene a mano, del número de su ficha.

### P288 — 🕶 ¿Cuánto daño tiene que recibir alguien en sigilo para que se revele dónde está? (2026-11-22, dueño)
Dueño: «también tenemos que definir conceptualmente cuánto daño tiene que recibir un personaje en sigilo para que se revele su ubicación». Para
conversarlo; no se tocó nada. **Cómo funciona hoy** (regla del 2026-11-01, «el golpe le saca más que su Sigilo», sin tirada): si un golpe le saca
más vida que su valor de Sigilo (personaje: su Sigilo; creep: su stat de Sigilo), pierde el estado Sigilo (sin el Marcado de cuando lo descubren) y
va a la Mesa «🕶 Fulano se delató y salió del sigilo». **Solo lo miran:** el daño de un área, onda, cono o línea (`dueloAplicarDano`), el de una
zona al entrar o en el Mantenimiento, y el de una trampa (también a los de alrededor si explota). «Le saca» = vida perdida (lo que se come un
escudo o la Vida extra no cuenta). **No lo miran:** el veneno, el sangrado y lo demás que pega al empezar el turno; un golpe directo (para pegarle a
uno hay que verlo); el daño de colisión. En la prueba de P263, Blanco J2 (Sigilo 6) recibió 7 y 8 de la Nova arcana y se delató las dos veces.
1. ¿Más que su Sigilo está bien como umbral, o preferís otra cosa (cualquier daño, la mitad de su vida, una tirada de Sigilo contra el daño)?
2. ¿El veneno y el sangrado también tendrían que poder delatarlo?
3. ¿Delatarse = se sabe dónde está (como ahora: se le saca el sigilo) o solo un «?» en esa casilla, como cuando entra en sigilo a la vista?

### P289 — 📺 La tele en todos los teletransportes: lo que quedó elegido (2026-11-23, Claude)

> ✅ **Punto 1 decidido (dueño, 2026-11-23):** los círculos de luz del teletransporte «que queden», junto con la tele. El punto 3 («reducir movimiento») queda para verlo en la compu.
Ahora todo teletransporte de un token se apaga como un televisor viejo donde estaba y se prende donde llega (el Portal trampa, el Glifo de
teletransporte, la Varita del portal, Invocar portal, la Trampa de teleport), como el Parpadeo. Quedaron elegidas estas cosas, todas cambiables:
1. **Los pulsos se quedan además de la tele**: los círculos violeta (donde entró) y azul (donde salió) con el hilo punteado, ~4 s. La tele dice «se
   fue y apareció»; los pulsos, entre qué dos puntos pasó (sirve sobre todo si el token se va lejos o a una parte del mapa que no se está mirando).
   ¿Te gustan juntos, o preferís solo la tele?
2. **El Town portal solo se apaga**: el token se va del mapa, así que la tele se apaga sobre el portal y no se prende en ningún lado.
3. **«Reducir movimiento»**: la tele no sale (el token salta, como el Parpadeo), pero los pulsos se siguen viendo como siempre (eso ya era así).
   ¿Los achicamos también?

### P290 — 🙈 El inicio de turno de alguien escondido: lo que quedó elegido (2026-11-23, Claude)

> ✅ **Respondida (dueño, 2026-11-23):** «las dudas nuevas están bien como están».
Ahora lo que le pasa a alguien escondido al empezar (y terminar) su turno —la tarjeta «Empieza el turno de…», el «▶ Empieza tu turno» en la Crónica,
el reporte del veneno en la Mesa, el anillo dorado— lo ven sus aliados con su nombre (los jugadores si es un personaje; el GM si es un creep) y sus
rivales no ven nada (ni «Alguien»). Quedaron elegidas estas cosas, todas cambiables:
1. **El GM pierde «▶ Aplicar por él»** del inicio de turno de un personaje escondido (no le llega esa tarjeta). Si el jugador no lo aplica, se aplica
   solo al pasar el turno, como siempre; con 👁 Revelar lo oculto prendido, el GM sí lo ve y tiene el botón. ¿Está bien?
2. **El orden de turnos sigue marcando el turno de un creep conocido** aunque esté escondido (decisión del 2026-10-09, P255 c): los jugadores ven
   en la lista «le toca a Blanco creep», aunque no les llegue nada más. ¿Lo dejamos así o la lista tampoco debería marcarlo mientras esté escondido?
3. **Si el escondido es el primero de una ronda nueva**, a sus rivales les llega igual una tarjeta «Ronda N · Pasa el turno», sin nombre (para que
   sepan que cambió la ronda). ¿O preferís que no les llegue nada?
4. **El 📜 Historial del GM** sigue anotando la vida y los estados de un personaje escondido (lo escribe mirando los datos, sin saber quién lo
   ve). ¿También habría que esconderlo ahí, o es el registro del GM y está bien que lo tenga?

### P291 — 🎲 Quién ocupa lugar en el orden de turnos: lo que quedó elegido (2026-11-23, Claude)

> ✅ **Respondida (dueño, 2026-11-23):** (1), (3) y (4) bien como están; (2) «sí, quiero que lo hagas»: «➕ Sumar al orden de turnos» en el menú del token para el GM (en la cola).
> ✅ **(2) Aplicada (2026-11-24):** «➕ Sumar al orden de turnos» / «➖ Sacar del orden» en el «⋯» del token, para el GM (`vtt-hexgrid/js/136`). Dudas: P328.

Ahora hay una sola regla para saber si un token va al orden de turnos (`OrdenTurnos.ocupaLugar`, en `comun/orden-turnos.js`): el **tótem y el
estandarte no** (ni con «Traer tokens», ni con «🎲 Tirar iniciativa de los creeps», ni con Ordenar, ▶ Siguiente, ▶ Iniciar combate o ⏭ Pasar de
ronda); los **personajes, las invocaciones, los creeps y los tokens sueltos sí**. Quedaron elegidas estas cosas, todas cambiables:
1. **Los tokens sueltos siguen entrando** (un NPC puede jugar; un cofre no). Hasta que llegue el «Token suelto paso a paso» con su «¿Ocupa lugar en
   la iniciativa? Sí / No» (en cola), el GM saca a mano con ✕ el que no juega. Ojo: un token suelto del GM cuenta como creep, así que «🎲 Tirar
   iniciativa de los creeps» lo nombra en «Sin datos de: …» (no tiene nada que tirar) y el número se escribe a mano. ¿Preferís que mientras
   tanto no entren y se sumen a mano?
2. **Sumar a mano algo que la regla deja afuera**: hoy el orden de turnos no tiene un botón para agregar una fila suelta (las filas salen de «Traer
   tokens»). La regla ya mira un campo del token (`iniciativa: sí / no`) que es el que va a usar el token suelto paso a paso, pero nada lo escribe
   todavía. ¿Querés un «➕ Sumar al orden de turnos» en el menú del token (para el GM), por si alguna vez un tótem tiene que jugar?
3. **Un orden armado antes del arreglo** con el tótem o el estandarte adentro: siguen viéndose en la lista hasta que el GM toca Traer tokens u
   Ordenar (ahí salen); mientras tanto Tirar no les tira y ▶ Siguiente los saltea sin darles turno (ni inicio ni fin de turno). ¿Está bien?
4. **El Ojo de Kicillof** (la invocación que solo observa) sí entra: se mueve en su turno. ¿Lo dejamos adentro?

### P292 — 💀 Un creep que cae desde GM Tools: lo que quedó elegido (2026-11-23, Claude)

> ✅ **Respondida (dueño, 2026-11-23):** (1) «prácticamente irrelevante… los jugadores matan a los creeps»: queda como está; (2) «sí, corregilo para que la vida no baje de cero» en GM Tools (en la cola).

Desde hoy un creep que llega a 0 por cualquier camino de GM Tools pierde sus estados como en el mapa (P270), con la línea «💀 X cayó: se le fueron N
estados (…)». Quedaron elegidas estas cosas, todas cambiables:
1. **Quién ve la línea**: va a la Mesa solo si los jugadores conocen al creep (su token no está oculto, ya lo vieron y no estaba en Sigilo al caer); si
   no, el GM ve solo el aviso en su pantalla. Es el mismo criterio del mapa. ¿Está bien?
2. **La vida en negativo**: en GM Tools, «Daño» puede dejar la vida por debajo de 0 (un golpe de 999 a un creep con 5 de vida la dejó en −989), y el
   recuadro de HP también acepta un número negativo; en el mapa la vida nunca baja de 0. Para caer da lo mismo, pero se ve raro y «revivir» desde ahí
   cuenta desde el negativo. ¿Hacemos que en GM Tools tampoco baje de 0?

### P293 — 🎯 Las Apuntadas como el anillo: lo que quedó elegido (2026-11-23, Claude)

> ✅ **Respondida (dueño, 2026-11-23):** (1) está bien que el aviso salga igual («el juego no sabe con qué arma vas a atacar»; además la ballesta es de dos manos); (2) sin orden de turnos, bien; (3) el texto queda como está.

Desde hoy la Apuntada y la Apuntada firme de las ballestas tienen el cartel dorado y el aviso «si te movés, la perdés» del anillo, y ninguna vale en la
ronda 1 (P271). Quedaron elegidas estas cosas, todas cambiables:
1. **Con dos armas en la mano**: el cartel y el aviso salen si cualquiera de las armas en la mano tiene Apuntada, aunque después ataques con la otra
   (el bono sí se suma solo con la ballesta). ¿Está bien, o el aviso debería salir solo si la ballesta es el arma elegida?
2. **Sin orden de turnos** (narrativo o combate sin lista) la Apuntada sigue como antes: vale si no te moviste desde el último Mantenimiento, sin
   «ronda 1», sin cartel ni aviso (igual que el anillo, P258 g).
3. **La 🔍 y el cuadro del duelo** dicen el porqué en tercera persona («no suma: se movió en esta ronda», «es la ronda 1 del combate: vale recién desde
   la ronda 2»), para que sirva igual a quien lo ve desde otra pantalla. ¿Te gusta así o preferís «te moviste»?

### P294 — 🔥 La Varita del muro de fuego ahora también quema al CRUZARLO (2026-11-23, Claude)

> ✅ **Respondida (dueño, 2026-11-23):** «está bien, le pega a quien lo atraviesa».
Para que la varita haga lo mismo que el Muro de fuego (y diga «al entrar o cruzarlo»), su muro ahora pega también a quien lo atraviesa de paso
sin terminar adentro (antes, solo a quien terminaba el movimiento encima). Es lo mismo que hace la habilidad. ¿Está bien, o la varita (más barata,
1d4) solo al terminar adentro?

### P295 — 🔥 Otras zonas que pegan «en cada Mantenimiento» a quien sigue adentro: ¿también al empezar su turno? (2026-11-23, Claude)

> ✅ **Respondida (dueño, 2026-11-23):** «habría que verlas una por una… agruparlas de a dos; en una ronda vemos dos, en otra dos, y así». En la cola, de a dos.
Con orden de turnos, el Muro de fuego y la Varita del muro de fuego ya pegan al empezar el turno de quien está encima. Estas siguen pegando a todos a
la vez al pasar de ronda (no se tocaron):
1. **Con daño**: Varita de la fogata (fuego), Varita del chorro de lava (fuego), Varita de miasma (tóxico + Veneno), Pedos Tóxicos (un duelo por
   token), la Nube tóxica (clase y creep: con el Veneno puesto, +1 stack), la Mina napalm (el piso queda ardiendo: 1d6 de fuego), el 🔥 terreno
   incendiado viejo (ya no se crea) y las zonas que se arman a mano con el asistente de zonas.
2. **Solo un estado**: las nubes y pisos de trampas (Gas adormecedor, Gas somnífero, Nube de veneno, Aceite resbaladizo, Brea pegajosa, Cola de
   carpintero, Resina de árbol negro, Arena movediza, las trampas de arena de varita) y las varitas del aceite, del farol, de arena movediza (y la
   mayor) y de la luz flotante.
¿Pasamos alguna (o todas las de daño) a «al empezar su turno», o quedan así?

### P296 — 🔥 La Varita del muro de fuego: ¿la frena también la Defensa especial? (2026-11-23, Claude)

Probado con clics: el muro de la **habilidad** Muro de fuego es daño **directo** (no lo frena la Defensa especial; sí la resistencia al fuego), pero
el de la **Varita del muro de fuego** no está marcado como directo, así que hoy le resta **la Defensa especial y la resistencia al fuego** de quien lo
recibe (como cualquier daño de fuego de una habilidad). El texto de la varita no dice nada de eso. ¿Queda así (la varita, más barata, la frena también
la Defensa especial) o la paso a daño directo, como el Muro de la habilidad?

> ✅ **Respondida (dueño, 2026-11-23):** «probablemente sea un daño bajo (1d4) y debería ser daño directo». Hecho: la varita es daño directo (no la
> frenan la Defensa ni la Defensa especial; sí la resistencia al fuego y la Suela gruesa); las ya guardadas se ponen al día solas.

### P297 — 🔥 ¿Lo que frena el daño de una zona, con el número de quien la recibe? (2026-11-23, Claude)

El cartel de la zona y el renglón de «Empieza tu turno» ahora dicen qué frena el daño, y con un personaje muestran su número: «(lo frena su
resistencia al fuego 2)», «(es inmune al fuego: su resistencia al fuego es 99)», y la Suela gruesa si la tiene. De un **creep** el número solo lo ve
el GM (a un jugador no se le cuenta la resistencia de un rival); de una **invocación** no se muestra el número (se lee aparte y el cartel sale antes):
dice «lo frena su resistencia al fuego» a secas, y la cuenta del cuadro del duelo sí trae el número. ¿Está bien así, o preferís el texto sin números
para todos (el número, solo en la cuenta)?

> ✅ **Respondida (dueño, 2026-11-23):** «me gustaría que el equipo rival no vea el número, pero que sí diga resistente al fuego, resistente a lo
> tóxico, pero que no diga cuánto». Hecho: el número lo ve solo el bando de quien recibe el daño (el GM, el de los creeps; los jugadores, el de los
> personajes); el rival lee «es resistente» / «es inmune» / «es vulnerable» (de un creep, solo lo ya descubierto); en la cuenta del duelo, «−
> Resistencia al fuego» sin valor; en la Mesa y la Crónica (las ven todos), siempre sin el número. Lo que quedó elegido: P298.

### P298 — 🔥 La resistencia sin número para el rival: lo que quedó elegido (2026-11-23, Claude)

> ✅ **Respondida (dueño, 2026-11-23):** (1) «el GM está bien que lo vea» (el número de la resistencia de los jugadores); «el tema son los jugadores a los creeps» (en la cola). (2) bien, «si el jugador deduce la resistencia tampoco es tan grave». (3) Mesa sin números, bien. (4) la Suela gruesa: «no me acuerdo bien qué es», revisarla (en la cola).

1. **El GM ante un personaje**: como pediste («el equipo rival no vea el número»), el GM tampoco ve el número de la resistencia de un personaje en el
   cartel ni en la cuenta del duelo (es del bando de los creeps), aunque igual lo puede ver en la ficha. ¿Está bien, o el GM («ve todo») lo ve siempre?
2. **Se puede deducir restando**: la cuenta muestra la tirada (4) y lo que entra (2), así que el rival puede sacar la cuenta. Lo dejé así para que la
   cuenta se siga entendiendo. ¿Alcanza, o preferís esconder también el «pasa»?
3. **La Mesa, sin número para todos**: la línea del daño en la Mesa la ven los dos bandos, así que ahí la resistencia va siempre sin número (también
   para su propio bando, que lo ve en el cuadro). ¿Está bien?
4. **La Suela gruesa del rival**: en el cartel, al rival no se le nombra la Suela gruesa de quien lo recibe (es parte de lo que lo frena, con número).
   ¿Se nombra sin número, o queda así?

### ✅ P299 — 🐝 «Empieza tu turno» de una invocación no dice de quién es el turno (2026-11-23, Claude, cola de pruebas)

**Decidido (dueño, 2026-11-23): sí, que diga su nombre** («▶ Empieza el turno de Abeja de prueba»). **Aplicado (2026-11-23):** el título dice «▶ Empieza el turno de <invocación>», el primer renglón «🐝 Es el turno de <invocación>: empieza el turno de tu invocación, no el de <personaje>», «Sus estados» en vez de «Tus estados», el renglón de la zona «<invocación> está adentro al empezar su turno» y «⏱ YA NO ES SU TURNO» (vtt-hexgrid/js/16 `inicioDeInvocacion`, js/04).

Probando la Abeja de prueba (una invocación del Jugador 1 con turno propio en el orden) parada sobre el Muro de fuego: al empezar su turno, al Jugador 1
le sale la ventana de siempre, «▶ Empieza tu turno», con «Lo que pasa al empezar: nada que cambie» y el renglón del Muro («le entra 3d4 de daño de
fuego…»). En ningún lado dice que es el turno de **la abeja** y no el de su personaje (el título es el mismo; el renglón dice «le entra», sin nombre).
Con un personaje y una invocación en el orden, el jugador puede confundirse. ¿Le sumamos el nombre («▶ Empieza el turno de Abeja de prueba», o «Abeja de
prueba: le entra 3d4…»), o se deja así?

### ✅ P300 — 🔥 «Lo frena su resistencia al fuego» cuando la resistencia es 0 (2026-11-23, Claude, cola de pruebas)

**Decidido (dueño, 2026-11-23): opción (a)**: la frase sale solo cuando de verdad tiene algo de resistencia; con 0, no se nombra. **Aplicado (2026-11-23):** `ZonaDetalle.frenoCorto` (comun/zona-detalle.js) no nombra la resistencia cuando se sabe que es 0; sin el número (una invocación, o un creep que los jugadores no descubrieron) sigue como antes.

El cartel y el renglón de una zona de fuego dicen «No hay tirada para esquivarla: le entra 1d4 de daño de fuego (lo frena su resistencia al fuego)»
también cuando quien lo recibe tiene resistencia 0 (lo vi en la pantalla del GM con Blanco creep, resistencia al fuego 0: el GM ve el número de los
creeps, y ahí no hay nada que frene). Con un número se lee «(lo frena su resistencia al fuego 2)»; con 0 queda como si algo frenara. Opciones:
(a) con 0, no nombrar la resistencia («le entra 1d4 de daño de fuego»); (b) dejarla como recordatorio de que existe; (c) «(sin resistencia al fuego)».
En una invocación (que no tiene el número a mano) se seguiría diciendo como hoy.

### ✅ P301 — 🐝 Una invocación que entra al orden en un lugar que ya pasó en esta ronda: ¿juega recién en la próxima? (2026-11-23, Claude, cola de programación)

**Decidido (dueño, 2026-11-23): (b)** — si su lugar ya pasó, en esta ronda juega igual al final, y desde la próxima en su lugar. En la cola de programación.

Desde hoy, al invocar con el orden de turnos armado, la invocación tira su iniciativa y entra en su lugar según la tirada (P275). Si ese lugar queda
**antes** de quien tiene el turno (por ejemplo, el Jugador 1 tiene 0, invoca en su turno y la abeja saca 3), su lugar ya pasó en esta ronda.
**Elegí lo más conservador: en esta ronda no juega y juega desde la próxima** (nadie juega fuera de su lugar). La Crónica lo dice: «Su lugar ya pasó
en esta ronda: juega desde la próxima». Ojo con el Mareo de invocación: su primer turno (el mareado) es el de la próxima ronda, así que recién actúa
de verdad en la siguiente. Antes entraba siempre al final, jugaba mareada en esta misma ronda y actuaba en la próxima. Opciones:
(a) como quedó: juega desde la próxima ronda;
(b) en esta ronda juega igual, al final (o justo después de quien tiene el turno), y desde la próxima en su lugar;
(c) como (a), pero si su lugar ya pasó, entra sin Mareo (para que no pierda una ronda más que antes).
Salida a mano: el GM la mueve con ▲▼ o le da el turno con clic derecho en su nombre.

### ✅ P302 — 🐝 ¿Quién tira la iniciativa de la invocación? (2026-11-23, Claude, cola de programación)

**Decidido (dueño, 2026-11-23): (a)** — la tira sola la pantalla del GM, como quedó.

Pediste que la invocación «venga acompañada de una tirada de iniciativa» y que se ubique sola. **Quedó automática: la tira la pantalla del GM** al ver
aparecer el token (como hasta ahora la metía al final del orden), con la Iniciativa de la invocación (la de sus datos: Agilidad y lo que la suba, más
lo fijo como la Prisa). La tirada va a la Mesa como cualquier tirada de iniciativa («Iniciativa · Abeja de prueba», con los dados 3D), firmada por el GM.
Choca un poco con la regla «las tiradas las hace el involucrado»: si preferís, al invocar le puede salir al jugador un botón «🎲 Tirar la iniciativa de
<invocación>» y recién al tocarlo entra al orden. Opciones: (a) automática, como quedó; (b) la tira el jugador con su botón (si no la tira en un rato,
el GM puede tirarla por él). Además: si el GM no tiene el mapa abierto, la invocación no entra al orden (igual que antes); si no se pueden leer sus datos,
entra al final con 0 y se le avisa al GM para que escriba el número.

### ✅ P303 — 🐝 Empate de iniciativa entre la invocación y alguien que ya estaba (2026-11-23, Claude, cola de programación)

**Decidido (dueño, 2026-11-23): (a)** — en un empate queda después de los que ya estaban, su invocador incluido, como quedó.

Si la invocación saca lo mismo que alguien del orden (por ejemplo, su invocador), **queda después de los que ya estaban** (como Ordenar, que deja los
empates en el orden previo). Opciones: (a) como quedó, después; (b) antes; (c) siempre justo después de su invocador, saque lo que saque si empata con él;
(d) desempate al azar o por Agilidad.

### P304 — 🐝 Las invocaciones que ya estaban en el mapa: ¿también tiran iniciativa? (2026-11-23, Claude, cola de programación)

Lo nuevo vale para la invocación que **aparece** en el mapa con el orden ya armado. Quedan afuera, sin cambios:
1. Las que ya están en el mapa cuando el GM arma el orden con «Traer tokens»: entran con 0 y ni «🎲 Tirar iniciativa» del jugador ni la del GM («de los
   creeps») les tira, así que con Ordenar quedan últimas. ¿Querés que el «🎲 Tirar iniciativa» del jugador tire también la de sus invocaciones del orden?
2. Las que quedaron **fuera** del orden (como la Abeja de prueba hasta hoy: el GM la sacó con ✕, o estaba antes de armar el orden): siguen fuera, sin
   turno propio (les toca con su dueño o al pasar de ronda). ¿Pasan todas a tener turno, o se deja como decisión del GM?
3. Una invocación con el token puesto de antemano (sin invocar) que después se invoca: el token no aparece de nuevo (ya estaba), así que no tira.

### ✅ P305 — 📦 El token suelto paso a paso: ¿con qué respuesta arranca cada pregunta? (2026-11-23, Claude, cola de programación)

**Decidido (dueño, 2026-11-23): (a)** — arranca en «No» para la iniciativa y «No» para la vida, como quedó.

Crear un token suelto ahora son tres pasos: «Cómo es» (nombre, descripción, imagen, color), «¿Ocupa lugar en la iniciativa? Sí / No» y «¿El token tiene
vida? Sí / No» (con cuánta). Como dijiste «esto es para objetos inanimados», **uno nuevo arranca con las dos en «No»** (queda afuera del orden de turnos
y sin vida); se cambia con un clic. Los que ya estaban puestos antes (sin la respuesta guardada) siguen como hasta ahora: ocupan lugar. Opciones:
(a) como quedó: «No» y «No»; (b) la iniciativa en «Sí» (un NPC que actúa) y la vida en «No»; (c) sin nada marcado: hay que elegir las dos para poder
ponerlo. Esto resuelve la primera parte de P277 (el token suelto de un jugador fuera del orden: lo decide quien lo crea).

### ✅ P306 — 📦 Atacar a un objeto: ¿Evasión 1 y crítico como siempre? (2026-11-23, Claude, cola de programación)

**Decidido (dueño, 2026-11-23): (b)** — sin crítico contra objetos. En la cola de programación.

Pediste que al token suelto con vida «se lo pueda elegir como objetivo de ataques… y hasta ahí nomás». Quedó así: **se defiende solo con «🪨 Evasión 1
(es un objeto)»** (la Evasión nunca baja de 1, como con el Stun), sin tirar; **no tiene Defensa, escudos, resistencias ni estados**, así que el golpe
entra entero a su vida. Contesta la defensa la pantalla de quien lo puso (si no está, el GM lo escribe a mano en el cuadro). Como la Evasión es 1,
**casi siempre sale crítico** y el daño se multiplica (las reglas de siempre). Opciones: (a) como quedó; (b) a un objeto no se le hace crítico (el
golpe entra con su daño normal); (c) que quien lo crea le ponga una Defensa (un número que se resta, como la armadura). Con una habilidad dirigida pasa
lo mismo: su resistencia vale 1 (la Evasión) o 0 (las demás).

### ✅ P307 — 📦 Un objeto que llega a 0 de vida: ¿qué pasa? (2026-11-23, Claude, cola de programación)

**Decidido (dueño, 2026-11-23): (d)** — al llegar a 0, le llega un aviso a quien lo puso para que lo saque. En la cola de programación.

**Elegí lo más conservador: queda en el mapa, «💥 Roto»** (lo dicen su tarjeta 🪪 y el globo al pasar el mouse), y lo saca quien lo puso o el GM. No
cuenta como caído (no tiene ✚ Revivir ni turnos de muerte) y se lo puede seguir atacando (no le baja de 0). Opciones: (a) como quedó; (b) que se borre
solo del mapa al llegar a 0; (c) que quede roto y ya no se lo pueda elegir como objetivo (como un caído); (d) un aviso al que lo puso: «X se rompió:
¿lo sacás del mapa?».

### ✅ P308 — 📦 La vida de un objeto del GM, ¿la ven los jugadores? (2026-11-23, Claude, cola de programación)

**Decidido (dueño, 2026-11-23): (a)** — los jugadores no ven los números de la vida de un objeto del GM, como con los creeps.

La vida del token suelto **de un jugador** la ve todo el mundo (en el círculo rojo del token y en su tarjeta). La de uno **del GM** se maneja como la de
un creep: los jugadores no ven los números, solo «❤ Tiene vida · se lo puede atacar» y, al llegar a 0, «💥 Roto». Opciones: (a) como quedó; (b) que la
de todos los objetos se vea (una puerta no tiene secretos); (c) que lo elija el GM al crearlo.

### P309 — 🎁 Dos 🎁 que no son ni «dar» ni botín: ¿se quedan? (2026-11-23, Claude, cola de programación, de P278)

**Dueño (2026-11-23): «ponelo al final de la cola para ver en detalle».** En la cola de programación.

Al pasar el «dar» a 🤝 (P278: «que el regalo quede solo para el botín»), quedaron dos 🎁 que no son del botín ni sirven para dar algo, y no los toqué:
(a) en el **Generador de tiendas**, la casilla «🎁 Permitir agregar gratis» (deja que los jugadores sumen ítems de la tienda sin pagar);
(b) en la **📐 Guía de diseño**, la tarjeta «Ver todos los efectos» y el título «🎁 Efectos para un arma» (la lista de efectos al golpear).
Opciones: (1) dejarlos así; (2) cambiarles el ícono para que el 🎁 sea de verdad solo el botín (por ejemplo, (a) 🆓 o 💸 y (b) 💥 o 🗡).

### P310 — 🤝 Dos 🤝 en el menú de un token, con funciones distintas (2026-11-23, Claude, cola de programación, de P278)

Con el cambio de P278, en el menú de un token de personaje hay dos 🤝, en anillos distintos (nunca los dos a la vista a la vez):
(1) en el **primer anillo**, el de **mano a mano** (ya estaba): sale cuando el token está pegado al tuyo; abre «Con X: 🤝 Darle un ítem / 🙋 Pedirle un
ítem» (el otro acepta o rechaza; en combate cuesta No2). Lo ve un jugador, y también el GM cuando tiene 🎮 el control de un personaje pegado;
(2) en el **«⋯»**, solo para el GM: «Dar un ítem (o DDE, o despojos)», que entra **directo**, con su cartel, sin costo.
Hacen cosas parecidas pero con reglas distintas. Opciones: (a) dejarlo así (los dos son «pasar cosas», que es lo que pidió el dueño); (b) diferenciar
uno (por ejemplo, el del GM con 🤝 y el de mano a mano con 🫴, o al revés). Mientras, quedó (a).

### ✅ P311 — 📣 El aviso de la Mesa al clavar un tótem o un estandarte nombra al creep aunque esté escondido (2026-11-23, Claude, de P281)

**Decidido (dueño, 2026-11-23): (b)** — si el creep está escondido, la Mesa y la Crónica dicen «Alguien clava…». En la cola de programación.

Con P281 el token ya no nombra al creep, y «Ver detalle» dice «Alguien» si quien lo clavó no está a la vista. Pero al clavarlo, la Mesa y la Crónica
siempre dicen «Blanco creep clava un tótem de silencio…» (y el ⚡ con el nombre de la habilidad), aunque el creep esté oculto o en sigilo. ¿Se hace como
con otras acciones de un creep escondido (una frase incierta, «Alguien clava un tótem…», o solo para el GM), o queda así? Mientras, quedó como estaba.

### ✅ P312 — 🎒 La mochila pasada de ranuras, ¿suma al sobrepeso? (2026-11-23, Claude, cola de programación)

**Decidido (dueño, 2026-11-23): (a)** — cada ranura de más de la mochila pesa 1 y se suma al peso del equipo contra la Carga máxima. Además:
- **Emparejar los avisos**: el baúl y lo que te pasa otro jugador avisan y dejan seguir (como el 🤝 Dar); el cartel muestra la cuenta.
- **Cartel «⚖ Tenés sobrepeso»** con todo el detalle de lo que implica y «Aceptar», donde sea que pase (ficha, mapa…): al equiparse algo, y también
  al recibir cosas en la mochila (GM, botín, otro jugador, baúl, tienda) que lo hagan pasar a tener sobrepeso o se lo suban.
- **Regla nueva: cada punto de sobrepeso resta 1 a la iniciativa.** Al iniciar el combate: tirada − sobrepeso es el número de la tabla. Si en medio
  del combate cambia el sobrepeso (sube o baja), sale el cartel, se ajusta el número y se reordena la tabla; si le corresponde otro lugar se lo
  mueve, pero **nadie repite ni pierde turno**: si ya jugó esta ronda no vuelve a jugar; si no jugó, juega igual esta ronda; desde la próxima, en su
  lugar nuevo. Si baja o se va el sobrepeso, **recupera** (siempre es tirada − sobrepeso de ese momento).
- Creeps e invocaciones siguen sin sobrepeso.

> ✅ **Hecho (2026-11-23):** la cuenta en `FichaCalculo.calcular` (`ranurasDeMas`, `pesoTotal`); el cartel «⚖ Tenés sobrepeso» en la ficha suelta
> (`sobrepesoVigilar`, ficha js/02) y en el mapa (js/132, también para lo que cambia la ficha lite o la Botonera); la Iniciativa −sobrepeso (la
> tirada, la fila del orden recuerda `sobre`, y el GM la acomoda en combate con `OrdenTurnos.reubicarPorValor`); los avisos de aceptar de otro jugador
> y del baúl, que preguntan y dejan seguir. Dudas que salieron: P313.

Pedido del dueño (2026-11-22): «revisar el sobrepeso y evaluar que la mochila sobrecargada también se sume al de sobrepeso». Viene de P262 (5).

**Cómo funciona hoy (diagnóstico):**
- **El sobrepeso** sale de sumar el peso de **lo equipado** (armas incluidas) contra la **Carga máxima**, que por defecto es igual a la
  **Fuerza** (fórmula `crgmax: 'fue'`, `comun/ficha-guardado.js`; se puede cambiar en la ficha y sumar bonos, ej. la pasiva «+1 Crg.Max»). La
  cuenta es `FichaCalculo.calcular` (`comun/ficha-calculo.js`: `pesoEquipado`, `sobrecarga = peso equipado − Carga máxima`). Lo de la mochila
  y el cinturón no pesa nada.
- **Qué hace** (P108, recargos del 2026-11-11): aparece el estado derivado **⚖ Sobrepeso** (`FichaResumen.estadoSobrepeso`, no se guarda; el
  mapa lo lee del resumen con `sobrepesoDeToken`, `vtt-hexgrid/js/04`). (1) **Evasión con −1 por cada punto de más**, o pagar **1 No2** para tirar
  sin penalidad (se elige en el cuadro del duelo, `comun/ficha-duelo.js`, o en el cartel «Tenés sobrepeso» de la ficha y la Botonera). (2) **+1 No2
  fijo** al Parry y «Poner escudo» (2 No2; con Parada fácil, 1) y al dodge roll (`Combatiente.recargoSobrepeso` / `costoParrySobrepeso`,
  `comun/combatiente.js`; dodge en `vtt-hexgrid/js/06-mouse.js`). Solo personajes: ni creeps ni invocaciones.
- **Dónde se ve:** la barra «Peso equipado N / Crg.Max» y el renglón rojo «Te pasás por N…» de la ficha; el panel 🛡 Equipo (`comun/ficha-equipo.js`);
  el estado entre los estados alterados; la cuenta en cada botón de defensa del duelo.
- **Las ranuras de la mochila:** cada ítem no equipado ocupa al menos 1 (una pila de apilables, 1; con Morral de cazador los trofeos no ocupan).
  Capacidad = **20** por defecto (número editable en la ficha) + lo que dé la mochila equipada (`FichaEquipo.mochilaUsada` / `capMochila`). Pasarse
  **no tiene ningún efecto de juego**; solo avisos, y no parejos entre caminos: «🎁 Dar a un jugador» avisa al GM y da igual, y al que recibe le sale
  «Tu mochila quedó pasada: 32 de 20 ranuras…» y una línea en la Mesa (`comun/dar-jugador.js`); el botín avisa «ojo: tu mochila no da» y llega igual
  (`comun/ficha-botin.js`); la tienda no mira; en cambio **aceptar lo que te pasa otro jugador y sacar del baúl sí se frenan** («Mochila llena: no
  entra», `comun/intercambio.js`).
- **El cinturón:** 5 ranuras (1 por unidad) + lo que dé el cinturón equipado. Ese sí es un tope: lo que no entra queda en la mochila.

**Opciones** (ejemplo: Fuerza 8 → Carga máxima 8; equipo que pesa 7; mochila con 24 de 20 ranuras = 4 de más):
- **(a) Cada ranura de más pesa 1** y se suma al peso del equipo. 7 + 4 = 11 contra 8 → sobrepeso 3: Evasión −3 (o 1 No2), Parry 2 No2. Con 32/20
  serían 12 de más → sobrepeso 11. Simple, una sola cuenta; el que tiene Fuerza de sobra «carga» la mochila pasada sin castigo. Contra: se dispara
  rápido si la mochila está muy pasada (aunque pagando 1 No2 la Evasión sale sin penalidad igual).
- **(b) Un punto de sobrepeso cada 5 ranuras de más** (o fracción), aparte del peso del equipo. 24/20 → +1; 32/20 → +3. Con el equipo de 7 (sin
  sobrepeso propio) queda sobrepeso 1. Más suave y no depende de la Fuerza. Contra: dos cuentas para explicar.
- **(c) Pasarse de ranuras da Sobrepeso directo, fijo**: 21/20 o 32/20, igual: el +1 No2 a Parry/dodge y Evasión −1 (o pagar). Clarísimo, pero da lo
  mismo una ranura que doce.
- **(d) Solo avisar**: un estado recordatorio «🎒 Mochila pasada», sin penalidad (lo de hoy, más visible).

En todas: el cinturón no cambia, los creeps e invocaciones siguen sin sobrepeso, y la salida a mano es la de siempre (la capacidad de la mochila
y la fórmula de la Carga máxima se editan en la ficha). Aprovechando el cambio, se pueden emparejar los avisos (que aceptar de otro jugador y el
baúl avisen y dejen seguir, como el 🎁 Dar) y poner la cuenta en el cartel: «tu equipo pesa 7 + 4 ranuras de más en la mochila = 11; tu Carga
máxima es 8».
**Recomendación de Claude: (a)**, por simple y porque usa la Fuerza («lo que no entra lo llevás colgado»). Mientras, queda como está.

### ✅ P313 — ⚖ Lo que quedó elegido «mientras tanto» al programar el sobrepeso con la mochila (2026-11-23, Claude, cola de programación, de P312)

**Decidido (dueño, 2026-11-23)** — **cambio de opinión sobre P312**: si en medio del combate cambia el número de iniciativa (por el sobrepeso) y eso
moviera a alguien en la tabla, **el reacomodo se hace al pasar de ronda, no en el momento** (el número se ajusta en el momento; el orden, en la
ronda siguiente). Con eso el punto 1 ya no hace falta. **2:** el cartel sale solo en la pantalla donde se hizo el cambio. **3:** sí, cartel
«ya no tenés sobrepeso» cuando se va. **4:** bien como quedó (el número escrito a mano ya viene con el sobrepeso restado).
> ✅ **Hecho (2026-11-23):** el GM cambia solo el número (`OrdenTurnos.cambiarValor`) y anota en `iniciativa.reubicar` a quien le tocaría otro lugar;
> `iniciativaSiguiente` lo acomoda al empezar la ronda (`reubicarAlEmpezar`); ya no sale «🔁 Le vuelve a tocar» por esto. El resumen dice qué pantalla
> guardó el cambio (`pantalla`) y el cartel sale solo ahí (`Combatiente.sobrepesoAviso`); lo que guarda otra persona (el GM directo) lo muestra el mapa
> del dueño. Carteles «tu sobrepeso bajó» (corto, como el de «subió») y «Ya no tenés sobrepeso» (qué tenía antes y qué recupera).

1. **«Ya jugó: no vuelve a jugar»**: cuando el sobrepeso le baja el número a alguien que ya jugó y queda después de quien tiene el turno, se lo anota
   como que ya jugó (como un ▼ del GM). Al llegarle de nuevo en la ronda, el mapa le pregunta al GM lo de siempre, «🔁 Le vuelve a tocar: ¿vuelve a
   actuar? Sí / No, se saltea» (la regla del 2026-10-29 para cualquiera que bajaron después de jugar). ¿Lo salteamos sin preguntar en este caso?
   Mientras, queda la pregunta (es la salida a mano: el GM contesta «No»).
2. **El cartel sale en cada pantalla abierta del dueño**: si el jugador tiene el mapa y la ficha suelta abiertos a la vez, le sale en las dos (en el
   mapa, con la Botonera o la ficha lite, una sola vez). ¿Está bien, o solo en la pantalla donde hizo el cambio?
3. **Bajar el sobrepeso no tiene cartel** (solo la línea de la Mesa si está en el orden de turnos y el ⚖ desaparece de la ficha). ¿Querés un aviso
   «ya no tenés sobrepeso»?
4. **Un número de iniciativa escrito a mano**: si el GM (o el jugador) escribe el número de una fila que ya tenía el sobrepeso restado, se toma como
   que el número nuevo ya lo tiene restado (si después el sobrepeso cambia, se ajusta desde ahí). Una fila sin tirar no se toca hasta que se tira.


### ✅ P314 — 🔘 Guardar quién puso cada estado y con qué (2026-11-23, Claude, cola de programación: el globo de los iconitos y el detalle en ◎)

**Decidido (dueño, 2026-11-23): «en principio no hace falta».** Los estados no guardan quién los puso; queda como está.

**Contexto.** El dueño pidió (2026-11-23) que el globo de los iconitos de alrededor del token diga solo el efecto y que el detalle —«cuál es el
origen, por qué, quién es el caster»— vaya en la ventana ◎ Estados alterados del token. Hecho con lo que hoy se guarda: la cuenta del sobrepeso, de
qué pasiva o pieza viene un estado derivado, a quién protege, a quién marcó, de quién tiene miedo, quién lo provocó, quién le pegó la Sanguijuela,
quién le puso un Escudo elemental y en qué arma va un Arma elemental. **Lo que hoy NO se guarda en el estado**: quién se lo puso y con qué (un
Veneno, una Quemadura, un Stun de un creep o de un jugador). El aviso que le llega al personaje sí trae ese texto (`origen`, p. ej. «Arcano 3:
Lengua de fuego»), pero al aplicarlo se pierde; en un creep, no se anota nada.

**Propuesta.** Que todo estado que se pone sobre otro guarde `puestoPor` ({nombre, id del token}) y `con` (el nombre de la habilidad, el arma o la
zona), lo publique el resumen y la ventana ◎ lo muestre («Lo puso Arcano 3 · con Lengua de fuego»), respetando lo oculto: un creep escondido o en
sigilo sale como «alguien que no se ve» para los jugadores (ya lo hace así con el Miedo y los demás nombres). Toca varios caminos (el duelo, las
zonas, las trampas, las habilidades sobre sí, GM Tools, los avisos a la ficha), por eso no se hizo de una.

**Mientras tanto (lo conservador):** la ventana ◎ muestra solo lo que ya existe; no se inventa el origen de los que no lo traen.

### P315 — 🏷 ¿El asistente de personaje nuevo marca el rol de la clase que se eligió? (2026-11-24, Claude, al programar las etiquetas de las pasivas)

En el asistente de personaje nuevo, la clase se elige en el primer paso (Warrior, Tanque, Asalto…), así que ahí sí se sabe el rol cuando se llega a
«Pasivas». El pedido decía que en los personajes de los jugadores no se marque ningún rol (todavía no dicen su clase en la ficha), así que no se marca.

**Recomendación:** marcarlo en el asistente (es justo el momento en que el jugador eligió la clase; se saca con un clic y el «Mostrando N de 47» dice
cuántas quedan afuera).

**Mientras tanto (lo conservador):** el asistente abre las pasivas sin ningún rol marcado, como «+ Pasiva» en la ficha.

### P316 — 🏷 Las pasivas subidas antes de las etiquetas nuevas, y el «✎ Etiquetas» del dueño (2026-11-24, Claude)

Hoy hay una sola pasiva subida a la Biblioteca: la **corrección de Regeneración** (auditada), sin etiquetas. Como reemplaza a la de fábrica, en
«+ Pasiva» se ve como «🏷 sin etiquetar» y aparece con cualquier filtro (nunca se esconde). Para que se filtre como las demás, hay que ponerle
etiquetas: el dueño puede hacerlo con «✎ Etiquetas» en la Biblioteca (hoy es un campo de texto: escribir `cualquiera, tanque, warrior, aguante`).

**Pregunta:** ¿que «✎ Etiquetas» del dueño use también los botoncitos por familia (como «Subir a la biblioteca»)? **Recomendación:** sí, para no tener
que escribir las palabras a mano.

**Mientras tanto (lo conservador):** las que no tienen ninguna etiqueta nueva se muestran siempre, marcadas «🏷 sin etiquetar»; una pasiva con
etiquetas nuevas en una familia y ninguna en otra cuenta como «cualquiera» en la que le falta.

### ✅ P317 — 🧪 Los consumibles que sube el grupo no se ven en el catálogo abierto (2026-11-24, Claude)

**Dueño (2026-11-24):** pasa a la lista de diseño («no sé bien si quiero que cualquiera pueda subir consumibles»). Y **decidido**: los
consumibles propios «a mano» **no van al catálogo**: «es para uso específico, narrativo de la partida. No quiero que nada de eso vaya al
catálogo». O sea: un consumible a mano no se puede subir al catálogo (sin «⬆ Subir al catálogo»), y el editor del catálogo de fábrica no los ofrece.

En el «Catálogo del fabricante» de la ficha (sin tienda) los consumibles se esconden salvo los esenciales; para ver uno subido por el grupo (por ejemplo un
consumible propio «✋ a mano») hay que tocar el 👁 (ver el catálogo completo). En una tienda se ve solo si el GM lo pone.

**Pregunta:** ¿un consumible subido por el grupo debería verse en el catálogo abierto sin el 👁? **Recomendación:** sí, los subidos por el grupo (son pocos
y alguien los subió para usarlos).

**Mientras tanto (lo conservador):** queda como está: se ven con el 👁.

### P318 — 🕊️ Ajustes de los mensajes (P285): lo que quedó elegido «mientras tanto» (2026-11-24, Claude)

**Respuestas del dueño (2026-11-24):** (2) «en la crónica se debería poder leer el mensaje directamente» (la tarjeta de la Crónica muestra el
texto del mensaje; el aviso nuevo también queda). (4) «habría que corregirlo»: `/r Nombre hola` no tiene que mandar el nombre como texto. El
resto (1, 3, 5, 6) sin objeciones: queda como está. Varias conversaciones: la propuesta (a)(b)(c) le gusta; (d) cambia: **un jugador sí
puede borrar lo suyo**; chat grupal con nombre opcional, archivar en vez de cerrar, sin salirse de un chat grupal por ahora.

> ✅ **Aplicado (2026-11-24):** (2) la tarjeta de la Crónica muestra el mensaje entero (antes se cortaba a 220 letras; si es muy largo, se
> desplaza adentro de la tarjeta). (4) `/r Nombre hola`: si lo que sigue a `/r` empieza con el nombre de alguien de la partida (persona o
> personaje, como lo reconoce `/m`), el nombre sale del texto y se le responde **a esa persona**; si no calza ningún nombre, va todo como texto
> al último que te escribió.

Pedido del dueño (P285 y sus directrices del 2026-11-24). Está hecho (`comun/mensajes.js`); quedan cosas chicas para decidir:
1. **El 📣 mensaje a todo el grupo vive en la Mesa** (es una línea de la Mesa, como una tirada, sin reglas nuevas de Firebase). Por eso se borra
   igual que las tiradas: con el 🗑, con «Registro nuevo» **y con la limpieza automática de lo viejo** (los secretos no se borran solos). Lo ve
   también quien entra después a la partida. ¿Está bien? **Recomendación:** sí; si se quiere que duren como los secretos, hace falta una
   colección propia y reglas nuevas.
2. **En el mapa, al llegar un secreto salen dos cosas**: la tarjeta de la Crónica (la de antes, con brillo) y el aviso flotante nuevo junto a la
   paloma. ¿Las dos o solo el aviso? **Recomendación:** dejar las dos un par de sesiones y ver si molesta. **Mientras tanto:** las dos (un
   📣 público solo da el aviso, no la tarjeta).
3. **«Leído» de lo público es por navegador**: si el mismo jugador lo leyó en otra compu, ahí le sigue apareciendo sin leer. Lo público que ya
   estaba antes de abrir por primera vez no cuenta como sin leer. ¿Alcanza? **Recomendación:** sí.
4. **`/r` responde al último que te mandó un secreto** (no a un 📣 público). `/r` sin texto abre esa conversación. Si alguien escribe por
   costumbre `/r Nombre hola`, el nombre va como parte del texto, al último que le escribió. ¿Bien? **Recomendación:** sí.
5. **Lo que mandé, en mi Mesa con otro tono** (sin brillo, borde punteado: «🕊️ Tu mensaje secreto para X»), para que no se confunda con lo que
   me llega. ¿Bien?
6. **El aviso flotante** dura 7 segundos, muestra el principio del texto y se apilan hasta 3. Con «reducir movimiento» del sistema, la paloma no
   vibra: se le marca un contorno. ¿Bien?

### ✅ P319 — 🤐 El Silencio del Tótem: cuando ya estaba silenciado por otra cosa (2026-11-24, Claude)

**Decidido (dueño, 2026-11-24): como lo recomendado** — queda así (el tótem nunca saca un Silencio que no puso él; si se lo sacan estando adentro, le vuelve a entrar).
Desde el 2026-11-24 el aura del Tótem de silencio le pone el estado Silencio de verdad a los rivales que están adentro y se lo saca al salir
(`vtt-hexgrid/js/134-totem-silencio.js`). Un mismo personaje no puede tener dos «Silencio» a la vez (el nuevo renueva al que hay). Quedó así,
mientras tanto (lo conservador: nunca le saca un Silencio que no puso el tótem):
1. **Entra al aura con un Silencio que ya tenía** (una Runa, un golpe): no se le pone el del tótem; queda el suyo, con sus turnos. Si ese se le
   vence estando adentro, ahí entra el del tótem. Al salir, el suyo no se toca.
2. **Le cae otro Silencio estando adentro** (con turnos): reemplaza al del tótem (el nuevo renueva al viejo); al salir del aura no se le saca.
   Cuando se le vence, si sigue adentro, vuelve el del tótem.
3. **Le sacan el Silencio del tótem estando adentro** (Purificar, «Limpiar», a mano): vuelve a entrarle al segundo, mientras siga adentro.
¿Está bien así? **Recomendación de Claude:** sí; lo único discutible es el 3 (si una limpieza debería protegerlo un rato del aura).

### ✅ P320 — 🙈 Un área le pega a alguien escondido: ¿los talismanes de quien la lanzó le avisan? (2026-11-24, Claude)

**Decidido (dueño, 2026-11-24): como lo propuesto.** (1) Lo que le pasa a quien lanzó el área por sus talismanes (la quemadura del diablito,
curarse, el Orbe salvaje…) pasa igual, pero sin que el aviso deje en evidencia que le pegó a alguien escondido (p. ej. que le aparezca al GM
recién al terminar el turno, o sin decir por qué). (2) Lo que le cae al escondido por esos talismanes (el Maldito de la Cabeza reducida, el +2 de
la Botella…) lo ve solo su bando, como el resto de su duelo secreto. **Aplicado (2026-11-24)**: se eligió «sin decir por qué» (le llega en el
momento, con un texto que no nombra al escondido ni dice que fue por el golpe); ver la cola y `vtt-hexgrid/js/130`.
Probado con clics en «Claude · pruebas 2»: el Grito espeluznante de un creep le pegó 1 de daño a Blanco J1 escondido (no alcanzó para delatarlo,
bien) y el GM no vio el duelo. Pero el creep lleva la **Botella con un diablito**: al aplicar el daño sumó +2 y, como en los dados salió un 1, a la
pantalla del GM le llegó el cartel «😈 El diablito se ríe: 2 de fuego para Control mental 4» y la línea en la Mesa. O sea: el GM se enteró de que el
grito le pegó a alguien. Con la Nova arcana de otro creep que lleva la **Cabeza reducida**, la Mesa de todos dijo «Blanco J1 queda Maldito», con el
nombre, antes de que se delatara. Lo mismo pasaría con otros talismanes y anillos que actúan al pegar.
1. **Los efectos sobre quien lanzó el área** (la quemadura del diablito, el Orbe salvaje que le devuelve el daño, curarse con Luz sanadora o al drenar):
   ¿pasan igual, aunque eso le avise que le pegó a algo? ¿O se guardan sin anunciar, y el diablito le quema sin decir por qué?
   **Recomendación:** que pasen (es su equipo y lo siente), pero sin nombrar a nadie: «el diablito se ríe» sin decir a quién le pegó.
2. **Lo que le pasa al escondido por esos talismanes** (Maldito de la Cabeza reducida, el +2 de la Botella): que vaya marcado como el resto del duelo
   oculto (lo ve solo su bando, o quien lo vea). **Recomendación:** sí.

### P321 — 🙈 El escondido con dos duelos a la vez: ¿cuentan los 40 segundos? (2026-11-24, Claude)
Probado con clics: la Lanza arcana de un creep le pegó en la misma línea a la Abeja de Blanco J1 (a la vista) y a Blanco J1 (escondido). Al
Jugador 1 se le abrió primero el duelo de la Abeja; el de Blanco J1 quedó como botón abajo («Ver ejecución…»). Mientras resolvía el de la Abeja
(tirar la Evasión, el dodge roll), pasaron los 40 segundos y la pantalla del GM tiró sola la Evasión de Blanco J1 («solo: no contestó»). Esta vez
salió bien (empató y ganó), pero el jugador no eligió su tirada.
1. ¿Los 40 s tendrían que esperar mientras el jugador está resolviendo otro duelo (empezar a contar recién cuando se le abre el del escondido)?
   **Recomendación:** sí; y si pasa mucho más (2–3 minutos), que lo resuelva solo igual.
2. ¿O alcanza con un aviso en su pantalla antes de que se cumplan (P287, punto 4, ya lo preguntaba)?

### ✅ P322 — 👁 Con «Revelar lo oculto» prendido, ¿los creeps «ven» al escondido? (2026-11-24, Claude)

**Decidido (dueño, 2026-11-24): «tenés razón»** — el ojo es solo para mirar (como con las trampas). En la cola de programación.
Revisando qué hace «👁 Revelar lo oculto» (cola de pruebas, 2026-11-24): es la **visión del GM**, pero el mapa del GM usa esa misma visión para
algunas cosas del juego. Por código (no probado con clics): con el ojo prendido, (a) un área que tira un creep alcanza al escondido como un **duelo
normal** y no como el duelo aparte de P263 (lo de «No hay nadie adentro del área» y que lo resuelva quien lo maneja); (b) el GM puede **elegir de
objetivo** a un personaje en sigilo o adentro de una nube, y la línea de tiro no lo descarta. Con el ojo apagado, todo como siempre.
1. ¿El ojo tendría que ser **solo para mirar** (el creep sigue sin ver al escondido: el área va aparte y no se lo elige de objetivo; si el GM
   quiere, lo hace a mano)? **Recomendación:** sí, solo para mirar, como ya se decidió con las trampas de los jugadores («es su visión, no las
   revela a nadie»).
2. Lo de la Mesa se decide una vez, al llegar: lo que llegó con el ojo apagado no aparece al prenderlo (y lo que vio con el ojo prendido no se
   borra al apagarlo). **Recomendación:** dejarlo así (el cuadro del duelo, el mapa y el orden de turnos sí cambian al toque).

### ✅ P323 — 🌀 Los pulsos del portal, ¿también para quien no ve al que lo usa? (2026-11-24, Claude)

**Decidido (dueño, 2026-11-24): como lo recomendado** («esto está bien», «lo mismo»): (1) los pulsos del portal se ven solo en las pantallas que ven al token (el portal en sí se sigue viendo); (2) con «reducir movimiento», un destello corto sin ondas. En la cola de programación.
Probado con clics (la tele con un token oculto): el Jugador 1, en Sigilo, pasó por un portal de Invocar portal. El GM no vio la tele ni el token
(bien), pero sí vio los **pulsos violeta/azul con el hilo punteado** entre los dos portales: se entera de que alguien de los jugadores usó el portal
y hacia dónde (no quién). Con la Trampa de teleport pasa algo parecido: la Mesa dice «Alguien fue teletransportado…». Además, esos pulsos se
siguen animando con «reducir movimiento» (la tele no).
1. ¿Los pulsos del portal tendrían que verse solo en las pantallas que ven al token (como la tele)? **Recomendación:** sí, para quien no lo ve,
   nada (el portal en sí se sigue viendo).
2. Con «reducir movimiento», ¿los pulsos sin animación (un destello quieto) o sin nada? **Recomendación:** un destello corto, sin ondas.

### P324 — 🙈 «Cómo quedó el grupo» al empezar el combate, ¿muestra al escondido? (2026-11-24, Claude)

Probando el inicio de turno de un escondido (cola de pruebas, 2026-11-24): al pasar a combate, la ventana del GM «🩺 Cómo quedó el grupo»
(`vtt-hexgrid/js/81`) mostró a Blanco J1, en Sigilo, con su vida, sus estados y «No vencen: Sigilo», **con el 👁 apagado**. Es una herramienta del GM
para ajustar los turnos de los estados (como GM Tools, que también tiene las fichas), pero en el mapa todo lo demás de ese escondido se le tapa.
1. ¿Se deja así (es la ficha del grupo, no el mapa) o el escondido sale solo con el 👁 prendido? **Recomendación:** dejarlo así: es para que el GM
   acomode los estados de todos al empezar, y no dice dónde está.

### P325 — 🙈 El GM sin 👁 no puede demorar al que juega por debajo de un escondido (2026-11-24, Claude)
Probando ⏬ Demorar con un escondido (cola de pruebas): con Blanco J2 jugando y Blanco J1 (en Sigilo) justo abajo, el GM con el 👁 apagado no ve la
fila de J1, así que el ▼ de J2 queda apagado: no puede demorarlo. Con el 👁 prendido sí puede (y ahí ve todo). Si lo hace, las tarjetas salen bien
(el GM ve «Pasa el turno» sin nombre). Es lo mismo que pasa con cualquier cosa del orden que el GM no ve.
1. ¿Queda así (para demorar a alguien por debajo de un escondido, el GM prende el 👁 un momento)? **Recomendación:** dejarlo así: es raro y el 👁
   es justo para eso.
2. ¿O el ▼ del que juega se deja apretar igual, y se demora por debajo del siguiente aunque el GM no lo vea (el GM no se entera a quién le toca)?

### ✅ P326 — 🙈 La zona de un creep le pega a un jugador escondido: ¿quién tira el daño? (2026-11-24, Claude)

**Decidido (dueño, 2026-11-24), distinto de lo recomendado:** «prefiero que el daño lo tire el propietario de la zona, que se revele que hay
alguien ahí pero no se descubra. El personaje puede seguir moviéndose. Que en ese caso, si pasa daño, diga "el muro le hizo N de daño a un
personaje oculto". Es un punto medio entre descubrirlo y que no pase nada; además evita trampitas y gente que se haga la pilla». O sea: tira
el dueño de la zona (el GM si es de un creep), el cuadro / la Crónica / la Mesa dicen «a un personaje oculto» (sin nombre), el token sigue sin
verse y el escondido sigue escondido (si el daño no lo delata). Lo mismo para el caso inmune («…no le hizo nada a un personaje oculto»).
Probado con clics (cola de pruebas): Blanco J1 en Sigilo, parado sobre el Muro de fuego de un creep; al empezar su turno el muro le pega 3d4 de
fuego. Hoy ese daño va al cuadro del duelo y lo tira el GM (P245: «el daño de una zona lo tira el dueño de quien la creó»), así que al GM se le abre
«Blanco creep VS Blanco J1», y la Crónica y la Mesa le dicen que el muro le pegó. El GM sabe que J1 está escondido, pero así sabe **dónde**. Lo mismo
pasa con cualquier zona con daño de dados que puso el GM o un creep. Las áreas ya tienen su solución (P263: el escondido va aparte y el bando que
la lanzó no ve nada), pero las zonas quedaron afuera a propósito.
1. ¿Quién tira el daño cuando el que recibe está escondido para el que puso la zona? **Recomendación:** que lo tire solo la pantalla de quien lo
   maneja (el jugador), sin cuadro del duelo, con el dado a la vista para él (como las zonas de número fijo de P245), y que el GM no vea nada: ni
   el duelo, ni la Crónica «… está en Muro de fuego», ni la línea de la Mesa (lo ve solo su bando, como el duelo oculto). Si el daño lo delata, desde
   ahí todo normal.
2. ¿Y si el GM prende el 👁? **Recomendación:** que vea todo, como en el duelo oculto, pero sin tener que tirar él.

### ✅ P327 — 😵 La invocación o el refuerzo que saca más iniciativa que quien lo invocó: ¿queda mareado en su primer turno de la ronda siguiente? (2026-11-24, Claude, cola de programación)

**Decidido (dueño, 2026-11-24):** «lo importante es que la primera vez que le toque actuar a una invocación, no puede actuar. Tan simple como
eso». O sea: el Mareo de invocación le hace perder **solo su primer turno** (nunca más de uno), en cualquier orden y con P301 b; se va al
terminar ese turno o al empezar el turno de quien la invocó, lo que pase primero. Vale igual para los refuerzos (con o sin el creep que los llamó).

Desde hoy (lo definiste vos), una invocación o un refuerzo entra al orden con su tirada y queda con **Mareo de invocación hasta que empieza el próximo
turno de quien lo invocó** (antes: solo su primer turno propio). Aplicado así, literal. Un caso que queda raro: si saca **más** que quien lo invocó, su
lugar está antes que el de él. Ejemplo: Blanco J1 (10) invoca la Abeja en su turno y la Abeja saca 15. Hoy su lugar ya pasó en esta ronda (P301: juega
desde la próxima; P301 b, en la cola: juega igual al final de esta ronda). En la ronda 2 le toca a la Abeja **antes** que a J1, así que todavía está
mareada: no actúa. Recién actúa en la ronda 3 (o en la 2 si J1 la deja jugar después de él). Con P301 b serían dos turnos mareada seguidos.
**Mientras tanto quedó lo literal** (lo más conservador: tu regla tal cual).
1. ¿Queda así, literal? **Recomendación:** que el mareo se vaya con lo que pase primero: el inicio del turno de quien invocó **o** el final del
   primer turno propio de la invocación. Así nunca pierde más de un turno: si le toca antes que su invocador, pierde ese y listo; si le toca
   después, como ahora.
2. ¿O al revés: si saca más que quien la invocó, entra justo después de él (para que su primer turno caiga siempre después del de su invocador)?
3. Refuerzos: si el creep que lo llamó no está en el orden (lo raro: un creep copiado a mano no es un refuerzo), el refuerzo queda con el mareo de
   antes (solo su primer turno), porque el GM no tiene turno propio. ¿Está bien?

### ✅ P328 — ➕➖ Sumar o sacar a mano del orden de turnos: lo que quedó elegido (2026-11-24, Claude)

**Decidido (dueño, 2026-11-24): todo como lo recomendado** (1 sí; 2 sí, cuando se haga P301 b; 3 sí; 4 lo sacado queda afuera hasta que el GM
lo vuelva a sumar; 5 la ✕ de la tabla hace lo mismo que sacar del orden cuando saca al que tiene el turno). Y además: **no tiene que existir el
«➖ Sacar del orden» en el token** («hay muchos botones alrededor del token. Para quitar un token de la tabla, lo hace el GM desde la tabla
misma»); el «➕ Sumar al orden de turnos» sí queda.

Desde hoy el GM tiene en el «⋯» de cualquier token «➕ Sumar al orden de turnos» (o «➖ Sacar del orden» si ya está). Quedaron elegidas estas cosas,
todas cambiables:
1. **El número**: si el token tiene datos (personaje, invocación, creep, tótem) se elige entre «🎲 Tirar su Iniciativa» (la tirada de siempre, que va a
   la Mesa) y «✍ Escribir el número»; un token suelto no tiene nada que tirar, así que pide el número directo. ¿Está bien?
2. **Si su lugar ya pasó** en esta ronda (por ejemplo, entra con 30 cuando ya está jugando el de 25), juega desde la próxima, igual que hoy las
   invocaciones. Cuando se haga P301 b (en la cola), ¿lo hacemos igual para esto (juega al final de esta ronda)?
3. **Sin Mareo**: lo que se suma a mano no queda mareado (tampoco una invocación que el GM suma a mano): no está entrando sola. ¿Está bien?
4. **Sacar a un personaje, una invocación o un creep** es como la ✕ de la tabla: «Traer tokens» lo vuelve a traer. Lo que la regla deja afuera (el
   tótem, un token suelto con «No») y se sumó a mano, al sacarlo vuelve a quedar afuera. ¿O preferís que sacar sea «para siempre» hasta que lo sumes?
5. **La ✕ de la tabla y el que tiene el turno**: el «➖ Sacar del orden» termina su turno y le da el turno al siguiente con su «Empieza el turno» (como
   cuando se va una invocación). La ✕ de la tabla, en cambio, lo saca y el turno queda en el siguiente sin «Empieza el turno» (sin recargar No2 ni
   bajar cooldowns). ¿Hacemos que la ✕ haga lo mismo que el ➖?
