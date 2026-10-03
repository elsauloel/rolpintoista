# Pendientes (lista de trabajo)

> Lista viva para ir tachando. Las **decisiones de diseño** sin cerrar viven en [`preguntas-abiertas.md`](preguntas-abiertas.md) (con número P);
> acá van las **tareas**. Al terminar una, marcarla `[x]` con la fecha; al aparecer una nueva, sumarla. Última revisión: 2026-09-21.

> **En curso (2026-10-02): automatizar las habilidades de los personajes de «El origen de las especies»** → [`automatizar-habilidades-origen.md`](automatizar-habilidades-origen.md) (cuál está hecha, cuál espera y por qué).

## 0. Hoja de ruta acordada (2026-10-02, a seguir en este orden)

> **Criterio del dueño (2026-10-02): primero prolijar lo estructural, después lo puntual** ("tomándonos el tiempo que haga falta").
> Lo estructural = que el mapa haga todo solo, sin la ficha ni GM Tools escondidas en el marco: un solo camino para probar y mantener.

**Hecho en el camino (2026-10-02):**
- [x] **Ataque de oportunidad desde el lado del jugador** (probado en "Claude · pruebas" como Saulo-Prueba con Clementino): la pregunta
  le aparece al centro al jugador dueño, «Sí» con dos armas abre «¿Con qué arma?» (Aguja 2 No2 / Bastón de monje 5 No2) y el duelo de
  oportunidad sale con el arma elegida (Tipo 10) y su línea en la Mesa. El aviso del GM se mandó a mano (la cuenta del GM no estaba
  conectada). Clementino quedó con esas dos armas equipadas.
- [x] **Un creep sin No2 para atacar, adentro del duelo**: pregunta «¿Atacar igual?» (duelo, GM Tools y Acciones nuevas), gasta los No2
  que tenga y deja la línea roja en la Mesa. Probado en vivo por los dos caminos.
- [x] **Solo la Botonera nueva** (decidido por el dueño): siempre prendida, sin interruptor ⚗ (`BN_SIEMPRE`).

**A. Estructural — mudar al mapa lo que todavía va por el marco (en este orden):**
1. [x] **El duelo de un jugador que no abrió su Botonera** (2026-10-02): si el duelo le pide algo a un personaje (o invocación) que
   maneja este usuario y su Botonera todavía no se abrió en esta pantalla, el mapa abre su sesión sin mostrar nada
   (`bnPrepararParaDuelo`, `bnAbrirSesion`) y contesta él; `comun/duelo.js` acepta que `hooksLocal` devuelva una promesa. Probado en
   vivo (GM con 🎮 Silvia, mapa recién cargado): las opciones de defensa y la Evasión las contestó el mapa, el duelo se resolvió y
   la ficha escondida nunca se cargó (en el marco siguió GM Tools).
2. [x] **El Mantenimiento de los personajes** (2026-10-02): la regla salió a `comun/ficha-mantenimiento.js` (la ficha la usa igual) y
   el mapa, en cada ⟳, lee a los personajes que maneja ese usuario, toma sus turnos con la misma transacción, los aplica, publica el
   reporte y guarda — sin cargar la ficha en un marco invisible. Probado en vivo (GM con 🎮 Silvia): dos ⟳ seguidos, una quemadura de
   prueba hizo 10 → 9 → 8 y terminó, No2 a full, SP Regen, reporte en la Mesa, una sola vez por turno, sin ficha escondida.
   - [x] **A2b. El Mantenimiento de los creeps** (2026-10-02): la regla de cada creep salió a `CreepAcciones.mantenimiento` (GM Tools la
     usa igual) y el mapa del GM, en cada ⟳, toma los turnos con la misma transacción (`gm/mantenimiento`), pasa el turno de cada creep
     con `modificarCreep`, sube el contador de GM Tools (`gm/estado`) y anota en el 📜 Historial. Probado en vivo: el creep con una
     quemadura de prueba hizo 5 → 4 y pasó a 1 turno, No2 a full, ataques a 0, el contador 3 → 4, la línea en el Historial, y no se
     cargó GM Tools en ningún marco invisible.
3. [x] **"+ Estado"** (2026-10-02): el "+ Estado" del HUD lo hace el mapa con `comun/selector-estados.js` (la grilla de presets con sus
   preguntas, los "Mis presets" del personaje y "Crear estado nuevo (paso a paso)") y la regla común (`Combatiente.agregarEstado`);
   personajes e invocaciones se guardan con `editarPersonajeMapa` (la misma función que usa el Mantenimiento), creeps con
   `modificarCreep`. Probado en vivo: Veneno ×3 / 2 turnos a Silvia (ficha y token), Pajaritos 2 turnos al creep (con su marca de
   mitad de PdG/Eva), y el asistente de "Crear estado nuevo" abre y, al cancelarlo, vuelve a la grilla. El **⚙ de un estado** (su
   editor completo) sigue yendo a la ficha / GM Tools: es parte del punto 6 (el editor).
4. [x] **Equipo y mochila** (2026-10-02): la regla y la ventana salieron a `comun/ficha-equipo.js` (slots, equipar/sacar con su costo
   en combate, slot lleno → Reemplazar o Comparar, la tabla de Comparar, el dibujo) y la usan la ficha y el mapa. El 🛡 del token y
   el 🎒 de la ficha lite la abren en el mapa, adentro del recuadro de la Botonera nueva (`abrirEquipoMapa`); Editar sigue yendo al
   editor de la ficha (punto 6). Probado en vivo (combate, Silvia con el control del GM): sacar/equipar el Broquel 6 → 5 → 4 No2 y
   guardado; una daga de prueba con el slot lleno → «Reemplazar o Comparar», la tabla de Comparar, Reemplazar (−2 No2); Escape cierra
   todo; y en la ficha suelta, sacar/equipar igual (2 → 1 → 0). Silvia quedó con la «Daga de prueba» equipada en lugar de la Cimitarra.
5. [x] **Tienda y Botín** (2026-10-02).
   - [x] **Botín** (2026-10-02): la ventana «⚔ Batalla terminada» salió a `comun/ficha-botin.js` (la ficha la usa) y el mapa la muestra
     adentro de la Botonera nueva (`abrirBotinMapa`: la abre sola al terminar un combate, el 🎁 del borde y la ficha lite); se cierra sola
     cuando el GM cierra el botín. Las categorías de ítem y la mochila pasaron a `comun/ficha-equipo.js`. Probado en vivo (GM con 🎮
     Silvia): lo de cada jugador, Ver (sin Editar), Comparar, «Sumar a la mochila» (transacción, mochila guardada, línea en la Mesa) y
     el cierre del GM. (Ojo al armar un botín de prueba a mano: el documento tiene que llevar `tomadoPor: ''`, si no las reglas no dejan
     tomarlo — GM Tools ya lo hace así.) La ventana del GM (Finalizar combate / Despojar) se mudó en la 6a (2026-10-02). Era otra pantalla y se anotó aparte.
   - [x] **Tienda** (2026-10-02): la regla y el dibujo salieron a `comun/ficha-tienda.js` (precio con el ajuste del vendedor, filtros y
     orden, carrito y compra, agregar gratis, vender, reparar con el herrero, ítem al azar, la tienda publicada) y la usan la ficha (con
     `tiendaSt`, que conecta la pieza con sus variables de siempre) y el mapa (`abrirTiendaMapa`: el 🏪 del borde y la ficha lite, adentro
     de la Botonera nueva; los cambios del GM llegan solos y si la cierra, la ventana se cierra). **Arreglo de paso**: la búsqueda del
     catálogo de la ficha daba error (`SLOT_LABEL` había quedado encerrado en `comun/ficha-calculo.js` desde el 30/9; ahora se exporta).
     Probado en vivo (tienda de prueba de 5 ítems con herrero, GM con 🎮 Silvia): en el mapa, buscar, carrito y comprar (500 → 480),
     vender (+10), reparar bloqueado en combate y permitido en narrativo (durabilidad 1 → 3, −2 DDE), el cierre del GM, y el DDE guardado
     en la ficha; en la ficha suelta, buscar (ya no da error), carrito y comprar (488 → 468). La tienda de prueba quedó cerrada.
