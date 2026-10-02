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
- **Espacio:** la ventana puede ocupar todo lo que haga falta de la pantalla para ordenar bien la información (dueño, 2026-10-02: mientras se
  crea o edita algo no hace falta espacio en otros lados). Por defecto es ancha (hasta 1100 px) y puede pedir la pantalla completa.
- **Paleta única** (la de la referencia: cobre/latón sobre el panel oscuro). Se terminan el azul de la Ejecución ✨ y el verde de las Zonas.
- Funciona igual en la ficha, GM Tools, el generador de tiendas, el editor del catálogo y adentro de los recuadros del mapa.
- **Avisar, no bloquear** (ADN del proyecto): los presupuestos (atributos, Job, Inteligencia) avisan; no impiden guardar.

## Relevamiento (2026-10-02) y orden de trabajo

Hoy hay 7 maneras distintas de paso a paso y ninguna pieza común (detalle por archivo en el relevamiento de la conversación). En tandas, cada una
probada y publicada antes de la siguiente:

| Tanda | Qué | Hoy |
|---|---|---|
| 1 ✅ | **La pieza común** + el asistente de **creeps** pasado a ella (con Guardar/Cancelar) | hecho 2026-10-02 |
| 2 ✅ | **Habilidades**: de personaje (`ficha-editor.js`), de creep (`creep-editor.js`) y de invocación (js/04 de la ficha) | hecho 2026-10-02 (se sacó el CSS de las pastillitas) |
| 3 ✅ | **Ítems** (`asistente-item.js`) en la ventana común (hecho 2026-10-02). Los **consumibles** pasaron en la tanda 6 (el formulario del editor común, por pasos) | hecho 2026-10-02 |
| 4 ✅ | **Ejecución ✨** (`asistente-duelo-hab.js`) en la ventana común, con la paleta de todos | hecho 2026-10-02 |
| 5 ✅ | **Estado** (`asistente-estado.js`), **Trampa** (`asistente-trampa.js`; al editar una ya colocada, Guardar siempre), **Zona** (`asistente-zona.js`, pasó de verde a la paleta de todos) y las cantidades de un preset (`estado-preguntas.js`: una pregunta por pestaña, «✔ Listo») en la ventana común. De paso: un Escape cierra una sola ventana (antes, con el asistente de estados abierto desde "+ Estado", cerraba también la grilla) y el mapa carga la ventana común de entrada | hecho 2026-10-02 |
| 6 ✅ | **Token nuevo** y **Editar token** (mapa, js/09); **Mapa nuevo** (`comun/asistente-mapa.js`, el mismo en el mapa y en GM Tools, con los creeps que se mudan); **Crear partida** (inicio); el **formulario del editor común** (`ficha-editor.js`) por pasos: **pasivas**, **talentos**, **estados** (el formulario completo) y **consumibles**; el **editor de invocaciones** (Qué es · Atributos · Arma · Defensa · Habilidades · Estados · Notas); el editor de **estados de creep** (`creep-editor.js`, GM Tools y las Acciones del mapa). Se sacaron las ventanas viejas (`#scrim` de la ficha, `#bn-editor`, `#scrim-editar-inv`, `#nuevo-token-capa`, `#editar-token-capa`). No se convirtieron, a propósito: la **ficha completa de un creep** (es su hoja en juego, como la ficha de un personaje; editar su definición ya es «✎ Editar paso a paso») y el nombre con que se guarda una **tienda** (un solo dato al guardar, no algo que se crea) | hecho 2026-10-02 |
| 7 ✅ | **Personaje nuevo** (abajo): `comun/asistente-personaje.js`, desde «＋ Personaje nuevo» de la ficha | hecho 2026-10-02 |

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

**Decidido al llegar a la tanda 7 (dueño, 2026-10-02):** el **DDE inicial es 300 doblones del espacio** salvo que el GM fije otro para su partida
(«⚙ Partida» de la página de inicio → `campanas/<id>/ajustes/partida.ddeInicial`, reglas nuevas); los **pesos de cada clase son los de los roles de
creeps** (Warrior→brutal, Asalto→rápido, Tanque→tanque, Mago→mago, Shooter→a distancia, Support→apoyo, Debuffer→debuffer; viven en
`Combatiente.PESOS_ROL`/`ROL_DE_CLASE`). Hecho así: el equipo se compra de la tienda **publicada y abierta** (si no, el paso explica que se compra
después desde 🏪); lo comprado queda en la mochila; la idea y la historia van a una página «Historia» de la bitácora; el personaje arranca con la
vida y los No2 llenos. Una habilidad custom (2 de Job) se arma después desde la ficha.

## Después de los paso a paso: cómo se ve un ítem en el catálogo y en las tiendas (pedido del dueño, 2026-10-02)

*"Me parece un espanto cómo se ven hoy las trampas en el catálogo y las tiendas."* Hoy cada tarjeta de la grilla muestra el texto completo del
Detalle (forma, daño, "⚙ Automático…", "✋ A mano…", cómo se apila…), y el Ver repite lo mismo.

- **En la grilla para elegir un ítem, solo lo que hace**, en datos cortos. Ej. *Trampa de oso*: forma y tamaño (flor de radio 2), daño (2d6),
  efecto adicional (Inmovilizado), tirada de salvación (Fuerza contra 8), dificultad de detección (todavía sin definir).
- **Los detalles técnicos aparte**: un recuadro **«Detalles técnicos»** que solo se ve al apretar **Ver**, y que solo se llena con lo que sea
  relevante para ese ítem (qué se automatiza, qué va a mano, cómo se apila…).
- Vale para el catálogo de la ficha, las tiendas (generador y la tienda del jugador), el editor del catálogo y el botín. Se encara al terminar las
  tandas de arriba.

