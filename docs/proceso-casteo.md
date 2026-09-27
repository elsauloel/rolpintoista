# Proceso: reglas de casteo con SP — paso a paso

> **Tarea abierta, se hace por partes a lo largo de varias conversaciones.** Reglas ya definidas y mapa de lo que hay que revisar:
> [`reglas-casteo.md`](reglas-casteo.md). Decisión abierta: **P97** en [`preguntas-abiertas.md`](preguntas-abiertas.md). Lista general de tareas:
> [`pendientes.md`](pendientes.md).
>
> **Cómo se usa:** cada paso tiene un estado (⬜ sin empezar · 🟡 en curso · ✅ terminado), lo que hay que **decidir** (con espacio para
> escribir la respuesta), lo que **entrega** y cómo se sabe que **terminó**. Los pasos de decisión (1 a 5) van **antes** que los de código
> (6 a 8): no se toca código ni contenido hasta cerrar las decisiones que ese paso necesita. Al terminar un paso: cambiar el estado,
> copiar las decisiones a `reglas-casteo.md` y avisar en `pendientes.md`. **No cambiar contenido en masa**: un paso a la vez.
>
> Una conversación nueva que retome esto: leer este archivo, ir al primer paso que no esté ✅ y seguir desde ahí.

| # | Paso | Tipo | Estado |
|---|---|---|---|
| 0 | Alcance: qué es "casteo con SP" | decisión | ✅ 2026-09-21 |
| 1 | Tipos de daño de casteo | decisión | ✅ 2026-09-27 |
| 2 | Qué tira cada lado (formato de la descripción) | decisión | ✅ 2026-09-27 |
| 3 | Resistencia por tipo y armadura mágica | decisión | ✅ 2026-09-27 |
| 4 | Esquivar efectos de área | decisión | ✅ 2026-09-27 |
| 5 | Nombres y vocabulario ("Mg", daño genérico) | decisión | ✅ 2026-09-27 |
| 6 | Código: tipo de daño y daño recibido | implementación | ✅ 2026-09-27 (en su mayoría) |
| 7 | Código: armadura mágica y esquiva de área | implementación | 🟡 (armadura mágica lista, 2026-09-27) |
| 8 | Auditoría de contenido, por tandas | contenido | ⬜ |
| 9 | Manual | documentación | ⬜ |

---

## Paso 0 — Alcance ✅
**Definido (2026-09-21):** casteo con SP = todo lo que se castea y **no es un ataque con un arma**. No se llama "magia". Es **subjetivo y
narrativo**: lo decide la mesa; las reglas son la plataforma, no un corsé.

## Paso 1 — Tipos de daño de casteo ✅ 2026-09-27
**Depende de:** nada. **Ya definido:** el tipo decide si la armadura reduce el daño. Genérico, relámpago y fuego **ignoran** armadura; un
proyectil de casteo (aguja de hielo) la **respeta**.

**Decidido (2026-09-27):** no hace falta una lista cerrada de tipos — se simplificó a una regla general.
- **1a/1b.** No hay lista de tipos: **por defecto, todo daño de casteo ignora armadura**, sea cual sea el elemento. Eso responde 1a
  (no hace falta enumerarlos) y 1b (todos "sí", salvo la excepción de abajo).
- **1c.** Sí, un mismo elemento puede ser las dos cosas: lo que decide **no es el elemento, es cómo se narra la habilidad**. Si se
  describe como **un objeto físico arrojado** (aguja de hielo, piedra, dardo), respeta la armadura, igual que cualquier proyectil
  físico. Si se describe como energía/efecto (ráfaga de hielo, bola de fuego, rayo), ignora armadura. Se marca en el texto de la
  habilidad, no con un campo de tipo separado.
- **1d.** No: los críticos y las Resistencias a crítico (Tipo 4–12) **no aplican** al daño de casteo — son del sistema de armas. El
  casteo va a tener su propia resistencia por tipo en el Paso 3, no antes.
- **1e.** Depende de cada trampa, con la misma regla: por defecto ignora armadura, salvo que sea un mecanismo físico (una lanza, un
  peso que cae, una red con puntas), que sí la respeta.

**Entrega:** regla cerrada en `reglas-casteo.md` §1.1. **Termina cuando:** cada tipo tiene nombre y sí/no de armadura. ✅ (no hizo
falta una tabla de tipos: la regla general + la excepción del objeto físico cubre todos los casos).

