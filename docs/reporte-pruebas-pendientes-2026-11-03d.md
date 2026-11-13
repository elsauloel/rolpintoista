# Pruebas pendientes en el mapa (tanda d) — 2026-11-03

Todo en «Claude · pruebas», a 1920×1080, con las cuentas GM, Jugador 1 (Prueba Uno) y Jugador 2 (Prueba Dos), **con clics**, en el sitio publicado.

**Por código solo preparé:**
- A Prueba Uno le di Dash, Bomba de humo y Sanguijuela de clase, más nitros y SP para usarlas.
- Al Goblin picapiedras le di Dash, Bomba de humo, Salto, Potencia y Transfusión.
- Moví tokens, armé el orden de turnos y le bajé la vida al Arquero del culto.

Al final restauré la partida y la comparé con la copia de antes: **0 diferencias mías**. Solo quedan distintos los nombres que cambió la otra tanda (Goblin Scout, Basilio) y unos momentos viejos de la Crónica que el mapa vence solo. «El origen de las especies» no la toqué. Capturas en `/home/user/capturas/`, con el prefijo `pend-1103d-`.

## 🔁 «Seguir sin esperar» (el arreglo de la tanda c) — ✅
1. El GM alejó un creep de Prueba Uno y salió «Te alejás de Prueba Uno… Seguir sin esperar».
2. Moví el creep de nuevo y toqué «Seguir sin esperar».
3. El cartel **no volvió a aparecer** (lo miré 8 segundos). En la Mesa: «siguió sin esperar: Prueba Uno no contestó a tiempo».

## 💨 Aviso de oportunidad negada — ✅ lo que faltaba
- **Un jugador que se aleja de un creep:** Prueba Uno, con su cuenta, usó el **Dash de clase** para alejarse del Goblin. Al GM le salió el cartel con «Entendido»: «💨 Prueba Uno se alejó de Goblin picapiedras con Dash: no permite ataque de oportunidad».
- **Dash de un creep:** el Goblin se alejó de Prueba Dos con Dash. A Prueba Dos le salió el cartel con «Entendido», y la línea quedó en la Mesa.
- **Bomba de humo** (de clase y de creep): no sale el aviso, porque el que se va entra en Sigilo y el rival ya no lo ve. Es lo que dice la regla: no avisa si no lo ve.

## 🩸 Transfusión de creep con el número — ✅
El Goblin le pasó vida al Arquero del culto.
- **El cartel** «🩸 ¿cuánta vida?» dice «De Goblin picapiedras (18 de vida) a Arquero del culto (25 de 40)… de 1 a 5», con los atajos 1, 3 y 5.
- **Con 9:** «⚠ Como mucho 5: escribiste 9», y no dejó seguir.
- **Con 4:** el Goblin pasó de 18 a 14 y el Arquero de 25 a 29, y la Mesa lo dice.

## 💪 Potencia (ex Empuje) — ✅
El Goblin usó «Potencia» sobre el Arquero.
- El duelo mostró «Empower · entra siempre» y el botón «Aplicar Empower».
- El Arquero quedó con **Empower**.
- Cobró 2 SP y ningún nitro.

No probé el caso de un creep guardado con «Empuje».

## 🪱 Sanguijuela de clase — ✅
- **La pegó:** Prueba Uno, con su cuenta, la usó contra el Goblin. Tiró PdG.Esp y el Goblin defendió con Evasión. Hizo 2d6 de daño, que frenó su escudo, y el Goblin quedó con **Sanguijuela/4 y sin Herida sombría**.
- **La cura robada:** después el Goblin recibió +3 con una Transfusión, y salió «🪱 la cura (+3) se la lleva la Sanguijuela de Prueba Uno: Goblin picapiedras no se cura».
- **Le llegó a Prueba Uno:** como estaba lleno, le salió «tu Sanguijuela te trajo 3 de vida · 3 de Vida extra», y quedó con un solo estado «Vida extra».

## ⭐ L4, T3 y L5 en «+ Creep» — ✅
- En GM Tools, «⭐ Pool esencial (27)» trae al Hostigador con trampas, al Guardaespaldas y al Duelista.
- Los agregué y salieron con su equipo, habilidades, consumible y vida (Guardaespaldas 60, Duelista 35, Hostigador 35), con turnos de espera.
- Después los borré.

## Cosas que vi
- **En la consola de Prueba Uno sigue apareciendo** «No se pudo aplicar lo recibido: Missing or insufficient permissions». Lo está viendo la otra tanda.
- **Un creep quedó en −37 nitros** después de moverse con el movimiento libre de su Bomba de humo; tenía 7. No lo pude reproducir: el cálculo del movimiento da 0, y un movimiento normal después no cobró de más. Puede haber sido el arrastre por el borde del mapa. Queda para mirar.
- **Al preparar habilidades de creep por código hay que darles un `id`:** sin él, el botón «Ejecutar» no hace nada. Al agregarlas desde el editor no pasa; es solo para las pruebas.
- **Los nitros de un personaje se recortan a su máximo** al recalcular la ficha. Prueba Uno tiene 3, así que lo que parecía un cobro de más con la Bomba de humo era eso.

## No llegué
- Escudo atado al antebrazo con clics en una ficha. En GM Tools ya se probó en la tanda de las manos de los creeps.
- El aviso de oportunidad negada con Salto, Takle y la huida de un robo.
- La Centella.
- El Relicario de sangre con Vida extra, y dos Vida extra guardadas de antes.
- ¡Al frente! cancelado con Esc.
- El contraataque con la segunda arma.
- Un creep guardado con «Empuje» que pasa a llamarse «Potencia».
- El Valor del botín y «Ver el grupo»: hay que cerrar un combate entero.

## Commits
- `75578ffe`: lo tildado en `docs/pruebas-en-el-mapa.md`. No hubo cambios de código.

## Capturas (las mejores)
1. `pend-1103d-02-seguir-sin-esperar-ok.png`: el cartel ya no vuelve.
2. `pend-1103d-05-gm-aviso-dash-jugador.png`: al GM, «Prueba Uno se alejó… con Dash».
3. `pend-1103d-16-j2-aviso-dash-creep.png`: a Prueba Dos, el Dash del creep.
4. `pend-1103d-17-transfusion-creep-numero.png`: el cartel del número.
5. `pend-1103d-18-transfusion-creep-aviso.png`: «Como mucho 5: escribiste 9».
6. `pend-1103d-21-potencia-aplicada.png`: Potencia → Empower.
7. `pend-1103d-28-j1-cura-robada.png`: la cura robada le llega a Prueba Uno.
8. `pend-1103d-29-pool-esencial.png`: el pool esencial con 27.
