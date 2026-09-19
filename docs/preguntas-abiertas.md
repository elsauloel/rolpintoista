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
- ✅ **P5. Tirada de detección: cuántas.** Respondido 2026-09-19: **una por cada paso que da dentro de la zona de alerta** (cada casillero de la ruta que cae en la alerta cuenta como una tirada). Como la tirada es manual, el mapa solo cuenta y avisa cuántas hay que hacer.
- ✅ **P6. Otras formas de detectar.** Respondido 2026-09-19: sí, se puede buscar a propósito (sin automatizar: la resuelve la mesa a mano, como el resto de la detección).
- ✅ **P7. Qué es "acción hostil".** Respondido 2026-09-19: cualquier acción con efecto directo sobre un enemigo: un ataque o una skill individual (invocar una nube tóxica en área, no; a debatir). **Es una regla, pero no se puede automatizar su detección: queda entre los jugadores.** Quien la hace sale del sigilo a mano con el botón de la Botonera (o el GM saca el estado del creep).
- ✅ **P8. Última posición conocida.** Respondido 2026-09-19: sí, quien se esconde a la vista de otro deja una marca "?" en su última posición vista **por dos turnos** (`SIGILO_MARCA_TURNOS`, los que pasa el Mantenimiento). Construido; vive en cada navegador.
- ✅ **P9. Dónde aparece al ser detectado.** Respondido 2026-09-19: donde lo detectaron.
- ✅ **P10. La ficha del que está en sigilo.** Respondido 2026-09-19: el GM **no** la ve. Tiene un botón con un ojo 👁 que revela todos los ítems y personajes ocultos (pronto habrá trampas); al apretarlo, los jugadores reciben un aviso muy evidente: mensaje en la Mesa con fondo rojo y un efecto tipo filtro rojo de la muerte con un ojo grande en el centro que aparece de golpe y se apaga con fade en 1–2 s (idea: PNG de ojo de Sauron con fondo transparente, a conseguir).
- ✅ **P11. Tiradas en la Mesa del que está en sigilo.** Respondido 2026-09-19: sus tiradas se ven en la Mesa.
- ✅ **P12. Sigilo como estado alterado.** Respondido 2026-09-19: en principio sí.

## Orientación y campo de visión (mapa)

- ✅ **P13. Grilla.** Resuelto (2026-09-17): la grilla se giró a "de lado arriba" y los tokens miran a uno de los 6 lados.
- ✅ **P14. Girar cuesta No2.** Respondido 2026-09-19: sí, **1 No2 por giro de 60° y solo en combate** (en narrativo es gratis), abierto a debate. Construido en el mapa (COSTO_GIRO_NO2). Caminar deja al token mirando hacia donde fue, gratis (P15). Lo de "cada movimiento que desbloquee niebla cuesta 1 No2" se dejó de lado ("lo pasamos por alto"). **Actualización 2026-09-19:** en combate, después de moverse el token elige hacia dónde queda mirando gratis (su primer giro, o quedarse como llegó); esa ventana se cierra con cualquier acción posterior, propia o ajena; desde ahí cada giro cuesta 1 No2.
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
- 🔲 **P28. Estados que tocaban Acciones/Movimiento.** Cansado, Exhausto, Stun, Hypeado, Inmovilizado y Rengo pasaron a Nitros 1 a 1, sin recalibrar. ¿Qué valores llevan? *(código)*
- 🔲 **P29. SP Regen como stat.** Hoy existe con base 0 (solo lo dan habilidades, equipo o estados). ¿Se deja así o se saca el stat? *(2026-09-16)*
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
