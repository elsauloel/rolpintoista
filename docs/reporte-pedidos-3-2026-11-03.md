# Pedidos del 2026-11-03 (tercera tanda)

Probado en «Claude · pruebas» (1920×1080, GM, Jugador 1 = Prueba Uno, Jugador 2 = Prueba Dos), con clics, mientras otra tanda usaba el mismo
mapa (el orden de turnos no lo toqué: usé el que había, Goblin picapiedras > Prueba Dos > Basilio). Por código solo preparé (el pergamino en el
cinturón, la habilidad Provocar a un creep, la Coraza maldita a Prueba Uno) y después lo saqué. Capturas en `/home/user/capturas/`, prefijo
`t3-1103-`. Pruebas automáticas: en verde (726, con 1 nueva). Commits más abajo.

## 1. 🛡 Provocar tira Efecto especial + 2

- Antes tiraba su Probabilidad de golpe especial + su nivel. Ahora tira su **Efecto especial + 2** contra la Resistencia mental del rival.
- Los creeps que ya tenían Provocar guardado se ponen al día solos al abrirse.
- **Probado con clics**: un creep usó Provocar desde sus Acciones; el cuadro dice «Provocar · tira Ef.Esp» y tiró 1d6 → 5 (Esp 4 + 2). Cancelé el
  duelo antes de que el rival tirara, para no dejarle estados.

## 2. 🛡 El Escudero, nivel 1 aprobado

- **Con 12 · Des 7 · Agi 5 · Fue 5 · Esp 4** (33, vida 60) y la **Hacha de piedra** (Tipo 8, +1 de daño, Bloqueo +1, Rompe armadura 33 %) en vez del
  garrote. El resto igual. Con Agi 5 tiene 5 No2: un ataque (4) y 1 para moverse.
- En `docs/creeps-humanoides.md` quedaron el criterio del dueño para tanques (Agi 5 en nivel 1; Con > Des > Agi > Fue; al subir, bastante Con y Fue)
  y el boceto de atributos de nivel 1 a 5 (nv5: 16/9/7/9/4, vida 80).
- Provocar del Escudero: Ef.Esp 4 + 2 = 6 contra la Res.Mt del rival.

## 3. 🛡 La Defensa especial (y la Defensa) nunca bajan de 0

- Regla: por la Maldición de la coraza o por cualquier efecto, la Defensa especial queda en 0 como mínimo, salvo que la habilidad diga lo contrario
  (un estado con la marca `permiteNegativa`; hoy ninguno la tiene).
- **Lo que pasaba**: los creeps y las invocaciones ya tenían el piso en 0; **los personajes no**: la Coraza maldita le dejaba −2 a Larry y la Lengua
  de fuego le entraba 2 de más.
- **La Defensa física**: en los personajes tampoco tenía piso (en creeps e invocaciones sí). **Le puse el mismo piso 0**, para que todos jueguen con
  la misma regla. Si querés que la física pueda quedar negativa, se saca.
- El texto de la Mesa ahora dice «Daño especial: no se resta la Defensa; se resta la Defensa especial».
- **Probado**: a Prueba Uno le llegó la Coraza maldita (−2 y −2) y el mapa la lee con Defensa 0 y Defensa especial 0 (captura 9).

## 4. 📜 El pergamino grupal: solo a los del orden de turnos, con aviso

- Con un orden de turnos armado, el pergamino grupal (de un personaje o de un creep) les llega **solo a los aliados que están en el orden**. Sin orden
  de turnos (fuera de combate), a todos los aliados del mapa, como antes.
- A cada uno le aparece un aviso: «**Fulano usó <pergamino>**. Para <personaje>: <efecto>» con **✔ Aplicar** y **✋ Resolver a mano**. Al
  personaje de un jugador se lo muestra a su jugador (o a quien tenga el control); a un creep, al GM. «Aplicar» pone el estado; «Resolver a mano» no
  toca nada y queda anotado en la Mesa y la Crónica.
- La Mesa dice a quién le llegó y a quién no («no les llega a … : no están en el orden de turnos»).
- **Probado con clics**:
  - Prueba Uno leyó el Pergamino grupal de Paso Fantasma desde su Botonera. Le llegó el aviso solo a **Prueba Dos** (en el orden): «✔ Aplicar» → quedó
    con Paso Fantasma. A Larry, Bizzante, Rockardo y las abejas (fuera del orden) no les llegó nada (capturas 1, 2, 3).
  - El Goblin picapiedras (en el orden) usó el mismo pergamino desde sus Acciones. Le llegó al GM el aviso solo por **Basilio** (en el orden):
    «✋ Resolver a mano» → no se le puso nada y quedó anotado. Al Arquero del culto y al Goblin scout (fuera del orden) no (capturas 4, 5).
- El texto de los pergaminos grupales del catálogo ahora lo explica.

## Para tener en cuenta

- Mientras probaba, los marcos de Jugador 1 y Jugador 2 apretaron una vez «Seguir así» en un cartel de la otra tanda (el Malviaje de Prueba Dos).
  Si su reporte muestra algo raro ahí, puede venir de eso.
- Restauré lo mío: el pergamino y el Paso Fantasma de Prueba Uno y Prueba Dos, la Coraza maldita, los No2 de Prueba Uno (3), la habilidad de prueba y
  los No2 del Goblin tunelero (copia), el No2 del Goblin picapiedras y el duelo de Provocar.

## Capturas

1. `t3-1103-1-perg-cinturon-J1.png` — el pergamino en la Botonera de Prueba Uno.
2. `t3-1103-2-perg-aviso-J2.png` — el aviso a Prueba Dos, con «Aplicar» y «Resolver a mano».
3. `t3-1103-3-perg-cronica-GM.png` — la Crónica: aplicado.
4. `t3-1103-4-perg-creep-aviso-GM.png` — el aviso al GM por Basilio.
5. `t3-1103-5-perg-creep-mano-GM.png` — resuelto a mano, y la Mesa con «no les llega a…».
6. `t3-1103-8b-provocar-fin-GM.png` — Provocar tira Ef.Esp.
7. `t3-1103-9-defesp-cero-J1.png` — Prueba Uno con la Coraza maldita: Defensa especial 0.
