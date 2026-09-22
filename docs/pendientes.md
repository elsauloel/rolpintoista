# Pendientes (lista de trabajo)

> Lista viva para ir tachando. Las **decisiones de diseño** sin cerrar viven en [`preguntas-abiertas.md`](preguntas-abiertas.md) (con número P);
> acá van las **tareas**. Al terminar una, marcarla `[x]` con la fecha; al aparecer una nueva, sumarla. Última revisión: 2026-09-21.

## 1. Casteo con SP — **proceso paso a paso en [`proceso-casteo.md`](proceso-casteo.md)** (reglas en [`reglas-casteo.md`](reglas-casteo.md), decisiones en P97)
> Retomar por el primer paso sin ✅ de `proceso-casteo.md` (hoy: paso 1, tipos de daño). Lo de abajo es solo un resumen.
- [ ] **Decidir** (P97): tipos de daño de casteo y cuáles ignoran armadura; nombre del daño genérico; resistencia por tipo; armadura mágica; esquiva de áreas (¿tira Evasión contra algo?, costo en No2, ¿reacción fuera de turno?); ¿renombrar "Mg"?
- [ ] Paso 2: campo `tipoDanio` en habilidades (ficha, invocaciones, creeps) y que el daño recibido **no reste Defensa** cuando el tipo ignora armadura (mapa `danioPj`/`danioCreep`, gm-tools, ficha, trampas).
- [ ] Paso 3: escribir "qué tira cada lado" (PdG.Mg vs Evasión / Res.Mg / Res.Mt) en la descripción de cada habilidad de casteo.
- [ ] Paso 4: resistencia por tipo de daño (stats, ítems, creeps, lupa) y armadura mágica.
- [ ] Paso 5: esquivar áreas (roll de Evasión de hasta 2 casilleros, gasta No2).
- [ ] Paso 6: auditoría de contenido por tandas — skills de clase (13 de 62) → habilidades de creeps → creeps base → armas naturales → trampas base → catálogo (~60 ítems) → pasivas y estados → manual.

## 2. Probar con la mesa abierta (nada de esto se probó con sesión iniciada y varios jugadores)
- [ ] **Volver a pegar `firebase/firestore.rules`** (nueva colección `combate`): sin eso no se abre la ventana "Batalla terminada" ni se habilitan los botones 🎁.
- [ ] Pegar `firebase/firestore.rules` en la consola (**Desarrollar y realizar pruebas** → Ctrl+A → pegar → Publicar) y verificar que quedó (buscar `estados` y `botin`).
- [ ] Grupos de creeps, **tokens automáticos** (creeps y jugadores), **Finalizar combate y Botín desde el mapa**, botón **🎭** del borde izquierdo y **grupos vinculados a mapas**.
- [ ] Reporte de fin de combate → recompensas en la ficha → **botín**: Sumar a la mochila, Comparar, **Despojar**.
- [ ] **Trampas automáticas** (se colocan solas, ocultas, con daño) y **estados sobre otros** ("¿A quién le pegó?", la ficha aplica el aviso; trampas con estado).
- [ ] **Protección de jefe** (inmune a Stun, +1 Res.Mg).
- [ ] Botón **🗺 Mapas** del GM (se arregló una posible falla de caché: confirmar que abre; si no, mandar el error de la consola).
- [ ] Al borrar un creep, la pregunta de borrar sus tokens en todos los mapas.

## 3. Documentación
- [ ] **Manual** (`manual-usuario/notas`): grupos y tokens automáticos, botín, Despojar, Finalizar combate en el mapa, trampas automáticas, estados sobre otros, protección de jefe, botón 🎭 y grupos ↔ mapas, y una nota de casteo cuando estén las reglas.

## 4. Diseño pendiente
- [ ] **Trampas para jugadores**: que un personaje con una habilidad de trampa también la coloque solo (hoy solo los creeps).
- [ ] **Despojos mágico/especial** de los ítems: siguen a mano.
- [ ] **Protección de jefe, segunda versión** (P95): resistencia a otros controles (Exhausto, Inmovilizado…), contador de resistencia o fases.
- [ ] **Estados sobre otros más finos**: los que faltan automatizar (empujar, derribar, huir, "pierde el sigilo", etc.).
- [ ] **Grupos vacíos en el menú 🎭** del mapa: hoy solo lista los grupos que tienen creeps.

