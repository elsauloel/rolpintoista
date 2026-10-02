# Plan: un solo «paso a paso» para crear y editar (2026-10-02)

Pedido del dueño: *"establecer el método de creación y edición de prácticamente todo en un paso a paso… visual y conceptualmente
unificado. Pasos chicos, claros y explicativos."* Referencia: el asistente de creeps de GM Tools (captura del 2026-10-02).

## El estándar

- **Una sola pieza común: `comun/paso-a-paso.js` (`PasoAPaso`).** Ningún asistente arma su propia ventana, pestañas ni botones.
- **Cabecera:** «*Crear un X* / *Editar X* · paso N de M: *Nombre del paso*» y, a la derecha, **Cancelar**.
- **Pestañas:** una fila con todos los pasos, «1. QUÉ ES», «2. ATRIBUTOS»… (Space Mono, mayúsculas; la actual en cobre). **Se puede
  saltar a cualquier paso con un clic**, salvo que falte algo indispensable (ej. el nombre): ahí se avisa por qué.
- **Cada paso:** una línea que explica qué se decide ahí y para qué sirve, y después los campos. Pasos chicos.
- **Pie:** «← Atrás» a la izquierda; a la derecha «Siguiente →» y:
  - **al editar**: **Guardar** siempre visible (en cualquier paso). Se trabaja sobre una copia: Cancelar descarta (decisión del dueño, 2026-10-02).
  - **al crear**: el último paso es **Resumen**, con «✔ Crear». Cancelar descarta lo armado.
- **Paleta única** (la de la referencia: cobre/latón sobre el panel oscuro). Se terminan el azul de la Ejecución ✨ y el verde de las Zonas.
- Funciona igual en la ficha, GM Tools, el generador de tiendas, el editor del catálogo y adentro de los recuadros del mapa.
- **Avisar, no bloquear** (ADN del proyecto): los presupuestos (atributos, Job, Inteligencia) avisan; no impiden guardar.

## Relevamiento (2026-10-02) y orden de trabajo

Hoy hay 7 maneras distintas de paso a paso y ninguna pieza común (detalle por archivo en el relevamiento de la conversación). En tandas, cada una
probada y publicada antes de la siguiente:

| Tanda | Qué | Hoy |
|---|---|---|
| 1 | **La pieza común** + el asistente de **creeps** pasado a ella (con Guardar/Cancelar) | referencia, edita en vivo |
| 2 | **Habilidades**: de personaje (`ficha-editor.js`), de creep (`creep-editor.js`) y de invocación (js/04 de la ficha) — hoy tres editores con «pastillitas» | pasos sin pestañas |
| 3 | **Ítems** (`asistente-item.js`), también los **consumibles** (hoy formulario aparte) | pastillitas |
| 4 | **Ejecución ✨** (`asistente-duelo-hab.js`) | azul, pastillitas |
| 5 | **Estado** (crear y el ⚙ de editar, hoy formulario), **Trampa**, **Zona** y las preguntas de un preset (`estado-preguntas.js`) | barra de progreso, sin saltar |
| 6 | Lo que hoy es formulario o `prompt`: **invocación** (como el de creeps), **pasiva**, **talento**, **token nuevo**, **mapa**, **tienda**, **partida** | formularios / prompt |
| 7 | **Personaje nuevo** (abajo) | un `confirm` y una ficha en blanco |

Al terminar: sacar el código muerto del asistente viejo de trampas del mapa (`vtt-hexgrid/js/03-asistente-trampa.js`) y el CSS duplicado de
`.pasos-hab`/`.paso-chip` (ficha.css y gm-tools.css).

## Personaje nuevo (diseño, 2026-10-02)

Decisiones del dueño: atributos con **mínimo 3** (como el manual; la ficha arrancaba en 1); se puede terminar con **puntos sin gastar, con aviso**;
**Historia opcional**; el **equipo inicial depende de la tienda que publique el GM**; al elegir stats y skills, **un acompañante que oriente según
los arquetipos (las clases), dejando claro que no restringe**.

Pasos propuestos (desde «＋ Personaje nuevo»):
1. **Idea** — nombre, raza, clase (las 7 o "otra"), subclase y el concepto en dos líneas ("guerrera lenta que se cree elegante").
2. **Imagen** (opcional) — foto y recorte del token.
3. **Atributos** — 33 puntos, cada uno arranca en 3. Acompañante: "un *Warrior* suele ir fuerte en Fuerza y Constitución…" con
   «Usar la sugerencia de *clase*» (mismos pesos por rol que los creeps), y los derivados en vivo (HP, No2, SP).
4. **Habilidades** — 3 de Job: las de su clase primero (sugeridas, 1 c/u), las de otras clases, o una custom (2). Acompañante: qué hace cada una
   y por qué sirve al arquetipo.
5. **Pasivas** — comparten el Job con las habilidades.
6. **Talentos** — 6 de Inteligencia en habilidades sociales.
7. **Equipo** — si el GM publicó una tienda, se compra ahí con el DDE inicial; si no, "cuando el GM abra la tienda, comprás desde 🏪".
8. **Historia** (opcional) — motivo, manía, de dónde viene.
9. **Resumen** — todo junto, con los avisos de puntos sin gastar, y «✔ Crear».

Pendiente de definir al llegar a la tanda 7: el DDE inicial (¿lo pone el GM por partida?) y los pesos sugeridos de cada clase (se arrancan de los
roles de creeps: Warrior→brutal, Asalto→rápido, Tanque→tanque, Mago→mago, Shooter→a distancia, Support→apoyo, Debuffer→debuffer).

## Después de los paso a paso: cómo se ve un ítem en el catálogo y en las tiendas (pedido del dueño, 2026-10-02)

*"Me parece un espanto cómo se ven hoy las trampas en el catálogo y las tiendas."* Hoy cada tarjeta de la grilla muestra el texto completo del
Detalle (forma, daño, "⚙ Automático…", "✋ A mano…", cómo se apila…), y el Ver repite lo mismo.

- **En la grilla para elegir un ítem, solo lo que hace**, en datos cortos. Ej. *Trampa de oso*: forma y tamaño (flor de radio 2), daño (2d6),
  efecto adicional (Inmovilizado), tirada de salvación (Fuerza contra 8), dificultad de detección (todavía sin definir).
- **Los detalles técnicos aparte**: un recuadro **«Detalles técnicos»** que solo se ve al apretar **Ver**, y que solo se llena con lo que sea
  relevante para ese ítem (qué se automatiza, qué va a mano, cómo se apila…).
- Vale para el catálogo de la ficha, las tiendas (generador y la tienda del jugador), el editor del catálogo y el botín. Se encara al terminar las
  tandas de arriba.

