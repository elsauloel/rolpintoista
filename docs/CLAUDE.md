# docs/

## Qué es

Notas generales del proyecto que no son responsabilidad de ninguna
herramienta puntual: cómo funciona la sincronización con GitHub que usan
todas por igual, y cualquier otra nota de workflow que no encaje en el
`CLAUDE.md` de una carpeta específica.

## Estado actual

[`metodo-diseno-encuentros.md`](metodo-diseno-encuentros.md) es **el método para diseñar encuentros y dungeons** (grupo → auditar creeps → encuentro contra el grupo → progresión → botín → probar; 2026-10-14, a partir de las Minas). Los **tips de estrategia para el GM** (que la pelea tenga ángulos, daño mágico para el tanque, las apuestas se cobran…; 2026-10-15) viven en el manual, para compartirlos: nota «Tips para el GM» en [`../manual-usuario/notas/11-gm.md`](../manual-usuario/notas/11-gm.md) — los nuevos se suman ahí. [`reporte-encuentro-origen-2026-10-22.md`](reporte-encuentro-origen-2026-10-22.md) (y su pelea narrada, `…-pelea.md`) es el **reporte del próximo encuentro de El origen simulado** con `herramientas/simulador-encuentro.html` (los tres jugadores reales contra goblins y kobolds de la partida: seis encuentros base, nueve variantes, la recomendación). [`origen-goblins-cultistas.md`](origen-goblins-cultistas.md) es la hoja de trabajo de **los goblins de la Grieta** (2026-10-27: los kobolds de El origen pasan a goblins bajo control de unos cultistas humanos; tres encuentros, solo skills auditadas). [`bosque.md`](bosque.md) es la hoja de trabajo del dungeon del Bosque (historia del ocultista y la esfera, progresión de 3 encuentros, estado creep por creep). [`pruebas-en-el-mapa.md`](pruebas-en-el-mapa.md) es la lista viva de **pruebas pendientes en el mapa** (protocolo del dueño, 2026-10-09: si no se puede probar en el mapa, no se prueba por detrás: se anota ahí). [`preguntas-abiertas.md`](preguntas-abiertas.md) junta todas las preguntas
de diseño sin decidir (regla general: toda pregunta abierta se anota ahí).
[`metodo-testeo-armas.md`](metodo-testeo-armas.md) es **el método para testear un tipo de arma en un tier** (cuando el dueño dice «toca testear tal tipo en tal calidad»; el ejemplo es [`revision-ballestas.md`](revision-ballestas.md)). [`ideas-arcos-flechas.md`](ideas-arcos-flechas.md) es la lluvia de ideas de arcos, flechas especiales y el carcaj (para podar); [`ideas-ballestas.md`](ideas-ballestas.md), la de ballestas y virotes (2026-10-10). [`balance-peleas.md`](balance-peleas.md) y [`balance-peleas-armadura-real.md`](balance-peleas-armadura-real.md): peleas simuladas entre arquetipos (2026-10-10; la segunda, con armaduras reales del catálogo); [`diagnostico-armadura-media.md`](diagnostico-armadura-media.md): la armadura media (P190), con la medición de A + B + D en `prueba-pesos-armadura*.md`. [`rework-armas-rango.md`](rework-armas-rango.md) es la hoja de debate de las armas de rango (2026-10-09: arcos con Fuerza, ballestas como varitas físicas, pólvora que no se esquiva). [`rework-armas.md`](rework-armas.md) es la hoja de trabajo del rework de armas (preguntas en orden con propuestas y respuestas). [`rework-armas-revision.md`](rework-armas-revision.md) es la hoja para marcar qué armas del catálogo actual se conservan, reajustan o descartan (P11). [`rework-tiendas.md`](rework-tiendas.md) es la hoja de trabajo del rework del generador de tiendas (y del archivado del catálogo viejo, 2026-10-06). [`hoja-de-ruta-rework-catalogo.md`](hoja-de-ruta-rework-catalogo.md) es la hoja de ruta del rework del catálogo (fases, lo decidido y lo pendiente). [`ideas-anillos.md`](ideas-anillos.md) es la lluvia de ideas de anillos nuevos (2026-10-18, para podar). [`rework-anillos.md`](rework-anillos.md) es la hoja de trabajo del rework de los anillos (2026-10-18: lo que hay, la propuesta de precios por familia y las preguntas). [`talismanes.md`](talismanes.md) junta las ideas para los talismanes (lo que va en la otra mano; en espera hasta que el dueño diga «sigamos con los talismanes»). [`guia-de-diseno.md`](guia-de-diseno.md) es la guía de campos de juego y mecánicas por familia de arma / elemento (borrador vivo, para diseñar skills y equipos). [`herramientas-de-diseno.md`](herramientas-de-diseno.md) lista los tipos de efecto y conceptos a tener a mano para el rework de skills y equipos (niebla y visibilidad, efectos sobre la iniciativa, "equipo" incluye armas).
[`plan-trabajo-remoto.md`](plan-trabajo-remoto.md) (2026-10-12, guardado sin empezar: no arrancar hasta que el dueño lo pida) es el plan para trabajar sin la compu prendida: Firebase Hosting desde GitHub, vistas previas, emulador, reglas de trabajo, testeo en la nube y costos.
[`plan-sistema-nuevo.md`](plan-sistema-nuevo.md) tiene las decisiones y el estado del
sistema nuevo; [`workflow-firebase.md`](workflow-firebase.md), cómo está armado Firebase.
[`plan-consolidacion.md`](plan-consolidacion.md) (2026-09-30, propuesta sin empezar): pasar a un solo motor de
reglas para personajes, invocaciones y creeps, con la ficha, GM Tools y el mapa como ventanas — por pasos, cuando el dueño lo decida.

Con contenido básico: [`workflow-github.md`](workflow-github.md) documenta
el patrón de sincronización (token, API de contenidos; `gestor.html` se retiró el 2026-10-25) que
comparten `ficha-personaje/ficha.html`, `gm-toolset/gm-tools.html`,
`gm-toolset/vendor-generator.html`, `manual-usuario/manual.html` y
`datos/catalogo-editor.html`. Se va a ir sumando más a medida que haga
falta — no hay un formato fijo para lo que va acá, es notas.

## Dependencias con otras carpetas

Ninguna directa — documenta comportamiento del resto del repo pero no
tiene código propio.
