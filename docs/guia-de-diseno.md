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
- **Equipo para casters: poco y repartido** (2026-10-05): todo el equipo defensivo le sirve igual a un caster, así que no hace falta llenar el
  catálogo de piezas «de caster». Alcanza con **uno a tres efectos pensados para casters por slot** (cabeza, manos, piernas, pies, armaduras,
  accesorios…), repartidos entre slots y no amontonados en uno, y en total **más o menos la parte que le toca a una clase** (≈ 1/7 hoy, 1/9 si se
  suman clases) de los ítems de cada tier.
- **El Alcance y el Rango son del arma** (2026-10-05): una característica intrínseca del arma, nunca un bono que dé una pieza defensiva.
- **Ve lo oculto no va en el equipo** (2026-10-05): ver lo oculto de forma permanente arruina el Sigilo y las trampas (mecánicas de personajes
  enteros). Solo de forma **excepcional** (Legendario) o temporal (consumibles, un efecto de un turno); lo más que da el equipo es **Percepción
  aumentada** (una tirada, no un ver automático).
- **Escasez controlada** (2026-10-05): repartir por slot también sirve para que ciertos efectos **no se acumulen**. Si un efecto fuerte (ej. SP Regen)
  aparece en todos los slots, se puede apilar sin control; los efectos más peligrosos al acumularse viven en **un solo slot** (y, si hace falta,
  desde cierto tier). Ver la clasificación en `rework-armas.md`, «Escasez controlada».
- **Un bono grande, no siempre muchos chicos** (2026-10-06): en cada slot y tier, además de las piezas con varios bonos repartidos, tiene que
  haber algunas que pongan **toda la bolsa en una sola cosa** (Vida +30, Evasión +2, SP máximo +8…). Son las que definen una estrategia. Y un
  bono tiene que **notarse en la mesa**: medirlo contra lo que modifica (+1 a una poción que cura 25 es un 4 %: no se siente). Si no se
  nota, se sube el número y se baja el costo en la calculadora; no se deja un bono decorativo.
  **Excepciones (dueño, 2026-10-06):** la **Resistencia a crítico**, el **Crítico frecuente** y el **Crítico potente** nunca van concentrados en
  una pieza: repartidos entre slots, de a poco. **Topes por pieza** (escaneo del 2026-10-06, `rework-defensa.md`): Evasión +2 en Buena calidad,
  resistencia elemental +2; una sola fuente por cada rebaja de No2; las chances en % con tope por equipo o en un solo slot.
- **Lo de 1 turno que se activa en tu propio turno** (dueño, 2026-10-06, con el turno propio — P162): dura el resto de ese turno (el contador baja
  al terminarlo). Está bien así: una trampa que te deja Lento 1 turno te deja lento lo que te queda del turno. Al diseñar un efecto de 1 turno
  que puede caer en el turno propio (trampas, algunas skills), **valorarlo barato**; si tiene que durar más, darle 2 turnos (como la Barrera).
- **Indestructible, nunca con Defensa alta ni Resistencia a crítico alta** (dueño, 2026-10-06, para cuando exista): una armadura que no se rompe
  le saca a la Armadura rota (hachas, ácido) su efecto contra el tanque; si además da mucha Defensa o mucha resistencia a crítico, el tanque queda
  sin contra. Indestructible va solo en piezas de Defensa y resistencia a crítico bajas.
- **Los Nitros (No2) son un recurso MUY preciado** (2026-09-25). Se usan para acciones ofensivas, defensivas y para moverse, así que cada turno el jugador **optimiza y maximiza** su uso. Al diseñar **skills y objetos**, un costo en Nitros pesa mucho: 1 Nitro no es "casi gratis". Un arma o skill que cuesta pocos Nitros es barata *de verdad* y suele ser de calidad baja; los costos bajos hay que ganárselos con calidad o con límites. Ver también P112 (peso de los efectos) y P116 (armas mágicas).

