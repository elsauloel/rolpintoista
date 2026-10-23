# Plan: armas, escudos y talismanes como ítems para todos (personajes, creeps e invocaciones)

> Pedido del dueño (2026-10-22): «vamos a encarar la tarea ardua de unificar el tema de las armas: que tanto para personajes como para creeps e
> invocaciones (con manos), las armas sean un ítem que se agarra, se suelta, la agarra otro… al igual que escudos y talismanes». Antes (mismo día):
> «todo lo que tenga manos debería poder usar lo mismo… con una especie de inventario: si levanta un arma, guarda la suya y después las cambia».
> Cierra P217 y la tarea «🗡 Armas e inventario para creeps e invocaciones» de `pendientes.md`. **Decisiones aprobadas el 2026-10-22; pasos 1 a 3 hechos, el 4 en curso (parte A hecha).**

## Cómo está hoy (relevamiento del 2026-10-22)

- **Personaje:** cada arma, escudo y talismán es un ítem de `S.inventario` con `equipado`; las manos las reparte `FichaCombate.asignarManos`.
  Se suelta (sale de la mochila) y se levanta (entra) de verdad.
- **Creep:** **una sola arma, en datos sueltos** del creep (`armaNombre`, `armaTipo`, `armaPeso`, `armaFijo`, `armaMods`, `armaEfectos`,
  `armaRasgos`, `armaNatural`…), y una lista aparte `equipo` con escudos, talismanes y el resto. Una segunda arma de los creeps base va al
  `equipo` solo con sus bonos: no puede atacar. La Defensa y la Res. a crítico del equipo se **suman una vez al equiparlo** (no se recalculan).
- **Invocación:** el mismo modelo que el creep, adentro de la ficha de su dueño.
- **Consecuencias:** al desarmar a un creep, su arma «se cae» pero la sigue teniendo (el Desarmado es solo una marca); si otro la levantara, habría
  dos. Por eso hoy un arma caída la levanta solo su dueño (regla provisoria, `puedeLevantarla` en `vtt-hexgrid/js/27`). Lo que levanta un creep
  de otro va a su `equipo` sin poder usarse para pegar. El botín pierde las mecánicas de varitas, talismanes y rasgos (`plantillaDeCatalogo`).
- **Tamaño:** ~45 archivos y ~250 lugares leen el arma suelta de un creep o una invocación (el duelo, las Acciones, las lupas, los costos,
  el botín, GM Tools, los creeps base, los simuladores y ~100 pruebas). La mayoría ya pasa por `Combatiente.armaDeCombatiente`, que arma «un ítem»
  a partir de los datos sueltos: es la pieza por donde conviene empezar.

## Hacia dónde

**Una sola forma para todos:** el creep y la invocación tienen una lista de ítems con la misma forma que la mochila de un personaje (`tipoItem`,
`tipoDado`, `mods` con la Defensa adentro, `efectosGolpe`, rasgos, `natural`, `equipado`). Lo que tiene en las manos es lo equipado de esa lista,
con las mismas reglas de manos que un personaje. Los datos sueltos (`armaNombre`…) dejan de ser la fuente: si algo los necesita (la tarjeta
pública del creep, que leen los jugadores), se calculan a partir del ítem en la mano.

## Los pasos (cada uno se programa, pasa las pruebas, se sube y se prueba en el mapa; las partidas siguen andando entre paso y paso)

