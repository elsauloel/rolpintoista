# Duelo para habilidades dirigidas (hechizos, controles, apoyos) — propuesta (2026-09-27)

> Pedido del dueño (2026-09-27): *«más importante que los skills es definir los duelos para situaciones que no sean ataques: hay muchos skills vinculados a ataques, pero también a hechizos, etc. Habría que definir las precisiones del paso a paso para cosas que no sean necesariamente ataques, pero sí habilidades dirigidas con objetivos.»*
> Base: [`ataque-paso-a-paso.md`](ataque-paso-a-paso.md) (el duelo de ataque, ya hecho) y [`reglas-casteo.md`](reglas-casteo.md) §1.2 (qué tira cada lado). Relacionado: [`skills-clase-y-duelo.md`](skills-clase-y-duelo.md).

## 1. Idea general
El duelo de ataque tiene siempre la misma columna vertebral: **declaración → tirada del que actúa contra la del que se opone → veredicto (con empate) → consecuencias (daño, efectos)**. Una habilidad dirigida es lo mismo con **piezas intercambiables**. Propongo **un solo duelo con tres piezas que cada habilidad declara** (y el GM/grupo puede editar, sandbox):

| Pieza | Qué decide | Opciones |
|---|---|---|
| **1. Objetivo** | a quién apunta | un enemigo · un aliado · uno mismo · varios (área, etapa posterior) |
| **2. Contienda** | qué se tira | **(a)** *ninguna* (se aplica directo: buffs, curas, apoyos) · **(b)** *tirada contra tirada* (el lanzador tira su stat; el objetivo tira el suyo) · **(c)** *tirada contra número fijo o de la habilidad* |
| **3. Consecuencia** | qué pasa si gana el lanzador (o pierde el objetivo) | daño (con su tipo) · estado sobre el objetivo · pérdida de No2 · empuje/derribo (a mano) · cura · lo que diga la skill |

## 2. Los casos reales del catálogo (lo que hay que cubrir)
| Caso | Ejemplos | Tira el que actúa | Tira el objetivo | Consecuencia |
|---|---|---|---|---|
| **A. Ataque con arma con arreglos** | Golpe brutal, Carga, Amplificar daño, Takle | PdG (con los modificadores de la skill) | Evasión / Parry (Takle: solo Evasión) | daño del arma (el duelo de ataque de siempre) |
| **B. Proyectil mágico** | Chispazo, Rayo Mágico | PdG.Esp | **Evasión** | daño mágico (**ignora armadura, no critica**) |
| **C. Efecto abstracto sobre el cuerpo** | maldiciones, Enyetar (Res.Esp) | PdG.Esp | **Res.Esp** (sale de Constitución) | estado o daño |
| **D. Control mental** | (cualquier skill ligada a la mente) | lo que diga la skill | **Res.Mt** (sale de Especial) | estado |
| **E. Contienda de atributos** | Shockwave, Sonic Boom (Fuerza vs Constitución), Takle (parte 2), Taunt (Esp+1 vs Esp) | el atributo de la skill | el atributo de la skill | estado, −No2, Sentado, empuje |
| **F. Sin oposición** | Blindaje, Recuperación, Shield, buffs sobre un aliado | — (el costo se paga) | — | se aplica directo |
| **G. Área** | Orbe arcano, Tormenta arcana, Shockwave, Daño en área | igual que B–E | **varios** objetivos, cada uno con su tirada | por objetivo (etapa posterior; y con «esquivar áreas»: rodar hasta 2 casilleros gastando No2) |

