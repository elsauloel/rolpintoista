# Auditoría de trampas (arranca 2026-10-03)

Hoja de trabajo, como `rework-armas.md`: lo que hay, las preguntas, las propuestas y lo que decide el dueño. Pedido del dueño (2026-10-03):
«una auditoría de trampas: qué trampas hay; ir paso a paso definiendo una trampa común de cada tipo y en función de eso diseñar las de mejor calidad».

## Lo que hay hoy (2026-10-03)

**Cuatro lugares con trampas, sobre la misma base:**

| Dónde | Qué hay |
|---|---|
| Catálogo de trampas del mapa (`comun/trampas-base.js`) | 24 trampas, nivel 1 a 5, todas marcadas «requiere auditar». Las usa el GM desde 📚 Catálogo de trampas. |
| Trampas que se compran (`comun/catalogo.js`, consumibles con `trampaDatos`) | 72 ítems: las mismas 24 en tres tamaños (menor · normal · mayor). Generadas desde el catálogo de trampas. |
| Habilidades de creep (`comun/skills-creep-base.js`) | 21 habilidades que colocan una trampa (Trampa de púas, Cepo, Foso oculto, Mina de contacto, Campo minado, Trampa de veneno / fuego / hielo / red / runas / ácido / humo / alarma, Alambre tenso, Cepo de alma, Zarzal traicionero, Telaraña oculta, Descarga oculta, Trampa doble, Cebo, Trampa de raíces) y 5 que trabajan con trampas (Cazador de trampas, Desarmar, Rearmar, Empujar a la trampa, Ingeniero de trampas). |
| «Una trampa conocida» al armar una habilidad (`comun/elegir-trampa.js`) | 12 tipos con valores sugeridos: Púas y estacas, Cepo, Red, Veneno, Gas, Explosiva, Fuego, Hielo, Eléctrica, Pegajosa o resbaladiza, Runa (maldición), Alarma. |

**Las 24 del catálogo, por familia:**

| Familia | Trampas (nivel · daño · lo que deja) |
|---|---|
| Púas / cortes | Foso con estacas (3 · 3d6 · Sentado) · Cuchillas de guadaña (5 · 5d6 · Sangrado) · Dardos envenenados (2 · 1d6 · Veneno ×3) |
| Atrapar | Trampa de oso (2 · 2d6 · Inmovilizado) · Red de caza (1 · — · Inmovilizado) · Arena movediza (2 · — · Inmovilizado) |
| Pegajosa / resbaladiza | Brea pegajosa (1 · — · Rengo) · Aceite resbaladizo (1 · — · Sentado) |
| Gas / esporas | Nube de veneno (3 · — · Veneno ×2) · Gas somnífero (2 · — · Exhausto) · Bomba de esporas (4 · 2d6 · Veneno ×3) |
| Explosiva / derrumbe | Mina explosiva (3 · 3d6) · Barril de pólvora (4 · 4d6 · Pajaritos) · Derrumbe (4 · 4d6 · Sentado) |
| Elementales | Llamarada (2 · 2d6 · Quemadura) · Trampa de escarcha (3 · 2d6 · Escarcha) · Descarga eléctrica (3 · 3d6 · Stun 1 turno) |
| Runas / mágicas | Runa de silencio (3) · Runa de debilidad (2) · Niebla de confusión (3) · Succión arcana (3) · Espejo de discordia (4 · Pajaritos) · Portal cósmico (5 · Pajaritos) |
| Otras | Cable de alarma (1) · Trampa de teleport |

## Diagnóstico

1. **El tamaño y la calidad están mezclados.** Las compradas vienen en menor / normal / mayor, y el tier (Común, Buena, Rara) sale de eso, no de un
   criterio de calidad. Una Trampa de oso «mayor» ocupa una flor de radio 3: un cepo que agarra a 19 casillas.
2. **El daño es siempre en d6** (1d6 por nivel) y la dificultad para evitarla es «6 + 2 por nivel»: no hay identidad por familia.
3. **Mucho a mano todavía:** Runa de silencio, Runa de debilidad, Confusión, Succión arcana, Espejo de discordia, liberarse de un cepo o de la red,
   la alarma.
4. **Tres listas de familias que no coinciden** (el catálogo, los 12 tipos del menú y las habilidades de creep).
5. **Todo dice «requiere auditar».**

## Propuesta de método (paso a paso, como las armas)

1. **Familias:** acordar qué tipos de trampa existen y qué es lo propio de cada uno (qué deja, si hace daño, qué stat la evita, qué tamaño tiene).
2. **Una Común por familia:** la trampa de referencia de cada tipo.
3. **Mejor calidad:** a partir de la Común, qué sube en Buena y Rara (daño, efecto, dificultad para evitarla o detectarla, área, duración).
4. Recién ahí: regenerar las compradas, el catálogo del mapa y los valores del menú de habilidades desde la misma definición.

