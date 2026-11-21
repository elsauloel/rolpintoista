# Peso de la Resistencia a crítico (regla vieja vs nueva)

Paso 3 del [plan](plan-resistencia-critico.md), punto 9 de los criterios: cuánto «pesa» la Resistencia a crítico ×1 medida en **Defensas +1**,
antes y ahora, para mantener los precios y ajustar los efectos. Solo cálculo: no se tocó nada del juego. Fecha: 2026-11-04.

## Lo que dicen los números
1. **Antes, Res. T4 ×1 valía como 3 Defensas +1; ahora vale como 1.** Bajó a un tercio. Res. T6 ×1 pasó de 1½ a ½. Res. T8 ×1 de ¾ a ¼.
   Res. T10 ×1 casi no valía antes y casi no vale ahora (≈ 0,05–0,1).
2. **La diferencia entre Tipos bajos y altos sigue siendo grande.** Res. T4 vale unas 4 veces más que Res. T8 y unas 20 veces más que Res. T10,
   por dos motivos: las armas T4 son las más comunes y las que más critean. Las armas grandes casi no critean, así que protegerse de ellas vale poco.
3. **Ahora el segundo punto vale casi lo mismo que el primero** (antes el segundo valía casi nada salvo en T4: con ×1 ya se cortaba el crítico).
   Juntar resistencia rinde parejo; por eso conviene limitarla por slots (criterio 8).
4. **Con la regla nueva, «Res. ×1 contra Tipo 4» pesa lo mismo que Defensa +1** (no un poco menos, como pensábamos): un crítico que no entra
   ahorra mucho daño. Contra Tipo 6 o más, sí pesa menos que Defensa +1.
5. **«+1 a todos los Tipos» pesa 2 Defensas +1** (antes, 5½).
6. **Para mantener los precios**, las piezas que dan resistencia contra Tipos 6, 8 o 10 quedaron «flojas»: pagan mucho por algo que ahora
   vale poco. Las que dan T4 +1 junto con otra cosa quedaron, en general, bien o un poco caras.
7. **Ojo:** estos pesos dependen de contra qué armas se pelea (usé la mezcla del pool esencial y del grupo: 39 % T4, 26 % T6, 26 % T8, 9 % T10) y
   del nivel: en nivel 3 todo lo del crítico vale más que en nivel 1 (tabla abajo).

## Tabla de pesos propuesta (Defensa +1 = 1)

| Efecto | Peso viejo | Peso nuevo (medido) | **Peso propuesto** |
|---|---|---|---|
| Defensa +1 | 1 | 1 | **1** |
| Res. crítico Tipo 4 ×1 | 3,2 | 1,1 | **1** |
| Res. crítico Tipo 6 ×1 | 1,5 | 0,5 | **½** |
| Res. crítico Tipo 8 ×1 | 0,7 | 0,3 | **¼** |
| Res. crítico Tipo 10 ×1 | 0,1 | 0,05 | **¼** (piso: el valor real es menor, pero sube con el nivel y los slots son pocos) |
| Res. crítico a todos los Tipos +1 | 5,6 | 2,0 | **2** |
| Segundo punto del mismo Tipo | casi 0 (salvo T4) | ≈ igual al primero | **igual al primero** |

## Cuánto ahorra cada cosa, por Tipo de arma del que ataca
Daño esperado por ataque que le saca al defensor (promedio de nivel 1 y 3, Evasión 5/8/11, Defensa 5). La última columna es la razón
Res ×1 / Defensa +1 **contra ese Tipo solo** (sin pesar cuán común es el Tipo).

| Arma del que ataca | Defensa +1 | Res ×1 vieja | Res ×1 nueva | 2.º punto nueva | Razón vieja | Razón nueva |
|---|---|---|---|---|---|---|
| Tipo 4 | 0,33 | 3,79 | 1,33 | 1,07 | 11,6 | 4,1 |
| Tipo 6 | 0,48 | 2,71 | 0,85 | 0,67 | 5,7 | 1,8 |
| Tipo 8 | 0,58 | 1,30 | 0,51 | 0,36 | 2,2 | 0,9 |
| Tipo 10 | 0,63 | 0,45 | 0,27 | 0,15 | 0,7 | 0,4 |