## 3. Cómo se vería el cuadro (pasos)
1. **Declaración:** «✨ *Rayo Mágico* — Fulano → Mengano» (título con el nombre de la habilidad; tipo de contienda escrito claro: «PdG.Esp contra Evasión»).
2. **Elección del objetivo:** clic en el token (como el ataque). Un aliado o uno mismo se elige igual; «uno mismo» salta directo.
3. **Cómo se defiende** (solo si la skill deja opciones): por ejemplo un proyectil se puede **esquivar (Evasión)**; un hechizo abstracto se resiste (Res.Esp) y no hay elección. Si hay más de una, el objetivo elige **a ciegas**, como en el ataque.
4. **Las tiradas** (se revelan juntas, con los dados 3D): mismo tratamiento de empate y de «ver tu tirada antes que el otro».
5. **Veredicto:** «el hechizo pegó / se resistió». **Cuando la skill dice «si el objetivo gana, resiste»**, no hay más pasos.
6. **Daño** (si la skill hace): fórmula de la skill; **el daño mágico ignora la Defensa y no critica** (regla de casteo); el físico de la skill sigue las reglas del arma (Defensa, crítico).
7. **Efectos** (estado, −No2, Sentado, empuje…): cada uno con su botón **«Aplicar»** y el aviso de «✋ a mano» cuando el mapa no lo puede hacer solo, igual que los efectos del golpe.
8. **Fin:** el resumen en la Mesa y «🏁 FIN DEL DUELO».

## 4. Datos nuevos que llevaría cada habilidad (`duelo` de la habilidad, editable en el asistente)
```
duelo: {
  objetivo: 'enemigo' | 'aliado' | 'uno mismo' | 'varios',
  tira:     'pdg' | 'pdgmg' | 'fue' | 'esp' | … (o un número fijo),
  contra:   ['eva'] | ['resmg'] | ['resmt'] | ['con'] | ['eva','resmg'] (el objetivo elige) | [] (sin oposición),
  dano:     { formula, tipo: 'fisico' | 'arcano' | 'fuego' | 'hielo' | 'rayo', ignoraDef, critica },
  efectos:  [ { estado | no2 | manual, … } ],
  siGana:   'el lanzador' | 'el objetivo' (quién domina la contienda de atributos)
}
```
Todo lo que se pueda deducir de lo que la habilidad ya guarda (`tiradaStat`, `estadoObjetivo`, `zonaMapa`, `tipoDanio` del casteo) se **completa solo**; el resto se puede tocar a mano.

## 4b. Reglas heredadas (ya decididas en otras conversaciones)
- **Daño mágico:** no critica y va directo a la vida (por eso es caro); solo critica lo físico. Elementos: arcano, fuego, hielo, rayo.
- **Flash:** siempre 0 No2; se declara **antes** de tirar.
- **Empate:** la regla de siempre (gana quien no tiene «+» fijo; si no, par o impar).
- **Automatizar o aclarar:** lo que se pueda aplicar solo se aplica; lo demás queda con «✋ a mano».

## 5. Preguntas para el dueño (por dictado, una por una)
1. **¿Te cierra un solo duelo con las tres piezas** (objetivo, contienda, consecuencia), en vez de un duelo distinto por tipo de skill?
2. **Proyectil mágico (B):** el objetivo tira **Evasión** contra tu PdG.Esp. ¿Puede también **Parry**? (Propuesta: **no**; un hechizo no se parrea.) ¿Y el **Bloqueo** con escudo? (Propuesta: **no**.)
3. **Efecto abstracto (C):** el objetivo tira **Res.Esp** contra tu PdG.Esp. ¿Empate? (Propuesta: la regla de siempre.)
4. **Contienda de atributos (E):** ¿la tiran los dos con su atributo puro (Fuerza contra Constitución), o suman algo (el peso del arma, un bono)? ¿Cómo se ve? (Propuesta: cada uno tira su atributo con sus mods, gana el mayor, empate = par o impar.)
5. **Sin oposición (F):** ¿hace falta un duelo para un buff a un aliado o basta con elegir el token y aplicar? (Propuesta: **sin cuadro largo**: un aviso corto al aliado y se aplica; el aliado no tiene que hacer nada.)
6. **¿El objetivo puede rechazar un buff/cura?** (Propuesta: no; sandbox: lo saca a mano si quiere.)
7. **¿Empezamos por B y C** (los hechizos con tirada, que son los que faltan) **y dejamos áreas (G) para después**? (Propuesta: sí.)
8. **Daño de la skill:** ¿la fórmula la tira el lanzador con su botón 🎲 en el paso de daño, como el arma? (Propuesta: sí.)

