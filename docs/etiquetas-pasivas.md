# Etiquetas y filtros para las pasivas — hoja de trabajo

> Pedido del dueño (2026-11-22): «que las habilidades pasivas tengan tags y filtros. Por ejemplo, Aguante de trinchera es buena para warrior y para
> tanque y para melee en general, entonces pueden estar esos tags. Buscar cierto universo de tags para poder crear filtros a la hora de elegir pasivas».
>
> **Estado (2026-11-24): propuesta lista, sin programar.** Se conversa con el dueño; lo que decida se anota en «Respuestas del dueño» (al final) y
> recién ahí se programa. Nada de esto cambia qué puede elegir cada uno: **las etiquetas ayudan a encontrar, no prohíben elegir** (esencia sandbox).

---

## 1. Cómo está hoy

**Dónde viven las pasivas**

- **De fábrica**: `comun/pasivas.js`, la lista `PASIVAS_BASE` — **47 pasivas** (una racial de 0 Job, dos de 2 Job, una de 3 Job y el resto de 1 Job).
  Cada una tiene nombre, costo en Job, qué hace (`detalle`), lo que suma y una lista suelta de `etiquetas`.
- **Las subidas por el grupo**: en Firebase, en la Biblioteca (`biblioteca_pasivas`), con el botón **⬆ Subir** de cada pasiva de la ficha
  (`proponerPasiva`, `ficha-personaje/js/10-habilidades-pasivas-e-items.js`). Quedan al instante para todos, «🔶 sin auditar» hasta que el dueño las
  marca ✅. Las etiquetas de una subida las escribe quien la sube, en la ventana «Guardar en la biblioteca» (`comun/biblioteca.js`).

**Qué etiquetas tienen hoy** (sueltas, sin familias; algunas pasivas tienen dos):

| Etiqueta | Cuántas la tienen |
|---|---|
| stat | 21 |
| ofensiva | 18 |
| defensiva | 17 |
| utilidad | 10 |
| resistencia | 3 |
| regeneración | 2 |
| racial · criatura · movimiento · percepción · visión | 1 cada una |

Además, el **asistente de personaje nuevo** las agrupa en cinco categorías que salen de esas etiquetas (`CATEGORIAS_PASIVA` y `categoriaDePasiva` en
`comun/pasivas.js`): 🗡 Ofensivas (18), 🛡 Defensivas (15), ❤ Recuperación (2), ⚡ Recursos (2) y 🧭 Utilidad (10). Una pasiva cae en una sola.

**Quién las elige y dónde**

| Quién | Dónde | Qué ventana se abre |
|---|---|---|
| Un personaje | Ficha → Pasivas → **+ Pasiva** (`abrirPasivaNueva`, js/10) | La ventana de la Biblioteca (`Biblioteca.abrir`, tipo `pasivas`) |
| Un personaje nuevo | Asistente de personaje, paso «Pasivas» (`comun/asistente-personaje.js`, `pasoPasivas`) | Tarjetas propias, con chips por las 5 categorías |
| Una invocación | Ficha → la invocación → + Pasiva (`abrirPasivaNuevaInv`, js/04) | La misma ventana de la Biblioteca |
| Un creep | GM Tools → el creep → + Pasiva (`gm-toolset/js/02-editar-creep-y-recompensas.js`) | La misma ventana de la Biblioteca |
| Los creeps esenciales | Las trae el código (`comun/creeps-esenciales.js`), por nombre | — (las elige el diseño) |

**Cómo es hoy la ventana «+ Pasiva»** (la de la Biblioteca): arriba un **buscador** («Buscar por nombre o descripción…») y una fila de **chips con
todas las etiquetas sueltas** (stat, ofensiva, defensiva…): al tocar varios, la pasiva tiene que tener **todos** a la vez. Para las pasivas no se le pasan
familias (la Biblioteca ya sabe agrupar los chips en menús por familia —lo usan los creeps y las habilidades de creep—, pero las pasivas no lo usan).
Cada fila muestra el nombre, el costo en Job (o «ya la tenés ×2: la próxima copia cuesta 3 Job») y sus etiquetas.

