# Paso 4, etapa 3 — El mapa dibuja la Botonera él mismo (plan detallado)

> Parte de [`plan-paso4.md`](plan-paso4.md) y de [`plan-consolidacion.md`](plan-consolidacion.md). Escrito el 2026-10-01,
> después de terminar el nivel B del paso 5 (áreas 1 a 4, ver [`plan-paso5.md`](plan-paso5.md)). **Estado: en curso** —
> 3a, 3b y 3c hechas; la 3d espera decisiones del dueño (ver "Para retomar" justo abajo y "Cómo va" al final). Preguntas del dueño:
> contestadas.

## ▶ Para retomar (al cierre de la conversación del 2026-10-01, tarde)

**El repo está limpio**: todo subido a `nueva-version`, nada a medio escribir en el código. Lo que sigue es un paso nuevo.

**Hecho en esta etapa**: 3a (sesión en vivo compartida, `comun/ficha-sesion.js`), 3b (Botonera nueva detrás del
interruptor ⚗, solo GM), y de la 3c: paso 1 (tiradas de stats y Percepción), el resumen público (`comun/ficha-resumen.js`),
paso 2 (Sigilo, Levantarse: el mapa ya guarda al personaje), paso 3 (Consumir), paso 4a (Esquivar, Parry, Bloqueo, Fuerza
del golpe, Daño), 4b (Atacar), **4c (los ganchos del duelo: `comun/ficha-duelo.js`)** — probado en vivo con un objetivo de
verdad, atacando y defendiendo —, **5a (habilidades manuales, semiautomáticas, el costo X, el Flash fuera del duelo y la 🎲
segunda tirada)**, **5b (las ✨ automáticas: ataque con arreglos, habilidad dirigida con su duelo y el atajo «solo sobre vos»)**
y **5c (las que colocan trampa, zona o portal)**: **la Botonera nueva ya hace todas las habilidades** sin pedirle nada al marco.
Todo lo que hace vive en `comun/ficha-acciones.js` y `comun/ficha-duelo.js` (la ficha usa lo mismo con sus nombres de siempre).

**La 3c está terminada (2026-10-01)**: con el paso 6 (la 🔍 y el "Ver", `comun/ficha-lupa.js`) y el 7 (talentos, trampas
consumibles y Ankh a mano), **la Botonera nueva no le pide ningún botón a la ficha escondida**. Lo único que sigue yendo al
marco, a propósito, es el **editor** (Editar del Ver, mensaje `editar-en-ficha`).

**Lo próximo — 3d, y antes, decisiones del dueño** (no es código para hacer a ciegas: toca a los jugadores de verdad):
1. **Probarla en una partida de verdad**: hoy solo la ve el GM con ⚗. Opciones: que el GM la use un rato con 🎮 el control de
   un personaje en una sesión real, o abrir el interruptor ⚗ a los jugadores (opt-in, cada uno en su navegador).
2. **Qué hace "Editar"** cuando el marco ya no se cargue para la Botonera: abrir la ficha en otra pestaña (simple) o mudar los
   editores al mapa (grande).
3. Recién con eso, 3d: la Botonera nueva pasa a ser la de todos. **El marco no desaparece**: lo siguen usando Equipo y mochila
   (🛡), los Despojos, la Tienda, la Moneda Re-Roll fija, Revivir, la ficha liviana (F), la Botonera de las **invocaciones**, el
   Mantenimiento en segundo plano y los ganchos del duelo de las invocaciones. Solo deja de cargarse para abrir la Botonera.

**Dónde probar** (2026-10-01): con Chrome logueado como `elsaulo@gmail.com`, la partida **"Test con claude elsaulo"** (ahí esa
cuenta es el GM, "S.Claude"); el jugador es "Sujeto de pruebas" con **Silvia Suller** (Cimitarra + Broquel de bronce, 20 HP,
6 No2), y hay un creep "Creep nuevo" con token al lado. Para usar a Silvia desde el GM: 🎮 Tomar el control en su ficha (y
devolverlo al terminar). Con `rolpintoista@gmail.com`, "Claude · pruebas" como antes. Ver la memoria `partidas-de-prueba`.

**Pendientes chicos de lo ya hecho**:
- El Parry que espera su Bloqueo en el mapa (`bn.parryPendiente`) no se borra al pasar el turno (sí al bloquear, al atacar
  y al cambiar de personaje).
- P137 (diferencias de "permanente" y Excedente de vida entre ficha, GM Tools e invocaciones): espera decisión del dueño.
- 3a: en una pestaña de fondo el guardado tarda (Chrome frena sus temporizadores): la ficha sigue "Guardando…" un rato
  aunque los datos ya llegaron a Firebase. Visto otra vez el 2026-10-01 (durabilidad del Broquel tras un Bloqueo perdido).