## 5. Contenido a revisar (números de primer borrador)
- [ ] Las **321 habilidades de creeps**: daño, cooldowns, bonos, cuáles son rápidas y cuáles lentas.
- [ ] Los **173 creeps base** (todos dicen "(auditar)") y sus recompensas.
- [ ] Las **66 armas naturales**: potencia y porcentajes de los efectos.
- [ ] Las **24 trampas base** y su daño.
- [ ] El pool de **habilidades de clase** (`skills-clase.js`): 62 skills, casi todas todavía "(Sin auditar)".

## 6. Repaso de buffs y debuffs (en curso, 2026-09-21)
- [x] **Veneno**: se acumula (suma stacks, turnos = stacks, sin tope); Veneno severo aparte y no se acumula.
- [ ] **Mecánica "cura estados"** en consumibles y habilidades (el Antídoto debería quitar Veneno y Veneno severo; hoy se saca a mano).
- [ ] **Nube tóxica** del Debuffer: ¿sigue aplicando solo 1 stack a alguien ya envenenado?
- [x] **Pajaritos**: sin cambios (PdG y Evasión a la mitad, redondeado abajo, 3 turnos).
- [x] **Cansado**: cambió de −1 fijo a **corta los No2 máximos a 2/3** (pierde un tercio, redondeado hacia abajo). `cansado:true` en ficha, gm-tools e `comun/estados-aplicar.js`; ya no usa `mods`.
- [x] **Exhausto**: cambió de un tope fijo (1 No2) a **corta el No2 máximo a un tercio del natural** (redondeado hacia abajo) — misma lógica que Cansado: 1 Acción de un máximo de ~3 era un tercio. `exhausto:true` en vez de `forzarNitros:1`; si Cansado y Exhausto están activos juntos, gana el más restrictivo (Exhausto, 1/3 < 2/3) sin necesidad de sumarlos.
- [x] **Stun**: se queda en 2 turnos (a propósito: con 1, el Mantenimiento podría gastarlo antes de tu turno y no perderías nada); se sumó **la Evasión falla directo mientras dura, sin tirar dado** — a mano, no se automatiza (no hay nada que calcular).
- [x] **Armadura rota**: sin cambios (−1 Defensa por acumulación, permanente, se cura con Óleo reparador).
- [x] **Armadura arruinada**: **se eliminó del todo** (2026-09-21). Lo que la aplicaba pasó a sumar stacks de Armadura rota en su lugar: 3 hachas del catálogo (`datos/catalogo.json`, regenerado con `importar_json.py`; Hacha de Durin 3 stacks, Hacha filo de diamante 2, Hacha de guerra pesada 1 — números a revisar), el efecto "Arruina armadura" de `comun/armas-naturales-base.js`, y la habilidad de creep "Disolver la armadura" (`comun/creeps-base.js`/`skills-creep-base.js`). Se sacó `armaduraArruinada` de ficha, gm-tools, mapa, `estados-aplicar.js` y el manual (nota 07-estados.md unificada, con aviso de por qué se sacó).
- [ ] Seguir el repaso — debuffs que faltan: Veneno severo, Sangrado, Lisiado, Inmovilizado, Rengo. Buffs (todavía sin arrancar): Regeneración, Hypeado, Invulnerable, Inmunidad a CC, Espinas, Escudo mágico, Afortunado, Sangre pura, Coagulación extrema, Blindado, Sigilo.
- [ ] Después del repaso de presets: auditar las habilidades de clase con buff/debuff (`comun/skills-clase.js`) e incorporarlas al menú de presets — inventario completo en el chat del 2026-09-21 (Estoicismo, Shockwave ⚠️ choca de nombre con Pajaritos, Sonic Boom → estado nuevo "Sentado", Aura de espinas, Lisiar ⚠️ choca de nombre con Lisiado, Tajear, Invi, Envenenar arma, Degollar, Blessing, Adrenalina, Maldición debilitante/extenuante/tormentosa, Confusión, Marcar, Apuntar, Enfocado, y otras — ver el resto en el chat).
