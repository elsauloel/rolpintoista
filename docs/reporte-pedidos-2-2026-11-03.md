# Pedidos del 2026-11-03 (segunda tanda): programación y pruebas con clics

Probado en «Claude · pruebas» (1920×1080, GM, Jugador 1 = Prueba Uno, Jugador 2 = Prueba Dos), con clics, mientras otra tanda peleaba en el
mismo mapa (sus carteles y duelos aparecían en todas las pantallas). Preparé por código lo mínimo (un escudo y una poción al «Goblin tunelero
(copia)», ponerlo al lado de Prueba Uno, nitros en −2) y al final lo dejé como estaba (el creep, igual a la copia de antes; Prueba Uno con sus
3 No2). Capturas en `/home/user/capturas/`, prefijo `t2-1103-`. Pruebas automáticas: en verde (725), con 2 nuevas. Commit `f8783e0a`.

## 1. 💧 La poción de SP en un creep — ✅ probado

- **Con cooldowns** le baja 1 turno de espera a una habilidad. Con varias en espera, el GM elige cuál («⏳ Bajar 1 turno de espera»: Excavar
  3 → 2, Golpe que sangra 2 → 1); con una sola, esa; sin ninguna, avisa «no tiene nada en espera» antes de gastarla, con «Usarla igual».
  Probado: eligió Golpe que sangra (2 → 1) y la Mesa dice «⏳ Golpe que sangra: espera 2 → 1».
- **En modo SP** le devuelve SP como a un personaje (un tercio del máximo). Probado: 0 → 4 de 12.
- Vale desde el mapa (Acciones del creep) y desde GM Tools.

## 2. 🛡 El Escudero — hecho

Agilidad 3 → 5 para que pueda atacar con el garrote sin saltarse la regla (con Agi 3 tenía 3 No2 y el ataque cuesta 5). Para seguir en 33:
Des 5 → 4 (PdG 4) y Esp 6 → 5 (Provocar tira PdG.Esp 5). Anotado en `docs/creeps-humanoides.md` como ajuste a revisar en el boceto.

## 3. 🛡 Parry con el arma o con el escudo, para todos — ✅ probado

- Un creep (y una invocación) con arma y escudo ahora tiene **dos opciones de Parry** en el duelo, como un personaje: «🗡 Parry · el arma» y
  «🛡 Parry · el escudo». El Bloqueo usa el peso de lo que paró.
- Probado: Prueba Uno atacó al Goblin con escudo; el GM vio las dos opciones, eligió el escudo, el botón dijo «Tirar Bloqueo · Escudo de
  caparazón…» y la Mesa: «lo bloqueó con Escudo de caparazón de tortuga gigante».
- Fuera del duelo (Acciones del creep), si tiene más de una cosa, pregunta con qué hace el Parry y el Bloqueo usa esa.
- Arreglado al probar: las dos opciones se confundían (el duelo elegía siempre la primera); ahora cada una lleva su pieza.

## 4. 🔍 Piel de hierro y Desafiante borrados juntos — revisado, no reproducido

- El 📜 Historial del GM muestra que se fueron los dos a la vez (10:10:33), **sin** pasar turno ni Mantenimiento (los cooldowns del Escudero
  siguieron igual y los No2 no se recargaron). En ese momento la tanda de humo abría las Acciones del Piromante y otra tanda abría un mapa
  nuevo de GM en otro navegador.
- Intenté repetirlo dos veces (estados de 2 turnos en un creep y abrir un mapa de GM nuevo): no se borraron. No encontré en el código nada que
  borre estados de un creep así. **Queda pendiente**: si vuelve a pasar en una partida, mirar el 📜 Historial a esa hora.

## 5. 🌺 Malviaje al empezar el turno, presentado a los involucrados — ✅ probado el cartel; el disparo desde el turno, sin probar con clics

- Al aplicar el inicio de su turno, en vez de tirar solo, sale:
  - **al afectado**, al centro: «🌺 Estás malviajando: tirá tu Resistencia mental contra N para resolver» con **🎲 Tirar Res.Mt** y **✍ Tirar a
    mano**;
  - **a los demás**, un cartel abajo: «🌺 Fulano está malviajando: tira su Resistencia mental contra N…»; el GM además tiene **🎲 Tirar por
    él** y **✍ A mano**.
- Si no resiste, lo mismo con el **1d6** (1–3 escapa, 4–6 ataca al más cercano). Al final, **la resolución a todos** («🌺 RESISTIÓ» o «🌺 ATACA
  AL MÁS CERCANO / ESCAPA»), con «✋ Se hace a mano». Las tiradas van a la Mesa.
- Probado: J2 tiró Res.Mt con el dado (4 contra 20, no resistió) y después el 1d6 a mano (5 → ataca al más cercano); lo vieron J1, J2 y el GM.
  Y el GM tiró por él contra 2: resistió.
- No lo disparé desde «▶ Empieza tu turno» con clics (habría tocado el orden de turnos de la otra tanda); el disparo es una sola línea en el
  inicio de turno (js/04).

## 6. ⚖ «Hacerlo igual» en el resto de las acciones en negativo — hecho; probado el consumible del creep

El mismo cartel («La regla dice que no podés… / Respetar la regla / Hacerlo igual (discutilo con la mesa)», línea roja en la Mesa) en:
pasar un ítem (dar, pedir, recibir, la alforja, los despojos), ayudar a soltarse, despertar a alguien (Sueño), el dodge roll, pagar el
sobrepeso de la Evasión y usar un consumible de un creep. Con «Hacerlo igual» paga y la deuda crece (antes, pasar un ítem en negativo la
borraba). Probado con clics: el Goblin en −2 usó la poción → el cartel → «Hacerlo igual» → quedó en −3 con la línea roja. Lo demás, sin
probar con clics (pendiente).

## Pendiente

- Probar con clics: el Malviaje desde «▶ Empieza tu turno», y «Hacerlo igual» al pasar un ítem, ayudar a soltarse, el Sueño, el dodge roll y
  el sobrepeso.
- Lo de los estados borrados del Escudero (punto 4), si vuelve a pasar.

## Capturas

1. `t2-1103-1-parry-escudo-opciones-GM.png` — las dos opciones de Parry del creep.
2. `t2-1103-2-parry-escudo-bloqueo-GM.png` — «Tirar Bloqueo · Escudo de caparazón…».
3. `t2-1103-5-pocion-sp-elegir-GM.png` — a qué habilidad le baja 1 turno.
4. `t2-1103-7-regla-no2-consumible-GM.png` — la regla de los No2 negativos con un consumible.
5. `t2-1103-8-pocion-nada-en-espera-GM.png` — «no tiene nada en espera».
6. `t2-1103-11-malviaje-cartel-J2.png` — «Estás malviajando: tirá…».
7. `t2-1103-13-malviaje-cartel-GM.png` — lo que ve el GM, con «Tirar por él».
8. `t2-1103-16-malviaje-fin-J2.png` / `t2-1103-17-malviaje-fin-J1.png` — la resolución, a todos.
9. `t2-1103-19-malviaje-resistio-J2.png` — resistió (lo tiró el GM).
