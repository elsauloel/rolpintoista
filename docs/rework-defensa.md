# Rework de la defensa (fase 2) — hoja de trabajo

> Igual que `rework-armas.md`: el asistente propone, el dueño responde, y todo queda escrito para retomarlo desde otra conversación.
> Contexto: P114 (escasez de la Resistencia a crítico por slots) en [`preguntas-abiertas.md`](preguntas-abiertas.md), reglas del crítico en [`guia-de-diseno.md`](guia-de-diseno.md) y hoja de ruta en [`hoja-de-ruta-rework-catalogo.md`](hoja-de-ruta-rework-catalogo.md).
> Sandbox: los slots por Tipo son **diseño del catálogo**, no una regla del juego: en la mesa se puede inventar cualquier ítem con cualquier resistencia.

## Cómo está hoy el catálogo (relevado 2026-09-25)
Slots de equipo: **cabeza, torso (armadura blanda o rígida), manos, piernas, pies, cinturón, escudo (1 o 2 manos) y 2 anillos**. Las resistencias a crítico están en los mods `tipo1…tipo5` (= Tipo 4, 6, 8, 10, 12).
| Res. a crítico | Ítems | Slots donde aparece hoy | Máximo por ítem |
|---|---|---|---|
| Tipo 4 | 104 | todos los del cuerpo, escudos y un anillo | +3 |
| Tipo 6 | 126 | ídem | +2 |
| Tipo 8 | 95 | ídem | +2 |
| Tipo 10 | 23 | torso rígido, cabeza, manos, pies, piernas, escudos, anillo | +2 |
| Tipo 12 | 7 | pies, cabeza, torso rígido, piernas, manos | +2 |
Problema: **casi todos los slots dan casi todas las resistencias**, así que con un equipo entero se acumula mucha y el crítico se vuelve raro. Hay que repartir por slot (P114).

## Propuesta de slots por Tipo (P114) — sin responder
La idea: **un Tipo alto solo lo dan pocos slots**, con un tema (cada Tipo es un tipo de golpe).
| Res. a crítico | Slots que pueden darla | Cantidad | Tema |
|---|---|---|---|
| **Tipo 4** (punzante) | cabeza, torso, manos, piernas, pies, escudo | 6 | Golpes de punta: se frenan con casi cualquier pieza (la más común). |
| **Tipo 6** (cortante) | torso, manos, piernas | 3 | Cortes: torso y extremidades cubiertas (cotas, guanteletes, grebas). |
| **Tipo 8** (hacha) | torso **rígido** y escudo | 2 (sin casco, como dijo el dueño) | Golpes que rompen: solo placas y broqueles. |
| **Tipo 10** (contundente) | **cabeza, escudo** | 2 (escudo sumado el 2026-09-30: «no tan infrecuente») | Golpes que abollan: el casco y el escudo que los frena. |
| **Tipo 12** (explosivo) | **ninguno fijo**: solo cinturón o anillos y piezas legendarias | — | Casi nunca se resiste: es el arma más rara. |
**Valor por ítem según tier** (tope de la resistencia que puede dar una pieza):
| Tier | Tipo 4 | Tipo 6 | Tipo 8 | Tipo 10 | Tipo 12 |
|---|---|---|---|---|---|
| Común | +1 | +1 | — | — | — |
| Buena Calidad | +1 | +1 | — | — | — |
| Raro | +2 | +1 | +1 | +1 | — |
| Excepcional | +2 | +2 | +1 | +1 | — |
| Legendario | +3 | +2 | +2 | +2 | +1 |
**Máximo realista equipado** (con piezas Excepcionales/Legendarias en todos los slots elegibles): Tipo 4 hasta ~+9–12 (**a propósito casi inmune**: los punzantes acentúan el crítico potente, no la cantidad de niveles), Tipo 6 ~+5–6, Tipo 8 +2–3, Tipo 10 +2, Tipo 12 +1. Con equipo de tier medio (Raro): Tipo 4 ~+6, Tipo 6 +3, Tipo 8 +1–2, Tipo 10 +1. *(A calibrar contra el daño de crítico de las armas: ver preguntas.)*
**Compensación:** las armaduras rígidas (más resistencia) cuestan Evasión o Movimiento; las blandas dan Evasión pero solo Tipo 4. Todo, sugerencia de catálogo.

## Preguntas para el dueño
1. ¿Te cierra el reparto de slots (Tipo 4: 6 · Tipo 6: 3 · Tipo 8: 2 · Tipo 10: casco · Tipo 12: casi ninguno)?
2. ¿Tipo 6 en torso, manos y piernas, o preferís otros tres slots (cabeza y pies)?
3. ¿Los topes por tier de la tabla te parecen bien, o querés que la resistencia máxima sea menor?
4. **Tipo 12:** ¿solo cinturón/anillos/legendarias, o directamente ninguno?
5. ¿Las **armaduras blandas** solo dan Tipo 4, o también Tipo 6?
6. Cuando esté decidido, ¿aplico el reajuste automático a los ~150 ítems defensivos (quitar las resistencias en slots no permitidos y bajar topes) para que el dueño audite por lista, igual que con las armas?

