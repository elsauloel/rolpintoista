# Hoja de ruta A6c — el editor de creeps, común (2026-10-02)

> Parte de la hoja de ruta A ([`pendientes.md`](pendientes.md) §0, punto 6). Mismo criterio que la A6b
> ([`plan-a6b-editor.md`](plan-a6b-editor.md)): una sola pieza común que usan GM Tools y el mapa, GM Tools con atajos, cada tanda
> probada (pruebas.html en verde + en vivo) y subida.

## ▶ Para retomar

- **Hecho**: todo (c1–c3, 2026-10-02). La A6c está terminada.
- Antes de cada tanda: `git status`, `git log --oneline -5`. Probar primero en local (`.claude/launch.json` → "archivos", puerto 8765:
  `comun/pruebas.html`), después en "Test con claude elsaulo" (GM; creep de prueba `nvjcz6l`, token `QQUKbhYKfI1JcXBzj0rp`).

## Alcance (relevado 2026-10-02)

Lo que el mapa todavía le pide a GM Tools escondido en el marco (`acDelegar` en `vtt-hexgrid/js/12`, `abrirAcciones(…, {tipo:
'editar-estado'})` en `js/10`):

1. **✎ Editar una habilidad de un creep** (el Ver de la habilidad en las Acciones nuevas): el editor paso a paso de GM Tools —
   `PASOS_HAB_CREEP`, `hcOrden`, `hcMostrarPaso`, `hcModosRender`, `hcEjecucionRender`, `hcAbrirEjecucion`, `hcAplicarModoNitros`,
   `hcOpcionesStat` (js/04), la trampa (`hcTrampa*`), `hcResumenHtml`, `abrirEditorHabCreep`, `guardarEditorHabCreep` (js/05), sus
   manejadores (js/06) y la ventana fija `#scrim-hab-creep` (gm-tools.html, ~100 líneas con campos `#hc-*`).
2. **⬆ Subir** (`proponerHabilidadABiblioteca`) y **↻ Reemplazar** (`abrirCatalogoHabilidades(scId, reemplazarId)`, `habDeBiblioteca`).
3. **⚙ de un estado de un creep** (el HUD): `abrirEditorEstadoCreep`, `renderEcMods`, `actualizarBotonesPresetEc`,
   `forzarNitrosDelEditor`, `guardarEditorEstadoCreep` (js/05) y la ventana `#scrim-estado-creep`.

**Fuera de alcance, a propósito**: la ficha completa del creep (`cardHtml`, el asistente de creep, equipar del catálogo, recompensas…).
Es la pantalla propia de GM Tools; el mapa la abre en otra pestaña ("✎ Editar en GM Tools") — no pasa por el marco escondido, así que no
bloquea la limpieza A′. Si más adelante se quiere editar el creep entero adentro del mapa, sería una A6d.

## Tandas

- [x] **c1. El editor de habilidades de creep** (2026-10-02; probado: GM Tools crea una habilidad nueva con el componente —modo, costo de
  ataque → PdG, estado de la lista—; el mapa la edita desde el Ver —cooldown 3— y queda en Firebase sin pasar por GM Tools) a `comun/creep-editor.js` (`CreepEditor`): un componente como `FichaEditor.crear` que arma
  su propia pantalla (la de `#scrim-hab-creep`, con `data-hc` en vez de ids) adentro de lo que le dé cada pantalla, con `ctx` = {creep(),
  cambiar(fn), toast, …}. GM Tools lo usa en vez de su ventana fija (atajos); el mapa, adentro del recuadro de las Acciones nuevas, y guarda
  con `modificarCreep`.
- [x] **c2. ⬆ Subir y ↻ Reemplazar** (2026-10-02; probado en el mapa: Reemplazar abrió la biblioteca con su título, «Golpe fuerte» quedó
  en el lugar de la vieja con su origen; Subir abre el cartel de la biblioteca —cancelado, para no subir una de prueba—) de una habilidad de creep: comunes (`Biblioteca` ya lo es); el mapa los hace sin GM Tools.
- [x] **c3. El editor de un estado de creep** (2026-10-02): `CreepEditor.crearEstado`; GM Tools lo usa con sus "Mis presets" (y el
  "formulario completo" del asistente de estados le pasa `inicial`); el ⚙ del HUD de un creep lo abre en el mapa (`abrirEditarEstadoCreepMapa`,
  sin "Mis presets": pendientes 7b). Probado: en GM Tools, Quemadura 2 → 4 turnos; en el mapa, el ⚙ de Pajaritos → 3 turnos en Firebase, sin
  GM Tools, y las Acciones (abiertas solo para eso) se cerraron solas.
- [x] Documentado y sumado a la limpieza A′: `acDelegar`/`acciones-delegar` (y el `boton` de `verhab-*`), el `editar-estado` de un creep.
