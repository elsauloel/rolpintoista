# Pruebas pendientes en el mapa

> Protocolo del dueño (2026-10-09): lo que pide probar **en el mapa**, si no se puede (Claude in Chrome desconectado, falta una de las dos cuentas
> y él no está para habilitarlas), **no se prueba «por detrás»** (funciones a mano, datos simulados): se anota acá y se prueba en el mapa apenas
> se pueda. La prueba de Claude, con capturas, es un **filtro intermedio**: no reemplaza la del dueño, pero lo visual detecta errores que las
> pruebas automáticas no (un botón que no se ve, un cartel tapado…).
>
> Cómo: partida «Claude · pruebas» (`?partida=YWjRbx7eJlqQpL1wtCKH`), las dos cuentas de Chrome (jugador y GM), la Botonera nueva del mapa y
> capturas. Al probar algo: pasarlo a «Probado» con fecha, qué se vio y si hubo que arreglar algo.

## De la sesión en «El origen de las especies» (2026-10-22)

- [x] (2026-10-22, Claude, dos pantallas en «Claude · pruebas»: juan con una copia de los Pedos de Larry contra dos goblins) **🎲 La tirada extra de una zona la tira quien la creó** (Pedos Tóxicos de Larry): cuando el daño de la zona entra a un goblin, el cartel del GM dice
  «🎲 1d20: lo tira Larry» y a la pantalla de Larry le aparece «Tirá para el efecto de Pedos Tóxicos contra Goblin 1» (de a uno si son varios); la
  tirada sale en la Mesa a nombre de Larry, con la nota (7+ Pajaritos · 17+ Stun · 20 desmayo, a mano), y la Crónica lo cuenta; el GM, «🎲 Tirar por él».
  **Probado (2026-10-22):** el cartel del GM «no resistió… · 🎲 1d20: lo tira juan»; a juan «Tirá para el efecto… contra Alguien» con la tabla y
  «🎲 Tirar 1d20», de a uno; salió 7 → «✔ Que se aplique» → al GM «Aceptar» → el goblin quedó con Pajaritos; «✋ Lo resolvemos a mano» también; el GM
  «🎲 Tirar por él» desde la Crónica (la Mesa dice «lo tiró el GM»). **Dos errores encontrados y arreglados:** con dos pantallas, a quien tiraba le
  aparecía un aviso genérico con «Entendido» y sin botón para tirar (lo tapaba); y la tarjeta del GM con «Tirar por él» se borraba a los 14 s.
- [x] (2026-10-22, Claude: Clementino le pegó un crítico al Bosque, 21 de daño; la vida quedó en 60 hasta «💔 Aplicar el daño», después 39) **💔 El daño a un creep espera el clic del GM**: un personaje le pega a un creep (o el creep para y pierde el Bloqueo: pasa la mitad) → en el
  cuadro del duelo, al GM, «Pasa la mitad: (X − su Defensa) ÷ 2» y «💔 Aplicar el daño»; recién ahí se descuenta. (Antes se aplicaba solo.)
- [x] (2026-10-23, Claude, «Claude · pruebas», juan con el control del GM: dos Empower seguidos a sí mismo — el segundo ofrecía «+6 (ya tiene 1
  Empower esperando) · 3 SP» —, cobró 2 + 3 SP (42 → 37), la Botonera mostró «Empower +6» y la Evasión siguiente lo usó («Afectada por Empower») y
  el estado se fue) **💪 Empower antes de la tirada** (dueño, 2026-10-22: «se aprieta y la siguiente tirada le suma el valor del empower»; js/37, estado Empower
  en `comun/estados-presets.js`): 💪 → «¿A quién le das Empower?» (vos o un aliado en tu Rango, con lo que sumaría y el costo) → paga → esa persona
  queda con Empower y su próxima tirada (ataque, defensa, daño, Fuerza del golpe, Percepción…) suma +3 y lo gasta. Dos Empower antes de tirar = +6.
  **Probado por Claude (2026-10-22, «Claude · pruebas»)**: el cartel de elegir a quién (juan: «juan (vos)» y «Clementino», +3 · 2 SP); la Botonera
  de Clementino con Empower muestra «Empower +3» debajo de cada tirada (PdG 1d6+1 → 1d10, Evasión 1d12 → 1d6+1d8+1); el motor: la tirada lo suma,
  la Mesa lo pinta y se gasta (558 pruebas). **Falta**: verlo el dueño desde juan (pagar y tirar en un duelo) y darle a un aliado. **Ojo:** una
  pantalla con la versión vieja que le aplique el Empower a un aliado lo deja como un estado vacío (pasó con la pestaña del dueño): recargar todas.
- [x] (2026-10-22, Claude, un desarme de verdad en «Claude · pruebas»: Goblin 1 desarmó al Goblin 4 parado al lado de una pared de línea larga con colisión; la ruleta giró solo por las 7 casillas del lado del goblin, ninguna detrás de la pared, y el hacha cayó a 2; capturas en la conversación; todo restaurado) **🤺 La ruleta del desarme cae solo en casillas libres** (dueño, 2026-10-22: «si no hay en ese círculo… si hay en el círculo interno,
  primero ese; si no, en el externo, y así siguiendo para afuera»; js/62): el anillo a 2 casillas sin nadie, sin Sólidos y sin otra arma; lleno →
  el de 1; después 3, 4… hasta 8. Y vuela como un lanzamiento (dueño, 2026-10-22): un Sólido o una pared de línea en el medio la frena; las
  personas no («les vuela por encima o por el costado»); en el borde justo entre dos casillas, alcanza con un costado libre. **Visto por Claude
  (2026-10-22, solo en su pantalla, sin tocar nada):** en una casilla con un Sólido al costado y una pared abajo, la ruleta quedó solo en las 5 del
  lado abierto (7 tapadas). El anillo de 2 lleno de tokens no hace falta probarlo (dueño: «muy improbable»).
- [x] (2026-10-22, Claude, «Claude · pruebas»: el hacha del Goblin 4 en el piso al lado suyo titiló en la pantalla del GM; clic → «¿Lo levanta Goblin de prueba 4? (cuesta 1 No2)» → Sí → se le fue el Desarmado, 3 → 2 No2, el hacha salió del piso, la Mesa lo dijo; restaurado) **🗡️ Un creep levanta su arma con un clic en el mapa** (dueño, 2026-10-22, «sumalo»; js/27 `levantadorPara` / `acLevantarArmaDe`): en la pantalla del GM, como un personaje (en combate, en su turno).
- [x] (2026-10-23, Claude, «Claude · pruebas»: el Goblin 4 atacó al Ladrón, que paró con el Cuchillo; en el Bloqueo, «🤺 Desarmar · en cooldown (2 turnos)» gris; con el Ladrón en modo SP el botón queda encendido con su costo en SP, como corresponde; duelo terminado con su botón) **🤺 Desarmar en cooldown: el botón apagado** (dueño, 2026-10-22, «sí»): en el Bloqueo, «🤺 Desarmar · en cooldown (N turnos)» gris y sin
  poder tocarlo (o «le faltan No2», «te falta SP»); no va en el desplegable de la tirada a mano. Probarlo con el Ladrón recién usado.
- [x] (2026-10-23, Claude, «Claude · pruebas», orden: juan primero y el Goblin 1: una zona de 1 turno de juan sobre dos goblins pegó al tirarla (3 → 2) y otra vez al pasar la ronda (2 → 1), con «Se va … después de su efecto de esta ronda», y recién después se fue. **Error encontrado y arreglado en la prueba**: el mapa guardaba la zona con «turnos: 0» y las reglas solo aceptan de 1 a 99: la escritura fallaba callada y la zona se quedaba otra ronda —un tercer efecto—; ahora se borra el dato y vence en ese Mantenimiento) **⏳ Una zona de 1 turno hace efecto dos veces**: al tirarla y al pasar la ronda; después se va al empezar el turno de quien la tiró. Con quien
  la tiró primero en el orden, que no se vaya antes de resolver el segundo efecto (`zonasDelQueLaTiro` con el Mantenimiento nuevo).
- [x] **🎲→◎ Lo que sale en el d20 de los Pedos se aplica solo, con dos Anuncios** (dueño, 2026-10-22; `js/66`, tabla «según la tirada» en la
  Ejecución). **Probado en «Test con claude elsaulo» (2026-10-22, Claude, una sola pantalla como GM con 🎮 el control de Silvia)**: una zona de
  prueba de Silvia con la tabla 1+ Pajaritos · 11+ Stun · 20+ cae → el creep entró, el daño pasó, el Anuncio «Tirá 1d20» con la tabla como nota,
  salió 9 → «Salió 9: le toca Pajaritos (1 turno)» con «✔ Que se aplique» → «Te aplican Pajaritos» del lado del creep → ✔ Aceptar → el estado en el
  creep, la Mesa («Pedos de prueba → Creep: Pajaritos (1 turno)») y la Crónica. Lo mismo sobre Aurelia (personaje, con el control) → Pajaritos en su
  ficha. Y «cae» sobre el creep (salió 10 con 1+ cae → «💀 Creep cae» → la vida a 0, `muerto`). La tabla se ve y se edita en el editor de la Ejecución.
  **Falta probar**: «cae» sobre un personaje (`fijarHp(S, 0)` + `revisarMuerte`), los botones del GM en la Crónica («✔ Que se aplique (por él)» y
  «◎ Aplicar por él») y una zona de creep con tabla (abre directo el «Te aplican»). Todo restaurado.
- [x] **🎁 El botín por grupos y en pilas** (dueño, 2026-10-22; `comun/ficha-botin.js`): Mano (armas, escudos, varitas, orbes) / Cuerpo / Consumibles /
  Trofeos; los iguales en una pila «×N» con la cantidad a reclamar. **Probado en «Test con claude elsaulo» (2026-10-22, Claude)**: 4 goblins de prueba
  derrotados con equipo repetido (4 chalecos, 2 lanzas, 2 pociones, varita, escudo, honda, hacha, casco, capucha, botas, bomba, bengala) → Finalizar
  combate → Publicar → el botín de Silvia (con el control) mostró los grupos y las pilas; reclamar 2 chalecos → «2 libres · 2 tuyos», «↩ Soltar 1» y
  el aviso «2 × Chaleco de cuero son tuyos». Todo borrado y el combate anterior repuesto. Falta probar: Disputar sobre una pila y Soltar de a uno.
  **Retoques del dueño (2026-10-22, mirándolo como jugador en «Claude · pruebas»; probados ahí como GM)**: el cartel «🎁 ¡Botín disponible!» junto al
  botón del dock mientras hay botín publicado; la cabecera con tus XP y DDE en dos recuadros grandes (los demás jugadores en una línea chica);
  los títulos Mano / Cuerpo / Consumibles / Trofeos como banda destacada; el nombre de cada ítem con el globo del glosario (su resumen al pasar el
  mouse, `data-glo-txt`); «slot ocupado» en rojo y siempre con Comparar; la mochila abierta desde el botín vuelve al botín al cerrarse (mapa y ficha
  suelta); el emoji de Reclamar con su fondo oscuro. El dueño lo vio como jugador (juan) en «Claude · pruebas», reclamó y el botín se cerró ahí
  (las recompensas de prueba quedaron en Clementino y juan).
  **Segunda vuelta (2026-10-22)**: Comparar también con las armas (`FichaEquipo.slotOcupado` compara contra lo equipado en el mismo LUGAR, no solo
  el mismo tipo exacto: una varita de una mano contra la espada de dos manos puesta); Comparar y «🎒 Mochila y equipo» más visibles; y el Anuncio
  **«🎁 Botín concluido»** (js/11 `recompensaAnuncio`: Experiencia, DDE, Despojos, Ítems reclamados, ✔ Aceptar) cuando llega la recompensa al
  personaje. **Falta probar en vivo** el Anuncio con un cierre real del botín (se vio con datos de muestra) y Comparar sobre un arma del botín.
  **Tercera vuelta (2026-10-22)**: en «Botín concluido» cada ítem reclamado lleva el globo del glosario (visto en el mapa); **⚖ Comparar** muestra, debajo de
  la tabla de números, «Lo que hace cada uno» (la ficha corta de los dos, lado a lado: el hechizo de la varita, los efectos al golpear, lo de un
  talismán) y un número que no aplica a uno de los dos sale «—» sin flecha. Visto en el mapa: Varita arcana contra Cuchillo, Farol contra Tapa de
  tacho, Hacha contra Cuchillo (capturas enviadas al dueño).
- [x] (2026-10-22, lo vio el dueño) **✨ Levantar con un clic** (dueño, 2026-10-22, js/27 `levantadorPara`/`armaClicLevantar`): un arma u objeto en el piso, encima o al lado
  de tu personaje, titila con un anillo dorado (en combate, solo en tu turno; fuera de combate, siempre). Clic sobre él → «X está en el suelo.
  ¿Querés levantarlo? (cuesta 1 No2)» Sí/No; si va en la mano y hay una libre, «¿Querés dejarlo equipado?» Sí (en la mano) / No (a la mochila);
  con las manos ocupadas, reemplazar o a la mochila. Probado por Claude con juan (titila; la pregunta y levantar; la primera vez, estando
  Desarmado, se equipó sin preguntar: corregido para que pregunte siempre). Falta verlo el dueño, y en combate (en tu turno y fuera de él).
- [x] **🤺 Desarmar, ofensivo y defensivo** (dueño, 2026-10-22; los dos ya los vio el dueño, también la tirada a mano con «Bloquear / Desarmar»): probado por Claude en «Claude · pruebas» los cuatro caminos (atacando y
  defendiendo, gana y falla) con el Ladrón (prueba) y juan; falta que lo vea el dueño: el cartel «¡X desarmó a Y!» con Aceptar, el duelo que se
  achica, la ruleta en círculo, el duelo que vuelve con «¡DESARMADO!» y «Terminar duelo»; y un Warrior (personaje) desarmando desde su cuenta.
- [x] **🌫 La Bomba de humo de un creep pide la casilla** (reportado por el dueño el 2026-10-22: «usar» la gastaba sin hacer nada; arreglado en js/12
  `acConsumir`): un consumible de creep con zona (`zonaUso`: Bomba de humo, Bombucha de talco) o Acelerador (`aceleradorMapa`: la Runa) va por el mismo
  camino que el de un personaje: el GM elige la casilla y se arma la zona. Visto en «Claude · pruebas» con Goblin de prueba 1: pidió el centro, dejó la
  flor de humo de 7 por 2 turnos, gastó 1 unidad y 1 No2. El Ojo de Kicillof en un creep avisa «✋ se pone a mano» (los creeps no invocan todavía).
- [x] **🏪 La tienda cerrada se puede mirar** (dueño, 2026-10-22): con la tienda cerrada, el 🏪 del mapa y el Vendedor de la ficha abren la última
  publicada con el cartel «🔒 Cerrada: podés mirar, no comprar ni vender» (sin carrito, Comprar, Vaciar, Vender, Reparación ni ítem aleatorio; Ver
  y Comparar sí); si el GM la cierra con la ventana abierta, se queda mirando y el carrito se vacía; cuando la abre, «🏪 El GM abrió la tienda».
  Visto en «Claude · pruebas» (juan, desde el mapa: cerrada y después abierta). **Falta probar** lo mismo en la ficha suelta.
- [x] (2026-10-22, lo vio el dueño) **✅ Terminar mi turno** (dueño, 2026-10-22): en la cabecera del orden de turnos (también achicado), cuando le toca a un token mío, el botón
  «✅ Terminar mi turno»; al tocarlo queda «⏳ Terminando…», la Crónica dice «Fulano terminó su turno» y la pantalla del GM pasa al siguiente por él
  («El GM pasó el turno»). Si no hay ninguna pantalla del GM abierta, a los 20 s el botón se vuelve a habilitar. Si el turno ya había pasado, la
  Crónica lo dice y no pasa nada más.
- [x] (2026-10-22, lo vio el dueño) **👀 Espectadores del piedra, papel o tijera** (dueño, 2026-10-22): a quien no juega le sale abajo «👀 A y B están jugando piedra, papel o
  tijera · Ver»; con Ver, la misma ventana mirando (las dos manos cerradas con «eligiendo…» / «ya eligió», la revelación de cada ronda, el final con
  «Gana X»); «Dejar de mirar» o «—» devuelven el botón. Hace falta una tercera cuenta para verlo de verdad (se probó con una pantalla espectadora
  armada a mano).
- [x] (2026-10-22, lo vio el dueño) **⭕ El lápiz cierra la figura al terminarla** (reportado por el dueño el 2026-10-22, arreglado en js/07 `guardarTrazo`): con «⭕ Cerrar la
  figura» tildado, en rectas (clic, clic, clic y doble clic o Enter) y a mano alzada (al soltar), el trazo nace con las puntas unidas, sin pasar
  por el ⚙. Y con 🧱 además, lo de adentro queda sólido y sin grilla.

## Auditoría de creeps: para probar

> Forma de trabajo del dueño (2026-10-21): lo que se define en la auditoría de habilidades de creep (`docs/auditoria-skills-creep.md`) se programa,
> pasa las pruebas automáticas y se sube, **pero no se prueba en el mapa en el momento**: se anota acá. Cuando el dueño lo pida, se corren todas
> juntas en el mapa, con capturas, y se marcan.

- [x] **⚔🛡 La tanda del Choque pesado (2026-10-27, las 14 + 3 de clase)** — *probadas las 17 el 2026-10-27 (Claude, dos pantallas): todas andan; 5 errores encontrados y arreglados (ver el reporte)* — el dueño pidió que las pruebe Claude en el mapa al terminar de programarlas:
  Golpe brutal (críticos, daño y Guardia baja), Arte de la guerra (Flash antes de tirar), Contraataque (tras la Evasión y tras el Parry), Golpe que sigue
  (tumba y sigue), Provocar (PdG.Esp + nivel; Provocado y Desafiante), Piel de hierro, Blindaje (✨ sobre sí), Segundo aliento (cura, saca el debuff, una vez),
  Escudo humano (reparte la mitad; 5 de Vida extra), Interponerse (✨ cuando atacan a un aliado), Golpe de escudo (1d10 + peso + Dmg; Sentado y Demora),
  Carga que derriba (carrera de hasta 4; derriba desde 3), Sonic Boom (cono, −No2, la diferencia de daño), Arrastrar (lo trae; las trampas del camino).
  Y de clase: el Taunt con el nivel, el Golpe brutal y el Contraataque. Resultados: el reporte `docs/reporte-choque-pesado-2026-10-27.md`.
- [x] **🪤 La tanda de trampas (2026-10-27: Red tendida, Cebo, Cepo del cazador, Mina del cazador, Aguja en el piso, Abrojos, Cordón oculto, Polvo cegador; el límite nivel + 1; P227 escudo / Vida extra; el Relicario; el botón Limpiar dados)** — *probadas el 2026-10-27 (Claude, dos pantallas en «Claude · pruebas»: el GM con el Warrior (prueba) colocando y Saulo-Prueba caminando con Clementino)*:
  ✔ **colocar**: el mapa muestra los conos azules y la alerta naranja de los rivales; la casilla en un cono no sirve; la naranja sí. Cada una cobra su No2 y SP y en la Mesa del jugador sale «acción incierta».
  ✔ **Cordón oculto**: el cordón claro con borde negro, las dos estacas, la tensión y el contorno de puntos; Agilidad contra 7: resiste (queda sobre el cordón) o cae una casilla más allá, Sentado.
  ✔ **Red tendida**: Fuerza contra la Destreza (7), Inmovilizado 2 turnos, la red dibujada encima del token, 🔓 Soltarse · Fuerza contra 7 · 1 No2 (sin No2 pregunta y deja seguir; falló 3 contra 7).
  ✔ **Cepo**: 3d6 menos la Defensa, Inmovilizado; Soltarse fallido → «al forcejear se lastima» 1d6 directo (7 → 2).
  ✔ **Mina**: 2d6+2 de fuego directo (25 → 19), después Res.CC contra Pajaritos.
  ✔ **Aguja** (P227): sin escudo, 4 de daño y Veneno ×5; con Defensa 21 y Escudo especial, «pasan 2 por la Perfora → el escudo absorbió 2 · no lo lastimó: lo que deja no entra»; con Vida extra, se la lleva y el Veneno entra.
  ✔ **Abrojos**: con Defensa 21 el daño queda en 0 y el Rengo igual pide su Res.CC; la zona queda 3 turnos.
  ✔ **Polvo cegador**: Res.CC contra 7, Ceguera 1 turno.
  ✔ **Cebo**: «Algo brilla…»; Clementino perdió Res.Mt (3 contra 7), caminó 2 hacia el brillo, lo dio vuelta: «PUTO EL QUE LEE» para las dos pantallas y el cebo desapareció. Otro: resistió al ponerlo (8 contra 7) y al empezar su turno volvió a tirar, perdió y fue.
  ✔ **Límite**: con 4 Polvos (nivel 3 + 1), el quinto pide «clic en la que se desarma» y la nueva va en su lugar.
  ✔ **Relicario**: lo que una cura pasa del máximo queda como Vida extra (7, 3, 2: tope 12 = 50 % de 25), se va al terminar el combate.
  ✔ **Limpiar dados**: abajo a la derecha del mapa, al lado de la Mesa.
  **Arreglado**: el Cebo publicaba en la Mesa toda su descripción (delataba el truco): ahora solo «Algo brilla…»; y el daño que se lleva la Vida extra se mostraba «0 de daño (la Vida extra se llevó 2)»: ahora cuenta como daño («2 de daño»).
- [x] **🏹 Los arcos Buenos (11), para el testeo de su tier (2026-10-27, dueño: «anotalo en pendientes para probar en el mapa cuando te diga que pruebes los pendientes del mapa»)**: Arco de emboscada, de puntería, de tirador fino, de la ciénaga, de flechas con estopa, de vigía, largo de cazador, de doble curva, del rastreador de bestias, de las brasas y de la sombra (los cargados el 2026-10-11 con las mecánicas de arco: Tensar, Largo alcance, Emboscada, Matabestias, Contra el Marcado, Espalda a distancia, Afinidad elemental). Cada uno disparando desde la Botonera: que su mecánica se aplique y se vea en el duelo. Siguen en el catálogo.
  ✅ **Probados (2026-10-28, juan con la Botonera nueva, contra el Warrior a 3 casilleros salvo donde se dice)**: **emboscada** «distancia ideal: Crítico frecuente +1» (y la Emboscada otra vez con la sombra: se cuenta por pantalla desde que el mapa pasó a combate, y la del jugador se había recargado); **puntería** el arma en la declaración, Crítico potente +2 en el cartel (solo vale en un crítico: no se vio en una tirada); **tirador fino** «Crítico frecuente +1» en el cartel; **vigía** la PdG pasa de 1d6+1 (7) a 1d8 (8); **ciénaga** «Veneno 50 % (2 en d2)» y, llevado hasta el final (PdG 15 a mano, Evasión 2, triple crítico, 48 de daño), «Efectos del golpe»: después de aplicar el daño, «Tirar el efecto (1d2)» → 1, «no funcionó», y la línea en la Mesa; **estopa** «Prende fuego 33 % (5–6 en d6)» (mismo camino que el veneno); **largo de cazador** contra un goblin a 15 (alcance 11): «largo alcance (4 de más): −4 PdG» y la tirada «10 (manual) −4 = 6»; **doble curva** pregunta «¿Tensás el arco? (+1 No2 → +2 PdG)», «tensado: +2 PdG · perfora 1» y el No2 del Tensar en la Mesa; **rastreador de bestias** contra el Escarabajo de cobre (bestia y Marcado) «matabestias y contra el Marcado: +2 PdG, +3 de daño»; **sombra** con el Warrior de espaldas «por la espalda: +1 PdG» (la regla general) y «emboscada y por la espalda: +2 PdG, Crítico frecuente +1, +1 de daño»; **brasas** con una Flecha de fuego del carcaj: «Flecha de fuego: +1d4+1 de fuego, Quemadura» (sin el arco es +1d4). No se vieron en una tirada el Crítico potente, el Crítico frecuente, el Perfora ni el +3 de daño del Matabestias (salen en el cartel; tiran por el mismo `tiro` que el −4 del largo alcance, que sí se vio). **Arreglado el mismo día** (a6ff26be): cancelar un duelo antes de tirar no devolvía la flecha especial; ahora vuelve al carcaj (o al cinturón de un creep) con su No2, y también si se cancela después de tirar y se elige «No cuenta». Probado con juan: «el duelo se canceló antes de tirar — Flecha de fuego vuelve» y «no cuenta como ataque — se le devolvieron 2 No2 · Flecha de fuego vuelve», el carcaj de vuelta en ×1 las dos veces. **Y lo que se devuelve es lo pagado** (5c26d028, dueño: «corregilo»): antes «No cuenta» devolvía el costo entero aunque se hubiera atacado «de cualquier modo» con menos No2 (juan, con 0, recibía 2). Ahora cada duelo anota lo que se pagó de verdad (personajes, creeps e invocaciones). Probado: juan con 1 No2, ataque de 2 «de cualquier modo», cancelar → «No cuenta» → «se le devolvieron 1 No2», vuelve a 1.
- [x] **👁 Pared que deja ver (2026-10-27)**: una pared con «👁 Deja ver a través» frena el paso, pero la visión, los conos del sigilo y el rango pasan; con «🏹 Deja disparar a través», la línea de tiro y las flechas pasan; sin eso, chocan. Y «◻ Solo la línea»: una figura cerrada sin relleno. Y el ⚙ de un dibujo pegado al borde de abajo: el cuadro se abre para arriba y no lo tapa la barra de tareas de Windows. **Probado (2026-10-27, «Claude · pruebas», GM)**: el ⚙ de una pared pegada al borde de abajo abre el cuadro para arriba, entero; «🙈 Tapa la vista → 👁 Deja ver» y después aparece «🛑 Frena los disparos → 🏹 Deja disparar»; con cada una, la pared cortó lo que tenía que cortar (paso sí; vista no; disparo según la opción). «◻ Solo la línea» aparece recién con el relleno de color (si el dibujo está «◌ Sin relleno», no se ofrece: dos opciones parecidas, a revisar) y deja la línea con su color y el adentro sin pintar. Falta verlo desde un jugador con niebla (la vista se comprobó en el motor, no en su pantalla).
- [x] **🏹 Flecha o virote especial en una habilidad de disparo (2026-10-27, dueño: «una habilidad de disparo debería poder usar una flecha o virote especial»)**: un personaje con arco y flechas especiales en el carcaj usa Disparo señalador (o cualquier habilidad «con tu arma» a distancia): aparece «¿Qué flecha?», la flecha se gasta al disparar y su efecto entra en el duelo; lo mismo un creep con arco o ballesta y flechas o virotes en el cinturón. Con una flecha común, nada cambia. **Probado con un creep (2026-10-27)**: el Tunelero de prueba con Arco corto, Disparo señalador y 2 Flechas marcadoras: Ejecutar → «¿Qué flecha?» → Flecha especial → la marcadora; el duelo dice «🏹 Flecha marcadora: Marcado», la Mesa «disparó Flecha marcadora», la flecha se gastó (2 → 1) y entre los efectos aparecen los de la habilidad (Presa, Marcado) **y** el de la flecha (Marcado). Detalles: el Marcado sale dos veces (habilidad y flecha); en el cinturón de un creep la flecha tiene un botón «Usar · 1 No2» que no corresponde. Falta probarlo con un personaje (carcaj).
- [ ] **🕳 Excavar de creep en modo SP (2026-10-29, dueño: «enterrarse tiene que costar un nitro y un SP… en SP 2 o 3, lo dejo a tu criterio»)**: un creep
  en modo SP con Excavar: meterse cobra 1 No2 y 1 SP (Mesa «se mete bajo tierra (−1 No2 −1 SP)»); ⬆ Salir no cobra nada; salir atacando cobra lo de un
  ataque y 2 SP. En modo cooldown, meterse sigue siendo 1 No2 y el cooldown arranca al salir. (De jugador ya estaba así y probado.)
- [ ] **🕳 Excavar: salir en su casilla (2026-10-28, dueño: «que salga en la ubicación que está, no hasta 4 casillas; si está adyacente a un rival, puede atacarle con el skill»)**: bajo tierra, Ejecutar Excavar ya no pide casilla: el token aparece donde está (sobre el pozo) y enseguida se elige a quién apuñala (un rival pegado).
- [~] **🕳 Excavar, una sola habilidad, y la estela del túnel (2026-10-27)**: un creep con Excavar: el primer uso lo mete bajo tierra (−1 No2, sin cooldown); el GM lo arrastra por abajo y al soltar la estela de tierra aparece de a una casilla, de atrás para adelante, en la pantalla del jugador también; el segundo uso: elegir por dónde sale (a 4 o menos), el tramo hasta ahí se suma a la estela, apuñala con +3 PdG, +1d6, Rengo; la estela se va de a una al empezar su próximo turno. (Antes, pegar la regla `tunel`.) **Probado casi todo (2026-10-27, GM + jugador)**: meterse (−1 No2, el GM lo ve transparente sobre el pozo); arrastrarlo por abajo (cobra No2 por casillero); la estela de tierra con piedritas queda en cada casilla del recorrido y la ve el jugador, que **no ve el token**: solo el pozo donde está; salir (cobra lo de un ataque, elige la casilla a 4 o menos y después el objetivo); el duelo trae +3 PdG, +1d6 y Crítico frecuente +1, y con el crítico, Rengo 2 y Lisiado 1. **Falta**: ver cómo se va la estela al empezar su turno (el creep de prueba no estaba en el orden de turnos) y mirar la animación «de atrás para adelante» en vivo. Detalle: los botones «Aplicar» de los efectos tocados antes de aplicar el daño no hicieron nada (sin aviso); después del daño, sí.
- [x] **🛡 Golpe de escudo, regla nueva (2026-10-27, dueño: tantos d10 como el peso del escudo + el Dmg)** — *probado el mismo día*: el Tanque (prueba) con su Escudo pequeño (peso 2) contra juan: «con Escudo pequeño · Tipo 10 · no se puede parrear», el crítico como Tipo 10 y el botón «Tirar el daño · Escudo pequeño · 2d10 + 10». Duelo cancelado (sin daño a juan), No2 del Tanque repuestos.
- [x] **💀 P225: un caído es un cuerpo (2026-10-27)** — *probado el mismo día*: Clementino en 0 al lado de juan: el Sonic Boom del Tanque (cono con el Warrior, juan y Clementino adentro) armó la cascada solo con juan; una trampa de área alrededor de juan alcanzó a juan, al Tanque y al Warrior, no a Clementino; el salto eléctrico desde juan no le llegó. Clementino, de vuelta con la vida llena.

