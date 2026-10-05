# Rework del catálogo — armas (hoja de trabajo)

> Fase 1 de la [hoja de ruta](hoja-de-ruta-rework-catalogo.md) (2026-09-25). Aquí se van **haciendo las preguntas y anotando las respuestas**, en orden. Las reglas de fondo están en
> [`guia-de-diseno.md`](guia-de-diseno.md) y en las preguntas P112–P118 de [`preguntas-abiertas.md`](preguntas-abiertas.md). Cada pregunta trae una **propuesta del asistente** para poder
> responder rápido (sí / no / cambiá esto). Estado: ⬜ sin responder · ✅ respondida.

## Cómo retomar este trabajo (para otra conversación o cuenta de Claude)
Este documento **es la memoria del proceso**: todo lo que se pregunta y se decide queda acá, en el repositorio (rama `nueva-version`), no en la conversación. Para seguir desde cero:
1. Leer [`../CLAUDE.md`](../CLAUDE.md) (esencia del proyecto: guías, no reglas; sandbox; automatizar o aclarar) y este archivo completo.
2. Leer [`guia-de-diseno.md`](guia-de-diseno.md) (criterios generales, familias, tres niveles de efecto, tabla de relevancias, skills de crítico) y las preguntas **P112 a P118** de [`preguntas-abiertas.md`](preguntas-abiertas.md) (peso de efectos, crítico, resistencia por slots, armas mágicas, híbridas, rayo en cadena).
3. Mirar el estado de la [hoja de ruta](hoja-de-ruta-rework-catalogo.md) y de [`pendientes.md`](pendientes.md) (§8).
4. **Método de trabajo:** el asistente propone en tandas y el dueño audita. Cada pregunta trae una propuesta; cuando el dueño responde, **se anota acá en "Respuestas y decisiones"** (fecha, número de pregunta, respuesta textual y lo que se decidió), se marca ✅ y **se sube al repo** (commit + push a `nueva-version`) sin esperar. Si una respuesta cambia una regla de fondo, se actualiza también la guía de diseño y `preguntas-abiertas.md`.
5. El catálogo se edita **solo** con `datos/catalogo-editor.html` o los scripts de `herramientas/` (ver `datos/CLAUDE.md`), nunca a mano; sin imágenes; y nada entra al catálogo sin la auditoría del dueño.
6. El dueño no es técnico: explicar sin jerga, en español, con el objetivo antes que la arquitectura.

## Objetivo
Un **catálogo amplio y diverso de armas** de distintos tipos y efectos, con un **pool muy grande** para que el **randomizador de tiendas** tenga sentido. Se **preservan conceptualmente** algunos objetos
del catálogo anterior (ej.: el **set completo de Martín Fierro**, muy raro y poderoso de coleccionar) y se **reajustan sus valores** con los parámetros nuevos. Se trabaja en **tandas** por familia; el asistente
propone y el dueño audita.

## Punto de partida (catálogo actual, 137 armas)
| Tier | Armas | Precio (mín / promedio / máx) |
|---|---|---|
| Común | 47 | 30 / 60 / 120 |
| Buena calidad | 36 | 60 / 102 / 170 |
| Raro | 26 | 75 / 212 / 2000 |
| Excepcional | 17 | 200 / 677 / 950 |
| Legendario | 11 | 1100 / 1422 / 1900 |

- **Por Tipo (dado):** T4 28 · T6 46 · T8 30 · T10 31 · T12 2 · de rango 16 (dentro de los anteriores) · una mano 122 · dos manos 15.
- **Efectos al golpear:** 52 armas tienen alguno; **85 no tienen ninguno**, 45 tienen uno, 6 dos, 1 tres. 19 efectos distintos, muy desparejos: **Rompe armadura en 18 armas**, Sangrado 9, "Ignora 1 de Res. crítico" 7, Envenenar 6…
- **Set Martín Fierro:** hoy hay 3 piezas sueltas (Facón, Boina, Poncho), todas legendarias.
- No hay armas mágicas (solo un Báculo mágico); las armas mágicas van en la fase 3.

## Preguntas (en orden)
### A · Tamaño y reparto del pool
1. ✅ **¿Cuántas armas en total?** *Propuesta:* ~**300** (más del doble), en forma de pirámide: Común ~90 · Buena calidad ~80 · Raro ~60 · Excepcional ~45 · Legendario ~25.
2. ✅ **¿Cómo se reparten por familia y Tipo?** *Propuesta:* Tipo 4 (punzantes) 20 % · Tipo 6 (cortantes) 25 % · Tipo 8 (hachas y armas pesadas) 20 % · Tipo 10 (contundentes) 15 % · Tipo 12 (explosivos) 5 % · **de rango** 15 %; y por cada familia, pesos de 1 a 4 (dados) según el tier.
3. ✅ **¿Una mano y dos manos?** *Propuesta:* ~80 % una mano, ~20 % dos manos (más Peso y más efectos a cambio de ocupar las dos manos).

### B · Efectos
4. ✅ **¿Cuántos efectos distintos habrá y cuáles?** *(cerrada 2026-09-25: ver "Respuestas y decisiones")* *Propuesta:* los de la guía (Rompe armadura, Knockdown, Aturdir, Lisiado, Sangrado, Envenenar, Derribar, Agarrar, Prende fuego, Drena vida) + un puñado de "modificadores" (Ignora N de Res. crítico, Ignora armadura, Crítico frecuente/potente). Repartirlos parejo: hoy uno solo (Rompe armadura) está en 13 % de las armas.
5. ✅ **¿Cuántos efectos lleva un arma según su tier?** *Propuesta:* Común 0 (algunas 1) · Buena calidad 0–1 · Raro 1 · Excepcional 1–2 · Legendario 2–3.
6. ✅ **¿Con qué probabilidad se aplican?** *Propuesta:* Común/Buena 25 % · Raro 50 % · Excepcional 75 % · Legendario 100 % (o efectos extra del 100 %). Se tira con moneda/d4 como hoy.
7. ✅ **¿Qué peso tiene cada efecto para valorizar el arma?** *Propuesta (escala 1 a 5, provisoria):* Aturdir 5 · Rompe armadura 4 · Knockdown 4 · Drena vida 4 · Lisiado 3 · Sangrado 3 · Envenenar 3 · Agarrar 3 · Prende fuego 3 · Derribar 2 · Ignora 1 de Res. crítico 2. Se multiplica por un factor según sea **de casa** (×1), **habilitado** (×1,25) o **excepcional** (×1,5) para la familia.

### C · Valorización, tier y precio (P112)
8. 🟡 **¿Cuáles son los ingredientes del puntaje de calidad?** *(fórmula v0 armada: ver abajo; se ajusta con ejemplos)* *Propuesta:* daño esperado (dados del Tipo × Peso) + bonos (PdG, Parry, Bloqueo, Dmg…) + Σ(peso del efecto × probabilidad) + Crítico frecuente/potente + costo en Nitros del ataque (más caro = menos puntaje) − peso del arma (relevancia intermedia).
9. ⬜ **¿El tier lo determina el puntaje o se elige aparte?** *Propuesta:* lo determina el puntaje por **umbrales** (Común < Buena < Raro < Excepcional < Legendario), y solo se rompe la regla a propósito (ítems únicos, sets).
10. ⬜ **¿Qué precio corresponde a cada tier?** *Propuesta:* mantener los rangos actuales como ancla (Común ~60, Buena ~100, Raro ~210, Excepcional ~680, Legendario ~1400) y que el precio salga del puntaje dentro de cada rango.

### D · Contenido a preservar y sets
11. 🟡 **¿Qué armas del catálogo actual se conservan conceptualmente?** *(se audita con la herramienta [`../datos/auditoria-armas.html`](../datos/auditoria-armas.html); ver "Herramienta de auditoría")* *Propuesta:* el asistente arma una **hoja con las 137 armas** (nombre, tier, Tipo, efectos) y vos marcás **conservar / reajustar / descartar**.
12. ⬜ **Sets (ej.: Martín Fierro completo).** ¿Cuántas piezas tiene un set y qué bonus da tener **el set completo** (o 2 de 3)? *Propuesta:* sets de 3 a 5 piezas (arma + 2–4 de defensa), con un estado extra al tenerlas todas equipadas. **Ojo:** hoy el juego no tiene bonus de set; habría que construirlo.

### F · Preguntas nuevas que aparecieron al responder
14. ⬜ **Diseño de las armas de rango** (arcos, ballestas, armas de fuego): todavía no se discutió su criterio de diseño (Rango, munición, Nitros, crítico, efectos). Por ahora se rellenan sobre la marcha con lo que surja y se espera **reworkearlas específicamente después**. *Propuesta:* dedicarles una tanda propia cuando terminen las familias cuerpo a cuerpo.
15. ⬜ **Peso de usar las dos manos:** ¿cuánto vale en el puntaje de calidad que un arma ocupe las dos manos? El dueño aclaró que **de por sí es más poderosa** (a cambio invalida una mano, o sea que resta posibilidades de acción: escudo, segunda arma, accesorio). *Propuesta:* darle a las de dos manos un **bono al puntaje** (más Peso de dados o un efecto extra sin subir el precio proporcionalmente) y evaluar qué cuesta perder la mano libre.

16. ✅ **Bonos a stats en las armas** (aparecieron al revisar: "más uno al Parry, más uno al Bloqueo… hay todo un universo de efectos de armas que dejamos afuera"). Ver "Universo de bonos" abajo. ¿Qué stats puede dar un arma, cuántos puntos según el tier y cuáles son "de casa" de cada familia? *Propuesta:* ver abajo.

### E · Método
13. ⬜ **¿En qué orden y qué tamaño de tanda?** *Propuesta:* por familia (punzantes → cortantes → hachas → contundentes → rango → explosivos → híbridas), de ~12 armas por tanda, en 3 pasos: (a) lista de ideas/nombres, (b) números, (c) carga al editor de catálogo tras tu auditoría.

## Respuestas y decisiones
*(se completan a medida que se responden; formato: fecha · pregunta · respuesta del dueño · decisión)*

- **2026-09-25 · P1 (tamaño del pool):** "Vamos con unas 300, no está mal. Respecto a la rareza, vamos con eso." → **~300 armas** con la pirámide propuesta: **Común ~90 · Buena calidad ~80 · Raro ~60 · Excepcional ~45 · Legendario ~25**.
- **2026-09-25 · P2 (reparto por familia y Tipo):** "Repartir por familia está bien." → **Tipo 4 (punzantes) 20 % · Tipo 6 (cortantes) 25 % · Tipo 8 (hachas y pesadas) 20 % · Tipo 10 (contundentes) 15 % · Tipo 12 (explosivos) 5 % · de rango 15 %** (unas 45 armas de rango; contando ~300). Las **de rango**: todavía no está discutido su criterio de diseño; se rellenan sobre la marcha y **es muy probable que haya que reworkearlas específicamente** (ver P14).
- **2026-09-25 · P3 (manos):** "Un arma de dos manos de por sí va a ser más poderosa, porque tiene una ventaja que es que te invalida una mano, entonces te quita posibilidad de acciones, pero vamos a reducirlo a un **10 %** de armas de dos manos." → **~10 % de armas de dos manos (~30 de 300)**, el resto de una mano. Sus implicaciones y su peso en el puntaje **no están evaluados** todavía (ver P15).

## Elaboración de efectos (P4 en discusión)
> Cada efecto se elabora acá con la propuesta del asistente y lo que responda el dueño. Cuando se cierra uno, pasa a "Respuestas y decisiones" y a la guía de diseño.

### Demora (antes "Knockdown", iniciativa) — ✅ decidido 2026-09-25
- **Qué hace:** al golpear (con la probabilidad del arma), el golpeado **baja N lugares en el orden de turnos** (N = 1, 2 o "al fondo"). "Knockdown 1" = baja 1 lugar. Es el efecto de casa de los **contundentes**; habilitado en explosivos.
- **Automatizable:** sí. Las reglas de Firestore ya dejan a cualquier miembro reordenar la lista de iniciativa (solo se prohíbe cambiar el turno, la ronda y el largo). Un botón "⬇ Knockdown" en la tabla, o que salga tras la tirada de efecto.
- **Preguntas:** (a) ¿el cambio dura **solo esta ronda** (vuelve a su lugar al empezar la siguiente) o **queda** hasta que el GM reordene? *Propuesta:* solo esta ronda. (b) ¿Si le toca justo al golpeado, pierde el turno o solo pasa detrás? *Propuesta:* solo cambia el orden de la próxima vez; el turno en curso no se toca. (c) Nombre en español definitivo.
- **Peso para el valor:** 4.

### Derribar — ✅ aceptado como se propuso (2026-09-25)
- **Qué hace:** el golpeado **cae al suelo**: pasa a **Sentado** (Evasión a la mitad, no puede atacar ni hacer dodge roll; levantarse cuesta 1 No2; ya existe como estado). Es distinto de Knockdown (que solo mueve la iniciativa).
- **Automatizable:** sí, con el estado Sentado ya existente (a mano hoy: "recordar y tirar").
- **Preguntas:** (a) ¿la probabilidad basta o el defendido tira algo (Fuerza/Constitución) para no caer? *Propuesta:* solo probabilidad, más el efecto de casa contundentes/hachas pesadas/explosivos. (b) ¿Funciona contra criaturas grandes? *Propuesta:* sí, por ahora.
- **Peso para el valor:** 3 (Sentado es un control fuerte pero lo deshace 1 No2).

### Agarrar — ❌ FUERA por ahora (2026-09-25): "no me cierra", a evaluar en el futuro. (Se conserva la propuesta de abajo solo como referencia.)
- **Qué hace:** el golpeado queda **Agarrado**: **Inmovilizado** (su movimiento vale 0) mientras el atacante lo sostenga. Para zafarse, **paga 2 No2 y gana un Fuerza contra el Fuerza del atacante** (la regla vieja de la trampa "red": 2 No2 y Fuerza).
- **Familias:** punzantes largos (lanzas, arpones), armas con cadena o gancho; excepcional en el resto.
- **Preguntas:** (a) ¿el atacante queda "ocupado" también (no se mueve mientras agarra)? *Propuesta:* no, para no castigarlo; solo debe seguir adyacente. (b) ¿dura N turnos o hasta que se zafe? *Propuesta:* hasta que se zafe o el atacante se aleje.
- **Peso para el valor:** 3.

### Prende fuego — ✅ aceptado como se propuso (2026-09-25)
- **Qué hace (coherente con lo ya decidido del fuego):** no es un daño por turnos sobre la víctima. **Deja el terreno incendiado**: una forma **🔥 Terreno incendiado** de daño 5 (editable) en la casilla del golpeado (o en una flor de 1 si el arma es grande), por unos turnos. Daña al **entrar** y en cada **Mantenimiento** a quien esté adentro; directo a la vida (es daño mágico elemental). Ya existe el terreno incendiado en el mapa.
- **Preguntas:** (a) ¿el tamaño (1 casilla o flor de 1) y el daño (3 a 5) dependen del tier del arma? *Propuesta:* sí: comunes 1 casilla y daño 3; legendarias flor de 1 y daño 5. (b) ¿además del terreno hace daño de fuego directo al golpeado? *Propuesta:* no, el terreno ya lo daña al Mantenimiento. (c) Que el **hielo** lo apague (pendiente).
- **Automatizable:** sí (colocar la forma en el token golpeado con un botón tras la tirada de efecto).
- **Peso para el valor:** 3 a 4.

## Respuestas y decisiones (continuación: efectos)
- **2026-09-25 · P4 (efectos), Demora:** "A knockdown lo vamos a llamar **demora**, que al mover la ubicación en la tabla de iniciativa **en uno para abajo sea definitivo**." → **Demora**: el golpeado **baja 1 lugar en la tabla de iniciativa** y el cambio es **definitivo** (queda así hasta que el GM reordene o se vuelva a ordenar la tabla; no vuelve solo). No toca el turno en curso. Efecto de casa de los **contundentes** (habilitado en explosivos). Peso propuesto: 4.
- **2026-09-25 · P4, Agarrar:** "Agarrar no me cierra, lo vamos a dejar por ahora afuera, a evaluar en el futuro." → **Agarrar queda fuera del catálogo de efectos por ahora.**
- **2026-09-25 · P4, Prende fuego:** "Vamos a dejarlo así, así como proponemos." → **Prende fuego** como propuesto: deja **terreno incendiado** (daño 5 editable; tamaño y daño suben con el tier: comunes 1 casilla y daño 3, legendarias flor de 1 y daño 5); sin daño directo extra al golpeado; que el hielo lo apague queda pendiente. Peso 3 a 4.
- **2026-09-25 · P4, Derribar:** sin objeciones → como propuesto: deja **Sentado** (Evasión a la mitad, no ataca, levantarse cuesta 1 No2), solo con probabilidad. Peso 3.
- **Lista de efectos vigente (P4):** Rompe armadura · **Demora** · Aturdir · Lisiado · Sangrado · Envenenar · Derribar · Prende fuego · Drena vida + modificadores (Ignora N de Res. crítico, Ignora armadura, Crítico frecuente/potente). *(Agarrar fuera.)* Falta elaborar los demás y confirmar la lista completa.
- **2026-09-25 · P4, Aturdir:** propuesta del asistente: "hoy es Stun (sin Nitros 2 turnos), un control muy fuerte; probabilidad baja y solo en armas raras o mejores" → dueño: "Lo elaboramos así; Aturdir de hecho implica además **sacar 1 en cualquier tirada de Evasión**. Aturdir es del **crowd control el más poderoso**." → **Aturdir = estado Stun**: **sin Nitros** mientras dura (2 turnos) **y toda tirada de Evasión sale 1**; es el **control más poderoso** del juego. En el catálogo: **probabilidad baja y solo en armas de tier Raro o superior**. Efecto de casa de los **contundentes**; habilitado en explosivos. **Peso 5** (el mayor).
- **2026-09-25 · P4, Aturdir (precisión del dueño):** "Ningún arma aplica stun automático. A lo sumo que un arma tenga **probabilidad** de aplicar stun ya es bastante bueno. Se puede jugar con esa probabilidad para darle más o menos rareza y valor." → **Ningún arma aplica Aturdir con el 100 %**: siempre es una **probabilidad** (nunca automático), y esa probabilidad es la palanca de **rareza y valor** del arma. **Escala de probabilidad de Aturdir confirmada por el dueño:** Raro ~10–15 % · Excepcional ~25 % · Legendario ~33–50 % como máximo.
- **2026-09-25 · P4, Rompe armadura:** dueño: "Que sea el efecto de las **hachas**. Pueden existir hachas que rompen la armadura **con cada golpe** (100 %): tienen que ser **buenas** (tier alto); y algunas con **probabilidad** de romperla, que pueden estar en **tiers un poco más bajos**. El skill **Arruina armadura ya no cuenta**. **Media armadura** no sé ni lo que es. Y **Ignora armadura** es raro porque es como un crítico automático: lo dejaría **afuera**. Vamos a dejar por ahora **sin stacks** *(interpretado: sin tope de stacks; confirmar)*. Que haya armas que **suman de a más de un stack por golpe** tienen que ser de **Excepcional para arriba**, salvo que algo raro tenga una **probabilidad** de romper **más de un stack, pero no más de dos**." → **Rompe armadura**: efecto de casa de las **hachas** (peso 4). **100 % por golpe** solo en armas **buenas** (tier alto); **con probabilidad** en tiers más bajos. Suma **1 stack de Armadura rota** por golpe, **sin tope de stacks** por ahora. **Más de 1 stack por golpe**: solo **Excepcional o superior**; excepción: un arma **Rara** puede tener un **% de romper 2 stacks** (**nunca más de 2**). **Fuera del catálogo de efectos:** "Arruina armadura", "Media armadura" e "Ignora armadura" (esta última por ser como un crítico automático). Los 3 casos de Arruina/Media/Ignora que hoy existen en armas hay que reemplazarlos al rehacer el catálogo.
- **2026-09-25 · P4, Drena vida:** dueño: "Vamos a trabajar con **porcentaje del daño**. Que sea una característica **infrecuente**: que pueda aparecer a partir de un arma **Rara para arriba**, y que también se pueda jugar con el **porcentaje de drenaje** para variar el valor. Y puede existir algún arma **legendaria que juegue con el Excedente de vida**, sí." → **Drena vida**: quien porta el arma recupera un **% del daño que hace**; **solo desde tier Raro**; el **porcentaje** es la palanca de valor (más % = más caro); **nunca pasa el HP máximo** salvo alguna **legendaria** que genere **Excedente de vida**. Sin familia de casa (propuesta: cortantes y punzantes habilitados). Peso 4.
- **2026-09-25 · Aclaración general sobre las probabilidades de los efectos** (pregunta del dueño: "¿el porcentaje sería el porcentaje de aplicar el estado en caso de pegar un golpe?") → **Sí**: el porcentaje es la **probabilidad de que el efecto se aplique cuando el golpe conecta** (PdG ganó a la Evasión). Se tira **después** de conectar, con el sistema que ya existe de efectos al golpear (50 % moneda, 25 % d4, 33 % d6…). No es la chance de pegar.
- **2026-09-25 · P4, Sangrado:** dueño: "Cuando aplica sangrado con un golpe **común** hace **3 puntos de daño por 4 turnos**. Es el **estándar de las armas**. Pero si el golpe es **crítico**, el sangrado es **permanente hasta ser curado** con algún efecto especial." → **Sangrado de arma estándar: 3 de daño por turno durante 4 turnos; con golpe crítico: permanente hasta curarlo** (efecto especial, venda, etc.). Efecto de casa de los **cortantes**. *Pendiente (implementación y reglas):* hoy el estado Sangrado del juego es permanente, 2 HP por turno y suma +1 por cada reaplicación; habrá que adaptarlo (3 HP/turno × 4 turnos; permanente si es crítico). *Sin decidir:* qué pasa si se vuelve a aplicar mientras ya sangra (¿renueva los 4 turnos, suma +1 de daño, o no hace nada?). **Probabilidades por tier de Sangrado, Lisiado y Envenenar**: tabla propuesta por el asistente, todavía sin confirmar.
- **2026-09-25 · P4, Sangrado (cambio de opinión, mensaje incompleto):** dueño: "Cambié de opinión. Volvamos al sangrado como era antes. **2** de daño. **Indefinido.** Y **suma más uno por cada nuevo aplique**. Y si es…" *(el mensaje quedó cortado; falta saber qué pasa "si es" —probablemente crítico—).* → Queda **sin efecto** lo anterior (3 por 4 turnos / permanente si es crítico). **Sangrado vuelve a ser como el estado actual del juego: 2 HP de daño por turno, indefinido (dura hasta curarse) y +1 de daño por cada nueva aplicación.** No hace falta cambiar el estado existente. **Pendiente de confirmar: el resto de la frase ("Y si es…").**
- **2026-09-25 · P4, peso de Sangrado y Envenenar:** dueño: "Tanto Sangrado como Veneno **no tienen tanto peso**. Es como un **daño adicional**, pero que da **mucha chance de curarse, de revertirlo**. Así que pueden aparecer **armas Raras que envenenen o sangren con cada golpe (100 %)**. Obviamente de tier mayor también. **De Buena calidad o incluso Comunes**, con un **porcentaje**. El valor depende de su valoración." → **Sangrado y Envenenar pesan poco** en el valor del arma (propuesta de peso: **2**, antes 3): son daño adicional fácil de curar. **100 % por golpe desde tier Raro** (y superiores); **Buena calidad e incluso Común solo con un porcentaje**; el **porcentaje** define el valor. (Reemplaza mi tabla de probabilidades anterior para estos dos efectos.)
- **2026-09-25 · P4, Lisiado:** "Tu propuesta para el Lisiado está bien." → **Lisiado**: efecto de casa de los **punzantes**; deja Lisiado **3 turnos** (PdG y Parry a la mitad); **peso 3**; **nunca 100 % en tiers bajos**: probabilidad **Buena calidad 25 % · Raro 33 % · Excepcional 50 % · Legendario 75 %** (alguna legendaria única puede llegar al 100 %).
- **2026-09-25 · P4, Envenenar:** "Para Veneno me parece bien. Dos stacks en Comunes y Buena calidad. Tres stacks en Buena calidad y Raras. Cuatro en Raras y Excepcionales. Cinco en Excepcionales y Legendarias. Seis, siete y ocho en armas Legendarias." → **Stacks de Veneno por golpe según tier** (cada stack = 1 HP por turno; se acumulan y se gasta uno por turno): **Común 2 · Buena calidad 2–3 · Raro 3–4 · Excepcional 4–5 · Legendario 5 a 8**. Con la regla de probabilidad del dueño: 100 % desde Raro, porcentaje en Buena calidad y Común. Peso 2.
- **Estado de la lista de efectos (P4), 2026-09-25:** elaborados y decididos → **Rompe armadura · Demora · Aturdir · Lisiado · Sangrado · Envenenar · Derribar · Prende fuego · Drena vida** (Agarrar fuera por ahora). **Faltan los modificadores:** Ignora N de Res. crítico, y los de Crítico frecuente/potente en armas (ver guía y P115).
- **2026-09-25 · Regla general del Veneno (configuración):** dueño: "Por regla general en el Veneno, el **stack y el daño por el stack siempre van a ser lo mismo**. Entonces nos podemos **saltear un paso** a la hora de configurar un veneno." → **Cada stack de Veneno hace siempre 1 HP por turno.** Al configurar un Veneno (estado, ítem, habilidad) **ya no se pregunta el daño por stack**: solo cuántos **stacks** (y los turnos). Aplicado en `comun/estado-preguntas.js` (los presets con `esVeneno`: Veneno y Veneno severo).
- **2026-09-25 · P4, Veneno severo en armas:** dueño: "También podemos encontrar algún arma **Excepcional y Legendaria** que aplique **Veneno severo durante X cantidad de turnos**. **Bastantes**." → Habrá **bastantes armas de tier Excepcional y Legendario que apliquen Veneno severo** (el veneno que **escala turno a turno**: hace 1 de daño el primer turno y 1 más con cada turno que pasa) **por X turnos** (cada arma define X). Es una variante más fuerte de Envenenar, reservada a esos dos tiers; su peso debe ser mayor que el de Envenenar común (propuesta: 3). Falta definir la escala de X por tier (propuesta: Excepcional 3–4 turnos, Legendario 4–6).

