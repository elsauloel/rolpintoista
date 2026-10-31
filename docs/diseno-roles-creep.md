# Diseño de habilidades de creep, rol por rol

> Hoja de trabajo (dueño, 2026-10-21). Sigue a la auditoría de [`auditoria-skills-creep.md`](auditoria-skills-creep.md) (lo hecho, con sus
> números) y a la lista [`pruebas-en-el-mapa.md`](pruebas-en-el-mapa.md) («Auditoría de creeps: para probar»).

## Forma de trabajo

- **Se rota rol por rol**: una habilidad de un rol, después una del siguiente, y así. No se va estado por estado.
- **Al entrar a un rol, primero la lista completa de conceptos de ese rol** (dueño, 2026-10-21: «siempre que vayamos a encarar un nuevo rol, primero vemos
  la lista»): familias, ✦ = acelera la pelea, ✅ = ya cubierto. Si la lista no está completa, se completa acá antes. Después se elige la habilidad. Cada
  lista se retoma cada vez que se vuelve al rol.
- **Las skills de clase también entran en la lista** (dueño, 2026-10-26: «incorporá a la lista los skills de clase, para tener en cuenta. Eso en todos
  los tipos y clase»): al final de cada rol está el bloque «Skills de clase, para tener en cuenta» (Warrior y Tanque → Choque pesado, Asalto → Choque
  liviano, Shooter → Rango, Mago → Casters, Support, Debuffer), con el original y si ya tiene versión de creep. Al presentar el rol, se repasan también.
- **La versión creep de una skill de clase, un poco más potente** (dueño, 2026-10-26: «siempre tirala un poquito más agresiva o un poquito más potente,
  porque los creeps tienen menos posibilidad de combear. En general, tienen menos skills»): al proponerla, ya un escalón arriba de la de clase (un +1
  más, un dado más, un turno más, más alcance o más barata), diciendo qué se le subió. Si el dueño pide «lo mismo que la de clase», queda igual.
- Lo que el dueño define («queda así») se programa, pasa las pruebas automáticas, se sube y se anota «para probar»; las pruebas en el mapa se corren
  todas juntas cuando él lo pide.
- Una habilidad puede servir a más de un rol, y puede tener su versión de bestia y de humanoide (o una sola para los dos).
- **Emparejar primero (dueño, 2026-10-23)**: antes de seguir la rotación, se priorizan los roles con **menos conceptos cargados** hasta que todos
  tengan la misma cantidad; recién ahí se vuelve a avanzar uno por uno. Se cuenta por **concepto** (una pareja bestia/humanoide o las variantes de
  un mismo concepto cuentan una vez), sumando las habilidades ya hechas en los creeps de «El origen de las especies» (ver el conteo abajo).

**Los elementos de cada rol, como estilo general** (dueño, 2026-10-26: «que el mago juegue con todos los elementos menos luz y sombra, que el debuffer
juegue con sombra y el support juegue con luz»; el mismo día lo aflojó: «quitamos la regla… que pueda aparecer en casos puntuales, pero que su principal
identidad sean los otros elementos. Inclusive podríamos decir que es tóxico y que tóxico puede también estar más vinculado al debuffer… no lo hacemos tan
estricta, sino es más una cuestión de estilo general»): el **Mago** juega sobre todo con arcano, fuego, hielo, rayo y ácido (luz o siniestro, en casos
puntuales); el **Debuffer**, con lo **🌑 siniestro** y lo **☠ tóxico**; el **Support**, con la **☀ luz**. No es una regla: es hacia dónde tiende cada uno.

**Que cada habilidad se sienta** (criterio del dueño, 2026-10-25, con Extenuar: «vamos a hacer que cada acción tenga peso… nivelar un poquito para
arriba, que todo haga un poquito de más, que hacer una habilidad se sienta»): una habilidad que gasta la acción no puede ser solo un estado chico; si
pega, suma algo de daño (o algo concreto además del estado). Al diseñar, y al repasar las viejas, preferir que hagan un poco de más.

## Conteo por concepto (2026-10-23) — para emparejar

Cuenta los conceptos con alguna habilidad (de fábrica auditada o de los creeps de «El origen de las especies», que desde el 2026-10-23 están entre las
de fábrica como «sin auditar», con su rol y su concepto: `ORIGEN` en `comun/skills-creep-base.js`). **Rango y Hunter se cuentan juntos** (dueño: «se van
a superponer en muchos casos»). Se actualiza al cerrar cada habilidad.

- 🛡 **Choque pesado — 21** (+14 definidas el 2026-10-27, sin programar: 10 warrior · 10 tanque · 10 ambiguas; ver «Tanda Choque pesado»): takle (2026-10-26), más daño, empujar, atrapar, guardia, salto, barrido, desarmar, golpe anunciado, remate, romper armadura, aturdir (Pisotón, 2026-10-26) · de El origen:
  furia, pisotón, provocar, segundo aliento, aguantar el daño, cubrir al de al lado, perforar, carga que derriba.
- 🗡 **Choque liviano — 20**: desaparecer en la pelea (Bomba de humo, 2026-10-26), golpe desesperado (2026-10-26), golpe preciso, sangrado, trabar, golpear y alejarse, salto, abrir la herida, manada, ráfaga, por la espalda · de El origen:
  robar, sigilo, varios golpes, bajo tierra, veneno (de fábrica desde el 2026-10-25: Hoja envenenada / Mordisco infectado), todo al ataque (Degollar, 2026-10-26), finta (2026-10-26), dash (2026-10-26), ojo de asesino (2026-10-26).
- 🏹 **Rango y Hunter — 20**: tiro certero (2026-10-26), abanico (2026-10-26), trabar (Red, Tela de araña, Tiro a la rodilla), vigilancia, tiro apuntado, señalar, mantener a raya (2026-10-25), atravesar (Flecha que atraviesa, 2026-10-25), disparos encadenados (Ráfaga encadenada, 2026-10-25), disparar y replegarse (Disparo y repliegue, 2026-10-26), clavar a la pared (2026-10-26), tiro al arma (2026-10-26), tiro que derriba (2026-10-26) · de El origen: área a distancia,
  atravesar armadura, crítico, flecha con veneno, empujar a distancia, trampas, domador.
- ✨ **Mago — 20**: tormenta arcana (2026-10-26), cascotazo (2026-10-26), daño en área, rayo en cadena, cono de frío (Hálito polar), muro de fuego, descarga cargada (Descarga arcana, 2026-10-24), área anunciada (Meteoro, 2026-10-24), línea que atraviesa (Lanza de luz, 2026-10-25), rayo paralizante (Zap, 2026-10-25), lluvia de escarcha (2026-10-25), andanada arcana (2026-10-25), misiles elementales (2026-10-25), portal trampa (2026-10-25), prisión de hielo (2026-10-26), nova arcana (2026-10-26), ráfaga de viento (2026-10-26), parpadeo (2026-10-26) · de El origen: proyectil, fuego con quemadura.
- 🧿 **Debuffer — 20**: drenar No2 (Robar el aliento, 2026-10-26), atormentar (Maldición tormentosa, 2026-10-26), control mental, maleficio, bajar la armadura (Maldición de la coraza, 2026-10-24), cortar la regeneración (Maldición de la sequía, 2026-10-24), exponer (Aguja del desamparo, 2026-10-24), disipar (Disipar, 2026-10-25), corroer (Corroer, 2026-10-25), silencio (Tótem de silencio, 2026-10-25), extenuar (2026-10-25), cegar (2026-10-25), grito de pánico (2026-10-25), nube tóxica (2026-10-26), debilitar (Maldición debilitante, 2026-10-26), sanguijuela (2026-10-26, del Mago), punto débil (Aguja siniestra, 2026-10-26) · de El origen: ceguera, veneno, inmovilizar.
- 💚 **Support — 20**: envión (2026-10-26), llevar al lado de un rival (¡Al frente!, 2026-10-26), arma elemental, grito de guerra (¡A la carga! y Arenga), curar (Sanar, Oleada sanadora, Bálsamo, Círculo de sanación, Aura sanadora) — de fábrica desde el 2026-10-23, devolver el daño (Coraza de púas y Velo espejado, 2026-10-24), bendecir el arma, ojo certero (2026-10-24), estandarte (Estandarte de guerra, 2026-10-24), señalar la presa (2026-10-25), armas perforantes (2026-10-25), redoble de tambores (2026-10-25), frenesí inducido (2026-10-25), limpiar estados (Purificar, 2026-10-25), levitar (2026-10-25), empower (Empuje, 2026-10-26), luz para los suyos (2026-10-26), smite (2026-10-26), provocar para un aliado (Tirar la bronca, 2026-10-26) · de El origen: escudo a un aliado.
- 👑 Jefe (aparte): refuerzos (Plaga en la galería).
- 🧰 **Misceláneas** (aparte, dueño, 2026-10-27: «yo lo pondría en habilidades misceláneas»): las que no son de un rol — **Excavar** (bajo tierra: meterse y salir apuñalando, una sola habilidad; el Goblin tunelero de El origen).

**Para emparejar** (regla del dueño, 2026-10-25: «empezamos a tener en cuenta todos los roles de creep e ir emparejándolos… para que estén todos
avanzando de a uno parejamente»): siempre se sigue con **el rol que menos tiene** (con empate, rotando entre ellos), de a una habilidad. Hoy (2026-10-26, la meta del dueño cumplida): todos en 20, Choque pesado en 21. **Meta del dueño (2026-10-26): llegar a 20 en cada rol.** El Jefe va aparte.

## Definidas antes de programar (camino a 20 por rol, 2026-10-26) — ✅ programadas el mismo día

> Método del dueño (2026-10-26): «pasamos al siguiente rol, elegimos, definimos, ajustamos detalles, reglas, pero no lo programás… una vez que tengamos
> todo ya definido desde el diseño, yo te digo, bueno, ahora programalos». Cada una queda acá con sus reglas; se programan juntas cuando el dueño lo pida
> (y entonces pasan a la auditoría y a «para probar»). **Todo definido el 2026-10-26; el dueño: «ya puedes pasar a la programación».**

**💚 Support (18 → 20)**
- **Arrojo** (hasta el 2026-10-27 «Envión»; dueño: «no me cierra nada el nombre» → Arrojo) (idea del dueño, 2026-10-26: «un poco como el Shield. Otorga un escudo de 10 de HP que absorbe daño. Del tipo vida extra. Y además, sube en
  uno en la tabla de iniciativas. Y tiene flash»): **Flash** (en turno ajeno, el SP al doble). A él o a un aliado en su Rango: **10 de Vida extra** (no se
  recarga) y **sube 1 lugar** en el orden de turnos. Reglas de la iniciativa: no pasa por encima del que tiene el turno (si ya es el siguiente, o es el del
  turno, no sube); si ya actuó esta ronda, sube igual (le sirve para la próxima); el primero del orden no sube (el escudo vale igual). **La Vida extra
  dura hasta que se gaste** (no vence) y **un segundo Envión la reemplaza**, no se suma (dueño, 2026-10-26: «dura hasta que se gaste. El escudo reemplaza,
  no se suma. Y el nombre envión me gusta»). Costo: 3 SP (6 en turno ajeno), o cooldown 3.
- **¡Al frente!** (de la lista, «llevarlo al lado de un rival» ✦; dueño, 2026-10-26: «la siguiente es esa de llevar al lado de un rival»): a un aliado en
  su Rango (no él): lo teletransporta a una casilla libre **pegada a un rival**, a 4 o menos de donde estaba (el GM marca al aliado y la casilla; solo
  sirven las libres pegadas a un rival); no camina (sin oportunidad, sin pisar trampas ni zonas en el camino, sin No2), lo de la casilla de llegada sí lo
  toca; los pulsos del teleport. **Siempre al lado de un rival, a 4 o menos** (dueño, 2026-10-26: «4 está bien. No, que sea siempre al lado de un rival y
  que dé más 2 a la probabilidad de golpe y más 2 a la evasión hasta el final de su próximo turno»): al llegar, **+2 PdG y +2 Evasión hasta el final de su
  próximo turno**. 2 No2 y 3 SP, o cooldown 3; no es Flash.

**🗡 Choque liviano (18 → 20)**
- **Bomba de humo** (de la lista, «desaparecer en la pelea»; dueño, 2026-10-26: «me gusta mucho al punto de que la pondría en la clase también. Que se mueva
  hasta 3 casillas gratis y que cueste 4 nitros»): revienta una bomba a sus pies: una **nube de humo de diámetro 3** (7 casillas) por **1 turno** que tapa
  la vista (nadie ve adentro ni a través); **entra en Sigilo aunque lo estén mirando**; y se mueve **hasta 3 casillas gratis**, sin ataques de oportunidad.
  **3 No2 y 3 SP** (dueño, 2026-10-26, corrigiendo los 4 No2: «el costo de la bomba de humo… 3 SP y 3 nitros»). El combo: en el próximo turno, la
  Puñalada por la espalda. Cooldown 3.
  **También para la clase (Asalto)**: igual, pero **2 casillas gratis** en vez de 3 (dueño, 2026-10-26: «la versión de clase está bien, que sean dos
  casillas gratis en vez de tres»).
- **Golpe desesperado** ✦ (de la lista, «apuestas»; dueño, 2026-10-26: «la siguiente que sea golpe desesperado»; y después: «con más de la mitad de la
  vida, más uno y más uno. Con la mitad de la vida o menos, más dos y más tres… Con un cuarto de la vida o menos, el dos más de probabilidad de golpe… y que
  cueste 3 SP»): un ataque con su arma que crece cuanto menos vida tiene, escalonado (como el Remate): **con más de la mitad, +1 a los dos críticos y +1 al
  daño**; **con la mitad o menos, +2 Crítico frecuente, +2 Crítico potente y +3 al daño**; **con un cuarto o menos, además +2 PdG**. **Lo de un ataque y
  3 SP** (confirmado: el «más uno y más uno» es +1 a los dos críticos y +1 al daño). Cooldown 2.

**🛡 Choque pesado (19 → 21)** (dueño, 2026-10-26: «me gusta el tacle. y la furia»: las dos)
- **Takle** (la del Tanque en versión creep, un escalón arriba). Original: «Takle [3] — Flash (SP x 2). Se desplaza hasta 2 casillas. Ataque con +1 a PG. Si
  gana una tirada de Constitución, el objetivo pierde 2 Nitros, lo empuja 2 casillas, interrumpe su turno y lo manda al final de la tabla de iniciativa. Si ya
  era último en iniciativa, en vez de eso pierde el turno.» Versión creep (dueño, 2026-10-26: «el tackle por definición no usa el arma… el desplazamiento sin
  coste de nitros y un efecto bastante similar. El costo… 2 nitros y 3 SP»): **Flash** (en turno ajeno, el SP al doble); se desplaza hasta 2 casillas
  **gratis** (sin No2 ni ataques de oportunidad) hasta quedar pegado al objetivo y lo embiste: **su Constitución +2 contra la Constitución** del objetivo
  (sin arma); si gana, el objetivo **pierde 3 No2**, sale **empujado 2 casillas**, se le **corta el turno** y pasa **al final del orden**; si ya era el
  último, pierde el turno. **2 No2 y 3 SP**, o cooldown 3.
