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

1. **Común:** torso ✅ · escudo ✅ · cabeza ✅ · manos ✅ · piernas ✅ · pies ✅ · cinturón · mochila · anillos. **Control:** la calculadora sobre el equipo Común completo
   contra la curva de N1 (Defensa 4–10, T4 ≤ 2, T6 ≤ 1) y N2 (5–12). **Y la Res.CC (dueño, 2026-10-04):** medir cuánta se junta con el equipo completo,
   para que no sea tan abundante que le quite peso a los personajes y efectos que juegan con control (hoy, con torso y cabeza: hasta +4).
1b. **Lluvia de mecánicas por parte (dueño, 2026-10-04):** el ejercicio de las piernas («imaginá todas las mecánicas, tirá de más, yo filtro») se
   repite con cada parte ya hecha (torso, escudo, cabeza, manos) y con las que faltan. Lo que salga se usa sobre todo en Buena y Rara; en Común, solo
   alguna pieza suelta que se sume a la lista (sin rehacer lo cargado).
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
**Regla general del equipo (dueño, 2026-10-04): la resistencia elemental es un detallecito extra.** *Por qué:* «ningún jugador va a querer ocupar un
slot entero de su equipo en defensa elemental de manera exclusiva; si van a ir a un volcán, se compran pociones y pergaminos de resistencia al fuego».
Ninguna pieza da solo resistencias elementales (el Pañuelo mojado pasó a Defensa +1 · Res. tóxico +2). Las situaciones elementales se resuelven con
**consumibles** (ver pendientes).
**Sin ranuras de consumibles en los guantes (dueño, 2026-10-04):** «uno no guardaría una poción en el guante». Los Mitones del boticario pasan a
Parry +1 · Res. ácido +2. Las ranuras de cinturón van donde se puede guardar algo de verdad (cinturón, túnicas, el casco cervecero).
**Para Buena y Rara (dueño, 2026-10-04): la Iniciativa también es una variable de los guantes** (tiene sentido narrativo: manos rápidas), con su
costo de siempre (1,5). No se rehacen los Comunes por esto: se suma recién al diseñar los guantes de calidades más altas.

