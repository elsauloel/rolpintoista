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