**Lo que falla hoy**: las etiquetas dicen *qué tipo de efecto* es (ofensiva, defensiva), pero **no para quién sirve** (warrior, mago…) ni **con qué
estilo** (cuerpo a cuerpo, distancia). «stat» y «utilidad» son demasiado amplias (21 y 10 pasivas muy distintas: Prisa, Bolsillos extra y Manos de
curandero son las tres «utilidad»). Y las del asistente de personaje nuevo y las de la ventana «+ Pasiva» son dos sistemas distintos.

---

## 2. El universo de etiquetas propuesto

Tres familias para filtrar, más unas pocas marcas aparte. **Dentro de una familia, cualquiera de las elegidas; entre familias, todas** (si marcás
Tanque y Warrior, salen las de uno u otro; si además marcás Cuerpo a cuerpo, de esas, solo las de cuerpo a cuerpo). Es como ya filtra la Biblioteca
los creeps, así que no hay que inventar nada.

### 🎭 Rol — para quién sirve

Los siete roles, con el nombre de la clase y el del rol de creep juntos (son el mismo concepto visto de dos lados):

| Etiqueta | Clase | Rol de creep |
|---|---|---|
| ⚔ Warrior | Warrior | warrior |
| 🛡 Tanque | Tanque | tanque |
| 🗡 Asalto | Asalto | liviano |
| 🏹 Shooter | Shooter | rango |
| ✨ Mago | Mago | mago |
| 💚 Support | Support | support |
| 🧿 Debuffer | Debuffer | debuffer |
| 🌐 Cualquiera | — | — |

- **El Híbrido de los creeps no lleva etiqueta propia**: es «entre warrior y tanque» (`docs/creeps-humanoides.md`), así que lo cubren las dos.
- **🌐 Cualquiera** marca las que le sirven a todos por igual (Robustez, Impulso, Espalda de mula…). Una pasiva puede ser «Cualquiera» y además
  destacar en un rol (Pies ligeros: cualquiera, y sobre todo Asalto y Shooter).

### 🤺 Estilo — con qué pelea

| Etiqueta | Qué incluye |
|---|---|
| 🤜 Cuerpo a cuerpo | Lo que vale pegado o con un arma de mano (Parry, Bloqueo, el Dmg, contraataque, oportunidad, rodeado…) |
| 🎯 Distancia | Lo que vale con arco, ballesta u otra arma de rango (Rango, maestrías de arco y ballesta) |
| 🔮 Mágico | Lo que vale con lo Especial (PdG.Esp, Ef.Esp, SP) |

**Una pasiva sin estilo sirve con cualquiera** (Robustez, Prisa): no se le pone ninguno, y al filtrar por un estilo igual aparece (ver la pregunta 3).

### 🧩 Función — qué hace

| Etiqueta | Qué junta | Ejemplos |
|---|---|---|
| Ataque | Pegar más seguido o más fuerte: PdG, daño, crítico, Perfora, Rango | Puntería, Golpe fuerte, Ojo crítico |
| Defensa | Que no te peguen o te peguen menos: Defensa, Evasión, Parry, Bloqueo, Res. a crítico | Piel curtida, Desvío hábil, Aguante de trinchera |
| Aguante | Más vida o recuperarla vos mismo | Robustez, Regeneración |
| Resistencias | Res.Esp, Res.Mt, Res. al crowd control, inmunidades | Temple mágico, Voluntad de hierro |
| Curación | Curar a otros (o curar mejor) | Manos de curandero |
| Recursos | No2 y SP: más, o que vuelvan | Impulso, Reserva de poder, Sed de batalla |
| Movilidad | Moverse mejor o distinto | Vuela, Escurridizo |
| Turnos | Iniciativa y el orden de turnos | Prisa, Marcar el ritmo, Sed de sangre |
| Percepción | Ver, notar, encontrar lo escondido | Percepción aumentada, Ojo avizor |
| Sigilo | Que no te noten | Paso ligero |
| En grupo | Depende de los aliados o los ayuda | Táctica de enjambre, Marcar el ritmo |
| Carga | Mochila y cinturón | Espalda de mula, Bolsillos extra |
| Control | Frenar, mover o trabar al rival | *(ninguna pasiva hoy: queda en la lista para las que vengan)* |