## Notas al margen
- **2026-09-25 · Orden de fases y equilibrio armas–defensa:** dueño: "Después de diseñar las armas vamos a diseñar el **mundo de la defensa**, ¿correcto? Porque puede haber algún tipo de **equivalencia de armaduras que ofrezcan resistencias a determinados críticos** que estén más o menos equiparadas a las **armas que tienen beneficio al crítico**, como para que se **balanceen en frecuencia** las unas y las otras." → **Sí: la fase 2 es el mundo de la defensa** (Defensa, Resistencia a crítico por slots, resistencias elementales, anillos). Al diseñarla hay que **equiparar en frecuencia** las armaduras que dan Resistencia a crítico (por Tipo) con las armas que dan Crítico frecuente/potente (o Ignora N de Res. crítico), para que ni los críticos ni la resistencia dominen. Para eso conviene tener a mano, al empezar esa fase, la **cuenta de cuántas armas del pool nuevo llevan crítico mejorado, por Tipo y tier**. (Nota, no es una pregunta abierta.)

### Análisis: Crítico frecuente ×1 vs Ignora 1 de Res. crítico (2026-09-25; propuesta, sin decidir)
Pregunta del dueño: "¿los puntos de +1 se pueden manifestar como Crítico frecuente o como Ignora N de resistencia? ¿Son equivalentes?" **No son equivalentes**, aunque se pueden tratar como intercambiables **para el precio** con una convención:
- **Frecuente +1** (baja el rango en 1) sirve contra **todos** los defensores, y sube tanto la chance de crítico como el nivel. Pero **cuánto sube depende del Tipo**: promedio de niveles de crítico ganados, con diferencias PdG − Evasión parejas hasta 3 × Tipo y defensor sin resistencia: **Tipo 4 +0,58 · Tipo 6 +0,33 · Tipo 10 +0,20** (a Tipo bajo pega más).
- **Ignora 1** vale **exactamente +1 nivel, pero solo si el defensor tiene Resistencia a crítico ≥ 1** contra ese Tipo; contra uno sin resistencia **no hace nada**. Con el defensor en R=1: gana ~+0,7 niveles en cualquier Tipo; con R=2 ~+0,4.
- **Comparación:** contra **R=0** gana Frecuente (Ignora vale 0). Contra **R=1** gana Ignora (T4 +0,75 vs +0,50; T6 +0,73 vs +0,28; T10 +0,70 vs +0,17). Contra **R=2** también Ignora, por menos margen.
- **Consecuencia:** el valor de "Ignora N" depende de **cuánta resistencia haya en el mundo**, o sea del diseño de la defensa (fase 2) y de la escasez por slots (P114). Como la resistencia es más común en Tipo 4 y 6, "Ignora N" rinde sobre todo ahí.
- **Convención de precio propuesta:** **1 punto de Frecuente ≈ 1 punto de Ignora** al calcular el puntaje de calidad, pero **son dos efectos distintos** (no se puede cambiar uno por otro sin cambiar cómo se comporta el arma). Se revisa cuando esté diseñada la defensa.
- **2026-09-25 · P4 (cierre), modificadores:** "Está bien, los dejamos así." → **Crítico frecuente/potente en las armas** (puntos por tier): **Común 0 · Buena calidad +1 · Raro +1 o +2 · Excepcional +2 o +3 · Legendario hasta +5** (el tope). **Ignora N de Res. crítico:** solo en armas de **Tipo 4 y 6**; **"Ignora 1" desde tier Raro**; **peso 3**; convención de precio **1 punto de Frecuente ≈ 1 punto de Ignora** (son efectos distintos). **La pregunta 4 queda cerrada.**
- **Lista FINAL de efectos de arma (P4):** **Rompe armadura** (hachas) · **Demora** (contundentes) · **Aturdir** (contundentes) · **Lisiado** (punzantes) · **Sangrado** (cortantes) · **Envenenar** (habilitado en lo que tiene filo y en las de rango; también **Veneno severo** en Excepcionales y Legendarias) · **Derribar** · **Prende fuego** · **Drena vida** · modificadores: **Crítico frecuente**, **Crítico potente**, **Ignora N de Res. crítico**. *(Fuera: Agarrar, Arruina armadura, Media armadura, Ignora armadura.)*

### Propuesta de cierre de P5, P6 y P7 (2026-09-25; sin responder)
Con todo lo decidido para cada efecto, queda armada una tabla resumen para confirmar o ajustar:

| Efecto | Peso | Probabilidad / aplicación por tier | Tier mínimo |
|---|---|---|---|
| Aturdir | 5 | Raro 10–15 % · Excepcional 25 % · Legendario 33–50 % (nunca 100 %) | Raro |
| Rompe armadura | 4 | 100 % solo en armas buenas (tier alto); con % en tiers bajos; 1 stack/golpe (Excepcional+ puede 2; Rara con % de 2) | Común (con %) |
| Demora | 4 | por definir (propuesta: Raro 25 % · Excepcional 50 % · Legendario 75 %) | Buena calidad |
| Drena vida | 4 | % del daño como palanca de valor (propuesta: 25 % Raro · 40 % Excepcional · 50 % Legendario); legendaria con Excedente | Raro |
| Lisiado | 3 | Buena 25 % · Raro 33 % · Excepcional 50 % · Legendario 75 % (alguna única 100 %) | Buena calidad |
| Derribar | 3 | solo probabilidad (propuesta: como Lisiado) | Buena calidad |
| Prende fuego | 3–4 | terreno incendiado: común daño 3 en 1 casilla; legendaria daño 5 en flor de 1 | Buena calidad |
| Veneno severo | 3 | 100 % o % en Excepcional y Legendario, X turnos (Exc 3–4, Leg 4–6) | Excepcional |
| Sangrado | 2 | 100 % desde Raro; Común/Buena con % | Común (con %) |
| Envenenar | 2 | 100 % desde Raro (stacks: Común 2 · Buena 2–3 · Raro 3–4 · Excepcional 4–5 · Legendario 5–8); Común/Buena con % | Común (con %) |
| Ignora 1 Res. crítico | 3 | según crítico | Raro (Tipo 4 y 6) |
| Crítico frecuente/potente (por punto) | 3 | Común 0 · Buena +1 · Raro +1/+2 · Exc +2/+3 · Leg hasta +5 | Buena calidad |

**Cantidad de efectos por arma (P5, propuesta):** Común 0 (algunas 1 con %) · Buena calidad 0–1 · Raro 1 · Excepcional 1–2 · Legendario 2–3. **Modulación por familia (P7):** multiplicar el peso por ×1 (efecto de casa), ×1,25 (habilitado) o ×1,5 (excepcional para esa familia).
- **2026-09-25 · P5, P6, P7 (cierre):** "Cerramos la tabla así." → **Quedan aprobadas** la **tabla resumen de efectos** (peso, probabilidad/aplicación por tier y tier mínimo de cada efecto), la **cantidad de efectos por arma según tier** (Común 0, con alguna de 1 con %; Buena calidad 0–1; Raro 1; Excepcional 1–2; Legendario 2–3) y la **modulación por familia del peso** (×1 de casa, ×1,25 habilitado, ×1,5 excepcional). Las tres probabilidades que estaban "por definir" quedan **como propuestas** (Demora: Raro 25 % · Excepcional 50 % · Legendario 75 % · Drena vida: 25/40/50 % del daño según tier · Derribar como Lisiado).
- **2026-09-25 · Regla de excepciones entre familias:** dueño: "También podemos crear efectos en tipos de armas que **no sean los frecuentes**, pero de forma **medio excepcional**: que haya alguna **espada** que tenga una **chance de romper armadura**, por ejemplo. Pero que **no haya ningún martillo que deje sangrando**. Que haya algún arma que **se pueda salir de su universo**, pero que sean **casos puntuales o escasos**." → Un arma puede llevar un efecto **fuera de los de casa y habilitados de su familia**, **como caso puntual y escaso** (ej.: una espada con un % de Rompe armadura), pero **nunca una combinación que contradiga el concepto** de la familia (ej.: un martillo que sangre o envenene). Propuesta de cuantificación (sin confirmar): como máximo ~**10 % de las armas de cada familia** pueden llevar un efecto "excepcional" para ella, y **solo de tier Raro o superior**; las combinaciones conceptualmente imposibles (contundente + Sangrado/Envenenar) **no se hacen**.
- **2026-09-25 · Excepción calidad–precio (mensaje del dueño, interpretación sin confirmar):** dueño: "Otras excepciones que podemos crear es que, por ejemplo, un arma **Común** tenga un efecto **un poquito más poderoso que su tier**, pero que esté **mucho más cara** que la misma arma de **Buena calidad**; que **la calidad o el precio de un arma determine su calidad por la relación calidad-precio**." → **Interpretación del asistente:** el **tier no es un tope rígido**: un arma puede tener **más poder del que le corresponde a su tier** (una Común con un efecto de Buena calidad, por ejemplo), y lo que lo **compensa es el precio**: sale **bastante más cara** que una Común normal (incluso más que una Buena calidad parecida), o sea una **peor relación calidad-precio**. Así el **precio funciona como válvula de balance** y la "calidad" de un arma se lee por la relación entre lo que da y lo que cuesta. *(Propuesta de mecanismo, sin confirmar: Precio = precio del puntaje × (1 + sobreprecio × exceso de poder sobre el techo de su tier); sobreprecio inicial ×1,5.)* Ver P8 a P10.
- **2026-09-25 · Excepción calidad–precio (confirmada):** "Eso así como lo entendiste, me parece bien. Vamos a calcular así como lo decís vos, siempre priorizando **redondear los precios en números redondos**." → **Confirmada**: una arma con más poder del que admite su tier se **vende más cara** (**sobreprecio ×1,5 por cada tier de exceso**, punto de partida); **los precios siempre en números redondos** (múltiplos de 5 hasta $100, de 10 hasta $300, de 50 hasta $1000, de 100 desde $1000).

## Fórmula de valorización v0 (P8–P10, en calibración)
Herramienta: [`../herramientas/calculadora_armas.py`](../herramientas/calculadora_armas.py) (`calibrar`, `ejemplos`, `arma NOMBRE`). **Todas las tasas son iniciales y se ajustan con ejemplos junto al dueño.**
- **Unidad:** 1 punto de calidad (PC) = 1 punto de daño esperado por ataque.
- **PC = daño esperado** (Peso × (Tipo+1)/2 + daño fijo) **+ bonos** (cada +1 a un stat × su tasa: PdG, Dmg, Parry, Bloqueo, Eva = 1; Rango, Iniciativa = 0,5; Nitros = 4) **+ efectos** (peso × probabilidad × 1 × modulación por familia ×1/×1,25/×1,5) **+ crítico mejorado** (3 por punto de Frecuente/Potente/Ignora 1) **− peso del arma** (0,2 por punto: relevancia intermedia).
- **Tier por umbrales de PC:** Común < 7,5 · Buena calidad 7,5–11 · Raro 11–17 · Excepcional 17–26 · Legendario ≥ 26.
- **Precio** (dentro de la banda del tier, redondo): Común $30–90 · Buena $80–160 · Raro $150–350 · Excepcional $400–900 · Legendario $1000–2000; ×1,5 por tier de exceso.
- **Pendiente de la fórmula:** el peso de las **dos manos** (P15), las armas de **rango** (P14), el costo en Nitros del ataque, y ajustar las tasas.
- **Calibración inicial con las 137 armas actuales** (el catálogo viejo no seguía estas reglas, así que no coincide del todo): por ejemplo Común 39 de 47 quedan Común; Legendario 4 de 11 quedan Legendario (varias legendarias viejas dependían de efectos que ya no existen). Sirve de referencia, no de meta.

## Universo de bonos y otras propiedades de las armas (detectado 2026-09-25, catálogo actual)
82 de las 137 armas actuales llevan **bonos a stats** (que la calculadora v0 ya suma con tasa 1, pero que no se evaluaron ni se repartieron por familia):
| Stat | Armas | Valores que aparecen |
|---|---|---|
| Rango / Alcance (`rng`) | 35 | +1 (20), +3 (6), +4 (3), +5 (4), +7, +8 |
| Bloqueo | 20 | +1 (12), +2 (3), +3 (5) |
| Parry | 16 | +1 (7), +2 (8), +3 (1) |
| PdG | 15 | +1 (8), +2 (7) |
| Crítico (ahora Frecuente) | 11 | +1 (7), +2 (3), +4 (1) |
| Iniciativa | 4 | +1 |
| Dmg | 2 | +2 |
| Especial / Rango de casteo / Bonos (SP) | 1 c/u | (armas mágicas: fase 3) |

Además: **daño fijo** en 40 armas (+1: 28, +2: 11, +3: 1); **1 arma con daño amplificado**; **16 armas de rango**; **ninguna con estado al equipar ni con estados propios** (aunque el juego lo permite: candidatos a "efectos raros" de tiers altos).

**Propuesta del asistente (P16, sin responder):**
- **Bonos por tier (suma de puntos):** Común 0–1 · Buena calidad 1–2 · Raro 2–3 · Excepcional 3–4 · Legendario 4–6; máximo +3 por stat en un arma.
- **Stats "de casa" por familia** (para modular el precio como los efectos): **Parry** → cortantes; **Bloqueo** → contundentes y hachas; **PdG** → punzantes; **Rango/Alcance** → punzantes largos (lanzas), alabardas y armas de rango; **Iniciativa** → armas livianas (Tipo 4); **Dmg** → armas pesadas (Tipo 8+). Fuera de casa, más caro (×1,25 habilitado, ×1,5 excepcional).
- **Tasas de valor (PC por punto):** PdG 1 · Dmg 1 · Parry 1 · Bloqueo 1 · Eva 1 · Rango/Alcance 0,5 · Iniciativa 0,5 · Nitros máx. 4 (rarísimo, solo Legendario).
- **Daño fijo:** parte del daño esperado (ya cuenta como PC).
- **Estados al equipar y estados propios:** reservados para Excepcional/Legendario, valorados como un efecto de peso a definir.
- **2026-09-25 · P16 (bonos a stats):** dueño: "Hay un efecto que sea **Alcance**, que me parece muy bien; que te dé más **Bloqueo**, más **Parry**, más **probabilidad de golpe** (PdG); lo de **Crítico** está bien; más **Iniciativa** también está muy bien; y que tenga **daño incrementado**, eso es un buen efecto para armas que podríamos usar bastante. Que el daño incrementado tenga un **peso muy distinto** a la hora de calcular tanto su valor en doblones como su tier **de acuerdo al tipo de arma**: no es lo mismo un [bono] incrementado en un arma Tipo 4 que en una Tipo 10. Todo eso debería estar incluido. Y **armas que tengan valores de daño fijo también**." → **Aprobados como bonos de arma:** **Alcance (Rango), Bloqueo, Parry, PdG, Crítico (Frecuente/Potente), Iniciativa, Dmg (daño incrementado) y daño fijo.** **El valor de cada bono depende del Tipo del arma.** Regla aplicada en la calculadora v0: los **bonos planos de daño (Dmg y daño fijo)** se normalizan al **costo en Nitros del primer ataque** (Tipo ÷ 2): factor = 4 ÷ ⌈Tipo/2⌉ (**Tipo 4 = ×2 · Tipo 6 = ×1,33 · Tipo 8 = ×1 · Tipo 10 = ×0,8 · Tipo 12 = ×0,67**), porque los Nitros son el recurso precioso: +1 de daño por golpe rinde más en un arma barata en Nitros. El **crítico mejorado** rinde más en Tipo bajo (calculado con la regla del crítico): **Tipo 4 ×1,75 · Tipo 6 ×1 · Tipo 8 ×0,75 · Tipo 10 ×0,6 · Tipo 12 ×0,5**. *Sin confirmar todavía:* límites de puntos por tier y stats "de casa" por familia (propuestos arriba).
- **2026-09-25 · Nota de la calculadora (hallazgo):** el **Crítico frecuente solo cuenta hasta el punto en que el rango llega a su mínimo (2)**: un arma de **Tipo 4 aprovecha como máximo 2 puntos**, una de Tipo 6 hasta 4, una de Tipo 8 hasta 6, etc.; más puntos no suman valor. El Facón de Martín Fierro (Tipo 4, Crítico +4) tiene 2 puntos "desperdiciados" con la regla nueva: al rehacerlo, ponerle **Frecuente +2 y Potente** o cambiar el arma de Tipo.
- **2026-09-25 · P16 (cierre parcial):** dueño: "Lo que proponés, **dos stats de casa por familia** me parece bien. El valor del bono al **daño fijo**, me parece que podría estar en **todas las familias**. Lo mismo que el **daño incrementado**, pero **no en cualquier familia va a tener el mismo peso valorativo**." → **Dos stats de casa por familia** (propuesta concreta, a confirmar): **Punzantes** PdG · Alcance · **Cortantes** Parry · Iniciativa · **Hachas** Bloqueo · Alcance · **Contundentes** Bloqueo · Parry · **Explosivos** y **De rango** Alcance · PdG. Un bono **fuera de su casa cuesta ×1,25**. **Dmg (daño incrementado) y daño fijo pueden estar en TODAS las familias**, pero **con distinto peso valorativo según la familia**: ya lo da el **factor por Tipo** (Tipo 4 ×2 … Tipo 12 ×0,67), que además separa las familias porque cada una tiene su Tipo. El **crítico** también vale para todas (con su propio factor por Tipo). Aplicado en la calculadora v0.
- **2026-09-25 · P16 (cierre):** "Los tipos de bono por tier me parece bien como los proponés. Y sobre la tabla de stats de casa, me parece bien así como lo proponés también. Vamos para adelante." → **P16 cerrada**: **puntos de bonos por tier** (suma de todos los stats): **Común 0–1 · Buena calidad 1–2 · Raro 2–3 · Excepcional 3–4 · Legendario 4–6; máximo +3 por stat**; y **dos stats de casa por familia** como en la tabla propuesta (Punzantes PdG · Alcance / Cortantes Parry · Iniciativa / Hachas Bloqueo · Alcance / Contundentes Bloqueo · Parry / Explosivos y de rango Alcance · PdG), con bono fuera de casa ×1,25. **"Vamos para adelante"** se toma como aval de trabajar con la **fórmula v0 de valorización como base** y afinarla con ejemplos (P8–P10 siguen 🟡 en calibración).
- **2026-09-25 · Peso de Crítico frecuente vs Crítico potente (pregunta del dueño en la calle):** "Crítico frecuente debería tener más peso valorativo que [el otro tipo de mejora del crítico]. ¿Lo estás contemplando?" → **Tenés razón y no lo estaba** (la calculadora los trataba igual). Con el **multiplicador esperado del d20** (mejor de N dados, según los niveles de crítico y los umbrales) sale: **Frecuente +1 gana +0,20 (Tipo 4) · +0,13 (Tipo 6) · +0,08 (Tipo 10)** al multiplicador esperado de un golpe; **Potente +1 gana +0,025**, **+2 acumula +0,09** y **+3 +0,17** (los primeros puntos valen poco y los siguientes más). Promedio de los primeros 3 puntos: potente ≈ **0,4 de un punto de Frecuente** (solo 0,12–0,32 en el primer punto). **Aplicado:** cada punto de **Crítico potente vale 0,4 de uno de Frecuente** en la calculadora (y no depende del Tipo, a diferencia del Frecuente). El Frecuente sigue pesando más y valiendo más en Tipo bajo.

## Herramienta de auditoría de armas (2026-09-25)
- **Pedido del dueño:** los sets (ej. Martín Fierro) son **una nota de color y muy de post-diseño**: lo primero es un **catálogo sólido y coherente de base**. Quiere una **herramienta simple para auditar las armas**: una lista scrolleable con la información relevante de cada arma, donde **marcar la decisión** (confirmar, reimaginar, etc.) y **escribir notas** ("está bien pero muy cara", "corregiría esto"), y que **el asistente lea ese archivo después para reworkear los ítems**. **No un Excel** (información dispersa y poco amigable).
- **Herramienta:** [`../datos/auditoria-armas.html`](../datos/auditoria-armas.html) (sitio publicado: `https://elsauloel.github.io/rolpintoista/datos/auditoria-armas.html`; también en el ☰ como "🗡 Auditoría de armas"). Lista de tarjetas con filtros (familia, tier, decisión, con nota, búsqueda) y orden; cada tarjeta muestra el daño, los bonos, los efectos, el precio de hoy, el puntaje/tier/precio nuevos y "cómo se calculó". **Decisiones:** ✅ Confirmar · 🔧 Reajustar · 🔄 Reimaginar · 🗑 Descartar (+ nota libre). Se **guarda solo en el navegador** y con **💾 Guardar en el proyecto** se sube (con el mismo token de GitHub del editor de catálogo, `gh-token`) al archivo **`datos/auditoria-armas.json`** de la rama `nueva-version`; también **⬇ Descargar / ⬆ Cargar** como respaldo.
- **Datos que muestra:** `datos/auditoria-armas-datos.json`, generado por `python herramientas/calculadora_armas.py auditoria` (el asistente lo regenera cuando cambian las tasas o se suman armas nuevas; las armas nuevas de cada tanda se agregan al mismo archivo con `origen: "nuevo"`).
- **Cómo la usa el asistente:** al empezar (o cuando el dueño avise "auditoría lista"), hacer `git pull`, **leer `datos/auditoria-armas.json`** (`decisiones: {id: {nombre, d, nota}}`) y aplicar: *confirmar* → dejar; *reajustar* → corregir según la nota; *reimaginar* → proponer el nuevo concepto; *descartar* → sacar. Anotar en "Respuestas y decisiones" lo que se hizo. La hoja en Markdown [`rework-armas-revision.md`](rework-armas-revision.md) queda solo como referencia.

## Flujo de trabajo por partes (acordado 2026-09-25)
Dueño: "Te empezás por la que te parezca. Yo puedo ir auditando por partes: un día audito tres, te aviso y vas marcando como auditadas y las quitás de la lista de auditoría."
1. **El asistente** prepara una **tanda** de armas nuevas (`datos/armas-nuevas.json`, campo `tanda`) y regenera los datos de la herramienta: `python herramientas/calculadora_armas.py auditoria` (une el catálogo actual + las nuevas, menos las ya procesadas). Se sube al repo.
2. **El dueño** audita las que quiera en [`../datos/auditoria-armas.html`](../datos/auditoria-armas.html) (decisión + nota), aprieta **💾 Guardar en el proyecto** y avisa ("auditadas tales").
3. **El asistente** hace `git pull`, lee `datos/auditoria-armas.json`, **aplica** cada decisión (ajusta `armas-nuevas.json`, el catálogo o lo que corresponda), **mueve esas armas a `datos/auditoria-armas-procesadas.json`** (`{id, nombre, decision, nota, aplicado}`) y **regenera** los datos: **desaparecen de la lista**. Lo aplicado se anota en "Respuestas y decisiones".
4. Se repite. Cuando una familia queda toda procesada, se pasa a la siguiente tanda.

### Tanda 1 — Punzantes (Tipo 4), 12 armas nuevas (2026-09-25)
Diseñadas con las reglas de este documento y calculadas con la fórmula v0 (todas caen en su tier): **Común:** Cuchillo de cocina reconvertido, Estilete de práctica, Lezna de zapatero (PdG +1, Lisiado 25 %) · **Buena calidad:** Daga de duelo (PdG +1, Crítico frecuente +1), Lanza de leva (2 manos, Alcance +1, Lisiado 25 %), Aguja de acupunturista (+2 fijo, PdG +1, Sangrado 33 %) · **Raro:** Estoque de esgrima (PdG +2, Frecuente +1, Alcance +1), Lanza de lisiar (2 manos, Alcance +2, PdG +1, Frecuente +1, Lisiado 33 %), Puñal envenenado (+1 fijo, Frecuente +1, Veneno 3 stacks al 100 %) · **Excepcional:** Aguijón de la Reina Avispa (+2 fijo, Frecuente +2, Veneno severo 4 turnos), Lanza del alba (2 manos, Alcance +2, PdG +2, Frecuente +1, Lisiado 50 %) · **Legendario:** Colmillo de la Reina Araña (+3 fijo, PdG +2, Frecuente +2, Veneno severo 6 turnos, Drena vida 50 % con Excedente de vida). Detalle de cada una y sus puntajes en la herramienta de auditoría (origen "nuevo · tanda 1").

### Reajuste automático de las armas ACTUALES a las reglas nuevas (2026-09-25)
Pregunta del dueño: "¿A las armas que ya estaban las trabajaste también? Estaría bueno que les apliques el filtro y el criterio que estuvimos trabajando." → **Hecho** en `calculadora_armas.py` (`reajustar`): antes de mostrarlas en la herramienta de auditoría, cada arma actual pasa por las reglas nuevas y la tarjeta muestra **"Cambios propuestos"** y **"A decidir"**. **Reglas aplicadas:** efectos descartados se quitan (Ignora armadura, Golpes seguidos, Explosión, Estruendo) o se reemplazan (**Arruina/Media armadura → Rompe armadura · Primera sangre → Sangrado · Empuje → Demora · Pajaritos → Lisiado**); **Aturdir y Lisiado nunca al 100 %** (probabilidad por tier); **Sangrado/Envenenar/Rompe armadura al 100 % solo desde Raro** (Común y Buena calidad con %); **"Ignora N de Res. crítico"** solo en Tipo 4 y 6 desde Raro; **Crítico frecuente** hasta el rango mínimo (Tipo 4: +2 como máximo); **máximo +3 por stat**; avisos si tiene **más bonos o más efectos** de los que admite su tier, si un efecto pide un **tier mínimo** (Aturdir/Drena vida Raro, Veneno severo Excepcional) o si está **fuera del universo de su familia**. Luego se recalculan el puntaje, el **tier** y el **precio** (números redondos). **Resultado en las 137:** 24 con cambios automáticos, 17 con avisos "a decidir", y **63 cambian de tier** por la fórmula (el catálogo viejo no seguía estas reglas). Lo que cambia de tier o de precio queda para que el dueño lo audite, arma por arma.

