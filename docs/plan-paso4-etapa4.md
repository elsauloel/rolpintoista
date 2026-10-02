# Paso 4, etapa 4 — Las Acciones de los creeps y la Botonera de las invocaciones, en el mapa (plan)

> Parte de [`plan-paso4.md`](plan-paso4.md) y de [`plan-consolidacion.md`](plan-consolidacion.md). Sigue a la etapa 3
> ([`plan-paso4-etapa3.md`](plan-paso4-etapa3.md), la Botonera del personaje), con el **mismo método**. Escrito el
> 2026-10-01. **Estado: en curso** — ver "Cómo va" al final.

## ▶ Para retomar

**Hecho**: 4a (las reglas de un creep en `comun/creep-calculo.js`) y 4b (las Acciones nuevas de un creep las dibuja el mapa con
⚗ prendido; cada botón se le pide a GM Tools en el marco con `acciones-delegar`). Preguntas contestadas (P141, 2026-10-01):
creeps primero, el mismo interruptor ⚗, P137 espera.

**Lo próximo — 4c, mudar los botones de a uno** (como la 3c de la Botonera del personaje), del más simple al más complejo:
1. Tiradas de stats y Levantarse ✅ (2026-10-01).
2. Esquivar, Parry, Bloqueo, Fuerza del golpe, Daño ✅ (2026-10-01; el Parry pendiente del mapa vive en `acParry`).
3. Atacar (menú "¿Qué ataque es?", el objetivo con `dueloElegirObjetivoMapa`) ✅ (2026-10-01).
4. Lo que el duelo le pide a un creep (`window.DUELO_HOOKS` de `js/12`) → `comun/creep-duelo.js`, y `hooksLocal` del mapa ✅ (2026-10-01).
5. Habilidades (`js/04`: manual, semi, ✨, Flash, cooldowns `data-cdmod`, segunda tirada, trampa y zona) ✅ (2026-10-01).
6. 🔍 (`lupaHtmlCreep`, `js/03`) y Ver ✅ (2026-10-01). **La 4c está terminada.**
El mapa guarda con `modificarCreep` (transacción + resumen + firma); GM Tools, abierto en otra pestaña, se entera por la firma.

**4e — invocaciones (en curso desde 2026-10-01; el dueño pidió avanzar mientras prueba la 4d)**, por tandas como la 4c:
1. El cálculo de una invocación → `comun/inv-calculo.js` ✅ (2026-10-01). Arreglo de paso: la Defensa de una invocación ahora
   suma los estados que la cambian, como la de un creep o un personaje.
2. Dibujar su Botonera → `comun/inv-botonera.js` (`renderBotoneraInv` con la invocación como parámetro); con ⚗, el mapa la dibuja
   en la Botonera nueva del dueño (lee `S.invocaciones` con `FichaSesion`) y cada botón se lo pide a la ficha del marco ✅ (2026-10-01).
3. Los botones (tiradas de stats, Esquivar, Parry, Bloqueo, Daño, Atacar) → `comun/inv-acciones.js`; el mapa guarda la parte
   `invocaciones` del personaje con `FichaSesion` ✅ (2026-10-01).
4. Lo que el duelo le pide a una invocación (`dueloInvDe`, `js/11`) → `comun/inv-duelo.js`, en `hooksLocal` del mapa. Con los
   datos de la invocación a mano, el daño que recibe en el duelo puede dejar de ser a mano (hoy `dueloAplicarDano` lo marca
   "es una invocación"). ✅ los ganchos (2026-10-01); el daño automático queda como paso aparte.
5. Las habilidades (`invEjecutarHab` y compañía).
6. La 🔍 (`lupaHtmlInv`) y el Ver (`verHabInv`).

**4d (pendiente del dueño)**: probar las Acciones nuevas en una sesión real (el GM con ⚗ prendido, jugando un combate de verdad) y,
si andan bien, dejarlas como las de siempre (como la 3d de la Botonera del personaje). Las Acciones nuevas ya no le piden nada
a GM Tools salvo Editar / Subir / Reemplazar del Ver de una habilidad (y lo que abre "+ Estado" o el editor del creep). Después,
**4e** (invocaciones), que espera P137.

## Cómo es hoy

