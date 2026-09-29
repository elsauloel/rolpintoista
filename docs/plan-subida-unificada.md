# Plan: subida unificada de elementos

> Hoja de trabajo para retomar desde cualquier conversación. Empezado el 2026-09-29.
> Estado de cada paso al final. Antes de tocar código de "subir / bajar / auditar", leer esto.

## Objetivo (dicho por el dueño)

Los cuatro amigos que juegan son también quienes desarrollan. Mientras juegan, cualquiera edita un
elemento — una habilidad, una habilidad de creep, un creep, un ítem, una pasiva, una trampa… — con
**toda** su configuración, incluida la automatización (la Ejecución paso a paso del duelo, que es lo
que más tiempo lleva), y toca **"Subir"** desde donde esté (ficha, GM Tools, mapa). Queda disponible
para todos. Quien lo baje recibe **exactamente lo mismo**. Después hay una auditoría de lo subido.

**El mecanismo es el mismo para cualquier tipo de elemento.**

## Decisiones tomadas (2026-09-29)

1. **Lo subido queda disponible al instante** para los cuatro, marcado "sin auditar". No espera aprobación.
2. **Audita solo el dueño** (rolpintoista@gmail.com, igual que la Biblioteca de hoy). Los otros tres suben.
3. **Si se corrige un original, las fichas que ya tienen una copia no cambian solas**: les aparece un
   aviso tipo "hay una versión nueva, ¿actualizar?".
4. **Base de fábrica + lo subido**: lo que hoy vive en archivos de código (`comun/skills-clase.js`,
   `comun/creeps-base.js`, `comun/skills-creep-base.js`, `comun/pasivas.js`, `comun/trampas-base.js`,
   `datos/catalogo.json`) queda como base de fábrica. Lo que suben los jugadores vive en la base de datos
   en vivo (Firebase), sin tokens de GitHub y sin la caché de 10 minutos del sitio publicado. Cada tanto
   una conversación puede pasar lo aprobado a código, si hace falta.
5. **Se parte de la Biblioteca que ya existe** (`comun/biblioteca.js`: `propuestas_<tipo>` →
   aprobación → `biblioteca_<tipo>`), no de un mecanismo nuevo en paralelo.

## Cómo estaba el andamiaje (auditoría del 2026-09-29)

| Elemento | Dónde vive | Cómo se subía | ¿Viajaba toda la configuración? |
|---|---|---|---|
| Habilidades de clase / pool custom | `comun/skills-clase.js` (código, GitHub) | 📤 de la ficha escribiendo directo en GitHub, con token (hecho y **retirado** el 2026-09-29) | Sí, pero con campos basura, duplicados y caché |
| Habilidades de creep, creeps, pasivas, trampas | Firebase, Biblioteca | "Guardar en la biblioteca" → propuesta → el dueño aprueba | Sí |
| Ítems | `datos/catalogo.json` en la rama `main` | "📦 Agregar al catálogo", con token | No llega a las herramientas hasta correr `importar_json.py` |
| Presets de estados | Copiados en `ficha.html` (`EFECTOS_PRESET`), `gm-tools.html` (`ESTADOS_PRESET_GM`) y `comun/estados-aplicar.js` | No se suben | — |

Problemas encontrados:
- **Tres maneras distintas de "subir"**, una por tipo de elemento.
- **Caché de hasta 10 minutos** del sitio publicado para los `comun/*.js` cargados con `<script src>`:
  una ficha abierta en ese rato baja la versión anterior (de la skill o del propio código).
- **Campos basura**: al subir una habilidad desde la ficha viajaban ~40 campos que no son de una
  habilidad (peso, ranuras, equipado, `usadaEsteTurno`…), heredados del editor genérico de la ficha
  (`openEditor`, plantilla en blanco con todos los campos de todos los tipos).
- **Duplicados con el mismo nombre** (cuatro "Lisiar" en el pool custom).
- **La herramienta de auditoría podía pisar lo que otro subía** (guardaba lo que tenía cargado).
- **Pregunta confusa** "¿pisar la original o guardar como nueva?" con Aceptar/Cancelar del navegador.

## Plantillas (qué datos viajan de cada elemento)

### Habilidad de jugador (clase o pool custom) — definida

`id, nombre, detalle, automatizada, etiquetas` · `costo, nitrosCosto, hpCosto, turnoAjenoSp` ·
`tiradaStat, tiradaBono, tiradaExtra, curaHp` · `efectoNombre, efectoTurnos, efectoHpTurno, efectoEscudo,
efectoStacks, efectoPermanente, efectoMods, efectoDetalle` (solo si hay `efectoNombre`) ·
`zonaMapa, zonaRadio, portalMapa, trampaColocar` · `duelo` (la Ejecución completa, incluido Critical Matters).

No viaja: lo propio del personaje (`job, jobCosto, origen, imagen, habClaseId, habClase`), el estado del
turno ni campos de otros tipos de elemento. Implementado hoy en `limpiarHab` de `datos/auditoria-skills.html`
(y en el script con que se limpió el archivo); en el paso 1 pasa a un archivo compartido.

### Habilidad de creep, creep, pasiva, trampa, ítem, estado — a definir en su paso

## Pasos

| # | Paso | Estado |
|---|---|---|
| 0 | **Ordenar lo que hay** | En curso |
| 0a | Retirar el 📤 que escribía directo en GitHub (camino paralelo) | ✅ 2026-09-29 |
| 0b | Limpiar `comun/skills-clase.js`: una habilidad por renglón, sin campos basura; Lisiar consolidada en Asalto (la versión con Critical Matters bien armado); pool custom vacío | ✅ 2026-09-29 |
| 0c | `datos/auditoria-skills.html` guarda con la plantilla y el mismo formato (ida y vuelta idéntica), y avisa si el archivo cambió desde que se abrió; sale "🔍 A auditar" (dependía del 📤) | ✅ 2026-09-29 |
| 0d | Juntar las tres copias de los presets de estados en un solo archivo de `comun/` | Pendiente |
| 0e | Plantillas del resto de los elementos (este documento) | Pendiente |
| 1 | **Mecanismo único**: extender la Biblioteca — un "Subir" y un "Bajar" genéricos por tipo, con la plantilla de cada tipo; lo subido disponible al instante, marcado "sin auditar"; aviso de versión nueva en las copias | Pendiente |
| 2 | Habilidades de jugador sobre ese mecanismo (botón Subir en la ficha, "+ Habilidad" lee base + lo subido) | Pendiente |
| 3 | Habilidades de creep y creeps (ya usan la Biblioteca: alinearlos a la plantilla y al "al instante") | Pendiente |
| 4 | Pasivas y trampas | Pendiente |
| 5 | Ítems (el más enredado: rama `main`, Excel, `importar_json.py`, catálogo copiado adentro de los HTML) | Pendiente |
| 6 | **Una sola pantalla de auditoría** para todo lo subido: ver, comparar con el original, editar, aprobar o descartar | Pendiente |