## Respuestas y avance (2026-09-25)
Dueño: "Me parece bárbaro tu criterio, dale para adelante y si se te ocurren más objetos para ampliar el catálogo, mandale nomás." → **aprobado el reparto de slots y los topes por tier**. Decisiones por defecto (a revisar en la auditoría): Tipo 6 en torso rígido, manos y piernas; las armaduras blandas solo dan **Tipo 4**; **Tipo 12 solo en cinturón y anillos** (Legendarios, +1; se quitó la opción de "cualquier pieza Legendaria" porque acumulaba 7).
**Hecho:**
- `herramientas/reajuste_defensa.py` (comandos `auditoria` y `resumen`): aplica las reglas a las piezas del catálogo actual (**145 de 377 con cambios propuestos**) y valida que las piezas nuevas las cumplan. **No toca `datos/catalogo.json`** hasta que el dueño audite.
- **28 piezas nuevas** en `datos/defensa-nuevos.json` (cabeza, torso blando y rígido, manos, piernas, pies, escudos, cinturón y anillo; de Común a Legendario), con **descripción narrativa** aparte del resumen de reglas.
- Herramienta `datos/auditoria-defensa.html` (menú ☰ → 🛡 Auditoría de defensa): misma mecánica que la de armas (✅ 🔧 🔄 🗑 + notas, guarda en `datos/auditoria-defensa.json`), con filtro "solo con cambios".
- **Máximo equipable por Tipo** (mejor pieza por slot): antes {T4: 19, T6: 13, T8: 9, T10: 9, T12: 7} → ahora {T4: 18, T6: 6, T8: 4, T10: 2, T12: 2}; con equipo hasta Raro: {T4: 12, T6: 3, T8: 2, T10: 1, T12: 0}. **Aviso:** el Tipo 4 sigue muy alto (18): casi inmune a los punzantes; a decidir si se le baja el tope o se acepta (los punzantes acentúan el crítico potente, no la cantidad de niveles).
- Al quitar resistencia una pieza pierde valor; el **precio no se recalibró todavía** (falta el motor de valor de la defensa).
**Siguiente:** [`sondeo-mecanicas.md`](sondeo-mecanicas.md) (resistencias a daño mágico + qué mecánicas representar en armas, equipo y creeps).

## Piezas de visión (2026-09-25, pedido del dueño)
Dueño: "sumate algunas variantes que sumen +1, +2, +3 a la visión; si son comunes, un poco de visión y no sube mucho el precio; no modifiques las que están; que haya al menos un casco legendario que revele lo oculto en todo su rango de visión, legendario y caro; y otro efecto piola, buena defensa, etc."
**12 piezas nuevas** (`datos/defensa-nuevos.json`, marcadas `categoria: vision`; stat `vision` = radio del campo de visión, base 6). No se tocó ninguna pieza existente.
| Visión | Piezas (tier · precio) |
|---|---|
| **+1** | Gafas de aviador (Común · $60) · Capucha de vigía (Común · $55) · Yelmo de vigía (Buena · $120) · Monóculo del cartógrafo (Buena · $130, +1 Esp) · Capa del explorador (Buena · $130, +1 Evasión) · Anillo de vista aguda (Común · $1200) |
| **+2** | Casco del centinela (Raro · $300) · Antifaz del ave nocturna (Raro · $250, +1 Evasión) · Anillo de vista aguda mayor (Raro · $2000) |
| **+3** | Casco de ojos de águila (Excepcional · $750, +1 PdG) · Anillo de vista aguda superior (Legendario · $3000) |
| **Revela lo oculto** | **Yelmo del Ojo Que Todo Lo Ve** (Legendario · **$1900**, Def 7, Res. crítico Tipo 4 +3 y Tipo 10 +2, +1 Esp, Visión +3): en todo su campo de visión no puede haber nada oculto (`revelaOculto: true`). |
Criterio: la visión **no sube mucho el precio** en las piezas comunes (+$10–20 sobre una pieza equivalente sin ella); las de +2/+3 cuestan más, y revelar lo oculto es lo más caro.
**✋ A mano:** el efecto de revelar lo oculto todavía no es automático (el GM usa 👁 Revelar lo oculto dentro del radio del portador). Pendiente de código: en el mapa, que un personaje con `revelaOculto` (publicado por la ficha en su resumen, como `percepcionAumentada`) deje ver a los jugadores lo que está en sigilo u oculto dentro de su campo de visión.


## Cinturones, mochilas y piezas que amplían los consumibles (2026-09-25)
Dueño: "cinturones más grandes, que algunos den más o menos Defensa según su calidad; mochilas con más slots; que la mochila y el cinturón sean un slot en sí mismos (uno solo puesto); y, como rareza y nota de color, ítems defensivos que amplíen los slots de consumibles (como la Toga de Maestre)."
**Ya existía:** el cinturón como slot de equipo (`SLOT_DEFS`, máximo 1) y el mod `capcinturon` que amplía sus ranuras (Toga de Maestre lo usa).
**Nuevo en el código (`ficha.html`, `asistente-item.js`, editor de catálogo, gm-tools, generador de tiendas):** categoría de ítem **Mochila** (`tipoItem: 'mochila'`), **slot de equipo Mochila (uno solo puesto)** y stat **`capmochila`** ("Ranuras mochila"): la capacidad efectiva de la mochila es la base que se escribe a mano + lo que da la mochila equipada (`capMochilaEfectivo()`, con el aviso "(+N de la mochila equipada)"); también la usa el botín.
**Ítems nuevos (en el catálogo, sin auditar):**
- **Cinturones (11):** Común +1/+2 ranuras (uno con +1 Def) · Buena +2/+3 (guardia +2 Def) · Raro +4/+5 con Def 1–2 (bandolero +1 Eva) · Excepcional +7 (gran boticario) o +4 con Def 4 (blindado de sargento) · Legendario: **Coleccionista +10 ranuras**, **Titán +6 ranuras, Def 5 y Res. crítico Tipo 12 +1**.
- **Mochilas (10):** +4 / +6 (Común), +8 / +10 (Buena; la alforja de mula −1 Mov), +12 / +10 con Def 1 (Raro), +16 con +1 Esp / +18 con −1 Mov (Excepcional), **+24 con Def 2 (Zurrón del gigante)** y **+30 (Mochila sin fondo)** (Legendario).
- **Piezas defensivas con ranuras de cinturón (6, rareza y nota de color):** Delantal de boticario (+1) · Guantes de prestidigitador (+1) · Chaleco de mil bolsillos (+2) · Sombrero de copa del mago (+2) · Gabardina del contrabandista (+3) · **Capa de mil pliegues (Legendaria, +5)**.
*Pendiente de balance:* la base de la mochila (hoy 20, editable) y si conviene bajarla ahora que existe la mochila como slot; el precio de estos ítems es una propuesta.

