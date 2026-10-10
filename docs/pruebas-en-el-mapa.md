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
- [ ] **🔎 Escanear grupo → 🤖 Proponer creeps** (2026-10-09): la respuesta de la IA (usa la clave de OpenRouter del dueño).

- [ ] **🏹 Apuntar con un arma de rango** (cuando se construya; pedido del dueño 2026-10-09): al atacar se ve tu Rango, los objetivos posibles, los que
  no (fuera de Rango o tapados por un obstáculo aunque se vean por la visión de un aliado) y los obstáculos que los tapan. Ver docs/rework-armas-rango.md.
- [ ] **🏹 El texto de la Perfora** (2026-10-09): un disparo con la Perforante que pega sin crítico dice «6 − Defensa 3 (4 − perfora 1) = 3»
  (la cuenta ya se probó; el texto se corrigió después y falta verlo).
- [ ] **📖 El glosario con globos** (2026-10-09, lo ve el dueño): en la tienda, el catálogo, la mochila y el «Ver» de un ítem, los términos (estados,
  bonos de piezas, mecánicas de armas y flechas) salen subrayados en celeste y al pasar el mouse muestran su explicación; «Detalles técnicos» ya no
  repite eso. Mirar si sobra o falta algún término, y si algún texto del globo conviene reescribirlo.
- [ ] **🏹 El arco en una invocación** (2026-10-09): el Daño de su Botonera dice la mitad del Dmg (en personajes y creeps, probado: la Bruja,
  «Dmg (arco: la mitad, para arriba) +2» con Dmg 3).

## Probado

- ✅ **Tanda del 2026-10-09 (tarde, el dueño afuera)**: **Parry con escudo de un personaje contra un disparo**: Clementino con la Tapa de tacho de
  basura, la Bruja le dispara: «Elegí cómo te defendés» ofrece Evasión y Parry solo con el escudo (el cuchillo no), «si ganás, el disparo queda parado
  (sin Bloqueo)»; ganó 6 contra 3 → «¡PARADO!», sin Bloqueo ni contraataque. **Moneda Re-Roll**: sin moneda el 🪙 sale gris y tachado y avisa; con una
  en la mochila se enciende y abre «mis últimas tiradas». **Estados al pasar el mouse**: sobre el Coloso, el cartelito con Piernas de prueba (no
  vence), Veneno 1 turno y Parálisis 1 turno. **Piedra, papel o tijera desde el mapa del GM**: desafío con motivo, piedra contra tijera, el GM ve
  «¡Ganaste!» y el jugador «Perdiste», en la Mesa. **El arco suma la mitad del Dmg**: el 🔍 del Daño de juan dice «Dmg (arco: la mitad, para arriba)
  +2» con Dmg 3. **Sin oportunidad con un arco**: juan se aleja de la Bruja (solo arco) en combate: no lo frena y la Mesa y la Crónica dicen «tiene un
  arco, que no sirve de oportunidad» (**arreglado probando**: los creeps no publicaban ese dato y la Crónica decía siempre «no tiene No2»).
  **🎭 Acción incierta, lado del GM**, con niebla de verdad: una copia del Escarabajo escondida y lejos no aparece en el orden de turnos del jugador
  (6 filas contra 7 del GM) ni su tirada en la Mesa; al acercarse a juan, el mapa del GM la marcó «revelado» sola; vuelta a la niebla, sigue en el
  orden del jugador y su tirada le llega como «🎭 … está realizando una acción incierta». Y usando una Trampa de oso de su cinturón: el GM ve «🎭 … colocó una trampa («Trampa de oso»)» y el jugador solo «acción incierta». **Glosario**: en el «Ver» del Arco corto y de la Varita de
  chispa eléctrica, los términos marcados y el globo al pasar el mouse (Parálisis); «Detalles técnicos» en lista corta. **Perfora sin crítico**:
  juan con la Perforante, PdG 3 contra Evasión 1: 6 de daño contra Defensa 4 → recibió 3 (la Perfora le restó 1 a la Defensa). El texto decía
  «6 − Defensa 4 − perfora 1», como si la Perfora frenara el daño: **corregido** a «Defensa 3 (4 − perfora 1)» (falta verlo: los intentos siguientes
  salieron crítico o fallo).
- ✅ **Línea de tiro, tiro alto, distancia ideal y distancia mínima** (2026-10-09, probado antes y anotado ahora): la línea al mouse (verde/roja, con
  la distancia), los tokens tapan, el cartel de «tapado» con «Elegir otro», el tiro alto con PdG −2 («1d6 −2 tiro alto»), los resaltes de la
  distancia mínima y de la distancia ideal, el daño del arco 2d6+3.

- ✅ **🏹 Disparo contra un personaje y la flecha envenenada** (2026-10-09): la Bruja (Arco largo de tejo) le dispara a juan: «Elegí cómo te
  defendés» ofrece solo la Evasión (juan tiene el arco en las manos: no parrea con él) y ya sin la nota del disparo; esquivó 5 contra 2. juan
  dispara la Envenenada: la declaración dice «Flecha envenenada: Envenenar · perfora 1»; crítico ×2 (18); se aplicó Veneno ×3. (Después, dueño: el
  veneno sigue necesitando que pase el daño; para eso está la Perfora.)

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