### 🏷 Marcas aparte (no son un filtro de la fila principal; se ven en la tarjeta)

- 🧬 **Racial** (Inmunidad tóxica): se justifica con la historia del personaje.
- 🐾 **Criatura** (Vuela): pensada sobre todo para invocaciones y creeps; un personaje la puede elegir justificándola con el GM.
- 🧍 **Solo personajes** (Ojo avizor): a un creep no le da nada (el GM ve todo el mapa).

### Qué pasa con las etiquetas de hoy

| Hoy | Pasa a |
|---|---|
| ofensiva | Función **Ataque** |
| defensiva | Función **Defensa** o **Aguante** o **Resistencias**, según la pasiva |
| resistencia | Función **Resistencias** |
| regeneración | Función **Aguante** (vida) o **Recursos** (SP) |
| utilidad | Se reparte: Turnos, Percepción, Sigilo, Carga, Curación, Movilidad, En grupo |
| visión · percepción | Función **Percepción** |
| movimiento | Función **Movilidad** |
| racial · criatura | Se quedan, como **marcas** |
| stat | **Se va** (ver pregunta 6): casi la mitad la tienen, así que no ayuda a encontrar nada |

Las cinco categorías del asistente de personaje nuevo se reemplazan por los mismos filtros de acá (pregunta 5), así hay un solo sistema.

---

## 3. Todas las pasivas de fábrica, con sus etiquetas propuestas

Rol: ⚔ Warrior · 🛡 Tanque · 🗡 Asalto · 🏹 Shooter · ✨ Mago · 💚 Support · 🧿 Debuffer · 🌐 Cualquiera. Estilo vacío = sirve con cualquiera.

