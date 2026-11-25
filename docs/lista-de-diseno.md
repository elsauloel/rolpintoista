# 🎨 Lista de diseño

Pedido del dueño (2026-11-24): «para ordenar el desarrollo vamos a manejar 3 listas»:

| Lista | Dónde | Qué va |
|---|---|---|
| 🛠 **Desarrollo** (la cola) | [`cola-de-pruebas.md`](cola-de-pruebas.md), «🛠 Cola de programación» | Lo que hay que programar o probar, de a una tarea, con «avanzá». |
| 🖥 **Para ver en la compu** | [`pendientes.md`](pendientes.md), «🖥 Para recordarle al dueño cuando esté en la compu» | Lo que el dueño tiene que ver o hacer en la compu (pegar reglas, mirar algo en pantalla grande…). |
| 🎨 **Diseño** (esta) | este archivo | Temas de diseño que necesitan tiempo y dedicación: catálogo, tiers altos del equipo, razas, creeps, pasivas, skills… |

Cómo se usa: cuando aparece un tema de diseño grande, se anota acá (no en la cola). Cuando el dueño decide trabajar uno, se abre la conversación;
lo que salga para programar pasa a la cola de desarrollo. Las preguntas puntuales sin decidir siguen en [`preguntas-abiertas.md`](preguntas-abiertas.md).

## La lista (de lo más corto / simple a lo más largo)

> **Orden (dueño, 2026-11-24):** de menos complejo / largo a más, para ir trabajando de menos a más. Lo nuevo se ubica según eso.

- [x] (✅ decidido 2026-11-25: queda una sola pasiva de +1 Rango, que pasa a llamarse «Rango amplificado» (antes Vista de halcón), para todo lo de rango; Largo alcance arcano se saca → cola) **🔭 Diseñar «Largo alcance arcano»** (dueño, 2026-11-24): hoy da lo mismo que Vista de halcón (+1 Rango); Vista de
  halcón queda. Propuesta de partida: algo propio del Mago, p. ej. +1 al alcance solo de habilidades y varitas.
- [ ] **👢 Más piezas que den Suela gruesa** (dueño, 2026-11-24). Hoy la da una sola: «Suelas de cuero de dragón del pantano» (pies, Buena
  Calidad, Suela gruesa 2). Cada punto resta 1 al daño de lo que se pisa (zonas y trampas del piso).
- [ ] **🧪 ¿Quién puede subir consumibles al catálogo?** (P317, dueño, 2026-11-24: «no sé bien si quiero que cualquiera pueda subir
  consumibles»). Ya decidido: los consumibles propios «a mano» (narrativos, de la partida) no van nunca al catálogo. Queda por pensar el resto
  (consumibles con efectos que sube el grupo, y si se ven en el catálogo sin el 👁).
- [x] (✅ aprobado el boceto el 2026-11-25 → cola para programar) **🧍 El Equipo en una silueta del cuerpo** (dueño, 2026-11-25, con un boceto suyo; «a grandes rasgos me parece un buen comienzo»): cada lugar
  del equipo sobre la silueta (ocupado en verde con el nombre / vacío punteado), «Mano 1» y «Mano 2» a los costados, la espalda (mochila, carcaj)
  arriba, el detalle con el mouse, y la mochila al costado. Boceto de Claude en el scratchpad (`silueta/`). **Falta la silueta**: el dueño va a pasar
  una imagen y Claude solo le ajusta los colores. Después, a la cola para programar (reemplaza la lista de «Equipado»; junto con los títulos de
  las manos y la división Mano 1 / Mano 2 / Equipado al cuerpo, ya en la cola).
- [ ] **🪤 Revisar la creación de trampas** (dueño, 2026-11-24): que el creador de trampas del programa (⚙ Terreno y Formas → 🪤 Trampas, y donde
  más se armen) ofrezca **funciones simples**: daño, aplicar algún estado y alguna otra básica; las trampas de **mecánicas más complejas o efectos
  específicos se resuelven a mano** («✋ A mano»). Revisar qué ofrece hoy el paso a paso y simplificarlo.
- [ ] **🏷 Marcas de las pasivas: racial, criatura, solo personajes** (dueño, 2026-11-24: «no tenemos muy
  delimitadas esas categorías y es un asunto pendiente de diseño que llevará tiempo y dedicación»). Ver `docs/etiquetas-pasivas.md`.
- [ ] **🧙 Más pasivas para Mago, Support y Debuffer** (dueño, 2026-11-24: «pendiente para meterle tiempo y
  dedicación de diseño»): hoy tienen 5–6 pasivas propias cada uno contra 23 del Warrior; tampoco hay ninguna de control.
- [ ] **🏷 Pasivas** — [`etiquetas-pasivas.md`](etiquetas-pasivas.md) (etiquetas hechas; abajo, lo que quedó de diseño).
- [ ] **🧑 Clases / roles de los personajes de los jugadores** — hoy el personaje no dice qué clase es (anotado en la cola como tarea de
  desarrollo para más adelante; el «qué es una clase» es de diseño).
- [ ] **🧬 Razas** (y las marcas de las pasivas «racial / criatura / solo personajes», de abajo).
- [ ] **👹 Creeps** — los roles y sus ideas: [`diseno-roles-creep.md`](diseno-roles-creep.md); los humanoides nuevos:
  [`creeps-humanoides.md`](creeps-humanoides.md); la auditoría de skills: [`auditoria-skills-creep.md`](auditoria-skills-creep.md).
- [ ] **🎯 La «Apuntada firme» de las ballestas** (dueño, 2026-11-24, junto al catálogo): las dos ballestas que la tienen (de mira, de vigía) están
  archivadas; decidir si vuelven al catálogo ampliado (y entonces probarla con clics: misma pieza que la apuntada simple).
- [ ] **📦 Catálogo y tiers más altos del equipo** — [`hoja-de-ruta-rework-catalogo.md`](hoja-de-ruta-rework-catalogo.md) (fases, lo decidido, lo
  pendiente), [`rework-armas.md`](rework-armas.md), [`rework-anillos.md`](rework-anillos.md), [`talismanes.md`](talismanes.md).
- [ ] **📋 Lo de diseño que ya estaba en pendientes** — [`pendientes.md`](pendientes.md), secciones «4. Diseño pendiente», «5. Contenido a
  revisar», «7. Skills de clase» y «8. Crítico y rework del catálogo» (se van pasando acá cuando se retomen).

## Puntuales