**Movimiento negativo (2026-09-25):** a raíz de la regla de la guía ("−1 Mov = −1 casillero por turno, drawback muy grande"), en las piezas nuevas se cambió el −1 Movimiento por **−1 Evasión o −1 Iniciativa** (Coraza de placas, Armadura de campeón, Escudo de asedio, Alforja de mula). Se conservó solo donde el beneficio es enorme: **Coraza del Titán caído** (Def 12, Res. crítico Tipo 4 +3 / Tipo 6 +2 / Tipo 8 +2) y **Mochila del buhonero** (+28 ranuras, subida de +18, $1100). **Las 20 piezas del catálogo actual con Mov negativo** (escudos torre, sabatones, grebas y corazas pesadas) llevan un aviso en la auditoría para decidir caso por caso; no se tocaron.

**Aclaración del dueño sobre el Movimiento (2026-09-25):** "menos uno al movimiento es menos un Nitro" (no "un micro"): la regla de fondo es la misma (drawback muy grande) y se mantienen los cambios de arriba; el texto de la guía y el aviso de la auditoría ahora dicen "−1 Nitro". **Consecuencia:** el **+1 de Movimiento también es +1 Nitro**, así que se sacó el +1 Mov de las variaciones de 5 piezas comunes/buenas (pasan a Iniciativa o Evasión) y a las *Botas del Caminante de Viento* (Mov +1) se las subió de Raro $240 a **Excepcional $650**. *Pendiente:* las 29 piezas actuales con Mov positivo (y su precio) se revisan con el mismo criterio en la auditoría.

**Yelmo del Ojo Que Todo Lo Ve (2026-09-26):** ahora es **automático** (`veoculto` 30). Y se corrigió el bug del importador que había descartado el stat `vision` de las piezas de visión (ver `rework-consumibles-visibilidad.md`).

## Fase 3 — la Defensa total (arranca 2026-10-04)
Pedido del dueño: «encarar lo defensivo, arrancar con la defensa». Referencia suya (2026-10-03): en nivel 1 casi nadie tiene menos de 4 de
Defensa; más adelante, 8–10.

**Diagnóstico:** la Defensa de cada pieza **se suma** (cabeza + torso + manos + piernas + pies + escudo). Con el catálogo de hoy, un equipo
completo da (mediana por slot):

| Equipo completo | Defensa total |
|---|---|
| Común, liviano (sin escudo) | ~11 |
| Común, pesado + escudo | ~17 |
| Buena, liviano / pesado + escudo | ~19 / ~30 |
| Rara, liviano / pesado + escudo | ~23 / ~35 |

Contra armas de 1d6–2d8 + Dmg, con eso casi ningún golpe entra (solo el crítico, que ignora la Defensa). Está muy por encima de la referencia
4 → 8–10. Propuestas en la conversación del 2026-10-04 (presupuesto por equipo completo, Defensa concentrada en torso y escudo, el resto de
los slots con otras cosas).

**Idea del dueño (2026-10-04): el oro es el regulador.** Nadie tiene todos los slots ocupados desde el principio: el equipo se va armando y el
oro se reparte entre armas, defensa y consumibles de supervivencia. Eso da mucho espacio de diseño. Pendiente para otro momento: **una hoja de
ruta del GM de cuánto oro dar** (el GM no puede tener todas las variables en la cabeza). Dato de hoy (precio típico por pieza): Común — arma 75,
casco 70, torso 70–105, manos 60, piernas 60, pies 65, escudo 60 (equipo completo con arma ≈ 460–520); Buena ≈ 85–130 por pieza; Rara ≈ 130–270.
Con el DDE inicial (300) alcanza para arma + torso + casco + algún consumible → Defensa ~5, en línea con la referencia «4 en nivel 1».

**Idea del dueño (2026-10-04): las resistencias a crítico importan más que la Defensa.** Son más escasas y difíciles de saltear, y un crítico
fuera de control rompe el juego: ahí hay que estar más afilado. **El generador de tiendas como regulador:** que no elija solo al azar por rareza,
sino que genere una **escasez controlada** de ciertos slots y efectos según el tamaño de la tienda (en las chicas, poca disponibilidad de
ciertos efectos; siempre un porcentaje, pero controlado). Hay que calibrar mucho esos porcentajes. Precedente que ya existe:
`CHANCE_MAGICO_POR_TAMANO` en `gm-toolset/vendor-generator.html` (probabilidad y máximo por tamaño, de ambulante a capital). Dato de la fase 2:
máximo equipable de resistencia a crítico {T4 18, T6 6, T8 4, T10 2, T12 2}; con equipo hasta Raro {T4 12, T6 3, T8 2, T10 1, T12 0}.

**Hoja de ruta del GM, primer paso (2026-10-04, pedido del dueño):** «💰 Botín estimado» de un mapa (en 🗺 Mapas del mapa y en la pestaña del mapa
de GM Tools): cuánto van a sacar si derrotan a todos — el oro de los creeps más la venta de lo que sueltan (arma, equipo, trofeo, a la mitad del
precio) y el consumible al azar como valor esperado —, con el reparto entre 3, 4 y 5 jugadores y la XP. Falta: cuánto oro conviene dar por combate
o por nivel (la referencia contra la que comparar este número).

## Ideas para la progresión defensiva con escasez controlada (propuesta, 2026-10-04 — a discutir con el dueño)
1. **Curva objetivo por nivel** (la referencia de todo): Defensa y resistencias esperadas por nivel (p. ej. N1: Def 4, T4 1 · N3: Def 6–7, T4 2,
   T6 1 · N5: Def 8–10, T4 3, T6 2, T8 1, T10 0–1). Contra ella se calibran armas, creeps, tiendas y el oro que da el GM.
2. **Presupuesto por pieza** (como la calculadora de armas): cada slot y calidad tiene puntos; la Defensa y las resistencias salen del mismo
   presupuesto, y la resistencia a un Tipo alto cuesta más puntos (T4 1 · T6 2 · T8 3 · T10 4 · T12 5). El precio sale de los puntos.
   Una «calculadora de defensa» para armar y auditar.
