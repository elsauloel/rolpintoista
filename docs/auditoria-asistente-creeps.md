# Auditoría del asistente de creeps (GM Tools)

> 2026-10-27, dueño: «probá de crearlos desde Chrome, siguiendo el paso a paso, como si fueras con el mouse. Así hacemos una auditoría del menú
> de la creación de creeps». Se crearon los seis creeps del encuentro 1 de El origen (`origen-goblins-cultistas.md`) en ENTRADA MINAS con
> «+ Creep → 🧭 Crear paso a paso», el fabricante, la biblioteca de habilidades, ⚡ Acciones (cinturón) y la ficha ✎ (pasiva). Nada arreglado
> todavía: es la lista para decidir qué se toca.

## Lo que falla o confunde (de más a menos importante)

- [ ] **Bajar «Habilidad lenta» no saca el cooldown.** Al agregar la Red (lenta) quedó con el cooldown activo (4); destildar «Habilidad lenta» en el
  editor y guardar no lo vuelve a 0: el creep quedó con la Red trabada hasta que se tocó ↺ en la tarjeta.
- [ ] **Una varita no aparece como arma.** Equipada desde «Elegir del fabricante» en el paso Arma, el paso sigue diciendo «Sin arma · 1d4»; aparece
  en Armadura como «DEF +0 · arma_1m» (el tipo crudo), y el Resumen dice «Ataque 1d4 + 3» (el puño).
- [ ] **«Defensa total: 0» no se actualiza** en el paso Armadura al equipar piezas (el Resumen sí da bien la Defensa).
- [ ] **No hay paso para pasivas ni para el cinturón.** La pasiva se agrega en la ficha del creep (✎ → + Pasiva) y los consumibles elegidos en
  ⚡ Acciones (no en la ficha): tres lugares distintos para armar un creep. El paso Recompensas solo tiene «consumible al azar».
- [ ] **Los consumibles al azar entran al crear, sin aviso antes** (solo un toast después). Al jefe le tocaron dos (un **Ankh de Reencarnación** y una
  Runa de silencio); al picapiedras justo la Poción de Cuero Duro que se había sacado del diseño. Quizás: mostrarlos en el Resumen antes de crear,
  con «🎲 Otro» y «Sin consumible al azar».
- [ ] **Un viaje por cada habilidad y cada pieza.** «+ Habilidad» abre la biblioteca, se agrega una y se cierra; lo mismo «Equipar del fabricante».
  Un creep de nivel 4 son 5 viajes de habilidades y 6 de equipo. Sugerencia: agregar varias sin cerrar (el botón pasa a «✔ Agregada»).
- [ ] **El buscador encuentra por la descripción antes que por el nombre**: «Salto» trae primero Excavar; «Chaleco de cuero», el Punzón de
  talabartero. Las coincidencias de nombre deberían ir primero.
- [ ] **Paso Atributos: los roles del desplegable son los viejos** («Brutal (pega fuerte)»…), no los de ahora (choque pesado, choque liviano, rango,
  mago, support, debuffer, hunter).
- [ ] **Paso Habilidades: «Se sugiere una rápida y una lenta»** es la regla vieja; la de ahora: nivel 1 = 2 habilidades y una más por nivel.
- [ ] **El paso Costo del editor de una habilidad no muestra el SP** (lo que cobra en modo SP).
- [ ] **Ventana chica**: en el paso 1 el pie (Siguiente) queda debajo del borde de la pantalla.
- [ ] La biblioteca de creeps («+ Creep») lista primero los viejos «(auditar)».

## Lo que anduvo bien

El paso a paso se puede recorrer en cualquier orden y no pierde nada; el Resumen es claro; «¿Crear su token?» al terminar pone el token oculto en el
mapa de la pestaña; el arma del catálogo trae su daño bien calculado (el arco, la mitad del Dmg); los drops fijos se escriben y se ven en «Al morir
suelta»; ⚡ Acciones permite poner varias unidades del mismo consumible y avisa cuando el cinturón está lleno.

## Un error mío al probar (corregido en el momento)

Buscando «Acciones del Goblin tunelero» se abrió el **Kobold tunelero** (viejo) y le agregué una Poción de HP; la saqué enseguida (su cinturón quedó
vacío, como estaba). Lección: con dos creeps de nombre parecido, ubicar la tarjeta en pantalla antes de tocar.
