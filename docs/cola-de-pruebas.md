# Cola de pruebas en el mapa

Pedido del dueño (2026-11-08): «Pone esto en la cola de pruebas y a medida que vas haciendo una prueba, me mandas los resultados y vas avanzando
con la programación de la siguiente en la cola.» Mientras el dueño diseña, las pruebas en el mapa no se hacen en el momento: se anotan acá y se
corren **de a una**, en orden, en segundo plano. Al terminar cada una se le pasa el resultado al dueño y se arranca la siguiente.

Reglas de cada prueba (las de siempre, ver `pruebas-en-el-mapa.md`): en «Claude · pruebas» / «Encuentro 2», **nunca «Mapa 1»**; respaldo antes y
restauración después; sin servidores ni navegadores viejos conectados; capturas para el dueño. Si aparece un error, se arregla, se prueba y se sube
(con el commit de siempre) y se anota en el resultado.

Estado: `[ ]` en cola · `[~]` corriendo · `[x]` hecha (con el resultado en una línea).

## 🛠 Cola de programación (de a una por vez; dueño, 2026-11-10)

- **✅ hecho (2026-11-20) — 💰 «Pasar a un aliado» en el menú de DDE y despojos** (dueño, 2026-11-20, con captura: «este menú de DDE y despojos debería tener un
  botón para poder pasarle a un aliado»). La ventanita «💰 DDE y despojos» de la ficha tiene abajo el botón **🤝 Pasar a un aliado**: cierra la ventanita y abre
  la misma ventana de siempre («Pasarle algo a otro personaje», la del 🤝 Pasar de la Mochila; `comun/intercambio.js`, sin tocar): a quién, cuántos DDE, qué
  despojos y cuántos. Las reglas son las que ya había: lo ofrecido queda apartado hasta que el otro acepta, al otro le sale «Te ofrecen algo — Aceptar /
  Rechazar», queda la línea en la Mesa, y en combate esa ventana solo deja pasar ítems (con sus No2). Esa ventanita existe solo en la ficha (el mapa y la
  ficha lite no la tienen; ahí se pasa con el 🤝 de arriba de la Mochila). Probado con clics en «Claude · pruebas 2»: Blanco J1 le pasó 20 DDE y 2 despojos
  normales a Blanco J1 b (50 → 30 y 3 → 1 en uno; 0 → 20 y 0 → 2 en el otro), y todo volvió a 0 al terminar. Aceptó la misma cuenta del Jugador 1 con su otro
  personaje: el Jugador 2 no es parte de esa partida. Pruebas automáticas 893/893. Sin ver: el botón con el mapa en Combate (`docs/pruebas-en-el-mapa.md`).
- **✅ hecho (2026-11-20) — 🏁 Al terminar «Finalizar combate», el mapa vuelve solo a modo narrativo** (dueño, 2026-11-20: «al poner finalizar combate y terminar
  con todo ese proceso, el mapa automáticamente se vuelva a poner en modo narrativo»).
  *Resultado:* cuando el proceso termina de verdad —al apretar «🏁 Despojar lo que nadie tomó y repartir XP y oro» (o «Cerrar botín y repartir…») y
  confirmar, o al publicar cuando no hay ítems— el mapa publicado pasa solo de Combate a Narrativo en todas las pantallas, con la misma escritura que
  usa el interruptor del mapa. Al GM se lo dice el cartelito de abajo: «Botín cerrado ✓ — … · 🌿 El mapa volvió a modo narrativo» (a los jugadores les
  sale el aviso de siempre, «🌿 Modo narrativo: moverse no gasta No2»). Vale igual desde el mapa y desde GM Tools. En «🔮 Simular» no cambia nada, y si
  el mapa ya estaba en narrativo tampoco. Pasar a narrativo no abre ningún cartel ni pregunta nada (los carteles del interruptor son los de pasar a
  combate), así que no se sumó ninguno. El orden de turnos no se toca, igual que con el interruptor (queda preguntado en P252). Probado con clics en
  «Claude · pruebas 2» («Prueba · R4 M4», GM y Jugador 1): desde el mapa y desde GM Tools, con un ítem en el botín y sin ítems; y Simular. Todo quedó
  como estaba (XP, despojos, creeps, sin combate abierto, narrativo). Pruebas automáticas 895/895. Sin ver: `docs/pruebas-en-el-mapa.md`.
- **⬜ en cola — 👥 Sumar al Jugador 2 a «Claude · pruebas 2»** (dueño, 2026-11-20: «podría sumar al jugador 2 a la partida de pruebas, así tenemos
  en la partida de pruebas todas las opciones posibles»). Con la cuenta de pruebas del Jugador 2 («Unirme como jugador»), y crearle un personaje de
  pruebas («Blanco J2», en blanco como Blanco J1) con su token en «Prueba · R4 M4». Sirve para probar lo que necesita dos personas distintas
  (pasar cosas, aceptar ofertas, duelos entre jugadores). Anotar en docs/memoria-claude.md que la partida de pruebas ya tiene GM, J1 y J2.
- **⬜ en cola — 🌿 El aviso «el mapa volvió a modo narrativo», dentro del cartel «🩺 Cómo quedó el grupo»** (dueño, 2026-11-20: «lo del cambio en
  modo narrativo me gusta, pero quiero que lo pongas integrado al mismo mensaje de cómo quedó el grupo, porque el cartelito verde ese pasa bastante
  desapercibido»). Cuando el fin del combate pasa el mapa a narrativo, el cartel «Cómo quedó el grupo» lo dice bien visible (arriba, destacado:
  «🌿 Terminó el combate: el mapa volvió a modo narrativo»). Si ese cartel no llega a salir (p. ej. desde GM Tools), queda el cartelito de abajo.
- **⬜ en cola — ⚔ Tres maestrías nuevas: punzantes (Tipo 4 melee), cortantes (Tipo 6) y hachas (Tipo 8)** (dueño, 2026-11-20, conversación de
  diseño; mismo molde que «Maestría en armas pesadas», `comun/pasivas.js`; valen para jugadores y para creeps). Cierra P248.
  · **Maestría en armas punzantes** (1 Job): con un arma de **Tipo 4 cuerpo a cuerpo** (NO las de rango / proyectiles: «vamos a hacer una distinción
    en las armas punzantes melee y las de rango… esta sería para tipo 4 melee»), **+1 al daño** y **+2 al PdG en ataque de oportunidad**.
  · **Maestría en armas cortantes** (1 Job): con un arma de **Tipo 6**, **+1 al Parry**, **+1 al Bloqueo** y **+1 al PdG en contraataque**.
  · **Maestría en hachas** (Tipo 8; dueño: «tipo 8 son hachas. Su casa es romper armadura»): el **segundo ataque del turno (y los siguientes) con
    un arma de Tipo 8 cuesta 2 No2 menos** (6 en vez de 8). Job: **1** (dueño, 2026-11-20: «cuesta un punto de Job, como el resto»).
  Cada bono vale SOLO con un arma de ese Tipo (como `pdgt10`/`parryt10`): se tiene que ver en la 🔍 de la tirada y en el costo del botón Atacar.
- **✅ hecho (2026-11-20) — 🛡 Cartel flotante desde el token cuando algo no le entra por una inmunidad** (dueño, 2026-11-20: «me gustaría que también salte
  el cartel flotante desde el token, en un azul-plateado que diga "INVULNERABLE"… o también "INMUNE A TÓXICO", por ejemplo»).
  *Resultado:* además de la línea «🛡 … no le hizo nada (motivo)» de la Mesa, del token sale un cartel que flota ~2 s, en azul-plateado, y lo ven todas las
  pantallas (es el mismo texto flotante del «−2 EVA», con otro color). Dice **«INVULNERABLE»** si lo frena la invulnerabilidad (Invulnerable / Titilando),
  sea un estado o un golpe; **«INMUNE A <ESTADO>»** con cualquier otra inmunidad a un estado («INMUNE A MIEDO», «INMUNE A CEGUERA», «INMUNE A VENENO»,
  «INMUNE A STUN»…); e **«INMUNE A LO TÓXICO / AL FUEGO / A LO ELÉCTRICO…»** cuando un daño de ese elemento no le hace nada (las mismas palabras de la
  etiqueta que ya sale al apuntar). Vale para personajes, creeps e invocaciones. Si la pantalla tiene el cuadro del duelo o un aviso tapando el mapa, el
  cartel espera a que se cierre (como la Transfusión; como mucho 25 s). Si el jugador tiene solo la ficha abierta (sin el mapa), el cartel sale igual en
  los mapas de los demás. **Probado con clics en «Claude · pruebas 2» / «Prueba · R4 M4», GM y Jugador 1** (capturas de las dos pantallas): golpe de
  Blanco creep a Blanco J1 Titilando → «INVULNERABLE»; Cegar de Control mental 2 a Blanco J1 con Inmunidad a CC → «INMUNE A CEGUERA»; Punzada mental
  (puesta como daño tóxico para la prueba) a Blanco J1 inmune a lo tóxico → «INMUNE A LO TÓXICO»; Veneno y Miedo que le llegan con Sangre pura e
  Inmunidad mental → «INMUNE A VENENO» e «INMUNE A MIEDO»; Miedo a la Abeja de prueba (invocación) Titilando y «Recibe daño» a mano sobre ella →
  «INVULNERABLE»; «+ Estado» a mano del GM (Stun) sobre Blanco creep con Inmunidad a CC → «INMUNE A STUN»; y con el jugador solo en la ficha, el cartel
  en el mapa del GM. 892 pruebas automáticas en verde. **No lo cubre:** el Veneno o el Sangrado que ya tenía puesto y no le hace daño en el Mantenimiento
  (hoy solo lo dice el texto del Mantenimiento) y la Maldición tormentosa sobre un invulnerable. Lo que no se vio en el mapa (la Protección de jefe, las
  zonas, trampas, el Escudo elemental y el rayo en cadena con un inmune al elemento, un golpe a un creep invulnerable) quedó anotado en
  `pruebas-en-el-mapa.md`. La partida quedó como estaba (comparada contra una foto de antes).
- **✅ hecho (2026-11-20) — 🏹 El carcaj se ve dos veces en el Equipo, y los botones no dicen cuántos No2 cuestan** (dueño, 2026-11-20, con captura: «en este menú
  del equipo se ve duplicado el carcaj. También me gustaría que los botones de cargar o descargar te digan cuántos No2 va a costar la acción»). Hoy,
  con un arco o ballesta y sin Carcaj de cuero, salen dos recuadros: «CARCAJ 0 / 1 · Vacío» (el lugar para equipar un carcaj) y «🏹 CARCAJ INCLUIDO
  0 / 5». Que quede UN solo recuadro de carcaj: el incluido (5) si no hay uno equipado, o el equipado (con su capacidad) si lo hay; sin perder la
  forma de equipar/sacar un Carcaj de cuero. Y cada botón («→ Carcaj (N)», «→ Mochila (N)», «Cargar todo lo que entre», «Vaciar a la mochila») dice
  cuántos No2 cuesta en ese momento (en combate; fuera de combate, que diga que no cuesta), con el costo real que ya cobra el código: no inventar uno.
  *Resultado:* en «Equipo y mochila» (ficha y 🛡 del mapa) queda UN solo recuadro «🏹 Carcaj», al final de lo equipado: sin carcaj puesto y con arco o
  ballesta, «Carcaj incluido · N / 5»; con uno puesto, «Carcaj · N / 10» con la fila del Carcaj de cuero (Ver, Editar, **Sacar**) y sus flechas; sin
  arco, ni ballesta ni carcaj, «Vacío» y cómo conseguir uno (antes decía «Carcaj 0 / 1 · Vacío»). El carcaj se sigue equipando desde la mochila
  (columna de la derecha, «Equipar»). Cada botón dice lo que cuesta: fuera de combate «· gratis»; en combate «→ Carcaj (N) · 1 No2», «→ Mochila (N) ·
  1 No2», y «Cargar todo lo que entre» / «Vaciar a la mochila» con el total (1 No2 por cada clase de flecha que pasa: con dos clases, «· 2 No2»). Es
  el costo que ya cobraba (el de equipar, 1 No2 por acción, más lo que sume Extenuado): no se agregó ninguno. Abajo, una línea lo explica. Con el
  Equipo abierto, si el GM cambia de modo los botones se actualizan solos. Probado con clics en «Claude · pruebas 2» (Jugador 1, ficha y 🛡 del mapa):
  fuera de combate no cobró nada; en combate cobró exactamente lo que decía cada botón (6 → 5 → 4 → 2 No2, sacar el carcaj 1 más) y, sin No2
  suficientes, salió el cartel de siempre «cuesta 2 No2 y tenés 1». 1 prueba automática nueva (893 en verde). Detalle en `pruebas-en-el-mapa.md`.
  (La entrada «en cola» se había borrado sin querer al cerrar la tarea anterior: se repuso acá.)

- **✅ hecho (2026-11-20; el caso exacto de la partida no se pudo reproducir: ver el resultado) — 🐞 Después de revivir con el Pacto, al personaje dejan de entrarle los debuffs automáticos** (dueño, 2026-11-20, jugando El origen:
  «no funcionaba el aplicarle debuffs automatizados a Bizzante… murió y quedó invulnerable por el pacto pero dejó de recibirlos aún después de terminado
  invulnerable»). Lo que se vio leyendo la partida (solo lectura, 2026-11-20): la ficha guardada de Bizzante NO tiene ningún Invulnerable/Titilando
  (efectos: Regeneración, Arma ígnea, Parálisis; el Pacto ya gastado); en la cola `estados` sus avisos figuran todos `aplicada: true`, pero al menos uno
  (un Miedo, ~1 min después de la última vez que se guardó su parte `efectos`) fue tomado y NUNCA quedó en sus estados: la parte `efectos` no se volvió
  a guardar, aunque `general` sí (después). O sea: el aviso se marca tomado (`Recibidos.tomar`) y después el estado se pierde: o lo rechaza
  `Combatiente.inmunidad` contra una copia en memoria que sigue con el Titilando (el Titilando ya sacado en Firebase por otra pantalla), o no se guarda.
  Sospechosos: la copia del personaje en la pantalla que aplica (`bn.S` de la Botonera / la sesión temporal de `editarPersonajeMapa`, js/11; la ficha
  suelta), quién saca el Titilando al empezar el turno y si esa quita le llega a las otras pantallas (FichaSesion, partes), y que `tomar` va ANTES de
  aplicar (si no se aplica, se pierde sin rastro). Reproducir en «Claude · pruebas 2»: Blanco J1 con Pacto, cae por un golpe, revive Titilando, pasa su
  turno (se va el Titilando) y un creep le aplica un debuff automático (Cegar, Parálisis, Miedo…) con el jugador con la Botonera abierta y cerrada, y
  con el GM pasando el turno. Arreglar la causa y, además, que un aviso tomado que no se pudo aplicar no se pierda en silencio (aviso al jugador y al GM
  con el motivo, p. ej. «no te hizo nada (Invulnerable)» también en la Mesa).
  *Resultado:* el recorrido normal anda bien y **no se logró repetir tal cual lo de Bizzante** en «Claude · pruebas 2» (Blanco J1 con el Pacto, cae por
  un golpe de Blanco creep, revive Titilando; el Titilando se va con el ⟳ Mantenimiento, con «✔ Aplicar» del jugador al empezar su turno y con el GM
  pasando el turno sin que nadie aplique; después Miedo, Ceguera, Parálisis, Pajaritos y el Provocado de «¡Tu vieeeeja!» entran y quedan guardados;
  probado con la Botonera abierta, cerrada y con la ficha suelta en otra pestaña). Lo que **sí se encontró y se repitió con Firebase de verdad**, en el
  mismo camino y con el mismo síntoma (aviso tomado, estado que no queda en la ficha guardada): si en la pantalla del jugador el aviso llega justo
  mientras otra cosa está guardando a ese personaje, el estado no se escribía — con la Botonera (queda abierta desde el primer duelo) quedaba solo en
  la memoria de esa pantalla y marcado como guardado; sin ella, lo borraba el otro guardado. Y dos agujeros más del mismo guardado: un guardado que
  fallaba no se reintentaba nunca desde el mapa, y un error al armar lo que se escribe dejaba a esa pantalla sin guardar más a ese personaje hasta
  recargar (esto último encaja con «dejó de recibirlos» de ahí en adelante, pero no se pudo confirmar que haya sido eso). **Arreglado** (comun/ficha-sesion.js,
  vtt-hexgrid/js/11, comun/recibidos.js, comun/ficha-acciones.js, ficha js/02): los cambios simultáneos comparten una sola copia y cada uno queda como
  deuda hasta que se escribe; el guardado se reintenta solo; y **un aviso tomado ya no se pierde en silencio**: si lo frena una inmunidad, toast al
  jugador y línea en la Mesa con el motivo («🛡 Blanco J1: Miedo no le hizo nada (Invulnerable) · Blanco creep · Grito espeluznante»); si falla al
  aplicarse o no se puede guardar la ficha, vuelve a la cola y se reintenta solo, con una línea roja en la Mesa (a la tercera, «aplicáselo a mano»).
  5 pruebas automáticas nuevas (890 en verde). **Hipótesis que quedan** si vuelve a pasar: una carrera entre DOS pantallas distintas (el GM aplicando
  «por él» el inicio del turno en el mismo instante en que el jugador aplica el aviso: en cada parte gana la última que guarda) y la pestaña de la ficha
  suelta dormida en segundo plano; ahora, si pasa, tiene que quedar una línea en la Mesa o un error en la consola del jugador (F12). Capturas en `cola18/`.
- **✅ hecho (2026-11-20) — ⭐ En el reporte «Batalla terminada» del GM, la XP que tiene cada jugador y cuánto le falta para subir** (dueño, 2026-11-20: «que en la
  gestión del loot, previo a publicar, que el gm pueda ver cuánta exp tiene cada jugador, y cuánto falta para subir de nivel»). En el paso de la
  experiencia de `CombateFin.vista` (comun/combate-fin.js; lo usan el mapa del GM y GM Tools, en Simular y en Avanzar), al lado de cada personaje:
  nivel, XP actual / la que pide el próximo nivel, cuánto le falta, y qué pasa con lo que va a cobrar («con estos 191 sube a nivel 4» / «le quedan
  faltando 35»). La cuenta de niveles ya existe (`Recibidos.aplicarExp` / `expParaNivel`, comun/recibidos.js): usar esa, sin inventar otra. Si la XP de
  la ficha no está en el resumen público, leerla como GM (solo lectura).
  *Resultado:* en el paso «4. Experiencia» del reporte (Avanzar y Simular, en el mapa del GM y en GM Tools), debajo del nombre de cada personaje:
  «⭐ Nv 1 · 65 / 100 XP · le faltan 35» y, si cobra, «⬆ con estos 35 sube a nivel 2 · queda en 0 / 200 XP» (verde) o «→ con estos 20 le quedan
  faltando 15 para el nivel 2» (amarillo); cambia al tocar «Experiencia por jugador» o el extra de uno. En «5. Publicar», «⬆ sube a nivel N» al lado
  del que sube. La XP se lee de la ficha (solo lectura); la cuenta es la de siempre (nivel × 100). Probado con clics en «Claude · pruebas 2»
  (Simular, mapa y GM Tools): nada se escribió. 1 prueba automática nueva (885 en verde). Capturas en `cola17/`.
