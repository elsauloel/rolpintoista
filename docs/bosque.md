# El Bosque — hoja de trabajo del dungeon

> Partida: «El origen de las especies» (el dueño autorizó auditar, configurar y crear creeps ahí; sin combates de prueba). Se sigue
> [`metodo-diseno-encuentros.md`](metodo-diseno-encuentros.md), como con las Minas. Empezada el 2026-10-14. Esta hoja es para retomar
> desde otra conversación: qué se decidió, qué falta y qué se le preguntó al dueño.

## La historia

Un **goblin le robó una esfera mística** a un **humano ocultista**. El ocultista está **usando a los goblins** (y a sus lobos) para
recuperarla. Los jugadores creen que es un problema de goblins y al final descubren quién mueve los hilos.

- Jefe: **ocultista humano** (decidido por el dueño, 2026-10-14: «a, ocultista»). Un mago que **manda a los goblins con magia** (los
  potencia con un grito o una marca) y castiga a los jugadores con hechizos.
- La esfera es una **esfera mística, no una llave** (dueño). Va como **drop fijo** del jefe: objeto de historia, sin números por ahora.
- **Nombres** (del ocultista, del goblin ladrón de la esfera y de la esfera): pendientes, los pone el dueño.

## El grupo (nivel 1)

| Quién | Fuerte | Débil |
|---|---|---|
| **Petro** (Tanque) | Defensa 10, Parry 8 | Lento (5 No2), Defensa especial 0 |
| **Larry** (Debuffer) | PdG.Esp 17 | 20 de vida, Defensa 1, Evasión 4 |
| **Bizzante** (Asalto / invocador) | Evasión 7, Parry 8, dos abejas | 25 de vida; las abejas mueren con un área |

**Larry es frágil a propósito** (dueño, 2026-10-14): el jugador puso todo en lo ofensivo sabiendo que queda muy vulnerable. Sirve de
referencia del más débil, pero es un riesgo que el jugador eligió: no hay que diseñar los encuentros para protegerlo.

Nadie tiene Defensa especial ni resistencias elementales; casi no pelean a distancia. Ranuras vacías de todos: piernas, anillos, cinturón y
mochila (la Mina dejó la Mochila de minero con farol).

## Auditoría de los creeps que había (Bosque 1, un solo mapa)

| Creep | Lo encontrado |
|---|---|
| **Chamán Goblin** (nv 2) | Le faltan 7 puntos; Especial 1 siendo chamán; sin tipo de criatura ni oro. Regeneración y Proyectil mágico a mano |
| **Ladrón del monte** (nv 1) | Atributos bien; Defensa 0, sin equipo. Golpe doble y Bolsillo ajeno a mano; Desaparecer ya automático |
| **Goblin jinete de lobo** (nv 3) | Lanza 2d6+7, Defensa 9. **Presa doble 1d12+13 dos veces (~39): mata a cualquiera** |
| **Lobo gris ×2** (nv 1) | 2 puntos de más cada uno. Mordisco furioso y Mordisco que lisia a mano |
| **Goblin hondero ×2** (nv 2) | Honda de cuero vieja. **Ráfaga de piedras 3d6+3 dos veces** (muy fuerte). Skills a mano |

Los skills viejos se armaron a ojo: son **referencia**, se pueden reinventar (dueño, 2026-10-14). Se pueden sumar creeps.

## Progresión (propuesta; el dueño: el encuentro 1 no puede ser «demasiado leve»)

1. **El sendero: emboscada organizada.**
   - 2 **goblins de choque** (nuevos): escudo de corteza y lanza, sostienen a Petro.
   - 2 **honderos goblin** rehechos con la categoría honda (`docs/pendientes.md`: hondas).
   - El **Ladrón del monte** en sigilo: roba algo del cinturón (🫳 Robo, mecánica nueva) y huye.
   - Pista: una orden escrita o una insignia que no es goblin.
2. **La guarida de los lobos.**
   - 2 o 3 **lobos grises** en manada, van por Larry (Rengo).
   - El **Chamán goblin** atrás: cura y pone **trampas de red** de antemano.
   - Pista: el rastro del goblin que robó la esfera.
3. **El claro: el ocultista.**
   - El **ocultista** (nv 3 o 4, jefe).
   - El **Goblin jinete de lobo** como lugarteniente, más débil (sin la Presa doble que mata de un golpe).
   - Quizás el goblin ladrón de la esfera, atrapado.
   - La **esfera** como drop fijo.

## Mecánicas nuevas para el Bosque

