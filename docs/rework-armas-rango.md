# Rework de las armas de rango — hoja de debate

> Arrancó el 2026-10-09. Base: lo decidido el 2026-09-26 en [`rework-armas.md`](rework-armas.md) (Rango = identidad de la familia, tope por
> calidad, menos daño que las cuerpo a cuerpo, pólvora con las de rango, arcos a dos manos, sin munición ni recarga por ahora) y cómo está hoy el
> código (ataque igual que cuerpo a cuerpo, el daño no suma Fuerza, el Rango marca a quién alcanzás pero no bloquea). Para debatir con el grupo.

## Lo que dijo el dueño (2026-10-09)

- **Arcos: suman la Fuerza.** A evaluar si toda o con un límite (por ejemplo, la mitad).
- **Ballestas y revólveres: no suman Fuerza.**
- Cada familia necesita su **identidad** y después un **balance**, pensado **en contraste con las varitas**.
- **La ballesta es una especie de varita física:** como las varitas de daño directo, pero **sin** daño directo (no ignoran la armadura). Por eso
  pueden llevar **un daño fijo más alto**.
- **Revólveres (pólvora):** ¿cómo se distinguen? Idea: los proyectiles que no son de fuego se esquivan normal; **los de fuego (pólvora) quizás no
  se esquivan**: la dificultad la pone el arma para apuntar («una falla contra…»). A pensar conceptualmente y charlar con los colegas.

## Propuesta de Claude, para debatir

### Arcos — «la fuerza del brazo»
- Suman tu Dmg (Fuerza) **hasta un tope que trae el arco: su «Tensión»** (arco corto Tensión 2, arco largo 4, legendario 6). Así el arco premia
  al personaje fuerte, pero un arco flojo no rinde como un hacha aunque el que lo tense sea muy fuerte. Es un número del ítem: sirve para
  diseñar por calidad y por precio.
- Alternativa más simple: **la mitad de tu Dmg** (redondeo hacia arriba, como los buffs).
- Se esquivan con Evasión, como siempre. Parry: solo con **escudo** (una espada no para una flecha).
- Identidad: **mucho Rango** y efectos de punta (Envenenar, Prende fuego, Sangrado).

### Ballestas — «la varita física»
- **No suman Fuerza.** Daño = dados chicos + **daño fijo alto** (una ballesta Común 1d6 + 3; la de asedio 2d6 + 5…). Pegan parejo: poca varianza.
- **No ignoran la armadura** (a diferencia de la varita de daño directo): la Defensa se resta como a cualquier golpe.
- **Recarga como las varitas:** el primer disparo del turno cuesta 1 No2 y cada disparo más en el turno, +1 (el mismo `costoEspecial` de las
  varitas, sin SP). Ese es su freno, y su parecido con la varita.
- Identidad: **certeza y penetración** (las mejores, «Ignora N de Resistencia a crítico»; Rompe armadura como excepción).
- Se esquivan con Evasión; Parry solo con escudo, igual que las flechas.

### Pólvora (pistolas, revólveres, arcabuces, trabucos) — «no se esquiva, se apunta»
- **No suman Fuerza.**
- **El defensor no tira Evasión** (no hay Parry). En cambio, el tirador tira su **PdG contra la dificultad de apuntar** del arma, que **sube con la
  distancia**: hasta su «distancia certera» una dificultad baja, y más lejos cada tramo la sube. Esto **rescata la regla vieja del manual**
  («Distancia certera»: seguro hasta tu Destreza; más lejos 1d20 con 7+, 17+, 20), que hoy no hace nada en el programa.
- La Defensa se resta normal. El **crítico** sale de la diferencia entre el PdG y la dificultad (como hoy con la Evasión).
- Identidad: **ignorar la agilidad del rival** (son buenas contra los evasivos y malas a lo lejos) y daño alto con **Rango corto o medio**; control
  en las mejores (Aturdir, Derribar).
- Freno posible (más adelante): pocos disparos y recargar (un revólver de 6, el arcabuz de 1). Necesitaría munición o cargas: hoy no existe.

