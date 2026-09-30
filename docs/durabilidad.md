# Durabilidad de armas, escudos y armaduras

> Mecánica nueva del dueño, 2026-09-26, nacida del duelo paso a paso (Parry → Bloqueo). **Estado: reglas definidas casi todas, sin implementar.** Lo que falta decidir está al final y en `preguntas-abiertas.md` (P-Durabilidad).

> **2026-09-30 — la durabilidad es una variable de diseño del ítem** (dueño): cada arma, escudo o armadura puede traer su propio
> `durPorPeso` (puntos por punto de Peso; sin él, 3). Se elige en el asistente de ítems y se ve en el "Ver" de cada ítem. La regla
> vive en `comun/combatiente.js` (`durMax`, `durTexto`). Ver "Escudos: un espacio de diseño propio" en `guia-de-diseno.md`.

## Reglas decididas (dueño, 2026-09-26)
1. **Cuánta durabilidad:** **3 puntos por cada punto de Peso** (armas, escudos y armaduras). Un escudo de peso 3 tiene 9. Sale del Peso del ítem, así que **se calcula: no hace falta cargarla a mano en el catálogo** (el inventario sí guarda la durabilidad actual de cada ítem, por defecto = el máximo). **Las armaduras de Peso 0 tienen un mínimo de 3.**
2. **Cuándo se gasta 1 punto de un arma o escudo:** cuando el defensor **gana el Parry pero pierde el Bloqueo** (el golpe pasa a **mitad de daño**, redondeada **para arriba**) — el punto lo pierde el objeto con el que bloqueó (arma o escudo).
3. **Cuándo se gasta 1 punto de una armadura:** **solo con el efecto Rompe armadura.** Un golpe crítico **no** rompe armadura, ni siquiera de un arma con Rompe armadura: el crítico justamente evita la armadura. (No se rompe por recibir daño común ni por críticos.)
4. **Si el personaje lleva más de una pieza defensiva equipada** y le impacta Rompe armadura, **el sistema elige la pieza al azar**.
5. **Aviso:** al quedar en **1 punto**, se avisa que la armadura, el arma o el escudo está a punto de romperse.
6. **Reparar:** **no se puede reparar durante el combate.** Formas de reparar: **Óleo reparador**, **un herrero** (con precio) y **habilidades por talento que reparan usando despojos** (loot). Como es solo fuera de combate, **el Óleo reparador deja de ser un consumible de cinturón** (hoy es un consumible común "Repara armadura", Común $25).
7. **Creeps:** **no llevan durabilidad.** Pero Rompe armadura **sí les baja la Defensa** (con el estado Armadura rota que ya existe).

## Cambio de modelo (dueño, 2026-09-26): la durabilidad y la Armadura rota son de LOS ÍTEMS, no un estado del personaje
- **Cada ítem lleva su propia durabilidad** (y, las piezas de defensa, su propia **Armadura rota**). **No es un estado que tenga el personaje**: si se saca la armadura, **la armadura sigue rota** (y conserva su estado de Armadura rota).
- **Rompe armadura** le pega a **una pieza equipada elegida al azar** y le suma Armadura rota **a esa pieza** (cada punto le baja 1 la Defensa a esa pieza). El «Armadura rota» del personaje deja de ser un estado suyo: **se calcula sumando el de sus piezas equipadas** (y solo cuenta lo que lleva puesto).
- **El tope de Armadura rota es la durabilidad total de ESA pieza** (antes se decía «la suma de las piezas»: se reemplaza por este tope por ítem).
- **Los creeps y las invocaciones** (mismas reglas de combate, dueño 2026-09-26) siguen igual: no llevan durabilidad, y Rompe armadura les baja la Defensa con su estado Armadura rota (nivel del creep, no de ítems).
- Cambia el diseño técnico: el inventario de cada ítem guarda su desgaste (durabilidad actual y Armadura rota); hay que **migrar el estado Armadura rota que hoy es del personaje** al ítem.
- **Pregunta abierta (propuesta entre paréntesis):** ¿la Armadura rota de una pieza y su durabilidad son **el mismo número**? (sí, en las armaduras: cada punto de Armadura rota es un punto de durabilidad perdido, así la pieza queda rota cuando la Armadura rota llega a su durabilidad total; en armas y escudos la durabilidad se gasta solo por Bloqueo perdido.)