- **🫳 Robar** (2026-10-14, `vtt-hexgrid/js/47-robo.js`): un efecto «Robo» en la Ejecución de una habilidad (pegado al objetivo, el
  Ladrón: Sigilo contra Percepción) saca una unidad al azar del cinturón del personaje y la pasa al cinturón del ladrón; +2 si viene en
  sigilo o por la espalda; después puede alejarse hasta 3 casilleros sin oportunidad. Lo aplica el GM. Si sale bien, el ladrón **sigue en sigilo** (dueño,
  2026-10-14: el robo está muy ligado al sigilo). Pendiente: que el robo en sigilo no se anuncie (P199), que un personaje le robe a un creep, y
  robar oro si el cinturón está vacío.

## ✅ Cómo quedó (2026-10-14, armado por Claude con licencia del dueño: «a tu criterio, sin pedir permiso»)

Cargado en «El origen de las especies», cada encuentro en su mapa, con los tokens ocultos (Bosque 2 y 3 son mapas nuevos, **sin dibujar**:
el dueño les dibuja el terreno). Lo nuevo de cada habilidad está armado con mecánicas ya probadas en el mapa (ataque con arreglos, área,
onda de aliados, aliado, dirigida, trampa); las combinaciones nuevas, en `pruebas-en-el-mapa.md`.

**Encuentro 1 · El sendero** (mapa «Bosque 1»; botín estimado ~508, XP 200)
| Creep | Qué hace |
|---|---|
| Goblin hondero ×2 (nv 1) | Honda de piedras (alcance 6, 1d10+2), Chaleco de cuero. **Piedrazo a la cabeza** (Pajaritos 1t, cd 3) y **Lluvia de piedras** (flor de 7 a distancia, 1d4+1 físico, dodge roll; lenta cd 4) |
| Goblin de choque ×2 (nv 1, nuevo) | Lanza corta + Escudo pequeño + Chaleco (Def 4, 50 HP, 1d4+8). **Ensartar y sostener** (Lento 1t, cd 2) y **Pared de escudos** (Endurecido a sí o al de al lado; lenta cd 3) |
| Ladrón del monte (nv 1) | El robo (en sigilo, secreto) y el Golpe doble; ver arriba |

**Encuentro 2 · La guarida** (mapa «Bosque 2 · La guarida»; ~343, XP 260)
| Creep | Qué hace |
|---|---|
| Goblin jinete de lobo (nv 2, era 3) | El goblin con su bestia. Lanza corta + Escudo de cuero endurecido + Chaleco (Def 5, 45 HP). **Carga montada** (+1 PdG, +1d6, Sentado; cd 3, arranca disponible) y **Aullido de la manada** (Acelerado a los aliados a 3; lenta cd 4). Sin la Presa doble. **Lleva la Esfera mística** (trofeo especial): se la estaba llevando al ocultista |
| Lobo gris ×2 (nv 1) | Atributos corregidos. **Mordisco que lisia** (Rengo 1t, cd 2) y **Mordisco furioso** (+1d4; lenta cd 3) |
| Chamán goblin (nv 2) | Le faltaban 7 puntos y tenía Especial 1: ahora Especial 12. **Savia que cierra heridas** (Regeneración a un aliado a 4), **Espina de sombra** (PdG.Esp contra Evasión, 1d6+2 arcano directo) y su **Trampa de red** (ponerla antes) |

**Encuentro 3 · El claro** (mapa «Bosque 3 · El claro»; ~501, XP 230)
| Creep | Qué hace |
|---|---|
| **El ocultista** (nv 3, humano, JEFE, nuevo) | 60 HP, Def 2. Hoz del quintero, Túnica de aprendiz, Capucha de lana del culto, Varita arcana mayor (1d8 arcano). **Grilletes de sombra** (PdG.Esp contra Res.Esp: Inmovilizado 1t; cd 3), **Marca del amo** (Crítico frecuente a sus aliados a 4; cd 3) y **Estallido de sombras** (flor de 7, 1d6+2 arcano, dodge roll; lenta cd 4). Suelta un consumible seguro (jefe) |
| Goblin marcado ×2 (nv 1, nuevo) | Hoz del quintero + Chaleco (1d6+7, Sangrado 50 % de la hoz). **Tajo frenético** (+1d4; cd 2) y **No siente el dolor** (Endurecido; lenta cd 4) |

