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

- ✅ **P97. Reglas de casteo con SP — los 5 pasos de decisión cerrados (2026-09-21 a 2026-09-27; reglas completas en [`reglas-casteo.md`](reglas-casteo.md); nada implementado en código todavía, eso sigue en `pendientes.md`).** Definido: **por defecto, todo daño de casteo ignora armadura**, sea cual sea el elemento — la única excepción es un objeto físico arrojado (aguja de hielo, piedra, dardo), que respeta la armadura como cualquier proyectil físico; un mismo elemento puede ser las dos cosas según cómo se lo narre (Paso 1); qué tira cada lado según la habilidad (proyectil: PdG.Esp vs Evasión; efecto abstracto: PdG.Esp vs Res.Esp; control mental: PdG.Esp por defecto vs Res.Mt, salvo que la habilidad diga otra cosa); una habilidad mixta (daño + debuff) tira **una sola vez**, el debuff se aplica solo si conecta; sobre uno mismo o un aliado **no se tira nada, pero se abre igual el cuadro de duelo sin oposición** (visible a toda la mesa, con botón «Aplicar» para el estado — ya construido, [`duelo-de-habilidades.md`](duelo-de-habilidades.md)); el formato de la descripción usa el campo `duelo` cuando la habilidad ya está automatizada, o una frase tipo "Tirás PdG.Esp contra el Res.Esp del objetivo" si todavía no (Paso 2); los críticos y las Resistencias a crítico (Tipo 4–12) no aplican al daño de casteo; el daño de trampas depende de cada trampa; la resistencia al daño de casteo es un solo stat nuevo, **Armadura mágica** (número fijo, no por elemento, no deriva de ningún atributo, solo en ítems de tier alto), distinta del estado Escudo especial y de la skill **Armadura arcana** del Mago (renombrada 2026-09-27, antes "Armadura Mágica", para no confundirla con el stat — Paso 3); un área se esquiva primero con el contraste de siempre (PdG.Esp o PdG del que actúa contra la Evasión de cada defensor); solo si el defensor gana esa Evasión gana el derecho a un **dodge roll** (moverse hasta 2 casilleros, 1 No2 por casillero, doble con Rengo, imposible con Stun o Inmovilizado); **no hay término medio** — fuera del área del todo o efecto completo, nunca mitad; las trampas no se esquivan así, elemento sorpresa (Paso 4); el daño genérico se llama **"arcano"** (ya usado en el catálogo), "Mg" se renombró a "Esp" (PdG.Esp, Res.Esp — los ids `pdgmg`/`resmg` no cambiaron), "Hechizo" se mantiene (Paso 5). **Sigue:** Pasos 6–8 (implementación en código y auditoría de contenido) — ver [`proceso-casteo.md`](proceso-casteo.md) y `pendientes.md`.

- 🔲 **P98. Tres velocidades de habilidad para creeps: rápida, intermedia y lenta (idea conceptual, 2026-09-21; sin diseñar ni construir — "las vamos a ir viendo").**
  Hoy hay dos: **rápida** (CD 2–3) y **lenta** (CD 4–6, arranca con el cooldown activo; en el código `lenta = cd >= 4`, `comun/skills-creep-base.js`, y el filtro "Velocidad" de la biblioteca de habilidades de gm-tools). **Idea del usuario:** pasar a tres, con la velocidad **equivalente al poder del efecto** (más lenta, más potente):
  · **Rápida:** CD 2 o 3.
  · **Intermedia:** CD 3 o 4, **empieza con el CD activo**.
  · **Lenta:** CD 5 o 6, **empieza con el CD activo**.
  El mensaje del usuario se cortó en "Debería haber una equi…" (probablemente una **equivalencia entre poder y velocidad**); pendiente completarlo. **Por decidir:** (1) esa equivalencia (cuántos dados de daño, cuánta cura o qué tipo de efecto corresponde a cada velocidad); (2) el CD 3 cae en rápida **y** en intermedia, así que el CD solo no alcanza: ¿cada habilidad guarda su velocidad, o se distingue por poder?; (3) qué pasa con las habilidades actuales (321 del catálogo y las de los creeps base): ¿se reclasifican solas —las de CD 4 pasarían de lentas a intermedias— o se revisan una por una?; (4) cómo se ve en el asistente de habilidades y en el filtro de la biblioteca.