| # | Pasiva (Job) | Qué hace | Rol | Estilo | Función | Marca |
|---|---|---|---|---|---|---|
| 1 | Inmunidad tóxica (0) | El daño tóxico no entra y no se le puede poner Veneno | 🌐 | — | Resistencias | 🧬 Racial |
| 2 | Vuela (3) | Vuela bajo: no toca el piso, pasa por encima de los tokens, −1 Evasión contra disparos | 🗡 🌐 | — | Movilidad | 🐾 Criatura |
| 3 | Robustez (1) | +5 de vida máxima | 🌐 🛡 ⚔ | — | Aguante | |
| 4 | Reserva de poder (1) | +3 SP | ✨ 💚 🧿 | 🔮 | Recursos | |
| 5 | Recuperación mental (1) | +1 SP por turno | ✨ 💚 🧿 | 🔮 | Recursos | |
| 6 | Regeneración (1) | Recupera 3 de vida por turno | 🌐 🛡 ⚔ | — | Aguante | |
| 7 | Voluntad de hierro (1) | +2 a la resistencia al crowd control | 🛡 ⚔ | — | Resistencias | |
| 8 | Percepción aumentada (1) | Dado de Percepción más alto, te avisan las trampas cercanas, sin punto ciego para el sigilo | 🏹 🗡 🌐 | — | Percepción | |
| 9 | Ojo avizor (1) | +2 al campo de visión | 🏹 🌐 | — | Percepción | 🧍 Solo personajes |
| 10 | Temple mágico (1) | +1 Res.Esp | 🛡 ✨ | — | Resistencias | |
| 11 | Golpe fuerte (1) | +1 al daño (cuerpo a cuerpo; un arco suma la mitad) | ⚔ 🗡 | 🤜 | Ataque | |
| 12 | Perforante (1) | Perfora 2: 2 puntos de cada golpe pasan siempre la Defensa | ⚔ 🗡 🏹 | 🤜 🎯 | Ataque | |
| 13 | Guardia firme (1) | +1 Bloqueo | 🛡 ⚔ | 🤜 | Defensa | |
| 14 | Espalda de mula (1) | +1 a la carga máxima | 🌐 | — | Carga | |
| 15 | Pies ligeros (1) | +1 Evasión | 🌐 🗡 🏹 | — | Defensa | |
| 16 | Prisa (1) | +5 fijo al resultado de la Iniciativa | 🌐 🗡 | — | Turnos | |
| 17 | Paso ligero (1) | No te oyen llegar por la espalda; +1 PdG más al pegar por la espalda | 🗡 | 🤜 | Sigilo, Ataque | |
| 18 | Impulso (1) | +1 No2 | 🌐 | — | Recursos | |
| 19 | Vista de halcón (1) | +1 Rango | 🏹 | 🎯 | Ataque | |
| 20 | Puntería (1) | +1 PdG | ⚔ 🗡 🏹 | 🤜 🎯 | Ataque | |
| 21 | Ojo crítico (1) | +1 Crítico frecuente | 🗡 🏹 ⚔ | 🤜 🎯 | Ataque | |
| 22 | Ojo de carancho (1) | +1 PdG y PdG.Esp contra un rival con algún estado malo | 🗡 🧿 🏹 | — | Ataque | |
| 23 | Táctica de enjambre (2) | +1 PdG por cada aliado pegado a vos al atacar | ⚔ 🗡 | 🤜 | Ataque, En grupo | |
| 24 | Aguante de trinchera (2) | +1 Defensa y +1 Defensa especial por cada enemigo pegado | 🛡 ⚔ | 🤜 | Defensa | |
| 25 | Callo de batalla (1) | +1 Res. a crítico Tipo 4 | 🛡 ⚔ 🌐 | — | Defensa | |
| 26 | Cuero duro (1) | +1 Res. a crítico Tipo 6 y Tipo 8 | 🛡 ⚔ 🌐 | — | Defensa | |
| 27 | Marcar el ritmo (1) | Al empezar la ronda, un aliado pegado sube 1 lugar en el orden | 💚 ⚔ | 🤜 | Turnos, En grupo | |
| 28 | Devolver gentileza (1) | Si ganás Parry y Bloqueo, podés contraatacar | ⚔ 🛡 | 🤜 | Ataque, Defensa | |
| 29 | Sed de sangre (1) | Si un rival cae por tu golpe, subís 2 lugares en el orden | ⚔ 🗡 | — | Turnos | |
| 30 | Sed de batalla (1) | Si un rival cae por tu golpe, ganás 3 No2 (aunque pases el máximo) | ⚔ 🗡 | — | Recursos | |
| 31 | Escurridizo (1) | Al ganar la Evasión contra un golpe cuerpo a cuerpo, das un paso sin oportunidad | 🗡 | 🤜 | Movilidad, Defensa | |
| 32 | Manos de curandero (1) | Tus curas curan +5 (a uno) o +2 (en área o por turno) | 💚 | — | Curación | |
| 33 | Mañas de sobreviviente (1) | Con la mitad de la vida o menos: +1 Res. a crítico | 🌐 🛡 ⚔ | — | Defensa | |
| 34 | Contra las cuerdas (1) | Con menos de un cuarto de la vida: +2 Res. a crítico | 🌐 🛡 ⚔ | — | Defensa | |
| 35 | Desvío hábil (1) | +1 Parry | ⚔ 🛡 🗡 | 🤜 | Defensa | |
| 36 | Maestría en armas pesadas (1) | Con Tipo 10: +2 PdG y +1 Parry | ⚔ 🛡 | 🤜 | Ataque, Defensa | |
| 37 | Maestría en armas punzantes (1) | Con Tipo 4 de mano: +1 daño, +1 PdG en oportunidad y por la espalda | 🗡 | 🤜 | Ataque | |
| 38 | Maestría en armas cortantes (1) | Con Tipo 6 de mano: +1 Parry, +1 Bloqueo, +1 PdG en contraataque | ⚔ 🗡 | 🤜 | Defensa, Ataque | |
| 39 | Maestría en hachas (1) | Con hacha: desde el 2.º ataque, 2 No2 menos; +1 Bloqueo | ⚔ | 🤜 | Ataque, Defensa | |
| 40 | Maestría en arcos (1) | Con arco: +1 PdG y +2 Crítico potente | 🏹 | 🎯 | Ataque | |
| 41 | Maestría en ballestas (1) | Con ballesta: +1 PdG y Perfora +1 | 🏹 | 🎯 | Ataque | |
| 42 | Puntería arcana (1) | +1 PdG.Esp | ✨ 🧿 | 🔮 | Ataque | |
| 43 | Potencia especial (1) | +1 Ef.Esp | ✨ 💚 🧿 | 🔮 | Ataque, Curación | |
| 44 | Mente serena (1) | +1 Res.Mt | 🌐 🛡 | — | Resistencias | |
| 45 | Largo alcance arcano (1) | +1 Rango (armas a distancia y lo especial) | ✨ 🏹 | 🎯 🔮 | Ataque | |
| 46 | Piel curtida (1) | +1 Defensa | 🛡 ⚔ 🌐 | — | Defensa | |
| 47 | Bolsillos extra (1) | +1 ranura de cinturón | 🌐 💚 | — | Carga | |

