# Tercera tanda de pruebas — 2026-11-03

Todo en «Claude · pruebas», a 1920×1080, **con clics**, con las cuentas GM, Jugador 1 (Prueba Uno) y Jugador 2 (Prueba Dos). Por código solo preparé:
ponerle el Malviaje a Prueba Dos (con el Ef.Esp de quien se lo puso), armar el orden de turnos, dejar a alguien en No2 negativos, ponerle a Bizzante
«Agarrado» y después «Sueño», acercar tokens, cargar a Prueba Dos con un ítem pesado (sobrepeso) y darle al Goblin scout una «Bola de fuego» de
prueba. Al terminar lo devolví todo: comparado con la copia de antes, **0 diferencias** en Prueba Uno, Prueba Dos, el orden de turnos y los tokens;
a Bizzante y al Goblin scout los dejé como estaban a mano (vida, No2, estados, habilidades). «El origen de las especies» no lo toqué.
Capturas en `/home/user/capturas/`, con el prefijo `t3p-1103-`.

## 1. 🌺 Malviaje desde «▶ Empieza tu turno» — ✅ las dos ramas

- Orden de turnos: Goblin picapiedras, Prueba Dos (malviajando), Basilio. El GM tocó **▶ Siguiente** y a Jugador 2 le llegó solo «▶ Empieza tu
  turno» con el paso «🌺 Estás malviajando: …tirás tu Res.Mt contra el Ef.Esp de quien te lo puso (20)…».
- Al tocar **✔ Aplicar**, a Jugador 2 le salió al centro **«🌺 Estás malviajando»** con **🎲 Tirar Res.Mt** y **✍ Tirar a mano**; al GM, abajo,
  **«🌺 Prueba Dos está malviajando»** con **🎲 Tirar por él**, **✍ A mano** y Ocultar; a Jugador 1, el mismo aviso con solo Ocultar.
- **Rama 1 (no resiste)**: Jugador 2 tiró Res.Mt 5 contra 20 → el cartel pasó a «¿escapás o atacás?» con **🎲 Tirar 1d6** → 5 → **«🌺 ATACA AL MÁS
  CERCANO»**, con «✋ Se hace a mano». La resolución la vieron los tres.
- **Rama 2 (resiste)**: con Ef.Esp 2, el GM tocó **«Tirar por él»** → Res.Mt 6 contra 2 → **«🌺 RESISTIÓ»: este turno juega normal (con el −2)**, a todos.
- Las tiradas van a la Mesa («Res.Mt contra el Malviaje (Ef.Esp 20)», «Malviaje: ¿escapa o ataca?», y «(lo tiró el GM)» cuando corresponde).

## 2. ⚖ «Hacerlo igual» con No2 negativos — ✅ en todo

En cada caso: el cartel **«La regla dice que no podés hacerlo: X está en −N No2 (…)»** con **Hacerlo igual (discutilo con la mesa)** y **Respetar la
regla**. «Respetar» no hace nada; «Hacerlo igual» paga, la deuda crece y sale la línea roja «⚠ X se saltó la regla de los No2 negativos» en la Mesa.

- **Dar un ítem** (Prueba Uno en −2 → Prueba Dos, con la 🤝): respetar no ofrece nada; hacerlo igual ofrece la Daga. ✅
- **Recibirlo** (Prueba Dos en −2, «A la mochila · 2 No2»): el cartel → hacerlo igual → los dos quedan en −4. ✅
- **Pedir un ítem** (Prueba Uno en −4): el cartel; respetar no pide; hacerlo igual pide. **Darlo cuando te lo piden** (Prueba Dos en −4): el
  cartel → hacerlo igual → Prueba Dos queda en −6. ✅
- **Ayudar a soltarse** (Bizzante «Agarrado», Prueba Dos en −6 con el botón «🤝 Ayudar a soltar a Bizzante» de su Botonera): el cartel → respetar no
  hace nada → hacerlo igual tira Fuerza (1 contra 10, sigue atrapado) y queda en −7. ✅ (con dos arreglos, abajo)
- **Despertar a alguien** (Bizzante con Sueño, Prueba Dos en −7, el 💤 del token): el cartel → respetar no hace nada → hacerlo igual: Bizzante se
  despierta y Prueba Dos queda en −8. ✅
