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
- 🔲 **P46. Colisión de Formas con pathfinding automático.** Se eligió
  "avisa y bloquea" (si la ruta arrastrada cruza un sólido, se bloquea la
  confirmación y el jugador la vuelve a dibujar a mano) en vez de que el
  mapa calcule solo el rodeo más corto; queda anotado para evaluar más
  adelante si conviene sumar pathfinding automático. *(2026-09-18)*
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

- 🔲 **P97. Reglas de casteo con SP (2026-09-21; reglas base en [`reglas-casteo.md`](reglas-casteo.md), nada implementado).** Definido: el daño de casteo tiene tipo y el tipo decide si ignora armadura (genérico, relámpago y fuego sí; un proyectil como la aguja de hielo no); qué tira cada lado según la habilidad (proyectil: PdG.Mg vs Evasión; efecto abstracto: PdG.Mg vs Res.Mg; mental: Res.Mt); la armadura mágica es rara; el área se esquiva con un roll de Evasión de hasta 2 casilleros que gasta No2. **Por decidir:** (1) los tipos de daño de casteo y cuáles ignoran armadura (¿hielo? ¿ácido? ¿sagrado y oscuro? ¿veneno?); (2) el nombre del daño genérico ("plasma", "arcano"…); (3) resistencia por tipo: ¿un stat por tipo, o uno general para lo elemental?; (4) armadura mágica: ¿cuánto reduce (fijo, %) y es lo mismo que el estado Escudo mágico y la skill Armadura Mágica?; (5) esquivar un área: ¿la Evasión se tira contra algo o alcanza con tener No2 y salir del área?, ¿cuántos No2 cuesta el roll?, ¿se hace fuera de turno, como reacción?, ¿se puede con Inmovilizado o Rengo?; (6) ¿el efecto de estado de un área (un debuff) usa Res.Mg?; (7) ¿los golpes críticos y sus resistencias (Tipo 4–12) aplican al daño de casteo?; (8) ¿se renombra "Mg" (PdG.Mg, Res.Mg) ya que la magia es "el casteo con SP"? **Proceso paso a paso, con las decisiones separadas y con estado: [`proceso-casteo.md`](proceso-casteo.md).**

- 🔲 **P98. Tres velocidades de habilidad para creeps: rápida, intermedia y lenta (idea conceptual, 2026-09-21; sin diseñar ni construir — "las vamos a ir viendo").**
  Hoy hay dos: **rápida** (CD 2–3) y **lenta** (CD 4–6, arranca con el cooldown activo; en el código `lenta = cd >= 4`, `comun/skills-creep-base.js`, y el filtro "Velocidad" de la biblioteca de habilidades de gm-tools). **Idea del usuario:** pasar a tres, con la velocidad **equivalente al poder del efecto** (más lenta, más potente):
  · **Rápida:** CD 2 o 3.
  · **Intermedia:** CD 3 o 4, **empieza con el CD activo**.
  · **Lenta:** CD 5 o 6, **empieza con el CD activo**.
  El mensaje del usuario se cortó en "Debería haber una equi…" (probablemente una **equivalencia entre poder y velocidad**); pendiente completarlo. **Por decidir:** (1) esa equivalencia (cuántos dados de daño, cuánta cura o qué tipo de efecto corresponde a cada velocidad); (2) el CD 3 cae en rápida **y** en intermedia, así que el CD solo no alcanza: ¿cada habilidad guarda su velocidad, o se distingue por poder?; (3) qué pasa con las habilidades actuales (321 del catálogo y las de los creeps base): ¿se reclasifican solas —las de CD 4 pasarían de lentas a intermedias— o se revisan una por una?; (4) cómo se ve en el asistente de habilidades y en el filtro de la biblioteca.