## Piernas — lluvia de mecánicas, de cualquier calidad (2026-10-04, para que el dueño filtre)
Pedido del dueño: «tirá de más antes que de menos»; afuera las ranuras de bebibles y consumibles.
**Ya existen hoy:** Defensa · Evasión · Iniciativa · Carga · resistencia a crítico (T4, T6, T8, T10) · Res.CC · Sigilo · resistencia elemental (de
extra) · Resistente / Frágil · Movimiento (−1 Mov = −1 No2: muy caro) · un estado al equiparlas (Regeneración, Afortunado…).
**Necesitan algo nuevo (a construir):** pisar fuerte en el terreno lento (arena, barro: el paso cuesta menos) · soltarse más fácil de lo que atrapa
(+N a Soltarse) · menos turnos de Inmovilizado o Rengo · levantarse sin pagar No2 · inmunidad a Sentado / Derribar · alejarse sin provocar ataque de
oportunidad (o que provocarlo cueste más) · mejor dodge roll para salir de un área · pisar con cuidado (chance de no disparar una trampa, o
detectarla con Percepción al pisar) · carrera (más casilleros por No2 si no ataca ese turno) · embestida (PdG o daño extra después de moverse N
casilleros en línea) · patada (un ataque con la pierna: Demora o Derribar) · caminar en la zona de alerta sin pedir tirada (sigilo al moverse) · resistir
el empuje del muro o de una explosión · cruzar zonas persistentes sin que se disparen al entrar · reducir el sobrepeso (cargar más sin penalidad) ·
no hacer ruido al moverse (no rompe el sigilo al cruzar un cono, una vez por turno).
**Idea del dueño (2026-10-04): un bono al movimiento que no sea dar o sacar No2** (eso afecta todas las demás acciones): **el primer movimiento del
turno gratis**, o como desventaja **el primer movimiento cuesta el doble**. Da identidad a las piernas. Propuesta de peso: 1er casillero gratis = 2
puntos (ahorra 1 No2 por turno, solo para moverse; un No2 de verdad vale 4) · 1er casillero al doble = devuelve 2. Más alto: los 2 primeros gratis
(Rara). A construir en el mapa (el costo de la ruta, `costoPasos`, sabiendo qué token ya usó su primer paso en este turno, de Mantenimiento a
Mantenimiento). *(Esperando el OK del dueño: si es el primer casillero o el primer movimiento entero, y el peso.)*
**Pasos gratis: construido y probado en vivo (2026-10-04).** Stat `pasosgratis` (equipo, pasivas, estados): los primeros N casilleros de cada turno
no cuestan No2; el mapa los descuenta, los anuncia («2 casilleros gratis») y Ctrl+Z los devuelve. Escala con la calidad: 1 / 2 / 3. Peso propuesto:
2 por el primero (a confirmar los siguientes). El «primero al doble» como desventaja queda para otros contextos, no para las piernas.
**Idea del dueño (2026-10-04): Evasión contra ataques de oportunidad y contra contraataques** (cuando te los hacen a vos). La de oportunidad vale
más, porque depende de vos (vos elegís alejarte y le sacás provecho); la de contraataque no depende de vos para nada. Propuesta de peso: Evasión en
oportunidad 1, Evasión en contraataque 0,5. A construir en el duelo (la Evasión del defensor suma el bono según el tipo de ataque).
**Carga en las piernas, no en Común (dueño, 2026-10-04):** «te da +1 de carga pero pesa 1: se cancela, no sirve de nada». Solo tiene sentido en piernas
de peso 0 que la sumen de verdad, y eso es de calidades altas. Las piernas Comunes van sin Carga; el Pantalón de corredor estrena los Pasos gratis.
**Distribución piernas / pies y pesos ✅ (dueño, 2026-10-04).** Piernas (potencia, moverse rápido): Pasos gratis 2 · Sigilo 1 · Retirada limpia
(33 % = 1, 50 % = 1,5, siempre = 4, solo Rara o más) · Evasión contra oportunidad 1. Pies (apoyo y reflejos): Recuperarse rápido (los estados que
traban el movimiento —Inmovilizado, Rengo, Sentado y el estado nuevo **Lento**, «el primer casillero cuesta el doble»— duran un turno menos; 2, o 1
con 50 %) · Reflejos de mangosta (al pisar una trampa, chance de un dodge roll a ciegas: 33 % = 1, siempre = 2,5) · Evasión contra contraataque.
**Evasión contra contraataque = 2/3 por +1** (dueño: Evasión +1 ≈ Evasión contra oportunidad +2 ≈ Evasión contra contraataque +3). El bonus al
sobrepeso queda para cuando se defina su penalidad. Propuesta grande de piernas Comunes (29 piezas) en la conversación del 2026-10-04.
**Pasos gratis = 3 por casillero (dueño, 2026-10-04):** el 75 % de +1 No2 (4 puntos): «no es lo mismo que un No2, pero sigue siendo relevante» (antes 2).
En Común (bolsa 1,5) solo entra pagado con desventajas y peso; su lugar natural es Buena (bolsa 3) en adelante.

**Piernas Común cargadas ✅ (2026-10-04).** El dueño revisó la lista («lo conceptual de las piernas ya está; el resto lo vi bien»): 28 piezas en
`comun/catalogo.js` (el Pantalón de corredor pasó a Buena; las Bermudas de cartero quedaron Pasos gratis +1 · Iniciativa −1 · pesa 1). Ninguna pasa
de su bolsa. Se construyeron las tres mecánicas nuevas, iguales para personajes, creeps e invocaciones:
- **Evasión contra oportunidad** (`evaopor`) y **contra contraataque** (`evacontra`): suman a la Evasión del defensor solo en un duelo de ese tipo
  de ataque (no al Parry). `Combatiente.statEvaEspecial`; los ganchos `defender`/`opcionesDefensa` de `ficha-duelo.js`, `creep-duelo.js`, `inv-duelo.js`.