- **Pagar el sobrepeso de la Evasión** (Prueba Dos con 17 de sobrepeso, en −8, atacado por el Goblin scout): «🏃 Evasión · pagando 1 No2» → el cartel
  → respetar deja elegir otra vez → hacerlo igual tira la Evasión sin penalidad y queda en −9. ✅
- **El dodge roll** (Bola de fuego del Goblin scout centrada en Bizzante; Prueba Dos ganó la Evasión y quedó en «🏃 Dodge roll»): arrastrar fuera del
  área → el cartel → respetar no se mueve → hacerlo igual: sale del área («logró salir del área: esquivó») y queda en −11. ✅ (con un arreglo, abajo)

## Arreglado

- **🤝 Ayudar a soltar desde la Botonera** (`vtt-hexgrid/js/54-soltarse-al-empezar.js`, commit `aaa3c0c0`): en negativo solo avisaba «ya está en No2
  negativos: no puede ayudar» (el cartel estaba en la otra ayuda, la del inicio de turno). Ahora sale el cartel de la regla. Y **el No2 que se pagaba
  al ayudar no se guardaba** (la foto de la ficha se tomaba después de cobrar): ahora sí. Probado con clics.
- **🏃 Dodge roll con «Hacerlo igual»** (`vtt-hexgrid/js/06-mouse.js` y `js/08-mover-trampas-y-zonas.js`, commit `ee3fb839`): el clic en el botón del
  cartel contaba como «clic afuera» y confirmaba el movimiento antes de tiempo, sin el permiso: salía «No te alcanzan los No2» y no se movía. Ahora,
  con el cartel abierto, el clic no confirma; «Hacerlo igual» mueve y «Respetar la regla» cancela el movimiento. Probado con clics.

## Para tener en cuenta

- El texto de la ventana de la 🤝 todavía dice «Con No2 en negativo no se puede» (ahora se puede, con la mesa).
- En un pedido, si el que pidió ya estaba en negativo, al recibirlo paga sin volver a preguntar (ya lo decidió al pedir): está bien así.
- La otra tanda usaba a Prueba Uno al mismo tiempo (le puso 3 No2 y le aplicó un pergamino): por eso en un pedido Prueba Uno apareció en 1 en vez de
  −6. No es un error del pase.
- Despertar a alguien siendo un **creep** en negativo no pregunta nada (descuenta igual, sin cartel); no se pidió, queda anotado.

## Commits

- `aaa3c0c0` — 🤝 ayudar a soltar: el cartel de la regla y el No2 que se guarda (`vtt-hexgrid/js/54-soltarse-al-empezar.js`, `vtt-hexgrid/mapa.html`).
- `ee3fb839` — 🏃 dodge roll: «Hacerlo igual» mueve, «Respetar» cancela (`vtt-hexgrid/js/06-mouse.js`, `vtt-hexgrid/js/08-mover-trampas-y-zonas.js`,
  `vtt-hexgrid/mapa.html`).

## Capturas (las mejores)

1. `t3p-1103-02-inicio-turno-J2.png` — «▶ Empieza tu turno» con el paso del Malviaje.
2. `t3p-1103-03-malviaje-cartel-J2.png` — «Estás malviajando: tirá…» (🎲 / ✍).
3. `t3p-1103-04-malviaje-cartel-GM.png` — lo que ve el GM, con «Tirar por él».
4. `t3p-1103-06-malviaje-d6-J2.png` — no resistió: «¿escapás o atacás?».
5. `t3p-1103-08-malviaje-fin-GM.png` — «ATACA AL MÁS CERCANO», a todos.
6. `t3p-1103-10-malviaje-gm-tira-resistio-GM.png` — el GM tiró por él: «RESISTIÓ».
7. `t3p-1103-16-dar-regla-J1.png` — la regla al dar un ítem.
8. `t3p-1103-24-ayudar-regla-J2.png` — la regla al ayudar a soltarse.
9. `t3p-1103-28-despertar-regla-J2.png` — la regla al despertar a alguien.
10. `t3p-1103-35-sobrepeso-regla-J2.png` — la regla al pagar el sobrepeso.
11. `t3p-1103-46-dodge-regla-J2.png` — la regla en el dodge roll.
12. `t3p-1103-48-dodge-mesa-GM.png` — la Mesa: salió del área y las líneas rojas.