6. [ ] **Todo al mapa, editor incluido** (decidido por el dueño, 2026-10-02: "lo más prolijo al final, aunque sea largo"): que no quede
   nada escondido y se pueda borrar todo el mecanismo del marco. Por tandas, cada una probada:
   - [x] **6a. Las ventanas sueltas** (2026-10-02), cada una en una pieza común que usan las dos pantallas:
     - 📊 **Stats** (`comun/ficha-stats.js`, adentro de la Botonera nueva): atributos, desglose, fórmulas, tirar, cambiar un atributo.
       Probado en vivo: el desglose, la tirada a nombre del personaje, Con 4 → 5 sube el HP máx. 20 → 25 y se guarda. **Arreglo**: el 🎲
       tiraba dos veces (lo atendía también el manejador general del recuadro).
     - 🪙 **Moneda Re-Roll** (`comun/ficha-duelo.js`): probado con una moneda de prueba en el cinturón de Silvia: repitió la Destreza
       (5), la moneda salió impar y se rompió, la tirada quedó «ya usó su re-roll» y se guardó; la ficha suelta ve lo mismo.
     - 🔍 **Ver todo de un creep** (`CreepLupa.verCreep`; las reglas de recompensas —tipo, oro sugerido, trofeo, lo que suelta— pasaron a
       `comun/creep-calculo.js`): adentro de las Acciones nuevas, se actualiza solo con los cambios del creep; ✎ Editar abre GM Tools en
       otra pestaña (el editor es la 6c).
     - 🏁 **Finalizar combate / 🎁 Despojar del GM** (`comun/combate-fin.js`, ventanas en `vtt-hexgrid/js/18-ventanas-gm.js`; el Ver de un
       ítem del GM en `CreepLupa.verItem`; `itemParaCreep` en `comun/creep-calculo.js`). Probado en vivo de punta a punta en el mapa: el
       reporte (90 XP del creep nivel 2, oro con su ±20 %, dos ítems), un extra de XP, quitar un ítem, Ver, Publicar (combate publicado,
       el creep marcado como repartido —GM Tools lo vio—, línea verde), cerrar y reabrir con 🎁, Despojar con un jugador destildado
       (pagos, botín borrado, combate cerrado, 🎁 apagado). GM Tools sigue igual con la misma pieza. 215 pruebas en verde.
   - [x] **6b. El editor de la ficha** (2026-10-02): `comun/ficha-editor.js`, un componente que usan la ficha (en su ventana de siempre) y el
     mapa (adentro de la Botonera nueva, sin la ficha escondida); también el ✚ Revivir y el ⚙ de un estado. Detalle y pruebas en
     [`plan-a6b-editor.md`](plan-a6b-editor.md).
   - [x] **6c. El editor de creeps** (2026-10-02): `comun/creep-editor.js` — el editor de habilidades (paso a paso), Subir/Reemplazar y el
     editor de estados de un creep, que usan GM Tools (atajos) y el mapa (adentro de las Acciones nuevas). Detalle en
     [`plan-a6c-editor-creeps.md`](plan-a6c-editor-creeps.md). La ficha completa del creep sigue siendo la pantalla de GM Tools (se abre
     en otra pestaña, no por el marco).
   - **Con esto, nada de la Botonera ni de las Acciones depende del marco escondido**: la A está terminada salvo la limpieza (A′), que
     espera tres sesiones reales.
   - [ ] Después, la **limpieza** (A′): borrar el marco y lo que quedó sin uso.

**A′. Limpieza: borrar el camino viejo (cuándo y cómo, criterio propuesto por el asistente, 2026-10-02; el dueño lo dejó a su criterio):**
- **Cuándo** — las tres cosas juntas: (1) **A terminado** (nada de la Botonera ni de las Acciones depende ya del marco); (2) **tres
  sesiones de juego reales** con el grupo usando solo lo nuevo; (3) en esas sesiones **nadie necesitó volver atrás** (`BN_SIEMPRE =
  false`) ni apareció un problema que solo se arregle con lo viejo. Mientras tanto queda "dormido", sin tocarlo ni probarlo.
- **Cómo** — de a un paso y probando: sacar `BN_SIEMPRE`, el interruptor ⚗ y `bnAlternar`; los pedidos de botón al marco
  (`bnDelegar`/`botonera-delegar`, `acDelegar`/`acciones-delegar`) y lo que los atiende en la ficha y en GM Tools (`modo=botonera` sin
  mensaje, `modo=acciones`); la ficha liviana vieja (`fichaMapaAbrir`, `abrir-ficha-mapa`); `abrir-equipo`/`equipoModoAbrir` (A4); `abrir-botin`/`botinModoAbrir` y `abrir-tienda` (A5); `abrir-stats`, `abrir-reroll`, `abrir-revivir`, `editar-en-ficha` y el `editar-estado` de un personaje (A6b), el `editar-estado` de un
  creep y el `boton` de `acciones-delegar` (A6c), `abrir-ver-creep` (y el `&ver=1` de
  GM Tools), `abrirModoGM` y el `?modo=finalizar|botin` de GM Tools (A6a); el Mantenimiento en un marco invisible (en el
  mapa `mantenimientoEncolar`/`mantenimientoSiguiente`/`mantenimientoCerrarMarco` y el aviso `mantenimiento-listo`; en la ficha y en GM
  Tools el `?modo=mantenimiento`), sin uso desde A2/A2b; los mensajes que queden sin uso en `comun/mensajes-mapa.js`. **No** se borra la Botonera de la ficha suelta (`ficha.html` sin el mapa): usa las mismas piezas de
  `comun/` y es la de la página de la ficha.
- [ ] Limpieza hecha (fecha y commit).

**Hecho en el camino (2026-10-02, a pedido):** ✅ **Grupos de creeps → mapas** (2026-10-02, pedido del dueño: «los grupos en realidad son mapas… un creep en un grupo es como una piedrita»): cada creep está en UN mapa (`sc.mapa`, `comun/creeps-mapas.js`) o en la Reserva; las pestañas de GM Tools son los mapas; «🗺 Mover a…» lo muda con su token; vincular en el mapa un token a un creep de otro mapa lo muda a ese mapa; los grupos viejos se convirtieron solos (con token → el mapa del token; vinculado → su mapa; si no, un mapa nuevo con su nombre). Se sacaron los grupos, el vínculo grupo↔mapa (`gm/gruposMapas`) y el arrastre. Probado en vivo en «Test con claude elsaulo»: conversión (el creep con token quedó en Mapa 1, el otro pasó a un mapa nuevo «Pantano prueba»), «Mover a…» con el token (de Mapa 1 a Pantano, oculto), a la Reserva (sin token), 🎭 «Traer los creeps de este mapa», el panel 🗺 Mapas con la cuenta, y vincular un token en Mapa 1 a un creep de Pantano (se mudó).

**C. Paso a paso unificado (pedido del dueño, 2026-10-02) → [`plan-paso-a-paso.md`](plan-paso-a-paso.md):** una sola ventana para crear y editar
(`comun/paso-a-paso.js`) y todos los asistentes sobre ella, en tandas; al final, el asistente de **personaje nuevo**, y después, cómo se ven los ítems
en el catálogo y las tiendas. Tandas 1–7 hechas y probadas en vivo (2026-10-02, la 7 = personaje nuevo); también cómo se ven los ítems en el catálogo y las
tiendas (solo lo que hacen; «Detalles técnicos» en Ver, `comun/item-corto.js`). Las reglas de `ajustes` (DDE inicial) ya están publicadas (verificado 2026-10-02). ✅

