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
  afloja la regla aprobada (hoy solo en la cabeza). Falta decidir en qué piezas.

## Preguntas abiertas
1. Tope de crítico por tier: ¿cuenta el potente igual que el frecuente, o es solo para el frecuente?
2. Rango de arcos y pistolas (+4 a +8): ¿es su alcance base, fuera del máximo de +3 por stat?
3. Crítico en anillos y guantes: ¿sí o no?
4. Resistencia Tipo 10: ¿en qué piezas además de la cabeza (torso rígido, escudo…)?
5. Aurelius Risus: ¿se corrige el martillo de su mochila o se resuelve en la mesa?
