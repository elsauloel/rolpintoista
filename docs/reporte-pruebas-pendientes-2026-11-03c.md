# Pruebas pendientes en el mapa (tanda c) — 2026-11-03

Todo en «Claude · pruebas», a 1920×1080, con las cuentas GM, Jugador 1 (Prueba Uno) y Jugador 2 (Prueba Dos), **con clics** en el sitio publicado. Por código solo preparé:
- a Prueba Uno le di una habilidad y una poción, y a Prueba Dos unas pociones;
- a dos goblins les di habilidades de prueba y las dos armas, y los acomodé;
- puse a Prueba Uno en el orden de turnos;
- dejé al Cultista en 0 para un caso.

Al final restauré la partida y la comparé con la copia de antes: **0 diferencias**. Solo faltan unos momentos viejos de la Crónica, que el mapa ya había vencido solo. «El origen de las especies» no la toqué. Capturas en `/home/user/capturas/`, con el prefijo `pend-1103c-`.

## 🐞 Dos errores encontrados y arreglados
- **La animación del Escudo humano no cargaba.** El archivo nuevo del mapa volvía a declarar una función que ya existía (`idDeToken`). Eso rompía la carga de todo ese archivo apenas se abría el mapa. Ya está arreglado.
- **El cartel «Te alejás de…» no se iba nunca.** Pasaba si el GM movía un creep que daba ataque de oportunidad y después lo volvía a mover. Al tocar «Seguir sin esperar», el mapa retomaba el camino viejo y volvía a «alejarse» del mismo rival, así que el cartel reaparecía sin fin y tapaba los botones de abajo. Ahora, si el token ya no está donde se frenó, no retoma el camino viejo.

## ⌨ Atajos con un jugador de verdad — ✅
Prueba Uno, con su cuenta y en su token:
- Asignó el **3** a Estoicismo y **⇧1** a una Poción de HP, tocando los cuadraditos de su Botonera.
- **Con la Botonera abierta**, el 3 preguntó «¿Ejecutar Estoicismo?» y con Enter lo ejecutó. Antes preguntó si era su turno: 2 SP.
- **Con la Botonera cerrada**, Shift+1 preguntó «¿Usar Poción de HP?» y con Enter la usó.
- El 4 avisó: «⌨ 4 no tiene nada asignado».

## ⚔⚔ Creep con dos armas en el mapa — ✅
El Goblin híbrido, con el Sable del tahúr y el Facón de paisano puestos con la regla nueva de las manos:
- **En sus Acciones** aparecen dos ataques: «Atacar con Sable del tahúr · 3 No2 · 1.º ataque» y «Atacar con Facón de paisano · 2 No2 · 1.º ataque».
- **Atacó con el facón** a Prueba Uno: 1d4 + 8 y el Sangrado se tiró con d2. El Estoicismo le restó 2.
- **Después**, el facón pasó a costar 4 y el sable siguió en 3.
- **El ataque de oportunidad**, cuando Prueba Uno se alejó, usó el facón, el que tenía en la mano: «descuenta 2 No2».

## 🪤 Trampas — ✅
- **Trampa a la vista:**
  - El creep puso el Cordón oculto con una casilla dentro del cono de Prueba Uno. Salió el cartel «Estás poniendo la trampa dentro del cono de visión de Prueba Uno: la va a ver», con Avanzar y Rechazar.
  - **Rechazar** volvió a pedir la casilla.
  - **Avanzar** la dejó a la vista: Prueba Uno la ve, y la Mesa dijo «colocó una trampa a la vista de Prueba Uno».
  - En una casilla que el creep no ve, avisó «Esa casilla no la ves».
- **El Cordón nuevo**, en el turno de Prueba Uno:
  - Al pisarlo se cortó el movimiento: «tropieza y avanza una casilla».
  - Tiró Agilidad 3 contra 8 y quedó **Sentado + Tropezado**.
  - Al querer arrastrarlo: «No te podés mover ahora (Inmovilizado o Tropezado…)».
  - Al terminar su turno se le fue el Tropezado y siguió Sentado.
- **Solo lo disparan los rivales:** un creep aliado del que lo puso se paró arriba del cordón y no pasó nada.