- **El peso regula las armas mágicas (relevancia intermedia):** una varita pesa 1 y un báculo puede pesar mucho; como el Sobrepeso hoy es un drawback moderado (P108), el peso pesa de forma intermedia en el balance del arma, no alta.
- **El SP regula la magia:** quienes se enfocan en magia tienen mucho SP al inicio del combate y una regeneración de SP mayor que el promedio; cobrar SP en sus efectos es la forma de balancearlos (los Nitros son escasos para todos).
- **Tipos de daño mágico:** **arcano** (el más puro: directo a la vida, sin efectos adicionales) y elementales **fuego, hielo y rayo** por ahora; también dan espacio de diseño para ítems defensivos. Efectos (con **probabilidad** de aplicarlos, no siempre): **hielo → Escarcha** (−1 No2 máx.), **rayo → Parálisis y efecto de cadena (salta de un personaje a otro bajo ciertas circunstancias, P118)** (debuff nuevo: PdG, Parry y Evasión a la mitad; mezcla de Lisiado y Pajaritos), **fuego → área que deja el terreno incendiado** (bola de fuego = flor, llamarada = cono; no es daño por turnos sobre la víctima). **Escarcha es acumulable** (cada stack congela más) y **fuego y hielo se cancelan entre sí**. Candidatos futuros: ácido, veneno, sagrado, sombra.
- **Los elementos de cada rol, como estilo** (dueño, 2026-10-26: «no lo hacemos tan estricta, sino es más una cuestión de estilo general»): el **Mago** juega sobre todo con arcano, fuego, hielo, rayo y ácido (luz o siniestro, en casos puntuales); el **Debuffer**, con lo **siniestro** y lo **tóxico**; el **Support**, con la **luz**.
- **☀ Luz y 🌑 siniestro** (dueño, 2026-10-26, P221): la **luz** revela y castiga lo oscuro (si entra daño, Marcado hasta su próximo turno; ×1,5 a no-muertos y demonios); lo **siniestro** es la herida que no cierra (si entra daño, Herida sombría: no se cura con nada hasta el final de su próximo turno; a no-muertos y demonios no les hace nada). Cada uno con su resistencia (Res. luz, Res. siniestro).
- **El rayo no se esquiva** (propuesta del dueño, 2026-10-25, P219, falta aplicarla a todo): el daño eléctrico pasa siempre (la Res.Esp resiste solo sus estados, como Zap) y, para balancearlo, hace **menos daño por costo que el fuego** (o cuesta más en general).
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
| **Bono a Parry / a Bloqueo** (escudos y armas) | *(por definir)*, **más que la durabilidad** | Dueño, 2026-09-30: son las variables fuertes de un escudo |
| **Durabilidad** (`durPorPeso`) | **Menor que Parry y Bloqueo** | Dueño, 2026-09-30: "tiene un impacto menos fuerte que las variables anteriores" |

## 1. Familias de arma y su mecánica "de casa"

| Familia | Mecánica de casa | Otras (excepcional) | Estado en el juego |
|---|---|---|---|
| **Hachas** | **Rompe armadura** (baja la Defensa del rival) | — | ✅ existe el efecto y el estado *Armadura rota* (se acumula, editable) |
| **Contundentes** (mazas, martillos…) | **Demora**: baja al golpeado 1 lugar en la tabla de iniciativa (definitivo) | Aturdir | 🔲 el efecto sobre la iniciativa no existe todavía (ver `herramientas-de-diseno.md` §2) |
| **Punzantes** (lanzas, estoques, dagas…) | **Lisiado** (PdG y Parry a la mitad) | Sangrado, Envenenar | ✅ el estado *Lisiado* existe; como efecto de arma se recuerda y se tira |
| **Cortantes** (espadas, sables…) | **Sangrado** (pierde HP por turno; se acumula de a 1) | Lisiado | ✅ estado *Sangrado* |
| Explosivos, de rango, escudos, armas naturales, mágicas | *por definir* | | 🔲 |