- **Creeps (GM)**: el ⚡ del token de un creep (o B con un creep seleccionado) carga **GM Tools entero** en el marco del mapa
  (`gm-tools.html?modo=acciones&creep=<id>`) y le esconde todo menos la ventana de Acciones (`renderAccionesCreep`,
  `gm-toolset/js/03`). Los botones (Atacar, Parry, Bloqueo, tiradas de stats, habilidades…) y lo que el duelo le pide a un
  creep (`window.DUELO_HOOKS` de `js/12`) viven en GM Tools. Las reglas del creep (stats con equipo y estados, Defensa,
  críticos, No2, costos) están en `js/01` y `js/02` (`creepStatValor`, `creepModTotal`, `creepDefensaEfectiva`,
  `creepNitrosMax`, `costoAtaqueCreep`…), y **el mapa ya tiene copias parciales** (`creepModTotalMapa`, `creepDefensaMapa`,
  `defensaCreepMapa`, `creepIniMapa`, `zonaStatCreep`).
- **Lo que ya tiene el mapa a favor**: lee en vivo la parte privada de cada creep (`creepsPriv`, solo el GM) y lo guarda con
  una transacción que también pone al día su resumen y su firma (`modificarCreep`; lo usan la vida desde el token y el No2
  al moverse). GM Tools, abierto en otra pestaña, se entera por la firma y trae el cambio.
- **Invocaciones (jugadores)**: el ⚡ del token de una invocación abre la Botonera de la invocación **dentro de la ficha del
  dueño** (`ficha.html?modo=botonera&inv=<id>`, `abrirBotoneraInv`/`renderBotoneraInv` en `ficha-personaje/js/04`, ~1240
  renglones). Su código está **duplicado a propósito** del de los creeps (`invStatValor`, `costoAtaqueInv`…), con algunas
  diferencias de verdad (P137). Viven dentro de la ficha del personaje (`S.invocaciones`), así que la Botonera nueva del mapa
  ya tiene sus datos (`bn.S`) y su guardado (`FichaSesion`).

## La forma propuesta (igual que la etapa 3)

Una Botonera/Acciones nueva al lado de la vieja, detrás del mismo interruptor ⚗; cada botón que no está mudado se le pide al
marco; cuando ya no quede ninguno, el marco deja de cargarse para eso. Cada pieza: copiada tal cual a `comun/` con el creep
(`sc`) o la invocación como parámetro, comparada contra el código viejo con cientos de casos al azar y errores plantados,
pruebas en `comun/pruebas.html`, `?v=` al día, probada en vivo y documentada.

### Creeps
- **4a — El cálculo de un creep en `comun/`** (sin cambios visibles): `comun/creep-calculo.js` con lo de `js/01`/`js/02`
  (stats con equipo y estados, Defensa, Armadura mágica, críticos, No2 máximo, costos de atacar/Parry/habilidades, Bloqueo,
  Fuerza del golpe, daño del arma, `normalizarCreep` y sus migraciones). GM Tools lo usa con sus nombres de siempre; el mapa
  reemplaza sus copias parciales por estas (se arreglan solas las diferencias que hubiera).
- **4b — Las Acciones nuevas, solo dibujar**: `comun/creep-botonera.js` (`renderAccionesCreep` con `sc` como parámetro). El
  mapa, con ⚗ prendido, las dibuja él mismo en un recuadro (como la Botonera nueva) y cada botón se lo pide a GM Tools en el
  marco.
- **4c — Mudar los botones, de a uno**: tiradas de stats → Levantarse → Atacar, Daño, Esquivar, Parry, Bloqueo, Fuerza del
  golpe → lo que el duelo le pide a un creep (`comun/creep-duelo.js`, como `ficha-duelo.js`) → habilidades (manual, semi, ✨,
  Flash, cooldowns, las que colocan trampa/zona) → 🔍 y Ver. El mapa guarda con `modificarCreep`.
- **4d — Probar y pasarla a la de siempre** (como la 3d).

### Invocaciones (después de los creeps)
- **4e** — Con el cálculo de los creeps ya en `comun/`, las invocaciones usan **las mismas reglas** donde sean iguales
  (P137 decide las diferencias) y la Botonera de una invocación la dibuja la Botonera nueva del personaje (mismos pasos:
  dibujar, mudar botones, ganchos del duelo `fichaId~invId`).

## Preguntas para el dueño (con lo recomendado)

1. **¿Creeps primero o invocaciones primero?** *Recomendado: creeps* — es lo que el GM usa en cada combate (más ganancia) y,
   una vez sus reglas estén en `comun/`, las invocaciones las reusan.
