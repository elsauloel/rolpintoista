# Reporte — tramo estructural A1 a A5 (2026-10-02)

Hoja de ruta: [`pendientes.md`](pendientes.md), sección 0. Criterio acordado: primero lo estructural (que el mapa haga todo solo,
sin la ficha ni GM Tools escondidas en un marco invisible), después lo puntual.

## En una frase

El mapa ya no necesita cargar la ficha ni GM Tools escondidas para: contestar los duelos, pasar el turno (Mantenimiento) de
personajes y creeps, poner estados, mostrar Equipo y mochila, el botín del combate y la tienda. Todo eso lo hace con piezas
comunes (`comun/`) que **usan igual la ficha y el mapa**: una sola regla, no dos copias.

## Lo que vas a notar (y lo que no)

| Qué | Antes | Ahora |
|---|---|---|
| Botonera | Interruptor ⚗ para elegir la nueva o la vieja | Siempre la nueva, sin ⚗ ni la marca "(prueba)" en el título |
| Duelo de un jugador que no abrió su Botonera | Contestaba la ficha escondida | Contesta el mapa (se ve igual) |
| ⟳ Mantenimiento | El mapa cargaba la ficha de cada jugador (y GM Tools) en un marco invisible, uno por uno | Lo hace el mapa directo: más rápido y sin marcos |
| "+ Estado" del token | Abría la ficha / GM Tools escondidas | Abre una grilla propia del mapa, igual a la de siempre (con sus preguntas, "Mis presets" y "Crear estado nuevo") |
| 🛡 Equipo y mochila (token y ficha lite) | Ficha escondida | Ventana del mapa, adentro de la Botonera |
| ⚔ Batalla terminada (botín) | Ficha escondida | Ventana del mapa, adentro de la Botonera |
| 🏪 Tienda | Ficha escondida | Ventana del mapa, adentro de la Botonera |

Las ventanas nuevas se ven igual que las de la ficha: usan su mismo dibujo y sus mismos estilos.

## Cómo se probó cada cosa

Todo en "Test con claude elsaulo", con el GM controlando a Silvia (🎮), más las pruebas automáticas (`comun/pruebas.html`:
**209, todas en verde**; sumé 8 nuevas en este tramo).

- **A1 · Duelo sin Botonera abierta**: mapa recién cargado, duelo del creep contra Silvia → aparecieron solas sus opciones de
  defensa (Evasión 1d6, Parry con Cimitarra), Silvia esquivó (2 contra 1); la ficha escondida nunca se cargó.
- **A2 · Mantenimiento de personajes**: quemadura de prueba (−1 por turno, 2 turnos) + dos ⟳ → HP 10 → 9 → 8, la quemadura terminó,
  No2 a full, +1 SP, reporte en la Mesa, una sola vez por turno.
- **A2b · Mantenimiento de creeps**: quemadura de prueba al creep → HP 5 → 4, No2 a full, ataques a 0, contador de GM Tools 3 → 4, línea
  en el 📜 Historial.
- **A3 · "+ Estado"**: Veneno ×3 / 2 turnos a Silvia (guardado y visible en el token); Pajaritos 2 turnos al creep (con su efecto de
  mitad de PdG/Eva); "Crear estado nuevo" abre el asistente y, si se cancela, vuelve a la grilla.
- **A4 · Equipo y mochila**: en combate, sacar / equipar cobra 1 No2 cada vez (6 → 5 → 4) y queda guardado; con el slot lleno aparece
  «Reemplazar o Comparar», la tabla de Comparar y Reemplazar (−2 No2); Escape cierra todo. En la ficha suelta, lo mismo.
- **A5 · Botín**: combate publicado con un ítem → lo de cada jugador, Ver, Comparar, «Sumar a la mochila» (queda en la mochila y en la
  Mesa), y la ventana se cierra sola cuando el GM cierra el botín.
- **A5 · Tienda**: tienda de prueba de 5 ítems con herrero → buscar, carrito y comprar (500 → 480 DDE), vender (+10), reparar bloqueado
  en combate y permitido en narrativo (durabilidad 1 → 3, −2 DDE), cierre del GM, DDE guardado. En la ficha suelta: buscar, carrito y
  comprar.

## Arreglos que aparecieron en el camino

1. **La búsqueda de la tienda / catálogo de la ficha daba error** (desde el 30/9): escribir en "Buscar" rompía. Ya funciona.
2. **Ataque de un creep sin No2 dentro del duelo**: se rechazaba y el aviso quedaba escondido. Ahora pregunta «¿Atacar igual?», gasta lo
   que tenga y deja la línea roja en la Mesa (como con los personajes).

## Qué conviene que mires vos (en orden)

1. **Jugar una sesión normal** y fijarse si algo "no anda" en: el ⟳ Mantenimiento (que a cada jugador le pase el turno), el "+ Estado"
   del token, el 🛡 Equipo, la tienda y el botín. Son las partes que más cambiaron por dentro.
2. **La ventana de la tienda en el mapa**: es la más grande; mirá si se ve cómoda (filtros, carrito) adentro del recuadro.
3. **La grilla de "+ Estado"** del mapa: es nueva (las demás ventanas son las mismas de la ficha); el estilo es parecido al asistente de
   estados.

## Lo que queda y necesita una decisión tuya

Del tramo estructural queda **A6 (el editor)** y algunas ventanas sueltas que todavía abren la ficha o GM Tools escondidas:

- **El editor** (Editar de un ítem o habilidad desde el "Ver", el ⚙ de un estado, Editar/Subir/Reemplazar una habilidad de creep).
- **📊 Stats** de la ficha lite (atributos editables).
- **La Moneda Re-Roll** (el botón 🪙 fijo).
- **🔍 Ver todo** de un creep (ficha lite del GM).
- **Las ventanas del GM de fin de combate** (Finalizar combate y Despojar).

La pregunta está en el chat (y en la hoja de ruta).

## Datos que quedaron en la partida de prueba

Silvia: "Daga de prueba" equipada en lugar de la Cimitarra, un "Martillo de prueba" y un "Aceite resbaladizo" en la mochila, ~468 DDE,
mapa en modo narrativo. La tienda de prueba quedó publicada pero **cerrada**; hay un combate de prueba en estado "cerrado". Como
acordamos, no se restauró nada (se preparan las condiciones antes de cada prueba).

## Lo que vino antes en esta misma conversación (ya reportado)

Ataque de oportunidad (frena, pregunta, elige arma, avisa sin No2 y queda en la Mesa, dura lo que dura el contacto), Botonera nueva
como la de todos, y la hoja de ruta reordenada (`pendientes.md` §0).