- [x] **🎆 Misiles elementales (Mago, 2026-10-25)**: cada uno contra juan (Misil arcano directo; Lengua de fuego deja Quemadura; Dardo helado, Escarcha según el daño; Centella no se esquiva, salta y paraliza con 50 % si gana la Res.Esp; Mancha corrosiva, Armadura rota; Ponzoña, Veneno 2 + 1 cada 5) y el **Misil elemental**: al ejecutarlo, el cartel «¿de qué elemento?» antes de cobrar, la línea en la Mesa y el duelo del elegido; cancelar no cobra. — *probado en parte (2026-10-25)*: ✔ el Misil elemental: el cartel «¿de qué elemento?» con los seis antes de cobrar; elegida Ponzoña, cobró 3 No2, la Mesa lo anuncia y el duelo es el de la Ponzoña: 2d6+5 (¼ del Ef.Esp), «Defensa especial 4 → entran 11», «Veneno ×4 (por 11 de daño: Veneno: 2, y uno más cada 5)». Falta: los otros cinco sueltos (Centella es como Zap). *Y la tarde:* ✔ Lengua de fuego (daño de fuego y «Quemadura (3 turnos)» en la ficha), ✔ Dardo helado («Escarcha ×3 (por 13 de daño: 1, y una más cada 5)»), ✔ Misil arcano («directo: no lo frena su Defensa especial»). Sin probar sueltos, porque usan piezas ya probadas: Centella (la de Zap) y Mancha corrosiva (la de Corroer; no se probó para no romperle el equipo a juan).
- [x] **✨ Purificar (Support, 2026-10-25)**: a un creep aliado con dos estados malos y herido: le saca el más reciente y lo cura 5; sobre sí mismo también. Es Flash: usarla en el turno de juan y ver que cuesta el doble. — *probado (2026-10-25)*: ✔ en turno ajeno: «cuesta el doble (4 SP)»; a la Bruja: «le sacó Debilitado» y «+5 HP (20 → 25)».
- [x] **👁 Cegar (Debuffer, 2026-10-25)**: PdG.Esp contra la Res.Esp de juan; si gana, 2d4 arcano y Ceguera 1 turno: su mapa ve solo 2 casillas y su PdG sale a la mitad. — *probado (2026-10-25, tarde)*: ✔ 10 de daño (21 → 11) y Ceguera 1 turno en su ficha; en la pantalla de juan, la Bruja (a más de 2 casillas) se ve como «?». La partida no tiene niebla: la vista de 2 casillas se nota con niebla.
- [x] **☠ Hoja envenenada / Mordisco infectado (choque liviano, 2026-10-25)**: un creep ataca a juan: la Hoja declara Perfora 2 y, si pega, Veneno 3 en su ficha (3, 2, 1); el Mordisco infectado, lo mismo (es la versión bestia). — *probado (2026-10-26, Claude, dos pantallas en «Claude · pruebas»: el GM y Saulo-Prueba con juan; la Bruja del pantano usando cada una)*: ✔ «perfora 2» en la declaración; pegó y juan recibió Veneno ×3 en su ficha. El Mordisco infectado es el mismo mecanismo (no se corrió aparte). · **2.ª vuelta (2026-10-26, con la pantalla del jugador a la vista, clics y arrastres reales)**: ✔ el Mordisco infectado (el Escarabajo, bestia): Perfora 2 y Veneno.
- [x] **🌀 Portal trampa (Mago, 2026-10-25)**: un creep lo coloca (el GM marca la casilla y el destino a 4 o menos); juan lo pisa: la tirada de Res.Esp contra el Ef.Esp del creep; si pierde, el portal lo lleva y llega Expuesto; si gana, «se aferra al suelo». Que juan no lo vea hasta pisarlo (o detectarlo con Percepción). — *probado (2026-10-26, Claude, dos pantallas en «Claude · pruebas»: el GM y Saulo-Prueba con juan; la Bruja del pantano usando cada una)*: ✔ juan no lo veía; al pisarlo, Res.Esp 5 contra 16 → el portal se lo llevó a la casilla marcada y llegó Expuesto. Falta: ganar la tirada («se aferra») y detectarlo con Percepción. · **2.ª vuelta (2026-10-26, con la pantalla del jugador a la vista, clics y arrastres reales)**: ✔ arrastrando a juan encima: no lo veía, «juan pisó «Portal»», Res.Esp 4 contra 16, lo llevó a la casilla marcada, Expuesto. Ganar la tirada no se puede ver (16 contra 1d6). · **3.ª vuelta (2026-10-26, lo que faltaba)**: ✔ ganar la tirada (la Bruja con Especial 1 un momento): «se aferra al suelo… ¡LO RESISTIÓ!», el portal no lo llevó.
- [x] **🪶 Levitar (Support, 2026-10-25)**: un creep se lo da a otro creep aliado: queda Levitando; moverlo por hielo, aceite o una trampa sin que lo afecten, pasar por encima de un token, el primer casillero gratis y Evasión +3 en un duelo. — *probado (2026-10-26, Claude, dos pantallas en «Claude · pruebas»: el GM y Saulo-Prueba con juan; la Bruja del pantano usando cada una)*: ✔ a un creep aliado: Levitando 2 turnos (vuela, +3 Evasión, primer casillero gratis) con su Anuncio de buff. Falta: caminar por hielo, aceite o una trampa. · **2.ª vuelta (2026-10-26, con la pantalla del jugador a la vista, clics y arrastres reales)**: ✔ el Escarabajo levitando cruzó un suelo congelado sin tirada. **Arreglado**: el hielo salía «del aire» (la zona que deja un área de creep perdía su altura y su dueño por un comentario mal puesto) y quien vuela, parado en una zona del piso, igual tiraba.
- [x] **😱 Grito de pánico (Debuffer, 2026-10-25)**: un creep con juan y Clementino a 3 casillas o menos: un duelo por cada uno (PdG.Esp contra Res.Mt, sin dodge); al que pierde, 1d6 arcano y Miedo; a los creeps aliados, nada. — *probado (2026-10-26, Claude, dos pantallas en «Claude · pruebas»: el GM y Saulo-Prueba con juan; la Bruja del pantano usando cada una)*: ✔ un duelo por cada uno (juan y Clementino), PdG.Esp contra Res.Mt sin dodge roll; daño y Miedo a los dos; a los creeps aliados, nada.
- [x] **🔁 Ráfaga encadenada (Rango, 2026-10-25)**: un arquero creep la prepara (sin gastar el ataque) y dispara tres veces a juan: el 2.º declara «repetición (+1)» con un dado más, el 3.º +2 y dos dados; la Mesa cuenta «disparo 1/2 de la Ráfaga encadenada» y «último disparo»; si cambia de blanco, «se cortó». — *probado (2026-10-26, Claude, dos pantallas en «Claude · pruebas»: el GM y Saulo-Prueba con juan; la Bruja del pantano usando cada una)*: ✔ Repitiendo; el 2.º disparo «repetición (+1): +1 PdG, +1d6», el 3.º +2/+2d6; la Mesa «disparo 1/2…» y «último disparo». Arreglado: decía «+2 dado». Falta: cambiar de blanco («se cortó»). · **2.ª vuelta (2026-10-26, con la pantalla del jugador a la vista, clics y arrastres reales)**: ✔ cambiar de blanco: «se cortó la Ráfaga encadenada» y el segundo disparo sin el +1.
- [x] **☀ Smite (Support, 2026-10-26)**: un creep se lo tira a juan: el daño entra sin esquivar (2d4 de luz directo); juan tira Res.Esp contra el Ef.Esp: si pierde, Marcado; si gana, solo el daño. Contra un no-muerto, ×1,5. — *probado (2026-10-26, Claude, dos pantallas en «Claude · pruebas»: el GM y Saulo-Prueba con juan; la Bruja del pantano usando cada una)*: ✔ si pierde: 7 de luz directo y «la luz lo deja Marcado»; si gana la Res.Esp: el daño igual (5) y sin Marcado. Falta: contra un no-muerto. · **2.ª vuelta (2026-10-26, con la pantalla del jugador a la vista, clics y arrastres reales)**: ✔ contra un no-muerto: 6 → 9 (×1,5) y Marcado. **Arreglado** el texto: decía «9 − la luz le pega ×1,5 = 9» (como resta).
- [x] **🎯 Tiro al arma (Rango, 2026-10-26)**: un arquero creep le dispara a juan: +2 PdG en la declaración; si pega, la ruleta y el arma de juan en el piso a 2 casillas; juan queda ✋ sin arma hasta levantarla. — *probado (2026-10-26, Claude, dos pantallas en «Claude · pruebas»: el GM y Saulo-Prueba con juan; la Bruja del pantano usando cada una)*: ✔ +2 PdG; contra Clementino se le cayó el Cuchillo de cocina a 2 casillas (se ve en el piso). Contra juan sin arma: «no tenía un arma en la mano».
- [x] **🌬 Ráfaga de viento (Mago, 2026-10-26)**: un mago creep mirando hacia juan: el cono; si no esquiva, 1d6 arcano, lo empuja 3 (y el choque) y queda Sentado. — *probado (2026-10-26, Claude, dos pantallas en «Claude · pruebas»: el GM y Saulo-Prueba con juan; la Bruja del pantano usando cada una)*: ✔ el cono mirando a juan: 5 de daño, empujado (chocó contra un muro de prueba: 9 de choque) y Sentado.
- [x] **💥 Nova arcana (Mago, 2026-10-26)**: un mago creep rodeado por juan y un aliado: la onda tira su PdG.Esp contra la Evasión de juan (el aliado no entra); si no esquiva, 2d6 arcano y lo empuja 2 (y el choque si hay algo detrás). — *probado (2026-10-26, Claude, dos pantallas en «Claude · pruebas»: el GM y Saulo-Prueba con juan; la Bruja del pantano usando cada una)*: ✔ la onda: juan (7 + empujado y choque) y Clementino (8 + empujado 2); los aliados de la Bruja, nada.
- [x] **😤 Tirar la bronca (Support, 2026-10-26)**: un creep support la usa sobre un creep aliado con juan a 3 o menos: el clic del aliado, el área alrededor de él, juan tira Res.Mt; si no resiste, Provocado por ese aliado. Al empezar el turno de juan (con el orden de turnos), el Anuncio «Estás provocado por…» en la pantalla de juan; al Aceptar, el aliado brilla en rojo en todas las pantallas hasta que pasa el turno. — *probado (2026-10-26, Claude, dos pantallas en «Claude · pruebas»: el GM y Saulo-Prueba con juan; la Bruja del pantano usando cada una)*: ✔ el clic del aliado (el Escarabajo), el área alrededor de él: juan, Clementino y el Lobo Provocados por él. **Error encontrado y arreglado**: el Anuncio propio se pisaba con «Empieza tu turno» y con el Anuncio viejo del Provocado y no llegaba; ahora hay uno solo (el de siempre, js/04) que dice «Estás provocado por Escarabajo de cobre» y, al Aceptar, el Escarabajo brilla en rojo (visto en la pantalla del GM). · **2.ª vuelta (2026-10-26, con la pantalla del jugador a la vista, clics y arrastres reales)**: ✔ **cambio pedido por el dueño**: «Estás provocado por Escarabajo de cobre» va como primer paso de «▶ Empieza tu turno» (un solo reporte); al «✔ Aplicar», el Escarabajo brilla y no sale otro Anuncio.
- [x] **🏹 Tiro que derriba (Rango, 2026-10-26)**: un arquero creep le dispara a juan: si pega, juan sale empujado 1 casilla (y el choque si hay algo detrás) y queda Sentado. — *probado (2026-10-26, Claude, dos pantallas en «Claude · pruebas»: el GM y Saulo-Prueba con juan; la Bruja del pantano usando cada una)*: ✔ pegó: empujado 1 casilla y Sentado en su ficha.
- [x] **✨ Parpadeo (Mago, 2026-10-26)**: un mago creep pegado a juan: desde sus Acciones y desde el botón ✨ del GM (en turno de juan, el doble): el clic de la casilla (a 3 o menos, libre) y aparece ahí, sin que juan tenga ataque de oportunidad. — *probado (2026-10-26, Claude, dos pantallas en «Claude · pruebas»: el GM y Saulo-Prueba con juan; la Bruja del pantano usando cada una)*: ✔ desde sus Acciones, pegada a juan: se teletransportó a 3 casillas, sin ataque de oportunidad; en turno ajeno, el doble de cooldown.
- [x] **🎯 Aguja siniestra (Debuffer, 2026-10-26)**: un creep se la tira a juan: PdG.Esp contra Evasión; si pega, 1d6 siniestro directo (sin Defensa especial), Herida sombría y Punto débil 2 turnos; después, un golpe a juan que antes no era crítico por su resistencia, ahora sí. — *probado (2026-10-26, Claude, dos pantallas en «Claude · pruebas»: el GM y Saulo-Prueba con juan; la Bruja del pantano usando cada una)*: ✔ PdG.Esp contra Evasión; 1 siniestro directo y Punto débil 2 turnos (−1 a las cinco resistencias a crítico). Falta: ver el crítico que antes no entraba. · **2.ª vuelta (2026-10-26, con la pantalla del jugador a la vista, clics y arrastres reales)**: ✔ contra un no-muerto: 0 de daño (lo siniestro no le hace nada). El crítico que antes no entraba: juan no tiene Resistencia a crítico, no se puede ver con él. · **3.ª vuelta (2026-10-26, lo que faltaba)**: ✔ el crítico contra un creep con Punto débil: «Nivel 2 − Resistencia 1 = 1 → ¡ES CRÍTICO!», ×3, 18 de daño.
- [x] **💨 Dash (creep y Asalto, 2026-10-26)**: (1) un creep sin nadie delante: el clic de la dirección, avanza 3 sin oportunidad; cobra 1 No2 (no lo de un ataque). (2) con juan en el camino: queda antes de juan, el duelo (+2 PdG y, si para con Parry, +1 a la Fuerza del golpe contra el Bloqueo; objetivo fijo, cobra lo de un ataque); si juan lo para con Parry, se queda ahí; si no, termina detrás de juan. (3) lo mismo con el Dash de un personaje Asalto desde su Botonera (una ficha vieja con Dash, al abrirla, toma la versión nueva). — *probado (2026-10-26, Claude, dos pantallas en «Claude · pruebas»: el GM y Saulo-Prueba con juan; la Bruja del pantano usando cada una)*: ✔ (creep) sin nadie delante: avanzó; con juan en el camino: +2 PdG, pegó, «pasa de largo y termina detrás de juan». Falta: que lo pare con Parry (y el +1 a la Fuerza), y el del Asalto (personaje). · **2.ª vuelta (2026-10-26, con la pantalla del jugador a la vista, clics y arrastres reales)**: ✔ contra un rival con Parry (el Escarabajo, cuerpo a cuerpo): «Fuerza del golpe 1d10+1» y «juan lo paró — se queda antes de pasarlo». ✔ el del Asalto (juan, desde su Botonera): +2 PdG, 1 No2 más lo del ataque (8 → 5), «pasa de largo y termina detrás». **Arreglado**: un Dash cancelado quedaba pendiente y el próximo ataque de ese creep lo hacía saltar al final del camino.
- [x] **👁 Ojo de asesino (Choque liviano y Asalto, 2026-10-26)**: un creep lo usa contra juan: va al duelo como un ataque con +1 PdG, +2 al daño y +1 a los dos críticos (cobra lo de un ataque y 2 SP). Lo mismo con un personaje Asalto, y que su copia vieja (el buff) quede reemplazada sola. — *probado (2026-10-26, Claude, dos pantallas en «Claude · pruebas»: el GM y Saulo-Prueba con juan; la Bruja del pantano usando cada una)*: ✔ el del creep: «+1 PdG · +2 de daño fijo · Crítico frecuente +1 · Crítico potente +1», 2d6+5; el de juan (Asalto, la copia vieja): la Botonera ya lo muestra como ataque y la declaración trae los mismos bonos (la copia guardada se termina de actualizar cuando se guardan sus habilidades). · **2.ª vuelta (2026-10-26, con la pantalla del jugador a la vista, clics y arrastres reales)**: ✔ el de juan desde su Botonera: la declaración trae +1 PdG, +2, los críticos; el daño «1d4 + 3 + 2».
- [x] **🦶 Pisotón (Choque pesado, 2026-10-26)**: un creep pegado a juan y a otro personaje, desde sus Acciones y desde el botón ✨ del GM (en turno de juan, el doble): cada uno elige Res.CC o Evasión; con Res.CC ganada no le pasa nada; con Evasión ganada, el dodge roll (salir de al lado); al que pierde, la diferencia de daño directo (sin restar Defensa) y Pajaritos 2 turnos. — *probado (2026-10-26, Claude, dos pantallas en «Claude · pruebas»: el GM y Saulo-Prueba con juan; la Bruja del pantano usando cada una)*: ✔ desde el botón ✨ (en turno ajeno, el doble): juan y Clementino eligen Res.CC o Evasión; con Res.CC ganada, nada; con Evasión perdida, la diferencia (1) directa y Pajaritos 2; con Evasión ganada, el dodge roll y «logró salir del área: esquivó». · **2.ª vuelta (2026-10-26, con la pantalla del jugador a la vista, clics y arrastres reales)**: ✔ juan eligió Evasión, ganó, lo arrastré 2 casillas, «Ya se movió: revisar» → «logró salir del área: esquivó». (Detalle de uso anotado en pendientes: después de moverse, el cartel sigue diciendo «Arrastrá…» con «No me quiero mover».) · **3.ª vuelta (2026-10-26, lo que faltaba)**: ✔ **cambio pedido por el dueño**: al soltar el arrastre se revisa solo («logró salir del área: esquivó»), sin abrir el duelo.
- [x] **🤺 Finta (Choque liviano, 2026-10-26)**: un creep le pega a juan: la declaración dice +2 al daño, +1 a los críticos y «no se puede parrear»; juan no tiene el botón de Parry (solo esquivar). — *probado (2026-10-26, Claude, dos pantallas en «Claude · pruebas»: el GM y Saulo-Prueba con juan; la Bruja del pantano usando cada una)*: ✔ la declaración: +2 al daño, +1 a los críticos y «no se puede parrear»; juan y Clementino solo tenían Evasión. Falta: con un rival que sí tenga Parry. · **2.ª vuelta (2026-10-26, con la pantalla del jugador a la vista, clics y arrastres reales)**: ✔ con el Escarabajo (que tiene Parry con su escudo): con Finta solo Evasión; con un ataque común, «Parry · Escudo de acero laminado».
- [x] **☀ Luz para los suyos (Support, 2026-10-26)**: un creep la enciende sobre juan (y un creep aliado adentro): se ilumina y aparece lo oculto (sigilo, trampas); juan tira Res.Esp contra el Ef.Esp; si no resiste, 1d8 de luz directo y Marcado 2 turnos; el creep aliado no recibe nada; se va a los 2 turnos. — *probado (2026-10-26, Claude, dos pantallas en «Claude · pruebas»: el GM y Saulo-Prueba con juan; la Bruja del pantano usando cada una)*: ✔ sobre juan con el Escarabajo adentro: juan tiró Res.Esp (no resistió): 2 de luz y Marcado; al creep aliado, nada. Arreglado: el resumen decía «Marcado (la luz) · Marcado» (lo ponía dos veces). Falta: que aparezca lo oculto. · **2.ª vuelta (2026-10-26, con la pantalla del jugador a la vista, clics y arrastres reales)**: ✔ ahora deja ver lo oculto: Clementino en sigilo, la Luz sobre él y el GM lo ve. **Arreglado**: le faltaba `revela`, y la luz (o la visión de lo oculto de los creeps) no le mostraba al GM un personaje en sigilo. · **Rehecha el mismo día (dueño: un destello, no una zona)** y probada: el fogonazo, juan (en sigilo) Marcado y a la vista, su cepo descubierto, sin zona; la tirada del daño y «💔 Aplicar el daño» (30 → 28).
- [x] **🧊 Prisión de hielo (Mago, 2026-10-26)**: un creep se la tira a juan: PdG.Esp contra Evasión; si pega, 2d4 de hielo e Inmovilizado; al empezar su turno, Fuerza contra el Ef.Esp del creep (y la ayuda de un aliado pegado). — *probado (2026-10-26, Claude, dos pantallas en «Claude · pruebas»: el GM y Saulo-Prueba con juan; la Bruja del pantano usando cada una)*: ✔ PdG.Esp contra Evasión: 3 de hielo e Inmovilizado 2 turnos. Falta: la tirada para soltarse al empezar su turno. · **2.ª vuelta (2026-10-26, con la pantalla del jugador a la vista, clics y arrastres reales)**: ✔ al empezar el turno de juan: «Tirá Fuerza contra 16» → «no se soltó: sigue atrapado». **Arreglado**: el cartel ofrecía soltarse de un estado que se terminaba en ese mismo inicio.
- [x] **🌑 Maldición debilitante (Debuffer, 2026-10-26)**: un creep se la tira a juan: PdG.Esp contra Res.Esp; si gana, 1d6 siniestro (Herida sombría si entra), Debilitado (−1 a todo en sus tiradas) y Lento 2 turnos; una segunda, −2. — *probado (2026-10-26, Claude, dos pantallas en «Claude · pruebas»: el GM y Saulo-Prueba con juan; la Bruja del pantano usando cada una)*: ✔ PdG.Esp contra Res.Esp: 5 siniestro, Debilitado y Lento 2 turnos. Falta: la segunda (−2). · **2.ª vuelta (2026-10-26, con la pantalla del jugador a la vista, clics y arrastres reales)**: ✔ la segunda: Debilitado con 2 stacks («−1 por cada stack»).
- [x] **📌 Clavar a la pared (Rango, 2026-10-26)**: un arquero creep le dispara a juan con una pared o un Sólido a 1 o 2 casillas detrás: +3 PdG en la declaración; si pega, lo empuja hasta chocar, el daño de colisión y Inmovilizado 3 turnos; al empezar su turno, la tirada de Fuerza contra el PdG. Sin nada detrás, lo empuja 3 y nada más; contra otro token, solo el choque. — *probado (2026-10-26, Claude, dos pantallas en «Claude · pruebas»: el GM y Saulo-Prueba con juan; la Bruja del pantano usando cada una)*: ✔ +3 PdG; sin nada detrás, lo empujó 3 (sin clavar); con un muro de prueba detrás: empujado 1, choque (4) y «quedó clavado: Inmovilizado 3 turnos, se suelta con Fuerza contra 6». Arreglado: decía «2 Constituciónes». · **2.ª vuelta (2026-10-26, con la pantalla del jugador a la vista, clics y arrastres reales)**: ✔ la tirada de soltarse al empezar el turno es la misma que la de la Prisión de hielo (probada).
- [x] **🗡 Degollar (Choque liviano, 2026-10-26)**: con el orden de turnos armado, un creep degüella a juan: la declaración dice +4 PdG, +7 y los críticos; al resolverse, el turno pasa al siguiente y el creep queda al final del orden; queda Expuesto (su Evasión a la mitad si juan le pega antes de su próximo turno). — *probado (2026-10-26, Claude, dos pantallas en «Claude · pruebas»: el GM y Saulo-Prueba con juan; la Bruja del pantano usando cada una)*: ✔ +4 PdG, +7, los críticos; Expuesto en la Bruja y «pasa al final del orden de turnos». Falta: usarlo en su propio turno (que pase el turno). · **2.ª vuelta (2026-10-26, con la pantalla del jugador a la vista, clics y arrastres reales)**: ✔ en su propio turno: «termina su turno y pasa al final del orden», el turno pasó solo (empezó la ronda siguiente).
- [x] **🐛 Sanguijuela (Debuffer, 2026-10-26)**: un creep se la lanza a juan: PdG.Esp contra Evasión; si pega, 2d6 siniestro, el creep se cura la mitad, juan queda con Sanguijuela (y Herida sombría); una poción o una cura no le entran («no se cura»); al empezar su turno, la tirada de Fuerza contra el Ef.Esp para arrancarla. — *probado (2026-10-26, Claude, dos pantallas en «Claude · pruebas»: el GM y Saulo-Prueba con juan; la Bruja del pantano usando cada una)*: ✔ PdG.Esp contra Evasión: 10 siniestro directo, Sanguijuela 4 turnos y Herida sombría; la Bruja «se cura 2» (estaba llena). Falta: que una poción no le entre y la tirada para arrancarla. · **2.ª vuelta (2026-10-26, con la pantalla del jugador a la vista, clics y arrastres reales)**: ✔ una Poción de HP no le entra (15 → 15) y la tirada para arrancarla al empezar su turno («no se soltó de Sanguijuela, 2 contra 16»). **Arreglado**: el aviso de la poción decía «+25 HP»; ahora «❌ no se cura (Herida sombría o Sanguijuela)».
- [x] **☀🌑 Daño de luz y siniestro (2026-10-26)**: una habilidad o zona de luz deja Marcado al que recibe daño (y a un no-muerto le pega ×1,5); una siniestra deja Herida sombría (no se cura hasta el final de su próximo turno; a un no-muerto o demonio no le hace nada). Las Res. luz y Res. siniestro se ven en la Botonera, la ficha lite y GM Tools. — *probado (2026-10-26, Claude, dos pantallas en «Claude · pruebas»: el GM y Saulo-Prueba con juan; la Bruja del pantano usando cada una)*: ✔ lo de luz deja Marcado (Smite, Luz para los suyos) y lo siniestro Herida sombría (Sanguijuela, Aguja). Falta: los no-muertos y demonios, y las Res. en la Botonera. · **2.ª vuelta (2026-10-26, con la pantalla del jugador a la vista, clics y arrastres reales)**: ✔ contra un no-muerto: la luz ×1,5, lo siniestro 0; la Botonera de juan muestra «☀ Luz» y «🌑 Siniestro» en sus resistencias. Falta: un demonio. · **3.ª vuelta (2026-10-26, lo que faltaba)**: ✔ contra un demonio (el Escarabajo como demonio un momento): la luz ×1,5 y lo siniestro 0.
- [x] **💪 Empuje (Support, 2026-10-26)**: con el botón ✨ del GM, un creep le da Empower a un aliado (y en turno ajeno, el doble de costo); la próxima tirada de ese aliado (atacar, esquivar) suma +3 y lo gasta; la siguiente ya no. — *probado (2026-10-26, Claude, dos pantallas en «Claude · pruebas»: el GM y Saulo-Prueba con juan; la Bruja del pantano usando cada una)*: ✔ con el botón ✨ (ahora en dos pasos: la habilidad y después a quién). **Error encontrado y arreglado**: a un creep aliado quedaba «sumale +3 a mano»; ahora le pone Empower y su próxima tirada lo usa («Afectada por Empower», Esquivar 1d3 → 1d6) y se gasta.
- [x] **☠ Nube tóxica (Debuffer, 2026-10-26)**: un creep la deja sobre juan (dentro de su Rango): la tirada de su Ef.Esp contra la Res.Esp de juan apenas aparece; si no resiste, 1d4 tóxico directo y Veneno 3; al pasar de ronda adentro, no le vuelve a tirar si ya quedó envenenado; un creep aliado adentro no recibe nada; se va a los 3 turnos. — *probado (2026-10-26, Claude, dos pantallas en «Claude · pruebas»: el GM y Saulo-Prueba con juan; la Bruja del pantano usando cada una)*: ✔ sobre juan: la tirada al aparecer (Res.Esp 5 contra Ef.Esp 11), 2 de daño tóxico y Veneno ×3 (que pega 3 en el acto, como todo estado nuevo). Falta: la ronda siguiente adentro. · **2.ª vuelta (2026-10-26, con la pantalla del jugador a la vista, clics y arrastres reales)**: ✔ con clic real (juan caminó adentro): Res.Esp 1 contra 4, 4 tóxico y Veneno. Falta: la ronda siguiente adentro. · **3.ª vuelta (2026-10-26, lo que faltaba)**: ✔ la ronda siguiente adentro. **Arreglado**: a juan, ya envenenado, la nube le volvía a tirar en el cambio de ronda (las zonas con daño se revisaban siempre); ahora el estado lleva `unaVez` y, una vez puesto, la zona no le tira más. De paso, **la Luz para los suyos** también le tiraba en el cambio de ronda (su texto dice «cuando aparece o entra»): ahora `zonaEnMantenimiento: false`. Probado con las dos nuevas sobre juan: una tirada de cada una al aparecer y nada al pasar de ronda. · **Afinada con el dueño el mismo día** (2d4, 4 turnos, quedarse adentro resetea el Veneno a 3) y probada: 5 tóxico y Veneno 3 al aparecer; en el cambio de ronda, sin tirada, el Veneno vuelve a 3 (Crónica y Mesa).
- [x] **🎯 Tiro certero (Rango, 2026-10-26)**: un creep con arco le dispara a juan: el duelo con +1 PdG, Perfora 3 (en el daño, 3 puntos pasan la Defensa) y, si es crítico, 2 de Resistencia a crítico menos; cobra lo de un ataque y 2 SP (o cooldown 2). — *probado (2026-10-26, las dos pantallas en «Claude · pruebas»)*: ✔ la declaración con +1 PdG, «ignora 2 de Res. a crítico» y «perfora 3»; pegó: 1d6+11 = 12 − Defensa 1 = 11 (con Defensa 1 la Perfora no cambia nada: es la misma regla de Tajear, ya probada).
- [x] **🏹 Abanico (Rango, 2026-10-26)**: un creep con arco, mirando hacia juan y otro personaje: el cono al frente, su PdG una sola vez contra la Evasión de cada uno (sin dodge), el daño de su arma a los que pega; un creep aliado en el cono no recibe nada; cobra lo de un ataque y 3 SP (o cooldown 3). — *probado (2026-10-26, las dos pantallas en «Claude · pruebas»)*: ✔ la Bruja mirando a juan: el cono, su PdG una vez contra la Evasión de juan (2 contra 4, la esquivó); el Tótem de la Bruja, en el cono, no entró (aliado); el daño es el de su arma (2d6 + 3, físico).
- [x] **🌩 Tormenta arcana (Mago, creep, 2026-10-26)**: un creep marca el centro sobre juan y otro personaje, con un creep aliado adentro: el reparto al azar en la Mesa (también al aliado), el dodge roll de cada uno y, al que sigue adentro, k × (1d4+1) directo; cobra 5 No2 y 15 SP (o cooldown 4). — *probado (2026-10-26, las dos pantallas en «Claude · pruebas»)*: ✔ centrada en juan con el Escarabajo adentro: 5 proyectiles a juan y 1 al Escarabajo (aliados incluidos), el dodge roll de cada uno, 5d4+5 = 18 directo a juan y 1d4+1 = 4 al Escarabajo.
- [x] **🪨 Cascotazo (Mago, 2026-10-26)**: un creep se lo tira a juan (con el orden de turnos armado, juan todavía sin actuar): su PdG contra la Evasión, 2d6 + su Ef.Esp físico (menos la Defensa) y juan baja 2 lugares en el orden; si es crítico, como un arma de Tipo 10. Probar también con juan que ya actuó (no pasa del que tiene el turno). — *probado (2026-10-26, las dos pantallas en «Claude · pruebas»)*: ✔ PdG contra Evasión, 2d6+16 (el Ef.Esp de esta Bruja es 16) − Defensa 1 = 23, y Demora 2: juan del 2.º al 4.º.
- [x] **⛈ Maldición tormentosa (Debuffer, creep, 2026-10-26)**: un creep se la echa a juan: su PdG.Esp contra la Res.Esp, 1d6 siniestro y Atormentado 3 turnos; después juan ataca (le saca vida al pagar los No2) y se mueve 4 casillas (pierde 2); cobra 2 No2 y 5 SP (o cooldown 3). — *probado (2026-10-26, las dos pantallas en «Claude · pruebas»)*: ✔ PdG.Esp contra Res.Esp, 1d6 siniestro (Herida sombría) y Atormentado 3 turnos en la ficha de juan.
- [x] **😮‍💨 Robar el aliento (Debuffer, 2026-10-26)**: un creep se la echa a juan: su PdG.Esp contra la Res.Esp, 1d6 siniestro y juan pierde 2 No2 + la diferencia (nunca menos de 0); con una diferencia grande, queda en 0 y Sentado; a otro creep (de un personaje) también; cobra 2 No2 y 3 SP (o cooldown 3). — *probado (2026-10-26, las dos pantallas en «Claude · pruebas»)*: ✔ PdG.Esp contra Res.Esp, 1d6 siniestro y −3 No2 (2 + la diferencia 1): 5 → 2.
- [x] **😡 Furia (Choque pesado, 2026-10-26)**: un creep la usa: Enfurecido (+3 PdG, +4 al daño, −2 Evasión, −2 Defensa) en sus Acciones y en el duelo siguiente; dura su turno y 2 completos más; cobra 2 No2 y 2 SP (o cooldown 3). — *probado (2026-10-26, las dos pantallas en «Claude · pruebas»)*: ✔ Enfurecido (+3 PdG, +4 al daño, −2 Evasión, −2 Defensa, 2 turnos completos); cobró 2 SP y 2 No2.
- [x] **😤 Golpe desesperado (Choque liviano, 2026-10-26)**: un creep con la vida llena, a la mitad y a un cuarto le pega a juan: +1/+1/+1, +2/+2/+3 y además +2 PdG (la Crónica lo dice); cobra lo de un ataque y 3 SP (o cooldown 2). — *probado (2026-10-26, las dos pantallas en «Claude · pruebas»)*: ✔ con la vida llena: +1 a los dos críticos y +1 al daño; con 15 de 65 (un cuarto o menos): +2 PdG, +2, +2 y +3 (la Crónica lo dice).
- [x] **💥 Takle (Choque pesado, 2026-10-26)**: con el botón ✨ (Flash) en el turno de juan y en el del creep: corre hasta 2 y queda pegado (sin No2 ni oportunidad; no pasa paredes); Con +2 contra Con; si gana: juan pierde 3 No2, sale empujado 2 y se le corta el turno (al final del orden); con juan último, pierde el turno. — *probado (2026-10-26, las dos pantallas en «Claude · pruebas»)*: ✔ con el botón ✨ (Flash, en turno ajeno 6 SP): corre 2 casilleros gratis y queda pegado; Con +2 contra Con; ganó: juan −3 No2, empujado 2 (2,-4 → 4,-3) y al final del orden. **Arreglado**: con el ✨ el objetivo viene elegido y se salteaba la carrera.
- [x] **💨 Envión (Support, 2026-10-26)**: con el botón ✨ (Flash) a un creep aliado y a sí mismo: el escudo de 10 (se gasta con un golpe; otro Envión lo deja en 10) y sube 1 lugar en el orden (no pasa por encima del que tiene el turno). — *probado (2026-10-26, las dos pantallas en «Claude · pruebas»)*: ✔ con el ✨ de la Bruja al Escarabajo: Envión (🛡10, se gasta) y sube del 5.º al 4.º. **Arreglado**: el ✨ ofrecía el Tótem y el Estandarte.
- [x] **🎯 ¡Al frente! (Support, 2026-10-26)**: elige a un creep aliado en su Rango (no a sí mismo) y una casilla libre pegada a juan, a 4 o menos: aparece ahí con Al frente (+2 PdG y +2 Evasión hasta el final de su próximo turno); una casilla no pegada a un rival, la rechaza. — *probado (2026-10-26, las dos pantallas en «Claude · pruebas»)*: ✔ rechaza una casilla no pegada a un rival («Tiene que ser una casilla pegada a un rival»); el Escarabajo aparece 4 casillas más allá pegado a juan con Al frente; Crónica y Mesa.
- [x] **💨 Bomba de humo (Choque liviano y el Asalto, 2026-10-26)**: un creep la usa a la vista de juan: el humo de diámetro 3 (1 turno), Sigilo y el cartel de moverse 3 gratis sin oportunidad; juan desde afuera no lo ve; pegado, lo descubre. La de clase desde la Botonera de juan (2 casillas). Cobra 3 No2 y 3 SP (o cooldown 3). — *probado (2026-10-26, las dos pantallas en «Claude · pruebas»)*: ✔ el creep: humo de 7 casillas, 1 turno, Sigilo y el cartel de 3 casilleros; pegado a juan, lo descubre; a 2, juan no lo ve (queda el «?»). **Arreglado**: el cono de detección veía a través del humo. ✔ la de clase desde la Botonera de juan (sin No2: «Realizar de cualquier modo» y la línea roja): humo, Sigilo y 2 casilleros.
- [x] (2026-10-26, probado por Claude en «Claude · pruebas»: la Bruja pegada a juan, la declaración «+2 de daño fijo», falló 1 contra 4, el cartel «se aleja», 2 casilleros sin gastar No2 y sin ataque de oportunidad; la habilidad se le sacó después) **💨 Disparo y repliegue (Rango, 2026-10-26)**: un arquero creep le dispara a juan: la declaración dice +2 al daño; pegue o no, el cartel para alejarse hasta 2 casilleros gratis, sin que juan tenga ataque de oportunidad aunque esté pegado.
- [x] **🏹 Flecha que atraviesa (Rango, 2026-10-25)**: un arquero creep con juan delante y otro personaje (o un creep aliado) detrás en línea: el disparo declara +2 al daño; al terminar con juan, sigue al de atrás con la misma tirada. — *probado (2026-10-25)*: ✔ el Goblin le tira a Clementino con juan detrás en la línea; al terminar, se abre solo «Flecha que atraviesa (atravesó a Clementino)» contra juan con la misma tirada (6), y la Mesa: «atraviesa a Clementino y sigue hacia juan: misma tirada de PdG, daño entero, sin efectos especiales».
- [x] **✨ Andanada arcana (Mago, 2026-10-25)**: tres misiles de a uno: el primero a juan con su duelo (PdG.Esp contra Evasión, 1d6 + ¼ Ef.Esp arcano); al terminar, elegir a quién va el segundo y el tercero (también el mismo). — *probado (2026-10-25, tarde)*: ✔ el primer misil «1d6+5» (¼ del Ef.Esp en cada uno), 10 de daño; después «Andanada arcana: misil 2 de 3 — ¿a quién? (puede ser el mismo) · Esc: ese misil no sale»; con Esc, «Ese misil no salió».
- [x] **🔥 Frenesí inducido (Support, 2026-10-25)**: a un aliado creep: se cura 4 en el momento y queda Frenético 2 turnos completos (al empezar cada uno de sus turnos, otros 4); su ataque siguiente con +3 PdG y +5 al daño, y su Evasión y Defensa −2 al defenderse. — *probado (2026-10-25)*: ✔ el Escarabajo a la Bruja: 16 → 20 de vida al ponérselo y Frenético 2 turnos con sus seis modificadores. Visto: el anuncio no dice la cura (a decidir si se suma). Falta: los 4 al empezar su turno. *Y la tarde:* ✔ el anuncio ya dice «y se cura 4 ahora y al empezar cada uno de sus turnos»; el aviso de abajo dice «le dio Redoble de tambores a…» en vez de «Pegó».
- [x] **🥵 Extenuar (Debuffer, 2026-10-25)**: PdG.Esp contra la Res.Esp de juan; si gana, 2d4 arcano (menos su Defensa especial) y Extenuado 2 turnos: su ataque y el moverse le cuestan 1 No2 más. — *probado (2026-10-25, tarde)*: ✔ PdG.Esp contra Res.Esp; 9 de daño arcano (30 → 21) y «le llegó a su ficha: Extenuado (2 turnos)».
- [x] **🏹 Mantener a raya (Rango, 2026-10-25)**: un arquero creep contra juan: el ataque declara +2 al daño; si pega, juan se corre 2 casillas lejos del arquero (contra una pared: la colisión) y queda Lento 2 turnos. — *probado (2026-10-25)*: ✔ el Goblin con un arco de prueba contra juan: «+2 de daño fijo» en la declaración; ✔ Empujón «lo empujó 2 casilleros» (de 6,0 a 5,−2, lejos del tirador) y Lento 2 turnos en la ficha de juan.
- [x] **🌨 Lluvia de escarcha (Mago, 2026-10-25)**: el área de diámetro 5 en su Rango; PdG.Esp contra la Evasión de cada uno con dodge roll; 2d4 + ¼ Ef.Esp de hielo; el suelo congelado (celeste, con la franja) 2 turnos, la tirada de Agilidad al aparecer y por cada paso; al irse, el charco. Y la **Varita de la ventisca** con 2d4. — *probado (2026-10-25)*: ✔ el área de diámetro 5 en un lugar vacío: el suelo congelado en las 19 casillas, con «⏳ 2», Agilidad contra el Ef.Esp de la Bruja. Falta: con gente adentro (los duelos y el dodge) y el charco al irse; la Varita de la ventisca con 2d4. *Y la tarde, con juan adentro:* ✔ el duelo (PdG.Esp contra Evasión), 16 de hielo (2d4+5 y la Presa), el suelo congelado alrededor de juan y, en su pantalla, «juan entró en Lluvia de escarcha: suelo congelado — Tirá Agilidad» → «no resistió (Agilidad 2 contra Ef.Esp 18) · Sentado». Falta: el charco al derretirse.
- [x] **🥁 Redoble de tambores (Support, 2026-10-25)**: un creep con aliados a 4 casillas o menos (uno con una habilidad en cooldown, otro en modo SP y uno lejos): a los de cerca, Redoble (+2 No2 al empezar su próximo turno) y al que trabaja con cooldown, «−1 al cooldown de…» en la Mesa (el de modo SP: «trabaja con SP»); el lejano y él mismo, nada. — *probado (2026-10-25)*: ✔ la onda abre un cuadro por aliado (también el Estandarte y el Tótem, que son creeps aliados); ✔ a la Bruja: «−1 al cooldown de Tótem de silencio, Zap, Cegar» (4→3, 2→1, 1→0) y Redoble: No2 máximos 6 → 8.
- [x] **🤐 Tótem de silencio (Debuffer, 2026-10-25)**: un creep lo clava cerca de juan; se ve el tótem y el aura violeta; juan, adentro, quiere usar una habilidad con SP → cartel «dentro del aura de Tótem de silencio de…» (con «Usarla igual»); una sin SP, sin cartel; afuera del aura, sin cartel; un creep aliado adentro, sin cartel. Romperlo (pegarle hasta 0) → se va y la Mesa dice «se termina el silencio». — *probado (2026-10-25, GM y juan)*: ✔ la Bruja lo clava al lado de juan; el aura violeta; ✔ desde la pantalla de juan, Shield (2 SP) → «Estás dentro del aura de Tótem de silencio de Bruja del pantano: no podés usar habilidades que cuestan SP. ¿Usar Shield igual?» (Cancelar no cobra); ✔ no le llega a Clementino ni al Lobo (lejos) ni a los creeps aliados. Arreglado en el camino: el anillo era un círculo más grande que el área; ahora es una costura que sigue la forma del área. Queda puesto en el mapa (pedido del dueño). Falta: romperlo. *Y la tarde:* ✔ romperlo (un segundo tótem, del Escarabajo, a 0 de vida): se va del mapa; la Mesa decía «se termina su bonus» (el texto del estandarte) — arreglado: «🤐 Rompieron Tótem de silencio de…: se termina el silencio». ✔ La onda del Redoble ya no alcanza al tótem ni al estandarte (inertes).
- [x] **⚡ Zap (Mago, 2026-10-25)**: contra juan con otros dos personajes cerca (a 4 casillas o menos): no se esquiva (PdG.Esp contra Res.Esp); el 1d4 directo entra siempre: si juan gana, el cartel dice «⚡ EL DAÑO ENTRA» y la Parálisis queda «lo resistió»; si pierde, Parálisis; con 2 o más de daño salta, y el momento «el rayo salta» muestra «Parálisis 50 % (1d2: …)» y, si llega al tercero, «25 % (1d4: …)». — *probado (2026-10-25)*: ✔ PdG.Esp contra Res.Esp; juan ganó: cartel «⚡ EL DAÑO ENTRA — juan resistió los estados de Zap (Res.Esp), pero no se esquiva: el daño pasa igual», el daño entró (5) y la Parálisis «✗ No entra: lo resistió»; ✔ saltó a Clementino (2) y al Lobo (1): «Clementino: Parálisis 50 % (1d2: 2) → paralizado 1 turno · Lobo de prueba: Parálisis 25 % (1d4: 2) → no», y Clementino quedó con Parálisis.
- [x] **🛡 Armas perforantes (Support, 2026-10-25)**: un creep se lo da a un aliado (o a sí mismo); el aliado queda con Armas perforantes 3 turnos completos; su golpe físico contra juan dice «pasa 3 por la Perfora» y uno mágico (o con arma de daño especial) muestra «Defensa especial N (pasan 3 por Armas perforantes)». — *probado (2026-10-25)*: ✔ el Escarabajo se la da a la Bruja; su Rayo de pantano contra juan (con una Defensa especial 4 de prueba): «Defensa especial 4 (pasan 3 por Armas perforantes) → entran 3» (sin la habilidad, 1). Falta: un golpe físico (Perfora contra la Defensa).
- [x] Golpe fuerte, Tajo veloz, Estocada, Zarpazo, Mordisco feroz y Cornada — probadas en el mapa una por una (2026-10-20/21, antes de esta forma
  de trabajo).