- **Retirada limpia** (`retirada`, en %): al alejarse de un rival, quien se aleja tira 1d6 (33 % = 5–6, 50 % = 4–6; 100 = siempre, sin tirar) antes
  de que el rival decida; si sale, sigue su camino sin ataque de oportunidad (`vtt-hexgrid/js/17`, `oporRetirada`). **Nunca silenciosa** (dueño,
  2026-10-04: «el anuncio y la tirada no pueden ser silenciosas y automáticas en el log»): a quien se aleja se le abre un cartel paso a paso con su
  chance y el botón «🎲 Tirar 1d6»; los dados ruedan, el cartel muestra el resultado y el resto de la mesa lo ve en la Crónica. Vale igual para invocaciones (ver más abajo).
- Pesos en `herramientas/calculadora_defensa.py`: `evaopor` 1, `evacontra` 2/3, `retirada` 0,03 por punto (33 % ≈ 1, 50 % = 1,5) y 4 si es 100.

## Pies — panorama y lluvia de mecánicas (2026-10-04, para que el dueño filtre)

**Panorama del catálogo viejo:** 12 pies Comunes; 9 se pasan de la bolsa (1,5): Defensa hasta +6, Movimiento +1 (vale 4, imposible en
Común) y Tipo 6 en casi todos (el reparto aprobado deja el Tipo 6 en torso, manos y piernas; los pies llevan Tipo 4). Se rehacen de cero,
como las otras partes. Identidad acordada: **apoyo y reflejos** — Iniciativa, Evasión, Res.CC contra caerse o trabarse, y las tres ya
aprobadas: Recuperarse rápido, Reflejos de mangosta y Evasión contra contraataque.

Lluvia (cualquier calidad, con propuesta de peso; ⚙ = se puede automatizar con lo que ya hay en el mapa, ✋ = haría falta algo nuevo):
- Ya aprobadas: **Recuperarse rápido** (Inmovilizado, Rengo, Sentado y el nuevo Lento duran 1 turno menos; 50 % = 1, siempre = 2) · **Reflejos de
  mangosta** (al pisar una trampa, chance de dodge roll a ciegas; 33 % = 1, siempre = 2,5) · **Evasión contra contraataque** (2/3 por +1).
- **Pie firme**: Res.CC solo contra caerse o trabarse (Derribar/Sentado, Inmovilizado, Rengo, Demora, el empuje de las trampas). 0,5 por +1. ⚙
- **Anclado**: chance de que un empuje (trampa, Shockwave, Takle) no te mueva. 33 % = 0,5 · siempre = 1,5. ⚙ (las trampas con empuje)
- **Paso seguro**: el terreno lento (arena movediza) te cuesta lo normal. 1. ⚙
- **Suela gruesa**: −N al daño de lo que pisás (zonas y trampas del piso: fuego, ácido, púas, brea). 1 por −1. ⚙
- **Suela aislante / Suela de corcho**: la resistencia elemental, pero solo contra el piso (fuego del terreno, Descarga). 0,25 por +1 (la mitad de una
  resistencia general). ⚙
