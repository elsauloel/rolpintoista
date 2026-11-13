# Pruebas pendientes en el mapa (tanda b) — 2026-11-03

Todo en «Claude · pruebas», a 1920×1080, con las cuentas GM, Jugador 1 (Prueba Uno) y Jugador 2 (Prueba Dos), **con clics** en el mapa, GM Tools y la ficha. Por código solo preparé: les di habilidades de prueba a los creeps, los acomodé, armé el orden de turnos, di pociones y armas, y saqué estados para probar cada caso. Al final restauré la partida y la comparé con la copia de antes: **0 diferencias**. «El origen de las especies» no la toqué. Capturas en `/home/user/capturas/`, con el prefijo `pend-1103b-`.

## ⭐ «+ Creep» y el pool esencial con SP — ✅
- **Las tres pestañas:** ⭐ Pool esencial (7), 🗺 Pool de campaña (6) y 🗄 Referencia (sin auditar) (269). Las de los magos y los debuffers dicen «(con SP)».
- **Agregué al Piromante, el Escudero y el Maldito y los traje al mapa con 🎭:**
  - El Piromante y el Maldito arrancan **con SP**: «Con SP · 39/39 (recarga 6)» y la barra azul en el token. Sus habilidades cobran SP y no ponen espera.
  - El Escudero sigue **con turnos de espera**.
- **🐞 Arreglado:** si un creep con la barra de SP llena cancelaba una habilidad con «No cuenta», se le devolvían los No2 pero **no el SP** (el Zap del Piromante: quedó en 39/42). Ahora vuelve todo. Lo volví a probar: 42/42. `vtt-hexgrid/js/12-acciones-nuevas.js`.

## 😮‍💨 Robar el aliento — ✅
El Maldito se la tiró a Prueba Uno: 5 contra 3, así que perdió **1 + 2 = 3 No2** (6 → 3). Con SP la repitió en el mismo turno. Cancelada con «No cuenta», le devolvió 2 No2 y 3 SP.

## ✨ Parpadeo y ⚡ Flash en turno ajeno — ✅
- **Parpadeo del Maldito:** **−4 SP** en su turno y **−8** en el de otro. La Mesa dice «cuesta más (8 SP, el doble)».
- **Parpadeo del Escudero (con espera), en el turno de otro:** queda **en espera 3**. La Mesa dice «cooldown 3 en vez de 2».

## 💨 Aviso de oportunidad negada — ✅ en parte
En la pantalla de Prueba Uno sale el cartel «Sin ataque de oportunidad: X se alejó de Prueba Uno con …», con «Entendido», y la línea queda en la Mesa. Probado con:
- **Parpadeo** del Maldito.
- **Disparo y repliegue** del Escudero.
- **Hit and run** del Escudero.

## 💨 Disparo y repliegue (primero se mueve) — ✅
1. Sale el cartel «se reacomoda antes de disparar».
2. Arrastré el token: se movió gratis (−0 No2) y pidió el objetivo desde la casilla nueva.
3. El daño sumó **+2** («1d8 + 6 + 2»).
4. Después del golpe no apareció el cartel de alejarse.
5. No cobró dos veces.

El Hit and run sigue como antes: pega y después se aleja.

## 😤 Provocar y ⚡ Zap — ✅
- **Provocar:** el Escudero tira «PdG.Esp · 1d4+1» (su Especial más su nivel) contra la Res.Mt.
- **Zap:** no se esquiva, y Prueba Uno tira **Res.CC** para la Parálisis. La Centella no la probé.
- **Creeps guardados con la versión vieja** (Robar el aliento con 2 No2, Parpadeo con 2 SP, Provocar con Ef.Esp + 2): al guardarse se pusieron al día solos.

## 🪱 Sanguijuela y 🌿 el primer tick de la Regeneración — ✅
El Maldito le pegó la Sanguijuela a Prueba Dos.
- **Con Herida sombría** (la deja el mismo golpe, porque es siniestro): la Poción de HP no entra y el Maldito no recibe nada.
- **Sin Herida** (se la saqué para probar):
  - **Poción de HP:** «🪱 la cura (+25) se la lleva la Sanguijuela de Maldito». El Maldito, lleno, recibe **25 de Vida extra**.
  - **Poción de Regeneración menor:** la primera cura (+5) también se la lleva el Maldito, como Vida extra.
- **Con el Maldito caído:** Prueba Dos no se cura, y la Mesa del GM dice «… se pierde».
- **Prueba Uno con Herida sombría y la Regeneración:** la primera cura no entra.