## 6. Orden de implementación que propongo
1. **Generalizar el duelo** para aceptar `ataque.tipo: 'habilidad'` con `contienda` (`tira`/`contra`) y nombre de la habilidad: las piezas B, C, D y E de un solo objetivo.
2. **Ejecutar una habilidad dirigida abre el duelo** (en vez de tirar el stat suelto), con lo que ya guarda la habilidad.
3. **Sin oposición (F)** con el aviso corto.
4. **Asistente de habilidades:** el paso «Objetivo y contienda».
5. **Áreas (G)** más adelante (varios defensores + esquivar áreas).

## 7. Respuestas del dueño y primera versión hecha (2026-09-27)
- **Un solo mecanismo general, lo más homogéneo posible**, con las salvedades de cada caso (no un duelo distinto por tipo de skill). ✅
- **Proyectil mágico:** **no se puede parrear ni bloquear, solo esquivar** (Evasión). ✅
- **Contienda de atributos** (Fuerza contra Constitución, etc.): cada uno tira su atributo con sus mods, gana el mayor, empate = la regla de siempre. ✅
- **Buff o cura a un aliado:** sin oposición, pero **con su momento**: se abre el cuadro del duelo (pop-up para todos) con los efectos y el botón «Aplicar», no solo una línea en el log. ✅
- **Empezar por** los hechizos con tirada (proyectil y efecto abstracto), más contienda de atributos y sin oposición. Las **áreas** quedan para después.

**Hecho (sin probar en mesa):**
- `comun/duelo.js`: el duelo acepta `ataque.tipo: 'habilidad'` con el campo `hab` (contienda, daño, efectos). Con oposición: quien la usa tira su stat contra el del objetivo (mismas fases, empate y dados 3D que el ataque); si gana, sigue el daño (el **mágico ignora la Defensa y no critica**) y los efectos con su botón **Aplicar**; si pierde, «SE RESISTIÓ». Sin oposición: el cuadro se abre directo en los efectos. Los efectos pueden ser **estados** (con bono opcional) o **cura** (el mapa del GM cura al objetivo, personaje o creep, sin pasar del máximo).
- `comun/asistente-duelo-hab.js`: el botón **🎯** de cada habilidad (ficha y creeps de GM Tools) abre la ventanita para configurar el duelo: a quién apunta, qué tira quien la usa, con qué se resiste el objetivo (uno o varios, elige a ciegas), daño y tipo, y efectos. Guarda `habilidad.duelo`; ejecutar esa habilidad abre el duelo (con «Sin objetivo · tirada suelta» como salida).
- Ficha (personaje e invocaciones) y creeps: tiran sus stats con los hooks `habTirar` y `habValor`. Mapa: objetivo «uno mismo» sin elegir, cura del duelo, opciones de defensa de creeps sin cargar las Acciones.
- **Hay que volver a pegar `firebase/firestore.rules`** (campo nuevo `hab` en los duelos).
- **Pendiente:** áreas (varios objetivos), ataque con habilidad de arma (Golpe brutal, Carga, Takle…), reacciones Flash, «esquivar áreas», y que las skills de clase y de creeps ya cargadas (Chispazo, Rayo Mágico…) traigan su `duelo` configurado (hoy se configura a mano con 🎯).

## 8. Alcance: los objetivos «laten» (2026-09-27, pedido del dueño)
El alcance **no restringe**: al elegir el objetivo en el mapa, **los tokens que están a tu alcance laten con un brillo dorado** (el resto sigue elegible). Cuerpo a cuerpo = **1 casillero + el Alcance del arma** (su bono `rng`); arma de rango = su **Rango**; hechizos = su **Rango de casteo**; una habilidad puede fijarlo en su 🎯 (Rango de casteo, Rango, cuerpo a cuerpo, un número o sin límite; «Automático» = los hechizos usan el Rango de casteo). Lo calcula la página de quien actúa (`alcanceDeArma`, `alcanceDeHab`, `alcanceDeCreep`), viaja en `ataque.alcance` con el pedido de elegir objetivo (no se guarda en el duelo) y el mapa lo dibuja (`dueloResaltarObjetivos`, `objetivosResaltados`). Sin alcance (0) no se resalta nada. Los tokens ocultos no brillan para los jugadores.
**Aclaración del dueño (2026-09-27):** el **Alcance** de un arma cuerpo a cuerpo es **un stat propio del arma** (lo limita su tamaño): **los bonos de Rango (Destreza, ítems, estados, habilidades) NO lo modifican**; solo modifican el alcance de las **armas de rango**. Así está: cuerpo a cuerpo = 1 + el Alcance que trae el propio arma; arma de rango = su Rango con todos sus bonos.