## Parry siempre cuesta 1 Nitro (dueño, 2026-09-26)
El **Parry cuesta siempre 1 No2**, **sin importar el Peso** del arma o escudo (y también sin arma). Ya cambiado en la ficha, en los creeps, en las invocaciones y en el cuadro del duelo. (El Peso sigue sumando al Bloqueo y a la Fuerza del golpe, y define la durabilidad.)

## Confirmado después (dueño, 2026-09-26)
- **Al llegar a 0 la pieza queda rota** (sin efectos, no se destruye): ✅ interpretación correcta.
- **El estado Armadura rota sigue para TODOS**, también para los personajes de los jugadores (se les puede romper la armadura y bajar la Defensa). No queda «solo para creeps»: lo dije mal.
- **Parry sin perder el Bloqueo: no se baja la durabilidad** del objeto (solo se gasta cuando se pierde el Bloqueo).
- **Elección al azar de la pieza (dueño, 2026-09-26):** cuando Rompe armadura impacta a alguien con varias piezas defensivas, el sistema elige **una al azar, sin distinguir por ninguna característica del ítem** (ni peso, ni Defensa, ni tier): todas tienen la misma chance.
- **Precios de reparación (dueño, 2026-09-26):** **herrero: 1 de oro por cada punto de durabilidad reparado**; **talento: 2 de despojos (loot) por cada punto reparado**. (Recordatorio: solo fuera de combate.)
- **Tope de Armadura rota (dueño, 2026-09-26):** el valor de **Armadura rota nunca puede ser mayor que la durabilidad total del objeto** (los stacks no pasan de lo que la armadura puede aguantar). ✅ **Con varias piezas equipadas, el tope es la suma de las durabilidades máximas de las piezas que dan Defensa** (confirmado 2026-09-26). Mecánica: cada golpe con Rompe armadura suma 1 punto de Armadura rota (−1 Defensa) **y** baja 1 la durabilidad de una pieza elegida al azar; así el total de Armadura rota nunca supera la durabilidad total. Si la pieza elegida ya está en 0, se le saca a otra; si todas están en 0, no sube más.
- **Pieza rota (durabilidad 0) = sin efectos (dueño, 2026-09-26):** **se anulan todos sus efectos**, pero **sigue ocupando el slot** («ocupa el lugar, pero es como si no lo tuvieras equipado»). Qué pasa con los **efectos adicionales** (bonos a stats, efectos al golpear, estados que da…) **queda pendiente de revisión con el equipo del dueño**: se cargó como pregunta en 🛠 Herramientas de diseño (pestaña Preguntas).
- **En stand-by:** el **Óleo reparador** (qué es y cuánto repara).

## Cómo encaja con lo que ya hay
- El estado **Armadura rota** (acumulable) que aplica Rompe armadura baja la Defensa en creeps **y en personajes**. Los personajes suman además la **durabilidad de la pieza** (una pieza elegida al azar pierde 1 punto por golpe con Rompe armadura). Falta definir cómo conviven las dos cosas (pregunta 1).
- Pendiente viejo «armadura rota atada al ítem» (`pendientes.md`): la durabilidad de la pieza es la forma de resolverlo.
- Los ítems del catálogo (890) no cambian de datos; sí cambia el inventario guardado y la ficha (mostrar «6/9», avisos, botón de reparar fuera de combate).

## Preguntas abiertas (propuesta entre paréntesis)
1. ✅ **Cómo conviven Armadura rota y la durabilidad de la pieza** (propuesta aceptada por el dueño, 2026-09-26; el tope con varias piezas es la suma): (un golpe con Rompe armadura hace **las dos cosas**: suma 1 stack de Armadura rota —baja 1 la Defensa total, como hoy— y baja 1 la durabilidad de una pieza elegida al azar; una pieza en 0 deja de dar su Defensa; al **reparar** una pieza se le devuelven puntos y se quita un stack de Armadura rota.)
2. **¿Un arma o escudo de Peso 0 tiene el mínimo de 3, como las armaduras?** (sí, mínimo 3 para todo.)
4. *(en stand-by)* Óleo reparador (qué es y cuántos puntos repara).