### Hondas y cerbatanas (a decidir)
- **Honda:** es fuerza de brazo → ¿como el arco (suma con su Tensión)?
- **Cerbatana:** no suma Fuerza, daño mínimo; lo suyo es el efecto (Veneno), como una varita de efecto.

## Preguntas para el grupo

1. Arcos: ¿Tensión del arco (un tope por arco) o la mitad de la Fuerza?
2. Ballestas: ¿la recarga como las varitas (No2 que sube por disparo en el turno) les cierra como freno?
3. Pólvora: ¿no se esquiva y se tira contra la dificultad del arma, que sube con la distancia? ¿Rescatamos la tabla de la «Distancia certera»?
4. Parry contra proyectiles: ¿solo con escudo? (hoy se puede parrear cualquier disparo, con cualquier arma).
5. ¿Hondas como arcos y cerbatanas como varitas de efecto?
6. Disparar con un enemigo pegado (en contacto): ¿se puede?, ¿con penalidad?, ¿le da un ataque de oportunidad?
7. ¿Lo que se interpone (sólidos, otros tokens) tapa el disparo? ¿Cobertura?

## 2026-10-09 · Arcos: los topes (Tensión) y el Parry

**Decidido (dueño):**
- **Arcos con tope**: suman la Fuerza hasta un tope del arco. El tope tiene que quedar como **un equivalente de la Fuerza promedio** de ese nivel.
- **Parry contra flechas: solo con escudo**, nunca con un arma. **A distancia no hay contraataque.**
- **Ideas a balancear (dueño):** con escudo, quizás un bonus para parar un proyectil; con la Evasión común, quizás alguna dificultad.

**Datos para pensar el tope** (reparto sugerido de atributos por rol, 33 puntos a nivel 1 y +3 por nivel; `Combatiente.PESOS_ROL`):
- Fuerza a nivel 1: Warrior ~10 · Tanque ~9 · Asalto ~6 · Shooter, Mago, Support y Debuffer ~3. Promedio de las siete clases: ~5.
- Por nivel, el Warrior suma ~0,9 de Fuerza y el Shooter ~0,3: a nivel 5, Warrior ~14, Shooter ~4–5; promedio ~7.
- Un golpe cuerpo a cuerpo suma **toda** la Fuerza (Dmg = Fuerza): un Warrior nivel 1 con una espada Común (1d6 + 1) pega 1d6 + 11 (≈ 14,5).
- Un arco hoy no suma nada: el Arco corto (1d6) pega ≈ 3,5, y contra una Defensa de 4 casi no entra.

**Propuesta: Tensión por calidad ≈ Fuerza promedio de esa franja de nivel** (la calidad sigue al nivel en las tiendas):
Común 4 · Buena 5 · Raro 6 · Excepcional 7 · Legendario 8. El arco suma **tu Fuerza, hasta su Tensión**.

Qué pasa con cada uno (nivel 1, Arco corto 1d6, Tensión 4):
- **Shooter (Fuerza 3):** 1d6 + 3 ≈ 6,5. Suma toda su Fuerza: el tope no lo toca.
- **Asalto (Fuerza 6):** 1d6 + 4 ≈ 7,5. Pierde 2 puntos contra el cuerpo a cuerpo.
- **Warrior (Fuerza 10):** 1d6 + 4 ≈ 7,5. Pierde 6: con espada pega ≈ 14,5.

**Ventajas del tope (Tensión):**
- El arco nunca pega como un hacha: el que tiene mucha Fuerza sigue rindiendo más cuerpo a cuerpo (el rango tiene su precio, como pediste).
- Es un número **del ítem**: crece con la calidad, se puede vender un «arco de guerra» de Tensión alta, y se calcula en la calculadora del catálogo.
- El que no es fuerte (el Shooter) no pierde nada: su arco rinde igual en sus manos que en las de un Warrior hasta el tope.
- Contra la Defensa: sumar algo fijo hace que la flecha entre (hoy un 1d6 suelto contra Defensa 4 casi no hace nada).

**Desventajas:**
- Un número más en cada arco (otra cosa que explicar).
- El Warrior con arco «desperdicia» Fuerza (es a propósito, pero puede sentirse raro).
- **Ojo:** como el Shooter tiene poca Fuerza, sumar Fuerza beneficia más a los fuertes que al tirador. Si el arco tiene que ser el arma del Shooter,
  su daño tiene que venir también de otro lado (dados del arco, Destreza, habilidades).