- **Visto probando el 4c (no es de este cambio)**: si un creep no tiene No2 para atacar, GM Tools lo rechaza y el aviso queda
  adentro del marco escondido — en el cuadro del duelo el botón «Pagar y tirar PdG» no hace nada visible. Anotado en
  `docs/pendientes.md`.

**Cómo se viene trabajando cada paso (método que funcionó)**:
1. Copiar el código **tal cual** a `comun/` (casi siempre `comun/ficha-acciones.js`) con `S` como parámetro y un objeto
   `ui` para todo lo que se ve (carteles, avisos, redibujar); la ficha queda con atajos de una línea y su propio `ui`
   (`accionesUi`, `consumoUi`, `combateUi`).
2. **Comparar viejo contra nuevo** antes de subir: copias temporales del código viejo (`git show HEAD:… > comun/_viejo-….tmp.js`,
   borrarlas al terminar), sacar las funciones contando llaves, correrlas en el preview local `archivos` (puerto 8765,
   `comun/pruebas.html`) con los **mismos dados** (Math.random con semilla) en 300–800 casos al azar, y **plantar 3–4
   errores** para ver que la comparación los detecta.
3. Pruebas permanentes en `comun/pruebas.html` (acepta pruebas async); todas en verde (hoy 147).
4. Subir el `?v=` de cada archivo tocado: `ficha-personaje/ficha.html`, `BN_PIEZAS` en `vtt-hexgrid/mapa.html`,
   `gm-toolset/gm-tools.html`. Si no, el navegador usa la copia vieja.
5. Push y prueba en vivo en "Claude · pruebas" con Claude in Chrome: abrir con `&_=<algo>` en la dirección (GitHub Pages
   cachea 10 min); la Botonera nueva se abre desde la consola del mapa con `abrirBotoneraNueva(fichaPrincipalId())` (el
   interruptor ⚗ es del GM); tener la ficha abierta en otra pestaña para ver que se sincroniza; dejar a Clementino como
   estaba (12 No2, 25 HP, sin equipo ni estados).
6. Documentar en "Cómo va" (al final de este archivo) y en los `CLAUDE.md` de `comun/` y `vtt-hexgrid/`; commit y push.

Trucos de la herramienta: con la ventana de Chrome oculta los temporizadores van lentos (cada llamada tiene 45 s: partir
las esperas largas); si una pestaña no responde, recargarla; el número de pestaña cambia cuando la extensión se reconecta
(`tabs_context_mcp`); la extensión bloquea un resultado con la clave `tokens`.

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
| Tirar un stat, Percepción, Fuerza del golpe | tirada + Mesa | ✅ en el mapa (3c-1 y 4a), con el cartel de sobrepeso |
| Atacar, Daño, Esquivar, Parry, Bloqueo | el **duelo** y sus ganchos de la ficha (`DUELO_HOOKS`, ~200 renglones), carteles de No2 | ✅ los botones en el mapa (4a, 4b) y los ganchos del duelo (4c, `comun/ficha-duelo.js`) |
| Habilidades (Ejecutar / Anunciar / 🎲 segunda) | `ejecutarHabilidad`: elegir arma, costo X, ¿es tu turno?, Flash, Ejecución paso a paso, zona, trampa, Mesa | ✅ todas en el mapa: manual, semi, costo X, Flash y segunda tirada (5a), las ✨ automáticas (5b) y las que colocan trampa, zona o portal (5c) |
| Consumibles (cinturón y mochila) | consumir: No2 por lugar, unidades, cura, estado, trampa consumible | ✅ en el mapa (3c-3), salvo trampas consumibles y el Ankh manual |
| Sigilo, Levantarse | estado + No2 | ✅ en el mapa (3c-2) |
| 🔍 Lupa de cada botón | `lupaHtml` (cómo se calcula cada cosa) | ✅ en el mapa (paso 6, `comun/ficha-lupa.js`) |
| Ver (habilidad, consumible, talento) | ventana de detalle de la ficha | ✅ en el mapa (paso 6); su "Editar" abre el editor de la ficha escondida |
| Talentos, trampas consumibles, Ankh manual | `tirarSocial`, `consumir` con trampa, `consumirAnkh` | ✅ en el mapa (paso 7) |

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
2. Sigilo y Levantarse ✅ (2026-10-01; el mapa ya guarda al personaje).
3. Consumibles (cinturón y mochila) ✅ (2026-10-01; quedan delegadas las trampas consumibles y el Ankh manual).
4. Atacar, Daño, Esquivar, Parry y Bloqueo — con los ganchos del duelo del personaje (`DUELO_HOOKS`). Partido en 4a (sueltos ✅
   2026-10-01), 4b (Atacar ✅ 2026-10-01) y 4c (los ganchos del duelo ✅ 2026-10-01; 4b y 4c probados juntos contra un creep).