- 🔲 **P99. Habilidad social "Reparar equipo" (idea, 2026-09-21).** Sumar al pool de habilidades sociales (las que se aprenden con puntos de Inteligencia, junto a las demás) una nueva: gasta **despojos** (loot) para reparar escudos y armaduras — pensada como alternativa a **Oleo reparador** para sacarse Armadura rota (Armadura arruinada se eliminó del repaso de debuffs, 2026-09-21) — y quizás reparar equipo dañado en general, si en algún momento existe ese concepto más allá de ese estado. **Por decidir:** nombre definitivo, cuántos despojos por punto de reparación (o por stack de Armadura rota), si repara Armadura arruinada entera o de a poco, si tiene nivel/tirada como las demás sociales o es un efecto fijo, si tiene cooldown o límite de usos, y si además del gasto de despojos hace falta una tirada.

- ✅ **P100. Las invocaciones no tiran dos veces con Afortunado (bug encontrado 2026-09-22; resuelto 2026-09-30: personaje, invocación y creep tiran un stat con la misma función, `Combatiente.tirarStat` en comun/combatiente.js).** El PJ y los creeps de gm-tools, con el estado Afortunado activo, tiran PdG/Parry/Evasión dos veces y se quedan con la mejor. Las invocaciones (`tirarValorStatInv` en ficha.html) no tienen esa lógica: el estado se puede aplicar pero no hace nada. Falta sumarle el mismo mecanismo (`conVentaja`/doble tirada) que ya tienen los otros dos.
- ✅ **P101. Pajaritos ya está implementado para creeps (arreglado 2026-09-22).** `ESTADOS_PRESET_GM` y `comun/estados-aplicar.js` llevan `mitadPdgEva:true`; `creepStatValor` lo aplica a PdG/Evasión (mismo `floor`) y `FLAGS_ESTADO_CREEP` lo copia al aplicar el preset. Si un creep tiene Pajaritos y Lisiado juntos, el PdG se parte al medio dos veces (igual que en la ficha).

- 🔲 **P102. Mecánica de Wildcards (2026-09-22).** El contador volvió a la ficha (panel ⭐ Exp y Job, `S.meta.wildcards`/`wildcardsMax`, los dos a mano, sin fórmula ni tope) pero todavía sin ninguna regla de juego. La idea original (de una versión anterior, ver el manual) era un recurso diario para repetir una tirada. **Por decidir:** ¿se usa para eso?; ¿cuántos por día o por descanso; se acumulan?; ¿se puede usar para repetir la tirada de otro jugador?; ¿tiene botón propio en la Botonera (como Afortunado) o queda a mano, tildando el estado?

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

- **P144. La Armadura mágica: ¿un stat más o un bono excepcional? (2026-10-02, abierta a pedido del dueño para que la discutan Enro y
  Seba — también va en la pestaña 💬 Preguntas de las Herramientas de diseño).** Hoy existe como stat (`armadmg`, paso 7 de las reglas de
  casteo, 2026-09-27): arranca en 0, no sale de ningún atributo, la dan ítems (por criterio, Raros o mejores) y se resta al daño mágico
  que ignora la Defensa (en el duelo, en las zonas de habilidad y al tóxico, P142). Planteo: ¿debería ser un **stat** como los demás (que
  aparece en la ficha, sube con pasivas, etc.) o un **bono particular y excepcional**, que se mantenga en valores bajos y solo lo
  otorguen algunos equipos, efectos, habilidades o consumibles, y cuyo único trabajo sea reducir el daño mágico? ¿Qué topes o valores
  típicos? ¿Debería reducir todo daño mágico o solo algunos tipos?

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
- ⏳ **P178. Daño de colisión** (dueño, 2026-10-08, vendaval): si un empujón choca contra algo (un Sólido, un token, el borde) antes de recorrer todo, hay
  daño de colisión — a definir cuánto y a quién (¿también a aquello contra lo que choca?). Hoy el mapa lo avisa en la Crónica: «✋ daño de colisión a mano».
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