### Tanda 2 — Cortantes (Tipo 6), 12 armas nuevas (2026-09-25)
Familia del **Sangrado** (de casa), stats de casa **Parry e Iniciativa**, universo del **Crítico potente**. Todas caen en su tier: **Común:** Espada de entrenamiento, Machete de chacarero (+1 fijo), Sable de abordaje oxidado (Sangrado 25 %) · **Buena calidad:** Espada larga de infantería (Parry +1), Cimitarra del desierto (+1 fijo, Iniciativa +1, Sangrado 33 %), Espada de la guardia (Parry +1, Potente +1) · **Raro:** Katana de maestro (Parry +2, Ini +1, Frecuente +1, Sangrado 50 %), Sable del capitán pirata (+2 fijo, Parry +1, Potente +1, Sangrado 100 %), Espada vampírica menor (Parry +1, Drena vida 25 %) · **Excepcional:** Espadón de acero de Toledo (2 manos, Parry +2, Potente +2, Sangrado 100 %), Katana del viento (Ini +2, Parry +2, Frecuente +2, Lisiado 50 %) · **Legendario:** Filo del Capitán Sin Nombre (+3 fijo, Parry +3, Ini +1, Frecuente +3, Potente +2, Sangrado 100 %, Veneno severo 5 turnos). Cargadas en `datos/armas-nuevas.json` con `tanda: 2`.

## Corrección de las casas del crítico (2026-09-25)
Dueño: "Vamos a revertir las casas: que las de **Tipo 6** sean **Crítico frecuente** y las de **Tipo 4** sean **Crítico potente**." → **Tipo 6 acentúa el frecuente; Tipo 4 acentúa el potente** (ambos pueden llevar las dos). **Aplicado a las tandas 1 y 2**: los punzantes (Tipo 4) ahora llevan sobre todo **Crítico potente** (con algún punto de frecuente), y los cortantes (Tipo 6) sobre todo **Crítico frecuente**; se reacomodaron los puntos para que cada arma siga cayendo en su tier. Motivo práctico que apoya el cambio: un Tipo 4 solo aprovecha 2 puntos de frecuente (el rango no baja de 2), pero puede usar hasta 6 de potente; un Tipo 6 aprovecha hasta 4 de frecuente.

### Tanda 3 — Hachas y pesadas (Tipo 8), 12 armas nuevas (2026-09-25)
Familia del **Rompe armadura** (de casa), stats de casa **Bloqueo y Alcance**; sin acento de crítico (no es su universo). Regla: **Rompe armadura al 100 % solo desde Raro**; **2 stacks por golpe solo desde Excepcional** (la calculadora suma +50 % por stack extra). Todas caen en su tier: **Común:** Hachuela de leñador, Hacha de mano (+1 fijo, Rompe 25 %), Tomahawk de pantano (Bloqueo +1) · **Buena calidad:** Hacha de guerra (Rompe 25 %), Hacha de abordaje (Bloqueo +1, Alcance +1), Hachón de minero (+1 fijo, Rompe 33 %) · **Raro:** Hacha del Jefe de Guerra (Bloqueo +1, Rompe 100 %), Segur de verdugo (+1 fijo, Alcance +1, Rompe 50 %), Hacha arrojadiza (Alcance +2, PdG +1, Sangrado 50 %) · **Excepcional:** Gran hacha de doble filo (2 manos, Bloqueo +2, Rompe 100 %), Hacha del Cazador de Armaduras (+2 fijo, Bloqueo +2, Alcance +1, **2 stacks** por golpe) · **Legendario:** Hacha del Fin de la Veta (2 manos, +3 fijo, Bloqueo +3, Alcance +1, 2 stacks y Sangrado en cada golpe). *(Nota: 3 de las 12 son de dos manos, más del 10 % global, porque las hachas pesadas lo piden; el reparto final se ajusta al cerrar el catálogo.)* **Novedad de la calculadora:** los efectos aceptan un campo `stacks` (Rompe armadura +50 % por stack extra; Envenenar escala con stacks/2): el Puñal envenenado (3 stacks) subió a PC 13,9.

### Tanda 4 — Contundentes (Tipo 10), 12 armas nuevas (2026-09-25)
Familia de **Demora y Aturdir** (de casa), stats de casa **Bloqueo y Parry**; habilitados Rompe armadura y Derribar. Reglas: **Aturdir solo desde Raro y nunca al 100 %** (Raro ~17 % · Excepcional 25 % · Legendario 33 %); **Demora desde Buena calidad** (25 % en Buena y Raro · 50 % Excepcional · 75 % Legendario). El daño fijo pesa menos en Tipo 10 (×0,8). Todas caen en su tier: **Común:** Garrote de pastor, Mazo de carnicero (+1 fijo), Porra de guardia (Bloqueo +1) · **Buena calidad:** Maza de guerra, Martillo de herrero (+1 fijo, Bloqueo +1, Parry +1, Demora 25 %), Estrella del alba (+1 fijo, Rompe armadura 33 %) · **Raro:** Martillo de sargento (Bloqueo +1, Parry +1, Aturdir ~17 %), Maza de justicia (Demora 25 %), Cachiporra reforzada (+2 fijo, Bloqueo +1, Demora 25 %) · **Excepcional:** Martillo de guerra a dos manos (Bloqueo +2, Aturdir 25 %), Maza del Peñasco (+2 fijo, Bloqueo +2, Parry +1, Demora 50 %) · **Legendario:** Mazo del Juicio Final (2 manos, +3 fijo, Bloqueo +3, Parry +2, Aturdir 33 %, Demora 75 %).

### Explosivos (Tipo 12) — propuesta del asistente, sin responder (2026-09-25)
Hoy hay solo **2 armas de Tipo 12** (Lanzallamas Raro, Martillo del Titán Excepcional); en el catálogo final serían ~15 (5 %). **Cómo me los imagino:** armas de **muy alto daño por golpe pero carísimas en Nitros** (el primer ataque cuesta 6 y los siguientes 12), así que se usan **una vez por turno**. Tres tipos: **(a) Colosales** de dos manos (mazas, hachas y espadones gigantes; d12 con Peso 2–4; Demora, Aturdir y Derribar habilitados), **(b) de fuego y pólvora** (lanzallamas, cañones de mano, lanzabombas; **Prende fuego** habilitado, Alcance; el área la da el **terreno incendiado**), **(c) bombas y granadas** que conviene tratar como **consumibles** (un solo uso) y no como armas. **Área y fuego amigo:** el criterio del dueño para lo físico y explosivo es que **el efecto en área alcanza también a los aliados**; un efecto "Explosión" (flor de 1 alrededor del objetivo) fue **descartado** del diseño nuevo, así que la propuesta es **no darle área a las armas explosivas** salvo por el terreno incendiado. **Stats de casa:** Alcance y PdG. **Preguntas para el dueño:** (1) ¿"Explosivo" = solo daño enorme por golpe, o también **área**? (2) ¿Las bombas y granadas son **consumibles** (fuera de las armas)? (3) ¿Las de Tipo 12 son casi todas de **dos manos**? (4) ¿Las armas de **fuego y pólvora** (pistolas, arcabuces) van acá o con las **de rango**?

- **2026-09-25 · Explosivos (Tipo 12): en pausa.** Dueño: "Vamos a dejar las explosivas para después. Sigamos con las de rango." → la tanda de **explosivos queda para más adelante** (la propuesta de arriba queda sin responder). Sigue **de rango (P14)**.

### Armas de rango — propuesta de criterio de diseño (P14), sin responder (2026-09-25)
**Lo que ya existe:** 16 armas de rango en el catálogo actual (hondas Tipo 4; arcos y ballestas Tipo 6–8; pistolas Tipo 8–10; lanzallamas Tipo 12); **6 son de dos manos** (los arcos); su **Rango** va de +3 (hondas, ballestas de mano) a +8 (arco legendario); precios de $40 a $2000. Reglas del juego: el **daño de un arma de rango no suma Fuerza (Dmg)**; el tirador dispara **con certeza hasta una distancia igual a su Destreza** y más lejos tira 1d20 (7+, 17+, 20); el **Rango** del arma es su distancia de disparo (arco largo: Rango +5). En el manual queda **sin mecánica** el "cooldown del arma".
**Cómo me lo imagino:** el **Rango del arma NO es un bono de tier como el Alcance**: es la **identidad** de la familia. Propuesta de tres sub-familias: **(a) Arcos y hondas** (arcos a dos manos, T6; hondas T4 a una mano): **mucho Rango**, flechas con **Envenenar** y **Prende fuego** (habilitados por familia), crítico como los cortantes (frecuente en T6); **(b) Ballestas** (una mano las de mano, dos las pesadas; T6–T8): **PdG y penetración** (Ignora N de Res. crítico en las mejores; Rompe armadura como excepción puntual), Rango medio; **(c) Pólvora** (pistolas T8, revólveres T10, arcabuces): **daño alto con Rango corto/medio** y control (Aturdir, Derribar en las legendarias). **Stats de casa:** Rango/Alcance y PdG (ya definido). **Valor del Rango:** hoy 0,5 PC por punto; como para las de rango es la identidad, propongo **subirlo a 0,75** y **topear por tier** (Común +3/+4 · Buena +4/+5 · Raro +5/+6 · Excepcional +6/+7 · Legendario +8). **Cadencia / recarga:** el "cooldown del arma" **no tiene mecánica**; podría ser una palanca de diseño (armas potentes que disparan cada 2 turnos = más baratas), pero habría que construirla.
**Preguntas para el dueño (P14):** (1) ¿El Rango es la identidad de la familia y se topea por tier como propongo? (2) ¿Las armas de **pólvora** van con las de rango (yo digo que sí)? (3) ¿Querés una **mecánica de recarga/cooldown** o la dejamos afuera por ahora? (4) ¿Los **arcos** siempre a dos manos? (5) ¿Munición? (propuesta: **sin munición**, es un recurso de más).

- **2026-09-25 · Armas de rango: en pausa, criterio confirmado a grandes rasgos.** Dueño: "Las armas de rango las vamos a trabajar en otro momento, pero sí, vas bien. Hay que contemplar que **el rango vale mucho por sí mismo, tiene mucha ventaja. Entonces tienen que hacer menos daño que las armas melee porque quedan menos expuestos.**" → al retomar: (1) el Rango es la identidad de la familia (va bien); (2) **penalizar el daño respecto de las cuerpo a cuerpo** (menos daño esperado por tier, a calibrar en la fórmula, p. ej. con un descuento por Rango); (3) las preguntas 2–5 de arriba (pólvora, cooldown, arcos a dos manos, munición) siguen abiertas. No hacer tanda 5 todavía.

## Armas mágicas — primera propuesta (2026-09-25), sin responder
Dueño: "Mirando las armas de tipo 4 a 10, vamos a empezar a imaginar las armas mágicas." Base ya decidida (P116/P117, guía §0): armas de **daño** y de **efecto**; varita básica 1d4 por 1 Nitro (calidad baja), buena calidad 1d6 por 1 Nitro; el daño mágico va **directo a la vida** (por eso caro); el SP regula; elementos arcano/fuego/hielo/rayo.
**Propuesta: cada elemento hereda la "casa" de una familia física.**
- **Arcano ↔ punzante (Tipo 4):** el más puro, sin efectos; va directo. Varitas y dardos arcanos: dado chico, barato en Nitros, alta chance de crítico potente.
- **Rayo ↔ cortante (Tipo 6):** rápido; Iniciativa, cadena, chance de Parálisis.
- **Fuego ↔ hacha (Tipo 8):** pesado, área y terreno incendiado (flor o cono); rompe cosas.
- **Hielo ↔ contundente (Tipo 10):** control; chance de Escarcha (como Demora/Aturdir).
**El dado sube con el Tipo** (varita d4 → báculo d10) y el **peso también** (varita 1, báculo grande mucho).
**Preguntas:** (1) ¿Te cierra el mapa elemento ↔ familia? (2) ¿El dado del arma mágica es el daño (sin sumar Especial) y el Especial solo da el PG mágico / potencia de efectos? (3) ¿La magia tiene crítico, o el crítico queda para lo físico? (4) ¿Los báculos también pegan cuerpo a cuerpo (híbrido con Alcance) o son solo de casteo? (5) ¿Costo base: 1 Nitro + SP según el efecto, y el SP sube con el tier?

- **2026-09-25 · Respuesta (P3 de arriba):** **El daño mágico NO hace crítico** (dicho por el dueño, 2026-09-25, "mucho, muy importante"): el daño **arcano, eléctrico (rayo) y de fuego no hacen crítico**. **Solo hacen crítico los ataques físicos**, incluso los que nacen de un hechizo: p. ej. una **estaca de hielo** (daño físico con potencia por Especial). Consecuencia: las armas mágicas de daño **no llevan Crítico frecuente/potente** ni resistencia a crítico que las afecte; su valor viene del dado, los elementos, los efectos y el costo. (Hielo: el daño de hielo puro tampoco crítica; solo lo hace la versión física, como la estaca.) Queda corregida la propuesta: el arcano ya no lleva crítico potente.

## Armas mágicas — banco de ideas (2026-09-25, carta blanca del dueño)
Dueño: "que no todo esté centrado en el daño, sino en efectos. Valete de las herramientas e inventá mecánicas; yo las sumo, las ajustaré." Criterio: **no critican** (regla de arriba), el daño va directo a la vida, así que **el valor está en la forma y el efecto**. Cada idea se apoya en algo que el mapa/Mesa ya tiene (⚙ = ya automatizable hoy, 🔧 = pide un pequeño desarrollo, ✋ = a mano). Nombres y números son sugerencias.
**Forma y terreno**
1. **Vara del sendero** (Excepcional): deja una **línea de 4 casillas de terreno** (fuego, hielo o hierba) que dura 3 turnos. Fuego: daña al entrar; hielo: casillas resbaladizas (⚙ terreno con efecto de estado, 🔧 forma línea).
2. **Báculo del muro** (Raro): levanta un **muro de 3 casillas** que bloquea paso y visión 2 turnos; se rompe con daño. ⚙ elementos de mapa bloqueantes.
3. **Bastón de la marea** (Excepcional): **empuja o atrae** a todos los que estén en un cono 1–2 casillas. ✋ mover fichas (el GM/jugador mueve), ⚙ el aviso.
**Portales y espacio (aprovechan lo ya hecho)**
4. **Varita del dintel** (Raro): abre **dos portales** (entrada y salida) a ≤ 4 casillas; sirve a aliados, dura 2 turnos. ⚙ portales aliados con turnos.
5. **Anillo de trueque** (Excepcional, 1 por mano): **intercambia de lugar** a dos aliados (o a vos y un aliado) en rango. 🔧
6. **Cetro del ancla** (Raro): planta una **trampa de teleport de regreso**: al gastar un Nitro volvés a ella. ⚙ trampa con destino.
**Visibilidad y niebla**
7. **Vara de bruma** (Buena): **flor de niebla** radio 1 durante 2 turnos: dentro no se ve ni se apunta a más de 2 casillas. ⚙ niebla/visibilidad.
8. **Lente del vidente** (Raro): revela **casillas ocultas y trampas** en radio 3; el aliado marcado ve a través de la niebla. ⚙/✋.
**Iniciativa y turnos**
9. **Reloj de arena** (Excepcional): sube 1 lugar a un aliado o baja 1 a un rival en la tabla de iniciativa (una vez por combate). ⚙ tabla de iniciativa (Demora).
10. **Bastón de la pausa** (Raro): 25 % de dejar al golpeado **sin acción de movimiento** este turno. ✋ aviso.
**Estados y elementos**
11. **Vara del deshielo/pira** (Raro): **hielo y fuego se cancelan**: apaga un terreno incendiado y quita 1 stack de Escarcha a un aliado (o al revés). ⚙ Escarcha acumulable, terreno incendiado.
12. **Cetro del rayo cíclico** (Excepcional): rayo en cadena que **vuelve al lanzador** y cura 1 HP de Excedente por salto (⚙ rayo en cadena, Excedente de vida; no critica).
13. **Aguja de estalactita** (Raro): **daño FÍSICO** de hielo con potencia por Especial → **sí critica** y la armadura lo reduce; deja Escarcha con 25 %. (El ejemplo que el dueño dio.)
**Utilidad y sandbox**
14. **Varita de la marca** (Común/Buena): marca al objetivo: el próximo aliado que lo golpee ignora 1 de Defensa. 🔧 estado con `usoEn`.
15. **Bastón del ecualizador** (Legendario): al golpear, **copia** el estado más fuerte del objetivo a un aliado o a vos (Excedente, Crítico frecuente…). ✋/🔧.
16. **Flauta del eco** (Raro): repite el último hechizo sin gastar Nitro, pero cuesta el doble de SP y solo una vez por combate. ✋.
**Preguntas:** ¿cuáles de estas te gustan como punto de partida? ¿Cuánto SP por hechizo en el primer escalón (1–3, como los efectos de arma)? ¿Hechizos con límite por combate (como el reloj, el eco) o por SP solamente?

## Armas mágicas — las 16 ideas con usos por combate (2026-09-25, borrador para que el dueño evalúe)
Dueño: "Diseñalos por combate y yo después me fijo si vale la pena." **Regla propuesta:** cada hechizo del arma tiene **usos por combate** (se recuperan al terminar el combate) además de costar Nitros y SP. **Más potente = menos usos:** Común/Buena 3 · Raro 2 · Excepcional 1–2 · Legendario 1. **Nitros:** 1 en casi todos (recurso muy preciado; los de 2 son los que cambian el combate). **SP:** 1–3 según el efecto. Los usos son **recordatorio/contador** (⚙ en la ficha si se puede; si no, ✋). Todo lo de aquí son números de partida.
| # | Arma (tier) | Peso/manos | Usos | Nitros | SP | Forma y alcance | Efecto | Dura |
|---|---|---|---|---|---|---|---|---|
| 1 | Vara del sendero (Exc.) | 1 · 1m | 2 | 1 | 3 | Línea de 4 casillas, alcance 4 | Terreno de fuego (daño 5 al entrar), hielo (resbala: Demora al cruzar) o hierba (Cobertura) | 3 turnos |
| 2 | Báculo del muro (Raro) | 3 · 2m | 2 | 1 | 2 | 3 casillas en fila, alcance 3 | Bloquea paso y visión; se rompe con 10 de daño | 2 turnos |
| 3 | Bastón de la marea (Exc.) | 3 · 2m | 1 | 1 | 3 | Cono de 2 casillas | Empuja o atrae 2 casillas a cada uno; si choca contra algo, 1d4 de daño físico | instantáneo |
| 4 | Varita del dintel (Raro) | 1 · 1m | 2 | 1 | 2 | 2 portales aliados a ≤ 4 casillas | Aliados pasan gratis (sin costo de movimiento) | 2 turnos |
| 5 | Anillo de trueque (Exc., 1 por mano) | 0 | 1 | 1 | 2 | Alcance 5 | Intercambia de lugar a dos aliados (o vos y uno) | instantáneo |
| 6 | Cetro del ancla (Raro) | 2 · 1m | 2 | 1 (volver: 1) | 2 | Se planta donde estás | Marca un punto; con 1 Nitro volvés a él desde ≤ 8 casillas | hasta fin de combate |
| 7 | Vara de bruma (Buena) | 1 · 1m | 3 | 1 | 1 | Flor radio 1, alcance 3 | Niebla: dentro, no se ve ni se apunta más allá de 2 casillas | 2 turnos |
| 8 | Lente del vidente (Raro) | 1 · 1m | 2 | 1 | 1 | Radio 3 | Revela casillas ocultas y trampas; un aliado marcado ve a través de niebla | 2 turnos |
| 9 | Reloj de arena (Exc.) | 1 · 1m | 1 | 2 | 3 | Alcance 6 | Sube 1 lugar a un aliado **o** baja 1 a un rival en la iniciativa (definitivo) | instantáneo |
| 10 | Bastón de la pausa (Raro) | 2 · 1m | 2 | 1 | 2 | Alcance 4 | 25 % de dejar al golpeado sin movimiento (0 casillas) en su próximo turno | 1 turno |
| 11 | Vara de la pira y el deshielo (Raro) | 1 · 1m | 3 | 1 | 1 | Casilla/flor radio 1 | Apaga fuego y quita 1 stack de Escarcha a un aliado (modo pira: al revés, pone fuego y quita 1 stack a un rival) | instantáneo |
| 12 | Cetro del rayo cíclico (Exc.) | 2 · 1m | 1 | 1 | 3 | Rayo en cadena (hasta 3 casillas entre saltos) | Cada salto: 15 % de Parálisis (no critica); vuelve al lanzador y le da 1 HP de Excedente por salto | instantáneo |
| 13 | Aguja de estalactita (Raro) | 2 · 1m | 2 | 1 | 2 | Alcance 5 | Daño **físico** (Especial + 1d6): critica y la armadura lo reduce; 25 % de 1 stack de Escarcha | instantáneo |
| 14 | Varita de la marca (Buena) | 1 · 1m | 3 | 1 | 1 | Alcance 4 | El próximo aliado que golpee al marcado ignora 1 de Defensa (consume la marca) | 2 turnos |
| 15 | Bastón del ecualizador (Leg.) | 3 · 2m | 1 | 2 | 3 | Alcance 3 | Copia el estado más fuerte del objetivo a un aliado o a vos (mismo tiempo restante) | instantáneo |
| 16 | Flauta del eco (Raro) | 1 · 1m | 1 | 0 (el eco) | doble | — | Repite el último hechizo lanzado en el combate sin pagar Nitros, pagando el doble de SP | instantáneo |
**Notas de balance (mías, a revisar):** los de 2 Nitros (Reloj, Ecualizador) son los que cambian el combate: 1 uso y solo Exc./Leg. Los de terreno/niebla/muro pesan por duración: 2–3 turnos. Anillos: uno por mano; el trueque cuenta como hechizo, no como bono. Conviene decidir **cómo se recuperan los usos** (¿al terminar el combate y punto? ¿o por descanso?). El costo en **PC/precio** de estas armas todavía no está calibrado (el motor v0 solo valúa armas físicas): habría que sumar una tabla de "valor de hechizo" (forma × usos × duración).

## Ajustes del 2026-09-25 (pedidos del dueño): armas idénticas, Alcance y precio de partida
1. **Armas idénticas con otro nombre (no debe pasar).** Se relevaron **~33 grupos** de armas con exactamente los mismos números y efectos (no solo cuchillos: dagas, espadas, sables, hachas, bastones, garrotes, ballestas…). Se sumó a la segunda y tercera de cada grupo una **variación leve** (un bono +1 o un efecto de 25–33 %): tabla en `herramientas/variaciones_armas.py`, aplicada en `reajustar()` (aparece en "Cambios propuestos" de la auditoría). Las armas nuevas (tandas) se corrigieron directamente en `datos/armas-nuevas.json`. Las variaciones evitan cruzar de tier respecto de la base, salvo unas pocas que la fórmula ya ubica más alto (Espada del veterano, Espada bastarda del Espectro, Maza). Además dos armas nuevas chocaban de nombre con el catálogo y se renombraron: *Hacha del Caudillo* y *Martillo del sargento mayor*.
2. **El Alcance +1 tenía que costar (dueño):** la Horquilla (+1 Alcance, "pega sin estar adyacente") salía igual que un cuchillo sin nada. Ahora, en armas **cuerpo a cuerpo**, el **1.º punto de Alcance vale 2 PC** y cada punto siguiente 1 PC (antes 0,5 por punto); fuera de la casa del arma, ×1,25. El `rng` de las **armas de rango** sigue a 0,5 (es su identidad; se calibra con el rework de rango). Horquilla: 2,8 → **4,3 PC (~$55)**. Se recalibraron tres armas nuevas que subían de tier (Estoque de esgrima PdG +2→+1, Segur de verdugo sin daño fijo, Hacha de abordaje sin Bloqueo).
3. **Precio de partida más bajo (dueño):** el cuchillo básico (1d4, sin nada) cuesta **$40**, no 50. La banda del tier Común pasó de $30–90 a **$20–80** (Buena Calidad sigue en 80–160, así que ya no hay salto en la frontera). Por ejemplo: Cuchillo $40 · Daga (d4+1) $55 · Horquilla $55. *Supuesto: interpreté "el cuchillo de 4 más 1 a secas" como el cuchillo de 1d4; si te referías a la Daga (d4 con +1 de daño fijo), hoy sale $55 y se puede bajar.*
4. **PdG +1 vale 1,3 (dueño, 2026-09-25):** "El bono a la probabilidad de golpe en armas más uno tiene que ser de un punto tres" (interpretado como **1,3**, no 3). `TASA_STAT['pdg']` pasó de 1,0 a **1,3** PC por punto. Ejemplo: Lezna de zapatero (1d4, PdG +1, 25 % Lisiado) = 4,3 PC ≈ $55 frente a $40 del cuchillo liso. *Queda abierto:* el dueño la ve "de buena calidad"; con esta tasa sigue en Común (alto). Si querés que **cualquier bono de PdG suba de tier**, se puede bajar el umbral de Buena Calidad o subir más la tasa.
5. **Verificación de duplicados (pedida por el dueño, 2026-09-25).** La primera pasada solo miró armas y dejó **5 armas** que seguían idénticas (algunas variaciones se fusionaban con un efecto que ya tenían) y **32 grupos de piezas de defensa (39 piezas)** sin revisar. Se corrigió todo: nuevas variaciones en `herramientas/variaciones_armas.py` y `herramientas/reajuste_defensa.py` (`VARIACIONES`, aparecen como "Cambios propuestos" en la auditoría). Se sumó `python herramientas/buscar_duplicados.py`, que compara armas, defensa (con sus estados y efectos) y consumibles: **hoy 0 grupos en armas y 0 en defensa**. En consumibles marca 2 grupos que son falsos positivos (sus efectos viven en el texto, no en campos: Antídoto, Vendas, Raciones… son distintos). *Correr el script después de cada tanda nueva.*
6. **PdG +1 sube a 3,5 PC (dueño, 2026-09-25):** "Más uno a la probabilidad de golpe es un buen efecto, no es secundario." El Estilete de práctica (1d4, +1 daño fijo, PdG +1) tiene que ser **Buena Calidad y costar ~$80–90**. `TASA_STAT['pdg']` pasó de 1,3 a **3,5** PC por punto (el 1,3 anterior era una lectura mía; el dueño lo quería más alto). Resultado: Estilete de práctica **Buena, $85**; Lezna de zapatero (PdG +1, 25 % Lisiado) sigue en Común alto (**$70**; si se la quiere Buena, subirle un poco más). **Efecto colateral:** 10 de las 17 armas actuales con PdG suben de tier en el cálculo (se ve en la auditoría, con sobreprecio ×1,5 por tier de exceso). Se le quitó el PdG a Estoque de esgrima, Lanza de lisiar y Hacha arrojadiza y se bajó a +1 el de Lanza del alba para que las armas nuevas mantengan su tier.
7. **Alcance (dueño, 2026-09-25):** (a) en los textos de las herramientas de auditoría y en el asistente de ítems ya no dice "Alcance/Rango": dice **Alcance** (y **Rango** solo en las armas de rango). (b) **El Alcance tiene que costar un poco más**: el primer punto pasó de 2 a **3 PC** (`ALCANCE_PRIMERO`) y cada punto siguiente sigue en 1. Un arma común de 1d4 con Alcance sigue siendo Común pero cuesta más que el mismo arma sin él (Horquilla $60 vs cuchillo $40; Lanza de caza/Tomahawk $80). Para mantener el tier de las armas nuevas: Hacha de abordaje pasa a peso 1 y Segur de verdugo a peso 2.