## 9. Ataques con arma «con arreglos» — HECHO (2026-09-27)
Golpe brutal, Amplificar daño, Carga y Takle (y las que se diseñen) se juegan en el **duelo de ataque de siempre** (PdG contra Evasión o Parry, crítico, daño y efectos del arma) con **lo que la habilidad le suma**, configurado en su 🎯 → «Ataque con mi arma, con arreglos»: **+ PdG** (fijo o **por X**), **dados de daño extra por X** (del Tipo del arma), **daño fijo extra** (fijo o por X), **no se puede parrear** (Takle: el defensor solo ve Evasión), **la X de su costo** (No2 o SP), alcance y **efectos al pegar** (estados o cura, cada uno con «Aplicar»).
- Los **No2 del ataque los cobra la habilidad al ejecutarla** (y cuenta como ataque del arma); el duelo **no los vuelve a cobrar**. La X sale del cartelito de costo (`terminarEjecucionHab`, también en `confirmarCostoVariable`).
- El cuadro se titula con el nombre de la habilidad y, en la declaración, dice lo que suma («+1 PdG · no se puede parrear»). La línea de resumen de la Mesa también.
- **Cargadas en `skills-clase.js`:** Golpe brutal (su Crítico potente ×1 y −2 Evasión ya salían del estado), **Amplificar daño** (+1 dado por cada SP de X), **Carga** (+1 PdG y +1 de daño fijo por cada X de No2), **Takle** (+1 PdG y sin Parry). Las que ya estaban en una mochila también las traen (`dueloDe`: si nunca se tocó su 🎯, se usa el de la skill de clase; «Sacar el duelo» lo apaga).
- **A mano todavía:** el desplazamiento de Carga y de Takle, la Constitución contra Constitución de Takle, el empuje. Solo para personajes por ahora (los creeps con habilidades de ataque siguen con su botón de siempre).

## 10. Reacciones Flash — HECHO (2026-09-27)
Una habilidad Flash se configura en su 🎯 → «⚡ Reacción Flash»: **cuánto suma** y **en qué tiradas vale** (tirada de quien actúa, Evasión, Parry, Bloqueo, Fuerza del golpe, daño). En el cuadro del duelo, **antes de cada tirada** de quien tiene un Flash que le sirve aparece un botón dorado **«⚡ Arte de la guerra +2 · 2 SP»** (la ficha lo calcula con `flashOpciones`); se marca (queda encendido) y **al tirar** la página del dueño cobra los **SP** (`flashUsar`; **no cuesta No2**) y el bono se suma a esa tirada como «+» fijo (la fórmula dice «+2 ⚡»; cuenta como «+» en el desempate). Una línea en la Mesa lo anuncia. **Se declara siempre antes de tirar** (regla de Flash): después de ver el resultado no se puede. Con la Evasión/Parry, el botón dice con cuál vale (Arte de la guerra vale con Parry, no con Evasión).
- **Arte de la guerra** (+2 a PdG, Parry, Bloqueo o Daño) ya viene cargada; las que ya estaban en una mochila también.
- **Una vez por tirada**; no hay límite por turno (lo frenan los SP): queda como estaba la duda «⚖ ¿una vez por turno o todas las que quieras?». Sandbox: no se bloquea.
- **Creeps e invocaciones no usan Flash** (por ahora no se les pregunta). **Pendiente:** Blindaje/Shield (escudo antes de recibir daño), Re-roll, Estoicismo y las demás Flash (cuando se audite cada una), y el daño: la línea de la Mesa muestra el daño sin el bono (el bono va en el registro del duelo).