**Comparación con la mitad de la Fuerza** (la otra opción): sin número nuevo, pero crece sin límite con el personaje (un Warrior nivel 5 con Fuerza 14
suma 7 con cualquier arco, también con uno Común) y al Shooter le da casi nada (Fuerza 3 → +2).

**Pendiente:** la balanza «persona con arco contra persona con arma» (daño esperado por turno contra Defensas típicas, cuánto se expone cada uno,
cuánto cuesta en No2 acercarse) y los números del escudo y la Evasión contra proyectiles.

## 2026-10-09 · Los obstáculos tapan los disparos (decidido)

**Decidido (dueño):** los obstáculos del mapa **interceptan los proyectiles**. La línea de tiro sale **del tirador**, no de lo que ve el grupo: aunque
el jugador vea al objetivo por la visión de un aliado, si hay un obstáculo en el medio el personaje **no** puede dispararle.

**Cómo se tiene que ver al atacar con un arco (pedido del dueño, a probar en el mapa):** tu Rango; los objetivos posibles, bien marcados; los que
no se pueden, marcados aparte (fuera de Rango, o tapados por un obstáculo, aunque se vean); y los obstáculos que los tapan.

**Lo que ya existe y sirve de base:** el visualizador de Rango (📏, tecla R) ya recorta el área con la línea de visión (`dibujarRangoConVision`,
`lineaLibre` + `solidosSet()`: los Sólidos y la Colisión tapan); al elegir objetivo, el mapa hace brillar a los que están a tu alcance
(`dueloResaltarObjetivos`), pero hoy **no mira los obstáculos ni bloquea** a uno que esté fuera de Rango.

**Abierto:** ¿los otros tokens (aliados o rivales en el medio) también tapan, o solo los obstáculos? ¿Algo deja disparar por encima (tiro con
comba, la skill del Shooter)?

## 2026-10-09 · Arcos: críticos, dos manos y distancia mínima (dueño)

- **Todos los arcos son Tipo 4.** El que optimice el arco va a cargar Destreza y jugar al **crítico**: el Tipo 4 es el de rango de crítico más chico
  (más niveles de crítico por cada punto que le sacás a la defensa). Contrapeso natural: **la Resistencia a crítico Tipo 4 es la más frecuente**
  en las armaduras. Y el crítico multiplica **todo** el daño (también lo que suma la Tensión) y **no resta la Defensa**: el arco pega poco de base
  y mucho cuando critea.
- **La palanca de balance: la penalidad a la Evasión contra proyectiles.** Cada punto que se le resta a la Evasión del objetivo es un punto más de
  diferencia para el crítico (con rango 2, cada 2 puntos = un nivel más). Por eso conviene arrancar chico (por ejemplo −1) y medirlo.
- **Siempre a dos manos:** no hay escudo, orbe ni nada en la otra mano (sin Parry de escudo contra proyectiles para el arquero). El **peso** del arco
  depende del arco, de su calidad, su tamaño y su Tensión.
- **Distancia mínima:** el arco no ataca cuerpo a cuerpo; tiene que haber **al menos 2 casilleros libres entre el arquero y el objetivo** (el
  objetivo a 3 casilleros o más).

**Decidido (dueño):** con un enemigo encima, el arquero **se aleja** (y se come el ataque de oportunidad) **o cambia de arma** (en combate cuesta
No2). **No se puede pegar con el arco.** La distancia mínima de ballestas y pólvora se evalúa cuando les toque; ahora, solo arcos.

## 2026-10-09 · Decidido para arrancar (dueño)

- **Daño del arco: los dados del arco + la mitad de tu Fuerza, redondeada para arriba.** Se descartó el tope (Tensión): encasillaba a los arcos y daba
  casi igual quién los agarrara. Con la mitad, importa quién lo usa y el arco pega siempre menos que el arma cuerpo a cuerpo de esa misma persona.