- **✅ hecho (2026-11-20) — 🏹 El Carcaj de cuero ya no se regala con cada arco o ballesta** (dueño, 2026-11-20, P250: «NO» a «¿se sigue regalando…, ahora que hay
  un carcaj incluido de 5?»). Sacar el regalo al comprar (y donde más se entregue solo: tienda, personaje nuevo, etc.; grep) y corregir el texto del
  Carcaj de cuero del catálogo («Viene con cada arco o ballesta que se compra» → ya no; es la mejora de 10 lugares que se compra aparte) y el aviso
  «viene uno con cada arco» de `comun/ficha-equipo.js`. No sacarle el carcaj a quien ya lo tiene. Marcar la P250.
  *Resultado:* comprar un arco o una ballesta (tienda, personaje nuevo, «agregar gratis») ya no suma el Carcaj de cuero; el que ya lo tenía lo conserva.
  El Carcaj de cuero dice ahora «Lugar para 10 flechas o virotes especiales: el doble que el carcaj incluido de 5 que trae cualquier arco o ballesta.
  Se compra aparte.» El aviso «viene uno con cada arco» de Equipo ya no existía (se había cambiado con el carcaj incluido). Probado con clics en
  «Claude · pruebas 2»: Jugador 1 compró un Arco de caña en una Tienda de inicio (95 DDE), llegó solo el arco, y al equiparlo se ve «Carcaj incluido
  0 / 5». P250 marcada ✅. Pruebas automáticas al día (885 en verde). Capturas en `cola17/`.
- **✅ hecho (2026-11-20) — 🏹 Carcaj incluido de 5 lugares con cualquier arco o ballesta** (dueño, 2026-11-20: «programá que cualquier jugador tenga por default un
  carcaj de 5 slot para virotes/flechas especiales incluído, sin peso adicional, por cargar cualquier arco o ballesta»). Hoy las flechas y virotes
  especiales solo se llevan en un carcaj equipado (`tipoItem: 'carcaj'`, `capFlechas`; `carcajDe`, `capCarcaj`, `flechasDelCarcaj` en
  comun/ficha-equipo.js): sin carcaj, «Equipá un carcaj…». Cambio: un personaje con un arco o una ballesta equipados (un arma de rango que dispara
  flechas o virotes) y SIN carcaj puesto tiene un **carcaj incluido** de 5 lugares, sin peso, sin ocupar el lugar de Carcaj ni la mochila: se le pueden
  pasar flechas/virotes especiales, se disparan desde ahí y se ve en Equipo y en la Botonera como «Carcaj incluido (N / 5)». Con un carcaj de verdad
  puesto, vale ese (su capacidad, como hoy; el `carcajExtra` de una ballesta sigue sumando como hoy). Decidir lo más simple para guardar las flechas
  (que no se pierdan al equipar un carcaj de verdad, al sacarlo o al desequipar el arco: pasan al carcaj nuevo o vuelven a la mochila, avisando).
  Solo personajes (los creeps llevan su munición aparte). Dudas → `preguntas-abiertas.md`.
  *Resultado:* con un arco o una ballesta equipados y sin carcaj puesto, el personaje tiene un «Carcaj incluido» de 5 lugares (no pesa, no ocupa el
  lugar de Carcaj ni la mochila): se ve en Equipo (ficha y 🛡 del mapa) como «🏹 Carcaj incluido · N / 5», y «¿Qué flecha?» dice «N en el carcaj
  incluido». Con un carcaj de verdad puesto vale ese: al ponérselo, las flechas pasan solas (las que no entran, a la mochila) y avisa; al sacar el arco
  sin carcaj, vuelven a la mochila y avisa. Agregado del dueño el mismo día («cargar y descargar fácilmente»): cada clase de flecha con su botón
  «→ Carcaj (N)» / «→ Mochila (N)» y, con más de una, «Cargar todo lo que entre» / «Vaciar a la mochila» (mismos costos de siempre). Probado en
  «Claude · pruebas 2» con Blanco J1 (Jugador 1) y un Arco corto prestado: cargó 3 Flechas de fuego, disparó una (3 → 2, +1 No2), cargó virotes hasta
  llenar, se puso el Carcaj de cuero (pasaron las 5), vació, y al sacar el arco volvieron a la mochila. 2 pruebas automáticas nuevas (881 en verde).
  Detalles elegidos mientras tanto: P250. Capturas en `cola15/`.
- **✅ hecho (2026-11-20) — 😇☥ Pacto activo y Ankh en el cinturón: el jugador elige cuál usar** (dueño, 2026-11-20: «quisiera asegurarme de que si un jugador
  tiene un pacto activo y un ankh en el cinturón, al jugador le debe aparecer la opción de qué usar»). Hoy NO pregunta: `FichaAcciones.revisarAnkh`
  (comun/ficha-acciones.js) usa solo, en orden fijo, la Llama de Fénix, después el Pacto y recién después el Ankh. Cambio: cuando la vida llega a 0 y
  hay más de una forma de volver (Pacto activo y Ankh de Reencarnación en el cinturón; también la Llama de Fénix si la tiene), al jugador le aparece
  «¿Con qué volvés?» con cada opción y lo que hace (el Pacto: revive con un cuarto, se gasta hasta que la historia dé otro; el Ankh: revive con un
  cuarto, se gasta uno; la Llama: toda la vida y el SP), y se usa solo la que elige. Con una sola, automática como hoy. Si quien resuelve no es el
  jugador (el GM con el control, o el jugador no está), el GM elige por él. Que no quede colgado: mientras no elige, el personaje está caído. Probar en
  el mapa con Jugador 1 (las dos elecciones) y con el GM manejándolo.
  *Resultado:* con más de una forma de volver (Pacto, Ankh en el cinturón, Llama de Fénix) el personaje ya no revive solo: queda caído y a quien lo
  maneja le sale «☥ ¿Con qué volvés?» con cada opción y lo que hace; se usa solo la elegida y las otras quedan. Si cierra el cartel sigue caído y lo
  reabre con el botón «☥ ¿Con qué volvés? Elegí» de la pantalla roja o el ☥ de su token; si recarga, el cartel vuelve a salir. Con el GM en 🎮 control le
  pregunta al GM (no al jugador), y si el jugador no está el GM elige por él con el ☥ del token. Con una sola forma, automático como siempre. Igual en la
  ficha suelta. Probado en «Claude · pruebas 2» (Blanco J1 contra un golpe de Blanco creep en un duelo): Jugador 1 eligió el Ankh (quedó el Pacto), después
  el Pacto (quedó el Ankh, cerrando y recargando antes), el GM con el control, el GM sin el jugador, y con solo el Pacto (automático). 884 pruebas en
  verde. Lo que quedó elegido «mientras tanto»: P251. Capturas en `cola16/`.
- **✅ hecho (2026-11-20) — 🐝 Pasiva nueva «Táctica de enjambre»** (dueño, 2026-11-20: «sumá una pasiva más: táctica de enjambre. tenés +1 a la pdg por cada
  aliado adyacente. cuesta 2 puntos de job»). En `comun/pasivas.js` (PASIVAS_BASE, jobCosto 2), para personajes, creeps e invocaciones. +1 a la
  Probabilidad de Golpe por cada aliado pegado a QUIEN ATACA (a 1 casilla de él), contado en el momento del ataque. Depende de la posición: lo suma el
  mapa al atacar (mirar cómo lo hace la Patota, vtt-hexgrid/js/65, y el Guardián, js/10: «aliado» = del mismo bando, con ficha, en el mapa, ni caído
  ni bajo tierra; quien ataca no se cuenta), con su línea en la tirada/el duelo («Táctica de enjambre +2: 2 aliados al lado») y un estado o indicador
  derivado a la vista mientras tenga aliados pegados, si sale natural. Fuera del mapa (ficha suelta) no suma: aclararlo en la descripción.
  Dudas de alcance (¿también la PdG especial?, ¿tope?) → como lo dijo el dueño: la PdG, sin tope; lo demás a `preguntas-abiertas.md`.
  *Resultado:* la pasiva está en la lista (2 puntos de job), para personajes, creeps e invocaciones. Al atacar con el arma en el mapa, cuenta los
  aliados pegados a quien ataca y suma +1 PdG por cada uno, sin tope; se ve en el cuadro del duelo («🐝 Táctica de enjambre +2: 2 aliados al lado») y
  en la tirada («+2 enjambre»). Vale también para el contraataque y el de oportunidad (nacen en el mismo lugar). Fuera del mapa no suma (lo dice la
  descripción). Sin indicador sobre el token. Probado en «Claude · pruebas 2»: creep con 0, 1 y 2 aliados; personaje de Jugador 1 con 2; invocación
  con 1. Prueba automática nueva (879 en verde). Alcance mientras tanto (solo PdG común y ataques con arma): P249. Capturas en `cola14/`.
- **✅ hecho (2026-11-20) — 🌀 Un creep que se va por un Town portal cuenta como «Escapó» al finalizar el combate** (dueño, 2026-11-20, jugando El origen: «un
  creep escapó con un portal, y ahora en la simulación no aparece como que escapó, ni lo contabiliza para la experiencia»). Causa: al pisar el Town
  portal el token se borra del mapa (js/84, `townPortalRevisar` desde moverToken js/07) y el fin del combate solo cuenta los creeps con token en el mapa
  publicado (`CombateFin.creepsEnMapa`, comun/combate-fin.js). Arreglo: cuando un creep se va por el portal durante un combate, que quede anotado (en el
  creep o en el combate en curso) y que el reporte lo sume como «Escapó» (el 20 % de su XP si «contar a los que escaparon» está tildado; sin oro ni
  ítems), igual en Simular y en Avanzar. Probar en «Claude · pruebas 2»: un creep vivo pisa un Town portal en combate → Finalizar → aparece «Escapó».
  *Resultado:* si el mapa está en combate, al entrar un creep por el portal la pantalla del GM lo anota en una lista de la partida (`gm/escapados`, solo
  el GM: no hacen falta reglas nuevas); el fin del combate lo suma y lo muestra «Escapó 🌀» con sus reglas de siempre (20 % de la XP si está tildado
  contar a los que escaparon; sin oro ni ítems), en Simular y en Avanzar. La lista se vacía al publicar las recompensas y con «↺ Reiniciar combate»; el
  Ctrl+Z de la entrada al portal lo saca. Probado en «Claude · pruebas 2» con GM y Jugador 1 (Blanco creep caído, Protector 2 vivo por el portal):
  Simular y Avanzar dieron «Escapó 🌀 +19 XP», publicar vació la lista y el combate siguiente ya no lo mostró. Partida restaurada. 877 pruebas en verde.
- **✅ hecho (2026-11-20) — 🔨 Pasiva nueva «Maestría en armas pesadas»** (dueño, 2026-11-20: «quiero sumar una habilidad pasiva para jugadores (y creeps):
  Maestría en armas pesadas. da +2 a pdg en armas de tipo 10, y además da +1 al parry con ese tipo de armas»). En `comun/pasivas.js` (PASIVAS_BASE,
  la ofrecen la ficha y los creeps). El +2 al PdG con Tipo 10 ya existe como stat (`pdgt10`, «PdG con contundentes», lo suma
  `Combatiente.pdgExtraArma`). El +1 al Parry solo con un arma de Tipo 10 NO existe: sumar un stat `parryt10` (y, si sale natural, `parryt4/6/8`) que
  se sume al Parry cuando se para con un arma de ese Tipo (no con escudo), en personajes (FichaCombate.statParaArma / el Parry de la Botonera y del
  duelo), creeps (CreepCalculo) e invocaciones, con su 🔍 («Maestría en armas pesadas +1»). Job: 1 (propuesto por Claude, a confirmar con el dueño).
  Prueba automática y probar en el mapa: un personaje y un creep con un arma de Tipo 10 (y otra de otro Tipo para ver que ahí no suma).
  *Resultado:* en `comun/pasivas.js`, Job 1 (confirmado por el dueño): pdgt10 +2 y el stat nuevo `parryt10` +1 («Parry con contundentes»), que se suma al
  Parry solo al parar con un arma de Tipo 10 (no con escudo ni otra arma), en personajes, creeps e invocaciones (`Combatiente.parryExtraArma`), con su línea
  en la 🔍 de Parry y de Atacar y en la ficha lite. Probado en «Claude · pruebas 2» (GM + Jugador 1): Blanco J1 con Cachiporra y Cuchillo (Atacar 1d8 / 1d6,
  Parry 1d6+1 / 1d6) y el Blanco creep con Cachiporra (Atacar 1d8+1, Parry 1d8; con el escudo, 1d6+1) y con su hacha Tipo 8 (sin nada de más); también en
  el «Elegí cómo te defendés» de un duelo real. Lo prestado, sacado. 878 pruebas en verde. Abierta: P248 (las maestrías de otras familias).
- **✅ hecho (2026-11-20) — 🔮 «Finalizar combate»: Avanzar o Simular** (dueño, 2026-11-20: «me gustaría poder hacer esa simulación que al poner finalizar combate
  como GM tenga la opción de avanzar o de simulación»). Al tocar «Finalizar combate», el GM elige: **Avanzar** (lo de siempre: reporte, publicar
  recompensas, botín) o **Simular**: la misma ventana «Batalla terminada» con la XP de cada personaje, el oro y el botín (despojos y drop al azar, con
  «otra tirada»), pero **sin escribir nada** (ni recompensas, ni botín, ni Mesa, ni marcar creeps) y sin cerrar el combate; con un cartel bien claro
  «Simulación: no se guarda nada» y un botón para pasar a Avanzar. Usar `comun/combate-fin.js` (sus funciones de cálculo; nada de lo que publica).
  Probar en «Claude · pruebas 2» y verificar que la simulación no dejó nada escrito.
  *Resultado:* al tocar «🏁 Finalizar combate» (mapa del GM y GM Tools) sale «¿Qué querés hacer con el combate?» con **▶ Avanzar** (lo de siempre) y
  **🔮 Simular**: la misma ventana «Batalla terminada», paso a paso, con un cartel violeta arriba «🔮 Simulación: no se guarda nada» y el botón
  **▶ Pasar a Avanzar** (sigue con lo ajustado y recién ahí aparece 📢 Publicar); en simulación no hay Publicar y, por las dudas, publicar se niega
  (`rep.simulacion` en `comun/combate-fin.js`). Tildar, destildar, 🎲 otro consumible y sacar a alguien del reparto quedan en memoria (el reparto no pasa
  por `fueraCambiar`; `darConsumiblesAlAzar` no lo llama esta ventana). Probado en «Claude · pruebas 2» con GM y Jugador 1 (un mapa chico con el Blanco
  creep caído y el Protector 2 en pie): leída la partida antes y después de simular (recompensas, botín, combate, Mesa, historiales, momentos, creeps,
  fichas, `gm/personajes`, ajustes): **nada cambió**; lo mismo desde GM Tools. Después, «Pasar a Avanzar» → Publicar → Jugador 1 vio el botín → Cerrar
  botín: todo como siempre. Partida restaurada. 876 pruebas en verde.
- **✅ hecho (2026-11-19) — 📣 El daño fijo de una zona (sin dados) se aplica directo, pero con aviso al afectado** (dueño, 2026-11-19, P245 ✅: «igual tiene que
  comunicarse, sobre todo la persona afectada. Si te entra un daño directo, te tiene que aparecer una notificación que diga, te ingresó tanto de daño
  por tal razón»). En las zonas con cartel cuyo daño es un número fijo (lo dejó así el #9, `vtt-hexgrid/js/08`): al afectado (quien lo maneja: su
  jugador, o el GM para un creep) le aparece el aviso «Te entraron N de daño por <nombre de la zona>» (con la cuenta si la Defensa frenó algo), y queda
  en la Mesa y la Crónica. Revisar de paso si hay otros daños fijos o directos que entren sin aviso al afectado (anotarlos en el resultado, sin
  cambiarlos todos sin preguntar). Probar en el mapa con una zona del GM de daño fijo sobre un personaje de Jugador 1.
  *Resultado:* lo que el cartel de la zona aplica solo (el número fijo, «la diferencia» sola o el daño de un token oculto) ahora se avisa a quien maneja
  al que lo recibe: si lo resolvió su propia pantalla, en el mismo cartel de la zona, un recuadro rojo «💔 −3 · Te entraron 3 de daño por Brasas del GM
  (4 − Defensa 1 = 3)»; si lo resolvió otra (el GM con 🎮 el control del personaje), al jugador le sale al centro el Aviso con lo mismo y «Entendido».
  A un creep, al GM: «A Blanco creep le entraron 3…». Queda en la Mesa («💔 Blanco J1 · Brasas del GM: le entraron 3 de daño (4 − Defensa 1 = 3)») y en
  la Crónica (`zonaDanoCuenta` / `zonaDanoAvisar`, `vtt-hexgrid/js/08`). Probado en «Claude · pruebas 2» con GM y Jugador 1: zona fija del GM sobre
  Blanco J1 (la resolvió Jugador 1), lo mismo con el GM con el control, y sobre el Blanco creep. Otros daños directos sin aviso al afectado: P246 (sin
  tocar). 874 pruebas en verde.
- **✅ hecho (2026-11-19) — 📣 El mismo aviso al afectado para los otros daños directos** (dueño, 2026-11-19, P246 ✅: «ponele a todos el mismo aviso»). Los seis
  que encontró la tarea del daño fijo de las zonas (ver P246 en `preguntas-abiertas.md`): 🔥 Terreno incendiado (al entrar y en cada Mantenimiento),
  ⛈ Maldición tormentosa (al moverse), 🦵 Tendón cortado (al caminar sangrando), 🛡 Miti-Miti / Escudo humano (lo que se lleva quien protege), ⚡ los
  saltos del Relámpago en cadena, y 🪞🔮 el Espejito y el Orbe salvaje con 1 (le pegan a quien atacó). Mismo aviso que el del daño fijo de una zona
  (`vtt-hexgrid/js/08`): al afectado (su jugador, o el GM para un creep) «Te entraron N de daño por <qué>» con la cuenta, y la línea en la Mesa y la
  Crónica. Reusar esa misma función, no armar otra. Probar en el mapa los que se puedan.
  *Resultado:* una sola función para todos (`danoDirectoAvisar`, la del daño fijo de las zonas, js/08): a quien maneja al afectado, el Aviso al centro
  con la cuenta y «Entendido» (al GM en tercera persona para un creep), la línea en la Mesa y la Crónica. Si llegan dos avisos juntos, el segundo espera
  al primero (también el reporte del rayo). Probado en «Claude · pruebas 2» con GM y Jugador 1: 🔥 al entrar Blanco J1 («Te entraron 3 de daño de fuego
  por el Terreno incendiado (directo a la vida)») y el Blanco creep (al GM), y en el Mantenimiento los dos; ⛈ Blanco J1 al caminar 2 casillas
  Atormentado; 🦵 el Blanco creep caminando 2 con el tendón cortado y sangrando; 🛡 el Escudo humano del Protector 3 (−3) y 🪞 el Espejito del Blanco
  creep (−1 a Blanco J1) en un golpe de varita; ⚡ el salto por el agua al Blanco creep. **Sin probar en el mapa**: el Orbe salvaje con 1 (el d6 sale al
  azar), anotado en `pruebas-en-el-mapa.md`. Los saltos de una varita o del Relámpago van cada uno en su cuadro del duelo (ya se veían). 874 pruebas en verde.