2. **¿El mismo interruptor ⚗ para las Acciones nuevas de los creeps?** *Recomendado: sí* (uno solo, "Botonera nueva": cubre
   personaje, creeps e invocaciones a medida que estén).
3. **P137 (permanente y Excedente de vida distintos entre ficha, GM Tools e invocaciones)**: hace falta decidirla antes de 4e,
   no antes de los creeps.

## Decisiones del dueño (2026-10-01, P141)
1. **Creeps primero**, después las invocaciones.
2. **El mismo interruptor ⚗** "Botonera nueva" para las Acciones nuevas de los creeps.
3. **P137, esperar**: se decide antes de las invocaciones.

## P137, decidida (2026-10-01)
"No vence": la habilidad lo marca o lo desmarca; si nunca se tocó, manda el estado — igual en personajes, invocaciones y creeps
(los creeps ganaron la casilla). El Excedente de vida que da una habilidad reemplaza al que había, en los tres. Con eso, la 4e
puede empezar.

## Cómo va
- 2026-10-01: plan escrito. Empieza la 4a (no depende de las respuestas: el cálculo de los creeps hace falta en cualquier
  orden).
- 2026-10-01: **4a hecha** (72af09a) — `comun/creep-calculo.js` (`CreepCalculo`), copiado tal cual de GM Tools (`js/01`, `js/02`,
  `js/04`): `statValor`, `modTotal`, `defensaEfectiva`, `armadmgEfectiva`, `critEfectivo`, `nitrosMax`, `costoAtaque`,
  `costoContraataque`, `costoParry`, `costoNitrosHab`, `costoHabTxt`, `defensa` (con qué para), `bloqueoValor`,
  `fuerzaGolpeValor`, `danoTxt`/`ataqueTxt`, `modoHab`/`bloqueoHab`, `habPartes`/`habTextoMesa`, los textos de "de dónde sale"
  (`statOrigenTxt`, `defensaOrigenTxt`, `critOrigenTxt`…), `actualizarHpMaxPorCon`, `actualizarNo2PorAgl`, `normalizar` y sus
  migraciones, y las tablas (`DERIVED_STATS`, `STATS_TIRADA_IDS`, `DERIVADOS_POR_ATTR`, `SLOT_MAP`, `IT2_CREEP`). GM Tools queda
  con atajos de una línea con sus nombres de siempre (`creepStatValor`, `creepModTotal`, `normalizarCreep`…). El mapa carga la
  pieza siempre y reemplaza sus copias parciales: `creepModTotalMapa`, `creepIniMapa`, `creepDefensaMapa`, `creepArmadmgMapa`,
  `defensaCreepMapa` daban lo mismo; **`zonaStatCreep` cambia** (la resistencia de un creep a una zona): ahora suma lo que sube
  el atributo (Res.Esp con los bonos de Constitución, Evasión con los de Agilidad) y el +1 de Res.Esp de los jefes, como GM
  Tools. Comparado contra el código viejo en 600 creeps de la biblioteca base con estados, equipo, escudos y datos viejos al
  azar (todos los stats, costos, textos y `normalizar`): 600 iguales, 0 distintas; 4 mutaciones plantadas, las 4 detectadas.
  `pruebas.html`: 175 en verde (4 nuevas). **En vivo** ("Test con claude elsaulo", como GM): GM Tools carga y guarda; las
  Acciones del "Creep nuevo" se dibujan igual (PdG 1d1, Daño 1d8 + 1, Esquivar 1d6, sin Parry porque no tiene arma) y sus 🔍
  abren; en el mapa, la Iniciativa (6) y la Res.Esp (1) del creep dan lo mismo que en GM Tools.