Contra un arma Tipo 4, un punto de resistencia ahorra 4 veces lo que Defensa +1. Pero la Defensa sirve contra **todas** las armas y la
resistencia solo contra un Tipo: al pesar cuán seguido aparece cada Tipo, queda la tabla de arriba.

**Por nivel** (razón contra la mezcla de armas):

| | Nivel 1 vieja → nueva | Nivel 3 vieja → nueva |
|---|---|---|
| Res. T4 ×1 | 2,2 → 0,9 | 5,0 → 1,6 |
| Res. T6 ×1 | 0,6 → 0,3 | 2,2 → 0,6 |
| Res. T8 ×1 | 0,04 → 0,04 | 1,2 → 0,5 |
| Res. T10 ×1 | 0 → 0 | 0,15 → 0,1 |
| +1 a todos | 2,7 → 1,2 | 8,7 → 2,8 |

## Ejemplos reales del catálogo (mantener el precio, ajustar efectos)
- **Botas de cuero de vaca** (Común, 50): Defensa +1 · Res. T4 +1. Peso viejo 1 + 3,2 = **4,2**; nuevo 1 + 1 = **2**. El **Chaleco de cuero**
  (Común, 50) da Defensa +2 = **2**. Con la regla nueva quedaron parejos al mismo precio: **no hace falta tocarlas** (antes las botas valían el doble).
- **Escudo de cuero endurecido** (Común, 90): Defensa +2 · Res. T4 +1. Viejo **5,2**; nuevo **3**. El **Escudo pequeño** (Común, 65) da Defensa +2
  = **2**. 90 / 65 ≈ 1,4 y 3 / 2 = 1,5: **queda bien**.
- **Escudo de chapa remachada** (Común, 85): solo Res. T8 +1. Viejo **0,7**; nuevo **¼**. Por 85 hoy da casi nada (el **Peto de hierro**, Común
  de 60, da Defensa +3). **Le falta mucho**: para que 85 siga pagando un volumen parecido a un escudo Común, sumarle algo como Defensa +2 (peso
  ≈ 2¼–2½), o cambiar la Res. T8 por T4/T6 y bajar el precio.
- **Coraza de cuero hervido** (Común, 110): Defensa +3 · Res. T4 +1 · Res.CC +1. Viejo ≈ **6,2 + Res.CC**; nuevo **4 + Res.CC**. Comparada con el
  Peto de hierro (60 por Defensa +3), **sigue cara**: o baja el precio, o suma algo chico (Def. especial +1, Iniciativa…).

## Cómo se calculó
- Cuentas **exactas** (no simulación): las tiradas reales del juego (`comun/tiradas.js`: cada valor se vuelve dados), el crítico con la regla
  nueva (`comun/critico.js`) y la vieja (antes de 970ca52e), el multiplicador del d20 con el supercrítico, empate = moneda.
- Atacante nivel 1 (PdG 9, daño 1dTipo + 5) y nivel 3 (PdG 13, daño 1dTipo + 8); defensor con Evasión 5, 8 u 11 y Defensa 5; sin Crítico
  frecuente ni potente. Los críticos ignoran la Defensa.
- «Valor» = cuánto baja el daño esperado por ataque al sumar Defensa +1 o Res ×1 (y el 2.º punto, de ×1 a ×2).
- Mezcla de armas: las del pool esencial (20 armas: 8 T4, 5 T6, 6 T8, 1 T10) más las del grupo de El origen (T10, T6, T4).
- Scripts fuera del repo: `/tmp/claude-0/-home-user/edeb9ab8-ceef-5963-b361-ad76b93d7e79/scratchpad/medicion-critico/peso.js` y `mezcla.js`.