5. Habilidades (lo más grande): partido en 5a (manual, semi, costo X, arma, turno ajeno, Flash, segunda tirada ✅ 2026-10-01),
   5b (✨ automáticas con la Ejecución paso a paso ✅ 2026-10-01) y 5c (zonas, trampas y portal ✅ 2026-10-01).
6. 🔍 Lupa y "Ver" ✅ (2026-10-01).
7. Talentos, trampas consumibles y Ankh manual (lo último delegado) ✅ (2026-10-01).

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
- 2026-10-01: **antes del paso 2 de la 3c (Sigilo y Levantarse), el resumen público** — desde el paso 2 el mapa tiene que
  *guardar* al personaje (cobrar No2, poner o sacar un estado), y al guardar se publica también el `resumen` (vida, No2,
  estados… lo que leen los tokens). Lo armaba solo la ficha (`fichaResumen`); pasó a `comun/ficha-resumen.js`
  (`FichaResumen.resumen(S, {control, miniaturaInv})`, con los estados derivados —regeneración de pasivas, Sobrepeso—, el
  costo de moverse y el No2 máximo de las invocaciones). La ficha conserva los nombres de siempre como atajos. Comparado
  contra el código viejo sacado tal cual de los archivos de la ficha en 700 personajes al azar (sobrepeso, invocaciones,
  pasivas, Rengo/Inmovilizado, control del GM, escudos y excedente): igual; 4 mutaciones plantadas, las 4 detectadas.
  **En vivo** (Clementino): el resumen que arma la ficha nueva es idéntico al que estaba guardado; entrar en sigilo lo
  publica (Sigilo, No2 12 → 11) y salir lo saca. Ojo, de paso: el resumen tiene la clave `muerto` dos veces (un objeto y
  después un sí/no); vale la segunda, como siempre — no se tocó.
- 2026-10-01: **P138 probada en vivo** con las reglas pegadas por el dueño: la Percepción de Clementino quedó en la Mesa con
  su `ficha`, aparece una sola vez en "mis últimas tiradas" y sigue ahí después de recargar la ficha.
- 2026-10-01: **3c, paso 2 hecho — Sigilo y Levantarse los hace el mapa, y el mapa guarda al personaje** (primera vez).
  `comun/ficha-acciones.js` (`FichaAcciones.alternarSigilo/levantarse(S, forzar, ui)` y `gastoNitrosForzado(S, costo, hizo)`,
  copiados de la ficha; cada pantalla pone el cartel, el aviso y el redibujo con `ui`). La ficha los usa con sus nombres de
  siempre. En el mapa (`bnAccionAca`, `bnUi`, `bnOpcionesGuardado`): solo si quien mira puede guardar ese personaje (su dueño
  o el GM con 🎮 el control; si no, se sigue delegando); escribe **solo las partes que cambió la acción** (lo que difiera
  por haberlo armado distinto se marca como ya guardado) y el resumen público con `FichaResumen` (las miniaturas de las
  invocaciones se reusan de las publicadas). El cartel "No te alcanzan los Nitros" es el mismo de la ficha, dentro del
  recuadro. Comparado contra el código viejo en 80 casos (con y sin el estado, No2 de sobra/justos/ninguno, forzando o no,
  aceptando o no el cartel; registrando carteles, avisos, redibujos y la línea roja): igual; 2 mutaciones detectadas.
  **En vivo, con Clementino abierto a la vez en la ficha y en el mapa (Saulo-Prueba)**: sin tocar nada, el mapa no
  escribiría ninguna parte y su resumen es idéntico al guardado; entrar en sigilo desde el mapa → mapa, Firebase y la ficha
  de la otra pestaña en Sigilo y No2 11 → 10, la ficha sin nada pendiente; sentado y con 0 No2 (puesto desde la ficha), el
  botón 🧍 apareció solo en el mapa, salió el cartel ("No podés levantarte: cuesta 1 No2 y tenés 0."), "Realizar de
  cualquier modo" lo levantó sin bajar de 0 y publicó la línea roja en la Mesa; salir del sigilo desde el mapa llegó a la
  ficha, y los No2 llenados desde la ficha llegaron al mapa (12/12).