## 🪱 Sanguijuela, ❤ Vida extra y ✨ Parpadeo — ✅
- **Sin Herida sombría:** el Cultista le pegó la Sanguijuela a Prueba Dos. Lo tenía guardado con la versión vieja y se puso al día solo. Hizo daño siniestro y dejó la Sanguijuela por 4 turnos, **sin** Herida sombría.
- **La cura robada:**
  - Prueba Dos tomó una Poción de HP y salió «la cura (+25) se la lleva la Sanguijuela de Basilio…».
  - El Cultista subió 13 de vida y le quedaron 12 de Vida extra.
  - Después, la primera cura de la Regeneración menor (+5) también fue para él.
- **Una sola Vida extra:** el Cultista quedó con un solo «Vida extra 17» (12 + 5), no con dos renglones.
- **La cura que se pierde, en la pantalla del jugador:** con el Cultista en 0, Prueba Dos tomó otra poción. Salió «❌ 🪱 La cura (+25) se pierde: quien te puso la Sanguijuela (Basilio, Cultista de la Grieta) está caído».
- **Parpadeo con Esc:** un goblin con SP, en turno ajeno, pagó 8 SP. Con Esc al elegir adónde salió «↩ … canceló Parpadeo — se le devolvió 8 SP».
- **El texto del Flash** en la lupa dice: «con SP, el doble de SP; con turnos de espera, un 50 % más de espera, mínimo +1».

## 🧠 Punzada mental — ✅
- **El costo:** un goblin con SP la usó contra Prueba Uno y gastó 1 No2 y 1 SP.
- **La tirada:** su PdG.Esp contra la Res.Mt.
- **El daño:** 1d4 directo, «no lo frena la Defensa ni la Defensa especial» (7 → 4).
- **El estado:** quedó con **Mente abierta** por 1 turno.

## Cosas que vi
- **Contra el Cordón, un personaje con Agilidad baja no puede ganar nunca:** Prueba Uno tira 1d3 (Agilidad 3) contra la Destreza 8 del goblin. Es la regla tal cual, stat contra stat; lo dejo para que lo mire el dueño.
- **En la consola de los jugadores aparece «No se pudo aplicar lo recibido: Missing or insufficient permissions»** cuando les llega un estado, como el Sentado del Cordón o la Sanguijuela. El estado igual queda bien puesto: parece un paso extra que falla. No lo toqué.
- **El Goblin híbrido se llama «Goblin scout» en la Mesa y en el orden.** Su ficha tiene otro nombre que el token.

## No llegué
- Escudo atado al antebrazo con clics, en una ficha y en GM Tools.
- El L4, el T3 y el L5 en «+ Creep».
- La Transfusión de creep con el número escrito, y «Potencia» (ex Empuje).
- El aviso de oportunidad negada con Bomba de humo, Salto, Dash, robo y el caso al revés.
- La Centella y la Sanguijuela de la clase Debuffer.
- El Relicario de sangre con Vida extra.
- ¡Al frente! cancelado con Esc.
- El contraataque con la segunda arma.
- El Valor del botín y «Ver el grupo»: hace falta cerrar un combate entero.
- Volver a probar en el mapa el arreglo de «Seguir sin esperar».

## Commits
- `ae809b45`: 🐞 Escudo humano (animación): no volver a declarar `idDeToken`. Archivos: `vtt-hexgrid/js/95-escudo-humano-fx.js` y `mapa.html`.
- `f78ae608`: 🐞 Oportunidad: «Seguir sin esperar» no retoma el camino viejo. Archivos: `vtt-hexgrid/js/17-oportunidad.js` y `mapa.html`.
- `dbdc07d1`: lo tildado en `docs/pruebas-en-el-mapa.md`.

## Capturas (las mejores)
1. `pend-1103c-03-atajo-pregunta-botonera-abierta.png`: «¿Ejecutar Estoicismo?» con la Botonera abierta.
2. `pend-1103c-08-creep-dos-armas-acciones.png`: un «Atacar con…» por arma.
3. `pend-1103c-18-trampa-a-la-vista-cartel.png`: el cartel de la trampa a la vista.
4. `pend-1103c-23-cordon-resultado.png`: el Cordón, con Agilidad 3 contra 8.
5. `pend-1103c-24-cordon-sentado-tropezado.png`: Sentado + Tropezado.
6. `pend-1103c-29-pocion-robada-j2.png`: la poción que se lleva la Sanguijuela.
7. `pend-1103c-31-cura-perdida-j2.png`: la cura que se pierde, en la pantalla del jugador.
8. `pend-1103c-37-punzada-mente-abierta.png`: la Punzada mental.