- **✅ hecho (2026-11-19) — 🛡 Cargar el Protector (S4) niveles 2 a 5 y verlos en el mapa** (dueño, 2026-11-19: los cuatro aprobados, «va»). Cargar en
  `comun/creeps-esenciales.js` tal como están en `docs/creeps-humanoides.md` (sección S4: atributos, equipo, habilidades, pasivas, modo SP), con su prueba
  de números en `comun/pruebas.html`, y cambiar sus «Falta cargarlo» por «Cargado». En el mapa ver: Coraza de púas (Espinas a un aliado), Velo espejado
  (Espejo), el Guardián +1 del Escudo de la guardia a un aliado al lado, Purificar como Flash en turno ajeno (4 SP), y Tirar la bronca (Res.Mt contra su
  Ef.Esp, Provocados por el aliado).
  *Resultado:* cargados los cuatro (`const S4` en `comun/creeps-esenciales.js`) con su prueba de números: todos coinciden con el diseño (vida, No2, SP y
  lo que recupera, Def, Def.Esp, PdG.Esp, Ef.Esp, Eva, Parry, Bloqueo, Ini, Mov, Rango, Percepción, resistencias, Guardián). En «Claude · pruebas 2» con
  GM y Jugador 1: la Coraza de púas le devolvió 3 a Blanco J1 al pegarle al Blanco creep, y en ese golpe el Guardián del Protector 3 restó 1; el Velo
  espejado devolvió 2 de una varita; Purificar en el turno de Blanco J1 costó 4 SP, sacó Rengo y curó 5; Tirar la bronca dejó a Blanco J1 Provocado por
  el Blanco creep, con su aviso al empezar el turno. **Arreglado**: la línea del duelo de Purificar decía «Quedó con Purga, Curación» (ahora «Le sacó
  Rengo. Lo curó +5 HP»). 874 pruebas en verde.
- **✅ hecho (2026-11-19) — 📺 El Parpadeo marca las casillas a las que puede saltar** (dueño, 2026-11-19, en la compu, después de probarlo: «me gusta como
  funciona, sólo le agregaría un detalle. cuando apretás "ejecutar", te debería marcar el area de casilleros disponibles para el efecto»). Al ejecutar
  un blink (todo lo que pasa por `blinkDeHabilidad`, js/13: el Parpadeo de los creeps, la Varita del blink, el blink de una habilidad de personaje o de
  invocación, ¡Al frente!), mientras se elige el destino se pintan las casillas válidas (libres y a su alcance), como el Salto (`saltoCasillaDibujar`,
  js/105: reusar ese dibujo, no armar otro). Probar en el mapa con el Parpadeo de un creep y con la Varita del blink de un personaje.
  *Resultado:* al llegar a «¿adónde salta?», quedan pintadas (con el dibujo del Salto, todas en celeste fuerte) las casillas libres a su alcance; con
  ¡Al frente!, solo las pegadas a un rival. Se borran al saltar o al cancelar (Esc). Solo las ve quien elige; un token que esa pantalla no ve (oculto,
  en la niebla) no se descuenta, para no delatarlo (si se hace clic ahí, «Esa casilla no está libre»). Probado en «Claude · pruebas 2»: el Parpadeo del
  Arcano 4 (31 casillas; clic en una ocupada → «no está libre» y siguen marcadas; Esc → se borran y se le devolvieron los 4 SP; después saltó a 3), y la
  Varita del blink de Blanco J1 desde Jugador 1 (a sí mismo, 30 casillas, saltó; a Blanco J1 b, marcadas alrededor de él). 874 pruebas en verde.
- **✅ hecho (2026-11-19) — 😇 Quitar el Pacto desde el menú del token** (dueño, 2026-11-19, en la compu, P244 ✅: «renovarlo desde el token como gm me gustó cómo
  quedó. Técnicamente también debería poderse quitar. Desde el mismo lugar no estaría mal»). En el menú «⋯» del token de un personaje, con el Pacto
  **activo**, un botón para quitarlo (con el Pacto gastado sigue el 😇 de renovar). Lo pueden usar los mismos que renovarlo (el GM y el jugador dueño),
  pide confirmar, deja la línea en la Mesa («😇 El GM le quitó el Pacto a Fulano» / «Fulano dejó su Pacto») y al jugador le avisa. Probar en el mapa.
  *Resultado:* en el «⋯» del token de un personaje con el Pacto activo aparece 🕊 «Quitar el Pacto» (con el Pacto gastado sigue el 😇 de renovar, nunca
  los dos). Pide confirmar («¿Le quitás el Pacto a Blanco J1? Sin el Pacto, si su vida llega a 0 no revive solo…»; el jugador: «¿Dejás el Pacto…?»),
  deja la línea en la Mesa («😇 El GM le quitó el Pacto a Blanco J1» / «😇 Blanco J1 dejó su Pacto») y a Jugador 1 le sale «🕊 Sin el Pacto · El GM te
  quitó el Pacto: si tu vida llega a 0, no revivís solo» (`pactoQuitar`, `vtt-hexgrid/js/83`). Probado en «Claude · pruebas 2» con GM y Jugador 1: el GM
  renovó y quitó, Jugador 1 renovó y dejó el suyo, y Cancelar no cambia nada. Blanco J1 quedó sin Pacto, como estaba. 875 pruebas en verde.
- **✅ hecho (2026-11-19) — 👁 Cargar el D4 Control mental y ceguera niveles 2 a 5 y verlos en el mapa** (dueño, 2026-11-19: los cuatro aprobados, «va»). Cargar
  en `comun/creeps-esenciales.js` tal como están en `docs/creeps-humanoides.md` (sección D4), con su prueba de números en `comun/pruebas.html`, y cambiar
  sus «Falta cargarlo» por «Cargado». En el mapa ver: Confusión (PdG.Esp contra Res.Mt, el 1d4 al actuar), el combo Punzada mental → Confusión con la
  Res.Mt bajada, la Varita del eclipse (25 % de Ceguera), el Grito espeluznante (onda de 3, Pánico), el Tótem de silencio (los rivales a 3 sin
  habilidades de SP; romperlo), el Polen somnífero (Sueño; se despierta con daño o si lo sacuden) y el Espejo del Poncho de espejitos.
  *Resultado:* cargados los cuatro (`const D4` en `comun/creeps-esenciales.js`; el Grito con `Combatiente.GRITO_ESPELUZNANTE.nombre`) con su prueba de
  números: **todos coinciden con el diseño** (vida, No2, SP y lo que recupera, Def, Def.Esp, PdG.Esp, Ef.Esp, Eva, Parry, Ini, Mov, Rango, Percepción,
  Res.CC / Res.Esp / Res.Mt y los costos). En «Claude · pruebas 2» con GM y Jugador 1: Confusión (PdG.Esp contra Res.Mt) dejó a Blanco J1 Confundido y en
  su turno, al moverse, «Estás confundido: tirá antes» → 1d4 = 1, decide el GM; Punzada mental (−5, Mente abierta) y después Confusión: su Res.Mt bajó de
  1d8 a 1d6; la Varita del eclipse a la segunda le dejó Ceguera (salió 4 en el d4); el Grito espeluznante dejó con Pánico a Blanco J1 b y a la Abeja de
  prueba; el Tótem de silencio (40 de vida a nivel 4) frenó «Arma elemental» de Blanco J1 («Usarla igual / Cancelar») y se rompió de un cuchillazo («Rompieron
  … se termina el silencio»; se le bajó la vida a 6 antes, para no pegarle cuatro veces); el Polen somnífero lo durmió y lo despertaron el sacudón de
  Blanco J1 b (1 No2) y, otra vez, la Punzada mental; el Espejo del Poncho le devolvió 1 a Blanco J1 de una varita de chispa. **Arreglado**: el tótem recién
  clavado le daba a Blanco J1 b «👂 Pasos a tu espalda» (un objeto no camina; duda chica en P247). 875 pruebas en verde.
- **✅ hecho (2026-11-19) — 🔮 El d6 del Orbe salvaje, a la vista y con «Elegir manualmente»** (dueño, 2026-11-19: «la solución sería que esta tirada no fuera
  automática»). Hoy el d6 se tira por atrás junto con el daño (`talSalvajeRodar`, vtt-hexgrid/js/53, desde el gancho `orbeSalvaje` de comun/duelo.js) y
  el «Elegir manualmente» del daño no lo toca. Que sea su propio paso en el cuadro del duelo, como las otras chances (`chanceDuelo` de js/78): después
  de tirar el daño, si quien atacó lleva el Orbe (común o domado), «🔮 Orbe salvaje · 🎲 Tirar 1d6» para quien maneja al atacante (el GM por un creep o
  por quien no está), con su «✍ Elegir manualmente», el dado rodando y el resultado (6: ×2, el domado ×3; 1: le entra también a quien atacó; 2–5:
  nada); recién ahí se aplica el daño. Probarlo en el mapa eligiendo a mano el 1 y el 6, con el común y con el domado (el aviso del 1 ya existe).
  *Resultado:* al tirar el daño especial, en el paso Daño del mismo cuadro aparece el recuadro «🔮 Orbe salvaje» (qué hace cada número) y el botón
  violeta «🔮 Orbe salvaje · 🎲 Tirar 1d6» para quien maneja al atacante (al GM, «por Blanco J1»; con un creep, solo el GM), con «✍ Elegir manualmente»
  (un número del 1 al 6: el dado rueda igual y cae ahí). El d6 rueda en todas las pantallas, queda en la Mesa, y recién después sale la cuenta y
  «💔 Aplicar el daño» («🔮 Orbe salvaje ×2: 6 → 12»). Mismo camino que el daño de elemento pendiente (`comun/duelo.js`, `tirarSalvaje`). Probado en
  «Claude · pruebas 2» con GM y Jugador 1, a mano, con la Varita arcana: Blanco J1 con el común (6: 6 → 12; 1: 5 al creep y «Te entraron 5…» a Blanco
  J1) y el domado (6: 6 → 18; 1: lo mismo), y el Blanco creep (tira el GM) con el común (1: «A Blanco creep le entró 1…»; 6: 1 → 2) y el domado (6: 5 → 15;
  1). Orbes y varita devueltos. 875 pruebas en verde.