- **Furia** ✦ (dueño: «que por esa penalidad sea más 3 a la probabilidad de golpe y más 4 al daño durante 2 turnos. 2 turnos completos adicionales al turno
  en el que se lo castea»): sobre sí mismo, **+3 PdG y +4 al daño, −2 Evasión y −2 Defensa**, durante **el turno en que la usa y 2 turnos completos más**
  (la marca `turnosCompletos` del Ojo certero). **2 No2 y 2 SP**, o cooldown 3; no es Flash.

## Para ampliar el pool más adelante (ideas guardadas, 2026-10-26)

> Dueño (2026-10-26): «las ideas que quedaron pendientes… déjalas guardadas en algún lado, porque si en algún momento quiero expandir el pool de habilidades
> de creep, hay algunas ideas que me parecían muy buenas». Además de esto, **cada rol tiene su lista completa de conceptos más abajo**: lo que no tiene ✅
> sigue disponible (y las «Skills de clase, para tener en cuenta» sin versión de creep). Desde el 2026-10-26 las habilidades de fábrica sin auditar están
> **archivadas** (no salen en el catálogo; se ven en la pestaña «📦 Archivadas» de la biblioteca), así que lo nuevo se diseña desde acá.

Las propuestas concretas que se ofrecieron en el camino a 20 y no se eligieron (con sus números, para retomarlas tal cual o ajustarlas):

**🏹 Rango y Hunter**
- **Flecha incendiaria**: un disparo con su arma; si pega, Quemadura.
- **A quemarropa** ✦: pegado a un rival, dispara sin la penalidad del arco (la distancia mínima) y con +3 al daño.
- **Enfocado** (de clase, versión creep un escalón arriba): +3 al daño de su próximo ataque (la de clase, +2).
- **Ráfaga a tres**: tres disparos, cada uno a un objetivo distinto. **Lluvia de flechas** (⏸ guardada): diámetro 3 en su Rango, su PdG una vez contra la
  Evasión de cada uno (dodge roll), el daño de su arma +2; un ataque y 3 SP, o cooldown 3.

**✨ Mago**
- **Diluvio**: un aguacero de diámetro 5 en su Rango; PdG.Esp contra la Evasión (dodge roll), 2d4 físico; deja **charco** en todas esas casillas (no vence:
  el rayo ×1,5 y la Parálisis al doble) — el combo con la Cadena de rayos y el Zap. 3 No2 y 4 SP, o cooldown 3.
- **Lazo arcano**: lo atrae 3 casillas hacia el mago salvo que gane con Fuerza, y 1d6 arcano.
- **Magia inestable** ✦: 3d6 arcano; si en los dados sale un 1, el mago se hace 1d6 (el riesgo de la Varita inestable).
- **Armadura arcana** (de clase): absorbe la mitad del daño que recibe y, al terminar, explota en un área con lo absorbido.

**🧿 Debuffer**
- **Drenar vida** (de clase): su Ef.Esp + 1d6 contra la Res.Esp; le saca la diferencia y se la cura (lo que pase de su máximo, Vida extra hasta un 50 %).
- **Retrasar**: PdG.Esp contra Res.Esp, 1d6 siniestro y Demora 2 (la Demora de varios lugares ya existe: el Cascotazo).
- **Veneno** (de clase, un escalón arriba): PdG.Esp contra Res.Esp; 1d4 tóxico directo y Veneno 4 (la de clase, 3).
- **Quebrar la guardia** ✦: sin Parry ni Bloqueo hasta su próximo turno (necesita un estado nuevo).

**💚 Support**
- **Shield** (de clase, versión creep): Flash; un escudo de 16 a él o a un aliado en su Rango, hasta el final del turno. 2 SP (4 en turno ajeno), o cooldown 2.
- **Orden de ataque** ✦: un aliado en su Rango ataca ya, fuera de su turno, sin No2 y con +1 PdG; no le cuenta como el ataque de su turno. 2 No2 y 3 SP,
  o cooldown 3.
- **Endurecimiento** (de clase): a un aliado, +3 Defensa, +3 Defensa especial y +1 a sus resistencias a crítico, 2 turnos.
- **Sed de sangre** ✦: 2 turnos; un aliado que deja a un rival en 0 vuelve a atacar gratis una vez.

**🗡 Choque liviano**
- **Danza de cuchillas** ✦: avanza hasta 4 en línea recta (como el Dash) y le pega a hasta 2 rivales en el camino (un duelo por cada uno); si uno lo para
  con Parry, se queda. Un ataque y 3 SP, o cooldown 3.
- **Tronco de huída** (de clase, versión creep): Flash, +3 a una Evasión y, si la gana, se mueve 2 casillas gratis.
- **Zancadilla**: un ataque con su arma; si pega, Sentado.

**🛡 Choque pesado**
- **Golpe brutal** (Warrior, versión creep): un ataque con su arma con Crítico potente +2 y +2 al daño; queda Guardia baja (−2 Evasión) hasta su próximo
  turno. Un ataque y 2 SP, o cooldown 2.
- **Hendidura**: un ataque con su arma que, pegue o no, sigue al que está justo detrás del objetivo, contra la misma tirada.
- **Golpe que sigue** ✦, **Lanzar**, **Muralla**, **Interponerse**, **Segundo aliento**, **Estoicismo** (de clase: «Estoicismo [2] — NO2: (0). Flash. +2
  Def por cada enemigo adyacente. +1 Res.Crit.»).

## Los roles

1. **Choque pesado**: tanque y warrior (muchas habilidades les sirven a uno, al otro o a los dos).
2. **Choque liviano**: salto, ladrón, armas punzantes, venenos, estados.
3. **Rango**: daño concentrado, crítico y las mecánicas del rango. Con su variante **Hunter**: pasa del rango al toque, juega con trampas y, quizás,
   alguna invocación (para un creep tiene que justificarse mucho, para no alargar los combates).
4. **Casters**: **debuffer**, **support** y **mago** (el del daño más directo).

## Más adelante: el Jefe

Transversal (fases, refuerzos, la furia del jefe): se evalúa cuando haya unos básicos de cada rol (dueño, 2026-10-21).

## 1. Choque pesado — las ideas del rol

**Son conceptos de diseño** (dueño, 2026-10-21): cada vez que toque una habilidad de choque pesado se explora uno y se marca ✅. ✦ = acelera la pelea.
Sirven al warrior (pegar fuerte), al tanque (aguantar y controlar) o a los dos.

**A. Pegar fuerte** (warrior)
1. ✅ **Más daño en un golpe**: Golpe fuerte (+1 dado), Puño de roca (+2 y Demora), Zarpazo.
2. ✅ **Golpe que se anuncia** ✦ (2026-10-21): **El que avisa no traiciona** / **Zarpazo erguido** — un turno lo carga a la vista de todos (a quién apunta),
   al siguiente +3 dados, sin Parry y empuja 2; si el objetivo pegado se aleja, sale de oportunidad; si le hacen daño, se le cae.
3. ✅ **Remate** ✦ (2026-10-23): **Remate** / **Ir por el herido** — un ataque con su arma: +2 dados si el objetivo tiene la mitad de la vida o menos,
   +3 con un cuarto o menos (escalonado, dueño). Golpe de gracia queda aparte (es del concepto 1, a revisar).
4. **Varios golpes**: dos ataques en uno, con menos puntería cada uno (Golpe doble, Ráfaga de golpes).
5. **Golpe que sigue** ✦: si tumba a alguien, vuelve a atacar a otro de al lado.
6. ✅ **Partir la armadura**: **Romper armadura** / **Arrancar la coraza** y **Golpe demoledor** / **Mandíbula trituradora** (2026-10-21). Queda: perforar.
7. ✅ **Furia** ✦ (2026-10-26: Enfurecido, +3 PdG y +4 al daño, −2 Evasión y −2 Defensa): pega más fuerte a cambio de defenderse peor (Furia, Frenesí, Ataque de furia).
8. **Frenesí que crece** ✦: cada golpe que da en el combate le suma daño al siguiente.

**B. Pegarle a varios**
9. ✅ **Barrido**: Barrido y Coletazo (todos los de al lado).
10. **Torbellino de acero**: el barrido fuerte, moviéndose antes (como el Remolino).
11. **Hendidura**: un golpe en línea que alcanza también al de atrás.
12. **Pisotón**: una onda alrededor que tira Sentado, sin saltar.

**C. Llegar a la pelea**
13. ✅ **Empujar y tomar carrera**: Cornada.
14. ✅ **Caer desde arriba**: Salto aplastante.
15. **Carga que derriba**: llega corriendo y lo tira Sentado.
16. **Arrastrar**: lo trae hacia él (una cadena, un gancho, la lengua).
17. **Lanzar**: agarra a un rival y lo tira dos casilleros (con daño de colisión, también contra otro).

**D. Controlar el frente** (tanque)
18. **Provocar**: obliga a los jugadores a ocuparse de él (¡Tu vieeeja! ya existe en el Bosque).
19. **Zona de control**: alejarse de su lado cuesta más No2, o le da una oportunidad de más.
20. **Muralla**: nadie pasa por las casillas de al lado sin frenarse.
21. ✅ **Atrapar**: Mordisco feroz, Agarrón, Abrazo aplastante.
22. **Derribar**: un golpe que deja Sentado.
23. ✅ **Aturdir** — **Pisotón** (2026-10-26, el Shockwave del Tanque un escalón arriba: Flash, una onda de Fuerza contra la Res.CC o la Evasión —con dodge roll— de cada rival pegado; la diferencia de daño físico directo y Pajaritos 2 turnos).

**E. Aguantar**
24. ✅ **Guardia**: Aguante (+2 Defensa y Def.Esp, y devuelve los golpes).
25. **Segundo aliento**: se cura una vez por combate (Segundo aliento, Regeneración rápida).
26. **Piel de piedra**: resistencia a crítico o a un elemento por unos turnos.
27. **Inamovible**: no lo empujan ni lo derriban por unos turnos.
28. **Última resistencia**: al caer, aguanta un turno más en pie (Segunda fase).

**F. Proteger**
29. **Proteger a un aliado**: recibe el golpe por otro creep.
30. **Cubrir al de atrás**: los aliados detrás de él ganan Defensa.
31. **Interponerse**: se mueve gratis para tapar a un aliado al que van a atacar.

**G. Castigar a quien le pega**
32. ✅ en parte: **Aguante** (los golpes que recibe vuelven como dados).
33. **Espinas o contraataque**: le devuelve parte del golpe, o pega de vuelta.
34. **Represalia**: si le pegan a un aliado de al lado, ataca gratis.
35. ✅ **Desarmar** (2026-10-21): Flash en el Bloqueo, atacando o defendiendo; el arma o el escudo vuela 2 casillas (con ruleta). Botón instantáneo 🤺.
    (2026-10-22: solo con un Parry ganado; defendiendo, si paró con el arma, no con el escudo; una bestia también desarma, pero lo natural no se
    le cae; se elige adentro del paso 3 del duelo.)

**H. Apuestas** ✦
36. **Todo o nada**: un golpe enorme, pero si falla queda Expuesto.
37. **Sangre por sangre**: pierde vida para pegar más fuerte.
38. **Berserker**: con poca vida, pega mucho más.

**Skills de clase, para tener en cuenta** (2026-10-26, dueño: «incorporá a la lista los skills de clase, para tener en cuenta. Eso en todos los
tipos y clase»): las de Warrior y Tanque, con el original tal cual (o, si no tiene, lo que hace hoy). ✅ = ya tiene su versión
de creep · ≈ = hay una parecida · ⏸ = anotada para más adelante.
- *Warrior*
  - **Arte de la guerra**: «Arte de la guerra [2] — +2 fijo a una tirada de PG, Parry, Bloqueo o Daño.»
  - ✅ **Amplificar daño** → Golpe fuerte (con X = 1): «Amplificar daño [X] — Amplifica en X el daño de un ataque. X no puede ser mayor a 3.»
  - **Sacadito** (en pausa): En pausa, a definir. SP 3. Recibe 10 Nitros que puede usar en ataques consecutivos iguales. Acumulable con otras skills si todos los ataques son idénticos.
  - **Cañón Vasco**: «Cañón Vasco [2 + X] — X no puede ser mayor a FUE. Salta X casillas a X altura. Si aterriza en un enemigo, lo empuja 1 casillero. Al caer, hace X + FUE (tira) daño de onda expansiva en área. Puede atacar a un objetivo al caer con…»
  - ≈ **Carga** → Cornada (toma carrera) y Tajo veloz: «Carga [X] — Se desplaza X casilleros en línea recta, gastando los No2 correspondientes. Al finalizar el recorrido, ataca con +X al daño y a la PG.»
  - **Estoicismo**: «Estoicismo [2] — NO2: (0). Flash. +2 Def por cada enemigo adyacente. +1 Res.Crit.»
  - ✅ **Remolino** → Barrido y Coletazo (sin moverse): «Remolino [3] — Ataque que daña a todos los objetivos adyacentes. Puede desplazarse una casilla; si lo hace, cuenta las áreas de efecto de ambas posiciones. Repetirlo de inmediato ignora el cooldown del arma.»
  - **Contraataque**: «Contraataque [2] — Permite realizar un ataque de oportunidad después de esquivar un ataque.»
  - ✅ **Desarmar** → Desarmar: FLASH. Le sacás al otro lo que tiene en la mano —un arma o un escudo—, que sale volando 2 casillas (a una libre a la que llegue volando: lo sólido la frena, las personas no; si no hay, al anillo de adentro o de afuera) y queda…
  - **Golpe brutal**: Ataque con Crítico potente ×1 (el doble daño sale con 6+ en el d20, y el triple y el cuádruple un poco antes). A cambio, −2 a tu Evasión hasta tu próximo turno (⚙ automático: te queda el estado «Guardia baja»). Cuenta como un…
