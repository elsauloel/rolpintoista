# Propuesta: habilidades, estados y pasivas con Resistencia a crítico

> **✅ Respuesta del dueño (2026-11-05) y lo hecho:** **Punto débil: opción A, hecha** — la resistencia a crítico puede quedar negativa
> (`comun/critico.js` y las ventanas del duelo ya no la recortan a 0; el cuadro del crítico la muestra con cuadraditos violeta «P»; la calculadora acepta
> negativos). **Textos corregidos**: Temple, Punto débil (habilidad del Debuffer y el estado), la calculadora del crítico. **«+1 a todos» queda como
> está** («las dejaría así en principio»): no se cambiaron los números. Pasivas y consumibles de resistencia a crítico: el dueño pidió diseñar
> algunos (propuesta aparte).

Paso siguiente del [plan](plan-resistencia-critico.md), después del equipo y las armas. **Solo propuesta: no se cambió nada del juego.** Fecha: 2026-11-05.

## La cuenta
- **Regla nueva** (`comun/critico.js`): cada punto de resistencia contra el Tipo del arma le **suma 1 al rango del crítico, en cada nivel**
  (antes le borraba un nivel entero). La resistencia nunca baja de 0.
- **Pesos** (en «Defensa +1», [peso-resistencia-critico.md](peso-resistencia-critico.md)): **«+1 a todos los Tipos» valía 5,6 y ahora vale 2**.
  Res.Esp / Def. especial +1 = 1. Crítico frecuente +1 ≈ 1½ de daño en Tipo 4 ([medicion-critico-frecuente.md](medicion-critico-frecuente.md)).
- Todas las habilidades de esta lista dan **«+1 a todos los Tipos»** (o se lo sacan al rival): cada una **perdió ≈ 3½ Defensas** de valor.
- **Idea general:** en los buffs temporales, pasar **«+1 a todos los Tipos» → «+2 a todos los Tipos»** (vale 4: queda un poco por debajo de lo que
  valía, y no se suma con lo del equipo de forma desmedida porque dura 2 turnos). El costo y la idea de cada una no cambian.

## De personajes (skills de clase)
| Habilidad | Costo | Hoy (valor viejo → nuevo) | Propuesta (valor) |
|---|---|---|---|
| **Temple** (Tanque) | 2 SP · 1 No2 | +1 a todos, 2 turnos, solo vos (5,6 → 2) | **+2 a todos** (4). Y **corregir el texto**: dice «cada punto le quita un nivel al crítico» (regla vieja) → «cada punto le suma 1 al rango del crítico en cada nivel». |
| **Piel resistente** (Tanque) | 5 SP · 1 No2 | Defensa +5 · Res.Esp +5 · +1 a todos, 2 turnos (15,6 → 12) | **+2 a todos** (14). |
| **Endurecimiento** (Support, a vos o a un aliado → estado Endurecido) | 5 SP · 1 No2 | Defensa +3 · Def. especial +3 · +1 a todos, 2 turnos (11,6 → 8) | **+2 a todos** (10). |
| **Estoicismo** (Warrior, Flash) | 2 SP (4 en turno ajeno) · 0 No2 | +1 a todos · +2 Defensa por enemigo pegado, hasta tu próximo turno (perdió 3,6) | **+2 a todos** (recupera 2). |
| **Punto débil** (Debuffer, maldición) | 3 SP | −1 a todos al rival, 2 turnos | Ver «Punto débil», abajo. **Corregir el texto**: dice «un doble crítico vuelve a ser doble, un crítico simple deja de anularse» (regla vieja). |

