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
