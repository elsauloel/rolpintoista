# Rework de creeps y de sus skills — hoja de trabajo (2026-09-26)

> Misma mecánica que `rework-armas.md`: el asistente **relevó, propone y pregunta**; el dueño responde y audita; todo queda escrito para retomarlo desde otra conversación.
> Pedidos del dueño que lo motivan: (1) **coordinar el equipo con las skills de los creeps**; (2) que **armas, armaduras y creeps sean un ejemplo de la diversidad de mecánicas del juego** (ver [`sondeo-mecanicas.md`](sondeo-mecanicas.md)); (3) *"Volver a pensar los creeps: a partir de cierto nivel, a medida que suben, sube la calidad de sus equipos y también tienen mayor diversidad de skills, incluso habilidades pasivas"* (log **A desarrollar**); (4) auditar las trampas de las habilidades de creep (`ignoraDef`).
> Código: `comun/creeps-base.js` (173 creeps base), `comun/skills-creep-base.js` (321 habilidades), `comun/armas-naturales-base.js` (66 armas naturales), `comun/trampas-base.js`.

## 1. Diagnóstico (relevado del código real)
| Dato | Hoy |
|---|---|
| Creeps base | **173**, niveles **1 a 5** (32 · 37 · 39 · 34 · 31) |
| Habilidades por creep | **exactamente 2 en todos los niveles** (una rápida y una lenta). **Sin pasivas** (0). |
| Equipo por creep | **0 a 0,3 ítems** de media; no crece con el nivel |
| Efectos en el arma | 0–0,09 por creep; casi ningún creep pega con un efecto |
| Tipo de arma | T6 77 · T4 36 · T8 31 · T10 29 · **ninguno de rango ni T12** |
| Habilidades base | **321**: daño 100 · debuff 78 · buff 71 · control 52 · defensa 40 · área 35 · curación 22 · movilidad 18 · invocación 10 |
| Con parte **a mano** | **166 de 321** (52 %): el efecto sobre otros queda escrito y el GM lo resuelve |
| Mecánica que usan | estados alterados 78 · trampas 27 · sigilo 22 · terreno y formas 18 · niebla y visión 11 · aura 9 · jefe 9 · percepción 7 · orientación 6 · iniciativa 6 · movimiento 4 · botín 4 |
| Por rol | debuffer 104 · asalto 74 · melee 70 · tanque 66 · mágico 64 · apoyo 32 · rango 27 |
| Crítico | 27 creeps con `crit` cargado (el modelo viejo) |
**Lectura:** un creep de nivel 5 es, en riqueza, igual a uno de nivel 1 con más HP. No hay progresión de diversidad ni de equipo, y las mecánicas nuevas de esta etapa casi no aparecen (menciones en textos, **no** automatizadas): Excedente de vida **0**, Miedo **0**, portales/teleport **1**, Escarcha ~10 (casi todas a mano), Demora/iniciativa ~5.

## 2. Principios (todos ya decididos por el dueño en otras conversaciones)
- **Las skills automatizan lo que se puede y aclaran lo que no** (⚙ / ✋). Hoy 52 % tiene parte a mano: bajarlo es un objetivo.
- **El daño mágico no critica y va directo a la vida** (por eso es caro); solo critica lo físico. Elementos: arcano, fuego, hielo, rayo. Escarcha / Parálisis con **probabilidad**.
- **Los Nitros y el Movimiento pesan mucho** (−1 Mov = −1 Nitro): una skill barata en Nitros es de calidad baja.
- **La palabra «trampa» es solo para colocar trampas reales.**
- **Sandbox:** todo es sugerencia; el GM edita cualquier número.

## 3. Propuesta A — progresión por nivel (a decidir)
| Nivel | Habilidades | Pasivas | Equipo (calidad) | Efecto en el arma |
|---|---|---|---|---|
| **1** | 2 (rápida + lenta) | 0 | ninguno | — |
| **2** | 2 | 0 | 0–1 (Común) | — |
| **3** | 3 (+1 **mecánica firma**) | 1 | 1 (Buena) | 25 % de un efecto de su familia |
| **4** | 3 | 1–2 | 1–2 (Raro) | 33 % o 2 efectos |
| **5** | 4 | 2 | 2 (Raro–Excepcional) | efectos + Crítico (solo físicas) |
| **Jefe** | +1 skill y +1 pasiva sobre su nivel | | +1 tier | |
Cada creep suelta de **botín** lo que lleva puesto (coordinado con `rework-armas.md`: el arma de un creep de Tipo 8 es del catálogo de hachas, etc.).

