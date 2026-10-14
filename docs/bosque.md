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

## Estado, creep por creep

(En la partida también hay dos «Ladronzuelo del monte», en otro mapa: no son parte de este plan.)

| Creep | Estado |
|---|---|
| Ladrón del monte | ✅ Listo (2026-10-14). Bolsillo ajeno con el Robo: cooldown 3 pero arranca disponible (dueño). Golpe doble = un ataque con su arma que tira dos veces su daño (1d4+1 y 1d4+1, dueño), ignora 1 de Res. crítico y +2 por la espalda en sigilo (probado en el mapa). Chaleco de cuero y Botas de suela de goma (Defensa 2, Sigilo 12). Juego: Desaparecer → Bolsillo ajeno (+2) o Golpe doble por la espalda → huir |
| Goblin hondero ×2 | Sin empezar |
| Goblin de choque ×2 (nuevo) | Sin empezar |
| Lobo gris ×2–3 | Sin empezar |
| Chamán Goblin | Sin empezar |
| Goblin jinete de lobo | Sin empezar |
| Ocultista (nuevo, jefe) | Sin empezar |