- [x] **👊 Puño de roca** (+2 al daño y Demora) — probado en el mapa el 2026-10-21: la declaración dice «+2 de daño fijo» y la Demora bajó a Silvia
  del 2.º al 3.º lugar del orden de turnos.
- [x] **🩸 Las cuatro variantes del Sangrado** — probado el 2026-10-21: Golpe que sangra contra Silvia → Sangrado 2 stacks, 2 turnos (pega 2 al aplicarse; con un golpe que frena la armadura, no entra, correcto); las declaraciones dicen «perfora 1», «+2 de daño fijo» y «Crítico frecuente +1». Las de bestia comparten el código (no se repitieron). (2026-10-21): Golpe que sangra / Zarpazo desgarrador (solo Sangrado, 1 SP), Corte profundo / Colmillos
  que perforan (Perfora 1), Tajo brutal / Desgarro (+2 al daño), Corte certero / Zarpa certera (Crítico frecuente +1). Mirar la declaración del duelo,
  que el Sangrado entre por 2 turnos y que con crítico quede permanente.
- [x] **🩸 Tajo de carnicero / Destripar** — probado el 2026-10-21: crítico ×2 → 4 de daño directo y Sangrado fuerte de 3 stacks, permanente. (2026-10-21, 4 SP): Perfora 1 y Crítico frecuente +1; si pega, Sangrado fuerte (3 por turno, 3 turnos).
- [x] **🦵 Golpe a la rodilla / Tarascón al tobillo / Tiro a la rodilla** — probado el 2026-10-21 (Golpe a la rodilla): Rengo 2 turnos, moverse le cuesta 2 No2. (2026-10-21, 2 SP): si pega, Rengo 2 turnos; mirar que moverse le cueste 2 No2.
- [x] **🕸 Red / Tela de araña** — probado el 2026-10-21: Inmovilizado 3 turnos; al empezar el turno de Silvia, el cartel «¿se suelta?» (Fuerza 1 contra 5 → sigue atrapada); la Tela se suelta contra su Ef.Esp (3). **Arreglado**: la Red aplicaba además el estado del sistema viejo («¿A quién le pegó?»). **La ayuda de un aliado, probada el 2026-10-23** («Claude · pruebas»): (A) entre personajes: el Goblin de prueba 1 con la
  Red atrapó a juan (Inmovilizado, Fuerza contra 1, ayuda sí); Clementino, pegado, vio en su Botonera «🤝 Ayudar a soltar a juan · Fuerza contra 1 · 1
  No2» → Fuerza 3 → «¡LO SOLTÓ!», −1 No2 (10 → 9) y a juan se le fue el Inmovilizado (por aviso a su ficha); (B) entre creeps: juan le tiró el
  Pergamino de red Nerubian al Escarabajo (PdG.Esp 4 contra Evasión 1 → Inmovilizado, Fuerza contra 14); el Goblin, pegado, vio en sus Acciones «🤝
  Ayudar a soltar a Escarabajo… · Fuerza contra 14 · 1 No2» → 1 contra 14 → «SIGUE ATRAPADO», −1 No2 igual (6 → 5).
  **Zafarse con ayuda en simultáneo (2026-10-23, regla nueva del dueño), probado el mismo día**: al empezar su turno el Escarabajo (atrapado, Fuerza
  contra 14) vio «Pueden ayudarlo Goblin de prueba 1…»; al tirar, al Goblin le salió «¿Lo ayudás?» y el atrapado «Esperando a…»; Sí → «5 + Goblin 1
  = 6 contra 14, con ayuda: sigue atrapado», 1 No2 cada uno. Entre personajes: juan (Fuerza contra 5) con Clementino → «3 + Clementino 4 = 7
  contra 5: ¡SE SOLTÓ!», juan 8 → 7 No2, Clementino 10 → 9, y se le fue el Inmovilizado. (2026-10-21): Probabilidad de Golpe contra Evasión; Inmovilizado; soltarse al empezar su turno; la ayuda de un aliado.
- [x] **🤼 Agarrón / Abrazo aplastante** — probado el 2026-10-21: Agarrado y Agarrando (la bestia no se suelta sola a los 10 s); Silvia no se soltó (4 contra 5) y el apretón le hizo 9 − 3 = 6; al empezar el turno de la bestia, se fueron los dos estados. El Agarrón, sin daño, igual. **Arreglado**: el cartel decía «el mordisco» en vez de «el apretón». (2026-10-21): Agarrado y Agarrando; soltarse; el apretón repite el daño (el Abrazo); suelta al empezar el turno de la bestia.
- [x] **🛡 Aguante** — probado el 2026-10-21 (modo cooldown): el anuncio, +2 Defensa y +2 Def.Esp, 1 No2 y cooldown 3; contó 2 golpes (uno que la armadura frenó del todo); con ▶ Siguiente quedó la revancha (2) y se fue el estado; al Atacar, el cartel «Modo aguante» (+2d4, +2 de cooldown) y el duelo con «+2 dados de daño». **Completado el 2026-10-23** («Claude · pruebas»): **modo SP** (el Escarabajo de cobre: 1 No2 + 1 SP, sin cooldown, anuncio con
  el tope); **el tope nivel + 1** (con 4 golpes: «+3d6 (el tope es su nivel + 1: 3). Cuesta 3 SP»); **se pierde si no ataca** (canceló el ataque,
  se le pasó el turno y al volver su Atacar fue un ataque común); y **el Aguante del Tanque** en juan (nivel 2): +2 Defensa y +2 Def.Esp, 1 No2 y 1
  SP; el golpe del Escarabajo se le contó (golpes 1; el daño restó la Defensa del Aguante); al empezar su turno, «🛡 Aguante: recibió 4 golpes…»;
  su Atacar: «+3d4 (el tope es tu nivel + 1: 3). Cuesta 3 SP, más los 2 No2 del ataque» → duelo «sin arma · Tipo 4 · +3 dados de daño», daño
  «1d4 + 3 + 3d4» = 15; cobró SP 42 → 39 y No2 8 → 6. (2026-10-21): el anuncio «se pone en modo aguante», +2 Defensa y +2 Def.Esp, que cuente los golpes (también los que frena la armadura),
  el cartel al apretar Atacar en su turno con +N dados y su costo (modo SP y modo cooldown), y que se pierda si no ataca.
- [x] **💨 Hit and run** — probado el 2026-10-21: el cartel «se aleja» al terminar el duelo; arrastrado 2 casilleros sin cobrar No2 (6 → 6) ni ataque de oportunidad. (2026-10-21): pegue o no, el cartel «se aleja»; que los primeros 2 casilleros sean gratis y sin oportunidad.
- [x] **🦘 Salto / Salto aplastante** — probado el 2026-10-21: saltó 3 casilleros y cayó al lado de Silvia («+1 PdG · Crítico frecuente +1»); con Sólidos en el camino, el cartel «¿Puede saltarlo?» y, con «Sí», saltó; el aplastante: Res.CC 4 contra Fuerza 4 → en pie (empate), y con más Fuerza, 3 contra 14 → Sentado. (2026-10-21): que caiga al lado del objetivo saltando por encima de un token, sin No2 ni oportunidad; el cartel
  «¿puede saltarlo?» al pasar por encima de una pared o un Sólido; los bonos en la declaración; el aplastante: Res.CC contra su Fuerza y el Sentado.
- [x] **👁 Vigilancia** — probado el 2026-10-21, «Test con claude elsaulo», el GM con el control de Silvia: el anuncio y el alcance (5) dibujado en naranja; Silvia,
  arrastrada hacia el arquero, se frenó al entrar en la mira; «¿Dispara?» al GM y «Te movés en la mira… Seguir sin esperar» a quien la mueve; «Sí, disparar» →
  duelo con «desde la vigilancia: +2 PdG» y se fue la vigilancia. **Completado el 2026-10-23** («Claude · pruebas»): «Dejarlo pasar» → sigue su camino; el
  creep sin No2 → pregunta «¿Dispara?» y recién al contestar avisa que no le alcanzan (el No2 de un creep es privado), y sigue; **el Shooter contra un
  creep**: juan con Arco corto y Vigilancia, la Bruja entró en su mira → «¿Dispara?» a juan → duelo «desde la vigilancia: +2 PdG», crítico ×2, 16 directo
  a la vida (35 → 19) y a juan se le fue la Vigilancia.
- [x] **🔥 Bola de fuego de creep** — probado el 2026-10-21, «Test con claude elsaulo», el GM con el control de Silvia: en modo SP cobró 6 SP (su Especial) y 4 No2, sin cooldown; el centro sobre Silvia tomó también a Xeena; «2d6+1» (¼ de Ef.Esp 6); Silvia ganó la Evasión → el cartel del dodge roll; con «No me quiero mover», le pegó: 8 − Defensa especial 1 = 7, y Quemadura; el área se cerró sola. (2026-10-21): (2026-10-21): el área con el centro dentro de su Rango, la cascada con dodge roll, 2d6 + ¼ Ef.Esp de fuego (frenado por la
  Def. especial y la Res. fuego), la Quemadura; en modo SP le cobra su Especial; en modo cooldown, cooldown 2; 4 No2.
- [x] **😵 Confusión de creep** — probado el 2026-10-21, «Test con claude elsaulo», el GM con el control de Silvia: PdG.Esp contra Res.Mt, Confusión 1 turno en la ficha, 2 No2 y cooldown 4 (el 1d4 al empezar su turno es el de siempre, ya probado). (2026-10-21): (2026-10-21): PdG.Esp contra Res.Mt; la Confusión 1 turno y el 1d4 antes de la primera acción del jugador en su turno.
- [x] **🎯 Disparo señalador** — probado el 2026-10-21, «Test con claude elsaulo», el GM con el control de Silvia: si pega, Presa y Marcado 2 turnos en Silvia; su Evasión pasó de 1d6 a 1d4+1; el ataque siguiente del creep declaró «🎯 contra la presa: +2 al daño» y el daño quedó «2 (manual) +2 presa»; vale también contra una habilidad (Cadena de rayos). (2026-10-21, rango): (2026-10-21, rango): si pega, Presa y Marcado en el personaje; su Evasión −1 (el botón en rojo); otro creep que lo ataca, «🎯 contra
  la presa: +2 al daño» en el cuadro; a los 2 turnos se va.
- [x] **🗡 Ráfaga de cortes** — probado el 2026-10-21, «Test con claude elsaulo», el GM con el control de Silvia: la declaración «+2 dados · 3 cortes · Perfora 1 en cada corte (pasan al menos 3)», el daño «2d4+2d4+1» y tres chances de Sangrado al 25 % en el tablero (Corte 1, 2, 3; esta vez ninguna entró). **Arreglado**: con el daño elegido a mano, en el mapa se perdían los efectos del arma de un creep. (2026-10-21, choque liviano): (2026-10-21, choque liviano): con un creep con un arma con efectos (sangrado al 25 %, perfora 1): la declaración «3 cortes», el
  daño con +2 dados, el tablero de efectos con tres chances («Corte 1, 2, 3») y «Perfora 1 en cada corte (pasan al menos 3)» en la declaración y el daño.
- [x] **🔨 Romper armadura** — probado el 2026-10-21, «Test con claude elsaulo», el GM con el control de Silvia: con un golpe que la Defensa frenaba igual se ofreció la Armadura rota (correcto); sin piezas de armadura, nada que romper; con un Peto y una Capucha de prueba, el Golpe demoledor («2d4 + 1 + 1d4») rompió las dos (Defensa 4 → 3). **Con un crítico (2026-10-23)**: la regla «un crítico no rompe armadura» se borró (dueño) y se probó lo
  nuevo en «Claude · pruebas»: Goblin de prueba 1 con Romper armadura contra juan, PdG 16 (a mano) contra Evasión 4 → crítico ×2, 10 directo a la
  vida, «Armadura rota · Entra siempre» → Aplicar: el Peto de tablas pasó de 6/6 a 5/6 con Armadura rota ×1 y la Defensa de juan de 2 a 1. (2026-10-21, choque pesado): (2026-10-21, choque pesado): contra un personaje, la Armadura rota cae en una pieza equipada (Defensa y durabilidad); contra un
  creep, −1 Defensa; el Golpe demoledor con +1 dado y la doble; con un crítico, «no entra».
- [x] **⚡ Cadena de rayos de creep** — probado el 2026-10-21, «Test con claude elsaulo», el GM con el control de Silvia: a Silvia le entraron 7 (8 − Def. especial 1), saltó a Xeena con 3 y a Aurelia con 1 (en la Crónica); la Parálisis 20 % salió y quedó 1 turno. (2026-10-21, Mago): (2026-10-21, Mago): el duelo dirigido, 2d4 eléctrico, el salto a otros dos o tres personajes (la mitad cada vez, el rayo en
  el mapa y la Crónica) y el 20 % de Parálisis al primero.
- [x] **🎯 Tiro a la cabeza** — probado el 2026-10-21, «Test con claude elsaulo», el GM con el control de Silvia: el anuncio, el estado, 1 No2 y cooldown 3; el disparo siguiente declaró «apuntando a la cabeza: +2 PdG, Crítico frecuente +1, Crítico potente +1» y el estado se gastó; un golpe que la armadura frenó del todo no se lo sacó; uno que entró, sí (con su línea en la Mesa). (2026-10-21, rango): (2026-10-21, rango): el anuncio y el estado; el próximo disparo con +2 PdG y Crítico frecuente y potente +1 (en el cuadro del duelo);
  se gasta al disparar; un golpe que le saca vida se lo saca (Mesa y Crónica), uno que frena la armadura no.
- [x] **🗡 Puñaladas** — probado el 2026-10-21, «Test con claude elsaulo», el GM con el control de Silvia: desde la espalda, con Paso ligero, «+1 dado · Crítico frecuente +1 · por la espalda: +2 PdG» y la línea en la Mesa; la trapera en sigilo, «+2 dados» (el doble de los 2 del arma); de frente, el aviso «No está por la espalda» con «Atacar igual / Elegir otro». (Antes, Xeena descubrió al creep en sigilo y quedó Marcado: la regla de siempre.) (2026-10-21, choque liviano): (2026-10-21, choque liviano): un creep en la espalda de un personaje (en sigilo, con Paso ligero o con el personaje flanqueado) →
  la línea en la Mesa y el duelo con +1 dado y Crítico frecuente +1 (y el +1 PdG por la espalda); la trapera en sigilo, el doble de dados; de frente, el aviso
  «No está por la espalda» con «Atacar igual» / «Elegir otro». Y que la pasiva se vea como «Paso ligero».
