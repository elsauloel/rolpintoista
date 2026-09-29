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

- **`catalogo.json`** — el catálogo de ítems, fuente única. Se edita con
  `catalogo-editor.html` (acá mismo), con `assets/catalogo.xlsx`, o desde
  el botón "📦 Agregar al catálogo" que tienen `ficha-personaje/ficha.html`
  (editor de ítems de Mochila/Equipo/Cinturón) y `gm-toolset/gm-tools.html`
  (modal de Ítem custom) — un jugador o el GM pueden publicar ahí mismo,
  con confirmación, un ítem que crearon en la mesa. Los tres caminos
  conviven y convergen acá vía `herramientas/importar_json.py` /
  `herramientas/importar.py`. Ver `herramientas/LEEME.md` para el flujo
  completo — **nunca se edita este archivo a mano ni se edita el catálogo
  embebido en los HTML de juego directamente**, siempre por ese pipeline.
- **Auditoría 2026-09-20** (ver P88 en `docs/preguntas-abiertas.md`): la resistencia a crítico
  de las defensas se limitó por tier (Tipo 4 y 6 en Común; Tipo 10 y 12 solo
  en Excepcional/Legendario y de a 1) y el catálogo pasó a 611 ítems.
- **`catalogo-editor.html`** — la herramienta de edición: listado
  filtrable, alta/edición/borrado de ítems, mismo patrón de Guardar/Cargar
  archivo/Subir datos/Token que el resto de las herramientas de la
  campaña. Después de editar, hay que correr `importar_json.py` para que
  los cambios lleguen a `ficha.html`/`gm-tools.html`/`vendor-generator.html`
  — el editor no lo hace solo (es HTML puro, no puede ejecutar Python).
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
  estén en el archivo en ese momento. Autoguarda un borrador en este navegador (recuperable si se cierra sin
  publicar) y tiene ⬇/⬆ para respaldo aparte. **"+ Nueva skill..."** por clase o en el pool custom arranca una
  skill vacía y abre su editor. Las skills marcadas `auditar: true` (llegaron de "📤 Guardar en sistema" desde
  una ficha, ver `ficha-personaje/CLAUDE.md`) se ven con una chip roja "🔍 A auditar"; el filtro de la cabecera
  las aísla para revisarlas una por una.

## Dependencias con otras carpetas

- `herramientas/` — el pipeline Python que mantiene `catalogo.json`
  sincronizado con `assets/catalogo.xlsx` y con los tres HTML de juego.
- `ficha-personaje/`, `gm-toolset/` — todos leen y escriben algo de acá
  vía la API de contenidos de GitHub (no filesystem directo).
- **Nombres propios del equipo de los humanos** (2026-09-20): ver `gm-toolset/CLAUDE.md`; el catálogo pasó a 665 ítems (54 clones con nombre inspirado en el creep).