- 2026-10-01: **P141 contestada** (creeps primero, mismo ⚗, P137 espera). **4b hecha** (64031c8) — `comun/creep-botonera.js`
  (`CreepBotonera.html(sc, {parryPendiente, lupa})` → `{titulo, badge, html}`, más `formulasCombate`, `habStatTirable`,
  `habTieneSegunda`, `botonSegundaHab`, `botonHabTxt`, `cdControlesHtml`), copiado de GM Tools (`renderAccionesCreep` y
  `formulasCombateCreep` de `js/03`, `botonSegundaHabCreep` de `js/04`, `cdControlesHtml` y `botonHabCreepTxt` de `js/01`), que
  queda con atajos. En el mapa (`abrirAccionesNuevas`, `acDibujar`, `acDelegar`, `acCrear`; `abrirAcciones` sin mensaje, con ⚗ y
  siendo GM, va ahí): un recuadro aislado (`#acciones-nuevas`, shadow DOM con `gm-tools.css`) dibujado con la parte privada del
  creep (`creepsPriv`, normalizada con `CreepCalculo.normalizar`) y redibujado con cada cambio; abrir la Botonera nueva lo cierra
  y viceversa. Cada botón se le pide a GM Tools en el marco (mensaje nuevo `acciones-delegar`, `js/12`: dibuja las Acciones de
  ese creep y toca el mismo botón). Sin 🔍 y sin saber del Parry pendiente (el Bloqueo se ve "tras el Parry" aunque GM Tools ya
  lo tenga habilitado). Comparado contra el código viejo en 500 creeps al azar (con y sin Parry pendiente): 500 iguales, 0
  distintas; 4 mutaciones plantadas, las 4 detectadas (una primera sobre el cooldown 1 no se notaba porque ninguna habilidad base
  tiene cooldown 1: se cambió). `pruebas.html`: 176 en verde (1 nueva). **En vivo** (como GM, "Creep nuevo"): las Acciones
  nuevas se dibujaron en la mitad izquierda con el estilo de GM Tools; Esquivar y la tirada de Agilidad salieron en la Mesa a
  nombre del creep (las hizo GM Tools en el marco); cambiar sus No2 por la base (4 y de vuelta a 6) se vio al instante; Atacar
  abrió "¿Qué ataque es?" encima. Todo como estaba (⚗ apagado, creep con 6 No2).
- 2026-10-01: **4c, tandas 1 y 2 hechas** (d514304) — `comun/creep-acciones.js` (`CreepAcciones`), copiado de los clics de GM Tools
  (`js/06`) y de `tirarValorStat` (`js/01`), partido en tiradas (`tirada`, `tiradaStat`, `esquivar`, `parry`, `fuerzaGolpe`,
  `bloqueo(sc, parryPendiente)`, `dano` → `{origen, r}` o `{error}`) y cambios (`levantarse`, `pagarParry` → `{error}` o `{aviso}`).
  GM Tools lo usa con su creep en memoria (`publicarTiradaCreep`, `js/01`). En el mapa (`acAccionAca`, `acCambiar`, `acPublicar`,
  `acEfectosAlPegar`, `acParry`): las tiradas a la Mesa a nombre del creep con `desde: 'gm'` (`comun/mesa.js` ahora lo acepta, así
  se pintan en rojo como las de GM Tools) y avisando `tirada-registrada`; Levantarse y el Parry se escriben con `modificarCreep`
  (si la regla dice que no, se lanza el error adentro de la transacción y no se escribe nada). Comparado contra los clics viejos
  de GM Tools en 600 creeps al azar con 6 clics cada uno y los mismos dados: 600 iguales, 0 distintas; 4 mutaciones detectadas
  (una que no cambiaba nada —pasarle los estados a la Fuerza del golpe— se reemplazó). `pruebas.html`: 177 en verde (1 nueva).
  **En vivo** (GM, "Creep nuevo" con un arma y Sentado puestos para la prueba): Levantarse cobró 1 No2 y sacó Sentado; Agilidad,
  Esquivar, Parry (−1 No2, y el Bloqueo pasó a "Bloqueo · Garrote"), Bloqueo, Fuerza del golpe y Daño salieron en la Mesa en rojo
  a nombre del creep, sin ningún pedido a GM Tools. Creep restaurado (sin arma, 6 No2, sin estados). **Pendiente chico**: el
  `acParry` del mapa no se borra al atacar (Atacar todavía va al marco) ni en el Mantenimiento.