- 2026-10-01: **3c, paso 3 hecho — Consumir lo hace el mapa** (cinturón y mochila). A `comun/ficha-acciones.js`:
  `consumir(S, id, forzar, ui)` (el botón Consumir entero: mesa común, cartel sin No2, trampa consumible, cargas y unidades,
  vida, estado, tiradas, SP, Oleo reparador) y la **vida** (`fijarHp`, `revisarAnkh`, `revisarMuerte`, `aplicarRevivirConAnkh`:
  lo que cambia en el personaje; el cartel de "Inconsciente" y el campo de HP siguen en la ficha), más `purgarSiAgotado`,
  `restaurarSpDeConsumo`, `repararArmadura`, `efectoDeConsumo` y `tiradasDeItem` (las tiradas del ítem sin publicar). La ficha
  los usa con sus nombres de siempre (`consumoUi` para el botón). **El mapa ahora carga el catálogo** (`catalogo.js` y lo
  subido por el grupo, `items-subidos.js`, como la ficha): un consumible viejo busca ahí el estado que deja; sin él dejaría
  otro. Revisa el Ankh y la muerte cada vez que guarda (como la ficha al redibujar la vida). **Siguen delegadas** a la ficha
  escondida: las trampas consumibles (se colocan con su código) y el "Consumir" manual del Ankh. Comparado contra el código
  viejo de la ficha en 850 casos al azar (registrando estado final, avisos, carteles, redibujos, campo de HP, línea roja,
  trampas colocadas o no, desmayo y Ankh automático): igual; 4 mutaciones plantadas, las 4 detectadas. `pruebas.html` ahora
  acepta pruebas que terminan más tarde (async). **En vivo** (Clementino en la ficha y en el mapa a la vez): con el catálogo
  cargado el mapa no escribiría ninguna parte sin tocar nada; Elixir de Fénix (HP 10 → 25, el máximo), Poción de Bonos
  (+23 SP) y Antorcha de brea (estado 3 turnos), 2 No2 cada uno y una unidad menos — igual en el mapa, en Firebase y en la
  ficha de la otra pestaña, sin nada pendiente. Clementino quedó como estaba.
- 2026-10-01: **el paso 4 de la 3c se parte en tres** (es lo más atado al duelo): **4a** las tiradas de combate sueltas
  (Esquivar, Parry, Bloqueo, Fuerza del golpe, Daño); **4b** Atacar (el cartel "¿Qué ataque es?", elegir el objetivo en el
  mapa y abrir el duelo, o el ataque suelto); **4c** las tiradas que el duelo le pide al personaje (`DUELO_HOOKS`: hoy el
  mapa se las pide a la ficha escondida con `duelo-tirar`). Recién con 4c el marco deja de hacer falta para el combate.
- 2026-10-01: **3c, paso 4a hecho**. A `comun/ficha-acciones.js`: `tirarValorStat` (la tirada de un stat, con el cartel de
  sobrepeso de la Evasión) y `sobrepesoPagar`, `parryConArma`, `bloqueoConArma`, `fuerzaGolpeValorConArma`/`fuerzaGolpeConArma`,
  `elegirArmaDefensa` + `armaElegida` (el cartel "¿Con qué arma?"), `tirarDanoDeArma` y `pedirArmaYTirar`. La ficha los usa
  con sus nombres de siempre (`combateUi` en `js/11`, que dibuja sus carteles como antes; el Parry que espera su Bloqueo sigue
  en la ficha, `parryArmaPendiente`). En el mapa (`bnCombateAca`, `bnCombateUi`): los dos carteles (sobrepeso y elegir arma)
  dentro del recuadro, el Parry pendiente en `bn.parryPendiente` (la Botonera muestra el Bloqueo listo) y los efectos al
  golpear con `EfectosGolpe.alPegar`, como la ficha. Comparado contra el código viejo de la ficha en 700 casos al azar **con
  los mismos dados** (misma semilla en las dos): igual, incluidos los números; 4 mutaciones plantadas, las 4 detectadas.
  **En vivo** (Clementino con un arma y un escudo del catálogo): en la ficha, el Parry preguntó con cuál y dejó el Bloqueo
  esperando (la ficha sigue andando igual); en el mapa, Parry → "¿Con qué arma?" con las dos → escudo (No2 11 → 10), Bloqueo
  con el mismo escudo, Fuerza del golpe con el arma (la única que pega: no preguntó), Daño del arma con su Envenenar anotado
  en la Mesa, y Esquivar → el cartel de sobrepeso (el escudo lo dejó 1 de más) → "Pagar 1 No2" (10 → 9) y la Evasión con la
  marca "Sobrepeso (pagó 1 No2)". Todo a nombre de Clementino y con su `ficha`; la ficha de la otra pestaña recibió los No2
  sin nada pendiente. Pendiente menor: el Parry que espera su Bloqueo en el mapa no se borra al pasar el turno ni al atacar
  (Atacar sigue en la ficha); se borra al bloquear o al cambiar de personaje.