- Los dados del tipo de arma ya orientan la familia (glosario: 4 perforante, 6 cortante, 8 hachas —siempre—, 10 contundente pesado, 12 explosivo).
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
**Estados a favor**: Regeneración, Hypeado, Invulnerable, Inmunidad a CC, Espinas (daño físico cuerpo a cuerpo; **no se suman**, dueño 2026-11-08: con varias fuentes —habilidad, escudo, coraza, poción— el golpe devuelve 1/4 una sola vez, así que dos fuentes en el mismo combatiente se desperdician), **Espejo** (su pareja: 1/4 del daño especial, a cualquier distancia; tampoco se suma), **solo devuelven el golpe directo** (dueño, 2026-11-08: «a un daño de área o un daño de veneno no lo afectan las espinas. Las espinas lo afectan los golpes directos, un ataque con el daño del arma. Todo lo que es daño indirecto, venenos o efectos de área o lo que sea, eso no se devuelve ni con espinas ni con espejos»): las Espinas, un golpe cuerpo a cuerpo con el arma a ese objetivo (también las habilidades que son un ataque con el arma); el Espejo, un ataque especial de un solo objetivo a él (una varita, un hechizo a uno; los misiles que se reparten cuentan de a uno). Nunca: un área (onda, flor, cono, línea, Bola de fuego, Meteoro, la Tormenta…), el veneno, el sangrado, la quemadura y demás que corren por turno, trampas, zonas y superficies, el salto del rayo, el golpe que rebota o sigue de largo a otro, lo devuelto (sin ping-pong) ni lo que un protector se lleva de un aliado (Escudo humano, Miti-Miti: el atacante le pegó al aliado; dueño, 2026-11-08). **Excepción: el Barrido** (y el Coletazo, su versión de bestia; dueño, 2026-11-08: «El barrido es un giro que cuenta como varios ataques. Así que si alguien con espinas es afectado por barrido, en ese caso puntual sí devuelve el daño»): cada uno que lastima y tiene Espinas devuelve 1/4 de lo suyo. Código: `Combatiente.devuelveElGolpe` y `Combatiente.esGiro` (comun/combatiente.js), usados por `dueloEspinas`/`dueloEspejo` (vtt-hexgrid/js/13), Barrera / Escudo especial (con máximo, se recarga), **Excedente de vida** (HP por encima del máximo, sin tope ni recarga),

