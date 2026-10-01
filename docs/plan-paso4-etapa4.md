# Paso 4, etapa 4 — Las Acciones de los creeps y la Botonera de las invocaciones, en el mapa (plan)

> Parte de [`plan-paso4.md`](plan-paso4.md) y de [`plan-consolidacion.md`](plan-consolidacion.md). Sigue a la etapa 3
> ([`plan-paso4-etapa3.md`](plan-paso4-etapa3.md), la Botonera del personaje), con el **mismo método**. Escrito el
> 2026-10-01. **Estado: en curso** — ver "Cómo va" al final.

## ▶ Para retomar

**Hecho**: 4a (las reglas de un creep en `comun/creep-calculo.js`) y 4b (las Acciones nuevas de un creep las dibuja el mapa con
⚗ prendido; cada botón se le pide a GM Tools en el marco con `acciones-delegar`). Preguntas contestadas (P141, 2026-10-01):
creeps primero, el mismo interruptor ⚗, P137 espera.

**Lo próximo — 4c, mudar los botones de a uno** (como la 3c de la Botonera del personaje), del más simple al más complejo:
1. Tiradas de stats (`data-tirarstatcreep`: `tirarValorStat` de `js/01`, con Afortunado y las mitades) y Levantarse.
2. Esquivar, Parry (con el Parry que espera su Bloqueo, hoy un `Set` de GM Tools), Bloqueo, Fuerza del golpe, Daño.
3. Atacar (menú "¿Qué ataque es?", el objetivo con `dueloElegirObjetivoMapa`).
4. Lo que el duelo le pide a un creep (`window.DUELO_HOOKS` de `js/12`) → `comun/creep-duelo.js`, y `hooksLocal` del mapa.
5. Habilidades (`js/04`: manual, semi, ✨, Flash, cooldowns `data-cdmod`, segunda tirada, trampa y zona).
6. 🔍 (`lupaHtmlCreep`, `js/03`) y Ver.
El mapa guarda con `modificarCreep` (transacción + resumen + firma); GM Tools, abierto en otra pestaña, se entera por la firma.

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
