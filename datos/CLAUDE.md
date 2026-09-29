# datos/

## Qué es

Todo el estado de partida y el catálogo compartido de la campaña, más el
editor HTML del catálogo. Formato de todo lo de acá: [`esquema.md`](esquema.md).

## Estado actual

En uso activo — es lo que se sincroniza en vivo durante las sesiones de
juego. Cuidado especial al tocar rutas acá: los tres HTML de
`ficha-personaje/` y `gm-toolset/` tienen las rutas de sincronización con
GitHub hardcodeadas como strings (`datos/personajes/...`,
`datos/tablero/...`, etc.) — moverlas requiere actualizar esos strings.

## Contenido

- **El catálogo de ítems ya no vive acá** (2026-09-29, paso 5 de `../docs/plan-subida-unificada.md`): la copia de
  fábrica es **`comun/catalogo.js`** (la única; ficha, GM Tools y la tienda la cargan directo) y lo que suben jugadores y
  GM con **⬆ Subir al catálogo** vive en Firebase (`biblioteca_items`). Se retiraron `catalogo.json`, el Excel
  (`assets/catalogo.xlsx`) y los importadores de Python (quedan en el historial del repositorio).
- **Auditoría 2026-09-20** (ver P88 en `docs/preguntas-abiertas.md`): la resistencia a crítico
  de las defensas se limitó por tier (Tipo 4 y 6 en Común; Tipo 10 y 12 solo
  en Excepcional/Legendario y de a 1) y el catálogo pasó a 611 ítems.
- **`catalogo-editor.html`** — el editor del catálogo de FÁBRICA: listado filtrable, alta/edición/borrado de ítems.
  Arranca con la copia del sitio y trae la última de GitHub; **💾 Guardar en el proyecto** reescribe `comun/catalogo.js`
  en la rama `nueva-version` (token de GitHub, el mismo de las otras herramientas), un ítem por renglón, y avisa si el
  archivo cambió desde que se trajo. Llega solo a las herramientas en 1–2 minutos. **⬇ Respaldo** baja una copia JSON.
  Todo lo que no es consumible (nuevo o existente) se edita con el
  asistente paso a paso compartido `comun/asistente-item.js`
  (`abrirAsistente`); su resumen deja pasar al formulario completo. Los
  consumibles usan el formulario.
- **`personajes/`** — personajes jugables (`*.json`), sus backups
  fechados (`backups/`) y retratos (`retratos/`, solo para referencia —
  los retratos reales viajan embebidos en base64 dentro del JSON del
  personaje). Lo escribe `ficha-personaje/ficha.html` (botón Subir datos).
- **`tablero/`** — una tarjeta de estado de combate por jugador
  (`<slug>.json`), efímero: se pisa cada vez que alguien publica su turno.
  Lo escribe la ficha, lo leen tanto la ficha como gm-tools.html para
  armar el panel de Tablero.
- **`creeps-publico.json`** — estado recortado de los creeps del GM (HP,
  estados, sin datos privados). Lo escribe `gm-tools.html`.
- **`tienda-publica.json`** — la tienda generada y publicada por
  `vendor-generator.html`. La lee la ficha (botón Vendedor).
- **`manual.json`** — el manual compilado (lo genera
  `herramientas/compilar_manual.py` desde `manual-usuario/notas/`). Ver
  [`../manual-usuario/CLAUDE.md`](../manual-usuario/CLAUDE.md).
- **`reglas.json`** — el borrador viejo del manual; archivo histórico, ya no
  se usa.
- **`esquema.md`** — referencia de formato de todo lo de arriba.
- **`auditoria-armas.html`/`auditoria-defensa.html`/`auditoria-creeps.html`** — auditorías de **decisión**: tarjetas
  de solo lectura con ✅ Confirmar / 🔧 Reajustar / 🔄 Reimaginar / 🗑 Descartar + una nota, guardadas en este
  navegador y subibles a un JSON de auditoría (`btn-guardar`, mismo token `gh-token`) para que una conversación
  las lea y aplique después — no editan nada directo.