3. **Escasez en el generador de tiendas**: cada pieza lleva una marca de escasez según lo que da (T8+ escaso, T10 muy escaso, T12 único) y cada
   tamaño de tienda tiene probabilidad y tope por marca (como CHANCE_MAGICO_POR_TAMANO); además, las tiendas chicas no tienen todos los slots
   (cuotas por slot) y por rubro (armero, sastre). Con un **simulador de tiendas** (mil tiendas por tamaño → % de encontrar cada cosa) para calibrar.
4. **Drops de jefes como canal propio**: lo más escaso sale de creeps puntuales, no de las tiendas: el GM lo controla armando el mapa (el botín
   estimado lo muestra).
5. **Reparar como sumidero de oro**: reparar cuesta según la Defensa y las resistencias de la pieza; tener mucha defensa cuesta oro sostenido.
6. **Contrapesos de lo pesado**: −Evasión, −Iniciativa, peso (sobrepeso → No2).
7. **Avisar, no bloquear**: la 🔍 de la Defensa y de las resistencias avisa si está por encima de lo esperado para el nivel (ayuda al GM).
8. Más adelante: conjuntos (bono con 3 piezas) y el herrero que sube una pieza un escalón por oro.

## Respuestas del dueño a las ideas (2026-10-04)
- **Curva, nivel 1: Defensa en un espectro de 4 a 10.** «Un tanque va a querer invertir más en defensa que en todo lo demás: tiene que haber un
  margen. Vamos a trabajar en espectros.» Para tener 10 tiene que gastar mucha plata: arma común barata y todo lo demás en defensa. **Resistencias
  en nivel 1: hasta 2 de Tipo 4 y hasta 1 de Tipo 6.** (Ejemplo, ajustable.)
- **Rubros de tienda: tres** (eventualmente un cuarto): **Almacén de ramos generales, Herrero y Bazar arcano.** El Bazar arcano es el viejo
  Alquimista con un nombre más amplio: pociones, pergaminos, algún objeto mágico. *(Hecho: el generador y el manual ya dicen «Bazar arcano»; la
  clave interna sigue siendo `alquimista`.)*
- **Simulador de tiendas:** «fabuloso»; se arma a medida que avancemos.
- **Lo más escaso, de los jefes:** sí, **pero todo tiene que poder aparecer en una tienda, con chance baja** (nunca cero): el GM igual revisa la
  tienda antes de publicarla y puede re-rolear cualquier ítem.
- **Reparar:** todavía no se probó cuán seguido se rompen las armaduras. **Defensa y durabilidad son cosas distintas:** la Defensa de una pieza
  puede llegar a 0 (Armadura rota) mientras la durabilidad sigue bajando; **recién con la durabilidad en 0 se anulan todos los demás efectos de la
  pieza**. *(Ya funciona así: cada Armadura rota baja 1 la Defensa de la pieza —hasta 0— y 1 su durabilidad; con la durabilidad en 0 la pieza no
  da nada, `FichaCalculo.itemRoto`.)*
- **Sobrepeso → Iniciativa:** «puede ser exactamente la solución»; lo consulta con sus colegas (P154). Por ahora el sobrepeso queda como está.
- **Avisar, no bloquear:** como **herramienta solo para el GM**, para plantear estrategias y diseñar creeps que sorteen esa dificultad.
- **El orden propuesto, aprobado:** curva por nivel → presupuesto por pieza y calculadora → catálogo parte por parte (torso primero) → escasez en
  el generador con el simulador → drops de jefes y reparar.

**Curva por nivel ✅ para empezar a probar (dueño, 2026-10-04)** y **calidad ↔ nivel ✅** (Común niveles 1–2, Buena 3–4, Rara 5):

| Nivel | Defensa (liviano–tanque) · resistencia a crítico máxima |
|---|---|
| 1 | 4–10 · T4 ≤2 · T6 ≤1 |
| 2 | 5–12 · T4 ≤2 · T6 ≤1 |
| 3 | 6–14 · T4 ≤3 · T6 ≤2 · T8 ≤1 |
| 4 | 7–16 · T4 ≤3 · T6 ≤2 · T8 ≤1 · T10 ≤1 |
| 5 | 8–18 · T4 ≤4 · T6 ≤3 · T8 ≤2 · T10 ≤1 · T12 ≤1 (legendario) |

**Medición: cuánto daño entra contra esa Defensa (2026-10-04).** Golpe = dados del arma + daño fijo + Dmg (= Fuerza). Armas cuerpo a cuerpo del
catálogo de la calidad del nivel; Fuerza según el reparto sugerido (brutal 30 %, rápido 18 %, mago 8 % de 33 + 3 por nivel). Daño que entra por
golpe, promedio (y % de golpes que hacen algo) contra Defensa piso / medio / techo:

| Nivel | Brutal · rápido · mago |
|---|---|
| 1 (4/7/10) | 9,5 / 6,4 / 3,5 · 5,6 / 2,7 / 0,9 (32 %) · 2,7 / 0,9 / 0,2 |
| 3 (6/10/14) | 11,3 / 7,1 / 3,4 · 7,2 / 3,3 / 1,0 · 3,3 / 1,0 / 0,2 |
| 5 (8/13/18) | 13,4 / 8,5 / 4,0 · 8,5 / 4,0 / 1,3 · 4,0 / 1,2 / 0,3 |

Vida: liviano 25–35, tanque 55–80. **Lectura:** contra el piso y el medio el combate físico funciona (3 a 8 golpes para tumbar a alguien liviano);
**contra el techo, un tanque es casi inmune al golpe físico** (un brutal le hace 3–4 por golpe: 15–20 golpes para tumbarlo; uno rápido, menos de 1).
Lo que lo atraviesa: el crítico (ignora la Defensa), el daño mágico, el veneno y el sangrado, y romperle la armadura. Con un techo que suba de a 1 por
nivel (10, 11, 12, 13, 14) el brutal le hace 3,5 → 7,5 por golpe (11–16 golpes). A decidir si el techo sube de a 2 o de a 1.

