# Paso 4, etapa 3 — El mapa dibuja la Botonera él mismo (plan detallado)

> Parte de [`plan-paso4.md`](plan-paso4.md) y de [`plan-consolidacion.md`](plan-consolidacion.md). Escrito el 2026-10-01,
> después de terminar el nivel B del paso 5 (áreas 1 a 4, ver [`plan-paso5.md`](plan-paso5.md)). **Estado: plan, sin
> código.** Las preguntas de diseño están al final; nada se empieza hasta que el dueño las conteste.

## Cómo es hoy

Cuando un jugador abre su Botonera en el mapa, el mapa **carga la ficha entera adentro de un marco** (`#botonera-marco`,
`ficha.html?modo=botonera`, ~10 000 renglones de código) y le esconde todo menos la Botonera. Lo mismo con las Acciones de
un creep para el GM (`gm-tools.html?modo=acciones`). Se hablan con ~38 tipos de mensaje (`comun/mensajes-mapa.js`).

La etapa 1 (ya hecha) arregló lo más molesto de ese esquema: los carteles ya no quedan escondidos, el marco se precarga y
abre rápido. Lo que queda es de fondo: dos programas enteros hablándose por mensajes para algo que el jugador vive como
una sola pantalla.

## Qué hay que mover (más de lo que parece)

El **dibujo** de la Botonera son ~190 renglones (`renderBotonera`). Lo pesado es todo lo que **hacen** sus 16 tipos de
botón, que hoy viven en la ficha:

| Botón | Qué usa por detrás | Estado |
|---|---|---|
| Números de la Botonera (No2, SP, Def, fórmulas, costos) | cálculo, combate, costos de habilidad | ✅ ya en `comun/` (`FichaCalculo`, `FichaCombate`, `FichaHabilidades`) |
| Traer el personaje y guardarlo | partes de Firebase, migraciones | ✅ ya en `comun/` (`FichaGuardado.cargar`) — falta el guardado **en vivo** (ver 3a) |
| Tirar un stat, Percepción, Fuerza del golpe | tirada + Mesa | casi todo en `comun/` (`Combatiente.tirarStat`, `mesa.js`); falta el sobrepeso (cartel) |
| Atacar, Daño, Esquivar, Parry, Bloqueo | el **duelo** y sus ganchos de la ficha (`DUELO_HOOKS`, ~200 renglones), carteles de No2 | en la ficha |
| Habilidades (Ejecutar / Anunciar / 🎲 segunda) | `ejecutarHabilidad`: elegir arma, costo X, ¿es tu turno?, Flash, Ejecución paso a paso, zona, trampa, Mesa | la regla en `comun/`; la pantalla en la ficha |
| Consumibles (cinturón y mochila) | consumir: No2 por lugar, unidades, cura, estado, trampa consumible | en la ficha |
| Sigilo, Levantarse | estado + No2 | en la ficha |
| 🔍 Lupa de cada botón | `lupaHtml` (cómo se calcula cada cosa) | en la ficha |
| Ver (habilidad, consumible, talento) | ventana de detalle de la ficha | en la ficha |

Y algo que no es un botón pero pesa: **cuando a un personaje lo atacan, el duelo le pide la tirada a su ficha** (el mapa la
reenvía al marco). Mientras eso viva en la ficha, el marco tiene que seguir existiendo aunque la Botonera la dibuje el mapa.

## La forma propuesta: de a una pieza, con el marco de respaldo

En vez de un cambio grande de una vez, **una Botonera nueva al lado de la vieja**: el mapa la dibuja con las piezas de
`comun/`; cada botón que todavía no está mudado **se lo pide al marco** (como hoy), y cada pieza que se muda pasa a
hacerse en el mapa. Cuando ya no quede ninguno delegado, el marco se retira para los jugadores. En ningún momento hay una
Botonera a medio andar: lo que no está listo, sigue funcionando por el camino de siempre.

### 3a — La sesión en vivo de un personaje, compartida (sin cambios visibles)
- **Qué**: sacar de la ficha a `comun/` el "tener abierto" un personaje — escucharlo, aplicar lo que cambia desde otra
  ventana, guardar solo lo que cambió (cada 1,2 s quieto o 5 s como mucho), reintentar si falla, la marca de 🎮 control
  (`fichaEscuchar`, `fichaGuardarTick`). La ficha lo usa en lugar del suyo.
