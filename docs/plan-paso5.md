# Paso 5 — Partir los archivos gigantes (plan detallado)

> Parte de [`plan-consolidacion.md`](plan-consolidacion.md) y etapa 2 de [`plan-paso4.md`](plan-paso4.md) (2026-09-30). Es lo
> que hace posible la etapa 3 del paso 4 (que el mapa dibuje la Botonera y las Acciones). Preguntas de diseño primero, código
> después; de a un archivo por vez.

## Cómo es hoy

| Archivo | Estilos | Pantalla (HTML) | Código | Bloques temáticos |
|---|---|---|---|---|
| `ficha-personaje/ficha.html` | ~1 200 líneas | ~830 | ~10 500 | ~60 |
| `gm-toolset/gm-tools.html` | ~800 | ~500 | ~6 500 | ~26 |

Todo el código de cada herramienta vive en UN `<script>`, con variables globales compartidas (`S`, `fichaVivo`, `compute()`…).
Problemas: cuesta encontrar las cosas, cada cambio toca el archivo más grande del proyecto (y dos conversaciones a la vez se
pisan), el navegador vuelve a bajar todo por cualquier cambio chico, y la lógica de juego está mezclada con la pantalla (el mapa
no puede usar "atacar con la ficha" sin cargar la ficha entera).

## Dos niveles

### Nivel A — Partir en archivos, sin cambiar nada de lo que hace (mecánico, riesgo bajo)
Un `<script>` grande se corta en **tramos consecutivos** (en el mismo orden) y cada tramo pasa a un archivo propio cargado con
`<script src>` en el mismo lugar. Los estilos pasan a un `.css`. En estas páginas los scripts clásicos comparten las mismas
variables globales, así que el resultado es el mismo programa.

- **Por qué consecutivos**: así el orden de ejecución es idéntico. Reagrupar por tema (juntar tramos lejanos) viene después,
  ya con los archivos separados y de a poco.
- **Única trampa conocida**: dentro de un mismo script una función se puede usar antes de la línea donde se escribe; entre
  archivos distintos, no, si se usa *al cargar* (no adentro de otra función). Se detecta al probar (error "no está definido"
  al abrir) y se arregla moviendo esa llamada al final.
- **Comprobación automática**: el script que corta verifica que pegar los archivos de nuevo dé exactamente el original.
- **Propuesta para la ficha** (`ficha-personaje/js/`, ~14 archivos): modelo y reglas (No2/SP, escala de Tipos, cálculo,
  durabilidad) · estados recibidos, sigilo, sentado, habilidades en el duelo, Re-Roll · tiradas y percepción · invocaciones ·
  estados alterados · eventos y cajas (vida, SP, DDE, XP) · editor y catálogo · equipo, ficha liviana, botín, Mesa común ·
  inventario, tienda, venta y reparación · habilidades, pasivas, trampas e ítems (asistentes) · combate (Mantenimiento, atacar,
  Parry y Bloqueo, lupa, ejecutar habilidades, revivir) · en vivo con Firebase (guardado, control, abrir, personajes) ·
  bitácora · modo botonera y mantenimiento. Más `ficha.css`.
- **GM Tools** (`gm-toolset/js/`, ~10 archivos), con el mismo criterio. Más `gm-tools.css`.
- **Versiones**: cada archivo lleva su `?v=` y se sube solo el del archivo que cambia (el navegador baja solo eso).
- **Coordinación**: el día del corte ninguna otra conversación puede estar editando ese archivo (sus cambios apuntarían a
  líneas que ya no están ahí). Se hace de a un archivo, se prueba y se sube en el momento.

### Nivel B — Separar la lógica de juego de la pantalla (de a poco, por áreas)
Igual que se hizo con las reglas en los pasos 1–3 (`comun/combatiente.js`): sacar a `comun/` lo que hoy depende de las
variables globales de la ficha, pasándole los datos en vez de leerlos de `S`. Orden propuesto, de lo más usado por el mapa a
lo menos:
1. **El cálculo de la ficha** (`compute()`: stats finales con equipo y estados) — lo necesitan la Botonera, la lupa y el mapa.
2. **Combate**: atacar, daño, Parry/Bloqueo con arma o escudo, costos (ya en parte en el motor).
3. **Habilidades y consumibles**: ejecutar, cobrar, los tres modos (la regla ya está en el motor; falta lo de la ficha).
4. **Guardar y leer la ficha** (Firebase), para que el mapa pueda cargar un personaje sin la ficha entera.
Cada área: sus pruebas en `comun/pruebas.html`, comparación contra la versión vieja y prueba en mesa. Con 1–4 hechos, la
etapa 3 del paso 4 (el mapa dibuja la Botonera) es armar la pantalla con esas piezas.