## 4. Propuesta B — «mecánica firma» por familia de criatura
Cada familia se **identifica por 1–2 mecánicas de la matriz** que hoy le faltan (así los creeps enseñan las mecánicas del juego):
| Familia | Mecánicas firma propuestas |
|---|---|
| Bestias | Sangrado, Empuje/embestida, Sigilo natural, Crítico frecuente (garras) |
| Humanos / bandidos | Trampas (minas, redes), Robar, Marca (ignorar Defensa), Iniciativa (Demora / subir lugar) |
| Humanoides tribales (kobolds, goblins) | Trampas, Portales de escape, Aura de valor |
| No-muertos | Drenar vida + **Excedente de vida**, Miedo, Sombra, Aura de pestilencia |
| Elementales | **Fuego** (terreno incendiado), **Hielo** (Escarcha acumulable), **Rayo** (cadena + Parálisis) |
| Plantas | Terreno y formas (muros de raíces, baba), Veneno, Regeneración |
| Constructos | Escudo / Excedente, Reflejar (espinas), Inmunidades |
| Alienígenas | **Portales y teleport**, Luz/visión (ceguera), Copiar / Espejo, Arcano |

## 5. Propuesta C — primera tanda de skills nuevas (ideas, cada una usa una mecánica hoy vacía)
| Skill | Mecánica | Qué hace (⚙ automatizado / ✋ a mano) |
|---|---|---|
| **Aliento helado** | Hielo · cono | Daño mágico directo en cono de 3; 33 % de 1 stack de Escarcha ⚙ |
| **Descarga en cadena** | Rayo | Rayo que salta hasta 3 casillas entre objetivos, mitad de daño por salto; 15 % de Parálisis ⚙ (rayo en cadena ya existe) |
| **Bola de brasas** | Fuego · terreno | Flor de radio 1 de terreno incendiado 3 turnos (daña al entrar) ⚙ |
| **Rastro de llamas** | Fuego · movimiento | Deja fuego en las casillas por donde pasa ⚙ / ✋ |
| **Salto de sombra** | Teleport | Se teletransporta a una casilla libre a ≤ 4 ⚙ |
| **Portal gemelo** (jefes) | Portales | Abre dos portales aliados durante 2 turnos ⚙ (portales aliados ya existen) |
| **Grito que retrasa** | Iniciativa | 50 % de bajar 1 lugar en la tabla de iniciativa al golpeado ⚙ |
| **Ritmo frenético** | Iniciativa | Se sube 1 lugar en la tabla ⚙ |
| **Muro de raíces** | Terreno | 3 casillas que bloquean paso y vista 2 turnos ⚙ |
| **Baba pegajosa** | Terreno + estado | Zona que deja Rengo (Mov a la mitad) mientras estén dentro ⚙ / ✋ |
| **Ceguera** | Luz y visión | −2 al campo de visión del objetivo 2 turnos (stat `vision`) ⚙ |
| **Olfato agudo** | Ver lo oculto | El creep detecta a los que están en sigilo cerca ✋ (su visión aún no lee `veoculto`) |
| **Absorber vida** | Drena + Excedente | Daño y se cura su mitad como Excedente de vida ⚙ |
| **Escudo de escamas** | Excedente | Gana 20 HP de Excedente (sin recarga) ⚙ |
| **Golpe certero** | Crítico (físico) | Su próximo ataque tiene Crítico frecuente +1 ⚙ |
| **Marcar presa** | Marca | El próximo aliado que golpee al marcado ignora 1 de Defensa ⚙ |
| **Embestida** | Empuje/colisión | Empuja 2 casillas; si choca, daño físico ✋ (mover fichas a mano) |
| **Sembrar minas** | Trampas | Coloca 2 trampas en flor de radio 1 (se colocan solas) ⚙ |
| **Rugido aterrador** | Miedo | Hace huir al objetivo — **requiere definir el estado Miedo** (ver preguntas) |
| **Hurtar** | Robar | Roba una unidad de un consumible del cinturón ✋ |
**Pasivas nuevas para creeps** (hoy no hay ninguna): Piel dura (+1 Res. crítico), Regeneración (2 HP por turno), Vista aguda (+1 Visión), Sigilo natural, Espinas (1), Cazador (Crítico frecuente +1 en armas T6), Cortafuegos / Aislante (resistencia elemental), Sed de sangre (Excedente al matar).

