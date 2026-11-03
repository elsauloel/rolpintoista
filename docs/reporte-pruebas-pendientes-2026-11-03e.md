# Pruebas pendientes en el mapa (tanda e) — 2026-11-03

En «Claude · pruebas», a 1920×1080, con las cuentas GM y Jugador 1 (Prueba Uno), **con clics**, contra el código nuevo (servidor local).

**Por código solo preparé:**
- A Prueba Uno le puse armas y escudos en la mochila.
- Al Goblin picapiedras le di Salto, Takle, Centella y una habilidad guardada como «Empuje».
- Moví tokens y le pasé estados a Prueba Uno para buscar el error de permisos.

Al final restauré la partida y la comparé con la copia de antes: **0 diferencias**. Solo faltan unos momentos viejos de la Crónica, que el mapa vence solo. «El origen de las especies» no la toqué. Capturas en `/home/user/capturas/`, con el prefijo `pend-1103e-`.

## Los tres puntos de la tanda d

### 1. El error de permisos en la consola de los jugadores — encontrado
- **Cómo lo reproduje:** le mandé estados a Prueba Uno con **el mapa y la ficha suelta abiertos a la vez**.
- **La causa:** las dos pantallas del mismo jugador intentan aplicar el mismo aviso al mismo tiempo. Una lo marca como aplicado. La otra ya había empezado y, al guardar, las reglas no la dejan marcar como aplicado algo que ya lo está, así que Firebase contesta «Missing or insufficient permissions». El estado igual queda puesto una sola vez, porque lo aplicó la primera pantalla.
- **Con el arreglo de la otra tanda** (commit 0d9c7674), ese rechazo cuenta como «ya lo aplicó otro»:
  - el cartel «No se pudo aplicar lo recibido» **ya no aparece**;
  - el estado queda bien puesto.
  - Lo probé con Lento, Marcado, Debilitado, Expuesto, Sentado, Tropezado y Pajaritos, con y sin el 🎮 control del GM.
- **Lo único que queda** es la línea gris del navegador «Failed to load resource: 403». Es la respuesta de Firebase a ese intento, que el navegador anota solo, y no hace nada.
- No hace falta cambiar las reglas.

### 2. El creep en −37 nitros — encontrado y arreglado
- **La causa:** el movimiento libre de la Bomba de humo (y del Hit and run y del Disparo y repliegue) se trataba como un **dodge roll**. El dodge roll se hace aunque no alcancen los nitros y deja en negativo. Así, lo que se arrastraba **de más** de los 3 casilleros gratis se cobraba sin tope y lo dejaba muy en negativo.
- **Lo reproduje con el código publicado:** el goblin, con 0 nitros, arrastrado 10 casilleros con «Bomba de humo», quedó en **−7**.
- **El arreglo:** los primeros N casilleros siguen gratis. Lo que se pase **se paga como cualquier movimiento**, y si no alcanza sale el cartel de siempre («Mover 11 casilleros cuesta 8 No2 y tenés 6… no se puede hacer»). El dodge roll de verdad sigue igual.
- **Lo probé con clics:**
  - Con 6 nitros, arrastrar 5 casilleros cobró 2 y quedó en 4.
  - Arrastrar 11 casilleros mostró el cartel y no se movió.
- Commit `985d3b5e` (`vtt-hexgrid/js/06-mouse.js`). No tiene prueba automática, porque la página de pruebas no carga el código del mapa.

### 3. La Bomba de humo y el aviso de oportunidad negada — es así, a propósito
En el código, la Bomba de humo **primero** pone el Sigilo y **después** abre el movimiento libre, tanto para creeps como para personajes. Como el rival ya no lo ve, no se le avisa, y eso es lo que dice la regla: «no avisa si no lo ve». No lo cambié.

## Lo que quedaba sin probar