## Cierre de armas de rango y explosivos (2026-09-26)
Dueño: *«Cerremos primero [las armas de] rango con la info que tenemos. Explosivos también.»* → se cerraron con **las propuestas ya escritas** (P14 y «Explosivos») y las reglas ya decididas. **Decisiones que quedan fijas:**
- **Rango (P14):** el **Rango es la identidad de la familia**; vale **0,75 PC por punto** y se topea por tier (**Común +3/+4 · Buena +4/+5 · Raro +5/+6 · Excepcional +6/+7 · Legendario +8**; `RANGO_TOPE` en la calculadora, con aviso al reajustar). **Hacen menos daño que las cuerpo a cuerpo del mismo tier** (el Rango cuesta puntos: a igual tier, menos dado/peso, porque quedan menos expuestas). **Las de pólvora (pistolas, arcabuces, trabucos, rifles, cañones) van con las de rango.** **Los arcos son siempre de dos manos.** **Sin munición** y **sin mecánica de recarga/cooldown** por ahora. Efectos habilitados: Envenenar, Prende fuego, Rompe armadura (desde Raro), Derribar, Aturdir (Raro+), Sangrado, crítico potente en las legendarias.
- **Explosivos (Tipo 12): ⚠ corregido el mismo día, ver «Corrección: Tipo 12 = Explosión» abajo.** (Lo que decía acá —daño enorme sin área, mazas y espadones colosales— era un error del asistente y se anuló.)
**Tanda 5 — Rango (12 armas nuevas, todas caen en su tier):** Común: Honda de pastor, Arco de rama, Cerbatana (25 % Veneno) · Buena: Arco de cuerno, Ballesta de repetición, Arcabuz de mecha · Raro: Arco del cazador de víboras (50 % Veneno), Ballesta de asedio (50 % Rompe armadura), Trabuco del contrabandista (25 % Derribar) · Excepcional: Arco de fuego del centinela (33 % Prende fuego), Rifle de cerrojo del cazador (PdG +2) · Legendario: Arco del Último Halcón (Rango +8, PdG +2, Crítico potente +3, 50 % Sangrado).
**Tanda 6 — Explosivos: rehecha (ver Corrección abajo).** 5 armas con el efecto Explosión.
Se publicaron en el catálogo junto con el resto de lo nuevo (24 armas más: 892 ítems). *Nota:* con la calculadora nueva, **algunas armas de rango del catálogo actual cambian de tier** (Lanzallamas Raro → Legendario, Pistola de duelo Excepcional → Raro, Revólver del pistolero Legendario → Excepcional…): se ven en la auditoría para decidir.

## Corrección: Tipo 12 = efecto Explosión (dueño, 2026-09-26)
Dueño: *«Hay algo conceptual que no estás entendiendo en las armas de tipo 12. No son solamente que tiran un dado alto. El T12 está dedicado exclusivamente al efecto explosión. No puede haber un martillo T12 que simplemente pegue más. Por eso las armas vinculadas a la explosión deben ser muy raras y circunstanciales.»*
- **Regla:** **un arma es Tipo 12 si y solo si tiene el efecto Explosión.** No existen mazas, hachas ni espadones T12 que "solo peguen más". Son **muy raras y circunstanciales** (pocas en todo el catálogo, tiers altos).
- **Se anuló lo anterior:** «Explosión descartada» y las 7 armas de tanda 6 que solo pegaban más (Almádena de cantero, Pico de demolición, Mazo de demolición, Cañón de mano, Hacha de derribo, Espadón colosal del asedio, Maza del Fin del Mundo) **se sacaron del catálogo**.
- **Tanda 6 rehecha (5 armas, todas con Explosión):** Bombarda portátil (Excepcional, radio 1) · Lanzabombas (Excepcional, radio 1 + 25 % Derribar) · Lanzallamas de asalto (Legendario, radio 1 + 50 % Prende fuego) · Cañón de campaña de mano (Legendario, radio 2) · Cañón del Dragón (Legendario, radio 2 + 75 % Prende fuego, +2 fijo). Todas de rango y a dos manos. Se calibraron con la calculadora: la **Explosión pesa 6 PC** a radio 1 (cada radio extra +50 %, por `stacks`).
- **Calculadora:** «Explosión» ya no está descartada; `CASA['explosivo']`; al reajustar avisa si un arma T12 no trae Explosión. El generador de equipo de creeps ya no usa Tipo 12.
- **Los dos T12 que ya estaban en el catálogo** (Lanzallamas y Martillo del Titán) **quedan marcados para rediseñar** (no se tocaron: el Martillo del Titán es justo «un martillo que solo pega más»). Pendiente decidir qué hacer con ellos.
- **Definición exacta de la Explosión: a confirmar** (P-Explosión en `preguntas-abiertas.md`): radio, cuánto daño recibe el área, si el objetivo recibe el golpe completo, fuego amigo, probabilidad.
- **Decisión posterior (2026-09-26): el mundo T12 queda EN PAUSA.** Dueño: *«El Martillo del Titán lo vamos a quitar, el Lanzallamas lo vamos a dejar como Excepcional, y el mundo de armas de Tipo 12 por ahora lo vamos a dejar en pausa: no vamos a inventarlo hasta que esté más consolidado todo el resto.»* → **se quitó el Martillo del Titán** del catálogo; **el Lanzallamas quedó Excepcional ($700)**; **la tanda 6 (las 5 armas con Explosión) se retiró del catálogo y de `armas-nuevas.json`**. El único T12 que queda es el Lanzallamas. **No se diseñan armas T12 ni se define la Explosión hasta nuevo aviso.** La regla «T12 = Explosión» sigue vigente para cuando se retome (la calculadora ya tiene el efecto listo).

## Rework metódico por Tipo (arranca 2026-10-03)
Pedido del dueño: *«empecemos un plan metódico de rework del catálogo, por las armas; tipo a tipo, de menor a mayor tier, empezando por el Tipo 4. Antes, definiciones: qué efectos y mecánicas le son propias, cuáles ajenas, y cuáles pueden ir aunque no le sean exclusivas; por dónde podemos jugar con las mecánicas disponibles.»*

> **▶ Para retomar — hoja de ruta (cambiada por el dueño, 2026-10-03):** por cada Tipo, **los tres primeros tiers** (Común, Buena calidad,
> Raro); después el Tipo siguiente; **al terminar todos, se vuelve atrás** a hacer Excepcional y Legendario de cada uno. ✅ T4 Común, Buena y Raro.
> ✅ T4 Excepcional (cargado, a revisar). ✅ Tipo 6: Común (24), Buena y Rara. **▶ Ahora: Tipo 8** (hachas): definiciones, después Común.

**El paso a paso (decidido por el dueño, 2026-10-03 — «me gustó mucho cómo me permitió auditar y comparar»).** Se hace juntos, Tipo por Tipo y
tier por tier; el dueño dice cuál («ahora vamos a hacer espadas, de Buena calidad») y se sigue siempre este orden:
1. **Repasar las mecánicas del Tipo**: la lista lista para copiar (identidad · 🏠 propio · 🤝 puede ir · ✨ excepción · 🚫 ajeno · fuera del Tipo),
   marcando con 🔧 lo que todavía no funciona solo en un arma. Si el Tipo no tiene definiciones, se arman primero y el dueño las aprueba.
2. **Tabla comparativa de lo que hay hoy** en ese Tipo y tier (con `herramientas/calculadora_armas.py`): dados, fijo, bonos, al golpear, precio,
   PC y tier calculado, precio calculado, observación (copias, fuera de tier, huecos, precios desparejos).
3. **El dueño pide los cambios** (sacar, ajustar, sumar con tal mecánica…) y se arma **la lista nueva** completa en una tabla para revisar
   (con «Cambio» por fila y las dudas aparte). Se guarda acá como «propuesta» y se itera hasta el OK.
4. **Con el OK, reemplaza a todo ese Tipo y tier en el catálogo** (`comun/catalogo.js`): conservar los ids de las que siguen, ids `cat-<slug>` para
   las nuevas, sin nombres repetidos con otros tiers, Detalle con ⚙/✋, narrativa. Revisar quién usa las que salen (los humanos de
   `comun/creeps-base.js`: tabla `ITEMS`, sus `hu(…)` y la tabla `EQUIPO_CREEP` — retocar a mano, **no** regenerarla entera con
   `generar_equipo_creeps.py`, que cambia el equipo de todos los creeps). Si hace falta una mecánica nueva (🔧), se construye. Pruebas en verde,
   versiones, subir.

### Tipo 4 — Punzantes: definiciones (✅ aprobadas por el dueño, 2026-10-03: «están bien, pero podemos sumar las mecánicas que no existían cuando se hizo la primera tanda»)
**Identidad:** el arma **barata en Nitros** (el primer ataque cuesta 2, los siguientes 4): muchos golpes chicos y precisos. Daño bajo por golpe, que se compensa con **precisión y crítico potente** (el T4 aprovecha hasta 6 puntos de potente; de frecuente solo 2). Dagas, cuchillos, estiletes, punzones, agujas, estoques, lanzas.
- 🏠 **Propio:** **Lisiado** (efecto de casa) · **PdG** y **Alcance** (stats de casa; Alcance = lanzas) · **Crítico potente** (su universo) · **Ignora N de Res. crítico** (solo T4 y T6, desde Raro) · **PdG de oportunidad** (`pdgopor`, nuevo: dagas y lanzas castigan al que se aleja).
- 🤝 **Puede ir (no exclusivo):** **Envenenar** y **Veneno severo** (agujas, aguijones; Veneno severo desde Excepcional) · **Sangrado** (puñales aserrados) · **Drena vida** (desde Raro; colmillos, «sacrificio») · **Crítico frecuente** (máx. +2 útil) · **Iniciativa** (armas livianas; es de casa de los cortantes) · **daño fijo / Dmg** (valen doble en T4: ×2) · **Critical Matters** (algo extra solo si es crítico: encaja con el crítico potente).
- ✨ **Excepción puntual (Raro+, escasa):** **Parry** (la daga de mano izquierda / *main gauche*) · **Rengo** (un pinchazo en la pierna) · **Rompe armadura** (el *rompemalla*, que perfora cota) · **Prende fuego** (solo híbridas/mágicas).
- 🚫 **Ajeno (no va):** **Demora**, **Aturdir**, **Derribar** (son golpes contundentes) · **Bloqueo** (una daga no aguanta un golpe; quizás las lanzas pesadas a dos manos, a decidir) · **Explosión** (solo T12).

**Mecánicas nuevas desde el 2026-09-25 que abren juego en el T4:**
- **Los efectos al golpear ya se aplican solos** en el duelo (botón «Aplicar»): Lisiado, Veneno, Sangrado, etc. dejan de ser «a mano».
- **Ataque de oportunidad** (frena al que se aleja) + **PdG de oportunidad**: identidad de lanzas y dagas de guardia.
- **Por la espalda** ✅ construido (2026-10-03): un arma puede traer `espalda: {pdg, fijo, critpot}` (asistente de ítems, paso «Peso y daño»;
  también una habilidad con el arma, en el ✨) y el mapa lo suma solo **si quien ataca está en sigilo** y en el punto ciego del defensor (el
  casillero justo de atrás; las diagonales sí se ven). Regla del dueño: *si el defensor lo puede ver, aunque venga por la espalda, se da vuelta
  para defenderse* — por eso solo en sigilo. Junta lo que antes eran dos ideas (por la espalda / desde el sigilo).
- **Critical Matters**, **Drena vida con Excedente**, **Veneno ×N / Veneno severo**, **Pierde No2** (una punción que corta el aire), **Rengo**.
- **Arrojadizas** ✅ decidido (2026-10-03): dagas arrojadizas, dardos, hondas y cerbatanas van **aparte, con las de rango** (no cuentan en la
  cuota del T4).
- **Durabilidad de diseño** (`durPorPeso`): estiletes frágiles, puñales robustos.

### T4 Común — lo que hay hoy (tabla comparativa, 2026-10-03)
Calculadora v0: **PC** = puntos de calidad (Común < 7,5 ≤ Buena calidad). «Precio calc.» = lo que diría la calculadora como Común.

| # | Arma | Peso (dados) | Daño fijo | Bonos | Al golpear | Precio hoy | PC → tier calc. | Precio calc. | Observación |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Cuchillo de cazador | 1 | — | — | — | 30 | 2,3 · Común | 40 | la base más pelada |
| 2 | Cuchillo del grumete polizón | 1 | — | — | — | 30 | 2,3 · Común | 40 | **copia** de la 1 con otra historia |
| 3 | Daga | 1 | +1 | — | — | 40 | 4,3 · Común | 55 | «todos empiezan con una» |
| 4 | Punzón del ladronzuelo | 1 | +1 | — | — | 40 | 4,3 · Común | 55 | **copia** de la Daga |
| 5 | Pica Hielos | 2 | — | — | — | 40 | 4,6 · Común | 55 | la única de 2 dados sin nada más |
| 6 | Cuchillo de cocina reconvertido | 1 | — | PdG +1 | — | 65 | 5,8 · Común | 65 | — |
| 7 | Lezna de zapatero | 1 | — | PdG +1 | Lisiado 25 % | 70 | 6,5 · Común | 70 | la única con el efecto de casa |
| 8 | Daga de vigía | 1 | — | PdG de oportunidad +1 | — | 45 | 3,1 · Común | 45 | — |
| 9 | Estilete de centinela | 1 | — | PdG de oportunidad +2 | — | 50 | 3,9 · Común | 50 | casi igual a la 8 |
| 10 | ⚠️ Estoque de guardia | 1 | — | Iniciativa +1, PdG de oportunidad +2 | — | 55 | 4,5 · Común | 55 | marcada a auditar |
| 11 | Horquilla | 1 | — | Alcance +1 | — | 50 | 5,3 · Común | 60 | — |
| 12 | Lanza corta | 2 | — | Alcance +1 | — | 75 | **7,6 · Buena** | 120 | por poder ya es Buena calidad |
| 13 | Lanza de guardia de puerta | 2 | — | Alcance +1 | — | 75 | **7,6 · Buena** | 120 | **copia** de la Lanza corta |
| 14 | ⚠️ Estileto común | 1 | — | Crítico frecuente +1 | — | 50 | **7,5 · Buena** | 120 | por poder ya es Buena calidad |
| 15 | ⚠️ Estileto ritual del acólito | 1 | — | Crítico frecuente +1 | — | 50 | **7,5 · Buena** | 120 | **copia** del Estileto común |

**Fuera de la cuota del T4 (van con las de rango):** Cerbatana (Rango +3, Veneno 25 %, 60), Honda de cuero (Rango +3, 40), Honda de pastor
(+1 fijo, Rango +3, 70), Honda del cazador de jabalíes (copia de la Honda de cuero, 40).

**Lo que muestra la tabla:**
- **4 copias** (2, 4, 13, 15): mismo número, otra historia. Quedan **11 armas distintas** de las 15; la cuota es ~18 → faltan ~7.
- **3 son Buena calidad por poder** (las dos lanzas y el estileto): o bajan, o suben de tier.
- **Casi ninguna usa lo propio del T4**: Lisiado (solo la Lezna), Crítico potente (ninguna), y ninguna mecánica nueva (por la espalda,
  durabilidad de diseño, Critical Matters).
- **Precios desparejos**: la Daga de vigía (45) y el Cuchillo de cocina (65) tienen poder parecido.

### T4 Común — propuesta v1 (2026-10-03, ⬜ a revisar por el dueño)
Pedido del dueño: sacar las copias; a las lanzas, un dado menos; al estileto, Crítico potente en vez de frecuente; sumar armas con 25 % o 50 % de
aplicar estados del tipo, alguna resistente (+3 de durabilidad) y alguna con 25 % que, si el golpe es crítico, aplica seguro; precios a criterio.
Todas: una mano, Tipo 4. PC = calculadora v0 (Común < 7,5).

| # | Arma | Dados | Fijo | Bonos | Al golpear | Durab. | PC | Precio | Cambio |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Cuchillo de cazador | 1 | — | — | — | 3 | 2,3 | 30 | igual |
| 2 | Daga | 1 | +1 | — | — | 3 | 4,3 | 45 | 40 → 45 |
| 3 | Pica Hielos | 2 | — | — | — | 6 | 4,6 | 45 | 40 → 45 |
| 4 | Cuchillo de cocina reconvertido | 1 | — | PdG +1 | — | 3 | 5,8 | 60 | 65 → 60 |
| 5 | Lezna de zapatero | 1 | — | PdG +1 | Lisiado 25 % | 3 | 6,5 | 70 | igual |
| 6 | Daga de vigía | 1 | — | PdG de oportunidad +1 | — | 3 | 3,1 | 40 | 45 → 40 |
| 7 | Estilete de centinela | 1 | — | PdG de oportunidad +2 | — | 3 | 3,9 | 50 | igual |
| 8 | Estoque de guardia | 1 | — | Iniciativa +1, PdG de oportunidad +2 | — | 3 | 4,5 | 55 | igual (sale de ⚠️) |
| 9 | Horquilla | 1 | — | Alcance +1 | Lisiado 25 % | 3 | 6,1 | 70 | + Lisiado (si no, quedaba igual a la Lanza corta) |
| 10 | Lanza corta | 1 | — | Alcance +1 | — | 3 | 5,3 | 55 | 2 dados → 1; 75 → 55 |
| 11 | Estileto | 1 | — | Crítico potente +1 | — | 3 | 3,5 | 45 | frecuente → potente; 50 → 45 |
| 12 | 🆕 Clavo de herrador | 1 | — | — | Lisiado 50 % | 3 | 3,8 | 50 | nueva |
| 13 | 🆕 Puñal aserrado | 1 | — | — | Sangrado 25 % | 3 | 2,9 | 40 | nueva |
| 14 | 🆕 Aguja de zurcir untada | 1 | — | — | Veneno (2) 50 % | 3 | 3,6 | 50 | nueva |
| 15 | 🆕 Cuchillo de trinchera | 1 | +1 | — | — | **6** (resistente) | 4,3 | 60 | nueva |
| 16 | 🆕 Punzón de matarife | 1 | — | — | Lisiado 25 %, **seguro si es crítico** | 3 | ~3,5 | 50 | nueva 🔧 |
| 17 | 🆕 Aguja de la envenenadora | 1 | — | — | Veneno (2) 25 %, **seguro si es crítico** | 3 | ~3,3 | 45 | nueva 🔧 |
| 18 | 🆕 Lanza de pescador | 1 | — | Alcance +1, PdG de oportunidad +1 | — | 3 | 6,1 | 65 | nueva |

Salen (copias): Cuchillo del grumete polizón, Punzón del ladronzuelo, Lanza de guardia de puerta, Estileto ritual del acólito.
🔧 «Seguro si es crítico» en un efecto de arma no existe todavía (Critical Matters hoy es solo de habilidades): se construye si se aprueba.

**✅ Aplicado (2026-10-03, OK del dueño):** la propuesta v1 reemplazó a las 15 T4 Comunes cuerpo a cuerpo del catálogo (quedan 18). Cambios al cargarla:
«Puñal aserrado» se llama **Cuchillo dentado** (ya había un Puñal aserrado Raro). Los humanos que llevaban las copias ahora llevan el arma del catálogo
(Ladronzuelo y Trampero → Daga; Guardia de puerta y Vigía de patrulla → Lanza corta; Grumete → Cuchillo de cazador; Acólito → Estileto). Se construyó
**«seguro si es crítico»** para los efectos de arma (`seguroCritico` en `efectosGolpe`: casilla en el asistente de ítems; el duelo, si el golpe fue
crítico, lo deja entrar sin tirar). `buscar_duplicados.py` marca Daga ~ Cuchillo de trinchera: a propósito (la trinchera es la resistente).

### T4 Buena calidad — lo que hay hoy (tabla comparativa, 2026-10-03)
Calculadora v0: PC de Buena calidad = 7,5 a 11 (menos = Común; 11 o más = Raro). «Precio calc.» = como Buena calidad.

| # | Arma | Manos | Dados | Fijo | Bonos | Al golpear | Precio | PC → tier calc. | Precio calc. | Observación |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Daga de Capitán | 1 | 1 | — | PdG +1 | — | 90 | **5,8 · Común** | 65 | por poder es Común |
| 2 | Daga del sacrificio | 1 | 1 | — | PdG +1 | — | 90 | **5,8 · Común** | 65 | **copia** de la 1 (botín del Sacerdote oscuro) |
| 3 | Estoque | 1 | 2 | — | Iniciativa +1 | — | 60 | **5,2 · Común** | 60 | por poder es Común |
| 4 | Estilete de práctica | 1 | 1 | +1 | PdG +1 | — | 85 | 7,8 · Buena | 85 | — |
| 5 | Lanza de centinela | 2 | 2 | — | Alcance +1, PdG oport. +1 | — | 100 | 8,4 · Buena | 100 | — |
| 6 | Lanza del portón | 2 | 2 | — | Alcance +1, PdG oport. +2 | — | 120 | 9,2 · Buena | 120 | casi igual a la 5 |
| 7 | ⚠️ Daga de guardia | 1 | 1 | +1 | — | Ignora 1 de Res. crítico | 60 | 9,6 · Buena | 130 | Ignora N va desde Raro 🔧 en armas no se automatiza |
| 8 | ⚠️ Daga de la viuda verde | 1 | 1 | +1 | — | Ignora 1 de Res. crítico | 60 | 9,6 · Buena | 130 | **copia** de la 7 (botín del Envenenador) |
| 9 | Estilete de competencia | 1 | 2 | — | Crít. frecuente +1 | — | 75 | 9,8 · Buena | 130 | barata para lo que da |
| 10 | Aguja de la vigilia | 1 | 1 | — | PdG oport. +3, Crít. frecuente +1 | — | 140 | 10,0 · Buena | 140 | — |
| 11 | ⚠️ Daga de duelo | 1 | 2 | — | PdG +1, Crít. potente +2 | — | 150 | 10,5 · Buena | 150 | — |
| 12 | Aguja de acupunturista | 1 | 1 | +2 | PdG +1 | Sangrado 33 % | 150 | 10,6 · Buena | 150 | — |
| 13 | Pico de guerra | 1 | 2 | — | Alcance +1 | Rompe armadura 50 % | 90 | 10,6 · Buena | 150 | Rompe armadura es ✨ desde Raro; barata |
| 14 | Lanza de leva | 2 | 3 | — | Alcance +1 | Lisiado 25 % | 150 | 10,7 · Buena | 150 | — |

### T4 Buena calidad — propuesta v1 (2026-10-03, ⬜ a revisar por el dueño)
Pedido del dueño: una daga de 2d4 y nada más; una de 1d4 que envenena seguro; una de 1d4 con Lisiado mejor que la Común; corregir lo sugerido; más
efectos de los que quedaron afuera; mínimo 14, armar 18.

| # | Arma | Manos | Dados | Fijo | Bonos | Al golpear | Durab. | Precio | Cambio |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 🆕 Puñal de hoja ancha | 1 | 2 | — | — | — | 6 | 80 | nueva (pedida: 2d4 y listo) |
| 2 | Daga de la viuda verde | 1 | 1 | — | — | Veneno (2) siempre | 3 | 85 | rehecha (pedida: envenena seguro); deja de ser copia |
| 3 | 🆕 Daga de tendón | 1 | 1 | — | — | Lisiado 75 % | 3 | 80 | nueva (pedida; la mejor Común es 50 %) |
| 4 | Estilete de práctica | 1 | 1 | +1 | PdG +1 | — | 3 | 85 | igual |
| 5 | 🆕 Daga de guardaespaldas | 1 | 1 | +2 | PdG oport. +1 | — | **6** (resistente) | 85 | nueva |
| 6 | Daga del sacrificio | 1 | 2 | +1 | — | Sangrado 50 % | 6 | 90 | rehecha; deja de ser copia |
| 7 | Lanza de centinela | 2 | 2 | — | Alcance +1, PdG oport. +1 | — | 6 | 100 | igual |
| 8 | Estoque | 1 | 2 | — | Iniciativa +1, PdG +1 | — | 6 | 110 | + PdG +1 (era Común); 60 → 110 |
| 9 | 🆕 Puñal de sombra | 1 | 1 | — | PdG +1, Crít. potente +2 · 🗡 por la espalda: +2 PdG, +2 daño | — | 3 | 120 | nueva |
| 10 | Daga de Capitán | 1 | 1 | — | PdG +2 | — | 3 | 120 | PdG +1 → +2 (era Común); 90 → 120 |
| 11 | Lanza del portón | 2 | 2 | — | Alcance +1, PdG oport. +2 | — | **9** (resistente) | 125 | + resistente (era casi igual a la 7) |
| 12 | 🆕 Lanza de montería | 2 | 2 | — | Alcance +1 | Lisiado 33 %, seguro si es crítico | 6 | 115 | nueva |
| 13 | Estilete de competencia | 1 | 2 | — | Crít. frecuente +1 | — | 6 | 130 | 75 → 130 |
| 14 | Aguja de la vigilia | 1 | 1 | — | PdG oport. +3, Crít. frecuente +1 | — | 3 | 140 | igual |
| 15 | 🆕 Aguja del boticario | 1 | 1 | +1 | PdG +1 | Veneno (3) 50 %, seguro si es crítico | 3 | 140 | nueva |
| 16 | Daga de duelo | 1 | 2 | — | PdG +1, Crít. potente +2 | — | 6 | 150 | sale de ⚠️ |
| 17 | Aguja de acupunturista | 1 | 1 | +2 | PdG +1 | Sangrado 33 % | 3 | 150 | igual |
| 18 | Lanza de leva | 2 | 3 | — | Alcance +1 | Lisiado 25 % | 9 | 150 | igual |

Salen de Buena calidad: Daga de guardia (Ignora 1 de Res. crítico: se repiensa en Raro) y Pico de guerra (Rompe armadura: se repiensa en Raro).
Dudas: las tres pedidas (1–3) por la calculadora son Comunes (no valora lo simple ni el «seguro»); el Puñal de hoja ancha es igual a la Pica Hielos Común.

