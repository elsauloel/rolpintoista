# Estado de la lista «A desarrollar» — cotejo con el código (2026-09-26)

> Cotejé la lista de la pestaña 🎨 **A desarrollar** (112 pendientes) con el código de `ficha.html`, `mapa.html`, `gm-tools.html`, `comun/*.js` y los docs. **Método:** búsqueda de la mecánica en el código (regex) + revisión a mano de los que no aparecían. **Límite honesto:** encontrar el código **no prueba que funcione bien**: los ✅ son «existe», no «probado en mesa». Nada se tildó en la lista: eso lo decide el dueño.

## Resumen

| Estado | Cantidad |
|---|---|
| ✅ Hay implementación en el código | 58 |
| 🔶 Parcial | 6 |
| ⬜ No existe / no encontré nada | 20 |
| 🟡 Para probar en mesa | 9 |
| 🔵 Auditorías / rework en curso | 5 |

## ✅ Hay implementación en el código (candidatas a tildar como hechas)

- Se ve donde se lo vio por última vez
- Fijar botón de dados
- Botón parry/eva rojo con Pajaritos
- Editar la armadura rota
- Hotkey E para estados
- Ver defensa y res. a crítico en la botonera
- «Rompe armadura» en vez del 50 %
- SP regen por defecto
- Ctrl+C para formas
- Costo en Nitros del parry = peso
- Bloqueo: peso del arma + Fuerza
- Editar trampas colocadas (engranaje)
- Inteligencia y talentos
- Percepción aumentada
- Rango de visión según la escena (luz)
- Consumibles de luz / curar — Consumibles de visibilidad y luz hechos (2026-09-26); para «curar de veneno», Antídoto y Vendas ya existían.
- Historial (HP/SP)
- La ficha se abre sobre el mismo mapa
- Tiradas de creeps ocultos no visibles para jugadores
- Colocar trampa como efecto de skill
- Gestión de mapas (mapa activo)
- Tiradas de crítico con d20
- Botón ESQUIVAR dice (eva) — El botón dice «🎲 Esquivar (Eva)».
- Toolkit se cierra con T / Esc / clic
- Seleccionar personaje desde el tablero y centrar token
- Botón «next» de iniciativa + línea del primer turno
- Ataque de oportunidad
- Reiniciar el combate
- Reglas del sobrepeso
- Romper y reparar armadura
- Escudo mágico / estado Sentado
- CD del sigilo cuenta al salir del sigilo
- Costo de Nitros del parry con arma / escudo
- Efectos de pasivas (regeneración) automatizados
- Estado Pajaritos en el log de la Mesa
- Iniciativa: círculos del color del equipo
- Atacar por la espalda
- Parry con escudo / escudos con HP
- Iconos de estados en el borde del token + hover
- Ctrl+Z (lápiz, HP, Nitros)
- «Ver todas las zonas» visible con la herramienta de rango
- Hotkeys en la ficha
- Botón Tablero en mapa y para jugadores
- Vincular mapa a grupo mueve los tokens
- «Emboscador» → «Asalto»
- Editar skills de creep desde «Ver»
- Modificadores de stat en skills de creep
- Descripción de skills de creep: usuario vs mesa — `habTextoMesa()` en gm-tools: «Descripción (lo que ve la mesa)» aparte.
- «Aplica estado» a sí mismo en el creador de skills
- Automatizar al poner + HABILIDAD (paso auto)
- Invocaciones paso a paso
- Herramienta universal CREAR ÍTEM — `AsistenteItem.abrir` (comun/asistente-item.js), único para ficha, gm-tools, tiendas y editor.
- Armas custom con cualquier dado
- Catálogo y biblioteca de skills de creep
- Lentes: ver lo que ven los creeps
- Botón «tirar iniciativa» en la tabla
- Menú de vender loot e ítems en tiendas
- Manual integrado al programa

## 🔶 Parciales

- **Menú propio de trampas** — Existe el asistente paso a paso de trampas (`asistente-trampa.js`) y la lista de trampas guardadas del panel izquierdo; no hay un menú «🪤 Trampas» separado como se pedía.
- **Tarjeta de creeps de los jugadores muestra el arma** — La tarjeta 🪪 del creep muestra el equipo en chips; falta confirmar que el arma aparezca entre ellos.
- **Talentos (habilidades sociales): reglas y catálogo** — Están las habilidades sociales y el presupuesto de Inteligencia (manual y ficha), pero **no** un catálogo de «talentos» ni las reglas de carisma, persuasión e intuición.
- **Tienda abierta = publicada** — Hay estado abierta/cerrada de la tienda y lista de publicada; no verifiqué que se igualen.
- **Turnos para objetos** — Los elementos del mapa ya tienen turnos (`turnos`/`venceMant`: portales, fuego, terreno); los objetos de inventario con turnos, no.
- **Lentes (niebla al revés)** — Hay «Visión de los creeps» (👹) y luz portada; la niebla «al revés» como lente de un personaje no está.

