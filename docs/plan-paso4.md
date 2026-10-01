# Paso 4 — La Botonera y las Acciones dentro del mapa (plan detallado)

> Parte de [`plan-consolidacion.md`](plan-consolidacion.md). Decidido por el dueño el 2026-09-30: **por etapas**. Primero se
> arregla de raíz cómo viven la ficha y GM Tools dentro del mapa; después se parten los archivos gigantes (paso 5); recién
> con eso, que el mapa dibuje la Botonera y las Acciones es natural. **Al final**: zonas persistentes y trampas de las
> invocaciones (P134, secundario, anotado en [`pendientes.md`](pendientes.md)).

## Cómo es hoy

- El mapa mete la **ficha entera** (`ficha.html?modo=botonera`, ~12 500 líneas) o **GM Tools entero**
  (`gm-tools.html?modo=acciones|finalizar|botin`, ~7 900) en un marco (`#botonera-marco`, dentro de `#botonera-capa`), y se
  hablan por ~15 tipos de mensajes (`acciones-lista`, `botonera-cerrada`, `duelo-ui-visible`, `duelo-flash-res`,
  `zona-persistente-habilidad`, `trampa-habilidad`…), repartidos en los tres archivos.
- Dentro del mapa, cada herramienta **esconde todo menos una lista fija de ventanas** (`html.modo-botonera body >
  :not(.scrim):not(#ep-fondo)…`). Cada cartel nuevo que no está en la lista **desaparece**: así se perdió el «¿es su turno?»
  del Flash en GM Tools (2026-09-30). Y la capa del marco quedaba **debajo del cuadro del duelo**: cualquier cartel durante
  una tirada (No2, sobrepeso, Flash) quedaba tapado (arreglado el 2026-09-30 con `#botonera-capa.sobre-duelo`).
- La Botonera en sí son ~200 líneas de dibujo (`renderBotonera`), pero se apoya en decenas de funciones de la ficha (cálculo
  de stats, armas, costos, consumibles, habilidades) y sus botones disparan cientos más. Que el mapa la dibuje exige sacar
  antes esa lógica de la ficha: eso es el paso 5.

## Etapas

### Etapa 1 — Integración de raíz (en `nueva-version`, de a poco, probada en copias y en "Claude · pruebas")
1. **Invertir la regla de qué se ve** — `comun/embebido.js`: dentro del mapa se esconde **solo la página** (lo que cada
   herramienta declara: `.wrap`, el dock, el cartel de muerte) y **las piezas comunes que el mapa ya tiene** (Mesa flotante,
   menú ☰, historial, cuadro del duelo, dados 3D). Todo lo demás —cualquier ventana o cartel, de hoy o futuro— se ve.
2. **Un solo aviso genérico de "hay algo abierto"** — el mismo archivo mira la página y le avisa al mapa cuando se abre o se
   cierra algo (`embebido-abierto` / `embebido-cerrado`); el mapa muestra u oculta la capa, y la pone encima del duelo si
   hace falta. Reemplaza a los avisos sueltos (`duelo-ui-visible` de `duelo.js`, que queda de respaldo hasta probarlo).
3. **Los mensajes en un archivo común** — la lista de tipos de mensaje mapa ↔ herramientas, con quién los manda y qué
   hacen, en un solo lugar (`comun/embebido.js` o un `comun/mensajes-mapa.js`), para no tener que buscarlos en tres archivos.
4. **Abrir más rápido** — precargar el marco de la ficha propia (jugador) o del token seleccionado (GM), para que la Botonera
   no tarde la primera vez.

### Etapa 2 — Partir los archivos gigantes (= paso 5)
Separar de `ficha.html` y `gm-tools.html` la lógica que no es pantalla (estado del personaje, cálculo de stats, acciones de
combate, habilidades, consumibles) en piezas de `comun/`, con su propio plan detallado antes de empezar.

### Etapa 3 — El mapa dibuja la Botonera y las Acciones (rama aparte)
Con las piezas de la etapa 2, el mapa arma la Botonera del personaje y las Acciones del creep sin marco. Se hace en una
**rama aparte** y se junta cuando esté probada en "Claude · pruebas" y "Test".

### Al final — Zonas y trampas de las invocaciones (P134)

## Cómo va
- 2026-09-30: plan escrito; etapa 1 en curso. **Puntos 1 y 2 hechos**: `comun/embebido.js` (se esconde la página y las
  piezas comunes; cualquier cartel se ve; avisa `embebido-abierto`/`embebido-cerrado`), cargado en la ficha y en GM Tools en
  lugar de sus listas fijas; el mapa escucha los avisos. Probado en un marco de prueba (cartel nuevo de GM Tools visible y
  avisado, Botonera abre/cierra, la Mesa no se ve, la Polilla se ve sin dejar la capa abierta, el cartel de solo lectura no
  se ve) y **en mesa** en "Claude · pruebas" (Acciones de un creep, un cartel suelto con la capa cerrada, la Botonera de un
  personaje). **Punto 3 hecho**: `comun/mensajes-mapa.js` (la lista de los ~38 mensajes y los ayudantes `alMapa`/`alMarco`;
  avisa en la consola si aparece uno sin registrar). **Punto 4 hecho**: `?precarga=1` (cargar sin abrir nada) y
  `precargarMarco()`. De paso: el reenvío del duelo ahora carga sin abrir nada (con la etapa 1, la Botonera o las Acciones
  habrían aparecido encima del duelo), GM Tools cargado sirve para cualquier creep, y dentro del mapa la ficha no muestra su
  propio cartel de subida de nivel (ya lo muestra el mapa). **Efecto buscado de la etapa 1**: los carteles que la ficha abre
  sola dentro del mapa (quedaste inconsciente, recordatorios de estados) ahora se ven; antes quedaban escondidos.
  Probado en mesa como GM (precarga, Acciones al instante, duelo con el creep sin cargar). **Etapa 1 cerrada**, salvo probar
  como jugador la precarga de la ficha propia (en la próxima partida o con 🎮 Tomar el control). Sigue la **etapa 2** (= paso
  5, partir los archivos): necesita su propio plan antes de empezar.

- 2026-10-01: **etapa 2 (= paso 5, nivel B) terminada** (áreas 1–4: cálculo, combate, habilidades y consumibles, guardar y
  leer la ficha). **Etapa 3: plan detallado en [`plan-paso4-etapa3.md`](plan-paso4-etapa3.md)**, con 4 preguntas para el dueño.