**Propuesta v2 (2026-10-03, cambios del dueño sobre la v1):**
- 1 Puñal de hoja ancha: + **Sangrado 50 % por 2 turnos** (efecto de arma con turnos: construido el mismo día) · 90.
- 2 Daga de la viuda verde: **Veneno 3 stacks siempre** (3 turnos) · 95.
- 3 Daga de tendón: + **1 de daño fijo** (1d4 +1, Lisiado 75 %) · 95.
- 17 Aguja de acupunturista: en vez de +2 fijo, **+1 dado de daño amplificado** (2d4, pesa 1) · 140.
- De paso (pregunta del dueño): el «PdG en oportunidad» del arma ya se sumaba solo en personajes y creeps; las **invocaciones** lo ignoraban y
  cobraban el ataque de oportunidad como uno normal — corregido (como los creeps: lo de un primer ataque, no cuenta como ataque del turno).
- **Regla (dueño, 2026-10-03), característica del Sangrado:** con un **golpe crítico de arma** queda **permanente** aunque diga turnos (ej. Puñal de hoja ancha, 2 turnos), venga del arma o de la habilidad con la que se atacó. Automatizado en el duelo.

### Cómo se ve un arma: tres textos (regla del dueño, 2026-10-03)
Como con las trampas: (1) **en la grilla**, lo esencial —Tipo, manos, dados, daño, bonos, efectos («Sangrado 50 % · 2 turnos»)—, dando por
sabidas las reglas: es el **Detalle** del ítem y lo arma `ItemCorto.armaEsencial(item)` con los datos del arma (un arma sin Detalle muestra eso
mismo); (2) **«Detalles técnicos»**, solo al abrir el ítem (Ver): explica cada mecánica que tiene (Tipo y costo en No2, Peso, Lisiado, Sangrado,
Veneno, PdG en oportunidad, frecuente vs. potente, «seguro si es crítico», durabilidad, por la espalda, qué se automatiza) — lo arma
`ItemCorto.armaTecnico(item)` de los datos, no se escribe a mano; (3) **la descripción narrativa** (`descripcionNarrativa`): decorativa, con color
y algo de humor. Aplicado a las 18 T4 Comunes (las copias de los humanos en `creeps-base.js` también).

**T4 Buena calidad, propuesta v3 — los tres textos** (Detalle = lo esencial; narrativa):
1. Puñal de hoja ancha — *Tipo 4 · 2 dados · Sangrado 50 % · 2 turnos* — «Tan ancho que sirve de espejo, de pala y, en caso de apuro, de bandeja. Ah, y corta.»
2. Daga de la viuda verde — *Tipo 4 · 1 dado · Veneno 3 stacks (siempre)* — «Tres maridos, tres funerales, una sola daga. La viuda insiste en que fueron accidentes.»
3. Daga de tendón — *Tipo 4 · 1 dado · +1 de daño · Lisiado 75 %* — «Diseñada por un anatomista con mucho tiempo libre y muy pocos amigos.»
4. Estilete de práctica — *Tipo 4 · 1 dado · +1 de daño · PdG +1* — «Afilado de más. El arma del que recién empieza, y por eso la usa con cuidado (y con miedo).»
5. Daga de guardaespaldas — *Tipo 4 · 1 dado · +2 de daño · PdG en oportunidad +1 · Resistente (durabilidad 6)* — «Gruesa, pesada y leal. Recibió más golpes que el patrón al que cuida, que es justamente la idea.»
6. Daga del sacrificio — *Tipo 4 · 2 dados · +1 de daño · Sangrado 50 %* — «Ceremonial, curva y siempre un poco pegajosa. Los cultistas dicen que es tradición; los vecinos, que es un asco.»
7. Lanza de centinela — *Tipo 4 · 2 manos · 2 dados · Alcance +1 · PdG en oportunidad +1* — «Con el asta llega al que intenta pasar de largo. El centinela no duerme: descansa los ojos.»
8. Estoque — *Tipo 4 · 2 dados · Iniciativa +1 · PdG +1* — «Todo punta, nada de filo. Llega antes que el resto y ya está esperando, con la mano en la cadera.»
9. Puñal de sombra — *Tipo 4 · 1 dado · PdG +1 · Crítico potente +2 · Por la espalda (en sigilo): +2 PdG, +2 de daño* — «Hoja ennegrecida para no brillar. Si lo viste venir, el que tenía que esconderse lo hizo mal.»
10. Daga de Capitán — *Tipo 4 · 1 dado · PdG +2* — «Empuñadura con el escudo de la compañía. Se entrega con el rango y se pierde con el primer motín.»
11. Lanza del portón — *Tipo 4 · 2 manos · 2 dados · Alcance +1 · PdG en oportunidad +2 · Resistente (durabilidad 9)* — «Nadie pasa sin recibir un pinchazo. Ni siquiera el cartero.»
12. Lanza de montería — *Tipo 4 · 2 manos · 2 dados · Alcance +1 · Lisiado 33 %, seguro si es crítico* — «Para jabalíes, ciervos y cualquier cosa que corra en cuatro patas. Las de dos patas también cuentan.»
13. Estilete de competencia — *Tipo 4 · 2 dados · Crítico frecuente +1* — «Fabricado para el duelo reglado. Fino hasta lo absurdo, y caro hasta lo ofensivo.»
14. Aguja de la vigilia — *Tipo 4 · 1 dado · PdG en oportunidad +3 · Crítico frecuente +1* — «Casi no se ve venir, y casi siempre acierta al que se descuida.»
15. Aguja del boticario — *Tipo 4 · 1 dado · +1 de daño · PdG +1 · Veneno 3 stacks 50 %, seguro si es crítico* — «El boticario receta reposo. Si no le hacés caso, receta esto.»
16. Daga de duelo — *Tipo 4 · 2 dados · PdG +1 · Crítico potente +2* — «Equilibrada para encontrar el hueco. Viene con un manual de etiqueta que nadie lee.»
17. Aguja de acupunturista — *Tipo 4 · 1 dado + 1 amplificado · PdG +1 · Sangrado 33 %* — «Fina como un pelo. Alivia contracturas y, mal usada, también la vida entera.»
18. Lanza de leva — *Tipo 4 · 2 manos · 3 dados · Alcance +1 · Lisiado 25 %* — «La lanza de todo recluta: pesada, larga y repartida sin preguntar si sabías usarla.»

**✅ Aplicado (2026-10-03, OK del dueño):** las 18 de Buena calidad (v3, con los tres textos) reemplazaron a las 14 T4 de Buena calidad del catálogo. La Daga de la viuda verde y la Daga del sacrificio dejaron de ser copias (son armas propias; las siguen llevando el Envenenador, el Saboteador y el Sacerdote oscuro). La **Daga de guardia** y el **Pico de guerra** pasaron a **Raro** (con ⚠️) para repensarlos en ese tier.

### T4 Raro — lo que hay hoy (tabla comparativa y análisis, 2026-10-03)
Calculadora v0: PC de Raro = 11 a 17 (menos = Buena; 17 o más = Excepcional). Precio de Raro: 150 a 350. Cuota ~12; hay 13 (11 + las 2 que subieron de Buena calidad).

| # | Arma | Manos | Dados | Fijo | Bonos | Al golpear | Precio | PC → tier calc. | Precio calc. | Observación |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | ⚠️ Daga de guardia | 1 | 1 | +1 | — | Ignora 1 de Res. crítico | 60 | 9,6 · Buena | 130 | 🔧 Ignora no anda en armas; regalada |
| 2 | Rompemalla | 1 | 2 | — | — | Rompe armadura 50 % | 75 | 7,6 · Buena | 80 | el ✨ «rompemalla» del T4; floja y barata |
| 3 | ⚠️ Pico de guerra | 1 | 2 | — | Alcance +1 | Rompe armadura 50 % | 90 | 10,6 · Buena | 150 | 2.º Rompe armadura |
| 4 | Puñal aserrado | 1 | 2 | — | — | Rompe armadura (siempre) | 100 | 10,6 · Buena | 150 | 3.er Rompe armadura; el nombre pide Sangrado |
| 5 | Aguijón de esgrima | 1 | 2 | — | PdG +1, Parry +2 | — | 110 | 10,6 · Buena | 150 | el ✨ Parry (main gauche); barato |
| 6 | Lanza militar | 1 | 2 | +2 | Alcance +1 | — | 110 | 11,6 · Raro | 170 | barata |
| 7 | Lanza del guardián del paso | 2 | 2 | — | Alcance +1, PdG oport. +3 | Lisiado 33 % | 150 | 11,0 · Raro | 150 | casi la Lanza del portón (Buena) + Lisiado |
| 8 | Pica de retaguardia | 2 | 3 | — | Alcance +2, PdG oport. +2 | — | 200 | 12,5 · Raro | 200 | — |
| 9 | ⚠️ Puñal envenenado | 1 | 2 | +1 | Crít. potente +3 | Veneno siempre | 250 | 12,7 · Raro | 210 | el Detalle dice 3 stacks y el dato no tiene stacks (entra con 4) |
| 10 | ⚠️ Puñal del sereno | 1 | 1 | — | PdG oport. +3, Crít. potente +3, Crít. frecuente +1 | Lisiado 33 % | 270 | 14,6 · Raro | 270 | — |
| 11 | ⚠️ Lanza de lisiar | 2 | 3 | — | Alcance +2, Crít. potente +3 | Lisiado 33 % | 300 | 15,5 · Raro | 300 | — |
| 12 | ⚠️ Estoque de esgrima | 1 | 2 | — | Alcance +1, Crít. potente +3, Crít. frecuente +1 | — | 350 | 16,5 · Raro | 350 | Alcance en un estoque, raro |
| 13 | Estoque de duelista | 1 | 1 | +2 | — | Ignora 2 de Res. crítico | 80 | **16,8 · Raro** | 350 | 🔧 Ignora no anda en armas; precio regalado («Ingora») |

**Lo que muestra:** cinco son de Buena calidad por poder (1–5); siete están muy baratas para lo que dan (Estoque de duelista a 80 con poder de
350); hay **tres Rompe armadura** (debería ser una excepción escasa); dos usan «Ignora Res. crítico», que **en un arma no hace nada solo**; ninguna
usa Sangrado, Drena vida, «seguro si es crítico», por la espalda ni durabilidad; ninguna tiene todavía los tres textos.

### T4 Raro — propuesta v1 (2026-10-03, ⬜ a revisar por el dueño)
Pedido del dueño: 18; versión mejorada de las de Buena calidad y variantes; mucho juego con el crítico (frecuente, potente, ignora, combinados);
1 drena vida (50 % del daño que **pasa** la armadura; el % se puede afinar); 1 sola Rompe armadura; 2–3 veneno; 2–3 lisiado; 1–2 sangrado; 3–4
Critical Matters (efecto solo si es crítico); 2–3 por la espalda; algunas con PdG y PdG en oportunidad; **sin Parry ni Bloqueo y sin resistentes**.

| # | Arma (de la Buena…) | Manos | Dados | Fijo | Bonos | Al golpear | PC | Precio |
|---|---|---|---|---|---|---|---|---|
| 1 | Puñal desgarrador (hoja ancha) | 1 | 2 | +1 | PdG +1 | Sangrado 75 % · 3 turnos | 12,0 | 180 |
| 2 | Daga de la viuda negra (viuda verde) | 1 | 1 | +1 | 🗡 espalda: +2 PdG, +2 daño | Veneno 5 stacks (siempre) | 11,8 | 180 |
| 3 | Daga del cirujano (tendón) | 1 | 1 | +1 | PdG +1, Crít. potente +1 | Lisiado 75 %, seguro si es crítico | 11,3 | 160 |
| 4 | Estilete de maestro (práctica) | 1 | 1 | +1 | PdG +2 | ⚡ si es crítico: Lisiado | 12,2 | 190 |
| 5 | Daga de escolta (guardaespaldas) | 1 | 1 | +2 | PdG +1, PdG oport. +2 | ⚡ si es crítico: Sangrado | 12,3 | 190 |
| 6 | Daga sedienta (sacrificio) | 1 | 2 | +1 | 🗡 espalda: +2 PdG, +1 daño | Drena vida 50 % (del daño que pasa) | 12,5 | 200 |
| 7 | Lanza del guardián del paso (centinela) | 2 | 2 | — | Alcance +1, PdG oport. +3 | Lisiado 33 % | 11,0 | 150 |
| 8 | Estoque de duelista (estoque) | 1 | 2 | — | Iniciativa +1, PdG +1, Ignora 1 | — | 14,0 | 250 |
| 9 | Puñal del sereno (sombra) | 1 | 1 | — | PdG +1, Crít. potente +3 · 🗡 espalda: +3 PdG, +3 daño | — | 11,2 | 160 |
| 10 | Daga del comodoro (capitán) | 1 | 1 | — | PdG +2, Crít. frecuente +1 | — | 14,6 | 270 |
| 11 | Pica de retaguardia (portón) | 2 | 3 | — | Alcance +2, PdG oport. +2 | — | 12,5 | 200 |
| 12 | Lanza del montero mayor (montería) | 2 | 2 | — | Alcance +1, PdG oport. +1, Crít. potente +1 | Lisiado 50 %, seguro si es crítico | 11,1 | 150 |
| 13 | Estoque de esgrima (competencia) | 1 | 2 | — | Crít. frecuente +1, Crít. potente +2 | ⚡ si es crítico: Veneno 3 stacks | 13,2 | 220 |
| 14 | Aguja de la vigilia eterna (vigilia) | 1 | 1 | — | PdG oport. +3, Crít. frecuente +1, Ignora 1 | — | 15,2 | 290 |
| 15 | Aguja del alquimista (boticario) | 1 | 1 | +1 | PdG +1 | Veneno 4 stacks 75 %, seguro si es crítico | 11,6 | 170 |
| 16 | Misericordia (duelo) | 1 | 2 | — | Crít. potente +3, Ignora 1 | ⚡ si es crítico: Sangrado | 14,1 | 250 |
| 17 | Puñal envenenado (acupunturista) | 1 | 2 | +1 | Crít. potente +3 | Veneno 3 stacks (siempre) | 14,0 | 250 |
| 18 | Rompemalla (leva) | 1 | 2 | +1 | Ignora 1 | Rompe armadura 50 % | 14,9 | 280 |

Conteo: veneno 3 (+1 con crítico) · lisiado 3 (+1) · sangrado 1 (+2) · Critical Matters 4 · drena 1 · rompe armadura 1 · por la espalda 3 ·
crítico potente 6 · frecuente 3 · ignora 4. Salen: Aguijón de esgrima (Parry), Daga de guardia, Pico de guerra y Puñal aserrado (Rompe armadura),
Lanza militar, Lanza de lisiar. 🔧 Hay que construir: **Critical Matters en armas** y **Drena vida en armas** (% del daño que pasa la Defensa).

### Precio libre (regla del dueño, 2026-10-03)
El precio **ya no depende de una banda por tier**: sale del valor del arma (daño —con los dados amplificados—, crítico, ignora, durabilidad, bonos,
efectos, por la espalda, Critical Matters) con una curva continua, y **sube por combinación**: cada cosa de más en el mismo slot suma un 10 % (las
sinergias valen en sí mismas). `calculadora_armas.py`: `precio_libre(arma)` (y `extras(arma)`). De paso se corrigió que la calculadora no contaba
los dados amplificados. El tier sigue siendo una decisión de diseño; la banda vieja (`precio(pc, tier)`) queda solo para las herramientas viejas.

Precios de la propuesta Raro v1 con la regla nueva: Puñal desgarrador 200 · Viuda negra 260 · Cirujano 200 · Estilete de maestro 200 · Escolta 220 ·
Sedienta 280 · Guardián del paso 180 · Estoque de duelista 290 · Sereno 300 · Comodoro 300 · Pica de retaguardia 210 · Montero mayor 220 · Estoque
de esgrima 260 · Vigilia eterna 350 · Alquimista 190 · Misericordia 300 · Puñal envenenado 270 · Rompemalla 300.

**✅ Aplicado (2026-10-03, dueño: «ajustar con este criterio y después lo reviso en cada caso»):** las 36 T4 Comunes y de Buena calidad tienen el precio libre.

**✅ Cargado (2026-10-03, dueño: «avancemos con las raras y cuando las tengas pasame la lista»):** las 18 Raras reemplazaron a las 13 T4 Raras del catálogo, con los tres textos y el precio libre. Construido para ellas: efectos «solo si es crítico» y «Drena vida» en armas. Salieron: Aguijón de esgrima, Daga de guardia, Pico de guerra, Puñal aserrado, Lanza militar, Lanza de lisiar. Queda la revisión del dueño.

### T4 Excepcional — diagnóstico y posibles diseños (2026-10-03)
Hoy hay **6** (cuota original ~9; las anteriores las llevamos a 18). Precio libre = lo que diría la calculadora con la regla nueva.

| # | Arma | Manos | Dados | Fijo | Bonos | Al golpear | Precio | PC → tier calc. | Precio libre | Observación |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Colmillo dientes de sable | 1 | 2 | +1 | — | Sangrado (siempre) | **900** | 9,1 · Buena | 110 | rinde como una de Buena calidad y cuesta 900 |
| 2 | Puñal de Dorne | 1 | 2 | +2 | — | Veneno 4 (siempre) | **850** | 11,1 · Raro | 160 | ídem; además el nombre es de una saga ajena |
| 3 | ⚠️ Báculo mágico | 1 | 2 | — | Esp +2, Rango de casteo +5, «bonos» +2 | — | 200 | 12,7 · Raro | 240 | es un foco mágico, no un arma punzante: no es del Tipo 4 |
| 4 | ⚠️ Pica del Muro Eterno | 2 | 3 | — | Alcance +2, PdG oport. +3, PdG +1 | Lisiado 50 % | 450 | 18,3 · Excepcional | 650 | bien ubicada |
| 5 | ⚠️ Aguijón de la Reina Avispa | 1 | 2 | +2 | Crít. potente +4, Crít. frecuente +1 | Veneno severo (siempre) | 700 | 22,4 · Excepcional | 1100 | bien ubicada; el Detalle dice «4 turnos» y el Veneno severo no vence solo |
| 6 | Lanza del alba | 2 | 4 | — | Alcance +2, PdG +1, Crít. potente +2, Crít. frecuente +1 | Lisiado 50 % | 900 | 25,8 · casi Legendaria | 2200 | al borde de Legendaria |

**Diagnóstico:** dos son Excepcionales de nombre pero rinden como Buena/Rara y cuestan 850–900 (Colmillo, Puñal de Dorne); el Báculo no
pertenece al Tipo 4 (es un foco de mago: va a otra categoría o al Tipo 10); la Lanza del alba roza Legendaria; ninguna usa lo nuevo
(crítico «si es crítico», drena, por la espalda, ignora, «seguro si es crítico», turnos); ninguna tiene los tres textos; cuatro con ⚠️.

**Lo que abre el Excepcional (definiciones del T4):** Veneno severo (desde acá) · Ignora 2 · Crítico frecuente +2 (el máximo útil del T4) ·
Crítico potente +4/+5 · combinaciones de los tres ejes del crítico · Drena 75–100 % · Critical Matters fuertes («si es crítico: Veneno severo»,
o dos efectos) · por la espalda grande · PdG +3. Excepciones ✨ todavía sin construir en armas: Rengo, Prende fuego (híbridas).

**Mecánicas de firma posibles (🔧 a construir, una por arma):** «+1 d20 en el crítico» (más chance de ×3/×4 y de supercrítico); «no se puede
parrear» (ya existe para habilidades: `sinParry`); «el ataque de oportunidad no cuesta No2»; «el primer ataque del turno cuesta 1 No2 menos»
(los Nitros valen mucho); «con crítico, el Veneno pasa a severo»; «con crítico, drena el 100 %»; «Sangrado que entra con 2 stacks».

### T4 Excepcional — propuesta v1 (2026-10-03, ⬜ a revisar por el dueño)
Decisiones del dueño: 18; las que existen sirven de referencia conceptual y se reajustan a la progresión; **mecánicas de firma**; fuego afuera,
alguna con **daño mágico** (rayo, hielo); **Rengo** en alguna; **Veneno severo nunca seguro** (solo con % o «si es crítico»: el seguro queda para
Legendaria); el Báculo mágico sale del Tipo 4.

| # | Arma (de la Rara…) | Manos | Dados | Fijo | Bonos | Al golpear | Firma 🔧 | Precio |
|---|---|---|---|---|---|---|---|---|
| 1 | Colmillo dientes de sable (desgarrador) | 1 | 2 | +2 | PdG +1, Crít. potente +3 | Sangrado **3 stacks** 75 %, **permanente** (hasta que lo curen; decidido por el dueño) | Sangrado que entra con más stacks | 500 |
| 2 | Beso de la viuda (viuda negra) | 1 | 1 | +2 | 🗡 espalda: +3 PdG, +3 daño | Veneno 5 stacks (siempre) · ⚡ si es crítico: Veneno severo | — | 600 |
| 3 | Bisturí del anatomista (cirujano) | 1 | 1 | +2 | PdG +2, Crít. potente +2 | Lisiado 75 %, seguro si es crítico · **Rengo 50 %** | Rengo en armas | 850 |
| 4 | Estilete del gran maestro (maestro) | 1 | 1 | +1 | PdG +3, Crít. frecuente +1 | ⚡ si es crítico: Lisiado | **No se puede parrear** | 1300 |
| 5 | Daga del guardia real (escolta) | 1 | 1 | +2 | PdG +2, PdG oport. +3 | — | **Ataque de oportunidad sin No2** | 550 |
| 6 | Colmillo del conde (sedienta) | 1 | 2 | +1 | PdG +1 · 🗡 espalda: +2 PdG, +2 daño | Drena vida 50 % · ⚡ si es crítico: drena 100 % | — | 800 |
| 7 | Pica del Muro Eterno (guardián del paso) | 2 | 3 | — | Alcance +2, PdG oport. +3, PdG +1 | Lisiado 50 % | **Ataque de oportunidad sin No2** | 950 |
| 8 | Estoque del campeón (duelista) | 1 | 2 | — | Iniciativa +2, PdG +2, Ignora 2 | — | **No se puede parrear** | 1900 |
| 9 | Puñal de la noche sin luna (sereno) | 1 | 1 | — | PdG +2, Crít. potente +4 · 🗡 espalda: +4 PdG, +4 daño, +2 Crít. potente | — | — | 950 |
| 10 | Daga del almirante (comodoro) | 1 | 1 | — | PdG +2, Crít. frecuente +2 | — | **Primer ataque del turno: −1 No2** | 1200 |
| 11 | Lanza del alba (montero / referencia) | 2 | 3 | — | Alcance +2, PdG +1, Crít. potente +2 | Lisiado 50 % | **+1d4 de daño de rayo** (ignora la Defensa) | 1200 |
| 12 | Lanza del cazador de dragones (montero mayor) | 2 | 2 | — | Alcance +1, PdG +1, PdG oport. +2, Crít. potente +3 | **Rengo 50 %**, seguro si es crítico | Rengo en armas | 700 |
| 13 | Florete del maestro de armas (esgrima) | 1 | 2 | — | Crít. frecuente +2, Crít. potente +3 | ⚡ si es crítico: Sangrado y Lisiado | **+1 d20 en el crítico** | 1400 |
| 14 | Aguja de los mil años (vigilia eterna) | 1 | 1 | — | PdG oport. +4, Crít. frecuente +1, Ignora 2 | — | **Primer ataque del turno: −1 No2** | 1600 |
| 15 | Aguijón de la Reina Avispa (alquimista / referencia) | 1 | 2 | +2 | Crít. potente +4, Crít. frecuente +1 | **Veneno severo 50 %** | — | 850 |
| 16 | Misericordia del verdugo (misericordia) | 1 | 2 | — | Crít. potente +4, Ignora 2 | ⚡ si es crítico: Sangrado 3 stacks | **+1 d20 en el crítico** | 1400 |
| 17 | Aguja de escarcha (puñal envenenado) | 1 | 2 | +1 | PdG +1, Crít. potente +3 | ⚡ si es crítico: Rengo | **+1d4 de daño de hielo** (ignora la Defensa) | 650 |
| 18 | Perforacotas (rompemalla) | 1 | 2 | +2 | PdG +1, Ignora 1 | Rompe armadura 75 % (la única) | — | 1000 |

Salen: Báculo mágico (no es del Tipo 4), Puñal de Dorne (lo reemplaza el Beso de la viuda). Siguen como referencia: Colmillo dientes de sable,
Pica del Muro Eterno, Aguijón de la Reina Avispa, Lanza del alba (las cuatro reajustadas).
**A construir (firmas):** +1 d20 en el crítico · no se puede parrear · ataque de oportunidad sin No2 · primer ataque −1 No2 · daño mágico extra
(rayo / hielo, ignora la Defensa y resta la Armadura mágica; **queda afuera del multiplicador del crítico** — regla del dueño, 2026-10-03) · Rengo en armas · Sangrado con stacks.

## Tipo 6 — Cortantes (arranca 2026-10-03)
Estado hoy: Común 18 · Buena 13 · Raro 9 (cuerpo a cuerpo) · Excepcional 6 · Legendario 4; de rango (aparte): Común 3 · Buena 7 · Raro 1 · Exc. 2.

### Tipo 6 — definiciones (✅ ajustadas por el dueño, 2026-10-03 — mandan sobre la propuesta de abajo)
- **El piso del tipo:** la espada común base, **no menos que esto**: 1d6 con **25 % de Sangrado de 3 turnos** (con crítico, permanente).
- **De casa y frecuentes:** bonos al **Parry**, a la **Iniciativa** y **PdG en contraataque**.
- **Crítico frecuente +4:** ~~una sola en Rara~~ **no va en Rara** (corregido por el dueño, 2026-10-03); un par en Excepcional (es muy fuerte). **Ignora resistencia a crítico:** igual de escaso.
- **Para diversificar en todos los tiers:** PdG, daño fijo y daño amplificado.
- **Alcance +1:** solo espadones a dos manos; muy puntual en Buena calidad, un poco más en Rara, pero poco.
- **Rengo** pasa a 🤝 puede ir: desde Buena calidad con 25 %, más frecuente y con porcentajes más altos desde Rara.
- **Por la espalda:** desde Rara.
- **Bloqueo:** algún ítem de Buena calidad; combinado con Parry, desde Rara.
- **Daño mágico:** siempre Excepcional o más.
- **Rompe armadura:** muy ocasional y con porcentaje bajo desde Buena calidad; en Rara, pocos y bajo o medio; desde Excepcional, se puede jugar.
- **Veneno:** desde Común con porcentaje muy bajo, mejorando en Buena y más arriba. **Veneno severo:** Excepcional y Legendaria, con
  porcentajes bajos y más altos.