**Más goblins (2026-10-15, dueño: «son muy pocos, metele variedad» y «sumale algún goblin con arco»):**
| Encuentro | Creep | Qué hace |
|---|---|---|
| 1 | Goblin arquero (nv 1) | Arco de rama, Chaleco, Capucha de emboscada. **Flecha a la rodilla** (Rengo 1t, cd 2) y **Tiro certero** (+2 PdG, +1 Crítico frecuente; lenta cd 3) |
| 1 | Goblin trampero (nv 1) | Cuchillo dentado, Chaleco, Botas de suela de goma. **Trampa de red** (2026-10-15, dueño: la tira hasta 3 casilleros, se detecta con Percepción contra su Destreza y uno se suelta con Fuerza contra su Fuerza, 1 No2) y **Tajo al tendón** (Lisiado 1t, cd 3) |
| 2 | Lobo gris (3) | Igual a los otros lobos |
| 2 | Goblin domador (nv 1) | Rebenque emplomado (1d10+6), Chaleco, Casco de cuero endurecido. **¡Azuzar!** (Crítico potente a un aliado a 4) y **Chasquido** (Miedo 1t; lenta cd 3) |
| 3 | Goblin arquero del claro (nv 1) | Arco del monte, Chaleco, Capucha de lana cruda. **Flecha untada** (Veneno ×2, cd 2) y **Tiro certero** |
| 3 | Goblin portaestandarte (nv 2) | Lanza corta, Escudo pequeño, Chaleco, Casco (Def 5, 55 HP). **¡Por el amo!** (Bendecido a los aliados a 3) y **Pared de escudos** |

En la sesión del 2026-10-14 el dueño ya jugó parte del encuentro 1 (murieron el Ladrón y un lobo que llevó al Bosque 1, y sumó un hondero).

**La historia en el mapa:** en el 1 los emboscan los goblins del ocultista (y el ladrón les afana algo); en el 2, el jinete que lleva la
esfera; en el 3, el ocultista viene a buscarla. Si preferís que la esfera caiga recién con el jefe, se pasa el trofeo especial del jinete
al ocultista (GM Tools → Recompensas).

## Estado, creep por creep

(En la partida también hay dos «Ladronzuelo del monte», en otro mapa: no son parte de este plan.)

| Creep | Estado |
|---|---|
| Ladrón del monte | ✅ Listo (2026-10-14). Bolsillo ajeno con el Robo: cooldown 3 pero arranca disponible (dueño). Golpe doble = un ataque con su arma que tira dos veces su daño (1d4+1 y 1d4+1, dueño), ignora 1 de Res. crítico y +2 por la espalda en sigilo (probado en el mapa). Chaleco de cuero y Botas de suela de goma (Defensa 2, Sigilo 12). Juego: Desaparecer → Bolsillo ajeno (+2) o Golpe doble por la espalda → huir |
| Goblin hondero ×2 | ✅ |
| Goblin de choque ×2 (nuevo) | ✅ |
| Lobo gris ×2 | ✅ |
| Chamán goblin | ✅ (encuentro 2) |
| Goblin jinete de lobo | ✅ (encuentro 2) |
| El ocultista (jefe) + Goblin marcado ×2 | ✅ (encuentro 3) |