1. **Una puerta única para «el arma en la mano»** (sin cambiar datos): `Combatiente.manosDe(x)` / `armaEnMano(x)` devuelve los ítems en las manos
   de cualquiera (personaje, creep o invocación). Todos los lugares que leen `armaNombre`, `armaTipo`, `armaPeso`… pasan a preguntarle a esa puerta.
   Por dentro, para el creep sigue leyendo los datos sueltos. Es el paso más largo y no cambia nada a la vista.
   **Hecho (2026-10-22):** `Combatiente.armaEnMano(x)` (comun/combatiente.js; `armaDeCombatiente` es el mismo) devuelve el arma en la forma de un
   ítem de personaje (nombre, tipoItem, tipoDado, peso, danoFijo, danoAmplificado, armaDeRango, mods, efectosGolpe, natural, detalle, rasgos,
   `equipado`). Todas las lecturas pasaron por ahí: CreepCalculo, InvCalculo, CreepDuelo, InvDuelo, CreepAcciones, InvAcciones, InvHabilidades,
   CreepLupa, InvLupa, FichaLite, FichaResumen, CombateFin, el mapa (js/02, 10, 11, 12, 13, 17, 27, 51, 56, 58, 59, 62), GM Tools (js/01, 02, 03,
   05, 06), la invocación en la ficha (js/04) y el simulador de encuentros (que leía `armaEfectosGolpe`, un campo que no existe: sus efectos no
   entraban nunca). Quedan con los campos sueltos, a propósito, **las escrituras** (los editores que cambian el arma: `ponerArmaEnCreep`,
   `equiparItemEnCreep`, `ponerArmaEnInv`, el formulario del creep, `creeps-base.js`, el simulador al equipar) y las **migraciones**
   (`CreepCalculo.normalizar`, `InvCalculo.migrar`, `FichaGuardado`): son el paso 2. Prueba nueva en `comun/pruebas.html` (559 en verde).
   Pendiente para la limpieza: el «ataque con su arma» (`{tipo, armaId: '', armaNombre, tipoDado, rango, alcance, ...ataqueDeArma}`) se arma igual
   en seis lugares (js/12, js/17 ×2, js/58, InvAcciones, GM Tools js/06): juntarlo en una sola pieza.
   **Probado en el mapa (2026-10-22, «Claude · pruebas»):** Goblin 1 (Lanza corta) contra Goblin 4: las Acciones muestran lo de siempre (daño
   1d4 + 2, atacar 4 No2), el crítico usa el Tipo 4 de la lanza, «Tirar el daño · Lanza corta · 1d4 + 2» → 3, «💔 Aplicar el daño» → vida 5 → 2;
   y ahora el duelo muestra el recuadro del arma del creep (antes solo el de los personajes). Todo restaurado.
2. **Migración automática de los datos:** al cargar un creep o una invocación (`CreepCalculo.normalizar`, `InvCalculo.migrar`), el arma suelta pasa
   a ser un ítem equipado de su lista; los escudos y talismanes del `equipo` pasan a la forma del personaje (la Defensa adentro de `mods`). La puerta
   del paso 1 pasa a leer la lista. Los creeps base, las armas naturales, el esquema de la IA y GM Tools crean directo en la forma nueva.
   **Hecho (2026-10-22):** el arma vive en `equipo` (la misma lista de escudos, talismanes y armadura): es el primer ítem equipado que sea un arma
   de verdad (`Combatiente.esArmaDeMano`: arma_*, con su Tipo o natural; no una varita ni la «segunda arma» de los creeps base, que solo trae
   bonos). `Combatiente.pasarArmaAItem(x)` convierte los campos sueltos al cargar (`CreepCalculo.normalizar`, `InvCalculo.migrar`) y, si algo
   todavía escribe uno (una pantalla vieja, un formulario que cambia un dato), **se combina** con el ítem que ya tiene (pisa solo ese dato). Piezas
   nuevas: `armaPrincipal` (el ítem guardado, para cambiarlo), `equipoSinArma` (lo que se muestra como equipo y lo que se suelta como equipo:
   así el arma no sale dos veces), `ponerArma(x, item)` (reemplaza el arma en su lugar) e `itemDeCamposArma`. Escriben así: GM Tools
   (`ponerArmaEnCreep`, «Equipar» del catálogo, la marca de arma natural, el catálogo 🐾), la invocación (`ponerArmaEnInv`, la casilla natural,
   la invocación nueva ya sin campos sueltos) y el simulador. Los creeps base y la IA todavía arman los campos sueltos: los convierte la carga
   (limpieza: paso 8). Los bonos del arma cuentan una sola vez (`fuentesEquipo`, `invFuentesEquipo`). El Mordisco feroz ya no reescribe el arma al
   vuelo (`CreepCalculo.danoTxt(sc, extra, dadosMas)`). **Ojo:** una pestaña con la versión anterior ve a un creep ya convertido como «sin arma»:
   recargar todas. Pruebas: 561 en verde.
   **Un error encontrado probando y arreglado (2026-10-22):** GM Tools arma cada creep que lee de Firebase encima de un «creep nuevo»
   (`creepBaseGuardado`/`nuevoCreep`), que traía los campos sueltos por defecto («sin nombre, Tipo 8»): al combinar, le pisaban el arma (le pasó
   al Goblin de prueba 1; reparado). El creep nuevo ya no los trae, y unos campos sueltos «sin nombre» encima de un arma con nombre se ignoran
   (son valores por defecto de una carga vieja). Revisado: «El origen» intacto (39 creeps y 2 invocaciones sin convertir todavía).
   **Probado (2026-10-22, «Claude · pruebas»):** el Goblin 1 convertido (sin campos sueltos, la lanza en su equipo, 1d4 + 2, alcance 2, Bloqueo
   1d2, estable); GM Tools carga los 17 creeps con su arma (no guarda al abrir: se convierten al editarlos); «Equipar» un arma del catálogo
   desde GM Tools la pone en la mano y la guarda como ítem (la tarjeta pública se actualiza); en el «Ver» del creep la lanza aparece en Manos y
   no repetida en el equipo; el botín la suelta una sola vez; de vuelta el Hacha, igual que antes. La invocación «Lobo de prueba» (Clementino)
   convertida y guardada: el mismo Arco corto, 1d4 + 1.