**D. Trampas automáticas y habilidades de «El origen de las especies» (2026-10-02):** trampas que tiran la salvación, el daño y el estado solas, con el
Aviso al afectado y la Crónica para la mesa (P148 ✅). Habilidades: ver [`automatizar-habilidades-origen.md`](automatizar-habilidades-origen.md) — quedan
Bizzante (Invocar Abeja, Robar SP: el dueño lo ve con Seba) e Invi (salteada). Pendiente: **probar en vivo la opción «Invoca»** (construida, sin probar) y
construir **«al hacer crítico: +N SP»** si Robar SP lo necesita.
**Habilidades de clase ya auditadas, con su automatización** (2026-10-02, pedido del dueño: que las auditadas tengan cargada la Ejecución y sus efectos):
13 ya la tenían; se pasaron a ✨ «a uno mismo» Estoicismo, Dash, Ojo de asesino, Blindaje (costo en turno ajeno 2 SP), Aura de espinas, Recuperación, Piel
resistente y Temple (se sacó el estado del sistema viejo para que no se aplique dos veces); Golpe brutal (Crítico potente +1 solo en ese golpe, −2 Evasión
sobre vos) y Drenar vida (diferencia + drena, tope 50 %). Probado en vivo desde el mapa: Piel resistente (Defensa 0 → 5, Res.Esp 5 → 10, resistencias 0 → 1).
✅ **Daño en área** (2026-10-02): onda de radio 1 con dodge roll, PdG contra la Evasión de cada uno, el daño de tu arma (construido: «el daño de tu arma» y «la onda deja dodge roll» en el editor); probado en vivo desde el mapa (Clementino con la Aguja: PdG 6 contra Eva 3, daño 9 − Defensa 4 = 5, la Bruja 23 → 18); el dodge roll de la onda no salió en la prueba (usa la regla de las áreas). ✅ **Sonic Boom** (2026-10-02): objetivo «cono» (el de la detección, al frente de quien la usa) y efecto «Pierde No2» (+ la diferencia; en 0, Sentado), 4 SP en turno ajeno; empate con la regla general (dueño). Probado en vivo: Fue 13 contra Con 4 → −10 No2 (6 → 0), quedó Sentado. Falta: **Cañón Vasco** (daño «tu tirada + X»). Al centrar (botón o C) el token late un momento (pedido del dueño).
(daño «tu tirada + X»). Visto de paso: después de cargar el mapa, la primera B a veces no abre la Botonera (la segunda sí).

**E. Drop de consumibles en creeps (2026-10-03, pedido del dueño):** ✅ al terminar el combate, cada creep derrotado tira su chance: humano 30 %, humanoide 20 %, el resto nada (jefe: doble chance, tope 90 %, y la tabla de tiers con un nivel más). Si suelta, sale un consumible al azar (trampas incluidas) del tier que toque: nivel 1 → Común 50 / Buena Calidad 35 / Raro 12 / Excepcional 3 / Legendario 0; cada nivel pasa ~6 puntos de Común a los mejores (Común nunca baja de 10 %). Se tira una sola vez, como el oro; en el reporte va con 🎲 y el GM lo puede quitar. Los números están juntos al principio de `comun/combate-fin.js` (DROP_*). Probado en el mapa (la Bruja humanoide nivel 3 soltó «Aceite resbaladizo menor», forzando el azar en la prueba).

**B. Puntual (después de A):**
7. [x] **Una invocación sin No2 para atacar, adentro del duelo** — hecho 2026-10-02: pregunta «¿Atacar igual?» (duelo, Botonera de la
   ficha y del mapa), gasta los No2 que tenga y deja la línea roja (`InvAcciones.faltanNitros`/`preguntaSinNitros`/`alertaSinNitros`,
   `pagarAtaque(inv, forzar)`). Probado en vivo en el mapa con una invocación de prueba de Silvia («Lobo de prueba (B-7)», 1 No2, ataque
   de 4): «Sí» → quedó en 0, ataque contado, línea roja «atacó sin No2 suficientes · Costaba 4 No2 y tenía 1»; «Cancelar» → nada. El
   duelo, con una prueba nueva de `comun/pruebas.html` (227 en verde).
7b. [x] **Los "Mis presets" de estados del GM se pierden al recargar** — hecho 2026-10-02: `comun/presets-gm.js` los guarda en
   `gm/presetsEstados` (sin reglas nuevas); GM Tools los lee al entrar y el mapa los ofrece ("+ Estado" de un creep, el editor de estados
   y la Ejecución de una habilidad de creep). Probado: guardado desde GM Tools, sigue tras recargar, aparece en el mapa. Antes: (visto 2026-10-02 al mudar el "+ Estado"): GM Tools los guarda en
   `S.estadosPersonalizados`, que no se sube a Firebase (los creeps sí; esto no). Por eso el "+ Estado" de un creep en el mapa no los
   ofrece. Guardarlos en la partida (p. ej. `gm/presets`) y ofrecerlos en los dos lados.
8. [x] **Aplicar estados a otros desde las habilidades de personaje** — hecho 2026-10-02. La Ejecución ✨ ya los aplicaba (paso
   «Efectos» + «Aplicar» del cuadro: a un creep directo, a un personaje con un aviso a su ficha). Faltaban dos cosas, ya resueltas:
   **(a)** el aviso a un personaje solo lo aplicaba **la ficha abierta** — con el mapa solo quedaba esperando; ahora también el mapa,
   para los personajes que maneja ese usuario (`comun/recibidos.js`, `recibidosEscuchar` en el mapa; la ficha usa la misma pieza). Lo
   mismo pasaba con las **recompensas del combate** (XP, DDE, despojos, trampas que vuelven): también las aplica el mapa ahora; **(b)** a una **invocación** no le llegaba nada («aplicalo a mano»): ahora el estado va con el mismo aviso
   (`fichaId~invId`) y la cura directo (`dueloCurarInv`). Probado en vivo (GM con 🎮 Silvia, solo el mapa abierto): Escarcha a Silvia
   y Pajaritos a su invocación de prueba se aplicaron solos y los avisos se borraron; la invocación 5 → 2 (daño) → 4 (cura); una
   recompensa de prueba (+7 XP, +2 DDE, +1 despojo) la aplicó el mapa (XP 59 → 66, DDE 482 → 484, despojos 14 → 15). Las skills
   de clase que lo necesitan (Lisiar, Confusión, Marcar, Maldiciones) se arman con la Ejecución al auditarlas (B-9).
9. [ ] **Auditoría de skills de clase** (§7): Tanque 9/10 (falta Miti-Miti), después una skill por clase alternando.
10. [ ] **Paso 8 del casteo** (§1): quedan 10 skills de clase que tocan casteo.
11. [ ] **Rework de armas no mágicas** elemento por elemento y el crítico nuevo en ficha y mapa (§8).
12. [ ] **Preguntas para la mesa**: P143 (la tirada de la zona) y P144 (la armadura mágica), esperan la opinión del grupo.