## 6. Método de trabajo (igual que armas)
1. **Vos respondés las preguntas** de abajo (o las que quieras).
2. Yo armo una **herramienta de auditoría de creeps** (lista con ✅ 🔧 🔄 🗑 y notas, como la de armas y defensa) y la primera **tanda: los 32 creeps de nivel 1 a 2 de una familia** con sus skills/pasivas/equipo según lo decidido.
3. **Auditás por partes**; yo aplico lo confirmado a `comun/creeps-base.js` / `skills-creep-base.js` y regenero.
4. En paralelo: (a) **automatizar las 166 skills con parte a mano** que se puedan; (b) **auditar las 27 trampas de skills** (`ignoraDef` según físico/mágico, fuego amigo); (c) pasar los 27 creeps con `crit` al modelo nuevo (Crítico frecuente/potente, solo físicos).

## 7. Preguntas para el dueño
1. **Progresión (Propuesta A):** ¿te cierra la tabla (skills 2→4, pasivas desde el nivel 3, equipo por tier)? ¿O más chico/más grande?
2. **Mecánica firma (Propuesta B):** ¿te cierran las familias ↔ mecánicas? ¿Qué le cambiarías?
3. **Miedo:** hoy no existe el estado. ¿Lo definimos (el objetivo tiene que alejarse de quien lo asustó, o pierde su próxima acción de ataque…) o lo dejamos afuera por ahora?
4. **Resistencias elementales de los creeps:** ¿los creeps de fuego / hielo / rayo son inmunes o resistentes a su elemento y vulnerables al opuesto? (Depende de lo que decidas para el equipo, ver `sondeo-mecanicas.md` §2.)
5. **Pasivas de creep:** ¿las eligen por familia (como las de arriba) o las carga el GM una por una desde la biblioteca de pasivas?
6. **Por dónde empezamos la tanda 1:** ¿los **elementales** (fuego, hielo, rayo: prueban lo nuevo), los **no-muertos** (Excedente/drenar) o los **kobolds y goblins** (trampas y portales)? Yo empezaría por los **elementales**.
7. **Creeps de rango y explosivos:** hoy ninguno lleva arma de rango ni T12. ¿Los sumamos cuando cerremos esas familias de armas, o antes?

## 8. Regla de atributos (pedido del dueño, 2026-09-26)
Dueño: *«asegurate de que tengan distribuidos todos los puntos de stat correspondientes a su nivel»*. La regla (manual y gm-tools): **33 + 3 por nivel sobre 1** puntos entre Con, Fue, Agi, Des y Esp (nivel 1 = 33 · nivel 5 = 45), y **HP = Con × 5**. **Verificado sobre los 173 creeps base: los 173 suman exactamente su presupuesto y su HP coincide** (0 diferencias). 11 tienen algún atributo por debajo de 3 (a propósito: los creeps «arrancan en 1»). Para no perderlo en el rework: `CreepsBaseUtil.verificarPresupuesto()` (`comun/creeps-base.js`) devuelve los que no cumplan; la herramienta de auditoría de creeps lo va a correr, y **todo creep nuevo o editado en las tandas tiene que pasar ese chequeo**. Los **creeps que el GM ya cargó en su mesa** (Firestore) no se pueden revisar desde acá: si querés, el GM puede correr el chequeo sobre ellos desde gm-tools cuando lo cablee a un botón.

