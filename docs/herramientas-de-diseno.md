# Herramientas de diseño a contemplar (para el rework de skills y equipos)

> Lista viva de **tipos de efecto y mecánicas** que el dueño quiere tener a mano cuando rehaga las skills y el equipo (2026-09-25).
> No son tareas ni preguntas: son *ingredientes* para diseñar. Cuando se construya alguno, se pasa a la documentación de la herramienta
> que lo use y acá queda marcado ✅. Las preguntas que salgan al construirlos van a [`preguntas-abiertas.md`](preguntas-abiertas.md).
> Recordar la esencia del proyecto ([`../CLAUDE.md`](../CLAUDE.md)): todo esto son **sugerencias e invitaciones**, y si se puede automatizar se
> automatiza; si no, se aclara (⚙ / ✋).

> Ver también la [`guia-de-diseno.md`](guia-de-diseno.md): qué mecánica "le pertenece" a cada familia de arma o elemento.

## 1. Efectos sobre la niebla y la visibilidad (mencionado antes)
Skills, estados o equipo que jueguen con lo que se ve: ampliar o achicar el radio de visión, ver a través de un Sólido, destapar o volver a
tapar niebla, ceguera, visión en la oscuridad, detectar lo oculto o romper el sigilo. Ya existe la base en el mapa (doble niebla, cono de
visión, Sólidos que tapan la vista, sigilo con cono y zona de alerta, 👁 del GM). Falta: un lugar donde un estado o un ítem *modifique* esos
números (hoy el radio `VISION_RADIO` es fijo y solo el GM toca la niebla a mano).

## 2. Efectos sobre la iniciativa (nuevo)
La tabla de iniciativa (`campanas/<id>/mapa/iniciativa`, `{orden, turno, ronda}`) hoy solo se reordena a mano. La idea es que las skills, los
buffs y el equipo puedan moverla:

- **Bajar al fondo** (nombre en español a elegir: *Derribo de iniciativa*, *Retrasar*, *Al fondo de la fila*): manda a un personaje o creep
  al último lugar de la tabla. Ej.: una skill que "tira al fondo" al rival; un efecto de arma que lo hace **al golpear** con cierta
  probabilidad (`efectosGolpe`, p. ej. "Demora": baja 1 lugar, definitivo; ex "Knockdown").
- **Subir** (*Aceleración*, *Adelantar*, *Speed up*): sube al objetivo N lugares (o al primer lugar). Ej.: un buff que sube la iniciativa.
- Variantes a definir: cuántos lugares (N o "hasta el fondo/el tope"), si es una vez o dura N turnos, si afecta a uno mismo o a otros, y si
  se aplica al pasar el turno o de inmediato.
- Cuidado con el nombre: en el juego "derribar" ya se usa para tirar a alguien al piso (efecto de arma "Derribar"); conviene un nombre que
  no se confunda con eso.
- Piezas que ya sirven: `efectosGolpe` (las armas recuerdan y tiran el efecto, sin aplicarlo solas), `iniciativaMover` (▲ ▼ del GM),
  `EstadosAplicar` (estados sobre otros) y las reglas de `mapa/{doc}` (solo el GM cambia `turno`, `ronda` y el largo de `orden`; cualquier
  miembro puede cambiar valores). Un efecto automático sobre la tabla tendría que pasar por el GM o pedir una regla nueva.

## 3. Concepto: "equipo" incluye las armas (aclaración del dueño)
Cuando el juego habla de **equipo** o de cosas **equipadas** se refiere a *todo* lo que uno lleva puesto o en la mano: **armaduras y cosas
defensivas, pero también armas**. Una cosa está *equipada* o está *en la mochila*; las armas se equipan igual que un casco. Al rehacer skills,
ítems y textos hay que respetarlo: "equipo" ≠ "solo lo defensivo". (En el código, `equipado` ya aplica a cualquier ítem del inventario;
lo que hay que cuidar son los textos, filtros y reglas que digan "equipo" queriendo decir solo defensa.)

## Para sumar más
Agregar acá cada nueva herramienta de diseño que el dueño mencione (título, para qué sirve, ejemplos, qué piezas ya existen).