**Total: 47 pasivas.** Cómo quedan repartidas (una pasiva puede contar en varias):

- Por rol: ⚔ Warrior 23 · 🗡 Asalto 17 · 🛡 Tanque 15 · 🏹 Shooter 11 · ✨ Mago 6 · 💚 Support 6 · 🧿 Debuffer 5 · 🌐 Cualquiera 17.
- Por estilo: 🤜 Cuerpo a cuerpo 16 · 🎯 Distancia 7 · 🔮 Mágico 5 · sin estilo (cualquiera) 23.
- Por función: Ataque 18 · Defensa 14 · Resistencias 4 · Recursos 4 · Turnos 3 · Aguante 2 · Percepción 2 · Movilidad 2 · Curación 2 · En grupo 2 ·
  Carga 2 · Sigilo 1 · Control 0.

**Lo que se ve al etiquetarlas** (para que el dueño lo tenga en cuenta, no es parte del pedido):

- **Los casters tienen pocas pasivas propias** (Mago 6, Support 6, Debuffer 5, contra Warrior 23): casi todo lo que no es «Cualquiera» es de choque.
  Podría ser una lista de ideas para la próxima tanda de pasivas (SP, PdG.Esp, curas, debuffs que duran más, resistencias…).
- **Vista de halcón y Largo alcance arcano hacen lo mismo** (+1 Rango, el mismo número): una se podría fusionar o cambiar (pregunta 7).
- **No hay ninguna pasiva de Control**: la etiqueta queda para las que vengan.

---

## 4. Cómo serían los filtros en «+ Pasiva»

Boceto (la ventana de siempre de la Biblioteca, con las familias en filas):

```
 Pasiva nueva                                                         ✕
 ┌──────────────────────────────────────────────────────────────────┐
 │ 🔎 Buscar por nombre o descripción…                               │
 └──────────────────────────────────────────────────────────────────┘
 🎭 Rol      [⚔ Warrior] [🛡 Tanque✔] [🗡 Asalto] [🏹 Shooter] [✨ Mago]
             [💚 Support] [🧿 Debuffer]        ☑ sumar las de 🌐 Cualquiera
 🤺 Estilo   [🤜 Cuerpo a cuerpo✔] [🎯 Distancia] [🔮 Mágico]
 🧩 Función  [Ataque] [Defensa] [Aguante] [Resistencias] [Curación]
             [Recursos] [Movilidad] [Turnos] [Percepción] [Sigilo]
             [En grupo] [Carga] [Control]
 Mostrando 24 de 47 · ✕ Limpiar filtros

 ─────────────────────────────────────────────────────────────────────
 Aguante de trinchera · 2 Job                                [Agregar]
 +1 Defensa y +1 Defensa especial por cada enemigo pegado…
 🛡 Tanque · ⚔ Warrior · 🤜 Cuerpo a cuerpo · Defensa
 ─────────────────────────────────────────────────────────────────────
 Guardia firme · 1 Job                                       [Agregar]
 +1 Bloqueo.
 🛡 Tanque · ⚔ Warrior · 🤜 Cuerpo a cuerpo · Defensa
 ─────────────────────────────────────────────────────────────────────
 Robustez · 1 Job                                            [Agregar]
 +5 de vida máxima.
 🌐 Cualquiera · 🛡 Tanque · ⚔ Warrior · Aguante
 …
```