## 🧪 Poción de Regeneración menor — ✅
Prueba Uno la tomó. Al empezar su turno siguiente: «3 → 2 turnos · +5 HP · 4 → 9». Solo a él: Prueba Dos, pegado, no cambió.

## 🔪 Facón de paisano (Tipo 4, Sangrado 50 %) y dos armas — ✅
Prueba Uno con el Sable del tahúr y el Facón puestos.
- **En la Botonera:** el sable dice «3 No2 · 1.º ataque» y el facón «2 No2 · 1.º ataque». El daño del facón es 1d4 + Daño.
- **Atacó al Escudero con el facón:** pagó 2. El efecto se tiró con **d2**.
- **Después:** el sable seguía en 3 (su primer ataque) y el facón pasó a 4.

## 🔍 «Ver detalle del duelo» y ☁ nubes que se van — ✅
- **El recuadro del duelo:** se abre desde el GM y desde un jugador, y se cierra con Aceptar, ✕, Esc o un clic afuera.
- **La Nube tóxica:** al borrarse se agranda un poco y se apaga en unos 1,6 segundos.

## Cosas que vi
- **La Sanguijuela siempre deja Herida sombría,** porque su daño es siniestro. Durante el primer turno la Herida tapa a la Sanguijuela: no hay cura que robar. Es una cuestión de diseño para el dueño.
- **El aviso de la poción con Herida sombría** no dice que la primera cura no entró. Cura bien, es solo el texto.
- **Con el lanzador caído,** al jugador le sale «se la lleva la Sanguijuela» y no dice que se pierde. La Mesa del GM sí lo dice.
- **El Maldito queda con dos «Vida extra» separadas** (25 y 5) en vez de una sola de 30.
- **En el duelo de la Sanguijuela** dice «Drena: Maldito se cura 3 · 40 → 40» aunque estaba lleno.
- **Si se cancela el destino del Parpadeo con Esc,** el SP gastado no vuelve.
- **El texto del Parpadeo** dice «en turno ajeno cuesta el doble», pero con turnos de espera ahora es un 50 % más.
- **«Rockardo Petroshvnick Son (copia)»** apareció en la Mesa con «Regeneración (pasiva) +3 HP · 39 → 40». No sé si fue de esta tanda: su ficha no estaba en la copia de antes, así que no se restauró.

## No llegué
- **El aviso de oportunidad negada** con la Bomba de humo, el Salto, el Takle, el Dash y la huida de un robo. Tampoco el caso al revés (un jugador que se aleja de un creep: el aviso le sale al GM) ni los casos sin aviso.
- **La Sanguijuela de la clase Debuffer.**
- **La Centella.**
- **El Facón en un creep,** y el tercer tick de la Poción de Regeneración menor con su vencimiento.
- **El 💰 Valor del botín y el 📋 Ver el grupo:** hay que terminar un combate de prueba entero.
- **El ⭐ Co-GM desde Jugadores:** llegué hasta el cartel de confirmación y lo cancelé. Quedó todo como estaba.
- **El 🔔 aviso de propuestas al dueño:** no se puede probar sin la cuenta del dueño.

## Commits
- `22da9d79`: el SP que no volvía al cancelar con la barra llena.
- `32d98472`: lo tildado en `docs/pruebas-en-el-mapa.md`.

## Capturas (las mejores)
1. `pend-1103b-01-creep-tabs.png`: las tres pestañas de «+ Creep».
2. `pend-1103b-08-acciones-maldito-sp.png`: el Maldito «Con SP · 39/39» y el Parpadeo a 4 SP.
3. `pend-1103b-15-parpadeo-aviso-J1.png`: «Sin ataque de oportunidad» en la pantalla de Prueba Uno.
4. `pend-1103b-20-repliegue-cartel.png`: «se reacomoda antes de disparar».
5. `pend-1103b-21-repliegue-aviso-J1.png`: el aviso por Disparo y repliegue.
6. `pend-1103b-31-pocion-robada-J2.png`: la poción que se lleva la Sanguijuela.
7. `pend-1103b-42-regen-aplicada-J1.png`: la Regeneración menor (+5, 4 → 9).
8. `pend-1103b-43-botonera-dos-armas.png`: sable 3 y facón 2, cada uno con su primer ataque.
9. `pend-1103b-47-tras-facon-costos.png`: después del facón, el sable sigue en 3 y el facón pasa a 4.
10. `pend-1103b-51-nube-se-va.png`: la nube que se disipa (tira de 6 cuadros).