- **✅ hecho (2026-11-19) — 🎲 El daño de las zonas sin tirada de quien la creó lo tira el dueño de quien la creó** (dueño, 2026-11-19, bloque 4 de
  `auditoria-tiradas.md`, #9: «prefiero que lo tire el propietario de quien creó la zona»). Hoy, en el cartel de las zonas sin tirada de quien la creó
  (las del GM, de trampas con número fijo, el hielo por pasos, la que solo se «Aplica»), si el que entra no resiste, el dado del daño sale solo. Que lo
  tire, con su botón y los dados a la vista, quien maneja a quien creó la zona: el GM si la creó él, un creep o una trampa del GM; el jugador (o quien
  tenga 🎮 el control) si la creó su personaje o la trampa de su personaje. Si no está conectado, el GM puede tirar por él (como en el resto de las
  tiradas). Probar en el mapa con una zona del GM y con una de un personaje.
  *Resultado:* si el que entra no resiste (o toca «Aplicar»), el daño se abre en el cuadro del duelo de siempre (`danoDuelo`): «🎲 Tirar el daño ·
  1d6» le sale a quien maneja a quien creó la zona (el GM por las suyas, sus creeps y sus trampas; el jugador, o quien tenga 🎮 el control, por su
  personaje o su trampa), con los dados 3D en todas las pantallas; el GM puede «Tirar a mano» por el ausente, y el que lo recibe toca «💔 Aplicar el
  daño» con la cuenta a la vista. El cartel de la zona vuelve con «4 de daño de fuego (lo tiró GM; entraron 3)» (`zonaDanoQuien`, `vtt-hexgrid/js/08`).
  Se mantiene la Suela gruesa (ahora también en el duelo). Probado en «Claude · pruebas 2» con GM y Jugador 1: una zona del GM sobre Blanco J1 (tiró el
  GM) y una de Blanco J1 sobre el Blanco creep (tiró Jugador 1). Videos del dado rodando. Casos raros en P245. 874 pruebas en verde.
- **✅ hecho (2026-11-19) — 🎲 La chance del estado de una zona, a la vista** (dueño, 2026-11-19, bloque 4 de `auditoria-tiradas.md`, #19: «aunque se
  tire sola, debe aparecer la instancia de chance de que salga, se debe ver el dado rodando y el resultado, en el menú que sea»). *Resultado:* sigue saliendo
  sola, pero ahora en el cartel de la zona: «Chance de que entre Veneno · 50 %: sale con 4, 5 o 6 en 1d6», «El dado: rodando…» mientras ruedan los dados
  3D (en todas las pantallas, por la Mesa), y cuando quedan quietos «Salió 4 → ¡Entra Veneno!» o «No entra» (`zonaChanceAVista`, `vtt-hexgrid/js/08`). La
  Crónica de los demás lo cuenta («Veneno 50 %: salió 1 → no entra»). El daño de esas zonas no se tocó (#9, espera respuesta). Probado en «Claude · pruebas
  2» con una zona del GM (Veneno 50 %) y Blanco J1 entrando: salió y no salió. Video para el dueño. 873 pruebas en verde.
- **✅ hecho (2026-11-19) — 😇 Renovar el Pacto desde el mapa** (dueño, 2026-11-19: «me gustaría que el jugador también pueda reactivar su pacto desde el
  mismo botón del mapa»). *Resultado:* (1) en el menú del token de un personaje (el ⋯), con el Pacto gastado, un 😇 «Renovar el Pacto» para el GM y para el
  jugador dueño: pide confirmar, marca el Pacto en su ficha, deja la línea en la Mesa («😇 El GM le renovó el Pacto a Blanco J1» / «😇 Blanco J1 renovó su
  Pacto») y al jugador le sale al centro «Un nuevo Pacto: Una entidad espiritual te brindó un nuevo Pacto…» (`pactoRenovar`, `vtt-hexgrid/js/83-pacto.js`).
  (2) En la ficha, pasar «😇 Pacto» de No a Sí abre «El Pacto lo renueva el GM cuando la historia lo da. ¿Lo cambiás igual?»; Cancelar lo deja en No, «Sí,
  cambiarlo» lo activa con la misma línea en la Mesa (`pactoCambioAMano`, `ficha-personaje/js/06`). Gastarlo sigue automático. Los textos, en
  `Combatiente` (`pactoRenovadoTxt`, `PACTO_AVISO`, `PACTO_A_MANO`). Probado en «Claude · pruebas 2» con GM y Jugador 1 (las dos renovaciones desde el
  mapa y el cartel de la ficha). Dudas chicas en P244. 874 pruebas en verde.
- **✅ hecho (2026-11-19) — 🪧 Andanada arcana: el cartel «¿a quién va el siguiente misil?» queda tapado** (dueño, 2026-11-19: «habría que
  corregirlo»). *Resultado:* el cartel ahora espera a que el cuadro del misil anterior se cierre (solo a los 10 s, con «Listo, cerrar» o
  minimizándolo) y recién ahí sale, con el mapa a la vista (`misilSiguiente`, `vtt-hexgrid/js/13-tokens-portal-duelo.js`; vale también para las
  Varitas de misiles). Probado en «Claude · pruebas 2» con el Arcano 4: tres misiles (dos a Blanco J1, uno al Blanco creep), los carteles «misil 2 de
  3» y «misil 3 de 3» salieron limpios. 873 pruebas en verde.
- **✅ hecho (2026-11-19) — 🦶 Intercambio arcano contra un rival Inamovible: el recordatorio** (dueño, 2026-11-19, P243 ✅: «con un rival debe
  aparecer el recordatorio de que el rival es inamovible (no debería poder moverlo)»). *Resultado:* **ya cumplía, sin cambios de código.** Arcano 5 →
  Blanco J1 (Botas de estibador): ganó el PdG.Esp (3 contra la Res.Esp 1, a mano) y a Jugador 1 le salió el cuadro «Inamovible: Intercambio arcano:
  Arcano 5 y Blanco J1» con «Inamovible 33 % · funciona con 5–6 · 🎲 Tirar el efecto (1d6)». Con el Inamovible que aguanta (✍ «Funcionó»): «¡Inamovible!
  No lo mueven» y «Blanco J1 es Inamovible (33 %): no se mueve nadie» en la Mesa y la Crónica; los dos quedaron en su casilla. Con un 1 (prueba del
  2026-11-19) los cambió. Con un aliado no se tira (como antes). Para mirar (no es de esta tarea): el cartel verde grande del cuadro dice «no hay nada
  que resistir: se aplica» antes de tirar la chance, y puede confundir.
- **✅ hecho (2026-11-19) — 📺 Animación del Intercambio arcano** (dueño, 2026-11-19: «me gustaría la animación en ambos tokens de old time tv turn
  on/off»). *Resultado:* los dos tokens se apagan como un televisor viejo y se prenden cada uno en la casilla del otro, a la vez y en todas las pantallas
  (un solo momento con los dos: `blinkTvPublicarVarios`, `vtt-hexgrid/js/111-parpadeo-tv.js`; lo usa `cambiarLugarResuelto` de js/107 solo para el
  Intercambio: «Cambiar de lugar» sigue con su cruce en arco). Sin estela (no caminan); si el cuadro del duelo está abierto, se repliega mientras dura y
  vuelve. Probado en «Claude · pruebas 2» (GM + Jugador 1): a un aliado (el Blanco creep) y a un rival (Blanco J1 b). Video para el dueño. 873 pruebas
  en verde.
- **✅ hecho (2026-11-19) — ✨ Animación de la Lanza arcana** (dueño, 2026-11-19: «me gusta así»). *Resultado:* `vtt-hexgrid/js/120-lanza-fx.js`, en todas
  las pantallas: la carga (brillo violeta que crece en el Arcano, medio segundo), la lanza de luz que recorre la línea hasta el final del alcance con su
  estela que se apaga, y un estallido de chispas violetas en cada token que atraviesa (sin frenarse); la cascada de duelos arranca cuando ya se vio. Al
  que no la esquivó, un destello blanco de un segundo (Deslumbrado; si el cuadro del duelo está abierto, se aparta mientras dura); al que la esquivó,
  nada. Probado en «Claude · pruebas 2» con el Arcano 2 y en la línea Blanco J1, el Blanco creep (su aliado) y Blanco J1 b: los dos primeros no la
  esquivaron (destello y Deslumbrado); Blanco J1 b ganó la Evasión, se corrió de la línea y no tuvo destello. Video para el dueño. 873 pruebas en verde.
- **✅ hecho (2026-11-18) — 🏹✨ Lo que quedó sin ver en el mapa del Hunter (R4 nv2–5) y el Arcano (M4 nv2–3)** («Claude · pruebas 2», mapa
  «Prueba · R4 M4», GM + Jugador 1; Jugador 1 tiene ahora un segundo personaje, «Blanco J1 b», para tener dos rivales):
  - [x] ✨ Lanza arcana atravesando a varios: Arcano 2 en línea recta con Blanco J1, el Blanco creep (su aliado) y Blanco J1 b: un solo PdG.Esp y un
    solo daño (8, «el mismo para todos»), los tres tiraron Evasión, el aliado también entró, y los tres quedaron Deslumbrados.
  - [x] 🏹 Abanico (Hunter 5) con el Hunter 4 (aliado) adentro del cono y dos rivales: el área tomó solo a Blanco J1 y Blanco J1 b (el aliado, nada);
    un PdG para los dos (1d6+1d8+1) y el mismo daño (11).
  - [x] 📏 Largo alcance arcano: la Lanza del Arcano 2 llegó a Blanco J1 b a 6 casillas (sin la pasiva, el Rango es 5).
  - [x] 🎯 Puntería: el PdG del Hunter 4 es 14 con Destreza 13 (el Hunter 3, sin la pasiva, 12 con Destreza 12). **Arreglado de paso:** la 🔍 decía
    «Sin modificadores» (la cuenta sí la sumaba); ahora dice «Puntería (pasiva · PdG) +1» (`CreepCalculo.aportesMod` suma las pasivas).
- **✅ hecho (2026-11-18) — 🏹✨ Hunter (R4) niveles 2 a 5 y Arcano (M4) niveles 2 y 3, cargados y vistos en el mapa** («Claude · pruebas 2», mapa
  «Prueba · R4 M4», GM + Jugador 1 con clics en las dos pantallas). 871 pruebas en verde.
  - [x] Tiro que derriba (Hunter 2): pegó, «Empujón» 1 casilla y Sentado en el personaje.
  - [x] Mina del cazador (Hunter 3): el aviso «trampa a la vista de un rival» si la pone en su cono; Jugador 1 pisó el centro: 2d6+2 = 9 directo a
    la vida y Res.CC 2 contra 12 (la Destreza del Hunter 3) → Pajaritos 2 turnos.
  - [x] Cebo (Hunter 4): «Algo brilla…»; Res.Mt contra 13 (su Destreza), perdió, caminó 2 hacia el brillo y lo dio vuelta («puto el que lee»).
  - [x] Abanico (Hunter 5, mirando al personaje): PdG 1d6+1d8+1 contra la Evasión, el daño de su arma (2d4 + 4).
  - [x] Percepción aumentada (Hunter 2): el personaje, en Sigilo, se acercó por la espalda y el GM recibió «Hunter 2 tiene la sensación de que lo
    observan… Tirá la Percepción» (sin la pasiva, la espalda es punto ciego).
  - [x] Lanza arcana (Arcano 2): la línea hasta el personaje, PdG.Esp contra Evasión, 3d6 arcano y Deslumbrado 2 turnos.
  - [x] Portal trampa (Arcano 3): Jugador 1 no lo veía; al pisarlo, Res.Esp 8 contra 16 (su Ef.Esp) → «Atravesar el portal», llegó a la casilla
    marcada (4 más allá) y Expuesto 1 turno.

- **✅ hecho (2026-11-18) — 🔀 Intercambio arcano programado y el Arcano niveles 4 y 5 cargados** (dueño, 2026-11-18: «me gusta esta. habría que
  programarla»). *Resultado:* la habilidad está en `comun/skills-creep-base.js` (Mago, auditada): a cualquiera en su Rango; a un aliado le entra directo
  (como la Mala sombra), a un rival su PdG.Esp contra la Res.Esp; si entra, el mapa del GM los cambia de lugar con el mismo mecanismo y la misma
  animación que «Cambiar de lugar» (sin ataques de oportunidad). 5 SP fijos y 2 No2, o cooldown 3. M4 nv4 y nv5 cargados como en `creeps-humanoides.md`
  (los números del diseño, en la prueba automática). Probado en «Claude · pruebas 2» (GM + Jugador 1): a un aliado (el Blanco creep) cambiaron de lugar
  sin tirada; a Blanco J1, 8 contra 5 → cambiaron; con la Res.Esp de J1 en 30 (✍ Elegir manualmente) → «lo resistió» y no se movió nadie. 872 pruebas
  en verde. **Duda anotada** (P243): un aliado Inamovible no tira su chance (sí un rival, como en Cambiar de lugar).
- **✅ hecho (2026-11-18) — ✨ Andanada arcana recosteada, vista en el mapa** (con el Arcano nv4, en «Claude · pruebas 2»): cobró 9 SP fijos (45 → 36),
  cada misil tiró su PdG.Esp y 1d6 + 4 de daño (7, 7, …); el segundo misil repitió blanco (Blanco J1) y el tercero fue a otro (el Blanco creep), con el
  «misil N de 3 — ¿a quién?» después de cada uno. Ojo (para mirar, no es error): el cartel «¿a quién?» sale mientras el cuadro del misil anterior
  sigue abierto unos segundos y queda medio tapado.
- **✅ hecho (2026-11-19) — 🧪 Pruebas en el mapa que quedaron sin hacer** (dueño, 2026-11-18: «ponelo en la cola y una vez que lo pruebes, marcalo como
  probado»). Cada una se tacha acá (✔ con fecha y el resultado en una línea) y en `docs/pruebas-en-el-mapa.md` apenas queda probada:
  - [x] ✔ 2026-11-19 🌑 Mala sombra desde la Botonera (Blanco J1 con la habilidad de clase): a un rival (Arcano 5) PdG.Esp 3 contra Res.Mt 8 → «lo resistió»; a un aliado (Blanco J1 b) entró directo, sin tirada → «Mala sombra (2)».
  - [x] ✔ 2026-11-18 🎯 Punto débil dejando la resistencia a crítico en negativo — Aguja siniestra (Maldito 1) a un creep sin resistencia y
    Ráfaga de cortes (Tipo 6): el cuadro muestra «Tipo 6 − Crítico frecuente 2 − 💢 Punto débil 1 = 3», el cuadradito violeta 💢 y una diferencia de 3 ya es crítico.
  - [x] ✔ 2026-11-19 🫨 Arrastrar → Desequilibrado: el Peleador de control 5 enganchó a Blanco J1 b (un personaje), lo trajo 2 casilleros y quedó Desequilibrado (−2 Evasión); con su turno en el orden, el ▶ Siguiente del GM se lo sacó. Ojo: quién quedó Desequilibrado lo recuerda el navegador del GM; abriendo el mapa en otro navegador no se va solo (se probó: quedó puesto).
  - [x] ✔ 2026-11-19 🌀 El Remolino con dos rivales (Blanco J1 entre el Arcano 4 y el Arcano 5): «¿te movés en el giro?» → su casilla → «elegí al primero» → un duelo por cada uno, de a uno (al Arcano 5, crítico ×2).
  - [x] ✔ 2026-11-19 🔥🐝 El Arma elemental en una invocación: **había un error y se arregló**: a la invocación le llegaba «🔥 Arma ígnea» como un estado sin su golpe (las invocaciones no publican sus armas, el nombre lleva el ícono y no se encontraba el preset) y no sumaba nada. Ahora (`FichaAcciones.estadoDeSpec` busca por el nombre de base, como con los creeps): la Abeja de prueba pegó con el Cuchillo, «🔥 Tirar el daño de fuego · 1d6» y «+ 3 de fuego directo = 10 en total».
  - [x] ✔ 2026-11-19 🦶 Inamovible con el cartel nuevo: Intercambio arcano del Arcano 5 a Blanco J1 (Botas de estibador): «Blanco J1 es Inamovible (Botas de estibador, 33 %): sale con 5 o 6 en 1d6» → salió 1 → los cambió.
  - [x] ✔ 2026-11-19 ⏱ Recuperarse rápido: a Blanco J1 b (Tobilleras de vendaje) le llegó Inmovilizado 2 turnos → a Jugador 1 «🎲 Tirar 1d6» → «Recuperarse rápido (Tobilleras de vendaje, 50 %)» salió 4 → Inmovilizado 1 turno. (Sentado sin turnos no lo dispara, a propósito: solo lo que tiene turnos.)
  Probar en «Claude · pruebas 2» mientras el dueño use «Claude · pruebas».
  (2026-11-19, Claude: en «Claude · pruebas 2» quedaron armados para eso: Blanco J1 con Mala sombra, Remolino, Arma elemental, las Botas de estibador
  y la invocación «Abeja de prueba»; Blanco J1 b con las Tobilleras de vendaje; el Peleador de control 5 en el mapa «Prueba · R4 M4».)

- **✅ hecho (2026-11-18) — ❤ La Vida extra como vida también en la ficha, GM Tools y los Tableros** (dueño, 2026-11-18: «sí», a que la ficha también
  muestre 100/35). *Resultado:* `Combatiente.vidaExtraDe(estados)` (ficha, creep y resumen público). La ficha muestra en la caja de vida el total
  (vida + Vida extra) sobre el máximo real, con un detalle chico «(❤+65 de Vida extra)»; al entrar a escribir, la caja muestra la vida sola (lo que se
  escribe o suma es la vida, como siempre) y al salir vuelve al total. Igual en la caja de HP de la tarjeta del creep en GM Tools, el Tablero (GM Tools
  y mapa) y el Ver del creep. Probado en «Claude · pruebas 2»: ficha de J1 con Vida extra 65 → «100 / 35 (❤+65 de Vida extra)» (al enfocar 35, al
  salir 100); creep con Vida extra 20 → «50 / 30» (al enfocar 30). 871 pruebas en verde.

- **✅ hecho (2026-11-18) — ❤ La Vida extra se muestra como vida** (dueño, 2026-11-18, con captura del salto a Bizzante: «0 de daño le va a entrar a la vida»
  con «− Vida extra 4»: «está comunicado raro. La vida extra es como si tuvieras un valor de vida por encima de tu máximo… tiene que decir que entró
  4 de daño, tu vida pasó de X a Y, y el resultado final Y/(tu máximo real); como quedó hoy Bizzante debería mostrar 100/35»).
  La vida que se muestra = vida + Vida extra, sobre el máximo real (35 + 65 = **100/35**). En la cuenta del daño: «4 de daño entra a la vida ·
  104/35 → 100/35» (sin el renglón «− Vida extra … se la lleva a ella»), y el número grande dice 4, no 0. Lo mismo en todo lo que muestra la vida
  después de un golpe: el cuadro del duelo, las trampas y zonas, la Mesa, el aviso del salto del rayo, el círculo de vida del token, la ficha lite,
  la Botonera y la ficha (revisar dónde se ve la vida). Lo demás no cambia (la Vida extra se gasta primero, como hoy). Probar en «Claude · pruebas 2».
  *Resultado:* `Combatiente.vidaConExtra / vidaCambioTxt / danoAVida` (comun/combatiente.js) y `resolverGolpe` (js/10) devuelve la Vida extra de antes
  y después (+ el máximo). El cuadro del duelo (vista previa y resultado), la Mesa, la cuenta (sin el renglón «− Vida extra»), las trampas (js/19), el
  salto del rayo (js/10, js/110) y el toast del golpe muestran «N de daño · vida 104/35 → 100/35». El círculo del token ya sumaba la Vida extra
  (2026-11-09). Probado en «Claude · pruebas 2»: personaje de J1 con Vida extra 10 (vida 15/5 → 11/5, «4 de daño») y Rata C con 65 (95/30 → 93/30).
  Sin tocar: la ficha (sus números de vida y el ❤+N aparte).

- **✅ hecho (2026-11-18) — ⚡ La cadena de rayos: no cortarse en un invulnerable, y la secuencia de a uno** (dueño, 2026-11-18, probando Cadena de rayos del
  Mago del rayo nv5 sobre Rockardo en «Prueba · Tormenta y Meteoro»: «debería haber saltado a Bizzante y a Larry»).
  **Lo que pasó** (visto en los datos): el golpe a Rockardo hizo 8; saltó a Bizzante, que estaba Titilando (invulnerable, recién salvado por el
  Pacto) → «Bizzante −0 (salto)»; y la cadena se cortó ahí, porque cada salto es la mitad de lo que ENTRÓ (0), así que no siguió a Larry.
  (1) **El salto se calcula sobre lo que llegaba, no sobre lo que entró:** 8 → 4 → 2 → 1, aunque uno lo frene (invulnerable, resistencia, escudo).
  (2) **La secuencia** (pedido del dueño): el que lanza tira el rayo → elige objetivo → el cuadro del duelo (PdG, Evasión, daño…). Recién ahí, si va
  a saltar: el cuadro se minimiza, se ve la animación de TODOS los saltos que van a pasar (uno tras otro) y después se abre, de a uno, el
  «Aplicar el daño» de cada alcanzado por el salto, y su tirada de Parálisis si corresponde (Varita de chispa, Arma eléctrica…). Vale para toda
  cadena de rayo (Cadena de rayos, varitas, Arma eléctrica, Escudo elemental). Video de la animación. Probar en «Claude · pruebas 2».
  **Regla del dueño (2026-11-18, con el caso real: Bizzante tenía Vida extra 69, no era invulnerable):** la Vida extra cuenta como vida (si baja, el
  daño entró y la cadena sigue); si lo frena un escudo, el salto sigue igual; un **Invulnerable no se elige como blanco**: el rayo salta al siguiente
  rival elegible. Cada salto, la mitad de lo que llegaba; la línea dice qué pasó («se lo comió la Vida extra 69 → 65», «lo frenó el escudo (4)»).
  *Resultado:* `rayoCadena` (js/10) ya no elige Invulnerables (`rayoInvulnerable`) y la mitad sale de lo que llegaba; `rayoCadenaAplicar` (lo usa el
  Escudo elemental) sigue con lo que llegaba y anota la nota de cada salto (`rayoVidaExtraDe`), que muestran el reporte y la Mesa (js/110). La
  secuencia (`dueloCadenaSecuencia`, js/13; la llaman la Cadena de rayos, el arma con rayo en cadena y el «a mano»): espera que el duelo del golpe
  termine → momento `rayo` (todas las pantallas: aparta el cuadro abierto y anima todos los saltos, js/16) → línea en la Mesa → de a uno, un duelo
  por salto directo en «💔 Aplicar el daño» con el daño ya puesto (`hab.dano.yaTirado`), que aplica el afectado (su jugador, el GM por los creeps), y
  la Parálisis en los efectos de ese mismo cuadro si corresponde. Probado en «Claude · pruebas 2» (GM + J1): saltos 8 → 4 (personaje de J1: aplicó él,
  5 → 1, y tiró la Parálisis) → 2 (Rata C con Vida extra: «la Vida extra se llevó 2», 30 → 30); `rayoCadenaAplicar` con Vida extra 10 en el medio
  (10 → 6 y siguió con 2); `rayoCadena` real con una rata Invulnerable pegada (no la eligió, saltó a la otra) y Escudo especial («lo frenó el escudo
  (4)»). Pendiente de verlo el dueño en una sesión real: las varitas y el Escudo elemental con la cadena entera.

- **✅ hecho (2026-11-18) — ☄ El aviso de la sombra del Meteoro** (dueño, 2026-11-18: «cuando alguien castea el meteoro, al seleccionar el área, a las personas
  dentro del área les aparezca una notificación que diga "Una sombra cubre el suelo: algo cae del cielo." Nada más»). Al marcar el centro, a quien
  maneja cada token que quedó adentro (su jugador; el GM por los creeps) le sale ese aviso, con ese texto exacto y nada más (sin nombrar al mago ni
  el daño). Una vez por token. Probar en «Claude · pruebas 2» con las dos cuentas.
  *Resultado:* `meteoroAvisarSombra` (vtt-hexgrid/js/74) al marcar el centro: un momento `meteoro-sombra` (sin tarjeta en la Crónica, js/16) con los
  uids de quien maneja cada personaje/invocación de adentro y el GM si hay creeps; cada pantalla a la que le toca muestra el cartel «☄ Una sombra
  cubre el suelo: algo cae del cielo.» con «Entendido», una vez. Probado en «Claude · pruebas 2»: J1 (su token adentro) y el GM (creeps adentro) lo vieron.

- **✅ hecho (2026-11-18) — ⚡ El salto del rayo, solo a rivales** (dueño, 2026-11-18: «el rayo no salta al propio caster ni siquiera salta a aliados, solo salta a
  rivales»; el ayudante vio que el salto del Arma eléctrica le pegó al propio atacante por ser el más cercano). Todo salto de rayo (Arma eléctrica,
  Varita de chispa, Varita del relámpago, Cadena de rayos, el Escudo elemental eléctrico…) elige solo entre los rivales de quien lo lanzó: nunca él
  mismo ni sus aliados. Ojo: hay una regla vieja del agua («el salto del rayo por un charco llega a todos», js/106 y js/50): no tocarla sin
  preguntar; contar cómo queda. Probar en «Claude · pruebas 2».
  *Resultado:* regla pura `Combatiente.rayoSaltaA` (con prueba automática: 869 en verde) y `rayoCadena` (js/10) recibe `lanzador`: nunca salta a quien
  lo lanzó ni a sus aliados, solo a sus rivales. Cubre todo lo que pasa por `dueloCadena` (js/13: Arma eléctrica y el elemento de un arma, varitas y
  habilidades con `cadena` —Varita de chispa, del relámpago, Cadena de rayos— y el Escudo elemental eléctrico, donde «lanzador» es el portador del
  escudo) y las flechas que saltan (js/33). **El agua no cambió**: en un charco el salto sigue llegando a todos los que están parados en él (también a
  quien lo lanzó y sus aliados), y el rayo que corre por el agua (js/50, `soloAgua`) tampoco. Probado en «Claude · pruebas 2»: Rata A (Arma eléctrica)
  le pega a Rata B, con Rata A y Rata C (aliada) pegadas y un blanco personaje a 2 → el salto fue al personaje (antes iba a Rata A).

- **✅ hecho (2026-11-18) — 🔧 Dos restos del daño de elemento separado** (2026-11-18, del ayudante, commit cd6ab2ff): (1) el botón del primer paso todavía
  dice «Tirar el daño · … + 🔥 +1d6 fuego» (lo arma la página del atacante): que diga solo el daño del arma, porque el elemento ya se tira aparte;
  (2) con un arma eléctrica (Arma eléctrica) el duelo no llegó al cierre en la prueba, probablemente por el salto al más cercano: revisar y probar
  con un segundo blanco cerca. Probar en «Claude · pruebas 2».
  *Resultado:* (1) el botón del primer paso ya dice solo el daño del arma («🎲 Tirar el daño · Dientes de rata · 1d4 + 6»): se sacó el «+ ⚡1d6…»
  de la vista previa en `comun/ficha-duelo.js` y `comun/creep-duelo.js`. (2) No era un error del arma eléctrica: la prueba anterior se cortaba porque
  el script no tocaba «🎲 Tirar el efecto (1d10)» (la Parálisis 20 %) ni el «Entendido» del cartel del salto. Probado en «Claude · pruebas 2» con
  tres ratas: PdG → Evasión → daño del arma → «⚡ Tirar el daño eléctrico · 1d6» → Aplicar → efecto → salto → resumen del duelo en la Mesa. Duda:
  el salto del rayo le pegó también al propio atacante (Rata A −1/−2) por ser el más cercano: ¿el rayo puede saltar a quien lo lanzó?

- **✅ hecho (2026-11-18) — 🔥❄⚡ El daño de elemento de un arma, en su propia tirada y con dados de su elemento** (dueño, 2026-11-18: «sí», a separar como el
  Meteoro). Hoy el daño elemental de un arma o una flecha (Arma elemental, flechas con fuego, varitas con daño físico + elemental, lo que use el
  extra de elemento) sale junto con el daño del arma en una sola tirada. Que sean dos pasos: primero «🎲 Tirar el daño (…)» del arma y después
  «🔥/❄/⚡/🧪/☠/☀/🌑 Tirar el daño de <elemento> (…)», cada uno con su recuadro, su número y su línea en la Mesa; los dados 3D del elemento con un
  estilo de su color (fuego ya existe, del Meteoro, commit 8a91a02c; buscar o armar los otros: hielo, rayo, ácido, tóxico, luz, siniestro). La cuenta
  de cada uno como siempre (lo físico con la Defensa; el elemento con su resistencia). Ojo con el crítico: el multiplicador hoy alcanza a todo el
  daño: no cambiarlo, solo mostrarlo bien en los dos. Video corto de los dados de 2–3 elementos. Probar en «Claude · pruebas 2».
  *Resultado:* `comun/duelo.js`: al guardar el daño del arma, el elemental queda pendiente (`dano.magico.pend`) y el cuadro muestra su propio paso
  «🔥/❄️/⚡… Tirar el daño de <elemento> · 1d6» (quien atacó, o el GM por él); se tira con los dados 3D del juego de su elemento (fuego → fire,
  hielo → ice, rayo → lightning, ácido → acid, tóxico → poison, luz → radiant, siniestro → necrotic), va a la Mesa en su línea y recién con los
  dados quietos se anota y se puede aplicar (aceptar / reclamar / la vista previa esperan). El Orbe salvaje se tira en ese momento. Cubre todo lo
  que un arma suma como daño elemental (`danoMagico` con dado en sus efectos al golpear): Arma elemental, flechas con elemento, armas con
  rayo/hielo. Las habilidades (varitas, hechizos) no cambian: su daño ya es una sola tirada; el Meteoro sigue con sus dos pasos. Probado en
  «Claude · pruebas 2» (Rata A con Arma ígnea / helada / eléctrica contra Rata B): los dos pasos en los tres, con dados de fuego, hielo y rayo;
  868 pruebas en verde. Dudas: el botón del primer paso sigue diciendo «Tirar el daño · … + 🔥 +1d6 fuego» (lo arma la página del atacante);
  con el arma eléctrica, el duelo no llegó al cierre en la prueba (el salto al más cercano: no revisado).

- **✅ hecho (2026-11-18) — ☄🔥 Meteoro: dos tiradas bien claras (físico y fuego), con dados de fuego** (dueño, 2026-11-18, con captura: «tirar todo junto el
  daño físico y el de fuego no me gusta. Deberían ser dos tiradas bien claras. Y si a los dados del daño de fuego le pudieras sumar algún efecto ígneo
  en su animación 3D, mejor»). Hoy un solo botón tira 4d6 y 2d6 juntos. Que sean **dos pasos**: «🎲 Tirar el daño físico (4d6)» y, después,
  «🔥 Tirar el daño de fuego (2d6)», cada uno con su recuadro y su resultado (los dos una sola vez para todos, como ahora). En los dados 3D del
  fuego, un estilo ígneo (color brasa/llamas, brillo o chispas). Revisar si los demás daños con un extra de elemento (`dano.extra`) usan el mismo
  camino y contarlo (no cambiarlos sin preguntar). Video corto de los dados de fuego. Probar en «Claude · pruebas 2» (el dueño trabaja en
  «Claude · pruebas»).
  *Resultado:* quien lo lanzó tira primero «🎲 Tirar daño físico · 4d6» (su cuadro, su número) y después «🔥 Tirar daño de fuego · 2d6» (otro cuadro;
  los dados 3D con el colorset de fuego de la librería, `{c:'fire'}`: `hab.dadosEstilo` en comun/duelo.js → `r.estiloDados` → comun/mesa.js); entre
  tirada y tirada queda el resultado a la vista 2,8 s. Los dos totales viajan a cada afectado como antes (`yaTirado` + `extra`). Probado en «Claude ·
  pruebas 2» (Rata A lanza sobre B y C): 4d6 = 17 y 2d6 = 8 en la Mesa, el del fuego con estilo fire; a cada rata 17 − Def 1 + 8 = 24. Otros daños
  con un extra de elemento (sin cambiar): el daño elemental de un arma o una flecha (efectos `danoMagico`, Arma elemental) se tira junto con el daño
  del arma, en la misma tirada (comun/duelo.js, `m.dano.magico`).

- **✅ hecho (2026-11-18) — 🏁 Los duelos terminados se cierran solos** (dueño, 2026-11-18, al abrir la compu después de las pruebas de la noche: el mapa
  lleno de tiras de duelos ya terminados —«Pegó: Bruto → Rockardo · ver», «Meteoro · el daño: 25 · ver», «Sanador: sigue adentro · ver»…— y un
  cuadro con «🏁 LISTO · Listo, cerrar»). Pedido: **un duelo terminado se cierra solo a los 10 segundos** (como si se tocara «Listo, cerrar»), y su
  tira minimizada también desaparece sola; **siempre que se pueda volver a abrir desde la Mesa** («🔍 Ver detalle del duelo» en su línea; revisar que
  todo duelo terminado —también los de área, Tormenta, Meteoro, trampas, chances— tenga esa línea con su botón). Mientras corre la cuenta, que se
  vea («se cierra en 10 s», y si se toca el cuadro, se queda abierto). Un duelo que todavía espera algo NO se cierra.
  Al probar: NO en «Claude · pruebas» mientras el dueño la use (comparte la cuenta del GM): en otra partida de prueba o cuando el dueño lo diga.
  *Resultado:* `comun/duelo.js`: el cuadro terminado (o cancelado) muestra «Se cierra solo en N s · tocá el cuadro para dejarlo abierto» y a los 10 s
  se cierra (`autoCierreArmar`); tocarlo lo deja abierto («Queda abierto»); solo arranca si terminó mientras esa pantalla lo miraba (uno reabierto
  para revisar no se cierra solo). Las tiras de duelos terminados se van a los 10 s (`RESUELTO_VISIBLE_MS`, con un redibujo programado). La Mesa ya
  tenía «🔍 Ver detalle del duelo» en todo duelo con su resumen (las trampas y las chances con cartel propio no son duelos: tienen su línea en la Mesa
  y la Crónica; el «¿Esquiva?» y la tirada de proyectiles de la Tormenta/Meteoro cuentan con sus líneas). Probado en la partida nueva «Claude ·
  pruebas 2» (GM + J1, tres ratas): en curso, a los 12 s sigue abierto; terminado, la cuenta en las dos pantallas y a los 11 s cerrado sin tiras;
  «Ver detalle del duelo» abre el resumen; tocado, a los 12 s sigue abierto. Capturas `scratchpad/auto/`.

- **✅ hecho (2026-11-18) — 💥 Todas las áreas: una sola tirada de daño para todos** (dueño, 2026-11-18: «sí», a la pregunta de pasar las demás áreas a una
  tirada como el Meteoro). Bola de fuego, ondas, conos, varitas de área y cualquier hechizo/habilidad de área con un daño común: quien la lanza tira el
  daño UNA vez y a cada afectado se le aplica ese resultado con lo suyo (Defensa / Def.Esp / resistencia al elemento), de a uno con su cuenta, como
  el Meteoro (js/118, commit a7a6694f). La Tormenta queda como está (cada uno su Nd4). Ojo con los daños que dependen del objetivo (la diferencia de
  tiradas, «la mitad si resiste», críticos): contarlo y no inventar. Probar en el mapa con capturas.
  *Resultado:* el daño que tira quien la lanzó contra el primero al que le pega queda en el área (`hab.danoCompartido`, adentro de `hab` porque las
  reglas de `areas` no aceptan campos nuevos; js/13 `dueloGrupoResuelto`) **sin lo de ese objetivo** (`dano.tiroBase`, comun/duelo.js) y los
  siguientes lo reciben ya tirado (`hab.dano.yaTirado`, el mismo camino del Meteoro): solo «Aplicar el daño», con su cuenta y lo de cada uno (la
  Presa, el miedo, el estandarte… `sumarModsDelObjetivo`; y al aplicar, su Def.Esp/Defensa/resistencia). Línea en la Mesa: «💥 Bola de fuego: el daño
  (N) es el mismo para todos los que alcanza». Vale para toda área/onda/cono/línea/varita de área con daño. **Quedan como estaban:** «la
  diferencia» (Drenar: depende de cada uno), los misiles repartidos (cada misil su tirada), la Tormenta y el Meteoro (su secuencia, js/118) y las
  zonas con duelo (se vuelven a tirar contra cada uno, js/112). Probado en el mapa con la Bola de fuego del Piromante sobre tres creeps: el primero
  tiró 2d6+4 = 12 y al Martillero y al Sanador les llegó «2d6+4 (una tirada para todos)» = 12 (+2 de la Botella con un diablito) − Def.Esp 4 = 10,
  sin botón de tirar. 868 pruebas en verde.
- **✅ hecho (2026-11-18) — 🏁 Devolver gentileza: sin el «FIN DEL DUELO» mientras se pregunta** (dueño, 2026-11-18: «sacalo»). En el cuadro del duelo, debajo de
  «¿Contraatacás? (Devolver gentileza)», ya aparece «🏁 FIN DEL DUELO · Ya no queda ninguna reacción por resolver»: que no aparezca hasta que se
  conteste (revisar lo mismo con la pregunta del Contraataque). Captura en `scratchpad/noche/h4/m04-GM.png`.

  *Resultado:* mientras el cuadro muestra «¿Contraatacás?» (Devolver gentileza o el Contraataque) o «está decidiendo…», no aparece el cartel
  «🏁 FIN DEL DUELO»; sale recién al contestar (comun/duelo.js, `esperaContra`). Probado en el mapa: Hachero contra el Escudero (con la pasiva),
  Parry y Bloqueo ganados → la pregunta sin el cartel de fin; con «No», aparece el fin.
- **✅ hecho (2026-11-18) — ☄ El daño del Meteoro, una sola tirada** (dueño, 2026-11-18, probándolo: «me pide que tire el daño una vez por cada objetivo
  afectado. La tirada de daño debería ser una sola, y después se calcula cuánto daño le pasó a cada afectado de acuerdo a sus resistencias»).
  Quien lo lanzó tira **una vez** (4d6 físico + 2d6 de fuego) y a cada uno que quedó adentro se le aplica ese mismo resultado con lo suyo (la Defensa
  al físico, la Res. fuego al fuego), de a uno como ahora («Aplicar el daño» con la cuenta de cada uno). Revisar si las demás áreas con un daño para
  todos (Bola de fuego, ondas, conos, varitas de área) tiran una vez o por objetivo, y contarlo (la Tormenta es distinta: cada uno su Nd4).
  Probar en el mapa cuando el dueño no lo esté usando.
  *Resultado:* después de la ronda de «¿Esquiva?», quien lo lanzó tira **una sola vez** «🎲 Tirar de daño · 4d6+2d6» (un cuadro de una tirada, como
  los proyectiles de la Tormenta; la Mesa dice «4d6 = 16 físico + 2d6 = 9 de fuego — el mismo para todos») y a cada uno le llega ese resultado ya
  tirado (`hab.dano.yaTirado`, comun/duelo.js; js/118): solo queda «Aplicar el daño» con su cuenta. Probado en un mapa propio con un Martillero
  (Defensa 8) y un Sanador (Defensa 2) bajo el mismo meteoro: 16 físico + 9 de fuego → 17 y 23 a la vida (la diferencia es la Defensa).
  **Las otras áreas** (Bola de fuego, ondas, conos, varitas de área): comparten la tirada de ataque (PdG / PdG.Esp) pero cada objetivo tira su
  propio daño en su cuadro. No lo cambié: queda como pregunta para el dueño.

- **✅ hecho (2026-11-18) — ☄🖼 La sombra del Meteoro más visible, y el texto del fondo del mapa** (dueño, 2026-11-18): (1) la sombra que deja el Meteoro
  hasta que cae se ve poco sobre una imagen de fondo: que se note más (más oscura o con borde, que se vea sobre cualquier fondo); (2) en 🗺 Mapas →
  🖼 Fondo, antes de cargar la imagen dice solo «La imagen se achica sola…»: que avise que después se puede cambiar el ancho en casillas y moverla
  con el mouse para acomodarla a la grilla.
  *Resultado:* (1) la sombra es más oscura, las casillas se tiñen de un rojo brasa que late y el borde es grueso, con contraste (negro abajo,
  naranja encima: `bordeHexPunteado` acepta `{solido, ancho, contraste}`, js/50; js/74). Probada sobre la imagen de fondo del mapa del dueño (copiada a
  un mapa propio): se ve clara. (2) El 🖼 Fondo, antes de cargar, dice además que después se puede cambiar el ancho en casillas y moverla con el
  mouse (js/09). De paso, la tira minimizada del daño del Meteoro lleva ☄ en lugar de 🌩.
- **✅ hecho (2026-11-18) — 🧌 Cargar al H4 Bruto que aguanta (nv2–5) y probarlo en el mapa** (dueño, 2026-11-18: «cuando termines de cargar al bruto, probalo»).
  Lo aprobado en `docs/creeps-humanoides.md` (con ¡Tu vieeeeja! 😜 en el nv3, la Coraza de pinchos, Piel de hierro en el nv5), su prueba de números en
  `comun/pruebas.html`, y en el mapa: ¡Tu vieeeeja!, Aguante (contar golpes y el ataque con dados de más), Contraataque, Golpe desesperado, Furia,
  Piel de hierro, las Espinas de la Coraza de pinchos y Mañas de sobreviviente.
  *Resultado:* cargado (niveles 2 a 5, los números del documento dan igual en `comun/pruebas.html`). En el mapa (mapa propio, el Bruto nv5 contra
  Rockardo (copia) del J1, las dos pantallas): **Piel de hierro** + **Aguante** → Defensa 18 y Def.Esp 10 (más el Desafiante después: 20 / 12);
  **¡Tu vieeeeja! 😜** → PdG.Esp 8 contra Res.Mt 2 → Rockardo Provocado y el Bruto Desafiante; Rockardo le pegó con el Mazo del juez (14 − Defensa 20 =
  0): **Aguante contó el golpe** aunque la armadura frenó todo, y **las Espinas de la Coraza de pinchos** le devolvieron 4 a Rockardo (27 → 23); el
  Pajaritos del mazo entró; **Furia** → Enfurecido (PdG 11); **Golpe desesperado** avisó «más de la mitad de la vida: +1 frecuente, +2 potente, +1
  al daño» (Rockardo esquivó). No se vio el Contraataque (el Parry del Bruto perdió por empate) ni Mañas de sobreviviente (no bajó de la mitad).

- **✅ hecho (2026-11-14) — 😜 Provocar de los creeps pasa a llamarse «¡Tu vieeeeja! 😜»** (dueño, 2026-11-14: «dejar provocar y le vamos a cambiar el nombre
  en la versión para creeps»). Solo la habilidad de creep (`comun/skills-creep-base.js`); el **Taunt** de la clase Tanque de los jugadores no cambia.
  Mismo funcionamiento (PdG.Esp + nivel contra la Res.Mt, Provocado 2 turnos, Desafiante). Renombrar en todos los creeps que la usan
  (`comun/creeps-esenciales.js` y donde se nombre: etiquetas, `APLICA`, pruebas, docs vigentes) y que un creep ya guardado en Firebase con «Provocar»
  la siga encontrando (alias del nombre viejo, si el código busca por nombre). Ojo: en la biblioteca de Firebase hay otra, «¡Tu vieeeja!» (tres e,
  la subió el dueño el 2026-10-16 para el escudero kobold: tira Fuerza contra Res.Esp) — no tocarla; avisar si los nombres chocan en algún lado.
  Probar en el mapa que un creep la usa y se ve el nombre nuevo (capturas).
  *Resultado:* renombrada en `comun/skills-creep-base.js` (y su etiqueta), en los 13 usos de `comun/creeps-esenciales.js` y en `comun/pruebas.html`; un
  creep guardado con «Provocar» se renombra solo al cargarse (`Combatiente.migrarLuzSanadora`, `RENOMBRES_LUZ`; la puesta al día de su tirada acepta los
  dos nombres). El Taunt de clase y la «¡Tu vieeeja!» de la biblioteca no se tocaron (los nombres no chocan: tres e contra cuatro y el emoji). Probado
  en el mapa (mapa propio, borrado después): un Escudero nuevo y uno guardado con «Provocar» muestran «¡Tu vieeeeja! 😜» en sus Acciones, y al
  Ejecutar se ve en el cartel de elegir objetivo y en la Mesa. 868 pruebas en verde.

- **✅ hecho (2026-11-13) — 🌩 Tormenta arcana: la ronda de a uno** (dueño, 2026-11-13, probándola: el cuadro del duelo tapaba el cartelito del dodge roll).
  La secuencia:
  1. **Elegir el área viéndola**: mientras se mueve el mouse, la flor ya se dibuja en el mapa siguiendo el puntero; el clic la fija.
     **Vale para todas las habilidades de área** (Meteoro, Orbe, zonas…).
  2. **¿Cuántos proyectiles?**: quien la lanza tira el 1d20 con su botón, en el cuadro del duelo.
  3. **Ronda de «¿Esquiva?»**, de a uno, **en el orden de la iniciativa**: pulso en el token, se despliega su menú Sí / No; «Sí» = el dodge roll de
     siempre (arrastrar hasta 2 casilleros pagando sus No2; si sale del área queda a salvo). Recién al terminar uno se pasa al siguiente.
  4. **La lluvia**: con los que quedaron adentro, una secuencia de rayos que caen al azar sobre los tokens, uno por proyectil, con un contador
     sobre cada token que suma 1 por rayo; al terminar, cada token queda con su número.
  5. **El daño**, de a uno, en el orden de la iniciativa: pulso en el token, menú «Tirá el daño: Nd4» (lo tira quien la lanzó), después
     «Aplicar el daño» (lo toca el afectado, con el GM de respaldo si no responde, como en las trampas) y se pasa al siguiente.
  - La versión de los creeps: **Nd4+1** (el +1 una sola vez, no por proyectil; hoy suma +1 por cada uno).
  - El reparto pasa a hacerse **después** del dodge roll (hoy se hace al lanzarla, antes).
  - **☄ El Meteoro, con la misma secuencia** (dueño, 2026-11-13: «dejá el dodge roll, y que la secuencia de acciones sea igual que con la tormenta
    arcana»): cuando cae, la ronda de «¿Esquiva?» de a uno por iniciativa (el dodge roll de siempre) y después el daño de a uno (pulso, «Tirá el daño»
    —4d6 físico + 2d6 de fuego, lo tira quien lo lanzó—, «Aplicar el daño», el siguiente). Sin d20 ni lluvia: es un solo golpe para todos los de adentro.
  *Resultado* (`vtt-hexgrid/js/118-secuencia-area.js`; comun/duelo.js `hab.soloTirada` y `hab.esquiva`): probado en un mapa propio («Prueba · Tormenta»,
  ya borrado) con un creep que la lanza, 3 ratas y un personaje del J1. La flor sigue al mouse; el GM tiró «🎲 Tirar proyectiles · 1d20» en el cuadro; la
  ronda salió en el orden de la iniciativa (Rata T3 → Prueba Uno → Rata T2 → Rata T4), de a uno; el J1 contestó «Sí» y arrastró su token afuera
  («logró salir»), las ratas «No» / «Sí y me quedo»; la lluvia con el contador en todas las pantallas; el daño de a uno («3d4+1» con 3 proyectiles), el
  J1 tocó «Aplicar el daño» para su personaje. El Meteoro: igual, 4d6 + 2d6 de fuego, el que salió no recibió nada. **De paso:** los carteles que piden
  algo (el dodge roll, el ataque de oportunidad del GM…) van por encima del cuadro del duelo (comun/aviso-combate.js). Video: `tormenta-ronda-y-lluvia-*.mp4`.
- **✅ hecho (2026-11-14) — 🩸 Sanguijuela: muerde de nuevo al empezar el turno, y la animación de toda transferencia de vida** (dueño, 2026-11-14).
  *Resultado:* `vtt-hexgrid/js/119-sanguijuela.js` (nuevo) + js/54, js/13, js/78, js/92, js/05, `comun/ficha-mantenimiento.js`. Probado en «Claude · pruebas»
  (mapa propio, borrado al terminar) con Rockardo (copia) (J1; respaldado y restaurado) y un creep con la Sanguijuela: la Varita sanguijuela drena con la
  animación; la Sanguijuela pega, drena y queda pegada (el gusanito latiendo sobre el token); al empezar el turno de Rockardo: «▶ Empieza tu turno» →
  el aviso «la cura no fue para vos» (su Regeneración +3 se la lleva el Ladrón, con la animación) → «tenés una sanguijuela» → el 1d6 en el cuadro del
  duelo (lo tira el GM por el creep; directo) y la cura de la mitad → «¿se suelta?»; con «Ahora no» sigue pegada; al soltarse, se suelta y cae.
  Orden real: la Regeneración robada sale antes de la mordida (es parte del «Empieza tu turno»). Capturas y videos en el scratchpad de la sesión
  (`sanguijuela-videos/`, `sanguijuela-capturas/`).
  1. **La regla:** al empezar el turno de quien la tiene pegada, la sanguijuela le hace **1d6** de daño y quien la lanzó se cura **la mitad de lo
     que entró, para arriba**. Lo tira **quien lanzó la sanguijuela** con su botón, en el cuadro del duelo (el GM por un creep). Definido por el dueño
     (2026-11-14): **daño directo** (no lo frena la Def.Esp), **sí lo frena la Res. siniestro**; **primero la mordida y después** el intento de
     arrancarla (Fuerza contra el Ef.Esp); vale también para la Sanguijuela del Debuffer de clase (la misma habilidad).
  2. **Cómo se comunica** (el dueño lo describió así): empieza el turno del afectado → aviso «tenés una sanguijuela» → quien la lanzó tira el
     1d6 → el daño → la cura que se lleva. Y si al afectado lo iba a curar algo (su **Regeneración**, una poción…), se le avisa claro que esa
     cura **no lo curó a él, se la llevó su rival** (cuánto y a quién).
  3. **La animación:** cuando se cierran los carteles, la misma animación de la **Transfusión sanguínea** (la vida viaja del afectado al que
     lanzó la sanguijuela). **Regla general nueva:** toda cura o transferencia de vida de un personaje a otro usa esa animación.
     **Incluye explícitamente** (dueño, 2026-11-14): la **Varita chupasangre** (ex Varita sanguijuela: el drenaje de su ataque) y, en general,
     todo lo que drena vida (`drena` del duelo, Drenar vida, la Sanguijuela al pegar). Probarla también.
  3b. **La sanguijuela dibujada** (dueño, 2026-11-14: «una animación de la sanguijuela, como la vaquita de San Antonio: una especie de gusano
     con una pulsación, como que está chupando sangre»). Propuesta: mientras está pegada, un gusanito sobre el token del afectado que late
     despacio (se hincha y se deshincha, un poco de rojo que pasa por el cuerpo); en cada mordida, un latido más fuerte y recién después la
     animación de la Transfusión hacia quien la lanzó. Al arrancarla o vencerse, se suelta y cae. Mismo estilo que la vaquita (js de la vaquita).
  4. **La prueba:** en «Claude · pruebas», con **Rockardo (copia)** como objetivo (tiene Regeneración como pasiva) y un Ladrón de fuerzas que le
     pone la sanguijuela; las dos cuentas (GM y jugador), capturas de las dos pantallas y videos mp4 de la animación. Respaldo de Rockardo (copia)
     antes y restaurarlo después. Reporte al dueño con capturas y videos.
- **✅ hecho (2026-11-14) — 😵 Un caído no esquiva ni recibe carteles de esquivar** (dueño, 2026-11-14: «al personaje caído no le tienen que aparecer ni
  siquiera notificaciones de esquivar ni nada»; lo vio el ayudante: uno en 0 de vida pudo arrastrar su token para terminar el dodge roll). Con 0 de
  vida (caído / inconsciente): la ronda de «¿Esquiva?» de la Tormenta y el Meteoro lo saltea sin preguntarle (sigue adentro, sin cartel), lo mismo
  la fase de dodge roll de cualquier área y los otros dodge roll (Tronco de huída, el del arco). **El token se puede seguir arrastrando** (dueño,
  2026-11-14: «no debería haber restricciones para arrastrar el token, porque puede haber alguna circunstancia que lo requiera»): solo que arrastrarlo
  no cuenta como dodge roll. Y **se le saltean los turnos mientras esté caído** (revisar que el orden de turnos ya lo haga). Revisar que tampoco le
  salgan otros carteles de defensa que no puede usar. Probar en el mapa con las dos cuentas.
  *Resultado:* `dodgeCaido` (vtt-hexgrid/js/13): con 0 de vida no se le abre el «¿Esquiva?» ni ningún cartel de dodge roll (área, Tronco de huída,
  arco); si cae mientras lo hace, el cartel se cierra solo y el duelo termina «💀 CAÍDO · el área no lo alcanza» (`Duelo.resolverDodge(id, false,
  true)`, el veredicto, el chip y la Mesa lo dicen así; no se le reabre el cuadro). La ronda de la Tormenta y el Meteoro ya lo salteaba (un caído es
  un cuerpo: ningún área lo alcanza, P225). El token se puede arrastrar igual y no cuenta como dodge roll. Los turnos ya salteaban a los caídos.
  Probado en el mapa (Meteoro, Prueba Uno del J1, GM + J1): caído desde antes → no le preguntan nada; cae en medio del dodge roll → el cartel se
  cierra; caído → Tronco y arco sin cartel, arrastra 1 casilla; ▶ Siguiente lo saltea. Capturas `caido-a/`, `caido-b/`, `caido-c/` del scratchpad.
  **Dudas para el dueño:** (1) a un caído se lo puede atacar con un ataque directo y le sale «Elegí cómo te defendés» (no se tocó: ¿se puede
  rematar a un caído?); (2) si alguien arrastra el token de un caído al lado de rivales, a esos rivales se les puede ofrecer el ataque de oportunidad.
- **✅ hecho (2026-11-14) — 🧌 Cargar los esenciales aprobados y probarlos en el mapa**. *Resultado:* cargados S3 Armero, D3 Ladrón de fuerzas, W4
  Verdugo y T4 Peleador de control, niveles 2 a 5 (commit 560dc7bb), con su prueba de números en `comun/pruebas.html` (864 en verde); la Varita
  sanguijuela pasó a **Varita chupasangre** (mismo id). Probado en el mapa (mapa propio «Prueba · Esenciales», los cuatro de nivel 5 contra Prueba Uno,
  las dos cuentas): **anduvo todo** — Armas perforantes, Ojo certero y Potencia sobre el Verdugo (y el golpe siguiente con crítico ×2); Abrojos (trampa
  a la vista, Prueba Uno la pisa: 2d6+2 − Defensa, Res.CC contra 8 → Rengo); el Martillo de herrero con Derribar 25 %; Disipar (le sacó Bendecido);
  Maldición tormentosa (Atormentado + Herida sombría) y el **Muñeco vudú** (Debilitado al primer daño especial); la Varita chupasangre (drena);
  **Mal de ojo** en turno ajeno (10 SP, el jugador repite la Evasión y queda la peor); Remate (+2 dados con la mitad de la vida) con **Ojo de carancho**
  (+1 contra alguien con Rengo); Furia; Golpe demoledor; Golpe brutal (crítico ×2); Puño de roca (Demora); Arrastrar (lo trae y queda Desequilibrado);
  Barrido; **Marcar el ritmo** (el Armero pegado sube 3.º → 2.º al empezar la ronda); **Desarmar** tras un Parry ganado (su Bloqueo contra la Fuerza del
  golpe: «desarmó al otro», la daga quedó en el piso; en turno ajeno, cooldown 6). **Dudas:** (1) la Demora del Puño de roca y la de la Maza de guerra
  en el mismo golpe **se suman** (dos efectos «Demora» separados en el duelo: baja 2 lugares si entran los dos); (2) al aplicar Derribar o la Armadura
  rota doble del Golpe demoledor sobre un personaje **sin armadura** aparecen errores 400 en la consola (el Derribar entra igual; la Armadura rota no
  tiene pieza que romper) — a mirar; (3) el texto de Abrojos dice «la Destreza del pícaro» aunque la ponga el Armero.
  Videos y capturas: `scratchpad/esenciales/` (de la sesión). (dueño, 2026-11-14: «¿los estás poniendo en cola para probarlos en el
  mapa después?»).
  1. **Cargar** en `comun/creeps-esenciales.js` (con su prueba de números en `comun/pruebas.html`) lo aprobado y todavía sin cargar: **S3 Armero
     nv2–5**, **D3 Ladrón de fuerzas nv2–5** y lo que se siga aprobando (W4 Verdugo…); renombrar la **Varita sanguijuela → Varita chupasangre**
     (mismo id) en el catálogo y donde se nombre. Ver `docs/creeps-humanoides.md`.
  2. **Probar en el mapa** (mapa propio en «Claude · pruebas», las dos cuentas, capturas; video si hay animación) cada creep nuevo usando lo que
     suma, sobre todo lo que nunca se usó con un creep esencial: Armero (Armas perforantes, Ojo certero, Potencia, **Abrojos**, el Martillo de herrero
     con Derribar); Ladrón (Sanguijuela, **Mal de ojo** en turno ajeno, **Disipar**, **Maldición tormentosa**, el **Muñeco vudú** con su Debilitado, la
     Varita chupasangre); Verdugo (Remate, **Sed de sangre** subiendo en la fila). Reporte con lo que anduvo y lo que no.
- **✅ hecho (2026-11-14) — ▶ Optimizar los avisos del inicio del turno.** Resultado: la ventana «Empieza tu turno» se cierra al tocar «Aplicar» (sin
  el segundo paso; solo si el turno cambió en el medio avisa «ya no es tu turno»); a quien maneja ese personaje no le sale la tarjeta «Empieza el turno
  de…»; la cura robada es un solo renglón en «Vida y SP» («🪱 Tu Regeneración (+3) no te curó a vos: se la llevó X con su Sanguijuela», sin el «+3 HP»
  que no entró) y sin aviso al centro ni tarjeta en esa pantalla; la mordida abre directo el cuadro del duelo («🪱 La sanguijuela muerde a X»); el
  «¿se suelta?» sale recién al cerrarse el cuadro; los estados que no cambian no se muestran. **Por qué la cura robada salía dos veces:** la vista
  previa del inicio del turno (que solo mira) también la mandaba → a quien lanzó la sanguijuela le llegaba DOS veces (+6 en vez de +3) y salían dos
  avisos y dos líneas en la Mesa; ahora la vista previa no manda nada (`ui.simular`, comun/ficha-mantenimiento.js). «4 turnos → 4 turnos»: no era un
  error (lo recién puesto no baja en su primer inicio de turno, P177). Probado con Rockardo (copia) y un creep con Sanguijuela, las dos cuentas.
- **✅ hecho (2026-11-14) — 🔧 Dos arreglos chicos.** (1) Regla del dueño: «romper armadura a alguien sin armadura no debería ser posible» → un
  personaje sin piezas de armadura puestas ya no recibía nada (quedó con el texto «Rompe armadura: no tiene armadura que romper»); un creep con su equipo
  en vivo y sin ninguna pieza de armadura, tampoco (`EstadosAplicar.creepTieneArmadura`, sin escribir nada; un creep viejo sin equipo, como siempre).
  Los errores 400 eran reintentos de transacciones de Firebase («Commit failed-precondition»: dos pantallas escribiendo el mismo documento a la vez);
  Firebase reintenta solo y la escritura entra (verificado: el Derribar y la Sanguijuela llegaron igual). No se repitieron con Derribar sobre un
  personaje. (2) Abrojos, Cordón oculto y Polvo cegador ya no dicen «del pícaro» sino «de quien los puso / lo tendió / las escondió».
- **✅ hecho (2026-11-14) — 💀 A alguien en 0 de vida no se lo ataca** (dueño, 2026-11-14: «corregirlo como sugerís»). Un token en 0 de vida (caído) no se
  puede elegir como objetivo de un ataque ni de una habilidad dirigida contra un rival: si se intenta, aviso «está caído» y no se abre el duelo (sin
  «Elegí cómo te defendés»). Tampoco da ni recibe ataques de oportunidad (ni cuando alguien lo arrastra al lado de rivales). Curas y lo que lo levanta
  (revivir, Ankh, Pacto…) siguen funcionando. Probar en el mapa con las dos cuentas.
  *Resultado:* `tokenFueraDeCombate(id)` (js/98: iniciativa o vida en 0, también invocaciones). Al elegir objetivo (js/13) un caído no brilla y, si se lo
  toca, «💀 X está caído: no se lo puede atacar. Elegí otro.» (también con el objetivo ya elegido); lo que es para un aliado o una cura sigue igual. El
  ataque de oportunidad (js/17) no lo da ni lo recibe un caído (ni el aviso de oportunidad negada). El Barrido y las áreas ya lo salteaban. Probado en el
  mapa con las dos cuentas: el GM no pudo elegir a Prueba Uno en 0; Prueba Uno en 0 se alejó del Verdugo pegado sin oportunidad; Prueba Uno vivo se
  alejó del Verdugo en 0 sin oportunidad (capturas `scratchpad/chance-caido/01…09`).
- **✅ hecho (2026-11-14) — 🎲 Carteles de chance: de dónde sale el número** (dueño, 2026-11-13, con la captura de Reflejos: «¿el valor
  de "5 o más" de dónde sale?»). En los carteles de chance de una pieza de equipo (Reflejos de mangosta, Retirada limpia, Recuperarse rápido…) mostrar
  qué pieza la da, su porcentaje y qué número hace falta: «Reflejos de mangosta (Botas de zapador, 33 %) · 1d6 = 5 (sale con 5 o 6)». Solo texto.
  *Resultado:* `Combatiente.chanceSale` («sale con 5 o 6») y `chanceEtiqueta` («Reflejos de mangosta (Botas de zapador, 33 %)»); la ficha publica de qué
  pieza sale cada chance (`resumen.chanceDe`: Retirada limpia, Inamovible, Recuperarse rápido, Reflejos) y el GM la saca del equipo y las pasivas del
  creep (`chanceFuente`, js/21). Cambiados: el cartel común de chances (Retirada, Inamovible, Recuperarse), Reflejos (js/23), Inamovible en las trampas
  (js/19) y en el cuadro del duelo, y las líneas de la Mesa. Probado en el mapa: Retirada limpia (Bombacha de gaucho matrero, 50 %) · «1d6 = 2 (sale con
  4, 5 o 6) → no salió»; Reflejos de mangosta (Botas de zapador, 33 %) · «1d6 = 4 (sale con 5 o 6)». Una ficha que no se volvió a guardar todavía no
  publica la pieza: sale «(33 %)» sin nombre hasta que se guarde. Capturas `scratchpad/chance-caido/41…58`.
- **✅ hecho — ⚡ Varita de chispa eléctrica: 20 % de Parálisis a todos los que toca** (dueño, 2026-11-12: «ponele 20 % a
  todos los que toca, el primero y los saltos»). Antes: 25 % al primero; los saltos, solo daño. Ahora 20 % (9–10 en d10) al primero, en los efectos
  del duelo, y a cada salto, cada uno en su cuadro del duelo de a uno (`cadena.efectos`, como la Varita del relámpago), lo tira quien la usa; en el agua,
  el doble. Probado en el mapa (mapa propio, 3 ratas): J1 tiró la chance de cada salto («Tirar el efecto (1d10)») y aplicó la que entró.
- **✅ hecho — 🎲 El d2 (moneda) mostraba otra cara que la del log** (dueño, 2026-11-12). Dos causas, medidas con la librería real (dice-box-threejs
  0.0.12, cargada local): (1) la moneda de la librería lee mal su cara de arriba (la geometría del cilindro no sigue la cuenta de caras de los
  demás dados) y además los dados que llegan después la dan vuelta; (2) dos tiradas seguidas en la misma caja: la segunda vuelve a simular la
  física y la primera cae en otra cara (7 de 10 mal con 300 ms de diferencia). Arreglo: **no se usa más el d2** (el dueño: «las tiradas de par o
  impar podemos hacerla con un dado de 6 u 8»): el 50 % se tira con d6 (4 a 6), la Moneda Re-Roll es par/impar en d6, los 86 ítems del
  catálogo y los creeps viejos pasaron a «(4–6 en d6)», y un efecto guardado con 2 caras se tira con d6 (`EfectosGolpe.normalizar`); y las
  tiradas de una misma caja de dados 3D van de a una (`dadosTirar`, `c.cadena`).
- **✅ hecho (2026-11-12) 🪤 Trampas con el GM desconectado** (dueño, 2026-11-12, probando Reflejos en «Prueba · Carteles»): Rockardo (copia) pisó
  la Trampa de oso con la pantalla del GM cerrada y quedó trabado en «⏳ el GM tira el daño de la trampa…». Hecho (`vtt-hexgrid/js/16`, `js/19`, `js/06`):
  1. **El paso pendiente vuelve a aparecer** cuando entra después la pantalla a la que le toca (como el sigilo): las trampas sin terminar de la última
     media hora se vuelven a mostrar; cada 3 s se revisan por si recién cargaron los tokens.
  2. **Quien espera tiene «✋ Resolver a mano»** en el cartel de espera a los 5 s (o «✋ Lo aplica la mesa» / «▶ Seguir desde acá», según el paso).
  3. **⏳ Pendientes N** abajo a la derecha del mapa: la lista de las trampas que esperan una tirada (las tuyas; el GM, todas) con «Abrir».
  4. **Se queda en la casilla de la trampa**: en el mapa de prueba (con la oportunidad de la rata, «Seguir sin esperar» y Reflejos) el token siempre
     frenó en la trampa. El de Rockardo muestra que lo movieron DESPUÉS, desde la trampa a la casilla de al lado (su último camino es trampa → siguiente),
     algo que se podía porque la trampa seguía trabada sin dejarle el Inmovilizado. Ahora, mover a quien tiene una trampa sin terminar pregunta
     «🪤 Trampa sin terminar… ¿Moverlo igual?» (Se queda / Moverlo igual).
  5. (Pedido extra) **«Aplicar el daño» muestra la cuenta**: «🧮 9 de daño − Defensa 4 = 5 a la vida» (con la Defensa real, la especial, la resistencia,
     los escudos y la Vida extra) y el botón dice lo que entra a la vida: «💔 Aplicar el daño (5)». Probado con Defensa 0 y Defensa 4.
  Capturas `trampa-gm-*`.
- **✅ hecho (2026-11-12) 🦶 Inamovible al cuadro del duelo** (dueño, 2026-11-11, revisando el bloque 4 en «Prueba · Carteles»): cuando empujan o tiran de alguien con
  una pieza Inamovible, la chance se tira en el cuadro del duelo de siempre (una tirada sin oponente, como las chances de la tanda 3), con el botón
  para **quien maneja al empujado** (su jugador; el GM para un creep; el GM tira por el ausente) y el «Aplicar» de siempre. Hoy es un cartel propio
  que tira la pantalla del GM que aplica el empujón (`vtt-hexgrid/js/21`/`23`).
  **Hecho:** `inamovibleSale` (js/21) abre el cuadro del duelo con una sola tirada para quien maneja al empujado y el «Aplicar No se mueve» (efecto
  `firme`, comun/duelo.js: no pone estado). El empujón sigue igual. Probado en el mapa: J1 tiró por Prueba Uno con Botas de ancla (50 %): con un 6 no
  se movió; con un 1 lo empujó 2 casillas. Con 100 %, oculto o si el cuadro no abre, queda el cartel de antes.
- **✅ hecho (2026-11-12) 🎮 El GM controla a un personaje** (dueño, 2026-11-11: «el aviso de que el GM está controlando a Rockardo debería estar visible
  siempre, sí, pero además un jugador no debería poder usar su propio token mientras lo controla el GM… sólo observar»). Mientras el GM tiene el 🎮
  control de un personaje: (1) en la pantalla del jugador dueño, un aviso fijo y siempre visible «🎮 El GM está manejando a <nombre>: las tiradas le
  salen a él»; (2) el jugador no puede usar ese token ni su Botonera (moverlo, atacar, habilidades, ítems, duelos de ese personaje): solo mirar.
  Al soltar el control, todo vuelve. (Surgió probando las trampas: el cartel de Rockardo le salía al GM.)
- **✅ hecho — Contraataque antes del Bloqueo** (dueño, 2026-11-11): con la habilidad Contraataque, al ganar el Parry se pregunta «¿contraatacás?»
  antes del Bloqueo; Sí → sin Bloqueo y sin daño, y se abre el contraataque; No → el Bloqueo de siempre. Devolver gentileza, sin cambios.
- ✅ hecho · **La Percepción siempre incierta** (dueño, 2026-11-11: «siempre que se tira Percepción, que no se sepa bien para qué… "Fulano
  siente un movimiento extraño" o "algo le parece inusual"… no importa si es el máster o un jugador… quizás el jugador está haciendo una acción
  incierta, como colocar una trampa»). Todo pedido de Percepción nombra solo a quien percibe (`Combatiente.percepcionIncierta`, 4 frases); el
  detalle, plegado y solo para el GM («ℹ detalle»). También percibe un personaje (cartel a su jugador, el GM tira por él si no está) y poner
  una trampa en la zona de alerta de un rival le pide Percepción a ese rival. Probado en el mapa.
- **✅ hecho — tres correcciones del dueño (2026-11-11):**
  - **A · Modo narrativo:** un token con un estado que traba el movimiento **se mueve igual**, preguntando al soltar «¿Moverlo igual?».
  - **B · Sigilo:** vuelve a ser **una tirada por paso** en la zona de alerta (cada paso, su cartel; si lo descubren, se cortan los que quedan).
  - **C · El visible sin Percepción aumentada** que **termina** el movimiento con un escondido en su zona de alerta: la tirada de verdad (Percepción
    de quien se movió → Sigilo del escondido), en lugar del aviso anónimo de la Mesa. De pasada, nada. No probado en el mapa (el dueño estaba
    probando con el mapa activo y el modo es global): pruebas automáticas.
5. **✅ hecho — Choque por empujón con botón** (dueño, 2026-11-11: «claro, es así»). Contra algo sólido, el empujado tira **su** Constitución
   (una por cada casillero que le faltó recorrer) y se la come él; contra otro token, cada uno tira **su propia** Constitución ×N, que es el daño
   que le hace **al otro**. Cada uno resta su Defensa. En el cuadro del duelo de siempre (`danoDuelo`, js/78), con el GM por quien no está y la
   salida a mano.
6. **✅ hecho (2026-11-11) Modo narrativo: los estados que traban el movimiento frenan igual** (dueño, 2026-11-11: «así»). Fuera del
   combate moverse no cobra No2, pero con Inmovilizado (también la Prisión de hielo), Sentado, Stun / Sueño o Congelado el token no se arrastra:
   el aviso «No te podés mover ahora (…: aunque el mapa esté en modo narrativo, no se mueve; si hace falta, el GM lo mueve con 🦶 Mover libre,
   tecla M)». Rengo no cambia nada. `Combatiente.trabaNarrativo` + `vtt-hexgrid/js/06-mouse.js`. (Salió de la prueba del dueño con la Red de
   caza: en modo narrativo Larry se movía igual.)
7. ✅ **hecho (2026-11-11)** · **Saque rápido.** La chance se tira sola; si sale, un **Aviso** al jugador («Saque rápido: sacaste <consumible> sin gastar No2»); si no sale,
   solo la Crónica y la Mesa.
8. ✅ **hecho (2026-11-11)** · **Sigilo.** Con los disparadores que ya existen (verificarlos, no cambiarlos): si el escondido se mueve y entra en la zona de alerta de alguien →
   Percepción; si se mueve el visible, solo con Percepción aumentada se frena a tirar cuando un escondido queda en su zona de alerta; si no, el
   sigilo se corta solo si el escondido queda en su cono de visión directa en ese movimiento. **Si el escondido es un creep:** como hoy, el GM tira a
   escondidas. **Si es un personaje y lo puede percibir un creep:** al GM le aparece «<creep> percibe movimientos cerca — tirá Percepción» y tira la
   Percepción del creep; después **el jugador tira su Sigilo con su botón**, a la vista solo de él y del GM.
4. **✅ hecho (2026-11-11) Recargos del sobrepeso** (dueño, 2026-11-11): con Sobrepeso, te pases lo que te pases (+1 fijo, «por ahora»): el Parry cuesta 2
   No2 (1 + 1), «Poner escudo» contra un disparo también 2, el dodge roll lo de moverse + 1, y el primer Parry con Parada fácil cuesta 1 (solo el
   recargo). La Evasión sigue igual (−1 por punto de más, o 1 No2 para evitarlo).
   Además (dueño, con captura: «si la penalidad de −5 es por sobrepeso, debe ser claro»): cada botón de defensa dice de dónde sale cada
   penalidad (la cuenta del sobrepeso —lo que pesa el equipo y la Carga máxima— y «Modificado por: …» con los estados). El dodge roll con
   sobrepeso no se probó en el mapa.
3. **✅ hecho (2026-11-11) Parar un disparo con el escudo gasta 1** (dueño, 2026-11-11: «parar un proyectil con un escudo, tirando Destreza, sería un
   "parry"; si es exitoso, implica que la flecha queda clavada en el escudo y se pierde 1 punto de durabilidad»). Contra un disparo, «Poner
   escudo» ganado → el escudo pierde 1 (con el aviso «pasó de N a N−1»); el botón lo avisa antes de elegir. **Corrección del dueño (mismo día):**
   «al recibir un disparo, las opciones son esquivar o parar con el escudo; no es lo mismo que el bloqueo del parry: si fallás el parar con el
   escudo, la flecha pasa de largo y no le baja la durabilidad» → «Poner escudo» perdido = el disparo pega normal, sin Bloqueo y sin desgaste.
   El Parry cuerpo a cuerpo ganado sigue sin gastar.
1. **✅ hecho (2026-11-11) Durabilidad — el aviso del Bloqueo perdido** (dueño, 2026-11-11: «el aviso está ok»): al perder el Bloqueo, al personaje le llega
   «Perdiste el Bloqueo: la durabilidad de tu <ítem> pasó de N a N−1» (y la advertencia si queda 1 / se rompe); el cuadro del duelo muestra «de N a
   N−1». **Regla confirmada:** un Parry o un Bloqueo **ganados** no gastan; solo se gasta 1 al **perder el Bloqueo**. La Defensa no baja (eso es
   solo Romper armadura).
   *Resultado:* al jugador le llega el cartel «🔧 Perdiste el Bloqueo: … pasó de N a N−1» (+ toast y recordatorio en la Mesa); el cuadro del
   duelo dice «pierde 1 punto de durabilidad: de N a N−1 (de máx) · la Defensa no baja». Probado en «Prueba · Escudo de rayo»: perdido 6 → 5;
   ganado, sin desgaste.
2. **✅ hecho (2026-11-11) — Durabilidad: 6 por punto de Peso para todo** (armas, escudos y armaduras), mínimo 6 (dueño, 2026-11-11: «la durabilidad está ok»).
   «Resistente ×N» / «Frágil ×N» siguen sumando/restando encima; las piezas ya gastadas conservan lo gastado y ganan el margen nuevo. Revisar
   el precio de reparar.

## En cola

28. [x] (✅ ya estaba hecha: la prueba pasó el 2026-11-11, con las reglas del campo `pf` pegadas — ver `docs/pendientes.md`; esta línea había quedado sin tachar. Revisado el 2026-11-18: el código guarda `pf` en el token y no hay nada pendiente) **Paso Fantasma guardado en la partida: mismo estado en todas las pantallas, se gasta una sola vez, sobrevive a recargar la página** (2026-11-09; antes, pegar las reglas nuevas de Firestore del campo `pf`).

Cada línea nueva que se termine de diseñar se suma al final.

## Hechas

- [x] **40 · Línea D2 · Tóxico, niveles 1 a 5** (2026-11-10): números iguales a la prueba de niveles; cada habilidad usada en el mapa (Espina tóxica,
  Nube tóxica con una sola tirada de Ef.Esp para todos y el +1 stack al volver a entrar, Corroer, Maldición de la sequía, Maldición tormentosa, Polen
  somnífero con Evasión 1 al dormido y despertar con daño), la Varita de la ponzoña (no se esquiva), la Varita de miasma y el Polvo de adormidera.
  **Arreglado:** el cartel del Veneno de una zona sin stacks propios (la Varita de miasma) decía «+1» y se aplicaban 4. Para ver con el dueño: un
  personaje que ya tiene Veneno de otro lado y queda adentro de la Nube cuando aparece tira y suma 3 (no 1); la Varita de la ponzoña suma 4 stacks.
  Sin probar: las pasivas por separado (sí sus números). Detalle en `pruebas-en-el-mapa.md`.
- [x] **38 · Estandarte de la vanguardia** (2026-11-10): los aliados a 2 casillas o menos reciben «🚩 Estandarte de la vanguardia» (+1 Defensa y +1 PdG)
  y se les va al alejarse. **Arreglados:** el estandarte de dos bonos cortaba con un error en el mapa (no aparecía el estado); un aliado que salía y volvía
  a entrar enseguida no lo recuperaba por 2 minutos; el estandarte clavado (el token del Estandarte de guerra) también lo recibía (este último arreglo, sin volver a probarlo en el mapa). Detalle en `pruebas-en-el-mapa.md`.
- [x] **39 · Línea S2 · Abanderado, niveles 1 a 5** (2026-11-10): números iguales al diseño; cada habilidad usada en el mapa (Potencia, ¡A la carga!,
  Bendecir el arma, Redoble de tambores, Arenga, Estandarte de guerra), el ataque con la Lanza corta a 2 casillas y el Pergamino grupal. Marcar el ritmo,
  probado con la cuenta del orden (sin pasar una ronda entera). Sin probar: la Lanza del abanderado atacando (sí sus números). Detalle en `pruebas-en-el-mapa.md`.
- [x] **36 · Orbe de resguardo mayor en el Mago de escarcha nv3** (2026-11-10): al ganar el PdG.Esp (Dardo helado a Larry), «Escudo especial 🛡3/3»
  hasta su próximo turno; recibió 5 de daño: 1 de Defensa, 3 el escudo y 1 a la vida, y el escudo desapareció. **Arreglado:** la marca de «una vez por
  turno» se perdía al recargar la página del GM (daba un segundo escudo); ahora queda guardada en el creep. Detalle en `pruebas-en-el-mapa.md`.
- [x] **37 · Línea M2 · Mago de escarcha, niveles 1 a 5** (2026-11-10): números iguales al diseño; cada habilidad usada en el mapa. **Arreglados:**
  el +2 del Anillo de escarcha no lo veía la pantalla del jugador golpeado (aplicaba 2 menos); la Lluvia de escarcha no les pegaba a los aliados; con el
  GM con el control de un personaje, el suelo congelado le pedía la Agilidad dos veces; el aviso «El hielo se derrite» se cortaba con un error.
  Sin probar: la Poción de SP menor y el Chaleco de kevlar contra un disparo (sí, sus números). Detalle en `pruebas-en-el-mapa.md`.

- [x] **35 · Línea R2 · Hostigador a distancia, niveles 1 a 5** (2026-11-10): números iguales a la prueba de niveles; cada habilidad, pasiva y
  pieza del equipo usada en el mapa, sin errores salvo uno. **Arreglado:** un disparo hecho con una habilidad (Tiro certero, Tiro a la rodilla…)
  perdía lo propio del arco (Emboscada, Espalda a distancia, la distancia mínima, el tiro alto); ahora lo lleva (`comun/combatiente.js`).
  No se vio la Racha (no salió ningún crítico con el Arco de tiro ligero). Detalle en `pruebas-en-el-mapa.md`.
- [x] **33 · Atacar saca del Sigilo** (2026-11-10): Bizzante (jugador) y una Rata (GM) atacaron desde el sigilo por la espalda: el duelo dijo
  «desde el sigilo, la defensa vale 1» (Evasión 2 → contó 1; 8 → 1), apenas se declaró salieron del sigilo, sin Marcado, y la Mesa dijo
  «🕶 … atacó y salió del sigilo». Bien. No probado: el robo y el giro. Detalle en `pruebas-en-el-mapa.md`.
- [x] **34 · Percepción aumentada: sin punto ciego en la espalda** (2026-11-10): con un creep. Sin la pasiva, Rockardo en sigilo llegó a su
  espalda sin aviso; con ella, «⚠ Hace falta una tirada de percepción» y la casilla de atrás pintada de alerta (también en la pantalla del jugador).
  Paso ligero sigue igual (no le ofrece darse vuelta, +2 por la espalda). No probado: un personaje o una invocación con la pasiva. Detalle en `pruebas-en-el-mapa.md`.

- [x] **32 · Línea L4 · Hostigador con trampas, niveles 1 a 5** (2026-11-10): números iguales a la prueba de niveles; cada habilidad, la Red de caza
  y las Botas del desertor usadas una vez en el mapa, sin errores. **Arreglado:** con un personaje Invulnerable, el cartel de la trampa ahora dice
  «no le hace nada (Invulnerable)», como con un creep (`vtt-hexgrid/js/19-trampa-paso-a-paso.js`). Detalle en `pruebas-en-el-mapa.md`.
- [x] **30 · Red de caza y Red tendida: se disparan en cualquiera de las 7 casillas** (2026-11-10): las dos, pisando un borde (no el centro);
  la red cayó sobre los tres personajes del área, cada uno con su Fuerza (contra 8 la Red tendida, contra 7 la de caza). Bien. Detalle en `pruebas-en-el-mapa.md`.
- [x] **31 · Trampas de área: se disparan en cualquier casilla** (2026-11-10): Polvo cegador, Mina del cazador, Gas somnífero (7 casillas, deja la
  nube 3 turnos) y Petardo trampa, pisando un borde: alcanzaron a los tres del área, cada uno con su tirada. **Arreglado:** la nube del Gas
  somnífero renovaba el Exhausto con Res.Mt; ahora con Res.CC, como la trampa (`comun/catalogo.js`).

- [x] **Línea L3 · Asesino de las sombras, niveles 1 a 5** (2026-11-09): números iguales a la prueba de niveles (vida 30/35/35/40/45, PdG 11/13/15/16/17);
  Ojo de asesino (crítico ×3), Bomba de humo (Sigilo con rivales mirando, 3 casillas gratis arrastrando, sin No2), Puñalada por la espalda desde el
  sigilo (Evasión del rival vale 1, +2 PdG y +2 de daño del Puñal: PdG 7 contra 1, 1d4+1d4+8+2 = 15 ×3 = 45), Degollar (arranca en cooldown 4;
  Expuesto), Dash a través de Larry, Paso ligero (+2 por la espalda), Finta sin Parry, Retirada limpia de la Bombacha (cartel 1d2) y el pergamino.
  Sin errores de juego. Detalle en `pruebas-en-el-mapa.md`.
- [x] **Trampas a la vista de un rival al arrastrarlas y botón de visión en sigilo** (2026-11-09): GM (trampa de un creep) y J1 (trampa de su
  personaje): mientras se arrastra se ven los conos de los rivales; al soltar en un cono, Avanzar (queda descubierta, la ven todos, línea en la
  Mesa) o Rechazar (vuelve a su casilla). El botón «👁 Ver campo de visión de los rivales (Ctrl + L)» aparece latiendo con un token propio en
  sigilo (GM: un creep; J1: Rockardo), prende/apaga con clic y con Ctrl + L, y se va al salir del sigilo. **Arreglado:** el botón quedaba encima
  de «Pasar de día» del panel derecho; ahora va debajo de los lentes, dentro del mapa.

- [x] **Finta: +2 PdG y +1 al daño, sin Parry** (2026-11-09): el Goblin con la Finta contra Rockardo (copia): la declaración dice «+2 PdG · +1 de
  daño fijo · no se puede parrear»; los dos Parry de Rockardo (escudo y mazo) apagados («Finta no se deja parrear (sí esquivar)»); el daño
  «1d10 + 11 + 1»; el rango del crítico, 11 (Tipo 10 + 1 de resistencia), sin bonos de la Finta. Sin errores.
- [x] **Paso Fantasma: pasos seguidos aunque sean en varios movimientos** (2026-11-09): 1 casilla y después 2 → +3 listo (Capataz, en las tres
  pantallas); 1, una tirada suya (Fuerza del golpe) y 2 → nada (la tirada corta). **Había un error y está arreglado:** la tirada de Evasión de las
  Acciones y la Botonera se llama «Esquivar (Eva)» y cortaba la cadena (solo se excluía «Evasión»); ahora no corta: 1, «Esquivar» y 2 → +3 listo.
- [x] **Escudos gastados desaparecen al llegar a 0** (2026-11-09): Blindaje (Barrera 12), el Escudo especial de 5 del Escudo humano y la Poción de
  Cuero Duro (15): al vaciarse cada uno, se va de la lista en la pantalla del GM y en la del jugador, y el aviso dice «el escudo absorbió … · se
  gastó …». Sin errores.
- [x] **Paso Fantasma con Carga y Takle (y no con Salto ni Dash)** (2026-11-09): en «Encuentro 2», el Goblin con el anillo: la **Carga**
  corrió 3 → +3 listo en las tres pantallas (GM, J1, J2); el **Takle** corre 2 (su receta): no llega a 3 y no lo carga (las 2 casillas sí se cuentan
  como movidas); con la carrera llevada a 3 en la copia de prueba, sí lo carga. **Salto** de 3 y **Dash** de 3: no lo cargan. Caminar 6 da **+3**,
  no +6 (la Evasión del Goblin salió «1d6+3»). Sin errores en esto.
- [x] **Paso Fantasma: una vez por ronda, 3 pasos seguidos, se vence al empezar su turno** (2026-11-09): con orden de turnos (Larry, Goblin,
  Capataz, Rockardo). **2 + 1 casillas no lo dan**; 3 seguidas sí (Larry, jugador 1, y el Goblin); **una vez por ronda**: después de gastarlo, otro
  movimiento de 3 en la misma ronda no lo vuelve a dar; **se vence**: sin usarlo, al empezar el turno del Goblin en la ronda siguiente quedó en nada.
  **Había un error y está arreglado:** contra una **habilidad que se esquiva con Evasión** (una varita, un hechizo dirigido) el +3 no se sumaba: la
  Evasión de Larry contra la Varita del relámpago salía «1d4+1». Ahora sale «1d4+1+3», la tirada dice «Evasión (+3 Paso fantasma)» y se gasta;
  igual para creeps e invocaciones (`Combatiente.fantasmaEvaHab`, en `habTirar`, `habValor` y la vista «contra» de ficha-duelo, creep-duelo e
  inv-duelo; prueba automática nueva).
- [x] **Inamovible (Botas de estibador)** (2026-11-09): el Capataz con las botas (33 %) recibió una Cornada (Empujón 1). **Había un error:** la chance
  se tiraba en silencio (si salía, una línea en la Crónica; si no, nada). **Arreglado** (commit `0794daa2`): ahora sale el cartel «🦶 Inamovible» con
  el botón «🎲 Tirar 1d6», la tirada en la Mesa y la Crónica, también en Arrastrar, el gancho que atrae y Cambiar de lugar. Probado las dos veces:
  6 en el d6 → «¡NO SE MUEVE!» (se quedó en su casilla); 1 → «LO MUEVEN» (14,21 → 14,20).
- [x] **Salto aplastante sin atacar** (2026-11-09): el Goblin con el Salto aplastante: **arranca disponible** (cooldown 4, cdActual 0, sin
  «arranca en cooldown»); cayó al lado de Rockardo, que tiró Res.CC (1) contra la Fuerza (8) y quedó **Sentado**; «No, solo saltar» → No2
  7 → 2 → **6: pagó 1** (le devolvieron 4) y el cooldown quedó cobrado. Sin errores.
- [x] **Finta sin crítico** (2026-11-09): el Goblin con la Finta contra Rockardo (copia): la declaración dice «+2 de daño fijo · no se puede
  parrear», los dos Parry (escudo y mazo) salen apagados con «Finta no se deja parrear (sí esquivar)», solo Evasión; con PdG 14 contra 3 el
  rango del crítico fue 11 (Tipo 10 + 1 de resistencia), **sin Crítico frecuente ni potente de la Finta**. Sin errores.
- [x] **De paso** (2026-11-09, commit `d82afbdc`): en la Ejecución de un ataque con el arma con «🌀 Giro», el resumen y la declaración ahora lo
  nombran («ataque con tu arma · 🌀 giro: a cada rival que tenés al lado, uno por uno»).

- [x] **Milagro con 3d8** (2026-11-09): Larry (copia), del J1, con el Milagro del Support, sobre él, Bizzante y Rockardo (heridos, con
  Debilitado / Sangrado / Debilitado): **una sola tirada «Cura 3d8: [6, 1, 7] = 14» para los tres** (15 → 29, 12 → 26, 20 → 34) y a cada uno le sacó
  su estado malo; el Goblin (rival) adentro del área, nada; el texto dice «cura 3d8… una sola tirada para todos». Costó 2 No2 y 10 SP. Sin errores.
- [x] **Barrido armado por un jugador para su invocación** (2026-11-09): el J2, en la ficha de Bizzante (copia), ✎ Editar la Abeja Gorda →
  Habilidades → «+ Habilidad» → ✨ Automático → «Giro de aguijón», No2 como un ataque, cooldown 3 → Ejecución: «Ataque con mi arma» → la
  tarjeta de la PdG → tildó **«🌀 Giro (como el Barrido)»** → Crear y Guardar (queda `barrido: true`). En el mapa, la Botonera de la abeja la
  muestra («2 No2 (como un ataque) · CD 3»); al Ejecutar se cobró una vez (4 → 2 No2), brillaron los tres creeps de al lado y no Rockardo (aliado);
  elegido el Capataz, el orden fue **Capataz → Rata → Goblin** (agujas del reloj), con el cuadro desplegado desde cada uno: el Capataz esquivó, la
  Rata atajó con Parry pero perdió el Bloqueo (pasa la mitad: 30 → 27) y al Goblin le pegó con crítico ×2 (85 → 71). Sin errores.

- [x] **Línea H2 · Saltador, niveles 1 a 5** (2026-11-09): agregados desde el Pool esencial; los números en el mapa coinciden con la prueba de
  niveles (vida 45/50/55/75/80, No2 6/7/7/8/8, PdG 7/8/9/9/10, Daño 9/9/10/11/12, Def 4/7/7/9/9). Salto (elige casilla; atacando, +1 PdG y Crítico
  frecuente +1; **sin atacar, para salir: 6 → 2 → 5 No2, cobró 1** y el cooldown quedó), Pisotón (Flash; Larry eligió Evasión y perdió: 5 directo
  y Pajaritos; Bizzante resistió con Res.CC tras un empate), Aguante (un golpe contado → Pegar fuerte «con el aguante» +2 dados), Dash (atravesó a
  Rockardo, que esquivó, y terminó detrás), Barrido (tres rivales en orden, una tirada por rival, efectos del hacha en cada uno), Coraza de primera
  línea («22 − Defensa 9 − 3 contra el primer golpe = 10») y la Poción de Cuero Duro. Sin errores. Detalle en `pruebas-en-el-mapa.md`.
- [x] **Grebas del carnero: la Embestida** (2026-11-09, con la línea H2): caminando 2 pasos en línea recta hasta Larry, el ataque declaró
  «🐂 embestida: +2 PdG» y la tirada salió «1d10 +2 embestida». **Caminando 2 en línea y después Dash** hasta quedar pegado: 0, sin embestida en
  la declaración; **caminando 2 en línea y después Salto**: 0. Ya funcionaba con la regla del dueño (el Salto y el Dash no dejan ruta); no hubo que tocar código.
- [x] **Línea T2 · Muralla con púas, niveles 1 a 5** (2026-11-09): agregados desde el Pool esencial; los números en el mapa coinciden con la
  prueba de niveles (vida 60/65/70/90/95, Def 5/8/8/8/8, PdG 6/6/8/9/10, PdG.Esp 3/3/4/4/4). Coraza de púas (sobre sí y sobre un aliado; Rockardo le
  pegó 25 y **le volvieron 7**), Escudo humano (crítico de 48 a la Muralla 4: 24 a ella y 24 a la Muralla 5 —5 del escudo—, y **las Espinas de la 5
  no devolvieron nada**), Velo espejado (Lengua de fuego de 8 → **el Espejo devolvió 2**; con la Bola de fuego, en área, **nada**), Provocar (nv3:
  4 + 3; resistido una vez, la otra Bizzante quedó Provocado y la Muralla Desafiante), Blindaje (Barrera 12: un crítico de 44 entró 32), Aguante
  (+2/+2; un golpe contado → el ataque siguiente con +1d8), el Mantelete (Defensa +4 solo contra la varita de granizo, no cuerpo a cuerpo), el
  Bloqueo por pieza (escudo 1d12, hacha 1d8+1), Derribar 25 % del hacha y la Poción de Cuero Duro (escudo de 15 físico). **Dos arreglos:** el
  cartel «Tenés sobrepeso» (y cualquier cartel de la Botonera que pide el duelo) salía sin estilo y con todos los demás carteles sueltos (los
  «carteles sueltos de la ficha» de la prueba 10); y si una habilidad de un creep esperaba su objetivo y se empezaba otra elección (por ejemplo,
  Atacar con un personaje), la primera se perdía sin devolver lo cobrado. Detalle en `pruebas-en-el-mapa.md`.
- [x] **Línea W2 · Berserker, niveles 1 a 5** (2026-11-09): números iguales a la prueba de niveles (vida 45/50/55/70/75); Golpe desesperado por franja de vida, Furia, Pegar fuerte, Aguante descargado con Pegar fuerte (+3 dados) y con el Barrido (+2d6 solo al primero), Golpe brutal (Guardia baja), Regeneración +3, Espinas de las Pieles erizadas (devolvió 22), las dos espadas del nv5 (PdG 1d10 / 1d10+1, primer ataque de cada una a 3 No2), el Facón y la Poción de Regeneración menor. Sin errores.
- [x] **Línea D1 · Maldito, niveles 1 a 5** (2026-11-09): agregados desde el Pool esencial; los números en el mapa coinciden con la prueba de
  niveles (vida 40/45/45/55/55, PdG.Esp 13/15/17/18/21, en modo SP). Maldición de la coraza (Coraza maldita −2/−2, 3 turnos), Aguja siniestra (1d6
  directo, Herida sombría y Punto débil), la Varita del susurro contra Larry del J1 (no se esquiva: Res.Esp; salió el Silencio 25 %), Maldición
  debilitante (1d6 que frena la Defensa especial, Debilitado y Lento), Escalofrío (Res.Mt, 1d4 y −2 PdG), la Varita de la grieta (−2 Defensa), Aguja
  del desamparo (5 SP; Larry quedó Expuesto y su Evasión salió «÷2» sin Parry), la Capa de escamas de pez espejo (**el Espejo devolvió 1** de un
  Escalofrío directo), el Muñeco vudú (Debilitado 1 turno al primer daño especial), Anulación (elige qué sacar: le sacó el Escudo especial y le dejó
  la Bendición) y la Runa de debilidad (la trampa, con el aviso del cono de visión). **Arreglado:** volver a apretar «Ejecutar» con una habilidad
  esperando el objetivo cobraba dos veces y al cancelar devolvía una. También se sacó del mapa el Mazo del juez que había quedado tirado de la
  prueba 9 (Rockardo lo tenía en su ficha). Detalle en `pruebas-en-el-mapa.md`.
- [x] **Línea S1 · Sanador, niveles 1 a 5** (2026-11-09): agregados desde el Pool esencial; los números en el mapa coinciden con la prueba de
  niveles (vida 45/50/55/60/65, PdG.Esp 12/13/15/16/18, en modo SP). Sanar (1d6+4; con Manos de curandero +5), Purificar (saca el Veneno y cura 5 + 5),
  Oleada sanadora (una tirada para todos, +2 a cada uno), la Varita de cura (1d10) y la de cura mayor (2d8 + 5), Smite (2d4 directo, Marcado y la Luz
  sanadora +2 al Sanador), Cambio de guardia (el Capataz y el Goblin cambian de lugar al empezar la ronda), Círculo de sanación (+4 + 2 al ponerlo y
  otra vez en la ronda siguiente) y el Pergamino de Regeneración menor (+5 al que lo usa; con Manos, +7). **Arreglado:** los avisos del pergamino
  a los creeps aliados llegaban todos juntos y se veía solo el último; ahora salen en fila. Detalle en `pruebas-en-el-mapa.md`.
- [x] **Línea M1 · Piromante, niveles 1 a 5** (2026-11-09): agregados desde el Pool esencial; los números en el mapa coinciden con la prueba de
  niveles (vida 40/45/50/55/65, PdG.Esp 14/15/16/18/19, en modo SP). Lengua de fuego (2d6+3 y Quemadura), Muro de fuego (el largo, 4 casillas; al
  cruzarlo, 3d4 directo y Quemadura), Parpadeo (3 casillas, sin oportunidad), Bola de fuego (una tirada para todos; **el Espejo de Rockardo no
  devolvió nada**), la Botella con un diablito (+2; con un 1 en los dados, «¡te quemó!» 2), la Varita del chorro de lava (4 casillas; quien entra, 1d4),
  los Mitones (la varita costó 2 SP en vez de 3), Escudo elemental (el rodillo, el anillo eléctrico y el salto del rayo), Meteoro (la sombra, cae y
  cada uno con su dodge), el Chaleco de kevlar (Defensa 3 + 2 contra armas a distancia) y la Poción de SP menor. **Arreglado:** el Escudo elemental
  no se podía poner sobre sí mismo (el texto lo dice). Detalle en `pruebas-en-el-mapa.md`.
- [x] **Línea R1 · Tirador de precisión, niveles 1 a 5** (2026-11-09): agregados desde el Pool esencial; los números en el mapa coinciden con
  la prueba de niveles (vida 35/40/40/50/55, PdG 11/14/15/16/17). Tiro certero (crítico, ignora la Defensa), Tiro a la cabeza (Apuntando: el disparo
  siguiente +2 PdG con la respiración contenida, se gasta), Vigilancia (Bizzante se movió en la mira → «¿Dispara?» → disparo con +2), Tiro al arma (el
  Mazo de Rockardo voló 2 casillas), Disparo señalador (Presa y Marcado; con la Presa, el siguiente le hizo +2), Ojo crítico (Crítico frecuente 1 en el
  rango), Flecha que atraviesa (segundo objetivo con la misma tirada y **sin Espinas de vuelta**), Botas de mensajero («Evasión (+2 contra
  oportunidad)»), Flecha perforante (se gasta al disparar; la común no). **Tres arreglos:** cerrar el «¿Qué flecha?» de una habilidad no devolvía
  lo cobrado; la Mesa decía «Quedó con Presa, Marcado» aunque el Invulnerable los frenó; el segundo objetivo de la Flecha que atraviesa perdía el
  Ojo crítico. Detalle en `pruebas-en-el-mapa.md`.
- [x] **Línea L2 · Envenenador, niveles 1 a 5** (2026-11-09): agregados desde el Pool esencial; los números en el mapa coinciden con la prueba
  de niveles (vida 35/40/40/45/50, Evasión 9/9/10/14/15). Estocada (perfora 3, +1, Veneno ×2 de la daga), Hoja envenenada (Veneno ×2 + ×3 = 5),
  Tajo veloz (+2 PdG, +2, Crítico frecuente +1), Golpe a la rodilla (Rengo 2), la Daga de la viuda verde (Veneno ×3 siempre, sin perforar: contra
  Defensa 15 no entra), Hit and run (el cartel «se aleja», 1 casilla gratis y sin oportunidad), Escurridizo, la Chaqueta del corredor (Evasión «con +2
  contra oportunidad», esquivó), Zuecos (Res. tóxico y ácido +1), Ráfaga de cortes con el Anillo del pantano (tres «Veneno ×4 (3 + 1 del
  envenenador)»), el Óleo venenoso (+2 y Veneno ×3, la carga se gasta) y el veneno que se suma entero (2 → 5 → 8; 5 → 10). **Arreglado:** el duelo
  del GM decía «le llegó a su ficha» aunque el personaje estaba Invulnerable (lo pedido en la prueba 7): ahora dice «no entró: está Invulnerable».
  Detalle en `pruebas-en-el-mapa.md`.
- [x] **Línea L1 · Sangrador, niveles 1 a 5** (2026-11-09): agregados desde el Pool esencial; los números en el mapa coinciden con la prueba
  de niveles (vida 30/35/35/40/40). Golpe que sangra (con crítico, Sangrado permanente), Sal en la herida (+2 dados contra uno que sangra), Tajo al
  tendón (cada casilla que se mueve, 1 de vida directo), Ráfaga de cortes (el Sangrado de la Hoz se tiró 3 veces y se acumuló), Corte en la arteria
  (Crítico frecuente +2 y, con el crítico, Sangrado permanente), Ojo crítico y Ojo de carancho (+1 a la PdG contra uno con estado malo), Paso atrás
  (+2 a la Evasión y el paso gratis), Escurridizo (el paso pagando 1 No2), las Botas de mensajero (+2 contra oportunidad y Levitar 2) y el Óleo
  venenoso. Sin errores. Una cosa para el dueño (el aviso del duelo cuando el Invulnerable frena el Sangrado). Detalle en `pruebas-en-el-mapa.md`.
- [x] **Línea H1 · Embestidor, niveles 1 a 4** (2026-11-09): agregados desde el Pool esencial; los números en el mapa coinciden con la prueba de
  niveles (vida 50/55/60/80). Carga que derriba (corrió 3: +3 PdG y daño, Fuerza + 3 contra la Res.CC), Takle (resistido y ganado: −3 No2, empujón
  que chocó, al final del orden), Salto aplastante (elegir dónde caer, el aplastamiento, ¿atacar?, crítico), Aguante con 2 golpes descargado en
  Pegar fuerte (+3 dados), el Derribar 50 % de las dos hachas, el Pergamino grupal de Paso Fantasma. Sin errores; dos cosas para el dueño (el nivel 1
  no llega a la carga de 3 con sus No2; la carrera no carga el Anillo de Paso Fantasma). Detalle en `pruebas-en-el-mapa.md`.
- [x] **🐞 «Podés usar» adentro del cuadro del duelo** (2026-11-09, la captura del Escudo humano de la prueba 5): la columna de Flash (🛡 ✨) se ubicaba
  con el cuadro achicado por la animación (al desplegarse desde su token o al volver de apartarse: Demora, Cambiar de lugar, el gancho) y quedaba ~1 s
  en el medio, sobre «14 contra 3» y el Crítico. **Arreglado** (`comun/flotantes.js`): toma el lugar final del cuadro y espera escondida a que termine
  de desplegarse. Probado con `Duelo.apartar`: siempre afuera, a la derecha. Capturas `cola-06b-*`.

- [x] **Línea T1 · Escudero, niveles 1 a 5** (2026-11-08): agregados desde el Pool esencial; los números en el mapa coinciden con la prueba de
  niveles. Golpe de escudo (2d10 del escudo, Sentado y Demora), Piel de hierro (+4/+4 y +1 a la Res. a crítico), Provocar (falla y funciona, con
  Desafiante), la poción de Cuero duro, el Parry y el Bloqueo por pieza (hacha 1d10 / escudo 1d12), Aguante descargado con Golpe de escudo (+1d10 y
  +1 de cooldown), Devolver gentileza (ganó Parry y Bloqueo → «¿contraatacás?» → contraataque con el hacha), Interponerse con Espinas (devolvió 5),
  Escudo humano (mitad al Escudero, sin Espinas de vuelta) y el Hacha del forjador (tiró su 50 %). Sin errores. Detalle en `pruebas-en-el-mapa.md`.
- [x] **Línea W1 · Hachero, niveles 1 a 5** (2026-11-08): agregados desde el Pool esencial de GM Tools; los números en el mapa coinciden con
  la prueba de niveles; Pegar fuerte, Romper armadura + el arma (se suman), Golpe demoledor (arranca en cooldown, ×2 + el arma), Barrido, Arte de la
  guerra, Remate (+2 dados) y el pergamino, bien. **Error arreglado:** un Flash marcado no valía con la tirada escrita a mano. Detalle en `pruebas-en-el-mapa.md`.
- [x] **Milagro, versión de clase** (2026-11-08): Larry (J1) con el Milagro del Support: flor de diámetro 5, cura 2d8 y saca el estado malo
  más reciente a los tres aliados de adentro (él incluido), no toca al caído ni al creep de adentro; cobra 2 No2 y 10 SP; la segunda vez avisa «una vez
  por combate» y deja seguir; se libera al terminar el combate. Sin errores. Una sola tirada de 2d8 para todos (a confirmar). Detalle en `pruebas-en-el-mapa.md`.
- [x] **Barrido hecho por una invocación** (2026-11-08): la Abeja Gorda de Bizzante (J2), con un hacha y el Barrido, contra tres creeps:
  se cobró una vez, eligió el primero, orden en el sentido de las agujas del reloj (el aliado al lado no entra), un duelo entero por rival (crítico
  con Rompe armadura, Parry + Bloqueo, esquive). Sin errores. Falta en el editor de habilidades de la invocación una forma de armarle un giro
  (se le copió el Barrido de creep). Detalle en `pruebas-en-el-mapa.md`.
- [x] **Coletazo de una bestia** (2026-11-08): un ataque entero por rival en el sentido de las agujas del reloj, pulso y cuadro desde cada token,
  críticos, Veneno y Empujón al que pega, nada al que esquiva; el empujón contra un token choca una sola vez. Sin errores. Detalle en `pruebas-en-el-mapa.md`.