- **Botoncitos por familia, combinables**: dentro de una fila, cualquiera de los marcados; entre filas, todos. El buscador se suma encima.
- **«Sumar las de 🌐 Cualquiera»** viene tildado: al marcar un rol, aparecen también las que le sirven a todos. Destildado, solo las del rol.
- **Nada queda escondido para siempre**: «✕ Limpiar filtros» vuelve a mostrar las 47, y un número dice cuántas hay ocultas por el filtro.
- **Quizá, arranque con el rol ya marcado** (pregunta 4): en la ficha, el de la clase del personaje; en GM Tools, el rol del creep si lo tiene. Se
  desmarca con un clic. Es una ayuda para empezar, no un límite.
- **Lo mismo en todos lados**: la misma ventana sirve para personajes, invocaciones y creeps (ya es así), y el paso «Pasivas» del asistente de
  personaje nuevo usaría las mismas filas de botoncitos en vez de sus cinco categorías.

### Las pasivas que suben los jugadores: ¿quién les pone las etiquetas?

- **Quien la sube**, en la ventana «Guardar en la biblioteca» (ya existe): en vez de escribirlas a mano, toca los mismos botoncitos de las tres familias.
- **Con una sugerencia hecha**: según lo que suma, la ventana ya marca algunas (si suma Defensa → Defensa; PdG.Esp → Mágico y Ataque; SP → Recursos y
  Mágico…). Quien la sube las cambia si quiere.
- **El dueño las corrige al auditarla** (ya tiene el botón «✎ Etiquetas» en la Biblioteca).
- Una pasiva subida **sin etiquetas** igual aparece con «✕ Limpiar filtros» y en el buscador; no se pierde.

---

## 5. Preguntas para el dueño

1. **¿Te cierran las tres familias (Rol, Estilo, Función) y las marcas aparte?** Recomendación: sí; son pocas, se entienden solas y alcanzan para
   encontrar cualquier pasiva en dos o tres toques.
2. **Rol: ¿los siete de las clases (con Asalto = liviano y Shooter = rango), sin el Híbrido?** Recomendación: sí; el Híbrido de los creeps es
   «entre warrior y tanque», así que lo cubren esas dos etiquetas.
3. **Lo «para todos»: ¿una etiqueta 🌐 Cualquiera en Rol, y en Estilo que «sin estilo» cuente como cualquiera?** Recomendación: sí, y que «sumar las
   de Cualquiera» venga tildado: si buscás para un Mago, Robustez también te sirve y tiene que aparecer.
4. **¿Que la ventana arranque con el rol del personaje (su clase) o del creep ya marcado?** Recomendación: sí, marcado pero fácil de sacar, con el
   «Mostrando N de 47» bien visible para que nadie piense que lo demás no existe.
5. **¿El asistente de personaje nuevo deja sus cinco categorías y usa estos mismos filtros?** Recomendación: sí, un solo sistema en todos lados.
6. **¿Sacamos la etiqueta «stat»?** Recomendación: sí; la tienen 21 de 47 y no ayuda a encontrar nada. Si te gusta separar «un número fijo» de «un
   efecto con mecánica», puede volver como marca aparte, no como filtro.