- **Se gana**: el mapa puede abrir el personaje **con el mismo código** que la ficha. Dos pantallas con el mismo personaje
  se comportan como hoy dos ventanas de la ficha (cada parte, gana la última que guarda; la otra se actualiza sola).
- **Riesgo**: medio (es lo que guarda todo). **Prueba**: comparación contra lo viejo + Clementino en "Claude · pruebas"
  (dos pestañas a la vez, cambiar en una y ver en la otra; cortar internet y ver el reintento).

### 3b — La Botonera nueva, solo mirar (lo demás, delegado)
- **Qué**: el mapa dibuja la Botonera del personaje con `comun/` (mismos números, mismos colores de estados, mismo
  aspecto). Todo botón, por ahora, se lo pide al marco (que se precarga escondido). Detrás de un **interruptor**
  (ver pregunta 1).
- **Se gana**: abre al instante y ya muestra lo mismo sin depender de que la ficha termine de cargar.
- **Riesgo**: bajo (los botones hacen lo de siempre). **Prueba**: comparar lado a lado con la vieja, botón por botón.

### 3c — Mudar los botones, de a uno
Cada uno: su pieza a `comun/` (como en el paso 5), sus pruebas, el botón pasa a hacerse en el mapa, probado con Clementino.
Orden propuesto, de lo más simple a lo más complejo (ver pregunta 3):
1. Tirar un stat, Percepción ✅ (2026-10-01). Fuerza del golpe pasa al paso 4 (elige arma como el Parry).
2. Sigilo y Levantarse.
3. Consumibles (cinturón y mochila).
4. Atacar, Daño, Esquivar, Parry y Bloqueo — con los ganchos del duelo del personaje (`DUELO_HOOKS`).
5. Habilidades (lo más grande: elegir arma, costo X, turno ajeno, Flash, Ejecución, zonas y trampas).
6. 🔍 Lupa y "Ver".

### 3d — Retirar el marco para los jugadores
Con todo mudado y probado en una partida de verdad, la Botonera nueva pasa a ser la única; el marco queda solo para lo que
siga necesitándolo (ver pregunta 4). La ficha suelta (`ficha.html`) no cambia: sigue siendo la ficha completa.

### Después (fuera de esta etapa)
- Las **Acciones de los creeps** del GM y la **Botonera de las invocaciones**, con el mismo método (ver pregunta 4).
- Zonas y trampas de las invocaciones (P134).

## Preguntas para el dueño

1. **¿Dónde se hace?** Lo acordado era una **rama aparte**. El problema: el sitio publicado solo muestra `nueva-version`, y
   para probar en la mesa real con Clementino tendría que estar publicado. Alternativa: hacerlo en `nueva-version` pero
   **escondido detrás de un interruptor** que solo se prende a propósito (un botón "⚗ Botonera nueva (prueba)" que solo ve
   el GM, o una marca en la dirección): los jugadores siguen con la de siempre hasta que se decida cambiar. *Recomendado: el
   interruptor* — es igual de seguro para los jugadores y se puede probar de verdad.
2. **¿Cómo se ve?** Igual que la de hoy (mover, no cambiar) o aprovechar para rediseñarla. *Recomendado: igual*; un
   rediseño, si se quiere, después, ya con todo en un solo lugar.
3. **¿En qué orden se mudan los botones?** De lo más simple a lo más complejo (el orden de 3c) o empezando por lo que más se
   usa en la mesa (atacar y defenderse). *Recomendado: de lo simple a lo complejo*, para que los primeros pasos asienten la
   forma de hacerlo.
4. **¿Y las Acciones de los creeps (GM) y la Botonera de las invocaciones?** Después de la del personaje, con el mismo
   método, o en paralelo. *Recomendado: después*.

## Decisiones del dueño (2026-10-01)
1. **En `nueva-version`, detrás de un interruptor escondido** (botón "⚗ Botonera nueva (prueba)" que solo ve el GM), no en
   una rama: los jugadores siguen con la de siempre y se puede probar en la mesa real.
2. **Igual que la de hoy**: se mueve sin cambiar lo que se ve.
3. **De lo simple a lo complejo** (el orden de 3c).
4. **Creeps e invocaciones, después** de la Botonera del personaje.