- *Tanque*
  - **Blindaje**: «Blindaje [1] — Flash (SP x 2). NO2: (0). Otorga un blindaje que absorbe 8 de daño de la próxima fuente de daño este turno.»
  - ✅ **Shockwave** → Pisotón: «Shockwave [4] — Onda expansiva (Fuerza / Constitución). Flash (SP x 2). Todos los personajes adyacentes al tanque quedan en Pajaritos hasta el final de su próximo turno.»
  - ≈ **Aura de espinas** → Coraza de púas (Espinas, del Support): «Aura de espinas [1] — Devuelve 1/4 del daño del ataque como true damage hasta el comienzo del próximo turno.»
  - **Recuperación**: «Recuperación [1] — NO2: (2). Recupera 9 HP.»
  - **Sonic Boom**: «Sonic Boom [2] — Onda expansiva (Fuerza / Constitución). Flash (SP x 2). Golpea el piso creando una onda de choque en un cono al frente, que hace perder una cantidad de No2 igual a 1 + la diferencia en la tirada. Si perdiera…»
  - **Piel resistente**: «Piel resistente [5] — Otorga una armadura temporal: Defensa 5, Res. Mágica 5, reduce críticos de todo tipo. Duración: 2 turnos.»
  - **Daño en área**: «Daño en área [2] — Ataque con daño en área de flor. No afecta al tanque.»
  - ✅ **Takle** → Takle (creep, 2026-10-26: sin arma, Con +2, 3 No2): «Takle [3] — Flash (SP x 2). Se desplaza hasta 2 casillas. Ataque con +1 a PG. Si gana una tirada de Constitución, el objetivo pierde 2 Nitros, lo empuja 2 casillas, interrumpe su turno y lo manda al final de la tabla de…»
  - ✅ **Taunt** → el «provocar» de El origen: «Taunt [1] — Tira Especial + 1 contra Especial para obligar a un enemigo a atacarlo hasta el final de su próximo turno.»
  - **Miti-Miti**: «Miti-Miti [2] — Marca un personaje como protegido. El protegido comparte con el tanque la mitad del daño que recibe. Duración: 1 turno.»
  - ✅ **Aguante** → Aguante: «(Skill nueva, 2026-10-23: la misma del modo aguante de los creeps de choque pesado, sumada al pool del Tanque por el dueño; tope de dados: nivel + 1.)»
  - **Temple**: Endurecés el cuerpo: +1 de Resistencia a crítico contra armas de todo Tipo durante 2 turnos (cada punto le quita un nivel al crítico). Solo sobre vos. ⚖ Propuesta a auditar con el grupo (críticos nuevos: Crítico frecuente baja…

### Tanda Choque pesado 10 · 10 · 10 (2026-10-27) — propuesta para elegir

> Dueño, 2026-10-27: «podemos agarrar las habilidades de clase del Warrior y del tanque y ya adaptarlas todas a este grupo. Podemos hacer por lo
> menos 10 claras de tanque, 10 claras de Warrior y 10 ambiguas… Emparejemos eso». Hoy: 6 warrior, 4 tanque, 6 ambiguas (abajo) → faltan **4
> warrior, 6 tanque y 4 ambiguas** (14). Se definen sin programar, rotando W → T → A para que avancen parejas. Propuesta (cada una un escalón
> arriba de la de clase; las de repuesto, por si alguna no convence):

- ⚔ **Warrior (+4)**: **Golpe brutal** (clase), **Arte de la guerra** (clase), **Contraataque** (clase), **Golpe que sigue** ✦ (A5).
  Repuesto: Todo o nada, Hendidura, Frenesí que crece, Sangre por sangre.
- 🛡 **Tanque (+6)**: **Provocar** (Taunt), **Piel de hierro** (Piel resistente + Temple), **Blindaje**, **Segundo aliento** (Recuperación),
  **Escudo humano** (Miti-Miti), **Interponerse**. Repuesto: Inamovible, Estoicismo, Grito de desafío, Muralla, Represalia, Cubrir al de atrás,
  Última resistencia (la tabla de abajo).
- ⚖ **Ambiguas (+4)**: **Golpe de escudo**, **Carga que derriba** (Carga, clase), **Sonic Boom** (clase), **Arrastrar** (C16).
  Repuesto: Espinas (Aura de espinas, clase), Lanzar, Represalia.
- **Ideas nuevas** (dueño, 2026-10-27: «podemos sumar lista de ideas que se te ocurran a vos para una cosa y la otra»), además de las de clase:
  - ⚔ *Warrior*: **Desafío a duelo** (marca a un rival: +2 PdG y +2 al daño contra él, −2 contra los demás, hasta que uno caiga) · **Insistir**
    (cada ataque que falla le da +2 PdG al próximo contra el mismo, acumulable hasta +6) · **Lanzar el arma** (la arroja a 3 casillas con su
    daño +2; el arma queda tirada ahí, como la de Desarmar) · **Golpe doble pesado** (dos ataques al mismo; si el primero pega, el segundo +2 al
    daño) · **Tajo en abanico** (con arma de dos manos: un cono de 3 al frente, una tirada contra cada uno) · **Adrenalina** (cuando le entra un
    crítico, +3 al daño de su próximo ataque) · **Rematar al caído** (+2 dados contra un rival Sentado, atrapado o en Pajaritos).
  - 🛡 *Tanque*: **Plantarse** (si no se mueve en su turno: +3 Defensa, +2 Res.CC y una oportunidad de más hasta el próximo) · **Cortar el paso**
    (su ataque de oportunidad, si pega, frena al que se movía: pierde el resto del movimiento) · **Ancla** (una cadena a un rival: no puede alejarse
    a más de 2 casillas de él, 2 turnos) · **Atraer los golpes** (aura 2 turnos: un rival a 2 o menos que ataque a otro que no sea él, −2 PdG) ·
    **Cambio de lugar** (Flash: intercambia casilla con un aliado pegado, gratis, y recibe él el próximo golpe) · **Muro de escudos** (los aliados
    detrás de su escudo quedan cubiertos de los disparos: −3 al PdG de rango contra ellos) · **Rebote de escudo** (Flash al bloquear un disparo
    o un hechizo: lo devuelve al que lo tiró) · **Contrapeso** (2 turnos: el que intente empujarlo o tirarlo y pierda queda Sentado).
  - ⚖ *Ambiguas*: **Cabezazo** (sin arma, Constitución contra Constitución: Pajaritos 1 turno y 1d6; él se hace 1d4) · **Agarrar y golpear**
    (un Agarrón y un golpe en el mismo turno, el golpe +2 si lo atrapó) · **Embestida que sigue** (empuja 2 y avanza con él, sin oportunidad) ·
    **Golpe de pomo** (rápido: medio ataque en No2, poco daño y Demora 1) · **Martillazo al suelo** (onda alrededor con poco daño; las casillas
    quedan como terreno difícil 2 turnos) · **Escudo de carne** (agarra a un rival atrapado y lo usa de escudo: los disparos contra él van al
    atrapado) · **Rencor acumulado** (cada golpe que recibe le suma +1 al daño de su próximo ataque, hasta +5).
- **Orden** (dueño, 2026-10-27: «vamos de a una como hicimos hasta acá. Dos de tanque y después una y una hasta llegar a las 10»): dos de tanque
  (4 → 6, así quedan los tres grupos en 6) y después una de cada uno, rotando, hasta 10 · 10 · 10.
- **Definidas (sin programar todavía)**:
  1. 🛡 **Provocar** (el Taunt en versión creep; dueño, 2026-10-27: «que el taunt de clase tire PdG especial más nivel contra resistencia mental.
     El de creep además suma 2 de defensa y 2 de defensa especial»): a un rival en su Rango, **PdG.Esp + su nivel** contra la **Res.Mt**; si gana,
     queda **Provocado por él 2 turnos** (el estado de Tirar la bronca, con su Anuncio y su brillo) y, mientras dure, el creep tiene **+2 Defensa y
     +2 Def. especial**. 1 No2 y 2 SP, o cooldown 2.
     **También cambia el Taunt de clase** (`comun/skills-clase.js`, `tanque-taunt`): **PdG.Esp + nivel** (antes +1) contra la Res.Mt. Hoy el duelo
     solo admite un bono fijo (`tiraBono`): hace falta que acepte «+ nivel». Se programa con la tanda.
  2. 🛡 **Piel de hierro** (Piel resistente + Temple, de clase; dueño, 2026-10-27: «va así»): sobre sí mismo, **+6 Defensa, +6 Def. especial y
     +1 Res. a crítico de todo Tipo**, **2 turnos**. 1 No2 y 4 SP, o cooldown 3; no es Flash. Combina con Provocar (+8 / +8 mientras dure el
     Provocado). Originales: «Piel resistente [5] — Otorga una armadura temporal: Defensa 5, Res. Mágica 5, reduce críticos de todo tipo.
     Duración: 2 turnos.» y Temple (+1 Res. a crítico de todo Tipo, 2 turnos).
  3. ⚔ **Golpe brutal** (de clase; dueño, 2026-10-27: «el de creep es +1 frecuente, +2 potente, +3 al daño»): un ataque con su arma con
     **Crítico frecuente +1, Crítico potente +2 y +3 al daño**; queda en **Guardia baja** (−2 Evasión) hasta su próximo turno. Un ataque y 2 SP,
     o cooldown 2. Combina con Furia (todo al ataque) y con Romper armadura.
     **También cambia el de clase** (`comun/skills-clase.js`, `warrior-golpe-brutal`; dueño: «tiene que dar +1 a los dos bonos de crítico… y +2
     al daño, y queda en guardia baja»): **Crítico frecuente +1, Crítico potente +1 y +2 al daño** (hoy solo `critpotBono: 1`; sumar `critBono: 1`
     y `fijo: 2`, y el detalle). Se programa con la tanda.
  4. ⚖ **Golpe de escudo** (D22 Derribar; dueño, 2026-10-27: «lo primero que tira es destreza contra evasión. Y si pega es fuerza más [el peso]
     del escudo… no es contra constitución, sino contra resistencia al crowd control»): necesita escudo. Pega con el escudo: **Destreza contra la
     Evasión** del rival; si pega, el escudo pega **como un arma contundente**: ~~1d10 + el peso del escudo + su Dmg~~ → **tantos d10 como el peso
     del escudo + su Dmg contra la Defensa** (dueño, 2026-10-27: «usa el escudo como si fuera un arma de tipo 10… si es un escudo que pesa 3, tira 3 de
     10 y daño; si pesa 1, 1 de 10 más daño») del
     rival (el Dmg, el atributo secundario que sale de la Fuerza; dueño: «por más daño me refiero al estado secundario damage») (dueño, 2026-10-27: «como si el escudo fuera un arma contundente… y si pasa, hace el efecto que decíamos»); si la pasa, le hace **la
     diferencia de daño** y lo deja **Sentado y con Demora 1**. Sin la tirada contra la Res.CC (la reemplaza esta). **5 No2 (lo de un primer ataque de Tipo 10) y 2 SP** (dueño, 2026-10-27; probó 4 No2 y 3 SP y volvió atrás; sigue siendo su ataque del turno), o cooldown 2.
     (Los escudos de 1 mano pesan 1 a 3; el de 2 manos, hasta 6: el escudo pesado es el que mejor pega.)
  5. 🛡 **Interponerse** (F31; dueño, 2026-10-27: «está bien, hagámoslo así»): **Flash** (botón instantáneo en el duelo, como Desarmar): cuando
     atacan a un aliado a **2 casillas o menos**, antes de la tirada, **salta a su lado** (gratis: sin No2 ni ataques de oportunidad) y **el golpe va
     contra él**, con **+2 Defensa** contra ese golpe. 2 SP (4 en turno ajeno), o cooldown 3. Combina con Piel de hierro y Provocar. 🔧 Hace falta
     que el duelo pueda cambiar de defensor a mitad de camino.
  6. ⚔ **Arte de la guerra** (de clase: «Arte de la guerra [2] — +2 fijo a una tirada de PG, Parry, Bloqueo o Daño.»; dueño, 2026-10-27: «está
     bien el más 3, está bien el flash, pero que no sea después de ver los dados»): **Flash** (botón instantáneo en el duelo): **+3 fijo** a una
     tirada suya de **PdG, Parry, Bloqueo o daño**, atacando o defendiendo, **elegida antes de tirar** (no después de ver los dados). 2 SP (4 en
     turno ajeno), o cooldown 2.
  7. 🛡 **Escudo humano** (Miti-Miti, de clase: «Miti-Miti [2] — Marca un personaje como protegido. El protegido comparte con el tanque la mitad
     del daño que recibe. Duración: 1 turno.»; dueño, 2026-10-27: «va así. Igual puede combinar con un escudo de vida extra, un escudo especial de
     5 HP»): marca a un aliado a **3 casillas o menos**: queda **Protegido 2 turnos**; del daño que recibe, **la mitad (redondeada hacia arriba) se
     la come el tanque** (daño ya calculado: no le resta su Defensa); si se alejan a más de 3, se corta. Además, al usarla el tanque recibe **5 de
     Vida extra** (lo primero que se gasta de lo que le llega). 1 No2 y 3 SP, o cooldown 3; no es Flash. 🔧 Hace falta repartir el daño de uno con
     otro.
  8. ⚖ **Carga que derriba** (Carga, de clase: «Carga [X] — Se desplaza X casilleros en línea recta, gastando los No2 correspondientes. Al
     finalizar el recorrido, ataca con +X al daño y a la PG.»; dueño, 2026-10-27: «va así»): avanza **hasta 4 en línea recta** (paga los No2 del
     movimiento) y ataca con su arma con **+X PdG y +X al daño** (X = casillas recorridas); si pega y corrió **3 o más**, tira **Fuerza + X contra
     la Res.CC**: si gana, **Sentado**. Un ataque, los No2 del movimiento y 2 SP, o cooldown 2.
  9. ⚔ **Contraataque** (de clase: «Contraataque [2] — Permite realizar un ataque de oportunidad después de esquivar un ataque.»; dueño,
     2026-10-27: «el de creep igual que decís vos, pero que no ataque gratis sin nitros, que gaste los nitros de un primer ataque»): **Flash**
     (botón instantáneo en el duelo, solo si **ganó la Evasión o el Parry** contra un ataque cuerpo a cuerpo): ataca con su arma al que le pegó,
     con **+1 PdG**, pagando **los No2 de un primer ataque**. 2 SP (4 en turno ajeno), o cooldown 2. Se decide después de ver el resultado (reacciona
     a haber esquivado; no cambia ningún dado). Combina con Desarmar (del mismo Parry) y con Arte de la guerra.
     **También cambia el de clase** (`comun/skills-clase.js`; dueño: «el de clase también debería tener flash y costar 1, cosa que al usarlo con
     flash cueste 2»): **Flash, 1 SP** (2 en turno ajeno). Se programa con la tanda.
  10. 🛡 **Segundo aliento** (Recuperación, de clase: «Recuperación [1] — NO2: (2). Recupera 9 HP.»; dueño, 2026-10-27: «que cueste 3 SP y que
     quite cualquier debuff, no solamente de daño»): se cura **6 + su Constitución** y se saca **un debuff, cualquiera** (el que elija), **una vez
     por combate**. 2 No2 y 3 SP; no es Flash. Combina con Escudo humano y Provocar.
  11. ⚖ **Sonic Boom** (de clase: «Sonic Boom [2] — Onda expansiva (Fuerza / Constitución). Flash (SP x 2). Golpea el piso creando una onda de
     choque en un cono al frente, que hace perder una cantidad de No2 igual a 1 + la diferencia en la tirada. Si perdiera todos los No2 de este modo,
     queda Sentado.»; dueño, 2026-10-27: «ok»): **Flash**; el mismo cono al frente (16 casillas); **Fuerza +2 contra la Constitución** de cada rival
     del cono; al que pierde le saca **1 + la diferencia en No2** y le hace **la diferencia como daño físico directo**; sin No2, **Sentado**. 1 No2 y
     3 SP (6 en turno ajeno), o cooldown 3.
  12. ⚔ **Golpe que sigue** ✦ — **cambiada (dueño, 2026-10-30)**: «me hace ruido que tenga que matar para funcionar… si pega, pasa al siguiente. Es un
     golpe doble. Pero tiene que haber al menos dos adyacentes al atacante» → si pega, sigue contra otro rival pegado (lo de un primer ataque); con menos
     de dos rivales pegados avisa y deja seguir. Lo de abajo es la versión vieja. (A5; dueño, 2026-10-27: «vamos así»): un ataque con su arma con **+2 al daño**; si deja al rival **en 0**, ataca
     enseguida a **otro rival pegado** a él pagando **los No2 de un primer ataque**; la cadena se corta ahí (el segundo no sigue). Un ataque y 2 SP,
     o cooldown 2. Combina con Remate, Barrido y Furia.
  13. 🛡 **Blindaje** (de clase: «Blindaje [1] — Flash (SP x 2). NO2: (0). Otorga un blindaje que absorbe 8 de daño de la próxima fuente de daño
     este turno.»; dueño, 2026-10-27: «está bien que sea más poderosa, pero solamente contra sí mismo, no contra aliados»): **Flash** (botón
     instantáneo en el duelo); **absorbe 12 de daño** de la próxima fuente de daño de este turno, **solo sobre sí mismo**. 1 SP (2 en turno ajeno),
     o cooldown 2; sin No2. Combina con Interponerse (se mete en el golpe y lo absorbe) y con Escudo humano.
  14. ⚖ **Arrastrar** (C16; dueño, 2026-10-27: «va así»): a un rival a **3 casillas o menos**: **Destreza contra la Evasión**; si lo engancha, lo
     **arrastra hasta quedar pegado** a él (no camina: sin No2 ni ataques de oportunidad; las trampas y zonas del camino **sí lo tocan**) y le pega
     con su arma con **+2 PdG**. Un ataque y 2 SP, o cooldown 2. Combina con Provocar, Golpe de escudo y Golpe que sigue.
- **Cuenta** (2026-10-27): ✅ **⚔ 10 · 🛡 10 · ⚖ 10**, todas definidas. ✅ **Programadas y probadas en el mapa el mismo día** (reporte: `reporte-choque-pesado-2026-10-27.md`; dueño: «tocaría pasar a programar todas
  estas nuevas skills… y una vez que estén programadas, procedé vos a probarlas en el mapa»), con los cambios de clase en Taunt, Golpe brutal y
  Contraataque. Dos decisiones chicas al programar (para revisar): el Arrastrar va en una sola tirada (su PdG +2 contra la Evasión o el Parry: si pega,
  lo trae y le pega), y el Segundo aliento, «una vez por combate», queda marcado en la habilidad hasta que el GM lo edite (no hay un «empieza el
  combate» que lo libere solo). Las pruebas en el mapa: `docs/pruebas-en-el-mapa.md`.
- Ya cubiertas por una de fábrica: Amplificar daño (Golpe fuerte), Remolino (Barrido), Shockwave (Pisotón), Takle, Desarmar, Aguante; Cañón Vasco ≈
  Salto aplastante; Daño en área (tanque) ≈ Barrido. Sacadito sigue en pausa.

### Tanda Tanque (2026-10-26) — el menú del tanque

> Dueño, 2026-10-26: «podemos diseñar algunas skills más de tanque antes de hacer [los creeps humanoides]… basarnos en las skills de clase y en
> conceptos e ideas que vos me armes en una lista». El Tanque tenía pocas propias auditadas (Aguante, Desarmar, Pisotón, Takle); el «provocar» de El
> origen quedó archivado, así que el Taunt vuelve a estar pendiente. Cada propuesta ya va un escalón arriba de la de clase (creep). ⚙ = el motor
> ya tiene casi todo · 🔧 = hace falta una mecánica nueva en el mapa o en el duelo.

**Cómo se reparten hoy las de Choque pesado** (dueño, 2026-10-27: «de las 20 que tenemos, solo 4 son de tanque y 16 serían de warrior. Igual hay
algunas que son medio ambiguas»). Sin contar las versiones de bestia (Mordisco feroz, Coletazo, Ir por el herido, Zarpazo erguido, Arrancar la
coraza, Mandíbula trituradora), que repiten el concepto de una humanoide:
- ⚔ **Warrior**: Golpe fuerte, Furia, El que avisa no traiciona, Remate, Romper armadura, Golpe demoledor.
- 🛡 **Tanque**: Aguante, Pisotón, Takle, Desarmar.
- ⚖ **Ambiguas** (pegan, pero también controlan; el material natural de los Híbridos): Puño de roca (daño + Demora), Agarrón y Abrazo aplastante
  (atrapar), Cornada (empujar), Barrido (le pega a todos los de al lado), Salto aplastante (entra y pega en área).

| # | Concepto | De dónde sale | Versión creep propuesta | Motor |
|---|---|---|---|---|
| 1 | **Provocar** | Taunt (clase), D18 | Tira Especial +2 (o Constitución) contra la Res.Mt de un rival a 3 casillas o menos: queda Provocado por él hasta el final de su próximo turno (el Provocado de Tirar la bronca: el Anuncio y el brillo ya existen) | ⚙ |
| 2 | **Grito de desafío** ✦ | Taunt en área | El mismo provocar, contra todos los rivales a 2 casillas o menos (una onda: cada uno resiste por separado) | ⚙ |
| 3 | **Piel de hierro** | Piel resistente (clase), E26 | +4 Defensa, +4 Def. especial y +1 Res. a crítico de todo Tipo, 2 turnos | ⚙ |
| 4 | **Blindaje** | Blindaje (clase) | Flash: un escudo de 10 que absorbe la próxima fuente de daño de este turno | ⚙ |
| 5 | **Segundo aliento** | Recuperación (clase), E25 | Se cura 4 + su Constitución, una vez por combate (o con cooldown largo) | ⚙ |
| 6 | **Inamovible** | E27 | 2 turnos sin que lo empujen, lo tiren Sentado ni le bajen el orden, y +2 Res.CC (el preset Inamovible ya existe) | ⚙ |
| 7 | **Estoicismo** | Estoicismo (clase de Warrior) | Flash: +2 Defensa por cada rival pegado y +1 Res. a crítico, hasta su próximo turno | ⚙ |
| 8 | **Golpe de escudo** ✦ | D22 Derribar | Un ataque con el escudo (daño = su Bloqueo + su Dmg): si gana Fuerza contra Constitución, lo deja Sentado y Demora 1 | ⚙ |
| 9 | **Sonic Boom** | Sonic Boom (clase) | Flash: un cono al frente (Fuerza contra Constitución); cada uno que pierde, pierde 1 + la diferencia de No2 y, en 0, queda Sentado (el efecto «Pierde No2» ya existe) | ⚙ |
| 10 | **Escudo humano** | Miti-Miti (clase), F29 | Marca a un aliado a 3 casillas o menos: la mitad del daño que recibe se lo come el tanque, 2 turnos | 🔧 |
| 11 | **Interponerse** ✦ | F31 | Flash: cuando atacan a un aliado a 2 casillas o menos, salta a su lado (gratis, sin oportunidad) y el golpe va contra él | 🔧 |
| 12 | **Represalia** | G34 | Hasta su próximo turno, si le pegan a un aliado pegado a él, ataca gratis a quien pegó (una vez por turno) | 🔧 |
| 13 | **Muralla** ✦ | D19–20 | Hasta su próximo turno, cada casilla pegada a él cuesta 1 No2 más a los rivales, y alejarse de él le da siempre oportunidad (aunque ya la haya usado) | 🔧 |
| 14 | **Cubrir al de atrás** | F30 | Un aura: los aliados pegados a él del lado de su espalda tienen +2 Defensa, 2 turnos | 🔧 |
| 15 | **Última resistencia** | E28 | Una vez por combate, al llegar a 0 queda en 1 de vida hasta el final de su próximo turno | 🔧 |

## 2. Choque liviano — las ideas del rol

Ya cubierto al entrar (2026-10-21): golpes precisos (Tajo veloz, Estocada, Zarpazo), las variantes del Sangrado y su versión fuerte, el Rengo (Golpe a la
rodilla, Tarascón al tobillo), las redes; y en el mapa, el sigilo, el +1 por la espalda y Robar.

**Son conceptos de diseño** (dueño, 2026-10-21): cada vez que toque una habilidad de choque liviano se explora uno y se marca ✅. ✦ = acelera la pelea.

**A. Golpes rápidos y precisos**
1. ✅ **Golpe preciso**: Tajo veloz, Estocada, Zarpazo.
2. **Dos cortes rápidos** ✦: dos golpes en uno, con menos daño cada uno.
3. ✅ **Ráfaga de cortes** ✦: **Ráfaga de cortes** y **Ráfaga de zarpazos** (2026-10-21: +2 dados, los efectos del arma ×3 y la Perfora en cada corte).
4. **Punto débil**: perfora parte de la Defensa.
5. ✅ **Buscar el crítico** — **Ojo de asesino** (2026-10-26, el de la clase: un ataque con +1 PdG, +2 al daño y +1 a los dos críticos).

**B. Desangrar y envenenar**
6. ✅ **Sangrado**: todas sus variantes y la versión fuerte.
7. ✅ **Veneno** (2026-10-25): **Hoja envenenada** (humanoides: Perfora 2 y Veneno 3) y **Mordisco infectado** (bestias: el mismo, con el nombre de la Rata). Faltan las variantes.
8. **Veneno que paraliza**: chance de Parálisis.
9. **Veneno que debilita**: el envenenado pega menos.
10. ✅ **Abrir la herida** ✦ (2026-10-21): **Sal en la herida** / **Morder la herida** — si no sangra, lo hace sangrar; si ya sangra, +2 dados y le sube el sangrado.

**C. Moverse y pegar**
11. ✅ **Golpear y alejarse**: Hit and run.
12. ✅ **Salto**: Salto (y su versión pesada, Salto aplastante).
13. **Pasar por al lado**: lo cruza, le pega y queda a su espalda.
14. **Danza de cuchillas** ✦: se mueve y le pega a dos en el camino.
15. **Voltereta**: se mueve gratis, sin dar oportunidad.

**D. Sigilo y espalda**
16. ✅ **Puñalada**: Puñalada por la espalda, Mordida a traición, Puñalada trapera (y la pasiva Paso ligero).
17. ✅ **Desaparecer en la pelea** — **Bomba de humo** (2026-10-26): vuelve al sigilo a mitad del combate (humo, sombras).
18. **Golpe desde las sombras**: al salir del sigilo, su primer golpe va con más crítico.

**E. Esquivar y reaccionar**
19. **Esquivar**: Evasión extra hasta su próximo turno.
20. **Reflejos**: un dodge roll gratis cuando lo atacan.
21. **Contraataque al esquivar**: si gana la Evasión, pega de vuelta (como el Warrior).
22. ✅ **Finta** (2026-10-26: +2 al daño, Crítico frecuente +1 y potente +1, y no se puede parar —ni Parry ni Bloqueo—): el rival no puede usar Parry contra su próximo golpe.

**F. Trabar al rival**
23. ✅ **Rengo**: Golpe a la rodilla, Tarascón al tobillo.
24. ✅ **Redes**: Red, Tela de araña.
25. **Golpe a la mano**: Desarmado.
26. **Tajo a los ojos**: Ceguera.
27. **Zancadilla**: Sentado.

**G. Jugar sucio**
28. **Arena a los ojos**: Ceguera breve, sin daño.
29. ✅ en parte: **Robar** (ya existe en el mapa; falta auditar la habilidad del Ladrón).
30. **Burla**: lo provoca para que lo persiga (un Provocar liviano).

**H. En grupo** ✦
31. **Rodear**: pega más fuerte si otro aliado también está pegado al objetivo.
32. ✅ **Manada** ✦ (2026-10-21): **Patotear** / **Jauría** — +1 dado por cada aliado pegado al objetivo, hasta +3.
33. **Distraer**: el objetivo pierde su ataque de oportunidad contra los aliados.

**I. Apuestas** ✦
34. ✅ **Todo al ataque** — **Degollar** (2026-10-26, el del Asalto: +4 PdG, +7 al daño, +1 a los dos críticos; termina su turno, pasa al final del orden y queda Expuesto): pega mucho más, sin Evasión hasta su próximo turno.
35. ✅ **Golpe desesperado** (2026-10-26, escalonado por su vida): con poca vida, un golpe con mucho más crítico.

**Skills de clase, para tener en cuenta** (2026-10-26, dueño: «incorporá a la lista los skills de clase, para tener en cuenta. Eso en todos los
tipos y clase»): las de Asalto, con el original tal cual (o, si no tiene, lo que hace hoy). ✅ = ya tiene su versión
de creep · ≈ = hay una parecida · ⏸ = anotada para más adelante.
- ✅ **Dash** → Dash (y el del Asalto, automatizado en el mapa): «Dash [3] — NO2: (1 + Ataque). Avanza 3 casilleros en línea recta atravesando hasta 1 enemigo. Ataca a los enemigos que atraviesa. +2 fijo al parry. Se cancela si pierde una tirada de parry o bloqueo. Si atraviesa un enemigo de…»
- ✅ **Lisiar** → Zarpazo (sin la Lesión): «Lisiar [2] — Ataque con +1 al crítico. Causa lesión de -1 de PG al objetivo durante 2 turnos. Critical Matters: si es crítico, cambia el efecto a -2 fijo a la PG por 2 turnos.»
- ≈ **Tajear** → Tajo veloz: «Tajear [3] — Ataque con +1 al crítico. Deja heridas de 3 de daño por 3 turnos. Critical Matters: si es crítico, cambia el efecto a 5 de daño hasta curarse.»
- **Invi** (en pausa): SP 5. Invisible por Invi × 2 turnos. Se detecta con Percepción (ESP). El rango depende de la velocidad: normal (1 No2 por casillero) flor de diámetro 7 (37 casillas); lenta (2 No2 por casillero) flor de diámetro 5 (19 casillas).
- ≈ **Envenenar arma** → Arma venenosa (Support) y Hoja envenenada: «Envenenar arma [2] — Mejora el arma con veneno que le otorga +3 fijo al daño y aplica 3 stacks de veneno. Duración: 2 ataques.»
- **Backstab** (en pausa): SP 2. Únicamente por la espalda. +5 daño fijo. Ignora 1 de resistencia a crítico.
- ✅ **Degollar** → Degollar: «Degollar [7] — Ataque devastador con +4 de PG, +7 de daño y +1 al crítico. Interrumpe su turno y se pasa al final de la tabla de iniciativa. Hasta su próximo turno pierde 50% de evasión y no puede usar No2 para responder a…»
- **Sprint**: «Sprint [1] — 2 No2: avanza 3 casillas.»
- **Tronco de huída**: «Tronco de huída [2] — +2 fijo a una tirada de evasión con giro.»
- **Robar SP** (en pausa): SP 1. Ganás 2 SP por cada crítico obtenido.
- ✅ **Ojo de asesino** → Ojo de asesino (2026-10-26; la de clase también: un ataque con +1 PdG, +2 al daño, Crítico frecuente +1 y potente +1; ya no es un estado).

## 3. Rango y Hunter — las ideas del rol

Ya cubierto al entrar (2026-10-21): Tiro a la rodilla (Rengo), la Red (Hunter); y en el mapa, la línea de tiro, el tiro alto, la distancia ideal, Tensar,
las flechas especiales y el Marcado.

**Son conceptos de diseño** (dueño, 2026-10-21, como los del Support): cada vez que toque una habilidad de rango se explora uno y se marca ✅.
✦ = acelera la pelea. Lo que ya existe en el mapa se puede reusar: la línea de tiro, el tiro alto, la distancia ideal, el largo alcance, Tensar, Apuntar,
la emboscada, matabestias, la espalda a distancia, la recarga, el proyectil perforante, la repetición, Marcar, la Vigilancia y las flechas especiales
(veneno, fuego, salto eléctrico, humo, luz, red, explota, clava).

**A. Puntería y preparación**
1. ✅ **Tiro apuntado** — **Tiro a la cabeza** (2026-10-21: un turno apunta; el próximo disparo +2 PdG, Crítico frecuente +1 y potente +1; si le hacen daño
   antes, lo pierde).
2. **Tensar al máximo**: si no se movió, el disparo pega más fuerte (el Tensar de los arcos).
3. **Ojo de halcón**: sin la penalidad del tiro alto, o más alcance por un turno.
4. ✅ **Tiro certero** (2026-10-26: +1 PdG, Perfora 3 e ignora 2 de Resistencia a crítico): ignora parte de la Defensa (Perfora) o de la Resistencia a crítico.

**B. Volumen de fuego** ✦
5. **Disparo doble**: dos disparos con menos puntería cada uno.
5b. ✅ **Ráfaga encadenada** (2026-10-25, la Repetición del Shooter para creeps): sus próximos 3 disparos al mismo blanco van cada vez mejor
   (el 2.º +1 PdG y +1 dado, el 3.º +2 y +2); cada uno paga sus No2. No gasta su ataque.
6. **Ráfaga**: tres disparos, cada uno a un objetivo distinto.
7. **Lluvia de flechas**: un área (flor) donde caen flechas, con dodge roll. ⏸ Para otro momento (dueño, 2026-10-25). Propuesta guardada: diámetro 3
   en su Rango, su PdG una vez contra la Evasión de cada uno (dodge roll), el daño de su arma +2; un ataque y 3 SP, o cooldown 3.
8. ✅ **Abanico** (2026-10-26: el cono al frente, su PdG contra la Evasión de cada uno, el daño de su arma): un cono de flechas al frente.
9. ✅ **Atravesar** — **Flecha que atraviesa** (2026-10-25, el Proyectil perforante del Shooter para creeps): un disparo con +2 al daño que sigue de
   largo y le pega al de atrás, contra la misma tirada.

**C. Distancia y movimiento**
10. **Retroceder y disparar**: se aleja uno o dos casilleros gratis y dispara.
11. ✅ **Disparar y reposicionarse** — **Disparo y repliegue** (2026-10-26): un disparo con +2 al daño y, pegue o no, se aleja hasta 2 casilleros gratis y sin oportunidad.
12. **Tiro en carrera**: se mueve y dispara sin perder la puntería.
13. ✅ **Mantener a raya** ✦ (2026-10-25): un disparo con +2 al daño; si pega, lo empuja 2 casillas y queda Lento 2 turnos.

**D. Control a distancia**
14. ✅ **Tiro a la rodilla** (Rengo).
15. ✅ **Tiro que derriba** (2026-10-26: un disparo normal; si pega, lo empuja 1 y queda Sentado): Sentado.
16. **Tiro que empuja**: lo corre uno o dos casilleros (con daño de colisión).
17. ✅ **Tiro al arma** (2026-10-26: un disparo con +2 PdG; si pega, el arma sale volando 2 casillas con la ruleta del Desarmar): Desarmado (el arma cae al piso).
18. ✅ **Clavar a la pared** (2026-10-26, dueño: +3 PdG; si pega, lo empuja 3 y, si choca contra algo sólido, Inmovilizado 3 turnos —Fuerza contra el PdG con que le pegaron—): si hay un Sólido o una pared detrás, queda Inmovilizado.
19. ✅ **Red** y Tela de araña (Inmovilizado).
20. **Tiro cegador**: Ceguera (una flecha de luz o tierra a los ojos).
21. **Cortina de humo**: una nube que tapa la vista (para cubrirse o cubrir a los suyos).

**E. Marcar y coordinar** ✦
22. **Marcar la presa**: bonos propios contra un solo objetivo.
23. ✅ **Señalar para todos**: **Disparo señalador** (2026-10-21: Presa —Evasión −1 y +2 al daño de todos sus rivales— y Marcado, 2 turnos).
24. **Fuego de supresión**: una línea o zona donde quien entra recibe un disparo o pierde No2.
25. **Fuego de cobertura**: mientras dispara, un aliado se mueve sin dar oportunidad.

**F. Reacciones**
26. ✅ **Vigilancia**.
27. **Contradisparo**: cuando un rival le dispara, le responde (Flash).
28. **Tiro de advertencia**: el objetivo pierde su próximo movimiento o su ataque de oportunidad.

**G. Disparos con efecto** (las flechas especiales, como habilidad del creep)
29. **Flecha envenenada**: Veneno.
30. **Flecha incendiaria**: Quemadura o terreno incendiado.
31. **Flecha eléctrica**: el salto del rayo.
32. **Flecha explosiva**: un área chica.
33. **Flecha de hielo**: Escarcha.
34. **Flecha que sangra**: Sangrado.

**H. Contra lo que se esconde**
35. **Flecha de luz**: revela a los que están en sigilo en un área.
36. **Tiro a ciegas**: dispara a una casilla de niebla o a alguien en sigilo, con menos puntería.

**I. Hunter**
37. **Trampas** (ya hay muchas): colocar una y llevar a los rivales hacia ella.
38. **Golpe con el arco y salto atrás**: pega cuerpo a cuerpo y se aleja.
39. **Compañero animal**: un halcón que marca, distrae o pica (una invocación justificada).
40. **Rastrear**: ve a los que están en sigilo cerca (Ve lo oculto por un rato).
41. **Cebo**: atrae a un rival a una casilla (a una trampa).

**J. Apuestas** ✦
42. **A quemarropa**: dispara pegado a un rival sin la penalidad, y con más daño.
43. **Último disparo**: con poca vida, un disparo con mucho más daño.

**Skills de clase, para tener en cuenta** (2026-10-26, dueño: «incorporá a la lista los skills de clase, para tener en cuenta. Eso en todos los
tipos y clase»): las de Shooter, con el original tal cual (o, si no tiene, lo que hace hoy). ✅ = ya tiene su versión
de creep · ≈ = hay una parecida · ⏸ = anotada para más adelante.
- ≈ **Apuntar** → Tiro a la cabeza: «Apuntar [X] — X No2: +X a la PG y al crítico en el próximo ataque a distancia (X ≤ 3).»
- ✅ **Vigilancia** → Vigilancia: «(Nueva, 2026-10-21: la Vigilancia de los creeps, sumada al Shooter a pedido del dueño.)»
- **Acelerado**: «Acelerado [1] — Reduce el cooldown de un ataque. Repetible (+1 SP por repetición).»
- **Enfocado**: «Enfocado [1] — +2 de daño al próximo ataque. Repetible (+1 SP por repetición).»
- **Parry a distancia**: «Parry a distancia [2] — Flash. Realiza un ataque de rango como instantáneo. Si se hace como respuesta a un ataque, tira Agilidad para cancelarlo.»
- ≈ **Headshot** → Tiro a la cabeza (apunta un turno antes): «Headshot [4] — Ataque con +1 al crítico y crítico mejorado. Daño +5. +2 fijo a PG. Falla si no es crítico.»
- ✅ **Proyectil perforante** → Flecha que atraviesa: «Proyectil perforante [2] — Ataque que continúa hasta alcanzar un segundo objetivo. Todos los efectos especiales se pierden después del primer objetivo.»
- ≈ **Marcar** → Disparo señalador (Presa y Marcado): «Marcar [3] — Designa un objetivo como marcado; sigue marcado hasta que ataque a un objetivo diferente. Obtiene +1 PG, +1 Daño y +1 Crítico contra el objetivo marcado.»
- ✅ **Repetición** → Ráfaga encadenada: «Repetición [X] — Realiza X ataques consecutivos idénticos entre sí (los ataques gastan No2 normalmente). Por cada ataque adicional al primero suma +1 a la PG y amplifica +1 el daño.»
- **Disparo múltiple** (en pausa): SP X (el doble de objetivos adicionales). Ataca a múltiples objetivos en línea directa en un cono ancho.
- **Tiro con comba** (en pausa): SP 1. Altera la trayectoria de un ataque de rango para esquivar obstáculos. Desvío máx. 2 casillas; cada una cuenta como +1 de distancia.

### Tanda de trampas (2026-10-27) — Rango y Hunter + Choque liviano

> Dueño (2026-10-27): «me di cuenta que no hay trampas. Metería algunas habilidades con trampas, tanto en el choque liviano como en el rango Hunter»
> (en el catálogo vigente, la única que coloca una es el Portal trampa del Mago). Se arman sobre las trampas del catálogo (`docs/rework-trampas.md`),
> un escalón arriba. **Regla nueva del mismo día, ya hecha:** una trampa no se coloca a la vista de un rival (su cono azul del sigilo; la alerta
> naranja sí, y no dispara ninguna detección: P226 ✅). Se diseña de a una; se programa cuando el dueño lo diga.

Propuesta (2026-10-27):
- 🏹 **H1. Cepo del cazador** — **definido** (2026-10-27; dueño: «a esta le vamos a sumar que cualquier tirada fallida para zafarse le hace un dado de 6 de
  daño directo»): 1 casilla (fuera de la vista de los rivales); **3d6 menos su Defensa** e **Inmovilizado hasta el final de la ronda y una ronda completa
  más** (como la Red); no se esquiva ni se resiste. 🔓 **Soltarse: Fuerza contra la Destreza del creep (el número), 1 No2 por intento; cada intento
  fallido, 1d6 de daño directo** (`soltar.danoFalla`, ya existe: el Mordisco feroz). Se detecta con Percepción contra su Destreza. **2 No2 y 3 SP.**
- 🏹 **H2. Red tendida** — **definida** (dueño, 2026-10-27; primero: «al colocar la trampa, quien la coloca tira destreza, y esa es la dificultad»;
  después lo corrigió: «que la dificultad sea el [stat] fijo sin tirar. La coloca directamente. Cae sobre las siete casillas. La tirada es la fuerza, la
  tirada de salvación. Y la del catálogo debería ser igual. Un nitro por intento de costo está bien»): la Red de caza del catálogo con la **Destreza del
  creep (el número, sin tirar) como dificultad**. Se coloca con un clic (fuera de la vista de los rivales); al pisar 1 casilla, la red **cae sobre las 7**:
  cada uno tira **Fuerza contra su Destreza** para escurrirse antes de que caiga; el que no, queda **Inmovilizado 1 turno**; **🔓 Soltarse: Fuerza contra
  su Destreza, 1 No2 por intento**. Se detecta con Percepción contra su Destreza. (La Red de caza del catálogo ya es así, con 7 fijo en las dos tiradas.)
  **Costo y duración** (dueño, 2026-10-27: «2 nitros y 3 SP, y que la red dure vigente durante 2 turnos completos de los afligidos. Sería hasta el final
  de la ronda de la persona que triggerea. Y una ronda completa más»): **2 No2 y 3 SP**; el Inmovilizado dura **lo que queda de la ronda de quien la pisó
  y una ronda completa más** (la marca `turnosCompletos`, como la Furia y ¡Al frente!), igual para todos los atrapados.
- 🏹 **H3. Cebo** — **forma A elegida** (dueño, 2026-10-27: «el cazador pone como cebo algo semienterrado que parece de muchísimo valor, con un brillo
  misterioso que llama la atención»): lo deja en una casilla de su Rango (no es una trampa: se ve); los rivales que lo ven y están a 4 o menos tiran
  **Res.Mt contra la Destreza** del creep; el que pierde **camina ya hasta 3 casillas hacia el cebo** (gratis, sin oportunidad) y lo que pise en el camino
  lo toca (la primera trampa lo frena ahí). **Alcance y final** (dueño, 2026-10-27: «el área de influencia del cebo debe ser una flor de diámetro 9 y
  cualquier persona que se pare en un hexágono adyacente descubre que es una roca pintada y que al dar la vuelta… la levanta y abajo tiene pintado "puto
  el que lee"»): atrae a los que lo ven dentro de una **flor de diámetro 9** (37 casillas) alrededor del cebo; el cebo **queda en el mapa** hasta que
  alguien se para en una casilla **pegada**: ahí se descubre (el Anuncio: es una roca pintada; la levanta y abajo dice «puto el que lee») y desaparece.
  Falta: el costo (propuesta: 1 No2 y 2 SP, o cooldown 3).
  **Dura 3 turnos** (dueño, 2026-10-27: «que el cebo esté tendido durante 3 turnos, igual tiene una tirada de resistencia mental»): mientras está, sigue
  atrayendo: **la Res.Mt se tira al colocarlo y al empezar el turno de cada rival que lo ve dentro de la flor** (dueño, 2026-10-27: «tu propuesta para el
  cebo me parece bien. El primer rival que llega y da vuelta a la piedra, desaparece la piedra»): el primero que se para al lado la da vuelta y la piedra
  desaparece para todos. Costo: la propuesta (1 No2 y 2 SP, o cooldown 3), salvo que el dueño diga otra cosa.
- 🗡 **L1. Aguja en el piso** — **definida** (dueño, 2026-10-27: «va así»): 1 casilla (fuera de la vista de los rivales); **1d8+2 con Perfora 2**; **Veneno ×5
  sin tirada** (entra si lastima; no, si un escudo se come el golpe entero); 2 No2 y 2 SP, o cooldown 3. Lo de abajo es cómo se llegó.
  Antes: en revisión (dueño, 2026-10-27, sobre la del catálogo: «el D6, ¿se resiste con defensa? Porque si se resiste con defensa,
  un dado de 6 es una poronga. Nunca va a pasar el veneno, salvo que tenga perforar»). En el catálogo, la Aguja emponzoñada resta la Defensa al 1d6 pero
  **el veneno no depende del daño** (solo de la Res.Esp contra 9); los que piden lastimar son los Dardos envenenados (Común, 1d6+3). Nueva propuesta: **1d6
  directo a la vida** (busca el hueco de la armadura) y **Veneno ×5** aunque no lastime; Res.Esp contra su Destreza solo para el veneno.
  **El dueño, para la del catálogo (2026-10-27):** «que la aguja del catálogo tire un D8 con perfora 1 y efectivamente envenene si pasa algún punto de
  daño, que va a ser casi siempre». Cuenta: con Perfora 1, 1d8 pasa una Defensa D con (9 − D)/8: Defensa 4 → 63 %, 5 → 50 %, 14 → 0 (el grupo de
  El origen: Larry 4, Bizzante 5, Rockardo 14). ~~A confirmar~~ **Esa cuenta estaba mal** (la hice como si Perfora le bajara la Defensa): Perfora N =
  N puntos del golpe pasan siempre la Defensa (dueño, 2026-10-27: «un punto de daño, si perfora uno, pasa ignorando la armadura»; así está programado
  desde el 2026-10-10, `Combatiente.perforaPasa`). Con Perfora 1, cada aguja deja al menos 1 de daño → **el veneno entra siempre** (salvo que lo resista
  con la Res.Esp). *Mecánica nueva:* una trampa con Perfora (hoy no existe).
  **Sin resistencia** (dueño, 2026-10-27: «si la aguja lastima, el veneno entra siempre»): la Aguja (la del catálogo y la de creep) no tiene tirada para
  el veneno; con Perfora siempre lastima, salvo que el golpe lo absorba entero un escudo (P227).
  **Detectarla** (aclaración al dueño): solo tiran quienes tienen Percepción aumentada, Pisada atenta o Desarmar trampas (al pasar al lado), o con una
  luz que revela; el resto no tira.
- 🏹 **H4. Mina del cazador** — **definida** (dueño, 2026-10-27: «2 de 6 más 2, directo a la vida, y que sí lo resiste la resistencia al fuego, eso sí le
  reduce el daño. El resto está bien»): 1 casilla (fuera de la vista de los rivales); explota en la flor de 7 (también a sus aliados); **2d6+2 de fuego
  directo a la vida** (no lo frena la Defensa; **la Res. fuego le resta**); **Pajaritos 2 turnos**, Res.CC contra la Destreza del creep solo para eso.
  **2 No2 y 3 SP, o cooldown 3.**

**Costos que faltaban (propuestos el 2026-10-27, sin objeción del dueño):** Red tendida y Cepo del cazador, cooldown 3; Cebo, 1 No2 y 2 SP, o cooldown 3.

**Tanda cerrada (2026-10-27): 4 y 4** — Rango y Hunter: Red tendida, Cebo, Cepo del cazador, Mina del cazador · Choque liviano: Aguja en el piso,
Abrojos, Cordón oculto, Polvo cegador. ~~H5. Arrear~~ descartada. **Para programar (cuando el dueño diga)**, además de las 8: una trampa con Perfora (la
Aguja del catálogo: 1d8, Perfora 1, veneno si lastima), el veneno por golpe sin tirada (P228: Dardos y Espina de mantícora), Escudo y Vida extra
(P227, con el Relicario de sangre), la dificultad = la Destreza del que coloca (Red), el Inmovilizado «hasta el final de la ronda y una más», correr 1
hacia adelante al caer (Cordón), y el Cebo (atraer con Res.Mt cada turno, 3 turnos, la roca pintada).

**Límite de trampas activas (regla del dueño, 2026-10-27):** «para las trampas que se colocan con skill, vamos a poner un límite de trampas activas igual
al nivel del creep. Si se coloca una por encima de ese número, el creep o el jugador también… debe elegir cuál desarma en su lugar». Vale para creeps y
personajes (y se entiende que también invocaciones): las trampas de habilidad **sin disparar** de quien las pone, como mucho **su nivel**; al colocar una de
más, elige en el mapa cuál de las suyas se desarma (se borra sin dispararse). Las consumibles no cuentan. Para programar con la tanda.
**Corrección (dueño, 2026-10-27):** «tantas como su nivel más 1. Y eso por cada tipo de trampa. Si tenés dos trampas distintas, podés tener ese número de
cada tipo»: el límite es **nivel + 1 por cada habilidad de trampa** (un creep de nivel 3 con Cepo y Red: hasta 4 cepos y 4 redes); al pasarse, elige cuál
de ese mismo tipo se desarma.
Las invocaciones, igual (confirmado por el dueño).
- 🏹 ~~**H5. Arrear**~~: un disparo que lo empuja 2 hacia donde elija el creep. El dueño: «¿no existe ya algún tiro que desplace dos casillas para atrás?» —
  sí, **Mantener a raya** (lo empuja 2 lejos del tirador y Lento 2 turnos). Lo único distinto sería elegir la dirección.
- 🗡 **L2. Abrojos** — **definida** (dueño, 2026-10-27: «va así y el rengo se aplica independientemente de si el daño lo para o no la armadura. Porque se
  le pegan abrojos a los pies»): flor de 7 (fuera de la vista de los rivales; la dispara pisar cualquiera de las 7, alcanza a todos los de encima);
  **2d6+2 menos su Defensa**; **Rengo 2 turnos aunque la armadura pare el daño** (no pide lastimar); Res.CC contra la Destreza del creep, solo contra el
  Rengo; **quedan 3 turnos** y cada paso sobre ellos renueva el Rengo sin tirar (`renuevaPaso`, como la Brea). 2 No2 y 2 SP, o cooldown 3.
- 🗡 **L3. Cordón oculto** — **definida** (dueño, 2026-10-27: «que se llame cordón oculto… al pisarlo se mueve uno para adelante y cae sentado. No se hace
  daño. Y tiene que tirar agilidad para no caer sentado… si pierde, cae del otro lado de la trampa en la misma dirección en la que venía caminando y queda
  sentado. Tiene que ser barata porque el efecto es leve. Un nitro, un SP. Podemos ponerle 2 SP igual»): línea de 3 (fuera de la vista de los rivales);
  al pisarla tira **Agilidad** (contra la Destreza del creep, como las demás); si pierde, **avanza 1 casilla en la dirección en que venía** (cae del otro
  lado) y queda **Sentado**; sin daño. **1 No2 y 2 SP.** *Mecánica nueva:* la trampa que lo corre 1 hacia adelante (si esa casilla está ocupada o es
  sólida, cae donde está).
  **Ajuste (dueño, 2026-10-27):** «3 SP y el largo tiene que ser de 4, no de 3» → **línea de 4, 1 No2 y 3 SP** (cooldown 2, la propuesta). **Cómo se ve**
  (dueño: «como una línea de un color claro y bordes negros bien saturada para que se vea, y en cada extremo algo que haga referencia como a una estaca
  donde está anotado el cordón y que se vea cierta tensión cada X cantidad de segundos, como que se mueve un poco el cordón»): un cordón claro con borde
  negro bien marcado entre dos estacas (una en cada punta) que cada tantos segundos vibra un poco, tenso, **y además el contorno de puntos de las 4 casillas**
  (dueño: «reforzado por la línea de puntos para tener bien claro el área»). Lo ven quienes ven la trampa (su equipo, o
  todos cuando se descubre o se dispara).
- 🗡 **L4. Polvo cegador** — **definida** (dueño, 2026-10-27: «va bien»): una bolsita en 1 casilla (fuera de la vista de los rivales); al pisarla, el polvo
  alcanza la flor de 7 alrededor: **Ceguera 1 turno** a todos los de adentro; **Res.CC contra la Destreza del creep** para no tragárselo; sin daño.
  **1 No2 y 2 SP, o cooldown 3.**

**El Cebo, dos formas para elegir:**
- **A. Al instante** (como Arrastrar): pone el cebo (algo brillante, comida, un quejido) en una casilla de su Rango; los rivales que lo ven y están a 4 o menos
  tiran Res.Mt contra la Destreza del creep; el que pierde **camina ya hasta 3 casillas hacia el cebo** (gratis, sin oportunidad), y si en el camino hay
  una trampa, la pisa y se frena ahí. Una sola tirada, se resuelve en el turno del creep.
- **B. Que se queda** (como una zona): el cebo queda 2 turnos; **al empezar su turno**, cada rival que lo ve tira Res.Mt; si pierde, su primer movimiento
  tiene que ser hacia el cebo (hasta 3 casillas, pagando sus No2), y lo que pise en el camino lo toca. Se termina cuando alguien llega a la casilla.

## 4. Casters — las ideas del rol

Ya cubierto al entrar (2026-10-21): ninguna habilidad de caster auditada; en el mapa, los hechizos dirigidos y de área (cascada, dodge roll), conos,
líneas, zonas, el rayo en cadena y los charcos, los controles mentales.

- **Mago (daño directo):** proyectil mágico, ✅ **Bola de fuego** (2026-10-21), ✅ **Hálito polar** (cono de frío, 2026-10-23), ✅ **Cadena de rayos** (2026-10-21), ✅ **Muro de fuego** (2026-10-24: largo a elegir, 4 a 8,
  con el costo según el largo).
- ✅ **Misiles elementales** (2026-10-25; dueño: «un misil elemental, uno por cada uno de los tipos de daño… atado a la identidad de cada uno de los
  elementos y que se sienta»; «un skill por cada elemento y un skill que sea misil elemental que te deje elegir, pero que cueste un nitro más y 2 SP más»;
  «el eléctrico, Centella»): **Misil arcano** (directo), **Lengua de fuego** (fuego, Quemadura), **Dardo helado** (hielo, Escarcha 1 + 1 cada 5), **Centella** (no se
  esquiva, 1d6 que salta, 50 % de Parálisis si no la resiste con Res.Esp), **Mancha corrosiva** (ácido, Armadura rota 1 + 1 cada 5), **Ponzoña** (tóxico,
  Veneno 2 + 1 cada 5) y **Misil elemental** (elige el elemento al lanzarlo; 1 No2 y 2 SP más). Base: PdG.Esp contra Evasión, 2d6 + ¼ Ef.Esp; 2 No2 y su
  Especial en SP, o cooldown 2. Cuentan como un concepto del Mago.
- **Mago — ideas nuevas (2026-10-24, la lista que pidió el dueño; ✦ = acelera la pelea):**
  - **A. Daño concentrado:** 1. ✅ **Lanza de luz** ✦ (2026-10-25: línea tan larga como su Rango, desde él, también a sus aliados; su PdG.Esp contra la Evasión de cada uno; 3d6 arcano y **Deslumbrado** —Res.Esp −2— 2 turnos). 2. ✅ **Andanada arcana** (2026-10-25: 3 misiles de 1d6 + ¼ Ef.Esp
    arcano, de a uno, al objetivo que elija cada vez). 3. ✅ **Descarga arcana** ✦ (2026-10-24, ex «Rayo cargado»: un turno lo carga a la vista de todos y queda Marcado —«una luz lo recubre», se lo ve en la niebla—; al siguiente,
    4d6 arcano; 10 de daño se lo cortan).
  - **B. Áreas que se anuncian y terreno:** 4. ✅ **Meteoro** ✦ (2026-10-24: una sombra de diámetro 5 en su Rango; al empezar su próximo turno cae: dodge roll
    para todos los de adentro —aliados incluidos—, 4d6 físico y 2d6 de fuego directo al que sigue adentro; cooldown 3 que arranca activo). 5. ✅ **Lluvia de escarcha** (2026-10-25, reemplaza a «Suelo helado»): área de diámetro 5 en su Rango, PdG.Esp contra Evasión (dodge roll), 2d4 + ¼ Ef.Esp
    de hielo; el suelo congelado 2 turnos (el de la Varita de la ventisca) y después el charco, que no vence. 4 No2 y su Especial en SP, o cooldown 3.
    6. **Diluvio** (deja charcos: el rayo corre por el agua, combo con la Cadena de rayos).
    7. ✅ **Nova arcana** (2026-10-26: onda alrededor, PdG.Esp contra la Evasión de cada rival; 2d6 arcano y lo empuja 2).
  - **C. Control elemental:** 8. ✅ **Prisión de hielo** (2026-10-26: PdG.Esp contra Evasión, 2d4 de hielo e Inmovilizado hasta 2 turnos, se suelta con Fuerza contra su Ef.Esp, como la Red; 2 No2 y 3 SP, o cooldown 3). 9. ✅ **Ráfaga de viento** (2026-10-26: cono al frente, PdG.Esp contra la Evasión; 1d6 arcano, lo empuja 3 y queda Sentado).
    10. ✅ **Zap** (ex «Rayo paralizante», 2026-10-25: no se esquiva; 1d4 eléctrico directo y Parálisis salvo que la resista con Res.Esp; salta con la mitad, 50 % y 25 % de Parálisis).
  - **D. El cuerpo del mago:** 11. **Escudo de maná** (un escudo que se paga con SP). 12. ✅ **Parpadeo** (2026-10-26: Flash, hasta 3 casillas a una libre, sin ataques de oportunidad; 2 SP o cooldown 2).
    13. **Contrahechizo** (Flash: al ver una habilidad de un personaje, la frena con su Res.Esp).
  - **E. Debilidad y sobrecarga:** 14. **Marca elemental** (el objetivo queda vulnerable a un elemento: Res. −2; se cruza con las debilidades por tipo de
    criatura, pendientes). 15. **Sobrecarga** ✦ (pega mucho más y se lastima o pierde SP). 16. **Robar maná** (le saca SP al objetivo y lo suma).
  - **F. Sacadas de las varitas y báculos** (2026-10-25, a pedido del dueño: «hacé una comparación con las varitas y báculos que diseñamos y fijate si hay alguna idea que no esté en los skills… cosas más de control, por ejemplo portal, y un poco de support, por ejemplo levitar»). Entre corchetes, la varita o el equipo de donde sale.)
    17. ✅ **Proyectil de piedra o hielo físico** ✦ (**Cascotazo**, 2026-10-26: PdG contra Evasión, 2d6 + Ef.Esp físico, critica como Tipo 10, Demora 2): una púa o un canto rodado que se tira con PdG y critica como un arma (Tipo 4 o 10), con Escarcha o Demora
    [Varita de la púa de hielo, Varita del canto rodado]. 18. **Lluvia de piedras**: un área física que critica, con Sentado [Lluvia de cascotes, Granizo].
    19. **Toque a quemarropa** ✦: mucho daño pegado al rival, que baja por cada casilla de distancia [Varita de la pelea cercana].
    20. **Campo de estática**: aparece bajo los pies (no se esquiva) y queda un turno: cada rival que lo pisa, daño eléctrico y chance de Parálisis
    [Varita del campo de estática]. 21. **Camino de lava**: un camino de casillas que arde unos turnos [Varita del chorro de lava].
    22. **Runa explosiva**: una trampa mágica oculta que el mago deja en el piso [Varita de la runa]. 23. **Campo de espinas**: casillas que lastiman al
    pisarlas [Varita de espinas]. 24. **Muro o pilares** ✦: levantar piedra que tapa el paso y la vista (control del terreno) [Varita del muro, Varita de
    los pilares]. 25. ✅ **Portal trampa** ✦ (2026-10-25: sin daño; llega Expuesto): un portal oculto que manda a quien lo pisa a otra casilla, lejos (Res.Esp para aferrarse) [Varita de la trampa
    portal]. 26. **Lazo arcano**: lo atrae unas casillas hacia el mago, salvo que gane con Fuerza [Varita del gancho]. 27. **Desarmar con magia**: el arma
    se le escapa y vuela (Fuerza para aferrarse) [Expelliarmus]. 28. ➡ **Sanguijuela** (pasó al Debuffer, ver ahí; 2026-10-26, dueño: PdG.Esp contra Evasión, 2d6 siniestro, se cura la mitad; queda pegada 4 turnos —no se cura— y se la arranca con Fuerza contra su Ef.Esp): daño y se cura la mitad [Varita sanguijuela]. 29. **Cosecha**: lo
    marca; si muere marcado, el mago recupera SP y vida [Varita de la cosecha]. 30. **Magia inestable** (variante de la Sobrecarga): más daño, pero si sale
    un 1 se lastima [Varita inestable, Orbe salvaje].
- **Debuffer:** ver el listado completo abajo (§ 6).
- **Support:** ver el listado completo abajo (§ 5).
- **El costo de las que suman Efecto especial:** P216 (la página para la mesa: https://claude.ai/artifact/C7VPwWPg9BpWfF1L1hUGb6).

**Skills de clase, para tener en cuenta** (2026-10-26, dueño: «incorporá a la lista los skills de clase, para tener en cuenta. Eso en todos los
tipos y clase»): las de Mago, con el original tal cual (o, si no tiene, lo que hace hoy). ✅ = ya tiene su versión
de creep · ≈ = hay una parecida · ⏸ = anotada para más adelante.
- **Invocar portal**: Invocás DOS portales de teletransporte en dos puntos dentro de tu Rango (transitables a pie). Duran 3 turnos (X, a definir en mesa). Solo los ALIADOS los usan: al pisar uno, aparecen en el otro. ⚙ Automatizado: al ejecutarla el…
- ≈ **Chispazo** → Misil arcano: «Chispazo [1] — NO2: (1). Dispara un proyectil T6 P1 (1d6) que ignora armadura.»
- **Rayo Mágico**: «Rayo Mágico [X] — NO2: (5). Ataca con un rayo arcano que hace daño tipo 1. Amplifica el daño en el doble de X. X no puede ser mayor a Especial.»
- **Orbe arcano**: «Orbe arcano [4] — NO2: (5). Dispara un orbe arcano que hace daño en área tipo 5. Amplifica el daño en 4. Área: flor de 1.»
- ✅ **Tormenta arcana** → Tormenta arcana (creep, 2026-10-26: 1d4+1 por proyectil, mismo costo): «Tormenta arcana [15] — NO2: (5). Provoca una lluvia de 1d20 proyectiles arcanos T4 P1 en flor de 2. Caen aleatoriamente sobre todos los objetivos posibles. Esquivable solo con dodge roll.»
- **Ráfaga arcana**: «Ráfaga arcana [2] — NO2: (3). Dispara una ráfaga arcana que hace daño en área tipo 3. Área: cono de 3 al frente.»
- **Toque mágico**: «Toque mágico [3] — NO2: (4). Requiere un toque físico con la mano o el arma, usando PG contra Evasión. No se puede bloquear. A distancia melé, hace 3d T6 + ESP de daño mágico.»
- ≈ **Carga Elemental** → los Misiles elementales y las Armas elementales: «Carga Elemental [X] — Modifica un skill de daño mágico para que tenga propiedades elementales. Cada nivel en este skill otorga nuevos elementos. X es la mitad del coste del skill. Elementos: Fuego +50% de daño. Frío -1 No2 cada…»
- **Armadura arcana**: «Armadura Mágica [5] — NO2: (3). Crea una armadura mágica que reduce el daño recibido en un 50% (máximo 10). Cuando termina el efecto, hace daño mágico en área de flor igual al daño absorbido. Duración: 2 turnos.»
- **Telekinesis** (en pausa): SP 15. No2 3. Hechizo. Mueve y controla un objeto con la mente; puede arrebatar el arma a un enemigo con Esp/Fue y atacar con ella (ESP como PG y como daño). 1 SP por cada No2 que use para atacar o mover el objeto. Controlado el…
- **Control Mental** (en pausa): SP 7. No2 3. Hechizo. Tira Esp contra (Esp + Res.M) de otro personaje. Si gana, lo controla y lo obliga a cualquier acción que no lo dañe a sí mismo. Pagás 1 SP y 1 No2 por cada No2 que gaste el controlado.

## 5. Support — el listado completo (2026-10-21)

**Son conceptos de diseño** (dueño, 2026-10-21): cada vez que toque una habilidad de support se explora uno de estos (y se marca ✅ el que quede
cubierto). Pedido del dueño: arrancar por las que **aceleran la pelea** (que se resuelva atacando, no aguantando), sin curar ni proteger; y tener a mano todas
las posibilidades del rol. ✦ = acelera la pelea. Lo que ya existe en el mapa para personajes (Empower, Re-roll, Enyetar, Marcado, Turno libre,
Llamar refuerzos) se puede reusar. Hoy ninguna habilidad de support de creep está auditada; las que hay son casi todas «a mano».

✅ **Devolver el daño** (dueño, 2026-10-21: «un buff que le da a un aliado Espinas y otro que le da Espejo»; hecho el 2026-10-24): **Coraza de púas**
(Espinas) y **Velo espejado** (Espejo), a él o a un aliado en su Rango, 3 turnos. Ya cubierto: ✅ **Arma elemental** (concepto 3, 2026-10-21: Arma ígnea, helada, eléctrica, ácida y venenosa).

**A. Potenciar el golpe de los aliados** ✦
1. ✅ **Grito de guerra** (2026-10-23): **¡A la carga!** (+2 a la PdG, PdG.Esp, daño y Ef.Esp, 2 turnos) y **Arenga** (Bendecido, +1 a todo, 3 turnos),
   a los aliados a 4 casillas o menos. Síntesis de los cuatro gritos de «El origen» y de los dos de fábrica a mano, que salieron del pool.
2. ✅ **Bendecir el arma** (2026-10-24, dueño: «que tenga flash»): Flash (en turno ajeno, el doble); a él o a un aliado en su Rango, **Arma bendecida**:
   su próximo ataque con arma suma un dado del Tipo de su arma (se va a los 2 turnos si no ataca).
3. ✅ **Arma elemental**: el arma de un aliado pega de fuego, hielo o rayo por unos turnos — **Arma ígnea / helada / eléctrica / ácida / venenosa**
   (2026-10-21: +1d4 del elemento por golpe, 3 turnos, y lo de la Carga Elemental).
4. **Filo envenenado / sangrante**: los golpes de un aliado dejan Veneno o Sangrado.
4c. ✅ **Provocar para un aliado** — **Tirar la bronca** (hecha el 2026-10-26: radio 3, Provocado 2 turnos, 2 No2 y 4 SP; el Anuncio y el brillo; idea del dueño, 2026-10-26: «elija algún aliado y hay algún efecto en área alrededor de ese aliado que todos los que son afectados
    tienen que tirar resistencia mental para no ser provocados por el aliado que selecciona el support, y quedarían provocados durante N cantidad de turnos»):
    elige un aliado en su Rango (el tanque); los rivales a 2 casillas o menos de él tiran Res.Mt contra el Ef.Esp del support y, si no la resisten, quedan
    Provocados por ese aliado N turnos. Ojo: hoy el Provocado es «a mano» (no guarda quién provocó); para automatizarlo hace falta que lo sepa.
4b. ~~**Arma sombría**~~ ✗ **Descartada** (dueño, 2026-10-31: «la vamos a borrar porque es redundante con la del Debuffer», la Aguja siniestra; de paso: Punto débil no se acumula, reaplicarlo renueva los 2 turnos, y las Armas elementales no conviven, una reemplaza a la otra). Lo que era: (para más adelante; dueño, 2026-10-26: «un encantamiento que le puede dar a un arma de un aliado… que le suma el mismo efecto de este skill [la Aguja siniestra] al ataque de un aliado durante X cantidad de turnos… lo vamos a dar al support»): a un aliado en su Rango, sus golpes con arma dejan Punto débil (−1 a las resistencias a crítico) unos turnos, como las Armas elementales.
5. ✅ **Ojo certero** (2026-10-24): a él o a un aliado en su Rango, Crítico frecuente +2 y Crítico potente +2 durante 2 turnos completos de quien lo
   recibe (la marca `turnosCompletos`: el turno en que se lo dan no cuenta, aunque sea el suyo).
6. ✅ **Armas perforantes** (ex «Abrir la guardia», 2026-10-25; dueño: «un skill de support no trabaja sobre rivales, sino sobre aliados»): a él o a un aliado en su Rango,
   el estado del mismo nombre 3 turnos completos: en cada golpe que da, 3 puntos pasan siempre la Defensa y 3 la Defensa especial del rival.
7. ✅ **Empujón de creep** — **Empuje** (2026-10-26, el Empower de la clase: Flash, +3 a la próxima tirada de él o de un aliado en su Rango; esa tirada lo gasta).

**B. Concentrar el fuego** ✦
8. ✅ **Señalar la presa** ✦ (2026-10-25; dueño: «menos 2 a Evasión y más 4 al daño»): su PdG.Esp contra la Res.Esp de un rival en su Rango; si gana,
   **Presa señalada** y **Marcado** 2 turnos (−2 Evasión; todo el que lo ataca le hace +4 de daño; brilla, se ve a pesar de la niebla y no se esconde). La Presa del Disparo señalador (−1 / +2) sigue aparte. 1 No2 y 2 SP, o cooldown 3.
9. **Sed de sangre**: el aliado que derriba a alguien vuelve a atacar.
10. **Remate en grupo**: más daño contra un rival herido o que ya recibió un golpe esta ronda.

**C. Más acciones** ✦
11. **Orden de ataque**: un aliado ataca ya, fuera de su turno (o su próximo ataque no cuesta No2).
12. ✅ **Redoble de tambores** (2026-10-25): a sus aliados a 4 casillas o menos (no a él), +2 No2 su próximo turno y −1 a cada cooldown activo de los
    que trabajan con cooldown (no con SP).
13. **Adrenalina**: a un aliado se le baja el cooldown de una habilidad (vuelve a usar la fuerte). ⏸ Para más adelante (dueño, 2026-10-26: «anotala en la lista para trabajar en el futuro»). Propuesta guardada: a un aliado en su Rango, +1 PdG ese turno y, si trabaja con cooldown, −2 a cada cooldown activo; si trabaja con SP, recupera 4 SP (sin pasar su máximo) — o, la variante, su próxima habilidad de este turno le cuesta 3 SP menos. 1 No2 y 2 SP, o cooldown 3.
14. **Canalizar**: le pasa SP a un aliado caster.
15. ≈ **¡Ahora!** → Envión (2026-10-26: sube 1 lugar, con un escudo de 10): un aliado juega justo después del support en el orden de turnos (sube su iniciativa; hoy Emboscada de manada).
16. **Prisa**: un aliado se mueve gratis unos casilleros y ataca más barato.

**D. Debilitar para que rematen los otros** ✦
17. **Exponer**: el objetivo pierde Defensa o Evasión contra todos unos turnos.
18. **Disipar**: le saca a un rival el Escudo especial o un buff.
19. **Sin escapatoria**: el objetivo no se puede alejar (Rengo, o la oportunidad le sale a todos).

**E. Apuestas** ✦
20. ✅ **Frenesí inducido** (2026-10-25): a él o a un aliado, Frenético 2 turnos completos (+3 PdG, +5 al daño, −2 Evasión, −2 Defensa) y cura 4
    al ponérselo y al empezar cada uno de sus turnos.
21. **Pacto de sangre**: un aliado gana daño y pierde vida cada turno.
22. **Compartir fuerza**: el support da vida, No2 o SP propios a un aliado (hoy, a mano).
23. **Último aliento**: un aliado que cae hace un último ataque.
24. **Martirio**: si cae el support, los aliados entran en furia.

**F. Auras, estandartes y tótems**
25. **Aura de mando**: los aliados cerca del support pegan mejor mientras esté de pie (hoy, a mano) ✦.
26. ✅ **Estandarte de guerra** ✦ (2026-10-24): clava un estandarte en una casilla dentro de su Rango; sus aliados a 3 casillas (diámetro 7) suman +3 PdG y +5 al daño
    mientras siga en pie (10 de vida por nivel, sin defensas ni resistencias); dura hasta que lo rompan; uno por creep. Falta el Tótem.
27. **Lazo**: cuando un aliado vinculado pega, el support se cura (o al revés).

**G. Reacciones (en el turno del rival)**
28. **¡Ahora, dale!**: cuando un aliado acierta, el support le suma un dado al daño (Flash) ✦.
29. **¡Cuidado!**: cuando un aliado es atacado, le suma Evasión.

**H. Curar y proteger** (para más adelante)
30. ✅ **Curar** (2026-10-23): **Sanar** (1d6+4), **Oleada sanadora** (1d6+4 a sus aliados de una flor de 7, más cara), **Bálsamo** (Regeneración 4 × 3
    turnos), **Círculo de sanación** (zona de diámetro 5) y **Aura sanadora** (diámetro 11 alrededor de él): estas dos, 4 de vida fijos a todos sus aliados
    al ponerlas y al empezar cada turno suyo, 4 veces, con burbujitas verdes. Síntesis de las de «El origen» y fábrica.
31. Escudo especial a un aliado, Formación, Círculo de protección, Aura de protección.
32. Recibir el golpe por otro (también es del tanque).
33. ✅ Limpiar estados de un aliado — **Purificar** (2026-10-25, Flash): le saca el estado malo más reciente y lo cura 5.
34. Levantar a un caído (con Titilando, como el ✚ Revivir).
35. Inmunidad a control por un turno.

**I. Llamar y reacomodar**
36. Llamar refuerzos (ya automatizado), Brotes.
37. Cambiar de lugar con un aliado, ✅ llevarlo al lado de un rival ✦ (**¡Al frente!**, 2026-10-26), Señal de retirada.
**J. Sacadas de las varitas y el equipo** (2026-10-25, a pedido del dueño: «hacé una comparación con las varitas y báculos que diseñamos y fijate si hay alguna idea que no esté en los skills… cosas más de control, por ejemplo portal, y un poco de support, por ejemplo levitar»). Entre corchetes, la varita o el equipo de donde sale.)
38. ✅ **Levitar** ✦ (idea del dueño; hecha el 2026-10-25: Levitando 2 turnos completos —flota todo el tiempo, +3 Evasión, el primer casillero gratis—): a un aliado (o a sí mismo) lo hace flotar unos turnos — pasa por encima del terreno, las zonas del piso y las trampas,
    no lo alcanza lo que está en el suelo — y algo más (por ejemplo +1 Evasión o moverse 1 casilla gratis) [Zapatillas de levitación].
39. **Portal para los suyos** ✦: dos portales a la vista que usan solo sus aliados, hasta su próximo turno [Varita del portal aliado].
40. **Teletransportar a un aliado**: lo lleva unas casillas, a una libre (rescatarlo o ponerlo al lado de un rival) [Varita del blink].
41. **Cobertura**: levanta pilares o un muro para que los suyos se cubran [Varita de los pilares, Varita del muro].
42. ✅ **Luz para los suyos** (2026-10-26, rehecha el mismo día: un destello instantáneo de diámetro 5, sin zona; a los rivales de adentro, Marcado 2 turnos sin tirada y sus trampas a la vista; Ef.Esp contra Res.Esp, 1d8 de luz directo, sin dodge): una luz que revela lo oculto y deja Marcados a los rivales que toca [Varita de la luz, Varita del farol, Luz flotante].
43. **Escudo al acertar**: cada vez que gana una tirada de PdG.Esp, Vida extra para él o un aliado [Orbe del custodio, Orbe de resguardo].
44. **Magia del caos a favor**: tira un dado y, a un aliado, le cae un buff al azar (con riesgo de que salga al revés) [Varita del caos].

**Skills de clase, para tener en cuenta** (2026-10-26, dueño: «incorporá a la lista los skills de clase, para tener en cuenta. Eso en todos los
tipos y clase»): las de Support, con el original tal cual (o, si no tiene, lo que hace hoy). ✅ = ya tiene su versión
de creep · ≈ = hay una parecida · ⏸ = anotada para más adelante.
- ✅ **Empower** → Empuje: «Empower [2] — NO2: (0). +3 a cualquier tirada propia o de un aliado.»
- ≈ **Blessing** → Arenga (Bendecido): «Blessing [5] — +1 fijo en todas las tiradas por 2 turnos.»
- ✅ **Heal** → Sanar: «Heal [2] — NO2: (1). Cura 4 + 1d6 HP.»
- **Shield**: «Shield [2] — Flash (SP x 2). Otorga un blindaje temporal que absorbe 14 de HP hasta el final del turno.»
- **Acelerador**: «Acelerador [1] — Marca una casilla con flechitas para adelante (>>). Cada aliado que la pisa obtiene +2 No2 (máximo una vez por turno). Duración: 10 turnos.»
- **Endurecimiento**: «Endurecimiento [5] — Otorga una armadura temporal: Defensa 3, Res. Mágica 3, reduce críticos de todo tipo. Duración: 2 turnos.»
- **Re-roll**: «SP 2. Flash. Permite rerolear tiradas aliadas. Lento. (2026-10-12: absorbió a Afortunado, una skill nueva del Support que hacía lo mismo y se quedaba con la mejor.)»
- ✅ **Smite** → Smite: «Smite [1] — NO2: (1). Rayo de daño holy inesquivable que causa 1d4 de daño.»
- **Ojo de Kicillof**: Invocás, en una casilla dentro de tu Rango y que veas, un ojo volador etéreo que movés vos: Movimiento 5 y dura 2 turnos (entra al orden sin mareo); al cumplirlos, desaparece. Ve en una flor de diámetro 5 alrededor suyo, para…
- **Transferir SP** (en pausa): SP 1. Transfiere 1d6 SP entre vos y un aliado.
- ⏸ **Adrenalina** (en pausa) → Adrenalina, anotada para el futuro (docs/pendientes.md): SP 5. +1 a Destreza, Fuerza y Agilidad durante 2 turnos. Acumulable. Lento.
- **Marca del cazador** (en pausa): SP 3. No2 1. Un aliado dentro de tu Rango recibe Crítico frecuente ×1 durante 2 turnos (baja 1 el rango de sus críticos; mínimo 2). ✋ A mano: dale el estado \

## 6. Debuffer — el listado completo (2026-10-21)

**Son conceptos de diseño** (dueño, 2026-10-21): cada vez que toque una habilidad de debuffer se explora uno y se marca ✅. ✦ = acelera la pelea (le abre
la puerta a los demás). Los estados que ya existen y se pueden usar: Debilitado, Extenuado, Atormentado, Maldito, Silencio, Ceguera, Miedo, Pajaritos,
Lisiado, Expuesto, Marcado, Presa, Lento, Cansado, Exhausto, Escarcha, Armadura rota, Veneno, Sangrado, Quemadura, Confusión, Stun, Parálisis, Demora,
Inmovilizado, Rengo, Desarmado; y, de personajes, Enyetar.

**A. Bajar números**
1. ✅ **Debilitar** — **Maldición debilitante** (2026-10-26, la de la clase: PdG.Esp contra Res.Esp; 1d6 siniestro, Debilitado 2 turnos y Lento 2 turnos; reemplaza a la vieja Debilitar a mano): el objetivo pega menos (Debilitado, que se apila).
2. **Torpeza**: menos Probabilidad de Golpe.
3. ✅ **Exponer** ✦ — **Aguja del desamparo** (2026-10-24): un proyectil, su PdG.Esp contra la Evasión de un rival en su Rango; si pega, 1d6 arcano directo y
   Expuesto hasta su próximo turno (la Evasión a la mitad y sin reacciones que cuesten No2). 2 No2 y 3 SP, o cooldown 3.
4. ✅ **Maldición de la coraza** ✦ (2026-10-24): su PdG.Esp contra la Res.Esp de un rival en su Rango; **Coraza maldita**, −2 Defensa y −2 Defensa
   especial 3 turnos. Reemplaza a la vieja Maldición (a mano).
5. **Mano temblorosa**: menos Crítico frecuente y potente.
5b. ✅ **Punto débil** — **Aguja siniestra** (2026-10-26, el Punto débil de la clase: PdG.Esp contra Evasión; 1d6 siniestro directo y −1 a todas las resistencias a crítico 2 turnos).

**B. Quitarle recursos**
6. ✅ **Drenar No2** — **Robar el aliento** (2026-10-26: PdG.Esp contra Res.Esp; 1d6 siniestro y pierde 2 No2 + la diferencia, sin tope; en 0, Sentado): pierde No2 (y si queda en 0, Sentado, como el Sonic Boom).
7. ✅ **Extenuar** (2026-10-25): PdG.Esp contra Res.Esp; 2d4 arcano y Extenuado 2 turnos (todo lo que cuesta No2 le cuesta 1 más).
8. **Drenar SP**: pierde SP, y el debuffer quizás lo gana.
9. ✅ **Atormentar** — **Maldición tormentosa** (2026-10-26, la de clase: PdG.Esp contra Res.Esp; 1d6 siniestro y Atormentado 3 turnos): cada acción que cuesta No2 le saca vida (Atormentado).
10. **Maldición de la sangre**: usar algo que cuesta SP le saca vida (Maldito).
10b. ✅ **Maldición de la sequía** (idea del dueño, 2026-10-24; hecha el mismo día: PdG.Esp contra Res.Esp, Sequía 3 turnos, corta solo la
     regeneración propia —pasivas, equipo, SP Regen—, no la de otros: «una maldición que anule regeneración de HP y SP»): mientras dura, no recupera vida ni SP
     por turno (ni la Regeneración ni el SP Regen; quizás tampoco las curas por pulso del Círculo o el Aura). El nombre es provisorio.

**C. Control mental**
11. ✅ **Confusión** (2026-10-21).
12. **Susurros de locura**: Confusión en un área.
13. ✅ **Grito de pánico** (2026-10-25): onda de 3 casillas a sus rivales; PdG.Esp contra Res.Mt; 1d6 arcano y Miedo hasta su próximo turno.
14. ✅ **Tótem de silencio** (ex «Palabra de silencio», 2026-10-25; dueño: «un skill tipo el estandarte, pero al revés»): clava un tótem (10 de vida por
    nivel, sin defensas); sus rivales a 3 casillas (diámetro 7) no pueden usar habilidades que cuestan SP mientras siga en pie.
15. **Sueño**: no actúa hasta que le peguen o pase su turno.
16. **Dominar**: el GM decide su próxima acción (a mano; muy caro).

**D. Daño que dura**
17. **Veneno a distancia**: un dardo o un hechizo que envenena.
18. **Plaga**: un veneno que al empezar su turno contagia al que tiene al lado.
19. **Maldición que quema**: Quemadura que no se apaga con agua.

**E. Los sentidos**
20. ✅ **Cegar** (2026-10-25): PdG.Esp contra Res.Esp; 2d4 arcano y Ceguera 1 turno (ve 2 casillas; su PdG a la mitad).
21. **Ensordecer**: no oye a los que vienen por la espalda (sin el aviso de darse vuelta).
22. **Bruma**: una nube que tapa la vista.

**F. Contra el sigilo**
23. **Revelar**: los que están en sigilo en un área quedan Marcados.
24. **Aura de silencio**: en el aura no se puede usar sigilo.

**G. El orden de turnos**
25. **Retrasar**: baja uno o dos lugares en el orden (Demora a distancia).
26. **Ralentizar**: Lento (el primer casillero doble).
27. **Robar el turno**: pierde su próximo turno (muy caro).

**H. Sacadas de las varitas** (2026-10-25, a pedido del dueño: «hacé una comparación con las varitas y báculos que diseñamos y fijate si hay alguna idea que no esté en los skills… cosas más de control, por ejemplo portal, y un poco de support, por ejemplo levitar»). Entre corchetes, la varita o el equipo de donde sale.)
28. ✅ **Nube tóxica** ✦ (2026-10-26, afinada el mismo día: 2d4 tóxico directo y Veneno 3, 4 turnos, solo a sus rivales; quedarse adentro le vuelve el Veneno a 3): una nube que queda en el piso y envenena a quien está adentro o entra [Varita de miasma].
29. **Suelo de aceite**: un área donde se resbala y queda Sentado [Varita del aceite].
30. **Arena movediza** ✦: un área bajo los pies (no se esquiva) que deja Inmovilizado; soltarse cuesta [Varita de arena movediza].
31. **Destello**: un área de luz que deja Pajaritos [Varita del destello].
32. **Portal trampa**: el del Mago, también para el Debuffer (lo saca de la pelea) [Varita de la trampa portal].
33. **Magia del caos**: a un rival, un debuff al azar, con riesgo de que salga al revés [Varita del caos].

