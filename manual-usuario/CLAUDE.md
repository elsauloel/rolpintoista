# manual-usuario/

## Qué es

Manual de reglas y explicaciones de la campaña, para que los jugadores lo
consulten sin depender de que alguien se acuerde de explicarlo de nuevo.

## Estado actual

**En construcción, sin contenido real todavía.** `manual.html` y
`../datos/reglas.json` están listos y funcionan, pero `reglas.json` solo
tiene un capítulo de ejemplo ("Cómo se usa este manual") que explica el
patrón de edición — no hay reglas de la campaña cargadas. El contenido se
va a ir sumando de a poco, capítulo por capítulo, sin tener que tocar el
HTML cada vez.

## Lógica principal

`manual.html` es puramente navegación + editor: un índice lateral
(capítulos → secciones, colapsable) y un panel de contenido. El modo
Editar (botón ✏) revela formularios para crear/renombrar/borrar capítulos
y secciones, y una textarea por sección. No tiene lógica de juego —a
diferencia de la ficha o gm-tools, no calcula nada, solo muestra y edita
texto.

El renderizado del contenido (`cuerpoHtml()`) es texto plano con dos
convenciones: línea en blanco = párrafo nuevo, línea que empieza con
`"- "` = ítem de lista. No es Markdown completo a propósito, para no tener
que sumar una librería externa a una herramienta que debe seguir siendo
un único archivo standalone.

## Formato de datos

Consume y produce `../datos/reglas.json` — ver
[`../datos/esquema.md`](../datos/esquema.md), sección "Manual del jugador".
Mismo patrón de Guardar (descarga el `.json`) / Cargar archivo / Subir
datos / Traer última versión (sincroniza con GitHub, mismo token
guardado en `localStorage` que usan las demás herramientas) que el resto
de la campaña.

## Dependencias con otras carpetas

- `../datos/reglas.json` — su única fuente de contenido.
- Ninguna dependencia de `ficha-personaje/` ni `gm-toolset/`: es
  autónomo, no lee ni escribe nada del estado de partida.
