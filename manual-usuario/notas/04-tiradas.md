+++
capitulo: Tiradas y dados
icono: 🎲
resumen: Cómo se tira cada stat, cómo se comparan dos tiradas, qué es un crítico y dónde queda todo registrado.
+++

+++
titulo: Cómo se tira un stat
alias: [Tirada de stat, Dado según stat, Dados, Tirar un stat, Valores impares]
tags: [tiradas, reglas-base, dados]
estado: confirmado
+++
La regla de oro del sistema: **el valor de un stat define qué dado se tira.**

> [!example] La idea
> **Evasión 6 → tirás 1d6.** Cuanto más alto el stat, más grande el dado (y más alto tu resultado promedio).

## Los dados
El sistema usa los dados clásicos de rol: **d4, d6, d8, d10, d12, d20 y d100**. Cuando el stat es chico (1, 2 o 3), la ficha tira un dado "imaginario" del tamaño exacto (por ejemplo 1d3): hay que tirarlo con el 🎲 de la Mesa.

## Valores impares: dado anterior +1
Si el valor es impar, se tira el dado del valor anterior y se **suma 1**.

| Stat | Tirada | | Stat | Tirada |
|---|---|---|---|---|
| 4 | 1d4 | | 9 | 1d8+1 |
| 5 | 1d4+1 | | 10 | 1d10 |
| 6 | 1d6 | | 11 | 1d10+1 |
| 7 | 1d6+1 | | 12 | 1d12 |
| 8 | 1d8 | | 13 | 1d12+1 |

## Valores altos: combinaciones
A partir de 14 no hay un dado único, así que se **combinan dados que sumen el valor en caras**, siempre con **la menor cantidad de dados posible** y, entre opciones parecidas, **la más pareja**.

| Stat | Tirada | | Stat | Tirada |
|---|---|---|---|---|
| 14 | 1d6+1d8 | | 22 | 1d10+1d12 |
| 15 | 1d6+1d8+1 | | 24 | 2d12 |
| 16 | 2d8 | | 26 | 1d6+1d20 |
| 18 | 1d8+1d10 | | 30 | 1d10+1d20 |
| 20 | 1d20 | | 40 | 2d20 |
| 21 | 1d20+1 | | 100 | 1d100 |

> [!tip] No hace falta calcularlo
> La ficha lo hace por vos: al apretar un botón de tirada arma la fórmula sola, y la 🔍 al lado te muestra qué dados salieron y de dónde. También podés tirar lo que quieras con la grilla 🎲 de la [[La Mesa|Mesa]].

> [!info] Esto NO aplica al daño del arma
> El dado de un arma depende de su [[Daño y Tipo de arma|Tipo]] (4, 6, 8, 10, 12) y su peso, no del valor de un stat.

> [!question] Stat en cero o negativo
> ¿Qué pasa con un stat en 0 o negativo (por una penalidad)? Hoy la ficha no tira nada. ¿Se debería tirar un mínimo, o directamente no hay tirada?

+++
titulo: Tirada enfrentada
alias: [Tiradas enfrentadas, Vs, Enfrentar, Tirada vs tirada]
tags: [tiradas, reglas-base]
estado: borrador
+++
La mecánica base del juego es la **tirada enfrentada**: una parte tira a favor de una acción y la otra tira *en contra* para evitarla o resistirla. **El que saca más, gana.** Cada uno tira con el dado que le toca según su stat ([[Cómo se tira un stat]]).

| Situación | Tira uno | Tira el otro |
|---|---|---|
| Un ataque | [[Atacar\|PdG]] del atacante | [[Evasión]] o [[Parry]] del defensor |
| Un hechizo o maldición | Especial del que lo lanza | [[Resistencias\|Res. Mental o Mágica]] del objetivo |
| Detectar a alguien oculto | Especial del que vigila | Destreza del que se esconde (ver [[Campo de visión]]) |
| Un taunt | Especial + 1 | Especial del objetivo |

> [!warning] Ojo con los nombres
> "Defensa" a secas es un stat que resta daño ([[Defensa]]). Lo que tira el defensor contra un ataque es su [[Evasión]] o su [[Parry]].

> [!info] Empates (regla del dueño, 2026-09-26)
> Si las dos tiradas empatan y **solo una lleva un «+» fijo** (el +1 de los stats impares), **gana la que no lo lleva**. Si **las dos lo llevan** (o ninguna), se elige **par o impar**: cualquiera de los dos elige, el que elige primero decide, se tira un dado y gana el que acierta. Automatizado en el [[Atacar|duelo]].
> ¿Todas las resoluciones son "dos tiradas, gana la mayor", o hay también tiradas contra una dificultad fija (por ejemplo, forzar una cerradura)? ¿Hay márgenes o grados de éxito?