**I′. Del Mago** (2026-10-26)
- ✅ **Sanguijuela** (pasó del Mago, dueño: «movemos la sanguijuela al debuffer»): su PdG.Esp contra la Evasión; 2d6 siniestro, se cura la mitad y queda pegada 4 turnos (no se cura; Fuerza contra su Ef.Esp para arrancarla).

**H. Romper lo que lo protege** ✦
28. ✅ **Disipar** (2026-10-25; dueño: «el usuario de disipar elige cuál quitar»): su PdG.Esp contra la Res.Esp de un rival en su Rango; si gana, le saca uno de sus estados buenos, el que elija quien lo usa (no lo del equipo ni las pasivas). 2 No2 y 3 SP, o cooldown 3.
29. ✅ **Corroer** (2026-10-25, dueño: «un ataque de daño ácido que rompe armadura»): su PdG.Esp contra la Evasión de un rival en su Rango; si pega, 2d6 ácido y la regla del ácido: Armadura rota 1, y una más cada 5 de daño que entra. 2 No2 y 3 SP, o cooldown 3.
30. **Quebrar la guardia**: no puede hacer Parry ni Bloqueo hasta su turno.

**I. Auras**
31. **Aura de miedo**: los que entran se asustan.
32. **Aura de pestilencia**: los de al lado pierden No2 al empezar su turno.
33. **Aura de debilidad**: los de adentro pegan menos.