- **Despegarse**: no te pegás a la Brea ni a las trampas de Atrapar (o el Soltarse cuesta 1 No2 menos). 1. ⚙
- **Pisada atenta**: +N a la Percepción solo para detectar trampas. 0,5 por +1. ⚙
- **Levantarse rápido**: levantarse de Sentado cuesta 1 No2 menos (o es gratis). 1 por No2. ⚙
- **Pisada silenciosa**: Sigilo +N (lo comparte con las piernas). 1. ⚙ — y su contra, **Botas ruidosas**: Sigilo −1, para abaratar piezas con más Defensa.
- **Botas de marcha**: el primer punto de sobrepeso no te cobra en el movimiento. En pausa (el dueño la dejó para cuando se defina la penalidad del sobrepeso).
- **Pasos de baile**: +1 Evasión si ya te moviste este turno. ✋ (el duelo tendría que saber si se movió).
- **Salto**: una vez por turno, pasar por encima de un casillero (una trampa vista, un pozo) sin pisarlo. ✋ (la ruta del mapa no salta).
- **Carrerita**: +1 a la Fuerza del golpe si te moviste 3 casilleros en línea antes de atacar. ✋, y es ofensivo (a revisar con el criterio de que el PdG
  vive en los guantes).
- Las de siempre: Defensa (tope Común 1), Tipo 4, Evasión, Iniciativa, Res.CC, y las resistencias elementales solo de relleno.

**Filtro del dueño (2026-10-04):** van las mecánicas de siempre (Defensa con tope Común 1, Tipo 4, Evasión, Iniciativa, Res.CC; elementales de relleno),
las tres ya aprobadas (Recuperarse rápido, Reflejos de mangosta, Evasión contra contraataque) y las compartidas con las piernas. De la lluvia nueva:
- **Inamovible** (antes «Anclado»): te hace invulnerable a cualquier movimiento involuntario en el mapa (empujes, portales, Shockwave, Takle), con
  chance en las calidades bajas. Propuesta de peso: 33 % = 0,5 · 50 % = 0,75 · siempre = 1,5.
- **Pisada atenta**: la misma tirada de «algo está fuera de lugar» de la Percepción aumentada, pero solo contra trampas. Propuesta: 1.
- **Pisada silenciosa**: Sigilo.
- **Pasos de baile**: +1 a la Evasión si ya te moviste en el turno. Peso: el 75 % de +1 Evasión = 1,5.
Quedan afuera (por ahora): Pie firme, Paso seguro, Suela gruesa, Suela aislante, Despegarse, Levantarse rápido, Botas ruidosas, Salto, Carrerita;
Botas de marcha sigue en pausa. Propuesta de 27 pies Comunes en la conversación del 2026-10-04 (`pies_comun.py`).

**Pies Común cargados ✅ (2026-10-04, «Listo» del dueño).** 27 piezas en `comun/catalogo.js`; ninguna pasa de su bolsa; el Tipo 6 salió de los pies.
Pesos en `herramientas/calculadora_defensa.py`: Pasos de baile 1,5 · Pisada atenta 1 · `COSTO_CHANCE` (33 % / 50 % / siempre): Inamovible 0,5 / 0,75 / 1,5,
Recuperarse rápido 0,5 / 1 / 2, Reflejos de mangosta 1 / 1,5 / 2,5. Construido (igual para personajes, invocaciones y creeps):
- **Lento** (estado nuevo): el primer casillero de cada turno cuesta el doble (`lentoRecargo`, js/04; el mapa anota quién ya se movió: `marcarMovido`).
- **Pasos de baile**: +N a la Evasión del duelo si ya se movió en el turno (`Combatiente.evaExtraDuelo`, con la Evasión contra oportunidad/contraataque;
  se ve en el botón y en la Mesa: «Evasión (+1 Pasos de baile)»).
- **Pisada atenta**: la tirada de «algo está fuera de lugar» solo contra trampas, con la Percepción normal (js/08 `tokenPisadaAtenta`, js/16).
- **Inamovible** y **Reflejos de mangosta**: fases nuevas del paso a paso de las trampas (`firme-empuje`, `firme-portal`, `reflejos`, js/19).
- **Recuperarse rápido**: al aparecerle Inmovilizado, Rengo, Sentado o Lento, cartel con su chance; si sale, 1 turno menos (js/21; un personaje lo
  recibe como «Acortar estado»).