## Auditoría de habilidades con el dueño (2026-10-15, simuladas contra Petro, Larry y Bizzante, sin combates)
De a una, de nivel más bajo a más alto; la simulación usa las fichas reales y las reglas del duelo.
- Goblin de choque · **Ensartar y sostener**: + Perfora 2 (a Petro le saca 2 por golpe en vez de 0). **Pared de escudos**: queda igual.
- Goblin arquero · **Flecha a la rodilla**: +1 PdG (de 1d10+1 a 1d12: casi igual, un poco más de crítico; el dueño puede pasarla a +2). **Tiro certero**: igual.
- Goblin trampero · **Trampa de red**: hasta 3 casilleros (el GM elige la casilla), detectable y con soltarse (Fuerza contra la Fuerza del trampero, 1 No2: Petro 62 %, Bizzante 33 %, Larry 0 %).
- Goblin trampero · **Tajo al tendón**: +1d4 de daño (el Lisiado necesita que el golpe haga daño; el cuchillo perfora 1, así que siempre lo hace).
- Goblin domador · **¡Azuzar!**: el Crítico potente no hacía nada (ningún aliado llega al crítico contra este grupo) → **Azuzado** (+2 PdG, +2 daño, 2 turnos) a un aliado a 4. **Chasquido**: igual.
- Goblin marcado ×2 · **Tajo frenético**: igual. **No siente el dolor**: de Endurecido a **Vida extra 10, 2 turnos** (absorbe de cualquier fuente).
- Goblin arquero del claro · **Flecha untada**: Veneno ×3 (entra aunque la armadura pare la flecha). Tiro certero: igual.
- Goblin jinete de lobo · **Carga montada**: igual (se probó sin el +1d6 y el dueño la dejó como estaba). **Aullido de la manada**: Acelerado no hacía nada (nadie de la manada dispara) → **Bendecido 2 turnos** a los aliados a 3.
- Chamán goblin · **Savia que cierra heridas**: de Regeneración (+5 × 3) a una **cura de 2d6**. **Espina de sombra**: igual. **Trampa de red** → **Trampa de sombra**: hasta 3 casilleros, se detecta con Percepción contra su Ef.Esp (12) y uno se suelta con Fuerza contra 6 (1 No2).
- Goblin portaestandarte · **¡Por el amo!**: ahora lenta (arranca con el cooldown activo). Pared de escudos: igual.
- El ocultista · **Grilletes de sombra**: + 1d4 de daño arcano. **Marca del amo**: de Crítico frecuente +1 a **+1 PdG y Crítico frecuente +1** (estado «Marca del amo», 2 turnos). **Estallido de sombras**: 2d6+2 (antes 1d6+2).
- **Ataques básicos** (2026-10-16): todos le pegan a Larry y a Bizzante; a Petro (Defensa 12) casi ninguno le hace nada (lo cubren las
  habilidades mágicas y el veneno). Cambios: **Chamán** + **Varita arcana** (1d6 arcano directo, 1 No2: ~2,5 a 2,9 por intento a los tres);
  **El ocultista** cambia la hoz por la **Daga ritual** (nueva en el catálogo, `nuevo-daga-ritual`, Común, 80: Tipo 4, Perfora 1, Veneno ×2 en cada golpe): poco, pero pincha a todos si lo
  acorralan (su ataque de verdad sigue siendo la Varita arcana mayor).
- Ojo con las reglas del duelo: **Rengo, Lisiado, Sangrado y Envenenar necesitan que el golpe haga daño** (Lento, Sentado, Miedo, Veneno de una habilidad, no). Por eso la Flecha a la rodilla casi nunca deja Rengo a Petro (8–10 %).
- **Encontrado de paso:** las fichas de Petro, Larry y Bizzante calculan el Crítico frecuente con la Destreza (`formulas.crit = 'des'`, quedó de antes del 2026-09-25): les da 8 y el crítico salta con 2 de diferencia. **Arreglado (dueño, 2026-10-16):** las tres pasaron a `formulas.crit = '0'` (Crítico frecuente 0 + bonos). Estrella y Aurelius (las otras dos fichas de El origen) también tienen `'des'`: sin tocar, a decidir.

## Notas del GM que estaban en los creeps (sacadas el 2026-10-16)
La **nota** de un creep es pública (la ven los jugadores en su tarjeta 🪪), y estas eran notas de diseño — la del ocultista adelantaba la
historia. El dueño eligió cambiarlas por una frase de ambientación; lo de diseño queda acá.
- Goblin hondero ×3 (`3z6arg7`, `arhji0k`, `ln2aizc`): Encuentro 1 (El sendero). Tirador: se queda lejos, entre los árboles o en un lugar alto.
- Goblin de choque ×2 (`m9t4mk0`, `92o6r0q`): Encuentro 1. Frente: sostiene a Petro para que los honderos tiren tranquilos.
- Goblin arquero (`5vjgekj`): Encuentro 1. Arquero escondido entre los árboles. Pelea con arco: suelta siempre una flecha especial.
- Goblin trampero (`svsfzqv`): Encuentro 1. Prepara el terreno: pone redes en el camino antes de la emboscada.
- Goblin jinete de lobo (`31l42h7`): Encuentro 2 (La guarida). Abre con la Carga y azuza a la manada. Lo mandó el ocultista a buscar la esfera.
- Lobo gris ×3 (`4znzbx7`, `ou80yqx`, `dlv3a70`): Encuentro 2. Caza en manada: van juntos por el más débil.
- Goblin domador (`izy1s5j`): Encuentro 2. El que cría a los lobos: se queda cerca de ellos y los azuza.
- Chamán goblin (`pdw2b5i`): Encuentro 2. Atrás de los lobos: cura y deja redes (trampas de sombra) en el camino; ponerlas antes de que entren.
- Goblin marcado ×2 (`2s5ledu`, `9o3cxqo`): Encuentro 3 (El claro). Goblin con la marca del ocultista: lo cuidan de cerca.
- Goblin arquero del claro (`c56dvpc`): Encuentro 3. Cubre al ocultista desde atrás. Pelea con arco: suelta siempre una flecha especial.
- Goblin portaestandarte (`mi2pjl1`): Encuentro 3. Lleva el estandarte con la marca del amo: mientras esté de pie, los goblins pelean mejor.
- El ocultista (`vz9uwgy`): Encuentro 3, JEFE. Un humano que usa a los goblins para recuperar la esfera mística que le robó un goblin. Pelea
  de lejos: inmoviliza al que se le acerca, marca a sus goblins y revienta sombras sobre los que se juntan. Tiene la Varita arcana mayor
  (1d8 arcano). Defensa +2 de base: amuletos y vendas rituales (no se sueltan).