## De creeps
| Habilidad | Costo | Hoy (valor viejo → nuevo) | Propuesta |
|---|---|---|---|
| **Piel de hierro** (🎯 auditada; la usa el tanque esencial) | 4 SP · 1 No2 · cooldown 3 | Defensa y Def. especial +(3 + nivel) · +1 a todos, 2 turnos (nivel 1: 13,6 → 10) | **+2 a todos** (nivel 1: 12). Es «Piel resistente + Temple un escalón arriba»: si esas dos suben, esta también. |
| **Tapa de barril** (plantilla de El origen, sin auditar) | 1 No2 · cooldown 2 | Defensa +3 · Armadura mágica +3 · +1 a todos, 1 turno (11,6 → 8) | **+2 a todos** (10). Las copias que ya tienen los creeps de El origen no cambian solas (se actualizan cuando lo pidas). |
| **Aguja siniestra** (🎯 auditada) | 2 SP · 1 No2 | 1d6 siniestro directo + **Punto débil** 2 turnos | Sigue lo que se decida para Punto débil. |
| **Arma siniestra** (el siniestro de Arma elemental) | — | cada golpe deja Herida sombría + **Punto débil** 2 turnos | Sigue lo que se decida para Punto débil. |

## Punto débil (el estado)
Hoy: −1 a la resistencia contra todos los Tipos. Con la regla nueva vale mucho menos, **y contra quien no tiene resistencia no hace nada** (la
resistencia no baja de 0): hoy un personaje con equipo Común o Bueno junta en promedio ~1,3 contra Tipo 4, ~0,6 contra Tipo 6 y casi nada contra 8
y 10, así que la mayoría de las veces Punto débil no cambia nada.
- **Opción A (recomendada): que pueda bajar de 0.** −1 sigue siendo −1, pero contra alguien sin resistencia funciona como si **todos los que le
  pegan tuvieran Crítico frecuente +1** (el rango baja 1, mínimo 2). Siempre sirve, es fácil de explicar («le entran los críticos más fácil») y
  vale ≈ 1½ de daño por golpe con Tipo 4 para todo el grupo, 2 turnos: acorde a una maldición de 3 SP. Hace falta un cambio chico en el código
  (dejar que la resistencia sea negativa solo por estados).
- **Opción B: −2 a todos** (sin tocar el código). Sigue sin hacer nada contra quien no tiene resistencia.

## Lo que no cambia
- **Habilidades con Crítico frecuente** (Tajear, Degollar, Ojo de asesino, Headshot, Golpe brutal, Tajo veloz, Tiro certero…), el estado **Ojo
  certero** y el **Pergamino de Ojo del Verdugo**: el frecuente **vale más** que antes (compensa la resistencia punto por punto). Quedan como están.
- **Pergamino de Blindaje** (inmune a críticos): no lo toca la regla.
- Ningún consumible ni pasiva da resistencia a crítico (la pasiva «Temple mágico» es otra cosa: Res. mental).

## Para después (fuera de este paso)
- **Habilidades con Crítico potente** (Zarpazo +2, Lisiar +2, el estado «Crítico potente» +1, y el +1 de Golpe brutal, Degollar, Headshot…): el
  potente vale ≈ ¼ de daño por punto. Con la regla de las armas («subirle el potente hasta emparejar, tope +6») quedarían cortas. ¿Las revisamos
  en otro paso?
- **Textos con la regla vieja fuera de las habilidades:** la calculadora del crítico (`comun/critico.js`, «cada punto le quita un nivel al
  crítico») y el dibujo del crítico en el duelo (`comun/duelo.js`, «los que anula la Resistencia a crítico quedan tachados»): revisar que muestren
  la regla nueva. El manual ya la explica bien.

## Preguntas
1. ¿Te cierra pasar **«+1 a todos» → «+2 a todos»** en Temple, Piel resistente, Endurecimiento, Estoicismo, Piel de hierro y Tapa de barril?
2. **Punto débil:** ¿opción A (que pueda bajar de 0: siempre sirve, como un frecuente +1 para todos los que le pegan) u opción B (−2, sin tocar el código)?
3. ¿Revisamos después las habilidades con **Crítico potente**?