- Todas las chances usan la misma pieza (`chanceCartel`, js/21: cartel, botón, dados, resultado, Crónica y Mesa); la Retirada limpia pasó a usarla.

**Invocaciones iguales que todos (dueño, 2026-10-04: «las reglas del combate serán iguales para todos los actores»).** La ficha publica de cada
invocación (`resumen.invocaciones`) lo mismo que de un personaje: `costoMover` (Rengo el doble, Inmovilizado 0), `pasosGratis`, `retirada`,
`inamovible`, `recuperarse`, `reflejos`, `pisadaAtenta` y `percepcion` (`FichaResumen.invCostoMover`). En el mapa (`resumenDeInv`, js/04): moverse
le cuesta No2 (antes se movía gratis; `costoMoverInv`, `gastarNitrosInv`), con Lento y Pasos gratis; y le valen la Retirada limpia, Inamovible,
Recuperarse rápido (el «Acortar estado» llega a su ficha por `Recibidos`), Reflejos de mangosta y Pisada atenta. Pisada atenta también para creeps.
**Reflejos de mangosta = dodge roll** (dueño, 2026-10-04: «te permite tirar dodge roll en la dirección que quieras para intentar esquivar»): si sale
la chance, elegís en el mapa una casilla a 1 o 2 de distancia (pagando el movimiento en No2, como el dodge roll de los hechizos de área); si queda
fuera de la trampa, la esquivás entera; si no, te cae encima. Sentado o Inmovilizado no pueden tirarse.

## Cinturón — panorama y lluvia de mecánicas (2026-10-04, para que el dueño filtre)

**Cómo está hoy (y lo que quedó a medias).**
- Es un slot de equipo (uno solo). Lo que hace casi todo cinturón es dar **ranuras** (`capcinturon`).
- Ranuras del cinturón = una **base que el jugador escribe a mano** en la ficha (5 por defecto) + las del cinturón y otras piezas (torsos y el Casco
  cervecero también dan ranuras).
- Usar un consumible del cinturón cuesta **1 No2**; de la mochila, **2**. El Ankh solo funciona desde el cinturón.
- **A medias:** (1) el límite de ranuras se respeta solo con el botón «→ Cinturón» de la ficha (mueve de a una unidad); «Equipar» un consumible
  (también desde el Equipo del mapa) mete **la pila entera** sin mirar el lugar, y la pila ocupa **una sola** ranura aunque tenga 5 unidades;
  (2) la base de 5 la edita el jugador a mano (no sale de ninguna regla); (3) creeps e invocaciones no tienen cinturón.
- **Catálogo:** 28 cinturones (7 Comunes). Casi todos son «ranuras +N», y los Comunes se pasan de su bolsa (1): cada ranura vale 1 punto,
  así que una pieza Común solo podría dar +1.

**Preguntas de base (antes de la lista).**
1. ¿Una ranura = una unidad (5 pociones = 5 ranuras) o una pila (5 pociones iguales = 1 ranura, con un tope por pila)?
2. ¿La base de 5 queda fija para todos (y el número a mano solo para casos especiales) o se calcula de algo (Agilidad, Constitución)?
3. Pasar del límite: ¿avisar y dejar seguir, o no dejar? (sandbox: avisar).
4. ¿Creeps e invocaciones llevan cinturón y consumibles? (las reglas, iguales para todos).
5. ¿Las ranuras de cinturón son solo del cinturón (su identidad) o siguen también en torsos y cascos?
6. El peso de una ranura: 1 punto deja al Común con +1. Propuesta: 0,5 (Común +2, Buena +3, Rara +4).

