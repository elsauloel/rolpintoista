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

- [ ] **🏹 Apuntar con un arma de rango** (cuando se construya; pedido del dueño 2026-10-09): al atacar se ve tu Rango, los objetivos posibles, los que
  no (fuera de Rango o tapados por un obstáculo aunque se vean por la visión de un aliado) y los obstáculos que los tapan. Ver docs/rework-armas-rango.md.
- [ ] **🏹 El arco suma la mitad del Dmg** (2026-10-09; anda en las pruebas automáticas, todavía ningún arco del catálogo lo trae): con un arco  marcado «🏹 Arco» (asistente de ítems), el botón Daño de la Botonera dice «1d4 + mitad del Dmg» y el duelo tira eso; su 🔍 muestra la mitad. Lo  mismo con un creep y una invocación que lleven ese arco.
- [ ] **🏹 Distancia mínima del arco y sin oportunidad** (2026-10-09, P183): al atacar con un arco brillan solo los objetivos a 3 casilleros o más; elegir uno a 1 o 2 pregunta «Muy cerca para el arco · Disparar igual / Elegir otro» y, si sigue, deja una línea roja en la Mesa. Un rival que solo tiene un arco no frena a quien se le aleja y la Mesa dice «tiene un arco, que no sirve de oportunidad»; con arco y otra arma, la oportunidad no ofrece el arco.
- [ ] **🏹 Parry y disparos, lo que falta** (2026-10-09; el creep ya probado, ver «Probado»): atacado un **personaje** o una **invocación** con un arco, el Parry se ofrece solo con escudo; quien tiene un arco en las manos no ofrece Parry con él.
- [ ] **🏹 Perfora y la flecha envenenada** (2026-10-09): un disparo con la Perforante o la Envenenada que pega resta 1 de Defensa («perfora 1» en el
  duelo) y el Veneno ×3 de la envenenada entra aunque la armadura pare todo.
- [ ] **🏹 Línea de tiro, tiro alto y distancia ideal** (2026-10-09): al atacar con un arma de rango se ve la línea al mouse (verde / ámbar «roza» / roja «tapado»); elegir un objetivo tapado por un token pregunta «Tiro alto (PdG −2)» (si el arma lo tiene y está a 4+), «Disparar igual» o «Elegir otro»; un obstáculo Sólido no permite tiro alto; con distancia ideal, los objetivos en la franja brillan en celeste y el duelo suma el bono (y lo muestra en la Mesa).

## Probado

- ✅ **🏹 Flechas eléctricas y levantar una flecha** (2026-10-09): juan a la Bruja (con Stun, para que pegue). **Relámpago**: el duelo dice
  «Flecha relámpago: Parálisis», pegó, Parálisis 1 turno aplicada al blanco y saltó al Coloso de mineral (a 2 casillas): 1d2 = 2 → paralizado
  (quedó en su lista de estados); el carcaj bajó 2 → 1. **Tormenta** (crítico ×3): el físico se multiplicó (21) y el eléctrico no (7, «ignora la
  Defensa, sin multiplicar»); saltó 7 → 3 al Coloso → 1 al Escarabajo de cobre y ahí se cortó; Parálisis 50 % (1d2: 1) y 25 % (1d4: 2), ninguna
  entró; la Crónica y la Mesa lo cuentan. **Arreglado probando**: el cartel «No te alcanzan los Nitros» al pagar el PdG quedaba tapado por el
  duelo (ahora una ventana que se abre en la Botonera queda encima; verificado). **Levantar**: juan al lado de la Flecha de fuego del piso →
  «🗡️ Levantar Flecha de fuego · 1 No2» → sin No2 pregunta y deja seguir → salió del piso y fue **al carcaj** (1 → 2), con su línea en la Mesa.

- ✅ **🏹 Flecha especial, parada con escudo** (2026-10-09): juan dispara el Arco corto a la Bruja con «¿Qué flecha?» → Flecha de fuego (se
  gasta del carcaj, 2 → 1, y cobra su No2); el duelo muestra la flecha y sus efectos. La Bruja elige Parry con el Escudo de la falange (la opción
  dice «si gana, el disparo queda parado (sin Bloqueo)»), gana 4 contra 2: «🛡 ¡PARADO!», sin tirada de Bloqueo y **sin ofrecer contraataque**
  (corregido el mismo día, pedido del dueño). La flecha quedó en el piso a 15 casillas (el alcance del arco) siguiendo la línea, con su línea en la
  Mesa. Se sacó la nota «Es un disparo: se esquiva igual…» de la Evasión (dueño: no hace falta explicarlo).

- ✅ **✊ Piedra, papel o tijera** (2026-10-09): juan (mapa) contra el GM (GM Tools): desafío con motivo, empate y ronda 2, papel contra tijera →
  «Perdiste» / el ganador en verde, la línea en la Mesa. Arreglado en el momento: el escucha no reintentaba si la pantalla se abrió antes de pegar
  las reglas, y la Mesa adelantaba el resultado.
- ✅ **📋 Ctrl+C / Ctrl+V de un creep** (2026-10-09): «Sí, crear su ficha» duplicó el creep (GM Tools lo levantó con sus habilidades y su vida) y el
  token quedó vinculado; GM Tools pregunta «¿crear su token?» al duplicar.
