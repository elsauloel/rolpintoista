# El editor de la Ejecución, como el cuadro del duelo

> Pedido del dueño (2026-10-15, «estoy en la compu»): «la edición tiene que ser una emulación del mismo menú del duelo; paso a paso te
> aparece el mismo menú, ir hasta la parte del daño y donde se calcula el daño poder modificar ese número; no tener que traducir un menú al
> otro». Boceto mostrado el mismo día; respuestas del dueño abajo. Archivo: `comun/asistente-duelo-hab.js` (sigue en la ventana común
> paso a paso, `comun/paso-a-paso.js`). El dato que guarda (`habilidad.duelo`) es el mismo de siempre: se suman campos, no se cambia nada.

## Cómo se ve (hecho el 2026-10-15)

El dueño, viendo la primera versión (pasos con pestañas): «quiero que visualmente se vea igual el editor de un duelo como cuando uno lo está
ejecutando… uno puede editar qué hace ese botón específicamente en esa instancia»; «va a haber instancias de menúes que sí van a ser diferentes
(el área permanente)… pero visualmente uno va a seguir paso a paso la línea de acciones».

- **El editor ES el cuadro del duelo** (`#ejd-fondo`, con los estilos de `comun/duelo.js`): la misma caja, los mismos recuadros numerados y los
  mismos botones. Cada botón o caja con ✎ abre **debajo** lo que hace en ese momento (`st.pop`):
  - la barrita de arriba: **💰 Costo** y **Tipo** (habilidad dirigida / ataque con tu arma / Flash);
  - **1 Declaración**: el lado «Usa la habilidad / Ataca» (el tipo) y el lado «Se resiste / Objetivo» (a quién, dónde tiene que estar, el área y
    si es del momento o permanece);
  - **🌫 La zona que queda** (solo si permanece): su menú propio (cuánto dura, cuándo afecta, a quién, qué deja, su daño y su resistencia);
  - **2 Contacto**: el botón azul «🎲 Tirar …» (lo que tira quien la usa) y las cajas de «Elegí cómo te defendés» (con qué se resiste; «＋ Otra
    forma de resistirse»);
  - **3 Daño**: el botón grande «🎲 Tirar el daño · …» (de dónde sale, lo que se suma, qué lo frena);
  - **4 Efectos**: las tarjetas con su «✔ Aplicar» y «＋ Efecto» (incluye «✋ Manual»).
  - Un ataque con el arma: PdG (lo que suma al PdG), la defensa (sin Parry), Bloqueo (como siempre), Crítico, Daño y Efectos del golpe, cada
    uno con lo suyo. Un Flash: su botón.
- A la izquierda, el texto de la habilidad (el mismo recuadro 📜 del duelo).

## Lo que pidió el dueño, punto por punto

**1 Declaración**
- **Objetivo**: un enemigo · un aliado · **cualquier personaje** (aliado o enemigo; nuevo: `objetivo: 'cualquiera'`) · uno mismo · área ·
  onda alrededor · cono · línea.
- **Área u onda → «¿Es del momento o permanece?»**:
  - *Del momento*: se resuelve al ejecutar y no deja nada.
  - *Golpea y queda*: se resuelve al ejecutar y además deja una zona (`zonaQueda`).
  - *Solo queda* (solo el área): no golpea al ejecutar; queda la zona (`objetivo: 'zona'`).
  - Si permanece, el paso siguiente define **la zona**: turnos que dura, **cuándo afecta** (en cada turno a quien sigue adentro ·
    a cada paso que dan adentro · al entrar), daño y estado que deja, a quién alcanza, piso o aire.
- **Definición espacial** del objetivo o del centro del área: pegado (adyacente) · dentro del alcance (de tu arma) · dentro del Rango ·
  un número de casilleros · sin límite.

**2 Contacto**
- **Tira**: la lista de siempre + **«Otro stat…»** (una grilla con todos los stats: Destreza, Constitución…) + **«Fórmula propia»**: se
  escribe la tirada directo — dados (`1d4+3`) o un stat más un número (`pdg + 5`).
- **Se resiste con**: lo mismo (lista, «Otro stat…», «Fórmula propia») + Nadie + Otro (a mano).

**3 Daño**
- **De dónde sale**: no hace daño · una fórmula · **el daño de un ataque** (arma + Fuerza) · la diferencia entre las tiradas.
- **Modificador adicional**: un fijo y/o un dado (ej. `+2`, `+1d6`).
- **Qué lo frena** (un botón que abre su menú, no un desplegable): **físico** (la Defensa) · **especial** (la Defensa especial) ·
  **especial directo** (solo las resistencias elementales, si las hay) · el elemento (fuego, hielo, eléctrico, tóxico, ácido, arcano).

**4 Efectos**
- Los más frecuentes (◎ Estado, 💚 Cura, ⚡ Pierde No2) y **✋ Manual**: una caja de texto con tus palabras; al llegar a ese paso en el
  duelo aparece ese texto, aclarando que se aplica a mano.

## Lo que hace falta en el motor (además de la pantalla)

| Qué | Dónde |
|---|---|
| `objetivo: 'cualquiera'` (no sugiere bando) | `combatiente.js` (habEjecucion), `duelo.js` (limpiarHab), mapa js/13 (esValido) |
| Resistirse con fórmula propia o stat + N (`contra` acepta `{formula, etq}` / `{stat, bono}`) | habEjecucion, limpiarHab, `opcionesHab` (la fórmula a la vista); FichaDuelo ya lo tira, falta CreepDuelo / InvDuelo |
| Tirar stat + N (`tiraBono`) | habEjecucion (hoy usa `h.tiradaBono`) |
| La zona que queda: cuándo afecta y a quién (`zonaQueda.enMantenimiento / cadaPaso / amiga`) | mapa js/13 `dueloZonaQueda` |
| Daño de un ataque + modificador (`danoMas`) | habEjecucion |
| Centro del área dentro del Rango o del alcance | habEjecucion (`centroAlcance`) |

## Estado

- [x] Lo del motor (2026-10-15): `objetivo: 'cualquiera'`, la resistencia con fórmula propia o stat + N, `tiraBono`, `zonaQueda` con
  `enMantenimiento / cadaPaso / soloRivales`, `danoFormula` / `danoMas`, `centroAlcance: 'rango'`. Pruebas en `comun/pruebas.html`.
- [x] El editor como el cuadro del duelo (2026-10-15). Visto en el mapa (Claude · pruebas): Flecha a la rodilla y ¡Azuzar! del creep «Bosque
  (prueba)», sin guardar. De paso se arregló que «Editar» una habilidad de creep desde sus Acciones no abría nada (js/12).
- [ ] Que el dueño lo use y diga qué falta (ej. qué otros momentos necesitan su menú propio).
- [ ] Preguntas que quedaron: ¿vista previa en vivo (la tirada que saldría)? (sin respuesta todavía).