- 2026-10-01: **4c, tanda 3 hecha** (95a458e) — Atacar. `CreepAcciones.pagarAtaque(sc, tipo)` / `tiradaAtaque(sc, tipo)` (normal: Tipo ÷ 2
  el primero y suma al conteo; oportunidad y contraataque: siempre Tipo ÷ 2, no suman, con el PdG en contraataque/oportunidad del
  arma) y `CreepCalculo.alcance(sc)`, copiados de `atacarNormalCreep`, `ataqueEspecialCreep` (`js/01`) y `alcanceDeCreep` (`js/04`),
  que quedan con atajos (el confirm de "Sentado" y borrar el Parry pendiente siguen en cada pantalla). En el mapa
  (`acPreguntarTipoAtaque`, `acAtacar`, cartel `#ac-tipo-ataque` en el recuadro): el objetivo con `dueloElegirObjetivoMapa` (las
  Acciones se esconden mientras; cancelar o "Sin objetivo" las vuelven a mostrar); "Sin objetivo" cobra con `modificarCreep` y
  tira el PdG; Esc cierra primero el menú. Las tiradas que pide el duelo siguen en GM Tools (tanda 4). Comparado contra el
  código viejo en 600 creeps con 4 ataques al azar (con y sin Sentado, confirmando o no) y los mismos dados: 600 iguales, 0
  distintas; 4 mutaciones detectadas. `pruebas.html`: 178 en verde (1 nueva). **En vivo** (GM, "Creep nuevo" con 6 No2 y un
  ataque hecho): el menú mostró 8 No2 (Tipo completo) y 4 (oportunidad/contraataque); el ataque de oportunidad pasó al modo de
  elegir objetivo, "Sin objetivo" cobró 4 No2 sin sumar al conteo y tiró el PdG en la Mesa, y las Acciones volvieron. Sin
  pedidos a GM Tools. Creep restaurado.
- 2026-10-01: **4c, tanda 4 hecha** (77585b8) — `comun/creep-duelo.js` (`CreepDuelo.hooks(ui)`), copiado de `window.DUELO_HOOKS` (`js/12`)
  y de `pagarFlashCreep`/`tirarPdgDeArreglosCreep` (`js/04`): `soy`, `atacar`, `statsCritico`, `resistenciaCritico`, `efectosArma`,
  `dano`, `flashOpciones`, `flashUsar`, `habTirar`, `habValor`, `puedeParry`, `opcionesDefensa`, `defender`, `fuerza`, `bloquear`,
  `armaContra`; más `pagarFlash`, `costoFlash`, `costoFlashTxt`, `pdgDeArreglos`. `ui` = {`creep(ref)`, `cambiar(ref, fn)` (Promise;
  `{error}` no guarda), `publicar(sc, t)`, `toast`, `confirmar`, `soy`, `borrarParry`}. GM Tools: `gmDueloUi` (`js/12`, en memoria +
  `renderAll`) y `window.DUELO_HOOKS = CreepDuelo.hooks(gmDueloUi)`. Mapa: `acDueloUi`/`acHooksDuelo` (cualquier creep con token,
  GM con ⚗; guarda con `acCambiarCreep` → `modificarCreep`), en `hooksLocal: lado => bnHooksDuelo(lado) || acHooksDuelo(lado)`.
  Un cargador nuevo, `cargarPiezas(lista)`, no repite scripts entre la Botonera nueva y las Acciones nuevas (un `const` arriba no se
  puede cargar dos veces); las piezas de los creeps se cargan al prender ⚗ (GM) o al entrar con él prendido. Comparado contra los
  ganchos viejos en 400 duelos al azar (los 17 ganchos, con Flash y confirmaciones simuladas): 400 iguales, 0 distintas; 5
  mutaciones detectadas. `pruebas.html`: 179 en verde (1 nueva). **En vivo** (GM con ⚗, 🎮 Silvia con su Botonera nueva cargada): el
  creep atacó a Silvia (oportunidad) — cobró 4 No2 y tiró su PdG, Silvia eligió y tiró su Evasión, el creep falló —; después Silvia
  atacó al creep y el creep se defendió con Evasión (ganó el desempate). **Ningún pedido fue al marco** (ni a GM Tools ni a la
  ficha). Todo restaurado (creep: 6 No2, 2 HP; Silvia: como estaba antes de la prueba, 10 HP y 3 No2 — alguien la había usado —, sin
  el control; ⚗ apagado). Lo que sigue: tanda 5, las habilidades de los creeps.