- [x] **🌀 Barrido y 🦎 Coletazo** — probado el 2026-10-21, «Test con claude elsaulo», el GM con el control de Silvia: la cascada con el PdG compartido (5), un daño tirado para cada uno, «Aplicar el daño» y el área cerrada sola; el Coletazo empujó a Xeena 1 casillero; quien gana la Evasión no recibe nada ni hay dodge roll; cobró 3 No2 (lo de un ataque) y cooldown 3. **Arreglado**: contaban dos ataques del turno en vez de uno. **Contra una pared, probado el 2026-10-23** («Claude · pruebas»): Goblin de prueba 1 con
  Coletazo al lado de juan, con un Sólido en las 3 casillas de atrás de juan; PdG 10 (a mano) contra Evasión 7 → 3 de daño (6 → 3 HP) y «Aplicar
  Empujón» → «chocó sin moverse · juan: 6 − Defensa 0 → 6 de daño» (la Constitución de juan ×1 en la Mesa, por el casillero que le faltó). (2026-10-21, choque pesado): (2026-10-21, choque pesado): con 2 o 3 personajes al lado, la cascada: el PdG una vez, la Evasión de cada uno, el daño del
  arma tirado en cada duelo, «💔 Aplicar el daño»; el Coletazo empuja 1 (y el daño de colisión contra una pared); cobra lo de un ataque y 2 SP; cuenta como su ataque.
- [x] **🔥 Arma elemental** — probado el 2026-10-21, «Test con claude elsaulo», el GM con el control de Silvia: el creep se puso Arma eléctrica (3 turnos, 2 No2, su ataque del turno); su golpe sumó «1d4 eléctrico» aparte (2) que saltó a Xeena (1) y la chance de Parálisis; Arma helada reemplazó a la eléctrica y su golpe dejó Escarcha ×1. Ojo: con el PdG elegido a mano no suma (ver pendientes). (2026-10-21, Support): (2026-10-21, Support): un creep se la pone a otro creep (y a sí mismo); el estado dura 3 turnos del aliado; cada golpe que pega
  suma +1d4 del elemento aparte (directo, menos su resistencia), sin gastarse; fuego ×1,5; hielo Escarcha y ácido Armadura rota (1 y +1 cada 5); tóxico
  Veneno; rayo salta y 20 % de Parálisis; poner otra la reemplaza; cuenta como su ataque del turno. Las cinco, al menos el rayo y una de «por daño».
- [x] **👊 Patotear / Jauría** — probado el 2026-10-21, «Test con claude elsaulo»: con un creep aliado pegado a Silvia, «1 aliado rodea a Silvia → +1 dado» en la Mesa y la declaración «+1 dado de daño»; con el aliado caído, el aviso «Solo, sin la patota» (Atacar igual / Elegir otro). **Arreglado**: contaba a quien atacaba como aliado (llega como copia con su id). Falta: el tope de +3 con cuatro. (2026-10-21, choque liviano): con 2 creeps pegados al objetivo → «+2 dados» en la Mesa y la Crónica y el duelo con los dados de
  más; con 4 → +3 (el tope); solo → el aviso «Solo, sin la patota» (Atacar igual / Elegir otro); un aliado caído o bajo tierra no cuenta.
- [x] **🩸 Sal en la herida / Morder la herida** — probado el 2026-10-21: contra Silvia sin sangrar, ataque común sin preguntar y, al pegar, Sangrado ×2; contra Silvia sangrando, «ya sangra → +2 dados» en la Mesa, el daño «2d8 + 1 + 2d8» y el Sangrado subió de 2 a 3. (2026-10-21, choque liviano): contra alguien que sangra → «+2 dados» en la Mesa y la Crónica, el duelo con los
  dados de más y, si pega, el sangrado sube 1; contra alguien que no sangra → ataque común sin preguntar y, si pega, empieza a sangrar.
- [x] **🪓 El que avisa no traiciona / Zarpazo erguido** — probado el 2026-10-21: cobró 1 No2 y 1 SP; «¿A quién apunta?» con un clic (y con Esc, sin objetivo); la Crónica y la Mesa con a quién apunta; 6 de daño → «lleva 6 de 10», 4 más → «¡se le cae el golpe!»; Silvia se alejó → «🪓 El que avisa no traiciona — 0 No2» en la oportunidad (después, dueño: que cobre los No2 de la oportunidad además de los 3 SP — cambiado, falta verlo), duelo con «+3 dados · no se puede parrear» (Silvia solo con Evasión), cobró 3 SP, se gastó la carga, el daño «2d8 + 1 + 3d8» y el empujón la llevó 2 casillas; con ⟳ Pasar de ronda quedó listo y Atacar mostró «Descargar el golpe / Un ataque común» (cobró los No2 del ataque y 3 SP). **Arreglado**: el 🪓 salía doble en la Crónica. (2026-10-21, choque pesado): el creep la usa → el clic en el objetivo, la línea en la Mesa y la
  Crónica con a quién apunta, el estado en el token (cobra 1 No2 y 1 SP); recibir 6 → «lleva 6 de 10», recibir 4 más → «se le cae el golpe»; el objetivo pegado se aleja →
  la oportunidad ofrece «🪓 …» sin No2 (cobra 3 SP y se gasta); en su turno, Atacar → «Descargar el golpe» (+3 dados, no deja hacer Parry, empuja 2) o «Un ataque común» (se pierde); si no ataca, se pierde.
- [x] **🤺 Desarmar** — probado el 2026-10-21: el creep atacó, Silvia paró con el Broquel; en el Bloqueo, el 🤺 en «Podés usar»; tocado → «intenta desarmar · 3 SP» en la Mesa y el botón se fue; Fuerza 10 contra Bloqueo 5 → «¡DESARMADO!», el Broquel en el piso a 2 casillas y fuera del inventario (sin Desarmado: era un escudo). **El Warrior**: Silvia con la skill → el 🤺 en su Bloqueo atacando, el cartel ofreció las dos opciones (ella o el creep que defendía), «¿Es su turno?» 3 / 6 SP → turno ajeno cobró 6; el Hacha del creep al piso a 2 casillas y el creep Desarmado. **Arreglado**: la ruleta no se publicaba (Firestore no guarda listas dentro de listas) y el cuadro del duelo la tapaba (ahora se minimiza solo); con el arreglo, la ruleta y la Crónica «¡… desarma a …!» se vieron. Falta: el creep que defiende desarmando (la opción aparece; no se ejecutó) y el Ejecutar de la Botonera. (2026-10-21, choque pesado): un creep con Desarmar ataca y un personaje le hace Parry → en el Bloqueo, el botón 🤺 al costado del
  duelo; al tocarlo, la línea en la Mesa y la declaración «intenta desarmar»; si gana, «¡DESARMADO!», la ruleta de casillas en el mapa (todas las pantallas),
  el arma o el escudo en el piso a 2 casillas (y Desarmado); si pierde, lo de siempre. Un creep que defiende (con escudo) desarmando al atacante. Lo natural
  no se cae. El cobro (SP o cooldown; el doble en turno ajeno). **El Warrior** (skill de clase): su jugador ve el 🤺 en el Bloqueo, pregunta el Flash, cobra 3 SP (6 en turno ajeno); el Ejecutar de la Botonera dice dónde se usa. Cada ficha se guarda una vez para publicar la skill.
- [x] **⚡ Botones Flash** — probado el 2026-10-21 con el Blindaje: el 🛡️ arriba en combate, al tocarlo abrió la Botonera, «¿Es tu turno?» 1 / 2 SP, cobró 1 y quedó «Barrera 8/8»; en un duelo, el 🛡️ pasó a «Podés usar». Falta: Shield, Estoicismo y Shockwave, y que se esconda sin SP. (2026-10-21): un personaje con Blindaje, Shield, Estoicismo o Shockwave, en combate: su botón arriba con su animación (y al costado
  del duelo abierto); desaparece si no le alcanza el SP (en turno ajeno, el doble); tocarlo ejecuta la habilidad (Shield pide a quién) y cobra.
- [x] **🧿 Mal de ojo** — probado el 2026-10-21: el 🧿 del GM arriba en combate; el menú con «Creep nuevo → Silvia Suller · Fuerza del golpe (10) · 5 SP»; el duelo PdG.Esp contra Res.Esp; al ganar, «Silvia repite su Fuerza del golpe: 10 y 10 → queda 10» y el duelo se volvió a resolver (la tirada era a mano: no tiene dados para repetir); cobró 5 SP. Falta: turno ajeno (el doble) y una tirada con dados. (2026-10-21, Debuffer): con un creep que lo tiene, el botón 🧿 arriba (solo el GM, en combate); con un duelo abierto, en la columna
  al costado; el menú con las tiradas recientes de los personajes a su alcance; el duelo PdG.Esp contra Res.Esp sin marcar en el mapa; si gana, la tirada se
  repite y queda la peor (con la animación y el duelo resuelto otra vez); en turno ajeno, el doble (SP o cooldown) y su línea en la Mesa.
- [x] **Lo que quedó sin probar el 2026-10-21** (dueño: «déjalo anotado para seguir probando cuando te vuelva a pedir que pruebes cosas»): ~~Vigilancia~~ (probada
  el 2026-10-23); ~~Romper armadura con un crítico~~ (2026-10-23: ahora sí rompe, probado); ~~el Coletazo contra una pared~~ (probado el 2026-10-23);
  ~~Aguante en modo SP y que se pierda si no ataca~~ (probado el 2026-10-23, también el del Tanque); ~~la ayuda de un aliado para soltarse (Red)~~ (probada el 2026-10-23); y el **PdG a mano** (2026-10-21): que cobre los No2, pregunte si
  está Sentado o sin No2 y sume el Arma elemental o un óleo, igual que el botón. **Probado en parte (2026-10-21)**: el PdG a mano de un ataque común cobró sus No2 (30 → 26) y contó el ataque; el de una habilidad «con tu arma» no cobra de nuevo (ya cobró la habilidad). El texto decía «No cobra No2»: arreglado. **Terminado (2026-10-23, con capturas)**: Clementino Sentado, con 0 No2, Arma ígnea y Arma envenenada, PdG 8 a mano contra el Goblin → «Estás Sentado… ¿Atacar igual?», «No te alcanzan los Nitros» (línea roja en la Mesa), gastó una carga del Arma envenenada (2 → 1), el daño sumó su +3 y su Veneno y el Arma ígnea su fuego (1d4 × 1,5). **Arreglado de paso**: el daño elemental del duelo salía siempre con ⚡ y sin el «× 1,5»; ahora lleva el ícono de su elemento (🔥 ❄️ ⚡ ☠️ 🧪) y el multiplicador.
- [x] **💥 Daño de colisión** — probado el 2026-10-21 (Cornada): contra un Sólido, la Constitución de Silvia (3) − Defensa 3 → 0; contra Xeena, cada uno la del otro (Silvia 1 − 3 → 0, Xeena 1 − 0 → 1). **Arreglado**: «Le faltaron 1 casillero» → «Le faltó». (P178, 2026-10-21): un empujón (la Cornada con carrera, una ráfaga) que choca contra una pared → una Constitución del
  empujado por casillero que le faltó, menos su Defensa; contra otro token → cada uno, la Constitución del otro. Mirar la Mesa, la Crónica y el Anuncio.

## Pendientes

- [ ] **🛡 Armadura rota derivada de las piezas** (2026-10-29): Clementino (Tapa abollada) muestra «Armadura rota ×N» entre sus estados (ficha, ficha
  lite y el token), con el detalle de la pieza; repararla con el herrero o el talento lo hace desaparecer; un Rompe armadura nuevo lo suma. En El origen,
  Petro pierde el «Armadura rota ×2» viejo la próxima vez que se abra su ficha (recupera 2 de Defensa).
- [ ] **🌀 Town portal** (2026-10-29, js/84; **primero pegar las reglas de Firestore**, campo `townPortal`): un jugador lo usa desde su Botonera
  (fuera y dentro de combate), elige una casilla al lado, se ve la espiral azul girando en todas las pantallas; cancelar no lo gasta; un aliado, un creep y
  el propio que lo puso lo pisan y se van del mapa (pulsos, línea en la Mesa); el GM los trae al mapa de la aldea. Que aparezca en la góndola de cualquier
  tienda, entre los utilitarios, a 50.
- [x] **🧹 Las armas de los creeps después de la limpieza (2026-10-29, 761fcb2a)** — ✅ **probado el mismo día en el mapa** (las dos cuentas, con pestañas nuevas: las viejas estaban congeladas): las Acciones del Warrior (Hacha: Atacar 4 No2, Daño 1d8+12, Parry y Bloqueo con su peso), su ataque a juan («con Hacha · Tipo 8», «Rompe armadura 50 %»), su 🪪 desde el jugador («Hacha · Escudo · Chaleco»), la Botonera del Lobo de prueba de Clementino (Arco corto: 2 No2, 1d4+2, sin Parry) y GM Tools (los 21 creeps leen su arma; la Abeja curandera agregada de la biblioteca de fábrica trae el Aguijón dulce como ítem). Lo de antes: el motor ya no lee los campos viejos (armaNombre, armaTipo…). Revisado por
  datos: los 14 creeps visibles de «Claude · pruebas» leen bien su arma (Hacha, Arco corto, Bate de Baseball…; sin arma solo el Estandarte, el Tótem y el
  Goblin de prueba, que no tienen). **Falta verlo en el mapa con capturas** (las dos ventanas de Chrome estaban minimizadas): un creep ataca con su arma
  (el Warrior con la Hacha) y el duelo la nombra; una invocación ataca; el 🔍 Ver de un creep y la 🪪 muestran el arma; en GM Tools, el arma en la ficha del
  creep y un creep de la biblioteca de fábrica agregado a la mesa.

> **🖥 Para probar con la cuenta del GM (2026-10-28, dueño: «si hay alguna prueba relevante desde el mapa con cuenta de GM que no podés porque está en
> segundo plano, anotala acá»).** La ventana de Chrome del GM (rolpintoista) estaba minimizada: el lado del GM se manejó por código (sus botones, con
> sus propias funciones) y lo que se vio, desde la pantalla del jugador. Lo que pide ver la pantalla del GM:
> - [x] **🧿 El botón y el menú del Mal de ojo** desde la pantalla del GM — **probado con el mouse (2026-10-28, cuenta del GM)**: con el cooldown en 0 aparece el 🧿
>   arriba; sin tiradas, «No hay ninguna tirada reciente…»; con el Tunelero disparándole a Clementino (Evasión 6, tirada por el jugador) el 🧿 se muda al
>   costado del duelo («Podés usar») y el menú dice «Tunelero (prueba) → Clementino · Evasión (6) … cooldown 3».
> - [x] **🩺 Cómo quedó el grupo al cerrar el botín** (🏁 Cerrar botín y repartir) y al publicar un combate sin ítems. ✅ **Al publicar sin ítems, probado
>   (2026-10-28, cuenta del GM)**: se abre sola con Clementino «💀 en el piso», vida 0/25, SP y No2, «No vencen: Escudo especial»; juan con Guardia baja, Rengo,
>   Lisiado, Presa y Marcado con − / + / ✕ Sacar. «✕ Sacar» Guardia baja anduvo; «−» en Presa anduvo (2 → 1, en la ficha y en el mapa). Del lado del jugador:
>   «Botín concluido» con la XP. ✅ **Con ítems (2026-10-28)**: el Ladrón en 0 con su Cuchillo y una Poción de Ímpetu; juan reclamó la poción; «🏁 Despojar lo que
>   nadie tomó y repartir» → se abre sola; «−» en Marcado tocado enseguida, mientras llegaban la XP y la poción → 2 → 1 en la ficha y en el mapa (con el arreglo
>   de abajo). ✅ **Al pasar a combate**: narrativo → combate abre «Empieza el combate. Si algún estado tiene que durar más o menos…»; «+» en Rengo 2 → 3.
>   ✅ **Arreglado (2026-10-28)**: cada botón busca su estado por nombre en la lista de ese momento, la ventana no se redibuja con un botón apretado, y el
>   Titilando del mapa se publica igual que el de la ficha. Lo que se había visto: el primer «−» en Presa, tocado apenas se abrió la ventana (justo cuando a juan le llegaba la XP), **se perdió** (siguió en 2); el segundo
>   anduvo. Sospecha: la pantalla que aplicó la recompensa guardó la ficha con los estados de antes. Además el «Titilando» del Pacto (que el mapa pone como
>   marca en `resumen.estados`, js/10) pasó a verse como «Invulnerable · 1 turno» cuando se volvió a guardar la ficha (es el mismo estado, alias).
> - [x] **🔦 Un personaje en sigilo que ataca a un creep**: el GM lo tiene que ver en esa casilla hasta que se mueva o pase la ronda. **Probado (2026-10-28)**:
>   juan con Sigilo (el GM lo ve como «?»), ataca al Tunelero → la marca de delatado se escribía bien, pero el GM lo seguía viendo como «?»
>   (`ocultoPorSigiloParaMi` no la miraba). ✅ Arreglado y vuelto a mirar publicado: el GM ve a juan (atenuado, con el ícono de sigilo) en esa casilla; juan se
>   mueve una → el GM deja de verlo. (Falta solo el «pase la ronda», que es la misma marca.)
> - [x] **🐝 Una zona de un creep sobre una invocación** (la abeja de Bizzante): que a su dueño le aparezca el cartel y tire con los stats de la abeja.
>   ✅ **El cartel, probado (2026-10-28)**: el Escarabajo levantó un Muro de fuego sobre el Lobo de Clementino; el dueño lo sacó y lo volvió a meter → en su
>   pantalla «🔥 Muro de fuego: le toca a Lobo de prueba · No hay nada que tirar» → Aplicar → «8 de daño de fuego · Quemadura» y el Lobo 15 → 5 (8 + 2 de la
>   Quemadura al ponerse). ✅ **Con tirada (2026-10-28)**: el Escarabajo (con una Nube tóxica agregada) la tiró sobre el Lobo → al dueño, «Lobo de prueba entró en
>   Nube tóxica · Tirá Res.Esp» → «no resistió (Res.Esp 1 contra Ef.Esp 1) · 4 de daño tóxico · Veneno»: un 1 solo sale con la Res.Esp 2 del Lobo (la de
>   Clementino es 5). El Lobo murió del veneno. Al crear la zona encima no pasa
>   nada: el motor mira al entrar y en cada «Pasar de ronda». Visto de paso y ✅ arreglado: soltar un token en una casilla a la que no llegaba anotaba
>   «⏱ actúa fuera de su turno: se mueve» en la Mesa sin haberse movido. Vuelto a probar publicado: el intento fallido no anota nada y el movimiento siguiente, una sola línea
>   (antes el intento fallido seguía mirando y anotaba también el movimiento siguiente: dos líneas).
> - [x] **✕ Un duelo en curso no se puede cerrar (2026-10-28, dueño: «un jugador apretó la X de cerrar y quedamos sin saber qué hacer»)**: mientras el
>   duelo sigue, el cuadro solo tiene «—» / «Minimizar» y «Cancelar duelo» (quien podía); la ✕ y «Cerrar» vuelven cuando termina. Ver con el jugador y el GM.
>   ✅ **Probado (2026-10-28, las dos cuentas)**: el GM ve «—», «Cancelar duelo» y «Minimizar»; el jugador, «—» y «Minimizar»; al llegar a «Fin del duelo»
>   vuelve «Cerrar» en las dos pantallas.
> - [x] **⚔ El cuadro del duelo visto por el GM** (la cuenta del daño, el «🏹 tiro alto (−2)» en la declaración): se vio desde el jugador. ✅ **La cuenta del daño,
>   probada desde el GM (2026-10-28)**: crítico ×4 → «24 derecho a la vida… al aplicarlo se ve la cuenta» y, al tocar «Aplicar por Clementino», «Tirada de daño 6 ·
>   crítico ×4 · = el golpe 24 · Crítico: no se resta la Defensa · = ENTRA A LA VIDA 24», Clementino 12 → 0. (El tiro alto queda visto solo del jugador.)
> - [x] **🕳 Excavar: salir en su casilla** y **la estela que se va al empezar su turno** (con el Tunelero en el orden de turnos): todo del lado del GM.
>   ✅ **Probado (2026-10-28)**: en su turno, Excavar → bajo tierra (el GM lo ve transparente sobre el pozo); se movió una casilla por abajo (deja la estela de
>   tierra); Excavar otra vez → sale **en su casilla**, al lado de juan, y pide el objetivo; la estela siguió a la vista toda la ronda y **se borró al empezar
>   su turno siguiente** (ronda 19). Para preparar: se lo metió en el orden después del turno de ese momento. Lo raro, a decidir en **P231**: bajo tierra
>   detectó a juan en sigilo; el ataque al salir usó el arco («¿Qué flecha?») y no la daga; cancelar ese ataque devolvió el costo y lo dejó afuera igual.
> - [x] **🕳 Excavar con lo decidido en P231 (2026-10-28, cuenta del GM)**: el Tunelero bajo tierra → abajo a la derecha «🕳 Tunelero (prueba) · ⬆ Salir · ⚔ Atacar»
>   (Atacar porque está pegado a juan); ⚔ Atacar → sale y apunta **sin preguntar flecha** (con una Daga; solo con el Arco no puede salir atacando); Esc →
>   «¿Vuelve bajo tierra o queda afuera?» → volvió abajo (y se le devolvió lo cobrado); ⬆ Salir → sale sin atacar, Mesa «sale de abajo de la tierra (sin
>   atacar)», los botones desaparecen. Arreglado al verlo: el alcance al salir era el del arco (14 casillas).
>   ✅ **Excavar de jugador (juan rehecho, cuerpo a cuerpo)**: la Botonera dice «meterse: 1 No2 y 1 SP · salir atacando: 6 No2 (ataque con Caronero) · 2 SP»
>   (arreglado al verlo: el botón se apagaba por el costo de salir); meterse cobra −1 No2 −1 SP y aparecen «🕳 juan · ⬆ Salir · ⚔ Atacar»; ⚔ Atacar → la
>   declaración «con Caronero · Tipo 6 · +3 PdG · +1d6 de daño · Crítico frecuente +1» (el PdG 7 + 3 se tira como 1d10); sin No2 avisa y deja seguir;
>   Esc → «¿Vuelve bajo tierra o queda afuera?» → vuelve; ⬆ Salir → sale sin atacar. **Para revisar**: al jugador cancelar no le devuelve lo cobrado (al
>   creep sí). ✅ Arreglado: bajo tierra, el jugador no veía ni podía agarrar su propio token (ahora lo ve transparente y lo mueve). ✅ **Con las reglas pegadas**:
>   juan se movió por abajo y la estela quedó guardada y a la vista (captura).
> - [x] **✨ El que se delata aparece con ondas** (2026-10-28, programado): un token escondido en la niebla que ataca se revela con el anillo y las ondas del
>   aviso de turno, 4,5 s. Ver en el mapa con un creep en la niebla que dispare.
>   Intentado (2026-10-28): el Tunelero a 8 casillas, en la niebla de juan, le disparó (la marca de delatado se escribió); la ventana del jugador estaba
>   minimizada (0 × 0) y no se pudo mirar. ✅ **Probado**: el Tunelero, en la niebla de juan, le dispara → en la pantalla de juan aparece con el anillo dorado y
>   las ondas, 4,4 s (captura). (La pestaña de pruebas que se abre aparte queda en segundo plano y Chrome la congela: usar la pestaña que está a la vista.)
> - ⚠ **juan (de «Claude · pruebas») quedó en blanco (2026-10-28)**: al abrirlo desde la ficha, la ficha estaba rota (desde las 10:01, `jobCostoDe` declarado
>   dos veces en `ficha-personaje/js/10`) y guardó la hoja vacía encima. Arreglado (fc80c9ae) y con un seguro: si la ficha no se puede armar, queda en solo
>   lectura. El origen, revisado: intacto. juan no se puede recuperar (no había respaldo): hay que rehacerlo o crear otro personaje de prueba.
> - [x] **🏹 Los arcos Buenos (11)**: probados el mismo día, más tarde (ver el renglón de arriba). Antes habían quedado sin hacer. Al final de la tanda del 2026-10-28 las dos ventanas de Chrome quedaron minimizadas (el mapa
>   medía 0 × 0) y no se pudo seguir mirando nada; se paró ahí para no probar «por detrás».

- [x] **⚔ El final del duelo en la Mesa (2026-10-28, dueño)**: **probado** (jugador): «⚔ Tunelero (prueba) atacó a Clementino con Arco corto. Clementino
  esquivó.» y, en otro, «… ¡Crítico ×3! Le bajó 13 de vida.»; «🔍 Ver detalle del duelo» despliega el paso a paso.
- [x] **🧮 La cuenta del daño**: **probada** (jugador, crítico contra Escudo especial 5): «Tirada de daño 6 · crítico ×3 · = el golpe 18 · Crítico: no se
  resta la Defensa · − Escudo especial (escudo) 5 · = ENTRA A LA VIDA 13», Clementino 25 → 12. Arreglado al verlo: antes de aplicar un crítico no avisaba que
  los escudos igual frenan.
- [x] **🧿 Mal de ojo paso a paso (2026-10-28, dueño)**: **probado** (el GM por código, el jugador con el mouse): el GM elige «Clementino · Evasión (8)», se
  cobra el cooldown 3; a Clementino le aparece «Tunelero (prueba) te tiró mal de ojo» con su Evasión de antes y «🎲 Tirar Evasión»; ruedan los dos dados (el 8
  con la animación de maldito) y «Queda 8: la de antes era más baja». Arreglado al verlo: faltaba la frase «volvé a tirar y quedate con el peor resultado».
- [x] **🏹 Tiro alto a la vista (2026-10-28)**: **probado**: la declaración dice «🏹 tiro alto (−2): −2 PdG» y la tirada «1d10+1 −2 tiro alto (−2)».
- [x] **👂 Flanqueado y darse vuelta (2026-10-28, pregunta del dueño)**: **probado** (jugador): con el Tanque enfrente y el Ladrón entrando por la espalda a 2
  casillas → «¡Flanqueado! Ladrón (prueba) le queda por la espalda (+1 PdG si lo ataca)»; sin nadie enfrente → «juan oye pasos… ¿Se da vuelta? (no
  cuesta No2)» y al aceptar, juan quedó mirando al Ladrón.
- [x] **🔦 Se delata y deja de verse al moverse**: **probado** (jugador): el Tunelero en la niebla quedó a la vista después de disparar; al moverlo una casilla
  dejó de verse y la casilla vieja ya no quedó alumbrada.

- [x] **😇 El Pacto (2026-10-28, dueño)**: «😇 Pacto: sí / no» en la ficha (al lado del Nivel); el botón 😇 arriba del mapa, dorado si está activo y gris si se
  gastó; con la vida en 0 revive solo con un cuarto (P229), Titilando, y se gasta. **Probado** («Claude · pruebas», jugador): juan, Pacto sí en la ficha →
  el botón dorado en el mapa; 60 de daño desde «Recibe daño» → el Aviso «juan cae… y su pacto lo levanta», 7/30 HP, Titilando, el pacto en no y el botón
  gris. En El origen quedaron con pacto Bizzante y Rockardo (Pietro); Larry, sin.
- [x] **🔦 Quien ataca se delata (2026-10-28, dueño)**: **probado** con el Tunelero (arco, metido en la niebla a 7 casillas de juan): al crear el duelo
  quedó anotado y en la pantalla del jugador se lo veía, con su casilla alumbrada. Falta ver: que deje de verse al moverse a la niebla o al pasar la ronda,
  una zona de un creep, y un personaje en sigilo que ataca (el GM lo ve).
- [x] **🛡 Parry contra un disparo (2026-10-28, pregunta del dueño)**: la regla (2026-10-09) es que contra un disparo el Parry vale **solo con escudo**.
  **Probado** con el arco del Tunelero: a juan (sin arma ni escudo) solo le ofreció Evasión; a Clementino (con la Tapa de tacho de basura) le ofreció
  «Parry · Tapa de tacho de basura — 1 No2, 1d6; si ganás, el disparo queda parado (sin Bloqueo)».

- [~] **🩺 Cómo quedó el grupo (2026-10-28, dueño)**: ventana del GM con vida, SP y No2 (con su máximo) y los estados de cada personaje con token en el
  mapa; los temporales con − turnos + y ✕ Sacar (`vtt-hexgrid/js/81-estado-del-grupo.js`). **Probado** («Claude · pruebas», GM): al pasar de narrativo a
  combate se abre sola; Rengo de juan 2 → 3 → 2 con + y −. **Falta**: verla abrirse sola al cerrar el botín (🏁 Cerrar botín y repartir) o al publicar un
  combate sin ítems, y probar ✕ Sacar con un estado de prueba. (Desde GM Tools, el Despojar no la abre: solo el mapa.)
- [x] **📦 El baúl común desde el mapa (2026-10-28, reporte de jugadores)**: el aviso «En combate no se puede usar el baúl» quedaba debajo de la tienda (no
  se veía nada) y la ventana del baúl también se iba a abrir debajo; además la ficha leía el modo del mapa principal (narrativo) y el mapa el del mapa
  publicado (ENTRADA MINAS, en combate). **Probado** como jugador (Saulo-Prueba): en combate el aviso se ve sobre la tienda; fuera de combate (pasado a
  narrativo solo en esa pantalla) la ventana del baúl se abre encima de la tienda.
- [x] **❤ El máximo en los circulitos del token (2026-10-28, dueño)**: «/30» debajo de cada circulito, «35 / 42 máx.» al editar el SP y «❤ 15 de 30
  (máximo)» en el globo de vida. **Probado** como jugador con juan.