7. **Vista de halcón y Largo alcance arcano dan lo mismo (+1 Rango): ¿fusionamos, o le cambiamos el efecto a una?** Recomendación: dejar Vista de
   halcón (Shooter) y que Largo alcance arcano dé algo del Mago (por ejemplo +1 al alcance solo de habilidades y varitas); si preferís, fusionarlas.
8. **¿Revisás la tabla de la sección 3 pasiva por pasiva?** Recomendación: mirala por arriba y marcá solo las que no te cierren (sobre todo los roles:
   es donde más hay criterio).
9. **Las subidas: ¿las etiqueta quien sube (con sugerencia automática) y vos corregís al auditar?** Recomendación: sí, como está la Biblioteca hoy pero
   con botoncitos en vez de texto libre (se puede seguir escribiendo una propia).

---

## 6. Para cuando se programe (nota técnica, para la conversación que lo haga)

- Las etiquetas siguen siendo la lista `etiquetas` de cada pasiva (lo que ya lee la Biblioteca); se reemplazan las de hoy por las palabras nuevas.
- Las familias van en una constante de `comun/pasivas.js` (por ejemplo `GRUPOS_PASIVA = [{nombre: '🎭 Rol', tags: [...]}, …]`) y se le pasan a
  `Biblioteca.abrir` y `Biblioteca.guardar` como `grupos` (ya lo hacen los creeps). La Biblioteca ya filtra «o» dentro de un grupo e «y» entre grupos.
- Falta en la Biblioteca: «sin etiqueta de Estilo = cualquiera» y «sumar las de Cualquiera» en Rol (hoy una pasiva sin la etiqueta no pasa el filtro);
  el rol marcado al abrir; el «Mostrando N de M» y la sugerencia automática al subir (puede salir de lo que suma, como hoy `categoriaDePasiva`).
- `categoriaDePasiva` y `CATEGORIAS_PASIVA` se retiran si se acepta la pregunta 5 (tienen pruebas en `comun/pruebas.html`: actualizarlas).
- Las copias que ya tiene cada personaje no cambian (las etiquetas solo se usan para buscar en el catálogo).

---

## Respuestas del dueño

*(Vacío: se completa en la conversación.)*


## ✅ Decisiones del dueño (2026-11-24)

- **Los tres grupos (Rol, Estilo, Función): sí.** Las **marcas aparte (racial, criatura, solo personajes) NO por ahora**: «no tenemos muy delimitadas
  esas categorías y es un asunto pendiente de diseño que llevará tiempo y dedicación» (a la cola, como diseño).
- Pocas pasivas de Mago / Support / Debuffer: **pendiente de diseño** («meterle tiempo y dedicación»), a la cola.
- 2 (Rol con las 7 clases, sin Híbrido): **sí**. 3 (Cualquiera; sin estilo = cualquiera; «sumar las de Cualquiera» tildado): **sí**.
- 4 (abrir con el rol ya marcado): **sí**, pero los personajes de los jugadores todavía no dicen en ningún lado qué clase son: eso va a la cola
  para trabajarlo más adelante (mientras tanto, solo se pre-marca donde el rol se conoce, como en los creeps).
- 5 (el asistente de personaje nuevo usa estos mismos filtros): **sí**. 6 (sacar «stat»): **sí**. 9 (las subidas las etiqueta quien sube, con
  algunas pre-marcadas; el dueño corrige al auditar): **sí**.
- 7: **por ahora queda Vista de halcón**; diseñar Largo alcance arcano, a la cola.
- 8: revisar la tabla de las 47 **en tandas de a 10**, a la cola.

## ✅ Programado (2026-11-24)

- **Las 47 de fábrica** (`comun/pasivas.js`) llevan las etiquetas de la tabla de la sección 3 (Rol, Estilo y Función), sin «stat» ni las palabras
  viejas (ofensiva, defensiva, utilidad…). **racial** (Inmunidad tóxica) y **criatura** (Vuela) quedan como estaban, como etiquetas sueltas: no son
  filtro ni se ofrecen al subir (las marcas aparte quedaron para diseñar más adelante).
