# Prueba de humo de los creeps esenciales — 2026-11-03

Todo en «Claude · pruebas», a 1920×1080, con las cuentas GM, Jugador 1 (Prueba Uno) y Jugador 2 (Prueba Dos), **con clics**. Por código solo
preparé (acomodar un token, devolverle la vida a Prueba Uno) y limpié al final. La IA de proponer creeps y el glosario **no** se probaron:
quedan para cuando el dueño esté en la compu. Capturas en `/home/user/capturas/`, con el prefijo `humo-1103-`.

En paralelo otra tanda probaba la Prisa y los No2 negativos en el mismo mapa, con el orden de turnos: por eso **no** probé que los cooldowns
bajen al pasar los turnos (habría pisado su orden de turnos).

## Agregarlos

- GM Tools → «+ Creep» → **⭐ Pool esencial**: agregué los seis (Escudero, Piromante, Sangrador, Sanador, Hachero, Maldito). Todos salen con su
  equipo del catálogo (armas, piezas, varitas, orbes, talismanes), sus dos habilidades y su consumible en el cinturón. ✅
- Al mapa con 🎭 → «👹 Traer creeps…»: salen ocultos y se revelan desde el globo del token. ✅

## En combate

- **Escudero — Piel de hierro**: Defensa 5 → 9 y Def. especial 2 → 6 (+4 en nivel 1), +1 a la resistencia a crítico, 2 turnos; −1 No2 y
  cooldown 3. ✅
- **Escudero — Provocar** contra Prueba Uno: PdG.Esp 6 contra Res.Mt 3 → Prueba Uno queda **Provocado** 2 turnos y el Escudero **Desafiante**
  (+2 Defensa y Def. especial) 2 turnos. ✅
- **Escudero defendiendo**: Prueba Uno (sin arma) le pega; el Escudero hace **Parry con el Garrote** (1 No2), empatan el Bloqueo, se resuelve con
  par o impar y pasa la mitad: 4 de daño − 5 de Defensa → 0. El garrote pierde 1 de durabilidad. ✅
- **Piromante — Lengua de fuego** contra Prueba Uno: PdG.Esp 7 contra Evasión 1 → 2d6 + 3 de fuego (un cuarto de su Ef.Esp 14), más +2 de la
  **Botella con un diablito**; salió un 1 en los dados y el diablito le hizo 2 de fuego al Piromante (cartel «¡Te quemó!»). Prueba Uno cae y
  queda con **Quemadura** 3 turnos. La habilidad queda en **cooldown 4**. ✅
- **Piromante — Muro de fuego**: pregunta el largo (4 a 8 casillas, cada una más cuesta más), se marca dónde empieza y hacia dónde sigue, y queda
  el muro de 4 casillas por 3 turnos. ✅ (No probé cruzarlo.)
- **Hachero atacando** a Prueba Uno: PdG 6 contra Evasión 2 → **1d8 + 9 = 17** a la vida (Prueba Uno cae de un golpe); el Rompe armadura (50 %) no
  salió. ✅
- **Consumibles en medio de la pelea**: Escudero, **Poción de Cuero Duro** y **Poción de Piel de Cristal** (escudo de 15 cada una, la segunda
  usada con 0 No2: «¿Usarlo igual?»). Piromante, **Poción de SP menor**. ✅ (con lo de abajo)
- Las tiradas de los creeps van a la Mesa con su nombre en rojo. ✅

## Arreglado

- **🧪 Las pociones de escudo en un creep** (`comun/creep-acciones.js`, commit `59a3582f`): la Poción de Cuero Duro le daba al creep un escudo que
  paraba **todo** (también la magia) y que no se iba al pasar el día; a un personaje ya le llegaba bien. Ahora el creep recibe las mismas marcas:
  Cuero duro solo contra lo físico, Piel de cristal solo contra lo especial, se gastan y se van al pasar el día. Probado en el mapa con la Piel de
  cristal. Prueba automática nueva.