- 2026-10-01: **3c, paso 4b hecho — Atacar desde el mapa**. A `comun/ficha-acciones.js`: `atacarConArma` (normal: Tipo ÷ 2 el
  primero con esa arma, Tipo completo después, cuenta el ataque, borra el Parry pendiente) y `ataqueEspecialConArma`
  (oportunidad y contraataque: siempre lo de un primer ataque, no suman al conteo, suman `pdgopor`/`pdgcontra`); la ficha los
  usa con sus nombres de siempre (también desde sus `DUELO_HOOKS`). En el mapa (`bnPreguntarTipoAtaque`, `bnAtacar`): el
  cartel "¿Qué ataque es?" dentro del recuadro (mismos textos y costos que la ficha); al elegir, la Botonera nueva se esconde
  y se elige el objetivo con un clic en el token con el mismo `dueloElegirObjetivoMapa` de siempre, que ahora acepta
  `alSuelto`/`alCancelar` (sin ellos sigue avisándole al marco como antes); "Sin objetivo · tirada suelta" vuelve a mostrar la
  Botonera y ataca acá; Esc cancela sin cobrar (la Botonera queda cerrada, igual que con la de siempre). **Las tiradas que
  pide el duelo una vez creado las sigue haciendo la ficha escondida** (paso 4c). Comparado contra el código viejo en 500
  casos con los mismos dados (sin No2, línea roja, primero/completo, PdG en contraataque/oportunidad): igual; 3 mutaciones
  detectadas. **En vivo como jugador** (Clementino con un arma T4): el cartel mostró 2 No2 para los tres; ataque normal →
  Botonera escondida y el aviso "elegí a quién atacás … Sin objetivo" → tirada suelta: PdG en la Mesa, 12 → 10 No2, el
  ataque contado; el segundo normal ya mostraba 4 No2 (Tipo completo); contraataque → Esc: no cobró nada. **Falta probar
  con un objetivo de verdad** (los creeps de "Claude · pruebas" están ocultos: solo el GM puede apuntarles) — con la sesión
  del GM y 🎮 el control de Clementino.
- 2026-10-01: **P139 anotada**: las preguntas abiertas del contraataque fuera del duelo (¿exige ganar el Parry/Bloqueo?
  ¿cuántos por turno?) estaban solo en el manual y en pendientes; dentro del duelo ya estaba decidido (solo si se gana el
  Bloqueo). Al mudar Atacar se conservó tal cual.