- 2026-10-01: **4c, tanda 5 hecha** (fb92f01) — las habilidades. `CreepAcciones` suma `ejecutarHab(sc, h, presets)` (lo que cambia al
  creep: bloqueo por cooldown/No2, cobrar, cura y estado del sistema anterior, el atajo «solo sobre sí»; devuelve `{error}` o lo que
  hay que hacer después) y `terminarHab(sc, h, p, ui)` (Mesa, duelo, trampa, zona, "¿A quién le pegó?", el aviso), más `habEjecucion`,
  `ataqueDeHab`, `habTira`, `efectoDeHab`, `sobreSi`, `tiradaPrimeraHab`, `tiradaSegundaHab`, `zonaDeHab` y `cdMod`, copiados de
  `js/03`, `js/04`, `js/06` y `js/10`, que quedan con atajos. `ui` = {`mesaHabilidad`, `mesaConTexto`, `publicar`, `toast`, `habDuelo`,
  `lanzarAtaque`, `lanzarDuelo`, `colocarTrampa(sc, h, auto)`, `colocarZona`, `elegirObjetivo`}: GM Tools lo arma en `gmHabUi`
  (`js/04`); el mapa en `acHabUi()` (trampa con `trampaDeHabilidad` o junto al token, zona con `zonaPersistenteDeHabilidad`, el
  objetivo de un estado con un cartel propio `#ac-objetivo` en el recuadro, el duelo con `acElegirObjetivo`). En el mapa
  (`acEjecutarHab`): 📣 manual anuncia, ⚡ Flash fuera del duelo (`acFlashFuera`, con `CreepDuelo.pagarFlash`), el resto cobra con
  `acCambiar` → `modificarCreep` y sigue con `terminarHab`; `danohabcreep` (🎲 segunda tirada) y `cdmod` (− / + / ↺ del cooldown)
  también los hace el mapa. Comparado contra el código viejo de GM Tools en 500 creeps con 4 clics al azar (habilidades con duelo
  al azar, cura, costo en HP, estados, con y sin duelo/mapa): 500 iguales sin contar los redibujos; 5 mutaciones detectadas.
  `pruebas.html`: 180 en verde (1 nueva). **En vivo** (GM con ⚗, "Creep nuevo" con 8 No2 y tres habilidades de prueba): la 📣
  manual se anunció en la Mesa sin cobrar; la 💰 semi cobró 2 No2, puso cooldown 1 y tiró la Fuerza, y su 🎲 tiró el 1d6 «Efecto»;
  la ✨ «sobre sí mismo» cobró 1 No2, puso cooldown 3, aplicó Blindado (2 turnos) y se anunció; el + del cooldown subió a 1 la manual.
  **Ningún pedido fue a GM Tools.** Creep restaurado tal cual (6 No2, 2 HP, sin habilidades); ⚗ apagado. Lo que sigue: tanda 6,
  la 🔍 y el Ver de los creeps.
- 2026-10-01: **4c, tanda 6 hecha** (84ad4a7) — la 🔍 y el Ver. `comun/creep-lupa.js` (`CreepLupa`): `contenido(sc, clave)` (la 🔍
  de cada botón: stat, defensa, atacar, daño, habilidad), `verHab(sc, h)` (la tarjeta de Ver de una habilidad), `paraHtml(h)` y
  `stat(sc, statId, o)`, copiados de `lupaStatCreep`, `lupaHtmlCreep` y `abrirVerHabAccion` (`js/03`) y `paraHabHtml` (`js/05`),
  que quedan con atajos. En el mapa: las Acciones nuevas dibujan las 🔍 (`lupa.js` y `creep-lupa.js` en `AC_PIEZAS`, los estilos
  del 🔍 copiados al recuadro) y `lupaContenido` reconoce la clave de un creep (`"creepId|tipo|ref"`); el Ver se muestra en el
  recuadro (`#ac-ver`, `acVerHab`); Editar, Subir y Reemplazar los hace GM Tools en el marco (`acDelegar(datos, boton)` →
  `acciones-delegar` con `boton`: GM Tools abre el Ver de esa habilidad y toca el mismo botón). Comparado contra el código viejo
  en 400 creeps al azar (12 070 🔍 y el Ver de cada habilidad): 400 iguales; 6 mutaciones detectadas. `pruebas.html`: 181 en
  verde (1 nueva). **Arreglo de paso**: "Fuerza del golpe" dibujaba una 🔍 vacía (no tiene desglose; su texto ya explica de dónde
  sale) — ya no se dibuja (`creep-botonera.js`, en GM Tools y en el mapa). **En vivo** (GM con ⚗, "Creep nuevo" con una
  habilidad de prueba): las 🔍 de Atacar (con el costo: «Ya atacó: Tipo completo, 8 No2»), Defensa, Fuerza y la habilidad
  (costo, «faltan 1» de cooldown, tirada del stat) se abrieron sobre el recuadro; el Ver mostró «🐾 Creep · cooldown», el costo y
  el detalle; ✎ Editar abrió el editor paso a paso de GM Tools sobre el mapa. Se cerró sin guardar; creep restaurado tal cual
  (6 No2, 2 HP, sin habilidades) y ⚗ apagado.