**Lluvia de mecánicas (cualquier calidad, con peso propuesto; ⚙ = se automatiza con lo que hay, ✋ = hace falta algo nuevo).**
- *Lo de siempre:* Ranuras · Defensa (poca: el cinturón no es armadura) · Res. crítico Tipo 12 (solo Legendario, decidido) · Res.CC · Constitución / vida.
- **Saque rápido** ⚙: el primer consumible del turno sacado del cinturón cuesta 0 No2 (50 % al principio; siempre desde Rara). Peso 1 / 2.
- **Bolsillo de emergencia** ⚙: al bajar del 25 % de vida, se toma solo una poción de curación del cinturón (como el Ankh), una vez por combate. Peso 1,5.
- **Mano de boticario** ⚙: +N a lo que cura un consumible (o +1 turno a lo que deja). Peso 1 por +2 de cura.
- **Portapergaminos / Portafrascos** ⚙: los pergaminos (o las pociones) del cinturón cuestan 0 No2. Peso 1,5.
- **Desenvainar rápido (tahalí / vaina)** ⚙: equipar o cambiar de arma en combate cuesta 0 No2 una vez por turno (hoy 1). Peso 1.
- **Pasamanos** ⚙: darle un consumible del cinturón a un aliado al lado cuesta 0 No2 (hoy es a mano). Peso 0,5.
- **Brazo de lanzador** ✋: +N casilleros al tirar un consumible (bombas, frascos) o colocar una trampa consumible. Peso 0,5 por +1.
- **Faja de cargador** ⚙: Carga +N (el cinturón reparte el peso; en las piernas no tenía sentido). Peso 0,25 por +1.
- **Faja lumbar** ⚙: Res.CC solo contra empujes y derribos (como el Pie firme, desde el centro del cuerpo). Peso 0,5 por +1.
- **Bolsa del carroñero** ⚙: +N despojos al despojar un creep. Peso 0,5 por +1.
- **Cartuchera de trampero** ⚙: colocar una trampa consumible cuesta 1 No2 menos. Peso 1.
- **Bolsillo secreto** ✋: un consumible escondido que no se ve en la ficha lite ni se puede robar (no hay robo todavía). En pausa.
- **Cinturón de lastre** (contra): Iniciativa −1 o pesa más, para abaratar piezas con muchas ranuras.

**Decisiones del dueño sobre el cinturón (2026-10-04).** La categoría junta **cinturón y mochila**.
1. **1 ranura = 1 poción** (una unidad, no una pila).
2. **La base es 5 para todos**: todo personaje viene con un cinturón de 5 ranuras.
3. El límite lo fijamos nosotros (a redefinir; propuesta: con el cinturón lleno, lo que no entra queda en la mochila).
4. **Creeps e invocaciones** también tienen 5 ranuras de consumibles por defecto (aunque rara vez se usen).
5. **Las ranuras son LA razón de ser del cinturón**; en otras piezas, solo de manera excepcional (como la Túnica de maestre).
6. **Baja el peso de la ranura** (propuesta: 0,5).
Mecánicas que quedan: Ranuras · **Saque rápido** · **Mano de boticario** (+X a lo que cura una poción) · **Portapergaminos** (los pergaminos
se apilan de a 2, 3 o más por ranura; pesa bastante por stack) · **Vaina** (dejar un arma envainada en el cinturón para cambiarla sin gastar No2) ·
**Pasamanos** · **Ranura exclusiva** (+1 ranura solo para pociones, pergaminos, trampas o el Ankh; «costaría 0,75») · **Defensa** (+1 habilitado
por calidad) · resistencias elementales de relleno. **Brazo de lanzador**: a desarrollar con las reglas del lanzamiento (P156). El resto, afuera.

## Mochila — panorama y lluvia de mecánicas (2026-10-04, para que el dueño filtre)

**Cómo está hoy.** Slot de equipo (una sola). Ranuras de mochila = base que el jugador escribe a mano (20 por defecto) + `capmochila` de la mochila
equipada. Lo que está adentro no suma bonos ni peso. Usar un consumible de la mochila cuesta 2 No2 (del cinturón, 1). Catálogo: 10 mochilas (2 por
calidad), casi todas solo ranuras (+4 a +30), con contras en las grandes (Evasión −1, Movimiento −1). La calculadora todavía no tiene bolsa para
la mochila; cada ranura vale 0,5.