## 9. Ampliación del catálogo de creeps por facción (2026-09-26, pedido del dueño)
Dueño: *«amplía el catálogo de creeps por facción: goblins del bosque, con al menos dos opciones de cada rol; kobolds de montaña o de las minas, también; diversificá; y creá un universo de insectos»*. **+61 creeps (173 → 234)**, todos en `comun/creeps-base.js` (sección «AMPLIACIÓN DE FACCIONES»), todos «(auditar)», con presupuesto de atributos verificado (`verificarPresupuesto()` = 0 diferencias en los 234) y nombres/ids únicos:
- **Goblins del bosque (+12):** apoyo (Cocinero de sopa, Portaestandarte, Curandero de la ciénaga), mágico (Aprendiz de brujo, Adivino de huesos, Invocador de luciérnagas), tanque (Barricada, Coraza de tortuga), debuffer (Escupidor de ají), melee (Leñador, Cazador de jabalíes) y asalto (Sombra del bosque). Ahora **cada rol tiene 4 a 6 goblins**.
- **Kobolds de las minas (+6):** debuffer (Soltador de murciélagos, Envenenador de galerías, Susurrador) y mágico (Aprendiz de dragón, Del cristal resonante, Ígneo de las profundidades). Cada rol tiene ≥ 3.
- **Kobolds de las cumbres (+14, nueva facción «kobold de montaña», escenario montañas):** **2 de cada rol** (Picacumbres y Guerrero de escarcha, Escudo de roca y Guardián del glaciar, Saltarrocas y Acechador de nieve, Hondero de riscos y Arquero del viento, Curandero de nieve y Anciano de la cumbre, Soplanieve y Tejedor de ventiscas, Chamán de la tormenta y Vidente del hielo). Usan Escarcha, Cegado, Sigilo, Regeneración, Espinas.
- **Colmena de insectos (+29, etiquetas `insecto` y `colmena`, tipo bestia):** 4 a 5 de cada rol, de nivel 1 a 5. Melee: Hormiga soldado, Escarabajo cornudo, Mantis religiosa, Escarabajo Hércules · Tanque: Escarabajo pelotero, Cucaracha acorazada, Ciempiés blindado, Escarabajo titán · Asalto: Grillo saltarín, Libélula veloz, Avispa cazadora, Avispón gigante · Rango: Hormiga escupidora (ácido), Abeja lanzadora, Escarabajo bombardero, Escorpión de cola larga · Mágico: Luciérnaga chispeante, Polilla de polvo hipnótico, Cigarra de tormenta, Mantis oracular · Apoyo: Abeja obrera, Hormiga cuidadora, Abeja curandera de miel, Zángano de la reina · Debuffer: Mosquito chupasangre, Mosca de la peste, Araña tejedora, Termita corroedora, Avispa parásita. Cada uno con un **trofeo especial** propio (mandíbula, aguijón, glándula, seda…). Ya existían algunos bichos sueltos (Escarabajo de cobre, Gusano de roca, Araña de cavernas, Larva psíquica); no se tocaron.
Mecánicas que usan: Veneno / Veneno severo, Sangrado, Corroído, Armadura rota, Oxidado, Podrido, Exhausto, Rengo, Stun, Pajaritos, Cegado, Escarcha, Descarga, Quemado, Maldito, Susurros, Sigilo, Regeneración, Espinas, Blindado, Inmunidad a CC, Hypeado, Afortunado y trampas (Nido de arena, Telaraña oculta, Pozo de estacas, Rastro de ácido). *Pendiente:* pasarlos por la auditoría de creeps del rework (§6) y darles las mecánicas nuevas (Excedente, portales, terreno…) cuando decidas la progresión.

## 10. Respuestas del dueño (2026-09-26)
1. **Progresión por nivel (Propuesta A): ✅ aprobada.**
2. **Mecánica firma por familia (Propuesta B): ✅ aprobada.**
3. **Miedo: ✅ se define.** Estado nuevo **Miedo** (debuff, **2 turnos**, control): **−2 PdG y −2 Daño** mientras dure y **no puede acercarse voluntariamente a quien lo asustó** (✋ a mano; si termina su turno más cerca de la fuente pierde 1 No2). Lo reducen la resistencia a CC y la Inmunidad a CC. Ya está en los presets de la ficha, de gm-tools y de `estados-aplicar.js`.
4. **Resistencias elementales de los creeps: ✅ aprobado** (los creeps de fuego / hielo / rayo resisten su elemento y son vulnerables al opuesto). Sigue pendiente el mecanismo concreto en el equipo (ver `sondeo-mecanicas.md` §2).
5. **Pasivas por familia:** el dueño no entendió la pregunta; se reformula en la conversación (¿las pasivas de creep vienen incluidas según la familia, o las elige el GM una por una?).
6/7. **Antes de los creeps se cerraron las armas de rango y de explosivos** (ver `rework-armas.md`, «Cierre de armas de rango y explosivos»), para poder darles equipo de esas familias a los creeps.

