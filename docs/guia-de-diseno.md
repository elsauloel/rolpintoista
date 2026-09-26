# Guía de diseño: campos de juego y mecánicas

> Borrador vivo (2026-09-25, idea del dueño). Sirve para que, al diseñar o rehacer una **habilidad, un arma o un equipo**, uno vea de un vistazo
> **qué mecánicas existen** y **a qué elementos del juego les "pertenece" cada una**. La forma final todavía no está decidida: por ahora es una
> lista para ir completando. Complementa a [`herramientas-de-diseno.md`](herramientas-de-diseno.md) (ingredientes nuevos a construir) y a las
> reglas del manual (`manual-usuario/notas/`).
>
> **Versión visual dentro del juego:** `comun/guia-diseno.js` (☰ → 📐 Guía de diseño) presenta esto como grillas de tarjetas, paso a paso; sus datos espejan este documento. La clase se llama **Asalto** (no "emboscador").
>
> **Cómo leerla (esencia del proyecto).** Todo esto son **territorios sugeridos, no leyes**: la mesa puede salirse de ellos siempre. La idea es que cada
> familia tenga *su sabor* propio; que **otra familia use esa mecánica es posible pero excepcional** (una hacha que sangra por ser especial, no porque
> sí). Si algo se puede automatizar, se automatiza; si no, se aclara (⚙ / ✋). Y "equipo" incluye **las armas**, no solo lo defensivo.

## 0. Criterios generales de diseño (dichos por el dueño)
- **Los Nitros (No2) son un recurso MUY preciado** (2026-09-25). Se usan para acciones ofensivas, defensivas y para moverse, así que cada turno el jugador **optimiza y maximiza** su uso. Al diseñar **skills y objetos**, un costo en Nitros pesa mucho: 1 Nitro no es "casi gratis". Un arma o skill que cuesta pocos Nitros es barata *de verdad* y suele ser de calidad baja; los costos bajos hay que ganárselos con calidad o con límites. Ver también P112 (peso de los efectos) y P116 (armas mágicas).

- **El peso regula las armas mágicas (relevancia intermedia):** una varita pesa 1 y un báculo puede pesar mucho; como el Sobrepeso hoy es un drawback moderado (P108), el peso pesa de forma intermedia en el balance del arma, no alta.
- **El SP regula la magia:** quienes se enfocan en magia tienen mucho SP al inicio del combate y una regeneración de SP mayor que el promedio; cobrar SP en sus efectos es la forma de balancearlos (los Nitros son escasos para todos).
- **Tipos de daño mágico:** **arcano** (el más puro: directo a la vida, sin efectos adicionales) y elementales **fuego, hielo y rayo** por ahora; también dan espacio de diseño para ítems defensivos. Efectos (con **probabilidad** de aplicarlos, no siempre): **hielo → Escarcha** (−1 No2 máx.), **rayo → Parálisis y efecto de cadena (salta de un personaje a otro bajo ciertas circunstancias, P118)** (debuff nuevo: PdG, Parry y Evasión a la mitad; mezcla de Lisiado y Pajaritos), **fuego → área que deja el terreno incendiado** (bola de fuego = flor, llamarada = cono; no es daño por turnos sobre la víctima). **Escarcha es acumulable** (cada stack congela más) y **fuego y hielo se cancelan entre sí**. Candidatos futuros: ácido, veneno, sagrado, sombra.
- **Hielo y rayo no aplican SIEMPRE Escarcha y Parálisis:** son debuffs muy poderosos, así que el daño de hielo y de rayo tiene sus propias características y **una probabilidad** de aplicar esos estados (se usan con más frecuencia o con menos costo). Escarcha y Parálisis valen mucho al cotizar (recursos, skills, dinero y rareza).
- **El daño mágico NO hace crítico** (dicho por el dueño, 2026-09-25, "mucho, muy importante"): el daño **arcano, eléctrico (rayo) y de fuego no hacen crítico**. **Solo hacen crítico los ataques físicos**, incluso los que nacen de un hechizo: p. ej. una **estaca de hielo** (daño físico con potencia por Especial). Consecuencia: las armas mágicas de daño **no llevan Crítico frecuente/potente** ni resistencia a crítico que las afecte; su valor viene del dado, los elementos, los efectos y el costo. (Hielo: el daño de hielo puro tampoco crítica; solo lo hace la versión física, como la estaca.)
- **No existe la "defensa mágica"** (dicho por el dueño, 2026-09-25): no hay un equipo que reste daño mágico como la Defensa resta el físico. **El daño mágico va DIRECTO a la vida.** Por eso hay que ser **cauteloso con las skills que hacen daño mágico usando el Especial como daño**: existen, pero tienen que ser **muy caras**. La otra vía, más barata y equilibrada, es que un efecto mágico **use el Especial del usuario para calcular la potencia pero haga daño FÍSICO** (ejemplo del dueño: una estalactita de hielo): el defensor sí tiene armadura y esta lo protege. (La Res. mágica es resistencia a *efectos*, no reduce daño.)