- 2026-10-01: **3c, paso 4c hecho — los ganchos del duelo del personaje**. Lo que el duelo le pide a un personaje (atacar,
  crítico, resistencia a crítico, efectos del arma, daño, Moneda Re-Roll, Flash, habilidad dirigida, opciones de defensa,
  defender, Fuerza del golpe, Bloqueo, arma del contraataque) pasó de `window.DUELO_HOOKS` de la ficha (`js/11`) a
  `comun/ficha-duelo.js` (`FichaDuelo.hooks(() => S, ui)`, más `monedaReroll`/`tirarMonedaReroll` y `pagarFlash`, copiados de
  `js/02` y `js/11`). La ficha arma con eso sus `DUELO_HOOKS` (las **invocaciones** siguen con su código de siempre, adentro del
  mismo objeto). `comun/duelo.js`: `enviar` pregunta antes `cfg.hooksLocal(lado)` y, si hay ganchos, los corre ahí mismo
  (`ejecutar(m, hk)`; sin cerrar los `.scrim` de la página; el daño de una habilidad usa `h.registrarTirada`). El mapa le pasa
  `bnHooksDuelo`: para el personaje de la Botonera nueva (si este usuario puede guardarlo y, si es GM, con ⚗ prendido) contesta
  él mismo; `bnPublicar` avisa `tirada-registrada`, como `registrarTirada` de la ficha, para que el duelo recoja la tirada.
  El mapa además carga `confirmar-turno.js` (el «¿es tu turno?» del Flash). Comparado contra el código viejo (sacado del último
  commit, con los mismos atajos que la ficha) en 150 personajes y duelos al azar **con los mismos dados**: 2455 llamadas
  iguales, 0 distintas; 4 mutaciones plantadas, las 4 detectadas. `pruebas.html`: 152 en verde (5 nuevas). **En vivo** ("Test con
  claude elsaulo", GM con 🎮 el control de Silvia Suller y un creep al lado): **atacando** desde la Botonera nueva, el PdG
  (6 → 3 No2, ataque contado), el crítico y el daño (1d6+4 = 9, creep 5 → 0 HP) los hizo el mapa sin mandarle nada al marco;
  **defendiendo** del creep, las opciones de defensa aparecieron al instante (Evasión, Parry con la Cimitarra y con el Broquel,
  con el Bloqueo de cada uno), el Parry (3 → 2 No2, Bloqueo pendiente) y el Bloqueo (borró el pendiente) los hizo el mapa; lo
  del creep fue a GM Tools como siempre. Pasó la mitad del daño (20 → 17 HP) y el Broquel perdió 1 de durabilidad en la ficha,
  que estaba abierta en la otra pestaña y quedó igual. Silvia quedó con 20 HP y 6 No2, sin el control del GM.
- 2026-10-01: **3c, paso 5a hecho — las habilidades manuales y semiautomáticas**. A `comun/ficha-acciones.js`, copiados de la
  ficha: `ejecutarHabilidad(S, id, armaId, forzar, ui)`, `confirmarCostoVariable(S, it, sp, nitros, arma, ui)` (devuelve true si
  se ejecutó), `anunciarHabilidad`, `habilidadTira`, `tirarPrimeraDeHab`, `tirarSegundaDeHab`, `registrarAtaqueDeHabilidad` y
  `limiteCostoX`; a `comun/ficha-duelo.js`, `usarFlashFueraDelDuelo`. El `ui` de habilidades suma `mesaHabilidad`, `fijarHp`,
  `efecto`, `colocarTrampa`, `avisarZona`, `terminar` (lo que pasa después de cobrar), `flashFuera`, `elegirArmaHab`, `pedirCostoX` y
  `cerrarCostoX`. La ficha los usa con sus nombres de siempre (`habUi` en `js/11`, con los carteles de siempre). El "arma
  pendiente" del costo X (`pendingArmaHab`) ahora se anota solo al abrir ese cartel (antes quedaba anotada siempre, sin que nadie
  la leyera). En el mapa (`bnHabAca`, `bnHabUi`, `bnMesaHabilidad`): 📣 manuales, 💰 semiautomáticas sin trampa/zona/portal, ⚡
  Flash fuera del duelo, el costo X (cartel `#bn-costox` en el recuadro), el arma de un costo "como un ataque" y la 🎲 segunda
  tirada; las ✨ automáticas y las que colocan algo se le siguen pidiendo a la ficha escondida. Comparado contra el código viejo
  (la ficha entera de habilidades, con sus carteles) en 200 personajes con 4 habilidades al azar y los mismos dados: 599 iguales
  y 1 distinta solo por la sangría del HTML del cartel de armas; 4 mutaciones plantadas, las 4 detectadas. `pruebas.html`: 157
  en verde (5 nuevas). **En vivo** ("Test con claude elsaulo", 🎮 Silvia Suller con 5 habilidades de prueba): desde la Botonera
  nueva, Anunciar no cobró nada; la semiautomática cobró 2 SP y 1 No2 y tiró el PdG; la segunda tirada sacó 2d6; la "como un
  ataque" cobró 3 No2 y contó el ataque; el costo X abrió el cartel y cobró los 3 SP elegidos; el Flash preguntó el turno y cobró
  1 SP — todo sin mandarle nada al marco, a nombre de Silvia en la Mesa y con la ficha de la otra pestaña al día. Desde la ficha
  (versión nueva) también: semi y costo X con su cartel. Silvia quedó con todo lleno y sin el control del GM; las 5 habilidades
  de prueba quedaron en su ficha (sirven para el 5b).