## 11. Pasivas por familia — opción A aprobada; herramienta de auditoría y tanda 1 (2026-09-26)
Dueño: *«Opción A está bien»* → **cada familia de criatura trae sus pasivas ya cargadas; el GM las puede sacar o cambiar** como cualquier estado.
**Hecho (todo en `comun/creeps-base.js`):**
- **Pasivas por familia** (`PASIVAS_FAMILIA` + `aplicarProgresion()`): un creep de **nivel 3** trae **1 pasiva**, **nivel 4** trae **1 (otra)**, **nivel 5 trae 2** y el **jefe +1**. Son **estados permanentes** con `pasiva: true` en `datos.estados` (Piel gruesa, Instinto de manada, Reflejos de presa · Entrenamiento, Curtido, Sangre fría · Astucia, Tozudez, Mala leche · Corteza, Savia (+1 HP por turno), Raíces profundas · Núcleo estable, Poder desbordante, Aura elemental · Huesos duros, Frío sepulcral, Sed de sangre · Blindaje, Sin nervios, Mecanismo preciso · Mente ajena, Fisiología rara, Adaptación). Cada una da un bono chico (+1) a Defensa, Daño, Evasión, PdG, Res.Mt o Res.Mg. La elegida sale del nombre del creep (siempre la misma). **Ya las tienen los 149 creeps de nivel 3 a 5.**
- **Elementales (tanda 1, +21 creeps):** fuego (Chispa ígnea, Llama viva, Salamandra de brasas, Brasero errante, Mago de ceniza, Arquero de magma, Fénix menor), hielo (Duende de escarcha, Golem de hielo, Oso de nieve, Susurro de nieve, Bruja de las nevadas, Arquero de carámbanos, Anciano de la glaciación) y rayo (Chispita eléctrica, Golem de cobre, Coraza pararrayos, Nube de estática, Chamán del rayo, Arquero de tormenta, Espíritu de la tormenta): **uno de cada rol por elemento**, niveles 1 a 5, con trofeo propio. Desde el **nivel 3 llevan una TERCERA habilidad** (la mecánica firma): **Rastro de llamas** (fuego, terreno incendiado ✋), **Escarcha acumulada** (hielo) o **Estática** (rayo, 15 % de Parálisis). El resto de las familias todavía tiene 2 habilidades: sus terceras salen en las próximas tandas. **Total de creeps base: 255** (0 diferencias de presupuesto de atributos).
- **Herramienta `datos/auditoria-creeps.html`** (menú ☰ → 👹 Auditoría de creeps): lista los 255 creeps con atributos (y si cumplen su presupuesto), HP, Defensa, arma, habilidades, pasivas y equipo; botones ✅ 🔧 🔄 🗑 + notas (guarda en `datos/auditoria-creeps.json`), filtros por familia, nivel, con pasivas, con tercera habilidad, jefes y con presupuesto mal; lo marcado pasa al final de la lista.
**Falta (próximas tandas):** terceras habilidades y mecánica firma para el resto de las familias; equipo y efectos de arma por nivel (armas del catálogo rework); las skills de la Propuesta C que dependen de mecánicas nuevas (portales, Excedente, Miedo, marcas); automatizar las 166 skills con parte a mano; auditar las trampas de skills; pasar los 27 creeps con `crit` al modelo nuevo.