**⚡ El salto del Escudo elemental de rayo** (dueño, 2026-11-09, decidido después de dudar de que fuera demasiado: «si dos personajes están alrededor de la persona que tiene el escudo, los dos van a recibir el golpe inicial y además el salto»): el rayo que salta desde el golpe del anillo **nunca va a otro que ya recibió el golpe del escudo** (los pegados al portador); salta solo a los de afuera del anillo. El resto del salto, igual: el más cercano del mismo bando a 4 casillas, la mitad de lo que entró, resta su Res. eléctrica, uno por objetivo. Código: `rayoCadena(…, {excluir})` (vtt-hexgrid/js/10), `dueloCadena(d, entro, {excluir})` (js/13) y `escudoQuemar` (js/106).
Afortunado, Sangre pura, Coagulación extrema, Blindado, Sigilo.
**🌀 Barrido, Coletazo y Remolino: un ataque común por cada rival** (dueño, 2026-11-08: «a fines prácticos es como si fueran múltiples ataques
continuados uno de otro y van a aplicar las mismas reglas de un ataque. Si esquiva, esquiva, si pega, pega… solo que el contexto del ataque, el inicio,
es el barrido»). Cada rival al lado recibe un duelo entero: **su propia tirada de PdG** (dueño: una por rival), su defensa (Evasión, Parry o Bloqueo),
crítico, los efectos del arma, las Espinas y el conteo del Aguante. **Orden** (dueño): se elige el primer rival y el giro sigue en el sentido de la
animación (la hoja gira en el sentido de las agujas del reloj, y arranca en ese primer rival); con cada uno, el pulso en su token, el cuadro del duelo
que se despliega desde ahí, el duelo, y el cuadro que se repliega antes del siguiente. Se paga una vez (es el ataque del turno); «Cancelar duelo»
corta el giro, «Terminar a mano» deja ese golpe a la mesa y sigue. El **Remolino** del Warrior (dueño: «que sea prácticamente lo mismo visualmente que
el barrido») hace lo mismo, con su paso de más antes de pegar: alcanza a los de las dos casillas y el orden se toma alrededor de donde quedó.
(`vtt-hexgrid/js/108-barrido.js`; las habilidades llevan `barrido` y el Remolino `barridoPaso`.)
**Cualquiera puede armar un giro** (dueño, 2026-11-08: «que se pueda poner un barrido a una invocación»): en la ✨ Ejecución de una habilidad,
«Ataque con mi arma» → la tarjeta de la PdG → «🌀 Giro (como el Barrido)». Vale para el personaje, su invocación, el GM y el editor de creeps
(`comun/asistente-duelo-hab.js`, guarda `barrido: true`; el `giro` del Remolino —su paso de más— se conserva al editarlo).
**🛡 Aguante con habilidades de ataque** (dueño, 2026-11-08: «que se pueda sumar a otros skills que estén incluidos en un ataque, como pegar fuerte.
Todos los skills que van como ensamblados al ataque, si vienen con el bono del aguante, se deben sumar»): cualquier habilidad que es un ataque con el
arma descarga los dados del Aguante sumados a los suyos (Pegar fuerte con 3 golpes contados: +1 dado de la habilidad y +3 del Aguante), con el mismo
cobro (1 SP por dado, o +1 turno de cooldown de Aguante por dado) además de lo que cuesta la habilidad. **En el Barrido, los dados van solo al primer
rival** (dueño, 2026-11-08). Personajes (la Botonera nueva) y creeps. (`aguanteParaHabilidad`, `vtt-hexgrid/js/56-aguante.js`.)
**🌵 Interponerse sí devuelve Espinas** (dueño, 2026-11-08): quien se interpone pasa a ser el defensor del duelo y recibe el golpe entero, así que
sus Espinas devuelven como siempre (a diferencia del Escudo humano, que reparte el daño y no devuelve).
**Efectos de arma al golpear** (se recuerdan y se tiran, no se aplican solos): Rompe armadura, Envenenar, Sangrado, Aturdir, Derribar, Agarrar, Prende fuego, Drena vida.
**Sobre el mapa**: formas y terreno (con turnos y Colisión), trampas (con daño, estado, fuego amigo del efecto y **teleport**), sigilo (cono y zona de alerta), niebla y visión, auras, ping.
**Sobre la iniciativa** (por construir): bajar al fondo, subir N lugares o al primero, con o sin duración.
**Sobre la niebla y la visibilidad** (por construir): modificar el radio de visión, ver a través de Sólidos, destapar/tapar niebla, ceguera, detectar lo oculto.
**Recursos y números**: HP, SP, No2 (Nitros), Defensa y resistencias a crítico, Movimiento, Rango (de la Destreza: también el de lo especial; el Rango de casteo se fue el 2026-10-07), Crg.Max (Sobrepeso), Iniciativa.
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

- **Supercrítico (regla del dueño, 2026-09-30):** si en los d20 del crítico salen **dos o más 20 naturales**, los multiplicadores se suman (cada 20 = ×4: dos 20 = ×8, tres = ×12). No lo afectan los umbrales, el Crítico potente ni los modificadores: solo 20 naturales. Automatizado en el duelo y en la calculadora de crítico (`Critico.resultadoD20`, `comun/critico.js`).
- **Dos formas de mejorar el crítico (P115, cerrada):** **Crítico frecuente** (baja el rango del crítico: Tipo 4 pasa a 3; mínimo 2; también cambia el nivel de doble crítico) y **Crítico potente** (baja los umbrales del d20: doble daño con 6+, triple 16+, cuádruple 19+; se pueden afinar por separado). Vocabulario: **doble crítico** = diferencia doble (2d20); **doble / triple / cuádruple daño** = el multiplicador del d20.