## Auditoría de los creeps de las minas (kobolds, 2026-10-16, mismo método: simulados contra Petro, Larry y Bizzante)
De a uno, de nivel más bajo a más alto; primero el ataque básico y después cada habilidad. Formato: ficha completa y el texto de cada habilidad tal cual, antes de los números.
- Kobold farolero (`35kgm38`): menos Constitución (Destreza 6, Constitución 6, vida 30): se queda lejos. **Aceite hirviendo**: igual (pega fuerte, a propósito: «más tendiendo a lo agresivo»).
- Kobold rabioso ×2 (`7f4m19f`, `6piufzf`): **Furia** +1 PdG y +2 de daño, 2 turnos, cooldown 3, lenta. El pico oxidado: Envenenar 50 % ×2.
- Rata de alcantarilla ×2 (`7yfjk9q`, `bohj2rz`): el mordisco perfora 1. **Plaga en la galería** automática: 📣 llama 2 ratas (el GM elige en el mapa dónde aparece cada una);
  solo con menos del 50 % de la vida (si tiene más, avisa y pregunta). Sin lenta y sin cooldown (dueño: la condición de la vida ya la frena; solo la limitan los 2 No2).
- Kobold escudero de barril (`8ah2r2u`): Destreza 3 → 6 (PdG 1d6) y el palo con clavos perfora 1. **Tapa de barril**: +3 Defensa, +3 Armadura mágica y +1 de resistencia a todos los críticos hasta su próximo turno.
  **Bien agachado** (Blindado, casi no hacía nada) → **¡Tu vieeeja!**: Fuerza contra Res.Esp a 3 casilleros, Provocado 2 turnos (1 No2, cooldown 3; 81 % contra Larry, 75 % Bizzante, 62 % Petro).
- Cerrados (sin «(auditar)» en el nombre; las copias se llaman «(2)») y sus 8 habilidades subidas a la biblioteca como auditadas (etiqueta «minas»).
- El cooldown empieza a contar al usar la habilidad, no cuando termina el efecto: la Furia (2 turnos, cooldown 3) queda 1 turno sin furia y vuelve.
- Kobold hondero (`ja9iyyn`): se queda con la honda; Fuerza 4 → 6, Agilidad 8 → 7, Constitución 6 → 5, vida 30 → 25 (daño 1d10+3: 2,5 por tiro a Bizzante, 4,2 a Larry, casi nada a Petro). Piedrazo a la cabeza: igual. Tiro al pie (Lento) pasó al ballestero como «Virote al pie»; a cambio el hondero se quedó con la Demora: «Piedra pesada» (2 No2, cooldown 3). Las tres subidas a la biblioteca como auditadas (Tiro al pie queda ahí como habilidad de honda).
- Kobold ballestero (`u0yeawa`): igual (Virote a las juntas y Virote al pie, las dos subidas a la biblioteca como auditadas). **Nuevo: Kobold ballestero de ojo fino** (`QUOteZ1m4tvbJk2YMEAI`, copia del ballestero): Virote a las juntas y **Ojo entrecerrado** (1 No2, cooldown 3, no cuenta como ataque: Crítico frecuente +1 por 2 turnos; con él, crítico en el 46 % de los disparos a Larry, 30 % a Petro, 11 % a Bizzante, y cada crítico deja Armadura rota ×2 segura).
- Kobold boom boom (`3045fes`): el arma «Cartucho de dinamita» (Tipo 6 explosivo) rompía las reglas de diseño → **Honda de minero** (nueva en
  el catálogo: Común, 85, Tipo 10, honda, Demora 33 %). **Cartucho**: igual (fuego en área, 5,8 a 7,7 por tiro a los tres, Petro incluido).
  **Cartucho enterrado**: cooldown 5 → 3, sigue lenta; la dificultad para detectarla sale de su Destreza (dueño: alta está bien, es de habilidad).
  Nota del GM: el encuentro arranca con un Cartucho enterrado ya puesto. Las dos habilidades, en la biblioteca como auditadas.
