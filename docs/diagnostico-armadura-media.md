# Diagnóstico: la armadura media (2026-10-10)

> Pedido del dueño: «analicemos la armadura media, busquemos un diagnóstico, potenciales problemas y soluciones». Hecho con el inventario real
> del catálogo (Común y Buena: no hay defensas Raras activas) y el simulador de peleas con piezas reales
> ([`balance-peleas-armadura-real.md`](balance-peleas-armadura-real.md)). Nada de esto está aplicado: son opciones para decidir (P190).

## Lo que se midió

**De dónde sale la Defensa** (promedio por parte; entre paréntesis, el máximo):

| Parte | Común: Defensa · sin Defensa | Buena: Defensa · sin Defensa |
|---|---|---|
| Cabeza | 0,4 (3) · 68 % | 0,9 (3) · 48 % |
| Torso blando | 0,7 (3) · 58 % | 0,9 (4) · 60 % |
| **Torso rígido** | **2,9 (5)** · 6 % | **4,0 (6)** · 5 % |
| Manos | 0,3 (1) · 68 % | 0,5 (2) · 59 % |
| Piernas | 0,4 (1) · 63 % | 0,7 (3) · 55 % |
| Pies | 0,4 (1) · 59 % | 0,6 (2) · 59 % |
| Escudo | 0,9 (2) · 34 % | 1,2 (3) · 34 % |

**En qué gastan el presupuesto las piezas sin Defensa:** Defensa especial (en 30–80 % de las piezas de cada parte), resistencias elementales,
Percepción, Visión, PdG en oportunidad, Parry, Bloqueo, Vida. La Defensa especial cuesta lo mismo que la Defensa (1 punto) pero solo sirve
contra daño especial.

**Lo que cuesta ir pesado:** casi nada. El tercio de piezas más defensivas pesa un poco más (Carga) y algunas traen −1 Iniciativa o −1/−2
Evasión o Sigilo, pero son pocas.

**El guerrero según cómo se arme** (hacha a dos manos, nivel 3, simulador con piezas reales):

| Cómo se arma | Defensa | Res. T4 | vs Asalto | vs Tirador | vs Tanque | vs Mago |
|---|---|---|---|---|---|---|
| Piezas «medias» (el tercio del medio) | 5,4 | 0,8 | 14 % | 15 % | 16 % | 40 % |
| Las piezas más defensivas | 11,9 | 2,0 | **81 %** | **76 %** | 46 % | 41 % |

## Diagnóstico

1. **No existe una «armadura media».** Las piezas son o muy defensivas (el torso rígido y algunas pocas) o utilitarias (Defensa 0 y otros
   bonos). En las partes que no son el torso, entre la mitad y dos tercios de las piezas no dan Defensa. El que no elige «lo más pesado» queda
   casi desnudo (Defensa 3–5).
2. **La Defensa está concentrada en el torso rígido.** Manos, piernas y pies dan a lo sumo 1 (Común) o 2–3 (Buena).
3. **El presupuesto se va en defensas situacionales.** La Defensa especial y las resistencias elementales cuestan lo mismo que la Defensa y
   aparecen en muchísimas piezas: compiten con la Defensa física, que es la que se usa todo el tiempo.
4. **Ir pesado casi no tiene contras.** Por eso lo pesado domina, y no hay una razón para elegir algo «medio».
5. **El guerrero no está roto: depende de ir pesado.** Con las piezas más defensivas pasa de perder casi todo a ganarle al asalto y al tirador.
   Lo que no tiene es una opción intermedia que le deje algo de movilidad o utilidad sin quedar desnudo.
6. Aparte (no es de la armadura): a nivel 1 el tirador que mantiene la distancia y el mago le ganan al guerrero aunque vaya pesado.

## Soluciones posibles (para elegir; se pueden combinar)

- **A. Tres pesos por parte del cuerpo**, como identidad de diseño: **liviana** (cuero: Defensa 0–1, un bono utilitario, sin contra), **media**
  (cota: Defensa 1–2 + un bono chico, contra chica: Sigilo −1) y **pesada** (placas: Defensa 2–3, contras reales: −1 Evasión o −1 No2 al
  moverse, Sigilo −2, más peso). Que ~1/3 de las piezas de cada parte sea de cada peso. Es la que más ordena.
- **B. Contras reales para lo pesado**, para que la media sea una elección y no un error: −1 Evasión por cada pieza pesada a partir de la
  segunda, o que la armadura pesada suba el costo de moverse, o que pese en la Carga de verdad.
- **C. Abaratar la Defensa en las partes chicas** (manos, piernas, pies, cabeza): que 1 de Defensa ahí cueste menos de la bolsa, o que esas
  piezas traigan Defensa 1 «gratis» cuando son de cota o placas.
- **D. Encarecer o enrarecer la Defensa especial y las resistencias elementales**: que cuesten más que la Defensa (son situacionales) o que
  aparezcan en menos piezas, así el presupuesto vuelve a la Defensa física.
- **E. Bono de conjunto**: llevar 3 o más piezas del mismo peso da +1 Defensa (media) o +1 Res. crítico (pesada).
- **F. Del lado de la clase**: posturas o habilidades defensivas del guerrero (cuando se haga el rework de habilidades).

**Recomendación de Claude:** A como base (le da identidad a cada peso), con B (si no, la pesada sigue dominando) y D (devuelve presupuesto a la
Defensa). C y E, si después de medir hace falta. Antes de rehacer piezas, medir A+B+D en el simulador con un catálogo de prueba.