## 12. Equipo de humanos y humanoides por nivel (2026-09-26, pedido del dueño)
Dueño: *«que los humanos y humanoides tengan equipo: nivel 1 un arma y una armadura siempre Comunes; nivel 2 un arma y dos ítems defensivos, común y en la mitad de los casos uno de Buena Calidad; nivel 3, una o dos armas… una escala de cantidad y calidad por nivel; y aplicárselo a todos los creeps que cumplan»*.
**Escala aplicada** (`herramientas/generar_equipo_creeps.py` vuelca la tabla del catálogo y la lógica dentro de `comun/creeps-base.js`, entre `/*EQUIPO_CREEP:INICIO*/` y `/*EQUIPO_CREEP:FIN*/`; se vuelve a correr si cambia el catálogo):
| Nivel | Armas | Ítems defensivos | Calidad |
|---|---|---|---|
| 1 | 1 | 1 | todo **Común** |
| 2 | 1 (la temática que ya traía) | 2 | Común; **~la mitad** con uno de **Buena Calidad** |
| 3 | 1 o 2 | 2 o 3 | Buena (algún Común) |
| 4 | 1 o 2 | 3 | Buena; ~la mitad con uno **Raro** (arma principal Raro o Buena) |
| 5 | 1 o 2 | 3 a 5 | Raro; ~1/3 con **Excepcional** |
| Jefe | +1 tier en cada ítem y +1 ítem defensivo |||
- **A quién:** los **150 creeps** de tipo **humano** (38) y **humanoide** (112). Los lanzadores (mágico, apoyo, debuffer) conservan su foco como arma y reciben solo ítems defensivos. Las piezas salen del **catálogo** (lo rework incluido) y se eligen **siempre las mismas para cada creep** (por su nombre).
- **Armas:** hasta el nivel 2 conservan el arma temática que ya tenían; desde el 3 toman una del catálogo **con el mismo Tipo de dado** (no cambia el costo de sus ataques) y de rango si ya eran de rango; la 2.ª arma va en el equipo (los de dos manos o de rango no la llevan). **Defensivos:** torso, cabeza, piernas, manos, pies y, si queda una mano libre, escudo (los tanques casi siempre). Las **resistencias a crítico** de las piezas se suman (tope +3 por Tipo) y la **Defensa del creep** pasa a ser **la mayor entre la que ya tenía y la suma de su equipo** (no se apilan: si no, quedarían casi inmunes). Promedios resultantes de Defensa: N1 0,7 · N2 4,7 · N3 4,5 · N4 9,3 · N5 15,7 (jefes hasta 31).
- **Habilidades con dos tiradas:** revisadas todas las de los creeps: **291 tienen stat + fórmula** (Ejecutar + botón 🎲) y **231 no tiran nada o solo una** (buffs y estados); **ninguna tiene fórmula sin stat**, así que ya cumplen la regla general.
- Los atributos siguen sumando su presupuesto (0 diferencias). *Pendiente:* que el dueño audite el equipo asignado en `datos/auditoria-creeps.html` y qué hacer con las armas temáticas de los niveles 3+ que se reemplazaron.

## 13. Ajustes del dueño al equipo y la defensa (2026-09-26)
Dueño: *«Los lanzadores pueden tener armas simples o armas mágicas con efectos, algo en segundo plano. Las armas pueden ser temáticas en cualquier nivel: en los humanoides pueden cambiar de nombre pero ser exactamente el mismo ítem con los mismos valores. La defensa de los humanos es siempre la de su equipo; los humanoides pueden tener defensa propia y además equipo defensivo; todo lo que no es humano tiene defensa natural. Los rangos de defensa por nivel tienen que ser más o menos similares, y puede haber creeps que se basen en tener mucha defensa (rol tanque).»* → aplicado en `herramientas/generar_equipo_creeps.py` (reemplaza a §12):
- **Armas:** **en todos los niveles** la principal es un ítem del catálogo (mismo Tipo de dado que ya tenía el creep y mismo alcance) con **exactamente sus valores**, pero **conserva su nombre temático** (`armaDetalle` dice «Equivale a «X» (tier)»). **Lanzadores** (mágico, apoyo, debuffer): llevan un **arma simple del catálogo** y su **foco mágico temático como una pieza aparte** (segundo plano, sin daño propio). *Armas mágicas del catálogo:* siguen en diseño (16 ideas en `rework-armas.md`); cuando estén cargadas se les da su efecto al foco.
- **Defensa:** **humano = la suma de su equipo** (38 de 38); **humanoide = defensa natural (la mitad del objetivo) + equipo** (la otra mitad); **no humano = defensa natural** (105 de 105). **Objetivo por nivel:** [1 · 2,5 · 4 · 6 · 8] × factor del rol (**tanque 1,7** · melee 1,1 · asalto 0,8 · rango 0,8 · apoyo 0,8 · debuffer 0,7 · mágico 0,6), jefe +2. Las piezas del equipo se eligen **por su Defensa más cercana al objetivo** de cada creep. Promedios de Defensa resultantes (sin jefes): N1 2,2 · N2 4,2 · N3 4,3 · N4 6,4 · N5 9,4; tanques: 2,5 · 5,5 · 7,4 · 10,3 · 18,3.
- Presupuesto de atributos intacto (0 diferencias en los 255).
