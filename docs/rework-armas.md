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
4. 🟡 **¿Cuántos efectos distintos habrá y cuáles?** *(en curso: ver "Elaboración de efectos")* *Propuesta:* los de la guía (Rompe armadura, Knockdown, Aturdir, Lisiado, Sangrado, Envenenar, Derribar, Agarrar, Prende fuego, Drena vida) + un puñado de "modificadores" (Ignora N de Res. crítico, Ignora armadura, Crítico frecuente/potente). Repartirlos parejo: hoy uno solo (Rompe armadura) está en 13 % de las armas.
5. ⬜ **¿Cuántos efectos lleva un arma según su tier?** *Propuesta:* Común 0 (algunas 1) · Buena calidad 0–1 · Raro 1 · Excepcional 1–2 · Legendario 2–3.
6. ⬜ **¿Con qué probabilidad se aplican?** *Propuesta:* Común/Buena 25 % · Raro 50 % · Excepcional 75 % · Legendario 100 % (o efectos extra del 100 %). Se tira con moneda/d4 como hoy.
7. ⬜ **¿Qué peso tiene cada efecto para valorizar el arma?** *Propuesta (escala 1 a 5, provisoria):* Aturdir 5 · Rompe armadura 4 · Knockdown 4 · Drena vida 4 · Lisiado 3 · Sangrado 3 · Envenenar 3 · Agarrar 3 · Prende fuego 3 · Derribar 2 · Ignora 1 de Res. crítico 2. Se multiplica por un factor según sea **de casa** (×1), **habilitado** (×1,25) o **excepcional** (×1,5) para la familia.

### C · Valorización, tier y precio (P112)
8. ⬜ **¿Cuáles son los ingredientes del puntaje de calidad?** *Propuesta:* daño esperado (dados del Tipo × Peso) + bonos (PdG, Parry, Bloqueo, Dmg…) + Σ(peso del efecto × probabilidad) + Crítico frecuente/potente + costo en Nitros del ataque (más caro = menos puntaje) − peso del arma (relevancia intermedia).
9. ⬜ **¿El tier lo determina el puntaje o se elige aparte?** *Propuesta:* lo determina el puntaje por **umbrales** (Común < Buena < Raro < Excepcional < Legendario), y solo se rompe la regla a propósito (ítems únicos, sets).
10. ⬜ **¿Qué precio corresponde a cada tier?** *Propuesta:* mantener los rangos actuales como ancla (Común ~60, Buena ~100, Raro ~210, Excepcional ~680, Legendario ~1400) y que el precio salga del puntaje dentro de cada rango.

### D · Contenido a preservar y sets
11. ⬜ **¿Qué armas del catálogo actual se conservan conceptualmente?** *Propuesta:* el asistente arma una **hoja con las 137 armas** (nombre, tier, Tipo, efectos) y vos marcás **conservar / reajustar / descartar**.
12. ⬜ **Sets (ej.: Martín Fierro completo).** ¿Cuántas piezas tiene un set y qué bonus da tener **el set completo** (o 2 de 3)? *Propuesta:* sets de 3 a 5 piezas (arma + 2–4 de defensa), con un estado extra al tenerlas todas equipadas. **Ojo:** hoy el juego no tiene bonus de set; habría que construirlo.

### F · Preguntas nuevas que aparecieron al responder
14. ⬜ **Diseño de las armas de rango** (arcos, ballestas, armas de fuego): todavía no se discutió su criterio de diseño (Rango, munición, Nitros, crítico, efectos). Por ahora se rellenan sobre la marcha con lo que surja y se espera **reworkearlas específicamente después**. *Propuesta:* dedicarles una tanda propia cuando terminen las familias cuerpo a cuerpo.
15. ⬜ **Peso de usar las dos manos:** ¿cuánto vale en el puntaje de calidad que un arma ocupe las dos manos? El dueño aclaró que **de por sí es más poderosa** (a cambio invalida una mano, o sea que resta posibilidades de acción: escudo, segunda arma, accesorio). *Propuesta:* darle a las de dos manos un **bono al puntaje** (más Peso de dados o un efecto extra sin subir el precio proporcionalmente) y evaluar qué cuesta perder la mano libre.

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