- 🔲 **P99. Habilidad social "Reparar equipo" (idea, 2026-09-21).** Sumar al pool de habilidades sociales (las que se aprenden con puntos de Inteligencia, junto a las demás) una nueva: gasta **despojos** (loot) para reparar escudos y armaduras — pensada como alternativa a **Oleo reparador** para sacarse Armadura rota (Armadura arruinada se eliminó del repaso de debuffs, 2026-09-21) — y quizás reparar equipo dañado en general, si en algún momento existe ese concepto más allá de ese estado. **Por decidir:** nombre definitivo, cuántos despojos por punto de reparación (o por stack de Armadura rota), si repara Armadura arruinada entera o de a poco, si tiene nivel/tirada como las demás sociales o es un efecto fijo, si tiene cooldown o límite de usos, y si además del gasto de despojos hace falta una tirada.

- 🔲 **P100. Las invocaciones no tiran dos veces con Afortunado (bug encontrado 2026-09-22).** El PJ y los creeps de gm-tools, con el estado Afortunado activo, tiran PdG/Parry/Evasión dos veces y se quedan con la mejor. Las invocaciones (`tirarValorStatInv` en ficha.html) no tienen esa lógica: el estado se puede aplicar pero no hace nada. Falta sumarle el mismo mecanismo (`conVentaja`/doble tirada) que ya tienen los otros dos.
- ✅ **P101. Pajaritos ya está implementado para creeps (arreglado 2026-09-22).** `ESTADOS_PRESET_GM` y `comun/estados-aplicar.js` llevan `mitadPdgEva:true`; `creepStatValor` lo aplica a PdG/Evasión (mismo `floor`) y `FLAGS_ESTADO_CREEP` lo copia al aplicar el preset. Si un creep tiene Pajaritos y Lisiado juntos, el PdG se parte al medio dos veces (igual que en la ficha).

- 🔲 **P102. Mecánica de Wildcards (2026-09-22).** El contador volvió a la ficha (panel ⭐ Exp y Job, `S.meta.wildcards`/`wildcardsMax`, los dos a mano, sin fórmula ni tope) pero todavía sin ninguna regla de juego. La idea original (de una versión anterior, ver el manual) era un recurso diario para repetir una tirada. **Por decidir:** ¿se usa para eso?; ¿cuántos por día o por descanso; se acumulan?; ¿se puede usar para repetir la tirada de otro jugador?; ¿tiene botón propio en la Botonera (como Afortunado) o queda a mano, tildando el estado?

- 🔲 **P103. Biblioteca abierta a habilidades y personajes de jugador (idea a futuro, 2026-09-22).** Hoy la biblioteca (`comun/biblioteca.js`) sirve para creeps, pasivas, trampas y habilidades de creep — la sube cualquier GM como propuesta y el dueño del proyecto la aprueba. La idea es extender el mismo mecanismo a las habilidades de clase y a personajes enteros creados por un jugador, para cuando el proyecto se abra a más gente que el grupo actual. **Por decidir:** ¿qué tipos nuevos hacen falta (`habs_pj`, `personajes`)?; ¿un jugador propone desde su propia ficha, o sigue siendo el GM el que sube?; ¿qué datos de un personaje tiene sentido compartir (solo la idea/las habilidades, o la ficha completa)?; nada de esto es urgente — es la dirección a seguir cuando se retome el tema.

- ✅ **P104. Ataque de oportunidad (regla establecida, 2026-09-22).** Cuando dos fichas de bandos distintos están adyacentes y una se aleja, la otra tiene un ataque de oportunidad: se puede hacer con No2 disponibles y cuesta lo mismo que un primer ataque. El mapa no frena el movimiento ni resuelve la tirada — solo avisa en rojo en la Mesa ("Fulano se alejó de Mengano: posible ataque de oportunidad", `oportunidadEvaluarRuta`/`oportunidadPublicarAvisos` en `vtt-hexgrid/mapa.html`). **Pendiente de diseño** (para cuando se retome): habilidades con más PdG/Evasión en ataques de oportunidad; habilidades que dejan bloquearlos; ¿corresponde también entre aliados en algún caso (PvP), o solo entre bandos distintos como está ahora (reusa `rivalesDe`)?