## Propuesta de skills de crítico (para que el dueño las audite; costos provisorios)
**Cargadas en `comun/skills-clase.js` el 2026-09-25 (sujetas a revisión con el uso):** Ojo de asesino (Asalto, automatizada sobre uno), Golpe brutal (Warrior, automatizada sobre uno), Temple (Tanque, automatizada sobre uno), Marca del cazador (Support, a mano) y Punto débil (Debuffer, a mano); y se actualizaron Apuntar, Headshot, Lisiar, Tajear y Degollar para hablar de Crítico frecuente / potente.
Dos estados nuevos, para que todas las skills los apliquen igual: **Crítico frecuente ×N** (baja el rango N puntos, mínimo 2) y **Crítico potente ×N** (baja N puntos todos los umbrales del d20), con turnos o "próximo ataque".
| Skill | Clase | Costo | Qué hace |
|---|---|---|---|
| Apuntar (existente) | Shooter | X No2 | +X a la PG y **frecuente ×X** en el próximo ataque a distancia (X ≤ 3) |
| Ojo de asesino | Asalto | SP 2 · lo de un ataque | Un ataque con +1 PdG, +2 al daño, **frecuente +1** y **potente +1** (2026-10-26: ya no es un estado) |
| Lisiar / Tajear (existentes) | Asalto | SP 2 / 3 | Ataque con **frecuente ×1**; si es crítico, el efecto se refuerza |
| Headshot (existente) | Shooter | SP 4 | **frecuente ×1 + potente ×1**, +5 de daño, falla si no es crítico |
| Degollar (existente) | Asalto | SP 7 | **frecuente ×1 + potente ×1**, +7 de daño (con su costo de quedar expuesto) |
| Golpe brutal | Warrior | SP 3 · ataque | Ataque con **potente ×1**; a cambio, −2 a tu Evasión hasta tu próximo turno |
| Marca del cazador | Support | SP 3 · No2 1 | Un aliado en tu Rango recibe **frecuente ×1** durante 2 turnos |
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


## PdG en ataque de oportunidad (`pdgopor`) — el «mundo de la oportunidad» es de los Tipo 4 (dueño, 2026-09-26)
Mismo criterio que el contraataque, pero para las armas de **Tipo 4** (punzantes: dagas, estiletes, estoques, lanzas y picas): **+1, +2 o +3 al PdG solo en ataques de oportunidad** (stat **PdG en oportunidad**, `pdgopor`). **0,8 PC por punto** (el PdG normal vale 3,5) y **stat de casa de los punzantes** (sin recargo). Se suma solo al elegir **Ataque de oportunidad** en el menú de Atacar, en la ficha y en las tarjetas de creeps. **Set nuevo (tanda 7, 11 armas):** Daga de vigía +1 · Estilete de centinela +2 · Estoque de guardia +2 (Común) · Lanza de centinela +1 · Lanza del portón +2 · Aguja de la vigilia +3 (Buena) · Pica de retaguardia +2 · Lanza del guardián del paso +3 · Puñal del sereno +3 (Raro) · Pica del Muro Eterno +3 (Excepcional) · Lanza del Paso de las Tres Puertas +3 (Legendario). Las lanzas y picas suman Alcance (pegan al que quiere pasar de largo); lo alto trae Lisiado.

## Tipo 12 = efecto Explosión (dueño, 2026-09-26)
El **Tipo 12 está dedicado exclusivamente al efecto Explosión**: un arma es T12 si y solo si tiene ese efecto. No hay mazas ni martillos T12 que "solo peguen más". Las armas de Explosión son **muy raras y circunstanciales** (pocas, tiers altos, casi todas de rango y a dos manos). La calculadora valora la Explosión en 6 PC a radio 1 (+50 % por radio extra). Definición exacta del efecto: `preguntas-abiertas.md` (P-Explosión).
**En pausa (2026-09-26):** no se diseñan armas T12 hasta que el resto esté consolidado; el único T12 del catálogo es el Lanzallamas (Excepcional).

## Durabilidad como elemento de diseño (idea del dueño, 2026-09-26; hecho el 2026-09-30)
Por defecto un ítem tiene **3 puntos de durabilidad por punto de Peso** (mínimo 3). Desde el 2026-09-30 es un **campo propio del
ítem**, `durPorPeso` ("puntos por cada punto de Peso"): se elige en el asistente de ítems (paso Peso y daño en las armas, paso
Peso/Precio en escudos y armaduras) y se ve en el "Ver" de cada ítem (ficha, GM Tools, tienda, editor del catálogo). 4 o 5 =
más resistente para su peso; 2 = frágil. Regla en `comun/combatiente.js` (`durMax`). Ver `durabilidad.md`. Pendiente: cuánto
vale en la calculadora de calidad/precio (P112).