**Nota del dueño (2026-10-04): daño ácido.** Que sea frecuente en creeps, daños mágicos, habilidades y trampas, para tener opciones de **romper
armadura** (el contrapeso del tanque). A diseñar.

**Siguiente (dueño):** antes de crear ítems, hablar de **otras herramientas de diseño** además de la Defensa y las resistencias a crítico: bonos a
la Evasión, a la visión… variables más sutiles para un catálogo diverso.

**El techo del tanque sube de a 2 por nivel ✅ (dueño, 2026-10-04):** el tanque queda igual de duro en todos los niveles (un golpe normal de un
brutal le saca 3–4) y se lo atraviesa con las herramientas especiales. **Condición anotada:** esas herramientas (crítico de las armas mejores, daño
mágico que escala, veneno y sangrado, el ácido que rompe armadura) tienen que crecer con los niveles; se mide cuando se revisen. Recordatorio del
dueño: la defensa se acumula en muchos slots y el arma pega de a una — la curva es el total del equipo completo; el presupuesto de cada pieza se mide
contra ese total.

## Paleta de variables e identidad por slot (2026-10-04)
**Identidad por slot ✅** («me parece bárbara»): cabeza → visión, Percepción, Res.Mt, T10 · torso → la Defensa principal, vida, Armadura mágica
(túnicas) · manos → Parry, Res.CC · piernas → Evasión, carga · pies → Iniciativa, Evasión, Res.CC contra caerse o trabarse · escudo → Defensa,
Bloqueo, T8/T10 · cinturón → ranuras, T12 · anillos → una resistencia o un stat chico, sin Defensa.

**Costo en puntos de presupuesto ✅** (punto de partida, se ajusta con la calculadora): Defensa 1 · Res. crítico T4/6/8/10/12 = 1/2/3/4/5 ·
Evasión 2 · Iniciativa 2 · Res.CC 1 · Res.Esp 1 · **Res.Mt 0,5** (dueño: los efectos que se resisten con Res.Mt son escasos) · Visión 0,5 ·
Percepción 0,5 · +5 vida 1 · Armadura mágica 1 · No2 máximo 4 · ranura de cinturón 1.

**Agregados del dueño:**
- **Resistencia elemental específica** (fuego, hielo, rayo, tóxico, ácido…): tan situacional que **pesa poco**; sirve para sumarle un bonus a una
  pieza sin desbalancearla. *(Mecánica nueva a construir: un stat por elemento que se resta al daño de ese tipo; hace falta que el daño de las trampas
  y las armas diga su elemento — hoy solo lo dicen las habilidades y las zonas. Hasta entonces, ✋ a mano.)*
- **Ranuras de cinturón en otros slots:** una **túnica de maestre** (como los maestres de Game of Thrones, con pociones y venenos escondidos en la
  túnica) y un **casco tonto** como el de Homero en Los Simpsons (dos cervezas con pajitas curvas que llegan a la boca): un casco con dos pociones.
- **Bono de sigilo:** en alguna armadura blanda o en una máscara / capucha. *(Mecánica nueva: hoy el sigilo es Destreza contra Percepción; haría falta
  un stat «Sigilo +N» que se sume al esconderse.)*
- **Cantidad de ítems:** no hay un número fijo por slot (ni «tantos cascos comunes»): **se crean tantos como hagan falta para tener amplitud y
  diversidad de efectos**, pensando en que al final el generador de tiendas, por estadística, ofrezca cosas útiles.

**Resistencia elemental: por dónde se empieza (dueño, 2026-10-04):** se empieza a implementar **en los creeps**; las zonas y áreas, en buena
parte, van atadas a las **trampas** (que ya tienen familias elementales: fuego, hielo, rayo, gas/tóxico). Después, **las armas mágicas**: el dueño
las tiene pendientes porque «las posibilidades son tantas y las mecánicas tan variables» que todavía no sabe por dónde arrancar; la idea es crear
eventualmente un pool grande y diverso.

**Bolsas, reparto por parte y desventajas ✅ (dueño, 2026-10-04).** **Sigilo +N** (dueño): mejora la tirada del que está escondido cuando lo
intentan descubrir (en las zonas de riesgo o con otro mecanismo), es decir, la Destreza contra la Percepción del que busca.

**Calculadora de defensa** (`herramientas/calculadora_defensa.py`, 2026-10-04): puntos por bono, bolsa por parte y calidad, precio sugerido
(10 + 25 por punto: un equipo Común completo al máximo ≈ 420 + el arma), máximo equipable contra la curva. **El catálogo de hoy:** de 438 piezas
defensivas, **346 se pasan de su bolsa**; con lo mejor de cada parte hasta Común se llega a Defensa 34 (la curva dice 5–12) y T4 7 / T6 6 (≤2 / ≤1).
Confirma que el catálogo defensivo se rehace entero, parte por parte. Las 52 piezas con Movimiento negativo cuestan carísimo (−1 Mov = −1 No2 = 4
puntos): en la versión nueva, las desventajas van por Evasión o Iniciativa.

**Armadura mágica (dueño, 2026-10-04): escasa, cara y rara** — resta **todo** daño mágico, arcano o elemental. Pesa **3 puntos** por +1 en la
calculadora (antes 1); solo en piezas Raras o mejores (como ya decía su regla). **Resistencia elemental: 0,5 ✅.** *(Pendiente para cuando se
construya la resistencia elemental: que el daño elemental de las trampas, que hoy ignora la Defensa entera, también descuente la Armadura mágica.)*

## Torso Común — propuesta de cero (2026-10-04, a revisar por el dueño)
Diseñado de cero (el catálogo anterior solo da nombres y conceptos). Bolsa 4 puntos, tope de Defensa 4 (5 si es pesada, con desventaja). Blandas:
pesan 1, Defensa 1–3, solo Tipo 4. Rígidas: pesan 2–4, Defensa 3–5, Tipo 4 o 6, las fuertes cobran Evasión o Iniciativa.

