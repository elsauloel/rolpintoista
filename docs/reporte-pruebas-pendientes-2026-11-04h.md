# Pruebas pendientes en el mapa (tanda h)

Probé 8 de los 9 puntos con clics en «Claude · pruebas». En la prueba 8 (Vidas extra viejas) encontré un error y lo arreglé. No llegué a la prueba 9 ni al arreglo del Arma elemental.

Cuando quise crear el reporte en `docs/reporte-pruebas-pendientes-2026-11-04h.md`, la herramienta no me dejó. Por eso no está en el repo: el texto completo es este mensaje.

Al final volví todo a la copia y comparé: los 36 creeps, las 128 partes de fichas, los 16 tokens, el orden de turnos y la tienda quedaron iguales. «El origen de las especies» no se tocó.

## Lo que anduvo
1. ✅ **«Agregar» destacado:** fondo cobre y negrita (captura 01).
2. ✅ **Globo de Piel de hierro:** al pasar el mouse muestra la descripción (captura 02). *Para mirar:* el texto dice +6, pero suma +4.
3. ✅ **Cultista en GM Tools:** ya no está la fila «Sin arma (nada en la mano)» y aparece la nota «Sin arma física…» (captura 03).
4. ✅ **Tienda de inicio:** 62 ítems, publicada; el jugador ve «nada se agota» (capturas 04 y 05). *Para mirar:* con solo abrir el generador se rearma la góndola.
5. ✅ **Arrastrar guardado con la versión vieja:** se actualizó sola y las Acciones dicen «2 SP · 2 No2». El duelo (8 contra 2) movió a Prueba Uno de 21,12 a 21,14 y los No2 bajaron de 8 a 6 (capturas 06 a 08).
6. ✅ **Permisos con el mapa y la ficha abiertos:** tres estados, cada uno aplicado una sola vez, sin cartel rojo (captura 09).
7. ✅ **Robo en sigilo:** salió «Pasos a tu espalda», el oro de Prueba Uno bajó de 300 a 288 y el goblin se quedó con 12 (capturas 10 a 13).
   - *Para mirar:* en el Bolsillo ajeno apareció «recién arrastrado: +2 PdG». Parece que ese +2 también se suma a la tirada del robo.
   - ✅ **Robo propio de un personaje:** la Poción de Piel de Cristal pasó del cinturón del goblin al de Prueba Uno (capturas 14 y 15).
8. ✅ **Vidas extra viejas — había un error y lo arreglé.** Le puse al goblin dos Vidas extra aparte, de 5 y 3. Al llegarle el turno tenía una de 8 y además seguía la de 3: la vida extra se contaba dos veces (captura 16).
   - Pasaba con creeps, invocaciones y personajes, siempre que en ese turno no se terminara ningún estado.
   - Ahora se juntan en la lista guardada. Agregué una prueba en `comun/pruebas.html`: sin el arreglo falla y con el arreglo pasan las 769.
   - Subí la versión de `combatiente.js` a `20261104h` en los 10 HTML que la usan.
   - Lo probé de nuevo con clics: queda una sola Vida extra de 8 (captura 17).

## No llegué
- **Prueba 9:** Arma elemental de creep a creep, 💔 vida en 0 desde el mapa y Arma elemental en una invocación quedaron sin probar.
- **Arma elemental que cobra antes de elegir a quién:** no lo arreglé. Esto es lo que encontré leyendo el código:
  - **Personaje** (`bnElegirObjetivo`, en `vtt-hexgrid/js/11-botonera-nueva.js`): si cancelás al elegir a quién, no se devuelve nada. Lo cobrado queda anotado y hay una función que sabe devolverlo, pero solo se usa cuando se cancela un duelo.
  - **Creep** (`acElegirObjetivo`, en `vtt-hexgrid/js/12-acciones-nuevas.js`): solo devuelve si el nombre coincide. Al elegir el elemento pasa a llamarse «Arma elemental: Arma ígnea», mientras lo anotado dice «Arma elemental». Calculo que por eso no devuelve; **no lo comprobé con clics**.
- **Avisos que pueden haber quedado:** los «Empieza el turno de…» que salieron al pasar turnos pueden seguir abiertos en el mapa. No estaban en la copia y no los borré.

## Subido a `nueva-version`
- `dc96eb9b` — el arreglo de la Vida extra, con su prueba y la versión nueva.
- `9dcc5a40` — los resultados anotados en `docs/pruebas-en-el-mapa.md`, con lo que no llegué a probar sin tildar.

Las 8 mejores capturas (01, 02, 05, 08, 13, 15, 16 y 17) quedaron en `/tmp/claude-0/-home-user/edeb9ab8-ceef-5963-b361-ad76b93d7e79/scratchpad/pend-h/`. Apagué el programa que manejaba los navegadores.