## 0b. Relevancia de cada elemento en la calidad de un ítem (tabla viva, el dueño la va completando)
Para calcular calidad, tier y precio (P112), cada elemento del diseño tiene una **relevancia**. Lo dicho hasta ahora:
| Elemento | Relevancia | Nota |
|---|---|---|
| **Costo en Nitros** | **Muy alta** | Recurso muy preciado: ahorrar Nitros es una ventaja grande |
| **Peso** (drawback) | **Intermedia** (ni baja ni alta) | El Sobrepeso hoy es un castigo moderado (P108) |
| **SP** | *(por definir)* | Barato para los magos (mucho SP y más regeneración): regula la magia |
| **Efectos de arma** | según su peso 1–5 (provisorio, P112) | Los de casa de la familia, habilitados y excepcionales cuentan distinto |
| **Resistencia a crítico** | *(por definir)* | Más escasa cuanto más alto el Tipo (P114) |
| **Crítico frecuente / potente** | *(por definir)* | Universo de las armas Tipo 4 y 6 (P115) |
| **Tipo y cantidad de dados** | *(por definir)* | |
| **Defensa** | *(por definir)* | |

## 1. Familias de arma y su mecánica "de casa"

| Familia | Mecánica de casa | Otras (excepcional) | Estado en el juego |
|---|---|---|---|
| **Hachas** | **Rompe armadura** (baja la Defensa del rival) | — | ✅ existe el efecto y el estado *Armadura rota* (se acumula, editable) |
| **Contundentes** (mazas, martillos…) | **Demora**: baja al golpeado 1 lugar en la tabla de iniciativa (definitivo) | Aturdir | 🔲 el efecto sobre la iniciativa no existe todavía (ver `herramientas-de-diseno.md` §2) |
| **Punzantes** (lanzas, estoques, dagas…) | **Lisiado** (PdG y Parry a la mitad) | Sangrado, Envenenar | ✅ el estado *Lisiado* existe; como efecto de arma se recuerda y se tira |
| **Cortantes** (espadas, sables…) | **Sangrado** (pierde HP por turno; se acumula de a 1) | Lisiado | ✅ estado *Sangrado* |
| Explosivos, de rango, escudos, armas naturales, mágicas | *por definir* | | 🔲 |

- Los dados del tipo de arma ya orientan la familia (glosario: 4 perforante, 6 cortante, 8 cortante pesado / contundente liviano, 10 contundente pesado, 12 explosivo).
- El daño elemental (fuego, hielo, electricidad, veneno) suele ir por su lado: *Prende fuego*, *Escarcha*, *Stun*, *Envenenar*.
- Hay que decidir qué pasa con los nombres: en el juego **"Derribar"** ya es un efecto de arma (cae al suelo, a mano). *Knockdown* como efecto de iniciativa necesita un nombre que no se pise con ese.

## 1b. Tres niveles de efecto por familia (aclaración del dueño, 2026-09-25)
Para cada efecto de arma, cada familia lo tiene en uno de tres niveles:
- 🏠 **De casa**: le da *identidad* a la familia (hacha → Rompe armadura).
- 🤝 **Habilitado por contexto / compartido**: tiene sentido en varias familias. Ej.: **Envenenar** lo puede llevar cualquier arma con filo (hachas, cortantes, punzantes) y las de rango (flechas, dardos).
- ✨ **Excepcional**: va contra el concepto (un martillo que envenena). Siempre se puede hacer la excepción; solo va a ser raro.