3. **Defensa y Res. a crítico calculadas en vivo** desde lo equipado (como el personaje), en vez de sumarse una vez al equipar. Sin esto, soltar o
   levantar un escudo deja la Defensa mal.
   **Hecho (2026-10-22):** `defensa` y `crit` de un creep o una invocación pasan a ser **la base** (lo que se carga a mano) y
   `CreepCalculo.defensaEfectiva` / `critEfectivo` (e `InvCalculo`) le suman en vivo lo equipado (`Combatiente.defDeEquipo`: el `def` de cada pieza
   o un mod `def`; `critDeEquipo`: los mods `tipo1`…`tipo5`; solo lo que tiene `equipado !== false`). `Combatiente.pasarEquipoVivo` convierte una
   vez (marca `equipoVivo`): le resta a lo guardado lo mismo que después suma en vivo, así el total no cambia (la base no baja de 0: un equipo
   que nunca se había sumado empieza a contar; en «El origen» no hay ninguno así, revisado). Ya no «hornean» al equipar o sacar: GM Tools
   (`aplicarModsEquipo` solo conserva el viejo «mov»), `ponerEquipoEnCreep`, la invocación (`ponerEquipoEnInv`, `quitarEquipoDeInv`) y el
   simulador. **Arreglo de paso:** a las invocaciones el equipo nunca les sumaba Res. a crítico; ahora sí (a ellas no se les resta al convertir).
   «Actualizar desde la biblioteca» con una versión vieja borra la marca para que se convierta de nuevo (si no, contaría el equipo dos veces).
   GM Tools muestra «Defensa base» con el efectivo al lado, y la Res. a crítico aparece si la base o el total no son 0. Pruebas: 562 en verde.
   **Probado (2026-10-22, «Claude · pruebas», 17 creeps antes y después):** 14 iguales; 3 cambiaron (los dos Escarabajos de cobre: Defensa 4 → 6 y
   Res. Tipo 8 0 → 1; la Bruja del pantano: Defensa 4 → 7) porque su equipo (puesto por un script de auditoría) nunca se les había sumado: ahora
   cuenta, como estaba previsto. «El origen»: revisados los 39 creeps, ninguno así (los totales no cambian).