- **«+ Pasiva»** (personaje, invocación y creep; la ventana de la Biblioteca): las tres filas de botoncitos, «sumar las de 🌐 Cualquiera» tildado,
  «Mostrando N de 47», «✕ Limpiar filtros» y el buscador de siempre. Cada fila muestra sus etiquetas con su rótulo.
- **Rol ya marcado**: solo en los **creeps** cuyo rol se sabe (los que salieron de la biblioteca de creeps: el rol sale de las etiquetas de esa
  entrada; el Híbrido esencial = Warrior y Tanque). Un creep armado a mano o sin origen abre sin rol. Personajes, invocaciones y el asistente de
  personaje nuevo abren sin rol marcado (P315). **Cambiado el 2026-11-27 (P315):** el asistente de personaje nuevo abre con el rol de la clase
  elegida en «Idea» ya marcado (ver abajo).
- **El asistente de personaje nuevo** dejó sus 5 categorías: usa las mismas filas (con su propio buscador); una pasiva ya elegida no se esconde.
- **Subir una pasiva** («⬆ Subir» de la ficha): las etiquetas se eligen con los mismos botoncitos, cada familia en su renglón; arrancan marcadas las
  que ya tenía (una copia de fábrica) o, si no tiene, las sugeridas por lo que suma. Se puede seguir escribiendo una propia en el campo de texto.
- **Lo ya subido sin etiquetas nuevas** (hoy solo la corrección de **Regeneración**): se ve siempre, con «🏷 sin etiquetar», con cualquier filtro;
  así nunca queda escondida. Una pasiva con etiquetas de una familia y ninguna de otra cuenta como «cualquiera» en la que le falta (P316).
- Pruebas automáticas: 5 nuevas en `comun/pruebas.html` (1075 en verde). Con clics: «+ Pasiva» en la ficha, en un creep de GM Tools (Escudero:
  Tanque marcado) y el paso Pasivas del asistente; la ventana de subir, sin subir nada. Falta con clics: la invocación y una subida real (en la cola).

### ✅ Programado (2026-11-27): P315, P316 y P358

- **P315 — el asistente de personaje nuevo marca el rol de la clase.** En el paso «Pasivas», el filtro abre con el rol de la clase elegida en
  «Idea» ya marcado (las clases se llaman como los roles: `FiltroPasivas.rolDeClase`); se saca con un clic. Si se vuelve a «Pasivas» sin cambiar la
  clase, el filtro queda como se dejó; si se cambia la clase, se cambia ese rol y los demás botoncitos quedan. «Otra» o sin clase: sin rol.
  Personajes e invocaciones fuera del asistente siguen abriendo sin rol (la ficha todavía no dice la clase).
- **P316 — «✎ Etiquetas» con botoncitos.** El «✎ Etiquetas» del dueño en la Biblioteca abre una ventana con los mismos botoncitos que «⬆ Subir»
  (en las pasivas, Rol, Estilo y Función, cada una en su renglón), arrancando con las que ya tiene marcadas; abajo, el campo de texto para las
  sueltas (racial, criatura…), que se conservan. Cancelar no cambia nada. La corrección de **Regeneración** sigue sin etiquetas: se le ponen cuando
  el dueño lo diga.
- **P358 — «✕ Limpiar filtros» deja todo como al abrir.** Desmarca los botoncitos (también el rol que venía marcado: un creep o la clase del
  asistente), vuelve a tildar «sumar las de 🌐 Cualquiera» y vacía el buscador. El botón aparece apenas hay algo que limpiar (un botoncito, «sumar…»
  destildado o algo escrito en el buscador).
- Pruebas automáticas: 4 nuevas (1167 en verde). Con clics: «+ Pasiva» de un creep (GM), el asistente (Jugador 1, sin crear el personaje) y una
  pasiva de prueba subida, re-etiquetada y borrada (GM).