## 1. Casteo con SP — **proceso paso a paso en [`proceso-casteo.md`](proceso-casteo.md)** (reglas en [`reglas-casteo.md`](reglas-casteo.md), decisiones en P97)
> **Los 5 pasos de decisión, el Paso 6 y el Paso 7 (en su mayoría) están cerrados (2026-09-27).** Retomar por el
> primer paso sin ✅ de `proceso-casteo.md` (hoy: **paso 8**, auditoría de contenido). Lo de abajo es solo un resumen.
- [x] Paso 1 (2026-09-27): tipos de daño de casteo — **por defecto todo ignora armadura**, salvo que sea un objeto físico arrojado (regla general, no hizo falta una lista cerrada de tipos); críticos/Res. a crítico no aplican al casteo; el daño de trampas sigue la misma regla.
- [x] Paso 2 (2026-09-27): "qué tira cada lado" — se apoya en el campo `duelo` cuando la habilidad ya está automatizada; si no, una frase tipo "Tirás PdG.Esp contra el Res.Esp del objetivo"; una sola tirada en habilidades mixtas (daño + debuff); sobre uno mismo/aliado no se tira nada pero se abre igual el cuadro de duelo sin oposición (visible a toda la mesa, botón «Aplicar» — ya construido); control mental tira PdG.Esp por defecto contra Res.Mt.
- [x] Paso 3 (2026-09-27): resistencia al daño de casteo — un solo stat nuevo, **Armadura mágica** (número fijo, no por elemento, no deriva de atributo, solo ítems de tier alto); distinta del estado Escudo especial y de la skill **Armadura arcana** del Mago (renombrada, antes "Armadura Mágica").
- [x] Paso 4 (2026-09-27): esquivar áreas — primero PdG.Esp/PdG del que actúa contra la Evasión del defensor; solo si gana esa Evasión gana el derecho a un dodge roll (hasta 2 casilleros, 1 No2 c/u, doble con Rengo, imposible con Stun/Inmovilizado); no hay término medio (fuera del área del todo o efecto completo); las trampas no se esquivan así.
- [x] Paso 5 (2026-09-27): nombre del daño genérico → **"arcano"** (ya usado en el catálogo); "Mg"→"Esp" ya hecho; "Hechizo" se mantiene.
- [x] Paso 6 (2026-09-27, casi todo ya estaba hecho por el sistema de duelo de habilidades): tipo de daño en el 🎯 de cada habilidad (Arcano/Fuego/Hielo/Rayo/Físico) + tilde independiente "Ignora la Defensa" (corregido hoy, antes lo ataba siempre al tipo); el mapa ya no resta Defensa cuando corresponde; las trampas ya tenían su propio tilde independiente; la Mesa ya dice el tipo. Falta solo: mostrarlo también en la lupa 🔍 (menor).
- [x] Paso 7a (2026-09-27): código de **Armadura mágica** — stat `armadmg` en ficha y creeps (igual que Defensa, sin fórmula de atributo), se puede dar como bono de ítem desde el asistente compartido, y el mapa la resta (en vez de nada) **solo** en el daño de casteo real que ignora la Defensa (`dueloAplicarDano`) — crítico real, trampas, fuego y Rayo en cadena siguen ignorando la Defensa entera, sin cambios.
- [x] Paso 7b (2026-09-27, versión final — reemplaza una primera versión con herramienta aparte del GM, retirada el mismo día a pedido del dueño): el hechizo de área usa el **mismo cuadro de duelo paso a paso** que uno 1 contra 1, encadenado — un sub-duelo por objetivo, visible a toda la mesa y minimizable, con una fase nueva `dodge` (ganar la Evasión da derecho a un dodge roll de hasta 2 casilleros; si no logra salir, efecto completo igual). Documento nuevo `campanas/<id>/areas/<id>` dibuja el círculo compartido. Ver `docs/duelo-de-habilidades.md` §11. **Reglas nuevas: hay que pegarlas** (`grupo` en `duelos`, colección `areas` completa).
- [ ] Paso 8: auditoría de contenido por tandas — skills de clase (13 de 62 tocan casteo; Chispazo, Orbe arcano y Rayo Mágico ya auditadas 2026-09-27, quedan 10) → habilidades de creeps → creeps base → armas naturales → trampas base → catálogo (~60 ítems) → pasivas y estados → manual.

## 2. Probar con la mesa abierta (nada de esto se probó con sesión iniciada y varios jugadores)
- [ ] **Volver a pegar `firebase/firestore.rules`** (nueva colección `combate`): sin eso no se abre la ventana "Batalla terminada" ni se habilitan los botones 🎁.
- [ ] Pegar `firebase/firestore.rules` en la consola (**Desarrollar y realizar pruebas** → Ctrl+A → pegar → Publicar) y verificar que quedó (buscar `estados` y `botin`).
- [ ] Grupos de creeps, **tokens automáticos** (creeps y jugadores), **Finalizar combate y Botín desde el mapa**, botón **🎭** del borde izquierdo y **grupos vinculados a mapas**.
- [ ] Reporte de fin de combate → recompensas en la ficha → **botín**: Sumar a la mochila, Comparar, **Despojar**.
- [ ] **Trampas automáticas** (se colocan solas, ocultas, con daño) y **estados sobre otros** ("¿A quién le pegó?", la ficha aplica el aviso; trampas con estado).
- [ ] **Protección de jefe** (inmune a Stun, +1 Res.Esp).
- [ ] Botón **🗺 Mapas** del GM (se arregló una posible falla de caché: confirmar que abre; si no, mandar el error de la consola).
- [ ] Al borrar un creep, la pregunta de borrar sus tokens en todos los mapas.
- [x] **🎮 Tomar el control** (2026-09-30): probado en "Claude · pruebas" con Clementino (personaje del dueño con otra cuenta) desde la cuenta del GM: tomar el control (marca, cartel, Mesa), estado recibido (Veneno ×2, el aviso se borra), pase de turno (25 → 23, reporte en la Mesa), Botonera desde el mapa, mover pagando No2 (12 → 11), ser atacado por un creep (el GM elige la defensa y tira la Evasión) y devolver el control. Todo restaurado. Falta mirarlo desde la cuenta del jugador (el cartel de solo lectura en su pantalla).
- [x] ~~**Un creep sin No2 para atacar, adentro del duelo**~~ (hecho 2026-10-02, ver §0.2) (visto el 2026-10-01 probando el paso 4c): GM Tools rechaza el ataque y
  el aviso queda en el marco escondido — en el cuadro del duelo «🎲 Pagar y tirar PdG» del creep no hace nada visible. Debería
  verse el cartel de "sin No2" (o un aviso en el mapa), como pasa con un personaje. Es del camino de siempre de los creeps, no
  de la Botonera nueva.
- [x] ~~**Una invocación sin No2 para atacar, adentro del duelo**~~ (hecho 2026-10-02, ver §0 B-7) (visto 2026-10-02 al arreglar el de los creeps): `InvDuelo` rechazaba el
  ataque con un aviso (`comun/inv-duelo.js`, `InvAcciones.pagarAtaque`); alinearlo igual que los creeps (preguntar, gastar lo que tenga,
  línea roja).
- [ ] **Hechizo de área en cascada** (Paso 7b del casteo): armar una habilidad de prueba con objetivo "A un área", castearla contra 2-3 objetivos y ver que la cascada, el círculo compartido y la fase `dodge` anden con varias pantallas abiertas a la vez.

## 3. Documentación
- [ ] **Manual** (`manual-usuario/notas`): grupos y tokens automáticos, botín, Despojar, Finalizar combate en el mapa, trampas automáticas, estados sobre otros, protección de jefe, botón 🎭 y grupos ↔ mapas, y una nota de casteo cuando estén las reglas.

## 4. Diseño pendiente
- [x] **Trampas para jugadores**: hecho (2026-09-24, el paso 🪤 del editor de habilidades del personaje; desde el 2026-09-30, en ✨ se elige la casilla).
- [x] **Zona persistente y trampas en invocaciones** (P134): hecho el 2026-10-02 (etapa 4f, `plan-paso4-etapa4.md`): la zona anda y el
  editor de habilidades de invocación tiene el paso 🪤 Trampa. (Ataque con arma con arreglos y ⚡ Flash ya andan en creeps e
  invocaciones desde el 2026-09-30.)
- [x] **Probar en mesa el ataque con arreglos y el Flash de un creep** (2026-09-30): ✔ en "Claude · pruebas" (ver
  `pruebas-de-humo.md`); encontró y se corrigieron dos fallas de carteles tapados en el mapa.