+++
titulo: Golpe crítico
alias: [Crítico, Críticos, Crit, Crit%, Crítico frecuente, Crítico potente, Doble crítico]
tags: [tiradas, combate]
estado: borrador
+++
Un **golpe crítico** es un ataque especialmente certero. **No sale de un porcentaje: sale de comparar las dos tiradas.** El crítico lo determina el **Tipo del arma** ([[Daño y Tipo de arma]]).

## Cuándo hay crítico
Después de que el atacante tira su [[Atacar|PdG]] y el defensor su [[Evasión]]:

- Se calcula la **diferencia** = PdG − Evasión.
- El **rango del crítico** es el **Tipo del arma** (4, 6, 8, 10 o 12). Si la diferencia es **igual o mayor** al rango, es un crítico.
- **Nivel del crítico** = diferencia ÷ rango (hacia abajo). Con una diferencia del **doble** del rango es un **doble crítico**, del triple un triple crítico, y así.

> [!example] Ejemplo
> Arma **Tipo 4**. Con una diferencia de 4 a 7 es un crítico; de 8 a 11, un doble crítico; de 12 en adelante, triple.

## Qué pasa al conectar un crítico
1. **Ignora la [[Defensa]]** (la armadura no resta).
2. Se tira **un d20 por cada nivel del crítico** (un doble crítico tira 2d20) y **vale el mejor**. Ese dado da el multiplicador de **todo** el daño del golpe (dados del arma, bono de Fuerza y demás bonos):

| Mejor d20 | Multiplicador |
|---|---|
| Menos de 7 | ×1 (solo ignora la armadura) |
| 7 o más | **doble daño** (×2) |
| 17 o más | **triple daño** (×3) |
| 20 | **cuádruple daño** (×4) |

Algunas habilidades tienen un efecto distinto si el golpe es crítico (en la descripción figura como *"Critical Matters"*).

## Cómo se mejora el crítico
Hay dos formas, con estos nombres:
- **Crítico frecuente ×N:** baja el rango del crítico N puntos (un arma Tipo 4 con frecuente ×1 hace crítico con diferencia 3 y doble crítico con 6). **El rango nunca baja de 2.** Es el stat "Crít.Frec." de la ficha.
- **Crítico potente ×N:** baja los umbrales del d20. El **doble daño baja 1 por punto** (7 − N, hasta 1), el **triple daño 1 cada 2 puntos** y el **cuádruple daño 1 cada 3 puntos**. Es el stat "Crít.Pot." de la ficha.

También hay **estados** para darlos con habilidades o a mano: **Crítico frecuente** y **Crítico potente** (buffs de +1 que se pueden editar y durar unos turnos).

Las armas de **Tipo 6** acentúan el crítico frecuente y las de **Tipo 4** el potente, pero ambas pueden usar las dos herramientas (es una guía, no una regla).

## Cómo se protege uno
Con la [[Resistencia a crítico]]: **cada punto contra el Tipo del arma atacante te quita un nivel de crítico.** Un doble crítico contra 1 punto cuenta como crítico simple; un crítico simple contra 1 punto no es crítico.

Algunos ítems y estados lo anulan: el estado [[Invulnerable]] bloquea cualquier daño, y "Blindado" hace inmune a críticos.

## En las herramientas
La comparación de PdG contra Evasión sigue siendo **a mano** en la mesa. Para el crítico hay una **🎯 Calculadora de crítico** (menú ☰, o el 🎯 del menú de vida de un token): un asistente paso a paso que pide el arma, la PdG, la Evasión y el daño, calcula el nivel, tira los d20 y publica el resultado en la Mesa. Se completa sola con los datos de los tokens. En "Recibe daño" del token se elige el multiplicador (×2, ×3, ×4) y el daño se aplica sin restar la Defensa.

> [!question] En revisión
> Reglas nuevas del 2026-09-25 (P113 y P115 en las preguntas de diseño). Falta llevarlas a todas las habilidades y al catálogo: los ítems con "crítico +N" pasaron a ser Crítico frecuente +N (de 1 a 5) como parche.

+++
titulo: Resistencia a crítico
alias: [Resistencia a críticos, Res. crítico, Res.Crit, Reduce críticos]
tags: [tiradas, equipo, combate]
estado: borrador
+++
La **resistencia a crítico** es un stat que da la armadura (y otros ítems) para **reducir los golpes críticos** de un cierto [[Daño y Tipo de arma|Tipo]] de arma. Hay cinco, una por Tipo: **4, 6, 8, 10 y 12**.