- **Legendaria** habilita prácticamente cualquier mecánica, pero siempre con conceptos acordes al tipo (narrativa).

#### (propuesta original del asistente)
**Identidad:** espadas, sables, cimitarras, katanas. **Costo medio en Nitros** (primer ataque 3, los siguientes 6). La familia del **filo**: el
**Sangrado** es su efecto de casa; juegan con el **Crítico frecuente** (acento del T6: rango 6, rinde hasta +4) más que con el potente, y con la
**defensa activa**: Parry, Iniciativa y el **PdG en contraataque** (stats de casa, sin recargo). Duelistas y espadachines.
- 🏠 **Propio:** **Sangrado** · **Parry** · **Iniciativa** · **PdG en contraataque** (`pdgcontra`) · **Crítico frecuente** (hasta +4 útil) ·
  **Ignora N de Res. crítico** (solo T4 y T6, desde Raro).
- 🤝 **Puede ir:** Lisiado (un tajo en el brazo) · Envenenar (hojas untadas) · Drena vida (desde Raro: espadas «vampíricas») · Crítico potente
  (sin acento) · PdG · Dmg / daño fijo · Alcance (espadones a dos manos, alabardas) · Critical Matters · «seguro si es crítico» · Sangrado con turnos.
- ✨ **Excepción (Raro+, escasa):** Rengo (un tajo a la pierna) · Bloqueo (espadones pesados) · por la espalda (dagas largas, sables cortos de
  asesino) · daño mágico (hojas encantadas, Excepcional+).
- 🚫 **Ajeno:** Rompe armadura (hachas), Demora / Aturdir / Derribar (contundentes), Explosión (T12). Veneno severo seguro: solo Legendaria.
- **Fuera del Tipo:** los arcos y ballestas de Tipo 6 van con las armas de rango.

### T6 Común — lo que hay hoy (tabla comparativa, 2026-10-03)
«Libre» = el precio con la regla nueva. Piso del tipo (dueño): **1d6 con 25 % de Sangrado de 3 turnos**.

| # | Arma | Manos | Dados | Fijo | Bonos | Al golpear | Precio | Libre | Observación |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Espada corta | 1 | 1 | — | — | — | 30 | 45 | por debajo del piso (sin Sangrado) |
| 2 | Sable común | 1 | 1 | — | Iniciativa +1 | — | 40 | 50 | sin Sangrado |
| 3 | Sable de abordaje | 1 | 1 | — | Iniciativa +1 | — | 40 | 50 | **copia** del Sable común (botín) |
| 4 | Sable mellado del camino real | 1 | 1 | — | Iniciativa +1 | — | 40 | 50 | **copia** del Sable común (botín) |
| 5 | Cimitarra | 1 | 1 | — | Parry +1 | — | 69 | 55 | sin Sangrado |
| 6 | Espada ancha | 1 | 1 | +1 | — | — | 70 | 55 | sin Sangrado |
| 7 | Espada de taberna | 1 | 1 | +1 | — | — | 70 | 55 | **copia** de la Espada ancha (botín) |
| 8 | Machete de chacarero | 1 | 1 | +1 | Iniciativa +1 | — | 60 | 60 | sin Sangrado |
| 9 | Espada corta de instrucción | 1 | 2 | — | — | — | 50 | 75 | sin Sangrado |
| 10 | Espada de recluta de la guardia | 1 | 2 | — | — | — | 50 | 75 | **copia** de la de instrucción (botín) |
| 11 | Espada de entrenamiento | 1 | 1 | — | — | Lisiado 25 % | 55 | 55 | Lisiado ok; sin Sangrado |
| 12 | Sable de abordaje oxidado | 1 | 1 | — | — | Sangrado 25 % | 50 | 50 | **es el piso** |
| 13 | Hoz | 1 | 1 | — | — | Sangrado 50 % | 75 | 55 | — |
| 14 | Hoz ceremonial | 1 | 1 | — | — | Sangrado 50 % | 75 | 55 | **copia** de la Hoz (botín) |
| 15 | Espada corta oxidada | 1 | 1 | — | — | Veneno 50 % | 70 | 55 | veneno demasiado alto para Común; sin Sangrado |
| 16 | Espada de alquiler oxidada | 1 | 1 | — | — | Veneno 50 % | 70 | 55 | **copia** de la anterior (botín) |
| 17 | Machete | 1 | 1 | — | — | Rompe armadura 50 % | 60 | 75 | Rompe armadura no va en Común |
| 18 | Bastón ferrado | 2 | 1 | +1 | Parry +1 | — | 50 | 65 | un bastón no es cortante: es del Tipo 10 |

**Lo que muestra:** 6 copias (quedan 12 distintas); **15 de 18 están por debajo del piso** (no sangran); el Machete trae Rompe armadura
(no va en Común); la Espada corta oxidada envenena 50 % (en Común, porcentaje muy bajo); el Bastón ferrado no es del Tipo 6; nadie usa el
PdG en contraataque (de casa) ni el daño amplificado; precios desparejos.

**✅ T4 Excepcional cargado (2026-10-03, dueño: «subilas, después las reviso»):** las 18 de la propuesta v1 (con el Colmillo sangrando permanente) reemplazaron a las 6 Excepcionales del Tipo 4, con los tres textos y el precio libre. Construidas las mecánicas de firma (no se puede parrear, oportunidad sin No2, primer ataque −1 No2, +1 d20 en el crítico, Rengo, Sangrado con stacks, daño mágico de rayo / hielo sin multiplicar con el crítico). Salieron el Báculo mágico y el Puñal de Dorne. Queda la revisión del dueño.

**Criterios del dueño para las Comunes del T6 (2026-10-03):** el daño amplificado en una común ya es «tirando a bueno» (una sola, la mejor);
la Iniciativa es un efecto bajo-mediano (+1, +2 y hasta +3 en las mejores comunes); Parry en tier bajo sí, pero **no combinado con más
Peso** (eso, desde Buena calidad: el Peso ya da Bloqueo); los bonos al **contraataque** son bienvenidos y pesan poco (es circunstancial,
no depende del jugador).

**✅ T6 Común cargado (2026-10-03):** 18 armas, todas con el piso (1d6 y 25 % de Sangrado 3 turnos; con crítico, permanente). Salieron las 6
copias (los humanos que las llevaban usan el arma del catálogo: Sable común, Espada ancha, Espada corta de instrucción, Hoz, Espada corta oxidada)
y el Bastón ferrado (no es del Tipo 6). El Machete cambió Rompe armadura por +1 dado amplificado. Nuevas: Sable de húsar, Sable de duelo
callejero, Espada de la milicia, Espada del aprendiz de esgrima, Alfanje, Cuchilla de matarife, Navaja de barbero. Queda la revisión del dueño.

### Nombres (criterio del dueño, 2026-10-03)
Los nombres de las armas, **en términos rioplatenses y criollos**, frecuentes para quienes juegan: gaucho, comisario, policía, cuatrero, milico,
colimba, facón, rural, barrio. También **fantasía absurda, anacrónica y atemporal**, y cosas modernas o contemporáneas. **Nada de tecnicismos
militares europeos** (húsar, alfanje, cimitarra…) que el grupo no conoce. La narrativa acompaña el nombre. Primera tanda con este criterio: T6
Común (Facón de paisano, Sable de milico, Sable de granadero, Navaja del compadrito, Caronero, Sable del club de barrio, Sable herrumbrado del
cuartel, Espada del comisario, Espada de la feria de Mataderos, Cuchilla del frigorífico, Machete de chacarero, Machete chaqueño, Espada de la
colimba, Sable del cuatrero, Hoz del quintero, Sable de utilería, Facón del baldío, Navaja del peluquero de la esquina). **Respuesta del dueño (2026-10-03): «mucho no me
convenció»: a lo sumo mitad y mitad (estilo anterior y criollo), porque todo criollo queda forzado; sí evitar palabras poco usadas en Argentina
(húsar, matarife). Nombres en pausa: el dueño les busca la vuelta. No se renombran las tandas del Tipo 4.**

### T6 Buena calidad — lo que hay hoy (tabla comparativa, 2026-10-03)
| # | Arma | Dados | Fijo | Bonos | Al golpear | Precio | PC → tier | Libre | Observación |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Cimitarra de guardia | 1 | — | Parry +2 | — | 75 | 5,3 · Común | 60 | rinde como común; sin Sangrado |
| 2 | Cimitarra del contramaestre | 1 | — | Parry +2 | — | 75 | 5,3 · Común | 60 | **copia** de la 1 (botín) |
| 3 | Sable de caballería | 1 | — | PdG +1, Parry +1 | — | 75 | 8,7 · Buena | 120 | sin Sangrado |
| 4 | Sable de mando del capitán | 1 | — | PdG +1, Parry +1 | — | 75 | 8,7 · Buena | 120 | **copia** de la 3 (botín) |
| 5 | Espada larga de infantería | 2 | — | Parry +1, contraataque +1 | — | 100 | 8,4 · Buena | 110 | sin Sangrado |
| 6 | ⚠️ Falchion | 2 | — | — | Ignora 1 de Res. crítico | 75 | 9,6 · Buena | 120 | Ignora va desde Rara; nombre poco usado |
| 7 | Cimitarra del desierto | 2 | +1 | Iniciativa +1, contraataque +1 | Sangrado 33 % | 130 | 9,9 · Buena | 150 | la única que sangra |
| 8 | Espada de la guardia | 2 | — | Parry +1, Crít. frecuente +1 | — | 150 | 10,6 · Buena | 160 | sin Sangrado |
| 9 | Sable militar | 2 | — | PdG +1 | — | 80 | 11,0 · borde Rara | 150 | sin Sangrado |
| 10 | Sable del sargento | 2 | — | PdG +1 | — | 80 | 11,0 · borde Rara | 150 | **copia** de la 9 (botín) |
| 11 | Espada larga | 1 | — | PdG +2 | — | 90 | 12,1 · Rara | 180 | rinde como Rara; sin Sangrado |
| 12 | Espada del Jefe de los Mil Caminos | 1 | — | PdG +2 | — | 90 | 12,1 · Rara | 180 | **copia** de la 11 (botín) |
| 13 | Espada del veterano de mil batallas | 1 | — | PdG +2 | — | 90 | 12,1 · Rara | 180 | **copia** de la 11 (botín) |

**Lo que muestra:** 5 copias (quedan 8 distintas); 12 de 13 no sangran (ni siquiera el piso de la Común); la Cimitarra de guardia rinde como
común; la Espada larga y el Sable militar, como Raras; el Falchion usa «Ignora» (desde Rara) y un nombre poco usado; nadie usa Rengo, Bloqueo,
Veneno, Rompe armadura bajo, daño amplificado ni efectos «si es crítico».

### T6 Común — propuesta v2: 24 armas (2026-10-03, ⬜ a revisar por el dueño)
Pedidos del dueño: Sangrado de arma estándar **2 de daño por 2 turnos** (✅ construido: reaplicar suma 1 stack y reinicia los turnos; con
crítico, permanente); Sangrado 25 % en la **mitad**, y la otra mitad con efectos que lo igualen o superen (nada más débil); **más juego con el
crítico** (una común puede tener Crít. frecuente +1 **o** Crít. potente +2, no los dos); si hace falta, 24 en vez de 18.

| Arma | Lo que hace |
|---|---|
| **Con Sangrado 25 %** | |
| Facón de paisano | Sangrado 25 % · 50 |
| Sable de granadero | Iniciativa +2 · Sangrado 25 % · 65 |
| Navaja del compadrito | Iniciativa +3 · Sangrado 25 % · 70 |
| Sable del club de barrio | Parry +1 · contraataque +1 · Sangrado 25 % · 80 |
| Sable herrumbrado del cuartel | contraataque +2 · Sangrado 25 % · 70 |
| Cuchilla del frigorífico | +2 de daño · Sangrado 25 % · 75 |
| Machete de chacarero | +1 de daño · Iniciativa +1 · Sangrado 25 % · 70 |
| Espada de la colimba | 2 dados · Sangrado 25 % · 85 |
| Sable del cuatrero | 2 dados · contraataque +1 · Sangrado 25 % · 100 |
| Hoz del quintero | Sangrado 50 % · 55 |
| Navaja del peluquero de la esquina | PdG +1 · Sangrado 25 % · 110 |
| 🆕 Sable de desfile | Iniciativa +1 · Parry +1 · Sangrado 25 % · 75 |
| **Sin Sangrado** | |
| Sable de milico | Iniciativa +1 · contraataque +1 · 60 |
| Caronero | Parry +1 · Iniciativa +1 · 65 |
| Espada del comisario | contraataque +3 · 65 |
| Espada de la feria de Mataderos | +1 de daño · contraataque +1 · 65 |
| Machete chaqueño | +1 dado amplificado · 80 |
| Sable de utilería | Lisiado 25 % · 55 |
| Facón del baldío | Veneno 2 stacks 20 % · 50 |
| 🆕 Sable del tahúr | Crít. frecuente +1 · 75 |
| 🆕 Espada del afilador | Crít. potente +2 · 65 |
| 🆕 Facón del matrero | Crít. frecuente +1 · contraataque +1 · 90 |
| 🆕 Sable fino | Crít. potente +2 · Iniciativa +1 · 80 |
| 🆕 Espada del duelista novato | Crít. frecuente +1 · Parry +1 · 95 |

**✅ T6 Común v2 cargado (2026-10-03, OK del dueño):** 24 armas (12 con Sangrado 25 %, 12 con efectos que lo igualan o superan; 5 con crítico).

### T4 Común — 6 más, para llegar a 24 (propuesta, 2026-10-03, ⬜ a revisar)
| Arma | Lo que hace · precio |
|---|---|
| Punzón de hielo | Crít. potente +2 · 55 |
| Cortaplumas | Iniciativa +2 · 45 |
| Tenedor de asado | Crít. potente +1 · Sangrado 25 % · 55 |
| Aguja de tejer | Lisiado 25 % · PdG en oportunidad +1 · 55 |
| Tacuara | Alcance +1 · Crít. potente +1 · 85 |
| Cuchillo de la pensión | +1 dado amplificado · 60 |

**✅ T4 Común: 6 más cargadas (2026-10-03, OK del dueño; la Tacuara pasó a llamarse **Chuza**, la lanza criolla de cuchillo atado a un palo): quedan 24.**

### T6 Buena calidad — propuesta v1: 18 armas (2026-10-03, ⬜ a revisar por el dueño)
Las 5 copias pasan a ser armas propias (las siguen llevando los mismos creeps); 9 con Sangrado (mejor que el piso) y 9 sin, con efectos que lo
igualan o superan. Habilitado en Buena: Parry con 2 dados, Bloqueo (uno), Rengo 25 %, Rompe armadura bajo, Veneno más alto, Alcance +1 a dos
manos (uno), Crítico frecuente +2 (uno).

| Arma | Lo que hace · precio |
|---|---|
| **Con Sangrado** | |
| Cimitarra del desierto | 2 dados · +1 de daño · Iniciativa +1 · contraataque +1 · Sangrado 33 % · 150 |
| 🆕 Facón de plata | +2 de daño · Iniciativa +2 · Sangrado 50 % · 100 |
| 🆕 Hoz de cosecha | +1 de daño · Iniciativa +2 · contraataque +1 · Sangrado 75 % · 110 |
| Espada del veterano de mil batallas (era copia) | 2 dados · contraataque +1 · Sangrado de 3 stacks 25 % · 110 |
| Sable de mando del capitán (era copia) | PdG +1 · Parry +1 · Sangrado 25 % · 140 |
| 🆕 Machete del monte | +1 dado amplificado · Sangrado 33 % · 90 |
| Sable del sargento (era copia) | 2 dados · contraataque +2 · Sangrado 25 % · 120 |
| Espada del Jefe de los Mil Caminos (era copia) | Crít. potente +3 · Sangrado 33 % · 100 |
| Cimitarra del contramaestre (era copia) | +1 de daño · contraataque +2 · Veneno 3 stacks 33 % · Sangrado 25 % · 110 |
| **Sin Sangrado** | |
| Cimitarra de guardia | 2 dados · Parry +2 · 110 |
| Sable de caballería | PdG +1 · Parry +1 · 120 |
| Espada larga de infantería | 2 dados · Parry +1 · contraataque +1 · 110 |
| Espada de la guardia | 2 dados · Parry +1 · Crít. frecuente +1 · 160 |
| Espada del herrero (era Falchion) | 2 dados · +1 de daño · Bloqueo +1 · Rompe armadura 20 % · 150 |
| Sable militar | 2 dados · Iniciativa +1 · Rengo 25 % · 110 |
| Espada larga | PdG +1 · Crít. potente +2 · 150 |
| 🆕 Espada del timbero | Crít. frecuente +2 · 120 |
| 🆕 Espadón del capataz | 2 manos · 2 dados · Alcance +1 · 140 |

**✅ T6 Buena calidad cargado (2026-10-03, OK del dueño):** las 18 de la propuesta v1, con los tres textos y el precio libre; las 5 copias quedaron como armas propias (mismos creeps).

### T6 Raro — lo que hay hoy (2026-10-03)
| Arma | Lo que hace · precio hoy → libre · rinde como |
|---|---|
| Espada bastarda | 2 dados · +1 · Parry +1 · Bloqueo +1 · 120 → 150 · Buena |
| Espada bastarda del Espectro | **copia** de la anterior (botín) |
| Mandoble | 2 dados · Parry +2 · Bloqueo +1 · 110 → 140 · Buena (es «a una mano», y el nombre es poco usado) |
| Cuchilla de carnicero | 2 dados · Rompe armadura **siempre** · 110 → 200 · Rara (en Rara va bajo o medio) |
| Espada vampírica menor | 2 dados · Parry +1 · contraataque +2 · Drena vida · 260 → 300 · Rara |
| Katana | 2 dados · PdG +2 · Crít. frecuente +1 · **120** → 550 · **Excepcional** |
| Katana del cazarrecompensas | **copia** de la Katana (botín) |
| ⚠️ Katana de maestro | 2 dados · Parry +2 · Iniciativa +1 · Crít. frecuente +1 · contraataque +3 · Sangrado 50 % · 300 → 450 · Rara |
| Sable del capitán pirata | 2 dados · +2 · Parry +1 · Crít. frecuente +1 · contraataque +2 · Sangrado siempre · 350 → 500 · casi Excepcional |

**Lo que muestra:** solo 9 (7 distintas, 2 copias); dos rinden como Buena (Espada bastarda, Mandoble); la Katana rinde como Excepcional y cuesta
120; la Cuchilla de carnicero trae Rompe armadura siempre; nadie usa lo que abre Rara: Crít. frecuente +4 (una), Ignora, por la espalda, Rengo
más alto, Parry + Bloqueo combinados (sí hay dos), Critical Matters, «seguro si es crítico», Veneno.

### T6 Raro — propuesta v1: 18 armas (2026-10-03, ⬜ a revisar por el dueño)
| Arma | Lo que hace · precio |
|---|---|
| **Con Sangrado** | |
| Espada bastarda | 2 dados · +1 · Parry +1 · Bloqueo +1 · Sangrado 3 stacks 33 % · 190 |
| Katana de maestro | 2 dados · Parry +2 · Iniciativa +1 · Crít. frecuente +1 · contraataque +2 · Sangrado 50 %, seguro si es crítico · 400 |
| Sable del capitán pirata | 2 dados · +2 · Parry +1 · contraataque +2 · Sangrado 50 % · 250 |
| 🆕 Cimitarra del sol | 2 dados · +1 · Iniciativa +2 · contraataque +2 · Sangrado 50 % · 200 |
| 🆕 Facón de oro | +2 · Iniciativa +2 · Crít. frecuente +1 · contraataque +1 · Sangrado 50 % · 230 |
| 🆕 Guadaña | 2 manos · 2 dados · Alcance +1 · Sangrado 75 % · Rengo 33 % · 260 |
| 🆕 Machete del Impenetrable | +1 · +1 dado amplificado · Iniciativa +1 · contraataque +1 · Rengo 33 % · Sangrado 50 % · 220 |
| 🆕 Cimitarra del corsario | +1 · contraataque +2 · Crít. potente +2 · Veneno 3 stacks 50 % · Sangrado 33 % · 210 |
| 🆕 Espadón del estanciero | 2 manos · 3 dados · Alcance +1 · Bloqueo +1 · Sangrado 33 % · 400 |
| **Sin Sangrado** | |
| Espada bastarda del Espectro (era copia) | 2 dados · Crít. potente +2 · 🗡 espalda +3 PdG, +2 daño · ⚡ si es crítico: Sangrado 3 stacks · 280 |
| Mandoble | 2 manos · 3 dados · Parry +2 · Bloqueo +1 · 240 |
| Cuchilla de carnicero | 2 dados · +2 · Bloqueo +1 · Rompe armadura 33 % · 210 |
| Espada vampírica menor | 2 dados · Parry +1 · contraataque +2 · Drena vida 50 % · 300 |
| Katana | 2 dados · Crít. potente +3 · Ignora 1 de Res. crítico · 240 |
| Katana del cazarrecompensas (era copia) | Iniciativa +2 · Crít. frecuente +2 · 🗡 espalda +2 PdG, +2 daño · 260 |
| 🆕 Sable del comandante | 2 dados · +1 · Parry +1 · contraataque +3 · ⚡ si es crítico: Rengo · 230 |
| 🆕 Sable del general | 2 dados · Iniciativa +2 · Parry +1 · contraataque +1 · Rengo 50 %, seguro si es crítico · 220 |
| 🆕 As de espadas | **Crít. frecuente +4** (la única) · 300 |

**✅ T6 Raro cargado (2026-10-03, OK del dueño):** las 18 de la propuesta v1, salvo el As de espadas (Crít. frecuente +4: «en Rara me sigue pareciendo muy alto»), reemplazado por el **Rompeespadas** (Parry +4, Bloqueo +2, contraataque +4: el máximo de defensa activa sin pasar a Excepcional). **Regla nueva: Crít. frecuente +4 no va en Rara.** ✅ Tipo 6: Común, Buena y Rara terminados.

## Tipo 8 — Hachas, siempre (arranca 2026-10-03)
Estado hoy (cuerpo a cuerpo): Común 11 · Buena 10 · Raro 9 · Excepcional 5 · Legendario 3; de rango (aparte): Buena 1 · Raro 4 · Exc. 1 · Leg. 2.

### Tipo 8 — definiciones (propuesta del asistente, ⬜ sin responder)
**Identidad:** hachas de mano, de leñador, de guerra, dobles. **Caras en Nitros** (primer ataque 4, los siguientes 8): pocos golpes y pesados.
La familia que **rompe armaduras**: su efecto de casa es **Rompe armadura**; juegan con el **Peso** (más dados), el **daño fijo** y el
**Bloqueo** (el hacha ataja con el mango y la cabeza). **Piso propuesto de la Común:** 1d8 con **25 % de Rompe armadura**.
- 🏠 **Propio:** Rompe armadura · Bloqueo · daño fijo / Dmg · más dados (Peso) · Alcance (hachas de asta, a dos manos).
- 🤝 **Puede ir:** Sangrado (tajos profundos) · Derribar (el hachazo que voltea) · Rengo (talar piernas) · Envenenar (bajo) · daño
  amplificado · Crít. potente (poco) · Critical Matters («si es crítico: Armadura rota doble», «si es crítico: Derribar») · «seguro si es crítico» ·
  Parry (hachas de mano, poco).
- ✨ **Excepción:** Demora (más de los contundentes) · Lisiado · Iniciativa (las hachas son lentas) · Drena (Excepcional+).
- 🚫 **Ajeno:** Ignora resistencia a crítico (solo T4 y T6) · Crít. frecuente alto · Aturdir · por la espalda · PdG en oportunidad (lanzas) ·
  Explosión. Veneno severo seguro: solo Legendaria.
- **Fuera del Tipo:** las lanzas (Lanza de caza → Tipo 4) y las arrojadizas (con las de rango).

### T8 Común — lo que hay hoy (2026-10-03)
| Arma | Lo que hace · precio hoy → libre · rinde como |
|---|---|
| Hachuela | 1 dado · 40 → 55 · Común |
| Hachuela de leñador | 1 dado · Iniciativa +1 · 60 → 60 · Común |
| Hacha de mano | 1 dado · +1 · Rompe armadura 25 % · 70 → 75 · Común (es el piso) |
| Hacha oxidada | 1 dado · Veneno 50 % · 50 → 65 · Común (veneno alto para Común) |
| Tomahawk | 1 dado · Alcance +1 · 60 → 85 · Común |
| Tomahawk de pantano | 1 dado · Bloqueo +1 · 60 → 60 · Común |
| Hacha | 1 dado · Rompe armadura **siempre** · 60 → 100 · Buena |
| Hacha del clan | **copia** del Hacha (botín) |
| Hacha de leñador | 2 dados · 60 → 110 · Buena |
| Hacha de constructor | 2 dados · Rompe armadura **siempre** · 90 → 200 · **Rara** |
| Lanza de caza | 2 manos · 1 dado · Alcance +1 · 65 → 85 · Común — **es una lanza: va al Tipo 4** |

**Definiciones del Tipo 8 ✅ (dueño, 2026-10-03):** piso de la Común = **1d8 con 33 % de Rompe armadura**, en la mitad de las armas; la otra mitad
juega con los demás parámetros (sin quedar por debajo); puede haber alguna con Rompe armadura 50 % y nada más. Comunes: **24**.