- **🎲 «Escudero (Jugador 1)» en la Mesa** (`comun/duelo.js`, commit `b7a7f765`): cuando la tirada de un creep en el duelo la publicaba la pantalla
  del jugador, entre paréntesis salía la cuenta del jugador. Ahora sale la del GM. Prueba automática nueva. Pruebas automáticas: 722 en verde.

## Para que decida el dueño

- **La Poción de SP menor no le hace nada a un creep**: los creeps (salvo los que están «en modo SP») no tienen SP; sus habilidades van por
  cooldown. El Piromante la usa, paga 1 No2 y no pasa nada. Opciones: que al creep le baje 1 el cooldown de una habilidad, ponerle al Piromante
  el modo SP, o cambiarle el consumible.
- **El Escudero no puede atacar con su arma sin saltarse la regla de nitros**: tiene **3 No2** (sale de su Agilidad 3) y atacar con el Garrote cuesta **5**. Solo
  puede hacerlo «igual». Para un tanque puede estar bien (provoca y aguanta), pero conviene saberlo.
- **El Hachero pega 1d8 + 9** (su Fuerza entera): 10–17 de daño en nivel 1 contra personajes de 15 de vida. Es una amenaza de verdad; quizá
  demasiada.
- **El Escudero para con el Garrote, no con el escudo**: el Parry solo ofrece el arma. El escudo cuenta en el Bloqueo y la Defensa.

## Cosas raras que vi

- Al Escudero se le borraron juntos **Piel de hierro y Desafiante** en el mismo segundo, sin que pasara un turno (los cooldowns no bajaron). No lo
  pude repetir; puede haber sido algo de la otra tanda, que estaba moviendo el orden de turnos.
- El aviso de un muro dice «🌫 Muro de fuego colocada» (la nube y el femenino).
- **Sin querer, apreté un botón en un duelo de la otra tanda** (Goblin picapiedras → Prueba Dos, «Pagar y tirar PdG») y después «Respetar la
  regla». Queda anotado por si su reporte muestra algo raro en ese duelo.

## Qué no se probó

- Que los cooldowns bajen al pasar los turnos (la otra tanda usaba el orden de turnos).
- Cruzar el Muro de fuego.
- El Sangrador, el Sanador y el Maldito en pelea (se agregaron y cargan completos, pero no pelearon).

## Restauración

Borré los creeps de prueba, sus tokens, el muro y los duelos míos; a Prueba Uno le devolví la vida (6), los No2, sin Provocado ni Quemadura.
Comparado con la copia de antes: lo que queda distinto es de la otra tanda (la Prisa de Prueba Uno, los No2 y el inventario de Prueba Dos, su
duelo y sus avisos). «El origen de las especies» no lo toqué.

## Capturas

1. `humo-1103-7-piel-hierro.png` — Piel de hierro: Defensa 9 y Def. especial 6, cooldown 3.
2. `humo-1103-10-provocar-resultado-GM.png` — Provocar: Provocado y Desafiante para aplicar.
3. `humo-1103-15-lengua-dano-GM.png` — Lengua de fuego: el daño y la Quemadura.
4. `humo-1103-17-lengua-fin-GM.png` — el diablito se ríe: «¡Te quemó!».
5. `humo-1103-19-piromante-cd4.png` / `humo-1103-20-muro-apuntar.png` — Lengua en cooldown 4; el largo del Muro de fuego.
6. `humo-1103-24-muro-puesto.png` — el muro puesto.
7. `humo-1103-49-gm.png` — el Hachero: 17 a la vida.
8. `humo-1103-53-pj-ataca-escudero-GM.png` / `humo-1103-57-escudero-recibe-GM.png` — el Escudero elige Parry y para casi todo.
9. `humo-1103-27-piel-cristal.png` — la Piel de cristal usada con 0 No2.
