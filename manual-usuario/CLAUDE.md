# manual-usuario/

## Qué es

Manual de reglas y explicaciones de la campaña, para que los jugadores lo
consulten sin depender de que alguien se acuerde de explicarlo de nuevo.

## Estado actual

**Work in progress con contenido real.** `../datos/reglas.json` tiene
cargado el borrador del manual de Rol Pintoísta tal cual lo redacta el
usuario (incluye marcas ✅/🟡/🔲 y preguntas abiertas, a propósito). La
fuente es un `.md` que el usuario mantiene fuera del repo
(`Desktop\borrar\manual-usuario-rol-pintoista.md`); se reimporta con el
botón "Importar .md…" de la página (reemplaza todo el manual).

## Lógica principal

`manual.html` es puramente navegación + editor: un índice lateral
(capítulos → secciones, colapsable) y un panel de contenido. El modo
Editar (botón ✏) revela formularios para crear/renombrar/borrar capítulos
y secciones, y una textarea por sección. No tiene lógica de juego —a
diferencia de la ficha o gm-tools, no calcula nada, solo muestra y edita
texto.

El renderizado del contenido (`cuerpoHtml()`) es un Markdown simplificado
hecho a mano (sin librerías): párrafos, listas `- ` y `1. `, tablas
`| a | b |`, citas `> `, títulos `###`, `---`, `**negrita**`, `*cursiva*`
y `` `código` ``. Solo lo que usa el documento del manual.

`markdownAManual()` convierte un `.md` entero: `#` = título del manual,
`##` = capítulo, `###` = sección; el texto antes del primer `###` de un
capítulo va a una sección "General" (o con el nombre del capítulo si no
hay otras).

Al abrirse por http (sitio web / servidor local) lee primero
`../datos/reglas.json` de al lado; con doble clic (file://) se cae a
GitHub como antes. Ojo: "Subir datos" y "Traer última versión" siguen
apuntando a la rama `main` del sistema viejo.

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