- [ ] **🧮 La cuenta del daño en el duelo (2026-10-28, dueño: «decía 19 de daño y el siguiente paso mostraba 0… todo lo que esté frenando el daño
  tiene que estar comunicado muy claramente»)**: al aplicar el daño, el paso 5 muestra el número grande (lo que entró a la vida) y abajo «🧮 La cuenta
  del daño», renglón por renglón: la tirada, el crítico, la Defensa (con los estados que la cambian: «con Piel de hierro +6»), la Defensa contra el
  primer golpe o a distancia, el guardián, el Muro de escudos, la Defensa especial, la resistencia al elemento, lo que pasa, cada escudo por su nombre,
  la Vida extra, el Miti-Miti y «= entra a la vida». La Mesa lo dice en una línea («19 − Defensa 11 − Blindaje (escudo) 8 = 0 a la vida»). Antes de
  aplicarlo, el cartel aclara que es lo que tiró y que lo frenan la Defensa y los escudos. **Visto con un duelo armado a mano** (página local); falta en
  el mapa (Chrome no estaba conectado): un golpe contra alguien con Defensa y un escudo (Blindaje), un crítico, un Bloqueo perdido (la mitad) y un daño
  especial con resistencia al elemento.

- [x] **🛡 No2 negativos en las defensas (2026-10-23, dueño)**: con 0 No2, el Parry se puede (queda en −1, con el aviso); con No2 ya negativos, el
  Parry, la Evasión pagando el sobrepeso, el dodge roll y la ayuda para zafar quedan apagados («ya está en No2 negativos…»). La oportunidad y el
  contraataque, como siempre (no bajan de 0). **Probado en parte el 2026-10-23** («Claude · pruebas»): el Escarabajo con −1 No2 atacado por juan →
  su Parry apagado con «Ya está en No2 negativos: no puede gastar más en una defensa»; con 0 No2 → Parry habilitado con «⚠ sin No2: queda en
  negativo», elegido → −1 No2 y el aviso de la deuda. **Lo que faltaba, probado el mismo día** (Clementino con −1 No2): la ayuda para zafar a juan
  (atrapado en la telaraña) → «Sí, ayudar» avisó que ya está en negativo y juan tiró solo, gratis (3 contra 9; No2 sin cambiar); con sobrepeso, atacado
  por juan → «Evasión · pagando 1 No2» apagada con «Ya estás en No2 negativos…» (la de con penalidad, habilitada); el dodge roll → «ya está en No2
  negativos… (el dodge roll)» y el movimiento pidió confirmar como uno común.
- [x] **🪤 Mínimo para detectar una trampa comprada (2026-10-23)** — probado el mismo día: el Goblin de prueba 1 (Destreza 1) colocó una Trampa de
  oso (Común) y quedó con dificultad para detectarla 6, no 1.
- [x] (2026-10-23, Claude: con las dificultades 7/9/11, el Goblin de prueba 1 —Ef.Esp 4— le tiró el Pergamino de Red Nerubian a juan → para
  soltarse, Fuerza contra 9, con la telaraña dibujada) **📜 Mínimo de calidad del Efecto especial de un pergamino (2026-10-23)**: la Red Nerubian (Buena) con un Ef.Esp bajo → para soltarse, Fuerza
  contra 8; el Pergamino de luz cegadora tira como mínimo 8. (Está en las pruebas automáticas; falta verlo en el mapa.)
- [x] (2026-10-23, Claude, el Escarabajo: Sanar a un caído no lo levanta; un caído no brilla y al tocarlo sale «está caído: elegí otro»; la Oleada
  curó al Goblin y al Escarabajo; Bálsamo, Regeneración 4 × 3; cancelar Sanar devolvió lo cobrado; el Círculo curó al ponerlo y al empezar el turno del
  creep; el Aura, al activarla y en su turno; la animación pasó a chispitas con un borde ondulado, a pedido del dueño) **💚 Sanar, Oleada sanadora, Bálsamo, Círculo de sanación y Aura sanadora (Support, 2026-10-23)**: Sanar a un aliado herido y a uno caído (no lo levanta); la Oleada a los aliados de una flor de 7; Bálsamo deja Regeneración 4 × 3; el Círculo cura 4 a los aliados adentro al ponerlo y al empezar cada turno del creep (a los rivales no), 4 veces, con burbujitas verdes; el Aura igual alrededor del creep, con el aura verde en el token que se va al terminar; Mesa y Crónica.
- [x] (2026-10-23, Claude: las dos llegaron a los aliados de cerca y no al creep que las usó) **📣 ¡A la carga! y Arenga (Support, 2026-10-23)**: un creep con cada una, con aliados a 4 casillas o menos y uno más lejos: ¡A la carga! deja +2 a lo ofensivo 2 turnos, Arenga deja Bendecido 3 turnos; a él no; usarla otra vez renueva los turnos (no apila); el cobro de No2 y SP o el cooldown.
- [x] (2026-10-23, Claude: con un cuarto de vida o menos, +3 dados en el daño, en la Mesa y la Crónica; el +2 sale del mismo escalón y está en las
  pruebas automáticas) **🗡 Remate / Ir por el herido (2026-10-23)**: un creep con la habilidad contra un personaje sano (ataque común), con la mitad de la vida (+2 dados) y con un cuarto o menos (+3); mirar la Mesa, la Crónica y la fórmula del daño. **Y** (dueño, el mismo día): al elegir el objetivo brillan solo los que califican; uno sano pregunta «¿Atacarlo igual, como un ataque común?»; cancelar le devuelve al creep el cooldown y el SP. **Visto de pasada (2026-10-23)**: con juan sano no brilló nadie, al elegirlo salió «No califica… ¿Atacarlo igual?» y cancelar le devolvió al Escarabajo el cooldown y los 3 No2 (toast y Mesa). **Falta**: el +2 y el +3 con un objetivo herido.
- [x] (2026-10-24, Claude, «Claude · pruebas», el Escarabajo a la vista: el cono agarró a juan y a Clementino, que no le ganaron: juan 30 → 25 y Clementino 25 → 16, con Escarcha; cobró 3 No2 y 6 SP. **El dodge roll**: con el cono solo sobre juan, juan ganó la Evasión (1 contra 0) → «juan ganó la Evasión: arrastrá el token hasta 2 casilleros» → se movió a una casilla fuera del cono (pagó 1 No2) → «Ya se movió: revisar» → «juan logró salir del área: esquivó», SE RESISTIÓ; el chequeo mira el cono de verdad, no un círculo. Detalle de texto arreglado: en el duelo de un creep decía «Eva», ahora «Evasión») **❄ Hálito polar (Mago, 2026-10-23)**: un creep lo usa mirando hacia dos rivales y un aliado → el cono de 16 casillas al frente; tira PdG.Esp una vez
  contra la Evasión de cada rival (no del aliado); **quien gana la Evasión tiene dodge roll** (2026-10-24, dueño): sale del cono → se salva; se queda → le pega; al que no le gana, 2d4 + ¼ del Ef.Esp del creep, de hielo (menos su Defensa especial y su
  resistencia al hielo), y Escarcha (−1 No2 máximos, 2 turnos); el cobro (3 No2 y tanto SP como su Especial, o cooldown 3). **Y** el Aura sanadora cobra ahora 3 No2 y 5 SP.
- [x] (2026-10-24, Claude: la carga, el turno y la descarga, el corte por 10 de daño y, con el GM en «Ver como jugador», el Escarabajo escondido en la niebla: sin carga no se ve; cargada apuntando a juan, aparece brillando en la niebla y la Crónica dice «junta energía mirando a juan») **⚡ Descarga arcana (Mago, 2026-10-24; antes «Rayo cargado»)**: el creep (en la niebla, para un jugador) lo carga apuntando a un personaje → Mesa y Crónica «junta energía
  mirando a…», el creep brilla y el jugador lo ve en la niebla; en su próximo turno, Atacar → «Descargar» → el duelo de un hechizo contra ese personaje (su
  PdG.Esp contra la Evasión, 4d6 arcano); cobra 2 No2 y 3 SP; si antes le entran 10 de daño, se le corta. **Probado en parte (2026-10-24, el
  Escarabajo a la vista, como GM)**: cargarlo → «¿A quién apunta?» → juan; Mesa y Crónica «⚡ junta energía mirando a juan… ¡Rayo cargado!» con «una luz lo
  recubre»; el estado público del creep lleva `marcado` y el mapa lo reconoce Marcado (brilla); al darle el turno, el Rayo cargado se fue y quedó el golpe
  listo contra juan; Atacar → el cartel → «Descargar» → el duelo de un hechizo contra juan directo («PdG.Esp contra Eva», 4d6) y la Mesa «descarga Rayo
  cargado contra juan (2 No2 y 3 SP)»; se canceló el duelo. Se corrigieron textos del cartel («cargado cargado», «golpe»). **Falta**: verlo desde un
  jugador con el creep en la niebla (hecho, ver arriba). **El corte (2026-10-24)**: cargada apuntando a juan, 10 de daño al Escarabajo → la carga se va y la Mesa y la Crónica dicen «⚡ … recibió 10 de daño mientras cargaba: ¡se le corta Descarga arcana y pierde lo cargado!» (antes decía «🪓 se le cae el golpe»: arreglado); el aviso del cobro decía «Carga arcana (0t)», ahora «(sin límite)».
- [x] (2026-10-24, Claude: al Goblin en el turno del Escarabajo y al Escarabajo fuera de su turno; en el duelo del Escarabajo contra juan, «Rango del crítico: Tipo 6 – Crítico frecuente = 4» con las dos «F» y la tabla modificada por el Crítico potente 2: doble con 5, triple con 16) **🎯 Ojo certero (Support, 2026-10-24)**: un creep se lo da a un aliado en el turno de otro y a sí mismo en el suyo → en los dos casos lo tienen durante sus 2
  turnos completos siguientes y se va al empezar el tercero; Crítico frecuente +2 y potente +2 en el duelo (los cuadraditos del crítico: «F» de más y la tabla
  con el potente); el Anuncio del buff; el cobro (1 No2 y 3 SP, o cooldown 3). **Probado en parte (2026-10-24)**: en el turno del Escarabajo, al Goblin → el Anuncio «le aplicó Ojo certero» con lo que hace y los 2 turnos; el Goblin quedó con Ojo certero 2 turnos (+2 frecuente y +2 potente, marcado como recién puesto); cobró 1 No2 y 3 SP. La cuenta de los turnos completos está en las pruebas automáticas.
- [x] (2026-10-24, Claude: a juan, PdG.Esp 10 contra Res.Esp 1 → Sequía 3 turnos, le llegó a su ficha con turnos y descripción; al empezar su turno, «🏜 Sequía: no recupera SP (su SP Regen de 7)» y el SP no subió) **🏜 Maldición de la sequía (Debuffer, 2026-10-24)**: un creep se la tira a un personaje con una pasiva de regeneración y SP gastado → PdG.Esp contra
  Res.Esp; si gana, Sequía 3 turnos: al empezar su turno el «Empieza tu turno» dice que no recupera ni la vida de la pasiva ni el SP Regen; un Bálsamo o una
  cura de un aliado le entran igual; el cobro (2 No2 y 3 SP, o cooldown 3).
- [x] (2026-10-25, Claude: «¿De qué largo?» con el costo de cada uno; 5 casillas → «cuesta 2 No2 y 4 SP: ¿lo levanta?» → lo cobró; dónde empieza dentro de su Rango y hacia dónde sigue → el muro de 5 con «⏳3»; juan lo cruzó desde su cuenta: «Muro de fuego: le toca a juan — Aplicar» → 9 de fuego y Quemadura (30 → 19). La Bruja en vigilancia lo vio moverse y el GM lo dejó pasar) **🔥 Muro de fuego (Mago, 2026-10-24)**: un creep lo usa → «¿De qué largo?» (4 a 8, cada uno con su costo: 4 = 1 No2 y 3 SP, cada una más +1 No2 y +1 SP) → «cuesta…: ¿lo levanta?» → elegir dónde
  empieza (en su Rango) y hacia dónde sigue → el muro del largo elegido, 3 turnos; cobra lo de base más lo del largo (Mesa); un personaje que lo cruza recibe
  3d4 de fuego directo (sin restar su Defensa especial; sí su resistencia al fuego) y Quemadura; cancelar en el cartel no cobra nada. **Probado en parte (2026-10-24, el Escarabajo, a la vista)**: «¿De qué largo?» con las 6
  opciones y su costo (3: 2 No2 y 3 SP … 8: 4 No2 y 8 SP); 5 casillas → «cuesta 3 No2 y 5 SP. ¿Lo levanta?» → cobró 3 No2 (8 → 5) y 5 SP (40 → 35), la Mesa
  «Muro de fuego de 5 casillas — 3 No2 y 5 SP»; el muro de 5 casillas, 3 turnos, con la textura de fuego. (El aviso decía «−2 No2»: arreglado, ahora el
  total.) **Cruzarlo y cancelar (2026-10-24)**: cancelar el cartel del largo no cobró nada; un muro de 5 cobró 2 No2 y 4 SP (con la regla nueva: 4 casillas = 1 No2 y 3 SP, +1 y +1 por cada una más); juan lo cruzó → el cartel «Muro de fuego: le toca a juan» → «9 de daño de fuego · Quemadura» y la vida bajó 9 justos. **Error encontrado y arreglado**: el mapa no leía la marca de «daño directo» de las zonas (`zonaDirecto`), así que les restaba la Defensa especial; con la Coraza maldita (Def.Esp −2) el muro le sumaba 2 (7 → 9). Pasaba con toda zona de daño directo desde el 2026-10-07 (también las de las varitas). **Y lo visual (2026-10-24)**: el muro y las zonas y
  auras de curación llevan la línea punteada que corre sobre el borde exacto de las casillas; la ondulada de la curación, por fuera.
- [x] **✨ Bendecir el arma (Support, 2026-10-24)**: el botón late como Flash; en su turno, a un aliado en su Rango → Anuncio y Crónica «le aplicó Arma bendecida»,
  y el próximo ataque con arma de ese aliado suma +1 dado del Tipo de su arma en el daño (se ve en la fórmula del botón); ese ataque la gasta, pegue o no;
  en turno ajeno no avisa «fuera de turno», cobra el doble (cooldown 4, o el doble de SP) y lo dice en la Mesa; no cobra No2. **Y el botón instantáneo ✨**
  del GM (dueño, el mismo día): arriba siempre que esté lista, y en «Podés usar» con un duelo abierto; elegir creep y aliado; el que ataca en el duelo abierto
  sale primero; dársela en cualquier momento antes de tirar el daño (también después del PdG, dueño) → ese golpe suma el dado (Mesa: «vale para el golpe que…»);
  después del daño, queda para el próximo ataque. **Probado en parte (2026-10-24, «Claude · pruebas», el GM)**: el ✨ apareció arriba y en «Podés usar»;
  el Goblin atacó a juan, tiró el PdG (10) y recién ahí el Escarabajo le dio Arma bendecida desde el ✨ (el Goblin salió primero, con ⚔ y «la usa en este golpe»;
  4 SP, el doble en turno ajeno); la Mesa: «vale para el golpe que Goblin está dando ahora a juan»; el botón del daño: «1d4 + 4 + 1d4» → 7 (1 + 2 + 4).
  Un intento anterior que falló gastó la bendición (pegue o no). El Anuncio del buff salió (decía «a alguien» con el token oculto: arreglado, el GM ve el
  nombre). **En el turno propio (2026-10-24)**: el Escarabajo sobre sí mismo cobró 2 SP (no el doble) y quedó con Arma bendecida 2 turnos y 1 carga; sobre sí mismo, solo la Crónica. **Desde un jugador de verdad (2026-10-24, la cuenta elsaulo, «Saulo-Prueba»)**: el Escarabajo se la puso a sí mismo y en la Crónica del jugador salió «✨ Escarabajo de cobre (auditar) se puso Arma bendecida — durante 2 turnos…» con la explicación. Desde esa misma pantalla, el Escarabajo cargando la Descarga arcana se veía brillando en la niebla.
- [x] (2026-10-24, Claude: a juan, Coraza maldita 3 turnos, le llegó con turnos y descripción después de recargar la pantalla del GM —una pantalla vieja la aplicaba vacía—; la Defensa de juan pasó a −2 y un golpe de 5 le entró 7) **🛡💀 Maldición de la coraza (Debuffer, 2026-10-24)**: un creep se la tira a un personaje en su Rango → PdG.Esp contra Res.Esp en el duelo; si gana,
  Coraza maldita 3 turnos: la Defensa y la Defensa especial del personaje bajan 2 (la Botonera y la ficha lite) y un golpe siguiente resta 2 menos; ponérsela
  otra vez renueva los turnos sin sumar; el cobro (2 No2 y 3 SP, o cooldown 3).
- [x] (2026-10-24, Claude: la Coraza de púas al Goblin → el Anuncio «te aplicó Espinas» al GM y la Crónica; el Velo espejado sobre sí mismo → solo la Crónica; las dos 3 turnos. **Las devoluciones**: juan le pegó sin arma al Goblin con Espinas (crítico, 8 directo) → «Espinas: juan recibe 2 de daño devuelto (¼ del daño del golpe, directo a la vida) · 30 → 28»; Ráfaga arcana de juan al Escarabajo con el Espejo (6) → «Espejo: juan recibe 2 de daño especial devuelto · 28 → 26». Y se corrigió el cartel previo al daño de una habilidad de daño directo, que decía que la frenaba la Defensa especial) **🌵🪞 Coraza de púas y Velo espejado (Support, 2026-10-24)**: un creep se las pone a un aliado en su Rango (y a sí mismo); el aliado queda con Espinas
  o Espejo 3 turnos; un personaje le pega cuerpo a cuerpo al de Espinas → recibe ¼ del golpe directo a la vida (Mesa y Crónica); le tira una varita al del
  Espejo → recibe ¼ del daño especial; el cobro (1 No2 y 2 SP, o cooldown 3). **Y el Anuncio** (dueño, 2026-10-24: «aunque no se tire nada, tiene que
  haber un anuncio»): al aplicar un buff a otro, a quien lo recibe (el dueño del personaje; de un creep, el GM) «✨ X te aplicó Espejo durante 3 turnos» con
  lo que hace y Entendido, y la Crónica para todos; sobre sí mismo, solo la Crónica. Vale para cualquier buff del duelo (Arenga, Bálsamo, Arma ígnea…).
- [x] **🕸 La telaraña y la red, a la vista (2026-10-23), probado en el mapa con capturas**: la Red (copia vieja de un creep, sin el dato: la
  reconoció por el nombre) dejó la red de soga sobre juan; la Tela de araña, la telaraña sobre Clementino; al soltarse (Fuerza 4 contra 1, al
  empezar su turno) se fue sola. En el piso, la Red de caza y la Telaraña oculta llevan su dibujo encima de la ficha del cepo. El rebote, cada 3,6 s.
  (Ojo: una pantalla abierta con el código viejo aplica el estado sin el dato; se arregla sola al recargar.)
- [x] **🪤 Trampas mágicas: evitarlas o soltarse contra el Ef.Esp de quien la puso (2026-10-23)** — probado con capturas: el Goblin (Ef.Esp 1) puso una Runa de silencio y Clementino la pisó: «Res.Mt contra 9» (el mínimo), sacó 12 y la resistió. Y el Pergamino de red Nerubian de Clementino sobre el Goblin: Fuerza contra 15 (su Ef.Esp, más que el mínimo 9). Falta ver el mínimo del pergamino con alguien de Ef.Esp bajo.: con un Ef.Esp bajo, el número de la tabla (Runa de
  silencio, Res.Mt contra 9); con uno alto, el suyo. **Desde el mismo día, todo 7-9-11**: detectar, soltarse y el mínimo de los pergaminos (la Red, 9). La Arena movediza ahora se suelta contra 9. (En las pruebas automáticas; falta el mapa.)
- [x] (2026-10-23, Claude, «Claude · pruebas», con 🎮 el control de juan: Finalizar combate con el Goblin 3 caído → Publicar → juan reclamó la Varita arcana → Despojar; le llegó a la mochila con el mismo poder que la del catálogo, +20 XP, +5 DDE y +19 despojos; control devuelto) **🎒 Botín con los ítems tal cual** (2026-10-22, paso 6 de `docs/plan-inventario-creeps.md`): en un fin de combate real, que un jugador se
  lleve una varita o un talismán que tenía un creep y que en su mochila funcione igual que el del catálogo (el poder de la varita, el efecto del
  talismán). Lo armado ya se revisó con los creeps de «Claude · pruebas», sin publicar el botín.
- [x] **💀 Invocaciones que desaparecen** — probado en el mapa el 2026-10-22 («Claude · pruebas», desde la cuenta del GM tocando la ficha de
  Clementino): con el Lobo vivo e invocado y una daga suya en el piso, al bajarle la vida a 0 se fue del mapa y del orden con «💀 Lobo de prueba
  desaparece: murió» (una sola línea) y la daga se desvaneció; puesto de nuevo y dormido (turnos en 0), «✨ … desaparece: se terminaron sus turnos».
  Se arregló en la prueba: si el mismo token volvía al mapa, la pantalla no lo volvía a vigilar. El Lobo quedó vivo e invocado. (2026-10-22, dueño): una invocación con token que muere en combate (vida 0) o a la que se le terminan los
  turnos (el Mantenimiento la duerme) tiene que irse del mapa, con una sola línea en la Mesa («💀 … desaparece: murió» / «✨ … desaparece: se
  terminaron sus turnos») y fuera del orden de turnos; si tenía un arma invocada en otras manos o en el piso, esa arma se desvanece a los pocos
  segundos. Un token puesto de antemano con la invocación sin invocar no se toca. (Lo de las armas invocadas por sí solo ya se probó el
  2026-10-22; falta ver la muerte y el fin de los turnos en una pelea.)
- [x] **🔥 Llama de Fénix** — probado en el mapa el 2026-10-20: Aurelia tomó el elixir desde su Botonera; un golpe de 100 del GM la levantó en el mismo golpe con toda la vida (50) y el SP lleno, Titilando, con el cartel «renace de sus cenizas»; un creep con la llama, igual (5/5).
- [x] **🧪 Escudos de poción** — probado en el mapa el 2026-10-20: Aurelia tomó la Poción de Cuero Duro (15); un golpe físico de 8 del GM lo absorbió entero (escudo 15 → 7, vida 50) y uno especial de 6 fue a la vida (50 → 44).
- [x] **😵 Mareo de invocación nuevo** (2026-10-20): probado en «Test con claude elsaulo» con el Lobo de Silvia: entra al final del orden con el
  Mareo y sus No2 enteros; en su turno, Atacar muestra «recién llega: está mareada» (con «Hacerlo igual»); Esquivar pasa; al empezar su segundo
  turno el Mareo se va y ataca normal. Se arregló en la prueba: el mapa no lo reconocía (lo publicado no traía la marca). **El dodge roll, probado
  el mismo día**: el Lobo mareado ganó la Evasión de un área del creep, se arrastró 2 casillas fuera y el duelo cerró «esquivó». Se arregló en la
  prueba: el mapa tomaba ese arrastre como una acción del turno (lo frenaba el Mareo, y podía pedir Confusión o avisar «fuera de turno»).
- [x] **🏹 Un creep dispara su flecha especial** (2026-10-20): con arco y la Flecha marcadora en el cinturón, Atacar pregunta «¿Qué flecha?»; la
  elegida va al duelo (declarada), se gasta del cinturón (el Antídoto queda) y, si erra, queda en el piso. Ojo: si después muere, la flecha
  aparece también en el botín (usada, tildada): el GM la saca en el paso Consumibles.
- [x] **🛡 Blindado en un duelo real** (2026-10-20): Silvia con Blindado, el creep con PdG 21 contra Evasión 3 → «CRÍTICO ANULADO» y entra como un
  golpe normal. Se arregló en la prueba: con las tiradas escritas a mano (✍) se perdía el Blindado (y la Resistencia a crítico), y el cartel decía
  «Evasión está Blindado» en vez del nombre.
- [x] **⏸ El cartel de la pausa abajo a la izquierda** (2026-10-20): probado con una pausa de verdad en «Test con claude elsaulo»: el GM y la
  jugadora lo ven abajo a la izquierda, sin tapar la barra de arriba; al reanudar se va.
- [x] **🎲 El consumible al azar en un fin de combate real** (2026-10-19; regla nueva 2026-10-20: todos van al botín, los usados tildados y los
  no usados destildados). **Probado el 2026-10-20** en «Test con claude elsaulo»: un creep jefe humano con tres al azar (pergamino, aguja,
  flecha) usó el pergamino desde sus Acciones en combate; derrotado, el paso Consumibles mostró el pergamino tildado («lo usó») y los otros dos
  destildados («no lo usó»). Cerrado sin publicar; el creep, restaurado.
- [x] **👁 El Ojo de Kicillof etéreo** (2026-10-20): invocado dentro del Rango y a la vista (fuera de rango o donde no ve, no deja). En combate,
  arrastrado por encima de una trampa y dentro de una zona, al lado de un creep: la trampa no se disparó, la zona no le hizo nada, nadie le pegó
  de oportunidad; pagó 4 No2 por 4 casillas.
- [x] **👻 El estado Etéreo** (2026-10-20): Silvia con Etéreo, en combate: el creep, al atacar, no la resalta y al hacerle clic «👁 Es etéreo: no se
  le puede hacer nada» (sí resalta a Xeena); Silvia, al tocar Atacar en su Botonera, «Silvia Suller está etéreo · Solo puede observar» con
  «Entendido» y «Hacerlo igual».
- [x] **🃏 Wildcards en el duelo y en el mapa de un jugador** (2026-10-15): desde una cuenta de jugador con wildcards, (1) la cartita 🃏 arriba, en la
  **Probado el 2026-10-20 (Claude, «Test con claude elsaulo»):** el creep le pega a Aurelia (desde la cuenta de «Sujeto de pruebas»): Evasión 1 → crítico; «🃏 Wildcard · volver a tirar Evasión» → el duelo vuelve a la defensa, la carta baja de 2 a 1, la nueva Evasión (4) deja el golpe sin crítico. **Arreglado:** la Mesa decía «usó una Moneda Re-Roll» aunque fuera la carta.
  fila de los lentes, girando; (2) en un duelo, después de tirar PdG/Evasión, aparecen «🃏 Wildcard» y «🪙 Moneda» lado a lado (o solo la carta) y
  reabrir con la carta descuenta 1. (Probado ya: el descanso del GM y la ventana de la ficha, ver «Probado».)
  **2026-10-19, desde la jugadora «Sujeto de pruebas» (el otro perfil de Chrome):** (1) visto: la 🃏 con su 2 arriba. Además, visto desde la
  jugadora: **la columna «Podés usar» del duelo** (Polilla, wildcard y moneda al costado del cuadro, por encima, con su texto al pasar el mouse) y
  **el anuncio del descanso** («Día 7: descansaste», al entrar, para Aurelia). Falta (2): reabrir una tirada con la carta dentro del duelo.
- [x] **Trampa de red del Goblin trampero con alcance 3** (2026-10-15): en una partida de prueba, un creep con una trampa ✨ con `trampaColocar.alcance: 3` → al
  **Corregido (dueño, 2026-10-20): el 3 no va.** Toda trampa se coloca dentro del Rango y a la vista de quien la pone; si no, la vuelve a pedir. También las consumibles: ya no aparecen al lado del token para arrastrarlas, se elige la casilla con un clic.
  **Probado el 2026-10-20 (Claude, «Test con claude elsaulo»):** el Goblin trampero ya no está en El origen; se armó la misma trampa en el creep de prueba. A 5 casillas avisa «la trampa llega hasta 3» y la coloca igual; oculta; Silvia la pisa: Anuncio «Inmovilizado (3 turnos)» → «¡CAYÓ EN LA TRAMPA!»; en la Botonera «🔓 Soltarse · Fuerza contra 5 · 1 No2» (sin No2 pregunta y deja seguir; 4 contra 5: sigue atrapada). **Arreglado:** el aviso de alcance lo tapaba enseguida el de «trampa colocada»; ahora van juntos.
  elegir una casilla a 4+ avisa «la trampa llega hasta 3»; la red se coloca oculta; un personaje que la pisa queda Inmovilizado y le aparece 🔓 Soltarse · Fuerza
  contra 5 · 1 No2. (El cambio de código es solo el aviso: js/13 `trampaAvisarAlcance`.)
- [ ] **🔎 Escanear grupo → 🤖 Proponer creeps** (2026-10-09): la respuesta de la IA (usa la clave de OpenRouter del dueño).
- [ ] **📖 El glosario con globos** (2026-10-09, lo ve el dueño): en la tienda, el catálogo, la mochila y el «Ver» de un ítem, los términos (estados,
  bonos de piezas, mecánicas de armas y flechas) salen subrayados en celeste y al pasar el mouse muestran su explicación; «Detalles técnicos» ya no
  repite eso. Mirar si sobra o falta algún término, y si algún texto del globo conviene reescribirlo.
- [x] (2026-10-23, Claude, «Claude · pruebas»: dos tiendas generadas seguidas traen las 4 elementales —ácido, escarcha, fuego, relámpago— y ninguna la de punta roma; publicada, desde el mapa la Talabartería las muestra con «quedan 3») **🏹 Talabartería: las 4 flechas elementales siempre en la góndola** (2026-10-11): no se pudo ver en el mapa — la tienda abierta
  («Tienda de pueblito») es anterior al cambio y su Talabartería no trae flechas. Hace falta generar una tienda nueva en el Generador de
  tiendas y mirarla desde el 🏪 del mapa (y que no salga la Flecha de punta roma).
- [ ] **🎯 Virote recuperable**: ninguna ballesta del catálogo trae el rasgo `recuperable`, así que no hay con qué probarlo en el mapa.
- [x] **🐺 Una invocación que recibe un rebote** (2026-10-12): el Virote de rebote rebotó hacia el Lobo de prueba (invocación de Clementino) y el
  **Probado el 2026-10-20 (Claude, «Test con claude elsaulo»):** con el Lobo invocado, el Virote de rebote erró contra Silvia y rebotó hacia el Lobo: le llegaron sus opciones de defensa (Evasión 1d1) y el duelo terminó normal; el virote quedó en el piso. **Arreglado:** la Mesa decía «La Virote de rebote»; ahora «El virote» y «entero».
  duelo dijo «No llegaron tus opciones de defensa». Puede ser porque el Lobo está sin invocar; revisarlo con una invocación invocada.

