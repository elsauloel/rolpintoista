# Pedidos del 2026-11-03 — programación y pruebas con clics

Todo probado en «Claude · pruebas» (1920×1080, cuentas GM, Jugador 1 = Prueba Uno, Jugador 2 = Prueba Dos), con clics. Por código solo preparé
(darle −2 No2 a alguien, equiparle la Daga a Prueba Dos, ponerle el Malviaje, armar el orden de turnos) y restauré. Capturas en
`/home/user/capturas/`, con el prefijo `prisa-1103-`. Pruebas automáticas: 722 en verde. Commits `d62fa501` y `cb5b5b7d`.

## 1. ⚖ Nitros en negativo: la regla se puede saltar

- **Antes**: en negativo, el Parry salía apagado y el ataque o el contraataque se rechazaban.
- **Ahora**: el botón está; al tocarlo sale el cartel **«La regla dice que no podés hacerlo: X está en −2 No2 (Parry)»** con **«Hacerlo igual
  (discutilo con la mesa)»** y **«Respetar la regla»**. «Hacerlo igual» paga, deja la deuda y anota en rojo en la Mesa «X se saltó la regla de los
  No2 negativos». Vale para personajes, invocaciones y creeps; en el duelo (el Parry o la Evasión pagando el sobrepeso), en las Acciones del creep y
  en la Botonera, y para el contraataque, la oportunidad y el ataque.
- **Probado**:
  - El Goblin picapiedras en −2, Parry desde sus Acciones → el cartel → «Hacerlo igual» → Parry 1d8, queda en −3, línea roja (capturas 6, 7, 8).
  - El Goblin ataca a Prueba Dos (en −2): en el cuadro del duelo, el Parry dice «⚖ La regla dice que no (en −2 No2): tocalo para decidir» → «Respetar
    la regla» (el duelo sigue esperando la defensa) → otra vez Parry → «Hacerlo igual» → paga, −3, el aviso «ya estabas en negativo: la regla dice
    que no, pero se hizo igual (lo decidió la mesa)» (capturas 9, 10, 11, 12).
  - El Goblin en negativo ataca en el duelo: el cartel y «Hacerlo igual» → tira el PdG.
- **Arreglado probando**: un ataque normal en negativo, con «Hacerlo igual», se trababa («no le alcanzan los No2») y, si pasaba, ponía los No2 en 0
  (se borraba la deuda). Ahora pasa y queda en lo que estaba.
- **Quedó igual, a propósito**: el Parry o Bloqueo con «✍ Elegir manualmente» no cobra (a mano = todo a mano). Tampoco toqué el resto de las
  acciones en negativo (pasar un ítem, ayudar a soltarse, el Sueño): siguen frenando con el aviso de siempre.

## 2. 🩸 El filtro rojo del caído

- Más transparente: en el mapa, el centro casi sin color y el borde más suave; en la ficha, de 0,32 a 0,2.
- **Arreglado**: en el mapa el filtro **no salía nunca**. El resumen del personaje ponía dos veces `muerto` y el segundo (sí/no) pisaba al primero (el
  que el mapa necesitaba). Ahora sale, con «INCONSCIENTE · turnos hasta morir» y el ✚ Revivir. Probado con clics: Prueba Uno a 0 desde el círculo de
  vida (capturas 13 y 14).

## 3. 🌺 Malviaje

- **La descripción**: «Malviajando: ve a todos como enemigos, aliados y rivales por igual…», y lo de cada turno (más abajo).
- **En el duelo**: «🌺 malviajando: −2 PdG y −2 de daño» (en vez de «😱 con miedo»), y en la fórmula «−2 malviaje».
- **Atacar a un aliado malviajando**: el cartel suma «🌺 Pero estás malviajando: lo ves como a un enemigo».

## 4. 🎲 El aviso al ordenar la iniciativa (y 5. la Prisa)

- **Ahora**: al apretar Ordenar, cada jugador ve al centro **«Terminó la ronda de iniciativa»** con «Prueba Dos: quedaste en el puesto 2»; el que
  quedó primero por Prisa, **«Prueba Uno: quedaste primero porque tenés Prisa»**. La Crónica (la ve el GM) dice el orden de los personajes. El puesto
  cuenta lo que ven los jugadores (sin las filas ocultas). Reemplaza al aviso suelto de la Prisa.
- **Probado** (capturas 1 a 5): J1 le sumó a Prueba Uno la pasiva Prisa con clics (+ Pasiva → Prisa → Agregar); el orden con Prueba Dos 9, Goblin
  tunelero 8, Cultista 5, Goblin ballestero 5, Goblin picapiedras 3 y Prueba Uno; J1 escribió su iniciativa a mano: **1, la más baja**. El GM apretó
  Ordenar → el cartel de Prisa → «✔ Aplicar» → **Prueba Uno quedó primero** (por la Prisa, no por el número). J1 y J2 recibieron su aviso.

## Pedidos agregados

- **El nombre en la Mesa** de la tirada de un personaje ajeno en el duelo (salía «Prueba Uno (Jugador 2)»): ahora va con su dueño. Probado: el GM tiró
  el PdG después de que Prueba Dos se defendió, y en la Mesa (del GM y de J1) salió «Prueba Dos (Jugador 2) · Evasión» (captura 17).
- **🌺 Malviaje al empezar el turno**: en el cartel «▶ Empieza tu turno» aparece «🌺 Estás malviajando» con lo que va a pasar. Al tocar «✔ Aplicar»
  tira su Res.Mt contra el Ef.Esp de quien se lo puso (guardado en el estado; si no está, lo elige el GM si aplica él, o vale 8). Si gana, juega
  normal (con el −2); si pierde, 1d6: 1–3 «escapá: usá tu movimiento para alejarte de todos», 4–6 «atacá al más cercano, aliado o rival» — eso lo
  hace el jugador a mano. Las tiradas, a la Mesa; el resultado, al cartel y a la Crónica. Probado las dos ramas: Ef.Esp 6 → Res.Mt 8, resistió
  (capturas 18, 19); Ef.Esp 20 → no resistió, 1d6 = 2, escapa (capturas 20, 21).

## Para tener en cuenta

- **Malviaje en creeps**: los creeps no tienen el cartel de «Empieza tu turno», así que su tirada de Malviaje queda a mano por ahora.
- **De dónde sale el Ef.Esp**: hoy nada guarda el Ef.Esp de quien pone el Malviaje (no hay todavía habilidad o ítem que lo dé); cuando exista, que lo
  guarde en el estado (`efEsp`). Mientras, el número lo elige el GM o vale 8.
- **Otra tanda en paralelo**: probaba en el mismo mapa (Prueba Uno, Escudero, Piromante, Hachero). Restauré solo lo mío: la Prisa de Prueba Uno, a
  Prueba Dos (vida, No2, equipo, estados y lo del turno), al Goblin picapiedras, el orden de turnos y los duelos de esta tanda. La vida de Prueba
  Uno la dejé como la tiene la otra tanda (la bajé a 0 para probar el filtro, y después la otra tanda volvió a tumbarlo): la restaura ella.