- **`auditoria-skills.html`** (2026-09-29, pedido del dueño) — **distinta de las tres de arriba**: acá se **edita
  de una** cada skill de `comun/skills-clase.js` (las 7 clases + el pool `SKILLS_CUSTOM`, fuera de clase), sin el
  sistema de 4 botones — nombre, descripción, costo, el sistema simple (tirada/efecto propio/zona/portal) y, con
  **⚔/✨ Configurar Ejecución**, el mismo asistente paso a paso que usa `ficha-personaje/ficha.html`
  (`comun/asistente-duelo-hab.js`, cargado tal cual — sin el selector real de presets de estados en el paso
  Efectos, que por ahora queda en modo manual, ver su comentario). **💾 Guardar en el proyecto** escribe DIRECTO
  a `comun/skills-clase.js` en la rama `nueva-version` (no pasa por un JSON de decisiones intermedio): regenera
  todo desde `const CLASES_SKILLS = ` en adelante conservando el comentario de cabecera y `skillSA` tal cual
  estén en el archivo en ese momento. Guarda solo la **plantilla** de una habilidad (`limpiarHab`, ver
  `../docs/plan-subida-unificada.md`) con **una habilidad por renglón** (`serializarSkills`/`lineaHab`; las sin
  auditar que son solo título + descripción salen como `skillSA(…)`) — verificado que cargar y volver a guardar
  deja el archivo idéntico. Si el archivo cambió desde que se abrió la página (otra conversación guardó), avisa
  antes de pisarlo (`cuerpoAlCargar`). Autoguarda un borrador en este navegador (recuperable si se cierra sin
  publicar) y tiene ⬇/⬆ para respaldo aparte. **"+ Nueva skill..."** por clase o en el pool custom arranca una
  skill vacía y abre su editor. (El filtro "🔍 A auditar" se sacó el 2026-09-29 junto con el 📤 de la ficha que
  lo alimentaba; la auditoría de lo que suben los jugadores va a ser el paso 6 del plan.)
  **Clasificación por función y tipo de daño** (2026-09-29, pedido del dueño, pensado para navegar el pool
  custom a medida que crece): cada skill tiene una sección "Clasificación" con chips para tildar **Función**
  (mismo vocabulario que ya usa `comun/skills-creep-base.js` para las habilidades de creep: daño, defensa, buff,
  debuff, curación, control, movilidad, invocación, área — reusado a propósito, no uno nuevo) y **Tipo de daño**
  (mismo `TIPOS` del paso «Daño» del asistente: arcano, fuego, hielo, rayo, físico); las dos viven juntas en
  `h.etiquetas` (un array de strings), separadas solo para mostrarlas y filtrarlas. La cabecera suma dos
  `<select>` (Función / Tipo de daño) que filtran la lista junto con los de siempre. **El mismo filtro aparece
  en la ficha**, al abrir "+ Habilidad → 🧩 Pool custom" — ver `ficha-personaje/CLAUDE.md`.
  **Tercer grupo, "Mecánicas especiales"** (mismo día, pedido del dueño): `MECANICA_TAGS` (lista abierta, hoy
  solo `'critical matters'` — ver `comun/CLAUDE.md`, "⚡ Critical Matters") marca una skill que usa un andamiaje
  puntual del duelo, más allá de la función o el tipo de daño; mismo mecanismo de chips + `h.etiquetas` +
  `<select id="f-mecanica">` que los otros dos grupos, sin tocar nada de la clasificación existente. Es manual
  (no se autodetecta de `duelo.critico`, a propósito — mismo criterio "avisa, no impone" del resto de la
  clasificación): hay que tildarla a mano al auditar la skill.

## Dependencias con otras carpetas

- `herramientas/` — el pipeline Python que mantiene `catalogo.json`
  sincronizado con `assets/catalogo.xlsx` y con los tres HTML de juego.
- `ficha-personaje/`, `gm-toolset/` — todos leen y escriben algo de acá
  vía la API de contenidos de GitHub (no filesystem directo).
- **Nombres propios del equipo de los humanos** (2026-09-20): ver `gm-toolset/CLAUDE.md`; el catálogo pasó a 665 ítems (54 clones con nombre inspirado en el creep).
