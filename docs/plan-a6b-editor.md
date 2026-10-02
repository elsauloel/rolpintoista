# Hoja de ruta A6b — el editor de la ficha, común (2026-10-02)

> Parte de la hoja de ruta A ([`pendientes.md`](pendientes.md) §0, punto 6: "todo al mapa, editor incluido", decidido por el dueño:
> "lo más prolijo al final, aunque sea largo"). Criterio: **una sola pieza común** que usan la ficha y el mapa; la ficha queda con
> atajos de una línea; nada de copias "por ahora". Cada tanda se prueba (pruebas.html en verde + en vivo) y se sube.

## ▶ Para retomar

- **Hecho**: b0 (✚ Revivir).
- **Sigue**: b1.
- Antes de cada tanda: `git status`, `git log --oneline -5`; después: `comun/pruebas.html` en verde, prueba en vivo en
  "Test con claude elsaulo" (GM con 🎮 Silvia, fichaId `auUUMObQv3EVeeWgwh7c`), subir `?v=` de cada archivo tocado.

## Qué es "el editor de la ficha" (relevado 2026-10-02)

Todo vive hoy en `ficha-personaje/js/10-habilidades-pasivas-e-items.js` (y algo en `js/07`), atado a la ventana `#scrim` de
`ficha.html` (`#modal-title`, `#modal-body`, `#modal-save`, `#modal-del`, `#modal-catalogo`, `#modal-activar`):

- **`openEditor(key, id, equipadoPreset, opciones)`** + **`SCHEMA`/`CAMPO_LABEL`/`CAMPO_NUM`** (js/07): el formulario genérico
  para `inventario` (consumibles), `cinturon`, `catalogo`, `pasivas`, `sociales` (Talentos) y `efectos` (estados). Los ítems que
  no son consumibles se derivan al asistente común (`comun/asistente-item.js`, vía `abrirAsistenteItem`/`portadorFicha`).
- **`drawEditor`** (formulario) y **`drawEditorHabilidad`** (habilidades paso a paso: `PASOS_HAB`, `MODOS_HAB`, `pasosHabilidad`,
  `habilidadIrAPaso`), con sus secciones: `htmlEstadoAlUsar`, `htmlEstadoAlEquipar`, `trampaHtml` (+ `trampaAbrirAsistente`,
  `trampaPreconstruidas`, `trampaGuardarCampo`), `campoImagenHtml`, modificadores (`getModVal`/`setModVal`).
- **Los manejadores** de `#modal-body`: `handleModalFieldChange` (input/change), el clic (mods, estado al equipar, imagen, guardar
  como preset), el clic del paso a paso (modo, Nitros, Ejecución ✨, chips, Atrás/Siguiente) y Enter.
- **Guardar / Eliminar** (`#modal-save`, `#modal-del`): estados nuevos con `agregarEstadoConAviso`, consumible "equipado" → al
  cinturón, y después redibujar la lista (`renderInventario`, `renderList`, el catálogo).
- **Ventanitas que abre**: categoría de ítem (`#scrim-tipoitem`, `abrirTipoItem`), presets para "estado al usar"
  (`abrirPresetsEfecto('item')`, la grilla propia de la ficha), la Ejecución ✨ (`abrirEjecucionHab` → `AsistenteDueloHab`, ya
  común), el asistente de trampas (`AsistenteTrampa`, ya común), 📚 trampas preconstruidas (`Biblioteca`, ya común), ⬆ Subir al
  catálogo (`subirItemAlCatalogo` → `Biblioteca.guardar`).
- **Desde el mapa** hoy se llega por el **Editar del Ver** de la Botonera nueva (`bnAlMarco('editar-en-ficha')`, la ficha escondida
  toca su propio Editar) y por el **⚙ de un estado** del HUD (`abrirEditarEstado`, va a la ficha / GM Tools).

## Tandas

- [x] **b0. ✚ Revivir** (2026-10-02): `FichaAcciones.hpRevivir`/`revivir`; el mapa muestra el diálogo en la Botonera nueva
  (`abrirRevivirMapa`). Probado en vivo: Silvia en 0 → 50 % = 10/20 → valor neto 7 → revive con 7 y deja de estar inconsciente.
- [ ] **b1. Las tablas y los ayudantes puros** a `comun/ficha-editor.js` (`FichaEditor`): `SCHEMA`, `CAMPO_LABEL`, `CAMPO_NUM`, el
  borrador por defecto de `openEditor`, `getModVal`/`setModVal`, `itemComoEntradaDeCatalogo`, `PASOS_HAB`, `MODOS_HAB`,
  `pasosHabilidad`, `habLegado`. La ficha, atajos. Pruebas: el borrador, los pasos según el modo, setModVal.
- [ ] **b2. El dibujo**: `FichaEditor.html(S, ed)` (formulario y paso a paso, con estado al usar / al equipar, trampa, imagen, mods)
  → la ficha pone el HTML en `#modal-body`. Lo que dependía de variables de la ficha (job disponible, costo de ataque, slots) sale
  de `S` con las piezas comunes.
- [ ] **b3. Los manejadores y Guardar/Eliminar**: `FichaEditor.cambio(S, ed, t)`, `clic(S, ed, b, ui)`, `guardar(S, ed, ui)`,
  `eliminar(S, ed, ui)`; `ui` = lo que hace cada pantalla (redibujar, carteles, ventanitas). Las ventanitas (categoría, presets
  para "estado al usar", Ejecución, trampa, imagen) pasan por `ui` o por piezas comunes (`SelectorEstados` para los presets: una
  sola grilla en todos lados).
- [ ] **b4. El mapa**: la ventana del editor adentro de la Botonera nueva (`#bn-editor`), el Editar del Ver la abre (sin la ficha
  escondida); guardar con `bnUi`. Lo mismo para el asistente de ítems (`portadorFicha` → común).
- [ ] **b5. El ⚙ de un estado** del HUD para personajes e invocaciones abre el editor común en el mapa (los creeps van con la A6c).
- [ ] Documentar (CLAUDE.md de comun, ficha y mapa; pendientes §0) y sumar a la limpieza A′ lo que quede sin uso
  (`editar-en-ficha`, `abrir-revivir`).
