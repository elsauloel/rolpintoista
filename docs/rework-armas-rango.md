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
