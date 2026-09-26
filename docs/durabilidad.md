# Durabilidad de armas, escudos y armaduras

> Mecánica nueva del dueño, 2026-09-26, nacida del duelo paso a paso (Parry → Bloqueo). **Estado: reglas definidas casi todas, sin implementar.** Lo que falta decidir está al final y en `preguntas-abiertas.md` (P-Durabilidad).

## Reglas decididas (dueño, 2026-09-26)
1. **Cuánta durabilidad:** **3 puntos por cada punto de Peso** (armas, escudos y armaduras). Un escudo de peso 3 tiene 9. Sale del Peso del ítem, así que **se calcula: no hace falta cargarla a mano en el catálogo** (el inventario sí guarda la durabilidad actual de cada ítem, por defecto = el máximo). **Las armaduras de Peso 0 tienen un mínimo de 3.**
2. **Cuándo se gasta 1 punto de un arma o escudo:** cuando el defensor **gana el Parry pero pierde el Bloqueo** (el golpe pasa a **mitad de daño**, redondeada **para arriba**) — el punto lo pierde el objeto con el que bloqueó (arma o escudo).
3. **Cuándo se gasta 1 punto de una armadura:** **solo con el efecto Rompe armadura.** Un golpe crítico **no** rompe armadura, ni siquiera de un arma con Rompe armadura: el crítico justamente evita la armadura. (No se rompe por recibir daño común ni por críticos.)
4. **Si el personaje lleva más de una pieza defensiva equipada** y le impacta Rompe armadura, **el sistema elige la pieza al azar**.
5. **Aviso:** al quedar en **1 punto**, se avisa que la armadura, el arma o el escudo está a punto de romperse.
6. **Reparar:** **no se puede reparar durante el combate.** Formas de reparar: **Óleo reparador**, **un herrero** (con precio) y **habilidades por talento que reparan usando despojos** (loot). Como es solo fuera de combate, **el Óleo reparador deja de ser un consumible de cinturón** (hoy es un consumible común "Repara armadura", Común $25).
7. **Creeps:** **no llevan durabilidad.** Pero Rompe armadura **sí les baja la Defensa** (con el estado Armadura rota que ya existe).

## Confirmado después (dueño, 2026-09-26)
- **Al llegar a 0 la pieza queda rota** (sin efectos, no se destruye): ✅ interpretación correcta.
- **El estado Armadura rota sigue para TODOS**, también para los personajes de los jugadores (se les puede romper la armadura y bajar la Defensa). No queda «solo para creeps»: lo dije mal.
- **Parry sin perder el Bloqueo: no se baja la durabilidad** del objeto (solo se gasta cuando se pierde el Bloqueo).
- **Elección al azar de la pieza (dueño, 2026-09-26):** cuando Rompe armadura impacta a alguien con varias piezas defensivas, el sistema elige **una al azar, sin distinguir por ninguna característica del ítem** (ni peso, ni Defensa, ni tier): todas tienen la misma chance.
- **Precios de reparación (dueño, 2026-09-26):** **herrero: 1 de oro por cada punto de durabilidad reparado**; **talento: 2 de despojos (loot) por cada punto reparado**. (Recordatorio: solo fuera de combate.)
- **Tope de Armadura rota (dueño, 2026-09-26):** el valor de **Armadura rota nunca puede ser mayor que la durabilidad total del objeto** (los stacks no pasan de lo que la armadura puede aguantar). *Falta aclarar con varias piezas equipadas: propuesta, el tope es la suma de las durabilidades máximas de las piezas que dan Defensa.*
- **Pieza rota (durabilidad 0) = sin efectos (dueño, 2026-09-26):** **se anulan todos sus efectos**, pero **sigue ocupando el slot** («ocupa el lugar, pero es como si no lo tuvieras equipado»). Qué pasa con los **efectos adicionales** (bonos a stats, efectos al golpear, estados que da…) **queda pendiente de revisión con el equipo del dueño**: se cargó como pregunta en 🛠 Herramientas de diseño (pestaña Preguntas).
- **En stand-by:** el **Óleo reparador** (qué es y cuánto repara).

## Cómo encaja con lo que ya hay
- El estado **Armadura rota** (acumulable) que aplica Rompe armadura baja la Defensa en creeps **y en personajes**. Los personajes suman además la **durabilidad de la pieza** (una pieza elegida al azar pierde 1 punto por golpe con Rompe armadura). Falta definir cómo conviven las dos cosas (pregunta 1).
- Pendiente viejo «armadura rota atada al ítem» (`pendientes.md`): la durabilidad de la pieza es la forma de resolverlo.
- Los ítems del catálogo (890) no cambian de datos; sí cambia el inventario guardado y la ficha (mostrar «6/9», avisos, botón de reparar fuera de combate).

## Preguntas abiertas (propuesta entre paréntesis)
1. **¿Cómo conviven el estado Armadura rota y la durabilidad de la pieza en un personaje?** (un golpe con Rompe armadura hace **las dos cosas**: suma 1 stack de Armadura rota —baja 1 la Defensa total, como hoy— y baja 1 la durabilidad de una pieza elegida al azar; una pieza en 0 deja de dar su Defensa; al **reparar** una pieza se le devuelven puntos y se quita un stack de Armadura rota.)
2. **¿Un arma o escudo de Peso 0 tiene el mínimo de 3, como las armaduras?** (sí, mínimo 3 para todo.)
4. *(en stand-by)* Óleo reparador (qué es y cuántos puntos repara).