## Paso 2 — Qué tira cada lado ✅ 2026-09-27
**Depende de:** 1. **Ya definido:** proyectil = PdG.Esp vs Evasión; efecto abstracto = PdG.Esp vs Res.Esp; mental = Res.Mt; debe estar en la descripción.

**Decidido (2026-09-27):**
- **2a/2e.** No es un campo de texto nuevo: cuando la habilidad ya usa el sistema de duelo (`duelo: {tira, contra}`, como Taunt), esa
  estructura **ya es** la respuesta — no hace falta duplicarla en texto. Para las que siguen sin auditar, alcanza con que la primera
  frase del `detalle` lo diga en criollo, mismo estilo que ya tiene Taunt: *"Tirás PdG.Esp contra el Res.Esp del objetivo."* Al auditar
  cada una, ese texto se reemplaza por (o se acompaña de) el campo real.
- **2b.** Habilidades mixtas (daño + debuff): **una sola tirada**, la de ataque/contraste principal; si conecta, el debuff se aplica
  solo, sin tirada aparte — salvo que la propia habilidad diga explícitamente lo contrario. Así ya funcionan las maldiciones del
  Debuffer: una tirada, **PdG.Esp vs Res.Esp**.
- **2c.** Sobre uno mismo o un aliado: **no hay tirada**, pero **sí se abre el cuadro de duelo** (sin oposición), visible a toda la
  mesa, directo en el paso de efectos, con su botón **«Aplicar»** — para que todos tengan tiempo de leer qué pasó, no una línea suelta
  en el log (pedido del dueño, 2026-09-27; ya construido, ver [`duelo-de-habilidades.md`](duelo-de-habilidades.md) §7). Única excepción
  a que no haya tirada: si la propia habilidad define una variable al azar (el ×2 de X de Rayo Mágico), que no es "tirar contra
  alguien".
- **2d.** Control mental: el casteador tira **PdG.Esp por defecto** contra el **Res.Mt** del objetivo, salvo que la habilidad puntual
  diga otra cosa (Control Mental hoy dice "Esp" a secas; se aclara al auditarla, no hace falta forzar el default).

**Entrega:** plantilla de la línea + regla por caso, en `reglas-casteo.md` §1.2. **Termina cuando:** hay un formato único que se puede aplicar a todas. ✅

## Paso 3 — Resistencia por tipo y armadura mágica ✅ 2026-09-27
**Depende de:** 1. **Ya definido:** la armadura mágica debe ser **rara y escasa**.

**Decidido (2026-09-27):**
- **3a.** **Uno general, no por elemento** — consistente con el Paso 1 (no hay lista de tipos, así que tampoco hace falta resistencia
  por tipo). Un solo stat nuevo: **Armadura mágica**.
- **3b.** **No deriva de ningún atributo** (arranca en 0 para todos, como la Defensa normal). Reduce el daño como **número fijo**, no
  un porcentaje — mismo mecanismo que la Defensa contra daño físico.
- **3c.** Ya respondido en 3b: número fijo, restado directo (no %).
- **3d.** **Son tres cosas distintas:** el estado **Escudo especial** (ex "Escudo mágico"; buffer temporal, absorbe cualquier daño,
  no cambia), la skill **"Armadura arcana"** del Mago (**renombrada 2026-09-27**, antes "Armadura Mágica" — para no chocar con el
  nombre del stat nuevo; sigue con su propia mecánica: −50 % máx. 10, refleja el daño al terminar) y la **Armadura mágica** (el stat
  nuevo de este paso).
- **3e.** Solo en **ítems de tier alto** (Raro en adelante), marcados a mano en el catálogo — no en equipo común ni de ninguna
  habilidad de clase por defecto (si alguna la diera, se decide caso por caso al auditarla).

**Entrega:** reglas en `reglas-casteo.md` §1.4. **Termina cuando:** se sabe cómo se calcula el daño de casteo que recibe alguien con resistencia y/o armadura mágica. ✅

## Paso 4 — Esquivar efectos de área ✅ 2026-09-27
**Ya definido:** el defensor puede **tirar Evasión para hacer un roll** de hasta **2 casilleros**; necesita **No2**; si se desplaza lo suficiente como para salir del área, esquiva.

