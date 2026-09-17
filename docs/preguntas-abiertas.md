# Preguntas abiertas de diseño

Lista única de huecos de diseño y reglas sin decidir de Rol Pintoísta.
Sirve para no depender de lo que se habló en cada conversación: cuando
algo queda sin decidir, se anota acá; cuando se decide, se pasa a donde
corresponda (plan, manual, código) y se saca de acá (o se marca ✅ con
la respuesta y la fecha, y se limpia de vez en cuando).

**Cómo se usa (regla para todas las conversaciones):**
- Toda pregunta de diseño que quede abierta se agrega acá, en su tema,
  con un número nuevo (no se reutilizan), el contexto mínimo para
  entenderla sin la conversación, y de dónde salió (fecha y tema).
- Si la pregunta tiene una recomendación, se anota como "Propuesta".
- Al responderla: se aplica, se documenta donde corresponda y se marca
  ✅ acá con la respuesta y la fecha.
- Lo marcado `PLACEHOLDER` en el código también cuenta como pregunta
  abierta y tiene que estar listado acá.

Estados: 🔲 abierta · ✅ respondida (pendiente de limpiar)

---

## Sigilo

Diseño en curso: ver "Sigilo (en diseño)" en [`plan-sistema-nuevo.md`](plan-sistema-nuevo.md).

- 🔲 **P1. Costo de entrar en sigilo.** Hoy: 1 No2, marcado "a revisar". ¿Se confirma? *(2026-09-16)*
- 🔲 **P2. Moverse en sigilo.** ¿Cuesta lo mismo que moverse normal o más No2? *(2026-09-16)*
- 🔲 **P3. Tirada de detección: qué se tira.** ¿Qué contra qué (ej. Sigilo contra Percepción)? ¿De qué stats sale cada una? *(2026-09-16)*
- 🔲 **P4. Tirada de detección: quién tira.** ¿El que está escondido, el que vigila, o los dos? *(2026-09-16)*
- 🔲 **P5. Tirada de detección: cuántas.** ¿Una por cada hexágono de la zona de alerta que pisa, o una por movimiento? *(2026-09-16)*
- 🔲 **P6. Otras formas de detectar.** ¿Se puede buscar a propósito (tirada de percepción del GM o de un jugador)? *(2026-09-16)*
- 🔲 **P7. Qué es "acción hostil".** Rompe el sigilo: ¿atacar, lanzar una habilidad ofensiva, algo más? *(2026-09-16)*
- 🔲 **P8. Última posición conocida.** Si alguien entra en sigilo a la vista del otro bando, ¿queda una "marca fantasma" donde se lo vio? *(2026-09-16)*
- 🔲 **P9. Dónde aparece al ser detectado.** ¿Donde está en ese momento o donde se lo detectó durante el movimiento? *(2026-09-16)*
- 🔲 **P10. La ficha del que está en sigilo.** ¿El GM la sigue viendo? Propuesta: sí, solo se oculta el token (la ficha no dice dónde está). *(2026-09-16)*
- 🔲 **P11. Tiradas en la Mesa del que está en sigilo.** ¿Las ve el otro bando? ¿Se une con las "tiradas secretas" pendientes? *(2026-09-16)*
- 🔲 **P12. Sigilo como estado alterado.** ¿Aparece como estado (tipo Veneno/Stun) en la ficha y en gm-tools, para que equipo o habilidades le den bonus? Propuesta: sí. *(2026-09-16)*

## Orientación y campo de visión (mapa)

- 🔲 **P13. Grilla.** Hoy los hexágonos tienen la punta arriba: no se puede mirar "derecho arriba" (las 6 direcciones son derecha, izquierda y 4 diagonales). ¿Se deja así o se gira la grilla (lados planos arriba y abajo)? Propuesta: dejarla. *(2026-09-16)*
- 🔲 **P14. Girar cuesta No2.** Hoy: no cuesta, marcado "a debatir". *(2026-09-16)*
- 🔲 **P15. Mirada al moverse.** ¿El token queda mirando solo hacia donde caminó (y después se corrige)? *(2026-09-16)*
- 🔲 **P16. Diagonales de atrás.** En la zona de alerta, ¿entran los dos hexágonos diagonales de atrás? Hoy sí; solo queda libre el de justo atrás. *(2026-09-16)*
- 🔲 **P17. Obstáculos.** ¿Algo tapa la vista? Si sí, ¿cómo se marcan en el mapa (paredes, árboles, rocas)? El mapa hoy no tiene obstáculos. *(2026-09-16)*
- 🔲 **P18. Automático o manual.** ¿El mapa rompe el sigilo y pide la tirada solo, o avisa y decide el GM? *(2026-09-16)*
- 🔲 **P19. Cuándo se muestra el cono.** ¿Siempre, al seleccionar el token, o solo al que está en sigilo? Propuesta: pintado suave al seleccionar. *(2026-09-16)*
- 🔲 **P20. Quién tiene orientación.** ¿Los creeps también? ¿Las invocaciones? *(2026-09-16)*
- 🔲 **P21. Tamaño del cono.** Hoy 4 filas (1, 2, 3 y 4 hexágonos). ¿Fijo para todos, o lo cambia un stat, habilidad o equipo? *(2026-09-16)*

