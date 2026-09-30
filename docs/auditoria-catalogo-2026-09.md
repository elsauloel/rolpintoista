# Auditoría del catálogo contra los criterios de diseño (2026-09-30)

> Pedido del dueño a raíz de una partida: una tienda generada al azar ofreció un **Martillo de sargento con Crítico +10**.
> Hoja de trabajo para ir decidiendo e ir aplicando por partes (también desde otra conversación). Criterios de base:
> [`rework-armas.md`](rework-armas.md), [`rework-defensa.md`](rework-defensa.md), [`guia-de-diseno.md`](guia-de-diseno.md).
> Relacionado en "A desarrollar": auditar el catálogo, crítico de armas de tipo alto, supercrítico.

## Origen del martillo
No es un ítem del catálogo actual (ahí el Martillo de sargento tiene solo Parry +1): es una **copia congelada** de antes del
2026-09-25, cuando "Crítico" usaba la escala vieja. La tienda publicada de *El origen de las especies* (generada el 18/09)
guarda su propia copia de cada ítem, y **Aurelius Risus** lo compró y lo tiene equipado con Crítico frecuente +10. Otras
copias viejas en mochilas: Escudo de acero laminado (Petro EskanderSon, resistencia Tipo 6 en vez de Tipo 8) y Coraza de
guardia de cuartel (Ricardo Maravilla, un punto de resistencia de más). Causa de fondo: tiendas y mochilas no se enteran
cuando se corrige un ítem (pendiente "🔔 en ítems comprados"). Desde el 2026-09-30 el Ver de cualquier ítem tiene
"✎ Editar y subir" (`comun/editar-item.js`).

## Lo que encontró el escaneo (catálogo de fábrica, 889 ítems)
Las reglas del rework se aprobaron, pero **el reajuste de los ítems que ya existían nunca se aplicó** (las auditorías de
armas y defensa no tienen decisiones guardadas).
- **Armas:** 8 con crítico por encima del tope de su tier; Facón de Martín Fierro con frecuente +4 en Tipo 4; varias con
  más bonos que su tier; 6 con "Ignora 1 de Res. crítico" fuera de lugar; 13 con efectos descartados (Ignora armadura,
  Arruina/Media armadura, Explosión, Pajaritos, Empuje, Estruendo, Primera sangre, Golpes seguidos).
- **Defensa:** 19 con resistencia al crítico por encima del tope; ~120 con resistencia en lugares no permitidos; 25 con
  Defensa muy alta para su tier y lugar.
- **Otros:** crítico en anillos y guantes; Movimiento alto (= Nitros); stats sueltos muy altos; anillos muy caros.

## Decisiones
- **2026-09-30 · Anillos caros:** sí, **son caros a propósito** (de $1200 a $9000 aunque su tier diga otra cosa). No se
  tocan sus precios ni se marcan como hallazgo.
- **2026-09-30 · Resistencia al crítico Tipo 10** (dicho en "A desarrollar"): tiene que ser **algo no tan infrecuente**;
  afloja la regla aprobada (hoy solo en la cabeza). **Decidido el mismo día: se suma a los escudos** (1 y 2 manos) → Tipo
  10 en **cabeza y escudo**, con los mismos topes por tier. Aplicado en `herramientas/reajuste_defensa.py` y
  `rework-defensa.md`.
- **2026-09-30 · Tipo 8 y 10 también en piezas baratas, pocas y elegidas:** dueño: en cascos y escudos, uno de los comunes
  más flojos y dos de Buena Calidad con Res. crítico Tipo 10 +1; algo parecido con el Tipo 8. **Aplicado:**
  - Tipo 10 +1: **Casco de obra abollado** (Común), **Yelmo de guardia** y **Casco de bandas remachadas** (Buena Calidad);
    **Rodela de cuero** (Común), **Escudo triangular** (Buena Calidad) y **Escudo grande** (Buena Calidad).
  - Tipo 8 +1: **Armadura de hojalata** (torso rígido, Común) y **Broquel de bronce** (escudo, Común). En Buena Calidad ya
    había de sobra (5 torsos rígidos y 2 escudos con Tipo 8), así que no se sumó ninguno.
  - El tope por tier (`herramientas/reajuste_defensa.py`) pasa a permitir +1 de Tipo 8 y 10 en Común y Buena Calidad,
    con la aclaración de que son **pocas piezas elegidas a mano**. Precios sin tocar (a revisar con el motor de valor).

- **2026-09-30 · Cascos sin Tipo 8:** dueño: quitárselo a los cascos de Buena Calidad (el Tipo 8 va en torso rígido y
  escudos). Hecho en 7 cascos (texto incluido).
- **2026-09-30 · Auditoría a fondo y marca ⚠️:** reporte completo en [`auditoria-catalogo-reporte.md`](auditoria-catalogo-reporte.md).
  Pedido del dueño: los ítems que ameritan atención llevan **⚠️ adelante del nombre** para reconocerlos en las tiendas
  (88). Se saca al corregir cada uno. Las búsquedas por nombre (ficha, GM Tools, `comun/items-subidos.js`,
  `comun/editar-item.js`, scripts de variaciones) ignoran el ⚠️ (`sinAviso`).

## Preguntas abiertas
1. Tope de crítico por tier: ¿cuenta el potente igual que el frecuente, o es solo para el frecuente?
2. Rango de arcos y pistolas (+4 a +8): ¿es su alcance base, fuera del máximo de +3 por stat?
3. Crítico en anillos y guantes: ¿sí o no?
4. Aurelius Risus: ¿se corrige el martillo de su mochila o se resuelve en la mesa?