## Cómo va
- 2026-10-01: plan escrito y preguntas contestadas (todas como lo recomendado). Empieza la 3a.
- 2026-10-01: **3a hecha** — `comun/ficha-sesion.js` (`FichaSesion`): tener abierto un personaje en vivo (escuchar,
  aplicar cambios de otra ventana, guardar lo que cambió, reintentar), y la ficha lo usa. Comparado contra el tramo viejo
  con una base de datos falsa y un guion de 33 pasos: mismos 73 eventos y estados intermedios; la comparación detecta los 5
  errores plantados. En la mesa ("Claude · pruebas", Clementino con 🎮 control, dos pestañas a la vez): un cambio en una
  llega solo a la otra (con el aviso "La ficha se actualizó desde otra ventana") en ~13 ms, en los dos sentidos; dos
  cambios casi simultáneos terminan iguales en las dos y en Firebase (gana el último que guarda). **Una vez** un cambio de
  la pestaña B no llegó a la A mientras la A seguía "Guardando…" su propio cambio (pestaña de fondo): no se repitió en
  dos intentos más y la lógica es la misma de antes (lo que tiene una escritura propia pendiente se saltea) — a mirar si
  aparece en una partida. Sigue la **3b** (la Botonera nueva en el mapa, solo mirar, detrás del interruptor).
- 2026-10-01: **3b hecha** — `comun/ficha-botonera.js` (`FichaBotonera`: el dibujo de la Botonera y ~30 ayudantes; la ficha
  lo usa; comparado contra el `renderBotonera` viejo en 400 personajes al azar y cada ayudante en 9150 casos: igual) e `IT2`
  pasó a `comun/ficha-calculo.js`. En el mapa, **⚗ Botonera nueva** (interruptor de la barra de arriba, solo GM, recordado en
  el navegador): `abrirBotoneraNueva(fichaId)` lee al personaje con `FichaSesion` (solo mirar), lo dibuja con
  `FichaBotonera` en un recuadro aislado (shadow DOM) con el `ficha.css` de siempre y le pide cada botón a la ficha escondida
  del marco (mensaje `botonera-delegar`). Las piezas se cargan al usarla (no el catálogo: `FichaGuardado` ya funciona sin él).
  **Probada en "Claude · pruebas" como Saulo-Prueba (el jugador dueño de Clementino, abierta desde la consola porque el
  interruptor es del GM)**: muestra lo mismo que la ficha; Fue y Percepción tiran desde la ficha escondida y salen en la Mesa;
  Atacar abre "¿Qué ataque es?" encima (como siempre) y, con tirada suelta, tira PdG y cobra 2 No2 — la Botonera nueva se
  actualiza sola (No2 10/12, el próximo ataque a 4 No2). Pendiente de la 3b: las 🔍 (la lupa vive en la ficha; va en la 3c).
  Sigue la **3c**: mudar los botones de a uno (tiradas de stats y Percepción primero).
- 2026-10-01: **3c, paso 1 (parte 1) hecho** — las tiradas de stats y la Percepción las hace el mapa: `FichaBotonera.tiradaStat(S,
  statId)` y `tiradaPercepcion(S, azar)` arman la tirada (`{origen, r}` o `{error}`) y cada pantalla la publica a su manera; la
  ficha usa la misma Percepción (`tirarPercepcion` quedó de 3 líneas) y el mapa publica con `quien` y `ficha` del personaje
  (`bnTirarAca`), así la Moneda Re-Roll y la Polilla las ven (P138). Las tiradas de stats de la ficha siguen por
  `tirarValorStat` (tiene el cartel de sobrepeso de la Evasión; la Botonera no ofrece Evasión como stat suelto). Pruebas: la
  Percepción nueva contra una copia textual de la vieja en 300 personajes al azar (con y sin Percepción aumentada, mismo azar):
  igual; una mutación en la tabla de escalones la detecta (26 de 300 distintas). **En "Claude · pruebas" como Saulo-Prueba**:
  Constitución (1d4+1) y Percepción (1d6) salieron en la Mesa a nombre de Clementino, `desde: 'mapa'`, sin pasar por la ficha
  escondida. Salen sin `ficha` hasta que se peguen las reglas de P138 (la Mesa reintenta sin ese campo). **Fuerza del golpe
  sigue delegada**: abre el cartel de elegir arma de la ficha; va junto con Parry y Bloqueo (paso 4 de la 3c).