## Combate y reglas (Iteración 2)

Valores que el código usa pero están marcados `PLACEHOLDER` (bloque `IT2` de `ficha-personaje/ficha.html`; se ven con ⚠ en la ficha).

- 🔲 **P22. Tipo de un ataque sin arma.** Hoy 4 (`IT2.tipoSinArma`). *(código)*
- 🔲 **P23. Redondeo del primer ataque con Tipo impar.** Hoy Tipo ÷ 2 redondeado para arriba (`IT2.redondeoPrimerAtaque`). Con la escala de Tipos 4–12 todos los Tipos son pares, así que solo importa sin arma o con valores cargados a mano. *(código)*
- 🔲 **P24. Rengo e Inmovilizado.** Hoy Rengo cobra 2 No2 por casillero y Inmovilizado no deja moverse. *(código)*
- 🔲 **P25. Tope de X en costos variables.** Hoy no hay tope (solo frena lo que tengas). ¿Hay un máximo, ej. según Inteligencia? *(código)*
- 🔲 **P26. Penalidad por sobrecarga.** Llevar más peso del que se puede no resta nada hoy (antes restaba de Bonos). ¿Qué penaliza? *(código)*
- 🔲 **P27. Conversión de Bonos viejos a SP.** Equipo, estados y catálogo que daban "+N Bonos" hoy dan "+N SP" (1 a 1, `IT2.spPorBono`). ¿Es la conversión correcta? *(código)*
- 🔲 **P28. Estados que tocaban Acciones/Movimiento.** Cansado, Exhausto, Stun, Hypeado, Inmovilizado y Rengo pasaron a Nitros 1 a 1, sin recalibrar. ¿Qué valores llevan? *(código)*
- 🔲 **P29. SP Regen como stat.** Hoy existe con base 0 (solo lo dan habilidades, equipo o estados). ¿Se deja así o se saca el stat? *(2026-09-16)*

## Recompensas

- 🔲 **P30. Experiencia por creep.** Fórmula actual: 40 × nivel + 5 × nivel × (nivel − 1) → 40/90/150/220 (el ejemplo original decía 200 para nivel 4). ¿Se cambia? ¿Tiene que importar el nivel de los jugadores o cuánto costó la pelea? Escapados: 20 %. *(2026-09-16)*

## Herramientas

- 🔲 **P31. Tiradas desde el mapa.** Hoy salen a nombre del usuario. ¿Usan el nombre del token que tengas seleccionado? *(2026-09-16)*
- 🔲 **P32. Hora en el Historial de la sesión.** Se sacó de la Mesa. ¿Se saca también del Historial de la ficha y gm-tools? *(2026-09-16)*
- 🔲 **P33. Catálogo y Excel.** Siguen con los stats viejos (Bonos, sin SP, Nitros ni SP Regen). ¿Se actualizan para que los ítems del catálogo puedan dar esos stats? *(2026-09-16)*
- 🔲 **P34. Dado Fudge** en la grilla de dados. ¿Se agrega? *(2026-09-15)*
- 🔲 **P35. Accesos repetidos.** Con el menú ☰ quedaron duplicados "⌂ Inicio", "🗺 Mapa", "⚔ GM Tools", "⌂ Partida" en las barras de cada herramienta. ¿Se sacan o quedan como atajo? *(2026-09-16)*
- 🔲 **P36. Defensa de los creeps en las Acciones.** La Botonera de los personajes muestra Defensa y Resistencia a críticos con su 🔍. ¿Se suma lo mismo en las Acciones de los creeps? *(2026-09-17)*
- 🔲 **P37. Versión para celular.** Decidido: por ahora solo compu. Se retoma solo si se pide. *(2026-09-17)*
- 🔲 **P38. Caja de herramientas del mapa: quién usa qué.** La barra de la izquierda la ven todos. ¿Lápiz, Formas y Terreno son para todos o algunas solo del GM? *(2026-09-17)*
- 🔲 **P39. Lápiz.** ¿Los trazos los ven todos y quedan guardados, o se borran solos al rato? ¿Colores y grosor? ¿Quién los borra? *(2026-09-17)*
- 🔲 **P40. Formas hexagonales.** ¿Qué objetos son (paredes, cajas, obstáculos)? ¿Bloquean el movimiento o la vista, o son solo dibujo? *(2026-09-17)*
- 🔲 **P41. Terreno (arena movediza, veneno, arena tóxica…).** ¿Qué hace cada uno al pisarlo o al quedarse (daño, No2 extra, estado alterado)? ¿Se aplica solo o es un recordatorio para el GM? *(2026-09-17)*
- 🔲 **P42. Grilla del mapa girada 30° (código).** La grilla pasó de hexágonos "de punta arriba" a "de lado arriba" para poder rotar tokens con el frente alineado a un lado (no a un vértice). Esto corre la posición en pantalla de todo lo que ya estaba puesto: el fondo (imagen del mapa) va a quedar desalineado y hay que volver a ajustarlo (arrastrar + ancho en casillas), y los tokens que ya estaban en el tablero conviene revisarlos y, si hace falta, reacomodarlos a mano. *(2026-09-17)*