**Cada punto de resistencia contra el Tipo del arma atacante te quita un nivel de [[Golpe crítico|crítico]].** Contra un doble crítico, 1 punto lo deja en crítico simple; contra un crítico simple, 1 punto lo anula.

> [!example] En un ítem
> "Resistencia a críticos tipo 4 y 6: +1" significa que, contra armas de Tipo 4 y de Tipo 6, tu resistencia vale +1.

## Escasez de diseño
Para que nadie sea inmune a los críticos, **cuanto más alto el Tipo, más escasa la resistencia**: la de Tipo 10 tiene que ser muy rara comparada con la de Tipo 4. La idea en estudio es regularlo **por ranuras**: cada Tipo solo lo dan ciertos slots de equipo (por ejemplo, el Tipo 10 solo los cascos, el Tipo 8 dos slots, el Tipo 6 tres, y el Tipo 4 más), así el máximo que se puede juntar queda limitado por diseño. Los **anillos** (mágicos, uno por mano) tienen más libertad de efectos pero son más escasos y caros.

## Convención actual del catálogo (en revisión)
El [[Catálogo de ítems]] sigue hoy una regla suave según la [[Rareza]] (se va a rehacer con los criterios de arriba):

| Rareza | Resistencias que suele dar |
|---|---|
| Común | Tipo 4 y 6 |
| Buena Calidad | Hasta Tipo 8 |
| Raro | Hasta Tipo 8 (Tipo 10 solo en armadura pesada) |
| Excepcional | Hasta Tipo 10 |
| Legendario | Hasta Tipo 12 (de a +1) |

**Los Tipos altos (10 y 12) son raros** y valen de a +1. Hay excepciones a propósito (algunos ítems míticos dan más). Es una guía, no una ley: ver [[La esencia del Rol Pintoísta]].

Ver también: [[Golpe crítico]].

+++
titulo: La Mesa
alias: [Mesa de tiradas, Chat de tiradas, Grilla de dados, Dados 3D, Historial de tiradas]
tags: [tiradas, herramientas, dados]
estado: confirmado
+++
**La Mesa** es la cajita de tiradas compartida: cada dado que tirás desde la [[La ficha|ficha]], la [[La Botonera|Botonera]], [[GM Tools]] o [[El mapa|el mapa]] aparece ahí, **en vivo, para todos**. Es el "chat de tiradas": nadie duda de qué salió.

## Qué ves en una tirada
Quién tiró, qué y con qué fórmula, los dados, y el total. Los [[Efectos al golpear]] de un arma aparecen en una línea resaltada, y las alertas del GM (por ejemplo, [[Ocultar y revelar|el ojo 👁]]) en rojo.

## Tirar dados libres
El botón **🎲 Dados** abre una **grilla estilo Roll20**: D4, D6, D8, D10, D12, D20 y D100, de 1 a 6 dados. Un clic = una tirada publicada en la Mesa.

## Dados 3D
Cada tirada nueva hace rodar **dados 3D** sobre tu pantalla con el resultado real (podés apagarlos o elegir estilo desde la ⚙ o "Personalización"). Se superponen las tiradas de varios jugadores, cada una con el estilo de dados de quien la hizo.

## Limpieza
- El GM puede **borrar todo el historial** (🗑).
- Además, lo que tenga **más de 48 horas** se borra solo cuando el GM abre una herramienta.
- El historial es solo de la sesión: si querés guardar algo, hacé un [[Respaldo de la partida|respaldo]].

> [!info] Confianza entre amigos
> Los dados se tiran en el navegador de cada uno. El juego asume un grupo de confianza: nadie va a "tocar el código" para mejorar su tirada.

+++
titulo: Afortunado
alias: [Ventaja, Tirar dos veces]
tags: [tiradas, estado]
estado: confirmado
+++
**Afortunado** es un [[Estados alterados|estado]] (buff): **toda tirada de PdG, Parry o Evasión se hace dos veces y te quedás con la mejor.** Dura unos turnos (o todo el combate, si viene de un pergamino). Es lo más parecido a una "ventaja" del sistema.

> [!question] Wildcards (P102)
> **El contador volvió a la ficha (2026-09-22)**, en el panel ⭐ Exp y Job: un valor actual y un máximo, los dos a mano, **sin ninguna mecánica todavía** — como Job o DDE pero sin fórmula, solo un número libre. La pregunta de diseño de antes sigue abierta: ¿para qué se usan? La idea original era un recurso diario para **repetir una tirada**. ¿Se retoman con esa regla? ¿Cuántos por día, se acumulan, y se puede repetir la tirada de otro?
