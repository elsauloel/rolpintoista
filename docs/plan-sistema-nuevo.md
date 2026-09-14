# Plan del sistema nuevo — Rol Pintoísta en vivo

Documento vivo: decisiones tomadas con el usuario y estado de cada paso.
Leerlo antes de trabajar en esta rama. Cómo está armado Firebase:
[`workflow-firebase.md`](workflow-firebase.md).

## Objetivo

Un "Roll20 propio" con solo lo que el grupo usaba, jugando cada uno desde
su casa:

- Mapa de hexágonos compartido. El GM puede ponerle una imagen de fondo
  (opcional, solo si sale simple).
- Tokens: cada jugador mueve los suyos, el GM mueve los de los creeps.
  Todos ven los movimientos al instante.
- Cada token conectado a su ficha: barra de vida, barra de SP (hoy
  "Bonos" en la ficha, puede renombrarse) e íconos de estados alterados.
- Chat de tiradas compartido desde los botones de ficha y gm-tools.
- Fichas y herramienta del GM en vivo: nada de "Subir datos"/"Bajar datos".

## Contexto y alcance

- **Rol Pintoísta** es el sistema/proyecto. **Piratas en el espacio** es
  la campaña que se juega hoy con la versión vieja (carpeta `rol`, rama
  `main`, sync por GitHub) y queda como archivo histórico. **No se migran
  sus personajes ni sus datos** y no hace falta convivir con ella.
- Trabajo en la carpeta `rol-nueva-version` (git worktree, rama
  `nueva-version`). Ahí el recordatorio "Traer última versión" está
  desactivado porque traería `main`.
- Sin backend propio ni build step: cada herramienta sigue siendo un
  `.html` que se abre con doble clic. Firebase (proyecto `rol-pintoista`,
  plan Spark gratis, sin tarjeta) es el backend en vivo.
- **Imágenes: solo las necesarias, y siempre que no compliquen**: retrato
  en la cabecera de la ficha, imagen propia de cada creep, miniatura de
  esas en el token vinculado, e imagen de fondo del mapa. Las de ítems,
  habilidades y catálogo quedan afuera por ahora.
- Catálogo, tienda, manual y `herramientas/*.py` quedan como están por ahora.
- El usuario no es técnico: explicarle en palabras simples y con pasos
  concretos en la consola de Firebase.

## Decisiones tomadas

- **Firestore** (no Realtime Database). SDK compat por `<script>`.
- **Entrada**: sesión anónima + código de campaña la primera vez por
  navegador. GM marcado a mano en la consola (`miembros/{uid}.gm`).
- **Datos agrupados por campaña**: `campanas/{id}/...`.
  `piratas-en-el-espacio` es por ahora solo espacio de pruebas.
- **Permisos** (impuestos en `firebase/firestore.rules`, no solo en la UI):
  - Cada ficha de PJ tiene dueño (`duenoUid`). Solo el dueño la modifica;
    todos los miembros la ven. Un jugador puede tener **varios personajes**.
  - El GM ve todas las fichas de PJ pero **no las modifica**; solo puede
    reasignar el dueño (para cuando alguien cambia de compu).
  - **La ficha de personaje es solo de jugadores.** El GM usa gm-tools para
    sus creeps y sus propios personajes (que son creeps con otro nombre:
    PNJ aliados, comerciantes…). Si el GM abre la ficha, solo mira.
  - **Stats iniciales en 1** (Con, Fue, Agi, Des, Int) para personajes,
    creeps e invocaciones nuevos; la vida arranca llena. En creeps, Hp.Max = Con×5 + mods de
    Hp.Max (equipo y estados), igual que en la ficha.
    En invocaciones, Hp.Max = Con×5 (se recalcula al terminar de editar Con).
  - Rol visible en la cajita Mesa ("· GM" / "· jugador"). Es por navegador.
  - Fichas de creeps: solo el GM las ve y modifica. Los jugadores ven de
    cada creep solo el token, la barra de vida y los estados.
  - El daño recibido lo aplica el dueño en su propia ficha.
  - Tiradas del GM: visibles para todos (tiradas secretas, más adelante).
  - **Vida de los creeps**: los jugadores solo ven cuán llena está la barra
    (se publica el porcentaje, no los números). Los creeps no tienen SP.
  - Barras: **vida roja, SP azul** (en tokens y Tablero).
