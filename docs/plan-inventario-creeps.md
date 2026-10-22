# Plan: armas, escudos y talismanes como ítems para todos (personajes, creeps e invocaciones)

> Pedido del dueño (2026-10-22): «vamos a encarar la tarea ardua de unificar el tema de las armas: que tanto para personajes como para creeps e
> invocaciones (con manos), las armas sean un ítem que se agarra, se suelta, la agarra otro… al igual que escudos y talismanes». Antes (mismo día):
> «todo lo que tenga manos debería poder usar lo mismo… con una especie de inventario: si levanta un arma, guarda la suya y después las cambia».
> Cierra P217 y la tarea «🗡 Armas e inventario para creeps e invocaciones» de `pendientes.md`. **Decisiones aprobadas el 2026-10-22; en curso: paso 1.**

## Cómo está hoy (relevamiento del 2026-10-22)

- **Personaje:** cada arma, escudo y talismán es un ítem de `S.inventario` con `equipado`; las manos las reparte `FichaCombate.asignarManos`.
  Se suelta (sale de la mochila) y se levanta (entra) de verdad.
- **Creep:** **una sola arma, en datos sueltos** del creep (`armaNombre`, `armaTipo`, `armaPeso`, `armaFijo`, `armaMods`, `armaEfectos`,
  `armaRasgos`, `armaNatural`…), y una lista aparte `equipo` con escudos, talismanes y el resto. Una segunda arma de los creeps base va al
  `equipo` solo con sus bonos: no puede atacar. La Defensa y la Res. a crítico del equipo se **suman una vez al equiparlo** (no se recalculan).
- **Invocación:** el mismo modelo que el creep, adentro de la ficha de su dueño.
- **Consecuencias:** al desarmar a un creep, su arma «se cae» pero la sigue teniendo (el Desarmado es solo una marca); si otro la levantara, habría
  dos. Por eso hoy un arma caída la levanta solo su dueño (regla provisoria, `puedeLevantarla` en `vtt-hexgrid/js/27`). Lo que levanta un creep
  de otro va a su `equipo` sin poder usarse para pegar. El botín pierde las mecánicas de varitas, talismanes y rasgos (`plantillaDeCatalogo`).
- **Tamaño:** ~45 archivos y ~250 lugares leen el arma suelta de un creep o una invocación (el duelo, las Acciones, las lupas, los costos,
  el botín, GM Tools, los creeps base, los simuladores y ~100 pruebas). La mayoría ya pasa por `Combatiente.armaDeCombatiente`, que arma «un ítem»
  a partir de los datos sueltos: es la pieza por donde conviene empezar.

## Hacia dónde

**Una sola forma para todos:** el creep y la invocación tienen una lista de ítems con la misma forma que la mochila de un personaje (`tipoItem`,
`tipoDado`, `mods` con la Defensa adentro, `efectosGolpe`, rasgos, `natural`, `equipado`). Lo que tiene en las manos es lo equipado de esa lista,
con las mismas reglas de manos que un personaje. Los datos sueltos (`armaNombre`…) dejan de ser la fuente: si algo los necesita (la tarjeta
pública del creep, que leen los jugadores), se calculan a partir del ítem en la mano.

## Los pasos (cada uno se programa, pasa las pruebas, se sube y se prueba en el mapa; las partidas siguen andando entre paso y paso)

1. **Una puerta única para «el arma en la mano»** (sin cambiar datos): `Combatiente.manosDe(x)` / `armaEnMano(x)` devuelve los ítems en las manos
   de cualquiera (personaje, creep o invocación). Todos los lugares que leen `armaNombre`, `armaTipo`, `armaPeso`… pasan a preguntarle a esa puerta.
   Por dentro, para el creep sigue leyendo los datos sueltos. Es el paso más largo y no cambia nada a la vista.
2. **Migración automática de los datos:** al cargar un creep o una invocación (`CreepCalculo.normalizar`, `InvCalculo.migrar`), el arma suelta pasa
   a ser un ítem equipado de su lista; los escudos y talismanes del `equipo` pasan a la forma del personaje (la Defensa adentro de `mods`). La puerta
   del paso 1 pasa a leer la lista. Los creeps base, las armas naturales, el esquema de la IA y GM Tools crean directo en la forma nueva.