**Lluvia (cualquier calidad, peso propuesto; ⚙ = se automatiza con lo que hay, ✋ = hace falta algo nuevo).**
- *Lo de siempre:* Ranuras (propuesta 0,25 cada una: una mochila tiene muchas) · contras para las grandes (Evasión, Movimiento, Iniciativa, Sigilo −1).
- **Bolsillo exterior** ⚙: el primer consumible del turno sacado de la mochila cuesta 1 No2 en vez de 2. Peso 1.
- **Correas laterales** ⚙: un arma o un escudo colgado afuera de la mochila se equipa en combate sin gastar No2 (como la Vaina del cinturón). Peso 1.
- **Armazón** ⚙: Carga +N (la mochila con armazón reparte el peso). Peso 0,25 por +1.
- **Espaldar** ⚙: los ataques por la espalda (en sigilo y por el punto ciego) no suman su bono contra vos. Peso 1.
- **Bolsa del carroñero** ⚙: +N despojos al despojar. Peso 0,5 por +1.
- **Morral de cazador** ⚙: los trofeos no ocupan ranuras. Peso 0,5.
- **Mochila de mercader** ⚙: vendés un 10 % más caro en las tiendas. Peso 0,5 por cada 10 %.
- **Farol colgado** ⚙: Luz +N (la luz que llevás alrededor). Peso 0,5 por +1.
- **Alforja compartida** ⚙: un aliado al lado puede sacar un consumible de tu mochila (a lo que cuesta del cinturón). Peso 0,5.
- **Alforja de invocación** ⚙: tus invocaciones usan los consumibles de tu mochila. Peso 0,5.
- **Kit de herramientas** ✋: reparar fuera de combate (espera el sistema de reparación). En pausa.
- **Botiquín de campaña** ✋: curar más al descansar (no hay reglas de descanso todavía). En pausa.
- **Fondo falso** ✋: un compartimento que no se puede revisar ni robar (no hay robo). En pausa.
- Resistencias elementales de relleno (una mochila que protege la espalda del fuego, etc.).
**Preguntas:** ¿la base de 20 queda fija para todos, como el cinturón? ¿Creeps e invocaciones tienen mochila (o solo el cinturón de 5)? ¿Qué
bolsa (cuántos puntos) le damos a la mochila por calidad?

**Decisiones del dueño sobre cinturón y mochila (2026-10-04, segunda vuelta).**
- **No se puede meter una 6.ª unidad en un cinturón de 5** ✅ construido: `FichaEquipo.alCinturon` (todos los caminos: Equipar, «→ Cinturón», el
  editor y lo que vuelve del combate) mete las que entren y deja el resto en la mochila, con aviso. 1 ranura = 1 unidad (`cinturonUsado`), base 5
  (`BASE_CINTURON`, `capCinturon`). Falta: el cinturón de 5 de **creeps e invocaciones**.
- **Ranura exclusiva** (solo pociones, pergaminos, trampas o el Ankh) = el 75 % de una ranura común: 0,375.
- **Mochila: base 20 para todos** los personajes. **Las invocaciones no llevan mochila.** A los creeps se les pueden cargar objetos que dejen al
  final del combate, sin restricción (caso muy excepcional). **Bolsa por calidad: como los pies** (1,5 · 2,5 · 3,5 · 4,5 · 5,5).
- **Mecánicas de mochila que quedan:** Ranuras · **Bolsillo exterior** (el primer consumible del turno desde la mochila cuesta 1 No2 en vez de 2) ·
  **Correas laterales** (un arma o escudo colgado se equipa sin No2; puede haber más de una correa) · **Morral de cazador** (los trofeos no ocupan
  ranuras) · **Farol colgado** (valor 1) · **Alforja compartida** (un aliado al lado retira un consumible de tu mochila por 1 No2) · contras para
  las grandes. **Kit de herramientas**: a evaluar a futuro. Afuera: Armazón, Espaldar, Bolsa del carroñero, Mochila de mercader, Alforja de invocación.