**Decidido (2026-09-27):**
- **4a.** Primero el contraste de siempre: **PdG.Esp** (hechizo) o **PdG** (algo físico arrojado, una molotova) **contra la Evasión**
  de cada defensor — igual que un proyectil normal. **Recién si gana esa Evasión** gana el **derecho a un dodge roll** (moverse hasta
  2 casilleros); si pierde, no llega a esa opción.
- **4b.** **1 No2 por casillero** (hasta 2) — la regla de movimiento de siempre.
- **4c.** Sí, es una **reacción fuera de turno**, se resuelve en el momento del casteo. Sin límite explícito por ronda: lo frena el
  No2 disponible.
- **4d.** **Stun:** ya falla la Evasión directo → sin dodge roll. **Inmovilizado:** puede ganar la Evasión pero no puede moverse →
  se queda en el área. **Rengo:** puede moverse, pero el doble de No2 por casillero. **Sin No2 suficientes:** se mueve lo que pueda
  pagar.
- **4e.** **No hay término medio:** fuera del área del todo = nada; adentro por cualquier motivo = **efecto completo**, nunca mitad.
- **4f.** **Las trampas no se esquivan así** — sin Evasión ni dodge roll, el elemento sorpresa es la gracia de una trampa.

**Entrega:** regla en `reglas-casteo.md` §1.3. **Termina cuando:** se puede resolver un área en la mesa sin dudas. ✅

## Paso 5 — Nombres y vocabulario ✅ 2026-09-27
**Decidido:**
- **5a.** ✅ **"Arcano"** — ya es de hecho el nombre que usa el catálogo para "magia sin apellido" (Orbe arcano, Tormenta arcana,
  Ráfaga arcana, Armadura arcana): se cierra oficial, sin inventar un nombre nuevo ni renombrar nada existente.
- **5b.** ✅ Respondida (dueño, 2026-09-27): sí, se renombra "Mg" a **"Esp"** — **PdG.Esp** / **Res.Esp**. Los ids **no** cambian (siguen `pdgmg` / `resmg`).
- **5c.** "Hechizo" sigue siendo la palabra en las descripciones — no hubo objeción, se mantiene como está (a revisar si en algún
  momento hace falta otro término).

**Entrega:** glosario. **Termina cuando:** hay un vocabulario único para usar en todo lo nuevo. ✅ Los 5 pasos de decisión están
cerrados — sigue el Paso 6 (implementación).

## Paso 6 — Código: tipo de daño y daño recibido ✅ (en su mayoría) 2026-09-27
**Sorpresa al retomarlo:** el sistema de **"Duelo de habilidades dirigidas"** (`comun/duelo.js` + `comun/asistente-duelo-hab.js`,
construido el mismo día en otra conversación, ver `docs/duelo-de-habilidades.md`) ya hacía casi todo esto, aunque no se armó
pensando en este paso puntual:
1. ✅ **Campo de tipo de daño** — el 🎯 de cada habilidad (ficha y creeps de gm-tools) ya tiene un selector Arcano/Fuego/Hielo/Rayo/Físico
   (`AsistenteDueloHab`, guarda `habilidad.duelo.tipoDano`). **Corregido hoy:** el selector ataba el tipo a "ignora armadura" siempre
   (Hielo = ignora siempre) — se agregó un tilde **independiente** "Ignora la Defensa" (arranca según el tipo, se puede destildar a
   mano para la excepción del Paso 1: un objeto físico arrojado, aunque sea "Hielo", no ignora). `habDueloDe` (ficha) y
   `habDueloCreep` (gm-tools) ahora leen ese tilde en vez de inferirlo siempre del tipo.
2. ✅ **El daño no resta Defensa cuando ignora armadura** — ya lo hacía `dueloAplicarDano` en el mapa (lee `d.hab.dano.ignoraDef`).
   `danioPj`/`danioCreep` ya aceptan un parámetro `ignoraDef` de antes (lo usan crítico y Rayo en cadena); el modo manual **"2 · HP
   directo"** del HUD sigue siendo la salida para cualquier caso que no pase por el duelo (no hizo falta agregar un tilde nuevo ahí).
3. ✅ **Trampas** — ya tenían su propio tilde independiente "¿Contempla la armadura?" (`ignoraDef` en `trampaColocar`/`AsistenteTrampa`),
   sin depender de ningún tipo — ya cumplía la regla del Paso 1 antes de que se cerrara.
