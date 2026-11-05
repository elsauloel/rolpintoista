# Propuesta: habilidades con Crítico potente, la calculadora del crítico y el dibujo del duelo

Pedido del dueño (2026-11-05): «Revisemos las habilidades de crítico potente. Y de paso la calculadora del crítico y el dibujo del duelo».
**✅ Aprobada y cargada (dueño, 2026-11-05: «La revisión de crítico potente en skills. Sugerencias me parecen bien… también en estados y consumibles. Corregir los problemas que encontraste en la calculadora… dale potente más 3»)**: todas las subidas de la tabla (Golpe brutal del Warrior: **Potente +3**; Apuntar: +2X en el mapa, tope 6; Marcar: +2 en el mapa), el estado Crítico potente arranca en +2, las Mano Pesada +2/+4/+6, y los 6 detalles de la calculadora y del dibujo del duelo corregidos (la cuenta siempre a la vista, «doble daño seguro», sin Tipo 12, «− 💢 Punto débil», el frecuente que se pierde por el mínimo de 2 atenuado, sin fila ×1 cuando no puede salir). Base: [medicion-critico-frecuente.md](medicion-critico-frecuente.md) y lo decidido en las armas
([propuesta-armas-critico-caras.md](propuesta-armas-critico-caras.md)).

## Cuánto vale el potente
- Cada punto de potente vale **¼ de daño** (con armas de Tipo 4, 6 y 8; con Tipo 10, casi nada): con +1 casi no se nota.
- Multiplicador promedio cuando hay crítico: sin potente ×1,95 · +1 ×2,0 · +2 ×2,1 · +3 ×2,2 · +4 ×2,3 · +5 ×2,35 · **+6 ×2,5** (desde +6 el doble
  sale siempre, y cada punto más vale la mitad).
- Criterio de las armas (dueño): **subir el potente hasta emparejar, con tope +6**; en Tipo 8 y 10 el potente no importa: si hace falta, otra cosa.
- En las habilidades **el frecuente que traen al lado vale más que antes** (con la regla nueva compensa la resistencia punto por punto), así que
  las que traen «frecuente +1 y potente +1» no quedaron cortas en total: se propone **+2 de potente** para que la parte del potente se note.
  Las que viven del potente (Zarpazo, Lisiar, Apuntar, las pociones) suben más.

## De personajes (costo e idea, iguales)
| Habilidad | Hoy → propuesta |
|---|---|
| **Golpe brutal** (Warrior) | Frecuente +1 · Potente +1 · +2 daño · Guardia baja → **Potente +3** (ver pregunta 2: el Warrior suele usar armas pesadas) |
| **Lisiar** (Asalto, 2 SP) | Frecuente +1 · Potente +2 · Lesión → **Potente +4** |
| **Degollar** (Asalto) | +4 PdG · +7 daño · Frecuente +1 · Potente +1 → **Potente +3** |
| **Ojo de asesino** (Asalto) | +1 PdG · +2 daño · Frecuente +1 · Potente +1 → **Potente +3** |
| **Apuntar** (Shooter, X SP y X No2) | +X PdG · Potente +X → **Potente +2X** (con X = 3, +6: el tope justo) |
| **Headshot** (Shooter, 4 SP, todo o nada) | +2 PdG · +5 daño · Frecuente +1 · Potente +1 → **Potente +4** (vive del crítico: que pague) |
| **Marcar** (Shooter) | contra el marcado: +1 PdG · +1 daño · Frecuente +1 · Potente +1 → **Potente +2** (dura varios golpes) |

## De creeps
| Habilidad | Hoy → propuesta |
|---|---|
| **Zarpazo** (auditada, 2 SP) | Potente +2 · +1 daño → **Potente +5** · +1 daño (el zarpazo salvaje: que se note) |
| **Golpe brutal** | Frecuente +1 · Potente +2 · +3 daño · Guardia baja → **Potente +4** |
| **Degollar** · **Ojo de asesino** · **Finta** | Frecuente +1 · Potente +1 (más lo suyo) → **Potente +3** |
| **Golpe desesperado** | según la vida: +1/+1/+1 daño · +2/+2/+3 daño → **el potente al doble**: +1 frec./+2 pot./+1 daño · +2 frec./+4 pot./+3 daño |
| **Tiro a la cabeza** (estado «Apuntando a la cabeza») | +2 PdG · Frecuente +1 · Potente +1 → **Potente +3** |
| **Ojo certero** (Support, estado, 2 turnos) | Frecuente +2 · Potente +2 → **Potente +4** |

Las plantillas viejas «de El origen» (sin auditar) no entran: se revisan si se auditan.

## Estados y consumibles
| Qué | Hoy → propuesta |
|---|---|
| Estado **Crítico potente** (el que se da a mano) | +1 → **+2** de entrada (se puede editar igual); su texto pasa a «doble daño desde 5» |
| **Poción de Mano Pesada** (Buena, 70) | Frecuente +1 · Potente +1, 3 turnos → **Potente +2** |
| **Poción de Mano Pesada mayor** (Buena, 130) | Frecuente +1 · Potente +2 → **Potente +4** (hoy paga 60 más por ¼ de daño) |
| **Poción de Mano Pesada superior** (Raro, 250) | Frecuente +1 · Potente +3 → **Potente +6** |
| Flecha de aguja, Guantes del verdugo | ya resueltos (quedan como están) |

## La calculadora del crítico (revisada: calcula bien la regla nueva)
Capturas: `critico-calc-punto-debil.png`, `critico-calc-minimo2.png`, `critico-calc-resistencia.png` (en el scratchpad de la sesión).
1. **Cuando el frecuente y la resistencia se compensan, esconde la cuenta.** Tipo 6, frecuente 1, resistencia 1 → dice «rango 6» sin explicar por qué.
   Arreglo: mostrar «(Tipo 6 − frecuente 1 + Resistencia 1)» siempre que haya frecuente, resistencia o Punto débil.
2. **Con potente +6 dice «Doble daño con 1+»**. Arreglo: «doble daño seguro».
3. **El selector ofrece «Tipo 12»**, que no existe por ahora. Arreglo: sacarlo.
- Lo demás está bien: el Punto débil aparece como «− Punto débil 1», el mínimo de 2 se avisa, y los umbrales con potente salen bien.

## El dibujo del crítico en el duelo (revisado en el código)
1. **Con Punto débil los textos dicen «+ Resistencia a crítico -1»** (título del dibujo, la cuenta y «que la Resistencia sube -1»). Arreglo: «− Punto
   débil 1», como en la calculadora.
2. **Si el frecuente choca con el mínimo de 2, dibuja menos «F» de las que tiene** (frecuente 2 con Punto débil 1: una sola «F», y la leyenda dice
   «Crítico frecuente (1)»). Arreglo: dibujar la «F» que se pierde atenuada, con la leyenda «se pierde por el mínimo de 2».
3. **Con potente +6, la tabla de multiplicadores muestra «×1 · menos de 1»** (no puede salir) y «×2 · 1 o más». Arreglo: ocultar la fila ×1 cuando no
   puede salir y decir «siempre».
4. La «P» violeta del Punto débil → un emoji (ya lo pidió el dueño; va en la otra tanda).

## Preguntas
1. ¿Te cierran las subidas de potente (personajes, creeps, estados y pociones)?
2. **Golpe brutal** del Warrior, que suele ir con armas pesadas (Tipo 8–10, donde el potente casi no rinde): ¿Potente +3, o en vez de subir el
   potente, **+1 de daño** (queda +3)?
3. ¿Arreglo los 3 detalles de la calculadora y los 3 del dibujo del duelo?