- ✅ **P105. La zona de alerta del escenario 2, resuelta (2026-09-22): solo cuenta si te quedás parado.** `percepcionEvaluarRuta` (cuando quien camina NO está en sigilo y se acerca a un rival oculto) sigue chequeando la zona **propia de quien camina** (no la fija del oculto que dibuja 👓 — eso se mantiene: importa hacia dónde presta atención quien camina). Lo que cambió: **el cono** (línea de visión directa) se sigue mirando en cada paso de la ruta — cruzarlo delata igual, de paso o no. **La zona de alerta** en cambio ya no acumula pasos: pasar de largo por ahí sin quedarse ya no dispara nada; se mira nomás en la casilla donde termina la ruta, orientada hacia el último paso dado. Antes contaba cada paso de más adentro de la zona (aunque fuera solo de paso), lo que generaba pedidos de tirada que no coincidían con lo que se veía dibujado con 👓. `rotacionDePaso(pa, pb)` nueva (comparte la fórmula que antes estaba repetida en el bucle).

- 🔲 **P106. ¿Qué efectos de ítems y pasivas se muestran como estado alterado y cuáles no? (2026-09-24, dicho por el dueño).** Todavía no se encontró el criterio conceptual. **Por ahora** solo la pasiva de **regeneración** (`regenHp`) aparece entre los estados alterados activos (como estado derivado de solo lectura, `estadosDePasivas` en la ficha, con ✦; también en el resumen que ve el mapa). Los efectos de ítems equipados que ya se muestran (los que llevan `origenItem`, marcados con ⚙) siguen como estaban. Falta decidir la regla general (¿solo lo que tiene HP por turno o duración?, ¿todos los bonos de pasivas?).
- ✅ **P107. Activar una trampa rompe el sigilo (2026-09-24).** Regla dicha por el dueño: un personaje (o creep) en sigilo que dispara una trampa pierde el sigilo. Hecho en `trampaResolver` (mapa). **Descubrir una trampa (sin pisarla) NO rompe el sigilo, pero la trampa se vuelve visible para quien la descubrió** (dicho por el dueño, 2026-09-24; `descubrirTrampa`, por navegador: la ve solo esa persona). Queda abierto si al descubrirla debe verla también su equipo, y si la vista debe depender del resultado de la tirada de percepción (hoy se revela apenas salta el aviso).

- 🔲 **P108. Sobrepeso: regla en prueba (2026-09-24, dicha por el dueño).** Si el equipo pesa más que la Crg.Max, aparece el estado derivado **Sobrepeso** (⚖, no se guarda): −1 a la Evasión por cada punto de más, **solo al tirar Evasión**. Al apretar Esquivar (o el 🎲 de Evasión) sale un pop-up: **pagar 1 No2 y tirar sin penalidad**, o **tirar con la penalidad** (`tirarValorStat`, ficha). Reemplaza la regla vieja (−SP máximo). **Por decidir:** ¿el pago vale solo para esa tirada (como está hoy) o para todo el turno? ¿Afecta también al movimiento o a Parry/Bloqueo? ¿Se aplica a creeps? Hoy no.

- 🔲 **P109. ¿Tiene sentido que Sonic Boom se use con Flash en turno ajeno? (2026-09-24, dicho por el dueño).** Por ahora sí: se deja con Flash (SP x 2 = el doble, 4 SP en turno ajeno, a mano). Falta decidir con el grupo si conviene, porque es un cono de control (quita No2 y puede dejar Sentado) que se usaría fuera de turno. Cargada también en las preguntas de las 🛠 Herramientas de diseño.

- 🔲 **P110. Daño en área del Tanque: ¿se esquiva normal o exige dodge roll? ¿Se puede parrear? (2026-09-24, dicho por el dueño).** Por ahora el texto dice que los afectados **pueden** esquivar con dodge roll (a mano); no define si la Evasión común también sirve ni si el Parry puede pararlo. Cargada también en las preguntas de las 🛠 Herramientas de diseño. Se relaciona con el paso 5 de `proceso-casteo.md` (esquivar áreas).

