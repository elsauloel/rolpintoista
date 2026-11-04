# Propuesta: las armas con crítico que quedaron caras

Paso 3 del [análisis de las armas](analisis-armas-res-critico.md). **Solo propuesta: no se cambió el catálogo.** Fecha: 2026-11-04.
Base: la medición de [medicion-critico-frecuente.md](medicion-critico-frecuente.md), con la moneda que eligió el dueño: **«+1 de daño fijo»**.

## Criterio
- **Se mantiene el precio** y se le da a cada arma lo que le falta para que su precio vuelva a pagar lo que da.
- Lo que vale cada cosa, en «+1 de daño»: **Crítico frecuente +1** = 1½ (Tipo 4) · 1¼ (Tipo 6) · 1 (Tipo 8) · ½ (Tipo 10); **Crítico potente +1** = ¼.
  La calculadora los cobraba de más: por eso «faltan» cosas.
- Lo que se les da: **+1 de daño** (lo más simple), un efecto chico de la casa (Parry, Iniciativa, Rango, Sangrado), o **pasar el Potente a
  Frecuente** cuando tiene sentido (el potente vale poco: «Potente +2 → Frecuente +1» es una mejora de ¾ en Tipo 6 y de 1 en Tipo 4).
- Si le falta menos de ½ daño, se deja como está (el redondeo del precio ya cubre eso).
- Cuenta: lo que le falta a cada una sale de `herramientas/calculadora_armas.py` con los pesos medidos, contra el precio real del catálogo.

## Comunes (12 revisadas: 10 cambian)

| Arma | Le falta | Hoy → propuesta |
|---|---|---|
| **Sable del tahúr** (T6, 75) | 1¼ | Frecuente +1 → **+ 1 de daño** |
| **Facón del matrero** (T6, 90) | 1¼ | Frecuente +1 · PdG en contraataque +1 → **+ 1 de daño · Sangrado 25 %** |
| **Espada del duelista novato** (T6, 95) | 1¼ | Frecuente +1 · Parry +1 → **+ 1 de daño** |
| **Sable fino** (T6, 90) | 1¾ | Potente +2 · Perfora 1 → **Frecuente +1 · + 1 de daño · Perfora 1** |
| **Tenedor de asado** (T4, 80) | 1 | +1 daño · Potente +1 · Sangrado 25 % → **Frecuente +1** en vez del Potente (los pinchos) |
| **Chuza** (T4, 85) | 1 | Alcance +1 · Potente +1 → **Frecuente +1** en vez del Potente |
| **Arco petizo** (T4, 65) | 1 | Potente +1 → **Frecuente +1** |
| **Ballesta de filo fino** (T4, 80) | 1 | +4 daño · Potente +2 → **Frecuente +1** en vez del Potente |
| **Arco de pastor** (T4, 100) | ½ | +1 daño · Potente +1 → **+2 de daño** (sin el Potente; conserva la Emboscada) |
| **Hacha de bombero** (T8, 85) | 1 | Frecuente +1 · Rompe armadura 33 % → **+ 1 de daño** |
| **Mazo de carnicero** (T10, 85) | ½ | Frecuente +1 · Demora 33 % → **+ 1 de daño** (devolverle el que tenía, como a la Estrella del alba) |
| Daga de cota (T4, 70) | — | Queda como está (le sobra un poco). |

Aparte (la recalibró la compu y no entra en esta tanda): el **Punzón de hielo** (80) también quedó corto, ~1 de daño; se le puede sumar +1 de daño.

## Buenas (12 revisadas: 8 cambian)

| Arma | Le falta | Hoy → propuesta |
|---|---|---|
| **Espada del timbero** (T6, 160) | 2 | Frecuente +2 · Perfora 1 → **+ 2 de daño** |
| **Espada del Jefe de los Mil Caminos** (T6, 100) | 2½ | Potente +3 · Sangrado 33 % → **Frecuente +1 · +2 de daño · Sangrado 33 %** |
| **Espada larga** (T6, 150) | 1½ | PdG +1 · Potente +2 → **PdG +1 · Frecuente +1 · + 1 de daño** |
| **Espada de la guardia** (T6, 180) | 1½ | Parry +1 · Potente +2 → **+ 1 de daño · Parry +2** (conserva el Potente: es una espada de defensa) |
| **Aguja de la vigilia** (T4, 160) | 1 | Frecuente +1 · Perfora 2 → **+ 1 de daño** |
| **Arco de tirador fino** (T4, 150) | 1½ | +1 daño · Rango +4 · Frecuente +1 → **+2 de daño · Rango +5** |
| **Hacha con pico** (T8, 150) | ¾ | Frecuente +1 → **+ 1 de daño** |
| **Puñal de sombra** (T4, 200) | ½ | PdG +1 · Potente +2 → **PdG +1 · Frecuente +1** en vez del Potente (le sobra apenas) |
| Arco de puntería (T4, 150) | ¼ | Queda como está. |
| Daga de duelo (T4, 160) · Estilete de competencia (T4, 130) · Estrella del alba (T10, 90) | — | Quedan como están (les sobra un poco). |

## Fuera de las armas
- **Guantes del verdugo** (manos, Buena, 80): Potente +1 · Defensa +1 · Parry +1 quedan cortos (el potente vale ¼). Propuesta: **Frecuente +1 en vez
  del Potente** (el verdugo no falla el golpe).
- **Flecha de aguja** (Buena, 30): Frecuente +1 · Potente +1 (antes Ignora 1). Queda como está.
- Los arcos con frecuente o potente **solo a cierta distancia** (Arco de emboscada, Arco de liebrero) y la «Emboscada» de otros: se cobran aparte,
  con un factor; quedan como están.

## Preguntas
1. ¿Te cierran los cambios de las Comunes y de las Buenas?
2. Con esto el Potente queda, entre las Comunes y Buenas, solo en la Daga de duelo, el Arco de puntería, la Espada de la guardia y la Flecha de aguja.
   ¿Lo dejamos ahí como sabor, o pasamos también esos **Potente +2 a Frecuente +1**?
3. ¿Los Guantes del verdugo con Frecuente +1?