4. **Soltar y levantar de verdad:** desarmar (o soltar) saca el ítem de la mano y lo pone en el piso; levantarlo lo mete en la lista de quien lo
   levanta (con la mano libre: «¿Equiparlo?»; con las manos ocupadas: «Reemplazar» o «Guardar», igual que el personaje — el GM elige por el creep).
   Se saca la regla provisoria «solo su dueño». Un creep con su arma guardada y otra en la mano puede cambiarlas (un botón en sus Acciones).
   **Hecho, parte A (2026-10-22):** desarmar o soltar saca la pieza de verdad del equipo del creep o de la invocación (el arma, o el escudo con
   que paró: `armaSoltar`, js/27) y la deja en el piso en la forma de un ítem de personaje (`Combatiente.itemComoDePersonaje`: la Defensa adentro
   de los mods). Cualquiera la levanta (se sacó `puedeLevantarla`, «solo su dueño»). Un creep (el GM) o una invocación eligen dónde va
   (`levantadoElegirCombatiente`): con la mano libre, «en la mano» o «guardarlo»; con las manos ocupadas, «Reemplazar …» (eso pasa a guardado, 1
   No2 más) o «guardarlo». Lo guardado (`equipado: false`) no da bonos, no para, no cuenta como talismán ni como varita (`Combatiente.equipoPuesto`,
   en los bonos, el Parry, los talismanes, las varitas, los orbes, el escudo, la Piedra bezoar), y se suelta igual al morir. Nuevas:
   `equipoPuesto`, `puestoSinArma`, `equipoGuardado`, `vaEnLaMano`, `manosLibres`, `itemComoDePersonaje`. Falta: el botón para cambiar lo
   guardado por lo de la mano (paso 7, en los editores). Pruebas: 563 en verde.
   **Hecho, parte B (2026-10-22): las armas invocadas (D7).** Lo que una invocación trae puesto es suyo (`invocada: true`, lo marca
   `InvCalculo.migrar`; lo que levantó del piso, `invocada: false`). Si se le cae (`armaSoltar`), la pieza recuerda de qué invocación es
   (`invocadaDe` = "fichaId~invId", `invocadaNombre`) y la puede levantar y usar cualquiera; si la levanta su propia invocación, vuelve a ser suya.
   `vtt-hexgrid/js/67-armas-invocadas.js` revisa cada 3 s: si su invocación ya no está en el mapa, se durmió o terminó el combate (modo
   narrativo) — con 5 s de margen, para que cargar el mapa no la borre —, se desvanece de donde esté: del piso y de un creep (el GM) o de un
   personaje y sus invocaciones (quien lo maneja, con su Botonera abierta). Lo anuncia en la Mesa («✨ … se desvanece»). Nunca va al botín
   (`CombateFin.itemsDeCreep`). Probado en «Claude · pruebas»: la Daga del Lobo (vivo) quedó en el piso; la de una invocación ausente se
   desvaneció del piso y de las manos del Goblin 2; al pasar a narrativo, se desvaneció la del Lobo. Pruebas: 564 en verde.
   **Corrección del dueño (2026-10-22):** «las invocaciones al morir desaparecen, no se duermen. Y si son invocaciones por X cantidad de turnos
   también, al terminarse los turnos desaparecen, junto con sus armas invocadas». El mapa (js/54) borra el token de cualquier invocación que pasa
   de invocada y viva a muerta (vida 0) o dormida (se terminaron sus turnos); antes solo lo hacía con las temporales (el Ojo). Un token puesto de
   antemano, con la invocación sin invocar, no se toca. Una sola pantalla lo anuncia en la Mesa («💀 … desaparece: murió» / «✨ … desaparece: se
   terminaron sus turnos»). Sus armas invocadas se desvanecen con ella (js/67 ya no cuenta como viva a una invocación muerta).
   **Recordatorio del dueño:** las bestias no llevan armas; a lo sumo, armas naturales (D5). El Lobo de prueba con un arco y una daga es solo
   para probar.
5. **Desarmado deja de ser un estado** (P217): «sin arma en la mano» se ve en el token y en la ficha y se ataca sin arma (el daño sin arma de P150,
   igual para creeps). Lo natural (garras, colmillos) sigue sin caerse ni poder levantarlo otro.
   **Hecho (2026-10-22):** `Combatiente.armaEnMano` sin nada en la mano da el ataque sin arma (`sinArma: true`, Tipo 4, sin nombre: 1d4 + Daño,
   como el personaje; `Combatiente.TIPO_SIN_ARMA`, `sinArmaEnMano`). Desarmado ya no se guarda en ningún camino (`agregarEstado`: se mira la
   inmunidad y no se agrega; lo que hace es que el arma caiga, js/27): el desarme del duelo (js/62), la varita del manotazo (js/13) y el caos (js/13:
   si no tiene un arma que se le caiga, sale otro debuff). Los Desarmado viejos se borran al cargar un creep o una invocación. En combate, el token
   sin nada en la mano lleva una ✋ (lo publicado: `sinArma` del creep, de la invocación y del personaje; `tokenSinArma`, js/27); la ficha lite dice
   «sin arma · 1d4 + N», las Acciones «Daño (sin arma)», la 🔍 y GM Tools «Sin arma». Ningún creep de fábrica queda sin arma. Probado en «Claude ·
   pruebas»: al Goblin 4 se le cayó el Hacha, quedó sin estado, con la ✋ y «Daño (sin arma) 1d4 + 1»; la levantó desde sus Acciones y volvió a
   tenerla en la mano (la ✋ se fue). Pruebas: 565 en verde. Queda para la limpieza (paso 8): los botones viejos de «Levantar el arma» por el estado.