- [ ] **Despojos mágico/especial** de los ítems: siguen a mano.
- [ ] **Protección de jefe, segunda versión** (P95): resistencia a otros controles (Exhausto, Inmovilizado…), contador de resistencia o fases.
- [ ] **Estados sobre otros más finos**: los que faltan automatizar (empujar, derribar, huir, "pierde el sigilo", etc.).
- [x] ~~**Grupos vacíos en el menú 🎭**~~ — ya no hay grupos: el 🎭 trae los creeps del mapa (2026-10-02, grupos → mapas).

## 5. Contenido a revisar (números de primer borrador)
- [ ] Las **321 habilidades de creeps**: daño, cooldowns, bonos, cuáles son rápidas y cuáles lentas.
- [ ] Los **173 creeps base** (todos dicen "(auditar)") y sus recompensas.
- [ ] Las **66 armas naturales**: potencia y porcentajes de los efectos.
- [ ] Las **24 trampas base** y su daño.
- [ ] El pool de **habilidades de clase** (`skills-clase.js`): 62 skills, casi todas todavía "(Sin auditar)".

## 6. Repaso de buffs y debuffs (en curso, 2026-09-21)
> **Regla de redondeo (2026-09-22):** salvo que se diga lo contrario, los **debuffs redondean hacia abajo** y los **buffs redondean hacia arriba**. Ya cumplen esto: Cansado, Exhausto, Pajaritos, Lisiado (todos `floor`). Tenerlo en cuenta al repasar los buffs que faltan y al sumar las habilidades de clase.
- [x] **Veneno**: se acumula (suma stacks, turnos = stacks, sin tope); Veneno severo aparte y no se acumula.
- [ ] **Mecánica "cura estados" en consumibles y habilidades — a propósito recién después de terminar todo el repaso** (decidido 2026-09-22): una vez repasados todos los debuffs y buffs, agruparlos por familia (venenos, controles físicos tipo Lisiado/Rengo, etc.) y ahí sí crear ítems curativos específicos por grupo — idea del usuario: el Antídoto cura **todos** los tipos de veneno (Veneno + Veneno severo), un vendaje cura Lisiado + Rengo. Hoy sacar cualquier estado sigue siendo a mano.
- [ ] **Nube tóxica** del Debuffer: ¿sigue aplicando solo 1 stack a alguien ya envenenado?
- [x] **Sangrado se acumula (decidido 2026-09-22): +1 al daño por turno por reaplicación** (2 → 3 → 4…), no un stack completo como Veneno. Se guarda como `stacks:2, hpTurno:-1` (antes `stacks:1, hpTurno:-2`) y cada reaplicación suma 1 stack — mismo mecanismo que Armadura rota. Hecho en ficha (PJ e invocaciones), gm-tools (creeps, directo y automático) y `comun/estados-aplicar.js` (habilidades/trampas).
- [x] **Pajaritos**: sin cambios (PdG y Evasión a la mitad, redondeado abajo, 3 turnos).
- [x] **Cansado**: cambió de −1 fijo a **corta los No2 máximos a 2/3** (pierde un tercio, redondeado hacia abajo). `cansado:true` en ficha, gm-tools e `comun/estados-aplicar.js`; ya no usa `mods`.
- [x] **Exhausto**: cambió de un tope fijo (1 No2) a **corta el No2 máximo a un tercio del natural** (redondeado hacia abajo) — misma lógica que Cansado: 1 Acción de un máximo de ~3 era un tercio. `exhausto:true` en vez de `forzarNitros:1`; si Cansado y Exhausto están activos juntos, gana el más restrictivo (Exhausto, 1/3 < 2/3) sin necesidad de sumarlos.
- [x] **Stun**: se queda en 2 turnos (a propósito: con 1, el Mantenimiento podría gastarlo antes de tu turno y no perderías nada); se sumó **la Evasión falla directo mientras dura, sin tirar dado** — a mano, no se automatiza (no hay nada que calcular).
- [x] **Armadura rota**: sin cambios (−1 Defensa por acumulación, permanente, se cura con Óleo reparador).
- [x] **Armadura arruinada**: **se eliminó del todo** (2026-09-21). Lo que la aplicaba pasó a sumar stacks de Armadura rota en su lugar: 3 hachas del catálogo (`datos/catalogo.json`, regenerado con `importar_json.py`; Hacha de Durin 3 stacks, Hacha filo de diamante 2, Hacha de guerra pesada 1 — números a revisar), el efecto "Arruina armadura" de `comun/armas-naturales-base.js`, y la habilidad de creep "Disolver la armadura" (`comun/creeps-base.js`/`skills-creep-base.js`). Se sacó `armaduraArruinada` de ficha, gm-tools, mapa, `estados-aplicar.js` y el manual (nota 07-estados.md unificada, con aviso de por qué se sacó).
- [x] **Veneno severo**: sin cambios (1 de daño el primer turno, +1 con cada mantenimiento, no caduca, no se acumula).
- [x] **Sangrado**: sin cambios (−2 HP por turno fijo, permanente hasta curarse). Sigue abierto si se acumula (arriba).
- [x] **Lisiado**: sin cambios (PdG y Parry a la mitad, redondeado abajo, 3 turnos) — mismo patrón que Pajaritos con otro par de stats.
- [x] **Inmovilizado**: sin cambios (Movimiento en 0; no toca ningún stat, actúa al moverse en el mapa).
- [x] **Rengo**: sin cambios (Movimiento a la mitad → cada casillero cuesta 2 No2 en vez de 1).
- [x] **¡Repaso de los 12 debuffs terminado! (2026-09-22)** De paso se encontraron y arreglaron dos bugs: Afortunado ahora se ve en color en la Mesa (P100 sigue abierta: falta implementarlo en invocaciones) y Pajaritos ya afecta a los creeps de gm-tools (P101, cerrada).
- [x] **Repaso de buffs (2026-09-24):** Regeneración, Invulnerable, Escudo especial, Sangre pura, Coagulación extrema y Sigilo: sin cambios (ya automatizados). **Hypeado** pasó de +1 Acción a **+⅓ de los No2 naturales, redondeado hacia arriba** (`hypeado:true`, mismo mecanismo que Cansado; ficha, invocaciones y creeps; los dos consumibles del catálogo usan el preset). **Inmunidad a CC** ahora bloquea Stun, Exhausto, Inmovilizado, Rengo, Lisiado y Pajaritos (`esCC:true`); Veneno y Sangrado no cuentan. **Blindado** y **Espinas** pasaron a **manuales** (solo recuerdan que están activos y sus turnos; se sacó la tilde "Crít" y el aviso de espinas). Pendiente de este repaso: **Afortunado en invocaciones (P100)**; el cooldown del Sigilo que cuente desde que sale. **Sentado** (2026-09-24): estado nuevo, permanente, Evasión a la mitad (al resultado, como Pajaritos), sin dodge roll (a mano) y botón **Levantarse** que cuesta 1 No2 y lo saca (ficha y creeps de gm-tools; falta en invocaciones).
- [ ] Después del repaso de presets: auditar las habilidades de clase con buff/debuff (`comun/skills-clase.js`) e incorporarlas al menú de presets — inventario completo en el chat del 2026-09-21 (Estoicismo, Shockwave ⚠️ choca de nombre con Pajaritos, Sonic Boom → estado nuevo "Sentado", Aura de espinas, Lisiar ⚠️ choca de nombre con Lisiado, Tajear, Invi, Envenenar arma, Degollar, Blessing, Adrenalina, Maldición debilitante/extenuante/tormentosa, Confusión, Marcar, Apuntar, Enfocado, y otras — ver el resto en el chat).