| Torso blando · precio | Qué da |
|---|---|
| Saco de arpillera · 35 | Defensa 1 |
| Camiseta de lona · 60 | Defensa 1 · +1 ranura de cinturón |
| Pechera acolchada · 110 | Defensa 2 · Res.CC +2 |
| Armadura de cuero blando · 110 | Defensa 2 · Evasión +1 |
| Casaca curtida de salteador · 110 | Defensa 2 · Iniciativa +1 |
| Jubón de cuero curtido · 110 | Defensa 3 · Tipo 4 +1 |
| Peto de cuero curtido · 110 | Defensa 3 · Vida +5 |
| Gambesón de lana · 110 | Defensa 3 · Res.CC +1 |
| Campera de cuero con tachas · 110 | Defensa 2 · Tipo 4 +1 · Vida +5 |
| Chaleco de cazador · 110 | Defensa 2 · +1 ranura · Percepción +2 |
| Ropa de explorador · 110 | Defensa 1 · Visión +2 · Percepción +2 · Res.Esp +1 |
| Túnica de aprendiz · 110 | Defensa 1 · Res.Esp +2 · Res.Mt +2 |
| Túnica de maestre · 110 | Defensa 1 · +2 ranuras · Res.Esp +1 |
| Capa de viajero · 110 | Defensa 1 · Res.Esp +1 · Res. hielo +2 · Vida +5 |
| Delantal de herrero · 110 | Defensa 2 · Res. fuego +2 · Res.CC +1 |
| Ropas de sombra · 110 | Defensa 1 · Evasión +1 · Sigilo +1 |

| Torso rígido · precio | Qué da |
|---|---|
| Coraza de puerta · 90 | Defensa 4 · frágil · pesa 3 |
| Armadura de hojalata · 100 | Defensa 3 · Res.CC +1 · frágil |
| Coraza de cuero hervido · 110 | Defensa 3 · Tipo 4 +1 |
| Armadura con tachas · 110 | Defensa 3 · Res.CC +1 |
| Coraza del clan · 110 | Defensa 3 · Res.Esp +1 |
| Peto de escamas de pez gigante · 110 | Defensa 3 · Res. hielo +2 |
| Cota de malla de hierro · 110 | Defensa 4 · Tipo 6 +1 · Evasión −1 |
| Coraza de guardia de cuartel · 110 | Defensa 4 · Tipo 6 +1 · Iniciativa −1 |
| Peto de placas de aprendiz · 110 | Defensa 4 · Tipo 4 +1 · Vida +5 · Iniciativa −1 |
| Puerta de auto ajustada con alambre · 110 | Defensa 4 · Tipo 4 +1 · Res.CC +1 · Iniciativa −1 |
| Armadura pesada de hierro · 110 | Defensa 5 · Tipo 4 +1 · Evasión −1 · pesa 4 |

Abierto: ¿entran ya las de resistencia elemental (Capa de viajero, Delantal, Peto de escamas) y sigilo (Ropas de sombra) con «✋ a mano» hasta
que exista la mecánica, o esperan?

**Resistencias elementales y Sigilo: construidos (2026-10-04)** — ver `comun/CLAUDE.md`. Las piezas con Res. fuego / hielo / … y Sigilo +N ya
funcionan solas (no van «✋ a mano»). Probado en vivo: Llamarada contra un creep con Res. fuego 2 → «2d6 = 9 − Res. fuego 2 → 7 de daño directo».

**Herramienta de diseño nueva (dueño, 2026-10-04): «Indestructible»** — en armaduras Raras (muy escaso), Excepcionales (infrecuente) y Legendarias
(libre). **Decidido (dueño, 2026-10-04): las dos cosas** — nunca se rompe (no pierde durabilidad) **y** no pierde Defensa con la Armadura rota.
*(Falta: cuánto pesa en la calculadora, y construirlo cuando se cargue la primera pieza que lo lleve.)*

## Torso Común: aprobado y cargado (2026-10-04)
**Dueño: «la lista está bien»**, y le sumó piezas que **solo dan Defensa +1, +2, +3 y +4 en cada categoría**, sin nada más, «para que haya más
diversidad aún y opciones baratas». *Por qué:* no todo tiene que ser una pieza con identidad; las simples son el piso barato del mercado y
dejan el presupuesto para el resto del equipo. Cargados en `comun/catalogo.js` (33 torsos Comunes; reemplazan a los 18 viejos — los que conservan
el nombre conservan su id y su narrativa). Precio = 10 + 25 por punto de la bolsa.

| Simples · precio | Qué da |
|---|---|
| Saco de arpillera (blando) · 35 | Defensa +1 |
| Chaleco de cuero (blando) · 60 | Defensa +2 |
| Campera de cuero grueso (blando) · 85 | Defensa +3 |
| Peto de tablas (rígido, pesa 2) · 35 | Defensa +1 |
| Coraza de latón (rígido, pesa 2) · 60 | Defensa +2 |
| Peto de hierro (rígido, pesa 2) · 85 | Defensa +3 |
| Pechera de hierro (rígido, pesa 3) · 110 | Defensa +4 |

- **Sin blanda simple de +4 (dueño, 2026-10-04):** se sacó el Gabán acolchado de cuero. *Por qué:* las blandas van de Defensa 1 a 3 y la rígida es
  la forma de llegar a 4–5 pagando con peso o desventajas; una blanda +4 al mismo precio que la rígida borraba esa diferencia. Quedan 33 torsos Comunes.
- Se fue la **Campera de marinero espacial** (no estaba en la lista nueva).
- **Escasez y generador de tiendas:** sumar piezas simples no interfiere, siempre que el generador elija **primero el rubro y la parte del cuerpo y
  después la pieza** (si eligiera al azar entre todos los ítems, cuantas más piezas de torso haya, más torsos saldrían). Queda para el simulador
  de tiendas.
- **Reparación (dueño, 2026-10-04, hecho):** una pieza **rota** (durabilidad 0) cuesta **el doble** de reparar hasta quedar entera (aunque se
  repare de a un punto: `reparoRoto`). *Por qué:* premia cuidar el equipo antes de que se rompa del todo. El sistema completo de reparación está
  en Herramientas de diseño → A desarrollar.