- 🔲 **P111. Flash: ¿siempre significa que no cuesta Nitros, o solo que se puede usar en turno ajeno? (2026-09-24, dicho por el dueño).** La regla general de `clases-borrador.md` dice "Flash = no cuesta Nitros y se puede usar durante el turno de cualquier jugador". Se duda si la parte de "no cuesta Nitros" es parte de la definición o si Flash solo habilita usarla fuera de turno. Afecta a Blindaje, Shockwave, Sonic Boom y Takle (que incluye ataque y desplazamiento). **Ejemplo para pensar el costo — Takle:** Flash, con un desplazamiento de hasta 2 casillas y un ataque con +1 PdG: ¿0 No2 en total, o 2 No2 de movimiento más lo que cuesta un ataque? Cargada también en las preguntas de las 🛠 Herramientas de diseño.
- 🔲 **P112. Peso de cada efecto de arma y fórmula de calidad/precio (2026-09-25, idea del dueño).** Cada efecto de arma (Rompe armadura, Sangrado, Envenenar, Knockdown…) tendría un **peso** según cuán relevante es en combate, para calcular la **calidad y el precio** de un arma y, eventualmente, una mecánica de balance. Hoy `comun/guia-diseno.js` tiene pesos provisorios de 1 a 5. Falta decidir: la escala, cómo suman varios efectos, cómo entran el Tipo/Peso del arma, la rareza y el nivel de la familia (🏠 casa / 🤝 habilitado / ✨ excepcional: ¿un efecto excepcional cuesta más o menos?) y si el resultado sugiere el precio o lo calcula solo.
- 🔶 **P113. Cómo funciona el golpe crítico (regla dicha por el dueño, 2026-09-25; en elaboración).** **Decidido:** quien ataca con un arma tira su probabilidad de golpe (PdG) y el otro tira Evasión; **el crítico lo determina el TIPO del arma: si la diferencia PdG − Evasión es igual o mayor al Tipo del arma, es golpe crítico.** Un crítico **ignora la armadura** en el daño y **además se tira un dado para ver qué otro efecto tiene** (la tabla de efectos la pasa el dueño después). **Choca con lo que hace hoy la ficha y dice el manual** (nota "Golpe crítico": la chance sale del stat **Crítico (Crit)**, de Destreza, con "Crítico +1/+2" en armas y skills): hay que decidir qué pasa con el stat Crit y con esos bonos (¿bajan el umbral? ¿suman a la diferencia?). **Dado del crítico (dicho el mismo día): se tira 1d20 y el resultado da el multiplicador de daño: 7 o más → **doble daño (×2)**; 17 o más → **triple daño (×3)**; 20 → **cuádruple daño (×4)**** (**con menos de 7 no hay multiplicador (×1): solo ignora la armadura; el multiplicador se aplica a TODO el daño del golpe** —dados del arma, bono de Fuerza y cualquier otro bono—, confirmado por el dueño). **Doble crítico (dicho el mismo día): si la diferencia PdG − Evasión es el DOBLE del Tipo (o más), es un doble crítico.** Su efecto: si el defensor tiene equipo que **bloquea un crítico**, ese bloqueo se lleva el primero y **con el segundo se activa el efecto crítico igual** (la Resistencia a crítico funcionaría como "cuántos críticos anula", por Tipo de arma). **Generalización (dicha el mismo día): el nivel del crítico es N = diferencia ÷ Tipo (redondeado hacia abajo); con nivel N se tira el d20 N veces y se queda con el MEJOR dado** (ej.: arma Tipo 4 y diferencia de 8 o más = doble crítico = 2d20, el mejor; 12 o más = 3d20…). La **Resistencia a crítico resta niveles**: el defensor con resistencia R contra ese Tipo se lleva R críticos, o sea que se tira con N − R dados (si N − R ≤ 0, no hay crítico). **Confirmado por el dueño: un punto de resistencia = un nivel menos** (doble crítico contra 1 punto cuenta como crítico simple; crítico simple contra 1 punto no es crítico). **Pendiente:** (a) ya cerrado el dado (queda por ver si el crítico tiene más efectos además del multiplicador); (b) cómo entra la **Resistencia a crítico** (el dueño está por explicar el dilema; hoy es un número por Tipo 4/6/8/10/12 que se acumula en la armadura); (c) después, el peso de la resistencia a crítico y de cada efecto en la calidad/tier/precio de un ítem (P112). Hasta que se cierre, no se cambia el código.
- 🔶 **P114. Escasez de la Resistencia a crítico por slots (idea del dueño, 2026-09-25; en elaboración).** **Dilema:** las resistencias a crítico de Tipo alto tienen que ser MUCHO más escasas que las de Tipo bajo (Res. Tipo 10 ≪ Res. Tipo 4), pero sin volver a nadie inmune a los críticos. **Idea:** regularlo por **slots elegibles**: cada Tipo de resistencia solo la pueden dar ciertos slots de equipo, así el máximo que se puede juntar equipado queda limitado por diseño. Ejemplo del dueño: **Tipo 10 solo en cascos** (un solo ítem equipado a la vez, pocos cascos y de buena calidad); **Tipo 8 en solo dos slots (y no el casco)**; **Tipo 6 en solo tres slots**; **Tipo 4 compartido en más slots** ("tipo 2" fue un error de tipeo: **no existe**, los Tipos son 4, 6, 8, 10 y 12). Falta definir: qué slots exactamente, qué pasa con el **Tipo 12**, y el balance (con el nivel de crítico N = diferencia ÷ Tipo, un máximo de resistencia R alto anula los críticos de ese Tipo). **Datos del catálogo hoy** (`tipo1`=Tipo 4 … `tipo5`=Tipo 12, ítems con esa resistencia por slot): Tipo 10 en cabeza 4, armadura rígida 8, piernas 2, pies 3, manos 3, escudos 2, anillos 1; Tipo 12 en 7 ítems (cabeza 2, manos 2, piernas 1, pies 1, armadura rígida 1). Aplicar esta regla obligaría a auditar y reubicar esas resistencias. Sigue la convención suave por rareza de la nota "Resistencia a crítico" del manual.
  **Anillos (aclaración del dueño, 2026-09-25):** los anillos son **mágicos y de a uno por mano (2 slots, como ya limita la ficha: `max: 2`)**. Dan **más libertad** de efectos, pero tienen que ser **más escasos y caros** que el resto del equipo. Todo esto son **preceptos para un futuro rework completo del catálogo** (el dueño va dando líneas cada vez más específicas).