- [x] (2026-10-23, Claude, «Claude · pruebas», con las reglas ya pegadas: el Goblin 1 marcó un Acelerador al lado; el Goblin 4 lo pisó: 3 No2 − 1 del paso + 2 = 4, la Mesa y la Crónica lo contaron; el círculo con flechitas y «⏳10» se ve; borrado después) **⏩ Acelerador desde Firebase** (2026-10-12): hasta que el dueño pegue las reglas nuevas (`acelerador` en los elementos), crear uno da «faltan
  publicar las reglas nuevas» (se probó: cobra 1 SP y 1 No2 y pide la casilla, pero no se guarda). Después de pegarlas: ejecutar Acelerador (o usar
  una Runa aceleradora del Bazar), elegir la casilla y que los demás la vean.
- [ ] **🐈‍⬛ La animación «mala» de los dados de Enyetar** (2026-10-12): los datos salen bien (los dos juegos, `destacar: 'malo:idx:…'`), pero no se
  pudo ver la animación 3D (la ventana de Chrome estaba de fondo). Mirarla en una sesión real.

- [x] **✨ Carga Elemental** (Mago, 2026-10-13): un personaje con la skill lanza una skill de daño especial → «Carga Elemental» con los 5
  **Probado el 2026-10-20 (Claude, «Test con claude elsaulo»):** Silvia con Toque mágico contra el creep: Frío (12 → Escarcha ×3), Fuego (18 +50 % = 27), Ácido (13 → Armadura rota ×3), Tóxico (16 → Veneno ×5); cada estado quedó puesto en el creep.
  elementos y «Sin carga»; cobra la mitad del SP; Fuego (+50 % en el cuadro), Frío (Escarcha ×N según lo que entró), Ácido (Armadura rota),
  Tóxico (Veneno), Eléctrico (salta y 20 % de Parálisis solo al primero).
  **Probado en parte (2026-10-13, GM + jugador elsaulo):** la pregunta con los 5 elementos y «Sin carga» ✔; Eléctrico ✔ (Toque mágico, 28 al
  Escarabajo, saltó al Coloso con 14 → 41 → 27; Parálisis 20 % tirada en el cuadro, salió 8: no). Frío: el daño entró pero la Escarcha no — la
  aplicó otra pantalla del GM con código viejo (los mapas abiertos del dueño); en la pestaña recargada, 6 de hielo → Escarcha ×2 ✔. **Falta,
  con todos los mapas recargados:** Frío, Fuego, Ácido y Tóxico de punta a punta.
- [x] **⚡ Salto eléctrico, regla general** (2026-10-13): 4 casillas; la mitad de lo que entró; cada salto resta la Res. eléctrica; sin tope
  **Probado el 2026-10-20 (Claude, «Test con claude elsaulo»):** Varita de chispa eléctrica contra Silvia: saltó a 3 más (la varita dice 2 saltos: no hay tope), cada uno la mitad de lo que le entró al anterior (Lobo 6, Xeena 3, Aurelia 1) y cortó al llegar a 1.
  (la varita de chispa, el relámpago, la flecha de tormenta, la trampa Descarga y el ⚡ del menú de vida).
- [x] **🕳 Bajo tierra, lo que falta** (2026-10-14): un crítico de la Puñalada (Rengo 2 y Lisiado 1). El pozo visto como jugador ya se vio (con
  **Probado el 2026-10-20 (Claude, «Test con claude elsaulo»):** el creep con Excavar y la Puñalada desde abajo del Kobold tunelero: se mete en la tierra, sale al lado de Silvia (+3 PdG por salir de abajo); con crítico, los efectos pasan a Rengo 2 turnos y Lisiado 1 turno (en vez del Rengo 1).
  «👁 Ver como jugador», abajo, en Probado).
## Probado
- [x] **🏹 Contra un proyectil: «Esquivar (Agilidad)» y «Poner escudo»** (2026-10-29, «Claude · pruebas», con captura; dueño: «específicamente para
  proyectiles, que cambie el nombre»). El Tunelero dispara el Arco corto a Clementino: al jugador le aparecen «🏃 Esquivar (Agilidad)» y «🛡 Poner escudo ·
  Tapa de tacho de basura»; el GM, en el desplegable a mano, «Esquivar (Agilidad) / Poner escudo». Solo cambia el nombre: se tira lo mismo.
- [x] **🛡 Romper armadura que se come el escudo** (2026-10-29, «Claude · pruebas», GM + jugador, con capturas; dueño: «si alguien detiene un
  proyectil con un escudo, con un parry, y ese proyectil tiene adjunto romper armadura, debe aplicarle romper armadura específicamente al escudo»).
  El Tunelero dispara el Arco corto (Rompe armadura) a Clementino, que lo para con Parry de la Tapa de tacho de basura (elegido a mano, 9 contra 3):
  Mesa «🛡 Clementino paró el disparo con el escudo, pero el Rompe armadura se lo comió el escudo: −1 Defensa y −1 durabilidad»; al jugador le aparece
  el Aviso «💥 Arco corto te rompió Tapa de tacho de basura» (durabilidad 2 de 3, Defensa 1 → 0 hasta que lo reparen, y que en 0 se anulan sus efectos);
  y en 🛡 Equipo, debajo de las defensas, «🛠 Estado del equipo» con la pieza abollada (antes: «✔ todo lo que tenés puesto está entero»). Visto
  también en Petro (El origen, solo mirado): los soquetes de lona, «Durabilidad 1 de 3 · Armadura rota ×2 · ⚠ le queda 1 punto». **Arreglado
  probando**: con el Parry elegido a mano el duelo no sabía con qué escudo paró (ahora va al que tiene puesto), y el mapa seguía cargando la
  `ficha-acciones` vieja (faltaba subir la versión de la Botonera). Sin probar en el mapa: con porcentaje (tira el dado en la Mesa) y contra un creep.
- [x] **🚫 El Parry que no se puede usar, apagado y con el motivo** (2026-10-29, «Claude · pruebas», con capturas; dueño: «quiero que el botón de
  parry aparezca igual, pero apagado, con algún texto encima que dice no podés parrear, cosa que la gente no pregunte»). Golpe de escudo contra
  Warrior (Hacha y escudo): botón gris punteado «🚫 No se puede parrear · Parry · Hacha · Golpe de escudo no se deja parrear (sí esquivar)»; la Red
  contra Capataz: «🚫 No se puede parrear · Parry · Red se esquiva, no se parrea». Cubre también, sin probar en el mapa: un disparo cuando solo
  tiene arma (no escudo) y estar Expuesto (`Combatiente.parryApagado`, `sinParryDelAtaque`).
- [x] **🏹🛡🕸 Lo del encuentro 1 de El origen que faltaba ver** (2026-10-29, «Claude · pruebas», con capturas; Excavar lo probó el dueño: «anda
  perfecto»). **Flecha especial en una habilidad de disparo**: Tunelero (prueba) con Disparo señalador → «🏹 ¿Qué flecha?» → Flecha silbadora;
  el duelo dice «Flecha silbadora: Demora», los efectos juntan Presa y Marcado (la habilidad) con Demora (la flecha), la flecha bajó de 2 a 1 y
  el disparo cobró 2 No2. **Golpe de escudo** (Tanque con Escudo pequeño contra Warrior): 2 SP + 5 No2, «no se puede parrear» (solo Evasión),
  2d10 + 10 (peso 2), 18 de daño, Sentado y Demora 1. **Red** (Warrior contra Capataz): 3 SP + 2 No2, PdG contra Evasión, Inmovilizado 3 turnos;
  al empezar el turno de Capataz, «¿se suelta?» con Fuerza contra 7 y los aliados pegados invitados a ayudar; «¡SE SOLTÓ! (11 contra 7)».
  **Excavar sin Parry** (el mismo día, dueño: «se puede esquivar, pero no parrear»): saliendo de abajo con la Daga, el duelo dice «no se puede
  parrear» y Capataz (que tiene un garrote) solo puede esquivar. Ajuste hecho de paso: la Demora de un creep va solo a la Crónica (el Aviso al
  centro le tapaba al GM los otros efectos del duelo). Visto y no tocado: en la Red, el que la tiró aparece como ayudante si es del mismo bando
  que el atrapado (solo pasa en pruebas creep contra creep; en partida es rival y no aparece).
- [x] **⏬ El orden de turnos: ▲▼, demorar el turno, la Demora y «¿vuelve a actuar?»** (2026-10-29, «Claude · pruebas», con capturas; dueño: «si toco
  la flechita para abajo, el que está abajo y el que toqué intercambian posiciones»; «nunca pasar de ronda»; «cada uno tiene un turno por ronda»; «lo
  visual va a ser lo que regule los órdenes de las rondas»). Con Warrior, Capataz, Tanque, juan y Chamán: ▼ en el que tiene el turno → le toca al de
  abajo y él juega justo después, sin volver a recargar («retoma el turno que había demorado»); ▼ entre dos que faltan y entre dos que ya jugaron →
  se cambian y el turno no se mueve; las flechas que cruzarían la línea de la ronda, apagadas; la Demora 2 a uno que ya jugó → queda atenuado en su
  lugar; la Demora en su propio turno → baja al terminarlo («Tanque baja 1 lugar (2.º → 3.º)»); al llegarle a uno que ya jugó → el cartel «¿Vuelve
  a actuar?»: Sí → juega sin recargar ni contar turnos (ni al empezar ni al terminar); No → se saltea; la ronda 2 arrancó una sola vez y en el
  orden que mostraba la lista. **La Demora desde el duelo, probada el mismo día** (dueño: «poné algún arma que ofrezca demora segura»): con una
  «Maza de prueba (Demora segura)» (Tipo 10, Demora siempre) en Warrior y el Bate de Tanque con Demora siempre, tiradas a mano (6 contra 1):
  (1) Warrior, en su turno, le pega a Tanque, que no jugó → «✔ Aplicado · baja 1 lugar (2.º → 3.º)», el turno sigue con Warrior; (2) Warrior
  le pega a Capataz en el turno de Capataz → «es su turno: baja 1 lugar cuando lo termine» y, con ▶, «Demora: Capataz baja 1 lugar (2.º → 3.º)»;
  (3) Tanque le pega a Warrior, que ya jugó → «baja 1 lugar (1.º → 2.º)», queda atenuado después de Tanque, y con ▶ el cartel «¿Vuelve a
  actuar?» para Warrior y para Capataz (No → se saltean, le toca a juan). Ojo: la Demora se aplica recién después de «Aplicar el daño» (como los
  demás efectos). Las armas quedaron como estaban. **El Aviso de la Demora** (mismo día, dueño: «tiene que aparecer un anuncio: fuiste
  demorado, tu posición en la tabla»), probado del lado del jugador (Clementino, desde la cuenta de su dueño): Warrior le pega con la maza →
  a la pantalla del jugador «⏬ Clementino fue demorado por Warrior (prueba) · Fuiste demorado: bajás 1 lugar en el orden de turnos: ahora estás
  3.º (estabas 2.º)» con Entendido; en su propio turno → «Es tu turno: cuando lo termines, bajás 1 lugar»; al tocar él «✅ Terminar turno» →
  «Terminó tu turno y, por la Demora, bajaste 1 lugar: ahora estás 4.º». **Falta**: verlo el dueño en una sesión.
- [x] **🔮 Los ocho talismanes que faltaban** (2026-10-18, «Test con claude elsaulo», con capturas): **Piedra bezoar** (Veneno ×3 → ×2 en la
  ficha; ojo: el cuadro del duelo sigue diciendo «le llegó Veneno ×3», porque lo baja la ficha al recibirlo), **Bola de cristal** (un creep en
  sigilo a la vista → el paso «🔮 Bola de cristal» en «Empieza tu turno»), **Sahumerio** (1d4 → 4 se llevó Pajaritos; **arreglado**: el cartel
  mostraba una tirada y al aplicar se tiraba otra; ahora el azar queda fijo por turno, y el estado dice «se lo llevó el humo»), **Brújula**
  («−0 No2 (1 casillero gratis)»), **Muñeco vudú** en un creep (Debilitado 1 turno; con 0 de daño no salta, a propósito), **Orbe de resguardo**
  (Vida extra 2 al ganar el PdG.Esp), **Anillo de tormenta** (el rayo saltó a 5 casillas) y **Ekeko** (+20 %; **arreglado**: daba 9,6 DDE, ahora
  entero y para arriba).
- [x] **🩸 Maldito** (2026-10-17, «Test con claude elsaulo», GM con 🎮 el control de Xeena): con Maldito y una habilidad de 2 SP, «Ejecutar» →
  «Estás Maldito: usar Chispa de prueba cuesta 2 SP y te va a bajar 2 de vida (5 → 3)»; Cancelar no cobró nada; Aceptar: vida 5 → 3, SP 3 → 1 y
  en la Mesa «🩸 Maldito: pagar 2 SP (Chispa de prueba) te sacó 2 de vida (5 → 3)». Mapa limpio después.
- [x] **▶ Empieza tu turno** (2026-10-17, «Test con claude elsaulo»): Xeena con Bendecido (2 turnos), Regeneración (pasiva) y 1 de vida. Al
  pasarle el turno: sin el control, el GM vio «▶ Aplicar por él» en la Crónica y al tocarlo se aplicó (Bendecido 2 → 1, +3 HP, 1 → 4); con 🎮 el
  control, el cartel al centro «Empieza tu turno» (Tus estados · Vida y SP · No2) → «✔ Aplicar» → «✔ YA SE APLICÓ»; cerrándolo sin aplicar y
  pasando el turno, se aplicó solo («✔ Se aplicó solo al pasar el turno»). Mapa limpio después.
- [x] **💔 Duelo: «Aplicar el daño»** (2026-10-17, «Test con claude elsaulo», GM con 🎮 el control de Xeena): el Creep de prueba le pegó
  (empate resuelto con par) y tiró 2d8+1 = 6: el paso 5 quedó en «6 de daño, menos tu Defensa» con «💔 Aplicar el daño» y la vida sin tocar; al
  tocarlo: «6 de daño (6 − Defensa 0) · Xeena: 5 → 0 HP». Falta: la variante del GM «Aplicar por …» con un personaje de otra cuenta.
- [x] **💥 Trampa que explota** (2026-10-17, «Test con claude elsaulo», GM con 🎮 el control de Xeena): una trampa en flor con «Explota»: al
  pisarla, las 7 casillas se encendieron con la onda y el mapa quedó quieto; 1,5 s después, el anuncio («🎲 Tirar el daño», «💔 Aplicar el daño (3)»,
  «Entendido»). Captura de la explosión en la conversación. Falta: verlo el dueño y un jugador desde su cuenta (pendientes, 🖥).
- [x] **💔 Trampas: el daño en dos pasos** (2026-10-17, «Test con claude elsaulo», GM con 🎮 el control de Xeena): al pisar una trampa de 1d6,
  «🎲 Tirar el daño (1d6)» → «1d6 = 4» y el paso «Aplicar el daño: 4 de daño, menos su Defensa. ⚙ Al tocar el botón se descuenta solo…» →
  «💔 Aplicar el daño (4)» → «4 − Defensa 0 → 4 de daño · ✔ ya se descontó de la vida (5 → 1)» → «¡CAYÓ EN LA TRAMPA!». Mapa limpio después.
- [x] **🕊 Vuela como pasiva: trampas y zonas del piso** (2026-10-17, «Test con claude elsaulo», GM): con la pasiva Vuela, un creep cruzó una
  zona de púas del piso (de un personaje) y un personaje (Xeena, con 🎮 el control) cruzó una trampa escondida del GM: ni la trampa se disparó
  ni las púas pegaron, sin cartel de «pisaste algo». Contraprueba sin la pasiva: al creep las púas le sacaron 3; a Xeena la trampa la frenó y le
  pegó 1d6. Mapa limpio después (sin trampa, sin zona, control devuelto, modo narrativo).
- [x] **🕊 Vuela** (2026-10-16, «Test con claude elsaulo», GM): un creep con Vuela cruzó por encima de Silvia Suller: se frenó al lado con
  «⚔ … pasa por encima de Silvia Suller · ¿Ataque de oportunidad?», al dejarlo pasar siguió hasta el destino sin un segundo ataque; con un
  rival sin No2 (Sandro) no se ofrece. Falta verlo desde la cuenta de un jugador (las abejas de Bizzante).
- [x] **¡Tu vieeeja! (provocación de creep) y Tapa de barril** (2026-10-16, Kobold escudero de barril de El origen; no se prueba ahí, hace falta una copia en una partida de prueba): que la Botonera resalte a 3 casilleros, tire Fuerza contra Res.Esp y ponga Provocado 2 turnos; que la Tapa sume +3 Defensa, +3 Armadura mágica y +1 de resistencia a crítico por 1 turno.
  **Cambiado después (dueño, 2026-10-20: «es la misma skill»):** ahora igual que el Taunt — PdG.Esp +1 contra Res.Mt, dentro de su Rango (no 3), Provocado 2 turnos.
  **Probado el 2026-10-20 (Claude, «Test con claude elsaulo»):** copiadas del Kobold escudero de barril (El origen, solo lectura) al creep de prueba. ¡Tu vieeeja!: resalta solo a los que están a 3 o menos (Xeena a 3, Silvia a 2; Aurelia a 6 no), Fuerza contra Res.Esp, Provocado 2 turnos en la ficha de Silvia. Tapa de barril: Defensa 0 → 3, Defensa especial 0 → 3, resistencia a crítico +1 en los cinco Tipos, 1 turno, 1 No2 y cooldown 2.
- [x] **📣 Llamar refuerzos** (2026-10-16, «Test con claude elsaulo», GM): una copia de la Rata de alcantarilla con «Plaga en la galería»
  (`refuerzos: {cant: 2}`) → Acciones → Ejecutar: cobra 2 No2 y el cooldown, la Mesa la anuncia, aparece «elegí dónde aparece (1 de 2)», dos
  clics → dos «Rata de prueba (refuerzo)» en esas casillas, 30/30, No2 llenos, sin la Plaga, en el orden de turnos detrás de la que chilló.
  Todo borrado al terminar. **Falta**: el editor de creeps no tiene todavía un campo para armar `refuerzos` (se carga el dato).
- [x] **⏸ Mapa en pausa: mirar sí, tocar no** (2026-10-16, El origen, pantalla del GM en modo jugador solo en el navegador, sin guardar nada):
  arrastrar mueve la vista, la rueda hace zoom (1 → 1,76). Después (dueño: «ver lo mismo que durante una partida»): tocar un token sí lo
  selecciona y abre su menú (vida, No2, estados, ⋯, la tarjeta 🪪 de un creep), pero sin ↻ girar, sin ⚡ Botonera y con los números sin
  poder cambiarse. **Falta**: verlo con una cuenta de jugador de verdad. (🃏 La carta de arriba con el número, probada igual, local.)
- [x] **🃏 Wildcards: descanso y ventana** (2026-10-16, «Test con claude elsaulo», GM con el control de Silvia Suller): ⏳ Pasar de día → «¿Cómo
  descansaron?» → 🌙 Descanso reparador: Silvia queda con 2 wildcards (la Mesa lo dice); en su ficha suelta la cartita «Wildcards ×2» abajo a
  la izquierda; tirar Fuerza (1) → la carta → «🃏 Wildcard»: re-roll 4, quedan 1, la original «ya se repitió». La partida quedó en el Día 1.
- [x] **▶ Es su turno (clic derecho en la iniciativa)** (2026-10-15, «Test con claude elsaulo», GM, con Xeena / Aurelia / Silvia de prueba):
  le tocaba a Xeena; clic derecho en Silvia → *Turno libre*: le toca a Silvia (⚡ arriba), no pasa el turno; «↩ Volver a Xeena» lo devuelve sin
  tocar nada. Clic derecho en Silvia → *Turno normal*: termina el de Xeena, empieza el de Silvia («se lo dio el GM»), el contador de turnos
  sube. Orden de turnos vaciado al terminar. **Falta**: en un combate real con creeps (que bajen los cooldowns en el normal y no en el libre).
- [x] **«＋ Demora» y el primer «Editar» desde las Acciones** (2026-10-15, El origen, GM, sin combate): Acciones del Goblin hondero (2) →
  Lluvia de piedras → Ver → ✎ Editar: abre al frente al primer clic (antes quedaba arriba, fuera de la vista) y sin el cartel de la pausa
  encima; Costo → «Un número» 5; Ejecución → Efectos: quitar la Demora y volver a ponerla con «＋ Demora» (tarjeta «baja un lugar en el
  orden de turnos», sin turnos ni bonos); guardado: 5 No2 · 2d6 · Demora. **Falta**: verla aplicarse en un combate real.
- [x] **✨ El editor de la Ejecución como el cuadro del duelo** (2026-10-15, Claude · pruebas, GM): Acciones de «Bosque (prueba)» → Ver → ✎ Editar →
  Ejecución: se abre el cuadro del duelo (Declaración, Contacto con «Pagar y tirar PdG» y «Elegí cómo te defendés», Bloqueo, Crítico, Daño,
  Efectos) con el 📜 a la izquierda; tocar «Tirar el daño» abre lo suyo debajo. Cerrado sin guardar. (Antes, «Editar» desde las Acciones no
  abría nada: arreglado.) **Falta**: que el dueño edite una de verdad y la ejecute.
- [x] **🗡 Ataque por la espalda, 👣 Pasos silenciosos y ↻ darse vuelta** (2026-10-15, Claude · pruebas, GM rolpintoista): «Bosque (prueba)» a
  la espalda de Clementino → el duelo declara «🗡 por la espalda: +1 PdG» y el PdG sale «1d12 +1 espalda → 5 + 1 = 6» (duelo cancelado, «No cuenta»).
  Con la pasiva «Pasos silenciosos» puesta desde GM Tools (+ Pasiva): el bono pasa a +2 y la tarjeta pública la publica; con «👁 Ver como jugador»
  pegado a Clementino se lo ve y a 2 casilleros por la espalda no (queda el «?»). Sin la pasiva, en combate y con el GM con 🎮 el control de
  Clementino: alejarlo y volver a acercarlo por la espalda → «Pasos a tu espalda… ¿Se da vuelta?» → «↻ Darse vuelta» giró a Clementino hacia él
  y la Crónica dijo «↻ Clementino oyó a Bosque (prueba) y se dio vuelta»; con Bosque pegado al frente, la Bruja llegando por atrás → «¡Flanqueado!».
  Control devuelto y modo narrativo. **Falta**: verlo desde la cuenta de un jugador (la oferta le sale a su pantalla, la misma pieza).
  Visto de paso (aparte): al cancelar el duelo «No cuenta», un creep que había atacado sin No2 suficientes (pagó 3 de 4) recibió de vuelta 4.
- [x] **📜 «Detalles técnicos» aparte en el recuadro del duelo** (2026-10-15, Claude · pruebas): Flecha a la rodilla de «Bosque (prueba)» →
  el recuadro dice solo «Le apunta a las piernas.» y «▸ Detalles técnicos» despliega «⚙ Automatizado… ✋ A mano…». El «FLASH» con su globo
  (Sonic Boom de Clementino) lo está mirando el dueño.
- [x] **👂 El oído (punto ciego)** (2026-10-15, Claude · pruebas, GM con «👁 Ver como jugador»): «Bosque (prueba)» a 4 casilleros por la espalda
  de juan → los jugadores no lo ven; a 2 → aparece (atenuado, porque la casilla sigue en penumbra: oírlo no descubre el terreno). El Ladrón en
  sigilo, pegado a juan, sigue sin verse. Falta probar los pasos silenciosos cuando exista algo que los dé (P200).
- [x] **📜 El texto de la habilidad en el duelo, ✍ Elegir manualmente y 💨 Prisa** (2026-10-15, Claude · pruebas, GM con «Bosque (prueba)»):
  la pasiva Prisa puesta desde GM Tools (+ Pasiva) → al ordenar los turnos, Bosque (1) quedó arriba de juan (2). Flecha a la rodilla → el duelo
  muestra a la izquierda «📜 Flecha a la rodilla» con su texto, y se va al cerrar. ✍ en la defensa: «2» a mano → la Mesa dice «Evasión 2 (manual)»
  y pegó; ✍ en el daño: «1» con «no resta» → «✍ sin restar Defensa: 1» y «1 − Defensa 0». **Falta**: el recuadro en el editor de la Ejecución
  (va a cambiar con el rediseño, ver «🖥 Para cuando el dueño está en la compu» en pendientes).
- [x] **⌨ A = Atacar, B cierra, flechas, 🔭 y el duelo cancelado** (2026-10-15, Claude · pruebas, GM con el creep «Bosque (prueba)»): A abrió
  las Acciones y apretó Atacar; el mapa se encuadró solo en el creep y los que brillan; las flechas movieron el mapa sin cancelar; «🔭 Ver mis
  objetivos» encuadró; B cerró las Acciones con juan seleccionado. Duelo: pagó y tiró el PdG (No2 8 → 7, 1 ataque) → «Cancelar duelo» →
  «¿Cuenta como un ataque hecho? Es para calcular los No2…» → «No cuenta» → No2 de vuelta a 8, 0 ataques, aviso y línea en la Mesa. Falta ver
  lo mismo con un personaje (misma pieza: el gancho de FichaDuelo).
- [x] **💤 Inactivos, 📦 Vender el baúl, el Ver de las habilidades y lo nuevo de los goblins del Bosque** (2026-10-15, Claude · pruebas):
  en el menú 👥 Personajes del mapa, ✓ al lado de cada uno → juan tachado (💤) y GM Tools lo ve afuera; «📦 Vender el baúl» (Daga + 2 Velas +
  10 DDE) → «Total 57,5 DDE → 57,5 para cada uno de Clementino» (juan inactivo, no cuenta), el baúl quedó vacío, la recompensa de Clementino
  pendiente para su ficha, el registro y la Mesa. El Ver de «Flecha a la rodilla»: «Detalle» arriba y «Detalles técnicos» aparte. Flecha a la
  rodilla (creep con arco) → pegó, Rengo aplicado y además el Envenenar 25 % del arco; ¡Azuzar! → Crítico potente al Escarabajo; ¡Por el amo! →
  Bendecido a los aliados a 3 (Escarabajo y Ladrón), de a uno.
- [x] **🌲 Bosque, combinaciones nuevas** (2026-10-14, Claude · pruebas, creep «Bosque (prueba)» con las cuatro): **No siente el dolor** → elegís
  objetivo, clic en sí mismo → Endurecido aplicado; **Aullido de la manada** → solo a los aliados a 3 (un Escarabajo y el Ladrón, de a uno), Acelerado
  1 turno, juan no; **Grilletes de sombra** → PdG.Esp 9 contra Res.Esp 1 → Inmovilizado 1 turno «le llegó a su ficha»; **Lluvia de piedras** → clic
  en el centro, PdG contra Eva, «Tirar el daño · 1d4+1 · se le resta la Defensa», 3 − 0. Ojo: con la honda (Tipo 10) cada ataque cuesta 5 No2.
- [x] **🫳 Robo en sigilo, en secreto + Marcado al perder el sigilo** (2026-10-14, GM rolpintoista + juan de elsaulo, las dos ventanas a la vista):
  ladrón en sigilo → Bolsillo ajeno → sin duelo ni Mesa; el GM ve «Robo en secreto» con su Sigilo (8, con +2); juan ve «🤨 ¿Sentiste un movimiento
  raro? juan, tirá Percepción». 1.ª vez: 9 contra 8 → «¡Lo pescaste! …» y en la Crónica «¡juan pescó a Ladrón (prueba) metiendo mano en su
  cinturón!»; el ladrón quedó sin sigilo y **Marcado 2t**. 2.ª vez: Sigilo 11, Percepción 7 → «Mmm… Puede que estés flasheando», la Vela de sebo
  pasó callada y al empezar el turno de juan le apareció «Sentís el cinturón más liviano… y te das cuenta de que te falta: Vela de sebo».
- [x] **🗡 Golpe doble del Ladrón del monte** (2026-10-14, Claude · pruebas, en el «Ladrón (prueba)»): Ejecutar → juan → el duelo dice «con
  Cuchillo · Tipo 4 · +1d4 de daño», «Los No2 de este ataque ya los cobró la habilidad»; PdG 4 contra Evasión 1 → pegó; daño «1d4 + 5 + 1d4» =
  10 − Defensa 2 = 8. Sin probar: el +2 por la espalda en sigilo.
- [x] **🫳 Robar** (2026-10-14, Claude · pruebas, GM rolpintoista + juan de elsaulo): el «Ladrón (prueba)» pegado a juan ejecuta Bolsillo
  ajeno → brillan los que están a 1 casillero → clic en juan → el cuadro «Sigilo contra Percepción» (Sigilo 1d10+1 = 5, Percepción de juan
  tirada a mano = 1) → ¡Funcionó! → «✔ Aplicar Robo sobre juan» (solo lo ve el GM) → «le robó Cepo de prueba». El Cepo quedó en el cinturón
  del ladrón, la Crónica dijo «Ladrón (prueba) le robó a juan · Se llevó: Cepo de prueba», salió el cartel «🫳 huye con lo robado» y al
  arrastrarlo 2 casilleros se cerró sin ataque de oportunidad. La ficha de juan descontó el Cepo sola (queda Púas). Arreglado en el camino: un
  segundo robo antes de que la ficha del robado guarde ya no se lleva la misma unidad (mira los avisos de robo pendientes). Con el ladrón en Sigilo, el botón dijo «Tirar Sigilo (+2 en
  sigilo) · 1d12+1» (9 contra 1) y se llevó las Púas. Sin probar: el +2 por la espalda (sin sigilo).
- [x] **⚙ Dibujos: color, sin relleno, ⭕ puntas cerradas, figura sólida** (2026-10-14, con capturas, reglas pegadas): a la pared en L se le
  cerraron las puntas desde el ⚙ (quedó un triángulo), pasó a rojo y con relleno tenue; adentro no se dibuja la grilla y sus 7 casillas
  cuentan como sólidas; «sin relleno» la deja como línea roja cortada para el GM y casi invisible como jugador. Todo se guarda.