- **Costo en No2: como cualquier arma** (Tipo 4: 2 el primer ataque del turno, 4 los siguientes), para arrancar.
- **Evasión −X contra flechas**: esquivar una flecha es más difícil. El arco pega menos de base pero juega más al crítico. **Cuánto, es la duda.**
- Orden de trabajo: primero la mecánica; los efectos permitidos van al final (sirven para balancear los puntos al diseñar cada arco).
- El texto para compartir con el grupo está en la conversación del 2026-10-09 (resumen de esta hoja).

## 2026-10-09 · Escudo contra flechas y lo que tapa el disparo (dueño)

- **Escudo:** de base **no** tiene bonus para parar proyectiles (para con su Parry normal). Un bonus contra proyectiles es una **variable de diseño**:
  un rasgo que puede traer un escudo puntual.
- **Los tokens que están en el medio (aliados o rivales) también tapan el disparo**, igual que los obstáculos.
- **Tirar por encima / tiro con comba:** no es de base; es una **variable de diseño** (un rasgo de un arco o una habilidad, como la del Shooter).

## 2026-10-09 · Idea del dueño: el «sweet spot» de cada arco
- **Por defecto, los arcos no tienen penalidad a la Evasión.** En cambio, **cada arco tiene su sweet spot**: una distancia (o dos, o más) donde tiene
  ventaja: **+PdG** (o el rival −Evasión: para pegar y para el crítico es lo mismo, cuenta la diferencia). Ej.: «a 7 u 8 casilleros, +2 PdG».
- Propuesta de Claude para debatir: se expresa como **+PdG** (es tu tirada; no toca la Evasión mínima de 1 ni el Stun); el sweet spot va **dentro
  de tu Rango y nunca a menos de 3** (la distancia mínima); el mapa lo **muestra al apuntar** (un anillo de otro color, con quién cae adentro) y lo
  **suma solo** al crear el duelo (como la Embestida). Variables de diseño por arco: dónde está (corto 3–4, largo 7–8), cuán ancho (1, 2 o 3
  casilleros) y cuánto da (+1 a +3); la calidad sube el ancho o el bono.
- Balance (a medir): si el arquero tira desde su sweet spot más o menos la mitad de las veces, un +2 equivale en promedio a un +1 fijo, pero lo tiene
  que ganar ubicándose (gasta No2 en moverse) y el rival lo puede sacar de ahí acercándose o tapando la línea. Con el arco Tipo 4 (rango de
  crítico 4), +2 de diferencia es medio nivel de crítico más en promedio.

## 2026-10-09 · Base de los arcos, consolidada para probar (dueño)
- **Sin penalidad a la Evasión** por defecto (distorsiona el balance): un arma a distancia común y silvestre, hasta charlarlo con el grupo.
- **El sweet spot no es la regla:** queda como **bono / mecánica a testear** en algunos arcos (puede romper el juego).
- **Dados: 1 o 2 dados de Tipo 4 en cualquier calidad** (lore: una flecha no se hace más pesada); la calidad se paga con lo demás, si los puntos dan.
- **El Arco de guerra** (suma la Fuerza entera) es una idea para un arco de calidad alta; no define la base.
- Orden: cerrar y probar los arcos (números y mapa) → después hondas, cerbatanas y efectos permitidos.

## 2026-10-09 · Números: arquero contra guerrero (simulación con las reglas del juego)
Reparto sugerido de atributos (33 + 3 por nivel), Defensas de la curva por nivel, crítico y Defensa como en el duelo. Nivel 1: Guerrero Fue 10,
Agi 4, Des 6, HP 45, Def 8, Res T4 2 / T6 1, espada 1d6+1. Arquero Fue 3, Agi 8, Des 11, HP 30, Def 4, Res T4 1, arco Nd4 + 2 (mitad de Fuerza).
- **La espada del guerrero al arquero:** acierta ~38 % (Des 6 contra Eva 8) y hace ~4 por golpe, un golpe por turno.
- **El arco al guerrero pesado (Def 8): acierta ~89 %, pero no le hace daño.** 1d4+2 nunca pasa la Defensa 8; 2d4+2, ~0,2 por flecha. El crítico no
  aparece: con rango 4 y Res T4 2 hace falta ganar por 12, y el PdG del arquero llega como mucho a 11.