- ✅ **P115. Dos formas de mejorar el crítico (dicho y cerrado por el dueño, 2026-09-25).** Se diseñan armas, ítems y skills con dos palancas, con estos nombres: **(1) Crítico FRECUENTE (frecuencia)**: baja el "rango" del crítico, o sea el número contra el que se compara la diferencia PdG − Evasión (un arma Tipo 4 con crítico frecuente ×1 hace crítico con diferencia 3 y **doble crítico con diferencia 6**; el **mínimo siempre es 2**). Como cambia el valor de referencia, cambia también el nivel N = diferencia ÷ rango. **(2) Crítico POTENTE (potencia)**: baja el umbral del d20 para los multiplicadores (ej. doble daño con 6+ en vez de 7+). **En principio baja TODOS los umbrales juntos** (7→6, 17→16, 20→19); si hiciera falta afinar, se puede jugar con que baje uno y no otro. Los nombres definitivos son **frecuencia** y **potencia** del crítico: todo va a estar explicado en las herramientas (Guía de diseño, ítems y skills). **Vocabulario fijado:** **doble crítico** = la diferencia es el doble del rango: el crítico se activa dos veces (2d20, vale el mejor); **doble daño / triple daño / cuádruple daño** = el multiplicador que da el d20 (×2 / ×3 / ×4). **Skills existentes que ya lo tocan:** "+1 al crítico" (Lisiar, Tajear, Degollar, Headshot, Apuntar…) pasa a ser **Crítico frecuente**; "crítico mejorado" (Headshot) pasa a **Crítico potente**. **Decisiones del mismo día:** (a) **el mundo del crítico corresponde a las armas de Tipo 4 y 6** (punzantes y cortantes): **las de Tipo 4 tienen como universo el Crítico FRECUENTE y las de Tipo 6 el Crítico POTENTE** (cambio de opinión del mismo día; **ambas familias juegan con las dos herramientas, pero con ese acento**: un Tipo 4 usa más frecuente y algo de potente; un Tipo 6, más potente y algo de frecuente; y pueden aparecer en otras armas). Las pesadas (Tipo 8+) quedan para sus efectos de casa (Rompe armadura, Knockdown…). (b) **Cómo baja cada umbral con Crítico potente ×P (dicho por el dueño, 2026-09-25):** **doble daño 1 a 1** (7 − P); **triple daño 1 a 2** (baja 1 cada 2 puntos: 17 − P÷2, hacia abajo); **cuádruple daño 1 a 3** (baja 1 cada 3 puntos: 20 − P÷3, hacia abajo). Ejemplo: P=1 → 6 / 17 / 20; P=2 → 5 / 16 / 20; P=3 → 4 / 16 / 19; P=4 → 3 / 15 / 19; P=5 → 2 / 15 / 19; P=6 → 1 / 14 / 18. **Piso (confirmado por el dueño):** el umbral del doble daño llega como mínimo a **1** (con el d20 siempre hay doble daño); **seguir sumando puntos de potente sigue bajando los otros umbrales, cada uno a su propia escala** (triple 1 cada 2 puntos, cuádruple 1 cada 3). Ejemplos: P=8 → 1 / 13 / 18; P=12 → 1 / 11 / 16. (c) **Los estados de crítico (frecuente y potente) se pueden dar tanto a otros como a uno mismo.** (d) Aprobadas por el dueño las skills **Punto débil** (Debuffer) y **Temple** (Tanque). **Pendiente:** un set corto de skills que definan la regla (propuesta del asistente, a auditar por el dueño) y cargar la mecánica en la ficha y el mapa.
- 🔶 **P116. Armas mágicas y armas para mago (dicho por el dueño, 2026-09-25; en elaboración, "vamos por partes").** Hoy el catálogo casi no tiene (solo el Báculo mágico es realmente mágico; los otros bastones son físicos). **División decidida: armas mágicas de DAÑO y armas mágicas de EFECTO.** **Armas de efecto:** dan **pequeños efectos mágicos / pequeños hechizos que se castean con el arma**, tiran **probabilidad de golpe mágico** (Hechizo: PG con Especial) y se pagan **generalmente con 1 Nitro (No2) y SP según el efecto**. **Aclaraciones del mismo día:** un arma de efecto lleva **uno o más efectos, escalando con la calidad y la potencia** de los efectos; **no se diferencian necesariamente de las skills de Mago**: un buen arma de mago puede tener efectos potentes; **1 a 3 SP es un costo barato**. **Aporte de Seba (amigo del dueño, consultado sobre cómo encarar esto):** las armas mágicas, aunque tengan efectos parecidos a hechizos (como un proyectil mágico), **no usan SP pero SÍ escalan con ataques sucesivos en un turno** (como una arma física); ejemplos: **Varita de heal** (útil para llevar en la mano izquierda), **Varita de translocación** (mueve una unidad 2 o 3 espacios; tira Res. mágica), **Varita de hongo venenoso** (deja un hongo, no es invisible, es gratis); "y así, podés hacer lo que se te ocurra". **CONTRADICCIÓN a resolver:** el dueño había dicho "1 Nitro + SP según el efecto" y Seba propone "sin SP, con costo que escala por ataque sucesivo": falta decidir cuál rige o cómo se combinan. **Armas de DAÑO — el mínimo (dicho por el dueño el mismo día):** lo más básico es una **Varita de proyectil mágico** (un arma mágica **común, de calidad baja**; no es un buen arma, es el piso): **1d4 de daño directo a la vida** (ignora la Defensa), cuesta **1 Nitro y nada de SP**, y tira **probabilidad de golpe mágico contra Evasión**. (Para comparar: el Chispazo de la clase Mago es T4 P1 que ignora armadura, SP 1 y No2 3.) **Escala de calidad de la varita (mismo día):** una Varita de proyectil mágico de **buena calidad** cuesta lo mismo (**1 Nitro**, sin SP) pero hace **1d6** en vez de 1d4 (misma idea: la calidad sube el dado del daño con el mismo costo). **Cambio de Chispazo (mismo día):** la skill **Chispazo** de la clase Mago pasa de SP 1 / No2 3 / T4 a **SP 1 / No2 1 / T6 (1d6)** para equipararla a la varita de buena calidad ("3 Nitros por un d4 es carísimo"); queda **marcada a auditar** (el dueño la va a revisar con sus colegas). **Regla de diseño del daño mágico (mismo día): no existe la "defensa mágica"; el daño mágico va directo a la vida.** Las skills que hacen daño mágico con el Especial como daño **tienen que ser muy caras**; la alternativa equilibrada es un efecto que **use el Especial del usuario para calcular la potencia pero haga daño FÍSICO** (ej.: estalactita de hielo), de modo que la armadura del defensor sí cuente. Skills de Mago a revisar con este criterio (además de Chispazo, ya rebalanceado): Rayo Mágico, Orbe arcano, Tormenta arcana y Ráfaga arcana. **El SP como palanca de balance de la magia (mismo día):** quienes se enfocan en magia tienen **bastante SP al inicio del combate** y, por las reglas del juego, una **regeneración de SP mayor que el promedio** (la regeneración base depende del Especial, hoy "en definición"). Por eso el SP es un **buen regulador**: cobrar SP en los efectos mágicos equilibra lo que pueden hacer, mientras que los Nitros (escasos para todos) se reservan como costo más pesado. (Aclaración: en el dictado "LSP"/"LCP" era "el SP", no una sigla.) **Tipos de daño mágico (mismo día):** **Arcano** = el daño más puro, **sin efectos adicionales y directo a la vida**. **Elementales, por ahora tres: fuego, hielo y rayo** (el dueño acepta sugerencias). Los elementos también abren **espacio de diseño en el equipo defensivo** (resistencias o protecciones elementales). **Sugerencias del asistente (a aprobar):** cada elemento con su efecto de casa ya existente en el juego: **fuego → Prende fuego** (daño por turnos), **hielo → Escarcha** (−1 No2 máx.), **rayo → Stun/Aturdir** (sin No2); candidatos futuros: **ácido → Rompe armadura**, **veneno → Veneno**, **sagrado** (ya hay "holy" en Smite) y **sombra/sangre** (Drenar vida). **Pendiente:** (a) el resto de las armas de daño (cómo escalan sobre esa base y se equilibran contra las físicas); (b) cómo se elige el efecto al castear cuando el arma tiene varios y cuál es la regla de costo (SP, Nitros escalados, o ambos); (c) qué mecánicas nuevas piden los ejemplos de Seba (mover unidades a la fuerza 2–3 casillas con tirada de Res. mágica, mano izquierda/off-hand, un hongo visible que se deja en el mapa —ojo: la palabra "trampa" es solo para colocar trampas ocultas—); (d) el peso de cada efecto en calidad y precio (P112) y la libertad creativa de efectos con un balance equiparable al de las armas físicas.