**J. Maleficios y apuestas** ✦
34. ✅ **Mal de ojo** (2026-10-21): después de que tira, su tirada se repite y queda la peor (el Enyetar de los personajes, para creeps), con Flash y el
    botón 🧿 del GM.
35. **Maldición del espejo**: parte del daño que hace le vuelve.
36. **Lazo de dolor**: el debuffer le pasa al objetivo parte del daño que recibe.
37. **Marca de muerte** ✦: si cae mientras está marcado, el debuffer recupera vida o SP.

**Skills de clase, para tener en cuenta** (2026-10-26, dueño: «incorporá a la lista los skills de clase, para tener en cuenta. Eso en todos los
tipos y clase»): las de Debuffer, con el original tal cual (o, si no tiene, lo que hace hoy). ✅ = ya tiene su versión
de creep · ≈ = hay una parecida · ⏸ = anotada para más adelante.
- ✅ **Enyetar** → Mal de ojo: «Enyetar [5] — Maldición (Esp / Res.M). Flash. Obliga a repetir una tirada y quedarse con el valor más bajo.»
- ✅ **Confusión** → Confusión: «Confusión [5] — Maldición (Esp / Res.M). Antes de realizar un ataque o habilidad con objetivo, tira 1d4: 1) el debuffer elige el objetivo; 2) gasta los No2 pero no realiza la acción; 3) elige el objetivo al azar; 4) actúa…»
- ✅ **Maldición debilitante** → Maldición debilitante: «Maldición debilitante [5] — Maldición (Esp / Res.M). -1 a todas las tiradas. Duración: 2 turnos. Acumulable. Lento.»
- ✅ **Maldición extenuante** → Extenuar: «Maldición extenuante [3] — Maldición (Esp / Res.M). Incrementa en 1 los Nitros de todas las acciones. Debe pagar 1 Nitro para moverse cada 2 casillas. Duración: 1 turno. Acumulable. Lento.»
- ✅ **Maldición tormentosa** → Maldición tormentosa (creep, 2026-10-26: +1d6 siniestro): «SP 5. Maldición (Esp / Res.M). Por cada acción recibe daño igual a No2 - 1; paga 1 HP para moverse cada 2 casillas. Dura 3 turnos. Acumulable. Lento.»
- **Drenar vida**: «Drenar vida [X] — Tira X + 1dX. X no puede ser mayor a ESP. El objetivo tira resistencia mágica. Drena HP igual a la diferencia. El HP obtenido así puede acumularse hasta 50% por encima del máximo.»
- **Balas de sangre**: «Balas de sangre [1] — Gasta X HP (máximo ESP). Dispara un proyectil tipo 1. El peso del proyectil es igual a la vida gastada.»
- **Transfusión sanguínea**: «Transfusión sanguínea [1] — Transfiere hasta 20 de HP de un personaje aliado a otro.»
- **Veneno**: «Veneno [2] — Maldición (Esp / Res.M). Aplica 3 stacks de veneno.»
- ✅ **Nube tóxica** → Nube tóxica: «Nube tóxica [3] — Crea un área de flor que aplica 3 stacks de veneno al que entre en ella o esté en su interior durante el mantenimiento. Solo aplica 1 stack a personajes ya envenenados. Duración: 3 turnos.»
- ✅ **Punto débil** → Aguja siniestra (en pausa): SP 3. Maldición (Esp / Res.M). El objetivo pierde 1 punto de Resistencia a crítico contra todos los Tipos durante 2 turnos (un doble crítico contra él vuelve a ser doble, un crítico simple deja de anularse). ✋ A mano: ponele un…
- **Pedos Tóxicos**: Marcás un punto en el mapa y queda una nube tóxica de diámetro 5 (19 casillas) durante 2 turnos (la habilidad no falla: la nube aparece siempre). Cada rival que entra, o que sigue adentro en el Mantenimiento, tira Res.Esp contra…