- **Cinturón y mochila son dos slots de equipo** (existen desde el 2026-09-25, `SLOT_DEFS`): entran en la ruta del rework (la mochila no estaba) y
  en el control del equipo Común la Defensa del cinturón (+1 por calidad) cuenta para la curva.

**Cinturón de los creeps ✅ (2026-10-05; dueño: «solo creeps, no invocaciones en este caso»).** 5 ranuras como cualquiera (`CreepCalculo.capCinturon`,
1 ranura = 1 unidad, + `capcinturon` de su equipo). En sus Acciones (mapa y GM Tools, el mismo dibujo: `CreepBotonera.cinturonHtml`) hay una
sección «🧪 Cinturón» con un desplegable de los consumibles del catálogo para cargarle, «Usar · 1 No2» y ✕ para sacarlo. Usar uno
(`CreepAcciones.consumir`) cura, deja su estado (la misma regla que una habilidad: `efectoDeHab`), tira lo suyo y cobra 1 No2; sin No2 pregunta y,
si se usa igual, gasta los que tenga (línea roja en la Mesa); una trampa consumible se coloca junto a su token (si no se puede, no se gasta).

**Mecánicas de cinturón y mochila construidas ✅ (2026-10-05).** Stats nuevos (`FichaCalculo.EXTRA`), iguales para personajes y creeps donde aplica:
- **Saque rápido** (`saquerapido`, %): el primer consumible del turno sacado del cinturón no cuesta No2 (chance a la vista con 1d6; siempre = sin
  tirar). Se marca por turno (`S.meta.saqueTurno`; el creep, `sc.saqueUsado`, que vuelve en su Mantenimiento). Peso 33 % 0,75 · 50 % 1 · siempre 2.
- **Mano de boticario** (`boticario`): +N a lo que cura una poción. Peso 0,5 por +1.
- **Portapergaminos** (`portapergaminos` = cuántos por ranura): los pergaminos se agrupan. Peso (N − 1) × 1.
- **Ranuras exclusivas** (`ranurapocion`, `ranurapergamino`, `ranuratrampa`, `ranuraankh`): se llenan primero con lo suyo. Peso 0,375.
  La cuenta de ranuras es una sola para todos: `Combatiente.ranurasCinturon` / `entranEnCinturon` (con `categoriaConsumible`).
- **Vaina** (`vainas`, cinturón: armas) y **Correas laterales** (`correas`, mochila: armas o escudos): un arma «a mano» (`aMano`, botón «🗡 Vaina /
  correa» en el Equipo) se equipa sin No2, y una equipada se guarda ahí sin No2 si queda lugar (`FichaEquipo.aManoEntra`). Peso 1 cada una.
- **Bolsillo exterior** (`bolsilloext`): el primer consumible del turno sacado de la mochila cuesta 1 No2 en vez de 2. Peso 1.
- **Morral de cazador** (`morral`): los trofeos no ocupan ranuras de mochila. Peso 0,5.
- **Farol colgado**: Luz +1 (ya existía el stat).
- **Falta: Pasamanos y Alforja compartida**, que necesitan la regla base de «darle un consumible a otro» (no existe todavía).
Calculadora: ranura de cinturón 0,5, de mochila 0,25; la mochila tiene bolsa propia (como los pies).

**Propuesta de cinturones y mochilas Comunes (2026-10-05, esperando filtro del dueño):** 13 cinturones y 9 mochilas, ninguno pasa de su bolsa (cinturón 1, mochila 1,5); el script está en el scratchpad (`cin_moch_comun.py`). Abierto: la regla base de «darle un consumible a otro» (para Pasamanos y Alforja compartida) y si usar un consumible se anuncia en la Mesa.