- 2026-10-01: **3c, paso 5b hecho — las habilidades ✨ automáticas**. A `comun/ficha-acciones.js`, copiados de la ficha (`js/02` y
  `js/01`): `terminarEjecucionHab(S, it, arma, xSp, xNitros, ui)` (semi: anunciar y tirar; auto: ataque con arreglos, zona,
  «solo sobre vos», dirigida o, sin Ejecución armada, como semi), `ataqueDeHabArma`, `habDueloDatos`, `xDeHab`,
  `aplicarHabSobreMiDirecto`, `dueloAplicarEfectoPropio(S, fichaId, d, ef, ui)`, `aplicarEstadoRecibido`, `estadoDeSpec(spec,
  presets)`, `durAviso`, `desgastarItem` y `rompeArmaduraAlAzar`. El `ui` suma `yo()`, `dueloDisponible()`, `puedeEscribir()`,
  `elegirObjetivo(cfg)`, `colocarZona`, `presets` y `recordatorios`; `cambio` además recibe 'equipo' y 'mochila'. La ficha los usa
  con sus nombres de siempre (`habUi`); se sacaron `habDueloDe`, `lanzarDueloDeHab` y `alcanceDeHab`, que ya no los llamaba nadie.
  En el mapa (`bnHabAca`, `bnElegirObjetivo`, `bnRecordatorios`): las automáticas también las hace el mapa — el objetivo se elige
  con `dueloElegirObjetivoMapa` (como Atacar), y el duelo después pide las tiradas al mapa mismo (4c); solo siguen en la ficha
  escondida las que colocan trampa, zona o portal (5c). Comparado contra el código viejo en 250 personajes con 4 habilidades
  automáticas al azar y los mismos dados (terminar la ejecución, estados recibidos con Desgaste y Armadura rota, efecto propio,
  Rompe armadura, desgaste): 1250 iguales, 0 distintas; 4 mutaciones plantadas, las 4 detectadas (una primera mutación sobre la
  X no se notaba porque ninguna Ejecución al azar usaba X: se cambió por una que sí importa). `pruebas.html`: 161 en verde (4
  nuevas; carga `duelo.js` y un `mesaConTexto` vacío). **En vivo** ("Test con claude elsaulo", 🎮 Silvia y el creep): desde la
  Botonera nueva, «Escudo propio» (sobre sí, sin tiradas) se aplicó directo con su anuncio (−1 SP, −1 No2, Blindado); «Rayo»
  (PdG.Esp contra Res.Esp, con daño) cobró, eligió el objetivo y abrió la Ejecución: la tirada de Silvia y el daño (1d6, directo a
  la vida) los hizo el mapa, la resistencia del creep GM Tools — una vez ganó el creep por par o impar, otra ganó Silvia (con el
  Especial subido un rato para probarlo) y el creep pasó de 5 a 4; «Tajo con arreglos» cobró una vez 3 No2 (primer ataque con la
  Cimitarra), tiró el PdG con su +1 y el daño 1d6+6 (el +2 de la habilidad). Desde la ficha nueva, «Escudo propio» igual. Todo
  quedó como estaba (Silvia con Especial 3, sin Blindado, todo lleno y sin el control; creep con 5 HP); las 8 habilidades de prueba
  quedaron en su ficha.
- 2026-10-01: **3c, paso 5c hecho — las habilidades que colocan algo en el mapa**. A `comun/ficha-acciones.js`, copiados de la ficha
  (`js/10` y `js/02`): `avisarZonaAlMapa(S, h, ui)` (portal y zona de habilidad), `colocarTrampaDeHab(S, h, ui)` (con ✨ se anuncia
  y le pide la casilla al mapa; si no, `TokensAuto.colocarTrampas` al lado del token) y `colocarZonaDeHab(S, it, xSp, xNitros, ui)`
  (zona persistente: tira la resistencia una vez y manda la zona con `Combatiente.zonaDeHab`). El `ui` suma `enMapa()` y
  `alMapa(tipo, msg)`: la ficha le sigue mandando el aviso al mapa por `MensajesMapa`; el mapa (`bnAlMapa`) llama directo a
  `portalDeHabilidad`, `zonaDeHabilidad`, `zonaPersistenteDeHabilidad` o `trampaDeHabilidad`, y `bnHabAca` ya acepta toda
  habilidad: **la Botonera nueva no le pide ninguna habilidad a la ficha escondida**. Comparado contra el código viejo en 200
  personajes al azar (dentro del mapa y suelta, con y sin personaje, colocando o no): 2400 iguales, 0 distintas; 3 mutaciones
  plantadas, las 3 detectadas. `pruebas.html`: 164 en verde (3 nuevas). **En vivo** (🎮 Silvia, Botonera nueva): el cono 📣 se
  dibujó, Invocar portal pidió los dos puntos y creó los portales, la ✨ con trampa se anunció y la colocó en la casilla elegida.
  **La zona persistente falló** — y no por este cambio: `crearElementoZona` (mapa) mandaba las casillas como objetos `{dq, dr}`
  en vez de la lista plana `[dq, dr, …]` que exigen las reglas, así que Firestore rechazaba **toda** zona persistente desde que
  existe (2026-09-28), por habilidad o por el asistente de zonas (el cartel culpaba a "las reglas sin publicar", que sí estaban
  publicadas). Arreglado (d63189a) y vuelto a probar: la zona de «Niebla (prueba)» se creó con sus 7 casillas, el estado y la
  resistencia (Esp de Silvia: 3). Todo borrado al terminar (portales, trampa y zona); Silvia con todo lleno, sin estados y sin el
  control; ⚗ apagado.