### 💪 Escudo atado al antebrazo en una ficha — ✅, con un arreglo
- **🐞 Encontrado:** con el sable y el facón puestos, tocar «Equipar» en el **Brazal de cuero tachonado** abría «Manos no tiene lugar… Reemplazar». La cuenta de las manos estaba bien, pero el botón Equipar usaba otra que contaba el brazal como una mano.
- **Arreglado** (commit `fb4e2636`, `comun/ficha-equipo.js`, con prueba automática). Probado de nuevo con clics:
  - **Sable + facón + Brazal:** entra, y en Equipo dice «Manos (armas y escudos) 2 / 2».
  - **Escudo de hierro macizo encima:** pide reemplazar, como corresponde.
  - **Mazo de bombo (dos manos) + Brazal:** entra.

### 💨 Aviso de oportunidad negada con Salto y Takle — ✅
El Goblin estaba pegado a Prueba Uno.
- **Con Salto,** saltó sobre Prueba Dos.
- **Con Takle,** corrió hasta Prueba Dos.

En las dos, a Prueba Uno le salió «Sin ataque de oportunidad: Goblin picapiedras se alejó de Prueba Uno con Salto / con Takle: no permite ataque de oportunidad.», ya **sin** la frase «No hace falta preguntar…».

### ⚡ Centella — ✅
El Goblin le tiró la Centella a Prueba Uno: tiró su PdG.Esp, y a Prueba Uno le ofreció defenderse de la Parálisis con **«🛡 Res.CC»**.

### 💪 Un creep guardado con «Empuje» — ✅
Le guardé al goblin una habilidad llamada «Empuje». Al guardarse **se renombró sola a «Potencia»**.

## Cosas que vi
- **Prueba Uno estaba Sentado y le salió igual el aviso de oportunidad negada.** Sentado no puede atacar, así que el aviso sobra. Es menor.
- **Al cancelar el Takle y la Centella con «No cuenta»**, la Mesa dice «se le devuelve … 6 SP» o «5 SP» a un creep que juega con turnos de espera, no con SP. Parece solo el texto, porque cuenta el SP del Flash igual. Queda para mirar.
- **Si el movimiento libre se cancela** (porque se arrastró de más y no alcanzaban los nitros), el cartel del movimiento libre se cierra igual y se pierden los casilleros gratis. Así funcionaba antes también.

## No llegué
- La huida de un robo con el aviso de oportunidad negada.
- El Relicario de sangre con Vida extra, y dos Vida extra guardadas de antes que se juntan.
- ¡Al frente! cancelado con Esc.
- El contraataque con la segunda arma.
- El Valor del botín y «Ver el grupo»: hay que cerrar un combate entero.

## Commits
- `985d3b5e`: 🐞 movimiento libre de N casilleros: lo que se pasa se paga normal y no deja ir a negativo (`vtt-hexgrid/js/06-mouse.js`, `mapa.html`).
- `fb4e2636`: 🐞 ficha: el escudo atado al antebrazo con dos armas puestas ya no pide reemplazar (`comun/ficha-equipo.js`, `comun/pruebas.html` con una prueba nueva, `ficha.html`).
- `54a21cc3`: lo tildado en `docs/pruebas-en-el-mapa.md`.

## Capturas (las mejores)
1. `pend-1103e-02-humo-negativo-publicado.png`: el goblin en −7, con el código de antes.
2. `pend-1103e-03-humo-con-arreglo-pregunta.png`: con el arreglo, «Mover 11 casilleros cuesta 8 No2 y tenés 6».
3. `pend-1103e-05-ficha-brazal-reemplazar.png`: el error, que pedía reemplazar por el brazal.
4. `pend-1103e-08-ficha-mazo-y-brazal.png`: Mazo de bombo + Brazal, Manos 2/2.
5. `pend-1103e-10-salto-aviso-j1.png`: el aviso por el Salto.
6. `pend-1103e-12-takle-aviso-j1.png`: el aviso por el Takle.
7. `pend-1103e-14-centella-rescc-j1.png`: la Centella, que Prueba Uno resiste con Res.CC.