- Contra un rival medio (Def 6, Res T4 1): ~0,9 (1d4) a ~2,2 (2d4) por flecha. A nivel 5 (Def 10–14, Res T4 2–3), casi cero en todos los casos.
- **Palancas medidas (daño por flecha, contra el guerrero pesado / un rival medio, nivel 1, arco 2d4+2):** como hoy 0,2 / 2,2 · la flecha **ignora
  la mitad de la Defensa** 2,7 / 4,2 · **Crítico frecuente +2** 5,4 / 7,5 · las dos 6,8 / 8,5. A nivel 5 solo el Crítico frecuente se sostiene
  (4,3 / 6,3).
- **Lectura:** con la Defensa que resta entera, el daño chico no entra, y la Resistencia a Tipo 4 (la más abundante) apaga el crítico del Tipo 4. No
  es solo de los arcos: el mismo arquero con una espada tampoco le hace daño al guerrero. A decidir antes de probar en el mapa.

## 2026-10-09 · Parry, dos manos y lo que quedó para más adelante (dueño)
- **Con un arco no se parrea** (programado: `Combatiente.sirveParaParry`, `armaParaDefensa` con `arco`). **Un disparo** (flecha, virote, bala:
  cualquier ataque con un arma de rango) **solo se para con un escudo** (programado: `Combatiente.contraDisparo`; el duelo lo aclara).
- **El arco es siempre a dos manos** (el asistente de ítems lo pone solo). Con el arco en las manos no hay otra arma; tener otra y «sostener» el
  arco sin usarlo («blandirlo o sostenerlo») **no se programa**: casi no va a pasar, queda para más adelante.
- **Más peso para pagar otros efectos** (idea del dueño para la lluvia de ideas): ojo, el Peso es la cantidad de dados, así que un arco más
  pesado tira más dados. Para cargar más sin cambiar el daño haría falta separar el peso de los dados (hoy no se puede: los dados = Peso +
  amplificados). Si se quiere usar, se decide al diseñar los arcos.
- **El arco y el sigilo**: ver P184 (disparar rompe el sigilo, solo el primero es sorpresa, la Evasión 1 solo de cerca).

## 2026-10-09 · Arcos Tipo 4 y Tipo 6 (dueño, cambia «todos los arcos son Tipo 4»)
- **El Tipo es el dado:** un arco que tira d6 es Tipo 6; no se separa el Tipo del dado («si no, un poco que se rompe»). Para acercarse a un d6 sin
  romper la paridad, un arco Tipo 4 puede llevar daño fijo (1d4+1 ≈ 1d6). Más dados: sí; d8: no, por ahora.
- Quedan dos familias: **Tipo 4, el arco liviano** (juega al crítico) y **Tipo 6, el arco largo** (más parejo). La escalera por calidad, medida con
  `herramientas/balance_combate.py`, está en [`balance-combate.md`](balance-combate.md) (paso 3).

## 2026-10-09 · Línea de tiro, tiro alto y distancia ideal (dueño; programado)
- **Línea de tiro** (todas las armas de rango): al apuntar se dibuja una línea recta; la tapan los obstáculos Sólidos y **cualquier token, aliados
  incluidos**. Si algo la tapa o la línea apenas **roza** una casilla ocupada, aparece el aviso y **lo decide la mesa**.
- **Tiro alto**: por encima de los tokens (no de los muros), con el objetivo a 4 o más y **PdG −2**. «Probemos.» **Es la mecánica de firma de
  todos los arcos** (dueño, 2026-10-09): un arco que no la tenga lleva **«Sin tiro alto»**, una debilidad que lo abarata (`sinTiroAlto`; en la
  calculadora resta lo que vale). Otra arma de rango la tiene solo si la trae (`tiroAlto`).
- **Distancia ideal (sweet spot)**: variable de diseño de cada arco — **dónde** (cerca, a media distancia, lejos, o una franja fija; con su ancho) y
  **qué da** (PdG, Crítico frecuente, Crítico potente, daño fijo, ignorar Resistencia; «se pueden habilitar infinidad de efectos»). El balance:
  ubicarse cuesta No2 y el rival se puede mover.
- **Comba** (doblar alrededor de un obstáculo): el dueño la piensa — P185, sin programar.