**Peso de cada efecto** (idea): cada efecto va a tener un peso según cuán relevante sea en combate, para poder calcular después la **calidad y el precio** de un arma (y, eventualmente, diseñar una mecánica de balance). Hoy los pesos (1–5) en `comun/guia-diseno.js` son **provisorios**; falta definir la fórmula (ver P112 en `preguntas-abiertas.md`).

## 2. Inventario de mecánicas disponibles (para jugar "acá o allá")

**Estados sobre el golpeado o el objetivo** (existen; ver Estados en el manual): Veneno, Veneno severo, Sangrado, Armadura rota, Lisiado, Inmovilizado, Rengo, Pajaritos,
Stun, Cansado, Exhausto, Escarcha, Sentado.
**Estados a favor**: Regeneración, Hypeado, Invulnerable, Inmunidad a CC, Espinas, Barrera / Escudo especial (con máximo, se recarga), **Excedente de vida** (HP por encima del máximo, sin tope ni recarga),
Afortunado, Sangre pura, Coagulación extrema, Blindado, Sigilo.
**Efectos de arma al golpear** (se recuerdan y se tiran, no se aplican solos): Rompe armadura, Envenenar, Sangrado, Aturdir, Derribar, Agarrar, Prende fuego, Drena vida.
**Sobre el mapa**: formas y terreno (con turnos y Colisión), trampas (con daño, estado, fuego amigo del efecto y **teleport**), sigilo (cono y zona de alerta), niebla y visión, auras, ping.
**Sobre la iniciativa** (por construir): bajar al fondo, subir N lugares o al primero, con o sin duración.
**Sobre la niebla y la visibilidad** (por construir): modificar el radio de visión, ver a través de Sólidos, destapar/tapar niebla, ceguera, detectar lo oculto.
**Recursos y números**: HP, SP, No2 (Nitros), Defensa y resistencias a crítico, Movimiento, Rango y Rango de casteo, Crg.Max (Sobrepeso), Iniciativa.
**Reglas de tirada**: ventaja (Afortunado), mitades (Pajaritos, Lisiado), Bloqueo / Parry / Esquivar, redondeo (buffs hacia arriba, debuffs hacia abajo).

## 3. Cómo usar esta guía al diseñar
1. Elegí a qué familia pertenece lo que estás haciendo y mirá su **mecánica de casa** (§1): empezá por ahí.
2. Si querés salirte, hacelo a propósito y que sea **excepcional** (un ítem raro, una skill especial), no la norma de la familia.
3. Buscá en el **inventario** (§2) si la mecánica ya existe y se puede **automatizar**; si no, escribila y marcala ✋ A mano.
4. Sumá la mecánica que falte a `herramientas-de-diseno.md` y, si genera dudas, a `preguntas-abiertas.md`.

## Objetivo: calcular calidad y tier de ítems y armar catálogos por grupo
El dueño va dando herramientas de diseño para que, cuando pida un catálogo, se pueda **calcular la calidad y el tier de cada ítem** e **imaginar ítems en grupo** (sets, familias) que él después **audita**. Piezas: los tres niveles de efecto por familia (§1b), el peso de cada efecto (P112) y las reglas de combate de las que depende el valor de cada número. Reglas base ya dadas:
- **Golpe crítico (P113, en elaboración):** PdG − Evasión ≥ Tipo del arma → crítico; ignora armadura y tira 1d20 para el multiplicador de daño (menos de 7 ×1, 7+ doble daño, 17+ triple daño, 20 cuádruple daño) sobre **todo** el daño del golpe (dados, Fuerza y demás bonos). El nivel del crítico es N = diferencia ÷ Tipo (hacia abajo): se tiran **N d20 y vale el mejor** (2 × Tipo = doble crítico = 2d20…). La **Resistencia a crítico resta niveles** (un punto = un crítico anulado, por Tipo de arma): se tiran N − R dados. La **Resistencia a crítico** se define después de esto.

- **Escasez de la Resistencia a crítico por slots (P114, en elaboración):** los Tipos altos solo los dan pocos slots (ej.: Tipo 10 solo cascos; Tipo 8 dos slots sin casco; Tipo 6 tres slots; Tipo 4 en más). El máximo que se puede juntar equipado = la cantidad de slots elegibles.