6. **El botín usa los ítems tal cual:** lo que el creep tenía (en la mano y guardado, menos lo natural) cae con todas sus mecánicas (varitas,
   talismanes, rasgos).
   **Hecho (2026-10-22):** `CombateFin.plantillaPieza` arma cada ítem del botín entero: si está en el catálogo de fábrica, el ítem completo de ahí
   (el catálogo que reciben el mapa y GM Tools viene en la forma de un creep, recortado: por eso se busca en `CATALOGO_BASE`); si no, la pieza
   misma del creep en la forma de un ítem de personaje (la Defensa adentro de los mods), con su precio o uno estimado. Se sacan solo las marcas de
   creep (`id`, `equipado`, `invocada*`…). Los drops fijos también salen enteros. Probado con los creeps reales de «Claude · pruebas» (sin publicar
   el botín): la Varita arcana del Goblin 3 y la Varita de chispa eléctrica de la Bruja caen con su poder igual al del catálogo (antes llegaban a la
   mochila sin él); lo guardado de la Bruja (arco, escudos) también aparece. Pruebas: 566 en verde. Lo subido por el grupo que no está
   en la fábrica sale en la forma de creep (con su magia y sus rasgos, que `itemParaCreep` ya conserva).
7. **Editores:** GM Tools (equipar/desequipar del creep), la ventana de la invocación en la ficha y el editor común muestran «En las manos» y
   «Guardado», con las mismas piezas del personaje.
8. **Limpieza:** se borran los datos sueltos y los caminos viejos (incluidas las pruebas que los usan), cuando todo lo anterior ande en una sesión real.

## Decisiones del dueño ✅ (2026-10-22: «dale con las recomendaciones, me parece bien»)

- **D8 ✅ Armas y armaduras naturales = piezas del catálogo marcadas como naturales** (dueño, 2026-10-22: «no diseñar todo un catálogo de armas y
  armaduras naturales, sino a una bestia a la hora de diseñarla le cargás las armas que quieras, de acuerdo al efecto que quieras del catálogo, la
  marcás como natural… le cambiás el nombre, garra de la pignonga, y al morir no deja un arma del catálogo sino la garra… un trofeo»). En el modelo
  nuevo, cualquier ítem de su lista con `natural: true` y su nombre propio: tiene todos los efectos de esa pieza, no se cae ni lo levanta otro, y al
  morir deja el trofeo (`CreepCalculo.trofeo`), no la pieza. El catálogo de armas naturales (`armas-naturales-base.js`) queda como atajo, no como
  requisito; la tarea «revisar las 66 armas naturales» pierde peso.


- **D1 ✅** Desarmado deja de ser un estado: es «no tiene nada en la mano».
- **D2 ✅** Creeps e invocaciones llevan ítems guardados además de lo de la mano; sin límite por ahora (lo maneja el GM).
- **D3 ✅** Cualquiera levanta cualquier arma del piso (se saca «solo su dueño»).
- **D4 ✅** Sin nada en la mano, un creep o una invocación ataca como un personaje sin arma (la regla provisoria de P150).
- **D5 ✅** Las invocaciones entran desde el principio; las que no tienen manos (bestias) quedan solo con lo natural.
- **D6 ✅** Al morir, el creep suelta todo lo que lleva (en la mano y guardado), menos lo natural.
- **D7 ✅ Armas invocadas** (dueño: «la mayoría van a ser bestias, pero puede haber invocaciones con manos, tipo esqueletos, zombies, que pueden
  tener armas, que van a ser armas invocadas… si el creep se desinvoca, el arma desaparece; el arma de una invocación no aparece en el botín y se
  puede seguir usando todo el combate»). El arma de una invocación lleva la marca de qué invocación la trajo: se usa (también si la levanta otro)
  mientras exista su invocación y como mucho hasta el fin del combate; al desinvocarse desaparece de donde esté (en una mano, guardada o en el
  piso); nunca va al botín. Va en el paso 4 (soltar/levantar) y el 6 (botín).

## Las preguntas que hubo antes de programar

- **D1.** ¿Desarmado deja de ser un estado y pasa a ser «no tiene nada en la mano»? (lo que dijo el 22/10; se confirma acá).
- **D2.** ¿Los creeps y las invocaciones llevan ítems guardados (una «mochila» chica) además de lo que tienen en la mano? ¿Con límite?
- **D3.** ¿Cualquiera puede levantar cualquier arma del piso (se saca «solo su dueño»)?
- **D4.** El ataque sin arma de un creep o una invocación: ¿el mismo del personaje (P150)?
- **D5.** ¿Las invocaciones con manos entran también, desde el principio? ¿Y las que no tienen manos (una bestia) quedan solo con lo natural?
- **D6.** Al terminar el combate, ¿el creep suelta todo lo que lleva (en la mano y guardado), menos lo natural?