### T8 Común — propuesta v1: 24 armas (2026-10-03, ✅ aprobada y cargada en el catálogo)
| Arma | Lo que hace · precio |
|---|---|
| **Con Rompe armadura** | |
| Hachuela | Rompe armadura 33 % · 65 |
| Hacha de mano | +1 · Rompe armadura 33 % · 75 |
| Hacha | Rompe armadura **50 %** (y nada más) · 75 |
| Hachuela de leñador | Iniciativa +1 · Rompe armadura 33 % · 80 |
| 🆕 Hacha de bombero | Bloqueo +1 · Rompe armadura 33 % · 85 |
| Hacha del clan (era copia) | Sangrado 25 % · Rompe armadura 33 % · 80 |
| 🆕 Hachuela de cocina | Crít. potente +1 · Rompe armadura 33 % · 85 |
| 🆕 Hacha de cotillón vikingo | Derribar 25 % · Rompe armadura 33 % · 85 |
| 🆕 Hacha del herrero de pueblo | Parry +1 · Rompe armadura 33 % · 90 |
| 🆕 Hacha de guardabosque | Rengo 20 % · Rompe armadura 33 % · 85 |
| 🆕 Hacha de piedra | +1 · Bloqueo +1 · Rompe armadura 33 % · 100 |
| Hacha oxidada | Veneno 2 stacks 20 % · Rompe armadura 33 % · 80 |
| **Sin Rompe armadura** | |
| Hacha de leñador | 2 dados · 110 |
| Hacha de constructor | 2 dados · +1 · 120 |
| Tomahawk | Alcance +1 · 85 |
| Tomahawk de pantano | Bloqueo +2 · 75 |
| 🆕 Hacha de doble filo barata | +1 · Sangrado 33 % · 70 |
| 🆕 Hacha de verdugo de pueblo | Derribar 50 % · 70 |
| 🆕 Hachón | +1 dado amplificado · 110 |
| 🆕 Hacha de asta | 2 manos · +1 · Alcance +1 · 100 |
| 🆕 Hacha afilada a la piedra | Crít. potente +2 · 80 |
| 🆕 Hacha con garfio | Bloqueo +1 · Derribar 25 % · 80 |
| 🆕 Hacha de leñador del sur | +2 · 75 |
| 🆕 Hachuela de camping | Parry +1 · Bloqueo +1 · 85 |

Sale la **Lanza de caza** (es una lanza: el Tipo 4 ya tiene sus lanzas comunes).

**Durabilidad en las espadas (dueño, 2026-10-03):** «ninguna de las espadas tiene más durabilidad»: pesa poco en la calidad, así que se sumó donde
había margen sin cambiar de tier, sobre todo a las que juegan con **Parry** (afianza que están pensadas para esa mecánica). +3 en Común y Buena,
+6 en Rara. Comunes: Caronero, Sable del club de barrio, Sable de desfile (la Espada del duelista novato no tenía margen). Buena: Sable de mando
del capitán, Cimitarra de guardia, Sable de caballería, Espada larga de infantería, Espada de la guardia (para que entre: Crít. frecuente +1 →
Crít. potente +2). Raras: Espada bastarda, Katana de maestro, Sable del capitán pirata, Mandoble, Espada vampírica menor, Sable del comandante,
Sable del general, Rompeespadas (para que entre: contraataque +4 → +3; queda con +3 de durabilidad). Los precios se recalcularon.

Cargadas (2026-10-03): las 24 con sus tres textos; sale la Lanza de caza (el Goblin cazador de jabalíes pasa a la Lanza corta); el Hacha del clan es arma propia (sigue de botín); en los creeps, el equipo común del Tipo 8 suma el Hacha de mano. Hacha de piedra, Hacha de leñador, Hacha de constructor, Hachón y Hacha de asta rinden un poco por encima de Común (2 dados, dos manos o daño amplificado), como en la propuesta.

### T8 Buena calidad — lo que hay hoy y diagnóstico (2026-10-03)
| Arma | Lo que hace · precio hoy → libre · rinde como · qué hacer |
|---|---|
| Hacha de guerra ligera | 2 dados · +1 · 100 → 120 · Buena · queda |
| Hacha de doble filo | +1 · Rompe armadura **siempre** · 100 → 120 · Buena · queda (choca de nombre con la Rara) |
| Hacha dentada | 2 dados · Sangrado 50 % · 115 → 130 · Buena · queda |
| Hachón de minero | 2 dados · +1 · Rompe armadura 33 % · 160 → 150 · Buena · queda |
| Hacha de guerra | 2 dados · Rompe armadura 25 % · 130 → 120 · Buena · por debajo del piso nuevo: sube a 33 % |
| Hacha de abordaje | Bloqueo +1 · Alcance +1 · 100 → 110 · Buena · Alcance en una mano: o pasa a dos manos o cambia el Alcance |
| Hacha con pico | 2 dados · Ignora 1 de Res. crítico · 110 → 150 · Buena · «ignora» es ajeno al Tipo 8: rehacer |
| Espadón de batalla | 2 manos · 2 dados · +1 · 170 → 120 · Buena · es una espada en el Tipo 8: renombrar o mudar |
| Hacha de batalla | 2 dados · Bloqueo +1 · Rompe armadura siempre · 110 → 250 · **Rara** |
| Hacha de la furia roja | **idéntica** a la de batalla · **Rara** |
| (Arcabuz de mecha) | de rango, va con las de rango |

**Respuestas del dueño sobre T8 Buena (2026-10-03):** **sin Critical Matters** en las hachas («los críticos con hacha van a ser poco
frecuentes: no les suma demasiado, no las hace atractivas») — por la misma razón, tampoco «seguro si es crítico». **Puede haber alguna hacha con
Crítico frecuente +1.** Derribar = deja Sentado (se usa en las hachas); Demora = baja 1 lugar en la iniciativa (es de los contundentes).

**Más respuestas (2026-10-03):** el piso ✅; puede haber un hacha de 1 dado con Rompe armadura siempre y nada más, en Buena; el Espadón de batalla
pasa a ser un hacha a dos manos con otro nombre; el Hacha con pico es la de Crítico frecuente +1; Hacha de batalla → a la revisión de las Raras,
Hacha de la furia roja → se rehace como Buena.

### T8 Buena calidad — propuesta v1: 18 armas (2026-10-03, ✅ aprobada y cargada)
| Arma | Lo que hace · precio |
|---|---|
| **Con Rompe armadura** | |
| Hacha del calderero 🆕 | 1 dado · Rompe armadura siempre (y nada más) · 100 |
| Hacha de doble filo | 1 dado · +1 · Rompe armadura siempre · 120 |
| Hacha del forjador 🆕 | 1 dado · Bloqueo +1 · Rompe armadura 50 % · muy resistente · 120 |
| Hacha de guerra | 2 dados · Rompe armadura 33 % (era 25 %) · 130 |
| Hachón de minero | 2 dados · +1 · Rompe armadura 33 % · 150 |
| Hacha grande del aserradero (era el Espadón de batalla) | 2 manos · 2 dados · Alcance +1 · 150 |
| Hacha de la furia roja (rehecha) | 2 dados · Bloqueo +1 · Rompe armadura 33 % · 170 |
| Hacha del aserrador 🆕 | 2 dados · Derribar 25 % · Rompe armadura 33 % · 170 |
| Hacha del monte 🆕 | 2 dados · Rengo 20 % · Rompe armadura 33 % · 160 |
| **Sin Rompe armadura** | |
| Hacha de abordaje | 1 dado · Bloqueo +2 · Derribar 33 % · resistente · 110 (sale el Alcance) |
| Hacha del campeón de hachazos 🆕 | 1 dado + 1 amplificado · Crít. potente +1 · 130 |
| Hacha de guardia del fortín 🆕 | 2 manos · 1 dado · Alcance +1 · Bloqueo +2 · resistente · 130 |
| Hacha de guerra ligera | 2 dados · +1 · 120 |
| Hacha dentada | 2 dados · Sangrado 50 % · 130 |
| Hacha del pantano 🆕 | 2 dados · Veneno 2 stacks 25 % · Sangrado 25 % · 140 |
| Hacha del frigorífico 🆕 | 2 dados · +2 · 140 |
| Hacha del verdugo de la capital 🆕 | 2 dados · Derribar 50 % · 140 |
| Hacha con pico (rehecha) | 2 dados · Crít. frecuente +1 · 150 |

Sale de las Buenas: **Hacha de batalla** (rinde como Rara: se revisa con las Raras).

**Dos manos baja un poco el precio (dueño, 2026-10-03):** «te imposibilita tener otra arma o un escudo; en su defecto te da alcance, entonces un
poco se balancea». En la calculadora, `DESCUENTO_DOS_MANOS` = 0,75 PC (~10 % del precio). Se recalcularon las armas a dos manos ya cargadas
(T4, T6 y T8 Común): todas bajaron ~10 %; la **Lanza del guardián del paso** y la **Lanza del montero mayor** quedaban apenas debajo de Raro y
ganaron durabilidad (Resistente, 9) para seguir Raras. El **Hacha grande del aserradero** queda con la opción (b): 2 manos · 2 dados · Alcance +1
(150, Buena). Con eso las Buenas quedan 8 con Rompe armadura y 10 sin.

**T8 Buena cargada (2026-10-03), 9 y 9 (dueño):** para volver a 9 con Rompe armadura, el **Hacha de guerra ligera** pasa a 1 dado · +2 · Rompe armadura
50 % (100; con 2 dados +1 y 33 % quedaba igual al Hachón de minero). El Espadón de batalla quedó como Hacha grande del aserradero (mismo id). El
**Hacha de batalla** pasó a Raro (precio 250) para revisarla con las Raras; la Rara «⚠️ Hacha de doble filo» se renombra en esa revisión. Sigue: T8 Raro.

### T8 Raro — lo que hay hoy y diagnóstico (2026-10-03)
| Arma | Lo que hace · precio hoy → libre · rinde como · qué hacer |
|---|---|
| Alabarda de guardia | 2 manos · 2 dados · +1 · Alcance +1 · Derribar 25 % · 230 → 220 · Rara · queda |
| Sagaris | 2 dados · +1 · Rompe armadura siempre · Sangrado siempre · 130 → 400 · Rara alta · queda (precio a corregir) |
| Segur de verdugo | 2 dados · Alcance +1 con una mano · Rompe armadura 50 % · 240 → 250 · Rara · Alcance en una mano: pasa a dos manos |
| Hacha danesa | 2 dados · Alcance +1 con una mano · Rompe armadura siempre · 130 → 350 · Rara · **idéntica** al Hacha del Jefe de Guerra; la danesa histórica es a dos manos |
| Hacha del Jefe de Guerra | igual a la danesa · rehacer |
| Hacha de batalla (viene de Buena) | 2 dados · Bloqueo +1 · Rompe armadura siempre · 250 · Rara · **idéntica** al Hacha del Caudillo |
| Hacha del Caudillo | igual a la de batalla · rehacer |
| ⚠️ Hacha de doble filo | 3 dados · Rompe armadura siempre · Ignora 1 de Res. crítico · 120 → 600 · **Excepcional** · «ignora» es ajeno; renombrar (choca con la Buena) |
| ⚠️ Hacha de guerra pesada | 2 dados · «Arruina armadura» (efecto que ya no existe) · 130 → 110 · Buena · rehacer (¿Armadura rota doble?) |
| Hacha arrojadiza | 2 dados · Alcance +2 con una mano · Sangrado 50 % · 240 → 260 · Rara · es arrojadiza: va con las de rango |

**Decisión (dueño, 2026-10-03):** las 18 Raras **por arquetipos**, con Rompe armadura en **por lo menos la mitad** («es la identidad de las hachas;
puede haber más»).

### T8 Raro — propuesta v1: 18 armas por arquetipo (2026-10-03, ✅ aprobada y cargada)
| Arma | Lo que hace · precio |
|---|---|
| **🔨 Rompecorazas** | |
| Hacha de guerra pesada (rehecha) | 2 dados · Armadura rota doble 50 % · 170 |
| Hacha del Caudillo (rehecha) | 2 dados · Bloqueo +1 · Armadura rota doble siempre · 350 |
| Hacha de doble hoja (era la Rara «de doble filo») | 3 dados · Rompe armadura siempre · 400 |
| **🛡 Muralla** | |
| Hacha de batalla | 2 dados · Parry +1 · Bloqueo +2 · Rompe armadura 33 % · resistente · 300 |
| Hacha del alcaide 🆕 | 2 dados · Parry +2 · Bloqueo +2 · muy resistente · 350 |
| Hacha del baluarte 🆕 | 1 dado · Parry +1 · Bloqueo +3 · Rompe armadura 50 % · muy resistente · 210 |
| **🪓 Verduga** | |
| Segur de verdugo | 2 manos · 2 dados · Derribar 50 % · Rompe armadura 33 % · 170 |
| Hacha del cazador de osos 🆕 | 2 dados · Rengo 33 % · Derribar 33 % · 180 |
| Hacha del alguacil 🆕 | 2 dados · Bloqueo +1 · Derribar 50 % · Rengo 25 % · 240 |
| **🌲 Leñador bruto** | |
| Hacha del quebrachero 🆕 | 2 manos · 3 dados · +1 · 220 |
| Gran hacha del monte 🆕 | 2 manos · 3 dados · Rompe armadura 33 % · 230 |
| Hacha del Jefe de Guerra (rehecha) | 3 dados a una mano · Iniciativa −1 · Rompe armadura 33 % · 260 |
| **🏹 Asta** | |
| Alabarda de guardia | 2 manos · 2 dados · +1 · Alcance +1 · Derribar 25 % · 220 |
| Hacha danesa | 2 manos (era de una) · 2 dados · Alcance +1 · Rompe armadura siempre · 300 |
| Hacha de asta larga 🆕 | 2 manos · 2 dados · Alcance +1 · Parry +1 · Bloqueo +1 · 260 |
| **🩸 Salvaje** | |
| Sagaris | 2 dados · +1 · Rompe armadura siempre · Sangrado siempre · 400 |
| Hacha de colmillo de jabalí 🆕 | 2 dados · Sangrado de 3 stacks 50 % · Rompe armadura 33 % · 190 |
| Hacha del pantano negro 🆕 | 2 dados · Veneno de 3 stacks 50 % · Sangrado 33 % · 180 |

Con Rompe armadura: **11 de 18**. El **Hacha arrojadiza** queda afuera (va con las de rango).

**Alcance +2 no va en las hachas (dueño, 2026-10-03):** «para un hacha no me gusta; sí en alguna Tipo 4 rara» (ya la hay: la Pica de retaguardia,
Alcance +2). El Hacha de asta larga pasa a Alcance +1 · Parry +1 · Bloqueo +1 (260).

**T8 Raro cargada (2026-10-03):** las 18 con sus tres textos. La Rara «⚠️ Hacha de doble filo» quedó como **Hacha de doble hoja** (mismo id). El
texto corto de un arma dice «Armadura rota doble» cuando deja 2 stacks (`ItemCorto`). El **Hacha arrojadiza** sigue igual hasta revisar las de
rango. En los creeps, el equipo Raro del Tipo 8 suma el Hacha de batalla. **Tipo 8: Común, Buena y Rara hechas.** Sigue: Tipo 10.

## Tipo 10 — Contundentes (arranca 2026-10-03)
Estado hoy (cuerpo a cuerpo): Común 13 · Buena 10 · Raro 9 · Excepcional 6 · Legendario 4; de rango (aparte): Exc. 1 · Leg. 1.

### Tipo 10 — definiciones (✅ aprobadas por el dueño, 2026-10-03, con los cambios de abajo)
**Identidad:** mazas, martillos, garrotes, porras y bastones. **Las más caras en Nitros** (primer ataque 5, los siguientes 10): pocos golpes y
que se sientan. Un dado de 10 ya pega mucho: **2 dados son Buena** (en la Común, 1 dado). El golpe que **desordena**: **Demora** (baja 1 lugar en
la iniciativa) y **Aturdir** (Stun).
- 🏠 **Propio:** Demora · Aturdir · Bloqueo y Parry (el mango ataja) · daño fijo · daño amplificado.
- 🤝 **Puede ir:** Derribar · Rompe armadura (martillos contra placas, bajo) · Crít. potente · Alcance (solo bastones y martillos a dos manos).
- ✨ **Excepción:** Sangrado (la maza con pinchos) · Rengo (rodillas) · Iniciativa · Drena (Excepcional+).
- 🚫 **Ajeno:** Ignora resistencia a crítico · Crít. frecuente (con un d10 casi no rinde) · Critical Matters (mismo criterio que las hachas) ·
  por la espalda · PdG en oportunidad · Veneno · Explosión.
- **Piso propuesto de la Común:** 1d10 con **Demora 33 %** en la mitad; la otra mitad juega con Bloqueo, Parry, daño fijo y Derribar.
  **Aturdir desde Buena** (bajo, 20–25 %). Comunes: 24.
- **Demora todavía no es automática** (el duelo la recuerda a mano). Propuesta: que el mapa la aplique (baja al golpeado 1 lugar en el orden de turnos).

### T10 Común — lo que hay hoy (2026-10-03)
| Arma | Lo que hace · precio hoy → libre · rinde como · qué hacer |
|---|---|
| Cachiporra | 1 dado · 40 → 60 · Común · queda |
| Bate de Baseball | 1 dado · +1 · 90 → 70 · Común · queda |
| Maza de hierro | 1 dado · Bloqueo +1 · 90 → 75 · Común · queda |
| Garrote de pastor | 1 dado · Demora 25 % · 70 → 75 · Común · Demora a 33 % |
| Mazo de carnicero | 1 dado · +1 · Demora 25 % · 75 → 85 · Común · Demora a 33 % |
| Porra de guardia | 1 dado · Bloqueo +1 · Demora 25 % · 80 → 95 · Común · Demora a 33 % |
| Martillo de cantero | 1 dado · Alcance +1 con una mano · 70 → 110 · Buena · Alcance en una mano |
| Bastón de monje | 1 dado · +1 · Alcance +1 con una mano · 90 → 130 · Buena · **idéntico** al del trueno; un bastón es a dos manos |
| Bastón del trueno | igual al de monje · rehacer |
| Garrote | 2 dados · 60 → 140 · **Buena** · pasa a Buena |
| ⚠️ Martillo de bola | 2 dados · Bloqueo +1 · 115 → 170 · **Rara** · **idéntico** al garrote de hueso |
| ⚠️ garrote de hueso | igual al martillo de bola · rehacer |
| ⚠️ Maza | 2 dados + 1 amplificado · 50 → 350 · **Rara** · rehacer o subir de tier |

**Respuestas del dueño sobre el Tipo 10 (2026-10-03):** las definiciones sirven así, con estos cambios: **sin Sangrado** (poco intuitivo en un
contundente); la maza con pinchos, a lo sumo, es la que **rompe armadura**, y que sea algo raro; **Aturdir es muy bueno: porcentajes bajos**.
**Demora automatizada** (`dueloDemora`, js/13 del mapa): baja al golpeado 1 lugar en el orden de turnos; queda a mano si es su turno o si ya
actuó y quedaría después de quien tiene el turno. Garrote, Martillo de bola y Maza (rinden de más): a criterio del asistente.

### T10 Común — propuesta v1: 24 armas (2026-10-03, ✅ aprobada y cargada)
| Arma | Lo que hace · precio |
|---|---|
| **Con Demora** | |
| Garrote de pastor | Demora 33 % · 75 |
| Palo de amasar 🆕 | Demora 50 % (y nada más) · 85 |
| Mazo de carnicero | +1 · Demora 33 % · 85 |
| Porra de guardia | Bloqueo +1 · Demora 33 % · 100 |
| Garrote de hueso (rehecho) | Demora 33 % · muy resistente · 95 |
| Martillo del herrero de pueblo 🆕 | Parry +1 · Demora 33 % · 100 |
| Martillo de carpintero 🆕 | Iniciativa +1 · Demora 33 % · 95 |
| Llave inglesa 🆕 | Rengo 20 % · Demora 33 % · 100 |
| Rebenque emplomado 🆕 | Derribar 20 % · Demora 33 % · 95 |
| Pata de mesa 🆕 | +2 · Iniciativa −1 · Demora 33 % · 100 |
| Mazo de bombo 🆕 | 2 manos · Bloqueo +1 · Demora 33 % · 90 |
| Bastón del trueno (rehecho) | 2 manos · +1 · Demora 50 % · 85 |
| **Sin Demora** | |
| Cachiporra | 1 dado · 60 |
| Bate de Baseball | +1 · 70 |
| Maza de hierro | Bloqueo +1 · muy resistente · 90 |
| Mazo de goma 🆕 | Derribar 33 % · 75 |
| Garrote de quebracho 🆕 | +2 · 80 |
| Caño de plomo 🆕 | +1 · Derribar 25 % · 80 |
| Pilón de mortero 🆕 | +1 · Bloqueo +1 · 85 |
| Porra de sereno 🆕 | Bloqueo +2 · 85 |
| Martillo de cantero | +1 · muy resistente (era Alcance con una mano) · 80 |
| Sartén de hierro 🆕 | Parry +1 · Bloqueo +1 · 95 |
| Bastón de monje | 2 manos · Parry +1 · Bloqueo +1 (sin Alcance) · 85 |
| Bastón de caminante 🆕 | 2 manos · +1 · Bloqueo +2 · 85 |

Todas de 1 dado. Sin Aturdir (desde Buena), sin Rompe armadura, sin Alcance (con un d10, Alcance en Común ya rinde Buena: arranca en Buena).
Porra de guardia, Garrote de hueso, Martillo del herrero, Llave inglesa y Martillo de cantero rinden apenas por encima de Común (7,5–7,8).
Pasan a otras tandas: **Garrote** y **Martillo de bola** (2 dados) a Buena, **Maza** (2 dados + 1 amplificado) a Rara.

**Sin Crítico potente en los contundentes (dueño, 2026-10-03):** «no le va a sumar nada; nadie cuenta con un crítico en un arma» (con un d10 el
crítico es raro). Sale de «Puede ir» del Tipo 10. En la Común: Garrote de hueso → muy resistente; Pilón de mortero → +1 · Bloqueo +1; Martillo
de cantero → +1 · muy resistente.

**T10 Común cargada (2026-10-03):** las 24 con sus tres textos. Garrote y ⚠️ Martillo de bola pasaron a Buena y ⚠️ Maza a Rara (para sus tandas);
el «⚠️ garrote de hueso» quedó como Garrote de hueso. **Hachas sin Crítico potente** (dueño): Hachuela de cocina → Rompe armadura 33 % · muy
resistente (80); Hacha afilada a la piedra → Sangrado de 3 stacks 50 % (70); Hacha del campeón de hachazos → 1 dado + 1 amplificado · Derribar 25 %
(130). Sigue: T10 Buena.

### T10 Buena calidad — lo que hay hoy y diagnóstico (2026-10-03)
| Arma | Lo que hace · precio hoy → libre · rinde como · qué hacer |
|---|---|
| Garrote (viene de Común) | 2 dados · 140 → 140 · Buena · queda |
| Maza de guerra | 2 dados · 150 → 140 · Buena · **idéntica** al Garrote: rehacer |
| Estrella del alba | +1 · Rompe armadura 33 % · 85 → 90 · Buena · queda (la maza con pinchos: la única que rompe armadura) |
| Martillo de herrero | +1 · Parry +1 · Bloqueo +1 · Demora 25 % · 120 → 140 · Buena · queda |
| Martillo ergonómico | Bloqueo +3 · 130 → 100 · Buena · queda |
| ⚠️ Martillo de bola (viene de Común) | 2 dados · Bloqueo +1 · 170 · apenas Rara · a dos manos entra en Buena |
| Martillo de cabeza plana | 2 dados · Bloqueo +2 · 135 → 200 · Rara · rehacer o a Rara |
| Martillo | 3 dados · 100 → 350 · Rara · a Rara |
| Maza de guardia | 3 dados · 90 → 350 · Rara · a Rara |
| Báculo de batalla | 2 dados · Bloqueo +1 · Alcance +1 con una mano · 140 → 350 · Rara · **tres idénticos**; un báculo es a dos manos |
| Báculo del Sumo Profeta | igual · rehacer |
| Báculo del inquisidor | igual · rehacer |

**La cuenta clave del Tipo 10:** 2 dados de d10 ya rinden 10,6 (el techo de Buena es 11). Un arma Buena de 2 dados **a una mano no tiene lugar
para nada más**; a dos manos le entra una cosa chica (Demora 25 %, Bloqueo +1). El resto de la Buena es **1 dado con varias cosas**.

**Pajaritos entra a los contundentes (dueño, 2026-10-03):** «podemos incluir Pajaritos entre los efectos para diseño, inclusive en algunos
Común, 25 % o 50 %». Es el estado de siempre (PdG y Evasión a la mitad, 3 turnos; el duelo ya lo aplica solo). En la calculadora vale **4** (como
la Demora) y es de casa del Tipo 10 (habilitado en el 12); se sacó de los efectos descartados. «Detalles técnicos» y la Guía de diseño lo explican.
Pajaritos en la Común (dueño, 2026-10-03): Cachiporra → Pajaritos 25 % (75); Bate de Baseball → +1 · Pajaritos 25 % (85); Sartén de hierro →
Pajaritos 50 % (85). **Para la Buena:** el diseño propuesto (mitad con Demora, Aturdir en 2–3 bajo, báculos a dos manos con Alcance) ✅ y
**Pajaritos en por lo menos un tercio**, con porcentajes según el resto de los efectos.

### T10 Buena calidad — propuesta v1: 18 armas (2026-10-03, ✅ aprobada y cargada con el reparto parejo de abajo)
| Arma | Lo que hace · precio |
|---|---|
| **Con Demora** | |
| Maza de guerra (rehecha) | 1 dado · Demora 50 % · Pajaritos 25 % · 110 |
| Porra del comisario 🆕 | 1 dado · Demora 33 % · Aturdir 20 % · 100 |
| Martillo de forja 🆕 | 1 dado · Demora 33 % · Pajaritos 33 % · muy resistente · 130 |
| Garrote del matrero 🆕 | 1 dado · +2 · Demora 50 % · 110 |
| Maza del sargento 🆕 | 1 dado · +1 · Bloqueo +1 · Demora 50 % · 130 |
| Martillo de herrero | 1 dado · +1 · Parry +1 · Bloqueo +1 · Demora 25 % · 140 |
| Mazo del tambor mayor 🆕 | 2 manos · 1 dado · Bloqueo +2 · Demora 50 % · Pajaritos 25 % · 150 |
| Báculo de batalla (rehecho) | 2 manos · 1 dado · Alcance +1 · Bloqueo +1 · Demora 33 % · 170 |
| Martillo de bola (a dos manos) | 2 manos · 2 dados · Demora 25 % · 150 |
| **Sin Demora** | |
| Estrella del alba | 1 dado · +1 · Rompe armadura 33 % · 90 |
| Porra de goma del boliche 🆕 | 1 dado · Bloqueo +1 · Pajaritos 50 % · 110 |
| Martillo de la bodega 🆕 | 1 dado · +1 · Pajaritos 33 % · Derribar 25 % · 110 |
| Martillo ergonómico | 1 dado · Bloqueo +3 · resistente · 120 |
| Báculo del Sumo Profeta (rehecho) | 2 manos · 1 dado · Alcance +1 · Aturdir 20 % · 130 |
| Báculo del inquisidor (rehecho) | 2 manos · 1 dado · Alcance +1 · Derribar 33 % · 130 |
| Bastón de quebracho 🆕 | 2 manos · 1 dado · Parry +1 · Bloqueo +2 · muy resistente · 120 |
| Garrote | 2 dados · 140 |
| Mazo de feria 🆕 | 2 manos · 2 dados · Pajaritos 25 % · 150 |