## Estado de la implementación (2026-09-26, hecha, sin probar en mesa)
**En la ficha** (`ficha-personaje/ficha.html`, bloque «Durabilidad» antes de `collectMods`):
- Cada **arma, escudo y pieza de armadura** (cabeza, torso, manos, piernas, pies) guarda `dur` (actual; sin él vale el máximo) y, las piezas de armadura, `armRota`. **Máximo = 3 × Peso, mínimo 3** (también para armas y escudos de Peso 0). Consumibles, anillos, cinturones y mochilas no llevan.
- **Pieza rota (0):** ocupa el lugar pero **no aporta ningún efecto** (ni bonos ni Defensa) y un arma o escudo roto **no ataca ni para**. **Armadura rota de la pieza:** cada punto baja 1 la Defensa **de esa pieza** (sin pasar de lo que da), sigue aunque se la saque, y **su tope es la durabilidad de la pieza**.
- **Rompe armadura** (`rompeArmaduraAlAzar`): elige **una pieza equipada al azar** que no esté rota, le suma 1 de Armadura rota y le baja 1 de durabilidad (si no queda ninguna, avisa y no pasa nada). Llega por el mismo camino de siempre (el aviso que la ficha aplica sola): **el estado «Armadura rota» del personaje deja de crearse** desde los duelos, las trampas y las habilidades de creeps; el que ya tenían las fichas viejas sigue funcionando hasta que se lo saque.
- **Bloqueo perdido** (duelo, «pasa la mitad»): el mapa del GM le pide a la ficha un **«Desgaste»** del arma o escudo con el que se bloqueó (−1 punto).
- **Avisos:** al quedar en **1 punto** («a punto de romperse») y al **romperse**: cartel y una línea en la Mesa.
- **A mano:** en cada ítem, la línea «🔧 6/9 · Armadura rota ×2» con **−** (un punto menos) y **+** (reparar 1 punto: también devuelve 1 de Armadura rota de esa pieza). La reparación real (herrero 1 de oro por punto, talento con despojos) sigue sin automatizar.
- **Creeps e invocaciones:** sin durabilidad (Rompe armadura les baja la Defensa con el estado de siempre).
**Falta:** reparar con el herrero y el talento (y el Óleo reparador), mostrar la durabilidad en la tienda y el catálogo, el bloqueo de reparar durante el combate, y probarlo en mesa.

**Óleo reparador quitado del catálogo (dueño, 2026-09-26):** se sacó el ítem (catálogo: 889) **hasta que se defina cómo funciona**. La ficha conserva el código viejo que lo reconocía por nombre (para personajes ya guardados que lo tengan); no hace falta tocarlo.

## Reparación con el herrero (2026-09-26, hecha, sin probar en mesa)
- **Tienda con herrero:** en el generador de tiendas (`vendor-generator.html`) hay una casilla **«🔨 Herrero»** y el precio **«Repara a N DDE/punto»** (por defecto **1 DDE por punto**, como decidió el dueño). Se guarda con la tienda.
- **En la ficha**, al abrir una tienda con herrero aparece el botón **«🔧 Reparación»** (al lado de «💰 Vender»). Abre un menú con **cada pieza dañada** (equipada o en la mochila): su durabilidad, la Armadura rota, cuántos puntos faltan y botones **«+1»** y **«Todo»** con su costo, más **«Reparar todo»** abajo. Cada punto reparado **también devuelve 1 de Armadura rota** de esa pieza. Se cobra en DDE de la ficha (avisa si no alcanza).
- **No se puede reparar en combate:** con el mapa en modo combate los botones quedan apagados con el aviso.
- **Vender** ya existía en toda tienda («💰 Vender»: mochila, cinturón y despojos; lo equipado no se vende; el ajuste «Al vender» lo fija cada tienda).
**Falta:** la reparación por **talento con despojos** (2 despojos por punto) y el destino del Óleo reparador; mostrar la durabilidad al comprar.

**Idea a futuro (dueño, 2026-09-26):** usar la durabilidad **como elemento de diseño del catálogo** (escudos y armas resistentes, armas y escudos optimizados para el Parry). Detalle en `pendientes.md` y `guia-de-diseno.md`.
