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
1. Tirar un stat, Percepción, Fuerza del golpe (con el cartel de sobrepeso).
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

## Cómo va
- 2026-10-01: plan escrito; esperando las respuestas.