## 7. Skills de clase
- [ ] **Auditoría de skills de clase — EN PAUSA (2026-09-24).** Método: una skill por vez (cómo está → cómo se adapta → decisiones → se carga en `comun/skills-clase.js` y `docs/clases-borrador.md`). **Tanque: 9 de 10 hechas** (Blindaje, Shockwave, Aura de espinas, Recuperación, Sonic Boom, Piel resistente, Daño en área, Takle, **Taunt** — 2026-09-27, con el duelo de habilidades y el estado nuevo "Provocado"). **Falta Miti-Miti**. **Método nuevo (2026-09-27, pedido del dueño): alternar una skill por clase en vez de terminar una clase entera** — orden sin Shooter (faltan las reglas de rango): Tanque → Warrior → Asalto → Mago → Support → Debuffer, y así. Casi todas siguen "(Sin auditar)". Dudas abiertas de este tramo: P109 (Sonic Boom con Flash en turno ajeno), P110 (Daño en área: esquiva y parry), P111 (¿Flash siempre = 0 Nitros?). Infraestructura hecha en el camino: bono de tirada (`tiradaBono`), zona dibujada 3 s en el mapa (`zonaMapa: 'cono'|'flor'`), estados Sentado (con Levantarse) y Espinas 25 %. ~~**Idea pendiente que destraba varias skills:** "aplicar estado a otros" para habilidades de personaje~~ — ya está (la Ejecución ✨; B-8, 2026-10-02).
- [ ] **Auditar las trampas de las habilidades de creep** (`comun/skills-creep-base.js`, 17 con `tR(`; y las de `comun/creeps-base.js`): decidir cuáles van directo a la vida (`ignoraDef`) con el mismo criterio que las trampas base. Candidatas: Trampa de fuego, de hielo, de ácido, de runas, Descarga oculta, Cepo de alma y de veneno. También cargado en A desarrollar (2026-09-24).