- **Anillos:** mágicos, uno por mano (2 slots). Más libertad de efectos, pero más escasos y caros. Los preceptos de esta guía son la base de un futuro **rework del catálogo**.

- **Dos formas de mejorar el crítico (P115, cerrada):** **Crítico frecuente** (baja el rango del crítico: Tipo 4 pasa a 3; mínimo 2; también cambia el nivel de doble crítico) y **Crítico potente** (baja los umbrales del d20: doble daño con 6+, triple 16+, cuádruple 19+; se pueden afinar por separado). Vocabulario: **doble crítico** = diferencia doble (2d20); **doble / triple / cuádruple daño** = el multiplicador del d20.

## Propuesta de skills de crítico (para que el dueño las audite; costos provisorios)
**Cargadas en `comun/skills-clase.js` el 2026-09-25 (sujetas a revisión con el uso):** Ojo de asesino (Asalto, automatizada sobre uno), Golpe brutal (Warrior, automatizada sobre uno), Temple (Tanque, automatizada sobre uno), Marca del cazador (Support, a mano) y Punto débil (Debuffer, a mano); y se actualizaron Apuntar, Headshot, Lisiar, Tajear y Degollar para hablar de Crítico frecuente / potente.
Dos estados nuevos, para que todas las skills los apliquen igual: **Crítico frecuente ×N** (baja el rango N puntos, mínimo 2) y **Crítico potente ×N** (baja N puntos todos los umbrales del d20), con turnos o "próximo ataque".
| Skill | Clase | Costo | Qué hace |
|---|---|---|---|
| Apuntar (existente) | Shooter | X No2 | +X a la PG y **frecuente ×X** en el próximo ataque a distancia (X ≤ 3) |
| Ojo de asesino | Asalto | SP 2 · No2 1 | Tu próximo ataque del turno con **frecuente ×1** |
| Lisiar / Tajear (existentes) | Asalto | SP 2 / 3 | Ataque con **frecuente ×1**; si es crítico, el efecto se refuerza |
| Headshot (existente) | Shooter | SP 4 | **frecuente ×1 + potente ×1**, +5 de daño, falla si no es crítico |
| Degollar (existente) | Asalto | SP 7 | **frecuente ×1 + potente ×1**, +7 de daño (con su costo de quedar expuesto) |
| Golpe brutal | Warrior | SP 3 · ataque | Ataque con **potente ×1**; a cambio, −2 a tu Evasión hasta tu próximo turno |
| Marca del cazador | Support | SP 3 · No2 1 | Un aliado en tu rango de casteo recibe **frecuente ×1** durante 2 turnos |
| Punto débil | Debuffer | SP 3 (Esp / Res.M) | El objetivo pierde **1 punto de Resistencia a crítico** (todos los Tipos) durante 2 turnos |
| Temple (o Piel resistente, existente) | Tanque | SP 2 | +1 de Resistencia a crítico a todos los Tipos durante 2 turnos |
Y del lado del equipo: **el mundo del crítico es de las armas de Tipo 4 y 6** (punzantes y cortantes): **ambas juegan con las dos herramientas (frecuente y potente), con distinto acento** (invertido por el dueño el 2026-09-25): las de **Tipo 6** acentúan el crítico **frecuente** y las de **Tipo 4** el **potente** (no es exclusivo: pueden aparecer en otras armas), con el peso de cada una en el precio (P112). Las pesadas (Tipo 8 o más) se identifican por otros efectos (Rompe armadura, Knockdown…).

**Reglas de estos estados (dichas por el dueño):** se pueden dar **a otros o a uno mismo**; el **rango nunca baja de 2**. **Crítico potente ×P:** doble daño baja 1 por punto (7 − P), triple daño 1 cada 2 puntos (17 − P÷2) y cuádruple daño 1 cada 3 puntos (20 − P÷3); el piso del doble daño es 1 y, después de eso, los otros dos umbrales siguen bajando a su propia escala (ver P115). **Aprobadas:** Punto débil y Temple. Marca del cazador, Golpe brutal y Ojo de asesino siguen a revisar.

- **Armas mágicas (P116, en elaboración):** se dividen en **armas de daño** y **armas de efecto**. Las de efecto dan pequeños hechizos que se castean con el arma, tiran PG mágico y cuestan generalmente 1 Nitro y SP según el efecto.

