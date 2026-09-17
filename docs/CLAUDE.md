# docs/

## Qué es

Notas generales del proyecto que no son responsabilidad de ninguna
herramienta puntual: cómo funciona la sincronización con GitHub que usan
todas por igual, y cualquier otra nota de workflow que no encaje en el
`CLAUDE.md` de una carpeta específica.

## Estado actual

[`preguntas-abiertas.md`](preguntas-abiertas.md) junta todas las preguntas
de diseño sin decidir (regla general: toda pregunta abierta se anota ahí).
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