**Alcance (dueño, 2026-10-03): por ahora se auditan solamente las trampas del catálogo, las que se compran.** Esas son la base para todo lo demás
(catálogo del mapa, habilidades de creep, menú «trampa conocida»), que se arma después desde ellas.

**Respuestas del dueño (2026-10-03):**
- Las **10 familias** ✅ (Púas y cortes · Atrapar · Pegajosa/resbaladiza · Veneno · Gas · Explosiva/derrumbe · Elementales · Runas · Portal · Alarma).
- **Tamaño:** una casilla, o una flor de radio 1 (7 casillas) como máximo; más grande «es mucho». En línea sí: **línea de 3 o de 4**.
- **Trampa nueva: el muro.** Al dispararse se levanta una pared impenetrable, para tener que rodear. *(Hay que construir la mecánica: hoy una
  trampa puede dejar una zona al dispararse, pero no una pared.)*

**Trampa de muro (dueño, 2026-10-03): delante del que la pisó, 4 turnos, familia propia (🧱 Muro).** Construida y probada en vivo en «Claude ·
pruebas»: la Bruja bajó a la trampa y la pared (3 casillas: el frente y las dos diagonales de adelante) se levantó sólida y fijada, por 4 turnos.
Va dentro del JSON de `trampaEstado` (`muro: {largo: 3 | 5, turnos}`), sin reglas nuevas. Familias: ahora 11.

**Superficie de disparo y superficie de efecto (dueño, 2026-10-03: «no siempre van a ser la misma»)** ✅ en principio.
- **Disparo** (dónde hay que pisar): una casilla · flor de radio 1 (7 casillas) · línea de 3 o 4.
- **Efecto** (a quién le pasa): solo a quien la pisó · a todos los que estén sobre la trampa · una flor alrededor del punto pisado (**radio 1, o 2
  en alguna**) · delante de quien la pisó (el muro) · una zona que queda · a otro lugar (teleport, portal).
- **Regla general: lo que es de área tiene fuego amigo** (alcanza a los aliados). Lo que salta de enemigo en enemigo (el rayo en cadena) no es de
  área. Los aliados igual nunca disparan una trampa.
- En el juego: `efecto: {area: 'pisador' | 'trampa' | 'flor', radio}` adentro del JSON de `trampaEstado` (`TokensAuto.efectoNorm`); el mapa decide a
  quién le llega con eso (`trampaAfectados`, js/08). Sin `efecto`: una casilla = quien la pisó; más grande = toda la trampa. Reemplaza al criterio
  del 2026-09-25 (lo mágico distinguía aliados).

**Trampas sin disparar al final del combate (regla del dueño, 2026-10-03; reemplaza «vuelven a tu inventario»):** al cerrar el botín, cada
trampa consumible que no se disparó se desarma y tiene **50 % de romperse**; las que aguantan vuelven a la mochila (o al cinturón) de su dueño. La
línea verde de la Mesa dice cuántas volvieron y cuáles se rompieron (`TokensAuto.desarmarTrampasConsumibles`, `ROMPE_AL_DESARMAR`).

### 🗡 Púas y cortes — definición ✅ y Común ✅ (dueño, 2026-10-03)
- **Identidad:** daño físico (se resta la Defensa); lo propio: Sentado (caer), Sangrado (cortes), Rengo (pincharse el pie). Se evita con Evasión.
- **Disparo:** una casilla · flor de 7 · línea (la línea **puede ser más larga que 4**: se ve caso por caso).
- **Efecto:** el foso, solo a quien lo pisó; el piso de púas y las cuchillas, a todos los que estén encima.
- **La Común (referencia de la familia): Foso con estacas** — disparo 1 casilla · efecto solo quien lo pisa · 2d6 de daño (menos su Defensa) ·
  queda Sentado · **Evasión 7** evita caer (recibe el daño, no queda Sentado) · detectarla: 8 · **30**. (El dueño corrigió 6 → 7.)

**Esquivar vs. resistir (dueño, 2026-10-04): «la mayoría de las trampas no se esquivarían, pero muchas podrán resistir su efecto».** Una trampa
pisada te agarra: el daño entra siempre. Lo que se tira (si se tira algo) es para **resistir lo que deja** (`salva.que = 'efecto'`). Esquivarla
entera (Evasión, `que = 'todo'`) queda como excepción. Propuesta de qué stat resiste cada efecto (a confirmar, 2026-10-04):

| Lo que deja | Se resiste con |
|---|---|
| Sentado, Inmovilizado, Rengo, Stun, Pajaritos (quedar trabado o aturdido) | Res.CC |
| Veneno, Sangrado, Quemadura, Escarcha (el cuerpo lo aguanta) | Constitución |
| Sueño, confusión, discordia (la cabeza) | Res.Mt |
| Maldiciones de runa, succión arcana, teleport | Res.Esp |

Se sigue tipo por tipo; cada Común se revisa con esta regla (el Foso con estacas tenía «Evasión 7 evita caer»).