- **Armas híbridas (P117):** armas físicas de tier alto con efectos mágicos y daño mágico ligado a un elemento (arcano, fuego, hielo, rayo). Tienen que ser **raras como mínimo** (mejor excepcionales o legendarias); nunca comunes ni de buena calidad.

## Para completar (a medida que el dueño las defina)
- Mecánica de casa de las demás familias de arma (explosivos, rango, escudos, armas naturales).
- Territorios por **clase** y por **tipo de skill** (tanque, asalto, mago, shooter…), ver [`clases-borrador.md`](clases-borrador.md).
- Territorios por **pieza de equipo** (casco, botas, anillos…) y por **rareza**.
- Qué mecánicas son de "un solo dueño" y cuáles se pueden compartir libremente.

## Movimiento: −1 Mov = −1 Nitro, un drawback muy grande (dueño, 2026-09-25)
Aclaración del dueño (reemplaza su mensaje anterior, que decía "un micro"): "**menos uno al movimiento es menos un Nitro.** Y eso es un drawback muy grande y hay que contemplarlo a la hora de usarlo como recurso para un equipo." El −1 de Movimiento era un drawback aceptable en el sistema anterior; ahora **cuesta un Nitro por turno**, el recurso más preciado. Por simetría, **+1 de Movimiento = +1 Nitro**, un beneficio muy caro (en la calculadora de armas 1 Nitro = 4 puntos de calidad, ver `TASA_STAT['nitros']`). Se puede usar, pero como drawback tiene que llevar a cambio un beneficio muy grande, y como bono tiene que cobrarse muy caro.

## Regla general de las habilidades: dos tiradas en la misma tarjeta (dueño, 2026-09-26)
Toda habilidad configurable (propias de la ficha, de invocaciones y de creeps; la biblioteca de skills de creep ya viene armada así) tiene **hasta dos tiradas**, y las dos viven **en la misma tarjeta**:
1. **Tirada al ejecutar** — el botón **Ejecutar** tira, de golpe, el stat elegido (por ejemplo PdG para el golpe) y hace todo lo automático (costo, estado, trampa…).
2. **Tirada de efecto** — la tirada interna de la habilidad (daño, curación, duración…; fórmula de dados, ej. `2d6+3`). Es un botoncito **🎲** al lado de Ejecutar, y **solo aparece cuando esa segunda tirada existe** (hay un stat al ejecutar **y** una fórmula). Sin stat, Ejecutar tira la fórmula directamente y no hay botón aparte.
**En los editores paso a paso las dos tiradas son dos pasos distintos**: «Tirada al ejecutar» (el stat) y «Tirada de efecto» (la fórmula), antes de «Estado» / «Efecto». Vale para el creador de habilidades de la ficha, el de invocaciones y el de creeps de gm-tools; el resumen final las muestra en dos filas («Al ejecutar» y «Efecto»). Código: `ficha.html` (`PASOS_HAB`, `PASOS_HAB_INV`, `botonSegundaHab`, `botonSegundaHabInv`) y `gm-tools.html` (`PASOS_HAB_CREEP`, `botonSegundaHabCreep`).

## PdG en contraataque (`pdgcontra`) — el «mundo del contraataque» es de los Tipo 6 (dueño, 2026-09-26)
Con la dinámica de [[Contraataque]] algunas armas de **Tipo 6** (cortantes) pueden traer **+1, +2 o +3 al PdG solo cuando contraatacás** (stat nuevo **PdG en contraataque**, `pdgcontra`). **Vale mucho menos que un PdG normal** porque es circunstancial: en la calculadora **0,8 PC por punto** (el PdG normal vale 3,5). Es una **stat de casa de los cortantes** (junto a Parry e Iniciativa: sin recargo). Se suma solo al elegir **Contraataque** en el menú de Atacar (no al ataque normal ni al de oportunidad), tanto en la ficha como en las tarjetas de creeps (`armaMods`). **Armas con `pdgcontra`:** Espada larga de infantería +1 · Cimitarra del desierto +1 · Sable del capitán pirata +2 · Espada vampírica menor +2 · Katana de maestro +3 · Espadón de acero de Toledo +3 · Katana del viento +3 · Filo del Capitán Sin Nombre +3 (todas siguen en su tier). También puede darlo un estado o un ítem.
