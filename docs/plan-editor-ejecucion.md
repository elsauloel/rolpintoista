# El editor de la Ejecución, como el cuadro del duelo

> Pedido del dueño (2026-10-15, «estoy en la compu»): «la edición tiene que ser una emulación del mismo menú del duelo; paso a paso te
> aparece el mismo menú, ir hasta la parte del daño y donde se calcula el daño poder modificar ese número; no tener que traducir un menú al
> otro». Boceto mostrado el mismo día; respuestas del dueño abajo. Archivo: `comun/asistente-duelo-hab.js` (sigue en la ventana común
> paso a paso, `comun/paso-a-paso.js`). El dato que guarda (`habilidad.duelo`) es el mismo de siempre: se suman campos, no se cambia nada.

## Cómo se ve

- Cada paso es **un recuadro como los del duelo**, con su número: **Costo** (barrita) · **1 Declaración** · **2 Contacto** · **3 Daño** ·
  **4 Efectos** · Listo. Se avanza de a uno (dueño: «una vez que se define eso, se pasa al siguiente paso»); las pestañas de arriba saltan.
- A la izquierda, el texto de la habilidad (el recuadro 📜 que ya está).
- Un ataque con el arma («con arreglos») y una reacción Flash siguen con sus pasos propios (Tu ataque, Al pegar / Flash).

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

- [ ] Etapa 1: la pantalla nueva con todo lo de arriba sobre los datos de hoy + lo del motor.
- [ ] Probar en el mapa (Claude · pruebas) con capturas: editar Sonic Boom, una de área que queda y una con fórmula propia de resistencia.
- [ ] Preguntas que quedaron: ¿vista previa en vivo (la tirada que saldría)? (sin respuesta todavía).