## Cómo va
- 2026-09-30: plan escrito. Decidido por el dueño: **primero A, después B**; se pudo hacer en el momento (ninguna otra
  conversación con la ficha abierta).
- 2026-09-30: **ficha partida** (nivel A): `ficha.css` + 14 tramos en `ficha-personaje/js/`; el programa que corta
  comprobó que juntarlos da el original exacto. Un solo ajuste: el primer `renderAll()` + `aplicarColapsados()` pasó del
  final de `11-combate.js` al final de `14-modo-botonera.js` (renderAll usa funciones de archivos posteriores: entre
  archivos no se "elevan"; lo encontró la prueba al cargar). Comparado contra la ficha original sin sesión: la pantalla
  dibujada es idéntica letra por letra, los estilos de 400 elementos iguales, los modos `botonera` y `mantenimiento`
  cargan sin errores, y los flujos de invocación dan los mismos números. Probada en mesa (la ficha de Clementino y su
  Botonera dentro del mapa, sin errores).
- 2026-09-30: **GM Tools partido** (nivel A): `gm-tools.css` + 12 tramos en `gm-toolset/js/`, idénticos al original; no
  hizo falta ningún ajuste (su primer `renderAll()` no usa nada de los archivos posteriores). Comparado sin sesión: misma
  pantalla (salvo el color al azar del creep vacío del arranque), mismos estilos, modos `acciones` y `finalizar` sin errores,
  ataque con arreglos y Flash con los mismos números. **Nivel A terminado**; sigue el nivel B (separar la lógica de juego de
  la pantalla, por áreas), con su propio plan por área.
- 2026-09-30: **nivel B, área 1 hecha — el cálculo de la ficha** (`comun/ficha-calculo.js`, `FichaCalculo`). Sin preguntas
  de diseño (no cambia ninguna regla, solo de lugar). Se mudaron, copiados tal cual: la lista de atributos y stats, las
  ranuras, la durabilidad, las compras de pasivas, el total de Job, `collectMods` (→ `modsDe(S)`), `evalFormula` y `compute`
  (→ `calcular(S)`). La ficha conserva los mismos nombres como alias. Comparado contra el cálculo viejo en 1 500 fichas al
  azar (equipo del catálogo, ítems rotos y con armadura rota, pasivas compradas varias veces, estados con stacks, niveles y
  fórmulas cambiadas a mano): igual. Pruebas: 103. **Para tener en cuenta en la etapa 3**: las fórmulas de stats de cada
  ficha se evalúan como código; hoy ya pasa al abrir una ficha ajena, y va a pasar en el mapa — anotar en "Antes de abrirlo
  al público". Sigue el área 2 (combate).
- 2026-10-01: **nivel B, área 2 hecha — el combate** (`comun/ficha-combate.js`, `FichaCombate`). Sin preguntas de diseño
  (ninguna regla cambia). Se mudaron: manos, con qué atacar y con qué parriar, PdG y stats por arma (sin los bonos de la otra;
  Parry y Bloqueo sin los del escudo ajeno), valor del Bloqueo, alcance, daño, fórmulas de los botones, costo de atacar y el
  conteo de ataques. Quedan en la ficha las acciones con pantalla (`atacarConArma`, `parryConArma`, los avisos), que ahora
  usan esas piezas. Comparado contra lo viejo en 1 200 fichas al azar (armas de una y dos manos, escudos, bonos de PdG,
  Parry, Bloqueo, crítico y rango, ítems rotos, mano preferida, armas de rango, ataques ya hechos, Lisiado): igual. Pruebas:
  107. Sigue el área 3 (habilidades y consumibles).