- 2026-10-01: **P137 decidida y aplicada** — `Combatiente.efectoPermanente(src, preset)` (la casilla de la habilidad/ítem si se
  tocó; si no, el estado), usada por `FichaHabilidades.aplicarEfectoDeConsumo`, `CreepAcciones.efectoDeHab` e `invEjecutarHab`;
  el editor de habilidades de creep suma la casilla "No vence" (`#hc-efecto-permanente`, se llena con el preset al elegirlo). El
  Excedente de vida de un creep ya no se suma al que tenía (`efectoDeHab`). Ningún ítem del catálogo cambia. `pruebas.html`: 183
  en verde (2 nuevas). El dueño va a probar la 4d en una sesión real; mientras tanto, empieza la 4e (invocaciones).
- 2026-10-01: **4e, tanda 1 hecha** (fbff51c + el arreglo de la Defensa) — `comun/inv-calculo.js` (`InvCalculo`): stats con equipo y
  estados, Defensa, críticos, No2 máximo, con qué para, Bloqueo, costos de atacar y de las habilidades, daño del arma, HP máximo
  por Constitución y `migrar`, copiados de `ficha-personaje/js/04` (que queda con atajos de una línea). Comparado contra el código
  viejo en 800 invocaciones al azar: 800 iguales; 7 mutaciones detectadas. **Comparado también contra las reglas de los creeps**:
  coinciden en No2 máximo, con qué para, Bloqueo, costo de atacar, daño y críticos; los stats, en todos los que tienen los dos (los
  que difieren son de personaje: SP, Crg.Max, etc.); la **Defensa no**: una invocación ignoraba los estados que la suben o la bajan
  («−2 Defensa», Piel de escoria). **Arreglado** (`InvCalculo.defensaEfectiva`, misma regla que los creeps — «invocaciones =
  creeps», P121 —, salteando Armadura rota, que en la forma de la ficha trae su −1 como bono y ya se cuenta por acumulación).
  `pruebas.html`: 184 en verde (1 nueva).
- 2026-10-01: **4e, tanda 2 hecha** (d57a9b2) — `comun/inv-botonera.js` (`InvBotonera.html(inv, {parryPendiente, lupa})` →
  `{titulo, badge, html}`, y `botonSegundaHab`), copiado de `renderBotoneraInv`/`botonSegundaHabInv` (`js/04`, que quedan con
  atajos). En el mapa, con ⚗, `abrirBotonera(fichaId, undefined, invId)` abre la Botonera nueva del dueño en modo invocación
  (`bn.invId`; `bnDibujarInv`, sobre una copia migrada; dormida o borrada, avisa). Cada botón va a la ficha del marco
  (`botonera-delegar` con `inv`; `js/14` abre la Botonera de esa invocación y toca el mismo botón). Sin 🔍 todavía. Comparado
  contra el código viejo en 600 invocaciones al azar: 600 iguales; 5 mutaciones detectadas. `pruebas.html`: 185 (1 nueva). **En
  vivo** (GM con ⚗, un "Lobo de prueba" escrito un rato en la parte `invocaciones` de Silvia): la Botonera mostró sus No2, Combate,
  Defensa 0 (1 − «Débil»), stats y habilidades (Anunciar / Ejecutar / 🎲 1d6); «Fue» se tiró a nombre del Lobo y «Ver» abrió la
  ventana de la ficha encima del mapa. Restaurado (`{"invocaciones":[]}`) y ⚗ apagado.
- 2026-10-01: **Arreglo en `comun/ficha-sesion.js`, encontrado en esa prueba**: la primera carga de un personaje armaba todo con el
  primer aviso de Firestore, aunque viniera de la memoria local con solo algunas partes (las que esa misma página había escrito o
  leído). Sin la parte "otros" (la marca de la escala de Tipos), la migración corría +2 los Tipos de lo que sí había llegado —
  el Lobo apareció con d10 en vez de d8 — y, si la Botonera nueva guardaba esa parte, quedaba escrito. Desde que existe la ficha en
  vivo (Paso 3a); en la ficha podía pasar al cambiar de personaje en la misma pestaña. Ahora la primera carga espera la respuesta
  del servidor (`snap.metadata.fromCache`, con `includeMetadataChanges`). Probado en vivo con la misma secuencia (d8) y la ficha
  abre igual. `pruebas.html`: 186 (1 nueva, con un Firestore simulado).