- [x] **❄ Granizo de cristal** (2026-10-14, copia «Chamán (prueba)», con capturas): centro en juan, flor con fuego amigo → cascada de 4 con
  un solo PdG.Esp (6). Escarabajo 6 de daño → Escarcha ×1; Tunelero 6 → Escarcha ×1; juan 4 → nada; Capataz 3 → nada.
- [x] **👁 Ver como jugador** (2026-10-14, con capturas): desde el menú del ojo, el GM ve el pozo en vez del tunelero bajo tierra, la niebla de los
  jugadores y el cartel «Estás viendo el mapa como un jugador»; tocándolo vuelve.
- [x] **🕳 Excavar y Puñalada desde abajo** (2026-10-14, «Claude · pruebas», con capturas): Excavar cobra 1 No2 y cooldown 3, lo anuncia, el
  token queda transparente para el GM y bajo tierra (reglas pegadas). Puñalada: «¿por dónde sale?», sale pegado a juan con la tierra que salta,
  pide el objetivo, el duelo dice +1 PdG y +1d6, Crítico frecuente (1); pegó (3 contra 1), 10 − 2 de Defensa → Rengo 1 turno, aplicado.
- [x] **👷 ¡A laburar! y Golpe al piso** (2026-10-14, «Claude · pruebas», con capturas): el grito arma la cascada solo con los aliados
  (Escarabajo y Tunelero; juan no) y les pone Bendecido 2 turnos. Golpe al piso: una casilla lejana se rechaza y vuelve a pedir («en una casilla
  pegada»); sobre juan, solo él (los kobolds de al lado no); PdG 6 contra 1, daño 25 − 2 = 23 (30 → 10, el escudo absorbió 3), Sentado aplicado.

- [x] **⚔ Contraataque** (Warrior, 2026-10-13; GM rolpintoista + jugador elsaulo, los dos mapas recargados): el Escarabajo (copia) ataca a juan
  (con la skill); «Elegí cómo te defendés» muestra en la Evasión «⚔ si esquivás, podés contraatacar…»; juan esquiva (29 contra 1) y aparece
  «Esquivaste: ¿contraatacás…? (Contraataque)»; con «Sí», SP 40 → 38 y se abre el duelo «Contraataque» con su Arco corto; al tirar el PdG,
  No2 10 → 8 (un primer ataque); pegó (6 contra 3), 3 de daño (Escarabajo 12 → 9). Duelos terminados en los dos mapas. Sin probar: el caso
  «no lo alcanza» (hace falta un atacante a distancia más lejos que el alcance de quien esquiva).

- [x] **🩸 Transfusión sanguínea** (2026-10-13, con la cuenta del jugador dueño —elsaulo—, sin tomar el control, con todos los mapas recargados):
  Clementino → juan: los carteles «¿quién da?», «¿quién la recibe? (da: Clementino)» y «¿cuánta vida? … Como mucho 9» (juan en 21 de 30); con «9 (lo
  máximo)», Clementino 22 → 13 y juan 21 → 30, sin dejar ningún estado; la Mesa lo contó. (Una primera vuelta con mapas sin recargar dejó un estado de
  vida por turno: arreglado, el número viaja en `vida`.)

- [x] **🔁 Repetición** (2026-10-13, juan con el Arco corto; la pestaña estaba en segundo plano, así que los botones se tocaron desde adentro de la
  página): X = 3 cobró 3 SP y 0 No2; tres disparos al Coloso: el 1.º sin bono, el 2.º «repetición (+1)» = +1 PdG y +1d4, el 3.º +2 PdG y +2d4, y el
  estado se fue. Con X = 2: un disparo al Coloso y el siguiente al escarabajo → sin bono, «se cortó la Repetición» y el estado se fue. Los duelos de
  prueba se cancelaron (no se tiró el daño). Visto: con flechas especiales en el carcaj, el ataque pregunta «¿Qué flecha?» primero.

- [x] **✨ Smite** (2026-10-13, juan con el control del GM): contra el Coloso marcado como no-muerto, sin tirada, la Mesa avisó «lo sagrado le pega el
  doble» y tiró 2d4 = 6 directo a la vida (47 → 41).
- [x] **🌩 Tormenta arcana, con clics** (2026-10-13, después de que el dueño recargó los mapas): 20 proyectiles (escarabajo 8, Lobo 7, Coloso 5); el
  escarabajo salió del área arrastrándolo y «revisar» dio «esquivó»; el Lobo «sigue adentro» → 7d4 = 18 directo (8 → 0); el Coloso → 5d4 = 12 (59 → 47).
  **Arreglos**: los sub-duelos repetidos con varias pantallas del GM (ahora se reserva el lugar con una transacción: `areaCrearSiguienteSubDuelo`) y el
  título del cartel del dodge roll («Le cae la tormenta a X (8d4)» en vez de «ganó la Evasión»). Al terminar, todo cerrado y el mapa limpio.

- [x] **🌩 Tormenta arcana** (2026-10-13, «Claude · pruebas», el GM con el control de juan; la pestaña quedó oculta, así que la ejecución y el centro
  se hicieron con las mismas funciones que llaman los botones): cobró 5 No2 (12 → 7); el cartel «marcá el centro» se vio; con el escarabajo, el Coloso
  y el Lobo (aliado) adentro, la Mesa contó el reparto (salió 1 proyectil, al escarabajo); el sub-duelo arrancó en el dodge roll; «sigue adentro» →
  1d4 directo a la vida (13 → 12). Visto: otra pantalla del GM con la **versión vieja** del mapa (los mapas que quedaron abiertos) creó un segundo
  duelo que saltaba directo al daño — hay que recargar esas pantallas después de cada cambio.

- [x] **🏃 Sprint** (2026-10-13, «Claude · pruebas», el GM con el control de juan, modo combate): Ejecutar cobró 1 SP y 2 No2 (12 → 10) y dejó el
  estado Sprint con 3; usarla otra vez preguntó «se usa una vez por turno… ¿Usarla igual?» y al cancelar no cobró nada. Arrastrar 4 casilleros costó
  1 No2 («−1 No2 · te quedan 9») y el estado se fue al usar los 3. Detalle visto: los numeritos de la estela cuentan pasos, no lo que costó (con los
  pasos gratis de los pies pasa lo mismo).

- [x] **🏹 Proyectil perforante** (2026-10-13, «Claude · pruebas», el GM con el control de juan, Arco corto): juan → Escarabajo (copia) con el
  Coloso detrás en la misma línea. PdG 9 contra Evasión 1 → pegó; al terminar se abrió solo el segundo duelo contra el Coloso con la misma tirada
  (solo pidió su Evasión): crítico ×3, 18 de daño, sin efectos. **Arreglo encontrado**: con dos pantallas del GM abiertas se abrían dos duelos
  iguales; ahora una marca en la Crónica (`perf-<duelo>`) deja seguir a una sola (verificado: de dos intentos, uno solo pasa).
- [x] **🩸 Balas de sangre** (2026-10-13, juan con Especial 14): el cartel del costo trae «Vida (HP) a gastar» y el tope «de 1 a 14»; con 20
  avisó y no ejecutó; con 4 cobró 1 SP, 2 No2 y 4 de vida (30 → 26), duelo PdG 3 contra Evasión 1, daño 4d4 = 8 (23 → 15).
- [x] **🌀 Remolino** (2026-10-13, juan con el Caronero, Escarabajo al lado de la salida y Coloso al lado de la llegada): pidió la casilla del giro,
  juan se movió gratis y el área tomó a los dos; un solo PdG (4) contra la Evasión de cada uno, daño 1d6+3 menos la Defensa (al Coloso, 9 − 16 = 0),
  sin dodge roll. **Arreglo encontrado**: el cartel de instrucciones de «elegí una casilla» se escondía en el redibujo (afectaba también al centro
  de un área y al teleport); corregido (`actualizarAvisoColocacion`, js/09). Visto también: con dos pantallas del GM, la cascada del área abre dos
  sub-duelos iguales (riesgo ya anotado de los hechizos de área).
- [x] **⟳ Pasar de ronda en GM Tools** (2026-10-13): con el mapa abierto, al pasarlo a combate (con la lista de turnos armada) el botón se escondió
  en GM Tools, y volvió al pasar a narrativo.

- [x] **🧱 Los rivales cortan el paso** (2026-10-12, «Claude · pruebas», el GM, modo combate): la Bruja del pantano arrastrada en línea recta
  contra Clementino (rival) y un casillero sólido: la línea los rodea por arriba mientras se arrastra (captura enviada al dueño). El Escarabajo
  arrastrado hasta la casilla del Coloso (aliado): quedó en la de al lado y pagó 2 No2 en vez de 3.
- [x] **🧭 El rodeo automático** (2026-10-12, «Claude · pruebas», el GM con el control de juan): con una flor sólida de 7 casillas (puesta solo en
  esa pantalla) justo debajo de juan, se lo arrastró derecho 4 casilleros hacia abajo, a través de la flor: llegó al otro lado pagando 6 No2
  (30 → 24), o sea que el camino rodeó el obstáculo en vez de chocarse.

- [x] **🎯 Headshot** (2026-10-12, «Claude · pruebas», el GM con el control de juan, con el Arco de pastor): «Headshot · 4 No2 (ataque con Arco de
  pastor) · 4 SP»; el duelo muestra «+2 PdG · +5 de daño fijo» y en el crítico «Headshot suma +1 a tu Crítico frecuente / potente». Contra el Coloso
  salió triple crítico; con un estado de prueba de resistencia a crítico 20, pegó sin crítico → «🎯 SIN CRÍTICO: Headshot no hace nada».
  **Arreglado en el camino:** la resistencia a crítico de los creeps y las invocaciones no sumaba la de sus estados (Endurecido en un creep no
  servía en el duelo); ahora sí.
- [x] **📐 El cartelito del lápiz en rectas** (2026-10-12): con el lápiz en rectas, al lado del puntero sale «Clic para empezar · doble clic para
  terminar» y, ya empezado, «Doble clic para terminar · Esc descarta».

- [x] **🛡 Endurecimiento** (2026-10-12, «Claude · pruebas», el GM con el control de juan): Endurecimiento 1 No2 · 5 SP; pidió el objetivo (brillaban los
  aliados), juan se lo puso a sí mismo: Defensa 0 → 3, Armadura mágica 0 → 3, resistencia a crítico 0 → 1 en los cinco Tipos, 2 turnos.
- [x] **😵 Confusión** (2026-10-12, «Claude · pruebas», el GM con el control de juan): Confusión 2 No2 · 5 SP; PdG.Esp 8 contra Res.Esp 2 del Coloso →
  Confusión 2 turnos. Al mover al Coloso salió el cartel «está confundido: tirá antes» con el d4 (se cerró con «Ahora no»). (El cartel «¿Tomar el
  control?» que parecía salir dos veces no era un error: el primer clic de la prueba no llegaba a apretar el botón.)

- [x] **🏹 Parry a distancia** (2026-10-12, «Claude · pruebas», el GM con el control de juan, que tiene el Arco de pastor): el Coloso atacó a juan y en
  «Elegí cómo te defendés» apareció «🏹 Parry a distancia · Arco de pastor» (Evasión 1d8, 4 No2 del disparo + 2 SP, el aviso del dodge roll). Cobró
  4 SP (turno ajeno) y los 4 No2; PdG 3 contra Evasión 5 → «¡INTERCEPTADO!». Con el arco, el contraataque no aparece hasta el dodge roll: salió el
  cartel «dodge roll para contraatacar», juan se alejó 1 casillero (−1 No2) y recién ahí el duelo ofreció «¿contraatacás?».

- [x] **🧚 Afortunado y ⏩ Acelerador (dibujo y pisada)** (2026-10-12, «Claude · pruebas», el GM con el control de juan): con Afortunado aparece el
  botón 🧚 (verde, al lado del 🐈‍⬛ y el 💪); juan atacó al Coloso, el 🧚 ofreció «juan · PdG (6)», cobró 10 SP (turno ajeno) y repitió: «6 y 6 →
  queda 6», con los dos juegos de dados en la Mesa. El Acelerador (puesto solo en esa pantalla, sin las reglas) se ve como un círculo verde con dos
  flechitas que avanzan y el ⏳ abajo; juan pasó por encima moviéndose 3 casillas: −3 No2 y +2 del Acelerador (29 → 28).

- [x] **🐈‍⬛ Enyetar** (2026-10-12, «Claude · pruebas», el GM con el control de juan): con Enyetar aparece el botón fijo 🐈‍⬛ (violeta, al lado
  del 💪). juan atacó al Coloso; el 🐈‍⬛ ofreció «Coloso · Evasión (1)»; fuera de su turno cobró 10 SP y la maldición se abrió directo contra el
  Coloso (sin marcarlo en el mapa): PdG.Esp 8 contra Res.Esp 1 → «repite su Evasión: 1 y 2 → queda 1 contra 11; el duelo se volvió a
  resolver», con la tirada repetida en la Mesa. Después, esa tirada ya no aparece en el menú (una vez por tirada).

- [x] **🏹 Acelerado** (2026-10-12, «Claude · pruebas», el GM con el control de juan): Acelerado 2 SP; usado dos veces seguidas (2 + 3 SP, la
  tercera ya marcaba 4), el «Atacar» con el arco pasó de 4 a 2 No2. Que lo gaste el disparo y que se vaya al terminar el turno quedó en las
  pruebas automáticas (en el mapa no era el turno de juan).

- [x] **💪 Empower** (2026-10-12, «Claude · pruebas», el GM con el control de juan): en combate aparece el botón fijo 💪 (naranja, el brazo
  hace fuerza y titila una chispa); juan atacó al Coloso (PdG 10 contra Evasión 1) y, antes de los d20 del crítico, el 💪 ofreció «juan · PdG
  (10) · 2 SP (turno ajeno 4)»; fuera de su turno preguntó y cobró 4 SP, el PdG quedó 13 y el duelo se volvió a resolver. Un segundo Empower
  sobre la misma tirada ya marcaba «3 SP (turno ajeno 5) · ya lleva 1 Empower». Al devolver el control, el botón se fue (ya no lo maneja el GM).

- [x] **⟳ Pasar de ronda** (2026-10-12): el botón del GM se llama así (antes «⟳ Mantenimiento»); en combate con la lista de turnos (7 en el
  orden) desaparece, y al volver a narrativo aparece de nuevo.
- [x] **⏳ Pasar de día** (2026-10-12, «Claude · pruebas», el GM con el control de juan): Día 1 → juan con vida 5, SP gastado, No2 2, Veneno y
  Endurecido: quedó vida 30/30, SP y No2 llenos, sin Veneno ni Endurecido (Sigilo y Shield, permanentes, quedaron); la Mesa: «☀ Día 1: juan descansó —
  vida 5 → 30 · SP lleno · No2 lleno · terminaron: Endurecido, Veneno», la Crónica y la cabecera «☀ Día 1»; la góndola se repuso (11 gastables). Día
  2: vida 10 → 30. Visto en el camino y arreglado: la escucha del día no arrancaba si el mapa arrancaba antes de cargar el archivo. **Falta**: un
  jugador que no estaba conectado y lo recibe al entrar.
- [x] **🔧 Reparar sin herrero** (2026-10-12, «Claude · pruebas», el GM con el control de juan, talento «Reparar equipo» nivel 1 y un Óleo
  reparador): en combate, Equipo y mochila muestra la sección 🔧 Reparar con «No se puede reparar durante el combate» y los botones apagados; en
  narrativo, 🧴 +3 en la Tapa abollada (2/3 → 3/3, el óleo se gastó) y 🔧 +1 en el peto con el talento (5/6 → 6/6, sin armadura rota; «te quedan 1 de
  2», despojos 26 → 24). (El mapa quedó en narrativo.) **Falta**: reparar una pieza rota con el talento (al doble) en el mapa — está en las pruebas
  automáticas.
- [x] **🛡 Armadura rota: cinco arreglos** (2026-10-12, «Claude · pruebas», el GM con el control de juan, con una Tapa de tacho de basura y un Peto de
  tablas equipados): (1) **Atraviesa escudos** abolla el escudo que paró el disparo (Tapa 3/3 → 2/3, «abollado ×1»; el peto intacto) y lo cuenta
  la Mesa; (2) **un crítico no rompe armadura** (regla borrada el 2026-10-23: ahora sí rompe): el efecto quedaba «no entra · fue crítico» (con la prueba automática; un crítico real con un hacha
  en el mapa **falta**); (3) **Anillo de armadura indestructible**: la primera Armadura rota del combate no tocó ninguna pieza, la segunda sí
  (peto 6/6 → 5/6, ×1); (4) el estado y el manual ya no nombran el Óleo reparador; (5) **Equipo y mochila** (también la del mapa) muestra
  «🔧 5/6 · Armadura rota ×1 (−1 Defensa)» en cada pieza. De paso: los avisos de una pieza rota o a punto de romperse que le llegan a un
  personaje ahora van a la Mesa también desde el mapa.
- [x] **🧚 Re-roll** (2026-10-12, «Claude · pruebas», el GM con el control de juan; ya con Afortunado adentro): juan atacó a la Bruja y sacó PdG 3;
  el botón 🧚 ofreció «juan · PdG (3) … 2 SP (turno ajeno 4) + 2 No2»; fuera de su turno pidió 4 SP (Flash) y la tirada pasó a 11 (3 y 11 → queda la
  mejor), con su línea en la Mesa («−4 SP · −2 No2»). SP 38 → 34, No2 −2.
- [x] **🦋 La polillita** (2026-10-12): con «Polilla revoloteando», una polillita celeste da vueltas alrededor del token de juan (aletea y deja una
  estela de tres puntitos). Se agrandó un poco después de verla (era casi invisible con el mapa alejado).
- [x] **⛈ Maldición tormentosa** (2026-10-12, «Claude · pruebas», el GM): la Bruja del pantano Atormentada (1 stack). Moverse 3 casillas → −1
  de vida y 4 casillas → −2, con su línea roja en la Mesa; atacar desde sus Acciones (3 No2) → −2 (37 → 35), una sola línea. juan Atormentado
  (con el control): atacar con el Arco de pastor (4 No2) → 3 de daño que frenó su Shield (14 → 11), la vida no cambió. **Falta**: lanzar la
  Maldición en un duelo de verdad (es el mismo duelo que la extenuante, con el estado Atormentado).
- [x] **🚧 Los rivales cortan el paso: el aviso** (2026-10-12): la Bruja arrastrada hasta la casilla del Escarabajo (aliado) quedó en la de antes
  y el cartel dijo «🚧 No se puede terminar en la casilla de Escarabajo de cobre (auditar): queda en la de antes · Bruja del pantano (auditar):
  −4 No2 · le quedan 5».

- [x] **😮‍💨 Maldición extenuante** (2026-10-12, «Claude · pruebas», el GM con el control de juan): PdG.Esp 10 contra Res.Esp 1 del Coloso →
  Extenuado 1 turno. Las Acciones del Coloso: Atacar 5 → 6 No2, Parry 1 → 2; moverse 2 casilleros le costó 3 No2 (4 → 1). juan Extenuado:
  todas sus habilidades con No2 suben 1 (Maldición debilitante 3 → 4, Marcar 1 → 2), las que no cuestan No2 siguen gratis, y moverse lleva
  el recargo (`ext: 1`). En el camino: el botón Consumir y el Levantarse / cinturón de un creep ahora muestran el costo con el recargo.

- [x] **🎯 Marcar (Shooter)** (2026-10-12, en el mapa): juan marcó al Coloso (3 SP, 1 No2, sin tirada; el GM aplicó): el Coloso quedó con «Marcado»
  que no vence y juan con «Marcando»; el disparo a su marca dijo «contra su marca: +1 PdG, Crítico frecuente +1, Crítico potente +1, +1 de daño»
  (sumado a la emboscada del arco); al atacar a Clementino salió «Coloso deja de estar marcado», juan perdió el «Marcando» y la pantalla del GM le
  sacó el Marcado al Coloso.
- [x] **Las pruebas pendientes del 2026-10-09 al 11, en el mapa** (2026-10-12, «Claude · pruebas», juan y el GM; blanco casi siempre Clementino,
  con un estado de prueba de puntería y otro sin críticos para forzar golpes normales):
  - **🗡 Dagas T4**: Pica Hielos «Tipo 4 · 2 dados · PdG −1», 2d4, $50; golpe con el Estileto «1d4 + 5» contra el Coloso (Defensa 16 → 0).
  - **💠 Distancia ideal**: media (alcance 14 → franja 7–9) brilla en celeste la Bruja a 7 y el duelo suma +1 PdG; lejos (los 3 últimos, desde
    8) brilla el Coloso a 12 y suma.
  - **🎯 Ballestas revisadas**: Común (Recarga 3) 3, 6, 9 No2; Buena (Recarga 2) 2, 4, 6. La de cazador y la de guardia conservan su Rango de
    bono a propósito (ajuste del 2026-10-11 para que no queden mellizas); las Raras en adelante no se revisaron.
  - **⚔ Tabla de turnos achicada**: «⚔ Turno: *nombre*», cambia sola al pasar el turno, agrandada vuelve a «Orden de turnos». Un creep que juan
    ya conoce sigue figurando con su nombre aunque no lo vea (misma regla que la lista).
  - **🎯 Mecánicas de ballesta**: Doble cuerda 2, 2, 6; Tiro rápido 2, 3, 4; Alcance con caída «(2 de más): −4 de daño» (5 − 4 = 1, ×4 de
    crítico = 4); Apuntada firme +3 sin moverse y nada después de moverse; Tirador de apoyo +2 PdG; Remate Crítico frecuente +1 contra el
    Inmovilizado; Primer disparo +1d6 (9 + 5 = 14); Punta de diamante pasan 4 contra Defensa 21; Remachadora pasan 2 y 3 en golpes seguidos y
    al errar vuelve a 0; Cargador «no cobra su No2 (1 de 2 del combate)»; Carcaj integrado 12 / 13; Virote de red 0 de daño e Inmovilizado 1
    turno.
  - **🏹 Mecánicas de arco**: Tensar («¿Tensás…?» → «tensado: +1 PdG»); Largo alcance (Clementino a 16 con alcance 14 brilla y «(2 de más):
    −4 PdG»); Emboscada solo el primer disparo y se libera al volver a narrativo; Matabestias +2 de daño contra la bestia; Contra el Marcado
    (Flecha marcadora y el segundo disparo +2 PdG); Espalda a distancia +2 PdG +1 de daño sin sigilo; Afinidad elemental (fuego 1d4+1).
  - **⏱ Turno ajeno**: «No es el turno de juan… Cuesta 4 SP» (Shield); Cancelar no cobra nada; en el propio turno no pregunta.
  - **🎯 Ojo de asesino**: «Rango del crítico: 3 (Tipo 4 − Crítico frecuente 1)»; el mismo disparo gastó el Ojo y una carga del Arma envenenada.
  - **🧱 Paredes**: figura en rectas cerrada con un clic en el primer punto; «Entre vos y Clementino está una pared»; una flecha que erró chocó y
    se rompió (moneda); con la pared juan no ve la casilla de Clementino ni la alcanza su cono (sin la pared, sí).
  - **🏹 Virotes con mapa**: humo (nube flor de 7, 2 turnos), luz (bengala, 3 turnos), explosivo (fuego 1d6 a Clementino y al Lobo pegado),
    clavo (contra la pared: Inmovilizado 1 turno), rebote (rebota al que está pegado, PdG −2).
  - **🏹 Rasgos de ballesta**: apuntada «+2 PdG (no se movió)» y nada si se movió; atraviesa escudos «¡PARADO!» y el escudo de Clementino se
    abolló (Armadura rota).
  - **🏹 Apuntar con un arma de rango**: al apuntar se ve el alcance, brillan los objetivos posibles, la línea muestra si pasa y avisa cuando la
    tapa un token o una pared.
  - **Arreglado en el camino**: un PdG en 0 o negativo dejaba el duelo en «Tirando…» para siempre (ahora da el valor, sin dados); el Virote de
    rebote nunca rebotaba (comparaba ids que los tokens no llevan).
  - **Observaciones para el dueño**: cancelar un duelo después de elegir el objetivo ya cuenta como disparo (gasta Apuntar, la Emboscada, la
    Respiración contenida); el Virote de red igual muestra «Tirar el daño» (después da 0); el dado extra del Primer disparo no aparece en el
    botón de daño (se suma aparte).

- [x] **Skills auditadas del 2026-10-11, en el mapa** (2026-10-12, «Claude · pruebas», juan y el GM, con capturas):
  - **🎯 Enfocado**: tres usos seguidos cobraron 1, 2 y 3 SP (y 1 No2 cada uno), el botón decía «2 SP (+1 por usarla seguida)»… y quedó
    «Enfocado ×3»; el disparo de arco al Coloso: «Arco corto · 2d4 + 2 + 6» (crítico ×3 = 45); el estado se gastó y volvió a costar 1 SP. No se
    probó un golpe cuerpo a cuerpo (juan solo tiene arco): es el mismo mecanismo de cargas que Envenenar arma. En «Ver», «Detalles técnicos»
    muestra el texto original del borrador.
  - **🌑 Maldición debilitante**: PdG.Esp 9 contra Res.Esp 3 → Debilitado 2 turnos en el Coloso (Acciones: «Debilitado −1» en Atacar y Esquivar);
    la segunda (10 contra 7): ×2, 2 turnos, −2 (los dados bajan de 1d4 a 1d3). **Arreglado en el camino**: el cartelito decía −1 con ×2 (ahora
    multiplica por los stacks). No se probó contra un personaje: va por el mismo aviso que Veneno, ya probado.
  - **✨ Blessing**: sobre juan mismo, Bendecido 2 turnos, PdG 11 → 12, «Bendecido +1» en Atacar y Esquivar; 5 SP y 1 No2. El daño del arco no
    cambia (suma la mitad del Dmg). **Arreglado en el camino**: la ficha suelta en segundo plano se adjudicaba el efecto y guardaba tarde (el
    navegador frena sus relojes); ahora solo lo toma si está a la vista, si no lo aplica el mapa.
  - **🛡 Shield**: sobre Clementino 14/14; golpe de 9 → 5; golpe de 8 → 0 y 3 a la vida (18 → 15); al empezar el turno de Clementino, el escudo
    gastado se fue. En turno ajeno: «No es el turno de juan… Cuesta 4 SP» y cobró 4. **Arreglado en el camino**: el token seguía mostrando el escudo
    lleno después de un golpe (el resumen público no se actualizaba; venía de antes).
  - **🎯 Apuntar**: el cartel dice «X: de 1 a 3»; con 4 avisa «Como mucho 3 Nitros en X» y no cobra; con 2: «Apuntando ×2» y el disparo
    «distancia ideal y apuntando (+2): +3 PdG, Crítico potente +2». Ojo: cancelar el duelo después de elegir el objetivo ya gastó Apuntando.

- [x] **☠ Veneno (Debuffer)** (2026-10-11, en el mapa, las dos cuentas): juan («1 No2 · 2 SP») contra el Coloso: el duelo «PdG.Esp contra Res.Esp»;
  la primera vez resistió (6 contra 11: «se resistió»); con un estado de prueba en el Coloso (−10 Res.Esp) ganó juan (9 contra 4: «¡Funcionó!») y
  el GM aplicó: «Veneno ×3 → ahora ×9» (tenía 6: se suman).

- [x] **🎯 Apuntar (Shooter)** (2026-10-11, en el mapa): juan con la skill («X No2 · X SP»): en el cartel del costo, al poner 2 en SP los No2 pasaron
  solos a 2 (la misma X); cobró 2 SP y 2 No2 y quedó «Apuntando». Disparó el Arco corto al Coloso: «distancia ideal y apuntando (+1): +2 PdG, Crítico
  potente +1» y el estado se gastó. Hubo que arreglar: el estado quedó con 1 stack en vez de 2 (la ficha armaba los estados propios con 1 stack fijo) →
  corregido (prueba automática). **Falta**: ver el ×2 en el mapa, y el tope de X (el cartel dice «Tope de X sin definir»: hoy deja pagar más de 3; el
  bono igual se queda en 3).

- [x] **✨ Heal (Support)** (2026-10-11, en el mapa): juan (con la skill: «1 No2 · 2 SP») se eligió **a sí mismo** (la opción nueva «aliado o uno mismo»):
  «juan → juan · Curación 1d6+4 [6] = 10 · Aplicado +10 HP (8 → 18)»; después a Clementino: «+9 HP (12 → 21)». El tope en la vida máxima y que no
  levante a un caído son los de siempre de la cura (dueloCurar), ya probados con las varitas de cura.

- [x] **🛡 Miti-Miti (Tanque)** (2026-10-11, en el mapa, las dos cuentas): juan (con la skill) marcó a Clementino desde la Botonera («1 No2 · 2 SP»;
  «Clementino queda protegido: juan se lleva la mitad del daño hasta su próximo turno»). La Bruja le pegó a Clementino: 13 − Defensa 1 (lo que entró,
  5, después de su escudo) → Clementino 2 y juan 3, directo a la vida (Mesa: «🛡 Miti-Miti: juan se lleva 3 del golpe a Clementino»). Pasó el turno
  de juan y la marca siguió; otro golpe, con crítico: 18 → Clementino 9 y juan 9 (el cuadro del duelo: «🛡 juan se llevó 9 (Miti-Miti)»). Al
  empezar el turno siguiente de juan: «Miti-Miti: 1 → 0 turnos, se terminó». Hubo que arreglar: (1) **los efectos de un duelo los aplica también la
  ficha suelta del dueño del defensor**, y con dos personajes del mismo jugador la ficha de uno reclamaba el del otro y lo dejaba «a mano» → la ficha
  solo reclama los de su personaje (y nunca Miti-Miti); (2) el resumen público no llevaba a quién protege; (3) el texto del golpe no contaba lo que se
  llevó el Tanque. Ojo: después de subir algo, **todas las pantallas** (las fichas sueltas también) tienen que recargar. **Falta ver**: «a la vista»
  (el cartel no mostró el alcance al elegir al protegido: con el Rango de juan, no limita).