- 2026-10-01: **3c, paso 6 hecho — la 🔍 y el "Ver"**. Nuevo `comun/ficha-lupa.js` (`FichaLupa`), copiado de la ficha: `contenido(S,
  clave)` (el viejo `lupaHtml` de `js/11` con `lupaBase`, `lupaDesgloseVars`, `lupaStat`, `lupaCostoAtaque`; las 🔍 de las invocaciones
  siguen en la ficha) y `ver(S, key, it)` (la tarjeta de `openViewer`, `js/07`, con `narrativaDe`), más `jobCostoDe` y `formulaSocial`
  (`js/05`, ahora atajos). `comun/lupa.js` reconoce el 🔍 adentro de un recuadro aislado (`lupaDelEvento`, con `composedPath`) y
  le pone `id="lupa-css"` a sus estilos. En el mapa: la Botonera nueva dibuja los 🔍 (`lupaContenido` → `FichaLupa`; los estilos
  copiados al recuadro), el "Ver" se muestra adentro (`#bn-ver`, `bnVer`/`bnVerAccion`): Eliminar lo hace el mapa (si puede
  guardar al personaje) y Editar le pide el editor a la ficha escondida (mensaje nuevo `editar-en-ficha`, `js/14`, que toca el
  Editar de su Ver: con "Editar y subir" si es de otro). Esc cierra primero el cartel abierto del recuadro. **Arreglado de paso
  (de la 3b)**: un clic real del mouse adentro de la Botonera nueva la cerraba — el "clic en el fondo" (`mousedown` del recuadro)
  veía siempre al recuadro como destino (el navegador lo retarguetea); ahora mira `composedPath()[0]`. No se había visto porque
  las pruebas en vivo tocaban los botones por código. Comparado contra el código viejo en 300 personajes al azar (todas las 🔍 de
  cada uno y el Ver de cada ítem, habilidad, talento, pasiva, estado y 3 del catálogo): 24 467 iguales, 0 distintas; 4 mutaciones
  plantadas, las 4 detectadas. `pruebas.html`: 168 en verde (4 nuevas, una del 🔍 adentro de un recuadro aislado). **En vivo**
  (🎮 Silvia, Botonera nueva): se ven 34 🔍; los de Atacar, Evasión y una habilidad abren su desglose sin disparar el botón; un clic
  real del mouse adentro ya no la cierra; el Ver de una habilidad de prueba la mostró y Eliminar la borró (la ficha de la otra
  pestaña se enteró sola); Editar abrió "Editar habilidad" en la ficha escondida; Esc cerró primero el Ver y después la Botonera.
  Silvia quedó como estaba (sin la habilidad de prueba, todo lleno, sin el control); ⚗ apagado.
- 2026-10-01: **3c, paso 7 hecho — lo último que se delegaba**. A `comun/ficha-acciones.js`, copiados de la ficha: `tirarSocial(S, i,
  ui)` (`js/05`), `colocarTrampaDeItem(fichaId, it, ui)` (`js/10`: la trampa consumible, junto al token) y `ankhAMano(S, key, id)` (el
  Ankh usado desde la mochila, `js/06`); la ficha queda con atajos. En el mapa (`bnAccionAca`): el talento se tira a nombre del
  personaje (sin guardar nada, como las tiradas de stats), el Ankh revive y guarda, y Consumir coloca la trampa consumible con su
  `colocarTrampa`. **Con esto la Botonera nueva no le pide ningún botón a la ficha escondida** (solo el Editar del Ver, a
  propósito). Comparado contra el código viejo en 400 personajes al azar (talentos con los mismos dados; trampas con un mapa
  simulado que la coloca, no tiene token, no tiene lugar o falla; el Ankh en mochila, cinturón o inexistente): 400 iguales, 0
  distintas; 3 mutaciones plantadas, las 3 detectadas. `pruebas.html`: 171 en verde (3 nuevas). **En vivo** (🎮 Silvia con un
  talento, una trampa consumible y un Ankh de prueba, HP 0): el talento tiró 1d4+4; Consumir la trampa la colocó junto al token,
  gastó el ítem y 2 No2 (de la mochila); el Ankh la revivió con 5 HP (25 % de 20) — todo sin mensajes al marco y con la ficha de
  la otra pestaña al día. Todo restaurado (trampa borrada del mapa, Silvia con 20 HP y 6 No2, sin los ítems de prueba ni el
  control); ⚗ apagado. **La 3c quedó terminada**; la 3d espera las decisiones del dueño (ver "Para retomar").