## Escudos: un espacio de diseño propio (dueño, 2026-09-30)
Las armas ya tienen mucho para diferenciarse (Tipo, dados, efectos al golpear, crítico); los escudos eran más limitados. Con
Parry → Bloqueo → durabilidad hay tres ejes para jugar con la calidad de un escudo (y también de un arma):
- **Escudo normal**: sus stats salen de sus características (Peso, Defensa, resistencias a crítico).
- **De Parry**: +1 al Parry, nada al Bloqueo (intercepta mejor, pero aguanta lo normal).
- **De Bloqueo**: +1 al Bloqueo, nada al Parry (le cuesta interceptar, pero cuando lo hace aguanta más).
- **Mejor en los dos**: más Parry y más Bloqueo.
- **Resistente**: solo más durabilidad (el eje más suave: impacta menos que Parry y Bloqueo).
- **Combinaciones**: mucho Parry y más durabilidad, etc.
Los bonos a Parry y a Bloqueo ya son accesos rápidos del paso "Bonos" del asistente para la categoría Defensa. **Cada uno con lo
suyo** (P129, dueño 2026-09-30): el bono de un escudo cuenta al parar o bloquear con ese escudo, y el de un arma, con esa arma.

## Los bonos de cada arma, con esa arma — para todos (dueño, 2026-11-07)
Regla general, igual para **personajes, creeps e invocaciones** (dueño: «los bonos de más una probabilidad de golpe que te da un arma
aplica solo para esa arma… para jugadores, para creeps, para invocaciones, para todo»). Lo que da una pieza de la mano se reparte en tres:
- **Bonos de ataque** (PdG, Crítico frecuente y potente, Daño, PdG en contraataque y en oportunidad, Rango/Alcance; y lo que el arma trae
  suelto: Perfora, efectos al golpear…): **solo al atacar con esa arma**. Con dos armas se elige con cuál se ataca (cada una paga su propio
  primer ataque a mitad de precio).
- **Parry y Bloqueo** (dueño, 2026-11-07): **solo al atajar con esa pieza** (arma o escudo). Si hay más de una con qué atajar, se elige,
  como se elige el arma con la que se ataca. (Amplía P129 a creeps e invocaciones.)
- **Todo lo demás cuenta siempre**, tenga en la mano lo que tenga: la **Iniciativa** (dueño, 2026-11-07: «no es algo que afecta el ataque,
  sino que es algo que afecta solo al principio del combate»), la Evasión, la Defensa, la resistencia a crítico…
Código: `Combatiente.STATS_DEL_ARMA` / `STATS_DE_LA_PIEZA` / `fuentesParaStat` (creeps e invocaciones) y `FichaCombate.statParaArma`
(personajes). Las invocaciones atacan con dos armas como los creeps desde el 2026-11-07 (`armaActiva`, `ataquesArma`).

## Paso fantasma: qué movimiento cuenta (dueño, 2026-11-09)

El Paso fantasma (Anillo de Paso Fantasma, stat `pasofantasma`) suma su valor fijo a la **próxima** tirada de Evasión después de moverse 3 casilleros
o más, y se gasta al tirarla. **No se acumula**: moverse 6 da lo mismo que moverse 3. **Cuentan** caminar, la **Carga** (Carga que derriba) y el
**Takle** (dueño: «la carga y el tackle, sí»); **no cuentan** el **Salto** ni el **Dash** («el salto y el dash no deben cargarlo al anillo»). La carrera
manda su ruta al token (`carreraRuta`, vtt-hexgrid/js/55-carrera.js), como al caminar: la cuentan esta pantalla y las demás (js/09), y también suma a
«Contra el que corre» de los arcos. El Salto, el Dash y los empujones no mandan ruta.