3. **Defensa y Res. a crítico calculadas en vivo** desde lo equipado (como el personaje), en vez de sumarse una vez al equipar. Sin esto, soltar o
   levantar un escudo deja la Defensa mal.
4. **Soltar y levantar de verdad:** desarmar (o soltar) saca el ítem de la mano y lo pone en el piso; levantarlo lo mete en la lista de quien lo
   levanta (con la mano libre: «¿Equiparlo?»; con las manos ocupadas: «Reemplazar» o «Guardar», igual que el personaje — el GM elige por el creep).
   Se saca la regla provisoria «solo su dueño». Un creep con su arma guardada y otra en la mano puede cambiarlas (un botón en sus Acciones).
5. **Desarmado deja de ser un estado** (P217): «sin arma en la mano» se ve en el token y en la ficha y se ataca sin arma (el daño sin arma de P150,
   igual para creeps). Lo natural (garras, colmillos) sigue sin caerse ni poder levantarlo otro.
6. **El botín usa los ítems tal cual:** lo que el creep tenía (en la mano y guardado, menos lo natural) cae con todas sus mecánicas (varitas,
   talismanes, rasgos).
7. **Editores:** GM Tools (equipar/desequipar del creep), la ventana de la invocación en la ficha y el editor común muestran «En las manos» y
   «Guardado», con las mismas piezas del personaje.
8. **Limpieza:** se borran los datos sueltos y los caminos viejos (incluidas las pruebas que los usan), cuando todo lo anterior ande en una sesión real.

## Decisiones del dueño ✅ (2026-10-22: «dale con las recomendaciones, me parece bien»)

- **D1 ✅** Desarmado deja de ser un estado: es «no tiene nada en la mano».
- **D2 ✅** Creeps e invocaciones llevan ítems guardados además de lo de la mano; sin límite por ahora (lo maneja el GM).
- **D3 ✅** Cualquiera levanta cualquier arma del piso (se saca «solo su dueño»).
- **D4 ✅** Sin nada en la mano, un creep o una invocación ataca como un personaje sin arma (la regla provisoria de P150).
- **D5 ✅** Las invocaciones entran desde el principio; las que no tienen manos (bestias) quedan solo con lo natural.
- **D6 ✅** Al morir, el creep suelta todo lo que lleva (en la mano y guardado), menos lo natural.
- **D7 ✅ Armas invocadas** (dueño: «la mayoría van a ser bestias, pero puede haber invocaciones con manos, tipo esqueletos, zombies, que pueden
  tener armas, que van a ser armas invocadas… si el creep se desinvoca, el arma desaparece; el arma de una invocación no aparece en el botín y se
  puede seguir usando todo el combate»). El arma de una invocación lleva la marca de qué invocación la trajo: se usa (también si la levanta otro)
  mientras exista su invocación y como mucho hasta el fin del combate; al desinvocarse desaparece de donde esté (en una mano, guardada o en el
  piso); nunca va al botín. Va en el paso 4 (soltar/levantar) y el 6 (botín).

## Las preguntas que hubo antes de programar

- **D1.** ¿Desarmado deja de ser un estado y pasa a ser «no tiene nada en la mano»? (lo que dijo el 22/10; se confirma acá).
- **D2.** ¿Los creeps y las invocaciones llevan ítems guardados (una «mochila» chica) además de lo que tienen en la mano? ¿Con límite?
- **D3.** ¿Cualquiera puede levantar cualquier arma del piso (se saca «solo su dueño»)?
- **D4.** El ataque sin arma de un creep o una invocación: ¿el mismo del personaje (P150)?
- **D5.** ¿Las invocaciones con manos entran también, desde el principio? ¿Y las que no tienen manos (una bestia) quedan solo con lo natural?
- **D6.** Al terminar el combate, ¿el creep suelta todo lo que lleva (en la mano y guardado), menos lo natural?