## 8. Crítico y rework del catálogo (2026-09-25; en pausa a propósito, primero se cierran los parámetros de diseño)
- [x] (cargado 2026-09-25, sujeto a revisión con el uso) **Set corto de skills que definan la regla del crítico** (Crítico frecuente / Crítico potente, ver P113 y P115): proponerlo para que el dueño lo audite.
- [~] **Crítico nuevo en el código — paso 1 hecho (2026-09-25):** `comun/critico.js` + 🎯 Calculadora de crítico en el ☰ (PdG, Evasión y el arma → nivel, d20, multiplicador, daño; publica en la Mesa). **Parche hecho el mismo día (decidido por el dueño):** el stat **Crit** pasa a ser **Crítico frecuente** (etiqueta en la ficha, gm-tools, asistente de ítems y editor del catálogo; ya no sale de la Destreza: base 0, las fichas viejas se pasan una vez; solo lo suman equipo, skills y estados); los ítems con "crítico +N" quedaron como **Crítico frecuente +N con N de 1 a 5** (Cachiporra y Martillo de sargento pasaron de +10 a +5: revisar, la Cachiporra es Común); los textos del catálogo se corrigieron y el catálogo de esta rama se regeneró con `importar_json.py`. **Hecho también (mismo día):** "Recibe daño" del mapa con selector de crítico (×2/×3/×4, sin Defensa) y 🎯; la Cachiporra y el Martillo de sargento perdieron el crítico (no tiene sentido en armas pesadas; el catálogo entero se revisa en el rework). **Hecho también (mismo día):** stat **Crítico potente** (`critpot`, base 0; ficha, GM Tools, asistente de ítems, editor y generador de tiendas; `catalogo_comun.py` lo acepta), presets de estado **Crítico frecuente** y **Crítico potente** (buff, +1, editables) y la calculadora se autocompleta con el Crítico frecuente/potente y el Tipo del arma equipada de la ficha (`criticoDatosIniciales`). **Faltan:** (1) dar esos estados a OTROS aliados desde una skill (`EstadosAplicar` solo maneja debuffs; hace falta para Marca del cazador), (2) publicar la Resistencia a crítico en el resumen para autocompletarla, (3) autocompletar desde los tokens del mapa. **(Lo de abajo, ya hecho:)** (b) qué hacer con el stat **Crit** de la ficha y los 17 ítems con "crítico +N" (propuesta: pasan a ser Crítico frecuente ×N), (c) crear el stat Crítico potente y los estados Crítico frecuente/potente, (d) publicar la Resistencia a crítico en el resumen para autocompletar.
- [ ] (original) **Llevar el crítico nuevo a la ficha y al mapa**: PdG − Evasión ≥ rango del arma (nivel N, N − Resistencia d20, el mejor; doble/triple/cuádruple daño; ignora armadura; multiplica todo el daño del golpe). Reemplaza al stat Crit. Cambio grande: hacerlo en pasos chicos.
- [ ] **Rework del catálogo** con los preceptos de `docs/guia-de-diseno.md` (familias y efectos de arma en tres niveles, peso de cada efecto P112, Resistencia a crítico por slots P114, anillos escasos y caros): el asistente propone por tandas y el dueño audita. Falta definir los slots exactos de cada Tipo de resistencia.
- [ ] **Diseño de armas, paso a paso (plan del dueño, 2026-09-25):** primero **todas las armas NO mágicas, elemento por elemento** (orden propuesto: 1 Tipo y Peso con su costo en Nitros; 2 empuñadura y mano izquierda; 3 Rango / Alcance; 4 bonos; 5 efectos al golpear por familia; 6 crítico frecuente y potente; 7 estado al equipar; 8 tier, calidad y precio). **Después**, con esa base como referencia, armar los **paralelismos mágicos con nociones matemáticas** (daño en función de Nitros, etc.) — el dueño pidió ayuda para pensarlos. Ver P116 y `docs/guia-de-diseno.md`.
- [ ] **Rework del catálogo — hoja de ruta:** ver [`hoja-de-ruta-rework-catalogo.md`](hoja-de-ruta-rework-catalogo.md) (fases 0–7; se hace paso a paso, el asistente propone y el dueño audita).
- [ ] **Generador de tiendas: cupo mínimo de armas mágicas en cada generación** (pedido del dueño, 2026-09-25): diseñarlo cuando existan las armas mágicas del catálogo (ver `rework-armas.md`, armas mágicas). Preguntas para ese momento: ¿cuántas por tienda?, ¿depende del tamaño/tipo de tienda?, ¿pisa el azar de tier?
- [ ] **Sondeo de mecánicas** ([`sondeo-mecanicas.md`](sondeo-mecanicas.md)): resistencias por elemento mágico, ampliar el equipo con las mecánicas que faltan, relevar creeps y después **reworkear las skills de creeps** coordinadas con el equipo (pedido del dueño, 2026-09-25).
- [ ] **Auditoría de defensa** (`datos/auditoria-defensa.html`): que el dueño audite; después el asistente aplica al catálogo con `importar_json.py`.
- [ ] **Consumibles de visibilidad automáticos en el mapa** (destapar radio / luz sostenida con turnos / revelar lo oculto al usar el consumible): hoy son ✋ a mano. Diseño en [`rework-consumibles-visibilidad.md`](rework-consumibles-visibilidad.md).
- [ ] **Revelar lo oculto automático para el Yelmo del Ojo Que Todo Lo Ve** (`revelaOculto` en el ítem equipado → el mapa muestra a los jugadores creeps en sigilo, trampas y elementos ocultos dentro del campo de visión del portador). Hoy es ✋ a mano. Ver `rework-defensa.md` (piezas de visión).
- [x] (hecho 2026-09-25, falta probar en mesa) **Trampas consumibles: que se coloquen solas desde la mochila** (`trampaDatos` ya está en cada ítem): pide la casilla, descuenta 1 unidad y arma la trampa del jugador en el mapa. Ver [`rework-trampas-consumibles.md`](rework-trampas-consumibles.md). Incluye la tarea vieja «Trampas para jugadores».
- [~] **A desarrollar: ítems de cinturón** (2026-09-25: hecho la mochila como slot (`capmochila`), 11 cinturones, 10 mochilas y 6 piezas defensivas con ranuras de cinturón; ver `rework-defensa.md`; queda la revisión de balance y probar en mesa). Original: (pedido del dueño, 2026-09-25): (1) **cómo ampliar los slots de cinturón con ítems** (hoy hay `capcinturon`/`ranuras` sueltos en algunos cinturones y las hebillas no existen); (2) que **el cinturón en sí sea un slot de equipo** (hoy es una lista aparte: el cinturón de consumibles). Diseñar el slot, ítems de cinturón por tier (más ranuras, resistencia a Tipo 12, bolsas especiales, carcajes, portapociones) y cómo se relaciona con la mochila. *También hay que cargarlo en la pestaña 🎨 A desarrollar de las Herramientas de diseño (Firestore), que no se puede desde acá.*
- [ ] **Auditar las 20 piezas actuales con Movimiento negativo** (regla del 2026-09-25: −1 Mov = −1 Nitro, un drawback muy grande; y +1 Mov = +1 Nitro, un bono muy caro; ver `guia-de-diseno.md`): decidir si cambian por Evasión/Iniciativa o se compensa. Llevan aviso en `datos/auditoria-defensa.html`.
- [ ] **Mesa común: volver a pegar `firebase/firestore.rules`** (colección nueva `mesaComun`) y probarla con dos jugadores: ofrecer un ítem / DDE / despojos, llevárselo, retirar; el ítem sigue ocupando la mochila del dueño hasta que se lo llevan. Ver `workflow-firebase.md`.
- [x] (hecho 2026-09-26, falta probar en mesa) **Luz de la escena por mapa** (radio de visión configurable por el GM) y que el mapa lea la Visión de cada ficha. Además (2026-09-26): los consumibles de luz destapan la niebla y duran X turnos, y el Yelmo del Ojo Que Todo Lo Ve revela lo oculto, todo automático; falta probar en mesa (ver `rework-consumibles-visibilidad.md`). Sigue pendiente lo de **lentes**.
- [ ] **Rework de creeps y sus skills** — hoja de trabajo en [`rework-creeps.md`](rework-creeps.md) (diagnóstico hecho 2026-09-26; esperando las 7 respuestas del dueño para armar la herramienta de auditoría y la tanda 1). Incluye: progresión por nivel, mecánica firma por familia, ~20 skills nuevas, pasivas de creep, automatizar las 166 skills con parte a mano y auditar las 27 trampas de skills.
- [x] (2026-09-26) **Ampliación de creeps por facción:** +12 goblins del bosque, +6 kobolds de las minas, +14 kobolds de las cumbres y +29 insectos (colmena): 234 creeps base; ver `rework-creeps.md` §9. Falta auditarlos.
- [x] (2026-09-26) **Armas de rango y explosivos cerradas** (tandas 5 y 6, 24 armas, publicadas) y estado **Miedo** definido. Sigue: pasivas de creep (pregunta 5 reformulada) → herramienta de auditoría de creeps y tanda 1. Falta auditar.
- [ ] **Rework de creeps — auditoría:** que el dueño audite en `datos/auditoria-creeps.html` (255 creeps; pasivas de familia y elementales nuevos). Después: terceras habilidades para el resto de las familias, equipo y efectos de arma por nivel. Ver `rework-creeps.md` §11.
- [x] (2026-09-26, falta probar en pantalla) **Regla general de habilidades: dos tiradas en la misma tarjeta** (Ejecutar + botón 🎲 solo si existe la segunda) y **dos pasos separados en los editores** (tirada al ejecutar / tirada de efecto): ficha, invocaciones y creeps. Ver `guia-de-diseno.md`.
- [ ] **Volver a pegar `firebase/firestore.rules`** (campos nuevos `trampaItem` y `trampaFicha` en los elementos del mapa) y **probar en mesa**: poner una trampa de consumible, cerrar el botín sin que se dispare y ver que vuelve a la mochila / al cinturón. Ver `rework-trampas-consumibles.md`.
- [x] (2026-09-26) **Equipo de humanos y humanoides por nivel** aplicado a 150 creeps (`rework-creeps.md` §12). Falta auditarlo.
- [x] (2026-09-26, falta probar en pantalla) **Reglas del escudo cerradas**: parry con escudo (Parry vs PdG, cuesta el peso del escudo) y **Bloqueo enfrentado** (Bloqueo + peso del escudo contra Fuerza + peso del arma del atacante) con el botón nuevo 🎲 **Fuerza del golpe** en la ficha (panel y Botonera) y en las tarjetas de creeps. Abierto (a confirmar): qué pasa si se pierde el Bloqueo (propuesta: el golpe entra completo). Se descartó darles HP a los escudos. Ver `manual-usuario/notas/08-equipo.md`.
- [x] (2026-09-26) **Atacar por la espalda: regla definida, sin automatizar** (solo anotada en el manual, `06-combate.md`): sin sigilo el defensor se da vuelta; con sigilo, su Evasión es 1. Falta definir las excepciones (defensor que no puede darse vuelta, ej. Inmovilizado).
- [~] **Regla a prueba: contraataque tras Parry** (arma o escudo; siempre cuesta lo de un primer ataque y no suma al conteo de ataques). Botón ⚔ Contraatacar en la ficha, la Botonera y las tarjetas de creeps. **Decidido 2026-10-01 (P139): solo tras un Parry Y un Bloqueo exitosos; en el duelo, la pregunta «¿Contraatacás? Sí / No» abre el duelo al revés.** Falta probarlo en mesa.
- [x] (2026-09-26, falta probar en pantalla) **El botón Atacar pregunta qué ataque es** (normal / de oportunidad / contraataque) en la ficha, la Botonera y las tarjetas de creeps: normal = 1.º Tipo ÷ 2 y luego Tipo completo (suma al conteo); oportunidad y contraataque = siempre Tipo ÷ 2 (no suman). Reemplaza al botón suelto ⚔ Contraatacar. Ver `manual-usuario/notas/06-combate.md`.
- [x] (2026-09-26, falta probar en pantalla) **La calculadora de rango (R / T) contempla los sólidos y colisiones como la visión**: el área se recorta detrás de un obstáculo. Ver `vtt-hexgrid/CLAUDE.md`.
- [x] (2026-09-26, falta probar) **PdG en contraataque** (`pdgcontra`, +1 a +3, 0,8 PC por punto, casa de los cortantes T6) en 8 armas; suma solo al Contraataque. Ver `guia-de-diseno.md`.
- [x] (2026-09-26, falta probar) **PdG en oportunidad** (`pdgopor`, +1 a +3, 0,8 PC por punto, casa de los punzantes T4) en 11 armas nuevas (tanda 7); suma solo al Ataque de oportunidad. Ver `guia-de-diseno.md`.
- [x] (2026-09-26) **Tipo 12 = Explosión, en pausa:** Martillo del Titán quitado, Lanzallamas Excepcional, tanda 6 retirada. Se retoma (definir la Explosión, P-Explosión) cuando el resto esté consolidado.
- [ ] **Ataque paso a paso (duelo en vivo)**: propuesta en `ataque-paso-a-paso.md`; falta que el dueño responda las preguntas y decida cuándo (P-Duelo).
- [~] (2026-09-26, falta probar) **Duelo, etapa 1** hecha (`comun/duelo.js`): elegir objetivo, aviso al defensor, PdG vs Evasión con veredicto. **Hay que pegar las reglas de Firestore (`duelos`).** Sigue: clic en el token del mapa, Parry/Bloqueo, crítico, daño, efectos con «Aplicar». Ver `ataque-paso-a-paso.md`.
- [x] **Duelo de hechizos**: superado por «Duelo para habilidades dirigidas», ver más abajo.
- [x] **Durabilidad** de armas, escudos y armaduras (quedó en **3** por punto de Peso, mínimo 3; se gasta 1 al perder el Bloqueo): decidido en `durabilidad.md` y hecho en las fichas — lo que falta está en el punto "Durabilidad en las fichas" de abajo.
- [ ] **Óleo reparador** (quitado del catálogo el 2026-09-26 hasta definir su funcionamiento): pasa a ser un ítem de uso solo fuera de combate (deja de ser de cinturón) y a repararse también con herrero y con habilidades de talento que usan despojos. Depende de `durabilidad.md`.
- [~] (2026-09-26, falta probar) **Duelo, etapa 2**: defensa a ciegas (Evasión / Parry con cada arma o escudo), Bloqueo, «pasa la mitad» y contraataque. **Hay que volver a pegar las reglas de Firestore.** Sigue: durabilidad en la ficha, crítico, daño, efectos.
- [~] (2026-09-26, falta probar) **Duelo, etapa 3 (crítico)**: cuenta del crítico, d20 en la Mesa, cartel dorado con el multiplicador. **Hay que volver a pegar las reglas de Firestore.** Sigue: daño y defensa (con «35 derecho a la vida»), durabilidad en la ficha, efectos.
- [~] (2026-09-26, falta probar) **Duelo, etapa 4 (daño)**: tirada de daño, crítico derecho a la vida, Defensa, mitad y baja de HP por el mapa del GM. **Hay que volver a pegar las reglas de Firestore.** Sigue: efectos del golpe (etapa 5), durabilidad por ítem, resumen final en la Mesa (Ctrl+Z no deshace el daño de combate, solo el HP manual).
- [~] (2026-09-26, falta probar) **Duelo, etapa 5 (efectos del golpe)**: cada efecto es un momento (dado, funcionó, Aplicar); los que necesitan daño quedan tachados si no pasó. **Hay que volver a pegar las reglas de Firestore.** Sigue: efectos de habilidades, dato «requiere daño» editable en el asistente, Armadura rota y durabilidad por ítem, Demora y Prende fuego automáticos, resumen final en la Mesa.
- [~] (2026-09-26, falta probar) **Duelo: resumen final en la Mesa** (una línea con todo lo que pasó, publicada por el atacante). Reglas: campo `resumido`.
- [x] (2026-09-26, **probado por el dueño: funciona «exactamente como buscaba»**) **Dados 3D: destacar el más alto** (crecer, subir, brillar, ondas) y **el duelo muestra el resultado después de que los dados quedan a la vista**. Recurso reutilizable: `destacar: 'max'`. Reglas: campo `destacar` en `tiradas`.
- [~] (2026-09-26, falta probar) **Durabilidad en las fichas**: 3 por Peso (mín. 3), Armadura rota por pieza, Rompe armadura al azar, desgaste del arma o escudo al perder el Bloqueo, ítem roto sin efectos, avisos, botones − / + a mano. Falta: reparar (herrero, talento, Óleo), tienda y catálogo, prohibir reparar en combate.
- [~] (2026-09-26, falta probar) **Reparación con el herrero**: casilla «Herrero» + precio por punto en el generador de tiendas, botón «🔧 Reparación» en la ficha (no en combate). Falta: reparar por talento con despojos.
- [ ] **(Para más adelante, dueño 2026-09-26) La durabilidad como elemento de diseño del catálogo:** hoy es siempre 3 × Peso (mínimo 3), pero se puede **jugar con ella** para diferenciar ítems: **escudos resistentes**, **armas resistentes**, y armas o escudos con **Parry y Bloqueo mejorados** y buena durabilidad, pensados para **optimizar la mecánica del Parry** (más durabilidad o menos desgaste por Bloqueo perdido, etc.). Implica un campo opcional de durabilidad propia (o un bono/multiplicador) en el ítem, su peso en la calculadora de armas/defensa y su lugar en las familias de la guía de diseño. Va después del rework de armas y defensa. Ver `docs/durabilidad.md`.
- [~] (2026-09-26, falta probar) **Mapas y grupos:** el desplegable «Vincular a un creep» agrupa por grupo y muestra el grupo (nombres repetidos), botón «👹 Traer tokens» en cada mapa con grupos vinculados (y pregunta al vincular un grupo), y el auto-vínculo por nombre del duelo no cruza grupos. **Ficha del creep desde el mapa:** el 📜 del token de creep abre la ventana «Ver» de GM Tools encima del mapa.
- [~] (2026-09-26, falta probar) **Ficha liviana de los jugadores en el mapa** (P-Ficha-mapa): el 📜 del token propio, o la tecla **F**, abre un menú con Nivel, Defensa, DDE y Despojos (cada uno con su descripción al pasar el mouse) y botones para Botonera, Equipo y mochila, Habilidades, Estados, Tienda, Botín y «Ver ficha completa» (otra pestaña); cada uno abre su ventana y al cerrarla se vuelve al menú. **Terreno y Formas pasó de la tecla F a la G.** La ficha del creep (📜 o F del GM) trae el botón **✎ Editar** para modificar los stats a mano.
- [~] (2026-09-26, falta probar) **Muerte en el mapa para los jugadores**: cuando el personaje queda inconsciente el mapa se tiñe de rojo suave (sin bloquear los clics), muestra los turnos que le quedan y el botón **✚ Revivir** (abre el diálogo de la ficha). Lo publica la ficha en su resumen (`muerto`): hay que abrir cada ficha una vez con la versión nueva.
- [~] (2026-09-26) **Título del crítico por nivel:** antes de tirar, el título depende de **cuántos d20 se tiran** (el nivel del crítico): «¡ES CRÍTICO!» (1), «¡ES DOBLE CRÍTICO!» (2), «¡ES TRIPLE CRÍTICO!» (3), «¡ES CUÁDRUPLE CRÍTICO!» (4). Después de tirar, el mejor d20 da el **multiplicador del daño**: «×2 · DOBLE DAÑO», «×3 · TRIPLE DAÑO»…
- [~] (2026-09-26, falta probar) **Fin del duelo:** al resolverse la última reacción aparece el cartel «🏁 FIN DEL DUELO» con el botón «Terminar duelo».

