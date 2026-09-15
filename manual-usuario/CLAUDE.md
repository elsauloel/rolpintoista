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
GitHub (rama `nueva-version`).

Botonera: en lectura solo se ve "✏ Editar". En modo edición aparecen
"Importar .md…", "Descargar copia" (baja `reglas.json` de respaldo) y
"Publicar cambios", que sube `datos/reglas.json` a la rama `nueva-version`
por la API de GitHub (pide el token solo si no hay uno o venció) — y con
eso se actualiza el sitio web. Ojo: después de publicar desde la página,
la copia local del repo queda atrás; hacer `git pull` antes de tocar
`reglas.json` a mano.

En pantalla ancha el índice y el contenido scrollean por separado (el
body ocupa exactamente la altura de la ventana); en celular scrollea la
página entera como siempre.

## Formato de datos

Consume y produce `../datos/reglas.json` — ver
[`../datos/esquema.md`](../datos/esquema.md), sección "Manual del jugador".
El token de GitHub se guarda en `localStorage` (`gh-token`), mismo que
usaban las demás herramientas.

## Dependencias con otras carpetas

- `../datos/reglas.json` — su única fuente de contenido.
- Ninguna dependencia de `ficha-personaje/` ni `gm-toolset/`: es
  autónomo, no lee ni escribe nada del estado de partida.