## Ruta del diseño de los equipos (dueño, 2026-10-04)
**Alcance:** de Común a Rara. Excepcional y Legendaria quedan para otro momento.

**Ruta: a lo ancho, calidad por calidad** (el dueño lo dejó a criterio; se eligió así). *Por qué:* cada calidad corresponde a un tramo de niveles
(Común ↔ N1–2, Buena ↔ N3–4, Rara ↔ N5), y el balance se mide con el **equipo completo** de ese tramo: la Defensa y sobre todo las resistencias a
crítico **se acumulan entre partes**, y eso no se ve diseñando una parte de arriba abajo. Así, al cerrar cada calidad, hay un equipo entero que se
puede medir contra la curva.

1. **Común:** torso ✅ · escudo ✅ · cabeza ✅ · manos ✅ · piernas · pies · cinturón · anillos. **Control:** la calculadora sobre el equipo Común completo
   contra la curva de N1 (Defensa 4–10, T4 ≤ 2, T6 ≤ 1) y N2 (5–12). **Y la Res.CC (dueño, 2026-10-04):** medir cuánta se junta con el equipo completo,
   para que no sea tan abundante que le quite peso a los personajes y efectos que juegan con control (hoy, con torso y cabeza: hasta +4).
2. **Buena:** las mismas partes, en el mismo orden. **Control:** N3 (6–14, T4 ≤ 3, T6 ≤ 2, T8 ≤ 1) y N4 (7–16, T10 ≤ 1).
3. **Rara:** las mismas partes; aparece «Indestructible» (muy escaso). **Control:** N5 (8–18, T4 ≤ 4, T6 ≤ 3, T8 ≤ 2, T10 ≤ 1, T12 ≤ 1).
4. Con el catálogo defensivo armado: **escasez en el generador de tiendas** (elegir rubro y parte del cuerpo antes que la pieza) y el **simulador
   de tiendas**; después, la **hoja de ruta del oro del GM**.
5. Al final: el **manual de diseño** para los colegas.

Cada parte, como hasta ahora: propuesta en una tabla → OK del dueño → se carga reemplazando las viejas de esa calidad. Las piezas viejas de las
calidades que todavía no se rehicieron quedan como están hasta que les toque. La identidad de cada parte (ver «Paleta de variables») ya marca
qué le toca a cada calidad: así lo Común no gasta las ideas de lo Raro.

## Escudos — mecánicas, Común y mapa conceptual (2026-10-04, propuesta a revisar)
**Dueño:** crear con total libertad (lo viejo solo como referencia), tantos objetos como hagan falta, abundancia de opciones; evaluar primero las
mecánicas; a medida que se sube de calidad, más libertad para probar elementos diversos. **Bloqueo = 1 punto ✅.**

**Mecánicas que ya existen y le sientan a un escudo** (costo en la bolsa): Defensa 1 · Bloqueo 1 (y el **peso** ya suma a la tirada de Bloqueo) ·
Parry 1 (un escudo habilita Parry) · Res. crítico T4 1 / T6 2 / T8 3 / T10 4 · Res.CC 1 · Res.Esp 1 · Res.Mt 0,5 · resistencia elemental 0,5 ·
Luz portada 0,5 · ranura de cinturón 1 · +5 vida 1 · PdG de contraataque 1 *(propuesto)* · durabilidad: frágil −0,5 / resistente +0,5 *(propuesto)* ·
desventajas Evasión −1 / Iniciativa −1 (devuelven 2). Bolsa: 3 / 5 / 7 (a dos manos 4 / 6,5 / 9). Tope de Defensa del escudo Común: 2
(propuesto: 3 si es a dos manos).

**Mecánicas nuevas que piden los escudos** (para Buena y Rara, a construir): golpe de escudo (atacar con el escudo: daño chico y chance de Demora
o Derribar), cubrir a un aliado de al lado (bloquear por él), bloquear proyectiles y hechizos, estado al equipar (Espinas, Escudo especial que se
recarga) — este último ya existe como mecánica de ítems.

**Mapa conceptual:** Buena — Tipo 8 con Defensa, aparece Tipo 10 en los pesados, broqueles de duelista (Parry +2), pavés de verdad a dos manos,
combos de dos elementos, Ve lo oculto (escudo espejado), golpe de escudo. Rara — Armadura mágica (escudo rúnico),
Indestructible (muy escaso), Espinas o Escudo especial al equiparlo, Tipo 10 / Tipo 8 +2, reflejar proyectiles y hechizos, elemental fuerte.

**Ajuste del dueño (2026-10-04): el escudo está en la mano, no en el cuerpo.** *Por qué:* lo que protege al cuerpo o a la mente (Res.CC, Res.Esp,
Res.Mt) y lo que se lleva encima (ranuras de cinturón) no es del escudo; y el **contraataque va con el arma**, no con el escudo. Quedan para el
escudo: Defensa, Bloqueo, Parry, resistencia a crítico, resistencia elemental (lo que frena el escudo de frente), luz portada (un farol en la mano),
durabilidad y las desventajas. Costos sugeridos ✅ (frágil −0,5, resistente +0,5). La lista Común se rehízo con eso (27 piezas, a revisar en detalle).

**El peso en el precio (dueño, 2026-10-04):** en un **escudo**, cada punto de peso por encima del primero cuesta **0,25 de la bolsa** (el peso suma a
la tirada de Bloqueo y a la durabilidad: es casi todo ventaja). En las demás partes el peso **no se cobra** (la durabilidad que da se compensa con la
carga que ocupa); rango fijo: blandas 1, rígidas 2–4 según la Defensa. Frágil devuelve 0,5 y resistente cuesta 0,5. Todo en `herramientas/calculadora_defensa.py`
(antes la calculadora cobraba la durabilidad distinto, y el Sigilo no tenía costo: ahora 1). Revisión de los torsos Comunes con la calculadora: todos
entran en su bolsa; la Coraza de puerta pasó de 90 a 100 (frágil = 3,5 puntos). Con la regla del peso, los escudos Comunes se recalcularon: los de
peso 3 o más dejan de llevar Bloqueo extra (su peso ya bloquea) para no pasarse de la bolsa.