4. ✅ **Se muestra en la Mesa** — el resumen final del duelo ya dice "Daño arcano: … directo a la vida" (`lineasResumen`, `comun/duelo.js`).
   **Pendiente, menor:** la lupa 🔍 de una habilidad no menciona el tipo de daño (solo costo y qué tira) — bajo impacto, se puede sumar
   cuando se retome contenido, no bloquea nada.

**Termina cuando:** un rayo ignora la Defensa y una aguja de hielo no, en ficha, creeps y trampas, y la Mesa lo dice. ✅ Con el tilde
independiente ya está — solo falta la lupa (menor, no bloquea el Paso 7).

## Paso 7 — Código: armadura mágica y esquiva de área 🟡
**Depende de:** 3 y 4, y del paso 6. El Paso 3 aclaró que no hace falta resistencia por tipo (3a: un solo stat general) — este paso es
"Armadura mágica" (stat nuevo) y la reacción de esquivar un área en el mapa.

**Hecho (2026-09-27) — Armadura mágica:**
- Stat nuevo `armadmg` ("Armadura mágica"), igual de fijo que Defensa y sin fórmula de atributo (arranca en 0): en la ficha
  (`EXTRA`/`STAT_LIST`, se computa solo por `compute()` como cualquier otro stat de `EXTRA`) y en los creeps de gm-tools
  (`sc.armadmg`, `creepArmadmgEfectiva`, campo editable junto a Defensa en la ficha del creep y en Acciones).
- Se puede dar como bono de ítem desde el asistente compartido (`comun/asistente-item.js`, paso "Bonos": aparece como acceso
  rápido en Defensa y como "+ Otro stat" en cualquier categoría) — así se cumple 3e (a mano, en ítems Raro o mejor; el código
  no lo impone, solo lo permite).
- La ficha publica `resumen.armadmg`; el mapa la usa en `danioPj`/`danioCreep` (parámetro nuevo `restaIgnorando`, antes se
  restaba directo `0`) **solo** en el daño de casteo real (`dueloAplicarDano`, cuando `hab.dano.ignoraDef` — Paso 6): un
  crítico real, una trampa que ignora la Defensa, el fuego de terreno y el Rayo en cadena **siguen ignorando la Defensa
  entera**, sin tocar — la Armadura mágica es específicamente la resistencia al daño de casteo del Paso 1, no un "ignora
  ignorar" general (decisión tomada al implementar, no estaba explícita en 3a-3e; si la mesa quiere que también frene
  crítico/trampas/fuego, es una pregunta nueva, no una corrección de esto).
- La Mesa muestra la Armadura mágica restada en vez de "Defensa 0" cuando el daño de casteo la resta.

**Falta:** la reacción de esquivar un área (Paso 4: tirada de Evasión → dodge roll de hasta 2 casilleros) todavía no tiene
código — es una función interactiva aparte (nueva fase del duelo, costo en No2, Rengo/Stun/Inmovilizado), pensada como su
propia pasada de trabajo.

## Paso 8 — Auditoría de contenido, por tandas ⬜
**Depende de:** 1, 2 y 6. Una tanda a la vez, revisando skill por skill (nada masivo):
- [ ] 8.1 Skills de clase (`comun/skills-clase.js`): 13 de 62 tocan casteo.
- [ ] 8.2 Habilidades de creeps (`comun/skills-creep-base.js`): las de daño de casteo, los debuffs y las 57 con estado automático.
- [ ] 8.3 Creeps base (`comun/creeps-base.js`): roles mágico, apoyo y debuffer.
- [ ] 8.4 Armas naturales: los tipos elemental, mágico y ácido.
- [ ] 8.5 Trampas base (`comun/trampas-base.js`): tipo de daño de cada una.
- [ ] 8.6 Catálogo (`datos/catalogo.json`, por el editor): ~60 ítems con Res.Esp, PdG.Esp o Rango de casteo, bastones, consumibles de casteo, los que mencionan fuego/rayo/arcano.
- [ ] 8.7 Pasivas y estados (`pasivas.js`, `ESTADOS_PRESET`).

## Paso 9 — Manual ⬜
Nota nueva de "Casteo con SP" (`manual-usuario/notas`) y ajustes en Especial, Resistencias, estados, habilidades, glosario (notas 03, 07, 08, 09, 11, 12).
