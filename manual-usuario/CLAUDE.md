# manual-usuario/

## Qué es

El manual del Rol Pintoísta, escrito para que jugadores y GM lo consulten sin
depender de que alguien se acuerde de explicarlo. Funciona como un **vault de
Obsidian**: notas cortas enlazadas con `[[wikilinks]]`, buscador de palabras
clave, etiquetas, "se menciona en" (backlinks), vista previa al pasar el
mouse, un mapa (grafo) de cómo se conectan las notas y una pantalla de
**Pendientes** con todas las preguntas abiertas. Tono: didáctico y amigable
(voseo). Encaja con la esencia del proyecto: ver [`../CLAUDE.md`](../CLAUDE.md).

## Estado actual

Primera versión completa escrita el 2026-09-20 (13 capítulos, ~110 notas) a
partir de todo lo decidido hasta ahora. Lo que no estaba definido quedó
marcado con recuadros `> [!question]` (se juntan en 📌 Pendientes) para que el
dueño los vaya completando. Cada nota lleva estado: confirmado, borrador o
pendiente.

## Cómo se edita

1. **Las notas viven en `notas/*.md`**, un archivo por capítulo (`01-empezar.md`,
   `02-mundo.md`…; el prefijo numérico da el orden). Dentro van varias notas,
   cada una con su cabecera entre líneas `+++`:
   `titulo`, `alias: [..]`, `tags: [..]`, `estado`. La primera cabecera de un
   archivo lleva `capitulo`, `icono` y `resumen` (los del capítulo).
2. **Compilar**: `python herramientas/compilar_manual.py` → escribe
   `datos/manual.json` y lista los enlaces `[[..]]` que apuntan a notas que no
   existen ("por escribir", como en Obsidian).
3. **Subir** `datos/manual.json` junto con los `.md`. `manual.html` solo lee.

Reglas de escritura: `[[Nota]]`, `[[Nota|texto]]`, `[[Nota#Sección]]` (en una
tabla, la barra va escapada: `\|`); callouts `> [!tip]`, `> [!warning]`,
`> [!example]`, `> [!info]`, `> [!question]` (= duda abierta, va a Pendientes).
No usar `+++` al principio de una línea dentro del texto (es el separador).

## Lógica de `manual.html`

Página estática sin librerías. Carga `../datos/manual.json` (por http) y, si
falla (doble clic / sin conexión), lo baja de GitHub (rama `nueva-version`).
Arma índices al cargar: nombre/alias normalizados (sin acentos ni mayúsculas) →
nota, enlaces salientes y entrantes, texto plano para buscar. Ruteo por hash:
`#/nota/<id>[/<sección>]`, `#/buscar/<q>`, `#/etiqueta/<t>`,
`#/capitulo/<id>`, `#/pendientes`, `#/az`, `#/falta/<nombre>`.
`md()` es un Markdown propio (títulos, listas anidadas, tablas, citas,
callouts, código, wikilinks). El grafo es un canvas con fuerzas simples.
Atajos: `/` busca, Alt ←/→, Esc cierra. Ya no hay modo de edición en la
página (se edita el `.md`).

## Formato de datos

Consume `../datos/manual.json` — ver [`../datos/esquema.md`](../datos/esquema.md),
sección "Manual". No depende de la ficha, gm-tools ni Firebase: es público y
no pide iniciar sesión.

## Dependencias con otras carpetas

- `../herramientas/compilar_manual.py` — el compilador.
- `../datos/manual.json` — su única fuente en runtime.