Pajaritos en 6 (un tercio), Aturdir en 2 (20 %), Rompe armadura solo en la Estrella del alba. Pasan a Rara: **Martillo**, **Maza de guardia**
(3 dados) y **Martillo de cabeza plana** (2 dados · Bloqueo +2).

**Los tres efectos del Tipo 10 (dueño, 2026-10-03):** Demora, Derribar y Pajaritos son la identidad del contundente; «quizás parejo». Conteo:
- Común hoy: Demora 12 · Derribar 3 · Pajaritos 3 · ninguno 7 (más un Rengo). **Propuesta:** Demora 8 · Pajaritos 7 · Derribar 6 · ninguno 3.
  Cambios: Martillo del herrero de pueblo → Parry +1 · Pajaritos 33 %; Pata de mesa → +2 · Iniciativa −1 · Pajaritos 33 %; Porra de sereno →
  Bloqueo +1 · Pajaritos 33 %; Bastón de monje → + Pajaritos 25 %; Llave inglesa → Rengo 20 % · Derribar 25 %; Rebenque emplomado →
  Iniciativa +1 · Derribar 25 %; Bastón de caminante → 2 manos · +1 · Bloqueo +1 · Derribar 25 %; Martillo de cantero → + Derribar 20 %.
- Buena propuesta: Demora 9 · Pajaritos 6 · Derribar 2. **Propuesta pareja:** Demora 6 · Pajaritos 6 · Derribar 6 (con Aturdir en 2 y Rompe
  armadura en 1). Cambios: Martillo de bola → Derribar 25 %; Maza del sargento → Derribar 50 %; Martillo de herrero → Derribar 25 %; Martillo
  ergonómico → Bloqueo +2 · Derribar 25 % · resistente.

**T10 Común y Buena con los tres efectos parejos (cargado, 2026-10-03):** Común Demora 8 · Pajaritos 7 · Derribar 6 · ninguno 3; Buena Demora 6 ·
Pajaritos 6 · Derribar 6 (Aturdir en 2, Rompe armadura en 1). Martillo, Maza de guardia y Martillo de cabeza plana pasaron a Rara; «⚠️ Martillo de
bola» quedó como Martillo de bola (a dos manos). «Detalles técnicos» de Derribar ahora dice que levantarse cuesta 1 No2. Sigue: T10 Raro.

### T10 Raro — lo que hay hoy y diagnóstico (2026-10-03)
| Arma | Lo que hace · precio hoy → libre · rinde como · qué hacer |
|---|---|
| Cachiporra reforzada | 2 dados · +2 · Bloqueo +1 · Demora 25 % · 260 → 280 · Rara · queda |
| Martillo del sargento mayor | 2 dados · Parry +1 · Bloqueo +1 · Aturdir 17 % · 230 → 270 · Rara · queda |
| Martillo de cabeza plana (viene de Buena) | 2 dados · Bloqueo +2 · 200 · Rara · queda (sin ninguno de los tres efectos) |
| ⚠️ Maza (viene de Común) | 2 dados + 1 amplificado · 350 · Rara · queda (sin efecto) |
| Martillo (viene de Buena) | 3 dados · 350 · Rara · **igual** a la Maza de guardia |
| Maza de guardia (viene de Buena) | 3 dados · 350 · Rara · rehacer |
| Maza de justicia | 3 dados · Demora 25 % · 350 → 400 · Rara alta · queda |
| Hacha de batalla a dos manos | 2 manos · 3 dados · 250 → 300 · Rara · es un «hacha» en el Tipo 10: renombrar |
| Mangual | 2 dados · +1 · Alcance +1 con una mano · 160 → 300 · Rara · **dos armas con el mismo nombre**; Alcance en una mano |
| Mangual (el otro) | 4 dados · Alcance +1 · 150 → 1400 · **Excepcional** · a la vuelta de las Excepcionales |
| Martillo de sargento | 4 dados · Parry +1 · 140 → 900 · **Excepcional** · ídem |
| Maza de acero | 3 dados · Bloqueo +3 · 160 → 550 · **Excepcional** · ídem (o rehacer) |
| ⚠️ Lucero del alba | 2 dados · Alcance +1 con una mano · Ignora 1 de Res. crítico · 150 → 400 · Rara · «ignora» es ajeno: rehacer (¿la maza con pinchos que rompe armadura?) |

Hoy, de los tres efectos de la casa: Demora 2 · Derribar 0 · Pajaritos 0 (Aturdir 1).
**La cuenta del Tipo 10 en Rara:** 3 dados a una mano ya rinden 15,9 (techo 17): casi sin lugar; a dos manos, 15,2. Con 2 dados (10,6) entra
mucho más: dos efectos y un bono.

**Decisiones (dueño, 2026-10-03):** Raras por arquetipos ✅; Mangual (4 dados), Martillo de sargento y Maza de acero → a las Excepcionales; el
Lucero del alba es la maza con pinchos que rompe armadura; el Hacha de batalla a dos manos se renombra (y se rediseña si hace falta).

### T10 Raro — propuesta v1: 18 armas por arquetipo (2026-10-03, ✅ aprobada y cargada)
| Arma | Lo que hace · precio |
|---|---|
| **⏳ La que atrasa** | |
| Maza de justicia | 3 dados · Demora 25 % · 400 |
| Mazo del juez 🆕 | 2 dados · Demora siempre · Pajaritos 25 % · 350 |
| Cachiporra reforzada | 2 dados · +2 · Bloqueo +1 · Demora 50 % (era 25 %) · 350 |
| **🐦 La que marea** | |
| Maza del estibador 🆕 | 2 dados · +1 · Pajaritos siempre · 300 |
| Martillo de cabeza plana | 2 dados · Bloqueo +2 · Pajaritos 50 % · 300 |
| Martillo de la campana 🆕 | 2 manos · 2 dados · Pajaritos 50 % · Demora 25 % · 230 |
| **🪨 La que tumba** | |
| Mangual de cadena (era el Mangual de 2 dados) | 2 dados · +1 · Derribar 50 % (sin Alcance) · 220 |
| Mazo de demolición (era el Hacha de batalla a dos manos) | 2 manos · 3 dados · Derribar 33 % · 350 |
| Martillo de asta 🆕 | 2 manos · 2 dados · Alcance +1 · Derribar 50 % · 350 |
| **💫 La que aturde** | |
| Martillo del sargento mayor | 2 dados · Parry +1 · Bloqueo +1 · Aturdir 17 % · 270 |
| Mazo de la tormenta 🆕 | 2 dados · Aturdir 20 % · Pajaritos 33 % · 230 |
| Rompecráneos 🆕 | 2 dados · +1 · Aturdir 20 % · Derribar 25 % · 240 |
| **🛡 La muralla** | |
| Maza de guardia (rehecha) | 2 dados · Parry +1 · Bloqueo +2 · Derribar 25 % · resistente · 400 |
| Maza del castellano 🆕 | 2 dados · Parry +1 · Bloqueo +2 · Demora 25 % · muy resistente · 450 |
| Bastón herrado del portero 🆕 | 2 manos · 2 dados · Parry +1 · Bloqueo +2 · Pajaritos 25 % · muy resistente · 400 |
| **🔨 La pesada** | |
| Martillo | 3 dados · Demora 25 % · 400 |
| Maza | 2 dados + 1 amplificado · Derribar 20 % · 400 |
| Lucero del alba (rehecho) | 2 dados · +1 · Rompe armadura 50 % · Pajaritos 25 % · 300 (la maza con pinchos) |

Demora 6 · Pajaritos 7 · Derribar 6 · Aturdir 3 (17–20 %) · Rompe armadura 1.

**T10 Raro cargada (2026-10-03):** las 18 con sus tres textos. Mangual (4 dados), Martillo de sargento y Maza de acero pasaron a Excepcional (para
esa vuelta). El Mangual de 2 dados quedó como Mangual de cadena y el Hacha de batalla a dos manos como Mazo de demolición (mismos ids); «⚠️ Maza» y
«⚠️ Lucero del alba» sin la marca. **Tipo 10: Común, Buena y Rara hechas.** Sigue: Tipo 12 (explosivos).
**Mangual de cadena (dueño, 2026-10-03):** una mano · 1 dado · **Alcance +1** (excepción: la cadena llega lejos aunque sea de una mano) · Derribar
33 % · Pajaritos 25 % · 190. Sin el efecto extra rendía como Buena (9,1).

## ⏸ Pausa del rework de armas (dueño, 2026-10-03)
Hecho: Tipo 4 (Común, Buena, Rara, Excepcional), Tipo 6, 8 y 10 (Común, Buena, Rara). **Tipo 12: no va a haber armas explosivas** salvo en una
situación muy excepcional. **Excepcionales y Legendarias** (de todos los Tipos): para otro momento. Las que quedaron a la espera en Excepcional
(Mangual de 4 dados, Martillo de sargento, Maza de acero, las Excepcionales viejas de T6/T8/T10) siguen como estaban. Sigue: auditoría de trampas.

## Armas mágicas — panorama y lluvia de mecánicas (2026-10-05, arranque del rework mágico)
Dueño: «vamos a avanzar con la obra titánica de encarar el diseño de armas mágicas». Ejercicio de siempre: panorama → lluvia de mecánicas → el
dueño filtra → tabla por tier → OK → se carga.

**Panorama (lo que hay hoy).**
| Tema | Estado |
|---|---|
| Decidido | Armas de **daño** y de **efecto** (P116); varita 1d4 / buena 1d6 por 1 No2; daño mágico directo a la vida; **no critica**; híbridas desde Raro (P117); cadena del rayo (P118); Escarcha y Parálisis con %, nunca seguras |
| Sin responder (2026-09-25) | Mapa elemento ↔ familia (arcano T4, rayo T6, fuego T8, hielo T10); si el dado es el daño y el Especial solo el PG; báculos cuerpo a cuerpo o solo casteo; usos por combate; las 16 ideas de efecto |
| Contradicción abierta | Seba: sin SP y el costo sube con cada ataque, como un arma física — contra «1 No2 + SP» |
| Catálogo | **Ninguna arma mágica de verdad.** 2 híbridas rehechas (Lanza del alba: rayo 1d4; Aguja de escarcha: hielo 1d4); 9 bastones, todos físicos (T10); los «focos» son anillos y diademas (PdG.Esp, Rango de casteo, Ef.Esp) |
| Motor, ya está | Daño mágico extra al golpear (`danoMagico` + dado: ignora Defensa, resta Armadura mágica); stats del Especial (PdG.Esp, Ef.Esp, Rango de casteo, SP, SP Regen); resistencias elementales; cadena del rayo (a mano desde el token) |
| Motor, falta | **Un ataque con arma que tire PdG.Esp** (hoy no existe); que el daño mágico de un arma reste la Res. elemental; que un arma dé un hechizo (habilidad) para castear; Escarcha/Parálisis/Prende fuego automáticos desde un arma; la calculadora no conoce el SP, los usos ni la forma, y las dos calculadoras valúan distinto PdG.Esp/Ef.Esp |

**Primero los cimientos (propuestas para responder):**
1. **El ataque mágico**: el arma tira **PdG.Esp contra Evasión**; el daño es el **dado del arma** (no suma Dmg ni Ef.Esp), **directo a la vida**, menos la **Armadura mágica** y la **Res. de su elemento**; no critica. A distancia: el **Rango de casteo**.
2. **El costo — junta las dos posturas**: el **ataque básico** del arma mágica se paga **como un arma** (No2 que suben con cada ataque del turno, **sin SP**: Seba); los **hechizos** que da el arma (los efectos) cuestan **1 No2 + SP** (dueño). Así la varita sirve para pegar seguido y el SP queda para lo fuerte.
3. **Mapa elemento ↔ familia** (el dado sube con el Tipo): arcano = varitas (T4) · rayo = T6 · fuego = T8 · hielo = báculos (T10).
4. **Varita** a una mano (se puede llevar con un arma o un escudo); **báculo** a dos manos y, además, pega físico (híbrido de casa, con Alcance).
5. **Hechizos del arma**: **usos por combate** (Común/Buena 3 · Raro 2 · Excepcional 1–2 · Legendario 1) además del costo.
6. El daño mágico de un arma **resta la Res. de su elemento** (como el de las habilidades).

**Lluvia de mecánicas (además de las 16 ideas de efecto de arriba):**
- **Elemento**: arcano (sin efecto, pero ignora la Res. elemental / perfora 1 de Armadura mágica) · fuego (Prende fuego %, terreno incendiado) · hielo (Escarcha %) · rayo (Parálisis %, cadena) · tóxico (Veneno %).
- **Canalizar**: +PdG.Esp · +Ef.Esp · +Rango de casteo · +SP máximo · +SP Regen · −1 SP a las habilidades de un elemento · +1 al daño de las habilidades de su elemento.
- **Cargas**: la varita trae N cargas por combate y no usa SP (sirve para cualquiera, aunque no sea mago) · se recarga 1 por turno sin usarla · se rompe al vaciarse (barata).
- **Forma del hechizo**: proyectil · cono · línea · flor · rebote al siguiente.
- **Recursos**: drena SP del golpeado · drena vida (como el arma física) · magia de sangre: pagar SP con vida (para el Nigromante) · devuelve 1 SP al matar.
- **Defensa del mago**: Escudo especial al castear · Armadura mágica (escasa, cara) · absorber un golpe elemental como SP.
- **Riesgo (contras)**: sobrecarga (con un 1 en el dado te dañás) · inestable (el elemento sale al azar) · ruidosa (rompe el Sigilo).
- **Firma** (como las armas físicas): «el primer hechizo del turno cuesta 1 No2 menos» · «+1 d20 de crítico» no (la magia no critica) → «+1 al dado de efecto».

**2026-10-05 · Reinicio (dueño): «lo que establecimos antes lo vamos a dejar de lado. Vamos a trabajar las armas mágicas de cero».** Criterios nuevos:
el tier de un arma mágica se sopesa por su **efecto puesto en una balanza contra un arma física del mismo tier**; la diversidad del efecto «especial»
deja explorar muchas mecánicas; **la mayoría de rango**; según el arma, tira **PdG.Esp** o **PdG común** (la invocación de algo físico, como una lanza
de hielo), **contra Defensa**, **se resiste con Res.Esp** o va **directo menos su resistencia**; algunas no hacen daño sino efecto. **Objetivo: darle
algo para hacer a quien no pelea, aparte del casteo de sus habilidades.** Se arranca por lo más básico: **varitas elementales** (arcana y una por
elemento). Inquietudes abiertas (sin definir, «ayudame a pensar»): qué forma tiene cada una; si el daño directo a la vida suma el Ef.Esp (el
equivalente a la Fuerza del guerrero); y cómo se regula, si casi no hay defensa contra lo mágico. Lo de arriba (panorama, lluvia) queda como
material de consulta, no como decisión.

**2026-10-05 · Sin paridad (dueño): «con las armas especiales vamos a dejar de lado la paridad. Vamos a tener una variedad mucho más grande de cada
tier para poder explorar a fondo la versatilidad de mecánicas».** → no se mide cada arma especial contra una física del mismo tier; el tier da el
techo de potencia y la gracia está en la variedad. Primera tanda propuesta: **Comunes**, cada una con una mecánica distinta, combinando cinco ejes:
cómo acierta (PdG.Esp / PdG común / sin tirada) · qué lo frena (Evasión, Defensa, Res.Esp, Res. elemental, nada) · qué hace (daño, estado, forma
en el mapa, apoyo) · qué gasta (No2, cargas por combate, SP) · la forma (proyectil, flor, cono, línea, uno mismo, aliado).

| Nombre (borrador) | Qué hace |
|---|---|
| Varita arcana | Proyectil: PdG.Esp contra Evasión, 1d4 directo a la vida. 1 No2. La de referencia |
| Varita de escarcha | Lanza de hielo física: PdG común contra Evasión, 1d4 que resta Defensa y critica; 33 % Lento |
| Varita de estática | PdG.Esp contra Evasión, 1d3 directo; salta a uno al lado con la mitad |
| Varita de chispas | Flor de radio 1 a ≤ 4 casillas: 1 de daño de fuego a cada uno (resta Res. fuego). Sin tirada para acertar |
| Frasco de miasma | Sin daño: PdG.Esp contra Res.Esp; si entra, Veneno 2 |
| Silbato de ráfaga | Empuja 1 casillero (cono corto); Inamovible lo frena |
| Varita de lodo | 3 casillas de barro 2 turnos: quien entra queda Lento |
| Vara de destello | Flor sin daño: PdG.Esp contra Res.Esp; −2 PdG en su próximo ataque |
| Varita de bruma | Niebla de radio 1, 2 turnos |
| Varita de cuerdas | Atrapa: Inmovilizado 1 turno (se suelta con Fuerza contra 5) |
| Amuleto de la chispa vital | Cura 1d4 a un aliado al lado. 2 cargas por combate |
| Varita del amparo | Escudo especial 3 a un aliado, 1 turno. 2 cargas |
| Campanita de vigía | Revela lo que está en sigilo en radio 3 (tirada de Percepción con Ef.Esp) |
| Bastón zahorí | Marca a un rival: el próximo aliado que lo ataque, +1 PdG |
| Pipa de humo | Entrás en Sigilo sin pagar No2, una vez por combate |
| Varita de cargas | 3 disparos arcanos de 1d6 por combate, sin tirada de Especial (PdG común): la del que no es mago |

**2026-10-05 · Tipos y elementos (dueño):** asociar los Tipos (6, 8…) con elementos «me parece medio forzado» → **descartado**. En el daño que
**no es físico**, el dado **no tiene Tipo ni familia** (no es punzante, cortante, contundente…): «los dados van a ser dados». Solo lo **físico**
(una lanza de hielo, una piedra) sigue con su Tipo y lo que eso trae (Defensa, crítico, resistencias a crítico). (El dueño cortó la frase en «y se
van a contemplar como…»: falta completar.)

**2026-10-05 · Principios de las armas especiales (dueño, pensando en voz alta: «puedo estar equivocado, te estoy compartiendo ideas y nociones» — son nociones de trabajo, no decisiones cerradas):**
- **Cada arma, su mecánica propia; no hay una mecánica universal.** Cada una explica sus tiradas (para acertar, para evitarla o resistirla, si tiene).
- **Todas las opciones están abiertas.** Hay armas que **usa cualquiera**, sin importar su Especial, y armas que **rinden más con más Especial**.
- **Sin romper el juego:** si un arma es muy fuerte (porque suma el Especial), **gasta más No2 y más SP**. Hay armas que gastan SP y armas que no:
  algunas son **prácticamente un hechizo equipable**.
- **Propuesta del dueño (a confirmar):** las **varitas, a una mano**, con hechizos que **no suman el Especial** al efecto; los **báculos, a dos manos**,
  son los que **canalizan el Especial**.
- **Los No2 son el otro regulador:** una varita barata de daño directo, aunque sea poco, gastando 8 No2 en un turno puede terminar rota. Hay que
  equilibrar el efecto **por cada No2** que gasta y por cuántas veces se puede usar en un turno.
- **El rango ahorra No2 (dueño, 2026-10-05):** quien actúa a distancia no tiene que desplazarse, así que le quedan más No2 para actuar. **Todo lo
  pensado para hacerse a distancia debe cobrar No2 para compensar** que no se mueve. (Va en línea con lo de las armas de rango físicas del
  2026-09-25: «el rango vale mucho por sí mismo».)
- **Control de terreno (dueño, 2026-10-05):** varitas de crowd control, por ejemplo **una varita con el mismo efecto que una trampa**: **manchas de
  aceite** («puede ser muy divertido que un mago tire manchas de aceite, pum, pum, pum, que controle el terreno así»), con duración de **1 o 2
  turnos**. Lo que no se mide en daño es menos cuantificable para ponerle costo: se va de a poco.
- **Pedido del dueño:** ir anotando; cuando lo pida, **pasarle todas las conclusiones juntas en un gran mensaje**.
- **El rival puede esquivar (dueño, 2026-10-05):** un efecto de 1 No2 por uso no hace daño las 8 veces: el otro puede evitarlo. La chance de
  acertar va en la balanza. → la medida «efecto por turno» se calcula con la **chance de acertar** (con stats parejos, más o menos la mitad); lo que
  **no tiene tirada para acertar** (una flor que pega a todos) vale más por eso mismo.
- **Se equilibran solas, en parte (dueño, 2026-10-05):** el arma física **suma la Fuerza** (Dmg) pero **la frena la Defensa**; la varita **no suma el
  Especial** y **no la frena la Defensa** (solo se esquiva). «Puede ser que sea menos desparejo de lo que creía, siempre y cuando las varitas no
  sumen su Especial.» **Lo que tiene que ser caro es el daño directo que suma el Especial y no contempla armadura.** A confirmar con pruebas numéricas.
- **La tirada para acertar es siempre la especial (dueño, 2026-10-05, corrige lo de «PdG común»):** un arma especial tira **siempre PdG.Esp**;
  si lo que lanza es un **proyectil físico** (una lanza de hielo), el rival lo **esquiva con Evasión**. «Es una nota de color para imaginar las
  armas.» → En la tanda Común, la Varita de escarcha y la Varita de cargas pasan a tirar PdG.Esp.
- **Acertar depende del stat, como en lo físico (dueño, 2026-10-05):** igual que una espada rinde poco en alguien con poca Fuerza, un arma especial
  rinde poco en alguien con poco Especial. Está bien así.
- **Lo invocado físico tiene su Tipo por la forma (dueño, 2026-10-05):** una **aguja de hielo** es daño **físico Tipo 4**; un **piedrazo** invocado,
  **Tipo 8**. No es daño mágico: lo frena la Defensa, critica, y cuentan las resistencias a crítico.
- **El daño tóxico es su propia categoría (dueño, 2026-10-05):** el que se respira (como Pedos Tóxicos), y los venenos. **No es exactamente mágico**,
  pero **no contempla armadura** y **se resiste con Res.Esp**, la resistencia que da la **Constitución**: la identidad de la Constitución es resistir
  efectos físicos, y esto es un efecto físico gaseoso («la diferencia es muy sutil»). (Responde la segunda parte de P143: el tóxico se resiste con
  Res.Esp.) **Al tóxico no lo frena la Armadura mágica** (dueño, mismo día): solo la Res. tóxico. Hecho en el motor (zonas, duelo, trampas).
- **Las áreas se esquivan con dodge roll (dueño, 2026-10-05):** un efecto de área **sí se puede esquivar**: se tira Evasión, pero el dodge roll
  **cuesta No2**. Esquivar un área pesa más que una evasión normal: tenerlo en cuenta en la balanza (corrige «lo que no tiene tirada no se esquiva»:
  se esquiva, pero cuesta). Es lo que ya hace el motor con los hechizos de área (la fase de dodge del duelo).
- **El peso de cada daño (dueño, 2026-10-05):** el **tóxico** ignora la armadura física pero tiene **tirada de resistencia (Res.Esp), que todo el mundo
  tiene** → **pesa un poco menos** que los elementales y el arcano. Los **elementales** ignoran la armadura; sus resistencias de equipo existen pero
  son marginales. El **arcano es el que más vale**, sobre todo **si suma el Especial**: va muy directo a la vida una vez que pasa las tiradas.
  Orden de valor: arcano (con Especial) > arcano > elemental > tóxico.
- **Varitas y báculos (dueño, 2026-10-05, a nivel narrativo):** las **varitas, sin Especial**; los **báculos, con Especial**. Hay **báculos de una mano y
  de dos manos**, y báculos **híbridos** pensados para parrear, con algo defensivo (por ejemplo **bono al Bloqueo**, porque los magos suelen tener poca
  Fuerza).
- **Frenos para repetir: el dueño duda de su propio razonamiento y pide que se lo audite.** Idea nueva suya: las que **no suman Especial** quizás no
  necesitan un costo que sube con cada uso (su impacto es chico); en cambio **cuestan 2 No2 siempre**, en vez de 1, para cobrar que el rango deja
  muchos No2 libres.
- **El techo de cada calidad, a definir juntos:** buscar un valor numérico promedio de las armas físicas por calidad y alcanzarlo, en cada calidad
  de las especiales, con los distintos efectos. Referencia de la calculadora de armas (armas físicas ya rehechas, en sus puntos de valor, PC):
  Común 6 (de 2,3 a 9,6) · Buena 9 · Rara 13,7 · Excepcional 20,5 · Legendaria 30. 1 PC ≈ 1 punto de daño promedio por golpe.
- **Frenos (dueño, 2026-10-05):** **no** a las cargas ni a los usos por combate. **Por turno**, sí, si es una solución consistente. Otra opción suya:
  **un costo que sube, pero menos que en las armas**: el primer uso 1 No2, el segundo 2, el tercero 3. Y el **SP** como freno, pensado para los
  **efectos de control y terreno**.
- **Techo por calidad:** se trabaja con **Común, Buena y Rara**. Las Excepcionales y Legendarias son todas de antes del rework: se hacen todas juntas
  cuando terminen las Raras de todos los tipos.
- **Cerrado (dueño, 2026-10-05):** **varitas de daño: costo 1, 2, 3 No2**, sin importar el alcance (todas usan el **Rango de casteo**). **Varitas de
  control y terreno: sin límite por turno; el SP las limita** (se llevan mejor con magos con mucho SP, y está bien). Propuesta de Claude, a confirmar:
  que también paguen 1, 2, 3 en No2, así todas las varitas comparten la regla. **Báculos con Especial: costo que sube y SP.**
- **Calculadora** (`herramientas/calculadora_especiales.py`, 2026-10-05, tasas en borrador): mide el **efecto por turno** de cada arma especial contra el
  de las armas físicas rehechas de su calidad (Común 6,1 por turno · Buena 9,2 · Rara 13,7, con 7 No2 y 2 gastados en moverse). Primera corrida con los
  borradores Comunes: con 1-2-3 una varita da **3 usos por turno**, y la Varita arcana de 1d4 llega a **11,2 por turno: casi el doble que un arma física
  Común** (que con 5 No2 pega una vez). A discutir.
