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