**Una vez por ronda (dueño, 2026-11-09):** «siempre que dé tres pasos consecutivos, obtiene +3 a la evasión para su siguiente tirada. Esto se activa
una vez por ronda… si empieza su turno con este +3 activo… se desactiva… es una ronda completa desde su turno hasta su siguiente turno».
- **Pasos consecutivos** (corregido por el dueño, 2026-11-09: «si da 1 paso y después 2, pero sin hacer otra acción en el medio, sí suma el bono»)
  = 3 casilleros o más caminados (o corridos con la Carga o el Takle) **sin otra acción en el medio**, aunque sean varios movimientos: 1 + 2 suman 3.
  La cuenta se corta con cualquier otra acción suya: una tirada suya en la Mesa (atacar, una habilidad, Parry, Bloqueo, consumir, el daño…; su
  **Evasión no corta**: esquivar no es elegir hacer algo) y con un cambio de casilla sin camino (el Salto, el Dash, un empujón, el Mover libre del
  GM). El **Salto y el Dash** no suman y además **cortan** la cuenta, porque son una acción. Código: `cadena` en `pasoFantasmaDe`,
  `pasoFantasmaCortar` (js/07, desde `mesaAlAccionNueva`) y el listener de los tokens (js/09). La tirada se reconoce por el nombre de quien tira
  (`quien`): dos tokens con el mismo nombre cortan juntos.
- Se activa **una sola vez por ventana**: desde que empieza su turno hasta que empieza el siguiente (con orden de turnos; sin orden, el Mantenimiento).
  Si en esa ventana ya se activó (aunque lo haya gastado), otro movimiento largo no lo vuelve a dar.
- Si empieza su turno sin haberlo usado, se vence.
- **Cualquier tirada de Evasión** (arreglado el 2026-11-09, cola de pruebas 22/23): también la que se tira contra una habilidad que se esquiva con
  Evasión (una varita, un hechizo dirigido): suma el fijo y se gasta igual (`Combatiente.fantasmaEvaHab`). Antes solo valía contra un ataque con arma.
- Código: `pasoFantasmaVentana` / `pasoFantasmaDe` / `pasoFantasmaMovio` en vtt-hexgrid/js/07 (la ventana sale del orden de turnos que ven todas las
  pantallas: `actuaron`, `empezados` y el turno actual).
- **Guardado en la partida (dueño, 2026-11-09: «guardamos la cuenta del paso fantasma»):** el estado vive en el token, campo `pf` = `{v: ventana,
  c: pasos seguidos, l: listo, d: ya se activó en esta ventana}`. Todas las pantallas ven lo mismo y sobrevive a recargar la página. Los pasos los
  guarda la pantalla que mueve al token (las demás, al ver la ruta, ya no los suman); el corte lo guarda la pantalla del dueño del token (el GM para
  sus creeps y los personajes que maneja); el gasto, la pantalla que tira la Evasión, en una transacción: si otra pantalla ya lo había gastado, no
  se gasta dos veces y la Mesa avisa que esa Evasión lo sumó de más. El vencimiento no se escribe: un `pf` de otra ventana cuenta como vacío.
  Necesita las reglas de Firestore del campo `pf` (firebase/firestore.rules, `tokenValido`); sin ellas, cada pantalla cuenta por su lado como antes.
  Código: `pasoFantasmaAplicar` y `pasoFantasmaReglas` (js/07), `pasoFantasmaRemoto` (js/09).