**Resistente / Frágil (dueño, 2026-10-04): un número sobre la durabilidad TOTAL, no por Peso.** La base sigue siendo 3 por punto de Peso (mínimo 3);
`durExtra` le suma o resta: **Resistente ×N = +N**, **Frágil ×N = −N**. Con Frágil (u otro efecto especial) puede quedar por debajo de 3, pero
**nunca menos de 1** (salvo que se rompa). *Por qué:* da más margen de diseño y de ajuste que «puntos por cada Peso». En las calculadoras vale
**0,25 por punto** (la misma tasa que ya usaba la de armas). Las 39 piezas que tenían `durPorPeso` pasaron a `durExtra` con la misma durabilidad de
siempre; `durPorPeso` queda solo para leer copias viejas (`Combatiente.durExtra`, `durBase`, `durMax`).

## Escudos Comunes: cargados (2026-10-04)
26 escudos de una mano reemplazan a los 10 viejos (los que conservan el nombre conservan su id y su narrativa). Fuera por ahora los escudos **a dos
manos** (dueño: no hay diseñada ninguna mecánica de pelear sin armas). «Broquel de hierro» ya existía en Buena: el Común se llama **Disco de arado**.
Precios desde la calculadora (bolsa 3; peso 0,25 por punto sobre el primero; Resistente/Frágil 0,25 por punto).

## El peso en las armaduras (dueño, 2026-10-04) ✅
«Una armadura que da 1 de Defensa y pesa 0 tiene que ser mucho más cara que una que da 1 y pesa 10; la durabilidad suma menos de lo que resta el
peso.» → En torso, cabeza, manos, piernas, pies y cinturón, **cada punto de peso devuelve 0,5 de la bolsa, desde peso 0** (la carga es la Fuerza:
el peso molesta de verdad). Lo devuelto **se compensa con bonos** (livianos, resistencias, durabilidad), sin pasar el tope de Defensa de la parte;
las piezas «solo Defensa» no suman nada y **bajan de precio**. Los escudos siguen con su regla (+0,25 por punto sobre el primero: su peso bloquea).
*Por qué:* lo liviano es lo valioso; lo pesado se paga en carga y trae más. Aplicado a los 33 torsos Comunes (los completos siguen a 110 con un bono
más; los simples bajan: Saco 20, Chaleco 50, Campera 70, Peto de tablas 15, Coraza de latón 35, Peto de hierro 60, Pechera de hierro 70).
*Consecuencia:* el Tipo 10 llega a Buena también en yelmos pesados (un yelmo de peso 2 devuelve 1 punto), además de los escudos.
**Compensar el peso con bonos o con precio: las dos (dueño, 2026-10-04).** El precio sale de los puntos, así que una pieza pesada que no usa lo que
devuelve su peso queda más barata, y una que lo usa en bonos queda al precio completo. En los torsos Comunes, seis vuelven a su versión sin el bono
agregado (pesadas y baratas): Pechera acolchada 100, Gambesón 100, Coraza del clan 85, Cota de malla 70, Coraza de guardia 70, Armadura pesada de
hierro 60. En la propuesta de cascos, igual: Cofia de anillas 35, Casco de bombero 50, Yelmo de hierro 50.
**Iniciativa = 1,5 (dueño, 2026-10-04):** vale el 75 % de la Evasión (2), porque la Evasión protege de más cosas, también de los críticos. Una
desventaja Iniciativa −1 devuelve 1,5. Ajustes: Casaca de salteador suma Percepción +1 (110); Peto de placas y Puerta de auto sacan el Resistente ×2
(110); Coraza de guardia 85; Escudo de hierro macizo 90. En la propuesta de cascos: la Gorra de la Federal suma Percepción +1; el Bacinete baja a
Res.CC +1 (50).

## Cabeza Común: cargada (2026-10-04)
24 cascos y sombreros reemplazan a los 24 viejos (14 conservan nombre, id y narrativa). **Iniciativa en la cabeza ✅** (la Gorra de la Federal).
**Topes de Defensa de la cabeza ✅:** Común 1, Buena 2, Rara 3. Los de peso 0 llenan la bolsa con dos cosas; los cascos pesados traen tres o cuatro
y se pagan en carga, o bajan de precio (Cofia 35, Bacinete, Bombero 50).

## Manos Común: cargadas (2026-10-04)
31 guantes reemplazan a los 11 viejos. **Identidad de las manos (dueño, 2026-10-04):** los guantes están en el ataque además de la defensa →
**PdG en todas sus formas, Parry y Evasión**, más presentes que las resistencias elementales («van a resultar muy poco atractivas para los
jugadores; se pueden usar para rellenar»). **Costos nuevos en la bolsa ✅:** PdG 2 (espejo de la Evasión), PdG en contraataque 1, PdG en ataque de
oportunidad 0,75. **La oportunidad tiene que estar presente desde Común y en varios ítems** (dueño): 7 guantes la llevan. Por ahora el PdG va
**solo en los guantes**; en el resto del equipo, a considerar más adelante. Res.CC en una sola pieza (Muñequeras de cuero crudo).
**Criterio general (dueño): las resistencias elementales son relleno**; lo que da identidad a una pieza son los bonos que se juegan en cada combate.
**Ajuste del dueño a los guantes (2026-10-04):** «la resistencia elemental es un extra a un guante que ya te brinda lo que uno busca en un guante: Defensa,
resistencia a crítico, Parry, Bloqueo o PdG en todas sus variantes; uno que solo da elementales nunca nadie lo va a elegir». Se rehicieron los que no
daban nada de eso (Guantes de goma → Defensa + Res. rayo; Mitones del boticario → Parry + ranura; Guantes de crupier → oportunidad + Percepción) y el
duplicado (Guantes de arquero → Guanteletes de cazador: PdG, Defensa y Tipo 4 con Iniciativa −1). **Regla para todas las partes:** cada pieza da algo
de la identidad de su parte; lo elemental (y lo utilitario) va encima, nunca solo.

