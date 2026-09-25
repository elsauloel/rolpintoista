# docs/

## Qué es

Notas generales del proyecto que no son responsabilidad de ninguna
herramienta puntual: cómo funciona la sincronización con GitHub que usan
todas por igual, y cualquier otra nota de workflow que no encaje en el
`CLAUDE.md` de una carpeta específica.

## Estado actual

[`preguntas-abiertas.md`](preguntas-abiertas.md) junta todas las preguntas
de diseño sin decidir (regla general: toda pregunta abierta se anota ahí).
[`rework-armas.md`](rework-armas.md) es la hoja de trabajo del rework de armas (preguntas en orden con propuestas y respuestas). [`rework-armas-revision.md`](rework-armas-revision.md) es la hoja para marcar qué armas del catálogo actual se conservan, reajustan o descartan (P11). [`hoja-de-ruta-rework-catalogo.md`](hoja-de-ruta-rework-catalogo.md) es la hoja de ruta del rework del catálogo (fases, lo decidido y lo pendiente). [`guia-de-diseno.md`](guia-de-diseno.md) es la guía de campos de juego y mecánicas por familia de arma / elemento (borrador vivo, para diseñar skills y equipos). [`herramientas-de-diseno.md`](herramientas-de-diseno.md) lista los tipos de efecto y conceptos a tener a mano para el rework de skills y equipos (niebla y visibilidad, efectos sobre la iniciativa, "equipo" incluye armas).
[`plan-sistema-nuevo.md`](plan-sistema-nuevo.md) tiene las decisiones y el estado del
sistema nuevo; [`workflow-firebase.md`](workflow-firebase.md), cómo está armado Firebase.

Con contenido básico: [`workflow-github.md`](workflow-github.md) documenta
el patrón de sincronización (token, `gestor.html`, API de contenidos) que
comparten `ficha-personaje/ficha.html`, `gm-toolset/gm-tools.html`,
`gm-toolset/vendor-generator.html`, `manual-usuario/manual.html` y
`datos/catalogo-editor.html`. Se va a ir sumando más a medida que haga
falta — no hay un formato fijo para lo que va acá, es notas.

## Dependencias con otras carpetas

Ninguna directa — documenta comportamiento del resto del repo pero no
tiene código propio.