- **Fichas en vivo, guardadas por partes** (recursos, estados, inventario,
  atributos…), con escrituras espaciadas (~1 s) por el tope diario del
  plan gratis.
- **Dados en el navegador de cada uno** (sin servidor que tire): aceptado
  entre amigos.
- **Sitio web con GitHub Pages** (gratis, repo público): se publica la rama
  `nueva-version` desde la raíz, en `https://elsauloel.github.io/rolpintoista/`
  (`index.html` con links a cada herramienta; `.nojekyll` para que GitHub
  sirva los archivos tal cual). Cada push a `nueva-version` se publica solo
  en 1–2 minutos, así que **solo se sube lo ya probado**. Cuando empiecen
  las partidas de verdad se puede pasar a publicar desde otra rama. Abrir
  por la web y abrir con doble clic son identidades distintas en Firebase:
  al pasar a la web cada uno vuelve a entrar con el código (el GM se
  remarca en la consola y reasigna los personajes si hace falta). En la web
  se oculta "Actualizar gestor" de la ficha. Abrir con doble clic sigue
  funcionando.
- **Botones de GitHub se eliminan** (no solo se desactivan) en el mismo
  paso en que Firebase los reemplaza. "Traer última versión"/`gestor.html`
  actualizan código, no datos: solo se van si se decide publicar las
  herramientas en una web (decisión pendiente; habilitaría también
  "Acceder con Google"). "Guardar ficha"/"Cargar archivo" local: se
  conserva como respaldo.

## Pasos

| Paso | Qué | Estado |
|---|---|---|
| 0 | Firebase: proyecto, auth anónima, código, reglas, página de prueba | ✅ Hecho y probado |
| 1 | Mesa: tiradas compartidas en vivo (cajita flotante en ficha y gm-tools) | ✅ Hecho y probado |
| 2 | Mapa de hexágonos (`vtt-hexgrid/mapa.html`) con tokens movibles en vivo y la Mesa al costado | ✅ Hecho y probado |
| 3 | Fichas y creeps en vivo: barras y estados en los tokens; se eliminan Subir/Bajar datos, Personajes y Tablero vía GitHub | ✅ Hecho y probado |
| 3a | Ficha guardada sola en Firebase por partes; Personajes lista los de la mesa (propios / de otros en solo lectura); se van Subir/Bajar datos | ✅ Hecho y probado |
| 3b | Creeps de gm-tools en vivo (con su imagen); se va "Subir datos" de gm-tools | ✅ Hecho y probado |
| 3c | Mapa: token vinculado a ficha/creep con barras de HP y SP, estados y miniatura; imagen de fondo del mapa; Tablero en vivo | ✅ Hecho y probado |

**Más adelante:** GM oculta tokens/tiradas, tiradas secretas, alcance y
movimiento en el mapa, niebla de guerra, imágenes (retratos, fondo),
publicar en una web, pasar catálogo/tienda/manual a Firebase.

## Pendientes chicos

- En `miembros` quedan documentos repetidos de pruebas en incógnito
  ("Pepe"): se pueden borrar desde la consola.
- `firebase/prueba-conexion.html` y la colección `prueba` se pueden quitar
  cuando ya no sirvan.

## Cómo se prueba cada paso

Dos ventanas (una normal como GM y una de incógnito como jugador), abriendo
los archivos de `rol-nueva-version` con doble clic. Commit y push a
`nueva-version` apenas un paso queda probado.