## ⬜ No existe (trabajo real por delante)

- **Animación del turno para todos al pasar turno** — No hay una animación compartida del cambio de turno.
- **PJ muerto anula la tabla de turnos** — No encontré que un personaje muerto se saltee la tabla de iniciativa.
- **Daño de colisión CON vs CON** — Hay terreno de Colisión en el mapa, pero **no** el daño mutuo entre dos cuerpos (Con vs Con) ni «chocarse te hace tu Constitución en dado».
- **Auditar las trampas de skills de creep (ignoraDef)** — El mecanismo existe (`ignoraDef` en el paso Trampa), pero **no se auditó ninguna** de las 27 trampas de skills: falta el criterio caso por caso.
- **«Prisa» en pasivas** — No hay una pasiva «Prisa» (hoy el equivalente es el estado Hypeado).
- **«Acción incierta» en el log** — No hay ninguna skill que publique «realizó una acción incierta».
- **Armadura rota asignada a un ítem** — La Armadura rota es un estado del personaje; no queda atada al ítem que se desequipa.
- **Traer mi token al mapa desde el PJ** — No encontré el botón «traer mi token» en la ficha.
- **Ungüento de la turca** — No encontré nada.
- **Días y raciones** — No encontré nada.
- **Fases del día** — No encontré nada.
- **Botón «pasar de día»** — No encontré nada.
- **Tienda «raciones»** — No encontré nada.
- **Robar** — Solo hay habilidades de creep con «robar» en el texto (a mano); no hay mecánica.
- **Tutorial de creación de personaje** — No existe.
- **Pausar sesión durante el combate** — No hay herramienta para pausar el combate entre sesiones.
- **Imagen del token siempre vertical** — No encontré la opción de dejar la imagen del token vertical al rotarlo.
- **Ungüento de la turca** — No encontré nada.
- **Días y raciones · Fases del día · Botón «pasar de día» · Tienda «raciones»** — Bloque 🟣 completo: **no existe** (solo hay ítems de raciones sueltos en el catálogo).
- **Documento para crear un proyecto de Claude con cualquier cuenta (diseñar creeps) · Investigar pathfinder** — No existen.

## 🟡 Para probar en mesa (no se resuelven con código)

- Probar el blindaje
- Testear las trampas y ajustar la trampa de raíces
- Probar las auras con efectos automatizados
- Sigilo: la detección automática de un creep no funcionó / trail de Nitros
- Estado «Pajaritos» en el log de la Mesa (revisar cómo se ve)
- Botonera del PJ: PdGM aparece debajo de DES
- Diferenciar los iconos: token oculto por el máster vs en sigilo
- Revisar la herramienta de skills de creep
- Ctrl+Z para más acciones («evaluar para cuántas»)

## 🔵 Auditorías y rework en curso

- Auditar el catálogo (en curso: armas, defensa y creeps tienen su herramienta de auditoría)
- Auditar el catálogo a fondo: armas mágicas y de rango (armas de rango y explosivos cerradas; las mágicas esperan tu revisión)
- Repasar y auditar las skills de clase, una por una (en pausa, Tanque 8 de 10)
- Volver a pensar los creeps (en curso: `rework-creeps.md`)
- Ajustar la cantidad de ítems que ofrecen resistencias a críticos (hecho por slots, falta tu auditoría)

## Cómo avanzar (propuesta)

1. **Tildar** lo ✅ (el dueño lo aprueba; hoy son 58 entradas).
2. **Bloque «día y descanso»** (⬜ completo): fases del día que fijen la luz de la escena, raciones, «pasar de día», tienda de raciones, turnos para objetos.
3. **Reglas de combate sin implementar:** colisión Con vs Con, muerto anula turno, armadura rota atada al ítem, «acción incierta», animación de turno compartida.
4. **Sociales:** talentos, carisma, persuasión, intuición (decisiones de diseño primero).
5. **Lote de mapa y fichas:** traer mi token, pausar sesión, imagen vertical, «Prisa», menú «🪤 Trampas» propio.

## Actualización (2026-09-26): lo implementado pasó a «Falta testear»
Por pedido del dueño, **62 entradas** de la pestaña 🎨 A desarrollar que el cotejo encontró implementadas se **tildaron como hechas** (salen de la lista de pendientes: de 112 quedaron **50 abiertas**) y cada una se sumó a la pestaña 🧪 **Falta testear** con el texto «Probar en mesa (ya implementado): …». Quedaron en A desarrollar los ⬜ (no existen), los 🔶 parciales y los que necesitan decisiones.
