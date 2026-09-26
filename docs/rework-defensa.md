# Rework de la defensa (fase 2) — hoja de trabajo

> Igual que `rework-armas.md`: el asistente propone, el dueño responde, y todo queda escrito para retomarlo desde otra conversación.
> Contexto: P114 (escasez de la Resistencia a crítico por slots) en [`preguntas-abiertas.md`](preguntas-abiertas.md), reglas del crítico en [`guia-de-diseno.md`](guia-de-diseno.md) y hoja de ruta en [`hoja-de-ruta-rework-catalogo.md`](hoja-de-ruta-rework-catalogo.md).
> Sandbox: los slots por Tipo son **diseño del catálogo**, no una regla del juego: en la mesa se puede inventar cualquier ítem con cualquier resistencia.

## Cómo está hoy el catálogo (relevado 2026-09-25)
Slots de equipo: **cabeza, torso (armadura blanda o rígida), manos, piernas, pies, cinturón, escudo (1 o 2 manos) y 2 anillos**. Las resistencias a crítico están en los mods `tipo1…tipo5` (= Tipo 4, 6, 8, 10, 12).
| Res. a crítico | Ítems | Slots donde aparece hoy | Máximo por ítem |
|---|---|---|---|
| Tipo 4 | 104 | todos los del cuerpo, escudos y un anillo | +3 |
| Tipo 6 | 126 | ídem | +2 |
| Tipo 8 | 95 | ídem | +2 |
| Tipo 10 | 23 | torso rígido, cabeza, manos, pies, piernas, escudos, anillo | +2 |
| Tipo 12 | 7 | pies, cabeza, torso rígido, piernas, manos | +2 |
Problema: **casi todos los slots dan casi todas las resistencias**, así que con un equipo entero se acumula mucha y el crítico se vuelve raro. Hay que repartir por slot (P114).

## Propuesta de slots por Tipo (P114) — sin responder
La idea: **un Tipo alto solo lo dan pocos slots**, con un tema (cada Tipo es un tipo de golpe).
| Res. a crítico | Slots que pueden darla | Cantidad | Tema |
|---|---|---|---|
| **Tipo 4** (punzante) | cabeza, torso, manos, piernas, pies, escudo | 6 | Golpes de punta: se frenan con casi cualquier pieza (la más común). |
| **Tipo 6** (cortante) | torso, manos, piernas | 3 | Cortes: torso y extremidades cubiertas (cotas, guanteletes, grebas). |
| **Tipo 8** (hacha) | torso **rígido** y escudo | 2 (sin casco, como dijo el dueño) | Golpes que rompen: solo placas y broqueles. |
| **Tipo 10** (contundente) | **cabeza** | 1 (como dijo el dueño) | Golpes que abollan: solo el casco protege del aturdimiento. |
| **Tipo 12** (explosivo) | **ninguno fijo**: solo cinturón o anillos y piezas legendarias | — | Casi nunca se resiste: es el arma más rara. |
**Valor por ítem según tier** (tope de la resistencia que puede dar una pieza):
| Tier | Tipo 4 | Tipo 6 | Tipo 8 | Tipo 10 | Tipo 12 |
|---|---|---|---|---|---|
| Común | +1 | +1 | — | — | — |
| Buena Calidad | +1 | +1 | — | — | — |
| Raro | +2 | +1 | +1 | +1 | — |
| Excepcional | +2 | +2 | +1 | +1 | — |
| Legendario | +3 | +2 | +2 | +2 | +1 |
**Máximo realista equipado** (con piezas Excepcionales/Legendarias en todos los slots elegibles): Tipo 4 hasta ~+9–12 (**a propósito casi inmune**: los punzantes acentúan el crítico potente, no la cantidad de niveles), Tipo 6 ~+5–6, Tipo 8 +2–3, Tipo 10 +2, Tipo 12 +1. Con equipo de tier medio (Raro): Tipo 4 ~+6, Tipo 6 +3, Tipo 8 +1–2, Tipo 10 +1. *(A calibrar contra el daño de crítico de las armas: ver preguntas.)*
**Compensación:** las armaduras rígidas (más resistencia) cuestan Evasión o Movimiento; las blandas dan Evasión pero solo Tipo 4. Todo, sugerencia de catálogo.

## Preguntas para el dueño
1. ¿Te cierra el reparto de slots (Tipo 4: 6 · Tipo 6: 3 · Tipo 8: 2 · Tipo 10: casco · Tipo 12: casi ninguno)?
2. ¿Tipo 6 en torso, manos y piernas, o preferís otros tres slots (cabeza y pies)?
3. ¿Los topes por tier de la tabla te parecen bien, o querés que la resistencia máxima sea menor?
4. **Tipo 12:** ¿solo cinturón/anillos/legendarias, o directamente ninguno?
5. ¿Las **armaduras blandas** solo dan Tipo 4, o también Tipo 6?
6. Cuando esté decidido, ¿aplico el reajuste automático a los ~150 ítems defensivos (quitar las resistencias en slots no permitidos y bajar topes) para que el dueño audite por lista, igual que con las armas?