- [x] **🏹 Arcos Comunes nuevos** (2026-10-11, en el mapa, las dos cuentas; juan con 7 de los arcos nuevos): **Respiración contenida** («+2 PdG» el
  primer disparo del turno), **Abanico + Emboscada de PdG** (otro blanco: «emboscada y abanico: +2 PdG»), **Contra lo sobrenatural** (el Coloso pasado
  a demonio: «+2 de daño»), **Arco duro** (Fuerza 3 < 4: «−2 PdG») y **Mínima más larga** («de 3 a 15 casilleros»), **Lectura del viento** (pegó al
  Coloso y el segundo disparo: «+1 PdG»), **Contra humanos** (la Bruja, humanoide: «+2 de daño»). Hubo que arreglar: el mapa cargaba la Botonera vieja
  (con el catálogo viejo) porque no se le había subido la versión. **Falta**: Racha (necesita un crítico), Flecha de más, la distancia ideal nueva y la
  Emboscada de Crítico potente. Ver `revision-arcos.md`. **Después, el mismo día:** Racha (juan con PdG +10 para asegurar el crítico: doble crítico al
  Coloso y el disparo siguiente «racha: Crítico frecuente +1», a 3 No2 por Encadenar), Flecha de más (Mesa: «disparó Flecha de fuego · Flecha de más:
  no cobra su No2»), distancia ideal **cerca** (el Coloso a 3 brilla en celeste; «distancia ideal: +1 PdG») y Emboscada de Crítico potente («Crítico
  frecuente +2, Crítico potente +1»; el texto decía «emboscada y emboscada»: arreglado). **Falta** la distancia ideal **media** y **lejos** (ver arriba).

- [x] **🏹 Mecánicas nuevas de arco: Contra el que corre, Flecha en la cuerda, Encadenar y el menú «¿Qué flecha?»** (2026-10-11, en el mapa,
  las dos cuentas): juan con un «Arco de prueba (corre)» (copia del Arco corto + Contra el que corre +2, Flecha en la cuerda, Encadenar). El GM
  movió al Coloso 3 casilleros en su turno (ronda 3); mientras su turno seguía, la pantalla de juan contaba 0 (no está completo) y al pasar a juan,
  3. Juan le disparó: el duelo dijo «contra el que corre: +2 PdG» y la tirada «1d10+1 +2 contra el que corre» (5); el primer disparo cobró **1 No2**
  (Tipo 4 ÷ 2 = 2, −1 por Flecha en la cuerda). Pegó (sin daño: Defensa 16) y el segundo disparo apareció a **3 No2** (4 − 1 por Encadenar).
  Hubo que arreglar: lo movido se contaba por el número de Mantenimiento, que llega un instante después que la ronda del orden de turnos → ahora
  por la ronda del orden. El menú de flechas, rehecho a pedido del dueño: «🏹 Flecha común» / «✨ Flecha especial ▾» y, al tocarla, las
  especiales abajo, una por renglón y por nombre (con muchas, la ventana tiene scroll). **Falta**: el caso del arquero primero en la ronda
  (aplica desde la segunda) y las demás mecánicas nuevas (Respiración contenida, Racha, Lectura del viento, Abanico, Contra humanos/adefesios,
  Arco duro, Mínima más larga, Emboscada potente) — se prueban cuando estén los arcos Comunes nuevos cargados.

- [x] **⏸ La pausa de la partida** (2026-10-10, en el mapa, con las reglas pegadas): el GM pausó desde el mapa (cartel «La partida está en pausa» y
  el botón pasa a «▶ Reanudar»); el jugador vio «Partida en pausa hasta la próxima sesión», arrastrar a juan no armó camino y la B no abrió la
  Botonera; en su ficha se sacó y se volvió a equipar la ballesta; al reanudar, el GM vio las dos líneas con la hora y eligió «Borrar el registro y
  reanudar» (el registro quedó vacío y el mapa del jugador se destrabó). Arreglado después: el cartel de la pausa tapaba el título de otras
  ventanas (ahora se esconde mientras haya una abierta). Queda la duda P194 (en pausa, ¿cobra como en combate?).
- [x] **🧱 Paredes y 📐 lápiz en rectas** (2026-10-10, en el mapa, con las reglas pegadas): el GM dibujó en rectas, con imán y «🧱 Con colisión», 5
  puntos sobre las esquinas del casillero de juan (arriba, izquierda y abajo); se guardó (en rectas y con colisión) y se ve en las dos pantallas (borde
  oscuro y línea roja cortada). juan no pudo cruzarla (el arrastre no armó camino), mientras que por el lado abierto sí (pidió No2). Su rango (R) se
  abre solo hacia la derecha. Un garabato a mano alzada: el 🧱 del dibujo seleccionado lo volvió pared («Ese dibujo ahora es una pared…») y
  otra vez lo sacó («ya no es una pared»). La casilla de colisión y el 🧱 son solo del GM.
- [x] **🪵 Tronco de huída** (2026-10-10, en el mapa): la Bruja atacó a juan; juan marcó el Flash «Tronco de huída +2» y eligió Evasión: 1d8 +2 ⚡ = 7
  contra 6, esquivó gracias al +2. Apareció «🪵 juan esquivó: dodge roll»; lo arrastró 2 casilleros lejos del Coloso (al que se le dieron No2 para
  que pudiera aprovechar): pagó sus 2 No2, el cartel se cerró solo y no hubo ataque de oportunidad ni aviso. Falta: el caso de un cono (la fase dodge).
- [x] **😱 Expuesto y el dodge roll** (2026-10-10, en el mapa): el Coloso Expuesto (con +60 de Evasión de prueba) contra la Ráfaga arcana de
  juan: su Evasión salió «2d12+2d20 ÷2» = 17 contra 13, la ganó, y en vez del dodge roll la Mesa dijo «😱 Coloso … está Expuesto: no puede hacer
  el dodge roll y se queda en el área» y «no logró salir del área: efecto completo»; juan tiró el daño. (Detalle de texto, de antes: cuando quien
  gana la Evasión no sale del área, el cartel dice «¡FUNCIONÓ! … venció la Eva», aunque la Evasión la ganó.)
- [x] **🗡 Degollar y Expuesto** (2026-10-10, en el mapa, con orden de turnos): juan, en su turno (4.º de 7), contra el Coloso: la declaración · **2.ª vuelta (2026-10-26, con la pantalla del jugador a la vista, clics y arrastres reales)**: ✔ en su propio turno: «termina su turno y pasa al final del orden», el turno pasó solo (empezó la ronda siguiente).
  dice «+4 PdG · +7 de daño fijo», el crítico «Degollar suma +1 a tu Crítico frecuente / potente», el daño «2d6 + 4 + 7» (salió crítico ×2:
  28, el Coloso 43 → 15). Al resolverse: la Mesa «⏭ juan usó Degollar: termina su turno y pasa al final del orden», el turno pasó solo
  (salteando al Escarabajo caído) a Clementino y juan quedó último, abajo con los que ya jugaron. La Bruja atacó a juan: su defensa ofrecía
  solo la Evasión, «1d8 ÷2» con el aviso «😱 Expuesto…» (salió 5 → 2). La Bruja se alejó de juan: «no hay ataque de oportunidad (juan está
  Expuesto)». ▶ Siguiente después de la Bruja: juan se salteó y empezó la Ronda 2; al llegarle su turno en la Ronda 2, Expuesto se fue solo.
- [x] **🔮 Armadura arcana** (2026-10-10, prueba completa en el mapa, juan contra el Coloso y la Bruja): un golpe de 8 → «la Armadura arcana
  absorbió 4», juan 10 → 6. Al vencerse (al empezar su turno) la Mesa dice «💥 … explota: 4 de daño arcano directo» y sale la cascada: el
  Coloso 56 → 52 (empate desempatado a par o impar), la Bruja 21 → 17 (su Defensa especial 3 no resta: es directo). **Bug encontrado y
  arreglado**: el daño que aplica el mapa a un personaje buscaba los estados en la parte equivocada de la ficha, así que a un personaje no le
  valían ni los escudos, ni Invulnerable, ni la absorción (`danioPj`, js/10). Queda: la vista previa del «Recibe daño» no muestra lo absorbido.
- [x] **✨ Toque mágico pegando** (2026-10-10): solo el que está al lado, el defensor solo con Evasión; pegó 22, menos la Defensa especial 3
  del objetivo = 19 (no su Defensa).
- [x] **🌀 Ráfaga arcana: ganar la Evasión y quedarse adentro** (2026-10-10): el Coloso (con +20 de Evasión de prueba) ganó 7 contra 4 → el
  cartel del dodge roll → «✋ No me quiero mover» → la Mesa «no logró salir del área de Ráfaga arcana: efecto completo» → juan tiró el daño:
  3 directo a la vida, 52 → 49. Salir del cono ya estaba probado (la Bruja esquivó).
- [x] **🧴 Óleo venenoso** (2026-10-10): consumirlo pone el estado con su carga; el «Arma envenenada» sin cargas que quedaba se fue; el
  ataque sumó +2 y Veneno ×3 (fue crítico: 26 de daño).
- [x] **🧪 Envenenar arma y las cargas** (2026-10-10, en el mapa): juan la ejecuta (2 SP, la Mesa dice «→ Arma envenenada»), ataca al Coloso
  con la ballesta: el botón del daño dice «2d6 + 4 + 3», el paso de efectos trae «Envenenar · entra siempre» → «Aplicado · Veneno ×3», y en su
  ficha queda **1 carga**; el segundo ataque gasta la otra (0). **Bug encontrado y arreglado**: cancelar el cartel de «sin No2» gastaba la carga
  igual; ahora se gasta recién cuando el ataque se pagó. **Arreglado y probado después** (2026-10-10): al gastar la última carga, «Arma
  envenenada» desaparece enseguida de la lista de juan, y ese último golpe igual suma el +3 («2d6 + 7») y el Veneno ×3.
- [x] **🔮 Vista previa de «Recibe daño» con la Armadura arcana** (2026-10-10): juan con la Armadura puesta, golpe de 8 → «8 − Def 0 = 8
  (Armadura arcana −4) → HP 6 → 2». Antes la vista previa de un personaje no veía ni escudos ni la Armadura arcana.
- [x] **⚔ Tajear y la Perfora nueva** (2026-10-10, en el mapa, «Claude · pruebas»): juan contra el Coloso (Defensa 16): «11 − Defensa 16
  (pasa 1 por la Perfora) = 1», el Coloso 31 → 30, el Sangrado ×3 (3 turnos) entra con «Aplicar» y su primer tick lo deja en 27. Antes se vio
  el +1 al Crítico frecuente solo en esa tirada y el aviso sin No2.

- [x] **🏹 Ballestas: Recarga, «¿Qué virote?» y Perfora del arma** (2026-10-10, probado en el mapa con juan y la Ballesta de guardia): el primer disparo cobró 2 No2 y el siguiente marca 4; la ventana dice «¿Qué virote?» y ofrece solo el virote (no las flechas del carcaj); disparó al Coloso pegado (la ballesta no tiene distancia mínima); el daño dijo «12 − Defensa 11 (16 − perfora 5)» (3 del arma + 2 del virote). Arreglado después: el texto del virote repetía su encabezado y la declaración no mostraba la Perfora del arma.

- ✅ **Disputa del botín** (2026-10-09, sin tercera cuenta: el GM toma 🎮 el control de Clementino): «🏁 Finalizar combate» con un ítem extra (Amuleto de
  prueba) → publicar; juan 🙋 lo reclama («es tuyo», ↩ Soltar); el GM, como Clementino, lo ve «lo reclamó juan» con ⚔ Disputar → piedra, papel o tijera
  «por Amuleto de prueba» en las dos pantallas («Vos contra juan» / «Vos contra Clementino»), la fila «✊ En disputa: jugar»; papel contra piedra →
  «¡Ganaste! te llevás Amuleto de prueba» / «Perdiste: se lo lleva Clementino», la fila pasa a «lo reclamó Clementino»; ↩ Soltar lo deja libre y se
  vuelve a reclamar; el GM cierra el botín («Reclamados (1): Amuleto de prueba → Clementino») → el amuleto en la mochila de Clementino y +63 XP; la
  Mesa cuenta cada paso. (De paso: «Tomar el control» pasó al cartel del juego; era un confirm() nativo.)

- ✅ **🏹 El arco en una invocación y 🪙 la moneda en el rincón** (2026-10-09): el Lobo de prueba (de Clementino) con un Arco corto: el 🔍 del Daño dice
  «Dmg (arco: la mitad, para arriba) +2» con Dmg 3; al atacar a la Bruja, el duelo dice «con Arco corto · Tipo 4» y a la Bruja se le ofrece el Parry
  con escudo «si gana, el disparo queda parado». **Arreglado probando**: con alcance 2 no le brillaba nadie (el arco pide 3+) y el cartel no decía por
  qué; ahora: «tu alcance (2) no llega a los 3 casilleros que necesita el arco». **Moneda Re-Roll en el rincón**: con una moneda, el botón 🪙 con brillo
  abajo a la izquierda abre «mis últimas tiradas»; con la Polilla activa, se apilan (Polilla abajo, moneda arriba).

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
- ✅ **🧊 El hielo y 💧 el charco** (2026-10-17, «Test con claude elsaulo», con capturas): el hielo aparece bajo Silvia → «Tirar Agilidad» (2 contra
  9, Sentada); caminar 2 y 3 casilleros → «una tirada por paso», falla el primero y queda en esa casilla; al derretirse queda el charco (una mancha
  ondulada, permanente); una zona de fuego encima evaporó la parte de abajo. El rayo en el agua da ×1,5 (5 → 8). Las nubes: verde, violeta y gris.
- [x] **💧 La Parálisis al doble en el agua, dentro de un duelo** (2026-10-17): falta verla en un duelo de verdad (un rayo con Parálisis contra
  **Probado el 2026-10-20 (Claude, «Test con claude elsaulo»):** Silvia parada en un charco recibe la Varita de chispa eléctrica: el tablero muestra Parálisis 50 % (el doble del 25 %) y el daño «en el agua: 6 × 1,5 = 9» (20 → 11).
  alguien parado en un charco: el tablero de efectos tiene que mostrar el doble de chance y «💧 en el agua»).
- [x] (2026-10-23, Claude, «Claude · pruebas»: dos goblins en un charco; la Bruja les tiró la Varita de chispa eléctrica al Goblin 1: el tablero mostró la Parálisis al 20 % por el agua, el Goblin 1 recibió 1 × 1,5 = 2, el rayo corrió al Goblin 4 y **su Parálisis se aplicó sola** —para verla salir se forzó el azar unos segundos—; duelo cerrado con «Listo, cerrar», charco borrado) **⚡💧 El rayo corre por el agua, en un duelo de verdad** (2026-10-17): probado llamando a la función con dos personajes en un charco
  **Avance el 2026-10-20 (Claude, «Test con claude elsaulo»):** en un duelo real el golpe corrió por el charco hasta el Lobo (9). La Parálisis del Lobo se tiró sola (50 %) y no salió: falta verla salir. Ojo: el Lobo recibió además el salto eléctrico (6): pregunta abierta P214.
  (Xeena recibió 4 × 1,5 = 6, la Crónica y la Mesa lo contaron); falta un duelo real con un rayo con Parálisis, para ver que la Parálisis del
  otro se aplica sola (en la prueba salió «a mano» por el duelo armado a mano).
- ✅ **✍ El crítico a mano** (2026-10-17, duelo de prueba Silvia → Xeena): PdG 30 y Evasión 1 a mano → crítico de nivel 7; «Elegir
  manualmente» en el crítico, escrito 17 → ×3 (la Mesa: «Crítico (1d20, a mano)»). Duelo cancelado sin contar el ataque.
- [x] **✍ Los efectos a mano** (2026-10-17): «✔ Funcionó / ✘ No funcionó» en el tablero de efectos; falta un duelo con un arma que tenga
  **Probado el 2026-10-20 (Claude, «Test con claude elsaulo»):** creep con Daga de efectos Sangrado 50 % y Lisiado 25 %: «✔ Funcionó» al Sangrado y «✘ No funcionó» al Lisiado → el tablero muestra ✍ en los dos y la tarjeta del Sangrado («fue crítico: queda permanente»). **Arreglado:** mientras el daño esperaba su «💔 Aplicar el daño», los botones de los efectos se veían y no hacían nada (ahora avisa «primero se aplica el daño»); y lo elegido a mano decía «salió 0».
  efectos con chance.
- ✅ **😤 La Bronca** (2026-10-18, «Test con claude elsaulo», creep de prueba con tope 2): primer golpe → «junta bronca (1/2)» en la Crónica y la
  Mesa; segundo → explosión de 2 casillas y «¡SE LE SALTÓ LA TÉRMICA!», y la onda arrancó el duelo de área (su PdG contra la Evasión). **Hasta el final, probado el 2026-10-20:** dos golpes → «¡Se le saltó la térmica!»; el creep tira una sola vez para toda la
  onda (9); Silvia (Evasión 1) recibe 5 − Defensa 3 = 2 y queda Sentada; el Lobo (20) gana, hace el dodge roll fuera del área (sin oportunidad: el creep
  tiene arco) y «se resistió»; el área se cierra sola.
- [x] (2026-10-24, Claude: con la Bruja en vigilancia, juan caminó tres casillas en su mira → preguntó una sola vez, «Dejarlo pasar» y siguió hasta el final; otro camino de dos casillas en su mira, en el mismo turno, no volvió a preguntar) **👁 Vigilancia: una vez por turno (2026-10-24, arreglado)**: la Bruja en vigilancia preguntaba «¿Dispara?» en cada paso del mismo camino aunque lo hubiera dejado pasar (la marca se borraba enseguida). Ahora la marca dura el turno. Probar: un personaje camina varias casillas en la mira, «Dejarlo pasar» → no vuelve a preguntar en ese turno; en el turno siguiente sí.
- [x] (2026-10-24, Claude: el Escarabajo fuera de su turno abrió el cartel del largo del Muro y lo canceló → no quedó nada en la Mesa; después usó el Velo espejado → el anuncio y enseguida «⏱ … actúa fuera de su turno: Velo espejado»; juan atacó fuera de turno → la línea salió al tirar el PdG) **⏱ «Actúa fuera de su turno» solo si la acción ocurre (2026-10-24, arreglado)**: antes salía al tocar el botón, aunque se cancelara. Ahora espera a la primera línea de la Mesa que nombra a quien actúa (vence a los 3 minutos). Moverse avisa como siempre. Entrar en sigilo no escribe nada en la Mesa, así que tampoco avisa.
- [x] (2026-10-24, Claude, con la cuenta de GM y la de elsaulo como jugadora: el Capataz, a la vista del Lobo, se escondió → Mesa y Crónica «🥷 Capataz entra en sigilo a la vista»; la Bruja, sin que la viera nadie → nada; juan sin que lo viera ningún creep → nada; juan en una casilla que veían el Escarabajo y la Bruja → «🥷 juan entra en sigilo a la vista», publicado una sola vez desde la pantalla de su dueña) **🥷 Entrar en sigilo a la vista se anuncia (2026-10-24, regla del dueño)**: si algún rival lo ve en ese momento, Mesa y Crónica; escondido tras un objeto, una pared, en la niebla o fuera de su visión, no. Dentro del cono de un rival no se anuncia (lo detectan en el acto).
- [x] (2026-10-25, Claude, «Claude · pruebas», GM y la cuenta de juan: PdG.Esp 23 contra Evasión 8 → 1d6 = 2 + 5 del Estandarte = 7 directo (30 → 23) y Expuesto 1 turno; en el ataque siguiente, desde la cuenta de juan solo se ofreció la Evasión, con el cartel «Expuesto: sin reacciones que cuesten No2 (ni Parry ni Bloqueo) y la Evasión a la mitad», y salió «1d8 ÷2» = 1; al empezar su turno, «Expuesto: se terminó». Ojo: el «÷2» se lee como «+2» en esa letra) **🪡 Aguja del desamparo (Debuffer, 2026-10-24)**: un creep se la tira a un personaje en su Rango → su PdG.Esp contra la Evasión; si pega, 1d6 arcano directo (sin restar la Defensa especial) y Expuesto: el Anuncio, y hasta que empiece el turno del personaje su Evasión vale la mitad y en el duelo no se le ofrecen Parry ni Bloqueo (ni oportunidad, ni dodge roll); al empezar su turno se va solo. Si la esquiva, nada. El cobro (2 No2 y 3 SP, o cooldown 3).
- [x] (2026-10-25, Claude: en duelos de verdad, «+3 estandarte» en el PdG y el PdG.Esp y «1d6+1d6+11 +5 estandarte» en el daño de un ataque, +5 también en el de una habilidad; desde la cuenta de juan se ve el aura —velo, contorno redondeado, banderines— salvo lo que tapa su niebla; clavar otro sacó el anterior. Las copias viejas de la habilidad siguen diciendo «pegada a él»: hay que reemplazarlas) (2026-10-24, Claude, probado en parte con el Escarabajo, nivel 2: cobró 2 No2 y 4 SP; el «fuera de turno» salió después del anuncio; el estandarte se clavó en la casilla pegada con su bandera y el aura —anillo carmesí y dorado con banderines, velo, línea punteada dorada—; 20 de vida, Evasión 1 y todo lo demás en 0; el Escarabajo adentro recibe +3/+5; con 25 de daño se rompió, se fue del mapa, se borró su ficha y la Mesa lo contó. Con los cambios del dueño: a 6 casillas lo rechazó («fuera del Rango (4)») y a 4 lo clavó; el aura pasó a la forma del área con las puntas redondeadas y los banderines parejos. **Falta**: verlo en un duelo de verdad, «uno por creep», y el aura desde un jugador) **🚩 Estandarte de guerra (Support, 2026-10-24)**: un creep lo usa → clic en una casilla libre dentro de su Rango (más lejos no deja) → aparece el estandarte con su bandera, el aura (línea punteada dorada en las 37 casillas, velo carmesí, anillo con banderines que flamean) para el GM y para un jugador; Mesa y Crónica. Un creep adentro ataca a un personaje → «🚩 bajo el estandarte: +3 PdG y +5 de daño» en el duelo y en las tiradas; uno afuera, nada; con una habilidad, +3 al PdG.Esp. Un personaje le pega al estandarte: no esquiva y no resta Defensa; con 0 de vida se rompe, se va del mapa y la Mesa lo cuenta. Clavar otro saca el anterior. No aparece en el orden de turnos ni en «Batalla terminada». El cobro (2 No2 y 4 SP, o cooldown 4).
- [x] **☄ Meteoro (Mago, 2026-10-24; antes «Lluvia de meteoros», con 4d6 de fuego; ahora 2d6 y cooldown 3 que arranca activo)** — *probado en parte (2026-10-24, GM, «Claude · pruebas»)*: ✔ marcar el centro, la sombra, la Mesa y el cobro (5 SP, 2 No2); ✔ al darle el turno al Escarabajo cae, explota y cada uno de adentro recibe el dodge roll; ✔ juan «Sigue adentro»: 17 físico − Defensa 0 (26 → 9) y 11 de fuego − res 0 (9 → 0); ✔ Clementino «Logró esquivar»: nada; el área se cierra y la sombra se va. Arreglado en el camino: el fuego no se veía antes de aplicar el daño ni en el botón de tirar; el segundo objetivo de un área se quedaba sin duelo (la reserva leía el índice viejo); el resumen del duelo en la Mesa fallaba en todo golpe físico normal («defTxt»). ✔ Segundo meteoro con los arreglos publicados: la cascada pasa sola al segundo objetivo, el botón dice «4d6 + 4d6 de fuego», el fuego se ve antes de aplicar, Clementino (Defensa 21) recibe 0 físico y 18 de fuego (16 → 0), y el resumen sale en la Mesa. ✔ (2026-10-25, con 2d6 de fuego) desde la cuenta de juan: la sombra, y al caer su propio cartel «☄ Le cae el meteoro a juan (4d6 físico + 2d6 de fuego)» con «No me quiero mover»; 12 físico + 4 de fuego, aplicado por él (23 → 7); siguió solo con la Bruja (aliada del Escarabajo), que esquivó; y con el Escarabajo a 0 de vida, «la sombra se disipa y el meteoro no llega». ✔ (2026-10-25) sin orden de turnos: el Ladrón (fuera del orden) la marcó sobre el Lobo; al empezar la ronda 14 (Mantenimiento 29 → 30) cayó, y el dodge roll fue para el Estandarte, el Lobo y el Escarabajo. Lo original: un creep la usa → marcar el centro dentro de su Rango (más lejos no deja) → la sombra (círculo oscuro, línea punteada naranja en las casillas, el punto de fuego que titila) la ven el GM y un jugador; Mesa y Crónica. Se pasa el turno: al empezar el próximo turno del creep cae —la explosión en todas las pantallas— y a cada uno de adentro (un personaje, un creep aliado) le aparece el dodge roll «☄ ¡Cae el meteoro!»: si sale, nada; si se queda, 4d6 físico menos su Defensa y 4d6 de fuego menos su resistencia al fuego. Sin orden de turnos, cae en el próximo cambio de ronda. Si el creep cae antes, la sombra se disipa. El cobro (2 No2 y 5 SP, o cooldown 4).
- [x] **🧿 Disipar (Debuffer, 2026-10-25)** — *probado (2026-10-25)*: ✔ PdG.Esp contra Res.Esp; al ganar, el GM ve el menú con los estados buenos del objetivo (duración, escudo, detalle) y el elegido se va (personaje). ✔ (2026-10-25) contra una invocación (el Lobo de Clementino): sin estados buenos, «no tenía ningún estado bueno para sacarle» (no tocó el Mareo, que es malo); con un Escudo especial, se lo sacó. Arreglado en el camino: el menú para elegir le aparecía al dueño del objetivo (la cuenta de juan) en vez de al GM; ahora elige quien lo usa (`aplicaSolo`, js/14), visto. «Contra un creep» no aplica: hoy lo usan solo los creeps, contra rivales.
- [x] **🎯 Señalar la presa (Support, 2026-10-25)** — *probado (2026-10-25)*: ✔ PdG.Esp contra Res.Esp; Presa señalada 2 turnos al personaje, Evasión 8 → 6, y el ataque siguiente declara «+4 al daño». ✔ con el Marcado sumado (2026-10-25): el duelo ofrece los dos efectos y juan queda con Presa señalada 2 y Marcado 2. ✔ (2026-10-25) con la Presa y la Presa señalada a la vez, el ataque declara «+4 al daño» (no +6) y el daño sale «1d6+11 +4 presa +5 estandarte», aplicado de verdad (crítico ×2: 30 → 0). La Evasión sumaba las dos (−1 y −2: de 8 a 5); decidido por el dueño el mismo día: también toma solo la más fuerte (`Combatiente.sinPresasDebiles`); visto en la Botonera de juan: «Presa señalada −2». ✔ Con la habilidad Sigilo puesta para la prueba, juan Marcado tocó «🕶 Entrar en sigilo» → «Estás Marcado: no podés entrar en sigilo hasta que se te vaya la marca», sin cobrar No2.
- [x] **✨ Lanza de luz (Mago, 2026-10-25)** — *probado (2026-10-25, GM)*: ✔ elegir la dirección (titilan los de la línea), PdG.Esp contra la Evasión de juan, 3d6 arcano (26 → 13) y Deslumbrado 2 turnos (Res.Esp 6 → 4). Arreglado en el camino: la Presa (la del arquero y la Presa señalada) no sumaba su daño en las áreas ni en las líneas; ahora sí (`presa` en el sub-duelo del área, js/13): ✔ visto, «3d6 +4 presa». Y otro caso de la misma carrera de antes: el primer duelo de un área recién lanzada no se creaba si el servidor todavía no tenía el área (ahora reintenta). Visto de paso: al cancelar el duelo de un área, la marca del área quedaba en el mapa hasta que se cerraba sola (5 minutos); arreglado el mismo día: cancelar el duelo de un área cancela lo que faltaba de esa área (hook `grupoCancelado`, js/13 `dueloGrupoCancelado`, con una línea en la Mesa). ✔ (2026-10-25) la línea mide su Rango (4, antes 6); con la Bruja y juan en la línea, primero la Bruja (aliada): 5 contra 2, 6 − Defensa especial 3 = 3 (19 → 16) y Deslumbrado (Res.Esp 8 → 6); después juan, con la misma tirada de 5. Cancelar el duelo de juan cerró el área: la marca se fue y la Mesa dice «✖ Se canceló Lanza de luz». Con Esc al elegir la dirección se devuelve lo cobrado.
- [x] **🧪 Corroer (Debuffer, 2026-10-25)** — probado el mismo día: PdG.Esp contra Evasión; 2d6 ácido directo y «Armadura rota ×N (por N de daño)» (14 → ×3, 17 → ×4, 9 → ×2). En un personaje la rotura cae en una pieza de armadura equipada: con la Cota de malla fina (Defensa 5) puesta a juan para la prueba, bajó la pieza. **Corrección (2026-10-25)**: parecía que de varias Armaduras rotas juntas «se perdían» algunas, pero no: juan tenía equipado además un **Peto de tablas** y cada rotura cae en una pieza **al azar**; las que faltaban en la cota habían ido al peto (la Mesa lo dice: «Peto de tablas está a punto de romperse», 07:14 y 07:20). Cuando el peto se rompió del todo, todas fueron a la cota y por eso «después» llegaban las tres. No había ningún error. Igual quedan dos limpiezas que valen por sí mismas: la ficha dentro del mapa ya no toma estados ni recompensas (`ficha-personaje/js/13-bitacora.js`: dos copias vivas del personaje en la misma pantalla se podían pisar) y Y la ficha escondida la cargaba la precarga del mapa (`setTimeout(precargarMarco, 6000)` en js/14): se sacó; el marco se carga solo cuando hace falta.
