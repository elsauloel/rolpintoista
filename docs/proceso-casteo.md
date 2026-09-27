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
| 3 | Resistencia por tipo y armadura mágica | decisión | ⬜ |
| 4 | Esquivar efectos de área | decisión | ⬜ |
| 5 | Nombres y vocabulario ("Mg", daño genérico) | decisión | ⬜ |
| 6 | Código: tipo de daño y daño recibido | implementación | ⬜ |
| 7 | Código: resistencias, armadura mágica y esquiva de área | implementación | ⬜ |
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
- **2c.** Sobre uno mismo o un aliado: **no tira nada** — mismo criterio que Recuperación, Estoicismo o Piel resistente: se activa
  directo. Única excepción: si la propia habilidad define una variable al azar (el ×2 de X de Rayo Mágico), que no es "tirar contra
  alguien".
- **2d.** Control mental: el casteador tira **PdG.Esp por defecto** contra el **Res.Mt** del objetivo, salvo que la habilidad puntual
  diga otra cosa (Control Mental hoy dice "Esp" a secas; se aclara al auditarla, no hace falta forzar el default).

**Entrega:** plantilla de la línea + regla por caso, en `reglas-casteo.md` §1.2. **Termina cuando:** hay un formato único que se puede aplicar a todas. ✅

## Paso 3 — Resistencia por tipo y armadura mágica ⬜
**Depende de:** 1. **Ya definido:** la armadura mágica debe ser **rara y escasa**.

**Decidir:**
- **3a.** Resistencia por tipo: ¿un stat por tipo (Res. fuego, Res. relámpago…) o uno general para todo lo elemental? Respuesta: ____
- **3b.** ¿De qué atributo derivan? ¿Cuánto reducen (fijo, %)? Respuesta: ____
- **3c.** Armadura mágica: ¿cuánto reduce el daño que ignora armadura (fijo, %)? Respuesta: ____
- **3d.** ¿Es lo mismo que el estado **Escudo mágico** (absorbe todo, incluso true damage) y la skill **Armadura Mágica** (reduce 50%, máx. 10)? ¿O tres cosas distintas? Respuesta: ____
- **3e.** ¿Qué tan rara: solo en ítems de tier alto? ¿en habilidades de clase? Respuesta: ____

**Entrega:** reglas en `reglas-casteo.md`. **Termina cuando:** se sabe cómo se calcula el daño de casteo que recibe alguien con resistencia y/o armadura mágica.

## Paso 4 — Esquivar efectos de área ⬜
**Ya definido:** el defensor puede **tirar Evasión para hacer un roll** de hasta **2 casilleros**; necesita **No2**; si se desplaza lo suficiente como para salir del área, esquiva.

**Decidir:**
- **4a.** "Tirar Evasión": ¿se tira contra algo (el PdG.Esp del casteador, un número fijo) o alcanza con tener No2 y salir del área? Respuesta: ____
- **4b.** Costo en No2 del roll. Respuesta: ____
- **4c.** ¿Se hace fuera del turno propio, como reacción? ¿Cuántas veces por ronda? Respuesta: ____
- **4d.** ¿Se puede con Inmovilizado, Rengo, Stun o sin No2? Respuesta: ____
- **4e.** ¿Y si el área es más grande que el desplazamiento (no puede salir)? ¿Recibe el efecto completo o la mitad? Respuesta: ____
- **4f.** ¿Se aplica también a las trampas de área? Respuesta: ____

**Entrega:** regla en `reglas-casteo.md` §1.3. **Termina cuando:** se puede resolver un área en la mesa sin dudas.

## Paso 5 — Nombres y vocabulario ⬜
**Decidir:**
- **5a.** Nombre del daño de casteo genérico ("plasma", "arcano", otro). Respuesta: ____
- **5b.** ✅ Respondida (dueño, 2026-09-27): sí, se renombra "Mg" a **"Esp"** — **PdG.Esp** / **Res.Esp**. Los ids **no** cambian (siguen `pdgmg` / `resmg`).
- **5c.** ¿"Hechizo" sigue siendo la palabra en las descripciones? Respuesta: ____

**Entrega:** glosario. **Termina cuando:** hay un vocabulario único para usar en todo lo nuevo.

## Paso 6 — Código: tipo de daño y daño recibido ⬜
**Depende de:** 1, 2 (y 5 si cambia nombres). **Hacer, en este orden y probando cada uno:**
1. Campo `tipoDanio` en habilidades de la ficha, invocaciones y creeps (con "tira: …" si se decidió el campo en 2e).
2. Que el daño recibido **no reste Defensa** cuando el tipo ignora armadura: mapa (`danioPj`, `danioCreep`, `resolverGolpe`), gm-tools, ficha ("tirar daño").
3. Tipo de daño en las **trampas** (`trampaDano`) y en el asistente de trampas.
4. Mostrar el tipo y "qué tira cada lado" en la Mesa y en la lupa 🔍.

**Termina cuando:** un rayo ignora la Defensa y una aguja de hielo no, en ficha, creeps y trampas, y la Mesa lo dice.

## Paso 7 — Código: resistencias, armadura mágica y esquiva de área ⬜
**Depende de:** 3 y 4, y del paso 6. Resistencia por tipo (stats, ítems, creeps, lupa), armadura mágica, y la reacción de esquivar un área en el mapa.

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
