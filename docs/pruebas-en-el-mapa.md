# Pruebas pendientes en el mapa

> Protocolo del dueño (2026-10-09): lo que pide probar **en el mapa**, si no se puede (Claude in Chrome desconectado, falta una de las dos cuentas
> y él no está para habilitarlas), **no se prueba «por detrás»** (funciones a mano, datos simulados): se anota acá y se prueba en el mapa apenas
> se pueda. La prueba de Claude, con capturas, es un **filtro intermedio**: no reemplaza la del dueño, pero lo visual detecta errores que las
> pruebas automáticas no (un botón que no se ve, un cartel tapado…).
>
> Cómo: partida «Claude · pruebas» (`?partida=YWjRbx7eJlqQpL1wtCKH`), las dos cuentas de Chrome (jugador y GM), la Botonera nueva del mapa y
> capturas. Al probar algo: pasarlo a «Probado» con fecha, qué se vio y si hubo que arreglar algo.

## Pendientes

- [ ] **Disputa del botín** (2026-10-08): fin de combate publicado → un jugador 🙋 Reclama → otro ⚔ Disputa → ✊ piedra, papel o tijera en las
  dos pantallas → el ítem queda a nombre del ganador → ↩ Soltar → el GM cierra el botín → lo reclamado llega a la mochila (con la XP y el oro).
  Mirar: los botones de cada fila, el «✊ En disputa: jugar», la Mesa, la línea verde del cierre.
- [ ] **🎭 Acción incierta, del lado del GM** (2026-10-09): con niebla de verdad, un creep que los jugadores todavía no vieron no aparece en su orden
  de turnos ni en la Mesa; al verlo, el mapa del GM lo marca «revelado» y ya no desaparece aunque se esconda; lo que hace escondido sale como
  «acción incierta»; una trampa colocada se anuncia así al rival. (El lado del jugador ya se vio con niebla simulada.)
- [ ] **🪙 Moneda Re-Roll apagada** (2026-10-09): sin moneda en el cinturón ni la mochila, el 🪙 del mapa y el de la Botonera de la ficha se ven
  grises y tachados con una línea roja; tocarlo avisa. Con una moneda, encendido. (Hace falta que la ficha se haya guardado una vez.)
- [ ] **👆 Estados al pasar el mouse por un token** (2026-10-09): el cartelito aparece al lado del puntero, con el mouse real (la prueba fue con un
  movimiento simulado; falta la captura).
- [ ] **✊ Piedra, papel o tijera desde el mapa del GM** (2026-10-09): el GM jugó desde GM Tools porque su mapa estaba congelado; falta verlo en el
  mapa del GM.
- [ ] **🔎 Escanear grupo → 🤖 Proponer creeps** (2026-10-09): la respuesta de la IA (usa la clave de OpenRouter del dueño).

## Probado

- ✅ **✊ Piedra, papel o tijera** (2026-10-09): juan (mapa) contra el GM (GM Tools): desafío con motivo, empate y ronda 2, papel contra tijera →
  «Perdiste» / el ganador en verde, la línea en la Mesa. Arreglado en el momento: el escucha no reintentaba si la pantalla se abrió antes de pegar
  las reglas, y la Mesa adelantaba el resultado.
- ✅ **📋 Ctrl+C / Ctrl+V de un creep** (2026-10-09): «Sí, crear su ficha» duplicó el creep (GM Tools lo levantó con sus habilidades y su vida) y el
  token quedó vinculado; GM Tools pregunta «¿crear su token?» al duplicar.