- 2026-10-01: **4e, tanda 3 hecha** (8de3bfa) — `comun/inv-acciones.js` (`InvAcciones`): `tirada`, `tirarStat(inv, statId,
  {parryPendiente, trasParry})` → `{error}` o `{tirada, parry: 'poner'|'sacar'|'', aviso, cambio}`, `dano(inv, mods)`,
  `ataqueDuelo`, `pagarAtaque` y `tiradaAtaque`, copiados de `tirarValorStatInv`, `invTirarStat`, `invAtacar(Suelto)` e `invDanio`
  (`js/04`, que quedan como atajos que publican y dibujan). En el mapa (`bnInvAca`, `bnInvAtacar`, `bnPublicarInv`): con ⚗ y si
  puede guardar al personaje (dueño o GM con 🎮), las tiradas de stats, Esquivar, Parry, Bloqueo, Daño (con los efectos al golpear)
  y Atacar (objetivo con `dueloElegirObjetivoMapa` a nombre de `fichaId~invId`, o suelto) los hace el mapa; lo que cambia se guarda
  en la parte `invocaciones` (`bnUi`); el Parry pendiente vive en `bn.invParry`. Comparado contra el código viejo en 600
  invocaciones con 6 clics al azar (con y sin duelo, solo lectura): 600 iguales; 7 mutaciones detectadas. `pruebas.html`: 187 (1
  nueva). **En vivo** (GM con 🎮 el control de Silvia, ⚗, un Lobo de prueba): Fue, Bloqueo sin Parry (se negó), Parry (−1 No2,
  guardado), Bloqueo (habilitado con los Colmillos), Daño, y Atacar sin objetivo — con 3 No2 avisó que no alcanzaba; con 6, cobró 4,
  sumó el ataque y tiró el PdG. **Ningún pedido a la ficha.** Restaurado: invocaciones vacías, control devuelto y el resumen de
  Silvia idéntico al de antes. Lo que sigue: tanda 4, lo que el duelo le pide a una invocación.
- 2026-10-01: **4e, tanda 4 hecha** (7febfab) — `comun/inv-duelo.js` (`InvDuelo.hooks(ui)`, `pagarFlash`, `costoFlash`), copiado de
  las ramas «si el lado es una invocación» de `window.DUELO_HOOKS` (`js/11`) y de `pagarFlashInv`/`costoFlashInv` (`js/04`, que
  quedan como atajos). `ui` = {`inv(lado)`, `registrar(origen, r)`, `toast`, `cambiar(fn)` (fn devuelve false si no cambió nada),
  `parry` (el Set), `soy`}. Ficha: `dueloInvUi` + `dueloInv` (`js/11`). Mapa: `bnHooksDueloInv` en `hooksLocal` (invocación del
  personaje de la Botonera nueva, si puede guardarlo y con ⚗), con `bnRegistrarInv` (publica a nombre de la invocación si la
  tirada empieza con su nombre, como `mesaQuien` de la ficha). Comparado contra los ganchos viejos en 600 duelos al azar (17
  ganchos, con Flash y respuestas simuladas): 600 iguales; 9 de 10 mutaciones detectadas (la que no, «Tipo desconocido → 0», la
  tapa en la ficha el mismo control antes de llamar; una prueba permanente la cubre). `pruebas.html`: 188 (1 nueva). **En vivo**
  (GM con 🎮 el control de Silvia, ⚗, un Lobo de prueba con token al lado del Creep nuevo): el Lobo atacó al creep — el mapa cobró
  sus 4 No2 (guardado) y tiró su PdG; empate, el creep ganó la paridad —; después el creep atacó al Lobo — el mapa armó las opciones
  de defensa del Lobo (Evasión, Parry con los Colmillos y el Bloqueo que seguiría), cobró el Parry (guardado) y tiró el Bloqueo: el
  golpe quedó bloqueado y ofreció el contraataque. **Ningún pedido fue a la ficha** (`dueloRelayMapa` sin llamadas). Restaurado:
  token del Lobo borrado, creep tal cual, invocaciones vacías, control devuelto. El resumen público de Silvia decía 0 No2 contra 3 en
  sus datos (venía así de antes); quedó el que calcula la ficha con sus datos (3 No2).
  **Lo que sigue**: el daño que recibe una invocación en el duelo, automático (hoy `dueloAplicarDano` lo deja a mano), y la tanda 5
  (habilidades).