## Máximo de Resistencia a crítico acumulable con el catálogo actual (medido 2026-09-27)
Pedido del dueño (log «A desarrollar»): cuánto se puede acumular de Resistencia a crítico por Tipo con un ítem en cada slot, eligiendo la mejor pieza de cada uno del catálogo de hoy (889 ítems; slots: cabeza, armadura blanda, armadura rígida, manos, piernas, pies, escudo y 2 anillos; el arma no aporta).
| Tipo | Máximo | Desglose |
|---|---|---|
| **T4** | **22** | cabeza 3 · blanda 3 · rígida 3 · manos 3 · piernas 3 · pies 3 · escudo 3 · anillos 1 |
| **T6** | **15** | 2 en cada pieza (7 piezas) · anillos 1 |
| **T8** | **12** | cabeza 2 · blanda 1 · rígida 2 · manos 2 · piernas 1 · pies 1 · escudo 2 · anillos 1 |
| **T10** | **9** | cabeza 2 · blanda 0 · rígida 1 · manos 2 · piernas 1 · pies 1 · escudo 1 · anillos 1 |
| **T12** | **8** | cabeza 2 · blanda 0 · rígida 1 · manos 2 · piernas 1 · pies 1 · escudo 0 · anillos 1 |
**Lectura (regla vieja, hasta el 2026-11-04):** cada punto de Resistencia le sacaba un d20 al crítico del atacante (nivel N − R). **Desde el 2026-11-04 (dueño) cada punto le suma 1 al rango del crítico, en cada nivel** (Tipo 4 ×1 → diferencia 5; ×2 → 6): pesa mucho menos que antes, así que esta tabla y su lectura hay que rehacerlas. Un personaje armado al máximo con las mejores piezas es prácticamente inmune a los críticos de Tipo 4 y 6 (un arma de Tipo 4 con nivel 5 se queda sin dados), pero con Tipo 10 y 12 aguanta poco. Es un techo teórico: las mejores piezas son Legendarias y pesan mucho (el Peso equipado limita). A decidir: ¿ponemos un tope general (por ejemplo +6 por Tipo) para que nadie sea inmune?

- **Sigilo y Carga valen 1,5 por punto** (dueño, 2026-10-06). El Sigilo abre los ataques por la espalda (PdG y Crítico potente): mucho potencial de
  romper con críticos. La Carga anula la contra del peso y deja llevar armas más pesadas (más dados) sin sobrepeso. Lo «ruidoso» (Sigilo negativo)
  sigue devolviendo poco (0,5 por punto): al que lleva placas casi no le importa.

- **🛡 Escudos gastados** (dueño, 2026-11-09: «los escudos gastados que llegan a 0, quiero que desaparezcan»): un estado que es solo un escudo
  (Vida extra, Escudo especial, Shield, Arrojo, Barrera/Blindaje, pociones de Cuero Duro, Piel de Cristal y del Aguante, Cáscara protectora, el
  escudo de 5 del Escudo humano) se saca de la lista apenas llega a 0, sin esperar sus turnos (`Combatiente.quitarEscudosGastados`, lo llama
  `resolverGolpe` del mapa y el golpe directo). Quedan: los que se renuevan cada turno a propósito (`recarga`), la Armadura arcana (absorbe y
  explota al terminar) y los que además dan otra cosa (mods, Invulnerable, el Escudo elemental). Los de los anillos de descanso vuelven en el
  próximo descanso.

## Trampas de área: se disparan en toda su área (dueño, 2026-11-09)
«Aplicale a todas las trampas la misma regla de la red»: si una trampa hace efecto en un área, **el disparo y el efecto ocupan las mismas casillas**:
pisar cualquiera de ellas la dispara y alcanza a todos los que estén encima. Primero la Red (Red de caza y Red tendida, `b4e3b4c2`); después el
resto (2026-11-09): Mina del cazador y Polvo cegador (creeps) y, del catálogo, Gas adormecedor, Gas somnífero, Nube de veneno, Petardo trampa,
Mina explosiva, Cartucho enterrado, Barril de pólvora, Lluvia de cascotes, Géiser de fuego, Niebla de confusión y Espejo de discordia. Todas
pasan a flor de 7 casillas (`tipo: 'flor', tamano: 1, efecto: {area: 'trampa'}`); los gases que quedan como nube siguen en esas 7. No queda
ninguna trampa con `efecto.area: 'flor'` (una prueba automática lo vigila). Las de una sola casilla (`pisador`: cepos, agujas, portales) siguen igual.

## La lava (Varita del chorro de lava): aprobada la tercera versión (dueño, 2026-11-09: «así me gusta, la lava»)
Commit `90398810` (`vtt-hexgrid/js/50-superficies.js`): borde negro nítido de líquido espeso; la costra del borde partida en placas negras con
juntas rojas que laten, grandes pegadas al borde y cada vez más chicas y separadas hacia el centro, que queda rojo y liso con llamitas y chispas.