- [ ] **Skills de clase auditadas y el duelo** (2026-09-27, pedido del dueño): repaso hecho en [`skills-clase-y-duelo.md`](skills-clase-y-duelo.md) (17 auditadas: 7 ya automáticas, 5 se resuelven con «ataque con habilidad» en el duelo, 3 son de área). Falta: que el dueño elija el orden y responda las 4 preguntas del §5; después implementar (Espinas devueltas, ataque con habilidad, reacciones Flash, áreas) y seguir auditando las 45 restantes.

- [ ] **Duelo para habilidades dirigidas** (hechizos, controles, apoyos; pedido del dueño 2026-09-27, más importante que automatizar cada skill): propuesta y 8 preguntas en [`duelo-de-habilidades.md`](duelo-de-habilidades.md). Reemplaza al viejo «duelo de hechizos». Primera versión hecha el 2026-09-27 (hechizos con tirada, contienda de atributos y sin oposición; ver §7): falta pegar las reglas, probar en mesa y las áreas.

- [ ] **🔔 versión nueva por habilidad dentro de un creep** (2026-09-29, paso 3 de `docs/plan-subida-unificada.md`): hoy
  el aviso de versión nueva es por creep entero; las habilidades de un creep ya guardan `bibOrigen`, falta mostrar el 🔔
  en su fila y el cartel de Actualizar (mismo patrón que `abrirVersionNuevaHab` de la ficha).
- [ ] **🔔 versión nueva en ítems ya comprados** (2026-09-29, paso 5 de `docs/plan-subida-unificada.md`): una corrección de
  un ítem del catálogo cambia el catálogo, pero no las copias que ya están en una mochila. Falta guardar de dónde salió
  cada ítem al comprarlo (`bibOrigen`) y mostrar el aviso (cartel `Biblioteca.avisoVersion`).
- [ ] **Plan de consolidación** (2026-09-30, propuesta del asistente a pedido del dueño): un solo motor de reglas (personaje, invocación y creep) y la ficha, GM Tools y el mapa como ventanas; pasos 0 a 6 en `docs/plan-consolidacion.md`. **En curso** (2026-09-30): paso 0 hecho (`comun/pruebas.html`, `docs/pruebas-de-humo.md`); sigue el paso 1.
